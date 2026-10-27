import { describe, it, expect } from 'vitest'
import {
  SECONDS_PER_YEAR,
  METRES_PER_PARSEC,
  orbitalPeriodSeconds,
  binary,
  examplePair,
  EXAMPLE_PAIR,
  OBSERVING_SPAN_YEARS,
  lowestFrequencyHz,
  cyclesInSpan,
  fitsInSpan,
  NANOGRAV_15_YEAR,
  timingShiftSeconds,
  exampleTimingShiftSeconds,
  hellingsDowns,
  hellingsDownsMinimum,
  PUBLISHED_RESULTS,
  LIGO_REFERENCE,
  ligoCycleSeconds,
  cycleRulerPosition,
  shiftRulerPosition,
  CYCLE_CHOICES,
  cycleAnswer,
  cycleChoiceSeconds,
  cycleGuessResult,
  SHIFT_CHOICES_NANOSECONDS,
  shiftAnswer,
  shiftGuessResult,
  cycleGuessMarker,
  shiftGuessMarker,
  TRIAL_MASS_CHOICES_SOLAR,
  TRIAL_SEPARATION_CHOICES_PC,
  frequencyRulerPosition,
  trialPicture,
  pictureOne,
  AU_PER_PARSEC,
  PICTURE_ONE_TICKS_SECONDS,
  PICTURE_ONE_BAND_FADE_SECONDS,
  pictureTwo,
  PICTURE_TWO_TICKS_SECONDS,
  PULSE_PERIOD_EXAMPLE_SECONDS,
  separationAu,
  resultsCheckUp,
  exampleSteps,
  hellingsDownsRows,
  HELLINGS_DOWNS_ANGLES_DEGREES,
  nanohertzCycleYears,
} from './pulsarTimingBackground'

const G = 6.6743e-11
const SUN = 1.98847e30

describe('Kepler\'s law for two supermassive black holes', () => {
  it('gives 2.09 years for two 10^9-Sun black holes 0.01 parsecs apart, worked separately in SI units', () => {
    const a = 0.01 * 3.0856775814913673e16
    const m = 2e9 * SUN
    const period = 2 * Math.PI * Math.sqrt(a ** 3 / (G * m))
    expect(orbitalPeriodSeconds(1e9, 1e9, 0.01) / period).toBeCloseTo(1, 9)
    expect(orbitalPeriodSeconds(1e9, 1e9, 0.01) / SECONDS_PER_YEAR).toBeCloseTo(2.09, 2)
  })
  it('rises as the separation to the power 3/2 and falls as the square root of the total mass', () => {
    const base = orbitalPeriodSeconds(1e9, 1e9, 0.01)
    expect(orbitalPeriodSeconds(1e9, 1e9, 0.02) / base).toBeCloseTo(Math.pow(2, 1.5), 9)
    expect(orbitalPeriodSeconds(2e9, 2e9, 0.01) / base).toBeCloseTo(1 / Math.SQRT2, 9)
    expect(orbitalPeriodSeconds(1e9, 3e9, 0.01) / base).toBeCloseTo(Math.sqrt(2 / 4), 9)
  })
  it('rejects values that are not positive and finite', () => {
    expect(() => orbitalPeriodSeconds(0, 1e9, 0.01)).toThrow(RangeError)
    expect(() => orbitalPeriodSeconds(1e9, -1, 0.01)).toThrow(RangeError)
    expect(() => orbitalPeriodSeconds(1e9, 1e9, Infinity)).toThrow(RangeError)
  })
  it('keeps the parsec at 3.0857 x 10^16 metres', () => {
    expect(METRES_PER_PARSEC / 3.0857e16).toBeCloseTo(1, 4)
  })
})

