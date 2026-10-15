import { describe, it, expect } from 'vitest'
import { lightReading, makeReading, readingFor, systemMassOf, totalsOf } from './energyMomentum'
import {
  LHC_BEAM_ENERGY_GEV,
  NEUTRAL_PION_REST_ENERGY_MEV,
  PROTON_REST_ENERGY_MEV,
  canMake,
  largestMakeableMass,
  runDecay,
  runMakingExperiment,
  runSetup,
  stationaryTargetBeamEnergyFor,
  stationaryTargetSystemMass,
  thresholdKineticEnergy,
} from './makingNewParticles'

// Tests for Experiment 6 (docs/experiments/spacetime-geometry/06-making-new-particles.md, "Required Physics Tests"). The numbers
// in the tables of the specification are written out here by hand, so a wrong formula in the module cannot make a test pass.

const ENERGIES = [0.01, 0.5, 1, 2, 3, 5, 10, 100, 1000]
const NEW_MASSES = [0.5, 1, 2, 4]
const OBSERVER_SPEEDS = [-0.99, -0.8, -0.3, 0, 0.3, 0.6, 0.9, 0.99]
const DECAY_PIECE_MASSES = [0, 0.1, 0.25, 0.4, 0.5]

describe('Part 1: the stationary target (test 1)', () => {
  it('has total energy 2 + K, total momentum × c √(K² + 2K), and system mass √(4 + 2K), built from the pieces', () => {
    for (const K of ENERGIES) {
      const result = runSetup('stationary-target', K)
      // The pieces are built here, independently of the module: a beam particle of energy 1 + K, and a target at rest.
      const beamEnergy = 1 + K
      const beamMomentum = Math.sqrt(beamEnergy * beamEnergy - 1)
      const energy = beamEnergy + 1
      const momentum = beamMomentum
      expect(result.totalEnergy).toBeCloseTo(energy, 9)
      expect(result.totalMomentumTimesC).toBeCloseTo(momentum, 9)
      expect(result.systemMass).toBeCloseTo(Math.sqrt(energy * energy - momentum * momentum), 6)
      expect(result.systemMass).toBeCloseTo(Math.sqrt(4 + 2 * K), 6)
    }
  })

  it('gives the hand-worked example for K = 3: energy 5, momentum × c √15, mass √10 = 3.1623', () => {
    const result = runSetup('stationary-target', 3)
    expect(result.totalEnergy).toBeCloseTo(5, 9)
    expect(result.totalMomentumTimesC).toBeCloseTo(Math.sqrt(15), 9)
    expect(result.systemMass).toBeCloseTo(3.1623, 4)
  })
})

describe('Part 1: head-on beams (test 2)', () => {
  it('has total momentum 0 and system mass 2 + K', () => {
    for (const K of ENERGIES) {
      const result = runSetup('head-on', K)
      expect(result.totalMomentumTimesC).toBeCloseTo(0, 12)
      expect(result.totalEnergy).toBeCloseTo(2 + K, 9)
      expect(result.systemMass).toBeCloseTo(2 + K, 6)
      expect(result.labPieces[0].energy).toBeCloseTo(1 + K / 2, 9)
      expect(result.labPieces[0].momentumTimesC).toBeCloseTo(-result.labPieces[1].momentumTimesC, 12)
    }
  })

  it('gives each beam energy 2.5 at K = 3, and mass 5', () => {
    const result = runSetup('head-on', 3)
    expect(result.labPieces[0].energy).toBeCloseTo(2.5, 9)
    expect(result.systemMass).toBeCloseTo(5, 9)
  })
})

describe('Part 1: the two setups compared (test 3)', () => {
  it('head-on has the larger system mass for every K, and the two meet as K → 0', () => {
    for (const K of ENERGIES) {
      expect(runSetup('head-on', K).systemMass).toBeGreaterThan(runSetup('stationary-target', K).systemMass)
    }
    const tiny = 1e-6
    expect(runSetup('head-on', tiny).systemMass).toBeCloseTo(runSetup('stationary-target', tiny).systemMass, 5)
  })

  it('matches the table of system masses for K = 1, 2, 5, 10, 100', () => {
    const stationary = { 1: 2.4495, 2: 2.8284, 5: 3.7417, 10: 4.899, 100: 14.2829 }
    const headOn = { 1: 3, 2: 4, 5: 7, 10: 12, 100: 102 }
    for (const K of [1, 2, 5, 10, 100] as const) {
      expect(runSetup('stationary-target', K).systemMass).toBeCloseTo(stationary[K], 4)
      expect(runSetup('head-on', K).systemMass).toBeCloseTo(headOn[K], 9)
    }
  })
})

