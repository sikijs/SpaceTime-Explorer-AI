import { useState } from 'react'
import {
  CRITICAL_AIM_IN_HORIZON_RADII,
  PHOTON_SPHERE_IN_HORIZON_RADII,
  answerCheckPaths,
  bendDegrees,
  bendGuessIsModelAnswer,
  captureGuessIsModelAnswer,
  criticalAimRows,
  justOutsideGuessIsModelAnswer,
  lightPath,
  weakFieldBendDegrees,
} from '../physics/lightNearBlackHoleExperiment'
import type { BendChoice, CaptureChoice, JustOutsideChoice } from '../physics/lightNearBlackHoleExperiment'
import { CRITICAL_AIM_TEXT, formatLength, formatNumber } from './LightNearBlackHolePictures'

// Black Holes, Experiment 4 (audit update): the tutor (docs/audit/black-holes-and-strong-gravity/04-draft-wording.md, section 8, approved by the owner
// on 2026-11-17). Its three questions point to the white marks by name, and its explanation marks each guess (the only place that does, CLAUDE.md §12,
// §13). Every number comes from the physics module.

type TutorStep = 'observe' | 'compare' | 'conceptual' | 'explained'

interface LightNearBlackHoleTutorProps {
  predictedBend: BendChoice
  predictedCapture: CaptureChoice
  predictedJustOutside: JustOutsideChoice
  onExplained?: () => void
}

const bendClauses: Record<BendChoice, string> = {
  straight: 'a beam aimed to pass 5 horizon radii from the center would go straight on, barely changed',
  bent: 'a beam aimed to pass 5 horizon radii from the center would be bent noticeably and then escape',
  captured: 'a beam aimed to pass 5 horizon radii from the center would be captured',
}
const captureClauses: Record<CaptureChoice, string> = {
  horizon: 'light is captured only if it is aimed at the horizon itself',
  critical: 'light must be aimed within about 2.6 horizon radii of the center to be captured',
  ten: 'light must be aimed within about 10 horizon radii of the center to be captured',
}
const justOutsideClauses: Record<JustOutsideChoice, string> = {
  'small-bend': 'light aimed only a bit farther out than the capture distance would pass with only a small bend',
  swings: 'light aimed only a bit farther out than the capture distance would swing right round the black hole, turning by more than 180°, and then escape',
  'captured-anyway': 'light aimed only a bit farther out than the capture distance would be captured anyway',
}

const paragraphStyle = { marginBottom: '1rem', fontSize: '0.95rem', color: '#333', lineHeight: '1.6' } as const

