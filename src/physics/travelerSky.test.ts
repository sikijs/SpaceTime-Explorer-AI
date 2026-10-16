import { describe, it, expect } from 'vitest'
import { brightnessFactorFromTravelerAngle, brightnessFactorOf, everydayBrightnessFactorOf, runTravelerSky } from './travelerSky'
import { frequencyFactorOf, labCrossingAngle, runDoppler } from './dopplerShift'
import { rayAsMeasuredByTraveler, travelerAngleOf } from './aberration'

// Tests for Experiment 9 (docs/experiments/spacetime-geometry/09-the-travelers-whole-sky.md, "Required Physics Tests"). The numbers in the
// specification's table are written out here by hand, so a wrong formula in the module cannot make a test pass.

const SPEEDS = [0.3, 0.6, 0.9, 0.99]
const LAB_ANGLES = [0, 15, 30, 45, 60, 75, 90, 105, 120, 135, 150, 165, 180]
const dilation = (speed: number) => Math.sqrt(1 - speed * speed)

describe('speed 0 changes nothing (test 1)', () => {
  it('has factor 1 at every angle, on both sides of the line of travel', () => {
    for (const angle of [...LAB_ANGLES, 195, 270, 345]) {
      expect(brightnessFactorOf(angle, 0)).toBe(1)
      expect(everydayBrightnessFactorOf(angle, 0)).toBe(1)
    }
  })
})

describe('the brightness factor is the square of the color factor (test 2)', () => {
  it('equals frequencyFactorOf squared at several angles and speeds', () => {
    for (const speed of SPEEDS) {
      for (const angle of LAB_ANGLES) {
        expect(brightnessFactorOf(angle, speed)).toBeCloseTo(frequencyFactorOf(angle, speed) ** 2, 9)
      }
    }
  })
})

describe('the other routes to the same factor (tests 3 and 4)', () => {
  it('the lab-angle form equals the traveler-angle form for the same star', () => {
    for (const speed of SPEEDS) {
      for (const angle of LAB_ANGLES) {
        const viaTraveler = brightnessFactorFromTravelerAngle(travelerAngleOf(angle, speed), speed)
        expect(viaTraveler).toBeCloseTo(brightnessFactorOf(angle, speed), 6)
      }
    }
  })

  it('equals the square of the energy of the ray as the traveler measures it (Experiment 5)', () => {
    for (const speed of SPEEDS) {
      for (const angle of LAB_ANGLES) {
        expect(rayAsMeasuredByTraveler(angle, speed).energy ** 2).toBeCloseTo(brightnessFactorOf(angle, speed), 8)
      }
    }
  })
})

describe('straight ahead and straight behind (test 5)', () => {
  it('has (1 + β) ÷ (1 − β) straight ahead and (1 − β) ÷ (1 + β) straight behind, as in the specification table', () => {
    const ahead = [1.857, 4.0, 19.0, 199.0]
    const behind = [0.538, 0.25, 0.053, 0.005]
    SPEEDS.forEach((speed, i) => {
      expect(brightnessFactorOf(0, speed)).toBeCloseTo(ahead[i], 3)
      expect(brightnessFactorOf(180, speed)).toBeCloseTo(behind[i], 3)
      expect(brightnessFactorOf(0, speed)).toBeCloseTo((1 + speed) / (1 - speed), 9)
      expect(brightnessFactorOf(180, speed)).toBeCloseTo((1 - speed) / (1 + speed), 9)
    })
  })
})

describe('the star the lab sees sideways (test 6)', () => {
  it('has the factor 1 ÷ D², and the everyday factor is exactly 1', () => {
    const expected = [1.099, 1.563, 5.263, 50.251]
    SPEEDS.forEach((speed, i) => {
      expect(brightnessFactorOf(90, speed)).toBeCloseTo(expected[i], 3)
      expect(brightnessFactorOf(90, speed)).toBeCloseTo(1 / dilation(speed) ** 2, 9)
      expect(everydayBrightnessFactorOf(90, speed)).toBe(1)
    })
  })
})

describe('the factor falls from straight ahead to straight behind (test 7)', () => {
  it('falls steadily as the angle rises from 0 to 180 degrees, at every speed above 0', () => {
    for (const speed of SPEEDS) {
      let previous = Infinity
      for (const angle of LAB_ANGLES) {
        const factor = brightnessFactorOf(angle, speed)
        expect(factor).toBeLessThan(previous)
        previous = factor
      }
    }
  })
})

