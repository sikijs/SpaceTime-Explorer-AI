import { timeDilationFactorFor } from './movingClockExperiment'

// Real Earth/physical constants, in SI units — unlike every experiment before this one in this
// project, which uses abstracted or exaggerated dimensionless controls (see this experiment's
// specification, "Decisions Confirmed" item 1).
export const EARTH_GM = 3.986004418e14 // m^3 / s^2 (standard gravitational parameter, GM)
export const EARTH_RADIUS_METERS = 6.371e6 // m (mean Earth radius)
export const REAL_SPEED_OF_LIGHT = 299_792_458 // m / s

// The altitude at which the speed effect and the gravity effect exactly cancel, for a circular
// orbit under this experiment's first-order approximation. Solving
// gravityEffectFraction(r) = -speedEffectFraction(r) with a circular orbit's v^2 = EARTH_GM / r
// reduces to 1/EARTH_RADIUS_METERS = 3 / (2r), i.e. r = 1.5 * EARTH_RADIUS_METERS exactly.
export const CROSSOVER_ORBITAL_RADIUS_METERS = 1.5 * EARTH_RADIUS_METERS

export interface GpsTimeDilationResult {
  orbitalRadiusMeters: number
  orbitalSpeedMetersPerSecond: number
  speedEffectFraction: number
  gravityEffectFraction: number
  netEffectFraction: number
  netMicrosecondsPerDay: number
}

const SECONDS_PER_DAY = 86400
const MICROSECONDS_PER_SECOND = 1_000_000

export function runGpsTimeDilationExperiment(orbitalRadiusMeters: number): GpsTimeDilationResult {
  if (!(orbitalRadiusMeters > EARTH_RADIUS_METERS)) {
    throw new RangeError('Orbital radius must be greater than Earth\'s radius')
  }

  const orbitalSpeedMetersPerSecond = Math.sqrt(EARTH_GM / orbitalRadiusMeters)

  // Reuses Experiment 3's exact time-dilation formula directly (Decisions Confirmed item 2),
  // evaluated at the real, tiny v/c ratio rather than an exaggerated one.
  const speedEffectFraction =
    timeDilationFactorFor(orbitalSpeedMetersPerSecond / REAL_SPEED_OF_LIGHT) - 1

  // First-order (weak-field) Newtonian-potential difference between the satellite and the
  // ground: the real-unit counterpart to Experiment 2's abstracted `strength` control.
  const gravityEffectFraction =
    (EARTH_GM * (1 / EARTH_RADIUS_METERS - 1 / orbitalRadiusMeters)) /
    (REAL_SPEED_OF_LIGHT * REAL_SPEED_OF_LIGHT)

  const netEffectFraction = gravityEffectFraction + speedEffectFraction
  const netMicrosecondsPerDay = netEffectFraction * SECONDS_PER_DAY * MICROSECONDS_PER_SECOND

  return {
    orbitalRadiusMeters,
    orbitalSpeedMetersPerSecond,
    speedEffectFraction,
    gravityEffectFraction,
    netEffectFraction,
    netMicrosecondsPerDay,
  }
}

// ---------------------------------------------------------------------------------------------
// Audit update, 2026-11-13: what the page's pictures, tables and guess marks need. Nothing above
// this line changes; every number below comes from runGpsTimeDilationExperiment.
// ---------------------------------------------------------------------------------------------

export const ALTITUDE_MIN_KM = 300
export const ALTITUDE_MAX_KM = 36_000
export const ALTITUDE_STEP_KM = 10
export const DEFAULT_ALTITUDE_KM = 20_200
// Part 1's three orbits, and Part 2's preset buttons.
export const ORBIT_PRESETS_KM = { iss: 400, gps: 20_200, geostationary: 35_786 } as const

export type MoreLessSameChoice = 'more' | 'less' | 'same'
export type YesNoChoice = 'yes' | 'no'

export function altitudeToRadiusMeters(altitudeKm: number): number {
  return EARTH_RADIUS_METERS + altitudeKm * 1000
}

export function microsecondsPerDay(fraction: number): number {
  return fraction * SECONDS_PER_DAY * MICROSECONDS_PER_SECOND
}

