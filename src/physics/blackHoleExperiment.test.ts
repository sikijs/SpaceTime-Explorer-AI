import { describe, expect, it } from 'vitest'
import {
  evaluateBlackHole,
  runRadialLightSpeedLaunch,
  SPEED_OF_LIGHT,
} from './blackHoleExperiment'

describe('evaluateBlackHole', () => {
  it('has escapeSpeedFractionOfC of 1 exactly at the threshold mass, and toggles isInsideHorizon around it', () => {
    const distance = 1
    const thresholdGm = (SPEED_OF_LIGHT ** 2 * distance) / 2

    const atThreshold = evaluateBlackHole(thresholdGm, distance)
    expect(atThreshold.escapeSpeedFractionOfC).toBeCloseTo(1, 9)

    const below = evaluateBlackHole(thresholdGm * 0.9, distance)
    expect(below.isInsideHorizon).toBe(false)

    const above = evaluateBlackHole(thresholdGm * 1.1, distance)
    expect(above.isInsideHorizon).toBe(true)
  })

  it('increases escapeSpeedFractionOfC as gravitationalParameter increases, distance fixed', () => {
    const distance = 1
    const values = [0.5, 1, 2, 4, 8].map(
      (gm) => evaluateBlackHole(gm, distance).escapeSpeedFractionOfC
    )
    for (let i = 1; i < values.length; i++) {
      expect(values[i]).toBeGreaterThan(values[i - 1])
    }
  })

  it('increases eventHorizonRadius as gravitationalParameter increases', () => {
    const values = [0.5, 1, 2, 4, 8].map((gm) => evaluateBlackHole(gm, 1).eventHorizonRadius)
    for (let i = 1; i < values.length; i++) {
      expect(values[i]).toBeGreaterThan(values[i - 1])
    }
  })

  it('matches the closed-form event horizon formula', () => {
    for (const gm of [0.5, 1, 2, 4, 8]) {
      const result = evaluateBlackHole(gm, 1)
      expect(result.eventHorizonRadius).toBeCloseTo((2 * gm) / SPEED_OF_LIGHT ** 2, 9)
    }
  })

  it('matches Experiment 6\'s escape speed formula', () => {
    const cases: [number, number][] = [
      [1, 1],
      [4, 1],
      [1, 2],
      [9, 3],
    ]
    for (const [gm, distance] of cases) {
      const result = evaluateBlackHole(gm, distance)
      expect(result.escapeSpeed).toBeCloseTo(Math.sqrt((2 * gm) / distance), 9)
    }
  })

  it('is inside the horizon exactly when distance <= eventHorizonRadius', () => {
    const cases: [number, number][] = [
      [0.5, 1],
      [1, 1],
      [2, 1],
      [1, 5],
      [10, 0.5],
    ]
    for (const [gm, distance] of cases) {
      const result = evaluateBlackHole(gm, distance)
      expect(result.isInsideHorizon).toBe(distance <= result.eventHorizonRadius)
      expect(result.isInsideHorizon).toBe(result.escapeSpeedFractionOfC >= 1)
    }
  })

  it('throws for invalid inputs', () => {
    expect(() => evaluateBlackHole(0, 1)).toThrow(RangeError)
    expect(() => evaluateBlackHole(-1, 1)).toThrow(RangeError)
    expect(() => evaluateBlackHole(1, 0)).toThrow(RangeError)
    expect(() => evaluateBlackHole(1, -1)).toThrow(RangeError)
  })
})

