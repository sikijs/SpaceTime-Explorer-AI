import { describe, it, expect } from 'vitest'
import { lorentzTransform } from './lorentzTransform'
import { timeDilationFactorFor } from './movingClockExperiment'
import {
  ELECTRON_REST_ENERGY_MEV,
  HELIUM4_BINDING_ENERGY_MEV,
  HELIUM4_NUCLEUS_REST_ENERGY_MEV,
  NEUTRON_REST_ENERGY_MEV,
  PAIR_CREATION_THRESHOLD,
  PROTON_REST_ENERGY_MEV,
  SOLAR_LUMINOSITY_WATTS,
  SPEED_OF_LIGHT_METERS_PER_SECOND,
  everydayCollisionExtraMassKg,
  kineticEnergy,
  leftMovingParticleReading,
  lightReading,
  newtonKineticEnergy,
  particleReading,
  readingFor,
  runCollisionExperiment,
  runInvariantExperiment,
  runReactionExperiment,
  speedDeficit,
  speedFromEnergy,
  systemMassOf,
  totalsOf,
} from './energyMomentum'
import type { EnergyMomentumReading, ReactionKind, ReactionPiece } from './energyMomentum'

const PARTICLE_SPEEDS = [0, 0.01, 0.1, 0.3, 0.5, 0.6, 0.8, 0.9, 0.99]
const OBSERVER_SPEEDS = [-0.99, -0.9, -0.6, -0.3, 0, 0.3, 0.6, 0.9, 0.99]
const PRESET_COLLISION_SPEEDS = [0.3, 0.6, 0.8, 0.9]

// A relative tolerance for sums of energies and momenta, which can be large for fast observers.
function close(a: number, b: number, scale = 1) {
  expect(Math.abs(a - b)).toBeLessThanOrEqual(1e-11 * Math.max(1, Math.abs(scale)))
}

function totalsOfPieces(pieces: ReactionPiece[]) {
  return totalsOf(pieces.map((p) => p.reading))
}

const REACTIONS: { kind: ReactionKind; parameters: number[] }[] = [
  { kind: 'annihilation', parameters: [0, 0.6, 0.9] },
  { kind: 'pair-creation', parameters: [0.5, 1, 2, 5] },
  { kind: 'helium-binding', parameters: [0] },
]

