import { OBJECT_PRESETS, horizonRadiusKm } from './blackHoleSizeExperiment'
import type { ObjectPreset } from './blackHoleSizeExperiment'

// A thin beam of light passing a non-rotating, uncharged black hole, in the equatorial plane, in the exact theory of
// gravity. Distances are in horizon radii (r_s = 1), so with u = 1/r and phi the angle swept around the black hole the
// path of the light obeys
//   u'' = -u + 1.5 u^2
// starting very far away (u = 0) with u' = 1 / b, where b is the aim distance: how close to the center the light would
// pass if gravity did nothing. This is standard general relativity for this case and is given, not derived. The path is
// computed by stepping it in equal steps of the angle (fourth-order Runge-Kutta), so the same calculation gives a small
// bend, a swing around the black hole, and a capture.
//
// The light starts on the +x axis (phi = 0, far away) and sweeps counterclockwise; its incoming straight line, were
// gravity to do nothing, is the line y = b. The total bend is the angle swept minus half a turn.

export const STEPS_PER_TURN = 720
export const MIN_AIM_IN_HORIZON_RADII = 1 // aimed at the horizon's edge
export const MAX_AIM_IN_HORIZON_RADII = 20
// The circular light orbit, 3GM/c^2 = 1.5 horizon radii (given, not derived). It does not last.
export const PHOTON_SPHERE_IN_HORIZON_RADII = 1.5
// The critical aim distance, 3 sqrt(3) / 2 horizon radii (given, not derived): light aimed closer is captured.
export const CRITICAL_AIM_IN_HORIZON_RADII = (3 * Math.sqrt(3)) / 2

// A guard against an aim so close to the critical distance that the light winds more than this many turns.
const MAX_TURNS = 50

// The three black holes only (Experiment 1's presets that have no real radius).
export const BLACK_HOLE_PRESETS: ObjectPreset[] = OBJECT_PRESETS.filter((p) => p.realRadiusKm === null)

export type LightOutcome = 'escapes' | 'captured'

export interface LightPoint {
  phi: number // radians swept so far
  distanceInHorizonRadii: number
  x: number // in horizon radii, seen from above
  y: number
  // du/dphi with u = 1/r in horizon radii; kept so the conserved quantity can be checked.
  duDphi: number
}

export interface LightPath {
  outcome: LightOutcome
  bendRadians: number | null // the total bend if it escapes; null if captured
  turnsAround: number // the angle swept around the black hole in turns: 0.5 plus the bend, in turns, if it escapes
  closestInHorizonRadii: number // closest approach, or 1 if captured
  // From the first step after "very far away" to the end. The first point is already many horizon radii away; the
  // picture draws the part inside its view.
  points: LightPoint[]
}

// The simple formula of Gravity Experiment 8 in horizon radii: the bend is 2 / aim, in radians. It is for weak gravity.
export function weakFieldBendRadians(aimInHorizonRadii: number): number {
  if (!(aimInHorizonRadii > 0) || !Number.isFinite(aimInHorizonRadii)) {
    throw new RangeError('The aim distance must be greater than zero.')
  }
  return 2 / aimInHorizonRadii
}

const accel = (u: number) => -u + 1.5 * u * u

