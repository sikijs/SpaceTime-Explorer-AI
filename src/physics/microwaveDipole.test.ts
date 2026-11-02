import { describe, expect, it } from 'vitest'
import {
  ABSOLUTE_ZERO_CELSIUS,
  ANGLE_CHOICES_DEGREES,
  COMPARE_RELATIVE_TOLERANCE,
  DIFFERENCE_ANSWER_CHOICES,
  EARTH_ORBITAL_SPEED_KM_S,
  MEASURED_SPEED_CHOICE,
  MICROWAVE_TEMPERATURE_K,
  PLANCK_DIPOLE_AMPLITUDE_UK,
  PUBLISHED_SPEED_KM_S,
  QUASAR_COUNT,
  QUASAR_DIRECTION_GALACTIC,
  QUASAR_EXPECTED_AMPLITUDE,
  QUASAR_OBSERVED_AMPLITUDE,
  QUASAR_OFFSET_DEGREES,
  QUASAR_SIGNIFICANCE,
  SPEED_ANSWER_CHOICES,
  SPEED_CHOICES_KM_S,
  SPEED_OF_LIGHT_KM_S,
  SROLL_DIPOLE_AMPLITUDE_UK,
  betaOf,
  celsiusOfKelvin,
  compare,
  differenceAnswerIdFor,
  differenceGuessKelvin,
  dipole,
  firstOrderAmplitudeK,
  insideGiveOrTake,
  predictionOneAnswerId,
  predictionTwoAnswerId,
  quasarObservedOverExpected,
  speedAnswerIdFor,
  speedForChoice,
  speedFromAmplitudeKmS,
  speedGuessKmS,
  temperatureAtAngle,
} from './microwaveDipole'
import { frequencyFactorFromTravelerAngle } from './dopplerShift'

// A separate calculation, written here and not in the module: T = T0 sqrt(1 - b^2) / (1 - b cos(theta)).
function independentTemperature(angleDegrees: number, speedKmS: number): number {
  const b = speedKmS / 299792.458
  return (2.72548 * Math.sqrt(1 - b * b)) / (1 - b * Math.cos((angleDegrees * Math.PI) / 180))
}

describe('constants as stored (test 1)', () => {
  it('stores the published figures as quoted', () => {
    expect(SPEED_OF_LIGHT_KM_S).toBe(299792.458)
    expect(MICROWAVE_TEMPERATURE_K).toBe(2.72548)
    expect(PUBLISHED_SPEED_KM_S).toEqual({ value: 369.82, giveOrTake: 0.11 })
    expect(PLANCK_DIPOLE_AMPLITUDE_UK).toEqual({ value: 3362.08, giveOrTake: 0.64 })
    expect(SROLL_DIPOLE_AMPLITUDE_UK).toEqual({ value: 3361.9, giveOrTake: 0.36 })
  })
  it("reads Earth's orbital speed from Frontier 11's module", () => {
    expect(EARTH_ORBITAL_SPEED_KM_S).toBeCloseTo(29.78, 10)
  })
  it('turns the 370 button into the published 369.82 km/s and leaves the other buttons alone', () => {
    expect(speedForChoice(MEASURED_SPEED_CHOICE)).toBe(369.82)
    expect(speedForChoice(30)).toBe(30)
    expect(speedForChoice(30000)).toBe(30000)
  })
  it('puts the average microwave temperature at about -270.4 degrees Celsius', () => {
    expect(ABSOLUTE_ZERO_CELSIUS).toBe(-273.15)
    expect(celsiusOfKelvin(0)).toBe(-273.15)
    expect(celsiusOfKelvin(MICROWAVE_TEMPERATURE_K)).toBeCloseTo(-270.42452, 5)
  })
  it('rejects a speed that is negative, not finite or at least c', () => {
    expect(() => betaOf(-1)).toThrow(RangeError)
    expect(() => betaOf(Number.NaN)).toThrow(RangeError)
    expect(() => betaOf(SPEED_OF_LIGHT_KM_S)).toThrow(RangeError)
  })
})

