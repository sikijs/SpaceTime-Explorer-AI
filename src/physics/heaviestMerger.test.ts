import { describe, it, expect } from 'vitest'
import { readFileSync } from 'node:fs'
import {
  GAP_MEASURED_LOW_SOLAR,
  GAP_THEORY_SOLAR,
  exampleMerger,
  GW231123,
  ladder,
  massRuler,
  merge,
  mergedRealSolar,
  mergerCheckUp,
  MASS_CHOICES_SOLAR,
  POSSIBLE_CHOICES,
  possibleAnswer,
  possibleMarker,
  RADIATED_SHARE,
  ROUND_CHOICES,
  SIMPLE_MERGER_SPIN,
  spinAnswer,
  spinGaps,
  SPIN_GUESS_CHOICES,
  spinGuessGap,
  spinRange,
  spinPicture,
  pushGrowth,
  climbFacts,
  possibleGuessResult,
  spinGuessResult,
  gapPosition,
  massGapRows,
  ORIGIN_FIGURES,
  rangeOverlapsGap,
  shareComparison,
  logPosition,
  trialPicture,
  LOG_AXIS_MAX_SOLAR,
  LOG_AXIS_MIN_SOLAR,
  SPIN_AXIS_MAX,
  spinScale,
  trial,
  zoneOf,
  guessSpin,
  realTotalSolar,
} from './heaviestMerger'

describe('merging', () => {
  it('two black holes of 40 Suns make 76, smaller than the sum (test 1)', () => {
    expect(merge(40, 40)).toBeCloseTo(76, 6)
    expect(merge(40, 40)).toBeLessThan(80)
  })

  it('with no radiated share the masses simply add, and a share takes that fraction of the total off', () => {
    expect(merge(30, 50, 0)).toBe(80)
    expect(merge(30, 50, 0.25)).toBeCloseTo(60, 9)
  })

  it('uses the 5 percent share by default', () => {
    expect(RADIATED_SHARE).toBe(0.05)
    expect(merge(100, 100)).toBeCloseTo(190, 9)
  })

  it('rejects masses that are not positive and shares outside 0 to below 1', () => {
    expect(() => merge(0, 10)).toThrow(RangeError)
    expect(() => merge(10, -1)).toThrow(RangeError)
    expect(() => merge(10, 10, 1)).toThrow(RangeError)
    expect(() => merge(10, 10, -0.1)).toThrow(RangeError)
    expect(() => merge(Number.NaN, 10)).toThrow(RangeError)
  })
})

describe('the gap', () => {
  it('names the zone of 30, 76, 137 and 206 Suns (test 2)', () => {
    expect(zoneOf(30)).toBe('below')
    expect(zoneOf(76)).toBe('in')
    expect(zoneOf(137)).toBe('above')
    expect(zoneOf(206)).toBe('above')
  })

  it('counts both edges, 60 and 130, as inside the gap', () => {
    expect(zoneOf(59.999)).toBe('below')
    expect(zoneOf(60)).toBe('in')
    expect(zoneOf(130)).toBe('in')
    expect(zoneOf(130.001)).toBe('above')
  })

  it('holds the theory edges and the measured lower edge as separate numbers', () => {
    expect(GAP_THEORY_SOLAR).toEqual({ low: 60, high: 130 })
    expect(GAP_MEASURED_LOW_SOLAR).toEqual({ value: 44, plus: 5, minus: 4 })
  })
})

