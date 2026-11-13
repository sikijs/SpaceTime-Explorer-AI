// A black hole isn't a new kind of physics — it's what Experiment 6's escape speed becomes once
// it would need to exceed the speed of light. Since nothing can exceed c ("Relativity of Time and
// Motion," Experiment 5), once escape speed reaches c at some distance, nothing can escape from
// within that distance: the event horizon. SPEED_OF_LIGHT and gravitationalParameter/distance are
// dimensionless, relative quantities in Experiment 6's own units, not real physical values.
export const SPEED_OF_LIGHT = 2

export interface BlackHoleResult {
  gravitationalParameter: number
  distance: number
  escapeSpeed: number
  escapeSpeedFractionOfC: number
  eventHorizonRadius: number
  isInsideHorizon: boolean
}

// escapeSpeed is the exact same formula Experiment 6 defines and tests
// (sqrt(2 * gravitationalParameter / distance)), evaluated here rather than as part of a
// simulated sideways launch. eventHorizonRadius solves escapeSpeed = SPEED_OF_LIGHT for distance —
// numerically identical in form to the real Schwarzschild radius, 2GM/c², a curious historical
// coincidence (Michell, 1783) rather than a derivation of the real, general-relativistic result.
export function evaluateBlackHole(gravitationalParameter: number, distance: number): BlackHoleResult {
  if (!(gravitationalParameter > 0)) {
    throw new RangeError('Gravitational parameter must be greater than 0')
  }
  if (!(distance > 0)) {
    throw new RangeError('Distance must be greater than 0')
  }

  const escapeSpeed = Math.sqrt((2 * gravitationalParameter) / distance)
  const escapeSpeedFractionOfC = escapeSpeed / SPEED_OF_LIGHT
  const eventHorizonRadius = (2 * gravitationalParameter) / SPEED_OF_LIGHT ** 2
  const isInsideHorizon = distance <= eventHorizonRadius

  return {
    gravitationalParameter,
    distance,
    escapeSpeed,
    escapeSpeedFractionOfC,
    eventHorizonRadius,
    isInsideHorizon,
  }
}

export interface RadialLaunchPoint {
  t: number
  distance: number
}

export type RadialLaunchOutcome = 'escapes' | 'falls-back'

export interface RadialLaunchResult {
  outcome: RadialLaunchOutcome
  trajectory: RadialLaunchPoint[]
}

const TIME_STEP = 0.01
const ESCAPE_DISTANCE_FACTOR = 3
// A Kepler-like characteristic time for this (gravitationalParameter, startDistance) pair, used
// to scale the simulation's maximum duration so both near-threshold escapes (which climb slowly)
// and near-threshold falls-back (which take a long time to reach apoapsis) have room to resolve.
const MAX_TIME_FACTOR = 100
const ENERGY_TOLERANCE_FACTOR = 1e-6

// Launches a probe straight outward from startDistance at exactly SPEED_OF_LIGHT — the fastest
// speed anything can ever travel — under the same inverse-square gravity law and the same
// fixed-step symplectic (velocity Verlet) integration as orbitExperiment.ts, reduced to one
// dimension since the launch has no sideways component. Because the motion is purely radial, the
// probe can only ever move directly away or directly back: there is no possibility of an orbit
// forming, so this launch cannot misleadingly suggest a stable orbit exists inside a real event
// horizon (it cannot).
export function runRadialLightSpeedLaunch(
  gravitationalParameter: number,
  startDistance: number
): RadialLaunchResult {
  if (!(gravitationalParameter > 0)) {
    throw new RangeError('Gravitational parameter must be greater than 0')
  }
  if (!(startDistance > 0)) {
    throw new RangeError('Start distance must be greater than 0')
  }

  const characteristicTime = Math.sqrt(startDistance ** 3 / gravitationalParameter)
  const maxTime = MAX_TIME_FACTOR * characteristicTime
  const escapeDistance = ESCAPE_DISTANCE_FACTOR * startDistance
  const energyTolerance = (ENERGY_TOLERANCE_FACTOR * gravitationalParameter) / startDistance

  let r = startDistance
  let v = SPEED_OF_LIGHT
  let t = 0

  const trajectory: RadialLaunchPoint[] = [{ t, distance: r }]
  let outcome: RadialLaunchOutcome = 'falls-back'

  const accelerationAt = (distance: number) => -gravitationalParameter / (distance * distance)

  while (t < maxTime) {
    const a = accelerationAt(r)
    const vHalf = v + (a * TIME_STEP) / 2
    r += vHalf * TIME_STEP
    const a2 = accelerationAt(r)
    v = vHalf + (a2 * TIME_STEP) / 2
    t += TIME_STEP
    trajectory.push({ t, distance: r })

    const energy = 0.5 * v * v - gravitationalParameter / r

    if (energy > energyTolerance && r >= escapeDistance && v > 0) {
      outcome = 'escapes'
      break
    }
    if (v <= 0 && r <= startDistance) {
      outcome = 'falls-back'
      break
    }
  }

  return { outcome, trajectory }
}

