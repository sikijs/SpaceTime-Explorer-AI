import { useEffect, useMemo, useState } from 'react'
import type { ReactNode } from 'react'
import {
  BLACK_HOLE_PRESETS,
  LAST_SAFE_ORBIT_IN_HORIZON_RADII,
  MAX_START_IN_HORIZON_RADII,
  MAX_TURNS,
  MIN_START_IN_HORIZON_RADII,
  STEPS_PER_TURN,
  runOrbitsNearBlackHoleExperiment,
} from '../physics/orbitsNearBlackHoleExperiment'
import type { OrbitPath } from '../physics/orbitsNearBlackHoleExperiment'
import type { ObjectPreset } from '../physics/blackHoleSizeExperiment'

interface OrbitsNearBlackHoleExperimentProps {
  onComplete?: () => void
}

// Each panel: a title strip, a square orbit area drawn at a fixed scale (the full radius is 20 horizon radii, the same
// in both panels and for every start), and a legend strip.
const PANEL_WIDTH = 400
const PANEL_HEIGHT = 512
const CENTER_X = 200
const CENTER_Y = 248
const PIXELS_PER_HORIZON_RADIUS = 8.5 // 20 horizon radii = 170 px
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

function OrbitPanel({
  title,
  ruleName,
  color,
  path,
  startInHorizonRadii,
  turnsReached,
  showLastSafeOrbit,
  showTrail,
}: {
  title: string
  ruleName: string
  color: string
  path: OrbitPath
  startInHorizonRadii: number
  turnsReached: number
  showLastSafeOrbit: boolean
  showTrail: boolean
}) {
  const { index, point, ended } = pointAt(path, turnsReached)
  const plunged = path.outcome === 'plunges' && ended
  const px = (x: number) => CENTER_X + x * PIXELS_PER_HORIZON_RADIUS
  const py = (y: number) => CENTER_Y - y * PIXELS_PER_HORIZON_RADIUS

  // The trail so far, thinned out to keep the drawing light.
  const trail: string[] = []
  if (showTrail) {
    for (let i = 0; i <= index; i += 4) trail.push(`${px(path.points[i].x)},${py(path.points[i].y)}`)
    trail.push(`${px(point.x)},${py(point.y)}`)
  }

  const startRadius = startInHorizonRadii * PIXELS_PER_HORIZON_RADIUS
  // The label "start" sits beside the start point, inside the ring when the ring is near the picture's right edge.
  const startLabelAtLeft = px(startInHorizonRadii) > PANEL_WIDTH - 50
  const lastSafeRadius = LAST_SAFE_ORBIT_IN_HORIZON_RADII * PIXELS_PER_HORIZON_RADIUS

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
          <text x={CENTER_X - lastSafeRadius - 6} y={CENTER_Y + 4} fill={LAST_SAFE_COLOR} fontSize="10" textAnchor="end">
            last safe orbit
          </text>
        </g>
      )}

      {/* The black hole and its horizon */}
      <circle cx={CENTER_X} cy={CENTER_Y} r={PIXELS_PER_HORIZON_RADIUS} fill={BLACK_HOLE_COLOR} fillOpacity={0.35} stroke={HORIZON_COLOR} strokeWidth={2} />

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

