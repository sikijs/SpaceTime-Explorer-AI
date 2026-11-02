import { describe, expect, it } from 'vitest'
import {
  ABSOLUTE_ZERO_CELSIUS,
  DIFFERENCE_RULER_K,
  MEASURED_SPEED_KM_S,
  SPEED_RULER_KM_S,
  angularSeparationDegrees,
  betaFromAmplitude,
  logFraction,
  oneInParts,
  pictureOneFigures,
  quasarCmbSeparationDegrees,
  skyColourFraction,
  ANGLE_CHOICES_DEGREES,
  QUASAR_2021_CHANCE,
  coinFlipsInARow,
  pairReading,
  resultsCheckUp,
  stepsTable,
  COLOUR_FULL_SCALE_K,
  trialFigures,
  trialSkyColourFraction,
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

describe('figures for the pictures (Step 4)', () => {
  it('uses the published speed, not the rounded button', () => {
    expect(MEASURED_SPEED_KM_S).toBe(369.82)
    expect(pictureOneFigures().dipole.speedKmS).toBe(369.82)
  })
  it('gets beta from the Planck amplitude, 1.2336e-3', () => {
    expect(betaFromAmplitude(3362.08)).toBeCloseTo(1.2336e-3, 7)
    expect(betaFromAmplitude(3362.08) * SPEED_OF_LIGHT_KM_S).toBeCloseTo(369.82, 1)
  })
  it('places a value on a log ruler: ends at 0 and 1, a decade a fixed step', () => {
    expect(logFraction(1e-5, 1e-5, 1)).toBeCloseTo(0, 12)
    expect(logFraction(1, 1e-5, 1)).toBeCloseTo(1, 12)
    expect(logFraction(1e-3, 1e-5, 1)).toBeCloseTo(0.4, 12)
    expect(logFraction(0.00672, DIFFERENCE_RULER_K.min, DIFFERENCE_RULER_K.max)).toBeGreaterThan(logFraction(0.0007, DIFFERENCE_RULER_K.min, DIFFERENCE_RULER_K.max))
    expect(logFraction(369.82, SPEED_RULER_KM_S.min, SPEED_RULER_KM_S.max)).toBeCloseTo(Math.log10(369.82) / 5, 12)
    expect(() => logFraction(0, 1, 10)).toThrow(RangeError)
    expect(() => logFraction(5, 10, 1)).toThrow(RangeError)
  })
  it('has rulers that hold every guess button and the real values, and stores their ends', () => {
    expect(DIFFERENCE_RULER_K).toEqual({ min: 0.00001, max: 1 })
    expect(SPEED_RULER_KM_S).toEqual({ min: 1, max: 100000 })
    const real = pictureOneFigures().dipole.aheadMinusBehindK
    for (const c of DIFFERENCE_ANSWER_CHOICES) {
      const t = logFraction(c.kelvin, DIFFERENCE_RULER_K.min, DIFFERENCE_RULER_K.max)
      expect(t).toBeGreaterThan(0)
      expect(t).toBeLessThan(1)
    }
    for (const c of SPEED_ANSWER_CHOICES) {
      const t = logFraction(c.kmS, SPEED_RULER_KM_S.min, SPEED_RULER_KM_S.max)
      expect(t).toBeGreaterThan(0)
      expect(t).toBeLessThan(1)
    }
    expect(logFraction(real, DIFFERENCE_RULER_K.min, DIFFERENCE_RULER_K.max)).toBeGreaterThan(0)
    expect(logFraction(EARTH_ORBITAL_SPEED_KM_S, SPEED_RULER_KM_S.min, SPEED_RULER_KM_S.max)).toBeGreaterThan(0)
    expect(logFraction(PUBLISHED_SPEED_KM_S.value, SPEED_RULER_KM_S.min, SPEED_RULER_KM_S.max)).toBeLessThan(1)
  })
  it('gives the sky colour +1 ahead, about 0 sideways and about -1 behind, falling steadily', () => {
    expect(skyColourFraction(0)).toBeCloseTo(1, 12)
    expect(Math.abs(skyColourFraction(90))).toBeLessThan(1e-3)
    expect(skyColourFraction(180)).toBeCloseTo(-0.99877, 4)
    const fractions = [0, 30, 60, 90, 120, 150, 180].map((a) => skyColourFraction(a))
    for (let i = 1; i < fractions.length; i++) expect(fractions[i]).toBeLessThan(fractions[i - 1])
    expect(skyColourFraction(0, 0)).toBe(0)
  })
  it('says the warm pole is about 1 part in 810 above the average, and the difference about 1 part in 405', () => {
    const f = pictureOneFigures()
    expect(f.aheadOneInParts).toBeCloseTo(810.2, 0)
    expect(f.differenceOneInParts).toBeCloseTo(405.3, 0)
    expect(oneInParts(0.5)).toBe(2)
    expect(oneInParts(-0.25)).toBe(4)
    expect(() => oneInParts(0)).toThrow(RangeError)
  })
  it('measures the angle between two directions on the sphere', () => {
    expect(angularSeparationDegrees(10, 20, 10, 20)).toBeCloseTo(0, 6)
    expect(angularSeparationDegrees(0, 0, 90, 0)).toBeCloseTo(90, 10)
    expect(angularSeparationDegrees(0, 0, 180, 0)).toBeCloseTo(180, 10)
    expect(angularSeparationDegrees(0, 90, 123, -90)).toBeCloseTo(180, 10)
    expect(angularSeparationDegrees(264.02, 48.253, 238.2, 28.8)).toBeCloseTo(angularSeparationDegrees(238.2, 28.8, 264.02, 48.253), 12)
  })
  it("works out the quasar dipole's offset from the microwave dipole as the paper's 27.8 degrees", () => {
    expect(Math.abs(quasarCmbSeparationDegrees() - QUASAR_OFFSET_DEGREES)).toBeLessThan(0.05)
    expect(quasarCmbSeparationDegrees()).toBeCloseTo(27.79, 2)
  })
})

describe("Drawing A's trial settings (Step 5)", () => {
  it('fixes the colour scale at the measured motion\'s warm excess, 3.3642 mK', () => {
    expect(COLOUR_FULL_SCALE_K * 1000).toBeCloseTo(3.3642, 4)
    expect(COLOUR_FULL_SCALE_K).toBeCloseTo(dipole(369.82).aheadWarmerThanAverageK, 15)
  })
  it('gives the same colours as Picture 1 at the measured speed', () => {
    for (const angle of [0, 45, 90, 135, 180]) expect(trialSkyColourFraction(angle, 369.82)).toBeCloseTo(skyColourFraction(angle), 12)
  })
  it('is pale at a slow trial speed and cut off at full colour at a fast one', () => {
    expect(trialSkyColourFraction(0, 29.78)).toBeCloseTo(0.0806, 3)
    expect(trialSkyColourFraction(0, 1000)).toBe(1)
    expect(trialSkyColourFraction(180, 1000)).toBe(-1)
    expect(trialSkyColourFraction(0, 30000)).toBe(1)
    // Sideways the temperature is T0 * D, below the average by T0 * (1 - D): tiny at 370 km/s, but at 30,000 km/s (a tenth of c) it is 13.7 mK, past the colour scale.
    expect(Math.abs(trialSkyColourFraction(90, 3000))).toBeLessThan(0.1)
    expect(trialSkyColourFraction(90, 3000)).toBeLessThan(0)
    expect(trialSkyColourFraction(90, 30000)).toBe(-1)
  })
  it('shows a faster trial as a stronger colour straight ahead until it is cut off', () => {
    const a = trialSkyColourFraction(0, 30)
    const b = trialSkyColourFraction(0, 100)
    const c = trialSkyColourFraction(0, 300)
    expect(a).toBeLessThan(b)
    expect(b).toBeLessThan(c)
    expect(c).toBeLessThan(1)
  })
  it('gives the real settings back for the measured speed: ratios 1, same flag, ahead at angle 0', () => {
    const f = trialFigures(369.82, 0)
    expect(f.isMeasuredSpeed).toBe(true)
    expect(f.speedOverReal).toBe(1)
    expect(f.differenceOverReal).toBe(1)
    expect(f.temperatureAtAngleK).toBeCloseTo(f.real.aheadK, 12)
    expect(f.atAngleMinusAverageK).toBeCloseTo(f.real.aheadWarmerThanAverageK, 12)
  })
  it('gives the specification\'s difference ratios: 8.11 at 3,000 km/s and 81.5 at 30,000 km/s, and 0.0805 at 29.78 km/s', () => {
    expect(trialFigures(3000, 0).differenceOverReal).toBeCloseTo(8.1124, 3)
    expect(trialFigures(30000, 0).differenceOverReal).toBeCloseTo(81.53, 1)
    expect(trialFigures(29.78, 0).differenceOverReal).toBeCloseTo(0.0805, 3)
    expect(trialFigures(3000, 0).isMeasuredSpeed).toBe(false)
  })
  it('gives the speed ratio: 3000 km/s is 8.112 times the measured speed, and 30 km/s is 0.0811 times it', () => {
    expect(trialFigures(3000, 0).speedOverReal).toBeCloseTo(3000 / 369.82, 10)
    expect(trialFigures(3000, 0).speedOverReal).toBeCloseTo(8.1121, 3)
    expect(trialFigures(30, 0).speedOverReal).toBeCloseTo(0.0811, 3)
  })
  it('gives the temperature in the chosen direction: ahead warmer, sideways about the average, behind cooler', () => {
    const t0 = trialFigures(1000, 0)
    const t90 = trialFigures(1000, 90)
    const t180 = trialFigures(1000, 180)
    expect(t0.atAngleMinusAverageK).toBeGreaterThan(0)
    expect(t90.atAngleMinusAverageK).toBeCloseTo(2.72548 * (Math.sqrt(1 - (1000 / 299792.458) ** 2) - 1), 12)
    expect(Math.abs(t90.atAngleMinusAverageK)).toBeLessThan(1e-4)
    expect(t180.atAngleMinusAverageK).toBeLessThan(0)
    expect(t180.temperatureAtAngleK).toBeCloseTo(t180.trial.behindK, 12)
    expect(trialFigures(1000, 45).temperatureAtAngleK).toBeCloseTo(independentTemperature(45, 1000), 9)
  })
  it('matches a separate calculation at every control setting', () => {
    for (const speed of SPEED_CHOICES_KM_S) {
      const kmS = speedForChoice(speed)
      for (const angle of ANGLE_CHOICES_DEGREES) {
        const f = trialFigures(kmS, angle)
        expect(Math.abs(f.temperatureAtAngleK - independentTemperature(angle, kmS)) / f.temperatureAtAngleK).toBeLessThan(1e-6)
        const diff = independentTemperature(0, kmS) - independentTemperature(180, kmS)
        expect(Math.abs(f.trial.aheadMinusBehindK - diff) / diff).toBeLessThan(1e-6)
      }
    }
  })
})

describe('the results (Step 6)', () => {
  it('reads two numbers as "the same" only when their give-or-takes reach each other', () => {
    expect(pairReading({ value: 10, giveOrTake: 1 }, { value: 11, giveOrTake: 1 }).reading).toBe('the same')
    expect(pairReading({ value: 10, giveOrTake: 1 }, { value: 12, giveOrTake: 1 }).reading).toBe('the same') // 2 = 1 + 1, they just touch
    expect(pairReading({ value: 10, giveOrTake: 1 }, { value: 12.5, giveOrTake: 1 }).reading).toBe('less')
    expect(pairReading({ value: 13, giveOrTake: 1 }, { value: 10, giveOrTake: 1 }).reading).toBe('more')
    const p = pairReading({ value: 10, giveOrTake: 0.5 }, { value: 11, giveOrTake: 0.25 })
    expect(p.difference).toBe(1)
    expect(p.combinedGiveOrTake).toBe(0.75)
    expect(p.overlap).toBe(false)
  })
  it('fails a give-or-take ten times too wide: a tenfold looser pair that should be apart reads "the same"', () => {
    expect(pairReading({ value: 370, giveOrTake: 0.11 }, { value: 369.82, giveOrTake: 0.01 }).reading).toBe('more')
    expect(pairReading({ value: 370, giveOrTake: 1.1 }, { value: 369.82, giveOrTake: 0.1 }).reading).toBe('the same')
  })
  it('finds the speed from the Planck amplitude the same as the published speed', () => {
    const r = resultsCheckUp().speedFromAmplitude
    expect(r.reading).toBe('the same')
    expect(r.found.value).toBeCloseTo(369.816, 3)
    expect(r.found.giveOrTake).toBeCloseTo(0.0704, 3)
    expect(r.reference).toEqual(PUBLISHED_SPEED_KM_S)
    expect(r.difference).toBeLessThan(0.01)
  })
  it('finds the two analyses of the Planck amplitude the same: they differ by 0.18 and their give-or-takes add to 1.00', () => {
    const r = resultsCheckUp().twoAnalyses
    expect(r.reading).toBe('the same')
    expect(r.difference).toBeCloseTo(0.18, 10)
    expect(r.combinedGiveOrTake).toBeCloseTo(1.0, 10)
  })
  it("finds the page's first-order amplitude (3362.12 uK) the same as Planck's, inside its 0.64", () => {
    const r = resultsCheckUp().pageAmplitude
    expect(r.found.value).toBeCloseTo(3362.116, 2)
    expect(r.reading).toBe('the same')
    expect(r.difference).toBeCloseTo(0.036, 2)
  })
  it('reads the quasar dipole as more than expected, 2.22 times', () => {
    const q = resultsCheckUp().quasarSize
    expect(q.reading).toBe('more')
    expect(q.timesExpected).toBeCloseTo(2.22, 10)
    expect(q.found).toBe(0.01554)
    expect(q.expected).toBe(0.007)
  })
  it('gives the direction offset as 27.79 degrees beside the paper\'s 27.8', () => {
    const d = resultsCheckUp().direction
    expect(d.separationDegrees).toBeCloseTo(27.79, 2)
    expect(d.paperStatesDegrees).toBe(27.8)
  })
  it('gives the steps table: beta 0.0012336 (1 part in 810.6), the temperatures, 6.7242 mK and 369.82 km/s', () => {
    const t = stepsTable()
    expect(t.averageK).toBe(2.72548)
    expect(t.speedKmS).toBe(369.82)
    expect(t.beta).toBeCloseTo(1.2336e-3, 7)
    expect(t.betaOneInParts).toBeCloseTo(810.6, 1)
    expect(t.aheadK).toBeCloseTo(2.728844, 6)
    expect(t.behindK).toBeCloseTo(2.72212, 6)
    expect(t.sidewaysK).toBeCloseTo(2.725478, 6)
    expect(t.aheadMinusBehindK * 1000).toBeCloseTo(6.7242, 4)
    expect(t.amplitudeFirstOrderMicrokelvin).toBeCloseTo(3362.116, 2)
    expect(t.speedFromPublishedAmplitudeKmS).toBeCloseTo(369.816, 3)
  })
  it('turns a chance of 1 in N into a run of coin flips: the 2021 chance of 5 in 10 million is about 21 heads in a row', () => {
    expect(QUASAR_2021_CHANCE).toBe(5e-7)
    expect(coinFlipsInARow(0.5)).toBe(1)
    expect(coinFlipsInARow(0.125)).toBeCloseTo(3, 12)
    expect(coinFlipsInARow(QUASAR_2021_CHANCE)).toBeCloseTo(20.93, 2)
    expect(() => coinFlipsInARow(0)).toThrow(RangeError)
    expect(() => coinFlipsInARow(1)).toThrow(RangeError)
  })
})
