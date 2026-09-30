import { useState } from 'react'

type PitchChoice = 'speeds-up' | 'slows-down' | 'stays-the-same'
type LoudnessChoice = 'stronger' | 'weaker' | 'stays-the-same'
type TimingChoice = 'small-mass' | 'large-mass' | 'same-time'
type TutorStep = 'observe' | 'compare' | 'conceptual' | 'explained'

interface GravitationalWaveChirpTutorProps {
  pitchPrediction: PitchChoice
  loudnessPrediction: LoudnessChoice
  timingPrediction: TimingChoice
  onExplained?: () => void
}

const pitchLabels: Record<PitchChoice, string> = {
  'speeds-up': 'speeds up',
  'slows-down': 'slows down',
  'stays-the-same': 'stays the same',
}

const loudnessLabels: Record<LoudnessChoice, string> = {
  stronger: 'gets stronger (louder)',
  weaker: 'gets weaker',
  'stays-the-same': 'stays the same strength',
}

const timingLabels: Record<TimingChoice, string> = {
  'small-mass': 'the small-mass pair reaches its final moment sooner',
  'large-mass': 'the large-mass pair reaches its final moment sooner',
  'same-time': 'they take the same time',
}

export function GravitationalWaveChirpTutor({
  pitchPrediction,
  loudnessPrediction,
  timingPrediction,
  onExplained,
}: GravitationalWaveChirpTutorProps) {
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
              "What did you notice about the wave's pitch and loudness as the run went on?"}
            {tutorStep === 'compare' &&
              `You predicted the pitch ${pitchLabels[pitchPrediction]}. In fact, the pitch always speeds up. You predicted the wave ${loudnessLabels[loudnessPrediction]}. In fact, it always gets stronger. You predicted ${timingLabels[timingPrediction]}. In fact, the large-mass pair always reaches its final moment sooner. Comparing what you expected to what's actually true, what do you notice?`}
            {tutorStep === 'conceptual' &&
              'Why would two objects spiraling closer and closer together make the wave both faster and stronger, right up until they meet?'}
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
            <strong>1. A real gravitational wave from an inspiraling pair "chirps"</strong> — its
            pitch and loudness both rise as the two objects spiral closer together, right up to
            the final moment, instead of arriving at one steady note.
          </p>
          <p style={{ marginBottom: '1rem', fontSize: '0.95rem', color: '#333', lineHeight: '1.6' }}>
            <strong>2. This happens because the pair orbits faster as it gets closer
            together</strong> — the same "closer and faster" relationship the Orbit experiment
            already showed — and a faster orbit produces a faster-oscillating, stronger wave.
          </p>
          <p style={{ marginBottom: '1rem', fontSize: '0.95rem', color: '#333', lineHeight: '1.6' }}>
            <strong>3. A bigger mass pair follows this same pattern on a shorter timescale</strong>,
            which is why it reaches its final moment sooner than a smaller mass pair.
          </p>
          <p style={{ marginBottom: '1rem', fontSize: '0.95rem', color: '#333', lineHeight: '1.6' }}>
            <strong>4. The exact final moment — the merger — and everything after it aren't
            modeled here</strong>, an idealized cutoff, the same simplification this project
            already gives the Twin Paradox's turnaround. And the mass-to-chirp relationship you
            just saw is a simplified, explicitly-labeled stand-in for the real physics, not the
            actual equations that govern a real inspiral.
          </p>
          <p style={{ marginBottom: '0', fontSize: '0.95rem', color: '#333', lineHeight: '1.6' }}>
            <strong>5. A real chirp's rising shape is exactly how LIGO works out how massive and
            how far away a real source was</strong> — GW150914's real signal rose in frequency
            from roughly 35 Hz to roughly 250 Hz over about two-tenths of a second before merging,
            the same kind of rising "whoop" this experiment models in miniature.
          </p>
        </div>
      )}
    </div>
  )
}
