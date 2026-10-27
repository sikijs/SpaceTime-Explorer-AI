// Frontier and Beyond, Experiment 22: does the universe hum? (pulsar timing arrays)
// See docs/experiments/frontier-and-beyond/22-does-the-universe-hum.md, "Physics Model".
//
// Kepler's law for two black holes in orbit, the wave frequency (twice the orbital frequency), the lowest frequency that a data set of a
// given length can pick out (1 / the span), a rough estimate of the shift in a pulse's arrival time (the strain divided by 2 pi times the
// frequency), the Hellings-Downs pattern, and the published results as data. The module does not model the pulsars' noise, the data analysis,
// how many pairs make the background, the shrinking of the orbit, or any other explanation of the signal. It imports nothing.

// ---- Constants (SI) ----
export const G = 6.6743e-11 // m^3 kg^-1 s^-2
export const SOLAR_MASS_KG = 1.98847e30
export const METRES_PER_PARSEC = 3.0856775814913673e16
export const SECONDS_PER_YEAR = 365.25 * 86400 // a Julian year

function checkPositive(x: number, what: string) {
  if (!Number.isFinite(x) || !(x > 0)) throw new RangeError(`${what} must be a positive, finite number.`)
}

// ---- Kepler's law and the wave ----

// The orbital period in seconds of two masses (in Suns) at a separation (in parsecs): T = 2 pi sqrt(a^3 / (G (M1 + M2))).
export function orbitalPeriodSeconds(mass1Solar: number, mass2Solar: number, separationPc: number): number {
  checkPositive(mass1Solar, 'The first mass')
  checkPositive(mass2Solar, 'The second mass')
  checkPositive(separationPc, 'The separation')
  const a = separationPc * METRES_PER_PARSEC
  return 2 * Math.PI * Math.sqrt((a * a * a) / (G * (mass1Solar + mass2Solar) * SOLAR_MASS_KG))
}

export interface Binary {
  mass1Solar: number
  mass2Solar: number
  separationPc: number
  orbitalPeriodSeconds: number
  orbitalPeriodYears: number
  // The gravitational wave has twice the orbital frequency, so one wave cycle is half an orbit.
  waveCycleSeconds: number
  waveCycleYears: number
  frequencyHz: number
  frequencyNanohertz: number
}

export function binary(mass1Solar: number, mass2Solar: number, separationPc: number): Binary {
  const period = orbitalPeriodSeconds(mass1Solar, mass2Solar, separationPc)
  const cycle = period / 2
  return {
    mass1Solar,
    mass2Solar,
    separationPc,
    orbitalPeriodSeconds: period,
    orbitalPeriodYears: period / SECONDS_PER_YEAR,
    waveCycleSeconds: cycle,
    waveCycleYears: cycle / SECONDS_PER_YEAR,
    frequencyHz: 1 / cycle,
    frequencyNanohertz: (1 / cycle) * 1e9,
  }
}

// The example of the predictions and Picture 1: two black holes of a billion Suns each, 0.01 parsecs apart.
export const EXAMPLE_PAIR = { massSolar: 1e9, separationPc: 0.01 } as const

export function examplePair(): Binary {
  return binary(EXAMPLE_PAIR.massSolar, EXAMPLE_PAIR.massSolar, EXAMPLE_PAIR.separationPc)
}

// ---- What a data set can pick out ----

// The observing span used on the page: the NANOGrav 15-year data set.
export const OBSERVING_SPAN_YEARS = 15

// The lowest frequency a span can pick out, about 1 / the span, in hertz (2.1 nanohertz for 15 years). A rough rule; the papers' own lowest frequency is to be checked.
export function lowestFrequencyHz(spanYears: number = OBSERVING_SPAN_YEARS): number {
  checkPositive(spanYears, 'The span')
  return 1 / (spanYears * SECONDS_PER_YEAR)
}

