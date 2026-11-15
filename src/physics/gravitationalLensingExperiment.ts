// This experiment deliberately reuses earlier experiments' constants unchanged (imported, not
// redefined): the speed of light (Experiment 1), the megaparsec-to-kilometer conversion
// (Experiment 2), and the gravitational constant and kiloparsec-to-kilometer conversion
// (Experiment 4). It does not reuse Gravity and Curved Spacetime Experiment 8's code, which works in
// abstract units; it reuses that experiment's idea (the real bending angle is 4GM / (c^2 b)) in real
// units. See the specification's "Physics Model" and "Required Physics Tests".
import { REAL_SPEED_OF_LIGHT_KM_PER_S } from './hubblesLawExperiment'
import { MPC_TO_KM } from './bigBangExperiment'
import { GRAVITATIONAL_CONSTANT_KPC_KMS2_PER_SOLAR_MASS, KM_PER_KPC } from './darkMatterExperiment'

// Given, rounded distances (Mpc) for one real situation (about the cluster Abell 1689: lens at
// redshift 0.18, source at redshift 2, flat universe, H0 = 70, matter share 30%). Not recomputed here.
export const LENS_DISTANCE_MPC = 630
export const SOURCE_DISTANCE_MPC = 1730
export const LENS_TO_SOURCE_DISTANCE_MPC = 1480

// Given, rounded real-world reference values, used only for comparison, not derived here.
export const OBSERVED_RING_ARCSECONDS = 47
export const VISIBLE_MASS_FRACTION = 0.15
export const OBSERVED_TOTAL_MASS_SOLAR_MASSES = 2.0e14

export const MIN_LENS_MASS_SOLAR_MASSES = 1e13
export const MAX_LENS_MASS_SOLAR_MASSES = 4e14

// Standard unit conversion: one radian in arcseconds.
const ARCSECONDS_PER_RADIAN = 206264.80624709636

const CURVE_POINTS = 31

// GM/c^2 in kilometers for a mass in solar masses (about 1.477 km per solar mass), derived from the
// reused constants: G (in kpc km^2/s^2 per solar mass) x km per kpc gives km^3/s^2 per solar mass.
export function gravitationalLengthKm(massSolarMasses: number): number {
  return (
    (GRAVITATIONAL_CONSTANT_KPC_KMS2_PER_SOLAR_MASS * massSolarMasses * KM_PER_KPC) /
    REAL_SPEED_OF_LIGHT_KM_PER_S ** 2
  )
}

// Angular radius of the Einstein ring, in arcseconds, for a round lens with the source exactly behind
// its center: theta = sqrt((4 G M / c^2) x D_ls / (D_l x D_s)). A standard textbook result. For a round
// lens, M is the mass inside the ring.
export function einsteinRingArcseconds(massSolarMasses: number): number {
  const fourGmOverC2Mpc = (4 * gravitationalLengthKm(massSolarMasses)) / MPC_TO_KM
  const thetaRadians = Math.sqrt(
    (fourGmOverC2Mpc * LENS_TO_SOURCE_DISTANCE_MPC) / (LENS_DISTANCE_MPC * SOURCE_DISTANCE_MPC),
  )
  return thetaRadians * ARCSECONDS_PER_RADIAN
}

// The real bending angle in arcseconds for light passing a mass at a given closest distance (km):
// 4GM / (c^2 b). Twice the ordinary-gravity value, as Experiment 8 showed.
export function bendingAngleArcseconds(massSolarMasses: number, closestApproachKm: number): number {
  return ((4 * gravitationalLengthKm(massSolarMasses)) / closestApproachKm) * ARCSECONDS_PER_RADIAN
}

// The mass (solar masses) inside a ring of a given angular radius: the ring formula run backward.
export function massInsideRingSolarMasses(ringArcseconds: number): number {
  const thetaRadians = ringArcseconds / ARCSECONDS_PER_RADIAN
  const fourGmOverC2Km =
    (thetaRadians ** 2 * LENS_DISTANCE_MPC * SOURCE_DISTANCE_MPC * MPC_TO_KM) / LENS_TO_SOURCE_DISTANCE_MPC
  return fourGmOverC2Km / (4 * gravitationalLengthKm(1))
}

