import { useState } from 'react'
import { actualOrderFor, markGuesses, runSimultaneityExperiment } from '../physics/relativityOfSimultaneityExperiment'
import type { FrameAgreementChoice, OrderChoice, SimultaneityResult } from '../physics/relativityOfSimultaneityExperiment'

type TutorStep = 'observe' | 'compare' | 'conceptual' | 'explained'

// The choice types and the actual order now live in the physics module (audit update); re-exported so older imports keep working.
export { actualOrderFor }
export type { FrameAgreementChoice, OrderChoice }

export const orderWording: Record<OrderChoice, string> = {
  same: 'at the same time',
  back: 'the back end first',
  front: 'the front end first',
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
              "Look at the two pictures and at the strip of event times. In the block's own picture, what do you notice about the two dots turning green? In the lab's picture?"}
            {tutorStep === 'compare' &&
              `You chose ${orderWording[predictionOrder]} for the lab's clocks. That is the white marker on the lab row of the strip. You also chose that the block's own point of view would ${predictionAgreement === 'agree' ? 'agree with' : 'disagree with'} the lab. That is the white marker between the two rows. In the lab, the flash reached the back end at ${result.backEventLabTime.toFixed(3)} s and the front end at ${result.frontEventLabTime.toFixed(3)} s, a gap of ${result.labTimeGap.toFixed(3)} s. In the block's own frame, both ends were reached at ${result.rodFrameEventTime.toFixed(3)} s. What do you notice when you compare the two rows?`}
            {tutorStep === 'conceptual' &&
              "The block's own clocks say the flash arrived at both ends at the same moment. The lab's clocks say it arrived at the back end first. Both used a working light clock and light traveling at c. How can both be right?"}
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
        <Experiment7Explanation result={result} predictionOrder={predictionOrder} predictionAgreement={predictionAgreement} />
      )}
    </div>
  )
}

// The explanation, as its own piece so that its wording can be checked in a test. Every number comes from the physics module.
export function Experiment7Explanation({
  result,
  predictionOrder,
  predictionAgreement,
}: {
  result: SimultaneityResult
  predictionOrder: OrderChoice
  predictionAgreement: FrameAgreementChoice
}) {
  const marking = markGuesses(result, predictionOrder, predictionAgreement)
  return (
    <div>
    <p style={{ marginBottom: '1rem', fontSize: '0.95rem', color: '#333', lineHeight: '1.6' }}>
      Let's go through it one step at a time.
    </p>
    <p style={{ marginBottom: '1rem', fontSize: '0.95rem', color: '#333', lineHeight: '1.6' }}>
      <strong>1. The block's own view.</strong> In the block's own frame, the flash has the same
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
      <strong>A familiar version of this.</strong> Imagine standing at the middle of a moving
      train car and sending two friends running at the same speed, at the same moment — one
      toward the back wall, one toward the front. Even though they run equally fast and start
      together, the friend running toward the back reaches it sooner, because the back wall is
      coming toward them as the train moves forward. The friend running toward the front takes
      longer, because the front wall is running away from them. That's exactly what happens
      with the flash and the block's ends, seen from the lab: the back end comes to meet the
      light, and the front end runs away from it.
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
    <p style={{ marginBottom: '1rem', fontSize: '0.95rem', color: '#333', lineHeight: '1.6' }}>
      <strong>5. Familiar territory.</strong> &ldquo;A moving clock&rdquo; showed that elapsed
      time depends on the reference frame. &ldquo;Does motion change length?&rdquo; showed that
      length does too. Now you have seen that even whether two events happen
      &ldquo;at the same time&rdquo; depends on the reference frame.
    </p>
    <p style={{ margin: '1rem 0', fontSize: '0.95rem', color: '#333', lineHeight: '1.6' }}>
      <strong>6. Your guesses, marked.</strong> For the order, you chose{' '}
      {orderWording[marking.orderChoice]}. On the lab&rsquo;s clocks the flash reached the{' '}
      {marking.actualOrder === 'same' ? 'two ends at the same time' : 'back end first, '}
      {marking.actualOrder === 'same' ? '' : `${marking.labGap.toFixed(3)} seconds before the front end`}.
      For the second guess, you chose that the block&rsquo;s own view would{' '}
      {marking.agreementChoice === 'agree' ? 'agree with' : 'disagree with'} the lab. The lab
      row has the two dots {marking.labGap.toFixed(3)} seconds apart, and the block row has them{' '}
      {marking.rodGap.toFixed(3)} seconds apart.
    </p>
    <p style={{ marginBottom: '0', fontSize: '0.95rem', color: '#333', lineHeight: '1.6' }}>
      <strong>7. Try it in Part 2.</strong> Run 0c, the block standing still: the two rows agree
      and the gap is {runSimultaneityExperiment(0).labTimeGap.toFixed(3)} seconds. Then try 0.1c
      (gap {runSimultaneityExperiment(0.1).labTimeGap.toFixed(3)} s), 0.8c (gap{' '}
      {runSimultaneityExperiment(0.8).labTimeGap.toFixed(3)} s) and 0.9c (gap{' '}
      {runSimultaneityExperiment(0.9).labTimeGap.toFixed(3)} s). The block&rsquo;s own row stays
      at {result.rodFrameEventTime.toFixed(3)} seconds every time.
    </p>
    </div>
  )
}
