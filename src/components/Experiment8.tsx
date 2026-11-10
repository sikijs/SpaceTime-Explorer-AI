import { useCallback, useEffect, useMemo, useRef, useState, type ReactNode } from 'react'
import { runSimultaneityExperiment } from '../physics/relativityOfSimultaneityExperiment'
import type { SimultaneityResult } from '../physics/relativityOfSimultaneityExperiment'
import { orderWording, spacetimeDiagramFor } from '../physics/spacetimeDiagramView'
import type { OrderChoice, SpacetimeDiagramData } from '../physics/spacetimeDiagramView'
import { Experiment8Tutor } from './Experiment8Tutor'
import { BlockToLinesSketch, FlashToLinesSketch } from './Experiment8Sketch'
import { DiagramCaption, GUESS_COLOR, LookFor, SpacetimeDiagram, WorkedMoment } from './Experiment8Pictures'
import { ReferencePanel } from './EnergyMomentumExperiment'
import { PartHeader } from './GravitationalWaveExperiment'

// Relativity of Time and Motion, Experiment 8, audited to the newer rules (docs/audit/relativity-of-time-and-motion/
// 08-draft-wording.md, approved by the owner on 2026-11-10): the page in four Parts, a dark diagram with labelled axes, tick marks and a
// key, one white guess marker, a Part 2 diagram for the learner's own speed, captions, a words box, links, Start over, notes under the
// results and a tutor that points to the marker. Every number drawn comes from the physics module (src/physics/spacetimeDiagramView.ts
// over relativityOfSimultaneityExperiment.ts; CLAUDE.md §9). The wording is the owner's to approve line by line (§28.1).

// Part 1 uses this fixed speed; Part 2 lets the learner choose others, including the 0c baseline.
export const PART1_VELOCITY = 0.5
const VELOCITY_PRESETS = [0.1, 0.3, 0.5, 0.8] as const

type VelocityOption = 0 | 0.1 | 0.3 | 0.5 | 0.8 | 'other'
type RunStatus = 'idle' | 'running' | 'complete'

// A custom speed must be positive; the v = 0 baseline is reached through its own preset instead.
const MIN_SPEED = 0.01
const MAX_SPEED = 0.9

// Playback pacing only, chosen for readability: it does not affect the physics (CLAUDE.md §11). Every diagram is drawn over the same
// wall-clock duration, however far it reaches in lab time, so faster blocks do not animate faster.
const ANIMATION_DURATION_MS = 2500

const ORDER_CHOICES: Array<{ value: OrderChoice; label: string }> = [
  { value: 'back', label: "The back end's worldline" },
  { value: 'front', label: "The front end's worldline" },
  { value: 'same', label: 'Both at the same time' },
]

// The "What we are about to do" lead of each Part. The Part 1 lead gives no answer (CLAUDE.md §12).
export const PART_LEADS = {
  part1: `First you make one guess: which worldline the light will reach first on the diagram of a block moving at ${PART1_VELOCITY}c. Then you press START and watch the diagram draw itself. When the two dots appear, your guess is drawn on it in white.`,
  part2: `Now you choose a speed, from 0c (the block standing still) to ${MAX_SPEED}c, and run it. The speed you choose changes the diagram in this Part, and your speed is written in pink. It does not change Part 1’s diagram, the results in Part 3, or your guess.`,
  part3: 'Here are the times and positions from the Part 1 run, with your guess listed beside them. Nothing in this Part changes with your guess or with the speed you choose in Part 2.',
  part4: 'Talk through what you saw. The tutor points to your white marker, then explains what the diagram shows.',
}

function describeGuess(choice: OrderChoice): string {
  return `Your prediction: the light crosses ${orderWording[choice]}.`
}

