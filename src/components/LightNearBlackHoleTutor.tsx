import { useState } from 'react'
import { horizonRadiusKm } from '../physics/blackHoleSizeExperiment'
import {
  BLACK_HOLE_PRESETS,
  CRITICAL_AIM_IN_HORIZON_RADII,
  PHOTON_SPHERE_IN_HORIZON_RADII,
  lightPath,
  weakFieldBendRadians,
} from '../physics/lightNearBlackHoleExperiment'

type BendChoice = 'straight' | 'bent' | 'captured'
type CaptureChoice = 'horizon' | 'critical' | 'ten'
type JustOutsideChoice = 'small-bend' | 'swings' | 'captured-anyway'
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

// Three significant figures, with no trailing zeros ("0.5", "6.19", "98.5").
function fmt(value: number): string {
  return String(Number(value.toPrecision(3)))
}

const toDegrees = (radians: number) => (radians * 180) / Math.PI

// A length in plain units, from kilometers to billions of kilometers.
function fmtLength(km: number): string {
  if (km < 1e6) return `${fmt(km)} km`
  if (km < 1e9) return `${fmt(km / 1e6)} million km`
  return `${fmt(km / 1e9)} billion km`
}

const paragraphStyle = { marginBottom: '1rem', fontSize: '0.95rem', color: '#333', lineHeight: '1.6' } as const

export function LightNearBlackHoleTutor({
  predictedBend,
  predictedCapture,
  predictedJustOutside,
  onExplained,
}: LightNearBlackHoleTutorProps) {
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
  const farPath = lightPath(20)
  const nearPath = lightPath(3)
  const justOutside = lightPath(2.6)
  const farBend = toDegrees(farPath.bendRadians as number)
  const farSimple = toDegrees(weakFieldBendRadians(20))
  const nearBend = toDegrees(nearPath.bendRadians as number)
  const nearSimple = toDegrees(weakFieldBendRadians(3))
  const justOutsideBend = toDegrees(justOutside.bendRadians as number)
  const criticalKm = BLACK_HOLE_PRESETS.map((p) => ({
    label: p.label.replace(/^A /, 'a '),
    km: CRITICAL_AIM_IN_HORIZON_RADII * horizonRadiusKm(p.massSolarMasses),
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
              "Look at the path of the light. How does its real path differ from the dashed straight line? Now try other aim distances, including one very close in and one far out. Where does the light stop getting away?"}
            {tutorStep === 'compare' &&
              `You predicted that ${bendClauses[predictedBend]}; that ${captureClauses[predictedCapture]}; and that ${justOutsideClauses[predictedJustOutside]}. Comparing that to what you saw, what do you notice?`}
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
        <div>
          <p style={paragraphStyle}>
            <strong>1. The closer the aim, the bigger the bend.</strong> This is the same idea as in Gravity and
            Curved Spacetime, Experiment 8: light passing near a mass is bent, and light passing nearer is bent more.
            You could see it in the graph, where the blue curve rises as the aim gets smaller.
          </p>
          <p style={paragraphStyle}>
            <strong>2. The simple formula works far away and fails close in.</strong> The formula from Experiment 8
            says the bend is 2 ÷ b, in radians, where b is the aim distance in horizon radii. At an aim of 20 it gives{' '}
            {fmt(farSimple)}°, and the exact theory gives {fmt(farBend)}°, close but not equal. At an aim of 3 the
            formula gives {fmt(nearSimple)}° and the exact theory gives {fmt(nearBend)}°, more than twice as much.
            The formula was made for weak gravity, and near a black hole gravity is not weak.
          </p>
          <p style={paragraphStyle}>
            <strong>3. There is a critical aim, and closer than that the light is captured.</strong> It is{' '}
            {CRITICAL_AIM_IN_HORIZON_RADII.toFixed(3)} horizon radii, which is 3√3 ÷ 2. That is{' '}
            {criticalKm.map((p) => `${fmtLength(p.km)} for ${p.label}`).join(', ')}. A beam aimed anywhere closer than
            this is captured, even though it was aimed well outside the horizon, which is only 1 horizon radius
            from the center. The black hole catches light over a wider circle than its own edge.
          </p>
          <p style={paragraphStyle}>
            <strong>4. Why the light is caught.</strong> As the light comes in, the black hole bends its path
            inward, so it comes closer to the center than its aim. At an aim of 3 it gets as close as{' '}
            {fmt(nearPath.closestInHorizonRadii)} horizon radii. A beam aimed just inside the critical aim is bent
            so much on its way in that it reaches the horizon.
          </p>
          <p style={paragraphStyle}>
            <strong>5. Just outside the critical aim, the light swings round.</strong> A beam aimed at 2.6 gets away,
            but its direction is turned by {fmt(justOutsideBend)}°, more than a full circle. It gets as close as{' '}
            {fmt(justOutside.closestInHorizonRadii)} horizon radii. The closer the aim is to the critical aim, the
            more the light winds round before leaving.
          </p>
          <p style={paragraphStyle}>
            <strong>6. Light itself can circle a black hole.</strong> At exactly {PHOTON_SPHERE_IN_HORIZON_RADII} horizon
            radii, light can go round in a circle. The name for this circle is the <em>photon sphere</em> (a photon
            is a particle of light). It does not last, just like the unsafe orbits of Experiment 3. Think of the
            marble balanced on top of an upside-down bowl: the slightest push inward sends the light in, and the
            slightest push outward sends it out. Light aimed just outside the critical aim comes close to this
            circle and winds round it before it leaves. This is the {PHOTON_SPHERE_IN_HORIZON_RADII} horizon radii limit
            that Experiment 3 named: no circular orbit exists closer in than that for anything slower than light.
            (This is a picture for "survives a push or not", not for how gravity works.)
          </p>
          <p style={paragraphStyle}>
            <strong>7. It is the same for every black hole.</strong> As in Experiments 2 and 3, the critical aim is
            the same number of horizon radii for a small black hole and a giant one. Only the kilometers change, in
            proportion to the mass.
          </p>
          <p style={paragraphStyle}>
            <strong>8. Beyond what this experiment shows.</strong> The dark central region in pictures of black holes
            made by the Event Horizon Telescope, a network of radio telescopes, is generally described as matching
            this critical aim. This is not something you saw here. It is mentioned only to say where this idea
            turns up.
          </p>
          <p style={paragraphStyle}>
            <strong>9. The honest limits.</strong> This was a thought experiment about a thin beam of light. The
            exact equation was given, not derived, and is for a black hole that does not spin and has no electric
            charge. A spinning black hole captures light in a different circle. It was not a camera view, and nothing
            inside the horizon was modeled.
          </p>
        </div>
      )}
    </div>
  )
}
