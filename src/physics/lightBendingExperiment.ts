// Light passing near a mass, but not aimed at it, still has its path bent by ordinary gravity —
// this experiment integrates that flyby with the same inverse-square law and fixed-step
// symplectic (velocity Verlet) integration as orbitExperiment.ts, starting far to one side and
// offset by aimDistance (the "impact parameter"), moving at exactly SPEED_OF_LIGHT. Unlike every
// other experiment in this chapter, it also states — by formula, not derivation — the real,
// general-relativistic deflection angle, which is exactly double the simulated one, because real
// gravity also curves space itself, an effect this ordinary-gravity engine does not model.
import { evaluateBlackHole, SPEED_OF_LIGHT } from './blackHoleExperiment'

export interface LightBendingPoint {
  t: number
  x: number
  y: number
}

export type LightBendingOutcome = 'deflects' | 'falls-in'

export interface LightBendingResult {
  gravitationalParameter: number
  aimDistance: number
  newtonianDeflectionAngle: number
  generalRelativisticDeflectionAngle: number
  outcome: LightBendingOutcome
  trajectory: LightBendingPoint[]
  simulatedDeflectionAngle: number | null
}

const START_X = -15
const FAR_FIELD_X = 15
const TIME_STEP = 0.01
// Safety margin over the straight-line light-crossing time, since a bent path is longer than a
// straight one.
const MAX_TIME_FACTOR = 3

function accelerationAt(
  x: number,
  y: number,
  gravitationalParameter: number
): { ax: number; ay: number } {
  const r = Math.hypot(x, y)
  const factor = -gravitationalParameter / (r * r * r)
  return { ax: factor * x, ay: factor * y }
}

// The standard weak-field (small-angle) deflection formula for a fast particle under ordinary
// gravity — a known, textbook result, not derived here. Valid when aimDistance is large compared
// to the event-horizon scale.
export function runLightBendingExperiment(
  gravitationalParameter: number,
  aimDistance: number
): LightBendingResult {
  if (!(gravitationalParameter > 0)) {
    throw new RangeError('Gravitational parameter must be greater than 0')
  }
  if (!(aimDistance > 0)) {
    throw new RangeError('Aim distance must be greater than 0')
  }

  const newtonianDeflectionAngle = (2 * gravitationalParameter) / (SPEED_OF_LIGHT ** 2 * aimDistance)
  const generalRelativisticDeflectionAngle = 2 * newtonianDeflectionAngle

  const collisionRadius = evaluateBlackHole(gravitationalParameter, aimDistance).eventHorizonRadius
  const maxTime = (MAX_TIME_FACTOR * (2 * Math.abs(START_X))) / SPEED_OF_LIGHT

  let x = START_X
  let y = aimDistance
  let vx = SPEED_OF_LIGHT
  let vy = 0
  let t = 0

  const trajectory: LightBendingPoint[] = [{ t, x, y }]
  let outcome: LightBendingOutcome = 'falls-in'
  let simulatedDeflectionAngle: number | null = null

  while (t < maxTime) {
    const { ax, ay } = accelerationAt(x, y, gravitationalParameter)
    const vxHalf = vx + (ax * TIME_STEP) / 2
    const vyHalf = vy + (ay * TIME_STEP) / 2
    x += vxHalf * TIME_STEP
    y += vyHalf * TIME_STEP
    const { ax: ax2, ay: ay2 } = accelerationAt(x, y, gravitationalParameter)
    vx = vxHalf + (ax2 * TIME_STEP) / 2
    vy = vyHalf + (ay2 * TIME_STEP) / 2
    t += TIME_STEP
    trajectory.push({ t, x, y })

    const r = Math.hypot(x, y)
    if (r <= collisionRadius) {
      outcome = 'falls-in'
      simulatedDeflectionAngle = null
      break
    }

    if (x >= FAR_FIELD_X && vx > 0) {
      outcome = 'deflects'
      simulatedDeflectionAngle = Math.abs(Math.atan2(vy, vx))
      break
    }
  }

  return {
    gravitationalParameter,
    aimDistance,
    newtonianDeflectionAngle,
    generalRelativisticDeflectionAngle,
    outcome,
    trajectory,
    simulatedDeflectionAngle,
  }
}

// ---------------------------------------------------------------------------------------------
// Audit update, 2026-11-13: what the page's pictures, tables and guess marks need. Nothing above
// this line changes; every number below comes from runLightBendingExperiment.
// ---------------------------------------------------------------------------------------------

export const LIGHT_MASS = 1
export const AIM_MIN = 0.3
export const AIM_MAX = 4
export const AIM_STEP = 0.1
// Part 1's three launches: a far pass, a close pass, and a slow sweep from far to close. The sweep
// stops at 0.8, the first aim on the slider that passes by rather than falling in.
export const PART_ONE_AIMS = { far: 3, close: 1, sweepStart: 4, sweepEnd: 0.8 } as const

export type BendChoice = 'yes' | 'no'
export type MoreLessSameChoice = 'more' | 'less' | 'same'

