import { describe, expect, it } from 'vitest'
import { evaluateBlackHole, SPEED_OF_LIGHT } from './blackHoleExperiment'
import {
  AIM_MAX,
  AIM_MIN,
  GUESS_LINE_AIMS,
  GUESS_LINE_RISE_DEGREES,
  GUESS_RING_AIM,
  GUESS_RING_OFFSET_DEGREES,
  PART_ONE_AIMS,
  SUN_PUBLISHED,
  aimSweep,
  fallsInEdge,
  flybySummary,
  guessMarkers,
  pageRatioCheck,
  publishedSunRatio,
  radiansToDegrees,
  realToOrdinaryRatio,
  runLightBendingExperiment,
  stepCheckRows,
  sunRatioCheck,
  tutorMarking,
  workedNumbers,
} from './lightBendingExperiment'

describe('runLightBendingExperiment', () => {
  it('matches the closed-form Newtonian deflection formula', () => {
    const cases: [number, number][] = [
      [1, 2],
      [1, 4],
      [2, 4],
      [4, 8],
    ]
    for (const [gm, aimDistance] of cases) {
      const result = runLightBendingExperiment(gm, aimDistance)
      expect(result.newtonianDeflectionAngle).toBeCloseTo(
        (2 * gm) / (SPEED_OF_LIGHT ** 2 * aimDistance),
        9
      )
    }
  })

  it('has a general-relativistic angle exactly double the Newtonian one', () => {
    const cases: [number, number][] = [
      [1, 2],
      [1, 4],
      [2, 4],
      [4, 8],
    ]
    for (const [gm, aimDistance] of cases) {
      const result = runLightBendingExperiment(gm, aimDistance)
      expect(result.generalRelativisticDeflectionAngle).toBeCloseTo(
        2 * result.newtonianDeflectionAngle,
        12
      )
    }
  })

  it('decreases the Newtonian deflection angle as aim distance increases, gm fixed', () => {
    const values = [1, 2, 4, 8, 16].map(
      (aimDistance) => runLightBendingExperiment(1, aimDistance).newtonianDeflectionAngle
    )
    for (let i = 1; i < values.length; i++) {
      expect(values[i]).toBeLessThan(values[i - 1])
    }
  })

  it('increases the Newtonian deflection angle as gravitationalParameter increases, aim distance fixed', () => {
    const values = [0.5, 1, 2, 4, 8].map(
      (gm) => runLightBendingExperiment(gm, 4).newtonianDeflectionAngle
    )
    for (let i = 1; i < values.length; i++) {
      expect(values[i]).toBeGreaterThan(values[i - 1])
    }
  })

  it('agrees with the Newtonian formula within tolerance at aim distances well outside the horizon', () => {
    const gm = 1
    const horizon = evaluateBlackHole(gm, 1).eventHorizonRadius
    for (const aimDistance of [4, 6, 8]) {
      expect(aimDistance).toBeGreaterThan(horizon * 5)
      const result = runLightBendingExperiment(gm, aimDistance)
      expect(result.outcome).toBe('deflects')
      expect(result.simulatedDeflectionAngle).not.toBeNull()
      expect(result.simulatedDeflectionAngle!).toBeCloseTo(result.newtonianDeflectionAngle, 1)
    }
  })

  it('falls in for a small enough aim distance, and deflects for a large enough one', () => {
    // The true falls-in/deflects boundary is somewhat larger than the event horizon radius
    // itself — gravity bends the path enough that its closest approach is smaller than the aim
    // distance (gravitational focusing) — so this only checks well-separated cases, not an exact
    // cutoff at the horizon.
    const gm = 1
    const horizon = evaluateBlackHole(gm, 1).eventHorizonRadius

    const fallsIn = runLightBendingExperiment(gm, horizon * 0.5)
    expect(fallsIn.outcome).toBe('falls-in')

    const deflects = runLightBendingExperiment(gm, horizon * 10)
    expect(deflects.outcome).toBe('deflects')
  })

  it('has a null simulatedDeflectionAngle in the falls-in case', () => {
    const gm = 1
    const horizon = evaluateBlackHole(gm, 1).eventHorizonRadius
    const result = runLightBendingExperiment(gm, horizon * 0.5)

    expect(result.outcome).toBe('falls-in')
    expect(result.simulatedDeflectionAngle).toBeNull()
  })

  it('has a monotonically increasing x once far past the mass in the deflects case', () => {
    const result = runLightBendingExperiment(1, 4)
    expect(result.outcome).toBe('deflects')

    const trajectory = result.trajectory
    const last = trajectory.length - 1
    for (let i = last - 20; i < last; i++) {
      expect(trajectory[i + 1].x).toBeGreaterThan(trajectory[i].x)
    }
  })

  it('is deterministic across repeated calls for the same inputs', () => {
    const a = runLightBendingExperiment(1, 4)
    const b = runLightBendingExperiment(1, 4)

    expect(a.outcome).toBe(b.outcome)
    expect(a.trajectory.length).toBe(b.trajectory.length)
    for (let i = 0; i < a.trajectory.length; i++) {
      expect(a.trajectory[i]).toEqual(b.trajectory[i])
    }
  })

  it('throws for invalid inputs', () => {
    expect(() => runLightBendingExperiment(0, 1)).toThrow(RangeError)
    expect(() => runLightBendingExperiment(-1, 1)).toThrow(RangeError)
    expect(() => runLightBendingExperiment(1, 0)).toThrow(RangeError)
    expect(() => runLightBendingExperiment(1, -1)).toThrow(RangeError)
  })
})

