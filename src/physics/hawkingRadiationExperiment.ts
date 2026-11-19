import { OBJECT_PRESETS, horizonRadiusKm } from './blackHoleSizeExperiment'
import { REAL_UNIVERSE_AGE_YEARS } from './bigBangExperiment'
import { CMB_TEMPERATURE_TODAY_KELVIN } from './cosmicMicrowaveBackgroundExperiment'

// One lone, non-spinning black hole of a chosen mass, in a bath of the cosmic microwave background (today's 2.725 K).
// Two standard results, given and not derived (deriving them needs quantum field theory in curved spacetime):
//   the black hole's temperature (Hawking, 1974):   T = hbar c^3 / (8 pi G M k_B)
//   its lifetime, alone and with nothing falling in:  t = 5120 pi G^2 M^3 / (hbar c^4)
// The lifetime is the simplest form: it ignores that a real black hole does not glow like a perfect glowing body (the
// "greybody factor") and the other kinds of particle a small hot one can give off, so it is an order-of-magnitude value.
// Which way the mass goes (loses, gains or balanced) comes from comparing the black hole's temperature with the
// background's (a body hotter than its surroundings loses heat, a colder one gains it). The model gives the direction
// only, not a rate, because a rate needs the greybody factors. Reused unchanged from other experiments: the horizon
// radius and the Sagittarius A* and M87* masses (Experiment 1), the background's temperature (the cosmic microwave
// background experiment) and the universe's age (the Big Bang experiment).

// CODATA values.
const HBAR = 1.054571817e-34 // J s
const SPEED_OF_LIGHT = 299_792_458 // m/s
const GRAVITATIONAL_CONSTANT = 6.6743e-11 // m^3 kg^-1 s^-2
const BOLTZMANN = 1.380649e-23 // J/K
export const SUN_MASS_KG = 1.98847e30
const SECONDS_PER_YEAR = 365.25 * 86_400

export const UNIVERSE_AGE_YEARS = REAL_UNIVERSE_AGE_YEARS
export const BACKGROUND_KELVIN = CMB_TEMPERATURE_TODAY_KELVIN
// The range the graph and the model cover: from below the mountain-sized preset to above M87*.
export const MIN_MASS_KG = 1e11
export const MAX_MASS_KG = 1e41
// Directions are 'balanced' when the two temperatures agree to this relative amount (rounding only).
const BALANCED_TOLERANCE = 1e-9
const CURVE_POINTS = 121

export type MassDirection = 'loses' | 'balanced' | 'gains'

function checkMass(massKg: number) {
  if (!Number.isFinite(massKg) || !(massKg > 0)) {
    throw new RangeError('The black hole mass must be a positive, finite number of kilograms.')
  }
}

// The black hole's temperature, in kelvin. It is inversely proportional to the mass.
export function hawkingTemperatureKelvin(massKg: number): number {
  checkMass(massKg)
  return (HBAR * SPEED_OF_LIGHT ** 3) / (8 * Math.PI * GRAVITATIONAL_CONSTANT * massKg * BOLTZMANN)
}

// How long the black hole would take to evaporate, in years, alone and with nothing falling in. It grows as the cube of
// the mass.
export function lifetimeYears(massKg: number): number {
  checkMass(massKg)
  return (5120 * Math.PI * GRAVITATIONAL_CONSTANT ** 2 * massKg ** 3) / (HBAR * SPEED_OF_LIGHT ** 4) / SECONDS_PER_YEAR
}

// The mass whose lifetime is the given number of years (the inverse of lifetimeYears).
export function massForLifetimeKg(years: number): number {
  if (!Number.isFinite(years) || !(years > 0)) {
    throw new RangeError('The lifetime must be a positive, finite number of years.')
  }
  return Math.cbrt((years * SECONDS_PER_YEAR * HBAR * SPEED_OF_LIGHT ** 4) / (5120 * Math.PI * GRAVITATIONAL_CONSTANT ** 2))
}

// The mass whose temperature equals the background's.
export function balanceMassKg(): number {
  return (HBAR * SPEED_OF_LIGHT ** 3) / (8 * Math.PI * GRAVITATIONAL_CONSTANT * BOLTZMANN * BACKGROUND_KELVIN)
}

// Hotter than the background: loses mass. Colder: gains mass. Equal: balanced.
export function massDirection(massKg: number): MassDirection {
  const ratio = hawkingTemperatureKelvin(massKg) / BACKGROUND_KELVIN
  if (Math.abs(ratio - 1) < BALANCED_TOLERANCE) return 'balanced'
  return ratio > 1 ? 'loses' : 'gains'
}

