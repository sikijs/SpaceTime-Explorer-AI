import { useState } from 'react'
import {
  choiceMarker,
  everydayHalfTripNumbers,
  guessPositionOnTickBars,
  runInvariantLightSpeedExperiment,
} from '../physics/invariantLightSpeedExperiment'
import type { InvariantLightSpeedResult, RuleChoice } from '../physics/invariantLightSpeedExperiment'

// Relativity of Time and Motion, Experiment 5's tutor (Part 4), audited to the newer rules
// (docs/audit/relativity-of-time-and-motion/05-draft-wording.md, section 9, approved by the owner on 2026-11-09). The prompts point
// to the white marks by name and give no verdict; the explanation marks each guess with no score and no "right" or "wrong". Every
// number comes from the physics module (CLAUDE.md §9). The wording is the owner's to approve line by line (CLAUDE.md §28.1).

type TutorStep = 'observe' | 'compare' | 'conceptual' | 'explained'

export interface Experiment5Prediction {
  choice: RuleChoice
  everydayTick: number
  actualTick: number
}

interface Experiment5TutorProps {
  onExplained?: () => void
  run: InvariantLightSpeedResult
  prediction: Experiment5Prediction
}

const textStyle = { marginBottom: '1rem', fontSize: '0.95rem', color: '#333', lineHeight: '1.6' } as const
const pointStyle = { marginTop: '1rem', marginBottom: '1rem', fontSize: '0.95rem', color: '#333', lineHeight: '1.6' } as const

// What the learner chose, in words.
const CHOSE: Record<RuleChoice, string> = {
  everyday: 'the everyday rule',
  actual: 'light’s actual rule',
  same: 'both rules the same',
}

export function Experiment5Tutor({ run, prediction, onExplained }: Experiment5TutorProps) {
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
  const everyday = run.everydayRule.movingTickDuration
  const actual = run.actualRule.movingTickDuration

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
              'Look at the three clocks and at the three bars. What is different between the two moving clocks? Think about the path the light takes and how long each tick lasted.'}
            {tutorStep === 'compare' &&
              `You chose ${CHOSE[prediction.choice]} as the one that makes the tick longer. That is the white marker. You guessed ${prediction.everydayTick} s for the everyday rule and ${prediction.actualTick} s for light’s actual rule. Those are the white marks on the bars. On the lab's clocks the real times were ${everyday.toFixed(3)} s and ${actual.toFixed(3)} s. What do you notice when you compare your marks with the bars?`}
            {tutorStep === 'conceptual' &&
              'Under the everyday rule, how fast was the light going when we watched from the lab? Was that faster than c, slower than c, or exactly c?'}
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

      {tutorStep === 'explained' && <Experiment5Explanation run={run} prediction={prediction} />}
    </div>
  )
}

// "is the same as", or "was N seconds more/less than", rounded to the three decimals the page shows (no verdict, no score).
function compareGuess(difference: number, real: number): string {
  const rounded = Math.round(difference * 1000) / 1000
  return rounded === 0
    ? `is the same as the ${real.toFixed(3)} seconds one tick took under that rule`
    : `was ${Math.abs(rounded).toFixed(3)} seconds ${rounded > 0 ? 'more' : 'less'} than the ${real.toFixed(3)} seconds one tick took under that rule`
}

