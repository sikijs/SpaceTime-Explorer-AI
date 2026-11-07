// Models the orbital energy an inspiraling pair loses as it radiates a gravitational wave —
// the cause behind the chirp gravitationalWaveChirpExperiment.ts shows as an observed effect.
// Reuses that experiment's chirpRunFor (mergerTime, cutoffTime) and progress fraction `s`
// unchanged; the only new physics is a simple, explicitly-labeled toy formula for how orbital
// energy decreases over the same run, not the real post-Newtonian energy-flux equations (see
// this experiment's specification, "Physics Model").
import { chirpRunFor, PART1_MASS } from './gravitationalWaveChirpExperiment'

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

// ---------------------------------------------------------------------------------------------
// Audit update (docs/audit/gravitational-waves/03-draft-wording.md, Step 3): every number the new
// pictures, Table 1 and the tutor show comes from here (CLAUDE.md §9). The physics above is
// unchanged; these functions only read it.
// ---------------------------------------------------------------------------------------------

// Part 1 runs the same made-up mass as "The Chirp", so the learner sees the chirp they already know.
export const ENERGY_PART1_MASS = PART1_MASS

// The energy graph's side axis runs from 0 to this multiple of the run's own starting energy, so a
// line that goes up from the start has room above it. Each run is still drawn to its own start.
export const ENERGY_GRAPH_HEADROOM = 1.25

export type EnergyChoice = 'increases' | 'decreases' | 'stays-the-same'

export interface EnergyRunSummary {
  mass: number
  startEnergy: number
  // The time to the merger (1 ÷ mass) and the run's final moment (0.9 of it).
  mergerTime: number
  cutoffTime: number
  finalRemainingEnergy: number
  finalRadiatedEnergy: number
  // The share of the starting energy still left at the final moment (the same for every mass).
  shareLeft: number
  // The top of the graph's side axis, in energy units.
  graphTop: number
}

export function energyRunSummary(mass: number): EnergyRunSummary {
  validateMass(mass)
  const { mergerTime, cutoffTime } = chirpRunFor(mass, 1, 1)
  const end = orbitalEnergyStateAt(cutoffTime, mass)
  return {
    mass,
    startEnergy: end.totalOrbitalEnergy,
    mergerTime,
    cutoffTime,
    finalRemainingEnergy: end.remainingOrbitalEnergy,
    finalRadiatedEnergy: end.radiatedEnergy,
    shareLeft: end.remainingOrbitalEnergy / end.totalOrbitalEnergy,
    graphTop: ENERGY_GRAPH_HEADROOM * end.totalOrbitalEnergy,
  }
}

// The white guess mark's end height, as a multiple of the starting energy. It is a marker for the
// direction of the choice, not a size: fixed steps of 20 percent, not the real fall and not how
// much the learner expects.
export function energyGuessEndFraction(choice: EnergyChoice): number {
  return choice === 'increases' ? 1.2 : choice === 'decreases' ? 0.8 : 1
}

// The real answer, computed from the model (not typed in), for the results and the tutor only.
export function energyOutcome(mass: number = ENERGY_PART1_MASS): EnergyChoice {
  const { startEnergy, finalRemainingEnergy } = energyRunSummary(mass)
  return finalRemainingEnergy > startEnergy ? 'increases' : finalRemainingEnergy < startEnergy ? 'decreases' : 'stays-the-same'
}

export const energyGuessMatches = (choice: EnergyChoice): boolean => choice === energyOutcome()

// GW150914, from the discovery paper's abstract (arXiv 1602.03837, read 2026-11-07): initial masses
// 36 and 29 solar masses, final mass 62, "3.0 (+0.5/-0.5) solar masses c²" radiated (90 percent
// credible intervals). The same figures are in the LIGO Scientific Collaboration's science summary.
export const REAL_GW150914_ENERGY = {
  initialSolarMasses: [36, 29],
  finalSolarMasses: 62,
  radiatedSolarMasses: 3.0,
} as const
