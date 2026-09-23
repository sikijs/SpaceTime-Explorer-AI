import { useEffect, useState } from 'react'
import { runClockExperiment } from '../physics/clockExperiment'
import type { ClockExperimentResult } from '../physics/clockExperiment'
import { ExperimentTutor } from './ExperimentTutor'

type DurationOption = 5 | 10 | 20 | 30 | 'other'
type ExperimentStatus = 'idle' | 'running' | 'complete'

function formatClockReading(seconds: number): string {
  const hours = Math.floor(seconds / 3600)
  const minutes = Math.floor((seconds % 3600) / 60)
  const secs = seconds % 60
  return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
}

interface Experiment1Props {
  onComplete?: () => void
  onTutorComplete?: () => void
}

export function Experiment1({ onComplete, onTutorComplete }: Experiment1Props) {
  const [duration, setDuration] = useState<DurationOption>(10)
  const [customDuration, setCustomDuration] = useState('')
  const [predictionInput, setPredictionInput] = useState('')
  const [submittedPrediction, setSubmittedPrediction] = useState<number | null>(null)
  const [status, setStatus] = useState<ExperimentStatus>('idle')
  const [result, setResult] = useState<ClockExperimentResult | null>(null)
  const [displayedSeconds, setDisplayedSeconds] = useState(0)

  const selectedDuration = duration === 'other' ? parseInt(customDuration) || 0 : duration
  const isRunning = status === 'running'
  const isComplete = status === 'complete'
  const predictionValue = predictionInput.trim() ? Number(predictionInput) : null
  const hasPrediction = predictionValue !== null && isFinite(predictionValue)

  const clockDisplay = formatClockReading(displayedSeconds)
  const statusLabel = isRunning ? 'Running...' : 'At rest'

  const handleStart = () => {
    if (!hasPrediction) return
    setSubmittedPrediction(predictionValue)
    setPredictionInput('')
    setDisplayedSeconds(0)
    setStatus('running')
    const experimentResult = runClockExperiment(selectedDuration)
    setResult(experimentResult)
  }

  const handleRunAgain = () => {
    setStatus('idle')
    setResult(null)
    setSubmittedPrediction(null)
    setDisplayedSeconds(0)
  }

  useEffect(() => {
    if (status !== 'running' || !result) return

    const animationDurationMs = 2000
    const startTime = performance.now()
    let frameId: number

    const animate = (currentTime: number) => {
      const elapsed = currentTime - startTime
      const progress = Math.min(elapsed / animationDurationMs, 1)
      const newDisplayedSeconds = Math.floor(progress * result.finalClockReading)
      setDisplayedSeconds(newDisplayedSeconds)

      if (progress >= 1) {
        setDisplayedSeconds(result.finalClockReading)
        setStatus('complete')
        onComplete?.()
        return
      }

      frameId = requestAnimationFrame(animate)
    }

    frameId = requestAnimationFrame(animate)

    return () => cancelAnimationFrame(frameId)
  }, [status, result])

  return (
    <div style={{ padding: '2rem', maxWidth: '600px', margin: '0 auto' }}>
      <h2>Experiment 1 — What Does a Clock Measure?</h2>

      <div
        className="exp-card"
        style={{
          marginTop: '2rem',
          padding: '1.5rem',
        }}
      >
        <div style={{ marginBottom: '2rem', fontSize: '0.875rem', color: 'var(--text-muted)' }}>
          <p style={{ marginTop: 0, marginBottom: '0.75rem' }}>
            <strong>The question.</strong> What does a clock actually measure?
          </p>
          <p style={{ marginTop: 0, marginBottom: '0.75rem' }}>
            <strong>What happens.</strong> There is one clock, and it stands still. It starts by
            showing 00:00:00. You choose how long the experiment lasts. When you press START, the
            clock begins to tick. The experiment ends when the time you chose is up. Two moments
            matter here: the moment the experiment starts and the moment it ends. We call each
            of these moments an <strong>event</strong>.
          </p>
          <p style={{ marginTop: 0, marginBottom: '0.75rem' }}>
            <strong>Your job.</strong> Before you press START, predict what the clock will show when
            the experiment ends. A wrong guess is fine. Guesses are not scored. Guessing first
            gives you a chance to think before you look.
          </p>
          <p style={{ marginTop: 0, marginBottom: '0.25rem' }}>
            <strong>What we assume.</strong>
          </p>
          <ul style={{ marginTop: 0, marginBottom: 0, paddingLeft: '1.25rem' }}>
            <li>There is only one clock, and it stays in one place. It does not move, and there is no gravity.</li>
            <li>
              To save you waiting, the animation may play faster than real life. This does not
              change the result.
            </li>
          </ul>
        </div>

        <div style={{ marginBottom: '1rem' }}>
          <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)' }}>{statusLabel}</p>
          <div
            className="clock-readout"
            style={{
              fontSize: '2.5rem',
              fontFamily: 'monospace',
              fontWeight: 'bold',
              marginBottom: '1rem',
              padding: '1rem',
              textAlign: 'center',
            }}
          >
            {clockDisplay}
          </div>
        </div>

        <div style={{ marginBottom: '2rem' }}>
          <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold' }}>
            Experiment duration
          </label>

          <div style={{ marginBottom: '1rem' }}>
            {[5, 10, 20, 30].map((preset) => (
              <button
                key={preset}
                onClick={() => setDuration(preset as DurationOption)}
                disabled={isRunning}
                className={`toggle-button${duration === preset ? ' is-selected' : ''}`}
                style={{
                  marginRight: '0.5rem',
                  padding: '0.5rem 1rem',
                  cursor: isRunning ? 'not-allowed' : 'pointer',
                  fontSize: '0.875rem',
                  opacity: isRunning ? 0.6 : 1,
                }}
              >
                {preset}s
              </button>
            ))}
          </div>

          <div style={{ marginBottom: '1rem' }}>
            <button
              onClick={() => setDuration('other')}
              disabled={isRunning}
              className={`toggle-button${duration === 'other' ? ' is-selected' : ''}`}
              style={{
                padding: '0.5rem 1rem',
                cursor: isRunning ? 'not-allowed' : 'pointer',
                fontSize: '0.875rem',
                opacity: isRunning ? 0.6 : 1,
              }}
            >
              Other
            </button>
          </div>

          {duration === 'other' && (
            <div style={{ marginBottom: '1rem' }}>
              <input
                type="number"
                min="1"
                max="60"
                value={customDuration}
                onChange={(e) => setCustomDuration(e.target.value)}
                disabled={isRunning}
                placeholder="Enter seconds (1-60)"
                className="field-input"
                style={{
                  padding: '0.5rem',
                  fontSize: '0.875rem',
                  width: '200px',
                  opacity: isRunning ? 0.6 : 1,
                  cursor: isRunning ? 'not-allowed' : 'text',
                }}
              />
            </div>
          )}

          <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)' }}>
            Selected duration: <strong>{selectedDuration || '—'} seconds</strong>
          </p>
        </div>

        <div style={{ marginBottom: '2rem' }}>
          <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold' }}>
            Make a prediction
          </label>
          <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)', marginBottom: '0.75rem' }}>
            The experiment will last {selectedDuration} seconds. When it ends, what will the clock
            show? Type your guess in seconds.
          </p>
          <input
            type="number"
            value={predictionInput}
            onChange={(e) => setPredictionInput(e.target.value)}
            disabled={isRunning}
            placeholder="Enter seconds"
            className="field-input"
            style={{
              padding: '0.5rem',
              fontSize: '0.875rem',
              width: '200px',
              opacity: isRunning ? 0.6 : 1,
              cursor: isRunning ? 'not-allowed' : 'text',
            }}
          />
          <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.5rem' }}>
            {hasPrediction ? `Your prediction: ${predictionValue} seconds` : 'Enter a prediction to continue'}
          </p>
        </div>

        <button
          onClick={handleStart}
          disabled={isRunning || !hasPrediction}
          className="action-button"
          style={{
            padding: '0.75rem 2rem',
            fontSize: '1rem',
          }}
        >
          {isRunning ? 'Running...' : 'START'}
        </button>

        {isComplete && result && submittedPrediction !== null && (
          <div
            className="exp-card"
            style={{
              marginTop: '2rem',
              padding: '1.5rem',
            }}
          >
            <h2 className="app-title" style={{ marginTop: 0, marginBottom: '1rem', fontSize: '1.25rem' }}>
              Results
            </h2>

            <div style={{ marginBottom: '1rem' }}>
              <p style={{ margin: '0.5rem 0', fontSize: '0.875rem' }}>
                <strong>Start event (the moment the experiment begins):</strong> {formatClockReading(result.startEvent.clockReading)}
              </p>
              <p style={{ margin: '0.5rem 0', fontSize: '0.875rem' }}>
                <strong>End event (the moment the experiment ends):</strong> {formatClockReading(result.endEvent.clockReading)}
              </p>
            </div>

            <div style={{ marginBottom: '1rem' }}>
              <p style={{ margin: '0.5rem 0', fontSize: '0.875rem' }}>
                <strong>Clock reading at the start:</strong> {formatClockReading(result.initialClockReading)}
              </p>
              <p style={{ margin: '0.5rem 0', fontSize: '0.875rem' }}>
                <strong>Clock reading at the end:</strong> {formatClockReading(result.finalClockReading)}
              </p>
            </div>

            <div style={{ marginBottom: '1rem' }}>
              <p style={{ margin: '0.5rem 0', fontSize: '0.875rem' }}>
                <strong>Elapsed time (how much time passed):</strong> {result.elapsedTime} seconds
              </p>
            </div>

            <div style={{ marginBottom: '0', paddingTop: '1rem', borderTop: '1px solid var(--border)' }}>
              <p style={{ margin: '0.5rem 0', fontSize: '0.875rem' }}>
                <strong>You guessed:</strong> {submittedPrediction} seconds
              </p>
              <p style={{ margin: '0.5rem 0', fontSize: '0.875rem' }}>
                <strong>The real elapsed time:</strong> {result.elapsedTime} seconds
              </p>
            </div>

            <div style={{ marginTop: '1.5rem', paddingTop: '1rem', borderTop: '1px solid var(--border)' }}>
              <button
                onClick={handleRunAgain}
                className="secondary-button"
                style={{
                  padding: '0.5rem 1.5rem',
                  fontSize: '0.875rem',
                }}
              >
                Run Again
              </button>
            </div>
          </div>
        )}

        {isComplete && result && submittedPrediction !== null && (
          <div
            className="exp-card"
            style={{
              marginTop: '2rem',
              padding: '1.5rem',
            }}
          >
            <h3 className="app-title" style={{ marginTop: 0, marginBottom: '1.5rem', fontSize: '1rem' }}>
              Event Interval
            </h3>

            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'flex-start',
                marginBottom: '1rem',
              }}
            >
              <div style={{ textAlign: 'center', flex: '1' }}>
                <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '0.25rem' }}>
                  Event A
                </p>
                <p style={{ fontSize: '0.75rem', fontWeight: 'bold', marginBottom: '0.5rem' }}>
                  START
                </p>
                <div style={{ fontSize: '0.9rem', fontFamily: 'monospace', fontWeight: 'bold' }}>
                  {formatClockReading(result.startEvent.clockReading)}
                </div>
              </div>

              <div
                style={{
                  flex: '2',
                  height: '3px',
                  background: 'var(--gradient-primary)',
                  margin: '1.75rem 1rem 0',
                  position: 'relative',
                  borderRadius: '2px',
                }}
              >
                <div
                  className="event-dot"
                  style={{
                    position: 'absolute',
                    left: '0',
                    top: '-4px',
                    width: '8px',
                    height: '8px',
                    borderRadius: '50%',
                  }}
                />
                <div
                  className="event-dot"
                  style={{
                    position: 'absolute',
                    right: '0',
                    top: '-4px',
                    width: '8px',
                    height: '8px',
                    borderRadius: '50%',
                  }}
                />
              </div>

              <div style={{ textAlign: 'center', flex: '1' }}>
                <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '0.25rem' }}>
                  Event B
                </p>
                <p style={{ fontSize: '0.75rem', fontWeight: 'bold', marginBottom: '0.5rem' }}>
                  END
                </p>
                <div style={{ fontSize: '0.9rem', fontFamily: 'monospace', fontWeight: 'bold' }}>
                  {formatClockReading(result.endEvent.clockReading)}
                </div>
              </div>
            </div>

            <p
              style={{
                textAlign: 'center',
                fontSize: '0.875rem',
                color: 'var(--text-muted)',
                marginTop: '1rem',
                marginBottom: '0',
              }}
            >
              <strong>elapsed time:</strong> {result.elapsedTime} seconds
            </p>
          </div>
        )}

        {isComplete && result && submittedPrediction !== null && (
          <ExperimentTutor
            onExplained={onTutorComplete}
            key={`${result.experimentDuration}-${result.elapsedTime}`}
            predictionSeconds={submittedPrediction}
            actualSeconds={result.elapsedTime}
          />
        )}
      </div>
    </div>
  )
}
