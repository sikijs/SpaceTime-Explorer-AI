import { useState } from 'react'
import type { ReactNode } from 'react'
import {
  NEUTRAL_PION_REST_ENERGY_MEV,
  realDecayMassAnswerFor,
  realPassingObserverMassAnswerFor,
  runDecay,
} from '../physics/makingNewParticles'
import type { PassingObserverMassGuess } from '../physics/makingNewParticles'
import { MakingNewParticlesDecayTutorLinks } from './MakingNewParticlesDecayIntro'

type Prediction = 'less' | 'same' | 'more'
type TutorStep = 'observe' | 'compare' | 'conceptual' | 'explained'

interface MakingNewParticlesDecayTutorProps {
  pieceMass: number
  passingSpeed: number
  predicted: Prediction
  // The second guess: is the system's mass the passing observer finds the same as the lab's?
  passingPredicted: PassingObserverMassGuess
  // Called once, when the learner reaches the explanation (the last step), so the chapter summary can be shown.
  onExplained?: () => void
}

const predictionClauses: Record<Prediction, string> = {
  less: "the pieces' masses would add up to less than the parent's mass",
  same: "the pieces' masses would add up to the same as the parent's mass",
  more: "the pieces' masses would add up to more than the parent's mass",
}

const paragraphStyle = { marginBottom: '1rem', fontSize: '0.95rem', color: '#333', lineHeight: '1.6' } as const

// Real-world figures, from pages read on 2026-11-23 (docs/audit/spacetime-geometry/06-draft-wording-section-b.md, section 7). The pion's figures are from the Particle Data Group
// listing (read through a summary; to be checked by eye). Uranium-238's are from the NNDC evaluation of Browne and Tuli (2007). The shares below are computed here, not typed in.
const PION_MEAN_LIFE_SECONDS_TEXT = '8.43 × 10⁻¹⁷'
const PION_TWO_PHOTON_PERCENT = 98.823
const URANIUM_238_ALPHA_Q_MEV = 4.2697
const URANIUM_238_MAIN_ALPHA_MEV = 4.198 // 79 percent of the decays; a second group has 4.151 MeV (21 percent)
const URANIUM_238_HALF_LIFE_YEARS_TEXT = '4.468 billion'
const PARENT_MASS_NUMBER = 238 // uranium-238
const ATOMIC_MASS_UNIT_MEV = 931.494

