import { useState } from 'react'
import {
  CMB_TEMPERATURE_TODAY_KELVIN,
  RECOMBINATION_REDSHIFT,
  RECOMBINATION_YEARS_AFTER_BIG_BANG,
  dipoleOneInParts,
  skyMarking,
  temperatureMarking,
} from '../physics/cosmicMicrowaveBackgroundExperiment'
import type { SkyGuess, TemperatureGuess } from '../physics/cosmicMicrowaveBackgroundExperiment'
import { fmtKelvin } from './CosmicMicrowaveBackgroundPictures'

// Cosmology, Experiment 3, Part 4: the tutor (docs/audit/cosmology/03-draft-wording.md, section 8).
// The observe and compare steps state no outcome and no verdict (CLAUDE.md §12, §13); the explanation marks each guess, and nowhere
// earlier. Every number and every "matches" comes from the physics module.

type TutorStep = 'observe' | 'compare' | 'conceptual' | 'explained'

interface CosmicMicrowaveBackgroundTutorProps {
  predictedTemperature: TemperatureGuess
  predictedSky: SkyGuess
  onExplained?: () => void
}

const temperatureLabels: Record<TemperatureGuess, string> = { higher: 'hotter', lower: 'cooler', same: 'the same' }
const temperatureMarks: Record<TemperatureGuess, string> = {
  higher: 'white arrow pointing right',
  lower: 'white arrow pointing left',
  same: 'white tick',
}
const skyLabels: Record<SkyGuess, string> = { uniform: 'about the same', varies: 'varying a lot' }
const skyMarks: Record<SkyGuess, string> = {
  uniform: 'white box at the small-difference end of the strip',
  varies: 'white box at the big-difference end of the strip',
}

const paragraph = { marginBottom: '1rem', fontSize: '0.95rem', color: '#333', lineHeight: '1.6' } as const

export function CosmicMicrowaveBackgroundTutor({ predictedTemperature, predictedSky, onExplained }: CosmicMicrowaveBackgroundTutorProps) {
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
  const t = temperatureMarking(predictedTemperature)
  const s = skyMarking(predictedSky)

  const temperatureVerdict = t.matches
    ? 'That matches the real marks: your arrow points toward the amber mark.'
    : predictedTemperature === 'same'
      ? 'That does not match the real marks: your tick sits on today’s mark, and the amber mark is far to its right.'
      : 'That does not match the real marks: your arrow points the other way from the amber mark.'
  const skyVerdict = s.matches
    ? 'That matches the real mark: your box is at the small-difference end, on the same side as the green mark.'
    : 'That does not match the real mark: your box is at the big-difference end, far from the green mark.'

  return (
    <div
      style={{
        marginTop: '1rem',
        padding: '1.5rem',
        border: '1px solid #d9e8f5',
        borderRadius: '8px',
        backgroundColor: '#f0f7ff',
      }}
    >
      <h2 style={{ marginTop: 0, marginBottom: '1rem', fontSize: '1.125rem', color: '#0066cc' }}>Let&rsquo;s reflect on what you observed</h2>

      {(tutorStep === 'observe' || tutorStep === 'compare' || tutorStep === 'conceptual') && (
        <div>
          <p style={paragraph}>
            {tutorStep === 'observe' &&
              'Look at the temperature panel. What do you notice about the amber mark at Recombination and the green mark at Today, and about how far apart they are on the tenfold scale?'}
            {tutorStep === 'compare' &&
              `You guessed the temperature was ${temperatureLabels[predictedTemperature]} at recombination: that is your ${temperatureMarks[predictedTemperature]} beside Today's mark. And you guessed the sky was ${skyLabels[predictedSky]} in every direction: that is your ${skyMarks[predictedSky]}. Compare each with the real marks. What do you notice?`}
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
          <p style={paragraph}>
            <strong>1. Recombination</strong>, roughly {RECOMBINATION_YEARS_AFTER_BIG_BANG.toLocaleString('en-US')} years after the Big Bang, is when the universe first became transparent to light. Before that, light kept scattering off free electrons, like a headlight in fog.
            Afterward, it could travel freely, and that first light is what we now call the Cosmic Microwave Background.
          </p>
          <p style={paragraph}>
            <strong>2. Stretched ever since, so cooler now.</strong> <strong>Your first guess</strong> was {temperatureLabels[predictedTemperature]}. In fact it was hotter: about {fmtKelvin(t.releaseKelvin)} K at recombination against {CMB_TEMPERATURE_TODAY_KELVIN} K today, found by the exact
            rule <code>T = T0 × (1 + z)</code>, {CMB_TEMPERATURE_TODAY_KELVIN} × {(1 + RECOMBINATION_REDSHIFT).toFixed(1)}. {temperatureVerdict}
          </p>
          <p style={paragraph}>
            Here is why. A hotter glow gives light of a shorter wavelength. Stretching the wavelength of light by a factor of {(1 + RECOMBINATION_REDSHIFT).toFixed(1)} therefore cools the glow by the same factor. A daily-life comparison: playing a recording slower stretches its sound waves, and the
            pitch goes down by the same factor. It is the same stretching you saw in Cosmology 1, now applied to the oldest light there is. Unlike Cosmology 1&rsquo;s formula for nearby galaxies, this rule is exact at any redshift.
          </p>
          <p style={paragraph}>
            <strong>3. Nearly the same in every direction.</strong> <strong>Your second guess</strong> was {skyLabels[predictedSky]}. The real sky differs by only about 1 part in {s.oneInParts.toLocaleString('en-US')}, about {s.spreadKelvin.toFixed(6)} K in {CMB_TEMPERATURE_TODAY_KELVIN} K.{' '}
            {skyVerdict} That is the observation behind the <strong>horizon problem</strong> named in Cosmology 2: patches of sky on opposite sides could never have exchanged heat, yet they match. <strong>Inflation</strong>, described in Cosmology 2, is one idea proposed to explain it, and it is
            still being tested; this page does not settle it.
          </p>
          <p style={paragraph}>
            <strong>4. This is real, measured evidence.</strong> Two radio engineers, Arno Penzias and Robert Wilson, found it by accident in 1964 to 1965, while trying to track down unexplained noise in a radio antenna. Later satellites, COBE, WMAP and Planck, measured it with great care.
          </p>
          <p style={{ ...paragraph, marginBottom: 0 }}>
            <strong>5. Not covered here:</strong> the physics of recombination itself, what the tiny differences between directions mean for how galaxies formed, and the polarization of the light. Also not covered: our own motion makes one side of the sky a little warmer and the opposite side a
            little cooler, by about 1 part in {Math.round(dipoleOneInParts())}, which is why &ldquo;about the same&rdquo; is not &ldquo;exactly the same&rdquo;. That is taught in the chapter &ldquo;Is the microwave sky equally warm in every direction?&rdquo;, in the Evidence and Imagination group.
          </p>
        </div>
      )}
    </div>
  )
}
