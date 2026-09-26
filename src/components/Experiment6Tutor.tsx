import { useState } from 'react'
import type { ClockVersionResult } from '../physics/lengthContractionExperiment'

type TutorStep = 'observe' | 'compare' | 'conceptual' | 'explained'

// The learner's first prediction: how the mirror distance seen from the lab compares with the distance at rest.
export type MirrorDistanceChoice = 'same' | 'closer' | 'farther'

const choiceWording: Record<MirrorDistanceChoice, string> = {
  same: 'as far apart as at rest',
  closer: 'closer together than at rest',
  farther: 'farther apart than at rest',
}

interface Experiment6TutorProps {
  velocity: number
  predictionChoice: MirrorDistanceChoice
  prediction: number
  restLength: number
  timeDilationTick: number
  timeDilationFactor: number
  sameLength: ClockVersionResult
  shorterLength: ClockVersionResult
  onExplained?: () => void
}

export function Experiment6Tutor({
  velocity,
  predictionChoice,
  prediction,
  restLength,
  timeDilationTick,
  timeDilationFactor,
  sameLength,
  shorterLength,
  onExplained,
}: Experiment6TutorProps) {
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
  // At very low speeds the two displays agree to the shown precision, so there is nothing to point out.
  const showOwnDisplayNote =
    sameLength.ownClockReadingAtEnd.toFixed(3) !== shorterLength.ownClockReadingAtEnd.toFixed(3)

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
              "Look at the two moving clocks. What is different between them? Think about how long each pulse's trip forward and back took."}
            {tutorStep === 'compare' &&
              `You guessed that the mirrors must be ${choiceWording[predictionChoice]}, ${prediction} light-seconds apart, seen from the lab. In the clock with the mirrors as far apart as at rest, they were ${sameLength.lengthInLab.toFixed(3)} light-seconds apart. In the clock with the mirrors closer together, they were ${shorterLength.lengthInLab.toFixed(3)}. One tick took ${sameLength.tickDuration.toFixed(3)} s in the first clock and ${shorterLength.tickDuration.toFixed(3)} s in the second, while time dilation says ${timeDilationTick.toFixed(3)} s. What do you notice when you compare them?`}
            {tutorStep === 'conceptual' &&
              `Time dilation says the tick of the moving clock should take ${timeDilationTick.toFixed(3)} seconds. Light goes at c in both clocks. What would have to change about the clock to fix its tick?`}
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
          <p style={{ marginBottom: '1rem', fontSize: '0.95rem', color: '#333', lineHeight: '1.6' }}>Let's go through it one step at a time.</p>
          <p style={{ marginBottom: '1rem', fontSize: '0.95rem', color: '#333', lineHeight: '1.6' }}>
            <strong>1. The two trips.</strong> In the lab, the pulse's trip forward is long, because
            the front mirror keeps moving away from it. Its trip back is short, because the back
            mirror moves toward it. In the clock with the mirrors as far apart as at rest, the trip forward took{' '}
            {sameLength.forwardLegDuration.toFixed(3)} seconds and the trip back took{' '}
            {sameLength.returnLegDuration.toFixed(3)} seconds. Light went at c the whole time.
          </p>
          <p style={{ marginBottom: '1rem', fontSize: '0.95rem', color: '#333', lineHeight: '1.6' }}>
            <strong>A familiar version of this.</strong> It's like chasing a bus that has just
            pulled away from the curb versus meeting a friend walking toward you from the other end
            of the platform: catching up to something moving away from you takes longer, because
            the gap keeps growing while you're closing it. Meeting something moving toward you is
            quicker, because the gap closes from both sides at once. The light pulse's forward trip
            is the "chasing" case; its trip back is the "meeting" case.
          </p>
          <p style={{ marginBottom: '1rem', fontSize: '0.95rem', color: '#333', lineHeight: '1.6' }}>
            <strong>2. A tick that is too long.</strong> With the mirrors as far apart as at rest,
            {' '}{restLength} light-seconds, the two trips add up to{' '}
            {sameLength.tickDuration.toFixed(3)} seconds. But time dilation says that one tick of the
            moving clock takes {timeDilationTick.toFixed(3)} seconds. So this clock ticks too slowly
            to fit.
            {showOwnDisplayNote && (
              <>
                {' '}
                You may also have noticed that this clock's own display shows more than 1 second
                after one tick: {sameLength.ownClockReadingAtEnd.toFixed(3)} seconds. A clock built
                like the one standing still should show exactly 1 second for one tick on its own
                display, so this is another sign that this version cannot be right. The
                clock with the mirrors closer together shows exactly{' '}
                {shorterLength.ownClockReadingAtEnd.toFixed(3)} seconds.
              </>
            )}
          </p>
          <p style={{ marginBottom: '1rem', fontSize: '0.95rem', color: '#333', lineHeight: '1.6' }}>
            <strong>3. What has to change.</strong> Light cannot go faster or slower than c to fix
            this, and time dilation has already fixed how long the tick must take. The only thing
            left that can change is the distance between the mirrors, seen from the lab. The mirrors
            have to be closer together. At {velocity}c, that distance is{' '}
            {shorterLength.lengthInLab.toFixed(3)} light-seconds, which is{' '}
            {shorterLength.lengthRatio.toFixed(3)} of the distance at rest. With the mirrors that
            close, the two trips took {shorterLength.forwardLegDuration.toFixed(3)} and{' '}
            {shorterLength.returnLegDuration.toFixed(3)} seconds. They add up to{' '}
            {shorterLength.tickDuration.toFixed(3)} seconds, exactly the tick that time dilation
            gives. The number {shorterLength.lengthRatio.toFixed(3)} is the same as the time dilation
            factor {timeDilationFactor.toFixed(3)} that you saw in Experiments 3 and 4.
          </p>
          <p style={{ marginBottom: '1rem', fontSize: '0.95rem', color: '#333', lineHeight: '1.6' }}>
            <strong>4. A name.</strong> This effect is called <strong>length contraction</strong>: a
            moving clock is shorter, along its motion, as seen from the lab. For someone riding
            along with the clock, its mirrors are still {restLength} light-seconds apart.
          </p>
          <p style={{ marginBottom: '1rem', fontSize: '0.95rem', color: '#333', lineHeight: '1.6' }}>
            <strong>5. Only along the motion.</strong> Across the motion, as in Experiments 4 and 5,
            the distance between the mirrors does not change.
          </p>
          <p style={{ marginBottom: '0', fontSize: '0.95rem', color: '#333', lineHeight: '1.6' }}>
            <strong>Two things to remember.</strong> First, the clock with the mirrors as far apart as at rest is only a
            "what if". It is not something that happens. Second, this argument rests on one
            assumption: that time dilation works for every clock, however it is turned. This
            experiment shows what follows from that assumption.
          </p>
        </div>
      )}
    </div>
  )
}
