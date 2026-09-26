import { useState } from 'react'
import type { SimultaneityResult } from '../physics/relativityOfSimultaneityExperiment'
import { orderWording, actualOrderFor } from './Experiment8'
import type { OrderChoice } from './Experiment8'

type TutorStep = 'observe' | 'compare' | 'conceptual' | 'explained'

interface Experiment8TutorProps {
  result: SimultaneityResult
  predictionOrder: OrderChoice
  onExplained?: () => void
}

export function Experiment8Tutor({ result, predictionOrder, onExplained }: Experiment8TutorProps) {
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
              "Look carefully at the diagram you just made. It has two solid lines that lean over (the rod's back and front ends) and two dashed lines (the flash of light, spreading out from the middle where it was released). Follow each dashed line upward from where the flash started, and see where it meets a solid line — that meeting point is one of the two events. Which solid line does a dashed line reach first, lower down on the diagram: the back end's, or the front end's? Or do both dashed lines reach their solid lines at exactly the same height?"}
            {tutorStep === 'compare' &&
              `You predicted that the light would cross ${orderWording[predictionOrder]}. Here is what the diagram actually shows: the light crosses ${orderWording[actualOrder]}, in the lab's frame. Reading the exact numbers off the diagram: in the lab, the flash reached the back end at ${result.backEventLabTime.toFixed(3)} s and the front end at ${result.frontEventLabTime.toFixed(3)} s — a gap of ${result.labTimeGap.toFixed(3)} s between them. One of the two marked points sits lower on the diagram than the other, meaning it happened earlier. Comparing what you predicted to what the diagram actually drew, what do you notice?`}
            {tutorStep === 'conceptual' &&
              "Here's something to think about before we explain it, just from the shapes of the lines on the diagram — not by redoing any arithmetic. Why does the back end's worldline reach the light's dashed line lower down on the diagram (in other words, sooner) than the front end's worldline does? What is it about the way the two solid lines lean that makes this happen?"}
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
            <strong>A familiar version of this.</strong> If you've ever seen a graph of distance
            over time — say, two cars leaving the same spot at different speeds — this works the
            same way. A steeper line means faster. Draw both cars' journeys on one graph, and the
            point where two lines cross tells you exactly when and where they meet. A spacetime
            diagram is the same idea: instead of a car's distance from home, it's an object's
            position in space, and instead of two cars, it's the rod's two ends and the flash of
            light, all on one picture, so you can see exactly where and when they meet.
          </p>
          <p style={{ marginBottom: '1rem', fontSize: '0.95rem', color: '#333', lineHeight: '1.6' }}>
            <strong>1. Leaning toward the flash.</strong> The back end's worldline leans toward the
            spot where the flash was released, while the front end's worldline leans away from it.
            Picture the light's dashed line spreading outward from the release point: the back
            end's line is heading toward that spreading light, so the gap between them closes
            quickly. The front end's line is heading away from it, so the gap takes longer to
            close. Less distance left to close means the meeting happens sooner — lower down on
            the diagram.
          </p>
          <p style={{ marginBottom: '1rem', fontSize: '0.95rem', color: '#333', lineHeight: '1.6' }}>
            <strong>2. Light's slope never changes.</strong> Light always travels at c in the lab
            (Experiment 5), so its worldline always leans over by the same fixed amount on this
            diagram, at every rod speed — only the rod's own worldlines get steeper as it speeds
            up. That's exactly why a worldline leaning toward the light reaches it sooner than a
            vertical (motionless) one would: the light's line is fixed, so whichever solid line
            leans to meet it halfway gets there first.
          </p>
          <p style={{ marginBottom: '1rem', fontSize: '0.95rem', color: '#333', lineHeight: '1.6' }}>
            <strong>3. The same result as Experiment 7.</strong> This isn't a new effect — it's
            relativity of simultaneity again, the same idea and the same numbers you saw there: in
            the lab, the flash reached the back end at {result.backEventLabTime.toFixed(3)} s and
            the front end at {result.frontEventLabTime.toFixed(3)} s, even though both ends are
            reached together in the rod's own frame. Experiment 7 gave you those two numbers from a
            calculation. Now you've seen the same fact appear directly in a picture: the geometry
            and the arithmetic agree.
          </p>
          <p style={{ marginBottom: '0', fontSize: '0.95rem', color: '#333', lineHeight: '1.6' }}>
            <strong>4. A name.</strong> A picture like this one, with position drawn across and
            time drawn up, is called a <strong>spacetime diagram</strong>. The straight lines on it,
            showing where something was at every moment, are called <strong>worldlines</strong>.
          </p>
        </div>
      )}
    </div>
  )
}