describe('temperature at an angle (tests 2, 3, 4, 7)', () => {
  const v = 369.82
  const b = v / 299792.458
  const d = Math.sqrt(1 - b * b)
  it('is T0 times D sideways, T0 D / (1 - b) ahead and T0 D / (1 + b) behind', () => {
    expect(temperatureAtAngle(90, v)).toBeCloseTo(2.72548 * d, 12)
    expect(temperatureAtAngle(0, v)).toBeCloseTo((2.72548 * d) / (1 - b), 12)
    expect(temperatureAtAngle(180, v)).toBeCloseTo((2.72548 * d) / (1 + b), 12)
    expect(temperatureAtAngle(90, v)).not.toBeCloseTo(2.72548, 8)
  })
  it("equals T0 times Experiment 8's factor at every control setting", () => {
    for (const speed of SPEED_CHOICES_KM_S) {
      const kmS = speedForChoice(speed)
      for (const angle of ANGLE_CHOICES_DEGREES) {
        const expected = 2.72548 * frequencyFactorFromTravelerAngle(angle, kmS / SPEED_OF_LIGHT_KM_S)
        expect(Math.abs(temperatureAtAngle(angle, kmS) - expected)).toBeLessThan(1e-12)
      }
    }
  })
  it('is warmer than the average ahead and cooler behind at every speed above 0, and the average at 0', () => {
    for (const speed of [30, 370, 1000, 3000, 30000]) {
      expect(temperatureAtAngle(0, speed)).toBeGreaterThan(MICROWAVE_TEMPERATURE_K)
      expect(temperatureAtAngle(180, speed)).toBeLessThan(MICROWAVE_TEMPERATURE_K)
    }
    for (const angle of ANGLE_CHOICES_DEGREES) expect(temperatureAtAngle(angle, 0)).toBe(MICROWAVE_TEMPERATURE_K)
  })
  it('departs from the average by only D - 1 sideways, under one part in a million at 370 km/s', () => {
    const relative = Math.abs(temperatureAtAngle(90, v) / MICROWAVE_TEMPERATURE_K - 1)
    expect(relative).toBeCloseTo(1 - d, 15)
    expect(relative).toBeLessThan(1e-6)
  })
  it('falls steadily from straight ahead to straight behind', () => {
    const temps = ANGLE_CHOICES_DEGREES.map((a) => temperatureAtAngle(a, 3000))
    for (let i = 1; i < temps.length; i++) expect(temps[i]).toBeLessThan(temps[i - 1])
  })
})

describe('ahead, behind and the difference (test 5)', () => {
  it('gives 2.7288, 2.7221 and a difference of 6.7242 mK at 369.82 km/s', () => {
    const f = dipole(369.82)
    expect(f.aheadK).toBeCloseTo(2.728844, 6)
    expect(f.behindK).toBeCloseTo(2.72212, 6)
    expect(f.aheadMinusBehindK * 1000).toBeCloseTo(6.7242, 4)
  })
  it('gives the specification table at the other speeds', () => {
    expect(dipole(29.78).aheadMinusBehindK * 1000).toBeCloseTo(0.5415, 4)
    expect(dipole(1000).aheadMinusBehindK * 1000).toBeCloseTo(18.1825, 4)
    expect(dipole(3000).aheadMinusBehindK * 1000).toBeCloseTo(54.5501, 4)
    expect(dipole(30000).aheadMinusBehindK * 1000).toBeCloseTo(548.2252, 4)
  })
  it('grows with speed and is zero at speed 0', () => {
    expect(dipole(0).aheadMinusBehindK).toBe(0)
    let last = 0
    for (const s of SPEED_CHOICES_KM_S) {
      const diff = dipole(speedForChoice(s)).aheadMinusBehindK
      expect(diff).toBeGreaterThan(last)
      last = diff
    }
  })
  it('reports the sideways temperature as T0 times D, not the plain average', () => {
    const f = dipole(30000)
    expect(f.sidewaysK).toBeCloseTo(temperatureAtAngle(90, 30000), 12)
    expect(f.sidewaysK).toBeLessThan(MICROWAVE_TEMPERATURE_K)
    expect(f.sidewaysK).toBeCloseTo(2.711799, 6)
  })
  it('reports ahead minus the average and the average minus behind consistently', () => {
    const f = dipole(1000)
    expect(f.aheadWarmerThanAverageK + f.behindCoolerThanAverageK).toBeCloseTo(f.aheadMinusBehindK, 12)
    expect(f.aheadWarmerThanAverageK).toBeGreaterThan(f.behindCoolerThanAverageK) // the exact formula is not symmetric about the average
  })
})