export interface GravitationalLensingResult {
  massSolarMasses: number
  ringArcseconds: number
  // The closest the light passes to the cluster's center, b = theta x D_l.
  ringRadiusKm: number
  // The real bending angle at the ring's edge.
  bendingAngleArcseconds: number
  visibleOnlyMassSolarMasses: number
  visibleOnlyRingArcseconds: number
  observedRingArcseconds: number
  observedMassSolarMasses: number
  ringOverVisibleOnlyRing: number
  curve: Array<{ massSolarMasses: number; ringArcseconds: number }>
}

export function runGravitationalLensingExperiment(massSolarMasses: number): GravitationalLensingResult {
  const ringArcseconds = einsteinRingArcseconds(massSolarMasses)
  const ringRadiusKm = (ringArcseconds / ARCSECONDS_PER_RADIAN) * LENS_DISTANCE_MPC * MPC_TO_KM
  const visibleOnlyMassSolarMasses = VISIBLE_MASS_FRACTION * OBSERVED_TOTAL_MASS_SOLAR_MASSES
  const visibleOnlyRingArcseconds = einsteinRingArcseconds(visibleOnlyMassSolarMasses)
  const massRatio = MAX_LENS_MASS_SOLAR_MASSES / MIN_LENS_MASS_SOLAR_MASSES
  return {
    massSolarMasses,
    ringArcseconds,
    ringRadiusKm,
    bendingAngleArcseconds: bendingAngleArcseconds(massSolarMasses, ringRadiusKm),
    visibleOnlyMassSolarMasses,
    visibleOnlyRingArcseconds,
    observedRingArcseconds: OBSERVED_RING_ARCSECONDS,
    observedMassSolarMasses: massInsideRingSolarMasses(OBSERVED_RING_ARCSECONDS),
    ringOverVisibleOnlyRing: ringArcseconds / visibleOnlyRingArcseconds,
    // Log-spaced masses, since the allowed range spans a factor of 40.
    curve: Array.from({ length: CURVE_POINTS }, (_, i) => {
      const mass = MIN_LENS_MASS_SOLAR_MASSES * massRatio ** (i / (CURVE_POINTS - 1))
      return { massSolarMasses: mass, ringArcseconds: einsteinRingArcseconds(mass) }
    }),
  }
}

// ---------------------------------------------------------------------------------------------
// Added in the audit (2026-11-15): guess marks, tutor marking, the check-up, Table 2's comparison
// columns, the imagined ring and worked examples. The interface only displays what these functions
// return (CLAUDE.md §9, §14 "Predictions and the Real Results"). The physics above is unchanged.
// ---------------------------------------------------------------------------------------------

// Published values read on 2026-11-15 (through helper digests; to be rechecked against the live pages
// before they are printed).
// Broadhurst and others 2005 (arXiv:astro-ph/0409132): an Einstein radius "approximately 50 arcsec ...
// based on the radius of curvature of a giant low surface-brightness arc" (no source redshift seen);
// cluster redshift 0.18. The page keeps its given 47 arcseconds; this is shown beside it.
export const PUBLISHED_BROADHURST = { einsteinRadiusArcseconds: 50, clusterRedshift: 0.18 }
// Planck 2018 VI (arXiv:1807.06209), abstract: baryon density 0.0224 (Omega_b h^2), H0 = 67.4,
// matter density 0.315. The universal baryon fraction is worked out here from them.
export const PUBLISHED_PLANCK_BARYONS = { omegaBaryonH2: 0.0224, hubbleConstant: 67.4, omegaMatter: 0.315 }
// Gonzalez and others 2013 (arXiv:1309.3565), abstract: for M500 > 2e14 the total baryon fractions
// are on average 7% below the universal value from the Planck analysis.
export const PUBLISHED_GONZALEZ_BELOW_UNIVERSAL_PERCENT = 7
// NASA, "The Hubble constant and the tension" (4 August 2025), read for Cosmology 6: space
// telescopes about 70 to 76, the microwave background about 67 to 68.
export const PUBLISHED_NASA_HUBBLE_RANGES = {
  spaceTelescopes: { low: 70, high: 76 },
  microwaveBackground: { low: 67, high: 68 },
}

