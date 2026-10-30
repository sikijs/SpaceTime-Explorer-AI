// Cosmic Horizons, Experiment 11: the fastest spacecraft, how much does its clock lag? (Parker Solar Probe)
// See docs/experiments/frontier-and-beyond/11-the-fastest-spacecraft.md, "Physics Model".
//
// No new physics beyond the weak-field clock-rate formula of Experiment 10 (and Gravity Experiments 2, 3 and 9): compared with a clock far from everything, a
// clock ticks slower by the fraction  GM / (r c^2) + v^2 / (2 c^2). Near the Sun both terms slow the clock, so they add. This module uses a spherical Sun,
// NASA's closest-approach distance and speed for the probe's closest point, and a two-body ellipse (of the stated period) for the rest of the orbit. It does not
// model the real orbit (the Venus flybys, the planets' pulls), the Sun's spin, or how the probe's clock is kept or corrected. This module imports nothing.

// Constants, in SI units.
export const SPEED_OF_LIGHT = 299_792_458 // m/s (exact, by the definition of the metre)
export const SECONDS_PER_DAY = 86_400
export const ASTRONOMICAL_UNIT = 1.495978707e11 // m (exact, by the IAU's definition)

// The Sun: GM is the standard value; the radius is the IAU's nominal solar radius, 695,700 km (to be checked against NASA's Sun fact sheet).
export const SUN = {
  gm: 1.32712440018e20, // m^3/s^2
  radius: 6.957e8, // m
}

// The Earth, as in Experiment 10 (NASA's Earth fact sheet: equatorial radius 6,378.137 km, mean orbital velocity 29.78 km/s; the digits of GM are a standard value).
export const EARTH = {
  gm: 3.986004418e14, // m^3/s^2
  equatorialRadius: 6.378137e6, // m
  rotation: 7.2921159e-5, // rad/s
  orbitalSpeed: 2.978e4, // m/s, the mean orbital speed round the Sun
  orbitalDistance: ASTRONOMICAL_UNIT, // m, the mean distance from the Sun
}

// Parker Solar Probe's record closest approach, 24 December 2024: 6,167,590 km above the Sun's surface at 192.22 km/s relative to the Sun (the Guinness World Records
// entry; NASA's pages read give "430,000 miles per hour" and "3.8 million miles", which agree). The orbit's period of about 88 days is a round figure from memory
// and from the usual description of the mission, not read from a NASA page (the specification's open items).
export const PARKER = {
  closestApproachAltitude: 6.16759e9, // m above the Sun's surface
  closestApproachSpeed: 1.9222e5, // m/s
  periodDays: 88, // days, about
  source: 'Guinness World Records entry for the closest approach to the Sun by a spacecraft (24 December 2024)',
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
  gravity: number // from the gravity of the body (or bodies) the clock sits in
  speed: number // from the clock's motion
  total: number // the two added
}
function terms(gravity: number, speed: number): Terms {
  return { gravity, speed, total: gravity + speed }
}

// The probe's distance from the Sun's centre at its closest approach.
export function closestApproachDistance(): number {
  return SUN.radius + PARKER.closestApproachAltitude
}

// The semi-major axis of the probe's orbit, from the period by Kepler's third law: a^3 = GM T^2 / (4 pi^2).
export function semiMajorAxis(): number {
  const period = PARKER.periodDays * SECONDS_PER_DAY
  return Math.cbrt((SUN.gm * period * period) / (4 * Math.PI * Math.PI))
}

// The far end of the orbit (the aphelion): the two ends of the ellipse add to 2a.
export function farOrbitDistance(): number {
  return 2 * semiMajorAxis() - closestApproachDistance()
}

// The probe at its closest point, with NASA's speed.
export function closestApproachTerms(): Terms {
  const v = PARKER.closestApproachSpeed
  return terms(SUN.gm / (closestApproachDistance() * c2), (v * v) / (2 * c2))
}

// The probe at a distance from the Sun's centre on its ellipse: the speed from energy ("vis-viva"), v^2 = GM (2 / r - 1 / a). At the closest point this gives about
// 190.7 km/s, 0.8 percent below NASA's 192.22 (the real orbit is not exactly a two-body ellipse of 88 days); the specification states the mismatch.
export function orbitTerms(distanceM: number): Terms {
  const rNear = closestApproachDistance()
  const rFar = farOrbitDistance()
  if (!Number.isFinite(distanceM) || distanceM < rNear || distanceM > rFar) {
    throw new RangeError('The distance must lie between the closest and the farthest points of the orbit')
  }
  const speedSquared = SUN.gm * (2 / distanceM - 1 / semiMajorAxis())
  return terms(SUN.gm / (distanceM * c2), speedSquared / (2 * c2))
}

// The probe's speed on the ellipse, for the picture and the readout.
export function orbitSpeed(distanceM: number): number {
  const t = orbitTerms(distanceM)
  return Math.sqrt(2 * t.speed * c2)
}

// The probe's speed at a distance from the Sun's centre, for display: NASA's 192.22 km/s at the closest point and the oval's speed at every other point.
export function speedAt(distanceM: number): number {
  return distanceM === closestApproachDistance() ? PARKER.closestApproachSpeed : orbitSpeed(distanceM)
}

