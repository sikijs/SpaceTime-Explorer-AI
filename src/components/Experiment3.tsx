import { useEffect, useState } from 'react'
import { movingClockStateAt, runMovingClockExperiment } from '../physics/movingClockExperiment'
import type { MovingClockExperimentResult } from '../physics/movingClockExperiment'
import { Experiment3Tutor } from './Experiment3Tutor'

type DurationOption = 5 | 10 | 20 | 30 | 'other'
type VelocityOption = 0 | 0.1 | 0.3 | 0.5 | 0.8 | 'other'
type ExperimentStatus = 'idle' | 'running' | 'complete'

const MAX_DURATION_SECONDS = 120

// Readings are shown to one decimal place because a moving clock's elapsed time is not a whole number.
// Hours are omitted: durations never exceed 120 seconds, and the shorter reading lets both clocks fit side by side.
function formatClockReading(seconds: number): string {
  const tenths = Math.round(seconds * 10)
  const whole = Math.floor(tenths / 10)
  const minutes = Math.floor(whole / 60)
  const secs = whole % 60
  return `${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}.${tenths % 10}`
}

const optionButtonStyle = (selected: boolean, disabled: boolean) => ({
  marginRight: '0.5rem',
  padding: '0.5rem 1rem',
  backgroundColor: selected ? '#007bff' : '#f0f0f0',
  color: selected ? 'white' : 'black',
  border: '1px solid #ccc',
  borderRadius: '4px',
  cursor: disabled ? 'not-allowed' : 'pointer',
  fontSize: '0.875rem',
  opacity: disabled ? 0.6 : 1,
})

const clockBoxStyle = {
  fontSize: '2.5rem',
  fontFamily: 'monospace',
  fontWeight: 'bold' as const,
  padding: '1rem 0.5rem',
  backgroundColor: '#d9ecff',
  borderRadius: '6px',
  minWidth: '150px',
  textAlign: 'center' as const,
}

const inputStyle = {
  padding: '0.5rem',
  fontSize: '0.875rem',
  border: '1px solid #ccc',
  borderRadius: '4px',
  width: '200px',
}

// Drawing constants (SVG units). The track is scaled so the moving clock ends the run at the far end.
const TRACK_VIEW_WIDTH = 420
const TRACK_VIEW_HEIGHT = 145
const TRACK_START_X = 45
const TRACK_END_X = 375
const TRACK_Y = 82

interface MovingClockTrackProps {
  experiment: MovingClockExperimentResult
  distanceTravelled: number
}

// Draws the lab clock at the start and the moving clock at the distance the physics model reports.
function MovingClockTrack({ experiment, distanceTravelled }: MovingClockTrackProps) {
  const fraction =
    experiment.distanceTravelled > 0 ? distanceTravelled / experiment.distanceTravelled : 0
  const movingX = TRACK_START_X + fraction * (TRACK_END_X - TRACK_START_X)
  const labelX = Math.min(Math.max(movingX, TRACK_START_X + 30), TRACK_END_X - 30)

  return (
    <svg
      viewBox={`0 0 ${TRACK_VIEW_WIDTH} ${TRACK_VIEW_HEIGHT}`}
      role="img"
      aria-label={`The moving clock has travelled ${distanceTravelled.toFixed(2)} light-seconds from the lab clock`}
      style={{ width: '100%', height: 'auto', display: 'block' }}
    >
      <line x1={TRACK_START_X} y1={TRACK_Y} x2={TRACK_END_X} y2={TRACK_Y} stroke="#999" strokeWidth="3" />
      <line x1={TRACK_START_X} y1={TRACK_Y - 8} x2={TRACK_START_X} y2={TRACK_Y + 8} stroke="#666" strokeWidth="2" />
      <line x1={TRACK_END_X} y1={TRACK_Y - 8} x2={TRACK_END_X} y2={TRACK_Y + 8} stroke="#666" strokeWidth="2" />
      <line x1={TRACK_START_X} y1={TRACK_Y} x2={movingX} y2={TRACK_Y} stroke="#e6a700" strokeWidth="4" />

      <rect x={TRACK_START_X - 14} y={TRACK_Y + 14} width="28" height="20" rx="3" fill="#007bff" />
      <text x={TRACK_START_X} y={TRACK_Y + 50} textAnchor="middle" fontSize="11" fill="#444">
        Lab clock
      </text>

      <rect x={movingX - 14} y={TRACK_Y - 36} width="28" height="20" rx="3" fill="#e6a700" />
      <text x={labelX} y={TRACK_Y - 44} textAnchor="middle" fontSize="11" fill="#444">
        {distanceTravelled.toFixed(2)} light-seconds
      </text>

      <text x={TRACK_END_X} y={TRACK_Y + 50} textAnchor="middle" fontSize="11" fill="#444">
        End of run
      </text>
    </svg>
  )
}

