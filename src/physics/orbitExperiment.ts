// Ordinary Newtonian gravity in two dimensions, numerically integrated (not a shortcut
// formula), so falling-in, escaping, and orbiting all fall out of the same single
// calculation, exactly as they do for a real body under real gravity. gravitationalParameter
// (GM) and distances are dimensionless, relative quantities, as in Experiment 5 — not real
// kilograms, meters, or seconds.
//
// The body starts at (initialDistance, 0) moving in the +y direction at initialSpeed, and its
// position and velocity are advanced with velocity Verlet (a symplectic integrator), which
// conserves orbital energy far better than plain Euler over many steps. Plain Euler would make
// a circular orbit visibly spiral due to integration error alone — not a real physical effect.
//
// The outcome is decided by the body's conserved specific orbital energy
// (E = 1/2 v^2 - GM/r), which is what actually determines a trajectory's fate in real
// two-body gravity, together with the collision radius: negative energy means a bound orbit
// (which still falls in if its path ever reaches the collision radius); non-negative energy
// once past periapsis (moving outward) means it never returns.
export interface OrbitPoint {
  t: number
  x: number
  y: number
}

export type OrbitOutcome = 'falls-in' | 'escapes' | 'orbits'

export interface OrbitExperimentResult {
  gravitationalParameter: number
  initialDistance: number
  initialSpeed: number
  circularSpeed: number
  escapeSpeed: number
  outcome: OrbitOutcome
  trajectory: OrbitPoint[]
}

export const COLLISION_RADIUS_FACTOR = 0.1
const MAX_ORBIT_PERIODS = 8
const TIME_STEP = 0.01
// Specific orbital energy above this (in units of GM / initialDistance) counts as "unbound",
// allowing for the integrator's small energy drift over many steps.
const ENERGY_TOLERANCE_FACTOR = 1e-6
// An unbound trajectory launched at periapsis has positive radial velocity from essentially
// the very next integration step onward (radial velocity is exactly zero only at that starting
// instant), so the energy/radial-velocity escape check alone can be satisfied after just one
// step, well before the object has traveled far enough to visibly show it flying away. Requiring
// it to also have reached this multiple of its starting distance keeps the escape classification
// (based on the same physical criterion) but gives the trajectory enough length to animate —
// chosen generously (not just past the minimum needed to confirm escape) so the display, which
// zooms out to fit the whole computed trajectory, shows a fuller sweep of the escape curve.
const ESCAPE_CONFIRMATION_DISTANCE_FACTOR = 8

function accelerationAt(
  x: number,
  y: number,
  gravitationalParameter: number
): { ax: number; ay: number } {
  const r = Math.hypot(x, y)
  const factor = -gravitationalParameter / (r * r * r)
  return { ax: factor * x, ay: factor * y }
}

function specificEnergy(
  x: number,
  y: number,
  vx: number,
  vy: number,
  gravitationalParameter: number
): number {
  const r = Math.hypot(x, y)
  return 0.5 * (vx * vx + vy * vy) - gravitationalParameter / r
}

export function runOrbitExperiment(
  gravitationalParameter: number,
  initialDistance: number,
  initialSpeed: number
): OrbitExperimentResult {
  if (!(gravitationalParameter > 0)) {
    throw new RangeError('Gravitational parameter must be greater than 0')
  }
  if (!(initialDistance > 0)) {
    throw new RangeError('Initial distance must be greater than 0')
  }
  if (!(initialSpeed >= 0)) {
    throw new RangeError('Initial speed must be greater than or equal to 0')
  }

  const circularSpeed = Math.sqrt(gravitationalParameter / initialDistance)
  const escapeSpeed = Math.sqrt((2 * gravitationalParameter) / initialDistance)
  const circularPeriod = (2 * Math.PI * initialDistance) / circularSpeed
  const maxTime = MAX_ORBIT_PERIODS * circularPeriod
  const collisionRadius = COLLISION_RADIUS_FACTOR * initialDistance
  const energyTolerance = (ENERGY_TOLERANCE_FACTOR * gravitationalParameter) / initialDistance

  let x = initialDistance
  let y = 0
  let vx = 0
  let vy = initialSpeed
  let t = 0

  const trajectory: OrbitPoint[] = [{ t, x, y }]
  let outcome: OrbitOutcome = 'orbits'

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
      break
    }

    const radialVelocity = (x * vx + y * vy) / r
    const energy = specificEnergy(x, y, vx, vy, gravitationalParameter)
    if (
      energy > energyTolerance &&
      radialVelocity > 0 &&
      r >= ESCAPE_CONFIRMATION_DISTANCE_FACTOR * initialDistance
    ) {
      outcome = 'escapes'
      break
    }
  }

  return {
    gravitationalParameter,
    initialDistance,
    initialSpeed,
    circularSpeed,
    escapeSpeed,
    outcome,
    trajectory,
  }
}

// ---------------------------------------------------------------------------------------------
// Audit update (Gravity 6): numbers for the outcome graph, its guess marks, the results and the
// tutor's marking. Everything here is the same model as runOrbitExperiment above (mass 1, start
// distance 1), never a second model; the closed forms are for comparison and for labelling.
// ---------------------------------------------------------------------------------------------

