// Frontier and Beyond, Experiment 20: black holes that should not exist: the heaviest merger (GW231123)
// See docs/experiments/frontier-and-beyond/20-the-heaviest-merger.md, "Physics Model".
//
// Only arithmetic, and published numbers held as data. Merging two black holes gives the sum of their masses minus the share sent out as
// gravitational waves; the "mass gap" is a range of masses; a simple merger of two equal, non-spinning black holes leaves a remnant spin of
// 0.686 (a published numerical-relativity result, held as data, not derived here). The module does not simulate the stars, the clusters,
// the waveform or the lensing reading, does not model unequal or spinning mergers, and does not choose between the explanations.
// It imports nothing.

// ---- The published data (read 2026-10-26 from LIGO's pages and search summaries of the paper's abstract; the paper itself was not read) ----

export interface Ranged {
  value: number
  plus: number
  minus: number
}

export const GW231123 = {
  // Source-frame masses in Suns, with 90% ranges (a search summary of arXiv:2507.08219's abstract; LIGO's summary says "approximately 137 and 103").
  masses: [
    { value: 137, plus: 22, minus: 17 },
    { value: 103, plus: 20, minus: 52 },
  ] as const satisfies readonly Ranged[],
  // LIGO's science summary: the total is "likely between 190 and 265", the final mass "likely between 182 and 251"; LIGO's detection page: "more than 225".
  totalRangeSolar: [190, 265] as const,
  finalRangeSolar: [182, 251] as const,
  finalBestFitSolar: 225,
  // The spins (the same summary); the upper ends stop at 1.0.
  spins: [
    { value: 0.9, plus: 0.1, minus: 0.19 },
    { value: 0.8, plus: 0.2, minus: 0.51 },
  ] as const satisfies readonly Ranged[],
  // LIGO's science summary: the lighter black hole has an 83 percent chance of lying in the gap.
  lighterInGapPercent: 83,
  redshift: { value: 0.39, plus: 0.27, minus: 0.24 } as Ranged,
  // Not shown on the page until read at the paper (specification, open item a).
  luminosityDistanceGpcRange: [0.7, 4.1] as const,
  signalToNoise: 22.5,
  detected: '23 November 2023',
  announced: '14 July 2025',
}

// The mass gap, in Suns. Theory (LIGO's summary): "approximately 60 and 130". The edge LIGO's 2025 catalogue analysis measured (through search
// summaries): about 44, +5, -4. Both are held; the page says which is which.
export const GAP_THEORY_SOLAR = { low: 60, high: 130 } as const
export const GAP_MEASURED_LOW_SOLAR: Ranged = { value: 44, plus: 5, minus: 4 }

// The share of the merging pair's total mass sent out as gravitational waves. ASSUMED from GW250114's 4.7 percent (Experiment 18); the real
// share for GW231123 is not read (specification, open item b).
export const RADIATED_SHARE = 0.05

// The remnant spin of two equal, non-spinning black holes: about 0.686 (numerical relativity, from a search summary; not read at a paper).
export const SIMPLE_MERGER_SPIN = 0.686

// ---- The learner's trial choices ----

export const MASS_CHOICES_SOLAR = [20, 30, 40, 50] as const
export const ROUND_CHOICES = [1, 2, 3, 4] as const

export const POSSIBLE_CHOICES = ['no', 'yes', 'unsure'] as const
export type PossibleChoice = (typeof POSSIBLE_CHOICES)[number]

// Three below and three above 0.686, as in the specification.
export const SPIN_GUESS_CHOICES = [0.1, 0.3, 0.5, 0.7, 0.9, 0.99] as const
export type SpinGuessChoice = (typeof SPIN_GUESS_CHOICES)[number]

// Floating-point sums such as 40 + 40 - 4 come out with a long tail; the page shows the rounded number.
function round9(x: number): number {
  return Math.round(x * 1e9) / 1e9
}

function checkMass(massSolar: number) {
  if (!Number.isFinite(massSolar) || !(massSolar > 0)) {
    throw new RangeError('The mass must be a positive, finite number of Suns.')
  }
}

function checkShare(share: number) {
  if (!Number.isFinite(share) || share < 0 || share >= 1) {
    throw new RangeError('The radiated share must be at least 0 and below 1.')
  }
}

// ---- The gap ----

export type Zone = 'below' | 'in' | 'above'

// The edges, 60 and 130, belong to the gap (the rule is stated so that it can be tested).
export function zoneOf(massSolar: number): Zone {
  checkMass(massSolar)
  if (massSolar < GAP_THEORY_SOLAR.low) return 'below'
  if (massSolar > GAP_THEORY_SOLAR.high) return 'above'
  return 'in'
}

