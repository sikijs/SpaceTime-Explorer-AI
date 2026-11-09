import { useCallback, useEffect, useRef, useState, type ReactNode } from 'react'
import { runInvariantLightSpeedExperiment } from '../physics/invariantLightSpeedExperiment'
import type { InvariantLightSpeedResult, RuleChoice, RuleResult } from '../physics/invariantLightSpeedExperiment'
import { MIRROR_SEPARATION, REST_TICK_DURATION } from '../physics/lightClockExperiment'
import { Experiment5Tutor } from './Experiment5Tutor'
import type { Experiment5Prediction } from './Experiment5Tutor'
import { BarsCaption, GUESS_COLOR, PanelsCaption, ThreeClockPanels, TickBars } from './Experiment5Pictures'
import { ReferencePanel } from './EnergyMomentumExperiment'
import { PartHeader } from './GravitationalWaveExperiment'

// Relativity of Time and Motion, Experiment 5, audited to the newer rules (docs/audit/relativity-of-time-and-motion/
// 05-draft-wording.md, approved by the owner on 2026-11-09): the page in four Parts, labels on the canvas, three tick bars with two
// white YOUR GUESS marks and a white choice marker, the everyday rule drawn in violet and labelled imagined, a Part 2 drawing for the
// learner's own speed, captions, a words box, links, Start over and a tutor that points to the marks. Every number drawn comes from
// the physics module (src/physics/invariantLightSpeedExperiment.ts; CLAUDE.md §9). The wording is the owner's to approve line by
// line (CLAUDE.md §28.1).

// Part 1 uses this fixed speed; Part 2 lets the learner choose others.
export const PART1_VELOCITY = 0.5
const VELOCITY_PRESETS = [0.1, 0.3, 0.5, 0.8] as const

type VelocityOption = 0.1 | 0.3 | 0.5 | 0.8 | 'other'
type RunStatus = 'idle' | 'running' | 'complete'

// Playback only: real milliseconds shown per lab second. Never affects the physical result.
const PLAYBACK_MS_PER_LAB_SECOND = 2000

const RULE_CHOICE_LABELS: Record<RuleChoice, string> = {
  everyday: 'Everyday rule',
  actual: "Light's actual rule",
  same: 'Both the same',
}

function describeChoice(choice: RuleChoice): string {
  if (choice === 'same') return 'both rules give the same tick'
  if (choice === 'everyday') return 'the everyday rule gives the longer tick'
  return "light's actual rule gives the longer tick"
}

function describePrediction(p: Experiment5Prediction): string {
  return `Your prediction: ${describeChoice(p.choice)}. Everyday rule: ${p.everydayTick} s. Light's actual rule: ${p.actualTick} s.`
}

// The clocks' playback: only presentation. The result comes from the physics module and never depends on this.
function useClockRunner(onFinish?: () => void) {
  const [status, setStatus] = useState<RunStatus>('idle')
  const [time, setTime] = useState(0)
  const [total, setTotal] = useState(0)
  const finishRef = useRef(onFinish)
  finishRef.current = onFinish

  useEffect(() => {
    if (status !== 'running') return
    const animationDurationMs = total * PLAYBACK_MS_PER_LAB_SECOND
    const startTime = performance.now()
    let frameId = 0
    const animate = (now: number) => {
      // A frame timestamp can fall slightly before startTime; never let lab time go negative.
      const progress = Math.min(Math.max((now - startTime) / animationDurationMs, 0), 1)
      setTime(progress * total)
      if (progress >= 1) {
        setTime(total)
        setStatus('complete')
        finishRef.current?.()
        return
      }
      frameId = requestAnimationFrame(animate)
    }
    frameId = requestAnimationFrame(animate)
    return () => cancelAnimationFrame(frameId)
  }, [status, total])

  const start = useCallback((runTotal: number) => {
    setTime(0)
    setTotal(runTotal)
    setStatus('running')
  }, [])
  const reset = useCallback(() => {
    setStatus('idle')
    setTime(0)
    setTotal(0)
  }, [])
  return { status, time, total, start, reset }
}

function ExternalLink({ href, children }: { href: string; children: ReactNode }) {
  return (
    <a href={href} target="_blank" rel="noopener noreferrer">
      {children}
    </a>
  )
}

// Pages fetched on 9 November 2026 by a helper (a summary of each page was returned, not its raw text; see the audit's draft
// wording, section 2). Gaps recorded there: no NASA, ESA, CERN or NIST page states Einstein's postulate; no official page for a
// ball thrown from a moving train; no plain page for the light-second; this page uses no real result, so there is no paper to link.
const PLAIN_LINKS = [
  {
    href: 'https://science.nasa.gov/universe/exoplanets/our-milky-way-galaxy-how-big-is-space/',
    label: 'NASA Science: "Our Milky Way Galaxy: How Big is Space?"',
    what: 'a short, friendly article on how fast light travels, 186,000 miles (300,000 kilometers) every second. (NASA Science, Exoplanet Exploration Program; updated April 2024.)',
  },
  {
    href: 'https://www.grc.nasa.gov/www/k-12/airplane/move.html',
    label: 'NASA Glenn: "Relative Velocity - Ground Reference"',
    what: 'a plain page on how speeds combine when you measure from different places, using an aircraft and the wind. It is about wind and airspeed, not a ball thrown from a train, and it says nothing about light. (NASA Glenn Research Center; last updated May 2021.)',
  },
  {
    href: 'https://pwg.gsfc.nasa.gov/stargaze/Lframes1.htm',
    label: 'NASA ISTP, Stargazers: "Lesson 23: Frames of Reference: The Basics"',
    what: 'a plain explanation of a frame of reference, with a plane in moving air and a raindrop seen from a moving car. It is old (2004) and says a little more than this page does. (International Solar Terrestrial Physics, NASA Goddard.)',
  },
]

