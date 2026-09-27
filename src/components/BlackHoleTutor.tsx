import { useState } from 'react'
import type { RadialLaunchResult } from '../physics/blackHoleExperiment'

type TutorStep = 'observe' | 'compare' | 'conceptual' | 'explained'
type SpeedCompareChoice = 'much-slower' | 'faster' | 'cannot-escape'
type YesNoChoice = 'yes' | 'no'

interface BlackHoleTutorProps {
  smallMassPrediction: SpeedCompareChoice
  largeMassPrediction: SpeedCompareChoice
  inBetweenPrediction: YesNoChoice
  result: RadialLaunchResult
  onExplained?: () => void
}

function speedCompareText(choice: SpeedCompareChoice): string {
  if (choice === 'much-slower') return 'much slower than light'
  if (choice === 'faster') return 'faster than light'
  return 'that nothing can escape at all'
}

function outcomeText(outcome: RadialLaunchResult['outcome']): string {
  return outcome === 'escapes' ? 'escaped' : 'fell back'
}

export function BlackHoleTutor({
  smallMassPrediction,
  largeMassPrediction,
  inBetweenPrediction,
  result,
  onExplained,
}: BlackHoleTutorProps) {
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
              `What happened to the probe this time — did it escape, or fall back? (It ${outcomeText(result.outcome)}.)`}
            {tutorStep === 'compare' &&
              `You predicted a small mass would give an escape speed ${speedCompareText(smallMassPrediction)}, and a large mass would give ${speedCompareText(largeMassPrediction)}. In fact, a small mass gives an escape speed well below the speed of light, and as mass grows, escape speed rises toward the speed of light — until, past a specific mass, escape speed would need to exceed light speed, which is impossible, so the light-speed launch falls back instead. You also predicted ${inBetweenPrediction === 'yes' ? 'that there is' : 'that there is not'} a mass in between where something special happens — in fact, yes: there is a specific mass where escape speed exactly reaches the speed of light. Comparing what you expected to what's actually true, what do you notice?`}
            {tutorStep === 'conceptual' &&
              "The escape-speed formula says a big enough mass would need an escape speed faster than light. But nothing can go faster than light. So what actually happens instead?"}
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
            <strong>1. Escape speed grows with mass</strong>, exactly as in Experiment 6 — a more
            concentrated mass takes more speed to get away from.
          </p>
          <p style={{ marginBottom: '1rem', fontSize: '0.95rem', color: '#333', lineHeight: '1.6' }}>
            <strong>2. Past some mass, the formula would require exceeding the speed of light</strong>,
            which "Relativity of Time and Motion" Experiment 5 already showed is impossible — nothing
            can travel faster than light.
          </p>
          <p style={{ marginBottom: '1rem', fontSize: '0.95rem', color: '#333', lineHeight: '1.6' }}>
            <strong>3. So instead, nothing — not even light — can escape from within the
            corresponding distance.</strong> That boundary is the event horizon, and the object
            inside it is a black hole.
          </p>
          <p style={{ marginBottom: '1rem', fontSize: '0.95rem', color: '#333', lineHeight: '1.6' }}>
            <strong>4. This is not new physics</strong> — it's Experiment 6's escape speed, taken to
            its limit.
          </p>
          <p style={{ marginBottom: '1rem', fontSize: '0.95rem', color: '#333', lineHeight: '1.6' }}>
            <strong>5. A historical note:</strong> this reasoning is genuinely how an 18th-century
            astronomer, John Michell, first imagined such objects in 1783, long before general
            relativity gave the correct full picture.
          </p>
          <p style={{ marginBottom: '1rem', fontSize: '0.95rem', color: '#333', lineHeight: '1.6' }}>
            <strong>6. This used ordinary, first-order gravity</strong> — the same simplification
            Experiments 2, 3, 5, and 6 use — not the exact general-relativistic treatment a real
            black hole requires.
          </p>
          <p style={{ marginBottom: '1rem', fontSize: '0.95rem', color: '#333', lineHeight: '1.6' }}>
            <strong>7. Real black holes are real</strong> — astronomers have directly imaged the
            glowing region around two of them: the black hole at the center of the galaxy M87
            (2019), and Sagittarius A*, the black hole at the center of our own Milky Way (2022),
            both using a global network of radio telescopes called the Event Horizon Telescope.
          </p>
          <p style={{ marginBottom: '0', fontSize: '0.95rem', color: '#333', lineHeight: '1.6' }}>
            <strong>8. This simple model stops well short of the real thing.</strong> Real event
            horizons are described exactly by general relativity, and physicists also study a black
            hole's <strong>singularity</strong> (its very center) and a real but astronomically tiny
            effect called <strong>Hawking radiation</strong>, where a black hole very slowly leaks
            energy over immense timescales. None of that is part of this experiment's simple
            escape-speed picture — those are ideas for a much later chapter, if this project ever
            gets there.
          </p>
        </div>
      )}
    </div>
  )
}
