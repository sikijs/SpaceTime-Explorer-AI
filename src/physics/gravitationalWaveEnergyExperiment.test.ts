import { describe, expect, it } from 'vitest'
import { chirpRunFor } from './gravitationalWaveChirpExperiment'
import { orbitalEnergyStateAt } from './gravitationalWaveEnergyExperiment'

describe('orbitalEnergyStateAt', () => {
  it('remainingOrbitalEnergy strictly decreases as time increases over the run', () => {
    const mass = 1.5
    const { cutoffTime } = chirpRunFor(mass, 1, 1)
    let previous = orbitalEnergyStateAt(0, mass)
    for (let i = 1; i <= 20; i++) {
      const time = (i / 20) * cutoffTime
      const current = orbitalEnergyStateAt(time, mass)
      expect(current.remainingOrbitalEnergy).toBeLessThan(previous.remainingOrbitalEnergy)
      previous = current
    }
  })

  it('radiatedEnergy strictly increases, and radiatedEnergy + remainingOrbitalEnergy equals totalOrbitalEnergy at every time', () => {
    const mass = 2
    const { cutoffTime } = chirpRunFor(mass, 1, 1)
    let previous = orbitalEnergyStateAt(0, mass)
    for (let i = 1; i <= 20; i++) {
      const time = (i / 20) * cutoffTime
      const current = orbitalEnergyStateAt(time, mass)
      expect(current.radiatedEnergy).toBeGreaterThan(previous.radiatedEnergy)
      expect(current.radiatedEnergy + current.remainingOrbitalEnergy).toBeCloseTo(current.totalOrbitalEnergy, 10)
      previous = current
    }
  })

  it('at time = 0, remainingOrbitalEnergy equals totalOrbitalEnergy and radiatedEnergy is 0, for any valid mass', () => {
    for (const mass of [0.2, 1, 3.5, 6]) {
      const state = orbitalEnergyStateAt(0, mass)
      expect(state.remainingOrbitalEnergy).toBeCloseTo(state.totalOrbitalEnergy, 10)
      expect(state.radiatedEnergy).toBeCloseTo(0, 10)
    }
  })

  it('a larger mass produces a strictly larger totalOrbitalEnergy', () => {
    const small = orbitalEnergyStateAt(0, 0.5)
    const large = orbitalEnergyStateAt(0, 2)
    expect(large.totalOrbitalEnergy).toBeGreaterThan(small.totalOrbitalEnergy)
  })

  it('at the same fraction of two different-mass runs, the fraction of energy radiated is identical regardless of mass', () => {
    const fraction = 0.5
    const smallMass = 0.5
    const largeMass = 2
    const smallRun = chirpRunFor(smallMass, 1, 1)
    const largeRun = chirpRunFor(largeMass, 1, 1)
    const smallState = orbitalEnergyStateAt(fraction * smallRun.cutoffTime, smallMass)
    const largeState = orbitalEnergyStateAt(fraction * largeRun.cutoffTime, largeMass)
    const smallFractionRadiated = smallState.radiatedEnergy / smallState.totalOrbitalEnergy
    const largeFractionRadiated = largeState.radiatedEnergy / largeState.totalOrbitalEnergy
    expect(largeFractionRadiated).toBeCloseTo(smallFractionRadiated, 10)
  })

  it('rejects a non-positive mass or a negative time', () => {
    expect(() => orbitalEnergyStateAt(0, 0)).toThrow(RangeError)
    expect(() => orbitalEnergyStateAt(0, -1)).toThrow(RangeError)
    expect(() => orbitalEnergyStateAt(-0.01, 1)).toThrow(RangeError)
  })

  it('rejects a time greater than the run\'s own cutoffTime', () => {
    const mass = 1
    const { cutoffTime } = chirpRunFor(mass, 1, 1)
    expect(() => orbitalEnergyStateAt(cutoffTime * 1.01, mass)).toThrow(RangeError)
  })

  it('is deterministic across repeated calls for the same inputs', () => {
    const a = orbitalEnergyStateAt(0.2, 1.3)
    const b = orbitalEnergyStateAt(0.2, 1.3)
    expect(a).toEqual(b)
  })
})
