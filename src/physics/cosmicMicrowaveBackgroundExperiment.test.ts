import { describe, expect, it } from 'vitest'
import {
  CMB_TEMPERATURE_TODAY_KELVIN,
  MEASURED_SPREAD_FRACTION,
  PUBLISHED_RELEASE_TEMPERATURE_KELVIN,
  PUBLISHED_RELEASE_YEARS_ALT,
  PUBLISHED_T0_GIVE_OR_TAKE_KELVIN,
  PUBLISHED_T0_KELVIN,
  RECOMBINATION_REDSHIFT,
  RECOMBINATION_YEARS_AFTER_BIG_BANG,
  SKY_UNIFORM_BELOW_FRACTION,
  actualSkyAnswer,
  actualTemperatureAnswer,
  cmbCheckUp,
  cmbMomentsTable,
  cmbTemperatureKelvin,
  cmbWorkedExample,
  dipoleOneInParts,
  evenSpreadExampleKelvin,
  kelvinToCelsius,
  releaseAsOnePartIn,
  releaseHourInALife,
  runCmbExperiment,
  skyGuessStripFraction,
  skyMarking,
  spreadKelvin,
  spreadScaleFraction,
  temperatureGuessMarker,
  temperatureMarking,
  temperatureScaleFraction,
  temperatureTodayReading,
} from './cosmicMicrowaveBackgroundExperiment'

describe('cmbTemperatureKelvin', () => {
  it('equals the temperature today at redshift 0', () => {
    expect(cmbTemperatureKelvin(0)).toBe(CMB_TEMPERATURE_TODAY_KELVIN)
  })

  it('is within 5% of 3,000 K at recombination', () => {
    const t = cmbTemperatureKelvin(RECOMBINATION_REDSHIFT)
    expect(Math.abs(t - 3000) / 3000).toBeLessThan(0.05)
  })

  it('is exactly proportional to (1 + z) for several redshifts', () => {
    for (const z of [0.5, 10, 100, 1000, RECOMBINATION_REDSHIFT]) {
      expect(cmbTemperatureKelvin(z) / (1 + z)).toBeCloseTo(CMB_TEMPERATURE_TODAY_KELVIN, 10)
    }
  })

  it('is strictly higher at a larger redshift', () => {
    expect(cmbTemperatureKelvin(500)).toBeGreaterThan(cmbTemperatureKelvin(50))
    expect(cmbTemperatureKelvin(50)).toBeGreaterThan(cmbTemperatureKelvin(0))
  })
})

describe('runCmbExperiment', () => {
  it('returns the redshift and its computed temperature', () => {
    const result = runCmbExperiment(100)
    expect(result.redshift).toBe(100)
    expect(result.temperatureKelvin).toBe(cmbTemperatureKelvin(100))
  })
})

describe('module independence', () => {
  it('does not import anything from hubblesLawExperiment.ts', async () => {
    const source = await import('node:fs/promises').then((fs) =>
      fs.readFile(new URL('./cosmicMicrowaveBackgroundExperiment.ts', import.meta.url), 'utf-8')
    )
    const importLines = source.split('\n').filter((line) => line.trim().startsWith('import'))
    expect(importLines.some((line) => line.includes('hubblesLawExperiment'))).toBe(false)
  })
})

// ---------------------------------------------------------------------------------------------
// Audit update (2026-11): the scales, the guess markers, the marking, the check-up, the moments
// table, the worked examples and the figures for the introduction.
// ---------------------------------------------------------------------------------------------

