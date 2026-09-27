import { useState } from 'react'
import { actualOutcome, labelFor, predictionQuestions } from './SpacetimeCurvatureSourceExperiment'
import type { PredictionChoice, PredictionKey } from './SpacetimeCurvatureSourceExperiment'
import type { SpacetimeCurvatureStrengths } from '../physics/spacetimeCurvatureSourceExperiment'

type TutorStep = 'observe' | 'compare' | 'conceptual' | 'explained'

interface SpacetimeCurvatureSourceTutorProps {
  predictions: Record<PredictionKey, PredictionChoice>
  strengths: SpacetimeCurvatureStrengths
  finalCeilingTicks: number
  finalFloorTicks: number
  finalPlanetSeparationMeters: number
  finalRocketSeparationMeters: number
  onExplained?: () => void
}

export function SpacetimeCurvatureSourceTutor({
  predictions,
  strengths,
  finalCeilingTicks,
  finalFloorTicks,
  finalPlanetSeparationMeters,
  finalRocketSeparationMeters,
  onExplained,
}: SpacetimeCurvatureSourceTutorProps) {
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
            {tutorStep === 'observe' &&
              'Look at both panels. When you moved the mass closer, which effect changed more?'}
            {tutorStep === 'compare' && (
              <>
                {predictionQuestions.map((question) => (
                  <span key={question.key} style={{ display: 'block', marginBottom: '0.5rem' }}>
                    <strong>{question.label}:</strong> you predicted it would{' '}
                    {labelFor(predictions[question.key])} — it actually did {labelFor(actual)}.
                  </span>
                ))}
                <span style={{ display: 'block', marginTop: '0.5rem' }}>
                  Comparing what you expected to what happened, what do you notice?
                </span>
              </>
            )}
            {tutorStep === 'conceptual' &&
              'Both effects come from the same mass at the same distance. Why might they not grow at exactly the same rate?'}
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
            <strong>1. Both effects grow with more mass and less distance.</strong> At this mass
            and distance, the time-dilation strength came out to{' '}
            <strong>{strengths.timeDilationStrength.toFixed(3)}</strong> (ceiling clock:{' '}
            {finalCeilingTicks.toFixed(2)} ticks vs. floor clock: {finalFloorTicks.toFixed(2)}{' '}
            ticks) and the convergence strength came out to{' '}
            <strong>{strengths.convergenceStrength.toFixed(3)}</strong> (planet cabin:{' '}
            {finalPlanetSeparationMeters.toFixed(3)} m vs. rocket cabin:{' '}
            {finalRocketSeparationMeters.toFixed(3)} m). Moving the mass closer, or making it
            bigger, always makes both numbers grow.
          </p>
          <p style={{ marginBottom: '1rem', fontSize: '0.95rem', color: '#333', lineHeight: '1.6' }}>
            <strong>2. They don't grow at the same rate.</strong> The tidal effect (Experiment
            3's two balls drifting together) is more sensitive to distance than time dilation is
            — moving the mass closer makes the tidal drift grow much faster than it makes the
            clocks' rates diverge. Both always get stronger together, but not in lockstep.
          </p>
          <p style={{ marginBottom: '1rem', fontSize: '0.95rem', color: '#333', lineHeight: '1.6' }}>
            <strong>3. That's because both are consequences of one thing: how curved spacetime is
            at that location.</strong> Experiment 2's redshift and Experiment 3's tidal drift
            aren't two separate phenomena that happen to both involve gravity — they're two
            different things you can measure about the same underlying curvature, and different
            measurements aren't guaranteed to scale the same way with distance from the mass.
          </p>
          <p style={{ marginBottom: '0', fontSize: '0.95rem', color: '#333', lineHeight: '1.6' }}>
            <strong>4. This connects back to Experiment 4.</strong> The same curved spacetime that
            bent the two travelers' paths together on the sphere is what's doing both jobs here:
            stretching light signals between the floor and ceiling clocks, and pulling the two
            falling balls together. Different symptoms, same underlying cause.
          </p>
        </div>
      )}
    </div>
  )
}
