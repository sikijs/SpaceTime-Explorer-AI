import { useState } from 'react'
import { REDSHIFT_PART1_SPEED, redshiftRunSummary } from '../physics/gravitationalWaveRedshiftExperiment'
import type { DirectionChoice, MagnitudeChoice } from '../physics/gravitationalWaveRedshiftExperiment'

type TutorStep = 'observe' | 'compare' | 'conceptual' | 'explained'

interface GravitationalWaveRedshiftTutorProps {
  predictedDirection: DirectionChoice
  predictedMagnitude: MagnitudeChoice
  // "Matched" is computed by the physics module (directionGuessMatches, magnitudeGuessMatches), never typed here (CLAUDE.md §9).
  directionMatched: boolean
  magnitudeMatched: boolean
  onExplained?: () => void
}

const directionLabels: Record<DirectionChoice, string> = {
  higher: 'higher',
  lower: 'lower',
  same: 'the same',
}

const magnitudeLabels: Record<MagnitudeChoice, string> = {
  exact: 'exactly the everyday amount of stretch',
  more: 'more stretch than the everyday amount',
  less: 'less stretch than the everyday amount',
}

// Gravitational Waves, Experiment 5's tutor (Part 4), audited to the newer rules
// (docs/audit/gravitational-waves/05-draft-wording.md, section 7). The prompts point to the white YOUR GUESS marks by name and give no
// verdict; the explanation marks both guesses, with every number and each "matched" taken from the physics module (CLAUDE.md §9).
// The wording is the owner's, approved on 2026-11-07 as drafted, "approve with defaults" (CLAUDE.md §28.1).
export function GravitationalWaveRedshiftTutor({
  predictedDirection,
  predictedMagnitude,
  directionMatched,
  magnitudeMatched,
  onExplained,
}: GravitationalWaveRedshiftTutorProps) {
  const [tutorStep, setTutorStep] = useState<TutorStep>('observe')
  const [responseInput, setResponseInput] = useState('')
  const run = redshiftRunSummary(REDSHIFT_PART1_SPEED)
  const slow = redshiftRunSummary(0.3)
  const fast = redshiftRunSummary(0.9)
  const f2 = (value: number) => value.toFixed(2)
  const f3 = (value: number) => value.toFixed(3)

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
  const paragraphStyle = { marginBottom: '1rem', fontSize: '0.95rem', color: '#333', lineHeight: '1.6' } as const

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

      {tutorStep !== 'explained' && (
        <div>
          <p style={{ marginBottom: '1rem', fontSize: '0.95rem', color: '#333' }}>
            {tutorStep === 'observe' && 'What did you notice about how the two waves behaved during the run?'}
            {tutorStep === 'compare' &&
              `On the picture, the white box marked YOUR GUESS beside the Detected wave shows that you predicted the detected frequency would be ${directionLabels[predictedDirection]}. Beneath it, the white mark on the amber bar shows that you predicted ${magnitudeLabels[predictedMagnitude]}. Look at the two waves, at Panel B and at the check-up in Part 3. If you have run another speed in Part 2, your guesses are drawn on Drawing A and Drawing B too. What do you notice when you put your guesses next to the real picture?`}
            {tutorStep === 'conceptual' && 'The everyday Doppler effect alone gives one amount of stretching. Why is the real amount different?'}
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
          <p style={paragraphStyle}>
            <strong>0. Your guesses, marked.</strong> You guessed {directionLabels[predictedDirection]} and {magnitudeLabels[predictedMagnitude]}. In the run, the detector received {f3(run.finalDetectedFrequency)} against{' '}
            {f3(run.finalEmittedFrequency)} sent (a lower pitch), and the real stretch was {f2(run.realStretch)} against the everyday {f2(run.classicalStretch)} (more). Your first guess{' '}
            {directionMatched ? 'matched' : 'did not match'} and your second {magnitudeMatched ? 'matched' : 'did not match'}.
          </p>
          <p style={paragraphStyle}>
            <strong>1. This reuses the chirp model of &ldquo;The Chirp&rdquo; and the time dilation factor of the Relativity of Time and Motion chapter</strong> — nothing new was calculated about the chirp
            itself or about time dilation.
          </p>
          <p style={paragraphStyle}>
            <strong>2. A receding source&rsquo;s wave is stretched to a lower frequency</strong> — the Doppler effect, the same basic effect as a receding ambulance&rsquo;s siren dropping in pitch as it drives away. At{' '}
            {f2(run.speed)}c every wave arrives {f2(run.classicalStretch)} times as long as it was sent, from the everyday effect alone.
          </p>
          <p style={paragraphStyle}>
            <strong>3. The real stretch is the everyday Doppler factor times the time dilation factor.</strong> At {f2(run.speed)}c that is {f3(run.classicalFactor)} × {f3(run.timeDilationFactor)} = {f3(run.realFactor)}, so
            the real stretch is 1 ÷ {f3(run.realFactor)} = {f2(run.realStretch)}. The extra comes from time dilation: a clock on the moving source ticks slower, as in the Relativity of Time and Motion chapter, so the
            source&rsquo;s whole chirp unfolds more slowly in the detector&rsquo;s time, on top of the everyday stretch. A daily-life comparison: a film played from a slower reel as well as from farther away. The real
            stretch is always more than the everyday one, and the gap grows with speed: at 0.3c it is {f2(slow.realStretch)} against {f2(slow.classicalStretch)}, almost the same; at 0.9c it is {f2(fast.realStretch)}{' '}
            against {f2(fast.classicalStretch)}, more than twice the everyday amount.
          </p>
          <p style={paragraphStyle}>
            <strong>4. This is why a real detected gravitational wave needs a velocity correction</strong>: the source&rsquo;s own motion changes the frequency an instrument measures, beyond what the source&rsquo;s chirp
            alone would produce.
          </p>
          <p style={paragraphStyle}>
            <strong>5. Why the pitch sent and the pitch received both end lower than in a run with no motion.</strong> The last part of the wave to arrive was sent while the source had only got part-way through its
            chirp: at {f2(run.speed)}c the source had reached a pitch of {f3(run.finalEmittedFrequency)}, not 3.162. So both the pitch sent and the pitch received are lower than in a run with no motion.
          </p>
          <p style={paragraphStyle}>
            <strong>6. This experiment isolates only the motion-based part of redshift.</strong> For a very distant source the larger part is the expansion of space while the wave travels, which is not modelled here.
          </p>
          <p style={{ ...paragraphStyle, marginBottom: 0 }}>
            <strong>7. This toy model is a simplified stand-in</strong>, not a faithful reconstruction of a real signal, and the speeds up to 0.9c are a toy range.
          </p>
        </div>
      )}
    </div>
  )
}
