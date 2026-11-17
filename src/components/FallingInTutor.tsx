import { useState } from 'react'
import {
  LN_10,
  endGuessIsModelAnswer,
  farClockGuessIsModelAnswer,
  farClockIncreasesPerTenfoldGap,
  nearHorizonReadings,
  runPartOne,
  stretchGuessIsModelAnswer,
  stretchInG,
  threeHoleRows,
  travelerClock,
} from '../physics/fallingInExperiment'
import type { EndChoice, FarClockChoice, StretchChoice } from '../physics/fallingInExperiment'
import { formatBig, formatFour, formatNumber, formatSeconds } from './FallingInPictures'

// Black Holes, Experiment 5 (audit update): the tutor (docs/audit/black-holes-and-strong-gravity/05-draft-wording.md, section 8, approved by the owner
// on 2026-11-17). Its three questions point to the white marks by name, and its explanation marks each guess (the only place that does, CLAUDE.md §12,
// §13). Every number comes from the physics module.

type TutorStep = 'observe' | 'compare' | 'conceptual' | 'explained'

interface FallingInTutorProps {
  predictedEnd: EndChoice
  predictedFarClock: FarClockChoice
  predictedStretch: StretchChoice
  onExplained?: () => void
}

const endClauses: Record<EndChoice, string> = {
  finite: "the trip to the horizon would take a finite time on the traveler's own watch",
  never: "the trip to the horizon would never finish on the traveler's own watch",
  depends: 'the trip to the horizon would end for some black holes and not for others',
}

const farClockClauses: Record<FarClockChoice, string> = {
  same: "the far-away clock would read about the same as the traveler's watch",
  settles: 'the far-away clock would read somewhat more, and then settle',
  'no-limit': 'the far-away clock would read later and later, without limit, as the traveler nears the horizon',
}

const stretchClauses: Record<StretchChoice, string> = {
  small: 'the stretching at the horizon would be much stronger at the small black hole',
  same: 'the stretching at the horizon would be about the same for the small and the giant black hole',
  giant: 'the stretching at the horizon would be much stronger at the giant black hole',
}

const paragraphStyle = { marginBottom: '1rem', fontSize: '0.95rem', color: '#333', lineHeight: '1.6' } as const

