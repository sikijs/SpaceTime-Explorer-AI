import { useMemo } from 'react'
import type { ReactNode } from 'react'
import {
  CRITICAL_AIM_IN_HORIZON_RADII,
  GRAPH_MAX_DEGREES,
  KM_PER_AU,
  MAX_AIM_IN_HORIZON_RADII,
  MIN_AIM_IN_HORIZON_RADII,
  PHOTON_SPHERE_IN_HORIZON_RADII,
  PART_ONE_FIVE_AIM_IN_HORIZON_RADII,
  PART_ONE_JUST_OUTSIDE_AIM_IN_HORIZON_RADII,
  bendCurve,
  bendDegrees,
  bendGuessGraphMarker,
  captureGuessIsOffView,
  guessedCaptureAimInHorizonRadii,
  justOutsideGuessGraphMarker,
  lightPath,
  runPartOne,
  viewRadiusInHorizonRadii,
  weakFieldBendDegrees,
  weakFieldBendRadians,
} from '../physics/lightNearBlackHoleExperiment'
import type {
  BendChoice,
  CaptureChoice,
  JustOutsideChoice,
  LargerThanSimple,
  LightPath,
} from '../physics/lightNearBlackHoleExperiment'
import { GUESS_COLOR } from './BlackHoleSizePictures'
import { CaptionBox, LookFor } from './TidalEffectExperiment'

// Black Holes, Experiment 4 (audit update): the pictures. Part 1 has Picture 1 (two path pictures side by side, a beam aimed at 5 horizon radii and
// one aimed at 2.6, which carry guesses 1, 2 and 3) and Picture 2 (the graph of the total bend against the aim, which carries all three guesses).
// Part 2 has Picture 3 (the path of the learner's own beam) and Picture 4 (the graph for it), with no white marks (CLAUDE.md §14, "Predictions and
// the Real Results"). Every number is passed in from, or computed by, the physics module.

// ---- the shape of a path picture: a title strip, a square area seen from above, and a legend strip ----
export const PANEL_WIDTH = 400
const PANEL_HEIGHT = 520
const CENTER_X = 200
const CENTER_Y = 256
const AREA_RADIUS_PX = 170
const SCALE_BAR_LENGTHS = [1, 2, 5, 10, 20]
const LEGEND_TOP = 446

export const LIGHT_COLOR = '#22d3ee' // the exact theory
export const SIMPLE_COLOR = '#fb923c' // the simple formula of Gravity Experiment 8
const HORIZON_COLOR = '#fb7185'
const BLACK_HOLE_COLOR = '#e879f9'
const PHOTON_COLOR = '#a78bfa'
const CRITICAL_COLOR = '#4ade80'
const NO_GRAVITY_COLOR = '#e2e8f0'

// ---- the graph ----
export const GRAPH_WIDTH = 640
const GRAPH_HEIGHT = 400
const PLOT_LEFT = 70
const PLOT_RIGHT = 610
const PLOT_TOP = 66
const PLOT_BOTTOM = 290

// Fixed real-world playback duration for the whole flyby, independent of the physics result (CLAUDE.md §11).
export const RUN_PLAYBACK_SECONDS = 8

// ---- the three questions' choices ----
export const BEND_CHOICES: Array<{ value: BendChoice; label: string; short: string }> = [
  { value: 'straight', label: 'It goes straight on, barely changed', short: 'goes straight on' },
  { value: 'bent', label: 'It is bent noticeably and then escapes', short: 'is bent, then escapes' },
  { value: 'captured', label: 'It is captured', short: 'is captured' },
]
export const CAPTURE_CHOICES: Array<{ value: CaptureChoice; label: string; short: string }> = [
  { value: 'horizon', label: 'Only if aimed at the horizon itself, 1 horizon radius', short: 'captured only inside 1 radius' },
  { value: 'critical', label: 'About 2.6 horizon radii', short: 'captured inside 2.6 radii' },
  { value: 'ten', label: 'About 10 horizon radii', short: 'captured inside 10 radii' },
]
export const JUST_OUTSIDE_CHOICES: Array<{ value: JustOutsideChoice; label: string; short: string }> = [
  { value: 'small-bend', label: 'It passes with only a small bend', short: 'passes, small bend' },
  { value: 'swings', label: 'It swings right around the black hole, turning by more than 180°, and then escapes', short: 'swings round, over 180°' },
  { value: 'captured-anyway', label: 'It is captured anyway', short: 'is captured anyway' },
]
export const bendLabel = (v: BendChoice) => BEND_CHOICES.find((c) => c.value === v)!.label
export const captureLabel = (v: CaptureChoice) => CAPTURE_CHOICES.find((c) => c.value === v)!.label
export const justOutsideLabel = (v: JustOutsideChoice) => JUST_OUTSIDE_CHOICES.find((c) => c.value === v)!.label

