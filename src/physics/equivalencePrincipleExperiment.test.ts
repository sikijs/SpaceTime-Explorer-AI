import { describe, it, expect } from 'vitest'
import {
  runEquivalencePrincipleExperiment,
  ballHeightAboveFloorAt,
  EARTH_GRAVITY,
  actualOutcome,
  guessMarkerFor,
  markGuess,
  fixedTimeScaleEndSeconds,
  heightOnFixedScaleAt,
  fallTimeWorkedNumbers,
} from './equivalencePrincipleExperiment'

describe('Equivalence Principle Experiment Physics', () => {
  it('reports the acceleration in both units', () => {
    const result = runEquivalencePrincipleExperiment(EARTH_GRAVITY, 2)
    expect(result.accelerationMetersPerSecondSquared).toBe(EARTH_GRAVITY)
    expect(result.accelerationInG).toBeCloseTo(1, 10)
  })

  it('accelerationInG scales with the chosen multiple of g', () => {
    expect(runEquivalencePrincipleExperiment(0.5 * EARTH_GRAVITY, 2).accelerationInG).toBeCloseTo(0.5, 10)
    expect(runEquivalencePrincipleExperiment(2 * EARTH_GRAVITY, 2).accelerationInG).toBeCloseTo(2, 10)
  })

  it('timeToFloorSeconds matches sqrt(2 * initialHeight / acceleration)', () => {
    const result = runEquivalencePrincipleExperiment(EARTH_GRAVITY, 2)
    expect(result.timeToFloorSeconds).toBeCloseTo(Math.sqrt((2 * 2) / EARTH_GRAVITY), 12)
  })

  it('a stronger acceleration reaches the floor sooner', () => {
    const weak = runEquivalencePrincipleExperiment(0.5 * EARTH_GRAVITY, 2)
    const strong = runEquivalencePrincipleExperiment(2 * EARTH_GRAVITY, 2)
    expect(strong.timeToFloorSeconds).toBeLessThan(weak.timeToFloorSeconds)
  })

  it('a greater starting height takes longer to reach the floor, at fixed acceleration', () => {
    const low = runEquivalencePrincipleExperiment(EARTH_GRAVITY, 1)
    const high = runEquivalencePrincipleExperiment(EARTH_GRAVITY, 4)
    expect(high.timeToFloorSeconds).toBeGreaterThan(low.timeToFloorSeconds)
  })

  it('is deterministic across repeated runs', () => {
    expect(runEquivalencePrincipleExperiment(EARTH_GRAVITY, 2)).toEqual(
      runEquivalencePrincipleExperiment(EARTH_GRAVITY, 2)
    )
  })

  it('rejects non-positive acceleration', () => {
    expect(() => runEquivalencePrincipleExperiment(0, 2)).toThrow(RangeError)
    expect(() => runEquivalencePrincipleExperiment(-1, 2)).toThrow(RangeError)
    expect(() => runEquivalencePrincipleExperiment(NaN, 2)).toThrow(RangeError)
  })

  it('rejects non-positive initial height', () => {
    expect(() => runEquivalencePrincipleExperiment(EARTH_GRAVITY, 0)).toThrow(RangeError)
    expect(() => runEquivalencePrincipleExperiment(EARTH_GRAVITY, -1)).toThrow(RangeError)
    expect(() => runEquivalencePrincipleExperiment(EARTH_GRAVITY, NaN)).toThrow(RangeError)
  })
})

describe('Ball Height Above Floor Over Time', () => {
  // Two "scenes" that a real UI would frame differently (gravity vs. an accelerating
  // cabin), but which must use this exact same calculation — that identity is the point.
  const sceneA = runEquivalencePrincipleExperiment(EARTH_GRAVITY, 2)
  const sceneB = runEquivalencePrincipleExperiment(EARTH_GRAVITY, 2)

  it('starts at the initial height', () => {
    expect(ballHeightAboveFloorAt(sceneA, 0)).toBe(2)
  })

  it('reaches (approximately) zero exactly at timeToFloorSeconds', () => {
    expect(ballHeightAboveFloorAt(sceneA, sceneA.timeToFloorSeconds)).toBeCloseTo(0, 10)
  })

  it('matches the same-acceleration formula: y0 - 0.5 * a * t^2', () => {
    ;[0.1, 0.2, 0.3].forEach((t) => {
      expect(ballHeightAboveFloorAt(sceneA, t)).toBeCloseTo(2 - 0.5 * EARTH_GRAVITY * t * t, 12)
    })
  })

  it('produces identical curves for two scenes given the same acceleration and height', () => {
    ;[0, 0.1, 0.2, 0.3, sceneA.timeToFloorSeconds].forEach((t) => {
      expect(ballHeightAboveFloorAt(sceneA, t)).toBeCloseTo(ballHeightAboveFloorAt(sceneB, t), 12)
    })
  })

  it('a stronger acceleration produces a lower height at the same elapsed time', () => {
    const weak = runEquivalencePrincipleExperiment(0.5 * EARTH_GRAVITY, 2)
    const strong = runEquivalencePrincipleExperiment(2 * EARTH_GRAVITY, 2)
    expect(ballHeightAboveFloorAt(strong, 0.2)).toBeLessThan(ballHeightAboveFloorAt(weak, 0.2))
  })

  it('height decreases monotonically over the run', () => {
    const times = [0, 0.05, 0.1, 0.15, 0.2]
    const heights = times.map((t) => ballHeightAboveFloorAt(sceneA, t))
    for (let i = 1; i < heights.length; i++) {
      expect(heights[i]).toBeLessThan(heights[i - 1])
    }
  })

  it('rejects elapsed times outside the run', () => {
    expect(() => ballHeightAboveFloorAt(sceneA, -0.1)).toThrow(RangeError)
    expect(() => ballHeightAboveFloorAt(sceneA, sceneA.timeToFloorSeconds + 0.1)).toThrow(RangeError)
    expect(() => ballHeightAboveFloorAt(sceneA, NaN)).toThrow(RangeError)
  })

  it('is deterministic', () => {
    expect(ballHeightAboveFloorAt(sceneA, 0.15)).toEqual(ballHeightAboveFloorAt(sceneA, 0.15))
  })
})

