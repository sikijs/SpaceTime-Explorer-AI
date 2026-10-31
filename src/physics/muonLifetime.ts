// Evidence and Imagination, Experiment 4: How long does a muon live? A muon's decay as a clock: the share still alive after a trip, with and without the slow clock of special relativity,
// the same trip in the muon's own view (a shorter road), the average lifetime in a storage ring (Bailey and others, CERN, 1977) and the mountain count of Frisch and Smith (1962).
// Physics only: no React or browser code (CLAUDE.md §9). It imports nothing.
// Units: speeds as a fraction of c unless a name says otherwise; times in microseconds (us); lengths in metres. One straight fall at a steady speed (the specification's Decision 4):
// no energy loss, no spread of birth heights, no difference between mu+ and mu-.
// Sources and what is unchecked (specification, "Sources"): the rest lifetime is the Particle Data Group's average (read); the ring figures are from the paper's abstract (read, the paper is not);
// Frisch and Smith's figures are from Wikipedia's account only (the paper returned 403); the 15 km birth height is "typical", from an educational page and a search summary.

function checkSpeed(beta: number, what: string): void {
  if (!Number.isFinite(beta) || beta <= 0 || beta >= 1) throw new RangeError(`${what} must satisfy 0 < speed < c.`)
}
function checkHeight(heightM: number): void {
  if (!Number.isFinite(heightM) || heightM <= 0) throw new RangeError('The height must be above zero.')
}

export const SPEED_OF_LIGHT_M_PER_S = 299792458

// ---- The clock at rest ----
// PDG average of the mean life of a muon at rest: 2.1969811 +/- 0.0000022 (x 10^-6 s). Mostly the MuLan experiment (2013), 1.0 ppm.
export const REST_LIFETIME_US = 2.1969811
export const REST_LIFETIME_GIVE_OR_TAKE_US = 0.0000022
// Share still alive after a number of average lifetimes: exp(-n). (Each lifetime, the share left falls by the same fraction.)
export function shareAfterLifetimes(lifetimes: number): number {
  if (!Number.isFinite(lifetimes) || lifetimes < 0) throw new RangeError('The number of lifetimes must be zero or more.')
  return Math.exp(-lifetimes)
}
// How far light goes in one rest lifetime, in metres (about 659 m).
export function lightDistanceInOneLifetimeM(): number {
  return SPEED_OF_LIGHT_M_PER_S * REST_LIFETIME_US * 1e-6
}
// How many times that distance a given height is (15 km is about 23 times).
export function heightInLightDistances(heightM: number): number {
  return heightM / lightDistanceInOneLifetimeM()
}

// ---- The factor ----
// gamma = 1 / sqrt(1 - beta^2). The slowed lifetime is gamma times the rest lifetime, as the lab measures it.
export function lorentzFactor(beta: number): number {
  checkSpeed(beta, 'The speed')
  return 1 / Math.sqrt(1 - beta * beta)
}
// The speed (a fraction of c) that goes with a factor gamma >= 1; undoes `lorentzFactor`.
export function betaFromGamma(gamma: number): number {
  if (!Number.isFinite(gamma) || gamma <= 1) throw new RangeError('The factor must be above 1.')
  return Math.sqrt(1 - 1 / (gamma * gamma))
}

// ---- A fall from a height at a steady speed (the ground's view) ----
// The time the fall takes by the ground's clocks, in us.
export function flightTimeUs(heightM: number, beta: number): number {
  checkHeight(heightM)
  checkSpeed(beta, 'The speed')
  return (heightM / (beta * SPEED_OF_LIGHT_M_PER_S)) * 1e6
}
// The same time in rest lifetimes.
export function flightTimeInLifetimes(heightM: number, beta: number): number {
  return flightTimeUs(heightM, beta) / REST_LIFETIME_US
}
// Share alive if a moving muon's lifetime were the rest value (the everyday expectation): exp(-t / tau0).
export function shareAliveEveryday(heightM: number, beta: number): number {
  return Math.exp(-flightTimeUs(heightM, beta) / REST_LIFETIME_US)
}
// Share alive with the slow clock: exp(-t / (gamma tau0)).
export function shareAliveSlowClock(heightM: number, beta: number): number {
  return Math.exp(-flightTimeUs(heightM, beta) / (lorentzFactor(beta) * REST_LIFETIME_US))
}
// How many times more muons arrive with the slow clock than the everyday expectation gives.
export function slowClockGainFactor(heightM: number, beta: number): number {
  return shareAliveSlowClock(heightM, beta) / shareAliveEveryday(heightM, beta)
}