export function OrbitsNearBlackHoleExperiment({ onComplete }: OrbitsNearBlackHoleExperimentProps) {
  const [presetId, setPresetId] = useState<ObjectPreset['id']>('stellar-black-hole')
  const [start, setStart] = useState(6)
  const [status, setStatus] = useState<'idle' | 'running' | 'complete'>('idle')
  const [progress, setProgress] = useState(0)

  const result = useMemo(() => runOrbitsNearBlackHoleExperiment(presetId, start), [presetId, start])
  const turnsReached = progress * MAX_TURNS

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
    if (status === 'running') return
    setStatus('running')
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
        <div style={{ marginBottom: '1.5rem' }}>
          <p style={{ fontSize: '0.875rem', marginBottom: '0.5rem' }}>Black hole:</p>
          {BLACK_HOLE_PRESETS.map((p) => (
            <button
              key={p.id}
              type="button"
              onClick={() => handlePresetChange(p.id)}
              disabled={status === 'running'}
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
              disabled={status === 'running'}
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
              disabled={status === 'running'}
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
          disabled={status === 'running'}
          style={{ marginTop: '0.5rem', padding: '0.6rem 1.5rem' }}
        >
          {status === 'running' ? 'Running...' : 'Run'}
        </button>

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
          <OrbitPanel
            title="Ordinary gravity (Gravity Experiment 6)"
            ruleName="ordinary gravity"
            color={ORDINARY_COLOR}
            path={result.ordinary}
            startInHorizonRadii={start}
            turnsReached={turnsReached}
            showLastSafeOrbit={false}
            showTrail={status !== 'idle'}
          />
          <OrbitPanel
            title="The exact theory"
            ruleName="the exact theory"
            color={EXACT_COLOR}
            path={result.exact}
            startInHorizonRadii={start}
            turnsReached={turnsReached}
            showLastSafeOrbit
            showTrail={status !== 'idle'}
          />
        </div>

        <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.5rem' }}>
          <p style={{ marginTop: 0, marginBottom: '0.4rem' }}>
            <strong>How to read these diagrams.</strong> Both pictures show the same thing from directly above: a
            small probe circling a black hole. The black hole is at the center. The two pictures use the same
            scale, with the full width of each equal to 20 horizon radii, so a different start moves the starting
            ring in or out.
          </p>
          <ol style={{ margin: 0, paddingLeft: '1.1rem' }}>
            <li style={{ marginBottom: '0.4rem' }}>
              <strong>The probe starts on the dashed white ring, to the right of the center, moving around the black
              hole.</strong> Each probe is launched at the speed that would give a perfectly circular orbit at
              that distance <em>by its own rules</em>. The gold probe on the left follows ordinary gravity, from
              Gravity and Curved Spacetime, Experiment 6. The blue probe on the right follows the exact theory of
              gravity. The two launch speeds are listed above the pictures, as fractions of the speed of light.
            </li>
            <li style={{ marginBottom: '0.4rem' }}>
              <strong>Each probe also gets the same tiny nudge inward at the start.</strong> It is so small that,
              if nothing else acted, it would carry the probe in by only about 0.6% of its distance over one full
              turn. It stands for any small disturbance a real orbit would have. The question is what each probe
              does with it.
            </li>
            <li style={{ marginBottom: '0.4rem' }}>
              <strong>The trail shows the path so far, and the numbers above each picture count the turns and the
              distance.</strong> The experiment follows each probe for up to {MAX_TURNS} turns around the black
              hole, or until it reaches the horizon, the rose ring around the black hole. The time of the run is
              the probe's own, played at a fixed speed.
            </li>
            <li style={{ marginBottom: '0.4rem' }}>
              <strong>The dashed purple ring in the right-hand picture is the last safe orbit of the exact theory</strong>,
              at 3 horizon radii from the center. It is drawn only on the right, because ordinary gravity has no
              such ring.
            </li>
            <li style={{ marginBottom: '0.4rem' }}>
              <strong>The left-hand probe is shown at every distance, even close to the black hole,</strong> where
              ordinary gravity is not a good description. It is there so that the two rules can be compared, not
              because ordinary gravity is right there.
            </li>
            <li style={{ marginBottom: 0 }}>
              <strong>What these pictures are not.</strong> They follow a small probe in a flat plane, not a
              traveler falling into the black hole, and they do not show how the probe was put into orbit. Close to
              the black hole the horizon and the probe are small in the drawing, because the whole width is 20
              horizon radii.
            </li>
          </ol>
        </div>
      </div>
    </div>
  )
}
