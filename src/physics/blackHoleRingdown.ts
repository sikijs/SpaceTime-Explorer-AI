// Cosmic Horizons, Experiment 19: do black holes ring like bells? (GW250114's ringdown and the "no-hair" test)
// See docs/experiments/cosmic-horizons/19-do-black-holes-ring-like-bells.md, "Physics Model".
//
// Two published fits, given and not derived, for the main ringing tone ((l, m, n) = (2, 2, 0)) of a spinning black hole of mass M and spin chi
// (Berti, Cardoso and Will, 2006), with t_M = G M / c^3:
//   2 pi f t_M = 1.5251 - 1.1568 (1 - chi)^0.1292      (the pitch)
//   Q          = 0.7000 + 1.4187 (1 - chi)^-0.4990     (the quality factor)
// and the fade time tau = Q / (pi f), the time for the ringing to fall to 1/e of its size, which is Q / pi swings long.
// The coefficients came from a search summary and from recall; they were NOT read at the paper, and an independent check failed (the
// specification's open item (a)). The paper says only that its fits are "accurate within a few percent", and the page may claim no more.
// At spin 0 the fit is within about 1.4 percent (pitch) and 0.9 percent (Q) of the literature's value as recalled, which is not a source check.
//
// Frames: the fits give the pitch and fade time in the black hole's own (source) frame. The detectors record them stretched by 1 + z.
// The module does not simulate the merger, fit a signal, calculate the overtone, or derive the no-hair theorem.
// It imports only Black Holes 1's module (for G M / c^2) and the speed of light that module uses.

import { horizonRadiusKm } from './blackHoleSizeExperiment'
import { REAL_SPEED_OF_LIGHT_KM_PER_S } from './hubblesLawExperiment'

// ---- The published data (read 2026-10-26 in part: see the specification's "Sources read") ----

export const GW250114_RINGDOWN = {
  // Source-frame final mass and spin (the same as Experiment 18's, from summaries of the area-law paper's supplement).
  finalMassSolar: 62.7,
  finalSpin: 0.68,
  // The redshift, about 0.09 (the distance is about 1.14 billion light-years; the specification's figure, not read at the paper).
  redshift: 0.09,
  // The measured main tone at the detectors (arXiv:2509.08099, partial read of its HTML), with the 90 percent credible range's two sides.
  measuredFrequencyHz: 251.7,
  measuredFrequencyMinusHz: 5.0,
  measuredFrequencyPlusHz: 5.1,
  measuredDampingTimeMs: 4.09,
  measuredDampingTimeMinusMs: 0.38,
  measuredDampingTimePlusMs: 0.42,
}

// How sure the second, faster-fading tone is, as a 2026 re-analysis of the same ringing reports it (arXiv:2605.03576, its abstract, read 2026-10-26): the first overtone's inferred
// significance rose from 82.5 to 99.9 percent with an orthonormal-mode analysis, against earlier non-orthogonal ones. Published figures, not calculated here.
export const SECOND_TONE_SIGNIFICANCE = { earlierPercent: 82.5, laterPercent: 99.9 }

// The learner's trial choices (the specification's controls).
export const MASS_CHOICES_SOLAR = [10, 30, 62.7, 100, 4.3e6] as const // the last is Sagittarius A* (Black Holes 1's preset)
export const SPIN_CHOICES = [0, 0.5, 0.68, 0.9, 0.99] as const

// Prediction 1: higher, lower or the same pitch for a faster spin.
export const PITCH_CHOICES = ['lower', 'same', 'higher'] as const
export type PitchChoice = (typeof PITCH_CHOICES)[number]

// Prediction 2: the number of swings before the ringing falls to 1/e of its size. Spaced evenly on a log scale around the real value (about 1):
// a third and a tenth below, three and ten times above, and 30 for a church bell's long ring. The wording and the buttons are the owner's to approve.
export const SWINGS_CHOICES = [0.1, 0.3, 1, 3, 10, 30] as const
export type SwingsChoice = (typeof SWINGS_CHOICES)[number]

