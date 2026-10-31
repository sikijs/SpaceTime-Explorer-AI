import { describe, expect, it } from 'vitest'
import {
  COMPARE_RELATIVE_TOLERANCE,
  HEIGHT_CHOICES,
  LIFETIME_ANSWER_CHOICES,
  MOUNT_BETA,
  MOUNT_HEIGHT_M,
  MOUNT_MEASURED_FACTOR,
  MOUNT_PREDICTED_FACTOR_AVERAGE,
  REST_LIFETIME_US,
  RING_GAMMA,
  RING_MEASURED_TAU_MINUS_GIVE_OR_TAKE_US,
  RING_MEASURED_TAU_MINUS_US,
  RING_MEASURED_TAU_PLUS_GIVE_OR_TAKE_US,
  RING_MEASURED_TAU_PLUS_US,
  RING_PAPER_FRACTIONAL_LIMIT,
  SHARE_ANSWER_CHOICES,
  SPEED_CHOICES,
  betaFromGamma,
  compare,
  flightTimeInLifetimes,
  flightTimeUs,
  lifetimeGuessValueUs,
  heightInLightDistances,
  lightDistanceInOneLifetimeM,
  mountPictureThree,
  lorentzFactor,
  mountCountedShare,
  mountFactorsOverlap,
  mountModelEverydayShare,
  mountModelSlowClockShare,
  mountSourceEverydayShare,
  muonView,
  nearestChoice,
  paperRestLifetimeMinusDifferencePercent,
  predictionOneAnswerId,
  predictionTwoAnswerId,
  ringBeta,
  ringDifferenceInGiveOrTakes,
  ringMeasuredDifferencePercent,
  ringMeasuredMinusPredictedUs,
  ringPredictedLifetimeUs,
  ringWithinGiveOrTake,
  shareAfterLifetimes,
  shareAliveEveryday,
  shareAliveSlowClock,
  shareGuessValue,
  slowClockGainFactor,
  trialTrip,
  withinGiveOrTake,
} from './muonLifetime'

describe('the factor (test 1)', () => {
  it('gives the specification values', () => {
    expect(lorentzFactor(0.995)).toBeCloseTo(10.013, 3)
    expect(lorentzFactor(0.9)).toBeCloseTo(2.294, 3)
    expect(lorentzFactor(0.5)).toBeCloseTo(1.155, 3)
  })
  it('gives the ring speed from gamma = 29.33, and undoes itself', () => {
    expect(ringBeta()).toBeCloseTo(0.99942, 5)
    expect(lorentzFactor(betaFromGamma(29.33))).toBeCloseTo(29.33, 9)
  })
  it('rejects speeds outside 0 < beta < 1 and factors at or below 1', () => {
    expect(() => lorentzFactor(1)).toThrow(RangeError)
    expect(() => lorentzFactor(0)).toThrow(RangeError)
    expect(() => betaFromGamma(1)).toThrow(RangeError)
  })
})

describe('the clock at rest (test 2)', () => {
  it('uses the PDG rest lifetime', () => {
    expect(REST_LIFETIME_US).toBe(2.1969811)
  })
  it('leaves 36.8, 13.5 and 5.0 percent after one, two and three lifetimes', () => {
    expect(shareAfterLifetimes(1) * 100).toBeCloseTo(36.79, 2)
    expect(shareAfterLifetimes(2) * 100).toBeCloseTo(13.53, 2)
    expect(shareAfterLifetimes(3) * 100).toBeCloseTo(4.98, 2)
    expect(shareAfterLifetimes(0)).toBe(1)
  })
  it('lets light go about 659 m in one lifetime', () => {
    expect(lightDistanceInOneLifetimeM()).toBeCloseTo(658.64, 1)
    expect(heightInLightDistances(15000)).toBeCloseTo(22.77, 1)
    expect(heightInLightDistances(lightDistanceInOneLifetimeM())).toBeCloseTo(1, 10)
  })
})

