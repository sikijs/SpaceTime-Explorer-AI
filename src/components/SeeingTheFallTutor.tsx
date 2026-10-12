import { useState } from 'react'
import {
  arrivalTime,
  runSeeingTheFallExperiment,
  stretchFactor,
  stretchFactorSteps,
  FLASH_COUNT,
} from '../physics/seeingTheFallExperiment'

type SpacingChoice = 'same' | 'closer' | 'further'
type LastFlashChoice = 'soon' | 'long-wait' | 'never'
type CauseChoice = 'gravity' | 'motion' | 'both'
type TutorStep = 'observe' | 'compare' | 'conceptual' | 'explained'

interface SeeingTheFallTutorProps {
  predictedSpacing: SpacingChoice
  predictedLastFlash: LastFlashChoice
  predictedCause: CauseChoice
  onExplained?: () => void
}

const spacingClauses: Record<SpacingChoice, string> = {
  same: 'the flashes would arrive at the same spacing as they were sent',
  closer: 'the flashes would arrive closer together',
  further: 'the flashes would arrive further and further apart',
}

const lastFlashClauses: Record<LastFlashChoice, string> = {
  soon: 'the flash sent at the horizon would be received soon after it is sent',
  'long-wait': 'the flash sent at the horizon would be received, but only after a very long wait',
  never: 'the flash sent at the horizon would never be received',
}

const causeClauses: Record<CauseChoice, string> = {
  gravity: 'only gravity would change how far apart the flashes arrive',
  motion: "only the traveler's motion would change how far apart the flashes arrive",
  both: 'both would matter, and together more than either alone',
}

// Three significant figures, with no trailing zeros ("2.6", "5.03", "191").
function fmt(value: number): string {
  return String(Number(value.toPrecision(3)))
}

// A number in plain form when it is moderate, as a power of ten when it is very large or very small.
const SUPERSCRIPT: Record<string, string> = { '-': '⁻', '0': '⁰', '1': '¹', '2': '²', '3': '³', '4': '⁴', '5': '⁵', '6': '⁶', '7': '⁷', '8': '⁸', '9': '⁹' }
function fmtBig(value: number): string {
  if (value >= 0.01 && value < 1000) return fmt(value)
  const exponent = Math.floor(Math.log10(value))
  const mantissa = Number((value / 10 ** exponent).toPrecision(2))
  return `${mantissa} × 10${String(exponent)
    .split('')
    .map((ch) => SUPERSCRIPT[ch])
    .join('')}`
}

const paragraphStyle = { marginBottom: '1rem', fontSize: '0.95rem', color: '#333', lineHeight: '1.6' } as const

