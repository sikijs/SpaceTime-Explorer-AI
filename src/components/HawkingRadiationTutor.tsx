import { useState } from 'react'
import {
  BACKGROUND_KELVIN,
  HAWKING_PRESETS,
  SUN_MASS_KG,
  UNIVERSE_AGE_YEARS,
  balanceMassKg,
  lifetimeYears,
  massForLifetimeKg,
  runHawkingRadiationExperiment,
} from '../physics/hawkingRadiationExperiment'

type HotChoice = 'big' | 'small' | 'same'
type DirectionChoice = 'losing' | 'gaining' | 'same'
type LongerChoice = 'ten' | 'hundred' | 'thousand'
type TutorStep = 'observe' | 'compare' | 'conceptual' | 'explained'

interface HawkingRadiationTutorProps {
  predictedHot: HotChoice
  predictedDirection: DirectionChoice
  predictedLonger: LongerChoice
  // Whether each prediction matched the model, worked out once, in the experiment (the same verdicts as its Results).
  matches: { hot: boolean; direction: boolean; longer: boolean }
  onExplained?: () => void
}

const hotClauses: Record<HotChoice, string> = {
  big: 'the bigger black hole would be the hotter',
  small: 'the smaller black hole would be the hotter',
  same: 'a big and a small black hole would be at the same temperature',
}

const directionClauses: Record<DirectionChoice, string> = {
  losing: 'a black hole of 10 Suns would be losing mass',
  gaining: 'a black hole of 10 Suns would be gaining mass',
  same: "a black hole of 10 Suns' mass would stay the same",
}

const longerClauses: Record<LongerChoice, string> = {
  ten: 'a black hole of ten times the mass would take about 10 times as long to evaporate',
  hundred: 'a black hole of ten times the mass would take about 100 times as long to evaporate',
  thousand: 'a black hole of ten times the mass would take about 1,000 times as long to evaporate',
}

const SUPERSCRIPT: Record<string, string> = {
  '-': '⁻', '0': '⁰', '1': '¹', '2': '²', '3': '³', '4': '⁴', '5': '⁵', '6': '⁶', '7': '⁷', '8': '⁸', '9': '⁹',
}

// Scientific notation in words a learner can read: 1.99 × 10³⁰.
function sci(value: number): string {
  let exponent = Math.floor(Math.log10(Math.abs(value)))
  let mantissa = Number((value / 10 ** exponent).toPrecision(3))
  if (mantissa >= 10) {
    mantissa /= 10
    exponent += 1
  }
  return `${mantissa} × 10${String(exponent).split('').map((ch) => SUPERSCRIPT[ch]).join('')}`
}

// Ordinary numbers for ordinary sizes, scientific notation for very large or very small ones.
function fmt(value: number): string {
  if (value >= 1000 && value < 1e6) return Number(value.toPrecision(3)).toLocaleString('en-US')
  if (value >= 0.01 && value < 1e6) return String(Number(value.toPrecision(3)))
  return sci(value)
}

const kelvin = (k: number) => (k >= 0.01 && k < 1e4 ? `${Number(k.toPrecision(4))} K` : `${sci(k)} K`)

const paragraphStyle = { marginBottom: '1rem', fontSize: '0.95rem', color: '#333', lineHeight: '1.6' } as const

