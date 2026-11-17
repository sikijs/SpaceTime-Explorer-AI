import { useState } from 'react'
import {
  FAR_START_IN_HORIZON_RADII,
  LAST_SAFE_ORBIT_IN_HORIZON_RADII,
  MAX_TURNS,
  PART_ONE_START_IN_HORIZON_RADII,
  farGuessIsModelAnswer,
  lastSafeGuessIsModelAnswer,
  lastSafeOrbitRows,
  modelEdgeInHorizonRadii,
  nudgeGuessIsModelAnswer,
  orbitPath,
  realStarRows,
  runFarPair,
  runPartOne,
  speedGapPercent,
  wobblePercent,
} from '../physics/orbitsNearBlackHoleExperiment'
import type { FarGuess, LastSafeGuess, NudgeGuess } from '../physics/orbitsNearBlackHoleExperiment'
import { formatLength } from './OrbitsNearBlackHolePictures'

// Black Holes, Experiment 3 (audit update): the tutor (docs/audit/black-holes-and-strong-gravity/03-draft-wording.md, section 8, approved by the
// owner on 2026-11-17). Its three questions point to the white marks by name, and its explanation marks each guess (the only place that does,
// CLAUDE.md §12, §13). Every number comes from the physics module.

type TutorStep = 'observe' | 'compare' | 'conceptual' | 'explained'

interface OrbitsNearBlackHoleTutorProps {
  predictedNudge: NudgeGuess
  predictedLastSafe: LastSafeGuess
  predictedFar: FarGuess
  onExplained?: () => void
}

const nudgeClauses: Record<NudgeGuess, string> = {
  wobbles: 'a probe circling at 2 horizon radii would wobble a little and keep circling',
  'spirals-in': 'a probe circling at 2 horizon radii would spiral in and cross the horizon',
  'flies-off': 'a probe circling at 2 horizon radii would fly off',
}
const lastSafeClauses: Record<LastSafeGuess, string> = {
  anywhere: 'you could circle safely anywhere outside the horizon',
  three: 'the last safe place to circle is about 3 horizon radii from the center',
  ten: 'the last safe place to circle is about 10 horizon radii from the center',
}
const farClauses: Record<FarGuess, string> = {
  'very-different': "at 20 horizon radii the exact theory's orbit would look very different from ordinary gravity's",
  'nearly-same': "at 20 horizon radii the exact theory's orbit would look nearly the same as ordinary gravity's",
}

// Three significant figures, with no trailing zeros ("0.5", "2.95", "41.4").
function fmt(value: number): string {
  return String(Number(value.toPrecision(3)))
}
// A length in plain units, from kilometers to billions of kilometers.
function fmtLength(km: number): string {
  return formatLength(km)
}
// Rounded to two significant figures ("1,600", "140").
function roundedTo2(value: number): string {
  return Number(value.toPrecision(2)).toLocaleString('en-US')
}

const paragraphStyle = { marginBottom: '1rem', fontSize: '0.95rem', color: '#333', lineHeight: '1.6' } as const

