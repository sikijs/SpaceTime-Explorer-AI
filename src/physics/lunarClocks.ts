// Frontier and Beyond, Experiment 10: does time tick faster on the Moon? Lunar clocks.
// See docs/experiments/frontier-and-beyond/10-does-time-tick-faster-on-the-moon.md, "Physics Model".
//
// No new physics beyond the weak-field clock-rate formula of Gravity Experiments 2, 3 and 9: compared with a clock far from everything, a clock
// ticks slower by the fraction  potential / c^2 + speed^2 / (2 c^2). The potential is the sum of GM / distance for each body that matters, and the
// terms are added as small fractions. This module uses mean values (the Moon at its mean distance and mean orbital speed), spherical bodies and no
// Sun: it does not model the real, slowly changing rate over a month, and it does not define a lunar time scale. The published number it is checked
// against is NIST's 56.02 microseconds a day (Ashby and Patla, 2024).

// Constants, in SI units.
export const SPEED_OF_LIGHT = 299_792_458 // m/s (exact, by the definition of the metre)
export const SECONDS_PER_DAY = 86_400
export const DAYS_PER_MONTH = 30.4375 // a twelfth of a year of 365.25 days
export const DAYS_PER_YEAR = 365.25

// The Earth (NASA's Earth fact sheet: equatorial radius 6,378.137 km, GM 0.39860 x 10^6 km^3/s^2, sidereal rotation 23.9345 hours; the extra digits of GM are a
// standard value).
export const EARTH = {
  gm: 3.986004418e14, // m^3/s^2
  equatorialRadius: 6.378137e6, // m
  rotation: 7.2921159e-5, // rad/s
}

// The Moon (NASA's Moon fact sheet: mean radius 1,737.4 km, GM 0.00490 x 10^6 km^3/s^2, mean orbital velocity 1.022 km/s, semimajor axis 0.3844 x 10^6 km,
// sidereal rotation 655.72 hours; the extra digits of GM are a standard value).
export const MOON = {
  gm: 4.9028e12, // m^3/s^2
  radius: 1.7374e6, // m, the volumetric mean radius
  meanDistance: 3.844e8, // m, centre to centre (the semimajor axis)
  orbitalSpeed: 1.022e3, // m/s, the mean orbital speed around the Earth
  rotation: (2 * Math.PI) / (655.72 * 3600), // rad/s
}

// Places on the Earth's side that the experiment uses.
export const GPS_ALTITUDE_M = 2.02e7 // m, about 20,200 km (a GPS satellite)
export const GEOSTATIONARY_RADIUS_M = 4.2164e7 // m, from the Earth's centre

// NIST's published value (Ashby and Patla, The Astronomical Journal, 12 August 2024; abstract only was read): a clock near the Moon's equator against one near
// the Earth's equator.
export const NIST_2024 = {
  gainMicrosecondsPerDay: 56.02,
  source: 'Ashby and Patla, The Astronomical Journal (12 August 2024)',
}

function requireNonNegative(value: number, what: string): void {
  if (!Number.isFinite(value) || value < 0) throw new RangeError(`${what} must not be negative`)
}
function requirePositive(value: number, what: string): void {
  if (!Number.isFinite(value) || value <= 0) throw new RangeError(`${what} must be positive`)
}

const c2 = SPEED_OF_LIGHT * SPEED_OF_LIGHT

// The fractions by which a clock ticks slower than one far from everything.
export interface Terms {
  gravityOwn: number // from the gravity of the body that the clock sits on or orbits
  gravityOther: number // from the other body's pull (the Earth's pull at the Moon)
  speed: number // from the clock's motion
  total: number // the three added
}
function terms(gravityOwn: number, gravityOther: number, speed: number): Terms {
  return { gravityOwn, gravityOther, speed, total: gravityOwn + gravityOther + speed }
}

// A clock on the Earth's equator: the Earth's gravity at its surface, and its spin.
export function earthEquatorTerms(): Terms {
  const spinSpeed = EARTH.rotation * EARTH.equatorialRadius
  return terms(EARTH.gm / (EARTH.equatorialRadius * c2), 0, (spinSpeed * spinSpeed) / (2 * c2))
}

// A clock on the Moon's surface: the Moon's gravity, the Earth's pull at the Moon's distance, and the Moon's speed round the Earth (with its own spin, whose
// square adds to the mean square of the speed, because the two directions are unrelated over a lunar day).
export function moonSurfaceTerms(): Terms {
  const spinSpeed = MOON.rotation * MOON.radius
  const speedSquared = MOON.orbitalSpeed * MOON.orbitalSpeed + spinSpeed * spinSpeed
  return terms(MOON.gm / (MOON.radius * c2), EARTH.gm / (MOON.meanDistance * c2), speedSquared / (2 * c2))
}