// ---- number formatting ----
// Three significant figures, with no trailing zeros ("10", "2.95", "235,571").
export function formatNumber(value: number): string {
  if (value >= 1000) return Number(value.toPrecision(3)).toLocaleString('en-US')
  return String(Number(value.toPrecision(3)))
}
// A distance in horizon radii, with enough digits to tell 2.6 from 2.598 on the slider.
export function formatRadii(value: number): string {
  return value < 10 ? String(Number(value.toPrecision(3))) : formatNumber(value)
}
// A length in plain units, from meters to trillions of kilometers.
export function formatLength(km: number): string {
  if (km < 1) return `${formatNumber(km * 1000)} m`
  if (km < 1e6) return `${formatNumber(km)} km`
  if (km < 1e9) return `${formatNumber(km / 1e6)} million km`
  if (km < 1e12) return `${formatNumber(km / 1e9)} billion km`
  return `${formatNumber(km / 1e12)} trillion km`
}
// Kilometers, with astronomical units added once that is the more natural unit.
export function formatDistance(km: number): string {
  return km >= 7.5e6 ? `${formatLength(km)}, about ${formatNumber(km / KM_PER_AU)} AU` : formatLength(km)
}
export function formatMass(solarMasses: number): string {
  if (solarMasses < 1e3) return `${solarMasses} solar masses`
  if (solarMasses < 1e9) return `${solarMasses / 1e6} million solar masses`
  return `${solarMasses / 1e9} billion solar masses`
}
export function formatLarger(larger: LargerThanSimple): string {
  return larger.kind === 'percent' ? `${formatNumber(larger.value)}% larger` : `${formatNumber(larger.value)} times as large`
}
export const CRITICAL_AIM_TEXT = CRITICAL_AIM_IN_HORIZON_RADII.toFixed(3)

// The part of the path that is inside the picture's view, as a range of point indices. The first points are already far outside it, and an
// escaping beam leaves it again.
function viewRange(path: LightPath, viewRadius: number) {
  let first = path.points.findIndex((p) => p.distanceInHorizonRadii <= viewRadius)
  if (first < 0) first = path.points.length - 1
  let last = path.points.length - 1
  while (last > first && path.points[last].distanceInHorizonRadii > viewRadius) last--
  return { first: Math.max(first - 1, 0), last }
}

// ---- the white marks ----
function GuessBox({ x, y, width: minWidth, line2 }: { x: number; y: number; width: number; line2: string }) {
  // Wide enough for its second line (about 5.6 pixels a letter at this size).
  const width = Math.max(minWidth, line2.length * 5.6 + 24)
  return (
    <g>
      <rect x={x - width / 2} y={y} width={width} height={44} rx={6} fill="#0b1020" stroke={GUESS_COLOR} strokeWidth={3} />
      <text x={x} y={y + 19} fill={GUESS_COLOR} fontSize="14" fontWeight="bold" textAnchor="middle">
        YOUR GUESS
      </text>
      <text x={x} y={y + 36} fill={GUESS_COLOR} fontSize="10" textAnchor="middle">
        {line2}
      </text>
    </g>
  )
}

function Arrow({ x1, y1, x2, y2 }: { x1: number; y1: number; x2: number; y2: number }) {
  const angle = Math.atan2(y2 - y1, x2 - x1)
  const head = 9
  const p1 = `${x2 - head * Math.cos(angle - 0.45)},${y2 - head * Math.sin(angle - 0.45)}`
  const p2 = `${x2 - head * Math.cos(angle + 0.45)},${y2 - head * Math.sin(angle + 0.45)}`
  return (
    <g>
      <line x1={x1} y1={y1} x2={x2} y2={y2} stroke={GUESS_COLOR} strokeWidth={3} />
      <polygon points={`${x2},${y2} ${p1} ${p2}`} fill={GUESS_COLOR} />
    </g>
  )
}

export type OutcomeGuess = { kind: 'bend'; guess: BendChoice } | { kind: 'justOutside'; guess: JustOutsideChoice }

