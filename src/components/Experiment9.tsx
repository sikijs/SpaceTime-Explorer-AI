import { useEffect, useMemo, useRef, useState } from 'react'
import { runSimultaneityExperiment } from '../physics/relativityOfSimultaneityExperiment'
import type { SimultaneityResult } from '../physics/relativityOfSimultaneityExperiment'
import { sameMomentLeanFor, spacetimeDiagramFor } from '../physics/spacetimeDiagramView'
import type { ShapeChoice, SpacetimeDiagramData } from '../physics/spacetimeDiagramView'
import { Experiment9Tutor } from './Experiment9Tutor'
import { LevelLineSketch } from './Experiment9Sketch'
import { DiagramCaption9, LookFor9, WorkedMoment9 } from './Experiment9Pictures'
import { SpacetimeDiagram } from './Experiment8Pictures'
import {
  Block,
  ExternalLink,
  GuessTag,
  NoteList,
  WhereFrom,
  drawingLength,
  paragraph,
  resultBlock,
  resultLine,
  smallNote,
  useDrawing,
} from './Experiment8'
import { ReferencePanel } from './EnergyMomentumExperiment'
import { PartHeader } from './GravitationalWaveExperiment'

// Relativity of Time and Motion, Experiment 9, audited to the newer rules (docs/audit/relativity-of-time-and-motion/
// 09-draft-wording.md, approved by the owner on 2026-11-10): the page in four Parts, the diagram of "Drawing Spacetime" on a dark ground
// with labels, ticks and a key, the block's own line in green with the lab's level line beside it, one white example marker for the
// guess, a Part 2 diagram for the learner's own speed, a new sketch, captions, a words box, links, Start over, notes under the results
// and a tutor that points to the marker. Every number drawn comes from the physics module (src/physics/spacetimeDiagramView.ts over
// relativityOfSimultaneityExperiment.ts; CLAUDE.md §9). The wording is the owner's to approve line by line (§28.1).

// Part 1 uses this fixed speed; Part 2 lets the learner choose others, including the 0c baseline.
export const PART1_VELOCITY = 0.5
const VELOCITY_PRESETS = [0.1, 0.3, 0.5, 0.8] as const

type VelocityOption = 0 | 0.1 | 0.3 | 0.5 | 0.8 | 'other'

// A custom speed must be positive; the v = 0 baseline is reached through its own preset instead.
const MIN_SPEED = 0.01
const MAX_SPEED = 0.9

const SHAPE_CHOICES: Array<{ value: ShapeChoice; label: string }> = [
  { value: 'flat', label: 'Flat, level across the diagram' },
  { value: 'tilted', label: 'Tilted' },
]

// The "What we are about to do" lead of each Part. The Part 1 lead gives no answer (CLAUDE.md §12).
export const PART_LEADS = {
  part1: `First you make one guess: whether the new line through the two dots will be flat or tilted, for a block moving at ${PART1_VELOCITY}c. Then you press START and watch the diagram draw itself, and then the new line appear. Your guess is shown beside it in white.`,
  part2: `Now you choose a speed, from 0c (the block standing still) to ${MAX_SPEED}c, and run it. The speed you choose changes the diagram in this Part, and your speed is written in pink. It does not change Part 1’s diagram, the results in Part 3, or your guess.`,
  part3: 'Here are the times and the lean of the line from the Part 1 run, with your guess listed beside them. Nothing in this Part changes with your guess or with the speed you choose in Part 2.',
  part4: 'Talk through what you saw. The tutor points to your white marker and the green line, then explains what the line shows.',
}

function describeGuess(choice: ShapeChoice): string {
  return `Your prediction: the line will be ${choice === 'flat' ? 'flat' : 'tilted'}.`
}

