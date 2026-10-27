import { describe, it, expect } from 'vitest'
import {
  eddingtonTimeYears,
  nonSpinningEfficiency,
  efficiencyChoices,
  MAX_SPIN_EFFICIENCY,
  growthTimeYears,
  massAfterYears,
  growthTimesNeeded,
  yearsToGrow,
  smallestSeedSolar,
  CAPERS_LRD_Z9,
  objectMassSolar,
  objectAgeYears,
  timeAvailableYears,
  SEED_START_AGE_YEARS,
  timeRulerPosition,
  massRulerPosition,
  TIME_CHOICES,
  predictionTimeYears,
  timeAnswer,
  timeGuessResult,
  timeGuessMarker,
  SEED_CHOICES,
  predictionSeedSolar,
  seedAnswer,
  seedGuessResult,
  seedGuessMarker,
  trialPicture,
  TRIAL_SEED_CHOICES_SOLAR,
  nearestOnLogScale,
} from './blackHoleGrowth'
import { ageAfterBigBangYears } from './earliestGalaxies'

const GYR = 1e9
const MYR = 1e6

describe('the Eddington growth time', () => {
  it('is 0.45 billion years, worked separately in SI units (test 1)', () => {
    // sigma_T c / (4 pi G m_p) with the constants typed here, in seconds, then years
    const seconds = (6.6524587e-29 * 2.99792458e8) / (4 * Math.PI * 6.6743e-11 * 1.67262192e-27)
    expect(seconds / (365.25 * 86400) / GYR).toBeCloseTo(0.4505, 3)
    expect(eddingtonTimeYears() / GYR).toBeGreaterThan(0.44)
    expect(eddingtonTimeYears() / GYR).toBeLessThan(0.46)
  })

  it('gives a growth time of 50 million years at 10 percent, shorter at 5.7 percent and longer at 40 percent (test 2)', () => {
    expect(growthTimeYears(0.1) / MYR).toBeCloseTo(50.06, 1)
    expect(growthTimeYears(nonSpinningEfficiency())).toBeLessThan(growthTimeYears(0.1))
    expect(growthTimeYears(0.4)).toBeGreaterThan(growthTimeYears(0.1))
    expect(growthTimeYears(0.4) / MYR).toBeCloseTo(300.3, 0)
  })

  it('uses Black Holes 8 for the non-spinning efficiency, about 5.7 percent', () => {
    expect(nonSpinningEfficiency()).toBeCloseTo(1 - Math.sqrt(8 / 9), 4)
    expect(efficiencyChoices()).toHaveLength(3)
    expect(efficiencyChoices()[2]).toBeLessThan(MAX_SPIN_EFFICIENCY)
    expect(MAX_SPIN_EFFICIENCY).toBeCloseTo(0.4226, 3)
  })

  it('rejects an efficiency outside 0 to 1', () => {
    expect(() => growthTimeYears(0)).toThrow(RangeError)
    expect(() => growthTimeYears(1)).toThrow(RangeError)
  })
})

