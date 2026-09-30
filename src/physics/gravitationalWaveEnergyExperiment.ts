// Models the orbital energy an inspiraling pair loses as it radiates a gravitational wave —
// the cause behind the chirp gravitationalWaveChirpExperiment.ts shows as an observed effect.
// Reuses that experiment's chirpRunFor (mergerTime, cutoffTime) and progress fraction `s`
// unchanged; the only new physics is a simple, explicitly-labeled toy formula for how orbital
// energy decreases over the same run, not the real post-Newtonian energy-flux equations (see
// this experiment's specification, "Physics Model").
import { chirpRunFor } from './gravitationalWaveChirpExperiment'

const BASE_ORBITAL_ENERGY = 1
const REFERENCE_MASS = 1 // matches gravitationalWaveChirpExperiment.ts's own REFERENCE_MASS

export interface OrbitalEnergyState {
  time: number
  totalOrbitalEnergy: number
  remainingOrbitalEnergy: number
  radiatedEnergy: number
}

function validateMass(mass: number): void {
  if (!(mass > 0)) {
    throw new RangeError('Mass must be greater than 0')
  }
}

export function orbitalEnergyStateAt(time: number, mass: number): OrbitalEnergyState {
  validateMass(mass)
  if (time < 0) {
    throw new RangeError('Time must be non-negative')
  }

  // mergerTime/cutoffTime depend only on mass; baseFrequency/baseAmplitude are chirpRunFor's
  // own inputs and are irrelevant here, so dummy positive values are passed to satisfy validation.
  const { mergerTime, cutoffTime } = chirpRunFor(mass, 1, 1)
  if (time > cutoffTime) {
    throw new RangeError('Time must not exceed the run\'s cutoffTime')
  }

  const totalOrbitalEnergy = BASE_ORBITAL_ENERGY * (mass / REFERENCE_MASS)
  const s = time / mergerTime
  const remainingOrbitalEnergy = totalOrbitalEnergy * (1 - s)
  const radiatedEnergy = totalOrbitalEnergy - remainingOrbitalEnergy

  return { time, totalOrbitalEnergy, remainingOrbitalEnergy, radiatedEnergy }
}
