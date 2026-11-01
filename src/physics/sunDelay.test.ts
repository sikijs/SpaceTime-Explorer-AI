import { describe, expect, it } from 'vitest'
import {
  ASTRONOMICAL_UNIT_M,
  CASSINI_GAMMA_MINUS_ONE,
  CASSINI_GAMMA_MINUS_ONE_GIVE_OR_TAKE,
  CASSINI_IMPROVEMENT_FACTOR_JPL,
  CASSINI_PRECISION_PPM_JPL,
  COMPARE_RELATIVE_TOLERANCE,
  DELAY_ANSWER_CHOICES,
  DISTANCE_ANSWER_CHOICES,
  GAMMA_GENERAL_RELATIVITY,
  GAMMA_NEWTONIAN_STYLE,
  SHAPIRO_1964_DELAY_US,
  SHAPIRO_1964_EQUIVALENT_PATH_KM,
  SHAPIRO_1964_PRECISION_PERCENT_HIGH,
  SHAPIRO_1964_PRECISION_PERCENT_LOW,
  SPEED_OF_LIGHT_M_PER_S,
  SUN_GM_OVER_C3_US,
  SUN_RADIUS_M,
  TARGET_CHOICES,
  VIKING_PRECISION,
  closestChoicesFor,
  compare,
  delayParts,
  roadTripExample,
  delayAnswerIdFor,
  delayGuessValueUs,
  distanceGuessTimesSmaller,
  earthDistanceM,
  flatRoundTripMinutes,
  flatTripBreakdown,
  guessedFarDelayUs,
  testPrecisionsPpm,
  tripWithAndWithoutSun,
  flatRoundTripUs,
  lightDistanceInOneMicrosecondM,
  lightTimeSeconds,
  nearestChoice,
  oneWayDelayLeadingFormUs,
  oneWayDelayUs,
  precisionPartsPerMillion,
  predictionOneAnswerId,
  predictionOneDelayUs,
  predictionTwoAnswerId,
  predictionTwoTimesSmaller,
  roundTripDelayUs,
  targetDistanceInSolarRadii,
  targetDistanceM,
  trialDelay,
  withinGiveOrTake,
} from './sunDelay'

const C = SPEED_OF_LIGHT_M_PER_S
const R = SUN_RADIUS_M
const AU = ASTRONOMICAL_UNIT_M

// An independent calculation of the same integral: delay = (1 + gamma) (GM / c^3) x (the integral of ds / sqrt(s^2 + b^2) along the straight path from -x_e to +x_t).
// Simpson's rule on [0, b] in s and on [b, x] in w = ln s (so that the long tail is covered), not the closed form the module uses.
function simpson(f: (v: number) => number, a: number, b: number, n = 4000): number {
  const h = (b - a) / n
  let sum = f(a) + f(b)
  for (let i = 1; i < n; i++) sum += f(a + i * h) * (i % 2 ? 4 : 2)
  return (sum * h) / 3
}
function halfPathIntegral(x: number, b: number): number {
  const inner = simpson((s) => 1 / Math.sqrt(s * s + b * b), 0, b)
  const outer = simpson((w) => Math.exp(w) / Math.sqrt(Math.exp(2 * w) + b * b), Math.log(b), Math.log(x))
  return inner + outer
}
function integralOneWayUs(rE: number, rT: number, b: number, gamma: number): number {
  const xe = Math.sqrt(rE * rE - b * b)
  const xt = Math.sqrt(rT * rT - b * b)
  return (1 + gamma) * SUN_GM_OVER_C3_US * (halfPathIntegral(xe, b) + halfPathIntegral(xt, b))
}

const re = earthDistanceM()
const venus = targetDistanceM('venus')
const mercury = targetDistanceM('mercury')
const mars = targetDistanceM('mars')

describe('constants', () => {
  it('GM / c^3 for the Sun is 4.9255 us', () => {
    expect(SUN_GM_OVER_C3_US).toBeCloseTo(4.9255, 3)
  })
})

describe('where the targets are', () => {
  it('Mercury is about 83 solar radii from the Sun\'s centre, Venus 155 and Mars 327; the choices stop short of them', () => {
    expect(targetDistanceInSolarRadii('mercury')).toBeCloseTo(83.2, 1)
    expect(targetDistanceInSolarRadii('venus')).toBeCloseTo(154.8, 1)
    expect(targetDistanceInSolarRadii('mars')).toBeCloseTo(326.8, 1)
    for (const t of TARGET_CHOICES) {
      for (const radii of closestChoicesFor(t.id)) expect(radii).toBeLessThan(targetDistanceInSolarRadii(t.id))
    }
  })
})

