import { useState } from 'react'
import { markGuess } from '../physics/equivalencePrincipleExperiment'
import type { EquivalencePrincipleExperimentResult, PredictionChoice } from '../physics/equivalencePrincipleExperiment'

// Gravity and Curved Spacetime, Experiment 1's tutor (Part 4), audited to the newer rules (docs/audit/gravity-and-curved-spacetime/
// 01-draft-wording.md, section 9, approved by the owner on 2026-11-11 "with defaults"). The prompts point to the white marker on the
// graph by name and give no verdict; the explanation marks the guess with no score. Every number comes from the physics module
// (CLAUDE.md §9).

type TutorStep = 'observe' | 'compare' | 'conceptual' | 'explained'

interface EquivalencePrincipleTutorProps {
  predictionChoice: PredictionChoice
  result: EquivalencePrincipleExperimentResult
  onExplained?: () => void
}

const pointStyle = { marginTop: '1rem', marginBottom: '1rem', fontSize: '0.95rem', color: '#333', lineHeight: '1.6' } as const

export function EquivalencePrincipleExplanation({
  predictionChoice,
  result,
}: {
  predictionChoice: PredictionChoice
  result: EquivalencePrincipleExperimentResult
}) {
  const marking = markGuess(result, predictionChoice)
  return (
    <div>
              <p style={pointStyle}>
                <strong>Your guess, marked.</strong> {marking.text}
              </p>
              <p style={pointStyle}>
                <strong>1. Both cabins were worked out using the exact same math.</strong> To figure out where the ball would be at each
                moment, we didn't write one equation for "gravity pulls the ball down" and a separate, different-looking equation for "the
                rocket pushes the floor up." We used a single equation, plugged in the same acceleration both times, and that's genuinely
                all there was to it. That's why the ball took the same {result.timeToFloorSeconds.toFixed(2)} seconds to reach the floor in
                Cabin A as it did in Cabin B — not roughly the same, but exactly the same, down to the last decimal place, because the
                calculation itself never had a way to know which cabin it was supposed to be describing. At {result.accelerationInG}g, the
                time to the floor is √(2 × {result.initialHeightMeters} ÷ {result.accelerationMetersPerSecondSquared.toFixed(1)}) ={' '}
                {result.timeToFloorSeconds.toFixed(2)} seconds, and the same formula gives the same {result.timeToFloorSeconds.toFixed(2)}{' '}
                seconds for both cabins. Think of it like a recipe that never mentions the name of the kitchen it's cooked in: run the same
                recipe twice, in two different kitchens, and you get the same dish both times. Here, the "recipe" is the math, and the two
                "kitchens" are gravity and acceleration.
              </p>
              <p style={pointStyle}>
                <strong>2. This is called the equivalence principle.</strong> Being at rest in a gravitational field, and accelerating
                through empty space with no gravity at all, produce exactly the same local effects. A local experiment — one confined
                entirely inside the sealed cabin — can't tell them apart.
              </p>
              <p style={pointStyle}>
                <strong>3. This is where Einstein started.</strong> If gravity and acceleration are genuinely indistinguishable, gravity
                might not be an ordinary force at all, but something about the shape of space and time itself — a question later
                experiments in this chapter will take up.
              </p>
              <p style={pointStyle}>
                <strong>4. A word of care.</strong> What you saw is a calculation. We used one formula for both cabins, so it was certain
                that they would agree: the agreement was built in, and nothing here tested it. Whether a real ball in a real rocket and a
                real ball on a real planet move the same way is a question for real experiments. Real experiments have tested it for real
                objects. One of them, the MICROSCOPE satellite, compared how two different metals fall in orbit and reported no difference at
                the level of about one part in a thousand million million. The links below this explanation lead to the paper and to plain
                accounts of it.
              </p>
              <p style={{ ...pointStyle, marginBottom: 0 }}>
                Try other accelerations in Part 2 to see the same thing: whatever you choose, the two lines lie on top of each other.
              </p>
            </div>
  )
}

export function EquivalencePrincipleTutor({ predictionChoice, result, onExplained }: EquivalencePrincipleTutorProps) {
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
  const choicePhrase = predictionChoice === 'sameWay' ? 'the same way' : 'differently'

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
              'Look at the graph. It has two lines, a solid indigo one for Cabin A and a dashed amber one for Cabin B. Do they lie on top of each other, or apart? Your guess is the white marker at the end of the lines.'}
            {tutorStep === 'compare' &&
              `You guessed that the ball would move ${choicePhrase} in the two cabins. That is the white marker. Look at the graph again: what do you notice when you compare what you expected with what was drawn?`}
            {tutorStep === 'conceptual' &&
              'If you were sealed inside one of these cabins with no windows, could you have figured out which one you were in, just from watching the ball?'}
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

      {tutorStep === 'explained' && <EquivalencePrincipleExplanation predictionChoice={predictionChoice} result={result} />}
    </div>
  )
}