export type RingSizeGuess = 'larger' | 'same' | 'smaller'
export type FourTimesGuess = 'four' | 'two' | 'same'

// Guess 2 asks about four times the mass; the multiples of the ring that each answer stands for.
export const FOUR_TIMES_MASS_FACTOR = 4
export const GUESS_RING_MULTIPLES: Record<FourTimesGuess, number> = { four: 4, two: 2, same: 1 }
// Guess 1's arrow has a fixed length (in arcseconds on the sky picture) that means nothing as a number.
export const GUESS_ARROW_LENGTH_ARCSECONDS = 8

const SAME_TOLERANCE = 1e-9

// The mass the visible matter alone makes up (15% of the observed total).
export function visibleOnlyMassSolarMasses(): number {
  return VISIBLE_MASS_FRACTION * OBSERVED_TOTAL_MASS_SOLAR_MASSES
}
export function visibleOnlyRingArcseconds(): number {
  return einsteinRingArcseconds(visibleOnlyMassSolarMasses())
}

// ---- What the model actually gives (the tutor marks each guess; Results does not) ----------------

// Guess 1: the observed ring (more mass) against the visible-only ring (less mass).
export function actualRingSize(): RingSizeGuess {
  const ratio = einsteinRingArcseconds(OBSERVED_TOTAL_MASS_SOLAR_MASSES) / visibleOnlyRingArcseconds()
  if (Math.abs(ratio - 1) < SAME_TOLERANCE) return 'same'
  return ratio > 1 ? 'larger' : 'smaller'
}

// Guess 2: the ring for four times the visible mass, as a multiple of the visible-only ring, mapped to
// whichever answer (four times, twice, the same) it is closest to.
export function fourTimesRingMultiple(): number {
  return einsteinRingArcseconds(FOUR_TIMES_MASS_FACTOR * visibleOnlyMassSolarMasses()) / visibleOnlyRingArcseconds()
}
export function actualFourTimes(): FourTimesGuess {
  const multiple = fourTimesRingMultiple()
  const answers = Object.entries(GUESS_RING_MULTIPLES) as Array<[FourTimesGuess, number]>
  return answers.reduce((best, a) => (Math.abs(a[1] - multiple) < Math.abs(best[1] - multiple) ? a : best))[0]
}

export function ringSizeGuessMatches(guess: RingSizeGuess): boolean {
  return guess === actualRingSize()
}
export function fourTimesGuessMatches(guess: FourTimesGuess): boolean {
  return guess === actualFourTimes()
}

// ---- The white guess marks ---------------------------------------------------------------------------

// Guess 1 (marker only): an arrow starting on the visible-only ring pointing outward, inward, or a small
// ring on the ring for "the same size". The arrow's length is fixed.
export interface RingSizeGuessMarker {
  fromArcseconds: number
  toArcseconds: number
  kind: 'out' | 'in' | 'ring'
}
export function ringSizeGuessMarker(guess: RingSizeGuess): RingSizeGuessMarker {
  const from = visibleOnlyRingArcseconds()
  const to = guess === 'larger' ? from + GUESS_ARROW_LENGTH_ARCSECONDS : guess === 'smaller' ? from - GUESS_ARROW_LENGTH_ARCSECONDS : from
  return { fromArcseconds: from, toArcseconds: to, kind: guess === 'larger' ? 'out' : guess === 'smaller' ? 'in' : 'ring' }
}

// Guess 2: a white ring at the guessed multiple of the visible-only ring's radius, and a white point on
// the graph at four times the visible mass at that ring size.
export interface FourTimesGuessMark {
  multiple: number
  ringArcseconds: number
  massSolarMasses: number
}
export function fourTimesGuessMark(guess: FourTimesGuess): FourTimesGuessMark {
  const multiple = GUESS_RING_MULTIPLES[guess]
  return {
    multiple,
    ringArcseconds: multiple * visibleOnlyRingArcseconds(),
    massSolarMasses: FOUR_TIMES_MASS_FACTOR * visibleOnlyMassSolarMasses(),
  }
}

