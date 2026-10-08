import { useEffect, useState } from 'react'
import { GravitationalLensingTutor } from './GravitationalLensingTutor'
import {
  LENS_DISTANCE_MPC,
  LENS_TO_SOURCE_DISTANCE_MPC,
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

// This experiment's two prediction questions, per its specification's "Prediction Activity".
// Choices are not scored.
type RingSizeChoice = 'larger' | 'same' | 'smaller'
const ringSizeChoices: Array<{ value: RingSizeChoice; label: string }> = [
  { value: 'larger', label: 'Larger' },
  { value: 'same', label: 'The same size' },
  { value: 'smaller', label: 'Smaller' },
]

type FourTimesChoice = 'four' | 'two' | 'same'
const fourTimesChoices: Array<{ value: FourTimesChoice; label: string }> = [
  { value: 'four', label: 'Four times as wide' },
  { value: 'two', label: 'Twice as wide' },
  { value: 'same', label: 'About the same' },
]

// What the model gives for each prediction question (not scored; used only to say whether the learner's
// answer matched).
const ACTUAL_RING_SIZE: RingSizeChoice = 'larger'
const ACTUAL_FOUR_TIMES: FourTimesChoice = 'two'

// Fixed real-world playback duration (CLAUDE.md §11): playback speed never changes the result.
const ANIMATION_DURATION_MS = 8000
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

export function GravitationalLensingExperiment({ onComplete, onTutorComplete }: GravitationalLensingExperimentProps) {
  const [mode, setMode] = useState<MassMode>('observed')
  const [customMass, setCustomMass] = useState(1e14)
  const [status, setStatus] = useState<'idle' | 'running' | 'complete'>('idle')
  const [progress, setProgress] = useState(0)
  // Remounts the tutor on each new run so its conversation starts over.
  const [runCount, setRunCount] = useState(0)

  const [ringSizePrediction, setRingSizePrediction] = useState<RingSizeChoice | null>(null)
  const [fourTimesPrediction, setFourTimesPrediction] = useState<FourTimesChoice | null>(null)
  const [submittedRingSizePrediction, setSubmittedRingSizePrediction] = useState<RingSizeChoice | null>(null)
  const [submittedFourTimesPrediction, setSubmittedFourTimesPrediction] = useState<FourTimesChoice | null>(null)

  const hasPrediction = ringSizePrediction !== null && fourTimesPrediction !== null
  const hasSubmittedPrediction = submittedRingSizePrediction !== null && submittedFourTimesPrediction !== null

  const visibleMass = VISIBLE_MASS_FRACTION * OBSERVED_TOTAL_MASS_SOLAR_MASSES
  const mass = mode === 'visible' ? visibleMass : mode === 'observed' ? OBSERVED_TOTAL_MASS_SOLAR_MASSES : customMass
  const result = runGravitationalLensingExperiment(mass)
  const isActive = status === 'running' || status === 'complete'

  const handleModeChange = (next: MassMode) => {
    setMode(next)
    if (status === 'complete') setStatus('idle')
  }

  const handleRun = () => {
    if (!hasPrediction || status === 'running') return
    if (!hasSubmittedPrediction) {
      setSubmittedRingSizePrediction(ringSizePrediction)
      setSubmittedFourTimesPrediction(fourTimesPrediction)
    }
    setStatus('running')
    setProgress(0)
    setRunCount((count) => count + 1)
  }

  // Matches the rest of the project's precedent: re-opens both questions for editing without
  // resetting the chosen mass.
  const handleChangePrediction = () => {
    setSubmittedRingSizePrediction(null)
    setSubmittedFourTimesPrediction(null)
    setStatus('idle')
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
      <h2>Experiment 7 — Gravitational Lensing</h2>

      <div className="exp-card" style={{ marginTop: '2rem', padding: '1.5rem' }}>
        <div style={{ marginBottom: '2rem', fontSize: '0.875rem', color: 'var(--text-muted)' }}>
          <p style={{ marginTop: 0, marginBottom: '0.75rem' }}>
            <strong>The question.</strong> How do you weigh something as huge as a galaxy cluster, and what can
            its effect on light tell us about what it is made of?
          </p>
          <p style={{ marginTop: 0, marginBottom: '0.75rem' }}>
            <strong>What happens.</strong> A <strong>galaxy cluster</strong> is a huge group of hundreds or
            thousands of galaxies held together by gravity. Suppose one sits almost exactly between us and a
            much more distant galaxy. In Gravity and Curved Spacetime Experiment 8 you saw that a mass bends
            light passing near it. Here the cluster's gravity bends the distant galaxy's light on its way to
            us. This is called <strong>gravitational lensing</strong>. The cluster is the{' '}
            <strong>lens</strong>, and the distant galaxy is the <strong>source</strong>. If the source, the
            lens and Earth line up almost perfectly, the bent light reaches us from all sides of the cluster,
            and we see the source as a ring of light around it, called an <strong>Einstein ring</strong>. You
            choose the cluster's mass, in solar masses (the mass of our Sun, as in Experiment 4), and watch
            the ring appear.
          </p>
          <p style={{ marginTop: 0, marginBottom: '0.75rem' }}>
            <strong>A new unit: the arcsecond.</strong> We measure the ring's size as an angle on the sky. A
            degree is divided into 60 arcminutes, and an arcminute into 60 arcseconds, so one{' '}
            <strong>arcsecond</strong> is a 3,600th of a degree. For a feel for how small that is, a one
            centimeter coin seen from about two kilometers away spans about one arcsecond.
          </p>
          <p style={{ marginTop: 0, marginBottom: '0.75rem' }}>
            <strong>A daily-life picture.</strong> Hold a wine glass between you and a distant lamp, and look
            through its thick stem or base. The glass bends the lamp's light, and when the lamp, the glass
            and your eye line up just right, the lamp's light is smeared into a ring. A galaxy cluster does
            something similar with gravity instead of glass.
          </p>
          <p style={{ marginTop: 0, marginBottom: '0.75rem' }}>
            <strong>Why even ask this.</strong> We cannot put a galaxy cluster on a scale, and its mass is
            spread over millions of light-years. But its gravity bends light that passes it, whatever the mass
            is made of. So how the light is bent can tell us how much mass there is.
          </p>
          <p style={{ marginTop: 0, marginBottom: '0.75rem' }}>
            <strong>Your job.</strong> First, make two predictions about how the ring depends on the cluster's
            mass. Then pick a mass and run it.
          </p>
          <p style={{ marginTop: 0, marginBottom: '0.75rem' }}>
            <strong>What to look for.</strong> Watch how the ring's size changes with the mass you choose, and
            compare three rings: the ring for your chosen mass, the one that the cluster's visible matter alone would
            make, and the ring actually observed for a real cluster. We reuse <strong>dark matter</strong>{' '}
            from Experiment 4, with the same meaning.
          </p>
          <p style={{ marginTop: 0, marginBottom: '0.25rem' }}>
            <strong>What we assume.</strong>
          </p>
          <ul style={{ marginTop: 0, marginBottom: 0, paddingLeft: '1.25rem' }}>
            <li>
              The cluster is treated as round, with the source exactly behind its center. Real clusters are
              lumpy and rarely line up perfectly, so real rings are usually broken into arcs and distorted
              images.
            </li>
            <li>
              The mass we work out is the mass inside the ring. That is all a ring can tell us about a round
              lens.
            </li>
            <li>
              All the bending is treated as happening at one place, the cluster, and the angles are tiny. This
              is a standard, very good approximation for clusters.
            </li>
            <li>
              The three distances (to the cluster, to the source, and between them) are fixed, rounded values
              for one real situation, a cluster like Abell 1689. They use the same illustrative Hubble constant
              as Experiment 1 (70 km/s per megaparsec), with the same real caveat: published values range from
              about 67 to 73, the "Hubble tension."
            </li>
            <li>
              The "observed" ring (about 47 arcseconds, measured for Abell 1689) and the visible share (about
              15% of the total, stars plus hot gas) are given values, not worked out here. The 15% is an
              average for real clusters, applied here to the mass inside the ring, which is approximate.
            </li>
            <li>
              The real amount of bending is used, which is twice what ordinary gravity alone would give, for
              the reason you saw in Gravity and Curved Spacetime Experiment 8.
            </li>
            <li>Nothing here claims to say what dark matter is.</li>
          </ul>
        </div>

        <div style={{ marginBottom: '1.5rem' }}>
          <p style={{ fontSize: '0.875rem', marginBottom: '0.75rem' }}>
            If the cluster between us and a distant galaxy had more mass, would the ring of light we see be
            larger, the same size, or smaller?
          </p>
          <div style={{ marginBottom: '0.5rem' }}>
            {ringSizeChoices.map((choice) => (
              <button
                key={choice.value}
                onClick={() => setRingSizePrediction(choice.value)}
                disabled={hasSubmittedPrediction}
                className={`toggle-button${ringSizePrediction === choice.value ? ' is-selected' : ''}`}
                style={{ marginRight: '0.5rem', marginBottom: '0.5rem' }}
              >
                {choice.label}
              </button>
            ))}
          </div>

          <p style={{ fontSize: '0.875rem', marginBottom: '0.75rem' }}>
            If the cluster had four times the mass, how wide would the ring be compared with before?
          </p>
          <div style={{ marginBottom: '0.5rem' }}>
            {fourTimesChoices.map((choice) => (
              <button
                key={choice.value}
                onClick={() => setFourTimesPrediction(choice.value)}
                disabled={hasSubmittedPrediction}
                className={`toggle-button${fourTimesPrediction === choice.value ? ' is-selected' : ''}`}
                style={{ marginRight: '0.5rem', marginBottom: '0.5rem' }}
              >
                {choice.label}
              </button>
            ))}
          </div>

          <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
            {hasPrediction || hasSubmittedPrediction
              ? `Your predictions: ${
                  ringSizeChoices.find((c) => c.value === (ringSizePrediction ?? submittedRingSizePrediction))!
                    .label
                }, ${
                  fourTimesChoices.find((c) => c.value === (fourTimesPrediction ?? submittedFourTimesPrediction))!
                    .label
                }`
              : 'Answer both questions to continue'}
          </p>
        </div>

        {hasSubmittedPrediction && (
          <div style={{ marginTop: '-0.5rem', marginBottom: '1rem' }}>
            <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '0.5rem' }}>
              Your predictions are locked in above. You can still try as many masses as you like below. Or,
              change your predictions and start over:
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
          <p style={{ fontSize: '0.875rem', marginBottom: '0.5rem' }}>
            Mass of the galaxy cluster in the middle (in solar masses):
          </p>
          <button
            type="button"
            onClick={() => handleModeChange('visible')}
            disabled={!hasPrediction || status === 'running'}
            className={`toggle-button${mode === 'visible' ? ' is-selected' : ''}`}
            style={{ marginRight: '0.5rem', marginBottom: '0.5rem' }}
          >
            Visible matter only (stars and hot gas, about {Math.round(VISIBLE_MASS_FRACTION * 100)}% of the total)
          </button>
          <button
            type="button"
            onClick={() => handleModeChange('observed')}
            disabled={!hasPrediction || status === 'running'}
            className={`toggle-button${mode === 'observed' ? ' is-selected' : ''}`}
            style={{ marginRight: '0.5rem', marginBottom: '0.5rem' }}
          >
            Visible plus dark matter (the observed total)
          </button>
          <button
            type="button"
            onClick={() => handleModeChange('custom')}
            disabled={!hasPrediction || status === 'running'}
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
                disabled={!hasPrediction || status === 'running'}
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

        {isActive && (
          <p style={{ marginTop: '1rem', marginBottom: 0, fontSize: '0.75rem', color: 'var(--text-muted)' }}>
            Cluster mass: {massLabel(mass)} solar masses &nbsp;|&nbsp; Ring radius:{' '}
            <strong>{result.ringArcseconds.toFixed(1)} arcseconds</strong>
            <br />
            Ring from visible matter alone: {result.visibleOnlyRingArcseconds.toFixed(1)} arcseconds
            &nbsp;|&nbsp; Observed ring: {result.observedRingArcseconds.toFixed(1)} arcseconds
            <br />
            Light bends by {result.bendingAngleArcseconds.toFixed(1)} arcseconds at the ring's edge. The ring for your chosen mass is{' '}
            {result.ringOverVisibleOnlyRing.toFixed(2)} times as wide as the visible-matter ring.
          </p>
        )}

        {hasSubmittedPrediction && (
          <>
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
            <text x={SKY_CENTER} y={SKY_CENTER - 16} fill="#e2e8f0" fontSize="10" textAnchor="middle" stroke="#0b1020" strokeWidth={3} paintOrder="stroke">
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
                // A big ring has room for its label just inside, at the lower left; a small ring's
                // label goes just below it, under the "Visible matter only" label.
                x={rings.chosen >= 70 ? SKY_CENTER - rings.chosen * 0.71 + 8 : SKY_CENTER}
                y={rings.chosen >= 70 ? SKY_CENTER + rings.chosen * 0.71 - 6 : SKY_CENTER + rings.chosen + 28}
                fill={CHOSEN_COLOR}
                fontSize="10"
                fontWeight="600"
                stroke="#0b1020"
                strokeWidth={3}
                paintOrder="stroke"
                textAnchor={rings.chosen >= 70 ? 'start' : 'middle'}
              >
                Ring for your chosen mass
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
            textAnchor={graphX(mass) > GRAPH_RIGHT - 60 ? 'end' : 'middle'}
            stroke="#0b1020"
            strokeWidth={3}
            paintOrder="stroke"
          >
            Your chosen mass
          </text>
        </svg>

        <div style={{ marginTop: '1rem', fontSize: '0.75rem', color: 'var(--text-muted)' }}>
          <p style={{ marginTop: 0, marginBottom: '0.5rem' }}>
            <strong>How to read these diagrams.</strong> A galaxy cluster sits almost exactly between us and a
            much more distant galaxy. The cluster's gravity bends the distant galaxy's light, so we see a ring
            of light around the cluster instead of a single dot. The three pictures show the same event in
            three ways: how the light travels, what we see on the sky, and how the ring depends on the
            cluster's mass. When you press Run, the light travels first, and then the ring appears.
          </p>

          <p style={{ marginTop: 0, marginBottom: '0.3rem' }}>
            <strong>Picture 1, the side view: how the light travels.</strong>
          </p>
          <ul style={{ margin: '0 0 0.6rem 0', paddingLeft: '1.1rem' }}>
            <li>
              <strong>Earth</strong> is on the left, the <strong>cluster (the lens)</strong> is in the middle,
              and the <strong>distant galaxy (the source)</strong> is on the right. The dashed line between
              them is the perfect line-up. They are placed in proportion to their real distances, but the
              picture is not to scale in other ways.
            </li>
            <li>
              When you press Run, two yellow dots leave the source and travel along the two{' '}
              <strong>light rays</strong>. One passes above the cluster and one below. Each is pulled toward
              the cluster by its gravity, so each changes direction at the cluster and then heads to Earth.
              Without the cluster, light from the source would travel straight and miss us.
            </li>
            <li>
              Why two rays? Light leaves the source in every direction, and light passing the cluster on
              <em> every</em> side gets bent toward us, not only above and below. The picture shows two as
              examples. All the rays, taken together, are what make a ring.
            </li>
            <li>
              <strong>The bend is drawn far larger than it really is</strong>, so you can see it. The real
              bend at the ring's edge is only about {result.bendingAngleArcseconds.toFixed(0)} arcseconds, a
              tiny fraction of a degree. The drawn bend still grows with the mass you choose, so a heavier
              cluster visibly bends the rays more.
            </li>
          </ul>

          <p style={{ marginTop: 0, marginBottom: '0.3rem' }}>
            <strong>Picture 2, the sky view: what we see.</strong>
          </p>
          <ul style={{ margin: '0 0 0.6rem 0', paddingLeft: '1.1rem' }}>
            <li>
              This is what we would see through a telescope pointed at the cluster. The source is exactly
              behind the cluster, so its light arrives from all directions around the cluster and forms a
              ring. The scale bar shows how big 20 arcseconds is on this picture.
            </li>
            <li>
              When the yellow dots reach Earth in the side view, the{' '}
              <strong style={{ color: CHOSEN_COLOR }}>solid gold ring</strong> grows outward until it reaches
              the size for the mass you chose. The growing is only to help you notice the ring: in reality the
              ring is there as soon as the light arrives, and the playback speed has no effect on its size.
            </li>
            <li>
              The <strong style={{ color: VISIBLE_COLOR }}>dashed blue ring</strong> is the ring that the
              cluster's visible matter alone (stars and hot gas) would make. It is drawn from the start, as a
              reference.
            </li>
            <li>
              The <strong style={{ color: OBSERVED_COLOR }}>dotted green ring</strong> is the ring actually
              seen for a real cluster (Abell 1689). Also a reference. Compare the green ring with the blue
              ring, and see where the ring for your chosen mass lands compared with them.
            </li>
            <li>
              If you choose the "visible plus dark matter" preset, the gold ring lies on top of the green one.
              If you choose "visible matter only", it lies on top of the blue one.
            </li>
          </ul>

          <p style={{ marginTop: 0, marginBottom: '0.3rem' }}>
            <strong>Picture 3, the graph: ring size for every mass.</strong>
          </p>
          <ul style={{ margin: 0, paddingLeft: '1.1rem' }}>
            <li>
              Across the bottom is the cluster's mass, in solar masses (one solar mass is the mass of our
              Sun). Up the side is the ring's radius in arcseconds (one arcsecond is a 3,600th of a degree).
              The purple curve shows the ring for every possible mass. It rises quickly and then flattens:
              four times the mass makes a ring only twice as wide.
            </li>
            <li>
              The <strong style={{ color: CHOSEN_COLOR }}>gold dot</strong> is the mass you chose, and it
              moves along the curve when you change the mass. The{' '}
              <strong style={{ color: VISIBLE_COLOR }}>blue dot</strong> is visible matter only. The{' '}
              <strong style={{ color: OBSERVED_COLOR }}>dotted green line</strong> is the observed ring. The
              graph does not move during playback, because it shows the result for all masses at once.
            </li>
            <li>
              To read the mass that the observed ring tells us, find where the purple curve crosses the green
              line, then look straight down to the mass axis.
            </li>
          </ul>
          <p style={{ marginTop: '0.6rem', marginBottom: 0 }}>
            The numbers in the live readout are exact. The colors, the exaggerated bending, and the growing
            ring are drawn to help you compare.
          </p>
        </div>

        {status === 'complete' && (
          <div
            style={{
              marginTop: '1.5rem',
              paddingTop: '1rem',
              borderTop: '1px solid var(--border-color, #ccc)',
            }}
          >
            <h3 style={{ marginTop: 0 }}>Results</h3>
            <p>
              You chose a cluster of <strong>{massLabel(mass)} solar masses</strong>. Its ring has a radius of{' '}
              <strong>{result.ringArcseconds.toFixed(1)} arcseconds</strong>. For comparison:
            </p>
            <div style={{ overflowX: 'auto', maxWidth: '100%' }}>
              <table style={{ fontSize: '0.875rem', borderCollapse: 'collapse', marginBottom: '1rem' }}>
                <tbody>
                  {[
                    [`The ring for your chosen mass (${massLabel(mass)} solar masses)`, result.ringArcseconds],
                    [
                      `The ring that visible matter alone would make (${massLabel(result.visibleOnlyMassSolarMasses)} solar masses)`,
                      result.visibleOnlyRingArcseconds,
                    ],
                    ['The observed ring of the real cluster (a given value)', result.observedRingArcseconds],
                  ].map(([label, arcseconds]) => (
                    <tr key={label as string}>
                      <td style={{ padding: '0.25rem 1rem 0.25rem 0' }}>{label}</td>
                      <td style={{ textAlign: 'right', padding: '0.25rem 0', whiteSpace: 'nowrap' }}>
                        {(arcseconds as number).toFixed(1)} arcseconds
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <p style={{ marginBottom: '0.5rem' }}>
              <strong>Checking your first prediction:</strong> asked whether more mass would make the ring
              larger, the same size, or smaller, you answered "
              {ringSizeChoices.find((c) => c.value === submittedRingSizePrediction)!.label}". More mass bends
              the light more strongly, so the light is pulled in from farther out and the ring is larger —{' '}
              {submittedRingSizePrediction === ACTUAL_RING_SIZE
                ? 'so your prediction was right.'
                : 'so your prediction was off this time.'}{' '}
              You can see it in the presets: the visible matter alone makes a ring of{' '}
              {result.visibleOnlyRingArcseconds.toFixed(1)} arcseconds, and the full observed mass makes{' '}
              {einsteinRingArcseconds(OBSERVED_TOTAL_MASS_SOLAR_MASSES).toFixed(1)}.
            </p>
            <p style={{ marginBottom: '0.5rem' }}>
              <strong>Checking your second prediction:</strong> asked how wide the ring would be with four times
              the mass, you answered "
              {fourTimesChoices.find((c) => c.value === submittedFourTimesPrediction)!.label}". For your
              chosen mass, the model gives a ring of {result.ringArcseconds.toFixed(1)} arcseconds, and four
              times that mass ({massLabel(4 * mass)} solar masses{4 * mass > MAX_LENS_MASS_SOLAR_MASSES ? ', more than the slider allows' : ''}) gives{' '}
              {einsteinRingArcseconds(4 * mass).toFixed(1)} arcseconds. That is exactly{' '}
              <strong>twice as wide</strong>, because the ring grows as the square root of the mass, and the
              square root of 4 is 2 —{' '}
              {submittedFourTimesPrediction === ACTUAL_FOUR_TIMES
                ? 'so your prediction was right.'
                : 'so your prediction was off this time.'}{' '}
              A familiar comparison: a square garden with four times the area is only twice as wide. The
              ring works the same way, with the cluster's mass playing the part of the garden's area and the
              ring's width the part of the garden's width. So each extra bit of mass buys a smaller gain in
              the ring.
            </p>
            <p style={{ marginBottom: '0.5rem' }}>
              <strong>A simple calculation.</strong> The real cluster's ring is{' '}
              {result.observedRingArcseconds.toFixed(0)} arcseconds. Run the formula backward and that ring
              needs about {massLabel(result.observedMassSolarMasses)} solar masses inside it. The visible matter
              (stars and hot gas) is only about {Math.round(VISIBLE_MASS_FRACTION * 100)}% of that, which is{' '}
              {massLabel(result.visibleOnlyMassSolarMasses)} solar masses, and it would make a ring of only{' '}
              {result.visibleOnlyRingArcseconds.toFixed(1)} arcseconds. The observed total is{' '}
              {(result.observedMassSolarMasses / result.visibleOnlyMassSolarMasses).toFixed(1)} times the visible
              mass, and the ring grows as the square root of the mass, so the ring should be about{' '}
              {Math.sqrt(result.observedMassSolarMasses / result.visibleOnlyMassSolarMasses).toFixed(1)} times as
              wide: {result.visibleOnlyRingArcseconds.toFixed(1)} ×{' '}
              {Math.sqrt(result.observedMassSolarMasses / result.visibleOnlyMassSolarMasses).toFixed(1)} ≈{' '}
              {result.observedRingArcseconds.toFixed(0)} arcseconds, which matches the observed ring.
            </p>
            <p style={{ marginBottom: '0.5rem' }}>
              <strong>In the real world.</strong> Real galaxy clusters make rings and bright arcs like these, and
              astronomers routinely use them to weigh clusters. The cluster Abell 1689 is a well-known example,
              and its ring is the one used here as the "observed" ring.
            </p>
            <p style={{ marginBottom: '0.5rem' }}>
              <strong>A second line of evidence for dark matter.</strong> In Experiment 4 you saw that galaxies
              spin too fast for their visible matter, which pointed to unseen mass. This experiment reaches the
              same conclusion a completely different way, with no star's speed measured at all: the light's
              bending says the cluster holds about {(result.observedMassSolarMasses / result.visibleOnlyMassSolarMasses).toFixed(1)}{' '}
              times more mass than we can see. Two independent methods agreeing is what makes the case strong.
              Lensing weighs the mass and shows where it is, but it does not say what the unseen mass is made
              of.
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
                <strong>What this model simplifies.</strong>
              </p>
              <ul style={{ margin: 0, paddingLeft: '1.25rem' }}>
                <li>
                  The cluster is treated as perfectly round, with the source exactly behind its center. Real
                  clusters are lumpy and rarely line up perfectly, so real rings are usually broken arcs.
                </li>
                <li>
                  The three distances ({LENS_DISTANCE_MPC} Mpc to the cluster, {SOURCE_DISTANCE_MPC} Mpc to the
                  source, and {LENS_TO_SOURCE_DISTANCE_MPC} Mpc between them) are fixed, rounded values for one
                  real situation.
                </li>
                <li>
                  The observed ring ({result.observedRingArcseconds.toFixed(0)} arcseconds) and the visible share
                  ({Math.round(VISIBLE_MASS_FRACTION * 100)}%) are given values, not worked out here. The{' '}
                  {Math.round(VISIBLE_MASS_FRACTION * 100)}% is an average for real clusters, applied here to the
                  mass inside the ring, which is approximate.
                </li>
              </ul>
            </div>
          </div>
        )}
          </>
        )}
      </div>

      {status === 'complete' && submittedRingSizePrediction && submittedFourTimesPrediction && (
        <GravitationalLensingTutor
          key={runCount}
          predictedRingSize={submittedRingSizePrediction}
          predictedFourTimes={submittedFourTimesPrediction}
          onExplained={onTutorComplete}
        />
      )}
    </div>
  )
}
