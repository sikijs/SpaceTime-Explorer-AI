// Evidence and Imagination, Experiment 7: Is the microwave sky equally warm in every direction? (the microwave dipole)
// See docs/experiments/evidence-and-imagination/07-the-microwave-dipole.md, "Physics Model".
// Physics only: no React or browser code (CLAUDE.md §9). It imports Spacetime Geometry 8's tested Doppler factor (Decision 3, default) and Frontier 11's Earth constants (Decision 8).
// Units: speeds in km/s (a fraction of c is written beta), temperatures in kelvin, angles in degrees measured from the direction of travel (0 ahead, 90 sideways, 180 behind).
// THE MODEL (specification): an observer moving at speed v through a sea of microwave light that is the same in every direction, at T0, in its own frame, measures
//   T(theta) = T0 * D / (1 - beta cos theta),   D = sqrt(1 - beta^2)        (Colloquium paper, Eq. 13; the same as T0 times Experiment 8's frequency factor)
//   dipole amplitude (first order) A = beta * T0,   so   v = c * A / T0.
// The quasar half is QUOTED, not calculated: the page does not compute the expected count dipole, because the count slope x is not in the text that was read (Decision 5).

import { frequencyFactorFromTravelerAngle } from './dopplerShift'
import { EARTH } from './fastestSpacecraft'

// ---- Constants ----
export const SPEED_OF_LIGHT_KM_S = 299_792.458 // exact, by the definition of the metre
// Colloquium paper (Secrest and others, arXiv:2505.23526 v2), read verbatim: T0 = 2.72548 +/- 0.00057 K and Planck's 369.82 +/- 0.11 km/s.
export const MICROWAVE_TEMPERATURE_K = 2.72548
export const MICROWAVE_TEMPERATURE_GIVE_OR_TAKE_K = 0.00057
export interface Measurement {
  value: number
  giveOrTake: number
}
export const PUBLISHED_SPEED_KM_S: Measurement = { value: 369.82, giveOrTake: 0.11 }
// NASA LAMBDA, "CMB Solar Dipole Amplitude and Direction" (read 2026-11-02, no date shown): Planck HFI 2020, 3362.08 +/- 0.64 uK toward l = 264.02, b = 48.253 (Galactic). The page's later row
// (SRoll2.2 HFI 2021) gives 3361.90 +/- 0.36 uK. b = 48.253 also in Secrest and others 2021; the Colloquium text gives 48.243 (a typo in one; 48.253 is used, specification Open item c).
export const PLANCK_DIPOLE_AMPLITUDE_UK: Measurement = { value: 3362.08, giveOrTake: 0.64 }
export const SROLL_DIPOLE_AMPLITUDE_UK: Measurement = { value: 3361.9, giveOrTake: 0.36 }
export const DIPOLE_DIRECTION_GALACTIC = { l: 264.02, b: 48.253 }
// Earth's mean orbital speed round the Sun, from Frontier 11's module (no source read for this page, Decision 8).
export const EARTH_ORBITAL_SPEED_KM_S = EARTH.orbitalSpeed / 1000

// The Celsius scale starts 273.15 degrees below the kelvin scale's zero (the definition of the two scales); used only to say what 2.725 K is in everyday terms.
export const ABSOLUTE_ZERO_CELSIUS = -273.15
export function celsiusOfKelvin(kelvin: number): number {
  return kelvin + ABSOLUTE_ZERO_CELSIUS
}

// ---- Controls (trial values) ----
export const SPEED_CHOICES_KM_S = [30, 370, 1000, 3000, 30000] as const
export type SpeedChoice = (typeof SPEED_CHOICES_KM_S)[number]
// The measured motion is the published 369.82 km/s; the button reads "370 km/s".
export const MEASURED_SPEED_CHOICE: SpeedChoice = 370
export const ANGLE_CHOICES_DEGREES = [0, 45, 90, 135, 180] as const
export type AngleChoice = (typeof ANGLE_CHOICES_DEGREES)[number]
// The real settings: the measured speed (369.82 km/s, not the rounded button) looking straight ahead.
export function speedForChoice(choice: number): number {
  return choice === MEASURED_SPEED_CHOICE ? PUBLISHED_SPEED_KM_S.value : choice
}

