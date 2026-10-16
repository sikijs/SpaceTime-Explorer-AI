import { describe, it, expect } from 'vitest'
import { angleFromAhead, labAngleOf, rainRuleSidewaysAngle, rayAsMeasuredByTraveler, runSky, travelerAngleOf, wedgeCounts } from './aberration'

// Tests for Experiment 7 (docs/experiments/spacetime-geometry/07-aberration.md, "Required Physics Tests"). The numbers in the tables
// of the specification are written out here by hand, so a wrong formula in the module cannot make a test pass.

const SPEEDS = [0.3, 0.6, 0.9, 0.99]
const LAB_ANGLES = [0, 15, 30, 45, 60, 75, 90, 105, 120, 135, 150, 165, 180]
const degrees = (radians: number) => (radians * 180) / Math.PI
const radians = (deg: number) => (deg * Math.PI) / 180

// The closed form cos θ' = (cos θ + β) ÷ (1 + β cos θ), written independently of the module (it uses acos, the module uses atan2).
function closedForm(angle: number, speed: number): number {
  return degrees(Math.acos((Math.cos(radians(angle)) + speed) / (1 + speed * Math.cos(radians(angle)))))
}

describe('speed 0 changes nothing (test 1)', () => {
  it('returns the lab angle for every angle, on both sides of the line of travel', () => {
    for (const angle of [...LAB_ANGLES, 195, 210, 270, 300, 345]) {
      expect(travelerAngleOf(angle, 0)).toBeCloseTo(angle, 9)
    }
  })
})

describe('the two routes to the same angle (test 2)', () => {
  it('the closed form agrees with the energy-and-momentum route for several angles and speeds', () => {
    for (const speed of SPEEDS) {
      for (const angle of LAB_ANGLES) {
        const viaFormula = travelerAngleOf(angle, speed)
        const viaMomentum = rayAsMeasuredByTraveler(angle, speed).starAngle
        expect(viaMomentum).toBeCloseTo(viaFormula, 7)
        expect(viaFormula).toBeCloseTo(closedForm(angle, speed), 7)
      }
    }
  })

  it('the ray keeps its momentum across the line of travel and has momentum equal to energy', () => {
    for (const speed of SPEEDS) {
      const ray = rayAsMeasuredByTraveler(60, speed)
      expect(ray.momentumAcrossTravelTimesC).toBeCloseTo(-Math.sin(radians(60)), 12)
      // a pulse of light: E = p × c for every observer
      expect(Math.hypot(ray.momentumAlongTravelTimesC, ray.momentumAcrossTravelTimesC)).toBeCloseTo(ray.energy, 9)
    }
  })
})

describe('straight ahead and straight behind do not move (test 3)', () => {
  it('stay at 0 and 180 degrees at every speed', () => {
    for (const speed of SPEEDS) {
      expect(travelerAngleOf(0, speed)).toBe(0)
      expect(travelerAngleOf(180, speed)).toBe(180)
    }
  })
})

describe('every other star moves toward the front, and the order is kept (test 4)', () => {
  it('θ is smaller for the traveler than for the lab, for 0 < θ < 180', () => {
    for (const speed of SPEEDS) {
      for (const angle of LAB_ANGLES.filter((a) => a > 0 && a < 180)) {
        expect(travelerAngleOf(angle, speed)).toBeLessThan(angle)
      }
    }
  })

  it('the traveler angle rises steadily as the lab angle rises', () => {
    for (const speed of SPEEDS) {
      let previous = -1
      for (let angle = 0; angle <= 180; angle += 5) {
        const current = travelerAngleOf(angle, speed)
        expect(current).toBeGreaterThan(previous)
        previous = current
      }
    }
  })

  it('a faster traveler moves a star further forward', () => {
    for (const angle of [30, 60, 90, 120, 150]) {
      const angles = SPEEDS.map((speed) => travelerAngleOf(angle, speed))
      for (let i = 1; i < angles.length; i += 1) expect(angles[i]).toBeLessThan(angles[i - 1])
    }
  })
})

