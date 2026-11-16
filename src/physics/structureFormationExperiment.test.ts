import { describe, expect, it } from 'vitest'
import {
  CLUMP_THRESHOLD,
  GROWTH_AXIS_MAX,
  GROWTH_GUESS_VALUES,
  HEAD_START_ARROW_DECADES,
  HEAD_START_EXAMPLE_DELTA,
  PLANCK_Z_DRAG,
  PLANCK_Z_EQ_RANGE,
  PLANCK_Z_STAR_RANGE,
  TEXTBOOK_LINEAR_COLLAPSE_THRESHOLD,
  actualGrowthGuess,
  captionNumbers,
  checkUp,
  dragRedshiftNote,
  growthApproximationSinceStart,
  growthCurve,
  growthDistanceInDecades,
  growthGuessMark,
  growthGuessMatches,
  growthSuppressionApproximation,
  headStartDecades,
  headStartExample,
  headStartFactor,
  headStartGuessMarker,
  markGrowthGuess,
  markHeadStartGuess,
  startFacts,
  workedExamples,
  yourRegion,
  MATTER_RADIATION_EQUALITY_REDSHIFT,
  MAX_START_DELTA,
  MIN_START_DELTA,
  RECOMBINATION_REDSHIFT,
  START_SIZE_PRESETS,
  densityExcessAt,
  growthBetween,
  growthFactor,
  requiredStartDelta,
  runStructureFormationExperiment,
} from './structureFormationExperiment'
import { BEST_FIT_DARK_ENERGY_FRACTION } from './darkEnergyExperiment'
import { universeAgeYears } from './universeAgeExperiment'
import { RECOMBINATION_REDSHIFT as EXPERIMENT_3_RECOMBINATION_REDSHIFT } from './cosmicMicrowaveBackgroundExperiment'

const L = BEST_FIT_DARK_ENERGY_FRACTION
const relativeError = (a: number, b: number) => Math.abs(a - b) / Math.abs(b)

describe('growth factor of a small density excess', () => {
  it('equals the universe relative size exactly when there is no dark energy', () => {
    for (const a of [0.0003, 0.001, 0.01, 0.1, 0.5, 1]) {
      expect(relativeError(growthFactor(a, 0), a)).toBeLessThan(1e-9)
    }
  })

  it('is within 0.1% of the relative size at early times, even with dark energy', () => {
    expect(relativeError(growthFactor(0.001, L), 0.001)).toBeLessThan(1e-3)
  })

  it('matches the values worked out for the specification', () => {
    // Independent literal values from the specification's table (Hubble constant 70, 70% dark energy).
    expect(relativeError(growthBetween(0.5, 0, L), 1.3)).toBeLessThan(0.05)
    expect(relativeError(growthBetween(2, 0, L), 2.4)).toBeLessThan(0.05)
    expect(relativeError(growthBetween(10, 0, L), 8.6)).toBeLessThan(0.02)
    expect(relativeError(growthBetween(RECOMBINATION_REDSHIFT, 0, L), 850)).toBeLessThan(0.01)
    expect(relativeError(growthBetween(MATTER_RADIATION_EQUALITY_REDSHIFT, 0, L), 2650)).toBeLessThan(0.01)
  })

  it('stays below the full size ratio when there is dark energy, and equals it when there is none', () => {
    for (const z of [0.5, 2, 10, RECOMBINATION_REDSHIFT]) {
      expect(growthBetween(z, 0, L)).toBeLessThan(1 + z)
      expect(relativeError(growthBetween(z, 0, 0), 1 + z)).toBeLessThan(1e-9)
    }
  })

  it('increases with the size ratio and decreases as the dark energy share increases', () => {
    const zs = [0.5, 2, 10, 100, RECOMBINATION_REDSHIFT]
    for (let i = 1; i < zs.length; i++) {
      expect(growthBetween(zs[i], 0, L)).toBeGreaterThan(growthBetween(zs[i - 1], 0, L))
    }
    const shares = [0, 0.3, 0.5, 0.7, 0.9]
    for (let i = 1; i < shares.length; i++) {
      expect(growthBetween(RECOMBINATION_REDSHIFT, 0, shares[i])).toBeLessThan(
        growthBetween(RECOMBINATION_REDSHIFT, 0, shares[i - 1]),
      )
    }
  })

  it('is accurate at the default number of steps compared with a much finer integration', () => {
    for (const a of [1 / (1 + RECOMBINATION_REDSHIFT), 0.1, 1]) {
      expect(relativeError(growthFactor(a, L), growthFactor(a, L, 400_000))).toBeLessThan(1e-3)
    }
  })

  it('gives dark matter a head start of about 3 over ordinary matter, by the ratio of the two growths', () => {
    const ordinary = growthBetween(RECOMBINATION_REDSHIFT, 0, L)
    const dark = growthBetween(MATTER_RADIATION_EQUALITY_REDSHIFT, 0, L)
    expect(dark).toBeGreaterThan(ordinary)
    const a = runStructureFormationExperiment('ordinary', 1e-4)
    const b = runStructureFormationExperiment('ordinary-plus-dark', 1e-4)
    expect(relativeError(b.densityExcessToday / a.densityExcessToday, dark / ordinary)).toBeLessThan(1e-9)
    expect(dark / ordinary).toBeGreaterThan(3)
    expect(dark / ordinary).toBeLessThan(3.2)
  })
})

