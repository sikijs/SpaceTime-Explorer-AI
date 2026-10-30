// Cosmic Horizons, Experiment 15: how big is a neutron star, and where do they end? (NICER and GW230529)
// See docs/experiments/cosmic-horizons/15-how-big-is-a-neutron-star.md, "Physics Model".
//
// No new physics. Small calculations on a ball of mass M and radius R: (1) its black-hole radius (Black Holes 1, imported) and the ratio of the two; (2) compactness
// GM/(Rc^2); (3) surface gravity GM/R^2 (Newton's value, only a guide at this strength: the spec's decision 4); (4) how slowly a clock on the surface ticks, sqrt(1 - r_s/R)
// (Black Holes 2's formula, written here so that this module imports only Black Holes 1 and 9); (5) mean density. The published measurements (NICER, GW230529, a maximum-mass
// estimate) are data and no calculation is done on them except "how far from a value, in give-or-takes". The radius is an INPUT: the module does not compute it from the
// physics of dense matter, does not model spin or shape, does not compute a maximum mass and does not decide what GW230529's object is.
// This module imports only the Black Holes 1 and 9 modules.

import { horizonRadiusKm } from './blackHoleSizeExperiment'
import { CHANDRASEKHAR_LIMIT_SOLAR_MASSES, NEUTRON_STAR_RADIUS_KM, whiteDwarfRadiusKm } from './blackHoleFormationExperiment'

export { horizonRadiusKm as blackHoleRadiusKm, CHANDRASEKHAR_LIMIT_SOLAR_MASSES, NEUTRON_STAR_RADIUS_KM }

// ---- Constants (SI, written out) ----

export const GM_SUN_M3_S2 = 1.32712440018e20 // the Sun's GM, IAU nominal value
export const SUN_MASS_KG = 1.98847e30
export const EARTH_SURFACE_GRAVITY_M_S2 = 9.80665
export const EARTH_MASS_SOLAR = 3.003e-6
export const EARTH_RADIUS_KM = 6371
export const SUN_RADIUS_KM = 695_700
export const SUGAR_CUBE_M3 = 1e-6 // 1 cubic centimetre

// ---- The published data (read 2026-10-24 from abstracts, NASA and LIGO pages and search summaries: see the specification's "Sources read") ----

export const NEUTRON_STAR_DATA = {
  // Choudhury and others (2024), ApJ Letters: PSR J0437-4715, M = 1.418 +/- 0.037, R = 11.36 (+0.95, -0.63) km (16th and 84th percentiles).
  j0437: { massSolar: 1.418, massUncertaintySolar: 0.037, radiusKm: 11.36, radiusPlusKm: 0.95, radiusMinusKm: 0.63 },
  // Miller and others (arXiv, September 2026): PSR J0614-3329, "9.88-12.77 km" (68 percent range).
  j0614RadiusRangeKm: [9.88, 12.77] as const,
  // NASA Imagine the Universe: "about 20 kilometers across" (a radius of about 10 km) and a sugar cube of "about 1 trillion kilograms".
  nasaDiameterKm: 20,
  nasaSugarCubeKg: 1e12,
  // NASA/HEASARC NICER note (22 August 2024): the radius has "5-8% uncertainties".
  nasaRadiusUncertaintyPercent: [5, 8] as const,
  // A 2026 preprint (Kasza and others, arXiv:2605.00437), read only through a news story: the maximum mass is 2.2 to 2.3 solar masses under its assumptions.
  maximumMassEstimateRangeSolar: [2.2, 2.3] as const,
  // GW230529 (LIGO-Virgo-KAGRA, arXiv:2404.04248, abstract read 2026-10-24): "component masses 2.5-4.5 and 1.2-2.0 M_sun (all measurements quoted at the 90% credible level)". The
  // LIGO summary gives the heavier object's most likely value as "about 3.6". No central value is used for the lighter object (the 1.4 seen in Wikipedia was not read in the paper).
  gw230529Primary: { massSolar: 3.6, lowSolar: 2.5, highSolar: 4.5 },
  gw230529Secondary: { lowSolar: 1.2, highSolar: 2.0 },
  gapRangeSolar: [3, 5] as const,
  // The learner's choices.
  radiusChoicesKm: [6, 8, 10, 11.36, 12.77] as const,
  massChoicesSolar: [1.2, 1.4, 1.418, 2.0, 2.3] as const,
  // Prediction questions.
  predictionMassSolar: 1.4,
  predictionSqueezedRadiusKm: 6,
  predictionGravityRadiusKm: 12,
  // The tutor's worked example: a person of this mass (an everyday figure, not a published one).
  examplePersonKg: 70,
}