export function cyclesInSpan(b: Binary, spanYears: number = OBSERVING_SPAN_YEARS): number {
  checkPositive(spanYears, 'The span')
  return spanYears / b.waveCycleYears
}

// A wave with less than one cycle in the span can show up only as a slow drift, not as a wave.
export function fitsInSpan(b: Binary, spanYears: number = OBSERVING_SPAN_YEARS): boolean {
  return cyclesInSpan(b, spanYears) >= 1
}

// ---- The shift in a pulse's arrival time ----

// The published strain of the NANOGrav 15-year background at a frequency of 1 per year (the abstract of arXiv:2306.16213).
export const NANOGRAV_15_YEAR = {
  strain: 2.4e-15,
  strainPlus: 0.7e-15,
  strainMinus: 0.6e-15,
  referenceFrequencyHz: 1 / SECONDS_PER_YEAR,
  pulsars: 67,
  sigmaLow: 3.5,
  sigmaHigh: 4,
} as const

// A rough estimate of the shift in arrival time: delta t = h / (2 pi f), in seconds. A rough standard estimate, not a result of any paper (to be checked).
export function timingShiftSeconds(strain: number, frequencyHz: number): number {
  checkPositive(strain, 'The strain')
  checkPositive(frequencyHz, 'The frequency')
  return strain / (2 * Math.PI * frequencyHz)
}

export function exampleTimingShiftSeconds(): number {
  return timingShiftSeconds(NANOGRAV_15_YEAR.strain, NANOGRAV_15_YEAR.referenceFrequencyHz)
}

// ---- The Hellings-Downs pattern ----

// The expected correlation between the timing of two pulsars an angle theta apart: 3/2 x ln x - x/4 + 1/2, with x = (1 - cos theta) / 2.
export function hellingsDowns(thetaDegrees: number): number {
  if (!Number.isFinite(thetaDegrees) || thetaDegrees < 0 || thetaDegrees > 180) throw new RangeError('The angle must be between 0 and 180 degrees.')
  const x = (1 - Math.cos((thetaDegrees * Math.PI) / 180)) / 2
  if (x === 0) return 0.5
  return 1.5 * x * Math.log(x) - x / 4 + 0.5
}

// Where the pattern is lowest: d/dx = 3/2 (ln x + 1) - 1/4 = 0, so ln x = -5/6.
export function hellingsDownsMinimum(): { angleDegrees: number; value: number } {
  const x = Math.exp(-5 / 6)
  const angle = (Math.acos(1 - 2 * x) * 180) / Math.PI
  return { angleDegrees: angle, value: hellingsDowns(angle) }
}

// ---- The published results, as data (abstracts and search summaries read 2026-10-27; see the specification's "Sources read") ----

export interface PublishedResult {
  id: 'nanograv' | 'epta' | 'ppta' | 'cpta'
  array: string
  sigmaLow: number
  sigmaHigh: number
}

export const PUBLISHED_RESULTS: PublishedResult[] = [
  { id: 'nanograv', array: 'NANOGrav (15 years)', sigmaLow: 3.5, sigmaHigh: 4 },
  { id: 'epta', array: 'EPTA with InPTA', sigmaLow: 3, sigmaHigh: 3 },
  { id: 'ppta', array: 'PPTA', sigmaLow: 2, sigmaHigh: 2 },
  { id: 'cpta', array: 'CPTA', sigmaLow: 4.6, sigmaHigh: 4.6 },
]

// LIGO's reference for comparison: GW150914 (about 36 and 29 Suns) "sweeps upwards in frequency from 35 to 250 Hz" (the abstract of the discovery paper, Phys. Rev. Lett.
// 116, 061102, 2016, read on 2026-10-27); used only to place LIGO's waves on Picture 1's ruler.
export const LIGO_REFERENCE = { lowHz: 35, peakHz: 250 } as const

export function ligoCycleSeconds(): { longest: number; shortest: number } {
  return { longest: 1 / LIGO_REFERENCE.lowHz, shortest: 1 / LIGO_REFERENCE.peakHz }
}