describe('density excess of a ripple', () => {
  it('returns the starting excess exactly at (and before) the start, and scales linearly with it', () => {
    expect(densityExcessAt(RECOMBINATION_REDSHIFT, RECOMBINATION_REDSHIFT, 1e-4, L)).toBe(1e-4)
    expect(densityExcessAt(5000, RECOMBINATION_REDSHIFT, 1e-4, L)).toBe(1e-4)
    const small = densityExcessAt(2, RECOMBINATION_REDSHIFT, 1e-5, L)
    const big = densityExcessAt(2, RECOMBINATION_REDSHIFT, 1e-3, L)
    expect(relativeError(big / small, 100)).toBeLessThan(1e-9)
  })
})

describe('required starting size and clumps', () => {
  it('requires one divided by the growth since the start, about 1 part in 850 and 1 part in 2,650', () => {
    for (const z of [RECOMBINATION_REDSHIFT, MATTER_RADIATION_EQUALITY_REDSHIFT]) {
      expect(relativeError(requiredStartDelta(z, L), CLUMP_THRESHOLD / growthBetween(z, 0, L))).toBeLessThan(1e-12)
    }
    expect(relativeError(1 / requiredStartDelta(RECOMBINATION_REDSHIFT, L), 850)).toBeLessThan(0.01)
    expect(relativeError(1 / requiredStartDelta(MATTER_RADIATION_EQUALITY_REDSHIFT, L), 2650)).toBeLessThan(0.01)
  })

  it('becomes a clump exactly when the start is at least the required size, for both kinds of matter', () => {
    for (const kind of ['ordinary', 'ordinary-plus-dark'] as const) {
      const required = runStructureFormationExperiment(kind, 1e-4).requiredStartDelta
      expect(runStructureFormationExperiment(kind, required * 0.999).becameClump).toBe(false)
      expect(runStructureFormationExperiment(kind, required * 1.001).becameClump).toBe(true)
      expect(runStructureFormationExperiment(kind, required * 1.001).redshiftOfClump).not.toBeNull()
    }
  })

  it('reports the first redshift at which the excess reaches the threshold', () => {
    const result = runStructureFormationExperiment('ordinary-plus-dark', 1e-3)
    expect(result.becameClump).toBe(true)
    const z = result.redshiftOfClump as number
    expect(z).toBeGreaterThan(0)
    expect(z).toBeLessThan(result.startRedshift)
    expect(relativeError(densityExcessAt(z, result.startRedshift, 1e-3, L), CLUMP_THRESHOLD)).toBeLessThan(1e-6)
    // The excess is below the threshold at every earlier curve point.
    for (const point of result.curve.filter((p) => p.redshift > z)) {
      expect(point.densityExcess).toBeLessThan(CLUMP_THRESHOLD)
    }
  })

  it('shows a visible contrast across the presets: one clumps with ordinary matter, one only with dark matter, two with neither', () => {
    const outcome = (startDelta: number) => ({
      ordinary: runStructureFormationExperiment('ordinary', startDelta).becameClump,
      dark: runStructureFormationExperiment('ordinary-plus-dark', startDelta).becameClump,
    })
    const results = START_SIZE_PRESETS.map((p) => outcome(p.startDelta))
    expect(results.filter((r) => r.ordinary && r.dark)).toHaveLength(1)
    expect(results.filter((r) => !r.ordinary && r.dark)).toHaveLength(1)
    expect(results.filter((r) => !r.ordinary && !r.dark)).toHaveLength(2)
    expect(MIN_START_DELTA).toBe(START_SIZE_PRESETS[0].startDelta)
    expect(MAX_START_DELTA).toBe(START_SIZE_PRESETS[START_SIZE_PRESETS.length - 1].startDelta)
  })

  it('reports the other kind of matter\'s required start for comparison', () => {
    const a = runStructureFormationExperiment('ordinary', 1e-4)
    const b = runStructureFormationExperiment('ordinary-plus-dark', 1e-4)
    expect(a.requiredStartDeltaOtherMatter).toBe(b.requiredStartDelta)
    expect(b.requiredStartDeltaOtherMatter).toBe(a.requiredStartDelta)
    expect(b.requiredStartDelta).toBeLessThan(a.requiredStartDelta)
  })
})