describe('light\'s own timing', () => {
  it('light takes 499.0 s (8.3 minutes) to go 1 AU and goes 299.8 m in one microsecond', () => {
    expect(lightTimeSeconds(AU)).toBeCloseTo(499.005, 2)
    expect(lightTimeSeconds(AU) / 60).toBeCloseTo(8.317, 2)
    expect(lightDistanceInOneMicrosecondM()).toBeCloseTo(299.792458, 6)
    expect(() => lightTimeSeconds(-1)).toThrow(RangeError)
  })
})

describe('the trip in flat space', () => {
  it('Venus grazing the Sun: the round trip is 2 (1 + 0.72) AU / c to better than 0.01 percent, about 28.6 minutes', () => {
    const us = flatRoundTripUs(re, venus, R)
    const expected = ((2 * (1 + 0.72) * AU) / C) * 1e6
    expect(Math.abs(us - expected) / expected).toBeLessThan(1e-4)
    expect(flatRoundTripMinutes(re, venus, R)).toBeCloseTo(28.6, 1)
  })
  it('the delay is tiny against the trip (about 1.4e-7 of it for Venus grazing)', () => {
    const t = trialDelay('venus', 1)
    expect(t.delayOverFlat).toBeGreaterThan(1e-7)
    expect(t.delayOverFlat).toBeLessThan(2e-7)
  })
  it('refuses a path that does not pass outside the Sun-centre distance of an end', () => {
    expect(() => flatRoundTripUs(re, venus, 2 * AU)).toThrow(RangeError)
    expect(() => flatRoundTripUs(re, venus, 0)).toThrow(RangeError)
  })
})

describe('the Sun\'s extra delay', () => {
  it('grazing the Sun, round trip: Venus 232.5, Mercury 220.2, Mars 247.2 us', () => {
    expect(roundTripDelayUs(re, venus, R)).toBeCloseTo(232.5, 1)
    expect(roundTripDelayUs(re, mercury, R)).toBeCloseTo(220.2, 1)
    expect(roundTripDelayUs(re, mars, R)).toBeCloseTo(247.2, 1)
  })
  it('Venus at 10 and at 100 solar radii: 141.7 and 47.4 us; the ratio 1 to 10 is 1.64', () => {
    expect(roundTripDelayUs(re, venus, 10 * R)).toBeCloseTo(141.7, 1)
    expect(roundTripDelayUs(re, venus, 100 * R)).toBeCloseTo(47.4, 1)
    expect(predictionTwoTimesSmaller()).toBeCloseTo(1.64, 2)
  })
  it('agrees with an independent numerical integration along the path, for every target and every closest distance, gamma 1 and 0', () => {
    for (const t of TARGET_CHOICES) {
      for (const radii of closestChoicesFor(t.id)) {
        for (const gamma of [GAMMA_GENERAL_RELATIVITY, GAMMA_NEWTONIAN_STYLE]) {
          const rt = t.distanceAu * AU
          const closed = oneWayDelayUs(re, rt, radii * R, gamma)
          const numeric = integralOneWayUs(re, rt, radii * R, gamma)
          expect(Math.abs(closed - numeric) / closed).toBeLessThan(1e-6)
        }
      }
    }
  })
  it('the leading form ln(4 r_e r_t / b^2) agrees to 0.1 percent at 1 to 10 solar radii (path much closer than the ends), and is not used where it fails (7.7 percent off at 100)', () => {
    for (const radii of [1, 2, 5, 10]) {
      const exact = oneWayDelayUs(re, venus, radii * R)
      const leading = oneWayDelayLeadingFormUs(re, venus, radii * R)
      expect(Math.abs(exact - leading) / exact).toBeLessThan(1e-3)
    }
    const exact100 = oneWayDelayUs(re, venus, 100 * R)
    const off = Math.abs(exact100 - oneWayDelayLeadingFormUs(re, venus, 100 * R)) / exact100
    expect(off).toBeGreaterThan(0.05)
    expect(off).toBeLessThan(0.1)
  })
  it('offers a closest distance only if it is less than the target\'s distance: Mercury gets five choices, Venus and Mars six', () => {
    expect(closestChoicesFor('mercury')).toEqual([1, 2, 5, 10, 50])
    expect(closestChoicesFor('venus')).toEqual([1, 2, 5, 10, 50, 100])
    expect(closestChoicesFor('mars')).toEqual([1, 2, 5, 10, 50, 100])
    expect(() => closestChoicesFor('pluto')).toThrow(RangeError)
  })
  it('gamma 0 gives exactly half the gamma 1 delay at every setting', () => {
    for (const t of TARGET_CHOICES) {
      for (const radii of closestChoicesFor(t.id)) {
        const d = trialDelay(t.id, radii)
        expect(d.newtonianUs).toBeCloseTo(d.delayUs / 2, 9)
      }
    }
  })
  it('the delay is positive, falls as the path passes farther out and rises with the target\'s distance', () => {
    for (const t of TARGET_CHOICES) {
      let previous = Infinity
      for (const radii of closestChoicesFor(t.id)) {
        const d = trialDelay(t.id, radii).delayUs
        expect(d).toBeGreaterThan(0)
        expect(d).toBeLessThan(previous)
        previous = d
      }
    }
    expect(trialDelay('mercury', 1).delayUs).toBeLessThan(trialDelay('venus', 1).delayUs)
    expect(trialDelay('venus', 1).delayUs).toBeLessThan(trialDelay('mars', 1).delayUs)
  })
  it('the trial delay is the same as the round trip and carries the equivalent extra path', () => {
    const d = trialDelay('venus', 1)
    expect(d.delayUs).toBeCloseTo(roundTripDelayUs(re, venus, R), 9)
    expect(d.extraPathM).toBeCloseTo((d.delayUs * 1e-6) * C, 6)
  })
})

