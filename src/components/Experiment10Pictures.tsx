import type { ReactNode } from 'react'
import {
  guessMarkerFor,
  twinBarScaleEnd,
  twinClocksAt,
  twinWorkedNumbers,
} from '../physics/twinParadoxExperiment'
import type { TwinOutcome, TwinParadoxResult } from '../physics/twinParadoxExperiment'
import { MUTED_COLOR, TEXT_COLOR, YOURS_COLOR, svgStyle } from './GravitationalWaveExperiment'
import { LookForList } from './WideBinariesExperiment'

// Relativity of Time and Motion, Experiment 10 (the twin paradox), audited to the newer rules
// (docs/audit/relativity-of-time-and-motion/10-draft-wording.md, approved by the owner on 2026-11-11): the two clock bars with
// every part labelled, a white YOUR GUESS marker, captions with a worked moment and three-part look-fors. Every number drawn
// comes from the physics module (src/physics/twinParadoxExperiment.ts; CLAUDE.md §9). The wording is the owner's to approve
// line by line (CLAUDE.md §28.1).

export const GUESS_COLOR = '#ffffff' // white: the learner's guess, and nothing else (CLAUDE.md §14)
export const EARTH_COLOR = '#3b82f6' // blue: the Earth twin's clock
export const TRAVELER_COLOR = '#a78bfa' // purple: the traveling twin's clock

export const outcomeLabels: Record<TwinOutcome, string> = {
  sameAge: 'Same age',
  earthOlder: 'The Earth twin is older',
  travelerOlder: 'The traveling twin is older',
}

export const outcomeSentences: Record<TwinOutcome, string> = {
  sameAge: 'the twins would be the same age',
  earthOlder: 'the Earth twin would be older',
  travelerOlder: 'the traveling twin would be older',
}

const B = { width: 580, left: 168, right: 530, height: 258 }
const EARTH_Y = 56
const TRAVELER_Y = 130
const BAR_H = 24
const GAP_Y = 186
const AXIS_Y = 218

