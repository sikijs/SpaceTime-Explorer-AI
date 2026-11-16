import { describe, expect, it } from 'vitest'
import {
  COMPARISON_MASS_RATIO,
  HYPOTHETICAL_START_IN_HORIZON_RADII,
  MASS_SCALING_GUESS_RATIO,
  OBJECT_PRESETS,
  PUBLISHED,
  SUN_RADIUS_GUESS_KM,
  checkUpRows,
  compareHorizonsOfSunAndThousandSuns,
  guessInHorizonRadii,
  guessedLargeHorizonKm,
  massScalingGuessIsModelAnswer,
  objectCards,
  percentDifference,
  readAgainstPublished,
  readAgainstRange,
  runPartOneSqueeze,
  sunEscapeSpeedCheck,
  sunRadiusGuessIsModelAnswer,
  horizonRadiusKm,
  isBlackHole,
  ordinaryGravityEscapeSpeedFractionOfLight,
  radiusInHorizonRadii,
  runBlackHoleSizeExperiment,
} from './blackHoleSizeExperiment'

// Independent check in SI units (a different set of constants from the module's galactic units).
const G_SI = 6.6743e-11 // m^3 / (kg s^2)
const C_SI = 299_792_458 // m / s
const SOLAR_MASS_KG = 1.98841e30
const KM_PER_AU = 149_597_870.7
const horizonKmSI = (solarMasses: number) => ((2 * G_SI * solarMasses * SOLAR_MASS_KG) / C_SI ** 2) / 1000

const preset = (id: string) => OBJECT_PRESETS.find((p) => p.id === id)!
const within = (actual: number, expected: number, fraction: number) =>
  expect(Math.abs(actual - expected) / expected).toBeLessThan(fraction)

describe('horizon radius', () => {
  it('is about 2.953 km for one solar mass (the Sun)', () => {
    within(horizonRadiusKm(1), 2.953, 0.001)
    within(horizonRadiusKm(preset('sun').massSolarMasses), 2.953, 0.001)
  })

  it('agrees with an independent calculation in SI units', () => {
    for (const m of [3.0e-6, 1, 1.4, 10, 4.3e6, 6.5e9]) within(horizonRadiusKm(m), horizonKmSI(m), 0.001)
  })

  it('is exactly proportional to the mass', () => {
    for (const m of [0.5, 1, 7, 100, 4.3e6]) {
      expect(horizonRadiusKm(2 * m) / horizonRadiusKm(m)).toBeCloseTo(2, 12)
      expect(horizonRadiusKm(1000 * m) / horizonRadiusKm(m)).toBeCloseTo(1000, 9)
    }
  })

  it("is about 8.87 millimeters for Earth's mass", () => {
    within(horizonRadiusKm(preset('earth').massSolarMasses), 0.00000887, 0.01)
  })

  it("matches the specification's table for the other objects", () => {
    within(horizonRadiusKm(preset('neutron-star').massSolarMasses), 4.13, 0.01)
    within(horizonRadiusKm(preset('stellar-black-hole').massSolarMasses), 29.5, 0.01)
    const sgr = horizonRadiusKm(preset('sgr-a-star').massSolarMasses)
    within(sgr, 12.7e6, 0.01)
    within(sgr / KM_PER_AU, 0.085, 0.01)
    const m87 = horizonRadiusKm(preset('m87-star').massSolarMasses)
    within(m87, 19.2e9, 0.01) // the specification's "about 19 billion km", unrounded
    within(m87 / KM_PER_AU, 128, 0.01)
  })
})

