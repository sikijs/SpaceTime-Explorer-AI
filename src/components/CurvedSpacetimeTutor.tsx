import { useState } from 'react'
import { markGuess, finalSeparationMeters, workedNumbers } from '../physics/curvedSpacetimeExperiment'
import type { CurvedSpacetimeExperimentResult, PredictionChoice } from '../physics/curvedSpacetimeExperiment'

// Gravity and Curved Spacetime, Experiment 4's tutor (Part 4), audited to the newer rules (docs/audit/gravity-and-curved-spacetime/
// 04-draft-wording.md, section 9, approved by the owner on 2026-11-12 "all approved"). The prompts point to the two white marks on
// the graph by name and give no verdict; the explanation marks both guesses. Every number comes from the physics module (CLAUDE.md §9).

const CHOICE_PHRASE: Record<PredictionChoice, string> = {
  converge: 'drift closer together',
  same: 'stay the same distance apart',
  apart: 'drift farther apart',
}

const pointStyle = { marginBottom: '1rem', fontSize: '0.95rem', color: '#333', lineHeight: '1.6' } as const

type TutorStep = 'observe' | 'compare' | 'conceptual' | 'explained'

interface CurvedSpacetimeTutorProps {
  flatPrediction: PredictionChoice
  spherePrediction: PredictionChoice
  result: CurvedSpacetimeExperimentResult
  onExplained?: () => void
}

export function CurvedSpacetimeExplanation({
  flatPrediction,
  spherePrediction,
  result,
}: {
  flatPrediction: PredictionChoice
  spherePrediction: PredictionChoice
  result: CurvedSpacetimeExperimentResult
}) {
  const flatMark = markGuess(result, 'flat', flatPrediction)
  const sphereMark = markGuess(result, 'sphere', spherePrediction)
  const sphereEnd = finalSeparationMeters(result, 'sphere').toFixed(3)
  const start = result.initialSeparationMeters.toFixed(1)
  const w = workedNumbers()
  return (
    <div>
      <p style={pointStyle}>
        <strong>Your guesses, marked.</strong> {flatMark.text} {sphereMark.text}
      </p>
      <p style={pointStyle}>
        <strong>1. On a flat surface, dead-straight paths that start parallel always stay parallel.</strong> This matches everyday
        intuition — it's why the two travelers on the flat surface stayed exactly {start} m apart the whole way.
      </p>
      <p style={pointStyle}>
        <strong>2. On a curved surface, dead-straight (geodesic) paths that start parallel can still converge</strong> — purely because
        the surface itself is curved, not because anything pushed them sideways. That's why the two travelers on the sphere, starting the
        same {start} m apart, ended up {sphereEnd} m apart: at the pole. At strength {result.curvatureStrength}, after 10 m the separation
        was 1 × cos(10 ÷ {w.radiusAt0p5}) = {w.separationAfter10mAt0p5.toFixed(3)} m. Picture a globe: two lines of longitude start side
        by side near the equator, each heading straight north, and they meet at the North Pole. Neither line turns; the curve of the globe
        brings them together.
      </p>
      <p style={pointStyle}>
        <strong>3. Recall Experiment 3 (tidal effects):</strong> two falling balls, each moving as straight as gravity allows, also
        converged — for the same reason: the spacetime they move through is curved, not flat.
      </p>
      <p style={pointStyle}>
        <strong>4. This is what physicists mean by curved spacetime:</strong> gravity's pulling-together isn't a sideways force bending the
        balls' paths — it's evidence that the space (spacetime) itself is shaped like the sphere in this experiment, not the flat plane.
      </p>
      <p style={pointStyle}>
        <strong>5. A rocket's uniform acceleration, however hard it pushes, moves through flat spacetime</strong>, and flat spacetime can
        never make dead-straight paths converge — which is exactly why Experiment 3's rocket balls never drifted together.
      </p>
      <p style={pointStyle}>
        <strong>A note on the sphere:</strong> the sphere here is an analogy, not a literal claim about spacetime's shape. Real spacetime
        curvature is four-dimensional and involves time as well as space — this experiment only builds intuition for what "curved" means.
      </p>
      <p style={{ ...pointStyle, marginBottom: 0 }}>
        Try other strengths in Part 2 to see the same thing: whatever strength you choose, the flat line stays at {start} m, and the bigger
        the strength, the sooner the curved line reaches 0.
      </p>
    </div>
  )
}

export function CurvedSpacetimeTutor({ flatPrediction, spherePrediction, result, onExplained }: CurvedSpacetimeTutorProps) {
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
              "Look at the graph. It has two lines, a solid indigo one for the curved surface and a dashed amber one for the flat surface. On which surface did the distance between the travelers change? Your two guesses are the white marks at the ends of the lines."}
            {tutorStep === 'compare' &&
              `You guessed that the flat surface's travelers would ${CHOICE_PHRASE[flatPrediction]}, and that the curved surface's travelers would ${CHOICE_PHRASE[spherePrediction]}. Those are the two white marks. Look at the graph again: what do you notice when you compare what you expected with what was drawn?`}
            {tutorStep === 'conceptual' &&
              'Neither traveler ever turned — both walked as straight as they possibly could, the whole way. What does it mean that they still ended up closer together?'}
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
        <CurvedSpacetimeExplanation flatPrediction={flatPrediction} spherePrediction={spherePrediction} result={result} />
      )}
    </div>
  )
}
