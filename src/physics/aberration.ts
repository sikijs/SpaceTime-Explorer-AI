import { makeReading, readingFor } from './energyMomentum'
import { timeDilationFactorFor } from './movingClockExperiment'

// Spacetime Geometry, Experiment 7: aberration (docs/experiments/spacetime-geometry/07-aberration.md).
// Units: c = 1, so a speed is a fraction of the speed of light (written β in the specification).
// Angles are in degrees, measured from the direction of travel: 0 is straight ahead, 90 is sideways, 180 is straight behind. A
// star below the line of travel has an angle in (180, 360), the mirror image of the one above it.
// The stars are very far away and at rest in the lab. Only the direction of each star's light is tracked, not its brightness or color.

const TOLERANCE = 1e-9
const TWO_PI_DEGREES = 360

function assertTravelerSpeed(speed: number): void {
  if (!(Number.isFinite(speed) && speed >= 0 && speed < 1)) throw new RangeError(`the traveler's speed must be from 0 up to, but not including, c, got ${speed}`)
}

function assertAngle(angle: number): void {
  if (!Number.isFinite(angle)) throw new RangeError(`an angle must be a finite number of degrees, got ${angle}`)
}

function toRadians(degrees: number): number {
  return (degrees * Math.PI) / 180
}

function toDegrees(radians: number): number {
  return (radians * 180) / Math.PI
}

// Puts an angle in the range 0 up to (but not including) 360.
function normalized(angle: number): number {
  const wrapped = angle % TWO_PI_DEGREES
  return wrapped < 0 ? wrapped + TWO_PI_DEGREES : wrapped
}

// The sine and cosine of a direction, with exact values on the line of travel (so that straight ahead and straight behind stay exact).
function directionOf(angle: number): { cos: number; sin: number } {
  const a = normalized(angle)
  if (a === 0) return { cos: 1, sin: 0 }
  if (a === 180) return { cos: -1, sin: 0 }
  return { cos: Math.cos(toRadians(a)), sin: Math.sin(toRadians(a)) }
}

// The direction of a star for an observer moving at `speed` along the line of travel, given its direction for the observer at rest:
//   cos θ' = (cos θ + β) ÷ (1 + β cos θ)    sin θ' = D sin θ ÷ (1 + β cos θ),   D = √(1 − β²).
// Both have the same positive denominator, so the angle is atan2(D sin θ, cos θ + β). That also keeps the star on the same side of the
// line of travel (above or below) and is accurate near 0 and 180 degrees. A negative `speed` gives the inverse (see labAngleOf).
function aberrated(angle: number, speed: number): number {
  const factor = timeDilationFactorFor(speed)
  const { cos, sin } = directionOf(angle)
  return normalized(toDegrees(Math.atan2(factor * sin, cos + speed)))
}

// θ': where the traveler sees a star that the lab sees at θ.
export function travelerAngleOf(labAngleDegrees: number, speed: number): number {
  assertAngle(labAngleDegrees)
  assertTravelerSpeed(speed)
  return aberrated(labAngleDegrees, speed)
}

// The inverse: where the lab sees a star that the traveler sees at θ'. The lab moves at −speed as the traveler measures it.
export function labAngleOf(travelerAngleDegrees: number, speed: number): number {
  assertAngle(travelerAngleDegrees)
  assertTravelerSpeed(speed)
  return aberrated(travelerAngleDegrees, -speed)
}

export interface RayAsMeasured {
  energy: number // E'
  momentumAlongTravelTimesC: number // p_x' c
  momentumAcrossTravelTimesC: number // p_y' c, unchanged by the traveler's motion
  starAngle: number // the direction toward the star, in degrees, from this ray's momentum
}

