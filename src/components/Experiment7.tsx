import { useCallback, useEffect, useRef, useState, type ReactNode } from 'react'
import {
  PART1_STRIP_SCALE_END,
  PART2_STRIP_SCALE_END,
  runSimultaneityExperiment,
} from '../physics/relativityOfSimultaneityExperiment'
import type { SimultaneityResult } from '../physics/relativityOfSimultaneityExperiment'
import { Experiment7Tutor, orderWording } from './Experiment7Tutor'
import type { OrderChoice, FrameAgreementChoice } from './Experiment7Tutor'
import { EventStrip, GUESS_COLOR, PanelsCaption, SimultaneityPanels, StripCaption } from './Experiment7Pictures'
import { ReferencePanel } from './EnergyMomentumExperiment'
import { PartHeader } from './GravitationalWaveExperiment'

// Relativity of Time and Motion, Experiment 7, audited to the newer rules (docs/audit/relativity-of-time-and-motion/
// 07-draft-wording.md, approved by the owner on 2026-11-10): the page in four Parts, labels on the canvas, a dark strip of event times
// with two white markers (neither guess has a size), a Part 2 drawing for the learner's own speed, captions, a words box, links, Start
// over, notes under the results and a tutor that points to the markers. Every number drawn comes from the physics module
// (src/physics/relativityOfSimultaneityExperiment.ts; CLAUDE.md §9). The wording is the owner's to approve line by line (§28.1).

// Part 1 uses this fixed speed; Part 2 lets the learner choose others, including the 0c baseline.
export const PART1_VELOCITY = 0.5
const VELOCITY_PRESETS = [0.1, 0.3, 0.5, 0.8] as const

type VelocityOption = 0 | 0.1 | 0.3 | 0.5 | 0.8 | 'other'
type RunStatus = 'idle' | 'running' | 'complete'

// A custom speed must be positive; the v = 0 baseline is reached through its own preset instead.
const MIN_SPEED = 0.01
const MAX_SPEED = 0.9

// Playback only: real milliseconds shown per lab second, capped so no run lasts too long. Never affects the physical result.
const PLAYBACK_MS_PER_LAB_SECOND = 4000
const MAX_RUN_MS = 15000

const ORDER_CHOICES: Array<{ value: OrderChoice; label: string }> = [
  { value: 'same', label: 'At the same time' },
  { value: 'back', label: 'The back end first' },
  { value: 'front', label: 'The front end first' },
]

const AGREEMENT_CHOICES: Array<{ value: FrameAgreementChoice; label: string }> = [
  { value: 'agree', label: 'Agree with the lab' },
  { value: 'disagree', label: 'Disagree with the lab' },
]

const AGREEMENT_PHRASE: Record<FrameAgreementChoice, string> = {
  agree: 'agree with the lab',
  disagree: 'disagree with the lab',
}

// The "What we are about to do" lead of each Part. The Part 1 lead gives no answer (CLAUDE.md §12).
export const PART_LEADS = {
  part1: `First you make two guesses: when the lab’s clocks say the flash reaches the two ends of a block moving at ${PART1_VELOCITY}c, and whether the block’s own point of view agrees. Then you press START and watch two pictures of the same flash. When the run finishes, a strip of event times appears with your guesses drawn on it in white.`,
  part2: `Now you choose a speed, from 0c (the block standing still) to ${MAX_SPEED}c, and run it. The speed you choose changes the pictures and the strip in this Part, marked in pink. It does not change Part 1’s pictures, the results in Part 3, or your guesses.`,
  part3: 'Here are the times from the Part 1 run, in the lab’s frame and in the block’s own frame, with your guesses listed beside them. Nothing in this Part changes with your guesses or with the speed you choose in Part 2.',
  part4: 'Talk through what you saw. The tutor points to your white markers, then explains what the times tell us.',
}

interface Experiment7Prediction {
  order: OrderChoice
  agreement: FrameAgreementChoice
}

function describePrediction(p: Experiment7Prediction): string {
  return `Your prediction: the flash reaches the two ends ${orderWording[p.order]}; the block’s own view would ${AGREEMENT_PHRASE[p.agreement]}.`
}

