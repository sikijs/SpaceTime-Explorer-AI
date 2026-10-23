// Frontier and Beyond, Experiment 14: what makes a white dwarf explode? (the double-detonation remnant SNR 0509-67.5)
// See docs/experiments/frontier-and-beyond/14-what-makes-a-white-dwarf-explode.md, "Physics Model".
//
// No new physics. Four small calculations: (1) a white dwarf's size and its distance from the Chandrasekhar limit (the formula and the limit are Black Holes 9's, imported);
// (2) the mass of the double-detonation white dwarf, a carbon-oxygen core plus a helium shell; (3) a shell's average speed, radius / age, and the gap between the two calcium shells;
// (4) the distance error that follows from a brightness difference, by the inverse-square law. It does not simulate either explosion, does not compute the nickel made or the
// brightness, and does not decide between the double detonation and another reading of the remnant. This module imports only the Black Holes 9 module.

import { CHANDRASEKHAR_LIMIT_SOLAR_MASSES, whiteDwarfRadiusKm } from './blackHoleFormationExperiment'

export { CHANDRASEKHAR_LIMIT_SOLAR_MASSES, whiteDwarfRadiusKm }

// ---- Constants ----

export const EARTH_RADIUS_KM = 6371
export const KM_PER_PARSEC = 3.0856775814913673e13
export const LIGHT_YEARS_PER_PARSEC = 3.26156
export const SECONDS_PER_YEAR = 365.25 * 24 * 3600
export const SPEED_OF_LIGHT_KM_S = 299792.458

// The published data. The two calcium shells and the remnant's age: Das and others (2025), Nature Astronomy, "1.73 +/- 0.07 pc and 2.06 +/- 0.07 pc" and "~300-350 yr".
// The matching simulation (model M10_03): a carbon-oxygen core of 1.028 and a helium shell of 0.027 solar masses. The 2026 analysis (Mandal and others, ApJ): a core of about
// 1 and a shell of more than 0.05 solar masses. Read through a summarising fetch and abstracts on 2026-10-23.
export const WHITE_DWARF_EXPLOSION = {
  simulationCoreSolar: 1.028,
  simulationShellSolar: 0.027,
  analysis2026CoreSolar: 1.0,
  analysis2026ShellAboveSolar: 0.05,
  innerShellPc: 1.73,
  outerShellPc: 2.06,
  shellUncertaintyPc: 0.07,
  ageRangeYears: [300, 350] as const,
  defaultAgeYears: 325,
  massChoicesSolar: [0.6, 1.0, 1.055, 1.2, 1.4] as const,
  ageChoicesYears: [300, 325, 350] as const,
  brightnessChoices: [-0.3, -0.2, -0.1, 0, 0.1] as const, // the fractional change in true brightness (-0.2 is 20 percent dimmer)
  pictureMassesSolar: [0.6, 1.0, 1.2, 1.4] as const, // the white dwarfs drawn in Picture 1 (the masses of the controls, without the simulation's)
  pictureBrightnessChanges: [-0.1, -0.2, -0.3] as const, // the changes drawn in the strip of Picture 3
}

function requirePositive(value: number, what: string): void {
  if (!Number.isFinite(value) || value <= 0) throw new RangeError(`${what} must be positive`)
}

// ---- A white dwarf and its limit ----

// The size in Earth radii.
export function earthRadii(radiusKm: number): number {
  requirePositive(radiusKm, 'The radius')
  return radiusKm / EARTH_RADIUS_KM
}
// How far below the limit (1.44 solar masses) a white dwarf of this mass is, and what fraction of the limit it is. A mass at or above the limit is not a white dwarf.
export function gapBelowLimit(massSolar: number): number {
  requirePositive(massSolar, 'The mass')
  if (massSolar >= CHANDRASEKHAR_LIMIT_SOLAR_MASSES) throw new RangeError('A white dwarf must have less than 1.44 solar masses.')
  return CHANDRASEKHAR_LIMIT_SOLAR_MASSES - massSolar
}
export function fractionOfLimit(massSolar: number): number {
  gapBelowLimit(massSolar)
  return massSolar / CHANDRASEKHAR_LIMIT_SOLAR_MASSES
}