describe('experiment result', () => {
  it('has a curve from the start to today that only grows, ending at today with the age of the universe', () => {
    const result = runStructureFormationExperiment('ordinary', 1e-3)
    const first = result.curve[0]
    const last = result.curve[result.curve.length - 1]
    expect(first.redshift).toBeCloseTo(RECOMBINATION_REDSHIFT, 6)
    expect(first.growth).toBeCloseTo(1, 9)
    expect(last.redshift).toBe(0)
    expect(relativeError(last.yearsAfterBigBang, universeAgeYears(L))).toBeLessThan(1e-9)
    expect(relativeError(last.growth, result.growthSinceStart)).toBeLessThan(1e-12)
    for (let i = 1; i < result.curve.length; i++) {
      expect(result.curve[i].growth).toBeGreaterThan(result.curve[i - 1].growth)
      expect(result.curve[i].yearsAfterBigBang).toBeGreaterThan(result.curve[i - 1].yearsAfterBigBang)
    }
  })

  it('reports growth without dark energy as exactly 1 + the start redshift', () => {
    const result = runStructureFormationExperiment('ordinary', 1e-3)
    expect(relativeError(result.growthWithoutDarkEnergy, 1 + RECOMBINATION_REDSHIFT)).toBeLessThan(1e-9)
    expect(result.growthSinceStart).toBeLessThan(result.growthWithoutDarkEnergy)
  })
})

describe('the two fixed starts of Part 1', () => {
  it('gives the growth for each kind of matter, with no starting size', () => {
    const o = startFacts('ordinary')
    const d = startFacts('ordinary-plus-dark')
    expect(o.startRedshift).toBe(RECOMBINATION_REDSHIFT)
    expect(d.startRedshift).toBe(MATTER_RADIATION_EQUALITY_REDSHIFT)
    expect(relativeError(o.growthSinceStart, 849.7)).toBeLessThan(0.001)
    expect(relativeError(d.growthSinceStart, 2649.3)).toBeLessThan(0.001)
    expect(relativeError(o.growthWithoutDarkEnergy, 1090.8)).toBeLessThan(1e-9)
    expect(relativeError(d.growthWithoutDarkEnergy, 3401)).toBeLessThan(1e-9)
    expect(relativeError(o.requiredStartDelta, 1 / 849.7)).toBeLessThan(0.001)
  })

  it('puts the starts at about 472 and 86 thousand years after the Big Bang in this model', () => {
    expect(Math.abs(startFacts('ordinary').startYearsAfterBigBang - 471_931)).toBeLessThan(5)
    expect(Math.abs(startFacts('ordinary-plus-dark').startYearsAfterBigBang - 85_721)).toBeLessThan(5)
    const n = captionNumbers()
    expect(n.ordinaryStartThousandYears).toBe(472)
    expect(n.darkStartThousandYears).toBe(86)
  })

  it('gives a growth curve that does not depend on the starting size, ends at today and rises', () => {
    for (const kind of ['ordinary', 'ordinary-plus-dark'] as const) {
      const curve = growthCurve(kind)
      const last = curve[curve.length - 1]
      expect(last.redshift).toBe(0)
      expect(relativeError(last.growth, startFacts(kind).growthSinceStart)).toBeLessThan(1e-12)
      expect(relativeError(last.growthWithoutDarkEnergy, startFacts(kind).growthWithoutDarkEnergy)).toBeLessThan(1e-9)
      for (let i = 1; i < curve.length; i++) {
        expect(curve[i].growth).toBeGreaterThanOrEqual(curve[i - 1].growth)
        expect(curve[i].growthWithoutDarkEnergy).toBeGreaterThanOrEqual(curve[i].growth * 0.999999)
      }
      for (const delta of [MIN_START_DELTA, 1e-3, MAX_START_DELTA]) {
        expect(runStructureFormationExperiment(kind, delta).curve.map((p) => p.growth)).toEqual(curve.map((p) => p.growth))
      }
    }
  })
})

