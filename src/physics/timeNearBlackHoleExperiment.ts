import { KM_PER_AU, OBJECT_PRESETS, PUBLISHED, horizonRadiusKm, type ObjectPreset } from './blackHoleSizeExperiment'

// Simulated time on the far-away clock for one run. Presentation only: the factor does not depend on it.
export const FAR_CLOCK_RUN_SECONDS = 60
// The closest a clock can be placed. A clock cannot hover at or inside the horizon, so the controls stop short of 1.
export const MIN_DISTANCE_IN_HORIZON_RADII = 1.001
export const MAX_DISTANCE_IN_HORIZON_RADII = 100

const CURVE_POINTS = 101

// The three black holes only: Experiment 1's presets that have no real radius.
export const BLACK_HOLE_PRESETS: ObjectPreset[] = OBJECT_PRESETS.filter((p) => p.realRadiusKm === null)

// The exact slowing factor sqrt(1 - r_s / r) for a clock held at rest at distance r from a non-rotating, uncharged
// black hole, compared with a clock far away. Given by general relativity; used here, not derived. The distance is
// in horizon radii (r / r_s). Exactly 0 at the horizon; a clock cannot hover inside it.
export function exactSlowingFactor(distanceInHorizonRadii: number): number {
  if (!(distanceInHorizonRadii >= 1)) {
    throw new RangeError('A clock cannot hover inside the horizon: the distance must be at least 1 horizon radius.')
  }
  return Math.sqrt(1 - 1 / distanceInHorizonRadii)
}

// The first-order (weak-gravity) factor, 1 - r_s / (2r) = 1 - GM / (r c^2): the idea behind Gravity Experiments 2 and 9,
// restated in horizon radii. For comparison only; it is always above the exact factor.
export function firstOrderSlowingFactor(distanceInHorizonRadii: number): number {
  if (!(distanceInHorizonRadii > 0)) throw new RangeError('The distance must be greater than zero.')
  return 1 - 1 / (2 * distanceInHorizonRadii)
}

export interface TimeNearBlackHoleResult {
  preset: ObjectPreset
  horizonRadiusKm: number
  distanceInHorizonRadii: number
  distanceKm: number
  exactFactor: number
  firstOrderFactor: number
  farClockReadingSeconds: number
  hoveringClockReadingSeconds: number
  // Log-spaced from MIN to MAX horizon radii, ascending, for the factor-against-distance graph.
  curve: Array<{ distanceInHorizonRadii: number; exact: number; firstOrder: number }>
}

export function runTimeNearBlackHoleExperiment(
  presetId: ObjectPreset['id'],
  distanceInHorizonRadii: number,
): TimeNearBlackHoleResult {
  const preset = BLACK_HOLE_PRESETS.find((p) => p.id === presetId)
  if (!preset) throw new Error(`Unknown black hole: ${presetId}`)
  if (!(distanceInHorizonRadii >= MIN_DISTANCE_IN_HORIZON_RADII && distanceInHorizonRadii <= MAX_DISTANCE_IN_HORIZON_RADII)) {
    throw new RangeError(
      `The distance must be between ${MIN_DISTANCE_IN_HORIZON_RADII} and ${MAX_DISTANCE_IN_HORIZON_RADII} horizon radii.`,
    )
  }

  const horizon = horizonRadiusKm(preset.massSolarMasses)
  const exactFactor = exactSlowingFactor(distanceInHorizonRadii)

  const logMin = Math.log(MIN_DISTANCE_IN_HORIZON_RADII)
  const logMax = Math.log(MAX_DISTANCE_IN_HORIZON_RADII)
  const curve = Array.from({ length: CURVE_POINTS }, (_, i) => {
    // Pin the ends exactly so the curve starts and ends at the stated distances.
    const d =
      i === 0
        ? MIN_DISTANCE_IN_HORIZON_RADII
        : i === CURVE_POINTS - 1
          ? MAX_DISTANCE_IN_HORIZON_RADII
          : Math.exp(logMin + ((logMax - logMin) * i) / (CURVE_POINTS - 1))
    return { distanceInHorizonRadii: d, exact: exactSlowingFactor(d), firstOrder: firstOrderSlowingFactor(d) }
  })

  return {
    preset,
    horizonRadiusKm: horizon,
    distanceInHorizonRadii,
    distanceKm: distanceInHorizonRadii * horizon,
    exactFactor,
    firstOrderFactor: firstOrderSlowingFactor(distanceInHorizonRadii),
    farClockReadingSeconds: FAR_CLOCK_RUN_SECONDS,
    hoveringClockReadingSeconds: exactFactor * FAR_CLOCK_RUN_SECONDS,
    curve,
  }
}

