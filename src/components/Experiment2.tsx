import { useCallback, useEffect, useRef, useState, type ReactNode } from 'react'
import { clockReadingsAt, guessPositionsOnStrip, runTwoClockExperiment } from '../physics/twoClockExperiment'
import type { TwoClockExperimentResult } from '../physics/twoClockExperiment'
import { Experiment2Tutor } from './Experiment2Tutor'
import { ReferencePanel } from './EnergyMomentumExperiment'
import { MUTED_COLOR, PartHeader, TEXT_COLOR, YOURS_COLOR, svgStyle } from './GravitationalWaveExperiment'
import { LookForList } from './WideBinariesExperiment'
import { formatClockReading } from './clockFormat'

// Relativity of Time and Motion, Experiment 2, audited to the newer rules (docs/audit/relativity-of-time-and-motion/
// 02-draft-wording.md, approved by the owner on 2026-11-08 "with defaults"): the page in four Parts, a two-row Event Interval
// strip with a scale and a white YOUR GUESS mark for each clock, a caption for each picture, a words box, a link, Start over
// and a tutor that points to the marks. Every number drawn comes from the physics module (src/physics/twoClockExperiment.ts;
// CLAUDE.md §9). The wording is the owner's to approve line by line (CLAUDE.md §28.1).

// Part 1 uses the specification's default length; Part 2 lets the learner choose another.
export const PART1_DURATION = 10
const PRESETS = [5, 10, 20, 30] as const
const ANIMATION_MS = 2000
const GUESS_COLOR = '#ffffff' // white: the learner's guess, and nothing else (CLAUDE.md §14)
const EVENT_COLOR = '#f59e0b' // amber: the real events

type DurationOption = 5 | 10 | 20 | 30 | 'other'
type RunStatus = 'idle' | 'running' | 'complete'

// The clocks' playback: only presentation. The result comes from the physics module and never depends on this.
function useClockRunner(onFinish?: () => void) {
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
      const progress = Math.min((now - startTime) / ANIMATION_MS, 1)
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

// Page fetched and read on 8 November 2026 (see the audit's draft wording, section 2). No plain official page was found for
// "reference frame" (CLAUDE.md §29 rule 3(c)); the introduction defines it in its own words.
const PLAIN_LINKS = [
  { href: 'https://www.nist.gov/atomic-clocks/how-do-we-know-what-time-it', label: 'NIST: "How Do We Know What Time It Is?"', what: 'how a worldwide network of atomic clocks is compared, and each laboratory\'s clocks corrected, to make one shared time. (National Institute of Standards and Technology; page updated May 2025.)' },
]

// The "Words and formulas" box. The formula entry shows the answer to the predictions, so it appears only after the Part 1 run
// has finished (CLAUDE.md §12). Its numbers come from the physics module (CLAUDE.md §9).
function referenceEntries(done: boolean): { term: string; meaning: string }[] {
  const entries = [
    { term: 'Clock', meaning: 'anything that repeats in a very regular way and keeps count of the repeats.' },
    { term: 'Event', meaning: 'one moment at which something happens: here, the start of the experiment and its end.' },
    { term: 'Clock reading', meaning: 'the numbers a clock shows at an event, written hours:minutes:seconds. 00:00:10 means 0 hours, 0 minutes, 10 seconds.' },
    { term: 'Elapsed time', meaning: 'how much time passed between two events, according to a clock.' },
    { term: 'Duration', meaning: 'how long the experiment is set to last, in seconds.' },
    { term: 'At rest', meaning: 'not moving compared with the other things in the picture.' },
    { term: 'Synchronized', meaning: 'set to show the same reading at the same moment. Both clocks here start synchronized, at 00:00:00.' },
    { term: 'Reference frame', meaning: 'a group of people and clocks that are all standing still relative to one another, so that none moves compared with the others.' },
  ]
  if (done) {
    const run = runTwoClockExperiment(PART1_DURATION)
    entries.push({
      term: 'Formulas',
      meaning: `elapsed time = clock reading at the end − clock reading at the start; difference = the larger elapsed time − the smaller. Worked example from this page: Clock A: ${formatClockReading(run.endEvent.clockReadingA)} − ${formatClockReading(run.startEvent.clockReadingA)} = ${run.elapsedTimeA} seconds; Clock B: ${formatClockReading(run.endEvent.clockReadingB)} − ${formatClockReading(run.startEvent.clockReadingB)} = ${run.elapsedTimeB} seconds; difference = ${run.elapsedTimeA} − ${run.elapsedTimeB} = ${run.difference} seconds.`,
    })
  }
  return entries
}

const paragraph = { marginTop: 0, marginBottom: '0.75rem' } as const
const smallNote = { fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.25rem' } as const

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

// Each clock's readout is read separately from the physics module (clockReadingsAt), not from one shared value.
export function ClockReadouts({ duration, time, running, label }: { duration: number; time: number; running: boolean; label: string }) {
  const readings = clockReadingsAt(duration, time)
  const box = (name: string, reading: number) => (
    <div style={{ textAlign: 'center' }}>
      <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)', marginBottom: '0.5rem' }}>{name}</p>
      <div
        className="clock-readout"
        style={{ fontSize: '2.5rem', fontFamily: 'monospace', fontWeight: 'bold', padding: '1rem', minWidth: '150px', textAlign: 'center' }}
      >
        {formatClockReading(Math.floor(reading + 1e-9))}
      </div>
    </div>
  )
  return (
    <div style={{ marginBottom: '1rem' }}>
      <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)' }}>{label}: {running ? 'running...' : 'at rest'}</p>
      <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'space-around', gap: '2rem', marginBottom: '0.5rem' }}>
        {box('Clock A', readings.clockReadingA)}
        {box('Clock B', readings.clockReadingB)}
      </div>
    </div>
  )
}