export const HAWKING_TEMPERATURE_OF_ONE_SUN_KELVIN = hawkingTemperatureKelvin(SUN_MASS_KG)
export const LIFETIME_OF_ONE_SUN_YEARS = lifetimeYears(SUN_MASS_KG)

// The temperature and the lifetime worked step by step from the 1-Sun values, for the Results (so the interface does no
// physics, CLAUDE.md §9): the temperature is the 1-Sun value divided by the mass in Suns, and the lifetime is the 1-Sun
// value times the cube of the mass in Suns.
export interface HawkingSteps {
  massSolarMasses: number
  oneSunTemperatureKelvin: number
  temperatureKelvin: number // oneSunTemperatureKelvin / massSolarMasses
  backgroundKelvin: number
  temperatureOverBackground: number // temperatureKelvin / backgroundKelvin
  oneSunLifetimeYears: number
  massCubed: number // massSolarMasses^3
  lifetimeYears: number // oneSunLifetimeYears x massCubed
  lifetimeOverUniverseAge: number
  tenTimesMassLifetimeYears: number // the lifetime of a black hole of ten times this mass
  tenTimesMassRatio: number // tenTimesMassLifetimeYears / lifetimeYears: 1,000
}

export function hawkingSteps(massKg: number): HawkingSteps {
  checkMass(massKg)
  const massSolarMasses = massKg / SUN_MASS_KG
  const temperatureKelvin = HAWKING_TEMPERATURE_OF_ONE_SUN_KELVIN / massSolarMasses
  const massCubed = massSolarMasses ** 3
  const lifetime = LIFETIME_OF_ONE_SUN_YEARS * massCubed
  const tenTimes = LIFETIME_OF_ONE_SUN_YEARS * (10 * massSolarMasses) ** 3
  return {
    massSolarMasses,
    oneSunTemperatureKelvin: HAWKING_TEMPERATURE_OF_ONE_SUN_KELVIN,
    temperatureKelvin,
    backgroundKelvin: BACKGROUND_KELVIN,
    temperatureOverBackground: temperatureKelvin / BACKGROUND_KELVIN,
    oneSunLifetimeYears: LIFETIME_OF_ONE_SUN_YEARS,
    massCubed,
    lifetimeYears: lifetime,
    lifetimeOverUniverseAge: lifetime / UNIVERSE_AGE_YEARS,
    tenTimesMassLifetimeYears: tenTimes,
    tenTimesMassRatio: tenTimes / lifetime,
  }
}

export interface HawkingPreset {
  id: 'mountain' | 'balance' | 'sun' | 'ten-suns' | 'sgr-a-star' | 'm87-star'
  label: string
  massKg: number
}

function experimentOnePresetMassKg(id: 'sgr-a-star' | 'm87-star'): number {
  const preset = OBJECT_PRESETS.find((p) => p.id === id)
  if (!preset) throw new Error(`Experiment 1 has no preset ${id}`)
  return preset.massSolarMasses * SUN_MASS_KG
}

// In order of mass. The mountain-sized one is a hypothetical small black hole (none has been found).
export const HAWKING_PRESETS: HawkingPreset[] = [
  { id: 'mountain', label: 'A mountain-sized black hole', massKg: 1e12 },
  { id: 'balance', label: 'The balance mass', massKg: balanceMassKg() },
  { id: 'sun', label: '1 Sun', massKg: SUN_MASS_KG },
  { id: 'ten-suns', label: '10 Suns', massKg: 10 * SUN_MASS_KG },
  { id: 'sgr-a-star', label: 'Sagittarius A*', massKg: experimentOnePresetMassKg('sgr-a-star') },
  { id: 'm87-star', label: 'M87*', massKg: experimentOnePresetMassKg('m87-star') },
]

export interface HawkingCurvePoint {
  massKg: number
  temperatureKelvin: number
  lifetimeYears: number
}

export interface HawkingResult {
  massKg: number
  massSolarMasses: number
  horizonRadiusKm: number // reused from Experiment 1
  temperatureKelvin: number
  backgroundKelvin: number // reused
  temperatureOverBackground: number // above 1: hotter than the background; below 1: colder
  direction: MassDirection
  lifetimeYears: number
  lifetimeOverUniverseAge: number
  // How many times colder the background must get before this black hole starts to lose mass; null if it already would.
  coolingFactorNeeded: number | null
  // From the smallest to the largest mass, spaced evenly in the logarithm of the mass, for the pictures.
  curve: HawkingCurvePoint[]
}

