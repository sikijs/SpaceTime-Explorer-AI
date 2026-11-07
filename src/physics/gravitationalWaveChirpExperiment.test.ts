import { describe, expect, it } from 'vitest'
import { BASE_ARM_LENGTH } from './gravitationalWaveExperiment'
import {
  chirpArmTrace,
  chirpCheckUp,
  REAL_CHIRP,
  chirpRunFor,
  chirpStateAt,
  BASE_AMPLITUDE,
  BASE_FREQUENCY,
  PART1_MASS,
  REFERENCE_PAIRS,
  armMoveForStrain,
  chirpRunSummary,
  firstAndLastSwing,
  graphHalfRange,
  loudnessGuessMatches,
  loudnessGuessRatio,
  loudnessOutcome,
  pitchGuessMatches,
  pitchGuessRatio,
  pitchOutcome,
  timingGuessMatches,
  timingGuessTargets,
  timingGuessTargetsBetween,
  timingOutcome,
} from './gravitationalWaveChirpExperiment'

describe('chirpStateAt', () => {
  it('at time = 0, frequency and amplitude equal their base values, for any valid mass', () => {
    for (const mass of [0.2, 1, 3.5, 6]) {
      const state = chirpStateAt(0, mass, 2, 0.1)
      expect(state.frequency).toBeCloseTo(2, 10)
      expect(state.amplitude).toBeCloseTo(0.1 * mass, 10)
    }
  })

  it('frequency and amplitude are strictly increasing over the run', () => {
    const mass = 1.5
    const baseFrequency = 2
    const baseAmplitude = 0.1
    const { cutoffTime } = chirpRunFor(mass, baseFrequency, baseAmplitude)
    let previous = chirpStateAt(0, mass, baseFrequency, baseAmplitude)
    for (let i = 1; i <= 20; i++) {
      const time = (i / 20) * cutoffTime
      const current = chirpStateAt(time, mass, baseFrequency, baseAmplitude)
      expect(current.frequency).toBeGreaterThan(previous.frequency)
      expect(current.amplitude).toBeGreaterThan(previous.amplitude)
      previous = current
    }
  })

  it('the two arms deviate from the rest length by exactly equal and opposite amounts', () => {
    const mass = 1
    const baseFrequency = 3
    const baseAmplitude = 0.1
    const { cutoffTime } = chirpRunFor(mass, baseFrequency, baseAmplitude)
    for (const fraction of [0, 0.1, 0.4, 0.7, 0.99]) {
      const { armXLength, armYLength } = chirpStateAt(fraction * cutoffTime, mass, baseFrequency, baseAmplitude)
      const xDeviation = armXLength - BASE_ARM_LENGTH
      const yDeviation = armYLength - BASE_ARM_LENGTH
      expect(xDeviation).toBeCloseTo(-yDeviation, 10)
    }
  })

  it('a larger mass produces a strictly shorter cutoffTime', () => {
    const baseFrequency = 2
    const baseAmplitude = 0.1
    const small = chirpRunFor(0.5, baseFrequency, baseAmplitude)
    const large = chirpRunFor(2, baseFrequency, baseAmplitude)
    expect(large.cutoffTime).toBeLessThan(small.cutoffTime)
  })

  it('a larger mass produces a strictly larger amplitude at the same fraction of its own run', () => {
    const baseFrequency = 2
    const baseAmplitude = 0.1
    const fraction = 0.5
    const smallMass = 0.5
    const largeMass = 2
    const smallRun = chirpRunFor(smallMass, baseFrequency, baseAmplitude)
    const largeRun = chirpRunFor(largeMass, baseFrequency, baseAmplitude)
    const smallState = chirpStateAt(fraction * smallRun.cutoffTime, smallMass, baseFrequency, baseAmplitude)
    const largeState = chirpStateAt(fraction * largeRun.cutoffTime, largeMass, baseFrequency, baseAmplitude)
    expect(largeState.amplitude).toBeGreaterThan(smallState.amplitude)
  })

  it('cutoffTime is strictly less than mergerTime, for any valid mass', () => {
    for (const mass of [0.2, 1, 3.5, 6]) {
      const { mergerTime, cutoffTime } = chirpRunFor(mass, 2, 0.1)
      expect(cutoffTime).toBeLessThan(mergerTime)
    }
  })

  it('rejects a non-positive mass, baseFrequency, baseAmplitude, or a negative time', () => {
    expect(() => chirpRunFor(0, 2, 0.1)).toThrow(RangeError)
    expect(() => chirpRunFor(-1, 2, 0.1)).toThrow(RangeError)
    expect(() => chirpRunFor(1, 0, 0.1)).toThrow(RangeError)
    expect(() => chirpRunFor(1, -2, 0.1)).toThrow(RangeError)
    expect(() => chirpRunFor(1, 2, 0)).toThrow(RangeError)
    expect(() => chirpRunFor(1, 2, -0.1)).toThrow(RangeError)

    expect(() => chirpStateAt(0, 0, 2, 0.1)).toThrow(RangeError)
    expect(() => chirpStateAt(0, -1, 2, 0.1)).toThrow(RangeError)
    expect(() => chirpStateAt(0, 1, 0, 0.1)).toThrow(RangeError)
    expect(() => chirpStateAt(0, 1, -2, 0.1)).toThrow(RangeError)
    expect(() => chirpStateAt(0, 1, 2, 0)).toThrow(RangeError)
    expect(() => chirpStateAt(0, 1, 2, -0.1)).toThrow(RangeError)
    expect(() => chirpStateAt(-0.01, 1, 2, 0.1)).toThrow(RangeError)
  })

  it('rejects a time greater than the run\'s own cutoffTime', () => {
    const mass = 1
    const baseFrequency = 2
    const baseAmplitude = 0.1
    const { cutoffTime } = chirpRunFor(mass, baseFrequency, baseAmplitude)
    expect(() => chirpStateAt(cutoffTime * 1.01, mass, baseFrequency, baseAmplitude)).toThrow(RangeError)
  })

  it('is deterministic across repeated calls for the same inputs', () => {
    const a = chirpStateAt(0.2, 1.3, 2, 0.1)
    const b = chirpStateAt(0.2, 1.3, 2, 0.1)
    expect(a).toEqual(b)
  })

  it('scaling baseFrequency or baseAmplitude alone scales frequency/amplitude proportionally, without changing mergerTime or cutoffTime', () => {
    const mass = 1.2
    const baseFrequency = 2
    const baseAmplitude = 0.1
    const time = 0.3

    const base = chirpRunFor(mass, baseFrequency, baseAmplitude)
    const baseState = chirpStateAt(time, mass, baseFrequency, baseAmplitude)

    const scaledFrequencyRun = chirpRunFor(mass, baseFrequency * 3, baseAmplitude)
    const scaledFrequencyState = chirpStateAt(time, mass, baseFrequency * 3, baseAmplitude)
    expect(scaledFrequencyRun.mergerTime).toBeCloseTo(base.mergerTime, 10)
    expect(scaledFrequencyRun.cutoffTime).toBeCloseTo(base.cutoffTime, 10)
    expect(scaledFrequencyState.frequency).toBeCloseTo(baseState.frequency * 3, 8)

    const scaledAmplitudeRun = chirpRunFor(mass, baseFrequency, baseAmplitude * 4)
    const scaledAmplitudeState = chirpStateAt(time, mass, baseFrequency, baseAmplitude * 4)
    expect(scaledAmplitudeRun.mergerTime).toBeCloseTo(base.mergerTime, 10)
    expect(scaledAmplitudeRun.cutoffTime).toBeCloseTo(base.cutoffTime, 10)
    expect(scaledAmplitudeState.amplitude).toBeCloseTo(baseState.amplitude * 4, 8)
  })
})

