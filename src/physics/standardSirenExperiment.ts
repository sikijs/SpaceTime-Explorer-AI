// Models a gravitational wave's amplitude weakening with distance - the "standard siren" idea:
// comparing a wave's true (source) amplitude, which depends only on mass, to its weaker detected
// amplitude reveals the distance to the source, without any other distance measurement. Reuses
// gravitationalWaveChirpExperiment.ts's amplitude output and gravitationalWaveRealEventsExperiment.ts's
// two real event presets unchanged; the only new physics is the toy inverse-distance falloff below
// and the resulting Hubble-constant ratio (see this experiment's specification, "Physics Model").
//
// Audit update (2026-11-07, docs/audit/gravitational-waves/07-draft-wording.md, section 10): the
// functions below the three formulas compute every number the picture, the tables, the guess
// marks and the tutor show. They add no physics: a bar is a detected amplitude, a "story" is a true
// amplitude that would give the same detected amplitude, and the display transform only affects how
// far the arms are drawn.
import { BASE_AMPLITUDE, BASE_FREQUENCY, chirpRunFor, chirpStateAt } from './gravitationalWaveChirpExperiment'
import { REAL_EVENT_PRESETS } from './gravitationalWaveRealEventsExperiment'
import type { RealEventPreset } from './gravitationalWaveRealEventsExperiment'

export interface DistancePreset {
  label: string
  distanceMpc: number
}

// Each event's own real distance, converted from the approximate light-year figures already
// stated in gravitationalWaveRealEventsExperiment.ts's realDescription (1 Mpc ≈ 3.26 million
// light-years): GW150914 ≈ 1.3 billion ly ≈ 400 Mpc; GW170817 ≈ 130 million ly ≈ 40 Mpc.
export const REAL_EVENT_DISTANCES_MPC: Record<RealEventPreset['id'], number> = {
  gw150914: 400,
  gw170817: 40,
}

// Schematic presets for visible side-by-side contrast at a fixed mass - not tied to either
// event's real distance.
export const SCHEMATIC_DISTANCE_PRESETS: DistancePreset[] = [
  { label: 'Nearby', distanceMpc: 10 },
  { label: 'Far', distanceMpc: 1000 },
]

// Real, approximate published recession velocity for each event's host galaxy, corrected for
// local peculiar motion - not computed from this project's own Doppler model (Experiment 5),
// since in reality this number comes from the host galaxy's own light, not from the
// gravitational wave itself. GW150914 had no light counterpart (Experiment 4), so no host
// galaxy was ever identified and no recession velocity exists to give - a real limitation, not
// a simplification.
export const RECESSION_VELOCITY_KM_PER_S: Record<RealEventPreset['id'], number | null> = {
  gw150914: null,
  gw170817: 3017,
}

function validateDistance(distanceMpc: number): void {
  if (!(distanceMpc > 0)) {
    throw new RangeError('Distance must be greater than 0')
  }
}

function validateAmplitude(amplitude: number, name: string): void {
  if (!(amplitude > 0)) {
    throw new RangeError(`${name} must be greater than 0`)
  }
}

// The only new formula: a toy inverse-distance falloff (schematic units, not the precise
// general-relativistic luminosity-distance relation - see this experiment's specification,
// "Simplifying assumptions").
export function detectedAmplitude(trueAmplitude: number, distanceMpc: number): number {
  validateAmplitude(trueAmplitude, 'True amplitude')
  validateDistance(distanceMpc)
  return trueAmplitude / distanceMpc
}

// Inversion: recovers distance from a true amplitude (read directly from chirpStateAt) and a
// detected amplitude - the standard-siren step itself.
export function inferredDistanceMpc(trueAmplitude: number, detectedAmplitudeValue: number): number {
  validateAmplitude(trueAmplitude, 'True amplitude')
  validateAmplitude(detectedAmplitudeValue, 'Detected amplitude')
  return trueAmplitude / detectedAmplitudeValue
}

// Combines the inferred distance with a given recession velocity. Returns null if no velocity
// is available for the event (GW150914), since no real Hubble-constant estimate can be formed
// without one.
export function estimatedHubbleConstant(
  recessionVelocityKmPerS: number | null,
  distanceMpc: number
): number | null {
  if (recessionVelocityKmPerS === null) {
    return null
  }
  validateDistance(distanceMpc)
  return recessionVelocityKmPerS / distanceMpc
}

// ---- Fixed values of this experiment ----
export type EventId = RealEventPreset['id']
export const SIREN_PART1_EVENT: EventId = 'gw170817'
export const SIREN_PART1_DISTANCE_MPC = REAL_EVENT_DISTANCES_MPC.gw170817
export const NEARBY_DISTANCE_MPC = SCHEMATIC_DISTANCE_PRESETS[0].distanceMpc
export const FAR_DISTANCE_MPC = SCHEMATIC_DISTANCE_PRESETS[1].distanceMpc
// The three sources of Panel C: each would give the same detected amplitude as the run.
export const STORY_DISTANCES_MPC = [10, 40, 400]

