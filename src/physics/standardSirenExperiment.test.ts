import { describe, expect, it } from 'vitest'
import { chirpStateAt } from './gravitationalWaveChirpExperiment'
import {
  detectedAmplitude,
  estimatedHubbleConstant,
  inferredDistanceMpc,
  RECESSION_VELOCITY_KM_PER_S,
} from './standardSirenExperiment'

describe('detectedAmplitude', () => {
  it('follows the exact inverse-distance law', () => {
    expect(detectedAmplitude(1, 10)).toBeCloseTo(0.1, 10)
    expect(detectedAmplitude(2, 4)).toBeCloseTo(0.5, 10)
  })

  it('doubling distance exactly halves detected amplitude', () => {
    const trueAmplitude = 0.4
    const near = detectedAmplitude(trueAmplitude, 20)
    const far = detectedAmplitude(trueAmplitude, 40)
    expect(far).toBeCloseTo(near / 2, 10)
  })
})

describe('inferredDistanceMpc', () => {
  it('exactly recovers the distance used to compute a detected amplitude', () => {
    const trueAmplitude = 0.37
    for (const distanceMpc of [5, 40, 400, 1000]) {
      const detected = detectedAmplitude(trueAmplitude, distanceMpc)
      expect(inferredDistanceMpc(trueAmplitude, detected)).toBeCloseTo(distanceMpc, 8)
    }
  })
})

describe('distance vs. detected amplitude', () => {
  it('for equal mass, a farther distance produces a strictly smaller detected amplitude', () => {
    const trueAmplitude = 0.25
    const nearby = detectedAmplitude(trueAmplitude, 10)
    const far = detectedAmplitude(trueAmplitude, 1000)
    expect(far).toBeLessThan(nearby)
  })
})

describe('estimatedHubbleConstant', () => {
  it('returns null when given a null recession velocity (the GW150914 case)', () => {
    expect(estimatedHubbleConstant(RECESSION_VELOCITY_KM_PER_S.gw150914, 400)).toBeNull()
  })

  it('returns the plain, correctly computed ratio of velocity to distance otherwise', () => {
    expect(estimatedHubbleConstant(3017, 40)).toBeCloseTo(3017 / 40, 10)
    expect(estimatedHubbleConstant(RECESSION_VELOCITY_KM_PER_S.gw170817, 40)).toBeCloseTo(75.425, 10)
  })
})

describe('reuse of chirpStateAt amplitude', () => {
  it('true amplitude is read directly from chirpStateAt, not recomputed', () => {
    const mass = 2
    const baseFrequency = 2
    const baseAmplitude = 0.1
    const state = chirpStateAt(0, mass, baseFrequency, baseAmplitude)
    // chirpStateAt's own documented behavior: at time 0, amplitude equals baseAmplitude * mass.
    expect(state.amplitude).toBeCloseTo(baseAmplitude * mass, 10)
    // This experiment must use that value as-is, with no independent recomputation.
    expect(detectedAmplitude(state.amplitude, 10)).toBeCloseTo(state.amplitude / 10, 10)
  })
})
