import { useEffect, useState } from 'react'
import {
  LENS_DISTANCE_MPC,
  MAX_LENS_MASS_SOLAR_MASSES,
  MIN_LENS_MASS_SOLAR_MASSES,
  OBSERVED_TOTAL_MASS_SOLAR_MASSES,
  SOURCE_DISTANCE_MPC,
  VISIBLE_MASS_FRACTION,
  einsteinRingArcseconds,
  runGravitationalLensingExperiment,
} from '../physics/gravitationalLensingExperiment'

interface GravitationalLensingExperimentProps {
  onComplete?: () => void
  onTutorComplete?: () => void
}

type MassMode = 'visible' | 'observed' | 'custom'

// Fixed real-world playback duration (CLAUDE.md §11): playback speed never changes the result.
const ANIMATION_DURATION_MS = 9000
// The first part of the playback sends light from the source to Earth; the rest shows the ring.
const TRAVEL_FRACTION = 0.6

const CHOSEN_COLOR = '#fbbf24'
const VISIBLE_COLOR = '#38bdf8'
const OBSERVED_COLOR = '#4ade80'
const RAY_COLOR = '#fde68a'

const SUPERSCRIPT_DIGITS = '⁰¹²³⁴⁵⁶⁷⁸⁹'
function massLabel(mass: number): string {
  const exponent = Math.floor(Math.log10(mass))
  const mantissa = mass / 10 ** exponent
  const exponentText = String(exponent)
    .split('')
    .map((digit) => SUPERSCRIPT_DIGITS[Number(digit)])
    .join('')
  return `${mantissa.toFixed(1)} × 10${exponentText}`
}

// Sky picture geometry: one arcsecond of ring radius is drawn as SKY_PIXELS_PER_ARCSECOND pixels.
const SKY_SIZE = 340
const SKY_CENTER = SKY_SIZE / 2
const SKY_PIXELS_PER_ARCSECOND = 2.2
const SCALE_BAR_ARCSECONDS = 20

// Geometry picture: Earth, lens, and source in a line, placed in proportion to their distances.
const GEOMETRY_WIDTH = 560
const GEOMETRY_HEIGHT = 250
const GEOMETRY_MID_Y = GEOMETRY_HEIGHT / 2
const EARTH_X = 40
const SOURCE_X = 510
const LENS_X = EARTH_X + (LENS_DISTANCE_MPC / SOURCE_DISTANCE_MPC) * (SOURCE_X - EARTH_X)

// Graph geometry: ring radius against cluster mass.
const GRAPH_WIDTH = 460
const GRAPH_HEIGHT = 300
const GRAPH_LEFT = 60
const GRAPH_RIGHT = GRAPH_WIDTH - 20
const GRAPH_TOP = 30
const GRAPH_BOTTOM = GRAPH_HEIGHT - 50
const GRAPH_MAX_RING = 75
const CURVE_SAMPLES = 80

function graphX(mass: number): number {
  return GRAPH_LEFT + (mass / MAX_LENS_MASS_SOLAR_MASSES) * (GRAPH_RIGHT - GRAPH_LEFT)
}

function graphY(ring: number): number {
  return GRAPH_BOTTOM - (ring / GRAPH_MAX_RING) * (GRAPH_BOTTOM - GRAPH_TOP)
}

