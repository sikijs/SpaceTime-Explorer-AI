// Evidence and Imagination, Experiment 6: What was the early universe's recipe? How many neutrons were left when helium could first form, how much helium that makes (by mass and by number of atoms),
// and the published tests of the light elements (helium, deuterium, lithium-7).
// Physics only: no React or browser code (CLAUDE.md §9). It imports nothing.
// Units: energies in MeV, times in seconds. A TEACHING MODEL, not a calculation of Big Bang nucleosynthesis: no reaction network, no weak-reaction rates, no dependence on the density of ordinary matter,
// no neutrino count (the specification's "Not modelled" list).
// THE MODEL (specification, "Physics Model"):
//   x0 = exp(-Q / kT_f)                      neutrons per proton at freeze-out (a Boltzmann "weight" factor; stated from memory, NOT read from a source)
//   x  = x0 * exp(-(t - t0) / tau)           neutrons per proton after a wait t, with t0 the freeze-out time
//   Y  = 2 x / (1 + x)                       helium share by mass (every neutron pairs with a proton into helium-4: 2 neutrons + 2 protons; counting, not a source)
//   atoms of helium per 100 hydrogen atoms = 100 * (Y / 4) / (1 - Y)   (helium-4 weighs 4, hydrogen 1)
// THE FREEZE-OUT TEMPERATURE IS A TUNED INPUT. No source read gives it (specification Open item a, Decision 3 default (a)): the value below was chosen to give the right order of magnitude of helium and is NOT a
// prediction. The page must say so wherever the model's helium share appears.

// ---- Constants ----
// Q = m_n - m_p and the neutron lifetime: SUMMARY-ONLY readings of arXiv:2603.22414's fiducial values (specification Sources); to be checked against the PDG review.
export const NEUTRON_PROTON_MASS_DIFFERENCE_MEV = 1.29333
export const NEUTRON_LIFETIME_S = 878.4
// The two kinds of neutron-lifetime experiment disagree, as NIST's page "Toward New Precision in Measuring the Neutron Lifetime" (3 Feb 2014, updated 11 Mar 2025, read 2026-11-01) quotes: the in-beam result after its
// improvement, 887.7 s, and the bottle result of Serebrov, 878.5 s (the page gives no total uncertainty for 887.7). The model uses 878.4 s, above. The introduction says the two disagree by about 9 seconds.
export const NEUTRON_LIFETIME_IN_BEAM_S = 887.7
export const NEUTRON_LIFETIME_BOTTLE_S = 878.5
// TUNED INPUT, not sourced (see above). 0.72 MeV is Claude's choice; Berkeley Lab (Silk) says only "about 1 MeV".
export const FREEZE_OUT_KT_MEV = 0.72
// "About 1 second has elapsed" at freeze-out (Berkeley Lab, Silk's page, read 2026-11-01).
export const FREEZE_OUT_TIME_S = 1
// "After only about three minutes" (the same page): the real wait before deuterium can hold neutrons.
export const REAL_WAIT_S = 180
// Helium-4 weighs about 4 times a hydrogen atom (mass numbers 4 and 1).
export const HELIUM_TO_HYDROGEN_WEIGHT = 4

// ---- Controls (trial values) ----
export const WAIT_CHOICES_S = [60, 180, 300, 600, 1200] as const
export type WaitChoice = (typeof WAIT_CHOICES_S)[number]
// The trial mass difference as a multiple of the real one: half, real, double (the specification's control 2).
export const MASS_DIFFERENCE_CHOICES = [
  { id: 'half', label: 'Half the real difference', factor: 0.5 },
  { id: 'real', label: 'The real difference', factor: 1 },
  { id: 'double', label: 'Twice the real difference', factor: 2 },
] as const
export type MassDifferenceId = (typeof MASS_DIFFERENCE_CHOICES)[number]['id']

export interface RecipeSettings {
  waitS: number
  massDifferenceFactor: number
}
export const REAL_SETTINGS: RecipeSettings = { waitS: REAL_WAIT_S, massDifferenceFactor: 1 }

