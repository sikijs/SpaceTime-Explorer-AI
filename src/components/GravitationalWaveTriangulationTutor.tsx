import { useState } from 'react'
import { DIRECTION_PRESETS, TRIANGULATION_PART1_DIRECTION_INDEX, arrivalSummary } from '../physics/gravitationalWaveTriangulationExperiment'
import type { FirstDetectorChoice, TimingChoice } from '../physics/gravitationalWaveTriangulationExperiment'

type TutorStep = 'observe' | 'compare' | 'conceptual' | 'explained'

interface GravitationalWaveTriangulationTutorProps {
  predictedFirstDetector: FirstDetectorChoice
  predictedTiming: TimingChoice
  // "Matched" is computed by the physics module (firstDetectorGuessMatches, timingGuessMatches), never typed here (CLAUDE.md §9).
  firstMatched: boolean
  timingMatched: boolean
  onExplained?: () => void
}

const timingLabels: Record<TimingChoice, string> = {
  same: 'at essentially the same instant',
  different: 'at measurably different times',
}

// Gravitational Waves, Experiment 6's tutor (Part 4), audited to the newer rules
// (docs/audit/gravitational-waves/06-draft-wording.md, section 7). The prompts point to the white YOUR GUESS marks by name and give no
// verdict; the explanation marks both guesses, with every number and each "matched" taken from the physics module (CLAUDE.md §9).
// The wording is the owner's, approved on 2026-11-07 as drafted, "approve with defaults" (CLAUDE.md §28.1).
export function GravitationalWaveTriangulationTutor({
  predictedFirstDetector,
  predictedTiming,
  firstMatched,
  timingMatched,
  onExplained,
}: GravitationalWaveTriangulationTutorProps) {
  const [tutorStep, setTutorStep] = useState<TutorStep>('observe')
  const [responseInput, setResponseInput] = useState('')
  const run = arrivalSummary(DIRECTION_PRESETS[TRIANGULATION_PART1_DIRECTION_INDEX].directionDegrees)
  const [first, second, third] = run.order
  const hl = run.pairGaps[0]
  const f2 = (value: number) => value.toFixed(2)

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
            {tutorStep === 'observe' && 'What did you notice about the order and timing of the three pulses?'}
            {tutorStep === 'compare' &&
              `On the picture, the white ring on the map shows that you predicted ${predictedFirstDetector} would be reached first. The white box beside the timeline shows that you predicted the three detectors would register the wave ${timingLabels[predictedTiming]}. Look at the order the dots turn white-violet, at the timeline and at the check-up in Part 3. If you have run another direction in Part 2, your guesses are drawn on Drawing A and Drawing B too. What do you notice when you put your guesses next to the real picture?`}
            {tutorStep === 'conceptual' &&
              "If you only had one detector, could you have known which direction the wave came from? What does having three give you that one doesn't?"}
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
            <strong>0. Your guesses, marked.</strong> You guessed {predictedFirstDetector} and {timingLabels[predictedTiming]}. In the run, {first.name} was reached first, {second.name} {f2(second.afterFirstMs)} ms later and{' '}
            {third.name} {f2(third.afterFirstMs)} ms later, so the largest gap was {f2(run.maxGapMs)} ms. Your first guess {firstMatched ? 'matched' : 'did not match'} and your second{' '}
            {timingMatched ? 'matched' : 'did not match'}.
          </p>
          <p style={paragraphStyle}>
            <strong>1. A single detector can tell you a wave arrived, but not which direction it came from.</strong> One pulse, by itself, carries no directional information.
          </p>
          <p style={paragraphStyle}>
            <strong>2. The arrival-time differences carry the direction.</strong> The wave travels at a fixed speed, c, the same for everyone (the Relativity of Time and Motion chapter), and the detectors are far apart. So the
            wave reaches the detector nearest to where it came from first, and the others a little later, just as the friend nearest the shout hears it first. Your two ears do this every day: a sound from your left reaches
            your left ear a fraction of a second before your right, and your brain uses that to tell which side it came from. In the run, {first.name} was first and {third.name} was {f2(third.afterFirstMs)} ms behind, so the wave
            came from the side of the map where {first.name} is.
          </p>
          <p style={paragraphStyle}>
            <strong>3. Comparing the gaps across pairs of detectors narrows the possible sky region, and a third detector narrows it further than two alone could</strong>, as in the two shaded wedges on the map (a sketch, not a
            calculation).
          </p>
          <p style={paragraphStyle}>
            <strong>4. This is how GW170817 was matched to a patch of sky that telescopes could then point at:</strong> with Virgo&rsquo;s data the possible region shrank to about 30 square degrees (28 in the final analysis), and
            telescopes found the galaxy NGC 4993 and the light about 11 hours after the wave.
          </p>
          <p style={paragraphStyle}>
            <strong>5. No gap can be bigger than the separation ÷ c.</strong> {hl.a} and {hl.b} gave {f2(hl.gapMs)} ms, {Math.abs(hl.limitMs - hl.gapMs) <= 1e-6 ? 'exactly their limit, because the wave came along the line between them' : `less than their limit of ${f2(hl.limitMs)} ms`}.
          </p>
          <p style={{ ...paragraphStyle, marginBottom: 0 }}>
            <strong>6. This toy model is a simplified stand-in</strong>: a flat schematic map, three directions, only timing. It does not model how loud the signal is at each detector, how sensitive each detector is to the
            direction, or noise.
          </p>
        </div>
      )}
    </div>
  )
}
