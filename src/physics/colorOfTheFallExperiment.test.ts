import { describe, expect, it } from 'vitest'
import source from './colorOfTheFallExperiment.ts?raw'
import {
  BANDS,
  BLACK_HOLE_PRESETS,
  LAMP_WAVELENGTH_NM,
  MASS_PANEL_DISTANCE_IN_HORIZON_RADII,
  MAX_START_IN_HORIZON_RADII,
  MIN_START_IN_HORIZON_RADII,
  PART_ONE_START_IN_HORIZON_RADII,
  SMALLEST_GAP_IN_HORIZON_RADII,
  bandOf,
  checkUpRows,
  colorGuessIsModelAnswer,
  colorGuessMarker,
  curveEnd,
  fallRow,
  massGuessIsModelAnswer,
  massAnswerFromWavelengths,
  massGuessMarker,
  massPanelColumns,
  modelColorAnswer,
  modelMassAnswer,
  modelVisibleAnswer,
  nearHorizonReadings,
  partOneRow,
  percentAbove,
  readAgainstRounded,
  runPartOne,
  visibleGuessIsModelAnswer,
  visibleGuessMarker,
  wavelengthRatiosPerTenfoldGap,
  workedDistance,
  workedSteps,
  distanceWhereWavelengthPasses,
  lightPeriodSeconds,
  receivedWavelengthNm,
  runColorOfTheFallExperiment,
  stretchFactor,
  stretchFactorSteps,
} from './colorOfTheFallExperiment'

const closeTo = (actual: number, expected: number, relative: number) =>
  expect(Math.abs(actual / expected - 1)).toBeLessThan(relative)

// 1 + z written separately from the module, from the traveler's speed relative to an observer at rest at r:
// gamma (1 + beta) for the motion, with gamma = E / sqrt(1 - 1/r), times the gravity part 1 / sqrt(1 - 1/r).
function redshiftFactorFromSpeed(r0: number, r: number): number {
  const energy = Math.sqrt(1 - 1 / r0)
  const gamma = energy / Math.sqrt(1 - 1 / r)
  const motion = gamma + Math.sqrt(Math.max(0, gamma * gamma - 1))
  return motion / Math.sqrt(1 - 1 / r)
}

describe('the stretch factor, restated from Experiment 6 and checked against its specification\'s figures', () => {
  it('gives 1.054 at release from 10, 1.581 at 5, 3.162 at 2, 191.1 at 1.01 and 18,975 at 1.0001', () => {
    closeTo(stretchFactor(10, 10), 1.054, 0.001)
    closeTo(stretchFactor(10, 5), 1.581, 0.001)
    closeTo(stretchFactor(10, 2), 3.162, 0.001)
    closeTo(stretchFactor(10, 1.01), 191.1, 0.001)
    closeTo(stretchFactor(10, 1.0001), 18975, 0.001)
  })

  it('equals 1 / sqrt(1 - 1/r0) at the release', () => {
    for (const r0 of [2, 5, 10, 20, 100]) expect(stretchFactor(r0, r0)).toBeCloseTo(1 / Math.sqrt(1 - 1 / r0), 12)
  })

  it('rejects a distance at or inside the horizon and one beyond the release distance', () => {
    expect(() => stretchFactor(10, 1)).toThrow(RangeError)
    expect(() => stretchFactor(10, 0.5)).toThrow(RangeError)
    expect(() => stretchFactor(10, 11)).toThrow(RangeError)
    expect(() => stretchFactor(1, 1)).toThrow(RangeError)
    expect(() => stretchFactor(Number.NaN, 2)).toThrow(RangeError)
  })
})