export function runHawkingRadiationExperiment(massKg: number): HawkingResult {
  if (!(massKg >= MIN_MASS_KG && massKg <= MAX_MASS_KG)) {
    throw new RangeError(`The black hole mass must be between ${MIN_MASS_KG} and ${MAX_MASS_KG} kilograms.`)
  }

  const curve: HawkingCurvePoint[] = []
  for (let i = 0; i < CURVE_POINTS; i++) {
    const mass = MIN_MASS_KG * (MAX_MASS_KG / MIN_MASS_KG) ** (i / (CURVE_POINTS - 1))
    curve.push({ massKg: mass, temperatureKelvin: hawkingTemperatureKelvin(mass), lifetimeYears: lifetimeYears(mass) })
  }

  const temperature = hawkingTemperatureKelvin(massKg)
  const direction = massDirection(massKg)
  const lifetime = lifetimeYears(massKg)
  const massSolarMasses = massKg / SUN_MASS_KG
  return {
    massKg,
    massSolarMasses,
    horizonRadiusKm: horizonRadiusKm(massSolarMasses),
    temperatureKelvin: temperature,
    backgroundKelvin: BACKGROUND_KELVIN,
    temperatureOverBackground: temperature / BACKGROUND_KELVIN,
    direction,
    lifetimeYears: lifetime,
    lifetimeOverUniverseAge: lifetime / UNIVERSE_AGE_YEARS,
    coolingFactorNeeded: direction === 'loses' ? null : BACKGROUND_KELVIN / temperature,
    curve,
  }
}

// ---- The audit update (Black Holes 10): the fixed Part 1 run, the answers to the three predictions, where the white guess marks are
// drawn, and the check-up. These moved out of the component so that the interface only displays what the module computes (CLAUDE.md §9).

// Part 1 runs a black hole of 10 Suns: the one the second prediction asks about. The thermometer and the graph also carry the 1-Sun
// black hole, which the first and third predictions compare it with.
export const PART_ONE_MASS_KG = 10 * SUN_MASS_KG

export type HotAnswer = 'big' | 'small' | 'same'
export type DirectionAnswer = 'losing' | 'gaining' | 'same'
export type LongerAnswer = 'ten' | 'hundred' | 'thousand'

// How many times as long each answer to the third prediction says.
export const LONGER_FACTORS: Record<LongerAnswer, number> = { ten: 10, hundred: 100, thousand: 1000 }

// Two numbers are "the same" when they agree to rounding error in the arithmetic, not to a chosen tolerance.
const SAME = 1e-9
function compareTo(value: number, reference: number): -1 | 0 | 1 {
  if (Math.abs(value - reference) <= SAME * Math.max(1e-300, Math.abs(reference))) return 0
  return value < reference ? -1 : 1
}

// Prediction 1: which is hotter, the big black hole (10 Suns) or the small one (1 Sun)?
export function hotAnswer(): HotAnswer {
  const c = compareTo(hawkingTemperatureKelvin(PART_ONE_MASS_KG), hawkingTemperatureKelvin(SUN_MASS_KG))
  return c > 0 ? 'big' : c < 0 ? 'small' : 'same'
}

// Prediction 2: is the 10-Suns black hole losing, gaining or keeping its mass in the background?
export function directionAnswer(): DirectionAnswer {
  const direction = massDirection(PART_ONE_MASS_KG)
  return direction === 'loses' ? 'losing' : direction === 'gains' ? 'gaining' : 'same'
}

// The real number of times a black hole of ten times the mass takes longer (10 Suns against 1 Sun).
export function tenfoldLifetimeRatio(): number {
  return lifetimeYears(PART_ONE_MASS_KG) / lifetimeYears(SUN_MASS_KG)
}

// Prediction 3: the answer nearest (in ratio) to how many times longer ten times the mass takes.
export function longerAnswer(): LongerAnswer {
  const ratio = tenfoldLifetimeRatio()
  const choices = Object.keys(LONGER_FACTORS) as LongerAnswer[]
  return choices.reduce((best, choice) =>
    Math.abs(Math.log(LONGER_FACTORS[choice] / ratio)) < Math.abs(Math.log(LONGER_FACTORS[best] / ratio)) ? choice : best,
  )
}

export interface Guesses {
  hot: HotAnswer
  direction: DirectionAnswer
  longer: LongerAnswer
}