describe('the wave', () => {
  it('has twice the orbital frequency, so one wave cycle is half an orbit: 1.05 years and 30.3 nanohertz for the example', () => {
    const e = examplePair()
    expect(e.waveCycleSeconds).toBeCloseTo(e.orbitalPeriodSeconds / 2, 6)
    expect(e.frequencyHz).toBeCloseTo(2 / e.orbitalPeriodSeconds, 18)
    expect(e.waveCycleYears).toBeCloseTo(1.047, 2)
    expect(e.frequencyNanohertz).toBeCloseTo(30.26, 1)
    expect(e.frequencyHz * e.waveCycleSeconds).toBeCloseTo(1, 12)
  })
  it('uses the example of the predictions', () => {
    expect(EXAMPLE_PAIR).toEqual({ massSolar: 1e9, separationPc: 0.01 })
    expect(binary(1e9, 1e9, 0.01).waveCycleSeconds).toBeCloseTo(examplePair().waveCycleSeconds, 3)
  })
})

describe('what a data set can pick out', () => {
  it('has a lowest frequency of 1 / the span: 2.1 nanohertz for 15 years', () => {
    expect(OBSERVING_SPAN_YEARS).toBe(15)
    expect(lowestFrequencyHz() * 1e9).toBeCloseTo(2.1125, 3)
    expect(lowestFrequencyHz(30) / lowestFrequencyHz(15)).toBeCloseTo(0.5, 12)
    expect(() => lowestFrequencyHz(0)).toThrow(RangeError)
  })
  it('counts the cycles in the span and flags a wave with less than one', () => {
    const e = examplePair()
    expect(cyclesInSpan(e)).toBeCloseTo(15 / 1.0474, 2)
    expect(fitsInSpan(e)).toBe(true)
    const slow = binary(1e9, 1e9, 0.1)
    expect(cyclesInSpan(slow)).toBeCloseTo(0.453, 2)
    expect(fitsInSpan(slow)).toBe(false)
    expect(fitsInSpan(slow, 40)).toBe(true)
  })
})

describe('the shift in arrival time', () => {
  it('is about 12 nanoseconds for the published strain of 2.4 x 10^-15 at 1 per year', () => {
    expect(exampleTimingShiftSeconds() * 1e9).toBeCloseTo(12.05, 1)
    expect(timingShiftSeconds(2.4e-15, 1 / SECONDS_PER_YEAR) * 1e9).toBeCloseTo((2.4e-15 * SECONDS_PER_YEAR) / (2 * Math.PI) * 1e9, 6)
  })
  it('rises in step with the strain and falls as the frequency rises', () => {
    const base = timingShiftSeconds(2.4e-15, 1e-8)
    expect(timingShiftSeconds(4.8e-15, 1e-8) / base).toBeCloseTo(2, 9)
    expect(timingShiftSeconds(2.4e-15, 2e-8) / base).toBeCloseTo(0.5, 9)
    expect(() => timingShiftSeconds(0, 1e-8)).toThrow(RangeError)
  })
  it('holds the published strain as listed', () => {
    expect(NANOGRAV_15_YEAR.strain).toBe(2.4e-15)
    expect(NANOGRAV_15_YEAR.strainPlus).toBe(0.7e-15)
    expect(NANOGRAV_15_YEAR.strainMinus).toBe(0.6e-15)
    expect(NANOGRAV_15_YEAR.pulsars).toBe(67)
  })
})

describe('the Hellings-Downs pattern', () => {
  it('is 0.5 at 0 degrees, 0.25 at 180 degrees and about -0.1449 at 90 degrees', () => {
    expect(hellingsDowns(0)).toBe(0.5)
    expect(hellingsDowns(180)).toBeCloseTo(0.25, 12)
    expect(hellingsDowns(90)).toBeCloseTo(0.75 * Math.log(0.5) - 0.125 + 0.5, 12)
    expect(hellingsDowns(90)).toBeCloseTo(-0.1449, 3)
  })
  it('has its lowest value, about -0.152, at about 82.5 degrees', () => {
    const m = hellingsDownsMinimum()
    expect(m.angleDegrees).toBeCloseTo(82.48, 1)
    expect(m.value).toBeCloseTo(-0.1519, 3)
    for (let t = 0; t <= 180; t += 5) expect(hellingsDowns(t)).toBeGreaterThanOrEqual(m.value - 1e-9)
  })
  it('falls from 0 degrees to the minimum and rises again to 180 degrees', () => {
    expect(hellingsDowns(30)).toBeLessThan(hellingsDowns(10))
    expect(hellingsDowns(60)).toBeLessThan(hellingsDowns(30))
    expect(hellingsDowns(82.5)).toBeLessThan(hellingsDowns(60))
    expect(hellingsDowns(120)).toBeGreaterThan(hellingsDowns(90))
    expect(hellingsDowns(180)).toBeGreaterThan(hellingsDowns(120))
  })
  it('rejects an angle outside 0 to 180 degrees', () => {
    expect(() => hellingsDowns(-1)).toThrow(RangeError)
    expect(() => hellingsDowns(181)).toThrow(RangeError)
  })
})