// ---- The same fall in the muon's own view ----
// The air column is squeezed to H / gamma, the trip takes (t / gamma) of the muon's own time, and the muon's lifetime is the rest value. The share alive comes out the same as the slow clock's.
export function muonView(heightM: number, beta: number) {
  const gamma = lorentzFactor(beta)
  const roadM = heightM / gamma
  const tripUs = roadM / (beta * SPEED_OF_LIGHT_M_PER_S) * 1e6
  const lifetimes = tripUs / REST_LIFETIME_US
  return { gamma, roadM, tripUs, lifetimes, share: Math.exp(-lifetimes) }
}

// ---- The ring (Bailey, Borer, Combley and others, Nature 268, 301, 1977; abstract read) ----
export const RING_GAMMA = 29.33
export const RING_MEASURED_TAU_PLUS_US = 64.419
export const RING_MEASURED_TAU_PLUS_GIVE_OR_TAKE_US = 0.058
export const RING_MEASURED_TAU_MINUS_US = 64.368
export const RING_MEASURED_TAU_MINUS_GIVE_OR_TAKE_US = 0.029
// The paper's own statement: the time-dilation factor agrees with experiment to a fractional error of 2 x 10^-3 at 95 percent confidence.
export const RING_PAPER_FRACTIONAL_LIMIT = 2e-3
// The paper's rest lifetime for mu-, found "assuming special relativity" (2.1948 +/- 0.0010 us); it differs from the PDG's.
export const RING_PAPER_REST_LIFETIME_MINUS_US = 2.1948
export const RING_PAPER_REST_LIFETIME_MINUS_GIVE_OR_TAKE_US = 0.001
export function ringBeta(): number {
  return betaFromGamma(RING_GAMMA)
}
// The lab's average lifetime for muons in the ring: gamma x the rest lifetime (about 64.44 us).
export function ringPredictedLifetimeUs(): number {
  return RING_GAMMA * REST_LIFETIME_US
}
// Measured minus predicted, in us, as a percent of the prediction, and in multiples of the measurement's give-or-take.
export function ringMeasuredMinusPredictedUs(measuredUs: number): number {
  return measuredUs - ringPredictedLifetimeUs()
}
export function ringMeasuredDifferencePercent(measuredUs: number): number {
  return (ringMeasuredMinusPredictedUs(measuredUs) / ringPredictedLifetimeUs()) * 100
}
export function ringDifferenceInGiveOrTakes(measuredUs: number, giveOrTakeUs: number): number {
  return ringMeasuredMinusPredictedUs(measuredUs) / giveOrTakeUs
}
// True when the measured lifetime lies within its own quoted give-or-take of the prediction.
export function ringWithinGiveOrTake(measuredUs: number, giveOrTakeUs: number): boolean {
  return Math.abs(ringMeasuredMinusPredictedUs(measuredUs)) <= giveOrTakeUs
}
// The lifetime the ring's muons would have if there were no slow clock: the rest value.
export function ringEverydayLifetimeUs(): number {
  return REST_LIFETIME_US
}
// The paper's rest lifetime for mu-, as a percent below the PDG's (the page's own comparison; the paper's abstract does not make it).
export function paperRestLifetimeMinusDifferencePercent(): number {
  return ((RING_PAPER_REST_LIFETIME_MINUS_US - REST_LIFETIME_US) / REST_LIFETIME_US) * 100
}