// ---- The model ----
// Neutrons per proton at freeze-out, for a mass difference Q and a temperature kT (both MeV).
export function neutronsPerProtonAtFreezeOut(
  massDifferenceMeV: number = NEUTRON_PROTON_MASS_DIFFERENCE_MEV,
  freezeOutKtMeV: number = FREEZE_OUT_KT_MEV,
): number {
  if (!Number.isFinite(massDifferenceMeV) || massDifferenceMeV < 0) throw new RangeError('The mass difference must not be negative.')
  if (!Number.isFinite(freezeOutKtMeV) || freezeOutKtMeV <= 0) throw new RangeError('The temperature must be above zero.')
  return Math.exp(-massDifferenceMeV / freezeOutKtMeV)
}
// Neutrons per proton after waiting until time t (seconds from the start): free neutrons decay with the mean life tau.
export function neutronsPerProtonAfterWait(
  startNeutronsPerProton: number,
  waitS: number,
  freezeOutTimeS: number = FREEZE_OUT_TIME_S,
  lifetimeS: number = NEUTRON_LIFETIME_S,
): number {
  if (!Number.isFinite(startNeutronsPerProton) || startNeutronsPerProton < 0) throw new RangeError('The neutron share must not be negative.')
  if (!Number.isFinite(waitS) || waitS < freezeOutTimeS) throw new RangeError('The wait must not end before freeze-out.')
  if (!Number.isFinite(lifetimeS) || lifetimeS <= 0) throw new RangeError('The lifetime must be above zero.')
  return startNeutronsPerProton * Math.exp(-(waitS - freezeOutTimeS) / lifetimeS)
}
// Helium share by mass: Y = 2x / (1 + x).
export function heliumMassShare(neutronsPerProton: number): number {
  if (!Number.isFinite(neutronsPerProton) || neutronsPerProton < 0) throw new RangeError('The neutron share must not be negative.')
  return (2 * neutronsPerProton) / (1 + neutronsPerProton)
}
// Helium atoms for every 100 hydrogen atoms, from a helium share by mass.
export function heliumAtomsPerHundredHydrogen(massShare: number): number {
  if (!Number.isFinite(massShare) || massShare < 0 || massShare >= 1) throw new RangeError('The helium share by mass must be from 0 up to (not including) 1.')
  return (100 * (massShare / HELIUM_TO_HYDROGEN_WEIGHT)) / (1 - massShare)
}

export interface Recipe {
  massDifferenceMeV: number
  freezeOutNeutronsPerProton: number
  neutronsPerProton: number
  neutronsPerProtonAsOneIn: number // 1 / neutronsPerProton, for "1 in 7.4"
  neutronsLeftFraction: number // share of the freeze-out neutrons still there after the wait
  heliumMassShare: number
  hydrogenMassShare: number
  heliumAtomsPerHundredHydrogen: number
}
export function recipe(settings: RecipeSettings = REAL_SETTINGS): Recipe {
  const massDifferenceMeV = NEUTRON_PROTON_MASS_DIFFERENCE_MEV * settings.massDifferenceFactor
  const x0 = neutronsPerProtonAtFreezeOut(massDifferenceMeV)
  const x = neutronsPerProtonAfterWait(x0, settings.waitS)
  const y = heliumMassShare(x)
  return {
    massDifferenceMeV,
    freezeOutNeutronsPerProton: x0,
    neutronsPerProton: x,
    neutronsPerProtonAsOneIn: 1 / x,
    neutronsLeftFraction: x0 > 0 ? x / x0 : 0,
    heliumMassShare: y,
    hydrogenMassShare: 1 - y,
    heliumAtomsPerHundredHydrogen: heliumAtomsPerHundredHydrogen(y),
  }
}

