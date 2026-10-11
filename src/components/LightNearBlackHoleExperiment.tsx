import { useEffect, useMemo, useState } from 'react'
import type { CSSProperties, ReactNode } from 'react'
import {
  BLACK_HOLE_PRESETS,
  CRITICAL_AIM_IN_HORIZON_RADII,
  MAX_AIM_IN_HORIZON_RADII,
  MIN_AIM_IN_HORIZON_RADII,
  PHOTON_SPHERE_IN_HORIZON_RADII,
  bendCurve,
  runLightNearBlackHoleExperiment,
  weakFieldBendRadians,
} from '../physics/lightNearBlackHoleExperiment'
import type { LightPath } from '../physics/lightNearBlackHoleExperiment'
import type { ObjectPreset } from '../physics/blackHoleSizeExperiment'

interface LightNearBlackHoleExperimentProps {
  onComplete?: () => void
}

// The path picture: a title strip, a square area seen from above, and a legend strip. The view is zoomed to the aim: it
// reaches ZOOM_MARGIN times the larger of the aim and the critical aim (and never less than MIN_VIEW_RADIUS horizon
// radii), with a scale bar saying how long some number of horizon radii is.
const PANEL_WIDTH = 400
const PANEL_HEIGHT = 520
const CENTER_X = 200
const CENTER_Y = 256
const AREA_RADIUS_PX = 170
const ZOOM_MARGIN = 1.25
const MIN_VIEW_RADIUS = 4
const SCALE_BAR_LENGTHS = [1, 2, 5, 10, 20]
const LEGEND_TOP = 446

// Fixed real-world playback duration for the whole flyby, independent of the physics result (CLAUDE.md §11).
const ANIMATION_DURATION_MS = 8000

const KM_PER_AU = 149_597_870.7

const LIGHT_COLOR = '#22d3ee' // the exact theory, as in Experiment 3
const SIMPLE_COLOR = '#fb923c' // the simple formula of Gravity Experiment 8
const HORIZON_COLOR = '#fb7185'
const BLACK_HOLE_COLOR = '#e879f9'
const PHOTON_COLOR = '#a78bfa'
const CRITICAL_COLOR = '#4ade80'
const NO_GRAVITY_COLOR = '#e2e8f0'

const AIM_PRESETS = [20, 10, 5, 3.5, 3, 2.7, 2.6, 2.5, 1.5]

// This experiment's three prediction questions, per its specification's "Prediction Activity". Choices are not scored
// here; they are compared with the model's results later. The question wording is a draft for the owner's review.
type BendChoice = 'straight' | 'bent' | 'captured'
const bendChoices: Array<{ value: BendChoice; label: string }> = [
  { value: 'straight', label: 'It goes straight on, barely changed' },
  { value: 'bent', label: 'It is bent noticeably and then escapes' },
  { value: 'captured', label: 'It is captured' },
]

type CaptureChoice = 'horizon' | 'critical' | 'ten'
const captureChoices: Array<{ value: CaptureChoice; label: string }> = [
  { value: 'horizon', label: 'Only if aimed at the horizon itself, 1 horizon radius' },
  { value: 'critical', label: 'About 2.6 horizon radii' },
  { value: 'ten', label: 'About 10 horizon radii' },
]

type JustOutsideChoice = 'small-bend' | 'swings' | 'captured-anyway'
const justOutsideChoices: Array<{ value: JustOutsideChoice; label: string }> = [
  { value: 'small-bend', label: 'It passes with only a small bend' },
  { value: 'swings', label: 'It swings around the black hole, more than half a turn, and then escapes' },
  { value: 'captured-anyway', label: 'It is captured anyway' },
]

// The graph of the total bend against the aim (the second picture).
const GRAPH_WIDTH = 640
const GRAPH_HEIGHT = 400
const PLOT_LEFT = 70
const PLOT_RIGHT = 610
const PLOT_TOP = 66
const PLOT_BOTTOM = 290
const GRAPH_MAX_DEGREES = 400