// ---- the path picture ----
export function LightPanel({
  path,
  aim,
  progress,
  showRings,
  heading,
  outcomeGuess = null,
  captureGuess = null,
}: {
  path: LightPath
  aim: number
  progress: number
  showRings: boolean
  heading: string
  outcomeGuess?: OutcomeGuess | null
  captureGuess?: CaptureChoice | null
}) {
  const viewRadius = viewRadiusInHorizonRadii(aim)
  const pixelsPerHorizonRadius = AREA_RADIUS_PX / viewRadius
  const scaleBarHorizonRadii = [...SCALE_BAR_LENGTHS].reverse().find((n) => n <= viewRadius / 2.5) ?? 1

  const range = useMemo(() => viewRange(path, viewRadius), [path, viewRadius])
  const index = Math.min(range.first + Math.round(progress * (range.last - range.first)), range.last)
  const point = path.points[index]
  const finished = progress >= 1
  const captured = path.outcome === 'captured' && finished

  const px = (x: number) => CENTER_X + x * pixelsPerHorizonRadius
  const py = (y: number) => CENTER_Y - y * pixelsPerHorizonRadius

  // The closest the light has come so far. Points before the view's first index are farther out than the view itself.
  let closestSoFar = Infinity
  for (let i = range.first; i <= index; i++) closestSoFar = Math.min(closestSoFar, path.points[i].distanceInHorizonRadii)

  const trail: string[] = []
  for (let i = range.first; i <= index; i += 4) trail.push(`${px(path.points[i].x)},${py(path.points[i].y)}`)
  trail.push(`${px(point.x)},${py(point.y)}`)

  // Where the light would go with no gravity: the straight line y = aim, coming in from the right.
  const edge = viewRadius * 1.1
  // Where it ends up heading, once it has left: the mirror image of that line in the axis through the closest approach.
  const mirrorAngle = path.outcome === 'escapes' ? path.points[path.points.length - 1].phi / 2 : 0
  const reflect = (x: number, y: number) => ({
    x: x * Math.cos(2 * mirrorAngle) + y * Math.sin(2 * mirrorAngle),
    y: x * Math.sin(2 * mirrorAngle) - y * Math.cos(2 * mirrorAngle),
  })
  const outA = reflect(edge, aim)
  const outB = reflect(-edge, aim)

  const ringPoint = (radius: number, degrees: number) => ({
    x: CENTER_X + radius * pixelsPerHorizonRadius * Math.cos((degrees * Math.PI) / 180),
    y: CENTER_Y - radius * pixelsPerHorizonRadius * Math.sin((degrees * Math.PI) / 180),
  })
  // Ring labels sit in a column at the top left, each joined to its ring by a thin line, so they never collide.
  const ringLabels = showRings
    ? [
        { text: 'critical aim', radius: CRITICAL_AIM_IN_HORIZON_RADII, color: CRITICAL_COLOR, y: 74 },
        { text: 'light can circle here', radius: PHOTON_SPHERE_IN_HORIZON_RADII, color: PHOTON_COLOR, y: 88 },
        { text: 'horizon', radius: 1, color: HORIZON_COLOR, y: 102 },
      ]
    : [{ text: 'horizon', radius: 1, color: HORIZON_COLOR, y: 74 }]

  const rows: Array<{ key: string; draw: ReactNode; text: string; fill: string }> = [
    {
      key: 'bh',
      draw: <circle cx={20} cy={LEGEND_TOP + 8} r={5} fill={BLACK_HOLE_COLOR} stroke={HORIZON_COLOR} strokeWidth={1.5} />,
      text: 'black hole; the rose ring is its horizon (1 horizon radius)',
      fill: '#cbd5e1',
    },
    {
      key: 'line',
      draw: <line x1={13} y1={LEGEND_TOP + 24} x2={27} y2={LEGEND_TOP + 24} stroke={NO_GRAVITY_COLOR} strokeDasharray="3 2" />,
      text: 'dashed white line: the path the light would take with no gravity',
      fill: '#cbd5e1',
    },
    {
      key: 'light',
      draw: <circle cx={20} cy={LEGEND_TOP + 40} r={5} fill={LIGHT_COLOR} />,
      text: 'the light, and the path it has followed (the exact theory)',
      fill: LIGHT_COLOR,
    },
  ]
  if (showRings) {
    rows.push({
      key: 'rings',
      draw: <circle cx={20} cy={LEGEND_TOP + 56} r={5} fill="none" stroke={PHOTON_COLOR} strokeDasharray="3 2" />,
      text: 'purple ring: where light can circle. Green ring: the critical aim',
      fill: '#cbd5e1',
    })
  }

  // The white marks, drawn only when the run has finished (the caller passes null before that).
  const anchorX = px(Math.min(viewRadius * 0.8, edge))
  const anchorY = py(aim)
  const outcomeChoice =
    outcomeGuess === null
      ? null
      : outcomeGuess.kind === 'bend'
        ? BEND_CHOICES.find((c) => c.value === outcomeGuess.guess)!
        : JUST_OUTSIDE_CHOICES.find((c) => c.value === outcomeGuess.guess)!
  const captureChoice = captureGuess === null ? null : CAPTURE_CHOICES.find((c) => c.value === captureGuess)!
  const captureRadii = captureGuess === null ? null : guessedCaptureAimInHorizonRadii(captureGuess)
  const captureOff = captureGuess !== null && captureGuessIsOffView(captureGuess, viewRadius)

  return (
    <svg
      viewBox={`0 0 ${PANEL_WIDTH} ${PANEL_HEIGHT}`}
      width="100%"
      style={{
        display: 'block',
        maxWidth: `${PANEL_WIDTH}px`,
        border: '1px solid var(--border-color, #ccc)',
        borderRadius: '8px',
        overflow: 'hidden',
        backgroundColor: '#0b1020',
      }}
    >
      <defs>
        <clipPath id={`light-area-${heading.replace(/\W/g, '')}`}>
          <rect x={0} y={60} width={PANEL_WIDTH} height={PANEL_HEIGHT - 60 - 90} />
        </clipPath>
      </defs>
      <text x={12} y={20} fill={LIGHT_COLOR} fontSize="13" fontWeight="bold">
        {heading}
      </text>
      <text x={12} y={38} fill="#94a3b8" fontSize="11">
        Angle swept: {formatNumber((point.phi * 180) / Math.PI)}° | distance: {point.distanceInHorizonRadii.toFixed(2)} | closest: {closestSoFar.toFixed(2)} horizon radii
      </text>
      <text x={12} y={54} fill={captured ? HORIZON_COLOR : '#94a3b8'} fontSize="11" fontWeight={captured ? 'bold' : 'normal'}>
        {captured
          ? 'Captured: the light reached the horizon'
          : finished
            ? `Escaped, bent by ${formatNumber((path.bendRadians as number) * (180 / Math.PI))}°`
            : progress > 0
              ? 'On its way'
              : 'Ready'}
      </text>

      <g clipPath={`url(#light-area-${heading.replace(/\W/g, '')})`}>
        {showRings && (
          <>
            <circle cx={CENTER_X} cy={CENTER_Y} r={CRITICAL_AIM_IN_HORIZON_RADII * pixelsPerHorizonRadius} fill="none" stroke={CRITICAL_COLOR} strokeDasharray="4 3" />
            <circle cx={CENTER_X} cy={CENTER_Y} r={PHOTON_SPHERE_IN_HORIZON_RADII * pixelsPerHorizonRadius} fill="none" stroke={PHOTON_COLOR} strokeDasharray="4 3" />
          </>
        )}

        {/* Guess 2: a white ring at the distance guessed (drawn as a band, under the black hole) */}
        {captureRadii !== null && !captureOff && (
          <circle cx={CENTER_X} cy={CENTER_Y} r={captureRadii * pixelsPerHorizonRadius} fill="none" stroke={GUESS_COLOR} strokeWidth={6} strokeOpacity={0.9} />
        )}

        {/* Where the light would go with no gravity, and the aim */}
        <line x1={px(edge)} y1={py(aim)} x2={px(-edge)} y2={py(aim)} stroke={NO_GRAVITY_COLOR} strokeDasharray="5 4" strokeOpacity={0.7} />
        <line x1={CENTER_X} y1={CENTER_Y} x2={CENTER_X} y2={py(aim)} stroke={NO_GRAVITY_COLOR} strokeOpacity={0.5} />

        {/* Where it ends up heading, once it has left */}
        {path.outcome === 'escapes' && finished && (
          <line x1={px(outA.x)} y1={py(outA.y)} x2={px(outB.x)} y2={py(outB.y)} stroke={LIGHT_COLOR} strokeDasharray="2 4" strokeOpacity={0.8} />
        )}

        {/* The black hole and its horizon */}
        <circle cx={CENTER_X} cy={CENTER_Y} r={pixelsPerHorizonRadius} fill={BLACK_HOLE_COLOR} fillOpacity={0.35} stroke={HORIZON_COLOR} strokeWidth={2} />

        {/* The path so far and the light */}
        {trail.length > 1 && <polyline points={trail.join(' ')} fill="none" stroke={LIGHT_COLOR} strokeWidth={2} />}
        <circle cx={px(point.x)} cy={py(point.y)} r={5} fill={LIGHT_COLOR} stroke="#0b1020" strokeWidth={1.5} />
      </g>

      {/* On-canvas labels */}
      <text x={px(0) + 5} y={py(aim / 2) + 3} fill={NO_GRAVITY_COLOR} fontSize="10">
        aim
      </text>
      <text x={px(edge * 0.7) > PANEL_WIDTH - 12 ? PANEL_WIDTH - 12 : px(edge * 0.7)} y={py(aim) - 6} fill={NO_GRAVITY_COLOR} fontSize="10" textAnchor="end">
        path with no gravity
      </text>
      {path.outcome === 'escapes' && finished && (
        <text x={12} y={PANEL_HEIGHT - 100} fill={LIGHT_COLOR} fontSize="10">
          dotted blue line: the direction the light ends up heading
        </text>
      )}
      <text
        x={px(point.x) > PANEL_WIDTH - 40 ? px(point.x) - 8 : px(point.x) + 8}
        y={py(point.y) - 8}
        fill={LIGHT_COLOR}
        fontSize="10"
        textAnchor={px(point.x) > PANEL_WIDTH - 40 ? 'end' : 'start'}
      >
        light
      </text>
      {ringLabels.map((label) => {
        const end = ringPoint(label.radius, 135)
        return (
          <g key={label.text}>
            <line x1={12 + label.text.length * 5.4 + 3} y1={label.y - 3} x2={end.x} y2={end.y} stroke={label.color} strokeOpacity={0.6} strokeWidth={0.75} />
            <text x={12} y={label.y} fill={label.color} fontSize="10">
              {label.text}
            </text>
          </g>
        )
      })}

      {/* Guess 2 off the view: an arrow at the right-hand edge, level with the center */}
      {captureOff && captureChoice && (
        <g>
          <Arrow x1={322} y1={CENTER_Y} x2={392} y2={CENTER_Y} />
          <text x={392} y={CENTER_Y - 10} fill={GUESS_COLOR} fontSize="10" textAnchor="end">
            off this view
          </text>
        </g>
      )}
      {/* Guess 2: its box, joined to its ring or its arrow */}
      {captureChoice && captureRadii !== null && (
        <g>
          <line
            x1={300}
            y1={352}
            x2={captureOff ? 350 : ringPoint(captureRadii, -20).x}
            y2={captureOff ? CENTER_Y + 6 : ringPoint(captureRadii, -20).y}
            stroke={GUESS_COLOR}
            strokeWidth={2}
          />
          <GuessBox x={300} y={352} width={170} line2={captureChoice.short} />
        </g>
      )}
      {/* Guess 1 or 3: an outcome has no size, so a marker on the beam, in its box */}
      {outcomeChoice && (
        <g>
          <line x1={300} y1={300} x2={anchorX} y2={anchorY + 7} stroke={GUESS_COLOR} strokeWidth={2} />
          <circle cx={anchorX} cy={anchorY} r={7} fill="none" stroke={GUESS_COLOR} strokeWidth={3} />
          <GuessBox x={300} y={300} width={170} line2={`the beam ${outcomeChoice.short}`} />
        </g>
      )}

      {/* The scale bar */}
      <g>
        <line x1={14} y1={LEGEND_TOP - 12} x2={14 + scaleBarHorizonRadii * pixelsPerHorizonRadius} y2={LEGEND_TOP - 12} stroke="#e2e8f0" strokeWidth={2} />
        <line x1={14} y1={LEGEND_TOP - 16} x2={14} y2={LEGEND_TOP - 8} stroke="#e2e8f0" strokeWidth={2} />
        <line x1={14 + scaleBarHorizonRadii * pixelsPerHorizonRadius} y1={LEGEND_TOP - 16} x2={14 + scaleBarHorizonRadii * pixelsPerHorizonRadius} y2={LEGEND_TOP - 8} stroke="#e2e8f0" strokeWidth={2} />
        <text x={22 + scaleBarHorizonRadii * pixelsPerHorizonRadius} y={LEGEND_TOP - 8} fill="#e2e8f0" fontSize="10">
          scale: {scaleBarHorizonRadii} horizon {scaleBarHorizonRadii === 1 ? 'radius' : 'radii'}
        </text>
      </g>

      {rows.map((row, i) => (
        <g key={row.key}>
          {row.draw}
          <text x={32} y={LEGEND_TOP + 12 + i * 16} fill={row.fill} fontSize="10">
            {row.text}
          </text>
        </g>
      ))}
    </svg>
  )
}