// ---- Published figures (stored as quoted, not recomputed) ----
// Burns, arXiv:2603.22414v2 (31 Jul 2026). The helium figures were read verbatim; the others come from a tool summary of the paper and are NOT verified (specification Sources, Open item b).
export interface Measurement {
  value: number
  giveOrTake: number
}
export const HELIUM_OBSERVED_LBT: Measurement = { value: 0.2458, giveOrTake: 0.0013 } // verbatim
// The EMPRESS collaboration's value: Yanagisawa et al., "EMPRESS. XV. A New Determination of the Primordial Helium Abundance Suggesting a Moderately Low Y_P Value", arXiv:2506.24050. The abstracts of versions 2 (3 Apr 2026) and 3
// (30 Jul 2026) give Y_P = 0.2402 (+0.0040, -0.0040); version 1 (30 Jun 2025) gave 0.2387 (+0.0036, -0.0031), which is the number in the LBT paper's Table 5 (the LBT paper, of 29 Jan 2026, predates version 2). Burns (arXiv:2603.22414)
// quotes 0.2402 +/- 0.0040. Checked against the abstract pages on 2026-11-01 (read through the fetch agent); the paper's body was not read. Matsumoto et al. 2022 (EMPRESS VIII, arXiv:2203.09617) gives 0.2370 (+0.0034, -0.0033), an earlier paper.
export const HELIUM_OBSERVED_EMPRESS: Measurement = { value: 0.2402, giveOrTake: 0.004 }
export const HELIUM_EMPRESS_VERSION_ONE = { value: 0.2387, plus: 0.0036, minus: 0.0031 } // the same paper's first version (30 Jun 2025), as its abstract gave it
export const HELIUM_THEORY: Measurement = { value: 0.2467, giveOrTake: 0.0002 } // verbatim
export const DEUTERIUM_OBSERVED_E5: Measurement = { value: 2.508, giveOrTake: 0.029 } // D/H in units of 1e-5; SUMMARY ONLY
export const DEUTERIUM_THEORY_E5: Measurement = { value: 2.445, giveOrTake: 0.038 } // PRIMAT; SUMMARY ONLY
export const LITHIUM_OBSERVED_E10: Measurement = { value: 1.45, giveOrTake: 0.25 } // 7Li/H in units of 1e-10; SUMMARY ONLY
export const LITHIUM_THEORY_E10: Measurement = { value: 5.523, giveOrTake: 0.196 } // PRIMAT; SUMMARY ONLY
export const BARYON_DENSITY_OMEGA_B_H2 = 0.02237 // the paper's fiducial value; SUMMARY ONLY
// Coc, Uzan and Vangioni, arXiv:1307.6955 (2013), read in full text: its pair for lithium-7, in units of 1e-10.
export const LITHIUM_THEORY_E10_2013: Measurement = { value: 4.89, giveOrTake: 0.4 } // +0.41 / -0.39 in the paper, 0.40 used
export const LITHIUM_OBSERVED_E10_2013: Measurement = { value: 1.58, giveOrTake: 0.31 }

// ---- Comparing ----
export type Comparison = 'the same' | 'more' | 'less'
export const COMPARE_RELATIVE_TOLERANCE = 1e-9
export function compare(value: number, reference: number): Comparison {
  const scale = Math.max(Math.abs(value), Math.abs(reference), Number.MIN_VALUE)
  if (Math.abs(value - reference) <= COMPARE_RELATIVE_TOLERANCE * scale) return 'the same'
  return value > reference ? 'more' : 'less'
}
// Is a value inside a published give-or-take of a reference (the reference's own give-or-take, taken alone)?
export function insideGiveOrTake(value: number, reference: Measurement): boolean {
  return Math.abs(value - reference.value) <= reference.giveOrTake
}
// Two published values with their give-or-takes: do the ranges overlap (each value's own give-or-take added)?
export function rangesOverlap(a: Measurement, b: Measurement): boolean {
  return Math.abs(a.value - b.value) <= a.giveOrTake + b.giveOrTake
}
// How many times larger the prediction is than the observation (not rounded).
export function predictionOverObservation(prediction: Measurement, observation: Measurement): number {
  return prediction.value / observation.value
}

