// Evidence and Imagination, Experiment 5: Does the Sun slow light? The extra time a radio signal takes to go from the Earth to a planet on the far side of the Sun and back, because of the Sun's gravity
// (the Shapiro delay), and the published tests of it (Shapiro 1964, Viking 1979, Cassini 2002).
// Physics only: no React or browser code (CLAUDE.md §9). It imports nothing.
// Units: lengths in metres, times in microseconds (us) unless a name says otherwise. One straight path in flat space plus the Sun's logarithmic delay; the corona, the planets' own gravity,
// the motion of the Earth and the target during the trip and the second-order terms are not modelled (the specification's Decision 3).
// THE FORMULA (specification, "Physics Model"): one way, delay = (1 + gamma) (GM / c^3) ln[ (r_e + x_e)(r_t + x_t) / b^2 ], where x = sqrt(r^2 - b^2) is each end's distance along the path from the point of
// closest approach, b is the closest distance to the Sun's centre, and the Earth and the target are on opposite sides of the Sun. This equals (1 + gamma) (GM / c^3) times the integral of ds / r along the straight
// path (checked numerically in the tests). It is the leading logarithmic term only. A fuller treatment adds a term of about GM / c^3 per end of the path (about 20 us in a Venus round trip, recalled and NOT read
// from a source), which this module does not include. Source: Wikipedia's "Shapiro time delay" (read 2026-11-01); Shapiro 1964 and the Cassini paper were not read (specification, "Sources" and Open items a and b).
// gamma = 1 in general relativity; gamma = 0 is the Newtonian-style value of Gravity 8 (half the delay).

export const SPEED_OF_LIGHT_M_PER_S = 299792458
export const SUN_GM_M3_PER_S2 = 1.32712440018e20 // the standard value; to be checked against an IAU or NASA page (Open item)
export const ASTRONOMICAL_UNIT_M = 1.495978707e11 // exact, by the IAU's definition
export const SUN_RADIUS_M = 6.957e8 // the IAU's nominal solar radius

// GM / c^3 for the Sun, in us (about 4.9255).
export const SUN_GM_OVER_C3_US = (SUN_GM_M3_PER_S2 / SPEED_OF_LIGHT_M_PER_S ** 3) * 1e6

// A fuller treatment adds a term of about 4 GM / c^3 to a round trip. RECALLED from memory, NOT read from a source (the specification's Open item and formula decision); the tutor names it only as "thought to be about this" (Picture 2's caption and the tutor).
export const FULLER_TERM_RECALLED_US = 4 * SUN_GM_OVER_C3_US

// The parameter gamma: 1 in general relativity, 0 in the Newtonian-style picture.
export const GAMMA_GENERAL_RELATIVITY = 1
export const GAMMA_NEWTONIAN_STYLE = 0

function checkGeometry(rEarthM: number, rTargetM: number, closestM: number): void {
  if (![rEarthM, rTargetM, closestM].every((v) => Number.isFinite(v) && v > 0)) throw new RangeError('Every distance must be above zero.')
  if (closestM >= rEarthM || closestM >= rTargetM) throw new RangeError('The closest distance to the Sun must be less than each end\'s distance from the Sun.')
}

// ---- Light's own timing, for the introduction's examples ----
// How long light takes to go a distance, in seconds (Earth to Sun, 1 AU: about 499 s, 8.3 minutes).
export function lightTimeSeconds(distanceM: number): number {
  if (!Number.isFinite(distanceM) || distanceM < 0) throw new RangeError('The distance must not be negative.')
  return distanceM / SPEED_OF_LIGHT_M_PER_S
}
// How far light goes in one microsecond, in metres (about 300 m).
export function lightDistanceInOneMicrosecondM(): number {
  return SPEED_OF_LIGHT_M_PER_S * 1e-6
}

// ---- The trip in flat space ----
// How far an end is from the point of closest approach, along the straight path.
export function legLengthM(rM: number, closestM: number): number {
  return Math.sqrt(rM * rM - closestM * closestM)
}
// The round trip with no Sun's delay: 2 (x_e + x_t) / c, in us.
export function flatRoundTripUs(rEarthM: number, rTargetM: number, closestM: number): number {
  checkGeometry(rEarthM, rTargetM, closestM)
  return ((2 * (legLengthM(rEarthM, closestM) + legLengthM(rTargetM, closestM))) / SPEED_OF_LIGHT_M_PER_S) * 1e6
}
export function flatRoundTripMinutes(rEarthM: number, rTargetM: number, closestM: number): number {
  return flatRoundTripUs(rEarthM, rTargetM, closestM) / 6e7
}

