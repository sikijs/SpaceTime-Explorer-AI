import { useState } from 'react'
import { horizonRadiusKm } from '../physics/blackHoleSizeExperiment'
import {
  BLACK_HOLE_PRESETS,
  LAST_SAFE_ORBIT_IN_HORIZON_RADII,
  MAX_TURNS,
  exactCircularSpeedFractionOfLight,
  modelEdgeInHorizonRadii,
  orbitPath,
  ordinaryCircularSpeedFractionOfLight,
} from '../physics/orbitsNearBlackHoleExperiment'

type NudgeChoice = 'wobbles' | 'spirals-in' | 'flies-off'
type LastSafeChoice = 'anywhere' | 'three' | 'ten'
type FarChoice = 'very-different' | 'nearly-same'
type TutorStep = 'observe' | 'compare' | 'conceptual' | 'explained'

interface OrbitsNearBlackHoleTutorProps {
  predictedNudge: NudgeChoice
  predictedLastSafe: LastSafeChoice
  predictedFar: FarChoice
  onExplained?: () => void
}

const nudgeClauses: Record<NudgeChoice, string> = {
  wobbles: 'a probe circling at 2 horizon radii would wobble a little and keep circling',
  'spirals-in': 'a probe circling at 2 horizon radii would spiral in and cross the horizon',
  'flies-off': 'a probe circling at 2 horizon radii would fly off',
}

const lastSafeClauses: Record<LastSafeChoice, string> = {
  anywhere: 'you could circle safely anywhere outside the horizon',
  three: 'the last safe place to circle is about 3 horizon radii from the center',
  ten: 'the last safe place to circle is about 10 horizon radii from the center',
}

const farClauses: Record<FarChoice, string> = {
  'very-different': "at 20 horizon radii the exact theory's orbit would look very different from ordinary gravity's",
  'nearly-same': "at 20 horizon radii the exact theory's orbit would look nearly the same as ordinary gravity's",
}

// Three significant figures, with no trailing zeros ("0.5", "2.95", "41.4").
function fmt(value: number): string {
  return String(Number(value.toPrecision(3)))
}

// A length in plain units, from kilometers to billions of kilometers.
function fmtLength(km: number): string {
  if (km < 1e6) return `${fmt(km)} km`
  if (km < 1e9) return `${fmt(km / 1e6)} million km`
  return `${fmt(km / 1e9)} billion km`
}

const paragraphStyle = { marginBottom: '1rem', fontSize: '0.95rem', color: '#333', lineHeight: '1.6' } as const

