import { useState } from 'react'
import {
  CMB_TEMPERATURE_TODAY_KELVIN,
  RECOMBINATION_REDSHIFT,
  RECOMBINATION_YEARS_AFTER_BIG_BANG,
  cmbTemperatureKelvin,
} from '../physics/cosmicMicrowaveBackgroundExperiment'

type TemperatureChoice = 'higher' | 'lower' | 'same'
type SkyChoice = 'uniform' | 'varies'
type TutorStep = 'observe' | 'compare' | 'conceptual' | 'explained'

interface CosmicMicrowaveBackgroundTutorProps {
  predictedTemperature: TemperatureChoice
  predictedSky: SkyChoice
  onExplained?: () => void
}

const temperatureLabels: Record<TemperatureChoice, string> = {
  higher: 'higher at recombination than today',
  lower: 'lower at recombination than today',
  same: 'the same at recombination as today',
}

const skyLabels: Record<SkyChoice, string> = {
  uniform: 'about the same in every direction',
  varies: 'varying a lot from direction to direction',
}

export function CosmicMicrowaveBackgroundTutor({
  predictedTemperature,
  predictedSky,
  onExplained,
}: CosmicMicrowaveBackgroundTutorProps) {
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
              "What did you notice about the marker's color, and the temperature in the readout, as you moved between recombination and today?"}
            {tutorStep === 'compare' &&
              `You predicted the background was ${temperatureLabels[predictedTemperature]}, and ${skyLabels[predictedSky]}. Comparing that to what actually happened, what do you notice?`}
            {tutorStep === 'conceptual' &&
              'If this light has been traveling almost since the very beginning of the universe, what does that make it, compared to any other light we could ever observe?'}
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
            <strong>1. Recombination</strong>, roughly {RECOMBINATION_YEARS_AFTER_BIG_BANG.toLocaleString()}{' '}
            years after the Big Bang, is when the universe first became transparent to light. Before that,
            light kept scattering off free electrons, like a headlight in fog. Afterward, it could travel
            freely, and that first light is what we now call the Cosmic Microwave Background.
          </p>
          <p style={{ marginBottom: '1rem', fontSize: '0.95rem', color: '#333', lineHeight: '1.6' }}>
            <strong>2. That light has been stretched by the expanding universe ever since</strong>, the same
            stretching you saw in Experiment 1, now applied to the oldest light there is. Its temperature
            follows the exact rule <code>T = T0 × (1 + z)</code>. With{' '}
            <code>T0 = {CMB_TEMPERATURE_TODAY_KELVIN} K</code> and <code>z ≈ {RECOMBINATION_REDSHIFT}</code>,
            that is {CMB_TEMPERATURE_TODAY_KELVIN} × {(1 + RECOMBINATION_REDSHIFT).toFixed(1)} ≈{' '}
            {cmbTemperatureKelvin(RECOMBINATION_REDSHIFT).toFixed(0)} K at release, cooling to{' '}
            {CMB_TEMPERATURE_TODAY_KELVIN} K today. Unlike Experiment 1's formula for nearby galaxies, this
            rule is exact at any redshift.
          </p>
          <p style={{ marginBottom: '1rem', fontSize: '0.95rem', color: '#333', lineHeight: '1.6' }}>
            <strong>3. The CMB looks almost exactly the same temperature in every direction.</strong> That is
            the real observation behind the horizon problem from Experiment 2: opposite patches of sky could
            never have exchanged heat, yet they match. It is also the reason cosmic inflation was proposed.
            Inflation is still debated, and this experiment does not settle it.
          </p>
          <p style={{ marginBottom: '1rem', fontSize: '0.95rem', color: '#333', lineHeight: '1.6' }}>
            <strong>4. This is real, measured evidence.</strong> Arno Penzias and Robert Wilson found it by
            accident in 1965, while trying to track down unexplained noise in a radio antenna. Later missions,
            COBE, WMAP and Planck, measured it with great precision.
          </p>
          <p style={{ marginBottom: '0', fontSize: '0.95rem', color: '#333', lineHeight: '1.6' }}>
            <strong>5. Not covered here:</strong> the physics of recombination itself, the CMB's real tiny
            temperature ripples and what they say about how galaxies formed, and its polarization. Those are
            later topics.
          </p>
        </div>
      )}
    </div>
  )
}
