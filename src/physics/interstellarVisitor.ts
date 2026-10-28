// Frontier and Beyond Experiment 24: A visitor from another star (3I/ATLAS). The Sun's pull alone, on a body that comes from far away: its speed at any distance, the escape speed, the
// eccentricity of its path and the total bend. Physics only: no React or browser code (CLAUDE.md §9). The model is the two-body problem (a point body in the Sun's gravity); it leaves out
// the planets, the comet's own gas and relativity. Every formula is a standard two-body result, worked by hand and by a separate script on 2026-10-28 (to be checked at a source).
import { ASTRONOMICAL_UNIT, SUN } from './fastestSpacecraft'

export const GM_SUN = SUN.gm // m^3/s^2
export const AU = ASTRONOMICAL_UNIT // m
const RAD_TO_DEG = 180 / Math.PI

function checkPositive(x: number, what: string): void {
  if (!Number.isFinite(x) || x <= 0) throw new RangeError(`${what} must be above zero.`)
}

// ---- The real object and its comparison objects ----

// 3I/ATLAS: the published eccentricity and closest approach (Wikipedia's orbit table, 6.14135 +/- 0.00002 and 1.35645 AU; the discovery paper's abstract, arXiv:2507.02757, gives e ~ 6.1, q ~ 1.36 AU,
// V-infinity ~ 58 km/s, inclination ~ 175 degrees). The speed far away is derived from these (below), not held.
export const ATLAS_3I = {
  name: '3I/ATLAS',
  eccentricity: 6.14135,
  closestApproachAu: 1.35645,
  inclinationDegrees: 175.12,
  publishedSpeedFarAwayKmS: 58,
  discoveryDate: '2025-07-01',
  closestApproachDate: '2025-10-29',
} as const

// The two earlier interstellar objects, from rounded values on the Wikipedia page (the primary values were not read): eccentricity and speed far away.
export const OUMUAMUA_1I = { name: '1I/ʻOumuamua', eccentricity: 1.2, publishedSpeedFarAwayKmS: 26 } as const
export const BORISOV_2I = { name: '2I/Borisov', eccentricity: 3.4, publishedSpeedFarAwayKmS: 32 } as const

// ---- The two-body formulas (SI units; speeds in m/s, distances in m) ----

// Speed far from the Sun, from the eccentricity and the closest approach: v_inf = sqrt((e - 1) GM / q).
export function speedFarAway(eccentricity: number, closestApproachM: number): number {
  if (!Number.isFinite(eccentricity) || eccentricity <= 1) throw new RangeError('An open path needs an eccentricity above 1.')
  checkPositive(closestApproachM, 'The closest approach')
  return Math.sqrt(((eccentricity - 1) * GM_SUN) / closestApproachM)
}

// Eccentricity from the speed far away and the closest approach: e = 1 + q v_inf^2 / GM.
export function eccentricityFrom(speedFarAwayMs: number, closestApproachM: number): number {
  checkPositive(speedFarAwayMs, 'The speed far away')
  checkPositive(closestApproachM, 'The closest approach')
  return 1 + (closestApproachM * speedFarAwayMs ** 2) / GM_SUN
}

// Speed at distance r (energy conservation): v = sqrt(v_inf^2 + 2 GM / r).
export function speedAt(speedFarAwayMs: number, distanceM: number): number {
  if (!Number.isFinite(speedFarAwayMs) || speedFarAwayMs < 0) throw new RangeError('The speed far away must be zero or more.')
  checkPositive(distanceM, 'The distance')
  return Math.sqrt(speedFarAwayMs ** 2 + (2 * GM_SUN) / distanceM)
}

// Escape speed at distance r: sqrt(2 GM / r).
export function escapeSpeed(distanceM: number): number {
  checkPositive(distanceM, 'The distance')
  return Math.sqrt((2 * GM_SUN) / distanceM)
}

// Total bend of the path, in degrees, from the direction it comes in from to the direction it leaves in: 2 arcsin(1 / e).
export function bendDegrees(eccentricity: number): number {
  if (!Number.isFinite(eccentricity) || eccentricity <= 1) throw new RangeError('An open path needs an eccentricity above 1.')
  return 2 * Math.asin(1 / eccentricity) * RAD_TO_DEG
}

