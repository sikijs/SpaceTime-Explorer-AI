import { useEffect, useMemo, useRef, useState } from 'react'
import { runSimultaneityExperiment } from '../physics/relativityOfSimultaneityExperiment'
import type { SimultaneityResult } from '../physics/relativityOfSimultaneityExperiment'
import { spacetimeDiagramFor } from '../physics/spacetimeDiagramView'
import {
  PART1_CLOCKS_SCALE_END,
  PART2_CLOCKS_SCALE_END,
  blockFrameEventsFor,
  lorentzWorkedNumbers,
} from '../physics/lorentzTransform'
import type { TimeChoice } from '../physics/lorentzTransform'
import { Experiment11Tutor } from './Experiment11Tutor'
import { AxesSketch } from './Experiment11Sketch'
import { CheckUpTable, ClocksPanel, DiagramCaption11, LookFor11, WorkedMoment11, timeChoiceLabels } from './Experiment11Pictures'
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

// Relativity of Time and Motion, Experiment 11, audited to the newer rules (docs/audit/relativity-of-time-and-motion/
// 11-draft-wording.md, approved by the owner on 2026-11-11): the page in four Parts, the diagram of "Same time, different line" on a
// dark ground with the block's two own axes in orange, a new panel "The two events on two sets of clocks" with a white YOUR GUESS
// marker, a Part 2 diagram for the learner's own speed, a new sketch, captions, a check-up against earlier chapters, a words box,
// links, Start over and a tutor that points to the marker. Every number drawn comes from the physics module
// (src/physics/lorentzTransform.ts and spacetimeDiagramView.ts; CLAUDE.md §9). The wording is the owner's to approve line by line
// (§28.1).

// Part 1 uses this fixed speed; Part 2 lets the learner choose others, including the 0c baseline.
export const PART1_VELOCITY = 0.5
const VELOCITY_PRESETS = [0.1, 0.3, 0.5, 0.8] as const

type VelocityOption = 0 | 0.1 | 0.3 | 0.5 | 0.8 | 'other'

// A custom speed must be positive; the v = 0 baseline is reached through its own preset instead.
const MIN_SPEED = 0.01
const MAX_SPEED = 0.9

const TIME_CHOICES: TimeChoice[] = ['same', 'different']

// The "What we are about to do" lead of each Part. The Part 1 lead gives no answer (CLAUDE.md §12).
export const PART_LEADS = {
  part1: `First you make one guess: whether the two flash events come out at the same time or at different times in the block’s own frame, for a block moving at ${PART1_VELOCITY}c. Then you press Run and watch the diagram draw itself, the block’s two own axes appear, and a panel show each event’s time on two sets of clocks. Your guess is shown beside it in white.`,
  part2: `Now you choose a speed, from 0c (the block standing still) to ${MAX_SPEED}c, and run it. The speed you choose changes the diagram in this Part, and your speed is written in pink. It does not change Part 1’s diagram, the results in Part 3, or your guess.`,
  part3: 'Here are the two events’ numbers on the lab’s clocks and on the block’s own clocks from the Part 1 run, a check of the new numbers against earlier chapters, and your guess beside them. Nothing in this Part changes with your guess or with the speed you choose in Part 2.',
  part4: 'Talk through what you saw. The tutor points to your white marker and the two rows of the panel, then explains.',
}

function describeGuess(choice: TimeChoice): string {
  return `Your prediction: ${choice === 'same' ? 'the two events will come out at the same time' : 'the two events will come out at different times'}.`
}