describe('growing at the limit', () => {
  it('takes 0.76 billion years from 10 Suns and 0.30 billion from 100,000 Suns to reach 38 million Suns (test 3)', () => {
    expect(objectMassSolar() / 1e6).toBeCloseTo(38.0, 1)
    expect(growthTimesNeeded(10, objectMassSolar())).toBeCloseTo(15.15, 1)
    expect(yearsToGrow(10, objectMassSolar()) / GYR).toBeCloseTo(0.76, 2)
    expect(yearsToGrow(1e5, objectMassSolar()) / GYR).toBeCloseTo(0.30, 2)
  })

  it('multiplies the mass by the same factor in every equal span of time; a doubled seed saves ln 2 growth times (test 4)', () => {
    const m0 = 100
    const t = 80 * MYR
    const once = massAfterYears(m0, t) / m0
    const twice = massAfterYears(m0, 2 * t) / massAfterYears(m0, t)
    expect(twice).toBeCloseTo(once, 9)
    expect(growthTimesNeeded(10, 1e7) - growthTimesNeeded(20, 1e7)).toBeCloseTo(Math.LN2, 12)
    expect(yearsToGrow(10, 1e7) - yearsToGrow(20, 1e7)).toBeCloseTo(Math.LN2 * growthTimeYears(0.1), 3)
  })

  it('is one e-folding, a factor e, in one growth time', () => {
    expect(massAfterYears(1, growthTimeYears(0.1))).toBeCloseTo(Math.E, 9)
  })

  it('smallestSeedSolar is the inverse of massAfterYears (test 6)', () => {
    const seed = smallestSeedSolar(objectMassSolar(), 400 * MYR)
    expect(massAfterYears(seed, 400 * MYR)).toBeCloseTo(objectMassSolar(), 0)
    expect(smallestSeedSolar(objectMassSolar(), 0)).toBeCloseTo(objectMassSolar(), 6)
  })

  it('rejects impossible inputs', () => {
    expect(() => massAfterYears(0, 1)).toThrow(RangeError)
    expect(() => massAfterYears(1, -1)).toThrow(RangeError)
    expect(() => timeAvailableYears(1e12)).toThrow(RangeError)
  })
})

describe('the age of the universe at the object', () => {
  it("is Experiment 5's function at z = 9.288, about 0.5 billion years (test 5)", () => {
    expect(objectAgeYears()).toBe(ageAfterBigBangYears(9.288))
    expect(objectAgeYears() / GYR).toBeGreaterThan(0.5)
    expect(objectAgeYears() / GYR).toBeLessThan(0.55)
    expect(timeAvailableYears()).toBeCloseTo(objectAgeYears() - SEED_START_AGE_YEARS, 0)
  })
})

describe('the published object (test 8)', () => {
  it('is held as listed', () => {
    expect(CAPERS_LRD_Z9.redshift).toBe(9.288)
    expect(CAPERS_LRD_Z9.logMass).toBe(7.58)
    expect(CAPERS_LRD_Z9.logMassPlusMinus).toBe(0.15)
    expect(CAPERS_LRD_Z9.minMassSolar).toBe(4.5e6)
    expect(CAPERS_LRD_Z9.maxMassSolar).toBe(3.16e8)
  })
})

describe('the rulers', () => {
  it('place values on a log scale from 0 to 1', () => {
    expect(timeRulerPosition(1e6)).toBe(0)
    expect(timeRulerPosition(1e10)).toBe(1)
    expect(timeRulerPosition(1e8)).toBeCloseTo(0.5, 12)
    expect(massRulerPosition(1)).toBe(0)
    expect(massRulerPosition(1e9)).toBe(1)
    expect(massRulerPosition(1e3)).toBeCloseTo(1 / 3, 12)
  })
})

describe('the nearest-answer helper (test 7)', () => {
  it('compares on a log scale, not a linear one', () => {
    // 3 billion years is nearer 800 million in a straight line (2.2 against 5 billion) but nearer 8 billion on a log scale (a factor 2.7 against 3.75)
    expect(nearestOnLogScale(TIME_CHOICES, 3e9, (c) => c.years).id).toBe('t8b')
    expect(nearestOnLogScale(TIME_CHOICES, 3.5e8, (c) => c.years).id).toBe('t300m')
  })
})

describe('Prediction 1: the time from 10 Suns', () => {
  it('has the answer "about 800 million years" (test 7)', () => {
    expect(predictionTimeYears() / GYR).toBeCloseTo(0.76, 2)
    expect(timeAnswer()).toBe('t800m')
    expect(timeGuessResult('t800m')).toBe('matched')
    expect(timeGuessResult('t300m')).toBe('not matched')
    expect(timeGuessResult('t8b')).toBe('not matched')
  })

  it('picks the nearest button on a log scale and does not depend on the guess (test 10)', () => {
    const before = predictionTimeYears()
    TIME_CHOICES.forEach((c) => timeGuessMarker(c.id))
    expect(predictionTimeYears()).toBe(before)
  })

  it('draws a different marker for each guess, in order', () => {
    const positions = TIME_CHOICES.map((c) => timeGuessMarker(c.id).position)
    for (let i = 1; i < positions.length; i++) expect(positions[i]).toBeGreaterThan(positions[i - 1])
  })
})