describe('what the model gives for each guess', () => {
  it('the growth answer nearest to about 850 on a log scale is "about 1,000 times"', () => {
    expect(actualGrowthGuess()).toBe('thousand')
    expect(growthGuessMatches('thousand')).toBe(true)
    expect(growthGuessMatches('ten')).toBe(false)
    expect(growthGuessMatches('million')).toBe(false)
    expect(Math.abs(growthDistanceInDecades('thousand') - 0.07)).toBeLessThan(0.005)
    expect(Math.abs(growthDistanceInDecades('ten') - 1.93)).toBeLessThan(0.005)
    expect(Math.abs(growthDistanceInDecades('million') - 3.07)).toBeLessThan(0.005)
  })

  it('the head start is a factor of about 3.1, 0.49 of a decade, and decides the 1-part-in-1,000 example', () => {
    expect(Math.abs(headStartFactor() - 3.118)).toBeLessThan(0.005)
    expect(Math.abs(headStartDecades() - 0.494)).toBeLessThan(0.005)
    const e = headStartExample()
    expect(e.startDelta).toBe(HEAD_START_EXAMPLE_DELTA)
    expect(relativeError(e.ordinaryExcessToday, 0.85)).toBeLessThan(0.01)
    expect(relativeError(e.darkExcessToday, 2.65)).toBeLessThan(0.01)
    expect(e.ordinaryBecameClump).toBe(false)
    expect(e.darkBecameClump).toBe(true)
    expect(e.decides).toBe(true)
  })
})

describe('the white guess marks', () => {
  it('guess 1: a tick at 10 and at 1,000 times on the growth axis; an edge arrow with no position for a million', () => {
    expect(growthGuessMark('ten')).toEqual({ kind: 'tick', atTimesGrown: 10 })
    expect(growthGuessMark('thousand')).toEqual({ kind: 'tick', atTimesGrown: 1000 })
    const million = growthGuessMark('million')
    expect(million).toEqual({ kind: 'edge-arrow', direction: 'up', hasPosition: false })
    expect(Object.keys(million)).not.toContain('atTimesGrown')
    expect(GROWTH_GUESS_VALUES.million).toBeGreaterThan(GROWTH_AXIS_MAX)
    expect(GROWTH_GUESS_VALUES.thousand).toBeLessThan(GROWTH_AXIS_MAX)
  })

  it('guess 1 answers give three different marks', () => {
    expect(new Set((['ten', 'thousand', 'million'] as const).map((g) => JSON.stringify(growthGuessMark(g)))).size).toBe(3)
  })

  it('guess 2: a ring for no difference, a short arrow for a small difference, a longer arrow for it would decide', () => {
    expect(headStartGuessMarker('none')).toEqual({ kind: 'ring', lengthDecades: 0 })
    expect(headStartGuessMarker('small').kind).toBe('short-arrow')
    expect(headStartGuessMarker('decides').kind).toBe('long-arrow')
    expect(HEAD_START_ARROW_DECADES.small).toBeGreaterThan(0)
    expect(HEAD_START_ARROW_DECADES.decides).toBeGreaterThan(HEAD_START_ARROW_DECADES.small)
    expect(new Set((['none', 'small', 'decides'] as const).map((g) => JSON.stringify(headStartGuessMarker(g)))).size).toBe(3)
  })
})