describe('radius in horizon radii and the black hole condition', () => {
  it('is the radius divided by the horizon radius, and 1 at the horizon', () => {
    for (const m of [1, 10, 4.3e6]) {
      const rs = horizonRadiusKm(m)
      expect(radiusInHorizonRadii(5 * rs, m)).toBeCloseTo(5, 12)
      expect(radiusInHorizonRadii(rs, m)).toBeCloseTo(1, 12)
    }
  })

  it('is a black hole if and only if the radius is at or below the horizon', () => {
    for (const m of [3.0e-6, 1, 1.4, 10, 6.5e9]) {
      const rs = horizonRadiusKm(m)
      expect(isBlackHole(rs * 0.999, m)).toBe(true)
      expect(isBlackHole(rs, m)).toBe(true)
      expect(isBlackHole(rs * 1.001, m)).toBe(false)
    }
  })
})

describe('ordinary-gravity escape speed', () => {
  it('is 1 at the horizon, below 1 above it and above 1 below it, equal to sqrt(r_s / r)', () => {
    for (const m of [1, 10]) {
      const rs = horizonRadiusKm(m)
      expect(ordinaryGravityEscapeSpeedFractionOfLight(rs, m)).toBeCloseTo(1, 12)
      expect(ordinaryGravityEscapeSpeedFractionOfLight(rs * 4, m)).toBeLessThan(1)
      expect(ordinaryGravityEscapeSpeedFractionOfLight(rs / 4, m)).toBeGreaterThan(1)
      for (const k of [0.1, 0.5, 2, 100]) {
        expect(ordinaryGravityEscapeSpeedFractionOfLight(rs * k, m)).toBeCloseTo(Math.sqrt(1 / k), 12)
      }
    }
  })

  it('equals the Newtonian escape speed sqrt(2GM/r) divided by c, checked in SI units (the link to Experiment 7)', () => {
    for (const m of [1, 10, 4.3e6]) {
      for (const k of [0.5, 1, 3]) {
        const radiusKm = horizonRadiusKm(m) * k
        const newtonianEscape = Math.sqrt((2 * G_SI * m * SOLAR_MASS_KG) / (radiusKm * 1000))
        within(ordinaryGravityEscapeSpeedFractionOfLight(radiusKm, m), newtonianEscape / C_SI, 0.001)
      }
    }
  })
})

describe('runBlackHoleSizeExperiment', () => {
  it('gives the squeeze needed for Earth, the Sun and the neutron star, and null for the black holes', () => {
    within(runBlackHoleSizeExperiment('earth', 1).squeezeNeeded!, 720e6, 0.01)
    within(runBlackHoleSizeExperiment('sun', 1).squeezeNeeded!, 236_000, 0.01)
    within(runBlackHoleSizeExperiment('neutron-star', 1).squeezeNeeded!, 2.9, 0.01)
    for (const id of ['stellar-black-hole', 'sgr-a-star', 'm87-star'] as const) {
      expect(runBlackHoleSizeExperiment(id, 1e6).squeezeNeeded).toBeNull()
    }
  })

  it('starts from the real radius, or from a labeled hypothetical 100 horizon radii for the black holes', () => {
    for (const p of OBJECT_PRESETS) {
      const result = runBlackHoleSizeExperiment(p.id, 1)
      if (p.realRadiusKm === null) {
        expect(result.startIsHypothetical).toBe(true)
        expect(result.startRadiusKm / result.horizonRadiusKm).toBeCloseTo(HYPOTHETICAL_START_IN_HORIZON_RADII, 9)
        expect(HYPOTHETICAL_START_IN_HORIZON_RADII).toBe(100)
      } else {
        expect(result.startIsHypothetical).toBe(false)
        expect(result.startRadiusKm).toBe(p.realRadiusKm)
      }
    }
  })

  it('has a curve that starts at the start radius, ends at the chosen radius, is monotonic and evenly spaced in log radius', () => {
    for (const [id, chosenFraction] of [
      ['sun', 0.5],
      ['earth', 10],
      ['stellar-black-hole', 0.1],
    ] as const) {
      const rs = horizonRadiusKm(preset(id).massSolarMasses)
      const { curve, startRadiusKm, chosenRadiusKm } = runBlackHoleSizeExperiment(id, rs * chosenFraction)
      expect(curve[0].radiusKm).toBe(startRadiusKm)
      expect(curve[curve.length - 1].radiusKm).toBe(chosenRadiusKm)
      expect(curve[0].progress).toBe(0)
      expect(curve[curve.length - 1].progress).toBe(1)
      const logSteps = curve.slice(1).map((pt, i) => Math.log(pt.radiusKm) - Math.log(curve[i].radiusKm))
      const sign = Math.sign(logSteps[0])
      for (const step of logSteps) {
        expect(Math.sign(step)).toBe(sign)
        expect(step).toBeCloseTo(logSteps[0], 9)
      }
    }
  })

  it('reports becomesBlackHole consistently with isBlackHole, and the chosen radius in horizon radii', () => {
    for (const p of OBJECT_PRESETS) {
      const rs = horizonRadiusKm(p.massSolarMasses)
      for (const k of [0.1, 0.99, 1, 1.01, 10]) {
        const result = runBlackHoleSizeExperiment(p.id, rs * k)
        expect(result.becomesBlackHole).toBe(isBlackHole(rs * k, p.massSolarMasses))
        expect(result.becomesBlackHole).toBe(k <= 1)
        expect(result.chosenInHorizonRadii).toBeCloseTo(k, 9)
        expect(result.escapeSpeedFractionOfLight).toBeCloseTo(Math.sqrt(1 / k), 9)
      }
    }
  })

  it('rejects an unknown object and a non-positive radius', () => {
    expect(() => runBlackHoleSizeExperiment('moon' as never, 1)).toThrow()
    expect(() => runBlackHoleSizeExperiment('sun', 0)).toThrow()
  })
})