function checkMass(massSolar: number) {
  if (!Number.isFinite(massSolar) || !(massSolar > 0)) {
    throw new RangeError('The mass must be a positive, finite number of Suns.')
  }
}

// The fits are for spins from 0 up to, but not including, 1.
function checkSpin(spin: number) {
  if (!Number.isFinite(spin) || spin < 0 || spin >= 1) {
    throw new RangeError('The spin must be at least 0 and less than 1.')
  }
}

// ---- The ringing, in the black hole's own frame ----

// t_M = G M / c^3 in seconds: G M / c^2 in km (half of Black Holes 1's horizon radius) divided by the speed of light.
export function lightCrossingTimeS(massSolar: number): number {
  checkMass(massSolar)
  return horizonRadiusKm(massSolar) / 2 / REAL_SPEED_OF_LIGHT_KM_PER_S
}

// 2 pi f t_M, the pitch in units of the black hole's own time (it depends on the spin only).
export function dimensionlessPitch(spin: number): number {
  checkSpin(spin)
  return 1.5251 - 1.1568 * (1 - spin) ** 0.1292
}

export function qualityFactor(spin: number): number {
  checkSpin(spin)
  return 0.7 + 1.4187 * (1 - spin) ** -0.499
}

export interface Ringing {
  massSolar: number
  spin: number
  frequencyHz: number // source frame
  quality: number
  dampingTimeMs: number // source frame: the time to fall to 1/e
  swingsToFade: number // Q / pi: how many swings fit in one fade time
}

export function ringing(massSolar: number, spin: number): Ringing {
  const tM = lightCrossingTimeS(massSolar)
  const frequencyHz = dimensionlessPitch(spin) / (2 * Math.PI * tM)
  const quality = qualityFactor(spin)
  return {
    massSolar,
    spin,
    frequencyHz,
    quality,
    dampingTimeMs: (quality / (Math.PI * frequencyHz)) * 1000,
    swingsToFade: quality / Math.PI,
  }
}

// ---- What the detectors record ----

// A signal from redshift z arrives with its pitch divided by 1 + z and its times multiplied by 1 + z.
export function detectedFrequencyHz(sourceFrameHz: number, redshift: number = GW250114_RINGDOWN.redshift): number {
  return sourceFrameHz / (1 + redshift)
}

export function detectedDampingTimeMs(sourceFrameMs: number, redshift: number = GW250114_RINGDOWN.redshift): number {
  return sourceFrameMs * (1 + redshift)
}

// GW250114's remnant, calculated here, in both frames.
export function gw250114Ringing(): Ringing & { detectedFrequencyHz: number; detectedDampingTimeMs: number } {
  const r = ringing(GW250114_RINGDOWN.finalMassSolar, GW250114_RINGDOWN.finalSpin)
  return {
    ...r,
    detectedFrequencyHz: detectedFrequencyHz(r.frequencyHz),
    detectedDampingTimeMs: detectedDampingTimeMs(r.dampingTimeMs),
  }
}

// ---- Calculated against measured ----

export interface RingdownComparison {
  calculatedFrequencyHz: number
  measuredFrequencyHz: number
  frequencyRatio: number // measured / calculated
  frequencyPercent: number // how far the measured value is above (positive) or below the calculated one, in percent
  frequencyInsideRange: boolean // whether the calculated value lies inside the measured value's 90 percent range
  calculatedDampingTimeMs: number
  measuredDampingTimeMs: number
  dampingRatio: number
  dampingPercent: number
  dampingInsideRange: boolean
}

