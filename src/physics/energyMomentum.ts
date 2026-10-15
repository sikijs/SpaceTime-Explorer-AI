import { lorentzTransform } from './lorentzTransform'
import { timeDilationFactorFor } from './movingClockExperiment'

// Spacetime Geometry, Experiment 5: energy, momentum and mass (docs/experiments/spacetime-geometry/05-energy-momentum-and-mass.md).
// Units: c = 1. A speed is a fraction of c. Energy is measured in the particle's rest energies (mc² = 1), and momentum is shown
// as p × c in the same units, so the two can be compared. A light pulse has no rest energy, so its energy is in units of the
// lab's measurement of the pulse. The helium-4 reaction is in MeV, because it uses measured masses.
//
// Energy and momentum of one observer become those of another by the same transformation as time and position, with energy in
// the place of time and p × c in the place of position (lorentzTransform is reused, not duplicated).

export interface EnergyMomentumReading {
  energy: number // E
  momentumTimesC: number // p × c, in the same units as the energy
  speed: number // (p × c) ÷ E, signed: positive means moving to the right
  invariant: number // E² − (p × c)²
}

// Named constants of Part 3 and the tutor's real-world facts (spec "Real-World Facts Used, and Source Status").
// The proton rest energy and the helium-4 binding energy were confirmed by search on 2026-10-14, and the neutron and helium-4
// nucleus masses on 2026-10-15 (CODATA 2022 gives 939.565 421 94 and 3727.379 4118 MeV). A test checks that all four agree.
export const ELECTRON_REST_ENERGY_MEV = 0.51099895
export const PROTON_REST_ENERGY_MEV = 938.272
export const NEUTRON_REST_ENERGY_MEV = 939.565
export const HELIUM4_NUCLEUS_REST_ENERGY_MEV = 3727.379
// The accepted binding energy of helium-4, in MeV (confirmed by search), used only to check the constants above.
export const HELIUM4_BINDING_ENERGY_MEV = 28.295674
export const SPEED_OF_LIGHT_METERS_PER_SECOND = 299_792_458
// The nominal solar luminosity (from memory, to be confirmed) and the Sun's mass loss that follows from it.
export const SOLAR_LUMINOSITY_WATTS = 3.828e26

function assertParticleSpeed(speed: number): void {
  if (!(Number.isFinite(speed) && speed >= 0 && speed < 1)) {
    throw new RangeError(`speed must be at least 0 and below c, got ${speed}`)
  }
}

function assertObserverSpeed(speed: number): void {
  if (!(Number.isFinite(speed) && Math.abs(speed) < 1)) {
    throw new RangeError(`an observer's speed must be below c, got ${speed}`)
  }
}

function makeReading(energy: number, momentumTimesC: number): EnergyMomentumReading {
  return { energy, momentumTimesC, speed: energy === 0 ? 0 : momentumTimesC / energy, invariant: energy * energy - momentumTimesC * momentumTimesC }
}

// A particle with mass, moving to the right at `speed`, as the lab measures it: E = 1 ÷ D(v), p × c = v ÷ D(v),
// where D is the time dilation factor.
export function particleReading(speed: number): EnergyMomentumReading {
  assertParticleSpeed(speed)
  const factor = timeDilationFactorFor(speed)
  return makeReading(1 / factor, speed / factor)
}

// The same particle moving to the left.
export function leftMovingParticleReading(speed: number): EnergyMomentumReading {
  const right = particleReading(speed)
  return makeReading(right.energy, -right.momentumTimesC)
}

// A light pulse of lab energy 1, moving to the right (1) or to the left (-1): E = p × c.
export function lightReading(direction: 1 | -1): EnergyMomentumReading {
  return makeReading(1, direction)
}

// The same thing as an observer moving at `observerSpeed` (to the right, relative to the lab) measures it.
export function readingFor(observerSpeed: number, reading: EnergyMomentumReading): EnergyMomentumReading {
  assertObserverSpeed(observerSpeed)
  const transformed = lorentzTransform({ time: reading.energy, position: reading.momentumTimesC }, observerSpeed)
  return makeReading(transformed.time, transformed.position)
}

// Kinetic energy in rest energies: 1 ÷ D − 1, written without the subtraction, which loses accuracy at small speeds.
export function kineticEnergy(speed: number): number {
  assertParticleSpeed(speed)
  const factor = timeDilationFactorFor(speed)
  return (speed * speed) / (factor * (1 + factor))
}

// Newton's kinetic energy, ½ v², in rest energies.
export function newtonKineticEnergy(speed: number): number {
  assertParticleSpeed(speed)
  return (speed * speed) / 2
}

