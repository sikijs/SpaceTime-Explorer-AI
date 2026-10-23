// Frontier and Beyond, Experiment 13: catching a supernova in the act (SN 2023ixf), what exploded, and where did the energy go?
// See docs/experiments/frontier-and-beyond/13-catching-a-supernova.md, "Physics Model".
//
// No new physics: (1) the energy of a core collapse as a neutron star's gravitational energy, E = G M^2 / R (an order-of-magnitude estimate, as in Black Holes 9 and
// Spacetime Geometry 5); (2) the shares of that energy in the gas's motion and in the visible light, set beside the Sun's whole-life output as a yardstick; (3) the
// light-travel time to M101, distance / c; (4) how long before the explosion a shell of gas was shed, radius / speed; (5) a list of published estimates of the progenitor's
// mass, with the ranges and a test of which two overlap (no verdict). The module does not model the collapse, the neutrinos, the shock, the light curve or the dust, and it
// does not choose among the mass estimates. This module imports nothing.

// Units and constants (SI unless named). G is the CODATA 2018 value; the solar mass and luminosity are the IAU nominal values (not read at a source for this page, see the
// specification's open items); a year is the Julian year of 365.25 days.
export const G = 6.6743e-11 // m^3 kg^-1 s^-2
export const SOLAR_MASS_KG = 1.98847e30
export const SOLAR_LUMINOSITY_W = 3.828e26
export const SECONDS_PER_YEAR = 365.25 * 24 * 3600
export const SUN_LIFETIME_YEARS = 1e10 // the Sun's whole shining life, about ten billion years (a standard figure; no source read, see the open items)
export const ERG_PER_JOULE = 1e7
export const LIGHT_YEARS_PER_PARSEC = 3.26156
export const CM_PER_AU = 1.495978707e13
const KM_PER_CM = 1e-5

// The published data. Distance to M101: Riess and others (2022), 6.85 +/- 0.15 Mpc (the three choices are the value and its edges). The neutron star: 1.4 solar masses and a
// radius of about 12 km are the usual figures; the other choices span what is quoted. The gas's motion: 1e51 erg, in the literature range of about (0.5-2)e51 erg (SN 2023ixf
// analyses give about (0.7-1.2)e51 and (1.0-5.7)e51). The visible light: (1-10)e49 erg is the literature range for a core-collapse supernova; SN 2023ixf's own value is not
// yet read, so the default is the low end, 1e49 (decision 3 of the specification). The shed gas: dense gas out to (0.5-1)e15 cm at an assumed 50 km/s (Jacobson-Galan and
// others 2023). The discovery: 19 May 2023 (Itagaki).
export const SUPERNOVA = {
  distanceMpc: 6.85,
  distanceChoicesMpc: [6.7, 6.85, 7.0] as const,
  coreMassSolar: 1.4,
  coreMassChoicesSolar: [1.2, 1.4, 2.0] as const,
  coreRadiusKm: 12,
  coreRadiusChoicesKm: [10, 12, 14] as const,
  gasMotionErg: 1e51,
  gasMotionRangeErg: [0.5e51, 2e51] as const,
  lightErg: 1e49,
  lightRangeErg: [1e49, 1e50] as const,
  gasShellRadiiCm: [0.5e15, 1e15] as const,
  windSpeedKmS: 50,
  windSpeedChoicesKmS: [25, 50, 100] as const,
}

// Published estimates of the progenitor's initial mass, in solar masses, each as a range. The Pledger and Shara, Niu, Soraisam values were read in the papers' abstracts. The
// Kilpatrick (12, +2 -1), Van Dyk, Jencson (17 +/- 4) and Qin (18.1, with no range quoted, so a single value) values come from a search summary of a third paper and have not
// been read at their own papers (see the open items). The estimates do not all overlap, and this module does not say which is right.
export interface MassEstimate {
  who: string
  year: number
  method: string
  lowSolar: number
  highSolar: number
}
const MASS_ESTIMATES: readonly MassEstimate[] = [
  { who: 'Pledger and Shara', year: 2023, method: 'brightness before the explosion, against stellar models', lowSolar: 8, highSolar: 10 },
  { who: 'Kilpatrick and others', year: 2023, method: 'the star’s colours and brightness, with dust', lowSolar: 11, highSolar: 14 },
  { who: 'Van Dyk and others', year: 2024, method: 'the star’s brightness and the stars around it', lowSolar: 12, highSolar: 14 },
  { who: 'Niu and others', year: 2023, method: 'the star’s colours and the dust round it; the stars around it gave 17 to 19', lowSolar: 16.2, highSolar: 17.4 },
  { who: 'Jencson and others', year: 2023, method: 'a dusty, luminous star', lowSolar: 13, highSolar: 21 },
  { who: 'Qin and others', year: 2023, method: 'the star’s colours and brightness (no range quoted)', lowSolar: 18.1, highSolar: 18.1 },
  { who: 'Soraisam and others', year: 2023, method: 'how the star pulsed, over 19 years of infrared pictures', lowSolar: 16, highSolar: 24 },
]
export function massEstimates(): readonly MassEstimate[] {
  return MASS_ESTIMATES
}

