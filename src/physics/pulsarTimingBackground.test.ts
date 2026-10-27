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