export function compareWithMeasured(): RingdownComparison {
  const g = gw250114Ringing()
  const m = GW250114_RINGDOWN
  const insideF =
    g.detectedFrequencyHz >= m.measuredFrequencyHz - m.measuredFrequencyMinusHz &&
    g.detectedFrequencyHz <= m.measuredFrequencyHz + m.measuredFrequencyPlusHz
  const insideT =
    g.detectedDampingTimeMs >= m.measuredDampingTimeMs - m.measuredDampingTimeMinusMs &&
    g.detectedDampingTimeMs <= m.measuredDampingTimeMs + m.measuredDampingTimePlusMs
  const fr = m.measuredFrequencyHz / g.detectedFrequencyHz
  const dr = m.measuredDampingTimeMs / g.detectedDampingTimeMs
  return {
    calculatedFrequencyHz: g.detectedFrequencyHz,
    measuredFrequencyHz: m.measuredFrequencyHz,
    frequencyRatio: fr,
    frequencyPercent: (fr - 1) * 100,
    frequencyInsideRange: insideF,
    calculatedDampingTimeMs: g.detectedDampingTimeMs,
    measuredDampingTimeMs: m.measuredDampingTimeMs,
    dampingRatio: dr,
    dampingPercent: (dr - 1) * 100,
    dampingInsideRange: insideT,
  }
}

// ---- The predictions ----

// The faster spin that Prediction 1 asks about: the same mass, spinning at 0.9 instead of the real 0.68 (the next spin choice up).
export const FASTER_SPIN = 0.9

export function pitchAnswer(): PitchChoice {
  const slow = ringing(GW250114_RINGDOWN.finalMassSolar, GW250114_RINGDOWN.finalSpin).frequencyHz
  const fast = ringing(GW250114_RINGDOWN.finalMassSolar, FASTER_SPIN).frequencyHz
  return fast > slow ? 'higher' : fast < slow ? 'lower' : 'same'
}

// The choice whose value is nearest the real value on a log scale (a number of swings is a ratio, so equal steps are equal factors).
function nearestLog<T extends number>(real: number, choices: readonly T[]): T {
  let best = choices[0]
  for (const c of choices) {
    if (Math.abs(Math.log(c / real)) < Math.abs(Math.log(best / real))) best = c
  }
  return best
}

export function swingsAnswer(swings: number = gw250114Ringing().swingsToFade): SwingsChoice {
  return nearestLog(swings, SWINGS_CHOICES)
}

// For drawing the guess in white. A direction has no size of its own: -1, 0 or +1 for a marker pointing down, flat or up (only a marker).
export function pitchMarker(choice: PitchChoice): -1 | 0 | 1 {
  return choice === 'lower' ? -1 : choice === 'higher' ? 1 : 0
}

// ---- Picture 1: the ringing, the swings and the comparison (the page only draws these numbers) ----

// Panel A: the ringing as the detectors would record it, a fading wave: value = e^(-t / tau) cos(2 pi f t). The phase is the simplest (starting at a crest);
// the real signal's phase and its other tones are not drawn. The time axis runs to about five swings.
export const RINGING_AXIS_MS = 20

export interface WavePoint {
  tMs: number
  value: number // the wave, from -1 to 1
  envelope: number // e^(-t / tau): the size the ringing has fallen to
}

export function ringdownWaveform(frequencyHz: number, dampingTimeMs: number, axisMaxMs: number = RINGING_AXIS_MS, points = 401): WavePoint[] {
  const out: WavePoint[] = []
  for (let i = 0; i < points; i++) {
    const tMs = (axisMaxMs * i) / (points - 1)
    const envelope = Math.exp(-tMs / dampingTimeMs)
    out.push({ tMs, value: envelope * Math.cos(2 * Math.PI * frequencyHz * (tMs / 1000)), envelope })
  }
  return out
}

export interface RingingPicture {
  frequencyHz: number // detector frame
  periodMs: number // one swing, in the detectors
  dampingTimeMs: number // detector frame
  swingsToFade: number // the same in either frame
  axisMaxMs: number
  wave: WavePoint[]
}