describe('the published results', () => {
  it('are held as listed: about 3.5 to 4, 3, 2 and 4.6 sigma, none at 5', () => {
    const by = Object.fromEntries(PUBLISHED_RESULTS.map((r) => [r.id, [r.sigmaLow, r.sigmaHigh]]))
    expect(by.nanograv).toEqual([3.5, 4])
    expect(by.epta).toEqual([3, 3])
    expect(by.ppta).toEqual([2, 2])
    expect(by.cpta).toEqual([4.6, 4.6])
    for (const r of PUBLISHED_RESULTS) expect(r.sigmaHigh).toBeLessThan(5)
  })
  it('place LIGO\'s waves (a few milliseconds to about 29 milliseconds a cycle) far to the left of the example pair on the ruler', () => {
    expect(LIGO_REFERENCE).toEqual({ lowHz: 35, peakHz: 250 })
    const l = ligoCycleSeconds()
    expect(l.longest).toBeCloseTo(0.02857, 4)
    expect(l.shortest).toBeCloseTo(0.004, 6)
    expect(cycleRulerPosition(l.longest)).toBeLessThan(cycleRulerPosition(examplePair().waveCycleSeconds) - 0.5)
  })
})

describe('the rulers', () => {
  it('put the ends at 0 and 1 and the example pair near 0.81', () => {
    expect(cycleRulerPosition(1e-3)).toBe(0)
    expect(cycleRulerPosition(1e10)).toBe(1)
    expect(cycleRulerPosition(examplePair().waveCycleSeconds)).toBeCloseTo((Math.log10(examplePair().waveCycleSeconds) + 3) / 13, 9)
    expect(shiftRulerPosition(1e-11)).toBe(0)
    expect(shiftRulerPosition(1e-2)).toBe(1)
    expect(shiftRulerPosition(exampleTimingShiftSeconds())).toBeCloseTo((Math.log10(exampleTimingShiftSeconds()) + 11) / 9, 9)
    expect(frequencyRulerPosition(0.1)).toBe(0)
    expect(frequencyRulerPosition(10000)).toBe(1)
  })
})

