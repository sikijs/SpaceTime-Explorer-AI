import { useCallback, useEffect, useRef, useState, type ReactNode } from 'react'
import { guessPositionOnStrip, runClockExperiment } from '../physics/clockExperiment'
import type { ClockExperimentResult } from '../physics/clockExperiment'
import { ExperimentTutor } from './ExperimentTutor'
import { ReferencePanel } from './EnergyMomentumExperiment'
import { MUTED_COLOR, PartHeader, TEXT_COLOR, YOURS_COLOR, svgStyle } from './GravitationalWaveExperiment'
import { LookForList } from './WideBinariesExperiment'
import { formatClockReading } from './clockFormat'

export { formatClockReading }

// Relativity of Time and Motion, Experiment 1, audited to the newer rules (docs/audit/relativity-of-time-and-motion/
// 01-draft-wording.md, approved by the owner on 2026-11-08 "with defaults"): the page in four Parts, a labelled Event
// Interval strip with a scale and the white YOUR GUESS mark, a caption for each picture, a words box, links, Start over and a
// tutor that points to the mark. Every number drawn comes from the physics module (src/physics/clockExperiment.ts; CLAUDE.md §9).

// Part 1 uses the specification's default length (spec §5); Part 2 lets the learner choose another.
export const PART1_DURATION = 10
const PRESETS = [5, 10, 20, 30] as const
const ANIMATION_MS = 2000
const GUESS_COLOR = '#ffffff' // white: the learner's guess, and nothing else (CLAUDE.md §14)
const EVENT_COLOR = '#f59e0b' // amber: the real events

type DurationOption = 5 | 10 | 20 | 30 | 'other'
type RunStatus = 'idle' | 'running' | 'complete'