// The altitude (km above the surface) where the two effects cancel: 1.5 Earth radii from the
// centre, so half an Earth radius up.
export function balanceAltitudeKm(): number {
  return (CROSSOVER_ORBITAL_RADIUS_METERS - EARTH_RADIUS_METERS) / 1000
}

export interface OrbitSummary {
  altitudeKm: number
  radiusKm: number
  speedKmPerSecond: number
  speedKmPerHour: number
  speedEffectMicrosecondsPerDay: number // negative: the speed slows the clock
  gravityEffectMicrosecondsPerDay: number // positive: height speeds the clock up
  netMicrosecondsPerDay: number
  netFraction: number
}

export function orbitSummary(altitudeKm: number): OrbitSummary {
  const r = runGpsTimeDilationExperiment(altitudeToRadiusMeters(altitudeKm))
  return {
    altitudeKm,
    radiusKm: r.orbitalRadiusMeters / 1000,
    speedKmPerSecond: r.orbitalSpeedMetersPerSecond / 1000,
    speedKmPerHour: (r.orbitalSpeedMetersPerSecond / 1000) * 3600,
    speedEffectMicrosecondsPerDay: microsecondsPerDay(r.speedEffectFraction),
    gravityEffectMicrosecondsPerDay: microsecondsPerDay(r.gravityEffectFraction),
    netMicrosecondsPerDay: r.netMicrosecondsPerDay,
    netFraction: r.netEffectFraction,
  }
}

// The three effects at every altitude from `from` up to `to`, for the graph's curves.
export function effectSweep(
  from: number = ALTITUDE_MIN_KM,
  to: number = ALTITUDE_MAX_KM,
  step: number = 100
): OrbitSummary[] {
  const out: OrbitSummary[] = []
  const count = Math.round((to - from) / step)
  for (let i = 0; i <= count; i += 1) out.push(orbitSummary(from + i * step))
  return out
}

// ---- the three white guess marks ------------------------------------------------------------
// None of these follows a real value. A direction, a yes or no, or faster/slower, has no size of
// its own, so each mark's size and position are fixed and mean nothing; the caption says so.
export const GUESS_LINE_ALTITUDES_KM = { from: 6_000, to: 16_000 } as const
export const GUESS_LINE_TILT_MICROSECONDS = 6
export const GUESS_FLAG_ALTITUDE_KM = 26_500
// The trend line sits this far below the speed curve (beside it, not on it); the distance means nothing.
export const GUESS_LINE_OFFSET_MICROSECONDS = -10
export const GUESS_RING_ALTITUDE_KM = ORBIT_PRESETS_KM.gps
export const GUESS_RING_HEIGHT_MICROSECONDS = 20

export interface GuessMarkers {
  // Guess 1: a short straight line beside the speed curve; 'more' = a bigger slowing (down to the
  // right), 'less' = a smaller slowing (up to the right), 'same' = flat. Only its direction counts.
  speedTrend: {
    choice: MoreLessSameChoice
    altitudeFromKm: number
    altitudeToKm: number
    microsecondsFrom: number
    microsecondsTo: number
  }
  // Guess 2: a flag on the zero line, only a marker.
  balance: { choice: YesNoChoice; altitudeKm: number; microseconds: number }
  // Guess 3: a ring above ('more' = faster), below ('less' = slower) or on the zero line, at the
  // GPS altitude. Its height means nothing.
  gpsClock: { choice: MoreLessSameChoice; altitudeKm: number; microseconds: number }
}

export function guessMarkers(
  speedGuess: MoreLessSameChoice,
  balanceGuess: YesNoChoice,
  gpsGuess: MoreLessSameChoice
): GuessMarkers {
  // Centre the trend line just below the speed curve at the midpoint altitude, so it lands beside it.
  const midAltitude = (GUESS_LINE_ALTITUDES_KM.from + GUESS_LINE_ALTITUDES_KM.to) / 2
  const mid = orbitSummary(midAltitude).speedEffectMicrosecondsPerDay + GUESS_LINE_OFFSET_MICROSECONDS
  const drop =
    speedGuess === 'more'
      ? -GUESS_LINE_TILT_MICROSECONDS
      : speedGuess === 'less'
        ? GUESS_LINE_TILT_MICROSECONDS
        : 0
  const ring =
    gpsGuess === 'more'
      ? GUESS_RING_HEIGHT_MICROSECONDS
      : gpsGuess === 'less'
        ? -GUESS_RING_HEIGHT_MICROSECONDS
        : 0
  return {
    speedTrend: {
      choice: speedGuess,
      altitudeFromKm: GUESS_LINE_ALTITUDES_KM.from,
      altitudeToKm: GUESS_LINE_ALTITUDES_KM.to,
      microsecondsFrom: mid - drop / 2,
      microsecondsTo: mid + drop / 2,
    },
    balance: { choice: balanceGuess, altitudeKm: GUESS_FLAG_ALTITUDE_KM, microseconds: 0 },
    gpsClock: { choice: gpsGuess, altitudeKm: GUESS_RING_ALTITUDE_KM, microseconds: ring },
  }
}

