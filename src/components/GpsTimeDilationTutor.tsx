import { useState } from 'react'
import {
  ASHBY_PUBLISHED,
  ashbyDistanceKm,
  balanceRadiusCheck,
  distanceEquivalentKm,
  netFractionCheck,
  orbitSummary,
  ORBIT_PRESETS_KM,
  tutorMarking,
} from '../physics/gpsTimeDilationExperiment'
import type { MoreLessSameChoice, YesNoChoice } from '../physics/gpsTimeDilationExperiment'

// Gravity and Curved Spacetime, Experiment 9, Part 4: the tutor (docs/audit/gravity-and-curved-spacetime/09-draft-wording.md, section 6,
// approved by the owner on 2026-11-13). The observe and compare steps state no outcome and no verdict (CLAUDE.md §12, §13); the
// explanation marks each guess. Every number comes from the physics module.

type TutorStep = 'observe' | 'compare' | 'conceptual' | 'explained'

interface GpsTimeDilationTutorProps {
  speedGuess: MoreLessSameChoice
  balanceGuess: YesNoChoice
  gpsGuess: MoreLessSameChoice
  onExplained?: () => void
}

const signed = (v: number, digits = 2) => `${v >= 0 ? '+' : '−'}${Math.abs(v).toFixed(digits)}`
const exp10 = (v: number, digits: number) => {
  const e = Math.floor(Math.log10(Math.abs(v)))
  const sup = '⁰¹²³⁴⁵⁶⁷⁸⁹'
  return `${(v / 10 ** e).toFixed(digits)} × 10⁻${String(Math.abs(e)).replace(/\d/g, (d) => sup[Number(d)])}`
}
const speedGuessText = (c: MoreLessSameChoice) => (c === 'more' ? 'a bigger slowing' : c === 'less' ? 'a smaller slowing' : 'about the same slowing')
const gpsGuessText = (c: MoreLessSameChoice) => (c === 'more' ? 'faster' : c === 'less' ? 'slower' : 'the same rate')