describe('runRadialLightSpeedLaunch', () => {
  it('agrees with evaluateBlackHole\'s isInsideHorizon for several cases', () => {
    const distance = 1
    const cases = [0.1, 0.5, 1, 5, 10]
    for (const gm of cases) {
      const evaluation = evaluateBlackHole(gm, distance)
      const launch = runRadialLightSpeedLaunch(gm, distance)
      expect(launch.outcome).toBe(evaluation.isInsideHorizon ? 'falls-back' : 'escapes')
    }
  })

  it('rises then falls back to the start distance in the falls-back case', () => {
    const distance = 1
    const gm = (SPEED_OF_LIGHT ** 2 * distance) / 2 / 0.5 // well inside the horizon
    const result = runRadialLightSpeedLaunch(gm, distance)

    expect(result.outcome).toBe('falls-back')

    let maxDistance = -Infinity
    let maxIndex = -1
    result.trajectory.forEach((point, index) => {
      if (point.distance > maxDistance) {
        maxDistance = point.distance
        maxIndex = index
      }
    })

    expect(maxDistance).toBeGreaterThan(distance)
    expect(maxIndex).toBeGreaterThan(0)
    expect(maxIndex).toBeLessThan(result.trajectory.length - 1)

    // Strictly rising before the peak, strictly falling after it.
    for (let i = 1; i <= maxIndex; i++) {
      expect(result.trajectory[i].distance).toBeGreaterThan(result.trajectory[i - 1].distance)
    }
    for (let i = maxIndex + 1; i < result.trajectory.length; i++) {
      expect(result.trajectory[i].distance).toBeLessThan(result.trajectory[i - 1].distance)
    }

    const last = result.trajectory[result.trajectory.length - 1]
    expect(last.distance).toBeLessThanOrEqual(distance)
  })

  it('is still increasing at the last recorded point in the escapes case', () => {
    const distance = 1
    const gm = (SPEED_OF_LIGHT ** 2 * distance) / 2 / 2 // well outside the horizon
    const result = runRadialLightSpeedLaunch(gm, distance)

    expect(result.outcome).toBe('escapes')
    const last = result.trajectory[result.trajectory.length - 1]
    const secondLast = result.trajectory[result.trajectory.length - 2]
    expect(last.distance).toBeGreaterThan(secondLast.distance)
  })

  it('is deterministic across repeated calls for the same inputs', () => {
    const a = runRadialLightSpeedLaunch(1, 1)
    const b = runRadialLightSpeedLaunch(1, 1)

    expect(a.outcome).toBe(b.outcome)
    expect(a.trajectory.length).toBe(b.trajectory.length)
    for (let i = 0; i < a.trajectory.length; i++) {
      expect(a.trajectory[i]).toEqual(b.trajectory[i])
    }
  })

  it('throws for invalid inputs', () => {
    expect(() => runRadialLightSpeedLaunch(0, 1)).toThrow(RangeError)
    expect(() => runRadialLightSpeedLaunch(-1, 1)).toThrow(RangeError)
    expect(() => runRadialLightSpeedLaunch(1, 0)).toThrow(RangeError)
    expect(() => runRadialLightSpeedLaunch(1, -1)).toThrow(RangeError)
  })
})

import {
  checkUp,
  escapeSpeedSweep,
  GUESS_MARK_HEIGHTS,
  guessMarkers,
  launchSummary,
  outcomeForMass,
  partOneOutcomes,
  PART_ONE_MASSES,
  realSchwarzschildRadiusMeters,
  sizeLadder,
  SOLAR_MASS_KG,
  specialMass,
  tutorMarking,
} from './blackHoleExperiment'