// Pages fetched on 10 November 2026 by helpers (a summary of each page was returned, not its raw text; see the audit's draft wording,
// section 10). Gaps recorded there: no plain official page from NASA, ESA, CERN, Fermilab or LIGO on the relativity of simultaneity;
// no plain official page on a graph of position against time; no plain official page for the light-second; Minkowski's 1908 lecture and
// Einstein's 1905 paper not linked (the owner's default: a gap); this page uses no real result, so there is no paper to link.
const PLAIN_LINKS = [
  {
    href: 'https://www.einstein-online.info/en/spotlight/now/',
    label: 'Einstein Online: "The definition of \'now\'"',
    what: 'how we can say that two events in two places are "at the same time" using light signals between clocks set to agree, and why the answer depends on the frame of reference. It mostly treats stationary observers, and has no train and no equations. (Max Planck Institute for Gravitational Physics; 2010.)',
  },
  {
    href: 'https://www.einstein-online.info/en/relativity_space_time/',
    label: 'Einstein Online: "Elementary Tour, part 3: The relativity of space and time"',
    what: 'a plain page that says space and time measurements depend on the observer, with time dilation and length contraction and the evidence from particle accelerators. Simultaneity gets only a passing mention. (Max Planck Institute for Gravitational Physics.)',
  },
  {
    href: 'https://www.einstein-online.info/en/speed_of_light/',
    label: 'Einstein Online: "Elementary Tour, part 4: The speed of light"',
    what: 'a plain page that says the speed of light is the same, 299,792.458 kilometres per second, for everyone, even someone on a fast-moving spaceship. It does not use the word light-second. (Max Planck Institute for Gravitational Physics.)',
  },
]

// Held back until the tutor has explained: its diagrams may show slanted lines of simultaneity, which is the answer to the guess (the
// helper could not tell from its summary).
const AFTER_TUTOR_LINKS = [
  {
    href: 'https://www.einstein-online.info/en/spacetime/',
    label: 'Einstein Online: "Elementary Tour, part 5: Spacetime"',
    what: 'a short section with a spacetime diagram, space across and time up, and light cones, where observers disagree about simultaneity but agree on which events happen. It is conceptual, and talks of different ways to "slice" the events. (Max Planck Institute for Gravitational Physics.)',
  },
]

// The "Words and formulas" box: terms and one formula (lean = time ÷ position). The lean of the block's own line is not given, because
// it is the answer to the guess.
const REFERENCE_ENTRIES: { term: string; meaning: string }[] = [
  { term: 'The same moment / simultaneous', meaning: 'two things happening at the same time.' },
  { term: 'Event', meaning: 'something that happens at one place and one moment: one point on the diagram.' },
  { term: 'Worldline', meaning: 'the line that shows where something was at every moment.' },
  { term: 'Position', meaning: 'where something is along the line the block moves on, in light-seconds.' },
  { term: 'Time', meaning: 'when, in seconds, measured from the moment the flash was released.' },
  { term: 'Lab', meaning: 'the place where the experiment is set up, where the measuring is done.' },
  { term: 'Frame (reference frame)', meaning: 'the point of view of someone standing still in their own group, measuring with their own clocks and rulers. The lab is one; the moving block has its own.' },
  { term: 'Block', meaning: 'a long, flat block, like a train car lying on the ground, not a pole standing upright. It is half a light-second long when it stands still, and it moves along its own length, front end first.' },
  { term: 'Back end / front end', meaning: 'the end of the block that it moves away from, and the end it moves towards.' },
  { term: 'Flash', meaning: 'a short burst of light released from the exact middle of the block.' },
  { term: 'Light-second', meaning: 'the distance light travels in one second, about 300,000 km. Half a light-second is about 150,000 km.' },
  { term: 'c', meaning: 'the speed of light, about 300,000 km every second. 0.5c is half of that.' },
  { term: 'The lab’s “same moment” line', meaning: 'a level line on the diagram, because every point on it is at the same time.' },
  { term: 'The block’s own “same moment” line', meaning: 'the line that joins the events that someone riding with the block calls simultaneous.' },
  { term: 'Lean', meaning: 'how much a line tilts, found as the time it rises divided by the position it goes across.' },
  { term: 'Formula, lean = time ÷ position', meaning: 'a line that rises 0.1 s while it goes 0.4 light-second across leans 0.1 ÷ 0.4 = 0.25 s for every light-second. A level line rises 0 s, so it leans 0. (The lean of the block’s own line is not given here, because it would give away what you are asked to predict.)' },
]