// Pages fetched on 11 November 2026 by helpers (the text of the Einstein Online pages was returned, not their pictures; see the audit's
// draft wording, section 10). Gaps recorded there: no plain official page from NASA, ESA, CERN, Fermilab, NIST or LIGO on a spacetime
// diagram's tilted axes or on the Lorentz transformation; no plain official page for the light-second; Einstein's 1905 paper and
// Lorentz's 1904 paper not linked (the owner's default: a gap); this page uses no real result, so there is no paper to link. The last four
// links were added on 2026-11-11 at the owner's request (found and read by helpers through WebFetch, summaries only; the two Norton pages are
// university course chapters, not official outreach pages; no plain official table of the time-dilation factor against speed was found).
const PLAIN_LINKS = [
  {
    href: 'https://www.einstein-online.info/en/explandict/lorentz-transformation-2/',
    label: 'Einstein Online: "Lorentz transformation"',
    what: 'a one-sentence definition: the central formulae of special relativity, which turn the position and time one observer gives an event into the position and time another observer gives that same event. About 60 words, no equation. (Glossary entry, Max Planck Institute for Gravitational Physics; no date shown.)',
  },
  {
    href: 'https://www.einstein-online.info/en/spacetime/',
    label: 'Einstein Online: "Elementary Tour, part 5: Spacetime"',
    what: 'a plain page that says observers moving relative to each other disagree about which events are simultaneous but agree on which events exist, with a spacetime diagram of light cones. It describes one observer’s diagram and does not mention tilted axes. (Max Planck Institute for Gravitational Physics; no date shown.)',
  },
  {
    href: 'https://www.einstein-online.info/en/spotlight/now/',
    label: 'Einstein Online: "The definition of \'now\'"',
    what: 'how we can say that two events in two places are "at the same time" using light signals between clocks set to agree, and why the answer depends on the frame of reference. It mostly treats stationary observers, and has no train and no equations. (Max Planck Institute for Gravitational Physics; 2010.)',
  },
  {
    href: 'https://www.einstein-online.info/en/?p=11618',
    label: 'Einstein Online: "From light clocks to time dilation"',
    what: 'a light-clock thought experiment, with animations, showing why a moving clock runs slow. It works through one speed (about 86.7% of the speed of light, where the slowing is exactly a factor of 2) and has no table of other speeds. (Max Planck Institute for Gravitational Physics; 2021.)',
  },
  {
    href: 'https://www.einstein-online.info/en/?p=6554',
    label: 'Einstein Online: "Elementary Tour, part 3: The relativity of space and time"',
    what: 'a plain-words introduction to moving clocks running slow, moving rulers looking shorter, and why "at the same time" depends on who is measuring, using a firecracker example. It has no numbers and no diagrams. (Max Planck Institute for Gravitational Physics; no date shown.)',
  },
  {
    href: 'https://sites.pitt.edu/~jdnorton/teaching/HPS_0410/chapters/spacetime_rel_sim/index.html',
    label: 'John Norton, "Spacetime and the Relativity of Simultaneity"',
    what: 'text and figures showing that a moving observer’s own "now" lines are tilted on a spacetime diagram, using everyday comparisons such as maps turned to different directions. It is conceptual only, with no equations and no speeds. (A university course chapter, University of Pittsburgh, "Einstein for Everyone"; updated through September 2024.)',
  },
  {
    href: 'https://sites.pitt.edu/~jdnorton/teaching/HPS_0410/chapters/Special_relativity_rel_sim/index.html',
    label: 'John Norton, "Special Relativity Simultaneity"',
    what: 'a thought experiment with light flashes and observers at both ends of a platform, and everyday cases such as birthday candles in two cities, showing why two observers in relative motion can disagree about whether two events happen at the same time. It has no tilted-line diagram and no speeds. (A university course chapter, University of Pittsburgh; first written 2001, updated through September 2024.)',
  },
]

// Links repeated at the bottom of Parts 2, 3 and 4 (added 2026-11-11 at the owner's request; every one is also in the list above Part 1).
// Each Part gets the pages that fit what that Part shows.
const PART_LINK_HREFS: Record<'part2' | 'part3' | 'part4', string[]> = {
  part2: ['https://www.einstein-online.info/en/?p=11618', 'https://www.einstein-online.info/en/?p=6554'],
  part3: [
    'https://www.einstein-online.info/en/explandict/lorentz-transformation-2/',
    'https://www.einstein-online.info/en/spacetime/',
    'https://sites.pitt.edu/~jdnorton/teaching/HPS_0410/chapters/spacetime_rel_sim/index.html',
  ],
  part4: [
    'https://www.einstein-online.info/en/spotlight/now/',
    'https://sites.pitt.edu/~jdnorton/teaching/HPS_0410/chapters/Special_relativity_rel_sim/index.html',
    'https://sites.pitt.edu/~jdnorton/teaching/HPS_0410/chapters/spacetime_rel_sim/index.html',
  ],
}

