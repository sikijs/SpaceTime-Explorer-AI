import { useState } from 'react'

type NearFarChoice = 'nearby-louder' | 'far-louder' | 'same'
type DistanceKnowChoice = 'yes' | 'no'
type TutorStep = 'observe' | 'compare' | 'conceptual' | 'explained'

interface GravitationalWaveStandardSirenTutorProps {
  predictedNearFar: NearFarChoice
  predictedDistanceKnow: DistanceKnowChoice
  trueAmplitude: number
  detectedAmplitude: number
  recoveredDistanceMpc: number
  eventLabel: string
  hubbleConstant: number | null
  onExplained?: () => void
}

const nearFarLabels: Record<NearFarChoice, string> = {
  'nearby-louder': 'the nearby one',
  'far-louder': 'the far one',
  same: 'no difference',
}

const distanceKnowLabels: Record<DistanceKnowChoice, string> = {
  yes: 'yes, the detected amplitude alone would be enough',
  no: 'no, the detected amplitude alone would not be enough',
}

export function GravitationalWaveStandardSirenTutor({
  predictedNearFar,
  predictedDistanceKnow,
  trueAmplitude,
  detectedAmplitude,
  recoveredDistanceMpc,
  eventLabel,
  hubbleConstant,
  onExplained,
}: GravitationalWaveStandardSirenTutorProps) {
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
              'What did you notice about the true amplitude compared to the detected amplitude?'}
            {tutorStep === 'compare' &&
              `You predicted ${nearFarLabels[predictedNearFar]} would look stronger, and that ${distanceKnowLabels[predictedDistanceKnow]}. In fact, the true amplitude was ${trueAmplitude.toFixed(4)} while the detected amplitude was only ${detectedAmplitude.toFixed(6)} — and comparing the two recovered a distance of ${recoveredDistanceMpc.toFixed(1)} Mpc for ${eventLabel}. Comparing that to what you predicted, what do you notice?`}
            {tutorStep === 'conceptual' &&
              "If a gravitational wave's amplitude alone doesn't tell you the distance, what does, and why does the chirp's shape matter here?"}
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
            <strong>1. Amplitude weakens with distance</strong>, the same inverse relationship as a
            sound or a light growing fainter the farther away it is.
          </p>
          <p style={{ marginBottom: '1rem', fontSize: '0.95rem', color: '#333', lineHeight: '1.6' }}>
            <strong>2. The chirp's own shape reveals the true, distance-independent amplitude</strong>,
            because how quickly its frequency rises depends only on the masses involved, not on how
            far away it traveled.
          </p>
          <p style={{ marginBottom: '1rem', fontSize: '0.95rem', color: '#333', lineHeight: '1.6' }}>
            <strong>3. Comparing the true amplitude to the weaker detected amplitude gives distance
            directly</strong> — the standard-siren method itself, the gravitational-wave version of
            using a light source of known brightness to work out how far away it is.
          </p>
          <p style={{ marginBottom: '0', fontSize: '0.95rem', color: '#333', lineHeight: '1.6' }}>
            <strong>4. Pairing that distance with a separately measured recession velocity gives an
            estimate of the Hubble constant</strong> — exactly as done for the real GW170817 event in
            2017 ({hubbleConstant !== null ? `giving ${hubbleConstant.toFixed(1)} km/s/Mpc here, though the real measurement's uncertainty was much larger than this one toy run suggests` : 'an estimate not possible for GW150914, since it had no light counterpart and so no host-galaxy recession velocity was ever measured for it'}).
          </p>
        </div>
      )}
    </div>
  )
}
