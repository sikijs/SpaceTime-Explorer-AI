// Black Holes and Strong Gravity, Experiment 11: why do quasars outshine galaxies?
// See docs/experiments/black-holes-and-strong-gravity/11-why-do-quasars-outshine-galaxies.md, "Physics Model".
//
// Two linked ideas. Energy: a luminosity L needs a mass per second  m_dot = L / (e c^2)  at an efficiency e, so a larger e needs less
// matter. Falling toward a black hole has the efficiency of Black Holes Experiment 8 (imported unchanged); fusion in a star has 0.71 percent.
// Size: a source whose brightness changes as a whole in a time t cannot be wider than c t (light-travel time).
// The module does NOT model the accretion disk, how the infalling gas gives up its energy as light, jets, beaming, dust, the host galaxy's
// light, how long a quasar lasts, or the Eddington limit (left to Cosmic Horizons 23). Nothing here depends on playback speed (CLAUDE.md §11).

import { energyReleasedFraction } from './spinningBlackHoleExperiment'

// ---- Constants (SI unless named) ----
export const SPEED_OF_LIGHT = 299_792_458 // m/s, exact by the definition of the metre
export const SUN_LUMINOSITY_W = 3.828e26 // IAU 2015 Resolution B3, nominal (arXiv:1510.07674, read 2026-11-20)
export const SUN_MASS_KG = 1.98841e30 // textbook value (IAU nominal GM_sun / G); to be checked at a source
export const SECONDS_PER_YEAR = 365.25 * 86400 // a Julian year
export const SECONDS_PER_DAY = 86400
export const METERS_PER_AU = 149_597_870_700 // exact (IAU 2012)
export const METERS_PER_LIGHT_YEAR = SPEED_OF_LIGHT * SECONDS_PER_YEAR
// Hydrogen fusion (the proton-proton chain): "the mass lost, 0.02862 u, is 0.71% of the mass of the initial hydrogen"
// (OpenStax Astronomy 2e, section 16.2, read 2026-11-20).
export const FUSION_EFFICIENCY = 0.0071

// The Milky Way: a disk "more than 100,000 light-years" across (NASA, read 2026-11-20); a total light output of about 2 to 3 x 10^10
// Suns (a Caltech course slide gives about 2 x 10^10; Scientific American gives 30 billion; no NASA, ESA or OpenStax value found).
export const MILKY_WAY_WIDTH_LIGHT_YEARS = 100_000
export const MILKY_WAY_LUMINOSITY_RANGE_SOLAR: readonly [number, number] = [2e10, 3e10]
export const MILKY_WAY_LUMINOSITY_SOLAR = (MILKY_WAY_LUMINOSITY_RANGE_SOLAR[0] + MILKY_WAY_LUMINOSITY_RANGE_SOLAR[1]) / 2
// Neptune's orbit is 30 AU from the Sun on average (NASA), so about 60 AU across (doubled here, a round value).
export const NEPTUNE_ORBIT_WIDTH_AU = 60

// 3C 273, the first quasar recognised. Its luminosity has no consistent published value (about 2, 3.6 and 5 trillion Suns in the pages
// read), so the page says "about 4 trillion Suns, and the sources differ" (Decision 14). The flicker below is illustrative, not 3C 273's own.
export const THREE_C_273_LUMINOSITY_SOLAR = 4e12
export const FLICKER_ILLUSTRATION_DAYS = 7 // Peterson's "doubles in a week" example; inside OpenStax's typical 5 to 2,000 days

// J0529-4351 (ESO eso2402, 19 February 2024; Wolf et al., Nature Astronomy 2024): "over 500 trillion times more luminous than the Sun",
// and it "eats just over a Sun per day".
export const J0529_LUMINOSITY_SOLAR = 500e12
export const J0529_PUBLISHED_SOLAR_MASSES_PER_YEAR = 365.25

function checkPositive(x: number, what: string) {
  if (!Number.isFinite(x) || !(x > 0)) throw new RangeError(`${what} must be a positive, finite number.`)
}

function checkEfficiency(e: number) {
  if (!Number.isFinite(e) || !(e > 0) || !(e < 1)) throw new RangeError('The efficiency must be between 0 and 1.')
}

// ---- Energy: the mass that has to fall in ----

