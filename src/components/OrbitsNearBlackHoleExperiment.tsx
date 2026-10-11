import { useEffect, useMemo, useState } from 'react'
import type { CSSProperties, ReactNode } from 'react'
import {
  BLACK_HOLE_PRESETS,
  LAST_SAFE_ORBIT_IN_HORIZON_RADII,
  MAX_START_IN_HORIZON_RADII,
  MAX_TURNS,
  MIN_START_IN_HORIZON_RADII,
  STEPS_PER_TURN,
  exactCircularSpeedFractionOfLight,
  modelEdgeInHorizonRadii,
  NUDGE,
  orbitPath,
  ordinaryCircularSpeedFractionOfLight,
  runOrbitsNearBlackHoleExperiment,
} from '../physics/orbitsNearBlackHoleExperiment'
import { OrbitsNearBlackHoleTutor } from './OrbitsNearBlackHoleTutor'
import type { OrbitPath } from '../physics/orbitsNearBlackHoleExperiment'
import type { ObjectPreset } from '../physics/blackHoleSizeExperiment'

interface OrbitsNearBlackHoleExperimentProps {
  onComplete?: () => void
  onTutorComplete?: () => void
}

// Each panel: a title strip, a square orbit area, and a legend strip. Both panels share one scale, zoomed to the start so
// that the interesting part fills the picture: the view reaches ZOOM_MARGIN times the start distance (and never less
// than MIN_VIEW_RADIUS horizon radii). A scale bar says how long some number of horizon radii is.
const PANEL_WIDTH = 400
const PANEL_HEIGHT = 512
const CENTER_X = 200
const CENTER_Y = 248
const ORBIT_AREA_RADIUS_PX = 170
const ZOOM_MARGIN = 1.25
const MIN_VIEW_RADIUS = 4 // horizon radii, so the last safe orbit (3) always fits
const SCALE_BAR_LENGTHS = [1, 2, 5, 10, 20] // horizon radii; the longest that fits is used
const LEGEND_TOP = 438

// Fixed real-world playback duration for the whole MAX_TURNS of the run, independent of the physics result
// (CLAUDE.md §11).
const ANIMATION_DURATION_MS = 12000

const KM_PER_AU = 149_597_870.7

const ORDINARY_COLOR = '#facc15'
const EXACT_COLOR = '#22d3ee'
const HORIZON_COLOR = '#fb7185'
const BLACK_HOLE_COLOR = '#e879f9'
const LAST_SAFE_COLOR = '#a78bfa'

const DISTANCE_PRESETS = [20, 6, 3.5, 3, 2.5, 1.6]

// The graph of distance against turns (the third picture).
const GRAPH_WIDTH = 640

