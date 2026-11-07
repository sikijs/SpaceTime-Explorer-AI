import { describe, expect, it } from 'vitest'
import { chirpRunFor } from './gravitationalWaveChirpExperiment'
import { PART1_MASS } from './gravitationalWaveChirpExperiment'
import {
  ENERGY_GRAPH_HEADROOM,
  ENERGY_PART1_MASS,
  REAL_GW150914_ENERGY,
  energyGuessEndFraction,
  energyGuessMatches,
  energyOutcome,
  energyRunSummary,
  orbitalEnergyStateAt,
} from './gravitationalWaveEnergyExperiment'
import type { EnergyChoice } from './gravitationalWaveEnergyExperiment'

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

const MASSES = [0.2, 0.3, 0.5, 1, 3, 6]
const CHOICES: EnergyChoice[] = ['increases', 'decreases', 'stays-the-same']

describe('energyRunSummary (audit update)', () => {
  it('Part 1 uses the same made-up mass as The Chirp', () => {
    expect(ENERGY_PART1_MASS).toBe(PART1_MASS)
    expect(ENERGY_PART1_MASS).toBe(0.3)
  })

  it('reproduces the draft wording numbers for mass 0.3', () => {
    const summary = energyRunSummary(0.3)
    expect(summary.startEnergy).toBeCloseTo(0.3, 10)
    expect(summary.cutoffTime).toBeCloseTo(3.0, 10)
    expect(summary.mergerTime).toBeCloseTo(1 / 0.3, 10)
    expect(summary.finalRemainingEnergy).toBeCloseTo(0.03, 10)
    expect(summary.finalRadiatedEnergy).toBeCloseTo(0.27, 10)
    expect(summary.graphTop).toBeCloseTo(0.375, 10)
    // The worked moment at time 1.000: 0.300 × (1 − 0.30) = 0.210, with 0.090 radiated.
    const atOne = orbitalEnergyStateAt(1, 0.3)
    expect(atOne.remainingOrbitalEnergy).toBeCloseTo(0.21, 10)
    expect(atOne.radiatedEnergy).toBeCloseTo(0.09, 10)
  })

  it('leaves a tenth of the starting energy at the final moment, for every mass', () => {
    for (const mass of MASSES) {
      expect(energyRunSummary(mass).shareLeft).toBeCloseTo(0.1, 10)
    }
  })

  it('energy left plus energy radiated equals the starting energy at the final moment, for every mass', () => {
    for (const mass of MASSES) {
      const s = energyRunSummary(mass)
      expect(s.finalRemainingEnergy + s.finalRadiatedEnergy).toBeCloseTo(s.startEnergy, 10)
    }
  })

  it('a pair of mass 3.0 starts with ten times the energy of a pair of mass 0.3 and has the same share left', () => {
    const light = energyRunSummary(0.3)
    const heavy = energyRunSummary(3.0)
    expect(heavy.startEnergy / light.startEnergy).toBeCloseTo(10, 10)
    expect(heavy.finalRemainingEnergy).toBeCloseTo(0.3, 10)
    expect(heavy.shareLeft).toBeCloseTo(light.shareLeft, 10)
  })

  it('the graph top is 1.25 times the starting energy for every mass', () => {
    expect(ENERGY_GRAPH_HEADROOM).toBe(1.25)
    for (const mass of MASSES) {
      const s = energyRunSummary(mass)
      expect(s.graphTop).toBeCloseTo(1.25 * s.startEnergy, 10)
    }
  })

  it('the time to the final moment is 0.9 of the time to the merger', () => {
    for (const mass of MASSES) {
      const s = energyRunSummary(mass)
      expect(s.cutoffTime).toBeCloseTo(0.9 * s.mergerTime, 10)
    }
  })

  it('rejects a mass of zero or less', () => {
    expect(() => energyRunSummary(0)).toThrow(RangeError)
    expect(() => energyRunSummary(-1)).toThrow(RangeError)
  })
})

describe('the guess mark and the real outcome (audit update)', () => {
  it('the three guess end fractions are 1.2, 1.0 and 0.8, distinct and ordered', () => {
    expect(energyGuessEndFraction('increases')).toBe(1.2)
    expect(energyGuessEndFraction('stays-the-same')).toBe(1)
    expect(energyGuessEndFraction('decreases')).toBe(0.8)
    expect(energyGuessEndFraction('increases')).toBeGreaterThan(energyGuessEndFraction('stays-the-same'))
    expect(energyGuessEndFraction('stays-the-same')).toBeGreaterThan(energyGuessEndFraction('decreases'))
  })

  it('every guess mark fits under the graph top, so no guess is drawn off the picture', () => {
    for (const choice of CHOICES) {
      expect(energyGuessEndFraction(choice)).toBeLessThanOrEqual(ENERGY_GRAPH_HEADROOM)
    }
  })

  it('the real outcome, computed from the model, is "decreases" for every mass', () => {
    expect(energyOutcome()).toBe('decreases')
    for (const mass of MASSES) {
      expect(energyOutcome(mass)).toBe('decreases')
    }
  })

  it('only the guess "decreases" matches the real outcome', () => {
    expect(energyGuessMatches('decreases')).toBe(true)
    expect(energyGuessMatches('increases')).toBe(false)
    expect(energyGuessMatches('stays-the-same')).toBe(false)
  })

  it('the guess marker is a fixed step: it does not depend on the real fall', () => {
    expect(energyGuessEndFraction('decreases')).not.toBeCloseTo(energyRunSummary(0.3).shareLeft, 2)
  })
})

describe('REAL_GW150914_ENERGY', () => {
  it('the masses add up: 36 + 29 − 62 = 3 solar masses radiated', () => {
    const [a, b] = REAL_GW150914_ENERGY.initialSolarMasses
    expect(a + b - REAL_GW150914_ENERGY.finalSolarMasses).toBe(REAL_GW150914_ENERGY.radiatedSolarMasses)
  })
})
