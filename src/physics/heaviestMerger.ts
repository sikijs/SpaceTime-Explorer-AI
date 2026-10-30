// Cosmic Horizons, Experiment 20: black holes that should not exist: the heaviest merger (GW231123)
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

// Picture 2's scale: spin from 0 (not turning) to 1 (as fast as is possible).
export const SPIN_AXIS_MAX = 1

export interface SpinRow {
  label: string
  value: number
  low: number
  high: number
  // The measured best estimate minus the simple-merger value.
  gapFromSimple: number
  // Whether the 90 percent range reaches down to the simple-merger value.
  rangeIncludesSimple: boolean
}

export interface SpinPicture {
  axisMax: number
  simple: number
  rows: SpinRow[]
}

export function spinPicture(): SpinPicture {
  const labels = ['Heavier black hole', 'Lighter black hole']
  const rows = ([0, 1] as const).map((i): SpinRow => {
    const [low, high] = spinRange(i)
    const value = GW231123.spins[i].value
    return {
      label: labels[i],
      value,
      low,
      high,
      gapFromSimple: round9(value - SIMPLE_MERGER_SPIN),
      rangeIncludesSimple: low <= SIMPLE_MERGER_SPIN && SIMPLE_MERGER_SPIN <= high,
    }
  })
  return { axisMax: SPIN_AXIS_MAX, simple: SIMPLE_MERGER_SPIN, rows }
}

// ---- Drawing A (Part 2): the learner's own climb ----

// The drawing's mass scale goes up in steps of ten, from 10 to 1,000 Suns, so that the smallest starting black hole and the largest result fit together.
export const LOG_AXIS_MIN_SOLAR = 10
export const LOG_AXIS_MAX_SOLAR = 1000

// Where a mass sits on that scale, from 0 (10 Suns) to 1 (1,000 Suns).
export function logPosition(massSolar: number): number {
  checkMass(massSolar)
  return (Math.log10(massSolar) - Math.log10(LOG_AXIS_MIN_SOLAR)) / (Math.log10(LOG_AXIS_MAX_SOLAR) - Math.log10(LOG_AXIS_MIN_SOLAR))
}

export interface ClimbRow extends LadderStep {
  position: number
  // For a round after the first: the two black holes of the round before added together, and the Suns sent out as waves.
  sumSolar: number | null
  radiatedSolar: number | null
}

export interface RealTick {
  label: string
  massSolar: number
  position: number
}

export interface TrialPicture {
  startSolar: number
  rounds: number
  rows: ClimbRow[]
  finalSolar: number
  finalZone: Zone
  startingCount: number
  inGapCount: number
  // The last black hole's mass as a multiple of the heavier real black hole of GW231123.
  finalOverHeavier: number
  gapPositions: { low: number; high: number }
  realTicks: RealTick[]
}

export function trialPicture(startSolar: number, rounds: number, share: number = RADIATED_SHARE): TrialPicture {
  const steps = ladder(startSolar, rounds, share)
  const rows = steps.map((st, i): ClimbRow => {
    const prev = i === 0 ? null : steps[i - 1].massSolar
    const sum = prev === null ? null : round9(2 * prev)
    return { ...st, position: logPosition(st.massSolar), sumSolar: sum, radiatedSolar: sum === null ? null : round9(sum - st.massSolar) }
  })
  const last = steps[steps.length - 1]
  return {
    startSolar,
    rounds,
    rows,
    finalSolar: last.massSolar,
    finalZone: last.zone,
    startingCount: 2 ** rounds,
    inGapCount: steps.filter((st) => st.zone === 'in').length,
    finalOverHeavier: last.massSolar / GW231123.masses[0].value,
    gapPositions: { low: logPosition(GAP_THEORY_SOLAR.low), high: logPosition(GAP_THEORY_SOLAR.high) },
    realTicks: [
      { label: 'lighter black hole', massSolar: GW231123.masses[1].value, position: logPosition(GW231123.masses[1].value) },
      { label: 'heavier black hole', massSolar: GW231123.masses[0].value, position: logPosition(GW231123.masses[0].value) },
      { label: 'the black hole they made', massSolar: GW231123.finalBestFitSolar, position: logPosition(GW231123.finalBestFitSolar) },
    ],
  }
}

// ---- Part 3: the results ----

export interface GapPosition {
  zone: Zone
  // How far above the top of the theory band (130) the mass is, or null if it is not above it.
  aboveBandSolar: number | null
  // How far below the bottom of the theory band (60) the mass is, or null if it is not below it.
  belowBandSolar: number | null
  // The mass minus the lower edge that the 2025 catalogue analysis measured (44); negative if below it.
  overMeasuredEdgeSolar: number
}

export function gapPosition(massSolar: number): GapPosition {
  const zone = zoneOf(massSolar)
  return {
    zone,
    aboveBandSolar: zone === 'above' ? round9(massSolar - GAP_THEORY_SOLAR.high) : null,
    belowBandSolar: zone === 'below' ? round9(GAP_THEORY_SOLAR.low - massSolar) : null,
    overMeasuredEdgeSolar: round9(massSolar - GAP_MEASURED_LOW_SOLAR.value),
  }
}