export function radiansToDegrees(radians: number): number {
  return (radians * 180) / Math.PI
}

// Aims are stepped in tenths, so round to one decimal to keep 0.8 from becoming 0.7999999.
function roundAim(aim: number): number {
  return Math.round(aim * 10) / 10
}

export interface FlybySummary {
  aim: number
  outcome: LightBendingOutcome
  // null when the light falls in: there is no far-field angle to measure.
  simulatedDegrees: number | null
  ordinaryFormulaRadians: number
  ordinaryFormulaDegrees: number
  realFormulaDegrees: number
}

export function flybySummary(aim: number, gravitationalParameter: number = LIGHT_MASS): FlybySummary {
  const r = runLightBendingExperiment(gravitationalParameter, aim)
  return {
    aim,
    outcome: r.outcome,
    simulatedDegrees: r.simulatedDeflectionAngle === null ? null : radiansToDegrees(r.simulatedDeflectionAngle),
    ordinaryFormulaRadians: r.newtonianDeflectionAngle,
    ordinaryFormulaDegrees: radiansToDegrees(r.newtonianDeflectionAngle),
    realFormulaDegrees: radiansToDegrees(r.generalRelativisticDeflectionAngle),
  }
}

// The angle for every aim from `from` down to `to` (far to close), one run per step.
export function aimSweep(
  from: number = PART_ONE_AIMS.sweepStart,
  to: number = PART_ONE_AIMS.sweepEnd,
  step: number = AIM_STEP
): FlybySummary[] {
  const out: FlybySummary[] = []
  const count = Math.round((from - to) / step)
  for (let i = 0; i <= count; i += 1) {
    out.push(flybySummary(roundAim(from - i * step)))
  }
  return out
}

// The edge between "falls in" and "passes by" on the slider's own steps.
export function fallsInEdge(): { lastFallsIn: number; firstPassesBy: number } {
  let lastFallsIn = AIM_MIN
  let firstPassesBy = AIM_MAX
  for (let a = AIM_MIN; a <= AIM_MAX + 1e-9; a = roundAim(a + AIM_STEP)) {
    if (runLightBendingExperiment(LIGHT_MASS, a).outcome === 'falls-in') lastFallsIn = a
    else {
      firstPassesBy = a
      break
    }
  }
  return { lastFallsIn, firstPassesBy }
}

// Real formula divided by the ordinary one: exactly 2 at every aim (the page's own statement).
export function realToOrdinaryRatio(aim: number): number {
  const r = runLightBendingExperiment(LIGHT_MASS, aim)
  return r.generalRelativisticDeflectionAngle / r.newtonianDeflectionAngle
}

// ---- the three white guess marks ------------------------------------------------------------
// None of these follows a real value. A "yes" or "no", or a direction, has no size of its own, so
// the mark's size is fixed and means nothing; the caption says so. The anchors sit on the real
// picture so the marks land where the answers live.
export const GUESS_LINE_AIMS = { from: 3, to: 1 } as const
export const GUESS_LINE_RISE_DEGREES = 10
export const GUESS_RING_AIM = 2
export const GUESS_RING_OFFSET_DEGREES = 6

export interface GuessMarkers {
  // Guess 1: a ring at the bend of the far pass.
  bends: { choice: BendChoice; aim: number; degrees: number }
  // Guess 2: a straight line whose direction (not its size) follows the guess. Aim goes from
  // `from` (far) to `to` (close); `degreesFrom` and `degreesTo` are fixed heights on the graph.
  closer: {
    choice: MoreLessSameChoice
    aimFrom: number
    aimTo: number
    degreesFrom: number
    degreesTo: number
  }
  // Guess 3: a ring above, on or below the amber curve at one aim; its height means nothing.
  realVsOrdinary: { choice: MoreLessSameChoice; aim: number; degrees: number }
}

export function guessMarkers(
  bentGuess: BendChoice,
  closerGuess: MoreLessSameChoice,
  realGuess: MoreLessSameChoice
): GuessMarkers {
  const far = flybySummary(PART_ONE_AIMS.far)
  const ringBase = flybySummary(GUESS_RING_AIM).simulatedDegrees!
  const mid = ringBase
  const rise = closerGuess === 'more' ? GUESS_LINE_RISE_DEGREES : closerGuess === 'less' ? -GUESS_LINE_RISE_DEGREES : 0
  const ringOffset =
    realGuess === 'more' ? GUESS_RING_OFFSET_DEGREES : realGuess === 'less' ? -GUESS_RING_OFFSET_DEGREES : 0
  return {
    bends: { choice: bentGuess, aim: PART_ONE_AIMS.far, degrees: far.simulatedDegrees! },
    closer: {
      choice: closerGuess,
      aimFrom: GUESS_LINE_AIMS.from,
      aimTo: GUESS_LINE_AIMS.to,
      degreesFrom: mid - rise / 2,
      degreesTo: mid + rise / 2,
    },
    realVsOrdinary: { choice: realGuess, aim: GUESS_RING_AIM, degrees: ringBase + ringOffset },
  }
}