describe('the star the lab sees sideways (test 5)', () => {
  it('is seen at arccos β: 72.5, 53.1, 25.8 and 8.1 degrees', () => {
    expect(travelerAngleOf(90, 0.3)).toBeCloseTo(72.5424, 3)
    expect(travelerAngleOf(90, 0.6)).toBeCloseTo(53.1301, 3)
    expect(travelerAngleOf(90, 0.9)).toBeCloseTo(25.8419, 3)
    expect(travelerAngleOf(90, 0.99)).toBeCloseTo(8.1096, 3)
  })

  it('equals degrees(acos(β)) at every speed', () => {
    for (const speed of SPEEDS) expect(travelerAngleOf(90, speed)).toBeCloseTo(degrees(Math.acos(speed)), 9)
  })
})

describe("the specification's table of traveler angles (test 6)", () => {
  // rows: lab angle; columns: β = 0.3, 0.6, 0.9, 0.99 (degrees), written out by hand from the specification
  const TABLE: Record<number, number[]> = {
    0: [0.0, 0.0, 0.0, 0.0],
    30: [22.2, 15.3, 7.0, 2.2],
    60: [45.9, 32.2, 15.1, 4.7],
    90: [72.5, 53.1, 25.8, 8.1],
    120: [103.6, 81.8, 43.3, 14.0],
    150: [139.9, 123.6, 81.1, 29.6],
    180: [180.0, 180.0, 180.0, 180.0],
  }

  it('matches to a tenth of a degree', () => {
    for (const [angle, expected] of Object.entries(TABLE)) {
      SPEEDS.forEach((speed, i) => {
        expect(Math.abs(travelerAngleOf(Number(angle), speed) - expected[i])).toBeLessThan(0.051)
      })
    }
  })

  it("matches the specification's worked example: β = 0.6, θ = 150 gives 123.6 degrees (a move of 26.4)", () => {
    expect(travelerAngleOf(150, 0.6)).toBeCloseTo(123.6, 1)
    expect(150 - travelerAngleOf(150, 0.6)).toBeCloseTo(26.4, 1)
  })
})

describe('round trip (test 7)', () => {
  it('labAngleOf undoes travelerAngleOf', () => {
    for (const speed of SPEEDS) {
      for (const angle of [...LAB_ANGLES, 195, 240, 300, 345]) {
        expect(labAngleOf(travelerAngleOf(angle, speed), speed)).toBeCloseTo(angle === 360 ? 0 : angle, 7)
      }
    }
  })
})

describe('symmetry about the line of travel (test 8)', () => {
  it('a star below the line is the mirror image of the one above', () => {
    for (const speed of SPEEDS) {
      for (const angle of [15, 45, 90, 135, 165]) {
        expect(travelerAngleOf(360 - angle, speed)).toBeCloseTo(360 - travelerAngleOf(angle, speed), 9)
      }
    }
  })
})

describe('the ring of 24 stars (test 9)', () => {
  it('the lab sees 11 ahead of sideways, 5 within 30 degrees of ahead and 5 within 30 degrees of behind', () => {
    const sky = runSky(0.3)
    expect(sky.stars).toHaveLength(24)
    expect(sky.countsLab).toEqual({ aheadOfSideways: 11, within30OfAhead: 5, within30OfBehind: 5 })
  })

  it("the traveler's counts match the specification's second table", () => {
    // [β, ahead of sideways, within 30 of ahead, within 30 of behind]
    const EXPECTED: [number, number, number, number][] = [
      [0.3, 15, 5, 3],
      [0.6, 17, 7, 3],
      [0.9, 21, 13, 1],
      [0.99, 23, 21, 1],
    ]
    for (const [speed, ahead, front, back] of EXPECTED) {
      expect(runSky(speed).countsTraveler).toEqual({ aheadOfSideways: ahead, within30OfAhead: front, within30OfBehind: back })
    }
  })

  it('at speed 0 the two skies are the same', () => {
    const sky = runSky(0)
    expect(sky.countsTraveler).toEqual(sky.countsLab)
    for (const star of sky.stars) expect(star.travelerAngle).toBeCloseTo(star.labAngle, 9)
  })

  it('the stars are 15 degrees apart in the lab, starting straight ahead, and a ring of 12 is 30 degrees apart', () => {
    expect(runSky(0.6).stars.map((s) => s.labAngle).slice(0, 4)).toEqual([0, 15, 30, 45])
    expect(runSky(0.6, 12).stars.map((s) => s.labAngle).slice(0, 4)).toEqual([0, 30, 60, 90])
  })

  it('the wedge counts treat stars exactly at 90, 30 and 150 degrees as the specification does', () => {
    expect(wedgeCounts([90, 270])).toEqual({ aheadOfSideways: 0, within30OfAhead: 0, within30OfBehind: 0 })
    expect(wedgeCounts([30, 330])).toEqual({ aheadOfSideways: 2, within30OfAhead: 2, within30OfBehind: 0 })
    expect(wedgeCounts([150, 210])).toEqual({ aheadOfSideways: 0, within30OfAhead: 0, within30OfBehind: 2 })
    expect(angleFromAhead(345)).toBeCloseTo(15, 9)
  })
})