describe('the worked steps of the stretch factor', () => {
  it('gives 1.581 and 870 nm at 5 horizon radii from a release at 10', () => {
    const steps = stretchFactorSteps(10, 5)
    closeTo(steps.stretch, 1.581, 0.001)
    closeTo(steps.wavelengthNm, 870, 0.001)
  })

  it('agrees with the formula written in one piece, and with the energy and roots it shows', () => {
    for (const [r0, r] of [[10, 5], [100, 1.5], [2, 1.5], [20, 1.0001], [10, 10]]) {
      const steps = stretchFactorSteps(r0, r)
      expect(steps.stretch / stretchFactor(r0, r)).toBeCloseTo(1, 12)
      expect(steps.wavelengthNm / receivedWavelengthNm(r0, r)).toBeCloseTo(1, 12)
      expect(steps.energy).toBeCloseTo(Math.sqrt(1 - 1 / r0), 12)
      expect(steps.speedTerm).toBeCloseTo(Math.sqrt(1 / r - 1 / r0), 12)
      expect(steps.rootGravity).toBeCloseTo(Math.sqrt(1 - 1 / r), 12)
      closeTo((steps.energy + steps.speedTerm) / steps.rootGravity ** 2, steps.stretch, 1e-12)
    }
  })

  it('splits into a gravity part and a motion part that multiply to the stretch factor, with the motion part 1 at the release', () => {
    closeTo(stretchFactorSteps(10, 5).gravity, 1.118, 0.001)
    closeTo(stretchFactorSteps(10, 5).motion, 1.414, 0.001)
    for (const [r0, r] of [[10, 5], [100, 1.5], [2, 1.5], [20, 1.0001]]) {
      const steps = stretchFactorSteps(r0, r)
      closeTo(steps.gravity * steps.motion, steps.stretch, 1e-12)
      expect(steps.gravity).toBeCloseTo(1 / Math.sqrt(1 - 1 / r), 9)
    }
    expect(stretchFactorSteps(10, 10).motion).toBeCloseTo(1, 12)
  })

  it('rejects a distance at the horizon or beyond the release distance', () => {
    expect(() => stretchFactorSteps(10, 1)).toThrow(RangeError)
    expect(() => stretchFactorSteps(10, 11)).toThrow(RangeError)
  })
})

describe('the received wavelength', () => {
  it('equals the lamp\'s wavelength times the stretch factor', () => {
    for (const [r0, r] of [[10, 7], [10, 2], [100, 5], [2, 1.5], [20, 1.001]]) {
      expect(receivedWavelengthNm(r0, r)).toBeCloseTo(LAMP_WAVELENGTH_NM * stretchFactor(r0, r), 9)
    }
  })

  it('equals the lamp\'s wavelength times 1 + z found from the traveler\'s speed, not from the module\'s own formula', () => {
    for (const r0 of [2, 5, 10, 100]) {
      for (const fraction of [0.99, 0.7, 0.3, 0.05, 0.001]) {
        const r = 1 + (r0 - 1) * fraction
        closeTo(receivedWavelengthNm(r0, r), LAMP_WAVELENGTH_NM * redshiftFactorFromSpeed(r0, r), 1e-9)
      }
    }
  })

  it('only grows as the traveler falls from the release toward the horizon', () => {
    for (const r0 of [2, 10, 100]) {
      let previous = receivedWavelengthNm(r0, r0)
      for (let i = 1; i <= 60; i++) {
        const r = 1 + (r0 - 1) * 10 ** (-(i * 5) / 60) // from the release down to a gap of 1e-5 of the release gap
        const now = receivedWavelengthNm(r0, r)
        expect(now).toBeGreaterThan(previous)
        previous = now
      }
    }
  })

  it('has no limit near the horizon: each tenfold closing multiplies it by 10, and wavelength x (r - 1) approaches 550 x 2E', () => {
    const r0 = 10
    const energy = Math.sqrt(1 - 1 / r0)
    for (const [a, b] of [[1.01, 1.001], [1.001, 1.0001], [1.0001, 1.00001]]) {
      closeTo(receivedWavelengthNm(r0, b) / receivedWavelengthNm(r0, a), 10, 0.01)
    }
    for (const r of [1.01, 1.001, 1.0001]) closeTo(receivedWavelengthNm(r0, r) * (r - 1), LAMP_WAVELENGTH_NM * 2 * energy, 0.01)
  })

  it('matches the specification\'s illustrative table (a fall from 10 horizon radii)', () => {
    closeTo(receivedWavelengthNm(10, 10), 580, 0.005)
    closeTo(receivedWavelengthNm(10, 7), 742, 0.005)
    closeTo(receivedWavelengthNm(10, 5), 870, 0.005)
    closeTo(receivedWavelengthNm(10, 2), 1739, 0.005)
    closeTo(receivedWavelengthNm(10, 1.01), 105_000, 0.005)
    closeTo(receivedWavelengthNm(10, 1.0001), 10_400_000, 0.005)
  })

  it('has a period of about 1.83 x 10^-15 seconds for the lamp, and rejects a wavelength that is not positive and finite', () => {
    closeTo(lightPeriodSeconds(550), 550e-9 / 299_792_458, 1e-9) // wavelength in meters / speed of light in m/s
    for (const bad of [0, -5, Number.NaN, Infinity]) {
      expect(() => lightPeriodSeconds(bad)).toThrow(RangeError)
      expect(() => bandOf(bad)).toThrow(RangeError)
      expect(() => distanceWhereWavelengthPasses(10, bad)).toThrow(RangeError)
    }
  })
})

