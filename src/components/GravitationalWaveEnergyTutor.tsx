import { useState } from 'react'
import {
  ENERGY_PART1_MASS,
  REAL_GW150914_ENERGY,
  energyGuessMatches,
  energyRunSummary,
} from '../physics/gravitationalWaveEnergyExperiment'
import type { EnergyChoice } from '../physics/gravitationalWaveEnergyExperiment'

// Gravitational Waves, Experiment 3's tutor (Part 4), audited to the newer rules
// (docs/audit/gravitational-waves/03-draft-wording.md, section 9). The prompts point to the white YOUR GUESS mark by name and
// give no verdict; the explanation marks the guess, with every number and the "matched" taken from the physics module
// (CLAUDE.md §9). All wording is draft for the owner's line-by-line approval (CLAUDE.md §28.1).

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
  const light = energyRunSummary(ENERGY_PART1_MASS)
  const heavy = energyRunSummary(3)
  const f3 = (value: number) => value.toFixed(3)
  const matched = energyGuessMatches(energyPrediction)
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
              'Look at the brown line in Picture 3 and at the arm lengths in Picture 2. What did you notice about the orbital energy as the wave got faster and louder?'}
            {tutorStep === 'compare' &&
              `On Picture 3, the white box marked YOUR GUESS shows that you predicted the orbital energy ${energyLabels[energyPrediction]}. Look at the white mark, at the brown line and at the row "Orbital energy left" in Table 1 in Part 3. If you have run other masses in Part 2, your guess is drawn on Drawing C too. What do you notice when you put your guess next to the real line?`}
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
            <strong>0. Your guess, marked.</strong> You guessed that the orbital energy {energyLabels[energyPrediction]}. In the run it went from{' '}
            {f3(light.startEnergy)} to {f3(light.finalRemainingEnergy)}: it decreased. Your guess {matched ? 'matched' : 'did not match'}.
          </p>
          <p style={{ marginBottom: '1rem', fontSize: '0.95rem', color: '#333', lineHeight: '1.6' }}>
            <strong>1. A gravitational wave carries real energy away from the orbiting pair</strong>{' '}
            — producing it is not free. Every bit of energy in the wave came from somewhere, and
            that somewhere is the orbit itself.
          </p>
          <p style={{ marginBottom: '1rem', fontSize: '0.95rem', color: '#333', lineHeight: '1.6' }}>
            <strong>2. Losing that orbital energy is what causes the orbit to shrink</strong>, which
            is why the pair orbits faster and the wave chirps. A daily-life comparison: a pendulum swinging in air loses a little energy
            to the air with every swing, and with less energy it swings lower and lower. Nothing pulls it down directly. In the same way, a
            pair that has lost energy cannot keep its wide path and settles into a smaller one, and a smaller orbit is a faster one. This is
            the cause behind the effect you saw in &ldquo;The Chirp&rdquo;.
          </p>
          <p style={{ marginBottom: '1rem', fontSize: '0.95rem', color: '#333', lineHeight: '1.6' }}>
            <strong>3. A bigger mass pair has more orbital energy to lose</strong>: in this page&rsquo;s formula the energy at the start is
            the mass, so a pair of mass 3.0 starts with {f3(heavy.startEnergy)}, ten times the {f3(light.startEnergy)} of the pair you
            watched. That is part of why it produces a louder wave.
          </p>
          <p style={{ marginBottom: '1rem', fontSize: '0.95rem', color: '#333', lineHeight: '1.6' }}>
            <strong>4. The energy scale shown here is a simplified stand-in</strong>, not the real equations that actually govern how a
            real inspiral radiates energy. Its line is straight; a real inspiral loses energy faster the closer the pair gets.
          </p>
          <p style={{ marginBottom: '0', fontSize: '0.95rem', color: '#333', lineHeight: '1.6' }}>
            <strong>5. A real detection shows this on an enormous scale</strong> — LIGO&rsquo;s GW150914 detection (2015) came from two
            black holes of about {REAL_GW150914_ENERGY.initialSolarMasses[0]} and {REAL_GW150914_ENERGY.initialSolarMasses[1]} solar masses,
            and about {REAL_GW150914_ENERGY.radiatedSolarMasses} solar masses&rsquo; worth of energy left as gravitational waves. At its peak
            the power in the waves was more than ten times the combined light power of all the stars and galaxies in the observable
            Universe.
          </p>
        </div>
      )}
    </div>
  )
}