export function TwinBars({
  result,
  fraction,
  guess,
  pink,
  label,
}: {
  result: TwinParadoxResult
  fraction: number
  guess: TwinOutcome | null
  pink: boolean
  label: string
}) {
  const scaleEnd = twinBarScaleEnd(result)
  const state = twinClocksAt(result, Math.min(Math.max(fraction, 0), 1))
  const done = fraction >= 1
  const px = (seconds: number) => B.left + (seconds / scaleEnd) * (B.right - B.left)
  const travelerColor = pink ? YOURS_COLOR : TRAVELER_COLOR
  const stroke = { stroke: '#0b1020', strokeWidth: 4, paintOrder: 'stroke' } as const
  const earthEnd = px(state.earthClockReading)
  const travelerEnd = px(state.travelerClockReading)
  const title = pink ? `THE TWO CLOCKS AT YOUR SPEED: ${result.velocity}c` : `THE TWO CLOCKS DURING THE TRIP AT ${result.velocity}c`

  const marker = () => {
    if (!done || guess === null) return null
    const kind = guessMarkerFor(guess)
    const cx = 214
    const cy = 105
    const text1 = 'YOUR GUESS (a marker only):'
    const text2 = outcomeSentences[guess]
    return (
      <g>
        <line x1={cx + 20} y1={cy} x2={246} y2={cy} stroke={GUESS_COLOR} strokeWidth={1.5} strokeDasharray="4 3" />
        {kind === 'level' && (
          <>
            <line x1={cx - 20} y1={cy - 5} x2={cx + 20} y2={cy - 5} stroke={GUESS_COLOR} strokeWidth={4} />
            <line x1={cx - 20} y1={cy + 5} x2={cx + 20} y2={cy + 5} stroke={GUESS_COLOR} strokeWidth={4} />
          </>
        )}
        {kind === 'toEarthBar' && (
          <>
            <line x1={cx} y1={cy + 14} x2={cx} y2={cy - 8} stroke={GUESS_COLOR} strokeWidth={4} />
            <polygon points={`${cx - 10},${cy - 6} ${cx + 10},${cy - 6} ${cx},${cy - 20}`} fill={GUESS_COLOR} />
          </>
        )}
        {kind === 'toTravelerBar' && (
          <>
            <line x1={cx} y1={cy - 14} x2={cx} y2={cy + 8} stroke={GUESS_COLOR} strokeWidth={4} />
            <polygon points={`${cx - 10},${cy + 6} ${cx + 10},${cy + 6} ${cx},${cy + 20}`} fill={GUESS_COLOR} />
          </>
        )}
        <rect x={246} y={cy - 18} width={236} height={36} fill="#0b1020" stroke={GUESS_COLOR} strokeWidth={2} rx={3} />
        <text x={254} y={cy - 3} fill={GUESS_COLOR} fontSize="12" fontWeight="bold">
          {text1}
        </text>
        <text x={254} y={cy + 12} fill={GUESS_COLOR} fontSize="12" fontWeight="bold">
          {text2}
        </text>
      </g>
    )
  }

  return (
    <svg width={B.width} height={B.height} viewBox={`0 0 ${B.width} ${B.height}`} style={svgStyle} role="img" aria-label={label}>
      <text x={14} y={24} fill={pink ? YOURS_COLOR : TEXT_COLOR} fontSize="13" fontWeight="bold">
        {title}
      </text>
      {/* a dashed line joins the two bars where both clocks start together */}
      <line x1={px(0)} y1={EARTH_Y} x2={px(0)} y2={TRAVELER_Y + BAR_H} stroke={MUTED_COLOR} strokeWidth={1.5} strokeDasharray="4 4" />
      <text x={px(0)} y={EARTH_Y - 8} fill={MUTED_COLOR} fontSize="10" textAnchor="middle">
        Trip starts: both clocks read 0
      </text>

      <text x={6} y={EARTH_Y + 11} fill={TEXT_COLOR} fontSize="11" fontWeight="bold">
        The Earth twin&rsquo;s
      </text>
      <text x={6} y={EARTH_Y + 25} fill={TEXT_COLOR} fontSize="11" fontWeight="bold">
        clock (stays home)
      </text>
      <rect x={px(0)} y={EARTH_Y} width={Math.max(earthEnd - px(0), 0)} height={BAR_H} fill={EARTH_COLOR} />
      <text x={Math.max(earthEnd, px(0) + 30)} y={EARTH_Y - 8} fill={EARTH_COLOR} fontSize="12" fontWeight="bold" textAnchor="end" {...stroke}>
        {state.earthClockReading.toFixed(3)} s
      </text>

      <text x={6} y={TRAVELER_Y + 11} fill={travelerColor} fontSize="11" fontWeight="bold">
        The traveling twin&rsquo;s
      </text>
      <text x={6} y={TRAVELER_Y + 25} fill={travelerColor} fontSize="11" fontWeight="bold">
        clock (goes and returns)
      </text>
      <rect x={px(0)} y={TRAVELER_Y} width={Math.max(travelerEnd - px(0), 0)} height={BAR_H} fill={travelerColor} />
      <text x={Math.max(travelerEnd, px(0) + 30)} y={TRAVELER_Y + BAR_H + 15} fill={travelerColor} fontSize="12" fontWeight="bold" textAnchor="middle" {...stroke}>
        {state.travelerClockReading.toFixed(3)} s
      </text>

      {done && (
        <g>
          <line x1={earthEnd} y1={EARTH_Y} x2={earthEnd} y2={GAP_Y} stroke={MUTED_COLOR} strokeWidth={1.5} strokeDasharray="4 4" />
          <line x1={travelerEnd} y1={GAP_Y} x2={earthEnd} y2={GAP_Y} stroke={TEXT_COLOR} strokeWidth={2} />
          <line x1={travelerEnd} y1={GAP_Y - 6} x2={travelerEnd} y2={GAP_Y + 6} stroke={TEXT_COLOR} strokeWidth={2} />
          <line x1={earthEnd} y1={GAP_Y - 6} x2={earthEnd} y2={GAP_Y + 6} stroke={TEXT_COLOR} strokeWidth={2} />
          <text x={earthEnd} y={GAP_Y + 18} fill={TEXT_COLOR} fontSize="12" fontWeight="bold" textAnchor="end" {...stroke}>
            The gap: {state.gap.toFixed(3)} s
          </text>
          <text x={B.left} y={GAP_Y - 6} fill={MUTED_COLOR} fontSize="10">
            Trip ends: the twins meet again
          </text>
        </g>
      )}

      <line x1={B.left} y1={AXIS_Y} x2={B.right} y2={AXIS_Y} stroke={MUTED_COLOR} strokeWidth={2} />
      {[0, scaleEnd].map((t, i) => (
        <g key={i}>
          <line x1={px(t)} y1={AXIS_Y - 5} x2={px(t)} y2={AXIS_Y + 5} stroke={MUTED_COLOR} />
          <text x={px(t)} y={AXIS_Y + 18} fill={MUTED_COLOR} fontSize="10" textAnchor={i === 0 ? 'start' : 'end'}>
            {parseFloat(t.toFixed(3))} s
          </text>
        </g>
      ))}
      <text x={14} y={B.height - 6} fill={MUTED_COLOR} fontSize="10">
        clock reading in seconds, one scale for both bars (it ends at the Earth twin&rsquo;s total)
      </text>
      {/* white: the learner's guess, joined to a box; it only points, it never moves a bar */}
      {marker()}
    </svg>
  )
}