describe('the predictions', () => {
  it('answers "about a year" for the cycle and "10" nanoseconds for the shift', () => {
    expect(cycleAnswer()).toBe('year')
    expect(shiftAnswer()).toBe(10)
    expect(cycleGuessResult('year')).toBe('matched')
    for (const c of CYCLE_CHOICES.filter((x) => x.id !== 'year')) expect(cycleGuessResult(c.id)).toBe('not matched')
    expect(shiftGuessResult(10)).toBe('matched')
    for (const c of SHIFT_CHOICES_NANOSECONDS.filter((x) => x !== 10)) expect(shiftGuessResult(c)).toBe('not matched')
  })
  it('has cycle buttons on a log scale about a year, in rising order', () => {
    const s = CYCLE_CHOICES.map((c) => c.seconds)
    expect([...s].sort((a, b) => a - b)).toEqual(s)
    expect(cycleChoiceSeconds('year')).toBeCloseTo(SECONDS_PER_YEAR, 6)
    expect(cycleChoiceSeconds('decade') / cycleChoiceSeconds('year')).toBeCloseTo(10, 9)
    expect(cycleChoiceSeconds('century') / cycleChoiceSeconds('decade')).toBeCloseTo(10, 9)
    // the real value, 1.05 years, is nearer "a year" than "a decade" or "a month" on a log scale
    const real = examplePair().waveCycleSeconds
    expect(Math.abs(Math.log(real / cycleChoiceSeconds('year')))).toBeLessThan(Math.abs(Math.log(real / cycleChoiceSeconds('month'))))
  })
  it('draws each guess where it sits on its ruler, further right for a longer cycle or a bigger shift', () => {
    expect(cycleGuessMarker('century').position).toBeGreaterThan(cycleGuessMarker('year').position)
    expect(cycleGuessMarker('minute').position).toBeLessThan(cycleGuessMarker('day').position)
    expect(cycleGuessMarker('year').position).toBeCloseTo(cycleRulerPosition(SECONDS_PER_YEAR), 12)
    expect(shiftGuessMarker(1000).position).toBeGreaterThan(shiftGuessMarker(10).position)
    expect(shiftGuessMarker(10).seconds).toBeCloseTo(1e-8, 20)
    for (const c of SHIFT_CHOICES_NANOSECONDS) {
      expect(shiftGuessMarker(c).position).toBeGreaterThan(0)
      expect(shiftGuessMarker(c).position).toBeLessThan(1)
    }
  })
})

describe('Part 2: trial values', () => {
  it('reproduces the example pair for the example\'s own masses and separation', () => {
    const t = trialPicture(1e9, 0.01)
    expect(t.binary.waveCycleSeconds).toBeCloseTo(examplePair().waveCycleSeconds, 3)
    expect(t.frequencyOverExample).toBeCloseTo(1, 9)
    expect(t.fits).toBe(true)
    expect(trialPicture(1e10, 0.01).frequencyOverExample).toBeCloseTo(Math.sqrt(10), 9)
    expect(trialPicture(1e9, 0.1).frequencyOverExample).toBeCloseTo(Math.pow(10, -1.5), 9)
  })
  it('flags a wave with less than one cycle in 15 years and keeps every trial on the frequency ruler', () => {
    expect(trialPicture(1e9, 0.1).fits).toBe(false)
    expect(trialPicture(1e8, 0.1).fits).toBe(false)
    expect(trialPicture(1e10, 0.003).fits).toBe(true)
    for (const m of TRIAL_MASS_CHOICES_SOLAR) {
      for (const s of TRIAL_SEPARATION_CHOICES_PC) {
        const t = trialPicture(m, s)
        expect(t.frequencyPosition).toBeGreaterThan(0)
        expect(t.frequencyPosition).toBeLessThan(1)
        expect(t.fits).toBe(t.binary.frequencyNanohertz >= t.lowestNanohertz)
        expect(t.fits).toBe(t.frequencyPosition >= t.lowestPosition)
      }
    }
  })
  it('gives a faster wave for a heavier pair or a closer one', () => {
    expect(trialPicture(1e10, 0.01).binary.frequencyHz).toBeGreaterThan(trialPicture(1e9, 0.01).binary.frequencyHz)
    expect(trialPicture(1e9, 0.003).binary.frequencyHz).toBeGreaterThan(trialPicture(1e9, 0.01).binary.frequencyHz)
    expect(trialPicture(1e9, 0.01).binary.frequencyHz / trialPicture(1e9, 0.03).binary.frequencyHz).toBeCloseTo(Math.pow(3, 1.5), 9)
  })
})

describe('separation of the model from the guesses (CLAUDE.md §9, §14)', () => {
  it('gives the same results whatever the guesses are', () => {
    const before = JSON.stringify([examplePair(), exampleTimingShiftSeconds(), cycleAnswer(), shiftAnswer()])
    for (const c of CYCLE_CHOICES) cycleGuessResult(c.id)
    for (const c of SHIFT_CHOICES_NANOSECONDS) shiftGuessResult(c)
    expect(JSON.stringify([examplePair(), exampleTimingShiftSeconds(), cycleAnswer(), shiftAnswer()])).toBe(before)
  })
})

