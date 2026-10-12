import { useState } from 'react'
import {
  BLACK_HOLE_PRESETS,
  LAMP_WAVELENGTH_NM,
  lightPeriodSeconds,
  receivedWavelengthNm,
  runColorOfTheFallExperiment,
  stretchFactorSteps,
} from '../physics/colorOfTheFallExperiment'

type ColorChoice = 'same' | 'bluer' | 'limit' | 'no-limit'
type VisibleChoice = 'all-the-way' | 'near-horizon' | 'well-before'
type MassChoice = 'small' | 'big' | 'same'
type TutorStep = 'observe' | 'compare' | 'conceptual' | 'explained'

interface ColorOfTheFallTutorProps {
  predictedColor: ColorChoice
  predictedVisible: VisibleChoice
  predictedMass: MassChoice
  onExplained?: () => void
}

const colorClauses: Record<ColorChoice, string> = {
  same: 'the color would stay green',
  bluer: 'the light would turn bluer, with a shorter wavelength',
  limit: 'the light would turn redder, but only up to a point, and then stay the same',
  'no-limit': 'the light would turn redder and keep on getting redder, with no limit',
}

const visibleClauses: Record<VisibleChoice, string> = {
  'all-the-way': 'the light would stay visible all the way to the horizon, only dimmer',
  'near-horizon': 'the light would stay visible until the traveler is very close to the horizon',
  'well-before': 'the light would stop being visible light well before the horizon',
}

const massClauses: Record<MassChoice, string> = {
  small: 'the color would be much redder for the 10-Sun black hole',
  big: 'the color would be much redder for M87*',
  same: 'the color would be the same for both',
}

// Three significant figures, with no trailing zeros ("1.58", "870", "6.83").
function fmt(value: number): string {
  return String(Number(value.toPrecision(3)))
}

// A number in plain form when it is moderate, as a power of ten when it is very large or very small.
const SUPERSCRIPT: Record<string, string> = { '-': '⁻', '0': '⁰', '1': '¹', '2': '²', '3': '³', '4': '⁴', '5': '⁵', '6': '⁶', '7': '⁷', '8': '⁸', '9': '⁹' }
function fmtBig(value: number): string {
  if (value >= 0.01 && value < 1000) return fmt(value)
  const exponent = Math.floor(Math.log10(value))
  const mantissa = Number((value / 10 ** exponent).toPrecision(2))
  return `${mantissa} × 10${String(exponent)
    .split('')
    .map((ch) => SUPERSCRIPT[ch])
    .join('')}`
}

// A wavelength in the unit that fits it, from nanometers to meters.
function fmtWavelength(nm: number): string {
  if (nm < 1000) return `${fmt(nm)} nm`
  if (nm < 1e6) return `${fmt(nm / 1e3)} µm`
  if (nm < 1e9) return `${fmt(nm / 1e6)} mm`
  return `${fmt(nm / 1e9)} m`
}

const KM_PER_AU = 149_597_870.7
function fmtDistance(km: number): string {
  if (km >= 7.5e6) return `${fmt(km / KM_PER_AU)} AU`
  return `${fmt(km)} km`
}

const paragraphStyle = { marginBottom: '1rem', fontSize: '0.95rem', color: '#333', lineHeight: '1.6' } as const

