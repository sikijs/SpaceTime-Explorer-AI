import { useCallback, useEffect, useRef, useState, type ReactNode } from 'react'
import { REST_LENGTH, lengthBarRows, lengthForTick, roundTripForLength, runLengthContractionExperiment } from '../physics/lengthContractionExperiment'
import type { ClockVersionResult, LengthContractionResult, LengthChoice } from '../physics/lengthContractionExperiment'
import { REST_TICK_DURATION } from '../physics/lightClockExperiment'
import { Experiment6Tutor } from './Experiment6Tutor'
import { BarsCaption, GUESS_COLOR, GapBars, PanelsCaption, ThreeClockPanels } from './Experiment6Pictures'
import { ReferencePanel } from './EnergyMomentumExperiment'
import { PartHeader } from './GravitationalWaveExperiment'

// Relativity of Time and Motion, Experiment 6, audited to the newer rules (docs/audit/relativity-of-time-and-motion/
// 06-draft-wording.md, approved by the owner on 2026-11-09): the page in four Parts, labels on the canvas, three mirror-gap bars with
// a white YOUR GUESS mark and a white choice marker, the clock with the mirrors as far apart as at rest drawn in violet and labelled
// imagined, a Part 2 drawing for the learner's own speed, captions, a words box, links, Start over and a tutor that points to the
// marks. Every number drawn comes from the physics module (src/physics/lengthContractionExperiment.ts; CLAUDE.md §9). The wording
// is the owner's to approve line by line (CLAUDE.md §28.1).

// The second possible length the introduction compares with the rest length (its trips come from the physics module, CLAUDE.md §9).
const EXAMPLE_SHORT_LENGTH = 0.4

// Part 1 uses this fixed speed; Part 2 lets the learner choose others.
export const PART1_VELOCITY = 0.5
const VELOCITY_PRESETS = [0.1, 0.3, 0.5, 0.8] as const

type VelocityOption = 0.1 | 0.3 | 0.5 | 0.8 | 'other'
type RunStatus = 'idle' | 'running' | 'complete'

// This experiment allows speeds up to 0.9c: the tick of the clock whose mirrors stay as far apart as at rest grows very quickly
// above that (about 50 seconds at 0.99c).
const MIN_SPEED = 0.01
const MAX_SPEED = 0.9

// Playback only: real milliseconds shown per lab second, so that no run lasts more than about 15 real seconds. Never affects the
// physical result.
const PLAYBACK_MS_PER_LAB_SECOND = 2000
const MAX_RUN_MS = 15000

const CHOICES: Array<{ value: LengthChoice; label: string }> = [
  { value: 'same', label: 'The same length as at rest' },
  { value: 'shorter', label: 'Shorter than at rest' },
  { value: 'longer', label: 'Longer than at rest' },
]

const CHOICE_PHRASE: Record<LengthChoice, string> = {
  same: 'the same length as at rest',
  shorter: 'shorter than at rest',
  longer: 'longer than at rest',
}

// The "What we are about to do" lead of each Part. The Part 1 lead gives no answer (CLAUDE.md §12).
export const PART_LEADS = {
  part1: `First you make two guesses about the length of the moving clock, as seen from the lab: is it the same as at rest, shorter or longer, and how long is it in light-seconds? Then you press START and watch one tick of each clock at ${PART1_VELOCITY}c. When the run finishes, a strip of three bars appears that shows the length of each clock, with your guess drawn on it in white.`,
  part2: `Now you choose a speed from ${MIN_SPEED}c to ${MAX_SPEED}c and see how the length of the moving clock changes with speed. The speed you choose changes the clocks and the drawing in this Part, marked in pink. It does not change Part 1’s pictures, the results in Part 3, or your guesses.`,
  part3: 'Here are the lengths from the Part 1 run, and how we found them, with your guesses listed beside them. Nothing in this Part changes with your guesses or with the speed you choose in Part 2.',
  part4: 'Talk through what you saw. The tutor points to your white marks, then explains what the lengths tell us.',
}

interface Experiment6Prediction {
  choice: LengthChoice
  gap: number
}