describe('where the light passes 750 nm', () => {
  it('is at 12.74, 9.24, 6.83 and 4.43 horizon radii for releases at 100, 20, 10 and 5', () => {
    for (const [r0, expected] of [[100, 12.74], [20, 9.24], [10, 6.83], [5, 4.43]]) {
      expect(Math.abs((distanceWhereWavelengthPasses(r0, 750) as number) - expected)).toBeLessThan(0.01)
    }
  })

  it('is already past at the release when released at 2 (778 nm), so there is no such distance', () => {
    expect(distanceWhereWavelengthPasses(2, 750)).toBeNull()
    closeTo(receivedWavelengthNm(2, 2), 778, 0.001)
  })

  it('gives a distance that, put back into the received wavelength, gives 750 nm', () => {
    for (const r0 of [5, 10, 20, 100]) {
      const r = distanceWhereWavelengthPasses(r0, 750) as number
      closeTo(receivedWavelengthNm(r0, r), 750, 1e-4)
    }
  })

  it('also finds where it passes 1 mm and 1 m, close to the specification\'s table', () => {
    const gap = (r0: number, nm: number) => (distanceWhereWavelengthPasses(r0, nm) as number) - 1
    closeTo(gap(10, 1e6), 0.00104, 0.01)
    closeTo(gap(2, 1e6), 0.00078, 0.01)
    closeTo(gap(10, 1e9), 1.04e-6, 0.02)
  })

  it('is the release distance itself or none when the wavelength is already reached at the release', () => {
    expect(distanceWhereWavelengthPasses(10, 500)).toBeNull()
    expect(distanceWhereWavelengthPasses(10, 550)).toBeNull()
  })
})

describe('the bands', () => {
  it('puts 380, 550 and 750 nm in the visible band, just above 750 nm in the infrared, and 300 nm in the ultraviolet', () => {
    expect(bandOf(380)).toBe('visible')
    expect(bandOf(550)).toBe('visible')
    expect(bandOf(750)).toBe('visible')
    expect(bandOf(750.001)).toBe('infrared')
    expect(bandOf(1000)).toBe('infrared')
    expect(bandOf(300)).toBe('ultraviolet')
  })

  it('puts 1 mm and 10 mm in the microwave band and 1 m and longer in the radio band', () => {
    expect(bandOf(999_999)).toBe('infrared')
    expect(bandOf(5e5)).toBe('infrared')
    expect(bandOf(1e6)).toBe('microwave')
    expect(bandOf(999_999_999)).toBe('microwave')
    expect(bandOf(1e7)).toBe('microwave')
    expect(bandOf(1e9)).toBe('radio')
    expect(bandOf(1e10)).toBe('radio')
  })

  it('has bands that join up, in order, with no gap or overlap', () => {
    for (let i = 1; i < BANDS.length; i++) expect(BANDS[i].fromNm).toBe(BANDS[i - 1].toNm)
  })
})

