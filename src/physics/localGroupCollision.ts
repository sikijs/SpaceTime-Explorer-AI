// Frontier and Beyond Experiment 25: Will the Milky Way and Andromeda collide? The two-body orbit of the two galaxies as point masses: the fall time, the first pass and the sideways speed
// that decides it. Physics only: no React or browser code (CLAUDE.md §9). The model leaves out the Large Magellanic Cloud, M33, the size of the halos, dynamical friction and the expansion
// of the universe, and it does NOT compute a probability of a merger (the page gives the two studies' probabilities as published). Every formula is a standard two-body result,
// worked by hand and by a separate script on 2026-10-28 (to be checked at a source); the published numbers come from abstracts and summaries of two papers (to be checked at the papers).
import { SUN } from './fastestSpacecraft'

// ---- Units: distances in kiloparsecs (kpc), speeds in km/s, masses in Suns, times in billions of years (Gyr) ----
const KPC_KM = 3.0856775814913673e16 // km in a kiloparsec
const SECONDS_PER_GYR = 1e9 * 365.25 * 86400
// G in kpc (km/s)^2 per Sun: the Sun's GM (m^3/s^2) divided by the kiloparsec in metres and by 10^6 (m^2/s^2 to (km/s)^2).
export const G_KPC = SUN.gm / (KPC_KM * 1e3) / 1e6
// A speed in km/s expressed in kpc per Gyr (1 km/s is 1.0227 kpc/Gyr).
export const KPC_PER_GYR_PER_KM_S = SECONDS_PER_GYR / KPC_KM

function checkPositive(x: number, what: string): void {
  if (!Number.isFinite(x) || x <= 0) throw new RangeError(`${what} must be above zero.`)
}
function checkNonNegative(x: number, what: string): void {
  if (!Number.isFinite(x) || x < 0) throw new RangeError(`${what} must be zero or more.`)
}

// ---- The published numbers (through abstracts and summaries of the papers; to be checked at the papers) ----

// M31's distance modulus, 24.407 +/- 0.032 (both studies).
export const M31_DISTANCE_MODULUS = 24.407
export function distanceKpc(modulus: number = M31_DISTANCE_MODULUS): number {
  return 10 ** ((modulus + 5) / 5) / 1e3
}
// The speed at which M31 approaches the Milky Way, in km/s (the measured -301 km/s along our line of sight, corrected for the Sun's motion; "about 110" on Wikipedia, 109 in the 2012 literature).
export const APPROACH_SPEED_KM_S = 109
// The halo masses (M200) adopted by both studies, in Suns: Milky Way 1.0 +/- 0.2 and M31 1.3 +/- 0.4 times 10^12.
export const HALO_MASS_MILKY_WAY = 1.0e12
export const HALO_MASS_M31 = 1.3e12
export const TOTAL_MASS = HALO_MASS_MILKY_WAY + HALO_MASS_M31
// The two studies' sideways speeds of M31, in km/s, and the 2026 give-or-take. Which reference frame each is given in is NOT confirmed (a summary of the 2026 paper says heliocentric; the
// 2025 one was described as relative to the Milky Way); the model uses them as the sideways speed relative to the Milky Way.
export const SIDEWAYS_SPEED_2025_KM_S = 76
export const SIDEWAYS_SPEED_2026_KM_S = 46.7
export const SIDEWAYS_SPEED_2026_PLUS_MINUS_KM_S = 24.0
// Both studies call two galaxies merged when they come within this distance, in kpc.
export const MERGER_DISTANCE_KPC = 20
// Published merger probabilities and times (percent; billions of years). 2025: about 50 percent within 10 Gyr that there is NO merger (44, 63, 37 and 54 percent merged for the two-body,
// M33, LMC and four-body models); 2026: 90 percent merged, a median merger time of 6.5 (+1.3, -1.5) Gyr.
export const PUBLISHED_2025 = { mergerPercentWithin10Gyr: 50, twoBodyPercent: 44, withM33Percent: 63, withLmcPercent: 37, fourBodyPercent: 54, headOnPercentIn4To5Gyr: 2 } as const
export const PUBLISHED_2026 = { mergerPercent: 90, medianMergerTimeGyr: 6.5, medianPlusGyr: 1.3, medianMinusGyr: 1.5 } as const

// ---- The two-body orbit ----

