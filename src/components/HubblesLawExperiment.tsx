import { useEffect, useState } from 'react'
import {
  GALAXY_PRESETS,
  HUBBLE_CONSTANT_KM_PER_S_PER_MPC,
  HUBBLE_TENSION_RANGE_KM_PER_S_PER_MPC,
  MAX_CUSTOM_DISTANCE_MPC,
  runHubblesLawExperiment,
} from '../physics/hubblesLawExperiment'
import { HubblesLawTutor } from './HubblesLawTutor'

interface HubblesLawExperimentProps {
  onComplete?: () => void
  onTutorComplete?: () => void
}

const VIEW_WIDTH = 420
const VIEW_HEIGHT = 220
const EARTH_X = 360
const EARTH_Y = 140
const GALAXY_MIN_X = 50
const GALAXY_MAX_X = 300
const MIN_CUSTOM_DISTANCE_MPC = 1

type DistanceMode = 'virgo' | 'coma' | 'far' | 'custom'

// Fixed real-world playback duration, independent of distance (CLAUDE.md §11).
const ANIMATION_DURATION_MS = 3000

// Display-only exaggeration (CLAUDE.md §11): the real stretching (at most a few percent across
// this experiment's whole distance range) would be imperceptible as a color change. The redshift
// is instead mapped onto the full white-to-red range relative to this reference value, which is
// comfortably above the largest redshift this experiment's controls can produce, so "farther =
// more stretched" stays visible and monotonic without ever clipping. The exact, un-exaggerated z
// value is always shown in the live readout alongside it.
const VISUAL_REFERENCE_REDSHIFT = 0.05

// Shared by the color and the wave's own geometry below, so both are exaggerated in lockstep -
// a redshift at the reference value always means "fully red AND fully widened," never one without
// the other.
function visualFraction(z: number): number {
  return Math.max(0, Math.min(1, z / VISUAL_REFERENCE_REDSHIFT))
}

function colorForRedshift(z: number): string {
  const fraction = visualFraction(z)
  // Interpolates from a pale blue-white (unshifted) to a saturated red (fully "stretched" on this
  // display scale).
  const r = Math.round(230 + fraction * (239 - 230))
  const g = Math.round(240 - fraction * (240 - 68))
  const b = Math.round(255 - fraction * (255 - 68))
  return `rgb(${r}, ${g}, ${b})`
}

const WAVE_BASE_WAVELENGTH_PX = 20
const WAVE_AMPLITUDE_PX = 10
// Display-only exaggeration (CLAUDE.md §11), matching VISUAL_REFERENCE_REDSHIFT: the real
// wavelength stretch at these distances (at most a few percent) would widen the drawn wave by less
// than a pixel - invisible. At the same reference redshift used to fully redden the color, the wave
// instead widens to this many times its starting wavelength, so the widening is as visible as the
// color change. The exact, un-exaggerated stretch factor is always shown in the live readout.
const VISUAL_MAX_WAVELENGTH_STRETCH = 3

// Draws the light as an actual traveling wave rather than a single dot, so the stretching is
// visible as a shape, matching this project's established pattern (e.g. Gravitational Waves
// Experiment 5's wave-trace strips). A point currently at fraction `u` of the way from the galaxy
// to Earth has, at constant propagation speed, been in transit for exactly fraction `u` of the
// whole trip - so it has accumulated fraction `u` of the trip's full redshift so far (the same
// linear-in-progress model already used for the pulse's own color, CLAUDE.md §9/§11). Sampling the
// wave's local wavelength as a function of position (not just time) turns that into a single
// continuous chirp shape: tightly spaced, pale cycles near the galaxy, widening and reddening
// toward the leading edge as it nears Earth.
function waveTrailPoints(galaxyX: number, earthX: number, frontX: number, y: number, totalRedshift: number): string {
  const totalDistance = earthX - galaxyX
  if (totalDistance <= 0 || frontX <= galaxyX) return ''

  const samples = 120
  let phase = 0
  let prevX = galaxyX
  const points: string[] = []

  for (let i = 0; i <= samples; i++) {
    const x = galaxyX + (i / samples) * (frontX - galaxyX)
    const u = (x - galaxyX) / totalDistance
    const localFraction = visualFraction(u * totalRedshift)
    const localWavelengthPx = WAVE_BASE_WAVELENGTH_PX * (1 + localFraction * (VISUAL_MAX_WAVELENGTH_STRETCH - 1))
    const dx = x - prevX
    phase += (2 * Math.PI * dx) / localWavelengthPx
    const yOffset = WAVE_AMPLITUDE_PX * Math.sin(phase)
    points.push(`${x.toFixed(2)},${(y + yOffset).toFixed(2)}`)
    prevX = x
  }

  return points.join(' ')
}

