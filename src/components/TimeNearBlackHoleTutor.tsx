import { useState } from 'react'
import {
  BLACK_HOLE_PRESETS,
  FAR_CLOCK_RUN_SECONDS,
  exactSlowingFactor,
  firstOrderSlowingFactor,
  surfaceSlowing,
} from '../physics/timeNearBlackHoleExperiment'

type JustOutsideChoice = 'same' | 'half' | 'tenth' | 'stopped'
type MassChoice = 'small' | 'giant' | 'same'
type ApproximationChoice = 'still-accurate' | 'worse-closer' | 'never-accurate'
type TutorStep = 'observe' | 'compare' | 'conceptual' | 'explained'

interface TimeNearBlackHoleTutorProps {
  predictedJustOutside: JustOutsideChoice
  predictedMass: MassChoice
  predictedApproximation: ApproximationChoice
  onExplained?: () => void
}

const justOutsideClauses: Record<JustOutsideChoice, string> = {
  same: 'a clock hovering 1% beyond the horizon would tick at about the same rate as the far-away one',
  half: 'a clock hovering 1% beyond the horizon would tick about half as fast as the far-away one',
  tenth: 'a clock hovering 1% beyond the horizon would tick about one tenth as fast as the far-away one',
  stopped: 'a clock hovering 1% beyond the horizon would have stopped',
}

const massClauses: Record<MassChoice, string> = {
  small: 'the clock near the small black hole would tick more slowly',
  giant: 'the clock near the giant black hole would tick more slowly',
  same: 'the two clocks would tick at the same relative rate',
}

const approximationClauses: Record<ApproximationChoice, string> = {
  'still-accurate': 'the simple formula would still be about as accurate',
  'worse-closer': 'the simple formula would be accurate far from the horizon but get worse closer in',
  'never-accurate': 'the simple formula would be wrong everywhere near a black hole',
}

// Four significant figures, with no trailing zeros ("0.5", "0.0995").
function fmt(value: number): string {
  return String(Number(value.toPrecision(4)))
}

// Two significant figures, for percentages ("0.14", "6.1").
function fmt2(value: number): string {
  return String(Number(value.toPrecision(2)))
}

// How many times heavier the giant black hole (M87*) is than the small one, in millions; from the presets.
const MASS_RATIO_MILLIONS = Math.round(
  BLACK_HOLE_PRESETS[BLACK_HOLE_PRESETS.length - 1].massSolarMasses / BLACK_HOLE_PRESETS[0].massSolarMasses / 1e6,
)

const paragraphStyle = { marginBottom: '1rem', fontSize: '0.95rem', color: '#333', lineHeight: '1.6' } as const