describe('audit update: graph, markers and marking', () => {
  it('specialMass is where the escape speed equals light speed (2 with distance 1 and c = 2)', () => {
    expect(specialMass()).toBe(2)
    expect(evaluateBlackHole(specialMass(), 1).escapeSpeedFractionOfC).toBeCloseTo(1, 12)
  })

  it('the sweep rises with mass and crosses 100 percent exactly at the special mass', () => {
    const sweep = escapeSpeedSweep(0.1)
    expect(sweep[0].mass).toBeCloseTo(0.2, 12)
    expect(sweep[sweep.length - 1].mass).toBeCloseTo(6, 9)
    for (let i = 1; i < sweep.length; i++) {
      expect(sweep[i].escapeSpeedFractionOfC).toBeGreaterThan(sweep[i - 1].escapeSpeedFractionOfC)
    }
    const below = sweep.filter((p) => p.mass < specialMass() - 1e-9)
    const above = sweep.filter((p) => p.mass > specialMass() + 1e-9)
    expect(below.every((p) => p.escapeSpeedFractionOfC < 1)).toBe(true)
    expect(above.every((p) => p.escapeSpeedFractionOfC > 1)).toBe(true)
  })

  it('the closed-form outcome agrees with the simulated launch on both sides of the special mass', () => {
    for (const mass of [0.2, 0.8, 1.5, 1.9, 2.1, 3, 6]) {
      expect(runRadialLightSpeedLaunch(mass, 1).outcome).toBe(outcomeForMass(mass))
    }
  })

  it("Part 1's numbers: about 32 percent for the light mass, about 173 percent for the heavy mass", () => {
    const real = partOneOutcomes()
    expect(real.light.escapeSpeedFractionOfC).toBeCloseTo(0.3162, 4)
    expect(real.heavy.escapeSpeedFractionOfC).toBeCloseTo(1.7321, 4)
    expect(real.light.outcome).toBe('escapes')
    expect(real.heavy.outcome).toBe('falls-back')
    expect(real.light.isInsideHorizon).toBe(false)
    expect(real.heavy.isInsideHorizon).toBe(true)
  })

  it('launchSummary for mass 0.8 matches the worked example in the words box (63 percent)', () => {
    expect(launchSummary(0.8).escapeSpeedFractionOfC).toBeCloseTo(0.632, 3)
    expect(launchSummary(3).escapeSpeedFractionOfC).toBeCloseTo(1.2247, 4)
  })

  it('the check-up finds exactly the speed of light at the horizon for any mass', () => {
    for (const mass of [0.2, 1, 2, 3.7, 6]) {
      const c = checkUp(mass)
      expect(c.expectedFractionAtHorizon).toBe(1)
      expect(c.foundFractionAtHorizon).toBeCloseTo(1, 12)
    }
  })

  it('guess markers follow the guess and never read the real result', () => {
    const a = guessMarkers('much-slower', 'faster', 'yes')
    const b = guessMarkers('faster', 'cannot-escape', 'no')
    expect(a.light.fractionOfC).toBe(GUESS_MARK_HEIGHTS.muchSlower)
    expect(b.light.fractionOfC).toBe(GUESS_MARK_HEIGHTS.faster)
    expect(a.heavy.fractionOfC).toBe(GUESS_MARK_HEIGHTS.faster)
    expect(b.heavy.fractionOfC).toBe(GUESS_MARK_HEIGHTS.cannotEscape)
    expect(a.light.mass).toBe(PART_ONE_MASSES.light)
    expect(a.heavy.mass).toBe(PART_ONE_MASSES.heavy)
    expect(a.inBetween.mass).toBe(specialMass())
    expect(b.inBetween.mass).toBeNull()
    expect(a.inBetween.fractionOfC).toBe(1)
    const heights = new Set(Object.values(GUESS_MARK_HEIGHTS))
    expect(heights.size).toBe(3)
  })

  it('tutor marking: light mass is much slower, heavy mass cannot escape, in between is yes', () => {
    const right = tutorMarking('much-slower', 'cannot-escape', 'yes')
    expect(right.light.matches && right.heavy.matches && right.inBetween.matches).toBe(true)
    const wrong = tutorMarking('cannot-escape', 'faster', 'no')
    expect(wrong.light.matches).toBe(false)
    expect(wrong.heavy.matches).toBe(false)
    expect(wrong.inBetween.matches).toBe(false)
    expect(wrong.heavy.fractionOfC).toBeCloseTo(1.7321, 4)
    expect(wrong.inBetween.specialMass).toBe(2)
  })
})

describe('audit update: real sizes for the field guide', () => {
  it("matches NASA's Sun (about 3 km) and Earth (about 9 mm)", () => {
    expect(realSchwarzschildRadiusMeters(SOLAR_MASS_KG) / 1000).toBeCloseTo(2.95, 1)
    expect(realSchwarzschildRadiusMeters(5.972e24) * 1000).toBeCloseTo(8.87, 1)
  })

  it("M87*'s diameter is just under 40 billion km, as ESO says", () => {
    const m87 = sizeLadder().find((e) => e.name.startsWith('M87'))!
    const diameterKm = (2 * m87.radiusMeters) / 1000
    expect(diameterKm).toBeGreaterThan(3.7e10)
    expect(diameterKm).toBeLessThan(4.0e10)
  })

  it('the ladder rises with mass and radius is proportional to mass', () => {
    const ladder = sizeLadder()
    for (let i = 1; i < ladder.length; i++) {
      expect(ladder[i].massKg).toBeGreaterThan(ladder[i - 1].massKg)
      expect(ladder[i].radiusMeters).toBeGreaterThan(ladder[i - 1].radiusMeters)
    }
    expect(realSchwarzschildRadiusMeters(2e30)).toBeCloseTo(2 * realSchwarzschildRadiusMeters(1e30), 6)
  })

  it('rejects a mass that is not positive', () => {
    expect(() => realSchwarzschildRadiusMeters(0)).toThrow(RangeError)
  })
})

import { hillDepthAt, horizonCheckUp, LAUNCH_DISTANCE, launchPointPosition, outcomeCheckUp, pullAt, resultsTable } from './blackHoleExperiment'

