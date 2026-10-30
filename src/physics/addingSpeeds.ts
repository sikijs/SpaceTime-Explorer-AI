// Evidence and Imagination, Experiment 3: Can speeds simply be added? The rule for combining two speeds along one line (special relativity), the everyday sum beside it, light in moving
// water (Fizeau 1851, von Laue 1907) and the CERN test of 1964 (gamma rays from pions moving at 0.99975 c). Physics only: no React or browser code (CLAUDE.md §9). It imports nothing.
// Units: speeds as a fraction of c (c = 1) unless a name says otherwise. One dimension, one direction (the specification's Decision 4); no derivation and no rapidity.
// Sources and what is unchecked (specification, "Sources"): the 1964 figures are from machine-read text of a scanned paper and must be checked against its page images; the refractive index
// of water and Fizeau's measured coefficient have no source read yet; the rule itself is checked only against a summary, to be checked at a textbook.

function checkSpeed(x: number, what: string): void {
  if (!Number.isFinite(x) || x < 0 || x > 1) throw new RangeError(`${what} must satisfy 0 <= speed <= c.`)
}

// ---- The rule and the everyday sum ----
// A ship moves at a (a fraction of c) relative to the lab and fires a probe forward at b relative to the ship: the lab sees (a + b) / (1 + a b).
export function combineSpeeds(a: number, b: number): number {
  checkSpeed(a, 'The ship speed')
  checkSpeed(b, 'The probe speed')
  return (a + b) / (1 + a * b)
}
// The everyday sum, which can pass 1 (the page draws it as a bar beyond the wall at c).
export function everydaySum(a: number, b: number): number {
  checkSpeed(a, 'The ship speed')
  checkSpeed(b, 'The probe speed')
  return a + b
}
// How much the everyday sum overshoots the rule's result.
export function gapFromEveryday(a: number, b: number): number {
  return everydaySum(a, b) - combineSpeeds(a, b)
}
// The speed of the probe relative to the ship, from the lab's speed for the ship (a) and for the probe (u): (u - a) / (1 - u a). It undoes `combineSpeeds`.
export function relativeSpeed(u: number, a: number): number {
  checkSpeed(u, 'The probe speed in the lab')
  checkSpeed(a, 'The ship speed')
  if (u === 1 && a === 1) throw new RangeError('The relative speed of two things both at c is not defined here.')
  return (u - a) / (1 - u * a)
}

// ---- The scenario of Prediction 1 (the controls change these as trial values) ----
export const PRESET_SHIP_SPEED = 0.5
export const PRESET_PROBE_SPEED = 0.5
export const SHIP_SPEED_CHOICES: readonly number[] = [0.1, 0.5, 0.9, 0.99]
export const PROBE_SPEED_CHOICES: readonly number[] = [0.1, 0.5, 0.9, 1]

// ---- Light in moving water (Fizeau 1851; von Laue 1907) ----
// Light travels at 1 / n (in units of c) in still water of refractive index n. In water moving at v (a fraction of c) in the same direction as the light, the rule gives (1/n + v) / (1 + v/n).
export function lightSpeedInMovingMedium(n: number, v: number): number {
  if (!Number.isFinite(n) || n < 1) throw new RangeError('The refractive index must be at least 1.')
  checkSpeed(v, 'The medium speed')
  return combineSpeeds(1 / n, v)
}
// The drag coefficient for small v: 1 - 1/n^2 (Fresnel's coefficient, which the rule reproduces). The everyday sum would give 1.
export function fresnelDragCoefficient(n: number): number {
  if (!Number.isFinite(n) || n < 1) throw new RangeError('The refractive index must be at least 1.')
  return 1 - 1 / (n * n)
}
// The coefficient the exact rule gives at a given v: (speed in moving water - speed in still water) / v. It approaches the Fresnel coefficient as v shrinks.
export function exactDragCoefficient(n: number, v: number): number {
  if (!Number.isFinite(v) || v <= 0) throw new RangeError('The medium speed must be above zero.')
  return (lightSpeedInMovingMedium(n, v) - 1 / n) / v
}
export const WATER_REFRACTIVE_INDEX = 1.33 // NOT YET SOURCED (specification, Sources): to be found at an official page before the page states it.

