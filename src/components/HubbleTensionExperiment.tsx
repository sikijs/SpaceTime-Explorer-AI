import { useEffect, useState } from 'react'
import type { ReactNode } from 'react'
import { LATE_MEASUREMENTS, runTensionExperiment } from '../physics/hubbleTension'
import type { SigmaRange } from '../physics/hubbleTension'
import { REAL_UNIVERSE_AGE_YEARS } from '../physics/bigBangExperiment'
import { ReferencePanel } from './EnergyMomentumExperiment'
import { HubbleTensionTutor } from './HubbleTensionTutor'

// Cosmic Horizons, Experiment 1 (docs/experiments/cosmic-horizons/01-hubble-tension.md).
// Step 2 built the status label, the introduction, the choice of a nearby-universe measurement and Picture 1. Step 3 added the two
// predictions, Run, the staged run and Pictures 2 and 3 with their guides. Step 4 added the "Words and formulas" panel, the neutral results
// (shown after the run) and the "What if the error bars were bigger?" control. Step 5 adds the tutor (HubbleTensionTutor.tsx), shown after the
// results; the chapter summary in App appears once the learner reaches its explanation. The introduction, the predictions, the three pictures'
// guides, the results and the panel are wording approved by the owner on 2026-10-17; the tutor's wording is draft for the owner's review
// (CLAUDE.md §28.1) and is written to the standard of §29.
// The interface only displays numbers from src/physics/hubbleTension.ts (CLAUDE.md §9). The only calculation here is the drawn shape of a bell curve.

interface HubbleTensionExperimentProps {
  onComplete?: () => void
  onTutorComplete?: () => void
}

const VIEW_WIDTH = 560
const AXIS_MIN = 64
const AXIS_MAX = 78
const AXIS_LEFT = 40
const AXIS_RIGHT = 520
const TICKS = [64, 66, 68, 70, 72, 74, 76, 78]

const EARLY_COLOR = '#38bdf8' // sky blue: early-universe measurement
const LATE_COLOR = '#fb923c' // orange: nearby-universe measurement
const OVERLAP_COLOR = '#a78bfa' // purple: where the two bell curves overlap
const AGE_COLOR = '#facc15' // yellow: the real age of the universe
const TEXT_COLOR = '#e2e8f0'
const MUTED_COLOR = '#94a3b8'

// The run's stages, in the order the learner sees them (the result does not depend on playback speed, CLAUDE.md §11).
const STAGE_MS = 2600
const STAGES = [
  'The early-universe measurement (Planck)',
  'The nearby-universe measurement you chose',
  'The gap between the two best values',
  'The two uncertainties as bell curves, and their combined give-or-take',
  'Sigma: how many combined give-or-takes fit in the gap',
  'What the gap means for the age of the universe',
  'The other nearby-universe measurements',
]
const LAST_STAGE = STAGES.length

type SigmaChoice = SigmaRange
const SIGMA_CHOICES: Array<{ value: SigmaChoice; label: string }> = [
  { value: 'under2', label: 'Less than 2' },
  { value: 'twoToFour', label: 'Between 2 and 4' },
  { value: 'fourToSix', label: 'Between 4 and 6' },
  { value: 'over6', label: 'More than 6' },
]

type WebbChoice = 'lower' | 'same' | 'higher'
const WEBB_CHOICES: Array<{ value: WebbChoice; label: string }> = [
  { value: 'lower', label: 'Lower (closer to the early-universe value)' },
  { value: 'same', label: 'About the same' },
  { value: 'higher', label: 'Higher' },
]

// The "What if the error bars were bigger?" presets: every uncertainty is multiplied by this factor (specification, Learner Controls).
const STRETCH_CHOICES = [1, 1.5, 2, 3, 5]

// Terms the introduction and the guides define, repeated in the "Words and formulas" panel with no new claims. The formulas are added
// after the run, because the worked example uses the learner's own numbers (and so shows the sigma the predictions ask about, §12).
const REFERENCE_ENTRIES: { term: string; meaning: string }[] = [
  { term: 'The Hubble constant, H₀', meaning: 'how fast the universe is expanding today. It is about 70 kilometres per second for each megaparsec of distance, written km/s/Mpc.' },
  { term: 'Megaparsec (Mpc)', meaning: 'a very large distance, about 3.3 million light-years.' },
  { term: 'Measurement, best value and uncertainty', meaning: 'every measurement is a best value plus a “give or take”. “73.04 ± 1.04” means about 73, give or take about 1. The “give or take” is the uncertainty: the smaller it is, the more precise the measurement.' },
  { term: 'Error bar', meaning: 'the “give or take” drawn as a picture: a dot at the best value and a line reaching as far to the left and the right as the uncertainty. “Error” means the small unavoidable imprecision of any measurement, not a mistake.' },
  { term: 'Early-universe measurement', meaning: 'one worked out from the cosmic microwave background (the afterglow of the Big Bang), by assuming the standard model of the universe. Here it is Planck 2018.' },
  { term: 'Nearby-universe measurement', meaning: 'one made directly, by finding how far away galaxies are and how fast they are moving away. The distances come from the distance ladder.' },
  { term: 'Distance ladder', meaning: 'getting distances one step at a time: nearby stars (by their small shift in position), then Cepheid stars (whose steady rhythm of brightening and dimming tells their true brightness), then supernovae (exploding stars of nearly constant brightness).' },
  { term: 'Gap', meaning: 'the difference between two best values. For 67.4 and 73.04 the gap is 73.04 − 67.4 = 5.64 km/s/Mpc.' },
  { term: 'Combined give-or-take', meaning: 'the doubt about the gap, worked out from the two uncertainties. Each one is a possible error in a different direction, so they partly cancel and the combined doubt is smaller than their plain sum. You do not need to remember how it is worked out.' },
  { term: 'Bell curve', meaning: 'a way to draw one “give or take”. The curve is tallest at the best value, which is the most likely. It falls away on both sides, because values far from the best value are less likely. A narrow curve means a precise measurement.' },
  { term: 'Sigma', meaning: 'how many “give or takes” fit inside the gap between two measurements. About 1 sigma happens by chance quite often. The bigger it is, the less likely chance alone explains the gap. 5 sigma is the usual bar in many sciences for calling a difference real.' },
  { term: 'Tension', meaning: 'a disagreement between two measurements too large to be put down to chance. A puzzle, not yet a discovery.' },
  { term: 'Hubble time', meaning: 'the rough age of the universe you get from 1 ÷ H₀: the age it would have if the expansion had always gone at today’s rate. It is not the real age, which is about 13.8 billion years from the full model.' },
]

// The real age from the full model, as Cosmology Experiment 2 defines it (the Picture 3 line); the written labels say "about 13.8".
const REAL_AGE_BILLION = REAL_UNIVERSE_AGE_YEARS / 1e9

const xOf = (value: number) => AXIS_LEFT + ((value - AXIS_MIN) / (AXIS_MAX - AXIS_MIN)) * (AXIS_RIGHT - AXIS_LEFT)
const round2 = (value: number) => Number(value.toFixed(2))
const fixed2 = (value: number) => value.toFixed(2)

function ExternalLink({ href, children }: { href: string; children: ReactNode }) {
  return (
    <a href={href} target="_blank" rel="noopener noreferrer">
      {children}
    </a>
  )
}

function AxisTicks({ y }: { y: number }) {
  return (
    <>
      <line x1={AXIS_LEFT} y1={y} x2={AXIS_RIGHT} y2={y} stroke={MUTED_COLOR} strokeWidth={1.5} />
      {TICKS.map((t) => (
        <g key={t}>
          <line x1={xOf(t)} y1={y - 4} x2={xOf(t)} y2={y + 4} stroke={MUTED_COLOR} />
          <text x={xOf(t)} y={y + 18} fill={MUTED_COLOR} fontSize="11" textAnchor="middle">
            {t}
          </text>
        </g>
      ))}
      <text x={(AXIS_LEFT + AXIS_RIGHT) / 2} y={y + 36} fill={TEXT_COLOR} fontSize="12" textAnchor="middle">
        Expansion rate, H₀ (km/s/Mpc)
      </text>
    </>
  )
}