// ---- the tutor's marking (for the tutor only, after the learner has reasoned) ---------------
export interface TutorMarking {
  bends: { guess: BendChoice; actual: BendChoice; matches: boolean; degreesAtFarPass: number }
  closer: {
    guess: MoreLessSameChoice
    actual: MoreLessSameChoice
    matches: boolean
    farDegrees: number
    closeDegrees: number
  }
  realVsOrdinary: {
    guess: MoreLessSameChoice
    actual: MoreLessSameChoice
    matches: boolean
    ratio: number
    ordinaryDegreesAtAim2: number
    realDegreesAtAim2: number
  }
}

function compare(a: number, b: number): MoreLessSameChoice {
  if (Math.abs(a - b) < 1e-9 * Math.max(1, Math.abs(a), Math.abs(b))) return 'same'
  return a > b ? 'more' : 'less'
}

export function tutorMarking(
  bentGuess: BendChoice,
  closerGuess: MoreLessSameChoice,
  realGuess: MoreLessSameChoice
): TutorMarking {
  const far = flybySummary(PART_ONE_AIMS.far)
  const close = flybySummary(PART_ONE_AIMS.close)
  const two = flybySummary(GUESS_RING_AIM)
  const bendsActual: BendChoice = (far.simulatedDegrees ?? 0) > 0 ? 'yes' : 'no'
  const closerActual = compare(close.simulatedDegrees!, far.simulatedDegrees!)
  const realActual = compare(two.realFormulaDegrees, two.ordinaryFormulaDegrees)
  return {
    bends: { guess: bentGuess, actual: bendsActual, matches: bentGuess === bendsActual, degreesAtFarPass: far.simulatedDegrees! },
    closer: {
      guess: closerGuess,
      actual: closerActual,
      matches: closerGuess === closerActual,
      farDegrees: far.simulatedDegrees!,
      closeDegrees: close.simulatedDegrees!,
    },
    realVsOrdinary: {
      guess: realGuess,
      actual: realActual,
      matches: realGuess === realActual,
      ratio: realToOrdinaryRatio(GUESS_RING_AIM),
      ordinaryDegreesAtAim2: two.ordinaryFormulaDegrees,
      realDegreesAtAim2: two.realFormulaDegrees,
    },
  }
}

// ---- the check-up table (Part 3, Table 2) ---------------------------------------------------
// Published for light grazing the Sun's edge: about 0.87 arcseconds under ordinary gravity and
// about 1.75 under general relativity, "twice as great" (Kennefick, Physics Today, 1 March 2009,
// read 2026-11-13 through a helper's summary; to be re-checked against the live page). The ratio
// is the only part of this that is compared: the page's units are made up, so its angles are not
// arcseconds.
export const SUN_PUBLISHED = { ordinaryArcseconds: 0.87, realArcseconds: 1.75 } as const

export function publishedSunRatio(): number {
  return SUN_PUBLISHED.realArcseconds / SUN_PUBLISHED.ordinaryArcseconds
}

export interface StepCheckRow {
  aim: number
  expectedDegrees: number // the textbook formula
  foundDegrees: number // the stepped path
  percentUnder: number // how far the stepped path is below the formula, in percent
}

export const CHECK_UP_AIMS = [3, 1, 4] as const

export function stepCheckRows(): StepCheckRow[] {
  return CHECK_UP_AIMS.map((aim) => {
    const s = flybySummary(aim)
    const found = s.simulatedDegrees!
    return {
      aim,
      expectedDegrees: s.ordinaryFormulaDegrees,
      foundDegrees: found,
      percentUnder: ((s.ordinaryFormulaDegrees - found) / s.ordinaryFormulaDegrees) * 100,
    }
  })
}

export interface RatioCheckRow {
  expected: number
  found: number
  percentDifference: number
}

// Row 4: the page's two formulas against each other (a check on the page itself, not a reference).
export function pageRatioCheck(): RatioCheckRow {
  const found = realToOrdinaryRatio(GUESS_RING_AIM)
  return { expected: 2, found, percentDifference: (Math.abs(found - 2) / 2) * 100 }
}

// Row 5: the page's ratio against the published ratio for the Sun.
export function sunRatioCheck(): RatioCheckRow {
  const expected = publishedSunRatio()
  const found = realToOrdinaryRatio(GUESS_RING_AIM)
  return { expected, found, percentDifference: (Math.abs(found - expected) / expected) * 100 }
}

// ---- worked numbers for the captions and the tutor ------------------------------------------
export interface WorkedNumbers {
  aim: number
  ordinaryFormulaRadians: number
  ordinaryFormulaDegrees: number
  simulatedDegrees: number | null
  realFormulaDegrees: number
}

export function workedNumbers(aim: number): WorkedNumbers {
  const s = flybySummary(aim)
  return {
    aim,
    ordinaryFormulaRadians: s.ordinaryFormulaRadians,
    ordinaryFormulaDegrees: s.ordinaryFormulaDegrees,
    simulatedDegrees: s.simulatedDegrees,
    realFormulaDegrees: s.realFormulaDegrees,
  }
}
