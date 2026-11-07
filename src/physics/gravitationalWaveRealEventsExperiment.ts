// No new physical formula. Maps two real, named gravitational-wave detections onto
// gravitationalWaveChirpExperiment.ts's and gravitationalWaveEnergyExperiment.ts's existing
// dimensionless mass scale (0.2-6, from blackHoleExperiment.ts), as a presentation choice, not a
// physical calculation. See this experiment's specification, "Physics Model" and "Decisions
// Confirmed" items 5-7.
//
// Audit update (2026-11-07, docs/audit/gravitational-waves/04-draft-wording.md, section 11): the
// functions below the presets table compute every number the comparison picture, Table 1, the
// guess mark and the tutor show, from the existing chirp and energy modules. They add no physics.

import { chirpRunSummary } from './gravitationalWaveChirpExperiment'
import { energyRunSummary } from './gravitationalWaveEnergyExperiment'

export interface RealEventPreset {
  id: 'gw150914' | 'gw170817'
  label: string
  realDescription: string
  toyMass: number
  hadLightCounterpart: boolean
}

export const REAL_EVENT_PRESETS: RealEventPreset[] = [
  {
    id: 'gw150914',
    label: 'GW150914 (two black holes)',
    realDescription:
      'Detected 14 September 2015 — the first gravitational wave ever observed. Two black holes of about 36 and 29 times the mass of our Sun merged into one of about 62 Suns, about 1.3 billion light-years away.',
    toyMass: 5.5,
    // A confirmed light counterpart. Fermi reported a weak flash 0.4 s after GW150914 that was never
    // confirmed (see FERMI_GW150914_REPORT), so this stays false.
    hadLightCounterpart: false,
  },
  {
    id: 'gw170817',
    label: 'GW170817 (two neutron stars)',
    realDescription:
      'Detected 17 August 2017 — also seen in light. Two neutron stars with a combined mass of about 2.7 Suns, each between about 1.2 and 1.6 Suns, merged about 130 million light-years away. A burst of gamma rays reached telescopes about 1.7 seconds after the gravitational wave.',
    toyMass: 0.3,
    hadLightCounterpart: true,
  },
]

// ---- Numbers for the comparison picture, Table 1, the guess mark and the tutor ----

export interface EventRunSummary {
  mass: number
  // The time to the final moment: the length of the run.
  runTime: number
  startPitch: number
  finalPitch: number
  // The wave's loudness (amplitude) at the start and at the final moment.
  startLoudness: number
  finalLoudness: number
  swings: number
  finalStrain: number
  finalArmXLength: number
  finalArmYLength: number
  startEnergy: number
  finalEnergyLeft: number
  finalEnergyRadiated: number
  shareLeft: number
}

// One run's numbers at any toy mass: the two events' masses (Part 1) or the learner's own (Part 2).
export function eventRunSummary(mass: number): EventRunSummary {
  const chirp = chirpRunSummary(mass)
  const energy = energyRunSummary(mass)
  return {
    mass,
    runTime: chirp.cutoffTime,
    startPitch: chirp.startFrequency,
    finalPitch: chirp.endFrequency,
    startLoudness: chirp.startAmplitude,
    finalLoudness: chirp.endAmplitude,
    swings: chirp.swings,
    finalStrain: chirp.finalStrain,
    finalArmXLength: chirp.finalArmXLength,
    finalArmYLength: chirp.finalArmYLength,
    startEnergy: energy.startEnergy,
    finalEnergyLeft: energy.finalRemainingEnergy,
    finalEnergyRadiated: energy.finalRadiatedEnergy,
    shareLeft: energy.shareLeft,
  }
}

export function eventPresetSummary(id: RealEventPreset['id']): EventRunSummary {
  const preset = REAL_EVENT_PRESETS.find((candidate) => candidate.id === id)
  if (!preset) {
    throw new Error(`Unknown event preset ${id}`)
  }
  return eventRunSummary(preset.toyMass)
}

export interface EventComparison {
  blackHoles: EventRunSummary
  neutronStars: EventRunSummary
  // Each ratio is the larger number divided by the smaller; "blackHoles larger" for all but
  // runTime, where the neutron stars' run is the longer one.
  ratios: {
    mass: number
    finalLoudness: number
    runTime: number
    startEnergy: number
    finalEnergyLeft: number
    finalEnergyRadiated: number
  }
}

