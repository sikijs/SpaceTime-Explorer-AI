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

export function Experiment1() {
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
        return
      }

      frameId = requestAnimationFrame(animate)
    }

    frameId = requestAnimationFrame(animate)

    return () => cancelAnimationFrame(frameId)
  }, [status, result])

  return (
    <div style={{ padding: '2rem', maxWidth: '600px', margin: '0 auto' }}>
      <h1>Experiment 1 — What Does a Clock Measure?</h1>

      <div
        style={{
          marginTop: '2rem',
          padding: '1.5rem',
          border: '1px solid #ccc',
          borderRadius: '8px',
          backgroundColor: '#f9f9f9',
        }}
      >
        <div style={{ marginBottom: '1rem' }}>
          <p style={{ fontSize: '0.875rem', color: '#666' }}>{statusLabel}</p>
          <div
            style={{
              fontSize: '3rem',
              fontFamily: 'monospace',
              fontWeight: 'bold',
              marginBottom: '1rem',
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
                style={{
                  marginRight: '0.5rem',
                  padding: '0.5rem 1rem',
                  backgroundColor: duration === preset ? '#007bff' : '#f0f0f0',
                  color: duration === preset ? 'white' : 'black',
                  border: '1px solid #ccc',
                  borderRadius: '4px',
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
              style={{
                padding: '0.5rem 1rem',
                backgroundColor: duration === 'other' ? '#007bff' : '#f0f0f0',
                color: duration === 'other' ? 'white' : 'black',
                border: '1px solid #ccc',
                borderRadius: '4px',
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
                style={{
                  padding: '0.5rem',
                  fontSize: '0.875rem',
                  border: '1px solid #ccc',
                  borderRadius: '4px',
                  width: '200px',
                  opacity: isRunning ? 0.6 : 1,
                  cursor: isRunning ? 'not-allowed' : 'text',
                }}
              />
            </div>
          )}

          <p style={{ fontSize: '0.875rem', color: '#666' }}>
            Selected duration: <strong>{selectedDuration || '—'} seconds</strong>
          </p>
        </div>

        <div style={{ marginBottom: '2rem' }}>
          <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold' }}>
            Make a prediction
          </label>
          <p style={{ fontSize: '0.875rem', color: '#555', marginBottom: '0.75rem' }}>
            The experiment will run for {selectedDuration} seconds. What do you predict the clock will read
            when the experiment ends?
          </p>
          <input
            type="number"
            value={predictionInput}
            onChange={(e) => setPredictionInput(e.target.value)}
            disabled={isRunning}
            placeholder="Enter seconds"
            style={{
              padding: '0.5rem',
              fontSize: '0.875rem',
              border: '1px solid #ccc',
              borderRadius: '4px',
              width: '200px',
              opacity: isRunning ? 0.6 : 1,
              cursor: isRunning ? 'not-allowed' : 'text',
            }}
          />
          <p style={{ fontSize: '0.75rem', color: '#999', marginTop: '0.5rem' }}>
            {hasPrediction ? `Your prediction: ${predictionValue} seconds` : 'Enter a prediction to continue'}
          </p>
        </div>

        <button
          onClick={handleStart}
          disabled={isRunning || !hasPrediction}
          style={{
            padding: '0.75rem 2rem',
            fontSize: '1rem',
            fontWeight: 'bold',
            backgroundColor:
              isRunning ? '#6c757d' : hasPrediction ? '#28a745' : '#ccc',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: isRunning || !hasPrediction ? 'not-allowed' : 'pointer',
            opacity: isRunning || !hasPrediction ? 0.7 : 1,
          }}
        >
          {isRunning ? 'Running...' : 'START'}
        </button>

        {isComplete && result && submittedPrediction !== null && (
          <div
            style={{
              marginTop: '2rem',
              padding: '1.5rem',
              border: '1px solid #e0e0e0',
              borderRadius: '8px',
              backgroundColor: '#fafafa',
            }}
          >
            <h2 style={{ marginTop: 0, marginBottom: '1rem', fontSize: '1.25rem' }}>
              Results
            </h2>

            <div style={{ marginBottom: '1rem' }}>
              <p style={{ margin: '0.5rem 0', fontSize: '0.875rem' }}>
                <strong>Start event:</strong> {formatClockReading(result.startEvent.clockReading)}
              </p>
              <p style={{ margin: '0.5rem 0', fontSize: '0.875rem' }}>
                <strong>End event:</strong> {formatClockReading(result.endEvent.clockReading)}
              </p>
            </div>

            <div style={{ marginBottom: '1rem' }}>
              <p style={{ margin: '0.5rem 0', fontSize: '0.875rem' }}>
                <strong>Initial reading:</strong> {formatClockReading(result.initialClockReading)}
              </p>
              <p style={{ margin: '0.5rem 0', fontSize: '0.875rem' }}>
                <strong>Final reading:</strong> {formatClockReading(result.finalClockReading)}
              </p>
            </div>

            <div style={{ marginBottom: '1rem' }}>
              <p style={{ margin: '0.5rem 0', fontSize: '0.875rem' }}>
                <strong>Elapsed time:</strong> {result.elapsedTime} seconds
              </p>
            </div>

            <div style={{ marginBottom: '0', paddingTop: '1rem', borderTop: '1px solid #ddd' }}>
              <p style={{ margin: '0.5rem 0', fontSize: '0.875rem' }}>
                <strong>Your prediction:</strong> {submittedPrediction} seconds
              </p>
              <p style={{ margin: '0.5rem 0', fontSize: '0.875rem' }}>
                <strong>Actual result:</strong> {result.elapsedTime} seconds
              </p>
            </div>

            <div style={{ marginTop: '1.5rem', paddingTop: '1rem', borderTop: '1px solid #ddd' }}>
              <button
                onClick={handleRunAgain}
                style={{
                  padding: '0.5rem 1.5rem',
                  fontSize: '0.875rem',
                  fontWeight: 'bold',
                  backgroundColor: '#007bff',
                  color: 'white',
                  border: 'none',
                  borderRadius: '4px',
                  cursor: 'pointer',
                }}
              >
                Run Again
              </button>
            </div>
          </div>
        )}

        {isComplete && result && submittedPrediction !== null && (
          <div
            style={{
              marginTop: '2rem',
              padding: '1.5rem',
              border: '1px solid #e8e8e8',
              borderRadius: '8px',
              backgroundColor: '#fefefe',
            }}
          >
            <h3 style={{ marginTop: 0, marginBottom: '1.5rem', fontSize: '1rem', color: '#333' }}>
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
                <p style={{ fontSize: '0.75rem', color: '#666', marginBottom: '0.25rem' }}>
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
                  backgroundColor: '#999',
                  margin: '1.75rem 1rem 0',
                  position: 'relative',
                }}
              >
                <div
                  style={{
                    position: 'absolute',
                    left: '0',
                    top: '-4px',
                    width: '8px',
                    height: '8px',
                    backgroundColor: '#333',
                    borderRadius: '50%',
                  }}
                />
                <div
                  style={{
                    position: 'absolute',
                    right: '0',
                    top: '-4px',
                    width: '8px',
                    height: '8px',
                    backgroundColor: '#333',
                    borderRadius: '50%',
                  }}
                />
              </div>

              <div style={{ textAlign: 'center', flex: '1' }}>
                <p style={{ fontSize: '0.75rem', color: '#666', marginBottom: '0.25rem' }}>
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
                color: '#666',
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
            key={`${result.experimentDuration}-${result.elapsedTime}`}
            predictionSeconds={submittedPrediction}
            actualSeconds={result.elapsedTime}
          />
        )}
      </div>
    </div>
  )
}