describe('the temperature panel scale (tenfold)', () => {
  it('puts 1 K at the left end and 10,000 K at the right end', () => {
    expect(temperatureScaleFraction(1)).toBe(0)
    expect(temperatureScaleFraction(10_000)).toBe(1)
  })

  it('moves a quarter of the width for every factor of ten', () => {
    expect(temperatureScaleFraction(10)).toBeCloseTo(0.25, 12)
    expect(temperatureScaleFraction(100)).toBeCloseTo(0.5, 12)
    expect(temperatureScaleFraction(1000)).toBeCloseTo(0.75, 12)
  })

  it("places today's temperature at about 11 percent and recombination's at about 87 percent", () => {
    expect(temperatureScaleFraction(CMB_TEMPERATURE_TODAY_KELVIN)).toBeCloseTo(0.1088, 3)
    expect(temperatureScaleFraction(cmbTemperatureKelvin(RECOMBINATION_REDSHIFT))).toBeCloseTo(0.8683, 3)
  })

  it('keeps the two marks well apart (so a guess marker beside today can be told from the real value)', () => {
    const gap =
      temperatureScaleFraction(cmbTemperatureKelvin(RECOMBINATION_REDSHIFT)) -
      temperatureScaleFraction(CMB_TEMPERATURE_TODAY_KELVIN)
    expect(gap).toBeGreaterThan(0.7)
  })

  it('shows why a straight scale would fail: today is about 0.3 of a pixel on 330 pixels', () => {
    const pixels = (330 * CMB_TEMPERATURE_TODAY_KELVIN) / cmbTemperatureKelvin(RECOMBINATION_REDSHIFT)
    expect(pixels).toBeLessThan(0.5)
  })

  it('clamps beyond the scale and refuses a temperature of zero or less', () => {
    expect(temperatureScaleFraction(0.01)).toBe(0)
    expect(temperatureScaleFraction(1e6)).toBe(1)
    expect(() => temperatureScaleFraction(0)).toThrow(RangeError)
    expect(() => temperatureScaleFraction(-5)).toThrow(RangeError)
  })
})

describe('the spread strip scale (tenfold; left is a bigger difference)', () => {
  it('puts 1 in 10 at the left end and 1 in 1,000,000 at the right end', () => {
    expect(spreadScaleFraction(0.1)).toBe(0)
    expect(spreadScaleFraction(1e-6)).toBe(1)
  })

  it('moves a fifth of the width for every factor of ten, towards the right as the difference shrinks', () => {
    expect(spreadScaleFraction(0.01)).toBeCloseTo(0.2, 12)
    expect(spreadScaleFraction(1e-3)).toBeCloseTo(0.4, 12)
    expect(spreadScaleFraction(1e-4)).toBeCloseTo(0.6, 12)
    expect(spreadScaleFraction(1e-5)).toBeCloseTo(0.8, 12)
  })

  it('places the measured spread (1 in 100,000) four fifths of the way across, clear of both ends', () => {
    const x = spreadScaleFraction(MEASURED_SPREAD_FRACTION)
    expect(x).toBeCloseTo(0.8, 12)
    expect(x).toBeLessThan(1)
    expect(x).toBeGreaterThan(0)
  })

  it('clamps beyond the strip and refuses a spread of zero or less', () => {
    expect(spreadScaleFraction(1)).toBe(0)
    expect(spreadScaleFraction(1e-9)).toBe(1)
    expect(() => spreadScaleFraction(0)).toThrow(RangeError)
  })
})

describe('the measured spread in kelvin', () => {
  it('is today\'s temperature times 1 part in 100,000, about 27 millionths of a kelvin', () => {
    expect(spreadKelvin()).toBeCloseTo(2.725e-5, 12)
    expect(spreadKelvin() * 1e6).toBeCloseTo(27.25, 6)
  })

  it('scales with the fraction and with the temperature it is taken of', () => {
    expect(spreadKelvin(1e-3)).toBeCloseTo(CMB_TEMPERATURE_TODAY_KELVIN * 1e-3, 12)
    expect(spreadKelvin(1e-5, 293)).toBeCloseTo(293e-5, 12)
  })
})

describe('the guess markers (markers only; they carry no size)', () => {
  it('gives guess 1 a different marker for each answer', () => {
    expect(temperatureGuessMarker('higher')).toBe('arrow-hotter')
    expect(temperatureGuessMarker('lower')).toBe('arrow-cooler')
    expect(temperatureGuessMarker('same')).toBe('tick-same')
  })

  it('joins guess 2 to the smaller-difference end for "about the same" and the bigger-difference end for "varies a lot"', () => {
    expect(skyGuessStripFraction('uniform')).toBe(1)
    expect(skyGuessStripFraction('varies')).toBe(0)
  })

  it('keeps guess 2\'s two ends clear of the measured mark so none of them can be mistaken for it', () => {
    const measured = spreadScaleFraction(MEASURED_SPREAD_FRACTION)
    expect(Math.abs(skyGuessStripFraction('uniform') - measured)).toBeGreaterThan(0.1)
    expect(Math.abs(skyGuessStripFraction('varies') - measured)).toBeGreaterThan(0.1)
  })
})

