import { useEffect, useState } from 'react'
import { runTwoClockExperiment } from '../physics/twoClockExperiment'
import type { TwoClockExperimentResult } from '../physics/twoClockExperiment'
import { Experiment2Tutor } from './Experiment2Tutor'

type DurationOption = 5 | 10 | 20 | 30 | 'other'
type ExperimentStatus = 'idle' | 'running' | 'complete'

function formatClockReading(seconds: number): string {
  const hours = Math.floor(seconds / 3600)
  const minutes = Math.floor((seconds % 3600) / 60)
  const secs = seconds % 60
  return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
}

interface Experiment2Props {
  onComplete?: () => void
}

export function Experiment2({ onComplete }: Experiment2Props) {
  const [duration, setDuration] = useState<DurationOption>(10)
  const [customDuration, setCustomDuration] = useState('')
  const [predictionA, setPredictionA] = useState('')
  const [predictionB, setPredictionB] = useState('')
  const [submittedPredictionA, setSubmittedPredictionA] = useState<number | null>(null)
  const [submittedPredictionB, setSubmittedPredictionB] = useState<number | null>(null)
  const [status, setStatus] = useState<ExperimentStatus>('idle')
  const [result, setResult] = useState<TwoClockExperimentResult | null>(null)
  const [displayedSecondsA, setDisplayedSecondsA] = useState(0)
  const [displayedSecondsB, setDisplayedSecondsB] = useState(0)

  const selectedDuration = duration === 'other' ? parseInt(customDuration) || 0 : duration
  const isRunning = status === 'running'
  const isComplete = status === 'complete'

  const predictionAValue = predictionA.trim() ? Number(predictionA) : null
  const predictionBValue = predictionB.trim() ? Number(predictionB) : null
  const hasPredictions = predictionAValue !== null && isFinite(predictionAValue) &&
                         predictionBValue !== null && isFinite(predictionBValue)

  const clockDisplayA = formatClockReading(displayedSecondsA)
  const clockDisplayB = formatClockReading(displayedSecondsB)
  const statusLabel = isRunning ? 'Running...' : 'At rest'

  const handleStart = () => {
    if (!hasPredictions) return
    setSubmittedPredictionA(predictionAValue)
    setSubmittedPredictionB(predictionBValue)
    setPredictionA('')
    setPredictionB('')
    setDisplayedSecondsA(0)
    setDisplayedSecondsB(0)
    setStatus('running')
    const experimentResult = runTwoClockExperiment(selectedDuration)
    setResult(experimentResult)
  }

  const handleRunAgain = () => {
    setStatus('idle')
    setResult(null)
    setSubmittedPredictionA(null)
    setSubmittedPredictionB(null)
    setDisplayedSecondsA(0)
    setDisplayedSecondsB(0)
  }

  useEffect(() => {
    if (status !== 'running' || !result) return

    const animationDurationMs = 2000
    const startTime = performance.now()
    let frameId: number

    const animate = (currentTime: number) => {
      const elapsed = currentTime - startTime
      const progress = Math.min(elapsed / animationDurationMs, 1)
      const newDisplayedSeconds = Math.floor(progress * result.elapsedTimeA)
      setDisplayedSecondsA(newDisplayedSeconds)
      setDisplayedSecondsB(newDisplayedSeconds)

      if (progress >= 1) {
        setDisplayedSecondsA(result.elapsedTimeA)
        setDisplayedSecondsB(result.elapsedTimeB)
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
    <div style={{ padding: '2rem', maxWidth: '700px', margin: '0 auto' }}>
      <h1>Experiment 2 — Two Clocks at Rest</h1>

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
            <strong>The question.</strong> In Experiment 1, one clock measured elapsed time. If we
            use two clocks in two different places, will they agree?
          </p>
          <p style={{ marginTop: 0, marginBottom: '0.75rem' }}>
            <strong>What happens.</strong> Clock A and Clock B sit at different places. Both are
            still, and both read 00:00:00 when the experiment starts. You choose how long the
            experiment runs. When the time is up, we read both clocks.
          </p>
          <div
            style={{
              marginBottom: '0.75rem',
              padding: '0.75rem 1rem',
              borderLeft: '4px solid #6a9fd8',
              backgroundColor: '#eef4fb',
            }}
          >
            <p style={{ marginTop: 0, marginBottom: '0.5rem' }}>
              <strong>New term: reference frame.</strong>
            </p>
            <p style={{ marginTop: 0, marginBottom: '0.5rem' }}>
              In everyday life we treat time as one thing. If you ask "what time is it?", we expect
              one answer that holds for everyone, and we rarely notice that we are assuming it. In
              these experiments we do not assume it. We check it, using clocks.
            </p>
            <p style={{ marginTop: 0, marginBottom: '0.5rem' }}>
              To check it, we need to say who is doing the measuring. A <strong>reference frame</strong>{' '}
              is a group of observers and clocks that are all at rest relative to one another. None
              of them is moving with respect to the others, so the distances between them do not
              change.
            </p>
            <p style={{ marginTop: 0, marginBottom: '0.5rem' }}>
              For example, imagine a room. Some clocks are fixed at different places in the room,
              and some people are sitting still in the room. None of them is moving relative to the
              others, so together they make up one reference frame.
            </p>
            <p style={{ marginTop: 0, marginBottom: '0.5rem' }}>
              Clock A and Clock B are like the clocks in that room. Neither one is moving relative
              to the other, so both clocks are in one reference frame.
            </p>
            <p style={{ marginTop: 0, marginBottom: 0 }}>
              Later, when a clock moves, we will compare it with clocks in a frame like this one.
            </p>
          </div>
          <p style={{ marginTop: 0, marginBottom: '0.75rem' }}>
            <strong>Your job.</strong> Predict what each clock will read at the end. Your
            predictions are not scored.
          </p>
          <p style={{ marginTop: 0, marginBottom: '0.25rem' }}>
            <strong>What we assume.</strong>
          </p>
          <ul style={{ marginTop: 0, marginBottom: 0, paddingLeft: '1.25rem' }}>
            <li>Neither clock moves, and there is no gravity.</li>
            <li>Both clocks start together, set to the same reading, and both are at rest.</li>
            <li>
              The animation may play faster than real time so you do not have to wait. This does
              not change the result.
            </li>
          </ul>
        </div>

        <div style={{ marginBottom: '2rem' }}>
          <p style={{ fontSize: '0.875rem', color: '#666' }}>{statusLabel}</p>

          <div
            style={{
              display: 'flex',
              justifyContent: 'space-around',
              gap: '2rem',
              marginBottom: '2rem',
            }}
          >
            <div style={{ textAlign: 'center' }}>
              <p style={{ fontSize: '0.875rem', color: '#666', marginBottom: '0.5rem' }}>
                Clock A
              </p>
              <div
                style={{
                  fontSize: '2.5rem',
                  fontFamily: 'monospace',
                  fontWeight: 'bold',
                  padding: '1rem',
                  backgroundColor: '#d9ecff',
                  borderRadius: '6px',
                  minWidth: '150px',
                  textAlign: 'center',
                }}
              >
                {clockDisplayA}
              </div>
            </div>

            <div style={{ textAlign: 'center' }}>
              <p style={{ fontSize: '0.875rem', color: '#666', marginBottom: '0.5rem' }}>
                Clock B
              </p>
              <div
                style={{
                  fontSize: '2.5rem',
                  fontFamily: 'monospace',
                  fontWeight: 'bold',
                  padding: '1rem',
                  backgroundColor: '#d9ecff',
                  borderRadius: '6px',
                  minWidth: '150px',
                  textAlign: 'center',
                }}
              >
                {clockDisplayB}
              </div>
            </div>
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
            Make predictions
          </label>
          <p style={{ fontSize: '0.875rem', color: '#555', marginBottom: '1rem' }}>
            The experiment will run for {selectedDuration} seconds. What do you predict each clock will read?
          </p>

          <div style={{ marginBottom: '1rem' }}>
            <label style={{ display: 'block', fontSize: '0.875rem', marginBottom: '0.25rem', fontWeight: 'bold' }}>
              Clock A prediction (seconds)
            </label>
            <input
              type="number"
              value={predictionA}
              onChange={(e) => setPredictionA(e.target.value)}
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
          </div>

          <div style={{ marginBottom: '1rem' }}>
            <label style={{ display: 'block', fontSize: '0.875rem', marginBottom: '0.25rem', fontWeight: 'bold' }}>
              Clock B prediction (seconds)
            </label>
            <input
              type="number"
              value={predictionB}
              onChange={(e) => setPredictionB(e.target.value)}
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
          </div>

          <p style={{ fontSize: '0.75rem', color: '#999' }}>
            {hasPredictions
              ? `Predictions: Clock A: ${predictionAValue}s, Clock B: ${predictionBValue}s`
              : 'Enter predictions for both clocks to continue'}
          </p>
        </div>

        <button
          onClick={handleStart}
          disabled={isRunning || !hasPredictions}
          style={{
            padding: '0.75rem 2rem',
            fontSize: '1rem',
            fontWeight: 'bold',
            backgroundColor:
              isRunning ? '#6c757d' : hasPredictions ? '#28a745' : '#ccc',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: isRunning || !hasPredictions ? 'not-allowed' : 'pointer',
            opacity: isRunning || !hasPredictions ? 0.7 : 1,
          }}
        >
          {isRunning ? 'Running...' : 'START'}
        </button>

        {isComplete && result && submittedPredictionA !== null && submittedPredictionB !== null && (
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

            <div style={{ marginBottom: '1.5rem' }}>
              <p style={{ margin: '0.5rem 0', fontSize: '0.875rem' }}>
                <strong>Clock A elapsed time:</strong> {result.elapsedTimeA} seconds
              </p>
              <p style={{ margin: '0.5rem 0', fontSize: '0.875rem' }}>
                <strong>Clock B elapsed time:</strong> {result.elapsedTimeB} seconds
              </p>
            </div>

            <div style={{ marginBottom: '1.5rem', paddingTop: '1rem', borderTop: '1px solid #ddd' }}>
              <p style={{ margin: '0.5rem 0', fontSize: '0.875rem' }}>
                <strong>Your prediction for Clock A:</strong> {submittedPredictionA} seconds
              </p>
              <p style={{ margin: '0.5rem 0', fontSize: '0.875rem' }}>
                <strong>Actual Clock A:</strong> {result.elapsedTimeA} seconds
              </p>
            </div>

            <div style={{ marginBottom: '1.5rem', paddingBottom: '1rem', borderBottom: '1px solid #ddd' }}>
              <p style={{ margin: '0.5rem 0', fontSize: '0.875rem' }}>
                <strong>Your prediction for Clock B:</strong> {submittedPredictionB} seconds
              </p>
              <p style={{ margin: '0.5rem 0', fontSize: '0.875rem' }}>
                <strong>Actual Clock B:</strong> {result.elapsedTimeB} seconds
              </p>
            </div>

            <div style={{ marginBottom: '1rem' }}>
              <p style={{ margin: '0.5rem 0', fontSize: '0.875rem' }}>
                <strong>Difference between clocks:</strong> {result.difference} seconds
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

        {isComplete && result && submittedPredictionA !== null && submittedPredictionB !== null && (
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
                <div style={{ fontSize: '0.85rem', fontFamily: 'monospace', fontWeight: 'bold', marginBottom: '0.25rem' }}>
                  Clock A: {formatClockReading(result.startEvent.clockReadingA)}
                </div>
                <div style={{ fontSize: '0.85rem', fontFamily: 'monospace', fontWeight: 'bold' }}>
                  Clock B: {formatClockReading(result.startEvent.clockReadingB)}
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
                <div style={{ fontSize: '0.85rem', fontFamily: 'monospace', fontWeight: 'bold', marginBottom: '0.25rem' }}>
                  Clock A: {formatClockReading(result.endEvent.clockReadingA)}
                </div>
                <div style={{ fontSize: '0.85rem', fontFamily: 'monospace', fontWeight: 'bold' }}>
                  Clock B: {formatClockReading(result.endEvent.clockReadingB)}
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
              <strong>elapsed time (both clocks):</strong> {result.elapsedTimeA} seconds
            </p>
          </div>
        )}

        {isComplete && result && submittedPredictionA !== null && submittedPredictionB !== null && (
          <Experiment2Tutor
            key={`${result.experimentDuration}-${result.elapsedTimeA}`}
            predictionA={submittedPredictionA}
            predictionB={submittedPredictionB}
            actualA={result.elapsedTimeA}
            actualB={result.elapsedTimeB}
          />
        )}
      </div>
    </div>
  )
}
