import { describe, expect, it } from 'vitest'
import { chirpStateAt } from './gravitationalWaveChirpExperiment'
import {
  compareWord,
  detectedAmplitude,
  DISPLAY_GAIN,
  displayedStrain,
  distanceKnowGuessMarker,
  distanceKnowGuessMatches,
  distanceKnowOutcome,
  estimatedHubbleConstant,
  hubbleVersusPublished,
  inferredDistanceMpc,
  MAX_DISPLAY_STRAIN_MAGNITUDE,
  nearFarGuessMarker,
  nearFarGuessMatches,
  nearFarOutcome,
  PUBLISHED_HUBBLE,
  publishedBestHubble,
  RECESSION_VELOCITY_KM_PER_S,
  sameDetectedStories,
  SIREN_PART1_DISTANCE_MPC,
  SIREN_PART1_EVENT,
  sirenRunSummary,
  STORY_DISTANCES_MPC,
  trueFinalAmplitude,
  yourChoiceComparison,
} from './standardSirenExperiment'
import type { DistanceKnowChoice, NearFarChoice } from './standardSirenExperiment'

describe('detectedAmplitude', () => {
  it('follows the exact inverse-distance law', () => {
    expect(detectedAmplitude(1, 10)).toBeCloseTo(0.1, 10)
    expect(detectedAmplitude(2, 4)).toBeCloseTo(0.5, 10)
  })

  it('doubling distance exactly halves detected amplitude', () => {
    const trueAmplitude = 0.4
    const near = detectedAmplitude(trueAmplitude, 20)
    const far = detectedAmplitude(trueAmplitude, 40)
    expect(far).toBeCloseTo(near / 2, 10)
  })
})

describe('inferredDistanceMpc', () => {
  it('exactly recovers the distance used to compute a detected amplitude', () => {
    const trueAmplitude = 0.37
    for (const distanceMpc of [5, 40, 400, 1000]) {
      const detected = detectedAmplitude(trueAmplitude, distanceMpc)
      expect(inferredDistanceMpc(trueAmplitude, detected)).toBeCloseTo(distanceMpc, 8)
    }
  })
})

describe('distance vs. detected amplitude', () => {
  it('for equal mass, a farther distance produces a strictly smaller detected amplitude', () => {
    const trueAmplitude = 0.25
    const nearby = detectedAmplitude(trueAmplitude, 10)
    const far = detectedAmplitude(trueAmplitude, 1000)
    expect(far).toBeLessThan(nearby)
  })
})

describe('estimatedHubbleConstant', () => {
  it('returns null when given a null recession velocity (the GW150914 case)', () => {
    expect(estimatedHubbleConstant(RECESSION_VELOCITY_KM_PER_S.gw150914, 400)).toBeNull()
  })

  it('returns the plain, correctly computed ratio of velocity to distance otherwise', () => {
    expect(estimatedHubbleConstant(3017, 40)).toBeCloseTo(3017 / 40, 10)
    expect(estimatedHubbleConstant(RECESSION_VELOCITY_KM_PER_S.gw170817, 40)).toBeCloseTo(75.425, 10)
  })
})

describe('reuse of chirpStateAt amplitude', () => {
  it('true amplitude is read directly from chirpStateAt, not recomputed', () => {
    const mass = 2
    const baseFrequency = 2
    const baseAmplitude = 0.1
    const state = chirpStateAt(0, mass, baseFrequency, baseAmplitude)
    // chirpStateAt's own documented behavior: at time 0, amplitude equals baseAmplitude * mass.
    expect(state.amplitude).toBeCloseTo(baseAmplitude * mass, 10)
    // This experiment must use that value as-is, with no independent recomputation.
    expect(detectedAmplitude(state.amplitude, 10)).toBeCloseTo(state.amplitude / 10, 10)
  })
})

const NEAR_FAR: NearFarChoice[] = ['nearby-louder', 'far-louder', 'same']
const DISTANCE_KNOW: DistanceKnowChoice[] = ['yes', 'no']