// The efficiency of falling toward a black hole spinning at `spin`, circling with the spin: Black Holes Experiment 8's energy released.
export function infallEfficiency(spin: number): number {
  return energyReleasedFraction(spin, 'with')
}

export function luminosityWatts(luminositySolar: number): number {
  checkPositive(luminositySolar, 'The luminosity')
  return luminositySolar * SUN_LUMINOSITY_W
}

// m_dot = L / (e c^2), in kilograms per second.
export function massPerSecondKg(luminosityW: number, efficiency: number): number {
  checkPositive(luminosityW, 'The luminosity')
  checkEfficiency(efficiency)
  return luminosityW / (efficiency * SPEED_OF_LIGHT ** 2)
}

// The same in Suns per year, for a luminosity given in Suns.
export function massPerYearSolar(luminositySolar: number, efficiency: number): number {
  return (massPerSecondKg(luminosityWatts(luminositySolar), efficiency) * SECONDS_PER_YEAR) / SUN_MASS_KG
}

export function infallMassPerYearSolar(luminositySolar: number, spin: number): number {
  return massPerYearSolar(luminositySolar, infallEfficiency(spin))
}

export function fusionMassPerYearSolar(luminositySolar: number): number {
  return massPerYearSolar(luminositySolar, FUSION_EFFICIENCY)
}

// How many times more light a kilogram makes falling in than fused in a star: e_infall / e_fusion (about 8 at no spin, about 60 at the ceiling).
export function lightPerKilogramRatio(spin: number): number {
  return infallEfficiency(spin) / FUSION_EFFICIENCY
}

// The efficiency that a published feeding rate implies for a given luminosity: e = L / (m_dot c^2).
export function impliedEfficiency(luminositySolar: number, solarMassesPerYear: number): number {
  checkPositive(solarMassesPerYear, 'The feeding rate')
  const massPerSecond = (solarMassesPerYear * SUN_MASS_KG) / SECONDS_PER_YEAR
  return luminosityWatts(luminositySolar) / (massPerSecond * SPEED_OF_LIGHT ** 2)
}

export interface PublishedRateCheck {
  modelSolarMassesPerYear: number
  publishedSolarMassesPerYear: number
  ratio: number // model / published
  impliedEfficiency: number
}

// J0529-4351: the module's rate at an efficiency, beside ESO's "just over a Sun per day". ESO does not state the efficiency, so agreement
// shows the module is consistent with the published rate, not that the efficiency is known.
export function j0529RateCheck(efficiency: number): PublishedRateCheck {
  const model = massPerYearSolar(J0529_LUMINOSITY_SOLAR, efficiency)
  return {
    modelSolarMassesPerYear: model,
    publishedSolarMassesPerYear: J0529_PUBLISHED_SOLAR_MASSES_PER_YEAR,
    ratio: model / J0529_PUBLISHED_SOLAR_MASSES_PER_YEAR,
    impliedEfficiency: impliedEfficiency(J0529_LUMINOSITY_SOLAR, J0529_PUBLISHED_SOLAR_MASSES_PER_YEAR),
  }
}

// ---- Brightness: the ratio to the Milky Way ----

// How many times brighter than the Milky Way, at its midpoint luminosity and at the two ends of the published range.
export function brightnessRatio(luminositySolar: number, milkyWaySolar: number = MILKY_WAY_LUMINOSITY_SOLAR): number {
  checkPositive(luminositySolar, 'The luminosity')
  checkPositive(milkyWaySolar, 'The Milky Way luminosity')
  return luminositySolar / milkyWaySolar
}

export function brightnessRatioRange(luminositySolar: number): { low: number; high: number } {
  return {
    low: brightnessRatio(luminositySolar, MILKY_WAY_LUMINOSITY_RANGE_SOLAR[1]),
    high: brightnessRatio(luminositySolar, MILKY_WAY_LUMINOSITY_RANGE_SOLAR[0]),
  }
}

// ---- Size: light-travel time ----

export function lightDayMeters(): number {
  return SPEED_OF_LIGHT * SECONDS_PER_DAY
}

export function lightDayAU(): number {
  return lightDayMeters() / METERS_PER_AU
}

// The widest a source can be if it changes as a whole in `days`: c x t.
export function sizeLimitMeters(days: number): number {
  checkPositive(days, 'The flicker time')
  return SPEED_OF_LIGHT * days * SECONDS_PER_DAY
}

