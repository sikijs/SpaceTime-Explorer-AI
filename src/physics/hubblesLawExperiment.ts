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

// ---------------------------------------------------------------------------------------------
// Audit update (2026-11): the pair of galaxies, the guess marks, the tutor's marking, the
// check-up against published values and the worked example. Everything below is new; nothing
// above this line was changed. The interface only displays what these functions return (§9).
// ---------------------------------------------------------------------------------------------

// Part 1 draws a pair: Galaxy B (nearer) and Galaxy A, exactly twice as far (an imagined galaxy
// unless B is a real preset). Both guesses are about this pair.
export const PAIR_DISTANCE_RATIO = 2
export const PART1_NEAR_DISTANCE_MPC = GALAXY_PRESETS[0].distanceMpc // the Virgo Cluster, 16.5 Mpc
export const MIN_PAIR_NEAR_DISTANCE_MPC = 1
// A is twice B, so B stops at half the slider ceiling to keep A at or below it.
export const MAX_PAIR_NEAR_DISTANCE_MPC = MAX_CUSTOM_DISTANCE_MPC / PAIR_DISTANCE_RATIO

export interface HubblePair {
  near: HubblesLawResult // Galaxy B
  far: HubblesLawResult // Galaxy A, at PAIR_DISTANCE_RATIO times B's distance
}

export function runHubblePair(nearDistanceMpc: number): HubblePair {
  if (!(nearDistanceMpc > 0)) {
    throw new RangeError('Distance must be greater than zero')
  }
  return {
    near: runHubblesLawExperiment(nearDistanceMpc),
    far: runHubblesLawExperiment(nearDistanceMpc * PAIR_DISTANCE_RATIO),
  }
}

// --- The learner's two guesses -----------------------------------------------------------------

export type SpeedGuess = 'twice' | 'same' | 'half'
export type RedshiftGuess = 'nearer' | 'farther' | 'same'

// Guess 1 as a ratio: how many times B's speed the learner thinks A's speed is.
export function speedGuessRatio(guess: SpeedGuess): number {
  return guess === 'twice' ? 2 : guess === 'half' ? 0.5 : 1
}

// The length the white bar would have on the speed panel: A's speed if the guess were right.
export function guessedFarSpeedKmPerS(guess: SpeedGuess, nearDistanceMpc: number): number {
  return speedGuessRatio(guess) * runHubblesLawExperiment(nearDistanceMpc).recessionSpeedKmPerS
}

// The speed panel's scale runs from 0 to the longest bar it must hold: A's real bar or the white one.
export function speedPanelMaxKmPerS(pair: HubblePair, guess: SpeedGuess): number {
  return Math.max(
    pair.near.recessionSpeedKmPerS,
    pair.far.recessionSpeedKmPerS,
    guessedFarSpeedKmPerS(guess, pair.near.distanceMpc)
  )
}

// Guess 2 has no size of its own; it is only a marker, drawn on B's row, on A's row, or between.
export type RedshiftMarkerRow = 'near' | 'far' | 'between'
export function redshiftGuessMarkerRow(guess: RedshiftGuess): RedshiftMarkerRow {
  return guess === 'nearer' ? 'near' : guess === 'farther' ? 'far' : 'between'
}

// The real answers, read from the pair (never typed in): used only by the tutor to mark a guess.
const RATIO_TOLERANCE = 1e-9

export function actualSpeedAnswer(pair: HubblePair): SpeedGuess | null {
  const ratio = pair.far.recessionSpeedKmPerS / pair.near.recessionSpeedKmPerS
  for (const guess of ['twice', 'same', 'half'] as const) {
    if (Math.abs(ratio - speedGuessRatio(guess)) < RATIO_TOLERANCE) return guess
  }
  return null // some other ratio; none of the three answers
}

export function actualRedshiftAnswer(pair: HubblePair): RedshiftGuess {
  const difference = pair.far.redshift - pair.near.redshift
  if (Math.abs(difference) < RATIO_TOLERANCE) return 'same'
  return difference > 0 ? 'farther' : 'nearer'
}

export function speedGuessMatches(guess: SpeedGuess, pair: HubblePair): boolean {
  return actualSpeedAnswer(pair) === guess
}

export function redshiftGuessMatches(guess: RedshiftGuess, pair: HubblePair): boolean {
  return actualRedshiftAnswer(pair) === guess
}

