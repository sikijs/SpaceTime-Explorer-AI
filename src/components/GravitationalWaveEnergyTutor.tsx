import { useState } from 'react'

type EnergyChoice = 'increases' | 'decreases' | 'stays-the-same'
type TutorStep = 'observe' | 'compare' | 'conceptual' | 'explained'

interface GravitationalWaveEnergyTutorProps {
  energyPrediction: EnergyChoice
  onExplained?: () => void
}

const energyLabels: Record<EnergyChoice, string> = {
  increases: 'increases',
  decreases: 'decreases',
  'stays-the-same': 'stays the same',
}

export function GravitationalWaveEnergyTutor({ energyPrediction, onExplained }: GravitationalWaveEnergyTutorProps) {
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
              'What did you notice about the orbital energy as the wave got faster and louder?'}
            {tutorStep === 'compare' &&
              `You predicted the orbital energy ${energyLabels[energyPrediction]}. In fact, it always decreases — the pair starts with a fixed budget of orbital energy and steadily loses it as the run goes on. Comparing what you expected to what's actually true, what do you notice?`}
            {tutorStep === 'conceptual' &&
              'If the wave is carrying energy away, where does that energy come from?'}
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
            <strong>1. A gravitational wave carries real energy away from the orbiting pair</strong>{' '}
            — producing it is not free. Every bit of energy in the wave came from somewhere, and
            that somewhere is the orbit itself.
          </p>
          <p style={{ marginBottom: '1rem', fontSize: '0.95rem', color: '#333', lineHeight: '1.6' }}>
            <strong>2. Losing that orbital energy is what causes the orbit to shrink</strong>, which
            is why the pair orbits faster and the wave chirps — this is the cause behind the effect
            you already saw in the last experiment.
          </p>
          <p style={{ marginBottom: '1rem', fontSize: '0.95rem', color: '#333', lineHeight: '1.6' }}>
            <strong>3. A bigger mass pair has more orbital energy to lose</strong>, which is part of
            why it produces a louder wave than a smaller mass pair.
          </p>
          <p style={{ marginBottom: '1rem', fontSize: '0.95rem', color: '#333', lineHeight: '1.6' }}>
            <strong>4. The energy scale shown here is a simplified stand-in</strong>, not the real
            post-Newtonian energy-flux equations that actually govern how a real inspiral radiates
            energy.
          </p>
          <p style={{ marginBottom: '0', fontSize: '0.95rem', color: '#333', lineHeight: '1.6' }}>
            <strong>5. A real detection shows this on an enormous scale</strong> — LIGO's GW150914
            detection (2015) converted roughly 3 solar masses' worth of energy into gravitational
            waves in about two-tenths of a second, releasing, for that brief instant, more power
            than the combined light of every star in the observable universe.
          </p>
        </div>
      )}
    </div>
  )
}