function requirePositive(value: number, what: string): void {
  if (!Number.isFinite(value) || value <= 0) throw new RangeError(`${what} must be positive`)
}

// ---- The star and its black-hole radius ----

// radius / black-hole radius. Below 1 the ball would be inside its own black-hole radius.
export function radiusRatio(massSolar: number, radiusKm: number): number {
  requirePositive(massSolar, 'The mass')
  requirePositive(radiusKm, 'The radius')
  return radiusKm / horizonRadiusKm(massSolar)
}
export function isInsideHorizon(massSolar: number, radiusKm: number): boolean {
  return radiusRatio(massSolar, radiusKm) <= 1
}
// GM / (R c^2) = r_s / (2R) = 1 / (2 x ratio).
export function compactness(massSolar: number, radiusKm: number): number {
  return 1 / (2 * radiusRatio(massSolar, radiusKm))
}

// ---- Gravity at the surface ----

// Newton's GM / R^2, in m/s^2. Only a guide at this strength: the true value differs because space is curved.
export function surfaceGravity(massSolar: number, radiusKm: number): number {
  requirePositive(massSolar, 'The mass')
  requirePositive(radiusKm, 'The radius')
  const radiusM = radiusKm * 1000
  return (GM_SUN_M3_S2 * massSolar) / (radiusM * radiusM)
}
export function gravityInEarths(massSolar: number, radiusKm: number): number {
  return surfaceGravity(massSolar, radiusKm) / EARTH_SURFACE_GRAVITY_M_S2
}
// How fast a clock held at rest on the surface ticks, compared with one far away: sqrt(1 - r_s/R). At or inside the black-hole radius no clock can hover there: null.
export function surfaceClockRate(massSolar: number, radiusKm: number): number | null {
  const ratio = radiusRatio(massSolar, radiusKm)
  if (ratio <= 1) return null
  return Math.sqrt(1 - 1 / ratio)
}

// ---- Density ----

export function meanDensityKgM3(massSolar: number, radiusKm: number): number {
  requirePositive(massSolar, 'The mass')
  requirePositive(radiusKm, 'The radius')
  const radiusM = radiusKm * 1000
  return (massSolar * SUN_MASS_KG) / ((4 / 3) * Math.PI * radiusM ** 3)
}
export function sugarCubeKg(massSolar: number, radiusKm: number): number {
  return meanDensityKgM3(massSolar, radiusKm) * SUGAR_CUBE_M3
}

// ---- The ladder: radius / black-hole radius for ordinary objects (Picture 2) ----

export interface LadderEntry {
  id: 'earth' | 'sun' | 'white-dwarf' | 'neutron-star' | 'black-hole'
  label: string
  massSolar: number
  radiusKm: number
  ratio: number
}
function ladderEntry(id: LadderEntry['id'], label: string, massSolar: number, radiusKm: number): LadderEntry {
  return { id, label, massSolar, radiusKm, ratio: radiusRatio(massSolar, radiusKm) }
}
// The Earth, the Sun, a white dwarf of 1 Sun (Black Holes 9's size), the NICER neutron star, and a black hole (ratio exactly 1, by definition).
export function ladderEntries(): LadderEntry[] {
  const j = NEUTRON_STAR_DATA.j0437
  return [
    ladderEntry('earth', 'The Earth', EARTH_MASS_SOLAR, EARTH_RADIUS_KM),
    ladderEntry('sun', 'The Sun', 1, SUN_RADIUS_KM),
    ladderEntry('white-dwarf', 'A white dwarf of 1 Sun', 1, whiteDwarfRadiusKm(1)),
    ladderEntry('neutron-star', 'A neutron star (PSR J0437−4715)', j.massSolar, j.radiusKm),
    ladderEntry('black-hole', 'A black hole', 1, horizonRadiusKm(1)),
  ]
}