describe('the "Why does the Sun add this time?" box', () => {
  it('the two parts of the Venus grazing delay are 116.2 us each and add to the 232.5 us total, at every setting', () => {
    const p = delayParts('venus', 1)
    expect(p.timeSlowingUs).toBeCloseTo(116.2, 1)
    expect(p.spaceStretchingUs).toBeCloseTo(116.2, 1)
    expect(p.timeSlowingUs + p.spaceStretchingUs).toBeCloseTo(p.totalUs, 9)
    expect(p.totalUs).toBeCloseTo(232.5, 1)
    for (const target of TARGET_CHOICES) {
      for (const radii of closestChoicesFor(target.id)) {
        const q = delayParts(target.id, radii)
        expect(q.timeSlowingUs).toBeCloseTo(q.spaceStretchingUs, 9)
        expect(q.timeSlowingUs).toBeCloseTo(trialDelay(target.id, radii).newtonianUs, 9)
      }
    }
  })
  it('the road trip: 60 minutes, 63.2 with slow traffic, 63.0 on the longer road, 66.3 with both; 3.2 + 3.0 is nearly the 6.3 together', () => {
    const r = roadTripExample()
    expect(r.base).toBeCloseTo(60, 9)
    expect(r.slow).toBeCloseTo(63.16, 2)
    expect(r.longer).toBeCloseTo(63, 9)
    expect(r.both).toBeCloseTo(66.32, 2)
    expect(r.lateSlow).toBeCloseTo(3.16, 2)
    expect(r.lateLonger).toBeCloseTo(3, 9)
    expect(r.lateBoth).toBeCloseTo(6.32, 2)
    expect(r.lateBoth).toBeGreaterThan(r.lateSlow + r.lateLonger)
    expect(r.lateBoth - (r.lateSlow + r.lateLonger)).toBeLessThan(0.2)
  })
})

describe('the pictures\' helpers', () => {
  it('the flat Venus trip past the Sun\'s edge: legs of 1 AU and 0.72 AU, 858.3 s one way, 28.6 minutes round trip', () => {
    const b = flatTripBreakdown('venus', 1)
    expect(b.earthLegM / 1e9).toBeCloseTo(149.6, 1)
    expect(b.targetLegM / 1e9).toBeCloseTo(107.7, 1)
    expect(b.oneWaySeconds).toBeCloseTo(858.3, 1)
    expect(b.roundTripMinutes).toBeCloseTo(28.61, 2)
    expect(b.roundTripSeconds * 1e6).toBeCloseTo(flatRoundTripUs(re, venus, R), 3)
    expect(b.closestM).toBe(R)
  })
  it('the trip with the Sun\'s effect is the trip without it plus the extra time: Venus grazing, 232.5 us longer', () => {
    const w = tripWithAndWithoutSun('venus', 1)
    expect(w.withSunUs - w.withoutSunUs).toBeCloseTo(232.47, 1)
    expect(w.extraUs).toBeCloseTo(roundTripDelayUs(re, venus, R), 9)
    expect(w.withoutSunUs).toBeCloseTo(flatRoundTripUs(re, venus, R), 6)
    expect(w.withSunSeconds).toBeGreaterThan(w.withoutSunSeconds)
    expect(w.withoutSunSeconds).toBeCloseTo(1716.6, 0)
  })
  it('Prediction 2\'s guess is drawn at the real 1-radius delay divided by the guess: 232.5, 116.2 and 2.3 us', () => {
    expect(guessedFarDelayUs('the-same')).toBeCloseTo(232.5, 1)
    expect(guessedFarDelayUs('about-2-times')).toBeCloseTo(116.2, 1)
    expect(guessedFarDelayUs('about-100-times')).toBeCloseTo(2.325, 2)
    expect(() => guessedFarDelayUs('nope')).toThrow(RangeError)
  })
  it('the tests\' precisions in parts per million: Shapiro 50,000 to 100,000, Viking 1,000, Cassini 20, a ratio of 50', () => {
    const p = testPrecisionsPpm()
    expect(p.shapiroEstimateLow).toBeCloseTo(50000, 6)
    expect(p.shapiroEstimateHigh).toBeCloseTo(100000, 6)
    expect(p.viking).toBeCloseTo(1000, 9)
    expect(p.cassini).toBe(20)
    expect(p.vikingOverCassini).toBeCloseTo(50, 9)
  })
})