// The path of a beam of light aimed to pass the center at the given distance (in horizon radii) if gravity did nothing.
export function lightPath(aimInHorizonRadii: number): LightPath {
  if (!(aimInHorizonRadii > 0) || !Number.isFinite(aimInHorizonRadii)) {
    throw new RangeError('The aim distance must be greater than zero.')
  }

  const dphi = (2 * Math.PI) / STEPS_PER_TURN
  const totalSteps = MAX_TURNS * STEPS_PER_TURN

  let u = 0
  let w = 1 / aimInHorizonRadii // du/dphi
  let phi = 0

  const toPoint = (uValue: number, wValue: number, angle: number): LightPoint => {
    const distance = 1 / uValue
    return { phi: angle, distanceInHorizonRadii: distance, x: distance * Math.cos(angle), y: distance * Math.sin(angle), duDphi: wValue }
  }

  const points: LightPoint[] = []
  let highestU = 0

  for (let step = 0; step < totalSteps; step++) {
    const k1u = w
    const k1w = accel(u)
    const k2u = w + (dphi / 2) * k1w
    const k2w = accel(u + (dphi / 2) * k1u)
    const k3u = w + (dphi / 2) * k2w
    const k3w = accel(u + (dphi / 2) * k2u)
    const k4u = w + dphi * k3w
    const k4w = accel(u + dphi * k3u)
    const uNext = u + (dphi / 6) * (k1u + 2 * k2u + 2 * k3u + k4u)
    const wNext = w + (dphi / 6) * (k1w + 2 * k2w + 2 * k3w + k4w)

    if (uNext >= 1) {
      // The light reached the horizon during this step: end the path exactly there.
      const fraction = (1 - u) / (uNext - u)
      const wAtHorizon = w + fraction * (wNext - w)
      const end = phi + fraction * dphi
      points.push(toPoint(1, wAtHorizon, end))
      return { outcome: 'captured', bendRadians: null, turnsAround: end / (2 * Math.PI), closestInHorizonRadii: 1, points }
    }

    if (uNext <= 0) {
      // The light is far away again: the angle at which u returns to zero, found by interpolating this step.
      const end = phi + (u / (u - uNext)) * dphi
      return {
        outcome: 'escapes',
        bendRadians: end - Math.PI,
        turnsAround: end / (2 * Math.PI),
        closestInHorizonRadii: 1 / highestU,
        points,
      }
    }

    u = uNext
    w = wNext
    phi += dphi
    points.push(toPoint(u, w, phi))
    if (u > highestU) highestU = u
  }

  throw new Error('The light wound around the black hole too many times to follow.')
}

export interface LightNearBlackHoleResult {
  preset: ObjectPreset
  horizonRadiusKm: number
  aimInHorizonRadii: number
  aimKm: number
  criticalAimKm: number
  photonSphereKm: number
  path: LightPath
  weakFieldBendRadians: number
}

export function runLightNearBlackHoleExperiment(
  presetId: ObjectPreset['id'],
  aimInHorizonRadii: number,
): LightNearBlackHoleResult {
  const preset = BLACK_HOLE_PRESETS.find((p) => p.id === presetId)
  if (!preset) throw new Error(`Unknown black hole: ${presetId}`)
  if (!(aimInHorizonRadii >= MIN_AIM_IN_HORIZON_RADII && aimInHorizonRadii <= MAX_AIM_IN_HORIZON_RADII)) {
    throw new RangeError(`The aim must be between ${MIN_AIM_IN_HORIZON_RADII} and ${MAX_AIM_IN_HORIZON_RADII} horizon radii.`)
  }

  const horizon = horizonRadiusKm(preset.massSolarMasses)
  return {
    preset,
    horizonRadiusKm: horizon,
    aimInHorizonRadii,
    aimKm: aimInHorizonRadii * horizon,
    criticalAimKm: CRITICAL_AIM_IN_HORIZON_RADII * horizon,
    photonSphereKm: PHOTON_SPHERE_IN_HORIZON_RADII * horizon,
    path: lightPath(aimInHorizonRadii),
    weakFieldBendRadians: weakFieldBendRadians(aimInHorizonRadii),
  }
}

let curveCache: Array<{ aim: number; bendRadians: number }> | null = null

// The exact bend at many aim distances from the critical aim to the largest aim, from the same calculation, for the
// graph. The spacing is geometric in (aim - critical aim), so the steep rise near the critical aim is drawn finely.
export function bendCurve(): Array<{ aim: number; bendRadians: number }> {
  if (curveCache) return curveCache
  const count = 160
  const widest = MAX_AIM_IN_HORIZON_RADII - CRITICAL_AIM_IN_HORIZON_RADII
  const narrowest = 0.0005
  const curve: Array<{ aim: number; bendRadians: number }> = []
  for (let i = 0; i < count; i++) {
    const offset = narrowest * (widest / narrowest) ** (1 - i / (count - 1)) // from the widest (i = 0) down to the narrowest
    const aim = CRITICAL_AIM_IN_HORIZON_RADII + offset
    const bend = lightPath(aim).bendRadians
    if (bend !== null) curve.push({ aim, bendRadians: bend })
  }
  curveCache = curve
  return curve
}