// The hyperbola, from the Sun at one focus: r(theta) = q (1 + e) / (1 + e cos theta), theta measured from the closest approach.
export function pathDistance(eccentricity: number, closestApproachM: number, thetaRadians: number): number {
  if (!Number.isFinite(eccentricity) || eccentricity <= 1) throw new RangeError('An open path needs an eccentricity above 1.')
  checkPositive(closestApproachM, 'The closest approach')
  return (closestApproachM * (1 + eccentricity)) / (1 + eccentricity * Math.cos(thetaRadians))
}

// The angle (degrees, either side of the closest approach) at which the path goes to infinity: arccos(-1 / e). The path sweeps twice this, 180 degrees plus the bend.
export function asymptoteAngleDegrees(eccentricity: number): number {
  if (!Number.isFinite(eccentricity) || eccentricity <= 1) throw new RangeError('An open path needs an eccentricity above 1.')
  return Math.acos(-1 / eccentricity) * RAD_TO_DEG
}

// ---- 3I/ATLAS, in SI units ----

export function atlasClosestApproachM(): number {
  return ATLAS_3I.closestApproachAu * AU
}
export function atlasSpeedFarAway(): number {
  return speedFarAway(ATLAS_3I.eccentricity, atlasClosestApproachM())
}
export function atlasSpeedAtClosestApproach(): number {
  return speedAt(atlasSpeedFarAway(), atlasClosestApproachM())
}
export function atlasEscapeSpeedAtClosestApproach(): number {
  return escapeSpeed(atlasClosestApproachM())
}
// How many times the escape speed the object is going at its closest approach.
export function atlasSpeedOverEscape(): number {
  return atlasSpeedAtClosestApproach() / atlasEscapeSpeedAtClosestApproach()
}
export function atlasBendDegrees(): number {
  return bendDegrees(ATLAS_3I.eccentricity)
}

// ---- Trial values (the controls, Step 5): a speed far away and a closest approach chosen by the learner ----

export const TRIAL_SPEEDS_KM_S = [5, 26, 58, 100] as const
export const TRIAL_CLOSEST_AU = [0.3, 1.356, 3] as const

export interface TrialOrbit {
  speedFarAwayKmS: number
  closestApproachAu: number
  eccentricity: number
  bendDegrees: number
  speedAtClosestKmS: number
  escapeSpeedAtClosestKmS: number
  speedOverEscape: number
}

export function trialOrbit(speedFarAwayKmS: number, closestApproachAu: number): TrialOrbit {
  const v = speedFarAwayKmS * 1e3
  const q = closestApproachAu * AU
  const e = eccentricityFrom(v, q)
  return {
    speedFarAwayKmS,
    closestApproachAu,
    eccentricity: e,
    bendDegrees: bendDegrees(e),
    speedAtClosestKmS: speedAt(v, q) / 1e3,
    escapeSpeedAtClosestKmS: escapeSpeed(q) / 1e3,
    speedOverEscape: speedAt(v, q) / escapeSpeed(q),
  }
}

// ---- The predictions ----

export function nearestOnLogScale<T>(choices: readonly T[], value: number, valueOf: (c: T) => number): T {
  let best = choices[0]
  for (const c of choices) {
    if (Math.abs(Math.log(valueOf(c)) - Math.log(value)) < Math.abs(Math.log(valueOf(best)) - Math.log(value))) best = c
  }
  return best
}

// Prediction 1: the total bend of 3I/ATLAS's path. Buttons on a log scale, in degrees.
export const BEND_CHOICES = [
  { id: 'b2', label: 'about 2 degrees', degrees: 2 },
  { id: 'b6', label: 'about 6 degrees', degrees: 6 },
  { id: 'b20', label: 'about 20 degrees', degrees: 20 },
  { id: 'b60', label: 'about 60 degrees', degrees: 60 },
  { id: 'b150', label: 'about 150 degrees', degrees: 150 },
] as const
export type BendChoiceId = (typeof BEND_CHOICES)[number]['id']