export function sizeLimitAU(days: number): number {
  return sizeLimitMeters(days) / METERS_PER_AU
}

export function milkyWayWidthLightDays(): number {
  return (MILKY_WAY_WIDTH_LIGHT_YEARS * METERS_PER_LIGHT_YEAR) / lightDayMeters()
}

// How many times wider the Milky Way is than the size limit: about 5.2 million for a week, 36.5 million for a day.
export function galaxyToSourceWidthRatio(days: number): number {
  checkPositive(days, 'The flicker time')
  return milkyWayWidthLightDays() / days
}

// The size limit as a fraction of the Milky Way's width.
export function sourceFractionOfGalaxy(days: number): number {
  return 1 / galaxyToSourceWidthRatio(days)
}

// How many times wider than Neptune's orbit the size limit is (for the page's daily-life comparison).
export function sizeLimitInNeptuneOrbits(days: number): number {
  return sizeLimitAU(days) / NEPTUNE_ORBIT_WIDTH_AU
}

// ---- The experiment's result (what the interface displays) ----

export const SPIN_CHOICES = [0, 0.5, 0.9, 0.99] as const
export const BRIGHTNESS_CHOICES_SOLAR = [1e10, 1e11, 1e12, 1e13] as const
export const PART_ONE_SPIN = 0
export const PART_ONE_LUMINOSITY_SOLAR = THREE_C_273_LUMINOSITY_SOLAR

export interface QuasarResult {
  luminositySolar: number
  spin: number
  infallEfficiency: number
  fusionEfficiency: number
  infallSolarMassesPerYear: number
  fusionSolarMassesPerYear: number
  lightPerKilogramRatio: number
  ratioToMilkyWay: number
  ratioToMilkyWayRange: { low: number; high: number }
  flickerDays: number
  sizeLimitAU: number
  sizeLimitLightDays: number
  galaxyToSourceWidthRatio: number
  sourceFractionOfGalaxy: number
}

export function runQuasarExperiment(luminositySolar: number, spin: number, flickerDays: number = FLICKER_ILLUSTRATION_DAYS): QuasarResult {
  return {
    luminositySolar,
    spin,
    infallEfficiency: infallEfficiency(spin),
    fusionEfficiency: FUSION_EFFICIENCY,
    infallSolarMassesPerYear: infallMassPerYearSolar(luminositySolar, spin),
    fusionSolarMassesPerYear: fusionMassPerYearSolar(luminositySolar),
    lightPerKilogramRatio: lightPerKilogramRatio(spin),
    ratioToMilkyWay: brightnessRatio(luminositySolar),
    ratioToMilkyWayRange: brightnessRatioRange(luminositySolar),
    flickerDays,
    sizeLimitAU: sizeLimitAU(flickerDays),
    sizeLimitLightDays: flickerDays,
    galaxyToSourceWidthRatio: galaxyToSourceWidthRatio(flickerDays),
    sourceFractionOfGalaxy: sourceFractionOfGalaxy(flickerDays),
  }
}

// ---- Rulers (log scales, 0 at the left end and 1 at the right) ----

export function logRulerPosition(value: number, min: number, max: number): number {
  checkPositive(value, 'The value')
  const p = (Math.log10(value) - Math.log10(min)) / (Math.log10(max) - Math.log10(min))
  return Math.min(1, Math.max(0, p))
}

export const BRIGHTNESS_RULER_MIN_SOLAR = 1e9
export const BRIGHTNESS_RULER_MAX_SOLAR = 1e16 // so the 'about 100,000 times the Milky Way' guess (2.5e15 Suns) stays on the ruler
export const WIDTH_RULER_MIN_LIGHT_DAYS = 0.01
export const WIDTH_RULER_MAX_LIGHT_DAYS = 1e8
export const FUEL_RULER_MIN_SOLAR_PER_YEAR = 1e-3
export const FUEL_RULER_MAX_SOLAR_PER_YEAR = 1e3

export function brightnessRulerPosition(luminositySolar: number): number {
  return logRulerPosition(luminositySolar, BRIGHTNESS_RULER_MIN_SOLAR, BRIGHTNESS_RULER_MAX_SOLAR)
}
export function widthRulerPosition(lightDays: number): number {
  return logRulerPosition(lightDays, WIDTH_RULER_MIN_LIGHT_DAYS, WIDTH_RULER_MAX_LIGHT_DAYS)
}
export function fuelRulerPosition(solarMassesPerYear: number): number {
  return logRulerPosition(solarMassesPerYear, FUEL_RULER_MIN_SOLAR_PER_YEAR, FUEL_RULER_MAX_SOLAR_PER_YEAR)
}