// The playback: only presentation. The result comes from the physics module and never depends on this.
function useRunner(onFinish?: () => void) {
  const [status, setStatus] = useState<RunStatus>('idle')
  const [time, setTime] = useState(0)
  const [total, setTotal] = useState(0)
  const finishRef = useRef(onFinish)
  finishRef.current = onFinish

  useEffect(() => {
    if (status !== 'running') return
    const animationDurationMs = total * Math.min(PLAYBACK_MS_PER_LAB_SECOND, MAX_RUN_MS / total)
    const startTime = performance.now()
    let frameId = 0
    const animate = (now: number) => {
      // A frame timestamp can fall slightly before startTime; never let the playback time go negative.
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
  return { status, time, start, reset }
}

// The run lasts until the later of the two events (the front end, in the lab's picture).
const runLength = (r: SimultaneityResult) => Math.max(r.frontEventLabTime, r.rodFrameEventTime)

function ExternalLink({ href, children }: { href: string; children: ReactNode }) {
  return (
    <a href={href} target="_blank" rel="noopener noreferrer">
      {children}
    </a>
  )
}

// Pages fetched on 10 November 2026 by helpers (a summary of each page was returned, not its raw text; see the audit's draft wording,
// section 10). Gaps recorded there: no NASA, ESA or CERN page on the relativity of simultaneity; Einstein's 1905 paper not linked (the
// owner's default: a gap; a free copy exists on Fourmilab); no plain official page for the light-second; this page uses no real
// result, so there is no paper to link.
const PLAIN_LINKS = [
  {
    href: 'https://science.nasa.gov/universe/exoplanets/our-milky-way-galaxy-how-big-is-space/',
    label: 'NASA Science: "Our Milky Way Galaxy: How Big is Space?"',
    what: 'a friendly article that says light travels 186,000 miles (300,000 kilometers) every second. It is about the size of the Milky Way and uses light-years, not light-seconds. (NASA Science; updated April 2024.)',
  },
  {
    href: 'https://www.grc.nasa.gov/www/k-12/Numbers/Math/Mathematical_Thinking/how_fast_is_the_speed.htm',
    label: 'NASA Glenn: "How \'Fast\' is the Speed of Light?"',
    what: 'a very short page that says light goes 186,000 miles every second, about 7.5 trips around the Earth\'s equator in one second. It gives miles only and no date. (NASA Glenn Research Center.)',
  },
  {
    href: 'https://pwg.gsfc.nasa.gov/stargaze/Lframes1.htm',
    label: 'NASA ISTP, Stargazers: "Lesson 23: Frames of Reference: The Basics"',
    what: 'two frames moving at a steady speed past each other, with an elevator and raindrops seen from a moving car. It is old (2004), fairly technical, and does not mention light or simultaneity. (NASA Goddard.)',
  },
]

// Held back until the tutor has explained: these pages say that simultaneity is relative, which is the answer to the two guesses.
const AFTER_TUTOR_LINKS = [
  {
    href: 'https://www.einstein-online.info/en/spotlight/now/',
    label: 'Einstein Online: "The definition of \'now\'"',
    what: 'how we can say that two events in two places are "at the same time" using light signals between clocks set to agree, and why that depends on how you move. It has no train and no equations and is a little abstract. (Max Planck Institute for Gravitational Physics; 2010.)',
  },
  {
    href: 'https://www.einstein-online.info/en/?p=6554',
    label: 'Einstein Online: "Elementary Tour, part 3: The relativity of space and time"',
    what: 'a plain page, with a firecracker and an alarm clock a few miles apart, that says observers in different frames can disagree about which events are simultaneous. Only a short passage is about simultaneity. (Max Planck Institute for Gravitational Physics.)',
  },
]

// The "Words and formulas" box: terms and one formula (time = distance ÷ speed). The formulas for the lab's arrival times of the moving
// block are not given, because they would give away what the learner is asked to predict.
const REFERENCE_ENTRIES: { term: string; meaning: string }[] = [
  { term: 'Block', meaning: 'a long, flat block, like a train car or a long box lying on the ground, not a pole standing upright. It is half a light-second long when it stands still, and it moves along its own length, front end first.' },
  { term: 'Rest length', meaning: 'the length of the block when it stands still: half a light-second.' },
  { term: 'Length seen from the lab', meaning: 'the length of the block as measured by the lab when the block moves along its own length. It is shorter than the rest length, as found in “Does motion change length?”.' },
  { term: 'Back end / front end', meaning: 'the end of the block that it moves away from, and the end it moves towards.' },
  { term: 'Flash', meaning: 'a short burst of light released from the exact middle of the block.' },
  { term: 'Light-second', meaning: 'the distance light travels in one second, about 300,000 km. Half a light-second is about 150,000 km.' },
  { term: 'c', meaning: 'the speed of light, about 300,000 km every second. 0.5c is half of that.' },
  { term: 'Event', meaning: 'something that happens at one place and one moment. Here, the flash reaching an end of the block.' },
  { term: 'Simultaneity', meaning: 'two things happening at the same time.' },
  { term: 'Relativity of simultaneity', meaning: 'the idea that two events can be simultaneous for one observer and not for another.' },
  { term: 'Lab, lab clocks, lab time', meaning: 'the place where the experiment is set up, its many clocks standing still and set to agree with each other, and a reading on them.' },
  { term: 'Block’s own clocks, block’s own time', meaning: 'the clocks that travel with the block, one at each end, set to agree with each other as seen by someone riding with the block, and a reading on them.' },
  { term: 'Point of view / reference frame', meaning: 'what someone measures with their own clocks and rulers while standing still in their own group. The lab is one; the moving block has its own.' },
  { term: 'At rest / moving / along its own length', meaning: 'standing still compared with the lab, or not; and in the same direction as the line from the back end to the front end of the block, which is also the direction it moves.' },
  { term: 'Formula, time = distance ÷ speed', meaning: 'the results and the tutor use it for each arrival of the flash. Worked example that uses no moving block: light goes at c, which is 1 light-second every second, so to cover 0.25 light-second it needs 0.25 ÷ 1 = 0.25 second. (The sums for the moving block are not given here, because they would give away what you are asked to predict.)' },
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

function GuessTag({ n }: { n: 1 | 2 }) {
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
      your guess {n}
    </span>
  )
}

function NoteList({ title, children }: { title: string; children: ReactNode }) {
  return (
    <p style={{ ...smallNote, fontSize: '0.8125rem', marginTop: '0.5rem' }}>
      <strong>{title}</strong> {children}
    </p>
  )
}

// The results (Part 3): values only come from the physics module; the interface adds no number of its own. Each block has a note
// ("What this table tells us": what it is, what it means with the real numbers, why it matters) and no mechanism (the tutor's).
export function Part3Results({ r, submitted }: { r: SimultaneityResult; submitted: Experiment7Prediction }) {
  return (
    <>
      <div style={{ ...smallNote, marginBottom: '1rem' }}>
        <p style={{ marginTop: 0, marginBottom: '0.25rem' }}>
          <strong>Where these numbers come from.</strong>
        </p>
        <ul style={{ marginTop: 0, marginBottom: 0, paddingLeft: '1.25rem' }}>
          <li>
            <strong>Measured:</strong> nothing on this page. No instrument measured these times.
          </li>
          <li>
            <strong>Calculated here:</strong> the times and the length, from the speed you ran, using the rules you met in earlier
            chapters.
          </li>
          <li>
            <strong>Imagined for the question:</strong> the block, the flash and the clocks are an imagined scene, a thought
            experiment that nobody has built.
          </li>
        </ul>
      </div>

      <div style={{ marginBottom: '1.5rem' }}>
        <p style={resultLine}>
          <strong>Block speed:</strong> {r.velocity}c
        </p>
        <p style={resultLine}>
          <strong>Block&rsquo;s length, seen from the lab (&ldquo;Does motion change length?&rdquo;):</strong> {r.labLength.toFixed(3)}{' '}
          light-seconds (rest length {r.restLength.toFixed(3)})
        </p>
        <NoteList title="What this table tells us.">
          It is how long the lab measures the moving block: {(r.restLength - r.labLength).toFixed(3)} light-second shorter than at rest.
          It sets the distance the flash has to go to each end in the lab&rsquo;s sums. <em>Why it matters:</em> the lab&rsquo;s times
          below are worked out from it.
        </NoteList>
      </div>

      <div style={resultBlock}>
        <p style={{ ...resultLine, fontWeight: 'bold' }}>In the lab&rsquo;s frame</p>
        <p style={resultLine}>
          <strong style={{ color: '#2563eb' }}>Back end</strong> reached: {r.backEventLabTime.toFixed(3)} s
          <GuessTag n={1} />
        </p>
        <p style={resultLine}>
          <strong style={{ color: '#7c3aed' }}>Front end</strong> reached: {r.frontEventLabTime.toFixed(3)} s
          <GuessTag n={1} />
        </p>
        <p style={resultLine}>Gap between the two events: {r.labTimeGap.toFixed(3)} s</p>
        <NoteList title="What this table tells us.">
          These are the times on the lab&rsquo;s clocks, the numbers behind the lab row of the strip. The gap, {r.labTimeGap.toFixed(3)}{' '}
          s, is how much later the front end was reached than the back end. <em>Why it matters:</em> it is the lab&rsquo;s answer to
          your first guess.
        </NoteList>
      </div>

      <div style={resultBlock}>
        <p style={{ ...resultLine, fontWeight: 'bold' }}>In the block&rsquo;s own frame</p>
        <p style={resultLine}>
          Both ends reached: {r.rodFrameEventTime.toFixed(3)} s
          <GuessTag n={2} />
        </p>
        <NoteList title="What this table tells us.">
          This is what the block&rsquo;s own clocks read. Both ends have the same time, so the gap is 0.000 s. <em>Why it matters:</em> it
          is the block&rsquo;s answer, to put beside the lab&rsquo;s. Your second guess was about this comparison.
        </NoteList>
      </div>

      <div style={{ ...resultBlock, marginBottom: '1rem' }}>
        <p style={{ ...resultLine, fontWeight: 'bold' }}>Your prediction</p>
        <p style={resultLine}>
          You guessed that the flash would reach the two ends {orderWording[submitted.order]}
          <GuessTag n={1} />, and that the block&rsquo;s own view would {AGREEMENT_PHRASE[submitted.agreement]}
          <GuessTag n={2} />.
        </p>
        <p style={smallNote}>Your guesses are drawn on Part 1&rsquo;s strip as two white markers.</p>
      </div>
    </>
  )
}

interface RunRecord {
  result: SimultaneityResult
}

interface Experiment7Props {
  onComplete?: () => void
  onTutorComplete?: () => void
}

export function Experiment7({ onComplete, onTutorComplete }: Experiment7Props) {
  const [order, setOrder] = useState<OrderChoice | null>(null)
  const [agreement, setAgreement] = useState<FrameAgreementChoice | null>(null)
  const [submitted, setSubmitted] = useState<Experiment7Prediction | null>(null)
  const [velocity, setVelocity] = useState<VelocityOption>(0.8)
  const [customVelocity, setCustomVelocity] = useState('')
  const [part2Runs, setPart2Runs] = useState<RunRecord[]>([])
  const [part2Result, setPart2Result] = useState<SimultaneityResult | null>(null)
  const [explained, setExplained] = useState(false)
  const part1 = useRunner(onComplete)
  const part2 = useRunner()
  const part1Ref = useRef<HTMLDivElement>(null)
  const part2Ref = useRef<HTMLDivElement>(null)

  const part1Result = runSimultaneityExperiment(PART1_VELOCITY)
  const part1Running = part1.status === 'running'
  const part1Done = part1.status === 'complete'
  const part2Running = part2.status === 'running'
  const part2Done = part2.status === 'complete'
  const locked = submitted !== null

  const prediction: Experiment7Prediction | null = order !== null && agreement !== null ? { order, agreement } : null

  const selectedVelocity = velocity === 'other' ? Number(customVelocity) : velocity
  const speedValid =
    customVelocity.trim() === '' && velocity === 'other'
      ? false
      : isFinite(selectedVelocity) && (velocity === 0 || (selectedVelocity >= MIN_SPEED && selectedVelocity <= MAX_SPEED))
  const speedText = speedValid ? `${selectedVelocity}c` : '—'

  const hasAnythingToClear = order !== null || agreement !== null || locked || part1.status !== 'idle' || part2Runs.length > 0
  const startOverDisabled = !hasAnythingToClear || part1Running || part2Running

  const handleStart = () => {
    if (prediction === null || locked) return
    setSubmitted(prediction)
    part1.start(runLength(part1Result))
    // Bring the two pictures into view so the learner can watch the run.
    part1Ref.current?.scrollIntoView({ behavior: 'smooth', block: 'center' })
  }

  const handleRunPart2 = () => {
    if (!speedValid || part1Running || part2Running) return
    const run = runSimultaneityExperiment(selectedVelocity)
    setPart2Result(run)
    part2.start(runLength(run))
    part2Ref.current?.scrollIntoView({ behavior: 'smooth', block: 'center' })
  }

  // Record each finished Part 2 run once.
  useEffect(() => {
    if (part2Done && part2Result) {
      setPart2Runs((runs) => [...runs, { result: part2Result }])
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [part2Done])

  // Start over: clears the guesses, the runs, the results and the tutor, and returns the page to its first state.
  const handleStartOver = () => {
    part1.reset()
    part2.reset()
    setOrder(null)
    setAgreement(null)
    setSubmitted(null)
    setVelocity(0.8)
    setCustomVelocity('')
    setPart2Runs([])
    setPart2Result(null)
    setExplained(false)
  }

  const lastPart2 = part2Runs.length > 0 ? part2Runs[part2Runs.length - 1] : null
  // Part 2's panels: the run's own geometry once started; before that, a preview for the chosen speed.
  const part2Geometry = part2Result ?? (speedValid ? runSimultaneityExperiment(selectedVelocity) : null)
  const buttonStyle = (disabled: boolean) => ({
    marginRight: '0.5rem',
    padding: '0.5rem 1rem',
    fontSize: '0.875rem',
    opacity: disabled ? 0.6 : 1,
  })
  const r = part1Result
  const part1Status = part1Running ? 'Running...' : part1Done ? 'Finished' : 'Not started'
  const part2Status = part2Running ? 'Running...' : part2Done ? 'Finished' : 'Not started'

  return (
    <div style={{ padding: '2rem', maxWidth: '900px', margin: '0 auto' }}>
      <h2>Experiment 7 — At the Same Time... For Whom?</h2>

      <div className="exp-card" style={{ marginTop: '2rem', padding: '1.5rem' }}>
        <div style={{ marginBottom: '2rem', fontSize: '0.875rem', color: 'var(--text-muted)' }}>
          <p style={paragraph}>
            <strong>The question.</strong> If two things happen &ldquo;at the same time,&rdquo; is that a fact everyone agrees on, no
            matter how they are moving?
          </p>
          <p style={paragraph}>
            <strong>A daily-life picture.</strong> Imagine two lightning bolts strike, one at each end of a train platform, at exactly
            the same instant as measured by someone standing on the platform. Would a passenger riding past on a fast train, watching
            the same two flashes, necessarily agree they happened at the same instant too? Ordinary experience never puts this question
            to a real test, because nothing we deal with day to day moves anywhere near fast enough for the answer to matter — but this
            experiment does.
          </p>
          <p style={paragraph}>
            <strong>Step 1: a block and a flash.</strong> We use a <strong>block</strong> like the light clock of &ldquo;Does motion change
            length?&rdquo;: a long, flat block, like a train car or a long box lying on the ground (not a pole standing upright), that moves along its own length, front end first. Standing still it is <strong>half a light-second</strong>{' '}
            long. A <strong>light-second</strong> is the distance light travels in one second, about 300,000 km, so half a light-second
            is about 150,000 km. (A real block would be far shorter. We use a giant one so that the numbers are easy to read.) At one
            moment, a flash of light is released from the <strong>exact middle</strong> of the block. It spreads out from there, one part
            towards the back end and one part towards the front end, at the speed of light, <strong>c</strong>.
          </p>
          <p style={paragraph}>
            <strong>Step 2: two events.</strong> Two things now happen, and we will watch both. <strong>The flash reaches the back
            end.</strong> <strong>The flash reaches the front end.</strong> Each is an <strong>event</strong>: something that happens at
            one place at one moment. If the block is standing still, the flash has the same distance to go each way, so it reaches both
            ends at the same time. Now the block moves along its own length at <strong>{PART1_VELOCITY}c</strong>, half the speed of
            light, with its front end leading. Light still travels at c in the lab, in both directions.
          </p>
          <p style={paragraph}>
            <strong>Step 3: who is asking, and with which clocks.</strong> To say <strong>when</strong> the flash reached an end, we
            need clocks, and it matters whose clocks. <strong>The lab&rsquo;s point of view</strong> means what someone standing still
            in the lab, watching the block go by, would measure with the lab&rsquo;s clocks. The lab has many clocks standing still in a
            row, all set to agree with each other, as in &ldquo;Two clocks at rest&rdquo;. A reading on one of them is called{' '}
            <strong>lab time</strong>. <strong>The block&rsquo;s own point of view</strong> means what someone riding along with the
            block, at the same speed right beside it, would measure with the clocks that travel with the block, one at each end, set to
            agree with each other. A reading on those is called the <strong>block&rsquo;s own time</strong>. Both points of view are
            equally real. The experiment asks how they compare.
          </p>
          <p style={{ marginTop: 0, marginBottom: '0.25rem' }}>
            <strong>What you will see.</strong> Two pictures, one above the other, run together:
          </p>
          <ul style={{ marginTop: 0, marginBottom: '0.75rem', paddingLeft: '1.25rem' }}>
            <li>the top picture is <strong>the block&rsquo;s own point of view</strong>: the block does not move in it;</li>
            <li>
              the bottom picture is <strong>the lab&rsquo;s point of view</strong>: the block moves to the right at {PART1_VELOCITY}c.
            </li>
          </ul>
          <p style={paragraph}>
            In both, a dashed line marks where the flash was released, and two dots show the flash spreading out. When the run ends, a{' '}
            <strong>strip of event times</strong> appears under the pictures. It shows, on one time scale, when each end was reached by
            the lab&rsquo;s clocks and by the block&rsquo;s own clocks. In Part 2 you can choose other speeds.
          </p>
          <p style={paragraph}>
            <strong>Your job.</strong> Before you press START, make two guesses. <strong>First,</strong> will the flash reach the two
            ends of the moving block at the same moment, as measured by the lab&rsquo;s clocks, and if not, which end first?{' '}
            <strong>Second,</strong> will the block&rsquo;s own point of view agree or disagree with the lab about that? A wrong guess is
            fine, and guesses are not scored. Then watch, try other speeds in Part 2, and talk it over with the tutor.
          </p>
          <p style={paragraph}>
            <strong>Your guesses and the real pictures.</strong> Your guesses never change the real pictures, the strip or the numbers:
            they come from a calculation that knows nothing about what you guessed. Neither guess has a size, so each is drawn on the
            strip as a white <strong>marker</strong>, in a box labelled YOUR GUESS (a marker only: it points at the choice you made).
            Both guesses are shown again beside the results. In Part 2 the speed you choose does change the pictures and the strip, and
            the marks it moves are pink.
          </p>
          <p style={paragraph}>
            <strong>A new term: simultaneity.</strong> &ldquo;Simultaneity&rdquo; just means two things happening at the same time.
            &ldquo;Relativity of simultaneity&rdquo; is the idea that different reference frames can disagree about which events are
            simultaneous.
          </p>
          <p style={paragraph}>
            <strong>Some new words.</strong> The &ldquo;Words and formulas&rdquo; box below has each one, with a short plain meaning:
            block, rest length, length seen from the lab, back end, front end, flash, light-second, c, event, simultaneity, relativity of
            simultaneity, lab, lab clocks, lab time, block&rsquo;s own clocks, block&rsquo;s own time, point of view, reference frame, at
            rest, moving, along its own length, and the one formula used here, time = distance &divide; speed.
          </p>
          <p style={{ marginTop: 0, marginBottom: '0.25rem' }}>
            <strong>What we assume.</strong>
          </p>
          <ul style={{ marginTop: '0.25rem', marginBottom: 0, paddingLeft: '1.25rem' }}>
            <li>There is no gravity, and the block keeps a steady speed.</li>
            <li>
              Light always travels at c in the lab, in both directions (see &ldquo;Why can&rsquo;t light go faster?&rdquo;).
            </li>
            <li>
              The block&rsquo;s length, seen from the lab, is shorter than its rest length, by the amount &ldquo;Does motion change
              length?&rdquo; found.
            </li>
            <li>The block only moves along its own length. There is no sideways motion.</li>
            <li>
              Two reference frames are involved, as in &ldquo;A moving clock&rdquo; to &ldquo;Does motion change length?&rdquo;: the
              lab&rsquo;s and the moving block&rsquo;s.
            </li>
          </ul>
        </div>

        <ReferencePanel entries={REFERENCE_ENTRIES} />

        <div style={{ marginBottom: '2rem', fontSize: '0.875rem', color: 'var(--text-muted)' }}>
          <p style={{ marginTop: 0, marginBottom: '0.25rem' }}>
            <strong>Want to know more?</strong> Plainer-language pages are listed here. Checked on 10 November 2026. The links open in a
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
          {PART_LEADS.part1}
        </PartHeader>

        <div style={{ marginBottom: '1.5rem' }}>
          <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold' }}>Make a prediction</label>
          <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)', marginBottom: '0.75rem' }}>
            A block is half a light-second long when it stands still. A flash of light is released from its exact centre. If the block is
            standing still, the flash reaches both ends at the same time. Now the block moves at <strong>{PART1_VELOCITY}c</strong> along
            its own length. Light still travels at c in the lab, in both directions. <strong>Guess 1:</strong> will the flash reach the
            two ends of the moving block at the same time, as measured by the lab&rsquo;s clocks? If not, which end first?
          </p>
          <div style={{ marginBottom: '1rem' }}>
            {ORDER_CHOICES.map((choice) => (
              <button
                key={choice.value}
                type="button"
                onClick={() => setOrder(choice.value)}
                disabled={locked}
                className={`toggle-button${order === choice.value ? ' is-selected' : ''}`}
                style={buttonStyle(locked)}
              >
                {choice.label}
              </button>
            ))}
          </div>
          <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)', marginBottom: '0.75rem' }}>
            <strong>Guess 2:</strong> someone riding along with the block also has a point of view. Does it agree or disagree with the
            lab about whether the two ends were reached at the same time?
          </p>
          <div style={{ marginBottom: '1rem' }}>
            {AGREEMENT_CHOICES.map((choice) => (
              <button
                key={choice.value}
                type="button"
                onClick={() => setAgreement(choice.value)}
                disabled={locked}
                className={`toggle-button${agreement === choice.value ? ' is-selected' : ''}`}
                style={buttonStyle(locked)}
              >
                {choice.label}
              </button>
            ))}
          </div>
          <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.5rem' }}>
            {locked && submitted
              ? `${describePrediction(submitted)} Your prediction is locked while you try other speeds. To change it, press Start over.`
              : prediction
                ? describePrediction(prediction)
                : 'Choose an option in each guess to continue'}
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
        {prediction === null && !locked && <p style={smallNote}>Choose an option in each guess above to press START.</p>}

        {/* Placed directly under START so the run is on screen the moment it begins. */}
        <div ref={part1Ref} style={{ marginTop: '2rem' }}>
          <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)' }}>
            {part1Status} · Playback time: <strong>{part1.time.toFixed(2)} s</strong>
          </p>
          <SimultaneityPanels geometry={r} playTime={part1.time} speedLabel={`${PART1_VELOCITY}c`} />
          <WhereFrom>
            <strong>Measured:</strong> nothing on this page. <strong>Calculated here:</strong> the times, from the speed of light, c,
            and the block&rsquo;s length seen from the lab, using the rules of &ldquo;Why can&rsquo;t light go faster?&rdquo; and
            &ldquo;Does motion change length?&rdquo;. <strong>Imagined for the question:</strong> the block, the flash and the clocks are
            an imagined scene, a thought experiment that nobody has built. Nothing on the pictures is a &ldquo;what if&rdquo;.
          </WhereFrom>
          <PanelsCaption />
        </div>

        {part1Done && submitted !== null ? (
          <Block>
            <EventStrip
              result={r}
              scaleEnd={PART1_STRIP_SCALE_END}
              pinkSpeed={null}
              guesses={{ order: submitted.order, agreement: submitted.agreement }}
              label={`The strip of event times for the run at ${PART1_VELOCITY}c. Lab's clocks: back end ${r.backEventLabTime.toFixed(3)} seconds, front end ${r.frontEventLabTime.toFixed(3)} seconds, a gap of ${r.labTimeGap.toFixed(3)} seconds. Block's own clocks: both ends ${r.rodFrameEventTime.toFixed(3)} seconds. Your guesses are two white markers: ${orderWording[submitted.order]}, and the block's own view would ${AGREEMENT_PHRASE[submitted.agreement]}.`}
            />
            <WhereFrom>
              <strong>Measured:</strong> nothing. <strong>Calculated here:</strong> every time, from the speed you ran.{' '}
              <strong>Imagined for the question:</strong> the block, the flash and the clocks. The white markers are only your guesses.
            </WhereFrom>
            <StripCaption result={r} guesses pink={false} />
          </Block>
        ) : (
          <p style={smallNote}>
            {part1Running
              ? 'The strip of event times will appear when the run ends.'
              : 'After you press START, a strip of event times will appear here when the run ends, and Parts 2 to 4 will appear below it.'}
          </p>
        )}

        {/* ===== Part 2 ===== */}
        {part1Done && (
          <>
            <PartHeader color="#be185d" title="Part 2: Now try it yourself">
              {PART_LEADS.part2}
            </PartHeader>

            <div style={{ marginBottom: '1rem' }}>
              <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold' }}>Block speed</label>
              <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)', marginBottom: '0.75rem' }}>
                Speeds are given as a fraction of <strong>c</strong>, the speed of light (about 300,000 km/s). For example, 0.5c means
                half the speed of light. The 0c run is a baseline: the block stands still. On this page you can choose speeds up to{' '}
                {MAX_SPEED}c.
              </p>
              <div style={{ marginBottom: '0.75rem' }}>
                <button
                  type="button"
                  onClick={() => setVelocity(0)}
                  disabled={part2Running}
                  className={`toggle-button${velocity === 0 ? ' is-selected' : ''}`}
                  style={buttonStyle(part2Running)}
                >
                  0c (at rest)
                </button>
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
                    min={MIN_SPEED}
                    max={MAX_SPEED}
                    step="0.01"
                    value={customVelocity}
                    onChange={(e) => setCustomVelocity(e.target.value)}
                    disabled={part2Running}
                    placeholder={`Fraction of c (${MIN_SPEED}-${MAX_SPEED})`}
                    className="field-input"
                    style={{ padding: '0.5rem', fontSize: '0.875rem', width: '200px' }}
                  />
                </div>
              )}
              <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)', marginTop: 0 }}>
                Selected speed: <strong>{speedText}</strong>
              </p>
              <p style={smallNote}>
                Your guesses do not change the drawings or tables, but this speed does. The speed stops at {MAX_SPEED}c on this page, as
                in &ldquo;Does motion change length?&rdquo;.
              </p>
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
                  <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)' }}>
                    {part2Status} · Playback time: <strong>{(part2Result ? part2.time : 0).toFixed(2)} s</strong>
                  </p>
                  <SimultaneityPanels
                    geometry={part2Geometry}
                    playTime={part2Result ? part2.time : 0}
                    speedLabel={`${part2Geometry.velocity}c`}
                    scaleGeometry={runSimultaneityExperiment(MAX_SPEED)}
                  />
                </Block>
              ) : (
                <p style={smallNote}>
                  Choose a speed between 0c and {MAX_SPEED}c to see the block.
                </p>
              )}
            </div>

            {lastPart2 && !part2Running ? (
              <Block>
                <EventStrip
                  result={lastPart2.result}
                  scaleEnd={PART2_STRIP_SCALE_END}
                  pinkSpeed={lastPart2.result.velocity}
                  guesses={null}
                  label={`The two views at your speed, ${lastPart2.result.velocity}c: Lab's clocks, back end ${lastPart2.result.backEventLabTime.toFixed(3)} seconds, front end ${lastPart2.result.frontEventLabTime.toFixed(3)} seconds, gap ${lastPart2.result.labTimeGap.toFixed(3)} seconds. Block's own clocks, both ends ${lastPart2.result.rodFrameEventTime.toFixed(3)} seconds. Your speed is written in pink.`}
                />
                <WhereFrom>
                  Calculated here, not measured. Every time comes from the speed you chose. The block, the flash and the clocks are
                  imagined, as in Part 1.
                </WhereFrom>
                <StripCaption result={lastPart2.result} guesses={false} pink />
                <p style={{ fontSize: '0.875rem', marginBottom: 0, marginTop: '0.75rem' }}>
                  <strong>Runs so far</strong>
                </p>
                <ul style={{ fontSize: '0.875rem', marginTop: '0.25rem', paddingLeft: '1.25rem' }}>
                  {part2Runs.map((run, i) => (
                    <li key={i}>
                      {run.result.velocity}c: lab&rsquo;s clocks, back end {run.result.backEventLabTime.toFixed(3)} s, front end{' '}
                      {run.result.frontEventLabTime.toFixed(3)} s, gap {run.result.labTimeGap.toFixed(3)} s; block&rsquo;s own clocks,
                      both ends {run.result.rodFrameEventTime.toFixed(3)} s
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
              {PART_LEADS.part3}
            </PartHeader>

            <Part3Results r={r} submitted={submitted} />
          </>
        )}

        {/* ===== Part 4 ===== */}
        {part1Done && submitted !== null && (
          <>
            <PartHeader color="#0066cc" title="Part 4: The tutor">
              {PART_LEADS.part4}
            </PartHeader>
            <Experiment7Tutor
              onExplained={() => {
                setExplained(true)
                onTutorComplete?.()
              }}
              key={`${PART1_VELOCITY}-${submitted.order}-${submitted.agreement}`}
              result={r}
              predictionOrder={submitted.order}
              predictionAgreement={submitted.agreement}
            />
            {explained && (
              <div style={{ marginTop: '1.5rem', fontSize: '0.875rem', color: 'var(--text-muted)' }}>
                <p style={{ marginTop: 0, marginBottom: '0.25rem' }}>
                  <strong>More to read, now that you have the explanation.</strong> These pages say that simultaneity is relative,
                  which is the answer to your guesses, so they were held back until now. Checked on 10 November 2026. The links open in
                  a new tab.
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