describe('marking the guesses (the tutor only)', () => {
  it('reads the real answer to guess 1 from the numbers: recombination is higher than today', () => {
    expect(actualTemperatureAnswer()).toBe('higher')
    expect(cmbTemperatureKelvin(RECOMBINATION_REDSHIFT)).toBeGreaterThan(CMB_TEMPERATURE_TODAY_KELVIN)
  })

  it('marks each answer to guess 1, with the real numbers beside it', () => {
    expect(temperatureMarking('higher').matches).toBe(true)
    expect(temperatureMarking('lower').matches).toBe(false)
    expect(temperatureMarking('same').matches).toBe(false)
    const m = temperatureMarking('lower')
    expect(m.releaseKelvin).toBeCloseTo(2972.43, 2)
    expect(m.todayKelvin).toBe(CMB_TEMPERATURE_TODAY_KELVIN)
    expect(m.timesToday).toBeCloseTo(1090.8, 6)
    expect(m.actual).toBe('higher')
  })

  it('reads the real answer to guess 2 from the measured spread, which is far below the page\'s own 1 percent rule', () => {
    expect(actualSkyAnswer()).toBe('uniform')
    expect(SKY_UNIFORM_BELOW_FRACTION / MEASURED_SPREAD_FRACTION).toBeCloseTo(1000, 6)
  })

  it('would call a spread above the rule "varies", so the rule is not a dead branch', () => {
    expect(actualSkyAnswer(0.05)).toBe('varies')
    expect(actualSkyAnswer(SKY_UNIFORM_BELOW_FRACTION)).toBe('varies')
    expect(actualSkyAnswer(SKY_UNIFORM_BELOW_FRACTION / 2)).toBe('uniform')
  })

  it('marks each answer to guess 2, with the real spread beside it', () => {
    expect(skyMarking('uniform').matches).toBe(true)
    expect(skyMarking('varies').matches).toBe(false)
    const m = skyMarking('varies')
    expect(m.spreadFraction).toBe(1e-5)
    expect(m.spreadKelvin).toBeCloseTo(2.725e-5, 12)
    expect(m.oneInParts).toBeCloseTo(100_000, 6)
    expect(m.actual).toBe('uniform')
  })
})

describe('the check-up', () => {
  const rows = cmbCheckUp()
  const row = (id: string) => rows.find((r) => r.id === id)!

  it('has the four rows in order', () => {
    expect(rows.map((r) => r.id)).toEqual([
      'temperature-today',
      'temperature-at-release',
      'release-time',
      'spread-between-directions',
    ])
  })

  it('finds the page\'s 2.725 K the same as the published 2.72548 K, within its stated give-or-take', () => {
    const r = row('temperature-today')
    expect(r.used).toBe(2.725)
    expect(r.published).toBe(PUBLISHED_T0_KELVIN)
    expect(PUBLISHED_T0_KELVIN).toBe(2.72548)
    expect(r.giveOrTake).toBe(0.00057)
    expect(Math.abs(r.difference!)).toBeCloseTo(0.00048, 10)
    expect(r.reading).toBe('same-within-give-or-take')
  })

  it('reads a temperature outside the give-or-take as more or less, not as the same', () => {
    expect(temperatureTodayReading(2.7261, 2.72548, 0.00057)).toBe('more')
    expect(temperatureTodayReading(2.724, 2.72548, 0.00057)).toBe('less')
    // Just inside and just outside the stated give-or-take (the exact edge is a floating-point tie).
    expect(temperatureTodayReading(2.72548 + 0.0005, 2.72548, 0.00057)).toBe('same-within-give-or-take')
    expect(temperatureTodayReading(2.72548 - 0.0005, 2.72548, 0.00057)).toBe('same-within-give-or-take')
    expect(temperatureTodayReading(2.72548 + 0.0006, 2.72548, 0.00057)).toBe('more')
    expect(PUBLISHED_T0_GIVE_OR_TAKE_KELVIN).toBe(0.00057)
  })

  it('finds the temperature at release a little less than the rounded "around 3000 K": 0.92 percent less', () => {
    const r = row('temperature-at-release')
    expect(r.used).toBeCloseTo(2972.43, 2)
    expect(r.published).toBe(PUBLISHED_RELEASE_TEMPERATURE_KELVIN)
    expect(r.reading).toBe('less')
    expect(r.relativeGap).toBeCloseTo(-0.00919, 5)
    expect(r.difference).toBeCloseTo(-27.57, 2)
  })

  it('does not call the release time a check: it is given, and the two published values differ by about 1.3 percent', () => {
    const r = row('release-time')
    expect(r.used).toBe(RECOMBINATION_YEARS_AFTER_BIG_BANG)
    expect(r.publishedAlt).toBe(PUBLISHED_RELEASE_YEARS_ALT)
    expect(r.reading).toBe('given-not-checked')
    expect(r.relativeGap).toBeCloseTo(-0.01316, 4)
  })

  it('quotes the spread without checking it: the page calculates no real spread, only draws an illustration', () => {
    const r = row('spread-between-directions')
    expect(r.used).toBeNull()
    expect(r.published).toBe(1e-5)
    expect(r.reading).toBe('quoted-not-checked')
    expect(r.difference).toBeCloseTo(2.725e-5, 12)
  })
})

