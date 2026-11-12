import { describe, it, expect } from 'vitest'
import {
  runTidalEffectExperiment,
  ballPositionsAt,
  EARTH_GRAVITY,
  actualOutcomeFor,
  separationAt,
  finalSeparationMeters,
  guessMarkerFor,
  markGuess,
  workedNumbers,
  moonTidalNumbers,
  fixedTimeScaleEndSeconds,
  SEPARATION_AXIS_TOP_METERS,
} from './tidalEffectExperiment'
import type { PredictionChoice, TidalEffectScene } from './tidalEffectExperiment'

describe('Tidal Effect Experiment Physics', () => {
  it('reports the acceleration in both units', () => {
    const result = runTidalEffectExperiment(EARTH_GRAVITY, 2, 1, 0.3)
    expect(result.accelerationMetersPerSecondSquared).toBe(EARTH_GRAVITY)
    expect(result.accelerationInG).toBeCloseTo(1, 10)
  })

  it('timeToFloorSeconds matches sqrt(2 * initialHeight / acceleration), same as Experiment 1', () => {
    const result = runTidalEffectExperiment(EARTH_GRAVITY, 2, 1, 0.3)
    expect(result.timeToFloorSeconds).toBeCloseTo(Math.sqrt((2 * 2) / EARTH_GRAVITY), 12)
  })

  it('is deterministic across repeated runs', () => {
    expect(runTidalEffectExperiment(EARTH_GRAVITY, 2, 1, 0.3)).toEqual(
      runTidalEffectExperiment(EARTH_GRAVITY, 2, 1, 0.3)
    )
  })

  it('rejects non-positive acceleration', () => {
    expect(() => runTidalEffectExperiment(0, 2, 1, 0.3)).toThrow(RangeError)
    expect(() => runTidalEffectExperiment(-1, 2, 1, 0.3)).toThrow(RangeError)
    expect(() => runTidalEffectExperiment(NaN, 2, 1, 0.3)).toThrow(RangeError)
  })

  it('rejects non-positive initial height', () => {
    expect(() => runTidalEffectExperiment(EARTH_GRAVITY, 0, 1, 0.3)).toThrow(RangeError)
    expect(() => runTidalEffectExperiment(EARTH_GRAVITY, -1, 1, 0.3)).toThrow(RangeError)
  })

  it('rejects non-positive initial separation', () => {
    expect(() => runTidalEffectExperiment(EARTH_GRAVITY, 2, 0, 0.3)).toThrow(RangeError)
    expect(() => runTidalEffectExperiment(EARTH_GRAVITY, 2, -1, 0.3)).toThrow(RangeError)
  })

  it('rejects convergence strength outside (0, 1)', () => {
    expect(() => runTidalEffectExperiment(EARTH_GRAVITY, 2, 1, 0)).toThrow(RangeError)
    expect(() => runTidalEffectExperiment(EARTH_GRAVITY, 2, 1, 1)).toThrow(RangeError)
    expect(() => runTidalEffectExperiment(EARTH_GRAVITY, 2, 1, -0.1)).toThrow(RangeError)
    expect(() => runTidalEffectExperiment(EARTH_GRAVITY, 2, 1, 1.1)).toThrow(RangeError)
    expect(() => runTidalEffectExperiment(EARTH_GRAVITY, 2, 1, NaN)).toThrow(RangeError)
  })
})