// ---- Picture 1's ruler: the length of one wave cycle, in seconds, on a log scale ----
export const CYCLE_RULER_MIN_SECONDS = 1e-3
export const CYCLE_RULER_MAX_SECONDS = 1e10

function logPosition(x: number, min: number, max: number): number {
  checkPositive(x, 'The value')
  const pos = (Math.log10(x) - Math.log10(min)) / (Math.log10(max) - Math.log10(min))
  return Math.min(1, Math.max(0, pos))
}

// Where a cycle length sits on the ruler, from 0 (left end) to 1 (right end).
export function cycleRulerPosition(seconds: number): number {
  return logPosition(seconds, CYCLE_RULER_MIN_SECONDS, CYCLE_RULER_MAX_SECONDS)
}

// ---- Picture 2's ruler: the shift in arrival time, in seconds, on a log scale ----
export const SHIFT_RULER_MIN_SECONDS = 1e-11
export const SHIFT_RULER_MAX_SECONDS = 1e-2

export function shiftRulerPosition(seconds: number): number {
  return logPosition(seconds, SHIFT_RULER_MIN_SECONDS, SHIFT_RULER_MAX_SECONDS)
}

// One pulse every millisecond, as a stand-in for a millisecond pulsar's pulse period; a fast pulsar's period is a few milliseconds (no source read; to be checked).
export const PULSE_PERIOD_EXAMPLE_SECONDS = 1e-3

// ---- The predictions ----

// Prediction 1: how long one wave cycle of the example pair lasts. Six buttons on a log scale about a year.
export const CYCLE_CHOICES = [
  { id: 'minute', label: 'about a minute', seconds: 60 },
  { id: 'day', label: 'about a day', seconds: 86400 },
  { id: 'month', label: 'about a month', seconds: 30.4375 * 86400 },
  { id: 'year', label: 'about a year', seconds: SECONDS_PER_YEAR },
  { id: 'decade', label: 'about a decade', seconds: 10 * SECONDS_PER_YEAR },
  { id: 'century', label: 'about a century', seconds: 100 * SECONDS_PER_YEAR },
] as const
export type CycleChoiceId = (typeof CYCLE_CHOICES)[number]['id']

function nearestOnLogScale<T extends { seconds: number }>(choices: readonly T[], value: number): T {
  let best = choices[0]
  for (const c of choices) {
    if (Math.abs(Math.log(c.seconds) - Math.log(value)) < Math.abs(Math.log(best.seconds) - Math.log(value))) best = c
  }
  return best
}

export function cycleAnswer(): CycleChoiceId {
  return nearestOnLogScale(CYCLE_CHOICES, examplePair().waveCycleSeconds).id
}

export function cycleChoiceSeconds(id: CycleChoiceId): number {
  return CYCLE_CHOICES.find((c) => c.id === id)!.seconds
}

// The tutor's mark (§12, §13): used in the explanation only.
export function cycleGuessResult(id: CycleChoiceId): 'matched' | 'not matched' {
  return id === cycleAnswer() ? 'matched' : 'not matched'
}

// Prediction 2: the size of the shift in arrival time, in billionths of a second. Five buttons on a log scale about 10.
export const SHIFT_CHOICES_NANOSECONDS = [0.1, 1, 10, 100, 1000] as const
export type ShiftChoice = (typeof SHIFT_CHOICES_NANOSECONDS)[number]

export function shiftAnswer(): ShiftChoice {
  const real = exampleTimingShiftSeconds() * 1e9
  let best: ShiftChoice = SHIFT_CHOICES_NANOSECONDS[0]
  for (const c of SHIFT_CHOICES_NANOSECONDS) {
    if (Math.abs(Math.log(c) - Math.log(real)) < Math.abs(Math.log(best) - Math.log(real))) best = c
  }
  return best
}

export function shiftGuessResult(choice: ShiftChoice): 'matched' | 'not matched' {
  return choice === shiftAnswer() ? 'matched' : 'not matched'
}