describe('the mountain trip at 0.995 c over 1,917 m (test 3)', () => {
  it('takes 6.427 us, 2.925 lifetimes', () => {
    expect(flightTimeUs(MOUNT_HEIGHT_M, MOUNT_BETA)).toBeCloseTo(6.427, 3)
    expect(flightTimeInLifetimes(MOUNT_HEIGHT_M, MOUNT_BETA)).toBeCloseTo(2.925, 3)
  })
  it('leaves 5.37 percent without the slow clock and 74.67 percent with it', () => {
    expect(shareAliveEveryday(MOUNT_HEIGHT_M, MOUNT_BETA) * 100).toBeCloseTo(5.37, 2)
    expect(shareAliveSlowClock(MOUNT_HEIGHT_M, MOUNT_BETA) * 100).toBeCloseTo(74.67, 2)
    expect(mountModelEverydayShare()).toBe(shareAliveEveryday(MOUNT_HEIGHT_M, MOUNT_BETA))
    expect(mountModelSlowClockShare()).toBe(shareAliveSlowClock(MOUNT_HEIGHT_M, MOUNT_BETA))
  })
  it('gains a factor of about 13.9 in muons that arrive', () => {
    expect(slowClockGainFactor(MOUNT_HEIGHT_M, MOUNT_BETA)).toBeCloseTo(13.92, 1)
  })
  it('rejects a height of zero', () => {
    expect(() => flightTimeUs(0, 0.9)).toThrow(RangeError)
  })
})

describe("the muon's view (test 4)", () => {
  it('shortens the road to 191.5 m and the trip to 0.6419 us (0.292 lifetimes)', () => {
    const v = muonView(MOUNT_HEIGHT_M, MOUNT_BETA)
    expect(v.roadM).toBeCloseTo(191.5, 1)
    expect(v.tripUs).toBeCloseTo(0.6419, 4)
    expect(v.lifetimes).toBeCloseTo(0.292, 3)
  })
  it('gives the same share as the ground slow clock for every speed and height of the controls', () => {
    for (const s of SPEED_CHOICES) {
      for (const h of HEIGHT_CHOICES) {
        const ground = shareAliveSlowClock(h.heightM, s.beta)
        const muon = muonView(h.heightM, s.beta).share
        // equal to better than 1 part in 10^9 of the larger, or both vanishingly small
        expect(Math.abs(ground - muon)).toBeLessThanOrEqual(1e-9 * Math.max(ground, muon, 1e-300))
      }
    }
  })
})

describe('how the shares change (test 5)', () => {
  it('rises with speed and falls with height for the slow-clock share', () => {
    for (const h of HEIGHT_CHOICES) {
      for (let i = 1; i < SPEED_CHOICES.length; i++) {
        expect(shareAliveSlowClock(h.heightM, SPEED_CHOICES[i].beta)).toBeGreaterThan(shareAliveSlowClock(h.heightM, SPEED_CHOICES[i - 1].beta))
      }
    }
    for (const s of SPEED_CHOICES) {
      for (let i = 1; i < HEIGHT_CHOICES.length; i++) {
        expect(shareAliveSlowClock(HEIGHT_CHOICES[i].heightM, s.beta)).toBeLessThan(shareAliveSlowClock(HEIGHT_CHOICES[i - 1].heightM, s.beta))
      }
    }
  })
  it('leaves the everyday share nearly the same for all speeds above 0.99 c', () => {
    const a = shareAliveEveryday(MOUNT_HEIGHT_M, 0.995)
    const b = shareAliveEveryday(MOUNT_HEIGHT_M, ringBeta())
    const c = shareAliveEveryday(MOUNT_HEIGHT_M, 0.99999)
    expect(Math.abs(a - c) / c).toBeLessThan(0.02)
    expect(Math.abs(b - c) / c).toBeLessThan(0.01)
  })
})