// Held back until the tutor has explained: both pages state which rule gives the longer tick.
const AFTER_TUTOR_LINKS = [
  {
    href: 'https://www.einstein-online.info/en/spotlight/light-clocks-time-dilation/',
    label: 'Einstein Online: "From light clocks to time dilation"',
    what: 'the light clock explained again in plain words with no algebra: light goes at the same speed for everyone, and the moving clock\'s tick is longer. (Max Planck Institute for Gravitational Physics, Einstein Online, 2021.)',
  },
  {
    href: 'https://www.einstein-online.info/en/?p=6559',
    label: 'Einstein Online: "Elementary Tour, part 4: The speed of light"',
    what: 'a plain page on light\'s constant speed, "independent of the motion of the light source", from cars on a highway and a space station. It also says in one line that moving clocks run slower. (Max Planck Institute for Gravitational Physics, Einstein Online.)',
  },
]

// The "Words and formulas" box: terms and one formula (speed = distance ÷ time). The formulas for the two rules' ticks are not given,
// because they would give away what the learner is asked to predict.
const REFERENCE_ENTRIES: { term: string; meaning: string }[] = [
  { term: 'Light clock', meaning: 'a clock made of two mirrors facing each other, with a flash of light bouncing between them. It counts each round trip of the flash.' },
  { term: 'Tick', meaning: 'one round trip of the flash, up to the top mirror and back. The clock counts ticks to measure time.' },
  { term: 'Mirror', meaning: 'a flat shiny surface that bounces light back.' },
  { term: 'Light source', meaning: 'the small lamp inside the clock that sends out the flash.' },
  { term: 'Light pulse', meaning: 'a very short flash of light.' },
  { term: 'Light-second', meaning: 'the distance light travels in one second, about 300,000 km.' },
  { term: 'Lab seconds', meaning: 'seconds counted by the clocks standing still in the lab.' },
  { term: 'Lab time', meaning: 'the time shown on the lab’s clocks.' },
  { term: 'Reference frame', meaning: 'a group of people and clocks that are all standing still relative to one another, so that none moves compared with the others. The lab is one; the moving clock has its own.' },
  { term: 'At rest / moving', meaning: 'standing still, or not standing still, compared with the lab.' },
  { term: 'Sideways', meaning: 'across the light’s up-and-down path, not along it.' },
  { term: 'c', meaning: 'the speed of light, about 300,000 km every second. 0.5c is half of that, and 1.000c means exactly the speed of light.' },
  { term: 'Everyday rule', meaning: 'this page’s name for “speeds add”: the idea that light gets the lamp’s speed added to its own, like a ball thrown from a moving train. It is a “what if”, not something that happens in nature.' },
  { term: 'Light’s actual rule', meaning: 'this page’s name for the rule used in this course: seen from the lab, light always goes at c, whatever its source is doing.' },
  { term: 'What if (imagined)', meaning: 'drawn in violet and labelled “imagined”. It is something we picture to see what would change; no instrument measured it.' },
  { term: 'Time dilation factor', meaning: 'the rest clock’s tick divided by the moving clock’s tick, on the lab’s clocks. 1 means no slowing; a smaller number means the moving clock’s ticks are farther apart.' },
  { term: 'Postulate', meaning: 'a starting point a theory is built on, not something the theory proves. That light goes at c in the lab is one of the two postulates of Einstein’s special theory of relativity.' },
  { term: 'Formula, speed = distance ÷ time', meaning: 'the results use it for light’s speed seen from the lab. Worked example from this page: light that travels 1.000 light-second in 1.000 second has a speed of 1.000 ÷ 1.000 = 1.000 light-second every second, which is 1.000c. (The formulas for the two rules’ tick lengths are not given here, because they would give away what you are asked to predict.)' },
]