export function bendAnswer(): BendChoiceId {
  return nearestOnLogScale(BEND_CHOICES, atlasBendDegrees(), (c) => c.degrees).id
}
export function bendChoiceDegrees(id: BendChoiceId): number {
  return BEND_CHOICES.find((c) => c.id === id)!.degrees
}
// The tutor's mark (§12, §13): used in the explanation only.
export function bendGuessResult(id: BendChoiceId): 'matched' | 'not matched' {
  return id === bendAnswer() ? 'matched' : 'not matched'
}
// The marker for Picture 1: the guessed bend, in degrees (the white line leaves at this angle from the straight-on direction).
export function bendGuessMarker(id: BendChoiceId): { degrees: number } {
  return { degrees: bendChoiceDegrees(id) }
}

// Prediction 2: the speed at closest approach. Buttons in km/s: slower, the same as far away, a little faster, about twice and about four times as fast.
export const SPEED_CHOICES = [
  { id: 'v40', label: 'slower, about 40 km/s', kmS: 40 },
  { id: 'v58', label: 'the same, about 58 km/s', kmS: 58 },
  { id: 'v70', label: 'a little faster, about 70 km/s', kmS: 70 },
  { id: 'v115', label: 'about twice as fast, about 115 km/s', kmS: 115 },
  { id: 'v230', label: 'about four times as fast, about 230 km/s', kmS: 230 },
] as const
export type SpeedChoiceId = (typeof SPEED_CHOICES)[number]['id']

export function speedAnswer(): SpeedChoiceId {
  return nearestOnLogScale(SPEED_CHOICES, atlasSpeedAtClosestApproach() / 1e3, (c) => c.kmS).id
}
export function speedChoiceKmS(id: SpeedChoiceId): number {
  return SPEED_CHOICES.find((c) => c.id === id)!.kmS
}
export function speedGuessResult(id: SpeedChoiceId): 'matched' | 'not matched' {
  return id === speedAnswer() ? 'matched' : 'not matched'
}
export function speedGuessMarker(id: SpeedChoiceId): { kmS: number } {
  return { kmS: speedChoiceKmS(id) }
}

// ---- Pictures (Step 4): everything drawn is computed here, and the interface only draws it (CLAUDE.md §9) ----

// The mean distances of the planets drawn for scale in Picture 1, in AU (standard values; no source was read for the page).
export const PLANET_ORBITS_AU = [
  { name: 'Earth', au: 1 },
  { name: 'Mars', au: 1.524 },
  { name: 'Jupiter', au: 5.203 },
] as const

// Picture 1 shows the path out to this distance from the Sun, in AU.
export const PICTURE_VIEW_RADIUS_AU = 5.5

export interface PictureOne {
  eccentricity: number
  closestApproachAu: number
  bendDegrees: number
  asymptoteAngleDegrees: number
  viewRadiusAu: number
  // The path, in AU, with the Sun at the origin and the closest approach on the +x axis; it runs from the incoming end to the outgoing end, through the closest approach.
  path: { x: number; y: number }[]
  closestIndex: number
  // The direction of travel far away on the way in and on the way out, in degrees from the +x axis (anticlockwise). The bend is the angle from the first to the second.
  headingInDegrees: number
  headingOutDegrees: number
  planets: { name: string; au: number }[]
}

const PATH_SAMPLES_EACH_SIDE = 60

export function pictureOne(): PictureOne {
  const e = ATLAS_3I.eccentricity
  const q = ATLAS_3I.closestApproachAu
  const R = PICTURE_VIEW_RADIUS_AU
  // The angle at which the path reaches the view radius: q (1 + e) / (1 + e cos t) = R.
  const tView = Math.acos((q * (1 + e) / R - 1) / e)
  const path: { x: number; y: number }[] = []
  for (let i = -PATH_SAMPLES_EACH_SIDE; i <= PATH_SAMPLES_EACH_SIDE; i++) {
    const t = (i / PATH_SAMPLES_EACH_SIDE) * tView
    const r = (q * (1 + e)) / (1 + e * Math.cos(t))
    path.push({ x: r * Math.cos(t), y: r * Math.sin(t) })
  }
  const a = asymptoteAngleDegrees(e)
  return {
    eccentricity: e,
    closestApproachAu: q,
    bendDegrees: bendDegrees(e),
    asymptoteAngleDegrees: a,
    viewRadiusAu: R,
    path,
    closestIndex: PATH_SAMPLES_EACH_SIDE,
    headingInDegrees: 180 - a,
    headingOutDegrees: a,
    planets: PLANET_ORBITS_AU.map((p) => ({ name: p.name, au: p.au })),
  }
}