// The published GW170817 result (the Hubble-constant paper, arXiv 1710.05835, read 2026-11-07): the most
// probable value and the narrowest 68.3% interval, the paper's own best distance, and the host galaxy's
// Hubble-flow velocity (the group velocity of 3,327 km/s corrected by 310 km/s for the bulk flow).
export const PUBLISHED_HUBBLE = {
  value: 70.0,
  plus: 12.0,
  minus: 8.0,
  low: 62.0,
  high: 82.0,
  bestDistanceMpc: 43.8,
  velocityKmPerS: 3017,
  velocityUncertaintyKmPerS: 166,
}

export type HubbleReading = 'inside the published range' | 'outside the published range'

// The check-up's plain reading: no cut-off is invented, only the paper's own interval.
export function hubbleVersusPublished(hubbleConstant: number): HubbleReading {
  return hubbleConstant >= PUBLISHED_HUBBLE.low && hubbleConstant <= PUBLISHED_HUBBLE.high ? 'inside the published range' : 'outside the published range'
}

// What the paper's own best distance and velocity give (3,017 / 43.8): the paper itself notes this.
export const publishedBestHubble = (): number => PUBLISHED_HUBBLE.velocityKmPerS / PUBLISHED_HUBBLE.bestDistanceMpc

function presetFor(eventId: EventId): RealEventPreset {
  const preset = REAL_EVENT_PRESETS.find((candidate) => candidate.id === eventId)
  if (!preset) throw new Error(`No event preset ${eventId}`)
  return preset
}

// The true amplitude at the final moment of the run: read directly from the chirp (not recomputed).
export function trueFinalAmplitude(eventId: EventId): number {
  const mass = presetFor(eventId).toyMass
  const { cutoffTime } = chirpRunFor(mass, BASE_FREQUENCY, BASE_AMPLITUDE)
  return chirpStateAt(cutoffTime, mass, BASE_FREQUENCY, BASE_AMPLITUDE).amplitude
}

export interface SirenRunSummary {
  eventId: EventId
  distanceMpc: number
  trueAmplitude: number
  detectedAmplitude: number
  recoveredDistanceMpc: number
  recessionVelocityKmPerS: number | null
  hubbleConstant: number | null
  detectedAtNearby: number
  detectedAtFar: number
  // detected at Nearby divided by detected at Far (the same event, same true amplitude)
  nearFarRatio: number
}

export function sirenRunSummary(eventId: EventId, distanceMpc: number): SirenRunSummary {
  const trueAmplitude = trueFinalAmplitude(eventId)
  const detected = detectedAmplitude(trueAmplitude, distanceMpc)
  const recovered = inferredDistanceMpc(trueAmplitude, detected)
  const velocity = RECESSION_VELOCITY_KM_PER_S[eventId]
  const detectedAtNearby = detectedAmplitude(trueAmplitude, NEARBY_DISTANCE_MPC)
  const detectedAtFar = detectedAmplitude(trueAmplitude, FAR_DISTANCE_MPC)
  return {
    eventId,
    distanceMpc,
    trueAmplitude,
    detectedAmplitude: detected,
    recoveredDistanceMpc: recovered,
    recessionVelocityKmPerS: velocity,
    hubbleConstant: estimatedHubbleConstant(velocity, recovered),
    detectedAtNearby,
    detectedAtFar,
    nearFarRatio: detectedAtNearby / detectedAtFar,
  }
}

// ---- Panel C: the same detected amplitude, several possible sources ----
export interface SirenStory {
  distanceMpc: number
  // the true amplitude a source at that distance would need to give the same detected amplitude
  trueAmplitude: number
}

export function sameDetectedStories(detected: number, distancesMpc: number[] = STORY_DISTANCES_MPC): SirenStory[] {
  validateAmplitude(detected, 'Detected amplitude')
  return distancesMpc.map((distanceMpc) => {
    validateDistance(distanceMpc)
    return { distanceMpc, trueAmplitude: detected * distanceMpc }
  })
}

// ---- The learner's two guesses ----
export type NearFarChoice = 'nearby-louder' | 'far-louder' | 'same'
export type DistanceKnowChoice = 'yes' | 'no'

// Guess 1, from the model: compare the detected amplitude of the same source at Nearby and at Far.
export function nearFarOutcome(): NearFarChoice {
  const trueAmplitude = trueFinalAmplitude(SIREN_PART1_EVENT)
  const near = detectedAmplitude(trueAmplitude, NEARBY_DISTANCE_MPC)
  const far = detectedAmplitude(trueAmplitude, FAR_DISTANCE_MPC)
  if (Math.abs(near - far) <= 1e-12) return 'same'
  return near > far ? 'nearby-louder' : 'far-louder'
}