// ---- the tutor's marking (for the tutor only, after the learner has reasoned) ---------------
export interface TutorMarking {
  speedTrend: {
    guess: MoreLessSameChoice
    actual: MoreLessSameChoice // 'less' = a smaller slowing as the orbit rises
    matches: boolean
    issMicroseconds: number
    geostationaryMicroseconds: number
  }
  balance: { guess: YesNoChoice; actual: YesNoChoice; matches: boolean; altitudeKm: number }
  gpsClock: {
    guess: MoreLessSameChoice
    actual: MoreLessSameChoice // 'more' = faster
    matches: boolean
    speedMicroseconds: number
    gravityMicroseconds: number
    netMicroseconds: number
  }
}

function compare(a: number, b: number): MoreLessSameChoice {
  if (Math.abs(a - b) < 1e-9 * Math.max(1, Math.abs(a), Math.abs(b))) return 'same'
  return a > b ? 'more' : 'less'
}

// Whether the net effect changes sign somewhere on the slider's range.
export function hasBalanceAltitude(): boolean {
  const low = orbitSummary(ALTITUDE_MIN_KM).netMicrosecondsPerDay
  const high = orbitSummary(ALTITUDE_MAX_KM).netMicrosecondsPerDay
  return low < 0 && high > 0
}

export function tutorMarking(
  speedGuess: MoreLessSameChoice,
  balanceGuess: YesNoChoice,
  gpsGuess: MoreLessSameChoice
): TutorMarking {
  const iss = orbitSummary(ORBIT_PRESETS_KM.iss)
  const gps = orbitSummary(ORBIT_PRESETS_KM.gps)
  const geo = orbitSummary(ORBIT_PRESETS_KM.geostationary)
  // Compare the SIZE of the slowing (a bigger slowing is a more negative number).
  const speedActual = compare(
    Math.abs(geo.speedEffectMicrosecondsPerDay),
    Math.abs(iss.speedEffectMicrosecondsPerDay)
  )
  const balanceActual: YesNoChoice = hasBalanceAltitude() ? 'yes' : 'no'
  const gpsActual = compare(gps.netMicrosecondsPerDay, 0)
  return {
    speedTrend: {
      guess: speedGuess,
      actual: speedActual,
      matches: speedGuess === speedActual,
      issMicroseconds: iss.speedEffectMicrosecondsPerDay,
      geostationaryMicroseconds: geo.speedEffectMicrosecondsPerDay,
    },
    balance: {
      guess: balanceGuess,
      actual: balanceActual,
      matches: balanceGuess === balanceActual,
      altitudeKm: balanceAltitudeKm(),
    },
    gpsClock: {
      guess: gpsGuess,
      actual: gpsActual,
      matches: gpsGuess === gpsActual,
      speedMicroseconds: gps.speedEffectMicrosecondsPerDay,
      gravityMicroseconds: gps.gravityEffectMicrosecondsPerDay,
      netMicroseconds: gps.netMicrosecondsPerDay,
    },
  }
}

// ---- the check-up table (Part 3, Table 2) ---------------------------------------------------
// Published, from N. Ashby, "Relativity in the Global Positioning System", Living Reviews in
// Relativity 6 (2003), 1 (doi 10.12942/lrr-2003-1), Section 5, read 2026-11-13 through a helper's
// short quotes (to be re-checked against the live page): the net fractional rate of a GPS clock
// against a clock on the rotating geoid is -4.4647e-10 ("the standard clock in orbit is beating
// too fast"), and "the effects cancel at a ~ 9545 km" from Earth's centre. Ashby's ground clock
// is on the spinning Earth; this page's is on a non-spinning ball of mean radius, so the numbers
// are expected to be close, not equal.
export const ASHBY_PUBLISHED = { netFractionFaster: 4.4647e-10, balanceRadiusKm: 9545 } as const