// ---- The predictions' answers and buttons ----
export const SHARE_ANSWER_CHOICES = [
  { id: 'about-1', label: 'About 1 percent', percent: 1 },
  { id: 'about-10', label: 'About 10 percent', percent: 10 },
  { id: 'about-25', label: 'About 25 percent', percent: 25 },
  { id: 'about-50', label: 'About 50 percent', percent: 50 },
  { id: 'about-75', label: 'About 75 percent', percent: 75 },
] as const
export type ShareAnswerId = (typeof SHARE_ANSWER_CHOICES)[number]['id']
export const ATOM_ANSWER_CHOICES = [
  { id: 'about-1', label: 'About 1', atoms: 1 },
  { id: 'about-8', label: 'About 8', atoms: 8 },
  { id: 'about-25', label: 'About 25', atoms: 25 },
  { id: 'about-50', label: 'About 50', atoms: 50 },
  { id: 'about-100', label: 'About 100', atoms: 100 },
] as const
export type AtomAnswerId = (typeof ATOM_ANSWER_CHOICES)[number]['id']

function nearest<T extends { id: string }>(choices: readonly T[], target: number, position: (c: T) => number): T {
  let best = choices[0]
  for (const c of choices) if (Math.abs(position(c) - target) < Math.abs(position(best) - target)) best = c
  return best
}
// Prediction 1 is a share on a plain percent ruler, so the nearest button is found on a linear scale.
export function shareAnswerIdFor(massShare: number): ShareAnswerId {
  return nearest(SHARE_ANSWER_CHOICES, massShare * 100, (c) => c.percent).id
}
// Prediction 2 spans 1 to 100, so the nearest button is found on a log scale.
export function atomAnswerIdFor(atomsPerHundred: number): AtomAnswerId {
  return nearest(ATOM_ANSWER_CHOICES, Math.log(atomsPerHundred), (c) => Math.log(c.atoms)).id
}
// The real answers: from the OBSERVED helium share (not the tuned model), as the specification says.
export function predictionOneAnswerId(): ShareAnswerId {
  return shareAnswerIdFor(HELIUM_OBSERVED_LBT.value)
}
// Helium atoms per 100 hydrogen atoms from the OBSERVED share (about 8.15), the number the real answer and the guess's comparison use.
export function observedAtomsPerHundredHydrogen(): number {
  return heliumAtomsPerHundredHydrogen(HELIUM_OBSERVED_LBT.value)
}
export function predictionTwoAnswerId(): AtomAnswerId {
  return atomAnswerIdFor(observedAtomsPerHundredHydrogen())
}

// ---- What the pictures draw (Step 4) ----
// The learner's guesses as numbers, for the white marks (CLAUDE.md §14): Prediction 1 as a percent by mass, Prediction 2 as helium atoms per 100 hydrogen atoms.
export function shareGuessPercent(id: string): number {
  const choice = SHARE_ANSWER_CHOICES.find((c) => c.id === id)
  if (!choice) throw new RangeError('Not a Prediction 1 choice.')
  return choice.percent
}
export function atomGuessValue(id: string): number {
  const choice = ATOM_ANSWER_CHOICES.find((c) => c.id === id)
  if (!choice) throw new RangeError('Not a Prediction 2 choice.')
  return choice.atoms
}

// A sample of 200 protons and neutrons, drawn as dots in Pictures 1 and 2. Whole particles, so every count is rounded; the exact shares are in `recipe`.
export const SAMPLE_NUCLEONS = 200
export interface NucleonSample {
  total: number
  neutronsAtFreezeOut: number
  protonsAtFreezeOut: number
  neutronsAfterWait: number
  protonsAfterWait: number
  decayed: number // neutrons that decayed into protons during the wait
  heliumNuclei: number // each holds 2 neutrons and 2 protons; every neutron left is paired
  hydrogenNuclei: number // the protons not in a helium nucleus
  heliumDots: number // 4 per helium nucleus
}
export function nucleonSample(settings: RecipeSettings = REAL_SETTINGS, total: number = SAMPLE_NUCLEONS): NucleonSample {
  const r = recipe(settings)
  const x0 = r.freezeOutNeutronsPerProton
  const x1 = r.neutronsPerProton
  const neutronsAtFreezeOut = Math.round((total * x0) / (1 + x0))
  const neutronsAfterWait = Math.round((total * x1) / (1 + x1))
  const heliumNuclei = Math.round(neutronsAfterWait / 2)
  return {
    total,
    neutronsAtFreezeOut,
    protonsAtFreezeOut: total - neutronsAtFreezeOut,
    neutronsAfterWait,
    protonsAfterWait: total - neutronsAfterWait,
    decayed: neutronsAtFreezeOut - neutronsAfterWait,
    heliumNuclei,
    hydrogenNuclei: total - 4 * heliumNuclei,
    heliumDots: 4 * heliumNuclei,
  }
}