describe('Ball Positions Over Time', () => {
  const experiment = runTidalEffectExperiment(EARTH_GRAVITY, 2, 1, 0.3)

  it('height above floor matches Experiment 1\'s exact formula, identically in both scenes', () => {
    ;[0, 0.1, 0.2, experiment.timeToFloorSeconds].forEach((t) => {
      const expected = 2 - 0.5 * EARTH_GRAVITY * t * t
      expect(ballPositionsAt(experiment, t, 'planet').heightAboveFloor).toBeCloseTo(expected, 12)
      expect(ballPositionsAt(experiment, t, 'rocket').heightAboveFloor).toBeCloseTo(expected, 12)
    })
  })

  it('rocket scene: separation never changes', () => {
    ;[0, 0.1, 0.2, experiment.timeToFloorSeconds].forEach((t) => {
      const positions = ballPositionsAt(experiment, t, 'rocket')
      expect(positions.rightBallOffset - positions.leftBallOffset).toBeCloseTo(1, 12)
    })
  })

  it('planet scene: separation starts at the initial separation', () => {
    const positions = ballPositionsAt(experiment, 0, 'planet')
    expect(positions.rightBallOffset - positions.leftBallOffset).toBeCloseTo(1, 12)
  })

  it('planet scene: separation shrinks strictly over time, for convergenceStrength > 0', () => {
    const times = [0, 0.05, 0.1, 0.15, experiment.timeToFloorSeconds]
    const separations = times.map((t) => {
      const positions = ballPositionsAt(experiment, t, 'planet')
      return positions.rightBallOffset - positions.leftBallOffset
    })
    for (let i = 1; i < separations.length; i++) {
      expect(separations[i]).toBeLessThan(separations[i - 1])
    }
  })

  it('planet scene separation is always less than the rocket scene separation, for t > 0', () => {
    ;[0.05, 0.1, 0.15, experiment.timeToFloorSeconds].forEach((t) => {
      const planet = ballPositionsAt(experiment, t, 'planet')
      const rocket = ballPositionsAt(experiment, t, 'rocket')
      expect(planet.rightBallOffset - planet.leftBallOffset).toBeLessThan(
        rocket.rightBallOffset - rocket.leftBallOffset
      )
    })
  })

  it('a greater convergence strength shrinks the planet scene separation more, at the same elapsed time', () => {
    const weak = runTidalEffectExperiment(EARTH_GRAVITY, 2, 1, 0.1)
    const strong = runTidalEffectExperiment(EARTH_GRAVITY, 2, 1, 0.6)
    const t = 0.1
    const weakSeparation = ballPositionsAt(weak, t, 'planet').rightBallOffset - ballPositionsAt(weak, t, 'planet').leftBallOffset
    const strongSeparation =
      ballPositionsAt(strong, t, 'planet').rightBallOffset - ballPositionsAt(strong, t, 'planet').leftBallOffset
    expect(strongSeparation).toBeLessThan(weakSeparation)
  })

  it('the two balls stay symmetric about the center line', () => {
    ;[0, 0.1, experiment.timeToFloorSeconds].forEach((t) => {
      const positions = ballPositionsAt(experiment, t, 'planet')
      expect(positions.leftBallOffset).toBeCloseTo(-positions.rightBallOffset, 12)
    })
  })

  it('rejects elapsed times outside the run', () => {
    expect(() => ballPositionsAt(experiment, -0.1, 'planet')).toThrow(RangeError)
    expect(() => ballPositionsAt(experiment, experiment.timeToFloorSeconds + 0.1, 'planet')).toThrow(RangeError)
    expect(() => ballPositionsAt(experiment, NaN, 'rocket')).toThrow(RangeError)
  })

  it('is deterministic', () => {
    expect(ballPositionsAt(experiment, 0.1, 'planet')).toEqual(ballPositionsAt(experiment, 0.1, 'planet'))
  })
})