export interface Orbit {
  massSolar: number
  sidewaysKmS: number
  approachKmS: number
  startKpc: number
  bound: boolean
  // The shape: the energy per unit mass ((km/s)^2), the angular momentum (kpc km/s), the eccentricity.
  energy: number
  angularMomentum: number
  eccentricity: number
  // The first pass: the closest distance in kpc and the time to it in Gyr (null if the orbit is not bound).
  firstPassKpc: number
  firstPassGyr: number | null
  // For a bound orbit with a sideways speed: the farthest point (kpc) and the period (Gyr); null for a straight fall or an unbound orbit.
  farthestKpc: number | null
  periodGyr: number | null
}

// The orbit of M31 about the Milky Way (as seen from the Milky Way) from the state now: the separation, the approach speed (towards the Milky Way) and the sideways speed, for a total mass.
export function orbit(massSolar: number, sidewaysKmS: number, approachKmS: number = APPROACH_SPEED_KM_S, startKpc: number = distanceKpc()): Orbit {
  checkPositive(massSolar, 'The mass')
  checkNonNegative(sidewaysKmS, 'The sideways speed')
  checkPositive(startKpc, 'The distance')
  if (!Number.isFinite(approachKmS) || approachKmS < 0) throw new RangeError('The approach speed must be zero or more.')
  const mu = G_KPC * massSolar
  const energy = (approachKmS ** 2 + sidewaysKmS ** 2) / 2 - mu / startKpc
  const L = startKpc * sidewaysKmS
  const base = { massSolar, sidewaysKmS, approachKmS, startKpc, energy, angularMomentum: L }
  if (energy >= 0) {
    // Not bound: there is a closest pass but the pair never returns; the time to it is not computed.
    const p = (L * L) / mu
    const e = Math.sqrt(1 + (2 * energy * L * L) / (mu * mu))
    return { ...base, bound: false, eccentricity: e, firstPassKpc: p / (1 + e), firstPassGyr: null, farthestKpc: null, periodGyr: null }
  }
  if (sidewaysKmS === 0) {
    // A straight fall: a degenerate ellipse of semi-major axis a. r = a (1 - cos u) and t = sqrt(a^3/mu) (u - sin u); the fall from r0 on the way in runs from u0 = 2 pi - acos(1 - r0/a) to 2 pi.
    const a = mu / (-2 * energy)
    const u0 = 2 * Math.PI - Math.acos(1 - startKpc / a)
    const t = Math.sqrt((a * a * a) / mu) * (2 * Math.PI - (u0 - Math.sin(u0)))
    return { ...base, bound: true, eccentricity: 1, firstPassKpc: 0, firstPassGyr: (t * KPC_KM) / SECONDS_PER_GYR, farthestKpc: null, periodGyr: null }
  }
  const p = (L * L) / mu
  const e = Math.sqrt(1 + (2 * energy * L * L) / (mu * mu))
  const a = p / (1 - e * e)
  // The time to the closest pass on the way in: the true anomaly nu0 at the start, the eccentric anomaly E0 and Kepler's equation M0 = E0 - e sin E0.
  const nu0 = Math.acos(Math.max(-1, Math.min(1, (p / startKpc - 1) / e)))
  const E0 = 2 * Math.atan(Math.sqrt((1 - e) / (1 + e)) * Math.tan(nu0 / 2))
  const M0 = E0 - e * Math.sin(E0)
  const tScale = Math.sqrt((a * a * a) / mu)
  return {
    ...base,
    bound: true,
    eccentricity: e,
    firstPassKpc: p / (1 + e),
    firstPassGyr: (tScale * M0 * KPC_KM) / SECONDS_PER_GYR,
    farthestKpc: a * (1 + e),
    periodGyr: (2 * Math.PI * tScale * KPC_KM) / SECONDS_PER_GYR,
  }
}

// The time for a straight fall with no sideways motion, and the time if the approach speed stayed the same (distance divided by speed), in Gyr.
export function straightFallGyr(massSolar: number = TOTAL_MASS): number {
  return orbit(massSolar, 0).firstPassGyr as number
}
export function constantSpeedGyr(approachKmS: number = APPROACH_SPEED_KM_S, startKpc: number = distanceKpc()): number {
  checkPositive(approachKmS, 'The approach speed')
  return (startKpc * KPC_KM) / approachKmS / SECONDS_PER_GYR
}

