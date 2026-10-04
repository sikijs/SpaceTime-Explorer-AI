import { useState } from 'react'

type DirectionChoice = 'higher' | 'lower' | 'same'
type MagnitudeChoice = 'exact' | 'more' | 'less'
type TutorStep = 'observe' | 'compare' | 'conceptual' | 'explained'

interface GravitationalWaveRedshiftTutorProps {
  predictedDirection: DirectionChoice
  predictedMagnitude: MagnitudeChoice
  onExplained?: () => void
}

const directionLabels: Record<DirectionChoice, string> = {
  higher: 'higher',
  lower: 'lower',
  same: 'the same',
}

const magnitudeLabels: Record<MagnitudeChoice, string> = {
  exact: 'exactly what an everyday Doppler effect alone would predict',
  more: 'more than an everyday Doppler effect alone would predict',
  less: 'less than an everyday Doppler effect alone would predict',
}

export function GravitationalWaveRedshiftTutor({
  predictedDirection,
  predictedMagnitude,
  onExplained,
}: GravitationalWaveRedshiftTutorProps) {
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
              'What did you notice about how the animation itself behaved as you increased the speed?'}
            {tutorStep === 'compare' &&
              `You predicted the detected frequency would be ${directionLabels[predictedDirection]}, stretched by ${magnitudeLabels[predictedMagnitude]}. Comparing that to what actually happened, what do you notice?`}
            {tutorStep === 'conceptual' &&
              'The everyday Doppler effect alone would predict one amount of stretching. Why is the real amount slightly more than that?'}
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
            <strong>1. This reuses Experiment 2's exact chirp model and the Relativity of Time and
            Motion chapter's exact time dilation factor</strong> — nothing new was calculated about
            the chirp itself or about time dilation.
          </p>
          <p style={{ marginBottom: '1rem', fontSize: '0.95rem', color: '#333', lineHeight: '1.6' }}>
            <strong>2. A receding source's wave is stretched to a lower frequency</strong> — the
            Doppler effect, the same basic effect as a receding ambulance's siren dropping in pitch
            as it drives away.
          </p>
          <p style={{ marginBottom: '1rem', fontSize: '0.95rem', color: '#333', lineHeight: '1.6' }}>
            <strong>3. The real stretching is the classical Doppler factor times the time dilation
            factor</strong>, so it is always somewhat more than the classical guess alone — the
            extra stretching comes from time dilation, on top of the everyday Doppler effect.
          </p>
          <p style={{ marginBottom: '1rem', fontSize: '0.95rem', color: '#333', lineHeight: '1.6' }}>
            <strong>4. This is why a real detected gravitational wave needs a velocity
            correction</strong>: the source's own motion changes the frequency an instrument
            measures, beyond what the source's chirp alone would produce.
          </p>
          <p style={{ marginBottom: '0', fontSize: '0.95rem', color: '#333', lineHeight: '1.6' }}>
            <strong>5. This experiment isolates only the velocity-based part of redshift.</strong>{' '}
            A real, very distant source's total redshift is usually dominated by a separate, larger
            effect — the cosmological expansion of space itself while the wave travels — which this
            experiment does not model.
          </p>
        </div>
      )}
    </div>
  )
}