// For the tutor, which marks each guess against the model's answer (the Results never do).
export function markGuesses(guesses: Guesses): Record<keyof Guesses, boolean> {
  return {
    hot: guesses.hot === hotAnswer(),
    direction: guesses.direction === directionAnswer(),
    longer: guesses.longer === longerAnswer(),
  }
}

// Where each guess mark is drawn. Only the third guess has a size of its own (a lifetime); the first two are markers only.
export type HotMarker = 'ten-suns' | 'one-sun' | 'bracket' // on the thermometer: the 10-Suns dot, the 1-Sun dot, or a bracket joining both
export type DirectionMarker = 'shrinks' | 'grows' | 'unchanged' // beside the disk in the heat-flow picture
export const HOT_MARKERS: Record<HotAnswer, HotMarker> = { big: 'ten-suns', small: 'one-sun', same: 'bracket' }
export const DIRECTION_MARKERS: Record<DirectionAnswer, DirectionMarker> = { losing: 'shrinks', gaining: 'grows', same: 'unchanged' }

export interface LongerMark {
  factor: number // 10, 100 or 1,000
  lifetimeYears: number // the 1-Sun lifetime times the factor: where the guess's arrow ends on the graph
  log10Years: number
  realLifetimeYears: number // the 10-Suns lifetime
  realLog10Years: number
  realRatio: number // 1,000
}

export function longerMark(guess: LongerAnswer): LongerMark {
  const factor = LONGER_FACTORS[guess]
  const guessed = lifetimeYears(SUN_MASS_KG) * factor
  const real = lifetimeYears(PART_ONE_MASS_KG)
  return {
    factor,
    lifetimeYears: guessed,
    log10Years: Math.log10(guessed),
    realLifetimeYears: real,
    realLog10Years: Math.log10(real),
    realRatio: tenfoldLifetimeRatio(),
  }
}

// How many times colder than the background a black hole's own temperature is (below 1: it is hotter). For the Results' note on the two
// giants whose photographs the page shows.
export function coldnessAgainstBackground(massKg: number): number {
  return BACKGROUND_KELVIN / hawkingTemperatureKelvin(massKg)
}

// ---- The check-up against published values. Each published figure is from a page that was read (see the draft wording's source table,
// docs/audit/black-holes-and-strong-gravity/10-draft-wording.md, S1 and S5). Nothing here is a chosen cut-off: a reading is "the same" only
// when the numbers agree to rounding error, and otherwise "less" or "more". The published figures are themselves rounded, so `ratio` is
// given for the interface to say how far apart they are.
export const PUBLISHED = {
  // NASA Goddard, Ask an Astrophysicist: for a black hole of the Sun's mass "the temperature is only one ten-millionth of a degree above
  // absolute zero".
  nasaOneSunTemperatureKelvin: 1e-7,
  // Hawking 1974, Nature 248, 30: a temperature of "≈ 10^-6 (M_sun / M) K". The page's value (from the standard formula above) is about 16 times
  // smaller. Why the letter's figure differs was not found in any page read, so the page says only that the two figures differ.
  hawking1974OneSunTemperatureKelvin: 1e-6,
  // Hawking 1974: "Any such black hole of mass less than 10^15 g would have evaporated by now".
  hawking1974EvaporatedByNowMassKg: 1e12,
} as const

export type CheckUpReading = 'the same' | 'less' | 'more'

export interface CheckUpRow {
  id: 'temperatureNasa' | 'temperatureHawking1974' | 'lifetimeAgainstUniverse' | 'evaporatingNowMass'
  page: number
  published: number
  ratio: number // page / published
  reading: CheckUpReading
}

const row = (id: CheckUpRow['id'], page: number, published: number): CheckUpRow => {
  const c = compareTo(page, published)
  return { id, page, published, ratio: page / published, reading: c === 0 ? 'the same' : c < 0 ? 'less' : 'more' }
}

export function checkUp(): CheckUpRow[] {
  return [
    row('temperatureNasa', hawkingTemperatureKelvin(SUN_MASS_KG), PUBLISHED.nasaOneSunTemperatureKelvin),
    row('temperatureHawking1974', hawkingTemperatureKelvin(SUN_MASS_KG), PUBLISHED.hawking1974OneSunTemperatureKelvin),
    // Hawking 1974: for the Sun's mass the lifetime "is much longer than the age of the Universe".
    row('lifetimeAgainstUniverse', lifetimeYears(SUN_MASS_KG), UNIVERSE_AGE_YEARS),
    row('evaporatingNowMass', massForLifetimeKg(UNIVERSE_AGE_YEARS), PUBLISHED.hawking1974EvaporatedByNowMassKg),
  ]
}