// The 2026 result (Astronomy and Astrophysics 706, February 2026): modelling the explosion's light gives 5.5 to 14 solar masses and the later spectra 17 to 19; and dust round
// the star could make luminosity-based masses too low by about 9 solar masses. Read from a search result's abstract only; the authors were not confirmed.
export const MASS_2026 = {
  lightCurveRangeSolar: [5.5, 14] as const,
  spectraRangeSolar: [17, 19] as const,
  dustBiasSolar: 9,
}

// Two ranges overlap when each starts at or before the other ends. Symmetric, and no verdict.
export function overlaps(a: { lowSolar: number; highSolar: number }, b: { lowSolar: number; highSolar: number }): boolean {
  if (a.lowSolar > a.highSolar || b.lowSolar > b.highSolar) throw new RangeError('A range must run from its low end to its high end')
  return a.lowSolar <= b.highSolar && b.lowSolar <= a.highSolar
}

function requirePositive(value: number, what: string): void {
  if (!Number.isFinite(value) || value <= 0) throw new RangeError(`${what} must be positive`)
}

// ---- Energy ----

// The energy of the collapse in joules: E = G M^2 / R, for a neutron star of this mass and radius. An order-of-magnitude estimate: a uniform ball would give 3/5 of it, and the
// real binding energy needs general relativity. 1.4 solar masses and 12 km give about 4.3e46 J.
export function collapseEnergyJ(massSolar: number, radiusKm: number): number {
  requirePositive(massSolar, 'The mass')
  requirePositive(radiusKm, 'The radius')
  const mass = massSolar * SOLAR_MASS_KG
  return (G * mass * mass) / (radiusKm * 1000)
}
export function ergFromJoules(joules: number): number {
  return joules * ERG_PER_JOULE
}
export function joulesFromErg(erg: number): number {
  return erg / ERG_PER_JOULE
}

// The Sun's whole-life output, as a yardstick: its luminosity times about ten billion years, about 1.2e44 J = 1.2e51 erg.
export function sunLifetimeEnergyJ(): number {
  return SOLAR_LUMINOSITY_W * SUN_LIFETIME_YEARS * SECONDS_PER_YEAR
}
// An energy in joules as a number of the Sun's whole-life outputs.
export function inSunLifetimes(joules: number): number {
  requirePositive(joules, 'The energy')
  return joules / sunLifetimeEnergyJ()
}

// A part of the collapse's energy as a share (0 to 1), and as "1 time in N".
export function shareOf(partJ: number, totalJ: number): number {
  requirePositive(partJ, 'The part')
  requirePositive(totalJ, 'The total')
  return partJ / totalJ
}
export function oneInN(partJ: number, totalJ: number): number {
  return 1 / shareOf(partJ, totalJ)
}

// ---- Light travel and the shed gas ----

// How many years ago the light left, for a distance in megaparsecs: the distance in light-years is the number of years the light took, since light travels one light-year in
// a year. 6.85 Mpc is 22.3 million light-years.
export function lightYearsFromMpc(distanceMpc: number): number {
  requirePositive(distanceMpc, 'The distance')
  return distanceMpc * 1e6 * LIGHT_YEARS_PER_PARSEC
}
export function lightTravelYears(distanceMpc: number): number {
  return lightYearsFromMpc(distanceMpc)
}

export function cmToAU(radiusCm: number): number {
  requirePositive(radiusCm, 'The radius')
  return radiusCm / CM_PER_AU
}
// Gas at this radius, moving at this speed, was shed this many years before the explosion: time = radius / speed.
export function timeBeforeExplosionYears(radiusCm: number, speedKmS: number): number {
  requirePositive(radiusCm, 'The radius')
  requirePositive(speedKmS, 'The speed')
  const speedCmS = speedKmS / KM_PER_CM
  return radiusCm / speedCmS / SECONDS_PER_YEAR
}

// ---- The predictions' answers ----

