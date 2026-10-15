import { PROTON_REST_ENERGY_MEV, makeReading, readingFor, systemMassOf, totalsOf } from './energyMomentum'
import type { EnergyMomentumReading } from './energyMomentum'

// Spacetime Geometry, Experiment 6: making new particles, and decay (docs/experiments/spacetime-geometry/06-making-new-particles.md).
// Units: c = 1. Energy is in rest energies and momentum is shown as p × c, as in Experiment 5 (energyMomentum.ts), whose readings and
// transformation are reused here, not duplicated.
//   Part 1: the unit is the rest energy of one of the two identical colliding particles (mass 1).
//   Part 2: the unit is the parent's rest energy (so that light pulses fit).
// Only energy and momentum are tracked. Whether and when a possible reaction or decay happens is not modeled.

// A reaction is allowed if the system's mass reaches the total rest mass of the products. At the threshold the two are equal, so a
// tiny tolerance keeps rounding error from turning "just enough" into "not enough".
const THRESHOLD_TOLERANCE = 1e-9

function assertPositive(value: number, name: string): void {
  if (!(Number.isFinite(value) && value > 0)) throw new RangeError(`${name} must be above 0, got ${value}`)
}

function assertObserverSpeed(speed: number): void {
  if (!(Number.isFinite(speed) && Math.abs(speed) < 1)) throw new RangeError(`an observer's speed must be below c, got ${speed}`)
}

// ---- Part 1: making a new particle

export type Setup = 'stationary-target' | 'head-on'

export interface SetupResult {
  setup: Setup
  energyOfMotion: number // K: the total energy of motion (kinetic energy) supplied in the lab, in rest energies of one particle
  labPieces: EnergyMomentumReading[] // the two colliding particles before the collision, as the lab measures them
  totalEnergy: number // 2 + K
  totalMomentumTimesC: number
  systemMass: number // M, worked out from the total energy and the total momentum
  ownObserverSpeed: number // the system's own observer: the one for whom the total momentum is zero (right is positive)
  ownPieces: EnergyMomentumReading[] // the same two particles as the system's own observer measures them
  usable: number // M − 2: the energy of motion in the system's own observer's frame, which can become mass
  lockedIn: number // K − usable = total energy − M: the energy of the motion of the system as a whole, which cannot
  lockedShare: number // lockedIn ÷ K
}

// One of two ways to supply the same energy of motion K:
//   stationary target: one particle at rest, one beam particle with total energy 1 + K (so p × c = √(K² + 2K));
//   head-on: two particles meeting with equal energies, each 1 + K ÷ 2, with opposite momenta.
export function runSetup(setup: Setup, energyOfMotion: number): SetupResult {
  assertPositive(energyOfMotion, 'the energy of motion')
  const K = energyOfMotion
  const moving = (kinetic: number): number => Math.sqrt(kinetic * (kinetic + 2)) // p × c of a particle with kinetic energy `kinetic`
  const labPieces =
    setup === 'stationary-target'
      ? [makeReading(1 + K, moving(K)), makeReading(1, 0)]
      : [makeReading(1 + K / 2, moving(K / 2)), makeReading(1 + K / 2, -moving(K / 2))]
  const totals = totalsOf(labPieces)
  const systemMass = systemMassOf(labPieces)
  const ownObserverSpeed = totals.energy === 0 ? 0 : totals.momentumTimesC / totals.energy
  const ownPieces = labPieces.map((piece) => readingFor(ownObserverSpeed, piece))
  const usable = systemMass - 2
  const lockedIn = totals.energy - systemMass
  return {
    setup,
    energyOfMotion: K,
    labPieces,
    totalEnergy: totals.energy,
    totalMomentumTimesC: totals.momentumTimesC,
    systemMass,
    ownObserverSpeed,
    ownPieces,
    usable,
    lockedIn,
    lockedShare: lockedIn / K,
  }
}

// A new particle of mass `newMass` (in masses of one colliding particle) can be made if the system's mass is at least the total rest
// mass of the products, 2 + X. This is a rule used, not derived (spec, Decision 12). At the threshold the products all move together.
export function canMake(systemMass: number, newMass: number): boolean {
  assertPositive(newMass, 'the new particle\'s mass')
  return systemMass >= 2 + newMass - THRESHOLD_TOLERANCE
}

// The least energy of motion K that makes a new particle of mass X: X for head-on beams (nothing is locked in), 2X + X²/2 for a
// stationary target (from √(4 + 2K) ≥ 2 + X).
export function thresholdKineticEnergy(setup: Setup, newMass: number): number {
  assertPositive(newMass, 'the new particle\'s mass')
  return setup === 'head-on' ? newMass : 2 * newMass + (newMass * newMass) / 2
}

// The largest new mass that an energy of motion K can make: K head-on, √(4 + 2K) − 2 for a stationary target.
export function largestMakeableMass(setup: Setup, energyOfMotion: number): number {
  assertPositive(energyOfMotion, 'the energy of motion')
  return setup === 'head-on' ? energyOfMotion : Math.sqrt(4 + 2 * energyOfMotion) - 2
}

export interface MakingExperimentResult {
  energyOfMotion: number
  newMass: number
  stationaryTarget: SetupResult
  headOn: SetupResult
  stationaryTargetCanMake: boolean
  headOnCanMake: boolean
  stationaryTargetThreshold: number
  headOnThreshold: number
}