// ---------------------------------------------------------------------------------------------------------------
// Audit update (Black Holes 4): numbers for the white guess marks, the fixed Part 1 run (a beam aimed at 5 horizon
// radii and one aimed at 2.6), the check-up, and the comparisons and worked-math numbers the interface and tutor used
// to work out or type themselves. No function here reads a prediction; the guess functions take the guess as an
// argument and only describe it or mark it. Every existing export above is unchanged (Cosmic Horizons 21 imports
// CRITICAL_AIM_IN_HORIZON_RADII).
// ---------------------------------------------------------------------------------------------------------------

export const KM_PER_AU = 149_597_870.7
export const GRAPH_MAX_DEGREES = 400
export const DEGREES_PER_RADIAN = 180 / Math.PI

// Part 1 always runs the 10-Sun black hole: a beam aimed at 5 horizon radii (guess 1) and one aimed at 2.6 (guess 3).
export const PART_ONE_BLACK_HOLE_ID: ObjectPreset['id'] = 'stellar-black-hole'
export const PART_ONE_FIVE_AIM_IN_HORIZON_RADII = 5
export const PART_ONE_JUST_OUTSIDE_AIM_IN_HORIZON_RADII = 2.6

export interface PartOneRun {
  five: LightNearBlackHoleResult
  justOutside: LightNearBlackHoleResult
}
export function runPartOne(): PartOneRun {
  return {
    five: runLightNearBlackHoleExperiment(PART_ONE_BLACK_HOLE_ID, PART_ONE_FIVE_AIM_IN_HORIZON_RADII),
    justOutside: runLightNearBlackHoleExperiment(PART_ONE_BLACK_HOLE_ID, PART_ONE_JUST_OUTSIDE_AIM_IN_HORIZON_RADII),
  }
}

// How far a path picture reaches, in horizon radii: ZOOM_MARGIN times the larger of the aim and the critical aim, and
// never less than MIN_VIEW_RADIUS (the picture was drawn this way before the audit; the number now lives here).
export const ZOOM_MARGIN = 1.25
export const MIN_VIEW_RADIUS_IN_HORIZON_RADII = 4
export function viewRadiusInHorizonRadii(aimInHorizonRadii: number): number {
  return Math.max(ZOOM_MARGIN * Math.max(aimInHorizonRadii, CRITICAL_AIM_IN_HORIZON_RADII), MIN_VIEW_RADIUS_IN_HORIZON_RADII)
}

// ---- Guess 1: a beam aimed at 5 horizon radii ----
export type BendChoice = 'straight' | 'bent' | 'captured'
// "Barely changed" is marked when the exact bend is under this many degrees. The page's own marking choice, not a
// physical limit: at an aim of 5 the bend is far above it, and any value from 1 up to about 30 marks the same answer.
export const BARELY_CHANGED_BELOW_DEGREES = 1
export function modelBendAnswer(): BendChoice {
  const path = lightPath(PART_ONE_FIVE_AIM_IN_HORIZON_RADII)
  if (path.outcome === 'captured') return 'captured'
  return (path.bendRadians as number) * DEGREES_PER_RADIAN < BARELY_CHANGED_BELOW_DEGREES ? 'straight' : 'bent'
}
export function bendGuessIsModelAnswer(guess: BendChoice): boolean {
  return guess === modelBendAnswer()
}

