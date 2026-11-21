import { describe, expect, it } from 'vitest'
import { energyReleasedFraction } from './spinningBlackHoleExperiment'
import {
  BRIGHTNESS_CHOICES_SOLAR,
  FLICKER_ILLUSTRATION_DAYS,
  FUEL_CHOICES,
  FUSION_EFFICIENCY,
  J0529_LUMINOSITY_SOLAR,
  METERS_PER_AU,
  MILKY_WAY_LUMINOSITY_RANGE_SOLAR,
  MILKY_WAY_LUMINOSITY_SOLAR,
  PART_ONE_LUMINOSITY_SOLAR,
  PART_ONE_SPIN,
  RATIO_CHOICES,
  SECONDS_PER_YEAR,
  SPEED_OF_LIGHT,
  SPIN_CHOICES,
  SUN_LUMINOSITY_W,
  SUN_MASS_KG,
  WIDTH_CHOICES,
  brightnessRatio,
  brightnessRatioRange,
  brightnessRulerPosition,
  CEILING_EFFICIENCY,
  checkUp,
  compareToPublished,
  fuelAnswer,
  fuelGuessMarker,
  fuelRulerPosition,
  fusionMassPerYearSolar,
  galaxyToSourceWidthRatio,
  guessResult,
  impliedEfficiency,
  infallEfficiency,
  infallMassPerYearSolar,
  j0529RateCheck,
  lightDayAU,
  lightDayMeters,
  lightPerKilogramRatio,
  logRulerPosition,
  markGuesses,
  massPerSecondKg,
  massPerYearSolar,
  milkyWayWidthLightDays,
  nearestOnLogScale,
  ratioAnswer,
  ratioGuessMarker,
  runQuasarExperiment,
  sizeLimitAU,
  sizeLimitInNeptuneOrbits,
  sizeLimitMeters,
  sourceFractionOfGalaxy,
  widthAnswer,
  widthGuessMarker,
  widthRulerPosition,
} from './quasarBrightness'

// Tests of the physics the specification defines (Required Physics Tests 1 to 10). The hand values were worked on 2026-11-20.

describe('energy: the mass that has to fall in', () => {
  it('m_dot = L / (e c^2): 1 watt at 100 percent would need 1 / c^2 kg per second; and it scales as 1/e', () => {
    expect(massPerSecondKg(1, 0.5)).toBeCloseTo(2 / SPEED_OF_LIGHT ** 2, 25)
    expect(massPerSecondKg(1e30, 0.1) / massPerSecondKg(1e30, 0.2)).toBeCloseTo(2, 12)
  })

  it('gives the Sun\'s own numbers: 3.828e26 W at 0.71 percent is about 6e11 kg of hydrogen fused per second (about 600 million tonnes)', () => {
    // 3.828e26 / (0.0071 x c^2) = 6.0e11 kg per second.
    const perSecond = massPerSecondKg(SUN_LUMINOSITY_W, FUSION_EFFICIENCY)
    expect(perSecond).toBeGreaterThan(5.9e11)
    expect(perSecond).toBeLessThan(6.1e11)
  })

  it('in Suns per year, for 4 trillion Suns, matches the hand values: 4.73 (no spin), 1.73 (spin 0.9), 0.64 (ceiling), 38.1 (fusion, at 0.71 percent)', () => {
    const L = 4e12
    expect(infallMassPerYearSolar(L, 0)).toBeCloseTo(4.73, 1)
    expect(infallMassPerYearSolar(L, 0.9)).toBeCloseTo(1.73, 1)
    expect(infallMassPerYearSolar(L, 0.99)).toBeCloseTo(1.02, 1)
    expect(massPerYearSolar(L, 0.423)).toBeCloseTo(0.64, 1)
    expect(fusionMassPerYearSolar(L)).toBeCloseTo(38.1, 1)
  })

  it('doubling the luminosity doubles the mass per year, at any efficiency', () => {
    expect(massPerYearSolar(2e12, 0.1)).toBeCloseTo(2 * massPerYearSolar(1e12, 0.1), 9)
  })

  it('converts consistently between kilograms per second and Suns per year', () => {
    const perSecond = massPerSecondKg(4e12 * SUN_LUMINOSITY_W, 0.1)
    expect(massPerYearSolar(4e12, 0.1)).toBeCloseTo((perSecond * SECONDS_PER_YEAR) / SUN_MASS_KG, 9)
  })

  it('rejects an impossible efficiency or luminosity', () => {
    expect(() => massPerSecondKg(1, 0)).toThrow(RangeError)
    expect(() => massPerSecondKg(1, 1)).toThrow(RangeError)
    expect(() => massPerSecondKg(-1, 0.1)).toThrow(RangeError)
    expect(() => massPerYearSolar(Number.NaN, 0.1)).toThrow(RangeError)
  })
})