const svgStyle = {
  display: 'block',
  maxWidth: '100%',
  height: 'auto',
  border: '1px solid var(--border-color, #ccc)',
  borderRadius: '8px',
  overflow: 'hidden',
  backgroundColor: '#0b1020',
} as const

// A measurement as a dot with an error bar, named above it.
function DotAndBar({ name, value, uncertainty, y, color, opacity = 1 }: { name: string; value: number; uncertainty: number; y: number; color: string; opacity?: number }) {
  return (
    <g opacity={opacity}>
      <line x1={xOf(value - uncertainty)} y1={y} x2={xOf(value + uncertainty)} y2={y} stroke={color} strokeWidth={3} />
      <circle cx={xOf(value)} cy={y} r={5} fill={color} />
      <text x={xOf(value)} y={y - 12} fill={color} fontSize="12" textAnchor="middle">
        {name}: {value} ± {round2(uncertainty)}
      </text>
    </g>
  )
}

// The drawn shape of an uncertainty: a bell curve centred on the best value, one "give or take" wide (a drawing, not a physical result).
function bell(x: number, mean: number, sd: number): number {
  return Math.exp(-0.5 * ((x - mean) / sd) ** 2) / (sd * Math.sqrt(2 * Math.PI))
}

function curvePath(mean: number, sd: number, baseY: number, scale: number, cap?: { mean: number; sd: number }): string {
  const points: string[] = []
  const steps = 280
  for (let i = 0; i <= steps; i++) {
    const v = AXIS_MIN + ((AXIS_MAX - AXIS_MIN) * i) / steps
    const h = cap ? Math.min(bell(v, mean, sd), bell(v, cap.mean, cap.sd)) : bell(v, mean, sd)
    points.push(`${xOf(v).toFixed(1)},${(baseY - h * scale).toFixed(1)}`)
  }
  return points.join(' ')
}