// The imagined counterpart (drawn in another colour and called "imagined"): the ring for four times the
// visible mass, and its point on the graph curve.
export interface ImaginedFourTimes {
  massSolarMasses: number
  ringArcseconds: number
}
export function imaginedFourTimes(): ImaginedFourTimes {
  const massSolarMasses = FOUR_TIMES_MASS_FACTOR * visibleOnlyMassSolarMasses()
  return { massSolarMasses, ringArcseconds: einsteinRingArcseconds(massSolarMasses) }
}

// What the tutor says about each guess: whether it matches, and the numbers it is compared with.
export interface RingSizeMarking {
  matches: boolean
  actual: RingSizeGuess
  visibleRingArcseconds: number
  observedRingArcseconds: number
}
export function markRingSizeGuess(guess: RingSizeGuess): RingSizeMarking {
  return {
    matches: ringSizeGuessMatches(guess),
    actual: actualRingSize(),
    visibleRingArcseconds: visibleOnlyRingArcseconds(),
    observedRingArcseconds: einsteinRingArcseconds(OBSERVED_TOTAL_MASS_SOLAR_MASSES),
  }
}
export interface FourTimesMarking {
  matches: boolean
  actual: FourTimesGuess
  visibleRingArcseconds: number
  fourTimesRingArcseconds: number
  multiple: number
}
export function markFourTimesGuess(guess: FourTimesGuess): FourTimesMarking {
  return {
    matches: fourTimesGuessMatches(guess),
    actual: actualFourTimes(),
    visibleRingArcseconds: visibleOnlyRingArcseconds(),
    fourTimesRingArcseconds: imaginedFourTimes().ringArcseconds,
    multiple: fourTimesRingMultiple(),
  }
}

// ---- Readings (no accepted range, so only "less", "more" or "the same") ----------------------------------

export type CheckUpReading = 'less' | 'more' | 'the same' | 'calculated here only'

export function readingAgainst(value: number, reference: number, uncertainty = 0): 'less' | 'more' | 'the same' {
  const difference = value - reference
  if (Math.abs(difference) <= uncertainty) return 'the same'
  return difference < 0 ? 'less' : 'more'
}

// (value - reference) / reference, in percent.
export function percentDifference(value: number, reference: number): number {
  return ((value - reference) / reference) * 100
}

// ---- The visible share worked out from two papers ------------------------------------------------------

export interface WorkedVisibleShare {
  universalPercent: number
  clusterPercent: number
}
// Universal baryon fraction = (Omega_b h^2 / h^2) / Omega_m with h = H0 / 100; clusters are 7% below it.
export function workedOutVisibleShare(): WorkedVisibleShare {
  const h = PUBLISHED_PLANCK_BARYONS.hubbleConstant / 100
  const universal = PUBLISHED_PLANCK_BARYONS.omegaBaryonH2 / (h * h) / PUBLISHED_PLANCK_BARYONS.omegaMatter
  return {
    universalPercent: universal * 100,
    clusterPercent: universal * (1 - PUBLISHED_GONZALEZ_BELOW_UNIVERSAL_PERCENT / 100) * 100,
  }
}

// ---- The check-up (Table 1): every row independent of the learner's Part 2 mass -----------------------

export interface CheckUpRow {
  // a: visible-only ring against the observed ring (arcseconds); b: the mass inside the observed ring
  // (solar masses); c: the visible share against the worked-out share (percent); d: the ring for four
  // times the visible mass against the visible-only ring (arcseconds).
  id: 'a' | 'b' | 'c' | 'd'
  thisPage: number
  beside: number | null
  difference: number | null
  reading: CheckUpReading
}
export function checkUp(): CheckUpRow[] {
  const visibleRing = visibleOnlyRingArcseconds()
  const observedRing = OBSERVED_RING_ARCSECONDS
  const share = workedOutVisibleShare().clusterPercent
  const pageShare = VISIBLE_MASS_FRACTION * 100
  const four = imaginedFourTimes().ringArcseconds
  return [
    { id: 'a', thisPage: visibleRing, beside: observedRing, difference: visibleRing - observedRing, reading: readingAgainst(visibleRing, observedRing) },
    { id: 'b', thisPage: massInsideRingSolarMasses(OBSERVED_RING_ARCSECONDS), beside: null, difference: null, reading: 'calculated here only' },
    { id: 'c', thisPage: pageShare, beside: share, difference: pageShare - share, reading: readingAgainst(pageShare, share) },
    { id: 'd', thisPage: four, beside: visibleRing, difference: four - visibleRing, reading: 'calculated here only' },
  ]
}