// Part 1: both setups for the same K, and whether each can make a new particle of mass X.
export function runMakingExperiment(energyOfMotion: number, newMass: number): MakingExperimentResult {
  assertPositive(newMass, 'the new particle\'s mass')
  const stationaryTarget = runSetup('stationary-target', energyOfMotion)
  const headOn = runSetup('head-on', energyOfMotion)
  return {
    energyOfMotion,
    newMass,
    stationaryTarget,
    headOn,
    stationaryTargetCanMake: canMake(stationaryTarget.systemMass, newMass),
    headOnCanMake: canMake(headOn.systemMass, newMass),
    stationaryTargetThreshold: thresholdKineticEnergy('stationary-target', newMass),
    headOnThreshold: thresholdKineticEnergy('head-on', newMass),
  }
}

// The system's mass when a beam of total energy `beamEnergy` hits a particle at rest, both of rest energy `restEnergy` (in the same
// units): M² = 2m² + 2mE. In units of the rest energy this is the √(4 + 2K) of runSetup, since E = 1 + K.
export function stationaryTargetSystemMass(beamEnergy: number, restEnergy: number): number {
  assertPositive(beamEnergy, 'the beam energy')
  assertPositive(restEnergy, 'the rest energy')
  if (beamEnergy < restEnergy) throw new RangeError('the beam energy cannot be below its rest energy')
  return Math.sqrt(2 * restEnergy * restEnergy + 2 * restEnergy * beamEnergy)
}

// The beam energy a stationary target needs to reach a system's mass: E = M² ÷ 2m − m.
export function stationaryTargetBeamEnergyFor(systemMass: number, restEnergy: number): number {
  assertPositive(systemMass, 'the system\'s mass')
  assertPositive(restEnergy, 'the rest energy')
  return (systemMass * systemMass) / (2 * restEnergy) - restEnergy
}

// Real-world figures the tutor uses (spec "Real-World Facts Used, and Source Status"; the pion mass and the LHC beam energy were
// confirmed by search on 2026-10-15). The proton rest energy comes from energyMomentum.ts.
export const NEUTRAL_PION_REST_ENERGY_MEV = 134.9768
export const LHC_BEAM_ENERGY_GEV = 6500 // 6.5 TeV per beam, so a collision energy of 13 TeV
export { PROTON_REST_ENERGY_MEV }

// ---- Part 2: decay

export interface DecayPiece {
  label: string
  restMass: number // in the parent's rest energies; zero for a pulse of light
  reading: EnergyMomentumReading
}

export interface DecayResult {
  restMassOfEachPiece: number // r, as a fraction of the parent's mass
  allowed: boolean // false if the pieces' masses would add up to more than the parent's
  labParent: EnergyMomentumReading // the parent at rest: energy 1, momentum 0
  labPieces: DecayPiece[] // empty if no decay can happen
  passingParent: EnergyMomentumReading
  passingPieces: DecayPiece[]
  sumOfRestMasses: number // 2r
  massGivenUp: number // 1 − 2r: the parent's mass minus the sum of the pieces' rest masses (negative if no decay can happen)
  systemMassLab: number // the pieces' system mass as the lab finds it: the parent's mass
  systemMassPassing: number // and as the passing observer finds it
}

// A parent of rest energy 1, at rest in the lab, decays into two equal pieces of rest mass r (r = 0 means two light pulses). Total
// energy is 1 and total momentum is 0, so the pieces move apart with equal energies ½ and p × c = ±√(¼ − r²). A passing observer at
// `passingSpeed` finds the readings by the same transformation as in Experiment 5.
export function runDecay(restMassOfEachPiece: number, passingSpeed: number): DecayResult {
  const r = restMassOfEachPiece
  if (!(Number.isFinite(r) && r >= 0)) throw new RangeError(`the pieces' mass must be at least 0, got ${r}`)
  assertObserverSpeed(passingSpeed)

  const labParent = makeReading(1, 0)
  const passingParent = readingFor(passingSpeed, labParent)
  const allowed = 2 * r <= 1 + THRESHOLD_TOLERANCE
  const base = {
    restMassOfEachPiece: r,
    allowed,
    labParent,
    passingParent,
    sumOfRestMasses: 2 * r,
    massGivenUp: 1 - 2 * r,
  }
  if (!allowed) {
    return { ...base, labPieces: [], passingPieces: [], systemMassLab: 1, systemMassPassing: 1 }
  }
  const momentum = Math.sqrt(Math.max((0.5 - r) * (0.5 + r), 0)) // √(¼ − r²), written without the subtraction of squares
  const names = r === 0 ? ['light pulse to the right', 'light pulse to the left'] : ['piece moving right', 'piece moving left']
  const labPieces: DecayPiece[] = [
    { label: names[0], restMass: r, reading: makeReading(0.5, momentum) },
    { label: names[1], restMass: r, reading: makeReading(0.5, -momentum) },
  ]
  const passingPieces = labPieces.map((piece) => ({ ...piece, reading: readingFor(passingSpeed, piece.reading) }))
  return {
    ...base,
    labPieces,
    passingPieces,
    systemMassLab: systemMassOf(labPieces.map((p) => p.reading)),
    systemMassPassing: systemMassOf(passingPieces.map((p) => p.reading)),
  }
}
