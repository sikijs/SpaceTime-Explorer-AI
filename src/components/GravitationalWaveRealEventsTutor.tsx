import { useState } from 'react'

type LouderChoice = 'black-holes' | 'neutron-stars' | 'same'
type TutorStep = 'observe' | 'compare' | 'conceptual' | 'explained'

interface GravitationalWaveRealEventsTutorProps {
  louderPrediction: LouderChoice
  onExplained?: () => void
}

const louderLabels: Record<LouderChoice, string> = {
  'black-holes': 'the black holes',
  'neutron-stars': 'the neutron stars',
  same: 'they would be the same',
}

export function GravitationalWaveRealEventsTutor({ louderPrediction, onExplained }: GravitationalWaveRealEventsTutorProps) {
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
              "What did you notice about this chirp compared to the ones you've run before?"}
            {tutorStep === 'compare' &&
              `You predicted ${louderLabels[louderPrediction]} would produce the louder, faster-rising chirp. In fact, the black holes (GW150914) always do. Comparing what you expected to what's actually true, what do you notice?`}
            {tutorStep === 'conceptual' &&
              'Why would two black holes, so much heavier than two neutron stars, produce a louder and faster chirp?'}
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
            <strong>1. This reuses the exact same chirp and energy-loss model as the last two experiments</strong>{' '}
            — only the mass differs. Nothing new was calculated to compare these two real events.
          </p>
          <p style={{ marginBottom: '1rem', fontSize: '0.95rem', color: '#333', lineHeight: '1.6' }}>
            <strong>2. GW150914's much larger total mass is why its chirp is louder and reaches its
            final moment faster</strong> — the same "bigger mass, louder and faster" relationship you
            already saw in the last two experiments, now anchored to two real, named detections.
          </p>
          <p style={{ marginBottom: '1rem', fontSize: '0.95rem', color: '#333', lineHeight: '1.6' }}>
            <strong>3. Multi-messenger astronomy:</strong> GW170817, from two neutron stars, was also
            seen in light — a gamma-ray burst and a glowing afterglow — because neutron stars have
            surfaces and material that can radiate light when they collide, while black holes do not.
          </p>
          <p style={{ marginBottom: '1rem', fontSize: '0.95rem', color: '#333', lineHeight: '1.6' }}>
            <strong>4. This is why GW170817 could be pinned down to a specific galaxy and distance
            with far more precision than GW150914 could</strong>, directly from the added light
            observations.
          </p>
          <p style={{ marginBottom: '0', fontSize: '0.95rem', color: '#333', lineHeight: '1.6' }}>
            <strong>5. This toy model is a simplified stand-in</strong>, not a faithful reconstruction
            of either real signal.
          </p>
        </div>
      )}
    </div>
  )
}
