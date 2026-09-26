import { useState } from 'react'

type TutorStep = 'observe' | 'compare' | 'conceptual' | 'explained'
type PredictionKind = 'close-to-actual' | 'close-to-lab' | 'other'

interface Experiment3TutorProps {
  onExplained?: () => void
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
  onExplained,
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
      onExplained?.()
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
              'What did you notice? Look at the two clock readings. Did the moving clock show the same time as the lab clock?'}
            {tutorStep === 'compare' &&
              `You guessed that the moving clock would read ${secondsLabel(prediction)}. It really read ${movingClockElapsedTime.toFixed(3)} seconds, while the lab clock read ${observerElapsedTime.toFixed(3)} seconds. Were you surprised?`}
            {tutorStep === 'conceptual' &&
              (isBaseline
                ? "This clock wasn't moving at all. Why do you think the two clocks agree? Think back to Experiment 2."
                : "Why do you think the moving clock measured a different amount of time? What could be different between a clock that is moving and a clock that stands still?")}
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
            With no motion, the "moving" clock stays right beside the lab clock, so the two clocks
            agree. That matches what you found in Experiment 2 for clocks that stand still. This is
            your starting point, or baseline.
          </p>
          <p style={{ marginBottom: '0', fontSize: '0.95rem', color: '#333', lineHeight: '1.6' }}>
            Now choose a speed above 0c and run it again. The clocks will no longer agree, and the
            gap gets bigger as the speed goes up. This difference is called{' '}
            <strong>time dilation</strong>. Experiment 4, the next chapter, shows why it happens.
          </p>
        </div>
      )}

      {tutorStep === 'explained' && !isBaseline && (
        <div>
          {predictionKind === 'close-to-actual' && (
            <p style={{ marginBottom: '1rem', fontSize: '0.95rem', color: '#333', lineHeight: '1.6' }}>
              Great! You sensed that motion and time are connected. Let's find out why that
              happens.
            </p>
          )}
          {predictionKind === 'close-to-lab' && (
            <p style={{ marginBottom: '1rem', fontSize: '0.95rem', color: '#333', lineHeight: '1.6' }}>
              That's really interesting. Most people think both clocks would measure the same time,
              so you're not alone. But this experiment shows something surprising about time
              itself.
            </p>
          )}
          <p style={{ marginBottom: '1rem', fontSize: '0.95rem', color: '#333', lineHeight: '1.6' }}>
            This effect is called <strong>time dilation</strong>. It is one of the most surprising
            ideas in relativity. A moving clock, a perfectly good clock, measures less time than
            the lab measures between the same two events: the start and the end of the run. It
            isn't broken. It is how time works when things move fast relative to each other.
          </p>
          <p style={{ marginBottom: '1rem', fontSize: '0.95rem', color: '#333', lineHeight: '1.6' }}>
            At {velocity}c, the moving clock measured {movingClockElapsedTime.toFixed(3)} seconds
            while the lab clock measured {observerElapsedTime.toFixed(3)} seconds. That is{' '}
            {timeDilationFactor.toFixed(3)} of the lab time.
          </p>
          <p style={{ marginBottom: '1rem', fontSize: '0.95rem', color: '#333', lineHeight: '1.6' }}>
            <strong>About the formula.</strong> The rule is{' '}
            <code>Δt_moving = Δt_lab × √(1 − v²)</code>. In plain words: take the lab time,
            multiply it by a "shrinking factor," and you get the moving clock's time. Here,{' '}
            <code>v</code> is the clock's speed written as a fraction of light speed — so a clock
            at 60% of light speed is just <code>v = 0.6</code>. We write speed this way because
            light speed is a universal limit, so every possible speed lands somewhere between 0
            and 1.
          </p>
          <p style={{ marginBottom: '1rem', fontSize: '0.95rem', color: '#333', lineHeight: '1.6' }}>
            The shrinking factor, <code>√(1 − v²)</code>, works like a dial. At <code>v = 0</code>{' '}
            (no motion at all), the factor is exactly 1 — nothing shrinks, and the moving clock
            agrees with the lab clock, just like the two clocks you compared in Experiment 2. As{' '}
            <code>v</code> climbs toward 1 (closer to light speed), <code>v²</code> climbs too, so{' '}
            <code>1 − v²</code> shrinks toward 0 — and so does its square root. That means the
            factor gets smaller and smaller the faster the clock moves, so the moving clock's
            reading shrinks more and more compared to the lab's. It never quite reaches 0, because{' '}
            <code>v</code> always stays below 1 — the clock never quite reaches light speed.
          </p>
          <p style={{ marginBottom: '1rem', fontSize: '0.95rem', color: '#333', lineHeight: '1.6' }}>
            <strong>Your numbers.</strong> At {velocity}c: first,{' '}
            <code>
              1 − v² = 1 − {(velocity * velocity).toFixed(2)} ={' '}
              {(1 - velocity * velocity).toFixed(3)}
            </code>
            . Then take the square root:{' '}
            <code>
              √{(1 - velocity * velocity).toFixed(3)} = {timeDilationFactor.toFixed(3)}
            </code>{' '}
            — that's your shrinking factor. Multiply it by the lab time:{' '}
            <code>
              {observerElapsedTime.toFixed(3)} × {timeDilationFactor.toFixed(3)} ={' '}
              {movingClockElapsedTime.toFixed(3)}
            </code>{' '}
            seconds — exactly what the moving clock read.
          </p>
          <p style={{ marginBottom: '0', fontSize: '0.95rem', color: '#333', lineHeight: '1.6' }}>
            This is a basic fact of relativity: the time that passes between two events depends on
            who is measuring (their reference frame) and how they are moving. Experiment 4, the next
            chapter, shows why it happens.
          </p>
        </div>
      )}
    </div>
  )
}
