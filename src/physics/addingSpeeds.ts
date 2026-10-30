// Evidence and Imagination, Experiment 3: Can speeds simply be added? The rule for combining two speeds along one line (special relativity), the everyday sum beside it, light in moving
// water (Fizeau 1851, von Laue 1907) and the CERN test of 1964 (gamma rays from pions moving at 0.99975 c). Physics only: no React or browser code (CLAUDE.md §9). It imports nothing.
// Units: speeds as a fraction of c (c = 1) unless a name says otherwise. One dimension, one direction (the specification's Decision 4); no derivation and no rapidity.
// Sources and what is unchecked (specification, "Sources"): the 1964 figures are from machine-read text of a scanned paper and must be checked against its page images; the refractive index
// of water and Fizeau's measured coefficient have no source read yet; the rule itself is checked only against a summary, to be checked at a textbook.

function checkSpeed(x: number, what: string): void {
  if (!Number.isFinite(x) || x < 0 || x > 1) throw new RangeError(`${what} must satisfy 0 <= speed <= c.`)
}

// ---- The rule and the everyday sum ----
// A ship moves at a (a fraction of c) relative to the lab and fires a probe forward at b relative to the ship: the lab sees (a + b) / (1 + a b).
export function combineSpeeds(a: number, b: number): number {
  checkSpeed(a, 'The ship speed')
  checkSpeed(b, 'The probe speed')
  return (a + b) / (1 + a * b)
}
// The everyday sum, which can pass 1 (the page draws it as a bar beyond the wall at c).
export function everydaySum(a: number, b: number): number {
  checkSpeed(a, 'The ship speed')
  checkSpeed(b, 'The probe speed')
  return a + b
}
// How much the everyday sum overshoots the rule's result.
export function gapFromEveryday(a: number, b: number): number {
  return everydaySum(a, b) - combineSpeeds(a, b)
}
// The speed of the probe relative to the ship, from the lab's speed for the ship (a) and for the probe (u): (u - a) / (1 - u a). It undoes `combineSpeeds`.
export function relativeSpeed(u: number, a: number): number {
  checkSpeed(u, 'The probe speed in the lab')
  checkSpeed(a, 'The ship speed')
  if (u === 1 && a === 1) throw new RangeError('The relative speed of two things both at c is not defined here.')
  return (u - a) / (1 - u * a)
}

// ---- The scenario of Prediction 1 (the controls change these as trial values) ----
export const PRESET_SHIP_SPEED = 0.5
export const PRESET_PROBE_SPEED = 0.5
export const SHIP_SPEED_CHOICES: readonly number[] = [0.1, 0.5, 0.9, 0.99]
export const PROBE_SPEED_CHOICES: readonly number[] = [0.1, 0.5, 0.9, 1]

// ---- Light in moving water (Fizeau 1851; von Laue 1907) ----
// Light travels at 1 / n (in units of c) in still water of refractive index n. In water moving at v (a fraction of c) in the same direction as the light, the rule gives (1/n + v) / (1 + v/n).
export function lightSpeedInMovingMedium(n: number, v: number): number {
  if (!Number.isFinite(n) || n < 1) throw new RangeError('The refractive index must be at least 1.')
  checkSpeed(v, 'The medium speed')
  return combineSpeeds(1 / n, v)
}
// The drag coefficient for small v: 1 - 1/n^2 (Fresnel's coefficient, which the rule reproduces). The everyday sum would give 1.
export function fresnelDragCoefficient(n: number): number {
  if (!Number.isFinite(n) || n < 1) throw new RangeError('The refractive index must be at least 1.')
  return 1 - 1 / (n * n)
}
// The coefficient the exact rule gives at a given v: (speed in moving water - speed in still water) / v. It approaches the Fresnel coefficient as v shrinks.
export function exactDragCoefficient(n: number, v: number): number {
  if (!Number.isFinite(v) || v <= 0) throw new RangeError('The medium speed must be above zero.')
  return (lightSpeedInMovingMedium(n, v) - 1 / n) / v
}
export const WATER_REFRACTIVE_INDEX = 1.33 // NOT YET SOURCED (specification, Sources): to be found at an official page before the page states it.

