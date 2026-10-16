import { useState } from 'react'
import type { ReactNode } from 'react'
import { NEUTRAL_PION_REST_ENERGY_MEV, runDecay } from '../physics/makingNewParticles'

type Prediction = 'less' | 'same' | 'more'
type TutorStep = 'observe' | 'compare' | 'conceptual' | 'explained'

interface MakingNewParticlesDecayTutorProps {
  pieceMass: number
  passingSpeed: number
  predicted: Prediction
  // Called once, when the learner reaches the explanation (the last step), so the chapter summary can be shown.
  onExplained?: () => void
}

const predictionClauses: Record<Prediction, string> = {
  less: "the pieces' masses would add up to less than the parent's mass",
  same: "the pieces' masses would add up to the same as the parent's mass",
  more: "the pieces' masses would add up to more than the parent's mass",
}

const paragraphStyle = { marginBottom: '1rem', fontSize: '0.95rem', color: '#333', lineHeight: '1.6' } as const

// Real-world figures for the radioactive-decay paragraph (spec, "Real-World Facts Used, and Source Status"; the Q value was confirmed
// by search on 2026-10-15). The shares below are computed from the mass numbers, not typed in.
const URANIUM_238_ALPHA_Q_MEV = 4.27
const DAUGHTER_MASS_NUMBER = 234 // thorium-234
const ALPHA_MASS_NUMBER = 4 // helium-4
const PARENT_MASS_NUMBER = 238 // uranium-238
const ATOMIC_MASS_UNIT_MEV = 931.494

