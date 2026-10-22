import { useState } from 'react'
import {
  ASTRONOMICAL_UNIT,
  closestApproachDistance,
  closestApproachTerms,
  earthMatchDistance,
  earthTerms,
  EARTH,
  effectsAnswer,
  farOrbitDistance,
  gapSeconds,
  lagMillisecondsPerDay,
  lagOverOneOrbitSeconds,
  orbitAverageTerms,
  PARKER,
  orbitSpeed,
  runFastestSpacecraft,
  SECONDS_PER_DAY,
  sizeAnswer,
  speedAt,
  SPEED_OF_LIGHT,
  SUN,
} from '../physics/fastestSpacecraft'
import type { Effects, TimeScale } from '../physics/fastestSpacecraft'

type TutorStep = 'observe' | 'compare' | 'conceptual' | 'explained'

interface FastestSpacecraftTutorProps {
  effectsPrediction: Effects
  sizePrediction: TimeScale
  onExplained?: () => void
}

const effectsWords: Record<Effects, string> = {
  'both slow': 'both slow the clock',
  'both speed up': 'both speed the clock up',
  'work against each other': 'work against each other',
}
const sizeWords: Record<TimeScale, string> = {
  microsecond: 'about 35 microseconds (millionths of a second) apart',
  millisecond: 'about 35 milliseconds (thousandths of a second) apart',
  second: 'about 35 seconds apart',
}

// "1.09 × 10⁻¹⁶" from a number, with the exponent in superscript digits.
const SUPERSCRIPT: Record<string, string> = { '-': '⁻', '0': '⁰', '1': '¹', '2': '²', '3': '³', '4': '⁴', '5': '⁵', '6': '⁶', '7': '⁷', '8': '⁸', '9': '⁹' }
const sci = (value: number, digits = 2) => {
  const [mantissa, exponent] = value.toExponential(digits).split('e')
  return `${mantissa} × 10${String(Number(exponent)).split('').map((c) => SUPERSCRIPT[c]).join('')}`
}

const paragraphStyle = { marginBottom: '1rem', fontSize: '0.95rem', color: '#333', lineHeight: '1.6' } as const