// ---- The model ----
function assertSpeed(speedKmS: number): void {
  if (!(Number.isFinite(speedKmS) && speedKmS >= 0 && speedKmS < SPEED_OF_LIGHT_KM_S)) {
    throw new RangeError(`the observer's speed must be from 0 up to, but not including, c, got ${speedKmS} km/s`)
  }
}

export function betaOf(speedKmS: number): number {
  assertSpeed(speedKmS)
  return speedKmS / SPEED_OF_LIGHT_KM_S
}

// T(theta) = T0 * D / (1 - beta cos theta): T0 times Experiment 8's factor written with the observer's own angle.
export function temperatureAtAngle(angleDegrees: number, speedKmS: number, averageK: number = MICROWAVE_TEMPERATURE_K): number {
  return averageK * frequencyFactorFromTravelerAngle(angleDegrees, betaOf(speedKmS))
}

export interface Dipole {
  speedKmS: number
  beta: number
  averageK: number
  aheadK: number
  behindK: number
  sidewaysK: number
  aheadMinusBehindK: number
  aheadWarmerThanAverageK: number
  behindCoolerThanAverageK: number
  firstOrderAmplitudeK: number
}

export function dipole(speedKmS: number): Dipole {
  const beta = betaOf(speedKmS)
  const ahead = temperatureAtAngle(0, speedKmS)
  const behind = temperatureAtAngle(180, speedKmS)
  return {
    speedKmS,
    beta,
    averageK: MICROWAVE_TEMPERATURE_K,
    aheadK: ahead,
    behindK: behind,
    sidewaysK: temperatureAtAngle(90, speedKmS),
    aheadMinusBehindK: ahead - behind,
    aheadWarmerThanAverageK: ahead - MICROWAVE_TEMPERATURE_K,
    behindCoolerThanAverageK: MICROWAVE_TEMPERATURE_K - behind,
    firstOrderAmplitudeK: firstOrderAmplitudeK(speedKmS),
  }
}

// The published amplitude is the first-order term, beta * T0 (Colloquium Eq. 14).
export function firstOrderAmplitudeK(speedKmS: number): number {
  return betaOf(speedKmS) * MICROWAVE_TEMPERATURE_K
}

// v = c * A / T0, with the amplitude in microkelvin.
export function speedFromAmplitudeKmS(amplitudeMicrokelvin: number): number {
  return (SPEED_OF_LIGHT_KM_S * (amplitudeMicrokelvin * 1e-6)) / MICROWAVE_TEMPERATURE_K
}

// ---- Quasar figures, QUOTED (specification Sources) ----
// Secrest and others 2021 (arXiv:2009.14826, ApJ Letters 908, L51): abstract verbatim; the amplitudes read through a converted web copy (ar5iv), which may not be the final version.
export const QUASAR_COUNT = 1_355_352
export const QUASAR_OBSERVED_AMPLITUDE = 0.01554 // no give-or-take is given in the text read
export const QUASAR_EXPECTED_AMPLITUDE = 0.007 // "~0.007", rounded by the paper (depends on x and the spectral index, which the page does not compute)
export const QUASAR_DIRECTION_GALACTIC = { l: 238.2, b: 28.8 }
export const QUASAR_OFFSET_DEGREES = 27.8 // from the microwave dipole's direction, as the paper states
// The significance, as each source states it: sigma.
export const QUASAR_SIGNIFICANCE = {
  secrest2021: 4.9, // abstract: p = 5e-7, "one-sided"
  bashir2026: [3.63, 3.44, 3.27], // abstract of arXiv:2511.00822 v2 (26 Apr 2026): no clustering dipole, a random one, an aligned one
  secrest2025AtLeast: 5, // the review's abstract: "now exceeds 5 sigma"
} as const

// How many times larger the observed quasar dipole is than the quoted expectation (not rounded; the paper says "over twice").
export function quasarObservedOverExpected(): number {
  return QUASAR_OBSERVED_AMPLITUDE / QUASAR_EXPECTED_AMPLITUDE
}