export interface GraphBeam {
  aim: number
  label: string
  outcome: LightPath['outcome']
  exactDegrees: number | null
}
export interface GraphGuesses {
  bend: BendChoice | null
  capture: CaptureChoice | null
  justOutside: JustOutsideChoice | null
}

// ---- the graph: the total bend against the aim ----
export function BendGraph({ beams, showCritical, guesses = null }: { beams: GraphBeam[]; showCritical: boolean; guesses?: GraphGuesses | null }) {
  const curve = useMemo(() => bendCurve(), [])
  const logSpan = Math.log(MAX_AIM_IN_HORIZON_RADII / MIN_AIM_IN_HORIZON_RADII)
  const xFor = (b: number) => PLOT_LEFT + (Math.log(b / MIN_AIM_IN_HORIZON_RADII) / logSpan) * (PLOT_RIGHT - PLOT_LEFT)
  const yFor = (degrees: number) => PLOT_BOTTOM - (degrees / GRAPH_MAX_DEGREES) * (PLOT_BOTTOM - PLOT_TOP)
  const toDeg = (radians: number) => (radians * 180) / Math.PI

  const exactLine = curve.map((p) => `${xFor(p.aim)},${yFor(toDeg(p.bendRadians))}`).join(' ')
  const simpleAims = Array.from({ length: 80 }, (_, i) => MIN_AIM_IN_HORIZON_RADII * (MAX_AIM_IN_HORIZON_RADII / MIN_AIM_IN_HORIZON_RADII) ** (i / 79))
  const simpleLine = simpleAims.map((b) => `${xFor(b)},${yFor(toDeg(weakFieldBendRadians(b)))}`).join(' ')
  const criticalX = xFor(CRITICAL_AIM_IN_HORIZON_RADII)
  const roseCenter = (PLOT_LEFT + criticalX) / 2

  // The white marks (drawn only when the caller passes the guesses, which it does once the run has finished and the green line is drawn).
  const bendMark = guesses?.bend ? bendGuessGraphMarker(guesses.bend) : null
  const justMark = guesses?.justOutside ? justOutsideGuessGraphMarker(guesses.justOutside) : null
  const captureChoice = guesses?.capture ? CAPTURE_CHOICES.find((c) => c.value === guesses.capture)! : null
  const captureX = guesses?.capture ? xFor(guessedCaptureAimInHorizonRadii(guesses.capture)) : 0
  const bendChoice = guesses?.bend ? BEND_CHOICES.find((c) => c.value === guesses.bend)! : null
  const justChoice = guesses?.justOutside ? JUST_OUTSIDE_CHOICES.find((c) => c.value === guesses.justOutside)! : null

  return (
    <svg
      viewBox={`0 0 ${GRAPH_WIDTH} ${GRAPH_HEIGHT}`}
      width="100%"
      style={{
        marginTop: '1rem',
        display: 'block',
        maxWidth: `${GRAPH_WIDTH}px`,
        border: '1px solid var(--border-color, #ccc)',
        borderRadius: '8px',
        overflow: 'hidden',
        backgroundColor: '#0b1020',
      }}
    >
      <defs>
        <clipPath id="bend-plot">
          <rect x={PLOT_LEFT} y={PLOT_TOP} width={PLOT_RIGHT - PLOT_LEFT} height={PLOT_BOTTOM - PLOT_TOP} />
        </clipPath>
      </defs>
      <text x={12} y={20} fill="#e2e8f0" fontSize="12" fontWeight="bold">
        The total bend against the aim distance
      </text>
      <text x={12} y={38} fill="#94a3b8" fontSize="11">
        Horizontal: how close to the center the light is aimed, in horizon radii. Vertical: how far its direction is turned.
      </text>

      {[0, 100, 200, 300, 400].map((v) => (
        <g key={v}>
          <line x1={PLOT_LEFT} y1={yFor(v)} x2={PLOT_RIGHT} y2={yFor(v)} stroke="#334155" />
          <text x={PLOT_LEFT - 8} y={yFor(v) + 4} fill="#94a3b8" fontSize="10" textAnchor="end">
            {v}°
          </text>
        </g>
      ))}
      {[1, 2, 3, 5, 10, 20].map((b) => (
        <g key={b}>
          <line x1={xFor(b)} y1={PLOT_BOTTOM} x2={xFor(b)} y2={PLOT_BOTTOM + 5} stroke="#94a3b8" />
          <text x={xFor(b)} y={PLOT_BOTTOM + 18} fill="#94a3b8" fontSize="10" textAnchor="middle">
            {b}
          </text>
        </g>
      ))}
      <text x={(PLOT_LEFT + PLOT_RIGHT) / 2} y={PLOT_BOTTOM + 36} fill="#94a3b8" fontSize="11" textAnchor="middle">
        aim distance, in horizon radii (each step along the axis multiplies the distance)
      </text>

      {/* Reference lines: half a turn and a full turn */}
      {[
        { v: 180, label: '180°: turned right around' },
        { v: 360, label: '360°: a full turn' },
      ].map((line) => (
        <g key={line.v}>
          <line x1={PLOT_LEFT} y1={yFor(line.v)} x2={PLOT_RIGHT} y2={yFor(line.v)} stroke="#94a3b8" strokeDasharray="2 4" strokeOpacity={0.6} />
          <text x={PLOT_RIGHT - 4} y={yFor(line.v) - 4} fill="#94a3b8" fontSize="10" textAnchor="end">
            {line.label}
          </text>
        </g>
      ))}

      {/* The captured region and the critical aim: drawn only once the run has finished */}
      {showCritical && (
        <g>
          <rect x={PLOT_LEFT} y={PLOT_TOP} width={criticalX - PLOT_LEFT} height={PLOT_BOTTOM - PLOT_TOP} fill={HORIZON_COLOR} fillOpacity={0.12} />
          <text x={roseCenter} y={PLOT_TOP + 70} fill={HORIZON_COLOR} fontSize="10" textAnchor="middle">
            captured:
          </text>
          <text x={roseCenter} y={PLOT_TOP + 83} fill={HORIZON_COLOR} fontSize="10" textAnchor="middle">
            no bend to show
          </text>
          <line x1={criticalX} y1={PLOT_TOP} x2={criticalX} y2={PLOT_BOTTOM} stroke={CRITICAL_COLOR} strokeDasharray="5 4" />
          <text x={criticalX + 5} y={PLOT_TOP + 12} fill={CRITICAL_COLOR} fontSize="10">
            critical aim ({CRITICAL_AIM_TEXT})
          </text>
        </g>
      )}

      <g clipPath="url(#bend-plot)">
        <polyline points={simpleLine} fill="none" stroke={SIMPLE_COLOR} strokeWidth={2.5} />
        <polyline points={exactLine} fill="none" stroke={LIGHT_COLOR} strokeWidth={2.5} />
      </g>

      {/* The aims that were run */}
      {beams.map((beam) => (
        <g key={beam.label}>
          <line x1={xFor(beam.aim)} y1={PLOT_TOP} x2={xFor(beam.aim)} y2={PLOT_BOTTOM} stroke="#e2e8f0" strokeDasharray="1 4" strokeOpacity={0.8} />
          <circle cx={xFor(beam.aim)} cy={yFor(Math.min(toDeg(weakFieldBendRadians(beam.aim)), GRAPH_MAX_DEGREES))} r={5} fill={SIMPLE_COLOR} />
          {beam.outcome === 'escapes' && beam.exactDegrees !== null && (
            <circle cx={xFor(beam.aim)} cy={yFor(Math.min(beam.exactDegrees, GRAPH_MAX_DEGREES))} r={5} fill={LIGHT_COLOR} />
          )}
          {beam.outcome === 'captured' && (
            <text x={xFor(beam.aim)} y={PLOT_BOTTOM - 8} fill={HORIZON_COLOR} fontSize="11" fontWeight="bold" textAnchor="middle">
              ×
            </text>
          )}
          <text x={Math.min(xFor(beam.aim) + 8, PLOT_RIGHT - 80)} y={PLOT_TOP + 38} fill="#e2e8f0" fontSize="10">
            {beam.label}
          </text>
        </g>
      ))}

      {/* Guess 2: a white line at the distance guessed, in its box */}
      {captureChoice && (
        <g>
          <line x1={captureX} y1={PLOT_TOP} x2={captureX} y2={PLOT_BOTTOM} stroke={GUESS_COLOR} strokeWidth={4} />
          <line x1={captureX} y1={yFor(250)} x2={captureX < 380 ? 295 : 465} y2={yFor(250)} stroke={GUESS_COLOR} strokeWidth={2} />
          <GuessBox x={380} y={yFor(250) - 22} width={170} line2={captureChoice.short} />
        </g>
      )}
      {/* Guess 1: a marker at an aim of 5, at the height band of the guess, or in the captured area */}
      {bendMark && bendChoice && (
        <g>
          {bendMark.markerDegrees !== null ? (
            <g>
              <line x1={xFor(bendMark.aimInHorizonRadii)} y1={yFor(bendMark.markerDegrees)} x2={435} y2={yFor(110)} stroke={GUESS_COLOR} strokeWidth={2} />
              <circle cx={xFor(bendMark.aimInHorizonRadii)} cy={yFor(bendMark.markerDegrees)} r={9} fill="none" stroke={GUESS_COLOR} strokeWidth={4} />
              <GuessBox x={520} y={yFor(110)} width={170} line2={bendChoice.short} />
            </g>
          ) : (
            <g>
              <line x1={226} y1={222} x2={xFor(bendMark.aimInHorizonRadii) - 8} y2={PLOT_BOTTOM - 6} stroke={GUESS_COLOR} strokeWidth={2} />
              <circle cx={xFor(bendMark.aimInHorizonRadii)} cy={PLOT_BOTTOM - 6} r={7} fill="none" stroke={GUESS_COLOR} strokeWidth={4} />
              <GuessBox x={156} y={200} width={140} line2={bendChoice.short} />
            </g>
          )}
        </g>
      )}
      {/* Guess 3: a marker at an aim of 2.6, at the height band of the guess, or in the captured area */}
      {justMark && justChoice && (
        <g>
          {justMark.markerDegrees !== null ? (
            <g>
              <line x1={226} y1={98} x2={xFor(justMark.aimInHorizonRadii)} y2={yFor(justMark.markerDegrees)} stroke={GUESS_COLOR} strokeWidth={2} />
              <circle cx={xFor(justMark.aimInHorizonRadii)} cy={yFor(justMark.markerDegrees)} r={9} fill="none" stroke={GUESS_COLOR} strokeWidth={4} />
            </g>
          ) : (
            <g>
              <line x1={156} y1={120} x2={xFor(justMark.aimInHorizonRadii) - 14} y2={PLOT_BOTTOM - 26} stroke={GUESS_COLOR} strokeWidth={2} />
              <circle cx={xFor(justMark.aimInHorizonRadii) - 14} cy={PLOT_BOTTOM - 26} r={7} fill="none" stroke={GUESS_COLOR} strokeWidth={4} />
            </g>
          )}
          <GuessBox x={156} y={76} width={140} line2={justChoice.short} />
        </g>
      )}

      <line x1={96} y1={GRAPH_HEIGHT - 44} x2={126} y2={GRAPH_HEIGHT - 44} stroke={LIGHT_COLOR} strokeWidth={3} />
      <text x={132} y={GRAPH_HEIGHT - 40} fill={LIGHT_COLOR} fontSize="11">
        the exact theory
      </text>
      <line x1={286} y1={GRAPH_HEIGHT - 44} x2={316} y2={GRAPH_HEIGHT - 44} stroke={SIMPLE_COLOR} strokeWidth={3} />
      <text x={322} y={GRAPH_HEIGHT - 40} fill={SIMPLE_COLOR} fontSize="11">
        the simple formula (Gravity Experiment 8)
      </text>
      <circle cx={96} cy={GRAPH_HEIGHT - 20} r={5} fill="#e2e8f0" />
      <text x={108} y={GRAPH_HEIGHT - 16} fill="#e2e8f0" fontSize="11">
        dots: the aim of each beam, on each curve
      </text>
    </svg>
  )
}

