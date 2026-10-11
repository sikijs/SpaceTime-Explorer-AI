import { useState } from 'react'
import {
  BLACK_HOLE_PRESETS,
  farAwayClock,
  runFallingInExperiment,
  stretchInG,
  travelerClock,
} from '../physics/fallingInExperiment'

type EndChoice = 'finite' | 'never' | 'depends'
type FarClockChoice = 'same' | 'settles' | 'no-limit'
type StretchChoice = 'small' | 'same' | 'giant'
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

// Three significant figures, with no trailing zeros ("0.5", "6.19", "98.5").
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

// A time in the unit that fits it.
function fmtSeconds(seconds: number): string {
  if (seconds < 0.1) return `${fmt(seconds * 1000)} thousandths of a second`
  if (seconds < 120) return `${fmt(seconds)} seconds`
  if (seconds < 7200) return `${fmt(seconds / 60)} minutes`
  if (seconds < 172_800) return `${fmt(seconds / 3600)} hours`
  return `${fmt(seconds / 86_400)} days`
}

const paragraphStyle = { marginBottom: '1rem', fontSize: '0.95rem', color: '#333', lineHeight: '1.6' } as const

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

  // Numbers for the explanation come from the experiment's own model, never typed in by hand.
  const holes = BLACK_HOLE_PRESETS.map((p) => runFallingInExperiment(p.id, 10))
  const [stellar, sgr, m87] = holes
  const label = (h: (typeof holes)[number]) => h.preset.label.replace(/^A /, 'a ')
  const horizonTime = travelerClock(10, 1)
  const far = [1.01, 1.001, 1.0001].map((r) => farAwayClock(10, r))
  const halfDistanceRatio = stretchInG(stellar.preset.massSolarMasses, 2) / stretchInG(stellar.preset.massSolarMasses, 4)

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
              "Look at the two clocks and the graph. When the traveler reaches the horizon, what does the traveler's clock read, and what is the far-away clock doing? Now try a different black hole and compare the stretch."}
            {tutorStep === 'compare' &&
              `You predicted that ${endClauses[predictedEnd]}; that ${farClockClauses[predictedFarClock]}; and that ${stretchClauses[predictedStretch]}. Comparing that to what you saw, what do you notice?`}
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

      {tutorStep === 'explained' && (
        <div>
          <p style={paragraphStyle}>
            <strong>1. The traveler's own clock reaches the horizon in a finite time.</strong> For a fall from rest at 10
            horizon radii it reads {fmt(horizonTime)} light-times when the traveler arrives. A light-time is the time light
            takes to cross one horizon radius, so in ordinary units that is {fmtSeconds(stellar.travelerSecondsAtHorizon)}{' '}
            for {label(stellar)}, {fmtSeconds(sgr.travelerSecondsAtHorizon)} for {label(sgr)} and{' '}
            {fmtSeconds(m87.travelerSecondsAtHorizon)} for {label(m87)}. From the traveler's side, it is an ordinary trip
            with an ordinary end.
          </p>
          <p style={paragraphStyle}>
            <strong>2. The far-away clock never gets there.</strong> At 0.01, 0.001 and 0.0001 horizon radii from the
            horizon it reads {far.map((f) => fmt(f)).join(', ')} light-times. Each time the gap shrinks to a tenth, it
            reads about 2.3 light-times more, and that goes on for ever: it keeps rising without limit, and so it never
            shows the traveler reaching the horizon. The traveler's own clock, meanwhile, hardly changes.
          </p>
          <p style={paragraphStyle}>
            <strong>3. Both are true, because they are different clocks.</strong> This is the same lesson as Experiment
            2. There, a far-away comparison said a hovering clock ticks ever more slowly toward the horizon. "Time stops
            at the horizon" was always a statement about that comparison. The traveler's own watch simply keeps ticking,
            in the traveler's own experience, and reaches the horizon after a finite time. Neither clock is "the real
            time".
          </p>
          <p style={paragraphStyle}>
            <strong>4. What the traveler feels is the stretching.</strong> Think of a long rubber band with one end tied to
            a post and the other pulled by a hand: it stretches because its two ends are not pulled equally. Gravity
            pulls the traveler's nearer end harder than the farther end, so they are stretched. The difference in pull
            across a length h at a distance r from a mass M is 2GM × h ÷ r³. Because r is cubed, it grows very fast as the
            traveler falls: at half the distance it is {fmt(halfDistanceRatio)} times larger.
          </p>
          <p style={paragraphStyle}>
            <strong>5. The same fall, in horizon radii, gives a very different stretch.</strong> At the horizon, across 2
            meters, it is {fmtBig(stellar.stretchAtHorizonInG)} g for {label(stellar)}, {fmtBig(sgr.stretchAtHorizonInG)} g
            for {label(sgr)} and {fmtBig(m87.stretchAtHorizonInG)} g for {label(m87)}, where 1 g is the pull of Earth's
            gravity at its surface. The horizon of a bigger black hole is much farther from its center, and the stretch
            depends on the distance from the center, so it is much gentler there. Crossing the horizon of a giant black
            hole is, locally, unremarkable.
          </p>
          <p style={paragraphStyle}>
            <strong>6. For a small black hole the stretching comes first.</strong> For {label(stellar)} the stretch across
            2 meters passes 1 g at about {fmt(stellar.stretchOneGRadiusInHorizonRadii as number)} horizon radii from the
            center, far outside the horizon, and reaches {fmtBig(stellar.stretchAtHorizonInG)} g at the horizon: far more
            than any body could survive. A traveler would be stretched apart long before reaching it. For the other two it
            would reach 1 g only inside the horizon, which this experiment does not model.
          </p>
          <p style={paragraphStyle}>
            <strong>7. The honest limits.</strong> This was a thought experiment about a small traveler falling straight in
            from rest. It stops at the horizon: nothing inside is modeled, and it does not show what the traveler would see.
            The far-away clock was compared with the traveler's clock, not seen by an observer. The equations were given,
            not derived, and are for a black hole that does not spin and has no electric charge.
          </p>
          <p style={paragraphStyle}>
            <strong>8. How this ties back.</strong> In Experiment 2, "time stops at the horizon" was a statement about
            far-away clocks. In Experiment 3, an orbit inside 3 horizon radii plunges in, and in Experiment 4, light aimed
            closer than 2.598 horizon radii is captured. Both are the same one-way trip, and this experiment followed it from
            the traveler's side.
          </p>
        </div>
      )}
    </div>
  )
}