describe('chirpRunSummary (audit additions)', () => {
  it('Part 1 uses mass 0.3 and the two reference pairs are 0.3 and 3.0', () => {
    expect(PART1_MASS).toBe(0.3)
    expect([...REFERENCE_PAIRS]).toEqual([0.3, 3.0])
  })

  it('mass 0.3: final moment 3.000, 4.56 swings, frequency 1 to 3.162, amplitude 0.009 to 0.028', () => {
    const s = chirpRunSummary(0.3)
    expect(s.cutoffTime).toBeCloseTo(3, 10)
    expect(s.swings).toBeCloseTo(4.558, 2)
    expect(s.startFrequency).toBeCloseTo(1, 10)
    expect(s.endFrequency).toBeCloseTo(3.1623, 3)
    expect(s.startAmplitude).toBeCloseTo(0.009, 10)
    expect(s.endAmplitude).toBeCloseTo(0.02846, 4)
  })

  it('the rise is 1 ÷ √0.1 = 3.162 for every mass, for both frequency and amplitude', () => {
    for (const mass of [0.2, 0.3, 0.5, 1, 3, 6]) {
      const s = chirpRunSummary(mass)
      expect(s.rise).toBeCloseTo(1 / Math.sqrt(0.1), 6)
      expect(s.endAmplitude / s.startAmplitude).toBeCloseTo(1 / Math.sqrt(0.1), 6)
    }
  })

  it('the arms at the final moment are not at an extreme (mass 0.3: strain about −0.010, 0.995 and 1.005)', () => {
    const s = chirpRunSummary(0.3)
    expect(s.finalStrain).toBeCloseTo(-0.0102, 3)
    expect(s.finalArmXLength).toBeCloseTo(0.9949, 3)
    expect(s.finalArmYLength).toBeCloseTo(1.0051, 3)
    expect(s.armXMin).toBeCloseTo(0.9897, 3)
    expect(s.armXMax).toBeCloseTo(1.0124, 3)
    // the shortest and longest lengths are not the final lengths, and not ± half the final amplitude
    expect(s.armXMax - 1).not.toBeCloseTo(s.endAmplitude / 2, 3)
  })

  it('Arm Y is Arm X mirrored about the rest length', () => {
    const s = chirpRunSummary(0.3)
    expect(s.armYMin).toBeCloseTo(0.9876, 3)
    expect(s.armYMax).toBeCloseTo(1.0103, 3)
    expect(s.armXMin + s.armYMax).toBeCloseTo(2, 10)
    expect(s.finalArmXLength + s.finalArmYLength).toBeCloseTo(2, 10)
  })

  it('mass 3.0 has 0.46 of a swing and mass 6 has 0.23 of a swing (less than a quarter)', () => {
    expect(chirpRunSummary(3).swings).toBeCloseTo(0.456, 2)
    expect(chirpRunSummary(3).cutoffTime).toBeCloseTo(0.3, 10)
    const heavy = chirpRunSummary(6)
    expect(heavy.swings).toBeCloseTo(0.228, 2)
    expect(heavy.swings).toBeLessThan(0.25)
  })

  it('mass 6: Arm X only rises (never below 1.000) and ends near 1.28; Arm Y only falls', () => {
    const s = chirpRunSummary(6)
    expect(s.armXMin).toBeGreaterThanOrEqual(1)
    expect(s.armXMin).toBeLessThan(1.001)
    expect(s.finalArmXLength).toBeCloseTo(1.282, 2)
    expect(s.armYMax).toBeLessThanOrEqual(1)
    expect(s.finalArmYLength).toBeCloseTo(0.718, 2)
  })

  it('a heavier pair is shorter and louder: amplitude at the final moment is ten times larger for 3.0 than 0.3', () => {
    const light = chirpRunSummary(0.3)
    const heavy = chirpRunSummary(3)
    expect(heavy.cutoffTime).toBeLessThan(light.cutoffTime)
    expect(heavy.cutoffTime).toBeCloseTo(light.cutoffTime / 10, 10)
    expect(heavy.endAmplitude / light.endAmplitude).toBeCloseTo(10, 6)
  })

  it('every number matches chirpStateAt at the same time', () => {
    const s = chirpRunSummary(0.3)
    const end = chirpStateAt(s.cutoffTime, 0.3, BASE_FREQUENCY, BASE_AMPLITUDE)
    expect(s.finalStrain).toBeCloseTo(end.strain, 6)
    expect(s.endFrequency).toBeCloseTo(end.frequency, 10)
    expect(s.endAmplitude).toBeCloseTo(end.amplitude, 10)
  })
})