// ---- The CERN test of 1964 (Alväger, Farley, Kjellman and Wallin) ----
// Neutral pions of energy above 6 GeV, moving at 0.99975 c "according to special relativity", decayed into gamma rays; the gamma rays' speed was timed over 31.450 m.
// Figures from machine-read text of a scanned PDF: TO BE CHECKED against the page images.
export const PION_SOURCE_SPEED = 0.99975
export const LIGHT_SPEED_CM_PER_S = 2.9979e10
export const MEASURED_GAMMA_SPEED_CM_PER_S = 2.9977e10
export const MEASURED_GAMMA_SPEED_GIVE_OR_TAKE_CM_PER_S = 0.0004e10
// The paper's own k in c' = c + k v: (-3 +/- 13) x 10^-5. Quoted as the paper gives it (a value worked out from the rounded speeds differs: specification, Open item c).
export const PAPER_K = -3e-5
export const PAPER_K_GIVE_OR_TAKE = 13e-5

// What the everyday sum would give for a flash fired forward from the pions (1.99975 c) and what the rule gives (exactly c).
export function pionFlashEveryday(): number {
  return everydaySum(PION_SOURCE_SPEED, 1)
}
export function pionFlashRule(): number {
  return combineSpeeds(PION_SOURCE_SPEED, 1)
}
// The measured speed as a share of c, and its give-or-take as a share of c.
export function measuredShareOfLightSpeed(): number {
  return MEASURED_GAMMA_SPEED_CM_PER_S / LIGHT_SPEED_CM_PER_S
}
export function measuredGiveOrTakeShare(): number {
  return MEASURED_GAMMA_SPEED_GIVE_OR_TAKE_CM_PER_S / LIGHT_SPEED_CM_PER_S
}
// True when the measured speed differs from c by no more than its quoted give-or-take.
export function measuredAgreesWithLightSpeed(): boolean {
  return Math.abs(MEASURED_GAMMA_SPEED_CM_PER_S - LIGHT_SPEED_CM_PER_S) <= MEASURED_GAMMA_SPEED_GIVE_OR_TAKE_CM_PER_S
}
// How far the everyday sum is from what was measured, in multiples of the measurement's give-or-take.
export function everydayMissInGiveOrTakes(): number {
  return (pionFlashEveryday() - measuredShareOfLightSpeed()) / measuredGiveOrTakeShare()
}

// ---- Answers to the predictions ----
export function nearestChoice<T>(choices: readonly T[], value: number, valueOf: (c: T) => number): T {
  let best = choices[0]
  for (const c of choices) if (Math.abs(valueOf(c) - value) < Math.abs(valueOf(best) - value)) best = c
  return best
}

// Prediction 1: how fast does the lab see the probe? Five buttons, in units of c.
export const SPEED_ANSWER_CHOICES = [
  { id: 'one', label: '1.0 c', value: 1.0 },
  { id: 'point9', label: '0.9 c', value: 0.9 },
  { id: 'point8', label: '0.8 c', value: 0.8 },
  { id: 'point7', label: '0.7 c', value: 0.7 },
  { id: 'point5', label: '0.5 c', value: 0.5 },
] as const
export type SpeedAnswerId = (typeof SPEED_ANSWER_CHOICES)[number]['id']
export function predictionOneAnswerId(): SpeedAnswerId {
  return nearestChoice(SPEED_ANSWER_CHOICES, combineSpeeds(PRESET_SHIP_SPEED, PRESET_PROBE_SPEED), (c) => c.value).id
}

// Prediction 2: how fast does the lab measure a flash sent forward from a source at 0.99975 c? Four buttons. "Less than c" has no value of its own, so the page draws a marker (the value is for the marker only).
export const FLASH_ANSWER_CHOICES = [
  { id: 'about-2c', label: 'About 2 c', value: 2 },
  { id: 'about-1.5c', label: 'About 1.5 c', value: 1.5 },
  { id: 'about-c', label: 'About c', value: 1 },
  { id: 'less-than-c', label: 'Less than c', value: 0.5 },
] as const
export type FlashAnswerId = (typeof FLASH_ANSWER_CHOICES)[number]['id']
export function predictionTwoAnswerId(): FlashAnswerId {
  return nearestChoice(FLASH_ANSWER_CHOICES, pionFlashRule(), (c) => c.value).id
}