describe('reuse (CLAUDE.md §8)', () => {
  it('imports its constants from darkMatterExperiment and hubblesLawExperiment, and not from blackHoleExperiment', async () => {
    const source = await import('node:fs/promises').then((fs) =>
      fs.readFile(new URL('./blackHoleSizeExperiment.ts', import.meta.url), 'utf-8'),
    )
    const importLines = source.split('\n').filter((line: string) => line.trim().startsWith('import'))
    const from = (name: string) => importLines.filter((line: string) => line.includes(name)).join(' ')
    expect(from('darkMatterExperiment')).toContain('GRAVITATIONAL_CONSTANT_KPC_KMS2_PER_SOLAR_MASS')
    expect(from('darkMatterExperiment')).toContain('KM_PER_KPC')
    expect(from('hubblesLawExperiment')).toContain('REAL_SPEED_OF_LIGHT_KM_PER_S')
    expect(importLines.some((line: string) => line.includes('/blackHoleExperiment'))).toBe(false)
  })
})

describe('audit update: guess marks and the fixed Part 1 run', () => {
  it('the three radius guesses are 6,000, 30 and 3 km, and only about 3 km is the model answer', () => {
    expect(SUN_RADIUS_GUESS_KM).toEqual({ 'about-6000-km': 6000, 'about-30-km': 30, 'about-3-km': 3 })
    expect(sunRadiusGuessIsModelAnswer('about-3-km')).toBe(true)
    expect(sunRadiusGuessIsModelAnswer('about-30-km')).toBe(false)
    expect(sunRadiusGuessIsModelAnswer('about-6000-km')).toBe(false)
  })

  it('a guess sits at its own place on the ruler, in multiples of the real horizon radius', () => {
    within(guessInHorizonRadii('about-3-km'), 3 / 2.953, 0.001)
    within(guessInHorizonRadii('about-30-km'), 30 / 2.953, 0.001)
    expect(guessInHorizonRadii('about-6000-km')).toBeGreaterThan(guessInHorizonRadii('about-30-km'))
    expect(guessInHorizonRadii('about-30-km')).toBeGreaterThan(guessInHorizonRadii('about-3-km'))
  })

  it('the three mass-scaling guesses are 10, 1,000 and a million, and only 1,000 is the model answer', () => {
    expect(MASS_SCALING_GUESS_RATIO).toEqual({ ten: 10, thousand: 1000, million: 1_000_000 })
    expect(massScalingGuessIsModelAnswer('thousand')).toBe(true)
    expect(massScalingGuessIsModelAnswer('ten')).toBe(false)
    expect(massScalingGuessIsModelAnswer('million')).toBe(false)
  })

  it('the comparison pair is one Sun and 1,000 Suns and the real horizon ratio is exactly 1,000', () => {
    const c = compareHorizonsOfSunAndThousandSuns()
    expect(COMPARISON_MASS_RATIO).toBe(1000)
    expect(c.smallMassSolarMasses).toBe(1)
    expect(c.largeMassSolarMasses).toBe(1000)
    expect(c.realRatio).toBeCloseTo(1000, 9)
    within(c.smallHorizonKm, 2.953, 0.001)
    within(c.largeHorizonKm, 2953, 0.001)
  })

  it('the guessed bar follows the guess and the real bar does not', () => {
    within(guessedLargeHorizonKm('thousand'), horizonRadiusKm(1000), 1e-9)
    expect(guessedLargeHorizonKm('ten')).toBeLessThan(guessedLargeHorizonKm('thousand'))
    expect(guessedLargeHorizonKm('million')).toBeGreaterThan(guessedLargeHorizonKm('thousand'))
    const before = compareHorizonsOfSunAndThousandSuns()
    guessedLargeHorizonKm('million')
    expect(compareHorizonsOfSunAndThousandSuns()).toEqual(before)
  })

  it('the fixed Part 1 run squeezes the real Sun from 695,700 km to exactly its horizon radius', () => {
    const r = runPartOneSqueeze()
    expect(r.preset.id).toBe('sun')
    expect(r.startRadiusKm).toBe(695_700)
    expect(r.startIsHypothetical).toBe(false)
    expect(r.chosenInHorizonRadii).toBeCloseTo(1, 12)
    expect(r.becomesBlackHole).toBe(true)
    within(r.squeezeNeeded as number, 695_700 / 2.953, 0.001)
    expect(r.escapeSpeedFractionOfLight).toBeCloseTo(1, 12)
  })

  it('does not depend on any guess (the module has no guess state to read)', () => {
    expect(runPartOneSqueeze()).toEqual(runPartOneSqueeze())
  })
})

