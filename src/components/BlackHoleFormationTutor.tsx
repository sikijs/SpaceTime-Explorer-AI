import { useState } from 'react'
import {
  CHANDRASEKHAR_LIMIT_SOLAR_MASSES,
  NEUTRON_STAR_RADIUS_KM,
  SURE_BLACK_HOLE_BOTTOM_SOLAR_MASSES,
  SURE_NEUTRON_STAR_TOP_SOLAR_MASSES,
  runBlackHoleFormationExperiment,
  whiteDwarfRadiusKm,
} from '../physics/blackHoleFormationExperiment'

type SizeChoice = 'bigger' | 'same' | 'smaller'
type ThresholdChoice = 'about-one' | 'about-three' | 'about-thirty'
type LimitChoice = 'higher' | 'same' | 'lower'
type TutorStep = 'observe' | 'compare' | 'conceptual' | 'explained'

interface BlackHoleFormationTutorProps {
  predictedSize: SizeChoice
  predictedThreshold: ThresholdChoice
  predictedLimit: LimitChoice
  // Whether each prediction matched the model, worked out once, in the experiment (the same sentences as its Results).
  matches: { size: boolean; threshold: boolean; limit: boolean }
  onExplained?: () => void
}

const sizeClauses: Record<SizeChoice, string> = {
  bigger: 'a white dwarf would get bigger as mass is added',
  same: 'a white dwarf would stay the same size as mass is added',
  smaller: 'a white dwarf would get smaller as mass is added',
}

const thresholdClauses: Record<ThresholdChoice, string> = {
  'about-one': "a core would first become a black hole at about the mass of the Sun",
  'about-three': "a core would first become a black hole at about 3 times the Sun's mass",
  'about-thirty': "a core would first become a black hole at about 30 times the Sun's mass",
}

const limitClauses: Record<LimitChoice, string> = {
  higher: "a neutron star's largest mass would be higher than a white dwarf's",
  same: "a neutron star's largest mass would be the same as a white dwarf's",
  lower: "a neutron star's largest mass would be lower than a white dwarf's",
}

// Three significant figures, with no trailing zeros ("1.35", "8,970", "29.5").
function fmt(value: number): string {
  if (value >= 1000) return Number(value.toPrecision(3)).toLocaleString('en-US')
  return String(Number(value.toPrecision(3)))
}

const fmtKm = (km: number) => `${fmt(km)} km`

const paragraphStyle = { marginBottom: '1rem', fontSize: '0.95rem', color: '#333', lineHeight: '1.6' } as const

