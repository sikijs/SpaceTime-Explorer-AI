// Cosmic Horizons, Experiment 13: catching a supernova in the act (SN 2023ixf), what exploded, and where did the energy go?
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

// The published data. Distance to M101: Riess and others (2022), 6.85 +/- 0.15 Mpc (not a learner control: the distance control was dropped on 2026-10-23). The neutron star: 1.4 solar masses and a
// radius of about 12 km are the usual figures; the other choices span what is quoted. The gas's motion: 1e51 erg, in the literature range of about (0.5-2)e51 erg (SN 2023ixf
// analyses give about (0.7-1.2)e51 and (1.0-5.7)e51). The visible light: (1-10)e49 erg is the literature range for a core-collapse supernova; SN 2023ixf's own value is not
// yet read, so the default is the low end, 1e49 (decision 3 of the specification). The shed gas: dense gas out to (0.5-1)e15 cm at an assumed 50 km/s (Jacobson-Galan and
// others 2023). The discovery: 19 May 2023 (Itagaki).
export const SUPERNOVA = {
  distanceMpc: 6.85,
  distanceUncertaintyMpc: 0.15, // Riess and others (2022): 6.85 +/- 0.15 Mpc
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
// Kilpatrick abstract (about 11 solar masses; 11 +/- 2 in a summary of a third paper) was read; the Van Dyk, Jencson (17 +/- 4) and Qin (18.1, with no range quoted, so a single
// value) values come from a search summary of a third paper and have not been read at their own papers (see the open items). The estimates do not all overlap, and this module does not say which is right.
export interface MassEstimate {
  who: string
  year: number
  method: string
  lowSolar: number
  highSolar: number
}
const MASS_ESTIMATES: readonly MassEstimate[] = [
  { who: 'Pledger and Shara', year: 2023, method: 'the star’s brightness before the explosion, against stellar models', lowSolar: 8, highSolar: 10 },
  { who: 'Kilpatrick and others', year: 2023, method: 'fitting the star’s colours and brightness with dusty models', lowSolar: 9, highSolar: 13 },
  { who: 'Van Dyk and others', year: 2024, method: 'method not read (seen in a summary only)', lowSolar: 12, highSolar: 14 },
  { who: 'Niu and others', year: 2023, method: 'the star’s colours and the dust round it; the stars around it gave 17 to 19', lowSolar: 16.2, highSolar: 17.4 },
  { who: 'Jencson and others', year: 2023, method: 'a luminous, dusty, variable star (from the paper’s title)', lowSolar: 13, highSolar: 21 },
  { who: 'Qin and others', year: 2023, method: 'method not read (seen in a summary only); no range quoted', lowSolar: 18.1, highSolar: 18.1 },
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
export function nearestLog<T extends { oneIn: number }>(answers: T[], truth: number): T {
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

// How many times longer the light's journey is than a Prediction 2 button's time, as the tutor compares them (20 thousand years against the real 22 million).
export function lightTravelTimesLongerThan(answer: LightTravelAnswer): number {
  const years = TRAVEL_ANSWERS.find((a) => a.label === answer)?.oneIn
  if (years === undefined) throw new RangeError('Not one of the answers')
  return lightTravelYears(SUPERNOVA.distanceMpc) / years
}

// The distance to M101 and its give-or-take: the two edges in Mpc, and the give-or-take as a percentage of the distance.
export function distanceRangeMpc(): [number, number] {
  return [SUPERNOVA.distanceMpc - SUPERNOVA.distanceUncertaintyMpc, SUPERNOVA.distanceMpc + SUPERNOVA.distanceUncertaintyMpc]
}
export function distanceUncertaintyPercent(): number {
  return (SUPERNOVA.distanceUncertaintyMpc / SUPERNOVA.distanceMpc) * 100
}

// The numbers of the worked examples, so that the interface only displays them. The collapse: the mass in kilograms, the radius in metres, the energy by G M^2 / R, and the
// same energy for a ball of the same mass and size with the same density throughout, which is 3/5 of it.
export function collapseWorkedExample(massSolar: number, radiusKm: number): { massKg: number; radiusM: number; energyJ: number; uniformBallEnergyJ: number } {
  requirePositive(massSolar, 'The mass')
  requirePositive(radiusKm, 'The radius')
  return { massKg: massSolar * SOLAR_MASS_KG, radiusM: radiusKm * 1000, energyJ: collapseEnergyJ(massSolar, radiusKm), uniformBallEnergyJ: 0.6 * collapseEnergyJ(massSolar, radiusKm) }
}
// The shed gas: the radius in centimetres, the speed in centimetres a second, the time in seconds and the time in years.
export function gasTimeWorkedExample(radiusCm: number, speedKmS: number): { radiusCm: number; speedCmS: number; seconds: number; years: number } {
  requirePositive(radiusCm, 'The radius')
  requirePositive(speedKmS, 'The speed')
  const speedCmS = speedKmS / KM_PER_CM
  const seconds = radiusCm / speedCmS
  return { radiusCm, speedCmS, seconds, years: seconds / SECONDS_PER_YEAR }
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

// The smallest and largest "1 part in N" for the light over all nine core settings (the three masses by the three radii).
export function lightOneInRangeOverCores(): { lowOneIn: number; highOneIn: number } {
  const values = SUPERNOVA.coreMassChoicesSolar.flatMap((m) => SUPERNOVA.coreRadiusChoicesKm.map((r) => runCatchingASupernova({ coreMassSolar: m, coreRadiusKm: r }).lightOneIn))
  return { lowOneIn: Math.min(...values), highOneIn: Math.max(...values) }
}

// ---- The reading guide's comparisons (CLAUDE.md §14, "Reading the Results") ----

// Published figures to set the results beside. The neutrino energy and SN 1987A's come from search-result excerpts of reviews (arXiv:0804.4350, hep-ph/9707501), not read at the
// papers; the explosion energies are from two analyses of SN 2023ixf seen in a search summary; the gas time is the abstract of Jacobson-Galan and others (2023), "3-6 years".
export const LITERATURE = {
  neutrinoEnergyErg: [3e53, 5e53] as const,
  sn1987aEnergyErg: [2e53, 3e53] as const,
  explosionEnergyErg: [0.7e51, 1.2e51] as const,
  explosionEnergyWideErg: [1.0e51, 5.7e51] as const,
  paperGasYears: [3, 6] as const,
}

// Where a value lies against a published range: inside it, or below or above it by this factor (the ratio to the nearest edge, always 1 or more). No cut-off such as
// "close enough" is applied here.
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

// What is left of the collapse's energy when the blast's motion and the visible light are taken away, as a share of the collapse's energy.
export function restShare(collapseJ: number, gasMotionJ: number, lightJ: number): number {
  requirePositive(collapseJ, 'The collapse energy')
  requirePositive(gasMotionJ, 'The blast energy')
  requirePositive(lightJ, 'The light energy')
  if (gasMotionJ + lightJ >= collapseJ) throw new RangeError('The blast and the light cannot be as large as the collapse')
  return 1 - (gasMotionJ + lightJ) / collapseJ
}

// How many of the other published mass estimates a given estimate shares some value with (no verdict).
export function overlapCount(who: string): number {
  const mine = MASS_ESTIMATES.find((e) => e.who === who)
  if (!mine) throw new RangeError('No such estimate')
  return MASS_ESTIMATES.filter((e) => e.who !== who && overlaps(mine, e)).length
}

// The learner's trial values set beside the published ones (the defaults of runCatchingASupernova). Every percent is signed, positive when the trial value is the larger, and is
// of the published value. `-1, 0, 1` mean smaller than, the same as or larger than the published value.
export interface TrialComparison {
  coreMass: -1 | 0 | 1
  coreRadius: -1 | 0 | 1
  collapsePercent: number
  collapseVsNeutrinoRange: RangeCheck
  lightOneInPublished: number
  lightOneInMine: number
  windSpeed: -1 | 0 | 1
  gasTimePercent: number
  gasYearsRounded: [number, number]
  gasYearsMatchPaper: boolean
}
const percentFrom = (value: number, published: number): number => ((value - published) / published) * 100
const sign = (value: number, published: number): -1 | 0 | 1 => (value < published ? -1 : value > published ? 1 : 0)

export function compareWithPublished(settings: SupernovaSettings = {}): TrialComparison {
  const published = runCatchingASupernova()
  const mine = runCatchingASupernova(settings)
  const rounded: [number, number] = [Math.round(mine.gasShedYearsBefore[0]), Math.round(mine.gasShedYearsBefore[1])]
  return {
    coreMass: sign(mine.coreMassSolar, SUPERNOVA.coreMassSolar),
    coreRadius: sign(mine.coreRadiusKm, SUPERNOVA.coreRadiusKm),
    collapsePercent: percentFrom(mine.collapseJ, published.collapseJ),
    collapseVsNeutrinoRange: whereInRange(mine.collapseErg, LITERATURE.neutrinoEnergyErg),
    lightOneInPublished: published.lightOneIn,
    lightOneInMine: mine.lightOneIn,
    windSpeed: sign(mine.windSpeedKmS, SUPERNOVA.windSpeedKmS),
    gasTimePercent: percentFrom(mine.gasShedYearsBefore[0], published.gasShedYearsBefore[0]),
    gasYearsRounded: rounded,
    gasYearsMatchPaper: rounded[0] === LITERATURE.paperGasYears[0] && rounded[1] === LITERATURE.paperGasYears[1],
  }
}
