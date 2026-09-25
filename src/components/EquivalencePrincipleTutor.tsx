import { useState } from 'react'
import { actualOutcome, labelFor } from './EquivalencePrincipleExperiment'
import type { PredictionChoice } from './EquivalencePrincipleExperiment'
import type { EquivalencePrincipleExperimentResult } from '../physics/equivalencePrincipleExperiment'

type TutorStep = 'observe' | 'compare' | 'conceptual' | 'explained'

interface EquivalencePrincipleTutorProps {
  predictionChoice: PredictionChoice
  result: EquivalencePrincipleExperimentResult
  onExplained?: () => void
}

export function EquivalencePrincipleTutor({ predictionChoice, result, onExplained }: EquivalencePrincipleTutorProps) {
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
  const actual = actualOutcome()

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
            {tutorStep === 'observe' && 'Look at the two graphs. Are they the same, or different?'}
            {tutorStep === 'compare' &&
              `You predicted the ball would move ${labelFor(predictionChoice)} in the two cabins. It actually moved ${labelFor(actual)}. Comparing what you expected to what happened, what do you notice?`}
            {tutorStep === 'conceptual' &&
              'If you were sealed inside one of these cabins with no windows, could you have figured out which one you were in, just from watching the ball?'}
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

      {tutorStep === 'explained' && (
        <div>
          <p style={{ marginBottom: '1rem', fontSize: '0.95rem', color: '#333', lineHeight: '1.6' }}>
            <strong>1. Both cabins were worked out using the exact same math.</strong> To figure
            out where the ball would be at each moment, we didn't write one equation for "gravity
            pulls the ball down" and a separate, different-looking equation for "the rocket
            pushes the floor up." We used a single equation, plugged in the same acceleration
            both times, and that's genuinely all there was to it. That's why the ball took the
            same {result.timeToFloorSeconds.toFixed(2)} seconds to reach the floor in Cabin A as
            it did in Cabin B — not roughly the same, but exactly the same, down to the last
            decimal place, because the calculation itself never had a way to know which cabin it
            was supposed to be describing. Think of it like a recipe that never mentions the name
            of the kitchen it's cooked in: run the same recipe twice, in two different kitchens,
            and you get the same dish both times. Here, the "recipe" is the math, and the two
            "kitchens" are gravity and acceleration.
          </p>
          <p style={{ marginBottom: '1rem', fontSize: '0.95rem', color: '#333', lineHeight: '1.6' }}>
            <strong>2. This is called the equivalence principle.</strong> Being at rest in a
            gravitational field, and accelerating through empty space with no gravity at all,
            produce exactly the same local effects. A local experiment — one confined entirely
            inside the sealed cabin — can't tell them apart.
          </p>
          <p style={{ marginBottom: '0', fontSize: '0.95rem', color: '#333', lineHeight: '1.6' }}>
            <strong>3. This is where Einstein started.</strong> If gravity and acceleration are
            genuinely indistinguishable, gravity might not be an ordinary force at all, but
            something about the shape of space and time itself — a question later experiments in
            this chapter will take up.
          </p>
        </div>
      )}
    </div>
  )
}