// ---------------------------------------------------------------------------------------------------------------
// The captions. Plain words, what is drawn, a worked moment with real numbers, and "what to look for" in three parts. An item appears only
// once its feature is drawn, and nothing says what the learner is asked to predict before they have seen it (CLAUDE.md §12, §14).
// ---------------------------------------------------------------------------------------------------------------
const para = { marginTop: 0, marginBottom: '0.5rem' } as const
const subHead = { marginTop: '0.75rem', marginBottom: '0.25rem' } as const
const bullets = { margin: '0 0 0.5rem', paddingLeft: '1.25rem' } as const
const li = { marginBottom: '0.3rem' } as const

function CaptionTitle({ children }: { children: ReactNode }) {
  return (
    <p style={{ marginTop: 0, marginBottom: '0.5rem' }}>
      <strong>{children}</strong>
    </p>
  )
}

export function PanelsCaption({ complete, own = false }: { complete: boolean; own?: boolean }) {
  const partOne = runPartOne()
  const five = lightPath(PART_ONE_FIVE_AIM_IN_HORIZON_RADII)
  const fiveBend = bendDegrees(five) as number
  const fiveSimple = weakFieldBendDegrees(PART_ONE_FIVE_AIM_IN_HORIZON_RADII)
  const near = lightPath(PART_ONE_JUST_OUTSIDE_AIM_IN_HORIZON_RADII)
  const showRings = own || complete
  const items = [
    {
      look: 'the blue trail against the dashed white line in each picture.',
      means: own
        ? 'the line is where the light would go with no gravity; the trail is where the exact theory sends it. The farther they part, the more gravity has bent the light.'
        : `the line is where the light would go with no gravity; the trail is where the exact theory sends it. At an aim of 5 they part by ${formatNumber(fiveBend)}°; at 2.6 they part by ${formatNumber(bendDegrees(near) as number)}°, more than a full circle.`,
      matters: 'that gap is the bend. It tells you how strongly gravity pulled the light off its straight line, and it is the quantity the graph below plots against the aim.',
    },
    ...(showRings
      ? [
          {
            look: 'the green ring, and where the end of each blue trail sits compared with it.',
            means: 'the green ring is the critical aim. The picture shows whether each beam, aimed outside it or inside it, got away or reached the horizon.',
            matters: 'it shows where, in this model, light stops getting away from the black hole.',
          },
        ]
      : []),
    ...(complete && !own
      ? [
          {
            look: 'the white YOUR GUESS boxes, rings and arrows.',
            means: 'they are your guesses, nothing more. A ring is at the distance you chose. A circle on a beam, in a box, is only a marker for what you guessed happens to it (an outcome has no size). An arrow at the edge means your distance is off this picture.',
            matters: 'they let you compare your guesses with the real pictures at a glance. The real pictures never change with a guess; the tutor says how they compare.',
          },
        ]
      : []),
  ]
  return (
    <CaptionBox>
      <CaptionTitle>{own ? 'How to read Picture 3, the path of your beam.' : 'How to read Picture 1, two beams of light passing the 10-Sun black hole.'}</CaptionTitle>
      <p style={para}>
        <strong>What you are looking at.</strong> A bird’s-eye view of a thin beam of light passing a black hole. The black hole is the dark disc in the middle. The rose-colored ring around it is the <em>horizon</em>, the point of no
        return. Anything that reaches the horizon cannot come back out. {own ? 'The beam comes in from the right.' : 'There are two pictures, side by side. In the left one the beam is aimed to pass 5 horizon radii out; in the right one, 2.6 horizon radii out. Both come in from the right, and both are played together.'}
      </p>
      <p style={para}>
        <strong>The aim.</strong> The <em>aim</em> is how close to the center the beam would pass if gravity did nothing. It is drawn as a short white line from the center to the dashed white line, which is that straight path. Like a ball rolled past a post, a small aim
        means passing close. “Horizon radii” is the unit: 5 horizon radii means five times as far from the center as the edge.
      </p>
      <p style={subHead}>
        <strong>What is drawn</strong>
      </p>
      <ul style={bullets}>
        <li style={li}>
          <strong>The dashed white line</strong> is the straight path the light would take with no gravity. <strong>The blue trail and dot</strong> are the path the light really takes, worked out with the exact theory of gravity.
        </li>
        <li style={li}>
          <strong>The dotted blue line</strong> (after a beam has escaped) is the direction the light ends up heading. The <em>bend</em> is the angle between its original direction and this one, so a bend of 180° means it ends up heading back the way it came.
        </li>
        {showRings && (
          <li style={li}>
            <strong>The purple ring</strong> is 1.5 horizon radii from the center: a distance at which light can go round in a circle. <strong>The green ring</strong> is the <em>critical aim</em>, the closest aim at which a beam still gets away. They are drawn
            once the run has finished.
          </li>
        )}
        <li style={li}>
          <strong>The scale bar</strong> says how long some number of horizon radii is. It differs from one picture to the next, because each is zoomed to fit its aim. To compare one aim with another, use the scale bar and the numbers, not the size of the drawing.
        </li>
      </ul>
      {!own && (
        <p style={para}>
          <strong>A worked moment.</strong> In the left picture the beam is aimed at 5 horizon radii ({formatDistance(partOne.five.aimKm)} from the center of the 10-Sun black hole, whose horizon radius is {formatDistance(partOne.five.horizonRadiusKm)}). By the end its direction has been turned by {formatNumber(fiveBend)}°, and
          at its closest it came within {formatNumber(five.closestInHorizonRadii)} horizon radii, nearer than its aim of 5. The simple formula from Gravity Experiment 8 would have said {formatNumber(fiveSimple)}°.
        </p>
      )}
      <LookFor items={items} />
      <p style={{ margin: '0.5rem 0 0' }}>
        <strong>A limit.</strong> This follows a thin beam in a flat plane. It is not what a camera would see, and it does not show what happens to the light after it is captured.
      </p>
    </CaptionBox>
  )
}