// ---- Guess 2: how close light must be aimed to be captured ----
export type CaptureChoice = 'horizon' | 'critical' | 'ten'
// The distance each choice names (the question's own words: 1, "about 2.6", "about 10").
export const GUESSED_CAPTURE_AIM_IN_HORIZON_RADII: Record<CaptureChoice, number> = { horizon: 1, critical: 2.6, ten: 10 }
export function guessedCaptureAimInHorizonRadii(guess: CaptureChoice): number {
  return GUESSED_CAPTURE_AIM_IN_HORIZON_RADII[guess]
}
// True if the guessed ring lies beyond what a picture reaches, so the page draws an arrow at its edge instead.
export function captureGuessIsOffView(guess: CaptureChoice, viewInHorizonRadii: number): boolean {
  return guessedCaptureAimInHorizonRadii(guess) > viewInHorizonRadii
}
// The choice nearest to the critical aim: no cut-off is used, only which named distance is closest.
export function modelCaptureAnswer(): CaptureChoice {
  const choices = Object.keys(GUESSED_CAPTURE_AIM_IN_HORIZON_RADII) as CaptureChoice[]
  return choices.reduce((best, choice) =>
    Math.abs(guessedCaptureAimInHorizonRadii(choice) - CRITICAL_AIM_IN_HORIZON_RADII) <
    Math.abs(guessedCaptureAimInHorizonRadii(best) - CRITICAL_AIM_IN_HORIZON_RADII)
      ? choice
      : best,
  )
}
export function captureGuessIsModelAnswer(guess: CaptureChoice): boolean {
  return guess === modelCaptureAnswer()
}

// ---- Guess 3: aimed only a little farther out than the capture distance ----
export type JustOutsideChoice = 'small-bend' | 'swings' | 'captured-anyway'
// "Swings right round" is the question's own words: a bend of more than 180 degrees.
export const SWING_ROUND_ABOVE_DEGREES = 180
export function modelJustOutsideAnswer(): JustOutsideChoice {
  const path = lightPath(PART_ONE_JUST_OUTSIDE_AIM_IN_HORIZON_RADII)
  if (path.outcome === 'captured') return 'captured-anyway'
  return (path.bendRadians as number) * DEGREES_PER_RADIAN > SWING_ROUND_ABOVE_DEGREES ? 'swings' : 'small-bend'
}
export function justOutsideGuessIsModelAnswer(guess: JustOutsideChoice): boolean {
  return guess === modelJustOutsideAnswer()
}

// ---- Where an outcome guess is drawn on the graph (a marker, not a number the learner chose) ----
// Guesses 1 and 3 are outcomes, so they have no height of their own. Each answer gets a band of the graph and the white
// marker sits at the middle of it; a guess of "captured" has no height at all and is drawn inside the rose area.
export interface GraphMarker {
  aimInHorizonRadii: number // where along the axis the guess is about
  band: { fromDegrees: number; toDegrees: number } | null // null: drawn in the captured (rose) area
  markerDegrees: number | null
}
const marker = (aim: number, from: number, to: number): GraphMarker => ({
  aimInHorizonRadii: aim,
  band: { fromDegrees: from, toDegrees: to },
  markerDegrees: (from + to) / 2,
})
const capturedMarker = (aim: number): GraphMarker => ({ aimInHorizonRadii: aim, band: null, markerDegrees: null })
export function bendGuessGraphMarker(guess: BendChoice): GraphMarker {
  const aim = PART_ONE_FIVE_AIM_IN_HORIZON_RADII
  if (guess === 'straight') return marker(aim, 0, BARELY_CHANGED_BELOW_DEGREES)
  if (guess === 'bent') return marker(aim, BARELY_CHANGED_BELOW_DEGREES, SWING_ROUND_ABOVE_DEGREES)
  return capturedMarker(aim)
}
export function justOutsideGuessGraphMarker(guess: JustOutsideChoice): GraphMarker {
  const aim = PART_ONE_JUST_OUTSIDE_AIM_IN_HORIZON_RADII
  if (guess === 'small-bend') return marker(aim, 0, SWING_ROUND_ABOVE_DEGREES)
  if (guess === 'swings') return marker(aim, SWING_ROUND_ABOVE_DEGREES, GRAPH_MAX_DEGREES)
  return capturedMarker(aim)
}