describe("Part 1: the system's own observer (test 4)", () => {
  it('moves at √(K ÷ (K + 2)) for the stationary target, and at rest for head-on', () => {
    const table = { 1: 0.5774, 2: 0.7071, 5: 0.8452, 10: 0.9129, 100: 0.9901 }
    for (const K of [1, 2, 5, 10, 100] as const) {
      expect(runSetup('stationary-target', K).ownObserverSpeed).toBeCloseTo(table[K], 4)
      expect(runSetup('stationary-target', K).ownObserverSpeed).toBeCloseTo(Math.sqrt(K / (K + 2)), 9)
      expect(runSetup('head-on', K).ownObserverSpeed).toBeCloseTo(0, 12)
    }
  })

  it('sees the stationary target as a head-on collision: total momentum 0, total energy the system mass, equal approach speeds', () => {
    for (const K of ENERGIES) {
      const result = runSetup('stationary-target', K)
      const own = totalsOf(result.ownPieces)
      expect(own.momentumTimesC).toBeCloseTo(0, 6)
      expect(own.energy).toBeCloseTo(result.systemMass, 6)
      // The beam particle moves right and the target left, at the same speed.
      expect(result.ownPieces[0].speed).toBeGreaterThanOrEqual(0)
      expect(result.ownPieces[0].speed).toBeCloseTo(-result.ownPieces[1].speed, 8)
    }
  })
})

describe('Part 1: usable and locked-in energy (test 5)', () => {
  it('usable energy is the total energy of motion in the own observer frame, summed from the transformed pieces', () => {
    for (const K of ENERGIES) {
      for (const setup of ['stationary-target', 'head-on'] as const) {
        const result = runSetup(setup, K)
        const kineticThere = result.ownPieces.reduce((sum, piece) => sum + (piece.energy - 1), 0)
        expect(result.usable).toBeCloseTo(kineticThere, 6)
        expect(result.usable).toBeCloseTo(result.systemMass - 2, 12)
      }
    }
  })

  it('locked-in energy is K − usable = total energy − system mass; it is 0 for head-on and all of K is usable', () => {
    for (const K of ENERGIES) {
      const stationary = runSetup('stationary-target', K)
      expect(stationary.lockedIn).toBeCloseTo(K - stationary.usable, 6)
      expect(stationary.lockedIn).toBeCloseTo(stationary.totalEnergy - stationary.systemMass, 12)
      expect(stationary.lockedIn).toBeGreaterThan(0)
      const headOn = runSetup('head-on', K)
      expect(headOn.lockedIn).toBeCloseTo(0, 6)
      expect(headOn.usable).toBeCloseTo(K, 6)
    }
  })

  it('matches the table of usable and locked-in energy, and the locked share rises with K', () => {
    const table = [
      { K: 1, usable: 0.4495, locked: 0.5505, share: 0.551 },
      { K: 2, usable: 0.8284, locked: 1.1716, share: 0.586 },
      { K: 5, usable: 1.7417, locked: 3.2583, share: 0.652 },
      { K: 10, usable: 2.899, locked: 7.101, share: 0.71 },
      { K: 100, usable: 12.2829, locked: 87.7171, share: 0.877 },
    ]
    let previous = 0
    for (const row of table) {
      const result = runSetup('stationary-target', row.K)
      expect(result.usable).toBeCloseTo(row.usable, 4)
      expect(result.lockedIn).toBeCloseTo(row.locked, 4)
      expect(result.lockedShare).toBeCloseTo(row.share, 3)
      expect(result.lockedShare).toBeGreaterThan(previous)
      previous = result.lockedShare
    }
  })
})

describe("Part 1: the system's mass is the same for every observer (test 6)", () => {
  it('is the same for the lab, the own observer and any other observer, in both setups', () => {
    for (const K of [0.5, 1, 3, 10, 100]) {
      for (const setup of ['stationary-target', 'head-on'] as const) {
        const result = runSetup(setup, K)
        expect(systemMassOf(result.ownPieces)).toBeCloseTo(result.systemMass, 5)
        for (const u of OBSERVER_SPEEDS) {
          const pieces = result.labPieces.map((piece) => readingFor(u, piece))
          expect(systemMassOf(pieces)).toBeCloseTo(result.systemMass, 4)
        }
      }
    }
  })
})