// The two clocks' readings after an elapsed span of far-away time, for the animation and the graph.
export function clockReadingsAt(
  result: TimeNearBlackHoleResult,
  farElapsedSeconds: number,
): { far: number; hovering: number } {
  if (!(farElapsedSeconds >= 0)) throw new RangeError('Elapsed time must be zero or more.')
  return { far: farElapsedSeconds, hovering: result.exactFactor * farElapsedSeconds }
}

// Real surfaces for scale: the factor at an object's real radius, from the same formula. Defined for the three
// real objects of Experiment 1 (Earth, the Sun, a neutron star); the formula applies outside the surface.
export function surfaceSlowing(presetId: 'earth' | 'sun' | 'neutron-star'): {
  rsOverR: number
  exactFactor: number
  fractionSlower: number
} {
  const preset = OBJECT_PRESETS.find((p) => p.id === presetId)
  if (!preset || preset.realRadiusKm === null) throw new Error(`No real surface for: ${presetId}`)
  const distanceInHorizonRadii = preset.realRadiusKm / horizonRadiusKm(preset.massSolarMasses)
  const exactFactor = exactSlowingFactor(distanceInHorizonRadii)
  return { rsOverR: 1 / distanceInHorizonRadii, exactFactor, fractionSlower: 1 - exactFactor }
}

// ---------------------------------------------------------------------------------------------------------------
// Audit update (Black Holes 2): numbers for the white guess marks, the fixed Part 1 run, the check-up and the
// comparisons the interface and tutor used to work out themselves. No function here reads a prediction.
// ---------------------------------------------------------------------------------------------------------------

// Part 1 always runs the 10-Sun black hole with the hovering clock at 1.01 horizon radii (Prediction 1's distance).
export const PART_ONE_DISTANCE_IN_HORIZON_RADII = 1.01
export const PART_ONE_BLACK_HOLE_ID: ObjectPreset['id'] = 'stellar-black-hole'
// Prediction 2's distance, and the two black holes it compares.
export const COMPARISON_DISTANCE_IN_HORIZON_RADII = 2

export function runPartOne(): TimeNearBlackHoleResult {
  return runTimeNearBlackHoleExperiment(PART_ONE_BLACK_HOLE_ID, PART_ONE_DISTANCE_IN_HORIZON_RADII)
}

// Prediction 1: each button's answer as a rate (the height of the white mark above x = 1.01 on the factor graph).
export type JustOutsideGuess = 'same' | 'half' | 'tenth' | 'stopped'
export const JUST_OUTSIDE_GUESS_FACTOR: Record<JustOutsideGuess, number> = {
  same: 1,
  half: 0.5,
  tenth: 0.1,
  stopped: 0,
}
export function guessHeightForJustOutside(guess: JustOutsideGuess): number {
  return JUST_OUTSIDE_GUESS_FACTOR[guess]
}
// For the tutor only. A guess is the model's answer if it equals the real factor at 1.01 radii to the precision the
// choice is written in (one decimal: "about one tenth" for 0.0995).
export function justOutsideGuessIsModelAnswer(guess: JustOutsideGuess): boolean {
  return Math.round(exactSlowingFactor(PART_ONE_DISTANCE_IN_HORIZON_RADII) * 10) / 10 === JUST_OUTSIDE_GUESS_FACTOR[guess]
}

// Prediction 2: the two real bars (10-Sun hole and M87*) at 2 horizon radii, the same ratio around each.
export interface HoleAtTwoRadii {
  preset: ObjectPreset
  horizonRadiusKm: number
  distanceKm: number
  factor: number
}
export function twoHolesAtTwoRadii(): { small: HoleAtTwoRadii; giant: HoleAtTwoRadii } {
  const at = (id: ObjectPreset['id']): HoleAtTwoRadii => {
    const r = runTimeNearBlackHoleExperiment(id, COMPARISON_DISTANCE_IN_HORIZON_RADII)
    return { preset: r.preset, horizonRadiusKm: r.horizonRadiusKm, distanceKm: r.distanceKm, factor: r.exactFactor }
  }
  return { small: at('stellar-black-hole'), giant: at('m87-star') }
}