// Caption blocks under each picture (small, muted text, like the other captions in this project).
const CAPTION_STYLE: CSSProperties = { fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.5rem' }
const CAPTION_PARAGRAPH_STYLE: CSSProperties = { marginTop: 0, marginBottom: '0.4rem' }

const toDegrees = (radians: number) => (radians * 180) / Math.PI

// Three significant figures, with no trailing zeros ("10", "2.95", "235,571").
function formatNumber(value: number): string {
  if (value >= 1000) return Number(value.toPrecision(3)).toLocaleString('en-US')
  return String(Number(value.toPrecision(3)))
}

// A distance in horizon radii, with enough digits to tell 2.6 from 2.598 on the slider.
function formatRadii(value: number): string {
  return value < 10 ? String(Number(value.toPrecision(3))) : formatNumber(value)
}

// A length in plain units, from meters to trillions of kilometers.
function formatLength(km: number): string {
  if (km < 1) return `${formatNumber(km * 1000)} m`
  if (km < 1e6) return `${formatNumber(km)} km`
  if (km < 1e9) return `${formatNumber(km / 1e6)} million km`
  if (km < 1e12) return `${formatNumber(km / 1e9)} billion km`
  return `${formatNumber(km / 1e12)} trillion km`
}

// Kilometers, with astronomical units added once that is the more natural unit.
function formatDistance(km: number): string {
  return km >= 7.5e6 ? `${formatLength(km)}, about ${formatNumber(km / KM_PER_AU)} AU` : formatLength(km)
}

function formatMass(solarMasses: number): string {
  if (solarMasses < 1e3) return `${solarMasses} solar masses`
  if (solarMasses < 1e9) return `${solarMasses / 1e6} million solar masses`
  return `${solarMasses / 1e9} billion solar masses`
}

// The part of the path that is inside the picture's view, as a range of point indices. The first points are already
// far outside it, and an escaping beam leaves it again.
function viewRange(path: LightPath, viewRadius: number) {
  let first = path.points.findIndex((p) => p.distanceInHorizonRadii <= viewRadius)
  if (first < 0) first = path.points.length - 1
  let last = path.points.length - 1
  while (last > first && path.points[last].distanceInHorizonRadii > viewRadius) last--
  return { first: Math.max(first - 1, 0), last }
}

function LightPanel({
  path,
  aim,
  viewRadius,
  pixelsPerHorizonRadius,
  scaleBarHorizonRadii,
  progress,
}: {
  path: LightPath
  aim: number
  viewRadius: number
  pixelsPerHorizonRadius: number
  scaleBarHorizonRadii: number
  progress: number
}) {
  const range = useMemo(() => viewRange(path, viewRadius), [path, viewRadius])
  const index = Math.min(range.first + Math.round(progress * (range.last - range.first)), range.last)
  const point = path.points[index]
  const finished = progress >= 1
  const captured = path.outcome === 'captured' && finished

  const px = (x: number) => CENTER_X + x * pixelsPerHorizonRadius
  const py = (y: number) => CENTER_Y - y * pixelsPerHorizonRadius

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
  const ringLabels = [
    { text: 'critical aim', radius: CRITICAL_AIM_IN_HORIZON_RADII, color: CRITICAL_COLOR, y: 74 },
    { text: 'light can circle here', radius: PHOTON_SPHERE_IN_HORIZON_RADII, color: PHOTON_COLOR, y: 88 },
    { text: 'horizon', radius: 1, color: HORIZON_COLOR, y: 102 },
  ]

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
    {
      key: 'rings',
      draw: <circle cx={20} cy={LEGEND_TOP + 56} r={5} fill="none" stroke={PHOTON_COLOR} strokeDasharray="3 2" />,
      text: 'purple ring: where light can circle. Green ring: the critical aim',
      fill: '#cbd5e1',
    },
  ]

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
        <clipPath id="light-area">
          <rect x={0} y={60} width={PANEL_WIDTH} height={PANEL_HEIGHT - 60 - 90} />
        </clipPath>
      </defs>
      <text x={12} y={20} fill={LIGHT_COLOR} fontSize="13" fontWeight="bold">
        The path of the light, seen from above
      </text>
      <text x={12} y={38} fill="#94a3b8" fontSize="11">
        Angle swept: {formatNumber(toDegrees(point.phi))}° &nbsp;|&nbsp; distance:{' '}
        {point.distanceInHorizonRadii.toFixed(2)} horizon radii
      </text>
      <text x={12} y={54} fill={captured ? HORIZON_COLOR : '#94a3b8'} fontSize="11" fontWeight={captured ? 'bold' : 'normal'}>
        {captured
          ? 'Captured: the light reached the horizon'
          : finished
            ? `Escaped, bent by ${formatNumber(toDegrees(path.bendRadians as number))}°`
            : progress > 0
              ? 'On its way'
              : 'Ready'}
      </text>

      <g clipPath="url(#light-area)">
        {/* The rings: the critical aim and where light can circle */}
        <circle cx={CENTER_X} cy={CENTER_Y} r={CRITICAL_AIM_IN_HORIZON_RADII * pixelsPerHorizonRadius} fill="none" stroke={CRITICAL_COLOR} strokeDasharray="4 3" />
        <circle cx={CENTER_X} cy={CENTER_Y} r={PHOTON_SPHERE_IN_HORIZON_RADII * pixelsPerHorizonRadius} fill="none" stroke={PHOTON_COLOR} strokeDasharray="4 3" />

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
      <text
        x={px(edge * 0.7) > PANEL_WIDTH - 12 ? PANEL_WIDTH - 12 : px(edge * 0.7)}
        y={py(aim) - 6}
        fill={NO_GRAVITY_COLOR}
        fontSize="10"
        textAnchor="end"
      >
        path with no gravity
      </text>
      {path.outcome === 'escapes' && finished && (
        <text x={12} y={PANEL_HEIGHT - 100} fill={LIGHT_COLOR} fontSize="10">
          dotted blue line: the direction the light ends up heading
        </text>
      )}
      <text x={px(point.x) > PANEL_WIDTH - 40 ? px(point.x) - 8 : px(point.x) + 8} y={py(point.y) - 8} fill={LIGHT_COLOR} fontSize="10" textAnchor={px(point.x) > PANEL_WIDTH - 40 ? 'end' : 'start'}>
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

// The total bend against the aim: the exact answer (blue) and the simple formula of Gravity Experiment 8 (orange), with
// the chosen aim marked on both.
function BendGraph({ aim, outcome, exactDegrees }: { aim: number; outcome: LightPath['outcome']; exactDegrees: number | null }) {
  const curve = useMemo(() => bendCurve(), [])
  const logSpan = Math.log(MAX_AIM_IN_HORIZON_RADII / MIN_AIM_IN_HORIZON_RADII)
  const xFor = (b: number) => PLOT_LEFT + (Math.log(b / MIN_AIM_IN_HORIZON_RADII) / logSpan) * (PLOT_RIGHT - PLOT_LEFT)
  const yFor = (degrees: number) => PLOT_BOTTOM - (degrees / GRAPH_MAX_DEGREES) * (PLOT_BOTTOM - PLOT_TOP)

  const exactLine = curve.map((p) => `${xFor(p.aim)},${yFor(toDegrees(p.bendRadians))}`).join(' ')
  const simpleAims = Array.from({ length: 80 }, (_, i) => MIN_AIM_IN_HORIZON_RADII * (MAX_AIM_IN_HORIZON_RADII / MIN_AIM_IN_HORIZON_RADII) ** (i / 79))
  const simpleLine = simpleAims.map((b) => `${xFor(b)},${yFor(toDegrees(weakFieldBendRadians(b)))}`).join(' ')

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

      {/* The captured region and the critical aim */}
      <rect x={PLOT_LEFT} y={PLOT_TOP} width={xFor(CRITICAL_AIM_IN_HORIZON_RADII) - PLOT_LEFT} height={PLOT_BOTTOM - PLOT_TOP} fill={HORIZON_COLOR} fillOpacity={0.12} />
      <text x={(PLOT_LEFT + xFor(CRITICAL_AIM_IN_HORIZON_RADII)) / 2} y={PLOT_TOP + 70} fill={HORIZON_COLOR} fontSize="10" textAnchor="middle">
        captured:
      </text>
      <text x={(PLOT_LEFT + xFor(CRITICAL_AIM_IN_HORIZON_RADII)) / 2} y={PLOT_TOP + 83} fill={HORIZON_COLOR} fontSize="10" textAnchor="middle">
        no bend to show
      </text>
      <line x1={xFor(CRITICAL_AIM_IN_HORIZON_RADII)} y1={PLOT_TOP} x2={xFor(CRITICAL_AIM_IN_HORIZON_RADII)} y2={PLOT_BOTTOM} stroke={CRITICAL_COLOR} strokeDasharray="5 4" />
      <text x={xFor(CRITICAL_AIM_IN_HORIZON_RADII) + 5} y={PLOT_TOP + 12} fill={CRITICAL_COLOR} fontSize="10">
        critical aim ({formatNumber(CRITICAL_AIM_IN_HORIZON_RADII)})
      </text>

      <g clipPath="url(#bend-plot)">
        <polyline points={simpleLine} fill="none" stroke={SIMPLE_COLOR} strokeWidth={2.5} />
        <polyline points={exactLine} fill="none" stroke={LIGHT_COLOR} strokeWidth={2.5} />
      </g>

      {/* The chosen aim */}
      <line x1={xFor(aim)} y1={PLOT_TOP} x2={xFor(aim)} y2={PLOT_BOTTOM} stroke="#e2e8f0" strokeDasharray="1 4" strokeOpacity={0.8} />
      <circle cx={xFor(aim)} cy={yFor(Math.min(toDegrees(weakFieldBendRadians(aim)), GRAPH_MAX_DEGREES))} r={5} fill={SIMPLE_COLOR} />
      {outcome === 'escapes' && exactDegrees !== null && (
        <circle cx={xFor(aim)} cy={yFor(Math.min(exactDegrees, GRAPH_MAX_DEGREES))} r={5} fill={LIGHT_COLOR} />
      )}
      {outcome === 'captured' && (
        <text x={xFor(aim)} y={PLOT_BOTTOM - 8} fill={HORIZON_COLOR} fontSize="11" fontWeight="bold" textAnchor="middle">
          ×
        </text>
      )}
      <text x={Math.min(xFor(aim) + 8, PLOT_RIGHT - 70)} y={PLOT_BOTTOM - 8} fill="#e2e8f0" fontSize="10">
        your aim
      </text>

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
        dots: your aim on each curve
      </text>
    </svg>
  )
}

