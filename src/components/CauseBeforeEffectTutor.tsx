import { useState } from 'react'
import { runCauseBeforeEffectExperiment } from '../physics/causeBeforeEffect'
import type { EventOrder } from '../physics/causeBeforeEffect'
import type { WorldlinePoint } from '../physics/spacetimeDiagramView'

type Prediction = 'yes' | 'same-moment' | 'no'
type TutorStep = 'observe' | 'compare' | 'conceptual' | 'explained'

interface CauseBeforeEffectTutorProps {
  event: WorldlinePoint
  passingSpeed: number
  predicted: Prediction
  onExplained?: () => void
}

const predictionClauses: Record<Prediction, string> = {
  yes: 'a fast enough observer could find B first',
  'same-moment': 'an observer could find the two events at exactly the same moment, but none could find B first',
  no: 'every observer finds O first',
}

const orderPhrases: Record<EventOrder, string> = {
  'o-first': 'O first',
  'same-moment': 'the two events at the same moment',
  'b-first': 'B first',
}

// The fast-observer example used in the explanation: one of the five choices (3 seconds, 5 light-seconds), with a +0.9c observer.
const EXAMPLE_EVENT: WorldlinePoint = { time: 3, position: 5 }
const EXAMPLE_SPEED = 0.9
// A typical car speed in meters per second, and the speed of light in meters per second (general-knowledge figures).
const CAR_SPEED_METERS_PER_SECOND = 30
const LIGHT_SPEED_METERS_PER_SECOND = 299_792_458
const SECONDS_PER_YEAR = 365.25 * 24 * 3600

const paragraphStyle = { marginBottom: '1rem', fontSize: '0.95rem', color: '#333', lineHeight: '1.6' } as const

