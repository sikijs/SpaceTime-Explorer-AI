import { useState } from 'react'
import {
  CMB_REDSHIFT,
  REAL_CMB_SOURCE_DISTANCE_TODAY_LIGHT_YEARS,
  REAL_OBSERVABLE_UNIVERSE_RADIUS_LIGHT_YEARS,
  runObservableUniverseExperiment,
} from '../physics/observableUniverseExperiment'

type TodayChoice = 'less' | 'about' | 'more'
type LeftChoice = 'thirteen' | 'few' | 'closer'
type TutorStep = 'observe' | 'compare' | 'conceptual' | 'explained'

interface ObservableUniverseTutorProps {
  predictedToday: TodayChoice
  predictedLeft: LeftChoice
  onExplained?: () => void
}

const todayLabels: Record<TodayChoice, string> = {
  less: 'less than 10 billion light-years away',
  about: 'about 10 billion light-years away',
  more: 'more than 10 billion light-years away',
}

const leftLabels: Record<LeftChoice, string> = {
  thirteen: 'about 13 billion light-years away',
  few: 'a few billion light-years away',
  closer: 'far closer than that, under 100 million light-years away',
}

const billions = (lightYears: number, digits = 1) => (lightYears / 1e9).toFixed(digits)

export function ObservableUniverseTutor({ predictedToday, predictedLeft, onExplained }: ObservableUniverseTutorProps) {
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

  // Numbers for the explanation come from the experiment's own model, never typed in by hand.
  const oldest = runObservableUniverseExperiment(CMB_REDSHIFT)
  const travelled = billions(oldest.lightTravelYears)
  const today = billions(oldest.distanceTodayLightYears)
  const leftMillions = Math.round(oldest.distanceWhenLightLeftLightYears / 1e6)
  const realSource = billions(REAL_CMB_SOURCE_DISTANCE_TODAY_LIGHT_YEARS)
  const realEdge = billions(REAL_OBSERVABLE_UNIVERSE_RADIUS_LIGHT_YEARS)

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
              'Compare the three distances for the source you chose: how far the light travelled (blue), how far away the source is today (gold), and how far away it was when the light left (green). What do you notice?'}
            {tutorStep === 'compare' &&
              `You predicted that a galaxy whose light had travelled for 10 billion years would be ${todayLabels[predictedToday]} today, and that the source of the oldest light was ${leftLabels[predictedLeft]} when the light left it. Comparing that to what you saw, what do you notice?`}
            {tutorStep === 'conceptual' &&
              `The oldest light left its source only about ${travelled} billion years ago, but that source is now about ${today} billion light-years away. How can that be, if nothing can travel faster than light?`}
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
          <p style={{ marginBottom: '1rem', fontSize: '0.95rem', color: '#333', lineHeight: '1.6' }}>
            <strong>1. The observable universe is the part whose light has reached us.</strong> It is not an
            edge of space, only a limit on what we can see, because light from farther away has not had time
            to arrive.
          </p>
          <p style={{ marginBottom: '1rem', fontSize: '0.95rem', color: '#333', lineHeight: '1.6' }}>
            <strong>2. How far the light travelled is only its travel time multiplied by the speed of
            light.</strong> The oldest light has been travelling for about {travelled} billion years, so it
            has covered about {travelled} billion light-years. That is the blue bar.
          </p>
          <p style={{ marginBottom: '1rem', fontSize: '0.95rem', color: '#333', lineHeight: '1.6' }}>
            <strong>3. While the light travelled, the space it crossed stretched.</strong> That carried the
            source away, so the source ended up much farther than the light's own journey. Think of the ant on
            the rubber band again: the ant's steps add up to one length, but the band under it was being
            stretched, so its two ends ended up much farther apart. For the oldest light, the light's journey
            adds up to {travelled} billion light-years, while the distance between the source and Earth grew
            to {today} billion. That is {today} ÷ {travelled} ≈ {oldest.todayOverTravelled.toFixed(2)} times as
            far.
          </p>
          <p style={{ marginBottom: '1rem', fontSize: '0.95rem', color: '#333', lineHeight: '1.6' }}>
            <strong>4. The oldest light's source was very close when the light left.</strong> It was only about{' '}
            {leftMillions} million light-years away then, and is about {today} billion light-years away today.
            Every distance grew by the same factor as the universe's size, which is 1 + the redshift:{' '}
            {leftMillions} million × {oldest.stretchingFactor.toFixed(1)} ≈ {today} billion.
          </p>
          <p style={{ marginBottom: '1rem', fontSize: '0.95rem', color: '#333', lineHeight: '1.6' }}>
            <strong>5. This is not faster-than-light travel.</strong> The light always moved at the speed of
            light through the space around it. What grew was the space between us and the source. Experiment 1
            gave Hubble's Law, which says the farther away a galaxy is, the faster the distance to it is
            growing. Today that growth rate is H0 × distance, which for the oldest light's source works out to
            about {oldest.recessionSpeedTodayOverC.toFixed(1)} times the speed of light. That does not break
            relativity, because it is not a speed through space: nothing is moving through space that fast. It
            is the stretching of the space between us and the source, and relativity's speed limit applies to
            motion through space.
          </p>
          <p style={{ marginBottom: '1rem', fontSize: '0.95rem', color: '#333', lineHeight: '1.6' }}>
            <strong>6. The answer depends on the whole expansion history, not only on the age.</strong> As in
            Experiment 6, how fast the universe expanded at each moment matters. Each stretch of the light's
            journey was stretched further by all the expansion that happened after it, so the total depends on
            the full history. If space had not stretched at all, the distance today would simply equal the
            distance the light travelled. The factor of {oldest.todayOverTravelled.toFixed(2)} for the oldest
            light is the whole history's effect.
          </p>
          <p style={{ marginBottom: '1rem', fontSize: '0.95rem', color: '#333', lineHeight: '1.6' }}>
            <strong>7. The model is close to the real values, not exact.</strong> This model gives {today}{' '}
            billion light-years for the oldest light's source. The real value is about {realSource}, and the
            edge of the observable universe is about {realEdge}. The model is a little low because it leaves
            out radiation, which matters most at the earliest times. Remember too that this experiment used the
            oldest light as a stand-in for the farthest we can see with light; the true edge is slightly farther.
          </p>
          <p style={{ marginBottom: '0', fontSize: '0.95rem', color: '#333', lineHeight: '1.6' }}>
            <strong>8. Not covered here:</strong> the exact edge of the observable universe (the farthest
            distance from which any signal could have reached us by now), the limit on what we will ever be able to see,
            cosmic inflation, and how large the whole universe is. Remember too that this experiment used a
            flat universe with only matter and a constant dark energy, and an illustrative Hubble constant.
          </p>
        </div>
      )}
    </div>
  )
}