// ---- Comparing ----
export type Comparison = 'the same' | 'more' | 'less'
export const COMPARE_RELATIVE_TOLERANCE = 1e-9
export function compare(value: number, reference: number): Comparison {
  const scale = Math.max(Math.abs(value), Math.abs(reference), Number.MIN_VALUE)
  if (Math.abs(value - reference) <= COMPARE_RELATIVE_TOLERANCE * scale) return 'the same'
  return value > reference ? 'more' : 'less'
}
// Is a value inside a published give-or-take of a reference (the reference's own give-or-take, taken alone)?
export function insideGiveOrTake(value: number, reference: Measurement): boolean {
  return Math.abs(value - reference.value) <= reference.giveOrTake
}

// ---- The predictions' answers and buttons ----
// Prediction 1: how much cooler the sky straight behind is than straight ahead, in kelvin, on a log ruler.
export const DIFFERENCE_ANSWER_CHOICES = [
  { id: 'about-0.00007', label: 'About 0.00007 K', kelvin: 0.00007 },
  { id: 'about-0.0007', label: 'About 0.0007 K', kelvin: 0.0007 },
  { id: 'about-0.007', label: 'About 0.007 K', kelvin: 0.007 },
  { id: 'about-0.07', label: 'About 0.07 K', kelvin: 0.07 },
  { id: 'about-0.7', label: 'About 0.7 K', kelvin: 0.7 },
] as const
export type DifferenceAnswerId = (typeof DIFFERENCE_ANSWER_CHOICES)[number]['id']
// Prediction 2: how fast the Solar System moves relative to the microwave glow, in km/s, on a log ruler.
export const SPEED_ANSWER_CHOICES = [
  { id: 'about-3', label: 'About 3 km/s', kmS: 3 },
  { id: 'about-30', label: 'About 30 km/s', kmS: 30 },
  { id: 'about-300', label: 'About 300 km/s', kmS: 300 },
  { id: 'about-3000', label: 'About 3,000 km/s', kmS: 3000 },
  { id: 'about-30000', label: 'About 30,000 km/s', kmS: 30000 },
] as const
export type SpeedAnswerId = (typeof SPEED_ANSWER_CHOICES)[number]['id']

function nearest<T extends { id: string }>(choices: readonly T[], target: number, position: (c: T) => number): T {
  let best = choices[0]
  for (const c of choices) if (Math.abs(position(c) - target) < Math.abs(position(best) - target)) best = c
  return best
}

// Both predictions span several powers of ten, so the nearest button is found on a log scale.
export function differenceAnswerIdFor(kelvin: number): DifferenceAnswerId {
  return nearest(DIFFERENCE_ANSWER_CHOICES, Math.log(kelvin), (c) => Math.log(c.kelvin)).id
}
export function speedAnswerIdFor(kmS: number): SpeedAnswerId {
  return nearest(SPEED_ANSWER_CHOICES, Math.log(kmS), (c) => Math.log(c.kmS)).id
}

// The answers come from the real (measured) motion, never from a trial value or a guess.
export function predictionOneAnswerId(): DifferenceAnswerId {
  return differenceAnswerIdFor(dipole(PUBLISHED_SPEED_KM_S.value).aheadMinusBehindK)
}
export function predictionTwoAnswerId(): SpeedAnswerId {
  return speedAnswerIdFor(PUBLISHED_SPEED_KM_S.value)
}

// The value a guess stands for (to draw its white mark on the real ruler).
export function differenceGuessKelvin(id: string): number {
  const choice = DIFFERENCE_ANSWER_CHOICES.find((c) => c.id === id)
  if (!choice) throw new RangeError(`unknown answer for the temperature difference: ${id}`)
  return choice.kelvin
}
export function speedGuessKmS(id: string): number {
  const choice = SPEED_ANSWER_CHOICES.find((c) => c.id === id)
  if (!choice) throw new RangeError(`unknown answer for the speed: ${id}`)
  return choice.kmS
}