// The results (Part 3): values only come from the physics module; the interface adds no number of its own. Each block has a note
// ("What this table tells us": what it is, what it means with the real numbers, why it matters) and no mechanism (the tutor's).
export function Part3Results9({ r, diagram, submitted }: { r: SimultaneityResult; diagram: SpacetimeDiagramData; submitted: ShapeChoice }) {
  const rise = diagram.frontEvent.time - diagram.backEvent.time
  const across = diagram.frontEvent.position - diagram.backEvent.position
  const lean = sameMomentLeanFor(diagram)
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
            <strong>Calculated here:</strong> the times, positions, lean and length, from the speed you ran, using the rules you met in
            earlier chapters.
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
        </p>
        <p style={resultLine}>
          <strong style={{ color: '#7c3aed' }}>Front end</strong> reached: {r.frontEventLabTime.toFixed(3)} s, at position{' '}
          {diagram.frontEvent.position.toFixed(3)} light-second
        </p>
        <NoteList title="What this table tells us.">
          These are the blue and purple dots, the same two events as in &ldquo;Drawing Spacetime&rdquo;. The height of each dot is its
          time. <em>Why it matters:</em> the line you guessed about goes through them.
        </NoteList>
      </div>

      <div style={resultBlock}>
        <p style={{ ...resultLine, fontWeight: 'bold' }}>The line through them (the green line)</p>
        <p style={resultLine}>
          It rises {rise.toFixed(3)} s while it goes {across.toFixed(3)} light-second across.
        </p>
        <p style={resultLine}>
          <strong>How much the line leans:</strong> {lean.toFixed(3)} s for every light-second (a level line leans 0)
          <GuessTag />
        </p>
        <NoteList title="What this table tells us.">
          The lean says how much the time changes for each light-second across. A lean of 0 would mean level, the lab&rsquo;s &ldquo;same
          moment&rdquo; line; {lean.toFixed(3)} means the block&rsquo;s own line is {lean === 0 ? 'on' : 'tilted away from'} it.{' '}
          <em>Why it matters:</em> it is the diagram&rsquo;s answer to your guess: flat or tilted.
        </NoteList>
      </div>

      <div style={{ ...resultBlock, marginBottom: '1rem' }}>
        <p style={{ ...resultLine, fontWeight: 'bold' }}>Your prediction</p>
        <p style={resultLine}>
          You guessed the line would be {submitted === 'flat' ? 'flat' : 'tilted'}
          <GuessTag />.
        </p>
        <p style={smallNote}>Your guess is shown beside the green line on Part 1&rsquo;s diagram as a white marker.</p>
      </div>
    </>
  )
}

interface RunRecord {
  result: SimultaneityResult
}

interface Experiment9Props {
  onComplete?: () => void
  onTutorComplete?: () => void
}