// ---- Frisch and Smith (Mount Washington and Cambridge, 1962; American Journal of Physics 31, 342, 1963) ----
// Figures from Wikipedia's account (the paper was not read): 1,917 m, muons at 0.995 c to 0.9954 c, 563 an hour on the mountain, 412 at sea level; 27 expected without dilation; a measured
// factor of 8.8 +/- 0.8; the predicted factor 10.2 at the top and 6.8 at the bottom, average 8.4 +/- 2 (the muons slow down on the way, which this model does not follow).
export const MOUNT_HEIGHT_M = 1917
export const MOUNT_BETA = 0.995
export const MOUNT_BETA_UPPER = 0.9954
export const MOUNT_COUNT_TOP_PER_HOUR = 563
export const MOUNT_COUNT_SEA_PER_HOUR = 412
export const MOUNT_COUNT_SEA_WITHOUT_DILATION_PER_HOUR = 27
export const MOUNT_MEASURED_FACTOR = 8.8
export const MOUNT_MEASURED_FACTOR_GIVE_OR_TAKE = 0.8
export const MOUNT_PREDICTED_FACTOR_TOP = 10.2
export const MOUNT_PREDICTED_FACTOR_BOTTOM = 6.8
export const MOUNT_PREDICTED_FACTOR_AVERAGE = 8.4
export const MOUNT_PREDICTED_FACTOR_AVERAGE_GIVE_OR_TAKE = 2
// The counted share at sea level (412 / 563).
export function mountCountedShare(): number {
  return MOUNT_COUNT_SEA_PER_HOUR / MOUNT_COUNT_TOP_PER_HOUR
}
// The share the source's own "27 expected without dilation" gives (27 / 563); it differs from this model's everyday share, which keeps one steady speed.
export function mountSourceEverydayShare(): number {
  return MOUNT_COUNT_SEA_WITHOUT_DILATION_PER_HOUR / MOUNT_COUNT_TOP_PER_HOUR
}
// The model's shares for the mountain trip.
export function mountModelEverydayShare(): number {
  return shareAliveEveryday(MOUNT_HEIGHT_M, MOUNT_BETA)
}
export function mountModelSlowClockShare(): number {
  return shareAliveSlowClock(MOUNT_HEIGHT_M, MOUNT_BETA)
}
// True when the paper's predicted average factor and measured factor overlap within their give-or-takes (as the source's account says they do): |8.8 - 8.4| <= 0.8 + 2.
export function mountFactorsOverlap(): boolean {
  return Math.abs(MOUNT_MEASURED_FACTOR - MOUNT_PREDICTED_FACTOR_AVERAGE) <= MOUNT_MEASURED_FACTOR_GIVE_OR_TAKE + MOUNT_PREDICTED_FACTOR_AVERAGE_GIVE_OR_TAKE
}

// Picture 3: the mountain fall described twice, with the numbers the drawing shows. The ground's clocks give the moving muon a longer lifetime and a longer road; the muon's own view gives the rest
// lifetime and a shorter road. Both give the same share alive. (The muon's view is imagined for the question: nobody can ride along with a muon.)
export function mountPictureThree() {
  const gamma = lorentzFactor(MOUNT_BETA)
  const ground = {
    roadM: MOUNT_HEIGHT_M,
    tripUs: flightTimeUs(MOUNT_HEIGHT_M, MOUNT_BETA),
    lifetimeUs: gamma * REST_LIFETIME_US,
    share: shareAliveSlowClock(MOUNT_HEIGHT_M, MOUNT_BETA),
  }
  const view = muonView(MOUNT_HEIGHT_M, MOUNT_BETA)
  const muon = { roadM: view.roadM, tripUs: view.tripUs, lifetimeUs: REST_LIFETIME_US, share: view.share }
  return { gamma, ground, muon }
}

// ---- The controls (trial values, specification: "Learner Controls") ----
export const SPEED_CHOICES: readonly { id: string; label: string; beta: number }[] = [
  { id: 'half', label: '0.5 c', beta: 0.5 },
  { id: 'point9', label: '0.9 c', beta: 0.9 },
  { id: 'mount', label: '0.995 c', beta: MOUNT_BETA },
  { id: 'ring', label: '0.99942 c (the ring)', beta: ringBeta() },
  { id: 'near', label: '0.99999 c', beta: 0.99999 },
]
// Heights in metres; 15 km is a typical birth height, not a measured one (specification, Open item b).
export const HEIGHT_CHOICES: readonly { id: string; label: string; heightM: number }[] = [
  { id: 'mount', label: '1.917 km (Mount Washington)', heightM: MOUNT_HEIGHT_M },
  { id: 'five', label: '5 km', heightM: 5000 },
  { id: 'ten', label: '10 km', heightM: 10000 },
  { id: 'fifteen', label: '15 km (a typical birth height)', heightM: 15000 },
]
export const PRESET_SPEED_ID = 'mount'
export const PRESET_HEIGHT_ID = 'mount'
// Drawing A: everything the page shows for a chosen speed and height.
export function trialTrip(beta: number, heightM: number) {
  const view = muonView(heightM, beta)
  return {
    beta,
    heightM,
    gamma: view.gamma,
    tripUs: flightTimeUs(heightM, beta),
    lifetimesGround: flightTimeInLifetimes(heightM, beta),
    everydayShare: shareAliveEveryday(heightM, beta),
    slowClockShare: shareAliveSlowClock(heightM, beta),
    muonRoadM: view.roadM,
    muonTripUs: view.tripUs,
    muonLifetimes: view.lifetimes,
    muonShare: view.share,
    slowClockLifetimeUs: view.gamma * REST_LIFETIME_US,
  }
}