describe('the ring (test 6)', () => {
  it('predicts 64.44 us for gamma = 29.33', () => {
    expect(ringPredictedLifetimeUs()).toBeCloseTo(64.437, 2)
    expect(ringPredictedLifetimeUs()).toBeCloseTo(RING_GAMMA * REST_LIFETIME_US, 12)
  })
  it('puts mu+ 0.018 us below the prediction, inside its give-or-take of 0.058', () => {
    expect(ringMeasuredMinusPredictedUs(RING_MEASURED_TAU_PLUS_US)).toBeCloseTo(-0.0185, 3)
    expect(ringWithinGiveOrTake(RING_MEASURED_TAU_PLUS_US, RING_MEASURED_TAU_PLUS_GIVE_OR_TAKE_US)).toBe(true)
  })
  it('puts mu- 0.11 percent below the prediction, outside its own give-or-take, but inside the paper limit of 0.2 percent', () => {
    expect(ringMeasuredDifferencePercent(RING_MEASURED_TAU_MINUS_US)).toBeCloseTo(-0.108, 3)
    expect(ringDifferenceInGiveOrTakes(RING_MEASURED_TAU_MINUS_US, RING_MEASURED_TAU_MINUS_GIVE_OR_TAKE_US)).toBeCloseTo(-2.38, 1)
    expect(ringWithinGiveOrTake(RING_MEASURED_TAU_MINUS_US, RING_MEASURED_TAU_MINUS_GIVE_OR_TAKE_US)).toBe(false)
    expect(Math.abs(ringMeasuredDifferencePercent(RING_MEASURED_TAU_MINUS_US)) / 100).toBeLessThan(RING_PAPER_FRACTIONAL_LIMIT)
  })
  it("puts the paper's rest lifetime for mu- 0.10 percent below the PDG's", () => {
    expect(paperRestLifetimeMinusDifferencePercent()).toBeCloseTo(-0.0996, 3)
  })
})

describe('the 15 km grid (test 7)', () => {
  const fifteen = 15000
  it('leaves 10.17 percent at 0.995 c and 90.3 percent at 0.99999 c', () => {
    expect(shareAliveSlowClock(fifteen, 0.995) * 100).toBeCloseTo(10.17, 2)
    expect(shareAliveSlowClock(fifteen, 0.99999) * 100).toBeCloseTo(90.32, 1)
  })
  it('leaves 46.0 percent at the ring speed', () => {
    expect(shareAliveSlowClock(fifteen, ringBeta()) * 100).toBeCloseTo(45.98, 1)
  })
  it('leaves almost none at 0.5 c and 0.9 c (below 0.002 percent), and less than 1 in 10^9 without the slow clock at any speed', () => {
    expect(shareAliveSlowClock(fifteen, 0.5)).toBeLessThan(1e-15)
    expect(shareAliveSlowClock(fifteen, 0.9)).toBeLessThan(2e-5)
    for (const s of SPEED_CHOICES) expect(shareAliveEveryday(fifteen, s.beta)).toBeLessThan(1e-9)
  })
  it('follows the controls through trialTrip', () => {
    const t = trialTrip(0.995, fifteen)
    expect(t.slowClockShare).toBe(shareAliveSlowClock(fifteen, 0.995))
    expect(t.everydayShare).toBe(shareAliveEveryday(fifteen, 0.995))
    expect(t.muonRoadM).toBeCloseTo(fifteen / lorentzFactor(0.995), 6)
    expect(t.slowClockLifetimeUs).toBeCloseTo(lorentzFactor(0.995) * REST_LIFETIME_US, 9)
  })
})

describe("Frisch and Smith's figures (test 8)", () => {
  it('counts 412 / 563 = 73.2 percent at sea level', () => {
    expect(mountCountedShare() * 100).toBeCloseTo(73.18, 2)
  })
  it("keeps the source's 27 expected without dilation (4.8 percent), which differs from the model's 5.4", () => {
    expect(mountSourceEverydayShare() * 100).toBeCloseTo(4.8, 1)
    expect(mountModelEverydayShare() * 100).toBeGreaterThan(mountSourceEverydayShare() * 100)
  })
  it('stores the factors 8.8 and 8.4 and finds them overlapping within the give-or-takes', () => {
    expect(MOUNT_MEASURED_FACTOR).toBe(8.8)
    expect(MOUNT_PREDICTED_FACTOR_AVERAGE).toBe(8.4)
    expect(mountFactorsOverlap()).toBe(true)
  })
})

