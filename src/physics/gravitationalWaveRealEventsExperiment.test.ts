import { describe, expect, it } from 'vitest'
import { chirpRunFor, chirpRunSummary } from './gravitationalWaveChirpExperiment'
import { energyRunSummary, orbitalEnergyStateAt } from './gravitationalWaveEnergyExperiment'
import {
  FERMI_GW150914_REPORT,
  REAL_EVENT_FACTS,
  REAL_EVENT_PRESETS,
  eventComparison,
  eventPresetSummary,
  eventRunSummary,
  louderGuessMarker,
  louderGuessMatches,
  louderOutcome,
} from './gravitationalWaveRealEventsExperiment'
import type { LouderChoice } from './gravitationalWaveRealEventsExperiment'

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

describe('eventRunSummary (the numbers behind the comparison picture, Table 1 and the tutor)', () => {
  it('equals the chirp and energy modules at the same mass, for the two events and across the slider', () => {
    for (let mass = 0.2; mass <= 6.0001; mass += 0.1) {
      const run = eventRunSummary(mass)
      const chirp = chirpRunSummary(mass)
      const energy = energyRunSummary(mass)
      expect(run.runTime).toBe(chirp.cutoffTime)
      expect(run.finalLoudness).toBe(chirp.endAmplitude)
      expect(run.startEnergy).toBe(energy.startEnergy)
      expect(run.finalEnergyRadiated).toBe(energy.finalRadiatedEnergy)
      for (const value of Object.values(run)) {
        expect(Number.isFinite(value)).toBe(true)
      }
    }
  })

  it('gives the figures drawn in the draft wording for the two events (mass 5.5 and 0.3)', () => {
    const bh = eventPresetSummary('gw150914')
    const ns = eventPresetSummary('gw170817')
    expect(bh.mass).toBe(5.5)
    expect(ns.mass).toBe(0.3)
    expect(bh.runTime).toBeCloseTo(0.1636, 3)
    expect(ns.runTime).toBeCloseTo(3.0, 9)
    expect(bh.finalLoudness).toBeCloseTo(0.522, 3)
    expect(ns.finalLoudness).toBeCloseTo(0.028, 3)
    expect(bh.startLoudness).toBeCloseTo(0.165, 3)
    expect(ns.startLoudness).toBeCloseTo(0.009, 3)
    expect(bh.swings).toBeCloseTo(0.25, 2)
    expect(ns.swings).toBeCloseTo(4.6, 1)
    expect(bh.startEnergy).toBeCloseTo(5.5, 9)
    expect(bh.finalEnergyLeft).toBeCloseTo(0.55, 9)
    expect(bh.finalEnergyRadiated).toBeCloseTo(4.95, 9)
    expect(ns.startEnergy).toBeCloseTo(0.3, 9)
    expect(ns.finalEnergyLeft).toBeCloseTo(0.03, 9)
    expect(ns.finalEnergyRadiated).toBeCloseTo(0.27, 9)
  })

  it('gives the arm lengths of the worked moments: each arm moves by half the strain', () => {
    for (const id of ['gw150914', 'gw170817'] as const) {
      const run = eventPresetSummary(id)
      expect(run.finalArmXLength).toBeCloseTo(1 + run.finalStrain / 2, 9)
      expect(run.finalArmYLength).toBeCloseTo(1 - run.finalStrain / 2, 9)
    }
    // The black-hole run ends near a peak (strain 0.522: arms 1.261 and 0.739); the neutron-star run
    // ends part-way through a swing (strain -0.010: arms 0.995 and 1.005), as in "Where the Energy Comes From".
    expect(eventPresetSummary('gw150914').finalArmXLength).toBeCloseTo(1.261, 3)
    expect(eventPresetSummary('gw150914').finalArmYLength).toBeCloseTo(0.739, 3)
    expect(eventPresetSummary('gw170817').finalArmXLength).toBeCloseTo(0.995, 3)
    expect(eventPresetSummary('gw170817').finalArmYLength).toBeCloseTo(1.005, 3)
  })

  it('has the same start pitch, final pitch and share of energy left for every mass', () => {
    const { blackHoles, neutronStars } = eventComparison()
    expect(blackHoles.startPitch).toBe(1)
    expect(neutronStars.startPitch).toBe(1)
    expect(blackHoles.finalPitch).toBeCloseTo(Math.sqrt(10), 9)
    expect(blackHoles.finalPitch).toBeCloseTo(neutronStars.finalPitch, 9)
    expect(blackHoles.shareLeft).toBeCloseTo(0.1, 9)
    expect(neutronStars.shareLeft).toBeCloseTo(0.1, 9)
  })

  it('keeps left plus radiated equal to the starting energy', () => {
    for (let mass = 0.2; mass <= 6.0001; mass += 0.2) {
      const run = eventRunSummary(mass)
      expect(run.finalEnergyLeft + run.finalEnergyRadiated).toBeCloseTo(run.startEnergy, 9)
    }
  })

  it('rejects an unknown preset', () => {
    expect(() => eventPresetSummary('gw000000' as 'gw150914')).toThrow()
  })
})