// ---- How far a value is from a published one, in give-or-takes ----

// The give-or-take on the side the value lies on (the upper one if the value is above the published one, the lower one if below). A reading aid only: the published intervals are
// not symmetric and not exactly Gaussian. Zero difference gives zero.
export interface GiveOrTakeDistance {
  direction: 'above' | 'below' | 'same'
  difference: number
  giveOrTake: number
  times: number
}
export function distanceInGiveOrTakes(value: number, published: number, plus: number, minus: number): GiveOrTakeDistance {
  if (!Number.isFinite(value) || !Number.isFinite(published)) throw new RangeError('The values must be finite numbers')
  requirePositive(plus, 'The upper give-or-take')
  requirePositive(minus, 'The lower give-or-take')
  if (value === published) return { direction: 'same', difference: 0, giveOrTake: plus, times: 0 }
  if (value > published) return { direction: 'above', difference: value - published, giveOrTake: plus, times: (value - published) / plus }
  return { direction: 'below', difference: published - value, giveOrTake: minus, times: (published - value) / minus }
}

// The interval a value with a give-or-take covers, [value - minus, value + plus]. Used to draw a published measurement as a bar (Picture 3).
export function giveOrTakeInterval(value: number, plus: number, minus: number): [number, number] {
  if (!Number.isFinite(value)) throw new RangeError('The value must be a finite number')
  requirePositive(plus, 'The upper give-or-take')
  requirePositive(minus, 'The lower give-or-take')
  return [value - minus, value + plus]
}

// How many times the Sun's radius is a star's radius (Picture 1's worked moment: the Sun is about 61,000 times wider than the neutron star is).
export function sunRadiiOverStarRadius(radiusKm: number): number {
  requirePositive(radiusKm, 'The radius')
  return SUN_RADIUS_KM / radiusKm
}

// ---- The reading guide's comparisons (CLAUDE.md §14, "Reading the Results") ----

// Where a value lies against a published range: inside it, or below or above it by this distance (in the value's own unit, to the nearest edge). No cut-off such as "close
// enough" is applied here.
export interface RangeCheck {
  verdict: 'inside' | 'below' | 'above'
  distance: number
}
export function rangeCheck(value: number, low: number, high: number): RangeCheck {
  if (!Number.isFinite(value)) throw new RangeError('The value must be a finite number')
  if (!Number.isFinite(low) || !Number.isFinite(high) || low > high) throw new RangeError('A range must run from its low end to its high end')
  if (value < low) return { verdict: 'below', distance: low - value }
  if (value > high) return { verdict: 'above', distance: value - high }
  return { verdict: 'inside', distance: 0 }
}

// How much of an interval [low, high] lies inside a range [rangeLow, rangeHigh]: the overlap's width, the interval's width and the fraction of the interval that is inside.
export interface IntervalOverlap {
  overlap: number
  width: number
  fraction: number
}
export function intervalOverlap(low: number, high: number, rangeLow: number, rangeHigh: number): IntervalOverlap {
  if (![low, high, rangeLow, rangeHigh].every(Number.isFinite) || low >= high || rangeLow > rangeHigh) throw new RangeError('The interval and the range must be finite, and the interval must have a width')
  const overlap = Math.max(0, Math.min(high, rangeHigh) - Math.max(low, rangeLow))
  return { overlap, width: high - low, fraction: overlap / (high - low) }
}

// A sugar cube of the star's material against NASA's "about 1 trillion kilograms" (a round figure): both, and how many times NASA's is the star's.
export function densityVersusNasa(massSolar: number, radiusKm: number): { ourKg: number; nasaKg: number; nasaOverOurs: number } {
  const ourKg = sugarCubeKg(massSolar, radiusKm)
  const nasaKg = NEUTRON_STAR_DATA.nasaSugarCubeKg
  return { ourKg, nasaKg, nasaOverOurs: nasaKg / ourKg }
}

