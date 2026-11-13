import { useState } from 'react'
import {
  evaluateBlackHole,
  LAUNCH_DISTANCE,
  partOneOutcomes,
  SPEED_OF_LIGHT,
  tutorMarking,
} from '../physics/blackHoleExperiment'
import type { SpeedCompareChoice, YesNo } from '../physics/blackHoleExperiment'

// Gravity and Curved Spacetime, Experiment 7's tutor (Part 4), audited to the newer rules (docs/audit/gravity-and-curved-spacetime/
// 07-draft-wording.md, section 9, approved by the owner on 2026-11-13). The three questions point to the white marks and the amber curve
// by name and give no verdict; the explanation marks all three guesses. Every number comes from the physics module (CLAUDE.md §9).

type TutorStep = 'observe' | 'compare' | 'conceptual' | 'explained'

interface BlackHoleTutorProps {
  lightGuess: SpeedCompareChoice
  heavyGuess: SpeedCompareChoice
  inBetweenGuess: YesNo
  onExplained?: () => void
}

const GUESS_TEXT: Record<SpeedCompareChoice, string> = {
  'much-slower': 'much slower than light',
  faster: 'faster than light',
  'cannot-escape': 'nothing can escape at all',
}

const pointStyle = { marginBottom: '1rem', fontSize: '0.95rem', color: '#333', lineHeight: '1.6' } as const
const percent = (fraction: number) => Math.round(fraction * 100)

export function BlackHoleExplanation({ lightGuess, heavyGuess, inBetweenGuess }: Omit<BlackHoleTutorProps, 'onExplained'>) {
  const marking = tutorMarking(lightGuess, heavyGuess, inBetweenGuess)
  const real = partOneOutcomes()
  const lightPct = percent(marking.light.fractionOfC)
  const heavyPct = percent(marking.heavy.fractionOfC)
  const special = marking.inBetween.specialMass
  const half = evaluateBlackHole(0.5, LAUNCH_DISTANCE).escapeSpeedFractionOfC
  const twoPct = evaluateBlackHole(special, LAUNCH_DISTANCE).escapeSpeedFractionOfC

  const lightMarked =
    lightGuess === 'much-slower'
      ? `That matches what you guessed.`
      : `That is different from what you guessed.`
  const heavyMarked =
    heavyGuess === 'cannot-escape'
      ? 'That matches what you guessed.'
      : heavyGuess === 'faster'
        ? 'Faster than light is the number the formula gives, but a launch cannot actually be that fast, because nothing can go faster than light. So the real result is not a faster launch: it is that the probe cannot get away. That is different from what you guessed, although the number you had in mind was the right one.'
        : 'That is different from what you guessed.'
  const inBetweenMarked = marking.inBetween.matches ? 'That matches what you guessed.' : 'That is different from what you guessed.'

  return (
    <div>
      <p style={pointStyle}>
        <strong>Your guesses, marked.</strong> For a very small mass you guessed &ldquo;{GUESS_TEXT[lightGuess]}&rdquo;. For the mass of{' '}
        {real.light.mass.toFixed(1)} the speed needed to escape is {lightPct} percent of the speed of light, which is much slower, and the
        probe gets away. {lightMarked} For a very large mass you guessed &ldquo;{GUESS_TEXT[heavyGuess]}&rdquo;. For the mass of{' '}
        {real.heavy.mass.toFixed(1)} the formula asks for {heavyPct} percent of the speed of light, and the probe falls back. {heavyMarked} You
        guessed {inBetweenGuess === 'yes' ? 'yes' : 'no'}, that {inBetweenGuess === 'yes' ? 'something special happens' : 'nothing special happens'}{' '}
        in between. In fact the answer is yes: at mass {special.toFixed(1)} the escape speed is exactly the speed of light, and the horizon
        reaches the launch point. {inBetweenMarked}
      </p>

      <p style={pointStyle}>
        <strong>1. Escape speed grows with mass</strong>, the same escape speed as in Experiment 6. With the launch point held at the same
        distance, a heavier mass takes more speed to get away from. It grows like a square root: take mass 0.5, which needs {percent(half)} percent
        of the speed of light. Four times the mass, {special.toFixed(1)}, needs {percent(twoPct)} percent: twice as much, not four times. At
        mass {real.light.mass.toFixed(1)} it is {lightPct} percent and at mass {real.heavy.mass.toFixed(1)} it is {heavyPct} percent.
      </p>
      <p style={pointStyle}>
        <strong>2. Past mass {special.toFixed(1)}, the formula would ask for more than the speed of light.</strong> At mass{' '}
        {real.heavy.mass.toFixed(1)} it asks for {heavyPct} percent. But nothing can go faster than light, which Experiment 5 of
        &ldquo;Relativity of Time and Motion&rdquo; showed. The probe is launched at the very top speed there is, and for these masses that
        is still short of what it needs.
      </p>
      <p style={pointStyle}>
        <strong>3. So, from inside a certain distance, nothing can escape, not even light.</strong> That distance is the radius of the
        dashed circle in the drawing: the <strong>event horizon</strong>, the place of no return. It is drawn exactly where the escape
        speed would be the speed of light: at the light mass it is a tiny circle of radius {real.light.eventHorizonRadius.toFixed(2)}, and at the
        heavy mass it is a big circle of radius {real.heavy.eventHorizonRadius.toFixed(2)}. The launch point, at distance {LAUNCH_DISTANCE}, is
        outside the first and inside the second. An object squeezed so tightly that it has an event horizon is a <strong>black hole</strong>.
      </p>
      <p style={pointStyle}>
        <strong>4. A real horizon is a little different from this model, and the difference is worth a moment.</strong> In this experiment
        the probe fell back because it did not have enough speed. A real horizon is not about speed at all. Think of water draining from a
        sink. Above the drain, you can flick a droplet sideways and it might skim away across the surface. But once a droplet is close
        enough to the drain, every direction along the surface curves down into it: there is no direction left, however fast the droplet
        moves, that leads back away from the drain. A real black hole&rsquo;s horizon works the same way. Farther from the mass than the
        horizon, &ldquo;moving away&rdquo; is still a direction you can travel in, so something fast enough, even light, can use it to
        escape. Closer than the horizon, that direction no longer exists: every direction left, even straight away from the mass, leads
        closer to it. (The sink is only a way of picturing this. It is an analogy, not a real drain.)
      </p>
      <p style={pointStyle}>
        <strong>5. This is not new physics.</strong> It is Experiment 6&rsquo;s escape speed taken to its limit. In this model the
        horizon&rsquo;s radius comes out as 2 × mass ÷ (speed of light)², which here, at mass {special.toFixed(1)}, is 2 × {special.toFixed(1)} ÷ {SPEED_OF_LIGHT}² ={' '}
        {((2 * special) / (SPEED_OF_LIGHT * SPEED_OF_LIGHT)).toFixed(2)}, the launch distance. That has the
        same form as the radius of a real, non-spinning black hole, but that is a curious match of form between a simple model and the full
        theory, not a proof that the model is right.
      </p>
      <p style={pointStyle}>
        <strong>6. The idea is old.</strong> John Michell imagined &ldquo;dark stars&rdquo;, bodies so massive that even light could not escape,
        in a letter printed in 1784, by this same escape-speed reasoning. Laplace came to the same idea in the 1790s. The exact description,
        which does not rest on this simple argument, came within about a month of Einstein&rsquo;s general theory of relativity (published
        1915): Karl Schwarzschild found it.
      </p>
      <p style={pointStyle}>
        <strong>7. This used ordinary gravity</strong>, the same simplification Experiments 2, 3, 5 and 6 of this chapter use, not the
        exact general-relativistic treatment a real black hole needs. The mass, the distance and the speed of light here are relative,
        made-up amounts, not real numbers.
      </p>
      <p style={{ ...pointStyle, marginBottom: 0 }}>
        <strong>8. There is more to a real black hole than this simple picture.</strong> Real horizons are described exactly by general
        relativity, and a real black hole very slowly loses energy by a tiny effect called Hawking radiation. Those ideas are met in later
        chapters, in the group called &ldquo;Black Holes and Strong Gravity&rdquo;.
      </p>
    </div>
  )
}