describe('graphHalfRange', () => {
  it('is the largest move from rest, rounded up to the next 0.01', () => {
    expect(graphHalfRange(0.2)).toBeCloseTo(0.01, 10)
    expect(graphHalfRange(0.3)).toBeCloseTo(0.02, 10)
    expect(graphHalfRange(6)).toBeCloseTo(0.29, 10)
  })

  it('always contains both arms for the whole run, at every slider mass', () => {
    for (const mass of [0.2, 0.3, 0.5, 1, 2, 3, 4.5, 6]) {
      const s = chirpRunSummary(mass)
      const half = graphHalfRange(mass)
      expect(half).toBeGreaterThanOrEqual(s.largestMoveFromRest - 1e-9)
      expect(half - s.largestMoveFromRest).toBeLessThan(0.0100001)
    }
  })
})

describe('firstAndLastSwing', () => {
  it('mass 0.3: first swing about 0.93, one swing at the final moment 1 ÷ 3.162 = 0.316', () => {
    const f = firstAndLastSwing(0.3)
    expect(f.firstSwingLength).toBeCloseTo(0.925, 2)
    expect(f.lastSwingLength).toBeCloseTo(1 / 3.16228, 3)
    expect(f.lastSwingLength).toBeLessThan(f.firstSwingLength)
  })

  it('mass 0.3: first peak at time 0.25 moving each arm 0.0047; last peak at time 2.9 moving it 0.0124', () => {
    const f = firstAndLastSwing(0.3)
    expect(f.firstPeak!.time).toBeCloseTo(0.25, 2)
    expect(f.firstPeak!.armMove).toBeCloseTo(0.0047, 3)
    expect(f.lastPeak!.time).toBeCloseTo(2.9, 1)
    expect(f.lastPeak!.armMove).toBeCloseTo(0.0124, 3)
    expect(f.lastPeak!.armMove / f.firstPeak!.armMove).toBeGreaterThan(2.5)
    expect(f.lastPeak!.armMove / f.firstPeak!.armMove).toBeLessThan(2.7)
  })

  it('a run shorter than a quarter of a swing has no peak', () => {
    const f = firstAndLastSwing(6)
    expect(f.firstPeak).toBeNull()
    expect(f.lastPeak).toBeNull()
  })
})

