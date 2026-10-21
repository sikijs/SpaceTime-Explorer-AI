import { useState } from 'react'
import {
  DAYS_PER_MONTH,
  DAYS_PER_YEAR,
  directionAnswer,
  earthEquatorTerms,
  earthOrbitTerms,
  EARTH,
  gainMicrosecondsPerDay,
  gapSeconds,
  GPS_ALTITUDE_M,
  MOON,
  moonOrbitCrossoverAltitude,
  moonOrbitTerms,
  moonSurfaceTerms,
  NIST_2024,
  SECONDS_PER_DAY,
  sizeAnswer,
  SPEED_OF_LIGHT,
} from '../physics/lunarClocks'
import type { Direction, TimeScale } from '../physics/lunarClocks'

type TutorStep = 'observe' | 'compare' | 'conceptual' | 'explained'

interface LunarClocksTutorProps {
  directionPrediction: Direction
  sizePrediction: TimeScale
  onExplained?: () => void
}

const directionWords: Record<Direction, string> = {
  slower: 'tick slower',
  same: 'tick at the same rate',
  faster: 'tick faster',
}
const sizeWords: Record<TimeScale, string> = {
  nanosecond: 'about 56 nanoseconds (billionths of a second) apart',
  microsecond: 'about 56 microseconds (millionths of a second) apart',
  millisecond: 'about 56 milliseconds (thousandths of a second) apart',
}

// "1.09 × 10⁻¹⁶" from a number, with the exponent in superscript digits.
const SUPERSCRIPT: Record<string, string> = { '-': '⁻', '0': '⁰', '1': '¹', '2': '²', '3': '³', '4': '⁴', '5': '⁵', '6': '⁶', '7': '⁷', '8': '⁸', '9': '⁹' }
const sci = (value: number, digits = 2) => {
  const [mantissa, exponent] = value.toExponential(digits).split('e')
  return `${mantissa} × 10${String(Number(exponent)).split('').map((c) => SUPERSCRIPT[c]).join('')}`
}
const micros = (value: number, digits = 2) => `${value > 0 ? '+' : value < 0 ? '−' : ''}${Math.abs(value).toFixed(digits)} µs`
const gapText = (seconds: number) => (seconds < 1e-3 ? `${(seconds * 1e6).toFixed(1)} microseconds` : `${(seconds * 1e3).toFixed(2)} milliseconds`)

const paragraphStyle = { marginBottom: '1rem', fontSize: '0.95rem', color: '#333', lineHeight: '1.6' } as const