describe('audit update: the six object cards', () => {
  const cards = objectCards()
  const card = (id: string) => cards.find((c) => c.id === id)!

  it('lists the six objects in the preset order', () => {
    expect(cards.map((c) => c.id)).toEqual(OBJECT_PRESETS.map((p) => p.id))
  })

  it('gives each horizon from the module and in AU', () => {
    for (const c of cards) {
      expect(c.horizonRadiusKm).toBe(horizonRadiusKm(c.massSolarMasses))
      expect(c.horizonRadiusAu).toBeCloseTo(c.horizonRadiusKm / KM_PER_AU, 12)
    }
    within(card('earth').horizonRadiusKm * 1e6, 8.87, 0.01) // millimeters
    within(card('sun').horizonRadiusKm, 2.953, 0.001)
    within(card('sgr-a-star').horizonRadiusAu, 0.085, 0.01)
    within(card('m87-star').horizonRadiusAu, 128, 0.01)
  })

  it('the neutron star horizon is about a third of its radius; the three black holes have no real radius', () => {
    within(card('neutron-star').horizonOverRealRadius as number, 4.13 / 12, 0.01)
    for (const id of ['stellar-black-hole', 'sgr-a-star', 'm87-star']) {
      expect(card(id).realRadiusKm).toBeNull()
      expect(card(id).horizonOverRealRadius).toBeNull()
      expect(card(id).alreadyBlackHole).toBe(true)
    }
    expect(card('sun').alreadyBlackHole).toBe(false)
  })
})