export function GpsTimeDilationTutor({ speedGuess, balanceGuess, gpsGuess, onExplained }: GpsTimeDilationTutorProps) {
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
      <h2 style={{ marginTop: 0, marginBottom: '1rem', fontSize: '1.125rem', color: '#0066cc' }}>
        Let's reflect on what you observed
      </h2>

      {(tutorStep === 'observe' || tutorStep === 'compare' || tutorStep === 'conceptual') && (
        <div>
          <p style={{ marginBottom: '1rem', fontSize: '0.95rem', color: '#333' }}>
            {tutorStep === 'observe' &&
              'Look at the graph. Which of the three curves is closest to the zero line at the GPS altitude, and which two are far from it?'}
            {tutorStep === 'compare' &&
              'Look at your three white marks: the short line beside the violet curve, the flag on the zero line, and the ring at the GPS altitude. What do you notice when you compare each with the violet, green and amber curves?'}
            {tutorStep === 'conceptual' &&
              'GPS satellites orbit much higher than the balance altitude. Based on what you just saw, do you think that means their clocks run fast or slow, and why? Try a few altitudes of your own in Part 2 first if you want to.'}
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

      {tutorStep === 'explained' && <GpsTimeDilationExplanation speedGuess={speedGuess} balanceGuess={balanceGuess} gpsGuess={gpsGuess} />}
    </div>
  )
}

const pointStyle = { marginBottom: '1rem', fontSize: '0.95rem', color: '#333', lineHeight: '1.6' } as const

export function GpsTimeDilationExplanation({ speedGuess, balanceGuess, gpsGuess }: { speedGuess: MoreLessSameChoice; balanceGuess: YesNoChoice; gpsGuess: MoreLessSameChoice }) {
  const m = tutorMarking(speedGuess, balanceGuess, gpsGuess)
  const iss = orbitSummary(ORBIT_PRESETS_KM.iss)
  const gps = orbitSummary(ORBIT_PRESETS_KM.gps)
  const geo = orbitSummary(ORBIT_PRESETS_KM.geostationary)
  const balanceKm = m.balance.altitudeKm
  const balanceSummary = orbitSummary(balanceKm)
  const net = netFractionCheck()
  const bal = balanceRadiusCheck()
  const marked = (ok: boolean) => (ok ? 'That was right.' : 'That was not right.')
  const fmt = (km: number) => `${Math.round(km).toLocaleString('en-US')} km`
  return (
    <div>
      <p style={pointStyle}>
        <strong>Your guesses, marked.</strong> For the first question you guessed {speedGuessText(speedGuess)}. The slowing got {m.speedTrend.actual === 'less' ? 'smaller' : m.speedTrend.actual === 'more' ? 'bigger' : 'no different'} as the orbit got higher: from{' '}
        {signed(m.speedTrend.issMicroseconds)} µs/day at {fmt(iss.altitudeKm)} to {signed(m.speedTrend.geostationaryMicroseconds)} at {fmt(geo.altitudeKm)}, because a higher orbit moves more slowly.{' '}
        {marked(m.speedTrend.matches)} For the second you guessed {balanceGuess === 'yes' ? 'yes, there is a balance altitude' : 'no, there is not'}. There {m.balance.actual === 'yes' ? 'is' : 'is not'} a balance altitude, at about {fmt(balanceKm)}, where the
        net crosses zero. {marked(m.balance.matches)} For the third you guessed {gpsGuessText(gpsGuess)}. At GPS altitude the net is {signed(m.gpsClock.netMicroseconds)} µs/day: the clock runs {m.gpsClock.actual === 'more' ? 'faster' : m.gpsClock.actual === 'less' ? 'slower' : 'at the same rate'}.{' '}
        {marked(m.gpsClock.matches)}
      </p>
      <p style={pointStyle}>
        <strong>1. A satellite&rsquo;s clock is affected by both its speed and its height at the same time.</strong> Speed (the effect from &ldquo;Relativity of Time and Motion&rdquo;, Experiments 3 and 4) slows it down. Height (this group&rsquo;s Experiment 2) speeds it up.
        Like the deposit and the withdrawal in the bank-account picture, the two add.
      </p>
      <p style={pointStyle}>
        <strong>2. Which one wins depends on altitude, because a circular orbit&rsquo;s speed and altitude are linked.</strong> Lower orbits move faster (this group&rsquo;s Experiment 6). A faster satellite is slowed more, so the speed effect shrinks as the orbit rises: {gps.speedKmPerSecond.toFixed(3)} km/s at GPS
        height against {iss.speedKmPerSecond.toFixed(3)} km/s at the ISS. The height effect grows as the orbit rises, because the satellite is higher in Earth&rsquo;s gravity. One shrinks while the other grows, so at some height they are equal.
      </p>
      <p style={pointStyle}>
        <strong>3. The balance altitude.</strong> At {fmt(balanceKm)} (exactly 1.5 Earth radii from Earth&rsquo;s centre for this page&rsquo;s formulas), the speed effect is {signed(balanceSummary.speedEffectMicrosecondsPerDay)} µs/day and the height effect is{' '}
        {signed(balanceSummary.gravityEffectMicrosecondsPerDay)} µs/day, one slowing and one speeding up by the same amount, so they cancel. Ashby (2003) finds about {ASHBY_PUBLISHED.balanceRadiusKm.toLocaleString('en-US')} km from Earth&rsquo;s centre for the real balance, which is within{' '}
        {bal.percentApart.toFixed(2)} percent of this page&rsquo;s {Math.round(bal.found).toLocaleString('en-US')} km.
      </p>
      <p style={pointStyle}>
        <strong>4. Real GPS satellites orbit far above the balance altitude,</strong> so the height effect wins and their clocks run fast. The page&rsquo;s net, {exp10(net.found, 3)}, is within {net.percentApart.toFixed(2)} percent of Ashby&rsquo;s published{' '}
        {exp10(ASHBY_PUBLISHED.netFractionFaster, 4)}. Because of this, GPS satellites&rsquo; clocks are set slightly slow before launch (Ashby gives the set frequency as 10.229 999 995 43 MHz instead of 10.23 MHz), so that once in orbit they tick at the right rate as seen from
        the ground. At the ISS&rsquo;s orbit, by contrast, the speed effect wins ({signed(iss.netMicrosecondsPerDay)} µs/day), and Ashby says the same for a Space Shuttle orbit.
      </p>
      <p style={pointStyle}>
        <strong>5. The size of the correction, as a distance.</strong> {gps.netMicrosecondsPerDay.toFixed(2)} µs × 299,792,458 m/s is about {distanceEquivalentKm(gps.netMicrosecondsPerDay).toFixed(1)} km. Ashby gives about 30 cm per nanosecond of timing error, which for{' '}
        {Math.round(gps.netMicrosecondsPerDay * 1000).toLocaleString('en-US')} ns is {ashbyDistanceKm(gps.netMicrosecondsPerDay).toFixed(1)} km. NASA Space Place says uncorrected errors &ldquo;would add up to a few miles each day&rdquo;. They are not the same number and this page does
        not try to make them agree, but all three say the same thing in different units: the correction is needed.
      </p>
      <p style={pointStyle}>
        <strong>6. A real, working system.</strong> This is the first experiment in this journey that uses real numbers for Earth and the speed of light, not made-up amounts, because the effect is large enough, in something people use every day, to matter. Later experiments also use real
        figures where the sources are given.
      </p>
      <p style={{ ...pointStyle, marginBottom: 0 }}>
        <strong>7. What this page leaves out.</strong> A few real corrections are not in this page: Earth&rsquo;s spin, the orbit&rsquo;s slight oval shape and others. They are the reason for the small differences in the check-up table.
      </p>
    </div>
  )
}