export function ringingPicture(): RingingPicture {
  const g = gw250114Ringing()
  return {
    frequencyHz: g.detectedFrequencyHz,
    periodMs: 1000 / g.detectedFrequencyHz,
    dampingTimeMs: g.detectedDampingTimeMs,
    swingsToFade: g.swingsToFade,
    axisMaxMs: RINGING_AXIS_MS,
    wave: ringdownWaveform(g.detectedFrequencyHz, g.detectedDampingTimeMs),
  }
}

// Panel B: the swings on a log scale (a number of swings is a ratio), wide enough for every button and the real value.
export const SWINGS_AXIS = { min: 0.05, max: 60 } as const

// Where a number of swings sits along the log axis, 0 at the left end and 1 at the right.
export function swingsPosition(swings: number): number {
  if (!(swings > 0)) throw new RangeError('The number of swings must be positive.')
  return (Math.log(swings) - Math.log(SWINGS_AXIS.min)) / (Math.log(SWINGS_AXIS.max) - Math.log(SWINGS_AXIS.min))
}

export interface SwingsPicture {
  realSwings: number
  realPosition: number
  ticks: { swings: SwingsChoice; position: number }[]
}

export function swingsPicture(): SwingsPicture {
  const real = gw250114Ringing().swingsToFade
  return { realSwings: real, realPosition: swingsPosition(real), ticks: SWINGS_CHOICES.map((swings) => ({ swings, position: swingsPosition(swings) })) }
}

// The learner's guess, for drawing in white: the number of swings and where it sits on the same axis as the real value.
export function swingsGuessBar(choice: SwingsChoice): { swings: number; position: number } {
  return { swings: choice, position: swingsPosition(choice) }
}

// Panel C: calculated against measured, each on its own scale. The measured value has a 90 percent range (the paper's give-or-take).
export interface ComparisonRow {
  name: 'pitch' | 'fade time'
  unit: 'Hz' | 'ms'
  axisMin: number
  axisMax: number
  calculated: number
  measured: number
  low: number
  high: number
}

export function comparisonRows(): ComparisonRow[] {
  const c = compareWithMeasured()
  const m = GW250114_RINGDOWN
  return [
    {
      name: 'pitch',
      unit: 'Hz',
      axisMin: 230,
      axisMax: 270,
      calculated: c.calculatedFrequencyHz,
      measured: c.measuredFrequencyHz,
      low: m.measuredFrequencyHz - m.measuredFrequencyMinusHz,
      high: m.measuredFrequencyHz + m.measuredFrequencyPlusHz,
    },
    {
      name: 'fade time',
      unit: 'ms',
      axisMin: 3,
      axisMax: 5.2,
      calculated: c.calculatedDampingTimeMs,
      measured: c.measuredDampingTimeMs,
      low: m.measuredDampingTimeMs - m.measuredDampingTimeMinusMs,
      high: m.measuredDampingTimeMs + m.measuredDampingTimePlusMs,
    },
  ]
}


// ---- Pictures 2 and 3: pitch against spin and against mass. Both are in the black hole's own (source) frame: the other black holes have no redshift. ----

// A position along a log axis, 0 at the low end and 1 at the high end.
function logPosition(value: number, min: number, max: number): number {
  return (Math.log(value) - Math.log(min)) / (Math.log(max) - Math.log(min))
}

export interface SpinPoint {
  spin: number
  frequencyHz: number
}

export interface PitchSpinPicture {
  massSolar: number
  curve: SpinPoint[]
  real: SpinPoint // the real spin, 0.68
  faster: SpinPoint // the imagined faster spin, 0.9, at the same mass
  axisMaxHz: number
  detectedRealHz: number // what the detectors recorded for the real one, after the redshift stretch
}

