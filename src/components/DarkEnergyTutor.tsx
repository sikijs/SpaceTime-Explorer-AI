import { useState } from 'react'
import {
  BEST_FIT_DARK_ENERGY_FRACTION,
  GUESS_REDSHIFT,
  PUBLISHED_DESI_SIGMA_RANGE,
  PUBLISHED_UNIVERSE_SHARES_PERCENT,
  actualGravityEffect,
  actualLooks,
  brightnessExample,
  decelerationParameter,
  gravityGuessMatches,
  looksGuessMatches,
  nearbyAgreementPercent,
} from '../physics/darkEnergyExperiment'
import type { GravityGuess, LooksGuess } from '../physics/darkEnergyExperiment'

// Cosmology, Experiment 5, Part 4: the tutor (docs/audit/cosmology/05-draft-wording.md, section 6).
// The observe and compare steps state no outcome and no verdict (CLAUDE.md §12, §13); the explanation marks each guess, and nowhere
// earlier. Every number and every "matches" comes from the physics module.

type TutorStep = 'observe' | 'compare' | 'conceptual' | 'explained'

interface DarkEnergyTutorProps {
  predictedGravity: GravityGuess
  predictedLooks: LooksGuess
  onExplained?: () => void
}

const gravityLabels: Record<GravityGuess, string> = {
  slow: 'slow the expansion down',
  speed: 'speed the expansion up',
  none: 'not change the expansion',
}
const looksLabels: Record<LooksGuess, string> = { brighter: 'look brighter', same: 'look the same', dimmer: 'look dimmer' }
const gravityMarks: Record<GravityGuess, string> = { slow: 'white arrow pointing up', speed: 'white arrow pointing down', none: 'white dot on the zero line' }
const looksMarks: Record<LooksGuess, string> = { brighter: 'larger than the dashed ring', same: 'the same size as the dashed ring', dimmer: 'smaller than the dashed ring' }

const paragraph = { marginBottom: '1rem', fontSize: '0.95rem', color: '#333', lineHeight: '1.6' } as const

// The question for each step before the explanation. None of them states an outcome or a verdict (§12, §13).
export function tutorPrompt(step: 'observe' | 'compare' | 'conceptual', gravity: GravityGuess, looks: LooksGuess): string {
  if (step === 'observe')
    return 'Look at the blue line (matter only) and the green dashed line (astronomers’ best fit) on the graph, and at the glowing green disks inside their dashed rings. What do you notice as redshift increases?'
  if (step === 'compare')
    return `Your white marks show your two guesses: that gravity alone, in a universe of only matter, would ${gravityLabels[gravity]} (your ${gravityMarks[gravity]} on the panel), and that if the expansion were speeding up a faraway supernova would ${looksLabels[looks]} (your white ring, ${looksMarks[looks]}, and your white marker on the graph). Look at the white marks beside the real pictures. What do you notice?`
  return 'If distant supernovae look dimmer than a slowing universe predicts, what must have happened to the expansion while their light was on its way to us?'
}