// --- The check-up: this page's numbers beside published ones (values read 2026-11-14) ---------
// Hubble constant: Riess and others 2022 (arXiv 2112.04510, abstract) and Planck 2018 results VI
// (arXiv 1807.06209, abstract). Virgo: Mei and others 2007 (arXiv astro-ph/0702510, abstract).
// Coma: NASA/JPL PIA04210, "about 100 Mpc ... a redshift of 0.023".
export const PUBLISHED_H0_LOCAL = { value: 73.04, uncertainty: 1.04 } // km/s/Mpc, nearby stars and supernovae
export const PUBLISHED_H0_EARLY = { value: 67.4, uncertainty: 0.5 } // km/s/Mpc, early universe
export const PUBLISHED_VIRGO_DISTANCE_MPC = { value: 16.5, random: 0.1, systematic: 1.1 }
export const PUBLISHED_COMA = { distanceMpc: 100, redshift: 0.023 }
// NASA prints the redshift to three decimal places.
const COMA_PRINTED_DECIMALS = 3

export type CheckUpReading = 'between' | 'same' | 'same-to-printed-digits' | 'calculated-only'

export interface CheckUpRow {
  id: 'hubble-constant' | 'virgo-distance' | 'coma-redshift' | 'speed-of-b'
  used: number
  published: number | null // null when there is no published reference
  reading: CheckUpReading
}

// 70 sits between the two published values; it is neither of them.
export function hubbleConstantReading(h0: number): 'between' | 'outside' | 'same-as-one-value' {
  const low = Math.min(PUBLISHED_H0_LOCAL.value, PUBLISHED_H0_EARLY.value)
  const high = Math.max(PUBLISHED_H0_LOCAL.value, PUBLISHED_H0_EARLY.value)
  if (h0 === low || h0 === high) return 'same-as-one-value'
  return h0 > low && h0 < high ? 'between' : 'outside'
}

export function hubbleCheckUp(): CheckUpRow[] {
  const comaRedshift = cosmologicalRedshift(PUBLISHED_COMA.distanceMpc)
  const printed = Number(comaRedshift.toFixed(COMA_PRINTED_DECIMALS))
  return [
    {
      id: 'hubble-constant',
      used: HUBBLE_CONSTANT_KM_PER_S_PER_MPC,
      published: null, // two published values; the reading says how 70 sits between them
      reading: hubbleConstantReading(HUBBLE_CONSTANT_KM_PER_S_PER_MPC) === 'between' ? 'between' : 'calculated-only',
    },
    {
      id: 'virgo-distance',
      used: PART1_NEAR_DISTANCE_MPC,
      published: PUBLISHED_VIRGO_DISTANCE_MPC.value,
      reading: PART1_NEAR_DISTANCE_MPC === PUBLISHED_VIRGO_DISTANCE_MPC.value ? 'same' : 'calculated-only',
    },
    {
      id: 'coma-redshift',
      used: comaRedshift,
      published: PUBLISHED_COMA.redshift,
      reading: printed === PUBLISHED_COMA.redshift ? 'same-to-printed-digits' : 'calculated-only',
    },
    {
      id: 'speed-of-b',
      used: recessionSpeedKmPerS(PART1_NEAR_DISTANCE_MPC),
      published: null,
      reading: 'calculated-only',
    },
  ]
}

// --- The worked example shown in the words box and the caption --------------------------------

export function stretchedWavelengthNm(wavelengthNm: number, distanceMpc: number): number {
  return wavelengthNm * wavelengthStretchFactor(distanceMpc)
}

export interface WorkedExample {
  distanceMpc: number
  speedKmPerS: number
  redshift: number
  stretchFactor: number
  startWavelengthNm: number
  arrivalWavelengthNm: number
}

export const WORKED_EXAMPLE_WAVELENGTH_NM = 500

export function workedExample(distanceMpc: number = PART1_NEAR_DISTANCE_MPC): WorkedExample {
  const result = runHubblesLawExperiment(distanceMpc)
  return {
    distanceMpc,
    speedKmPerS: result.recessionSpeedKmPerS,
    redshift: result.redshift,
    stretchFactor: result.wavelengthStretchFactor,
    startWavelengthNm: WORKED_EXAMPLE_WAVELENGTH_NM,
    arrivalWavelengthNm: stretchedWavelengthNm(WORKED_EXAMPLE_WAVELENGTH_NM, distanceMpc),
  }
}
