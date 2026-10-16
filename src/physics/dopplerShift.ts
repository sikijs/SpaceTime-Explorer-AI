import { runSky, travelerAngleOf } from './aberration'
import { timeDilationFactorFor } from './movingClockExperiment'

// Spacetime Geometry, Experiment 8: the Doppler effect (docs/experiments/spacetime-geometry/08-doppler-shift.md).
// Units: c = 1, so a speed is a fraction of the speed of light (written β in the specification). Angles are in degrees, measured from
// the direction of travel, as in aberration.ts: 0 is straight ahead, 90 is sideways, 180 is straight behind.
// The stars are very far away and at rest in the lab, and each sends out one pure color. Only the frequency (color) of each star's light
// is tracked, not its brightness.
//
// The rule (from the transformation of a ray's energy in Experiment 5, applied to the ray of Experiment 7): the traveler measures the
// light's energy, and so its frequency, multiplied by (1 + β cos θ) ÷ D, where θ is the star's angle for the lab and D = √(1 − β²).

export const DEFAULT_SOURCE_NM = 550 // the lab's color for every star, a yellow-green near the middle of the visible range
export const VISIBLE_MIN_NM = 400
export const VISIBLE_MAX_NM = 700
const TOLERANCE = 1e-9

function assertTravelerSpeed(speed: number): void {
  if (!(Number.isFinite(speed) && speed >= 0 && speed < 1)) throw new RangeError(`the traveler's speed must be from 0 up to, but not including, c, got ${speed}`)
}

function assertAngle(angle: number): void {
  if (!Number.isFinite(angle)) throw new RangeError(`an angle must be a finite number of degrees, got ${angle}`)
}

function assertWavelength(wavelength: number): void {
  if (!(Number.isFinite(wavelength) && wavelength > 0)) throw new RangeError(`a wavelength must be a positive number of nanometres, got ${wavelength}`)
}

// cos of an angle in degrees, exact on the line of travel (so that straight ahead and straight behind stay exact).
function cosOf(angle: number): number {
  const a = ((angle % 360) + 360) % 360
  if (a === 0) return 1
  if (a === 180) return -1
  if (a === 90 || a === 270) return 0
  return Math.cos((a * Math.PI) / 180)
}

// f' ÷ f for a star the lab sees at angle θ: (1 + β cos θ) ÷ D. Above 1 is shifted toward blue, below 1 toward red.
export function frequencyFactorOf(labAngleDegrees: number, speed: number): number {
  assertAngle(labAngleDegrees)
  assertTravelerSpeed(speed)
  return (1 + speed * cosOf(labAngleDegrees)) / timeDilationFactorFor(speed)
}

// The same factor written with the traveler's own angle θ' for the same star: D ÷ (1 − β cos θ').
export function frequencyFactorFromTravelerAngle(travelerAngleDegrees: number, speed: number): number {
  assertAngle(travelerAngleDegrees)
  assertTravelerSpeed(speed)
  return timeDilationFactorFor(speed) / (1 - speed * cosOf(travelerAngleDegrees))
}

// The everyday (non-relativistic) factor for an observer moving toward a star: 1 + β cos θ. Used by the tutor's comparison. The
// relativistic factor is this divided by D.
export function everydayFrequencyFactorOf(labAngleDegrees: number, speed: number): number {
  assertAngle(labAngleDegrees)
  assertTravelerSpeed(speed)
  return 1 + speed * cosOf(labAngleDegrees)
}

// A higher frequency means a shorter wavelength: wavelength' = wavelength ÷ (f' ÷ f).
export function wavelengthNm(sourceNm: number, factor: number): number {
  assertWavelength(sourceNm)
  assertWavelength(factor)
  return sourceNm / factor
}

export type LightRange = 'ultraviolet' | 'visible' | 'infrared'

// The visible range is taken as 400 to 700 nanometres, both ends included.
export function rangeOf(wavelength: number): LightRange {
  assertWavelength(wavelength)
  if (wavelength < VISIBLE_MIN_NM) return 'ultraviolet'
  if (wavelength > VISIBLE_MAX_NM) return 'infrared'
  return 'visible'
}

// The lab angle at which the shift is exactly 1 (blue turns to red): cos θ = (D − 1) ÷ β. Null at speed 0, where there is no shift.
export function labCrossingAngle(speed: number): number | null {
  assertTravelerSpeed(speed)
  if (speed === 0) return null
  return (Math.acos((timeDilationFactorFor(speed) - 1) / speed) * 180) / Math.PI
}

// The same line in the traveler's sky: cos θ' = (1 − D) ÷ β. It is always less than 90 degrees, ahead of sideways.
export function travelerCrossingAngle(speed: number): number | null {
  assertTravelerSpeed(speed)
  if (speed === 0) return null
  return (Math.acos((1 - timeDilationFactorFor(speed)) / speed) * 180) / Math.PI
}

export interface DopplerStar {
  labAngle: number
  travelerAngle: number
  factor: number // f' ÷ f
  wavelengthNm: number // the wavelength the traveler measures
  range: LightRange
}

export interface DopplerResult {
  speed: number
  timeDilationFactor: number // D, as in Experiment 3
  sourceNm: number // the lab's wavelength for every star
  stars: DopplerStar[]
  towardBlueCount: number // stars with f' ÷ f above 1
  towardRedCount: number // stars with f' ÷ f below 1
  labCrossingAngle: number | null
  travelerCrossingAngle: number | null
}

// The ring of `starCount` stars (as in Experiment 7), each with the traveler's angle, the shift factor, and the wavelength and range
// of the light the traveler measures.
export function runDoppler(speed: number, sourceNm = DEFAULT_SOURCE_NM, starCount = 24): DopplerResult {
  assertTravelerSpeed(speed)
  assertWavelength(sourceNm)
  const sky = runSky(speed, starCount)
  const stars: DopplerStar[] = sky.stars.map((star) => {
    const factor = frequencyFactorOf(star.labAngle, speed)
    const wavelength = wavelengthNm(sourceNm, factor)
    return { labAngle: star.labAngle, travelerAngle: travelerAngleOf(star.labAngle, speed), factor, wavelengthNm: wavelength, range: rangeOf(wavelength) }
  })
  return {
    speed,
    timeDilationFactor: sky.timeDilationFactor,
    sourceNm,
    stars,
    towardBlueCount: stars.filter((star) => star.factor > 1 + TOLERANCE).length,
    towardRedCount: stars.filter((star) => star.factor < 1 - TOLERANCE).length,
    labCrossingAngle: labCrossingAngle(speed),
    travelerCrossingAngle: travelerCrossingAngle(speed),
  }
}