// Draft wording for the owner's review (CLAUDE.md §28.1). Follows the Part 2 tutor sequence in the specification: observe, compare
// with the prediction, one conceptual question, then the explanation and the limits. Every number below comes from the physics
// model (`makingNewParticles.ts`), never typed in by hand, except the real-world figures named above.
export function MakingNewParticlesDecayTutor({ pieceMass, passingSpeed, predicted, onExplained }: MakingNewParticlesDecayTutorProps) {
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

  const r = pieceMass
  const result = runDecay(r, passingSpeed)
  const f = (value: number, digits = 2) => value.toFixed(digits).replace('-', '−')
  const isLight = r === 0
  const atThreshold = result.allowed && Math.abs(r - 0.5) < 1e-9
  const pieces = isLight ? 'pulses of light' : 'pieces'
  const [lab1] = result.labPieces
  const [pass1, pass2] = result.passingPieces
  const alphaShare = DAUGHTER_MASS_NUMBER / (DAUGHTER_MASS_NUMBER + ALPHA_MASS_NUMBER)
  const massFraction = URANIUM_238_ALPHA_Q_MEV / (PARENT_MASS_NUMBER * ATOMIC_MASS_UNIT_MEV)

  const paragraphs: ReactNode[] = []

  // 1. What the ledger shows.
  paragraphs.push(
    result.allowed ? (
      <>
        <strong>What the ledger shows.</strong> The parent's mass was 1. The two {pieces} had rest masses of {f(r)} each, so the sum of
        their rest masses was 2 × {f(r)} = {f(result.sumOfRestMasses)}, and the mass given up was 1 − {f(result.sumOfRestMasses)} ={' '}
        {f(result.massGivenUp)}. Each piece had an energy of {f(lab1.reading.energy)} and moved at {f(Math.abs(lab1.reading.speed))}c
        {isLight ? ', the speed of light' : ''}. The system's mass of the {pieces} was {f(result.systemMassLab)} for the lab and{' '}
        {f(result.systemMassPassing)} for the passing observer, the same as the parent's mass.
      </>
    ) : (
      <>
        <strong>What the ledger shows.</strong> The parent's mass was 1. Two pieces with rest masses of {f(r)} each would have a sum of rest
        masses of 2 × {f(r)} = {f(result.sumOfRestMasses)}, more than the parent's 1. So no decay could happen, and the parent stayed as it
        was.
      </>
    ),
  )

  if (result.allowed) {
    // 2. Where the mass went.
    paragraphs.push(
      atThreshold ? (
        <>
          <strong>Where the mass went.</strong> Here the pieces' rest masses add up to exactly the parent's mass, so there is no mass to
          give up: {f(result.massGivenUp)}. Nothing is left over to become energy of motion, so the pieces just sit at rest. Each has an
          energy of {f(lab1.reading.energy)}, which is all rest energy.
        </>
      ) : (
        <>
          <strong>Where the mass went.</strong> It did not vanish. Energy changed form. Each piece has a total energy of{' '}
          {f(lab1.reading.energy)}, and{' '}
          {isLight
            ? 'a pulse of light has no rest energy, so all of it is energy of motion'
            : `its rest energy is ${f(r)}, so its energy of motion is ${f(lab1.reading.energy)} − ${f(r)} = ${f(lab1.reading.energy - r)}`}
          . Together the two pieces have {f(2 * (lab1.reading.energy - r))} of energy of motion, which is exactly the mass given up. Total
          energy was conserved the whole time: 1 before and 1 after, as the totals showed. Energy changed form, from the parent's rest
          energy to the pieces' rest energy and energy of motion.
        </>
      ),
    )

    // 3. Why equal pieces flying apart.
    paragraphs.push(
      <>
        <strong>Why equal pieces, flying apart.</strong> The parent was at rest, so the total momentum was zero. Two equal pieces with
        opposite momenta, {f(lab1.reading.momentumTimesC)} and {f(-lab1.reading.momentumTimesC)}, keep the total at zero. Daily-life
        example: two ice skaters standing still push off each other. They must move in opposite directions, so that the total "oomph" stays
        zero, just as it was before they pushed.
      </>,
    )
  }

  // 4. Why a particle cannot decay into heavier pieces.
  paragraphs.push(
    <>
      <strong>Why a particle cannot decay into heavier pieces.</strong> The system's mass cannot change in a decay, and it cannot be less
      than the pieces' rest masses added up.{' '}
      {result.allowed
        ? 'So the pieces’ masses can never add up to more than the parent’s.'
        : `With r = ${f(r)}, the pieces would weigh ${f(result.sumOfRestMasses)}, more than the parent's 1, so nothing happens.`}{' '}
      That is a threshold again, like the one in Part 1.{result.allowed ? ' Try r = 0.6 to see it.' : ''}
    </>,
  )

  // 5. Decay is making a particle backward.
  paragraphs.push(
    <>
      <strong>Decay is making a particle backward.</strong> At r = 0.5 the pieces just sit at rest. That is exactly the threshold case of
      Part 1, played in reverse: the least energy that could make two pieces of that mass is the energy of a parent of that mass at rest.
      The pair creation and annihilation in Experiment 5 are the same idea.
    </>,
  )

  if (result.allowed) {
    // 6. The passing observer.
    paragraphs.push(
      <>
        <strong>The passing observer.</strong> The observer moving at {passingSpeed > 0 ? '+' : '−'}
        {Math.abs(passingSpeed)}c finds different energies and momenta for the {pieces}: energies of {f(pass1.reading.energy, 3)} and{' '}
        {f(pass2.reading.energy, 3)}, instead of {f(lab1.reading.energy, 3)} each. But the system's mass of the {pieces} is{' '}
        {f(result.systemMassPassing)} for them too, the parent's mass. Observers disagree about energy and momentum, and agree about the
        system's mass.
      </>,
    )
  }

  // 7. A real example: the neutral pion.
  paragraphs.push(
    <>
      <strong>A real example.</strong> A neutral pion at rest, which has a mass of {f(NEUTRAL_PION_REST_ENERGY_MEV, 1)} MeV, decays most
      often into two pulses of light. In the pion's own frame, each carries {f(NEUTRAL_PION_REST_ENERGY_MEV / 2, 1)} MeV. That is the case r
      = 0 in this experiment.
    </>,
  )

  // 8. A second real example: radioactive decay.
  paragraphs.push(
    <>
      <strong>A second real example: radioactive decay.</strong> When a nucleus of uranium-238 decays, it turns into a nucleus of
      thorium-234 and an alpha particle, which is a helium nucleus. The two pieces weigh slightly less than the uranium nucleus did: about{' '}
      {f(massFraction * 100000, 0)} parts in 100,000 less. The energy that went with that small mass difference now shows up as the pieces' energy of motion, about{' '}
      {f(URANIUM_238_ALPHA_Q_MEV)} million electron-volts (MeV). This is the same idea as the mass given up in this experiment. As the
      pieces slow down in the rock around them, their energy of motion becomes heat. Heat from the decay of uranium, thorium and potassium
      inside the Earth supplies about half of the heat the Earth gives off. <em>A difference from our model:</em> here the two pieces are
      not equal. The alpha particle is much lighter than the thorium nucleus, so it gets about {f(alphaShare * 100, 0)} percent of the
      energy of motion ({f(alphaShare * URANIUM_238_ALPHA_Q_MEV)} of the {f(URANIUM_238_ALPHA_Q_MEV)} MeV), and the thorium nucleus drifts
      away slowly. Our experiment used two equal pieces, which is the simplest case that conservation of energy and momentum settles
      completely. Some radioactive decays, such as beta decay, produce three pieces, which the experiment did not show.
    </>,
  )

  // 9. A remark on "will".
  paragraphs.push(
    <>
      <strong>A remark on "will".</strong> The experiment shows only what is allowed. When a particle decays, and how often, is a matter of
      probability and is not modeled.
    </>,
  )

  // 10. What was shown, and what was not.
  paragraphs.push(
    <>
      <strong>What was shown, and what was not.</strong> You saw a parent decay into two equal pieces, along one line. Unequal pieces, more
      than two pieces, and the timing of a decay were not shown. The formulas were used, not derived.
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
      <h2 style={{ marginTop: 0, marginBottom: '1rem', fontSize: '1.125rem', color: '#0066cc' }}>Let's reflect on what you observed</h2>

      {tutorStep !== 'explained' && (
        <div>
          <p style={paragraphStyle}>
            {tutorStep === 'observe' &&
              'Look at the ledger. What happened to the sum of the masses of the pieces, and to the mass of the whole system? What do you notice?'}
            {tutorStep === 'compare' &&
              `You predicted that ${predictionClauses[predicted]}. In this run, the parent's mass was 1 and the pieces' rest masses added up to ${f(result.sumOfRestMasses)}. Comparing your prediction with the results, what do you notice?`}
            {tutorStep === 'conceptual' &&
              (result.allowed && !atThreshold
                ? 'The pieces weigh less than the parent in total. Where did the missing mass go, and why do the pieces fly apart?'
                : result.allowed
                  ? 'The pieces just sit at rest, and no mass was given up. What does that tell you about where the energy of a decay comes from?'
                  : 'No decay happened. Why can a particle not turn into pieces that weigh more than it does?')}
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