// The explanation: marks each guess against the module's numbers, then the physics step by step. Exported so that it can be checked without clicking.
export function FallingInExplanation({ predictedEnd, predictedFarClock, predictedStretch }: Omit<FallingInTutorProps, 'onExplained'>) {
  const run = runPartOne()
  const holes = threeHoleRows()
  const [stellar, sgr, m87] = holes
  const near = nearHorizonReadings(10)
  const increases = farClockIncreasesPerTenfoldGap(10)
  const halfDistanceRatio = stretchInG(10, 1) / stretchInG(10, 2)
  const verdict = (matches: boolean) => (matches ? 'That matches the model' : 'That differs from the model')
  const label = (h: (typeof holes)[number]) => h.preset.label.replace(/^A /, 'a ')

  return (
    <div>
      <p style={paragraphStyle}>
        <strong>First guess.</strong> You guessed that {endClauses[predictedEnd]}. {verdict(endGuessIsModelAnswer(predictedEnd))}: from 10 horizon radii the traveler’s own clock reaches the horizon after {formatFour(run.travelerClockAtHorizon)} light-times. That is the same for every black hole; in ordinary
        units it is {formatSeconds(stellar.tripSeconds)} for {label(stellar)}, {formatSeconds(sgr.tripSeconds)} for {label(sgr)} and {formatSeconds(m87.tripSeconds)} for {label(m87)}. Your white marker was on Picture 2.
      </p>
      <p style={paragraphStyle}>
        <strong>Second guess.</strong> You guessed that {farClockClauses[predictedFarClock]}. {verdict(farClockGuessIsModelAnswer(predictedFarClock))}: at gaps of 0.01, 0.001 and 0.0001 horizon radii above the horizon the far-away clock reads {near.map((n) => formatFour(n.farAwayClock)).join(', ')} light-times, and the traveler’s
        own clock reads {near.map((n) => String(Number(n.travelerClock.toPrecision(5)))).join(', ')}. Each tenfold closing of the gap adds about {formatFour(increases[increases.length - 1])} to the far-away clock. Your white marker was on Picture 2.
      </p>
      <p style={paragraphStyle}>
        <strong>Third guess.</strong> You guessed that {stretchClauses[predictedStretch]}. {verdict(stretchGuessIsModelAnswer(predictedStretch))}: at the horizon the stretch across 2 meters is {formatBig(stellar.stretchAtHorizonInG)} g for {label(stellar)} and {formatBig(sgr.stretchAtHorizonInG)} g for {label(sgr)}, about{' '}
        {formatBig(stellar.stretchAtHorizonInG / sgr.stretchAtHorizonInG)} times stronger at the small one. Your white pointer was on Picture 3.
      </p>

      <p style={paragraphStyle}>
        <strong>1. The traveler’s own clock reaches the horizon in a finite time.</strong> For a fall from rest at 10 horizon radii it reads {formatFour(run.travelerClockAtHorizon)} light-times when the traveler arrives. A light-time is the time light takes to cross one horizon radius, so in ordinary units that is{' '}
        {formatSeconds(stellar.tripSeconds)} for {label(stellar)}, {formatSeconds(sgr.tripSeconds)} for {label(sgr)} and {formatSeconds(m87.tripSeconds)} for {label(m87)}. From the traveler’s side, it is an ordinary trip with an ordinary end.
      </p>
      <p style={paragraphStyle}>
        <strong>2. The far-away clock never gets there.</strong> At 0.01, 0.001 and 0.0001 horizon radii from the horizon it reads {near.map((n) => formatFour(n.farAwayClock)).join(', ')} light-times. Each time the gap shrinks to a tenth, it reads about {formatFour(LN_10)} light-times more, and that goes on for
        ever: it keeps rising without limit, and so it never shows the traveler reaching the horizon. The traveler’s own clock, meanwhile, hardly changes ({formatFour(travelerClock(10, 1.01))} to {formatFour(travelerClock(10, 1.0001))}).
      </p>
      <p style={paragraphStyle}>
        <strong>3. Both are true, because they are different clocks.</strong> This is the same lesson as Experiment 2. There, a far-away comparison said a hovering clock ticks ever more slowly toward the horizon. “Time stops at the horizon” was always a statement about that comparison. The traveler’s own watch simply keeps
        ticking, in the traveler’s own experience, and reaches the horizon after a finite time. Neither clock is “the real time”. What a far-away observer would actually see, rather than read off a clock, is the question of the next experiment.
      </p>
      <p style={paragraphStyle}>
        <strong>4. What the traveler feels is the stretching.</strong> Think of a long rubber band with one end tied to a post and the other pulled by a hand: it stretches because its two ends are not pulled equally. Gravity pulls the traveler’s nearer end harder than the farther end, so they are stretched. The difference in
        pull across a length h at a distance r from a mass M is 2GM × h ÷ r³. Because r is cubed, it grows very fast as the traveler falls: at half the distance it is {formatNumber(halfDistanceRatio)} times larger.
      </p>
      <p style={paragraphStyle}>
        <strong>5. The same fall, in horizon radii, gives a very different stretch.</strong> At the horizon, across 2 meters, it is {formatBig(stellar.stretchAtHorizonInG)} g for {label(stellar)}, {formatBig(sgr.stretchAtHorizonInG)} g for {label(sgr)} and {formatBig(m87.stretchAtHorizonInG)} g for {label(m87)}, where 1 g is the
        pull of Earth’s gravity at its surface. The horizon of a bigger black hole is much farther from its center, and the stretch depends on the distance from the center, so it is much gentler there. Crossing the horizon of a giant black hole is, locally, unremarkable.
      </p>
      <p style={paragraphStyle}>
        <strong>6. For a small black hole the stretching comes first.</strong> For {label(stellar)} the stretch across 2 meters passes 1 g at about {formatNumber(run.stretchOneGRadiusInHorizonRadii as number)} horizon radii from the center, far outside the horizon, and reaches {formatBig(stellar.stretchAtHorizonInG)} g at
        the horizon. NASA’s page about its 2024 black hole visualization says that stellar-mass black holes have much smaller event horizons and stronger tidal forces, which can rip apart approaching objects before they get to the horizon. For the other two black holes the stretch would reach 1 g only inside the horizon,
        which this experiment does not model.
      </p>
      <p style={paragraphStyle}>
        <strong>7. The honest limits.</strong> This was a thought experiment about a small traveler falling straight in from rest. It stops at the horizon: nothing inside is modeled, and it does not show what the traveler would see. The far-away clock was compared with the traveler’s clock, not seen by an observer. The equations
        were given, not derived, and are for a black hole that does not spin and has no electric charge. This page does not model a spinning black hole.
      </p>
      <p style={paragraphStyle}>
        <strong>8. How this ties back.</strong> In Experiment 2, “time stops at the horizon” was a statement about far-away clocks. In Experiment 3, an orbit inside 3 horizon radii plunges in, and in Experiment 4, light aimed closer than 2.598 horizon radii is captured. Both are the same one-way trip, and this experiment
        followed it from the traveler’s side.
      </p>
    </div>
  )
}

export function FallingInTutor({ predictedEnd, predictedFarClock, predictedStretch, onExplained }: FallingInTutorProps) {
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
              "Look at the two clocks in Picture 1 and the white YOUR GUESS marks on Pictures 2 and 3. When the traveler reaches the horizon, what does the traveler's clock read, and what is the far-away clock doing? Now go to Part 2 and try a different black hole and compare the stretch."}
            {tutorStep === 'compare' &&
              `You guessed that ${endClauses[predictedEnd]}; that ${farClockClauses[predictedFarClock]}; and that ${stretchClauses[predictedStretch]}. Compare the white marks on Pictures 2 and 3 with the curves and the two clocks. What do you notice?`}
            {tutorStep === 'conceptual' &&
              "Experiment 2 said that a clock hovering near the horizon ticks more and more slowly, as seen from far away. Yet this traveler's own clock reaches the horizon in an ordinary time. How can both be true?"}
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

      {tutorStep === 'explained' && <FallingInExplanation predictedEnd={predictedEnd} predictedFarClock={predictedFarClock} predictedStretch={predictedStretch} />}
    </div>
  )
}