// The wait on a ruler of seconds: freeze-out, the end of the wait, and one neutron lifetime.
export interface Timeline {
  freezeOutS: number
  waitEndS: number
  lifetimeS: number
  waitAsFractionOfLifetime: number
}
export function timeline(settings: RecipeSettings = REAL_SETTINGS): Timeline {
  return {
    freezeOutS: FREEZE_OUT_TIME_S,
    waitEndS: settings.waitS,
    lifetimeS: NEUTRON_LIFETIME_S,
    waitAsFractionOfLifetime: settings.waitS / NEUTRON_LIFETIME_S,
  }
}

// One row of a ruler in Picture 2 or Picture 3: where it sits and its give-or-take (0 when none is quoted).
export type RowKind = 'calculated-here' | 'calculated-by-others' | 'measured'
export interface RulerRow {
  id: string
  kind: RowKind
  value: number
  giveOrTake: number
}
// Picture 2, by mass, in percent. The first row is this page's tuned model.
export function massRows(settings: RecipeSettings = REAL_SETTINGS): RulerRow[] {
  return [
    { id: 'model', kind: 'calculated-here', value: recipe(settings).heliumMassShare * 100, giveOrTake: 0 },
    { id: 'lbt', kind: 'measured', value: HELIUM_OBSERVED_LBT.value * 100, giveOrTake: HELIUM_OBSERVED_LBT.giveOrTake * 100 },
    { id: 'empress', kind: 'measured', value: HELIUM_OBSERVED_EMPRESS.value * 100, giveOrTake: HELIUM_OBSERVED_EMPRESS.giveOrTake * 100 },
    { id: 'theory', kind: 'calculated-by-others', value: HELIUM_THEORY.value * 100, giveOrTake: HELIUM_THEORY.giveOrTake * 100 },
  ]
}
// Picture 2, by number: helium atoms per 100 hydrogen atoms.
export function atomRows(settings: RecipeSettings = REAL_SETTINGS): RulerRow[] {
  return [
    { id: 'model', kind: 'calculated-here', value: recipe(settings).heliumAtomsPerHundredHydrogen, giveOrTake: 0 },
    { id: 'observed', kind: 'measured', value: observedAtomsPerHundredHydrogen(), giveOrTake: 0 },
  ]
}
// Picture 3: each element's published calculation and measurement (the unit's power of ten is in `unit`).
export interface ElementTest {
  id: 'helium' | 'deuterium' | 'lithium'
  unit: string
  theory: Measurement
  observed: Measurement
  otherObserved: Measurement | null
}
export const ELEMENT_TESTS: readonly ElementTest[] = [
  { id: 'helium', unit: 'share by mass', theory: HELIUM_THEORY, observed: HELIUM_OBSERVED_LBT, otherObserved: HELIUM_OBSERVED_EMPRESS },
  { id: 'deuterium', unit: '×10⁻⁵ (deuterium atoms per hydrogen atom)', theory: DEUTERIUM_THEORY_E5, observed: DEUTERIUM_OBSERVED_E5, otherObserved: null },
  { id: 'lithium', unit: '×10⁻¹⁰ (lithium-7 atoms per hydrogen atom)', theory: LITHIUM_THEORY_E10, observed: LITHIUM_OBSERVED_E10, otherObserved: null },
]
// Does a published calculation's give-or-take reach the measurement's? Both give-or-takes added.
export function testOverlap(test: ElementTest): boolean {
  return rangesOverlap(test.theory, test.observed)
}
// The gap between two values, with its sign dropped, and the combined give-or-take.
export function gapBetween(a: Measurement, b: Measurement): { difference: number; combinedGiveOrTake: number } {
  return { difference: Math.abs(a.value - b.value), combinedGiveOrTake: a.giveOrTake + b.giveOrTake }
}