// The curve runs from spin 0 to 0.99 in steps of 0.01, at the mass of the black hole that GW250114 made.
export function pitchSpinPicture(): PitchSpinPicture {
  const m = GW250114_RINGDOWN.finalMassSolar
  const curve: SpinPoint[] = []
  for (let i = 0; i <= 99; i++) curve.push({ spin: i / 100, frequencyHz: ringing(m, i / 100).frequencyHz })
  const real = { spin: GW250114_RINGDOWN.finalSpin, frequencyHz: ringing(m, GW250114_RINGDOWN.finalSpin).frequencyHz }
  return {
    massSolar: m,
    curve,
    real,
    faster: { spin: FASTER_SPIN, frequencyHz: ringing(m, FASTER_SPIN).frequencyHz },
    axisMaxHz: 500,
    detectedRealHz: detectedFrequencyHz(real.frequencyHz),
  }
}

// The learner's guess for Prediction 1, to draw in white. A direction has no size of its own (only a marker), so it is drawn at the faster spin, starting from the real pitch.
export function pitchGuessMark(choice: PitchChoice): { direction: -1 | 0 | 1; spin: number; fromHz: number } {
  return { direction: pitchMarker(choice), spin: FASTER_SPIN, fromHz: pitchSpinPicture().real.frequencyHz }
}

export interface MassPoint {
  label: string
  massSolar: number
  frequencyHz: number
  periodSeconds: number // one swing
  xPosition: number // 0 to 1 along the mass axis
  yPosition: number // 0 to 1 up the pitch axis
}

export interface PitchMassPicture {
  spin: number
  massAxis: { min: number; max: number }
  pitchAxis: { min: number; max: number }
  line: { from: MassPoint; to: MassPoint } // the straight line on the log-log scales
  points: MassPoint[]
}

export const MASS_PICTURE_AXES = { mass: { min: 5, max: 1e7 }, pitch: { min: 0.002, max: 5000 } } as const

export const MASS_POINT_LABELS: Record<number, string> = { 10: '10 Suns', 30: '30 Suns', 62.7: 'GW250114 (62.7 Suns)', 100: '100 Suns', 4.3e6: 'Sagittarius A*: 4.3 million Suns' }

function massPoint(massSolar: number, label: string): MassPoint {
  const r = ringing(massSolar, GW250114_RINGDOWN.finalSpin)
  return {
    label,
    massSolar,
    frequencyHz: r.frequencyHz,
    periodSeconds: 1 / r.frequencyHz,
    xPosition: logPosition(massSolar, MASS_PICTURE_AXES.mass.min, MASS_PICTURE_AXES.mass.max),
    yPosition: logPosition(r.frequencyHz, MASS_PICTURE_AXES.pitch.min, MASS_PICTURE_AXES.pitch.max),
  }
}

// Pitch against mass at the real spin (0.68), for the five example masses (the learner's mass choices).
export function pitchMassPicture(): PitchMassPicture {
  return {
    spin: GW250114_RINGDOWN.finalSpin,
    massAxis: MASS_PICTURE_AXES.mass,
    pitchAxis: MASS_PICTURE_AXES.pitch,
    line: { from: massPoint(MASS_PICTURE_AXES.mass.min, ''), to: massPoint(MASS_PICTURE_AXES.mass.max, '') },
    points: MASS_CHOICES_SOLAR.map((m) => massPoint(m, MASS_POINT_LABELS[m])),
  }
}

// ---- Part 2: the learner's own trial black hole (the real pictures never change) ----

// The trial wave is drawn against the number of swings, so that the same drawing works for a black hole of 10 Suns (a pitch of kilohertz) and one of millions of Suns
// (one swing in minutes). In swings the pitch does not matter and only the spin changes the shape: the ringing falls to 1/e after Q / pi swings.
export const TRIAL_WAVE_SWINGS = 6

export interface TrialWavePoint {
  swings: number
  value: number
  envelope: number
}

export interface TrialRinging {
  massSolar: number
  spin: number
  frequencyHz: number // the black hole's own frame
  periodSeconds: number // one swing
  dampingTimeMs: number
  quality: number
  swingsToFade: number
  pitchOverReal: number // the trial pitch as a multiple of GW250114's black hole's pitch (the same frame)
  fadeTimeOverReal: number
  pitchPosition: number // 0 to 1 along the pitch axis of Picture 3 (log)
  realPitchPosition: number
  wave: TrialWavePoint[]
  realEnvelope: { swings: number; envelope: number }[] // GW250114's black hole, for comparison, in the same swings
}