// Prediction 1's white line: it leaves the same point as the real path, turned from the way the object was heading by the guessed bend (anticlockwise, the same way as the real bend).
export function bendGuessHeadingDegrees(id: BendChoiceId): number {
  return pictureOne().headingInDegrees + bendChoiceDegrees(id)
}

// Picture 2: speed against distance from the Sun. Distances on a log ruler, speeds on a straight ruler.
export const DISTANCE_RULER_MIN_AU = 0.3
export const DISTANCE_RULER_MAX_AU = 100
export const DISTANCE_TICKS_AU = [0.3, 1, 3, 10, 30, 100] as const
export const SPEED_RULER_MAX_KM_S = 250
export const SPEED_TICKS_KM_S = [0, 50, 100, 150, 200, 250] as const

export function distanceRulerPosition(au: number): number {
  checkPositive(au, 'The distance')
  const pos = (Math.log10(au) - Math.log10(DISTANCE_RULER_MIN_AU)) / (Math.log10(DISTANCE_RULER_MAX_AU) - Math.log10(DISTANCE_RULER_MIN_AU))
  return Math.min(1, Math.max(0, pos))
}
export function speedRulerPosition(kmS: number): number {
  if (!Number.isFinite(kmS) || kmS < 0) throw new RangeError('The speed must be zero or more.')
  return Math.min(1, kmS / SPEED_RULER_MAX_KM_S)
}

export interface PictureTwo {
  speedFarAwayKmS: number
  closestApproachAu: number
  speedAtClosestKmS: number
  escapeSpeedAtClosestKmS: number
  speedOverEscape: number
  // The speed of 3I/ATLAS and the escape speed at distances from the ruler's two ends, in km/s.
  curve: { au: number; position: number; speedKmS: number; speedPosition: number; escapeKmS: number; escapePosition: number }[]
  closestPosition: number
  speedAtClosestPosition: number
  escapeAtClosestPosition: number
  speedFarAwayPosition: number
  // How much faster than its speed far away it is at closest approach, as a share (0.18 is 18 percent).
  gainShare: number
}

const CURVE_SAMPLES = 60

export function pictureTwo(): PictureTwo {
  const vFar = atlasSpeedFarAway()
  const q = atlasClosestApproachM()
  const curve: PictureTwo['curve'] = []
  for (let i = 0; i <= CURVE_SAMPLES; i++) {
    const au = 10 ** (Math.log10(DISTANCE_RULER_MIN_AU) + (i / CURVE_SAMPLES) * (Math.log10(DISTANCE_RULER_MAX_AU) - Math.log10(DISTANCE_RULER_MIN_AU)))
    const v = speedAt(vFar, au * AU) / 1e3
    const esc = escapeSpeed(au * AU) / 1e3
    curve.push({ au, position: distanceRulerPosition(au), speedKmS: v, speedPosition: speedRulerPosition(v), escapeKmS: esc, escapePosition: speedRulerPosition(esc) })
  }
  const vq = atlasSpeedAtClosestApproach() / 1e3
  const eq = atlasEscapeSpeedAtClosestApproach() / 1e3
  return {
    speedFarAwayKmS: vFar / 1e3,
    closestApproachAu: ATLAS_3I.closestApproachAu,
    speedAtClosestKmS: vq,
    escapeSpeedAtClosestKmS: eq,
    speedOverEscape: vq / eq,
    curve,
    closestPosition: distanceRulerPosition(q / AU),
    speedAtClosestPosition: speedRulerPosition(vq),
    escapeAtClosestPosition: speedRulerPosition(eq),
    speedFarAwayPosition: speedRulerPosition(vFar / 1e3),
    gainShare: vq / (vFar / 1e3) - 1,
  }
}