describe('climbing', () => {
  it('30 Suns climbs 30, 57, 108.3, 205.77 (about 205.8), and the count of original black holes is 1, 2, 4, 8 (test 3)', () => {
    const steps = ladder(30, 3)
    expect(steps.map((s) => s.massSolar)).toEqual([30, 57, 108.3, 205.77].map((x) => expect.closeTo(x, 6)))
    expect(steps.map((s) => s.originalCount)).toEqual([1, 2, 4, 8])
    expect(steps.map((s) => s.zone)).toEqual(['below', 'below', 'in', 'above'])
    expect(steps.map((s) => s.generation)).toEqual([0, 1, 2, 3])
  })

  it('20 Suns ends at 137.18 (about 137.2) after three rounds, always rises, and doubling the start doubles every step (test 4)', () => {
    const a = ladder(20, 3)
    expect(a[3].massSolar).toBeCloseTo(137.18, 6)
    for (let i = 1; i < a.length; i++) expect(a[i].massSolar).toBeGreaterThan(a[i - 1].massSolar)
    const b = ladder(40, 3)
    for (let i = 0; i < a.length; i++) expect(b[i].massSolar).toBeCloseTo(2 * a[i].massSolar, 6)
  })

  it('each step is the merge of two equal black holes from the step before', () => {
    const steps = ladder(40, 4)
    for (let i = 1; i < steps.length; i++) {
      expect(steps[i].massSolar).toBeCloseTo(merge(steps[i - 1].massSolar, steps[i - 1].massSolar), 6)
    }
  })

  it('zero rounds is just the starting black hole, and bad rounds are rejected', () => {
    expect(ladder(30, 0)).toHaveLength(1)
    expect(() => ladder(30, -1)).toThrow(RangeError)
    expect(() => ladder(30, 1.5)).toThrow(RangeError)
  })
})

describe('the real event (test 5)', () => {
  it('holds the published values', () => {
    expect(GW231123.masses[0]).toEqual({ value: 137, plus: 22, minus: 17 })
    expect(GW231123.masses[1]).toEqual({ value: 103, plus: 20, minus: 52 })
    expect(GW231123.spins[0].value).toBe(0.9)
    expect(GW231123.spins[1].value).toBe(0.8)
    expect(GW231123.redshift.value).toBe(0.39)
    expect(GW231123.lighterInGapPercent).toBe(83)
    expect(GW231123.totalRangeSolar).toEqual([190, 265])
    expect(GW231123.finalRangeSolar).toEqual([182, 251])
  })

  it('the two masses sum to 240, inside the published total range', () => {
    const c = mergerCheckUp()
    expect(realTotalSolar()).toBe(240)
    expect(c.totalSolar).toBe(240)
    expect(c.totalInRange).toBe(true)
  })

  it('the arithmetic on the real masses gives 228, inside the published final range', () => {
    const c = mergerCheckUp()
    expect(mergedRealSolar()).toBeCloseTo(228, 6)
    expect(c.mergedInRange).toBe(true)
  })

  it('a share large enough to push the merged mass out of the final range is reported as outside', () => {
    expect(mergedRealSolar(0.25)).toBeLessThan(GW231123.finalRangeSolar[0])
  })

  it('the rough subtraction of best fits gives 15 Suns, 6.25 percent of 240', () => {
    const c = mergerCheckUp()
    expect(c.impliedRadiatedSolar).toBe(15)
    expect(c.impliedRadiatedShare).toBeCloseTo(0.0625, 9)
  })
})

describe('the spins (test 6)', () => {
  it('the simple-merger spin is 0.686 and the gaps to the measured spins are about 0.21 and 0.11', () => {
    expect(SIMPLE_MERGER_SPIN).toBe(0.686)
    const g = spinGaps()
    expect(g.gaps[0]).toBeCloseTo(0.214, 9)
    expect(g.gaps[1]).toBeCloseTo(0.114, 9)
    expect(g.measured).toEqual([0.9, 0.8])
  })

  it('the measured ranges run 0.71 to 1.0 and 0.29 to 1.0, and never pass 1', () => {
    const a = spinRange(0)
    const b = spinRange(1)
    expect(a[0]).toBeCloseTo(0.71, 9)
    expect(a[1]).toBe(1)
    expect(b[0]).toBeCloseTo(0.29, 9)
    expect(b[1]).toBe(1)
  })
})

