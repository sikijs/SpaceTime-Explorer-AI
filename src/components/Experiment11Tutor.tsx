import { useState } from 'react'
import type { WorldlinePoint } from '../physics/spacetimeDiagramView'
import { actualTimeOutcome } from './Experiment11'
import type { TimeChoice } from './Experiment11'

type TutorStep = 'observe' | 'compare' | 'conceptual' | 'explained'

const timeChoiceLabels: Record<TimeChoice, string> = {
  same: 'the same time',
  different: 'different times',
}

interface Experiment11TutorProps {
  transformedBackEvent: WorldlinePoint
  transformedFrontEvent: WorldlinePoint
  predictionOutcome: TimeChoice
  onExplained?: () => void
}

export function Experiment11Tutor({
  transformedBackEvent,
  transformedFrontEvent,
  predictionOutcome,
  onExplained,
}: Experiment11TutorProps) {
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
  const actual = actualTimeOutcome()

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
              'Look at the two calculated times in the rod\'s frame. Are they the same, or different?'}
            {tutorStep === 'compare' &&
              `You predicted the two events would come out at ${timeChoiceLabels[predictionOutcome]}. They actually come out at ${timeChoiceLabels[actual]}. Comparing what you expected to the real result, what do you notice?`}
            {tutorStep === 'conceptual' &&
              'Why do you think the calculation gives the same time for both events in the rod\'s frame, even though the lab clock said they happened at different times?'}
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
            <strong>1. This confirms what you already knew, from a new direction.</strong> Both
            events come out at {transformedBackEvent.time.toFixed(3)} seconds in the rod's frame —
            the same fact Experiment 7 gave you in numbers and Experiment 9 gave you as a picture.
            This calculation isn't a new physical fact. It's a third, independent way of arriving
            at the same one, by actually doing the math instead of reasoning about it or drawing
            it.
          </p>
          <p style={{ marginBottom: '1rem', fontSize: '0.95rem', color: '#333', lineHeight: '1.6' }}>
            <strong>2. The two new tilted lines are the rod's own "straight up" and "straight
            across."</strong> The lab's vertical line is its own time direction, and the lab's
            horizontal line is its own "now." The rod has exactly the same kind of pair of lines —
            just tilted, because it's moving. They're not a trick of the diagram; they're the
            rod's own natural axes, drawn on the same page as the lab's.
          </p>
          <p style={{ marginBottom: '1rem', fontSize: '0.95rem', color: '#333', lineHeight: '1.6' }}>
            <strong>3. Nothing physical changed.</strong> It's the same rod, the same flash, the
            same two events. All that happened is that we described those events using the rod's
            own ruler-and-clock convention instead of the lab's — the way converting kilometers to
            miles doesn't change a distance, only how it's written down.
          </p>
          <p style={{ marginBottom: '0', fontSize: '0.95rem', color: '#333', lineHeight: '1.6' }}>
            <strong>4. This ties the whole sequence together.</strong> Experiment 7 gave you two
            numbers. Experiment 8 turned the situation into a picture. Experiment 9 added one more
            line to it. This calculation is the actual mathematical bridge that connects the lab's
            numbers to the rod's own — the Lorentz transformation.
          </p>
        </div>
      )}
    </div>
  )
}