describe('efficiency: reused from Black Holes Experiment 8', () => {
  it('equals Experiment 8\'s energyReleasedFraction exactly at every spin the learner can choose', () => {
    for (const spin of [0, 0.5, 0.9, 0.99, 0.2, 0.7]) {
      expect(infallEfficiency(spin)).toBe(energyReleasedFraction(spin, 'with'))
    }
  })

  it('is 5.72 percent at no spin, 15.58 percent at 0.9 and 26.4 percent at 0.99 (Experiment 8\'s values)', () => {
    expect(infallEfficiency(0)).toBeCloseTo(0.0572, 4)
    expect(infallEfficiency(0.9)).toBeCloseTo(0.1558, 4)
    expect(infallEfficiency(0.99)).toBeCloseTo(0.264, 3)
  })

  it('rejects a spin of 1 or more, as Experiment 8 does', () => {
    expect(() => infallEfficiency(1)).toThrow(RangeError)
  })

  it('a faster spin always needs less matter, and fusion needs more than every spin the learner can choose', () => {
    const rates = SPIN_CHOICES.map((s) => infallMassPerYearSolar(4e12, s))
    for (let i = 1; i < rates.length; i++) expect(rates[i]).toBeLessThan(rates[i - 1])
    for (const r of rates) expect(fusionMassPerYearSolar(4e12)).toBeGreaterThan(r)
  })

  it('light per kilogram falling in over fusion is e_infall / e_fusion: about 8 at no spin and about 37 at spin 0.99', () => {
    expect(lightPerKilogramRatio(0)).toBeCloseTo(infallEfficiency(0) / FUSION_EFFICIENCY, 12)
    expect(lightPerKilogramRatio(0)).toBeCloseTo(8.06, 1)
    expect(lightPerKilogramRatio(0.99)).toBeCloseTo(37.2, 0)
  })

  it('and it equals the ratio of the two mass rates for the same light', () => {
    for (const spin of SPIN_CHOICES) {
      expect(fusionMassPerYearSolar(1e12) / infallMassPerYearSolar(1e12, spin)).toBeCloseTo(lightPerKilogramRatio(spin), 9)
    }
  })
})

describe('J0529-4351: the module against ESO\'s published rate', () => {
  it('at 10 percent efficiency gives about 340 Suns a year, within 10 percent of ESO\'s "just over a Sun per day" (365)', () => {
    const check = j0529RateCheck(0.1)
    expect(check.modelSolarMassesPerYear).toBeGreaterThan(330)
    expect(check.modelSolarMassesPerYear).toBeLessThan(350)
    expect(Math.abs(check.ratio - 1)).toBeLessThan(0.1)
  })

  it('the efficiency that ESO\'s rate implies is about 9 percent, and feeding it back gives the published rate', () => {
    const e = impliedEfficiency(J0529_LUMINOSITY_SOLAR, 365.25)
    expect(e).toBeGreaterThan(0.09)
    expect(e).toBeLessThan(0.095)
    expect(massPerYearSolar(J0529_LUMINOSITY_SOLAR, e)).toBeCloseTo(365.25, 6)
  })

  it('500 trillion Suns is about 1.9e41 W, matching the paper\'s 2e41 W for the accretion disc to within 5 percent', () => {
    expect(J0529_LUMINOSITY_SOLAR * SUN_LUMINOSITY_W).toBeCloseTo(1.914e41, -39)
    expect(Math.abs((J0529_LUMINOSITY_SOLAR * SUN_LUMINOSITY_W) / 2e41 - 1)).toBeLessThan(0.05)
  })
})

describe('brightness: the ratio to the Milky Way', () => {
  it('3C 273 at 4 trillion Suns is about 160 times the Milky Way at its midpoint, between 133 and 200 over the published range', () => {
    expect(brightnessRatio(4e12)).toBeCloseTo(160, 6)
    const range = brightnessRatioRange(4e12)
    expect(range.low).toBeCloseTo(4e12 / MILKY_WAY_LUMINOSITY_RANGE_SOLAR[1], 6)
    expect(range.high).toBeCloseTo(4e12 / MILKY_WAY_LUMINOSITY_RANGE_SOLAR[0], 6)
    expect(range.low).toBeLessThan(brightnessRatio(4e12))
    expect(range.high).toBeGreaterThan(brightnessRatio(4e12))
  })

  it('the Milky Way midpoint lies inside its range', () => {
    expect(MILKY_WAY_LUMINOSITY_SOLAR).toBeGreaterThan(MILKY_WAY_LUMINOSITY_RANGE_SOLAR[0])
    expect(MILKY_WAY_LUMINOSITY_SOLAR).toBeLessThan(MILKY_WAY_LUMINOSITY_RANGE_SOLAR[1])
  })
})