function describePrediction(p: Experiment6Prediction): string {
  return `Your prediction: the length of the moving clock must be ${CHOICE_PHRASE[p.choice]}, ${p.gap} light-seconds long.`
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
    const animationDurationMs = total * Math.min(PLAYBACK_MS_PER_LAB_SECOND, MAX_RUN_MS / total)
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

// The run lasts until the slower moving clock (mirrors as far apart as at rest) has finished its tick.
const runLength = (e: LengthContractionResult) => Math.max(e.sameLength.tickDuration, e.shorterLength.tickDuration)

function ExternalLink({ href, children }: { href: string; children: ReactNode }) {
  return (
    <a href={href} target="_blank" rel="noopener noreferrer">
      {children}
    </a>
  )
}

// Pages fetched on 9 November 2026 by a helper (a summary of each page was returned, not its raw text; see the audit's draft
// wording, section 2). Gaps recorded there: no NASA, ESA or CERN page on length contraction; the 1905 paper not linked (it could not
// be fetched, and the owner chose to record a gap); no plain official page for the light-second; no real-world evidence (out of
// scope, specification Decision 10); this page uses no real result, so there is no paper to link.
const PLAIN_LINKS = [
  {
    href: 'https://science.nasa.gov/universe/exoplanets/our-milky-way-galaxy-how-big-is-space/',
    label: 'NASA Science: "Our Milky Way Galaxy: How Big is Space?"',
    what: 'a short, friendly article that says light travels 186,000 miles (300,000 kilometers) every second. (NASA Science, Exoplanet Exploration Program; updated April 2024.)',
  },
  {
    href: 'https://www.grc.nasa.gov/www/k-12/Numbers/Math/Mathematical_Thinking/how_fast_is_the_speed.htm',
    label: 'NASA Glenn: "How \'Fast\' is the Speed of Light?"',
    what: 'a plain page that says light goes 186,000 miles every second, enough to circle the Earth\'s equator about 7.5 times in one second. It gives miles only and does not use the word "light-second". (NASA Glenn Research Center.)',
  },
  {
    href: 'https://spaceplace.nasa.gov/time-travel/en/',
    label: 'NASA Space Place: "Is Time Travel Possible?"',
    what: 'a friendly page on how the faster you travel, the slower you experience time, with a clock on an aeroplane. It is about "time travel", not clocks and mirrors, and says nothing about length. (NASA Space Place; updated April 2020.)',
  },
  {
    href: 'https://pwg.gsfc.nasa.gov/stargaze/Lframes1.htm',
    label: 'NASA ISTP, Stargazers: "Lesson 23: Frames of Reference: The Basics"',
    what: 'a plain explanation of a frame of reference, with rain that looks slanted from a moving car. It is old (2004), it is about everyday motion, and it does not mention light clocks or length. (International Solar Terrestrial Physics, NASA Goddard.)',
  },
]

// Held back until the tutor has explained: this page says in so many words that moving things are measured shorter.
const AFTER_TUTOR_LINKS = [
  {
    href: 'https://www.einstein-online.info/en/?p=6554',
    label: 'Einstein Online: "Elementary Tour, part 3: The relativity of space and time"',
    what: 'a plain page with no equations that says moving clocks run slower and that a measuring rod whizzing past appears shortened. It is introductory and does not show how long or how short. (Max Planck Institute for Gravitational Physics, Einstein Online.)',
  },
]

// The "Words and formulas" box: terms and one formula (distance = speed × time). The length formula and the formulas for the trips
// in a moving clock are not given, because they would give away what the learner is asked to predict.
const REFERENCE_ENTRIES: { term: string; meaning: string }[] = [
  { term: 'Light clock', meaning: 'a clock made of two mirrors facing each other, with a pulse of light bouncing between them. It counts each round trip of the pulse. Here the mirrors are in a line along the direction the clock moves.' },
  { term: 'Tick', meaning: 'one round trip of the pulse, from the back mirror to the front mirror and back. The clock counts ticks to measure time. On this page a tick is mostly a tool for finding the length of the clock.' },
  { term: 'Mirror', meaning: 'a flat shiny surface that bounces light back.' },
  { term: 'Light pulse', meaning: 'a very short flash of light.' },
  { term: 'Light-second', meaning: 'the distance light travels in one second, about 300,000 km. Half a light-second is about 150,000 km.' },
  { term: 'Length (of the clock)', meaning: 'the distance from the back mirror to the front mirror, in light-seconds. This is the number the whole page is about.' },
  { term: 'Rest length', meaning: 'the length of the clock when it stands still: half a light-second.' },
  { term: 'Length measured by light', meaning: 'a length found from how long a pulse of light takes to cross it, because light’s speed in the lab is always c (distance = speed × time). A light-second is such a length.' },
  { term: 'As seen from the lab', meaning: 'as measured by observers and clocks standing still in the lab.' },
  { term: 'Lab', meaning: 'the place where the experiment is set up, with clocks and observers standing still.' },
  { term: 'Lab seconds', meaning: 'seconds counted by the clocks standing still in the lab.' },
  { term: 'Lab time', meaning: 'the time shown on the lab’s clocks.' },
  { term: 'Reference frame', meaning: 'a group of people and clocks that are all standing still relative to one another, so that none moves compared with the others. The lab is one; the moving clock has its own.' },
  { term: 'At rest / moving', meaning: 'standing still, or not standing still, compared with the lab.' },
  { term: 'Along its own length', meaning: 'in the same direction as the line joining the two mirrors, which is also the direction the clock moves.' },
  { term: 'c', meaning: 'the speed of light, about 300,000 km every second. 0.5c is half of that, and 1.000c means exactly the speed of light.' },
  { term: 'Time dilation', meaning: 'the effect you met in “A moving clock” and “Why time dilation happens”: a moving clock’s ticks are farther apart than a standing clock’s, as measured by the lab’s clocks.' },
  { term: 'Time dilation factor', meaning: 'the rest clock’s tick divided by the moving clock’s tick, on the lab’s clocks. 1 means no slowing; a smaller number means the moving clock’s ticks are farther apart.' },
  { term: 'Clock’s own reading', meaning: 'the time shown on the moving clock’s own display. It is lab time multiplied by the time dilation factor.' },
  { term: 'What if (imagined)', meaning: 'drawn in violet and labelled “imagined”. It is something we picture to see what would change; no instrument measured it.' },
  { term: 'Formula, distance = speed × time', meaning: 'the introduction and the results use it for each trip of the pulse (or, turned round, time = distance ÷ speed). Worked example from this page: light goes at 1 light-second every second, so to cover 0.5 light-second it needs 0.5 ÷ 1 = 0.5 second. (The formulas for the trips in a moving clock and for the length of the clock are not given here, because they would give away what you are asked to predict.)' },
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

// Shows a difference in seconds with its sign; a difference below the shown precision reads 0.000.
function formatDifference(seconds: number): string {
  const text = seconds.toFixed(3)
  if (text === '0.000' || text === '-0.000') return '0.000'
  return seconds > 0 ? `+${text}` : `−${text.replace('-', '')}`
}

// How a tick compares with the tick time dilation gives, in words: longer, shorter or the same (to the shown three decimals).
function describeTickDifference(seconds: number): string {
  const text = seconds.toFixed(3)
  if (text === '0.000' || text === '-0.000') return 'the same as'
  return seconds > 0 ? `${text} s longer than` : `${text.replace('-', '')} s shorter than`
}

// Values only, as reported by the physics model; no explanation here (that comes from the tutor). The length comes first; the
// pulse's trips and the tick are how it was found and checked.
function VersionResultBlock({ title, version, tagged }: { title: string; version: ClockVersionResult; tagged: boolean }) {
  return (
    <div style={resultBlock}>
      <p style={{ ...resultLine, fontWeight: 'bold' }}>{title}</p>
      <p style={resultLine}>
        <strong>Length, seen from the lab:</strong> {version.lengthInLab.toFixed(3)} light-seconds ({version.lengthRatio.toFixed(3)}{' '}
        of the length at rest)
        {tagged && (
          <>
            <GuessTag />
            <span style={{ marginLeft: '0.4rem', fontSize: '0.75rem', color: 'var(--text-muted)' }}>
              Your guess is drawn on Part 1&rsquo;s strip as a white mark.
            </span>
          </>
        )}
      </p>
      <p style={resultLine}>
        The pulse&rsquo;s trips took {version.forwardLegDuration.toFixed(3)} s forward and {version.returnLegDuration.toFixed(3)} s back,
        so this length gives a tick of {version.tickDuration.toFixed(3)} s on the lab&rsquo;s clocks.
      </p>
      <p style={resultLine}>
        Light&rsquo;s speed, seen from the lab (distance ÷ time): {version.lightSpeedForward.toFixed(3)}c going forward,{' '}
        {version.lightSpeedReturn.toFixed(3)}c coming back
      </p>
      <p style={resultLine}>
        Difference from the tick that time dilation gives: {formatDifference(version.differenceFromTimeDilationTick)} s
      </p>
    </div>
  )
}

// The results (Part 3): the length first, then how the pulse's trips gave it, then the learner's guess beside it. Values only
// come from the physics module; the interface adds no number of its own.
export function Part3Results({ r, submitted }: { r: LengthContractionResult; submitted: Experiment6Prediction }) {
  const restRow = lengthBarRows(r)[0]
  return (
    <>
    <div style={{ ...smallNote, marginBottom: '1rem' }}>
      <p style={{ marginTop: 0, marginBottom: '0.25rem' }}>
        <strong>Where these numbers come from.</strong>
      </p>
      <ul style={{ marginTop: 0, marginBottom: 0, paddingLeft: '1.25rem' }}>
        <li>
          <strong>Measured:</strong> nothing on this page. No instrument measured these lengths or ticks.
        </li>
        <li>
          <strong>Calculated here:</strong> the lengths, tick times and light speeds, from the speed you ran, using the
          light-clock geometry and the time dilation you met in earlier chapters.
        </li>
        <li>
          <strong>Imagined for the question:</strong> the violet clock, with its length kept the same as at rest.
        </li>
      </ul>
    </div>

    <div style={{ marginBottom: '1.5rem' }}>
      <p style={resultLine}>
        <strong>Moving clock speed:</strong> {r.velocity}c
      </p>
      <p style={{ ...resultLine, color: 'var(--text-muted)' }}>
        c is the speed of light. A light speed of 1.000c means exactly the speed of light. A light-second is the distance light
        travels in one second.
      </p>
      <p style={resultLine}>
        <strong>The length we are trying to find.</strong> The rest clock&rsquo;s length is {r.restLength.toFixed(3)}{' '}
        light-seconds. The moving clock&rsquo;s length, as seen from the lab, is {r.shorterLength.lengthInLab.toFixed(3)}{' '}
        light-seconds for the shorter clock and {r.sameLength.lengthInLab.toFixed(3)} light-seconds for the imagined clock with
        the same length as at rest.
      </p>
      <p style={resultLine}>
        <strong>How we found it: light&rsquo;s travel time.</strong> Light goes at c in the lab, so the time the pulse takes
        tells us a length: distance = speed &times; time. At rest the pulse crosses in {restRow.forwardLegDuration.toFixed(3)} s,
        which is {r.restLength.toFixed(3)} light-seconds. For the moving clock, each possible length gives its own trips and its
        own tick. The tick that time dilation gives is {r.timeDilationTick.toFixed(3)} s at {r.velocity}c, so we look for the
        length whose tick is {r.timeDilationTick.toFixed(3)} s. <em>Why it matters:</em> this is the link between the
        light&rsquo;s travel and the length.
      </p>
      <p style={resultLine}>
        <strong>The tick that time dilation gives (&ldquo;A moving clock&rdquo; and &ldquo;Why time dilation happens&rdquo;):</strong>{' '}
        {r.timeDilationTick.toFixed(3)} s
      </p>
    </div>

    <div style={resultBlock}>
      <p style={{ ...resultLine, fontWeight: 'bold' }}>Rest clock</p>
      <p style={resultLine}>
        <strong>Length:</strong> {r.restLength.toFixed(3)} light-seconds
      </p>
      <p style={resultLine}>
        The pulse crosses in {restRow.forwardLegDuration.toFixed(3)} s, so one tick takes{' '}
        {r.restTickDuration.toFixed(3)} s on the lab&rsquo;s clocks.
      </p>
      <p style={resultLine}>Light&rsquo;s speed, seen from the lab: 1.000c</p>
    </div>

    <VersionResultBlock title="Moving clock: same length as at rest (imagined)" version={r.sameLength} tagged />
    <VersionResultBlock title="Moving clock: shorter" version={r.shorterLength} tagged />

    <div style={{ ...resultBlock, marginBottom: '1rem' }}>
      <p style={{ ...resultLine, fontWeight: 'bold' }}>Your prediction</p>
      <p style={resultLine}>
        You guessed that the length of the moving clock must be {CHOICE_PHRASE[submitted.choice]}, {submitted.gap}{' '}
        light-seconds long, seen from the lab.
      </p>
      <p style={resultLine}>
        Length, clock with the same length as at rest (imagined): {r.sameLength.lengthInLab.toFixed(3)} light-seconds
      </p>
      <p style={resultLine}>
        Length, shorter clock: {r.shorterLength.lengthInLab.toFixed(3)} light-seconds
      </p>
      <p style={smallNote}>Your guesses are drawn on Part 1&rsquo;s strip as a white mark and a white marker.</p>
    </div>

    <div style={{ marginTop: '1rem', fontSize: '0.875rem' }}>
      <p style={{ marginBottom: '0.5rem' }}>
        <strong>What these results tell us.</strong>
      </p>
      <ul style={{ margin: 0, paddingLeft: '1.25rem' }}>
        <li style={{ marginBottom: '0.5rem' }}>
          <strong>The rest clock.</strong> Length {r.restLength.toFixed(3)} light-seconds, one tick of{' '}
          {r.restTickDuration.toFixed(3)} s, a light speed of 1.000c. <em>Why it matters:</em> this clock stands still, so its
          length is the one to compare the others with.
        </li>
        <li style={{ marginBottom: '0.5rem' }}>
          <strong>The tick that time dilation gives.</strong> {r.timeDilationTick.toFixed(3)} s at {r.velocity}c: the length of
          one tick of the moving clock as the lab&rsquo;s clocks show it. <em>Why it matters:</em> it is the target the two
          lengths are tested against.
        </li>
        <li style={{ marginBottom: '0.5rem' }}>
          <strong>The violet clock (imagined: same length as at rest).</strong> Length {r.sameLength.lengthInLab.toFixed(3)}{' '}
          light-seconds; the pulse&rsquo;s trip forward took {r.sameLength.forwardLegDuration.toFixed(3)} s and its trip back{' '}
          {r.sameLength.returnLegDuration.toFixed(3)} s, so this length gives a tick of {r.sameLength.tickDuration.toFixed(3)} s,
          which is {describeTickDifference(r.sameLength.differenceFromTimeDilationTick)} the tick time dilation gives;
          light&rsquo;s speed was {r.sameLength.lightSpeedForward.toFixed(3)}c going forward and{' '}
          {r.sameLength.lightSpeedReturn.toFixed(3)}c coming back. <em>Why it matters:</em> with the length unchanged, this
          tick does not fit. Remember this is imagined for the question.
        </li>
        <li style={{ marginBottom: '0.5rem' }}>
          <strong>The amber clock (shorter).</strong> Length {r.shorterLength.lengthInLab.toFixed(3)} light-seconds, which is{' '}
          {(r.restLength - r.shorterLength.lengthInLab).toFixed(3)} shorter than the rest length; the trips took{' '}
          {r.shorterLength.forwardLegDuration.toFixed(3)} s forward and {r.shorterLength.returnLegDuration.toFixed(3)} s back, so
          this length gives a tick of {r.shorterLength.tickDuration.toFixed(3)} s,{' '}
          {describeTickDifference(r.shorterLength.differenceFromTimeDilationTick)} the tick time dilation gives; light&rsquo;s
          speed was {r.shorterLength.lightSpeedForward.toFixed(3)}c in both directions. <em>Why it matters:</em> with this
          length, the tick fits.
        </li>
        <li style={{ marginBottom: '0.5rem' }}>
          <strong>Light&rsquo;s speed, seen from the lab.</strong> Path divided by time. It is{' '}
          {r.sameLength.lightSpeedForward.toFixed(3)}c for both legs in both moving clocks. <em>Why it matters:</em> light&rsquo;s
          speed stayed exactly c, so the trips differ only because the two moving clocks have different lengths.
        </li>
      </ul>
    </div>
    </>
  )
}

interface RunRecord {
  result: LengthContractionResult
}

interface Experiment6Props {
  onComplete?: () => void
  onTutorComplete?: () => void
}

export function Experiment6({ onComplete, onTutorComplete }: Experiment6Props) {
  const [choice, setChoice] = useState<LengthChoice | null>(null)
  const [gapInput, setGapInput] = useState('')
  const [submitted, setSubmitted] = useState<Experiment6Prediction | null>(null)
  const [velocity, setVelocity] = useState<VelocityOption>(0.8)
  const [customVelocity, setCustomVelocity] = useState('')
  const [part2Runs, setPart2Runs] = useState<RunRecord[]>([])
  const [part2Experiment, setPart2Experiment] = useState<LengthContractionResult | null>(null)
  const [explained, setExplained] = useState(false)
  const part1 = useClockRunner(onComplete)
  const part2 = useClockRunner()
  const part1Ref = useRef<HTMLDivElement>(null)
  const part2Ref = useRef<HTMLDivElement>(null)

  const part1Result = runLengthContractionExperiment(PART1_VELOCITY)
  const part1Running = part1.status === 'running'
  const part1Done = part1.status === 'complete'
  const part2Running = part2.status === 'running'
  const part2Done = part2.status === 'complete'
  const locked = submitted !== null

  const gapValue = gapInput.trim() ? Number(gapInput) : null
  const prediction: Experiment6Prediction | null =
    choice !== null && gapValue !== null && isFinite(gapValue) ? { choice, gap: gapValue } : null

  const selectedVelocity = velocity === 'other' ? Number(customVelocity) : velocity
  const speedValid = isFinite(selectedVelocity) && selectedVelocity >= MIN_SPEED && selectedVelocity <= MAX_SPEED
  const speedText = speedValid ? `${selectedVelocity}c` : '—'

  const hasAnythingToClear = choice !== null || gapInput !== '' || locked || part1.status !== 'idle' || part2Runs.length > 0
  const startOverDisabled = !hasAnythingToClear || part1Running || part2Running

  const handleStart = () => {
    if (prediction === null || locked) return
    setSubmitted(prediction)
    part1.start(runLength(part1Result))
    // Bring the three clocks into view so the learner can watch the run.
    part1Ref.current?.scrollIntoView({ behavior: 'smooth', block: 'center' })
  }

  const handleRunPart2 = () => {
    if (!speedValid || part1Running || part2Running) return
    const run = runLengthContractionExperiment(selectedVelocity)
    setPart2Experiment(run)
    part2.start(runLength(run))
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
    setGapInput('')
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
  const part2Geometry = part2Experiment ?? (speedValid ? runLengthContractionExperiment(selectedVelocity) : null)
  const buttonStyle = (disabled: boolean) => ({
    marginRight: '0.5rem',
    padding: '0.5rem 1rem',
    fontSize: '0.875rem',
    opacity: disabled ? 0.6 : 1,
  })

  const r = part1Result
  // The two possible lengths in the introduction's table, and the round trip each gives at Part 1's speed.
  const exampleLong = { length: REST_LENGTH, trip: roundTripForLength(REST_LENGTH, PART1_VELOCITY) }
  const INVENTED_TICK = 2 // an invented tick, only for the worked example of the trial lengths
  const inventedLength = lengthForTick(INVENTED_TICK, PART1_VELOCITY)
  const inventedTrip = roundTripForLength(inventedLength, PART1_VELOCITY)
  const exampleShort = { length: EXAMPLE_SHORT_LENGTH, trip: roundTripForLength(EXAMPLE_SHORT_LENGTH, PART1_VELOCITY) }

  return (
    <div style={{ padding: '2rem', maxWidth: '900px', margin: '0 auto' }}>
      <h2>Experiment 6 — Does Motion Change Length?</h2>

      <div className="exp-card" style={{ marginTop: '2rem', padding: '1.5rem' }}>
        <div style={{ marginBottom: '2rem', fontSize: '0.875rem', color: 'var(--text-muted)' }}>
          <p style={paragraph}>
            <strong>The question.</strong> Does a moving thing change length? We will look at one thing, a clock made of light, and
            ask: <strong>as seen from the lab, how long is it when it is moving along its own length, compared with when it stands
            still?</strong>
          </p>
          <p style={paragraph}>
            <strong>A daily-life picture.</strong> Imagine measuring the length of a car speeding past you, versus measuring the same car
            parked in your driveway. In everyday life we assume you would get the same number either way: length feels like a fixed
            property of the car, nothing that depends on whether it is moving. This experiment checks whether that everyday assumption
            survives once &ldquo;speeding past&rdquo; means a meaningful fraction of the speed of light.
          </p>
          <p style={paragraph}>
            <strong>Step 1: our ruler, a light clock.</strong> We need something with a length that we can follow. Our object is a{' '}
            <strong>light clock</strong>: two mirrors, one behind the other in a line, like the two ends of a train carriage, with a
            pulse of light bouncing between them. <strong>The length of the clock is the distance from the back mirror to the front
            mirror.</strong> That is the number this whole page is about. One trip of the pulse from the back mirror to the front mirror
            and back is one <strong>tick</strong>. We will use ticks later, only as a tool.
          </p>
          <p style={paragraph}>
            <strong>Step 2: the length of the clock standing still.</strong> Light travels about 300,000 km in one second. The distance
            light travels in one second has a name: a <strong>light-second</strong>. We make the clock{' '}
            <strong>half a light-second long</strong>, about {(REST_LENGTH * 300000).toLocaleString('en-US')} km. So light needs half a
            second to go from one mirror to the other, and one second for a whole tick. Real light clocks are much smaller: with the
            mirrors only 15 cm apart, a clock would tick about a billion times a second. We use a giant clock so that the numbers are
            easy to read. <strong>This standing-still length, {REST_LENGTH.toFixed(3)} light-seconds, is the length we compare the
            moving clock with.</strong>
          </p>
          <p style={{ marginTop: 0, marginBottom: '0.25rem' }}>
            <strong>Step 3: how the travel of light measures a length.</strong> Why do we watch a pulse of light to learn the length of
            a clock? Because <strong>if you know how fast something travels and how long it takes, you know how far it went.</strong>{' '}
            Distance = speed &times; time. Here are three everyday cases.
          </p>
          <ul style={{ marginTop: 0, marginBottom: '0.75rem', paddingLeft: '1.25rem' }}>
            <li>
              <strong>An echo.</strong> You shout towards a cliff and hear the echo 2 seconds later. Sound travels about 340 metres every
              second, and the sound went there and back, so it travelled 2 &times; 340 = 680 metres in all. The cliff is half of that,{' '}
              <strong>340 metres</strong> away. You measured a distance with a stopwatch.
            </li>
            <li>
              <strong>A walk.</strong> &ldquo;The shop is ten minutes from here&rdquo; is a length told in time, because we know how fast
              we walk.
            </li>
            <li>
              <strong>A corridor.</strong> You walk along a corridor at a steady 1 metre every second, and it takes you 12 seconds to get
              from one end to the other. The corridor is 1 &times; 12 = <strong>12 metres</strong> long. This is the closest picture to
              our clock: the time to cross, at a known steady speed, gives the length between the two ends. (We chose a steady speed
              because light&rsquo;s speed in the lab is steady.)
            </li>
          </ul>
          <p style={paragraph}>
            Light can do the same job, and it is a very good tape measure, because <strong>in the lab it always travels at the same
            speed, c, in both directions</strong> (the rule you met in &ldquo;Why can&rsquo;t light go faster?&rdquo;). So the time light
            takes to cross the clock tells us how long the clock is. Our clock stands still and the pulse takes{' '}
            <strong>{(REST_LENGTH / 1).toFixed(1)} second</strong> to go from the back mirror to the front mirror. Light goes 1
            light-second every second, so it went 1 &times; {REST_LENGTH.toFixed(1)} = <strong>{REST_LENGTH.toFixed(1)}{' '}
            light-seconds</strong>. That is why we call the clock half a light-second long.{' '}
            <strong>A light-second is simply a length measured by light&rsquo;s travel.</strong>
          </p>
          <p style={paragraph}>
            <strong>Now the moving clock.</strong> We use the same idea: <strong>we time the pulse, and the time tells us the
            length.</strong> There is one extra thing to allow for. The mirrors are moving while the pulse is in flight (Step 4 explains
            this). That makes the trip to the front mirror and the trip back take different times, but the idea does not change.
          </p>
          <p style={paragraph}>
            <strong>The key point:</strong> at a given speed, <strong>every possible length of the clock gives its own round-trip
            time, and no other length gives that same time.</strong> So if we measure the round-trip time, we can work out the length,
            just as you can read a distance off a stopwatch in the echo example.
          </p>
          <p style={{ marginTop: 0, marginBottom: '0.25rem' }}>
            <strong>An example.</strong> Take a clock moving at {PART1_VELOCITY}c (half the speed of light). Here are two lengths it
            could have, and the round trip of the pulse that each would give. &ldquo;Forward&rdquo; is the trip from the back mirror
            to the front mirror. &ldquo;Back&rdquo; is the trip returning to the back mirror.
          </p>
          <ul style={{ marginTop: 0, marginBottom: '0.75rem', paddingLeft: '1.25rem' }}>
            {[exampleLong, exampleShort].map((example) => (
              <li key={example.length}>
                If the clock is <strong>{example.length.toFixed(3)} light-second</strong> long: forward{' '}
                {example.trip.forwardLegDuration.toFixed(2)} s + back {example.trip.returnLegDuration.toFixed(2)} s ={' '}
                <strong>{example.trip.tickDuration.toFixed(2)} s</strong> for the whole round trip.
              </li>
            ))}
          </ul>
          <p style={paragraph}>
            <strong>Why is &ldquo;forward&rdquo; longer than the half second it would take if the clock stood still?</strong> Because
            the pulse is chasing the front mirror, and that mirror is running away. Take the {exampleLong.length.toFixed(3)} light-second clock
            at {PART1_VELOCITY}c. The pulse travels at c, the mirror moves away at {PART1_VELOCITY}c, so the pulse gains on it at only
            c &minus; {PART1_VELOCITY}c = {(1 - PART1_VELOCITY).toFixed(1)}c. The gap is {exampleLong.length.toFixed(3)} light-second, so the
            forward trip takes {exampleLong.length.toFixed(3)} &divide; {(1 - PART1_VELOCITY).toFixed(1)} ={' '}
            {exampleLong.trip.forwardLegDuration.toFixed(2)} s. On the way back, the back mirror comes towards the pulse, so the gap
            closes faster and that trip is shorter. Step 4 explains this fully.
          </p>
          <p style={paragraph}>
            <strong>What to notice:</strong> the two lengths give two different round-trip times. So a measured round-trip time points
            to one length only, and that is how we will find the length of the moving clock.
          </p>
          <p style={paragraph}>
            <strong>Step 4: what moves, and why length matters for the pulse.</strong> Now imagine the same clock moving along its own
            length, front mirror first. Both mirrors move together at the same speed, so the length of the clock does not change while it
            moves. Neither mirror gains on the other.
          </p>
          <p style={paragraph}>
            The important point is that <strong>the pulse is not carried along by the clock</strong>. Once it leaves the back mirror,
            nothing pushes it forward with the clock. In the lab it keeps travelling at the speed of light, <strong>c</strong>, and the
            clock&rsquo;s motion adds nothing to that speed. The mirrors move, but the pulse&rsquo;s speed stays c. So the distance that
            matters is the one <strong>between the pulse and the mirror it is heading for</strong>, and that distance changes.
          </p>
          <ul style={{ marginTop: 0, marginBottom: '0.75rem', paddingLeft: '1.25rem' }}>
            <li>
              <strong>Forward trip (back mirror to front mirror).</strong> The front mirror keeps moving away from the pulse while the
              pulse is in flight. So the pulse has to cover the gap <em>plus</em> the extra distance the front mirror moves during the
              trip. The gap between the pulse and the front mirror closes slowly, at only c minus the clock&rsquo;s speed. It is like
              chasing a bus that has just pulled away from the stop.
            </li>
            <li>
              <strong>Return trip (front mirror to back mirror).</strong> The back mirror moves <em>toward</em> the pulse, so they meet
              sooner. The gap closes quickly, at c plus the clock&rsquo;s speed. It is like walking toward a friend who is also walking
              toward you.
            </li>
          </ul>
          <p style={paragraph}>
            <strong>An everyday picture.</strong> Someone on a moving walkway lets go of a ball, and it rolls along the floor at a fixed
            speed. The two ends of the walkway stay the same distance apart. But the ball is not attached to the walkway, so the far end
            moves away as the ball rolls, and the ball takes longer to reach it.
          </p>
          <p style={paragraph}>
            Notice what this means: <strong>the longer the clock, the longer each trip of the pulse, so the longer the tick.</strong> The
            length of the clock and the time of one tick are tied together. That tie is our tool.
          </p>
          <p style={{ marginTop: 0, marginBottom: '0.25rem' }}>
            <strong>A worked example.</strong> Let us try <strong>one possible length</strong> for the moving clock at half the speed of
            light ({PART1_VELOCITY}c): the same length as when it stands still, half a light-second.
          </p>
          <ul style={{ marginTop: 0, marginBottom: '0.75rem', paddingLeft: '1.25rem' }}>
            <li>
              Going forward, the pulse closes the gap at c &minus; {PART1_VELOCITY}c = {(1 - PART1_VELOCITY).toFixed(1)}c, so it takes{' '}
              {REST_LENGTH.toFixed(1)} &divide; {(1 - PART1_VELOCITY).toFixed(1)} ={' '}
              <strong>{exampleLong.trip.forwardLegDuration.toFixed(0)} second</strong>. In that time it travels{' '}
              {exampleLong.trip.forwardLegDuration.toFixed(0)} light-second: the {REST_LENGTH.toFixed(1)} light-second length plus{' '}
              {(exampleLong.trip.forwardLegDuration - REST_LENGTH).toFixed(1)} light-second more, because the front mirror moved that far.
            </li>
            <li>
              Coming back, it closes the gap at c + {PART1_VELOCITY}c = {(1 + PART1_VELOCITY).toFixed(1)}c, so it takes{' '}
              {REST_LENGTH.toFixed(1)} &divide; {(1 + PART1_VELOCITY).toFixed(1)} = about{' '}
              <strong>{exampleLong.trip.returnLegDuration.toFixed(2)} second</strong>.
            </li>
            <li>
              One tick would take about {exampleLong.trip.tickDuration.toFixed(2)} seconds. <strong>This is only what that one possible
              length gives.</strong> We do not yet know whether it is the real length. Finding the real one is the job of this page.
            </li>
          </ul>
          <p style={paragraph}>
            <strong>Step 5: the rule we keep.</strong> In &ldquo;A moving clock&rdquo; and &ldquo;Why time dilation happens&rdquo; you saw
            that a moving clock ticks more slowly, as measured by the lab&rsquo;s clocks. That effect is called{' '}
            <strong>time dilation</strong>. We assume that it works for every moving clock, however it is turned. So one tick of the
            moving clock must take the time that time dilation gives. We also keep the rule from &ldquo;Why time dilation happens&rdquo;
            and &ldquo;Why can&rsquo;t light go faster?&rdquo;: in the lab, light always goes at the same speed, <strong>c</strong>, in
            both directions.
          </p>
          <p style={paragraph}>
            <strong>Step 6: how we find the length.</strong> We cannot lay a ruler along a clock that is speeding past, and measuring a
            moving length directly needs an idea from a later chapter. So here we find the length with light, as in Step 3. We know how
            long one tick of the moving clock must take (Step 5), and we know that each length of the clock gives its own tick (Steps 3
            and 4). So <strong>we ask: what length must the moving clock have, as seen from the lab, for its tick to take exactly that
            long?</strong> That length is the answer to the question of this page. We will compare it with the standing-still length,
            half a light-second.
          </p>
          <p style={paragraph}>
            <strong>A trap to avoid: the clocks are not built shorter.</strong> You may think, &ldquo;a clock with its mirrors closer
            together will of course tick faster, so a shorter clock proves nothing.&rdquo; That is true, and it is exactly the tie from
            Steps 3 and 4: <strong>shorter clock, shorter tick; longer clock, longer tick</strong>. But on this page nobody moves the
            mirrors closer together to make a clock tick faster. The mirrors stay as they are, and <strong>the tick is the thing we
            already know</strong>: Step 5 fixes it. What we do not know is the length of the moving clock. So we use the tie
            backwards, like the echo in Step 3: you know how long the echo took, so you work out how far the cliff is. Nobody chose the
            cliff&rsquo;s distance to fit the echo. In the same way we try different lengths and ask which one gives the tick that
            Step 5 demands. A length that gives a different tick is not the length of the moving clock. The clocks you will see are
            therefore <strong>trial lengths</strong>, drawn side by side so that you can compare them. Which trial matches the known
            tick is what you are asked to guess.
          </p>
          <p style={{ marginTop: 0, marginBottom: '0.25rem' }}>
            <strong>A small worked example with invented numbers.</strong> Suppose, only for this example, that the tick of a clock
            moving at {PART1_VELOCITY}c had to be exactly <strong>{INVENTED_TICK.toFixed(1)} seconds</strong>. (This is not the real
            tick of this page. It is made up to show the method.) Which length gives it? Try two lengths and see.
          </p>
          <ul style={{ marginTop: 0, marginBottom: '0.75rem', paddingLeft: '1.25rem' }}>
            <li>
              <strong>Try {REST_LENGTH.toFixed(3)} light-second.</strong> Forward {REST_LENGTH.toFixed(1)} &divide;{' '}
              {(1 - PART1_VELOCITY).toFixed(1)} = {exampleLong.trip.forwardLegDuration.toFixed(2)} s, back {REST_LENGTH.toFixed(1)} &divide;{' '}
              {(1 + PART1_VELOCITY).toFixed(1)} = {exampleLong.trip.returnLegDuration.toFixed(2)} s, so one tick is{' '}
              {exampleLong.trip.tickDuration.toFixed(2)} s. That is not {INVENTED_TICK.toFixed(1)} s, so this is not the length.
            </li>
            <li>
              <strong>Try {inventedLength.toFixed(3)} light-second.</strong> Forward {inventedLength.toFixed(2)} &divide;{' '}
              {(1 - PART1_VELOCITY).toFixed(1)} = {inventedTrip.forwardLegDuration.toFixed(2)} s, back {inventedLength.toFixed(2)} &divide;{' '}
              {(1 + PART1_VELOCITY).toFixed(1)} = {inventedTrip.returnLegDuration.toFixed(2)} s, so one tick is{' '}
              <strong>{inventedTrip.tickDuration.toFixed(2)} s</strong>. That is the tick we needed, so in this made-up example the
              clock&rsquo;s length would be {inventedLength.toFixed(2)} light-second, and no other length would do.
            </li>
          </ul>
          <p style={paragraph}>
            On the real page the same method is used, but the tick we need is not made up: it is the one Step 5 gives. The clocks
            and the bars show the trial lengths against it.
          </p>
          <p style={{ marginTop: 0, marginBottom: '0.25rem' }}>
            <strong>What you will see.</strong> Three clocks start at the same moment:
          </p>
          <ul style={{ marginTop: 0, marginBottom: '0.75rem', paddingLeft: '1.25rem' }}>
            <li>one clock standing still in the lab (the place where the experiment is set up);</li>
            <li>one moving clock with the same length as at rest (violet, imagined);</li>
            <li>one moving clock with a different trial length (amber).</li>
          </ul>
          <p style={paragraph}>
            The two moving clocks are the same clock, drawn twice. The only difference is its length, as the lab observers measure it.
            Because the mirrors move together, that length does not change during a run. We watch one tick of each moving clock. In
            Part 1 the moving clock goes at {PART1_VELOCITY}c, which is half the speed of light. When the run ends, a strip of three bars
            appears that shows the length of each clock. In Part 2 you choose any speed and run that.
          </p>
          <p style={paragraph}>
            <strong>Your job.</strong> Before you press START, make two guesses about the <strong>length</strong> of the moving clock.
            First, for its tick to take the time that time dilation gives, must its length, as seen from the lab, be the same as at
            rest, shorter, or longer? Second, how long must it be, in light-seconds? A wrong guess is fine, and guesses are not scored.
            Then watch the clocks, try other speeds in Part 2, and talk it over with the tutor.
          </p>
          <p style={paragraph}>
            <strong>Your guesses and the real pictures.</strong> Your guesses never change the real pictures, the clocks or the numbers:
            they come from a calculation that knows nothing about what you guessed. Your number is drawn on the strip of bars in white,
            in a box labelled YOUR GUESS, and your choice is drawn as a white marker (a marker only: it has no size, it just points at
            the choice you made). Both guesses are shown again beside the results. In Part 2 the speed you choose does change the clocks
            and the drawings, and the marks it moves are pink.
          </p>
          <p style={paragraph}>
            <strong>Some new words.</strong> The &ldquo;Words and formulas&rdquo; box below has each one, with a short plain meaning:
            light clock, tick, mirror, light pulse, light-second, length (of the clock), length measured by light, rest length, as seen
            from the lab, lab, lab seconds, lab time, reference frame, at rest, moving, along its own length, c, time dilation, time
            dilation factor, clock&rsquo;s own reading, &ldquo;what if&rdquo; (imagined), and the one formula used here, distance =
            speed &times; time.
          </p>
          <p style={{ marginTop: 0, marginBottom: '0.25rem' }}>
            <strong>What we assume.</strong>
          </p>
          <ul style={{ marginTop: 0, marginBottom: 0, paddingLeft: '1.25rem' }}>
            <li>There is no gravity, and the moving clock keeps a steady speed. It never speeds up or slows down.</li>
            <li>All the clocks start together: their pulses of light leave the back mirror at the same moment.</li>
            <li>
              We watch everything from the lab. The lab is a <strong>reference frame</strong>, as in &ldquo;Two clocks at rest&rdquo;: a
              group of people and clocks that are all standing still relative to one another, with their clocks set to agree.{' '}
              <strong>Lab time</strong> is the time shown on those clocks, and the tick is measured in <strong>lab seconds</strong>.
            </li>
            <li>
              The moving clock is not standing still relative to the lab, so it is not part of the lab&rsquo;s reference frame. It has
              its own reference frame: the point of view of someone riding along with it. So two reference frames are involved: the
              lab&rsquo;s and the moving clock&rsquo;s.
            </li>
            <li>
              Someone riding along with the moving clock sees the pulse leave at speed c, travel to the front mirror and back, and one
              tick takes {REST_TICK_DURATION} second on the clock&rsquo;s own display.
            </li>
            <li>
              <strong>c</strong> is the speed of light, about 300,000 km every second. A speed written as 0.5c is half of that. A light
              speed of 1.000c means exactly the speed of light.
            </li>
          </ul>
        </div>

        <ReferencePanel entries={REFERENCE_ENTRIES} />

        <div style={{ marginBottom: '2rem', fontSize: '0.875rem', color: 'var(--text-muted)' }}>
          <p style={{ marginTop: 0, marginBottom: '0.25rem' }}>
            <strong>Want to know more?</strong> Plainer-language pages are listed here. Checked on 9 November 2026. The links open in a
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
            The clock standing still is <strong>{REST_LENGTH} light-seconds long</strong>, and one tick takes {REST_TICK_DURATION} second.
            Another identical clock moves along its own length at {PART1_VELOCITY}c. Time dilation says that one tick of the moving clock
            takes <strong>{r.timeDilationTick.toFixed(3)} seconds</strong> on the lab&rsquo;s clocks. Light always goes at c in the lab.{' '}
            <strong>Guess 1:</strong> for its tick to take that long, the <strong>length of the moving clock</strong>, as seen from the lab, must be:
          </p>
          <div style={{ marginBottom: '1rem' }}>
            {CHOICES.map((option) => (
              <button
                key={option.value}
                type="button"
                onClick={() => setChoice(option.value)}
                disabled={locked}
                className={`toggle-button${choice === option.value ? ' is-selected' : ''}`}
                style={buttonStyle(locked)}
              >
                {option.label}
              </button>
            ))}
          </div>
          <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)', marginBottom: '0.75rem' }}>
            <strong>Guess 2:</strong> how long must it be, in light-seconds? Type a number.
          </p>
          <input
            type="number"
            step="any"
            value={gapInput}
            onChange={(e) => setGapInput(e.target.value)}
            disabled={locked}
            placeholder="Enter a length in light-seconds"
            className="field-input"
            style={inputStyle(locked)}
          />
          <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.5rem' }}>
            {locked && submitted
              ? `${describePrediction(submitted)} Your prediction is locked while you try other speeds. To change it, press Start over.`
              : prediction
                ? describePrediction(prediction)
                : 'Choose an option and enter a number to continue'}
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
        {prediction === null && !locked && <p style={smallNote}>Choose an option and enter a number above to press START.</p>}

        {/* Placed directly under START so the run is on screen the moment it begins. */}
        <div ref={part1Ref} style={{ marginTop: '2rem' }}>
          <ThreeClockPanels geometry={r} labTime={part1.time} running={part1Running} />
          <WhereFrom>
            <strong>Measured:</strong> nothing on this page. <strong>Calculated here from the speed:</strong> the three clocks come
            from the light-clock geometry, with the pulse chasing the moving front mirror and meeting the moving back mirror, and from
            the rule that the tick must match time dilation. <strong>Imagined for the question:</strong> the violet clock shows what
            would happen if the length stayed the same as at rest. The light clock itself is imagined, a giant clock half a
            light-second (150,000 km) long, so that the numbers are easy to read. Real light clocks are much smaller. No instrument
            measured these ticks.
          </WhereFrom>
          <PanelsCaption />
        </div>

        {part1Done && submitted !== null ? (
          <Block>
            <GapBars
              experiment={r}
              pinkSpeed={null}
              guesses={{ choice: submitted.choice, gap: submitted.gap }}
              label={`The three mirror-gap bars for the run at ${PART1_VELOCITY}c: the rest clock ${r.restLength.toFixed(3)} light-seconds long, the imagined clock with the same length as at rest ${r.sameLength.lengthInLab.toFixed(3)}, and the shorter clock ${r.shorterLength.lengthInLab.toFixed(3)}. Your guess of ${submitted.gap} light-seconds is a white mark in a box marked YOUR GUESS, and your choice, ${CHOICE_PHRASE[submitted.choice]}, is a white marker.`}
            />
            <WhereFrom>
              <strong>Measured:</strong> nothing. <strong>Calculated here:</strong> every length and every trip time, from the speed you
              ran. <strong>Imagined for the question:</strong> the violet bar. The white mark and the marker are only your guesses,
              placed on the same scale.
            </WhereFrom>
            <BarsCaption name="the length bars" experiment={r} guesses pink={false} />
          </Block>
        ) : (
          <p style={smallNote}>
            {part1Running
              ? 'The bars will appear when the run ends.'
              : 'After you press START, three bars showing the distance between the mirrors in each clock will appear here when the run ends.'}
          </p>
        )}

        {/* ===== Part 2 ===== */}
        {part1Done && (
          <>
            <PartHeader color="#be185d" title="Part 2: Now try it yourself">
              {PART_LEADS.part2}
            </PartHeader>

            <div style={{ marginBottom: '1rem' }}>
              <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold' }}>Moving clock speed</label>
              <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)', marginBottom: '0.75rem' }}>
                Speeds are given as a fraction of <strong>c</strong>, the speed of light (about 300,000 km/s). For example, 0.5c means
                half the speed of light. On this page you can choose speeds up to {MAX_SPEED}c.
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
                Your guesses do not change these drawings, but the speed you choose does. The speed stops at {MAX_SPEED}c on this page
                because the tick of the violet clock grows very quickly with speed (about 50 seconds at 0.99c), which would make the run
                too long to watch.
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
                  <ThreeClockPanels geometry={part2Geometry} labTime={part2Experiment ? part2.time : 0} running={part2Running} />
                </Block>
              ) : (
                <p style={smallNote}>
                  Choose a speed between {MIN_SPEED}c and {MAX_SPEED}c to see the clocks.
                </p>
              )}
            </div>

            {lastPart2 && !part2Running ? (
              <Block>
                <GapBars
                  experiment={lastPart2.result}
                  pinkSpeed={lastPart2.result.velocity}
                  guesses={null}
                  label={`Drawing A: the three mirror-gap bars for your run at ${lastPart2.result.velocity}c, with your speed written in pink.`}
                />
                <WhereFrom>
                  Calculated here, not measured, except the violet bar, which is imagined for the question. Each length and trip time comes
                  from the speed you chose. The light clock is imagined, as in Part 1. No instrument measured these ticks.
                </WhereFrom>
                <BarsCaption name="Drawing A" experiment={lastPart2.result} guesses={false} pink />
                <p style={{ fontSize: '0.875rem', marginBottom: 0, marginTop: '0.75rem' }}>
                  <strong>Runs so far</strong>
                </p>
                <ul style={{ fontSize: '0.875rem', marginTop: '0.25rem', paddingLeft: '1.25rem' }}>
                  {part2Runs.map((run, i) => (
                    <li key={i}>
                      {run.result.velocity}c: mirrors as far apart as at rest (imagined) {run.result.sameLength.lengthInLab.toFixed(3)},
                      one tick {run.result.sameLength.tickDuration.toFixed(3)} s; mirrors closer together{' '}
                      {run.result.shorterLength.lengthInLab.toFixed(3)}, one tick {run.result.shorterLength.tickDuration.toFixed(3)} s,
                      which is {run.result.timeDilationTick.toFixed(3)} s, the tick time dilation gives
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
            <Experiment6Tutor
              onExplained={() => {
                setExplained(true)
                onTutorComplete?.()
              }}
              key={`${PART1_VELOCITY}-${submitted.choice}-${submitted.gap}`}
              run={r}
              predictionChoice={submitted.choice}
              prediction={submitted.gap}
            />
            {explained && (
              <div style={{ marginTop: '1.5rem', fontSize: '0.875rem', color: 'var(--text-muted)' }}>
                <p style={{ marginTop: 0, marginBottom: '0.25rem' }}>
                  <strong>More to read, now that you have the explanation.</strong> This page says that moving things are measured
                  shorter, which is the answer to your first guess, so it was held back until now. Checked on 9 November 2026. The link
                  opens in a new tab.
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