export function trialRinging(massSolar: number, spin: number): TrialRinging {
  const t = ringing(massSolar, spin)
  const real = ringing(GW250114_RINGDOWN.finalMassSolar, GW250114_RINGDOWN.finalSpin)
  const wave: TrialWavePoint[] = []
  const realEnvelope: { swings: number; envelope: number }[] = []
  const n = 361
  for (let i = 0; i < n; i++) {
    const swings = (TRIAL_WAVE_SWINGS * i) / (n - 1)
    const envelope = Math.exp((-Math.PI * swings) / t.quality)
    wave.push({ swings, value: envelope * Math.cos(2 * Math.PI * swings), envelope })
    realEnvelope.push({ swings, envelope: Math.exp((-Math.PI * swings) / real.quality) })
  }
  return {
    massSolar,
    spin,
    frequencyHz: t.frequencyHz,
    periodSeconds: 1 / t.frequencyHz,
    dampingTimeMs: t.dampingTimeMs,
    quality: t.quality,
    swingsToFade: t.swingsToFade,
    pitchOverReal: t.frequencyHz / real.frequencyHz,
    fadeTimeOverReal: t.dampingTimeMs / real.dampingTimeMs,
    pitchPosition: logPosition(t.frequencyHz, MASS_PICTURE_AXES.pitch.min, MASS_PICTURE_AXES.pitch.max),
    realPitchPosition: logPosition(real.frequencyHz, MASS_PICTURE_AXES.pitch.min, MASS_PICTURE_AXES.pitch.max),
    wave,
    realEnvelope,
  }
}

// ---- Part 3: the results tables (the page only displays these numbers) ----

export interface CheckUpRow {
  calculated: number
  measured: number
  low: number | null // the measured value's 90 percent range, where the paper gives one
  high: number | null
  percent: number // how far the measured value is above (positive) or below the calculated one, in percent
  inside: boolean | null // whether the calculated value lies inside the measured range (null where there is no range)
}

export interface CheckUp {
  pitch: CheckUpRow // Hz, at the detectors
  fadeTime: CheckUpRow // ms, at the detectors
  swings: CheckUpRow // calculated Q / pi against the measured fade time times the measured pitch (a number made from two measured numbers, with no range of its own)
  redshiftStretch: number // 1 + z
}

export function checkUp(): CheckUp {
  const c = compareWithMeasured()
  const rows = comparisonRows()
  const g = gw250114Ringing()
  const measuredSwings = (GW250114_RINGDOWN.measuredDampingTimeMs / 1000) * GW250114_RINGDOWN.measuredFrequencyHz
  return {
    pitch: { calculated: c.calculatedFrequencyHz, measured: c.measuredFrequencyHz, low: rows[0].low, high: rows[0].high, percent: c.frequencyPercent, inside: c.frequencyInsideRange },
    fadeTime: { calculated: c.calculatedDampingTimeMs, measured: c.measuredDampingTimeMs, low: rows[1].low, high: rows[1].high, percent: c.dampingPercent, inside: c.dampingInsideRange },
    swings: { calculated: g.swingsToFade, measured: measuredSwings, low: null, high: null, percent: (measuredSwings / g.swingsToFade - 1) * 100, inside: null },
    redshiftStretch: 1 + GW250114_RINGDOWN.redshift,
  }
}

export interface SpinRow {
  spin: number
  frequencyHz: number // the black hole's own frame, for the mass of the black hole GW250114 made
  swingsToFade: number
  pitchOverReal: number
}

// Table 2: the five spin choices, at the mass of the black hole GW250114 made.
export function spinTable(): SpinRow[] {
  return SPIN_CHOICES.map((spin) => {
    const t = trialRinging(GW250114_RINGDOWN.finalMassSolar, spin)
    return { spin, frequencyHz: t.frequencyHz, swingsToFade: t.swingsToFade, pitchOverReal: t.pitchOverReal }
  })
}