// The tutor of Frontier and Beyond Experiment 10. Draft wording for the owner's review (CLAUDE.md §28.1, §29), from the specification's "AI Tutor
// Behavior": observe, compare with the predictions, one conceptual question, then the explanation after the learner has responded. Every number comes
// from the physics module (lunarClocks.ts), never typed in by hand (CLAUDE.md §9); the published statements follow the specification's source table. The
// predictions are marked only in the explanation (the owner's choice for the group). The tutor does not say that time on the Moon "flows" differently in an
// absolute way: it says that two clocks tick at different rates when they are compared.
export function LunarClocksTutor({ directionPrediction, sizePrediction, onExplained }: LunarClocksTutorProps) {
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

  // Every number below is computed from the module.
  const rightDirection = directionAnswer()
  const rightSize = sizeAnswer()
  const earth = earthEquatorTerms()
  const moon = moonSurfaceTerms()
  const cSquared = SPEED_OF_LIGHT * SPEED_OF_LIGHT
  const difference = earth.total - moon.total
  const gainMoon = gainMicrosecondsPerDay(earth, moon)
  const gapMonth = gapSeconds(earth, moon, SECONDS_PER_DAY * DAYS_PER_MONTH)
  const gapYear = gapSeconds(earth, moon, SECONDS_PER_DAY * DAYS_PER_YEAR)
  const gainIss = gainMicrosecondsPerDay(earth, earthOrbitTerms(4.0e5))
  const gainGps = gainMicrosecondsPerDay(earth, earthOrbitTerms(GPS_ALTITUDE_M))
  const gainLowMoon = gainMicrosecondsPerDay(earth, moonOrbitTerms(1e5))
  const cross = moonOrbitCrossoverAltitude()
  const kmPerDay = (SPEED_OF_LIGHT * gainMoon * 1e-6) / 1000 // how far light travels in the daily gain
  const spinSpeed = EARTH.rotation * EARTH.equatorialRadius
  const ownMicros = moon.gravityOwn * SECONDS_PER_DAY * 1e6

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
          <p style={paragraphStyle}>
            {tutorStep === 'observe' &&
              'Look at Picture 1. Which of the two clocks is slowed more, and which of the three parts of the Moon’s bar is the largest? How do the two bars compare in length?'}
            {tutorStep === 'compare' &&
              `You predicted that the clock on the Moon would ${directionWords[directionPrediction]} compared with the clock on the Earth, and that after one day the two clocks would be ${sizeWords[sizePrediction]}. Now look at Table 1 and Table 2, and at Pictures 1 and 2. Do the numbers look the way you expected? What surprised you, if anything?`}
            {tutorStep === 'conceptual' &&
              'The Moon’s clock is slowed by the Moon’s gravity, by the Earth’s pull and by its own motion, and yet it gains on the Earth’s clock. Why? What would have to be different for the Moon’s clock to lose instead?'}
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
          {/* The predictions are marked here, in the explanation, and nowhere earlier, so the learner reasons first (CLAUDE.md §12). */}
          <p style={paragraphStyle}>
            <strong>Your predictions.</strong> Now that you have thought about it, here is how each one compared with the result. You predicted that the clock on the Moon would{' '}
            <em>{directionWords[directionPrediction]}</em>. The Moon’s clock is slowed by {sci(moon.total)} and the Earth’s equator clock by {sci(earth.total)}, so the Moon’s
            clock is slowed less, and the clock that is slowed less ticks <em>{directionWords[rightDirection]}</em>.{' '}
            {directionPrediction === rightDirection ? 'Your prediction matched.' : 'Your prediction did not match.'}
            {directionPrediction === 'same' &&
              ' It is a natural thought: the Moon is quiet and small, and no one feels time differ there. But the Earth’s clock sits deep in the Earth’s gravity, and the Moon’s clock sits in a much shallower one, so their rates are not the same, though the difference is tiny.'}
            {directionPrediction === 'slower' &&
              ' It is a natural thought: the Moon is far from home and moves, and moving clocks run slow. But the Moon’s motion is a small part of its slowing (the green part in Picture 1), much smaller than the gravity that slows a clock on the Earth.'}{' '}
            You also predicted that after one day the two clocks would be <em>{sizeWords[sizePrediction]}</em>. The gap after a day is {sci(difference)} × {SECONDS_PER_DAY.toLocaleString('en-US')} seconds ={' '}
            {micros(gainMoon).replace('+', '')}, which is <em>{sizeWords[rightSize]}</em>.{' '}
            {sizePrediction === rightSize ? 'Your prediction matched.' : 'Your prediction did not match.'}
            {sizePrediction === 'nanosecond' &&
              ` It is a natural thought: the fraction is only ${sci(difference)}. But a day has ${SECONDS_PER_DAY.toLocaleString('en-US')} seconds, and a fraction that small of that is tens of millionths of a second, a thousand times more than billionths.`}
            {sizePrediction === 'millisecond' &&
              ` It is a natural thought: a day is a long time. But ${micros(gainMoon).replace('+', '')} is only 0.056 milliseconds; it takes about a month to reach a millisecond and a half.`}{' '}
            Either way, the parts below explain what lies behind the numbers.
          </p>

          <p style={paragraphStyle}>
            <strong>1. How a clock’s rate is lowered.</strong> In Gravity Experiment 2 you saw that a clock in a stronger gravity ticks more slowly, and in Relativity of Time and Motion
            Experiments 3 and 4 that a moving clock ticks more slowly. Compared with a clock far from everything (not in anyone’s gravity and not moving), every clock is slowed by the
            fraction <strong>Φ ÷ c² + v² ÷ (2 × c²)</strong>. The first part is gravity: Φ measures how deep the clock sits in gravity (the sum of GM ÷ distance for each body that
            matters). The second part is motion: v is the clock’s speed. And c is the speed of light, {SPEED_OF_LIGHT.toLocaleString('en-US')} metres per second, which makes both
            parts tiny. When two clocks are compared, they tick at different rates, and the one that is slowed less ticks faster. This does not mean that time “flows” differently in an
            absolute way for anyone: each clock, looked at on its own, ticks normally.
          </p>

          <p style={paragraphStyle}>
            <strong>2. The Earth’s clock.</strong> For a clock on the Earth’s equator, gravity gives GM ÷ (R × c²) = {sci(EARTH.gm, 3)} ÷ ({sci(EARTH.equatorialRadius, 3)} × {sci(cSquared, 3)}) ={' '}
            {sci(earth.gravityOwn)}. The Earth’s spin carries the equator at {spinSpeed.toFixed(0)} metres a second, which gives only {sci(earth.speed)}. The total is {sci(earth.total)}, and
            nearly all of it is gravity.
          </p>

          <p style={paragraphStyle}>
            <strong>3. The Moon’s clock.</strong> It has three parts. The Moon’s own gravity gives {sci(MOON.gm, 3)} ÷ ({sci(MOON.radius, 3)} × {sci(cSquared, 3)}) = {sci(moon.gravityOwn)}. The Earth’s
            gravity, at the Moon’s distance of {(MOON.meanDistance / 1000).toLocaleString('en-US')} kilometres, still pulls on it and gives {sci(moon.gravityOther)}. And the Moon’s motion round the Earth, at{' '}
            {(MOON.orbitalSpeed / 1000).toFixed(3)} kilometres a second, gives {sci(moon.speed)}. The total is {sci(moon.total)}, about {(earth.total / moon.total).toFixed(0)} times less than the Earth’s. The Moon’s own gravity is
            only about a sixth of the Earth’s at the surface, and that is the main reason.
          </p>

          <p style={paragraphStyle}>
            <strong>4. The difference, and what it adds up to.</strong> The two totals differ by {sci(earth.total)} − {sci(moon.total)} = {sci(difference)}, and over a day that is{' '}
            {sci(difference)} × {SECONDS_PER_DAY.toLocaleString('en-US')} s = {micros(gainMoon).replace('+', '')}: the Moon’s clock gains that much on the Earth’s. Over a month the gap is {gapText(gapMonth)},
            and over a year {gapText(gapYear)}. For a person that is nothing: a blink takes longer. But clocks that guide navigation work in billionths of a second, and light travels about{' '}
            {(SPEED_OF_LIGHT * 1e-6).toFixed(0)} metres in a microsecond. A navigation system that let its clocks drift by {gainMoon.toFixed(0)} microseconds a day would be wrong about distances by
            about {kmPerDay.toFixed(0)} kilometres after a day. That is why lunar navigation needs a lunar time scale.
          </p>

          <p style={paragraphStyle}>
            <strong>5. Other places, and the sign.</strong> The same rule gives other answers. A clock on the International Space Station is deep in the Earth’s gravity and moving fast, so it loses{' '}
            {Math.abs(gainIss).toFixed(1)} microseconds a day on the Earth’s equator clock. A GPS clock, higher up, gains {gainGps.toFixed(1)}, which is the correction that Gravity Experiment 9 showed. A clock
            in an orbit 100 kilometres above the Moon gains {gainLowMoon.toFixed(1)}. So “faster” is not always the answer: it depends on where the clock sits and how it moves. Around the Moon, a clock
            in orbit ticks at the same rate as a clock on the surface at an altitude of {(cross / 1000).toFixed(0)} kilometres, half a Moon radius, the same balance as the GPS crossover at 1.5 Earth radii.
          </p>

          <p style={paragraphStyle}>
            <strong>6. What is calculation, and what is measurement.</strong> The figure of about 56 microseconds a day comes from a calculation by Neil Ashby and Bijunath Patla of NIST (2024), who give{' '}
            {NIST_2024.gainMicrosecondsPerDay}; this experiment’s simple version gives {gainMoon.toFixed(2)}, which agrees to within a tenth of a percent. The relativity behind it has been tested with clocks on the
            Earth, in orbit and across small heights (Experiment 9 of this group, and the GPS experiment). What has not happened, as far as the sources read for this page say, is a comparison of a clock on
            the Moon with a clock on the Earth, and ACES, the pair of clocks on the International Space Station built to test how gravity changes a clock’s rate, had not published a result on ESA’s page. Some
            sources quote 58.7 microseconds a day. That compares two coordinate time scales (a coordinate time is a time kept for a whole place, such as the Earth or the Moon, so that all the clocks there can be compared; see “Words and formulas”), and it is the {gainMoon.toFixed(0)} plus {ownMicros.toFixed(1)}, the Moon’s own gravity. In October 2026 the 28th General
            Conference on Weights and Measures asked for an international lunar time scale, tied to UTC, and gave no rate difference, and the White House asked NASA to plan a Coordinated Lunar Time by the end
            of 2026.
          </p>

          <p style={{ ...paragraphStyle, marginBottom: 0 }}>
            <strong>7. What was shown, and what was not.</strong> You saw how gravity and motion slow a clock, why a clock on the Moon is slowed less than one on the Earth, how big the difference is, and that
            the sign depends on the place. What this experiment did <strong>not</strong> do is measure a clock on the Moon, show the small changes in the rate during a month (it uses the Moon’s average distance
            and speed), include the Sun, or define a lunar time scale.
          </p>
        </div>
      )}
    </div>
  )
}