export function ColorOfTheFallTutor({ predictedColor, predictedVisible, predictedMass, onExplained }: ColorOfTheFallTutorProps) {
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

  // Numbers for the explanation come from the experiment's own model, for a fall from rest at 10 horizon radii (the
  // specification's reference case), never typed in by hand.
  const reference = runColorOfTheFallExperiment('stellar-black-hole', 10)
  const at = (r: number) => receivedWavelengthNm(10, r)
  const worked = stretchFactorSteps(10, 5)
  const emittedPeriod = lightPeriodSeconds(LAMP_WAVELENGTH_NM)
  const holes = BLACK_HOLE_PRESETS.map((p) => runColorOfTheFallExperiment(p.id, 10))
  const label = (h: (typeof holes)[number]) => h.preset.label.replace(/^A /, 'a ')
  const leavesVisibleAt = reference.leavesVisibleAt as number

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
      {/* DRAFT wording, for the owner's line-by-line review (CLAUDE.md §28.1). Follows the tutor sequence in the
          specification: observe, compare with the predictions, one conceptual question, then the explanation. */}
      <h2 style={{ marginTop: 0, marginBottom: '1rem', fontSize: '1.125rem', color: '#0066cc' }}>
        Let's reflect on what you observed
      </h2>

      {(tutorStep === 'observe' || tutorStep === 'compare' || tutorStep === 'conceptual') && (
        <div>
          <p style={paragraphStyle}>
            {tutorStep === 'observe' &&
              'Look at the color strip and the graph. What happens to the orange marker as the traveler falls, and when does it leave the rainbow? Now try a different release distance and compare.'}
            {tutorStep === 'compare' &&
              `You predicted that ${colorClauses[predictedColor]}; that ${visibleClauses[predictedVisible]}; and that ${massClauses[predictedMass]}. Comparing that to what you saw, what do you notice?`}
            {tutorStep === 'conceptual' &&
              "In Experiment 6 the traveler's flashes arrived further apart. Here the traveler's lamp arrives with a longer wavelength. Why might the same number change both?"}
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
            <strong>1. A light wave is a train of crests, and they behave like the flashes.</strong> The lamp sends out one
            crest after another, at equal steps of its own clock, just as the traveler in Experiment 6 sent flashes at equal
            steps of their own watch. The time between crests is the wavelength divided by the speed of light. For{' '}
            {LAMP_WAVELENGTH_NM} nm, that is {fmtBig(emittedPeriod)} seconds. The crests reach the observer stretched apart
            by the stretch factor, exactly as the flashes were. At 5 horizon radii, from a fall from rest at 10, the
            stretch factor is {fmt(worked.stretch)}, so the time between crests becomes {fmtBig(emittedPeriod)} ×{' '}
            {fmt(worked.stretch)} = {fmtBig(emittedPeriod * worked.stretch)} seconds.
          </p>
          <p style={paragraphStyle}>
            <strong>2. So the wavelength is stretched by the same number.</strong> The wavelength is the speed of light
            times the time between crests, so it is multiplied by the stretch factor too: {LAMP_WAVELENGTH_NM} nm ×{' '}
            {fmt(worked.stretch)} = {fmtWavelength(worked.wavelengthNm)}. From the same fall the light is{' '}
            {fmtWavelength(at(10))} at the release, {fmtWavelength(at(5))} at 5 horizon radii,{' '}
            {fmtWavelength(at(2))} at 2, {fmtWavelength(at(1.01))} at 0.01 above the horizon, {fmtWavelength(at(1.001))} at
            0.001 and {fmtWavelength(at(1.0001))} at 0.0001. Each time the gap above the horizon shrinks to a tenth, the
            wavelength is about ten times longer, and it has no limit.
          </p>
          <p style={paragraphStyle}>
            <strong>3. There are two causes, and they multiply.</strong> Gravity slows the traveler's clock as seen from
            far away (Experiment 2), and the traveler is moving away, so each crest has a little farther to travel than
            the one before (Gravitational Waves, Experiment 5; think of the siren of an ambulance driving away). At 5
            horizon radii, the gravity part is {fmt(worked.gravity)}, the motion part is {fmt(worked.motion)}, and{' '}
            {fmt(worked.gravity)} × {fmt(worked.motion)} = {fmt(worked.stretch)}. Neither part alone gives the answer.
          </p>
          <p style={paragraphStyle}>
            <strong>4. This is called redshift.</strong> Visible light with a longer wavelength is redder, so a longer
            wavelength is a "shift toward red". The name stays when the light goes beyond red, into infrared and then
            microwaves. It is the same effect, and the same word, as in Gravitational Waves, Experiment 5.
          </p>
          <p style={paragraphStyle}>
            <strong>5. The light leaves visible light long before the horizon.</strong> Eyes respond to wavelengths up to
            about 750 nm. From a fall from rest at 10 horizon radii, the lamp's light passes 750 nm at{' '}
            {fmt(leavesVisibleAt)} horizon radii from the center, which is {fmt(leavesVisibleAt - 1)} horizon radii above
            the horizon, so the traveler is still far from it. After that the light is infrared, and below about 0.001
            horizon radii above the horizon, microwaves. It does not stop there: the wavelength keeps growing without limit toward
            the horizon.
          </p>
          <p style={paragraphStyle}>
            <strong>6. The color does not depend on the black hole's mass.</strong> At 5 horizon radii from the center,
            the received wavelength is {fmtWavelength(at(5))} for {label(holes[0])}, {label(holes[1])} and {label(holes[2])}.
            Only the distance in kilometers differs: {fmtDistance(5 * holes[0].horizonRadiusKm)},{' '}
            {fmtDistance(5 * holes[1].horizonRadiusKm)} and {fmtDistance(5 * holes[2].horizonRadiusKm)}. Distances in
            horizon radii are what matter, as in Experiments 2, 5 and 6.
          </p>
          <p style={paragraphStyle}>
            <strong>7. This finishes a loose end from Experiment 6.</strong> That experiment asked when the flashes would
            arrive; this one asks what the light itself would be like. It ties back to Experiment 2 (a clock near the
            horizon ticks more and more slowly, which is the gravity part) and to Gravitational Waves, Experiment 5 (a
            source moving away is stretched, which is the motion part). One more thing follows from the same number: each
            photon of light arriving carries less energy, and the photons arrive less often, both in the ratio of the
            stretch factor. That is not a statement of how bright an object would look, which depends on more than this
            experiment models.
          </p>
          <p style={paragraphStyle}>
            <strong>8. The honest limits.</strong> This was a thought experiment about a small lamp shining one color
            straight outward. Only the wavelength was modeled: not how bright the light is, what a camera or telescope
            would show, or whether a real detector could pick up light of these wavelengths. The kinds of light (visible,
            infrared, microwave, radio) are the usual ranges, and their edges are conventions. Nothing inside the horizon
            was modeled. The equations were given, not derived, and are for a black hole that does not spin and has no
            electric charge.
          </p>
        </div>
      )}
    </div>
  )
}