// ---- Marks for the learner's guesses (specification: "Predictions and the Real Results") ----
// Prediction 1: the speed the guess names, in units of c, for the white mark on the lab's speed ruler.
export function speedGuessValue(id: string): number {
  const choice = SPEED_ANSWER_CHOICES.find((c) => c.id === id)
  if (!choice) throw new RangeError(`Unknown speed guess: ${id}`)
  return choice.value
}
// Prediction 2: the speed the guess names, in units of c. "Less than c" has no size of its own, so `markerOnly` is true and the page says its position is only a marker.
export function flashGuess(id: string): { value: number; markerOnly: boolean } {
  const choice = FLASH_ANSWER_CHOICES.find((c) => c.id === id)
  if (!choice) throw new RangeError(`Unknown flash guess: ${id}`)
  return { value: choice.value, markerOnly: id === 'less-than-c' }
}

// ---- The run's pictures ----
export const SPEED_OF_LIGHT_M_PER_S = 299792458
export const TRAIN_WALKER_M_PER_S = 1
export const TRAIN_SPEED_M_PER_S = 20

// Stage 1, the train: the everyday sum, and the amount by which the rule's denominator exceeds 1 (v w / c^2, worked directly so that it is not lost in rounding).
export function trainExample(): { walker: number; train: number; everyday: number; excess: number } {
  return {
    walker: TRAIN_WALKER_M_PER_S,
    train: TRAIN_SPEED_M_PER_S,
    everyday: TRAIN_WALKER_M_PER_S + TRAIN_SPEED_M_PER_S,
    excess: (TRAIN_WALKER_M_PER_S * TRAIN_SPEED_M_PER_S) / (SPEED_OF_LIGHT_M_PER_S * SPEED_OF_LIGHT_M_PER_S),
  }
}

// Picture 1: the train, and the same two speeds near light (the preset ship and probe).
export function pictureOne() {
  const ship = PRESET_SHIP_SPEED
  const probe = PRESET_PROBE_SPEED
  return {
    train: trainExample(),
    ship,
    probe,
    everyday: everydaySum(ship, probe),
    rule: combineSpeeds(ship, probe),
    gap: gapFromEveryday(ship, probe),
  }
}

// Picture 2: light in moving water. Shares are of the water's speed v: the everyday sum adds all of it, the rule adds the Fresnel fraction. The refractive index is NOT YET SOURCED.
export function pictureTwo() {
  const n = WATER_REFRACTIVE_INDEX
  return {
    n,
    stillWaterSpeed: 1 / n,
    everydayShare: 1,
    ruleShare: fresnelDragCoefficient(n),
  }
}

// Picture 3: the 1964 flash, and (stage 5) a flash sent from ships of different speeds.
export function pictureThree() {
  return {
    source: PION_SOURCE_SPEED,
    everyday: pionFlashEveryday(),
    rule: pionFlashRule(),
    measured: measuredShareOfLightSpeed(),
    giveOrTake: measuredGiveOrTakeShare(),
    flashFromShips: SHIP_SPEED_CHOICES.map((ship) => ({ ship, everyday: everydaySum(ship, 1), rule: combineSpeeds(ship, 1) })),
  }
}

// The worked moment of Picture 2: the rule applied to light in still water (1/n, relative to the water) and water moving at v (relative to the lab), step by step. The example water speed
// (10 m/s) is the page's own choice for the example, not Fizeau's. The refractive index is NOT YET SOURCED.
export const EXAMPLE_WATER_M_PER_S = 10
export function fizeauWorked() {
  const n = WATER_REFRACTIVE_INDEX
  const vShare = EXAMPLE_WATER_M_PER_S / SPEED_OF_LIGHT_M_PER_S
  return {
    n,
    nSquared: n * n,
    oneOverNSquared: 1 / (n * n),
    stillWaterSpeed: 1 / n,
    share: fresnelDragCoefficient(n),
    exampleWaterMPerS: EXAMPLE_WATER_M_PER_S,
    exampleWaterShareOfC: vShare,
    exampleDenominatorExcess: vShare / n, // the "v / n" that the denominator 1 + v/n adds to 1
    exampleExactShare: exactDragCoefficient(n, vShare),
  }
}

