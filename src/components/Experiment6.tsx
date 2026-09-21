import { useState } from 'react'

type VelocityOption = 0.1 | 0.3 | 0.5 | 0.8 | 'other'

// This experiment allows speeds up to 0.9c: the tick of the "same length" clock grows very quickly
// above that (about 50 seconds at 0.99c).
const MIN_SPEED = 0.01
const MAX_SPEED = 0.9

const optionButtonStyle = (selected: boolean) => ({
  marginRight: '0.5rem',
  padding: '0.5rem 1rem',
  backgroundColor: selected ? '#007bff' : '#f0f0f0',
  color: selected ? 'white' : 'black',
  border: '1px solid #ccc',
  borderRadius: '4px',
  cursor: 'pointer',
  fontSize: '0.875rem',
})

const inputStyle = {
  padding: '0.5rem',
  fontSize: '0.875rem',
  border: '1px solid #ccc',
  borderRadius: '4px',
  width: '200px',
}

interface ClockPanelProps {
  title: string
  caption: string
}

// Basic layout only: the drawing and readout are connected to the physics model in a later step.
function ClockPanel({ title, caption }: ClockPanelProps) {
  return (
    <div style={{ textAlign: 'center', flex: '1 1 200px', minWidth: 0 }}>
      <p style={{ fontSize: '0.875rem', color: '#666', marginBottom: '0.5rem', minHeight: '2.5em' }}>
        {title}
      </p>
      <div
        style={{
          backgroundColor: '#d9ecff',
          borderRadius: '6px',
          padding: '0.5rem',
          minHeight: '160px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: '#666',
          fontSize: '0.8125rem',
        }}
      >
        Drawing to come
      </div>
      <p style={{ fontSize: '0.8125rem', color: '#555', marginTop: '0.5rem' }}>{caption}</p>
    </div>
  )
}

interface Experiment6Props {
  onComplete?: () => void
  onTutorComplete?: () => void
}

// onComplete and onTutorComplete are wired up in later steps, when the animation and tutor exist.
export function Experiment6(_props: Experiment6Props) {
  const [velocity, setVelocity] = useState<VelocityOption>(0.5)
  const [customVelocity, setCustomVelocity] = useState('')

  const selectedVelocity = velocity === 'other' ? parseFloat(customVelocity) || 0 : velocity
  const isValid = selectedVelocity >= MIN_SPEED && selectedVelocity <= MAX_SPEED
  const speedLabel = isValid ? `${selectedVelocity}c` : '—'

  return (
    <div style={{ padding: '2rem', maxWidth: '900px', margin: '0 auto' }}>
      <h1>Experiment 6 — Does Motion Change Length?</h1>

      <div
        style={{
          marginTop: '2rem',
          padding: '1.5rem',
          border: '1px solid #ccc',
          borderRadius: '8px',
          backgroundColor: '#f9f9f9',
        }}
      >
        <div style={{ marginBottom: '2rem' }}>
          <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold' }}>
            Moving clock speed
          </label>
          <p style={{ fontSize: '0.875rem', color: '#555', marginBottom: '0.75rem' }}>
            Speeds are given as a fraction of <strong>c</strong>, the speed of light (about 300,000
            km/s). For example, 0.5c means half the speed of light. In this experiment you can
            choose speeds up to {MAX_SPEED}c.
          </p>

          <div style={{ marginBottom: '1rem' }}>
            {[0.1, 0.3, 0.5, 0.8].map((preset) => (
              <button
                key={preset}
                onClick={() => setVelocity(preset as VelocityOption)}
                style={optionButtonStyle(velocity === preset)}
              >
                {preset}c
              </button>
            ))}
            <button onClick={() => setVelocity('other')} style={optionButtonStyle(velocity === 'other')}>
              Other
            </button>
          </div>

          {velocity === 'other' && (
            <div style={{ marginBottom: '1rem' }}>
              <input
                type="number"
                min={MIN_SPEED}
                max={MAX_SPEED}
                step="0.01"
                value={customVelocity}
                onChange={(e) => setCustomVelocity(e.target.value)}
                placeholder={`Fraction of c (${MIN_SPEED}-${MAX_SPEED})`}
                style={inputStyle}
              />
            </div>
          )}

          <p style={{ fontSize: '0.875rem', color: '#666' }}>
            Selected speed: <strong>{speedLabel}</strong>
          </p>
        </div>

        <div>
          <p style={{ fontSize: '0.875rem', color: '#666' }}>
            At rest · Lab time: <strong>0.00 s</strong>
          </p>

          {isValid ? (
            <div
              style={{
                display: 'flex',
                flexWrap: 'wrap',
                justifyContent: 'space-around',
                gap: '1rem',
              }}
            >
              <ClockPanel title="Rest Clock" caption="At rest in the lab" />
              <ClockPanel
                title="Moving Clock, same length"
                caption={`Moving at ${speedLabel} (seen from the lab), along its own length`}
              />
              <ClockPanel
                title="Moving Clock, shorter length"
                caption={`Moving at ${speedLabel} (seen from the lab), along its own length`}
              />
            </div>
          ) : (
            <p style={{ fontSize: '0.875rem', color: '#999' }}>
              Choose a speed between {MIN_SPEED}c and {MAX_SPEED}c to see the clocks.
            </p>
          )}
        </div>
      </div>
    </div>
  )
}