// ---- The Sun's extra delay ----
export function oneWayDelayUs(rEarthM: number, rTargetM: number, closestM: number, gamma: number = GAMMA_GENERAL_RELATIVITY): number {
  checkGeometry(rEarthM, rTargetM, closestM)
  if (!Number.isFinite(gamma) || gamma < 0) throw new RangeError('Gamma must not be negative.')
  const xe = legLengthM(rEarthM, closestM)
  const xt = legLengthM(rTargetM, closestM)
  return (1 + gamma) * SUN_GM_OVER_C3_US * Math.log(((rEarthM + xe) * (rTargetM + xt)) / (closestM * closestM))
}
// The round trip: twice the one way.
export function roundTripDelayUs(rEarthM: number, rTargetM: number, closestM: number, gamma: number = GAMMA_GENERAL_RELATIVITY): number {
  return 2 * oneWayDelayUs(rEarthM, rTargetM, closestM, gamma)
}
// The leading form for a path that passes the Sun much closer than either end is to it: (1 + gamma) (GM / c^3) ln(4 r_e r_t / b^2), one way.
export function oneWayDelayLeadingFormUs(rEarthM: number, rTargetM: number, closestM: number, gamma: number = GAMMA_GENERAL_RELATIVITY): number {
  checkGeometry(rEarthM, rTargetM, closestM)
  return (1 + gamma) * SUN_GM_OVER_C3_US * Math.log((4 * rEarthM * rTargetM) / (closestM * closestM))
}

// ---- The learner's choices ----
// The Earth is at 1 AU. The targets' distances are round figures (Venus 0.72, Mercury 0.387, Mars 1.52 AU); the real orbits are not circles (the specification's "Not modelled").
export const EARTH_DISTANCE_AU = 1
export const TARGET_CHOICES = [
  { id: 'mercury', label: 'Mercury', distanceAu: 0.387 },
  { id: 'venus', label: 'Venus', distanceAu: 0.72 },
  { id: 'mars', label: 'Mars', distanceAu: 1.52 },
] as const
export type TargetId = (typeof TARGET_CHOICES)[number]['id']
// The closest distance of the path to the Sun's centre, in solar radii (1 is grazing the Sun's edge).
export const CLOSEST_CHOICES_RADII = [1, 2, 5, 10, 50, 100] as const
// A path that ends at a target cannot pass the Sun's centre farther out than the target is, so a closest distance is offered only if it is less than the target's distance from the Sun
// (100 solar radii is 0.465 AU, which is beyond Mercury at 0.387 AU, so Mercury is offered the first five).
export function closestChoicesFor(targetId: string): readonly number[] {
  const limitM = targetDistanceM(targetId)
  return CLOSEST_CHOICES_RADII.filter((radii) => radii * SUN_RADIUS_M < limitM)
}
export const FARTHEST_CLOSEST_RADII = CLOSEST_CHOICES_RADII[CLOSEST_CHOICES_RADII.length - 1]
export const PRESET_TARGET_ID: TargetId = 'venus'
export const PRESET_CLOSEST_RADII = 1

export function targetDistanceM(id: string): number {
  const t = TARGET_CHOICES.find((c) => c.id === id)
  if (!t) throw new RangeError(`Unknown target: ${id}`)
  return t.distanceAu * ASTRONOMICAL_UNIT_M
}
// How far a target is from the Sun's centre, in solar radii (Mercury about 83, Venus about 155, Mars about 327), the most a path to it can be offered as a closest distance.
export function targetDistanceInSolarRadii(id: string): number {
  return targetDistanceM(id) / SUN_RADIUS_M
}
export function earthDistanceM(): number {
  return EARTH_DISTANCE_AU * ASTRONOMICAL_UNIT_M
}

// Everything Drawing A and the pictures show for one target and one closest distance (in solar radii).
export function trialDelay(targetId: string, closestRadii: number) {
  const rt = targetDistanceM(targetId)
  const re = earthDistanceM()
  const b = closestRadii * SUN_RADIUS_M
  const flatUs = flatRoundTripUs(re, rt, b)
  const delayUs = roundTripDelayUs(re, rt, b, GAMMA_GENERAL_RELATIVITY)
  const newtonianUs = roundTripDelayUs(re, rt, b, GAMMA_NEWTONIAN_STYLE)
  return { targetId, closestRadii, flatUs, flatMinutes: flatUs / 6e7, delayUs, newtonianUs, delayOverFlat: delayUs / flatUs, extraPathM: (delayUs * 1e-6) * SPEED_OF_LIGHT_M_PER_S }
}

// The round trip with no effect from the Sun, the round trip with it, and the difference (the extra time), in us, for Picture 2's Part A.
export function tripWithAndWithoutSun(targetId: string, closestRadii: number) {
  const t = trialDelay(targetId, closestRadii)
  return { withoutSunUs: t.flatUs, withSunUs: t.flatUs + t.delayUs, extraUs: t.delayUs, withoutSunSeconds: t.flatUs / 1e6, withSunSeconds: (t.flatUs + t.delayUs) / 1e6 }
}