// Caption blocks under each picture (small, muted text, like the other captions in this project).
const CAPTION_STYLE: CSSProperties = { fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.5rem' }
const CAPTION_PARAGRAPH_STYLE: CSSProperties = { marginTop: 0, marginBottom: '0.4rem' }
const GRAPH_HEIGHT = 352
const PLOT_LEFT = 70
const PLOT_RIGHT = 600
const PLOT_TOP = 64
const PLOT_BOTTOM = 270

// This experiment's three prediction questions, per its specification's "Prediction Activity". Choices are not scored
// here; they are compared with the model's results later.
type NudgeChoice = 'wobbles' | 'spirals-in' | 'flies-off'
const nudgeChoices: Array<{ value: NudgeChoice; label: string }> = [
  { value: 'wobbles', label: 'It wobbles a little and keeps circling' },
  { value: 'spirals-in', label: 'It spirals in and crosses the horizon' },
  { value: 'flies-off', label: 'It flies off' },
]

type LastSafeChoice = 'anywhere' | 'three' | 'ten'
const lastSafeChoices: Array<{ value: LastSafeChoice; label: string }> = [
  { value: 'anywhere', label: 'Anywhere outside the horizon' },
  { value: 'three', label: 'About 3 horizon radii from the center' },
  { value: 'ten', label: 'About 10 horizon radii from the center' },
]

type FarChoice = 'very-different' | 'nearly-same'
const farChoices: Array<{ value: FarChoice; label: string }> = [
  { value: 'very-different', label: 'Very different' },
  { value: 'nearly-same', label: 'Nearly the same' },
]

// Three significant figures, with no trailing zeros ("10", "2.95", "235,571").
function formatNumber(value: number): string {
  if (value >= 1000) return Number(value.toPrecision(3)).toLocaleString('en-US')
  return String(Number(value.toPrecision(3)))
}

// A distance in horizon radii, with enough digits to tell 1.6 from 1.60001 on the slider.
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

// One probe's outcome in a sentence, for the Results table.
function pathSummary(path: OrbitPath, startInHorizonRadii: number): string {
  if (path.outcome === 'plunges') return `Plunged: reached the horizon after about ${path.turnsCompleted.toFixed(1)} turns`
  const wobble = Math.max(
    1 - path.closestInHorizonRadii / startInHorizonRadii,
    path.farthestInHorizonRadii / startInHorizonRadii - 1
  )
  return `Kept circling for all ${MAX_TURNS} turns, never more than ${formatNumber(wobble * 100)}% away from its starting distance`
}

function formatMass(solarMasses: number): string {
  if (solarMasses < 1e3) return `${solarMasses} solar masses`
  if (solarMasses < 1e9) return `${solarMasses / 1e6} million solar masses`
  return `${solarMasses / 1e9} billion solar masses`
}

// Where a probe is at a given moment of the run: its path up to the number of turns reached so far (a path that
// plunged ends early and stays at the horizon).
function pointAt(path: OrbitPath, turnsReached: number) {
  const index = Math.min(Math.floor(turnsReached * STEPS_PER_TURN), path.points.length - 1)
  return { index, point: path.points[index], ended: index >= path.points.length - 1 }
}

// The same two paths as a graph: each probe's distance from the black hole against the turns it has made, drawn up to
// the present moment of the run, with the horizon, the last safe orbit and the start as horizontal lines.
function DistanceGraph({
  ordinary,
  exact,
  startInHorizonRadii,
  turnsReached,
  showLines,
}: {
  ordinary: OrbitPath
  exact: OrbitPath
  startInHorizonRadii: number
  turnsReached: number
  showLines: boolean
}) {
  const yMax = Math.max(1.1 * startInHorizonRadii, 4)
  const xFor = (turns: number) => PLOT_LEFT + (turns / MAX_TURNS) * (PLOT_RIGHT - PLOT_LEFT)
  const yFor = (distance: number) => PLOT_BOTTOM - (distance / yMax) * (PLOT_BOTTOM - PLOT_TOP)

  // A round step for the vertical axis, giving at most about six ticks.
  const step = [1, 2, 5, 10, 20].find((n) => yMax / n <= 6) ?? 20
  const ticks: number[] = []
  for (let v = 0; v <= yMax; v += step) ticks.push(v)

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
    { value: 1, label: 'horizon (1)', color: HORIZON_COLOR, dy: -4 },
    { value: LAST_SAFE_ORBIT_IN_HORIZON_RADII, label: 'last safe orbit (3)', color: LAST_SAFE_COLOR, dy: 12 },
    { value: startInHorizonRadii, label: `start (${formatRadii(startInHorizonRadii)})`, color: '#e2e8f0', dy: -4 },
  ]

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
      <text x={12} y={20} fill="#e2e8f0" fontSize="12" fontWeight="bold">
        The same two paths as a graph: distance from the black hole against turns
      </text>
      <text x={12} y={38} fill="#94a3b8" fontSize="11">
        Drawn as the run plays. Horizontal: turns made around the black hole. Vertical: distance, in horizon radii.
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

      {showLines && (
        <>
          <polyline points={ordinaryLine.pts} fill="none" stroke={ORDINARY_COLOR} strokeWidth={3} />
          <polyline points={exactLine.pts} fill="none" stroke={EXACT_COLOR} strokeWidth={3} />
          <circle cx={xFor(ordinaryLine.point.turns)} cy={yFor(ordinaryLine.point.distanceInHorizonRadii)} r={5} fill={ORDINARY_COLOR} />
          <circle cx={xFor(exactLine.point.turns)} cy={yFor(exactLine.point.distanceInHorizonRadii)} r={5} fill={EXACT_COLOR} />
          {exactPlunged && (
            <text x={xFor(exactLine.point.turns) + 8} y={yFor(1) - 18} fill={EXACT_COLOR} fontSize="11" fontWeight="bold">
              plunged after {exactLine.point.turns.toFixed(1)} turns
            </text>
          )}
        </>
      )}

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

function OrbitPanel({
  title,
  ruleName,
  color,
  path,
  startInHorizonRadii,
  pixelsPerHorizonRadius,
  scaleBarHorizonRadii,
  turnsReached,
  showLastSafeOrbit,
  showTrail,
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
  showTrail: boolean
}) {
  const { index, point, ended } = pointAt(path, turnsReached)
  const plunged = path.outcome === 'plunges' && ended
  const px = (x: number) => CENTER_X + x * pixelsPerHorizonRadius
  const py = (y: number) => CENTER_Y - y * pixelsPerHorizonRadius

  // The trail so far, thinned out to keep the drawing light.
  const trail: string[] = []
  if (showTrail) {
    for (let i = 0; i <= index; i += 4) trail.push(`${px(path.points[i].x)},${py(path.points[i].y)}`)
    trail.push(`${px(point.x)},${py(point.y)}`)
  }

  const startRadius = startInHorizonRadii * pixelsPerHorizonRadius
  // The label "start" sits beside the start point, inside the ring when the ring is near the picture's right edge.
  const startLabelAtLeft = px(startInHorizonRadii) > PANEL_WIDTH - 50
  const lastSafeRadius = LAST_SAFE_ORBIT_IN_HORIZON_RADII * pixelsPerHorizonRadius

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
      style={{
        flex: '1 1 280px',
        minWidth: 0,
        display: 'block',
        maxWidth: `${PANEL_WIDTH}px`,
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

      {/* The start distance, and the last safe orbit for the exact theory */}
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
          {/* At the bottom of the ring: just inside it when the ring is large, just below it when it is small. */}
          <text
            x={CENTER_X}
            y={lastSafeRadius >= 60 ? CENTER_Y + lastSafeRadius - 6 : CENTER_Y + lastSafeRadius + 13}
            fill={LAST_SAFE_COLOR}
            fontSize="10"
            textAnchor="middle"
          >
            last safe orbit
          </text>
        </g>
      )}

      {/* The black hole and its horizon */}
      <circle cx={CENTER_X} cy={CENTER_Y} r={pixelsPerHorizonRadius} fill={BLACK_HOLE_COLOR} fillOpacity={0.35} stroke={HORIZON_COLOR} strokeWidth={2} />

      {/* The path so far and the probe */}
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

      {/* The scale bar */}
      <g>
        <line x1={14} y1={LEGEND_TOP - 12} x2={14 + scaleBarHorizonRadii * pixelsPerHorizonRadius} y2={LEGEND_TOP - 12} stroke="#e2e8f0" strokeWidth={2} />
        <line x1={14} y1={LEGEND_TOP - 16} x2={14} y2={LEGEND_TOP - 8} stroke="#e2e8f0" strokeWidth={2} />
        <line x1={14 + scaleBarHorizonRadii * pixelsPerHorizonRadius} y1={LEGEND_TOP - 16} x2={14 + scaleBarHorizonRadii * pixelsPerHorizonRadius} y2={LEGEND_TOP - 8} stroke="#e2e8f0" strokeWidth={2} />
        <text x={22 + scaleBarHorizonRadii * pixelsPerHorizonRadius} y={LEGEND_TOP - 8} fill="#e2e8f0" fontSize="10">
          scale: {scaleBarHorizonRadii} horizon {scaleBarHorizonRadii === 1 ? 'radius' : 'radii'}
        </text>
      </g>

      {rows.map((row) => (
        <g key={row.key}>
          {row.draw}
          <text x={32} y={Number(LEGEND_TOP) + 12 + rows.indexOf(row) * 16} fill={row.fill} fontSize="10">
            {row.text}
          </text>
        </g>
      ))}
    </svg>
  )
}