// The explanation: marks each guess against the module's numbers, then the physics step by step. Exported so that it can be checked without clicking.
export function LightNearBlackHoleExplanation({ predictedBend, predictedCapture, predictedJustOutside }: Omit<LightNearBlackHoleTutorProps, 'onExplained'>) {
  const checks = answerCheckPaths()
  const farBend = bendDegrees(lightPath(20)) as number
  const farSimple = weakFieldBendDegrees(20)
  const nearPath = lightPath(3)
  const nearBend = bendDegrees(nearPath) as number
  const nearSimple = weakFieldBendDegrees(3)
  const justOutside = checks.justOutside
  const justOutsideBend = bendDegrees(justOutside) as number
  const fiveBend = bendDegrees(checks.five) as number
  const holes = criticalAimRows()
  const verdict = (matches: boolean) => (matches ? 'That matches the model' : 'That differs from the model')

  return (
    <div>
      <p style={paragraphStyle}>
        <strong>First guess.</strong> You guessed that {bendClauses[predictedBend]}. {verdict(bendGuessIsModelAnswer(predictedBend))}: a beam aimed at 5 horizon radii is bent by {formatNumber(fiveBend)}°, comes within {formatNumber(checks.five.closestInHorizonRadii)} horizon radii of
        the center, and then escapes. The simple formula would have said {formatNumber(weakFieldBendDegrees(5))}°. Your white marker was on the left picture and at an aim of 5 on the graph.
      </p>
      <p style={paragraphStyle}>
        <strong>Second guess.</strong> You guessed that {captureClauses[predictedCapture]}. {verdict(captureGuessIsModelAnswer(predictedCapture))}: the critical aim is {CRITICAL_AIM_TEXT} horizon radii. In this model a beam aimed at 2.5 {checks.insideCritical.outcome === 'captured' ? 'is captured' : 'escapes'}
        , and one aimed at 2 {checks.two.outcome === 'captured' ? 'is captured' : 'escapes'}, though both are aimed outside the horizon (1 horizon radius). A beam aimed at 2.7 escapes, bent by {formatNumber(bendDegrees(checks.outsideCritical) as number)}°, and one aimed at 10 escapes, bent by{' '}
        {formatNumber(bendDegrees(checks.ten) as number)}°. Your white ring and line were at the distance you chose; the green ring and line are the critical aim.
      </p>
      <p style={paragraphStyle}>
        <strong>Third guess.</strong> You guessed that {justOutsideClauses[predictedJustOutside]}. {verdict(justOutsideGuessIsModelAnswer(predictedJustOutside))}: a beam aimed at 2.6, just outside the critical aim, escapes, but its direction is turned by {formatNumber(justOutsideBend)}°, which
        is more than a full circle (360°). It comes as near as {formatNumber(justOutside.closestInHorizonRadii)} horizon radii. Your white marker was on the right picture and at an aim of 2.6 on the graph.
      </p>

      <p style={paragraphStyle}>
        <strong>1. The closer the aim, the bigger the bend.</strong> This is the same idea as in Gravity and Curved Spacetime, Experiment 8: light passing near a mass is bent, and light passing nearer is bent more. You could see it in the graph, where the blue curve rises as the aim gets
        smaller.
      </p>
      <p style={paragraphStyle}>
        <strong>2. The simple formula works far away and fails close in.</strong> The formula from Experiment 8 gives a first approximation of 2 ÷ b for the bend, in radians, where b is the aim distance in horizon radii. At an aim of 20 it gives {formatNumber(farSimple)}°, and the exact
        theory gives {formatNumber(farBend)}°, close but not equal. At an aim of 3 the formula gives {formatNumber(nearSimple)}° and the exact theory gives {formatNumber(nearBend)}°, more than twice as much. The formula was made for weak gravity, and near a black hole gravity is not weak.
      </p>
      <p style={paragraphStyle}>
        <strong>3. There is a critical aim, and closer than that the light is captured.</strong> It is {CRITICAL_AIM_TEXT} horizon radii, which is 3√3 ÷ 2. That is{' '}
        {holes.map((h) => `${formatLength(h.criticalAimKm)} for ${h.preset.label.replace(/^A /, 'a ')}`).join(', ')}. A beam aimed anywhere closer than this is captured, even though it was aimed well outside the horizon, which is only 1 horizon radius from the center. The black hole
        catches light over a wider circle than its own edge.
      </p>
      <p style={paragraphStyle}>
        <strong>4. Why the light is caught.</strong> As the light comes in, the black hole bends its path inward, so it comes closer to the center than its aim. At an aim of 3 it gets as close as {formatNumber(nearPath.closestInHorizonRadii)} horizon radii. A beam aimed just inside the
        critical aim is bent so much on its way in that it reaches the horizon.
      </p>
      <p style={paragraphStyle}>
        <strong>5. Just outside the critical aim, the light swings round.</strong> A beam aimed at 2.6 gets away, but its direction is turned by {formatNumber(justOutsideBend)}°, more than a full circle. It gets as close as {formatNumber(justOutside.closestInHorizonRadii)} horizon radii. The
        closer the aim is to the critical aim, the more the light winds round before leaving.
      </p>
      <p style={paragraphStyle}>
        <strong>6. Light itself can circle a black hole.</strong> At exactly {PHOTON_SPHERE_IN_HORIZON_RADII} horizon radii, light can go round in a circle. The name for this circle is the <em>photon sphere</em> (a photon is a particle of light). It does not last, just like the unsafe
        orbits of Experiment 3. Think of the marble balanced on top of an upside-down bowl: the slightest push inward sends the light in, and the slightest push outward sends it out. Light aimed just outside the critical aim comes close to this circle and winds round it before it leaves.
        This is the {PHOTON_SPHERE_IN_HORIZON_RADII} horizon radii limit that Experiment 3 named: no circular orbit exists closer in than that for anything slower than light. (This is a picture for “survives a push or not”, not for how gravity works.)
      </p>
      <p style={paragraphStyle}>
        <strong>7. It is the same for every black hole.</strong> As in Experiments 2 and 3, the critical aim is the same number of horizon radii for a small black hole and a giant one. Only the kilometers change, in proportion to the mass.
      </p>
      <p style={paragraphStyle}>
        <strong>8. Beyond what this experiment shows.</strong> The Event Horizon Telescope, a network of radio telescopes, has made pictures of two black holes: a ring of glowing gas around a dark middle. ESO’s release on the first one (M87*, 2019) calls the dark middle “the black hole’s
        shadow” and says it is caused by “the gravitational bending and capture of light by the event horizon”. ESO says the black hole’s edge is “around 2.5 times smaller than the shadow it casts”, and NASA calls the shadow “roughly twice as big” as the black hole. Your pictures give{' '}
        {formatNumber(CRITICAL_AIM_IN_HORIZON_RADII)} for the same ratio, which those wordings round. The EHT’s measured ring, 42 ± 3 millionths of an arcsecond across, is the glowing gas around the dark region, not the dark region itself. This is not something you saw here. It is
        mentioned only to say where this idea turns up.
      </p>
      <p style={paragraphStyle}>
        <strong>9. The honest limits.</strong> This was a thought experiment about a thin beam of light. The exact equation was given, not derived, and is for a black hole that does not spin and has no electric charge. This page does not model a spinning black hole. It was not a camera view,
        and nothing inside the horizon was modeled.
      </p>
    </div>
  )
}