// ---- Answers to the predictions ----
export function nearestChoice<T>(choices: readonly T[], value: number, valueOf: (c: T) => number): T {
  let best = choices[0]
  for (const c of choices) if (Math.abs(valueOf(c) - value) < Math.abs(valueOf(best) - value)) best = c
  return best
}

// Prediction 1: out of every 100 muons that pass the mountain top, about how many are alive at sea level? Five buttons, a count out of 100.
export const SHARE_ANSWER_CHOICES = [
  { id: 'about-5', label: 'About 5', value: 5 },
  { id: 'about-25', label: 'About 25', value: 25 },
  { id: 'about-50', label: 'About 50', value: 50 },
  { id: 'about-75', label: 'About 75', value: 75 },
  { id: 'about-95', label: 'About 95', value: 95 },
] as const
export type ShareAnswerId = (typeof SHARE_ANSWER_CHOICES)[number]['id']
export function predictionOneAnswerId(): ShareAnswerId {
  return nearestChoice(SHARE_ANSWER_CHOICES, mountModelSlowClockShare() * 100, (c) => c.value).id
}
// The count out of 100 the guess names, for the white mark on the share ruler.
export function shareGuessValue(id: string): number {
  const choice = SHARE_ANSWER_CHOICES.find((c) => c.id === id)
  if (!choice) throw new RangeError(`Unknown share guess: ${id}`)
  return choice.value
}

// Prediction 2: how long do muons in the ring last on average, by the lab's clocks? Five buttons, in us. The lifetimes are far apart, so the nearest button is found on a log scale.
export const LIFETIME_ANSWER_CHOICES = [
  { id: 'about-2', label: 'About 2.2 µs', valueUs: 2.2 },
  { id: 'about-7', label: 'About 7 µs', valueUs: 7 },
  { id: 'about-20', label: 'About 20 µs', valueUs: 20 },
  { id: 'about-65', label: 'About 65 µs', valueUs: 65 },
  { id: 'about-200', label: 'About 200 µs', valueUs: 200 },
] as const
export type LifetimeAnswerId = (typeof LIFETIME_ANSWER_CHOICES)[number]['id']
export function predictionTwoAnswerId(): LifetimeAnswerId {
  return nearestChoice(LIFETIME_ANSWER_CHOICES, Math.log(ringPredictedLifetimeUs()), (c) => Math.log(c.valueUs)).id
}
// The lifetime in us the guess names, for the white mark on the log ruler.
export function lifetimeGuessValueUs(id: string): number {
  const choice = LIFETIME_ANSWER_CHOICES.find((c) => c.id === id)
  if (!choice) throw new RangeError(`Unknown lifetime guess: ${id}`)
  return choice.valueUs
}

// ---- Comparison helpers for the results ----
// "the same", "more" or "less" for two numbers, with a small relative tolerance so that rounding is not read as a difference.
export const COMPARE_RELATIVE_TOLERANCE = 1e-9
export type Comparison = 'the same' | 'more' | 'less'
export function compare(value: number, reference: number): Comparison {
  const scale = Math.max(Math.abs(value), Math.abs(reference), Number.MIN_VALUE)
  if (Math.abs(value - reference) <= COMPARE_RELATIVE_TOLERANCE * scale) return 'the same'
  return value > reference ? 'more' : 'less'
}
// True when a measured number lies within its own give-or-take of a reference.
export function withinGiveOrTake(measured: number, reference: number, giveOrTake: number): boolean {
  return Math.abs(measured - reference) <= giveOrTake
}
