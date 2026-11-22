import { useState } from 'react'
import type { ReactNode } from 'react'
import {
  CODATA_ELECTRON_MEV,
  PAIR_CREATION_THRESHOLD,
  SOLAR_LUMINOSITY_WATTS,
  SPEED_OF_LIGHT_METERS_PER_SECOND,
  SUN_HYDROGEN_FUSED_KG_PER_SECOND,
  heliumCheckUp,
  realReactionAnswerFor,
  runReactionExperiment,
  sunMassLossFraction,
  totalsOf,
} from '../physics/energyMomentum'
import type { ReactionGuess, ReactionKind } from '../physics/energyMomentum'

type Prediction = ReactionGuess
type TutorStep = 'observe' | 'compare' | 'conceptual' | 'explained'

interface ExtraRun {
  kind: ReactionKind
  setting: number
  passingSpeed: number
}

interface EnergyMomentumReactionsTutorProps {
  // Part 1's fixed run (a particle and its antiparticle at 0.6c, a passing observer at +0.3c).
  kind: ReactionKind
  setting: number
  passingSpeed: number
  predicted: Prediction
  // The runs the learner has finished in Part 2, by process: the paragraphs about light and helium appear once they have been run.
  extraRuns?: Partial<Record<'pair-creation' | 'helium-binding', ExtraRun>>
  // Called once, when the learner reaches the explanation (the last step).
  onExplained?: () => void
}

const predictionClauses: Record<Prediction, string> = {
  less: 'the total mass after would be less than before',
  same: 'the total mass would be the same',
  more: 'the total mass after would be more than before',
}

const paragraphStyle = { marginBottom: '1rem', fontSize: '0.95rem', color: '#333', lineHeight: '1.6' } as const