export function LightNearBlackHoleTutor({ predictedBend, predictedCapture, predictedJustOutside, onExplained }: LightNearBlackHoleTutorProps) {
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
        marginTop: '1rem',
        padding: '1.5rem',
        border: '1px solid #d9e8f5',
        borderRadius: '8px',
        backgroundColor: '#f0f7ff',
      }}
    >
      <h2 style={{ marginTop: 0, marginBottom: '1rem', fontSize: '1.125rem', color: '#0066cc' }}>Let's reflect on what you observed</h2>

      {(tutorStep === 'observe' || tutorStep === 'compare' || tutorStep === 'conceptual') && (
        <div>
          <p style={paragraphStyle}>
            {tutorStep === 'observe' &&
              'Look at the two beams in Picture 1 and the white YOUR GUESS marks on Pictures 1 and 2. How does each beam’s real path differ from the dashed straight line? Now go to Part 2 and try other aims, including one very close in and one far out. Where does the light stop getting away?'}
            {tutorStep === 'compare' &&
              `You guessed that ${bendClauses[predictedBend]}; that ${captureClauses[predictedCapture]}; and that ${justOutsideClauses[predictedJustOutside]}. Compare the white marks on Pictures 1 and 2 with the blue trails, the green ring and the graph. What do you notice?`}
            {tutorStep === 'conceptual' &&
              'Light has no mass, yet gravity bends it, and a black hole can even trap it. If you aim light so that it just misses the horizon, why do you think it can still be caught?'}
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
        <LightNearBlackHoleExplanation predictedBend={predictedBend} predictedCapture={predictedCapture} predictedJustOutside={predictedJustOutside} />
      )}
    </div>
  )
}