// ---- The double-detonation white dwarf ----

// The total mass of a carbon-oxygen core and a helium shell, in solar masses.
export function doubleDetonationMass(coreSolar: number, shellSolar: number): number {
  requirePositive(coreSolar, 'The core mass')
  requirePositive(shellSolar, 'The shell mass')
  return coreSolar + shellSolar
}

// ---- The two calcium shells ----

// A shell's average speed since the explosion: its radius in parsecs divided by the remnant's age in years, in km/s. It is an average: the gas has slowed since the explosion.
export function shellSpeedKmS(radiusPc: number, ageYears: number): number {
  requirePositive(radiusPc, 'The radius')
  requirePositive(ageYears, 'The age')
  return (radiusPc * KM_PER_PARSEC) / (ageYears * SECONDS_PER_YEAR)
}
// The gap between two shells in parsecs and in light-years.
export function shellGap(innerPc: number, outerPc: number): { pc: number; lightYears: number } {
  requirePositive(innerPc, 'The inner radius')
  requirePositive(outerPc, 'The outer radius')
  if (outerPc <= innerPc) throw new RangeError('The outer shell must be farther out than the inner one')
  const pc = outerPc - innerPc
  return { pc, lightYears: pc * LIGHT_YEARS_PER_PARSEC }
}
// The gap as a multiple of the measurements' combined give-or-take (the two radii's give-or-takes added in quadrature).
export function shellSeparationInUncertainties(innerPc: number, outerPc: number, uncertaintyPc: number): number {
  requirePositive(uncertaintyPc, 'The give-or-take')
  return shellGap(innerPc, outerPc).pc / (uncertaintyPc * Math.SQRT2)
}
// How far light travels in a year-count, in light-years per year, as a fraction of the speed of light: a speed in km/s as a fraction of c.
export function fractionOfLightSpeed(speedKmS: number): number {
  requirePositive(speedKmS, 'The speed')
  return speedKmS / SPEED_OF_LIGHT_KM_S
}

// The numbers of the worked examples, so that the interface only displays them. The shell: the radius in kilometres, the age in seconds, and the speed. The brightness: the
// brightness as a fraction of the assumed, its square root, and the factor and percentage by which the distance is off.
export function shellSpeedWorkedExample(radiusPc: number, ageYears: number): { radiusKm: number; ageSeconds: number; speedKmS: number; fractionOfLight: number } {
  const speedKmS = shellSpeedKmS(radiusPc, ageYears)
  return { radiusKm: radiusPc * KM_PER_PARSEC, ageSeconds: ageYears * SECONDS_PER_YEAR, speedKmS, fractionOfLight: fractionOfLightSpeed(speedKmS) }
}
export function distanceErrorWorkedExample(brightnessChange: number): { brightnessFraction: number; squareRoot: number; distanceFactor: number; percent: number } {
  const percent = distanceErrorPercent(brightnessChange)
  const brightnessFraction = 1 + brightnessChange
  return { brightnessFraction, squareRoot: Math.sqrt(brightnessFraction), distanceFactor: 1 / Math.sqrt(brightnessFraction), percent }
}

// ---- Why it matters: a brightness difference and a distance ----

// If a supernova's true brightness is (1 + change) times the brightness assumed, a distance worked out from the assumed brightness is off by 1 / sqrt(1 + change) (flux = L / 4 pi d^2),
// as a percentage of the true distance: positive when the distance comes out too large (the supernova was dimmer than assumed). A change of -1 (no light at all) or less is refused.
export function distanceErrorPercent(brightnessChange: number): number {
  if (!Number.isFinite(brightnessChange) || brightnessChange <= -1) throw new RangeError('The brightness change must be more than -100 percent')
  return (1 / Math.sqrt(1 + brightnessChange) - 1) * 100
}

