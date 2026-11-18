import { useState } from 'react'
import {
  LN_10,
  arrivalIncreasesPerTenfoldGap,
  causeGuessIsModelAnswer,
  lastFlashGuessIsModelAnswer,
  nearHorizonReadings,
  runPartOne,
  spacingGuessIsModelAnswer,
  spacingSummary,
  stretchRatiosPerTenfoldGap,
  workedSteps,
} from '../physics/seeingTheFallExperiment'
import type { CauseChoice, LastFlashChoice, SpacingChoice } from '../physics/seeingTheFallExperiment'
import { causeLabel, lastFlashLabel, spacingLabel } from './SeeingTheFallChoices'

// Black Holes, Experiment 6 (audit update): the tutor (docs/audit/black-holes-and-strong-gravity/06-draft-wording.md, section 8). Its three
// questions point to the white marks by name, and its explanation opens by marking each guess (the only place that does, CLAUDE.md §12, §13).
// Every number comes from the physics module; nothing is typed by hand.

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
  if (value >= 0.01 && value < 10_000) return fmt(value)
  const exponent = Math.floor(Math.log10(value))
  const mantissa = Number((value / 10 ** exponent).toPrecision(2))
  return `${mantissa} × 10${String(exponent)
    .split('')
    .map((ch) => SUPERSCRIPT[ch])
    .join('')}`
}

const paragraphStyle = { marginBottom: '1rem', fontSize: '0.95rem', color: '#333', lineHeight: '1.6' } as const