// ---- The three predictions (buttons on a log scale; the answer is the nearest button to the module's value) ----

export function nearestOnLogScale<T>(choices: readonly T[], value: number, valueOf: (c: T) => number): T {
  checkPositive(value, 'The value')
  let best = choices[0]
  let bestDistance = Infinity
  for (const c of choices) {
    const d = Math.abs(Math.log10(valueOf(c)) - Math.log10(value))
    if (d < bestDistance) {
      best = c
      bestDistance = d
    }
  }
  return best
}

// 1. How many times brighter than the Milky Way is 3C 273?
export const RATIO_CHOICES = [
  { id: 'same', times: 1 },
  { id: 'ten', times: 10 },
  { id: 'hundred', times: 100 },
  { id: 'thousand', times: 1_000 },
  { id: 'hundred-thousand', times: 100_000 },
] as const
export type RatioChoiceId = (typeof RATIO_CHOICES)[number]['id']
export function ratioAnswer(): RatioChoiceId {
  return nearestOnLogScale(RATIO_CHOICES, brightnessRatio(PART_ONE_LUMINOSITY_SOLAR), (c) => c.times).id
}

// 2. If a quasar flickers over about a week, how wide can the source be, as a fraction of the Milky Way's width?
export const WIDTH_CHOICES = [
  { id: 'tenth', fraction: 1e-1 },
  { id: 'thousandth', fraction: 1e-3 },
  { id: 'hundred-thousandth', fraction: 1e-5 },
  { id: 'ten-millionth', fraction: 1e-7 },
  { id: 'billionth', fraction: 1e-9 },
] as const
export type WidthChoiceId = (typeof WIDTH_CHOICES)[number]['id']
export function widthAnswer(): WidthChoiceId {
  return nearestOnLogScale(WIDTH_CHOICES, sourceFractionOfGalaxy(FLICKER_ILLUSTRATION_DAYS), (c) => c.fraction).id
}

// 3. How much mass must fall in each year to make 3C 273's light, with no spin?
export const FUEL_CHOICES = [
  { id: 'twentieth', solarPerYear: 0.05 },
  { id: 'half', solarPerYear: 0.5 },
  { id: 'five', solarPerYear: 5 },
  { id: 'fifty', solarPerYear: 50 },
  { id: 'five-hundred', solarPerYear: 500 },
] as const
export type FuelChoiceId = (typeof FUEL_CHOICES)[number]['id']
export function fuelAnswer(): FuelChoiceId {
  return nearestOnLogScale(FUEL_CHOICES, infallMassPerYearSolar(PART_ONE_LUMINOSITY_SOLAR, PART_ONE_SPIN), (c) => c.solarPerYear).id
}

// The white guess marks: where each guess sits on the real picture's ruler (the real value is drawn separately).
export function ratioGuessMarker(id: RatioChoiceId): { luminositySolar: number; position: number } {
  const times = RATIO_CHOICES.find((c) => c.id === id)!.times
  const luminositySolar = times * MILKY_WAY_LUMINOSITY_SOLAR
  return { luminositySolar, position: brightnessRulerPosition(luminositySolar) }
}
export function widthGuessMarker(id: WidthChoiceId): { lightDays: number; position: number } {
  const fraction = WIDTH_CHOICES.find((c) => c.id === id)!.fraction
  const lightDays = fraction * milkyWayWidthLightDays()
  return { lightDays, position: widthRulerPosition(lightDays) }
}
export function fuelGuessMarker(id: FuelChoiceId): { solarMassesPerYear: number; position: number } {
  const solarMassesPerYear = FUEL_CHOICES.find((c) => c.id === id)!.solarPerYear
  return { solarMassesPerYear, position: fuelRulerPosition(solarMassesPerYear) }
}

export function guessResult(guess: string, answer: string): 'matched' | 'not matched' {
  return guess === answer ? 'matched' : 'not matched'
}

// ---- Step 5: the check-up against published values (CLAUDE.md §14, "Reading the Results") ----
// No cut-off of the page's own: a row says "the same" only when the page's number rounds to the published one at the precision the published number
// is given to; otherwise it says "more" or "less", with the gap as a percentage of the published number.