// A guess as a mark on its ruler: where it sits, from 0 to 1.
export function cycleGuessMarker(id: CycleChoiceId): { seconds: number; position: number } {
  const seconds = cycleChoiceSeconds(id)
  return { seconds, position: cycleRulerPosition(seconds) }
}

export function shiftGuessMarker(choice: ShiftChoice): { seconds: number; position: number } {
  const seconds = choice * 1e-9
  return { seconds, position: shiftRulerPosition(seconds) }
}

// ---- Part 2: "Now try it yourself" (trial values, not real pairs) ----

export const TRIAL_MASS_CHOICES_SOLAR = [1e8, 1e9, 1e10] as const
export const TRIAL_SEPARATION_CHOICES_PC = [0.003, 0.01, 0.03, 0.1] as const

// Drawing A's ruler: the wave frequency in nanohertz, from 0.1 to 10,000, on a log scale.
export const FREQUENCY_RULER_MIN_NANOHERTZ = 0.1
export const FREQUENCY_RULER_MAX_NANOHERTZ = 10000

export function frequencyRulerPosition(nanohertz: number): number {
  return logPosition(nanohertz, FREQUENCY_RULER_MIN_NANOHERTZ, FREQUENCY_RULER_MAX_NANOHERTZ)
}

export interface TrialPicture {
  binary: Binary
  cyclesIn15Years: number
  fits: boolean
  lowestNanohertz: number
  frequencyPosition: number
  lowestPosition: number
  // The trial's wave frequency divided by the example pair's.
  frequencyOverExample: number
}

// Two black holes of equal mass at a separation, drawn against the lowest frequency that 15 years can pick out.
export function trialPicture(massSolar: number, separationPc: number): TrialPicture {
  const b = binary(massSolar, massSolar, separationPc)
  const lowest = lowestFrequencyHz() * 1e9
  return {
    binary: b,
    cyclesIn15Years: cyclesInSpan(b),
    fits: fitsInSpan(b),
    lowestNanohertz: lowest,
    frequencyPosition: frequencyRulerPosition(b.frequencyNanohertz),
    lowestPosition: frequencyRulerPosition(lowest),
    frequencyOverExample: b.frequencyHz / examplePair().frequencyHz,
  }
}

// A separation in parsecs, in Earth-Sun distances (astronomical units), for the control's button labels.
export function separationAu(separationPc: number): number {
  checkPositive(separationPc, 'The separation')
  return separationPc * AU_PER_PARSEC
}

// ---- Picture 1 (Step 4): the pair, its orbit and wave, and a ruler of cycle lengths with LIGO's waves and what 15 years of timing can pick out ----

export const AU_PER_PARSEC = 206264.80624709636

// The cycle lengths that Picture 1's ruler labels, in seconds: a millisecond, a second, an hour, a day, a year, ten years, a hundred years.
export const PICTURE_ONE_TICKS_SECONDS = [1e-3, 1, 3600, 86400, SECONDS_PER_YEAR, 10 * SECONDS_PER_YEAR, 100 * SECONDS_PER_YEAR] as const

// Where the band that a span can pick out stops fading, on the left: a fixed ruler position for the picture's fade (the real limit depends on how often pulsars are timed and is not modelled).
export const PICTURE_ONE_BAND_FADE_SECONDS = 1e6

export interface PictureOne {
  pair: Binary
  separationAu: number
  orbitsPerWaveCycle: number // the wave cycle is half an orbit, so 0.5; and 2 wave cycles per orbit
  waveCyclesPerOrbit: number
  ligo: { lowHz: number; peakHz: number; longestSeconds: number; shortestSeconds: number; longestPosition: number; shortestPosition: number }
  span: { years: number; longestCycleSeconds: number; longestCyclePosition: number; fadeEndPosition: number; cyclesForPair: number; pairFits: boolean }
  pairPosition: number
  // How many times longer the pair's wave cycle is than LIGO's longest, and than its shortest.
  pairOverLigoLongest: number
  pairOverLigoShortest: number
}

