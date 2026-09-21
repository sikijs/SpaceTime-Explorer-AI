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
            <strong>First, the clock itself.</strong> The source and the two mirrors of the moving
            clock are all part of the same moving clock. So, seen from the lab, they always move
            together, side by side, at the same speed. None of them moves before or after the
            others.
          </p>
          <p style={{ marginBottom: '0.5rem', fontSize: '0.95rem', color: '#333', lineHeight: '1.6' }}>
            <strong>In the lab's reference frame,</strong> which is the view you just watched, the
            whole moving clock is sliding sideways. Follow one tick:
          </p>
          <ol
            style={{
              marginTop: 0,
              marginBottom: '1rem',
              paddingLeft: '1.5rem',
              fontSize: '0.95rem',
              color: '#333',
              lineHeight: '1.6',
            }}
          >
            <li>The pulse leaves the source, at the bottom.</li>
            <li>
              Crossing the gap takes time. During that time, the source and the top mirror both
              keep moving sideways.
            </li>
            <li>
              So by the time the pulse reaches the top mirror, that mirror has moved. It is no
              longer above the spot where the pulse started.
            </li>
            <li>
              To reach the mirror, the pulse has to travel on a slant. That is why its path is
              diagonal.
            </li>
            <li>
              The same thing happens on the way back down: the source and the bottom mirror have
              moved on, so the path slants again.
            </li>
          </ol>
          <p style={{ marginBottom: '1rem', fontSize: '0.95rem', color: '#333', lineHeight: '1.6' }}>
            <strong>In the moving clock's own reference frame,</strong> which is the view of someone
            riding along with the clock, it is different. The source and both mirrors are at rest
            next to that observer, so nothing slides sideways. The pulse goes straight up to the
            top mirror and straight back down, just like in the rest clock.
          </p>
          <p style={{ marginBottom: '1rem', fontSize: '0.95rem', color: '#333', lineHeight: '1.6' }}>
            <strong>So:</strong> one pulse, one clock, two views. In the clock's own frame the path
            is straight up and down. In the lab's frame it is a slanted "V". Both views are
            correct. The lab's diagonal path is the long side of a right triangle, which is longer
            than the rest clock's straight path.
          </p>
          <p style={{ marginBottom: '1rem', fontSize: '0.95rem', color: '#333', lineHeight: '1.6' }}>
            This experiment rests on one assumption: light travels at the same speed, c, in the lab
            frame for both clocks. That is an established physical fact that we take as given here. With the
            same speed and a longer path, each tick takes longer in lab time.
          </p>
          <p style={{ marginBottom: '1rem', fontSize: '0.95rem', color: '#333', lineHeight: '1.6' }}>
            At {velocity}c, one tick of the moving clock took {movingTickDuration.toFixed(3)} seconds
            of lab time instead of {restTickDuration.toFixed(3)}. The moving clock's ticks are farther
            apart, so it measures {timeDilationFactor.toFixed(3)} of the lab time. This is the same
            factor you saw in Experiment 3 for this speed. It comes from the right triangle.
          </p>
          <p style={{ marginBottom: '0', fontSize: '0.95rem', color: '#333', lineHeight: '1.6' }}>
            <strong>What this means for a traveller.</strong> Imagine a spaceship coasting at a
            steady speed close to the speed of light. As measured in the lab, its clock runs slow,
            and so does everything else on board, including the traveller's own aging. The closer
            the speed is to c, the bigger the gap becomes. So a traveller who ages one year on the
            ship could find that many years have gone by on the lab's clocks.
          </p>
        </div>
      )}
    </div>
  )
}