// ---- The predictions' answers ----

// The nearest button on a plain scale, and on a scale of powers of ten.
export function nearestPlain<T extends { value: number }>(answers: T[], truth: number): T {
  let best = answers[0]
  for (const a of answers) if (Math.abs(a.value - truth) < Math.abs(best.value - truth)) best = a
  return best
}
export function nearestLog<T extends { value: number }>(answers: T[], truth: number): T {
  let best = answers[0]
  for (const a of answers) if (Math.abs(Math.log10(a.value) - Math.log10(truth)) < Math.abs(Math.log10(best.value) - Math.log10(truth))) best = a
  return best
}

// Prediction 1: how heavy was the white dwarf? The three buttons, in solar masses.
export type SizeAnswer = 'about 0.5 Suns' | 'about 1.0 Sun' | 'about 1.4 Suns'
export const SIZE_ANSWERS: { label: SizeAnswer; value: number }[] = [
  { label: 'about 0.5 Suns', value: 0.5 },
  { label: 'about 1.0 Sun', value: 1.0 },
  { label: 'about 1.4 Suns', value: 1.4 },
]
export function sizeAnswer(): SizeAnswer {
  const mass = doubleDetonationMass(WHITE_DWARF_EXPLOSION.simulationCoreSolar, WHITE_DWARF_EXPLOSION.simulationShellSolar)
  return nearestPlain(SIZE_ANSWERS, mass).label
}

// Prediction 2: how fast has the outer shell moved on average? The three buttons, in km/s.
export type SpeedAnswer = 'about 50 km/s' | 'about 5,000 km/s' | 'about 300,000 km/s'
export const SPEED_ANSWERS: { label: SpeedAnswer; value: number }[] = [
  { label: 'about 50 km/s', value: 50 },
  { label: 'about 5,000 km/s', value: 5000 },
  { label: 'about 300,000 km/s', value: 300000 },
]
export function speedAnswer(ageYears: number = WHITE_DWARF_EXPLOSION.defaultAgeYears): SpeedAnswer {
  return nearestLog(SPEED_ANSWERS, shellSpeedKmS(WHITE_DWARF_EXPLOSION.outerShellPc, ageYears)).label
}

// ---- The learner's choices (the defaults are the published values) ----

export interface WhiteDwarfSettings {
  massSolar?: number
  ageYears?: number
  brightnessChange?: number
}
export interface WhiteDwarfResult {
  massSolar: number
  radiusKm: number
  radiusEarths: number
  gapBelowLimitSolar: number
  fractionOfLimit: number
  simulationMassSolar: number
  simulationGapBelowLimitSolar: number
  ageYears: number
  innerShellSpeedKmS: number
  outerShellSpeedKmS: number
  outerShellFractionOfLightSpeed: number
  shellGapPc: number
  shellGapLightYears: number
  innerShellLightYears: number
  outerShellLightYears: number
  separationInUncertainties: number
  brightnessChange: number
  distanceErrorPercent: number
}

export function runWhiteDwarfExplosion(settings: WhiteDwarfSettings = {}): WhiteDwarfResult {
  const d = WHITE_DWARF_EXPLOSION
  const simulationMassSolar = doubleDetonationMass(d.simulationCoreSolar, d.simulationShellSolar)
  const massSolar = settings.massSolar ?? simulationMassSolar
  const ageYears = settings.ageYears ?? d.defaultAgeYears
  const brightnessChange = settings.brightnessChange ?? 0
  const radiusKm = whiteDwarfRadiusKm(massSolar)
  const gap = shellGap(d.innerShellPc, d.outerShellPc)
  const outerSpeed = shellSpeedKmS(d.outerShellPc, ageYears)
  return {
    massSolar,
    radiusKm,
    radiusEarths: earthRadii(radiusKm),
    gapBelowLimitSolar: gapBelowLimit(massSolar),
    fractionOfLimit: fractionOfLimit(massSolar),
    simulationMassSolar,
    simulationGapBelowLimitSolar: gapBelowLimit(simulationMassSolar),
    ageYears,
    innerShellSpeedKmS: shellSpeedKmS(d.innerShellPc, ageYears),
    outerShellSpeedKmS: outerSpeed,
    outerShellFractionOfLightSpeed: fractionOfLightSpeed(outerSpeed),
    shellGapPc: gap.pc,
    shellGapLightYears: gap.lightYears,
    innerShellLightYears: d.innerShellPc * LIGHT_YEARS_PER_PARSEC,
    outerShellLightYears: d.outerShellPc * LIGHT_YEARS_PER_PARSEC,
    separationInUncertainties: shellSeparationInUncertainties(d.innerShellPc, d.outerShellPc, d.shellUncertaintyPc),
    brightnessChange,
    distanceErrorPercent: distanceErrorPercent(brightnessChange),
  }
}