// What fraction of the star's radius the black-hole radius is: 1 / ratio, which is also the star's compactness divided by 0.5. For the NICER star, 0.37: squeezed to 37 percent of its radius
// it would be at its black-hole radius.
export function blackHoleRadiusFraction(massSolar: number, radiusKm: number): number {
  return 1 / radiusRatio(massSolar, radiusKm)
}
// The ratio at the two ends of a radius range (for the weight given): how far from the black-hole radius the star is, allowing for the give-or-take.
export function ratioRange(massSolar: number, lowKm: number, highKm: number): [number, number] {
  if (!(lowKm > 0) || lowKm > highKm) throw new RangeError('A radius range must run from its low end to its high end')
  return [radiusRatio(massSolar, lowKm), radiusRatio(massSolar, highKm)]
}
// A sugar cube (1 cubic centimetre) of the star's material, in millions of tonnes (1 tonne = 1,000 kg).
export function sugarCubeMillionTonnes(massSolar: number, radiusKm: number): number {
  return sugarCubeKg(massSolar, radiusKm) / 1e3 / 1e6
}
// Minutes counted by a clock on the surface while a distant clock counts one hour. Null at or inside the black-hole radius.
export function surfaceMinutesPerDistantHour(massSolar: number, radiusKm: number): number | null {
  const rate = surfaceClockRate(massSolar, radiusKm)
  return rate === null ? null : 60 * rate
}

// The clock factor worked step by step (Words panel): ratio = R / r_s, 1 / ratio = r_s / R, 1 - r_s / R, then the square root. Null at or inside the black-hole radius.
export interface ClockWorkedExample {
  ratio: number
  blackHoleOverRadius: number
  oneMinus: number
  rate: number
}
export function clockWorkedExample(massSolar: number, radiusKm: number): ClockWorkedExample | null {
  const ratio = radiusRatio(massSolar, radiusKm)
  if (ratio <= 1) return null
  const blackHoleOverRadius = 1 / ratio
  const oneMinus = 1 - blackHoleOverRadius
  return { ratio, blackHoleOverRadius, oneMinus, rate: Math.sqrt(oneMinus) }
}

// The check-up's comparisons for the NICER star (the page's defaults), all in one place.
export interface CheckUp {
  nasaRadiusKm: number // NASA's "about 20 km across", halved
  nasaRadiusVersusNicer: RangeCheck // against NICER's 68 percent interval
  nasaRadiusInGiveOrTakes: GiveOrTakeDistance
  roundRadiusVersusNicer: RangeCheck // Black Holes 1's round 12 km
  nicerRadiusVersusJ0614: RangeCheck
  massVersusEstimate: RangeCheck // J0437's mass against the 2.2 to 2.3 estimate
  gwHeavierVersusGap: IntervalOverlap
  gwHeavierVersusEstimate: RangeCheck // the heavier object's lowest possible mass against the estimate's top
  gwHeavierInterval: [number, number]
  density: { ourKg: number; nasaKg: number; nasaOverOurs: number }
}
export function runCheckUp(): CheckUp {
  const d = NEUTRON_STAR_DATA
  const j = d.j0437
  const [nicerLo, nicerHi] = giveOrTakeInterval(j.radiusKm, j.radiusPlusKm, j.radiusMinusKm)
  const nasaRadiusKm = d.nasaDiameterKm / 2
  const interval: [number, number] = [d.gw230529Primary.lowSolar, d.gw230529Primary.highSolar]
  return {
    nasaRadiusKm,
    nasaRadiusVersusNicer: rangeCheck(nasaRadiusKm, nicerLo, nicerHi),
    nasaRadiusInGiveOrTakes: distanceInGiveOrTakes(nasaRadiusKm, j.radiusKm, j.radiusPlusKm, j.radiusMinusKm),
    roundRadiusVersusNicer: rangeCheck(NEUTRON_STAR_RADIUS_KM, nicerLo, nicerHi),
    nicerRadiusVersusJ0614: rangeCheck(j.radiusKm, d.j0614RadiusRangeKm[0], d.j0614RadiusRangeKm[1]),
    massVersusEstimate: rangeCheck(j.massSolar, d.maximumMassEstimateRangeSolar[0], d.maximumMassEstimateRangeSolar[1]),
    gwHeavierVersusGap: intervalOverlap(interval[0], interval[1], d.gapRangeSolar[0], d.gapRangeSolar[1]),
    gwHeavierVersusEstimate: rangeCheck(interval[0], d.maximumMassEstimateRangeSolar[0], d.maximumMassEstimateRangeSolar[1]),
    gwHeavierInterval: interval,
    density: densityVersusNasa(j.massSolar, j.radiusKm),
  }
}

