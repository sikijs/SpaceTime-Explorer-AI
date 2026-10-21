// Frontier and Beyond, Experiment 9: can a clock tell how high it is? Optical lattice clocks.
// See docs/experiments/frontier-and-beyond/09-can-a-clock-tell-its-height.md, "Physics Model".
//
// No new physics beyond the weak-field clock-rate formula of Gravity Experiments 2 and 9: a clock higher by h ticks faster by the fraction g h / c^2, with one
// constant g (a good approximation for heights of a few kilometres; exactRateDifference is here only to check that). The module does not model an optical
// lattice clock and does not analyse any data: the published numbers are the JILA (2022) precision and the Wisconsin (2022 to 2023) measured gradient,
// quoted as their papers state them. The Wisconsin result's two uncertainties are combined in quadrature, as if independent, which is this experiment's own
// simplification (the same as in Experiment 8).

// Constants, in SI units.
export const G_EARTH = 9.81 // m/s^2, one constant value near the Earth's surface
export const SPEED_OF_LIGHT = 299_792_458 // m/s (exact, by the definition of the metre)
export const SECONDS_PER_YEAR = 31_557_600 // s, a year of 365.25 days
// Only for exactRateDifference, the check of the approximation (the same values as the GPS experiment's module, copied so that this module imports nothing).
const EARTH_GM = 3.986004418e14 // m^3/s^2
const EARTH_RADIUS_M = 6.371e6 // m, the mean radius

// JILA, 2022 (Bothwell et al., Nature 602, 420-424; arXiv:2109.12238): the fractional frequency measurement uncertainty of a strontium lattice clock whose
// atom cloud is about a millimetre tall. Only the abstract was read.
export const JILA_2022 = {
  precision: 7.6e-21,
  millimetres: 1,
  source: 'Bothwell et al., Nature 602, 420-424 (2022)',
}

// Wisconsin, 2022 to 2023 (Zheng et al., Nature Communications 14 (2023); arXiv:2207.07145): a fractional frequency gradient across 1 cm, in units of 1e-19
// per cm (the paper's sign only says which way the height is counted).
export const WISCONSIN_2023 = {
  measured: 12.4,
  statistical: 0.7,
  systematic: 2.5,
  expected: 10.9,
  source: 'Zheng et al., Nature Communications 14 (2023)',
}

function requireNonNegative(value: number, what: string): void {
  if (!Number.isFinite(value) || value < 0) throw new RangeError(`${what} must not be negative`)
}
function requirePositive(value: number, what: string): void {
  if (!Number.isFinite(value) || value <= 0) throw new RangeError(`${what} must be positive`)
}

// The fraction by which a clock higher by heightM ticks faster: g h / c^2.
export function rateDifference(heightM: number): number {
  requireNonNegative(heightM, 'The height')
  return (G_EARTH * heightM) / (SPEED_OF_LIGHT * SPEED_OF_LIGHT)
}

// The gap that builds up between the two clocks after `seconds`: the fraction times the time.
export function timeGap(heightM: number, seconds: number): number {
  requireNonNegative(seconds, 'The time')
  return rateDifference(heightM) * seconds
}

// The smallest height difference that a clock of this precision can see: the precision divided by g / c^2.
export function smallestHeight(precision: number): number {
  requirePositive(precision, 'The precision')
  return (precision * SPEED_OF_LIGHT * SPEED_OF_LIGHT) / G_EARTH
}

// How many times the effect is larger than the clock's precision (the signal against the precision).
export function signalToPrecision(heightM: number, precision: number): number {
  requirePositive(precision, 'The precision')
  return rateDifference(heightM) / precision
}

// How many sigma a measured value is from the expected one, with the two uncertainties combined in quadrature.
export function sigmasFromExpected(measured: number, statistical: number, systematic: number, expected: number): number {
  if (!Number.isFinite(measured) || !Number.isFinite(expected)) throw new RangeError('The values must be numbers')
  requireNonNegative(statistical, 'An uncertainty')
  requireNonNegative(systematic, 'An uncertainty')
  const combined = Math.sqrt(statistical * statistical + systematic * systematic)
  requirePositive(combined, 'The combined uncertainty')
  return Math.abs(measured - expected) / combined
}

// The exact weak-field value for a clock at height h above the Earth's surface: GM / c^2 x (1 / R - 1 / (R + h)). Used only to check that the
// constant-g formula is a good approximation up to a few kilometres.
export function exactRateDifference(heightM: number): number {
  requireNonNegative(heightM, 'The height')
  return (EARTH_GM / (SPEED_OF_LIGHT * SPEED_OF_LIGHT)) * (1 / EARTH_RADIUS_M - 1 / (EARTH_RADIUS_M + heightM))
}

// How many years it takes for a clock that is wrong by this fraction to be wrong by one second (an everyday way to picture a tiny fraction).
export function yearsToDrift(fraction: number): number {
  requirePositive(fraction, 'The fraction')
  return 1 / (fraction * SECONDS_PER_YEAR)
}

// The nearest of three sizes, by the ratio (on a logarithmic scale), for the predictions' answers.
function nearestOf<T extends string>(value: number, choices: ReadonlyArray<readonly [T, number]>): T {
  requirePositive(value, 'The value')
  let best = choices[0]
  for (const choice of choices) {
    if (Math.abs(Math.log10(value / choice[1])) < Math.abs(Math.log10(value / best[1]))) best = choice
  }
  return best[0]
}
export type LengthScale = 'metre' | 'centimetre' | 'millimetre'
export function lengthScale(heightM: number): LengthScale {
  return nearestOf<LengthScale>(heightM, [['metre', 1], ['centimetre', 0.01], ['millimetre', 0.001]])
}
export type TimeScale = 'microsecond' | 'nanosecond' | 'picosecond'
export function timeScale(seconds: number): TimeScale {
  return nearestOf<TimeScale>(seconds, [['microsecond', 1e-6], ['nanosecond', 1e-9], ['picosecond', 1e-12]])
}

// The answers to the two predictions (the specification's "Prediction Activity"), from the module's own numbers.
// Prediction 1: how far apart are two clocks 1 metre apart after a year? Prediction 2: what height is a rate difference of one part in 10^19?
export function gapAnswer(): TimeScale {
  return timeScale(timeGap(1, SECONDS_PER_YEAR))
}
export function heightAnswer(): LengthScale {
  return lengthScale(smallestHeight(1e-19))
}

// The numbers of the learner's own height, time and clock precision.
export interface ClockHeightResult {
  heightM: number
  seconds: number
  precision: number
  rateDifference: number // the fraction by which the upper clock ticks faster
  timeGap: number // s, after `seconds`
  smallestHeight: number // m, that a clock of this precision can see
  signalToPrecision: number // how many times the effect is larger than the precision
  canResolve: boolean // whether the clock can see this height difference at all (the effect is at least the precision)
}

export function runClockHeight(heightM: number, seconds: number, precision: number): ClockHeightResult {
  const rate = rateDifference(heightM)
  const ratio = signalToPrecision(heightM, precision)
  return {
    heightM,
    seconds,
    precision,
    rateDifference: rate,
    timeGap: timeGap(heightM, seconds),
    smallestHeight: smallestHeight(precision),
    signalToPrecision: ratio,
    canResolve: ratio >= 1,
  }
}