// The playback: only presentation. The diagram comes from the physics module and never depends on this.
function useDrawing(onFinish?: () => void) {
  const [status, setStatus] = useState<RunStatus>('idle')
  const [time, setTime] = useState(0)
  const [total, setTotal] = useState(0)
  const finishRef = useRef(onFinish)
  finishRef.current = onFinish

  useEffect(() => {
    if (status !== 'running') return
    const startTime = performance.now()
    let frameId = 0
    const animate = (now: number) => {
      // A frame timestamp can fall slightly before startTime; never let the playback time go negative.
      const progress = Math.min(Math.max((now - startTime) / ANIMATION_DURATION_MS, 0), 1)
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

// The drawing lasts until the later of the two events (the front event).
const drawingLength = (diagram: SpacetimeDiagramData) => diagram.backWorldline[1].time

function ExternalLink({ href, children }: { href: string; children: ReactNode }) {
  return (
    <a href={href} target="_blank" rel="noopener noreferrer">
      {children}
    </a>
  )
}

// Pages fetched on 10 November 2026 by helpers (a summary of each page was returned, not its raw text; see the audit's draft wording,
// section 10). Gaps recorded there: no plain official page on worldlines (ESA, CERN and LIGO searches not run); a graph of position
// against time not searched; no plain official page for the light-second; Minkowski's 1908 lecture not linked (the owner's default: a
// gap); a Perimeter Institute lecture found but not watched, so not linked; this page uses no real result, so there is no paper to link.
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
    href: 'https://www.einstein-online.info/en/speed_of_light/',
    label: 'Einstein Online: "Elementary Tour, part 4: The speed of light"',
    what: 'a plain page that says the speed of light is the same, 299,792.458 kilometres per second, for everyone, even someone on a fast-moving spaceship. It does not use the word light-second. (Max Planck Institute for Gravitational Physics.)',
  },
]

// Held back until the tutor has explained: this page says in general terms that observers disagree about which events are
// simultaneous, which sits close to the learner's guess.
const AFTER_TUTOR_LINKS = [
  {
    href: 'https://www.einstein-online.info/en/spacetime/',
    label: 'Einstein Online: "Elementary Tour, part 5: Spacetime"',
    what: 'a short section with a spacetime diagram, space across and time up, and light cones, and how to tell whether one event could influence another. It does not use the word worldline, and it is a short section inside a longer tour. (Max Planck Institute for Gravitational Physics.)',
  },
]

// The "Words and formulas" box: terms and one formula (time = distance ÷ speed). The sums for the moving block are not given, because
// they would give away what the learner is asked to predict.
const REFERENCE_ENTRIES: { term: string; meaning: string }[] = [
  { term: 'Spacetime diagram', meaning: 'a graph with position across and time up.' },
  { term: 'Position', meaning: 'where something is along the line the block moves on, in light-seconds.' },
  { term: 'Time', meaning: 'when, in seconds, measured from the moment the flash was released.' },
  { term: 'Event', meaning: 'something that happens at one place and one moment: one point on the diagram.' },
  { term: 'Worldline', meaning: 'the line that shows where something was at every moment.' },
  { term: 'Lean', meaning: 'how far a line tilts sideways as it goes up. A faster object leans more.' },
  { term: 'Block', meaning: 'a long, flat block, like a train car lying on the ground, not a pole standing upright. It is half a light-second long when it stands still, and it moves along its own length, front end first.' },
  { term: 'Rest length', meaning: 'the length of the block when it stands still: half a light-second.' },
  { term: 'Length seen from the lab', meaning: 'the length of the block as measured by the lab when the block moves along its own length. It is shorter than the rest length, as found in “Does motion change length?”.' },
  { term: 'Back end / front end', meaning: 'the end of the block that it moves away from, and the end it moves towards.' },
  { term: 'Lab', meaning: 'the place where the experiment is set up, where the measuring is done.' },
  { term: 'Flash', meaning: 'a short burst of light released from the exact middle of the block.' },
  { term: 'Light-second', meaning: 'the distance light travels in one second, about 300,000 km. Half a light-second is about 150,000 km.' },
  { term: 'c', meaning: 'the speed of light, about 300,000 km every second. 0.5c is half of that.' },
  { term: 'At rest / moving', meaning: 'standing still compared with the lab, or not.' },
  { term: 'Formula, time = distance ÷ speed', meaning: 'light goes at c, which is 1 light-second every second, so to cover 0.2 light-second it needs 0.2 ÷ 1 = 0.2 second. That is why the light’s line in the second sketch leans 0.2 light-second for every 0.2 s it rises. (The sums for the moving block are not given here, because they would give away what you are asked to predict.)' },
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

function NoteList({ title, children }: { title: string; children: ReactNode }) {
  return (
    <p style={{ ...smallNote, fontSize: '0.8125rem', marginTop: '0.5rem' }}>
      <strong>{title}</strong> {children}
    </p>
  )
}

// The results (Part 3): values only come from the physics module; the interface adds no number of its own. Each block has a note
// ("What this table tells us": what it is, what it means with the real numbers, why it matters) and no mechanism (the tutor's).
export function Part3Results({ r, diagram, submitted }: { r: SimultaneityResult; diagram: SpacetimeDiagramData; submitted: OrderChoice }) {
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
            <strong>Calculated here:</strong> the times, positions and length, from the speed you ran, using the rules you met in earlier
            chapters.
          </li>
          <li>
            <strong>Imagined for the question:</strong> the block and the flash are an imagined scene, a thought experiment that nobody has
            built.
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
          It sets how far each end is from the flash when it is released. <em>Why it matters:</em> the two event times below are worked
          out from it.
        </NoteList>
      </div>

      <div style={resultBlock}>
        <p style={{ ...resultLine, fontWeight: 'bold' }}>The two events (the dots on the diagram)</p>
        <p style={resultLine}>
          <strong style={{ color: '#2563eb' }}>Back end</strong> reached: {r.backEventLabTime.toFixed(3)} s, at position{' '}
          {diagram.backEvent.position.toFixed(3)} light-second
          <GuessTag />
        </p>
        <p style={resultLine}>
          <strong style={{ color: '#7c3aed' }}>Front end</strong> reached: {r.frontEventLabTime.toFixed(3)} s, at position{' '}
          {diagram.frontEvent.position.toFixed(3)} light-second
          <GuessTag />
        </p>
        <p style={resultLine}>Gap between the two events: {r.labTimeGap.toFixed(3)} s</p>
        <NoteList title="What this table tells us.">
          These are the blue and purple dots on the diagram. The height of each dot is its time, and the gap, {r.labTimeGap.toFixed(3)} s,
          is how much higher the purple dot sits. <em>Why it matters:</em> it is the diagram&rsquo;s answer to your guess: which end the
          light reached first.
        </NoteList>
      </div>

      <div style={{ ...resultBlock, marginBottom: '1rem' }}>
        <p style={{ ...resultLine, fontWeight: 'bold' }}>Your prediction</p>
        <p style={resultLine}>
          You guessed the light would cross {orderWording[submitted]}
          <GuessTag />.
        </p>
        <p style={smallNote}>Your guess is drawn on Part 1&rsquo;s diagram as a white marker.</p>
      </div>
    </>
  )
}

interface RunRecord {
  result: SimultaneityResult
}

interface Experiment8Props {
  onComplete?: () => void
  onTutorComplete?: () => void
}

export function Experiment8({ onComplete, onTutorComplete }: Experiment8Props) {
  const [guess, setGuess] = useState<OrderChoice | null>(null)
  const [submitted, setSubmitted] = useState<OrderChoice | null>(null)
  const [velocity, setVelocity] = useState<VelocityOption>(0.8)
  const [customVelocity, setCustomVelocity] = useState('')
  const [part2Runs, setPart2Runs] = useState<RunRecord[]>([])
  const [part2Result, setPart2Result] = useState<SimultaneityResult | null>(null)
  const [explained, setExplained] = useState(false)
  const part1 = useDrawing(onComplete)
  const part2 = useDrawing()
  const replay = useDrawing()
  const part1Ref = useRef<HTMLDivElement>(null)
  const part2Ref = useRef<HTMLDivElement>(null)

  const part1Result = useMemo(() => runSimultaneityExperiment(PART1_VELOCITY), [])
  const part1Diagram = useMemo(() => spacetimeDiagramFor(part1Result), [part1Result])
  // Part 2 draws every run at one scale, sized for the widest runs (the block at rest, and the fastest run, 0.9c), so the runs can be compared.
  const part2ScaleDiagrams = useMemo(() => [0, MAX_SPEED].map((v) => spacetimeDiagramFor(runSimultaneityExperiment(v))), [])

  const part1Running = part1.status === 'running'
  const part1Done = part1.status === 'complete'
  const part2Running = part2.status === 'running'
  const part2Done = part2.status === 'complete'
  const replaying = replay.status === 'running'
  const locked = submitted !== null

  const selectedVelocity = velocity === 'other' ? Number(customVelocity) : velocity
  const speedValid =
    customVelocity.trim() === '' && velocity === 'other'
      ? false
      : isFinite(selectedVelocity) && (velocity === 0 || (selectedVelocity >= MIN_SPEED && selectedVelocity <= MAX_SPEED))
  const speedText = speedValid ? `${selectedVelocity}c` : '—'

  const hasAnythingToClear = guess !== null || locked || part1.status !== 'idle' || part2Runs.length > 0
  const startOverDisabled = !hasAnythingToClear || part1Running || part2Running || replaying

  const handleStart = () => {
    if (guess === null || locked) return
    setSubmitted(guess)
    part1.start(drawingLength(part1Diagram))
    // Bring the diagram into view so the learner can watch it being drawn.
    part1Ref.current?.scrollIntoView({ behavior: 'smooth', block: 'center' })
  }

  const handleReplay = () => {
    if (!part1Done || replaying) return
    replay.start(drawingLength(part1Diagram))
  }

  const part2Geometry = part2Result ?? (speedValid ? runSimultaneityExperiment(selectedVelocity) : null)
  const part2Diagram = useMemo(() => (part2Geometry ? spacetimeDiagramFor(part2Geometry) : null), [part2Geometry])

  const handleRunPart2 = () => {
    if (!speedValid || part1Running || part2Running) return
    const run = runSimultaneityExperiment(selectedVelocity)
    setPart2Result(run)
    part2.start(drawingLength(spacetimeDiagramFor(run)))
    part2Ref.current?.scrollIntoView({ behavior: 'smooth', block: 'center' })
  }

  // Record each finished Part 2 run once.
  useEffect(() => {
    if (part2Done && part2Result) {
      setPart2Runs((runs) => [...runs, { result: part2Result }])
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [part2Done])

  // Start over: clears the guess, the runs, the results and the tutor, and returns the page to its first state.
  const handleStartOver = () => {
    part1.reset()
    part2.reset()
    replay.reset()
    setGuess(null)
    setSubmitted(null)
    setVelocity(0.8)
    setCustomVelocity('')
    setPart2Runs([])
    setPart2Result(null)
    setExplained(false)
  }

  const lastPart2 = part2Runs.length > 0 ? part2Runs[part2Runs.length - 1] : null
  const buttonStyle = (disabled: boolean) => ({
    marginRight: '0.5rem',
    padding: '0.5rem 1rem',
    fontSize: '0.875rem',
    opacity: disabled ? 0.6 : 1,
  })
  const r = part1Result
  const part1Status = part1Running ? 'Drawing...' : part1Done ? 'Finished' : 'Not started'
  const part2Status = part2Running ? 'Drawing...' : part2Done ? 'Finished' : 'Not started'
  const animTime1 = replaying ? replay.time : part1.time

  return (
    <div style={{ padding: '2rem', maxWidth: '900px', margin: '0 auto' }}>
      <h2>Experiment 8 — Drawing Spacetime</h2>

      <div className="exp-card" style={{ marginTop: '2rem', padding: '1.5rem' }}>
        <div style={{ marginBottom: '2rem', fontSize: '0.875rem', color: 'var(--text-muted)' }}>
          <p style={paragraph}>
            <strong>The question.</strong> In &ldquo;At the same time... for whom?&rdquo;, you saw two separate numbers: the time the flash
            reached the back end of the moving block, and the time it reached the front end. They were different. Is there a single
            picture that shows why, instead of two numbers computed separately?
          </p>
          <p style={paragraph}>
            <strong>A graph you already know.</strong> Picture an ordinary graph of a car&rsquo;s position over time. Position runs left to
            right (the horizontal axis); time runs bottom to top (the vertical axis) — so later moments are higher up the page, and
            further-along positions are further to the right. A parked car draws a straight vertical line: its position never changes,
            only time passes. A car cruising at a steady speed draws a straight line that leans over instead — the faster it goes, the
            more it leans. Nothing new so far; this is a graph you&rsquo;ve likely seen in a math class.
          </p>
          <p style={paragraph}>
            <strong>The same graph, new name.</strong> A spacetime diagram is exactly this kind of graph, just applied to physics:
            position left to right, time bottom to top. A single moment at a single place — &ldquo;here, right now&rdquo; — is one point
            on it, called an <strong>event</strong> (the same word &ldquo;One clock&rdquo; used for a moment in time; now it also has a
            place). A line that traces where something was at every moment is called its <strong>worldline</strong>. A parked
            car&rsquo;s worldline is vertical; a cruising car&rsquo;s worldline leans over. That&rsquo;s all a worldline is.
          </p>
          <p style={paragraph}>
            <strong>One block, two worldlines.</strong> This experiment uses the same rigid block as &ldquo;At the same time... for
            whom?&rdquo;: it doesn&rsquo;t stretch or bend, and both of its ends move together at one steady speed. Standing still it
            is <strong>half a light-second</strong> long. A <strong>light-second</strong> is the distance light travels in one second,
            about 300,000 km, so the block is about 150,000 km long. (A real block would be far shorter. We use a giant one so that the
            numbers are easy to read.) But the block still has two ends — a{' '}
            <strong style={{ color: '#7c3aed' }}>front end</strong> and a <strong style={{ color: '#2563eb' }}>back end</strong> — and
            they&rsquo;re never at the same position. Each end gets traced separately, in its own color below, so the diagram shows two
            leaning lines, not one. They lean by the same amount and stay the block&rsquo;s own length apart, the whole time — just two
            &ldquo;cruising cars,&rdquo; side by side, at a fixed distance from each other. (The lean is about motion through time, not
            the block bending in space — freeze the diagram at any one moment and the block is still perfectly straight.)
          </p>
          <BlockToLinesSketch />
          <p style={paragraph}>
            <strong>Light&rsquo;s worldline.</strong> Light always travels at c, the same speed, in the lab (see &ldquo;Why can&rsquo;t
            light go faster?&rdquo;). So a flash of light always leans over by the same fixed amount, no matter how fast the block is
            moving — only the block&rsquo;s lines get steeper or shallower as its speed changes. In this experiment, the flash is released
            from the block&rsquo;s exact center and spreads both ways at once, so it draws two worldlines from that single starting point
            — one leaning toward the back end, one toward the front — meeting only there. (It&rsquo;s two separate rays, not one ray
            reversing direction, so don&rsquo;t read it as dipping down and coming back up.)
          </p>
          <FlashToLinesSketch />
          <p style={paragraph}>
            <strong>What is being done.</strong> &ldquo;At the same time... for whom?&rdquo; calculated the two times when the flash
            reached each end. Here we draw the whole situation as one picture instead, so you can see those same two events as the points
            where the block&rsquo;s worldlines cross the light&rsquo;s worldlines.
          </p>
          <p style={paragraph}>
            <strong>Your job.</strong> Before you press START, make one guess. Look ahead to what the diagram will show and predict:
            which worldline will the light reach first — the block&rsquo;s back end, its front end, or will it reach both at exactly the
            same time? A wrong guess is fine, and guesses are not scored. When you press START, the diagram draws itself, and your guess
            appears on it in white. Then you can try other speeds in Part 2 and talk it over with the tutor.
          </p>
          <p style={paragraph}>
            <strong>Your guess and the real picture.</strong> Your guess never changes the real diagram or the numbers: they come from a
            calculation that knows nothing about what you guessed. Your guess has no size or position of its own, so it is drawn as a
            white <strong>marker</strong> in a box labelled YOUR GUESS, pointing at the choice you made (a marker only). It appears when
            the two dots appear, and it is shown again beside the results. In Part 2 the speed you choose does change the diagram, and
            your speed is written in pink.
          </p>
          <p style={paragraph}>
            <strong>Some new words.</strong> The &ldquo;Words and formulas&rdquo; box below has each one, with a short plain meaning:
            spacetime diagram, event, worldline, position, time, lean, block, rest length, length seen from the lab, back end, front end,
            flash, light-second, c, lab, at rest, moving, and the one formula used here, time = distance &divide; speed.
          </p>
          <p style={{ marginTop: 0, marginBottom: '0.25rem' }}>
            <strong>What we assume.</strong>
          </p>
          <ul style={{ marginTop: '0.25rem', marginBottom: 0, paddingLeft: '1.25rem' }}>
            <li>
              Everything here is drawn from the lab&rsquo;s point of view. The block&rsquo;s own point of view is not drawn as a separate
              set of axes in this experiment.
            </li>
            <li>There is no gravity, and the block keeps a steady speed.</li>
            <li>
              Light always travels at c in the lab, in both directions (see &ldquo;Why can&rsquo;t light go faster?&rdquo;).
            </li>
            <li>
              The block&rsquo;s length, seen from the lab, is shorter than its rest length, by the amount &ldquo;Does motion change
              length?&rdquo; found.
            </li>
            <li>
              The flash is released from the exact center of the block, just as in &ldquo;At the same time... for whom?&rdquo;.
            </li>
          </ul>
        </div>

        <ReferencePanel entries={REFERENCE_ENTRIES} />

        <div style={{ marginBottom: '2rem', fontSize: '0.875rem', color: 'var(--text-muted)' }}>
          <p style={{ marginTop: 0, marginBottom: '0.25rem' }}>
            <strong>Want to know more?</strong> Plainer-language pages are listed here. Checked on 10 November 2026. The links open in a
            new tab. This page has no real experimental result, so there is no paper to link. One more page appears after the
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
            Here is a spacetime diagram: position runs left to right, time runs bottom to top. A line that leans over means something
            moving. A flash of light is released from the middle of a block moving at <strong>{PART1_VELOCITY}c</strong>, and travels
            outward in both directions. On the diagram, which worldline will the light cross first?
          </p>
          <div style={{ marginBottom: '1rem' }}>
            {ORDER_CHOICES.map((choice) => (
              <button
                key={choice.value}
                type="button"
                onClick={() => setGuess(choice.value)}
                disabled={locked}
                className={`toggle-button${guess === choice.value ? ' is-selected' : ''}`}
                style={buttonStyle(locked)}
              >
                {choice.label}
              </button>
            ))}
          </div>
          <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.5rem' }}>
            {locked && submitted
              ? `${describeGuess(submitted)} Your guess is locked while you try other speeds. To change it, press Start over.`
              : guess !== null
                ? describeGuess(guess)
                : 'Choose an option to continue'}
          </p>
        </div>

        <button
          type="button"
          onClick={handleStart}
          disabled={part1Running || part2Running || locked || guess === null}
          className="action-button"
          style={{ padding: '0.75rem 2rem', fontSize: '1rem' }}
        >
          {part1Running ? 'Drawing...' : 'START'}
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
        {guess === null && !locked && <p style={smallNote}>Choose an option above to press START.</p>}

        {/* Placed directly under START so the drawing is on screen the moment it begins. */}
        <div ref={part1Ref} style={{ marginTop: '2rem' }}>
          {submitted !== null ? (
            <>
              <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)' }}>
                {part1Status} · Playback time: <strong>{animTime1.toFixed(2)} s</strong>
              </p>
              <SpacetimeDiagram
                diagram={part1Diagram}
                animTime={animTime1}
                title={`SPACETIME DIAGRAM: THE BLOCK MOVING AT ${PART1_VELOCITY}c`}
                guess={submitted}
                label={`A spacetime diagram of the block moving at ${PART1_VELOCITY}c. Position in light-seconds runs across and time in seconds runs up. The blue and purple solid lines are the block's back and front ends, and the blue and purple dashed lines are the flash going towards each end. The blue dot, the back end reached, is at ${r.backEventLabTime.toFixed(3)} seconds and the purple dot, the front end reached, at ${r.frontEventLabTime.toFixed(3)} seconds. Your guess is a white marker: ${orderWording[submitted]}.`}
              />
              <WhereFrom>
                <strong>Measured:</strong> nothing on this page. <strong>Calculated here:</strong> every line and dot, from the speed of
                light, c, and the block&rsquo;s length seen from the lab, using the rules of &ldquo;Why can&rsquo;t light go
                faster?&rdquo; and &ldquo;Does motion change length?&rdquo;, and the times of &ldquo;At the same time... for
                whom?&rdquo;. <strong>Imagined for the question:</strong> the block and the flash are an imagined scene, a thought
                experiment that nobody has built. Nothing on the diagram is a &ldquo;what if&rdquo;. The white marker is only your guess.
              </WhereFrom>
              <DiagramCaption speedLabel={`${PART1_VELOCITY}c`} part={1} />
              {part1Done && (
                <>
                  <WorkedMoment result={r} diagram={part1Diagram} part={1} />
                  <LookFor result={r} part={1} />
                  <button
                    type="button"
                    onClick={handleReplay}
                    disabled={replaying}
                    className="secondary-button"
                    style={{ marginTop: '0.75rem', padding: '0.5rem 1.25rem', fontSize: '0.875rem', opacity: replaying ? 0.5 : 1 }}
                  >
                    Replay
                  </button>
                </>
              )}
            </>
          ) : (
            <p style={smallNote}>Make a prediction and press START to see the diagram.</p>
          )}
        </div>

        {!part1Done && submitted !== null && (
          <p style={smallNote}>The diagram is drawing. The worked moment appears when it ends, and Parts 2 to 4 appear below it.</p>
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
                Your guess does not change the diagram or the tables, but this speed does. The speed stops at {MAX_SPEED}c on this page,
                as in &ldquo;Does motion change length?&rdquo;.
              </p>
              <button
                type="button"
                onClick={handleRunPart2}
                disabled={!speedValid || part2Running || part1Running}
                className="action-button"
                style={{ padding: '0.6rem 1.5rem', marginTop: '0.5rem' }}
              >
                {part2Running ? 'Drawing...' : 'Run your speed'}
              </button>
            </div>

            <div ref={part2Ref}>
              {part2Geometry && part2Diagram ? (
                <Block>
                  <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)' }}>
                    {part2Status} · Playback time: <strong>{(part2Result ? part2.time : 0).toFixed(2)} s</strong>
                  </p>
                  <SpacetimeDiagram
                    diagram={part2Diagram}
                    animTime={part2Result ? part2.time : 0}
                    title="SPACETIME DIAGRAM: THE BLOCK AT YOUR SPEED"
                    scaleDiagrams={part2ScaleDiagrams}
                    pinkSpeed={part2Geometry.velocity}
                    label={`A spacetime diagram of the block at your speed, ${part2Geometry.velocity}c. The back end is reached at ${part2Geometry.backEventLabTime.toFixed(3)} seconds and the front end at ${part2Geometry.frontEventLabTime.toFixed(3)} seconds. Your speed is written in pink.`}
                  />
                  {part2Result && (
                    <>
                      <WhereFrom>
                        <strong>Calculated here, not measured.</strong> Every line and dot comes from the speed you chose, using the
                        same rules as Part 1. The block and the flash are imagined, as in Part 1.
                      </WhereFrom>
                      <DiagramCaption speedLabel={`${part2Geometry.velocity}c`} part={2} />
                    </>
                  )}
                </Block>
              ) : (
                <p style={smallNote}>Choose a speed between 0c and {MAX_SPEED}c to see the diagram.</p>
              )}
            </div>

            {lastPart2 && !part2Running ? (
              <Block>
                <WorkedMoment result={lastPart2.result} diagram={spacetimeDiagramFor(lastPart2.result)} part={2} />
                <LookFor result={lastPart2.result} part={2} runs={part2Runs.map((run) => run.result)} />
                <p style={{ fontSize: '0.875rem', marginBottom: 0, marginTop: '0.75rem' }}>
                  <strong>Runs so far</strong>
                </p>
                <ul style={{ fontSize: '0.875rem', marginTop: '0.25rem', paddingLeft: '1.25rem' }}>
                  {part2Runs.map((run, i) => (
                    <li key={i}>
                      {run.result.velocity}c: back end reached {run.result.backEventLabTime.toFixed(3)} s, front end reached{' '}
                      {run.result.frontEventLabTime.toFixed(3)} s, gap {run.result.labTimeGap.toFixed(3)} s
                    </li>
                  ))}
                </ul>
              </Block>
            ) : (
              !part2Running && (
                <p style={smallNote}>Not run yet. Choose a speed and press Run your speed; the diagram for it will draw here.</p>
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

            <Part3Results r={r} diagram={part1Diagram} submitted={submitted} />
          </>
        )}

        {/* ===== Part 4 ===== */}
        {part1Done && submitted !== null && (
          <>
            <PartHeader color="#0066cc" title="Part 4: The tutor">
              {PART_LEADS.part4}
            </PartHeader>
            <Experiment8Tutor
              onExplained={() => {
                setExplained(true)
                onTutorComplete?.()
              }}
              key={`${PART1_VELOCITY}-${submitted}`}
              result={r}
              predictionOrder={submitted}
            />
            {explained && (
              <div style={{ marginTop: '1.5rem', fontSize: '0.875rem', color: 'var(--text-muted)' }}>
                <p style={{ marginTop: 0, marginBottom: '0.25rem' }}>
                  <strong>More to read, now that you have the explanation.</strong> This page says in general terms that observers
                  disagree about which events are simultaneous, which is close to the answer to your guess, so it was held back until
                  now. Checked on 10 November 2026. The link opens in a new tab.
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
