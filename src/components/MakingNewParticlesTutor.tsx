import { useState } from 'react'
import type { ReactNode } from 'react'
import {
  LHC_BEAM_ENERGY_GEV,
  NEUTRAL_PION_REST_ENERGY_MEV,
  PROTON_REST_ENERGY_MEV,
  runMakingExperiment,
  stationaryTargetBeamEnergyFor,
  stationaryTargetSystemMass,
  thresholdKineticEnergy,
} from '../physics/makingNewParticles'

type Prediction = 'setup-a' | 'same' | 'setup-b'
type TutorStep = 'observe' | 'compare' | 'conceptual' | 'explained'

interface MakingNewParticlesTutorProps {
  energyOfMotion: number
  newMass: number
  predicted: Prediction
  // Called once, when the learner reaches the explanation (the last step), so the next part can be shown.
  onExplained?: () => void
}

const predictionClauses: Record<Prediction, string> = {
  'setup-a': 'Setup A, the stationary target, would leave more usable energy',
  same: 'the two setups would leave the same usable energy',
  'setup-b': 'Setup B, the head-on beams, would leave more usable energy',
}

const paragraphStyle = { marginBottom: '1rem', fontSize: '0.95rem', color: '#333', lineHeight: '1.6' } as const

// Draft wording for the owner's review (CLAUDE.md §28.1). Follows the Part 1 tutor sequence in the specification: observe, compare
// with the prediction, one conceptual question, then the explanation and the limits. Every number below comes from the physics
// model (`makingNewParticles.ts`), never typed in by hand; the real-world figures are the named constants and the model's formulas.
export function MakingNewParticlesTutor({ energyOfMotion, newMass, predicted, onExplained }: MakingNewParticlesTutorProps) {
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

  const K = energyOfMotion
  const result = runMakingExperiment(K, newMass)
  const A = result.stationaryTarget
  const B = result.headOn
  const f = (value: number, digits = 2) => value.toFixed(digits).replace('-', '−')
  // A rough size, to two significant figures with thousands separators, such as 90,000.
  const rough = (value: number) => Number(value.toPrecision(2)).toLocaleString('en-US')

  // Real-world figures (spec, "Real-World Facts Used"): the neutral pion from two protons, and the Large Hadron Collider.
  const pionMass = NEUTRAL_PION_REST_ENERGY_MEV / PROTON_REST_ENERGY_MEV // in proton masses
  const pionHeadOnMeV = thresholdKineticEnergy('head-on', pionMass) * PROTON_REST_ENERGY_MEV
  const pionTargetMeV = thresholdKineticEnergy('stationary-target', pionMass) * PROTON_REST_ENERGY_MEV
  const protonGeV = PROTON_REST_ENERGY_MEV / 1000
  const lhcCollisionGeV = 2 * LHC_BEAM_ENERGY_GEV
  const lhcTargetMassGeV = stationaryTargetSystemMass(LHC_BEAM_ENERGY_GEV, protonGeV)
  const lhcTargetBeamGeV = stationaryTargetBeamEnergyFor(lhcCollisionGeV, protonGeV)

  const paragraphs: ReactNode[] = []

  paragraphs.push(
    <>
      <strong>What the results show.</strong> You supplied K = {K} in both setups. In Setup A, the stationary target, the system's mass was
      M = {f(A.systemMass)}, so the usable energy was {f(A.systemMass)} − 2 = {f(A.usable)}, and the locked-in energy was {K} −{' '}
      {f(A.usable)} = {f(A.lockedIn)}, which is {f(A.lockedShare * 100, 1)} percent of K. In Setup B, the head-on beams, the system's mass
      was M = {f(B.systemMass)}, so the usable energy was {f(B.usable)}, all of K, and nothing was locked in.
    </>,
  )

  paragraphs.push(
    <>
      <strong>Why part of the energy is locked in.</strong> Momentum is conserved. The beam particle in Setup A brought momentum with it, so
      the system as a whole must still have that momentum afterward, and so it must keep moving. In the lab it keeps moving at{' '}
      {f(A.ownObserverSpeed)}c. The energy of that motion is the total energy minus the system's mass, {f(A.totalEnergy)} −{' '}
      {f(A.systemMass)} = {f(A.lockedIn)}. It is real energy of motion, but it is the motion of the whole system, and it cannot become the
      mass of new particles. In Setup B the two momenta cancel, the total is zero, the system stays at rest, and nothing is tied up this
      way.
    </>,
  )

  paragraphs.push(
    <>
      <strong>A daily-life example.</strong> Two identical cars meet head-on at equal speeds, and they stop. All of their energy of motion
      goes into crumpling the metal. Now a moving car hits an identical parked car, and the wreck keeps sliding along. Some of the energy of
      motion is still motion afterward, so less is left to crumple. The cars are Setup B and Setup A. "Crumpling the metal" is what making a
      new particle needs: energy that is free to be used, not tied up in the motion of the wreck.
    </>,
  )

  paragraphs.push(
    <>
      <strong>The same collision, seen by two observers.</strong> The system's own observer travels along with the system at{' '}
      {f(A.ownObserverSpeed)}c. For them the total momentum is zero, and they see Setup A as a head-on collision, with the two particles
      approaching at {f(Math.abs(A.ownPieces[0].speed))}c each. The energy of motion they find is only {f(A.usable)}, the usable part, not
      the {K} the lab supplied. The lab and the system's own observer find different energies and momenta, but both find the same system's
      mass, {f(A.systemMass)}. That is why the usable energy is the system's mass minus 2: it is the energy of motion in the frame where
      nothing is left over for the whole system's motion.
    </>,
  )

  paragraphs.push(
    <>
      <strong>The threshold for your new particle.</strong> You chose X = {newMass}. A new particle can be made only if M ≥ 2 + X, which is
      M ≥ {f(2 + newMass)}. With head-on beams, M = 2 + K, so this needs K ≥ {f(result.headOnThreshold)}. With a stationary target, M = √(4
      + 2K), and the same condition needs K ≥ 2X + X²/2 = {f(result.stationaryTargetThreshold)}. The extra, X²/2 ={' '}
      {f((newMass * newMass) / 2)}, grows as the square of X, so heavier particles are much harder to make by hitting a stationary target.
      With K = {K}, Setup A {result.stationaryTargetCanMake ? 'can' : 'cannot'} make it and Setup B{' '}
      {result.headOnCanMake ? 'can' : 'cannot'}.
    </>,
  )

  paragraphs.push(
    <>
      <strong>How big is this in the real world?</strong> To make a neutral pion (mass {f(NEUTRAL_PION_REST_ENERGY_MEV, 1)} MeV) from two
      protons, two head-on beams need a total energy of motion of {f(pionHeadOnMeV, 0)} MeV, while a proton beam on a stationary proton
      needs {f(pionTargetMeV, 0)} MeV, more than twice as much. At the Large Hadron Collider, two {f(LHC_BEAM_ENERGY_GEV / 1000, 1)} TeV
      beams meeting head-on give a system's mass of {f(lhcCollisionGeV / 1000, 0)} TeV. A {f(LHC_BEAM_ENERGY_GEV / 1000, 1)} TeV proton
      hitting a stationary proton would give only {f(lhcTargetMassGeV, 0)} GeV. To match {f(lhcCollisionGeV / 1000, 0)} TeV with a
      stationary target, the beam would need about {rough(lhcTargetBeamGeV / 1000)} TeV, about{' '}
      {rough(lhcTargetBeamGeV / LHC_BEAM_ENERGY_GEV)} times more. That is why the Large Hadron Collider is a collider.
    </>,
  )

  paragraphs.push(
    <>
      <strong>A remark on "allowed".</strong> The experiment says only whether energy and momentum permit the reaction. Real reactions also
      obey other rules, such as the conservation of electric charge, and they happen with some probability. So a reaction that is allowed
      does not always happen.
    </>,
  )

  paragraphs.push(
    <>
      <strong>What was shown, and what was not.</strong> You saw two identical particles along one line, and a neutral new particle. How the
      leftover energy is shared among the pieces when K is above the threshold was not shown, because energy and momentum alone do not fix
      it. The formulas were used, not derived.
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
              "Look at the tables and the bars. Compare the system's mass for the two setups, and how much of the energy supplied was usable in each. What do you notice?"}
            {tutorStep === 'compare' &&
              `You predicted that ${predictionClauses[predicted]}. In this run, the usable energy was ${f(A.usable)} in Setup A and ${f(B.usable)} in Setup B. Comparing your prediction with the results, what do you notice?`}
            {tutorStep === 'conceptual' &&
              'In the stationary-target collision, the whole system keeps moving after the collision. What does that tell you about the energy of motion, and why is the head-on collision different?'}
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