describe('the experiment as run', () => {
  it('gives the same wavelengths for the three black holes at the same release distance; only the kilometers differ', () => {
    const [a, b, c] = BLACK_HOLE_PRESETS.map((p) => runColorOfTheFallExperiment(p.id, 10))
    expect(a.curve).toEqual(b.curve)
    expect(b.curve).toEqual(c.curve)
    expect(a.wavelengthAtReleaseNm).toBe(b.wavelengthAtReleaseNm)
    expect(a.horizonRadiusKm).toBeLessThan(b.horizonRadiusKm)
    expect(b.horizonRadiusKm).toBeLessThan(c.horizonRadiusKm)
  })

  it('has a curve from the release gap to 0.0001, in order, whose wavelengths grow and whose bands move on', () => {
    const run = runColorOfTheFallExperiment('stellar-black-hole', 10)
    expect(run.curve[0].gap).toBeCloseTo(9, 9)
    expect(run.curve.at(-1)!.gap).toBeCloseTo(SMALLEST_GAP_IN_HORIZON_RADII, 12)
    for (let i = 1; i < run.curve.length; i++) expect(run.curve[i].wavelengthNm).toBeGreaterThan(run.curve[i - 1].wavelengthNm)
    expect(run.curve[0].band).toBe('visible')
    expect(run.curve.at(-1)!.band).toBe('microwave')
    closeTo(run.curve.at(-1)!.wavelengthNm, 10_436_000, 0.001)
  })

  it('reports the wavelength at release, where it leaves the visible range and where it becomes microwave', () => {
    const run = runColorOfTheFallExperiment('sgr-a-star', 10)
    closeTo(run.wavelengthAtReleaseNm, 579.8, 0.001)
    expect(Math.abs((run.leavesVisibleAt as number) - 6.83)).toBeLessThan(0.01)
    closeTo(run.becomesMicrowaveAtGap, 0.00104, 0.01)
    expect(runColorOfTheFallExperiment('m87-star', 2).leavesVisibleAt).toBeNull()
  })

  it('does not reach radio within the drawn range (it needs about 0.000001), for any release distance', () => {
    for (const start of [2, 5, 10, 20, 100]) {
      expect(runColorOfTheFallExperiment('stellar-black-hole', start).curve.every((p) => p.band !== 'radio')).toBe(true)
    }
  })

  it('works at the ends of the controls\' range', () => {
    for (const start of [MIN_START_IN_HORIZON_RADII, MAX_START_IN_HORIZON_RADII]) {
      const run = runColorOfTheFallExperiment('stellar-black-hole', start)
      expect(Number.isFinite(run.curve.at(-1)!.wavelengthNm)).toBe(true)
      expect(run.curve[0].wavelengthNm).toBeCloseTo(run.wavelengthAtReleaseNm, 6)
    }
  })

  it('rejects a release distance outside 2 to 100 or not finite, and an unknown black hole', () => {
    for (const bad of [1, 1.5, 101, 0, -3, Number.NaN, Infinity]) {
      expect(() => runColorOfTheFallExperiment('stellar-black-hole', bad)).toThrow(RangeError)
    }
    expect(() => runColorOfTheFallExperiment('sun' as never, 10)).toThrow()
  })
})

describe('determinism and playback speed', () => {
  it('gives the same result for the same inputs', () => {
    expect(runColorOfTheFallExperiment('sgr-a-star', 20)).toEqual(runColorOfTheFallExperiment('sgr-a-star', 20))
  })

  it('uses no wall-clock time or randomness, so playback speed cannot change a result (CLAUDE.md §11)', () => {
    expect(source).not.toMatch(/performance\.now|Date\.now|new Date|Math\.random|requestAnimationFrame|setTimeout/)
  })
})

describe('the fixed Part 1 fall', () => {
  it('is the 10-Sun black hole released from rest at 10 horizon radii, and is the same object each time', () => {
    const part = runPartOne()
    expect(part.preset.id).toBe('stellar-black-hole')
    expect(part.startInHorizonRadii).toBe(10)
    expect(PART_ONE_START_IN_HORIZON_RADII).toBe(10)
    expect(runPartOne()).toBe(part)
  })

  it('gives 580 nm at the release, leaves visible light at 6.83 and ends at about 10.4 mm in the microwave band', () => {
    const row = partOneRow()
    closeTo(row.wavelengthAtReleaseNm, 579.8, 0.001)
    expect(row.bandAtRelease).toBe('visible')
    closeTo(row.leavesVisibleAt as number, 6.83, 0.001)
    closeTo(row.endWavelengthNm, 10.436e6, 0.001)
    expect(row.endBand).toBe('microwave')
    expect(curveEnd().gap).toBeCloseTo(SMALLEST_GAP_IN_HORIZON_RADII, 12)
  })
})