describe('Picture 1 (Step 4)', () => {
  it('puts the pair 0.01 parsecs apart, which is 2,063 times the Earth-Sun distance', () => {
    expect(AU_PER_PARSEC).toBeCloseTo(206264.8, 1)
    expect(pictureOne().separationAu).toBeCloseTo(2062.65, 1)
  })
  it('has two wave cycles in every orbit, so one cycle is half an orbit', () => {
    const p = pictureOne()
    expect(p.waveCyclesPerOrbit).toBeCloseTo(2, 12)
    expect(p.orbitsPerWaveCycle).toBeCloseTo(0.5, 12)
    expect(p.pair.orbitalPeriodYears / p.pair.waveCycleYears).toBeCloseTo(2, 12)
  })
  it('places LIGO\'s waves at 4 to 28.6 milliseconds a cycle, far to the left of the pair', () => {
    const p = pictureOne()
    expect(p.ligo.shortestSeconds).toBeCloseTo(0.004, 9)
    expect(p.ligo.longestSeconds).toBeCloseTo(1 / 35, 9)
    expect(p.ligo.shortestPosition).toBeLessThan(p.ligo.longestPosition)
    expect(p.ligo.longestPosition).toBeLessThan(p.pairPosition - 0.5)
    expect(p.ligo.shortestPosition).toBeCloseTo((Math.log10(0.004) + 3) / 13, 9)
  })
  it('says the pair\'s cycle is about 1.2 billion times LIGO\'s longest and 8.3 billion times its shortest', () => {
    const p = pictureOne()
    expect(p.pairOverLigoLongest / 1.156e9).toBeCloseTo(1, 2)
    expect(p.pairOverLigoShortest / 8.26e9).toBeCloseTo(1, 2)
    expect(p.pairOverLigoShortest).toBeGreaterThan(p.pairOverLigoLongest)
  })
  it('puts the longest cycle that 15 years can pick out at 15 years, with the pair inside the band', () => {
    const p = pictureOne()
    expect(p.span.longestCycleSeconds).toBeCloseTo(15 * SECONDS_PER_YEAR, 3)
    expect(p.span.longestCyclePosition).toBeCloseTo(cycleRulerPosition(15 * SECONDS_PER_YEAR), 12)
    expect(p.span.fadeEndPosition).toBeCloseTo(cycleRulerPosition(PICTURE_ONE_BAND_FADE_SECONDS), 12)
    expect(p.span.fadeEndPosition).toBeLessThan(p.pairPosition)
    expect(p.pairPosition).toBeLessThan(p.span.longestCyclePosition)
    expect(p.span.pairFits).toBe(true)
    expect(p.span.cyclesForPair).toBeCloseTo(14.32, 1)
  })
  it('has the pair on the ruler at the same place as its cycle length and ticks in rising order on the ruler', () => {
    expect(pictureOne().pairPosition).toBeCloseTo(cycleRulerPosition(examplePair().waveCycleSeconds), 12)
    const t = [...PICTURE_ONE_TICKS_SECONDS]
    expect(t.sort((a, b) => a - b)).toEqual([...PICTURE_ONE_TICKS_SECONDS])
    for (const x of PICTURE_ONE_TICKS_SECONDS) {
      expect(cycleRulerPosition(x)).toBeGreaterThanOrEqual(0)
      expect(cycleRulerPosition(x)).toBeLessThan(1)
    }
    expect(cycleRulerPosition(PICTURE_ONE_TICKS_SECONDS[0])).toBe(0)
  })
})