export type MassGuess = 'small' | 'giant' | 'same'
// The slower clock is the one with the smaller factor; "same" if the two factors agree.
export function massGuessIsModelAnswer(guess: MassGuess): boolean {
  const { small, giant } = twoHolesAtTwoRadii()
  const same = Math.abs(small.factor - giant.factor) < 1e-12
  if (same) return guess === 'same'
  return guess === (small.factor < giant.factor ? 'small' : 'giant')
}

// Prediction 3: the simple formula's error. "Accurate" means within this many percent; it is the same tolerance as
// the specification's GPS test (within 1%), chosen here only to mark the three choices, not a physical limit.
export const APPROXIMATION_ACCURATE_WITHIN_PERCENT = 1
export const FAR_DISTANCE_IN_HORIZON_RADII = 10

export type ApproximationGuess = 'still-accurate' | 'worse-closer' | 'never-accurate'

// How much too high the simple formula is, as a percent of the exact factor. Infinite at the horizon (exact is 0).
export function percentTooHigh(distanceInHorizonRadii: number): number {
  const exact = exactSlowingFactor(distanceInHorizonRadii)
  return ((firstOrderSlowingFactor(distanceInHorizonRadii) - exact) / exact) * 100
}
// How many times as large the simple formula's value is as the exact one.
export function timesAsMuch(distanceInHorizonRadii: number): number {
  return firstOrderSlowingFactor(distanceInHorizonRadii) / exactSlowingFactor(distanceInHorizonRadii)
}
export function approximationGuessIsModelAnswer(guess: ApproximationGuess): boolean {
  const accurateFar = percentTooHigh(FAR_DISTANCE_IN_HORIZON_RADII) <= APPROXIMATION_ACCURATE_WITHIN_PERCENT
  const accurateNear = percentTooHigh(PART_ONE_DISTANCE_IN_HORIZON_RADII) <= APPROXIMATION_ACCURATE_WITHIN_PERCENT
  const truth: ApproximationGuess =
    accurateFar && accurateNear ? 'still-accurate' : accurateFar ? 'worse-closer' : 'never-accurate'
  return guess === truth
}

// A plain reading of one number against a reference: no cut-offs, only "the same", "more" or "less".
export type Reading = 'the same' | 'more' | 'less'
export function readAgainst(found: number, reference: number): Reading {
  if (Math.abs(found - reference) <= 1e-9 * Math.max(Math.abs(reference), 1e-300)) return 'the same'
  return found > reference ? 'more' : 'less'
}

export interface SimpleAgainstExactRow {
  distanceInHorizonRadii: number
  exact: number
  simple: number
  percentMore: number
  timesAsMuch: number
  // The simple formula's value read against the exact one.
  reading: Reading
}
export const CHECK_UP_DISTANCES = [10, 2, 1.01]
export function simpleAgainstExactRows(): SimpleAgainstExactRow[] {
  return CHECK_UP_DISTANCES.map((d) => ({
    distanceInHorizonRadii: d,
    exact: exactSlowingFactor(d),
    simple: firstOrderSlowingFactor(d),
    percentMore: percentTooHigh(d),
    timesAsMuch: timesAsMuch(d),
    reading: readAgainst(firstOrderSlowingFactor(d), exactSlowingFactor(d)),
  }))
}

// The one row with a reference outside this page. The simple formula's gravity-only effect on a GPS satellite's
// clock for the same Earth (Experiment 1's mass and radius) and a GPS orbit (20,200 km up), in microseconds per day,
// against NIST's published figure (the NIST page says "45 microseconds per day"; it gives a whole number).
export const GPS_ORBITAL_RADIUS_KM = 26_571
export const SECONDS_PER_DAY = 86_400
export const PUBLISHED_GPS_GRAVITY_MICROSECONDS_PER_DAY = 45
export function simpleFormulaGpsGravityMicrosecondsPerDay(): number {
  const earth = OBJECT_PRESETS.find((p) => p.id === 'earth')
  if (!earth || earth.realRadiusKm === null) throw new Error('Earth preset missing')
  const rs = horizonRadiusKm(earth.massSolarMasses)
  const effect = firstOrderSlowingFactor(GPS_ORBITAL_RADIUS_KM / rs) - firstOrderSlowingFactor(earth.realRadiusKm / rs)
  return effect * SECONDS_PER_DAY * 1e6
}
export function gpsCheckUpRow(): { found: number; published: number; percentDifference: number; reading: Reading } {
  const found = simpleFormulaGpsGravityMicrosecondsPerDay()
  const published = PUBLISHED_GPS_GRAVITY_MICROSECONDS_PER_DAY
  return { found, published, percentDifference: ((found - published) / published) * 100, reading: readAgainst(found, published) }
}

