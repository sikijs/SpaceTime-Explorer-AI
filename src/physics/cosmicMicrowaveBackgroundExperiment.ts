// Used only by the audit-update functions at the end of this file (the amplitude and T0 of the
// Sun-motion dipole, kept in one place).
import { MICROWAVE_TEMPERATURE_K, PLANCK_DIPOLE_AMPLITUDE_UK } from './microwaveDipole'

// Real, measured value - the CMB's temperature today, rounded to 2.725 K. Measured by several
// instruments and summarised in Fixsen (2009), arXiv:0911.1955, abstract read 2026-11-14:
// 2.72548 +/- 0.00057 K. The earlier comment named the Planck satellite; that was not read for
// this page and is not claimed.
export const CMB_TEMPERATURE_TODAY_KELVIN = 2.725

// A published value (Planck-era), given here and not derived - the redshift of recombination, i.e.
// how much the universe has expanded since then (today's scale factor / recombination's scale
// factor = 1 + z). The tables of Planck 2018 VI (arXiv:1807.06209) that hold it were NOT read for
// this page (its abstract has no redshift), so no source is claimed beyond "given".
export const RECOMBINATION_REDSHIFT = 1089.8

// Approximate value: about 380,000 years (ESA; NASA's "Cosmic History" overview, read 2026-11-14;
// NASA's WMAP page says 375,000) - stated as approximate, not derived from RECOMBINATION_REDSHIFT
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

// ---------------------------------------------------------------------------------------------
// Audit update (2026-11): the temperature panel and the spread strip (display scales), the guess
// markers, the tutor's marking, the check-up against published values, the table of moments, the
// worked examples and the figures for "More about the CMB". Everything above this line is
// unchanged except three comments. The interface only displays what these functions return
// (CLAUDE.md §9). Published values were read 2026-11-14 (sources in the draft wording file).
// ---------------------------------------------------------------------------------------------

// --- Published values the page sets beside its own numbers -------------------------------------
// Fixsen (2009), arXiv:0911.1955, abstract: "2.72548 +/- 0.00057 K".
export const PUBLISHED_T0_KELVIN = MICROWAVE_TEMPERATURE_K
export const PUBLISHED_T0_GIVE_OR_TAKE_KELVIN = 0.00057
// ESA, "Planck and the cosmic microwave background": "it had cooled to around 3000 Kelvin". A
// rounded ("around") figure, so the page makes no test of it.
export const PUBLISHED_RELEASE_TEMPERATURE_KELVIN = 3000
// ESA and NASA's overview: about 380,000 years. NASA's WMAP page: 375,000.
export const PUBLISHED_RELEASE_YEARS_ALT = 375_000
// ESA, and the LAMBDA tutorial ("uniform up to about 1 part in 100,000"): the spread between
// directions as a fraction of the temperature.
export const MEASURED_SPREAD_FRACTION = 1e-5
// NASA's "Cosmic History" and WMAP pages: about 13.8 billion years (used only for the time
// comparison in the introduction).
export const UNIVERSE_AGE_YEARS_FOR_COMPARISON = 13.8e9

// --- The two display scales --------------------------------------------------------------------
// Both are tenfold ("log") scales, because on a straight scale today's temperature would be a line
// 0.3 of a pixel wide and the real spread would not be visible at all.
export const TEMPERATURE_SCALE_MIN_KELVIN = 1
export const TEMPERATURE_SCALE_MAX_KELVIN = 10_000
// The spread strip: left end is a bigger difference (1 in 10), right end a smaller one (1 in
// 1,000,000).
export const SPREAD_SCALE_BIGGEST_FRACTION = 1e-1
export const SPREAD_SCALE_SMALLEST_FRACTION = 1e-6

function clamp01(x: number): number {
  return Math.max(0, Math.min(1, x))
}

// Position along the temperature panel, 0 (1 K) to 1 (10,000 K).
export function temperatureScaleFraction(kelvin: number): number {
  if (!(kelvin > 0)) throw new RangeError('Temperature must be greater than zero')
  const lo = Math.log10(TEMPERATURE_SCALE_MIN_KELVIN)
  const hi = Math.log10(TEMPERATURE_SCALE_MAX_KELVIN)
  return clamp01((Math.log10(kelvin) - lo) / (hi - lo))
}

// Position along the spread strip, 0 (the bigger-difference end) to 1 (the smaller-difference end).
export function spreadScaleFraction(spreadFraction: number): number {
  if (!(spreadFraction > 0)) throw new RangeError('The spread must be greater than zero')
  const big = Math.log10(SPREAD_SCALE_BIGGEST_FRACTION)
  const small = Math.log10(SPREAD_SCALE_SMALLEST_FRACTION)
  return clamp01((Math.log10(spreadFraction) - big) / (small - big))
}

// The measured spread in kelvin: today's temperature times the fraction (about 0.000027 K).
export function spreadKelvin(
  spreadFraction: number = MEASURED_SPREAD_FRACTION,
  temperatureKelvin: number = CMB_TEMPERATURE_TODAY_KELVIN,
): number {
  return temperatureKelvin * spreadFraction
}