describe('the lab angle that the traveler sees sideways (test 10)', () => {
  it('is arccos(−β): 107.5, 126.9, 154.2 and 171.9 degrees', () => {
    expect(runSky(0.3).labAngleSeenAsSideways).toBeCloseTo(107.4576, 3)
    expect(runSky(0.6).labAngleSeenAsSideways).toBeCloseTo(126.8699, 3)
    expect(runSky(0.9).labAngleSeenAsSideways).toBeCloseTo(154.1581, 3)
    expect(runSky(0.99).labAngleSeenAsSideways).toBeCloseTo(171.8904, 3)
    for (const speed of SPEEDS) expect(runSky(speed).labAngleSeenAsSideways).toBeCloseTo(degrees(Math.acos(-speed)), 9)
  })

  it('and the traveler then sees it at exactly 90 degrees', () => {
    for (const speed of SPEEDS) expect(travelerAngleOf(runSky(speed).labAngleSeenAsSideways, speed)).toBeCloseTo(90, 7)
  })
})

describe('the transformed ray is a consistent ray (test 11)', () => {
  it('sin² θ′ + cos² θ′ = 1 and the energy is positive for every angle and speed offered', () => {
    for (const speed of SPEEDS) {
      for (let angle = 0; angle < 360; angle += 7.5) {
        const ray = rayAsMeasuredByTraveler(angle, speed)
        expect(ray.energy).toBeGreaterThan(0)
        const cos = -ray.momentumAlongTravelTimesC / ray.energy
        const sin = -ray.momentumAcrossTravelTimesC / ray.energy
        expect(cos * cos + sin * sin).toBeCloseTo(1, 9)
      }
    }
  })

  it('the light energy ratio is (1 + β cos θ) ÷ D, as the specification says (shown in Experiment 8, not here)', () => {
    const speed = 0.6
    expect(rayAsMeasuredByTraveler(0, speed).energy).toBeCloseTo(2, 9)
    expect(rayAsMeasuredByTraveler(90, speed).energy).toBeCloseTo(1.25, 9)
    expect(rayAsMeasuredByTraveler(180, speed).energy).toBeCloseTo(0.5, 9)
  })
})

describe('out-of-range input (test 12)', () => {
  it('throws a RangeError for a speed below 0 or at or above c', () => {
    for (const speed of [-0.1, 1, 1.2, NaN, Infinity]) {
      expect(() => travelerAngleOf(90, speed)).toThrow(RangeError)
      expect(() => labAngleOf(90, speed)).toThrow(RangeError)
      expect(() => runSky(speed)).toThrow(RangeError)
      expect(() => rayAsMeasuredByTraveler(90, speed)).toThrow(RangeError)
    }
  })

  it('throws a RangeError for a star count below 1 or not a whole number, and for an angle that is not a number', () => {
    for (const count of [0, -3, 2.5, NaN]) expect(() => runSky(0.6, count)).toThrow(RangeError)
    expect(() => travelerAngleOf(NaN, 0.6)).toThrow(RangeError)
  })
})

describe('the everyday rain comparison (test 13)', () => {
  it('gives 73.3, 59.0, 48.0 and 45.3 degrees', () => {
    expect(rainRuleSidewaysAngle(0.3)).toBeCloseTo(73.3, 1)
    expect(rainRuleSidewaysAngle(0.6)).toBeCloseTo(59.0, 1)
    expect(rainRuleSidewaysAngle(0.9)).toBeCloseTo(48.0, 1)
    expect(rainRuleSidewaysAngle(0.99)).toBeCloseTo(45.3, 1)
  })

  it('agrees with the real answer within a degree at 0.3c and not at 0.9c', () => {
    expect(Math.abs(rainRuleSidewaysAngle(0.3) - travelerAngleOf(90, 0.3))).toBeLessThan(1)
    expect(Math.abs(rainRuleSidewaysAngle(0.9) - travelerAngleOf(90, 0.9))).toBeGreaterThan(20)
  })
})
