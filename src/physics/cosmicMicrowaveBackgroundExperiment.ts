// Real, measured value (Planck satellite) - the CMB's temperature today.
export const CMB_TEMPERATURE_TODAY_KELVIN = 2.725

// Real, precisely measured value (Planck 2018) - the redshift of recombination, i.e. how much
// the universe has expanded since recombination (today's scale factor / recombination's scale
// factor = 1 + z).
export const RECOMBINATION_REDSHIFT = 1089.8

// Commonly cited approximate value - stated as approximate, not derived from RECOMBINATION_REDSHIFT
// (that would require the universe's full expansion history, which this project does not model).
export const RECOMBINATION_YEARS_AFTER_BIG_BANG = 380_000

// The one genuinely new physical idea: a blackbody's temperature scales exactly with (1 + z),
// since a photon's wavelength stretches by exactly that factor and blackbody temperature is
// inversely proportional to wavelength. Unlike hubblesLawExperiment.ts's cosmologicalRedshift
// (a low-z APPROXIMATION of distance-to-redshift), this is an EXACT relationship between a given
// redshift and temperature - valid at any z, including the CMB's z ~ 1090. Deliberately does not
// import anything from hubblesLawExperiment.ts; see the specification's "Simplifying assumptions."
export function cmbTemperatureKelvin(redshift: number): number {
  return CMB_TEMPERATURE_TODAY_KELVIN * (1 + redshift)
}

export interface CmbResult {
  redshift: number
  temperatureKelvin: number
}

export function runCmbExperiment(redshift: number): CmbResult {
  return { redshift, temperatureKelvin: cmbTemperatureKelvin(redshift) }
}