// ---- The two-row Event Interval strip (Part 1's picture, and Drawing A in Part 2 with a pink Event B) ----
const S = { width: 580, left: 72, right: 540 }
const ROW_A = 66
const ROW_B = 156

export function TwoClockStrip({
  duration,
  pink,
  guesses,
  label,
}: {
  duration: number
  pink: boolean
  guesses: { a: number; b: number } | null
  label: string
}) {
  const result = runTwoClockExperiment(duration)
  const marks = guesses ? guessPositionsOnStrip(duration, guesses.a, guesses.b) : null
  const scaleEnd = 2 * duration
  const px = (seconds: number) => S.left + (seconds / scaleEnd) * (S.right - S.left)
  const bColor = pink ? YOURS_COLOR : EVENT_COLOR
  const xA = px(result.startEvent.simulationTime)
  const xB = px(result.endEvent.simulationTime)
  const height = 244

  const row = (y: number, name: string, startReading: number, endReading: number, elapsed: number) => (
    <g>
      <text x={4} y={y + 4} fill={TEXT_COLOR} fontSize="12" fontWeight="bold">
        {name}
      </text>
      <line x1={S.left} y1={y} x2={S.right} y2={y} stroke={MUTED_COLOR} strokeWidth={3} />
      {[0, duration, scaleEnd].map((t, i) => (
        <line key={i} x1={px(t)} y1={y - 5} x2={px(t)} y2={y + 5} stroke={MUTED_COLOR} />
      ))}
      <circle cx={xA} cy={y} r={7} fill={EVENT_COLOR} />
      <circle cx={xB} cy={y} r={7} fill={bColor} />
      <text x={xA} y={y + 22} fill={TEXT_COLOR} fontSize="12" fontFamily="monospace" textAnchor="start" stroke="#0b1020" strokeWidth={4} paintOrder="stroke">
        {formatClockReading(startReading)}
      </text>
      <text x={xB} y={y + 22} fill={TEXT_COLOR} fontSize="12" fontFamily="monospace" textAnchor="middle" stroke="#0b1020" strokeWidth={4} paintOrder="stroke">
        {formatClockReading(endReading)}
      </text>
      <text x={(xA + xB) / 2 + 6} y={y + 22} fill={bColor} fontSize="11" fontWeight="bold" textAnchor="middle" stroke="#0b1020" strokeWidth={4} paintOrder="stroke">
        elapsed: {elapsed} seconds
      </text>
    </g>
  )

  const guessMark = (key: 'clockA' | 'clockB', name: string, value: number, rowY: number, boxY: number) => {
    if (!marks) return null
    const m = marks[key]
    const markX = S.left + m.fraction * (S.right - S.left)
    const boxWidth = 344
    const boxX = Math.min(Math.max(markX - boxWidth / 2, 4), S.width - boxWidth - 4)
    const text = `YOUR GUESS for ${name}: ${value} seconds${m.offEdge ? ' (off the scale)' : ''}`
    return (
      <g>
        <line x1={markX} y1={boxY + 22} x2={markX} y2={rowY} stroke={GUESS_COLOR} strokeWidth={1.5} />
        {m.offEdge === null ? (
          <circle cx={markX} cy={rowY} r={6} fill={GUESS_COLOR} stroke="#0b1020" strokeWidth={1.5} />
        ) : (
          <polygon
            points={
              m.offEdge === 'right'
                ? `${markX + 12},${rowY} ${markX},${rowY - 9} ${markX},${rowY + 9}`
                : `${markX - 12},${rowY} ${markX},${rowY - 9} ${markX},${rowY + 9}`
            }
            fill={GUESS_COLOR}
          />
        )}
        <rect x={boxX} y={boxY} width={boxWidth} height={22} fill="#0b1020" stroke={GUESS_COLOR} strokeWidth={2} rx={3} />
        <text x={boxX + 8} y={boxY + 15} fill={GUESS_COLOR} fontSize="12" fontWeight="bold">
          {text}
        </text>
      </g>
    )
  }

  return (
    <svg width={S.width} height={height} viewBox={`0 0 ${S.width} ${height}`} style={svgStyle} role="img" aria-label={label}>
      {/* dashed lines join the two rows at each event: the same two moments for both clocks */}
      <line x1={xA} y1={ROW_A} x2={xA} y2={ROW_B} stroke={EVENT_COLOR} strokeWidth={1.5} strokeDasharray="4 4" />
      <line x1={xB} y1={ROW_A} x2={xB} y2={ROW_B} stroke={bColor} strokeWidth={1.5} strokeDasharray="4 4" />
      {row(ROW_A, 'Clock A', result.startEvent.clockReadingA, result.endEvent.clockReadingA, result.elapsedTimeA)}
      {row(ROW_B, 'Clock B', result.startEvent.clockReadingB, result.endEvent.clockReadingB, result.elapsedTimeB)}
      {/* the shared scale and the event labels */}
      {[0, duration, scaleEnd].map((t, i) => (
        <text key={i} x={px(t)} y={ROW_B + 40} fill={MUTED_COLOR} fontSize="10" textAnchor={i === 0 ? 'start' : i === 2 ? 'end' : 'middle'}>
          {t} s
        </text>
      ))}
      <text x={xA} y={ROW_B + 56} fill={EVENT_COLOR} fontSize="12" fontWeight="bold" textAnchor="start">
        Event A, START
      </text>
      <text x={xB} y={ROW_B + 56} fill={bColor} fontSize="12" fontWeight="bold" textAnchor="middle">
        {pink ? 'Event B, END (your length)' : 'Event B, END'}
      </text>
      <text x={14} y={height - 6} fill={MUTED_COLOR} fontSize="10">
        time scale in seconds, the same for both clocks (0 s is the start of the experiment)
      </text>
      {/* white: the learner's guesses, one per clock, placed on the same scale; a number has a position, so each mark follows it */}
      {guesses && guessMark('clockA', 'Clock A', guesses.a, ROW_A, 10)}
      {guesses && guessMark('clockB', 'Clock B', guesses.b, ROW_B, 104)}
    </svg>
  )
}