describe('the amplitude and the speed (test 6)', () => {
  it('has a first-order amplitude of 3.3621 mK at 369.82 km/s', () => {
    expect(firstOrderAmplitudeK(369.82) * 1000).toBeCloseTo(3.3621, 4)
    expect(betaOf(369.82)).toBeCloseTo(1.2336e-3, 7)
  })
  it('turns the Planck amplitude back into 369.82 km/s to 0.01 km/s', () => {
    expect(Math.abs(speedFromAmplitudeKmS(3362.08) - 369.82)).toBeLessThan(0.01)
  })
  it('turns the SRoll2.2 amplitude into 369.80 km/s', () => {
    expect(Math.abs(speedFromAmplitudeKmS(3361.9) - 369.8)).toBeLessThan(0.01)
  })
  it('is inverted by the amplitude: speed -> amplitude -> speed', () => {
    for (const v of [30, 369.82, 3000]) {
      expect(speedFromAmplitudeKmS(firstOrderAmplitudeK(v) * 1e6)).toBeCloseTo(v, 9)
    }
  })
  it('puts the amplitude inside the published speed give-or-take of 0.11 km/s', () => {
    expect(insideGiveOrTake(speedFromAmplitudeKmS(PLANCK_DIPOLE_AMPLITUDE_UK.value), PUBLISHED_SPEED_KM_S)).toBe(true)
  })
})

describe('agreement with a separate calculation (test 8)', () => {
  it('matches at every control setting to 1 part in a million', () => {
    for (const speed of SPEED_CHOICES_KM_S) {
      const kmS = speedForChoice(speed)
      for (const angle of ANGLE_CHOICES_DEGREES) {
        const mine = temperatureAtAngle(angle, kmS)
        const other = independentTemperature(angle, kmS)
        expect(Math.abs(mine - other) / other).toBeLessThan(1e-6)
      }
    }
  })
})

describe('quasar figures as quoted (test 9)', () => {
  it('stores the paper figures', () => {
    expect(QUASAR_OBSERVED_AMPLITUDE).toBe(0.01554)
    expect(QUASAR_EXPECTED_AMPLITUDE).toBe(0.007)
    expect(QUASAR_COUNT).toBe(1355352)
    expect(QUASAR_OFFSET_DEGREES).toBe(27.8)
    expect(QUASAR_DIRECTION_GALACTIC).toEqual({ l: 238.2, b: 28.8 })
  })
  it('stores the significances as each source states them', () => {
    expect(QUASAR_SIGNIFICANCE.secrest2021).toBe(4.9)
    expect([...QUASAR_SIGNIFICANCE.bashir2026]).toEqual([3.63, 3.44, 3.27])
    expect(QUASAR_SIGNIFICANCE.secrest2025AtLeast).toBe(5)
  })
  it('gives a ratio of 2.22, not rounded', () => {
    expect(quasarObservedOverExpected()).toBeCloseTo(2.22, 10)
    expect(quasarObservedOverExpected()).not.toBe(2)
  })
})

