import { useState } from 'react'
import { actualOutcomeFor, labelFor } from './CurvedSpacetimeExperiment'
import type { PredictionChoice } from './CurvedSpacetimeExperiment'
import { separationAt } from '../physics/curvedSpacetimeExperiment'
import type { CurvedSpacetimeExperimentResult } from '../physics/curvedSpacetimeExperiment'

type TutorStep = 'observe' | 'compare' | 'conceptual' | 'explained'

interface CurvedSpacetimeTutorProps {
  flatPrediction: PredictionChoice
  spherePrediction: PredictionChoice
  result: CurvedSpacetimeExperimentResult
  onExplained?: () => void
}

export function CurvedSpacetimeTutor({
  flatPrediction,
  spherePrediction,
  result,
  onExplained,
}: CurvedSpacetimeTutorProps) {
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
  const finalSphereSeparation = separationAt(result, result.maxDistanceMeters, 'sphere')

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
              'Look at both graphs. On which surface did the distance between the travelers change?'}
            {tutorStep === 'compare' &&
              `You predicted the flat surface's travelers ${labelFor(flatPrediction)}, and the curved surface's travelers ${labelFor(spherePrediction)}. What actually happened: the flat surface's travelers ${labelFor(actualOutcomeFor('flat'))}, and the curved surface's travelers ${labelFor(actualOutcomeFor('sphere'))}. Comparing what you expected to what happened, what do you notice?`}
            {tutorStep === 'conceptual' &&
              'Neither traveler ever turned — both walked as straight as they possibly could, the whole way. What does it mean that they still ended up closer together?'}
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
            <strong>1. On a flat surface, dead-straight paths that start parallel always stay
            parallel.</strong> This matches everyday intuition — it's why the two travelers on the
            flat surface stayed exactly {result.initialSeparationMeters.toFixed(1)} m apart the whole
            way.
          </p>
          <p style={{ marginBottom: '1rem', fontSize: '0.95rem', color: '#333', lineHeight: '1.6' }}>
            <strong>2. On a curved surface, dead-straight (geodesic) paths that start parallel can
            still converge</strong> — purely because the surface itself is curved, not because
            anything pushed them sideways. That's why the two travelers on the sphere, starting the
            same {result.initialSeparationMeters.toFixed(1)} m apart, ended up only{' '}
            {finalSphereSeparation.toFixed(3)} m apart.
          </p>
          <p style={{ marginBottom: '1rem', fontSize: '0.95rem', color: '#333', lineHeight: '1.6' }}>
            <strong>3. Recall Experiment 3:</strong> two falling balls, each moving as straight as
            gravity allows, also converged — for the same reason: the spacetime they move through is
            curved, not flat.
          </p>
          <p style={{ marginBottom: '1rem', fontSize: '0.95rem', color: '#333', lineHeight: '1.6' }}>
            <strong>4. This is what physicists mean by curved spacetime:</strong> gravity's
            pulling-together isn't a sideways force bending the balls' paths — it's evidence that the
            space (spacetime) itself is shaped like the sphere in this experiment, not the flat plane.
          </p>
          <p style={{ marginBottom: '1rem', fontSize: '0.95rem', color: '#333', lineHeight: '1.6' }}>
            <strong>5. A rocket's uniform acceleration, however hard it pushes, moves through flat
            spacetime</strong>, and flat spacetime can never make dead-straight paths converge — which
            is exactly why Experiment 3's rocket balls never drifted together.
          </p>
          <p style={{ marginBottom: '0', fontSize: '0.95rem', color: '#333', lineHeight: '1.6' }}>
            <strong>A note on the sphere:</strong> the sphere here is an analogy, not a literal claim
            about spacetime's shape. Real spacetime curvature is four-dimensional and involves time as
            well as space — this experiment only builds intuition for what "curved" means.
          </p>
        </div>
      )}
    </div>
  )
}
