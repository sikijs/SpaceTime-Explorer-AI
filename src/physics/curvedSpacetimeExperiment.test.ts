import { describe, it, expect } from 'vitest'
import { runCurvedSpacetimeExperiment, separationAt, REFERENCE_RADIUS_METERS } from './curvedSpacetimeExperiment'

describe('Curved Spacetime Experiment Physics', () => {
  it('derives radius from curvature strength as REFERENCE_RADIUS_METERS / curvatureStrength', () => {
    const result = runCurvedSpacetimeExperiment(1, 0.5)
    expect(result.radiusMeters).toBeCloseTo(REFERENCE_RADIUS_METERS / 0.5, 12)
  })

  it('maxDistanceMeters is a quarter of the sphere\'s circumference (radius * pi/2)', () => {
    const result = runCurvedSpacetimeExperiment(1, 0.4)
    expect(result.maxDistanceMeters).toBeCloseTo(result.radiusMeters * (Math.PI / 2), 12)
  })

  it('is deterministic across repeated runs', () => {
    expect(runCurvedSpacetimeExperiment(1, 0.3)).toEqual(runCurvedSpacetimeExperiment(1, 0.3))
  })

  it('rejects non-positive initial separation', () => {
    expect(() => runCurvedSpacetimeExperiment(0, 0.3)).toThrow(RangeError)
    expect(() => runCurvedSpacetimeExperiment(-1, 0.3)).toThrow(RangeError)
  })

  it('rejects curvature strength outside (0, 1)', () => {
    expect(() => runCurvedSpacetimeExperiment(1, 0)).toThrow(RangeError)
    expect(() => runCurvedSpacetimeExperiment(1, 1)).toThrow(RangeError)
    expect(() => runCurvedSpacetimeExperiment(1, -0.1)).toThrow(RangeError)
    expect(() => runCurvedSpacetimeExperiment(1, 1.1)).toThrow(RangeError)
    expect(() => runCurvedSpacetimeExperiment(1, NaN)).toThrow(RangeError)
  })
})

describe('Separation Over Distance Traveled', () => {
  const experiment = runCurvedSpacetimeExperiment(1, 0.3)

  it('flat scene: separation is exactly the initial separation for every distance', () => {
    ;[0, 1, 5, experiment.maxDistanceMeters].forEach((d) => {
      expect(separationAt(experiment, d, 'flat')).toBeCloseTo(1, 12)
    })
  })

  it('sphere scene: separation starts at the initial separation', () => {
    expect(separationAt(experiment, 0, 'sphere')).toBeCloseTo(1, 12)
  })

  it('sphere scene: separation matches the closed-form initialSeparation * cos(d / radius)', () => {
    ;[0, 1, 5, experiment.maxDistanceMeters].forEach((d) => {
      const expected = experiment.initialSeparationMeters * Math.cos(d / experiment.radiusMeters)
      expect(separationAt(experiment, d, 'sphere')).toBeCloseTo(expected, 12)
    })
  })

  it('sphere scene: separation shrinks to (approximately) zero at maxDistanceMeters', () => {
    expect(separationAt(experiment, experiment.maxDistanceMeters, 'sphere')).toBeCloseTo(0, 9)
  })

  it('sphere scene: separation strictly decreases as distance increases', () => {
    const distances = [0, 1, 2, 3, 4, experiment.maxDistanceMeters]
    const separations = distances.map((d) => separationAt(experiment, d, 'sphere'))
    for (let i = 1; i < separations.length; i++) {
      expect(separations[i]).toBeLessThan(separations[i - 1])
    }
  })

  it('a greater curvature strength shrinks sphere separation more, at the same distance traveled', () => {
    const weak = runCurvedSpacetimeExperiment(1, 0.2)
    const strong = runCurvedSpacetimeExperiment(1, 0.8)
    const d = 3
    expect(separationAt(strong, d, 'sphere')).toBeLessThan(separationAt(weak, d, 'sphere'))
  })

  it('sphere separation is always less than or equal to flat separation, for d > 0', () => {
    ;[1, 2, 3, experiment.maxDistanceMeters].forEach((d) => {
      expect(separationAt(experiment, d, 'sphere')).toBeLessThan(separationAt(experiment, d, 'flat'))
    })
  })

  it('rejects distances outside [0, maxDistanceMeters]', () => {
    expect(() => separationAt(experiment, -0.1, 'flat')).toThrow(RangeError)
    expect(() => separationAt(experiment, experiment.maxDistanceMeters + 0.1, 'sphere')).toThrow(RangeError)
    expect(() => separationAt(experiment, NaN, 'sphere')).toThrow(RangeError)
  })

  it('is deterministic', () => {
    expect(separationAt(experiment, 2, 'sphere')).toEqual(separationAt(experiment, 2, 'sphere'))
  })
})