// ---- audit update, 2026-11-13 ----
describe('Gravity 8 audit update: pictures, marks and check-ups', () => {
  it('flybySummary converts the module result to degrees and leaves the angle null on a fall', () => {
    const far = flybySummary(3)
    expect(far.outcome).toBe('deflects')
    expect(far.simulatedDegrees!).toBeCloseTo(9.49, 1)
    expect(far.ordinaryFormulaDegrees).toBeCloseTo(9.55, 2)
    expect(far.realFormulaDegrees).toBeCloseTo(19.1, 1)
    expect(far.ordinaryFormulaRadians).toBeCloseTo((2 * 1) / (SPEED_OF_LIGHT ** 2 * 3), 12)
    expect(radiansToDegrees(Math.PI)).toBeCloseTo(180, 9)
    const fell = flybySummary(0.5)
    expect(fell.outcome).toBe('falls-in')
    expect(fell.simulatedDegrees).toBeNull()
  })

  it('the falls-in edge on the slider sits between 0.7 and 0.8', () => {
    const edge = fallsInEdge()
    expect(edge.lastFallsIn).toBeCloseTo(0.7, 9)
    expect(edge.firstPassesBy).toBeCloseTo(0.8, 9)
    expect(edge.firstPassesBy).toBeCloseTo(PART_ONE_AIMS.sweepEnd, 9)
    expect(AIM_MIN).toBeLessThan(edge.lastFallsIn)
    expect(AIM_MAX).toBeGreaterThan(edge.firstPassesBy)
  })

  it('the sweep runs from 4.0 down to 0.8 in steps of 0.1, every point passes by, and closer bends more', () => {
    const sweep = aimSweep()
    expect(sweep).toHaveLength(33)
    expect(sweep[0].aim).toBeCloseTo(4, 9)
    expect(sweep[sweep.length - 1].aim).toBeCloseTo(0.8, 9)
    expect(sweep.every((p) => p.outcome === 'deflects')).toBe(true)
    for (let i = 1; i < sweep.length; i += 1) {
      expect(sweep[i].simulatedDegrees!).toBeGreaterThan(sweep[i - 1].simulatedDegrees!)
    }
    expect(sweep[0].simulatedDegrees!).toBeCloseTo(7.02, 1)
    expect(sweep[sweep.length - 1].simulatedDegrees!).toBeCloseTo(35.22, 1)
  })

  it('the real formula is exactly twice the ordinary one at every aim on the slider', () => {
    for (let a = 0.3; a <= 4.001; a += 0.1) {
      expect(realToOrdinaryRatio(Math.round(a * 10) / 10)).toBeCloseTo(2, 12)
    }
  })

  it('the guess marks follow the guess and stay on the real picture', () => {
    const more = guessMarkers('yes', 'more', 'more')
    const less = guessMarkers('yes', 'less', 'less')
    const same = guessMarkers('no', 'same', 'same')
    // guess 1: a ring on the far pass's bend, whatever the answer
    expect(more.bends.aim).toBe(PART_ONE_AIMS.far)
    expect(more.bends.degrees).toBeCloseTo(flybySummary(PART_ONE_AIMS.far).simulatedDegrees!, 9)
    expect(same.bends.choice).toBe('no')
    // guess 2: the line rises toward the close end for "more", falls for "less", is flat for "same"
    expect(more.closer.aimFrom).toBe(GUESS_LINE_AIMS.from)
    expect(more.closer.aimTo).toBe(GUESS_LINE_AIMS.to)
    expect(more.closer.degreesTo - more.closer.degreesFrom).toBeCloseTo(GUESS_LINE_RISE_DEGREES, 9)
    expect(less.closer.degreesTo - less.closer.degreesFrom).toBeCloseTo(-GUESS_LINE_RISE_DEGREES, 9)
    expect(same.closer.degreesTo).toBeCloseTo(same.closer.degreesFrom, 9)
    // guess 3: above, below or on the amber curve at aim 2
    const amber = flybySummary(GUESS_RING_AIM).simulatedDegrees!
    expect(more.realVsOrdinary.degrees).toBeCloseTo(amber + GUESS_RING_OFFSET_DEGREES, 9)
    expect(less.realVsOrdinary.degrees).toBeCloseTo(amber - GUESS_RING_OFFSET_DEGREES, 9)
    expect(same.realVsOrdinary.degrees).toBeCloseTo(amber, 9)
    expect(more.realVsOrdinary.degrees).not.toBeCloseTo(less.realVsOrdinary.degrees, 3)
  })

  it('the guesses never change the real numbers', () => {
    const a = flybySummary(2)
    guessMarkers('no', 'less', 'same')
    tutorMarking('no', 'less', 'same')
    expect(flybySummary(2)).toEqual(a)
  })

  it('the tutor marks each guess against what the module computes', () => {
    const right = tutorMarking('yes', 'more', 'more')
    expect(right.bends.matches).toBe(true)
    expect(right.closer.matches).toBe(true)
    expect(right.realVsOrdinary.matches).toBe(true)
    expect(right.bends.degreesAtFarPass).toBeCloseTo(9.49, 1)
    expect(right.closer.farDegrees).toBeCloseTo(9.49, 1)
    expect(right.closer.closeDegrees).toBeCloseTo(28.47, 1)
    expect(right.realVsOrdinary.ratio).toBeCloseTo(2, 12)
    expect(right.realVsOrdinary.ordinaryDegreesAtAim2).toBeCloseTo(14.32, 1)
    expect(right.realVsOrdinary.realDegreesAtAim2).toBeCloseTo(28.65, 1)
    const wrong = tutorMarking('no', 'less', 'same')
    expect(wrong.bends.matches).toBe(false)
    expect(wrong.closer.matches).toBe(false)
    expect(wrong.realVsOrdinary.matches).toBe(false)
    expect(wrong.bends.actual).toBe('yes')
    expect(wrong.closer.actual).toBe('more')
    expect(wrong.realVsOrdinary.actual).toBe('more')
  })

  it('the check-up rows compare the stepping with the formula and the two ratios', () => {
    const rows = stepCheckRows()
    expect(rows.map((r) => r.aim)).toEqual([3, 1, 4])
    expect(rows[0].foundDegrees).toBeCloseTo(9.49, 1)
    expect(rows[0].percentUnder).toBeGreaterThan(0.4)
    expect(rows[0].percentUnder).toBeLessThan(0.8)
    expect(rows[1].percentUnder).toBeGreaterThan(0.4)
    expect(rows[1].percentUnder).toBeLessThan(0.8)
    expect(rows[2].percentUnder).toBeGreaterThan(1.5)
    expect(rows[2].percentUnder).toBeLessThan(2.5)
    const page = pageRatioCheck()
    expect(page.found).toBeCloseTo(2, 12)
    expect(page.percentDifference).toBeCloseTo(0, 9)
    const sun = sunRatioCheck()
    expect(publishedSunRatio()).toBeCloseTo(SUN_PUBLISHED.realArcseconds / SUN_PUBLISHED.ordinaryArcseconds, 12)
    expect(sun.expected).toBeCloseTo(2.011, 3)
    expect(sun.found).toBeCloseTo(2, 12)
    expect(sun.percentDifference).toBeLessThan(1)
  })

  it('the worked numbers match the captions: aim 2 and aim 4', () => {
    const two = workedNumbers(2)
    expect(two.ordinaryFormulaRadians).toBeCloseTo(0.25, 9)
    expect(two.ordinaryFormulaDegrees).toBeCloseTo(14.32, 1)
    expect(two.simulatedDegrees!).toBeCloseTo(14.36, 1)
    expect(two.realFormulaDegrees).toBeCloseTo(28.65, 1)
    const four = workedNumbers(4)
    expect(four.ordinaryFormulaDegrees).toBeCloseTo(7.16, 1)
    expect(four.simulatedDegrees!).toBeCloseTo(7.02, 1)
    expect(four.realFormulaDegrees).toBeCloseTo(14.32, 1)
  })
})