describe('guess marks and outcomes', () => {
  it('each choice gives a different marker size, and "same" is exactly 1', () => {
    expect(pitchGuessRatio('speeds-up')).toBe(0.5)
    expect(pitchGuessRatio('slows-down')).toBe(2)
    expect(pitchGuessRatio('stays-the-same')).toBe(1)
    expect(loudnessGuessRatio('stronger')).toBe(2)
    expect(loudnessGuessRatio('weaker')).toBe(0.5)
    expect(loudnessGuessRatio('stays-the-same')).toBe(1)
  })

  it('the timing diamond sits on the small pair (0.3), the large pair (3.0) or both', () => {
    expect(timingGuessTargets('small-mass')).toEqual([0.3])
    expect(timingGuessTargets('large-mass')).toEqual([3.0])
    expect(timingGuessTargets('same-time')).toEqual([0.3, 3.0])
  })

  it('the real answers come from the model: pitch speeds up, louder, the large-mass pair sooner', () => {
    expect(pitchOutcome()).toBe('speeds-up')
    expect(loudnessOutcome()).toBe('stronger')
    expect(timingOutcome()).toBe('large-mass')
  })

  it('the match functions only say whether a guess equals the real answer', () => {
    expect(pitchGuessMatches('speeds-up')).toBe(true)
    expect(pitchGuessMatches('slows-down')).toBe(false)
    expect(loudnessGuessMatches('weaker')).toBe(false)
    expect(loudnessGuessMatches('stronger')).toBe(true)
    expect(timingGuessMatches('small-mass')).toBe(false)
    expect(timingGuessMatches('large-mass')).toBe(true)
  })

  it('a guess never changes the results: the summary is the same whatever was guessed', () => {
    const before = chirpRunSummary(0.3)
    pitchGuessRatio('slows-down')
    timingGuessTargets('same-time')
    expect(chirpRunSummary(0.3)).toEqual(before)
  })
})