describe('the table of moments (Table 2)', () => {
  const rows = cmbMomentsTable()

  it('has the six moments from today to recombination', () => {
    expect(rows.map((r) => r.redshift)).toEqual([0, 1, 10, 100, 1000, RECOMBINATION_REDSHIFT])
  })

  it('gives the temperatures the page prints', () => {
    expect(rows[0].temperatureKelvin).toBe(2.725)
    expect(rows[1].temperatureKelvin).toBeCloseTo(5.45, 10)
    expect(rows[2].temperatureKelvin).toBeCloseTo(29.975, 10)
    expect(rows[3].temperatureKelvin).toBeCloseTo(275.225, 10)
    expect(rows[4].temperatureKelvin).toBeCloseTo(2727.725, 10)
    expect(rows[5].temperatureKelvin).toBeCloseTo(2972.43, 2)
  })

  it('stretches by 1 + z and rises strictly with z', () => {
    for (const r of rows) {
      expect(r.timesToday).toBeCloseTo(1 + r.redshift, 12)
      expect(r.temperatureKelvin / CMB_TEMPERATURE_TODAY_KELVIN).toBeCloseTo(r.timesToday, 10)
    }
    for (let i = 1; i < rows.length; i++) {
      expect(rows[i].temperatureKelvin).toBeGreaterThan(rows[i - 1].temperatureKelvin)
    }
  })

  it('shows z = 100 as about 2 degrees Celsius, just above the freezing point of water (not room temperature)', () => {
    const celsius = kelvinToCelsius(rows[3].temperatureKelvin)
    expect(celsius).toBeCloseTo(2.075, 3)
    expect(celsius).toBeGreaterThan(0)
    expect(celsius).toBeLessThan(5)
  })
})

describe('the worked example', () => {
  it('gives 2.725 x 1090.8 = about 2,972 K, 1,091 times today, and the spread in kelvin', () => {
    const w = cmbWorkedExample()
    expect(w.factor).toBeCloseTo(1090.8, 10)
    expect(w.temperatureKelvin).toBeCloseTo(2972.43, 2)
    expect(w.timesToday).toBeCloseTo(1090.8, 6)
    expect(w.todayKelvin).toBe(2.725)
    expect(w.spreadKelvin).toBeCloseTo(2.725e-5, 12)
  })

  it('works for another redshift (the learner\'s own moment)', () => {
    const w = cmbWorkedExample(100)
    expect(w.temperatureKelvin).toBeCloseTo(275.225, 10)
    expect(w.timesToday).toBeCloseTo(101, 10)
  })
})

describe('the figures for the introduction and "More about the CMB"', () => {
  it('turns 2.725 K into about -270.4 degrees Celsius, and 293 K into about 20 degrees', () => {
    expect(kelvinToCelsius(2.725)).toBeCloseTo(-270.425, 6)
    expect(kelvinToCelsius(293)).toBeCloseTo(19.85, 6)
  })

  it('finds 380,000 years about 1 part in 36,000 of the age', () => {
    expect(releaseAsOnePartIn()).toBeCloseTo(36_316, 0)
  })

  it('puts recombination about 19 hours after birth in an 80-year life, and scales with the life', () => {
    expect(releaseHourInALife()).toBeCloseTo(19.3, 1)
    expect(releaseHourInALife(40)).toBeCloseTo(releaseHourInALife() / 2, 10)
  })

  it('finds a pool as even as the sky varying by about 0.003 degrees', () => {
    expect(evenSpreadExampleKelvin()).toBeCloseTo(0.00293, 8)
  })

  it('finds the Sun-motion dipole about 1 part in 810 (taken from the dipole module), far larger than 1 in 100,000', () => {
    expect(dipoleOneInParts()).toBeCloseTo(810.7, 1)
    expect(dipoleOneInParts()).toBeLessThan(1 / MEASURED_SPREAD_FRACTION)
  })
})