// ---- The predictions ----

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

// Prediction 1: a neutron star of 1.4 Suns squeezed to 6 km. Would it be a black hole?
export type SizeAnswer = 'yes' | 'no'
export const SIZE_ANSWERS: { label: SizeAnswer }[] = [{ label: 'yes' }, { label: 'no' }]
export function sizeAnswer(): SizeAnswer {
  const d = NEUTRON_STAR_DATA
  return isInsideHorizon(d.predictionMassSolar, d.predictionSqueezedRadiusKm) ? 'yes' : 'no'
}

// Prediction 2: about how many times stronger is gravity on the surface of a 1.4-Sun, 12-km neutron star than on the Earth's? The three buttons, in Earths.
export type GravityAnswer = 'about 10 times' | 'about a thousand times' | 'about 100 billion times'
export const GRAVITY_ANSWERS: { label: GravityAnswer; value: number }[] = [
  { label: 'about 10 times', value: 10 },
  { label: 'about a thousand times', value: 1e3 },
  { label: 'about 100 billion times', value: 1e11 },
]
export function gravityAnswer(): GravityAnswer {
  const d = NEUTRON_STAR_DATA
  return nearestLog(GRAVITY_ANSWERS, gravityInEarths(d.predictionMassSolar, d.predictionGravityRadiusKm)).label
}

// ---- The real results the learner's guesses are drawn beside (pilot, specification "Pilot: the learner's guess drawn beside the real result") ----

// Prediction 1's real result: the 1.4-Sun star squeezed to 6 km. A star of the question, not a measured one; its black-hole radius and ratio are calculated.
export interface PredictionOneReal {
  massSolar: number
  radiusKm: number
  blackHoleRadiusKm: number
  ratio: number
  insideHorizon: boolean
}
export function predictionOneReal(): PredictionOneReal {
  const { predictionMassSolar: massSolar, predictionSqueezedRadiusKm: radiusKm } = NEUTRON_STAR_DATA
  return {
    massSolar,
    radiusKm,
    blackHoleRadiusKm: horizonRadiusKm(massSolar),
    ratio: radiusRatio(massSolar, radiusKm),
    insideHorizon: isInsideHorizon(massSolar, radiusKm),
  }
}

// Prediction 2's real result: calculated from the mass and radius (g = GM / R^2), not a measured surface gravity.
export interface PredictionTwoReal {
  massSolar: number
  radiusKm: number
  gravityInEarths: number
}
export function predictionTwoReal(): PredictionTwoReal {
  const { predictionMassSolar: massSolar, predictionGravityRadiusKm: radiusKm } = NEUTRON_STAR_DATA
  return { massSolar, radiusKm, gravityInEarths: gravityInEarths(massSolar, radiusKm) }
}

// Prediction 1's guess as a circle: "yes" is drawn at the black-hole radius of the question's mass (the largest size at which the star would be a black hole);
// "no" is drawn at the question's own radius (6 km), which lies outside it. A marker, not a measurement.
export function guessCircleRadiusKm(answer: SizeAnswer): number {
  const d = NEUTRON_STAR_DATA
  if (answer === 'yes') return horizonRadiusKm(d.predictionMassSolar)
  if (answer === 'no') return d.predictionSqueezedRadiusKm
  throw new RangeError('Not one of the answers')
}

