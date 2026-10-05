import { useState } from 'react'

type FirstDetectorChoice = 'Hanford' | 'Livingston' | 'Virgo'
type TimingChoice = 'same' | 'different'
type TutorStep = 'observe' | 'compare' | 'conceptual' | 'explained'

interface GravitationalWaveTriangulationTutorProps {
  predictedFirstDetector: FirstDetectorChoice
  predictedTiming: TimingChoice
  actualFirstDetector: string
  actualMaxGapMs: number
  onExplained?: () => void
}

const timingLabels: Record<TimingChoice, string> = {
  same: 'essentially the same instant',
  different: 'measurably different times',
}

export function GravitationalWaveTriangulationTutor({
  predictedFirstDetector,
  predictedTiming,
  actualFirstDetector,
  actualMaxGapMs,
  onExplained,
}: GravitationalWaveTriangulationTutorProps) {
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
              'What did you notice about the order and timing of the three pulses?'}
            {tutorStep === 'compare' &&
              `You predicted ${predictedFirstDetector} would arrive first, and that the three arrivals would be ${timingLabels[predictedTiming]}. In fact, ${actualFirstDetector} arrived first, and the gaps between the three ranged up to ${actualMaxGapMs.toFixed(2)} ms. Comparing that to what you predicted, what do you notice?`}
            {tutorStep === 'conceptual' &&
              'If you only had one detector, could you have known which direction the wave came from? What does having three give you that one doesn\'t?'}
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
            <strong>1. A single detector can tell you a wave arrived, but not which direction it
            came from.</strong> One pulse, by itself, carries no directional information.
          </p>
          <p style={{ marginBottom: '1rem', fontSize: '0.95rem', color: '#333', lineHeight: '1.6' }}>
            <strong>2. Because the wave travels at a fixed, finite speed — the same invariant `c`
            from the Relativity of Time and Motion chapter — and the detectors are far apart, the
            arrival-time differences carry directional information</strong>, the same way the three
            friends in a field from the introduction could work out roughly where a shout came from
            just by comparing when each of them heard it.
          </p>
          <p style={{ marginBottom: '1rem', fontSize: '0.95rem', color: '#333', lineHeight: '1.6' }}>
            <strong>3. Comparing the gaps across pairs of detectors narrows the possible sky
            region, and a third detector narrows it further than two alone could</strong> — exactly
            the two illustrative wedges you saw on the diagram, one per pair.
          </p>
          <p style={{ marginBottom: '0', fontSize: '0.95rem', color: '#333', lineHeight: '1.6' }}>
            <strong>4. This is how real discoveries like GW170817 were matched to a specific patch
            of sky</strong> that telescopes could then point at and observe the matching light
            (Experiment 4).
          </p>
        </div>
      )}
    </div>
  )
}