describe('guess 1: the color the observer receives', () => {
  it('is "redder with no limit" in the model, and only that choice is marked as matching', () => {
    expect(modelColorAnswer()).toBe('no-limit')
    expect(colorGuessIsModelAnswer('no-limit')).toBe(true)
    for (const wrong of ['same', 'bluer', 'limit'] as const) expect(colorGuessIsModelAnswer(wrong)).toBe(false)
  })

  it('gives a different marker for each answer', () => {
    const kinds = (['same', 'bluer', 'limit', 'no-limit'] as const).map((c) => colorGuessMarker(c).kind)
    expect(new Set(kinds).size).toBe(4)
    expect(kinds).toEqual(['at-lamp', 'left-of-lamp', 'stop-bar', 'arrow-to-right-edge'])
  })

  it('has a curve that would be called "no limit" at every release distance from 2 to 100', () => {
    for (const r of [2, 5, 10, 20, 100]) expect(modelColorAnswer(runColorOfTheFallExperiment('stellar-black-hole', r))).toBe('no-limit')
  })
})

describe('guess 2: whether the light stays visible', () => {
  it('is "well before the horizon" for the fall from 10, because the light passes 750 nm 5.83 horizon radii above the horizon', () => {
    expect(modelVisibleAnswer()).toBe('well-before')
    expect(visibleGuessIsModelAnswer('well-before')).toBe(true)
    expect(visibleGuessIsModelAnswer('all-the-way')).toBe(false)
    expect(visibleGuessIsModelAnswer('near-horizon')).toBe(false)
  })

  it('is "well before" also when the light is already past 750 nm at the release (a release at 2)', () => {
    expect(modelVisibleAnswer(runColorOfTheFallExperiment('stellar-black-hole', 2))).toBe('well-before')
  })

  it('gives a different marker for each answer', () => {
    expect(visibleGuessMarker('all-the-way').kind).toBe('right-end')
    expect(visibleGuessMarker('near-horizon').kind).toBe('near-right-end')
    expect(visibleGuessMarker('well-before').kind).toBe('left-half')
  })
})

describe('guess 3: the color at 5 horizon radii for two black holes', () => {
  it('has two columns of 870 nm, the same wavelength, at different distances in kilometers', () => {
    const [small, big] = massPanelColumns()
    expect(small.presetId).toBe('stellar-black-hole')
    expect(big.presetId).toBe('m87-star')
    closeTo(small.wavelengthNm, 869.6, 0.001)
    expect(small.wavelengthNm).toBe(big.wavelengthNm)
    expect(MASS_PANEL_DISTANCE_IN_HORIZON_RADII).toBe(5)
    closeTo(big.distanceKm / small.distanceKm, 6.5e9 / 10, 1e-9)
  })

  it('is "no, the same" in the model, and only that choice is marked as matching', () => {
    expect(modelMassAnswer()).toBe('same')
    expect(massGuessIsModelAnswer('same')).toBe(true)
    expect(massGuessIsModelAnswer('small')).toBe(false)
    expect(massGuessIsModelAnswer('big')).toBe(false)
  })

  it('would mark the longer column, or "the same" within 1 percent, if the two columns ever differed', () => {
    expect(massAnswerFromWavelengths(870, 870)).toBe('same')
    expect(massAnswerFromWavelengths(870, 875)).toBe('same')
    expect(massAnswerFromWavelengths(1000, 870)).toBe('small')
    expect(massAnswerFromWavelengths(870, 1000)).toBe('big')
  })

  it('gives a different marker for each answer', () => {
    expect(massGuessMarker('same').target).toBe('both-columns')
    expect(massGuessMarker('small').target).toBe('small-column')
    expect(massGuessMarker('big').target).toBe('big-column')
  })
})