describe('the trial values (test 7)', () => {
  it('40 Suns after 1 round is 76 and lands in the gap', () => {
    const t = trial(40, 1)
    expect(t.finalSolar).toBeCloseTo(76, 6)
    expect(t.finalZone).toBe('in')
    expect(t.firstInGapGeneration).toBe(1)
  })

  it('every control setting follows the ladder, and the first generation in the gap is found', () => {
    for (const m of MASS_CHOICES_SOLAR) {
      for (const r of ROUND_CHOICES) {
        const t = trial(m, r)
        const steps = ladder(m, r)
        expect(t.steps).toEqual(steps)
        expect(t.finalSolar).toBe(steps[r].massSolar)
        const first = steps.find((s) => s.zone === 'in')
        expect(t.firstInGapGeneration).toBe(first ? first.generation : null)
      }
    }
  })

  it('50 Suns jumps over the gap (50 to 95 to 180.5): the first round already lands in it, the second above', () => {
    const t = trial(50, 2)
    expect(t.steps.map((s) => s.zone)).toEqual(['below', 'in', 'above'])
  })

  it('a climb that never reaches the gap reports null', () => {
    expect(trial(20, 1).firstInGapGeneration).toBeNull()
  })
})

describe('the predictions (test 8)', () => {
  it('prediction 1: two black holes below the gap can merge into one inside it, so the answer is yes', () => {
    expect(possibleAnswer()).toBe('yes')
    expect(POSSIBLE_CHOICES).toContain(possibleAnswer())
  })

  it('the markers follow the guess: no is below not sure, which is below yes', () => {
    expect(possibleMarker('no')).toBe(-1)
    expect(possibleMarker('unsure')).toBe(0)
    expect(possibleMarker('yes')).toBe(1)
  })

  it('prediction 2: 0.7 is the button nearest 0.686, and three buttons are below it and three at or above', () => {
    expect(spinAnswer()).toBe(0.7)
    expect(SPIN_GUESS_CHOICES.filter((c) => c < SIMPLE_MERGER_SPIN)).toHaveLength(3)
    expect(SPIN_GUESS_CHOICES.filter((c) => c > SIMPLE_MERGER_SPIN)).toHaveLength(3)
  })

  it('the spin mark follows the guess, and different guesses give different marks', () => {
    const marks = SPIN_GUESS_CHOICES.map((c) => guessSpin(c))
    expect(new Set(marks).size).toBe(SPIN_GUESS_CHOICES.length)
    expect(guessSpin(0.3)).toBe(0.3)
  })

  it('the gap from the simple-merger value is the guess minus 0.686, with no verdict', () => {
    expect(spinGuessGap(0.9).fromSimple).toBeCloseTo(0.214, 9)
    expect(spinGuessGap(0.1).fromSimple).toBeCloseTo(-0.586, 9)
    expect(Object.keys(spinGuessGap(0.5))).toEqual(['guess', 'fromSimple'])
  })

  it('a guess never changes any real value', () => {
    const before = JSON.stringify([massRuler(), spinScale(), mergerCheckUp(), spinGaps()])
    spinGuessGap(0.99)
    possibleMarker('no')
    expect(JSON.stringify([massRuler(), spinScale(), mergerCheckUp(), spinGaps()])).toBe(before)
  })
})

describe('the worked example on Picture 1', () => {
  it('two black holes of 40 Suns are below the gap, sum to 80, lose 4 and make 76, which is inside it', () => {
    const e = exampleMerger()
    expect(e.startSolar).toBe(40)
    expect(e.sumSolar).toBe(80)
    expect(e.radiatedSolar).toBeCloseTo(4, 9)
    expect(e.resultSolar).toBeCloseTo(76, 9)
    expect(e.startZone).toBe('below')
    expect(e.resultZone).toBe('in')
  })

  it('agrees with merge, with the radiated share and with the prediction answer', () => {
    const e = exampleMerger()
    expect(e.resultSolar).toBe(merge(e.startSolar, e.startSolar))
    expect(e.share).toBe(RADIATED_SHARE)
    expect(e.sumSolar - e.radiatedSolar).toBeCloseTo(e.resultSolar, 9)
    expect(possibleAnswer()).toBe(e.startZone === 'below' && e.resultZone === 'in' ? 'yes' : 'no')
  })
})