describe('Picture 2 (Step 5)', () => {
  it('gives the shift 12.05 nanoseconds for 2.4 x 10^-15 at 1 per year, and holds the published strain and frequency', () => {
    const p = pictureTwo()
    expect(p.strain).toBe(2.4e-15)
    expect(p.referenceFrequencyHz).toBeCloseTo(1 / SECONDS_PER_YEAR, 18)
    expect(p.shiftNanoseconds).toBeCloseTo(12.05, 1)
    expect(p.shiftSeconds).toBeCloseTo(exampleTimingShiftSeconds(), 18)
  })
  it('carries the strain\'s give-or-take (+0.7, -0.6) through to 9.0 and 15.6 nanoseconds, in proportion to the strain', () => {
    const p = pictureTwo()
    expect(p.strainLow).toBeCloseTo(1.8e-15, 20)
    expect(p.strainHigh).toBeCloseTo(3.1e-15, 20)
    expect(p.shiftLowSeconds * 1e9).toBeCloseTo(9.04, 1)
    expect(p.shiftHighSeconds * 1e9).toBeCloseTo(15.57, 1)
    expect(p.shiftLowSeconds / p.shiftSeconds).toBeCloseTo(1.8 / 2.4, 9)
    expect(p.shiftHighSeconds / p.shiftSeconds).toBeCloseTo(3.1 / 2.4, 9)
    expect(p.shiftLowPosition).toBeLessThan(p.shiftPosition)
    expect(p.shiftPosition).toBeLessThan(p.shiftHighPosition)
  })
  it('compares the shift with an example pulse every millisecond: about 83,000 times smaller', () => {
    const p = pictureTwo()
    expect(PULSE_PERIOD_EXAMPLE_SECONDS).toBe(1e-3)
    expect(p.pulsePeriodSeconds).toBe(1e-3)
    expect(p.pulsePeriodOverShift).toBeCloseTo(1e-3 / exampleTimingShiftSeconds(), 3)
    expect(p.pulsePeriodOverShift / 82963).toBeCloseTo(1, 2)
    expect(p.pulsePeriodPosition).toBeGreaterThan(p.shiftPosition)
  })
  it('places the shift near 0.67 on a ruler that runs from 0.01 nanoseconds to 10 milliseconds, with every tick on it', () => {
    const p = pictureTwo()
    expect(p.shiftPosition).toBeCloseTo((Math.log10(exampleTimingShiftSeconds()) + 11) / 9, 9)
    expect(p.pulsePeriodPosition).toBeCloseTo((-3 + 11) / 9, 9)
    const t = [...PICTURE_TWO_TICKS_SECONDS]
    expect(t.sort((a, b) => a - b)).toEqual([...PICTURE_TWO_TICKS_SECONDS])
    expect(shiftRulerPosition(PICTURE_TWO_TICKS_SECONDS[0])).toBe(0)
    expect(shiftRulerPosition(PICTURE_TWO_TICKS_SECONDS[PICTURE_TWO_TICKS_SECONDS.length - 1])).toBe(1)
  })
})

describe('Part 2: the separation buttons in Earth-Sun distances (Step 6)', () => {
  it('gives about 620, 2,060, 6,190 and 20,600 Earth-Sun distances for 0.003, 0.01, 0.03 and 0.1 parsecs', () => {
    expect(separationAu(0.003)).toBeCloseTo(618.8, 1)
    expect(separationAu(0.01)).toBeCloseTo(2062.6, 1)
    expect(separationAu(0.03)).toBeCloseTo(6187.9, 1)
    expect(separationAu(0.1)).toBeCloseTo(20626.5, 1)
  })
  it('is proportional to the separation and rejects a non-positive one', () => {
    expect(separationAu(0.1) / separationAu(0.01)).toBeCloseTo(10, 9)
    expect(() => separationAu(0)).toThrow(RangeError)
  })
})