// ---- Part 2, "Now try it yourself" (Step 5) ----
// The trial settings from the two controls. The real settings are the preset.
export const PRESET_WAIT_S: number = REAL_WAIT_S
export const PRESET_MASS_DIFFERENCE_ID: MassDifferenceId = 'real'
export function settingsFromChoices(waitS: number, massDifferenceId: MassDifferenceId): RecipeSettings {
  const choice = MASS_DIFFERENCE_CHOICES.find((c) => c.id === massDifferenceId)
  if (!choice) throw new RangeError('Not a mass-difference choice.')
  if (!(WAIT_CHOICES_S as readonly number[]).includes(waitS)) throw new RangeError('Not a wait choice.')
  return { waitS, massDifferenceFactor: choice.factor }
}
// What Drawing A draws: the real settings beside the learner's trial settings, and the measured helium (the LBT value) for comparison.
export interface TrialFigures {
  real: Recipe
  trial: Recipe
  trialSettings: RecipeSettings
  measuredHeliumPercent: number
  measuredAtomsPerHundred: number
  trialHeliumPercent: number
  realHeliumPercent: number
  heliumTrialOverReal: number // how many times the real helium share the trial gives
  neutronsTrialOverReal: number // the same for neutrons per proton after the wait
  heliumTrialMinusMeasuredPoints: number // percentage points, trial minus measured
  waitAsFractionOfLifetime: number
}
export function trialFigures(settings: RecipeSettings): TrialFigures {
  const real = recipe(REAL_SETTINGS)
  const trial = recipe(settings)
  const measuredHeliumPercent = HELIUM_OBSERVED_LBT.value * 100
  return {
    real,
    trial,
    trialSettings: settings,
    measuredHeliumPercent,
    measuredAtomsPerHundred: observedAtomsPerHundredHydrogen(),
    trialHeliumPercent: trial.heliumMassShare * 100,
    realHeliumPercent: real.heliumMassShare * 100,
    heliumTrialOverReal: trial.heliumMassShare / real.heliumMassShare,
    neutronsTrialOverReal: trial.neutronsPerProton / real.neutronsPerProton,
    heliumTrialMinusMeasuredPoints: trial.heliumMassShare * 100 - measuredHeliumPercent,
    waitAsFractionOfLifetime: settings.waitS / NEUTRON_LIFETIME_S,
  }
}
// The ends of Drawing A's rulers. Every trial setting must fall inside them (tested).
export const TRIAL_AXIS_MAX_NEUTRONS_PER_PROTON = 0.45
export const TRIAL_AXIS_MIN_ATOMS = 0.2
export const TRIAL_AXIS_MAX_ATOMS = 140

// ---- Part 3, the results (Step 6) ----
// A published calculation beside a measurement: "the same" only when their give-or-takes added reach each other (the ranges overlap); otherwise "more" or "less" for the measurement. No other cut-off is used.
export interface PairReading {
  calculation: Measurement
  found: Measurement
  reading: Comparison
  difference: number
  combinedGiveOrTake: number
  overlap: boolean
}
export function pairReading(calculation: Measurement, found: Measurement): PairReading {
  const overlap = rangesOverlap(calculation, found)
  const { difference, combinedGiveOrTake } = gapBetween(calculation, found)
  const reading: Comparison = overlap ? 'the same' : found.value > calculation.value ? 'more' : 'less'
  return { calculation, found, reading, difference, combinedGiveOrTake, overlap }
}
// This page's own number beside a measurement: "the same" only when it is inside the measurement's give-or-take.
export interface OwnReading {
  value: number
  measured: Measurement
  reading: Comparison
  difference: number
}
export function ownReading(value: number, measured: Measurement): OwnReading {
  const inside = insideGiveOrTake(value, measured)
  return { value, measured, reading: inside ? 'the same' : value > measured.value ? 'more' : 'less', difference: Math.abs(value - measured.value) }
}