// Draft wording for the owner's review (CLAUDE.md §28.1). Follows the Part 2 tutor sequence in the specification: observe, compare
// with the prediction, one conceptual question, then the explanation and the limits. Every number below comes from the physics
// model (`makingNewParticles.ts`), never typed in by hand, except the real-world figures named above.
export function MakingNewParticlesDecayTutor({ pieceMass, passingSpeed, predicted, passingPredicted, onExplained }: MakingNewParticlesDecayTutorProps) {
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
  const alphaShare = URANIUM_238_MAIN_ALPHA_MEV / URANIUM_238_ALPHA_Q_MEV
  const massFraction = URANIUM_238_ALPHA_Q_MEV / (PARENT_MASS_NUMBER * ATOMIC_MASS_UNIT_MEV)


  // The tutor marks both guesses here, in the explanation, and nowhere earlier (the pictures only show them). The real answers are read from the physics module.
  const realMass = realDecayMassAnswerFor(result)
  const guess1Letter = { less: '(a)', same: '(b)', more: '(c)' }[predicted]
  const guess1Reason = `the parent's mass was 1 and the pieces' rest masses added up to ${f(result.sumOfRestMasses)}`
  const guess1Mark =
    predicted === realMass
      ? `Your first guess was ${guess1Letter}, and it was right: ${guess1Reason}.`
      : `Your first guess was ${guess1Letter}, and it was not this time: ${guess1Reason}.`
  const realPassing = realPassingObserverMassAnswerFor(result)
  const guess2Letter = { same: '(a)', different: '(b)' }[passingPredicted]
  const guess2Reason =
    realPassing === 'same'
      ? `the passing observer found a system's mass of ${f(result.systemMassPassing, 3)}, the same as the ${f(result.systemMassLab, 3)} the lab found`
      : `the passing observer found ${f(result.systemMassPassing, 3)}, not the same as the ${f(result.systemMassLab, 3)} the lab found`
  const guess2Mark =
    passingPredicted === realPassing
      ? `Your second guess was ${guess2Letter}, and it was right: ${guess2Reason}.`
      : `Your second guess was ${guess2Letter}, and it was not this time: ${guess2Reason}.`

  const paragraphs: ReactNode[] = []

  // 1. What the ledger shows.
  paragraphs.push(
    result.allowed ? (
      <>
        <strong>What the ledger shows.</strong> {guess1Mark} The white tick on the grey bar showed the answer you chose. The parent's mass was 1. The two {pieces} had rest masses of {f(r)} each, so the sum of
        their rest masses was 2 × {f(r)} = {f(result.sumOfRestMasses)}, and the mass given up was 1 − {f(result.sumOfRestMasses)} ={' '}
        {f(result.massGivenUp)}. Each piece had an energy of {f(lab1.reading.energy)} and moved at {f(Math.abs(lab1.reading.speed))}c
        {isLight ? ', the speed of light' : ''}. The system's mass of the {pieces} was {f(result.systemMassLab)} for the lab and{' '}
        {f(result.systemMassPassing)} for the passing observer, the same as the parent's mass. {guess2Mark} The white tick on the purple bar showed the answer you chose.
      </>
    ) : (
      <>
        <strong>What the ledger shows.</strong> {guess1Mark} The parent's mass was 1. Two pieces with rest masses of {f(r)} each would have a sum of rest
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
      That is a threshold again, like the one in Section A.{result.allowed ? ' Try r = 0.6 to see it.' : ''}
    </>,
  )

  // 5. Decay is making a particle backward.
  paragraphs.push(
    <>
      <strong>Decay is making a particle backward.</strong> At r = 0.5 the pieces just sit at rest. That is exactly the threshold case of
      Section A, played in reverse: the least energy that could make two pieces of that mass is the energy of a parent of that mass at rest.
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
      <strong>A real example: the neutral pion.</strong> The Particle Data Group lists the neutral pion's mass as {f(NEUTRAL_PION_REST_ENERGY_MEV, 4)} MeV and its mean life as about{' '}
      {PION_MEAN_LIFE_SECONDS_TEXT} seconds, and says it decays into two photons (pulses of light) {PION_TWO_PHOTON_PERCENT} percent of the time. In the pion's own frame, each photon carries half
      the pion's rest energy, {f(NEUTRAL_PION_REST_ENERGY_MEV / 2)} MeV (computed here). That is the case r = 0 in this experiment: no rest mass in the pieces, and all the mass given up. (The
      Particle Data Group listing was read through a summary on 23 November 2026.)
    </>,
  )

  // 8. A second real example: radioactive decay.
  paragraphs.push(
    <>
      <strong>A second real example: uranium-238.</strong> A nucleus of uranium-238 decays into a nucleus of thorium-234 and an alpha particle, which is two protons and two neutrons (a helium
      nucleus is the same thing; that line is general physics, not a line on the pages read). The evaluated nuclear data (Browne and Tuli, 2007, on the NNDC site) give a decay energy of{' '}
      {f(URANIUM_238_ALPHA_Q_MEV, 4)} MeV and a half-life of {URANIUM_238_HALF_LIFE_YEARS_TEXT} years. In 79 percent of the decays the alpha particle has {f(URANIUM_238_MAIN_ALPHA_MEV, 3)} MeV of energy of
      motion, and in 21 percent it has 4.151 MeV. {f(URANIUM_238_MAIN_ALPHA_MEV, 3)} ÷ {f(URANIUM_238_ALPHA_Q_MEV, 4)} is about {f(alphaShare * 100, 0)} percent (computed here): the alpha particle
      carries almost all the energy of motion because it is far lighter than the thorium nucleus, which drifts away slowly. The mass given up is about {f(massFraction * 100000, 0)} parts in 100,000 of
      the uranium nucleus's rest energy (computed here: {f(URANIUM_238_ALPHA_Q_MEV)} ÷ ({PARENT_MASS_NUMBER} × {f(ATOMIC_MASS_UNIT_MEV, 1)})). <em>A difference from our model:</em> here the two
      pieces are not equal, and our experiment used two equal pieces, which is the simplest case that conservation of energy and momentum settles completely. Some radioactive decays, such as beta
      decay, produce three pieces, which the experiment did not show.
    </>,
  )

  // 8b. The Earth's heat.
  paragraphs.push(
    <>
      <strong>Where the energy goes: heat inside the Earth.</strong> As the pieces slow down in the rock around them, their energy of motion becomes heat (general physics; no plain official page on
      this was found and read). The Earth gives off about 47 trillion watts in total (47 ± 2 TW; Davies and Davies, 2010). How much of that comes from the radioactive decay of uranium, thorium and
      potassium is estimated, not measured directly, and the estimates differ. The Borexino experiment, which measures the neutrinos these decays give off, gives about 38 TW (+14, −13), with an
      assumption for the potassium part and a tension of about 2.4 standard deviations with the lowest of the Earth models. The paper says its estimate depends on the models used. So the share is large, but how large is still
      being worked out.
    </>,
  )

  // 9. A remark on "will".
  paragraphs.push(
    <>
      <strong>A remark on "will".</strong> The experiment shows only what is allowed. When a particle decays, and how often, is a matter of
      probability and is not modeled. Each particle decays at a random moment, and only a half-life, the time for about half of a large number of identical particles to decay, can be given.
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
              'Look at the mass ledger. How long is the grey bar compared with the parent’s bar? And what do the sky-blue and purple bars show? What do you notice?'}
            {tutorStep === 'compare' &&
              `You predicted that ${predictionClauses[predicted]}. Look at the white tick on the grey bar. In this run, the parent's mass was 1 and the pieces' rest masses added up to ${f(result.sumOfRestMasses)}. How does your guess compare? Then look at the white tick on the purple bar. You predicted that the passing observer would find ${passingPredicted === 'same' ? 'the same' : 'a different'} system's mass from the lab. How does that compare with the sky-blue and purple bars?`}
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
          <MakingNewParticlesDecayTutorLinks />
        </div>
      )}
    </div>
  )
}
