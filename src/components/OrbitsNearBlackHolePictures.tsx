import type { CSSProperties, ReactNode } from 'react'
import {
  FAR_PANEL_VIEW_IN_HORIZON_RADII,
  FAR_START_IN_HORIZON_RADII,
  LAST_SAFE_ORBIT_IN_HORIZON_RADII,
  MAX_TURNS,
  NUDGE,
  PART_ONE_GRAPH_MAX_IN_HORIZON_RADII,
  PART_ONE_PANEL_VIEW_IN_HORIZON_RADII,
  STEPS_PER_TURN,
  farGuessMark,
  guessedLastSafeInHorizonRadii,
  lastSafeGuessIsOffView,
  nudgeGuessMark,
  speedGapPercent,
  wobblePercent,
} from '../physics/orbitsNearBlackHoleExperiment'
import type {
  FarGuess,
  LastSafeGuess,
  NudgeGuess,
  OrbitPath,
  OrbitsNearBlackHoleResult,
} from '../physics/orbitsNearBlackHoleExperiment'
import { GUESS_COLOR } from './BlackHoleSizePictures'
import { CaptionBox } from './TidalEffectExperiment'

// Black Holes, Experiment 3 (audit update): the pictures. Part 1 has Picture 1 (the two probes at 2 horizon radii, which carries guesses 1
// and 2), Picture 1b (the same two probes at 20 horizon radii, which carries guess 3) and Picture 2 (distance against turns, which carries
// guess 2 again). Part 2 has Picture 3 (the two probes for the learner's own settings) and Picture 4 (their graph), with no white marks
// (CLAUDE.md §14, "Predictions and the Real Results"). Every number is passed in from the physics module.

// ---- the shape of a panel: a title strip, a round orbit area, a scale bar and a legend ----
const PANEL_WIDTH = 400
const PANEL_HEIGHT = 512
const CENTER_X = 200
const CENTER_Y = 248
const ORBIT_AREA_RADIUS_PX = 170
const ZOOM_MARGIN = 1.25
const MIN_VIEW_RADIUS = 4 // horizon radii, so that the last safe orbit (3) always fits
const SCALE_BAR_LENGTHS = [1, 2, 5, 10, 20]
const LEGEND_TOP = 438

export const ORDINARY_COLOR = '#facc15'
export const EXACT_COLOR = '#22d3ee'
const HORIZON_COLOR = '#fb7185'
const BLACK_HOLE_COLOR = '#e879f9'
const LAST_SAFE_COLOR = '#a78bfa'

const GRAPH_WIDTH = 640
const GRAPH_HEIGHT = 352
const PLOT_LEFT = 70
const PLOT_RIGHT = 600
const PLOT_TOP = 64
const PLOT_BOTTOM = 270

export const KM_PER_AU = 149_597_870.7
// Fixed real-world playback duration of a whole run, independent of the physics (CLAUDE.md §11).
export const RUN_PLAYBACK_SECONDS = 12

// ---- the three guesses: the buttons' wording is the approved wording of 2026-10-12, unchanged ----
export const NUDGE_CHOICES: Array<{ value: NudgeGuess; label: string; short: string }> = [
  { value: 'wobbles', label: 'It wobbles a little and keeps circling', short: 'it wobbles and keeps circling' },
  { value: 'spirals-in', label: 'It spirals in and crosses the horizon', short: 'it spirals in' },
  { value: 'flies-off', label: 'It flies off', short: 'it flies off' },
]
export const LAST_SAFE_CHOICES: Array<{ value: LastSafeGuess; label: string; short: string }> = [
  { value: 'anywhere', label: 'Anywhere outside the horizon', short: 'anywhere outside the horizon' },
  { value: 'three', label: 'About 3 horizon radii from the center', short: 'last safe place: 3 horizon radii' },
  { value: 'ten', label: 'About 10 horizon radii from the center', short: 'last safe place: 10 horizon radii' },
]
export const FAR_CHOICES: Array<{ value: FarGuess; label: string; short: string }> = [
  { value: 'very-different', label: 'Very different', short: 'the two orbits look very different' },
  { value: 'nearly-same', label: 'Nearly the same', short: 'the two orbits look nearly the same' },
]
export const nudgeLabel = (v: NudgeGuess) => NUDGE_CHOICES.find((c) => c.value === v)!.label
export const lastSafeLabel = (v: LastSafeGuess) => LAST_SAFE_CHOICES.find((c) => c.value === v)!.label
export const farLabel = (v: FarGuess) => FAR_CHOICES.find((c) => c.value === v)!.label

// ---- number formats ----
// Three significant figures, with no trailing zeros ("10", "2.95", "235,571").
export function formatNumber(value: number): string {
  if (value >= 1000) return Number(value.toPrecision(3)).toLocaleString('en-US')
  return String(Number(value.toPrecision(3)))
}
// A distance in horizon radii, with enough digits to tell 1.6 from 1.60001 on the slider.
export function formatRadii(value: number): string {
  return value < 10 ? String(Number(value.toPrecision(3))) : formatNumber(value)
}
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
// One probe's outcome in a sentence, for the tables.
export function pathSummary(path: OrbitPath, startInHorizonRadii: number): string {
  if (path.outcome === 'plunges') return `Plunged: reached the horizon after about ${path.turnsCompleted.toFixed(1)} turns`
  return `Kept circling for all ${MAX_TURNS} turns, never more than ${formatNumber(wobblePercent(path, startInHorizonRadii))}% away from its starting distance`
}

// Where a probe is at a given moment of the run (a path that plunged ends early and stays at the horizon).
export function pointAt(path: OrbitPath, turnsReached: number) {
  const index = Math.min(Math.floor(turnsReached * STEPS_PER_TURN), path.points.length - 1)
  return { index, point: path.points[index], ended: index >= path.points.length - 1 }
}