describe('Prediction 2: the smallest seed', () => {
  it('is about 8,600 Suns, and the answer button is "about 10,000 Suns" (test 7)', () => {
    // by hand: 3.8e7 x exp(-(0.52 - 0.10) / 0.05006)
    const seed = predictionSeedSolar()
    expect(seed).toBeGreaterThan(5e3)
    expect(seed).toBeLessThan(1.5e4)
    expect(seedAnswer()).toBe('s10k')
    expect(seedGuessResult('s10k')).toBe('matched')
    expect(seedGuessResult('s300')).toBe('not matched')
    expect(seedGuessResult('s300k')).toBe('not matched')
  })

  it('has buttons balanced about the answer on a log scale', () => {
    const logs = SEED_CHOICES.map((c) => Math.log10(c.solar))
    const answerLog = Math.log10(predictionSeedSolar())
    expect(Math.min(...logs)).toBeLessThan(answerLog - 2)
    expect(Math.max(...logs)).toBeGreaterThan(answerLog + 2)
    SEED_CHOICES.forEach((c) => expect(seedGuessMarker(c.id).solar).toBe(c.solar))
  })

  it('grows the answer seed to the object exactly in the time available', () => {
    expect(massAfterYears(predictionSeedSolar(), timeAvailableYears())).toBeCloseTo(objectMassSolar(), 0)
  })
})

describe('Drawing A: trial values (test 9)', () => {
  it('a trial seed of 10 Suns at 10 percent reproduces Prediction 1 and does not fit', () => {
    const t = trialPicture(10, 0.1)
    expect(t.yearsNeeded).toBeCloseTo(predictionTimeYears(), 0)
    expect(t.fits).toBe(false)
    expect(t.needOverAvailable).toBeGreaterThan(1)
    expect(t.doublings).toBeCloseTo(t.growthTimes / Math.LN2, 12)
  })

  it('a seed of 100,000 Suns at 10 percent fits', () => {
    const t = trialPicture(1e5, 0.1)
    expect(t.fits).toBe(true)
    expect(t.yearsNeeded / GYR).toBeCloseTo(0.3, 1)
  })

  it('flips from not fitting to fitting at the boundary seed and not before', () => {
    const boundary = predictionSeedSolar()
    expect(trialPicture(boundary * 0.99, 0.1).fits).toBe(false)
    expect(trialPicture(boundary * 1.01, 0.1).fits).toBe(true)
  })

  it('a higher efficiency never helps: 40 percent fits no trial seed shown, and a lower one needs less time', () => {
    for (const seed of TRIAL_SEED_CHOICES_SOLAR) {
      expect(trialPicture(seed, 0.4).yearsNeeded).toBeGreaterThan(trialPicture(seed, 0.1).yearsNeeded)
      expect(trialPicture(seed, nonSpinningEfficiency()).yearsNeeded).toBeLessThan(trialPicture(seed, 0.1).yearsNeeded)
    }
    expect(TRIAL_SEED_CHOICES_SOLAR.some((s) => trialPicture(s, 0.4).fits)).toBe(false)
  })

  it('places the seed and the object on the mass ruler', () => {
    const t = trialPicture(1e3, 0.1)
    expect(t.seedPosition).toBeCloseTo(1 / 3, 12)
    expect(t.objectPosition).toBeCloseTo(Math.log10(objectMassSolar()) / 9, 12)
  })
})

import { pictureOne, pictureTwo, STAIRCASE_STEPS, TIME_TICKS_YEARS, MASS_TICKS_SOLAR } from './blackHoleGrowth'