export function DarkEnergyTutor({ predictedGravity, predictedLooks, onExplained }: DarkEnergyTutorProps) {
  const [tutorStep, setTutorStep] = useState<TutorStep>('observe')
  const [responseInput, setResponseInput] = useState('')

  const handleContinue = () => {
    if (responseInput.trim() === '') return
    if (tutorStep === 'observe') setTutorStep('compare')
    else if (tutorStep === 'compare') setTutorStep('conceptual')
    else if (tutorStep === 'conceptual') {
      setTutorStep('explained')
      onExplained?.()
    }
    setResponseInput('')
  }

  const isResponseEmpty = responseInput.trim() === ''

  return (
    <div style={{ marginTop: '1rem', padding: '1.5rem', border: '1px solid #d9e8f5', borderRadius: '8px', backgroundColor: '#f0f7ff' }}>
      <h2 style={{ marginTop: 0, marginBottom: '1rem', fontSize: '1.125rem', color: '#0066cc' }}>Let&rsquo;s reflect on what you observed</h2>

      {(tutorStep === 'observe' || tutorStep === 'compare' || tutorStep === 'conceptual') && (
        <div>
          <p style={{ marginBottom: '1rem', fontSize: '0.95rem', color: '#333' }}>{tutorPrompt(tutorStep, predictedGravity, predictedLooks)}</p>
          <textarea
            value={responseInput}
            onChange={(e) => setResponseInput(e.target.value)}
            placeholder="Type your thoughts here..."
            style={{ width: '100%', minHeight: '100px', padding: '0.75rem', fontSize: '0.875rem', border: '1px solid #ccc', borderRadius: '4px', fontFamily: 'inherit', resize: 'vertical' }}
          />
          <button
            type="button"
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

      {tutorStep === 'explained' && <DarkEnergyExplanation predictedGravity={predictedGravity} predictedLooks={predictedLooks} />}
    </div>
  )
}

// The explanation, as its own piece so that its marking can be checked for every pair of guesses.
export function DarkEnergyExplanation({ predictedGravity, predictedLooks }: { predictedGravity: GravityGuess; predictedLooks: LooksGuess }) {
  const gravityOk = gravityGuessMatches(predictedGravity)
  const looksOk = looksGuessMatches(predictedLooks)
  const example = brightnessExample(BEST_FIT_DARK_ENERGY_FRACTION)
  const q0None = decelerationParameter(0)
  const shares = PUBLISHED_UNIVERSE_SHARES_PERCENT
  return (
    <div>
      <p style={paragraph}>
        <strong>1. A standard candle&rsquo;s dimness tells us its distance.</strong> A Type Ia supernova gives out about the same amount of light each time, and light spreads out as it travels, so brightness falls with the square of the distance: a supernova that looks one quarter as bright is twice as far away.
      </p>
      <p style={paragraph}>
        <strong>2. Your first guess.</strong> You said that gravity alone, in a universe of only matter, would {gravityLabels[predictedGravity]} (the {gravityMarks[predictedGravity]}). In a universe with only matter, gravity {actualGravityEffect() === 'slow' ? 'slows' : 'changes'} the expansion: matter pulls on other matter, which works against the stretching of space. Think of a
        ball rolling up a hill: the hill&rsquo;s pull slows it down. That is the blue dot at {q0None > 0 ? '+' : ''}
        {q0None.toFixed(2)} on the panel, above the zero line. <strong>{gravityOk ? 'That is what you guessed.' : 'That is not what you guessed.'}</strong>
      </p>
      <p style={paragraph}>
        <strong>3. Your second guess.</strong> You said a faraway supernova would {looksLabels[predictedLooks]} if the expansion were speeding up (the white ring and marker). With astronomers&rsquo; best fit it looks {actualLooks()}: at redshift {GUESS_REDSHIFT} it is {(example.brightness * 100).toFixed(0)} percent as bright as in a matter-only universe, because the extra
        stretching of space has carried it farther away: {example.distanceMpc.toFixed(0)} Mpc instead of {example.matterOnlyDistanceMpc.toFixed(0)}. <strong>{looksOk ? 'That is what you guessed.' : 'That is not what you guessed.'}</strong>
      </p>
      <p style={paragraph}>
        <strong>4. Real distant supernovae look dimmer than a slowing universe predicts.</strong> So they are farther away than a slowing universe says, and the expansion must have sped up while their light was on its way. Two teams found this in 1998. The 2011 Nobel Prize in Physics went to three of the astronomers involved,
        &ldquo;for the discovery of the accelerating expansion of the Universe through observations of distant supernovae&rdquo; (the Royal Swedish Academy of Sciences).
      </p>
      <p style={paragraph}>
        <strong>5. Dark energy is the name for whatever drives the speed-up.</strong> NASA gives it about {shares.darkEnergy} percent of the universe&rsquo;s energy, with dark matter about {shares.darkMatter} percent and ordinary matter about {shares.ordinaryMatter} percent. What it is, nobody yet knows. NASA lists four ideas: a built-in energy of empty space, a new kind of changing energy,
        odd &ldquo;defects&rdquo; in space, or a flaw in our theory of gravity. The simplest model, used here, is a constant energy of empty space. As of November 2026, whether it is truly constant is being tested: the DESI survey&rsquo;s 2025 result prefers dark energy that changes with time over a constant one by {PUBLISHED_DESI_SIGMA_RANGE.low} to{' '}
        {PUBLISHED_DESI_SIGMA_RANGE.high} sigma, depending on which supernova list is used, and the Cosmic Horizons experiment on evolving dark energy looks at that question.
      </p>
      <p style={paragraph}>
        <strong>6. Dark energy is a different idea from dark matter</strong> (Cosmology 4). Dark matter has mass and so has gravity; it helps hold galaxies together. Dark energy is whatever makes the expansion of space itself speed up. They were found in different ways (orbit speeds and lensing for dark matter, supernova brightness for dark energy) and they take different shares of the universe (about {shares.darkMatter} and{' '}
        {shares.darkEnergy} percent, NASA). Nobody yet knows what either one is, and the sources read here do not say whether they are connected.
      </p>
      <p style={paragraph}>
        <strong>7. Nearby objects agree in every universe.</strong> For close-by supernovae all the models give almost the same distance (at redshift 0.01, within {nearbyAgreementPercent().toFixed(1)} percent), which is why the simple formula in Cosmology 1 worked for nearby galaxies.
      </p>
      <p style={{ ...paragraph, marginBottom: 0 }}>
        <strong>8. Not covered here:</strong> what dark energy is, whether it changes over time, radiation in the early universe, curved universes and how real supernova data are calibrated. Remember that this experiment used a flat universe, a constant dark energy and perfectly equal supernovae, and that the best fit is a model, not raw data.
      </p>
    </div>
  )
}