describe('what the tutor says about each guess', () => {
  it('marks guess 1 with the growth numbers', () => {
    const right = markGrowthGuess('thousand')
    expect(right.matches).toBe(true)
    expect(right.guessedTimes).toBe(1000)
    expect(relativeError(right.ordinaryGrowth, 849.7)).toBeLessThan(0.001)
    expect(markGrowthGuess('ten').matches).toBe(false)
    expect(markGrowthGuess('million').matches).toBe(false)
    expect(markGrowthGuess('ten').actual).toBe('thousand')
  })

  it('marks guess 2 as the owner approved: only "no difference" is marked off, the other two are partly', () => {
    expect(markHeadStartGuess('none').marking).toBe('not')
    expect(markHeadStartGuess('small').marking).toBe('partly')
    expect(markHeadStartGuess('decides').marking).toBe('partly')
    const m = markHeadStartGuess('small')
    expect(Math.abs(m.headStartFactor - 3.118)).toBeLessThan(0.005)
    expect(relativeError(m.ordinaryGrowth, 849.7)).toBeLessThan(0.001)
    expect(relativeError(m.darkGrowth, 2649.3)).toBeLessThan(0.001)
    expect(m.example.decides).toBe(true)
  })
})

describe('the Carroll, Press and Turner (1992) approximation', () => {
  it('gives g = 0.778 for 0.3 and 0.7, and exactly 1 with no dark energy', () => {
    expect(Math.abs(growthSuppressionApproximation(0.7) - 0.7779)).toBeLessThan(5e-4)
    expect(growthSuppressionApproximation(0)).toBeCloseTo(1, 12)
  })

  it('gives 848.6 since the oldest light, within 0.2 percent of the exact integral, and 1 + z with no dark energy', () => {
    const approx = growthApproximationSinceStart(RECOMBINATION_REDSHIFT)
    expect(Math.abs(approx - 848.6)).toBeLessThan(0.2)
    expect(relativeError(growthBetween(RECOMBINATION_REDSHIFT, 0, L), approx)).toBeLessThan(0.002)
    expect(growthApproximationSinceStart(RECOMBINATION_REDSHIFT, 0)).toBeCloseTo(1 + RECOMBINATION_REDSHIFT, 9)
  })
})

describe('the check-up (Table 1)', () => {
  const rows = checkUp()
  const row = (id: string) => rows.find((r) => r.id === id)!

  it('has the five rows a to e', () => {
    expect(rows.map((r) => r.id)).toEqual(['a', 'b', 'c', 'd', 'e'])
  })

  it('(a) the exact growth is a little more than the approximation, by about 1.1 (0.13 percent)', () => {
    expect(row('a').reading).toBe('more')
    expect(Math.abs(row('a').difference! - 1.1)).toBeLessThan(0.15)
    expect(Math.abs(row('a').percent! - 0.13)).toBeLessThan(0.02)
  })

  it('(b) the growth with dark energy is 22.1 percent less than without', () => {
    expect(row('b').reading).toBe('less')
    expect(Math.abs(row('b').percent! + 22.1)).toBeLessThan(0.1)
    expect(relativeError(row('b').comparedWith!, 1090.8)).toBeLessThan(1e-9)
  })

  it('(c) the head start is calculated here only, with its factor', () => {
    expect(row('c').reading).toBe('calculated here only')
    expect(row('c').factor).toBeCloseTo(headStartFactor(), 12)
    expect(row('c').percent).toBeNull()
  })

  it("(d) and (e) the model's two redshifts lie within Planck 2018's ranges", () => {
    expect(row('d').reading).toBe('within the published range')
    expect(row('d').model).toBe(RECOMBINATION_REDSHIFT)
    expect(row('d').publishedLow).toBe(PLANCK_Z_STAR_RANGE.low)
    expect(row('e').reading).toBe('within the published range')
    expect(row('e').model).toBe(MATTER_RADIATION_EQUALITY_REDSHIFT)
    expect(row('e').publishedLow).toBe(PLANCK_Z_EQ_RANGE.low)
    expect(PLANCK_Z_EQ_RANGE.low).toBeLessThan(MATTER_RADIATION_EQUALITY_REDSHIFT)
    expect(PLANCK_Z_EQ_RANGE.high).toBeGreaterThan(MATTER_RADIATION_EQUALITY_REDSHIFT)
  })
})

