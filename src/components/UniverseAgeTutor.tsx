import { useState } from 'react'
import { BEST_FIT_DARK_ENERGY_FRACTION } from '../physics/darkEnergyExperiment'

type MatterOnlyAgeChoice = 'longer' | 'shorter' | 'same'
type DarkEnergyAgeChoice = 'older' | 'younger' | 'same'
type TutorStep = 'observe' | 'compare' | 'conceptual' | 'explained'

interface UniverseAgeTutorProps {
  predictedMatterOnly: MatterOnlyAgeChoice
  predictedDarkEnergy: DarkEnergyAgeChoice
  onExplained?: () => void
}

const matterOnlyLabels: Record<MatterOnlyAgeChoice, string> = {
  longer: 'be older than',
  shorter: 'be younger than',
  same: 'be the same age as',
}

const darkEnergyLabels: Record<DarkEnergyAgeChoice, string> = {
  older: 'make the universe older',
  younger: 'make the universe younger',
  same: 'leave the universe the same age',
}

export function UniverseAgeTutor({ predictedMatterOnly, predictedDarkEnergy, onExplained }: UniverseAgeTutorProps) {
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
              'Compare where each line reaches size 1. What do you notice about the matter-only line (blue), the straight line (purple), and the line with your chosen dark energy (gold)?'}
            {tutorStep === 'compare' &&
              `You predicted that a matter-only universe would ${matterOnlyLabels[predictedMatterOnly]} Experiment 2's constant-speed estimate, and that adding dark energy would ${darkEnergyLabels[predictedDarkEnergy]}. Comparing that to what you saw, what do you notice?`}
            {tutorStep === 'conceptual' &&
              "Experiment 2's straight-line estimate came out close to the real age, even though the real expansion rate has changed. Why might it have turned out so close?"}
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
            <strong>1. The age depends on the whole expansion history, not only today's rate.</strong> Like
            the bathtub: knowing today's flow is not enough if the tap was turned up or down along the way.
          </p>
          <p style={{ marginBottom: '1rem', fontSize: '0.95rem', color: '#333', lineHeight: '1.6' }}>
            <strong>2. With matter only, the universe is young.</strong> Gravity slows the expansion, so in the
            past the universe was expanding faster than it is today, and it reached today's size sooner. Its
            age works out to only two thirds of the Hubble time. A car trip is the same: if you drove fast at
            first and then slowed down, the trip took less time than today's slower speed alone would suggest.
          </p>
          <p style={{ marginBottom: '1rem', fontSize: '0.95rem', color: '#333', lineHeight: '1.6' }}>
            <strong>3. Dark energy makes the universe older.</strong> It speeds the expansion up in recent
            times, so the expansion was slower for longer in the past. It took longer to reach today's size.
          </p>
          <p style={{ marginBottom: '1rem', fontSize: '0.95rem', color: '#333', lineHeight: '1.6' }}>
            <strong>4. The real answer matches the measurements.</strong> With about{' '}
            {Math.round(BEST_FIT_DARK_ENERGY_FRACTION * 100)}% dark energy, this model gives about 13.5
            billion years. With the slightly lower Hubble constant (about 67.4) and dark energy share (about
            68.5%) that the real fit uses, it gives about 13.8 billion years, matching the measured age.
          </p>
          <p style={{ marginBottom: '1rem', fontSize: '0.95rem', color: '#333', lineHeight: '1.6' }}>
            <strong>5. Experiment 2's estimate was close by coincidence.</strong> The early slowdown makes the
            age shorter than the Hubble time, and the later speed-up makes it longer again. The two effects
            roughly cancel. It was a useful estimate, not the real method.
          </p>
          <p style={{ marginBottom: '1rem', fontSize: '0.95rem', color: '#333', lineHeight: '1.6' }}>
            <strong>6. The universe cannot be younger than the oldest things in it.</strong> That is how a
            matter-only universe, only about 9 billion years old, was ruled out: it would be younger than the
            oldest known star clusters.
          </p>
          <p style={{ marginBottom: '0', fontSize: '0.95rem', color: '#333', lineHeight: '1.6' }}>
            <strong>7. Not covered here:</strong> radiation and inflation's effect on the age, curved
            universes, and how star ages are measured. Remember too that this experiment used a flat universe
            with only matter and a constant dark energy, and an illustrative Hubble constant.
          </p>
        </div>
      )}
    </div>
  )
}