export function Experiment5Explanation({ run, prediction }: { run: InvariantLightSpeedResult; prediction: Experiment5Prediction }) {
  const trip = everydayHalfTripNumbers(run)
  const marker = choiceMarker(run, prediction.choice)
  const everydayMark = guessPositionOnTickBars(run, 'everyday', prediction.everydayTick)
  const actualMark = guessPositionOnTickBars(run, 'actual', prediction.actualTick)
  const slow = runInvariantLightSpeedExperiment(0.1)
  const fast = runInvariantLightSpeedExperiment(0.8)
  const fastest = runInvariantLightSpeedExperiment(0.99)
  const v = run.velocity
  const rest = run.restTickDuration.toFixed(3)
  const everyday = run.everydayRule.movingTickDuration.toFixed(3)
  const actual = run.actualRule.movingTickDuration.toFixed(3)
  const realResult =
    marker.longerTick === 'actual'
      ? 'light’s actual rule gave the longer tick'
      : marker.longerTick === 'everyday'
        ? 'the everyday rule gave the longer tick'
        : 'both rules gave the same tick'

  return (
    <div>
      <p style={textStyle}>Let's go through it one step at a time.</p>
      <p style={textStyle}>
        <strong>What stayed the same.</strong> Both moving clocks are the same clock. Someone riding along with it sees the light go
        straight up and straight back down at speed c, so on the clock's own display, one tick lasts {rest} second. That is why both
        moving clocks showed {rest} second at the end. The two rules only differ in what the lab sees.
      </p>
      <p style={textStyle}>
        <strong>The everyday rule.</strong> From the lab, the light does two things at once: it goes up, and the moving clock carries it
        sideways. It is like the ball thrown from a train, which gets the train's speed added to its own. So the light follows a
        slanted path, and it travels faster than c: at {v}c, that is {run.everydayRule.lightSpeedInLab.toFixed(3)}c. The light is going
        faster, so it covers the longer, slanted path in the same time as the clock at rest. One tick takes {everyday} seconds of lab
        time. So the moving clock ticks just like the clock standing still. With this rule, there is no time dilation.
      </p>
      <p style={textStyle}>
        <strong>Working the numbers.</strong> At {v}c, going up, the light rises {trip.rise} light-seconds (straight up, in the clock's
        own view) while the clock carries it {trip.sidewaysHalf.toFixed(3)} light-seconds sideways (the same as under light's actual
        rule, since both rules move the clock the same way). Combining those gives a diagonal length of {trip.diagonal.toFixed(3)}{' '}
        light-seconds for the trip up, {trip.roundTrip.toFixed(3)} for the round trip. But under this rule the tick still takes
        exactly {everyday} second, so the light must have covered that longer distance faster than usual: {trip.roundTrip.toFixed(3)} ÷{' '}
        {everyday} = {run.everydayRule.lightSpeedInLab.toFixed(3)}c.
      </p>
      <p style={textStyle}>
        <strong>Light's actual rule.</strong> Now the light does not get the extra speed. Seen from the lab, it always goes at c. The
        path is still slanted and longer, but the light stays at c, so it cannot make up the extra distance by going faster. It simply
        takes longer to get there. At {v}c, one tick took {actual} seconds on the lab's clocks, instead of {rest}. But the moving
        clock's own display still shows only {rest} second per tick. So from the lab, the moving clock ticks more slowly than the
        clock standing still. That is <strong>time dilation</strong>. Its factor is {run.actualRule.timeDilationFactor.toFixed(3)} (
        {rest} second divided by {actual} seconds), the same number you saw in &ldquo;A moving clock&rdquo; and &ldquo;Why time
        dilation happens&rdquo;.
      </p>
      <p style={textStyle}>
        <strong>The big idea.</strong> In this model, a moving clock runs slow because light always goes at c in the lab. If light
        could get the extra speed, like the ball on the train, the moving clock would tick normally. But then light would travel
        faster than c.
      </p>
      <p style={textStyle}>
        <strong>Two things to remember.</strong> First, the everyday rule is only a "what if". It is not something that happens.
        Second, "light always goes at c" is the rule we assume in this course, as in &ldquo;Why time dilation happens&rdquo;. This
        experiment shows what follows from that rule. It does not explain why light behaves this way.
      </p>
      <p style={pointStyle}>
        <strong>Your guesses, marked.</strong> You chose {CHOSE[prediction.choice]} as giving the longer tick; the real result was that{' '}
        {realResult}. Your guess for the everyday rule, {prediction.everydayTick} {prediction.everydayTick === 1 ? 'second' : 'seconds'},{' '}
        {compareGuess(everydayMark.differenceFromReal, run.everydayRule.movingTickDuration)}. Your guess for light&rsquo;s actual rule,{' '}
        {prediction.actualTick} {prediction.actualTick === 1 ? 'second' : 'seconds'},{' '}
        {compareGuess(actualMark.differenceFromReal, run.actualRule.movingTickDuration)}.
      </p>
      <p style={pointStyle}>
        <strong>1. Why your guesses did not change the clocks.</strong> Whatever you guessed, the ticks took their own {everyday} and{' '}
        {actual} seconds on the lab's clocks. Think of two kitchen timers: guessing that one of them will ring early does not make it
        ring early. A different guess only changes the gap between your white marks and the ends of the bars.
      </p>
      <p style={pointStyle}>
        <strong>2. What the bars show.</strong> The three bars start together, when all three pulses leave the bottom mirror, and end
        at the three ticks, {rest}, {everyday} and {actual} seconds. The violet bar is imagined for the question; the amber bar is the
        tick under light&rsquo;s actual rule. The gap between their ends is how much longer a tick lasts when light cannot be sped up.
      </p>
      <p style={pointStyle}>
        <strong>3. Try it in Part 2.</strong> Try 0.1c and 0.8c. At 0.1c the amber tick is {slow.actualRule.movingTickDuration.toFixed(3)}{' '}
        seconds, hardly longer than the rest clock's; at 0.8c it is {fast.actualRule.movingTickDuration.toFixed(3)} seconds. The violet
        tick stays at {fast.everydayRule.movingTickDuration.toFixed(3)} s at every speed. Try 0.99c: the amber tick takes{' '}
        {fastest.actualRule.movingTickDuration.toFixed(3)} seconds, and the violet light's speed would be{' '}
        {fastest.everydayRule.lightSpeedInLab.toFixed(3)}c.
      </p>
      <p style={{ ...pointStyle, marginBottom: 0 }}>
        <strong>4. What comes next.</strong> So far, the light in our clocks went across the motion. Next, we turn the clock so that
        its mirrors are in a line with the motion. Does motion change how long a clock is?
      </p>
    </div>
  )
}
