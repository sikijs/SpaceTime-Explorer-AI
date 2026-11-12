import { describe, it, expect } from 'vitest'
import {
  runCurvedSpacetimeExperiment,
  separationAt,
  REFERENCE_RADIUS_METERS,
  actualOutcomeFor,
  finalSeparationMeters,
  guessMarkerFor,
  markGuess,
  distanceAxisEndMeters,
  workedNumbers,
  SEPARATION_AXIS_TOP_METERS,
  FIXED_DISTANCE_AXIS_METERS,
} from './curvedSpacetimeExperiment'
import type { PredictionChoice } from './curvedSpacetimeExperiment'

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

  describe('audit update: outcome, guess markers, tutor marking, axes and worked numbers', () => {
    const STRENGTHS = [0.01, 0.2, 0.5, 0.8, 0.99]
    const CHOICES: PredictionChoice[] = ['converge', 'same', 'apart']

    it('the real outcome is "converge" on the sphere and "same" on the flat surface, for every strength', () => {
      expect(actualOutcomeFor('sphere')).toBe('converge')
      expect(actualOutcomeFor('flat')).toBe('same')
      for (const s of STRENGTHS) {
        const r = runCurvedSpacetimeExperiment(1, s)
        expect(finalSeparationMeters(r, 'sphere')).toBeLessThan(r.initialSeparationMeters)
        expect(finalSeparationMeters(r, 'flat')).toBe(r.initialSeparationMeters)
      }
    })

    it('the final separation is 0.000 m on the sphere (the travelers meet at the pole) and 1.000 m on the flat surface', () => {
      for (const s of [0.2, 0.5, 0.8]) {
        const r = runCurvedSpacetimeExperiment(1, s)
        expect(finalSeparationMeters(r, 'sphere').toFixed(3)).toBe('0.000')
        expect(finalSeparationMeters(r, 'flat').toFixed(3)).toBe('1.000')
      }
    })

    it('the ring sits at the end of the line and is the same for all three guesses; the arrow follows the direction guessed', () => {
      const r = runCurvedSpacetimeExperiment(1, 0.5)
      for (const scene of ['flat', 'sphere'] as const) {
        const markers = CHOICES.map((c) => guessMarkerFor(r, scene, c))
        for (const m of markers) {
          expect(m.distanceMeters).toBe(r.maxDistanceMeters)
          expect(m.separationMeters).toBe(finalSeparationMeters(r, scene))
        }
        expect(markers.map((m) => m.arrow)).toEqual(['down', 'none', 'up'])
        expect(markers[0].boxText).toContain(scene === 'flat' ? 'flat surface' : 'curved surface')
        expect(markers[0].boxText).toContain('a marker only')
      }
      expect(guessMarkerFor(r, 'sphere', 'converge').boxText).toContain('the travelers drift closer together')
      expect(guessMarkerFor(r, 'sphere', 'apart').boxText).toContain('the travelers drift farther apart')
      expect(guessMarkerFor(r, 'flat', 'same').boxText).toContain('the travelers stay the same distance apart')
    })

    it('marking a guess matches only the real outcome and never changes it', () => {
      const r = runCurvedSpacetimeExperiment(1, 0.5)
      const before = finalSeparationMeters(r, 'sphere')
      for (const c of CHOICES) {
        expect(markGuess(r, 'sphere', c).matched).toBe(c === 'converge')
        expect(markGuess(r, 'flat', c).matched).toBe(c === 'same')
      }
      expect(markGuess(r, 'sphere', 'same').text).toContain('0.000 m')
      expect(markGuess(r, 'flat', 'same').text).toContain('1.000 m')
      expect(markGuess(r, 'sphere', 'converge').text).toContain('matched')
      expect(markGuess(r, 'sphere', 'same').text).toContain('different from your guess')
      expect(finalSeparationMeters(r, 'sphere')).toBe(before)
    })

    it('the vertical axis has room above the 1 m start', () => {
      expect(SEPARATION_AXIS_TOP_METERS).toBe(1.2)
      expect(SEPARATION_AXIS_TOP_METERS).toBeGreaterThan(1)
    })

    it('the fixed distance axis fits the three presets and grows in steps of 20 m for a smaller strength', () => {
      expect(FIXED_DISTANCE_AXIS_METERS).toBe(80)
      for (const s of [0.2, 0.5, 0.8, 0.99]) {
        const r = runCurvedSpacetimeExperiment(1, s)
        expect(r.maxDistanceMeters).toBeLessThanOrEqual(80)
        expect(distanceAxisEndMeters(r)).toBe(80)
      }
      expect(distanceAxisEndMeters(runCurvedSpacetimeExperiment(1, 0.1))).toBe(160)
      expect(distanceAxisEndMeters(runCurvedSpacetimeExperiment(1, 0.01))).toBe(1580)
    })

    it('workedNumbers match the page wording', () => {
      const w = workedNumbers()
      expect(w.radiusAt0p5).toBe(20)
      expect(w.poleDistanceAt0p5.toFixed(1)).toBe('31.4')
      expect(w.separationAfter10mAt0p5.toFixed(3)).toBe('0.878')
      expect(w.halfwayDistanceAt0p5.toFixed(1)).toBe('15.7')
      expect(w.halfwaySeparationAt0p5.toFixed(3)).toBe('0.707')
      expect(w.endSeparationAt0p5.toFixed(3)).toBe('0.000')
      expect(w.flatEndSeparation.toFixed(3)).toBe('1.000')
      expect(w.radiusAt0p2).toBe(50)
      expect(w.radiusAt0p8).toBe(12.5)
      expect(w.poleDistanceAt0p2.toFixed(1)).toBe('78.5')
      expect(w.poleDistanceAt0p8.toFixed(1)).toBe('19.6')
      expect(w.separationAfter10mAt0p2.toFixed(3)).toBe('0.980')
      expect(w.separationAfter10mAt0p8.toFixed(3)).toBe('0.697')
      expect(w.earthRadiusMeters).toBe(6371000)
      expect(w.earthRadiusOverPart1Radius).toBe(318550)
      expect(w.earthStrengthOnThisScale.toFixed(7)).toBe('0.0000016')
      expect(w.smallestChoosableStrength).toBe(0.01)
      expect(w.earthStrengthOnThisScale).toBeLessThan(w.smallestChoosableStrength)
    })
  })
})