// A clock in a circular orbit round the Earth at an altitude above the equatorial radius: gravity GM / (r c^2) and the orbital speed GM / r, so a speed term
// of GM / (2 r c^2).
export function earthOrbitTerms(altitudeM: number): Terms {
  requireNonNegative(altitudeM, 'The altitude')
  const r = EARTH.equatorialRadius + altitudeM
  return terms(EARTH.gm / (r * c2), 0, EARTH.gm / (2 * r * c2))
}

// A clock in a circular orbit round the Moon at an altitude above its mean radius: the Moon's gravity, the Earth's pull at the Moon, and a speed term from the
// Moon's own motion round the Earth plus the orbital speed round the Moon (the cross term averages to zero over an orbit).
export function moonOrbitTerms(altitudeM: number): Terms {
  requireNonNegative(altitudeM, 'The altitude')
  const r = MOON.radius + altitudeM
  const speedSquared = MOON.orbitalSpeed * MOON.orbitalSpeed + MOON.gm / r
  return terms(MOON.gm / (r * c2), EARTH.gm / (MOON.meanDistance * c2), speedSquared / (2 * c2))
}

// How many microseconds a day a clock gains on a reference clock (negative: it loses): the difference of their lowerings, times the seconds in a day.
export function gainMicrosecondsPerDay(reference: Terms, clock: Terms): number {
  return (reference.total - clock.total) * SECONDS_PER_DAY * 1e6
}

// The gap, in seconds, that builds up after a time, for the same gain.
export function gapSeconds(reference: Terms, clock: Terms, seconds: number): number {
  requireNonNegative(seconds, 'The time')
  return (reference.total - clock.total) * seconds
}

// The altitude above the Moon at which a clock in orbit ticks at the same rate as one on the surface: the gravity gain GM (1/R - 1/r) / c^2 equals the speed
// loss GM / (2 r c^2), which gives r = 1.5 R, an altitude of half a Moon radius (the same 1.5 radii as the GPS experiment's crossover for the Earth). The match is
// exact when the Moon's spin is ignored; the spin (a term of 1.2e-16, in the surface clock only) leaves a residual of about 1e-5 microseconds a day.
export function moonOrbitCrossoverAltitude(): number {
  return 0.5 * MOON.radius
}

// For the predictions' answers.
export type Direction = 'slower' | 'same' | 'faster'
export function directionOf(gainMicroseconds: number): Direction {
  if (!Number.isFinite(gainMicroseconds)) throw new RangeError('The gain must be a number')
  if (Math.abs(gainMicroseconds) < 1e-6) return 'same'
  return gainMicroseconds > 0 ? 'faster' : 'slower'
}

export type TimeScale = 'millisecond' | 'microsecond' | 'nanosecond'
// The unit in which the number is at least 1 (so 55.97 microseconds is "about 56 microseconds", and not "about 0.06 milliseconds"), which is how the predictions'
// answer buttons are written ("About 56 nanoseconds / microseconds / milliseconds").
export function timeScale(seconds: number): TimeScale {
  requirePositive(seconds, 'The time')
  if (seconds >= 1e-3) return 'millisecond'
  if (seconds >= 1e-6) return 'microsecond'
  return 'nanosecond'
}

// The answers to the two predictions (the specification's "Prediction Activity"), from the module's own numbers.
// Prediction 1: does a clock on the Moon tick slower, at the same rate or faster than one on the Earth? Prediction 2: how far apart after one day?
export function directionAnswer(): Direction {
  return directionOf(gainMicrosecondsPerDay(earthEquatorTerms(), moonSurfaceTerms()))
}
export function sizeAnswer(): TimeScale {
  return timeScale((gainMicrosecondsPerDay(earthEquatorTerms(), moonSurfaceTerms()) * 1e-6))
}

// The learner's place.
export type Place = 'earthEquator' | 'earthOrbit' | 'gps' | 'geostationary' | 'moonSurface' | 'moonOrbit'
export interface LunarClocksResult {
  place: Place
  altitudeM: number
  seconds: number
  terms: Terms
  gainMicrosecondsPerDay: number // against the Earth's equator
  gapSeconds: number // after `seconds`
  direction: Direction
}

export function runLunarClocks(place: Place, altitudeM: number, seconds: number): LunarClocksResult {
  requireNonNegative(altitudeM, 'The altitude')
  requireNonNegative(seconds, 'The time')
  const reference = earthEquatorTerms()
  const clock =
    place === 'earthEquator'
      ? reference
      : place === 'earthOrbit'
        ? earthOrbitTerms(altitudeM)
        : place === 'gps'
          ? earthOrbitTerms(GPS_ALTITUDE_M)
          : place === 'geostationary'
            ? earthOrbitTerms(GEOSTATIONARY_RADIUS_M - EARTH.equatorialRadius)
            : place === 'moonSurface'
              ? moonSurfaceTerms()
              : moonOrbitTerms(altitudeM)
  const gain = gainMicrosecondsPerDay(reference, clock)
  return { place, altitudeM, seconds, terms: clock, gainMicrosecondsPerDay: gain, gapSeconds: gapSeconds(reference, clock, seconds), direction: directionOf(gain) }
}