export interface ResultsCheckUp {
  helium: PairReading // percent by mass: the published calculation against the LBT value
  heliumEmpress: PairReading // the same against the EMPRESS value, as quoted
  deuterium: PairReading
  lithium: PairReading
  lithiumRatio: number
  pageHelium: OwnReading // this page's helium percent against the LBT value
  pageAtoms: OwnReading // this page's atoms per 100 hydrogen against the count from the LBT share (the measured count has no give-or-take of its own)
  pageRecipe: Recipe
}
const percentOf = (m: Measurement): Measurement => ({ value: m.value * 100, giveOrTake: m.giveOrTake * 100 })
export function resultsCheckUp(settings: RecipeSettings = REAL_SETTINGS): ResultsCheckUp {
  const r = recipe(settings)
  return {
    helium: pairReading(percentOf(HELIUM_THEORY), percentOf(HELIUM_OBSERVED_LBT)),
    heliumEmpress: pairReading(percentOf(HELIUM_THEORY), percentOf(HELIUM_OBSERVED_EMPRESS)),
    deuterium: pairReading(DEUTERIUM_THEORY_E5, DEUTERIUM_OBSERVED_E5),
    lithium: pairReading(LITHIUM_THEORY_E10, LITHIUM_OBSERVED_E10),
    lithiumRatio: predictionOverObservation(LITHIUM_THEORY_E10, LITHIUM_OBSERVED_E10),
    pageHelium: ownReading(r.heliumMassShare * 100, percentOf(HELIUM_OBSERVED_LBT)),
    pageAtoms: ownReading(r.heliumAtomsPerHundredHydrogen, { value: observedAtomsPerHundredHydrogen(), giveOrTake: 0 }),
    pageRecipe: r,
  }
}

// The page's own calculation, step by step (Table 2).
export interface StepsTable {
  massDifferenceMeV: number
  freezeOutKtMeV: number
  freezeOutNeutronsPerProton: number
  freezeOutOneIn: number
  waitS: number
  decaySeconds: number
  lifetimeS: number
  leftFraction: number
  neutronsPerProton: number
  oneIn: number
  heliumShare: number
  hydrogenShare: number
  atomsPerHundred: number
}
export function stepsTable(settings: RecipeSettings = REAL_SETTINGS): StepsTable {
  const r = recipe(settings)
  return {
    massDifferenceMeV: r.massDifferenceMeV,
    freezeOutKtMeV: FREEZE_OUT_KT_MEV,
    freezeOutNeutronsPerProton: r.freezeOutNeutronsPerProton,
    freezeOutOneIn: 1 / r.freezeOutNeutronsPerProton,
    waitS: settings.waitS,
    decaySeconds: settings.waitS - FREEZE_OUT_TIME_S,
    lifetimeS: NEUTRON_LIFETIME_S,
    leftFraction: r.neutronsLeftFraction,
    neutronsPerProton: r.neutronsPerProton,
    oneIn: r.neutronsPerProtonAsOneIn,
    heliumShare: r.heliumMassShare,
    hydrogenShare: r.hydrogenMassShare,
    atomsPerHundred: r.heliumAtomsPerHundredHydrogen,
  }
}

// How sure each published number is (Table 3): the give-or-take as a percent of the value, and how the lithium gap compares with its give-or-takes.
export interface CertaintyRow {
  id: string
  kind: RowKind
  value: number
  giveOrTake: number
  percentOfValue: number
}
export function certaintyRows(): CertaintyRow[] {
  const make = (id: string, kind: RowKind, m: Measurement): CertaintyRow => ({ id, kind, value: m.value, giveOrTake: m.giveOrTake, percentOfValue: (m.giveOrTake / m.value) * 100 })
  return [
    make('helium-lbt', 'measured', percentOf(HELIUM_OBSERVED_LBT)),
    make('helium-empress', 'measured', percentOf(HELIUM_OBSERVED_EMPRESS)),
    make('helium-theory', 'calculated-by-others', percentOf(HELIUM_THEORY)),
    make('deuterium-observed', 'measured', DEUTERIUM_OBSERVED_E5),
    make('deuterium-theory', 'calculated-by-others', DEUTERIUM_THEORY_E5),
    make('lithium-observed', 'measured', LITHIUM_OBSERVED_E10),
    make('lithium-theory', 'calculated-by-others', LITHIUM_THEORY_E10),
  ]
}
export function lithiumGapOverGiveOrTake(): number {
  const g = gapBetween(LITHIUM_THEORY_E10, LITHIUM_OBSERVED_E10)
  return g.difference / g.combinedGiveOrTake
}