export function Experiment9({ onComplete, onTutorComplete }: Experiment9Props) {
  const [guess, setGuess] = useState<ShapeChoice | null>(null)
  const [submitted, setSubmitted] = useState<ShapeChoice | null>(null)
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
  const lineRevealed1 = animTime1 >= drawingLength(part1Diagram) - 1e-9
  const lineRevealed2 = part2Result !== null && part2Diagram !== null && part2.time >= drawingLength(part2Diagram) - 1e-9 && part2.status !== 'idle'

  return (
    <div style={{ padding: '2rem', maxWidth: '900px', margin: '0 auto' }}>
      <h2>Experiment 9 — Same Time, Different Line</h2>

      <div className="exp-card" style={{ marginTop: '2rem', padding: '1.5rem' }}>
        <div style={{ marginBottom: '2rem', fontSize: '0.875rem', color: 'var(--text-muted)' }}>
          <p style={paragraph}>
            <strong>The question.</strong> Imagine two friends riding together in a car — one sitting in the front seat, one in the back.
            Something happens at the front of the car. A little later (or maybe at the very same time — that&rsquo;s the question),
            something else happens at the back. The two friends, riding together, can compare notes and agree on whether those two things
            happened at the same moment.
          </p>
          <p style={paragraph}>
            Now imagine someone standing still on the sidewalk, watching the car drive past. Would that person necessarily agree with the
            two friends about which things happened &ldquo;at the same moment&rdquo;? It seems like they should — after all,
            it&rsquo;s the same two events. But it turns out the answer is no, and you&rsquo;ve already seen why.
          </p>
          <p style={paragraph}>
            Here&rsquo;s why that can happen. You saw it, in &ldquo;At the same time... for whom?&rdquo;, with the block: a flash of light
            was released from the block&rsquo;s exact center. In the block&rsquo;s own <strong>frame</strong>, the flash has equally far to
            travel in each direction, so it reaches both ends at the same moment. But the block is moving — so, as seen from the lab, the
            back end moves toward the point where the flash started, while the front end moves away from it. That means the flash reaches
            the back end first, according to the lab&rsquo;s own clocks. Whenever two events happen in different places, and something has
            to travel between them to connect them, motion can shift how those events line up in time — differently, depending on
            who&rsquo;s watching. (A <strong>frame</strong>, short for reference frame, is the point of view of someone who is standing
            still in their own group, measuring with their own clocks and rulers. The lab is one frame. The moving block has its own.)
          </p>
          <p style={paragraph}>
            Someone riding along with the moving block says the flash reached both ends at exactly the same moment — just like the two
            friends in the car, comparing notes. Someone standing still in the lab, watching the block go by, does not agree. This chapter
            asks: can we actually see that disagreement on the diagram, instead of just being told about it in numbers?
          </p>
          <p style={paragraph}>
            <strong>What is on the diagram.</strong> The diagram is the one from &ldquo;Drawing Spacetime&rdquo;: <strong>position</strong>{' '}
            runs across, in <strong>light-seconds</strong> (a light-second is the distance light travels in one second, about 300,000 km),
            and <strong>time</strong> runs up, in seconds, from the moment the flash was released. A single moment at a single place is an{' '}
            <strong>event</strong>. A line that shows where something was at every moment is a <strong>worldline</strong>. The
            block&rsquo;s two ends and the two parts of the flash each draw one.
          </p>
          <p style={paragraph}>
            <strong>A line for &ldquo;the same moment.&rdquo;</strong> Look at the diagram again — the one you built in &ldquo;Drawing
            Spacetime&rdquo;. Any flat, level line drawn straight across it, the kind that doesn&rsquo;t lean up or down at all, connects
            points that all happen at the same moment, according to the lab. That&rsquo;s what &ldquo;the same moment&rdquo; means on this
            diagram, for someone standing still and watching, like the person on the sidewalk.
          </p>
          <LevelLineSketch />
          <p style={paragraph}>
            <strong>But the block is moving, like the car.</strong> The flat line above is the <em>lab&rsquo;s</em> way of saying
            &ldquo;the same moment.&rdquo; But the block is moving, just like the car with the two friends inside, so someone riding on
            the block has a way of their own. Remember what they said about the flash: it reached the back end and the front end at
            exactly the same moment. On the diagram, those two arrivals are the two dots, one at each end of the block. So, for the rider,
            those two dots <em>do</em> belong together, as one &ldquo;same moment.&rdquo;
          </p>
          <p style={paragraph}>
            Here is a way to picture it. On the flat line, the lab says &ldquo;every point on this line happens at the same moment.&rdquo;
            The rider says the same kind of thing about a line of their own: &ldquo;every point on my line happens at the same moment.&rdquo;
            The two dots sit on that line. So the question this chapter asks is: <strong>the lab&rsquo;s &ldquo;same moment&rdquo; line is
            drawn on this diagram as a flat line. If we draw the rider&rsquo;s &ldquo;same moment&rdquo; line on the same diagram, through
            the two dots, what does it look like?</strong> Is it flat like the lab&rsquo;s line, or does it look different? You will make
            a guess before you see it.
          </p>
          <p style={paragraph}>
            <strong>What you&rsquo;re about to do.</strong> We&rsquo;re going to draw one new line — a single straight line through the two
            dots you already saw. Before we do, make one guess: will that line be flat, like the lab&rsquo;s &ldquo;same moment&rdquo;
            line? Or will it lean over? A wrong guess is fine, and guesses are not scored. When you press START, the diagram draws itself,
            then the new line appears, and your guess is shown beside it in white. Then you can try other speeds in Part 2 and talk it over
            with the tutor.
          </p>
          <p style={paragraph}>
            <strong>Your guess and the real picture.</strong> Your guess never changes the real diagram or the numbers: they come from a
            calculation that knows nothing about what you guessed. Your guess has no size or position of its own (it is only
            &ldquo;flat&rdquo; or &ldquo;tilted&rdquo;), so it is drawn as a white <strong>marker</strong> in a box labelled YOUR GUESS: a
            short white bar, level for &ldquo;flat&rdquo; and leaning for &ldquo;tilted&rdquo;. The lean of the white bar is{' '}
            <strong>only an example</strong>, not the real lean. It appears when the real line appears, and it is shown again beside the
            results. In Part 2 the speed you choose does change the diagram, and your speed is written in pink.
          </p>
          <p style={paragraph}>
            <strong>Some new words.</strong> The &ldquo;Words and formulas&rdquo; box below has each one, with a short plain meaning: the
            same moment, simultaneous, event, worldline, position, time, lab, frame, block, back end, front end, flash, light-second, c,
            lean, the block&rsquo;s own line, and the one formula used here, lean = time &divide; position.
          </p>
          <p style={{ marginTop: 0, marginBottom: '0.25rem' }}>
            <strong>What we assume.</strong>
          </p>
          <ul style={{ marginTop: '0.25rem', marginBottom: 0, paddingLeft: '1.25rem' }}>
            <li>
              Everything here is still seen from the lab&rsquo;s side, exactly like &ldquo;Drawing Spacetime&rdquo; — we are only adding
              one new line to a picture you&rsquo;ve already seen, nothing else changes.
            </li>
            <li>There is no gravity, and the block keeps a steady speed.</li>
            <li>
              Light always travels at c in the lab, in both directions (see &ldquo;Why can&rsquo;t light go faster?&rdquo;).
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
            You already know, from &ldquo;Drawing Spacetime&rdquo;, that someone riding along with the block would say both flashes
            arrived at exactly the same moment. A flash is released from the middle of a block moving at{' '}
            <strong>{PART1_VELOCITY}c</strong>. If we draw a single straight line through the two dots, what do you expect: will that line
            come out flat, level across the diagram, or will it come out tilted?
          </p>
          <div style={{ marginBottom: '1rem' }}>
            {SHAPE_CHOICES.map((choice) => (
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
                showSameMomentLines={lineRevealed1}
                shapeGuess={submitted}
                label={`A spacetime diagram of the block moving at ${PART1_VELOCITY}c. Position in light-seconds runs across and time in seconds runs up. The blue and purple solid lines are the block's back and front ends, the dashed lines are the flash going towards each end, and the dots are where it reaches them, at ${r.backEventLabTime.toFixed(3)} and ${r.frontEventLabTime.toFixed(3)} seconds. When the drawing ends, a green line passes through the two dots and a pale grey dashed level line passes through the lower one. Your guess is a white example bar: ${submitted === 'flat' ? 'level' : 'leaning'}.`}
              />
              <WhereFrom>
                <strong>Measured:</strong> nothing on this page. <strong>Calculated here:</strong> every line and dot, from the speed of
                light, c, and the block&rsquo;s length seen from the lab, using the rules of &ldquo;Why can&rsquo;t light go
                faster?&rdquo; and &ldquo;Does motion change length?&rdquo;, and the times of &ldquo;At the same time... for
                whom?&rdquo; and the lines of &ldquo;Drawing Spacetime&rdquo;. <strong>Imagined for the question:</strong> the block and the
                flash are an imagined scene, a thought experiment that nobody has built. Nothing on the diagram is a &ldquo;what
                if&rdquo;. The white marker is only your guess.
              </WhereFrom>
              <DiagramCaption9 speedLabel={`${PART1_VELOCITY}c`} part={1} />
              {part1Done && (
                <>
                  <WorkedMoment9 result={r} diagram={part1Diagram} part={1} />
                  <LookFor9 result={r} diagram={part1Diagram} part={1} />
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
                    showSameMomentLines={lineRevealed2}
                    label={`A spacetime diagram of the block at your speed, ${part2Geometry.velocity}c. The back end is reached at ${part2Geometry.backEventLabTime.toFixed(3)} seconds and the front end at ${part2Geometry.frontEventLabTime.toFixed(3)} seconds. When the drawing ends, a green line passes through the two dots and a pale grey dashed level line passes through the lower one. Your speed is written in pink.`}
                  />
                  {part2Result && (
                    <>
                      <WhereFrom>
                        <strong>Calculated here, not measured.</strong> Every line and dot comes from the speed you chose, using the
                        same rules as Part 1. The block and the flash are imagined, as in Part 1.
                      </WhereFrom>
                      <DiagramCaption9 speedLabel={`${part2Geometry.velocity}c`} part={2} />
                    </>
                  )}
                </Block>
              ) : (
                <p style={smallNote}>Choose a speed between 0c and {MAX_SPEED}c to see the diagram.</p>
              )}
            </div>

            {lastPart2 && !part2Running ? (
              <Block>
                <WorkedMoment9 result={lastPart2.result} diagram={spacetimeDiagramFor(lastPart2.result)} part={2} />
                <LookFor9
                  result={lastPart2.result}
                  diagram={spacetimeDiagramFor(lastPart2.result)}
                  part={2}
                  runs={part2Runs.map((run) => run.result)}
                />
                <p style={{ fontSize: '0.875rem', marginBottom: 0, marginTop: '0.75rem' }}>
                  <strong>Runs so far</strong>
                </p>
                <ul style={{ fontSize: '0.875rem', marginTop: '0.25rem', paddingLeft: '1.25rem' }}>
                  {part2Runs.map((run, i) => (
                    <li key={i}>
                      {run.result.velocity}c: back end reached {run.result.backEventLabTime.toFixed(3)} s, front end reached{' '}
                      {run.result.frontEventLabTime.toFixed(3)} s, the line leans{' '}
                      {sameMomentLeanFor(spacetimeDiagramFor(run.result)).toFixed(3)} s for every light-second
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

            <Part3Results9 r={r} diagram={part1Diagram} submitted={submitted} />
          </>
        )}

        {/* ===== Part 4 ===== */}
        {part1Done && submitted !== null && (
          <>
            <PartHeader color="#0066cc" title="Part 4: The tutor">
              {PART_LEADS.part4}
            </PartHeader>
            <Experiment9Tutor
              onExplained={() => {
                setExplained(true)
                onTutorComplete?.()
              }}
              key={`${PART1_VELOCITY}-${submitted}`}
              result={r}
              predictionShape={submitted}
            />
            {explained && (
              <div style={{ marginTop: '1.5rem', fontSize: '0.875rem', color: 'var(--text-muted)' }}>
                <p style={{ marginTop: 0, marginBottom: '0.25rem' }}>
                  <strong>More to read, now that you have the explanation.</strong> This page has a spacetime diagram and talks of
                  different ways to &ldquo;slice&rdquo; events, which may be close to the answer to your guess, so it was held back until
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