// --- The learner's two guesses -----------------------------------------------------------------
export type TemperatureGuess = 'higher' | 'lower' | 'same'
export type SkyGuess = 'uniform' | 'varies'

// Guess 1 has no size of its own, so its white mark is only a marker: an arrow from today's mark
// pointing toward hotter, an arrow pointing toward cooler, or a tick on today's mark. The arrow's
// length means nothing.
export type TemperatureMarker = 'arrow-hotter' | 'arrow-cooler' | 'tick-same'
export function temperatureGuessMarker(guess: TemperatureGuess): TemperatureMarker {
  return guess === 'higher' ? 'arrow-hotter' : guess === 'lower' ? 'arrow-cooler' : 'tick-same'
}

// Guess 2 is also only a marker, a box joined to one end of the spread strip: "about the same" to
// the smaller-difference end (fraction 1), "varies a lot" to the bigger-difference end (fraction
// 0). The page makes no claim about the size of "a lot" (it has no accepted size).
export function skyGuessStripFraction(guess: SkyGuess): number {
  return guess === 'uniform' ? 1 : 0
}

// --- Marking the guesses (the tutor only) ------------------------------------------------------
// Guess 1 is always checked against recombination, not against the learner's chosen moment.
export function actualTemperatureAnswer(): TemperatureGuess {
  const release = cmbTemperatureKelvin(RECOMBINATION_REDSHIFT)
  if (release === CMB_TEMPERATURE_TODAY_KELVIN) return 'same'
  return release > CMB_TEMPERATURE_TODAY_KELVIN ? 'higher' : 'lower'
}

// "About the same" or "a lot" has no accepted size. The page needs a rule to mark guess 2, and
// uses 1 percent of the temperature: a code threshold, NOT a published one, and the Results never
// present it as one (they show the measured spread and its size in kelvin). The measured spread is
// a thousand times below it.
export const SKY_UNIFORM_BELOW_FRACTION = 0.01
export function actualSkyAnswer(spreadFraction: number = MEASURED_SPREAD_FRACTION): SkyGuess {
  return spreadFraction < SKY_UNIFORM_BELOW_FRACTION ? 'uniform' : 'varies'
}

export interface TemperatureMarking {
  guess: TemperatureGuess
  actual: TemperatureGuess
  matches: boolean
  releaseKelvin: number
  todayKelvin: number
  timesToday: number
}

export function temperatureMarking(guess: TemperatureGuess): TemperatureMarking {
  const actual = actualTemperatureAnswer()
  const releaseKelvin = cmbTemperatureKelvin(RECOMBINATION_REDSHIFT)
  return {
    guess,
    actual,
    matches: guess === actual,
    releaseKelvin,
    todayKelvin: CMB_TEMPERATURE_TODAY_KELVIN,
    timesToday: releaseKelvin / CMB_TEMPERATURE_TODAY_KELVIN,
  }
}

export interface SkyMarking {
  guess: SkyGuess
  actual: SkyGuess
  matches: boolean
  spreadFraction: number
  spreadKelvin: number
  // 1 part in this many (100,000 for the measured spread).
  oneInParts: number
}

export function skyMarking(guess: SkyGuess): SkyMarking {
  const actual = actualSkyAnswer()
  return {
    guess,
    actual,
    matches: guess === actual,
    spreadFraction: MEASURED_SPREAD_FRACTION,
    spreadKelvin: spreadKelvin(),
    oneInParts: 1 / MEASURED_SPREAD_FRACTION,
  }
}

// --- The check-up: this page's numbers beside published ones (read 2026-11-14) -----------------
export type CmbCheckUpReading =
  | 'same-within-give-or-take'
  | 'more'
  | 'less'
  | 'given-not-checked'
  | 'quoted-not-checked'

export interface CmbCheckUpRow {
  id: 'temperature-today' | 'temperature-at-release' | 'release-time' | 'spread-between-directions'
  // The page's own value; null where the page draws an illustration and calculates nothing.
  used: number | null
  published: number
  // Where a second published value or a stated give-or-take exists.
  publishedAlt?: number
  giveOrTake?: number
  reading: CmbCheckUpReading
  // (used - published) / published, where both exist.
  relativeGap?: number
  // The same, in the row's own unit, where it is stated.
  difference?: number
}

export function temperatureTodayReading(used: number, published: number, giveOrTake: number): CmbCheckUpReading {
  const difference = Math.abs(used - published)
  if (difference <= giveOrTake) return 'same-within-give-or-take'
  return used > published ? 'more' : 'less'
}