export const PUBLISHED = {
  // Begelman's review (NED/IPAC): "about 6% ... to about 42%" of the rest-mass energy; OpenStax Astronomy 2e, 27.2: "10% or, in the extreme theoretical limit, 32%".
  begelmanNoSpinEfficiency: 0.06,
  begelmanCeilingEfficiency: 0.42,
  openStaxExtremeEfficiency: 0.32,
  openStaxFusionEfficiency: 0.0071,
  // NASA Voyager, "What is a light-day?", read 2026-11-20.
  nasaLightDayKm: 25_902_068_356,
  // ESO eso2402: "eats just over a Sun per day" (J0529_PUBLISHED_SOLAR_MASSES_PER_YEAR above); the efficiency the page uses for the check, "easily reach" 10% (OpenStax).
  openStaxEasilyReachEfficiency: 0.1,
} as const

// The ceiling of Black Holes 8's energy released, the limit as the spin goes to 1 with the probe circling with it: the last safe orbit comes in to one
// reference radius, where a probe's energy per unit rest mass is 1/sqrt(3), so 1 - 1/sqrt(3) = 42.3 percent. Black Holes 8's function stops short of spin 1,
// so the limit is written here and a test checks that its values climb towards it.
export const CEILING_EFFICIENCY = 1 - 1 / Math.sqrt(3)

export type CheckUpReading = 'the same' | 'more' | 'less'

function roundToSigFigs(x: number, figures: number): number {
  return Number(x.toPrecision(figures))
}

export interface CheckUpComparison {
  reading: CheckUpReading
  percentGap: number // (page - published) / published x 100
}

export function compareToPublished(page: number, published: number, figures: number): CheckUpComparison {
  checkPositive(page, 'The page value')
  checkPositive(published, 'The published value')
  const percentGap = ((page - published) / published) * 100
  const same = roundToSigFigs(page, figures) === roundToSigFigs(published, figures)
  return { reading: same ? 'the same' : page > published ? 'more' : 'less', percentGap }
}

export interface CheckUpRow extends CheckUpComparison {
  id: 'j0529-rate' | 'no-spin-efficiency' | 'ceiling-efficiency' | 'ceiling-efficiency-openstax' | 'fusion-efficiency' | 'light-day'
  page: number
  published: number
  figures: number // the precision of the published number that the reading uses
}

export function checkUp(): CheckUpRow[] {
  const row = (id: CheckUpRow['id'], page: number, published: number, figures: number): CheckUpRow => ({ id, page, published, figures, ...compareToPublished(page, published, figures) })
  return [
    row('j0529-rate', massPerYearSolar(J0529_LUMINOSITY_SOLAR, PUBLISHED.openStaxEasilyReachEfficiency), J0529_PUBLISHED_SOLAR_MASSES_PER_YEAR, 2),
    row('no-spin-efficiency', infallEfficiency(0), PUBLISHED.begelmanNoSpinEfficiency, 1),
    row('ceiling-efficiency', CEILING_EFFICIENCY, PUBLISHED.begelmanCeilingEfficiency, 2),
    row('ceiling-efficiency-openstax', CEILING_EFFICIENCY, PUBLISHED.openStaxExtremeEfficiency, 2),
    row('fusion-efficiency', FUSION_EFFICIENCY, PUBLISHED.openStaxFusionEfficiency, 2),
    row('light-day', lightDayMeters() / 1000, PUBLISHED.nasaLightDayKm, 8),
  ]
}

// The brightness ratio's range over the two Milky Way sources, for the page's "range, not a cut-off" line.
export function brightnessRatioRangeFor3C273() {
  return brightnessRatioRange(THREE_C_273_LUMINOSITY_SOLAR)
}

// ---- Step 6: the tutor marks the three guesses ----

export interface QuasarGuesses {
  ratio: RatioChoiceId
  width: WidthChoiceId
  fuel: FuelChoiceId
}

export function markGuesses(guesses: QuasarGuesses): { ratio: boolean; width: boolean; fuel: boolean } {
  return {
    ratio: guessResult(guesses.ratio, ratioAnswer()) === 'matched',
    width: guessResult(guesses.width, widthAnswer()) === 'matched',
    fuel: guessResult(guesses.fuel, fuelAnswer()) === 'matched',
  }
}