// The speed of a particle whose total energy is `energyInRestEnergies` rest energies: v = √(1 − 1 ÷ E²).
export function speedFromEnergy(energyInRestEnergies: number): number {
  if (!(Number.isFinite(energyInRestEnergies) && energyInRestEnergies >= 1)) {
    throw new RangeError(`the energy must be at least one rest energy, got ${energyInRestEnergies}`)
  }
  return Math.sqrt((energyInRestEnergies - 1) * (energyInRestEnergies + 1)) / energyInRestEnergies
}

// How far below the speed of light, 1 − v, a particle of `energyInRestEnergies` rest energies is. Written without the
// subtraction, which would be lost to rounding for energies as large as a particle accelerator's.
export function speedDeficit(energyInRestEnergies: number): number {
  const speed = speedFromEnergy(energyInRestEnergies)
  return 1 / (energyInRestEnergies * energyInRestEnergies * (1 + speed))
}

export interface InvariantExperimentResult {
  lab: EnergyMomentumReading
  own: EnergyMomentumReading | null // the particle's own observer; none for light, which has no rest frame
  passing: EnergyMomentumReading
  kineticEnergy: number | null // none for light
  newtonKineticEnergy: number | null
}

// Part 1: one particle (or a light pulse), three observers.
export function runInvariantExperiment(kind: 'particle' | 'light', speed: number, passingSpeed: number): InvariantExperimentResult {
  assertObserverSpeed(passingSpeed)
  if (kind === 'light') {
    const lab = lightReading(1)
    return { lab, own: null, passing: readingFor(passingSpeed, lab), kineticEnergy: null, newtonKineticEnergy: null }
  }
  const lab = particleReading(speed)
  return {
    lab,
    own: readingFor(speed, lab),
    passing: readingFor(passingSpeed, lab),
    kineticEnergy: kineticEnergy(speed),
    newtonKineticEnergy: newtonKineticEnergy(speed),
  }
}

// The whole system's mass, from the total energy and the total momentum of its pieces: √(E² − (P × c)²).
export function systemMassOf(readings: EnergyMomentumReading[]): number {
  const energy = readings.reduce((sum, r) => sum + r.energy, 0)
  const momentum = readings.reduce((sum, r) => sum + r.momentumTimesC, 0)
  return Math.sqrt(Math.max(energy * energy - momentum * momentum, 0))
}

export function totalsOf(readings: EnergyMomentumReading[]): { energy: number; momentumTimesC: number } {
  return {
    energy: readings.reduce((sum, r) => sum + r.energy, 0),
    momentumTimesC: readings.reduce((sum, r) => sum + r.momentumTimesC, 0),
  }
}

export interface CollisionExperimentResult {
  labBefore: EnergyMomentumReading[]
  labAfter: EnergyMomentumReading
  passingBefore: EnergyMomentumReading[]
  passingAfter: EnergyMomentumReading
  lumpMass: number // in units of one particle's mass m
  extraMass: number // lumpMass − 2
  newtonMomentumBefore: number // m × (the sum of the speeds the passing observer measures), with m = 1
  newtonMomentumAfter: number // 2m × (the speed the passing observer measures for the lump)
  systemMass: number // the whole system's mass, worked out from the pieces before the collision
}

// Part 2: two identical particles, each of mass m, move toward each other at `speed` in the lab and stick together.
// The lab is the frame where the total momentum is zero, so the lump ends at rest there. Energy and momentum are conserved:
// the lump's energy is the total energy before, and its mass follows.
export function runCollisionExperiment(speed: number, passingSpeed: number): CollisionExperimentResult {
  assertParticleSpeed(speed)
  assertObserverSpeed(passingSpeed)
  const labBefore = [particleReading(speed), leftMovingParticleReading(speed)]
  const before = totalsOf(labBefore)
  const labAfter = makeReading(before.energy, before.momentumTimesC)
  const passingBefore = labBefore.map((reading) => readingFor(passingSpeed, reading))
  const passingAfter = readingFor(passingSpeed, labAfter)
  const lumpMass = Math.sqrt(labAfter.invariant)
  return {
    labBefore,
    labAfter,
    passingBefore,
    passingAfter,
    lumpMass,
    extraMass: lumpMass - 2,
    newtonMomentumBefore: passingBefore.reduce((sum, r) => sum + r.speed, 0),
    newtonMomentumAfter: 2 * passingAfter.speed,
    systemMass: systemMassOf(labBefore),
  }
}

// The mass gained, in kilograms, when two lumps of `massKg` each collide head-on at `speedMetersPerSecond` each and stick,
// worked out from their total energy of motion divided by c² (the everyday case of the tutor).
export function everydayCollisionExtraMassKg(massKg: number, speedMetersPerSecond: number): number {
  const speed = speedMetersPerSecond / SPEED_OF_LIGHT_METERS_PER_SECOND
  return 2 * massKg * kineticEnergy(speed)
}

export type ReactionKind = 'annihilation' | 'pair-creation' | 'helium-binding'

