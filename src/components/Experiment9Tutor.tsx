import { useState } from 'react'
import type { SimultaneityResult } from '../physics/relativityOfSimultaneityExperiment'
import { actualShapeFor } from './Experiment9'
import type { ShapeChoice } from './Experiment9'

type TutorStep = 'observe' | 'compare' | 'conceptual' | 'explained'

interface Experiment9TutorProps {
  result: SimultaneityResult
  predictionShape: ShapeChoice
  onExplained?: () => void
}

export function Experiment9Tutor({ result, predictionShape, onExplained }: Experiment9TutorProps) {
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
  const actualShape = actualShapeFor(result)

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
              'Look at the new purple line. Does it run flat and level, straight across the page — like the sidewalk-watcher\'s own idea of "the same moment"? Or does it lean over?'}
            {tutorStep === 'compare' &&
              `You predicted the line would be ${predictionShape}. It is actually ${actualShape}${
                actualShape === 'tilted' ? ', not flat' : ', matching the lab\'s own line exactly'
              }. Comparing what you expected to what the diagram actually drew, what do you notice?`}
            {tutorStep === 'conceptual' &&
              'Think back to the two friends in the car. They agreed their two events happened at the same moment; the person on the sidewalk did not. The rod\'s two events work the same way. Just from looking at the picture — not from redoing any arithmetic — why do you think the line through those two events isn\'t flat?'}
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
            <strong>1. A flat line is the sidewalk's "same moment."</strong> Any line drawn
            straight across this page, with no lean at all, connects points that the person
            standing still — the lab, watching from the sidewalk — agrees happen at the same
            moment. That's all "the same moment" means here.
          </p>
          <p style={{ marginBottom: '1rem', fontSize: '0.95rem', color: '#333', lineHeight: '1.6' }}>
            <strong>2. The rod is moving, like the car — so it gets its own line.</strong> Remember
            why, from Experiment 7: the back end of the rod moves toward the point where the flash
            started, while the front end moves away from it, so the flash reaches the back end
            first, according to the lab. That's the same kind of effect that would make the two
            friends in the car and the sidewalk-watcher disagree about their own two events. The
            two friends riding in the car have their own sense of "the same moment," different from
            the sidewalk's. The rod works the same way: someone riding along with it has their own
            line, and you can see it is not the lab's flat line. It's a real, different line on the
            very same page — not a mistake, and not a trick of measurement.
          </p>
          <p style={{ marginBottom: '1rem', fontSize: '0.95rem', color: '#333', lineHeight: '1.6' }}>
            <strong>3. This is the same fact as Experiment 7, just drawn as a line.</strong>{' '}
            Experiment 7 gave you two numbers: the flash reached the back end at{' '}
            {result.backEventLabTime.toFixed(3)} s and the front end at{' '}
            {result.frontEventLabTime.toFixed(3)} s in the lab — but at exactly the same moment for
            the rod. Experiment 8 drew those two events as two dots. All you did here is draw the
            line through them, and it showed you the same thing those numbers already said.
          </p>
          <p style={{ marginBottom: '0', fontSize: '0.95rem', color: '#333', lineHeight: '1.6' }}>
            <strong>4. Nothing new happened — you just connected two dots.</strong> The two events
            are exactly the ones you already saw. No new calculation was needed to draw this line;
            it was already there in the numbers Experiment 7 gave you.
          </p>
        </div>
      )}
    </div>
  )
}