describe('Equivalence Principle audit update: guess, marker, marking, fixed scale', () => {
  const at = (g: number) => runEquivalencePrincipleExperiment(g * EARTH_GRAVITY, 2)

  it('the real outcome is "the same way" for every allowed acceleration', () => {
    for (const g of [0.1, 0.5, 1, 2, 5]) {
      const a = at(g)
      const b = at(g)
      for (let i = 0; i <= 10; i++) {
        const t = (i / 10) * a.timeToFloorSeconds
        expect(ballHeightAboveFloorAt(a, t)).toBe(ballHeightAboveFloorAt(b, t))
      }
      expect(actualOutcome()).toBe('sameWay')
    }
  })

  it('the marker sits at the end of the curves, in the same place for either guess', () => {
    const r = at(1)
    const same = guessMarkerFor(r, 'sameWay')
    const diff = guessMarkerFor(r, 'differently')
    expect(same.timeSeconds).toBe(r.timeToFloorSeconds)
    expect(same.heightMeters).toBe(0)
    expect([diff.timeSeconds, diff.heightMeters, diff.fractionAlongTime, diff.fractionDown]).toEqual([
      same.timeSeconds,
      same.heightMeters,
      same.fractionAlongTime,
      same.fractionDown,
    ])
  })

  it('the marker text names the choice and says it is only a marker', () => {
    const r = at(1)
    expect(guessMarkerFor(r, 'differently').boxText).toBe(
      'YOUR GUESS (a marker only): the ball moves differently in the two cabins'
    )
    expect(guessMarkerFor(r, 'sameWay').boxText).toBe(
      'YOUR GUESS (a marker only): the ball moves the same way in the two cabins'
    )
  })

  it('a guess never changes the real result', () => {
    const r = at(1)
    const before = JSON.stringify(r)
    guessMarkerFor(r, 'differently')
    markGuess(r, 'differently')
    expect(JSON.stringify(r)).toBe(before)
    expect(actualOutcome()).toBe('sameWay')
  })

  it('markGuess: "the same way" matches and "differently" does not', () => {
    const r = at(1)
    expect(markGuess(r, 'sameWay').matched).toBe(true)
    expect(markGuess(r, 'differently').matched).toBe(false)
  })

  it('markGuess text names the guess and gives the fall time from the result', () => {
    const r = at(1)
    expect(markGuess(r, 'sameWay').text).toContain('move the same way in the two cabins')
    expect(markGuess(r, 'differently').text).toContain('move differently in the two cabins')
    expect(markGuess(r, 'sameWay').text).toContain('0.64 seconds')
    expect(markGuess(at(2), 'sameWay').text).toContain('0.45 seconds')
  })

  it('the fixed time scale covers every allowed fall, the longest being about 2.02 s at 0.1g', () => {
    expect(fixedTimeScaleEndSeconds()).toBe(2.1)
    for (const g of [0.1, 0.5, 1, 2, 5]) {
      expect(at(g).timeToFloorSeconds).toBeLessThanOrEqual(fixedTimeScaleEndSeconds())
    }
    expect(at(0.1).timeToFloorSeconds).toBeCloseTo(2.02, 2)
  })

  it('on the fixed scale the height follows the same curve, then rests at 0 after landing', () => {
    const r = at(2)
    expect(heightOnFixedScaleAt(r, 0)).toBe(2)
    expect(heightOnFixedScaleAt(r, 0.2)).toBe(ballHeightAboveFloorAt(r, 0.2))
    expect(heightOnFixedScaleAt(r, r.timeToFloorSeconds)).toBe(0)
    expect(heightOnFixedScaleAt(r, 2.1)).toBe(0)
    expect(() => heightOnFixedScaleAt(r, 2.2)).toThrow(RangeError)
    expect(() => heightOnFixedScaleAt(r, -0.1)).toThrow(RangeError)
  })

  it('a stronger acceleration is lower than a weaker one at the same moment on the fixed scale', () => {
    expect(heightOnFixedScaleAt(at(2), 0.3)).toBeLessThan(heightOnFixedScaleAt(at(0.5), 0.3))
  })

  it('the worked numbers: 0.64 s at 1g, 0.45 s at 2g, and 1.50 m at 0.32 s', () => {
    expect(fallTimeWorkedNumbers()).toEqual({
      oneGFallSeconds: 0.64,
      twoGFallSeconds: 0.45,
      halfwayTimeSeconds: 0.32,
      halfwayHeightMeters: 1.5,
    })
  })
})