describe('Energy, momentum and mass physics (Spacetime Geometry, Experiment 5)', () => {
  it('1. matches the hand-calculated table for one particle in the lab', () => {
    const expected = [
      { v: 0, e: 1, p: 0 },
      { v: 0.3, e: 1.0482848367, p: 0.3144854510 },
      { v: 0.6, e: 1.25, p: 0.75 },
      { v: 0.8, e: 5 / 3, p: 4 / 3 },
      { v: 0.9, e: 2.2941573387, p: 2.0647416048 },
      { v: 0.99, e: 7.0888120501, p: 7.0179239296 },
    ]
    for (const { v, e, p } of expected) {
      const reading = particleReading(v)
      expect(reading.energy).toBeCloseTo(e, 9)
      expect(reading.momentumTimesC).toBeCloseTo(p, 9)
      expect(reading.speed).toBeCloseTo(v, 12)
    }
  })

  it('2. E² − (pc)² is 1 for every observer, every particle speed and every passing speed', () => {
    for (const v of PARTICLE_SPEEDS) {
      const lab = particleReading(v)
      expect(lab.invariant).toBeCloseTo(1, 9)
      for (const u of OBSERVER_SPEEDS) {
        const seen = readingFor(u, lab)
        const scale = seen.energy * seen.energy + seen.momentumTimesC * seen.momentumTimesC
        expect(Math.abs(seen.energy * seen.energy - seen.momentumTimesC * seen.momentumTimesC - 1)).toBeLessThanOrEqual(1e-11 * scale)
      }
    }
  })

  it('3. the transformation is the same one as for time and position', () => {
    for (const v of PARTICLE_SPEEDS) {
      for (const u of OBSERVER_SPEEDS) {
        const lab = particleReading(v)
        const direct = lorentzTransform({ time: lab.energy, position: lab.momentumTimesC }, u)
        const seen = readingFor(u, lab)
        expect(seen.energy).toBe(direct.time)
        expect(seen.momentumTimesC).toBe(direct.position)
      }
    }
  })

  it('4. the speed another observer measures is (v − u) ÷ (1 − uv), always below 1; the own observer finds E = 1 and p = 0', () => {
    for (const v of PARTICLE_SPEEDS) {
      for (const u of OBSERVER_SPEEDS) {
        const seen = readingFor(u, particleReading(v))
        expect(seen.speed).toBeCloseTo((v - u) / (1 - u * v), 9)
        expect(Math.abs(seen.speed)).toBeLessThan(1)
      }
      const own = runInvariantExperiment('particle', v, 0).own!
      expect(own.energy).toBeCloseTo(1, 12)
      expect(own.momentumTimesC).toBeCloseTo(0, 12)
    }
    // The example in the introduction: v = 0.6, u = 0.3 gives 0.366, not 0.3.
    expect(readingFor(0.3, particleReading(0.6)).speed).toBeCloseTo(0.3 / 0.82, 12)
  })

  it('4b. the example for v = 0.6 and u = 0.3 matches the specification', () => {
    const seen = readingFor(0.3, particleReading(0.6))
    expect(seen.energy).toBeCloseTo(1.0744919576, 9)
    expect(seen.momentumTimesC).toBeCloseTo(0.3931068138, 9)
  })

  it('5. light: no mass, speed 1 for every observer, energy shifted by √((1 − u) ÷ (1 + u)), and no rest frame', () => {
    for (const u of OBSERVER_SPEEDS) {
      const right = readingFor(u, lightReading(1))
      const left = readingFor(u, lightReading(-1))
      expect(Math.abs(right.invariant)).toBeLessThan(1e-9)
      expect(Math.abs(left.invariant)).toBeLessThan(1e-9)
      expect(right.speed).toBeCloseTo(1, 9)
      expect(left.speed).toBeCloseTo(-1, 9)
      expect(right.energy).toBeCloseTo(Math.sqrt((1 - u) / (1 + u)), 9)
      expect(left.energy).toBeCloseTo(Math.sqrt((1 + u) / (1 - u)), 9)
    }
    const result = runInvariantExperiment('light', 0, 0.6)
    expect(result.own).toBeNull()
    expect(result.kineticEnergy).toBeNull()
    expect(result.passing.energy).toBeCloseTo(0.5, 12)
  })

  it('6. kinetic energy: matches 1 ÷ D − 1, is stable at small speeds, exceeds Newton, and grows without bound', () => {
    for (const v of [0.1, 0.3, 0.6, 0.9, 0.99]) {
      expect(kineticEnergy(v)).toBeCloseTo(1 / timeDilationFactorFor(v) - 1, 10)
      expect(kineticEnergy(v)).toBeGreaterThan(newtonKineticEnergy(v))
    }
    // The stable form agrees with ½v² at small speeds, where 1 ÷ D − 1 would lose its accuracy.
    for (const v of [1e-3, 1e-5, 1e-7]) {
      expect(kineticEnergy(v) / newtonKineticEnergy(v)).toBeCloseTo(1, 5)
    }
    expect(kineticEnergy(0)).toBe(0)
    expect(kineticEnergy(0.999)).toBeGreaterThan(20)
    expect(kineticEnergy(0.99999)).toBeGreaterThan(200)
    // The ratio to Newton's value is strictly increasing with speed.
    const speeds = [0.1, 0.3, 0.5, 0.6, 0.8, 0.9, 0.99, 0.999]
    const ratios = speeds.map((v) => kineticEnergy(v) / newtonKineticEnergy(v))
    for (let i = 1; i < ratios.length; i++) expect(ratios[i]).toBeGreaterThan(ratios[i - 1])
    // The table in the specification: ratios 1.07, 1.39, 2.08, 3.20 and 12.4 at 0.3c, 0.6c, 0.8c, 0.9c and 0.99c.
    const table = [
      [0.3, 1.07],
      [0.6, 1.39],
      [0.8, 2.08],
      [0.9, 3.2],
      [0.99, 12.4],
    ]
    for (const [v, ratio] of table) expect(Math.abs(kineticEnergy(v) / newtonKineticEnergy(v) - ratio)).toBeLessThan(0.05)
    // The tutor's example: from 0.99c to 0.999c the kinetic energy rises from 6.09 to 21.4 rest energies.
    expect(kineticEnergy(0.99)).toBeCloseTo(6.0888, 3)
    expect(kineticEnergy(0.999)).toBeCloseTo(21.3663, 3)
  })

  it('7. collision in the lab frame: total momentum zero, the lump at rest and heavier than 2m', () => {
    for (const v of [0, ...PRESET_COLLISION_SPEEDS, 0.99]) {
      const result = runCollisionExperiment(v, 0)
      expect(totalsOf(result.labBefore).momentumTimesC).toBe(0)
      expect(result.labAfter.momentumTimesC).toBe(0)
      expect(result.labAfter.speed).toBe(0)
      const expectedMass = 2 / timeDilationFactorFor(v)
      expect(result.lumpMass).toBeCloseTo(expectedMass, 12)
      if (v > 0) expect(result.lumpMass).toBeGreaterThan(2)
      // The extra mass is the total kinetic energy of the two particles.
      expect(result.extraMass).toBeCloseTo(2 * kineticEnergy(v), 10)
    }
    expect(runCollisionExperiment(1e-4, 0).lumpMass - 2).toBeLessThan(1e-7)
    // The table: 2.097, 2.500, 3.333, 4.588 times m at 0.3c, 0.6c, 0.8c and 0.9c.
    const masses = [2.0966, 2.5, 3.3333, 4.5883]
    PRESET_COLLISION_SPEEDS.forEach((v, i) => expect(runCollisionExperiment(v, 0).lumpMass).toBeCloseTo(masses[i], 3))
  })

  it('8. collision as a passing observer: total energy and total momentum before equal after, and the mass is the same', () => {
    for (const v of PRESET_COLLISION_SPEEDS) {
      for (const u of OBSERVER_SPEEDS) {
        const result = runCollisionExperiment(v, u)
        const before = totalsOf(result.passingBefore)
        const scale = before.energy
        close(before.energy, result.passingAfter.energy, scale)
        close(before.momentumTimesC, result.passingAfter.momentumTimesC, scale)
        close(systemMassOf(result.passingBefore), result.lumpMass, scale)
        close(systemMassOf([result.passingAfter]), result.lumpMass, scale)
      }
    }
  })

  it('9. the conservation in test 8 is checked independently of how the module builds the lump', () => {
    for (const v of PRESET_COLLISION_SPEEDS) {
      for (const u of OBSERVER_SPEEDS) {
        const factor = timeDilationFactorFor(v)
        const mass = 2 / factor
        const speedFactor = timeDilationFactorFor(u)
        // The lump, built here: at rest in the lab with energy M, then transformed by hand.
        const lumpEnergy = mass / speedFactor
        const lumpMomentum = (-u * mass) / speedFactor
        // Each particle, built here from E = 1 ÷ D and p × c = ± v ÷ D, then transformed by hand.
        const energyOf = (sign: number) => (1 / factor - u * ((sign * v) / factor)) / speedFactor
        const momentumOf = (sign: number) => ((sign * v) / factor - u / factor) / speedFactor
        const result = runCollisionExperiment(v, u)
        close(energyOf(1) + energyOf(-1), lumpEnergy, lumpEnergy)
        close(momentumOf(1) + momentumOf(-1), lumpMomentum, lumpEnergy)
        close(result.passingAfter.energy, lumpEnergy, lumpEnergy)
        close(result.passingAfter.momentumTimesC, lumpMomentum, lumpEnergy)
        close(totalsOf(result.passingBefore).energy, lumpEnergy, lumpEnergy)
      }
    }
  })

  it('10. the everyday momentum m·v is not conserved for the passing observer, but nearly is at small speeds', () => {
    const result = runCollisionExperiment(0.6, 0.3)
    expect(result.newtonMomentumBefore).toBeCloseTo(-0.3968582, 6)
    expect(result.newtonMomentumAfter).toBeCloseTo(-0.6, 12)
    expect(Math.abs(result.newtonMomentumBefore - result.newtonMomentumAfter)).toBeGreaterThan(0.2)
    const small = runCollisionExperiment(0.01, 0.005)
    expect(Math.abs(small.newtonMomentumBefore - small.newtonMomentumAfter)).toBeLessThan(1e-3)
    const same = runCollisionExperiment(0.6, 0)
    expect(same.newtonMomentumBefore).toBeCloseTo(same.newtonMomentumAfter, 12)
    // The relativistic momentum is conserved in the same case (test 8).
    const totals = totalsOf(result.passingBefore)
    expect(totals.momentumTimesC).toBeCloseTo(result.passingAfter.momentumTimesC, 12)
  })

  it('11. two 1-kilogram lumps at 100 m/s each gain 1.11 × 10⁻¹³ kg', () => {
    const extra = everydayCollisionExtraMassKg(1, 100)
    expect(extra).toBeCloseTo(1.11e-13, 15)
    // The total energy of motion, 2 × ½ × 1 × 100² = 10,000 J, divided by c².
    expect(extra).toBeCloseTo(10_000 / (SPEED_OF_LIGHT_METERS_PER_SECOND * SPEED_OF_LIGHT_METERS_PER_SECOND), 17)
  })

  it('12. the real-world numbers of the tutor: a 6.5 TeV proton', () => {
    const energyInRestEnergies = 6.5e6 / PROTON_REST_ENERGY_MEV
    expect(energyInRestEnergies).toBeCloseTo(6927.63, 1)
    expect(speedFromEnergy(energyInRestEnergies)).toBeLessThan(1)
    expect(speedDeficit(energyInRestEnergies) / 1.04e-8).toBeCloseTo(1, 2)
    expect(speedFromEnergy(3)).toBeCloseTo(Math.sqrt(8 / 9), 12)
    expect(speedFromEnergy(1)).toBe(0)
    // The electron's rest energy, as a named constant: the PET scan's photon energy.
    expect(ELECTRON_REST_ENERGY_MEV).toBeCloseTo(0.511, 3)
  })

  it('13. out-of-range inputs throw RangeError', () => {
    for (const bad of [-0.1, 1, 1.5, NaN, Infinity]) {
      expect(() => particleReading(bad)).toThrow(RangeError)
      expect(() => kineticEnergy(bad)).toThrow(RangeError)
      expect(() => runCollisionExperiment(bad, 0)).toThrow(RangeError)
      expect(() => runReactionExperiment('annihilation', bad, 0)).toThrow(RangeError)
    }
    for (const bad of [1, -1, 1.5, NaN]) {
      expect(() => readingFor(bad, particleReading(0.5))).toThrow(RangeError)
      expect(() => runInvariantExperiment('light', 0, bad)).toThrow(RangeError)
      expect(() => runCollisionExperiment(0.5, bad)).toThrow(RangeError)
      expect(() => runReactionExperiment('helium-binding', 0, bad)).toThrow(RangeError)
    }
    expect(() => speedFromEnergy(0.5)).toThrow(RangeError)
    expect(() => runReactionExperiment('pair-creation', 0, 0)).toThrow(RangeError)
    expect(() => runReactionExperiment('pair-creation', -1, 0)).toThrow(RangeError)
    expect(() => runReactionExperiment('pair-creation', NaN, 0)).toThrow(RangeError)
  })

  it('14. the results are a pure function of the inputs', () => {
    expect(runInvariantExperiment('particle', 0.6, 0.3)).toEqual(runInvariantExperiment('particle', 0.6, 0.3))
    expect(runCollisionExperiment(0.6, 0.3)).toEqual(runCollisionExperiment(0.6, 0.3))
    expect(runReactionExperiment('pair-creation', 2, 0.3)).toEqual(runReactionExperiment('pair-creation', 2, 0.3))
  })

  it('15. the system mass is the same before and after, for the lab and for a passing observer', () => {
    for (const v of PRESET_COLLISION_SPEEDS) {
      for (const u of OBSERVER_SPEEDS) {
        const result = runCollisionExperiment(v, u)
        close(result.systemMass, result.lumpMass)
        close(systemMassOf(result.passingBefore), result.systemMass, result.systemMass * 10)
      }
    }
    // The pieces' masses added are not the system's mass.
    expect(runCollisionExperiment(0.6, 0).systemMass).toBeCloseTo(2.5, 12)
    for (const { kind, parameters } of REACTIONS) {
      for (const parameter of parameters) {
        for (const u of OBSERVER_SPEEDS) {
          const result = runReactionExperiment(kind, parameter, u)
          const scale = totalsOfPieces(result.passingBefore).energy
          close(result.systemMassBefore, result.systemMassAfter, result.systemMassBefore)
          close(systemMassOf(result.passingBefore.map((p) => p.reading)), result.systemMassBefore, scale)
          close(systemMassOf(result.passingAfter.map((p) => p.reading)), result.systemMassBefore, scale)
        }
      }
    }
  })

  it('16. annihilation: two photons with the particles\' energy, all the rest mass gone, conserved for every observer', () => {
    for (const v of [0, 0.6, 0.9]) {
      const result = runReactionExperiment('annihilation', v, 0)
      const energy = 1 / timeDilationFactorFor(v)
      expect(result.labAfter).toHaveLength(2)
      expect(result.labAfter[0].reading.energy).toBeCloseTo(energy, 12)
      expect(result.labAfter[0].reading.momentumTimesC).toBeCloseTo(energy, 12)
      expect(result.labAfter[1].reading.momentumTimesC).toBeCloseTo(-energy, 12)
      expect(result.sumOfRestMassesBefore).toBe(2)
      expect(result.sumOfRestMassesAfter).toBe(0)
      expect(result.energyReleased).toBe(2)
      expect(result.created).toBe(true)
    }
    // At rest, each photon has one rest energy: 0.511 MeV for the electron and positron, the PET scan's photons.
    const atRest = runReactionExperiment('annihilation', 0, 0)
    expect(atRest.labAfter[0].reading.energy * ELECTRON_REST_ENERGY_MEV).toBeCloseTo(0.511, 3)
    // A passing observer finds the energies shifted by √((1 − u) ÷ (1 + u)) and its inverse; the example at u = 0.3.
    for (const u of OBSERVER_SPEEDS) {
      const result = runReactionExperiment('annihilation', 0, u)
      expect(result.passingAfter[0].reading.energy).toBeCloseTo(Math.sqrt((1 - u) / (1 + u)), 9)
      expect(result.passingAfter[1].reading.energy).toBeCloseTo(Math.sqrt((1 + u) / (1 - u)), 9)
    }
    const example = runReactionExperiment('annihilation', 0, 0.3)
    expect(example.passingAfter[0].reading.energy).toBeCloseTo(0.7338, 4)
    expect(example.passingAfter[1].reading.energy).toBeCloseTo(1.3628, 4)
    expect(totalsOfPieces(example.passingAfter).energy).toBeCloseTo(2 / timeDilationFactorFor(0.3), 12)
    expect(totalsOfPieces(example.passingAfter).momentumTimesC).toBeCloseTo((-2 * 0.3) / timeDilationFactorFor(0.3), 12)
  })

  it('17. pair creation: nothing below the threshold, a pair at rest at it, and a pair moving above it', () => {
    expect(PAIR_CREATION_THRESHOLD).toBe(1)
    expect(runReactionExperiment('pair-creation', 0.5, 0).created).toBe(false)
    expect(runReactionExperiment('pair-creation', 0.999999, 0).created).toBe(false)
    expect(runReactionExperiment('pair-creation', 1, 0).created).toBe(true)

    const atThreshold = runReactionExperiment('pair-creation', 1, 0)
    expect(atThreshold.labAfter[0].reading.speed).toBe(0)
    expect(atThreshold.labAfter[0].reading.energy).toBe(1)

    for (const [energy, speed] of [
      [2, 0.8660254],
      [5, 0.9797959],
    ]) {
      const result = runReactionExperiment('pair-creation', energy, 0)
      expect(result.labAfter[0].reading.speed).toBeCloseTo(speed, 6)
      expect(result.labAfter[0].reading.speed).toBeCloseTo(speedFromEnergy(energy), 12)
      expect(result.labAfter[0].reading.energy).toBe(energy)
      expect(result.labAfter[1].reading.speed).toBeCloseTo(-speed, 6)
      expect(result.sumOfRestMassesBefore).toBe(0)
      expect(result.sumOfRestMassesAfter).toBe(2)
      expect(result.energyReleased).toBe(-2)
      expect(result.systemMassBefore).toBeCloseTo(2 * energy, 12)
    }

    // The threshold is exactly where the system's mass reaches 2: the pair is made if and only if the mass allows it.
    for (const energy of [0.1, 0.5, 0.9, 0.9999, 1, 1.0001, 1.5, 3, 10]) {
      const result = runReactionExperiment('pair-creation', energy, 0)
      expect(result.created).toBe(result.systemMassBefore >= 2)
    }
    // Below the threshold nothing changes: the pulses pass each other.
    const below = runReactionExperiment('pair-creation', 0.5, 0.3)
    expect(below.labAfter).toEqual(below.labBefore)
    expect(below.energyReleased).toBe(0)
  })

  it('18. helium-4: the measured masses give a mass defect of 28.295 MeV, 0.753 percent, and agree with the accepted binding energy', () => {
    const parts = 2 * PROTON_REST_ENERGY_MEV + 2 * NEUTRON_REST_ENERGY_MEV
    expect(parts).toBeCloseTo(3755.674, 3)
    expect(parts - HELIUM4_NUCLEUS_REST_ENERGY_MEV).toBeCloseTo(28.295, 3)
    // The three constants are consistent with the accepted binding energy (they are from memory, see the module).
    expect(Math.abs(parts - HELIUM4_NUCLEUS_REST_ENERGY_MEV - HELIUM4_BINDING_ENERGY_MEV)).toBeLessThan(0.001)
    const result = runReactionExperiment('helium-binding', 0, 0)
    expect(result.energyReleased).toBeCloseTo(28.295, 3)
    expect((result.energyReleased / result.sumOfRestMassesBefore) * 100).toBeCloseTo(0.753, 3)
    expect(result.labBefore).toHaveLength(4)
    expect(result.labAfter).toHaveLength(3)
    expect(result.labAfter[1].reading.energy).toBeCloseTo(14.1475, 3)
    expect(result.labAfter[2].reading.momentumTimesC).toBeCloseTo(-result.labAfter[1].reading.momentumTimesC, 12)
  })

  it("19. the Sun's mass loss from its luminosity is about 4 million tonnes per second", () => {
    const lossKgPerSecond = SOLAR_LUMINOSITY_WATTS / (SPEED_OF_LIGHT_METERS_PER_SECOND * SPEED_OF_LIGHT_METERS_PER_SECOND)
    expect(lossKgPerSecond / 1e9).toBeCloseTo(4.26, 2)
    // Within 10 percent of "about 4 million tonnes per second" (4 × 10⁹ kg/s), the rounded value of the sources.
    expect(Math.abs(lossKgPerSecond - 4e9) / 4e9).toBeLessThan(0.1)
  })

  it('20. conservation in every reaction is checked by summing the pieces here, not by trusting the module', () => {
    for (const { kind, parameters } of REACTIONS) {
      for (const parameter of parameters) {
        for (const u of OBSERVER_SPEEDS) {
          const result = runReactionExperiment(kind, parameter, u)
          // Lab: the pieces before and after are summed here.
          const labBefore = totalsOfPieces(result.labBefore)
          const labAfter = totalsOfPieces(result.labAfter)
          close(labBefore.energy, labAfter.energy, labBefore.energy)
          close(labBefore.momentumTimesC, labAfter.momentumTimesC, labBefore.energy)
          expect(labBefore.momentumTimesC).toBeCloseTo(0, 9)
          // The passing observer: the totals as the transformed lab totals.
          const expectedEnergy = (labBefore.energy - u * labBefore.momentumTimesC) / timeDilationFactorFor(u)
          const expectedMomentum = (labBefore.momentumTimesC - u * labBefore.energy) / timeDilationFactorFor(u)
          const before = totalsOfPieces(result.passingBefore)
          const after = totalsOfPieces(result.passingAfter)
          close(before.energy, expectedEnergy, expectedEnergy)
          close(before.momentumTimesC, expectedMomentum, expectedEnergy)
          close(after.energy, expectedEnergy, expectedEnergy)
          close(after.momentumTimesC, expectedMomentum, expectedEnergy)
          // The sum of the rest masses before and after is the sum of the pieces' own masses, whatever the observer.
          expect(result.sumOfRestMassesBefore).toBe(result.labBefore.reduce((s, p) => s + p.restMass, 0))
          expect(result.sumOfRestMassesAfter).toBe(result.labAfter.reduce((s, p) => s + p.restMass, 0))
        }
      }
    }
  })

  it('every piece with a rest mass has E² − (pc)² equal to that mass squared, and every light pulse has zero', () => {
    for (const { kind, parameters } of REACTIONS) {
      for (const parameter of parameters) {
        for (const u of [0, 0.6, -0.3]) {
          const result = runReactionExperiment(kind, parameter, u)
          for (const piece of [...result.passingBefore, ...result.passingAfter]) {
            const scale = piece.reading.energy * piece.reading.energy + piece.reading.momentumTimesC * piece.reading.momentumTimesC
            expect(Math.abs(piece.reading.invariant - piece.restMass * piece.restMass)).toBeLessThanOrEqual(1e-9 * Math.max(1, scale))
          }
        }
      }
    }
  })

  it('a particle at rest in the lab has energy 1 and no momentum, and a passing observer sees it move the other way', () => {
    const rest = particleReading(0)
    expect(rest.energy).toBe(1)
    expect(rest.momentumTimesC).toBe(0)
    const seen = readingFor(0.6, rest)
    expect(seen.energy).toBeCloseTo(1.25, 12)
    expect(seen.momentumTimesC).toBeCloseTo(-0.75, 12)
    expect(seen.speed).toBeCloseTo(-0.6, 12)
    expect(leftMovingParticleReading(0.6).momentumTimesC).toBeCloseTo(-0.75, 12)
    const reading: EnergyMomentumReading = lightReading(1)
    expect(reading.invariant).toBe(0)
  })
})