export function cmbCheckUp(): CmbCheckUpRow[] {
  const release = cmbTemperatureKelvin(RECOMBINATION_REDSHIFT)
  return [
    {
      id: 'temperature-today',
      used: CMB_TEMPERATURE_TODAY_KELVIN,
      published: PUBLISHED_T0_KELVIN,
      giveOrTake: PUBLISHED_T0_GIVE_OR_TAKE_KELVIN,
      reading: temperatureTodayReading(
        CMB_TEMPERATURE_TODAY_KELVIN,
        PUBLISHED_T0_KELVIN,
        PUBLISHED_T0_GIVE_OR_TAKE_KELVIN,
      ),
      difference: CMB_TEMPERATURE_TODAY_KELVIN - PUBLISHED_T0_KELVIN,
      relativeGap: (CMB_TEMPERATURE_TODAY_KELVIN - PUBLISHED_T0_KELVIN) / PUBLISHED_T0_KELVIN,
    },
    {
      id: 'temperature-at-release',
      used: release,
      published: PUBLISHED_RELEASE_TEMPERATURE_KELVIN,
      // The published figure is rounded ("around 3000"), so this is a comparison, not a test.
      reading: release > PUBLISHED_RELEASE_TEMPERATURE_KELVIN ? 'more' : 'less',
      relativeGap: (release - PUBLISHED_RELEASE_TEMPERATURE_KELVIN) / PUBLISHED_RELEASE_TEMPERATURE_KELVIN,
      difference: release - PUBLISHED_RELEASE_TEMPERATURE_KELVIN,
    },
    {
      id: 'release-time',
      used: RECOMBINATION_YEARS_AFTER_BIG_BANG,
      published: RECOMBINATION_YEARS_AFTER_BIG_BANG,
      publishedAlt: PUBLISHED_RELEASE_YEARS_ALT,
      // Given by the page, not derived: not a check.
      reading: 'given-not-checked',
      // How far the two published values are from each other, as a share of the page's value.
      relativeGap: (PUBLISHED_RELEASE_YEARS_ALT - RECOMBINATION_YEARS_AFTER_BIG_BANG) / RECOMBINATION_YEARS_AFTER_BIG_BANG,
    },
    {
      id: 'spread-between-directions',
      used: null,
      published: MEASURED_SPREAD_FRACTION,
      reading: 'quoted-not-checked',
      difference: spreadKelvin(),
    },
  ]
}

// --- Table 2: the temperature at some moments (calculated from the rule; no published values) ---
export const MOMENTS_TABLE_REDSHIFTS = [0, 1, 10, 100, 1000, RECOMBINATION_REDSHIFT]

export interface CmbMomentRow {
  redshift: number
  // How much space has stretched since then, compared with today: 1 + z.
  timesToday: number
  temperatureKelvin: number
}

export function cmbMomentsTable(redshifts: number[] = MOMENTS_TABLE_REDSHIFTS): CmbMomentRow[] {
  return redshifts.map((redshift) => ({
    redshift,
    timesToday: 1 + redshift,
    temperatureKelvin: cmbTemperatureKelvin(redshift),
  }))
}

// --- The worked examples (the words box, the caption and "More about the CMB") -----------------
export interface CmbWorkedExample {
  redshift: number
  factor: number
  todayKelvin: number
  temperatureKelvin: number
  timesToday: number
  spreadKelvin: number
}

export function cmbWorkedExample(redshift: number = RECOMBINATION_REDSHIFT): CmbWorkedExample {
  const factor = 1 + redshift
  const temperatureKelvin = cmbTemperatureKelvin(redshift)
  return {
    redshift,
    factor,
    todayKelvin: CMB_TEMPERATURE_TODAY_KELVIN,
    temperatureKelvin,
    timesToday: temperatureKelvin / CMB_TEMPERATURE_TODAY_KELVIN,
    spreadKelvin: spreadKelvin(),
  }
}

// --- Figures for the introduction and "More about the CMB" -------------------------------------
export const KELVIN_AT_ZERO_CELSIUS = 273.15

export function kelvinToCelsius(kelvin: number): number {
  return kelvin - KELVIN_AT_ZERO_CELSIUS
}

// How long 380,000 years is, as a share of the age: "1 part in about 36,000".
export function releaseAsOnePartIn(): number {
  return UNIVERSE_AGE_YEARS_FOR_COMPARISON / RECOMBINATION_YEARS_AFTER_BIG_BANG
}

// The daily-life comparison: the universe's whole history squeezed into one human life. Returns
// the hours after birth at which recombination would happen (about 19 for an 80-year life).
export function releaseHourInALife(lifeYears: number = 80): number {
  const hoursPerYear = 365.25 * 24
  return lifeYears * (RECOMBINATION_YEARS_AFTER_BIG_BANG / UNIVERSE_AGE_YEARS_FOR_COMPARISON) * hoursPerYear
}

// The swimming-pool comparison: water at 293 K that was as even as the sky would differ by this
// much from one end to the other.
export const ROOM_TEMPERATURE_KELVIN = 293
export function evenSpreadExampleKelvin(
  baseKelvin: number = ROOM_TEMPERATURE_KELVIN,
  spreadFraction: number = MEASURED_SPREAD_FRACTION,
): number {
  return baseKelvin * spreadFraction
}

// The tutor's "not covered" point: the Sun's own motion makes one side of the sky a little warmer
// than the other. The size is taken from microwaveDipole.ts (one source for the amplitude and
// T0), as 1 part in this many: about 810.
export function dipoleOneInParts(): number {
  return (MICROWAVE_TEMPERATURE_K * 1e6) / PLANCK_DIPOLE_AMPLITUDE_UK.value
}