// This experiment's two prediction questions, per its specification's "Prediction Activity".
type SpeedChoice = 'twice' | 'same' | 'half'
const speedChoices: Array<{ value: SpeedChoice; label: string }> = [
  { value: 'twice', label: 'Twice as fast' },
  { value: 'same', label: 'The same' },
  { value: 'half', label: 'Half as fast' },
]

type RedshiftChoice = 'nearer' | 'farther' | 'same'
const redshiftChoices: Array<{ value: RedshiftChoice; label: string }> = [
  { value: 'nearer', label: 'The nearer one' },
  { value: 'farther', label: 'The farther one' },
  { value: 'same', label: 'No difference' },
]

// Guaranteed by Hubble's Law itself (recessionSpeedKmPerS and cosmologicalRedshift are both
// exactly proportional to distance - see hubblesLawExperiment.test.ts) - not dependent on the
// learner's chosen galaxy.
const ACTUAL_SPEED: SpeedChoice = 'twice'
const ACTUAL_REDSHIFT: RedshiftChoice = 'farther'

export function HubblesLawExperiment({ onComplete, onTutorComplete }: HubblesLawExperimentProps) {
  const [distanceMode, setDistanceMode] = useState<DistanceMode>('virgo')
  const [customDistanceMpc, setCustomDistanceMpc] = useState(50)
  const [status, setStatus] = useState<'idle' | 'running' | 'complete'>('idle')
  const [progress, setProgress] = useState(0)
  const [runCount, setRunCount] = useState(0)

  const [speedPrediction, setSpeedPrediction] = useState<SpeedChoice | null>(null)
  const [redshiftPrediction, setRedshiftPrediction] = useState<RedshiftChoice | null>(null)
  const [submittedSpeedPrediction, setSubmittedSpeedPrediction] = useState<SpeedChoice | null>(null)
  const [submittedRedshiftPrediction, setSubmittedRedshiftPrediction] = useState<RedshiftChoice | null>(null)

  const hasPrediction = speedPrediction !== null && redshiftPrediction !== null
  const hasSubmittedPrediction = submittedSpeedPrediction !== null && submittedRedshiftPrediction !== null

  const distanceMpc =
    distanceMode === 'virgo'
      ? GALAXY_PRESETS[0].distanceMpc
      : distanceMode === 'coma'
        ? GALAXY_PRESETS[1].distanceMpc
        : distanceMode === 'far'
          ? GALAXY_PRESETS[2].distanceMpc
          : customDistanceMpc

  const result = runHubblesLawExperiment(distanceMpc)
  const isActive = status === 'running' || status === 'complete'

  const handleModeChange = (mode: DistanceMode) => {
    setDistanceMode(mode)
    if (status === 'complete') setStatus('idle')
  }

  const handleRun = () => {
    if (!hasPrediction || status === 'running') return
    if (!hasSubmittedPrediction) {
      setSubmittedSpeedPrediction(speedPrediction)
      setSubmittedRedshiftPrediction(redshiftPrediction)
    }
    setStatus('running')
    setProgress(0)
    setRunCount((count) => count + 1)
  }

  // Matches the rest of the project's own precedent: re-opens both questions for editing
  // without resetting the chosen galaxy.
  const handleChangePrediction = () => {
    setSubmittedSpeedPrediction(null)
    setSubmittedRedshiftPrediction(null)
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

  const galaxyX = Math.max(
    GALAXY_MIN_X,
    GALAXY_MAX_X - (distanceMpc / MAX_CUSTOM_DISTANCE_MPC) * (GALAXY_MAX_X - GALAXY_MIN_X)
  )

  const displayedProgress = status === 'idle' ? 0 : progress
  const pulseX = galaxyX + displayedProgress * (EARTH_X - galaxyX)
  // The light's color shifts gradually as it travels - the whole point being that the stretching
  // happens during the journey (space expanding en route), not already present when the light left
  // the galaxy (CLAUDE.md §9, this experiment's specification "Learner Controls").
  const pulseRedshift = displayedProgress * result.redshift
  const pulseColor = colorForRedshift(pulseRedshift)
  const galaxyColor = colorForRedshift(0)
  const earthGlowColor = isActive ? colorForRedshift(result.redshift) : '#334155'
  const wavePoints = isActive ? waveTrailPoints(galaxyX, EARTH_X, pulseX, EARTH_Y, result.redshift) : ''

  return (
    <div style={{ padding: '2rem', maxWidth: '900px', margin: '0 auto' }}>
      <h2>Experiment 1 — Hubble's Law</h2>

      <div className="exp-card" style={{ marginTop: '2rem', padding: '1.5rem' }}>
        <div style={{ marginBottom: '2rem', fontSize: '0.875rem', color: 'var(--text-muted)' }}>
          <p style={{ marginTop: 0, marginBottom: '0.75rem' }}>
            <strong>The question.</strong> Does a galaxy's distance affect how fast it appears to be
            moving away from us — and can we tell, just from its light, which galaxies are farther?
          </p>
          <p style={{ marginTop: 0, marginBottom: '0.75rem' }}>
            <strong>What happens.</strong> Essentially every distant galaxy's light is{' '}
            <strong>redshifted</strong> — stretched toward the red end of the spectrum, the same
            idea already seen for a gravitational wave's frequency (Gravitational Waves Experiment
            5). The farther away a galaxy is, the more its light is stretched. This pattern is
            called <strong>Hubble's Law</strong>, and the rate things stretch with distance is
            called the <strong>Hubble constant</strong>, already named in Gravitational Waves
            Experiment 7 as something a standard siren can help measure. Studying this pattern —
            and what it implies about the universe as a whole — is called <strong>cosmology</strong>
            .
          </p>
          <p style={{ marginTop: 0, marginBottom: '0.75rem' }}>
            <strong>Your job.</strong> First, predict how a galaxy twice as far away compares in
            recession speed to a nearer one. Then predict which galaxy's light looks more
            redshifted — the nearer one or the farther one.
          </p>
          <p style={{ marginTop: 0, marginBottom: '0.75rem' }}>
            <strong>What to look for.</strong> Pick a galaxy below, run it, and watch the light's
            color as it travels from the galaxy to Earth. Try the nearest and farthest galaxies and
            compare how much the color shifts.
          </p>
          <p style={{ marginTop: 0, marginBottom: '0.25rem' }}>
            <strong>What we assume.</strong>
          </p>
          <ul style={{ marginTop: 0, marginBottom: 0, paddingLeft: '1.25rem' }}>
            <li>
              The redshift shown here comes from <strong>space itself expanding</strong> while the
              light travels — not from a galaxy physically moving through space, the way
              Gravitational Waves Experiment 5's source did (that kind of motion-caused stretching
              is called the <strong>Doppler effect</strong>). These are genuinely different causes,
              even though they can produce similar-looking numbers for nearby galaxies.
            </li>
            <li>
              The exact relationship used here (<code>z ≈ H0 × d / c</code>) is only accurate for
              relatively nearby galaxies. At much larger distances, the real relationship between
              distance and redshift is more complicated — not covered here.
            </li>
            <li>
              The Hubble constant is treated as a single fixed value (70 km/s per megaparsec,
              i.e. per about 3.3 million light-years). Its real, precisely measured value is still
              debated among astronomers — published values range from about 67 to 73 km/s/Mpc, a
              disagreement known as the "Hubble tension."
            </li>
            <li>
              Only galaxies whose light is redshifted (moving away) are shown here. A small number
              of genuinely nearby galaxies are actually moving toward us due to local gravity — not
              modeled in this experiment.
            </li>
            <li>
              The galaxies themselves are not physically simulated — no orbits, structure, or
              individual physics. Each is simply a labeled distance and the redshift Hubble's Law
              implies for it.
            </li>
          </ul>
        </div>

        <div style={{ marginBottom: '1.5rem' }}>
          <p style={{ fontSize: '0.875rem', marginBottom: '0.75rem' }}>
            If Galaxy A is twice as far away as Galaxy B, how do you think Galaxy A's recession
            speed compares to Galaxy B's?
          </p>
          <div style={{ marginBottom: '0.5rem' }}>
            {speedChoices.map((choice) => (
              <button
                key={choice.value}
                onClick={() => setSpeedPrediction(choice.value)}
                disabled={hasSubmittedPrediction}
                className={`toggle-button${speedPrediction === choice.value ? ' is-selected' : ''}`}
                style={{ marginRight: '0.5rem', marginBottom: '0.5rem' }}
              >
                {choice.label}
              </button>
            ))}
          </div>

          <p style={{ fontSize: '0.875rem', marginBottom: '0.75rem' }}>
            Which galaxy's light do you think will look more shifted toward red — the nearer one or
            the farther one?
          </p>
          <div style={{ marginBottom: '0.5rem' }}>
            {redshiftChoices.map((choice) => (
              <button
                key={choice.value}
                onClick={() => setRedshiftPrediction(choice.value)}
                disabled={hasSubmittedPrediction}
                className={`toggle-button${redshiftPrediction === choice.value ? ' is-selected' : ''}`}
                style={{ marginRight: '0.5rem', marginBottom: '0.5rem' }}
              >
                {choice.label}
              </button>
            ))}
          </div>

          <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
            {hasPrediction || hasSubmittedPrediction
              ? `Your predictions: ${
                  speedChoices.find((c) => c.value === (speedPrediction ?? submittedSpeedPrediction))!.label
                }, ${
                  redshiftChoices.find((c) => c.value === (redshiftPrediction ?? submittedRedshiftPrediction))!
                    .label
                }`
              : 'Answer both questions to continue'}
          </p>
        </div>

        {hasSubmittedPrediction && (
          <div style={{ marginTop: '-0.5rem', marginBottom: '1rem' }}>
            <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '0.5rem' }}>
              Your predictions are locked in above. You can still try as many different galaxies as
              you like below. Or, change your predictions and start over:
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
          <p style={{ fontSize: '0.875rem', marginBottom: '0.5rem' }}>Galaxy:</p>
          {GALAXY_PRESETS.slice(0, 2).map((preset, index) => (
            <button
              key={preset.label}
              type="button"
              onClick={() => handleModeChange(index === 0 ? 'virgo' : 'coma')}
              disabled={!hasPrediction || status === 'running'}
              className={`toggle-button${
                distanceMode === (index === 0 ? 'virgo' : 'coma') ? ' is-selected' : ''
              }`}
              style={{ marginRight: '0.5rem', marginBottom: '0.5rem' }}
            >
              {preset.label} ({preset.distanceMpc} Mpc)
            </button>
          ))}
          <button
            type="button"
            onClick={() => handleModeChange('far')}
            disabled={!hasPrediction || status === 'running'}
            className={`toggle-button${distanceMode === 'far' ? ' is-selected' : ''}`}
            style={{ marginRight: '0.5rem', marginBottom: '0.5rem' }}
          >
            {GALAXY_PRESETS[2].label} ({GALAXY_PRESETS[2].distanceMpc} Mpc)
          </button>
          <button
            type="button"
            onClick={() => handleModeChange('custom')}
            disabled={!hasPrediction || status === 'running'}
            className={`toggle-button${distanceMode === 'custom' ? ' is-selected' : ''}`}
            style={{ marginRight: '0.5rem', marginBottom: '0.5rem' }}
          >
            Custom
          </button>
          {distanceMode === 'custom' && (
            <div style={{ marginTop: '0.5rem' }}>
              <label htmlFor="hubbles-law-distance" style={{ display: 'block', marginBottom: '0.5rem' }}>
                Distance: {customDistanceMpc} Mpc
              </label>
              <input
                id="hubbles-law-distance"
                type="range"
                min={MIN_CUSTOM_DISTANCE_MPC}
                max={MAX_CUSTOM_DISTANCE_MPC}
                step={1}
                value={customDistanceMpc}
                disabled={!hasPrediction || status === 'running'}
                onChange={(event) => {
                  setCustomDistanceMpc(Number(event.target.value))
                  if (status === 'complete') setStatus('idle')
                }}
                style={{ width: '100%' }}
              />
            </div>
          )}
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
            Distance: {distanceMpc} Mpc &nbsp;|&nbsp; Recession speed: {result.recessionSpeedKmPerS.toFixed(0)} km/s
            <br />
            Redshift (z): {result.redshift.toFixed(4)} &nbsp;|&nbsp; Wavelength stretch factor:{' '}
            {result.wavelengthStretchFactor.toFixed(4)}×
          </p>
        )}

        <svg
          width={VIEW_WIDTH}
          height={VIEW_HEIGHT}
          viewBox={`0 0 ${VIEW_WIDTH} ${VIEW_HEIGHT}`}
          style={{
            marginTop: '1rem',
            display: 'block',
            border: '1px solid var(--border-color, #ccc)',
            borderRadius: '8px',
            overflow: 'hidden',
            backgroundColor: '#0b1020',
          }}
        >
          <defs>
            <linearGradient
              id="hubble-wave-gradient"
              gradientUnits="userSpaceOnUse"
              x1={galaxyX}
              y1={EARTH_Y}
              x2={pulseX}
              y2={EARTH_Y}
            >
              <stop offset="0%" stopColor={galaxyColor} />
              <stop offset="100%" stopColor={pulseColor} />
            </linearGradient>
          </defs>

          {/* The galaxy (source) */}
          <circle cx={galaxyX} cy={EARTH_Y} r={14} fill={galaxyColor} />
          <text x={galaxyX} y={EARTH_Y - 24} fill="#e2e8f0" fontSize="11" textAnchor="middle">
            the galaxy
          </text>

          {/* Earth (the detector) */}
          <circle cx={EARTH_X} cy={EARTH_Y} r={14} fill="#38bdf8" />
          <circle cx={EARTH_X} cy={EARTH_Y} r={20} fill="none" stroke={earthGlowColor} strokeWidth={2} opacity={0.6} />
          <text x={EARTH_X} y={EARTH_Y - 30} fill="#e2e8f0" fontSize="11" textAnchor="middle">
            Earth (detector)
          </text>

          {/* The light's path */}
          <line x1={galaxyX} y1={EARTH_Y} x2={EARTH_X} y2={EARTH_Y} stroke="#334155" strokeWidth={1} strokeDasharray="4 4" />

          {/* The traveling light wave: tight, pale cycles near the galaxy, widening and reddening
              toward its leading edge as it nears Earth - the stretching happens in transit. */}
          {isActive && wavePoints && (
            <polyline
              points={wavePoints}
              fill="none"
              stroke="url(#hubble-wave-gradient)"
              strokeWidth={2}
              strokeLinecap="round"
            />
          )}
          {isActive && <circle cx={pulseX} cy={EARTH_Y} r={5} fill={pulseColor} />}
        </svg>

        {hasSubmittedPrediction && (
          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.5rem' }}>
            <p style={{ marginTop: 0, marginBottom: '0.4rem' }}>
              <strong>How to read this diagram.</strong> <strong>The galaxy</strong> is the light
              source, positioned left-to-right by its chosen distance — farther galaxies are drawn
              farther from Earth. <strong>Earth (detector)</strong> is where the light is observed.
            </p>
            <ul style={{ margin: 0, paddingLeft: '1.1rem' }}>
              <li>
                The wavy line is the light's own wave, trailing behind its leading edge (the small
                dot) as it travels from the galaxy to Earth. Watch the spacing between its peaks:
                it starts tight and pale right at the galaxy, then visibly widens and reddens
                toward the leading edge — showing that the stretching builds up continuously
                during the journey (space expanding in transit), not already present when the
                light left the galaxy.
              </li>
              <li>
                A farther galaxy's light visibly reaches a deeper red, and a wider spacing between
                its peaks, by the time it arrives than a nearer galaxy's does — compare the ring
                around Earth after running the nearest and farthest galaxies. The color and
                wavelength-widening are both exaggerated for visibility (the real stretching at
                these distances is only a few percent); the exact, un-exaggerated numbers are
                always shown above.
              </li>
            </ul>
          </div>
        )}

        {status === 'complete' && submittedSpeedPrediction && submittedRedshiftPrediction && (
          <div style={{ marginTop: '1.5rem', paddingTop: '1rem', borderTop: '1px solid var(--border-color, #ccc)' }}>
            <h3 style={{ marginTop: 0 }}>Results</h3>
            <p>
              At a distance of <strong>{distanceMpc} Mpc</strong>, Hubble's Law gives a recession
              speed of <strong>{result.recessionSpeedKmPerS.toFixed(0)} km/s</strong>. The
              resulting redshift is <strong>z = {result.redshift.toFixed(4)}</strong> — the
              light's wavelength arrives stretched by a factor of{' '}
              <strong>{result.wavelengthStretchFactor.toFixed(4)}×</strong>.
            </p>
            <p style={{ marginBottom: '0.5rem' }}>
              <strong>Checking your first prediction:</strong> you guessed a galaxy twice as far
              away would recede{' '}
              {speedChoices.find((c) => c.value === submittedSpeedPrediction)!.label.toLowerCase()}.
              Hubble's Law makes recession speed exactly proportional to distance, so doubling the
              distance always exactly doubles the speed —{' '}
              {submittedSpeedPrediction === ACTUAL_SPEED
                ? 'so your prediction was right.'
                : 'so your prediction was off this time.'}
            </p>
            <p>
              <strong>Checking your second prediction:</strong> you guessed{' '}
              {redshiftChoices.find((c) => c.value === submittedRedshiftPrediction)!.label.toLowerCase()}{' '}
              would look more redshifted. Since redshift is also exactly proportional to distance,
              the farther galaxy's light is always more redshifted than the nearer one's —{' '}
              {submittedRedshiftPrediction === ACTUAL_REDSHIFT
                ? 'so your prediction was right.'
                : 'so your prediction was off this time.'}
            </p>
            <p style={{ marginBottom: '0.5rem' }}>
              This redshift comes from <strong>space itself expanding</strong> while the light
              travels — not from the galaxy physically moving through space (a Doppler effect, the
              mechanism behind Gravitational Waves Experiment 5's stretching). The formula used here
              (<code>z ≈ H0 × d / c</code>) is only accurate for relatively nearby galaxies like
              these; at much larger distances the real relationship is more complicated.
            </p>
            <p style={{ marginBottom: '0.5rem' }}>
              This experiment used a Hubble constant of{' '}
              <strong>{HUBBLE_CONSTANT_KM_PER_S_PER_MPC} km/s/Mpc</strong>.
            </p>
            <div
              style={{
                marginTop: '0.75rem',
                marginBottom: '0.75rem',
                padding: '0.9rem 1rem',
                borderRadius: '8px',
                border: '1px solid #d97706',
                backgroundColor: 'rgba(217, 119, 6, 0.1)',
              }}
            >
              <p style={{ margin: 0, fontWeight: 600, color: '#b45309' }}>
                Important: the real Hubble constant's exact value is still debated.
              </p>
              <p style={{ margin: '0.4rem 0 0 0', fontSize: '0.875rem' }}>
                Published measurements range from about {HUBBLE_TENSION_RANGE_KM_PER_S_PER_MPC[0]}{' '}
                to {HUBBLE_TENSION_RANGE_KM_PER_S_PER_MPC[1]} km/s/Mpc depending on the method used —
                a real, unresolved disagreement among astronomers known as the "Hubble tension."
                This experiment's single illustrative value is not a claim that the debate is
                settled.
              </p>
            </div>
          </div>
        )}
      </div>

      {status === 'complete' && submittedSpeedPrediction && submittedRedshiftPrediction && (
        <HubblesLawTutor
          key={runCount}
          predictedSpeed={submittedSpeedPrediction}
          predictedRedshift={submittedRedshiftPrediction}
          onExplained={onTutorComplete}
        />
      )}
    </div>
  )
}
