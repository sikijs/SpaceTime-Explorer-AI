import { useState } from 'react'
import type { GpsTimeDilationResult } from '../physics/gpsTimeDilationExperiment'

type TutorStep = 'observe' | 'compare' | 'conceptual' | 'explained'
type MoreLessSameChoice = 'more' | 'less' | 'same'
type YesNoChoice = 'yes' | 'no'

interface GpsTimeDilationTutorProps {
  speedEffectPrediction: MoreLessSameChoice
  crossoverPrediction: YesNoChoice
  gpsPrediction: MoreLessSameChoice
  result: GpsTimeDilationResult
  onExplained?: () => void
}

function moreLessSameText(choice: MoreLessSameChoice): string {
  if (choice === 'more') return 'get stronger'
  if (choice === 'less') return 'get weaker'
  return 'stay the same'
}

function fasterSlowerSameText(choice: MoreLessSameChoice): string {
  if (choice === 'more') return 'run faster'
  if (choice === 'less') return 'run slower'
  return 'run at the same rate'
}

function netEffectText(result: GpsTimeDilationResult): string {
  return result.netEffectFraction > 0 ? 'ran fast' : 'ran slow'
}

export function GpsTimeDilationTutor({
  speedEffectPrediction,
  crossoverPrediction,
  gpsPrediction,
  result,
  onExplained,
}: GpsTimeDilationTutorProps) {
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
  const gpsRunsFast = result.netEffectFraction > 0

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
              `At the altitude you chose, which effect won — did the satellite's clock end up running fast, or slow, compared to the ground? (It ${netEffectText(result)}.)`}
            {tutorStep === 'compare' &&
              `You predicted that as altitude increases, the speed-based slowing effect would ${moreLessSameText(speedEffectPrediction)} — in fact, it gets weaker, because a higher orbit moves slower. You predicted ${crossoverPrediction === 'yes' ? 'there would be' : 'there would not be'} an altitude where the two effects exactly cancel — in fact, yes, there is one, at about 3,186 km. You also predicted that at GPS altitude the satellite clock would ${fasterSlowerSameText(gpsPrediction)} — in fact, it runs faster. Comparing what you expected to what's actually true, what do you notice?`}
            {tutorStep === 'conceptual' &&
              'GPS satellites orbit much higher than the crossover altitude. Based on what you just saw, do you think that means their clocks run fast or slow — and does that match what real GPS systems have to correct for?'}
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
            <strong>1. A satellite's clock is affected by both its speed and its altitude at the
            same time</strong> — the speed effect (Experiment 3/4's effect) slows it down, and the
            altitude effect (Experiment 2's effect) speeds it up.
          </p>
          <p style={{ marginBottom: '1rem', fontSize: '0.95rem', color: '#333', lineHeight: '1.6' }}>
            <strong>2. Which one wins depends on orbital altitude</strong>, because a circular
            orbit's speed and altitude are linked — lower orbits move faster (Experiment 6).
          </p>
          <p style={{ marginBottom: '1rem', fontSize: '0.95rem', color: '#333', lineHeight: '1.6' }}>
            <strong>3. There's a specific altitude, about 3,186 km, where the two effects exactly
            cancel.</strong>
          </p>
          <p style={{ marginBottom: '1rem', fontSize: '0.95rem', color: '#333', lineHeight: '1.6' }}>
            <strong>4. Real GPS satellites orbit far above that altitude</strong>, so the altitude
            effect wins, and their clocks really do run about 38 millionths of a second fast every
            day — a real, measured, and corrected-for effect, not a hypothetical.{' '}
            {gpsRunsFast
              ? "That's exactly what you just calculated."
              : 'Try setting the altitude to the GPS preset to see this yourself.'}
          </p>
          <p style={{ marginBottom: '0', fontSize: '0.95rem', color: '#333', lineHeight: '1.6' }}>
            <strong>5. This is the first calculation in the whole project using real numbers</strong>{' '}
            rather than an exaggerated stand-in, because this is the one place the effect is large
            enough, over a large enough distance and speed, to matter in something people actually
            use.
          </p>
        </div>
      )}
    </div>
  )
}
