// This experiment deliberately does NOT reuse gravitationalWaveRedshiftExperiment.ts's
// dopplerFactorFor. That function models a source kinematically moving through space, which is
// the wrong mechanism for cosmological recession - there, space itself expands while light is in
// transit. See this experiment's specification ("Physics Model", "Decisions Confirmed" item 2)
// for why reusing it, even caveated, would teach a real misconception rather than a harmless
// simplification.

// Real-unit constants, in the same style as gpsTimeDilationExperiment.ts's real-Earth-unit
// constants - this experiment uses real units throughout, not an abstracted control.
export const REAL_SPEED_OF_LIGHT_KM_PER_S = 299_792.458 // km/s
export const HUBBLE_CONSTANT_KM_PER_S_PER_MPC = 70 // an illustrative round value; see assumptions
export const HUBBLE_TENSION_RANGE_KM_PER_S_PER_MPC: [number, number] = [67, 73] // real published range

export interface GalaxyPreset {
  label: string
  distanceMpc: number
}

export const GALAXY_PRESETS: GalaxyPreset[] = [
  { label: 'Virgo Cluster', distanceMpc: 16.5 },
  { label: 'Coma Cluster', distanceMpc: 100 },
  { label: 'A very distant galaxy', distanceMpc: 200 },
]

export const MAX_CUSTOM_DISTANCE_MPC = 200

// Hubble's Law, expressed as recession speed (the traditional way it's usually stated) - used for
// the learner-facing "how fast is it receding" figure, not for the redshift itself.
export function recessionSpeedKmPerS(distanceMpc: number): number {
  return HUBBLE_CONSTANT_KM_PER_S_PER_MPC * distanceMpc
}

// The one genuinely new physical idea: the real, low-redshift relationship between distance and
// cosmological redshift, z = H0 * d / c - caused by space expanding while light travels, not by
// motion through space. Valid only while z is small (nearby galaxies); see the specification's
// "Simplifying assumptions".
export function cosmologicalRedshift(distanceMpc: number): number {
  return (HUBBLE_CONSTANT_KM_PER_S_PER_MPC * distanceMpc) / REAL_SPEED_OF_LIGHT_KM_PER_S
}

// The resulting stretching factor applied to the light's wavelength (1 + z) - the number the
// diagram's color shift and the Results panel both read directly, so the displayed redshift and
// the underlying physics always agree.
export function wavelengthStretchFactor(distanceMpc: number): number {
  return 1 + cosmologicalRedshift(distanceMpc)
}

export interface HubblesLawResult {
  distanceMpc: number
  recessionSpeedKmPerS: number
  redshift: number
  wavelengthStretchFactor: number
}

export function runHubblesLawExperiment(distanceMpc: number): HubblesLawResult {
  if (!(distanceMpc > 0)) {
    throw new RangeError('Distance must be greater than zero')
  }

  return {
    distanceMpc,
    recessionSpeedKmPerS: recessionSpeedKmPerS(distanceMpc),
    redshift: cosmologicalRedshift(distanceMpc),
    wavelengthStretchFactor: wavelengthStretchFactor(distanceMpc),
  }
}