describe('Audit update: outcome, guess markers, marking, axis and worked numbers', () => {
  const CHOICES: PredictionChoice[] = ['converge', 'same', 'apart']
  const SCENES: TidalEffectScene[] = ['planet', 'rocket']
  const SETTINGS: Array<[number, number]> = [
    [0.5, 0.1],
    [1, 0.3],
    [2, 0.6],
    [5, 0.9],
    [0.1, 0.02],
  ]
  const run = (g: number, s: number) => runTidalEffectExperiment(g * EARTH_GRAVITY, 2, 1, s)

  it('the real outcome: the planet converges and the rocket stays the same, for every setting', () => {
    expect(actualOutcomeFor('planet')).toBe('converge')
    expect(actualOutcomeFor('rocket')).toBe('same')
    for (const [g, s] of SETTINGS) {
      const r = run(g, s)
      expect(finalSeparationMeters(r, 'planet')).toBeLessThan(r.initialSeparationMeters)
      expect(finalSeparationMeters(r, 'rocket')).toBe(r.initialSeparationMeters)
    }
  })

  it('separationAt equals the right ball offset minus the left ball offset from ballPositionsAt', () => {
    const r = run(1, 0.3)
    for (const scene of SCENES) {
      for (let i = 0; i <= 10; i++) {
        const t = (i / 10) * r.timeToFloorSeconds
        const p = ballPositionsAt(r, t, scene)
        expect(separationAt(r, t, scene)).toBeCloseTo(p.rightBallOffset - p.leftBallOffset, 12)
      }
    }
  })

  it('at 1g and 0.3 the planet separation is 0.925 m halfway through the fall and 0.700 m at the end; the rocket stays at 1.000 m', () => {
    const r = run(1, 0.3)
    expect(separationAt(r, r.timeToFloorSeconds / 2, 'planet')).toBeCloseTo(0.925, 12)
    expect(finalSeparationMeters(r, 'planet')).toBeCloseTo(0.7, 12)
    expect(finalSeparationMeters(r, 'rocket')).toBe(1)
  })

  it('the end separation depends on the strength only, not on the acceleration', () => {
    expect(finalSeparationMeters(run(0.5, 0.3), 'planet')).toBeCloseTo(finalSeparationMeters(run(2, 0.3), 'planet'), 12)
    expect(finalSeparationMeters(run(1, 0.6), 'planet')).toBeCloseTo(0.4, 12)
  })

  it('the guess marker sits at the end of the scene\'s line, the same for every choice, with only the arrow and the text changing', () => {
    const r = run(1, 0.3)
    for (const scene of SCENES) {
      const markers = CHOICES.map((c) => guessMarkerFor(r, scene, c))
      for (const m of markers) {
        expect(m.timeSeconds).toBe(r.timeToFloorSeconds)
        expect(m.separationMeters).toBeCloseTo(finalSeparationMeters(r, scene), 12)
        expect(m.boxText).toContain('a marker only')
        expect(m.boxText).toContain(scene === 'planet' ? 'planet cabin' : 'rocket cabin')
      }
      expect(markers.map((m) => m.arrow)).toEqual(['down', 'none', 'up'])
    }
    expect(guessMarkerFor(r, 'planet', 'converge').boxText).toContain('the balls drift together')
    expect(guessMarkerFor(r, 'rocket', 'same').boxText).toContain('the balls stay the same distance apart')
    expect(guessMarkerFor(r, 'rocket', 'apart').boxText).toContain('the balls drift apart')
  })

  it('markGuess: the planet matches only "converge", the rocket only "same", with the real numbers in the text', () => {
    const r = run(1, 0.3)
    expect(CHOICES.map((c) => markGuess(r, 'planet', c).matched)).toEqual([true, false, false])
    expect(CHOICES.map((c) => markGuess(r, 'rocket', c).matched)).toEqual([false, true, false])
    expect(markGuess(r, 'planet', 'converge').text).toContain('0.700 m')
    expect(markGuess(r, 'planet', 'converge').text).toContain('0.300 m closer')
    expect(markGuess(r, 'planet', 'converge').text).toContain('matched')
    expect(markGuess(r, 'planet', 'apart').text).toContain('something different from your guess')
    expect(markGuess(r, 'rocket', 'same').text).toContain('1.000 m')
    expect(markGuess(r, 'rocket', 'converge').text).toContain('something different from your guess')
  })

  it('marking and markers never change the result or the outcome', () => {
    const r = run(1, 0.3)
    const before = JSON.stringify(r)
    for (const scene of SCENES) {
      for (const c of CHOICES) {
        guessMarkerFor(r, scene, c)
        markGuess(r, scene, c)
      }
    }
    expect(JSON.stringify(r)).toBe(before)
    expect(actualOutcomeFor('planet')).toBe('converge')
  })

  it('the vertical axis runs to 1.2 m and the fixed time scale to 2.1 s, so every allowed setting fits', () => {
    expect(SEPARATION_AXIS_TOP_METERS).toBe(1.2)
    expect(fixedTimeScaleEndSeconds()).toBe(2.1)
    for (const [g, s] of SETTINGS) {
      const r = run(g, s)
      expect(r.timeToFloorSeconds).toBeLessThanOrEqual(fixedTimeScaleEndSeconds())
      for (const scene of SCENES) {
        expect(finalSeparationMeters(r, scene)).toBeLessThanOrEqual(SEPARATION_AXIS_TOP_METERS)
        expect(finalSeparationMeters(r, scene)).toBeGreaterThanOrEqual(0)
      }
    }
    expect(run(0.1, 0.3).timeToFloorSeconds).toBeCloseTo(2.02, 2)
  })

  it('workedNumbers match the page wording', () => {
    const w = workedNumbers()
    expect(w.oneGFallSeconds.toFixed(2)).toBe('0.64')
    expect(w.twoGFallSeconds.toFixed(2)).toBe('0.45')
    expect(w.halfGFallSeconds.toFixed(2)).toBe('0.90')
    expect(w.halfwayTimeSeconds.toFixed(2)).toBe('0.32')
    expect(w.halfwaySeparationMeters.toFixed(3)).toBe('0.925')
    expect(w.endSeparationAt0p3.toFixed(3)).toBe('0.700')
    expect(w.endSeparationAt0p1.toFixed(3)).toBe('0.900')
    expect(w.endSeparationAt0p6.toFixed(3)).toBe('0.400')
    expect(w.rocketEndSeparation.toFixed(3)).toBe('1.000')
  })

  it('the Moon pulls the near side of the Earth about 7% harder than the far side', () => {
    const m = moonTidalNumbers()
    expect(m.nearSideDistanceKm).toBe(378029)
    expect(m.farSideDistanceKm).toBe(390771)
    expect(m.nearToFarPullRatio.toFixed(3)).toBe('1.069')
  })
})
