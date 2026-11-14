import { useState } from 'react'
import { redshiftGuessMatches, speedGuessMatches } from '../physics/hubblesLawExperiment'
import type { HubblePair, RedshiftGuess, SpeedGuess } from '../physics/hubblesLawExperiment'
import { fmtNumber } from './HubblesLawPictures'

// Cosmology, Experiment 1, Part 4: the tutor (docs/audit/cosmology/01-draft-wording.md, section 7, approved by the owner on 2026-11-14).
// The observe and compare steps state no outcome and no verdict (CLAUDE.md §12, §13); the explanation marks each guess, and nowhere
// earlier. Every number and every "matches" comes from the physics module.

type TutorStep = 'observe' | 'compare' | 'conceptual' | 'explained'

interface HubblesLawTutorProps {
  speedGuess: SpeedGuess
  redshiftGuess: RedshiftGuess
  // Part 1's pair: the one the white marks are drawn against.
  pair: HubblePair
  onExplained?: () => void
}

const speedLabels: Record<SpeedGuess, string> = { twice: 'twice as fast', same: 'the same speed', half: 'half as fast' }
const redshiftLabels: Record<RedshiftGuess, string> = {
  nearer: 'the nearer galaxy (B) would look redder',
  farther: 'the farther galaxy (A) would look redder',
  same: 'there would be no difference in how red they look',
}
const redshiftShort: Record<RedshiftGuess, string> = { nearer: 'the nearer galaxy', farther: 'the farther galaxy', same: 'no difference' }

const paragraph = { marginBottom: '1rem', fontSize: '0.95rem', color: '#333', lineHeight: '1.6' } as const

export function HubblesLawTutor({ speedGuess, redshiftGuess, pair, onExplained }: HubblesLawTutorProps) {
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
  const speedMatches = speedGuessMatches(speedGuess, pair)
  const redshiftMatches = redshiftGuessMatches(redshiftGuess, pair)

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
              'Look at the two speed bars and the two rings round Earth. What do you notice about how they differ between Galaxy B and Galaxy A?'}
            {tutorStep === 'compare' &&
              `You guessed that Galaxy A's speed would be ${speedLabels[speedGuess]} compared with Galaxy B's, and that ${redshiftLabels[redshiftGuess]}. Look at your white dashed bar and your white ring or bracket beside the real bars and rings. What do you notice?`}
            {tutorStep === 'conceptual' &&
              'If, in every direction we look, distant galaxies’ light is stretched toward red, and the farther ones are stretched more, what might that suggest about the universe as a whole?'}
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
            <strong>1. Hubble&rsquo;s Law:</strong> a galaxy&rsquo;s speed away from us, and its redshift, are in proportion to its distance. Here, Galaxy B at {pair.near.distanceMpc} Mpc moves at {fmtNumber(pair.near.recessionSpeedKmPerS)} km/s and Galaxy A at{' '}
            {pair.far.distanceMpc} Mpc at {fmtNumber(pair.far.recessionSpeedKmPerS)} km/s: twice the distance, twice the speed.
          </p>
          <p style={paragraph}>
            <strong>Your first guess</strong> was that Galaxy A would move {speedLabels[speedGuess]}. {speedMatches ? 'That matches the real bars.' : 'That does not match the real bars.'}
          </p>
          <p style={paragraph}>
            The farther galaxy&rsquo;s light is also more stretched: z = {pair.far.redshift.toFixed(5)} for Galaxy A against {pair.near.redshift.toFixed(5)} for Galaxy B. <strong>Your second guess</strong> was {redshiftShort[redshiftGuess]}.{' '}
            {redshiftMatches ? 'That matches the real rings.' : 'That does not match the real rings.'}
          </p>
          <p style={paragraph}>
            <strong>2. The cause is space itself stretching</strong> while the light travels, stretching its wavelength along with it. Imagine raisins in rising dough. A raisin 2 cm from you ends up 1 cm farther away, and one 4 cm away ends up 2 cm farther, though no
            raisin walks. Light crossing stretching space is stretched along with it, and the longer the trip, the more. This is different from a galaxy moving through space the way Gravitational Waves Experiment 5&rsquo;s source did (that motion-caused stretching is called
            the <strong>Doppler effect</strong>). They are genuinely different mechanisms, even though they can look similar in the numbers for nearby galaxies.
          </p>
          <p style={paragraph}>
            <strong>3. This is why the Hubble constant is worth measuring</strong> &mdash; first named in Gravitational Waves Experiment 7. It tells how fast space is stretching.
          </p>
          <p style={paragraph}>
            <strong>4. The real Hubble constant&rsquo;s precise value is still actively debated</strong> by astronomers. Two methods give about 73 and about 67 km/s per Mpc (see the check-up in Part 3), a disagreement known as the &ldquo;Hubble tension.&rdquo;
          </p>
          <p style={{ ...paragraph, marginBottom: 0 }}>
            <strong>5. This experiment&rsquo;s formula is only accurate for relatively nearby galaxies.</strong> At very large distances, the real relationship between distance and redshift is more complicated &mdash; a later topic.
          </p>
        </div>
      )}
    </div>
  )
}