describe('the pictures', () => {
  it('the mass ruler puts the heavier black hole and the final one above the gap and the lighter one in it', () => {
    const r = massRuler()
    expect(r.marks.map((m) => m.zone)).toEqual(['above', 'in', 'above'])
    expect(r.marks[1].lowSolar).toBe(51)
    expect(r.marks[1].highSolar).toBe(123)
    expect(r.axisMaxSolar).toBeGreaterThanOrEqual(r.marks[2].highSolar)
    expect(r.lighterInGapPercent).toBe(83)
  })

  it('the spin scale holds the simple-merger value and both measured spins with their ranges', () => {
    const s = spinScale()
    expect(s.simple).toBe(0.686)
    expect(s.measured.map((m) => m.value)).toEqual([0.9, 0.8])
    expect(s.measured[1].low).toBeCloseTo(0.29, 9)
  })
})

describe('Picture 2: the spins', () => {
  it('has the measured spins and ranges, the simple-merger value and the gaps', () => {
    const p = spinPicture()
    expect(p.axisMax).toBe(SPIN_AXIS_MAX)
    expect(p.simple).toBe(0.686)
    expect(p.rows.map((r) => r.value)).toEqual([0.9, 0.8])
    expect(p.rows[0].low).toBeCloseTo(0.71, 9)
    expect(p.rows[0].high).toBe(1)
    expect(p.rows[1].low).toBeCloseTo(0.29, 9)
    expect(p.rows[0].gapFromSimple).toBeCloseTo(0.214, 9)
    expect(p.rows[1].gapFromSimple).toBeCloseTo(0.114, 9)
  })

  it('the heavier black hole’s range stays above 0.686 and the lighter one’s reaches down past it', () => {
    const p = spinPicture()
    expect(p.rows[0].rangeIncludesSimple).toBe(false)
    expect(p.rows[1].rangeIncludesSimple).toBe(true)
  })

  it('every guess button lies inside the scale, and the answer button is the one nearest the simple-merger value', () => {
    for (const c of SPIN_GUESS_CHOICES) {
      expect(c).toBeGreaterThan(0)
      expect(c).toBeLessThanOrEqual(SPIN_AXIS_MAX)
    }
    expect(spinAnswer()).toBe(0.7)
  })
})