export const ORBIT_GRAVITATIONAL_PARAMETER = 1
export const ORBIT_INITIAL_DISTANCE = 1

// The three pushes of Part 1, as fractions of the circular-orbit speed.
export const PART_ONE_PUSHES = { weak: 0.2, strong: 2, inBetween: 1 } as const

export type YesNo = 'yes' | 'no'

export function circularSpeedFor(gravitationalParameter: number, distance: number): number {
  if (!(gravitationalParameter > 0)) {
    throw new RangeError('Gravitational parameter must be greater than 0')
  }
  if (!(distance > 0)) {
    throw new RangeError('Distance must be greater than 0')
  }
  return Math.sqrt(gravitationalParameter / distance)
}

function assertFraction(fraction: number): void {
  if (!(fraction >= 0) || !Number.isFinite(fraction)) {
    throw new RangeError('Push fraction must be a finite number greater than or equal to 0')
  }
}

// Outcome of one push (a fraction of the circular-orbit speed) at the page's fixed mass and
// start distance, from the same simulation the Run button uses.
export function outcomeForPush(fraction: number): OrbitOutcome {
  assertFraction(fraction)
  const circular = circularSpeedFor(ORBIT_GRAVITATIONAL_PARAMETER, ORBIT_INITIAL_DISTANCE)
  return runOrbitExperiment(
    ORBIT_GRAVITATIONAL_PARAMETER,
    ORBIT_INITIAL_DISTANCE,
    fraction * circular
  ).outcome
}

export interface PushOutcome {
  fraction: number
  outcome: OrbitOutcome
}

// Outcomes from 0 up to maxFraction in equal steps (inclusive), for the graph's step line.
export function outcomeSweep(step = 0.05, maxFraction = 2): PushOutcome[] {
  if (!(step > 0)) throw new RangeError('Step must be greater than 0')
  if (!(maxFraction >= 0)) throw new RangeError('Maximum fraction must be at least 0')
  const count = Math.round(maxFraction / step)
  const rows: PushOutcome[] = []
  for (let i = 0; i <= count; i++) {
    const fraction = Math.round(i * step * 1e9) / 1e9
    rows.push({ fraction, outcome: outcomeForPush(fraction) })
  }
  return rows
}

// Closest approach, as a fraction of the start distance, of an object launched at `fraction`
// times the circular speed straight across the line to the mass (point-mass gravity). Below
// the circular speed the start is the farthest point and the closest point is f^2 / (2 - f^2);
// at or above it the start is the closest point.
export function closestApproachFraction(fraction: number): number {
  assertFraction(fraction)
  if (fraction >= 1) return 1
  return (fraction * fraction) / (2 - fraction * fraction)
}

// Farthest point, as a fraction of the start distance: the start itself below the circular
// speed; f^2 / (2 - f^2) from the circular speed up to the escape speed; unbounded from the
// escape speed up.
export function farthestPointFraction(fraction: number): number {
  assertFraction(fraction)
  if (fraction <= 1) return 1
  if (fraction >= Math.SQRT2) return Infinity
  return (fraction * fraction) / (2 - fraction * fraction)
}

// The push strength below which closest approach is inside the collision size: the solution of
// f^2 / (2 - f^2) = collisionSizeFactor.
export function pushEdgeForCollisionSize(collisionSizeFactor: number): number {
  if (!(collisionSizeFactor > 0 && collisionSizeFactor < 1)) {
    throw new RangeError('Collision size factor must be between 0 and 1')
  }
  return Math.sqrt((2 * collisionSizeFactor) / (1 + collisionSizeFactor))
}

// The two edges between the three outcomes, from closed forms: below fallsInBelow the object
// falls in (for the page's collision size), at or above escapesFrom (the escape speed, sqrt 2
// times the circular speed) it flies away; in between it orbits.
export function pushEdges(): { fallsInBelow: number; escapesFrom: number } {
  return {
    fallsInBelow: pushEdgeForCollisionSize(COLLISION_RADIUS_FACTOR),
    escapesFrom: Math.SQRT2,
  }
}

export interface EdgeBracket {
  formula: number
  lastBefore: number
  firstAfter: number
  formulaInside: boolean
}

export interface EdgeCheck {
  fallsIn: EdgeBracket & { lastBeforeOutcome: OrbitOutcome; firstAfterOutcome: OrbitOutcome }
  escape: EdgeBracket & { lastBeforeOutcome: OrbitOutcome; firstAfterOutcome: OrbitOutcome }
  circle: { closest: number; farthest: number }
}