describe('audit update: the check-up', () => {
  const rows = checkUpRows()
  const row = (start: string) => rows.find((r) => r.what.startsWith(start))!

  it('escape speed at the horizon is the speed of light: the same', () => {
    expect(row('Escape speed').found).toBeCloseTo(1, 12)
    expect(row('Escape speed').reading).toBe('the same')
  })

  it('the Sun and 10 Suns agree with the published 3 km and 30 km to the rounding, and not exactly', () => {
    expect(row('Horizon radius of 1 Sun').reading).toBe('the same, to the rounding')
    expect(row('Horizon radius of 10 Suns').reading).toBe('the same, to the rounding')
    expect(row('Horizon radius of 1 Sun').found).not.toBe(PUBLISHED.kmPerSolarMass)
  })

  it('the sizes used for the Sun and Earth are the published values', () => {
    expect(row("The Sun's radius").reading).toBe('the same')
    expect(row("The Earth's radius").reading).toBe('the same')
  })

  it("the neutron star's 12 km is inside the published range 11.36 to 13.7", () => {
    expect(row('Neutron-star').reading).toBe('inside the published range')
  })

  it("Sagittarius A*'s 4.3 million is 7.5% more than ESO's rounder four million", () => {
    expect(percentDifference(4.3e6, 4.0e6)).toBeCloseTo(7.5, 9)
    expect(row("Sagittarius A*'s mass").reading).toBe("7.5% more than ESO's rounder figure")
  })

  it('the readings do not invent cut-offs: a value off by a little is a different value, not close enough', () => {
    expect(readAgainstPublished(3.6, 3)).toBe('a different value')
    expect(readAgainstPublished(3.0, 3)).toBe('the same')
    expect(readAgainstPublished(2.9, 3)).toBe('the same, to the rounding')
    expect(readAgainstRange(11.0, 11.36, 13.7)).toBe('a different value')
    expect(readAgainstRange(13.7, 11.36, 13.7)).toBe('inside the published range')
  })
})

describe('audit update: the escape-speed check with the real Sun', () => {
  const c = sunEscapeSpeedCheck()

  it("starts from NASA's published escape speeds, 617.6 km/s for the Sun and 11.186 km/s for Earth", () => {
    expect(PUBLISHED.sunEscapeSpeedKmPerS).toBe(617.6)
    expect(PUBLISHED.earthEscapeSpeedKmPerS).toBe(11.186)
    expect(c.sunEscapeSpeedKmPerS).toBe(617.6)
  })

  it('uses the same squeeze factor as the fixed Part 1 run, and its square root as the speed growth', () => {
    expect(c.squeezeFactor).toBeCloseTo(runPartOneSqueeze().squeezeNeeded as number, 9)
    expect(c.speedGrowthFactor).toBeCloseTo(Math.sqrt(c.squeezeFactor), 12)
    within(c.speedGrowthFactor, 485.4, 0.001)
  })

  it('comes out at about the speed of light, within 0.1 percent', () => {
    within(c.escapeSpeedAtHorizonKmPerS, 299_792.458, 0.001)
    expect(Math.abs(c.ratioToSpeedOfLight - 1)).toBeLessThan(0.001)
  })

  it("agrees with the Sun's escape speed worked out from its mass and radius in SI units (an independent check on 617.6)", () => {
    const sunEscapeSI = Math.sqrt((2 * G_SI * SOLAR_MASS_KG) / (695_700 * 1000)) / 1000
    within(c.sunEscapeSpeedKmPerS, sunEscapeSI, 0.001)
  })

  it("agrees with Earth's published escape speed worked out from its mass and radius (an independent check on 11.186)", () => {
    const earthEscapeSI = Math.sqrt((2 * G_SI * 5.9722e24) / (6_371_000)) / 1000
    within(PUBLISHED.earthEscapeSpeedKmPerS, earthEscapeSI, 0.001)
  })
})