export function eventComparison(): EventComparison {
  const blackHoles = eventPresetSummary('gw150914')
  const neutronStars = eventPresetSummary('gw170817')
  return {
    blackHoles,
    neutronStars,
    ratios: {
      mass: blackHoles.mass / neutronStars.mass,
      finalLoudness: blackHoles.finalLoudness / neutronStars.finalLoudness,
      runTime: neutronStars.runTime / blackHoles.runTime,
      startEnergy: blackHoles.startEnergy / neutronStars.startEnergy,
      finalEnergyLeft: blackHoles.finalEnergyLeft / neutronStars.finalEnergyLeft,
      finalEnergyRadiated: blackHoles.finalEnergyRadiated / neutronStars.finalEnergyRadiated,
    },
  }
}

// ---- The learner's guess: "which event produced the louder, faster-rising chirp?" ----
export type LouderChoice = 'black-holes' | 'neutron-stars' | 'same'

// Which row of the comparison picture the white mark sits against: an event's row, or both rows
// joined (for "the same", where the mark is only a marker and has no size of its own).
export type LouderMarker = 'gw150914' | 'gw170817' | 'both'

export function louderGuessMarker(choice: LouderChoice): LouderMarker {
  if (choice === 'black-holes') return 'gw150914'
  if (choice === 'neutron-stars') return 'gw170817'
  return 'both'
}

const SAME_TOLERANCE = 1e-9

// The real answer, computed from the model (it replaces the component's ACTUAL_LOUDER constant): an
// event "produced the louder, faster-rising chirp" if its final loudness is larger and its run is
// shorter. If neither event wins on both, or they are equal, the answer is "the same".
export function louderOutcome(): LouderChoice {
  const { blackHoles, neutronStars } = eventComparison()
  const louderBlackHoles = blackHoles.finalLoudness > neutronStars.finalLoudness * (1 + SAME_TOLERANCE)
  const fasterBlackHoles = blackHoles.runTime < neutronStars.runTime * (1 - SAME_TOLERANCE)
  const louderNeutronStars = neutronStars.finalLoudness > blackHoles.finalLoudness * (1 + SAME_TOLERANCE)
  const fasterNeutronStars = neutronStars.runTime < blackHoles.runTime * (1 - SAME_TOLERANCE)
  if (louderBlackHoles && fasterBlackHoles) return 'black-holes'
  if (louderNeutronStars && fasterNeutronStars) return 'neutron-stars'
  return 'same'
}

export const louderGuessMatches = (choice: LouderChoice): boolean => choice === louderOutcome()

// ---- Facts about the real events (Table 2). Not results of this page's calculation. ----
// Each figure is from the source named beside it, read on 2026-11-07 (abstracts of the papers; LIGO and
// NASA pages through a summariser). The light-year figures are LIGO's and NASA's own roundings of
// the papers' distances in megaparsecs.
export const REAL_EVENT_FACTS = {
  gw150914: {
    date: '14 September 2015',
    blackHoleSolarMasses: [36, 29],
    finalSolarMass: 62,
    radiatedSolarMasses: 3.0,
    distanceMegaparsecs: 410,
    distanceLightYearsText: 'about 1.3 billion',
    source: 'arXiv 1602.03837 (masses, energy, distance in megaparsecs); LIGO Caltech, "What are gravitational waves?" (1.3 billion light-years)',
  },
  gw170817: {
    date: '17 August 2017',
    totalSolarMass: 2.74,
    // The paper's range when the stars' spins are restricted to those seen in known neutron stars.
    eachSolarMassRange: [1.17, 1.6],
    distanceMegaparsecs: 40,
    distanceLightYearsText: 'about 130 million',
    gammaRayDelaySeconds: 1.7,
    hostGalaxy: 'NGC 4993',
    source: 'arXiv 1710.05832 and 1710.05833 (masses, distance in megaparsecs, 1.7 s, NGC 4993); NASA and LIGO pages (130 million light-years)',
  },
} as const

// What Fermi's team reported about GW150914 (Connaughton et al., ApJL 826, L6, arXiv 1602.03920, abstract
// read): a weak flash, never confirmed. INTEGRAL saw nothing (arXiv 1602.04180); a re-analysis calls it
// background (arXiv 1606.00314); Fermi's team replied (arXiv 1801.02305).
export const FERMI_GW150914_REPORT = {
  delaySeconds: 0.4,
  falseAlarmProbability: 0.0022,
  confirmed: false,
} as const