describe('Picture 1 and Picture 2 (Step 4)', () => {
  it('Picture 1 reproduces Prediction 1 and the clock of the universe', () => {
    const p = pictureOne()
    expect(p.neededYears).toBeCloseTo(predictionTimeYears(), 0)
    expect(p.ageYears).toBe(objectAgeYears())
    expect(p.availableYears).toBeCloseTo(p.ageYears - p.startAgeYears, 0)
    expect(p.neededOverAvailable).toBeCloseTo(p.neededYears / p.availableYears, 12)
    expect(p.neededOverAvailable).toBeGreaterThan(1.7)
    expect(p.neededOverAvailable).toBeLessThan(1.9)
    expect(p.shortfallYears).toBeCloseTo(p.neededYears - p.availableYears, 0)
    expect(p.growthTimeYears).toBe(growthTimeYears(0.1))
    expect(p.doublingsNeeded).toBeCloseTo(p.growthTimesNeeded / Math.LN2, 12)
  })

  it('the staircase multiplies the mass by e at every step, which is an equal step on a log scale', () => {
    const p = pictureOne()
    expect(p.steps).toHaveLength(STAIRCASE_STEPS + 1)
    expect(p.steps[0].massSolar).toBeCloseTo(10, 9)
    for (let i = 1; i < p.steps.length; i++) {
      expect(p.steps[i].massSolar / p.steps[i - 1].massSolar).toBeCloseTo(Math.E, 9)
      expect(p.steps[i].log10Mass - p.steps[i - 1].log10Mass).toBeCloseTo(Math.LOG10E, 9)
      expect(p.steps[i].years).toBeCloseTo(i * p.growthTimeYears, 0)
    }
  })

  it('every position on the pictures is on its ruler, from 0 to 1, in the right order', () => {
    const p = pictureOne()
    for (const x of [p.growthTimePosition, p.neededPosition, p.agePosition, p.startPosition]) {
      expect(x).toBeGreaterThanOrEqual(0)
      expect(x).toBeLessThanOrEqual(1)
    }
    expect(p.growthTimePosition).toBeLessThan(p.startPosition)
    expect(p.startPosition).toBeLessThan(p.agePosition)
    expect(p.agePosition).toBeLessThan(p.neededPosition)
    const q = pictureTwo()
    expect(q.stellarSeedPosition).toBeLessThan(q.smallestSeedPosition)
    expect(q.smallestSeedPosition).toBeLessThan(q.lowPosition)
    expect(q.lowPosition).toBeLessThan(q.targetPosition)
    expect(q.targetPosition).toBeLessThan(q.highPosition)
  })

  it('Picture 2 reproduces Prediction 2 and grows the smallest seed to the object in exactly the time available', () => {
    const q = pictureTwo()
    expect(q.smallestSeedSolar).toBe(predictionSeedSolar())
    expect(q.yearsFromSmallest).toBeCloseTo(q.availableYears, 0)
    expect(massAfterYears(q.smallestSeedSolar, q.availableYears)).toBeCloseTo(q.targetSolar, 0)
    expect(q.smallestOverStellar).toBeCloseTo(q.smallestSeedSolar / 10, 9)
    expect(q.objectOverSmallest).toBeCloseTo(q.targetSolar / q.smallestSeedSolar, 6)
    expect(q.lowSolar).toBe(4.5e6)
    expect(q.highSolar).toBe(3.16e8)
  })

  it('the ruler ticks cover the pictures', () => {
    expect(TIME_TICKS_YEARS[0]).toBe(1e6)
    expect(TIME_TICKS_YEARS[TIME_TICKS_YEARS.length - 1]).toBe(1e10)
    expect(MASS_TICKS_SOLAR[0]).toBe(1)
    expect(MASS_TICKS_SOLAR[MASS_TICKS_SOLAR.length - 1]).toBe(1e9)
  })

  it('does not change when a guess is made (test 10)', () => {
    const before = JSON.stringify([pictureOne(), pictureTwo()])
    TIME_CHOICES.forEach((c) => timeGuessMarker(c.id))
    SEED_CHOICES.forEach((c) => seedGuessMarker(c.id))
    expect(JSON.stringify([pictureOne(), pictureTwo()])).toBe(before)
  })
})