export interface ReactionPiece {
  label: string
  restMass: number // in rest energies (or MeV for helium-4); a light pulse has none
  reading: EnergyMomentumReading
}

export interface ReactionExperimentResult {
  created: boolean // false only for pair creation below the threshold
  labBefore: ReactionPiece[]
  labAfter: ReactionPiece[]
  passingBefore: ReactionPiece[]
  passingAfter: ReactionPiece[]
  sumOfRestMassesBefore: number
  sumOfRestMassesAfter: number
  systemMassBefore: number
  systemMassAfter: number
  energyReleased: number // the sum of the rest masses before minus after; negative means energy was absorbed
}

function lightPiece(label: string, energy: number, direction: 1 | -1): ReactionPiece {
  return { label, restMass: 0, reading: makeReading(energy, direction * energy) }
}

// The photon energy that makes a pair is the same as one rest energy each. At the threshold the pair is at rest.
export const PAIR_CREATION_THRESHOLD = 1

// Part 3: a reaction, in the frame where the total momentum is zero, then as a passing observer measures it.
//   annihilation:   `parameter` is the speed of each of the two particles toward each other (0 is "at rest").
//   pair-creation:  `parameter` is the energy of each of the two light pulses, in rest energies of the particle to be made.
//   helium-binding: `parameter` is not used. Two protons and two neutrons at rest bind into helium-4, shown as accounting only.
export function runReactionExperiment(kind: ReactionKind, parameter: number, passingSpeed: number): ReactionExperimentResult {
  assertObserverSpeed(passingSpeed)

  let created = true
  let before: ReactionPiece[]
  let after: ReactionPiece[]

  if (kind === 'annihilation') {
    assertParticleSpeed(parameter)
    const particle = particleReading(parameter)
    before = [
      { label: 'particle', restMass: 1, reading: particle },
      { label: 'antiparticle', restMass: 1, reading: leftMovingParticleReading(parameter) },
    ]
    after = [lightPiece('light pulse to the right', particle.energy, 1), lightPiece('light pulse to the left', particle.energy, -1)]
  } else if (kind === 'pair-creation') {
    if (!(Number.isFinite(parameter) && parameter > 0)) throw new RangeError(`the photon energy must be above 0, got ${parameter}`)
    before = [lightPiece('light pulse to the right', parameter, 1), lightPiece('light pulse to the left', parameter, -1)]
    if (parameter < PAIR_CREATION_THRESHOLD) {
      // Below the threshold the system's mass is less than two rest masses, so no pair can be made: the pulses pass.
      created = false
      after = before
    } else {
      const momentum = Math.sqrt((parameter - 1) * (parameter + 1))
      after = [
        { label: 'particle', restMass: 1, reading: makeReading(parameter, momentum) },
        { label: 'antiparticle', restMass: 1, reading: makeReading(parameter, -momentum) },
      ]
    }
  } else {
    // The measured masses, in MeV, at rest. The energy released is the difference, shown as two equal pulses in opposite
    // directions so that the total momentum stays zero (a way of showing the accounting, not the real reaction).
    const parts = [
      { label: 'proton', restMass: PROTON_REST_ENERGY_MEV },
      { label: 'proton', restMass: PROTON_REST_ENERGY_MEV },
      { label: 'neutron', restMass: NEUTRON_REST_ENERGY_MEV },
      { label: 'neutron', restMass: NEUTRON_REST_ENERGY_MEV },
    ]
    before = parts.map((part) => ({ ...part, reading: makeReading(part.restMass, 0) }))
    const released = parts.reduce((sum, part) => sum + part.restMass, 0) - HELIUM4_NUCLEUS_REST_ENERGY_MEV
    after = [
      { label: 'helium-4 nucleus', restMass: HELIUM4_NUCLEUS_REST_ENERGY_MEV, reading: makeReading(HELIUM4_NUCLEUS_REST_ENERGY_MEV, 0) },
      lightPiece('light pulse to the right', released / 2, 1),
      lightPiece('light pulse to the left', released / 2, -1),
    ]
  }

  const toPassing = (pieces: ReactionPiece[]) => pieces.map((piece) => ({ ...piece, reading: readingFor(passingSpeed, piece.reading) }))
  const sumOfRestMasses = (pieces: ReactionPiece[]) => pieces.reduce((sum, piece) => sum + piece.restMass, 0)
  const sumBefore = sumOfRestMasses(before)
  const sumAfter = sumOfRestMasses(after)

  return {
    created,
    labBefore: before,
    labAfter: after,
    passingBefore: toPassing(before),
    passingAfter: toPassing(after),
    sumOfRestMassesBefore: sumBefore,
    sumOfRestMassesAfter: sumAfter,
    systemMassBefore: systemMassOf(before.map((piece) => piece.reading)),
    systemMassAfter: systemMassOf(after.map((piece) => piece.reading)),
    energyReleased: sumBefore - sumAfter,
  }
}
