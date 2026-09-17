import { useState } from 'react'

type DurationOption = 5 | 10 | 20 | 30 | 'other'

export function Experiment1() {
  const [duration, setDuration] = useState<DurationOption>(10)
  const [customDuration, setCustomDuration] = useState('')

  const selectedDuration = duration === 'other' ? parseInt(customDuration) || 0 : duration

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
          <p style={{ fontSize: '0.875rem', color: '#666' }}>At rest</p>
          <div
            style={{
              fontSize: '3rem',
              fontFamily: 'monospace',
              fontWeight: 'bold',
              marginBottom: '1rem',
            }}
          >
            00:00:00
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
                style={{
                  marginRight: '0.5rem',
                  padding: '0.5rem 1rem',
                  backgroundColor: duration === preset ? '#007bff' : '#f0f0f0',
                  color: duration === preset ? 'white' : 'black',
                  border: '1px solid #ccc',
                  borderRadius: '4px',
                  cursor: 'pointer',
                  fontSize: '0.875rem',
                }}
              >
                {preset}s
              </button>
            ))}
          </div>

          <div style={{ marginBottom: '1rem' }}>
            <button
              onClick={() => setDuration('other')}
              style={{
                padding: '0.5rem 1rem',
                backgroundColor: duration === 'other' ? '#007bff' : '#f0f0f0',
                color: duration === 'other' ? 'white' : 'black',
                border: '1px solid #ccc',
                borderRadius: '4px',
                cursor: 'pointer',
                fontSize: '0.875rem',
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
                placeholder="Enter seconds (1-60)"
                style={{
                  padding: '0.5rem',
                  fontSize: '0.875rem',
                  border: '1px solid #ccc',
                  borderRadius: '4px',
                  width: '200px',
                }}
              />
            </div>
          )}

          <p style={{ fontSize: '0.875rem', color: '#666' }}>
            Selected duration: <strong>{selectedDuration || '—'} seconds</strong>
          </p>
        </div>

        <button
          style={{
            padding: '0.75rem 2rem',
            fontSize: '1rem',
            fontWeight: 'bold',
            backgroundColor: '#28a745',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer',
          }}
        >
          START
        </button>
      </div>
    </div>
  )
}
