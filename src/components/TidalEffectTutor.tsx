import { useState } from 'react'
import { actualOutcomeFor, labelFor } from './TidalEffectExperiment'
import type { PredictionChoice } from './TidalEffectExperiment'
import { ballPositionsAt } from '../physics/tidalEffectExperiment'
import type { TidalEffectExperimentResult } from '../physics/tidalEffectExperiment'

type TutorStep = 'observe' | 'compare' | 'conceptual' | 'explained'

interface TidalEffectTutorProps {
  planetPrediction: PredictionChoice
  rocketPrediction: PredictionChoice
  result: TidalEffectExperimentResult
  onExplained?: () => void
}

export function TidalEffectTutor({ planetPrediction, rocketPrediction, result, onExplained }: TidalEffectTutorProps) {
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
  const planetFinalSeparation = ballPositionsAt(result, result.timeToFloorSeconds, 'planet')
  const finalSeparationMeters =
    planetFinalSeparation.rightBallOffset - planetFinalSeparation.leftBallOffset

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
              "Look at the two separation graphs. In which cabin did the balls' distance change?"}
            {tutorStep === 'compare' &&
              `You predicted the planet cabin's balls ${labelFor(planetPrediction)}, and the rocket cabin's balls ${labelFor(rocketPrediction)}. What actually happened: the planet cabin's balls ${labelFor(actualOutcomeFor('planet'))}, and the rocket cabin's balls ${labelFor(actualOutcomeFor('rocket'))}. Comparing what you expected to what happened, what do you notice?`}
            {tutorStep === 'conceptual' &&
              'The rocket pushes every part of the cabin the same way, in the same direction. Why might a real planet not do that?'}
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
            <strong>1. A real planet's gravity points toward its center, not in one shared
            direction.</strong> The two balls started {result.initialSeparationMeters.toFixed(1)} m
            apart. Because each ball is pulled toward the same center point, and that center is in
            a very slightly different direction from each ball's own position, the two pulls are
            not quite parallel — so the balls drift toward each other as they fall, ending up only{' '}
            {finalSeparationMeters.toFixed(3)} m apart by the time they land.
          </p>
          <p style={{ marginBottom: '1rem', fontSize: '0.95rem', color: '#333', lineHeight: '1.6' }}>
            <strong>2. A rocket's push has no center to point toward.</strong> Every part of the
            cabin gets shoved in the exact same direction, by the exact same amount, no matter how
            hard the rocket accelerates. So the two balls in the rocket cabin never had any reason
            to drift together or apart — they stayed exactly {result.initialSeparationMeters.toFixed(1)} m
            apart the whole time.
          </p>
          <p style={{ marginBottom: '1rem', fontSize: '0.95rem', color: '#333', lineHeight: '1.6' }}>
            <strong>3. This means the equivalence principle from Experiment 1 only holds exactly
            for a small enough cabin.</strong> A single ball couldn't tell the two cabins apart. Two
            balls, spread far enough apart, can — because only one of the two cabins has a "center"
            for gravity to point toward.
          </p>
          <p style={{ marginBottom: '0', fontSize: '0.95rem', color: '#333', lineHeight: '1.6' }}>
            <strong>4. This convergence is called a tidal effect</strong> — the same kind of effect
            responsible for ocean tides.
          </p>
        </div>
      )}
    </div>
  )
}