// Prediction 1: what share of the collapse's energy is visible light? The four buttons, by "1 time in N".
export type VisibleShareAnswer = 'about half' | '1 in 10' | '1 in 100' | '1 in 10,000'
const SHARE_ANSWERS: { label: VisibleShareAnswer; oneIn: number }[] = [
  { label: 'about half', oneIn: 2 },
  { label: '1 in 10', oneIn: 10 },
  { label: '1 in 100', oneIn: 100 },
  { label: '1 in 10,000', oneIn: 10_000 },
]
// The button nearest to the true figure, comparing powers of ten.
function nearestLog<T extends { oneIn: number }>(answers: T[], truth: number): T {
  let best = answers[0]
  for (const a of answers) {
    if (Math.abs(Math.log10(a.oneIn) - Math.log10(truth)) < Math.abs(Math.log10(best.oneIn) - Math.log10(truth))) best = a
  }
  return best
}
export function visibleShareAnswer(): VisibleShareAnswer {
  const total = collapseEnergyJ(SUPERNOVA.coreMassSolar, SUPERNOVA.coreRadiusKm)
  return nearestLog(SHARE_ANSWERS, oneInN(joulesFromErg(SUPERNOVA.lightErg), total)).label
}

// Prediction 2: how long before May 2023 did the star really explode? The three buttons, in years.
export type LightTravelAnswer = 'a few months' | 'about 20 thousand years' | 'about 20 million years'
const TRAVEL_ANSWERS: { label: LightTravelAnswer; oneIn: number }[] = [
  { label: 'a few months', oneIn: 0.25 },
  { label: 'about 20 thousand years', oneIn: 2e4 },
  { label: 'about 20 million years', oneIn: 2e7 },
]
export function lightTravelAnswer(): LightTravelAnswer {
  return nearestLog(TRAVEL_ANSWERS, lightTravelYears(SUPERNOVA.distanceMpc)).label
}

// ---- The learner's choices (the defaults are the published values) ----

export interface SupernovaSettings {
  coreMassSolar?: number
  coreRadiusKm?: number
  distanceMpc?: number
  windSpeedKmS?: number
}
export interface SupernovaResult {
  coreMassSolar: number
  coreRadiusKm: number
  collapseJ: number
  collapseErg: number
  gasMotionJ: number
  lightJ: number
  gasMotionShare: number // of the collapse's energy
  lightShare: number
  gasMotionOneIn: number
  lightOneIn: number
  sunLifetimes: { collapse: number; gasMotion: number; light: number }
  distanceMpc: number
  lightYears: number
  lightTravelYears: number
  windSpeedKmS: number
  gasShellAU: [number, number] // the inner and outer radius of the dense gas
  gasShedYearsBefore: [number, number] // how many years before the explosion the inner and outer gas was shed
}

export function runCatchingASupernova(settings: SupernovaSettings = {}): SupernovaResult {
  const coreMassSolar = settings.coreMassSolar ?? SUPERNOVA.coreMassSolar
  const coreRadiusKm = settings.coreRadiusKm ?? SUPERNOVA.coreRadiusKm
  const distanceMpc = settings.distanceMpc ?? SUPERNOVA.distanceMpc
  const windSpeedKmS = settings.windSpeedKmS ?? SUPERNOVA.windSpeedKmS
  const collapseJ = collapseEnergyJ(coreMassSolar, coreRadiusKm)
  const gasMotionJ = joulesFromErg(SUPERNOVA.gasMotionErg)
  const lightJ = joulesFromErg(SUPERNOVA.lightErg)
  const [inner, outer] = SUPERNOVA.gasShellRadiiCm
  return {
    coreMassSolar,
    coreRadiusKm,
    collapseJ,
    collapseErg: ergFromJoules(collapseJ),
    gasMotionJ,
    lightJ,
    gasMotionShare: shareOf(gasMotionJ, collapseJ),
    lightShare: shareOf(lightJ, collapseJ),
    gasMotionOneIn: oneInN(gasMotionJ, collapseJ),
    lightOneIn: oneInN(lightJ, collapseJ),
    sunLifetimes: { collapse: inSunLifetimes(collapseJ), gasMotion: inSunLifetimes(gasMotionJ), light: inSunLifetimes(lightJ) },
    distanceMpc,
    lightYears: lightYearsFromMpc(distanceMpc),
    lightTravelYears: lightTravelYears(distanceMpc),
    windSpeedKmS,
    gasShellAU: [cmToAU(inner), cmToAU(outer)],
    gasShedYearsBefore: [timeBeforeExplosionYears(inner, windSpeedKmS), timeBeforeExplosionYears(outer, windSpeedKmS)],
  }
}
