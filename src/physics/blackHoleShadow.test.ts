import { describe, it, expect } from 'vitest'
import {
  M87_STAR,
  SGR_A_STAR,
  M87_RING_2017_TO_2021,
  KM_PER_PARSEC,
  shadowDiameterKm,
  shadowOverHorizon,
  angularSizeMicroarcsec,
  shadowAngleMicroarcsec,
  realShadowMicroarcsec,
  massRatio,
  distanceRatio,
  calculatedSizeRatio,
  measuredSizeRatio,
  compareWithMeasured,
  checkRealBlackHole,
  SIZE_CHOICES,
  sizeAnswer,
  sizeChoiceRatio,
  sizeGuessResult,
  HORIZON_CHOICES,
  horizonAnswer,
  horizonGuessResult,
  guessShadowDiameterKm,
} from './blackHoleShadow'
import { horizonRadiusKm } from './blackHoleSizeExperiment'

const G = 6.6743e-11
const C = 299792458
const SUN = 1.98847e30

describe('the shadow diameter', () => {
  it('is 6 sqrt(3) G M / c^2, worked out separately in SI units', () => {
    for (const m of [10, 4e6, 6.5e9]) {
      const gmOverC2Km = (G * m * SUN) / (C * C) / 1000
      expect(shadowDiameterKm(m) / (6 * Math.sqrt(3) * gmOverC2Km)).toBeCloseTo(1, 3)
    }
  })
  it('is 2.598 times the horizon diameter for any mass', () => {
    for (const m of [1, 30, 4e6, 6.5e9]) {
      expect(shadowDiameterKm(m) / (2 * horizonRadiusKm(m))).toBeCloseTo(3 * Math.sqrt(3) / 2, 9)
    }
    expect(shadowOverHorizon()).toBeCloseTo(2.598076, 5)
  })
  it('rejects a mass that is not positive and finite', () => {
    expect(() => shadowDiameterKm(0)).toThrow(RangeError)
    expect(() => shadowDiameterKm(-1)).toThrow(RangeError)
    expect(() => shadowDiameterKm(Infinity)).toThrow(RangeError)
  })
})

describe('the angle in the sky', () => {
  it('gives about 39.7 microarcseconds for M87* and 50.35 for Sagittarius A*', () => {
    expect(realShadowMicroarcsec(M87_STAR)).toBeCloseTo(39.7, 1)
    expect(realShadowMicroarcsec(SGR_A_STAR)).toBeCloseTo(50.35, 1)
  })
  it('is proportional to the mass and inversely proportional to the distance', () => {
    const base = shadowAngleMicroarcsec(1e6, 1e4)
    expect(shadowAngleMicroarcsec(2e6, 1e4) / base).toBeCloseTo(2, 9)
    expect(shadowAngleMicroarcsec(1e6, 2e4) / base).toBeCloseTo(0.5, 9)
  })
  it('turns a width and a distance into an angle (1 AU at 1 parsec is 1 arcsecond)', () => {
    const au = 149597870.7
    expect(angularSizeMicroarcsec(au, KM_PER_PARSEC)).toBeCloseTo(1e6, -1)
  })
  it('rejects a distance that is not positive', () => {
    expect(() => shadowAngleMicroarcsec(1e6, 0)).toThrow(RangeError)
    expect(() => angularSizeMicroarcsec(1, -1)).toThrow(RangeError)
  })
})

describe('the two real black holes', () => {
  it('has the mass ratio 1,625 and the distance ratio about 2,061', () => {
    expect(massRatio()).toBeCloseTo(1625, 6)
    expect(distanceRatio()).toBeCloseTo(16.8e6 / 8.15e3, 6)
    expect(distanceRatio()).toBeGreaterThan(2060)
    expect(distanceRatio()).toBeLessThan(2062)
  })
  it('has the calculated size ratio equal to mass ratio over distance ratio, about 0.79', () => {
    expect(calculatedSizeRatio()).toBeCloseTo(massRatio() / distanceRatio(), 9)
    expect(calculatedSizeRatio()).toBeCloseTo(0.788, 2)
    expect(calculatedSizeRatio()).toBeLessThan(1)
  })
  it('has measured rings with a ratio below 1 as well (0.81 with 42, 0.85 with 43.9)', () => {
    expect(measuredSizeRatio()).toBeCloseTo(42 / 51.8, 9)
    expect(measuredSizeRatio(true)).toBeCloseTo(43.9 / 51.8, 9)
    expect(measuredSizeRatio(true)).toBeLessThan(1)
  })
  it('holds the published values as given', () => {
    expect(M87_STAR.ringMicroarcsec).toBe(42)
    expect(M87_STAR.ringUncertainty).toBe(3)
    expect(M87_RING_2017_TO_2021).toEqual({ ringMicroarcsec: 43.9, ringUncertainty: 0.6 })
    expect(SGR_A_STAR.ringMicroarcsec).toBe(51.8)
    expect(SGR_A_STAR.ringUncertainty).toBe(2.3)
    expect(M87_STAR.massSolar).toBe(6.5e9)
    expect(SGR_A_STAR.massSolar).toBe(4.0e6)
    expect(M87_STAR.distancePc).toBe(16.8e6)
    expect(SGR_A_STAR.distancePc).toBe(8.15e3)
  })
})

