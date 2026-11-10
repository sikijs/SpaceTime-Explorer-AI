import { useState } from 'react'
import { choiceMarker, lengthBarRows, lengthForTick, markGuess, runLengthContractionExperiment } from '../physics/lengthContractionExperiment'
import type { LengthContractionResult, LengthChoice } from '../physics/lengthContractionExperiment'

type TutorStep = 'observe' | 'compare' | 'conceptual' | 'explained'

// The learner's first prediction: how the length of the moving clock, seen from the lab, compares with its length at rest.
export type { LengthChoice }

const choiceWording: Record<LengthChoice, string> = {
  same: 'the same length as at rest',
  shorter: 'shorter than at rest',
  longer: 'longer than at rest',
}

interface Experiment6TutorProps {
  run: LengthContractionResult
  predictionChoice: LengthChoice
  prediction: number
  onExplained?: () => void
}

export function Experiment6Tutor({ run, predictionChoice, prediction, onExplained }: Experiment6TutorProps) {
  const { timeDilationTick, sameLength, shorterLength } = run
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
              "Look at the three clocks and at the strip of length bars. What is different between the two moving clocks? Think about how long each pulse's trip forward and back took, and what a trip time tells us about a length."}
            {tutorStep === 'compare' &&
              `You chose ${choiceWording[predictionChoice]} for the length of the moving clock. That is the white marker. You guessed ${prediction} light-seconds. That is the white mark on the strip. In the imagined clock the length was ${sameLength.lengthInLab.toFixed(3)} light-seconds. In the shorter clock it was ${shorterLength.lengthInLab.toFixed(3)}. What do you notice when you compare your mark with the bars?`}
            {tutorStep === 'conceptual' &&
              `Time dilation says the tick of the moving clock should take ${timeDilationTick.toFixed(3)} seconds. Light goes at c in both clocks. What would have to change about the length of the clock to fix its tick?`}
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

      {tutorStep === 'explained' && <Experiment6Explanation run={run} predictionChoice={predictionChoice} prediction={prediction} />}
    </div>
  )
}