export function HubbleTensionExperiment({ onComplete, onTutorComplete }: HubbleTensionExperimentProps) {
  const [lateName, setLateName] = useState(LATE_MEASUREMENTS[0].name)
  const [sigmaPrediction, setSigmaPrediction] = useState<SigmaChoice | null>(null)
  const [webbPrediction, setWebbPrediction] = useState<WebbChoice | null>(null)
  const [status, setStatus] = useState<'idle' | 'running' | 'complete'>('idle')
  const [stage, setStage] = useState(0)
  const [stretch, setStretch] = useState(1)

  const late = LATE_MEASUREMENTS.find((m) => m.name === lateName)!
  const result = runTensionExperiment(late)
  const early = result.early
  // The results below follow the "What if the error bars were bigger?" control. The three pictures stay at the published error bars (×1).
  const shown = runTensionExperiment(late, stretch)
  const label = (choices: ReadonlyArray<{ value: string; label: string }>, value: string | null) => choices.find((c) => c.value === value)?.label ?? ''
  const bothPredicted = sigmaPrediction !== null && webbPrediction !== null

  // Presentation only: advances one stage at a time. The result above does not depend on this timer.
  useEffect(() => {
    if (status !== 'running') return
    const timer = window.setTimeout(() => {
      if (stage < LAST_STAGE) {
        setStage(stage + 1)
      } else {
        setStatus('complete')
        onComplete?.()
      }
    }, STAGE_MS)
    return () => window.clearTimeout(timer)
  }, [status, stage, onComplete])

  const startOver = () => {
    setSigmaPrediction(null)
    setWebbPrediction(null)
    setStatus('idle')
    setStage(0)
    setStretch(1)
  }

  const choose = (name: string) => {
    setLateName(name)
    startOver() // Prediction 1 names the measurement, so changing it clears both predictions
  }

  const run = () => {
    setStage(1)
    setStatus('running')
  }

  // Layout of Picture 1: one row per measurement, so no label sits on another.
  const earlyY = 70
  const lateY = 130
  const otherYs = [208, 252]
  const axis1Y = 290
  const lo = Math.min(early.value, late.value)
  const hi = Math.max(early.value, late.value)

  // Layout of Picture 2
  const baseY = 190
  const minSd = Math.min(early.uncertainty, late.uncertainty)
  const scale = 120 / bell(0, 0, minSd)
  const doubt = result.combinedUncertainty
  const wholeSegments = Math.floor(result.tension)

  // Layout of Picture 3
  const ageMax = 16
  const ageX = (billion: number) => AXIS_LEFT + (billion / ageMax) * (AXIS_RIGHT - AXIS_LEFT)

  return (
    <div>
      <h2>Experiment 1 — Two Measurements of the Expansion Rate: Why Don’t They Agree?</h2>
      <div className="exp-card" style={{ marginTop: '2rem', padding: '1.5rem' }}>
        <p style={{ marginTop: 0, marginBottom: '1.5rem', fontSize: '0.875rem' }}>
          <strong>Where this stands (as of October 2026): Contested.</strong> The measurements below are real and published. What they mean is
          not agreed.
        </p>

        {/* Introduction: draft wording for the owner's review (CLAUDE.md §28.1), written to the standard of CLAUDE.md §29 (up to date, clear,
            detailed, simple terms, everyday examples, links for further reading). It does not say whether, or by how much, the measurements
            differ, and it does not say what the James Webb Space Telescope found (that is what the predictions ask, §12). */}
        <div style={{ marginBottom: '2rem', fontSize: '0.875rem', color: 'var(--text-muted)' }}>
          <p style={{ marginTop: 0, marginBottom: '0.75rem' }}>
            <strong>The question.</strong> In Cosmology Experiment 1 we saw that the universe is expanding: the farther away a galaxy is, the
            faster it is moving away from us. The number that says <em>how fast</em> is called the <strong>Hubble constant</strong>, written{' '}
            <strong>H₀</strong>. It is about 70 kilometres per second for each <strong>megaparsec</strong> of distance. (A megaparsec, Mpc, is
            a very large distance, about 3.3 million light-years.) So a galaxy 100 megaparsecs away is moving off at about 100 × 70 = 7,000
            kilometres per second, and one twice as far at about twice that.
          </p>
          <p style={{ marginTop: 0, marginBottom: '0.75rem' }}>
            This one number matters a great deal. It sets the size and the age of the universe: the faster the expansion, the less time it
            took to get this big. So astronomers have worked hard to measure it as carefully as they can, in more than one way. The question
            of this experiment is simple: <strong>when two careful ways of measuring H₀ are compared, do they give the same answer?</strong>
          </p>

          <p style={{ marginTop: 0, marginBottom: '0.75rem' }}>
            <strong>Why use more than one way?</strong> Think of finding how fast a car is going. You could read the speedometer, or you could
            time it between two mile markers. If the two methods agree, you trust the result. If they do not, something is wrong: one of the
            methods has a hidden fault, or the car is not behaving the way you assumed. Scientists check an important number the same way.
          </p>

          <div style={{ marginBottom: '0.75rem' }}>
            <p style={{ marginTop: 0, marginBottom: '0.5rem' }}>
              <strong>Some new words.</strong> Here is each one in plain language.
            </p>
            <ul style={{ margin: 0, paddingLeft: '1.25rem' }}>
              <li>
                <strong>Measurement, uncertainty and error bar:</strong> no measurement is exact. Suppose you measure a table five times with
                a tape measure and get 120.4, 119.6, 120.3, 119.7 and 120.0 centimetres. The readings are all a little different, because
                your eye and the tape are not perfect. So you would not say “exactly 120”. You would say “<strong>about 120, give or take
                0.5</strong>”, which means the true length is probably somewhere between 119.5 and 120.5. Scientists write that as{' '}
                <strong>120.0 ± 0.5</strong>. The first number is the <strong>best value</strong>. The “give or take” part is the{' '}
                <strong>uncertainty</strong>: the smaller it is, the more precise the measurement.
                <br />
                An <strong>error bar</strong> is just that “give or take” drawn as a picture: a dot at the best value, and a line that reaches
                as far to the left, and as far to the right, as the uncertainty. (Here “error” does not mean a mistake. It means the small
                unavoidable imprecision of any measurement.) Here is the tape measure result drawn that way:
                <svg
                  width={300}
                  height={80}
                  viewBox="0 0 300 80"
                  style={{ display: 'block', maxWidth: '100%', height: 'auto', margin: '0.5rem 0', borderRadius: '6px', backgroundColor: '#0b1020' }}
                  role="img"
                  aria-label="An example error bar: a dot at 120.0 with a bar from 119.5 to 120.5"
                >
                  <line x1={20} y1={55} x2={280} y2={55} stroke="#94a3b8" strokeWidth={1.5} />
                  {[119, 120, 121].map((t, i) => (
                    <g key={t}>
                      <line x1={60 + i * 90} y1={51} x2={60 + i * 90} y2={59} stroke="#94a3b8" />
                      <text x={60 + i * 90} y={72} fill="#94a3b8" fontSize="10" textAnchor="middle">
                        {t} cm
                      </text>
                    </g>
                  ))}
                  <line x1={105} y1={35} x2={195} y2={35} stroke="#fb923c" strokeWidth={3} />
                  <circle cx={150} cy={35} r={5} fill="#fb923c" />
                  <text x={150} y={20} fill="#e2e8f0" fontSize="11" textAnchor="middle">
                    best value 120.0, bar from 119.5 to 120.5
                  </text>
                </svg>
                A bathroom scale that says “70 kg, give or take 1” is another example: it is probably right to within a kilogram, but you
                should not trust it to the gram.
              </li>
              <li>
                <strong>Early-universe measurement:</strong> one made from the very old light called the cosmic microwave background, the
                afterglow of the Big Bang (Cosmology Experiment 3). The satellite that mapped it most precisely was <strong>Planck</strong>.
                Planck does not watch galaxies move. Instead, scientists take the patterns in that old light, assume the standard model of the
                universe (the one built in the Cosmology experiments, with ordinary matter, dark matter and dark energy), and work out what
                H₀ must be <em>today</em> for that model to fit the patterns. So this value depends on the standard model being right.
              </li>
              <li>
                <strong>Nearby-universe measurement:</strong> one made the direct way, as in Cosmology Experiment 1: find how far away
                galaxies are, find how fast they are moving away, and divide. The hard part is the distances. Astronomers get them one step
                at a time, like climbing a ladder, so it is called the <strong>distance ladder</strong>:
                <ul style={{ marginTop: '0.25rem', paddingLeft: '1.25rem' }}>
                  <li>
                    <em>First rung: nearby stars.</em> A nearby star seems to shift a tiny amount against the far background as the Earth
                    goes round the Sun. Hold up a thumb and close one eye, then the other: your thumb seems to jump. The size of the jump
                    tells you how close it is.
                  </li>
                  <li>
                    <em>Second rung: Cepheid stars.</em> These stars brighten and dim in a steady rhythm, and the slower the rhythm, the
                    more light the star really gives off. So its rhythm tells you how bright it truly is. Compare that with how bright it
                    looks, and you know how far away it is, as you would judge how far away a lamp is if you knew its wattage and could
                    see how dim it looks.
                  </li>
                  <li>
                    <em>Third rung: supernovae.</em> Some exploding stars reach nearly the same true brightness every time, and they are so
                    bright that we see them in very distant galaxies. Cepheids in nearby galaxies that also host such a supernova are used
                    to find how bright these explosions really are, and then the explosions give distances far beyond the Cepheids’ reach.
                  </li>
                </ul>
              </li>
              <li>
                <strong>Hubble Space Telescope and James Webb Space Telescope:</strong> the two big space telescopes used to look at the
                Cepheids. The Webb telescope is newer and sees finer detail. Astronomers worried that, in a crowded patch of sky, the
                Hubble telescope’s pictures might blur a Cepheid together with its neighbours and spoil its distance. Looking again with the
                Webb telescope is one way to test that worry.
              </li>
              <li>
                <strong>Sigma:</strong> the way scientists say how big a disagreement between two measurements is. It answers the question
                “<strong>how many ‘give or takes’ fit inside the gap?</strong>” (the example below works one out step by step). If the gap
                is only about 1 sigma, it is no bigger than the give-or-take, and you would expect that by chance quite often. The bigger
                the number of sigma, the less likely it is that chance alone explains the gap. In many sciences, 5 sigma is the usual bar for
                calling a difference real.
              </li>
              <li>
                <strong>Tension:</strong> a disagreement between two measurements that is too large to be put down to chance. It is a puzzle,
                not yet a discovery: it could mean one measurement has an error nobody has found, or that our model is missing something.
              </li>
            </ul>
          </div>

          <div style={{ marginBottom: '0.75rem' }}>
            <p style={{ marginTop: 0, marginBottom: '0.5rem' }}>
              <strong>An everyday example of sigma, step by step.</strong> You and a friend each measure the same table, and you want to
              know whether your two results really disagree. There are three steps.
            </p>
            <ul style={{ margin: 0, paddingLeft: '1.25rem' }}>
              <li>
                <strong>Step 1: find the gap.</strong> You get 120.0 cm. Your friend gets 121.0 cm. The gap is 121.0 − 120.0 = 1.0 cm.
              </li>
              <li>
                <strong>Step 2: find how much that gap could be wrong by.</strong> Each of you says “give or take 0.5 cm”. Both numbers
                can be off, so the <em>gap</em> between them is uncertain too. It is tempting to add the two (0.5 + 0.5 = 1.0), but that
                is too much. Sometimes you are both off in the same direction (both a bit high), and then the gap hardly changes. Sometimes
                you are off in opposite directions, and then the gap changes a lot. On average the two give-or-takes combine into something a
                little bigger than one of them, but smaller than their plain sum. Scientists use this recipe:
                <ol style={{ margin: '0.25rem 0', paddingLeft: '1.25rem' }}>
                  <li>Multiply each give-or-take by itself: 0.5 × 0.5 = 0.25, and again 0.5 × 0.5 = 0.25.</li>
                  <li>Add the two answers: 0.25 + 0.25 = 0.50.</li>
                  <li>
                    Find the number that, multiplied by itself, gives that: 0.7, because 0.7 × 0.7 = 0.49, which is very close to 0.50. (This is
                    called the square root.)
                  </li>
                </ol>
                So the <strong>combined give-or-take is about 0.7 cm</strong>. You do not need to remember the recipe. It is only here so that
                you can see where 0.7 comes from. Between the two numbers, it is the size of the doubt about the gap.
              </li>
              <li>
                <strong>Step 3: divide.</strong> Ask: how many of those 0.7 cm doubts fit inside the 1.0 cm gap? 1.0 ÷ 0.7 is about 1.4. So
                the gap is <strong>about 1.4 sigma</strong>. That is only a little more than the doubt itself, so you would shrug: ordinary
                differences like this happen all the time.
              </li>
            </ul>
            <p style={{ marginTop: '0.5rem', marginBottom: '0.5rem' }}>
              <strong>Now imagine a second, different story.</strong> You still get 120.0 cm and your friend still gets 121.0 cm, so the
              gap is still 1.0 cm: it is just the difference between the two readings, and the readings have not changed. But this time you
              each used a much better tape and measured many times, so you can each say “give or take 0.1 cm” instead of 0.5. Only the
              uncertainty is different. The recipe now gives 0.1 × 0.1 = 0.01, then 0.01 + 0.01 = 0.02, then the square root of 0.02, which is
              about 0.14. So the combined give-or-take is 0.14 cm, and 1.0 ÷ 0.14 is about 7. The gap is <strong>about 7 sigma</strong>: seven
              of those doubts fit inside it. Chance alone almost certainly cannot explain that, so you would go looking for a cause. One of you
              may have made a mistake, or you were not measuring the same thing.
            </p>
            <p style={{ marginTop: 0, marginBottom: 0 }}>
              The gap was 1 cm in both stories because the two readings were the same. What changed was the doubt, and so how big the gap is{' '}
              <em>compared with the doubt</em>. That comparison is what sigma is. In this experiment, the two “people” are two teams of astronomers, and the “table” is the expansion rate of the
              universe.
            </p>
          </div>
          <p style={{ marginTop: 0, marginBottom: '0.75rem' }}>
            <strong>What happens.</strong> The experiment shows real published measurements of H₀ as points on one line, each with its error
            bar. You pick one nearby-universe measurement. The experiment places it next to the early-universe value, shows how far apart
            they are in sigma, and shows what the gap would mean for the age of the universe.
          </p>
          <p style={{ marginTop: 0, marginBottom: '0.75rem' }}>
            <strong>Your job.</strong> Choose a nearby-universe measurement. Predict how many sigma apart it is from the early-universe
            value, and what happened when the Webb telescope re-measured the same Cepheid stars. Press Run. You are not graded while you
            predict. The tutor will compare your predictions with the result afterwards.
          </p>
          <p style={{ marginTop: 0, marginBottom: '0.75rem' }}>
            <strong>What we assume.</strong> Each uncertainty is treated as a simple, symmetric “give or take”, and two measurements’ errors
            as independent of each other. The scientists’ own papers use more careful statistics, so their quoted sigma can differ a little
            from the one here. The age estimate 1 ÷ H₀ is rough: it is the age the universe would have if it had always expanded at today’s
            rate (Cosmology Experiment 2), not the real age. We show a few of the published measurements, not all of them. And this
            experiment cannot tell you which measurement, if either, is wrong.
          </p>
          <p style={{ marginTop: 0, marginBottom: 0 }}>
            <strong>Want to know more?</strong> These are the original scientific papers (their summary pages, which are written for
            scientists and use technical words). They open on arxiv.org, the free site where scientists post their papers. The numbers on
            this page were checked against their summary pages on 16 October 2026.
          </p>
          <ul style={{ margin: '0.25rem 0 0', paddingLeft: '1.25rem' }}>
            <li>
              <ExternalLink href="https://arxiv.org/abs/1807.06209">Planck 2018 results VI: Cosmological parameters</ExternalLink>: the
              early-universe value, 67.4 ± 0.5.
            </li>
            <li>
              <ExternalLink href="https://arxiv.org/abs/2112.04510">Riess et al. 2022 (the SH0ES team)</ExternalLink>: the distance ladder
              with Cepheids and supernovae.
            </li>
            <li>
              <ExternalLink href="https://arxiv.org/abs/2401.04773">Riess et al. 2024</ExternalLink>: the Webb telescope’s second look at the
              Cepheids.
            </li>
            <li>
              <ExternalLink href="https://arxiv.org/abs/2408.06153">Freedman et al. 2024 (the Chicago-Carnegie program)</ExternalLink>: a
              third method, using a different kind of star.
            </li>
            <li>
              <ExternalLink href="https://arxiv.org/abs/2510.23823">The Local Distance Network (2025)</ExternalLink>: a community report that
              combines many methods.
            </li>
          </ul>
          <p style={{ marginTop: '0.75rem', marginBottom: 0 }}>
            <strong>Want it explained in plainer words?</strong> These two pages are from NASA and the European Space Agency (ESA). They are
            written for the public, not for scientists.
          </p>
          <ul style={{ margin: '0.25rem 0 0', paddingLeft: '1.25rem' }}>
            <li>
              <ExternalLink href="https://science.nasa.gov/mission/hubble/science/science-behind-the-discoveries/hubble-constant-and-tension/">
                NASA: The Hubble Constant and Hubble Tension
              </ExternalLink>
              : how Cepheid stars and supernovae are used, step by step, to measure the distance to other galaxies (the distance ladder).
            </li>
            <li>
              <ExternalLink href="https://www.esa.int/Science_Exploration/Space_Science/Planck/Planck_reveals_an_almost_perfect_Universe">
                ESA: Planck reveals an almost perfect Universe
              </ExternalLink>
              : the Planck satellite and its map of the cosmic microwave background. This is ESA’s 2013 release, so its Hubble constant
              (67.15) is an earlier value than the 2018 one used on this page.
            </li>
          </ul>
        </div>

        <ReferencePanel
          entries={
            status === 'complete'
              ? [
                  ...REFERENCE_ENTRIES,
                  {
                    term: 'The sigma formula',
                    meaning: `sigma = (the gap) ÷ (the combined give-or-take), where the gap is the difference between the two best values and the combined give-or-take is √(u₁² + u₂²), with u₁ and u₂ the two uncertainties. Example, with your measurement: the gap is ${late.value} − ${early.value} = ${round2(result.gap)}. The combined give-or-take is √(${early.uncertainty}² + ${round2(late.uncertainty)}²) = ${round2(result.combinedUncertainty)}. So sigma = ${round2(result.gap)} ÷ ${round2(result.combinedUncertainty)} = ${round2(result.tension)}.`,
                  },
                  { term: 'The Hubble time formula', meaning: `Hubble time (in billions of years) = 977.8 ÷ H₀, with H₀ in km/s/Mpc. Example: 977.8 ÷ ${early.value} = ${result.earlyHubbleTimeBillionYears.toFixed(2)} for Planck.` },
                  { term: 'Stretching the error bars', meaning: 'if every uncertainty is made k times larger, the gap stays the same and the combined give-or-take becomes k times larger, so sigma becomes sigma ÷ k.' },
                ]
              : REFERENCE_ENTRIES
          }
        />

        <div style={{ marginBottom: '2rem' }}>
          <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold' }}>The nearby-universe measurement to test</label>
          <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)', marginTop: 0, marginBottom: '0.5rem' }}>
            Each is compared with the early-universe value, {early.name}: {early.value} ± {early.uncertainty} km/s/Mpc. (km/s/Mpc means
            kilometres per second, for each megaparsec of distance.) Changing the measurement clears your predictions, because the first
            prediction is about the measurement you chose.
          </p>
          <div>
            {LATE_MEASUREMENTS.map((m) => (
              <button
                key={m.name}
                type="button"
                onClick={() => choose(m.name)}
                disabled={status === 'running'}
                className={`toggle-button${m.name === lateName ? ' is-selected' : ''}`}
                style={{ marginRight: '0.5rem', marginBottom: '0.5rem' }}
              >
                {m.name}
              </button>
            ))}
          </div>
          <p style={{ fontSize: '0.875rem', marginTop: '0.5rem', marginBottom: 0 }}>
            <strong>{late.name}:</strong> {late.value} ± {round2(late.uncertainty)} km/s/Mpc. Source: {late.source}.
          </p>
        </div>

        {/* The two predictions: draft wording for the owner's review (CLAUDE.md §28.1), from the specification's "Prediction Activity".
            Neither says which answer is right. */}
        {(
          [
            {
              title: 'Prediction 1: how many sigma apart?',
              text: (
                <>
                  The early-universe value is {early.value} ± {early.uncertainty}, and the measurement you chose, from the nearby universe, is{' '}
                  <strong>
                    {late.name}: {late.value} ± {round2(late.uncertainty)}
                  </strong>{' '}
                  (both shown above). The gap between two measurements, divided by their combined give-or-take, is the number of{' '}
                  <strong>sigma</strong> they are apart. About how many sigma apart do you think these two are?
                </>
              ),
              choices: SIGMA_CHOICES,
              value: sigmaPrediction,
              set: (v: SigmaChoice) => setSigmaPrediction(v),
            },
            {
              title: 'Prediction 2: what did the Webb telescope change?',
              text: (
                <>
                  In 2024, the James Webb Space Telescope looked again at the same Cepheid stars that the Hubble Space Telescope had used, with
                  much sharper images. Compared with the Hubble value, did the Webb measurements make the nearby-universe expansion rate{' '}
                  <strong>lower</strong> (closer to the early-universe value), leave it <strong>about the same</strong>, or make it{' '}
                  <strong>higher</strong>?
                </>
              ),
              choices: WEBB_CHOICES,
              value: webbPrediction,
              set: (v: WebbChoice) => setWebbPrediction(v),
            },
          ] as const
        ).map((question) => (
          <div key={question.title} style={{ marginBottom: '2rem' }}>
            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold' }}>{question.title}</label>
            <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)', marginTop: 0, marginBottom: '0.75rem' }}>
              {question.text} You are not graded, and a guess is fine.
            </p>
            <div>
              {(question.choices as ReadonlyArray<{ value: string; label: string }>).map((choice) => (
                <button
                  key={choice.value}
                  type="button"
                  onClick={() => (question.set as (v: never) => void)(choice.value as never)}
                  disabled={status !== 'idle'}
                  className={`toggle-button${question.value === choice.value ? ' is-selected' : ''}`}
                  style={{ marginRight: '0.5rem', marginBottom: '0.5rem', padding: '0.5rem 1rem', fontSize: '0.875rem' }}
                >
                  {choice.label}
                </button>
              ))}
            </div>
            <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.5rem', marginBottom: 0 }}>
              {question.value !== null
                ? `Your prediction: ${(question.choices as ReadonlyArray<{ value: string; label: string }>).find((c) => c.value === question.value)?.label.toLowerCase()}.`
                : 'Choose an option to continue'}
            </p>
          </div>
        ))}

        <button
          type="button"
          className="action-button"
          onClick={run}
          disabled={!bothPredicted || status !== 'idle'}
          style={{ padding: '0.6rem 1.5rem' }}
        >
          {status === 'running' ? 'Running...' : 'Run'}
        </button>
        {status === 'complete' && (
          <button type="button" className="secondary-button" onClick={startOver} style={{ marginLeft: '0.75rem', padding: '0.6rem 1.25rem' }}>
            Start over
          </button>
        )}
        {!bothPredicted && status === 'idle' && (
          <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: 0 }}>Answer both predictions above to run the experiment.</p>
        )}

        {/* The run's stage, named (CLAUDE.md §14): what the learner is looking at now. */}
        <p style={{ fontSize: '0.875rem', margin: '1.5rem 0 0.75rem', minHeight: '1.5rem' }}>
          {status === 'idle' && <span style={{ color: 'var(--text-muted)' }}>The pictures fill in, one stage at a time, after you press Run.</span>}
          {status !== 'idle' && (
            <>
              <strong>
                {status === 'complete' ? 'Run complete' : `Stage ${stage} of ${LAST_STAGE}`}
              </strong>
              {status === 'running' && <>: {STAGES[stage - 1]}</>}
              {status === 'complete' && <span style={{ color: 'var(--text-muted)' }}> (all {LAST_STAGE} stages shown). Your predictions are recorded and not marked here.</span>}
            </>
          )}
        </p>

        {/* Picture 1: the measurements on one number line (sky blue = early universe, orange = nearby universe). */}
        <svg
          width={VIEW_WIDTH}
          height={334}
          viewBox={`0 0 ${VIEW_WIDTH} 334`}
          style={svgStyle}
          role="img"
          aria-label="Number line of expansion-rate measurements"
        >
          <text x={AXIS_LEFT} y={22} fill={TEXT_COLOR} fontSize="13" fontWeight="bold">
            Picture 1: the measurements on one number line
          </text>
          <AxisTicks y={axis1Y} />

          {/* The early-universe measurement: always drawn; a dashed line runs from it down to the axis */}
          <line x1={xOf(early.value)} y1={earlyY + 4} x2={xOf(early.value)} y2={axis1Y} stroke={EARLY_COLOR} strokeWidth={1} strokeDasharray="4 3" />
          <DotAndBar name={`${early.name} (early universe)`} value={early.value} uncertainty={early.uncertainty} y={earlyY} color={EARLY_COLOR} />

          {stage >= 2 && <DotAndBar name={late.name} value={late.value} uncertainty={late.uncertainty} y={lateY} color={LATE_COLOR} />}

          {stage >= 3 && (
            <g>
              <line x1={xOf(lo)} y1={lateY + 22} x2={xOf(hi)} y2={lateY + 22} stroke={TEXT_COLOR} strokeWidth={1.5} />
              <line x1={xOf(lo)} y1={lateY + 17} x2={xOf(lo)} y2={lateY + 27} stroke={TEXT_COLOR} strokeWidth={1.5} />
              <line x1={xOf(hi)} y1={lateY + 17} x2={xOf(hi)} y2={lateY + 27} stroke={TEXT_COLOR} strokeWidth={1.5} />
              <text x={(xOf(lo) + xOf(hi)) / 2} y={lateY + 42} fill={TEXT_COLOR} fontSize="12" textAnchor="middle">
                gap = {fixed2(result.gap)}
              </text>
            </g>
          )}

          {stage >= 7 &&
            result.otherLateTensions.map((o, i) => (
              <DotAndBar
                key={o.measurement.name}
                name={o.measurement.name}
                value={o.measurement.value}
                uncertainty={o.measurement.uncertainty}
                y={otherYs[i]}
                color={LATE_COLOR}
                opacity={0.85}
              />
            ))}
        </svg>

        {/* Guide to Picture 1: the first five bullets and the "what to look for" list are wording approved by the owner on 2026-10-17
            (the placeholder "in a later step" is now removed, since Run exists). The "gap" and "fainter orange" bullets are new draft wording
            for the owner's review (CLAUDE.md §14, §28.1, §29). It does not say whether the chosen measurement agrees with the
            early-universe value. */}
        <div style={{ marginTop: '1rem', marginBottom: '2rem', fontSize: '0.875rem', color: 'var(--text-muted)' }}>
          <p style={{ marginTop: 0, marginBottom: '0.5rem' }}>
            <strong>How to read this diagram.</strong> This picture is a <strong>number line</strong>, like the marks on a ruler. It is
            made to compare measurements of one thing, the expansion rate H₀. Each measurement is drawn as a dot with a bar through it, and
            where the dot sits on the line is the value that measurement found. The further right a dot sits, the faster that measurement
            says the universe is expanding today.
          </p>
          <ul style={{ margin: 0, paddingLeft: '1.25rem' }}>
            <li>
              <strong>The line and its numbers (64 to 78):</strong> values of H₀ in <strong>km/s/Mpc</strong>, which means “kilometres per
              second, for each megaparsec of distance”. For example, 67.4 means that a galaxy one megaparsec away (about 3.3 million
              light-years) is moving away at 67.4 kilometres per second, and one 100 megaparsecs away at 100 × 67.4 = 6,740 kilometres per
              second. Notice that the line starts at 64, not at 0. We zoom in on the narrow range where all the measurements fall, so that
              we can see them separately. That zoom makes small differences look big, so read the numbers, not just the gaps.
            </li>
            <li>
              <strong>A dot:</strong> one measurement’s best value, where it sits on the line. The name beside it says whose measurement it
              is and which kind.
            </li>
            <li>
              <strong>The thick bar through a dot:</strong> that measurement’s error bar, the range its “give or take” covers. The bar
              reaches as far left and as far right of the dot as the uncertainty. A longer bar means a less certain measurement, like a
              bathroom scale that jumps around more. The tape measure drawing in the introduction is a small example: “120.0, give or take
              0.5” is a dot at 120.0 with a bar from 119.5 to 120.5.
            </li>
            <li>
              <strong>The sky blue dot, bar and dashed line:</strong> the early-universe measurement, from the Planck satellite, 67.4 ± 0.5.
              Its bar runs from 66.9 (that is, 67.4 − 0.5) to 67.9 (67.4 + 0.5), so it is short: this is a very precise measurement. The
              dashed line runs straight down from the dot to the number line. It is a ruler you can hold against any other point, to see
              at once whether that point is to the left, to the right or on top of it.
            </li>
            <li>
              <strong>Orange dots and bars (they appear when you press Run):</strong> the nearby-universe measurements, made with the
              distance ladder or other methods. Blue always means the early-universe kind and orange the nearby-universe kind. The one you
              chose appears first, in its own row. The other nearby-universe measurements appear last, in rows below it, a little fainter,
              so that you can compare all of them at the end.
            </li>
            <li>
              <strong>The “gap” bracket (it appears in the third stage):</strong> a short horizontal line with a tick at each end, just
              under the orange row you chose. It spans from the blue dot’s value to the orange dot’s value, and the number written under
              it, in km/s/Mpc, is the distance between those two best values: the bigger value minus the smaller. In the table example, the
              gap between 120.0 and 121.0 would be 1.0.
            </li>
          </ul>
          <p style={{ marginTop: '0.5rem', marginBottom: '0.25rem' }}>
            <strong>What to look for, and what it would mean.</strong> Look at the picture once the other measurements have appeared. Here
            are three things to look at, and what each one would tell you.
          </p>
          <ul style={{ margin: 0, paddingLeft: '1.25rem' }}>
            <li>
              <strong>Where each orange dot sits compared with the dashed line.</strong> The dashed line is the early-universe value. An
              orange dot to the <em>right</em> of it is a measurement that found a faster expansion than the early-universe value. A dot on or
              very near the line found nearly the same value. A dot to the <em>left</em> found a slower expansion. The distance from the line
              tells you how big the difference is, in km/s/Mpc. But the distance alone does not yet tell you whether the difference matters.
              That needs the next two things.
            </li>
            <li>
              <strong>Whether an orange bar and the blue bar touch or overlap.</strong> If the bars overlap, there are values that both
              measurements say are plausible, so the two could easily be measuring the same true value, and the difference between their
              best values may be only chance. If there is a clear empty space between the bars, then even the “give or take” of each cannot
              close the gap, and the difference is harder to put down to chance. That empty space is the idea that sigma turns into a number.
            </li>
            <li>
              <strong>Which bars are long and which are short.</strong> A short bar is a precise measurement, and a long bar is a less
              certain one. This changes how to read the distance from the line. A dot that is far from the line but has a very long bar can
              still be consistent with the line, because it is uncertain. A dot that is just as far away but has a short bar is a bigger
              puzzle, because the measurement was precise and still landed there. This is why we compare the gap with the “give or take”,
              and do not look at the gap alone.
            </li>
          </ul>
        </div>

        {/* Picture 2: how much do the two uncertainties overlap? (bell curves; purple shading = the overlap) */}
        {status === 'idle' ? (
          <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)' }}>
            Pictures 2 and 3, and a guide to each, appear here when you press Run.
          </p>
        ) : (
          <>
            <svg
              width={VIEW_WIDTH}
              height={350}
              viewBox={`0 0 ${VIEW_WIDTH} 350`}
              style={svgStyle}
              role="img"
              aria-label="Bell curves for the two uncertainties and how many combined give-or-takes fit in the gap"
            >
              <text x={AXIS_LEFT} y={22} fill={TEXT_COLOR} fontSize="13" fontWeight="bold">
                Picture 2: how much do the two uncertainties overlap?
              </text>
              {stage >= 4 && (
                <>
                  <rect x={AXIS_LEFT} y={36} width={10} height={10} fill={OVERLAP_COLOR} opacity={0.75} />
                  <text x={AXIS_LEFT + 16} y={45} fill={TEXT_COLOR} fontSize="11">
                    purple area: the values both measurements accept (the overlap)
                  </text>
                  <polygon
                    points={`${xOf(AXIS_MIN)},${baseY} ${curvePath(early.value, early.uncertainty, baseY, scale, { mean: late.value, sd: late.uncertainty })} ${xOf(AXIS_MAX)},${baseY}`}
                    fill={OVERLAP_COLOR}
                    opacity={0.75}
                  />
                  <polyline points={curvePath(early.value, early.uncertainty, baseY, scale)} fill="none" stroke={EARLY_COLOR} strokeWidth={2} />
                  <polyline points={curvePath(late.value, late.uncertainty, baseY, scale)} fill="none" stroke={LATE_COLOR} strokeWidth={2} />
                  <text x={xOf(early.value)} y={baseY - bell(early.value, early.value, early.uncertainty) * scale - 8} fill={EARLY_COLOR} fontSize="12" textAnchor="middle">
                    {early.name}
                  </text>
                  <text x={xOf(late.value)} y={baseY - bell(late.value, late.value, late.uncertainty) * scale - 8} fill={LATE_COLOR} fontSize="12" textAnchor="middle">
                    {late.name}
                  </text>
                </>
              )}
              <AxisTicks y={baseY} />

              {stage >= 4 && (
                <g>
                  <line x1={xOf(lo)} y1={baseY + 66} x2={xOf(hi)} y2={baseY + 66} stroke={TEXT_COLOR} strokeWidth={1.5} />
                  <line x1={xOf(lo)} y1={baseY + 61} x2={xOf(lo)} y2={baseY + 71} stroke={TEXT_COLOR} strokeWidth={1.5} />
                  <line x1={xOf(hi)} y1={baseY + 61} x2={xOf(hi)} y2={baseY + 71} stroke={TEXT_COLOR} strokeWidth={1.5} />
                  <text x={xOf(hi) + 8} y={baseY + 70} fill={TEXT_COLOR} fontSize="12" textAnchor={xOf(hi) > 440 ? 'end' : 'start'} dx={xOf(hi) > 440 ? -8 : 0}>
                    gap = {fixed2(result.gap)}
                  </text>
                  <line x1={xOf(lo)} y1={baseY + 92} x2={xOf(lo + doubt)} y2={baseY + 92} stroke={OVERLAP_COLOR} strokeWidth={3} />
                  <text x={xOf(lo + doubt) + 8} y={baseY + 96} fill={OVERLAP_COLOR} fontSize="12">
                    one combined give-or-take = {fixed2(doubt)}
                  </text>
                </g>
              )}

              {stage >= 5 && (
                <g>
                  {Array.from({ length: wholeSegments }, (_, k) => k + 1).map((k) => (
                    <g key={k}>
                      <line x1={xOf(lo + k * doubt)} y1={baseY + 59} x2={xOf(lo + k * doubt)} y2={baseY + 73} stroke={OVERLAP_COLOR} strokeWidth={2} />
                      <text x={xOf(lo + (k - 0.5) * doubt)} y={baseY + 56} fill={OVERLAP_COLOR} fontSize="10" textAnchor="middle">
                        {k}
                      </text>
                    </g>
                  ))}
                  <text x={AXIS_LEFT} y={baseY + 130} fill={TEXT_COLOR} fontSize="13" fontWeight="bold">
                    sigma = {fixed2(result.gap)} ÷ {fixed2(doubt)} = {fixed2(result.tension)}
                  </text>
                </g>
              )}
            </svg>

            {/* Guide to Picture 2: draft wording for the owner's review (CLAUDE.md §14, §28.1, §29). It uses the table example's numbers,
                not the learner's, and does not say how many sigma the chosen measurement is, or whether the bell curves overlap much. */}
            <div style={{ marginTop: '1rem', marginBottom: '2rem', fontSize: '0.875rem', color: 'var(--text-muted)' }}>
              <p style={{ marginTop: 0, marginBottom: '0.5rem' }}>
                <strong>How to read this diagram.</strong> Picture 1 drew each measurement as a dot with an error bar. Picture 2 draws the
                same two measurements again, but shows the uncertainty in a richer way, as a <strong>bell curve</strong>, and then uses it to
                find sigma. It appears in the fourth and fifth stages of the run.
              </p>
              <ul style={{ margin: 0, paddingLeft: '1.25rem' }}>
                <li>
                  <strong>A bell curve:</strong> a hill that is highest in the middle and falls away on both sides. Here, the middle is a
                  measurement’s best value, and the height of the hill at any point shows how plausible it is that the true value is there.
                  The true value is most likely close to the best value, and less and less likely the further you go from it. (Think of
                  throwing darts at a target: most land near the middle, a few land far out.) The “give or take” sets how wide the hill is.
                  A very precise measurement is a tall, narrow hill. A less precise one is a lower, wider hill.
                </li>
                <li>
                  <strong>The sky blue hill:</strong> the early-universe measurement, Planck. <strong>The orange hill:</strong> the nearby-universe
                  measurement you chose. Each is labeled with its name. The line along the bottom is the same number line as Picture 1, in
                  km/s/Mpc.
                </li>
                <li>
                  <strong>The purple shaded area:</strong> the part where the two hills overlap, that is, the values that <em>both</em>{' '}
                  measurements consider plausible. A large purple area means the two could easily be measuring the same true value. A small
                  or missing purple area means there are hardly any values that both would accept.
                </li>
                <li>
                  <strong>The “gap” bracket</strong> under the line: the same gap as in Picture 1, the distance between the two best values.
                </li>
                <li>
                  <strong>The short purple bar, “one combined give-or-take”:</strong> the combined doubt about the gap, worked out as in the
                  introduction (multiply each give-or-take by itself, add, take the square root). Its length on the line is the length of one
                  “doubt”.
                </li>
                <li>
                  <strong>The numbered ticks along the gap (they appear in the fifth stage):</strong> they lay that one-doubt length end to
                  end along the gap, and number each full one, 1, 2, 3 and so on. The count of full doubts that fit, plus the leftover piece,
                  is <strong>sigma</strong>, and it is written underneath as the gap divided by the combined give-or-take. In the table
                  example, a gap of 1.0 and a doubt of 0.7 would show one full segment and a bit more, which is 1.4 sigma.
                </li>
              </ul>
              <p style={{ marginTop: '0.5rem', marginBottom: '0.25rem' }}>
                <strong>What to look for, and what it would mean.</strong> Here are three things to look at, and what each one would tell you.
              </p>
              <ul style={{ margin: 0, paddingLeft: '1.25rem' }}>
                <li>
                  <strong>How wide each hill is.</strong> A narrow, tall hill is a precise measurement: the true value is probably very close
                  to its best value. A wide, low hill is a less precise one. So two narrow hills that sit far apart are a stronger
                  disagreement than two wide hills the same distance apart, because the wide ones could each easily be off by that much.
                </li>
                <li>
                  <strong>How much purple there is.</strong> Purple is the set of values that both measurements accept. A lot of purple means
                  the two measurements agree about many possible true values, so there is no real conflict. A thin sliver of purple, or none
                  at all, means there are almost no values that both would accept, so the two measurements are hard to reconcile.
                </li>
                <li>
                  <strong>How many numbered ticks fit along the gap.</strong> Each tick is one combined give-or-take. If only one or two fit,
                  the gap is about the size of the doubt itself, and chance can easily explain it. The more that fit, the less likely it is that
                  chance alone explains the gap. As the introduction said, 5 or more is the usual bar in science for calling a difference real
                  rather than chance. The last, partly filled piece counts too, which is why sigma is not always a whole number.
                </li>
              </ul>
            </div>

            {/* Picture 3: what the gap means for the age of the universe */}
            <svg
              width={VIEW_WIDTH}
              height={230}
              viewBox={`0 0 ${VIEW_WIDTH} 230`}
              style={svgStyle}
              role="img"
              aria-label="Hubble time for each of the two values, in billions of years"
            >
              <text x={AXIS_LEFT} y={22} fill={TEXT_COLOR} fontSize="13" fontWeight="bold">
                Picture 3: what the gap means for the age of the universe
              </text>
              {stage >= 6 && (
                <>
                  <rect x={AXIS_LEFT} y={56} width={ageX(result.earlyHubbleTimeBillionYears) - AXIS_LEFT} height={30} fill={EARLY_COLOR} opacity={0.9} />
                  <text x={AXIS_LEFT + 8} y={76} fill="#0b1020" fontSize="12" fontWeight="bold">
                    {early.name}: {result.earlyHubbleTimeBillionYears.toFixed(2)} billion years
                  </text>
                  <rect x={AXIS_LEFT} y={102} width={ageX(result.lateHubbleTimeBillionYears) - AXIS_LEFT} height={30} fill={LATE_COLOR} opacity={0.9} />
                  <text x={AXIS_LEFT + 8} y={122} fill="#0b1020" fontSize="12" fontWeight="bold">
                    {late.name}: {result.lateHubbleTimeBillionYears.toFixed(2)} billion years
                  </text>
                  <line x1={ageX(REAL_AGE_BILLION)} y1={44} x2={ageX(REAL_AGE_BILLION)} y2={148} stroke={AGE_COLOR} strokeWidth={2} strokeDasharray="5 3" />
                  <text x={ageX(REAL_AGE_BILLION)} y={158} fill={AGE_COLOR} fontSize="11" textAnchor="middle">
                    real age, about 13.8 (full model)
                  </text>
                </>
              )}
              <line x1={AXIS_LEFT} y1={176} x2={AXIS_RIGHT} y2={176} stroke={MUTED_COLOR} strokeWidth={1.5} />
              {[0, 2, 4, 6, 8, 10, 12, 14, 16].map((t) => (
                <g key={t}>
                  <line x1={ageX(t)} y1={172} x2={ageX(t)} y2={180} stroke={MUTED_COLOR} />
                  <text x={ageX(t)} y={194} fill={MUTED_COLOR} fontSize="11" textAnchor="middle">
                    {t}
                  </text>
                </g>
              ))}
              <text x={(AXIS_LEFT + AXIS_RIGHT) / 2} y={216} fill={TEXT_COLOR} fontSize="12" textAnchor="middle">
                Hubble time, 1 ÷ H₀ (billions of years)
              </text>
            </svg>

            {/* Guide to Picture 3: draft wording for the owner's review (CLAUDE.md §14, §28.1, §29). It uses H₀ = 70 as its worked moment,
                not the learner's values, and says nothing about which bar is longer in this run. */}
            <div style={{ marginTop: '1rem', marginBottom: '1rem', fontSize: '0.875rem', color: 'var(--text-muted)' }}>
              <p style={{ marginTop: 0, marginBottom: '0.5rem' }}>
                <strong>How to read this diagram.</strong> The expansion rate is a speed, so it can be run backwards in time. If galaxies
                have always moved apart at today’s rate, then earlier they were closer, and long enough ago everything was in one place. How
                long ago is the <strong>Hubble time</strong>, which is 1 ÷ H₀ (Cosmology Experiment 2). It is a rough age of the universe: the
                age it would have if the expansion had never sped up or slowed down. Picture 3 shows that rough age for each of the two
                values. It appears in the sixth stage of the run.
              </p>
              <ul style={{ margin: 0, paddingLeft: '1.25rem' }}>
                <li>
                  <strong>The line along the bottom (0 to 16):</strong> time, in billions of years. One billion is a thousand million.
                </li>
                <li>
                  <strong>The sky blue bar:</strong> the Hubble time that the early-universe value (Planck) gives. <strong>The orange
                  bar:</strong> the Hubble time that the measurement you chose gives. The number on each bar is its length, in billions of
                  years. A longer bar means a longer time since everything was together.
                </li>
                <li>
                  <strong>Why a faster expansion gives a shorter bar:</strong> a faster expansion would have taken less time to spread
                  everything out to its present size, as a faster car takes less time to cover the same road. For example, H₀ = 70 gives
                  about 14.0 billion years (977.8 ÷ 70), and H₀ = 73 gives about 13.4 (977.8 ÷ 73).
                </li>
                <li>
                  <strong>The yellow dashed line, “real age, about 13.8”:</strong> the age of the universe from the full model that you met in
                  Cosmology Experiment 6, which does not assume the expansion rate was always the same. The bars are rougher than this line.
                  They are drawn so you can compare the two values with each other, not so that either has to land on the line.
                </li>
              </ul>
              <p style={{ marginTop: '0.5rem', marginBottom: '0.25rem' }}>
                <strong>What to look for, and what it would mean.</strong> Here are two things to look at, and what each one would tell you.
              </p>
              <ul style={{ margin: 0, paddingLeft: '1.25rem' }}>
                <li>
                  <strong>How much longer one bar is than the other, in billions of years.</strong> This is what the gap between the two
                  expansion rates would mean for the age of the universe. A small difference between the bars means the two values would give
                  nearly the same age. A large difference means they would give noticeably different ages, so the disagreement matters for
                  more than one number: it changes the story of how old the universe is. Read the difference from the numbers written on the
                  bars, not only from how the bars look.
                </li>
                <li>
                  <strong>Where each bar ends compared with the yellow line.</strong> A bar that ends to the right of the yellow line gives a
                  rough age older than the full model’s 13.8. A bar that ends to the left gives a younger one. Because the bars use a rough
                  rule, a small gap to the line is not a problem in itself. They are not meant to land on it. What matters is the size of the
                  difference between the bars.
                </li>
              </ul>
            </div>

            {/* Results: neutral (nothing says why the two values differ), shown only after the run. Draft wording for the owner's review
                (CLAUDE.md §28.1, §29). The predictions are recorded and not marked; the tutor marks them later. */}
            {status === 'complete' && (
              <div style={{ marginTop: '2rem', fontSize: '0.875rem' }}>
                <h3 style={{ marginTop: 0 }}>Results</h3>
                <p style={{ color: 'var(--text-muted)', marginTop: 0 }}>
                  These are the numbers behind the three pictures, for {late.name} compared with {early.name}. They only report what was
                  measured and calculated. They do not say why the numbers are what they are.
                </p>

                <table style={{ borderCollapse: 'collapse', width: '100%', marginBottom: '1.5rem' }}>
                  <tbody>
                    {(
                      [
                        [`${early.name} (early universe)`, `${early.value} ± ${early.uncertainty} km/s/Mpc`],
                        [`${late.name} (nearby universe)`, `${late.value} ± ${round2(late.uncertainty)} km/s/Mpc`],
                        ['Gap between the best values', `${fixed2(shown.gap)} km/s/Mpc`],
                        [`Combined give-or-take${stretch === 1 ? '' : ` (error bars ×${stretch})`}`, `${fixed2(shown.combinedUncertainty)} km/s/Mpc`],
                        [`Sigma${stretch === 1 ? '' : ` (error bars ×${stretch})`}`, `${fixed2(shown.tension)}`],
                        [`Hubble time from ${early.name}`, `${shown.earlyHubbleTimeBillionYears.toFixed(2)} billion years`],
                        [`Hubble time from ${late.name}`, `${shown.lateHubbleTimeBillionYears.toFixed(2)} billion years`],
                      ] as const
                    ).map(([name, value]) => (
                      <tr key={name} style={{ borderBottom: '1px solid var(--border-color, #ccc)' }}>
                        <td style={{ padding: '0.4rem 0.5rem 0.4rem 0' }}>{name}</td>
                        <td style={{ padding: '0.4rem 0', fontWeight: 'bold', textAlign: 'right' }}>{value}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>

                <p style={{ fontWeight: 'bold', marginBottom: '0.5rem' }}>Every nearby-universe measurement, compared with {early.name}</p>
                <table style={{ borderCollapse: 'collapse', width: '100%', marginBottom: '1.5rem' }}>
                  <thead>
                    <tr style={{ borderBottom: '2px solid var(--border-color, #ccc)', textAlign: 'left' }}>
                      <th style={{ padding: '0.4rem 0.5rem 0.4rem 0' }}>Measurement</th>
                      <th style={{ padding: '0.4rem 0.5rem' }}>Published value (km/s/Mpc)</th>
                      <th style={{ padding: '0.4rem 0', textAlign: 'right' }}>Sigma from {early.name}{stretch === 1 ? '' : ` (×${stretch})`}</th>
                    </tr>
                  </thead>
                  <tbody>
                    {LATE_MEASUREMENTS.map((m) => {
                      const sigma = m === late ? shown.tension : shown.otherLateTensions.find((o) => o.measurement === m)!.tension
                      return (
                        <tr key={m.name} style={{ borderBottom: '1px solid var(--border-color, #ccc)', fontWeight: m === late ? 'bold' : 'normal' }}>
                          <td style={{ padding: '0.4rem 0.5rem 0.4rem 0' }}>
                            {m.name}
                            {m === late ? ' (the one you chose)' : ''}
                          </td>
                          <td style={{ padding: '0.4rem 0.5rem' }}>
                            {m.value} ± {round2(m.uncertainty)}
                          </td>
                          <td style={{ padding: '0.4rem 0', textAlign: 'right' }}>{fixed2(sigma)}</td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>

                <p style={{ fontWeight: 'bold', marginBottom: '0.5rem' }}>What if the error bars were bigger?</p>
                <p style={{ color: 'var(--text-muted)', marginTop: 0, marginBottom: '0.5rem' }}>
                  Pretend that every “give or take” above, in every row, were this many times larger. The tables update. The three pictures stay
                  as they were, drawn with the published error bars.
                </p>
                <div style={{ marginBottom: '1.5rem' }}>
                  {STRETCH_CHOICES.map((k) => (
                    <button
                      key={k}
                      type="button"
                      onClick={() => setStretch(k)}
                      className={`toggle-button${stretch === k ? ' is-selected' : ''}`}
                      style={{ marginRight: '0.5rem', marginBottom: '0.5rem', padding: '0.5rem 1rem', fontSize: '0.875rem' }}
                    >
                      ×{k}
                    </button>
                  ))}
                </div>

                <p style={{ fontWeight: 'bold', marginBottom: '0.5rem' }}>Your predictions (recorded, not marked here)</p>
                <ul style={{ marginTop: 0, paddingLeft: '1.25rem' }}>
                  <li>
                    <strong>Prediction 1, how many sigma apart:</strong> {label(SIGMA_CHOICES, sigmaPrediction)}.
                  </li>
                  <li>
                    <strong>Prediction 2, what the Webb telescope changed:</strong> {label(WEBB_CHOICES, webbPrediction)}.
                  </li>
                </ul>

                {/* How to read the results: draft wording (CLAUDE.md §29). It explains each row and the control, and says nothing about why the
                    values differ. */}
                <div style={{ color: 'var(--text-muted)', marginTop: '1.5rem' }}>
                  <p style={{ marginTop: 0, marginBottom: '0.5rem' }}>
                    <strong>How to read these results.</strong>
                  </p>
                  <ul style={{ margin: 0, paddingLeft: '1.25rem' }}>
                    <li>
                      <strong>Gap:</strong> the difference between the two best values: the bigger one minus the smaller one. It is the same
                      gap as in Pictures 1 and 2.
                    </li>
                    <li>
                      <strong>Combined give-or-take:</strong> the doubt about the gap, worked out from the two uncertainties as in the
                      introduction (multiply each by itself, add, take the square root).
                    </li>
                    <li>
                      <strong>Sigma:</strong> the gap divided by the combined give-or-take: how many of those doubts fit inside the gap. About 1
                      is an ordinary difference. 5 or more is the usual bar for calling a difference real rather than chance. The scientists’
                      own papers use more careful statistics, so a sigma they quote can differ a little from the one here.
                    </li>
                    <li>
                      <strong>Hubble time:</strong> 1 ÷ H₀ in billions of years, the rough age that each value gives, as in Picture 3. It is a
                      rough age, not the real one.
                    </li>
                    <li>
                      <strong>The second table:</strong> every nearby-universe measurement, each compared with {early.name} in exactly the same way,
                      so you can see them side by side. The one you chose is in bold.
                    </li>
                    <li>
                      <strong>“What if the error bars were bigger?”:</strong> this makes every give-or-take ×1.5, ×2, ×3 or ×5 times larger.
                      The gaps stay the same, but the combined give-or-take grows by the same factor, so every sigma is divided by that factor.
                      For example, a gap of 4.0 sigma would become 2.0 sigma with error bars twice as large. It is only a what-if, to show how
                      much the sigma depends on how large the uncertainties are. It is not a claim that anyone’s error bars are wrong. Pick ×1
                      to go back to the published ones.
                    </li>
                  </ul>
                </div>
              </div>
            )}

            {/* The tutor: observe, compare with the predictions, one conceptual question, then the explanation. The summary below the
                experiment (in App) is shown only once the learner reaches the explanation. */}
            {status === 'complete' && sigmaPrediction !== null && webbPrediction !== null && (
              <HubbleTensionTutor
                late={late}
                sigmaPrediction={sigmaPrediction}
                webbPrediction={webbPrediction}
                onExplained={() => onTutorComplete?.()}
              />
            )}
          </>
        )}
      </div>
    </div>
  )
}
