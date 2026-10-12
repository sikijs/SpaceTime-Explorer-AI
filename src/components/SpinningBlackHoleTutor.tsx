import { useState } from 'react'
import { BLACK_HOLE_PRESETS, energyReleasedSteps, runSpinningBlackHoleExperiment } from '../physics/spinningBlackHoleExperiment'

type EdgeChoice = 'closer' | 'same' | 'farther'
type HorizonChoice = 'bigger' | 'same' | 'smaller'
type EnergyChoice = 'with' | 'against' | 'same'
type TutorStep = 'observe' | 'compare' | 'conceptual' | 'explained'

interface SpinningBlackHoleTutorProps {
  predictedWith: EdgeChoice
  predictedAgainst: EdgeChoice
  predictedHorizon: HorizonChoice
  predictedEnergy: EnergyChoice
  // Whether each prediction matched the model, worked out once, in the experiment (the same sentences as its Results).
  matches: { with: boolean; against: boolean; horizon: boolean; energy: boolean }
  onExplained?: () => void
}

const edgeClauses: Record<EdgeChoice, string> = {
  closer: 'it would be closer to the black hole',
  same: 'it would be in the same place',
  farther: 'it would be farther from the black hole',
}

const horizonClauses: Record<HorizonChoice, string> = {
  bigger: 'get bigger',
  same: 'stay the same size',
  smaller: 'get smaller',
}

const energyClauses: Record<EnergyChoice, string> = {
  with: 'the probe circling with the spin would give up more energy',
  against: 'the probe circling against the spin would give up more energy',
  same: 'the two probes would give up the same energy',
}

// Three significant figures, with no trailing zeros ("1.16", "34.2", "0.718").
function fmt(value: number): string {
  return String(Number(value.toPrecision(3)))
}

const fmt2 = (value: number) => value.toFixed(2)
const pct = (fraction: number) => `${(fraction * 100).toFixed(1)}%`

const KM_PER_AU = 149_597_870.7
function fmtDistance(km: number): string {
  if (km >= 7.5e6) return `${fmt(km / KM_PER_AU)} AU`
  return `${fmt(km)} km`
}

const paragraphStyle = { marginBottom: '1rem', fontSize: '0.95rem', color: '#333', lineHeight: '1.6' } as const

