import { useState } from 'react'

type TutorStep = 'observe' | 'compare' | 'conceptual' | 'explained'

interface Experiment4TutorProps {
  velocity: number
  prediction: number
  restTickDuration: number
  movingTickDuration: number
  timeDilationFactor: number
}

export function Experiment4Tutor({
  velocity,
  prediction,
  restTickDuration,
  movingTickDuration,
  timeDilationFactor,
}: Experiment4TutorProps) {
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
            {tutorStep === 'observe' && 'What did you notice about the two light paths?'}
            {tutorStep === 'compare' &&
              `You predicted one tick of the moving clock would take ${prediction} seconds. In lab time it actually took ${movingTickDuration.toFixed(3)} seconds, compared with ${restTickDuration.toFixed(3)} seconds for the rest clock. What does that tell you?`}
            {tutorStep === 'conceptual' &&
              'Both light pulses travelled at the same speed. One of them had farther to go. What does that mean for the time it takes?'}
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
            In the lab, the moving clock slides sideways while its light pulse travels between the
            mirrors. So the pulse does not go straight up and down. It follows a diagonal path, the
            long side of a right triangle, which is longer than the rest clock's straight path.
          </p>
          <p style={{ marginBottom: '1rem', fontSize: '0.95rem', color: '#333', lineHeight: '1.6' }}>
            This experiment rests on one assumption: light travels at the same speed, c, in the lab
            for both clocks. That is an established physical fact that we take as given here. With the
            same speed and a longer path, each tick takes longer in lab time.
          </p>
          <p style={{ marginBottom: '0', fontSize: '0.95rem', color: '#333', lineHeight: '1.6' }}>
            At {velocity}c, one tick of the moving clock took {movingTickDuration.toFixed(3)} seconds
            of lab time instead of {restTickDuration.toFixed(3)}. The moving clock's ticks are farther
            apart, so it measures {timeDilationFactor.toFixed(3)} of the lab time. This is the same
            factor you saw in Experiment 3 for this speed. It comes from the right triangle.
          </p>
        </div>
      )}
    </div>
  )
}