// How sensitive the page's helium share is to the chosen freeze-out temperature (the page's weakest link): the share, by mass, for another temperature at the given settings.
export function heliumShareForTemperature(freezeOutKtMeV: number, settings: RecipeSettings = REAL_SETTINGS): number {
  const massDifferenceMeV = NEUTRON_PROTON_MASS_DIFFERENCE_MEV * settings.massDifferenceFactor
  const x0 = neutronsPerProtonAtFreezeOut(massDifferenceMeV, freezeOutKtMeV)
  return heliumMassShare(neutronsPerProtonAfterWait(x0, settings.waitS))
}
export const SENSITIVITY_TEMPERATURES_MEV = [0.65, FREEZE_OUT_KT_MEV, 0.8] as const

// ---- The tutor (Part 4): the predictions are marked only in its explanation (CLAUDE.md §12, §13) ----
// "matched" means the learner's button is the one nearest the module's answer.
export function shareGuessResult(id: string): 'matched' | 'not matched' {
  shareGuessPercent(id)
  return id === predictionOneAnswerId() ? 'matched' : 'not matched'
}
export function atomGuessResult(id: string): 'matched' | 'not matched' {
  atomGuessValue(id)
  return id === predictionTwoAnswerId() ? 'matched' : 'not matched'
}

// Every number the tutor's explanation quotes, so that none is typed by hand (CLAUDE.md §9).
export const TUTOR_LONG_WAIT_S = 1200
export const TUTOR_MIDDLE_WAIT_S = 600
export function tutorFigures() {
  const real = recipe(REAL_SETTINGS)
  const sample = nucleonSample()
  const check = resultsCheckUp()
  const long = recipe({ waitS: TUTOR_LONG_WAIT_S, massDifferenceFactor: 1 })
  const middle = recipe({ waitS: TUTOR_MIDDLE_WAIT_S, massDifferenceFactor: 1 })
  const hydrogenPercentLbt = 100 - HELIUM_OBSERVED_LBT.value * 100
  return {
    real,
    sample,
    check,
    massDifferenceMeV: NEUTRON_PROTON_MASS_DIFFERENCE_MEV,
    freezeOutKtMeV: FREEZE_OUT_KT_MEV,
    massOverTemperature: NEUTRON_PROTON_MASS_DIFFERENCE_MEV / FREEZE_OUT_KT_MEV,
    lbtPercent: HELIUM_OBSERVED_LBT.value * 100,
    lbtGiveOrTakePoints: HELIUM_OBSERVED_LBT.giveOrTake * 100,
    theoryPercent: HELIUM_THEORY.value * 100,
    hydrogenPercentLbt,
    atomsFromMeasured: observedAtomsPerHundredHydrogen(),
    waitS: REAL_WAIT_S,
    decaySeconds: REAL_WAIT_S - FREEZE_OUT_TIME_S,
    lifetimeS: NEUTRON_LIFETIME_S,
    longWaitS: TUTOR_LONG_WAIT_S,
    longHeliumPercent: long.heliumMassShare * 100,
    longNeutronsLeftFraction: long.neutronsLeftFraction,
    middleWaitS: TUTOR_MIDDLE_WAIT_S,
    middleHeliumPercent: middle.heliumMassShare * 100,
    lithiumRatio: check.lithiumRatio,
    lithiumGapTimes: lithiumGapOverGiveOrTake(),
    sensitivity: SENSITIVITY_TEMPERATURES_MEV.map((kt) => ({ kt, heliumPercent: heliumShareForTemperature(kt) * 100 })),
  }
}