// The tutor of Frontier and Beyond Experiment 11. Draft wording for the owner's review (CLAUDE.md §28.1, §29), from the specification's "Introduction,
// pictures and results" and the group's tutor pattern: observe, compare with the predictions, one conceptual question, then the explanation after the learner has
// responded. Every number comes from the physics module (fastestSpacecraft.ts), never typed in by hand (CLAUDE.md §9); the published statements follow the
// specification's source table. The predictions are marked only in the explanation (the owner's choice for the group). The tutor does not say that time near the Sun
// "flows" differently in an absolute way: it says that two clocks tick at different rates when they are compared.
export function FastestSpacecraftTutor({ effectsPrediction, sizePrediction, onExplained }: FastestSpacecraftTutorProps) {
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
  const rightEffects = effectsAnswer()
  const rightSize = sizeAnswer()
  const earth = earthTerms()
  const probe = closestApproachTerms()
  const c2 = SPEED_OF_LIGHT * SPEED_OF_LIGHT
  const difference = probe.total - earth.total
  const lagDay = lagMillisecondsPerDay(earth, probe)
  const near = closestApproachDistance()
  const far = farOrbitDistance()
  const farResult = runFastestSpacecraft(far, SECONDS_PER_DAY)
  const matchAu = earthMatchDistance() / ASTRONOMICAL_UNIT
  const average = orbitAverageTerms()
  const orbitSeconds = PARKER.periodDays * SECONDS_PER_DAY
  const atClosest = gapSeconds(earth, probe, orbitSeconds)
  const actual = lagOverOneOrbitSeconds()
  const farSpeed = speedAt(far)
  const sunAtEarth = SUN.gm / (EARTH.orbitalDistance * c2)
  const earthOwn = EARTH.gm / (EARTH.equatorialRadius * c2)
  const ovalNearSpeed = orbitSpeed(near) / 1000
  const kmOfLight = (SPEED_OF_LIGHT * (lagDay / 1000)) / 1000 // how far light travels in the daily lag
  const fractionForSeconds = 35 / SECONDS_PER_DAY // the fraction that would give about 35 seconds a day
  const fractionForMicroseconds = 35e-6 / SECONDS_PER_DAY // and about 35 microseconds a day

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
              'Look at Picture 1. Which of the two clocks is slowed more? In the probe’s bar, how do the lavender part (gravity) and the green part (motion) compare? How long is the probe’s bar next to the Earth’s?'}
            {tutorStep === 'compare' &&
              `You predicted that, at the closest point, the Sun’s gravity and the probe’s speed would ${effectsWords[effectsPrediction]}, and that after one day the two clocks would be ${sizeWords[sizePrediction]}. Now look at Table 1 and Table 2, and at Pictures 1, 2 and 3. Do the numbers look the way you expected? What surprised you, if anything?`}
            {tutorStep === 'conceptual' &&
              'At the closest point, gravity and motion slow the probe’s clock by almost the same amount. What do you think happens to each of them as the probe moves out toward the far end of its orbit? And do you think its clock could ever tick faster than the clock on the Earth?'}
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
            <strong>Your predictions.</strong> Now that you have thought about it, here is how each one compared with the result. You predicted that gravity and speed would{' '}
            <em>{effectsWords[effectsPrediction]}</em>. At the closest point the Sun’s gravity gives {sci(probe.gravity)} and the probe’s speed gives {sci(probe.speed)}; both are
            positive numbers, and a positive number means a slower clock, so they <em>{effectsWords[rightEffects]}</em>.{' '}
            {effectsPrediction === rightEffects ? 'Your prediction matched.' : 'Your prediction did not match.'}
            {effectsPrediction === 'work against each other' &&
              ` It is a natural thought, because in Experiment 10 the Moon’s clock was a case where two effects pulled in different directions. But there the question was how the Moon’s clock compared with the Earth’s, and the Moon’s gravity is weaker than the Earth’s. Near the Sun the probe sits in a much deeper gravity than the Earth’s clock (${sci(probe.gravity)} against ${sci(earth.gravity)}) and moves much faster (${sci(probe.speed)} against ${sci(earth.speed)}), so both effects go the same way.`}
            {effectsPrediction === 'both speed up' &&
              ` A clock is sped up only when it sits in a weaker gravity than the clock it is compared with, or moves more slowly than it. Near the Sun it is the opposite: the probe is deeper in gravity and moving faster than the Earth’s clock, so both effects slow it.`}{' '}
            You also predicted that after one day the two clocks would be <em>{sizeWords[sizePrediction]}</em>. The gap after a day is {sci(difference)} × {SECONDS_PER_DAY.toLocaleString('en-US')} seconds
            = {(lagDay / 1000).toFixed(4)} seconds, which is {lagDay.toFixed(1)} milliseconds: <em>{sizeWords[rightSize]}</em>.{' '}
            {sizePrediction === rightSize ? 'Your prediction matched.' : 'Your prediction did not match.'}
            {sizePrediction === 'microsecond' &&
              ` It is a natural thought, because in Experiment 10 a clock on the Moon gained tens of microseconds a day. But that fraction was about a thousand times smaller. Here the fraction is ${sci(difference)}, and a fraction that size gives thousandths of a second a day. A fraction of ${sci(fractionForMicroseconds)} would give 35 microseconds.`}
            {sizePrediction === 'second' &&
              ` It is a natural thought: the probe is fast and the Sun’s gravity is strong. But 35 seconds a day would need a fraction of ${sci(fractionForSeconds)} (about ${(fractionForSeconds / difference).toFixed(0)} times bigger than ${sci(difference)}), and even this probe is moving at only about ${((PARKER.closestApproachSpeed / SPEED_OF_LIGHT) * 100).toFixed(2)} percent of the speed of light.`}{' '}
            Either way, the parts below explain what lies behind the numbers.
          </p>

          <p style={paragraphStyle}>
            <strong>1. Two parts that add up.</strong> As in Experiment 10, compared with a clock far from everything every clock is slowed by the fraction{' '}
            <strong>Φ ÷ c² + v² ÷ (2 × c²)</strong>: the first part is gravity, the second is motion, and c is the speed of light, {SPEED_OF_LIGHT.toLocaleString('en-US')} metres a second.
            At the closest point the probe is {(near / 1e9).toFixed(2)} million kilometres from the Sun’s centre and moving at {(PARKER.closestApproachSpeed / 1000).toFixed(2)} kilometres a
            second. Gravity gives GM ÷ (r × c²) = {sci(SUN.gm, 3)} ÷ ({sci(near, 3)} × {sci(c2, 3)}) = {sci(probe.gravity)}. Motion gives v² ÷ (2 × c²) = ({PARKER.closestApproachSpeed.toLocaleString('en-US')})² ÷
            (2 × {sci(c2, 3)}) = {sci(probe.speed)}. Together: {sci(probe.total)}. Think of two small leaks in a bucket: each one lowers the water by its own amount, and
            together they lower it by the sum. Here the two leaks are almost the same size, which is unusual: for the Earth’s clock (Picture 1) gravity’s part is about {(earth.gravity / earth.speed).toFixed(1)} times motion’s.
          </p>

          <p style={paragraphStyle}>
            <strong>2. Why the answer is 35 milliseconds and not 36.</strong> The probe’s clock is compared with a clock on the Earth, and that clock is slowed too. The Earth’s clock sits in the Earth’s
            own gravity ({sci(earthOwn)}) and, as the Earth is {(EARTH.orbitalDistance / 1e9).toFixed(0)} million kilometres from the Sun, in the Sun’s gravity ({sci(sunAtEarth)}); and it moves round
            the Sun at {(EARTH.orbitalSpeed / 1000).toFixed(2)} kilometres a second, which gives {sci(earth.speed)} (with the Earth’s spin, which adds very little). In all, {sci(earth.total)}. The difference is{' '}
            {sci(probe.total)} − {sci(earth.total)} = {sci(difference)}, and {sci(difference)} × {SECONDS_PER_DAY.toLocaleString('en-US')} s = {lagDay.toFixed(2)} ms. Compared with a clock far from everything
            the probe’s clock would fall behind by {(probe.total * SECONDS_PER_DAY * 1000).toFixed(1)} milliseconds a day.
          </p>

          <p style={paragraphStyle}>
            <strong>3. Why the probe’s clock does not keep one rate.</strong> The probe goes round the Sun on an oval, about every {PARKER.periodDays} days. At its far end it is {(far / near).toFixed(1)} times farther
            from the Sun, so gravity’s part falls from {sci(probe.gravity)} to {sci(farResult.terms.gravity)}, about {(probe.gravity / farResult.terms.gravity).toFixed(0)} times smaller. Motion’s part falls much
            more, from {sci(probe.speed)} to {sci(farResult.terms.speed)}, about {(probe.speed / farResult.terms.speed).toFixed(0)} times smaller, because the probe slows down from {(PARKER.closestApproachSpeed / 1000).toFixed(0)} to
            {' '}{(farSpeed / 1000).toFixed(0)} kilometres a second, and the motion part depends on the <em>square</em> of the speed (twice the speed gives four times the part). It is like a ball thrown upward: fast near the hand,
            slow at the top. The probe falls toward the Sun the way a ball falls toward the ground, and speeds up as it goes. Far out, gravity’s part is the larger one; at the closest point they are nearly equal.
          </p>

          <p style={paragraphStyle}>
            <strong>4. Could the probe’s clock tick faster than the Earth’s?</strong> In this model, yes, but only a very little. Picture 3 shows the probe’s lag falling to zero at {matchAu.toFixed(2)} AU and
            going slightly below it. At the far end ({(far / ASTRONOMICAL_UNIT).toFixed(2)} AU) the probe’s clock is slowed by {sci(farResult.terms.total)} (gravity {sci(farResult.terms.gravity)}, motion {sci(farResult.terms.speed)}),
            while the Earth’s clock is slowed by {sci(earth.total)}. The Earth is farther from the Sun, so the Sun’s gravity is weaker there, but the Earth moves much faster ({(EARTH.orbitalSpeed / 1000).toFixed(2)} kilometres a second
            against {(farSpeed / 1000).toFixed(0)}), and that outweighs it. The difference is {sci(farResult.terms.total - earth.total)} × {SECONDS_PER_DAY.toLocaleString('en-US')} s ={' '}
            {farResult.lagMillisecondsPerDay.toFixed(2)} milliseconds a day: the probe’s clock is ahead, by about a tenth of a millisecond. That number rests on the plain oval and on the Earth’s average speed, so it is the size of the effect
            in this model, not a measured value. The point to take is the shape: the lag is large near the Sun, shrinks quickly, and is close to zero over most of the orbit.
          </p>

          <p style={paragraphStyle}>
            <strong>5. What the lag adds up to over an orbit.</strong> If the closest-point rate lasted all {PARKER.periodDays} days, the probe’s clock would fall behind by {lagDay.toFixed(2)} ms × {PARKER.periodDays} ={' '}
            {atClosest.toFixed(2)} seconds. But the probe spends only a short time near the Sun. Over a whole oval orbit the two parts average GM ÷ (a × c²) and GM ÷ (2 × a × c²), where a is half the oval’s longest width, which together
            are {sci(average.total)} (against the Earth’s {sci(earth.total)}). The difference times {PARKER.periodDays} × {SECONDS_PER_DAY.toLocaleString('en-US')} s is {actual.toFixed(3)} seconds, about {(atClosest / actual).toFixed(0)} times less.
            It is like a car that goes fast for only a short stretch of a long drive: its average speed is far below its top speed, and the trip’s time depends on the average. So “the probe’s clock loses 35 milliseconds a day” is
            true at one moment of the orbit, not of the whole journey.
          </p>

          <p style={paragraphStyle}>
            <strong>6. What is calculation, and what is measurement.</strong> The speed and distance are NASA’s: {(PARKER.closestApproachAltitude / 1e9).toFixed(3)} million kilometres above the Sun’s surface at{' '}
            {(PARKER.closestApproachSpeed / 1000).toFixed(2)} kilometres a second on 24 December 2024, matched on the passes since, the 29th on 4 September 2026. The formula is the one that has been tested with clocks on the Earth and in orbit
            (Gravity Experiments 2 and 9, and Experiment 9 of this group). The lag of {lagDay.toFixed(0)} milliseconds a day is what that formula gives for those numbers. As far as the sources read for this page say, no one has reported a measurement
            of it with the probe’s own clock, and this experiment does not say whether, or how, the mission accounts for it. For scale only: light travels about {(SPEED_OF_LIGHT / 1000).toLocaleString('en-US')} kilometres a
            second, so a timing error of {lagDay.toFixed(0)} milliseconds is the time light takes to travel about {kmOfLight.toLocaleString('en-US', { maximumFractionDigits: 0 })} kilometres. The oval is also only a model: the real orbit is not exactly an oval, and NASA’s speed at the
            closest point is {(PARKER.closestApproachSpeed / 1000).toFixed(2)} kilometres a second against the oval’s {ovalNearSpeed.toFixed(1)}, so the points on the oval and the closest point do not lie exactly on one curve.
          </p>

          <p style={{ ...paragraphStyle, marginBottom: 0 }}>
            <strong>7. What was shown, and what was not.</strong> You saw that near the Sun gravity and motion both slow a clock, and by almost equal amounts, that against a clock on the Earth this comes to about {lagDay.toFixed(0)} milliseconds a day at the
            closest point, and that this is not a steady rate round the orbit. What this experiment did <strong>not</strong> do is measure the probe’s clock, follow the real orbit (the planets’ pulls and the passes by Venus), include the Sun’s
            spin or shape, or say how the mission keeps or corrects its clock.
          </p>
        </div>
      )}
    </div>
  )
}
