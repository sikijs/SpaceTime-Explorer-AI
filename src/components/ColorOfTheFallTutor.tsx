import { useState } from 'react'
import {
  LAMP_WAVELENGTH_NM,
  colorGuessIsModelAnswer,
  lightPeriodSeconds,
  massGuessIsModelAnswer,
  massPanelColumns,
  nearHorizonReadings,
  receivedWavelengthNm,
  runPartOne,
  visibleGuessIsModelAnswer,
  wavelengthRatiosPerTenfoldGap,
  workedDistance,
  workedSteps,
} from '../physics/colorOfTheFallExperiment'
import type { ColorChoice, MassChoice, VisibleChoice } from '../physics/colorOfTheFallExperiment'
import { colorLabel, massLabel, visibleLabel } from './ColorOfTheFallChoices'

// Black Holes, Experiment 7 (audit update): the tutor (docs/audit/black-holes-and-strong-gravity/07-draft-wording.md, section 8). Its three
// questions point to the white marks by name, and its explanation opens by marking each guess (the only place that does, CLAUDE.md §12, §13).
// Every number comes from the physics module; nothing is typed by hand.

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

const SUPERSCRIPT: Record<string, string> = { '-': '⁻', '0': '⁰', '1': '¹', '2': '²', '3': '³', '4': '⁴', '5': '⁵', '6': '⁶', '7': '⁷', '8': '⁸', '9': '⁹' }
function fmtSci(value: number): string {
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

const paragraphStyle = { marginBottom: '1rem', fontSize: '0.95rem', color: '#333', lineHeight: '1.6' } as const

// The explanation: marks each guess against the module, then the physics step by step. Exported so that it can be checked without clicking.
export function ColorOfTheFallExplanation({ predictedColor, predictedVisible, predictedMass }: Omit<ColorOfTheFallTutorProps, 'onExplained'>) {
  // Numbers come from the module, for the fall of Part 1 (10-Sun black hole, from rest at 10 horizon radii), never typed in by hand.
  const run = runPartOne()
  const start = run.startInHorizonRadii
  const at = (r: number) => receivedWavelengthNm(start, r)
  const worked = workedSteps(start)
  const distance = workedDistance(start)
  const near = nearHorizonReadings(start)
  const ratios = wavelengthRatiosPerTenfoldGap(start)
  const emittedPeriod = lightPeriodSeconds(LAMP_WAVELENGTH_NM)
  const columns = massPanelColumns()
  const leavesVisibleAt = run.leavesVisibleAt as number
  const verdict = (matches: boolean) => (matches ? 'that matches what the model gives' : 'that is not what the model gives')

  return (
    <div>
      <p style={paragraphStyle}>
        <strong>Your first guess, “{colorLabel(predictedColor)}”:</strong> {verdict(colorGuessIsModelAnswer(predictedColor))}. The lamp’s own color is {LAMP_WAVELENGTH_NM} nm. The observer receives {fmtWavelength(at(start))} at the release, {fmtWavelength(at(distance))} at {distance} horizon radii, and {fmtWavelength(near[0].wavelengthNm)}, {fmtWavelength(near[1].wavelengthNm)} and {fmtWavelength(near[2].wavelengthNm)} at gaps of{' '}
        {near.map((n) => n.gap).join(', ')} above the horizon. It keeps growing as the gap shrinks. Your white marker was on the color strip and at the right-hand end of the curve on Picture 2.
      </p>
      <p style={paragraphStyle}>
        <strong>Your second guess, “{visibleLabel(predictedVisible)}”:</strong> {verdict(visibleGuessIsModelAnswer(predictedVisible))}. The light passes 750 nm, the red edge of visible light, at {fmt(leavesVisibleAt)} horizon radii from the center, which is {fmt(leavesVisibleAt - 1)} horizon radii above the horizon. Your white marker was at the 750 nm line on Picture 2.
      </p>
      <p style={paragraphStyle}>
        <strong>Your third guess, “{massLabel(predictedMass)}”:</strong> {verdict(massGuessIsModelAnswer(predictedMass))}. At {distance} horizon radii from the center the received wavelength is {fmtWavelength(columns[0].wavelengthNm)} for the 10-Sun black hole and {fmtWavelength(columns[1].wavelengthNm)} for M87*. Your white marker was in the small panel on Picture 2.
      </p>

      <p style={paragraphStyle}>
        <strong>1. A light wave is a train of crests, and they behave like the flashes.</strong> The lamp sends out one crest after another, at equal steps of its own clock, just as the traveler in Black Holes 6 sent flashes at equal steps of their own watch. The time between crests is the wavelength divided by the speed of light. For {LAMP_WAVELENGTH_NM} nm, that is {fmtSci(emittedPeriod)} seconds. The crests reach the observer stretched
        apart by the stretch factor, exactly as the flashes were: gravity slows the traveler’s clock as seen from far away, and the traveler is moving away, so each crest has a little farther to travel than the one before. At {distance} horizon radii the stretch factor is {fmt(worked.stretch)}, so the time between crests becomes {fmtSci(emittedPeriod)} × {fmt(worked.stretch)} = {fmtSci(emittedPeriod * worked.stretch)} seconds.
      </p>
      <p style={paragraphStyle}>
        <strong>2. So the wavelength is stretched by the same number.</strong> The wavelength is the speed of light times the time between crests, so it is multiplied by the stretch factor too: {LAMP_WAVELENGTH_NM} nm × {fmt(worked.stretch)} = {fmtWavelength(worked.wavelengthNm)}. From the same fall the light is {fmtWavelength(at(start))} at the release, {fmtWavelength(at(distance))} at {distance} horizon radii, {fmtWavelength(at(2))} at 2,{' '}
        {fmtWavelength(near[0].wavelengthNm)} at a gap of {near[0].gap}, {fmtWavelength(near[1].wavelengthNm)} at {near[1].gap} and {fmtWavelength(near[2].wavelengthNm)} at {near[2].gap}. Each time the gap above the horizon shrinks to a tenth, the wavelength is about {fmt(ratios[ratios.length - 1])} times longer, and it has no limit.
      </p>
      <p style={paragraphStyle}>
        <strong>3. There are two causes, and they multiply.</strong> Gravity slows the traveler’s clock as seen from far away (Black Holes 2), and the traveler is moving away (Gravitational Waves 5; think of the siren of an ambulance driving away, which is an analogy for the motion part only). At {distance} horizon radii, the gravity part is {fmt(worked.gravity)}, the motion part is {fmt(worked.motion)}, and {fmt(worked.gravity)} × {fmt(worked.motion)} ={' '}
        {fmt(worked.stretch)}. Neither part alone gives the answer.
      </p>
      <p style={paragraphStyle}>
        <strong>4. This is called redshift.</strong> Visible light with a longer wavelength is redder, so a longer wavelength is a “shift toward red”. The name stays when the light goes beyond red, into infrared and then microwaves. It is the same effect, and the same word, as in Gravitational Waves 5. Astronomers have measured it near a real black hole: ESO’s telescopes found the light of the star S2 stretched to longer wavelengths as it passed
        Sagittarius A*, by a small fraction of a percent, because S2 stays far out. The model’s lamp falls much closer.
      </p>
      <p style={paragraphStyle}>
        <strong>5. The light leaves visible light long before the horizon.</strong> Eyes respond to wavelengths up to about 750 nm (a convention; NASA’s page says the eye typically detects up to about 700 nm). From a fall from rest at {start} horizon radii, the lamp’s light passes 750 nm at {fmt(leavesVisibleAt)} horizon radii from the center, which is {fmt(leavesVisibleAt - 1)} horizon radii above the horizon, so the traveler is still far from it. After that the light is infrared, and from a gap of about 0.001 above the horizon, microwaves. It does not stop there: the
        wavelength keeps growing without limit toward the horizon.
      </p>
      <p style={paragraphStyle}>
        <strong>6. The color does not depend on the black hole’s mass.</strong> At {distance} horizon radii from the center, the received wavelength is {fmtWavelength(columns[0].wavelengthNm)} for the 10-Sun black hole and {fmtWavelength(columns[1].wavelengthNm)} for M87*. Only the distance in kilometers differs. Distances in horizon radii are what matter, as in Black Holes 2, 5 and 6.
      </p>
      <p style={paragraphStyle}>
        <strong>7. This finishes a loose end from Black Holes 6.</strong> That experiment asked when the flashes would arrive; this one asks what the light itself would be like. It ties back to Black Holes 2 (a clock near the horizon ticks more and more slowly, which is the gravity part) and to Gravitational Waves 5 (a source moving away is stretched, which is the motion part). The honest limits: this was a thought experiment about a small lamp
        shining one color straight outward. Only the wavelength was modeled, not how bright the light is, what a camera or telescope would show, or whether a real detector could pick up light of these wavelengths. The kinds of light are the usual ranges, and their edges are conventions. Nothing inside the horizon was modeled. The equations were given, not derived, and are for a black hole that does not spin and has no electric charge.
      </p>
    </div>
  )
}

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
      {/* Draft wording for the owner's approval (CLAUDE.md §28.1; the full lines are shown before they are final). Follows the tutor sequence in the specification: observe, compare
          with the predictions, one conceptual question, then the explanation. */}
      <h2 style={{ marginTop: 0, marginBottom: '1rem', fontSize: '1.125rem', color: '#0066cc' }}>Let's reflect on what you observed</h2>

      {(tutorStep === 'observe' || tutorStep === 'compare' || tutorStep === 'conceptual') && (
        <div>
          <p style={paragraphStyle}>
            {tutorStep === 'observe' &&
              'Look at the color strip and the graph. What happens to the orange marker as the traveler falls, and when does it leave the rainbow? Then look at your white marks on Pictures 1 and 2.'}
            {tutorStep === 'compare' &&
              `Your first guess, "${colorLabel(predictedColor)}", is the white box on the color strip and at the right-hand end of the curve on Picture 2. Your second, "${visibleLabel(predictedVisible)}", is on Picture 2 at the 750 nm line. Your third, "${massLabel(predictedMass)}", is in the small panel on Picture 2. You guessed that ${colorClauses[predictedColor]}; that ${visibleClauses[predictedVisible]}; and that ${massClauses[predictedMass]}. Compare each white mark with the pictures. What do you notice?`}
            {tutorStep === 'conceptual' &&
              "In Black Holes 6 the traveler's flashes arrived further apart. Here the traveler's lamp arrives with a longer wavelength. Why might the same number change both?"}
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

      {tutorStep === 'explained' && <ColorOfTheFallExplanation predictedColor={predictedColor} predictedVisible={predictedVisible} predictedMass={predictedMass} />}
    </div>
  )
}