export function pictureOne(): PictureOne {
  const pair = examplePair()
  const lig = ligoCycleSeconds()
  const spanSeconds = OBSERVING_SPAN_YEARS * SECONDS_PER_YEAR
  return {
    pair,
    separationAu: EXAMPLE_PAIR.separationPc * AU_PER_PARSEC,
    orbitsPerWaveCycle: pair.waveCycleSeconds / pair.orbitalPeriodSeconds,
    waveCyclesPerOrbit: pair.orbitalPeriodSeconds / pair.waveCycleSeconds,
    ligo: {
      lowHz: LIGO_REFERENCE.lowHz,
      peakHz: LIGO_REFERENCE.peakHz,
      longestSeconds: lig.longest,
      shortestSeconds: lig.shortest,
      longestPosition: cycleRulerPosition(lig.longest),
      shortestPosition: cycleRulerPosition(lig.shortest),
    },
    span: {
      years: OBSERVING_SPAN_YEARS,
      longestCycleSeconds: spanSeconds,
      longestCyclePosition: cycleRulerPosition(spanSeconds),
      fadeEndPosition: cycleRulerPosition(PICTURE_ONE_BAND_FADE_SECONDS),
      cyclesForPair: cyclesInSpan(pair),
      pairFits: fitsInSpan(pair),
    },
    pairPosition: cycleRulerPosition(pair.waveCycleSeconds),
    pairOverLigoLongest: pair.waveCycleSeconds / lig.longest,
    pairOverLigoShortest: pair.waveCycleSeconds / lig.shortest,
  }
}

// ---- Picture 2 (Step 5): the pulse's path, and a ruler of the shift in arrival time ----

// The decades that Picture 2's ruler labels, in seconds: 0.01 nanoseconds to 10 milliseconds.
export const PICTURE_TWO_TICKS_SECONDS = [1e-11, 1e-10, 1e-9, 1e-8, 1e-7, 1e-6, 1e-5, 1e-4, 1e-3, 1e-2] as const

export interface PictureTwo {
  strain: number
  strainLow: number
  strainHigh: number
  referenceFrequencyHz: number
  shiftSeconds: number
  shiftNanoseconds: number
  // The shift from the lowest and the highest published strain (a simple low-to-high range, not a statistical one).
  shiftLowSeconds: number
  shiftHighSeconds: number
  shiftPosition: number
  shiftLowPosition: number
  shiftHighPosition: number
  pulsePeriodSeconds: number
  pulsePeriodPosition: number
  // How many times longer the example pulse period is than the shift.
  pulsePeriodOverShift: number
}

export function pictureTwo(): PictureTwo {
  const n = NANOGRAV_15_YEAR
  const f = n.referenceFrequencyHz
  const shift = timingShiftSeconds(n.strain, f)
  const low = timingShiftSeconds(n.strain - n.strainMinus, f)
  const high = timingShiftSeconds(n.strain + n.strainPlus, f)
  return {
    strain: n.strain,
    strainLow: n.strain - n.strainMinus,
    strainHigh: n.strain + n.strainPlus,
    referenceFrequencyHz: f,
    shiftSeconds: shift,
    shiftNanoseconds: shift * 1e9,
    shiftLowSeconds: low,
    shiftHighSeconds: high,
    shiftPosition: shiftRulerPosition(shift),
    shiftLowPosition: shiftRulerPosition(low),
    shiftHighPosition: shiftRulerPosition(high),
    pulsePeriodSeconds: PULSE_PERIOD_EXAMPLE_SECONDS,
    pulsePeriodPosition: shiftRulerPosition(PULSE_PERIOD_EXAMPLE_SECONDS),
    pulsePeriodOverShift: PULSE_PERIOD_EXAMPLE_SECONDS / shift,
  }
}
