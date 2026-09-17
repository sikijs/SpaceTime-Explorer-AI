import { useState } from 'react'
import { runClockExperiment } from '../physics/clockExperiment'
import type { ClockExperimentResult } from '../physics/clockExperiment'

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
  const [status, setStatus] = useState<ExperimentStatus>('idle')
  const [result, setResult] = useState<ClockExperimentResult | null>(null)

  const selectedDuration = duration === 'other' ? parseInt(customDuration) || 0 : duration
  const isRunning = status === 'running'
  const isComplete = status === 'complete'

  const clockDisplay = isComplete && result ? formatClockReading(result.finalClockReading) : '00:00:00'
  const statusLabel = isRunning ? 'Running...' : 'At rest'

  const handleStart = () => {
    setStatus('running')
    const experimentResult = runClockExperiment(selectedDuration)
    setResult(experimentResult)
    setStatus('complete')
  }

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

        <button
          onClick={handleStart}
          disabled={isRunning}
          style={{
            padding: '0.75rem 2rem',
            fontSize: '1rem',
            fontWeight: 'bold',
            backgroundColor: isRunning ? '#6c757d' : '#28a745',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: isRunning ? 'not-allowed' : 'pointer',
            opacity: isRunning ? 0.7 : 1,
          }}
        >
          {isRunning ? 'Running...' : 'START'}
        </button>
      </div>
    </div>
  )
}
