import { useState } from 'react'
import { actualOutcome, labelFor } from './GravitationalTimeDilationExperiment'
import type { PredictionChoice } from './GravitationalTimeDilationExperiment'
import type { GravitationalTimeDilationExperimentResult } from '../physics/gravitationalTimeDilationExperiment'

type TutorStep = 'observe' | 'compare' | 'conceptual' | 'explained'

interface GravitationalTimeDilationTutorProps {
  predictionChoice: PredictionChoice
  result: GravitationalTimeDilationExperimentResult
  onExplained?: () => void
}

export function GravitationalTimeDilationTutor({
  predictionChoice,
  result,
  onExplained,
}: GravitationalTimeDilationTutorProps) {
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
  const actual = actualOutcome()

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
            {tutorStep === 'observe' && 'Look at the two tick counts. Are they the same, or different?'}
            {tutorStep === 'compare' &&
              `You predicted the clocks would tick at ${labelFor(predictionChoice)}. They actually ticked at ${labelFor(actual)}. Comparing what you expected to what happened, what do you notice?`}
            {tutorStep === 'conceptual' &&
              'Why do you think the ceiling clock ran faster than the floor clock, if both clocks are identical and experience the same acceleration?'}
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
            <strong>1. A signal sent upward arrives redshifted.</strong> A light "tick" sent from
            the floor takes time to reach the ceiling — and the whole cabin keeps speeding up
            during that time. By the time each tick arrives, the ceiling has moved further than it
            would have if the cabin weren't accelerating, so each tick arrives stretched out —
            spread over a little more time than it was sent in. Stretching a wave out like this is
            called <strong>redshift</strong>: the name comes from visible light, where stretching
            a light wave out shifts its color toward the red end of the rainbow, but the same word
            is used for any wave — including these clock "ticks" — that arrives stretched out like
            this. That's why, over your run, the ceiling clock counted{' '}
            <strong>{(1 / result.frequencyRatio).toFixed(2)}</strong> ticks for every{' '}
            <strong>1</strong> the floor clock counted — not roughly that ratio but exactly that
            ratio, because the calculation itself is just <code>1 / (1 - strength)</code>, with
            your chosen strength of {result.strength}.
          </p>
          <p style={{ marginBottom: '1rem', fontSize: '0.95rem', color: '#333', lineHeight: '1.6' }}>
            <strong>Why does the acceleration cause this stretching?</strong> The key fact: light's
            speed doesn't depend on how fast the thing that sent it was moving — light always
            travels at the same speed, no matter what the floor was doing. That one fact is what
            makes acceleration matter. Follow the logic:
          </p>
          <ol
            style={{
              marginBottom: '1rem',
              paddingLeft: '1.5rem',
              fontSize: '0.95rem',
              color: '#333',
              lineHeight: '1.6',
            }}
          >
            <li style={{ marginBottom: '0.5rem' }}>
              Picture the exact instant the floor sends a light pulse upward. Right at that
              instant, let's say the whole cabin (floor and ceiling together) happens to be at
              some speed — call it "resting," just for this one moment.
            </li>
            <li style={{ marginBottom: '0.5rem' }}>
              The pulse needs a little time to cross the gap <code>h</code> up to the ceiling:
              roughly <code>t = h / c</code>.
            </li>
            <li style={{ marginBottom: '0.5rem' }}>
              But the rocket doesn't wait for the light — it keeps accelerating the entire time
              the pulse is in flight. So by the time the pulse arrives, the cabin has sped up by{' '}
              <code>v = a × t = a × (h / c)</code>.
            </li>
            <li style={{ marginBottom: '0.5rem' }}>
              That means the light was released when the cabin was at one speed, and it's being
              received by a cabin now moving faster, in the same direction the light is traveling
              — i.e., moving away from where it was launched. A receiver moving away from an
              emission point stretches out an incoming wave: an ordinary Doppler redshift, with
              fractional shift <code>v / c</code>.
            </li>
            <li>
              Substitute step 3's <code>v</code>: fractional redshift ={' '}
              <code>v / c = a × h / c²</code>. That's exactly the "strength" in this experiment's
              formula.
            </li>
          </ol>
          <p style={{ marginBottom: '1rem', fontSize: '0.95rem', color: '#333', lineHeight: '1.6' }}>
            <strong>A daily-life picture.</strong> Imagine floating in calm air next to a drone
            that starts out sitting still, then flies upward, speeding up the whole time. You honk
            a horn once every second, aimed at the drone. Sound travels through the air at a fixed
            speed no matter how the drone moves, so each honk has to catch up to it — and since the
            drone keeps getting faster, each honk takes a little longer to catch up than the one
            before it. So the honks arrive at the drone spaced out more than one second apart: the
            drone hears your steady horn drop in pitch, even though you never moved. That's the
            same mismatch that stretches out the rocket's light ticks.
          </p>
          <p style={{ marginBottom: '1rem', fontSize: '0.95rem', color: '#333', lineHeight: '1.6' }}>
            <strong>A worked example.</strong> Picture a rocket accelerating at 1g, with the two
            clocks 10 meters apart. Say the floor sends a light tick, then another exactly 1
            second later. When the first tick was sent, the cabin's speed was, say, zero; a second
            later, when the next tick is sent, the cabin has sped up by about 9.8 m/s. That means
            the ceiling is moving a little faster when it receives the second tick's journey than
            it was for the first — so the second tick takes very slightly longer to arrive.
            Working through the numbers, the two ticks arrive about{' '}
            <strong>1.09×10⁻¹⁵ seconds</strong> (roughly a millionth of a billionth of a second)
            further apart than they were sent — an almost immeasurably small stretch, but the same
            effect the experiment shows you exaggerated.
          </p>
          <p style={{ marginBottom: '1rem', fontSize: '0.95rem', color: '#333', lineHeight: '1.6' }}>
            <strong>2. This is gravitational time dilation.</strong> In Experiment 1, you found
            that a cabin at rest under gravity and a cabin accelerating through empty space are
            locally indistinguishable. If that's true, the same thing that happened to these two
            clocks in the accelerating rocket must also happen to two clocks at different heights
            in a real gravitational field, with no acceleration or motion involved at all: the
            lower clock runs slow, the higher clock runs fast.
          </p>
          <p style={{ marginBottom: '1rem', fontSize: '0.95rem', color: '#333', lineHeight: '1.6' }}>
            <strong>A note on "time dilation."</strong> This is a different effect from the time
            dilation you saw in Experiment 4. There, a clock ran slow because it was moving
            relative to another clock — and that worked both ways: each clock looked slow from the
            other one's point of view. Neither clock was really "the slow one."
          </p>
          <p style={{ marginBottom: '1rem', fontSize: '0.95rem', color: '#333', lineHeight: '1.6' }}>
            Here, it's different. The floor and ceiling clocks aren't moving relative to each other
            at all — they're both fixed to the same cabin. What's different is where they are: one
            lower, one higher. And this time, it only goes one way: the floor clock really does run
            slower, no matter who's watching — someone on the floor, someone on the ceiling, or
            someone outside. That's because acceleration (and gravity) has a direction — "up"
            toward the ceiling, "down" toward the floor — that both clocks share, unlike Experiment
            4's effect, which came from relative motion instead. Motion causes a "looks slow from
            over there" kind of effect; being lower in gravity (or acceleration) causes a real,
            one-way slowdown that everyone agrees on.
          </p>
          <p style={{ marginBottom: '0', fontSize: '0.95rem', color: '#333', lineHeight: '1.6' }}>
            <strong>3. This is real.</strong> The effect here is exaggerated so you could see it —
            a real building or rocket would show a change far too small to notice. But it's
            genuinely there: GPS satellites, high above the ground, have their clocks correct for
            exactly this effect, or their signals would drift out of sync with clocks on the
            ground.
          </p>
        </div>
      )}
    </div>
  )
}