describe('comparison helpers (test 10)', () => {
  it('says "the same" only inside the tolerance', () => {
    expect(compare(2.5, 2.5)).toBe('the same')
    expect(compare(2.5 * (1 + COMPARE_RELATIVE_TOLERANCE / 10), 2.5)).toBe('the same')
    expect(compare(2.6, 2.5)).toBe('more')
    expect(compare(2.4, 2.5)).toBe('less')
  })
  it('fails a tolerance ten times wider than the give-or-take', () => {
    const wide = { value: 369.82, giveOrTake: 1.1 }
    expect(insideGiveOrTake(370.5, PUBLISHED_SPEED_KM_S)).toBe(false)
    expect(insideGiveOrTake(370.5, wide)).toBe(true)
  })
})

describe('the predictions (test 11)', () => {
  it("has Prediction 1's answer on 0.007 K and Prediction 2's on 300 km/s", () => {
    expect(predictionOneAnswerId()).toBe('about-0.007')
    expect(predictionTwoAnswerId()).toBe('about-300')
  })
  it('finds the nearest button on a log scale, which differs from a linear scale', () => {
    // 0.03 K is nearer 0.007 on a linear ruler (0.023 away against 0.04) but nearer 0.07 on a log ruler (a factor of 2.4 away against 4.3).
    expect(differenceAnswerIdFor(0.03)).toBe('about-0.07')
    const linear = DIFFERENCE_ANSWER_CHOICES.reduce((best, c) => (Math.abs(c.kelvin - 0.03) < Math.abs(best.kelvin - 0.03) ? c : best))
    expect(linear.id).toBe('about-0.007')
    // 1000 km/s is nearer 300 on a linear ruler (700 away against 2000) but nearer 3000 on a log ruler (a factor of 3.0 away against 3.3).
    expect(speedAnswerIdFor(1000)).toBe('about-3000')
    const linearSpeed = SPEED_ANSWER_CHOICES.reduce((best, c) => (Math.abs(c.kmS - 1000) < Math.abs(best.kmS - 1000) ? c : best))
    expect(linearSpeed.id).toBe('about-300')
  })
  it('takes each answer from the measured motion, not from a trial value', () => {
    // Both answers hold whatever trial speed the learner has chosen: they take no input.
    expect(predictionOneAnswerId()).toBe(differenceAnswerIdFor(dipole(369.82).aheadMinusBehindK))
    expect(predictionOneAnswerId()).not.toBe(differenceAnswerIdFor(dipole(30000).aheadMinusBehindK))
    expect(predictionTwoAnswerId()).not.toBe(speedAnswerIdFor(30000))
  })
  it('turns a button into the value its white mark stands for, and rejects an unknown one', () => {
    expect(differenceGuessKelvin('about-0.07')).toBe(0.07)
    expect(speedGuessKmS('about-3000')).toBe(3000)
    expect(() => differenceGuessKelvin('nope')).toThrow(RangeError)
    expect(() => speedGuessKmS('nope')).toThrow(RangeError)
  })
  it('has five buttons a power of ten apart for each prediction', () => {
    for (let i = 1; i < 5; i++) {
      expect(DIFFERENCE_ANSWER_CHOICES[i].kelvin / DIFFERENCE_ANSWER_CHOICES[i - 1].kelvin).toBeCloseTo(10, 10)
      expect(SPEED_ANSWER_CHOICES[i].kmS / SPEED_ANSWER_CHOICES[i - 1].kmS).toBeCloseTo(10, 10)
    }
  })
})

describe('the module does not change with predictions (test 12)', () => {
  it('gives the same figures whichever answer a learner picks (the module takes no guess as an input)', () => {
    const before = JSON.stringify(dipole(369.82))
    for (const choice of DIFFERENCE_ANSWER_CHOICES) differenceGuessKelvin(choice.id)
    for (const choice of SPEED_ANSWER_CHOICES) speedGuessKmS(choice.id)
    expect(JSON.stringify(dipole(369.82))).toBe(before)
    expect(predictionOneAnswerId()).toBe('about-0.007')
  })
})
