import { useState } from 'react'

type SpeedChoice = 'twice' | 'same' | 'half'
type RedshiftChoice = 'nearer' | 'farther' | 'same'
type TutorStep = 'observe' | 'compare' | 'conceptual' | 'explained'

interface HubblesLawTutorProps {
  predictedSpeed: SpeedChoice
  predictedRedshift: RedshiftChoice
  onExplained?: () => void
}

const speedLabels: Record<SpeedChoice, string> = {
  twice: 'twice as fast',
  same: 'the same speed',
  half: 'half as fast',
}

const redshiftLabels: Record<RedshiftChoice, string> = {
  nearer: 'the nearer galaxy would look more redshifted',
  farther: 'the farther galaxy would look more redshifted',
  same: 'there would be no difference',
}

export function HubblesLawTutor({ predictedSpeed, predictedRedshift, onExplained }: HubblesLawTutorProps) {
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
              "What did you notice about the color of the light compared to the galaxy's distance?"}
            {tutorStep === 'compare' &&
              `You predicted a galaxy twice as far away would recede ${speedLabels[predictedSpeed]}, and that ${redshiftLabels[predictedRedshift]}. Comparing that to what actually happened, what do you notice?`}
            {tutorStep === 'conceptual' &&
              'If every direction we look, distant galaxies’ light is stretched toward red, and the farther ones are stretched more, what might that suggest about the universe as a whole?'}
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
            <strong>1. Hubble's Law:</strong> redshift — and the recession speed it implies — is
            directly proportional to distance. A galaxy twice as far away is always redshifted
            twice as much.
          </p>
          <p style={{ marginBottom: '1rem', fontSize: '0.95rem', color: '#333', lineHeight: '1.6' }}>
            <strong>2. The cause is space itself expanding while the light travels</strong>,
            stretching its wavelength along with it — not a galaxy moving through space the way
            Gravitational Waves Experiment 5's source did (that motion-caused stretching is called
            the <strong>Doppler effect</strong>). These are genuinely different mechanisms, even
            though they can look similar in the numbers for nearby galaxies.
          </p>
          <p style={{ marginBottom: '1rem', fontSize: '0.95rem', color: '#333', lineHeight: '1.6' }}>
            <strong>3. This is why the Hubble constant is worth measuring</strong> — first named in
            Gravitational Waves Experiment 7 — it's the rate space is expanding at.
          </p>
          <p style={{ marginBottom: '1rem', fontSize: '0.95rem', color: '#333', lineHeight: '1.6' }}>
            <strong>4. The real Hubble constant's precise value is still actively debated</strong>{' '}
            by astronomers, a disagreement known as the "Hubble tension."
          </p>
          <p style={{ marginBottom: '0', fontSize: '0.95rem', color: '#333', lineHeight: '1.6' }}>
            <strong>5. This experiment's formula is only accurate for relatively nearby
            galaxies.</strong> At very large distances, the real relationship between distance and
            redshift is more complicated — a later topic.
          </p>
        </div>
      )}
    </div>
  )
}
