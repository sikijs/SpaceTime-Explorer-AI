import { useState } from 'react'
import type { OrbitExperimentResult } from '../physics/orbitExperiment'
import type { OrbitOutcome } from '../physics/orbitExperiment'

type TutorStep = 'observe' | 'compare' | 'conceptual' | 'explained'
type YesNoChoice = 'yes' | 'no'

interface OrbitTutorProps {
  slowPrediction: OrbitOutcome
  fastPrediction: OrbitOutcome
  inBetweenPrediction: YesNoChoice
  result: OrbitExperimentResult
  onExplained?: () => void
}

function outcomeText(outcome: OrbitOutcome): string {
  if (outcome === 'falls-in') return 'falls into the mass'
  if (outcome === 'escapes') return 'flies away and never returns'
  return 'curves around and comes back'
}

export function OrbitTutor({
  slowPrediction,
  fastPrediction,
  inBetweenPrediction,
  result,
  onExplained,
}: OrbitTutorProps) {
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
              `What happened to the path this time — did it fall in, fly away, or come back around? (It ${outcomeText(result.outcome)}.)`}
            {tutorStep === 'compare' &&
              `You predicted a very slow speed ${outcomeText(slowPrediction)}, and a very fast speed ${outcomeText(fastPrediction)}. In fact, a speed well below circular speed always falls in, and a speed well above escape speed always flies away and never returns. You also predicted ${inBetweenPrediction === 'yes' ? 'that there is' : 'that there is not'} a speed in between where something different happens — in fact, yes: at or near the circular-orbit speed, the object neither falls in nor escapes, it orbits. Comparing what you expected to what's actually true, what do you notice?`}
            {tutorStep === 'conceptual' &&
              'The mass and the starting distance were the same the whole time. What was the only thing that changed between falling in, escaping, and orbiting?'}
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
            <strong>1. The object is always just falling under gravity</strong>, exactly like
            Experiment 1's dropped ball. Nothing here is holding it up or pushing it sideways —
            gravity is the only force acting on it.
          </p>
          <p style={{ marginBottom: '1rem', fontSize: '0.95rem', color: '#333', lineHeight: '1.6' }}>
            <strong>2. The only difference between falling in, escaping, and orbiting is how much
            sideways motion it started with.</strong> The mass and the starting distance never
            changed — only the sideways speed did.
          </p>
          <p style={{ marginBottom: '1rem', fontSize: '0.95rem', color: '#333', lineHeight: '1.6' }}>
            <strong>3. Too little sideways motion, and it falls in before it can "miss" the
            mass.</strong> Too much, and it flies past and never comes back. Just the right
            amount, and it keeps "missing" the mass forever — which is what an orbit is. Think of
            throwing a ball harder and harder, sideways, off a cliff: a gentle throw lands close
            by, a hard throw lands far away — and if you could throw it hard enough, it would
            keep falling toward the ground while the ground itself curves away beneath it just as
            fast, so it never actually lands. That's an orbit.
          </p>
          <p style={{ marginBottom: '1rem', fontSize: '0.95rem', color: '#333', lineHeight: '1.6' }}>
            <strong>4. This is the same idea as Experiment 4's geodesics.</strong> The path is as
            straight as spacetime allows, and it curves because spacetime near the mass is curved
            (Experiment 4), by an amount that depends on the mass and distance (Experiment 5).
          </p>
          <p style={{ marginBottom: '0', fontSize: '0.95rem', color: '#333', lineHeight: '1.6' }}>
            <strong>5. This used ordinary, first-order gravity</strong> — the same rule used to
            predict real satellites and planets — not the exact general-relativistic calculation,
            the same simplification Experiments 2, 3, and 5 use.
          </p>
        </div>
      )}
    </div>
  )
}