// ---------------------------------------------------------------------------------------------
// Audit update (Gravity 7, 2026-11-13): graph of escape speed against mass, guess markers, the
// check-up number, tutor marking and the real-size ladder for the field guide. The model above is
// unchanged. Nothing here reads a guess except guessMarkers and tutorMarking.
// ---------------------------------------------------------------------------------------------

export const LAUNCH_DISTANCE = 1
export const MASS_MIN = 0.2
export const MASS_MAX = 6
// Part 1's three launches: a very light mass, a very heavy mass, and a slow raise through the range.
export const PART_ONE_MASSES = { light: 0.2, heavy: 6 } as const

export type SpeedCompareChoice = 'much-slower' | 'faster' | 'cannot-escape'
export type YesNo = 'yes' | 'no'

// The mass at which the escape speed from the launch point equals the speed of light, i.e. where
// the event horizon reaches the launch point: 2 * mass / distance = c^2.
export function specialMass(distance: number = LAUNCH_DISTANCE): number {
  if (!(distance > 0)) {
    throw new RangeError('Distance must be greater than 0')
  }
  return (SPEED_OF_LIGHT ** 2 * distance) / 2
}

export interface EscapeSweepPoint {
  mass: number
  escapeSpeedFractionOfC: number
}

// The curve on the graph: escape speed from the launch point, as a fraction of light speed.
export function escapeSpeedSweep(
  step = 0.1,
  min = MASS_MIN,
  max = MASS_MAX,
  distance: number = LAUNCH_DISTANCE
): EscapeSweepPoint[] {
  if (!(step > 0)) {
    throw new RangeError('Step must be greater than 0')
  }
  const points: EscapeSweepPoint[] = []
  const count = Math.round((max - min) / step)
  for (let i = 0; i <= count; i++) {
    const mass = min + i * step
    points.push({
      mass,
      escapeSpeedFractionOfC: evaluateBlackHole(mass, distance).escapeSpeedFractionOfC,
    })
  }
  return points
}

// The outcome of a light-speed launch, in closed form (checked against the simulation in the
// tests): the probe escapes only while its speed is above the escape speed.
export function outcomeForMass(mass: number, distance: number = LAUNCH_DISTANCE): RadialLaunchOutcome {
  return mass < specialMass(distance) ? 'escapes' : 'falls-back'
}

export interface PartOneLaunch {
  mass: number
  escapeSpeedFractionOfC: number
  eventHorizonRadius: number
  isInsideHorizon: boolean
  outcome: RadialLaunchOutcome
}

export function launchSummary(mass: number): PartOneLaunch {
  const e = evaluateBlackHole(mass, LAUNCH_DISTANCE)
  return {
    mass,
    escapeSpeedFractionOfC: e.escapeSpeedFractionOfC,
    eventHorizonRadius: e.eventHorizonRadius,
    isInsideHorizon: e.isInsideHorizon,
    outcome: outcomeForMass(mass),
  }
}

export interface PartOneOutcomes {
  light: PartOneLaunch
  heavy: PartOneLaunch
  specialMass: number
}

export function partOneOutcomes(): PartOneOutcomes {
  return {
    light: launchSummary(PART_ONE_MASSES.light),
    heavy: launchSummary(PART_ONE_MASSES.heavy),
    specialMass: specialMass(),
  }
}

// Check-up: at the event horizon the escape speed should be exactly the speed of light.
export interface CheckUp {
  expectedFractionAtHorizon: number
  foundFractionAtHorizon: number
}

export function checkUp(mass: number): CheckUp {
  const horizon = evaluateBlackHole(mass, LAUNCH_DISTANCE).eventHorizonRadius
  return {
    expectedFractionAtHorizon: 1,
    foundFractionAtHorizon: evaluateBlackHole(mass, horizon).escapeSpeedFractionOfC,
  }
}

// Heights of the white guess markers on the graph, as a fraction of light speed. A guess for
// "faster" or "cannot escape" has no number of its own, so these are fixed positions for the
// marker only; they do not follow any real value.
export const GUESS_MARK_HEIGHTS = { muchSlower: 0.12, faster: 1.3, cannotEscape: 1.55 } as const