// How many times larger the real surface gravity is than a gravity button's value (the tutor's words for a guess that missed). 1 is a match.
export function gravityRealOverGuess(answer: GravityAnswer): number {
  return predictionTwoReal().gravityInEarths / guessGravityInEarths(answer)
}

// What a person of the given mass would be pulled with, as a weight in tonnes, where gravity is the given number of Earths (the tutor's worked example).
export function personWeightTonnes(personKg: number, gravityEarths: number): number {
  requirePositive(personKg, 'personKg')
  requirePositive(gravityEarths, 'gravityEarths')
  return (personKg * gravityEarths) / 1000
}

// The 2026 maximum-mass estimate (low and high edge) as a multiple of the NICER star's weight (the tutor's worked sum for the heaviest neutron star).
export function maximumMassOverNicerMass(): [number, number] {
  const d = NEUTRON_STAR_DATA
  return [d.maximumMassEstimateRangeSolar[0] / d.j0437.massSolar, d.maximumMassEstimateRangeSolar[1] / d.j0437.massSolar]
}

// How far the lowest possible weight of GW230529's heavier object lies above the top of the maximum-mass estimate, in Suns (the tutor's worked sum for GW230529).
export function gwHeavierLowestAboveEstimateSolar(): number {
  const d = NEUTRON_STAR_DATA
  return d.gw230529Primary.lowSolar - d.maximumMassEstimateRangeSolar[1]
}

// What a gravity button says, in Earths, so the guess can be drawn on the same scale as the real value.
export function guessGravityInEarths(answer: GravityAnswer): number {
  const found = GRAVITY_ANSWERS.find((a) => a.label === answer)
  if (!found) throw new RangeError('Not one of the answers')
  return found.value
}

// Where a value sits along a log scale from 10^minPower to 10^maxPower: 0 at the left end, 1 at the right end (clamped).
export function logScalePosition(value: number, minPower: number, maxPower: number): number {
  requirePositive(value, 'value')
  if (!(maxPower > minPower)) throw new RangeError('maxPower must be above minPower')
  const t = (Math.log10(value) - minPower) / (maxPower - minPower)
  return Math.min(1, Math.max(0, t))
}

// ---- The learner's choices (the defaults are NICER's values for PSR J0437-4715) ----

export interface NeutronStarSettings {
  massSolar?: number
  radiusKm?: number
}
export interface NeutronStarResult {
  massSolar: number
  radiusKm: number
  diameterKm: number
  blackHoleRadiusKm: number
  ratio: number
  compactness: number
  insideHorizon: boolean
  surfaceGravityMS2: number
  gravityInEarths: number
  clockRate: number | null // null: at or inside the black-hole radius, where no clock can hover
  clockSlowerPercent: number | null
  densityKgM3: number
  sugarCubeKg: number
  radiusFromNicerKm: GiveOrTakeDistance
}

export function runNeutronStarSize(settings: NeutronStarSettings = {}): NeutronStarResult {
  const j = NEUTRON_STAR_DATA.j0437
  const massSolar = settings.massSolar ?? j.massSolar
  const radiusKm = settings.radiusKm ?? j.radiusKm
  const ratio = radiusRatio(massSolar, radiusKm)
  const clockRate = surfaceClockRate(massSolar, radiusKm)
  return {
    massSolar,
    radiusKm,
    diameterKm: 2 * radiusKm,
    blackHoleRadiusKm: horizonRadiusKm(massSolar),
    ratio,
    compactness: compactness(massSolar, radiusKm),
    insideHorizon: ratio <= 1,
    surfaceGravityMS2: surfaceGravity(massSolar, radiusKm),
    gravityInEarths: gravityInEarths(massSolar, radiusKm),
    clockRate,
    clockSlowerPercent: clockRate === null ? null : (1 - clockRate) * 100,
    densityKgM3: meanDensityKgM3(massSolar, radiusKm),
    sugarCubeKg: sugarCubeKg(massSolar, radiusKm),
    radiusFromNicerKm: distanceInGiveOrTakes(radiusKm, j.radiusKm, j.radiusPlusKm, j.radiusMinusKm),
  }
}
