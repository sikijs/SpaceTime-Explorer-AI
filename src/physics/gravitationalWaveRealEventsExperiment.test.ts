import { describe, expect, it } from 'vitest'
import { chirpRunFor } from './gravitationalWaveChirpExperiment'
import { orbitalEnergyStateAt } from './gravitationalWaveEnergyExperiment'
import { REAL_EVENT_PRESETS } from './gravitationalWaveRealEventsExperiment'

function presetFor(id: 'gw150914' | 'gw170817') {
  const preset = REAL_EVENT_PRESETS.find((candidate) => candidate.id === id)
  if (!preset) {
    throw new Error(`Expected a preset with id ${id}`)
  }
  return preset
}

describe('REAL_EVENT_PRESETS', () => {
  it('has a toyMass strictly within the existing validated mass range [0.2, 6] for both presets', () => {
    for (const preset of REAL_EVENT_PRESETS) {
      expect(preset.toyMass).toBeGreaterThanOrEqual(0.2)
      expect(preset.toyMass).toBeLessThanOrEqual(6)
    }
  })

  it('maps GW150914 to a strictly larger toyMass than GW170817', () => {
    const gw150914 = presetFor('gw150914')
    const gw170817 = presetFor('gw170817')
    expect(gw150914.toyMass).toBeGreaterThan(gw170817.toyMass)
  })

  it('contains exactly the two specified events, each with a non-empty label and realDescription', () => {
    expect(REAL_EVENT_PRESETS.map((preset) => preset.id).sort()).toEqual(['gw150914', 'gw170817'])
    for (const preset of REAL_EVENT_PRESETS) {
      expect(preset.label.length).toBeGreaterThan(0)
      expect(preset.realDescription.length).toBeGreaterThan(0)
    }
  })

  it('each toyMass works with chirpRunFor/orbitalEnergyStateAt, and GW150914 reaches its final moment sooner than GW170817', () => {
    const gw150914 = presetFor('gw150914')
    const gw170817 = presetFor('gw170817')

    const gw150914Run = chirpRunFor(gw150914.toyMass, 1, 1)
    const gw170817Run = chirpRunFor(gw170817.toyMass, 1, 1)

    expect(() => orbitalEnergyStateAt(0, gw150914.toyMass)).not.toThrow()
    expect(() => orbitalEnergyStateAt(0, gw170817.toyMass)).not.toThrow()

    expect(gw150914Run.cutoffTime).toBeLessThan(gw170817Run.cutoffTime)
  })

  it('marks hadLightCounterpart true for GW170817 and false for GW150914', () => {
    expect(presetFor('gw170817').hadLightCounterpart).toBe(true)
    expect(presetFor('gw150914').hadLightCounterpart).toBe(false)
  })
})