export function BlackHoleFormationTutor({ predictedSize, predictedThreshold, predictedLimit, matches, onExplained }: BlackHoleFormationTutorProps) {
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
  const verdict = (right: boolean) => (right ? 'right' : 'off this time')

  // Numbers for the explanation come from the experiment's own model, never typed in by hand.
  const light = whiteDwarfRadiusKm(0.6)
  const heavy = whiteDwarfRadiusKm(1.4)
  const lowNeutron = runBlackHoleFormationExperiment(1.6)
  const threeSuns = runBlackHoleFormationExperiment(3)
  const tenSuns = runBlackHoleFormationExperiment(10)
  // A neutron star of 1.4 Suns, as in Experiment 1: its radius over the horizon radius of 1.4 Suns.
  const experimentOneRatio = NEUTRON_STAR_RADIUS_KM / runBlackHoleFormationExperiment(1.4).horizonRadiusKm

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
          compare with the predictions, one conceptual question, then the explanation. */}
      <h2 style={{ marginTop: 0, marginBottom: '1rem', fontSize: '1.125rem', color: '#0066cc' }}>
        Let's reflect on what you observed
      </h2>

      {(tutorStep === 'observe' || tutorStep === 'compare' || tutorStep === 'conceptual') && (
        <div>
          <p style={paragraphStyle}>
            {tutorStep === 'observe' &&
              'Look at the ladder and the size picture. Try a few masses. What changes in the pictures as the core gets heavier, and where does the ball stop?'}
            {tutorStep === 'compare' &&
              `You predicted that ${sizeClauses[predictedSize]} (${verdict(matches.size)}); that ${thresholdClauses[predictedThreshold]} (${verdict(matches.threshold)}); and that ${limitClauses[predictedLimit]} (${verdict(matches.limit)}). Comparing that to what you saw, what do you notice?`}
            {tutorStep === 'conceptual' && 'A heavier white dwarf is smaller, not bigger. Why might adding mass make it shrink?'}
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
            <strong>1. A dead core has only one thing left to push outward.</strong> Once a star's fuel is gone, the push that
            came from the fuel is gone too. All that is left is a push that comes from squeezing particles together. Gravity
            pulls the core inward, and that push is all that can hold it up.
          </p>
          <p style={paragraphStyle}>
            <strong>2. Electrons cannot all be in the same state, so squeezing them makes them push back.</strong> This is
            stated here, not derived. The comparison from the introduction: seats in a theatre, one person per seat. A small
            crowd can sit in the best seats, at the front. A bigger crowd has to use seats farther back. For electrons, "farther
            back" means more energy and more motion, and so more push. The push is called degeneracy pressure. This is only a
            comparison, but it shows why squeezing the electrons more makes them push harder.
          </p>
          <p style={paragraphStyle}>
            <strong>3. A heavier white dwarf is smaller.</strong> More mass pulls harder, so the electrons have to be squeezed
            tighter, into less room, before their push is strong enough to match gravity. In the model, a white dwarf of 0.6 Suns
            has a radius of {fmtKm(light)}, and one of 1.4 Suns has {fmtKm(heavy)}. The same mass, squeezed harder, takes up less
            room.
          </p>
          <p style={paragraphStyle}>
            <strong>4. Near {CHANDRASEKHAR_LIMIT_SOLAR_MASSES} Suns the electrons give out.</strong> As the core is squeezed
            tighter and tighter, the electrons are forced to move at close to the speed of light, and nothing can move faster
            than that (Relativity of Time and Motion, Experiment 5). So they cannot push back any harder, however tight the
            squeeze, and gravity wins. That is the Chandrasekhar limit, {CHANDRASEKHAR_LIMIT_SOLAR_MASSES} Suns, and the white
            dwarf's radius falls to zero there, as in the graph. This is stated here, not derived.
          </p>
          <p style={paragraphStyle}>
            <strong>5. Neutrons take over, and they have a limit too.</strong> Squeezed harder still, electrons and protons are
            pushed together into neutrons. Neutrons cannot all be in the same state either, so they push back in the same way,
            and they can hold up a much smaller, denser core: a neutron star, about {NEUTRON_STAR_RADIUS_KM} km in radius (about {2 * NEUTRON_STAR_RADIUS_KM} km across). But its
            push also gives out. Its largest mass is not known exactly, because the matter inside a neutron star is not fully
            understood: neutron stars of about 2 Suns are known, and the theory says the limit is at most about {SURE_BLACK_HOLE_BOTTOM_SOLAR_MASSES}. That is why
            the model shows a stretch between about {SURE_NEUTRON_STAR_TOP_SOLAR_MASSES} and {SURE_BLACK_HOLE_BOTTOM_SOLAR_MASSES} Suns as
            not known.
          </p>
          <p style={paragraphStyle}>
            <strong>6. Beyond that, nothing known holds the core up.</strong> It keeps shrinking until it is inside its own
            horizon. That is a black hole. The ratio of the held-up core's radius to its horizon radius shows how close a core
            gets to this: for a neutron star of 1.4 Suns, as in Experiment 1, it is {fmt(experimentOneRatio)}; for one of 1.6
            Suns, {fmt(lowNeutron.radiusOverHorizon as number)}; and for one of {SURE_BLACK_HOLE_BOTTOM_SOLAR_MASSES} Suns, if it
            could exist, only {fmt(threeSuns.radiusOverHorizon as number)}. For a core of 10 Suns the horizon radius is{' '}
            {fmtKm(tenSuns.horizonRadiusKm)}, and nothing known stops it from getting smaller than that. (A form of matter that
            could hold up a heavier core has been suggested, but none has been seen, and this experiment does not model one.)
          </p>
          <p style={paragraphStyle}>
            <strong>7. What is settled, and what is not.</strong> The white dwarf's limit is well established. The neutron star's
            largest mass is a range, not a number. Which stars end up as black holes is not settled either: stars with at least
            about 20 to 25 times the Sun's mass at birth generally do, but the boundary is not sharp. This experiment does not
            model that. It starts from the dead core and asks only what can hold it up.
          </p>
          <p style={paragraphStyle}>
            <strong>8. The honest limits.</strong> This was a thought experiment about a core that has cooled, is not spinning
            and is at rest. A real core collapses in a fraction of a second, and the 10-second squeeze you watched was only a
            way of showing the result. The explosion that can follow a collapse, which stars end as which, and everything
            inside the horizon were not modeled. The limits were given, not derived, and the sizes are round or fitted numbers.
          </p>
        </div>
      )}
    </div>
  )
}