export function BlackHoleTutor({ lightGuess, heavyGuess, inBetweenGuess, onExplained }: BlackHoleTutorProps) {
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
              'Look at your three launches in Part 1: the drawing, the graph and the table in Part 3. In the very light case, what did the probe do? And in the very heavy case? Say what you saw.'}
            {tutorStep === 'compare' &&
              `Your guesses are the white marks on the graph in Part 1, each in a box labelled YOUR GUESS: one for the very light mass, one for the very heavy mass and one for the in-between question. You guessed ${GUESS_TEXT[lightGuess]} for the light mass and ${GUESS_TEXT[heavyGuess]} for the heavy mass, and you guessed ${inBetweenGuess === 'yes' ? 'yes' : 'no'} to the question about a mass in between. Now look at the amber curve. Where does it cross the dashed speed-of-light line, and where did you put your in-between mark? What do you notice? (A white mark for “faster”, “nothing can escape” or “no” is only a marker, so its height means nothing.)`}
            {tutorStep === 'conceptual' &&
              'If you have not already, try a few masses of your own in Part 2 and watch the pink dot move along the curve. The formula, pushed far enough, asks for an escape speed faster than light. But nothing can go faster than light. So what must really happen near a mass that heavy?'}
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
        <BlackHoleExplanation lightGuess={lightGuess} heavyGuess={heavyGuess} inBetweenGuess={inBetweenGuess} />
      )}
    </div>
  )
}
