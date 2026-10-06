import { useEffect, useState } from 'react'
import { CosmicMicrowaveBackgroundTutor } from './CosmicMicrowaveBackgroundTutor'
import {
  CMB_TEMPERATURE_TODAY_KELVIN,
  RECOMBINATION_REDSHIFT,
  RECOMBINATION_YEARS_AFTER_BIG_BANG,
  cmbTemperatureKelvin,
  runCmbExperiment,
} from '../physics/cosmicMicrowaveBackgroundExperiment'

interface CosmicMicrowaveBackgroundExperimentProps {
  onComplete?: () => void
  onTutorComplete?: () => void
}

const VIEW_WIDTH = 460
const VIEW_HEIGHT = 330
// Before predictions are locked in, only the top panel is drawn: the sky view would show the answer
// to the second prediction question before the learner has made it (CLAUDE.md §12).
const TOP_PANEL_HEIGHT = 165
// Recombination is drawn on the left and Today on the right, so time (and the light's journey)
// runs left to right.
const BAR_LEFT_X = 50
const BAR_RIGHT_X = 410
const BAR_Y = 95
const BAR_HEIGHT = 22

type RedshiftMode = 'today' | 'recombination' | 'custom'

// This experiment's two prediction questions, per its specification's "Prediction Activity".
// Choices are not scored.
type TemperatureChoice = 'higher' | 'lower' | 'same'
const temperatureChoices: Array<{ value: TemperatureChoice; label: string }> = [
  { value: 'higher', label: 'Higher' },
  { value: 'lower', label: 'Lower' },
  { value: 'same', label: 'The same' },
]

type SkyChoice = 'uniform' | 'varies'
const skyChoices: Array<{ value: SkyChoice; label: string }> = [
  { value: 'uniform', label: 'About the same' },
  { value: 'varies', label: 'Varies a lot' },
]

// Guaranteed by the model itself (cmbTemperatureKelvin is strictly increasing in z) and by what the
// real sky shows - not dependent on the learner's chosen moment.
const ACTUAL_TEMPERATURE: TemperatureChoice = 'higher'
const ACTUAL_SKY: SkyChoice = 'uniform'

// Fixed real-world playback duration (CLAUDE.md §11): playback speed never changes the result.
const ANIMATION_DURATION_MS = 3000

// Display-only color mapping (CLAUDE.md §11): from deep microwave violet (cold, today) to a hot
// white-orange (near recombination), linear in the fraction of the way back to recombination. The
// exact temperature is always shown in the live readout.
const COLD_RGB = [76, 29, 149]
const HOT_RGB = [255, 214, 153]

function colorForRedshift(z: number): string {
  const f = Math.max(0, Math.min(1, z / RECOMBINATION_REDSHIFT))
  const [r, g, b] = COLD_RGB.map((cold, i) => Math.round(cold + f * (HOT_RGB[i] - cold)))
  return `rgb(${r}, ${g}, ${b})`
}

function xForRedshift(z: number): number {
  const f = Math.max(0, Math.min(1, z / RECOMBINATION_REDSHIFT))
  return BAR_RIGHT_X - f * (BAR_RIGHT_X - BAR_LEFT_X)
}

// Illustrative directions in the sky panel: each a (x, y) spot plus a tiny, fixed color offset so
// the spots are "almost" but not perfectly identical. Not a real measurement (see the
// specification's simplifying assumptions).
const SKY_DIRECTIONS: Array<{
  x: number
  y: number
  dr: number
  dg: number
  db: number
}> = [
  { x: 80, y: 0, dr: 0, dg: 0, db: 0 },
  { x: 170, y: 0, dr: 1, dg: 0, db: -1 },
  { x: 260, y: 0, dr: -1, dg: 1, db: 0 },
  { x: 350, y: 0, dr: 0, dg: -1, db: 1 },
  { x: 125, y: 40, dr: 1, dg: 1, db: 0 },
  { x: 215, y: 40, dr: -1, dg: 0, db: 1 },
  { x: 305, y: 40, dr: 0, dg: 1, db: -1 },
]