export function TimeNearBlackHoleTutor({
  predictedJustOutside,
  predictedMass,
  predictedApproximation,
  onExplained,
}: TimeNearBlackHoleTutorProps) {
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
  const factorAtTwo = exactSlowingFactor(2)
  const factorAtOnePercent = exactSlowingFactor(1.01)
  const factorAtTenth = exactSlowingFactor(1.001)
  const earth = surfaceSlowing('earth')
  const sun = surfaceSlowing('sun')
  const neutronStar = surfaceSlowing('neutron-star')
  const ticksPerTenFar = Math.round(1 / factorAtOnePercent)
  const ticksPerTenthFar = Math.round(1 / factorAtTenth)
  const tooHighAtTwoPercent = ((firstOrderSlowingFactor(2) - factorAtTwo) / factorAtTwo) * 100
  const tooHighAtTenPercent = ((firstOrderSlowingFactor(10) - exactSlowingFactor(10)) / exactSlowingFactor(10)) * 100

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
          <p style={paragraphStyle}>
            {tutorStep === 'observe' &&
              "Look at the two clocks. Which one is behind, and by how much? Now try a different distance, and then a different black hole at the same distance in horizon radii. What changed, and what stayed the same?"}
            {tutorStep === 'compare' &&
              `You predicted that ${justOutsideClauses[predictedJustOutside]}; that ${massClauses[predictedMass]}; and that ${approximationClauses[predictedApproximation]}. Comparing that to what you saw, what do you notice?`}
            {tutorStep === 'conceptual' &&
              `A clock at 2 horizon radii from a small black hole and one at 2 horizon radii from a giant one tick at the same relative rate, even though the giant one is ${MASS_RATIO_MILLIONS} million times heavier. What do the two situations have in common?`}
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
            <strong>1. The slowing factor depends only on how many horizon radii away the clock is.</strong> The
            factor is <strong>√(1 − r_s ÷ r)</strong>, where r_s is the horizon radius and r is the clock's
            distance from the center. This formula comes from general relativity, the exact theory of gravity,
            for a black hole that does not spin and has no electric charge. It is given here, not derived.
            Here is a worked example at 2 horizon radii. Then r_s ÷ r = 1 ÷ 2 = 0.5, and 1 − 0.5 = 0.5, and the
            square root of 0.5 is {fmt(factorAtTwo)}. So in {FAR_CLOCK_RUN_SECONDS} seconds on the far-away
            clock, the hovering clock registers about {(factorAtTwo * FAR_CLOCK_RUN_SECONDS).toFixed(2)} seconds.
            The mass never appears except inside r_s, so a small black hole and a giant one give the same answer
            at the same number of horizon radii. This is what the two situations in the last question had in
            common: each clock was the same fraction of the way to its own black hole's edge.
          </p>
          <p style={paragraphStyle}>
            <strong>2. The factor falls toward zero at the horizon.</strong> At 1.01 horizon radii it is{' '}
            {fmt(factorAtOnePercent)}, about one tick for every {ticksPerTenFar} of yours. At 1.001 it is{' '}
            {fmt2(factorAtTenth)}, about one tick for every {ticksPerTenthFar}. The closer the clock is held to the horizon,
            the more slowly it ticks, without limit, as seen from far away. The formula gives exactly zero at the
            horizon itself, but that does not mean a clock can sit there: the push needed to hold it still grows
            without limit too. So the answer to the title question is that the clock never quite stops at any
            distance where it can be held, and it slows more and more the closer it gets.
          </p>
          <p style={paragraphStyle}>
            <strong>3. Why this happens.</strong> It is the same effect as in Gravity and Curved Spacetime,
            Experiment 2: a clock lower down in a gravity field ticks more slowly than one higher up. Suppose
            the hovering clock sends a pulse of light at each tick. The pulses reach the far-away clock stretched
            out, a change called a redshift: they arrive spaced farther apart than they were sent. At 1.01 horizon
            radii, they arrive about {ticksPerTenFar} times farther apart, and that is the slowing you saw. Here the effect is
            at full strength. Notice that this is a different cause from Relativity of Time and Motion,
            Experiments 3 and 4. Neither clock is moving here. Both are held still, and the difference comes from
            where they are in the gravity field.
          </p>
          <p style={paragraphStyle}>
            <strong>4. The simple formula from the earlier experiments is only an approximation.</strong> In
            Gravity and Curved Spacetime, Experiments 2 and 9, the factor was taken to be 1 − r_s ÷ (2r), a
            weak-gravity approximation. Far from the horizon it is very good: at 10 horizon radii it is{' '}
            {fmt2(tooHighAtTenPercent)}% too high. At 2 horizon radii it is {fmt2(tooHighAtTwoPercent)}% too high. At
            the horizon it still says 0.5, while the exact answer is 0. That is why the earlier results for Earth
            and GPS satellites were accurate: Earth's surface is about {Math.round(1 / earth.rsOverR / 1e7) * 10} million horizon radii from its center,
            far inside the range where the simple formula is excellent.
          </p>
          <p style={paragraphStyle}>
            <strong>5. Real objects, for scale.</strong> The same formula says that a clock on Earth's surface
            runs slower than one far away by about {fmt2(earth.fractionSlower * 1e9)} billionths of a second every
            second. On the Sun's surface it is about {fmt2(sun.fractionSlower * 1e6)} millionths. On the surface of
            a neutron star it is about {Math.round(neutronStar.fractionSlower * 100)}%. A neutron star's surface
            is only about {Math.round(1 / neutronStar.rsOverR)} horizon radii from its center, so this is no longer tiny.
          </p>
          <p style={paragraphStyle}>
            <strong>6. What this does and does not say.</strong> This compares two clocks that are each held at
            rest. It does not describe what a traveler who falls toward the black hole experiences. That is
            different, and later experiments in this group are planned to take it up (they are not built yet), so
            this experiment should not be read as saying that time stops for someone falling in.
          </p>
          <p style={paragraphStyle}>
            <strong>7. The honest limits.</strong> This was a thought experiment. It did not say how the hovering
            clock is held in place, and it says nothing about what is inside the horizon. The formula was given,
            not derived, and it is for a black hole that does not spin and has no electric charge. Real black
            holes usually spin, and that changes the picture. The far-away clock was treated as so far that
            gravity does not affect it. The neutron star's size is a rounded value.
          </p>
        </div>
      )}
    </div>
  )
}