// How far out the star S2 came at its closest approach to Sgr A* in 2018, in Sgr A*'s horizon radii. ESO (eso1825)
// says "less than 20 billion kilometres", so this is an upper bound. Held back from the page until the owner approves it.
export const S2_CLOSEST_APPROACH_KM_UPPER_BOUND = 20e9
export function s2ClosestApproachInHorizonRadiiUpperBound(): number {
  const sgr = OBJECT_PRESETS.find((p) => p.id === 'sgr-a-star')
  if (!sgr) throw new Error('Sgr A* preset missing')
  return S2_CLOSEST_APPROACH_KM_UPPER_BOUND / horizonRadiusKm(sgr.massSolarMasses)
}

// ---------------------------------------------------------------------------------------------------------------
// Arithmetic for the introduction's "Clocks really do tick at different rates" section. The published figures (a fractional
// difference of 10^-19, 38 microseconds per day) come from NIST's pages; these functions only turn them into everyday sizes.
// ---------------------------------------------------------------------------------------------------------------
export const SECONDS_PER_YEAR = 365.25 * SECONDS_PER_DAY
export const SPEED_OF_LIGHT_KM_PER_SECOND = 299_792.458

// How many years two clocks whose rates differ by this fraction need before they disagree by one full second.
export function yearsToDriftOneSecond(fractionalRateDifference: number): number {
  if (!(fractionalRateDifference > 0)) throw new RangeError('The difference in rates must be greater than zero.')
  return 1 / fractionalRateDifference / SECONDS_PER_YEAR
}

// How far light travels, in km, in the given number of microseconds (a timing error of that size is a distance error of that size).
export function lightDistanceKm(microseconds: number): number {
  if (!(microseconds >= 0)) throw new RangeError('The time must be zero or more.')
  return (microseconds * 1e-6) * SPEED_OF_LIGHT_KM_PER_SECOND
}

// ---------------------------------------------------------------------------------------------------------------
// Numbers for the introduction's "Why a black hole is the strongest test" section: how strong gravity is, as the speed needed to
// leave it for good (the escape speed), and how big the horizons of the page's black holes are against familiar things. The escape
// speeds are NASA's fact-sheet figures already used in Black Holes 1; nothing here is a result of this experiment.
// ---------------------------------------------------------------------------------------------------------------
export const NEPTUNE_ORBIT_AU = 30

export interface EscapeSpeedLadder {
  earthKmPerSecond: number
  earthKmPerHour: number
  sunKmPerSecond: number
  lightKmPerSecond: number
  sunOverEarth: number
  lightOverSun: number
  lightOverEarth: number
}
export function escapeSpeedLadder(): EscapeSpeedLadder {
  const earth = PUBLISHED.earthEscapeSpeedKmPerS
  const sun = PUBLISHED.sunEscapeSpeedKmPerS
  const light = SPEED_OF_LIGHT_KM_PER_SECOND
  return {
    earthKmPerSecond: earth,
    earthKmPerHour: earth * 3600,
    sunKmPerSecond: sun,
    lightKmPerSecond: light,
    sunOverEarth: sun / earth,
    lightOverSun: light / sun,
    lightOverEarth: light / earth,
  }
}

export interface HorizonComparisons {
  stellarHorizonKm: number
  sgrAHorizonKm: number
  sgrAHorizonAu: number
  sgrAHorizonInSunRadii: number
  m87HorizonKm: number
  m87HorizonAu: number
  m87HorizonInNeptuneOrbits: number
}
export function horizonComparisons(): HorizonComparisons {
  const mass = (id: ObjectPreset['id']) => OBJECT_PRESETS.find((p) => p.id === id)!.massSolarMasses
  const sgrA = horizonRadiusKm(mass('sgr-a-star'))
  const m87 = horizonRadiusKm(mass('m87-star'))
  return {
    stellarHorizonKm: horizonRadiusKm(mass('stellar-black-hole')),
    sgrAHorizonKm: sgrA,
    sgrAHorizonAu: sgrA / KM_PER_AU,
    sgrAHorizonInSunRadii: sgrA / PUBLISHED.sunRadiusKm,
    m87HorizonKm: m87,
    m87HorizonAu: m87 / KM_PER_AU,
    m87HorizonInNeptuneOrbits: m87 / KM_PER_AU / NEPTUNE_ORBIT_AU,
  }
}