export function OrbitsNearBlackHoleExperiment({ onComplete, onTutorComplete }: OrbitsNearBlackHoleExperimentProps) {
  const [presetId, setPresetId] = useState<ObjectPreset['id']>('stellar-black-hole')
  const [start, setStart] = useState(6)
  const [status, setStatus] = useState<'idle' | 'running' | 'complete'>('idle')
  const [progress, setProgress] = useState(0)
  const [runCount, setRunCount] = useState(0)

  const [nudgePrediction, setNudgePrediction] = useState<NudgeChoice | null>(null)
  const [lastSafePrediction, setLastSafePrediction] = useState<LastSafeChoice | null>(null)
  const [farPrediction, setFarPrediction] = useState<FarChoice | null>(null)
  const [submittedNudge, setSubmittedNudge] = useState<NudgeChoice | null>(null)
  const [submittedLastSafe, setSubmittedLastSafe] = useState<LastSafeChoice | null>(null)
  const [submittedFar, setSubmittedFar] = useState<FarChoice | null>(null)

  const hasPrediction = nudgePrediction !== null && lastSafePrediction !== null && farPrediction !== null
  const hasSubmittedPrediction = submittedNudge !== null && submittedLastSafe !== null && submittedFar !== null

  const result = useMemo(() => runOrbitsNearBlackHoleExperiment(presetId, start), [presetId, start])
  const turnsReached = progress * MAX_TURNS
  const showResults = status === 'complete' && hasSubmittedPrediction
  const holeInSentence = result.preset.label.replace(/^A /, 'a ')

  // The numbers the three prediction checks need. They do not depend on the black hole or start the learner chose, so
  // they are computed once, from the same physics module (CLAUDE.md §9).
  const checks = useMemo(
    () => ({
      twoExact: orbitPath('exact', 2),
      twoOrdinary: orbitPath('ordinary', 2),
      threeExact: orbitPath('exact', LAST_SAFE_ORBIT_IN_HORIZON_RADII),
      aboveEdgeExact: orbitPath('exact', 3.5),
      tenExact: orbitPath('exact', 10),
      farExact: orbitPath('exact', 20),
      farOrdinary: orbitPath('ordinary', 20),
      farExactSpeed: exactCircularSpeedFractionOfLight(20),
      farOrdinarySpeed: ordinaryCircularSpeedFractionOfLight(20),
      edge: modelEdgeInHorizonRadii(),
    }),
    []
  )

  // The zoom shared by both panels.
  const viewRadius = Math.max(ZOOM_MARGIN * start, MIN_VIEW_RADIUS)
  const pixelsPerHorizonRadius = ORBIT_AREA_RADIUS_PX / viewRadius
  const scaleBarHorizonRadii = [...SCALE_BAR_LENGTHS].reverse().find((n) => n <= viewRadius / 2.5) ?? 1

  const handlePresetChange = (id: ObjectPreset['id']) => {
    setPresetId(id)
    setStatus('idle')
    setProgress(0)
  }

  const handleStartChange = (value: number) => {
    setStart(value)
    setStatus('idle')
    setProgress(0)
  }

  const handleRun = () => {
    if (!hasPrediction || status === 'running') return
    if (!hasSubmittedPrediction) {
      setSubmittedNudge(nudgePrediction)
      setSubmittedLastSafe(lastSafePrediction)
      setSubmittedFar(farPrediction)
    }
    setStatus('running')
    setProgress(0)
    setRunCount((n) => n + 1)
  }

  // Matches the rest of the project's precedent: re-opens all three questions for editing without resetting the
  // chosen black hole or start distance.
  const handleChangePrediction = () => {
    setSubmittedNudge(null)
    setSubmittedLastSafe(null)
    setSubmittedFar(null)
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

  const isPresetSelected = (d: number) => Math.abs(Math.log(d / start)) < 1e-9
  const outcomeSoFar = (path: OrbitPath) => {
    const { ended } = pointAt(path, turnsReached)
    return path.outcome === 'plunges' && ended ? 'plunged' : status === 'idle' ? '—' : 'still circling'
  }

  return (
    <div style={{ padding: '2rem', maxWidth: '900px', margin: '0 auto' }}>
      <h2>Experiment 3 — Orbits Near a Black Hole: Is There a Point of No Safe Orbit?</h2>

      <div className="exp-card" style={{ marginTop: '2rem', padding: '1.5rem' }}>
        {/* DRAFT wording, for the owner's line-by-line review (CLAUDE.md §28.1). It must not give away the answers to
            the three predictions below (§12): no mention of where the last safe orbit is, of a probe plunging for
            certain, or of far orbits looking alike. */}
        <div style={{ marginBottom: '2rem', fontSize: '0.875rem', color: 'var(--text-muted)' }}>
          <p style={{ marginTop: 0, marginBottom: '0.75rem' }}>
            <strong>The question.</strong> In Gravity and Curved Spacetime, Experiment 6, you saw that a planet
            stays in orbit because it moves sideways as it falls, so it keeps missing the thing it falls toward,
            and that this works at any distance. Close to a black hole, gravity is as strong as it ever gets (you saw that
            in Experiment 2 of this chapter). So is it
            still safe to circle a black hole, at any distance outside its edge? Or is there a place where an
            orbit cannot last?
          </p>
          <p style={{ marginTop: 0, marginBottom: '0.75rem' }}>
            <strong>Why even ask this.</strong> In the earlier chapters, planets and GPS satellites keep circling
            steadily. Nothing seems to threaten them, so it is natural to assume that if you can get into an orbit,
            you can stay there. But the earlier experiments only used orbits in gravity that is gentle compared with
            a black hole's. This experiment asks whether that dependable picture still holds where gravity is at its
            strongest.
          </p>
          <p style={{ marginTop: 0, marginBottom: '0.25rem' }}>
            <strong>What happens.</strong> Here is the whole experiment, step by step.
          </p>
          <ol style={{ marginTop: 0, marginBottom: '0.75rem', paddingLeft: '1.25rem' }}>
            <li>You choose a black hole and a starting distance from its center.</li>
            <li>
              Two small probes (think of tiny spacecraft) are placed at that distance, one in each picture.
            </li>
            <li>
              <strong>Each probe is launched sideways at a "just right" speed.</strong> In Experiment 6 you saw
              that sideways speed decides what an orbiting object does. Too slow, and it falls in. Too fast, and
              it flies away. At one speed in between, it goes round in a perfect circle, always the same distance
              from the center. Think of swinging a stone on a string: too slow and the stone drops, too fast and
              the string pulls out of your hand, but at the right speed the stone swings in a steady circle. The
              trouble is that the "just right" speed depends on which rule of gravity you use. The{' '}
              <strong>left probe</strong> uses <strong>ordinary gravity</strong>, the rule from Experiment 6. The{' '}
              <strong>right probe</strong> uses the <strong>exact theory of gravity</strong> (general relativity,
              the theory that gravity is curved spacetime). So each probe gets the "just right" speed from its own
              rule, and each one starts out as a perfect circle by that rule.
            </li>
            <li>
              Both probes get the same tiny push inward. It is too small to see in the picture.
            </li>
            <li>
              You press Run and watch for up to ten turns around the black hole. A probe that reaches the black
              hole's edge stops there.
            </li>
            <li>
              Three pictures show the result: each probe's path, and a graph of how far each is from the black
              hole.
            </li>
          </ol>
          <p style={{ marginTop: 0, marginBottom: '0.75rem' }}>
            The question each picture answers is the same: after the tiny push, does the probe stay in its orbit?
          </p>
          <p style={{ marginTop: 0, marginBottom: '0.75rem' }}>
            <strong>Some words we will use.</strong> A <strong>circular orbit</strong> is an orbit that stays at one
            distance from the center the whole way round, like a stone swung steadily on a string, except that
            here gravity is the string. A <strong>nudge</strong> is a tiny extra push, here inward. Real orbits
            always get small disturbances, for example from a passing grain of dust, so we ask whether an orbit
            survives one. To <strong>plunge</strong> is to spiral inward and cross the black hole's edge. The{' '}
            <strong>horizon</strong> is that edge, the one-way boundary you met in Experiment 1 of this chapter.
            The <strong>horizon radius</strong> is the distance from the black hole's center to its horizon, and
            we measure distances in horizon radii: 10 horizon radii means ten times as far from the center as the
            edge is. The probes' speeds are given as a fraction of the speed of light: 0.5 means half as fast as
            light. For the biggest black holes the distances in kilometers are huge, so we also give them in{' '}
            <strong>astronomical units</strong> (AU): 1 AU is the distance from the Earth to the Sun, about 150
            million kilometers.
          </p>
          <p style={{ marginTop: 0, marginBottom: '0.75rem' }}>
            <strong>The black holes.</strong> They are the three from Experiments 1 and 2: a stellar black hole of
            10 Suns' worth of mass (a round, illustrative value), Sagittarius A*, the black hole at the center of
            our galaxy, and M87*, the black hole imaged in the galaxy M87. Their masses are about 4.3 million and
            6.5 billion Suns.
          </p>
          <p style={{ marginTop: 0, marginBottom: '0.75rem' }}>
            <strong>What this builds on.</strong> Gravity and Curved Spacetime, Experiment 6 gave you orbits as
            sideways motion. Experiment 1 of this chapter gave you the horizon radius, and Experiment 2 showed
            that gravity close to a horizon is strong enough to change how clocks tick. Here we ask what that
            strong gravity does to an orbit.
          </p>
          <p style={{ marginTop: 0, marginBottom: '0.75rem' }}>
            <strong>Your job.</strong> First, make three predictions. Then choose a black hole and a starting
            distance, and run it. Try other distances and other black holes too, and compare.
          </p>
          <p style={{ marginTop: 0, marginBottom: '0.75rem' }}>
            <strong>What to look for.</strong> What each probe does after the nudge, turn by turn, and how that
            changes when you start nearer or farther, and when you change the black hole.
          </p>
          <p style={{ marginTop: 0, marginBottom: '0.25rem' }}>
            <strong>What we assume.</strong>
          </p>
          <ul style={{ marginTop: 0, marginBottom: 0, paddingLeft: '1.25rem' }}>
            <li>
              <strong>This is a thought experiment about a small probe.</strong> The probe is so light that its own
              gravity does not matter. How it got into orbit is not described.
            </li>
            <li>
              <strong>The exact theory's equation is given, not derived.</strong> It is the standard equation for
              a small object near a black hole that does not spin and has no electric charge. Real black holes
              usually spin, which changes the details.
            </li>
            <li>
              <strong>The orbit lies in a flat plane,</strong> seen from above, and the probe loses no energy as
              it goes. A real orbit near a black hole loses some energy as gravitational waves (see the
              Gravitational Waves chapter), which is left out here.
            </li>
            <li>
              <strong>Both probes get the same tiny nudge,</strong> small but not zero: if nothing else acted, it
              would carry a probe in by about 0.6% of its distance over one full turn.
            </li>
            <li>
              <strong>"Plunges" means the probe reaches the horizon.</strong> Nothing past that is modeled.
            </li>
            <li>
              <strong>The ordinary-gravity probe is shown even where ordinary gravity is not a good description,</strong>{' '}
              only so that the two rules can be compared.
            </li>
            <li>
              <strong>The distance control stops at 1.6 horizon radii,</strong> because closer in than 1.5 no
              circular orbit exists for anything slower than light.
            </li>
          </ul>
        </div>

        <div style={{ marginBottom: '1.5rem' }}>
          <p style={{ fontSize: '0.875rem', marginBottom: '0.75rem' }}>
            A probe is circling a black hole at 2 horizon radii from its center, at exactly the speed that gives a
            circular orbit there. Then it gets a tiny nudge inward. What happens?
          </p>
          <div style={{ marginBottom: '0.5rem' }}>
            {nudgeChoices.map((choice) => (
              <button
                key={choice.value}
                type="button"
                onClick={() => setNudgePrediction(choice.value)}
                disabled={hasSubmittedPrediction}
                className={`toggle-button${nudgePrediction === choice.value ? ' is-selected' : ''}`}
                style={{ marginRight: '0.5rem', marginBottom: '0.5rem' }}
              >
                {choice.label}
              </button>
            ))}
          </div>

          <p style={{ fontSize: '0.875rem', marginBottom: '0.75rem' }}>
            In ordinary gravity, a planet can circle at any distance. Close to a black hole, where is the last safe
            place to circle?
          </p>
          <div style={{ marginBottom: '0.5rem' }}>
            {lastSafeChoices.map((choice) => (
              <button
                key={choice.value}
                type="button"
                onClick={() => setLastSafePrediction(choice.value)}
                disabled={hasSubmittedPrediction}
                className={`toggle-button${lastSafePrediction === choice.value ? ' is-selected' : ''}`}
                style={{ marginRight: '0.5rem', marginBottom: '0.5rem' }}
              >
                {choice.label}
              </button>
            ))}
          </div>

          <p style={{ fontSize: '0.875rem', marginBottom: '0.75rem' }}>
            Far from the black hole, at 20 horizon radii, will an orbit under the exact theory of gravity look
            different from the same orbit under ordinary gravity?
          </p>
          <div style={{ marginBottom: '0.5rem' }}>
            {farChoices.map((choice) => (
              <button
                key={choice.value}
                type="button"
                onClick={() => setFarPrediction(choice.value)}
                disabled={hasSubmittedPrediction}
                className={`toggle-button${farPrediction === choice.value ? ' is-selected' : ''}`}
                style={{ marginRight: '0.5rem', marginBottom: '0.5rem' }}
              >
                {choice.label}
              </button>
            ))}
          </div>

          <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
            {hasPrediction || hasSubmittedPrediction
              ? `Your predictions: ${
                  nudgeChoices.find((c) => c.value === (nudgePrediction ?? submittedNudge))!.label
                }; ${lastSafeChoices.find((c) => c.value === (lastSafePrediction ?? submittedLastSafe))!.label}; ${
                  farChoices.find((c) => c.value === (farPrediction ?? submittedFar))!.label
                }`
              : 'Answer all three questions to continue'}
          </p>
        </div>

        {hasSubmittedPrediction && (
          <div style={{ marginTop: '-0.5rem', marginBottom: '1rem' }}>
            <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '0.5rem' }}>
              Your predictions are locked in above. You can still try as many black holes and distances as you
              like below. Or, change your predictions and start over:
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
            Start the probe in a circular orbit at this distance from the black hole's center:
          </p>
          {DISTANCE_PRESETS.map((d) => (
            <button
              key={d}
              type="button"
              onClick={() => handleStartChange(d)}
              disabled={!hasPrediction || status === 'running'}
              className={`toggle-button${isPresetSelected(d) ? ' is-selected' : ''}`}
              style={{ marginRight: '0.5rem', marginBottom: '0.5rem' }}
            >
              {d === MAX_START_IN_HORIZON_RADII ? '20 (far)' : d}
            </button>
          ))}
          <div style={{ marginTop: '0.5rem' }}>
            <label htmlFor="orbits-near-black-hole-start" style={{ display: 'block', marginBottom: '0.5rem' }}>
              Start: {formatRadii(start)} horizon radii ({formatDistance(result.startKm)})
            </label>
            <input
              id="orbits-near-black-hole-start"
              type="range"
              min={Math.log10(MIN_START_IN_HORIZON_RADII)}
              max={Math.log10(MAX_START_IN_HORIZON_RADII)}
              step="any"
              value={Math.log10(start)}
              disabled={!hasPrediction || status === 'running'}
              onChange={(event) =>
                handleStartChange(
                  Math.min(Math.max(10 ** Number(event.target.value), MIN_START_IN_HORIZON_RADII), MAX_START_IN_HORIZON_RADII),
                )
              }
              style={{ width: '100%' }}
            />
            <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', margin: '0.25rem 0 0 0' }}>
              The slider is logarithmic: equal steps along it multiply the distance by the same amount. A horizon
              radius is the size of the black hole's edge. The slider stops at {MIN_START_IN_HORIZON_RADII}, because
              closer in than 1.5 horizon radii no circular orbit exists at all for anything slower than light.
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

        {/* Shown only once the current settings have been run: changing the black hole or the start returns to idle and hides it again. */}
        {hasSubmittedPrediction && status !== 'idle' && (
          <>
        <p style={{ marginTop: '1rem', marginBottom: 0, fontSize: '0.75rem', color: 'var(--text-muted)' }}>
          {result.preset.label}: {formatMass(result.preset.massSolarMasses)}; horizon radius{' '}
          {formatDistance(result.horizonRadiusKm)}
          <br />
          Start: {formatRadii(start)} horizon radii ({formatDistance(result.startKm)}); the last safe orbit of the
          exact theory is at {LAST_SAFE_ORBIT_IN_HORIZON_RADII} horizon radii ({formatDistance(result.lastSafeOrbitKm)})
          <br />
          Launch speed for a circular orbit, as a fraction of the speed of light: ordinary gravity{' '}
          {result.ordinarySpeedFractionOfLight.toFixed(3)}; the exact theory {result.exactSpeedFractionOfLight.toFixed(3)}
          <br />
          Ordinary-gravity probe: {outcomeSoFar(result.ordinary)} &nbsp;|&nbsp; exact-theory probe:{' '}
          {outcomeSoFar(result.exact)}
        </p>

        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1rem', marginTop: '1rem' }}>
          <div style={{ flex: '1 1 280px', minWidth: 0, maxWidth: `${PANEL_WIDTH}px` }}>
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
              showTrail
            />
            <div style={CAPTION_STYLE}>
              <p style={{ marginTop: 0, marginBottom: '0.4rem' }}>
                <strong>How to read this picture: ordinary gravity (the gold probe).</strong>
              </p>
              <p style={CAPTION_PARAGRAPH_STYLE}>
                <strong>What you are looking at.</strong> A bird's-eye view of a small probe circling a black hole. The
                black hole is the dark disc in the middle. The rose-colored ring around it is the <em>horizon</em>, the
                point of no return. Anything that reaches the horizon cannot come back out.
              </p>
              <p style={CAPTION_PARAGRAPH_STYLE}>
                <strong>What the gold probe does.</strong> It starts on the dashed white ring, to the right of the
                center, and moves around the black hole. It was launched at exactly the speed that makes a perfect
                circle under <em>ordinary gravity</em>, the rule from the Gravity and Curved Spacetime chapter
                (Experiment 6). Its trail shows where it has been.
              </p>
              <p style={CAPTION_PARAGRAPH_STYLE}>
                <strong>The tiny nudge.</strong> At the start, the probe gets a very small push toward the black hole.
                Over one full turn it would carry the probe in by only about 0.6% of its distance. Think of lightly
                tapping a ball that is rolling around the inside of a bowl. The tap stands for any small disturbance a
                real orbit would get. Watch what this probe does with it.
              </p>
              <p style={CAPTION_PARAGRAPH_STYLE}>
                <strong>What to look for.</strong> Does the trail stay on the white ring, drift inward, or move
                outward? The numbers above the picture count the turns and the distance.
              </p>
              <p style={{ margin: 0 }}>
                <strong>Scale.</strong> The scale bar shows how long some number of horizon radii is. It changes from
                one start to the next, because each run is zoomed to fit its start. To compare one start with another,
                use the scale bar and the numbers in the readout, not the size of the drawing. This picture does not
                show a traveler falling in, or how the probe was put into orbit.
              </p>
            </div>
          </div>

          <div style={{ flex: '1 1 280px', minWidth: 0, maxWidth: `${PANEL_WIDTH}px` }}>
            <OrbitPanel
              title="The exact theory"
              ruleName="the exact theory"
              color={EXACT_COLOR}
              path={result.exact}
              startInHorizonRadii={start}
              pixelsPerHorizonRadius={pixelsPerHorizonRadius}
              scaleBarHorizonRadii={scaleBarHorizonRadii}
              turnsReached={turnsReached}
              showLastSafeOrbit
              showTrail
            />
            <div style={CAPTION_STYLE}>
              <p style={{ marginTop: 0, marginBottom: '0.4rem' }}>
                <strong>How to read this picture: the exact theory (the blue probe).</strong>
              </p>
              <p style={CAPTION_PARAGRAPH_STYLE}>
                <strong>What you are looking at.</strong> The same view, with the same black hole and the same scale as
                the other picture. The only difference is the rule the probe follows. The blue probe follows the{' '}
                <em>exact theory of gravity</em>, which treats gravity as curved spacetime.
              </p>
              <p style={CAPTION_PARAGRAPH_STYLE}>
                <strong>What the blue probe does.</strong> It starts at the same spot on the white ring, with the same
                tiny inward nudge. It was launched at the speed that makes a perfect circle by <em>this</em> rule. That
                speed can differ from the gold probe's. Both launch speeds are listed above the pictures, as fractions
                of the speed of light.
              </p>
              <p style={CAPTION_PARAGRAPH_STYLE}>
                <strong>The purple dashed ring.</strong> It marks the <em>last safe orbit</em> of the exact theory, at{' '}
                {LAST_SAFE_ORBIT_IN_HORIZON_RADII} horizon radii from the center. The last safe orbit is the closest
                distance at which a circular orbit can still survive a small nudge. Ordinary gravity has no such ring,
                which is why the other picture has no purple ring. Notice where the white start ring sits compared with
                it.
              </p>
              <p style={CAPTION_PARAGRAPH_STYLE}>
                <strong>What to look for.</strong> Compare this trail with the gold one, turn by turn. Both probes got
                the same nudge. Do they behave the same? If a probe reaches the rose horizon, its run ends there.
              </p>
              <p style={{ margin: 0 }}>
                <strong>A fair warning.</strong> The gold probe is drawn even very close to the black hole, where
                ordinary gravity is not a good description. It is there so that the two rules can be compared, not
                because ordinary gravity is right there.
              </p>
            </div>
          </div>
        </div>

        <DistanceGraph
          ordinary={result.ordinary}
          exact={result.exact}
          startInHorizonRadii={start}
          turnsReached={turnsReached}
          showLines
        />

        <div style={{ ...CAPTION_STYLE, maxWidth: `${GRAPH_WIDTH}px` }}>
          <p style={{ marginTop: 0, marginBottom: '0.4rem' }}>
            <strong>How to read this graph: distance against turns.</strong>
          </p>
          <p style={CAPTION_PARAGRAPH_STYLE}>
            <strong>What you are looking at.</strong> The two pictures above show the paths as seen from above. This
            graph shows the same two paths in a different way. It leaves out which direction the probe is in and keeps
            only one fact: how far it is from the black hole.
          </p>
          <p style={CAPTION_PARAGRAPH_STYLE}>
            <strong>The axes.</strong> Along the bottom: how many turns the probe has made around the black hole (0 to
            10). Up the side: its distance from the center, in horizon radii, where 1 means it is on the horizon.
          </p>
          <p style={CAPTION_PARAGRAPH_STYLE}>
            <strong>The lines.</strong> The gold line is the ordinary-gravity probe and the blue line is the
            exact-theory probe. They are drawn as the run plays, and each dot marks the present moment.
          </p>
          <p style={CAPTION_PARAGRAPH_STYLE}>
            <strong>The three dashed lines are distances to compare with.</strong> The rose line is the horizon (1
            horizon radius). The purple line is the last safe orbit of the exact theory ({LAST_SAFE_ORBIT_IN_HORIZON_RADII}{' '}
            horizon radii), the closest distance at which a circular orbit can still survive a small nudge. The white line is where the probe started.
          </p>
          <p style={CAPTION_PARAGRAPH_STYLE}>
            <strong>How to read a line.</strong> Think of a car driving round and round a ring road, with a graph of
            its distance from home. A flat line means the car keeps the same distance and just goes round and round. A
            line sloping down means it is getting closer to home. In the same way, a flat line here means a probe
            circling at a steady distance, and a line sloping downward means a probe getting closer to the black hole.
            If a line reaches the rose line, that probe has reached the horizon, and the graph says how many turns it
            made first.
          </p>
          <p style={{ margin: 0 }}>
            <strong>A limit.</strong> The vertical scale is zoomed to the start, like the pictures above, so a very
            small wobble would not show. The graph is good at telling a probe that keeps circling from one that falls
            in.
          </p>
        </div>

        {showResults && (
          <div style={{ marginTop: '1.5rem', paddingTop: '1rem', borderTop: '1px solid var(--border-color, #ccc)' }}>
            {/* DRAFT wording, for the owner's line-by-line review (CLAUDE.md §28.1). */}
            <h3 style={{ marginTop: 0 }}>Results</h3>
            <p>
              You started both probes at <strong>{formatRadii(start)} horizon radii</strong> (
              {formatDistance(result.startKm)}) from the center of <strong>{holeInSentence}</strong> (
              {formatMass(result.preset.massSolarMasses)}), and gave each a tiny inward nudge. For this run:
            </p>
            <div style={{ overflowX: 'auto', maxWidth: '100%' }}>
              <table style={{ fontSize: '0.875rem', borderCollapse: 'collapse', marginBottom: '1rem' }}>
                <tbody>
                  {[
                    [
                      'The ordinary-gravity probe (gold)',
                      pathSummary(result.ordinary, start),
                    ],
                    ['The exact-theory probe (blue)', pathSummary(result.exact, start)],
                    [
                      'Launch speed, ordinary gravity',
                      `${result.ordinarySpeedFractionOfLight.toFixed(3)} of the speed of light`,
                    ],
                    [
                      'Launch speed, exact theory',
                      `${result.exactSpeedFractionOfLight.toFixed(3)} of the speed of light, which is ${formatNumber((result.exactSpeedFractionOfLight / result.ordinarySpeedFractionOfLight - 1) * 100)}% faster`,
                    ],
                    [
                      'The last safe orbit of the exact theory',
                      `${LAST_SAFE_ORBIT_IN_HORIZON_RADII} horizon radii, which is ${formatDistance(result.lastSafeOrbitKm)} from the center of ${holeInSentence}`,
                    ],
                    [
                      'The edge found in this model, with this nudge',
                      `${checks.edge.toFixed(2)} horizon radii, which is ${formatDistance(checks.edge * result.horizonRadiusKm)}`,
                    ],
                  ].map(([label, value]) => (
                    <tr key={label}>
                      <td style={{ padding: '0.3rem 1rem 0.3rem 0', verticalAlign: 'top' }}>{label}</td>
                      <td style={{ padding: '0.3rem 0', verticalAlign: 'top' }}>
                        <strong>{value}</strong>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <p>
              Why is the model's edge ({checks.edge.toFixed(2)}) a little above the exact theory's last safe orbit (
              {LAST_SAFE_ORBIT_IN_HORIZON_RADII})? The exact theory's number is for a nudge that is vanishingly
              small. Our nudge is small but not zero, and an orbit that starts very close to the edge needs only a
              little push to be sent over it. So in this model the probes that start between{' '}
              {LAST_SAFE_ORBIT_IN_HORIZON_RADII} and {checks.edge.toFixed(2)} also plunge.
            </p>

            <p>
              <strong>Checking your first prediction:</strong> asked what happens to a probe circling at 2 horizon
              radii when it gets a tiny nudge inward, you answered "
              {nudgeChoices.find((c) => c.value === submittedNudge)!.label}". In this model the exact-theory probe
              crosses the horizon after about {checks.twoExact.turnsCompleted.toFixed(1)} turns, while the
              ordinary-gravity probe starting at the same place keeps circling, staying within{' '}
              {formatNumber(Math.max(1 - checks.twoOrdinary.closestInHorizonRadii / 2, checks.twoOrdinary.farthestInHorizonRadii / 2 - 1) * 100)}%
              of its starting distance.{' '}
              {submittedNudge === 'spirals-in'
                ? 'So your prediction was right, for the exact theory.'
                : submittedNudge === 'wobbles'
                  ? 'So your prediction was right for ordinary gravity, and off this time for the exact theory, whose probe does not survive the nudge at 2 horizon radii.'
                  : 'So your prediction was off this time. Neither probe flew away. One kept circling and the other fell in.'}
            </p>
            <p>
              <strong>Checking your second prediction:</strong> asked where the last safe place to circle is, you
              answered "{lastSafeChoices.find((c) => c.value === submittedLastSafe)!.label}". In the exact theory it
              is at {LAST_SAFE_ORBIT_IN_HORIZON_RADII} horizon radii. In this model, a probe starting at 3.5 keeps
              circling for all {MAX_TURNS} turns, while one starting at {LAST_SAFE_ORBIT_IN_HORIZON_RADII} plunges
              after about {checks.threeExact.turnsCompleted.toFixed(1)} turns.{' '}
              {submittedLastSafe === 'three'
                ? 'So your prediction was right.'
                : submittedLastSafe === 'anywhere'
                  ? 'So your prediction was off this time. That is true of ordinary gravity, where the probe never plunged, but in the exact theory an orbit close in cannot last.'
                  : 'So your prediction was off this time. The edge is much closer in than 10 horizon radii: a probe starting at 10 keeps circling too.'}
            </p>
            <p>
              <strong>Checking your third prediction:</strong> asked whether, 20 horizon radii out, the exact
              theory's orbit would look different from ordinary gravity's, you answered "
              {farChoices.find((c) => c.value === submittedFar)!.label}". At 20 horizon radii both probes keep
              circling, and their launch speeds are {checks.farOrdinarySpeed.toFixed(3)} and{' '}
              {checks.farExactSpeed.toFixed(3)} of the speed of light, which differ by only{' '}
              {formatNumber((checks.farExactSpeed / checks.farOrdinarySpeed - 1) * 100)}%.{' '}
              {submittedFar === 'nearly-same'
                ? 'So your prediction was right. This is why ordinary gravity worked so well for planets, satellites and GPS in the earlier chapters: they are very far from their masses, measured in horizon radii.'
                : 'So your prediction was off this time. Far from the black hole the two rules agree closely, which is why ordinary gravity worked so well for planets, satellites and GPS in the earlier chapters.'}
            </p>

            <p style={{ marginBottom: '0.25rem' }}>
              <strong>The simple math.</strong> The last safe orbit is at 6GM/c² from the center, which is{' '}
              {LAST_SAFE_ORBIT_IN_HORIZON_RADII} horizon radii. (G is the strength of gravity, M the black hole's
              mass and c the speed of light. This is given, not derived.) For {holeInSentence}:
            </p>
            <ol style={{ margin: 0, paddingLeft: '1.25rem', marginBottom: '0.75rem' }}>
              <li>
                One horizon radius is about {formatNumber(result.horizonRadiusKm / result.preset.massSolarMasses)} km
                for each Sun's worth of mass.
              </li>
              <li>
                {LAST_SAFE_ORBIT_IN_HORIZON_RADII} × {formatNumber(result.horizonRadiusKm / result.preset.massSolarMasses)}{' '}
                km = {formatNumber((LAST_SAFE_ORBIT_IN_HORIZON_RADII * result.horizonRadiusKm) / result.preset.massSolarMasses)} km
                for each Sun's worth of mass.
              </li>
              <li>
                {formatMass(result.preset.massSolarMasses)} × that = {formatDistance(result.lastSafeOrbitKm)}.
              </li>
            </ol>
            <p style={{ marginBottom: '0.25rem' }}>
              The launch speeds come from two given formulas, with x the starting distance in horizon radii:
              ordinary gravity gives √(1 ÷ 2x), and the exact theory gives √(1 ÷ 2(x − 1)). For your start, x ={' '}
              {formatRadii(start)}:
            </p>
            <ol style={{ margin: 0, paddingLeft: '1.25rem', marginBottom: '0.75rem' }}>
              <li>
                Ordinary gravity: 1 ÷ (2 × {formatRadii(start)}) = {(1 / (2 * start)).toFixed(4)}, and its square
                root is {result.ordinarySpeedFractionOfLight.toFixed(3)}.
              </li>
              <li>
                Exact theory: 1 ÷ (2 × {formatRadii(start - 1)}) = {(1 / (2 * (start - 1))).toFixed(4)}, and its
                square root is {result.exactSpeedFractionOfLight.toFixed(3)}.
              </li>
            </ol>
            <p>
              The only difference is the "− 1". It makes no real difference far away, where x − 1 is nearly x, and
              a large one close in. At x = 1.5 the exact speed would reach 1, the speed of light, which is why no
              circular orbit exists closer in than that.
            </p>

            <p>
              <strong>A comparison from daily life.</strong> Picture a marble at the bottom of a bowl. Give it a
              small nudge and it rolls up the side, then comes back and keeps rolling around the bottom. Now picture
              a marble balanced on top of an upside-down bowl. The slightest nudge and it rolls off for good. An
              orbit outside the last safe orbit is like the first marble: a small nudge only makes it wobble. An
              orbit at or inside the last safe orbit is like the second: a small nudge ends it. This is an analogy
              for "survives a nudge or does not", not for how gravity works.
            </p>

            <div
              style={{
                margin: '0.75rem 0',
                padding: '0.75rem 1rem',
                border: '2px solid #f59e0b',
                borderRadius: '8px',
                backgroundColor: 'rgba(245, 158, 11, 0.12)',
              }}
            >
              <p style={{ marginTop: 0, marginBottom: '0.5rem' }}>
                <strong>What this model can and cannot tell you.</strong> This is a thought experiment about a
                small probe. It does not say how the probe got into orbit, or what could give it a nudge. It follows
                the probe in a flat plane for up to {MAX_TURNS} turns, or until it reaches the horizon. Nothing
                inside the horizon is modeled, and the experiment does not show what a traveler who falls in would
                feel.
              </p>
              <p style={{ marginTop: 0, marginBottom: 0 }}>
                The exact equation is given, not derived, and is for a black hole that does not spin and has no
                electric charge. Real black holes usually spin, which moves the last safe orbit. A real orbit this
                close would also lose energy as gravitational waves, which is left out. The nudge, {NUDGE} of the
                distance for each radian swept, is a choice we made, and it sets where the model's edge falls. The
                stellar black hole's mass of 10 Suns is an illustrative round value.
              </p>
            </div>
          </div>
        )}
          </>
        )}
      </div>

      {showResults && (
        <OrbitsNearBlackHoleTutor
          key={runCount}
          predictedNudge={submittedNudge}
          predictedLastSafe={submittedLastSafe}
          predictedFar={submittedFar}
          onExplained={() => onTutorComplete?.()}
        />
      )}
    </div>
  )
}