export interface GuessMarkers {
  light: { mass: number; fractionOfC: number; choice: SpeedCompareChoice }
  heavy: { mass: number; fractionOfC: number; choice: SpeedCompareChoice }
  // A yes sits on the real crossing mass; a no is only a marker on the speed-of-light line.
  inBetween: { choice: YesNo; mass: number | null; fractionOfC: number }
}

function heightFor(choice: SpeedCompareChoice): number {
  if (choice === 'much-slower') return GUESS_MARK_HEIGHTS.muchSlower
  if (choice === 'faster') return GUESS_MARK_HEIGHTS.faster
  return GUESS_MARK_HEIGHTS.cannotEscape
}

export function guessMarkers(
  lightGuess: SpeedCompareChoice,
  heavyGuess: SpeedCompareChoice,
  inBetweenGuess: YesNo
): GuessMarkers {
  return {
    light: { mass: PART_ONE_MASSES.light, fractionOfC: heightFor(lightGuess), choice: lightGuess },
    heavy: { mass: PART_ONE_MASSES.heavy, fractionOfC: heightFor(heavyGuess), choice: heavyGuess },
    inBetween: {
      choice: inBetweenGuess,
      mass: inBetweenGuess === 'yes' ? specialMass() : null,
      fractionOfC: 1,
    },
  }
}

export interface TutorMarking {
  light: { guess: SpeedCompareChoice; actual: SpeedCompareChoice; fractionOfC: number; matches: boolean }
  heavy: { guess: SpeedCompareChoice; actual: SpeedCompareChoice; fractionOfC: number; matches: boolean }
  inBetween: { guess: YesNo; actual: YesNo; specialMass: number; matches: boolean }
}

// For the tutor only. The real answer for the light mass is "much slower" (the formula gives well
// under the speed of light, and the probe escapes). For the heavy mass the formula asks for more
// than light speed, which is impossible, so the real answer is that nothing escapes; "faster than
// light" is what the formula would need, not something that can happen.
export function tutorMarking(
  lightGuess: SpeedCompareChoice,
  heavyGuess: SpeedCompareChoice,
  inBetweenGuess: YesNo
): TutorMarking {
  const real = partOneOutcomes()
  const lightActual: SpeedCompareChoice = real.light.escapeSpeedFractionOfC < 1 ? 'much-slower' : 'cannot-escape'
  const heavyActual: SpeedCompareChoice = real.heavy.outcome === 'falls-back' ? 'cannot-escape' : 'much-slower'
  return {
    light: {
      guess: lightGuess,
      actual: lightActual,
      fractionOfC: real.light.escapeSpeedFractionOfC,
      matches: lightGuess === lightActual,
    },
    heavy: {
      guess: heavyGuess,
      actual: heavyActual,
      fractionOfC: real.heavy.escapeSpeedFractionOfC,
      matches: heavyGuess === heavyActual,
    },
    inBetween: {
      guess: inBetweenGuess,
      actual: 'yes',
      specialMass: real.specialMass,
      matches: inBetweenGuess === 'yes',
    },
  }
}

// ---- Real black-hole sizes for the field guide (real physics, not the probe model) ----------
// Schwarzschild radius = 2 G M / c^2, with real SI values.
export const REAL_G = 6.6743e-11
export const REAL_C = 299_792_458
export const SOLAR_MASS_KG = 1.989e30

export function realSchwarzschildRadiusMeters(massKg: number): number {
  if (!(massKg > 0)) {
    throw new RangeError('Mass must be greater than 0')
  }
  return (2 * REAL_G * massKg) / REAL_C ** 2
}

export interface SizeLadderEntry {
  name: string
  massKg: number
  // Where the mass comes from: 'standard' reference values; 'sourced' from a page fetched
  // 2026-11-13; 'imagined' for an everyday object chosen only for scale.
  massSource: 'standard' | 'sourced' | 'imagined'
  radiusMeters: number
}

const LADDER: Array<Omit<SizeLadderEntry, 'radiusMeters'>> = [
  { name: 'A person (70 kg)', massKg: 70, massSource: 'imagined' },
  { name: 'The Moon', massKg: 7.342e22, massSource: 'standard' },
  { name: 'The Earth', massKg: 5.972e24, massSource: 'standard' },
  { name: 'Jupiter', massKg: 1.898e27, massSource: 'standard' },
  { name: 'The Sun', massKg: SOLAR_MASS_KG, massSource: 'standard' },
  // ESO eso2208 and eso1907: 4 million and 6.5 billion times the mass of the Sun.
  { name: 'Sagittarius A* (4 million Suns)', massKg: 4e6 * SOLAR_MASS_KG, massSource: 'sourced' },
  { name: 'M87* (6.5 billion Suns)', massKg: 6.5e9 * SOLAR_MASS_KG, massSource: 'sourced' },
]