export function LightNearBlackHoleExperiment({ onComplete }: LightNearBlackHoleExperimentProps) {
  const [presetId, setPresetId] = useState<ObjectPreset['id']>('stellar-black-hole')
  const [aim, setAim] = useState(5)
  const [status, setStatus] = useState<'idle' | 'running' | 'complete'>('idle')
  const [progress, setProgress] = useState(0)

  const [bendPrediction, setBendPrediction] = useState<BendChoice | null>(null)
  const [capturePrediction, setCapturePrediction] = useState<CaptureChoice | null>(null)
  const [justOutsidePrediction, setJustOutsidePrediction] = useState<JustOutsideChoice | null>(null)
  const [submittedBend, setSubmittedBend] = useState<BendChoice | null>(null)
  const [submittedCapture, setSubmittedCapture] = useState<CaptureChoice | null>(null)
  const [submittedJustOutside, setSubmittedJustOutside] = useState<JustOutsideChoice | null>(null)

  const hasPrediction = bendPrediction !== null && capturePrediction !== null && justOutsidePrediction !== null
  const hasSubmittedPrediction = submittedBend !== null && submittedCapture !== null && submittedJustOutside !== null

  const result = useMemo(() => runLightNearBlackHoleExperiment(presetId, aim), [presetId, aim])

  // The zoom of the path picture.
  const viewRadius = Math.max(ZOOM_MARGIN * Math.max(aim, CRITICAL_AIM_IN_HORIZON_RADII), MIN_VIEW_RADIUS)
  const pixelsPerHorizonRadius = AREA_RADIUS_PX / viewRadius
  const scaleBarHorizonRadii = [...SCALE_BAR_LENGTHS].reverse().find((n) => n <= viewRadius / 2.5) ?? 1

  const handlePresetChange = (id: ObjectPreset['id']) => {
    setPresetId(id)
    setStatus('idle')
    setProgress(0)
  }

  const handleAimChange = (value: number) => {
    setAim(value)
    setStatus('idle')
    setProgress(0)
  }

  const handleRun = () => {
    if (!hasPrediction || status === 'running') return
    if (!hasSubmittedPrediction) {
      setSubmittedBend(bendPrediction)
      setSubmittedCapture(capturePrediction)
      setSubmittedJustOutside(justOutsidePrediction)
    }
    setStatus('running')
    setProgress(0)
  }

  // Matches the rest of the project's precedent: re-opens all three questions for editing without resetting the
  // chosen black hole or aim.
  const handleChangePrediction = () => {
    setSubmittedBend(null)
    setSubmittedCapture(null)
    setSubmittedJustOutside(null)
    setStatus('idle')
    setProgress(0)
  }

  useEffect(() => {
    if (status !== 'running') return

    const startTime = performance.now()
    let frameId: number

    const animate = (currentTime: number) => {
      const fraction = Math.min(Math.max((currentTime - startTime) / ANIMATION_DURATION_MS, 0), 1)
      setProgress(fraction)

      if (fraction >= 1) {
        setStatus('complete')
        onComplete?.()
        return
      }

      frameId = requestAnimationFrame(animate)
    }

    frameId = requestAnimationFrame(animate)

    return () => cancelAnimationFrame(frameId)
  }, [status, onComplete])

  const isPresetSelected = (d: number) => Math.abs(Math.log(d / aim)) < 1e-9
  const exactDegrees = result.path.bendRadians === null ? null : toDegrees(result.path.bendRadians)
  const outcomeSoFar =
    status === 'idle' ? '—' : progress < 1 ? 'on its way' : result.path.outcome === 'captured' ? 'captured' : 'escaped'

  return (
    <div style={{ padding: '2rem', maxWidth: '900px', margin: '0 auto' }}>
      <h2>Experiment 4 — Light Near a Black Hole: Can Light Be Trapped?</h2>

      <div className="exp-card" style={{ marginTop: '2rem', padding: '1.5rem' }}>
        {/* DRAFT wording, for the owner's line-by-line review (CLAUDE.md §28.1). It must not give away the answers to
            the three predictions below (§12): no mention of where light is captured, of light swinging around the
            black hole, or of how much larger the bend is than the simple formula says. */}
        <div style={{ marginBottom: '2rem', fontSize: '0.875rem', color: 'var(--text-muted)' }}>
          <p style={{ marginTop: 0, marginBottom: '0.75rem' }}>
            <strong>The question.</strong> In Gravity and Curved Spacetime, Experiment 8, you saw that gravity bends
            the path of light that passes near a mass, and you met a simple formula for how much. Close to a black
            hole, gravity is as strong as it ever gets (you saw that in Experiment 2 of this chapter). So how much
            does a black hole bend light that passes by? And what happens to light that passes very close?
          </p>
          <p style={{ marginTop: 0, marginBottom: '0.75rem' }}>
            <strong>Why even ask this.</strong> In everyday life, light seems to travel in perfectly straight lines.
            A torch beam, a laser pointer and sunlight all go straight, and nothing we can see bends them. The
            bending in Experiment 8 was small, because the gravity there was gentle. But that experiment used a
            simple formula made for gentle gravity. This experiment asks what happens to light where gravity is at
            its strongest.
          </p>
          <p style={{ marginTop: 0, marginBottom: '0.25rem' }}>
            <strong>What happens.</strong> Here is the whole experiment, step by step.
          </p>
          <ol style={{ marginTop: 0, marginBottom: '0.75rem', paddingLeft: '1.25rem' }}>
            <li>You choose a black hole, and an aim distance (explained just below).</li>
            <li>
              <strong>The aim distance is how close to the black hole's center a beam of light would pass if gravity
              did nothing.</strong> Think of rolling a ball in a straight line past a post: the aim distance is how
              far from the post the ball's straight path goes. A small aim distance means the ball would pass close
              to the post. A large one means it would pass far away.
            </li>
            <li>
              A thin beam of light comes in from very far away, from the right, along that straight line. The first
              picture draws the line as a dashed white line, so you can see where the light would go with no
              gravity.
            </li>
            <li>
              But gravity does act. The picture also draws the path the light really takes, worked out with the{' '}
              <strong>exact theory of gravity</strong> (general relativity, the theory that gravity is curved
              spacetime).
            </li>
            <li>
              You press Run and watch for a few seconds. Either the light gets past the black hole and goes on its
              way, or it reaches the black hole's edge and goes no further.
            </li>
            <li>
              If the light gets away, its direction has been turned. The angle it has been turned through is called
              the <strong>bend</strong>. A bend of 0° would mean no bend at all. A bend of 180° would mean the light
              ends up heading back the way it came.
            </li>
            <li>
              A second picture is a graph of the bend for every aim distance from 1 to 20 horizon radii, so you can
              see how the bend changes as the aim gets closer. It also shows the simple formula from Experiment 8,
              for comparison.
            </li>
          </ol>
          <p style={{ marginTop: 0, marginBottom: '0.75rem' }}>
            The question each picture answers is the same: what does the black hole do to the light?
          </p>
          <p style={{ marginTop: 0, marginBottom: '0.75rem' }}>
            <strong>Some words we will use.</strong> The <strong>aim distance</strong> is the distance described
            above. The <strong>bend</strong> is the angle the light's direction is turned through, as above. Light
            that reaches the black hole's edge and goes no further is <strong>captured</strong>. The{' '}
            <strong>horizon</strong> is that edge, the one-way boundary you met in Experiment 1 of this chapter. The{' '}
            <strong>horizon radius</strong> is the distance from the black hole's center to its horizon, and we
            measure distances in horizon radii: 10 horizon radii means ten times as far from the center as the edge
            is. For the biggest black holes the distances in kilometers are huge, so we also give them in{' '}
            <strong>astronomical units</strong> (AU): 1 AU is the distance from the Earth to the Sun, about 150
            million kilometers.
          </p>
          <p style={{ marginTop: 0, marginBottom: '0.75rem' }}>
            <strong>The black holes.</strong> They are the three from Experiments 1, 2 and 3: a stellar black hole of
            10 Suns' worth of mass (a round, illustrative value), Sagittarius A*, the black hole at the center of
            our galaxy, and M87*, the black hole imaged in the galaxy M87. Their masses are about 4.3 million and
            6.5 billion Suns.
          </p>
          <p style={{ marginTop: 0, marginBottom: '0.75rem' }}>
            <strong>What this builds on.</strong> Gravity and Curved Spacetime, Experiment 8 gave you the bending of
            light by a mass. Experiment 1 of this chapter gave you the horizon radius, Experiment 2 showed that
            gravity close to a horizon is strong enough to change how clocks tick, and Experiment 3 asked what that
            strong gravity does to the orbit of a small probe. Here we ask what it does to light.
          </p>
          <p style={{ marginTop: 0, marginBottom: '0.75rem' }}>
            <strong>Your job.</strong> First, make three predictions. Then choose a black hole and an aim distance,
            and run it. Try other aim distances and other black holes too, and compare.
          </p>
          <p style={{ marginTop: 0, marginBottom: '0.75rem' }}>
            <strong>What to look for.</strong> How the light's real path differs from the dashed straight line, how
            the bend changes as you aim closer, and what happens to the light when you aim very close.
          </p>
          <p style={{ marginTop: 0, marginBottom: '0.25rem' }}>
            <strong>What we assume.</strong>
          </p>
          <ul style={{ marginTop: 0, marginBottom: 0, paddingLeft: '1.25rem' }}>
            <li>
              <strong>This is a thought experiment about a thin beam of light.</strong> The beam's own gravity does
              not matter. How it got there is not described.
            </li>
            <li>
              <strong>The exact theory's equation is given, not derived.</strong> It is the standard equation for
              light passing a black hole that does not spin and has no electric charge. Real black holes usually
              spin, which changes the details.
            </li>
            <li>
              <strong>The light moves in a flat plane,</strong> seen from above, and nothing else (no gas, no dust,
              no other star) is in the way.
            </li>
            <li>
              <strong>"Captured" means the light reaches the horizon.</strong> Nothing past that is modeled.
            </li>
            <li>
              <strong>The simple formula in the graph is only a comparison.</strong> It comes from Experiment 8 and
              was made for weak gravity, far from a mass.
            </li>
            <li>
              <strong>This is not a camera view.</strong> It follows one thin beam, not the picture a telescope would
              make.
            </li>
          </ul>
        </div>

        <div style={{ marginBottom: '1.5rem' }}>
          <p style={{ fontSize: '0.875rem', marginBottom: '0.75rem' }}>
            A beam of light is aimed to pass a black hole at 5 horizon radii from its center, well outside the edge.
            What happens to its path?
          </p>
          <div style={{ marginBottom: '0.5rem' }}>
            {bendChoices.map((choice) => (
              <button
                key={choice.value}
                type="button"
                onClick={() => setBendPrediction(choice.value)}
                disabled={hasSubmittedPrediction}
                className={`toggle-button${bendPrediction === choice.value ? ' is-selected' : ''}`}
                style={{ marginRight: '0.5rem', marginBottom: '0.5rem' }}
              >
                {choice.label}
              </button>
            ))}
          </div>

          <p style={{ fontSize: '0.875rem', marginBottom: '0.75rem' }}>
            How close to a black hole's center must light be aimed to be captured?
          </p>
          <div style={{ marginBottom: '0.5rem' }}>
            {captureChoices.map((choice) => (
              <button
                key={choice.value}
                type="button"
                onClick={() => setCapturePrediction(choice.value)}
                disabled={hasSubmittedPrediction}
                className={`toggle-button${capturePrediction === choice.value ? ' is-selected' : ''}`}
                style={{ marginRight: '0.5rem', marginBottom: '0.5rem' }}
              >
                {choice.label}
              </button>
            ))}
          </div>

          <p style={{ fontSize: '0.875rem', marginBottom: '0.75rem' }}>
            Light is aimed only a tiny bit farther out than the capture distance. What happens?
          </p>
          <div style={{ marginBottom: '0.5rem' }}>
            {justOutsideChoices.map((choice) => (
              <button
                key={choice.value}
                type="button"
                onClick={() => setJustOutsidePrediction(choice.value)}
                disabled={hasSubmittedPrediction}
                className={`toggle-button${justOutsidePrediction === choice.value ? ' is-selected' : ''}`}
                style={{ marginRight: '0.5rem', marginBottom: '0.5rem' }}
              >
                {choice.label}
              </button>
            ))}
          </div>

          <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
            {hasPrediction || hasSubmittedPrediction
              ? `Your predictions: ${
                  bendChoices.find((c) => c.value === (bendPrediction ?? submittedBend))!.label
                }; ${captureChoices.find((c) => c.value === (capturePrediction ?? submittedCapture))!.label}; ${
                  justOutsideChoices.find((c) => c.value === (justOutsidePrediction ?? submittedJustOutside))!.label
                }`
              : 'Answer all three questions to continue'}
          </p>
        </div>

        {hasSubmittedPrediction && (
          <div style={{ marginTop: '-0.5rem', marginBottom: '1rem' }}>
            <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '0.5rem' }}>
              Your predictions are locked in above. You can still try as many black holes and aims as you like
              below. Or, change your predictions and start over:
            </p>
            <button
              type="button"
              onClick={handleChangePrediction}
              className="secondary-button"
              style={{
                padding: '0.5rem 1.25rem',
                fontSize: '0.875rem',
                cursor: 'pointer',
                backgroundColor: 'rgba(124, 58, 237, 0.22)',
              }}
            >
              Change predictions
            </button>
          </div>
        )}

        <div style={{ marginBottom: '1.5rem' }}>
          <p style={{ fontSize: '0.875rem', marginBottom: '0.5rem' }}>Black hole:</p>
          {BLACK_HOLE_PRESETS.map((p) => (
            <button
              key={p.id}
              type="button"
              onClick={() => handlePresetChange(p.id)}
              disabled={!hasPrediction || status === 'running'}
              className={`toggle-button${presetId === p.id ? ' is-selected' : ''}`}
              style={{ marginRight: '0.5rem', marginBottom: '0.5rem' }}
            >
              {p.label}
            </button>
          ))}
        </div>

        <div style={{ marginBottom: '1.5rem' }}>
          <p style={{ fontSize: '0.875rem', marginBottom: '0.5rem' }}>
            Aim a beam of light so that, if gravity did nothing, it would pass this far from the black hole's center:
          </p>
          {AIM_PRESETS.map((d) => (
            <button
              key={d}
              type="button"
              onClick={() => handleAimChange(d)}
              disabled={!hasPrediction || status === 'running'}
              className={`toggle-button${isPresetSelected(d) ? ' is-selected' : ''}`}
              style={{ marginRight: '0.5rem', marginBottom: '0.5rem' }}
            >
              {d === MAX_AIM_IN_HORIZON_RADII ? '20 (far)' : d}
            </button>
          ))}
          <div style={{ marginTop: '0.5rem' }}>
            <label htmlFor="light-near-black-hole-aim" style={{ display: 'block', marginBottom: '0.5rem' }}>
              Aim: {formatRadii(aim)} horizon radii ({formatDistance(result.aimKm)})
            </label>
            <input
              id="light-near-black-hole-aim"
              type="range"
              min={Math.log10(MIN_AIM_IN_HORIZON_RADII)}
              max={Math.log10(MAX_AIM_IN_HORIZON_RADII)}
              step="any"
              value={Math.log10(aim)}
              disabled={!hasPrediction || status === 'running'}
              onChange={(event) =>
                handleAimChange(
                  Math.min(Math.max(10 ** Number(event.target.value), MIN_AIM_IN_HORIZON_RADII), MAX_AIM_IN_HORIZON_RADII),
                )
              }
              style={{ width: '100%' }}
            />
            <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', margin: '0.25rem 0 0 0' }}>
              The slider is logarithmic: equal steps along it multiply the distance by the same amount. A horizon
              radius is the size of the black hole's edge. An aim of 1 means aimed at the horizon's edge.
            </p>
          </div>
        </div>

        <button
          type="button"
          className="action-button"
          onClick={handleRun}
          disabled={!hasPrediction || status === 'running'}
          style={{ marginTop: '0.5rem', padding: '0.6rem 1.5rem' }}
        >
          {status === 'running' ? 'Running...' : 'Run'}
        </button>

        {!hasPrediction && (
          <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
            Answer the predictions above to try the controls.
          </p>
        )}

        {/* Shown only once the current settings have been run: changing the black hole or the aim returns to idle and hides it again. */}
        {hasSubmittedPrediction && status !== 'idle' && (
          <>
            <p style={{ marginTop: '1rem', marginBottom: 0, fontSize: '0.75rem', color: 'var(--text-muted)' }}>
              {result.preset.label}: {formatMass(result.preset.massSolarMasses)}; horizon radius{' '}
              {formatDistance(result.horizonRadiusKm)}
              <br />
              Aim: {formatRadii(aim)} horizon radii ({formatDistance(result.aimKm)}); the critical aim is{' '}
              {formatNumber(CRITICAL_AIM_IN_HORIZON_RADII)} horizon radii ({formatDistance(result.criticalAimKm)}); light
              can circle at {PHOTON_SPHERE_IN_HORIZON_RADII} horizon radii ({formatDistance(result.photonSphereKm)})
              <br />
              The light: {outcomeSoFar}
            </p>

            <div style={{ marginTop: '1rem', maxWidth: `${PANEL_WIDTH}px` }}>
              <LightPanel
                path={result.path}
                aim={aim}
                viewRadius={viewRadius}
                pixelsPerHorizonRadius={pixelsPerHorizonRadius}
                scaleBarHorizonRadii={scaleBarHorizonRadii}
                progress={progress}
              />
              <div style={CAPTION_STYLE}>
                <p style={{ marginTop: 0, marginBottom: '0.4rem' }}>
                  <strong>How to read this picture: the path of the light.</strong>
                </p>
                <p style={CAPTION_PARAGRAPH_STYLE}>
                  <strong>What you are looking at.</strong> A bird's-eye view of a thin beam of light passing a black
                  hole. The black hole is the dark disc in the middle. The rose-colored ring around it is the{' '}
                  <em>horizon</em>, the point of no return. Anything that reaches the horizon cannot come back out.
                </p>
                <p style={CAPTION_PARAGRAPH_STYLE}>
                  <strong>The dashed white line</strong> is the path the light would take if gravity did nothing: a
                  straight line, passing the center at the distance you chose (the <em>aim</em>, marked by the short
                  white line from the center). The beam comes in from the right.
                </p>
                <p style={CAPTION_PARAGRAPH_STYLE}>
                  <strong>The blue trail</strong> is the path the light really takes, as the exact theory of gravity
                  works it out. Compare it with the dashed white line: where they part company, gravity is acting.
                </p>
                <p style={CAPTION_PARAGRAPH_STYLE}>
                  <strong>The two dashed rings.</strong> The purple ring is 1.5 horizon radii from the center: a
                  distance at which light can go round in a circle. The green ring is the <em>critical aim</em>, the
                  closest aim at which a beam of light still gets away.
                </p>
                <p style={CAPTION_PARAGRAPH_STYLE}>
                  <strong>The bend.</strong> If the light gets away, its final direction is shown as a dotted blue line.
                  The <em>bend</em> is the angle between its original direction and its final direction, so a bend of
                  180° means it ends up heading back the way it came.
                </p>
                <p style={CAPTION_PARAGRAPH_STYLE}>
                  <strong>Scale.</strong> The scale bar shows how long some number of horizon radii is. It changes
                  from one run to the next, because each run is zoomed to fit its aim. To compare one aim with another,
                  use the scale bar and the numbers above, not the size of the drawing.
                </p>
                <p style={{ margin: 0 }}>
                  <strong>A limit.</strong> This follows a thin beam in a flat plane. It is not what a camera would
                  see, and it does not show what happens to the light after it is captured.
                </p>
              </div>
            </div>

            <BendGraph aim={aim} outcome={result.path.outcome} exactDegrees={exactDegrees} />
            <div style={{ ...CAPTION_STYLE, maxWidth: `${GRAPH_WIDTH}px` }}>
              <p style={{ marginTop: 0, marginBottom: '0.4rem' }}>
                <strong>How to read this graph: the total bend against the aim.</strong>
              </p>
              <p style={CAPTION_PARAGRAPH_STYLE}>
                <strong>What you are looking at.</strong> For every aim from 1 to 20 horizon radii, how far the light's
                direction is turned by the time it is far away again. A bend of 0° means no bend at all.
              </p>
              <p style={CAPTION_PARAGRAPH_STYLE}>
                <strong>The two curves.</strong> The blue curve is the exact theory, worked out for each aim the same way
                as the path above. The orange curve is the simple formula from Gravity and Curved Spacetime, Experiment
                8: the bend is 2 divided by the aim, in radians. That formula was made for weak gravity, far from a
                mass. The dots mark your aim on each curve, so the gap between them is how far the simple formula is off
                for your aim.
              </p>
              <p style={CAPTION_PARAGRAPH_STYLE}>
                <strong>The green line and the rose area.</strong> The green line is the critical aim. Aims to its left
                are in the rose area, where the light is captured and so has no bend to show. A × marks your aim if it
                is there.
              </p>
              <p style={{ margin: 0 }}>
                <strong>A limit.</strong> The vertical scale stops at 400°, so the blue curve leaves the top of the
                graph near the green line.
              </p>
            </div>
          </>
        )}
      </div>
    </div>
  )
}