// NASA's page on 3I/ATLAS (read 2026-10-28) gives its speed at closest approach as "about 153,000 miles per hour"; ESA's gives "roughly 250 000 km/h". Held to compare with the model after the run.
export const NASA_SPEED_AT_CLOSEST_MPH = 153000
export const ESA_SPEED_AT_CLOSEST_KM_H = 250000
const METRES_PER_MILE = 1609.344
export function nasaSpeedAtClosestKmS(): number {
  return (NASA_SPEED_AT_CLOSEST_MPH * METRES_PER_MILE) / 1e3 / 3600
}
export function esaSpeedAtClosestKmS(): number {
  return ESA_SPEED_AT_CLOSEST_KM_H / 3600
}

// ---- Drawing A (Step 5): the path of a trial visitor, from the learner's two settings ----

export type BendVersusAtlas = 'more' | 'less' | 'the same'

export interface TrialPicture extends TrialOrbit {
  // The trial path in AU with the Sun at the origin and the closest approach on the +x axis, from the entry to the exit at the picture's view radius.
  path: { x: number; y: number }[]
  closestIndex: number
  // The direction of travel at the two ends of the drawn path, in degrees anticlockwise from the +x axis. Their difference is at most the bend (the path is drawn only out to the view radius).
  entryHeadingDegrees: number
  exitHeadingDegrees: number
  bendVersusAtlas: BendVersusAtlas
  atlasBendDegrees: number
  // The trial's escape speed at closest approach as a share of the speed there (always below 1 for an open path).
  escapeOverSpeed: number
}

// The direction of travel at angle t on r(t) = p / (1 + e cos t): the derivative of (r cos t, r sin t).
function headingAt(e: number, p: number, t: number): number {
  const d = 1 + e * Math.cos(t)
  const r = p / d
  const dr = (p * e * Math.sin(t)) / (d * d)
  const dx = dr * Math.cos(t) - r * Math.sin(t)
  const dy = dr * Math.sin(t) + r * Math.cos(t)
  return Math.atan2(dy, dx) * RAD_TO_DEG
}

// A bend is "the same" as 3I/ATLAS's when the two agree to within 0.05 degrees (the default trial reproduces it to that precision, given the rounding of 58 km/s).
const SAME_BEND_DEGREES = 0.05

export function trialPicture(speedFarAwayKmS: number, closestApproachAu: number): TrialPicture {
  const orbit = trialOrbit(speedFarAwayKmS, closestApproachAu)
  const e = orbit.eccentricity
  const q = closestApproachAu
  const p = q * (1 + e)
  const R = PICTURE_VIEW_RADIUS_AU
  const c = Math.min(1, Math.max(-1, (p / R - 1) / e))
  const tView = Math.acos(c)
  const path: { x: number; y: number }[] = []
  for (let i = -PATH_SAMPLES_EACH_SIDE; i <= PATH_SAMPLES_EACH_SIDE; i++) {
    const t = (i / PATH_SAMPLES_EACH_SIDE) * tView
    const r = p / (1 + e * Math.cos(t))
    path.push({ x: r * Math.cos(t), y: r * Math.sin(t) })
  }
  const atlas = atlasBendDegrees()
  const diff = orbit.bendDegrees - atlas
  return {
    ...orbit,
    path,
    closestIndex: PATH_SAMPLES_EACH_SIDE,
    entryHeadingDegrees: headingAt(e, p, -tView),
    exitHeadingDegrees: headingAt(e, p, tView),
    bendVersusAtlas: Math.abs(diff) < SAME_BEND_DEGREES ? 'the same' : diff > 0 ? 'more' : 'less',
    atlasBendDegrees: atlas,
    escapeOverSpeed: orbit.escapeSpeedAtClosestKmS / orbit.speedAtClosestKmS,
  }
}

export const TRIAL_DEFAULT_SPEED_KM_S = 58
export const TRIAL_DEFAULT_CLOSEST_AU = 1.356
