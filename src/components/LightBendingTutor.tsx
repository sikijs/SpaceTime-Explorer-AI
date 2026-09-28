import { useState } from 'react'
import type { LightBendingResult } from '../physics/lightBendingExperiment'

type TutorStep = 'observe' | 'compare' | 'conceptual' | 'explained'
type YesNoChoice = 'yes' | 'no'
type MoreLessSameChoice = 'more' | 'less' | 'same'

interface LightBendingTutorProps {
  bentPrediction: YesNoChoice
  closerPrediction: MoreLessSameChoice
  realVsSimPrediction: MoreLessSameChoice
  result: LightBendingResult
  onExplained?: () => void
}

function moreLessSameText(choice: MoreLessSameChoice): string {
  if (choice === 'more') return 'more'
  if (choice === 'less') return 'less'
  return 'about the same'
}

function outcomeText(outcome: LightBendingResult['outcome']): string {
  return outcome === 'deflects' ? 'bent, but kept going past the mass' : 'fell into the mass'
}

export function LightBendingTutor({
  bentPrediction,
  closerPrediction,
  realVsSimPrediction,
  result,
  onExplained,
}: LightBendingTutorProps) {
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
              `What happened to the light's path as it passed the mass — did it stay straight, or bend? (It ${outcomeText(result.outcome)}.)`}
            {tutorStep === 'compare' &&
              `You predicted light passing near, but not at, the mass ${bentPrediction === 'yes' ? 'would' : 'would not'} bend from a straight line — in fact, yes, it does bend. You predicted aiming closer would bend the light ${moreLessSameText(closerPrediction)} — in fact, aiming closer always bends it more. You also predicted the real universe bends starlight ${moreLessSameText(realVsSimPrediction)} compared to what ordinary gravity alone predicts — in fact, the real universe bends it more, by exactly double. Comparing what you expected to what's actually true, what do you notice?`}
            {tutorStep === 'conceptual' &&
              'This simulation calculated one bending angle using ordinary gravity. Do you think that\'s the same amount the real universe bends light by?'}
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
            <strong>1. Light passing near a mass is bent from a straight line</strong>, more so the
            closer it passes — connecting to Experiment 4's "as straight as possible path"
            (geodesic) idea, now applied to something with no mass at all.
          </p>
          <p style={{ marginBottom: '1rem', fontSize: '0.95rem', color: '#333', lineHeight: '1.6' }}>
            <strong>2. This experiment's simulation calculates that bending using the same
            ordinary, first-order gravity</strong> as the rest of this chapter, treating light as a
            fast-moving particle.
          </p>
          <p style={{ marginBottom: '1rem', fontSize: '0.95rem', color: '#333', lineHeight: '1.6' }}>
            <strong>3. The real universe bends light exactly twice as much</strong>, because real
            gravity (general relativity) doesn't just pull light off a straight path — it also
            curves space itself, and light's path has to follow that curved space too, an effect
            this simulation's engine doesn't include.
          </p>
          <p style={{ marginBottom: '1rem', fontSize: '0.95rem', color: '#333', lineHeight: '1.6' }}>
            <strong>4. This doubling is not a minor detail</strong> — it is exactly what a 1919
            solar eclipse expedition, led by the astronomer Arthur Eddington, measured: starlight
            passing near the eclipsed Sun bent by the larger, doubled amount, not the smaller,
            ordinary-gravity amount, which is what first convinced the world that Einstein's
            general relativity, not Newton's gravity, was correct.
          </p>
          <p style={{ marginBottom: '0', fontSize: '0.95rem', color: '#333', lineHeight: '1.6' }}>
            <strong>5. Light bending by mass, called gravitational lensing, is now a routine,
            actively used astronomical tool</strong> — for example, to map matter that can't be seen
            directly and to find distant galaxies too faint to see any other way.
          </p>
        </div>
      )}
    </div>
  )
}
