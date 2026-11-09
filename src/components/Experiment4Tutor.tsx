import { useState } from 'react'
import { guessPositionOnTickBars, halfTripNumbers, runLightClockExperiment } from '../physics/lightClockExperiment'
import { timeDilationWorkedNumbers } from '../physics/movingClockExperiment'

// Relativity of Time and Motion, Experiment 4's tutor (Part 4), audited to the newer rules
// (docs/audit/relativity-of-time-and-motion/04-draft-wording.md, section 9). The prompts point to the white YOUR GUESS mark by
// name and give no verdict; the explanation marks the guess with no score. Every number comes from the physics module
// (CLAUDE.md §9). The wording is the owner's to approve line by line (CLAUDE.md §28.1).

type TutorStep = 'observe' | 'compare' | 'conceptual' | 'explained'

interface Experiment4TutorProps {
  onExplained?: () => void
  velocity: number
  prediction: number
}

const textStyle = { marginBottom: '1rem', fontSize: '0.95rem', color: '#333', lineHeight: '1.6' } as const
const pointStyle = { marginTop: '1rem', marginBottom: '1rem', fontSize: '0.95rem', color: '#333', lineHeight: '1.6' } as const

export function Experiment4Tutor({ velocity, prediction, onExplained }: Experiment4TutorProps) {
  const run = runLightClockExperiment(velocity)
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
            {tutorStep === 'observe' && 'Look at the two light paths and at the two bars. What did you notice about the two light paths?'}
            {tutorStep === 'compare' &&
              `You guessed that one tick of the moving clock would take ${prediction} seconds. That is the white mark on the bars. On the lab's clocks it really took ${run.movingTickDuration.toFixed(3)} seconds, while one tick of the clock standing still took ${run.restTickDuration.toFixed(3)} seconds. What do you notice when you compare them?`}
            {tutorStep === 'conceptual' &&
              'Both light pulses travelled at the same speed. But one of them had farther to go. What does that tell you about how long its trip takes?'}
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

      {tutorStep === 'explained' && <Experiment4Explanation velocity={velocity} prediction={prediction} />}
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

export function Experiment4Explanation({ velocity, prediction }: { velocity: number; prediction: number }) {
  const run = runLightClockExperiment(velocity)
  const mark = guessPositionOnTickBars(run, prediction)
  const trip = halfTripNumbers(run)
  const numbers = timeDilationWorkedNumbers(velocity)
  const slow = runLightClockExperiment(0.1)
  const fast = runLightClockExperiment(0.8)
  const fastest = runLightClockExperiment(0.99)

  return (
    <div>
      <p style={textStyle}>
        <strong>First, the clock itself.</strong> The light source and the two mirrors are all parts of the same moving clock. So,
        seen from the lab, they always move together, side by side, at the same speed. None of them moves before or after the others.
      </p>
      <p style={textStyle}>
        <strong>A familiar version of this.</strong> Toss a ball straight up and catch it while riding in a train moving at a steady
        speed. To you, sitting on the train, the ball goes straight up and comes straight back down into your hand. But someone
        standing on the platform, watching the train go by, sees something different: because the train carries the ball forward the
        whole time it's in the air, the ball traces out a diagonal path — forward and up, then forward and down. Same ball, same toss —
        just two different, equally correct views, because the two of you are moving relative to each other. The light clock works
        exactly the same way, just with a light pulse instead of a ball.
      </p>
      <p style={{ ...textStyle, marginBottom: '0.5rem' }}>
        <strong>In the lab's reference frame,</strong> which is the view you just watched, the whole moving clock slides sideways.
        Follow one tick:
      </p>
      <ol style={{ marginTop: 0, marginBottom: '1rem', paddingLeft: '1.5rem', fontSize: '0.95rem', color: '#333', lineHeight: '1.6' }}>
        <li>The pulse leaves the light source, at the bottom.</li>
        <li>
          Crossing the gap takes time. During that time, the light source and the top mirror both keep moving sideways.
        </li>
        <li>
          So when the pulse reaches the top, that mirror has moved on. It is no longer straight above the spot where the pulse
          started.
        </li>
        <li>To reach the mirror, the pulse has to travel on a slant. That is why its path is diagonal.</li>
        <li>
          The same thing happens on the way back down: the light source and the bottom mirror have moved on, so the path slants
          again.
        </li>
      </ol>
      <p style={textStyle}>
        <strong>In the moving clock's own reference frame,</strong> which is the view of someone riding along with the clock, it looks
        different. The light source and both mirrors stand still right next to that person, so nothing slides sideways. The pulse goes
        straight up to the top mirror and straight back down, just like in the clock that stands still.
      </p>
      <p style={textStyle}>
        <strong>So:</strong> one pulse, one clock, two views, and both are correct. In the clock's own view, the path is straight up
        and down. In the lab's view, it is a slanted "V". A <strong>right triangle</strong> is a triangle with one square corner. Its
        long side, opposite the square corner, is called the diagonal. The lab's slanted path is the long side of a right triangle, so
        it is longer than the straight path of the clock standing still.
      </p>
      <p style={textStyle}>
        <strong>Working out the diagonal, with real numbers.</strong> At {velocity}c, here's the actual trip: going up, the pulse rises{' '}
        {trip.rise} light-seconds (straight up, in the clock's own view) while the clock carries it {trip.sidewaysHalf.toFixed(3)}{' '}
        light-seconds sideways (in the lab's view). Combining those two distances — the same way you'd measure the diagonal of a
        rectangle — gives a diagonal length of {trip.diagonal.toFixed(3)} light-seconds for the trip up alone. Double that for the full
        round trip: {trip.roundTrip.toFixed(3)} light-seconds — and since light covers exactly 1 light-second every second, that's why
        the tick takes {run.movingTickDuration.toFixed(3)} seconds instead of the rest clock's {run.restTickDuration.toFixed(3)}.
      </p>
      <p style={textStyle}>
        This experiment rests on one assumption: in the lab, light travels at the same speed, c, for both clocks. This is an
        established physical fact (it is Einstein's postulate), and we take it as given here. The light in the moving clock has a
        longer path to cover, but it cannot go faster. So each tick takes longer on the lab's clocks.
      </p>
      <p style={textStyle}>
        This effect is called <strong>time dilation</strong>. It is one of the most surprising ideas in relativity. A moving clock, a
        perfectly good clock, counts less time than the lab&rsquo;s clocks between the same two events: here, the start and the end
        of one tick. It isn&rsquo;t broken. It is how time works when things move fast relative to each other.
      </p>
      <p style={textStyle}>
        At {velocity}c, one tick of the moving clock took {run.movingTickDuration.toFixed(3)} seconds on the lab&rsquo;s clocks,
        but the moving clock counted only {run.restTickDuration.toFixed(3)} second for it. That is {run.timeDilationFactor.toFixed(3)}{' '}
        of the lab time. It is the same factor you saw in &ldquo;A moving clock&rdquo; for this speed. Here it comes from the right
        triangle.
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
        — that&rsquo;s your shrinking factor. Multiply it by the lab time for one tick:{' '}
        <code>
          {run.movingTickDuration.toFixed(3)} × {numbers.factor.toFixed(3)} = {run.restTickDuration.toFixed(3)}
        </code>{' '}
        second — exactly what the moving clock counted.
      </p>
      <p style={textStyle}>
        This is a basic fact of relativity: the time that passes between two events depends on who is measuring (their reference
        frame) and how they are moving. In this chapter you saw why it happens: light always travels at the same speed, so the
        longer slanted path in the lab takes longer to cross.
      </p>
      <p style={textStyle}>
        <strong>What this means for a traveller.</strong> Imagine a spaceship coasting at a steady speed close to the speed of light.
        Measured by the lab's clocks, its clock runs slow, and so does everything else on board, including the traveller's own aging.
        The closer the speed is to c, the bigger the gap becomes. So a traveller who ages one year on the ship could find that many
        years have gone by on the lab's clocks.
      </p>
      <p style={pointStyle}>
        <strong>Your guess, marked.</strong> Your guess, {prediction} {prediction === 1 ? 'second' : 'seconds'},{' '}
        {Math.round(mark.differenceFromMoving * 1000) === 0 ? 'is ' : 'was '}
        {compareWith(mark.differenceFromMoving, 'the', run.movingTickDuration)}
        {' one tick of the moving clock took'}
        {Math.round(mark.differenceFromMoving * 1000) === 0
          ? '.'
          : `, and ${compareWith(mark.differenceFromRest, 'the rest clock’s', run.restTickDuration)}.`}
      </p>
      <p style={pointStyle}>
        <strong>1. Why your guess did not change the clocks.</strong> Whatever you guessed, one tick of the moving clock took its own{' '}
        {run.movingTickDuration.toFixed(3)} seconds on the lab's clocks. Think of two kitchen timers: guessing that one of them will
        ring early does not make it ring early. A different guess only changes the gap between your white mark and the end of the bar.
      </p>
      <p style={pointStyle}>
        <strong>2. What the bars show.</strong> The two bars start together, when both pulses leave the bottom mirror, and end at the
        two ticks, {run.restTickDuration.toFixed(3)} and {run.movingTickDuration.toFixed(3)} seconds. The gap between their ends is how
        much longer the moving clock's tick took, and it comes from the longer path the light has to take.
      </p>
      <p style={pointStyle}>
        <strong>3. Try it in Part 2.</strong> Try 0.1c and 0.8c. At 0.1c the tick is {slow.movingTickDuration.toFixed(3)} seconds,
        hardly longer than the rest clock's; at 0.8c it is {fast.movingTickDuration.toFixed(3)} seconds. Try 0.99c: one tick takes{' '}
        {fastest.movingTickDuration.toFixed(3)} seconds.
      </p>
      <p style={{ ...pointStyle, marginBottom: 0 }}>
        <strong>4. What comes next.</strong> This experiment showed why a moving clock's ticks are farther apart. In the next chapter,
        &ldquo;Why can&rsquo;t light go faster?&rdquo;, you look at the assumption it rested on: that light's speed does not change.
      </p>
    </div>
  )
}