describe('Results (Step 7)', () => {
  it('check-up: the example pair has a 1.05-year cycle, 30.3 nHz, 14.3 times the lowest frequency 15 years can pick out (2.1 nHz)', () => {
    const c = resultsCheckUp()
    expect(c.cycleYears).toBeCloseTo(1.046, 2)
    expect(c.cycleSeconds).toBeCloseTo(examplePair().waveCycleSeconds, 3)
    expect(c.longestCycleYears).toBe(15)
    expect(c.cyclesInSpan).toBeCloseTo(14.3, 1)
    expect(c.frequencyNanohertz).toBeCloseTo(30.3, 1)
    expect(c.lowestNanohertz).toBeCloseTo(2.11, 2)
    expect(c.frequencyOverLowest).toBeCloseTo(14.3, 1)
    expect(c.frequencyOverLowest).toBeCloseTo(c.cyclesInSpan, 9)
  })
  it('check-up: the shift is 12.05 ns, with 9.0 and 15.6 ns from the strain\'s give-or-take, and the published strain is held as 2.4 (+0.7, -0.6) x 10^-15', () => {
    const c = resultsCheckUp()
    expect(c.shiftNanoseconds).toBeCloseTo(12.05, 1)
    expect(c.shiftLowNanoseconds).toBeCloseTo(9.04, 1)
    expect(c.shiftHighNanoseconds).toBeCloseTo(15.57, 1)
    expect(c.shiftLowNanoseconds).toBeLessThan(c.shiftNanoseconds)
    expect(c.shiftNanoseconds).toBeLessThan(c.shiftHighNanoseconds)
    expect([c.strain, c.strainPlus, c.strainMinus]).toEqual([2.4e-15, 0.7e-15, 0.6e-15])
  })
  it('check-up: every array\'s reported significance is held as listed and is below 5 sigma', () => {
    const c = resultsCheckUp()
    expect(c.arrays.map((a) => [a.sigmaLow, a.sigmaHigh])).toEqual([[3.5, 4], [3, 3], [2, 2], [4.6, 4.6]])
    expect(c.arrays.every((a) => a.belowFiveSigma)).toBe(true)
    expect(c.arrays[0].array).toBe('NANOGrav (15 years)')
  })
  it('steps: two billion-Sun black holes 0.01 pc (2,063 Earth-Sun distances) apart give a 2.09-year orbit and a 1.05-year wave cycle (half an orbit)', () => {
    const s = exampleSteps()
    expect(s.massEachSolar).toBe(1e9)
    expect(s.totalMassSolar).toBe(2e9)
    expect(s.separationPc).toBe(0.01)
    expect(s.separationAu).toBeCloseTo(2062.6, 1)
    expect(s.orbitalPeriodYears).toBeCloseTo(2.09, 2)
    expect(s.waveCycleYears).toBeCloseTo(s.orbitalPeriodYears / 2, 9)
    expect(s.waveFrequencyNanohertz).toBeCloseTo(30.3, 1)
    expect(s.cyclesInSpan).toBeCloseTo(14.3, 1)
  })
  it('Hellings-Downs rows: 0.5 at 0 degrees, -0.145 at 90, 0.25 at 180, and the lowest value (-0.152) at 82.5 degrees, in order of angle', () => {
    const rows = hellingsDownsRows()
    const at = (a: number) => rows.find((r) => r.angleDegrees === a)!.value
    expect(at(0)).toBe(0.5)
    expect(at(90)).toBeCloseTo(-0.1449, 3)
    expect(at(180)).toBeCloseTo(0.25, 9)
    const low = rows.filter((r) => r.isLowest)
    expect(low).toHaveLength(1)
    expect(low[0].angleDegrees).toBeCloseTo(82.5, 1)
    expect(low[0].value).toBeCloseTo(-0.152, 3)
    expect(Math.min(...rows.map((r) => r.value))).toBe(low[0].value)
    expect(rows.map((r) => r.angleDegrees)).toEqual([...rows.map((r) => r.angleDegrees)].sort((a, b) => a - b))
    expect(rows).toHaveLength(HELLINGS_DOWNS_ANGLES_DEGREES.length + 1)
  })
})

describe('Drawing A\'s nanohertz (review fix)', () => {
  it('gives one cycle every 31.7 years for one nanohertz, the lowest frequency 15 years can pick out being 15 years per cycle', () => {
    expect(nanohertzCycleYears()).toBeCloseTo(31.69, 2)
    expect(nanohertzCycleYears() / (lowestFrequencyHz() * 1e9)).toBeCloseTo(OBSERVING_SPAN_YEARS, 9)
  })
})