// ---- Table 2 and "What your numbers show": the learner's own mass (Part 2) ----------------------------------

export interface YourComparison {
  massSolarMasses: number
  ringArcseconds: number
  ringOverVisibleRing: number
  massOverVisibleMass: number
  againstObserved: { differenceArcseconds: number; reading: 'less' | 'more' | 'the same' }
  againstBroadhurst: { differenceArcseconds: number; reading: 'less' | 'more' | 'the same' }
}
export function yourComparison(massSolarMasses: number): YourComparison {
  const ring = einsteinRingArcseconds(massSolarMasses)
  return {
    massSolarMasses,
    ringArcseconds: ring,
    ringOverVisibleRing: ring / visibleOnlyRingArcseconds(),
    massOverVisibleMass: massSolarMasses / visibleOnlyMassSolarMasses(),
    againstObserved: { differenceArcseconds: ring - OBSERVED_RING_ARCSECONDS, reading: readingAgainst(ring, OBSERVED_RING_ARCSECONDS) },
    againstBroadhurst: {
      differenceArcseconds: ring - PUBLISHED_BROADHURST.einsteinRadiusArcseconds,
      reading: readingAgainst(ring, PUBLISHED_BROADHURST.einsteinRadiusArcseconds),
    },
  }
}

// ---- Worked examples quoted in the page -------------------------------------------------------------------

// A coin of a given width looks one arcsecond wide from this distance (km): width / (1 arcsecond in radians).
export function coinDistanceKm(coinWidthCm = 1): number {
  return coinWidthCm / 100 / (1 / ARCSECONDS_PER_RADIAN) / 1000
}

// The two real rings side by side, and the mass behind the observed one.
export interface RingComparisonExample {
  visibleRingArcseconds: number
  observedRingArcseconds: number
  differenceArcseconds: number
  ratio: number
  observedMassSolarMasses: number
  visibleMassSolarMasses: number
  massRatio: number
}
export function ringComparisonExample(): RingComparisonExample {
  const visible = visibleOnlyRingArcseconds()
  const observedMass = massInsideRingSolarMasses(OBSERVED_RING_ARCSECONDS)
  return {
    visibleRingArcseconds: visible,
    observedRingArcseconds: OBSERVED_RING_ARCSECONDS,
    differenceArcseconds: OBSERVED_RING_ARCSECONDS - visible,
    ratio: OBSERVED_RING_ARCSECONDS / visible,
    observedMassSolarMasses: observedMass,
    visibleMassSolarMasses: visibleOnlyMassSolarMasses(),
    massRatio: observedMass / visibleOnlyMassSolarMasses(),
  }
}

// The ring formula step by step (held until after the run: it shows the square root).
export interface RingFormulaExample {
  massSolarMasses: number
  gravitationalLengthKm: number
  fourGmOverC2Mpc: number
  distanceFactor: number
  radians: number
  arcseconds: number
}
export function ringFormulaExample(massSolarMasses: number = OBSERVED_TOTAL_MASS_SOLAR_MASSES): RingFormulaExample {
  const length = gravitationalLengthKm(massSolarMasses)
  const fourGmOverC2Mpc = (4 * length) / MPC_TO_KM
  const distanceFactor = LENS_TO_SOURCE_DISTANCE_MPC / (LENS_DISTANCE_MPC * SOURCE_DISTANCE_MPC)
  const radians = Math.sqrt(fourGmOverC2Mpc * distanceFactor)
  return { massSolarMasses, gravitationalLengthKm: length, fourGmOverC2Mpc, distanceFactor, radians, arcseconds: radians * ARCSECONDS_PER_RADIAN }
}

// The real bend at the ring's edge for the observed ring (arcseconds).
export function observedBendArcseconds(): number {
  return runGravitationalLensingExperiment(OBSERVED_TOTAL_MASS_SOLAR_MASSES).bendingAngleArcseconds
}