// Guess 2, from the model: if several different (true amplitude, distance) pairs give the run's detected
// amplitude, the distance cannot be found from the detected amplitude alone.
export function distanceKnowOutcome(): DistanceKnowChoice {
  const detected = detectedAmplitude(trueFinalAmplitude(SIREN_PART1_EVENT), SIREN_PART1_DISTANCE_MPC)
  const stories = sameDetectedStories(detected)
  const distinct = new Set(stories.map((story) => story.trueAmplitude.toPrecision(12)))
  return distinct.size > 1 ? 'no' : 'yes'
}

export const nearFarGuessMatches = (choice: NearFarChoice): boolean => choice === nearFarOutcome()
export const distanceKnowGuessMatches = (choice: DistanceKnowChoice): boolean => choice === distanceKnowOutcome()

// The white marks are markers only: a guess here has no size of its own. Guess 1: an outline round the
// bar chosen (or a bracket joining both). Guess 2: a box that says yes or no.
export type NearFarMarker = 'nearby' | 'far' | 'both'
export type DistanceKnowMarker = 'yes' | 'no'
export const nearFarGuessMarker = (choice: NearFarChoice): NearFarMarker => (choice === 'nearby-louder' ? 'nearby' : choice === 'far-louder' ? 'far' : 'both')
export const distanceKnowGuessMarker = (choice: DistanceKnowChoice): DistanceKnowMarker => choice

// ---- The arms' display transform (previously in the component) ----
// The real detected strain is far too small to see at any distance this experiment offers, so the arms are drawn with a
// square-root compression (the same idea as a decibel scale), a tuned gain and a cap. A detected strain 100 times
// smaller is drawn about 10 times less stretched, until the cap. It affects only how far the arms are drawn (CLAUDE.md §11).
export const DISPLAY_GAIN = 125
export const MAX_DISPLAY_STRAIN_MAGNITUDE = 0.65

export function displayedStrain(trueStrain: number, distanceMpc: number): number {
  validateDistance(distanceMpc)
  const detectedStrain = trueStrain / distanceMpc
  const raw = Math.sign(detectedStrain) * Math.sqrt(Math.abs(detectedStrain) * DISPLAY_GAIN)
  return Math.max(-MAX_DISPLAY_STRAIN_MAGNITUDE, Math.min(MAX_DISPLAY_STRAIN_MAGNITUDE, raw))
}

// ---- Table 2: the learner's choice beside the Part 1 run ----
export type ComparisonWord = 'the same' | 'more' | 'less'
export type EventComparisonWord = 'the same' | 'different'

const EQUAL_TOLERANCE = 1e-12

export function compareWord(yours: number, part1: number): ComparisonWord {
  if (Math.abs(yours - part1) <= EQUAL_TOLERANCE * Math.max(1, Math.abs(part1))) return 'the same'
  return yours > part1 ? 'more' : 'less'
}

export interface YourChoiceComparison {
  yours: SirenRunSummary
  part1: SirenRunSummary
  atPart1Choice: boolean
  words: {
    event: EventComparisonWord
    distance: ComparisonWord
    trueAmplitude: ComparisonWord
    detectedAmplitude: ComparisonWord
    recoveredDistance: ComparisonWord
    // null when the learner's event has no recession velocity (GW150914)
    hubbleConstant: ComparisonWord | null
  }
}

export function yourChoiceComparison(eventId: EventId, distanceMpc: number): YourChoiceComparison {
  const yours = sirenRunSummary(eventId, distanceMpc)
  const part1 = sirenRunSummary(SIREN_PART1_EVENT, SIREN_PART1_DISTANCE_MPC)
  return {
    yours,
    part1,
    atPart1Choice: eventId === SIREN_PART1_EVENT && Math.abs(distanceMpc - SIREN_PART1_DISTANCE_MPC) <= EQUAL_TOLERANCE,
    words: {
      event: eventId === SIREN_PART1_EVENT ? 'the same' : 'different',
      distance: compareWord(yours.distanceMpc, part1.distanceMpc),
      trueAmplitude: compareWord(yours.trueAmplitude, part1.trueAmplitude),
      detectedAmplitude: compareWord(yours.detectedAmplitude, part1.detectedAmplitude),
      recoveredDistance: compareWord(yours.recoveredDistanceMpc, part1.recoveredDistanceMpc),
      hubbleConstant: yours.hubbleConstant === null || part1.hubbleConstant === null ? null : compareWord(yours.hubbleConstant, part1.hubbleConstant),
    },
  }
}