describe('the specification table (test 8)', () => {
  const angles = [0, 30, 60, 90, 120, 150, 180]
  const table: Record<number, number[]> = {
    0.3: [1.857, 1.744, 1.453, 1.099, 0.794, 0.602, 0.538],
    0.6: [4.0, 3.608, 2.641, 1.563, 0.766, 0.361, 0.25],
    0.9: [19.0, 16.665, 11.066, 5.263, 1.592, 0.256, 0.053],
    0.99: [199.0, 173.357, 112.313, 50.251, 12.815, 1.022, 0.005],
  }
  it('matches the table to the digits written there', () => {
    for (const speed of SPEEDS) {
      angles.forEach((angle, i) => {
        const factor = brightnessFactorOf(angle, speed)
        // The table gives three decimals, except the last digits of the largest values, so compare to a relative tolerance.
        expect(Math.abs(factor - table[speed][i]) / table[speed][i]).toBeLessThan(0.01)
      })
    }
  })
})

describe('counts and the crossing line (test 9)', () => {
  it('has 13/11, 15/9, 17/7 and 21/3 stars brighter/dimmer, the same as the blueshifted and redshifted counts of Experiment 8', () => {
    const expected: [number, number][] = [
      [13, 11],
      [15, 9],
      [17, 7],
      [21, 3],
    ]
    SPEEDS.forEach((speed, i) => {
      const sky = runTravelerSky(speed)
      expect(sky.stars).toHaveLength(24)
      expect([sky.brighterCount, sky.dimmerCount]).toEqual(expected[i])
      expect(sky.brighterCount).toBe(sky.towardBlueCount)
      expect(sky.dimmerCount).toBe(sky.towardRedCount)
    })
  })

  it('is exactly 1 at the crossing angle of Experiment 8', () => {
    for (const speed of SPEEDS) {
      const crossing = labCrossingAngle(speed) as number
      expect(brightnessFactorOf(crossing, speed)).toBeCloseTo(1, 9)
      expect(runTravelerSky(speed).labCrossingAngle).toBeCloseTo(crossing, 9)
    }
  })

  it('has every star at factor 1 for the lab (speed 0)', () => {
    const sky = runTravelerSky(0)
    for (const star of sky.stars) expect(star.brightnessFactor).toBe(1)
    expect(sky.brighterCount).toBe(0)
    expect(sky.dimmerCount).toBe(0)
  })
})

describe('relativistic factor against the everyday one (test 10)', () => {
  it('is the everyday factor divided by D², at every angle and speed', () => {
    for (const speed of SPEEDS) {
      for (const angle of LAB_ANGLES) {
        expect(brightnessFactorOf(angle, speed)).toBeCloseTo(everydayBrightnessFactorOf(angle, speed) / dilation(speed) ** 2, 8)
      }
    }
  })

  it('has the everyday factor (1 + β cos θ)² written out by hand', () => {
    expect(everydayBrightnessFactorOf(0, 0.6)).toBeCloseTo(2.56, 9)
    expect(everydayBrightnessFactorOf(180, 0.6)).toBeCloseTo(0.16, 9)
    expect(everydayBrightnessFactorOf(60, 0.6)).toBeCloseTo(1.69, 9)
  })
})

describe('brighter exactly when bluer (test 11)', () => {
  it('has a factor above 1 for the brightness exactly where the color factor is above 1, and below 1 exactly where it is below 1', () => {
    for (const speed of SPEEDS) {
      const sky = runTravelerSky(speed)
      const doppler = runDoppler(speed)
      sky.stars.forEach((star, i) => {
        const color = doppler.stars[i].factor
        expect(star.brightnessFactor > 1).toBe(color > 1)
        expect(star.brightnessFactor < 1).toBe(color < 1)
        expect(star.brightnessFactor).toBeCloseTo(color * color, 9)
        expect(star.labAngle).toBe(doppler.stars[i].labAngle)
        expect(star.wavelengthNm).toBe(doppler.stars[i].wavelengthNm)
      })
    }
  })
})

describe('symmetry about the line of travel (test 12)', () => {
  it('gives the same factor at θ and 360° − θ', () => {
    for (const speed of SPEEDS) {
      for (const angle of [15, 30, 60, 90, 120, 150, 165]) {
        expect(brightnessFactorOf(360 - angle, speed)).toBeCloseTo(brightnessFactorOf(angle, speed), 12)
      }
    }
  })
})

describe('out-of-range input (test 13)', () => {
  it('throws RangeError for a speed below 0 or at or above 1, and for a non-finite angle', () => {
    expect(() => brightnessFactorOf(0, -0.1)).toThrow(RangeError)
    expect(() => brightnessFactorOf(0, 1)).toThrow(RangeError)
    expect(() => brightnessFactorOf(0, 1.5)).toThrow(RangeError)
    expect(() => brightnessFactorOf(Number.NaN, 0.5)).toThrow(RangeError)
    expect(() => brightnessFactorOf(Number.POSITIVE_INFINITY, 0.5)).toThrow(RangeError)
    expect(() => brightnessFactorFromTravelerAngle(0, 1)).toThrow(RangeError)
    expect(() => everydayBrightnessFactorOf(0, -1)).toThrow(RangeError)
    expect(() => runTravelerSky(1)).toThrow(RangeError)
  })
})