export function GravitationalLensingExperiment({ onComplete }: GravitationalLensingExperimentProps) {
  const [mode, setMode] = useState<MassMode>('observed')
  const [customMass, setCustomMass] = useState(1e14)
  const [status, setStatus] = useState<'idle' | 'running' | 'complete'>('idle')
  const [progress, setProgress] = useState(0)

  const visibleMass = VISIBLE_MASS_FRACTION * OBSERVED_TOTAL_MASS_SOLAR_MASSES
  const mass = mode === 'visible' ? visibleMass : mode === 'observed' ? OBSERVED_TOTAL_MASS_SOLAR_MASSES : customMass
  const result = runGravitationalLensingExperiment(mass)
  const isActive = status === 'running' || status === 'complete'

  const handleModeChange = (next: MassMode) => {
    setMode(next)
    if (status === 'complete') setStatus('idle')
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

  const displayedProgress = status === 'idle' ? 0 : progress
  const travelProgress = Math.min(displayedProgress / TRAVEL_FRACTION, 1)
  const ringProgress = Math.max((displayedProgress - TRAVEL_FRACTION) / (1 - TRAVEL_FRACTION), 0)

  // Geometry picture: the bending is exaggerated for visibility (display only), growing with the ring.
  const bendHeight = 14 + result.ringArcseconds * 1.0
  const rayPoint = (sign: 1 | -1, t: number) => {
    // t from 0 (source) to 1 (Earth), along source -> bend point -> Earth.
    const bendX = LENS_X
    const bendY = GEOMETRY_MID_Y + sign * bendHeight
    if (t <= 0.5) {
      const u = t / 0.5
      return { x: SOURCE_X + (bendX - SOURCE_X) * u, y: GEOMETRY_MID_Y + (bendY - GEOMETRY_MID_Y) * u }
    }
    const u = (t - 0.5) / 0.5
    return { x: bendX + (EARTH_X - bendX) * u, y: bendY + (GEOMETRY_MID_Y - bendY) * u }
  }

  const rings = {
    chosen: result.ringArcseconds * SKY_PIXELS_PER_ARCSECOND,
    visible: result.visibleOnlyRingArcseconds * SKY_PIXELS_PER_ARCSECOND,
    observed: result.observedRingArcseconds * SKY_PIXELS_PER_ARCSECOND,
  }

  // Drawn from zero mass, with samples packed toward zero where the square-root curve is steepest.
  const curvePoints = Array.from({ length: CURVE_SAMPLES + 1 }, (_, i) => {
    const m = MAX_LENS_MASS_SOLAR_MASSES * (i / CURVE_SAMPLES) ** 2
    return `${graphX(m).toFixed(1)},${graphY(m === 0 ? 0 : einsteinRingArcseconds(m)).toFixed(1)}`
  }).join(' ')

  const massTicks = [0, 1e14, 2e14, 3e14, 4e14]
  const ringTicks = [0, 25, 50, 75]

  return (
    <div style={{ padding: '2rem', maxWidth: '900px', margin: '0 auto' }}>
      <h2>Experiment 7 — Weighing a Galaxy Cluster with Light</h2>

      <div className="exp-card" style={{ marginTop: '2rem', padding: '1.5rem' }}>
        <div style={{ marginBottom: '1.5rem' }}>
          <p style={{ fontSize: '0.875rem', marginBottom: '0.5rem' }}>
            Mass of the galaxy cluster in the middle (in solar masses):
          </p>
          <button
            type="button"
            onClick={() => handleModeChange('visible')}
            disabled={status === 'running'}
            className={`toggle-button${mode === 'visible' ? ' is-selected' : ''}`}
            style={{ marginRight: '0.5rem', marginBottom: '0.5rem' }}
          >
            Visible matter only (stars and hot gas, about {Math.round(VISIBLE_MASS_FRACTION * 100)}% of the total)
          </button>
          <button
            type="button"
            onClick={() => handleModeChange('observed')}
            disabled={status === 'running'}
            className={`toggle-button${mode === 'observed' ? ' is-selected' : ''}`}
            style={{ marginRight: '0.5rem', marginBottom: '0.5rem' }}
          >
            Visible plus dark matter (the observed total)
          </button>
          <button
            type="button"
            onClick={() => handleModeChange('custom')}
            disabled={status === 'running'}
            className={`toggle-button${mode === 'custom' ? ' is-selected' : ''}`}
            style={{ marginRight: '0.5rem', marginBottom: '0.5rem' }}
          >
            Custom
          </button>
          {mode === 'custom' && (
            <div style={{ marginTop: '0.5rem' }}>
              <label htmlFor="lensing-mass" style={{ display: 'block', marginBottom: '0.5rem' }}>
                Cluster mass: {massLabel(customMass)} solar masses
              </label>
              <input
                id="lensing-mass"
                type="range"
                min={MIN_LENS_MASS_SOLAR_MASSES}
                max={MAX_LENS_MASS_SOLAR_MASSES}
                step={1e12}
                value={customMass}
                disabled={status === 'running'}
                onChange={(event) => {
                  setCustomMass(Number(event.target.value))
                  if (status === 'complete') setStatus('idle')
                }}
                style={{ width: '100%' }}
              />
            </div>
          )}
          <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.5rem', marginBottom: 0 }}>
            Chosen mass: {massLabel(mass)} solar masses
          </p>
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

        {isActive && (
          <p style={{ marginTop: '1rem', marginBottom: 0, fontSize: '0.75rem', color: 'var(--text-muted)' }}>
            Cluster mass: {massLabel(mass)} solar masses &nbsp;|&nbsp; Ring radius:{' '}
            <strong>{result.ringArcseconds.toFixed(1)} arcseconds</strong>
            <br />
            Ring from visible matter alone: {result.visibleOnlyRingArcseconds.toFixed(1)} arcseconds
            &nbsp;|&nbsp; Observed ring: {result.observedRingArcseconds.toFixed(1)} arcseconds
            <br />
            Light bends by {result.bendingAngleArcseconds.toFixed(1)} arcseconds at the ring's edge. Your ring is{' '}
            {result.ringOverVisibleOnlyRing.toFixed(2)} times as wide as the visible-matter ring.
          </p>
        )}

        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1rem', marginTop: '1rem' }}>
          <svg
            width={GEOMETRY_WIDTH}
            height={GEOMETRY_HEIGHT}
            viewBox={`0 0 ${GEOMETRY_WIDTH} ${GEOMETRY_HEIGHT}`}
            style={{
              display: 'block',
              border: '1px solid var(--border-color, #ccc)',
              borderRadius: '8px',
              backgroundColor: '#0b1020',
              maxWidth: '100%',
              height: 'auto',
            }}
          >
            <text x={GEOMETRY_WIDTH / 2} y={20} fill="#e2e8f0" fontSize="12" fontWeight="600" textAnchor="middle">
              Side view: light from a distant galaxy bends around the cluster (not to scale)
            </text>

            {/* The straight line-up */}
            <line x1={EARTH_X} y1={GEOMETRY_MID_Y} x2={SOURCE_X} y2={GEOMETRY_MID_Y} stroke="#334155" strokeDasharray="3 4" />

            {/* Light rays: source -> bend point -> Earth, one above and one below the cluster */}
            {[1, -1].map((sign) => (
              <polyline
                key={sign}
                points={`${SOURCE_X},${GEOMETRY_MID_Y} ${LENS_X},${GEOMETRY_MID_Y + sign * bendHeight} ${EARTH_X},${GEOMETRY_MID_Y}`}
                fill="none"
                stroke={RAY_COLOR}
                strokeWidth={1.5}
                opacity={0.5}
              />
            ))}
            {isActive &&
              [1, -1].map((sign) => {
                const p = rayPoint(sign as 1 | -1, travelProgress)
                return <circle key={sign} cx={p.x} cy={p.y} r={4.5} fill={RAY_COLOR} />
              })}

            {/* Earth */}
            <circle cx={EARTH_X} cy={GEOMETRY_MID_Y} r={12} fill="#38bdf8" />
            <text x={EARTH_X} y={GEOMETRY_MID_Y + 32} fill="#e2e8f0" fontSize="11" textAnchor="middle">
              Earth
            </text>

            {/* The cluster (the lens) */}
            <defs>
              <radialGradient id="lensing-cluster-glow">
                <stop offset="0%" stopColor="#ede9fe" stopOpacity={1} />
                <stop offset="100%" stopColor="#7c3aed" stopOpacity={0.35} />
              </radialGradient>
            </defs>
            <circle cx={LENS_X} cy={GEOMETRY_MID_Y} r={20} fill="url(#lensing-cluster-glow)" />
            <text x={LENS_X} y={GEOMETRY_MID_Y + 40} fill="#e2e8f0" fontSize="11" textAnchor="middle" stroke="#0b1020" strokeWidth={3} paintOrder="stroke">
              Galaxy cluster (the lens)
            </text>
            <text x={LENS_X} y={GEOMETRY_MID_Y + 54} fill="#94a3b8" fontSize="10" textAnchor="middle" stroke="#0b1020" strokeWidth={3} paintOrder="stroke">
              light bends toward it here
            </text>

            {/* The distant galaxy (the source) */}
            <ellipse cx={SOURCE_X} cy={GEOMETRY_MID_Y} rx={14} ry={7} fill="#fde68a" />
            <text x={SOURCE_X} y={GEOMETRY_MID_Y + 32} fill="#e2e8f0" fontSize="11" textAnchor="middle">
              Distant galaxy
            </text>
            <text x={SOURCE_X} y={GEOMETRY_MID_Y + 46} fill="#e2e8f0" fontSize="11" textAnchor="middle">
              (the source)
            </text>

            <text x={(LENS_X + SOURCE_X) / 2 + 10} y={GEOMETRY_MID_Y - bendHeight + 18} fill={RAY_COLOR} fontSize="10">
              light rays
            </text>
          </svg>

          <svg
            width={SKY_SIZE}
            height={SKY_SIZE}
            viewBox={`0 0 ${SKY_SIZE} ${SKY_SIZE}`}
            style={{
              display: 'block',
              border: '1px solid var(--border-color, #ccc)',
              borderRadius: '8px',
              backgroundColor: '#0b1020',
              maxWidth: '100%',
              height: 'auto',
            }}
          >
            <text x={SKY_SIZE / 2} y={20} fill="#e2e8f0" fontSize="12" fontWeight="600" textAnchor="middle">
              What we see on the sky from Earth
            </text>

            {/* The ring that visible matter alone would make */}
            <circle cx={SKY_CENTER} cy={SKY_CENTER} r={rings.visible} fill="none" stroke={VISIBLE_COLOR} strokeWidth={2} strokeDasharray="6 4" />
            {/* The observed ring of the real cluster */}
            <circle cx={SKY_CENTER} cy={SKY_CENTER} r={rings.observed} fill="none" stroke={OBSERVED_COLOR} strokeWidth={1.5} strokeDasharray="2 3" opacity={0.9} />

            {/* The ring for the chosen mass, drawn out when the light arrives */}
            {isActive && ringProgress > 0 && (
              <>
                <circle cx={SKY_CENTER} cy={SKY_CENTER} r={rings.chosen * ringProgress} fill="none" stroke={CHOSEN_COLOR} strokeWidth={9} opacity={0.25} />
                <circle cx={SKY_CENTER} cy={SKY_CENTER} r={rings.chosen * ringProgress} fill="none" stroke={CHOSEN_COLOR} strokeWidth={3.5} />
              </>
            )}

            {/* The cluster at the center; the source is exactly behind it */}
            <circle cx={SKY_CENTER} cy={SKY_CENTER} r={11} fill="url(#lensing-cluster-glow)" />
            <text x={SKY_CENTER + 14} y={SKY_CENTER + 4} fill="#e2e8f0" fontSize="10">
              Cluster
            </text>

            {/* Labels for the three rings, each on its own side */}
            <text x={SKY_CENTER + rings.observed * 0.71 + 4} y={SKY_CENTER - rings.observed * 0.71 - 4} fill={OBSERVED_COLOR} fontSize="10" fontWeight="600">
              Observed ring
            </text>
            <text x={SKY_CENTER} y={SKY_CENTER + rings.visible + 14} fill={VISIBLE_COLOR} fontSize="10" fontWeight="600" textAnchor="middle" stroke="#0b1020" strokeWidth={3} paintOrder="stroke">
              Visible matter only
            </text>
            {isActive && ringProgress >= 1 && (
              <text
                x={SKY_CENTER - rings.chosen * 0.71 - 4}
                y={SKY_CENTER + rings.chosen * 0.71 + 14}
                fill={CHOSEN_COLOR}
                fontSize="10"
                fontWeight="600"
                stroke="#0b1020"
                strokeWidth={3}
                paintOrder="stroke"
                textAnchor="end"
              >
                Your ring
              </text>
            )}

            {/* Scale bar */}
            <line x1={20} y1={SKY_SIZE - 22} x2={20 + SCALE_BAR_ARCSECONDS * SKY_PIXELS_PER_ARCSECOND} y2={SKY_SIZE - 22} stroke="#cbd5e1" strokeWidth={2} />
            <text x={20} y={SKY_SIZE - 8} fill="#cbd5e1" fontSize="10">
              {SCALE_BAR_ARCSECONDS} arcseconds
            </text>
          </svg>
        </div>

        <svg
          width={GRAPH_WIDTH}
          height={GRAPH_HEIGHT}
          viewBox={`0 0 ${GRAPH_WIDTH} ${GRAPH_HEIGHT}`}
          style={{
            display: 'block',
            marginTop: '1rem',
            border: '1px solid var(--border-color, #ccc)',
            borderRadius: '8px',
            backgroundColor: '#0b1020',
            maxWidth: '100%',
            height: 'auto',
          }}
        >
          <text x={GRAPH_WIDTH / 2} y={18} fill="#e2e8f0" fontSize="12" fontWeight="600" textAnchor="middle">
            Ring radius against cluster mass
          </text>
          <line x1={GRAPH_LEFT} y1={GRAPH_TOP} x2={GRAPH_LEFT} y2={GRAPH_BOTTOM} stroke="#64748b" />
          <line x1={GRAPH_LEFT} y1={GRAPH_BOTTOM} x2={GRAPH_RIGHT} y2={GRAPH_BOTTOM} stroke="#64748b" />
          {massTicks.map((m) => (
            <g key={m}>
              <line x1={graphX(m)} y1={GRAPH_BOTTOM} x2={graphX(m)} y2={GRAPH_BOTTOM + 4} stroke="#64748b" />
              <text x={graphX(m)} y={GRAPH_BOTTOM + 16} fill="#cbd5e1" fontSize="10" textAnchor={m === MAX_LENS_MASS_SOLAR_MASSES ? 'end' : 'middle'}>
                {m === 0 ? '0' : massLabel(m)}
              </text>
            </g>
          ))}
          {ringTicks.map((r) => (
            <g key={r}>
              <line x1={GRAPH_LEFT - 4} y1={graphY(r)} x2={GRAPH_LEFT} y2={graphY(r)} stroke="#64748b" />
              <text x={GRAPH_LEFT - 8} y={graphY(r) + 4} fill="#cbd5e1" fontSize="10" textAnchor="end">
                {r}
              </text>
            </g>
          ))}
          <text x={(GRAPH_LEFT + GRAPH_RIGHT) / 2} y={GRAPH_HEIGHT - 8} fill="#cbd5e1" fontSize="11" textAnchor="middle">
            Cluster mass (solar masses)
          </text>
          <text
            x={14}
            y={(GRAPH_TOP + GRAPH_BOTTOM) / 2}
            fill="#cbd5e1"
            fontSize="11"
            textAnchor="middle"
            transform={`rotate(-90 14 ${(GRAPH_TOP + GRAPH_BOTTOM) / 2})`}
          >
            Ring radius (arcseconds)
          </text>

          {/* The observed ring as a horizontal reference line */}
          <line x1={GRAPH_LEFT} y1={graphY(result.observedRingArcseconds)} x2={GRAPH_RIGHT} y2={graphY(result.observedRingArcseconds)} stroke={OBSERVED_COLOR} strokeDasharray="2 3" />
          <text x={GRAPH_LEFT + 6} y={graphY(result.observedRingArcseconds) - 5} fill={OBSERVED_COLOR} fontSize="10" fontWeight="600">
            Observed ring: {result.observedRingArcseconds.toFixed(0)} arcseconds
          </text>

          <polyline points={curvePoints} fill="none" stroke="#a78bfa" strokeWidth={2.5} />
          <text x={GRAPH_RIGHT} y={graphY(runGravitationalLensingExperiment(MAX_LENS_MASS_SOLAR_MASSES).ringArcseconds) - 8} fill="#a78bfa" fontSize="10" fontWeight="600" textAnchor="end">
            Ring for any mass
          </text>

          {/* The visible-only point */}
          <circle cx={graphX(result.visibleOnlyMassSolarMasses)} cy={graphY(result.visibleOnlyRingArcseconds)} r={5} fill={VISIBLE_COLOR} />
          <text
            x={graphX(result.visibleOnlyMassSolarMasses) + 8}
            y={graphY(result.visibleOnlyRingArcseconds) + 14}
            fill={VISIBLE_COLOR}
            fontSize="10"
            fontWeight="600"
          >
            Visible matter only
          </text>

          {/* The chosen mass */}
          <circle cx={graphX(mass)} cy={graphY(result.ringArcseconds)} r={6} fill={CHOSEN_COLOR} stroke="#0b1020" strokeWidth={2} />
          <text
            x={graphX(mass)}
            y={graphY(result.ringArcseconds) + 20}
            fill={CHOSEN_COLOR}
            fontSize="10"
            fontWeight="600"
            textAnchor={graphX(mass) > GRAPH_RIGHT - 45 ? 'end' : 'middle'}
            stroke="#0b1020"
            strokeWidth={3}
            paintOrder="stroke"
          >
            Your mass
          </text>
        </svg>

        <div style={{ marginTop: '1rem', fontSize: '0.75rem', color: 'var(--text-muted)' }}>
          <p style={{ marginTop: 0, marginBottom: '0.5rem' }}>
            <strong>How to read these diagrams.</strong> A galaxy cluster sits almost exactly between us and a
            much more distant galaxy. The cluster's gravity bends the distant galaxy's light, so we see a ring
            of light around the cluster instead of a single dot. The bigger the cluster's mass, the bigger the
            ring.
          </p>
          <p style={{ marginTop: 0, marginBottom: '0.3rem' }}>
            <strong>The side view.</strong>
          </p>
          <ul style={{ margin: '0 0 0.6rem 0', paddingLeft: '1.1rem' }}>
            <li>
              <strong>Earth</strong> is on the left, the <strong>cluster (the lens)</strong> is in the middle,
              and the <strong>distant galaxy (the source)</strong> is on the right. They are placed in
              proportion to their real distances, but the picture is not to scale in other ways.
            </li>
            <li>
              The yellow <strong>light rays</strong> leave the source, bend toward the cluster as they pass it,
              and reach Earth. One ray goes above the cluster and one below. The bending is drawn much larger
              than it really is, and it grows with the mass you choose.
            </li>
          </ul>
          <p style={{ marginTop: 0, marginBottom: '0.3rem' }}>
            <strong>The sky view.</strong>
          </p>
          <ul style={{ margin: '0 0 0.6rem 0', paddingLeft: '1.1rem' }}>
            <li>
              This is what we would see looking at the cluster. The source is exactly behind the cluster, so
              its light arrives from every direction around it and forms a ring. The scale bar shows how big
              20 arcseconds is.
            </li>
            <li>
              The <strong style={{ color: CHOSEN_COLOR }}>solid gold ring</strong> is the ring for the mass you
              chose. It appears when the light arrives.
            </li>
            <li>
              The <strong style={{ color: VISIBLE_COLOR }}>dashed blue ring</strong> is the ring that the
              cluster's visible matter alone (stars and hot gas) would make.
            </li>
            <li>
              The <strong style={{ color: OBSERVED_COLOR }}>dotted green ring</strong> is the ring actually
              seen for a real cluster (Abell 1689). Compare it with the blue ring.
            </li>
          </ul>
          <p style={{ marginTop: 0, marginBottom: '0.3rem' }}>
            <strong>The graph.</strong>
          </p>
          <ul style={{ margin: 0, paddingLeft: '1.1rem' }}>
            <li>
              Across the bottom is the cluster's mass, in solar masses (one solar mass is the mass of our Sun).
              Up the side is the ring's radius in arcseconds (one arcsecond is a 3,600th of a degree). The
              purple curve shows the ring for every mass. It rises quickly and then flattens: four times the
              mass makes a ring only twice as wide.
            </li>
            <li>
              The gold dot is your mass, the blue dot is visible matter only, and the dotted green line is the
              observed ring. Where the curve crosses the green line is the mass the observed ring tells us the
              cluster has.
            </li>
          </ul>
        </div>
      </div>
    </div>
  )
}