export function SpinningBlackHoleTutor({ predictedWith, predictedAgainst, predictedHorizon, predictedEnergy, matches, onExplained }: SpinningBlackHoleTutorProps) {
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

  // Numbers for the explanation come from the experiment's own model, for a spin of 0.9 (the specification's reference
  // case), never typed in by hand.
  const reference = runSpinningBlackHoleExperiment('stellar-black-hole', 0.9)
  const fast = runSpinningBlackHoleExperiment('stellar-black-hole', 0.99)
  const withSteps = energyReleasedSteps(0.9, 'with')
  const againstSteps = energyReleasedSteps(0.9, 'against')
  const noSpinSteps = energyReleasedSteps(0, 'with')
  const holes = BLACK_HOLE_PRESETS.map((p) => runSpinningBlackHoleExperiment(p.id, 0.9))
  const label = (h: (typeof holes)[number]) => h.preset.label.replace(/^A /, 'a ')
  const verdict = (right: boolean) => (right ? 'right' : 'off this time')

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
      {/* Draft wording, for the owner's review (CLAUDE.md §28.1). Follows the tutor sequence in the specification: observe,
          compare with the predictions, one conceptual question, then the explanation. "Frame dragging" and the honey
          comparison appear only in the explanation (§12, §15; Decision 5 and success criterion 7). */}
      <h2 style={{ marginTop: 0, marginBottom: '1rem', fontSize: '1.125rem', color: '#0066cc' }}>
        Let's reflect on what you observed
      </h2>

      {(tutorStep === 'observe' || tutorStep === 'compare' || tutorStep === 'conceptual') && (
        <div>
          <p style={paragraphStyle}>
            {tutorStep === 'observe' &&
              'Look at the map and the graph. What happens to the green ring and the rose ring as the black hole spins up? Which way does each move? Now try a different spin and compare.'}
            {tutorStep === 'compare' &&
              `You predicted that, circling with the spin, ${edgeClauses[predictedWith]} (${verdict(matches.with)}); that, circling against the spin, ${edgeClauses[predictedAgainst]} (${verdict(matches.against)}); that the horizon would ${horizonClauses[predictedHorizon]} (${verdict(matches.horizon)}); and that ${energyClauses[predictedEnergy]} (${verdict(matches.energy)}). Comparing that to what you saw, what do you notice?`}
            {tutorStep === 'conceptual' &&
              `At a spin of 0.9, a probe circling with the spin has its last safe orbit at ${fmt2(reference.lastSafeWith)} reference radii, closer in than the 3 of Experiment 3. A probe circling against the spin has it at ${fmt2(reference.lastSafeAgainst)}, farther out. It is the same black hole with the same mass. Why might the direction of the probe's circling matter?`}
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
            <strong>1. A black hole can spin, and one number describes how much.</strong> The spin runs from 0 (not
            spinning, the black holes of Experiments 1 to 7) up to just under 1, the most spin a black hole of that mass can
            have. A spin of 0.9 is nine-tenths of that limit. It cannot be seen turning, because a black hole has no
            surface. It shows up in the gravity around it.
          </p>
          <p style={paragraphStyle}>
            <strong>2. The space around a spinning black hole is dragged around with it.</strong> This effect has a name:{' '}
            <strong>frame dragging</strong>. It is stated here, not derived. A comparison from daily life: turn a spoon in a
            jar of honey. The honey close to the spoon swirls around with it, and the honey farther away swirls more slowly.
            In the same way, the space close to a spinning black hole is carried around in the direction of the spin, and
            the carrying is stronger the closer you are. This is only a comparison. Space is not honey, and nothing rubs: the
            point is only the swirl.
          </p>
          <p style={paragraphStyle}>
            <strong>3. Why the direction matters.</strong> Think of a ball rolled around in the swirling honey. If it goes
            the same way as the swirl, the honey carries it along. If it goes the other way, it has to push against the
            honey. A probe circling with the spin is helped by the dragging, and it can keep a circular orbit closer in. A
            probe circling against the spin has to fight it, and needs more room. This is a picture of what the formulas
            say, not a derivation of them.
          </p>
          <p style={paragraphStyle}>
            <strong>4. The numbers.</strong> With no spin, the last safe orbit is at 3 reference radii (Experiment 3). At a
            spin of 0.9, a probe circling with the spin has it at {fmt2(reference.lastSafeWith)}, and a probe circling
            against the spin has it at {fmt2(reference.lastSafeAgainst)}. For the 10-Sun black hole, where one reference
            radius is about {fmt(reference.referenceRadiusKm)} km, that is about{' '}
            {Math.round(reference.lastSafeWith * reference.referenceRadiusKm)} km and about{' '}
            {Math.round(reference.lastSafeAgainst * reference.referenceRadiusKm)} km from the center. The second is{' '}
            {fmt(reference.lastSafeAgainst / reference.lastSafeWith)} times the first, for the same black hole with the same
            mass.
          </p>
          <p style={paragraphStyle}>
            <strong>5. The horizon gets smaller as the spin grows.</strong> At a spin of 0.9 it is {fmt2(reference.horizon)}{' '}
            reference radii instead of 1, and at 0.99 it is {fmt2(fast.horizon)}. The black hole's mass did not change. The
            formulas give a smaller horizon for the same mass when it spins.
          </p>
          <p style={paragraphStyle}>
            <strong>6. Closer in means more energy given up.</strong> A probe that slowly spirals down to its last safe orbit
            gives up {pct(noSpinSteps.released)} of its rest-mass energy with no spin. At a spin of 0.9 it gives up{' '}
            {pct(withSteps.released)} circling with the spin, which is {fmt(withSteps.released / noSpinSteps.released)} times
            as much, and {pct(againstSteps.released)} circling against it. Like a ball that rolls farther down a hill, a probe
            that gets closer in has gone farther down gravity's hill, so it has given up more. (This is for a gradual descent.
            Where the energy goes is not modeled.)
          </p>
          <p style={paragraphStyle}>
            <strong>7. It does not depend on the black hole's mass.</strong> In reference radii, the last safe orbit with the
            spin is {fmt2(reference.lastSafeWith)} for {label(holes[0])}, {label(holes[1])} and {label(holes[2])} alike. Only
            the distance in kilometers differs: {fmtDistance(holes[0].lastSafeWith * holes[0].referenceRadiusKm)},{' '}
            {fmtDistance(holes[1].lastSafeWith * holes[1].referenceRadiusKm)} and{' '}
            {fmtDistance(holes[2].lastSafeWith * holes[2].referenceRadiusKm)}.
          </p>
          <p style={paragraphStyle}>
            <strong>8. The honest limits.</strong> This was a thought experiment about a small probe circling in the flat
            sheet through the black hole's equator. It placed the horizon and the last safe orbits with given formulas. It
            did not follow a probe's path, and it did not cover tilted orbits. It did not model the ergosphere, a region
            outside a spinning black hole's horizon where nothing can stay at rest. Astronomers estimate the spins of real
            black holes, and how they do that is not covered here. The equations were given, not derived, and are for a
            spinning black hole with no electric charge. The spin stayed below 1. Nothing inside the horizon was modeled.
          </p>
        </div>
      )}
    </div>
  )
}