export interface NumberCheckRow {
  expected: number
  found: number
  percentApart: number
}

export function netFractionCheck(): NumberCheckRow {
  const found = orbitSummary(ORBIT_PRESETS_KM.gps).netFraction
  const expected = ASHBY_PUBLISHED.netFractionFaster
  return { expected, found, percentApart: (Math.abs(found - expected) / expected) * 100 }
}

export function balanceRadiusCheck(): NumberCheckRow {
  const found = CROSSOVER_ORBITAL_RADIUS_METERS / 1000
  const expected = ASHBY_PUBLISHED.balanceRadiusKm
  return { expected, found, percentApart: (Math.abs(found - expected) / expected) * 100 }
}

export interface DirectionCheckRow {
  expected: 'faster' | 'slower'
  found: 'faster' | 'slower'
  same: boolean
}

// Row 3: a GPS satellite's clock runs faster than a ground clock (Ashby 2003; NASA Space Place).
export function gpsDirectionCheck(): DirectionCheckRow {
  const found = orbitSummary(ORBIT_PRESETS_KM.gps).netMicrosecondsPerDay > 0 ? 'faster' : 'slower'
  return { expected: 'faster', found, same: found === 'faster' }
}

// Row 4: for a low orbit the speed effect wins, so the clock runs slower (Ashby 2003, a Space
// Shuttle orbit). The ISS orbit is the page's low orbit.
export function lowOrbitDirectionCheck(): DirectionCheckRow {
  const found = orbitSummary(ORBIT_PRESETS_KM.iss).netMicrosecondsPerDay < 0 ? 'slower' : 'faster'
  return { expected: 'slower', found, same: found === 'slower' }
}

// ---- a clock error as a distance, and the worked numbers ------------------------------------
// Light travels about 300 m in a microsecond.
export function distanceEquivalentKm(microseconds: number): number {
  return (microseconds * 1e-6 * REAL_SPEED_OF_LIGHT) / 1000
}

// Ashby (2003), Section 1: "Timing errors of one ns will lead to positioning errors of the order
// of 30 cm" (a short quote read through a helper; to be re-checked).
export const ASHBY_METRES_PER_NANOSECOND = 0.3

export function ashbyDistanceKm(microseconds: number): number {
  return (microseconds * 1000 * ASHBY_METRES_PER_NANOSECOND) / 1000
}

export interface WorkedNumbers {
  altitudeKm: number
  radiusMeters: number
  speedMetersPerSecond: number
  // The page's worked formulas, step by step.
  speedFractionApprox: number // -v^2 / (2 c^2)
  gmOverCSquaredMeters: number // GM / c^2
  inverseRadiusDifferencePerMeter: number // 1/R - 1/r
  gravityFractionApprox: number // GM (1/R - 1/r) / c^2
  speedMicroseconds: number
  gravityMicroseconds: number
  netMicroseconds: number
}

export function workedNumbers(altitudeKm: number = ORBIT_PRESETS_KM.gps): WorkedNumbers {
  const radius = altitudeToRadiusMeters(altitudeKm)
  const s = runGpsTimeDilationExperiment(radius)
  const v = s.orbitalSpeedMetersPerSecond
  const c2 = REAL_SPEED_OF_LIGHT * REAL_SPEED_OF_LIGHT
  const gmOverC2 = EARTH_GM / c2
  const inv = 1 / EARTH_RADIUS_METERS - 1 / radius
  return {
    altitudeKm,
    radiusMeters: radius,
    speedMetersPerSecond: v,
    speedFractionApprox: -(v * v) / (2 * c2),
    gmOverCSquaredMeters: gmOverC2,
    inverseRadiusDifferencePerMeter: inv,
    gravityFractionApprox: gmOverC2 * inv,
    speedMicroseconds: microsecondsPerDay(s.speedEffectFraction),
    gravityMicroseconds: microsecondsPerDay(s.gravityEffectFraction),
    netMicroseconds: s.netMicrosecondsPerDay,
  }
}