export function CauseBeforeEffectTutor({ event, passingSpeed, predicted, onExplained }: CauseBeforeEffectTutorProps) {
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

  // Every number below comes from the experiment's own model, never typed in by hand.
  const { lab, passing } = runCauseBeforeEffectExperiment(event, passingSpeed)
  const example = runCauseBeforeEffectExperiment(EXAMPLE_EVENT, EXAMPLE_SPEED)
  const two = (value: number) => Math.abs(value).toFixed(2)
  const signed = (value: number) => value.toFixed(2).replace('-', '\u2212')

  // How the passing observer's time reads in words: after, before, or at the same moment as O.
  const timeWords = (time: number, order: EventOrder) =>
    order === 'same-moment' ? 'at the same moment as O' : `${two(time)} seconds ${order === 'b-first' ? 'before' : 'after'} O`

  // The passing observer's same-moment line through O is at (speed × position) seconds at B's place.
  const lineHeightAtB = passingSpeed * event.position
  const lineSideWords =
    Math.abs(event.time - lineHeightAtB) <= 1e-9
      ? 'exactly on the line'
      : event.time > lineHeightAtB
        ? 'above the line'
        : 'below the line'

  // The speed (a fraction of c) at which two events 1 second apart could be found in the opposite order, and the distance
  // that takes: time ÷ speed.
  const carSpeed = CAR_SPEED_METERS_PER_SECOND / LIGHT_SPEED_METERS_PER_SECOND
  const reversalDistance = 1 / carSpeed
  const reversalLightYears = reversalDistance / SECONDS_PER_YEAR

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
      {/* Draft wording for the owner's review (CLAUDE.md §28.1). Follows the tutor sequence in the specification:
          observe, compare with the prediction, one conceptual question, then the explanation and the limits. */}
      <h2 style={{ marginTop: 0, marginBottom: '1rem', fontSize: '1.125rem', color: '#0066cc' }}>
        Let's reflect on what you observed
      </h2>

      {(tutorStep === 'observe' || tutorStep === 'compare' || tutorStep === 'conceptual') && (
        <div>
          <p style={paragraphStyle}>
            {tutorStep === 'observe' &&
              'Look at the table and the drawing. In the lab, which event happened first? And which event did the passing observer find first?'}
            {tutorStep === 'compare' &&
              `You predicted that ${predictionClauses[predicted]}. In this run, the lab found ${orderPhrases[lab.order]}, and the passing observer found ${orderPhrases[passing.order]}. Your prediction was about any observer moving at any speed below the speed of light, and this run showed just one. Comparing your prediction with what the table and the drawing show, what do you notice?`}
            {tutorStep === 'conceptual' &&
              'Think about how the light cone from the last experiment sorts the five events. What do the events whose order never changes have in common?'}
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
            <strong>1. What the table shows.</strong> In your run, the lab found B {timeWords(lab.timeBetween, lab.order)}.
            The passing observer found B {timeWords(passing.timeBetween, passing.order)}. To see that the order can really
            change, look at one of the five choices that you may not have tried: B 3 seconds after O and 5 light-seconds away,
            with a passing observer at +0.9c. The lab finds B {timeWords(example.lab.timeBetween, example.lab.order)}. The
            passing observer finds B {timeWords(example.passing.timeBetween, example.passing.order)}. So two observers can
            disagree about which of two events came first.
          </p>
          <p style={paragraphStyle}>
            <strong>2. Why some events can change order and some cannot.</strong> Look at the passing observer's tilted
            line through O. A line like this is tilted by the observer's speed: for every light-second you go to the side, it
            changes height by that many seconds, where the speed is counted as a fraction of the speed of light. The edge of
            the light cone changes height by exactly 1 second for every light-second to the side. A passing observer's speed is always below the speed of light, so the tilted line is always flatter
            than the edge of the cone. So the line always stays <em>outside</em> the cone, and never enters it. An event inside
            or on the cone is therefore always above every observer's line through O, which means it is later than O for
            every observer. An event outside the cone can be above the line, or below it, depending on the observer's
            speed. When it is below the line, that observer finds it earlier than O. In your run, the passing observer's
            line was at {signed(lineHeightAtB)} seconds at B's place, and B was at {two(event.time)} seconds. So B was{' '}
            {lineSideWords}.
          </p>
          <p style={paragraphStyle}>
            <strong>3. An everyday example: a flash and a firecracker.</strong> A flash of light is sent from O, and a
            firecracker goes off at B. For the flash to be the cause of the bang, it must travel from O to the place where
            the firecracker is. That is the shout across the field from the last experiment: a signal has to make the trip.
            If it can make the trip, the flash comes first for everyone who measures carefully. If nothing could make the
            trip in the time available, the flash cannot be the cause, and then it does no harm if different observers
            disagree about which came first.
          </p>
          <p style={paragraphStyle}>
            <strong>4. Why we never notice this in daily life.</strong> Take an observer moving at 30 meters per second,
            a typical car speed. That is about 0.0000001 of the speed of light. Two events 1 second apart could be found in
            the opposite order only if they were more than 1 ÷ 0.0000001 = about 10,000,000 light-seconds apart. A
            light-year is the distance light travels in a year, so that is about {reversalLightYears.toFixed(2)} of a
            light-year. At everyday speeds and distances, the order never changes.
          </p>
          <p style={paragraphStyle}>
            <strong>5. Why this is not a contradiction.</strong> Two events that are outside each other's light cone cannot
            be cause and effect, because nothing could make the trip between them in time. Those are exactly the events
            whose order can change. Events that could be cause and effect are inside or on the cone, and all observers agree
            on their order. So no observer ever finds a cause after its effect.
          </p>
          <p style={paragraphStyle}>
            <strong>6. What the speed limit does.</strong> Suppose something could go faster than light. Then it could
            connect two events that are outside each other's cone. Take the example from paragraph 1: for the observer at
            +0.9c, B was {two(example.passing.timeBetween)} seconds <em>before</em> O. So for that observer, a signal sent
            from O to B would arrive before it was sent, and an effect would be found before its cause. The rule that nothing
            outruns light is what keeps a cause before its effect for everyone.
          </p>
          <p style={paragraphStyle}>
            <strong>7. What was shown, and what was not.</strong> You saw five possible events, one passing observer at a
            time, and one dimension of space. You saw the order of events as each observer works it out from their own ruler
            and clocks. That is not what they would see with their own eyes, because light takes time to arrive: a later
            experiment returns to that. And nothing here showed a signal faster than light. Paragraph 6 says only what would
            follow if there were one.
          </p>
        </div>
      )}
    </div>
  )
}