export interface MassRow {
  massSolar: number
  label: string
  frequencyHz: number
  periodSeconds: number
  dampingTimeMs: number
  pitchOverReal: number
}

// Table 3: the five mass choices, at the spin of the black hole GW250114 made.
export function massTable(): MassRow[] {
  return MASS_CHOICES_SOLAR.map((massSolar) => {
    const t = trialRinging(massSolar, GW250114_RINGDOWN.finalSpin)
    return { massSolar, label: MASS_POINT_LABELS[massSolar], frequencyHz: t.frequencyHz, periodSeconds: t.periodSeconds, dampingTimeMs: t.dampingTimeMs, pitchOverReal: t.pitchOverReal }
  })
}

// ---- The tutor: marking the two predictions (only in the tutor's explanation) and the worked numbers ----

export interface PitchGuessResult {
  choice: PitchChoice
  real: PitchChoice
  matched: boolean
  slowHz: number // the real spin, 0.68 (the black hole's own frame)
  fastHz: number // the imagined faster spin, 0.9
  ratio: number // fast over slow
}

export function pitchGuessResult(choice: PitchChoice): PitchGuessResult {
  const picture = pitchSpinPicture()
  const real = pitchAnswer()
  return { choice, real, matched: choice === real, slowHz: picture.real.frequencyHz, fastHz: picture.faster.frequencyHz, ratio: picture.faster.frequencyHz / picture.real.frequencyHz }
}

export interface SwingsGap {
  choice: SwingsChoice
  realSwings: number
  nearest: SwingsChoice
  matched: boolean
  verdict: 'same' | 'below' | 'above' // the guess against the real number
  times: number // how many times larger the larger of the two is than the smaller
}

export function swingsGuessGap(choice: SwingsChoice): SwingsGap {
  const real = gw250114Ringing().swingsToFade
  const nearest = swingsAnswer()
  const matched = choice === nearest
  return { choice, realSwings: real, nearest, matched, verdict: matched ? 'same' : choice < real ? 'below' : 'above', times: Math.max(choice, real) / Math.min(choice, real) }
}

export interface RingingWorked {
  massSolar: number
  spin: number
  lightCrossingTimeMs: number // G M / c^3: the time light takes to cross a length G M / c^2
  dimensionlessPitch: number // 2 pi f t_M
  swingInLightCrossingTimes: number // 2 pi divided by the above: how many of those times one swing lasts
  frequencyHz: number
  periodMs: number // one swing, in the black hole's own frame
  doubledMassFrequencyHz: number
  doubledMassLightCrossingTimeMs: number
  quality: number
  swingsToFade: number
  detectedFrequencyHz: number
  detectedPeriodMs: number
  stretch: number // 1 + z
}

export function ringingWorked(): RingingWorked {
  const m = GW250114_RINGDOWN.finalMassSolar
  const chi = GW250114_RINGDOWN.finalSpin
  const r = ringing(m, chi)
  const d = dimensionlessPitch(chi)
  return {
    massSolar: m,
    spin: chi,
    lightCrossingTimeMs: lightCrossingTimeS(m) * 1000,
    dimensionlessPitch: d,
    swingInLightCrossingTimes: (2 * Math.PI) / d,
    frequencyHz: r.frequencyHz,
    periodMs: 1000 / r.frequencyHz,
    doubledMassFrequencyHz: ringing(2 * m, chi).frequencyHz,
    doubledMassLightCrossingTimeMs: lightCrossingTimeS(2 * m) * 1000,
    quality: r.quality,
    swingsToFade: r.swingsToFade,
    detectedFrequencyHz: detectedFrequencyHz(r.frequencyHz),
    detectedPeriodMs: 1000 / detectedFrequencyHz(r.frequencyHz),
    stretch: 1 + GW250114_RINGDOWN.redshift,
  }
}