describe('Drawing A: the learner’s climb', () => {
  it('the log scale puts 10 Suns at 0, 100 at one half and 1,000 at 1, and rises with mass', () => {
    expect(logPosition(LOG_AXIS_MIN_SOLAR)).toBeCloseTo(0, 9)
    expect(logPosition(100)).toBeCloseTo(0.5, 9)
    expect(logPosition(LOG_AXIS_MAX_SOLAR)).toBeCloseTo(1, 9)
    expect(logPosition(60)).toBeLessThan(logPosition(130))
  })

  it('every control setting stays on the scale', () => {
    for (const m of MASS_CHOICES_SOLAR) {
      for (const r of ROUND_CHOICES) {
        const t = trialPicture(m, r)
        for (const row of t.rows) {
          expect(row.position).toBeGreaterThanOrEqual(0)
          expect(row.position).toBeLessThanOrEqual(1)
        }
      }
    }
  })

  it('30 Suns and 3 rounds: 30, 57, 108.3, 205.77 with sums 60, 114, 216.6 and radiated 3, 5.7, 10.83', () => {
    const t = trialPicture(30, 3)
    expect(t.rows.map((r) => r.massSolar)).toEqual([30, 57, 108.3, 205.77].map((x) => expect.closeTo(x, 6)))
    expect(t.rows[0].sumSolar).toBeNull()
    expect(t.rows[1].sumSolar).toBeCloseTo(60, 9)
    expect(t.rows[2].sumSolar).toBeCloseTo(114, 9)
    expect(t.rows[3].sumSolar).toBeCloseTo(216.6, 9)
    expect(t.rows[1].radiatedSolar).toBeCloseTo(3, 9)
    expect(t.rows[3].radiatedSolar).toBeCloseTo(10.83, 9)
    expect(t.startingCount).toBe(8)
    expect(t.inGapCount).toBe(1)
    expect(t.finalZone).toBe('above')
  })

  it('agrees with the trial and the ladder at every control setting', () => {
    for (const m of MASS_CHOICES_SOLAR) {
      for (const r of ROUND_CHOICES) {
        const p = trialPicture(m, r)
        const t = trial(m, r)
        expect(p.finalSolar).toBe(t.finalSolar)
        expect(p.finalZone).toBe(t.finalZone)
        expect(p.rows.map((x) => x.massSolar)).toEqual(t.steps.map((x) => x.massSolar))
        expect(p.startingCount).toBe(2 ** r)
      }
    }
  })

  it('compares the last black hole with the heavier real one (40 Suns, 3 rounds: 274.36 ÷ 137 = 2.0026)', () => {
    const p = trialPicture(40, 3)
    expect(p.finalSolar).toBeCloseTo(274.36, 6)
    expect(p.finalOverHeavier).toBeCloseTo(274.36 / 137, 9)
  })

  it('holds the gap edges and the real black holes on the same scale, in order', () => {
    const p = trialPicture(40, 1)
    expect(p.gapPositions.low).toBeCloseTo(logPosition(60), 9)
    expect(p.gapPositions.high).toBeCloseTo(logPosition(130), 9)
    expect(p.realTicks.map((t) => t.massSolar)).toEqual([103, 137, 225])
    expect(p.realTicks[0].position).toBeLessThan(p.realTicks[1].position)
    expect(p.realTicks[1].position).toBeLessThan(p.realTicks[2].position)
  })

  it('the real ticks and the gap do not change with the settings', () => {
    const base = JSON.stringify([trialPicture(40, 1).realTicks, trialPicture(40, 1).gapPositions])
    for (const m of MASS_CHOICES_SOLAR) {
      for (const r of ROUND_CHOICES) {
        const t = trialPicture(m, r)
        expect(JSON.stringify([t.realTicks, t.gapPositions])).toBe(base)
      }
    }
  })

  it('the number of black holes in the gap equals the count of in-gap rows', () => {
    const p = trialPicture(20, 3)
    expect(p.rows.map((r) => r.zone)).toEqual(['below', 'below', 'in', 'above'])
    expect(p.inGapCount).toBe(1)
    expect(trialPicture(20, 1).inGapCount).toBe(0)
  })
})

describe('Part 3: the results', () => {
  it('places each mass against the theory band and the measured lower edge', () => {
    const lighter = gapPosition(103)
    expect(lighter.zone).toBe('in')
    expect(lighter.aboveBandSolar).toBeNull()
    expect(lighter.belowBandSolar).toBeNull()
    expect(lighter.overMeasuredEdgeSolar).toBe(59)
    const heavier = gapPosition(137)
    expect(heavier.zone).toBe('above')
    expect(heavier.aboveBandSolar).toBe(7)
    expect(gapPosition(40).belowBandSolar).toBe(20)
    expect(gapPosition(40).overMeasuredEdgeSolar).toBe(-4)
  })

  it('says whether a range overlaps the band: the heavier 120 to 159 and the lighter 51 to 123 do, the final 182 to 251 does not', () => {
    expect(rangeOverlapsGap(120, 159)).toBe(true)
    expect(rangeOverlapsGap(51, 123)).toBe(true)
    expect(rangeOverlapsGap(182, 251)).toBe(false)
    expect(rangeOverlapsGap(10, 59.9)).toBe(false)
    expect(rangeOverlapsGap(10, 60)).toBe(true)
  })

  it('the three real black holes, in rows', () => {
    const rows = massGapRows()
    expect(rows.map((r) => r.massSolar)).toEqual([137, 103, 225])
    expect(rows.map((r) => r.position.zone)).toEqual(['above', 'in', 'above'])
    expect(rows.map((r) => r.rangeOverlapsBand)).toEqual([true, true, false])
  })

  it('compares the assumed 5 percent with the 6.25 percent from the best estimates: 1.25 points apart', () => {
    const c = shareComparison()
    expect(c.assumedPercent).toBeCloseTo(5, 9)
    expect(c.impliedPercent).toBeCloseTo(6.25, 9)
    expect(c.differencePoints).toBeCloseTo(1.25, 9)
  })

  it('for the four starting masses of Part 2, the first merged black hole is in the same zone at the implied share as at the assumed one', () => {
    const implied = shareComparison().impliedPercent / 100
    for (const m of MASS_CHOICES_SOLAR) {
      expect(zoneOf(merge(m, m, implied))).toBe(zoneOf(merge(m, m)))
    }
  })

  it('holds the published figures for the explanations', () => {
    expect(ORIGIN_FIGURES.hierarchicalClusterChancePercent).toBe(5)
    expect(ORIGIN_FIGURES.firstGenerationCounts).toEqual([6, 4])
    expect(ORIGIN_FIGURES.lensedTotalRangeSolar).toEqual([100, 180])
    expect(ORIGIN_FIGURES.lensingFalseAlarmBelowPercent).toBe(1)
    expect(ORIGIN_FIGURES.overlappingBayesFactorRange).toEqual([100, 10000])
  })
})