// The time-average of the two terms over one whole orbit. Over an ellipse the time-average of 1 / r is 1 / a, so the gravity term averages GM / (a c^2) and the
// speed term GM / (2 a c^2): in all 1.5 GM / (a c^2) (the same 1.5 as a circular orbit's).
export function orbitAverageTerms(): Terms {
  const a = semiMajorAxis()
  return terms(SUN.gm / (a * c2), SUN.gm / (2 * a * c2))
}

// A clock on the Earth's equator, compared with one far from everything: the Earth's gravity and spin (Experiment 10), plus the Sun's gravity at the Earth's
// distance and the Earth's speed round the Sun.
export function earthTerms(): Terms {
  const spinSpeed = EARTH.rotation * EARTH.equatorialRadius
  const gravity = EARTH.gm / (EARTH.equatorialRadius * c2) + SUN.gm / (EARTH.orbitalDistance * c2)
  const speedSquared = EARTH.orbitalSpeed * EARTH.orbitalSpeed + spinSpeed * spinSpeed
  return terms(gravity, speedSquared / (2 * c2))
}

// How many milliseconds a day a clock loses against a reference clock (negative: it gains): the difference of their lowerings, times the seconds in a day.
export function lagMillisecondsPerDay(reference: Terms, clock: Terms): number {
  return (clock.total - reference.total) * SECONDS_PER_DAY * 1e3
}

// The gap, in seconds, that builds up after a time, if the rate stayed the same.
export function gapSeconds(reference: Terms, clock: Terms, seconds: number): number {
  requireNonNegative(seconds, 'The time')
  return (clock.total - reference.total) * seconds
}

// The lag that builds up over one whole orbit, against the Earth's clock, using the time-averaged rate (not the closest-approach rate).
export function lagOverOneOrbitSeconds(): number {
  return gapSeconds(earthTerms(), orbitAverageTerms(), PARKER.periodDays * SECONDS_PER_DAY)
}

// The distance from the Sun at which the probe's clock is lowered by exactly as much as the Earth's equator clock, so the two tick at the same rate (the lag
// against the Earth's clock is zero). Closer than this the probe's clock is the slower one, farther out it is the faster one. Found by bisection, because the lag
// falls steadily from the closest point to the far end.
export function earthMatchDistance(): number {
  const reference = earthTerms()
  let near = closestApproachDistance()
  let far = farOrbitDistance()
  if (lagMillisecondsPerDay(reference, orbitTerms(far)) > 0) return far // the lag never reaches zero on this orbit
  for (let i = 0; i < 200; i += 1) {
    const mid = (near + far) / 2
    if (lagMillisecondsPerDay(reference, orbitTerms(mid)) > 0) near = mid
    else far = mid
  }
  return (near + far) / 2
}

// For the predictions' answers.
// Prediction 1: do gravity and speed both slow the clock, both speed it up, or work against each other?
export type Effects = 'both slow' | 'both speed up' | 'work against each other'
export function effectsOf(t: Terms): Effects {
  if (!Number.isFinite(t.gravity) || !Number.isFinite(t.speed)) throw new RangeError('The terms must be numbers')
  if (t.gravity > 0 && t.speed > 0) return 'both slow'
  if (t.gravity < 0 && t.speed < 0) return 'both speed up'
  return 'work against each other'
}

export type TimeScale = 'microsecond' | 'millisecond' | 'second'
// The unit in which the number is at least 1 (so 35 milliseconds is "about 35 milliseconds", and not "about 0.035 seconds"), which is how Prediction 2's answer
// buttons are written ("About 35 microseconds / milliseconds / seconds").
export function timeScale(seconds: number): TimeScale {
  requirePositive(seconds, 'The time')
  if (seconds >= 1) return 'second'
  if (seconds >= 1e-3) return 'millisecond'
  return 'microsecond'
}

export function effectsAnswer(): Effects {
  return effectsOf(closestApproachTerms())
}
export function sizeAnswer(): TimeScale {
  return timeScale(lagMillisecondsPerDay(earthTerms(), closestApproachTerms()) * 1e-3)
}

// The learner's chosen point on the orbit ('closest' uses NASA's speed; any other distance uses the ellipse).
export interface FastestSpacecraftResult {
  distanceM: number
  seconds: number
  terms: Terms
  lagMillisecondsPerDay: number // against the Earth's equator clock
  gapSeconds: number // after `seconds`, at this rate
  effects: Effects
}

export function runFastestSpacecraft(distanceM: number, seconds: number): FastestSpacecraftResult {
  requireNonNegative(seconds, 'The time')
  const clock = distanceM === closestApproachDistance() ? closestApproachTerms() : orbitTerms(distanceM)
  const reference = earthTerms()
  return {
    distanceM,
    seconds,
    terms: clock,
    lagMillisecondsPerDay: lagMillisecondsPerDay(reference, clock),
    gapSeconds: gapSeconds(reference, clock, seconds),
    effects: effectsOf(clock),
  }
}