describe('size: light-travel time', () => {
  it('a light-day is 25.9 billion km (NASA: 25,902,068,356 km) and 173.1 AU', () => {
    expect(lightDayMeters() / 1000).toBeCloseTo(25_902_068_371, -3)
    expect(Math.abs(lightDayMeters() / 1000 / 25_902_068_356 - 1)).toBeLessThan(1e-8)
    expect(lightDayAU()).toBeCloseTo(173.14, 1)
  })

  it('the size limit is c x t, and doubles when the time doubles', () => {
    expect(sizeLimitMeters(1)).toBe(SPEED_OF_LIGHT * 86400)
    expect(sizeLimitMeters(14)).toBeCloseTo(2 * sizeLimitMeters(7), 3)
  })

  it('a week is 7 light-days: about 1,212 AU, about 20 times the width of Neptune\'s orbit', () => {
    expect(sizeLimitAU(7)).toBeCloseTo(1212.0, 0)
    expect(sizeLimitMeters(7) / METERS_PER_AU).toBeCloseTo(sizeLimitAU(7), 9)
    expect(sizeLimitInNeptuneOrbits(7)).toBeCloseTo(20.2, 1)
  })

  it('the Milky Way is about 3.65e7 light-days across, so about 5.2 million times wider than a week\'s limit and 36.5 million than a day\'s', () => {
    expect(milkyWayWidthLightDays()).toBeCloseTo(3.6525e7, -3)
    expect(galaxyToSourceWidthRatio(7)).toBeCloseTo(5.218e6, -3)
    expect(galaxyToSourceWidthRatio(1)).toBeCloseTo(3.6525e7, -3)
    expect(galaxyToSourceWidthRatio(5)).toBeCloseTo(7.305e6, -3)
  })

  it('a quicker flicker means a smaller source, so a larger ratio', () => {
    expect(galaxyToSourceWidthRatio(1)).toBeGreaterThan(galaxyToSourceWidthRatio(7))
    expect(sourceFractionOfGalaxy(1)).toBeLessThan(sourceFractionOfGalaxy(7))
  })

  it('the source fraction is 1 over the ratio', () => {
    expect(sourceFractionOfGalaxy(7) * galaxyToSourceWidthRatio(7)).toBeCloseTo(1, 12)
  })

  it('rejects a flicker time that is not positive', () => {
    expect(() => sizeLimitMeters(0)).toThrow(RangeError)
    expect(() => galaxyToSourceWidthRatio(-1)).toThrow(RangeError)
  })
})