// The explanation: marks each guess against the module, then the physics step by step. Exported so that it can be checked without clicking.
export function SeeingTheFallExplanation({ predictedSpacing, predictedLastFlash, predictedCause }: Omit<SeeingTheFallTutorProps, 'onExplained'>) {
  // Numbers come from the module, for the fall of Part 1 (10-Sun black hole, from rest at 10 horizon radii), never typed in by hand.
  const run = runPartOne()
  const spacing = spacingSummary(run)
  const near = nearHorizonReadings(10)
  const increases = arrivalIncreasesPerTenfoldGap(10)
  const ratios = stretchRatiosPerTenfoldGap(10)
  const worked = workedSteps(10)
  const gapOf = (i: number) => near[i].gapInHorizonRadii
  const lastIncrease = increases[increases.length - 1]
  const lastRatio = ratios[ratios.length - 1]
  const verdict = (matches: boolean) => (matches ? 'that matches what the model gives' : 'that is not what the model gives')

  return (
    <div>
      <p style={paragraphStyle}>
        <strong>Your first guess, “{spacingLabel(predictedSpacing)}”:</strong> {verdict(spacingGuessIsModelAnswer(predictedSpacing))}. The flashes were sent {fmt(spacing.firstSent)} light-times apart on the traveler’s watch. The observer received the first two {fmt(spacing.firstReceived)} apart and the last two before the horizon {fmt(spacing.lastReceived)} apart, so the stretch factor grows from {fmt(spacing.firstStretch)} to{' '}
        {fmt(spacing.lastStretch)}, and keeps growing as the gap above the horizon shrinks. Your white marker was at the right-hand end of Picture 2.
      </p>
      <p style={paragraphStyle}>
        <strong>Your second guess, “{lastFlashLabel(predictedLastFlash)}”:</strong> {verdict(lastFlashGuessIsModelAnswer(predictedLastFlash))}. The flash sent at 0.01, 0.001 and 0.0001 horizon radii above the horizon arrives at {fmt(near[0].arrival)}, {fmt(near[1].arrival)} and {fmt(near[2].arrival)} light-times. It never settles at a number, and the flash sent at the horizon would be at a gap of zero above the horizon, so it has no arrival time at all. Your white marker was at the rose horizon line of Picture 3.
      </p>
      <p style={paragraphStyle}>
        <strong>Your third guess, “{causeLabel(predictedCause)}”:</strong> {verdict(causeGuessIsModelAnswer(predictedCause))}. At 2 horizon radii the gravity part is {fmt(worked.gravity)} and the motion part is {fmt(worked.motion)}, and {fmt(worked.gravity)} × {fmt(worked.motion)} = {fmt(worked.total)}. Both are above 1, so neither part alone gives the answer. Your white marker was beside the curve you chose on Picture 2.
      </p>

      <p style={paragraphStyle}>
        <strong>1. The flashes arrive later than they were sent, and the delay grows.</strong> Light takes time to climb out of the black hole’s gravity, and the nearer the horizon a flash starts, the longer that takes. Take the fall from rest at 10 horizon radii. The traveler sends the flashes {fmt(spacing.firstSent)} light-times apart on their own watch. The observer receives the first two {fmt(spacing.firstReceived)} apart, and the last two before the
        horizon {fmt(spacing.lastReceived)} apart. The gaps grow from flash to flash.
      </p>
      <p style={paragraphStyle}>
        <strong>2. The stretching has no limit.</strong> The stretch factor is the gap as received divided by the gap as sent. It is {fmtBig(near[0].stretch)} when the traveler is {gapOf(0)} horizon radii above the horizon, and {fmtBig(near[2].stretch)} at {gapOf(2)}. Each time the distance above the horizon shrinks to a tenth, the stretch factor is about {fmt(lastRatio)} times larger.
      </p>
      <p style={paragraphStyle}>
        <strong>3. There are two causes, and they multiply.</strong> Gravity slows the traveler’s watch as seen from far away (Black Holes 2), and the traveler is moving away, so each flash has farther to travel than the one before (Gravitational Waves, Experiment 5; think of the friend tossing you a ball every second while walking away). At 2 horizon radii: the gravity part is {fmt(worked.gravity)}, the motion part is {fmt(worked.motion)}, and {fmt(worked.gravity)} ×{' '}
        {fmt(worked.motion)} = {fmt(worked.total)}. Neither part alone gives the answer.
      </p>
      <p style={paragraphStyle}>
        <strong>4. The last flash never arrives.</strong> The flash sent at {gapOf(0)}, {gapOf(1)} and {gapOf(2)} horizon radii above the horizon arrives at {fmt(near[0].arrival)}, {fmt(near[1].arrival)} and {fmt(near[2].arrival)} light-times. Each tenfold closing adds about {fmt(lastIncrease)}, and it never settles. That is twice the {fmt(LN_10)} that Black Holes 5’s far-away clock gains for the same closing in: the same {fmt(LN_10)} is still there, and the light’s climb out adds another {fmt(LN_10)}. The flash sent at the horizon would be at a gap of zero above the horizon, so it has no arrival time at all.
      </p>
      <p style={paragraphStyle}>
        <strong>5. So the observer never sees the traveler cross, even though the traveler crosses in a finite time.</strong> The traveler’s watch reaches the horizon after an ordinary time ({fmt(run.travelerWatchAtHorizon)} light-times, here). That is one description of the event. The observer’s description is that the light from it never arrives. They are two descriptions of the same event, and neither is “the real time”.
      </p>
      <p style={paragraphStyle}>
        <strong>6. This finishes a loose end from Black Holes 5.</strong> Its far-away clock was a comparison of two clocks, not what an observer receives. Here the light’s journey is included, and it makes the observer’s wait even longer. It also ties back to Black Holes 2: a clock near the horizon ticks more and more slowly as seen from far away, and that is the gravity part of the stretching.
      </p>
      <p style={paragraphStyle}>
        <strong>7. The honest limits.</strong> This was a thought experiment about thin flashes of light sent straight outward. Only their timing was modeled: not how bright they are, what color they become, or what a camera or telescope would show, and nothing about whether the last flashes could be detected in practice. Nothing inside the horizon was modeled. The equations were given, not derived, and are for a black hole that does not spin and has no
        electric charge.
      </p>
    </div>
  )
}

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
              "Look at Picture 1's two rows. How do the gaps between the flashes compare on the top row and the bottom row, and what happens to flash 20? Then look at your white marks on Pictures 2 and 3."}
            {tutorStep === 'compare' &&
              `Your first guess, "${spacingLabel(predictedSpacing)}", is the white box on Picture 2 at the right-hand end. Your second, "${lastFlashLabel(predictedLastFlash)}", is on Picture 3 at the rose horizon line. Your third, "${causeLabel(predictedCause)}", is beside the curve you chose on Picture 2. You guessed that ${spacingClauses[predictedSpacing]}; that ${lastFlashClauses[predictedLastFlash]}; and that ${causeClauses[predictedCause]}. Compare each white mark with the pictures. What do you notice?`}
            {tutorStep === 'conceptual' &&
              "In Black Holes 5 the traveler's own watch reached the horizon in an ordinary time. Here the observer never receives the flash sent at the horizon. How can both be true?"}
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

      {tutorStep === 'explained' && <SeeingTheFallExplanation predictedSpacing={predictedSpacing} predictedLastFlash={predictedLastFlash} predictedCause={predictedCause} />}
    </div>
  )
}