export function Experiment3() {
  const [duration, setDuration] = useState<DurationOption>(10)
  const [customDuration, setCustomDuration] = useState('')
  const [velocity, setVelocity] = useState<VelocityOption>(0.5)
  const [customVelocity, setCustomVelocity] = useState('')

  const [predictionInput, setPredictionInput] = useState('')
  const [submittedPrediction, setSubmittedPrediction] = useState<number | null>(null)
  const [status, setStatus] = useState<ExperimentStatus>('idle')
  const [result, setResult] = useState<MovingClockExperimentResult | null>(null)
  const [labTime, setLabTime] = useState(0)

  const selectedDuration = duration === 'other' ? parseInt(customDuration) || 0 : duration
  const selectedVelocity = velocity === 'other' ? parseFloat(customVelocity) || 0 : velocity
  const isRunning = status === 'running'
  const isDurationValid = selectedDuration >= 1 && selectedDuration <= MAX_DURATION_SECONDS
  // The 0c preset is a valid at-rest baseline; a custom speed must be between 0.01c and 0.99c.
  const isSpeedValid =
    velocity === 0 || (selectedVelocity >= 0.01 && selectedVelocity <= 0.99)
  const isValid = isDurationValid && isSpeedValid
  const speedText = isSpeedValid ? `${selectedVelocity}c` : '—'
  const statusLabel = isRunning ? 'Running...' : 'At rest'
  const predictionValue = predictionInput.trim() ? Number(predictionInput) : null
  const hasPrediction = predictionValue !== null && isFinite(predictionValue)
  const canStart = isValid && hasPrediction && !isRunning

  // Before a run, preview the track for the selected settings. After a run, keep that run's own values.
  const experiment =
    result ?? (isValid ? runMovingClockExperiment(selectedDuration, selectedVelocity) : null)
  const clockState = experiment ? movingClockStateAt(experiment, Math.min(labTime, experiment.labTimeDuration)) : null

  const handleStart = () => {
    if (!canStart) return
    setSubmittedPrediction(predictionValue)
    setPredictionInput('')
    setLabTime(0)
    setResult(runMovingClockExperiment(selectedDuration, selectedVelocity))
    setStatus('running')
  }

  useEffect(() => {
    if (status !== 'running' || !result) return

    const animationDurationMs = 2000
    const startTime = performance.now()
    let frameId: number

    const animate = (currentTime: number) => {
      const progress = Math.min((currentTime - startTime) / animationDurationMs, 1)
      setLabTime(progress * result.labTimeDuration)

      if (progress >= 1) {
        setLabTime(result.labTimeDuration)
        setStatus('complete')
        return
      }

      frameId = requestAnimationFrame(animate)
    }

    frameId = requestAnimationFrame(animate)

    return () => cancelAnimationFrame(frameId)
  }, [status, result])

  return (
    <div style={{ padding: '2rem', maxWidth: '900px', margin: '0 auto' }}>
      <h1>Experiment 3 — Moving Clock</h1>

      <div
        style={{
          marginTop: '2rem',
          padding: '1.5rem',
          border: '1px solid #ccc',
          borderRadius: '8px',
          backgroundColor: '#f9f9f9',
        }}
      >
        <div style={{ marginBottom: '2rem', fontSize: '0.875rem', color: '#555' }}>
          <p style={{ marginTop: 0, marginBottom: '0.75rem' }}>
            <strong>The question.</strong> If one clock stays still and another clock moves, do they
            keep the same time?
          </p>
          <p style={{ marginTop: 0, marginBottom: '0.75rem' }}>
            <strong>What happens.</strong> Two ordinary clocks start together at 00:00.0. One stays
            in the lab. The other moves away in a straight line at a steady speed. You choose the
            speed and how long the lab clock runs. When that time is up, we read both clocks.
          </p>
          <p style={{ marginTop: 0, marginBottom: '0.75rem' }}>
            <strong>Your job.</strong> Predict what the moving clock will read at the end.
          </p>
          <p style={{ marginTop: 0, marginBottom: '0.75rem' }}>
            <strong>How this differs from Experiment 4.</strong> This experiment measures{' '}
            <em>how much</em> the two clocks differ. It does not explain why. Experiment 4 looks
            inside a clock to find the reason.
          </p>
          <p style={{ marginTop: 0, marginBottom: '0.25rem' }}>
            <strong>What we assume.</strong>
          </p>
          <ul style={{ marginTop: 0, marginBottom: 0, paddingLeft: '1.25rem' }}>
            <li>There is no gravity, and the moving clock keeps a constant speed (no acceleration).</li>
            <li>Both clocks start together at the same place, and both are set to zero then.</li>
            <li>
              The lab has clocks at rest that are synchronized with each other, as in Experiment 2.
              <strong> Lab time</strong> is time read on those lab clocks.
            </li>
            <li>
              Distances are given in <strong>light-seconds</strong>. One light-second is the
              distance light travels in one second (about 300,000 km).
            </li>
          </ul>
        </div>

        <div style={{ marginBottom: '2rem' }}>
          <p style={{ fontSize: '0.875rem', color: '#666' }}>{statusLabel}</p>

          {experiment && clockState && (
            <div style={{ marginBottom: '1rem' }}>
              <MovingClockTrack
                experiment={experiment}
                distanceTravelled={clockState.distanceTravelled}
              />
              <p style={{ fontSize: '0.75rem', color: '#777', margin: '0.25rem 0 0', textAlign: 'center' }}>
                The track is drawn to fit this run: the moving clock reaches the far end when the run
                finishes.
              </p>
            </div>
          )}

          <div
            style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'space-around', gap: '1rem' }}
          >
            <div style={{ textAlign: 'center' }}>
              <p style={{ fontSize: '0.875rem', color: '#666', marginBottom: '0.5rem' }}>
                Lab Clock
              </p>
              <div style={clockBoxStyle}>
                {formatClockReading(clockState ? clockState.labClockReading : 0)}
              </div>
            </div>

            <div style={{ textAlign: 'center' }}>
              <p style={{ fontSize: '0.875rem', color: '#666', marginBottom: '0.5rem' }}>
                Moving Clock
              </p>
              <div style={clockBoxStyle}>
                {formatClockReading(clockState ? clockState.movingClockReading : 0)}
              </div>
            </div>
          </div>
        </div>

        <div style={{ marginBottom: '2rem' }}>
          <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold' }}>
            Lab time duration
          </label>

          <div style={{ marginBottom: '1rem' }}>
            {[5, 10, 20, 30].map((preset) => (
              <button
                key={preset}
                onClick={() => setDuration(preset as DurationOption)}
                disabled={isRunning}
                style={optionButtonStyle(duration === preset, isRunning)}
              >
                {preset}s
              </button>
            ))}
            <button
              onClick={() => setDuration('other')}
              disabled={isRunning}
              style={optionButtonStyle(duration === 'other', isRunning)}
            >
              Other
            </button>
          </div>

          {duration === 'other' && (
            <div style={{ marginBottom: '1rem' }}>
              <input
                type="number"
                min="1"
                max={MAX_DURATION_SECONDS}
                value={customDuration}
                onChange={(e) => setCustomDuration(e.target.value)}
                disabled={isRunning}
                placeholder={`Enter seconds (1-${MAX_DURATION_SECONDS})`}
                style={inputStyle}
              />
            </div>
          )}

          <p style={{ fontSize: '0.875rem', color: '#666' }}>
            Selected duration: <strong>{selectedDuration || '—'} seconds</strong>
          </p>
        </div>

        <div style={{ marginBottom: '2rem' }}>
          <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold' }}>
            Moving clock speed
          </label>
          <p style={{ fontSize: '0.875rem', color: '#555', marginBottom: '0.75rem' }}>
            Speeds are given as a fraction of <strong>c</strong>, the speed of light (about 300,000
            km/s). For example, 0.5c means half the speed of light. 0c means the clock is not moving,
            which gives a baseline to compare with.
          </p>

          <div style={{ marginBottom: '1rem' }}>
            {[0, 0.1, 0.3, 0.5, 0.8].map((preset) => (
              <button
                key={preset}
                onClick={() => setVelocity(preset as VelocityOption)}
                disabled={isRunning}
                style={optionButtonStyle(velocity === preset, isRunning)}
              >
                {preset}c
              </button>
            ))}
            <button
              onClick={() => setVelocity('other')}
              disabled={isRunning}
              style={optionButtonStyle(velocity === 'other', isRunning)}
            >
              Other
            </button>
          </div>

          {velocity === 'other' && (
            <div style={{ marginBottom: '1rem' }}>
              <input
                type="number"
                min="0.01"
                max="0.99"
                step="0.01"
                value={customVelocity}
                onChange={(e) => setCustomVelocity(e.target.value)}
                disabled={isRunning}
                placeholder="Fraction of c (0.01-0.99)"
                style={inputStyle}
              />
            </div>
          )}

          <p style={{ fontSize: '0.875rem', color: '#666' }}>
            Selected speed: <strong>{speedText}</strong>
          </p>
        </div>

        <div style={{ marginBottom: '2rem' }}>
          <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold' }}>
            Make a prediction
          </label>
          <p style={{ fontSize: '0.875rem', color: '#555', marginBottom: '0.75rem' }}>
            The moving clock will travel at {speedText} relative to the lab, and the lab clock will
            run for {selectedDuration || '—'} seconds.
            What do you predict the moving clock will read when the experiment ends?
          </p>
          <input
            type="number"
            step="any"
            value={predictionInput}
            onChange={(e) => setPredictionInput(e.target.value)}
            disabled={isRunning}
            placeholder="Enter seconds"
            style={{
              ...inputStyle,
              opacity: isRunning ? 0.6 : 1,
              cursor: isRunning ? 'not-allowed' : 'text',
            }}
          />
          <p style={{ fontSize: '0.75rem', color: '#999', marginTop: '0.5rem' }}>
            {submittedPrediction !== null && !hasPrediction
              ? `Your prediction: ${submittedPrediction} seconds`
              : hasPrediction
                ? `Your prediction: ${predictionValue} seconds`
                : 'Enter a prediction to continue'}
          </p>
        </div>

        <button
          onClick={handleStart}
          disabled={!canStart}
          style={{
            padding: '0.75rem 2rem',
            fontSize: '1rem',
            fontWeight: 'bold',
            backgroundColor: isRunning ? '#6c757d' : canStart ? '#28a745' : '#ccc',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: canStart ? 'pointer' : 'not-allowed',
            opacity: canStart ? 1 : 0.7,
          }}
        >
          {isRunning ? 'Running...' : 'START'}
        </button>

        {status === 'complete' && result && submittedPrediction !== null && (
          <div
            style={{
              marginTop: '2rem',
              padding: '1.5rem',
              border: '1px solid #e0e0e0',
              borderRadius: '8px',
              backgroundColor: '#fafafa',
            }}
          >
            <h2 style={{ marginTop: 0, marginBottom: '1rem', fontSize: '1.25rem' }}>Results</h2>

            <p style={{ margin: '0.5rem 0', fontSize: '0.875rem' }}>
              <strong>Duration (lab frame):</strong> {result.labTimeDuration} seconds
            </p>
            <p style={{ margin: '0.5rem 0', fontSize: '0.875rem' }}>
              <strong>Moving clock speed:</strong> {result.velocity}c (
              {parseFloat((result.velocity * 100).toFixed(2))}% of the speed of light)
            </p>
            <p style={{ margin: '0.5rem 0', fontSize: '0.875rem' }}>
              <strong>Distance the moving clock travelled (lab frame):</strong>{' '}
              {result.distanceTravelled.toFixed(3)} light-seconds
            </p>

            <div style={{ paddingTop: '1rem', marginTop: '1rem', borderTop: '1px solid #ddd' }}>
              <p style={{ margin: '0.5rem 0', fontSize: '0.875rem' }}>
                <strong>Lab clock's measurement:</strong> {result.observerElapsedTime.toFixed(3)}{' '}
                seconds
              </p>
              <p style={{ margin: '0.5rem 0', fontSize: '0.875rem' }}>
                <strong>Moving clock's reading:</strong> {result.movingClockElapsedTime.toFixed(3)}{' '}
                seconds
              </p>
              <p style={{ margin: '0.5rem 0', fontSize: '0.875rem' }}>
                <strong>Difference:</strong>{' '}
                {result.timeDifferential.toFixed(3) === '0.000'
                  ? '0.000'
                  : `−${result.timeDifferential.toFixed(3)}`}{' '}
                seconds (moving clock minus lab clock)
              </p>
              <p style={{ margin: '0.5rem 0', fontSize: '0.875rem' }}>
                <strong>Time dilation factor:</strong> {result.timeDilationFactor.toFixed(3)} (√(1 −{' '}
                {result.velocity}²) with speeds in units of c)
              </p>
            </div>

            <div style={{ paddingTop: '1rem', marginTop: '1rem', borderTop: '1px solid #ddd' }}>
              <p style={{ margin: '0.5rem 0', fontSize: '0.875rem' }}>
                <strong>Your prediction:</strong> {submittedPrediction} seconds
              </p>
              <p style={{ margin: '0.5rem 0', fontSize: '0.875rem' }}>
                <strong>Actual moving clock reading:</strong>{' '}
                {result.movingClockElapsedTime.toFixed(3)} seconds
              </p>
            </div>
          </div>
        )}

        {status === 'complete' && result && submittedPrediction !== null && (
          <Experiment3Tutor
            velocity={result.velocity}
            prediction={submittedPrediction}
            observerElapsedTime={result.observerElapsedTime}
            movingClockElapsedTime={result.movingClockElapsedTime}
            timeDilationFactor={result.timeDilationFactor}
            timeDifferential={result.timeDifferential}
          />
        )}
      </div>
    </div>
  )
}