// ---- The reading guide's comparisons (CLAUDE.md §14, "Reading the Results") ----

// Where a value lies against a published range: inside it, or below or above it by this factor (the ratio to the nearest edge, always 1 or more). No cut-off such as "close
// enough" is applied here.
export interface RangeCheck {
  verdict: 'inside' | 'below' | 'above'
  factor: number
}
export function whereInRange(value: number, range: readonly [number, number]): RangeCheck {
  requirePositive(value, 'The value')
  if (!(range[0] > 0) || range[0] > range[1]) throw new RangeError('A range must run from its low end to its high end')
  if (value < range[0]) return { verdict: 'below', factor: range[0] / value }
  if (value > range[1]) return { verdict: 'above', factor: value / range[1] }
  return { verdict: 'inside', factor: 1 }
}

// The two analyses' masses side by side: the simulation's total (1.028 + 0.027) and the 2026 analysis's lower bound (a core of 1 plus a shell above 0.05), and how they differ as a
// percentage of the simulation's total. The 2026 figure is a lower bound, not a value.
export function twoAnalysesComparison(): { simulationSolar: number; analysis2026AtLeastSolar: number; differencePercent: number } {
  const d = WHITE_DWARF_EXPLOSION
  const simulationSolar = doubleDetonationMass(d.simulationCoreSolar, d.simulationShellSolar)
  const analysis2026AtLeastSolar = doubleDetonationMass(d.analysis2026CoreSolar, d.analysis2026ShellAboveSolar)
  return { simulationSolar, analysis2026AtLeastSolar, differencePercent: ((analysis2026AtLeastSolar - simulationSolar) / simulationSolar) * 100 }
}

// The learner's trial values set beside the published ones. Every percent is signed, positive when the trial value is the larger, and is of the published value. `-1, 0, 1` mean
// smaller than, the same as or larger than the published value.
export interface TrialComparison {
  mass: -1 | 0 | 1
  massPercent: number
  radiusPercent: number
  age: -1 | 0 | 1
  outerSpeedPercent: number
  ageInsidePublishedRange: boolean
  brightness: -1 | 0 | 1
}
const percentFrom = (value: number, published: number): number => ((value - published) / published) * 100
const sign = (value: number, published: number): -1 | 0 | 1 => (value < published ? -1 : value > published ? 1 : 0)

export function compareWithPublished(settings: WhiteDwarfSettings = {}): TrialComparison {
  const published = runWhiteDwarfExplosion()
  const mine = runWhiteDwarfExplosion(settings)
  const [low, high] = WHITE_DWARF_EXPLOSION.ageRangeYears
  return {
    mass: sign(mine.massSolar, published.massSolar),
    massPercent: percentFrom(mine.massSolar, published.massSolar),
    radiusPercent: percentFrom(mine.radiusKm, published.radiusKm),
    age: sign(mine.ageYears, published.ageYears),
    outerSpeedPercent: percentFrom(mine.outerShellSpeedKmS, published.outerShellSpeedKmS),
    ageInsidePublishedRange: mine.ageYears >= low && mine.ageYears <= high,
    brightness: sign(mine.brightnessChange, 0),
  }
}