// ---- The CERN test of 1964 (Alväger, Farley, Kjellman and Wallin) ----
// Neutral pions of energy above 6 GeV, moving at 0.99975 c "according to special relativity", decayed into gamma rays; the gamma rays' speed was timed over 31.450 m.
// Figures from machine-read text of a scanned PDF: TO BE CHECKED against the page images.
export const PION_SOURCE_SPEED = 0.99975
export const LIGHT_SPEED_CM_PER_S = 2.9979e10
export const MEASURED_GAMMA_SPEED_CM_PER_S = 2.9977e10
export const MEASURED_GAMMA_SPEED_GIVE_OR_TAKE_CM_PER_S = 0.0004e10
// The paper's own k in c' = c + k v: (-3 +/- 13) x 10^-5. Quoted as the paper gives it (a value worked out from the rounded speeds differs: specification, Open item c).
export const PAPER_K = -3e-5
export const PAPER_K_GIVE_OR_TAKE = 13e-5

// What the everyday sum would give for a flash fired forward from the pions (1.99975 c) and what the rule gives (exactly c).
export function pionFlashEveryday(): number {
  return everydaySum(PION_SOURCE_SPEED, 1)
}
export function pionFlashRule(): number {
  return combineSpeeds(PION_SOURCE_SPEED, 1)
}
// The measured speed as a share of c, and its give-or-take as a share of c.
export function measuredShareOfLightSpeed(): number {
  return MEASURED_GAMMA_SPEED_CM_PER_S / LIGHT_SPEED_CM_PER_S
}
export function measuredGiveOrTakeShare(): number {
  return MEASURED_GAMMA_SPEED_GIVE_OR_TAKE_CM_PER_S / LIGHT_SPEED_CM_PER_S
}
// True when the measured speed differs from c by no more than its quoted give-or-take.
export function measuredAgreesWithLightSpeed(): boolean {
  return Math.abs(MEASURED_GAMMA_SPEED_CM_PER_S - LIGHT_SPEED_CM_PER_S) <= MEASURED_GAMMA_SPEED_GIVE_OR_TAKE_CM_PER_S
}
// How far the everyday sum is from what was measured, in multiples of the measurement's give-or-take.
export function everydayMissInGiveOrTakes(): number {
  return (pionFlashEveryday() - measuredShareOfLightSpeed()) / measuredGiveOrTakeShare()
}

// ---- Answers to the predictions ----
export function nearestChoice<T>(choices: readonly T[], value: number, valueOf: (c: T) => number): T {
  let best = choices[0]
  for (const c of choices) if (Math.abs(valueOf(c) - value) < Math.abs(valueOf(best) - value)) best = c
  return best
}

// Prediction 1: how fast does the lab see the probe? Five buttons, in units of c.
export const SPEED_ANSWER_CHOICES = [
  { id: 'one', label: '1.0 c', value: 1.0 },
  { id: 'point9', label: '0.9 c', value: 0.9 },
  { id: 'point8', label: '0.8 c', value: 0.8 },
  { id: 'point7', label: '0.7 c', value: 0.7 },
  { id: 'point5', label: '0.5 c', value: 0.5 },
] as const
export type SpeedAnswerId = (typeof SPEED_ANSWER_CHOICES)[number]['id']
export function predictionOneAnswerId(): SpeedAnswerId {
  return nearestChoice(SPEED_ANSWER_CHOICES, combineSpeeds(PRESET_SHIP_SPEED, PRESET_PROBE_SPEED), (c) => c.value).id
}

// Prediction 2: how fast does the lab measure a flash sent forward from a source at 0.99975 c? Four buttons. "Less than c" has no value of its own, so the page draws a marker (the value is for the marker only).
export const FLASH_ANSWER_CHOICES = [
  { id: 'about-2c', label: 'About 2 c', value: 2 },
  { id: 'about-1.5c', label: 'About 1.5 c', value: 1.5 },
  { id: 'about-c', label: 'About c', value: 1 },
  { id: 'less-than-c', label: 'Less than c', value: 0.5 },
] as const
export type FlashAnswerId = (typeof FLASH_ANSWER_CHOICES)[number]['id']
export function predictionTwoAnswerId(): FlashAnswerId {
  return nearestChoice(FLASH_ANSWER_CHOICES, pionFlashRule(), (c) => c.value).id
}