// Draft wording for the owner's review (CLAUDE.md §28.1; docs/audit/spacetime-geometry/05-draft-wording-section-c.md, section 7). Follows the Section C tutor sequence in the
// specification: observe, compare with the prediction, one conceptual question, then the explanation and the limits. Every number below comes from the physics
// model, never typed in by hand, except the real-world facts the draft lists (NASA's 600 million tons of hydrogen a second; the 511 keV of a PET scan, which is the electron's
// rest energy from CODATA). The tutor marks the learner's guess in the explanation, and nowhere earlier. The paragraphs that belong to the light and helium processes are shown
// once the learner has run them in Part 2.
export function EnergyMomentumReactionsTutor({ kind, setting, passingSpeed, predicted, extraRuns = {}, onExplained }: EnergyMomentumReactionsTutorProps) {
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
  const paragraphs: ReactNode[] = []

  // 0. The tutor marks the learner's guess here, and nowhere earlier (the pictures only show it). The real answer is read from the physics module.
  const real = realReactionAnswerFor(result)
  const guessLetter = { less: '(a)', same: '(b)', more: '(c)' }[predicted]
  const realReason = `the sum of the rest masses went from ${f(result.sumOfRestMassesBefore)} to ${f(result.sumOfRestMassesAfter)} ${unit}`
  paragraphs.push(
    <>
      <strong>Your guess.</strong>{' '}
      {predicted === real
        ? `Your guess was ${guessLetter}, and it was right: ${realReason}.`
        : `Your guess was ${guessLetter}, and it was not this time: ${realReason}.`}{' '}
      The white tick on the mass ledger showed the answer you chose, and the grey and blue bars show what was found.
    </>,
  )

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
      {f(result.systemMassBefore)} before and {f(result.systemMassAfter)} after. The system's mass is not the sum of the pieces'
      masses: they are two different totals.
    </>,
  )

  // Part 1's process: a particle and its antiparticle meet.
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
      body. NIBIB (the US National Institutes of Health) describes the two annihilating and producing two gamma-ray photons that
      shoot off in opposite directions, and the scanner's detectors use them to make the image. Each photon carries the electron's
      rest energy when the particle and its antiparticle start at rest, the "At rest" setting here: 0.511 MeV, or 511 keV (CODATA
      2022 gives {CODATA_ELECTRON_MEV.toFixed(6)} MeV). NIBIB's page does not give the 511 keV figure. It comes from the electron's rest energy.
    </>,
    <>
      <strong>Where the energy went.</strong> The rest energy of the particle and its antiparticle, and their energy of motion, became
      the energy of light. Total energy was conserved the whole time. What changed was the form it was in, and so the sum of the rest
      masses.
    </>,
  )

  // The paragraphs of the processes the learner has run in Part 2.
  const light = extraRuns['pair-creation']
  if (light !== undefined) {
    const r = runReactionExperiment('pair-creation', light.setting, light.passingSpeed)
    const pair = r.labAfter[0]
    const noPair = !r.created
    paragraphs.push(
      <>
        <strong>Your run of two beams of light: light makes matter, but only above a threshold.</strong> A particle and its antiparticle
        each have a rest mass of 1, so a pair needs a system mass of at least {f(2 * PAIR_CREATION_THRESHOLD)} {unit}. The system's mass
        is fixed by the beams: each beam had {f(light.setting)}, so the system's mass was {f(r.systemMassBefore)}, and it cannot change.{' '}
        {noPair ? (
          <>
            That is less than {f(2 * PAIR_CREATION_THRESHOLD)}, so no pair can be made, and nothing happened. The beams passed through
            each other. The sum of the rest masses stayed the same ({f(r.sumOfRestMassesBefore)} before and {f(r.sumOfRestMassesAfter)} after).
            Daily-life example: to get over a 1-meter wall you have to jump at least high enough to reach the top. With less, nothing
            happens at all.
          </>
        ) : light.setting === PAIR_CREATION_THRESHOLD ? (
          <>
            That is exactly {f(2 * PAIR_CREATION_THRESHOLD)}, enough for a pair at rest and no more, so the pair was made at rest. The sum of
            the rest masses went up, from {f(r.sumOfRestMassesBefore)} to {f(r.sumOfRestMassesAfter)}.
          </>
        ) : (
          <>
            That is more than {f(2 * PAIR_CREATION_THRESHOLD)}, so a pair could be made. The extra went into the motion of the pair: each
            particle had an energy of {f(pair.reading.energy)}, of which 1 is its rest energy, so each moved at{' '}
            {f(Math.abs(pair.reading.speed))}c, from v = √(1 − 1 ÷ E²) = √(1 − 1 ÷ {f(pair.reading.energy)}²). The sum of the rest masses went up,
            from {f(r.sumOfRestMassesBefore)} to {f(r.sumOfRestMassesAfter)}.
          </>
        )}
      </>,
      <>
        <strong>Why one pulse alone cannot do it.</strong> Under this experiment's rules, a single pulse of light has a system mass of
        0, which is below the {f(2 * PAIR_CREATION_THRESHOLD)} a pair needs, so one pulse alone cannot make a pair. The experiment used two pulses.
      </>,
      <>
        <strong>Where the energy went, or came from (light).</strong>{' '}
        {noPair
          ? 'Nothing was exchanged, because the light did not have enough energy to supply the rest energy of a pair. The total energy and the sum of the rest masses stayed as they were.'
          : 'The energy of the light became the rest energy of the pair, and any extra became their energy of motion. Total energy was conserved the whole time. What changed was the form it was in, and so the sum of the rest masses.'}
      </>,
    )
  }

  const heliumRun = extraRuns['helium-binding']
  if (heliumRun !== undefined) {
    const r = runReactionExperiment('helium-binding', heliumRun.setting, heliumRun.passingSpeed)
    const check = heliumCheckUp(r)
    const massLossKgPerSecond = SOLAR_LUMINOSITY_WATTS / (SPEED_OF_LIGHT_METERS_PER_SECOND * SPEED_OF_LIGHT_METERS_PER_SECOND)
    paragraphs.push(
      <>
        <strong>Your run of the helium nucleus: it is lighter than its parts.</strong> Two protons and two neutrons weigh{' '}
        {f(r.sumOfRestMassesBefore)} MeV/c² apart, and the helium-4 nucleus weighs {f(r.sumOfRestMassesAfter)} MeV/c² together, a
        difference of {f(r.energyReleased)} MeV/c², which is {f((r.energyReleased / r.sumOfRestMassesBefore) * 100)} percent of the mass of
        the parts. When they bind, {f(r.energyReleased, 1)} MeV of energy leaves, as light and fast particles. That is the{' '}
        <em>binding energy</em>. Worked out from the published masses of the proton, the neutron and the helium-4 nucleus (CODATA 2022, from
        NIST), it is {f(check.published, 4)} MeV, "{check.reading}" as this page's value to the rounding of its masses. Daily-life comparison:
        a ball dropped into a pit gives up energy as it falls, and it takes that same energy to lift it out again.
      </>,
      <>
        <strong>The Sun.</strong> The same idea works on a large scale. The Sun fuses hydrogen into helium. NASA's Goddard page says it
        fuses about 600 million tons of hydrogen every second, and that its power, about 3.8 × 10²⁶ watts, divided by c² is about 4.4 billion
        kilograms of mass every second, roughly 4 million tons. Worked out here from the same power, the mass loss is {f(massLossKgPerSecond / 1e9, 1)} billion
        kilograms. Set beside the 600 million tons, that is about {f(sunMassLossFraction() * 100, 1)} percent ({f(massLossKgPerSecond / 1e9, 1)} billion ÷ {f(SUN_HYDROGEN_FUSED_KG_PER_SECOND / 1e9, 0)} billion
        kilograms): this page's own ratio of NASA's two numbers, not a figure NASA states. That is why the Sun shines.
      </>,
      <>
        <strong>Where the energy went, or came from (helium).</strong> The parts gave up {f(r.energyReleased, 1)} MeV when they bound
        together, and it left as light and fast particles. Total energy was conserved the whole time. What changed was the form it was in,
        and so the sum of the rest masses.
      </>,
    )
  }

  // A pointer to the processes not yet run, because each run explains only its own.
  const notRun = (['pair-creation', 'helium-binding'] as const).filter((k) => extraRuns[k] === undefined)
  const names: Record<'pair-creation' | 'helium-binding', string> = {
    'pair-creation': '"Two beams of light meet", where light makes a particle and its antiparticle if it has enough energy',
    'helium-binding': '"A helium nucleus forms", where a real nucleus gives up energy when it binds',
  }
  paragraphs.push(
    <>
      <strong>The other processes.</strong>{' '}
      {notRun.length === 0
        ? 'You have run all three processes, so this explanation covers each of them. Each shows a different side of the same idea.'
        : `Not run yet: ${notRun.map((k) => names[k]).join('; and ')}. The tutor's paragraphs for a process appear here after you have run it in Part 2. Each shows a different side of the same idea.`}
    </>,
  )

  paragraphs.push(
    <>
      <strong>What was shown, and what was not.</strong> You saw one kind of reaction at a time, along one line.{' '}
      {heliumRun !== undefined && 'The helium nucleus was shown as an energy accounting only, not as a process. '}Electric charge,
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
              "Look at the mass ledger in Picture 1 and at the tables in Part 3. What happened to the sum of the masses of the pieces? What happened to the mass of the whole system?"}
            {tutorStep === 'compare' &&
              `You predicted that ${predictionClauses[predicted]}. In this run, the sum of the rest masses went from ${f(result.sumOfRestMassesBefore)} to ${f(result.sumOfRestMassesAfter)} ${unit}, and the system's mass went from ${f(result.systemMassBefore)} to ${f(result.systemMassAfter)}. Look at the white tick on the ledger, which shows the answer you chose, and compare it with the grey and blue bars of the sum of the rest masses. What do you notice?`}
            {tutorStep === 'conceptual' &&
              'Energy and momentum are conserved here. Where did the energy go (or where did it come from) when the sum of the masses changed?'}
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
