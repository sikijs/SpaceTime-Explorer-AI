import { runCauseBeforeEffectExperiment } from './causeBeforeEffect'
import { frequencyFactorOf } from './dopplerShift'
import { travelerAngleOf } from './aberration'
import { runCollisionExperiment, speedFromEnergy } from './energyMomentum'
import { runRotatedCube } from './rotatedObject'
import { runSeeingExperiment } from './seeingThePast'
import { brightnessFactorOf } from './travelerSky'

// Spacetime Geometry, closing recap: "Putting It All Together"
// (docs/experiments/spacetime-geometry/closing-synthesis.md).
// Every figure the recap quotes is read here from the earlier experiment's own function, never typed in again (CLAUDE.md §9), so the
// recap cannot drift from the experiments. There is no new physics in this file.

// The speed used for the starlight and cube examples, as in the experiments' own worked examples.
export const EXAMPLE_SPEED = 0.6

// The event of Experiment 3's worked example (3 seconds after O, 5 light-seconds away) and the speed of its passing observer.
export const EXAMPLE_EVENT = { time: 3, position: 5 }
export const EXAMPLE_PASSING_SPEED = 0.9

// The total energies, in rest energies, of the "why pushing harder gives less speed" passage (Experiment 5).
export const PUSH_ENERGIES = [2, 5, 10]

export interface SynthesisFigures {
  // Experiment 3: the same event as the lab and the passing observer find it, in seconds (negative means before O).
  labTimeBetween: number
  passingTimeBetween: number
  // Experiment 4: how fast the image of a spaceship approaching at EXAMPLE_SPEED seems to move, as a fraction of c.
  approachingImageSpeed: number
  // Experiment 5: the mass of the lump two lumps of mass 1 make when they meet at EXAMPLE_SPEED each, in units of one lump's mass.
  lumpMass: number
  // Experiment 5: the speed, as a fraction of c, at each of PUSH_ENERGIES.
  pushSpeeds: number[]
  // Experiment 7: where the traveler sees the star the lab sees sideways, in degrees.
  sidewaysStarTravelerAngle: number
  // Experiment 8: the frequency factor straight ahead and straight behind.
  frequencyAhead: number
  frequencyBehind: number
  // Experiment 9: the brightness factor straight ahead and straight behind.
  brightnessAhead: number
  brightnessBehind: number
  // Experiment 10: the front face and trailing face widths, the photograph's total width and the matching turn, for a cube of side 1.
  cubeFrontFace: number
  cubeTrailingFace: number
  cubePhotographWidth: number
  cubeTurnDegrees: number
}

export function synthesisFigures(): SynthesisFigures {
  const order = runCauseBeforeEffectExperiment(EXAMPLE_EVENT, EXAMPLE_PASSING_SPEED)
  const cube = runRotatedCube(EXAMPLE_SPEED)
  return {
    labTimeBetween: order.lab.timeBetween,
    passingTimeBetween: order.passing.timeBetween,
    approachingImageSpeed: runSeeingExperiment('approaching', EXAMPLE_SPEED).imageSpeed,
    lumpMass: runCollisionExperiment(EXAMPLE_SPEED, 0).lumpMass,
    pushSpeeds: PUSH_ENERGIES.map(speedFromEnergy),
    sidewaysStarTravelerAngle: travelerAngleOf(90, EXAMPLE_SPEED),
    frequencyAhead: frequencyFactorOf(0, EXAMPLE_SPEED),
    frequencyBehind: frequencyFactorOf(180, EXAMPLE_SPEED),
    brightnessAhead: brightnessFactorOf(0, EXAMPLE_SPEED),
    brightnessBehind: brightnessFactorOf(180, EXAMPLE_SPEED),
    cubeFrontFace: cube.frontFaceWidth,
    cubeTrailingFace: cube.trailingFaceWidth,
    cubePhotographWidth: cube.photographWidth,
    cubeTurnDegrees: cube.turnDegrees,
  }
}