describe('calculated against measured', () => {
  it('reports the difference in microarcseconds, percent and uncertainties', () => {
    const c = compareWithMeasured(50, 40, 5)
    expect(c.differenceMicroarcsec).toBe(10)
    expect(c.differencePercent).toBe(25)
    expect(c.differenceInUncertainties).toBe(2)
    expect(c.withinOneUncertainty).toBe(false)
    const d = compareWithMeasured(38, 40, 5)
    expect(d.differenceMicroarcsec).toBe(-2)
    expect(d.differencePercent).toBe(-5)
    expect(d.differenceInUncertainties).toBeCloseTo(-0.4, 12)
    expect(d.withinOneUncertainty).toBe(true)
  })
  it('puts the calculated M87* shadow below the 2019 ring by about 2.3 microarcseconds, within its 3', () => {
    const c = checkRealBlackHole(M87_STAR)
    expect(c.differenceMicroarcsec).toBeCloseTo(39.7 - 42, 1)
    expect(c.withinOneUncertainty).toBe(true)
  })
  it('puts it about 4.2 below the later 43.9 ring, which is many more of its small uncertainty', () => {
    const c = checkRealBlackHole(M87_STAR, true)
    expect(c.differenceMicroarcsec).toBeCloseTo(39.7 - 43.9, 1)
    expect(c.differenceInUncertainties).toBeLessThan(-5)
    expect(c.withinOneUncertainty).toBe(false)
  })
  it('puts the calculated Sagittarius A* shadow about 1.5 below its ring, within its 2.3', () => {
    const c = checkRealBlackHole(SGR_A_STAR)
    expect(c.differenceMicroarcsec).toBeCloseTo(50.35 - 51.8, 1)
    expect(c.withinOneUncertainty).toBe(true)
  })
  it('rejects a measured value or uncertainty that is not positive', () => {
    expect(() => compareWithMeasured(1, 0, 1)).toThrow(RangeError)
    expect(() => compareWithMeasured(1, 1, 0)).toThrow(RangeError)
  })
})

describe('the predictions', () => {
  it('answers Prediction 1 with "a little smaller"', () => {
    expect(sizeAnswer()).toBe('a-little-smaller')
    expect(sizeGuessResult('a-little-smaller')).toBe('matched')
    expect(sizeGuessResult('much-bigger')).toBe('not matched')
    expect(sizeGuessResult('about-the-same')).toBe('not matched')
  })
  it('has Prediction 1 buttons balanced about 1 on a log scale, two on each side and one at 1', () => {
    const logs = SIZE_CHOICES.map((c) => Math.log(c.ratio))
    expect(logs.reduce((a, b) => a + b, 0)).toBeCloseTo(0, 12)
    expect(sizeChoiceRatio('about-the-same')).toBe(1)
    expect(() => sizeChoiceRatio('nonsense' as never)).toThrow(RangeError)
  })
  it('answers Prediction 2 with the button nearest 2.6, which is 3', () => {
    expect(horizonAnswer()).toBe(3)
    expect(horizonGuessResult(3)).toBe('matched')
    for (const c of HORIZON_CHOICES.filter((x) => x !== 3)) expect(horizonGuessResult(c)).toBe('not matched')
  })
  it('draws a guess as a shadow that is that many times the horizon diameter', () => {
    expect(guessShadowDiameterKm(10, 1)).toBeCloseTo(2 * horizonRadiusKm(10), 9)
    expect(guessShadowDiameterKm(10, 3)).toBeCloseTo(6 * horizonRadiusKm(10), 9)
    expect(guessShadowDiameterKm(10, 3)).not.toBeCloseTo(shadowDiameterKm(10), 3)
    expect(() => guessShadowDiameterKm(10, 0)).toThrow(RangeError)
  })
  it('does not depend on any guess (the real results are fixed)', () => {
    const before = [realShadowMicroarcsec(M87_STAR), realShadowMicroarcsec(SGR_A_STAR), calculatedSizeRatio()]
    sizeGuessResult('much-smaller')
    horizonGuessResult(10)
    guessShadowDiameterKm(1, 10)
    expect([realShadowMicroarcsec(M87_STAR), realShadowMicroarcsec(SGR_A_STAR), calculatedSizeRatio()]).toEqual(before)
  })
})
