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
  speedGuessValue,
  flashGuess,
  trainExample,
  pictureOne,
  pictureTwo,
  pictureThree,
  SHIP_SPEED_CHOICES,
  fizeauWorked,
  pionWorked,
  trialPicture,
  TRIAL_DEFAULT_SHIP_SPEED,
  TRIAL_DEFAULT_PROBE_SPEED,
  PROBE_SPEED_CHOICES,
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

describe('the guess marks', () => {
  it('Prediction 1 marks sit at the speed each button names', () => {
    expect(speedGuessValue('point8')).toBe(0.8)
    expect(speedGuessValue('one')).toBe(1)
    expect(speedGuessValue('point5')).toBe(0.5)
    expect(() => speedGuessValue('nope')).toThrow(RangeError)
  })
  it('Prediction 2 marks sit at the speed each button names, and only "less than c" is a marker only', () => {
    expect(flashGuess('about-2c')).toEqual({ value: 2, markerOnly: false })
    expect(flashGuess('about-c')).toEqual({ value: 1, markerOnly: false })
    expect(flashGuess('less-than-c').markerOnly).toBe(true)
    expect(() => flashGuess('nope')).toThrow(RangeError)
  })
})

describe('the run pictures', () => {
  it('the train: 1 + 20 = 21 m/s, and the rule differs from it only by a factor of about 2 x 10^-16', () => {
    const t = trainExample()
    expect(t.everyday).toBe(21)
    expect(t.excess).toBeCloseTo(2.2253e-16, 19)
  })
  it('Picture 1: the preset gives 1.0 c everyday and 0.8 c by the rule, a gap of 0.2 c', () => {
    const p = pictureOne()
    expect(p.everyday).toBeCloseTo(1, 12)
    expect(p.rule).toBeCloseTo(0.8, 12)
    expect(p.gap).toBeCloseTo(0.2, 12)
  })
  it('Picture 2: the everyday sum adds all of the water speed and the rule adds 1 - 1/n^2 of it', () => {
    const p = pictureTwo()
    expect(p.everydayShare).toBe(1)
    expect(p.ruleShare).toBeCloseTo(0.4347, 4)
    expect(p.stillWaterSpeed).toBeCloseTo(1 / 1.33, 12)
  })
  it('Picture 3: the flash is 1.99975 c everyday, c by the rule, and every ship gives c by the rule', () => {
    const p = pictureThree()
    expect(p.everyday).toBeCloseTo(1.99975, 10)
    expect(p.rule).toBeCloseTo(1, 10)
    expect(p.measured).toBeCloseTo(2.9977 / 2.9979, 10)
    expect(p.flashFromShips.map((r) => r.ship)).toEqual([...SHIP_SPEED_CHOICES])
    for (const r of p.flashFromShips) {
      expect(r.rule).toBeCloseTo(1, 12)
      expect(r.everyday).toBeCloseTo(1 + r.ship, 12)
    }
  })
})

describe('the worked moment of Picture 2', () => {
  it('follows 1 - 1/n^2 step by step', () => {
    const w = fizeauWorked()
    expect(w.nSquared).toBeCloseTo(1.7689, 10)
    expect(w.oneOverNSquared).toBeCloseTo(0.5653, 4)
    expect(w.share).toBeCloseTo(1 - w.oneOverNSquared, 12)
    expect(w.share).toBeCloseTo(0.4347, 4)
    expect(w.stillWaterSpeed).toBeCloseTo(0.7519, 4)
  })
  it('the example water speed gives a denominator of 1 to about 2.5 parts in 100 million, and the exact share agrees with 1 - 1/n^2 to 1 part in 10 million', () => {
    const w = fizeauWorked()
    expect(w.exampleWaterShareOfC).toBeCloseTo(3.3356e-8, 12)
    expect(w.exampleDenominatorExcess).toBeCloseTo(2.508e-8, 11)
    expect(Math.abs(w.exampleExactShare / w.share - 1)).toBeLessThan(1e-7)
  })
})

describe('the worked moment of Picture 3', () => {
  it('has the same top and bottom when the probe is light, so the result is exactly 1', () => {
    const w = pionWorked()
    expect(w.top).toBeCloseTo(1.99975, 10)
    expect(w.bottom).toBeCloseTo(1.99975, 10)
    expect(w.result).toBeCloseTo(1, 12)
  })
  it('gives the 1964 figures in km/s: 299 790 for c, 299 770 measured, give-or-take 40, difference 20, and about 599 505 for the everyday sum', () => {
    const w = pionWorked()
    expect(w.lightKmPerS).toBeCloseTo(299790, 6)
    expect(w.measuredKmPerS).toBeCloseTo(299770, 6)
    expect(w.giveOrTakeKmPerS).toBeCloseTo(40, 6)
    expect(w.differenceFromLightKmPerS).toBeCloseTo(20, 6)
    expect(w.everydayKmPerS).toBeCloseTo(599505.05, 1)
    expect(w.giveOrTakePercentOfLight).toBeCloseTo(0.01334, 4)
  })
})

describe('the trial drawing (Drawing A)', () => {
  it('starts at the preset and reproduces Picture 1 for it', () => {
    expect(TRIAL_DEFAULT_SHIP_SPEED).toBe(0.5)
    expect(TRIAL_DEFAULT_PROBE_SPEED).toBe(0.5)
    const t = trialPicture(TRIAL_DEFAULT_SHIP_SPEED, TRIAL_DEFAULT_PROBE_SPEED)
    expect(t.rule).toBeCloseTo(0.8, 12)
    expect(t.top).toBeCloseTo(1, 12)
    expect(t.bottom).toBeCloseTo(1.25, 12)
    expect(t.gap).toBeCloseTo(0.2, 12)
    expect(t.everydayPassesC).toBe(false)
  })
  it('matches the rule and the everyday sum for every control setting', () => {
    for (const a of SHIP_SPEED_CHOICES)
      for (const b of PROBE_SPEED_CHOICES) {
        const t = trialPicture(a, b)
        expect(t.rule).toBeCloseTo((a + b) / (1 + a * b), 12)
        expect(t.everyday).toBeCloseTo(a + b, 12)
        expect(t.gap).toBeCloseTo(a + b - t.rule, 12)
        expect(t.rule).toBeLessThanOrEqual(1 + 1e-12)
        expect(t.top / t.bottom).toBeCloseTo(t.rule, 12)
        expect(t.everydayPassesC).toBe(a + b > 1)
        expect(t.belowC).toBeCloseTo(1 - t.rule, 12)
      }
  })
  it('gives c for light and flags it, and for the biggest ship and probe stays below c by about 5 parts in 100 000', () => {
    const light = trialPicture(0.9, 1)
    expect(light.probeIsLight).toBe(true)
    expect(light.rule).toBeCloseTo(1, 12)
    expect(light.belowC).toBeCloseTo(0, 12)
    const big = trialPicture(0.99, 0.9)
    expect(big.probeIsLight).toBe(false)
    expect(big.rule).toBeLessThan(1)
    expect(trialPicture(0.99, 0.99).belowC).toBeCloseTo(5.05e-5, 7)
  })
  it('is unchanged by the learner\'s predictions (nothing stored)', () => {
    const first = trialPicture(0.1, 0.1)
    predictionOneAnswerId()
    expect(trialPicture(0.1, 0.1)).toEqual(first)
  })
})
