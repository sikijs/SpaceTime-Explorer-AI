import { describe, it, expect } from 'vitest'
import { runTidalEffectExperiment, ballPositionsAt, EARTH_GRAVITY } from './tidalEffectExperiment'

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