export function SeeingTheFallTutor({ predictedSpacing, predictedLastFlash, predictedCause, onExplained }: SeeingTheFallTutorProps) {
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

  // Numbers for the explanation come from the experiment's own model, for a fall from rest at 10 horizon radii (the
  // specification's reference case), never typed in by hand.
  const reference = runSeeingTheFallExperiment('stellar-black-hole', 10)
  const first = reference.flashes[1]
  const lastBefore = reference.flashes[FLASH_COUNT - 1]
  const factorAt = (gap: number) => stretchFactor(10, 1 + gap)
  const arrivalAt = (gap: number) => arrivalTime(10, 1 + gap)
  const worked = stretchFactorSteps(10, 2)

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
      {/* Wording approved by the owner on 2026-10-12 (CLAUDE.md §28.1). Follows the tutor sequence in the
          specification: observe, compare with the predictions, one conceptual question, then the explanation. */}
      <h2 style={{ marginTop: 0, marginBottom: '1rem', fontSize: '1.125rem', color: '#0066cc' }}>
        Let's reflect on what you observed
      </h2>

      {(tutorStep === 'observe' || tutorStep === 'compare' || tutorStep === 'conceptual') && (
        <div>
          <p style={paragraphStyle}>
            {tutorStep === 'observe' &&
              'Look at the two rows. How do the gaps between the flashes compare on the top row and the bottom row, and what happens to the last flash? Now try a different release distance and compare.'}
            {tutorStep === 'compare' &&
              `You predicted that ${spacingClauses[predictedSpacing]}; that ${lastFlashClauses[predictedLastFlash]}; and that ${causeClauses[predictedCause]}. Comparing that to what you saw, what do you notice?`}
            {tutorStep === 'conceptual' &&
              "In Experiment 5 the traveler's own watch reached the horizon in an ordinary time. Here the observer never receives the flash sent at the horizon. How can both be true?"}
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
            <strong>1. The flashes arrive later than they were sent, and the delay grows.</strong> Light takes time to
            climb out of the black hole's gravity, and the nearer the horizon a flash starts, the longer that takes. Take
            a fall from rest at 10 horizon radii. The traveler sends the flashes {fmt(first.spacingAsSent as number)}{' '}
            light-times apart on their own watch. The observer receives the first two {fmt(first.spacingAsReceived as number)}{' '}
            apart, and the last two before the horizon {fmt(lastBefore.spacingAsReceived as number)} apart. The gaps grow
            from flash to flash.
          </p>
          <p style={paragraphStyle}>
            <strong>2. The stretching has no limit.</strong> The stretch factor is the gap as received divided by the gap
            as sent. It is {fmt(factorAt(0.01))} when the traveler is 0.01 horizon radii above the horizon, and{' '}
            {fmtBig(factorAt(0.0001))} at 0.0001. Each time the distance above the horizon shrinks to a tenth, the stretch
            factor is about ten times larger.
          </p>
          <p style={paragraphStyle}>
            <strong>3. There are two causes, and they multiply.</strong> Gravity slows the traveler's watch as seen from
            far away (Experiment 2), and the traveler is moving away, so each flash has farther to travel than the one
            before (Gravitational Waves, Experiment 5; think of the friend tossing you a ball every second while walking
            away). At 2 horizon radii: the gravity part is {fmt(worked.gravity)}, the motion part is {fmt(worked.motion)},
            and {fmt(worked.gravity)} × {fmt(worked.motion)} = {fmt(worked.total)}. Neither part alone gives the answer.
          </p>
          <p style={paragraphStyle}>
            <strong>4. The last flash never arrives.</strong> The flash sent at 0.01, 0.001 and 0.0001 horizon radii
            above the horizon arrives at {fmt(arrivalAt(0.01))}, {fmt(arrivalAt(0.001))} and {fmt(arrivalAt(0.0001))}{' '}
            light-times. Each tenfold closing adds about 4.6, and it never settles. That is twice the 2.3 that Experiment
            5's far-away clock gains for the same closing in: the same 2.3 is still there, and the light's climb out adds
            another 2.3. The flash sent at the horizon would be at a distance of zero, so it has no arrival time at all.
          </p>
          <p style={paragraphStyle}>
            <strong>5. So the observer never sees the traveler cross, even though the traveler crosses in a finite
            time.</strong> The traveler's watch reaches the horizon after an ordinary time. That is one description of the
            event. The observer's description is that the light from it never arrives. They are two descriptions of the
            same event, and neither is "the real time".
          </p>
          <p style={paragraphStyle}>
            <strong>6. This finishes a loose end from Experiment 5.</strong> Its far-away clock was a comparison of two
            clocks, not what an observer receives. Here the light's journey is included, and it makes the observer's wait
            even longer. It also ties back to Experiment 2: a clock near the horizon ticks more and more slowly as seen
            from far away, and that is the gravity part of the stretching.
          </p>
          <p style={paragraphStyle}>
            <strong>7. The honest limits.</strong> This was a thought experiment about thin flashes of light sent straight
            outward. Only their timing was modeled: not how bright they are, what color they become, or what a camera or
            telescope would show, and nothing about whether the last flashes could be detected in practice. Nothing inside
            the horizon was modeled. The equations were given, not derived, and are for a black hole that does not spin
            and has no electric charge.
          </p>
        </div>
      )}
    </div>
  )
}
