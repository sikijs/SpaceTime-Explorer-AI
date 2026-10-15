import { useState } from 'react'
import type { ReactNode } from 'react'
import {
  PROTON_REST_ENERGY_MEV,
  SPEED_OF_LIGHT_METERS_PER_SECOND,
  kineticEnergy,
  lightReading,
  newtonKineticEnergy,
  readingFor,
  runInvariantExperiment,
  speedDeficit,
} from '../physics/energyMomentum'

type Prediction = 'same' | 'nothing' | 'one-number'
type TutorStep = 'observe' | 'compare' | 'conceptual' | 'explained'

interface EnergyMomentumTutorProps {
  kind: 'particle' | 'light'
  speed: number
  passingSpeed: number
  predicted: Prediction
  // Called once, when the learner reaches the explanation (the last step), so the next part can be shown.
  onExplained?: () => void
}

const predictionClauses: Record<Prediction, string> = {
  same: 'the two observers would find the same energy and the same momentum',
  nothing: 'the observers would find different energies and different momenta, with nothing they agree on',
  'one-number': 'the observers would find different energies and different momenta, but would agree on one number worked out from them',
}

// The speeds used in the explanation's tables of examples (general choices, not the learner's).
const LEDGER_SPEEDS = [0.3, 0.6, 0.8, 0.9, 0.99]
// The Large Hadron Collider proton energy used in the real-world paragraph, in MeV (6.5 TeV; spec "Real-World Facts Used").
const LHC_PROTON_ENERGY_MEV = 6.5e6

const paragraphStyle = { marginBottom: '1rem', fontSize: '0.95rem', color: '#333', lineHeight: '1.6' } as const

