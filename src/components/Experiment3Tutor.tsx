import { useState } from 'react'

type TutorStep = 'observe' | 'compare' | 'conceptual' | 'explained'
type PredictionKind = 'close-to-actual' | 'close-to-lab' | 'other'

interface Experiment3TutorProps {
  velocity: number
  prediction: number
  observerElapsedTime: number
  movingClockElapsedTime: number
  timeDilationFactor: number
  timeDifferential: number
}

function secondsLabel(value: number): string {
  return `${value} ${value === 1 ? 'second' : 'seconds'}`
}

// Compares the prediction with the two measured values, using half the size of the effect as the margin.
function classifyPrediction(
  prediction: number,
  observerElapsedTime: number,
  movingClockElapsedTime: number,
  timeDifferential: number
): PredictionKind {
  const margin = timeDifferential / 2
  if (Math.abs(prediction - movingClockElapsedTime) <= margin) return 'close-to-actual'
  if (Math.abs(prediction - observerElapsedTime) <= margin) return 'close-to-lab'
  return 'other'
}

export function Experiment3Tutor({
  velocity,
  prediction,
  observerElapsedTime,
  movingClockElapsedTime,
  timeDilationFactor,
  timeDifferential,
}: Experiment3TutorProps) {
  const [tutorStep, setTutorStep] = useState<TutorStep>('observe')
  const [responseInput, setResponseInput] = useState('')

  const handleContinue = () => {
    if (responseInput.trim() === '') return

    if (tutorStep === 'observe') {
      setTutorStep('compare')
    } else if (tutorStep === 'compare') {
      setTutorStep('conceptual')
    } else if (tutorStep === 'conceptual') {
      setTutorStep('explained')
    }
    setResponseInput('')
  }

  const isResponseEmpty = responseInput.trim() === ''
  // At 0c the clock does not move, so the two clocks agree and there is no effect to explain.
  const isBaseline = timeDifferential === 0
  const predictionKind = classifyPrediction(
    prediction,
    observerElapsedTime,
    movingClockElapsedTime,
    timeDifferential
  )

  return (
    <div
      style={{
        marginTop: '2rem',
        padding: '1.5rem',
        border: '1px solid #d9e8f5',
        borderRadius: '8px',
        backgroundColor: '#f0f7ff',
      }}
    >
      <h2 style={{ marginTop: 0, marginBottom: '1rem', fontSize: '1.125rem', color: '#0066cc' }}>
        Let's reflect on what you observed
      </h2>

      {(tutorStep === 'observe' || tutorStep === 'compare' || tutorStep === 'conceptual') && (
        <div>
          <p style={{ marginBottom: '1rem', fontSize: '0.95rem', color: '#333' }}>
            {tutorStep === 'observe' &&
              'What did you observe? Look at the two clock readings. Did the moving clock measure the same time as the lab clock?'}
            {tutorStep === 'compare' &&
              `You predicted the moving clock would read ${secondsLabel(prediction)}. It actually read ${movingClockElapsedTime.toFixed(3)} seconds, while the lab clock read ${observerElapsedTime.toFixed(3)} seconds. Were you surprised?`}
            {tutorStep === 'conceptual' &&
              (isBaseline
                ? "This clock wasn't moving at all. Why do you think the two clocks agree? Think back to Experiment 2."
                : "Why do you think the moving clock measured a different amount of time? What could be different between a clock that's moving and a clock that's stationary?")}
          </p>

          <textarea
            value={responseInput}
            onChange={(e) => setResponseInput(e.target.value)}
            placeholder="Type your thoughts here..."
            style={{
              width: '100%',
              minHeight: '100px',
              padding: '0.75rem',
              fontSize: '0.875rem',
              border: '1px solid #ccc',
              borderRadius: '4px',
              fontFamily: 'inherit',
              resize: 'vertical',
            }}
          />

          <button
            onClick={handleContinue}
            disabled={isResponseEmpty}
            style={{
              marginTop: '0.75rem',
              padding: '0.5rem 1.5rem',
              fontSize: '0.875rem',
              fontWeight: 'bold',
              backgroundColor: isResponseEmpty ? '#ccc' : '#0066cc',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: isResponseEmpty ? 'not-allowed' : 'pointer',
              opacity: isResponseEmpty ? 0.6 : 1,
            }}
          >
            Continue
          </button>
        </div>
      )}

      {tutorStep === 'explained' && isBaseline && (
        <div>
          <p style={{ marginBottom: '1rem', fontSize: '0.95rem', color: '#333', lineHeight: '1.6' }}>
            With no motion, the "moving" clock stays beside the lab clock, so the two clocks agree.
            That matches what you found in Experiment 2 for clocks at rest. This is your baseline.
          </p>
          <p style={{ marginBottom: '0', fontSize: '0.95rem', color: '#333', lineHeight: '1.6' }}>
            Now choose a speed above 0c and run it again. The clocks will no longer agree, and the
            gap grows with speed. Experiment 4, the next chapter, shows why.
          </p>
        </div>
      )}

      {tutorStep === 'explained' && !isBaseline && (
        <div>
          {predictionKind === 'close-to-actual' && (
            <p style={{ marginBottom: '1rem', fontSize: '0.95rem', color: '#333', lineHeight: '1.6' }}>
              Great! You intuited that motion and time are connected. Let's explore why that
              happens.
            </p>
          )}
          {predictionKind === 'close-to-lab' && (
            <p style={{ marginBottom: '1rem', fontSize: '0.95rem', color: '#333', lineHeight: '1.6' }}>
              That's really interesting. Most people intuitively think both clocks measure the same
              time, so you're not alone. But this experiment suggests something surprising about the
              nature of time itself.
            </p>
          )}
          <p style={{ marginBottom: '1rem', fontSize: '0.95rem', color: '#333', lineHeight: '1.6' }}>
            This is one of the most counterintuitive ideas in relativity. A moving clock, a
            perfectly good clock, measures less time than the lab measures between the same two
            events: the start and the end of the run. It isn't broken. It's how time works when
            things move fast relative to each other.
          </p>
          <p style={{ marginBottom: '1rem', fontSize: '0.95rem', color: '#333', lineHeight: '1.6' }}>
            At {velocity}c, the moving clock measured {movingClockElapsedTime.toFixed(3)} seconds
            while the lab clock measured {observerElapsedTime.toFixed(3)} seconds. That is{' '}
            {timeDilationFactor.toFixed(3)} of the lab time.
          </p>
          <p style={{ marginBottom: '0', fontSize: '0.95rem', color: '#333', lineHeight: '1.6' }}>
            This is a fundamental property of relativity: the elapsed time between events depends
            on the observer's reference frame and on motion. Experiment 4, the next chapter, shows
            why it happens.
          </p>
        </div>
      )}
    </div>
  )
}