describe('the hill picture in the introduction', () => {
  it('matches the worked numbers: mass 4 pulls 4 at distance 1, 1 at distance 2 and about 0.11 at distance 6', () => {
    expect(pullAt(4, 1)).toBe(4)
    expect(pullAt(4, 2)).toBe(1)
    expect(pullAt(4, 6)).toBeCloseTo(0.111, 3)
  })

  it('halving the distance makes the pull four times stronger, with the same mass', () => {
    for (const d of [0.5, 1, 3, 8]) {
      expect(pullAt(4, d / 2)).toBeCloseTo(4 * pullAt(4, d), 12)
    }
  })

  it("at each ball's own surface, the smaller ball of the same mass is nearer its centre, so it pulls harder", () => {
    expect(pullAt(4, 1)).toBeGreaterThan(pullAt(4, 2))
  })

  it('the escape speed from the squeezed surface is sqrt(2) times that from the lead surface, the same mass', () => {
    const lead = evaluateBlackHole(4, 2).escapeSpeed
    const squeezed = evaluateBlackHole(4, 1).escapeSpeed
    expect(squeezed / lead).toBeCloseTo(Math.SQRT2, 12)
  })

  it('the hill gets deeper the closer you are, and flattens far away', () => {
    expect(hillDepthAt(4, 1)).toBe(4)
    expect(hillDepthAt(4, 2)).toBe(2)
    expect(hillDepthAt(4, 1)).toBeGreaterThan(hillDepthAt(4, 6))
  })

  it('rejects a mass or distance that is not positive', () => {
    expect(() => pullAt(0, 1)).toThrow(RangeError)
    expect(() => pullAt(1, 0)).toThrow(RangeError)
    expect(() => hillDepthAt(-1, 1)).toThrow(RangeError)
  })
})


describe('Part 3: the results table and the check-up', () => {
  it('launchPointPosition: outside below the special mass, exactly on it at the special mass, inside above', () => {
    expect(launchPointPosition(0.2)).toBe('outside')
    expect(launchPointPosition(1.99)).toBe('outside')
    expect(launchPointPosition(specialMass())).toBe('on')
    expect(launchPointPosition(2.01)).toBe('inside')
    expect(launchPointPosition(6)).toBe('inside')
  })

  it("Table 1's rows hold the real numbers: 32 and 173 percent, horizons 0.10 and 3.00, and the switch at mass 2 (100 percent, horizon 1)", () => {
    const [light, heavy, sweep] = resultsTable()
    expect(light.key).toBe('light')
    expect(light.escapeSpeedFractionOfC).toBeCloseTo(0.3162, 4)
    expect(light.eventHorizonRadius).toBeCloseTo(0.1, 12)
    expect(light.launchPoint).toBe('outside')
    expect(light.outcome).toBe('escapes')
    expect(heavy.escapeSpeedFractionOfC).toBeCloseTo(1.7321, 4)
    expect(heavy.eventHorizonRadius).toBeCloseTo(3, 12)
    expect(heavy.launchPoint).toBe('inside')
    expect(heavy.outcome).toBe('falls-back')
    expect(sweep.mass).toBe(2)
    expect(sweep.escapeSpeedFractionOfC).toBeCloseTo(1, 12)
    expect(sweep.eventHorizonRadius).toBeCloseTo(LAUNCH_DISTANCE, 12)
    expect(sweep.launchPoint).toBe('on')
    expect(sweep.outcome).toBe('switches')
  })

  it('the horizon check-up finds exactly the speed of light at every horizon, for any mass', () => {
    for (const mass of [0.2, 1, 2, 3.7, 6]) {
      const row = horizonCheckUp(mass)
      expect(row.expectedFraction).toBe(1)
      expect(row.foundFraction).toBeCloseTo(1, 12)
      expect(row.same).toBe(true)
      expect(row.horizonRadius).toBeCloseTo(mass / 2, 12)
    }
  })

  it('the outcome check-up: the formula and the step-by-step simulation agree on the light and heavy masses and on masses either side of the special mass', () => {
    for (const mass of [0.2, 1, 1.9, 2.1, 3, 6]) {
      const row = outcomeCheckUp(mass)
      expect(row.same).toBe(true)
    }
    expect(outcomeCheckUp(0.2).simulation).toBe('escapes')
    expect(outcomeCheckUp(6).simulation).toBe('falls-back')
  })
})