describe('armMoveForStrain', () => {
  it('each arm moves by half the strain, whatever its sign', () => {
    expect(armMoveForStrain(0.028)).toBeCloseTo(0.014, 10)
    expect(armMoveForStrain(-0.028)).toBeCloseTo(0.014, 10)
    expect(armMoveForStrain(0)).toBe(0)
  })
})


describe('chirpArmTrace', () => {
  it('starts at rest, ends at the final moment, and matches chirpStateAt along the way', () => {
    const trace = chirpArmTrace(0.3, 300)
    expect(trace).toHaveLength(301)
    expect(trace[0].time).toBe(0)
    expect(trace[0].armXLength).toBeCloseTo(1, 10)
    expect(trace[300].time).toBeCloseTo(3, 10)
    for (const index of [60, 150, 300]) {
      const point = trace[index]
      const state = chirpStateAt(point.time, 0.3, BASE_FREQUENCY, BASE_AMPLITUDE)
      expect(point.armXLength).toBeCloseTo(state.armXLength, 6)
      expect(point.armYLength).toBeCloseTo(state.armYLength, 6)
    }
  })

  it('stays inside the graph range chosen for the run, at every slider mass', () => {
    for (const mass of [0.2, 0.5, 3, 6]) {
      const half = graphHalfRange(mass)
      for (const point of chirpArmTrace(mass)) {
        expect(Math.abs(point.armXLength - 1)).toBeLessThanOrEqual(half + 1e-9)
        expect(Math.abs(point.armYLength - 1)).toBeLessThanOrEqual(half + 1e-9)
      }
    }
  })
})

describe('chirpCheckUp', () => {
  it('GW150914 rose from 35 to 250 Hz, 7.14 times, about 2.84 octaves', () => {
    const c = chirpCheckUp()
    expect(REAL_CHIRP.startHz).toBe(35)
    expect(REAL_CHIRP.endHz).toBe(250)
    expect(c.realRise).toBeCloseTo(7.143, 3)
    expect(c.realOctaves).toBeCloseTo(2.837, 2)
  })

  it('this page rises 3.162 times, about 1.66 octaves, which is less than the real chirp', () => {
    const c = chirpCheckUp()
    expect(c.toyRise).toBeCloseTo(3.1623, 3)
    expect(c.toyOctaves).toBeCloseTo(1.66, 2)
    expect(c.toyRise).toBeLessThan(c.realRise)
  })

  it('the wave here is more than 10^19 times the real peak strain of 1.0e-21', () => {
    const c = chirpCheckUp()
    expect(c.toyEndAmplitude).toBeCloseTo(0.02846, 4)
    expect(c.timesLargerThanReal).toBeCloseTo(2.846e19, -17)
    expect(c.powerOfTenLarger).toBe(19)
  })
})

describe('timingGuessTargetsBetween (Drawing C)', () => {
  it('small-mass names the lighter pair and large-mass the heavier, whichever bar it is', () => {
    expect(timingGuessTargetsBetween('small-mass', 0.3, 3)).toEqual([0])
    expect(timingGuessTargetsBetween('large-mass', 0.3, 3)).toEqual([1])
    expect(timingGuessTargetsBetween('small-mass', 0.3, 0.2)).toEqual([1])
    expect(timingGuessTargetsBetween('large-mass', 0.3, 0.2)).toEqual([0])
  })

  it('"they take the same time", or two equal masses, put the guess on both bars', () => {
    expect(timingGuessTargetsBetween('same-time', 0.3, 3)).toEqual([0, 1])
    expect(timingGuessTargetsBetween('small-mass', 0.3, 0.3)).toEqual([0, 1])
    expect(timingGuessTargetsBetween('large-mass', 0.3, 0.3)).toEqual([0, 1])
  })

  it('the heavier pair is the one with the shorter time, so the real answer agrees with the targets', () => {
    for (const mass of [0.2, 0.5, 3, 6]) {
      const heavierIndex = timingGuessTargetsBetween('large-mass', 0.3, mass)[0]
      const times = [chirpRunSummary(0.3).cutoffTime, chirpRunSummary(mass).cutoffTime]
      expect(times[heavierIndex]).toBeLessThan(times[1 - heavierIndex])
    }
  })
})