describe('Part 1: the threshold (tests 7 and 8)', () => {
  it('thresholds are X head-on and 2X + X²/2 against a stationary target (the table)', () => {
    const table = { 0.5: 1.125, 1: 2.5, 2: 6, 4: 16 }
    for (const X of NEW_MASSES) {
      expect(thresholdKineticEnergy('head-on', X)).toBeCloseTo(X, 12)
      expect(thresholdKineticEnergy('stationary-target', X)).toBeCloseTo(table[X as 0.5 | 1 | 2 | 4], 12)
    }
  })

  it('the system mass at the threshold is exactly 2 + X, and a particle cannot be made just below it', () => {
    for (const X of NEW_MASSES) {
      for (const setup of ['stationary-target', 'head-on'] as const) {
        const K = thresholdKineticEnergy(setup, X)
        expect(runSetup(setup, K).systemMass).toBeCloseTo(2 + X, 7)
        expect(canMake(runSetup(setup, K).systemMass, X)).toBe(true)
        expect(canMake(runSetup(setup, K * (1 + 1e-6)).systemMass, X)).toBe(true)
        expect(canMake(runSetup(setup, K * (1 - 1e-6)).systemMass, X)).toBe(false)
        expect(canMake(runSetup(setup, K * 2).systemMass, X)).toBe(true)
      }
    }
  })

  it('the largest mass that an energy can make is the table of largest masses', () => {
    const stationary = { 1: 0.449, 2: 0.828, 5: 1.742, 10: 2.899, 100: 12.283 }
    for (const K of [1, 2, 5, 10, 100] as const) {
      expect(largestMakeableMass('head-on', K)).toBeCloseTo(K, 12)
      expect(largestMakeableMass('stationary-target', K)).toBeCloseTo(stationary[K], 3)
    }
  })

  it('agrees with the "can it be made" table for the preset energies and masses', () => {
    // [K][X index] = [head-on can make, stationary target can make], for X = 0.5, 1, 2, 4.
    const table: Record<number, [boolean, boolean][]> = {
      1: [[true, false], [true, false], [false, false], [false, false]],
      2: [[true, true], [true, false], [true, false], [false, false]],
      5: [[true, true], [true, true], [true, false], [true, false]],
      10: [[true, true], [true, true], [true, true], [true, false]],
      100: [[true, true], [true, true], [true, true], [true, true]],
    }
    for (const K of [1, 2, 5, 10, 100]) {
      NEW_MASSES.forEach((X, i) => {
        const result = runMakingExperiment(K, X)
        expect(result.headOnCanMake).toBe(table[K][i][0])
        expect(result.stationaryTargetCanMake).toBe(table[K][i][1])
        expect(result.headOnThreshold).toBeCloseTo(X, 12)
        expect(result.stationaryTargetThreshold).toBeCloseTo(2 * X + (X * X) / 2, 12)
      })
    }
  })
})

describe('Part 1: real-world checks used by the tutor (test 9)', () => {
  it('a neutral pion from two protons: 279.66 MeV against a stationary proton, 134.98 MeV in total head-on', () => {
    const X = NEUTRAL_PION_REST_ENERGY_MEV / PROTON_REST_ENERGY_MEV
    expect(thresholdKineticEnergy('stationary-target', X) * PROTON_REST_ENERGY_MEV).toBeCloseTo(279.66, 2)
    expect(thresholdKineticEnergy('head-on', X) * PROTON_REST_ENERGY_MEV).toBeCloseTo(134.98, 2)
  })

  it('a 6.5 TeV proton on a stationary proton gives 110.45 GeV; matching 13 TeV needs about 9.006 × 10⁷ GeV', () => {
    const proton = PROTON_REST_ENERGY_MEV / 1000 // GeV
    expect(stationaryTargetSystemMass(LHC_BEAM_ENERGY_GEV, proton)).toBeCloseTo(110.45, 2)
    const needed = stationaryTargetBeamEnergyFor(2 * LHC_BEAM_ENERGY_GEV, proton)
    expect(needed).toBeCloseTo(9.006e7, -4) // 9.006 × 10⁷ GeV, to within 10⁴ GeV
    expect(needed / LHC_BEAM_ENERGY_GEV).toBeGreaterThan(13_800)
    expect(needed / LHC_BEAM_ENERGY_GEV).toBeLessThan(13_900)
    // The two functions undo each other.
    expect(stationaryTargetSystemMass(needed, proton)).toBeCloseTo(2 * LHC_BEAM_ENERGY_GEV, 4)
  })

  it('in rest energies the stationary-target mass formula is the √(4 + 2K) of the setup', () => {
    for (const K of [1, 3, 10]) {
      expect(stationaryTargetSystemMass(1 + K, 1)).toBeCloseTo(runSetup('stationary-target', K).systemMass, 9)
    }
  })
})