// The two parts of the extra time, for the "Why does the Sun add this time?" box: the part the ordinary picture of gravity has (the gamma = 0 value, the slowing of time) and the rest (what the stretching
// of space adds). In this formula the two are equal; the split follows Wikipedia's account ("twice the Newtonian prediction", time dilation plus radial stretching), which was not checked against a paper.
export function delayParts(targetId: string, closestRadii: number) {
  const t = trialDelay(targetId, closestRadii)
  return { timeSlowingUs: t.newtonianUs, spaceStretchingUs: t.delayUs - t.newtonianUs, totalUs: t.delayUs }
}

// The road-trip comparison in the same box: a 100 km drive at 100 km/h, then slow traffic (95 km/h), then a road 5 km longer, then both. Times in minutes. An illustration of why two small causes add, not physics.
export const ROAD_EXAMPLE = { lengthKm: 100, speedKmh: 100, slowSpeedKmh: 95, longerLengthKm: 105 } as const
export function roadTripExample() {
  const minutes = (km: number, kmh: number) => (km / kmh) * 60
  const base = minutes(ROAD_EXAMPLE.lengthKm, ROAD_EXAMPLE.speedKmh)
  const slow = minutes(ROAD_EXAMPLE.lengthKm, ROAD_EXAMPLE.slowSpeedKmh)
  const longer = minutes(ROAD_EXAMPLE.longerLengthKm, ROAD_EXAMPLE.speedKmh)
  const both = minutes(ROAD_EXAMPLE.longerLengthKm, ROAD_EXAMPLE.slowSpeedKmh)
  return { base, slow, longer, both, lateSlow: slow - base, lateLonger: longer - base, lateBoth: both - base }
}

// The flat-space trip split into its steps, for the worked moment under Picture 1 (distances in metres, times in seconds).
export function flatTripBreakdown(targetId: string, closestRadii: number) {
  const re = earthDistanceM()
  const rt = targetDistanceM(targetId)
  const b = closestRadii * SUN_RADIUS_M
  const earthLegM = legLengthM(re, b)
  const targetLegM = legLengthM(rt, b)
  const oneWayM = earthLegM + targetLegM
  const oneWaySeconds = lightTimeSeconds(oneWayM)
  return { earthLegM, targetLegM, oneWayM, oneWaySeconds, roundTripSeconds: 2 * oneWaySeconds, roundTripMinutes: (2 * oneWaySeconds) / 60, closestM: b }
}

// ---- Published figures (stored as quoted, not recomputed; specification, "Sources") ----
// Shapiro 1964, as Wikipedia quotes it: delays "increased by almost 2 x 10^-4 s", "equivalent to 60 km", measurable "to within about 5 to 10%". The paper was not read.
export const SHAPIRO_1964_DELAY_US = 200
export const SHAPIRO_1964_EQUIVALENT_PATH_KM = 60
export const SHAPIRO_1964_PRECISION_PERCENT_LOW = 5
export const SHAPIRO_1964_PRECISION_PERCENT_HIGH = 10
// Viking, 1979: JPL's release says past tests reached "one part per thousand".
export const VIKING_PRECISION = 1e-3
// Cassini, 2002 (Bertotti, Iess and Tortora, Nature 2003): (gamma - 1) = (2.1 +/- 2.3) x 10^-5, from the paper's abstract (Nature page opened in Chrome, 2026-11-01; the rest of the paper is behind a subscription and was not read); JPL's release says "20 parts per million" and "50 times greater" than before.
export const CASSINI_GAMMA_MINUS_ONE = 2.1e-5
export const CASSINI_GAMMA_MINUS_ONE_GIVE_OR_TAKE = 2.3e-5
export const CASSINI_PRECISION_PPM_JPL = 20
export const CASSINI_IMPROVEMENT_FACTOR_JPL = 50

// The three tests' precisions in parts per million, as quoted (Shapiro's is his estimate of what a radar test could do, not a result).
export function testPrecisionsPpm() {
  return {
    shapiroEstimateLow: precisionPartsPerMillion(SHAPIRO_1964_PRECISION_PERCENT_LOW / 100),
    shapiroEstimateHigh: precisionPartsPerMillion(SHAPIRO_1964_PRECISION_PERCENT_HIGH / 100),
    viking: precisionPartsPerMillion(VIKING_PRECISION),
    cassini: CASSINI_PRECISION_PPM_JPL,
    vikingOverCassini: precisionPartsPerMillion(VIKING_PRECISION) / CASSINI_PRECISION_PPM_JPL,
  }
}
// How many parts per million of the delay each test could pin down (precision as a fraction of the delay).
export function precisionPartsPerMillion(fraction: number): number {
  return fraction * 1e6
}

