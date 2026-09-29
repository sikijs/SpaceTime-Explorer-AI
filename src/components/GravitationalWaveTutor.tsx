import { useState } from 'react'

type DirectionChoice = 'same-way' | 'opposite-ways'
type AfterChoice = 'longer' | 'shorter' | 'back-to-original'
type TutorStep = 'observe' | 'compare' | 'conceptual' | 'explained'

interface GravitationalWaveTutorProps {
  directionPrediction: DirectionChoice
  afterPrediction: AfterChoice
  onExplained?: () => void
}

const directionLabels: Record<DirectionChoice, string> = {
  'same-way': 'both arms do the same thing at the same time',
  'opposite-ways': 'the two arms do opposite things',
}

const afterLabels: Record<AfterChoice, string> = {
  longer: 'longer than they started',
  shorter: 'shorter than they started',
  'back-to-original': 'back to their original length',
}

export function GravitationalWaveTutor({
  directionPrediction,
  afterPrediction,
  onExplained,
}: GravitationalWaveTutorProps) {
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
              'What did you notice about the two arms while the wave was passing — did they do the same thing at the same time, or opposite things?'}
            {tutorStep === 'compare' &&
              `You predicted that ${directionLabels[directionPrediction]}. In fact, the two arms always do opposite things — as one stretches, the other squeezes by exactly the same amount. You also predicted the arms would end up ${afterLabels[afterPrediction]}. In fact, both arms always settle back to their original length once the wave has passed. Comparing what you expected to what's actually true, what do you notice?`}
            {tutorStep === 'conceptual' &&
              'Experiment 4 showed that curvature can make straight-as-possible paths drift together, even with nothing pushing on them. How is what you just saw similar — and how is it different?'}
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
            <strong>1. A gravitational wave is a ripple of spacetime curvature that travels</strong>,
            caused by a violently accelerating mass — like two black holes spiraling into each
            other.
          </p>
          <p style={{ marginBottom: '1rem', fontSize: '0.95rem', color: '#333', lineHeight: '1.6' }}>
            <strong>2. As it passes, it stretches one direction while squeezing the perpendicular
            direction, then swaps</strong>, because that's the specific shape — called a
            "polarization" — this kind of curvature ripple takes.
          </p>
          <p style={{ marginBottom: '1rem', fontSize: '0.95rem', color: '#333', lineHeight: '1.6' }}>
            <strong>3. This is the same underlying idea as Experiment 4's converging
            travelers</strong> — a changing separation between free-floating objects, caused by
            curvature and not a force — except now the curvature itself is moving and oscillating,
            rather than staying fixed in place.
          </p>
          <p style={{ marginBottom: '1rem', fontSize: '0.95rem', color: '#333', lineHeight: '1.6' }}>
            <strong>4. This experiment exaggerates the effect enormously</strong>, because the real
            effect is astonishingly small — about a thousandth of a proton's width over a real
            4-kilometer detector arm.
          </p>
          <p style={{ marginBottom: '0', fontSize: '0.95rem', color: '#333', lineHeight: '1.6' }}>
            <strong>5. LIGO actually measured this in 2015</strong>, from two colliding black holes
            1.3 billion light-years away, confirming a prediction Einstein made in 1916, and has
            detected many more collisions since, including one seen by ordinary telescopes at the
            same time.
          </p>
        </div>
      )}
    </div>
  )
}
