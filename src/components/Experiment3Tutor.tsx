import { useState } from 'react'
import {
  classifyMovingClockGuess,
  guessPositionOnBars,
  runMovingClockExperiment,
  timeDilationWorkedNumbers,
} from '../physics/movingClockExperiment'

// Relativity of Time and Motion, Experiment 3's tutor (Part 4), audited to the newer rules
// (docs/audit/relativity-of-time-and-motion/03-draft-wording.md, section 9). The prompts point to the white YOUR GUESS mark by
// name and give no verdict; the explanation marks the guess with no score. Every number, the guess classification and the
// "Your numbers" arithmetic come from the physics module (CLAUDE.md §9). The wording is the owner's to approve line by line
// (CLAUDE.md §28.1).

type TutorStep = 'observe' | 'compare' | 'conceptual' | 'explained'

interface Experiment3TutorProps {
  onExplained?: () => void
  velocity: number
  durationSeconds: number
  prediction: number
}

function secondsLabel(value: number): string {
  return `${value} ${value === 1 ? 'second' : 'seconds'}`
}

const textStyle = { marginBottom: '1rem', fontSize: '0.95rem', color: '#333', lineHeight: '1.6' } as const
const pointStyle = { marginTop: '1rem', marginBottom: '1rem', fontSize: '0.95rem', color: '#333', lineHeight: '1.6' } as const

export function Experiment3Tutor({ velocity, durationSeconds, prediction, onExplained }: Experiment3TutorProps) {
  const run = runMovingClockExperiment(durationSeconds, velocity)
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
  // At 0c the clock does not move, so the two clocks agree and there is no effect to explain.
  const isBaseline = run.timeDifferential === 0

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
              'Look at the two clocks and at the two bars. What did you notice? Did the moving clock show the same time as the lab clock?'}
            {tutorStep === 'compare' &&
              `You guessed that the moving clock would read ${secondsLabel(prediction)}. That is the white mark on the bars. It really read ${run.movingClockElapsedTime.toFixed(3)} seconds, while the lab clock read ${run.observerElapsedTime.toFixed(3)} seconds. Were you surprised?`}
            {tutorStep === 'conceptual' &&
              (isBaseline
                ? 'This clock wasn\'t moving at all. Why do you think the two clocks agree? Think back to "Two clocks at rest".'
                : 'Why do you think the moving clock measured a different amount of time? What could be different between a clock that is moving and a clock that stands still?')}
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
        <Experiment3Explanation velocity={velocity} durationSeconds={durationSeconds} prediction={prediction} />
      )}
    </div>
  )
}

// "the same as", or "N seconds more/less than", rounded to the three decimals the page shows.
function compareWith(difference: number, whose: string, actual: number): string {
  const rounded = Math.round(difference * 1000) / 1000
  return rounded === 0
    ? `the same as ${whose} ${actual.toFixed(3)} seconds`
    : `${Math.abs(rounded).toFixed(3)} seconds ${rounded > 0 ? 'more' : 'less'} than ${whose} ${actual.toFixed(3)} seconds`
}