// ---- Merging and climbing ----

// The mass of the one black hole made from two: the sum minus the share radiated.
export function merge(m1Solar: number, m2Solar: number, share: number = RADIATED_SHARE): number {
  checkMass(m1Solar)
  checkMass(m2Solar)
  checkShare(share)
  return round9((m1Solar + m2Solar) * (1 - share))
}

export interface LadderStep {
  generation: number
  massSolar: number
  zone: Zone
  // How many of the starting black holes have been combined into one black hole of this mass: 2 to the power of the generation.
  originalCount: number
}

// Generation 0 is the starting black hole; each later generation merges two equal black holes of the one before.
export function ladder(startSolar: number, rounds: number, share: number = RADIATED_SHARE): LadderStep[] {
  checkMass(startSolar)
  checkShare(share)
  if (!Number.isInteger(rounds) || rounds < 0) {
    throw new RangeError('The number of rounds must be a whole number, 0 or more.')
  }
  const steps: LadderStep[] = []
  let m = startSolar
  for (let g = 0; g <= rounds; g++) {
    steps.push({ generation: g, massSolar: m, zone: zoneOf(m), originalCount: 2 ** g })
    m = merge(m, m, share)
  }
  return steps
}

// ---- The real event, set beside the arithmetic ----

export function realTotalSolar(): number {
  return round9(GW231123.masses[0].value + GW231123.masses[1].value)
}

// The arithmetic applied to the two published masses (228 Suns at 5 percent).
export function mergedRealSolar(share: number = RADIATED_SHARE): number {
  return merge(GW231123.masses[0].value, GW231123.masses[1].value, share)
}

function inRange(x: number, range: readonly [number, number]): boolean {
  return x >= range[0] && x <= range[1]
}

export interface MergerCheckUp {
  totalSolar: number
  totalRange: readonly [number, number]
  totalInRange: boolean
  mergedSolar: number
  finalRange: readonly [number, number]
  mergedInRange: boolean
  // The Suns the best-fit total (the sum of the two masses) loses to reach the final best fit; a rough subtraction of best-fit values, not a measurement.
  impliedRadiatedSolar: number
  impliedRadiatedShare: number
}

export function mergerCheckUp(): MergerCheckUp {
  const total = realTotalSolar()
  const merged = mergedRealSolar()
  const radiated = round9(total - GW231123.finalBestFitSolar)
  return {
    totalSolar: total,
    totalRange: GW231123.totalRangeSolar,
    totalInRange: inRange(total, GW231123.totalRangeSolar),
    mergedSolar: merged,
    finalRange: GW231123.finalRangeSolar,
    mergedInRange: inRange(merged, GW231123.finalRangeSolar),
    impliedRadiatedSolar: radiated,
    impliedRadiatedShare: radiated / total,
  }
}

// ---- The spins ----

export interface SpinGaps {
  simple: number
  measured: readonly [number, number]
  // The measured best fit minus the simple-merger value, for each black hole.
  gaps: readonly [number, number]
}

export function spinGaps(): SpinGaps {
  const [a, b] = GW231123.spins
  return {
    simple: SIMPLE_MERGER_SPIN,
    measured: [a.value, b.value],
    gaps: [round9(a.value - SIMPLE_MERGER_SPIN), round9(b.value - SIMPLE_MERGER_SPIN)],
  }
}

// The lowest and highest spin each measured black hole could have, at the 90 percent range.
export function spinRange(index: 0 | 1): readonly [number, number] {
  const s = GW231123.spins[index]
  return [round9(s.value - s.minus), round9(Math.min(1, s.value + s.plus))]
}

// ---- The trial (what the controls give) ----

export interface Trial {
  startSolar: number
  rounds: number
  steps: LadderStep[]
  finalSolar: number
  finalZone: Zone
  // The first generation whose black hole lies in the gap, or null if the climb never lands in it.
  firstInGapGeneration: number | null
}

export function trial(startSolar: number, rounds: number, share: number = RADIATED_SHARE): Trial {
  const steps = ladder(startSolar, rounds, share)
  const last = steps[steps.length - 1]
  const inGap = steps.find((s) => s.zone === 'in')
  return {
    startSolar,
    rounds,
    steps,
    finalSolar: last.massSolar,
    finalZone: last.zone,
    firstInGapGeneration: inGap ? inGap.generation : null,
  }
}

// ---- The predictions ----

