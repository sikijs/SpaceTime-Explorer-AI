import { useState } from 'react'
import { runTwinParadoxExperiment } from '../physics/twinParadoxExperiment'
import type { TwinParadoxResult } from '../physics/twinParadoxExperiment'
import { Experiment10Tutor } from './Experiment10Tutor'

type VelocityOption = 0.1 | 0.3 | 0.5 | 0.8 | 'other'
export type OutcomeChoice = 'sameAge' | 'earthOlder' | 'travelerOlder'

const MIN_CUSTOM_SPEED = 0.01
const MAX_SPEED = 0.9
const DISTANCE_LIGHT_SECONDS = 2

const outcomeChoices: Array<{ value: OutcomeChoice; label: string }> = [
  { value: 'sameAge', label: 'Same age' },
  { value: 'earthOlder', label: 'The Earth twin is older' },
  { value: 'travelerOlder', label: 'The traveling twin is older' },
]

// The traveler is always younger for any v > 0 (v = 0 is not a valid input here — see
// twinParadoxExperiment.ts), so the actual outcome never needs the physics result itself.
export function actualOutcome(): OutcomeChoice {
  return 'travelerOlder'
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

const inputStyle = {
  padding: '0.5rem',
  fontSize: '0.875rem',
  border: '1px solid #ccc',
  borderRadius: '4px',
  width: '200px',
}

interface Experiment10Props {
  onComplete?: () => void
  onTutorComplete?: () => void
}

export function Experiment10({ onComplete, onTutorComplete }: Experiment10Props) {
  const [velocity, setVelocity] = useState<VelocityOption>(0.5)
  const [customVelocity, setCustomVelocity] = useState('')
  const [predictionOutcome, setPredictionOutcome] = useState<OutcomeChoice | null>(null)
  const [submittedOutcome, setSubmittedOutcome] = useState<OutcomeChoice | null>(null)
  const [result, setResult] = useState<TwinParadoxResult | null>(null)

  const selectedVelocity = velocity === 'other' ? parseFloat(customVelocity) : velocity
  const isValid =
    velocity === 'other'
      ? selectedVelocity >= MIN_CUSTOM_SPEED && selectedVelocity <= MAX_SPEED
      : true
  const canCalculate = isValid && predictionOutcome !== null

  const handleReveal = () => {
    if (!canCalculate) return
    setSubmittedOutcome(predictionOutcome)
    setPredictionOutcome(null)
    setResult(runTwinParadoxExperiment(DISTANCE_LIGHT_SECONDS, selectedVelocity))
    onComplete?.()
  }

  return (
    <div style={{ padding: '2rem', maxWidth: '900px', margin: '0 auto' }}>
      <h2>Experiment 10 — The Twin Paradox</h2>

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
            <strong>The question.</strong> Imagine two twins, the same age. One of them boards a
            spaceship and travels away from Earth at a very high speed, turns around, and comes
            back. The other twin just stays home. When the traveling twin gets back, are they
            still the same age?
          </p>
          <p style={{ marginTop: 0, marginBottom: '0.75rem' }}>
            <strong>Why this seems like it shouldn't matter.</strong> You already know, from
            Experiment 3, that a moving clock ticks slower than a clock that isn't moving. So it
            seems easy: the traveling twin's clock is the one that's moving, so they come back
            younger. But here's the catch — motion is relative. While the ship is cruising at a
            constant speed, the twin on the ship could just as fairly say <em>they're</em> holding
            still and it's the Earth twin who is moving away and coming back. By that reasoning,
            the Earth twin should be the younger one instead. Both arguments can't be right at the
            same time. This is called <strong>the twin paradox</strong>, and it isn't really a
            paradox — it's a puzzle with a definite answer, and this chapter shows you why.
          </p>
          <p style={{ marginTop: 0, marginBottom: '0.75rem' }}>
            <strong>What breaks the tie.</strong> There's one thing that isn't the same for both
            twins: only the traveling twin turns around. The Earth twin stays put the whole time.
            That difference — not just "who is moving," but who changes direction — is what
            settles the question, and you're about to see it happen.
          </p>
          <p style={{ marginTop: 0, marginBottom: '0.75rem' }}>
            <strong>What you're about to do.</strong> Choose a speed for the traveling twin's
            trip. Before we calculate the result, make a prediction: when the twins are reunited,
            will they be the same age, will the Earth twin be older, or will the traveling twin be
            older?
          </p>
          <p style={{ marginTop: 0, marginBottom: '0.25rem' }}>
            <strong>What we assume.</strong>
          </p>
          <ul style={{ marginTop: '0.25rem', marginBottom: 0, paddingLeft: '1.25rem' }}>
            <li>There's no gravity involved — just steady motion (same as Experiments 3–9).</li>
            <li>
              The ship travels at a constant speed on the way out, and the same constant speed on
              the way back.
            </li>
            <li>
              We treat the ship's turnaround as instantaneous — happening all at once, rather than
              gradually slowing down and speeding back up. What actually happens during that quick
              turnaround isn't part of this experiment; we only look at before and after it.
            </li>
            <li>Both twins start at exactly the same age when the ship departs.</li>
          </ul>
        </div>

        <div style={{ marginBottom: '2rem' }}>
          <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold' }}>
            Traveler's speed
          </label>
          <p style={{ fontSize: '0.875rem', color: '#555', marginBottom: '0.75rem' }}>
            Speeds are given as a fraction of <strong>c</strong>, the speed of light. The one-way
            distance to the far point is fixed at {DISTANCE_LIGHT_SECONDS} light-seconds.
          </p>

          <div style={{ marginBottom: '1rem' }}>
            {[0.1, 0.3, 0.5, 0.8].map((preset) => (
              <button
                key={preset}
                onClick={() => setVelocity(preset as VelocityOption)}
                style={optionButtonStyle(velocity === preset, false)}
              >
                {preset}c
              </button>
            ))}
            <button onClick={() => setVelocity('other')} style={optionButtonStyle(velocity === 'other', false)}>
              Other
            </button>
          </div>

          {velocity === 'other' && (
            <div style={{ marginBottom: '1rem' }}>
              <input
                type="number"
                min={MIN_CUSTOM_SPEED}
                max={MAX_SPEED}
                step="0.01"
                value={customVelocity}
                onChange={(e) => setCustomVelocity(e.target.value)}
                placeholder={`Fraction of c (${MIN_CUSTOM_SPEED}-${MAX_SPEED})`}
                style={inputStyle}
              />
            </div>
          )}
        </div>

        <div style={{ marginBottom: '2rem' }}>
          <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold' }}>
            Make a prediction
          </label>
          <p style={{ fontSize: '0.875rem', color: '#555', marginBottom: '0.75rem' }}>
            Two twins start at the same age. One stays on Earth. The other travels away at{' '}
            {isValid ? `${selectedVelocity}c` : '—'}, turns around, and comes back at the same
            speed. When they're back together, comparing the same two clocks: are they the same
            age, is the Earth twin older, or is the traveling twin older?
          </p>
          <div style={{ marginBottom: '1rem' }}>
            {outcomeChoices.map((choice) => (
              <button
                key={choice.value}
                onClick={() => setPredictionOutcome(choice.value)}
                style={optionButtonStyle(predictionOutcome === choice.value, false)}
              >
                {choice.label}
              </button>
            ))}
          </div>
          <p style={{ fontSize: '0.75rem', color: '#999', marginTop: '0.5rem' }}>
            {predictionOutcome !== null
              ? `Your prediction: ${outcomeChoices.find((c) => c.value === predictionOutcome)?.label.toLowerCase()}.`
              : submittedOutcome !== null
                ? `Your prediction: ${outcomeChoices.find((c) => c.value === submittedOutcome)?.label.toLowerCase()}.`
                : 'Choose an option to continue'}
          </p>
        </div>

        <button
          onClick={handleReveal}
          disabled={!canCalculate}
          style={{
            padding: '0.75rem 2rem',
            fontSize: '1rem',
            fontWeight: 'bold',
            backgroundColor: canCalculate ? '#28a745' : '#ccc',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: canCalculate ? 'pointer' : 'not-allowed',
            opacity: canCalculate ? 1 : 0.7,
          }}
        >
          CALCULATE
        </button>

        {result && (
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
              <strong>Traveler's speed:</strong> {result.velocity}c
            </p>
            <p style={{ margin: '0.5rem 0', fontSize: '0.875rem' }}>
              <strong>One-way distance:</strong> {result.distance} light-seconds
            </p>

            <div style={{ paddingTop: '1rem', marginTop: '1rem', borderTop: '1px solid #ddd' }}>
              <p style={{ margin: '0.5rem 0', fontSize: '0.875rem' }}>
                <strong>Earth twin's elapsed time:</strong> {result.labElapsedTime.toFixed(3)} seconds
              </p>
              <p style={{ margin: '0.5rem 0', fontSize: '0.875rem' }}>
                <strong>Traveling twin's elapsed time:</strong> {result.travelerElapsedTime.toFixed(3)}{' '}
                seconds
              </p>
              <p style={{ margin: '0.5rem 0', fontSize: '0.875rem' }}>
                <strong>Age difference:</strong> {result.ageDifference.toFixed(3)} seconds
              </p>
              <p style={{ margin: '0.5rem 0', fontSize: '0.875rem' }}>
                <strong>Time dilation factor:</strong> {result.timeDilationFactor.toFixed(3)}
              </p>
            </div>

            {submittedOutcome !== null && (
              <div style={{ paddingTop: '1rem', marginTop: '1rem', borderTop: '1px solid #ddd' }}>
                <p style={{ margin: '0.5rem 0', fontSize: '0.875rem', fontWeight: 'bold' }}>
                  Your prediction
                </p>
                <p style={{ margin: '0.5rem 0', fontSize: '0.875rem' }}>
                  You guessed:{' '}
                  {outcomeChoices.find((c) => c.value === submittedOutcome)?.label.toLowerCase()}.
                  It is actually:{' '}
                  {outcomeChoices.find((c) => c.value === actualOutcome())?.label.toLowerCase()}.
                </p>
              </div>
            )}
          </div>
        )}

        {result && submittedOutcome !== null && (
          <Experiment10Tutor
            result={result}
            predictionOutcome={submittedOutcome}
            onExplained={onTutorComplete}
          />
        )}
      </div>
    </div>
  )
}