function PartLinks({ part }: { part: keyof typeof PART_LINK_HREFS }) {
  const links = PART_LINK_HREFS[part].map((href) => PLAIN_LINKS.find((l) => l.href === href)).filter((l) => l !== undefined)
  return (
    <div style={{ margin: '1.5rem 0 0', fontSize: '0.875rem', color: 'var(--text-muted)' }}>
      <p style={{ marginTop: 0, marginBottom: '0.25rem' }}>
        <strong>Want to know more?</strong> These pages fit what this Part shows. They open in a new tab.
      </p>
      <ul style={{ marginTop: 0, marginBottom: 0, paddingLeft: '1.25rem' }}>
        {links.map((link) => (
          <li key={link.href}>
            <ExternalLink href={link.href}>{link.label}</ExternalLink> — {link.what}
          </li>
        ))}
      </ul>
    </div>
  )
}

const round3 = (n: number) => parseFloat(n.toFixed(3))

// The "Words and formulas" box. The worked example uses 0.6c and an event that is not one of the two flash events, so the box gives no
// answer to the guess (CLAUDE.md §12). The numbers come from the physics module (CLAUDE.md §9).
function referenceEntries(): { term: string; meaning: string }[] {
  const example = lorentzWorkedNumbers({ position: 0.2, time: 0.5 }, 0.6)
  return [
    { term: 'Event', meaning: 'one thing happening at one place and one moment.' },
    { term: 'Position', meaning: 'where an event happens, in light-seconds.' },
    { term: 'Time', meaning: 'when an event happens, in seconds.' },
    { term: 'Simultaneous / the same moment', meaning: 'happening at the same time.' },
    { term: 'Frame', meaning: 'the point of view of someone standing still in their own group, with their own clocks and rulers. The lab is one frame; the moving block has its own.' },
    { term: 'Lab', meaning: 'where the experiment is set up. Its clocks stand still.' },
    { term: 'Axis', meaning: 'a line that shows which direction to measure along, like the lines on graph paper. A frame has two: one for when (time) and one for where (space).' },
    { term: 'Time axis', meaning: 'the line along which a frame’s time runs. For the lab it points straight up. For the block, it is the path of a spot that stays at the block’s centre as time passes, and it leans because the block is moving.' },
    { term: 'Space axis', meaning: 'a frame’s own “same moment” line. For the lab it points straight across. For the block it is the tilted line from “Same time, different line”.' },
    { term: 'Origin', meaning: 'the point where the flash is released, position 0 and time 0.' },
    { term: 'Light-second', meaning: 'the distance light travels in one second, about 300,000 km.' },
    { term: 'c', meaning: 'the speed of light, about 300,000 km every second. 0.5c is half of that.' },
    { term: 'Time dilation factor', meaning: 'how much slower a moving clock ticks than the lab’s, as a fraction (from “The moving clock”). At 0.6c it is 0.8, so the moving clock ticks 0.8 as fast.' },
    { term: 'Lorentz transformation', meaning: 'the rule that turns an event’s lab position and time into the position and time a moving frame would give for the same event.' },
    {
      term: 'Formula 1: the block’s own time',
      meaning: `(1 ÷ time dilation factor) × (the lab’s time − speed × the lab’s position). Example: an event at position 0.2 light-seconds and time 0.5 s, seen from a frame moving at 0.6c. The factor is ${round3(example.factor)}, so 1 ÷ ${round3(example.factor)} = ${round3(example.inverseFactor)}, and ${round3(example.inverseFactor)} × (0.5 − 0.6 × 0.2) = ${round3(example.blockTime)} s.`,
    },
    {
      term: 'Formula 2: the block’s own position',
      meaning: `(1 ÷ time dilation factor) × (the lab’s position − speed × the lab’s time). The same example: ${round3(example.inverseFactor)} × (0.2 − 0.6 × 0.5) = ${round3(example.blockPosition)} light-seconds.`,
    },
  ]
}