export function OrbitsNearBlackHoleTutor({
  predictedNudge,
  predictedLastSafe,
  predictedFar,
  onExplained,
}: OrbitsNearBlackHoleTutorProps) {
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
  const edge = modelEdgeInHorizonRadii()
  const twoOrdinary = orbitPath('ordinary', 2)
  const twoExact = orbitPath('exact', 2)
  const twoWobblePercent =
    Math.max(1 - twoOrdinary.closestInHorizonRadii / 2, twoOrdinary.farthestInHorizonRadii / 2 - 1) * 100
  const speedExactAtTwo = exactCircularSpeedFractionOfLight(2)
  const speedOrdinaryAtTwo = ordinaryCircularSpeedFractionOfLight(2)
  const speedExactAtTwenty = exactCircularSpeedFractionOfLight(20)
  const speedOrdinaryAtTwenty = ordinaryCircularSpeedFractionOfLight(20)
  const lastSafeKm = BLACK_HOLE_PRESETS.map((p) => ({
    label: p.label,
    km: LAST_SAFE_ORBIT_IN_HORIZON_RADII * horizonRadiusKm(p.massSolarMasses),
  }))

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
      {/* DRAFT wording, for the owner's line-by-line review (CLAUDE.md §28.1). */}
      <h2 style={{ marginTop: 0, marginBottom: '1rem', fontSize: '1.125rem', color: '#0066cc' }}>
        Let's reflect on what you observed
      </h2>

      {(tutorStep === 'observe' || tutorStep === 'compare' || tutorStep === 'conceptual') && (
        <div>
          <p style={paragraphStyle}>
            {tutorStep === 'observe' &&
              'Look at the two paths. What does each probe do after the nudge? Now try other starting distances, including one very close in and one far out. Where does the blue probe stop plunging?'}
            {tutorStep === 'compare' &&
              `You predicted that ${nudgeClauses[predictedNudge]}; that ${lastSafeClauses[predictedLastSafe]}; and that ${farClauses[predictedFar]}. Comparing that to what you saw, what do you notice?`}
            {tutorStep === 'conceptual' &&
              'In ordinary gravity, a circular orbit that gets a small nudge always survives. Near a black hole, it does not. What do you think is different about gravity close in?'}
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
            <strong>1. Ordinary gravity has no edge.</strong> The gold probe, which follows the ordinary-gravity
            rule from Gravity and Curved Spacetime, Experiment 6, only wobbles after a nudge, wherever it starts.
            Starting at 2 horizon radii, it stayed within {fmt(twoWobblePercent)}% of its starting distance for all{' '}
            {MAX_TURNS} turns. In ordinary gravity, a circular orbit at any distance is safe.
          </p>
          <p style={paragraphStyle}>
            <strong>2. In the exact theory there is a last safe circular orbit.</strong> It is at 6GM/c² from the
            center, which is {LAST_SAFE_ORBIT_IN_HORIZON_RADII} horizon radii. That is{' '}
            {lastSafeKm.map((p) => `${fmtLength(p.km)} for ${p.label.replace(/^A /, 'a ')}`).join(', ')}. Outside
            it, a nudged circular orbit only wobbles, as in ordinary gravity. At or inside it, the tiniest nudge
            inward sends the probe spiraling into the black hole: the blue probe starting at 2 horizon radii
            crossed the horizon after about {twoExact.turnsCompleted.toFixed(1)} turns. Think of the marble from the
            Results. An orbit outside the last safe orbit is like a marble at the bottom of a bowl: nudge it and it
            rolls back. An orbit at or inside it is like a marble balanced on top of an upside-down bowl: nudge it
            and it rolls off. (This is a picture for "survives a nudge or does not", not for how gravity works.)
          </p>
          <p style={paragraphStyle}>
            <strong>3. Why this happens.</strong> The exact theory adds an extra pull toward the black hole to
            ordinary gravity's. Far away it is negligible. It grows quickly as the probe gets closer, and close in
            it overwhelms the sideways motion's hold on the orbit. You can see the two rules drifting apart in the
            launch speeds. At 20 horizon radii the circular-orbit speed is {fmt(speedOrdinaryAtTwenty)} of the speed of
            light in ordinary gravity and {fmt(speedExactAtTwenty)} in the exact theory, only{' '}
            {fmt((speedExactAtTwenty / speedOrdinaryAtTwenty - 1) * 100)}% apart. At 2 horizon radii they are{' '}
            {fmt(speedOrdinaryAtTwo)} and {fmt(speedExactAtTwo)}, which is{' '}
            {fmt((speedExactAtTwo / speedOrdinaryAtTwo - 1) * 100)}% apart. Closer in, the gap widens quickly.
          </p>
          <p style={paragraphStyle}>
            <strong>4. Circular orbits that exist but do not last.</strong> Between 1.5 and{' '}
            {LAST_SAFE_ORBIT_IN_HORIZON_RADII} horizon radii a circular orbit still exists on paper, but it is the
            marble on top of the upside-down bowl: any nudge ends it. Inside 1.5 horizon radii, no circular orbit
            exists at all for anything slower than light. Light itself can circle at exactly 1.5 horizon radii.
            A later experiment in this chapter takes that up.
          </p>
          <p style={paragraphStyle}>
            <strong>5. Far away, the two rules agree.</strong> At 20 horizon radii the two probes' orbits look
            nearly the same. This is why ordinary gravity worked so well for planets, satellites and GPS in the
            earlier chapters: they are very far from their masses, measured in horizon radii.
          </p>
          <p style={paragraphStyle}>
            <strong>6. Why the model's edge is at about {fmt(edge)}, not 3.</strong> The exact theory's edge, at
            exactly {LAST_SAFE_ORBIT_IN_HORIZON_RADII}, is for a nudge that is vanishingly small. Our nudge is
            small but not zero, so a probe starting a little outside {LAST_SAFE_ORBIT_IN_HORIZON_RADII} still
            plunges. A smaller nudge would move the edge closer to {LAST_SAFE_ORBIT_IN_HORIZON_RADII}.
          </p>
          <p style={paragraphStyle}>
            <strong>7. Beyond what this experiment shows.</strong> Gas that spirals toward a black hole is
            generally described as forming a flat disk whose inner edge sits near the last safe orbit. This is not
            something you saw here. It is mentioned only to say where this idea turns up.
          </p>
          <p style={paragraphStyle}>
            <strong>8. The honest limits.</strong> This was a thought experiment about a small probe, and it did
            not say how the probe got into orbit. The exact equation was given, not derived, and is for a black
            hole that does not spin and has no electric charge. A spinning black hole's last safe orbit is
            somewhere else. A real orbit this close would also lose energy as gravitational waves, which was left
            out. Nothing inside the horizon was modeled.
          </p>
        </div>
      )}
    </div>
  )
}