// Check-up for the Results: the closed-form edges next to the whole-number pushes either side
// of them found by running the simulation, and the distance range of a push of exactly 1.
export function edgeCheck(): EdgeCheck {
  const edges = pushEdges()
  const wholeNumber = (percent: number) => percent / 100
  const percentOf = (value: number) => Math.round(value * 100)

  const fallsInLast = percentOf(edges.fallsInBelow) // 0.4264 -> 43, so step back to find it
  let lastFall = fallsInLast
  while (outcomeForPush(wholeNumber(lastFall)) !== 'falls-in') lastFall -= 1
  while (outcomeForPush(wholeNumber(lastFall + 1)) === 'falls-in') lastFall += 1

  let lastOrbit = percentOf(edges.escapesFrom)
  while (outcomeForPush(wholeNumber(lastOrbit)) !== 'orbits') lastOrbit -= 1
  while (outcomeForPush(wholeNumber(lastOrbit + 1)) === 'orbits') lastOrbit += 1

  const circular = runOrbitExperiment(
    ORBIT_GRAVITATIONAL_PARAMETER,
    ORBIT_INITIAL_DISTANCE,
    circularSpeedFor(ORBIT_GRAVITATIONAL_PARAMETER, ORBIT_INITIAL_DISTANCE)
  )
  const distances = circular.trajectory.map((point) => Math.hypot(point.x, point.y))

  const fallsIn = {
    formula: edges.fallsInBelow,
    lastBefore: wholeNumber(lastFall),
    firstAfter: wholeNumber(lastFall + 1),
    lastBeforeOutcome: outcomeForPush(wholeNumber(lastFall)),
    firstAfterOutcome: outcomeForPush(wholeNumber(lastFall + 1)),
    formulaInside: false,
  }
  fallsIn.formulaInside = fallsIn.lastBefore <= fallsIn.formula && fallsIn.formula <= fallsIn.firstAfter
  const escape = {
    formula: edges.escapesFrom,
    lastBefore: wholeNumber(lastOrbit),
    firstAfter: wholeNumber(lastOrbit + 1),
    lastBeforeOutcome: outcomeForPush(wholeNumber(lastOrbit)),
    firstAfterOutcome: outcomeForPush(wholeNumber(lastOrbit + 1)),
    formulaInside: false,
  }
  escape.formulaInside = escape.lastBefore <= escape.formula && escape.formula <= escape.firstAfter

  return {
    fallsIn,
    escape,
    circle: { closest: Math.min(...distances), farthest: Math.max(...distances) },
  }
}

export interface PartOneOutcomes {
  weak: OrbitOutcome
  strong: OrbitOutcome
  inBetween: OrbitOutcome
  // Whether a push strength in between gives an outcome different from both the weakest and the
  // strongest push (the answer to the third question).
  somethingDifferentInBetween: boolean
}

export function partOneOutcomes(): PartOneOutcomes {
  const weak = outcomeForPush(PART_ONE_PUSHES.weak)
  const strong = outcomeForPush(PART_ONE_PUSHES.strong)
  const inBetween = outcomeForPush(PART_ONE_PUSHES.inBetween)
  return {
    weak,
    strong,
    inBetween,
    somethingDifferentInBetween: inBetween !== weak && inBetween !== strong,
  }
}

export interface GuessMarkers {
  weak: { pushFraction: number; row: OrbitOutcome }
  strong: { pushFraction: number; row: OrbitOutcome }
  // A yes or no has no size or position of its own: only a marker, placed at the middle push.
  inBetween: { pushFraction: number; choice: YesNo }
}

// Where each white guess mark sits on the outcome graph. Nothing here depends on the real
// results: a guess never changes the pictures.
export function guessMarkers(
  weakGuess: OrbitOutcome,
  strongGuess: OrbitOutcome,
  inBetweenGuess: YesNo
): GuessMarkers {
  return {
    weak: { pushFraction: PART_ONE_PUSHES.weak, row: weakGuess },
    strong: { pushFraction: PART_ONE_PUSHES.strong, row: strongGuess },
    inBetween: { pushFraction: PART_ONE_PUSHES.inBetween, choice: inBetweenGuess },
  }
}

export interface TutorMarking {
  weak: { guess: OrbitOutcome; actual: OrbitOutcome; matches: boolean }
  strong: { guess: OrbitOutcome; actual: OrbitOutcome; matches: boolean }
  inBetween: { guess: YesNo; actual: YesNo; matches: boolean }
}

// For the tutor only: each guess against the real result.
export function tutorMarking(
  weakGuess: OrbitOutcome,
  strongGuess: OrbitOutcome,
  inBetweenGuess: YesNo
): TutorMarking {
  const real = partOneOutcomes()
  const actualInBetween: YesNo = real.somethingDifferentInBetween ? 'yes' : 'no'
  return {
    weak: { guess: weakGuess, actual: real.weak, matches: weakGuess === real.weak },
    strong: { guess: strongGuess, actual: real.strong, matches: strongGuess === real.strong },
    inBetween: {
      guess: inBetweenGuess,
      actual: actualInBetween,
      matches: inBetweenGuess === actualInBetween,
    },
  }
}

export interface PushSummary {
  fraction: number
  outcome: OrbitOutcome
  closestApproach: number
  farthestPoint: number
}

// One push in a single record, for the results table and the captions.
export function pushSummary(fraction: number): PushSummary {
  return {
    fraction,
    outcome: outcomeForPush(fraction),
    closestApproach: closestApproachFraction(fraction),
    farthestPoint: farthestPointFraction(fraction),
  }
}