export function GraphCaption({ complete, own = false }: { complete: boolean; own?: boolean }) {
  const farExact = bendDegrees(lightPath(20)) as number
  const farSimple = weakFieldBendDegrees(20)
  const fiveExact = bendDegrees(lightPath(5)) as number
  const fiveSimple = weakFieldBendDegrees(5)
  const showCritical = own || complete
  const items = [
    {
      look: 'the blue and orange curves at the right-hand side of the graph.',
      means: `at an aim of 20 they read ${formatNumber(farExact)}° and ${formatNumber(farSimple)}°, a gap of about ${formatNumber(farExact - farSimple)}°; at an aim of 5 they read ${formatNumber(fiveExact)}° and ${formatNumber(fiveSimple)}°, a gap of about ${formatNumber(fiveExact - fiveSimple)}°.`,
      matters: 'the simple formula from Gravity Experiment 8 was made for weak gravity far from a mass. The widening gap shows it losing its grip as the light passes closer.',
    },
    {
      look: 'the blue curve as it climbs toward the left.',
      means: 'the closer the aim, the larger the bend, and the climb gets steeper and steeper.',
      matters: 'it shows how strongly the black hole turns light that passes close, and that the simple formula’s gentle orange curve misses it.',
    },
    ...(showCritical
      ? [
          {
            look: 'the green line, and the rose area to its left.',
            means: `the green line is the critical aim, ${CRITICAL_AIM_TEXT} horizon radii. Aims to its left are in the rose area, where the light is captured and so has no bend to show. The blue curve leaves the top of the graph just to the right of the line.`,
            matters: 'it marks where, in this model, the light stops getting away.',
          },
        ]
      : []),
    ...(complete && !own
      ? [
          {
            look: 'the white YOUR GUESS boxes, markers and line.',
            means: 'a white line is the distance you guessed for question 2. A white circle is only a marker for your guess to question 1 (at an aim of 5) or question 3 (at an aim of 2.6): an outcome has no number of degrees, so it is drawn in a band of the graph, or in the rose area for “captured”.',
            matters: 'the real curves stay where they are for every guess, so you can compare at a glance. The tutor says how your guesses compare.',
          },
        ]
      : []),
  ]
  return (
    <CaptionBox>
      <CaptionTitle>{own ? 'How to read Picture 4, the graph for your beam.' : 'How to read Picture 2, the total bend against the aim.'}</CaptionTitle>
      <p style={para}>
        <strong>What you are looking at.</strong> For every aim from 1 to 20 horizon radii, how far the light’s direction is turned by the time it is far away again. A bend of 0° means no bend at all. The horizontal axis is on a log scale: each step along it multiplies
        the distance.
      </p>
      <p style={subHead}>
        <strong>What is drawn</strong>
      </p>
      <ul style={bullets}>
        <li style={li}>
          <strong>The blue curve</strong> is the exact theory, worked out for each aim the same way as the path pictures. <strong>The orange curve</strong> is the simple formula from Gravity and Curved Spacetime, Experiment 8: the bend is 2 divided by the aim, in radians.
        </li>
        <li style={li}>
          <strong>The dots</strong> mark {own ? 'your aim' : 'the aims of the two beams'} on each curve, so the gap between them is how far the simple formula is off at that aim. A red × means the beam was captured, so there is no bend.
        </li>
        <li style={li}>
          <strong>The dotted lines at 180° and 360°</strong> mark a half turn (heading back the way it came) and a full turn.
        </li>
        {showCritical && (
          <li style={li}>
            <strong>The green line and the rose area</strong> are drawn once the run has finished.
          </li>
        )}
      </ul>
      <p style={para}>
        <strong>A worked moment.</strong> Look at an aim of 20, near the right edge. The exact curve reads {formatNumber(farExact)}° and the orange curve {formatNumber(farSimple)}°: the formula 2 ÷ 20 = 0.1 radian, and 0.1 × 57.3° = {formatNumber(farSimple)}°. They are almost the same.
      </p>
      <LookFor items={items} />
      <p style={{ margin: '0.5rem 0 0' }}>
        <strong>A limit.</strong> The vertical scale stops at {GRAPH_MAX_DEGREES}°, so the blue curve can leave the top of the graph{showCritical ? ' near the green line' : ''}. It is a thin beam in a flat plane, not a camera view.
      </p>
    </CaptionBox>
  )
}