describe('the comparison helpers (test 9)', () => {
  it('says the same, more or less', () => {
    expect(compare(1, 1)).toBe('the same')
    expect(compare(1 + 1e-12, 1)).toBe('the same')
    expect(compare(1.001, 1)).toBe('more')
    expect(compare(0.999, 1)).toBe('less')
  })
  it('keeps a tolerance tight enough that a tenfold wider one would call a small difference the same', () => {
    expect(COMPARE_RELATIVE_TOLERANCE).toBe(1e-9)
    // a difference of 5 parts in 10^9 is "more"; a tolerance ten times wider (1e-8) would call it "the same"
    expect(compare(1 + 5e-9, 1)).toBe('more')
  })
  it('tests a measurement against its give-or-take', () => {
    expect(withinGiveOrTake(64.419, 64.437, 0.058)).toBe(true)
    expect(withinGiveOrTake(64.368, 64.437, 0.029)).toBe(false)
  })
})

describe('the answers and marks (test 10)', () => {
  it("makes Prediction 1's answer 'About 75' and Prediction 2's 'About 65 µs'", () => {
    expect(predictionOneAnswerId()).toBe('about-75')
    expect(predictionTwoAnswerId()).toBe('about-65')
  })
  it('gives the count out of 100 and the lifetime each guess names', () => {
    expect(SHARE_ANSWER_CHOICES.map((c) => shareGuessValue(c.id))).toEqual([5, 25, 50, 75, 95])
    expect(LIFETIME_ANSWER_CHOICES.map((c) => lifetimeGuessValueUs(c.id))).toEqual([2.2, 7, 20, 65, 200])
    expect(() => shareGuessValue('nope')).toThrow(RangeError)
    expect(() => lifetimeGuessValueUs('nope')).toThrow(RangeError)
  })
  it('picks the closest button, and for lifetimes on a log scale', () => {
    expect(nearestChoice(SHARE_ANSWER_CHOICES, 60, (c) => c.value).id).toBe('about-50')
    expect(nearestChoice(SHARE_ANSWER_CHOICES, 63, (c) => c.value).id).toBe('about-75')
    // 12 us is nearer 20 than 7 on a log scale (and nearer 7 on a straight scale: |12-7| = 5 < 8)
    expect(nearestChoice(LIFETIME_ANSWER_CHOICES, Math.log(12), (c) => Math.log(c.valueUs)).id).toBe('about-20')
  })
  it('has the preset controls on the mountain trip', () => {
    expect(SPEED_CHOICES.find((s) => s.id === 'mount')?.beta).toBe(MOUNT_BETA)
    expect(HEIGHT_CHOICES.find((h) => h.id === 'mount')?.heightM).toBe(MOUNT_HEIGHT_M)
    expect(SPEED_CHOICES.find((s) => s.id === 'ring')?.beta).toBeCloseTo(0.99942, 5)
  })
  it("offers the specification's five speeds and four heights", () => {
    expect(SPEED_CHOICES.map((s) => s.beta)).toEqual([0.5, 0.9, 0.995, ringBeta(), 0.99999])
    expect(HEIGHT_CHOICES.map((h) => h.heightM)).toEqual([1917, 5000, 10000, 15000])
  })
})

describe('the module does not depend on predictions (test 11)', () => {
  it('gives the same numbers every time it is asked', () => {
    expect(mountModelSlowClockShare()).toBe(mountModelSlowClockShare())
    expect(trialTrip(0.9, 5000)).toEqual(trialTrip(0.9, 5000))
    expect(predictionOneAnswerId()).toBe(predictionOneAnswerId())
  })
})

describe('Picture 3: the mountain fall described twice', () => {
  it('gives the ground and the muon the same share, a road about 10 times shorter and the rest lifetime', () => {
    const pic = mountPictureThree()
    expect(pic.ground.roadM).toBe(MOUNT_HEIGHT_M)
    expect(pic.muon.roadM).toBeCloseTo(MOUNT_HEIGHT_M / pic.gamma, 9)
    expect(pic.muon.roadM).toBeCloseTo(191.5, 0)
    expect(pic.muon.tripUs).toBeCloseTo(0.64, 2)
    expect(pic.ground.tripUs).toBeCloseTo(6.43, 2)
    expect(pic.ground.lifetimeUs).toBeCloseTo(pic.gamma * REST_LIFETIME_US, 9)
    expect(pic.muon.lifetimeUs).toBe(REST_LIFETIME_US)
    expect(pic.muon.share).toBeCloseTo(pic.ground.share, 12)
    expect(pic.ground.share).toBeCloseTo(0.747, 3)
  })
})