// The results (Part 3): values only come from the physics module; the interface adds no number of its own. Each block has a note
// ("What this table tells us": what it is, what it means with the real numbers, why it matters) and no mechanism (the tutor's).
export function Part3Results11({ r, submitted }: { r: SimultaneityResult; submitted: TimeChoice }) {
  const events = blockFrameEventsFor(r)
  const labGap = events.lab.front.time - events.lab.back.time
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
            <strong>Calculated here:</strong> the times, positions and checks, from the speed you ran, using the rules you met in earlier
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
      </div>

      <div style={resultBlock}>
        <p style={{ ...resultLine, fontWeight: 'bold' }}>In the lab&rsquo;s frame</p>
        <p style={resultLine}>
          <strong style={{ color: '#2563eb' }}>Back event:</strong> position {events.lab.back.position.toFixed(3)} light-seconds, time{' '}
          {events.lab.back.time.toFixed(3)} s
        </p>
        <p style={resultLine}>
          <strong style={{ color: '#7c3aed' }}>Front event:</strong> position {events.lab.front.position.toFixed(3)} light-seconds, time{' '}
          {events.lab.front.time.toFixed(3)} s
        </p>
        <NoteList title="What this table tells us.">
          These are the two dots on the diagram, from &ldquo;At the same time... for whom?&rdquo;. They are {labGap.toFixed(3)} s apart on
          the lab&rsquo;s clocks. <em>Why it matters:</em> the transformation starts from them.
        </NoteList>
      </div>

      <div style={resultBlock}>
        <p style={{ ...resultLine, fontWeight: 'bold' }}>In the block&rsquo;s own frame (Lorentz transformation)</p>
        <p style={resultLine}>
          <strong style={{ color: '#2563eb' }}>Back event:</strong> position {events.block.back.position.toFixed(3)} light-seconds, time{' '}
          {events.block.back.time.toFixed(3)} s
          <GuessTag />
        </p>
        <p style={resultLine}>
          <strong style={{ color: '#7c3aed' }}>Front event:</strong> position {events.block.front.position.toFixed(3)} light-seconds, time{' '}
          {events.block.front.time.toFixed(3)} s
          <GuessTag />
        </p>
        <NoteList title="What this table tells us.">
          These are what someone riding with the block would measure for the same two events. Both times are{' '}
          {events.block.back.time.toFixed(3)} s, so on the block&rsquo;s own clocks the events are{' '}
          {events.timesAgree ? 'at the same time' : 'at different times'}. The positions are {events.block.back.position.toFixed(3)} and{' '}
          {events.block.front.position.toFixed(3)}: the two ends are {(events.block.front.position - events.block.back.position).toFixed(3)}{' '}
          light-seconds apart, the block&rsquo;s length at rest. <em>Why it matters:</em> it is the answer to your guess: same time or
          different times.
        </NoteList>
      </div>

      <div style={resultBlock}>
        <p style={{ ...resultLine, fontWeight: 'bold' }}>Check-up: the new numbers against earlier chapters</p>
        <CheckUpTable result={r} />
        <NoteList title="What this table tells us.">
          <strong>What it is:</strong> the transformation&rsquo;s results beside numbers worked out earlier by a different route.
          &ldquo;At the same time... for whom?&rdquo; reasoned from the block&rsquo;s own point of view: the flash starts at the middle, so
          it has the same distance, {(r.restLength / 2).toFixed(3)} light-seconds, to go each way, and light goes 1 light-second every
          second, so it takes {r.rodFrameEventTime.toFixed(3)} s. &ldquo;Does motion change length?&rdquo; gave the block&rsquo;s length at
          rest, {r.restLength.toFixed(3)} light-seconds. <strong>What it means with the numbers:</strong> all four agree, to three decimal
          places. <em>Why it matters:</em> the Lorentz transformation never saw those earlier calculations, so the agreement is a real
          check that the rule is doing what the earlier chapters found by reasoning. It is a check of the rule against the earlier
          results, not a measurement.
        </NoteList>
      </div>

      <div style={{ ...resultBlock, marginBottom: '1rem' }}>
        <p style={{ ...resultLine, fontWeight: 'bold' }}>Your prediction</p>
        <p style={resultLine}>
          You guessed the two events would come out {submitted === 'same' ? 'at the same time' : 'at different times'}
          <GuessTag />.
        </p>
        <p style={smallNote}>Your guess is shown beside the panel on Part 1&rsquo;s diagram as a white marker.</p>
      </div>
    </>
  )
}

interface RunRecord {
  result: SimultaneityResult
}

interface Experiment11Props {
  onComplete?: () => void
  onTutorComplete?: () => void
}