// The sideways speed above which the pair is not bound: sqrt(2 mu / r0 - v_r^2).
export function unboundSidewaysKmS(massSolar: number = TOTAL_MASS, approachKmS: number = APPROACH_SPEED_KM_S, startKpc: number = distanceKpc()): number {
  const v2 = (2 * G_KPC * massSolar) / startKpc - approachKmS ** 2
  return v2 > 0 ? Math.sqrt(v2) : 0
}

// The sideways speed that gives a first pass of a given distance (bisection; the first pass rises with the sideways speed up to the unbound speed).
export function sidewaysForFirstPass(targetKpc: number, massSolar: number = TOTAL_MASS): number {
  checkPositive(targetKpc, 'The distance')
  let lo = 0
  let hi = unboundSidewaysKmS(massSolar)
  for (let i = 0; i < 80; i++) {
    const mid = (lo + hi) / 2
    if (orbit(massSolar, mid).firstPassKpc < targetKpc) lo = mid
    else hi = mid
  }
  return (lo + hi) / 2
}

// ---- The predictions ----

export function nearestOnLogScale<T>(choices: readonly T[], value: number, valueOf: (c: T) => number): T {
  let best = choices[0]
  for (const c of choices) {
    if (Math.abs(Math.log(valueOf(c)) - Math.log(value)) < Math.abs(Math.log(valueOf(best)) - Math.log(value))) best = c
  }
  return best
}

// Prediction 1: the time of a straight fall, in billions of years.
export const FALL_CHOICES = [
  { id: 'f1', label: 'about 1 billion years', gyr: 1 },
  { id: 'f2', label: 'about 2 billion years', gyr: 2 },
  { id: 'f4', label: 'about 4 billion years', gyr: 4 },
  { id: 'f7', label: 'about 7 billion years', gyr: 7 },
  { id: 'f14', label: 'about 14 billion years', gyr: 14 },
] as const
export type FallChoiceId = (typeof FALL_CHOICES)[number]['id']

export function fallAnswer(): FallChoiceId {
  return nearestOnLogScale(FALL_CHOICES, straightFallGyr(), (c) => c.gyr).id
}
export function fallChoiceGyr(id: FallChoiceId): number {
  return FALL_CHOICES.find((c) => c.id === id)!.gyr
}
// The tutor's mark (§12, §13): used in the explanation only.
export function fallGuessResult(id: FallChoiceId): 'matched' | 'not matched' {
  return id === fallAnswer() ? 'matched' : 'not matched'
}
export function fallGuessMarker(id: FallChoiceId): { gyr: number } {
  return { gyr: fallChoiceGyr(id) }
}

// Prediction 2: the first-pass distance for the 2026 sideways speed, in kiloparsecs.
export const PASS_CHOICES = [
  { id: 'p7', label: 'about 7 kiloparsecs', kpc: 7 },
  { id: 'p20', label: 'about 20 kiloparsecs', kpc: 20 },
  { id: 'p70', label: 'about 70 kiloparsecs', kpc: 70 },
  { id: 'p250', label: 'about 250 kiloparsecs', kpc: 250 },
  { id: 'p900', label: 'about 900 kiloparsecs', kpc: 900 },
] as const
export type PassChoiceId = (typeof PASS_CHOICES)[number]['id']

export function passAnswer(): PassChoiceId {
  return nearestOnLogScale(PASS_CHOICES, orbit(TOTAL_MASS, SIDEWAYS_SPEED_2026_KM_S).firstPassKpc, (c) => c.kpc).id
}
export function passChoiceKpc(id: PassChoiceId): number {
  return PASS_CHOICES.find((c) => c.id === id)!.kpc
}
export function passGuessResult(id: PassChoiceId): 'matched' | 'not matched' {
  return id === passAnswer() ? 'matched' : 'not matched'
}
export function passGuessMarker(id: PassChoiceId): { kpc: number } {
  return { kpc: passChoiceKpc(id) }
}

// ---- Trial values (the controls, Step 5) ----
export const TRIAL_SIDEWAYS_KM_S = [0, 23, 47, 76, 100] as const
export const TRIAL_MASSES_SOLAR = [1.8e12, 2.3e12, 2.8e12] as const
