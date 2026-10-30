// Evidence and Imagination, Experiment 2: Can you travel back in time? The clock offset between the two mouths of a wormhole after one is sent out and back at speed (the twins again), the link the
// tunnel makes between them, and whether a path through the tunnel and back outside ends before it began (a closed timelike curve). Physics only: no React or browser code (CLAUDE.md §9).
// It imports only Spacetime Geometry 2's event classification (to say whether the entry event lies inside the light cone of the exit event).
// This is a TOY from the mathematics: no wormhole and no closed timelike curve has ever been seen. Idealised as the specification says: point mouths, a tunnel of zero length, steady speed
// (the turning and acceleration of mouth B are not modelled), and a closed-path condition worked here from a search summary of Morris, Thorne and Yurtsever (1988): it is "to be checked at the paper".
// Units: speeds as a fraction of c (c = 1); times in years; distances in light-years.

import { classifyEventPair } from './lightCones'

function checkSpeed(beta: number): void {
  if (!Number.isFinite(beta) || beta < 0 || beta >= 1) throw new RangeError('Speed must satisfy 0 <= v < c.')
}
function checkPositive(x: number, what: string): void {
  if (!Number.isFinite(x) || x <= 0) throw new RangeError(`${what} must be above zero.`)
}

// ---- The scenario of the specification's predictions (the controls change these as trial values) ----
export const PRESET_SPEED = 0.8
export const PRESET_TRIP_YEARS = 10
export const PRESET_SEPARATION_LY = 1

// ---- Travel to the future (settled: the twin formula) ----
// The moving mouth's clock after T years of the stay-at-home frame: T sqrt(1 - beta^2).
export function movingClockYears(beta: number, tripYears: number): number {
  checkSpeed(beta)
  checkPositive(tripYears, 'The trip time')
  return tripYears * Math.sqrt(1 - beta * beta)
}

// The offset between the mouths' clocks: T (1 - sqrt(1 - beta^2)).
export function clockOffsetYears(beta: number, tripYears: number): number {
  return tripYears - movingClockYears(beta, tripYears)
}

// ---- The tunnel link ----
// Both mouths are at rest in the common frame, A's clock reads the frame time t, and B's clock reads t - offset. The tunnel joins equal clock readings, so:
//   entering B at frame time t, you come out of A at frame time t - offset (the past side);
//   entering A at frame time t, you come out of B at frame time t + offset (the future side).
export function exitFrameTimeFromB(entryFrameTime: number, offsetYears: number): number {
  return entryFrameTime - offsetYears
}
export function exitFrameTimeFromA(entryFrameTime: number, offsetYears: number): number {
  return entryFrameTime + offsetYears
}

// ---- The closed path ----
// Leave B at frame time t, come out of A at t - offset, run outside to B (a distance of `separationLy`) at the speed of light at best: you arrive at t - offset + separation. That is before t
// exactly when offset > separation (light-years and years are equal numbers with c = 1). Equal is not closed: a light ray would only just return.
export function closedPathExists(offsetYears: number, separationLy: number): boolean {
  checkPositive(separationLy, 'The separation')
  if (!Number.isFinite(offsetYears) || offsetYears < 0) throw new RangeError('The offset cannot be negative.')
  return offsetYears > separationLy
}

// How much earlier than leaving the traveller arrives, at best (the outside run at the speed of light): offset - separation, or 0 if the path is not closed.
export function timeGainedYears(offsetYears: number, separationLy: number): number {
  return closedPathExists(offsetYears, separationLy) ? offsetYears - separationLy : 0
}

// The two events of the closed path in the common frame (time, position): the entry at B, the exit at A. B is at position `separationLy`, A at 0.
export function entryAndExitEvents(entryFrameTime: number, offsetYears: number, separationLy: number) {
  checkPositive(separationLy, 'The separation')
  return {
    entry: { time: entryFrameTime, position: separationLy },
    exit: { time: exitFrameTimeFromB(entryFrameTime, offsetYears), position: 0 },
  }
}

// Whether the entry event lies inside the future light cone of the exit event (Spacetime Geometry 2's classification). It does when offset > separation; on the cone's edge when equal.
export function entryInsideExitCone(offsetYears: number, separationLy: number): boolean {
  const { entry, exit } = entryAndExitEvents(0, offsetYears, separationLy)
  return classifyEventPair(exit, entry) === 'reachable'
}

// The smallest speed that gives a closed path for a trip of T years and a separation d: offset(beta) > d, i.e. 1 - sqrt(1 - beta^2) > d / T, so beta > sqrt(1 - (1 - d / T)^2).
// Returns null if d >= T (even a clock stopped altogether, an offset of T, would not exceed d). The speed returned is the boundary, where the offset only equals d (not yet closed).
export function smallestSpeedForClosedPath(tripYears: number, separationLy: number): number | null {
  checkPositive(tripYears, 'The trip time')
  checkPositive(separationLy, 'The separation')
  if (separationLy >= tripYears) return null
  const keep = 1 - separationLy / tripYears
  return Math.sqrt(1 - keep * keep)
}

// How long (in the stay-at-home frame) a mouth moving at beta needs for its offset to reach `offsetYears`, if the offset builds up at the steady rate 1 - sqrt(1 - beta^2) per year.
// A statement about the build-up only: the specification does not model the chronology horizon's exact time, since the outside distance changes during the trip.
export function timeForOffsetToReach(beta: number, offsetYears: number): number {
  checkSpeed(beta)
  checkPositive(offsetYears, 'The offset')
  if (beta === 0) throw new RangeError('A mouth at rest never builds up an offset.')
  return offsetYears / (1 - Math.sqrt(1 - beta * beta))
}