// The zoom shared by a pair of panels: the view reaches ZOOM_MARGIN times the start (never less than `minView`).
export function panelScale(startInHorizonRadii: number, minView: number = MIN_VIEW_RADIUS) {
  const viewRadius = Math.max(ZOOM_MARGIN * startInHorizonRadii, minView)
  const pixelsPerHorizonRadius = ORBIT_AREA_RADIUS_PX / viewRadius
  const scaleBarHorizonRadii = [...SCALE_BAR_LENGTHS].reverse().find((n) => n <= viewRadius / 2.5) ?? 1
  return { viewRadius, pixelsPerHorizonRadius, scaleBarHorizonRadii }
}

// ---- the white marks ----
function GuessBox({ x, y, width, line2 }: { x: number; y: number; width: number; line2: string }) {
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

// Guess 1: a marker (an outcome has no size). On the exact-theory panel at 2 horizon radii.
function NudgeGuessMark({ guess, startX, startY }: { guess: NudgeGuess; startX: number; startY: number }) {
  const mark = nudgeGuessMark(guess)
  const choice = NUDGE_CHOICES.find((c) => c.value === guess)!
  return (
    <g>
      {mark === 'ring-at-start' && <circle cx={startX} cy={startY} r={13} fill="none" stroke={GUESS_COLOR} strokeWidth={3} />}
      {mark === 'inward-arrow' && <Arrow x1={startX - 6} y1={startY} x2={startX - 42} y2={startY} />}
      {mark === 'outward-arrow' && <Arrow x1={startX + 6} y1={startY + 16} x2={startX + 42} y2={startY + 16} />}
      <line x1={310} y1={108} x2={startX} y2={startY - 16} stroke={GUESS_COLOR} strokeWidth={2} />
      <GuessBox x={310} y={64} width={170} line2={choice.short} />
    </g>
  )
}

// Guess 2 on a panel: a white ring (drawn as a band so that the purple ring stays visible inside it when the two agree), an arrow at the
// edge when the guess lies beyond the view, or a marker for "anywhere".
function LastSafeGuessMarkOnPanel({ guess, pixelsPerHorizonRadius }: { guess: LastSafeGuess; pixelsPerHorizonRadius: number }) {
  const radii = guessedLastSafeInHorizonRadii(guess)
  const choice = LAST_SAFE_CHOICES.find((c) => c.value === guess)!
  const off = lastSafeGuessIsOffView(guess, PART_ONE_PANEL_VIEW_IN_HORIZON_RADII)
  const boxX = 112
  const boxY = 366
  let anchorX = CENTER_X
  let body: ReactNode = null
  if (radii !== null && !off) {
    const r = radii * pixelsPerHorizonRadius
    anchorX = CENTER_X - r
    body = <circle cx={CENTER_X} cy={CENTER_Y} r={r} fill="none" stroke={GUESS_COLOR} strokeWidth={6} strokeOpacity={0.9} />
  } else if (radii !== null) {
    anchorX = 16
    body = (
      <g>
        <Arrow x1={84} y1={CENTER_Y} x2={16} y2={CENTER_Y} />
        <text x={14} y={CENTER_Y - 10} fill={GUESS_COLOR} fontSize="10">
          off this view
        </text>
      </g>
    )
  } else {
    anchorX = 44
    body = (
      <g>
        <Arrow x1={CENTER_X - pixelsPerHorizonRadius - 6} y1={CENTER_Y} x2={14} y2={CENTER_Y} />
        <Arrow x1={14} y1={CENTER_Y} x2={CENTER_X - pixelsPerHorizonRadius - 6} y2={CENTER_Y} />
      </g>
    )
  }
  return (
    <g>
      {body}
      <line x1={boxX} y1={boxY} x2={anchorX} y2={CENTER_Y + 4} stroke={GUESS_COLOR} strokeWidth={2} />
      <GuessBox x={boxX} y={boxY} width={200} line2={choice.short} />
    </g>
  )
}

// ---- one probe's panel ----
export function OrbitPanel({
  title,
  ruleName,
  color,
  path,
  startInHorizonRadii,
  pixelsPerHorizonRadius,
  scaleBarHorizonRadii,
  turnsReached,
  showLastSafeOrbit,
  compact = false,
  overlay,
}: {
  title: string
  ruleName: string
  color: string
  path: OrbitPath
  startInHorizonRadii: number
  pixelsPerHorizonRadius: number
  scaleBarHorizonRadii: number
  turnsReached: number
  showLastSafeOrbit: boolean
  compact?: boolean
  overlay?: ReactNode
}) {
  const { index, point, ended } = pointAt(path, turnsReached)
  const plunged = path.outcome === 'plunges' && ended
  const px = (x: number) => CENTER_X + x * pixelsPerHorizonRadius
  const py = (y: number) => CENTER_Y - y * pixelsPerHorizonRadius

  const trail: string[] = []
  for (let i = 0; i <= index; i += 4) trail.push(`${px(path.points[i].x)},${py(path.points[i].y)}`)
  trail.push(`${px(point.x)},${py(point.y)}`)

  const startRadius = startInHorizonRadii * pixelsPerHorizonRadius
  const startLabelAtLeft = px(startInHorizonRadii) > PANEL_WIDTH - 50
  const lastSafeRadius = LAST_SAFE_ORBIT_IN_HORIZON_RADII * pixelsPerHorizonRadius
  const horizonPx = Math.max(pixelsPerHorizonRadius, 3)

  const rows: Array<{ key: string; draw: ReactNode; text: string; fill: string }> = [
    {
      key: 'bh',
      draw: <circle cx={20} cy={LEGEND_TOP + 8} r={5} fill={BLACK_HOLE_COLOR} stroke={HORIZON_COLOR} strokeWidth={1.5} />,
      text: 'black hole; the rose ring is its horizon (1 horizon radius)',
      fill: '#cbd5e1',
    },
    {
      key: 'start',
      draw: <circle cx={20} cy={LEGEND_TOP + 24} r={5} fill="none" stroke="#e2e8f0" strokeDasharray="3 2" />,
      text: 'dashed white ring: where the probe starts',
      fill: '#cbd5e1',
    },
    {
      key: 'probe',
      draw: <circle cx={20} cy={LEGEND_TOP + 40} r={5} fill={color} />,
      text: `the probe, and the path it has followed (${ruleName})`,
      fill: color,
    },
  ]
  if (showLastSafeOrbit) {
    rows.push({
      key: 'last',
      draw: <circle cx={20} cy={LEGEND_TOP + 56} r={5} fill="none" stroke={LAST_SAFE_COLOR} strokeDasharray="3 2" />,
      text: 'dashed purple ring: the last safe orbit, 3 horizon radii',
      fill: LAST_SAFE_COLOR,
    })
  }

  return (
    <svg
      viewBox={`0 0 ${PANEL_WIDTH} ${PANEL_HEIGHT}`}
      width="100%"
      aria-label={`${title}: a bird's-eye view of a probe circling a black hole`}
      style={{
        flex: compact ? '1 1 220px' : '1 1 280px',
        minWidth: 0,
        display: 'block',
        maxWidth: compact ? '300px' : `${PANEL_WIDTH}px`,
        border: '1px solid var(--border-color, #ccc)',
        borderRadius: '8px',
        overflow: 'hidden',
        backgroundColor: '#0b1020',
      }}
    >
      <text x={12} y={20} fill={color} fontSize="13" fontWeight="bold">
        {title}
      </text>
      <text x={12} y={38} fill="#94a3b8" fontSize="11">
        Turns: {point.turns.toFixed(2)} &nbsp;|&nbsp; distance: {point.distanceInHorizonRadii.toFixed(2)} horizon radii
      </text>
      <text x={12} y={54} fill={plunged ? HORIZON_COLOR : '#94a3b8'} fontSize="11" fontWeight={plunged ? 'bold' : 'normal'}>
        {plunged ? 'Crossed the horizon: plunged' : turnsReached > 0 ? 'Still circling' : 'Ready'}
      </text>

      <circle cx={CENTER_X} cy={CENTER_Y} r={startRadius} fill="none" stroke="#e2e8f0" strokeDasharray="4 3" strokeOpacity={0.6} />
      <text
        x={startLabelAtLeft ? px(startInHorizonRadii) - 7 : px(startInHorizonRadii) + 7}
        y={CENTER_Y + 4}
        fill="#e2e8f0"
        fontSize="10"
        textAnchor={startLabelAtLeft ? 'end' : 'start'}
      >
        start
      </text>
      {showLastSafeOrbit && (
        <g>
          <circle cx={CENTER_X} cy={CENTER_Y} r={lastSafeRadius} fill="none" stroke={LAST_SAFE_COLOR} strokeDasharray="4 3" />
          <text
            x={CENTER_X}
            y={lastSafeRadius >= 60 ? CENTER_Y + lastSafeRadius - 14 : CENTER_Y + lastSafeRadius + 13}
            fill={LAST_SAFE_COLOR}
            fontSize="10"
            textAnchor="middle"
          >
            last safe orbit
          </text>
        </g>
      )}

      <circle cx={CENTER_X} cy={CENTER_Y} r={horizonPx} fill={BLACK_HOLE_COLOR} fillOpacity={0.35} stroke={HORIZON_COLOR} strokeWidth={2} />
      <text x={CENTER_X} y={CENTER_Y - horizonPx - 6} fill="#f5d0fe" fontSize="9" textAnchor="middle">
        {pixelsPerHorizonRadius >= 18 ? 'black hole' : ''}
      </text>

      {trail.length > 1 && <polyline points={trail.join(' ')} fill="none" stroke={color} strokeWidth={1.5} strokeOpacity={0.9} />}
      <circle cx={px(point.x)} cy={py(point.y)} r={5} fill={color} stroke="#0b1020" strokeWidth={1.5} />
      <text
        x={px(point.x) > PANEL_WIDTH - 50 ? px(point.x) - 8 : px(point.x) + 8}
        y={py(point.y) - 8}
        fill={color}
        fontSize="10"
        textAnchor={px(point.x) > PANEL_WIDTH - 50 ? 'end' : 'start'}
      >
        probe
      </text>

      <g>
        <line x1={14} y1={LEGEND_TOP - 12} x2={14 + scaleBarHorizonRadii * pixelsPerHorizonRadius} y2={LEGEND_TOP - 12} stroke="#e2e8f0" strokeWidth={2} />
        <line x1={14} y1={LEGEND_TOP - 16} x2={14} y2={LEGEND_TOP - 8} stroke="#e2e8f0" strokeWidth={2} />
        <line
          x1={14 + scaleBarHorizonRadii * pixelsPerHorizonRadius}
          y1={LEGEND_TOP - 16}
          x2={14 + scaleBarHorizonRadii * pixelsPerHorizonRadius}
          y2={LEGEND_TOP - 8}
          stroke="#e2e8f0"
          strokeWidth={2}
        />
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
      {overlay}
    </svg>
  )
}

// ---- a pair of panels: ordinary gravity (gold) beside the exact theory (blue) ----
export function PanelPair({
  result,
  turnsReached,
  showLastSafeOrbit,
  compact = false,
  nudgeGuess = null,
  lastSafeGuess = null,
}: {
  result: OrbitsNearBlackHoleResult
  turnsReached: number
  showLastSafeOrbit: boolean
  compact?: boolean
  // The white marks of Part 1 (null in Part 2 and before the run has finished).
  nudgeGuess?: NudgeGuess | null
  lastSafeGuess?: LastSafeGuess | null
}) {
  const start = result.startInHorizonRadii
  const minView = compact ? FAR_PANEL_VIEW_IN_HORIZON_RADII / 1.25 : MIN_VIEW_RADIUS
  const { pixelsPerHorizonRadius, scaleBarHorizonRadii } = panelScale(start, minView)
  const startX = CENTER_X + start * pixelsPerHorizonRadius
  const overlay =
    nudgeGuess || lastSafeGuess ? (
      <>
        {nudgeGuess && <NudgeGuessMark guess={nudgeGuess} startX={startX} startY={CENTER_Y} />}
        {lastSafeGuess && <LastSafeGuessMarkOnPanel guess={lastSafeGuess} pixelsPerHorizonRadius={pixelsPerHorizonRadius} />}
      </>
    ) : undefined
  return (
    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.75rem', marginTop: '1rem' }}>
      <OrbitPanel
        title="Ordinary gravity (Gravity Experiment 6)"
        ruleName="ordinary gravity"
        color={ORDINARY_COLOR}
        path={result.ordinary}
        startInHorizonRadii={start}
        pixelsPerHorizonRadius={pixelsPerHorizonRadius}
        scaleBarHorizonRadii={scaleBarHorizonRadii}
        turnsReached={turnsReached}
        showLastSafeOrbit={false}
        compact={compact}
      />
      <OrbitPanel
        title="The exact theory"
        ruleName="the exact theory"
        color={EXACT_COLOR}
        path={result.exact}
        startInHorizonRadii={start}
        pixelsPerHorizonRadius={pixelsPerHorizonRadius}
        scaleBarHorizonRadii={scaleBarHorizonRadii}
        turnsReached={turnsReached}
        showLastSafeOrbit={showLastSafeOrbit}
        compact={compact}
        overlay={overlay}
      />
    </div>
  )
}

// Guess 3: it has no size of its own, so a bracket under both small panels with a sign in a YOUR GUESS box (a marker only).
export function FarGuessStrip({ guess }: { guess: FarGuess }) {
  const choice = FAR_CHOICES.find((c) => c.value === guess)!
  const sign = farGuessMark(guess) === 'not-equal-sign' ? '≠' : '≈'
  return (
    <svg
      viewBox="0 0 640 92"
      width="100%"
      aria-label="Your guess for the two probes at 20 horizon radii"
      style={{
        marginTop: '0.5rem',
        display: 'block',
        maxWidth: '640px',
        border: '1px solid var(--border-color, #ccc)',
        borderRadius: '8px',
        overflow: 'hidden',
        backgroundColor: '#0b1020',
      }}
    >
      <line x1={60} y1={14} x2={580} y2={14} stroke={GUESS_COLOR} strokeWidth={3} />
      <line x1={60} y1={14} x2={60} y2={26} stroke={GUESS_COLOR} strokeWidth={3} />
      <line x1={580} y1={14} x2={580} y2={26} stroke={GUESS_COLOR} strokeWidth={3} />
      <line x1={320} y1={14} x2={320} y2={30} stroke={GUESS_COLOR} strokeWidth={2} />
      <GuessBox x={320} y={30} width={260} line2={choice.short} />
      <text x={490} y={66} fill={GUESS_COLOR} fontSize="30" fontWeight="bold">
        {sign}
      </text>
      <text x={14} y={86} fill="#94a3b8" fontSize="10">
        The bracket joins the two small pictures above. It is only a marker for your guess.
      </text>
    </svg>
  )
}

// ---- the graph: distance from the black hole against turns ----
// Part 1 draws it on a log axis from 1 to PART_ONE_GRAPH_MAX_IN_HORIZON_RADII so that a ring at 3 or at 10 fits; Part 2 keeps the earlier
// scale zoomed to the start.
export function DistanceGraph({
  ordinary,
  exact,
  startInHorizonRadii,
  turnsReached,
  showLastSafe,
  logAxis,
  lastSafeGuess = null,
}: {
  ordinary: OrbitPath
  exact: OrbitPath
  startInHorizonRadii: number
  turnsReached: number
  showLastSafe: boolean
  logAxis: boolean
  lastSafeGuess?: LastSafeGuess | null
}) {
  const yMax = logAxis ? PART_ONE_GRAPH_MAX_IN_HORIZON_RADII : Math.max(1.1 * startInHorizonRadii, 4)
  const xFor = (turns: number) => PLOT_LEFT + (turns / MAX_TURNS) * (PLOT_RIGHT - PLOT_LEFT)
  const yFor = (distance: number) =>
    logAxis
      ? PLOT_BOTTOM - (Math.log10(Math.max(distance, 1)) / Math.log10(yMax)) * (PLOT_BOTTOM - PLOT_TOP)
      : PLOT_BOTTOM - (distance / yMax) * (PLOT_BOTTOM - PLOT_TOP)

  const step = [1, 2, 5, 10, 20].find((n) => yMax / n <= 6) ?? 20
  const ticks: number[] = logAxis ? [1, 2, 3, 5, 10] : []
  if (!logAxis) for (let v = 0; v <= yMax; v += step) ticks.push(v)

  const linePoints = (path: OrbitPath) => {
    const { index, point } = pointAt(path, turnsReached)
    const pts: string[] = []
    for (let i = 0; i <= index; i += 8) pts.push(`${xFor(path.points[i].turns)},${yFor(path.points[i].distanceInHorizonRadii)}`)
    pts.push(`${xFor(point.turns)},${yFor(point.distanceInHorizonRadii)}`)
    return { pts: pts.join(' '), point, ended: index >= path.points.length - 1 }
  }
  const ordinaryLine = linePoints(ordinary)
  const exactLine = linePoints(exact)
  const exactPlunged = exact.outcome === 'plunges' && exactLine.ended

  const referenceLines = [
    { value: 1, label: 'horizon (1)', color: HORIZON_COLOR, dy: -4, show: true },
    { value: LAST_SAFE_ORBIT_IN_HORIZON_RADII, label: 'last safe orbit (3)', color: LAST_SAFE_COLOR, dy: 12, show: showLastSafe },
    { value: startInHorizonRadii, label: `start (${formatRadii(startInHorizonRadii)})`, color: '#e2e8f0', dy: -4, show: true },
  ].filter((l) => l.show)

  // Guess 2 on the graph: a white line at the guessed distance, or a bar for "anywhere".
  let guessMark: ReactNode = null
  if (lastSafeGuess) {
    const radii = guessedLastSafeInHorizonRadii(lastSafeGuess)
    const choice = LAST_SAFE_CHOICES.find((c) => c.value === lastSafeGuess)!
    const boxX = 470
    if (radii !== null) {
      const y = yFor(radii)
      const boxY = y < (PLOT_TOP + PLOT_BOTTOM) / 2 ? y + 14 : y - 60
      guessMark = (
        <g>
          <line x1={PLOT_LEFT} y1={y} x2={PLOT_RIGHT} y2={y} stroke={GUESS_COLOR} strokeWidth={4} />
          <line x1={boxX} y1={y < (PLOT_TOP + PLOT_BOTTOM) / 2 ? y : y} x2={boxX} y2={y < (PLOT_TOP + PLOT_BOTTOM) / 2 ? boxY : boxY + 44} stroke={GUESS_COLOR} strokeWidth={2} />
          <GuessBox x={boxX} y={boxY} width={220} line2={choice.short} />
        </g>
      )
    } else {
      const barX = PLOT_RIGHT + 14
      guessMark = (
        <g>
          <Arrow x1={barX} y1={yFor(1.3)} x2={barX} y2={yFor(yMax) + 2} />
          <Arrow x1={barX} y1={yFor(yMax) + 2} x2={barX} y2={yFor(1.3)} />
          <line x1={barX} y1={yFor(4)} x2={boxX + 110} y2={yFor(4)} stroke={GUESS_COLOR} strokeWidth={2} />
          <GuessBox x={boxX} y={yFor(4) - 60} width={220} line2={choice.short} />
        </g>
      )
    }
  }

  return (
    <svg
      viewBox={`0 0 ${GRAPH_WIDTH} ${GRAPH_HEIGHT}`}
      width="100%"
      aria-label="Distance from the black hole against turns, for both probes"
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
      <text x={12} y={20} fill="#e2e8f0" fontSize="12" fontWeight="bold">
        The same two paths as a graph: distance from the black hole against turns
      </text>
      <text x={12} y={38} fill="#94a3b8" fontSize="11">
        Drawn as the run plays. Horizontal: turns around the black hole. Vertical: distance, in horizon radii{logAxis ? ' (log scale)' : ''}.
      </text>

      {ticks.map((v) => (
        <g key={v}>
          <line x1={PLOT_LEFT} y1={yFor(v)} x2={PLOT_RIGHT} y2={yFor(v)} stroke="#334155" />
          <text x={PLOT_LEFT - 8} y={yFor(v) + 4} fill="#94a3b8" fontSize="10" textAnchor="end">
            {v}
          </text>
        </g>
      ))}
      {[0, 2, 4, 6, 8, 10].map((t) => (
        <g key={t}>
          <line x1={xFor(t)} y1={PLOT_BOTTOM} x2={xFor(t)} y2={PLOT_BOTTOM + 5} stroke="#94a3b8" />
          <text x={xFor(t)} y={PLOT_BOTTOM + 18} fill="#94a3b8" fontSize="10" textAnchor="middle">
            {t}
          </text>
        </g>
      ))}
      <text x={(PLOT_LEFT + PLOT_RIGHT) / 2} y={PLOT_BOTTOM + 38} fill="#94a3b8" fontSize="11" textAnchor="middle">
        turns around the black hole
      </text>

      {referenceLines.map((line) => (
        <g key={line.label}>
          <line x1={PLOT_LEFT} y1={yFor(line.value)} x2={PLOT_RIGHT} y2={yFor(line.value)} stroke={line.color} strokeDasharray="5 4" strokeOpacity={0.8} />
          <text x={PLOT_RIGHT - 4} y={yFor(line.value) + line.dy} fill={line.color} fontSize="10" textAnchor="end">
            {line.label}
          </text>
        </g>
      ))}

      <polyline points={ordinaryLine.pts} fill="none" stroke={ORDINARY_COLOR} strokeWidth={3} />
      <polyline points={exactLine.pts} fill="none" stroke={EXACT_COLOR} strokeWidth={3} />
      <circle cx={xFor(ordinaryLine.point.turns)} cy={yFor(ordinaryLine.point.distanceInHorizonRadii)} r={5} fill={ORDINARY_COLOR} />
      <circle cx={xFor(exactLine.point.turns)} cy={yFor(exactLine.point.distanceInHorizonRadii)} r={5} fill={EXACT_COLOR} />
      {exactPlunged && (
        <text x={xFor(exactLine.point.turns) + 8} y={yFor(1) - 18} fill={EXACT_COLOR} fontSize="11" fontWeight="bold">
          plunged after {exactLine.point.turns.toFixed(1)} turns
        </text>
      )}
      {guessMark}

      <line x1={96} y1={PLOT_BOTTOM + 62} x2={126} y2={PLOT_BOTTOM + 62} stroke={ORDINARY_COLOR} strokeWidth={3} />
      <text x={132} y={PLOT_BOTTOM + 66} fill={ORDINARY_COLOR} fontSize="11">
        ordinary gravity
      </text>
      <line x1={286} y1={PLOT_BOTTOM + 62} x2={316} y2={PLOT_BOTTOM + 62} stroke={EXACT_COLOR} strokeWidth={3} />
      <text x={322} y={PLOT_BOTTOM + 66} fill={EXACT_COLOR} fontSize="11">
        the exact theory
      </text>
      <circle cx={466} cy={PLOT_BOTTOM + 62} r={5} fill="#e2e8f0" />
      <text x={478} y={PLOT_BOTTOM + 66} fill="#e2e8f0" fontSize="11">
        dots: the present moment
      </text>
    </svg>
  )
}

// ---------------------------------------------------------------------------------------------------------------
// The captions. What each picture shows is explained at once; its numbers, a worked moment and the "what to look for" list appear only once
// the run has finished, so that nothing is explained before the learner has seen it (CLAUDE.md §12). The last safe orbit's value (3) is
// named in Part 1 only after the run has finished.
// ---------------------------------------------------------------------------------------------------------------
const li = { marginBottom: '0.4rem' } as const
const bullets: CSSProperties = { margin: 0, paddingLeft: '1.1rem', listStyle: 'disc' }
const ol = { margin: 0, paddingLeft: '1.1rem' } as const
const subHead = { marginTop: '0.6rem', marginBottom: '0.3rem' } as const

function LookFor({ look, means, matters }: { look: ReactNode; means: ReactNode; matters: ReactNode }) {
  return (
    <li style={li}>
      <strong>Look at:</strong> {look}
      <br />
      <strong>What it means:</strong> {means}
      <br />
      <strong>Why it matters:</strong> {matters}
    </li>
  )
}
function CaptionTitle({ children }: { children: ReactNode }) {
  return (
    <p style={{ marginTop: 0, marginBottom: '0.5rem' }}>
      <strong>{children}</strong>
    </p>
  )
}
function Later({ children }: { children: ReactNode }) {
  return (
    <p style={{ marginTop: '0.6rem', marginBottom: 0 }}>
      <em>{children}</em>
    </p>
  )
}

// Pictures 1 and 3: the two probes.
export function PanelsCaption({ complete, result, own = false }: { complete: boolean; result: OrbitsNearBlackHoleResult; own?: boolean }) {
  const start = result.startInHorizonRadii
  const pic = own ? 'Picture 3' : 'Picture 1'
  const showRing = own || complete
  const exactTurns = result.exact.turnsCompleted
  return (
    <CaptionBox>
      <CaptionTitle>{own ? 'How to read Picture 3, your two probes.' : 'How to read Picture 1, the two probes at 2 horizon radii.'}</CaptionTitle>
      <p style={{ marginTop: 0, marginBottom: '0.5rem' }}>
        <strong>What you are looking at.</strong> A bird’s-eye view of a small probe circling a black hole. The black hole is the dark disc in the middle. The
        rose-colored ring around it is the <em>horizon</em>, the point of no return. Anything that reaches the horizon cannot come back out. The two
        pictures show the same black hole ({result.preset.label}, {formatMass(result.preset.massSolarMasses)}), the same starting distance ({formatRadii(start)}{' '}
        horizon radii, {formatDistance(result.startKm)} from the center) and the same scale. Only the rule of gravity differs.
      </p>
      <p style={{ marginTop: 0, marginBottom: '0.5rem' }}>
        <strong>What each probe does.</strong> Each starts on the dashed white ring, to the right of the center, and moves around the black hole. The{' '}
        <strong>gold probe</strong> follows <em>ordinary gravity</em>, the rule from Gravity and Curved Spacetime, Experiment 6, and was launched at the speed
        that makes a perfect circle by that rule. The <strong>blue probe</strong> follows the <em>exact theory of gravity</em>, which treats gravity as curved
        spacetime, and was launched at the speed that makes a perfect circle by <em>that</em> rule. The two launch speeds differ, and are listed with the
        results as fractions of the speed of light.
      </p>
      <p style={{ marginTop: 0, marginBottom: '0.5rem' }}>
        <strong>The tiny nudge.</strong> At the start, each probe gets the same very small push toward the black hole: over one full turn it would carry the probe
        in by only about {(NUDGE * 2 * Math.PI * 100).toFixed(1)}% of its distance. It stands in for any small disturbance a real orbit would get, such as a
        grain of dust. Think of lightly tapping a ball that is rolling round the inside of a bowl.
      </p>
      <p style={subHead}>
        <strong>What is drawn</strong>
      </p>
      <ul style={bullets}>
        <li style={li}>
          <strong>The dark disc with the rose ring</strong> is the black hole and its horizon (1 horizon radius). <strong>The dashed white ring</strong> is the
          starting distance.
        </li>
        <li style={li}>
          <strong>The gold and blue dots</strong> are the probes; the trail behind each is where it has been. The numbers above each picture count the turns and
          the distance, in horizon radii.
        </li>
        <li style={li}>
          <strong>The scale bar</strong> says how long some number of horizon radii is. It changes with the start, because each run is zoomed to fit it, so to compare
          one start with another use the bar and the numbers, not the size of the drawing.
        </li>
        {showRing && (
          <li style={li}>
            <strong>The dashed purple ring</strong> in the blue picture is the exact theory’s <em>last safe orbit</em>, at {LAST_SAFE_ORBIT_IN_HORIZON_RADII} horizon
            radii: the closest distance at which a circular orbit can still survive a small nudge. Ordinary gravity has no such ring.
          </li>
        )}
        {!own && complete && (
          <li style={li}>
            <strong>The white marks</strong> are your guesses, and nothing else. The box on the right of the blue picture is your guess for question 1 and is only a
            marker: an outcome has no size, so it is a circle for “wobbles”, an inward arrow for “spirals in” and an outward arrow for “flies off”. The white ring (or
            arrow, or bar) on the left is your guess for question 2, at the distance you chose; “anywhere” has no distance, so it is drawn as a bar.
          </li>
        )}
      </ul>
      <p style={{ ...subHead, marginBottom: '0.3rem' }}>
        <strong>A fair warning.</strong> The gold probe is drawn even close to the black hole, where ordinary gravity is not a good description. It is there so
        that the two rules can be compared, not because ordinary gravity is right there. This picture does not show a traveler falling in, or how the probe was put
        into orbit.
      </p>
      {complete ? (
        <>
          <p style={subHead}>
            <strong>A worked moment, with {own ? 'your' : 'these'} numbers</strong>
          </p>
          <p style={{ marginTop: 0, marginBottom: '0.5rem' }}>
            At {formatRadii(start)} horizon radii the launch speed for a circle is √(1 ÷ (2 × ({formatRadii(start)} − 1))) = {result.exactSpeedFractionOfLight.toFixed(3)} of the
            speed of light in the exact theory, and √(1 ÷ (2 × {formatRadii(start)})) = {result.ordinarySpeedFractionOfLight.toFixed(3)} in ordinary gravity. After the same nudge the{' '}
            {result.exact.outcome === 'plunges'
              ? `blue probe reached the horizon after about ${exactTurns.toFixed(1)} turns`
              : `blue probe kept circling for all ${MAX_TURNS} turns`}
            , while the gold probe {result.ordinary.outcome === 'plunges' ? 'reached the horizon' : `kept circling, never more than ${formatNumber(wobblePercent(result.ordinary, start))}% from its start`}.
          </p>
          <p style={{ marginTop: '0.6rem', marginBottom: '0.3rem' }}>
            <strong>What to look for</strong>
          </p>
          <ol style={ol}>
            <LookFor
              look={<>the blue trail and the gold trail, turn by turn.</>}
              means={<>both probes began at the same place with the same nudge. {result.exact.outcome === 'plunges' ? `The blue one ended at the horizon after about ${exactTurns.toFixed(1)} turns; the gold one did not.` : 'Both are still circling.'}</>}
              matters={<>it tells you whether the nudge alone, with only the rule of gravity changed, can separate two orbits.</>}
            />
            <LookFor
              look={<>the dashed purple ring against the dashed white start ring.</>}
              means={<>the start ring sits {start < LAST_SAFE_ORBIT_IN_HORIZON_RADII ? 'inside' : start === LAST_SAFE_ORBIT_IN_HORIZON_RADII ? 'on' : 'outside'} the purple ring (the last safe orbit, {LAST_SAFE_ORBIT_IN_HORIZON_RADII} horizon radii).</>}
              matters={<>the exact theory says a nudged circle does not last at or inside the purple ring; the tutor goes through how this compares with what you saw.</>}
            />
            {!own && (
              <LookFor
                look={<>the white marks beside the blue probe, and the white ring or arrow on its left.</>}
                means={<>they are your guesses: the box on the right is your guess of what happens to the probe, a marker only; the ring or arrow on the left is where you said the last safe place is.</>}
                matters={<>they let you compare your guesses with the blue trail and the purple ring at a glance. They are only your guesses; the tutor will say how they compare.</>}
              />
            )}
          </ol>
        </>
      ) : (
        <Later>
          When the run finishes, a worked example with these numbers and a “what to look for” list appear here.
        </Later>
      )}
      <p style={{ margin: '0.6rem 0 0', fontSize: '0.75rem' }}>{pic} shows the probes only; the graph below shows the same two paths as distances.</p>
    </CaptionBox>
  )
}

// Picture 1b: the same two probes at 20 horizon radii.
export function FarPairCaption({ complete, result }: { complete: boolean; result: OrbitsNearBlackHoleResult }) {
  return (
    <CaptionBox>
      <CaptionTitle>How to read Picture 1b, the same two probes at 20 horizon radii.</CaptionTitle>
      <p style={{ marginTop: 0, marginBottom: '0.5rem' }}>
        <strong>What you are looking at.</strong> The same black hole, the same two rules and the same tiny nudge as in Picture 1, but the probes now start far out, at{' '}
        {FAR_START_IN_HORIZON_RADII} horizon radii ({formatDistance(result.startKm)} from the center). The two small pictures are drawn at one scale; at this scale
        the black hole is only a dot. Gold is ordinary gravity and blue is the exact theory, as before. Both play at the same time as Picture 1.
      </p>
      <p style={subHead}>
        <strong>What is drawn</strong>
      </p>
      <ul style={bullets}>
        <li style={li}>
          <strong>Dots, trails and rings</strong> mean the same as in Picture 1. The launch speeds are {result.ordinarySpeedFractionOfLight.toFixed(3)} (ordinary gravity)
          and {result.exactSpeedFractionOfLight.toFixed(3)} (the exact theory) of the speed of light, written as fractions: 0.1 is a tenth of the speed of light.
        </li>
        {complete && (
          <li style={li}>
            <strong>The white bracket</strong> under the two pictures, with its YOUR GUESS box and a sign, is your guess for question 3. It is only a marker:{' '}
            “≠” means you guessed that the two orbits look very different, “≈” that they look nearly the same.
          </li>
        )}
      </ul>
      {complete ? (
        <>
          <p style={subHead}>
            <strong>A worked moment</strong>
          </p>
          <p style={{ marginTop: 0, marginBottom: '0.5rem' }}>
            The two launch speeds, {result.ordinarySpeedFractionOfLight.toFixed(3)} and {result.exactSpeedFractionOfLight.toFixed(3)}, differ by {formatNumber(speedGapPercent(FAR_START_IN_HORIZON_RADII))}%:{' '}
            {result.exactSpeedFractionOfLight.toFixed(3)} ÷ {result.ordinarySpeedFractionOfLight.toFixed(3)} = {(result.exactSpeedFractionOfLight / result.ordinarySpeedFractionOfLight).toFixed(3)}.
            After the nudge the two probes ended the run {result.exact.outcome === result.ordinary.outcome ? 'in the same way' : 'in different ways'}.
          </p>
          <p style={{ marginTop: '0.6rem', marginBottom: '0.3rem' }}>
            <strong>What to look for</strong>
          </p>
          <ol style={ol}>
            <LookFor
              look={<>the gold trail and the blue trail, side by side.</>}
              means={<>
                the blue probe stayed within {formatNumber(wobblePercent(result.exact, FAR_START_IN_HORIZON_RADII))}% of its start and the gold within{' '}
                {formatNumber(wobblePercent(result.ordinary, FAR_START_IN_HORIZON_RADII))}%.
              </>}
              matters={<>it shows how the two rules compare far from the black hole, where the earlier chapters’ planets and satellites sit.</>}
            />
            <LookFor
              look={<>the white bracket and its sign.</>}
              means={<>your guess for question 3, a marker only.</>}
              matters={<>it lets you compare your guess with the two trails at a glance. The tutor says how it compares.</>}
            />
          </ol>
        </>
      ) : (
        <Later>When the run finishes, the launch speeds’ comparison and a “what to look for” list appear here.</Later>
      )}
    </CaptionBox>
  )
}

// Pictures 2 and 4: the graph.
export function GraphCaption({ complete, result, own = false }: { complete: boolean; result: OrbitsNearBlackHoleResult; own?: boolean }) {
  const start = result.startInHorizonRadii
  const showLine = own || complete
  return (
    <CaptionBox>
      <CaptionTitle>{own ? 'How to read Picture 4, your graph: distance against turns.' : 'How to read Picture 2, the graph: distance against turns.'}</CaptionTitle>
      <p style={{ marginTop: 0, marginBottom: '0.5rem' }}>
        <strong>What you are looking at.</strong> The probes’ pictures show the paths as seen from above. This graph shows the same two paths in a different way. It
        leaves out which direction a probe is in and keeps one fact: how far it is from the black hole.
      </p>
      <p style={subHead}>
        <strong>What is drawn</strong>
      </p>
      <ul style={bullets}>
        <li style={li}>
          <strong>The axes.</strong> Along the bottom: how many turns the probe has made (0 to {MAX_TURNS}). Up the side: its distance from the center, in horizon radii, where 1
          means it is on the horizon.{own ? '' : ` The vertical scale is logarithmic and runs from 1 to ${PART_ONE_GRAPH_MAX_IN_HORIZON_RADII}, so that equal steps multiply the distance by the same amount.`}
        </li>
        <li style={li}>
          <strong>The gold line</strong> is the ordinary-gravity probe and <strong>the blue line</strong> is the exact-theory probe. They are drawn as the run plays, and
          each dot marks the present moment.
        </li>
        <li style={li}>
          <strong>The dashed lines are distances to compare with.</strong> Rose: the horizon (1). White: where the probes started ({formatRadii(start)}).
          {showLine && <> Purple: the exact theory’s last safe orbit ({LAST_SAFE_ORBIT_IN_HORIZON_RADII} horizon radii).</>}
        </li>
        {!own && complete && (
          <li style={li}>
            <strong>The white line or bar</strong>, with its YOUR GUESS box, is your guess for question 2, at the distance you chose. “Anywhere” has no distance, so it is a
            bar down the right side. It is only your guess.
          </li>
        )}
      </ul>
      <p style={{ ...subHead, marginBottom: '0.3rem' }}>
        <strong>How to read a line.</strong> Think of a car driving round and round a ring road, with a graph of its distance from home. A flat line means the car keeps
        the same distance and just goes round and round. A line sloping down means it is getting closer to home.
      </p>
      {complete ? (
        <>
          <p style={subHead}>
            <strong>A worked moment</strong>
          </p>
          <p style={{ marginTop: 0, marginBottom: '0.5rem' }}>
            {result.exact.outcome === 'plunges'
              ? `The blue line starts at ${formatRadii(start)} and falls to 1 (the horizon) after about ${result.exact.turnsCompleted.toFixed(1)} turns, where it stops.`
              : `The blue line stays near ${formatRadii(start)} for all ${MAX_TURNS} turns, between ${result.exact.closestInHorizonRadii.toFixed(2)} and ${result.exact.farthestInHorizonRadii.toFixed(2)}.`}{' '}
            The gold line stays between {result.ordinary.closestInHorizonRadii.toFixed(3)} and {result.ordinary.farthestInHorizonRadii.toFixed(3)}.
          </p>
          <p style={{ marginTop: '0.6rem', marginBottom: '0.3rem' }}>
            <strong>What to look for</strong>
          </p>
          <ol style={ol}>
            <LookFor
              look={<>whether each line is flat or slopes down.</>}
              means={<>{result.exact.outcome === 'plunges' ? 'the blue line slopes down to the horizon; the gold line is flat.' : 'both lines are flat.'}</>}
              matters={<>a flat line is an orbit that survived the nudge; a falling line is one that did not.</>}
            />
            <LookFor
              look={<>the blue line against the purple dashed line.</>}
              means={<>the start ({formatRadii(start)}) is {start < LAST_SAFE_ORBIT_IN_HORIZON_RADII ? 'below' : start === LAST_SAFE_ORBIT_IN_HORIZON_RADII ? 'on' : 'above'} the purple line ({LAST_SAFE_ORBIT_IN_HORIZON_RADII}).</>}
              matters={<>the purple line is the last safe orbit; the tutor goes through how this compares with what you saw.</>}
            />
            {!own && (
              <LookFor
                look={<>the white line or bar against the purple line.</>}
                means={<>the white line is your guess for the last safe place, a marker only.</>}
                matters={<>it lets you compare your guess with the real line at a glance. The tutor says how it compares.</>}
              />
            )}
          </ol>
        </>
      ) : (
        <Later>When the run finishes, a worked example with these numbers and a “what to look for” list appear here.</Later>
      )}
    </CaptionBox>
  )
}