describe('Part 4: the tutor', () => {
  it('marks Prediction 1: yes matches, no does not, not sure is neither', () => {
    expect(possibleGuessResult('yes')).toEqual({ guess: 'yes', real: 'yes', matched: true, unsure: false })
    expect(possibleGuessResult('no').matched).toBe(false)
    expect(possibleGuessResult('no').unsure).toBe(false)
    expect(possibleGuessResult('unsure').matched).toBe(false)
    expect(possibleGuessResult('unsure').unsure).toBe(true)
  })

  it('marks Prediction 2: only the button nearest 0.686 matches, and the difference from it is exact', () => {
    for (const c of SPIN_GUESS_CHOICES) {
      expect(spinGuessResult(c).matched).toBe(c === 0.7)
    }
    expect(spinGuessResult(0.7).nearest).toBe(0.7)
    expect(spinGuessResult(0.7).fromSimple).toBeCloseTo(0.014, 9)
    expect(spinGuessResult(0.1).fromSimple).toBeCloseTo(-0.586, 9)
  })

  it('one equal merger multiplies the mass by 1.9, the band is 2.17 times as wide as it is low, and so a climb cannot jump over it', () => {
    const f = climbFacts()
    expect(f.stepFactor).toBeCloseTo(1.9, 9)
    expect(f.bandRatio).toBeCloseTo(130 / 60, 9)
    expect(f.jumpOverMassSolar).toBeCloseTo(130 / 1.9, 6)
    expect(f.landsInGapAlways).toBe(true)
    expect(f.twentyAfterThree).toBeCloseTo(137.18, 6)
    expect(f.twentyStartingCount).toBe(8)
  })

  it('with no share lost the step is exactly 2, which is still shorter than the band is wide, so the climb still cannot jump over it', () => {
    expect(climbFacts(0).stepFactor).toBe(2)
    expect(climbFacts(0).landsInGapAlways).toBe(true)
  })

  it('a climb that starts below the band lands in it at least once, for every starting mass below it and for the learner’s share', () => {
    for (let m = 1; m < 60; m += 1.5) {
      const steps = ladder(m, 12)
      expect(steps.some((s) => s.zone === 'in')).toBe(true)
    }
  })
})

describe('the two pushes that hold a star up', () => {
  it('doubling the temperature doubles the gas’s push and makes the light’s push 16 times as large', () => {
    const g = pushGrowth(2)
    expect(g.gasFactor).toBe(2)
    expect(g.lightFactor).toBe(16)
  })

  it('light’s push grows faster than the gas’s for any factor above 1, and they agree at 1', () => {
    expect(pushGrowth(1).lightFactor).toBe(pushGrowth(1).gasFactor)
    for (const f of [1.5, 2, 3, 10]) expect(pushGrowth(f).lightFactor).toBeGreaterThan(pushGrowth(f).gasFactor)
  })

  it('rejects a factor that is not positive', () => {
    expect(() => pushGrowth(0)).toThrow(RangeError)
    expect(() => pushGrowth(-2)).toThrow(RangeError)
  })
})

describe('the module', () => {
  it('imports nothing', () => {
    const src = readFileSync(new URL('./heaviestMerger.ts', import.meta.url), 'utf8')
    expect(src).not.toMatch(/^import /m)
  })
})