// ---- Answers and buttons ----
export interface YearsChoice {
  id: string
  years: number
  label: string
}
// Prediction 1: the moving mouth's own clock after the preset trip (answer 6 years).
export const CLOCK_CHOICES: readonly YearsChoice[] = [
  { id: '10', years: 10, label: '10 years' },
  { id: '8', years: 8, label: '8 years' },
  { id: '6', years: 6, label: '6 years' },
  { id: '4', years: 4, label: '4 years' },
  { id: '2', years: 2, label: '2 years' },
]

export function nearestChoice<T>(choices: readonly T[], value: number, valueOf: (c: T) => number): T {
  let best = choices[0]
  for (const c of choices) if (Math.abs(valueOf(c) - value) < Math.abs(valueOf(best) - value)) best = c
  return best
}

export function predictionOneAnswerId(): string {
  return nearestChoice(CLOCK_CHOICES, movingClockYears(PRESET_SPEED, PRESET_TRIP_YEARS), (c) => c.years).id
}
// Prediction 2: do they get back before they left? A yes or no has no size, so a marker is drawn.
export const BEFORE_CHOICES = [
  { id: 'yes', label: 'Yes, they get back before they left', before: true },
  { id: 'no', label: 'No, they get back after they left', before: false },
] as const
export type BeforeChoiceId = (typeof BEFORE_CHOICES)[number]['id']
export function predictionTwoAnswerId(): BeforeChoiceId {
  return predictionTwoAnswer() ? 'yes' : 'no'
}
// Prediction 2: do they get back before they left (the preset speed, trip and separation)? Answer: yes.
export function predictionTwoAnswer(): boolean {
  return closedPathExists(clockOffsetYears(PRESET_SPEED, PRESET_TRIP_YEARS), PRESET_SEPARATION_LY)
}

// ---- The controls (trial values) ----
export const SPEED_CHOICES: readonly number[] = [0.1, 0.5, 0.8, 0.9, 0.99]
export const SEPARATION_CHOICES_LY: readonly { id: string; ly: number; label: string }[] = [
  { id: 'day', ly: 1 / 365.25, label: '1 light-day' },
  { id: '1', ly: 1, label: '1 light-year' },
  { id: '3', ly: 3, label: '3 light-years' },
  { id: '5', ly: 5, label: '5 light-years' },
]

// ---- The pictures (every number drawn or written is read from here; CLAUDE.md §9) ----
// The entry moment on A's clock for the drawn closed path. Any moment gives the same time gained; 5 years is chosen so that the exit (5 - offset) is after the machine's start at 0.
export const PICTURE_ENTRY_TIME_YEARS = 5

// Picture 1: the trip of mouth B and where the two clocks end up. B travels at a steady speed, out and back, and stops `separationLy` from A. The farthest point from A is
// (v T + d) / 2 (out for (T + d/v)/2 years, back for the rest), so the turn-around is drawn at that distance. The turning itself is not modelled.
export function pictureOne() {
  const speed = PRESET_SPEED
  const tripYears = PRESET_TRIP_YEARS
  const separationLy = PRESET_SEPARATION_LY
  const movingYears = movingClockYears(speed, tripYears)
  return {
    speed,
    tripYears,
    separationLy,
    stayAtHomeYears: tripYears,
    movingYears,
    offsetYears: tripYears - movingYears,
    farthestLy: (speed * tripYears + separationLy) / 2,
    outYears: (tripYears + separationLy / speed) / 2,
  }
}

// What a guess for Prediction 1 means on B's clock ruler: the number of years on the button.
export function clockGuessYears(id: string): number {
  const choice = CLOCK_CHOICES.find((c) => c.id === id)
  if (!choice) throw new RangeError('Unknown choice.')
  return choice.years
}

// Picture 2: the spacetime diagram of the closed path, in the common frame (position in light-years, time in years of A's clock). Mouth A is at position 0 and mouth B at position d.
// The traveller steps into B at the entry moment, comes out of A `offset` years earlier, runs outside to B at the speed of light (the best case) and arrives `separation` years later.
export function pictureTwo() {
  const one = pictureOne()
  const offsetYears = one.offsetYears
  const separationLy = one.separationLy
  const { entry, exit } = entryAndExitEvents(PICTURE_ENTRY_TIME_YEARS, offsetYears, separationLy)
  const arrival = { time: exit.time + separationLy, position: separationLy }
  return {
    separationLy,
    offsetYears,
    entry,
    exit,
    arrival,
    timeGainedYears: entry.time - arrival.time,
    closed: closedPathExists(offsetYears, separationLy),
    entryInsideExitCone: entryInsideExitCone(offsetYears, separationLy),
  }
}

// What a guess for Prediction 2 is drawn as: only a marker, since a yes or no has no size.
export function beforeGuessMarker(id: string): { before: boolean } {
  const choice = BEFORE_CHOICES.find((c) => c.id === id)
  if (!choice) throw new RangeError('Unknown choice.')
  return { before: choice.before }
}

// Picture 3: the two numbers whose comparison decides it, and the time gained.
export function pictureThree() {
  const one = pictureOne()
  return {
    offsetYears: one.offsetYears,
    lightTravelYears: one.separationLy,
    timeGainedYears: timeGainedYears(one.offsetYears, one.separationLy),
    closed: closedPathExists(one.offsetYears, one.separationLy),
  }
}