describe('the audit additions (draft wording, section 10)', () => {
  it('uses GW170817 at 40 Mpc for Part 1 and reproduces the amplitudes the draft quotes', () => {
    expect(SIREN_PART1_EVENT).toBe('gw170817')
    expect(SIREN_PART1_DISTANCE_MPC).toBe(40)
    const run = sirenRunSummary('gw170817', 40)
    expect(run.trueAmplitude).toBeCloseTo(0.0285, 4)
    expect(run.detectedAmplitude).toBeCloseTo(7.115e-4, 7)
    expect(run.detectedAtNearby).toBeCloseTo(2.846e-3, 6)
    expect(run.detectedAtFar).toBeCloseTo(2.846e-5, 8)
    expect(run.nearFarRatio).toBeCloseTo(100, 9)
    expect(run.recoveredDistanceMpc).toBeCloseTo(40, 9)
    expect(run.hubbleConstant).toBeCloseTo(75.4, 1)
    expect(run.recessionVelocityKmPerS).toBe(3017)
    const other = sirenRunSummary('gw150914', 400)
    expect(other.trueAmplitude).toBeCloseTo(0.5218, 4)
    expect(other.detectedAmplitude).toBeCloseTo(1.304e-3, 6)
    expect(other.detectedAtNearby).toBeCloseTo(5.218e-2, 5)
    expect(other.detectedAtFar).toBeCloseTo(5.218e-4, 7)
    expect(other.hubbleConstant).toBeNull()
  })

  it('reads the true amplitude from the chirp, and gives the same ratio between Nearby and Far for every event', () => {
    for (const id of ['gw150914', 'gw170817'] as const) {
      expect(trueFinalAmplitude(id)).toBeGreaterThan(0)
      expect(sirenRunSummary(id, 123).nearFarRatio).toBeCloseTo(100, 9)
    }
  })

  it('gives the three Panel C stories (true amplitudes 0.0071, 0.0285 and 0.285), each giving the same detected amplitude', () => {
    expect(STORY_DISTANCES_MPC).toEqual([10, 40, 400])
    const detected = sirenRunSummary('gw170817', 40).detectedAmplitude
    const stories = sameDetectedStories(detected)
    expect(stories.map((s) => s.trueAmplitude)).toEqual([detected * 10, detected * 40, detected * 400])
    expect(stories[0].trueAmplitude).toBeCloseTo(0.0071, 4)
    expect(stories[1].trueAmplitude).toBeCloseTo(0.0285, 4)
    expect(stories[2].trueAmplitude).toBeCloseTo(0.285, 3)
    for (const story of stories) expect(detectedAmplitude(story.trueAmplitude, story.distanceMpc)).toBeCloseTo(detected, 12)
    expect(() => sameDetectedStories(0)).toThrow(RangeError)
    expect(() => sameDetectedStories(1, [0])).toThrow(RangeError)
  })

  it('decides the two guesses in the module: "nearby louder" and "no", with exactly one matching choice each', () => {
    expect(nearFarOutcome()).toBe('nearby-louder')
    expect(distanceKnowOutcome()).toBe('no')
    expect(NEAR_FAR.filter(nearFarGuessMatches)).toEqual(['nearby-louder'])
    expect(DISTANCE_KNOW.filter(distanceKnowGuessMatches)).toEqual(['no'])
  })

  it('gives a different marker for each choice, and never reads the run', () => {
    expect(new Set(NEAR_FAR.map(nearFarGuessMarker)).size).toBe(3)
    expect(nearFarGuessMarker('nearby-louder')).toBe('nearby')
    expect(nearFarGuessMarker('far-louder')).toBe('far')
    expect(nearFarGuessMarker('same')).toBe('both')
    expect(distanceKnowGuessMarker('yes')).toBe('yes')
    expect(distanceKnowGuessMarker('no')).toBe('no')
  })

  it('moves the display compression into the module: a 100 times weaker wave is drawn about 10 times less stretched, until the cap', () => {
    expect(DISPLAY_GAIN).toBe(125)
    expect(MAX_DISPLAY_STRAIN_MAGNITUDE).toBe(0.65)
    expect(displayedStrain(0.03, 10) / displayedStrain(0.03, 1000)).toBeCloseTo(10, 9)
    expect(displayedStrain(0.03, 1)).toBe(0.65)
    expect(displayedStrain(-0.03, 1)).toBe(-0.65)
    expect(displayedStrain(0, 10)).toBe(0)
    expect(displayedStrain(0.03, 40)).toBeGreaterThan(displayedStrain(0.03, 400))
    expect(() => displayedStrain(0.03, 0)).toThrow(RangeError)
  })

  it('reads the published result: 70.0 +12.0/-8.0, an interval of 62 to 82, a best distance of 43.8 Mpc and 3,017 km/s', () => {
    expect(PUBLISHED_HUBBLE.value).toBe(70)
    expect(PUBLISHED_HUBBLE.value - PUBLISHED_HUBBLE.minus).toBe(PUBLISHED_HUBBLE.low)
    expect(PUBLISHED_HUBBLE.value + PUBLISHED_HUBBLE.plus).toBe(PUBLISHED_HUBBLE.high)
    expect(PUBLISHED_HUBBLE.velocityKmPerS).toBe(RECESSION_VELOCITY_KM_PER_S.gw170817)
    expect(publishedBestHubble()).toBeCloseTo(68.9, 1)
    expect(hubbleVersusPublished(75.4)).toBe('inside the published range')
    expect(hubbleVersusPublished(68.9)).toBe('inside the published range')
    expect(hubbleVersusPublished(62)).toBe('inside the published range')
    expect(hubbleVersusPublished(61.9)).toBe('outside the published range')
    expect(hubbleVersusPublished(82.1)).toBe('outside the published range')
  })

  it('says "the same" in every Table 2 row at the Part 1 choice, and "more", "less" or "different" once it changes', () => {
    const atPart1 = yourChoiceComparison('gw170817', 40)
    expect(atPart1.atPart1Choice).toBe(true)
    for (const word of Object.values(atPart1.words)) expect(word).toBe('the same')
    const far = yourChoiceComparison('gw170817', 1000)
    expect(far.atPart1Choice).toBe(false)
    expect(far.words.distance).toBe('more')
    expect(far.words.detectedAmplitude).toBe('less')
    expect(far.words.trueAmplitude).toBe('the same')
    expect(far.words.hubbleConstant).toBe('less')
    const other = yourChoiceComparison('gw150914', 400)
    expect(other.words.event).toBe('different')
    expect(other.words.trueAmplitude).toBe('more')
    expect(other.words.hubbleConstant).toBeNull()
  })

  it('compareWord uses only equality for "the same"', () => {
    expect(compareWord(5, 5)).toBe('the same')
    expect(compareWord(5.01, 5)).toBe('more')
    expect(compareWord(4.99, 5)).toBe('less')
  })
})