const paragraph = { marginTop: 0, marginBottom: '0.75rem' } as const
const smallNote = { fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.25rem' } as const
const resultLine = { margin: '0.5rem 0', fontSize: '0.875rem' } as const
const resultBlock = { marginBottom: '1.5rem', paddingTop: '1rem', borderTop: '1px solid var(--border)' } as const

function Block({ children }: { children: ReactNode }) {
  return <div style={{ marginTop: '1rem' }}>{children}</div>
}

function WhereFrom({ children }: { children: ReactNode }) {
  return (
    <p style={{ marginTop: '0.5rem', marginBottom: 0, fontSize: '0.75rem' }}>
      <strong>Where the real picture comes from.</strong> {children}
    </p>
  )
}

function GuessTag() {
  return (
    <span
      style={{
        marginLeft: '0.4rem',
        padding: '0.05rem 0.4rem',
        fontSize: '0.75rem',
        fontWeight: 'bold',
        color: GUESS_COLOR,
        backgroundColor: '#0b1020',
        border: `1px solid ${GUESS_COLOR}`,
        borderRadius: '4px',
        whiteSpace: 'nowrap',
      }}
    >
      your guess
    </span>
  )
}

// Values only, as reported by the physics model; no explanation here (that comes from the tutor).
function RuleResultBlock({ title, rule, tagged }: { title: string; rule: RuleResult; tagged: boolean }) {
  return (
    <div style={resultBlock}>
      <p style={{ ...resultLine, fontWeight: 'bold' }}>{title}</p>
      <p style={resultLine}>Distance the light travels in one tick: {rule.lightPath.toFixed(3)} light-seconds</p>
      <p style={resultLine}>
        Time for one tick, on the lab&rsquo;s clocks: {rule.movingTickDuration.toFixed(3)} s
        {tagged && (
          <>
            <GuessTag />
            <span style={{ marginLeft: '0.4rem', fontSize: '0.75rem', color: 'var(--text-muted)' }}>
              Your guess is drawn on Part 1&rsquo;s bars as a white mark.
            </span>
          </>
        )}
      </p>
      <p style={resultLine}>Light&rsquo;s speed, seen from the lab (distance ÷ time): {rule.lightSpeedInLab.toFixed(3)}c</p>
      <p style={resultLine}>Time dilation factor (rest tick ÷ moving tick; 1 means no slowing): {rule.timeDilationFactor.toFixed(3)}</p>
    </div>
  )
}

interface RunRecord {
  result: InvariantLightSpeedResult
}

interface Experiment5Props {
  onComplete?: () => void
  onTutorComplete?: () => void
}

export function Experiment5({ onComplete, onTutorComplete }: Experiment5Props) {
  const [choice, setChoice] = useState<RuleChoice | null>(null)
  const [everydayInput, setEverydayInput] = useState('')
  const [actualInput, setActualInput] = useState('')
  const [submitted, setSubmitted] = useState<Experiment5Prediction | null>(null)
  const [velocity, setVelocity] = useState<VelocityOption>(0.8)
  const [customVelocity, setCustomVelocity] = useState('')
  const [part2Runs, setPart2Runs] = useState<RunRecord[]>([])
  const [part2Experiment, setPart2Experiment] = useState<InvariantLightSpeedResult | null>(null)
  const [explained, setExplained] = useState(false)
  const part1 = useClockRunner(onComplete)
  const part2 = useClockRunner()
  const part1Ref = useRef<HTMLDivElement>(null)
  const part2Ref = useRef<HTMLDivElement>(null)

  const part1Result = runInvariantLightSpeedExperiment(PART1_VELOCITY)
  const part1Running = part1.status === 'running'
  const part1Done = part1.status === 'complete'
  const part2Running = part2.status === 'running'
  const part2Done = part2.status === 'complete'
  const locked = submitted !== null

  const everydayValue = everydayInput.trim() ? Number(everydayInput) : null
  const actualValue = actualInput.trim() ? Number(actualInput) : null
  const prediction: Experiment5Prediction | null =
    choice !== null && everydayValue !== null && isFinite(everydayValue) && actualValue !== null && isFinite(actualValue)
      ? { choice, everydayTick: everydayValue, actualTick: actualValue }
      : null

  const selectedVelocity = velocity === 'other' ? Number(customVelocity) : velocity
  const speedValid = isFinite(selectedVelocity) && selectedVelocity >= 0.01 && selectedVelocity <= 0.99
  const speedText = speedValid ? `${selectedVelocity}c` : '—'

  const hasAnythingToClear =
    choice !== null || everydayInput !== '' || actualInput !== '' || locked || part1.status !== 'idle' || part2Runs.length > 0
  const startOverDisabled = !hasAnythingToClear || part1Running || part2Running

  const handleStart = () => {
    if (prediction === null || locked) return
    setSubmitted(prediction)
    part1.start(part1Result.actualRule.movingTickDuration)
    // Bring the three clocks fully into view so the learner can watch the run.
    part1Ref.current?.scrollIntoView({ behavior: 'smooth', block: 'center' })
  }

  const handleRunPart2 = () => {
    if (!speedValid || part1Running || part2Running) return
    const run = runInvariantLightSpeedExperiment(selectedVelocity)
    setPart2Experiment(run)
    part2.start(run.actualRule.movingTickDuration)
    part2Ref.current?.scrollIntoView({ behavior: 'smooth', block: 'center' })
  }

  // Record each finished Part 2 run once.
  useEffect(() => {
    if (part2Done && part2Experiment) {
      setPart2Runs((runs) => [...runs, { result: part2Experiment }])
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [part2Done])

  // Start over: clears the guesses, the runs, the results and the tutor, and returns the page to its first state.
  const handleStartOver = () => {
    part1.reset()
    part2.reset()
    setChoice(null)
    setEverydayInput('')
    setActualInput('')
    setSubmitted(null)
    setVelocity(0.8)
    setCustomVelocity('')
    setPart2Runs([])
    setPart2Experiment(null)
    setExplained(false)
  }

  const lastPart2 = part2Runs.length > 0 ? part2Runs[part2Runs.length - 1] : null
  const inputStyle = (disabled: boolean) => ({
    padding: '0.5rem',
    fontSize: '0.875rem',
    width: '200px',
    opacity: disabled ? 0.6 : 1,
    cursor: disabled ? 'not-allowed' : 'text',
  })
  // Part 2's panels: the run's own geometry once started; before that, a preview for the chosen speed.
  const part2Geometry = part2Experiment ?? (speedValid ? runInvariantLightSpeedExperiment(selectedVelocity) : null)
  const buttonStyle = (disabled: boolean) => ({
    marginRight: '0.5rem',
    padding: '0.5rem 1rem',
    fontSize: '0.875rem',
    opacity: disabled ? 0.6 : 1,
  })

  return (
    <div style={{ padding: '2rem', maxWidth: '900px', margin: '0 auto' }}>
      <h2>Experiment 5 — Why Can't Light Go Faster?</h2>

      <div className="exp-card" style={{ marginTop: '2rem', padding: '1.5rem' }}>
        <div style={{ marginBottom: '2rem', fontSize: '0.875rem', color: 'var(--text-muted)' }}>
          <p style={paragraph}>
            <strong>The question.</strong> In &ldquo;Why time dilation happens&rdquo; we explained time dilation by assuming one thing
            about light. Here we ask: what if that assumption were different? Would a moving clock still behave the same way?
            You will find out by comparing two possible rules for light.
          </p>
          <p style={paragraph}>
            <strong>Step 1: the light clock (a reminder).</strong> A light clock is a clock made from a flash of light that bounces
            up and down between two mirrors, one above the other. It is like a ball bouncing between the floor and the ceiling, with
            one bounce up and one bounce back down counted as one <strong>tick</strong>.
          </p>
          <p style={paragraph}>
            <strong>Step 2: how big is our clock?</strong> Light travels about 300,000 km in one second. The distance light travels in
            one second has a name: a <strong>light-second</strong>. We place the two mirrors half a light-second apart, which is about{' '}
            {(MIRROR_SEPARATION * 300000).toLocaleString('en-US')} km. So the light needs half a second to go from one mirror to the
            other, and one second for the whole trip up and back. That means one tick takes exactly {REST_TICK_DURATION} second when
            the clock is standing still. Real light clocks are much smaller: with the mirrors only 15 cm apart, a clock would tick
            about a billion times a second. We use a giant clock so that the numbers are easy to read.
          </p>
          <p style={paragraph}>
            <strong>Step 3: now make the clock move.</strong> Inside the clock there is a small lamp, called the{' '}
            <strong>light source</strong>, that sends out the flash. In the moving clock, the lamp, the mirrors and everything else
            slide sideways together, while the flash goes up and down. Picture a car driving past you at night with its headlights
            on. The moving clock is like the car, and its lamp is like the headlights.
          </p>
          <p style={{ marginTop: 0, marginBottom: '0.25rem' }}>
            <strong>Step 4: the two rules.</strong> Here is the question this experiment asks. The car is moving. Does that change
            how fast its headlight beam travels, as seen by someone standing at the roadside? Likewise, does the lamp&rsquo;s sideways
            movement change how fast its light travels? There are two possible answers, which we call rules:
          </p>
          <ul style={{ marginTop: 0, marginBottom: '0.75rem', paddingLeft: '1.25rem' }}>
            <li>
              <strong>The everyday rule: speeds add.</strong> Imagine you are on a moving train and you throw a ball forward. Someone
              standing on the ground sees the ball go faster than a ball thrown from a standing train, because the train&rsquo;s speed
              is added to the ball&rsquo;s speed. The everyday rule says light works the same way: the lamp&rsquo;s speed is added to
              the light&rsquo;s speed. This is only a &ldquo;what if&rdquo;. It is what everyday life would lead us to guess, not a
              claim about how light really works. The page draws this clock in violet and labels it <strong>imagined</strong>, so you
              can tell it from the clocks that follow the real rule.
            </li>
            <li>
              <strong>Light&rsquo;s actual rule: light always goes at c.</strong> Seen from the lab, light always travels at the same
              speed, called <strong>c</strong> (about 300,000 km every second), however fast the lamp that sent it out is moving. The
              lamp&rsquo;s speed is not added. This is the rule we use for light in this course (it is Einstein&rsquo;s postulate, as in
              &ldquo;Why time dilation happens&rdquo;).
            </li>
          </ul>
          <p style={paragraph}>
            <strong>What you will see.</strong> Three clocks start at the same moment:
          </p>
          <ul style={{ marginTop: 0, marginBottom: '0.75rem', paddingLeft: '1.25rem' }}>
            <li>one clock standing still in the lab (the place where the experiment is set up);</li>
            <li>one moving clock where light follows the everyday rule (violet, imagined);</li>
            <li>one moving clock where light follows its actual rule.</li>
          </ul>
          <p style={paragraph}>
            We watch one tick of each clock and draw the path the light takes. In Part 1 the moving clock goes at {PART1_VELOCITY}c,
            which is half the speed of light. When the run ends, three bars appear that show how long each tick took, timed by the
            lab&rsquo;s clocks. In Part 2 you choose any speed and run that.
          </p>
          <p style={paragraph}>
            <strong>Your job.</strong> Before you press START, make three guesses. First, which rule makes the moving clock&rsquo;s
            tick take longer? Second and third, how many seconds will one tick take under each rule? These seconds are{' '}
            <strong>lab seconds</strong>: seconds counted by clocks standing still in the lab. A wrong guess is fine, and guesses are
            not scored. Then watch the clocks, try other speeds in Part 2, and talk it over with the tutor.
          </p>
          <p style={paragraph}>
            <strong>Your guesses and the real pictures.</strong> Your guesses never change the real pictures, the clocks or the
            numbers: they come from a calculation that knows nothing about what you guessed. Your two tick guesses are drawn on the
            bars in white, each in a box labelled YOUR GUESS. Your choice of rule is drawn as a white marker (a marker only: it has no
            size, it just points at the rule you chose). All three guesses are shown again beside the results. In Part 2 the speed you
            choose does change the clocks and the drawings, and the marks it moves are pink.
          </p>
          <p style={paragraph}>
            <strong>Some new words.</strong> The &ldquo;Words and formulas&rdquo; box below has each one, with a short plain
            meaning: light clock, tick, mirror, light source, light pulse, light-second, lab seconds, lab time, reference frame, at
            rest, moving, sideways, c, everyday rule, light&rsquo;s actual rule, &ldquo;what if&rdquo; (imagined), time dilation
            factor, postulate, and the one formula used here, speed = distance ÷ time.
          </p>
          <p style={{ marginTop: 0, marginBottom: '0.25rem' }}>
            <strong>What we assume.</strong>
          </p>
          <ul style={{ marginTop: 0, marginBottom: 0, paddingLeft: '1.25rem' }}>
            <li>There is no gravity, and the moving clock keeps a steady speed. It never speeds up or slows down.</li>
            <li>The moving clock moves sideways, across the light&rsquo;s up-and-down path, not along it.</li>
            <li>All the clocks start together: their flashes of light leave the bottom mirror at the same moment.</li>
            <li>
              We watch everything from the lab. The lab is a <strong>reference frame</strong>, as in &ldquo;Two clocks at
              rest&rdquo;: a group of people and clocks that are all standing still relative to one another, with their clocks set to
              agree. <strong>Lab time</strong> is the time shown on those clocks.
            </li>
            <li>
              The moving clock is not standing still relative to the lab, so it is not part of the lab&rsquo;s reference frame. It has
              its own reference frame: the point of view of someone riding along with it. So two reference frames are involved: the
              lab&rsquo;s and the moving clock&rsquo;s.
            </li>
            <li>
              The light source and both mirrors are parts of the moving clock. Seen from the lab, they all move together, sideways,
              at the same speed. The mirrors stay the same distance apart.
            </li>
            <li>
              Someone riding along with the moving clock sees the light leave at speed c and go straight up, just like in the clock
              that stands still. This is true under both rules. The two rules differ only in what the lab sees.
            </li>
            <li>
              <strong>c</strong> is the speed of light, about 300,000 km every second. A speed written as 0.5c is half of that. A
              light speed of 1.000c means exactly the speed of light.
            </li>
          </ul>
        </div>

        <ReferencePanel entries={REFERENCE_ENTRIES} />

        <div style={{ marginBottom: '2rem', fontSize: '0.875rem', color: 'var(--text-muted)' }}>
          <p style={{ marginTop: 0, marginBottom: '0.25rem' }}>
            <strong>Want to know more?</strong> Plainer-language pages are listed here. Checked on 9 November 2026. The links open in a
            new tab. This page has no real experimental result, so there is no paper to link. Two more pages appear after the
            tutor&rsquo;s explanation.
          </p>
          <ul style={{ marginTop: 0, marginBottom: 0, paddingLeft: '1.25rem' }}>
            {PLAIN_LINKS.map((link) => (
              <li key={link.href}>
                <ExternalLink href={link.href}>{link.label}</ExternalLink> — {link.what}
              </li>
            ))}
          </ul>
        </div>

        {/* ===== Part 1 ===== */}
        <PartHeader color="#d97706" title="Part 1: Predict, then watch">
          First you make your guesses: which rule makes the moving clock&rsquo;s tick longer, and how many lab seconds one tick takes
          under each rule (one number for each). Then you press START and watch one tick of each clock, with the moving clock going at {PART1_VELOCITY}c and
          the path of each flash of light drawn as it goes. When the run finishes, three bars appear that show how long each tick took
          on the lab&rsquo;s clocks, with your guesses drawn on them in white.
        </PartHeader>

        <div style={{ marginBottom: '1.5rem' }}>
          <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold' }}>Make a prediction</label>
          <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)', marginBottom: '0.75rem' }}>
            Remember: the clock standing still ticks once every {REST_TICK_DURATION} second. The other clock moves sideways at{' '}
            {PART1_VELOCITY}c (half the speed of light). Someone in the lab times one tick of each clock with the lab&rsquo;s own
            clocks. You will make two kinds of guess. <strong>Guess 1:</strong> compare the two moving clocks. Does the everyday rule
            make the moving clock&rsquo;s tick take longer, does light&rsquo;s actual rule, or do both rules give the same tick?
          </p>
          <div style={{ marginBottom: '1rem' }}>
            {(Object.keys(RULE_CHOICE_LABELS) as RuleChoice[]).map((option) => (
              <button
                key={option}
                type="button"
                onClick={() => setChoice(option)}
                disabled={locked}
                className={`toggle-button${choice === option ? ' is-selected' : ''}`}
                style={buttonStyle(locked)}
              >
                {RULE_CHOICE_LABELS[option]}
              </button>
            ))}
          </div>
          <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)', marginBottom: '0.75rem' }}>
            <strong>Guess 2:</strong> how many lab seconds will one tick of the moving clock take under each rule? Type a number for
            each. A rough guess is fine.
          </p>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1rem' }}>
            <label style={{ fontSize: '0.875rem' }}>
              Everyday rule (lab seconds)
              <br />
              <input
                type="number"
                step="any"
                value={everydayInput}
                onChange={(e) => setEverydayInput(e.target.value)}
                disabled={locked}
                placeholder="Enter seconds"
                className="field-input"
                style={{ ...inputStyle(locked), marginTop: '0.25rem' }}
              />
            </label>
            <label style={{ fontSize: '0.875rem' }}>
              Light&rsquo;s actual rule (lab seconds)
              <br />
              <input
                type="number"
                step="any"
                value={actualInput}
                onChange={(e) => setActualInput(e.target.value)}
                disabled={locked}
                placeholder="Enter seconds"
                className="field-input"
                style={{ ...inputStyle(locked), marginTop: '0.25rem' }}
              />
            </label>
          </div>
          <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
            {locked
              ? `${describePrediction(submitted)} Your prediction is locked while you try other speeds. To change it, press Start over.`
              : prediction
                ? describePrediction(prediction)
                : 'Choose a rule and enter both tick durations to continue'}
          </p>
        </div>

        <button
          type="button"
          onClick={handleStart}
          disabled={part1Running || part2Running || locked || prediction === null}
          className="action-button"
          style={{ padding: '0.75rem 2rem', fontSize: '1rem' }}
        >
          {part1Running ? 'Running...' : 'START'}
        </button>
        <button
          type="button"
          onClick={handleStartOver}
          disabled={startOverDisabled}
          className="secondary-button"
          style={{
            marginLeft: '0.75rem',
            padding: '0.5rem 1.25rem',
            fontSize: '0.875rem',
            cursor: startOverDisabled ? 'not-allowed' : 'pointer',
            opacity: startOverDisabled ? 0.5 : 1,
          }}
        >
          Start over
        </button>
        {prediction === null && !locked && <p style={smallNote}>Choose a rule and enter both tick durations above to press START.</p>}

        {/* Placed directly under START so the run is on screen the moment it begins. */}
        <div ref={part1Ref} style={{ marginTop: '2rem' }}>
          <ThreeClockPanels geometry={part1Result} labTime={part1.time} running={part1Running} />
          <WhereFrom>
            <strong>Calculated here from the speed, not measured:</strong> the clocks at rest and under light&rsquo;s actual rule come
            from the light-clock geometry, with the clock sliding sideways while the flash goes up and down.{' '}
            <strong>Imagined for the question:</strong> the violet clock shows what would happen if light&rsquo;s speed added to the
            lamp&rsquo;s, which is not how light works in this course. The light clock itself is imagined, a giant clock with its
            mirrors half a light-second (150,000 km) apart, so that the numbers are easy to read. Real light clocks are much smaller.
            No instrument measured these ticks.
          </WhereFrom>
          <PanelsCaption />
        </div>

        {part1Done && submitted !== null ? (
          <Block>
            <TickBars
              experiment={part1Result}
              basis="rest"
              pinkSpeed={null}
              guesses={submitted}
              label={`The three tick bars for the run at ${PART1_VELOCITY}c: one tick of the rest clock took ${part1Result.restTickDuration.toFixed(3)} seconds, one tick under the imagined everyday rule ${part1Result.everydayRule.movingTickDuration.toFixed(3)} seconds, and one tick under light's actual rule ${part1Result.actualRule.movingTickDuration.toFixed(3)} seconds. Your guesses of ${submitted.everydayTick} and ${submitted.actualTick} seconds are in white in boxes marked YOUR GUESS, and your choice, ${describeChoice(submitted.choice)}, is a white marker.`}
            />
            <WhereFrom>
              Calculated here, not measured, except the violet bar, which is imagined for the question. The white marks and the marker
              are only your guesses, placed on the same scale.
            </WhereFrom>
            <BarsCaption name="the three tick bars" experiment={part1Result} guesses pink={false} />
          </Block>
        ) : (
          <p style={smallNote}>
            {part1Running
              ? 'The bars will appear when the run ends.'
              : 'After you press START, three bars showing how long each tick took will appear here when the run ends.'}
          </p>
        )}

        {/* ===== Part 2 ===== */}
        {part1Done && (
          <>
            <PartHeader color="#be185d" title="Part 2: Now try it yourself">
              Now you choose a speed from 0.01c to 0.99c and watch one tick of each clock at that speed. The speed you choose changes
              the clocks and the drawing in this Part, marked in pink. It does not change Part 1&rsquo;s pictures, the results in
              Part 3, or your guesses.
            </PartHeader>

            <div style={{ marginBottom: '1rem' }}>
              <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold' }}>Moving clock speed</label>
              <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)', marginBottom: '0.75rem' }}>
                Speeds are given as a fraction of <strong>c</strong>, the speed of light (about 300,000 km/s). For example, 0.5c means
                half the speed of light.
              </p>
              <div style={{ marginBottom: '0.75rem' }}>
                {VELOCITY_PRESETS.map((preset) => (
                  <button
                    key={preset}
                    type="button"
                    onClick={() => setVelocity(preset)}
                    disabled={part2Running}
                    className={`toggle-button${velocity === preset ? ' is-selected' : ''}`}
                    style={buttonStyle(part2Running)}
                  >
                    {preset}c
                  </button>
                ))}
                <button
                  type="button"
                  onClick={() => setVelocity('other')}
                  disabled={part2Running}
                  className={`toggle-button${velocity === 'other' ? ' is-selected' : ''}`}
                  style={buttonStyle(part2Running)}
                >
                  Other
                </button>
              </div>
              {velocity === 'other' && (
                <div style={{ marginBottom: '0.75rem' }}>
                  <input
                    type="number"
                    min="0.01"
                    max="0.99"
                    step="0.01"
                    value={customVelocity}
                    onChange={(e) => setCustomVelocity(e.target.value)}
                    disabled={part2Running}
                    placeholder="Fraction of c (0.01-0.99)"
                    className="field-input"
                    style={{ padding: '0.5rem', fontSize: '0.875rem', width: '200px' }}
                  />
                </div>
              )}
              <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)', marginTop: 0 }}>
                Selected speed: <strong>{speedText}</strong>
              </p>
              <p style={smallNote}>Your guesses do not change these drawings, but the speed you choose does.</p>
              <button
                type="button"
                onClick={handleRunPart2}
                disabled={!speedValid || part2Running || part1Running}
                className="action-button"
                style={{ padding: '0.6rem 1.5rem', marginTop: '0.5rem' }}
              >
                {part2Running ? 'Running...' : 'Run your speed'}
              </button>
            </div>

            <div ref={part2Ref}>
              {part2Geometry ? (
                <Block>
                  <ThreeClockPanels geometry={part2Geometry} labTime={part2Experiment ? part2.time : 0} running={part2Running} />
                </Block>
              ) : (
                <p style={smallNote}>Choose a speed between 0.01c and 0.99c to see the clocks.</p>
              )}
            </div>

            {lastPart2 && !part2Running ? (
              <Block>
                <TickBars
                  experiment={lastPart2.result}
                  basis="actual"
                  pinkSpeed={lastPart2.result.velocity}
                  guesses={null}
                  label={`Drawing A: the three tick bars for your run at ${lastPart2.result.velocity}c, with your speed written in pink.`}
                />
                <WhereFrom>
                  Calculated here, not measured, except the violet bar, which is imagined for the question. Each tick&rsquo;s length
                  comes from the speed you chose. The light clock is imagined, as in Part 1. No instrument measured these ticks.
                </WhereFrom>
                <BarsCaption name="Drawing A" experiment={lastPart2.result} guesses={false} pink />
                <p style={{ fontSize: '0.875rem', marginBottom: 0, marginTop: '0.75rem' }}>
                  <strong>Runs so far</strong>
                </p>
                <ul style={{ fontSize: '0.875rem', marginTop: '0.25rem', paddingLeft: '1.25rem' }}>
                  {part2Runs.map((run, i) => (
                    <li key={i}>
                      {run.result.velocity}c: rest {run.result.restTickDuration.toFixed(3)} s; everyday rule (imagined){' '}
                      {run.result.everydayRule.movingTickDuration.toFixed(3)} s, light&rsquo;s speed{' '}
                      {run.result.everydayRule.lightSpeedInLab.toFixed(3)}c; light&rsquo;s actual rule{' '}
                      {run.result.actualRule.movingTickDuration.toFixed(3)} s, light&rsquo;s speed{' '}
                      {run.result.actualRule.lightSpeedInLab.toFixed(3)}c
                    </li>
                  ))}
                </ul>
              </Block>
            ) : (
              !part2Running && (
                <p style={smallNote}>Not run yet. Choose a speed and press Run your speed; the drawing for it will appear here.</p>
              )
            )}
          </>
        )}

        {/* ===== Part 3 ===== */}
        {part1Done && submitted !== null && (
          <>
            <PartHeader color="#0f766e" title="Part 3: The results">
              Here are the numbers from the Part 1 run, with your guesses listed beside them. Nothing in this Part changes with your
              guesses or with the speed you choose in Part 2.
            </PartHeader>

            <div style={{ marginBottom: '1.5rem' }}>
              <p style={resultLine}>
                <strong>Moving clock speed:</strong> {part1Result.velocity}c
              </p>
              <p style={{ ...resultLine, color: 'var(--text-muted)' }}>
                c is the speed of light. A light speed of 1.000c means exactly the speed of light. A light-second is the distance
                light travels in one second.
              </p>
            </div>

            <div style={resultBlock}>
              <p style={{ ...resultLine, fontWeight: 'bold' }}>Rest clock</p>
              <p style={resultLine}>Distance the light travels in one tick: {part1Result.restLightPath.toFixed(3)} light-seconds</p>
              <p style={resultLine}>Time for one tick, on the lab&rsquo;s clocks: {part1Result.restTickDuration.toFixed(3)} s</p>
              <p style={resultLine}>
                Light&rsquo;s speed, seen from the lab (distance ÷ time): {part1Result.lightSpeedRest.toFixed(3)}c
              </p>
            </div>

            <RuleResultBlock title="Moving clock, everyday rule (imagined)" rule={part1Result.everydayRule} tagged />
            <RuleResultBlock title="Moving clock, light's actual rule" rule={part1Result.actualRule} tagged />

            <div style={{ ...resultBlock, marginBottom: '1rem' }}>
              <p style={{ ...resultLine, fontWeight: 'bold' }}>Your prediction</p>
              <p style={resultLine}>You guessed that {describeChoice(submitted.choice)}.</p>
              <p style={resultLine}>
                Everyday rule: you guessed {submitted.everydayTick} s; the real time was{' '}
                {part1Result.everydayRule.movingTickDuration.toFixed(3)} s
              </p>
              <p style={resultLine}>
                Light&rsquo;s actual rule: you guessed {submitted.actualTick} s; the real time was{' '}
                {part1Result.actualRule.movingTickDuration.toFixed(3)} s
              </p>
              <p style={smallNote}>Your guesses are drawn on Part 1&rsquo;s bars as white marks.</p>
            </div>

            <div style={{ marginTop: '1rem', fontSize: '0.875rem' }}>
              <p style={{ marginBottom: '0.5rem' }}>
                <strong>What these results tell us.</strong>
              </p>
              <ul style={{ margin: 0, paddingLeft: '1.25rem' }}>
                <li style={{ marginBottom: '0.5rem' }}>
                  <strong>The rest clock.</strong> One tick: {part1Result.restLightPath.toFixed(3)} light-second of path in{' '}
                  {part1Result.restTickDuration.toFixed(3)} s, a light speed of {part1Result.lightSpeedRest.toFixed(3)}c.{' '}
                  <em>Why it matters:</em> this clock stands still, so it is the one to compare the others with.
                </li>
                <li style={{ marginBottom: '0.5rem' }}>
                  <strong>The everyday rule (imagined).</strong> One tick: a path of {part1Result.everydayRule.lightPath.toFixed(3)}{' '}
                  light-seconds in {part1Result.everydayRule.movingTickDuration.toFixed(3)} s, a light speed of{' '}
                  {part1Result.everydayRule.lightSpeedInLab.toFixed(3)}c, and a time dilation factor of{' '}
                  {part1Result.everydayRule.timeDilationFactor.toFixed(3)}. <em>Why it matters:</em> this is what would be seen if the
                  rule were true; the tick is unchanged, and the light&rsquo;s speed is more than c. Remember this is imagined for the
                  question.
                </li>
                <li style={{ marginBottom: '0.5rem' }}>
                  <strong>Light&rsquo;s actual rule.</strong> One tick: a path of {part1Result.actualRule.lightPath.toFixed(3)}{' '}
                  light-seconds in {part1Result.actualRule.movingTickDuration.toFixed(3)} s, a light speed of{' '}
                  {part1Result.actualRule.lightSpeedInLab.toFixed(3)}c, and a time dilation factor of{' '}
                  {part1Result.actualRule.timeDilationFactor.toFixed(3)}. <em>Why it matters:</em> the path is longer, the tick is
                  longer, and the light&rsquo;s speed is exactly c. This is the factor from &ldquo;A moving clock&rdquo; and
                  &ldquo;Why time dilation happens&rdquo; for this speed.
                </li>
                <li style={{ marginBottom: '0.5rem' }}>
                  <strong>Light&rsquo;s speed, seen from the lab.</strong> Path divided by time. Under the everyday rule the number
                  is more than 1.000c; under light&rsquo;s actual rule it is {part1Result.actualRule.lightSpeedInLab.toFixed(3)}c.{' '}
                  <em>Why it matters:</em> the two numbers differ, which is worth noticing; the tutor will ask you about it.
                </li>
              </ul>
            </div>
            <p style={{ ...smallNote, marginTop: '0.75rem' }}>
              <strong>Where this comes from:</strong> calculated here from the speed (see the captions under the pictures), except
              the everyday rule, which is imagined for the question. Nothing here changes with your guesses or with the speed you
              choose in Part 2.
            </p>
          </>
        )}

        {/* ===== Part 4 ===== */}
        {part1Done && submitted !== null && (
          <>
            <PartHeader color="#0066cc" title="Part 4: The tutor">
              Talk through what you saw. The tutor points to your white marks, then explains.
            </PartHeader>
            <Experiment5Tutor
              onExplained={() => {
                setExplained(true)
                onTutorComplete?.()
              }}
              key={`${PART1_VELOCITY}-${submitted.choice}-${submitted.everydayTick}-${submitted.actualTick}`}
              run={part1Result}
              prediction={submitted}
            />
            {explained && (
              <div style={{ marginTop: '1.5rem', fontSize: '0.875rem', color: 'var(--text-muted)' }}>
                <p style={{ marginTop: 0, marginBottom: '0.25rem' }}>
                  <strong>More to read, now that you have the explanation.</strong> These two pages say which rule gives the longer
                  tick, so they were held back until now. Checked on 9 November 2026. The links open in a new tab.
                </p>
                <ul style={{ marginTop: 0, marginBottom: 0, paddingLeft: '1.25rem' }}>
                  {AFTER_TUTOR_LINKS.map((link) => (
                    <li key={link.href}>
                      <ExternalLink href={link.href}>{link.label}</ExternalLink> — {link.what}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  )
}