export function Experiment3Explanation({
  velocity,
  durationSeconds,
  prediction,
}: {
  velocity: number
  durationSeconds: number
  prediction: number
}) {
  const run = runMovingClockExperiment(durationSeconds, velocity)
  const isBaseline = run.timeDifferential === 0
  const kind = classifyMovingClockGuess(run, prediction)
  const mark = guessPositionOnBars(run, prediction)
  const numbers = timeDilationWorkedNumbers(velocity)
  // For point 3: the same speed for twice the length, from the model.
  const doubled = runMovingClockExperiment(2 * durationSeconds, velocity)

  const marked = (
    <p style={pointStyle}>
      <strong>Your guess, marked.</strong> Your guess, {secondsLabel(prediction)}, {isBaseline ? 'is ' : 'was '}
      {compareWith(mark.differenceFromMoving, 'the moving clock’s', run.movingClockElapsedTime)}
      {isBaseline ? '.' : `, and ${compareWith(mark.differenceFromLab, 'the lab clock’s', run.observerElapsedTime)}.`}
    </p>
  )

  if (isBaseline) {
    return (
      <div>
        <p style={textStyle}>
          With no motion, the "moving" clock stays right beside the lab clock, so the two clocks agree. That matches what you found
          in &ldquo;Two clocks at rest&rdquo; for clocks that stand still. This is your starting point, or baseline.
        </p>
        <p style={{ ...textStyle, marginBottom: 0 }}>
          Now choose a speed above 0c and run it again. The clocks will no longer agree, and the gap gets bigger as the speed goes
          up. This difference is called <strong>time dilation</strong>. &ldquo;The light clock&rdquo;, the next chapter, shows why it
          happens.
        </p>
        {marked}
      </div>
    )
  }

  return (
    <div>
      {kind === 'close-to-actual' && (
        <p style={textStyle}>Great! You sensed that motion and time are connected. Let's find out why that happens.</p>
      )}
      {kind === 'close-to-lab' && (
        <p style={textStyle}>
          That's really interesting. Most people think both clocks would measure the same time, so you're not alone. But this
          experiment shows something surprising about time itself.
        </p>
      )}
      <p style={textStyle}>
        This effect is called <strong>time dilation</strong>. It is one of the most surprising ideas in relativity. A moving clock, a
        perfectly good clock, measures less time than the lab measures between the same two events: the start and the end of the run.
        It isn't broken. It is how time works when things move fast relative to each other.
      </p>
      <p style={textStyle}>
        At {velocity}c, the moving clock measured {run.movingClockElapsedTime.toFixed(3)} seconds while the lab clock measured{' '}
        {run.observerElapsedTime.toFixed(3)} seconds. That is {run.timeDilationFactor.toFixed(3)} of the lab time.
      </p>
      <p style={textStyle}>
        <strong>About the formula.</strong> The rule is <code>Δt_moving = Δt_lab × √(1 − v²)</code>. In plain words: take the lab
        time, multiply it by a "shrinking factor," and you get the moving clock's time. Here, <code>v</code> is the clock's speed
        written as a fraction of light speed — so a clock at 60% of light speed is just <code>v = 0.6</code>. We write speed this way
        because light speed is a universal limit, so every possible speed lands somewhere between 0 and 1.
      </p>
      <p style={textStyle}>
        The shrinking factor, <code>√(1 − v²)</code>, works like a dial. At <code>v = 0</code> (no motion at all), the factor is
        exactly 1 — nothing shrinks, and the moving clock agrees with the lab clock, just like the two clocks you compared in
        &ldquo;Two clocks at rest&rdquo;. As <code>v</code> climbs toward 1 (closer to light speed), <code>v²</code> climbs too, so{' '}
        <code>1 − v²</code> shrinks toward 0 — and so does its square root. That means the factor gets smaller and smaller the faster
        the clock moves, so the moving clock's reading shrinks more and more compared to the lab's. It never quite reaches 0, because{' '}
        <code>v</code> always stays below 1 — the clock never quite reaches light speed.
      </p>
      <p style={textStyle}>
        <strong>Your numbers.</strong> At {velocity}c: first,{' '}
        <code>
          1 − v² = 1 − {numbers.vSquared.toFixed(2)} = {numbers.oneMinusVSquared.toFixed(3)}
        </code>
        . Then take the square root:{' '}
        <code>
          √{numbers.oneMinusVSquared.toFixed(3)} = {numbers.factor.toFixed(3)}
        </code>{' '}
        — that's your shrinking factor. Multiply it by the lab time:{' '}
        <code>
          {run.observerElapsedTime.toFixed(3)} × {numbers.factor.toFixed(3)} = {run.movingClockElapsedTime.toFixed(3)}
        </code>{' '}
        seconds — exactly what the moving clock read.
      </p>
      <p style={textStyle}>
        This is a basic fact of relativity: the time that passes between two events depends on who is measuring (their reference
        frame) and how they are moving. &ldquo;The light clock&rdquo;, the next chapter, shows why it happens.
      </p>
      {marked}
      <p style={pointStyle}>
        <strong>1. Why your guess did not change the clocks.</strong> Whatever you guessed, the moving clock counted its own{' '}
        {run.movingClockElapsedTime.toFixed(3)} seconds. Think of two kitchen timers: guessing that one of them will ring early does
        not make it ring early. A different guess only changes the gap between your white mark and the end of the bar.
      </p>
      <p style={pointStyle}>
        <strong>2. What the bars show.</strong> The two bars start together and end at the two clocks&rsquo; counts,{' '}
        {run.observerElapsedTime.toFixed(3)} and {run.movingClockElapsedTime.toFixed(3)} seconds. The gap between their ends is the
        difference you saw in the results. It is not a fault of the moving clock: both clocks counted correctly along their own paths.
      </p>
      <p style={pointStyle}>
        <strong>3. Try it in Part 2.</strong> Try the same length at 0c and at 0.8c. At 0c the two bars end together; at 0.8c the gap
        is larger. Try {doubled.labTimeDuration} seconds at {velocity}c: the gap grows from {run.timeDifferential.toFixed(3)} to{' '}
        {doubled.timeDifferential.toFixed(3)} seconds, but the factor stays at {doubled.timeDilationFactor.toFixed(3)}.
      </p>
      <p style={{ ...pointStyle, marginBottom: 0 }}>
        <strong>4. What comes next.</strong> This experiment measured how big the difference is. It did not say why. In the next
        chapter, &ldquo;The light clock&rdquo;, you look inside a clock to find the reason.
      </p>
    </div>
  )
}