describe('the experiment\'s result and the predictions', () => {
  it('Part 1 (3C 273, no spin) shows the hand values', () => {
    const r = runQuasarExperiment(PART_ONE_LUMINOSITY_SOLAR, PART_ONE_SPIN)
    expect(r.infallEfficiency).toBeCloseTo(0.0572, 4)
    expect(r.infallSolarMassesPerYear).toBeCloseTo(4.73, 1)
    expect(r.fusionSolarMassesPerYear).toBeCloseTo(38.1, 1)
    expect(r.ratioToMilkyWay).toBeCloseTo(160, 6)
    expect(r.flickerDays).toBe(FLICKER_ILLUSTRATION_DAYS)
    expect(r.sizeLimitAU).toBeCloseTo(1212, 0)
    expect(r.galaxyToSourceWidthRatio).toBeCloseTo(5.218e6, -3)
  })

  it('every brightness and spin the learner can choose runs without a bad number, and brighter always needs more matter', () => {
    for (const spin of SPIN_CHOICES) {
      let previous = 0
      for (const L of BRIGHTNESS_CHOICES_SOLAR) {
        const r = runQuasarExperiment(L, spin)
        for (const v of [r.infallSolarMassesPerYear, r.fusionSolarMassesPerYear, r.ratioToMilkyWay, r.sizeLimitAU]) {
          expect(Number.isFinite(v)).toBe(true)
          expect(v).toBeGreaterThan(0)
        }
        expect(r.infallSolarMassesPerYear).toBeGreaterThan(previous)
        previous = r.infallSolarMassesPerYear
      }
    }
  })

  it('the result does not depend on any playback speed: the same inputs give the identical result every time (CLAUDE.md §11)', () => {
    expect(runQuasarExperiment(4e12, 0.9)).toEqual(runQuasarExperiment(4e12, 0.9))
  })

  it('the answers are the middle buttons or near it, and none is at an end of its ladder', () => {
    expect(ratioAnswer()).toBe('hundred')
    expect(widthAnswer()).toBe('ten-millionth')
    expect(fuelAnswer()).toBe('five')
    expect(RATIO_CHOICES[0].id).not.toBe(ratioAnswer())
    expect(RATIO_CHOICES[RATIO_CHOICES.length - 1].id).not.toBe(ratioAnswer())
    expect(WIDTH_CHOICES[0].id).not.toBe(widthAnswer())
    expect(WIDTH_CHOICES[WIDTH_CHOICES.length - 1].id).not.toBe(widthAnswer())
    expect(FUEL_CHOICES[0].id).not.toBe(fuelAnswer())
    expect(FUEL_CHOICES[FUEL_CHOICES.length - 1].id).not.toBe(fuelAnswer())
  })

  it('the nearest-button helper works on a log scale, not a linear one', () => {
    const buttons = [{ v: 1 }, { v: 10 }, { v: 100 }]
    // 4 is nearer 1 on a straight line (3 away against 6) but nearer 10 on a log scale (log 4 = 0.60 is 0.60 from log 1 = 0 and 0.40 from log 10 = 1).
    expect(nearestOnLogScale(buttons, 4, (b) => b.v).v).toBe(10)
    expect(nearestOnLogScale(buttons, 2, (b) => b.v).v).toBe(1)
  })

  it('marks a guess matched only when it is the answer', () => {
    expect(guessResult(ratioAnswer(), ratioAnswer())).toBe('matched')
    expect(guessResult('same', ratioAnswer())).toBe('not matched')
  })
})

describe('rulers and the white guess marks', () => {
  it('a log ruler puts the left end at 0, the right end at 1 and a middle decade at 0.5', () => {
    expect(logRulerPosition(1, 1, 1e4)).toBe(0)
    expect(logRulerPosition(1e4, 1, 1e4)).toBe(1)
    expect(logRulerPosition(100, 1, 1e4)).toBeCloseTo(0.5, 12)
  })

  it('every real value and every guess sits inside its ruler', () => {
    for (const p of [
      brightnessRulerPosition(MILKY_WAY_LUMINOSITY_SOLAR),
      brightnessRulerPosition(THREE_C_273),
      widthRulerPosition(milkyWayWidthLightDays()),
      widthRulerPosition(7),
      fuelRulerPosition(infallMassPerYearSolar(4e12, 0)),
      fuelRulerPosition(fusionMassPerYearSolar(4e12)),
    ]) {
      expect(p).toBeGreaterThan(0)
      expect(p).toBeLessThan(1)
    }
    for (const c of RATIO_CHOICES) expect(ratioGuessMarker(c.id).position).toBeGreaterThan(0)
    for (const c of RATIO_CHOICES) expect(ratioGuessMarker(c.id).position).toBeLessThan(1)
    for (const c of WIDTH_CHOICES) {
      expect(widthGuessMarker(c.id).position).toBeGreaterThan(0)
      expect(widthGuessMarker(c.id).position).toBeLessThan(1)
    }
    for (const c of FUEL_CHOICES) {
      expect(fuelGuessMarker(c.id).position).toBeGreaterThan(0)
      expect(fuelGuessMarker(c.id).position).toBeLessThan(1)
    }
  })

  it('a different guess gives a different mark, in the order of the buttons', () => {
    const ratio = RATIO_CHOICES.map((c) => ratioGuessMarker(c.id).position)
    const width = WIDTH_CHOICES.map((c) => widthGuessMarker(c.id).position)
    const fuel = FUEL_CHOICES.map((c) => fuelGuessMarker(c.id).position)
    for (const list of [ratio, fuel]) for (let i = 1; i < list.length; i++) expect(list[i]).toBeGreaterThan(list[i - 1])
    for (let i = 1; i < width.length; i++) expect(width[i]).toBeLessThan(width[i - 1]) // narrower guesses sit further left
  })

  it('the "100 times" guess sits 2 decades above the Milky Way; the answer\'s mark is within a decade of the real value', () => {
    const mark = ratioGuessMarker('hundred')
    expect(mark.luminositySolar).toBeCloseTo(100 * MILKY_WAY_LUMINOSITY_SOLAR, 3)
    expect(Math.abs(Math.log10(mark.luminositySolar / 4e12))).toBeLessThan(1)
  })

  it('the guess marks come from the module\'s own constants: the "five" fuel guess is 5 Suns a year, the real answer is 4.73', () => {
    expect(fuelGuessMarker('five').solarMassesPerYear).toBe(5)
    expect(Math.abs(Math.log10(5 / infallMassPerYearSolar(4e12, 0)))).toBeLessThan(0.1)
  })
})