function skyColor(dr: number, dg: number, db: number): string {
  const [r, g, b] = COLD_RGB
  return `rgb(${r + dr}, ${g + dg}, ${b + db})`
}

function formatKelvin(kelvin: number): string {
  return kelvin.toFixed(kelvin < 100 ? 3 : 0)
}

export function CosmicMicrowaveBackgroundExperiment({
  onComplete,
  onTutorComplete,
}: CosmicMicrowaveBackgroundExperimentProps) {
  const [mode, setMode] = useState<RedshiftMode>('recombination')
  const [customRedshift, setCustomRedshift] = useState(500)
  const [status, setStatus] = useState<'idle' | 'running' | 'complete'>('idle')
  const [progress, setProgress] = useState(0)
  const [runCount, setRunCount] = useState(0)

  const [temperaturePrediction, setTemperaturePrediction] = useState<TemperatureChoice | null>(null)
  const [skyPrediction, setSkyPrediction] = useState<SkyChoice | null>(null)
  const [submittedTemperaturePrediction, setSubmittedTemperaturePrediction] =
    useState<TemperatureChoice | null>(null)
  const [submittedSkyPrediction, setSubmittedSkyPrediction] = useState<SkyChoice | null>(null)

  const hasPrediction = temperaturePrediction !== null && skyPrediction !== null
  const hasSubmittedPrediction = submittedTemperaturePrediction !== null && submittedSkyPrediction !== null

  const redshift = mode === 'today' ? 0 : mode === 'recombination' ? RECOMBINATION_REDSHIFT : customRedshift
  const result = runCmbExperiment(redshift)
  const isActive = status === 'running' || status === 'complete'

  const handleModeChange = (next: RedshiftMode) => {
    setMode(next)
    if (status === 'complete') setStatus('idle')
  }

  const handleRun = () => {
    if (!hasPrediction || status === 'running') return
    if (!hasSubmittedPrediction) {
      setSubmittedTemperaturePrediction(temperaturePrediction)
      setSubmittedSkyPrediction(skyPrediction)
    }
    setStatus('running')
    setProgress(0)
    setRunCount((count) => count + 1)
  }

  // Matches the rest of the project's precedent: re-opens both questions for editing without
  // resetting the chosen moment.
  const handleChangePrediction = () => {
    setSubmittedTemperaturePrediction(null)
    setSubmittedSkyPrediction(null)
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

  // The marker travels from "Today" back to the chosen redshift as the run plays.
  const displayedRedshift = status === 'idle' ? 0 : progress * redshift
  const displayedTemperature = runCmbExperiment(displayedRedshift).temperatureKelvin
  const markerX = xForRedshift(displayedRedshift)
  const markerColor = colorForRedshift(displayedRedshift)
  const todayColor = colorForRedshift(0)

  return (
    <div style={{ padding: '2rem', maxWidth: '900px', margin: '0 auto' }}>
      <h2>Experiment 3 — The Cosmic Microwave Background</h2>

      <div className="exp-card" style={{ marginTop: '2rem', padding: '1.5rem' }}>
        <div
          style={{
            marginBottom: '2rem',
            fontSize: '0.875rem',
            color: 'var(--text-muted)',
          }}
        >
          <p style={{ marginTop: 0, marginBottom: '0.75rem' }}>
            <strong>The question.</strong> What is the oldest light we can still see, and what can it tell us
            about the early universe?
          </p>
          <p style={{ marginTop: 0, marginBottom: '0.75rem' }}>
            <strong>What happens.</strong> In the first few hundred thousand years after the Big Bang,
            electrons and protons could not stay joined together as atoms. They roamed free, and light kept
            bouncing off the free electrons, like a car headlight in thick fog. About{' '}
            {RECOMBINATION_YEARS_AFTER_BIG_BANG.toLocaleString()} years in, conditions had changed enough for
            electrons and protons to join into atoms. The fog cleared, and light could finally travel in
            straight lines. That moment is called <strong>recombination</strong>. The very first light
            released then is still reaching us today, from every direction in the sky. It has been stretched
            by the expanding universe for so long that it is no longer visible light but{' '}
            <strong>microwaves</strong>, so we call it the <strong>Cosmic Microwave Background</strong> (CMB).
          </p>
          <p style={{ marginTop: 0, marginBottom: '0.75rem' }}>
            <strong>A daily-life picture.</strong> Think of fog lifting on a morning drive. While the fog is
            thick, you can only see a few meters; once it clears, you can see the whole road, and light from
            far away reaches your eyes. Recombination was the universe's fog lifting.
          </p>
          <p style={{ marginTop: 0, marginBottom: '0.75rem' }}>
            <strong>Where this shows up in everyday life.</strong> The CMB is not something you can see or
            feel. Our eyes only see visible light, and microwaves are invisible to us. Still, it is all around
            you right now: roughly 400 of these ancient light particles are passing through every cubic
            centimeter of space around you, coming from all directions. It is also very weak. Although the
            word "microwave" may remind you of a kitchen microwave oven, the CMB is far too faint to warm
            anything. In 1965, two radio engineers, Arno Penzias and Robert Wilson, found it by accident as a
            faint hiss in a large antenna that they could not get rid of, however carefully they cleaned it.
            Before cable and digital TV, a small part of the static "snow" on an old TV tuned between channels
            was also this ancient light.
          </p>
          <p style={{ marginTop: 0, marginBottom: '0.75rem' }}>
            <strong>Why it matters.</strong> The CMB does not change your day, but it changes what we know. It
            is the oldest light we can ever observe, so studying it is like finding a photo of the universe as
            a newborn. It is real, measurable evidence about how the universe began, not only an idea on
            paper.
          </p>
          <p style={{ marginTop: 0, marginBottom: '0.75rem' }}>
            <strong>Temperature of light.</strong> Glowing things give off light whose color depends on how
            hot they are: a stove element glows dull red, then orange, then white-hot as it heats up. In the
            same way, the light of the background has a temperature, which tells us what its color is. Here,
            "temperature" means the temperature that glow corresponds to. Temperatures here are given in{' '}
            <strong>kelvin (K)</strong>, a scale that starts at 0 K, the coldest possible, with room
            temperature at about 293 K. You already know the idea of <strong>redshift</strong> from Hubble's
            Law (Experiment 1): light whose wavelength is stretched on its way to us. It is written{' '}
            <strong>z</strong>, so "z = 0" means no stretching, and larger z means more stretching.
          </p>
          <p style={{ marginTop: 0, marginBottom: '0.75rem' }}>
            <strong>Your job.</strong> First, predict how the background's temperature at recombination
            compares with today's. Then predict whether the background looks about the same in every direction
            of the sky or varies a lot.
          </p>
          <p style={{ marginTop: 0, marginBottom: '0.75rem' }}>
            <strong>What to look for.</strong> After answering, choose a moment in cosmic history below and
            run it. Watch the marker and its color as you move between recombination and today, and compare it
            with the view of the sky.
          </p>
          <p style={{ marginTop: 0, marginBottom: '0.25rem' }}>
            <strong>What we assume.</strong>
          </p>
          <ul style={{ marginTop: 0, marginBottom: 0, paddingLeft: '1.25rem' }}>
            <li>
              The relationship between redshift and temperature used here is exact at any redshift, unlike the
              approximation used for nearby galaxies in Experiment 1, which only works for small redshifts.
              This experiment therefore does not reuse that approximation.
            </li>
            <li>
              The redshift of recombination (z ≈ {RECOMBINATION_REDSHIFT}) is a real, carefully measured value
              (from the Planck satellite). It is given, not derived here.
            </li>
            <li>
              The physics of recombination itself (the hot gas of electrons and protons, and how light
              scatters off it) is not simulated. Recombination is only the turning point where light could
              finally travel freely.
            </li>
            <li>
              The sky view is illustrative, not a real measurement. It shows a few directions to make the
              pattern visible, and leaves out the real, tiny variations (about 1 part in 100,000) between
              directions.
            </li>
            <li>
              Nothing here is about how galaxies formed. The tiny variations just mentioned are a later topic.
            </li>
          </ul>
        </div>

        <div style={{ marginBottom: '1.5rem' }}>
          <p style={{ fontSize: '0.875rem', marginBottom: '0.75rem' }}>
            As you go back in time toward recombination, do you think the background temperature was higher,
            lower, or the same as it is today?
          </p>
          <div style={{ marginBottom: '0.5rem' }}>
            {temperatureChoices.map((choice) => (
              <button
                key={choice.value}
                onClick={() => setTemperaturePrediction(choice.value)}
                disabled={hasSubmittedPrediction}
                className={`toggle-button${temperaturePrediction === choice.value ? ' is-selected' : ''}`}
                style={{ marginRight: '0.5rem', marginBottom: '0.5rem' }}
              >
                {choice.label}
              </button>
            ))}
          </div>

          <p style={{ fontSize: '0.875rem', marginBottom: '0.75rem' }}>
            Do you think the background's temperature is about the same in every direction of the sky, or does
            it vary a lot from direction to direction?
          </p>
          <div style={{ marginBottom: '0.5rem' }}>
            {skyChoices.map((choice) => (
              <button
                key={choice.value}
                onClick={() => setSkyPrediction(choice.value)}
                disabled={hasSubmittedPrediction}
                className={`toggle-button${skyPrediction === choice.value ? ' is-selected' : ''}`}
                style={{ marginRight: '0.5rem', marginBottom: '0.5rem' }}
              >
                {choice.label}
              </button>
            ))}
          </div>

          <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
            {hasPrediction || hasSubmittedPrediction
              ? `Your predictions: ${
                  temperatureChoices.find(
                    (c) => c.value === (temperaturePrediction ?? submittedTemperaturePrediction),
                  )!.label
                }, ${skyChoices.find((c) => c.value === (skyPrediction ?? submittedSkyPrediction))!.label}`
              : 'Answer both questions to continue'}
          </p>
        </div>

        {hasSubmittedPrediction && (
          <div style={{ marginTop: '-0.5rem', marginBottom: '1rem' }}>
            <p
              style={{
                fontSize: '0.75rem',
                color: 'var(--text-muted)',
                marginBottom: '0.5rem',
              }}
            >
              Your predictions are locked in above. You can still try as many moments as you like below. Or,
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
          <p style={{ fontSize: '0.875rem', marginBottom: '0.5rem' }}>Moment in cosmic history:</p>
          <button
            type="button"
            onClick={() => handleModeChange('today')}
            disabled={!hasPrediction || status === 'running'}
            className={`toggle-button${mode === 'today' ? ' is-selected' : ''}`}
            style={{ marginRight: '0.5rem', marginBottom: '0.5rem' }}
          >
            Today (z = 0)
          </button>
          <button
            type="button"
            onClick={() => handleModeChange('recombination')}
            disabled={!hasPrediction || status === 'running'}
            className={`toggle-button${mode === 'recombination' ? ' is-selected' : ''}`}
            style={{ marginRight: '0.5rem', marginBottom: '0.5rem' }}
          >
            Recombination (~
            {RECOMBINATION_YEARS_AFTER_BIG_BANG.toLocaleString()} years after the Big Bang)
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
              <label htmlFor="cmb-redshift" style={{ display: 'block', marginBottom: '0.5rem' }}>
                Redshift: z = {customRedshift.toFixed(1)}
              </label>
              <input
                id="cmb-redshift"
                type="range"
                min={0}
                max={RECOMBINATION_REDSHIFT}
                step={0.1}
                value={customRedshift}
                disabled={!hasPrediction || status === 'running'}
                onChange={(event) => {
                  setCustomRedshift(Number(event.target.value))
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
          <p
            style={{
              marginTop: '1rem',
              marginBottom: 0,
              fontSize: '0.75rem',
              color: 'var(--text-muted)',
            }}
          >
            Redshift (z): {displayedRedshift.toFixed(1)} &nbsp;|&nbsp; Background temperature:{' '}
            {displayedTemperature.toFixed(displayedTemperature < 100 ? 3 : 0)} K
          </p>
        )}

        <svg
          width={VIEW_WIDTH}
          height={hasSubmittedPrediction ? VIEW_HEIGHT : TOP_PANEL_HEIGHT}
          viewBox={`0 0 ${VIEW_WIDTH} ${hasSubmittedPrediction ? VIEW_HEIGHT : TOP_PANEL_HEIGHT}`}
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
            <linearGradient id="cmb-range-gradient" x1="0" y1="0" x2="1" y2="0">
              <stop offset="0%" stopColor={colorForRedshift(RECOMBINATION_REDSHIFT)} />
              <stop offset="100%" stopColor={todayColor} />
            </linearGradient>
          </defs>

          <text x={VIEW_WIDTH / 2} y={22} fill="#e2e8f0" fontSize="12" fontWeight="600" textAnchor="middle">
            The light's journey: temperature of the background at each moment
          </text>

          {/* The range of cosmic history, colored by the temperature at each point */}
          <rect
            x={BAR_LEFT_X}
            y={BAR_Y}
            width={BAR_RIGHT_X - BAR_LEFT_X}
            height={BAR_HEIGHT}
            rx={4}
            fill="url(#cmb-range-gradient)"
          />
          <text x={BAR_LEFT_X} y={BAR_Y + BAR_HEIGHT + 16} fill="#e2e8f0" fontSize="11" textAnchor="start">
            Recombination
          </text>
          <text x={BAR_LEFT_X} y={BAR_Y + BAR_HEIGHT + 30} fill="#94a3b8" fontSize="10" textAnchor="start">
            z ≈ {RECOMBINATION_REDSHIFT}, hot
          </text>
          <text x={BAR_RIGHT_X} y={BAR_Y + BAR_HEIGHT + 16} fill="#e2e8f0" fontSize="11" textAnchor="end">
            Today (Earth)
          </text>
          <text x={BAR_RIGHT_X} y={BAR_Y + BAR_HEIGHT + 30} fill="#94a3b8" fontSize="10" textAnchor="end">
            z = 0, cold
          </text>

          {/* The chosen moment */}
          <line
            x1={markerX}
            y1={BAR_Y - 14}
            x2={markerX}
            y2={BAR_Y + BAR_HEIGHT + 4}
            stroke="#f8fafc"
            strokeWidth={2}
          />
          <circle cx={markerX} cy={BAR_Y - 24} r={10} fill={markerColor} stroke="#f8fafc" strokeWidth={2} />
          <text x={markerX} y={BAR_Y - 40} fill="#e2e8f0" fontSize="11" textAnchor="middle">
            chosen moment
          </text>

          {/* The sky in every direction (always today's sky) */}
          {hasSubmittedPrediction && (
            <>
              <line x1={20} y1={168} x2={VIEW_WIDTH - 20} y2={168} stroke="#334155" strokeWidth={1} />
              <text
                x={VIEW_WIDTH / 2}
                y={192}
                fill="#e2e8f0"
                fontSize="12"
                fontWeight="600"
                textAnchor="middle"
              >
                The sky in every direction, as seen today (illustrative)
              </text>
              <g transform="translate(15, 225)">
                {SKY_DIRECTIONS.map((d, i) => (
                  <circle
                    key={i}
                    cx={d.x}
                    cy={d.y}
                    r={16}
                    fill={skyColor(d.dr, d.dg, d.db)}
                    stroke="#475569"
                    strokeWidth={1}
                  />
                ))}
              </g>
              <text x={VIEW_WIDTH / 2} y={VIEW_HEIGHT - 14} fill="#94a3b8" fontSize="10" textAnchor="middle">
                each circle = one direction in the sky, colored by its background temperature
              </text>
            </>
          )}
        </svg>

        {hasSubmittedPrediction && (
          <div
            style={{
              fontSize: '0.75rem',
              color: 'var(--text-muted)',
              marginTop: '0.5rem',
            }}
          >
            <p style={{ marginTop: 0, marginBottom: '0.4rem' }}>
              <strong>How to read this diagram.</strong> The top panel is the light's journey through cosmic
              history, from <strong>Recombination</strong> (left) to <strong>Today</strong> (right, at Earth).
              The bar's color shows the temperature of the background at each moment, and the{' '}
              <strong>chosen moment</strong> marker shows where you are.
            </p>
            <ul style={{ margin: 0, paddingLeft: '1.1rem' }}>
              <li>
                Compare the marker's color at Recombination (hot white-orange) with Today (cold deep violet).
                The exact temperature is always shown in the readout above; the colors are only a visual aid.
              </li>
              <li>
                The lower panel is a separate view: several directions in the sky, today. Compare their colors
                with each other. The spots are illustrative, not a real measurement, and do not change with
                the control. Why it matters: this is the observation behind the horizon problem from
                Experiment 2, whether distant parts of the sky that could never have exchanged heat look
                alike.
              </li>
            </ul>
          </div>
        )}
        {status === 'complete' && submittedTemperaturePrediction && submittedSkyPrediction && (
          <div
            style={{
              marginTop: '1.5rem',
              paddingTop: '1rem',
              borderTop: '1px solid var(--border-color, #ccc)',
            }}
          >
            <h3 style={{ marginTop: 0 }}>Results</h3>
            <p>
              At <strong>redshift z = {result.redshift.toFixed(1)}</strong>, the background's temperature
              works out to <strong>{formatKelvin(result.temperatureKelvin)} K</strong>. The rule is simple:
              temperature = today's temperature × (1 + z). With today's {CMB_TEMPERATURE_TODAY_KELVIN} K, that
              is {CMB_TEMPERATURE_TODAY_KELVIN} × (1 + {result.redshift.toFixed(1)}) ≈{' '}
              {formatKelvin(result.temperatureKelvin)} K.
            </p>
            <p style={{ marginBottom: '0.5rem' }}>
              <strong>Checking your first prediction:</strong> you guessed the temperature at recombination
              was{' '}
              {temperatureChoices
                .find((c) => c.value === submittedTemperaturePrediction)!
                .label.toLowerCase()}{' '}
              than today's. At recombination (z ≈ {RECOMBINATION_REDSHIFT}) the same rule gives{' '}
              {CMB_TEMPERATURE_TODAY_KELVIN} × (1 + {RECOMBINATION_REDSHIFT}) ≈{' '}
              {formatKelvin(cmbTemperatureKelvin(RECOMBINATION_REDSHIFT))} K, far hotter than{' '}
              {CMB_TEMPERATURE_TODAY_KELVIN} K today —{' '}
              {submittedTemperaturePrediction === ACTUAL_TEMPERATURE
                ? 'so your prediction was right.'
                : 'so your prediction was off this time.'}
            </p>
            <p style={{ marginBottom: '0.5rem' }}>
              <strong>Checking your second prediction:</strong> you guessed the background's temperature
              across the sky is{' '}
              {skyChoices.find((c) => c.value === submittedSkyPrediction)!.label.toLowerCase()}. In real
              measurements it is almost exactly the same in every direction —{' '}
              {submittedSkyPrediction === ACTUAL_SKY
                ? 'so your prediction was right.'
                : 'so your prediction was off this time.'}
            </p>
            <p style={{ marginBottom: '0.5rem' }}>
              This is the same stretching you saw in Experiment 1: as the universe expands, light's wavelength
              stretches by the factor (1 + z), and the temperature of its glow drops by the same factor. The
              rule used here is <strong>exact</strong> at any redshift, unlike Experiment 1's formula, which
              only works for nearby galaxies, so that formula is not reused here.
            </p>
            <p style={{ marginBottom: '0.5rem' }}>
              Values used: today's temperature of {CMB_TEMPERATURE_TODAY_KELVIN} K and a recombination
              redshift of {RECOMBINATION_REDSHIFT}, both real, carefully measured values (Planck satellite),
              given rather than derived here. The CMB was discovered by accident in 1965 by Arno Penzias and
              Robert Wilson, and later measured with great precision by the COBE, WMAP and Planck missions.
            </p>
          </div>
        )}
      </div>

      {status === 'complete' && submittedTemperaturePrediction && submittedSkyPrediction && (
        <CosmicMicrowaveBackgroundTutor
          key={runCount}
          predictedTemperature={submittedTemperaturePrediction}
          predictedSky={submittedSkyPrediction}
          onExplained={onTutorComplete}
        />
      )}
    </div>
  )
}