// The worked moment of Picture 3: the rule with a = the pions' speed and b = 1 (light), and the 1964 figures in kilometres per second. The paper's figures are in centimetres per second
// (machine-read, TO BE CHECKED against the page images); 1 km = 100 000 cm.
export function pionWorked() {
  const a = PION_SOURCE_SPEED
  const top = a + 1
  const bottom = 1 + a * 1
  const cKmS = LIGHT_SPEED_CM_PER_S / 1e5
  return {
    a,
    top,
    bottom,
    result: top / bottom,
    lightKmPerS: cKmS,
    everydayKmPerS: pionFlashEveryday() * cKmS,
    measuredKmPerS: MEASURED_GAMMA_SPEED_CM_PER_S / 1e5,
    giveOrTakeKmPerS: MEASURED_GAMMA_SPEED_GIVE_OR_TAKE_CM_PER_S / 1e5,
    differenceFromLightKmPerS: Math.abs(MEASURED_GAMMA_SPEED_CM_PER_S - LIGHT_SPEED_CM_PER_S) / 1e5,
    giveOrTakePercentOfLight: (MEASURED_GAMMA_SPEED_GIVE_OR_TAKE_CM_PER_S / LIGHT_SPEED_CM_PER_S) * 100,
  }
}

// ---- "Now try it yourself": the trial drawing (Drawing A). Trial values only: the real pictures never change with them. ----
export const TRIAL_DEFAULT_SHIP_SPEED = PRESET_SHIP_SPEED
export const TRIAL_DEFAULT_PROBE_SPEED = PRESET_PROBE_SPEED
export interface TrialPicture {
  ship: number
  probe: number
  top: number // a + b, the everyday sum
  bottom: number // 1 + a b, the correction
  everyday: number
  rule: number
  gap: number // everyday - rule
  rulePercentOfC: number
  everydayPassesC: boolean // the everyday sum is above c
  belowC: number // 1 - rule (0 when the probe is light)
  probeIsLight: boolean
}
export function trialPicture(ship: number, probe: number): TrialPicture {
  const top = everydaySum(ship, probe)
  const bottom = 1 + ship * probe
  const rule = combineSpeeds(ship, probe)
  return {
    ship,
    probe,
    top,
    bottom,
    everyday: top,
    rule,
    gap: top - rule,
    rulePercentOfC: rule * 100,
    everydayPassesC: top > 1,
    belowC: 1 - rule,
    probeIsLight: probe === 1,
  }
}

// ---- The results (Step 6): the check-up, the steps and the table of what has been tested. The interface only sets these out (CLAUDE.md §9). ----
export type Comparison = 'the same' | 'more' | 'less'
// "The same" means within 1 percent of the reference; otherwise more or less. This is a reading aid, not a scientific cut-off.
export function compare(value: number, reference: number, tolerance: number = 0.01): Comparison {
  if (!Number.isFinite(value) || value <= 0) throw new RangeError('The value must be above zero.')
  if (!Number.isFinite(reference) || reference <= 0) throw new RangeError('The reference must be above zero.')
  const ratio = value / reference
  if (Math.abs(ratio - 1) <= tolerance) return 'the same'
  return ratio > 1 ? 'more' : 'less'
}

// Table 1, the check-up. Each calculated number is set beside a reference that is not simply a copy of it: the probe's speed worked back from the rule's result, the rule beside the everyday sum,
// the water's drag beside the everyday full drag (Fizeau's measured number was not read, so it is not compared), the 1964 measurement beside c (with its own give-or-take) and beside the everyday sum.
export function resultsCheckUp() {
  const one = pictureOne()
  const two = pictureTwo()
  const three = pictureThree()
  const workedBack = relativeSpeed(one.rule, one.ship)
  return {
    ship: one.ship,
    probe: one.probe,
    rule: one.rule,
    everyday: one.everyday,
    ruleOverEveryday: one.rule / one.everyday,
    ruleVersusEveryday: compare(one.rule, one.everyday),
    probeWorkedBack: workedBack,
    probeWorkedBackVersusProbe: compare(workedBack, one.probe),
    waterRuleShare: two.ruleShare,
    waterEverydayShare: two.everydayShare,
    waterRuleOverEveryday: two.ruleShare / two.everydayShare,
    waterRuleVersusEveryday: compare(two.ruleShare, two.everydayShare),
    pionMeasured: three.measured,
    pionGiveOrTake: three.giveOrTake,
    pionMeasuredVersusLight: compare(three.measured, 1),
    pionMeasuredAgreesWithLight: measuredAgreesWithLightSpeed(),
    pionEveryday: three.everyday,
    pionMeasuredOverEveryday: three.measured / three.everyday,
    pionMeasuredVersusEveryday: compare(three.measured, three.everyday),
    shipsAllGiveLight: three.flashFromShips.every((r) => compare(r.rule, 1) === 'the same'),
    shipsCount: three.flashFromShips.length,
  }
}