describe('Part 2: decay at rest (tests 10 and 11)', () => {
  it('gives each piece energy ½, p × c √(¼ − r²), and speed √(1 − 4r²) (the table)', () => {
    const table = [
      { r: 0, pc: 0.5, speed: 1, massGivenUp: 1 },
      { r: 0.1, pc: 0.4899, speed: 0.9798, massGivenUp: 0.8 },
      { r: 0.25, pc: 0.433, speed: 0.866, massGivenUp: 0.5 },
      { r: 0.4, pc: 0.3, speed: 0.6, massGivenUp: 0.2 },
      { r: 0.5, pc: 0, speed: 0, massGivenUp: 0 },
    ]
    for (const row of table) {
      const result = runDecay(row.r, 0)
      expect(result.allowed).toBe(true)
      expect(result.labPieces).toHaveLength(2)
      const [right, left] = result.labPieces
      expect(right.reading.energy).toBeCloseTo(0.5, 12)
      expect(left.reading.energy).toBeCloseTo(0.5, 12)
      expect(right.reading.momentumTimesC).toBeCloseTo(row.pc, 4)
      expect(left.reading.momentumTimesC).toBeCloseTo(-row.pc, 4)
      expect(right.reading.speed).toBeCloseTo(row.speed, 4)
      expect(result.sumOfRestMasses).toBeCloseTo(2 * row.r, 12)
      expect(result.massGivenUp).toBeCloseTo(row.massGivenUp, 12)
      // The pieces' kinetic energy together is the mass given up.
      const kinetic = result.labPieces.reduce((sum, p) => sum + (p.reading.energy - p.restMass), 0)
      expect(kinetic).toBeCloseTo(result.massGivenUp, 12)
    }
  })

  it('conserves energy 1 and momentum 0, and the pieces have the stated rest masses', () => {
    for (const r of DECAY_PIECE_MASSES) {
      const result = runDecay(r, 0)
      const totals = totalsOf(result.labPieces.map((p) => p.reading))
      expect(totals.energy).toBeCloseTo(1, 12)
      expect(totals.momentumTimesC).toBeCloseTo(0, 12)
      for (const piece of result.labPieces) {
        expect(piece.restMass).toBe(r)
        // E² − (pc)² is the piece's rest mass squared.
        expect(piece.reading.invariant).toBeCloseTo(r * r, 10)
      }
    }
  })

  it('allows a decay for r ≤ ½ and forbids it above; at r = ½ the pieces are at rest; r = 0 gives light with pc = E', () => {
    for (const r of DECAY_PIECE_MASSES) expect(runDecay(r, 0).allowed).toBe(true)
    for (const r of [0.5001, 0.55, 0.6, 1, 5]) expect(runDecay(r, 0).allowed).toBe(false)
    const threshold = runDecay(0.5, 0)
    expect(threshold.labPieces[0].reading.speed).toBeCloseTo(0, 12)
    const light = runDecay(0, 0)
    for (const piece of light.labPieces) {
      expect(piece.restMass).toBe(0)
      expect(Math.abs(piece.reading.momentumTimesC)).toBeCloseTo(piece.reading.energy, 12)
      expect(piece.label).toContain('light pulse')
    }
  })

  it('shows r = 0.6 as no decay: no pieces, the pieces would weigh 1.2, the parent is still there', () => {
    const result = runDecay(0.6, 0.3)
    expect(result.allowed).toBe(false)
    expect(result.labPieces).toHaveLength(0)
    expect(result.passingPieces).toHaveLength(0)
    expect(result.sumOfRestMasses).toBeCloseTo(1.2, 12)
    expect(result.massGivenUp).toBeLessThan(0)
    expect(result.labParent.energy).toBe(1)
    expect(result.systemMassLab).toBe(1)
  })
})

