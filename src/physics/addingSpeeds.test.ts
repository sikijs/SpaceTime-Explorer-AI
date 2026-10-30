import { describe, it, expect } from 'vitest'
import {
  combineSpeeds,
  everydaySum,
  gapFromEveryday,
  relativeSpeed,
  PRESET_SHIP_SPEED,
  PRESET_PROBE_SPEED,
  lightSpeedInMovingMedium,
  fresnelDragCoefficient,
  exactDragCoefficient,
  PION_SOURCE_SPEED,
  pionFlashEveryday,
  pionFlashRule,
  measuredShareOfLightSpeed,
  measuredGiveOrTakeShare,
  measuredAgreesWithLightSpeed,
  everydayMissInGiveOrTakes,
  nearestChoice,
  SPEED_ANSWER_CHOICES,
  FLASH_ANSWER_CHOICES,
  predictionOneAnswerId,
  predictionTwoAnswerId,
} from './addingSpeeds'

describe('the rule for adding speeds', () => {
  it('gives the specified values', () => {
    expect(combineSpeeds(0.5, 0.5)).toBeCloseTo(0.8, 12)
    expect(combineSpeeds(0.9, 0.9)).toBeCloseTo(1.8 / 1.81, 12)
    expect(combineSpeeds(0.9, 0.9)).toBeCloseTo(0.99448, 5)
    expect(combineSpeeds(0.99, 0.99)).toBeCloseTo(1.98 / 1.9801, 12)
    expect(combineSpeeds(0.99, 0.99)).toBeCloseTo(0.99995, 5)
    expect(combineSpeeds(0.1, 0.1)).toBeCloseTo(0.19802, 5)
  })
  it('gives exactly c when either speed is c', () => {
    for (const a of [0, 0.1, 0.5, 0.99, 1]) {
      expect(combineSpeeds(a, 1)).toBeCloseTo(1, 12)
      expect(combineSpeeds(1, a)).toBeCloseTo(1, 12)
    }
  })
  it('never reaches c from two speeds below c', () => {
    for (const a of [0, 0.1, 0.5, 0.9, 0.99, 0.9999])
      for (const b of [0, 0.1, 0.5, 0.9, 0.99, 0.9999]) expect(combineSpeeds(a, b)).toBeLessThan(1)
  })
  it('is symmetric, and adding nothing changes nothing', () => {
    expect(combineSpeeds(0.3, 0.8)).toBeCloseTo(combineSpeeds(0.8, 0.3), 14)
    expect(combineSpeeds(0.7, 0)).toBeCloseTo(0.7, 14)
    expect(combineSpeeds(0, 0.7)).toBeCloseTo(0.7, 14)
  })
  it('is within 0.1 percent of the everyday sum for small speeds', () => {
    expect(Math.abs(combineSpeeds(0.01, 0.01) / everydaySum(0.01, 0.01) - 1)).toBeLessThan(0.001)
  })
  it('rejects speeds outside 0 to c', () => {
    expect(() => combineSpeeds(-0.1, 0.5)).toThrow(RangeError)
    expect(() => combineSpeeds(0.5, 1.1)).toThrow(RangeError)
    expect(() => combineSpeeds(Number.NaN, 0.5)).toThrow(RangeError)
  })
})

describe('the gap from the everyday sum', () => {
  it('is 0.2 for 0.5 and 0.5 and grows with the ship speed for a fixed probe speed', () => {
    expect(gapFromEveryday(0.5, 0.5)).toBeCloseTo(0.2, 12)
    expect(gapFromEveryday(0.1, 0.5)).toBeLessThan(gapFromEveryday(0.5, 0.5))
    expect(gapFromEveryday(0.5, 0.5)).toBeLessThan(gapFromEveryday(0.9, 0.5))
  })
  it('is a when the probe is light (everyday sum 1 + a, rule 1)', () => {
    expect(gapFromEveryday(0.5, 1)).toBeCloseTo(0.5, 12)
  })
})

describe('the speed seen the other way', () => {
  it('recovers the probe speed relative to the ship', () => {
    for (const [a, b] of [[0.5, 0.5], [0.9, 0.1], [0.99, 0.5], [0.1, 0.9]]) {
      expect(relativeSpeed(combineSpeeds(a, b), a)).toBeCloseTo(b, 10)
    }
  })
})

describe('light in moving water (Fizeau, von Laue)', () => {
  it('gives the Fresnel coefficient 1 - 1/n^2 for small water speeds', () => {
    expect(fresnelDragCoefficient(1.33)).toBeCloseTo(0.4347, 4)
    const vOverC = 10 / 299792458 // water at 10 m/s
    expect(Math.abs(exactDragCoefficient(1.33, vOverC) / fresnelDragCoefficient(1.33) - 1)).toBeLessThan(0.001)
  })
  it('is below the full everyday addition and above the still-water speed', () => {
    const v = 1e-6
    const still = 1 / 1.33
    const moving = lightSpeedInMovingMedium(1.33, v)
    expect(moving).toBeGreaterThan(still)
    expect(moving).toBeLessThan(still + v)
  })
  it('has no drag in a vacuum (n = 1) and rejects n below 1', () => {
    expect(fresnelDragCoefficient(1)).toBe(0)
    expect(lightSpeedInMovingMedium(1, 0.3)).toBeCloseTo(1, 12)
    expect(() => fresnelDragCoefficient(0.9)).toThrow(RangeError)
  })
})

describe('the CERN test of 1964', () => {
  it('compares the everyday sum, the rule and the measurement', () => {
    expect(pionFlashEveryday()).toBeCloseTo(1.99975, 10)
    expect(pionFlashRule()).toBeCloseTo(1, 10)
    expect(PION_SOURCE_SPEED).toBe(0.99975)
  })
  it('has a measured value within its give-or-take of c, and far from the everyday sum', () => {
    expect(measuredShareOfLightSpeed()).toBeCloseTo(2.9977 / 2.9979, 10)
    expect(measuredGiveOrTakeShare()).toBeCloseTo(0.0004 / 2.9979, 10)
    expect(measuredAgreesWithLightSpeed()).toBe(true)
    expect(everydayMissInGiveOrTakes()).toBeGreaterThan(1000)
  })
})

describe('the answers', () => {
  it('Prediction 1 is 0.8 c and Prediction 2 is about c', () => {
    expect(PRESET_SHIP_SPEED).toBe(0.5)
    expect(PRESET_PROBE_SPEED).toBe(0.5)
    expect(predictionOneAnswerId()).toBe('point8')
    expect(predictionTwoAnswerId()).toBe('about-c')
  })
  it('the nearest-answer helper picks the closest button', () => {
    expect(nearestChoice(SPEED_ANSWER_CHOICES, 0.84, (c) => c.value).id).toBe('point8')
    expect(nearestChoice(SPEED_ANSWER_CHOICES, 0.96, (c) => c.value).id).toBe('one')
    expect(nearestChoice(FLASH_ANSWER_CHOICES, 1.7, (c) => c.value).id).toBe('about-1.5c')
  })
})

describe('independence from predictions', () => {
  it('gives the same results however often it is called (nothing stored)', () => {
    const first = [combineSpeeds(0.5, 0.5), pionFlashRule(), fresnelDragCoefficient(1.33)]
    predictionOneAnswerId()
    predictionTwoAnswerId()
    expect([combineSpeeds(0.5, 0.5), pionFlashRule(), fresnelDragCoefficient(1.33)]).toEqual(first)
  })
})