// The explanation: marks each guess against the module's numbers, then the physics step by step. Exported so that it can be checked without clicking.
export function OrbitsNearBlackHoleExplanation({
  predictedNudge,
  predictedLastSafe,
  predictedFar,
}: {
  predictedNudge: NudgeGuess
  predictedLastSafe: LastSafeGuess
  predictedFar: FarGuess
}) {
  // Numbers for the explanation come from the experiment's own model, never typed in by hand.
  const edge = modelEdgeInHorizonRadii()
  const two = runPartOne()
  const far = runFarPair()
  const aboveEdge = orbitPath('exact', 3.5)
  const atThree = orbitPath('exact', LAST_SAFE_ORBIT_IN_HORIZON_RADII)
  const atTen = orbitPath('exact', 10)
  const twoWobblePercent = wobblePercent(two.ordinary, PART_ONE_START_IN_HORIZON_RADII)
  const farGap = speedGapPercent(FAR_START_IN_HORIZON_RADII)
  const twoGap = speedGapPercent(PART_ONE_START_IN_HORIZON_RADII)
  const lastSafeKm = lastSafeOrbitRows().map((r) => ({ label: r.preset.label, km: r.lastSafeOrbitKm }))
  const [s2, s301] = realStarRows()

  const verdict = (matches: boolean) => (matches ? 'That matches the model' : 'That differs from the model')

  return (
        <div>
          <p style={paragraphStyle}>
            <strong>Your three guesses, one by one.</strong>
          </p>
          <p style={paragraphStyle}>
            <em>First guess:</em> you guessed that {nudgeClauses[predictedNudge]}. {verdict(nudgeGuessIsModelAnswer(predictedNudge))}: at {PART_ONE_START_IN_HORIZON_RADII} horizon radii the blue probe crossed the horizon after about{' '}
            {two.exact.turnsCompleted.toFixed(1)} turns, while the gold probe stayed within {fmt(twoWobblePercent)}% of its starting distance for all {MAX_TURNS} turns. In the picture, your white marker sat beside the blue probe’s start.
          </p>
          <p style={paragraphStyle}>
            <em>Second guess:</em> you guessed that {lastSafeClauses[predictedLastSafe]}. {verdict(lastSafeGuessIsModelAnswer(predictedLastSafe))}: in the exact theory the last safe orbit is at {LAST_SAFE_ORBIT_IN_HORIZON_RADII} horizon radii. In this
            model a probe starting at 3.5 {aboveEdge.outcome === 'keeps-circling' ? `kept circling for all ${MAX_TURNS} turns` : 'plunged'}, while one starting at {LAST_SAFE_ORBIT_IN_HORIZON_RADII} plunged after about {atThree.turnsCompleted.toFixed(1)} turns.
            {predictedLastSafe === 'anywhere' && ' It is in ordinary gravity that a circle is safe anywhere; in the exact theory an orbit close in cannot last.'}
            {predictedLastSafe === 'ten' && ` The edge is much closer in than 10 horizon radii: a probe starting at 10 ${atTen.outcome === 'keeps-circling' ? 'keeps circling too' : 'plunges'}.`} In Picture 2 your white line was at{' '}
            {predictedLastSafe === 'three' ? '3' : predictedLastSafe === 'ten' ? '10' : 'no fixed distance'} and the purple line at {LAST_SAFE_ORBIT_IN_HORIZON_RADII}.
          </p>
          <p style={paragraphStyle}>
            <em>Third guess:</em> you guessed that {farClauses[predictedFar]}. {verdict(farGuessIsModelAnswer(predictedFar))}: at {FAR_START_IN_HORIZON_RADII} horizon radii the launch speeds are {far.ordinarySpeedFractionOfLight.toFixed(3)} and{' '}
            {far.exactSpeedFractionOfLight.toFixed(3)} of the speed of light, only {fmt(farGap)}% apart, and both probes kept circling, the blue within {fmt(wobblePercent(far.exact, FAR_START_IN_HORIZON_RADII))}% of its start.
          </p>

          <p style={paragraphStyle}>
            <strong>1. Ordinary gravity has no edge.</strong> The gold probe, which follows the ordinary-gravity rule from Gravity and Curved Spacetime, Experiment 6, only wobbles after a nudge, wherever it starts. Starting at{' '}
            {PART_ONE_START_IN_HORIZON_RADII} horizon radii, it stayed within {fmt(twoWobblePercent)}% of its starting distance for all {MAX_TURNS} turns. In ordinary gravity, a circular orbit at any distance is safe.
          </p>
          <p style={paragraphStyle}>
            <strong>2. In the exact theory there is a last safe circular orbit.</strong> It is at 6GM/c² from the center, which is {LAST_SAFE_ORBIT_IN_HORIZON_RADII} horizon radii. That is{' '}
            {lastSafeKm.map((p) => `${fmtLength(p.km)} for ${p.label.replace(/^A /, 'a ')}`).join(', ')}. Outside it, a nudged circular orbit only wobbles, as in ordinary gravity. At or inside it, the tiniest nudge inward sends the
            probe spiraling into the black hole: the blue probe starting at {PART_ONE_START_IN_HORIZON_RADII} horizon radii crossed the horizon after about {two.exact.turnsCompleted.toFixed(1)} turns. Think of the marble from the Results. An orbit
            outside the last safe orbit is like a marble at the bottom of a bowl: nudge it and it rolls back. An orbit at or inside it is like a marble balanced on top of an upside-down bowl: nudge it and it rolls off. (This is a
            picture for “survives a nudge or does not”, not for how gravity works.)
          </p>
          <p style={paragraphStyle}>
            <strong>3. Why this happens.</strong> The exact theory adds an extra pull toward the black hole to ordinary gravity’s. Far away it is negligible. It grows quickly as the probe gets closer, and close in it overwhelms the sideways
            motion’s hold on the orbit. You can see the two rules drifting apart in the launch speeds. At {FAR_START_IN_HORIZON_RADII} horizon radii the circular-orbit speed is {fmt(far.ordinarySpeedFractionOfLight)} of the speed of light in ordinary
            gravity and {fmt(far.exactSpeedFractionOfLight)} in the exact theory, only {fmt(farGap)}% apart. At {PART_ONE_START_IN_HORIZON_RADII} horizon radii they are {fmt(two.ordinarySpeedFractionOfLight)} and {fmt(two.exactSpeedFractionOfLight)}, which is{' '}
            {fmt(twoGap)}% apart. Closer in, the gap widens quickly.
          </p>
          <p style={paragraphStyle}>
            <strong>4. Circular orbits that exist but do not last.</strong> Between 1.5 and {LAST_SAFE_ORBIT_IN_HORIZON_RADII} horizon radii a circular orbit still exists on paper, but it is the marble on top of the upside-down bowl: any nudge
            ends it. Inside 1.5 horizon radii, no circular orbit exists at all for anything slower than light. Light itself can circle at exactly 1.5 horizon radii. A later experiment in this chapter takes that up.
          </p>
          <p style={paragraphStyle}>
            <strong>5. Far away, the two rules agree closely.</strong> At {FAR_START_IN_HORIZON_RADII} horizon radii the two probes’ orbits look nearly the same. This is why ordinary gravity worked so well for planets, satellites and GPS in the
            earlier chapters: they are very far from their masses, measured in horizon radii.
          </p>
          <p style={paragraphStyle}>
            <strong>6. Why the model’s edge is at about {fmt(edge)}, not 3.</strong> The exact theory’s edge, at exactly {LAST_SAFE_ORBIT_IN_HORIZON_RADII}, is for a nudge that is vanishingly small. Our nudge is small but not zero, so a probe
            starting a little outside {LAST_SAFE_ORBIT_IN_HORIZON_RADII} still plunges. A smaller nudge would move the edge closer to {LAST_SAFE_ORBIT_IN_HORIZON_RADII}.
          </p>
          <p style={paragraphStyle}>
            <strong>7. Real orbits.</strong> The stars S2 and S301 are real stars that circle Sagittarius A* far outside this edge: S2 comes less than about {roundedTo2(s2.horizonRadiiThisPage)} horizon radii from it at closest, and S301 about{' '}
            {roundedTo2(s301.horizonRadiiThisPage)}. ESO found that S2’s orbit turns a little each lap, like a rosette, as Einstein’s theory says. So a far-out orbit is not exactly the same as ordinary gravity’s: the difference is small, not
            zero. In this model, at {FAR_START_IN_HORIZON_RADII} horizon radii the launch speeds are {fmt(farGap)}% apart, which is small but not zero too. Gas that falls toward a black hole forms a disk, and NASA describes the disk’s inner edge as
            limited by a distance like the one you found. This experiment did not show any of that. It is named only to say where the idea turns up.
          </p>
          <p style={paragraphStyle}>
            <strong>8. The honest limits.</strong> This was a thought experiment about a small probe, and it did not say how the probe got into orbit. The exact equation was given, not derived, and is for a black hole that does not spin and has
            no electric charge. A spinning black hole’s last safe orbit is somewhere else (NASA’s HEASARC page says it can come closer to the horizon). A real orbit this close would also lose energy as gravitational waves, which was left out.
            Nothing inside the horizon was modeled.
          </p>
        </div>
  )
}