// ---- Comparisons the interface and tutor used to work out themselves ----
export function bendDegrees(path: LightPath): number | null {
  return path.bendRadians === null ? null : path.bendRadians * DEGREES_PER_RADIAN
}
export function weakFieldBendDegrees(aimInHorizonRadii: number): number {
  return weakFieldBendRadians(aimInHorizonRadii) * DEGREES_PER_RADIAN
}
// How much larger the exact bend is than the simple formula's: as a percent up to twice as large, as a multiple beyond.
export type LargerThanSimple = { kind: 'percent'; value: number } | { kind: 'times'; value: number }
export function largerThanSimple(exactRadians: number, simpleRadians: number): LargerThanSimple {
  const ratio = exactRadians / simpleRadians
  return ratio < 2 ? { kind: 'percent', value: (ratio - 1) * 100 } : { kind: 'times', value: ratio }
}

// The checks the Results and the tutor make at fixed aims (the same aims the sentences name).
export const ANSWER_CHECK_AIMS = { five: 5, ten: 10, two: 2, insideCritical: 2.5, outsideCritical: 2.7, justOutside: 2.6 } as const
export function answerCheckPaths() {
  return {
    five: lightPath(ANSWER_CHECK_AIMS.five),
    ten: lightPath(ANSWER_CHECK_AIMS.ten),
    two: lightPath(ANSWER_CHECK_AIMS.two),
    insideCritical: lightPath(ANSWER_CHECK_AIMS.insideCritical),
    outsideCritical: lightPath(ANSWER_CHECK_AIMS.outsideCritical),
    justOutside: lightPath(ANSWER_CHECK_AIMS.justOutside),
  }
}

// ---- The simple math, worked (numbers the Results used to type) ----
export const SQRT_3 = Math.sqrt(3)
export const THREE_SQRT_3 = 3 * Math.sqrt(3)
export function criticalAimWorked() {
  return { sqrt3: SQRT_3, threeSqrt3: THREE_SQRT_3, criticalInHorizonRadii: THREE_SQRT_3 / 2 }
}
export function weakFieldWorked(aimInHorizonRadii: number) {
  const radians = weakFieldBendRadians(aimInHorizonRadii)
  return { radians, degreesPerRadian: DEGREES_PER_RADIAN, degrees: radians * DEGREES_PER_RADIAN }
}

// ---- Table 2: the two Part 1 beams ----
export interface BeamRow {
  aimInHorizonRadii: number
  aimKm: number
  outcome: LightOutcome
  bendDegrees: number | null
  simpleDegrees: number
  larger: LargerThanSimple | null
  turnsAround: number
  closestInHorizonRadii: number
}
export function beamRow(result: LightNearBlackHoleResult): BeamRow {
  const path = result.path
  return {
    aimInHorizonRadii: result.aimInHorizonRadii,
    aimKm: result.aimKm,
    outcome: path.outcome,
    bendDegrees: bendDegrees(path),
    simpleDegrees: result.weakFieldBendRadians * DEGREES_PER_RADIAN,
    larger: path.bendRadians === null ? null : largerThanSimple(path.bendRadians, result.weakFieldBendRadians),
    turnsAround: path.turnsAround,
    closestInHorizonRadii: path.closestInHorizonRadii,
  }
}
export function partOneRows(): BeamRow[] {
  const run = runPartOne()
  return [beamRow(run.five), beamRow(run.justOutside)]
}

// ---- Table 4: the critical aim for each black hole, in km and AU ----
export interface CriticalAimRow {
  preset: ObjectPreset
  horizonRadiusKm: number
  criticalAimKm: number
  criticalAimAu: number
  photonSphereKm: number
}
export function criticalAimRows(): CriticalAimRow[] {
  return BLACK_HOLE_PRESETS.map((preset) => {
    const horizon = horizonRadiusKm(preset.massSolarMasses)
    const critical = CRITICAL_AIM_IN_HORIZON_RADII * horizon
    return { preset, horizonRadiusKm: horizon, criticalAimKm: critical, criticalAimAu: critical / KM_PER_AU, photonSphereKm: PHOTON_SPHERE_IN_HORIZON_RADII * horizon }
  })
}

