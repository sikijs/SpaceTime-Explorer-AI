import { useState } from 'react'
import { BEST_FIT_DARK_ENERGY_FRACTION } from '../physics/darkEnergyExperiment'

type GravityEffectChoice = 'slow' | 'speed' | 'none'
type LooksChoice = 'brighter' | 'same' | 'dimmer'
type TutorStep = 'observe' | 'compare' | 'conceptual' | 'explained'

interface DarkEnergyTutorProps {
  predictedGravity: GravityEffectChoice
  predictedLooks: LooksChoice
  onExplained?: () => void
}

const gravityLabels: Record<GravityEffectChoice, string> = {
  slow: 'slow the expansion down',
  speed: 'speed the expansion up',
  none: 'not change the expansion',
}

const looksLabels: Record<LooksChoice, string> = {
  brighter: 'look brighter',
  same: 'look the same',
  dimmer: 'look dimmer',
}

export function DarkEnergyTutor({ predictedGravity, predictedLooks, onExplained }: DarkEnergyTutorProps) {
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
              'Compare the blue line (matter-only universe) with the amber line (your chosen dark energy). What do you notice as redshift increases?'}
            {tutorStep === 'compare' &&
              `You predicted that gravity alone, in a matter-only universe, would ${gravityLabels[predictedGravity]}, and that if the expansion were speeding up, a faraway supernova would ${looksLabels[predictedLooks]}. Comparing that to what you saw, what do you notice?`}
            {tutorStep === 'conceptual' &&
              'If distant supernovae look dimmer than a slowing universe predicts, what must have happened to the expansion while their light was on its way to us?'}
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
            <strong>1. A standard candle's dimness tells us its distance.</strong> A Type Ia supernova has a
            known true brightness, and light spreads out as it travels, so brightness falls with the square of
            the distance: a supernova that looks one quarter as bright is twice as far away.
          </p>
          <p style={{ marginBottom: '1rem', fontSize: '0.95rem', color: '#333', lineHeight: '1.6' }}>
            <strong>2. In a universe with only matter, gravity slows the expansion.</strong> Matter pulls on
            other matter, which works against the stretching of space. That gives a definite prediction for
            how bright a supernova at each redshift should look: the blue line.
          </p>
          <p style={{ marginBottom: '1rem', fontSize: '0.95rem', color: '#333', lineHeight: '1.6' }}>
            <strong>3. Real distant supernovae look dimmer than that.</strong> So they are farther away than a
            slowing universe predicts, which means that while their light was traveling, the expansion was
            speeding up. Two independent research teams found this in 1998 and 1999, and it shared the 2011
            Nobel Prize in Physics.
          </p>
          <p style={{ marginBottom: '1rem', fontSize: '0.95rem', color: '#333', lineHeight: '1.6' }}>
            <strong>4. Dark energy is the name for whatever drives the speed-up.</strong> Astronomers estimate
            it makes up about {Math.round(BEST_FIT_DARK_ENERGY_FRACTION * 100)}% of the universe's total
            energy today, with dark matter about 25% and ordinary matter about 5%. What it is, we do not know.
            The simplest model, used here, is a constant energy density of empty space, the same everywhere
            and at all times. Whether it really stays constant over cosmic time is an open research question.
          </p>
          <p style={{ marginBottom: '1rem', fontSize: '0.95rem', color: '#333', lineHeight: '1.6' }}>
            <strong>5. Dark energy is a different idea from dark matter</strong> (Experiment 4). Dark matter
            pulls inward with gravity and holds galaxies together. Dark energy is whatever makes the expansion
            of space itself speed up.
          </p>
          <p style={{ marginBottom: '1rem', fontSize: '0.95rem', color: '#333', lineHeight: '1.6' }}>
            <strong>6. Nearby objects agree in every universe.</strong> For close-by supernovae, all the
            models give essentially the same distance, which is why the simple formula in Hubble's Law
            (Experiment 1) worked for nearby galaxies. The versions of the universe only disagree at large
            distances.
          </p>
          <p style={{ marginBottom: '0', fontSize: '0.95rem', color: '#333', lineHeight: '1.6' }}>
            <strong>7. Not covered here:</strong> what dark energy is, whether it changes over time, the role
            of radiation in the early universe, curved universes, and how real supernova data are calibrated.
            Remember too that this experiment used a flat universe, a constant dark energy, and perfect
            standard candles, and that the "best fit" line is a model, not raw data.
          </p>
        </div>
      )}
    </div>
  )
}