// Draft wording for the owner's review (CLAUDE.md §28.1). Follows the Part 1 tutor sequence in the specification:
// observe, compare with the prediction, one conceptual question, then the explanation and the limits. Every number below
// comes from the physics model, never typed in by hand.
export function EnergyMomentumTutor({ kind, speed, passingSpeed, predicted, onExplained }: EnergyMomentumTutorProps) {
  const [tutorStep, setTutorStep] = useState<TutorStep>('observe')
  const [responseInput, setResponseInput] = useState('')

  const handleContinue = () => {
    if (responseInput.trim() === '') return
    if (tutorStep === 'observe') setTutorStep('compare')
    else if (tutorStep === 'compare') setTutorStep('conceptual')
    else if (tutorStep === 'conceptual') {
      setTutorStep('explained')
      onExplained?.()
    }
    setResponseInput('')
  }
  const isResponseEmpty = responseInput.trim() === ''

  const isParticle = kind === 'particle'
  const { lab, passing } = runInvariantExperiment(kind, speed, passingSpeed)
  const f = (value: number, digits = 3) => value.toFixed(digits).replace('-', '−')
  const squareOf = (value: number) => value * value

  // Paragraph 4: kinetic energy against Newton's ½v², and the climb from 0.99c to 0.999c.
  const ratios = LEDGER_SPEEDS.map((v) => ({ v, ratio: kineticEnergy(v) / newtonKineticEnergy(v) }))
  const keAt99 = kineticEnergy(0.99)
  const keAt999 = kineticEnergy(0.999)

  // Paragraph 5: the factor by which a +0.6c observer finds the light's energy changed.
  const lightFactor = readingFor(0.6, lightReading(1)).energy

  // Paragraph 7: the proton at the LHC.
  const lhcRestEnergies = LHC_PROTON_ENERGY_MEV / PROTON_REST_ENERGY_MEV
  const lhcDeficit = speedDeficit(lhcRestEnergies)
  const kilogramJoules = SPEED_OF_LIGHT_METERS_PER_SECOND ** 2

  const paragraphs: ReactNode[] = []

  paragraphs.push(
    <>
      <strong>What the table shows.</strong>{' '}
      {isParticle
        ? `In your run, the lab found an energy of ${f(lab.energy, 4)} and a momentum × c of ${f(lab.momentumTimesC, 4)}. The passing observer found ${f(passing.energy, 4)} and ${f(passing.momentumTimesC, 4)}. Different numbers. But look at the last column. For the lab, ${f(lab.energy, 4)} multiplied by itself is ${f(squareOf(lab.energy), 4)}, and ${f(lab.momentumTimesC, 4)} multiplied by itself is ${f(squareOf(lab.momentumTimesC), 4)}, and ${f(squareOf(lab.energy), 4)} − ${f(squareOf(lab.momentumTimesC), 4)} = ${f(lab.invariant, 4)}. For the passing observer, ${f(squareOf(passing.energy), 4)} − ${f(squareOf(passing.momentumTimesC), 4)} = ${f(passing.invariant, 4)}. The same number. The observer who rides along with the particle finds an energy of 1 and a momentum of 0, and 1 − 0 = 1 as well.`
        : `In your run, the lab found an energy of ${f(lab.energy, 4)} and a momentum × c of ${f(lab.momentumTimesC, 4)}. The passing observer found ${f(passing.energy, 4)} and ${f(passing.momentumTimesC, 4)}. Different numbers. But for the lab, ${f(squareOf(lab.energy), 4)} − ${f(squareOf(lab.momentumTimesC), 4)} = ${f(lab.invariant, 4)}, and for the passing observer, ${f(squareOf(passing.energy), 4)} − ${f(squareOf(passing.momentumTimesC), 4)} = ${f(passing.invariant, 4)}. The same number again: zero.`}
    </>,
  )

  paragraphs.push(
    <>
      <strong>The invariant is the mass.</strong> A number that every observer agrees on is called an <em>invariant</em>. The
      combination E² − (momentum × c)² is one. It is the same kind of idea as the interval in Experiment 1 of this group,
      where observers disagreed about time and distance separately but agreed on one combination of them. In physics, this
      invariant is the square of the object's <em>rest energy</em> (the energy it has when it is not moving), and that is what
      is called its <em>mass</em>, measured in energy units. It is like turning a stick on a table: its east-west part and its
      north-south part both change, but its length does not. The comparison is not exact, because here the squares are
      subtracted, not added.
      {isParticle ? ' So the particle has one mass, and every observer finds it.' : ' For light, the invariant is zero: a light pulse has no mass.'}
    </>,
  )

  paragraphs.push(
    isParticle ? (
      <>
        <strong>Why the readings sit on the yellow curve.</strong> The curve is every point where E² − (momentum × c)² equals 1,
        the particle's mass squared in rest energies. Each observer's reading is one point on the map, and because they all
        find the same value of the combination, every reading falls on this one curve, whichever speed the observer has. Your
        lab's point ({f(lab.momentumTimesC, 4)}, {f(lab.energy, 4)}) and the passing observer's point ({f(passing.momentumTimesC, 4)},{' '}
        {f(passing.energy, 4)}) are both on it, and so is the particle's own point (0, 1). A comparison: all the points that are
        exactly 5 steps from a lamp-post make a circle, because adding the squares of the east-west and north-south steps gives
        the same number each time. Here the squares are <em>subtracted</em>, so the points make a different shape, a curve that
        opens upward. Its lowest point is at momentum 0, where the energy is the rest energy, 1: no observer can find less
        energy than that. Farther out, the curve climbs ever closer to a slanted straight line, the light's line, where E =
        momentum × c, but never reaches it, because that would take an observer moving at the speed of light.
      </>
    ) : (
      <>
        <strong>Why the readings sit on the yellow lines.</strong> The two straight lines are every point where E² − (momentum ×
        c)² equals 0: moving right, E = momentum × c, and moving left, E = minus the momentum × c. Every observer finds the same
        value of the combination for the pulse, zero, so every reading falls on one of these two lines, whichever speed the
        observer has. Your lab's point ({f(lab.momentumTimesC, 4)}, {f(lab.energy, 4)}) and the passing observer's point ({f(passing.momentumTimesC, 4)},{' '}
        {f(passing.energy, 4)}) are both on the right-moving line. Moving along the line changes how much energy and momentum
        the pulse has, but never the line itself.
      </>
    ),
  )

  if (isParticle) {
    paragraphs.push(
      <>
        <strong>A particle at rest has energy.</strong> If the momentum is zero, the invariant is just E multiplied by itself,
        so the energy is the mass: E = mc², the <em>rest energy</em>. A daily-life example: a hot cup of tea has heat energy
        inside it. By this rule, that energy counts toward its mass, by an amount far too small to weigh.
      </>,
    )
    paragraphs.push(
      <>
        <strong>Energy and the speed limit.</strong> The total energy is the rest energy divided by the time dilation factor
        from Experiment 3, so as the speed gets close to the speed of light, the factor goes toward zero and the energy grows
        without limit. Compare the extra energy from moving (the <em>kinetic energy</em>) with the everyday formula ½ × (speed)²,
        all in rest energies: the true value is {ratios.map(({ v, ratio }) => `${f(ratio, 2)} times it at ${v}c`).join(', ')}.
        Going from 0.99c to 0.999c needs the kinetic energy to rise from {f(keAt99, 2)} to {f(keAt999, 1)} rest energies, more
        than three times as much, for a speed gain of less than 1 percent. A daily-life comparison: a hill that keeps getting
        steeper the higher you climb, so that the last metres cost more than all the rest put together.
      </>,
    )
  } else {
    paragraphs.push(
      <>
        <strong>Light.</strong> A light pulse has E = momentum × c, so its invariant is zero, and every observer finds it moving
        at speed 1. No observer can ride along with it, because there is no observer for whom its momentum is zero. Its energy
        does differ between observers, by the factor √((1 − u) ÷ (1 + u)), where u is the observer's speed along the light.
        For example, at u = 0.6 the factor is √(0.4 ÷ 1.6) = {f(lightFactor, 2)}, so that passing observer finds half the lab's
        energy. A later experiment treats this shift as the Doppler effect.
      </>,
    )
  }

  if (isParticle) {
    paragraphs.push(
      <>
        <strong>Light.</strong> Try the light pulse next. It has E = momentum × c, so its invariant is zero: it has no mass.
        Every observer finds it moving at speed 1, and no observer can ride along with it. Its energy does differ between
        observers, by the factor √((1 − u) ÷ (1 + u)). For example, at u = 0.6 the factor is √(0.4 ÷ 1.6) ={' '}
        {f(lightFactor, 2)}, so that passing observer finds half the lab's energy. A later experiment treats this shift as the
        Doppler effect.
      </>,
    )
  }

  paragraphs.push(
    <>
      <strong>A remark about the word "mass".</strong> Many books say "mass increases with speed". That uses an older meaning of
      the word. In modern physics, and in this experiment, the mass is the invariant, and it does not change with speed. What
      grows with speed is the energy.
    </>,
  )

  if (isParticle) {
    paragraphs.push(
      <>
        <strong>How big is this in the real world.</strong> An electron's rest energy is 0.511 MeV and a proton's is about{' '}
        {f(PROTON_REST_ENERGY_MEV, 0)} MeV. A "MeV" is a unit of energy used for particles: one million electron-volts. At the
        Large Hadron Collider, protons were accelerated to 6.5 TeV (6.5 million million electron-volts), which is about{' '}
        {(Math.round(lhcRestEnergies / 100) * 100).toLocaleString('en-US')} times the proton's rest energy. Their speed is below the speed of light by about
        one part in {Math.round(1 / lhcDeficit / 1e7) * 10} million. And one kilogram is worth about{' '}
        {(kilogramJoules / 1e16).toFixed(0)} × 10¹⁶ joules as rest energy.
      </>,
    )
  }

  paragraphs.push(
    <>
      <strong>What was shown, and what was not.</strong> You saw one {isParticle ? 'particle' : 'light pulse'} at a time, along
      one line, with one passing observer. The formulas were not derived here; they are tested in particle accelerators. Forces,
      acceleration and collisions were not shown. A collision comes next.
    </>,
  )

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

      {tutorStep !== 'explained' && (
        <div>
          <p style={paragraphStyle}>
            {tutorStep === 'observe' &&
              'Look at the table and the pictures. How did the energy and the momentum differ between the observers? Was anything the same?'}
            {tutorStep === 'compare' &&
              `You predicted that ${predictionClauses[predicted]}. In this run, the lab found an energy of ${f(lab.energy)} and the passing observer ${f(passing.energy)}; the lab found a momentum × c of ${f(lab.momentumTimesC)} and the passing observer ${f(passing.momentumTimesC)}; and the last column reads ${f(lab.invariant)} for the lab and ${f(passing.invariant)} for the passing observer. Comparing your prediction with the table, what do you notice?`}
            {tutorStep === 'conceptual' &&
              (isParticle
                ? 'The particle’s own observer is riding along with the particle. Why do you think they measure zero momentum? And what is their energy, compared with the lab’s?'
                : 'There is no row in the table for an observer riding along with the light. What do you think would go wrong if there were one?')}
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
          {paragraphs.map((content, index) => (
            <p key={index} style={paragraphStyle}>
              <strong>{index + 1}.</strong> {content}
            </p>
          ))}
        </div>
      )}
    </div>
  )
}