// Whether a 90 percent range of masses overlaps the theory band at all.
export function rangeOverlapsGap(lowSolar: number, highSolar: number): boolean {
  return lowSolar <= GAP_THEORY_SOLAR.high && highSolar >= GAP_THEORY_SOLAR.low
}

export interface MassGapRow extends MassMark {
  position: GapPosition
  rangeOverlapsBand: boolean
}

export function massGapRows(): MassGapRow[] {
  return massRuler().marks.map((m) => ({ ...m, position: gapPosition(m.massSolar), rangeOverlapsBand: rangeOverlapsGap(m.lowSolar, m.highSolar) }))
}

export interface ShareComparison {
  assumedPercent: number
  impliedPercent: number
  // The implied share minus the assumed one, in percentage points.
  differencePoints: number
}

// The assumed share against the rough subtraction of GW231123's best estimates (240 before, about 225 after).
export function shareComparison(): ShareComparison {
  const c = mergerCheckUp()
  const assumed = RADIATED_SHARE * 100
  const implied = c.impliedRadiatedShare * 100
  return { assumedPercent: assumed, impliedPercent: implied, differencePoints: round9(implied - assumed) }
}

// The published figures behind the proposed explanations, held as data (read 2026-10-26 through abstracts and search summaries, no paper in full).
export const ORIGIN_FIGURES = {
  // arXiv:2510.14363's abstract: "possible (p about 5 percent)" that a binary with spins like these forms in a cluster by hierarchical assembly.
  hierarchicalClusterChancePercent: 5,
  // A search summary of papers on hierarchical assembly: successive mergers of about 6 and about 4 first-generation black holes behind the two.
  firstGenerationCounts: [6, 4] as const,
  // The 2026 lensing analysis (ApJ Letters, 25 August 2026): a lensed reading favoured with a false-alarm probability below 1 percent (about 2.6 sigma or more), and a total mass of 100 to 180 under it.
  lensingFalseAlarmBelowPercent: 1,
  lensingSigmaAtLeast: 2.6,
  lensedTotalRangeSolar: [100, 180] as const,
  // arXiv:2512.17550: two overlapping signals favoured over one, with Bayes factors of about 100 to 10,000.
  overlappingBayesFactorRange: [100, 10_000] as const,
}

// ---- Part 4: the tutor ----

export interface PossibleGuessResult {
  guess: PossibleChoice
  real: PossibleChoice
  matched: boolean
  // True when the learner said "not sure" (neither matched nor not matched).
  unsure: boolean
}

export function possibleGuessResult(choice: PossibleChoice): PossibleGuessResult {
  const real = possibleAnswer()
  return { guess: choice, real, matched: choice === real, unsure: choice === 'unsure' }
}

export interface SpinGuessResult {
  guess: number
  simple: number
  nearest: SpinGuessChoice
  matched: boolean
  // The guess minus the simple-merger value.
  fromSimple: number
}

export function spinGuessResult(choice: SpinGuessChoice): SpinGuessResult {
  const nearest = spinAnswer()
  return { guess: choice, simple: SIMPLE_MERGER_SPIN, nearest, matched: choice === nearest, fromSimple: round9(choice - SIMPLE_MERGER_SPIN) }
}

export interface ClimbFacts {
  // What one merger of two equal black holes multiplies the mass by: 2 x (1 - share).
  stepFactor: number
  // The top of the theory band divided by its bottom.
  bandRatio: number
  // The heaviest mass below the band after which one equal merger could still reach the band: the band's top divided by the step factor.
  jumpOverMassSolar: number
  // True when one step is always shorter than the band is wide, so a climb that starts below the band must land inside it.
  landsInGapAlways: boolean
  // Twenty Suns after three rounds, the example in the tutor, and how many starting black holes it takes.
  twentyAfterThree: number
  twentyStartingCount: number
}

export function climbFacts(share: number = RADIATED_SHARE): ClimbFacts {
  const step = 2 * (1 - share)
  const jump = round9(GAP_THEORY_SOLAR.high / step)
  const lad = ladder(20, 3, share)
  return {
    stepFactor: round9(step),
    bandRatio: GAP_THEORY_SOLAR.high / GAP_THEORY_SOLAR.low,
    jumpOverMassSolar: jump,
    landsInGapAlways: jump > GAP_THEORY_SOLAR.low,
    twentyAfterThree: lad[3].massSolar,
    twentyStartingCount: lad[3].originalCount,
  }
}

// ---- The introduction's comparison of the two pushes that hold a star up ----

export interface PushGrowth {
  temperatureFactor: number
  // Gas pressure grows in step with the temperature.
  gasFactor: number
  // Light (radiation) pressure grows as the fourth power of the temperature.
  lightFactor: number
}

export function pushGrowth(temperatureFactor: number): PushGrowth {
  if (!Number.isFinite(temperatureFactor) || !(temperatureFactor > 0)) {
    throw new RangeError('The temperature factor must be a positive, finite number.')
  }
  return { temperatureFactor, gasFactor: temperatureFactor, lightFactor: temperatureFactor ** 4 }
}
