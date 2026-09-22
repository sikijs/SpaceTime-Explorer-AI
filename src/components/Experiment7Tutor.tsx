import { useState } from 'react'
import type { SimultaneityResult } from '../physics/relativityOfSimultaneityExperiment'

type TutorStep = 'observe' | 'compare' | 'conceptual' | 'explained'

export type OrderChoice = 'same' | 'back' | 'front'
export type FrameAgreementChoice = 'agree' | 'disagree'

export const orderWording: Record<OrderChoice, string> = {
  same: 'at the same time',
  back: 'the back end first',
  front: 'the front end first',
}

// The back event is never later than the front event (Required Physics Test 2); they coincide only at v = 0.
export function actualOrderFor(result: SimultaneityResult): OrderChoice {
  return result.velocity === 0 ? 'same' : 'back'
}

interface Experiment7TutorProps {
  result: SimultaneityResult
  predictionOrder: OrderChoice
  predictionAgreement: FrameAgreementChoice
  onExplained?: () => void
}

export function Experiment7Tutor({
  result,
  predictionOrder,
  predictionAgreement,
  onExplained,
}: Experiment7TutorProps) {
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
  const actualOrder = actualOrderFor(result)

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
              "Look at the two panels. In the rod's own view, did the flash reach both ends together? In the lab's view?"}
            {tutorStep === 'compare' &&
              `You predicted that the flash would reach the two ends ${orderWording[predictionOrder]}, and that the rod's own view would ${predictionAgreement === 'agree' ? 'agree' : 'disagree'} with the lab. What actually happened: ${orderWording[actualOrder]}, in the lab's frame. In the lab, the flash reached the back end at ${result.backEventLabTime.toFixed(3)} s and the front end at ${result.frontEventLabTime.toFixed(3)} s, a gap of ${result.labTimeGap.toFixed(3)} s. In the rod's own frame, both events happened at ${result.rodFrameEventTime.toFixed(3)} s. What do you notice when you compare them?`}
            {tutorStep === 'conceptual' &&
              "The rod's own clocks say the flash arrived at both ends at the same moment. The lab's clocks say it arrived at the back end first. Both used a working light clock and light traveling at c. How can both be right?"}
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
            Let's go through it one step at a time.
          </p>
          <p style={{ marginBottom: '1rem', fontSize: '0.95rem', color: '#333', lineHeight: '1.6' }}>
            <strong>1. The rod's own view.</strong> In the rod's own frame, the flash has the same
            distance to travel each way, at the same speed, c. So the flash reaches both ends at the
            same moment: {result.rodFrameEventTime.toFixed(3)} seconds after it was released.
          </p>
          <p style={{ marginBottom: '1rem', fontSize: '0.95rem', color: '#333', lineHeight: '1.6' }}>
            <strong>2. The lab's view.</strong> In the lab, the back end moves toward the point where
            the flash was released, and the front end moves away from it. So the flash reaches the
            back end sooner, at {result.backEventLabTime.toFixed(3)} seconds, and the front end
            later, at {result.frontEventLabTime.toFixed(3)} seconds — a gap of{' '}
            {result.labTimeGap.toFixed(3)} seconds, at {result.velocity}c.
          </p>
          <p style={{ marginBottom: '1rem', fontSize: '0.95rem', color: '#333', lineHeight: '1.6' }}>
            <strong>3. Not a delay.</strong> This is not because a signal took time to travel or
            arrive late. Both frames used their own working clocks and light moving at c in both
            directions. They simply disagree about which events happened at the same time.
          </p>
          <p style={{ marginBottom: '1rem', fontSize: '0.95rem', color: '#333', lineHeight: '1.6' }}>
            <strong>4. A name.</strong> This effect is called <strong>relativity of simultaneity</strong>:
            two events that are simultaneous in one reference frame need not be simultaneous in
            another.
          </p>
          <p style={{ marginBottom: '0', fontSize: '0.95rem', color: '#333', lineHeight: '1.6' }}>
            <strong>5. Familiar territory.</strong> Experiment 3 showed that elapsed time depends on
            the reference frame. Experiment 6 showed that length does too. Now you have seen that
            even whether two events happen "at the same time" depends on the reference frame.
          </p>
        </div>
      )}
    </div>
  )
}
