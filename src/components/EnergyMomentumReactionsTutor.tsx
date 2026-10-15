import { useState } from 'react'
import type { ReactNode } from 'react'
import { ELECTRON_REST_ENERGY_MEV, PAIR_CREATION_THRESHOLD, runReactionExperiment, totalsOf } from '../physics/energyMomentum'
import type { ReactionKind } from '../physics/energyMomentum'

type Prediction = 'less' | 'same' | 'more'
type TutorStep = 'observe' | 'compare' | 'conceptual' | 'explained'

interface EnergyMomentumReactionsTutorProps {
  kind: ReactionKind
  setting: number
  passingSpeed: number
  predicted: Prediction
  // Called once, when the learner reaches the explanation (the last step).
  onExplained?: () => void
}

const predictionClauses: Record<Prediction, string> = {
  less: 'the total mass after would be less than before',
  same: 'the total mass would be the same',
  more: 'the total mass after would be more than before',
}

const paragraphStyle = { marginBottom: '1rem', fontSize: '0.95rem', color: '#333', lineHeight: '1.6' } as const

// Draft wording for the owner's review (CLAUDE.md §28.1). Follows the Part 3 tutor sequence in the specification: observe,
// compare with the prediction, one conceptual question, then the explanation and the limits. Every number below comes from the
// physics model, never typed in by hand, except the real-world facts the specification lists (the Sun's figures), which are stated
// as facts. The explanation paragraphs that belong to one process are shown only for that process.
export function EnergyMomentumReactionsTutor({ kind, setting, passingSpeed, predicted, onExplained }: EnergyMomentumReactionsTutorProps) {
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

  const result = runReactionExperiment(kind, setting, passingSpeed)
  const f = (value: number, digits = 3) => value.toFixed(digits).replace(/^-(0\.0+)$/, '$1').replace('-', '−')
  const inMeV = kind === 'helium-binding'
  const unit = inMeV ? 'MeV' : 'rest energies'
  const labBefore = totalsOf(result.labBefore.map((p) => p.reading))
  const labAfter = totalsOf(result.labAfter.map((p) => p.reading))
  const passingBefore = totalsOf(result.passingBefore.map((p) => p.reading))
  const passingAfter = totalsOf(result.passingAfter.map((p) => p.reading))
  const sumChange =
    result.sumOfRestMassesAfter < result.sumOfRestMassesBefore - 5e-10
      ? 'went down'
      : result.sumOfRestMassesAfter > result.sumOfRestMassesBefore + 5e-10
        ? 'went up'
        : 'stayed the same'
  const noPair = kind === 'pair-creation' && !result.created

  const paragraphs: ReactNode[] = []

  // 1. What the ledger shows, in the learner's own numbers.
  paragraphs.push(
    <>
      <strong>What the ledger shows.</strong> In your run, the lab found a total energy of {f(labBefore.energy)} {unit} and a total
      momentum × c of {f(labBefore.momentumTimesC)} before, and {f(labAfter.energy)} and {f(labAfter.momentumTimesC)} after. The
      passing observer, who moved at {passingSpeed > 0 ? '+' : '−'}
      {Math.abs(passingSpeed)}c, found different numbers, {f(passingBefore.energy)} and {f(passingBefore.momentumTimesC)} before and{' '}
      {f(passingAfter.energy)} and {f(passingAfter.momentumTimesC)} after, but for each observer the totals did not change. The sum
      of the rest masses of the pieces {sumChange}: {f(result.sumOfRestMassesBefore)} before and {f(result.sumOfRestMassesAfter)}{' '}
      after, in {unit}. The mass of the whole system, worked out from the total energy and the total momentum, was{' '}
      {f(result.systemMassBefore)} before and {f(result.systemMassAfter)} after.
    </>,
  )

  if (kind === 'annihilation') {
    const photonEnergy = result.labAfter[0].reading.energy
    paragraphs.push(
      <>
        <strong>Why two lights, not one.</strong> After the particle and its antiparticle meet, the total momentum in the lab is{' '}
        {f(labBefore.momentumTimesC)}. A single pulse of light always carries momentum, so one pulse cannot be all there is. Two
        pulses of equal energy going opposite ways have a total momentum of zero, so they can. Daily-life example: two ice skaters
        standing still, who push off each other. They must move in opposite directions, so that the total "oomph" stays zero, just as
        it was before they pushed.
      </>,
      <>
        <strong>A system of lights has mass.</strong> Each pulse of light has no mass. But the two together have a total energy of{' '}
        {f(labAfter.energy)} and a total momentum of {f(labAfter.momentumTimesC)}, so as a system their mass is √(
        {f(labAfter.energy)}² − {f(labAfter.momentumTimesC)}²) = {f(result.systemMassAfter)} {unit}, the same as the particle and
        its antiparticle had. The mass of the whole system never changed. What changed is that it is now carried by light. The two
        pulses have an energy of {f(photonEnergy)} {unit} each: all the rest energy of the particle and its antiparticle, and all
        their energy of motion, has gone into light.
      </>,
      <>
        <strong>PET scans.</strong> In a PET scan, a medical imaging technique, a positron from a tracer meets an electron in the
        body, and they turn into two light pulses of 511 keV each, going in almost exactly opposite directions. The two detectors
        that catch them mark a line, and that is how the scan locates the tracer. 511 keV is the rest energy of the electron (
        {ELECTRON_REST_ENERGY_MEV} MeV), which is what each pulse carries when the particle and its antiparticle start at rest, the
        "At rest" setting.
      </>,
    )
  }

  if (kind === 'pair-creation') {
    const pair = result.labAfter[0]
    paragraphs.push(
      <>
        <strong>Light makes matter, but only above a threshold.</strong> A particle and its antiparticle each have a rest mass of 1,
        so a pair needs a system mass of at least {f(2 * PAIR_CREATION_THRESHOLD)} {unit}. The system's mass is fixed by the beams:
        each beam had {f(setting)}, so the system's mass was {f(result.systemMassBefore)}, and it cannot change.{' '}
        {noPair ? (
          <>
            That is less than {f(2 * PAIR_CREATION_THRESHOLD)}, so no pair can be made, and nothing happened. The beams passed through
            each other. Daily-life example: to get over a 1-meter wall you have to jump at least high enough to reach the top. With
            less, nothing happens at all.
          </>
        ) : setting === PAIR_CREATION_THRESHOLD ? (
          <>
            That is exactly {f(2 * PAIR_CREATION_THRESHOLD)}, enough for a pair at rest and no more, so the pair was made at rest.
          </>
        ) : (
          <>
            That is more than {f(2 * PAIR_CREATION_THRESHOLD)}, so a pair could be made. The extra went into the motion of the pair:
            each particle had an energy of {f(pair.reading.energy)}, of which 1 is its rest energy, so each moved at{' '}
            {f(Math.abs(pair.reading.speed))}c, from v = √(1 − 1 ÷ E²) = √(1 − 1 ÷ {f(pair.reading.energy)}²).
          </>
        )}
      </>,
      <>
        <strong>A note about real life.</strong> In real life, a single pulse of light cannot make a pair in empty space: the pair would
        have mass, but one pulse has none, and the momentum cannot balance. The pair needs a nearby nucleus to take up the recoil, or
        a second pulse to meet it. The experiment used two pulses, so nothing else was needed.
      </>,
    )
  }

  if (kind === 'helium-binding') {
    paragraphs.push(
      <>
        <strong>A helium nucleus is lighter than its parts.</strong> Two protons and two neutrons weigh{' '}
        {f(result.sumOfRestMassesBefore)} MeV/c² apart, and the helium-4 nucleus weighs {f(result.sumOfRestMassesAfter)} MeV/c²
        together, a difference of {f(result.energyReleased)} MeV/c², which is {f((result.energyReleased / result.sumOfRestMassesBefore) * 100)}{' '}
        percent of the mass of the parts. When they bind, {f(result.energyReleased, 1)} MeV of energy leaves, as light and fast
        particles. That is the <em>binding energy</em>. Daily-life comparison: a ball dropped into a pit gives up energy as it falls,
        and it takes that same energy to lift it out again.
      </>,
      <>
        <strong>The Sun.</strong> The same idea works on a large scale. The Sun fuses hydrogen into helium, and about 0.7 percent of
        the mass of the hydrogen is released as energy: about 4 million tonnes of mass every second, out of about 600 million tonnes of
        hydrogen fused. That is why the Sun shines.
      </>,
    )
  }

  // Where the energy went, or came from: the answer to the conceptual question.
  paragraphs.push(
    <>
      <strong>Where the energy went, or came from.</strong>{' '}
      {kind === 'annihilation' &&
        'The rest energy of the particle and its antiparticle, and their energy of motion, became the energy of light. Total energy was conserved the whole time. What changed was the form it was in, and so the sum of the rest masses.'}
      {kind === 'pair-creation' &&
        (noPair
          ? 'Nothing was exchanged, because the light did not have enough energy to supply the rest energy of a pair. The total energy and the sum of the rest masses stayed as they were.'
          : 'The energy of the light became the rest energy of the pair, and any extra became their energy of motion. Total energy was conserved the whole time. What changed was the form it was in, and so the sum of the rest masses.')}
      {kind === 'helium-binding' &&
        `The parts gave up ${f(result.energyReleased, 1)} MeV when they bound together, and it left as light and fast particles. Total energy was conserved the whole time. What changed was the form it was in, and so the sum of the rest masses.`}
    </>,
  )

  // A pointer to the other two processes, because each run explains only its own.
  const others: Record<ReactionKind, string> = {
    annihilation:
      'In "Two beams of light meet", light makes a particle and its antiparticle, if it has enough energy. In "A helium nucleus forms", a real nucleus gives up energy when it binds.',
    'pair-creation':
      'In "A particle and its antiparticle meet", matter turns into light. In "A helium nucleus forms", a real nucleus gives up energy when it binds.',
    'helium-binding':
      'In "A particle and its antiparticle meet", matter turns into light. In "Two beams of light meet", light makes a particle and its antiparticle, if it has enough energy.',
  }
  paragraphs.push(
    <>
      <strong>Try the other two processes.</strong> This explanation covered only the process you ran. {others[kind]} Each shows a
      different side of the same idea. Choose another process above and press Run to see it.
    </>,
  )

  paragraphs.push(
    <>
      <strong>What was shown, and what was not.</strong> You saw one kind of reaction at a time, along one line.{' '}
      {kind === 'helium-binding' && 'The helium nucleus was shown as an energy accounting only, not as a process. '}Electric charge,
      neutrinos, and the force that holds a nucleus together were not shown. The rule that the total energy and the total momentum are
      conserved was used as a rule of the experiment, not derived here.
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
              "Look at the mass ledger and the results. What happened to the sum of the masses of the pieces? What happened to the mass of the whole system?"}
            {tutorStep === 'compare' &&
              `You predicted that ${predictionClauses[predicted]}. In this run, the sum of the rest masses went from ${f(result.sumOfRestMassesBefore)} to ${f(result.sumOfRestMassesAfter)} ${unit}, and the system's mass went from ${f(result.systemMassBefore)} to ${f(result.systemMassAfter)}. Comparing your prediction with the results, what do you notice?`}
            {tutorStep === 'conceptual' &&
              (noPair
                ? 'Energy and momentum are conserved here, and nothing was made. The light had energy, so why was that not enough to make a pair?'
                : 'Energy and momentum are conserved here. Where did the energy go (or where did it come from) when the sum of the masses changed?')}
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