describe("Table 2 and the learner's own region", () => {
  it('compares the starting size with the size needed', () => {
    const o = startFacts('ordinary')
    expect(yourRegion('ordinary', 1e-3).againstRequired).toBe('smaller')
    expect(yourRegion('ordinary', 2e-3).againstRequired).toBe('bigger')
    expect(yourRegion('ordinary-plus-dark', 1e-3).againstRequired).toBe('bigger')
    expect(yourRegion('ordinary', o.requiredStartDelta).againstRequired).toBe('the same')
  })

  it('takes every number from the model and follows the learner\'s two settings', () => {
    const a = yourRegion('ordinary-plus-dark', 1e-3)
    const direct = runStructureFormationExperiment('ordinary-plus-dark', 1e-3)
    expect(a.densityExcessToday).toBe(direct.densityExcessToday)
    expect(a.becameClump).toBe(true)
    expect(Math.abs(a.redshiftOfClump! - 2.36)).toBeLessThan(0.02)
    expect(yourRegion('ordinary', 1e-5).becameClump).toBe(false)
    expect(yourRegion('ordinary', 1e-5)).not.toEqual(yourRegion('ordinary-plus-dark', 1e-5))
  })
})

describe("the pictures' own numbers and the worked examples", () => {
  const n = captionNumbers()
  const w = workedExamples()

  it('gives the end values, the head start and the share dark energy takes away', () => {
    expect(relativeError(n.ordinaryGrowth, 849.7)).toBeLessThan(0.001)
    expect(relativeError(n.darkGrowth, 2649.3)).toBeLessThan(0.001)
    expect(Math.abs(n.lostToDarkEnergyPercent - 22.1)).toBeLessThan(0.1)
    expect(Math.abs(n.hundredThousandOrdinaryPartsIn - 118)).toBeLessThan(0.5)
    expect(Math.abs(n.hundredThousandDarkPartsIn - 38)).toBeLessThan(0.5)
  })

  it('works the examples: 110 grains, 1 part in 10, 0.85 and 1 part in 850', () => {
    expect(w.grainsInRegion).toBeCloseTo(110, 9)
    expect(w.smallEndDelta).toBeCloseTo(0.1, 12)
    expect(relativeError(w.exampleOrdinaryExcess, 0.85)).toBeLessThan(0.01)
    expect(Math.abs(w.requiredPartsIn - 849.7)).toBeLessThan(0.5)
    expect(relativeError(w.ordinaryWithoutDarkEnergy, 1090.8)).toBeLessThan(1e-9)
    expect(relativeError(w.darkWithoutDarkEnergy, 3401)).toBeLessThan(1e-9)
  })

  it('works out the effect of starting at the baryon drag redshift: 826.5, 2.7 percent less', () => {
    const d = dragRedshiftNote()
    expect(d.dragRedshift).toBe(PLANCK_Z_DRAG)
    expect(Math.abs(d.growthFromDrag - 826.5)).toBeLessThan(0.3)
    expect(Math.abs(d.percentLess - 2.73)).toBeLessThan(0.05)
    expect(d.growthFromDrag).toBeLessThan(d.growthFromOldestLight)
  })

  it('keeps the model\'s clump line at 1 and the textbook value for comparison only', () => {
    expect(CLUMP_THRESHOLD).toBe(1)
    expect(TEXTBOOK_LINEAR_COLLAPSE_THRESHOLD).toBe(1.686)
  })
})

describe('constants and imports', () => {
  it('restates the oldest light\'s redshift equal to Experiment 3\'s own', () => {
    expect(RECOMBINATION_REDSHIFT).toBe(EXPERIMENT_3_RECOMBINATION_REDSHIFT)
  })

  it('imports from the earlier experiments rather than redefining, and not from Experiment 3', async () => {
    const source = await import('node:fs/promises').then((fs) =>
      fs.readFile(new URL('./structureFormationExperiment.ts', import.meta.url), 'utf-8'),
    )
    const imports = [...source.matchAll(/import\s*\{([^}]*)\}\s*from\s*'([^']+)'/g)].map((m) => ({
      names: m[1],
      module: m[2],
    }))
    const from = (name: string) =>
      imports
        .filter((i) => i.module.includes(name))
        .map((i) => i.names)
        .join(' ')
    expect(from('darkEnergyExperiment')).toContain('expansionRateRatio')
    expect(from('darkEnergyExperiment')).toContain('BEST_FIT_DARK_ENERGY_FRACTION')
    expect(from('observableUniverseExperiment')).toContain('timeAfterBigBangYears')
    expect(imports.some((i) => i.module.includes('cosmicMicrowaveBackgroundExperiment'))).toBe(false)
    expect(source).not.toMatch(/function\s+expansionRateRatio/)
    expect(source).not.toMatch(/function\s+timeAfterBigBangYears/)
  })
})
