import { DEFAULT_SOURCE_NM, everydayFrequencyFactorOf, frequencyFactorFromTravelerAngle, frequencyFactorOf, runDoppler } from './dopplerShift'
import type { DopplerStar } from './dopplerShift'

// Spacetime Geometry, Experiment 9: the traveler's whole sky (docs/experiments/spacetime-geometry/09-the-travelers-whole-sky.md).
// Units: c = 1, so a speed is a fraction of the speed of light (written β in the specification). Angles are in degrees, measured from
// the direction of travel, as in aberration.ts: 0 is straight ahead, 90 is sideways, 180 is straight behind.
// Only the brightness of each star is new here: its direction (Experiment 7) and its color (Experiment 8) come from the earlier modules.
//
// The rule: light from a star arrives as photons. The traveler meets them f' ÷ f times as often as the lab, and each carries f' ÷ f times
// the energy, so the energy arriving each second on a surface facing the star changes by (f' ÷ f)², which is
// ((1 + β cos θ) ÷ D)² for a star the lab sees at angle θ, with D = √(1 − β²). This is the brightness of a point source, as an
// instrument measures it; it is not the brightness of an extended object or of the whole sky.

// B' ÷ B for a star the lab sees at angle θ: the square of the color's shift factor. Above 1 is brighter, below 1 dimmer.
export function brightnessFactorOf(labAngleDegrees: number, speed: number): number {
  return frequencyFactorOf(labAngleDegrees, speed) ** 2
}

// The same factor written with the traveler's own angle θ' for the same star: (D ÷ (1 − β cos θ'))².
export function brightnessFactorFromTravelerAngle(travelerAngleDegrees: number, speed: number): number {
  return frequencyFactorFromTravelerAngle(travelerAngleDegrees, speed) ** 2
}

// The everyday (non-relativistic) factor for the same two effects, for an observer moving toward the star: (1 + β cos θ)². Used by the
// tutor's comparison. The relativistic factor is this divided by D².
export function everydayBrightnessFactorOf(labAngleDegrees: number, speed: number): number {
  return everydayFrequencyFactorOf(labAngleDegrees, speed) ** 2
}

export interface TravelerSkyStar extends DopplerStar {
  brightnessFactor: number // B' ÷ B
}

export interface TravelerSkyResult {
  speed: number
  timeDilationFactor: number // D, as in Experiment 3
  sourceNm: number // the lab's wavelength for every star
  stars: TravelerSkyStar[]
  towardBlueCount: number // stars with f' ÷ f above 1 (Experiment 8)
  towardRedCount: number
  brighterCount: number // stars with B' ÷ B above 1
  dimmerCount: number // stars with B' ÷ B below 1
  labCrossingAngle: number | null // where f' ÷ f and B' ÷ B are exactly 1, in the lab's sky
  travelerCrossingAngle: number | null // the same line in the traveler's sky
}

const TOLERANCE = 1e-9

// The ring of `starCount` stars (as in Experiments 7 and 8), each with the traveler's angle, the color's shift factor, the wavelength and
// range of the light the traveler measures, and the brightness factor.
export function runTravelerSky(speed: number, sourceNm = DEFAULT_SOURCE_NM, starCount = 24): TravelerSkyResult {
  const doppler = runDoppler(speed, sourceNm, starCount)
  const stars: TravelerSkyStar[] = doppler.stars.map((star) => ({ ...star, brightnessFactor: star.factor ** 2 }))
  return {
    speed,
    timeDilationFactor: doppler.timeDilationFactor,
    sourceNm: doppler.sourceNm,
    stars,
    towardBlueCount: doppler.towardBlueCount,
    towardRedCount: doppler.towardRedCount,
    brighterCount: stars.filter((star) => star.brightnessFactor > 1 + TOLERANCE).length,
    dimmerCount: stars.filter((star) => star.brightnessFactor < 1 - TOLERANCE).length,
    labCrossingAngle: doppler.labCrossingAngle,
    travelerCrossingAngle: doppler.travelerCrossingAngle,
  }
}