// ---- Comparison helpers for the results ----
export const COMPARE_RELATIVE_TOLERANCE = 1e-9
export type Comparison = 'the same' | 'more' | 'less'
export function compare(value: number, reference: number): Comparison {
  const scale = Math.max(Math.abs(value), Math.abs(reference), Number.MIN_VALUE)
  if (Math.abs(value - reference) <= COMPARE_RELATIVE_TOLERANCE * scale) return 'the same'
  return value > reference ? 'more' : 'less'
}
export function withinGiveOrTake(measured: number, reference: number, giveOrTake: number): boolean {
  return Math.abs(measured - reference) <= giveOrTake
}

// ---- Answers to the predictions ----
export function nearestChoice<T>(choices: readonly T[], value: number, valueOf: (c: T) => number): T {
  let best = choices[0]
  for (const c of choices) if (Math.abs(valueOf(c) - value) < Math.abs(valueOf(best) - value)) best = c
  return best
}

// Prediction 1: Earth to Venus and back, grazing the Sun's edge: about how much longer does the round trip take? Five buttons, in us, far apart, so the nearest is found on a log scale.
export const DELAY_ANSWER_CHOICES = [
  { id: 'about-0-2', label: 'About 0.2 µs', valueUs: 0.2 },
  { id: 'about-2', label: 'About 2 µs', valueUs: 2 },
  { id: 'about-20', label: 'About 20 µs', valueUs: 20 },
  { id: 'about-200', label: 'About 200 µs', valueUs: 200 },
  { id: 'about-2000', label: 'About 2,000 µs', valueUs: 2000 },
] as const
export type DelayAnswerId = (typeof DELAY_ANSWER_CHOICES)[number]['id']
export function predictionOneDelayUs(): number {
  return trialDelay('venus', 1).delayUs
}
// The button nearest a delay in us, found on a log scale (700 us is nearer 2,000 than 200 on that scale, and nearer 200 on a straight one).
export function delayAnswerIdFor(delayUs: number): DelayAnswerId {
  return nearestChoice(DELAY_ANSWER_CHOICES, Math.log(delayUs), (c) => Math.log(c.valueUs)).id
}
export function predictionOneAnswerId(): DelayAnswerId {
  return delayAnswerIdFor(predictionOneDelayUs())
}
export function delayGuessValueUs(id: string): number {
  const choice = DELAY_ANSWER_CHOICES.find((c) => c.id === id)
  if (!choice) throw new RangeError(`Unknown delay guess: ${id}`)
  return choice.valueUs
}

// Prediction 2: the signal passes the Sun 10 times farther out (10 solar radii instead of 1): how does the extra delay change? Five buttons, each a "times smaller" figure
// (the delay at 1 solar radius divided by the delay at 10). The button values 100, 10, 2, 1.2 and 1 are the author's round figures for the five wordings.
export const PREDICTION_TWO_FAR_RADII = 10
export const DISTANCE_ANSWER_CHOICES = [
  { id: 'about-100-times', label: 'About 100 times smaller', timesSmaller: 100 },
  { id: 'about-10-times', label: 'About 10 times smaller', timesSmaller: 10 },
  { id: 'about-2-times', label: 'About 2 times smaller', timesSmaller: 2 },
  { id: 'a-little', label: 'Only a little smaller', timesSmaller: 1.2 },
  { id: 'the-same', label: 'About the same', timesSmaller: 1 },
] as const
export type DistanceAnswerId = (typeof DISTANCE_ANSWER_CHOICES)[number]['id']
export function predictionTwoTimesSmaller(): number {
  return trialDelay('venus', 1).delayUs / trialDelay('venus', PREDICTION_TWO_FAR_RADII).delayUs
}
export function predictionTwoAnswerId(): DistanceAnswerId {
  return nearestChoice(DISTANCE_ANSWER_CHOICES, Math.log(predictionTwoTimesSmaller()), (c) => Math.log(c.timesSmaller)).id
}
// Where Prediction 2's guess is drawn on Picture 3: the extra time at 10 solar radii if the real extra time at 1 solar radius became "this many times smaller" (a marker for the guess, not a calculation of it).
export function guessedFarDelayUs(id: string): number {
  return trialDelay('venus', 1).delayUs / distanceGuessTimesSmaller(id)
}
export function distanceGuessTimesSmaller(id: string): number {
  const choice = DISTANCE_ANSWER_CHOICES.find((c) => c.id === id)
  if (!choice) throw new RangeError(`Unknown distance guess: ${id}`)
  return choice.timesSmaller
}