export function HawkingRadiationTutor({ predictedHot, predictedDirection, predictedLonger, matches, onExplained }: HawkingRadiationTutorProps) {
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
  const mountain = HAWKING_PRESETS.find((p) => p.id === 'mountain')!.massKg
  const tenSunsKg = 10 * SUN_MASS_KG
  const mountainResult = runHawkingRadiationExperiment(mountain)
  const sunResult = runHawkingRadiationExperiment(SUN_MASS_KG)
  const tenSunsResult = runHawkingRadiationExperiment(tenSunsKg)
  const evaporatingNowKg = massForLifetimeKg(UNIVERSE_AGE_YEARS)

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
              "Look at the thermometer and the arrows. Try a few black holes. What happens to a black hole's temperature as its mass goes up, and which side of the background's line does each one fall on?"}
            {tutorStep === 'compare' &&
              `You predicted that ${hotClauses[predictedHot]} (${verdict(matches.hot)}); that ${directionClauses[predictedDirection]} (${verdict(matches.direction)}); and that ${longerClauses[predictedLonger]} (${verdict(matches.longer)}). Comparing that to what you saw, what do you notice?`}
            {tutorStep === 'conceptual' &&
              "A black hole of 10 Suns is colder than the space around it. Hot things lose heat to cold surroundings, and cold things take heat from warm ones. So what must be happening to the black hole's mass, and why might that be a surprise?"}
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
            <strong>1. A black hole is not perfectly black.</strong> Quantum physics changes the picture of a horizon: a black
            hole gives off a very faint heat of its own. This is called Hawking radiation, after Stephen Hawking, who worked it
            out in 1974. It is stated here, not derived. You may have heard that a pair of particles appears at the edge, and one
            falls in while the other escapes. That picture is only a rough guide, and Hawking himself said so.
          </p>
          <p style={paragraphStyle}>
            <strong>2. A bigger black hole is colder.</strong> The temperature is {kelvin(sunResult.temperatureKelvin)} divided by
            the mass in Suns. So a black hole of 1 Sun is {kelvin(sunResult.temperatureKelvin)}, and one of 10 Suns has a tenth of
            that, {kelvin(tenSunsResult.temperatureKelvin)}. A small black hole is much hotter: the mountain-sized one, at{' '}
            {sci(mountain)} kg, is {kelvin(mountainResult.temperatureKelvin)}. There is no good everyday comparison for "smaller
            is hotter" here, so we will not offer a bad one. It is simply what the formula gives.
          </p>
          <p style={paragraphStyle}>
            <strong>3. The glow carries energy away, and the energy comes out of the black hole's mass.</strong> Energy and mass
            are linked: an object's energy is stored in its mass, its rest-mass energy, which you met in Experiment 8, on spinning black holes. What
            leaves in the glow is taken from the black hole's own mass, so the black hole loses mass. And the smaller it gets, the
            hotter it gets, so the faster it loses mass.
          </p>
          <p style={paragraphStyle}>
            <strong>4. Heat flows from hot to cold, so the surroundings decide.</strong> A black hole is not alone: it sits in the
            cosmic microwave background, at {BACKGROUND_KELVIN} K. A black hole hotter than that gives off more than it takes in
            and loses mass. A black hole colder than that takes in more than it gives off and gains mass. The balance point is a
            mass of about {sci(balanceMassKg())} kg, about 0.6 of the Moon's mass. That is why the 10-Sun black hole, at{' '}
            {kelvin(tenSunsResult.temperatureKelvin)}, gains mass even though it is giving off Hawking radiation.
          </p>
          <p style={paragraphStyle}>
            <strong>5. So every black hole found in space is gaining mass today,</strong> though by a tiny amount. For one of 1
            Sun to start losing mass, the background would have to get about {fmt(sunResult.coolingFactorNeeded as number)} times
            colder, and for one of 10 Suns, about {fmt(tenSunsResult.coolingFactorNeeded as number)} times colder. The background
            does keep getting colder as the universe expands (Cosmology, Experiments 3 and 10), but this experiment does not say
            when it would be cold enough.
          </p>
          <p style={paragraphStyle}>
            <strong>6. How long it would take, alone.</strong> If a black hole were alone, in perfectly cold space with nothing
            falling in, the time it would take to evaporate grows as the cube of its mass. Ten times the mass is 10 × 10 × 10 =
            1,000 times as long. In the model, 1 Sun takes {fmt(sunResult.lifetimeYears)} years and 10 Suns take{' '}
            {fmt(lifetimeYears(tenSunsKg))} years, against a universe about {sci(UNIVERSE_AGE_YEARS)} years old. A black hole
            that is evaporating just now, after the whole age of the universe, would have started with about{' '}
            {sci(evaporatingNowKg)} kg, the mass of a small mountain.
          </p>
          <p style={paragraphStyle}>
            <strong>7. What is settled, and what is not.</strong> The formulas for the temperature and the time are standard
            results. But Hawking radiation has never been seen from a real black hole, so it is a prediction of the theory. What
            happens at the very end of an evaporation, and what becomes of the information that fell in (the "information
            paradox"), is not settled.
          </p>
          <p style={paragraphStyle}>
            <strong>8. The honest limits.</strong> This was a thought experiment about one black hole that is alone, is not
            spinning and has nothing falling into it, in a background held at {BACKGROUND_KELVIN} K. The times are rough, good
            to within a few times. How fast a black hole gains mass from the background, and the last stage of an evaporation,
            were not modeled, and the time-lapse you watched was only a way of showing the direction.
          </p>
        </div>
      )}
    </div>
  )
}
