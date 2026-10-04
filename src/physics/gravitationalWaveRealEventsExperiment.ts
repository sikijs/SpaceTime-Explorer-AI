// No new physical formula. Maps two real, named gravitational-wave detections onto
// gravitationalWaveChirpExperiment.ts's and gravitationalWaveEnergyExperiment.ts's existing
// dimensionless mass scale (0.2-6, from blackHoleExperiment.ts), as a presentation choice, not a
// physical calculation. See this experiment's specification, "Physics Model" and "Decisions
// Confirmed" items 5-7.

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
      'Detected September 14, 2015 — the first gravitational wave ever observed. Two black holes, roughly 36 and 29 times the mass of our Sun, merged into one about 1.3 billion light-years away.',
    toyMass: 5.5,
    hadLightCounterpart: false,
  },
  {
    id: 'gw170817',
    label: 'GW170817 (two neutron stars)',
    realDescription:
      'Detected August 17, 2017 — also seen in light by telescopes around the world. Two neutron stars, each roughly 1.4 times the mass of our Sun, merged about 130 million light-years away; a gamma-ray burst arrived 1.7 seconds after the gravitational wave.',
    toyMass: 0.3,
    hadLightCounterpart: true,
  },
]