// The tutor's explanation, from the physics module's numbers. It marks each guess with no score and no verdict.
export function Experiment6Explanation({
  run,
  predictionChoice,
  prediction,
}: {
  run: LengthContractionResult
  predictionChoice: LengthChoice
  prediction: number
}) {
  const { velocity, restLength, timeDilationTick, timeDilationFactor, sameLength, shorterLength } = run
  const marker = choiceMarker(run, predictionChoice)
  const mark = markGuess(run, prediction)
  const slow = runLengthContractionExperiment(0.1)
  const fast = runLengthContractionExperiment(0.8)
  const fastest = runLengthContractionExperiment(0.9)
  const restRow = lengthBarRows(run)[0]
  // The length that gives the tick time dilation gives (the same number as the shorter clock's length).
  const fittingLength = lengthForTick(timeDilationTick, velocity)
  const paragraph = { marginBottom: '1rem', fontSize: '0.95rem', color: '#333', lineHeight: '1.6' } as const
  return (
    <div>
      <p style={paragraph}>Let's go through it one step at a time.</p>
      <p style={paragraph}>
        <strong>1. What we found.</strong> As seen from the lab, a moving clock is <strong>shorter</strong> than the same clock
        standing still. At {velocity}c it is {shorterLength.lengthInLab.toFixed(3)} light-seconds long, against{' '}
        {restLength.toFixed(3)} at rest.
      </p>
      <p style={paragraph}>
        <strong>2. How we found it: light as a tape measure.</strong> Light goes at c in the lab, so the time the pulse takes tells
        us a length (distance = speed &times; time), just as the echo told us how far the cliff was and the walk along the corridor
        told us how long it was. For the clock standing still, {restRow.forwardLegDuration.toFixed(3)} s across means{' '}
        {restLength.toFixed(3)} light-seconds. For the moving clock, each length gives its own trips and its own tick.
      </p>
      <p style={paragraph}>
        In the lab, the pulse's trip forward is long, because the front mirror keeps moving away from it. Its trip back is short,
        because the back mirror moves toward it. With the same length as at rest, {sameLength.lengthInLab.toFixed(3)} light-seconds,
        the trip forward took {sameLength.forwardLegDuration.toFixed(3)} seconds and the trip back took{' '}
        {sameLength.returnLegDuration.toFixed(3)} seconds, so one tick took {sameLength.tickDuration.toFixed(3)} seconds. With a
        length of {shorterLength.lengthInLab.toFixed(3)} light-seconds, the trips took {shorterLength.forwardLegDuration.toFixed(3)}{' '}
        and {shorterLength.returnLegDuration.toFixed(3)} seconds, so one tick took {shorterLength.tickDuration.toFixed(3)} seconds.
        Light went at c the whole time.
      </p>
      <p style={paragraph}>
        <strong>A familiar version of this.</strong> It's like chasing a bus that has just
        pulled away from the curb versus meeting a friend walking toward you from the other end
        of the platform: catching up to something moving away from you takes longer, because
        the gap keeps growing while you're closing it. Meeting something moving toward you is
        quicker, because the gap closes from both sides at once. The light pulse's forward trip
        is the "chasing" case; its trip back is the "meeting" case.
      </p>
      <p style={paragraph}>
        To fix a tick that is too long, the trips must be shorter, so the clock must be shorter. Light cannot go faster or slower
        than c to fix this, and time dilation has already fixed how long the tick must take. The only thing left that can change is
        the length of the clock.
      </p>
      <p style={paragraph}>
        <strong>3. What fits.</strong> Time dilation says the tick must be {timeDilationTick.toFixed(3)} seconds. Only the length{' '}
        {fittingLength.toFixed(3)} light-seconds gives a tick of {timeDilationTick.toFixed(3)} seconds, so that is the length of the
        moving clock, as seen from the lab. The length that stays as at rest, {restLength.toFixed(3)} light-seconds, gives a tick of{' '}
        {sameLength.tickDuration.toFixed(3)} seconds, which does not fit.
      </p>
      <p style={paragraph}>
        <strong>4. By how much.</strong> The length at rest times the time dilation factor: {restLength.toFixed(3)} &times;{' '}
        {timeDilationFactor.toFixed(3)} is about {shorterLength.lengthInLab.toFixed(3)}, which is{' '}
        {shorterLength.lengthRatio.toFixed(3)} of the length at rest. The number {shorterLength.lengthRatio.toFixed(3)} is the same as
        the time dilation factor {timeDilationFactor.toFixed(3)} that you saw in &ldquo;A moving clock&rdquo; and &ldquo;Why time
        dilation happens&rdquo;.
      </p>
      <p style={paragraph}>
        <strong>5. A name.</strong> This effect is called <strong>length contraction</strong>: a moving clock is shorter, along its
        motion, as seen from the lab. For someone riding along with the clock, its length is still {restLength.toFixed(3)}{' '}
        light-seconds.
      </p>
      <p style={paragraph}>
        <strong>6. Only along the motion.</strong> Across the motion, as in &ldquo;Why time dilation happens&rdquo; and &ldquo;Why
        can&rsquo;t light go faster?&rdquo;, the distance between the mirrors does not change.
      </p>
      <p style={paragraph}>
        <strong>7. Two things to remember.</strong> First, the clock with the same length as at rest is only a "what if". It is not
        something that happens. Second, this argument rests on one assumption: that time dilation works for every clock, however it
        is turned. This experiment shows what follows from that assumption.
      </p>
      <p style={paragraph}>
        <strong>Your guesses, marked.</strong> You chose {choiceWording[predictionChoice]}. Time dilation asks for the amber clock,
        whose length is {shorterLength.lengthInLab.toFixed(3)} light-seconds, which is{' '}
        {choiceWording[marker.requiredChoice === 'same' ? 'same' : 'shorter']}. Your white mark was at {prediction}, which is{' '}
        {mark.comparison === 'the same'
          ? 'the same as that length, to three decimals.'
          : `${mark.difference.toFixed(3)} light-seconds ${mark.comparison} than that length.`}{' '}
        There is no score: the white marks only show where your guesses sat beside the real bars.
      </p>
      <p style={{ ...paragraph, marginBottom: '0' }}>
        <strong>Try it in Part 2.</strong> Try 0.1c and 0.8c. At 0.1c the amber length is{' '}
        {slow.shorterLength.lengthInLab.toFixed(4)}, hardly shorter than at rest; at 0.8c it is{' '}
        {fast.shorterLength.lengthInLab.toFixed(3)}. The violet clock&rsquo;s tick grows with speed:{' '}
        {slow.sameLength.tickDuration.toFixed(3)} s at 0.1c, {fast.sameLength.tickDuration.toFixed(3)} s at 0.8c. Try 0.9c: the amber
        length is {fastest.shorterLength.lengthInLab.toFixed(3)}, and one tick of the violet clock takes{' '}
        {fastest.sameLength.tickDuration.toFixed(3)} s.
      </p>
    </div>
  )
}