describe('Part 2: a passing observer (tests 12 to 14)', () => {
  it('conserves total energy and momentum for every observer, and finds the system mass 1 (the parent\'s mass)', () => {
    for (const r of DECAY_PIECE_MASSES) {
      for (const u of OBSERVER_SPEEDS) {
        const result = runDecay(r, u)
        const before = result.passingParent
        const after = totalsOf(result.passingPieces.map((p) => p.reading))
        expect(after.energy).toBeCloseTo(before.energy, 8)
        expect(after.momentumTimesC).toBeCloseTo(before.momentumTimesC, 8)
        expect(result.systemMassLab).toBeCloseTo(1, 9)
        expect(result.systemMassPassing).toBeCloseTo(1, 7)
        expect(result.passingParent.invariant).toBeCloseTo(1, 9)
      }
    }
  })

  it('matches the example r = 0.25, u = +0.3: pieces 0.3880 and 0.6603, total 1.0483 and −0.3145', () => {
    const result = runDecay(0.25, 0.3)
    const [right, left] = result.passingPieces
    expect(right.reading.energy).toBeCloseTo(0.388, 3)
    expect(right.reading.momentumTimesC).toBeCloseTo(0.2967, 4)
    expect(left.reading.energy).toBeCloseTo(0.6603, 4)
    expect(left.reading.momentumTimesC).toBeCloseTo(-0.6112, 4)
    const totals = totalsOf(result.passingPieces.map((p) => p.reading))
    expect(totals.energy).toBeCloseTo(1.0483, 4)
    expect(totals.momentumTimesC).toBeCloseTo(-0.3145, 4)
    expect(Math.sqrt(totals.energy ** 2 - totals.momentumTimesC ** 2)).toBeCloseTo(1, 4)
  })

  it('is checked independently of how runDecay builds the pieces: the transformed parent equals the transformed total', () => {
    for (const r of DECAY_PIECE_MASSES) {
      for (const u of [-0.6, -0.3, 0.3, 0.6]) {
        // The test builds the pieces itself: energy ½ each, p × c = ±√(¼ − r²), and transforms the parent (1, 0).
        const momentum = Math.sqrt(0.25 - r * r)
        const total = totalsOf([readingFor(u, makeReading(0.5, momentum)), readingFor(u, makeReading(0.5, -momentum))])
        const parent = readingFor(u, makeReading(1, 0))
        expect(total.energy).toBeCloseTo(parent.energy, 8)
        expect(total.momentumTimesC).toBeCloseTo(parent.momentumTimesC, 8)
      }
    }
  })

  it('matches Experiment 5 for light (r = 0): the pulses have ½ √((1 − u) ÷ (1 + u)) and ½ √((1 + u) ÷ (1 − u))', () => {
    for (const u of [-0.6, -0.3, 0.3, 0.6, 0.9]) {
      const result = runDecay(0, u)
      const [right, left] = result.passingPieces
      expect(right.reading.energy).toBeCloseTo(0.5 * Math.sqrt((1 - u) / (1 + u)), 9)
      expect(left.reading.energy).toBeCloseTo(0.5 * Math.sqrt((1 + u) / (1 - u)), 9)
      // The same factor as one pulse of lab energy 1 in Experiment 5.
      expect(right.reading.energy).toBeCloseTo(0.5 * readingFor(u, lightReading(1)).energy, 9)
    }
  })
})

describe('input checks and purity (tests 15 and 16)', () => {
  it('throws RangeError for out-of-range inputs', () => {
    expect(() => runSetup('head-on', 0)).toThrow(RangeError)
    expect(() => runSetup('stationary-target', -1)).toThrow(RangeError)
    expect(() => runSetup('head-on', Number.NaN)).toThrow(RangeError)
    expect(() => runMakingExperiment(1, 0)).toThrow(RangeError)
    expect(() => runMakingExperiment(1, -2)).toThrow(RangeError)
    expect(() => canMake(3, 0)).toThrow(RangeError)
    expect(() => thresholdKineticEnergy('head-on', 0)).toThrow(RangeError)
    expect(() => largestMakeableMass('head-on', 0)).toThrow(RangeError)
    expect(() => stationaryTargetSystemMass(0.5, 1)).toThrow(RangeError)
    expect(() => runDecay(-0.1, 0)).toThrow(RangeError)
    expect(() => runDecay(Number.NaN, 0)).toThrow(RangeError)
    expect(() => runDecay(0.25, 1)).toThrow(RangeError)
    expect(() => runDecay(0.25, -1)).toThrow(RangeError)
    expect(() => runDecay(0.25, Number.NaN)).toThrow(RangeError)
  })

  it('does not throw for r above ½: it returns allowed: false', () => {
    expect(() => runDecay(0.6, 0)).not.toThrow()
    expect(runDecay(0.6, 0).allowed).toBe(false)
  })

  it('gives the same result every time, so playback speed cannot change it', () => {
    expect(runMakingExperiment(5, 2)).toEqual(runMakingExperiment(5, 2))
    expect(runDecay(0.25, 0.3)).toEqual(runDecay(0.25, 0.3))
  })
})