// Can two black holes below the gap merge into one inside it? Shown by an example that is computed, not assumed: two of 40 Suns.
export const POSSIBLE_EXAMPLE_SOLAR = 40

export function possibleAnswer(): PossibleChoice {
  const below = zoneOf(POSSIBLE_EXAMPLE_SOLAR) === 'below'
  const lands = zoneOf(merge(POSSIBLE_EXAMPLE_SOLAR, POSSIBLE_EXAMPLE_SOLAR)) === 'in'
  return below && lands ? 'yes' : 'no'
}

export interface ExampleMerger {
  startSolar: number
  sumSolar: number
  radiatedSolar: number
  resultSolar: number
  share: number
  startZone: Zone
  resultZone: Zone
}

// The worked example drawn on Picture 1 beside the real black holes: two black holes of 40 Suns (imagined for the question) and what merging them gives.
export function exampleMerger(): ExampleMerger {
  const start = POSSIBLE_EXAMPLE_SOLAR
  const sum = round9(start + start)
  const result = merge(start, start)
  return {
    startSolar: start,
    sumSolar: sum,
    radiatedSolar: round9(sum - result),
    resultSolar: result,
    share: RADIATED_SHARE,
    startZone: zoneOf(start),
    resultZone: zoneOf(result),
  }
}

// For drawing the guess in white. A yes or no has no size of its own: -1, 0 or +1 for no, not sure and yes (only a marker).
export function possibleMarker(choice: PossibleChoice): -1 | 0 | 1 {
  return choice === 'no' ? -1 : choice === 'yes' ? 1 : 0
}

// The button whose spin is nearest the simple-merger value.
export function spinAnswer(): SpinGuessChoice {
  let best: SpinGuessChoice = SPIN_GUESS_CHOICES[0]
  for (const c of SPIN_GUESS_CHOICES) {
    if (Math.abs(c - SIMPLE_MERGER_SPIN) < Math.abs(best - SIMPLE_MERGER_SPIN)) best = c
  }
  return best
}

// The spin a guess stands for, drawn as a white mark on the spin scale: the guess itself.
export function guessSpin(choice: SpinGuessChoice): number {
  return choice
}

export interface SpinGuessGap {
  guess: number
  // The guess minus the simple-merger value (negative: slower). A number only; no verdict (the tutor marks the guess).
  fromSimple: number
}

export function spinGuessGap(choice: SpinGuessChoice): SpinGuessGap {
  return { guess: choice, fromSimple: round9(choice - SIMPLE_MERGER_SPIN) }
}

// ---- The numbers the pictures draw ----

// Picture 1's scale tops out here.
export const MASS_AXIS_MAX_SOLAR = 300

export interface MassMark {
  label: string
  massSolar: number
  lowSolar: number
  highSolar: number
  zone: Zone
}

export interface MassRuler {
  axisMaxSolar: number
  gapTheory: { low: number; high: number }
  gapMeasuredLow: Ranged
  marks: MassMark[]
  lighterInGapPercent: number
}

export function massRuler(): MassRuler {
  const [a, b] = GW231123.masses
  const mark = (label: string, r: Ranged): MassMark => ({
    label,
    massSolar: r.value,
    lowSolar: r.value - r.minus,
    highSolar: r.value + r.plus,
    zone: zoneOf(r.value),
  })
  return {
    axisMaxSolar: MASS_AXIS_MAX_SOLAR,
    gapTheory: { ...GAP_THEORY_SOLAR },
    gapMeasuredLow: GAP_MEASURED_LOW_SOLAR,
    marks: [
      mark('Heavier black hole', a),
      mark('Lighter black hole', b),
      {
        label: 'Black hole after the merger',
        massSolar: GW231123.finalBestFitSolar,
        lowSolar: GW231123.finalRangeSolar[0],
        highSolar: GW231123.finalRangeSolar[1],
        zone: zoneOf(GW231123.finalBestFitSolar),
      },
    ],
    lighterInGapPercent: GW231123.lighterInGapPercent,
  }
}

export interface SpinScale {
  simple: number
  measured: { label: string; value: number; low: number; high: number }[]
}

export function spinScale(): SpinScale {
  return {
    simple: SIMPLE_MERGER_SPIN,
    measured: [
      { label: 'Heavier black hole', value: GW231123.spins[0].value, low: spinRange(0)[0], high: spinRange(0)[1] },
      { label: 'Lighter black hole', value: GW231123.spins[1].value, low: spinRange(1)[0], high: spinRange(1)[1] },
    ],
  }
}