// The clock's playback: only presentation. The result comes from the physics module and never depends on this.
function useClockRunner(onFinish?: () => void) {
  const [status, setStatus] = useState<RunStatus>('idle')
  const [seconds, setSeconds] = useState(0)
  const [total, setTotal] = useState(0)
  const finishRef = useRef(onFinish)
  finishRef.current = onFinish

  useEffect(() => {
    if (status !== 'running') return
    const startTime = performance.now()
    let frameId = 0
    const animate = (now: number) => {
      const progress = Math.min((now - startTime) / ANIMATION_MS, 1)
      setSeconds(Math.floor(progress * total))
      if (progress >= 1) {
        setSeconds(total)
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
    setSeconds(0)
    setTotal(runTotal)
    setStatus('running')
  }, [])
  const reset = useCallback(() => {
    setStatus('idle')
    setSeconds(0)
    setTotal(0)
  }, [])
  return { status, seconds, start, reset }
}

function ExternalLink({ href, children }: { href: string; children: ReactNode }) {
  return (
    <a href={href} target="_blank" rel="noopener noreferrer">
      {children}
    </a>
  )
}

// Pages fetched and read on 8 November 2026 (see the audit's draft wording, section 2).
const PLAIN_LINKS = [
  { href: 'https://www.nist.gov/how-do-you-measure-it/how-do-you-measure-second', label: 'NIST: "How Do You Measure a Second?"', what: 'a plain explanation of how an atomic clock counts the vibrations of cesium atoms to define one second. (National Institute of Standards and Technology; page updated May 2026.)' },
  { href: 'https://www.nist.gov/pml/time-and-frequency-division/timekeeping-and-clocks-faqs', label: 'NIST: "Timekeeping and clocks FAQs"', what: 'how clocks of every kind work by counting a regular repeat, from a swinging pendulum to a quartz watch to an atomic clock. (NIST Time and Frequency Division; updated October 2024.)' },
  { href: 'https://www.nist.gov/pml/owm/si-units-time', label: 'NIST: "SI Units – Time"', what: 'the official definition of the second, and of the hertz, which is one repeat per second. (NIST Office of Weights and Measures; updated January 2026.)' },
]

// The "Words and formulas" box. The formula entry shows the answer to the prediction, so it appears only after the Part 1 run
// has finished (CLAUDE.md §12). Its numbers come from the physics module (CLAUDE.md §9).
function referenceEntries(done: boolean): { term: string; meaning: string }[] {
  const entries = [
    { term: 'Clock', meaning: 'anything that repeats in a very regular way and keeps count of the repeats.' },
    { term: 'Tick', meaning: 'one count of the clock. On this page, one tick is one second.' },
    { term: 'Vibration (or cycle)', meaning: 'one back-and-forth of something that repeats, such as one swing of a pendulum or one vibration of a crystal.' },
    { term: 'Hertz (Hz)', meaning: 'the unit for how many repeats happen in one second. 1 Hz is one repeat per second; 32,768 Hz is 32,768 repeats per second.' },
    { term: 'Event', meaning: 'one moment at which something happens: here, the start of the experiment and its end.' },
    { term: 'Clock reading', meaning: 'the numbers the clock shows at an event, written hours:minutes:seconds. 00:00:10 means 0 hours, 0 minutes, 10 seconds.' },
    { term: 'Duration', meaning: 'how long the experiment is set to last, in seconds.' },
    { term: 'Elapsed time', meaning: 'how much time passed between two events, according to the clock.' },
  ]
  if (done) {
    const run = runClockExperiment(PART1_DURATION)
    entries.push({
      term: 'Formula: elapsed time',
      meaning: `clock reading at the end − clock reading at the start. Worked example from this page: ${formatClockReading(run.finalClockReading)} − ${formatClockReading(run.initialClockReading)} = ${run.elapsedTime} seconds.`,
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

export function ClockReadout({ seconds, running, label }: { seconds: number; running: boolean; label: string }) {
  return (
    <div style={{ marginBottom: '1rem' }}>
      <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)' }}>{label}: {running ? 'running...' : 'at rest'}</p>
      <div
        className="clock-readout"
        style={{ fontSize: '2.5rem', fontFamily: 'monospace', fontWeight: 'bold', marginBottom: '0.5rem', padding: '1rem', textAlign: 'center' }}
      >
        {formatClockReading(seconds)}
      </div>
    </div>
  )
}

// ---- The Event Interval strip (Part 1's picture, and Drawing A in Part 2 with a pink Event B) ----
const S = { width: 580, left: 40, right: 540, lineY: 92 }

export function EventStrip({
  duration,
  pink,
  guess,
  label,
}: {
  duration: number
  pink: boolean
  guess: number | null
  label: string
}) {
  const result = runClockExperiment(duration)
  const mark = guess === null ? null : guessPositionOnStrip(duration, guess)
  const scaleEnd = mark ? mark.scaleEnd : 2 * duration
  const px = (seconds: number) => S.left + (seconds / scaleEnd) * (S.right - S.left)
  const bColor = pink ? YOURS_COLOR : EVENT_COLOR
  const xA = px(result.startEvent.clockReading)
  const xB = px(result.endEvent.clockReading)
  const bracketY = 158
  const markX = mark ? S.left + mark.fraction * (S.right - S.left) : 0
  const boxWidth = 270
  const boxX = Math.min(Math.max(markX - boxWidth / 2, 4), S.width - boxWidth - 4)
  const boxY = 12
  const guessText = guess === null ? '' : `YOUR GUESS: ${guess} seconds${mark?.offEdge ? ' (off the scale)' : ''}`
  const height = 212

  return (
    <svg width={S.width} height={height} viewBox={`0 0 ${S.width} ${height}`} style={svgStyle} role="img" aria-label={label}>
      <text x={14} y={height - 8} fill={MUTED_COLOR} fontSize="10">
        time scale in seconds (0 s is the start of the experiment)
      </text>
      {/* the time line and its scale */}
      <line x1={S.left} y1={S.lineY} x2={S.right} y2={S.lineY} stroke={MUTED_COLOR} strokeWidth={3} />
      {[0, duration, scaleEnd].map((t, i) => (
        <g key={i}>
          <line x1={px(t)} y1={S.lineY - 5} x2={px(t)} y2={S.lineY + 5} stroke={MUTED_COLOR} />
          <text x={px(t)} y={S.lineY + 20} fill={MUTED_COLOR} fontSize="10" textAnchor={i === 0 ? 'start' : i === 2 ? 'end' : 'middle'}>
            {t} s
          </text>
        </g>
      ))}
      {/* Event A and Event B */}
      <circle cx={xA} cy={S.lineY} r={7} fill={EVENT_COLOR} />
      <circle cx={xB} cy={S.lineY} r={7} fill={bColor} />
      <text x={xA} y={S.lineY + 40} fill={EVENT_COLOR} fontSize="12" fontWeight="bold" textAnchor="start">
        Event A, START
      </text>
      <text x={xA} y={S.lineY + 56} fill={TEXT_COLOR} fontSize="12" fontFamily="monospace" textAnchor="start">
        {formatClockReading(result.startEvent.clockReading)}
      </text>
      <text x={xB} y={S.lineY + 40} fill={bColor} fontSize="12" fontWeight="bold" textAnchor="middle">
        {pink ? 'Event B, END (your length)' : 'Event B, END'}
      </text>
      <text x={xB} y={S.lineY + 56} fill={TEXT_COLOR} fontSize="12" fontFamily="monospace" textAnchor="middle">
        {formatClockReading(result.endEvent.clockReading)}
      </text>
      {/* the elapsed time */}
      <line x1={xA} y1={bracketY} x2={xB} y2={bracketY} stroke={bColor} strokeWidth={2} />
      <line x1={xA} y1={bracketY - 6} x2={xA} y2={bracketY + 6} stroke={bColor} strokeWidth={2} />
      <line x1={xB} y1={bracketY - 6} x2={xB} y2={bracketY + 6} stroke={bColor} strokeWidth={2} />
      <text x={(xA + xB) / 2} y={bracketY + 20} fill={bColor} fontSize="12" fontWeight="bold" textAnchor="middle">
        elapsed time: {result.elapsedTime} seconds
      </text>
      {/* white: the learner's guess, placed on the same scale; a number has a position, so the mark follows it */}
      {mark && (
        <g>
          <line x1={markX} y1={boxY + 20} x2={markX} y2={S.lineY} stroke={GUESS_COLOR} strokeWidth={1.5} />
          {mark.offEdge === null ? (
            <circle cx={markX} cy={S.lineY} r={6} fill={GUESS_COLOR} stroke="#0b1020" strokeWidth={1.5} />
          ) : (
            <polygon
              points={
                mark.offEdge === 'right'
                  ? `${markX + 12},${S.lineY} ${markX},${S.lineY - 9} ${markX},${S.lineY + 9}`
                  : `${markX - 12},${S.lineY} ${markX},${S.lineY - 9} ${markX},${S.lineY + 9}`
              }
              fill={GUESS_COLOR}
            />
          )}
          <rect x={boxX} y={boxY} width={boxWidth} height={22} fill="#0b1020" stroke={GUESS_COLOR} strokeWidth={2} rx={3} />
          <text x={boxX + 8} y={boxY + 15} fill={GUESS_COLOR} fontSize="12" fontWeight="bold">
            {guessText}
          </text>
        </g>
      )}
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

export function ClockCaption() {
  return (
    <p style={{ ...smallNote, marginTop: '0.25rem' }}>
      <strong>The clock</strong> shows its reading as hours:minutes:seconds (00:00:10 is 10 seconds). It counts up one tick at a
      time while the experiment runs, and it stays at its last reading when the run ends.
    </p>
  )
}

export function StripCaption({ name, duration, guess, pink }: { name: string; duration: number; guess: number | null; pink: boolean }) {
  const result = runClockExperiment(duration)
  const mark = guess === null ? null : guessPositionOnStrip(duration, guess)
  const a = formatClockReading(result.startEvent.clockReading)
  const b = formatClockReading(result.endEvent.clockReading)
  const items = [
    {
      look: `the number under Event A and the number under Event B.`,
      means: `The clock has a reading at each event: ${a} at the start and ${b} at the end.`,
      matters: 'A clock’s reading belongs to an event, so what a clock tells us is found by comparing its readings at two events.',
    },
    {
      look: 'the "elapsed time" bracket and the scale underneath it.',
      means: `The bracket is ${result.elapsedTime} seconds long, the same as the difference between the two readings.`,
      matters: 'Elapsed time is the number a clock measures between two events.',
    },
  ]
  if (!pink && mark) {
    items.push({
      look: 'the white YOUR GUESS mark and Event B, on the same scale.',
      means: 'The gap between them, if there is one, is how far your guess was from the clock’s end reading, in seconds.',
      matters: 'It lets you put what you expected beside what the clock counted, which is the point of guessing first.',
    })
  }
  if (pink) {
    items[1] = {
      look: 'the Event B reading in each run, and the line "Runs so far" below.',
      means: `Each end reading equals the length you chose: this run ends at ${b}.`,
      matters: 'It shows how the clock’s final reading and the elapsed time follow the length of the experiment.',
    }
  }
  return (
    <CaptionBox>
      <p style={{ marginTop: 0, marginBottom: '0.5rem' }}>
        <strong>How to read {name}.</strong>
      </p>
      <ul style={{ margin: 0, paddingLeft: '1.25rem' }}>
        <li>
          <strong>The strip</strong> is a time line: the further right, the later the moment. It appears when the run ends.
        </li>
        <li>
          <strong>The scale</strong> under the line is in seconds. 0 s is the start. {duration} s is the length of the experiment
          and {2 * duration} s is twice that, so there is room to the right of the end.
        </li>
        <li>
          <strong>Event A, START</strong> (amber dot) is the moment the experiment began, and{' '}
          <strong>{pink ? 'Event B, END' : 'Event B, END'}</strong> ({pink ? 'pink' : 'amber'} dot) is the moment it ended. The number under each is the
          clock&rsquo;s reading at that moment.
        </li>
        <li>
          <strong>The &ldquo;elapsed time&rdquo; bracket</strong> joins the two events. It is the time that passed between them.
        </li>
        {pink ? (
          <li>
            <strong>Pink</strong> marks your own length, so you can tell this drawing from Part 1&rsquo;s. If you choose a different
            length, the scale changes too: a 20-second run has a scale to 40 s. &ldquo;Runs so far&rdquo; lists every run in this Part.
          </li>
        ) : (
          <li>
            <strong>The white mark and the YOUR GUESS box</strong> are your guess, placed on the same scale. A white arrow at the
            edge means your guess is beyond the end of the scale. The mark is only your guess; it never moves the events.
          </li>
        )}
      </ul>
      <p style={{ marginBottom: '0.5rem' }}>
        <strong>A worked moment.</strong> This experiment lasts {duration} seconds. Event A is at 0 s and reads {a}. Event B is at{' '}
        {duration} s, halfway along the scale, and reads {b}. The elapsed time is {b} − {a} = {result.elapsedTime} seconds.
        {!pink && ' If you had guessed 7, the white mark would sit at 7 s, 3 seconds to the left of Event B.'}
      </p>
      <LookFor items={items} />
    </CaptionBox>
  )
}

interface RunRecord {
  duration: number
  result: ClockExperimentResult
}

interface Experiment1Props {
  onComplete?: () => void
  onTutorComplete?: () => void
}

export function Experiment1({ onComplete, onTutorComplete }: Experiment1Props) {
  const [predictionInput, setPredictionInput] = useState('')
  const [submittedPrediction, setSubmittedPrediction] = useState<number | null>(null)
  const [duration, setDuration] = useState<DurationOption>(20)
  const [customDuration, setCustomDuration] = useState('')
  const [part2Runs, setPart2Runs] = useState<RunRecord[]>([])
  const [part2Duration, setPart2Duration] = useState(20)
  const part1 = useClockRunner(onComplete)
  const part2 = useClockRunner()

  const part1Result = runClockExperiment(PART1_DURATION)
  const part1Running = part1.status === 'running'
  const part1Done = part1.status === 'complete'
  const part2Running = part2.status === 'running'
  const part2Done = part2.status === 'complete'
  const locked = submittedPrediction !== null

  const predictionValue = predictionInput.trim() ? Number(predictionInput) : null
  const hasPrediction = predictionValue !== null && isFinite(predictionValue)

  const selectedDuration = duration === 'other' ? Number(customDuration) : duration
  const durationValid = Number.isInteger(selectedDuration) && selectedDuration >= 1 && selectedDuration <= 60

  const hasAnythingToClear = predictionInput !== '' || locked || part1.status !== 'idle' || part2Runs.length > 0
  const startOverDisabled = !hasAnythingToClear || part1Running || part2Running

  const handleStart = () => {
    if (!hasPrediction || locked) return
    setSubmittedPrediction(predictionValue)
    part1.start(part1Result.finalClockReading)
  }

  const handleRunPart2 = () => {
    if (!durationValid || part1Running || part2Running) return
    setPart2Duration(selectedDuration)
    part2.start(selectedDuration)
  }

  // Record each finished Part 2 run once.
  useEffect(() => {
    if (part2Done) {
      setPart2Runs((runs) => [...runs, { duration: part2Duration, result: runClockExperiment(part2Duration) }])
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [part2Done])

  // Start over: clears the guess, the runs, the results and the tutor, and returns the page to its first state.
  const handleStartOver = () => {
    part1.reset()
    part2.reset()
    setPredictionInput('')
    setSubmittedPrediction(null)
    setDuration(20)
    setCustomDuration('')
    setPart2Runs([])
    setPart2Duration(20)
  }

  const lastPart2 = part2Runs.length > 0 ? part2Runs[part2Runs.length - 1] : null

  return (
    <div style={{ padding: '2rem', maxWidth: '900px', margin: '0 auto' }}>
      <h2>Experiment 1 — What Does a Clock Measure?</h2>

      <div className="exp-card" style={{ marginTop: '2rem', padding: '1.5rem' }}>
        <div style={{ marginBottom: '2rem', fontSize: '0.875rem', color: 'var(--text-muted)' }}>
          <p style={paragraph}>
            <strong>The question.</strong> What does a clock actually measure?
          </p>
          <p style={paragraph}>
            <strong>What a clock actually does.</strong> A clock isn't anything mysterious — it's
            just something that repeats in a very regular way, like a pendulum swinging back and
            forth, or a heart beating. "Elapsed time" between two moments is nothing more than how
            many of those regular repeats happened in between. When a clock ends up reading
            00:00:07, that means exactly seven of its own ticks happened between the moment it
            started and the moment it stopped — nothing more.
          </p>
          <p style={paragraph}>
            <strong>A daily-life picture.</strong> A stopwatch at a race doesn't know anything
            about the runners — it just counts ticks from the moment you press start to the moment
            you press stop, and that count is the elapsed time. The clock in this experiment works
            exactly the same way.
          </p>
          <p style={paragraph}>
            <strong>How real clocks count.</strong> Real clocks count in just this way, only much faster. A quartz watch has a tiny
            crystal inside that vibrates 32,768 times every second. The watch counts the vibrations and moves on its seconds hand
            once for every 32,768 of them: 32,768 ÷ 32,768 = 1 tick. An atomic clock counts the vibrations of a cesium atom instead.
            Since 1967 the official length of one second has been exactly 9,192,631,770 of those vibrations. In every case a clock
            is a counter of regular repeats.
          </p>
          <p style={paragraph}>
            <strong>What happens.</strong> There is one clock, and it stands still. It starts by
            showing 00:00:00. In Part 1 the experiment lasts {PART1_DURATION} seconds. When you press START, the clock begins to tick,
            and the experiment ends when the {PART1_DURATION} seconds are up. Two moments matter here: the moment the experiment
            starts and the moment it ends. We call each of these moments an <strong>event</strong>. When the run ends, a strip
            appears that shows the two events and the clock&rsquo;s reading at each. In Part 2 you choose any length from 1 to 60
            seconds and run that.
          </p>
          <p style={paragraph}>
            <strong>Your job.</strong> Before you press START, predict what the clock will show when
            the experiment ends. A wrong guess is fine. Guesses are not scored. Guessing first
            gives you a chance to think before you look. Then watch the run, try other lengths in Part 2, and talk it over with
            the tutor.
          </p>
          <p style={paragraph}>
            <strong>Your guess and the real pictures.</strong> Your guess never changes the real pictures, the clock or the
            numbers: they come from a calculation that knows nothing about what you guessed. Your guess is drawn on the strip in
            white, in a box labelled YOUR GUESS, and it is shown again beside the results. In Part 2 the length you choose does
            change the clock and the strip, and the marks it moves are pink.
          </p>
          <p style={paragraph}>
            <strong>Some new words.</strong> The &ldquo;Words and formulas&rdquo; box below has each one, with a short plain
            meaning: clock, tick, vibration, event, clock reading, elapsed time, duration, hertz.
          </p>
          <p style={{ marginTop: 0, marginBottom: '0.25rem' }}>
            <strong>What we assume.</strong>
          </p>
          <ul style={{ marginTop: 0, marginBottom: 0, paddingLeft: '1.25rem' }}>
            <li>There is only one clock, and it stays in one place. It does not move, and there is no gravity.</li>
            <li>
              To save you waiting, the animation may play faster than real life. This does not
              change the result.
            </li>
          </ul>
        </div>

        <ReferencePanel entries={referenceEntries(part1Done)} />

        <div style={{ marginBottom: '2rem', fontSize: '0.875rem', color: 'var(--text-muted)' }}>
          <p style={{ marginTop: 0, marginBottom: '0.25rem' }}>
            <strong>Want to know more?</strong> Plainer-language pages from an official source are listed here. Checked on 8
            November 2026. Each link opens in a new tab. This page has no real experimental result, so there is no paper to link.
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
          First you guess what the clock will show when the experiment ends. Then you press START and watch the clock count for{' '}
          {PART1_DURATION} seconds. When the run finishes, a strip appears that shows the two events, with your guess drawn on it in
          white.
        </PartHeader>

        <div style={{ marginBottom: '1.5rem' }}>
          <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold' }}>Make a prediction</label>
          <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)', marginBottom: '0.75rem' }}>
            The experiment will last {PART1_DURATION} seconds. When it ends, what will the clock show? Type your guess in seconds.
          </p>
          <input
            type="number"
            value={predictionInput}
            onChange={(e) => setPredictionInput(e.target.value)}
            disabled={locked}
            placeholder="Enter seconds"
            className="field-input"
            style={{ padding: '0.5rem', fontSize: '0.875rem', width: '200px', opacity: locked ? 0.6 : 1, cursor: locked ? 'not-allowed' : 'text' }}
          />
          <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.5rem' }}>
            {locked
              ? `Your prediction: ${submittedPrediction} seconds. Your prediction is locked while you try other lengths. To change it, press Start over.`
              : hasPrediction
                ? `Your prediction: ${predictionValue} seconds`
                : 'Enter a prediction to continue'}
          </p>
        </div>

        <button
          type="button"
          onClick={handleStart}
          disabled={part1Running || part2Running || locked || !hasPrediction}
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
        {!hasPrediction && !locked && <p style={smallNote}>Enter a prediction above to press START.</p>}

        <Block>
          <ClockReadout seconds={part1.seconds} running={part1Running} label="Clock" />
          <ClockCaption />
        </Block>

        {part1Done ? (
          <Block>
            <EventStrip
              duration={PART1_DURATION}
              pink={false}
              guess={submittedPrediction}
              label={`The Event Interval strip for the ${PART1_DURATION}-second experiment: Event A at 0 seconds, Event B at ${PART1_DURATION} seconds, the elapsed time between them, and your guess in white in a box marked YOUR GUESS.`}
            />
            <WhereFrom>
              Calculated here, not measured: the readings come from the length of the experiment, one second of clock time for each
              second that passes. No instrument measured them and nothing here is imagined. The white mark is only your guess,
              placed on the same scale.
            </WhereFrom>
            <StripCaption name="the Event Interval strip" duration={PART1_DURATION} guess={submittedPrediction} pink={false} />
          </Block>
        ) : (
          <p style={smallNote}>
            {part1Running ? 'The strip will appear when the run ends.' : 'After you press START, a strip showing the two events will appear here when the run ends.'}
          </p>
        )}

        {/* ===== Part 2 ===== */}
        {part1Done && (
          <>
            <PartHeader color="#be185d" title="Part 2: Now try it yourself">
              Now you choose how long the experiment lasts, from 1 to 60 seconds, and run it. The length you choose changes the
              clock and the strip in this Part, marked in pink. It does not change Part 1&rsquo;s picture, the results in Part 3, or
              your guess.
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
              <p style={smallNote}>Your guess does not change these drawings, but the length you choose does.</p>
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
              <ClockReadout seconds={part2.seconds} running={part2Running} label="Clock (your length)" />
            </Block>

            {lastPart2 && !part2Running ? (
              <Block>
                <EventStrip
                  duration={lastPart2.duration}
                  pink
                  guess={null}
                  label={`Drawing A: the Event Interval strip for your ${lastPart2.duration}-second run, with Event B and the elapsed time in pink.`}
                />
                <WhereFrom>
                  Calculated here, not measured: the readings come from the length you chose, one second of clock time for each
                  second that passes. No instrument measured them and nothing here is imagined.
                </WhereFrom>
                <StripCaption name="Drawing A" duration={lastPart2.duration} guess={null} pink />
                <p style={{ fontSize: '0.875rem', marginBottom: 0, marginTop: '0.75rem' }}>
                  <strong>Runs so far</strong>
                </p>
                <ul style={{ fontSize: '0.875rem', marginTop: '0.25rem', paddingLeft: '1.25rem' }}>
                  {part2Runs.map((run, i) => (
                    <li key={i}>
                      {run.duration} s: ends at {formatClockReading(run.result.finalClockReading)}, elapsed {run.result.elapsedTime}{' '}
                      seconds
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
        {part1Done && (
          <>
            <PartHeader color="#0f766e" title="Part 3: The results">
              Here are the numbers from the Part 1 run, with your guess listed beside them. Nothing in this Part changes with your
              guess or with the length you choose in Part 2.
            </PartHeader>

            <div style={{ marginBottom: '1rem' }}>
              <p style={{ margin: '0.5rem 0', fontSize: '0.875rem' }}>
                <strong>Start event (the moment the experiment begins):</strong> {formatClockReading(part1Result.startEvent.clockReading)}
              </p>
              <p style={{ margin: '0.5rem 0', fontSize: '0.875rem' }}>
                <strong>End event (the moment the experiment ends):</strong> {formatClockReading(part1Result.endEvent.clockReading)}
              </p>
            </div>
            <div style={{ marginBottom: '1rem' }}>
              <p style={{ margin: '0.5rem 0', fontSize: '0.875rem' }}>
                <strong>Clock reading at the start:</strong> {formatClockReading(part1Result.initialClockReading)}
              </p>
              <p style={{ margin: '0.5rem 0', fontSize: '0.875rem' }}>
                <strong>Clock reading at the end:</strong> {formatClockReading(part1Result.finalClockReading)}
              </p>
            </div>
            <div style={{ marginBottom: '1rem' }}>
              <p style={{ margin: '0.5rem 0', fontSize: '0.875rem' }}>
                <strong>Elapsed time (how much time passed):</strong> {part1Result.elapsedTime} seconds
                <GuessTag />
                <span style={{ marginLeft: '0.4rem', fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                  Your guess is drawn on Part 1&rsquo;s strip as the white mark.
                </span>
              </p>
            </div>
            {submittedPrediction !== null && (
              <div style={{ paddingTop: '1rem', borderTop: '1px solid var(--border)' }}>
                <p style={{ margin: '0.5rem 0', fontSize: '0.875rem' }}>
                  <strong>You guessed:</strong> {submittedPrediction} seconds
                </p>
                <p style={{ margin: '0.5rem 0', fontSize: '0.875rem' }}>
                  <strong>The real elapsed time:</strong> {part1Result.elapsedTime} seconds
                </p>
              </div>
            )}
            <p style={{ ...smallNote, marginTop: '0.75rem' }}>
              <strong>Where this comes from:</strong> calculated here from the length of the experiment (see the caption under the
              strip). Nothing here changes with your guess or with the length you choose in Part 2.
            </p>
          </>
        )}

        {/* ===== Part 4 ===== */}
        {part1Done && submittedPrediction !== null && (
          <>
            <PartHeader color="#0066cc" title="Part 4: The tutor">
              Talk through what you saw. The tutor points to your white guess mark, then explains.
            </PartHeader>
            <ExperimentTutor
              onExplained={onTutorComplete}
              key={`${part1Result.experimentDuration}-${part1Result.elapsedTime}-${submittedPrediction}`}
              predictionSeconds={submittedPrediction}
              durationSeconds={PART1_DURATION}
            />
          </>
        )}
      </div>
    </div>
  )
}