describe('the worked calculation and the near-horizon readings', () => {
  it('works at 5 horizon radii from a release above 5, and halfway down the gap otherwise', () => {
    expect(workedDistance(10)).toBe(5)
    expect(workedDistance(100)).toBe(5)
    expect(workedDistance(5)).toBe(3)
    expect(workedDistance(2)).toBe(1.5)
    closeTo(workedSteps(10).wavelengthNm, 869.6, 0.001)
  })

  it('reads 105 micrometers, 1.04 millimeters and 10.4 millimeters at gaps of 0.01, 0.001 and 0.0001, with the bands', () => {
    const [a, b, c] = nearHorizonReadings(10)
    closeTo(a.wavelengthNm, 105.1e3, 0.001)
    closeTo(b.wavelengthNm, 1.04e6, 0.005)
    closeTo(c.wavelengthNm, 10.4e6, 0.005)
    expect([a.band, b.band, c.band]).toEqual(['infrared', 'microwave', 'microwave'])
  })

  it('is ten times longer at each tenfold closing of the gap, to within the gap', () => {
    for (const ratio of wavelengthRatiosPerTenfoldGap(10)) closeTo(ratio, 10, 0.02)
  })
})

describe('the check-up', () => {
  it('has four rows, each reading "the same"', () => {
    const rows = checkUpRows()
    expect(rows).toHaveLength(4)
    for (const row of rows) expect(row.reading).toBe('the same')
  })

  it('compares the wavelength two ways, the period ratio with the stretch factor, the release value, and the tenfold rule', () => {
    const [wavelength, period, release, tenfold] = checkUpRows()
    closeTo(wavelength.found, 869.6, 0.001)
    closeTo(period.found, 1.5811, 0.0001)
    closeTo(release.expected, 579.8, 0.001)
    expect(tenfold.expected).toBe(10)
    expect(Math.abs(tenfold.percentAbove)).toBeLessThan(1)
    expect(Number(tenfold.found.toPrecision(2))).toBe(tenfold.expected)
    expect(Number(wavelength.found.toPrecision(6))).toBe(Number(wavelength.expected.toPrecision(6)))
    expect(Number(period.found.toPrecision(6))).toBe(Number(period.expected.toPrecision(6)))
    expect(Number(release.found.toPrecision(6))).toBe(Number(release.expected.toPrecision(6)))
  })

  it('reads a number against a reference without a cut-off: the same only when equal to the figures shown', () => {
    expect(readAgainstRounded(1.5811, 1.5811, 6)).toBe('the same')
    expect(readAgainstRounded(1.6, 1.5, 3)).toBe('more')
    expect(readAgainstRounded(1.4, 1.5, 3)).toBe('less')
    closeTo(100 + percentAbove(110, 100), 110, 1e-12)
  })
})

describe('a fall in one row', () => {
  it('gives the same wavelengths for the three black holes and different kilometers', () => {
    const small = fallRow(runColorOfTheFallExperiment('stellar-black-hole', 10))
    const big = fallRow(runColorOfTheFallExperiment('m87-star', 10))
    expect(small.wavelengthAtReleaseNm).toBe(big.wavelengthAtReleaseNm)
    expect(small.endWavelengthNm).toBe(big.endWavelengthNm)
    expect(big.startKm).toBeGreaterThan(small.startKm)
  })
})

describe('reuse (CLAUDE.md §8)', () => {
  it('imports from blackHoleSizeExperiment and from none of the other experiments\' modules, Experiment 6\'s included', () => {
    const importLines = source.split('\n').filter((line: string) => line.trim().startsWith('import'))
    const from = (name: string) => importLines.filter((line: string) => line.includes(name)).join(' ')
    expect(from('blackHoleSizeExperiment')).toContain('horizonRadiusKm')
    expect(from('blackHoleSizeExperiment')).toContain('OBJECT_PRESETS')
    for (const other of [
      'seeingTheFallExperiment',
      'fallingInExperiment',
      'timeNearBlackHoleExperiment',
      'orbitsNearBlackHoleExperiment',
      'lightNearBlackHoleExperiment',
      'blackHoleExperiment',
      'orbitExperiment',
      'hubblesLawExperiment',
    ]) {
      expect(importLines.some((line: string) => line.includes(`/${other}'`))).toBe(false)
    }
  })
})