// ---- The check-up: a plain reading of one number against a reference; no cut-offs ----
export type Reading = 'the same' | 'more' | 'less'
export function readAgainst(found: number, reference: number): Reading {
  if (Math.abs(found - reference) <= 1e-9 * Math.max(Math.abs(reference), 1e-300)) return 'the same'
  return found > reference ? 'more' : 'less'
}
// "The same" once both are rounded to the same number of decimals (the way they are printed), otherwise more or less.
export function readAgainstRounded(found: number, reference: number, decimals: number): Reading {
  const round = (x: number) => Number(x.toFixed(decimals))
  if (round(found) === round(reference)) return 'the same'
  return found > reference ? 'more' : 'less'
}
export function percentAbove(found: number, reference: number): number {
  return (found / reference - 1) * 100
}

// The aim at which this model's calculation changes from captured to escaping, found by halving the gap between an aim
// that is captured and one that escapes. Not read from the formula 3 sqrt(3) / 2, so the two can be compared.
export function modelCaptureBoundaryInHorizonRadii(): number {
  let captured = 2.5
  let escapes = 2.7
  for (let i = 0; i < 24; i++) {
    const middle = (captured + escapes) / 2
    if (lightPath(middle).outcome === 'captured') captured = middle
    else escapes = middle
  }
  return (captured + escapes) / 2
}

// The aim at which the check-up compares the simple formula with the exact bend. It is beyond the controls (which stop
// at MAX_AIM_IN_HORIZON_RADII), because at 20 the simple formula is still about 8% low.
export const CHECK_UP_FAR_AIM_IN_HORIZON_RADII = 100

export interface LightCheckUpRow {
  what: string
  expected: number
  found: number
  unit: string
  reading: Reading
  // How far above the reference the found number is, in percent (not a cut-off, only the gap).
  percentAbove: number
}
// Each row's reference is a formula the model is built from; none is a measurement.
export function checkUpRows(): LightCheckUpRow[] {
  const far = lightPath(CHECK_UP_FAR_AIM_IN_HORIZON_RADII)
  const farSimple = weakFieldBendDegrees(CHECK_UP_FAR_AIM_IN_HORIZON_RADII)
  const farExact = bendDegrees(far) as number
  const boundary = modelCaptureBoundaryInHorizonRadii()
  const justOutside = lightPath(PART_ONE_JUST_OUTSIDE_AIM_IN_HORIZON_RADII)
  return [
    {
      what: `The bend at an aim of ${CHECK_UP_FAR_AIM_IN_HORIZON_RADII}: the simple formula 2 ÷ b against the exact theory`,
      expected: farSimple,
      found: farExact,
      unit: 'degrees',
      reading: readAgainst(farExact, farSimple),
      percentAbove: percentAbove(farExact, farSimple),
    },
    {
      what: 'The critical aim: the formula 3√3 ÷ 2 against where this model changes from escaping to captured',
      expected: CRITICAL_AIM_IN_HORIZON_RADII,
      found: boundary,
      unit: 'horizon radii',
      reading: readAgainstRounded(boundary, CRITICAL_AIM_IN_HORIZON_RADII, 3),
      percentAbove: percentAbove(boundary, CRITICAL_AIM_IN_HORIZON_RADII),
    },
    {
      what: `Where light can circle (1.5): against the closest approach of a beam aimed at ${PART_ONE_JUST_OUTSIDE_AIM_IN_HORIZON_RADII}`,
      expected: PHOTON_SPHERE_IN_HORIZON_RADII,
      found: justOutside.closestInHorizonRadii,
      unit: 'horizon radii',
      reading: readAgainst(justOutside.closestInHorizonRadii, PHOTON_SPHERE_IN_HORIZON_RADII),
      percentAbove: percentAbove(justOutside.closestInHorizonRadii, PHOTON_SPHERE_IN_HORIZON_RADII),
    },
  ]
}