const THREE_C_273 = PART_ONE_LUMINOSITY_SOLAR

describe('Step 5: the check-up against published values', () => {
  const rows = checkUp()
  const byId = (id: string) => rows.find((r) => r.id === id)!

  it('compareToPublished says "the same" only at the precision of the published number, else more or less, with the gap', () => {
    expect(compareToPublished(5.72, 6, 1).reading).toBe('the same')
    expect(compareToPublished(5.72, 6, 2).reading).toBe('less')
    expect(compareToPublished(0.0423, 0.0420, 2).reading).toBe('the same')
    expect(compareToPublished(0.423, 0.32, 2).reading).toBe('more')
    expect(compareToPublished(90, 100, 2).percentGap).toBeCloseTo(-10, 10)
    expect(compareToPublished(110, 100, 2).percentGap).toBeCloseTo(10, 10)
    expect(() => compareToPublished(-1, 1, 2)).toThrow(RangeError)
  })

  it('J0529-4351: the page\'s rate at 10 percent is about 340 Suns a year, less than ESO\'s just over a Sun a day, by under 10 percent', () => {
    const r = byId('j0529-rate')
    expect(r.page).toBeCloseTo(massPerYearSolar(J0529_LUMINOSITY_SOLAR, 0.1), 9)
    expect(r.page).toBeGreaterThan(330)
    expect(r.page).toBeLessThan(350)
    expect(r.published).toBe(365.25)
    expect(r.reading).toBe('less')
    expect(Math.abs(r.percentGap)).toBeLessThan(10)
  })

  it('the efficiencies come from Black Holes 8: no spin is the same as about 6 percent at one figure, the ceiling is the same as about 42 percent and more than 32', () => {
    expect(byId('no-spin-efficiency').page).toBe(infallEfficiency(0))
    expect(byId('no-spin-efficiency').reading).toBe('the same')
    expect(byId('ceiling-efficiency').page).toBeCloseTo(0.423, 3)
    expect(byId('ceiling-efficiency').reading).toBe('the same')
    expect(byId('ceiling-efficiency-openstax').reading).toBe('more')
    expect(byId('ceiling-efficiency-openstax').percentGap).toBeGreaterThan(30)
  })

  it('fusion and the light-day agree with the sources', () => {
    expect(byId('fusion-efficiency').reading).toBe('the same')
    expect(byId('light-day').reading).toBe('the same')
    expect(byId("light-day").page).toBeCloseTo(25_902_068_371.2, 0)
  })

  it('every row has finite numbers', () => {
    for (const r of rows) for (const v of [r.page, r.published, r.percentGap]) expect(Number.isFinite(v)).toBe(true)
  })
})

describe('the efficiency ceiling', () => {
  it('is 1 - 1/sqrt(3), and Black Holes 8\'s energy released climbs towards it from below and never passes it', () => {
    expect(CEILING_EFFICIENCY).toBeCloseTo(0.42265, 5)
    let last = 0
    for (const spin of [0, 0.5, 0.9, 0.99, 0.999, 0.99999]) {
      const e = infallEfficiency(spin)
      expect(e).toBeGreaterThan(last)
      expect(e).toBeLessThan(CEILING_EFFICIENCY)
      last = e
    }
    expect(CEILING_EFFICIENCY - last).toBeLessThan(0.06)
  })
})

describe('Step 6: marking the guesses', () => {
  it('the three answers are marked right, and any other button is marked off', () => {
    expect(markGuesses({ ratio: ratioAnswer(), width: widthAnswer(), fuel: fuelAnswer() })).toEqual({ ratio: true, width: true, fuel: true })
    expect(markGuesses({ ratio: 'same', width: 'tenth', fuel: 'twentieth' })).toEqual({ ratio: false, width: false, fuel: false })
    expect(markGuesses({ ratio: ratioAnswer(), width: 'tenth', fuel: fuelAnswer() })).toEqual({ ratio: true, width: false, fuel: true })
  })
})