describe('published figures', () => {
  it('are stored as quoted', () => {
    expect(SHAPIRO_1964_DELAY_US).toBe(200)
    expect(SHAPIRO_1964_EQUIVALENT_PATH_KM).toBe(60)
    expect(SHAPIRO_1964_PRECISION_PERCENT_LOW).toBe(5)
    expect(SHAPIRO_1964_PRECISION_PERCENT_HIGH).toBe(10)
    expect(VIKING_PRECISION).toBe(1e-3)
    expect(CASSINI_GAMMA_MINUS_ONE).toBe(2.1e-5)
    expect(CASSINI_GAMMA_MINUS_ONE_GIVE_OR_TAKE).toBe(2.3e-5)
    expect(CASSINI_PRECISION_PPM_JPL).toBe(20)
    expect(CASSINI_IMPROVEMENT_FACTOR_JPL).toBe(50)
  })
  it('1 part in 1,000 is 1,000 parts per million, 50 times worse than 20', () => {
    expect(precisionPartsPerMillion(VIKING_PRECISION)).toBeCloseTo(1000, 9)
    expect(precisionPartsPerMillion(VIKING_PRECISION) / CASSINI_PRECISION_PPM_JPL).toBeCloseTo(CASSINI_IMPROVEMENT_FACTOR_JPL, 9)
  })
})

describe('comparison helpers', () => {
  it('say "the same", "more" or "less"', () => {
    expect(compare(1, 1)).toBe('the same')
    expect(compare(1 + COMPARE_RELATIVE_TOLERANCE / 10, 1)).toBe('the same')
    expect(compare(2, 1)).toBe('more')
    expect(compare(1, 2)).toBe('less')
  })
  it('"inside the give-or-take" is inclusive, and a tenfold wider range changes the answer', () => {
    expect(withinGiveOrTake(2.1, 0, 2.3)).toBe(true)
    expect(withinGiveOrTake(2.4, 0, 2.3)).toBe(false)
    expect(withinGiveOrTake(2.4, 0, 23)).toBe(true)
  })
})

describe('answers to the predictions', () => {
  it('Prediction 1 is about 200 us, from the model\'s 232.5', () => {
    expect(predictionOneDelayUs()).toBeCloseTo(232.5, 1)
    expect(predictionOneAnswerId()).toBe('about-200')
    expect(DELAY_ANSWER_CHOICES).toHaveLength(5)
    expect(delayGuessValueUs('about-200')).toBe(200)
    expect(() => delayGuessValueUs('nope')).toThrow(RangeError)
  })
  it('Prediction 2 is "about 2 times smaller", from the model\'s 1.64', () => {
    expect(predictionTwoAnswerId()).toBe('about-2-times')
    expect(DISTANCE_ANSWER_CHOICES).toHaveLength(5)
    expect(distanceGuessTimesSmaller('about-2-times')).toBe(2)
    expect(() => distanceGuessTimesSmaller('nope')).toThrow(RangeError)
  })
  it('the nearest-choice helper picks the closest button on the scale it is given', () => {
    expect(nearestChoice(DELAY_ANSWER_CHOICES, Math.log(500), (c) => Math.log(c.valueUs)).id).toBe('about-200')
    expect(nearestChoice(DELAY_ANSWER_CHOICES, Math.log(700), (c) => Math.log(c.valueUs)).id).toBe('about-2000')
  })
  it('the delay buttons are matched on a log scale: 700 us is nearer 2,000 than 200 there, 350 us is nearer 200', () => {
    expect(delayAnswerIdFor(700)).toBe('about-2000')
    expect(delayAnswerIdFor(350)).toBe('about-200')
    expect(delayAnswerIdFor(0.5)).toBe('about-0-2')
  })
  it('the model does not depend on any prediction: repeated calls give the same numbers', () => {
    expect(trialDelay('venus', 1)).toEqual(trialDelay('venus', 1))
    expect(predictionOneDelayUs()).toBe(predictionOneDelayUs())
  })
})