function LookFor({ items }: { items: Array<{ look: string; means: string; matters: string }> }) {
  return (
    <>
      <p style={{ marginTop: 0, marginBottom: '0.5rem' }}>
        <strong>What to look for.</strong>
      </p>
      <LookForList items={items} />
    </>
  )
}

function CaptionBox({ children }: { children: ReactNode }) {
  return (
    <div
      style={{
        marginTop: '0.75rem',
        padding: '0.75rem 1rem',
        fontSize: '0.8125rem',
        border: '1px solid var(--border)',
        borderRadius: '6px',
        color: 'var(--text-muted)',
      }}
    >
      {children}
    </div>
  )
}

export function ClocksCaption() {
  return (
    <p style={{ ...smallNote, marginTop: '0.25rem' }}>
      <strong>The two clocks</strong> show each clock&rsquo;s reading as hours:minutes:seconds (00:00:10 is 10 seconds). Both count up
      while the experiment runs, and stay at their last reading when it ends.
    </p>
  )
}

export function StripCaption({ name, duration, guesses, pink }: { name: string; duration: number; guesses: boolean; pink: boolean }) {
  const result = runTwoClockExperiment(duration)
  const a = formatClockReading(result.startEvent.clockReadingA)
  const b = formatClockReading(result.endEvent.clockReadingA)
  const items = [
    {
      look: 'the two dots at Event B, one on each row, and the dashed line that joins them.',
      means: 'It is the same moment on both clocks, and the readings under the dots are the readings of Clock A and Clock B at that moment.',
      matters: 'The question of this experiment is whether two clocks in different places show the same reading at the same moment.',
    },
    {
      look: 'the two "elapsed" labels.',
      means: `Each clock’s own elapsed time, from its own start reading to its own end reading: ${result.elapsedTimeA} seconds and ${result.elapsedTimeB} seconds.`,
      matters: 'It shows how much time each clock says passed, which can be compared directly.',
    },
  ]
  if (guesses) {
    items.push({
      look: 'the white YOUR GUESS marks and the Event B dot on the same row.',
      means: 'The gap between a mark and the dot, if there is one, is how far that guess was from that clock’s end reading, in seconds.',
      matters: 'It puts what you expected for each clock beside what the clock showed.',
    })
  }
  if (pink) {
    items[1] = {
      look: 'the two end readings in each run, and the line "Runs so far" below.',
      means: `Each clock’s end reading equals the length you chose: this run ends at ${b} on both.`,
      matters: 'It shows whether the two clocks keep agreeing when the length of the experiment changes.',
    }
  }
  return (
    <CaptionBox>
      <p style={{ marginTop: 0, marginBottom: '0.5rem' }}>
        <strong>How to read {name}.</strong>
      </p>
      <ul style={{ margin: 0, paddingLeft: '1.25rem' }}>
        <li>
          <strong>The strip</strong> appears when the run ends. It is a time line: the further right, the later the moment. It has one
          row for each clock, and both rows share one scale in seconds. 0 s is the start, {duration} s is the length of the
          experiment and {2 * duration} s is twice that, so there is room to the right of the end.
        </li>
        <li>
          <strong>Event A, START</strong> is the moment the experiment began, and <strong>Event B, END</strong> is the moment it
          ended. The dashed lines join the two rows at each event, so you can see that both clocks are read at the same two moments.
          The number under each dot is that clock&rsquo;s reading at that event.
        </li>
        <li>
          <strong>&ldquo;Elapsed&rdquo;</strong> is the time that passed between the two events on that clock.
        </li>
        {pink ? (
          <li>
            <strong>Pink</strong> marks your own length (Event B, the dashed line at it and the elapsed labels), so you can tell this
            drawing from Part 1&rsquo;s. If you choose a different length, the scale changes too: a 20-second run has a scale to 40
            s. &ldquo;Runs so far&rdquo; lists every run in this Part.
          </li>
        ) : (
          guesses && (
            <li>
              <strong>The white marks and the YOUR GUESS boxes</strong> are your guesses, one per clock, placed on the same scale. A
              white arrow at the edge means your guess is beyond the end of the scale. A mark is only your guess; it never moves the
              events.
            </li>
          )
        )}
      </ul>
      <p style={{ marginBottom: '0.5rem' }}>
        <strong>A worked moment.</strong> The experiment lasts {duration} seconds. On Clock A, Event A is at 0 s and reads {a}, and
        Event B is at {duration} s and reads {b}, so its elapsed time is {b} − {a} = {result.elapsedTimeA} seconds. Clock B&rsquo;s
        row is read the same way.
        {!pink && guesses && ' If you had guessed 7 for Clock A, its white mark would sit at 7 s, 3 seconds to the left of Event B.'}
      </p>
      <LookFor items={items} />
    </CaptionBox>
  )
}