export function OrbitsNearBlackHoleTutor({ predictedNudge, predictedLastSafe, predictedFar, onExplained }: OrbitsNearBlackHoleTutorProps) {
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

      {(tutorStep === 'observe' || tutorStep === 'compare' || tutorStep === 'conceptual') && (
        <div>
          <p style={{ ...paragraphStyle, fontSize: '0.8125rem', color: '#555' }}>
            There are three questions, one at a time, and then an explanation. Answer each in a sentence or two, in your own words, to go on. Your answers are not marked: they are for you to put your thinking
            into words before the explanation.
          </p>
          <p style={paragraphStyle}>
            {tutorStep === 'observe' &&
              'Look at the two probes in Picture 1 and at the white YOUR GUESS marks on Pictures 1, 1b and 2. What does each probe do after the nudge? Now go to Part 2 and try other starting distances, including one very close in and one far out. Where does the blue probe stop plunging?'}
            {tutorStep === 'compare' &&
              `You guessed that ${nudgeClauses[predictedNudge]}; that ${lastSafeClauses[predictedLastSafe]}; and that ${farClauses[predictedFar]}. Compare the white marks on Pictures 1, 1b and 2 with the trails, the purple ring and the two small pictures at ${FAR_START_IN_HORIZON_RADII} horizon radii. What do you notice?`}
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
        <OrbitsNearBlackHoleExplanation predictedNudge={predictedNudge} predictedLastSafe={predictedLastSafe} predictedFar={predictedFar} />
      )}
    </div>
  )
}
