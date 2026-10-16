import { describe, expect, it } from 'vitest'
import { travelerAngleOf } from './aberration'
import { frequencyFactorOf } from './dopplerShift'
import { runCollisionExperiment, speedFromEnergy } from './energyMomentum'
import { runRotatedCube } from './rotatedObject'
import { runSeeingExperiment } from './seeingThePast'
import { brightnessFactorOf } from './travelerSky'
import { runCauseBeforeEffectExperiment } from './causeBeforeEffect'
import { EXAMPLE_EVENT, EXAMPLE_PASSING_SPEED, EXAMPLE_SPEED, PUSH_ENERGIES, synthesisFigures } from './synthesisFigures'

// Required tests of docs/experiments/spacetime-geometry/closing-synthesis.md. The expected numbers below are written out by hand from
// the specification's table, so a change to an earlier experiment that moves a figure shows up here.

describe('closing recap figures: the values the specification quotes', () => {
  const figures = synthesisFigures()

  it('Experiment 3: the lab finds 3.00 seconds after O and the passing observer 3.44 seconds before O', () => {
    expect(figures.labTimeBetween).toBeCloseTo(3.0, 2)
    expect(figures.passingTimeBetween).toBeCloseTo(-3.44, 2)
  })

  it('Experiment 4: the image of a spaceship approaching at 0.6c seems to move at 1.50c', () => {
    expect(figures.approachingImageSpeed).toBeCloseTo(1.5, 2)
  })

  it('Experiment 5: two lumps meeting at 0.6c make a lump of 2.5 times one lump’s mass', () => {
    expect(figures.lumpMass).toBeCloseTo(2.5, 2)
  })

  it('Experiment 5: energies of 2, 5 and 10 rest energies give 0.866c, 0.980c and 0.995c', () => {
    expect(figures.pushSpeeds[0]).toBeCloseTo(0.866, 3)
    expect(figures.pushSpeeds[1]).toBeCloseTo(0.98, 3)
    expect(figures.pushSpeeds[2]).toBeCloseTo(0.995, 3)
  })

  it('Experiment 7: at 0.6c the star the lab sees sideways is seen at 53.1 degrees', () => {
    expect(figures.sidewaysStarTravelerAngle).toBeCloseTo(53.1, 1)
  })

  it('Experiment 8: at 0.6c the frequency is 2.00 times straight ahead and 0.50 times straight behind', () => {
    expect(figures.frequencyAhead).toBeCloseTo(2.0, 2)
    expect(figures.frequencyBehind).toBeCloseTo(0.5, 2)
  })

  it('Experiment 9: at 0.6c a star is 4.00 times as bright straight ahead and 0.25 times straight behind', () => {
    expect(figures.brightnessAhead).toBeCloseTo(4.0, 2)
    expect(figures.brightnessBehind).toBeCloseTo(0.25, 2)
  })

  it('Experiment 10: at 0.6c the front face is 0.80, the trailing face 0.60, the photograph 1.40 wide and the turn 36.9 degrees', () => {
    expect(figures.cubeFrontFace).toBeCloseTo(0.8, 2)
    expect(figures.cubeTrailingFace).toBeCloseTo(0.6, 2)
    expect(figures.cubePhotographWidth).toBeCloseTo(1.4, 2)
    expect(figures.cubeTurnDegrees).toBeCloseTo(36.9, 1)
  })
})

describe('closing recap figures: each is read from the earlier experiment’s own function', () => {
  const figures = synthesisFigures()

  it('equals what each experiment’s module returns for the same inputs', () => {
    const order = runCauseBeforeEffectExperiment(EXAMPLE_EVENT, EXAMPLE_PASSING_SPEED)
    expect(figures.labTimeBetween).toBe(order.lab.timeBetween)
    expect(figures.passingTimeBetween).toBe(order.passing.timeBetween)
    expect(figures.approachingImageSpeed).toBe(runSeeingExperiment('approaching', EXAMPLE_SPEED).imageSpeed)
    expect(figures.lumpMass).toBe(runCollisionExperiment(EXAMPLE_SPEED, 0).lumpMass)
    expect(figures.pushSpeeds).toEqual(PUSH_ENERGIES.map((energy) => speedFromEnergy(energy)))
    expect(figures.sidewaysStarTravelerAngle).toBe(travelerAngleOf(90, EXAMPLE_SPEED))
    expect(figures.frequencyAhead).toBe(frequencyFactorOf(0, EXAMPLE_SPEED))
    expect(figures.frequencyBehind).toBe(frequencyFactorOf(180, EXAMPLE_SPEED))
    expect(figures.brightnessAhead).toBe(brightnessFactorOf(0, EXAMPLE_SPEED))
    expect(figures.brightnessBehind).toBe(brightnessFactorOf(180, EXAMPLE_SPEED))
    const cube = runRotatedCube(EXAMPLE_SPEED)
    expect(figures.cubeFrontFace).toBe(cube.frontFaceWidth)
    expect(figures.cubeTrailingFace).toBe(cube.trailingFaceWidth)
    expect(figures.cubePhotographWidth).toBe(cube.photographWidth)
    expect(figures.cubeTurnDegrees).toBe(cube.turnDegrees)
  })
})

describe('closing recap figures: why pushing harder gives less speed', () => {
  it('the speeds rise with the energy, stay below the speed of light, and each extra rest energy adds less speed than the one before', () => {
    const { pushSpeeds } = synthesisFigures()
    for (let i = 1; i < pushSpeeds.length; i++) expect(pushSpeeds[i]).toBeGreaterThan(pushSpeeds[i - 1])
    for (const speed of pushSpeeds) expect(speed).toBeLessThan(1)
    // The gain in speed per extra rest energy, between consecutive energies, falls.
    const gains = pushSpeeds.slice(1).map((speed, i) => (speed - pushSpeeds[i]) / (PUSH_ENERGIES[i + 1] - PUSH_ENERGIES[i]))
    for (let i = 1; i < gains.length; i++) expect(gains[i]).toBeLessThan(gains[i - 1])
    // The same from one rest energy: the first extra rest energy adds more than the average gain to 2.
    expect(speedFromEnergy(2) - speedFromEnergy(1)).toBeGreaterThan(gains[0])
  })
})
