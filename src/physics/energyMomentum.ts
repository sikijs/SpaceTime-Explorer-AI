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
// The Large Hadron Collider's nominal proton energy per beam, in MeV: 6.8 TeV, from CERN's "Large Hadron Collider" page (read
// 2026-11-21; it gives 6.8 TeV per beam and 13.6 TeV for collisions, since 2022). The tutor used 6.5 TeV (the 2015 to 2018 figure)
// until the audit of 2026-11-21; the owner approved the change to 6.8 TeV.
export const LHC_PROTON_ENERGY_MEV = 6.8e6
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

// Exported for Experiment 6 (making new particles), which builds readings from an energy and a momentum.
export function makeReading(energy: number, momentumTimesC: number): EnergyMomentumReading {
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

// ---------------------------------------------------------------------------------------------------------------------
// Section A's audit additions (2026-11-21; docs/audit/spacetime-geometry/05-draft-wording.md, section 8). They only read what
// runInvariantExperiment already computed, so no existing result changes.

// Two numbers count as "the same" when they differ by less than this; the readings are exact up to rounding.
export const AGREEMENT_TOLERANCE = 1e-9

// Section A's fixed Part 1 case (the owner's default of 2026-11-21: the page's present starting choice): a particle at 0.6c in the lab and a
// passing observer at +0.3c.
export const SECTION_A_SPEED = 0.6
export const SECTION_A_PASSING_SPEED = 0.3

export type BarName = 'energy' | 'momentum' | 'invariant'
export type InvariantGuess = 'same' | 'nothing' | 'one-number'

// All the observers of one run: the lab, the particle's own observer (not for light) and the passing observer.
function observersOf(result: InvariantExperimentResult): EnergyMomentumReading[] {
  return result.own ? [result.lab, result.own, result.passing] : [result.lab, result.passing]
}

function allAgree(values: number[]): boolean {
  return values.every((v) => Math.abs(v - values[0]) < AGREEMENT_TOLERANCE)
}

// Which of the three quantities every observer of the run finds the same.
export function agreedQuantities(result: InvariantExperimentResult): Record<BarName, boolean> {
  const observers = observersOf(result)
  return {
    energy: allAgree(observers.map((o) => o.energy)),
    momentum: allAgree(observers.map((o) => o.momentumTimesC)),
    invariant: allAgree(observers.map((o) => o.invariant)),
  }
}

export interface GuessOutline {
  bars: BarName[] // the bars of every observer that this white outline goes round
  label: string // the words in its YOUR GUESS box
}

// The white markers of Part 1's guess (spec of the audit draft, section 4). The answers have no size of their own, so each is
// only a marker: it depends on the answer alone and never on the result, so a guess cannot change a real value.
export function guessMarkerFor(guess: InvariantGuess): GuessOutline[] {
  switch (guess) {
    case 'same':
      return [{ bars: ['energy', 'momentum'], label: 'YOUR GUESS: these are the same for every observer' }]
    case 'nothing':
      return [{ bars: ['energy', 'momentum', 'invariant'], label: 'YOUR GUESS: all of these differ, nothing is agreed' }]
    case 'one-number':
      return [
        { bars: ['energy', 'momentum'], label: 'YOUR GUESS: these differ' },
        { bars: ['invariant'], label: 'YOUR GUESS: but this number is agreed' },
      ]
  }
}

export type CheckUpReading = 'the same' | 'different'

export interface CheckUpRow {
  check: string
  expected: number | null // null where no value is expected (energy has no reference)
  found: number[] // the value for each observer named in `observers`, in order
  observers: string[]
  reading: CheckUpReading
}

// The check-up of Part 3. The expected invariant comes from the same physics: a particle's E² − (p × c)² is its rest energy
// squared (1 here) and a light pulse's is 0 (tests 2 and 5). The energy row has no reference value, so it only says whether the
// observers' energies are "the same" or "different".
export function checkUpRows(result: InvariantExperimentResult, kind: 'particle' | 'light'): CheckUpRow[] {
  const expected = kind === 'particle' ? 1 : 0
  const rows: CheckUpRow[] = [
    { name: 'the lab', reading: result.lab },
    ...(result.own ? [{ name: "the particle's own observer", reading: result.own }] : []),
    { name: 'the passing observer', reading: result.passing },
  ].map(({ name, reading }) => ({
    check: `E² − (momentum × c)² for ${name}`,
    expected,
    found: [reading.invariant],
    observers: [name],
    reading: Math.abs(reading.invariant - expected) < AGREEMENT_TOLERANCE ? 'the same' : 'different',
  }))
  rows.push({
    check: 'Energy, the lab and the passing observer',
    expected: null,
    found: [result.lab.energy, result.passing.energy],
    observers: ['the lab', 'the passing observer'],
    reading: Math.abs(result.lab.energy - result.passing.energy) < AGREEMENT_TOLERANCE ? 'the same' : 'different',
  })
  return rows
}

// What the run actually shows, as one of the three answers of Part 1's prediction: (a) when energy and momentum are both agreed, (c) when only the
// combination E² − (p × c)² is, and (b) when nothing is. The tutor uses it to mark the learner's guess; the page never compares a guess with it earlier.
export function realAnswerFor(result: InvariantExperimentResult): InvariantGuess {
  const agreed = agreedQuantities(result)
  if (agreed.energy && agreed.momentum) return 'same'
  return agreed.invariant ? 'one-number' : 'nothing'
}

// ---------------------------------------------------------------------------------------------------------------------------
// Section B audit additions (docs/audit/spacetime-geometry/05-draft-wording-section-b.md, approved with all defaults on 2026-11-21).
// Nothing above changes: these only read what `runCollisionExperiment` already computed.

// Section B's fixed Part 1 case: two lumps at 0.6c each in the lab and a passing observer at +0.3c (the page's present starting choice).
export const SECTION_B_SPEED = 0.6
export const SECTION_B_PASSING_SPEED = 0.3

export type CollisionGuess = 'less' | 'same' | 'more'

export interface CollisionGuessMarker {
  position: number // where the white tick sits on the mass bars, in units of m (the lump's mass M is on the same scale)
  label: string // the words in its YOUR GUESS box
}

// The white tick of Part 1's guess (draft, section 4). The answers have no size of their own, so each tick is only a marker:
// it depends on the answer alone and never on the result, so a guess cannot change a real value. "Less" and "more" sit at fixed
// places either side of 2m, chosen so that no tick falls on the real M for any preset speed (M is at least 2, and is 2.096, 2.5,
// 3.333 or 4.588 at the presets 0.3c, 0.6c, 0.8c and 0.9c).
export function collisionGuessMarker(guess: CollisionGuess): CollisionGuessMarker {
  switch (guess) {
    case 'less':
      return { position: 1.5, label: 'YOUR GUESS: less than 2m' }
    case 'same':
      return { position: 2, label: 'YOUR GUESS: exactly 2m' }
    case 'more':
      return { position: 3, label: 'YOUR GUESS: more than 2m' }
  }
}

// What the run actually shows, as one of the three answers: the tutor uses it to mark the learner's guess; the page never
// compares a guess with it earlier.
export function realCollisionAnswerFor(result: CollisionExperimentResult): CollisionGuess {
  if (Math.abs(result.extraMass) < AGREEMENT_TOLERANCE) return 'same'
  return result.extraMass < 0 ? 'less' : 'more'
}

function closeTo(a: number, b: number): boolean {
  return Math.abs(a - b) < AGREEMENT_TOLERANCE
}

// Part 1's second guess (about the passing observer, 2026-11-22): the passing observer adds up mass × speed with the speeds
// they measure, for the two lumps before and for the single lump after. Is that everyday total the same before and after?
export type EverydayTotalGuess = 'same' | 'different'

export interface EverydayTotalGuessMarker {
  afterPosition: number // where the white tick sits on the "after" bar, on the same scale as the real totals (m × the speed as a fraction of c, signed)
  label: string // the words in its YOUR GUESS box
}

// The white tick of the second guess. Neither answer has a size of its own, so each tick is only a marker. "The same" sits at the
// real "before" total (an equal bar). "Different" sits a fixed 0.5 below it. The tick depends on the guess and on the "before"
// total, which the guess cannot change, so it never changes a real value, and 0.5 is more than the real gap at Part 1's case
// (about 0.2), so the "different" tick never falls on the real "after" total.
export function everydayTotalGuessMarker(guess: EverydayTotalGuess, result: CollisionExperimentResult): EverydayTotalGuessMarker {
  switch (guess) {
    case 'same':
      return { afterPosition: result.newtonMomentumBefore, label: 'YOUR GUESS: the same before and after' }
    case 'different':
      return { afterPosition: result.newtonMomentumBefore - 0.5, label: 'YOUR GUESS: not the same before and after' }
  }
}

// What the run actually shows for that question: the tutor uses it to mark the guess; the page never compares them earlier.
export function realEverydayTotalAnswerFor(result: CollisionExperimentResult): EverydayTotalGuess {
  return closeTo(result.newtonMomentumBefore, result.newtonMomentumAfter) ? 'same' : 'different'
}

// The check-up of Part 3 (draft, 6a): the rule says the total energy and the total momentum are conserved, so each difference
// (after minus before) is expected to be 0; and the mass of the whole system is the same before and after, and the same for the
// lab and the passing observer. These rows say nothing about the lump's mass compared with 2m (that is the prediction, the tutor's).
export function collisionCheckUpRows(result: CollisionExperimentResult): CheckUpRow[] {
  const labBefore = totalsOf(result.labBefore)
  const labAfter = totalsOf([result.labAfter])
  const passingBefore = totalsOf(result.passingBefore)
  const passingAfter = totalsOf([result.passingAfter])
  const passingMassBefore = systemMassOf(result.passingBefore)
  const passingMassAfter = systemMassOf([result.passingAfter])
  const labMassAfter = systemMassOf([result.labAfter])
  const difference = (name: string, observer: string, after: number, before: number): CheckUpRow => ({
    check: `${name}, ${observer}: after minus before`,
    expected: 0,
    found: [after - before],
    observers: [observer],
    reading: closeTo(after, before) ? 'the same' : 'different',
  })
  const equal = (check: string, observers: string[], found: number[]): CheckUpRow => ({
    check,
    expected: null,
    found,
    observers,
    reading: found.every((v) => closeTo(v, found[0])) ? 'the same' : 'different',
  })
  return [
    difference('Total energy', 'the lab', labAfter.energy, labBefore.energy),
    difference('Total momentum × c', 'the lab', labAfter.momentumTimesC, labBefore.momentumTimesC),
    difference('Total energy', 'the passing observer', passingAfter.energy, passingBefore.energy),
    difference('Total momentum × c', 'the passing observer', passingAfter.momentumTimesC, passingBefore.momentumTimesC),
    equal('Mass of the whole system, the lab, before and after', ['the lab'], [result.systemMass, labMassAfter]),
    equal('Mass of the whole system, the passing observer, before and after', ['the passing observer'], [passingMassBefore, passingMassAfter]),
    equal('Mass of the whole system, the lab and the passing observer', ['the lab', 'the passing observer'], [result.systemMass, passingMassBefore]),
  ]
}

// ---------------------------------------------------------------------------------------------------------------------------
// Section C audit additions (docs/audit/spacetime-geometry/05-draft-wording-section-c.md; the owner accepted all defaults on 2026-11-21).
// Nothing above changes: these only read what `runReactionExperiment` already computed.

// Section C's fixed Part 1 case: a particle and its antiparticle, each moving at 0.6c toward each other in the lab, and a passing observer at +0.3c.
export const SECTION_C_SPEED = 0.6
export const SECTION_C_PASSING_SPEED = 0.3

export type ReactionGuess = 'less' | 'same' | 'more'

export interface ReactionGuessMarker {
  position: number // where the white tick sits on the mass ledger, in the ledger's units (the same unit as the bars)
  label: string // the words in its YOUR GUESS box
}

// The white tick of Part 1's guess (draft, section 4): across the "before" and "after" bars of the sum of the rest masses. The answers have no size of their
// own, so each tick is only a marker, placed relative to the "before" bar: half-way for "less", at its end for "the same", one and a half times for "more". It
// reads only the real "before" value, to place itself; it never changes a real value.
export function reactionGuessMarker(guess: ReactionGuess, sumBefore: number): ReactionGuessMarker {
  switch (guess) {
    case 'less':
      return { position: 0.5 * sumBefore, label: 'YOUR GUESS: less after than before' }
    case 'same':
      return { position: sumBefore, label: 'YOUR GUESS: the same' }
    case 'more':
      return { position: 1.5 * sumBefore, label: 'YOUR GUESS: more after than before' }
  }
}

// What the run actually shows, as one of the three answers: the tutor uses it to mark the learner's guess; the page never compares a guess with it earlier.
export function realReactionAnswerFor(result: ReactionExperimentResult): ReactionGuess {
  const change = result.sumOfRestMassesAfter - result.sumOfRestMassesBefore
  if (Math.abs(change) < AGREEMENT_TOLERANCE * Math.max(1, result.sumOfRestMassesBefore)) return 'same'
  return change < 0 ? 'less' : 'more'
}

// The check-up of Part 3 (draft, 6b): total energy and total momentum are conserved for each observer, so each difference (after minus before) is expected to be 0;
// the mass of the whole system is the same before and after, and the same for the lab and the passing observer. These rows say nothing about the sum of the rest
// masses (that is the prediction, the tutor's). The tolerance is relative, because helium is in MeV (thousands) and the others are in rest energies (about 1).
export function reactionCheckUpRows(result: ReactionExperimentResult): CheckUpRow[] {
  const readings = (pieces: ReactionPiece[]) => pieces.map((piece) => piece.reading)
  const labBefore = totalsOf(readings(result.labBefore))
  const labAfter = totalsOf(readings(result.labAfter))
  const passingBefore = totalsOf(readings(result.passingBefore))
  const passingAfter = totalsOf(readings(result.passingAfter))
  const passingMassBefore = systemMassOf(readings(result.passingBefore))
  const passingMassAfter = systemMassOf(readings(result.passingAfter))
  const scale = Math.max(1, result.systemMassBefore)
  const near = (a: number, b: number) => Math.abs(a - b) < AGREEMENT_TOLERANCE * scale
  const difference = (name: string, observer: string, after: number, before: number): CheckUpRow => ({
    check: `${name}, ${observer}: after minus before`,
    expected: 0,
    found: [after - before],
    observers: [observer],
    reading: near(after, before) ? 'the same' : 'different',
  })
  const equal = (check: string, observers: string[], found: number[]): CheckUpRow => ({
    check,
    expected: null,
    found,
    observers,
    reading: found.every((v) => near(v, found[0])) ? 'the same' : 'different',
  })
  return [
    difference('Total energy', 'the lab', labAfter.energy, labBefore.energy),
    difference('Total momentum × c', 'the lab', labAfter.momentumTimesC, labBefore.momentumTimesC),
    difference('Total energy', 'the passing observer', passingAfter.energy, passingBefore.energy),
    difference('Total momentum × c', 'the passing observer', passingAfter.momentumTimesC, passingBefore.momentumTimesC),
    equal("The system's mass, the lab, before and after", ['the lab'], [result.systemMassBefore, result.systemMassAfter]),
    equal("The system's mass, the passing observer, before and after", ['the passing observer'], [passingMassBefore, passingMassAfter]),
    equal("The system's mass, the lab and the passing observer", ['the lab', 'the passing observer'], [result.systemMassBefore, passingMassBefore]),
  ]
}

// The measured masses of the proton, the neutron and the alpha particle (the helium-4 nucleus), as energies in MeV: 2022 CODATA recommended values, read on NIST's pages
// "CODATA Value: ... mass energy equivalent in MeV" on 2026-11-21 (physics.nist.gov/cgi-bin/cuu/Value?mpc2mev, mnc2mev, malc2mev, mec2mev).
export const CODATA_PROTON_MEV = 938.27208943
export const CODATA_NEUTRON_MEV = 939.56542194
export const CODATA_ALPHA_MEV = 3727.3794118
export const CODATA_ELECTRON_MEV = 0.51099895069

// The helium-4 binding energy worked out from those published masses: two protons and two neutrons, minus the nucleus.
export function heliumBindingEnergyFromCodata(): number {
  return 2 * CODATA_PROTON_MEV + 2 * CODATA_NEUTRON_MEV - CODATA_ALPHA_MEV
}

// The page's own masses are given to 0.001 MeV (five rounded numbers), so the two values can differ by at most 0.003 MeV from rounding alone.
export const HELIUM_ROUNDING_TOLERANCE_MEV = 0.003

export interface HeliumCheckUp {
  published: number // MeV, worked out from the CODATA masses
  found: number // MeV, the energy released in the page's helium run
  difference: number
  reading: CheckUpReading
}

// The helium check-up (draft, 6c): the energy released in the run beside the binding energy worked out from published masses.
export function heliumCheckUp(result: ReactionExperimentResult): HeliumCheckUp {
  const published = heliumBindingEnergyFromCodata()
  const found = result.energyReleased
  return {
    published,
    found,
    difference: found - published,
    reading: Math.abs(found - published) <= HELIUM_ROUNDING_TOLERANCE_MEV ? 'the same' : 'different',
  }
}

// The fraction of the hydrogen's mass that the Sun releases as energy: its mass loss (power ÷ c²) divided by the hydrogen it fuses each second. NASA's page
// (science.gsfc.nasa.gov/attic/cosmicopia.gsfc.nasa.gov/qa_sun.html, read 2026-11-21) gives about 600 million tons of hydrogen per second and the power
// 3.8 × 10²⁶ W; the fraction is this page's own ratio of the two, not a figure NASA states.
export const SUN_HYDROGEN_FUSED_KG_PER_SECOND = 6e11 // 600 million tonnes
export function sunMassLossFraction(): number {
  const massLoss = SOLAR_LUMINOSITY_WATTS / (SPEED_OF_LIGHT_METERS_PER_SECOND * SPEED_OF_LIGHT_METERS_PER_SECOND)
  return massLoss / SUN_HYDROGEN_FUSED_KG_PER_SECOND
}