// Table 2, the steps from the two speeds to what the lab measures, for Prediction 1's numbers and for Prediction 2's (the pions and the flash).
export function stepsTable() {
  const row = (a: number, b: number) => {
    const t = trialPicture(a, b)
    return { a, b, top: t.top, bottom: t.bottom, result: t.rule, everyday: t.everyday, gap: t.gap, percentOfC: t.rulePercentOfC }
  }
  return { one: row(PRESET_SHIP_SPEED, PRESET_PROBE_SPEED), two: row(PION_SOURCE_SPEED, 1) }
}

// Table 3, what has been tested. Data, not computed. Both tests were read only through secondary sources or a machine-read scan, and the page says so.
export interface TestedRow {
  idea: string
  what: string
  status: string
}
export const TESTED: readonly TestedRow[] = [
  {
    idea: 'Light in moving water',
    what: 'In 1851 Hippolyte Fizeau found that light is dragged along by only a fraction of the water’s speed, not all of it. Michelson and Morley confirmed this in 1886. Max von Laue showed in 1907 that the rule gives that fraction.',
    status: 'Measured (an old test)',
  },
  {
    idea: 'Light from a source moving at 0.99975 c',
    what: 'In 1964, gamma rays from pions moving at that speed were timed at CERN. The speed came out at (2.9977 ± 0.0004) × 10¹⁰ cm/s, against 2.9979 × 10¹⁰ cm/s for c, so it agrees with c within the give-or-take.',
    status: 'Measured (one old test)',
  },
  {
    idea: 'Other tests of the rule',
    what: 'This page looked at two tests only. Whether the rule has been tested in other ways, for example in particle accelerators, was not checked at a source.',
    status: 'Not checked here',
  },
  {
    idea: 'Speeds that are not along one line',
    what: 'Not covered on this page. Experiment 7 of the Spacetime Geometry group is about how directions change for a fast observer.',
    status: 'Not covered here',
  },
]

// ---- The tutor (Part 4) ----
// The tutor marks each prediction in its explanation only (CLAUDE.md §12, §13). A guess matches when it is the button the real result points to.
export type GuessResult = 'matched' | 'did not match'
export function speedGuessResult(id: string): GuessResult {
  speedGuessValue(id)
  return id === predictionOneAnswerId() ? 'matched' : 'did not match'
}
export function flashGuessResult(id: string): GuessResult {
  flashGuess(id)
  return id === predictionTwoAnswerId() ? 'matched' : 'did not match'
}

// The numbers the tutor's last question and its explanation use: the train's tiny correction, two fast speeds (0.9 and 0.9) worked through, and the biggest pair of the controls (0.99 and 0.99).
export function tutorFigures() {
  const train = trainExample()
  const fast = trialPicture(0.9, 0.9)
  const fastest = trialPicture(0.99, 0.99)
  return {
    trainEveryday: train.everyday,
    trainExcess: train.excess,
    trainChangeMPerS: train.everyday * train.excess,
    fast,
    fastest,
    // 1 + a b - (a + b) = (1 - a)(1 - b): the bottom minus the top, positive whenever both speeds are below c.
    fastBottomMinusTop: fast.bottom - fast.top,
    fastOneMinusAOneMinusB: (1 - fast.ship) * (1 - fast.probe),
    fastestBelowC: fastest.belowC,
    water: pictureTwo(),
  }
}