export function Experiment11({ onComplete, onTutorComplete }: Experiment11Props) {
  const [guess, setGuess] = useState<TimeChoice | null>(null)
  const [submitted, setSubmitted] = useState<TimeChoice | null>(null)
  const [velocity, setVelocity] = useState<VelocityOption>(0.8)
  const [customVelocity, setCustomVelocity] = useState('')
  const [part2Runs, setPart2Runs] = useState<RunRecord[]>([])
  const [part2Result, setPart2Result] = useState<SimultaneityResult | null>(null)
  const part1 = useDrawing(onComplete)
  const part2 = useDrawing()
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
  const locked = submitted !== null

  const selectedVelocity = velocity === 'other' ? Number(customVelocity) : velocity
  const speedValid =
    customVelocity.trim() === '' && velocity === 'other'
      ? false
      : isFinite(selectedVelocity) && (velocity === 0 || (selectedVelocity >= MIN_SPEED && selectedVelocity <= MAX_SPEED))
  const speedText = speedValid ? `${selectedVelocity}c` : '—'

  const hasAnythingToClear = guess !== null || locked || part1.status !== 'idle' || part2Runs.length > 0
  const startOverDisabled = !hasAnythingToClear || part1Running || part2Running

  const handleRun = () => {
    if (guess === null || locked) return
    setSubmitted(guess)
    part1.start(drawingLength(part1Diagram))
    // Bring the diagram into view so the learner can watch it being drawn.
    part1Ref.current?.scrollIntoView({ behavior: 'smooth', block: 'center' })
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
    setGuess(null)
    setSubmitted(null)
    setVelocity(0.8)
    setCustomVelocity('')
    setPart2Runs([])
    setPart2Result(null)
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
  const axesRevealed1 = part1.time >= drawingLength(part1Diagram) - 1e-9 && part1.status !== 'idle'
  const axesRevealed2 = part2Result !== null && part2Diagram !== null && part2.time >= drawingLength(part2Diagram) - 1e-9 && part2.status !== 'idle'

  return (
    <div style={{ padding: '2rem', maxWidth: '900px', margin: '0 auto' }}>
      <h2>Experiment 11 — The Block's Own Axes</h2>

      <div className="exp-card" style={{ marginTop: '2rem', padding: '1.5rem' }}>
        <div style={{ marginBottom: '2rem', fontSize: '0.875rem', color: 'var(--text-muted)' }}>
          <p style={paragraph}>
            <strong>The question.</strong> &ldquo;Same time, different line&rdquo; showed you a tilted line — the block&rsquo;s own idea
            of &ldquo;the same moment&rdquo; — but that line, by itself, doesn&rsquo;t tell you the actual numbers. Is there a real
            mathematical rule for converting the lab&rsquo;s numbers into the block&rsquo;s own numbers, for any event?
          </p>
          <p style={paragraph}>
            <strong>There is: it&rsquo;s called the Lorentz transformation.</strong> It&rsquo;s a rule that takes an event&rsquo;s
            position and time, as measured in the lab, and calculates the position and time that someone moving along with the block
            would measure for that exact same event. It doesn&rsquo;t change what happened — it just translates the description from one
            point of view into the other, the way converting kilometers to miles doesn&rsquo;t change a distance, only how it&rsquo;s
            written down. An <strong>event</strong> is one thing happening at one place and one moment, like the flash reaching one end of
            the block. Its <strong>position</strong> is where it happens, in light-seconds; its <strong>time</strong> is when, in seconds.
            A <strong>frame</strong> is the point of view of someone standing still in their own group, measuring with their own clocks
            and rulers: the lab is one frame, and the moving block has its own.
          </p>
          <p style={paragraph}>
            <strong>A frame&rsquo;s own axes.</strong> To place an event on a diagram, you need two directions to measure along: one for{' '}
            <em>when</em> and one for <em>where</em>. Each of these directions is called an <strong>axis</strong>. Think of the lines on
            graph paper: you count squares along one line to say how far across, and along the other to say how far up.
          </p>
          <p style={paragraph}>
            <strong>The lab&rsquo;s axes.</strong> On the diagram you drew, the lab&rsquo;s two axes are easy to see.
          </p>
          <ul style={{ margin: '0 0 1rem', paddingLeft: '1.5rem', lineHeight: 1.6 }}>
            <li>
              <strong>The lab&rsquo;s time axis</strong> points straight <strong>up</strong>. Moving up means time passing on the
              lab&rsquo;s clocks.
            </li>
            <li>
              <strong>The lab&rsquo;s space axis</strong> points straight <strong>across</strong>. Moving along it means moving from
              place to place at one moment on the lab&rsquo;s clocks. It is the lab&rsquo;s &ldquo;same moment&rdquo; line.
            </li>
          </ul>
          <p style={paragraph}>
            <strong>The block&rsquo;s axes.</strong> The block is a frame too, and it has its own pair.
          </p>
          <ul style={{ margin: '0 0 1rem', paddingLeft: '1.5rem', lineHeight: 1.6 }}>
            <li>
              <strong>The block&rsquo;s time axis</strong> is the path of a spot that stays at the block&rsquo;s centre as time passes.
              We already know this path: the block is moving, so on the lab&rsquo;s diagram it leans away from straight up.
            </li>
            <li>
              <strong>The block&rsquo;s space axis</strong> is the block&rsquo;s own &ldquo;same moment&rdquo; line. This is the tilted
              line you saw in &ldquo;Same time, different line&rdquo;.
            </li>
          </ul>
          <p style={paragraph}>
            <strong>Why both are tilted.</strong> Picture a sheet of graph paper laid on a table, with a second grid drawn on it at a
            slant. Both grids describe the same table, but each counts squares along its own lines. In the same way, the lab and the
            block describe the same events, but each measures along its own pair of axes. The block&rsquo;s pair leans because the block
            is moving. A rule that turns the lab&rsquo;s numbers into the block&rsquo;s numbers is exactly what the Lorentz
            transformation does. (This is only a picture for what an axis is. The real lean is calculated, and the sketch below shows
            it.)
          </p>
          <AxesSketch />
          <p style={paragraph}>
            <strong>What you&rsquo;re about to do.</strong> We&rsquo;re going to draw the diagram from &ldquo;Same time, different
            line&rdquo; again, with the block&rsquo;s two own axes added in orange, and then use the Lorentz transformation to calculate
            the block&rsquo;s own numbers for the two events from &ldquo;At the same time... for whom?&rdquo;. Before we do, make one
            guess: in the block&rsquo;s own frame, will the two events come out at the same time, or at different times? Guesses are not
            scored. When you press <strong>Run</strong>, the diagram draws itself, the two orange axes appear, and then a panel shows each
            event&rsquo;s time on the lab&rsquo;s clocks and on the block&rsquo;s own clocks. Your guess is shown beside that panel in
            white. Then you can try other speeds in Part 2 and talk it over with the tutor.
          </p>
          <p style={paragraph}>
            <strong>Your guess and the real picture.</strong> Your guess never changes the real diagram, the panel or the numbers: they
            come from a calculation that knows nothing about what you guessed. Your guess has no size of its own (it is only &ldquo;same
            time&rdquo; or &ldquo;different times&rdquo;), so it is drawn as a white <strong>marker</strong> in a box labelled YOUR GUESS:
            two white ticks level with each other for &ldquo;same time&rdquo;, and two ticks apart for &ldquo;different times&rdquo;. How
            far apart the ticks are is <strong>only an example</strong>, not the real gap. The marker appears when the panel does, and it
            is shown again beside the results. In Part 2 the speed does change the drawings, and your speed is written in pink.
          </p>
          <p style={paragraph}>
            <strong>Some new words.</strong> The &ldquo;Words and formulas&rdquo; box below has each one, with a short plain meaning: event,
            position, time, simultaneous, frame, lab, axis, time axis, space axis, origin, light-second, c, time dilation factor, the
            Lorentz transformation, and the two formulas used here.
          </p>
          <p style={{ marginTop: 0, marginBottom: '0.25rem' }}>
            <strong>What we assume.</strong>
          </p>
          <ul style={{ marginTop: '0.25rem', marginBottom: 0, paddingLeft: '1.25rem' }}>
            <li>
              Everything here is still the same block-and-flash scenario from &ldquo;Does motion change length?&rdquo;, &ldquo;At the same
              time... for whom?&rdquo;, &ldquo;Drawing Spacetime&rdquo; and &ldquo;Same time, different line&rdquo; — nothing about the
              setup changes. We&rsquo;re only adding two new lines to the picture and calculating two new numbers.
            </li>
            <li>There is no gravity, and the block keeps a steady speed.</li>
          </ul>
        </div>

        <ReferencePanel entries={referenceEntries()} />

        <div style={{ marginBottom: '2rem', fontSize: '0.875rem', color: 'var(--text-muted)' }}>
          <p style={{ marginTop: 0, marginBottom: '0.25rem' }}>
            <strong>Want to know more?</strong> Plainer-language pages are listed here. Checked on 11 November 2026. The links open in a
            new tab. This page has no real experimental result, so there is no paper to link.
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
            &ldquo;At the same time... for whom?&rdquo; showed that, on the <strong>lab&rsquo;s</strong> clocks, the flash reaches the
            back end and the front end of the block at <strong>different times</strong>.
          </p>
          <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)', marginBottom: '0.75rem' }}>
            Now we ask what the block&rsquo;s <strong>own</strong> clocks would say. Someone riding along with the block uses their own
            clocks and rulers. To find their numbers, we take each event&rsquo;s position and time as measured in the lab and put them
            through a conversion rule, the <strong>Lorentz transformation</strong>. It works like converting kilometres to miles: the
            event itself does not change, only the numbers used to describe it.
          </p>
          <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)', marginBottom: '0.75rem' }}>
            The block moves at <strong>{PART1_VELOCITY}c</strong>, half the speed of light. For the two events, the flash reaching the
            back end and the flash reaching the front end, what do you expect the block&rsquo;s own clocks to show: the{' '}
            <strong>same time</strong>, or <strong>different times</strong>?
          </p>
          <div style={{ marginBottom: '1rem' }}>
            {TIME_CHOICES.map((choice) => (
              <button
                key={choice}
                type="button"
                onClick={() => setGuess(choice)}
                disabled={locked}
                className={`toggle-button${guess === choice ? ' is-selected' : ''}`}
                style={buttonStyle(locked)}
              >
                {timeChoiceLabels[choice]}
              </button>
            ))}
          </div>
          <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.5rem' }}>
            {locked && submitted
              ? `${describeGuess(submitted)} Your prediction is locked while you try other settings. To change it, press Start over.`
              : guess !== null
                ? describeGuess(guess)
                : 'Choose an option to continue'}
          </p>
        </div>

        <button
          type="button"
          onClick={handleRun}
          disabled={part1Running || part2Running || locked || guess === null}
          className="action-button"
          style={{ padding: '0.75rem 2rem', fontSize: '1rem' }}
        >
          {part1Running ? 'Drawing...' : 'Run'}
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
        {guess === null && !locked && <p style={smallNote}>Choose an option above to press Run.</p>}

        {/* Placed directly under Run so the drawing is on screen the moment it begins. */}
        <div ref={part1Ref} style={{ marginTop: '2rem' }}>
          {submitted !== null ? (
            <>
              <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)' }}>
                {part1Status} · Playback time: <strong>{part1.time.toFixed(2)} s</strong>
              </p>
              <SpacetimeDiagram
                diagram={part1Diagram}
                animTime={part1.time}
                title={`SPACETIME DIAGRAM: THE BLOCK MOVING AT ${PART1_VELOCITY}c`}
                showSameMomentLines={axesRevealed1}
                blockAxes={axesRevealed1}
                label={`A spacetime diagram of the block moving at ${PART1_VELOCITY}c. Position in light-seconds runs across and time in seconds runs up. The blue and purple solid lines are the block's back and front ends, the dashed lines are the flash going toward each end, and the two dots are the two events. When the drawing ends, a green line passes through the two dots and two orange lines show the block's own time axis (solid) and space axis (dashed), both tilted.`}
              />
              {axesRevealed1 && (
                <Block>
                  <ClocksPanel
                    result={r}
                    scaleEnd={PART1_CLOCKS_SCALE_END}
                    guess={submitted}
                    pinkSpeed={null}
                    label={`The two events on two sets of clocks. The lab's clocks put the back event at ${blockFrameEventsFor(r).lab.back.time.toFixed(3)} seconds and the front event at ${blockFrameEventsFor(r).lab.front.time.toFixed(3)} seconds. The block's own clocks put both events at ${blockFrameEventsFor(r).block.back.time.toFixed(3)} seconds. Your guess is marked in white.`}
                  />
                </Block>
              )}
              <WhereFrom>
                <strong>Measured:</strong> nothing on this page. <strong>Calculated here:</strong> every line and dot, from the speed of
                light and the block&rsquo;s length seen from the lab (&ldquo;Does motion change length?&rdquo;), the times of
                &ldquo;At the same time... for whom?&rdquo; and the lines of &ldquo;Drawing Spacetime&rdquo; and &ldquo;Same time,
                different line&rdquo;; and the block&rsquo;s own times, by the Lorentz transformation. <strong>Imagined for the
                question:</strong> the block and the flash are an imagined scene, a thought experiment that nobody has built. The two
                orange axes are drawn from the block&rsquo;s speed; they have no tick marks. The white marker is only your guess.
              </WhereFrom>
              <DiagramCaption11 speedLabel={`${PART1_VELOCITY}c`} part={1} />
              {part1Done && (
                <>
                  <WorkedMoment11 result={r} part={1} />
                  <LookFor11 result={r} part={1} />
                </>
              )}
            </>
          ) : (
            <p style={smallNote}>Make a prediction and press Run to see the diagram.</p>
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
                half the speed of light. The 0c run is a baseline: the block stands still, so its axes lie on the lab&rsquo;s. On this
                page you can choose speeds up to {MAX_SPEED}c.
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
              <p style={smallNote}>Your guess does not change the diagram or the tables, but this speed does.</p>
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
              {part2Geometry && part2Diagram && part2Result ? (
                <Block>
                  <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)' }}>
                    {part2Status} · Playback time: <strong>{part2.time.toFixed(2)} s</strong>
                  </p>
                  <SpacetimeDiagram
                    diagram={part2Diagram}
                    animTime={part2.time}
                    title="SPACETIME DIAGRAM: THE BLOCK AT YOUR SPEED"
                    scaleDiagrams={part2ScaleDiagrams}
                    pinkSpeed={part2Geometry.velocity}
                    showSameMomentLines={axesRevealed2}
                    blockAxes={axesRevealed2}
                    label={`A spacetime diagram of the block at your speed, ${part2Geometry.velocity}c, with the block's own time axis and space axis in orange once the drawing ends.`}
                  />
                  {axesRevealed2 && (
                    <Block>
                      <ClocksPanel
                        result={part2Result}
                        scaleEnd={PART2_CLOCKS_SCALE_END}
                        guess={null}
                        pinkSpeed={part2Result.velocity}
                        label={`The two events on two sets of clocks at your speed, ${part2Result.velocity}c. The lab's clocks put the events at ${blockFrameEventsFor(part2Result).lab.back.time.toFixed(3)} and ${blockFrameEventsFor(part2Result).lab.front.time.toFixed(3)} seconds; the block's own clocks put both at ${blockFrameEventsFor(part2Result).block.back.time.toFixed(3)} seconds.`}
                      />
                    </Block>
                  )}
                  <WhereFrom>
                    <strong>Calculated here, not measured.</strong> Every line, dot and clock reading comes from the speed you chose,
                    using the same rules as Part 1. The block and the flash are imagined, as in Part 1.
                  </WhereFrom>
                  <DiagramCaption11 speedLabel={`${part2Geometry.velocity}c`} part={2} />
                </Block>
              ) : (
                <p style={smallNote}>Choose a speed between 0c and {MAX_SPEED}c and press Run your speed to see the diagram.</p>
              )}
            </div>

            {lastPart2 && !part2Running ? (
              <Block>
                <WorkedMoment11 result={lastPart2.result} part={2} />
                <LookFor11 result={lastPart2.result} part={2} runs={part2Runs.map((run) => run.result)} />
                <p style={{ fontSize: '0.875rem', marginBottom: 0, marginTop: '0.75rem' }}>
                  <strong>Runs so far</strong>
                </p>
                <ul style={{ fontSize: '0.875rem', marginTop: '0.25rem', paddingLeft: '1.25rem' }}>
                  {part2Runs.map((run, i) => {
                    const ev = blockFrameEventsFor(run.result)
                    return (
                      <li key={i}>
                        {run.result.velocity}c: lab&rsquo;s clocks {ev.lab.back.time.toFixed(3)} s and {ev.lab.front.time.toFixed(3)} s,
                        block&rsquo;s own clocks {ev.block.back.time.toFixed(3)} s and {ev.block.front.time.toFixed(3)} s
                      </li>
                    )
                  })}
                </ul>
              </Block>
            ) : (
              !part2Running && (
                <p style={smallNote}>Not run yet. Choose a speed and press Run your speed; the diagram for it will draw here.</p>
              )
            )}

            <PartLinks part="part2" />
          </>
        )}

        {/* ===== Part 3 ===== */}
        {part1Done && submitted !== null && (
          <>
            <PartHeader color="#0f766e" title="Part 3: The results">
              {PART_LEADS.part3}
            </PartHeader>

            <Part3Results11 r={r} submitted={submitted} />

            <PartLinks part="part3" />
          </>
        )}

        {/* ===== Part 4 ===== */}
        {part1Done && submitted !== null && (
          <>
            <PartHeader color="#0066cc" title="Part 4: The tutor">
              {PART_LEADS.part4}
            </PartHeader>
            <Experiment11Tutor key={`${PART1_VELOCITY}-${submitted}`} result={r} guess={submitted} onExplained={onTutorComplete} />

            <PartLinks part="part4" />
          </>
        )}
      </div>
    </div>
  )
}