export function sizeLadder(): SizeLadderEntry[] {
  return LADDER.map((e) => ({ ...e, radiusMeters: realSchwarzschildRadiusMeters(e.massKg) }))
}

// ---- The "hill" picture in the introduction (relative units, the same ordinary gravity as above) ----
// The pull of a ball-shaped mass at a distance from its centre (outside it), and the depth of the
// "hill" there. Pull = mass / distance^2; depth = mass / distance. Same mass and same distance give
// the same numbers whatever the size of the ball, as long as the point is outside the ball.
export function pullAt(mass: number, distance: number): number {
  if (!(mass > 0)) {
    throw new RangeError('Mass must be greater than 0')
  }
  if (!(distance > 0)) {
    throw new RangeError('Distance must be greater than 0')
  }
  return mass / (distance * distance)
}

export function hillDepthAt(mass: number, distance: number): number {
  if (!(mass > 0)) {
    throw new RangeError('Mass must be greater than 0')
  }
  if (!(distance > 0)) {
    throw new RangeError('Distance must be greater than 0')
  }
  return mass / distance
}

// ---- Part 3 (results): the table of Part 1's launches and the check-up numbers ----
export type LaunchPointPosition = 'outside' | 'inside' | 'on'

// Where the launch point sits compared with the event horizon: outside it (the horizon is smaller than the launch distance), inside it,
// or exactly on it.
export function launchPointPosition(mass: number, distance: number = LAUNCH_DISTANCE): LaunchPointPosition {
  const horizon = evaluateBlackHole(mass, distance).eventHorizonRadius
  if (Math.abs(horizon - distance) < 1e-12) return 'on'
  return horizon > distance ? 'inside' : 'outside'
}

export interface ResultsRow {
  key: 'light' | 'heavy' | 'sweep'
  mass: number
  escapeSpeedFractionOfC: number
  eventHorizonRadius: number
  launchPoint: LaunchPointPosition
  // 'switches': for the slow raise, the mass where the outcome changes from getting away to falling back.
  outcome: RadialLaunchOutcome | 'switches'
}

// The rows of Table 1: the very light mass, the very heavy mass, and the mass where the slow raise changes.
export function resultsTable(): ResultsRow[] {
  const row = (key: ResultsRow['key'], mass: number, outcome: ResultsRow['outcome']): ResultsRow => {
    const e = evaluateBlackHole(mass, LAUNCH_DISTANCE)
    return {
      key,
      mass,
      escapeSpeedFractionOfC: e.escapeSpeedFractionOfC,
      eventHorizonRadius: e.eventHorizonRadius,
      launchPoint: launchPointPosition(mass),
      outcome,
    }
  }
  return [
    row('light', PART_ONE_MASSES.light, outcomeForMass(PART_ONE_MASSES.light)),
    row('heavy', PART_ONE_MASSES.heavy, outcomeForMass(PART_ONE_MASSES.heavy)),
    row('sweep', specialMass(), 'switches'),
  ]
}

export interface CheckUpRow {
  mass: number
  horizonRadius: number
  expectedFraction: number
  foundFraction: number
  same: boolean
}

// Check-up 1: at the event horizon the escape speed should be exactly the speed of light.
export function horizonCheckUp(mass: number): CheckUpRow {
  const c = checkUp(mass)
  return {
    mass,
    horizonRadius: evaluateBlackHole(mass, LAUNCH_DISTANCE).eventHorizonRadius,
    expectedFraction: c.expectedFractionAtHorizon,
    foundFraction: c.foundFractionAtHorizon,
    same: Math.abs(c.foundFractionAtHorizon - c.expectedFractionAtHorizon) < 1e-9,
  }
}

export interface OutcomeCheckRow {
  mass: number
  formula: RadialLaunchOutcome
  simulation: RadialLaunchOutcome
  same: boolean
}

// Check-up 2: the formula's outcome (escapes below the special mass) against the step-by-step simulation the page runs.
export function outcomeCheckUp(mass: number): OutcomeCheckRow {
  const formula = outcomeForMass(mass)
  const simulation = runRadialLightSpeedLaunch(mass, LAUNCH_DISTANCE).outcome
  return { mass, formula, simulation, same: formula === simulation }
}