// The second route to the same angle, from energy and momentum (Experiment 5), as the specification's "Physics Model" derives it.
// The ray from a star at lab angle θ has energy 1 and momentum (−cos θ, −sin θ), because it travels from the star toward the observer.
// Its energy and its momentum along the line of travel change by the transformation of Experiment 5 (`readingFor`); its momentum
// across the line of travel does not change. The direction toward the star is opposite to the ray's momentum.
export function rayAsMeasuredByTraveler(labAngleDegrees: number, speed: number): RayAsMeasured {
  assertAngle(labAngleDegrees)
  assertTravelerSpeed(speed)
  const { cos, sin } = directionOf(labAngleDegrees)
  const along = readingFor(speed, makeReading(1, -cos))
  const across = -sin
  const starAngle = normalized(toDegrees(Math.atan2(-across, -along.momentumTimesC)))
  return { energy: along.energy, momentumAlongTravelTimesC: along.momentumTimesC, momentumAcrossTravelTimesC: across, starAngle }
}

// ---- The ring of stars

export interface SkyStar {
  labAngle: number // θ, in degrees, from 0 up to (but not including) 360
  travelerAngle: number // θ'
}

export type WedgeCounts = {
  aheadOfSideways: number // stars strictly less than 90 degrees from straight ahead
  within30OfAhead: number // stars within 30 degrees of straight ahead
  within30OfBehind: number // stars within 30 degrees of straight behind
}

// The angle between a direction and straight ahead, from 0 to 180, whichever side of the line of travel it is on.
export function angleFromAhead(angle: number): number {
  const a = normalized(angle)
  return a > 180 ? TWO_PI_DEGREES - a : a
}

export function wedgeCounts(angles: number[]): WedgeCounts {
  let aheadOfSideways = 0
  let within30OfAhead = 0
  let within30OfBehind = 0
  for (const angle of angles) {
    const fromAhead = angleFromAhead(angle)
    if (fromAhead < 90 - TOLERANCE) aheadOfSideways += 1
    if (fromAhead <= 30 + TOLERANCE) within30OfAhead += 1
    if (fromAhead >= 150 - TOLERANCE) within30OfBehind += 1
  }
  return { aheadOfSideways, within30OfAhead, within30OfBehind }
}

export interface SkyResult {
  speed: number
  timeDilationFactor: number // D = √(1 − speed²), as in Experiment 3
  stars: SkyStar[]
  countsLab: WedgeCounts
  countsTraveler: WedgeCounts
  sidewaysStarTravelerAngle: number // the traveler's angle for the star the lab sees at 90 degrees: arccos(speed)
  labAngleSeenAsSideways: number // the lab angle that the traveler sees at 90 degrees: arccos(−speed)
}

// The ring of `starCount` stars, evenly spaced in the lab's sky starting straight ahead, as the lab and as the traveler see it.
export function runSky(speed: number, starCount = 24): SkyResult {
  assertTravelerSpeed(speed)
  if (!(Number.isInteger(starCount) && starCount >= 1)) throw new RangeError(`the number of stars must be a whole number from 1 up, got ${starCount}`)
  const stars: SkyStar[] = []
  for (let i = 0; i < starCount; i += 1) {
    const labAngle = (TWO_PI_DEGREES * i) / starCount
    stars.push({ labAngle, travelerAngle: travelerAngleOf(labAngle, speed) })
  }
  return {
    speed,
    timeDilationFactor: timeDilationFactorFor(speed),
    stars,
    countsLab: wedgeCounts(stars.map((star) => star.labAngle)),
    countsTraveler: wedgeCounts(stars.map((star) => star.travelerAngle)),
    sidewaysStarTravelerAngle: travelerAngleOf(90, speed),
    labAngleSeenAsSideways: labAngleOf(90, speed),
  }
}

// The everyday comparison used by the tutor: if starlight were rain falling at speed 1 past a vehicle moving at `speed`, a star that
// the lab sees sideways would be seen at 90° − arctan(speed) from straight ahead.
export function rainRuleSidewaysAngle(speed: number): number {
  assertTravelerSpeed(speed)
  return 90 - toDegrees(Math.atan(speed))
}