describe('eventComparison', () => {
  it('has the black-hole run louder, shorter and with more energy, by the ratio of the two toy masses', () => {
    const { blackHoles, neutronStars, ratios } = eventComparison()
    const massRatio = 5.5 / 0.3
    expect(blackHoles.finalLoudness).toBeGreaterThan(neutronStars.finalLoudness)
    expect(blackHoles.runTime).toBeLessThan(neutronStars.runTime)
    expect(blackHoles.startEnergy).toBeGreaterThan(neutronStars.startEnergy)
    expect(ratios.mass).toBeCloseTo(massRatio, 9)
    expect(ratios.finalLoudness).toBeCloseTo(massRatio, 9)
    expect(ratios.runTime).toBeCloseTo(massRatio, 9)
    expect(ratios.startEnergy).toBeCloseTo(massRatio, 9)
    expect(ratios.finalEnergyLeft).toBeCloseTo(massRatio, 9)
    expect(ratios.finalEnergyRadiated).toBeCloseTo(massRatio, 9)
    expect(ratios.mass).toBeCloseTo(18.3, 1)
  })

  it('uses the presets table unchanged: the comparison reads each event\'s toy mass from it', () => {
    const { blackHoles, neutronStars } = eventComparison()
    expect(blackHoles.mass).toBe(REAL_EVENT_PRESETS.find((p) => p.id === 'gw150914')!.toyMass)
    expect(neutronStars.mass).toBe(REAL_EVENT_PRESETS.find((p) => p.id === 'gw170817')!.toyMass)
  })
})

describe('the learner\'s guess', () => {
  const choices: LouderChoice[] = ['black-holes', 'neutron-stars', 'same']

  it('computes the real answer from the model: the black holes', () => {
    expect(louderOutcome()).toBe('black-holes')
  })

  it('marks only the black-hole guess as matching', () => {
    expect(louderGuessMatches('black-holes')).toBe(true)
    expect(louderGuessMatches('neutron-stars')).toBe(false)
    expect(louderGuessMatches('same')).toBe(false)
  })

  it('puts the white mark against a different row for each guess, and joins both rows for "the same"', () => {
    expect(louderGuessMarker('black-holes')).toBe('gw150914')
    expect(louderGuessMarker('neutron-stars')).toBe('gw170817')
    expect(louderGuessMarker('same')).toBe('both')
    expect(new Set(choices.map(louderGuessMarker)).size).toBe(3)
  })

  it('does not change any number when the guess changes (the real numbers do not depend on it)', () => {
    const before = JSON.stringify(eventComparison())
    for (const choice of choices) {
      louderGuessMarker(choice)
      louderGuessMatches(choice)
    }
    expect(JSON.stringify(eventComparison())).toBe(before)
  })
})

describe('the facts about the real events (Table 2)', () => {
  it('has the masses, distances and delay from the papers and agency pages read on 2026-11-07', () => {
    const a = REAL_EVENT_FACTS.gw150914
    const b = REAL_EVENT_FACTS.gw170817
    expect(a.blackHoleSolarMasses).toEqual([36, 29])
    expect(a.finalSolarMass).toBe(62)
    expect(a.radiatedSolarMasses).toBe(3)
    expect(a.distanceMegaparsecs).toBe(410)
    expect(b.totalSolarMass).toBe(2.74)
    expect(b.distanceMegaparsecs).toBe(40)
    expect(b.gammaRayDelaySeconds).toBe(1.7)
    expect(b.hostGalaxy).toBe('NGC 4993')
  })

  it('is consistent: the black holes\' masses less the radiated energy give the final mass, and the neutron stars\' range holds the total', () => {
    const a = REAL_EVENT_FACTS.gw150914
    const b = REAL_EVENT_FACTS.gw170817
    const sum = a.blackHoleSolarMasses[0] + a.blackHoleSolarMasses[1]
    expect(Math.abs(sum - a.radiatedSolarMasses - a.finalSolarMass)).toBeLessThan(1)
    expect(b.eachSolarMassRange[0] * 2).toBeLessThan(b.totalSolarMass)
    expect(b.eachSolarMassRange[1] * 2).toBeGreaterThanOrEqual(b.totalSolarMass)
  })

  it('records the Fermi report on GW150914 as unconfirmed, and keeps the black-hole preset at "no confirmed light"', () => {
    expect(FERMI_GW150914_REPORT.delaySeconds).toBe(0.4)
    expect(FERMI_GW150914_REPORT.falseAlarmProbability).toBeCloseTo(0.0022, 4)
    expect(FERMI_GW150914_REPORT.confirmed).toBe(false)
    expect(REAL_EVENT_PRESETS.find((p) => p.id === 'gw150914')!.hadLightCounterpart).toBe(false)
  })

  it('states the papers\' figures in the presets\' descriptions', () => {
    const bh = REAL_EVENT_PRESETS.find((p) => p.id === 'gw150914')!.realDescription
    const ns = REAL_EVENT_PRESETS.find((p) => p.id === 'gw170817')!.realDescription
    expect(bh).toContain('36 and 29')
    expect(bh).toContain('62')
    expect(ns).toContain('2.7')
    expect(ns).toContain('1.7 seconds')
    expect(ns).not.toContain('1.4')
  })
})