export const paragraph = { marginTop: 0, marginBottom: '0.75rem' } as const
export const smallNote = { fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.25rem' } as const

export function Block({ children }: { children: ReactNode }) {
  return <div style={{ marginTop: '1rem' }}>{children}</div>
}

export function WhereFrom({ children }: { children: ReactNode }) {
  return (
    <p style={{ marginTop: '0.5rem', marginBottom: 0, fontSize: '0.75rem' }}>
      <strong>Where the real picture comes from.</strong> {children}
    </p>
  )
}

export function GuessTag() {
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

export type CaptionStage = 'before' | 'done'

// The caption. Before the trip ends it names the picture and its parts and gives no number that is an answer; the worked
// moment and the "What to look for" items appear when the bars have stopped and the gap is drawn (CLAUDE.md §12, §14).
export function TwinBarsCaption({
  name,
  result,
  stage,
  guesses,
  pink,
}: {
  name: string
  result: TwinParadoxResult
  stage: CaptionStage
  guesses: boolean
  pink: boolean
}) {
  const w = twinWorkedNumbers(result.distance, result.velocity)
  const f = (n: number) => n.toFixed(3)
  const items = [
    {
      look: 'the two bar ends.',
      means: `The Earth twin’s clock reads ${f(result.labElapsedTime)} s and the traveling twin’s clock reads ${f(result.travelerElapsedTime)} s.`,
      matters: 'Two clocks that started together, brought back to the same place, disagree. That is what the paradox is about.',
    },
    {
      look: 'the bracket called “The gap”.',
      means: `${f(result.ageDifference)} s separates the two readings.`,
      matters: 'It is a real difference that both twins can read when they meet again. It is not a matter of point of view.',
    },
  ]
  if (guesses) {
    items.push({
      look: 'the white marker and the two bars.',
      means: 'The marker shows the choice you made. Its shape is only a marker, not the size of the real gap.',
      matters: 'It puts what you expected beside what was drawn.',
    })
  }
  if (pink) {
    items.length = 0
    items.push(
      {
        look: 'the gap in each run in “Runs so far”.',
        means: 'Here, the gap for the speed you chose is ' + `${f(result.ageDifference)} s. It is bigger at higher speeds and smaller at lower ones.`,
        matters: 'It shows how the difference you saw in Part 1 depends on how fast the traveling twin goes.',
      },
      {
        look: 'which bar is shorter in every run.',
        means: 'The traveling twin’s clock is the shorter one, at every speed you try.',
        matters: 'The traveling twin’s clock counts less, whatever the speed. Only the size of the difference changes.',
      }
    )
  }
  return (
    <CaptionBox>
      <p style={{ marginTop: 0, marginBottom: '0.5rem' }}>
        <strong>How to read {name}.</strong>
      </p>
      <ul style={{ margin: 0, paddingLeft: '1.25rem' }}>
        <li>
          <strong>The picture.</strong> Two clocks drawn as bars. The longer a bar, the more time that twin&rsquo;s clock has counted
          since the trip began, in seconds. Both bars use the same scale.
        </li>
        <li>
          <strong>The blue bar</strong> is the Earth twin&rsquo;s clock, which stays home.{' '}
          {pink ? (
            <>
              <strong>The pink bar</strong> is the traveling twin&rsquo;s clock, and pink is your speed.
            </>
          ) : (
            <>
              <strong>The purple bar</strong> is the traveling twin&rsquo;s clock.
            </>
          )}{' '}
          They start together at 0 and grow while the trip runs. A <strong>light-second</strong> is how far light goes in one
          second (about 300,000 km), and the trip goes {result.distance} light-seconds out and {result.distance} back. A speed such
          as {result.velocity}c means {result.velocity} times the speed of light.
        </li>
        <li>
          <strong>How it plays.</strong> Both bars grow together until the traveling twin gets home. Playback speed only changes
          how long the drawing takes, not what it shows.
        </li>
        <li>
          <strong>The bracket</strong> appears when the trip ends. It joins the two bar ends, and its length is how far apart the
          two clocks&rsquo; readings are. A bracket of length 0 would mean the same age.
        </li>
        {!pink && guesses && (
          <li>
            <strong>The white marker and the YOUR GUESS box</strong> appear with the bracket. A level mark means &ldquo;same
            age&rdquo;, an arrow up means &ldquo;the Earth twin is older&rdquo; and an arrow down means &ldquo;the traveling twin
            is older&rdquo;. It is only a marker: it has no size, and it never moves a bar.
          </li>
        )}
      </ul>
      {stage === 'done' && (
        <>
          <p style={{ marginBottom: '0.5rem' }}>
            <strong>A worked moment.</strong> At {result.velocity}c, the trip out takes {result.distance} ÷ {result.velocity} ={' '}
            {parseFloat(w.oneWayLabTime.toFixed(3))} s, and the trip back takes the same, so the Earth twin&rsquo;s clock reads{' '}
            {f(w.roundTripLabTime)} s. The traveling twin&rsquo;s clock ticks {f(w.factor)} as fast, so it reads{' '}
            {parseFloat(w.roundTripLabTime.toFixed(3))} × {f(w.factor)} = {f(w.travelerElapsedTime)} s. The gap is{' '}
            {f(w.roundTripLabTime)} − {f(w.travelerElapsedTime)} = {f(w.gap)} s.
          </p>
          <p style={{ marginTop: 0, marginBottom: '0.5rem' }}>
            <strong>What to look for.</strong>
          </p>
          <LookForList items={items} />
        </>
      )}
    </CaptionBox>
  )
}