interface RunRecord {
  duration: number
  result: TwoClockExperimentResult
}

interface Experiment2Props {
  onComplete?: () => void
  onTutorComplete?: () => void
}

export function Experiment2({ onComplete, onTutorComplete }: Experiment2Props) {
  const [predictionA, setPredictionA] = useState('')
  const [predictionB, setPredictionB] = useState('')
  const [submitted, setSubmitted] = useState<{ a: number; b: number } | null>(null)
  const [duration, setDuration] = useState<DurationOption>(20)
  const [customDuration, setCustomDuration] = useState('')
  const [part2Runs, setPart2Runs] = useState<RunRecord[]>([])
  const [part2Duration, setPart2Duration] = useState(20)
  const part1 = useClockRunner(onComplete)
  const part2 = useClockRunner()

  const part1Result = runTwoClockExperiment(PART1_DURATION)
  const part1Running = part1.status === 'running'
  const part1Done = part1.status === 'complete'
  const part2Running = part2.status === 'running'
  const part2Done = part2.status === 'complete'
  const locked = submitted !== null

  const valueA = predictionA.trim() ? Number(predictionA) : null
  const valueB = predictionB.trim() ? Number(predictionB) : null
  const hasPredictions = valueA !== null && isFinite(valueA) && valueB !== null && isFinite(valueB)

  const selectedDuration = duration === 'other' ? Number(customDuration) : duration
  const durationValid = Number.isInteger(selectedDuration) && selectedDuration >= 1 && selectedDuration <= 60

  const hasAnythingToClear = predictionA !== '' || predictionB !== '' || locked || part1.status !== 'idle' || part2Runs.length > 0
  const startOverDisabled = !hasAnythingToClear || part1Running || part2Running

  const handleStart = () => {
    if (!hasPredictions || locked) return
    setSubmitted({ a: valueA as number, b: valueB as number })
    part1.start(PART1_DURATION)
  }

  const handleRunPart2 = () => {
    if (!durationValid || part1Running || part2Running) return
    setPart2Duration(selectedDuration)
    part2.start(selectedDuration)
  }

  // Record each finished Part 2 run once.
  useEffect(() => {
    if (part2Done) {
      setPart2Runs((runs) => [...runs, { duration: part2Duration, result: runTwoClockExperiment(part2Duration) }])
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [part2Done])

  // Start over: clears the guesses, the runs, the results and the tutor, and returns the page to its first state.
  const handleStartOver = () => {
    part1.reset()
    part2.reset()
    setPredictionA('')
    setPredictionB('')
    setSubmitted(null)
    setDuration(20)
    setCustomDuration('')
    setPart2Runs([])
    setPart2Duration(20)
  }

  const lastPart2 = part2Runs.length > 0 ? part2Runs[part2Runs.length - 1] : null
  const inputStyle = (disabled: boolean) => ({
    padding: '0.5rem',
    fontSize: '0.875rem',
    width: '200px',
    opacity: disabled ? 0.6 : 1,
    cursor: disabled ? 'not-allowed' : 'text',
  })

  return (
    <div style={{ padding: '2rem', maxWidth: '900px', margin: '0 auto' }}>
      <h2>Experiment 2 — Two Clocks at Rest</h2>

      <div className="exp-card" style={{ marginTop: '2rem', padding: '1.5rem' }}>
        <div style={{ marginBottom: '2rem', fontSize: '0.875rem', color: 'var(--text-muted)' }}>
          <p style={paragraph}>
            <strong>The question.</strong> In &ldquo;One clock&rdquo;, one clock measured how much time passed
            (the elapsed time). Now we use two clocks in two different places. Will they agree?
          </p>
          <p style={paragraph}>
            <strong>Why even ask this.</strong> It might seem obvious that two motionless clocks
            would end up agreeing — nothing is pulling them apart, nothing is speeding one up. But
            "obvious" isn't the same as "checked." This project's whole approach is to test
            assumptions like this directly, with an actual measurement, rather than take them on
            faith — because later, once one of the clocks starts moving, the answer will turn out to
            be far less obvious than it looks right now.
          </p>
          <p style={paragraph}>
            <strong>What happens.</strong> Clock A and Clock B sit at different places. Both stand still, and both show 00:00:00
            when the experiment starts. In Part 1 the experiment lasts {PART1_DURATION} seconds. When the time is up, we read both
            clocks, and a strip appears that shows each clock&rsquo;s reading at the two events: the moment the experiment starts and
            the moment it ends. In Part 2 you choose any length from 1 to 60 seconds and run that.
          </p>
          <div
            style={{
              marginBottom: '0.75rem',
              padding: '0.75rem 1rem',
              borderLeft: '4px solid var(--accent-blue)',
              backgroundColor: 'rgba(37, 99, 235, 0.06)',
            }}
          >
            <p style={{ marginTop: 0, marginBottom: '0.5rem' }}>
              <strong>New term: reference frame.</strong>
            </p>
            <p style={{ marginTop: 0, marginBottom: '0.5rem' }}>
              In everyday life we treat time as one thing. If you ask "what time is it?", you expect
              one answer that is the same for everyone. We hardly notice that we are assuming this.
              In these experiments we do not just assume it. We check it, using clocks.
            </p>
            <p style={{ marginTop: 0, marginBottom: '0.5rem' }}>
              To check it, we need to say who is doing the measuring. A <strong>reference frame</strong>{' '}
              is a group of people and clocks that are all standing still relative to one another.
              That means none of them is moving compared with the others, so the distances between
              them stay the same.
            </p>
            <p style={{ marginTop: 0, marginBottom: '0.5rem' }}>
              For example, imagine a room. Some clocks are fixed at different places in the room,
              and some people are sitting still in it. None of them moves compared with the others,
              so together they make up one reference frame.
            </p>
            <p style={{ marginTop: 0, marginBottom: '0.5rem' }}>
              Clock A and Clock B are like the clocks in that room. Neither one moves compared with
              the other, so both clocks are in one reference frame.
            </p>
            <p style={{ marginTop: 0, marginBottom: 0 }}>
              Later, when a clock moves, we will compare it with clocks in a frame like this one.
            </p>
          </div>
          <p style={paragraph}>
            <strong>How real clocks in different places are checked.</strong> Real clocks are not simply trusted to agree. About 450
            atomic clocks in about 90 laboratories around the world are compared with each other all the time, and every month an
            international bureau tells each laboratory how far its clocks are from the shared world time, so that the laboratories can
            correct them. The clocks on this page are an idealized version: they are set to the same reading at the start and nothing
            disturbs them.
          </p>
          <p style={paragraph}>
            <strong>Your job.</strong> Before you press START, predict what each clock will show at the end. A wrong guess is fine.
            Guesses are not scored. Then watch both clocks, try other lengths in Part 2, and talk it over with the tutor.
          </p>
          <p style={paragraph}>
            <strong>Your guesses and the real pictures.</strong> Your guesses never change the real pictures, the clocks or the
            numbers: they come from a calculation that knows nothing about what you guessed. Your guess for each clock is drawn on the
            strip in white, in a box labelled YOUR GUESS, and it is shown again beside the results. In Part 2 the length you choose
            does change the clocks and the strip, and the marks it moves are pink.
          </p>
          <p style={paragraph}>
            <strong>Some new words.</strong> The &ldquo;Words and formulas&rdquo; box below has each one, with a short plain meaning:
            clock, event, clock reading, elapsed time, duration, at rest, synchronized, reference frame.
          </p>
          <p style={{ marginTop: 0, marginBottom: '0.25rem' }}>
            <strong>What we assume.</strong>
          </p>
          <ul style={{ marginTop: 0, marginBottom: 0, paddingLeft: '1.25rem' }}>
            <li>Neither clock moves, and there is no gravity.</li>
            <li>Both clocks start together, are set to the same reading, and stand still.</li>
            <li>
              To save you waiting, the animation may play faster than real life. This does not
              change the result.
            </li>
          </ul>
        </div>

        <ReferencePanel entries={referenceEntries(part1Done)} />

        <div style={{ marginBottom: '2rem', fontSize: '0.875rem', color: 'var(--text-muted)' }}>
          <p style={{ marginTop: 0, marginBottom: '0.25rem' }}>
            <strong>Want to know more?</strong> A plainer-language page from an official source is listed here. Checked on 8 November
            2026. The link opens in a new tab. This page has no real experimental result, so there is no paper to link.
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
          First you guess what each clock will show when the experiment ends. Then you press START and watch both clocks count for{' '}
          {PART1_DURATION} seconds. When the run finishes, a strip appears that shows each clock&rsquo;s reading at the two events,
          with your guesses drawn on it in white.
        </PartHeader>

        <div style={{ marginBottom: '1.5rem' }}>
          <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold' }}>Make predictions</label>
          <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)', marginBottom: '1rem' }}>
            The experiment will last {PART1_DURATION} seconds. What will each clock show when it ends? Type your guess for each
            clock, in seconds.
          </p>
          <div style={{ marginBottom: '1rem' }}>
            <label style={{ display: 'block', fontSize: '0.875rem', marginBottom: '0.25rem', fontWeight: 'bold' }}>
              Your guess for Clock A (seconds)
            </label>
            <input
              type="number"
              value={predictionA}
              onChange={(e) => setPredictionA(e.target.value)}
              disabled={locked}
              placeholder="Enter seconds"
              aria-label="Your guess for Clock A, in seconds"
              className="field-input"
              style={inputStyle(locked)}
            />
          </div>
          <div style={{ marginBottom: '1rem' }}>
            <label style={{ display: 'block', fontSize: '0.875rem', marginBottom: '0.25rem', fontWeight: 'bold' }}>
              Your guess for Clock B (seconds)
            </label>
            <input
              type="number"
              value={predictionB}
              onChange={(e) => setPredictionB(e.target.value)}
              disabled={locked}
              placeholder="Enter seconds"
              aria-label="Your guess for Clock B, in seconds"
              className="field-input"
              style={inputStyle(locked)}
            />
          </div>
          <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
            {locked
              ? `Your predictions: A ${submitted.a} seconds, B ${submitted.b} seconds. Your predictions are locked while you try other lengths. To change them, press Start over.`
              : hasPredictions
                ? `Your predictions: A ${valueA} seconds, B ${valueB} seconds`
                : 'Enter both predictions to continue'}
          </p>
        </div>

        <button
          type="button"
          onClick={handleStart}
          disabled={part1Running || part2Running || locked || !hasPredictions}
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
        {!hasPredictions && !locked && <p style={smallNote}>Enter both predictions above to press START.</p>}

        <Block>
          <ClockReadouts duration={PART1_DURATION} time={part1.time} running={part1Running} label="Clocks" />
          <ClocksCaption />
        </Block>

        {part1Done && submitted ? (
          <Block>
            <TwoClockStrip
              duration={PART1_DURATION}
              pink={false}
              guesses={submitted}
              label={`The Event Interval strip for the ${PART1_DURATION}-second experiment: one row for Clock A and one for Clock B on one scale, Event A at 0 seconds, Event B at ${PART1_DURATION} seconds, the elapsed time of each clock, and your guess for each clock in white in a box marked YOUR GUESS.`}
            />
            <WhereFrom>
              Calculated here, not measured: the readings come from the length of the experiment, one second of clock time for each
              second that passes, for each clock. No instrument measured them and nothing here is imagined. The white marks are only
              your guesses, placed on the same scale.
            </WhereFrom>
            <StripCaption name="the Event Interval strip" duration={PART1_DURATION} guesses pink={false} />
          </Block>
        ) : (
          <p style={smallNote}>
            {part1Running ? 'The strip will appear when the run ends.' : 'After you press START, a strip showing both clocks at the two events will appear here when the run ends.'}
          </p>
        )}

        {/* ===== Part 2 ===== */}
        {part1Done && (
          <>
            <PartHeader color="#be185d" title="Part 2: Now try it yourself">
              Now you choose how long the experiment lasts, from 1 to 60 seconds, and run it. The length you choose changes the clocks
              and the strip in this Part, marked in pink. It does not change Part 1&rsquo;s picture, the results in Part 3, or your
              guesses.
            </PartHeader>

            <div style={{ marginBottom: '1rem' }}>
              <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold' }}>Experiment duration</label>
              <div style={{ marginBottom: '0.75rem' }}>
                {PRESETS.map((preset) => (
                  <button
                    key={preset}
                    onClick={() => setDuration(preset)}
                    disabled={part2Running}
                    className={`toggle-button${duration === preset ? ' is-selected' : ''}`}
                    style={{ marginRight: '0.5rem', padding: '0.5rem 1rem', fontSize: '0.875rem', opacity: part2Running ? 0.6 : 1 }}
                  >
                    {preset}s
                  </button>
                ))}
                <button
                  onClick={() => setDuration('other')}
                  disabled={part2Running}
                  className={`toggle-button${duration === 'other' ? ' is-selected' : ''}`}
                  style={{ padding: '0.5rem 1rem', fontSize: '0.875rem', opacity: part2Running ? 0.6 : 1 }}
                >
                  Other
                </button>
              </div>
              {duration === 'other' && (
                <div style={{ marginBottom: '0.75rem' }}>
                  <input
                    type="number"
                    min="1"
                    max="60"
                    value={customDuration}
                    onChange={(e) => setCustomDuration(e.target.value)}
                    disabled={part2Running}
                    placeholder="Enter seconds (1-60)"
                    className="field-input"
                    style={{ padding: '0.5rem', fontSize: '0.875rem', width: '200px' }}
                  />
                </div>
              )}
              <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)', marginTop: 0 }}>
                Selected duration: <strong>{durationValid ? `${selectedDuration} seconds` : '— (a whole number from 1 to 60)'}</strong>
              </p>
              <p style={smallNote}>Your guesses do not change these drawings, but the length you choose does.</p>
              <button
                type="button"
                onClick={handleRunPart2}
                disabled={!durationValid || part2Running}
                className="action-button"
                style={{ padding: '0.6rem 1.5rem', marginTop: '0.5rem' }}
              >
                {part2Running ? 'Running...' : 'Run your duration'}
              </button>
            </div>

            <Block>
              <ClockReadouts duration={part2Running || part2Done ? part2Duration : selectedDuration || 1} time={part2.time} running={part2Running} label="Clocks (your length)" />
            </Block>

            {lastPart2 && !part2Running ? (
              <Block>
                <TwoClockStrip
                  duration={lastPart2.duration}
                  pink
                  guesses={null}
                  label={`Drawing A: the Event Interval strip for your ${lastPart2.duration}-second run, one row for each clock, with Event B and the elapsed times in pink.`}
                />
                <WhereFrom>
                  Calculated here, not measured: the readings come from the length you chose, one second of clock time for each second
                  that passes, for each clock. No instrument measured them and nothing here is imagined.
                </WhereFrom>
                <StripCaption name="Drawing A" duration={lastPart2.duration} guesses={false} pink />
                <p style={{ fontSize: '0.875rem', marginBottom: 0, marginTop: '0.75rem' }}>
                  <strong>Runs so far</strong>
                </p>
                <ul style={{ fontSize: '0.875rem', marginTop: '0.25rem', paddingLeft: '1.25rem' }}>
                  {part2Runs.map((run, i) => (
                    <li key={i}>
                      {run.duration} s: both clocks end at {formatClockReading(run.result.endEvent.clockReadingA)}, elapsed{' '}
                      {run.result.elapsedTimeA} seconds each
                    </li>
                  ))}
                </ul>
              </Block>
            ) : (
              <p style={smallNote}>Not run yet. Choose a length and press Run your duration; the strip for your length will appear here.</p>
            )}
          </>
        )}

        {/* ===== Part 3 ===== */}
        {part1Done && submitted && (
          <>
            <PartHeader color="#0f766e" title="Part 3: The results">
              Here are the numbers from the Part 1 run, with your guesses listed beside them. Nothing in this Part changes with your
              guesses or with the length you choose in Part 2.
            </PartHeader>

            <div style={{ marginBottom: '1.5rem' }}>
              <p style={{ margin: '0.5rem 0', fontSize: '0.875rem' }}>
                <strong>Clock A elapsed time:</strong> {part1Result.elapsedTimeA} seconds
                <GuessTag />
                <span style={{ marginLeft: '0.4rem', fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                  Your guess for Clock A is drawn on Part 1&rsquo;s strip as a white mark.
                </span>
              </p>
              <p style={{ margin: '0.5rem 0', fontSize: '0.875rem' }}>
                <strong>Clock B elapsed time:</strong> {part1Result.elapsedTimeB} seconds
                <GuessTag />
                <span style={{ marginLeft: '0.4rem', fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                  Your guess for Clock B is drawn on Part 1&rsquo;s strip as a white mark.
                </span>
              </p>
            </div>

            <div style={{ marginBottom: '1.5rem', paddingTop: '1rem', borderTop: '1px solid var(--border)' }}>
              <p style={{ margin: '0.5rem 0', fontSize: '0.875rem' }}>
                <strong>You guessed for Clock A:</strong> {submitted.a} seconds
              </p>
              <p style={{ margin: '0.5rem 0', fontSize: '0.875rem' }}>
                <strong>The real elapsed time of Clock A:</strong> {part1Result.elapsedTimeA} seconds
              </p>
            </div>

            <div style={{ marginBottom: '1.5rem', paddingBottom: '1rem', borderBottom: '1px solid var(--border)' }}>
              <p style={{ margin: '0.5rem 0', fontSize: '0.875rem' }}>
                <strong>You guessed for Clock B:</strong> {submitted.b} seconds
              </p>
              <p style={{ margin: '0.5rem 0', fontSize: '0.875rem' }}>
                <strong>The real elapsed time of Clock B:</strong> {part1Result.elapsedTimeB} seconds
              </p>
            </div>

            <div style={{ marginBottom: '1rem' }}>
              <p style={{ margin: '0.5rem 0', fontSize: '0.875rem' }}>
                <strong>Difference between the two clocks' elapsed times:</strong> {part1Result.difference} seconds
              </p>
            </div>
            <p style={{ ...smallNote, marginTop: '0.75rem' }}>
              <strong>Where this comes from:</strong> calculated here from the length of the experiment (see the caption under the
              strip). Nothing here changes with your guesses or with the length you choose in Part 2.
            </p>
          </>
        )}

        {/* ===== Part 4 ===== */}
        {part1Done && submitted && (
          <>
            <PartHeader color="#0066cc" title="Part 4: The tutor">
              Talk through what you saw. The tutor points to your two white guess marks, then explains.
            </PartHeader>
            <Experiment2Tutor
              onExplained={onTutorComplete}
              key={`${PART1_DURATION}-${submitted.a}-${submitted.b}`}
              predictionA={submitted.a}
              predictionB={submitted.b}
              durationSeconds={PART1_DURATION}
            />
          </>
        )}
      </div>
    </div>
  )
}
