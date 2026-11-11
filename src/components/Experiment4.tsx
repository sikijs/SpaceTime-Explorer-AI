import { useCallback, useEffect, useRef, useState, type ReactNode } from 'react'
import {
  guessPositionOnTickBars,
  lightClockStateAt,
  restClockAtRunEnd,
  runLightClockExperiment,
  tickBarsScaleEnd,
  MIRROR_SEPARATION,
  REST_TICK_DURATION,
} from '../physics/lightClockExperiment'
import type { LightClockExperimentResult, LightClockState } from '../physics/lightClockExperiment'
import { Experiment4Tutor } from './Experiment4Tutor'
import { WhyTimeDilationSection } from './LightClockWhy'
import { ReferencePanel } from './EnergyMomentumExperiment'
import { MUTED_COLOR, PartHeader, TEXT_COLOR, YOURS_COLOR, svgStyle } from './GravitationalWaveExperiment'
import { LookForList } from './WideBinariesExperiment'

// Relativity of Time and Motion, Experiment 4, audited to the newer rules (docs/audit/relativity-of-time-and-motion/
// 04-draft-wording.md, approved by the owner on 2026-11-08 "all defaults"): the page in four Parts, labels on the canvas, two
// tick bars with a white YOUR GUESS mark on the moving clock's bar, a pink Drawing A for the learner's own speed in Part 2,
// captions, a words box, a link, Start over and a tutor that points to the mark. Every number drawn comes from the physics
// module (src/physics/lightClockExperiment.ts; CLAUDE.md §9). The wording is the owner's to approve line by line (CLAUDE.md §28.1).

// Part 1 uses this fixed speed; Part 2 lets the learner choose others.
export const PART1_VELOCITY = 0.5
const VELOCITY_PRESETS = [0.1, 0.3, 0.5, 0.8] as const
const GUESS_COLOR = '#ffffff' // white: the learner's guess, and nothing else (CLAUDE.md §14)
const REST_COLOR = '#3b82f6' // blue: the rest clock
const MOVING_COLOR = '#f59e0b' // amber: the moving clock

type VelocityOption = 0.1 | 0.3 | 0.5 | 0.8 | 'other'
type RunStatus = 'idle' | 'running' | 'complete'

// Playback only: real milliseconds shown per lab second. Never affects the physical result.
const PLAYBACK_MS_PER_LAB_SECOND = 2000

// Drawing constants (SVG units). Distances from the model are in light-seconds.
const VIEW_WIDTH = 200
const VIEW_HEIGHT = 252
const CENTER_Y = 115
const MIRROR_WIDTH_LS = 0.4
const MAX_PX_PER_LS = 280
const DRAW_MARGIN = 15
// When the moving clock travels far in one tick (high speeds), the drawing would become tiny in a
// square box. Above this distance the panels are stacked and drawn in a wider box instead.
const WIDE_THRESHOLD_LS = 2.5
const WIDE_VIEW_WIDTH = 720

// Same clock look as Experiment 3.
const clockBoxStyle = {
  fontSize: '2.5rem',
  fontFamily: 'monospace',
  fontWeight: 'bold' as const,
  padding: '1rem 0.5rem',
  textAlign: 'center' as const,
  marginBottom: '0.75rem',
}

export function formatClockReading(seconds: number): string {
  const tenths = Math.round(seconds * 10)
  const whole = Math.floor(tenths / 10)
  const minutes = Math.floor(whole / 60)
  const secs = whole % 60
  return `${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}.${tenths % 10}`
}

const round3 = (n: number) => parseFloat(n.toFixed(3))

function isWideRun(geometry: LightClockExperimentResult): boolean {
  return geometry.sidewaysDistancePerTick > WIDE_THRESHOLD_LS
}

function viewWidthFor(geometry: LightClockExperimentResult): number {
  return isWideRun(geometry) ? WIDE_VIEW_WIDTH : VIEW_WIDTH
}

// Both panels share one scale so the two light paths can be compared by eye.
function pixelsPerLightSecond(geometry: LightClockExperimentResult): number {
  return Math.min(
    MAX_PX_PER_LS,
    (viewWidthFor(geometry) - 2 * DRAW_MARGIN) / (geometry.sidewaysDistancePerTick + MIRROR_WIDTH_LS)
  )
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

// Pages fetched and read on 8 November 2026 (see the audit's draft wording, section 2). No plain NASA, ESA, NIST or CERN page was
// found for "light-second", "reference frame", time dilation or the light clock (CLAUDE.md §29 rule 3(c)); the Einstein-Online page
// is from a research institute's education portal. Since the owner chose on 2026-11-08 to explain the whole reason in the
// introduction, that page no longer gives anything away, so it is listed from the start.
const PLAIN_LINKS = [
  {
    href: 'https://science.nasa.gov/universe/exoplanets/our-milky-way-galaxy-how-big-is-space/',
    label: 'NASA Science: "Our Milky Way Galaxy: How Big is Space?"',
    what: 'a short, friendly article on how fast light travels, 186,000 miles (300,000 kilometers) every second, and how far it goes in a minute, a year and more. (NASA Science, Exoplanet Exploration Program; updated April 2024.)',
  },
  {
    href: 'https://www.einstein-online.info/en/spotlight/light-clocks-time-dilation/',
    label: 'Einstein Online: "From light clocks to time dilation"',
    what: 'the same light clock, explained again in plain words with no algebra, including the basic idea (a postulate) that light\'s speed is the same for everyone. (Max Planck Institute for Gravitational Physics, Einstein Online, 2021.)',
  },
]

// The "Words and formulas" box: terms only, no formula (the specification keeps the algebra out of this experiment).
const REFERENCE_ENTRIES: { term: string; meaning: string }[] = [
  { term: 'Light clock', meaning: 'a clock made of two mirrors facing each other, with a flash of light bouncing between them. It counts each round trip of the flash.' },
  { term: 'Tick', meaning: 'one round trip of the flash, up to the top mirror and back. The clock counts ticks to measure time.' },
  { term: 'Mirror', meaning: 'a flat shiny surface that bounces light back.' },
  { term: 'Light pulse', meaning: 'a very short flash of light.' },
  { term: 'Light-second', meaning: 'the distance light travels in one second, about 300,000 km.' },
  { term: 'Lab seconds', meaning: 'seconds counted by the clocks standing still in the lab.' },
  { term: 'Lab time', meaning: 'the time shown on the lab’s clocks.' },
  { term: 'Reference frame', meaning: 'a group of people and clocks that are all standing still relative to one another, so that none moves compared with the others.' },
  { term: 'At rest / moving', meaning: 'standing still, or not standing still, compared with the lab.' },
  { term: 'Sideways', meaning: 'across the light’s up-and-down path, not along it.' },
  { term: 'Right triangle', meaning: 'a triangle with one square corner, like the corner of a sheet of paper.' },
  { term: 'Diagonal', meaning: 'the slanted long side of a right triangle, opposite the square corner. It is always longer than either of the other two sides.' },
  { term: 'Postulate', meaning: 'a starting point that a theory is built on. Light travelling at the same speed for everyone is one of the two postulates of Einstein’s special relativity.' },
  { term: 'Formula', meaning: 'the rule for right triangles: each short side multiplied by itself, added together, equals the long side multiplied by itself. Worked example: 3 × 3 + 4 × 4 = 9 + 16 = 25 = 5 × 5.' },
  { term: 'c', meaning: 'the speed of light, about 300,000 km every second. 0.5c is half of that.' },
  { term: 'Time dilation', meaning: 'the name for a moving clock counting less time than the lab’s clock between the same two events (found in “A moving clock”).' },
]

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

interface LightClockPanelProps {
  title: string
  readingNote: string
  drawingTitle: string
  geometry: LightClockExperimentResult
  state: LightClockState
  moving: boolean
}

// Draws what the physics model reports at the current lab time; no physics is calculated here.
export function LightClockPanel({ title, readingNote, drawingTitle, geometry, state, moving }: LightClockPanelProps) {
  const scale = pixelsPerLightSecond(geometry)
  const wide = isWideRun(geometry)
  const viewWidth = viewWidthFor(geometry)
  const L = geometry.mirrorSeparation
  const sideways = moving ? geometry.sidewaysDistancePerTick : 0
  const phase = moving ? state.movingPhase : state.restPhase
  const ownReading = moving ? state.movingClockReading : state.restClockReading
  const pulseHeightNow = moving ? state.movingPulseHeight : state.restPulseHeight
  const offsetNow = moving ? state.movingSidewaysOffset : 0

  const bottomY = CENTER_Y + (L * scale) / 2
  const topY = CENTER_Y - (L * scale) / 2
  const drawWidth = (sideways + MIRROR_WIDTH_LS) * scale
  const startX = (viewWidth - drawWidth) / 2 + (MIRROR_WIDTH_LS / 2) * scale
  const currentX = startX + offsetNow * scale
  const halfMirror = (MIRROR_WIDTH_LS / 2) * scale
  const pulseY = bottomY - pulseHeightNow * scale
  const showStart = moving && sideways * scale > 4
  // The "start" labels are drawn once the clock has moved far enough from them to be told apart.
  const showStartLabels = showStart && Math.abs(currentX - startX) > 45
  const pulseLabelLeft = currentX > viewWidth - 80
  // Beside the pulse; when the pulse is at a mirror, the label moves clear of the mirror and the dashed start line.
  const pulseLabelY = Math.abs(pulseY - bottomY) < 16 ? pulseY - 12 : Math.abs(pulseY - topY) < 16 ? pulseY + 18 : pulseY + 4

  const trace: Array<[number, number]> = [[startX, bottomY]]
  if (phase > 0.5) trace.push([startX + (sideways / 2) * scale, topY])
  trace.push([currentX, pulseY])

  // A stacked (wide) panel gets a definite width, so its height is worked out at that width and the next panel is not drawn over it.
  return (
    <div style={{ textAlign: 'center', flex: wide ? 'none' : '1 1 200px', minWidth: 0, width: wide ? '100%' : undefined }}>
      <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)', marginBottom: '0.5rem' }}>{title}</p>
      <div className="clock-readout" style={{ ...clockBoxStyle, marginBottom: '0.25rem' }}>
        {formatClockReading(ownReading)}
      </div>
      <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', margin: '0 0 0.5rem' }}>{readingNote}</p>
      <div style={{ backgroundColor: '#d9ecff', borderRadius: '6px', padding: '0.5rem' }}>
        <svg className="narrow-scroll"
          viewBox={`0 0 ${viewWidth} ${VIEW_HEIGHT}`}
          role="img"
          aria-label={`${drawingTitle}: light pulse travelling between two mirrors`}
          style={{ width: '100%', maxWidth: wide ? '100%' : '220px', height: 'auto' }}
        >
          {/* The title is split at its colon onto two lines, so it is not cut off at the edges of the narrow drawing. */}
          <text x={viewWidth / 2} y={14} textAnchor="middle" fontSize="11" fontWeight="bold" fill="#222">
            {drawingTitle.split(': ').map((line, i, lines) => (
              <tspan key={i} x={viewWidth / 2} dy={i === 0 ? 0 : 12}>
                {i < lines.length - 1 ? `${line}:` : line}
              </tspan>
            ))}
          </text>
          {showStart && (
            <>
              <line
                x1={startX - halfMirror}
                y1={topY}
                x2={startX + halfMirror}
                y2={topY}
                stroke="#999"
                strokeWidth="2"
                strokeDasharray="4 3"
              />
              <line
                x1={startX - halfMirror}
                y1={bottomY}
                x2={startX + halfMirror}
                y2={bottomY}
                stroke="#999"
                strokeWidth="2"
                strokeDasharray="4 3"
              />
            </>
          )}
          {showStartLabels && (
            <>
              <text x={startX} y={topY - 24} textAnchor="middle" fontSize="10" fill="#666">
                start
              </text>
              <text x={startX} y={bottomY + 32} textAnchor="middle" fontSize="10" fill="#666">
                start
              </text>
            </>
          )}
          <polyline points={trace.map(([x, y]) => `${x},${y}`).join(' ')} fill="none" stroke="#e6a700" strokeWidth="2" />
          <line x1={currentX - halfMirror} y1={topY} x2={currentX + halfMirror} y2={topY} stroke="#333" strokeWidth="6" />
          <line x1={currentX - halfMirror} y1={bottomY} x2={currentX + halfMirror} y2={bottomY} stroke="#333" strokeWidth="6" />
          <circle cx={currentX} cy={pulseY} r="6" fill="#e6a700" />
          <text x={currentX} y={topY - 10} textAnchor="middle" fontSize="10" fontWeight="bold" fill="#222">
            Top mirror
          </text>
          <text x={currentX} y={bottomY + 18} textAnchor="middle" fontSize="10" fontWeight="bold" fill="#222">
            Bottom mirror
          </text>
          <text
            x={pulseLabelLeft ? currentX - 10 : currentX + 10}
            y={pulseLabelY}
            textAnchor={pulseLabelLeft ? 'end' : 'start'}
            fontSize="10"
            fontWeight="bold"
            fill="#7a5600"
          >
            Light pulse
          </text>
          <line x1={10} y1={VIEW_HEIGHT - 26} x2={30} y2={VIEW_HEIGHT - 26} stroke="#e6a700" strokeWidth="2" />
          <text x={36} y={VIEW_HEIGHT - 22} fontSize="10" fill="#444">
            Path of the light
          </text>
          {showStart && (
            <>
              <line x1={10} y1={VIEW_HEIGHT - 10} x2={30} y2={VIEW_HEIGHT - 10} stroke="#999" strokeWidth="2" strokeDasharray="4 3" />
              <text x={36} y={VIEW_HEIGHT - 6} fontSize="10" fill="#444">
                Where the mirrors started
              </text>
            </>
          )}
        </svg>
      </div>
    </div>
  )
}

// The pair of panels, with the lab-time readout above them.
export function LightClockPanels({
  geometry,
  labTime,
  running,
  movingTitle,
}: {
  geometry: LightClockExperimentResult
  labTime: number
  running: boolean
  movingTitle: string
}) {
  const state = lightClockStateAt(geometry, Math.max(labTime, 0))
  // A reading is not a tick length: say when it was read (the bars below show tick lengths, in lab seconds).
  const finished = labTime >= geometry.movingTickDuration - 1e-9
  const readingNote = running ? 'reading now' : finished ? 'reading when the run ended' : 'reading at the start'
  return (
    <div>
      <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)' }}>
        {running ? 'Running...' : 'At rest'} · Lab time: <strong>{labTime.toFixed(3)} s</strong>
      </p>
      <div
        style={{
          display: 'flex',
          flexDirection: isWideRun(geometry) ? 'column' : 'row',
          flexWrap: 'wrap',
          justifyContent: 'space-around',
          gap: '1rem',
        }}
      >
        <LightClockPanel title="Rest Clock" readingNote={readingNote} drawingTitle="Rest clock: at rest in the lab" geometry={geometry} state={state} moving={false} />
        <LightClockPanel title="Moving Clock" readingNote={readingNote} drawingTitle={movingTitle} geometry={geometry} state={state} moving />
      </div>
    </div>
  )
}

// ---- The two tick bars (Part 1's picture, and Drawing A in Part 2 with a pink moving bar) ----
const B = { width: 580, left: 96, right: 540, height: 214 }
const REST_BAR_Y = 34
const MOVING_BAR_Y = 114
const BAR_H = 22
const AXIS_Y = 170

export function TickBars({
  experiment,
  basis,
  pink,
  guess,
  label,
}: {
  experiment: LightClockExperimentResult
  basis: 'rest' | 'moving'
  pink: boolean
  guess: number | null
  label: string
}) {
  const scaleEnd = tickBarsScaleEnd(experiment, basis)
  const px = (seconds: number) => B.left + (seconds / scaleEnd) * (B.right - B.left)
  const movingColor = pink ? YOURS_COLOR : MOVING_COLOR
  const mark = guess !== null ? guessPositionOnTickBars(experiment, guess) : null
  const restEnd = px(experiment.restTickDuration)
  const movingEnd = px(experiment.movingTickDuration)
  const stoppedX = px(restClockAtRunEnd(experiment).reading)
  const stroke = { stroke: '#0b1020', strokeWidth: 4, paintOrder: 'stroke' } as const
  const tickMark = basis === 'rest' ? experiment.restTickDuration : experiment.movingTickDuration

  const guessMark = () => {
    if (!mark || guess === null) return null
    const markX = B.left + mark.fraction * (B.right - B.left)
    const text = `YOUR GUESS: ${guess} seconds${mark.offEdge ? ' (off the scale)' : ''}`
    const boxWidth = Math.max(150, text.length * 8 + 16)
    const boxX = Math.min(Math.max(markX - boxWidth / 2, 4), B.width - boxWidth - 4)
    const boxY = 76
    const barMid = MOVING_BAR_Y + BAR_H / 2
    return (
      <g>
        <line x1={markX} y1={boxY + 22} x2={markX} y2={barMid} stroke={GUESS_COLOR} strokeWidth={1.5} />
        {mark.offEdge === null ? (
          <circle cx={markX} cy={barMid} r={7} fill={GUESS_COLOR} stroke="#0b1020" strokeWidth={1.5} />
        ) : (
          <polygon
            points={
              mark.offEdge === 'right'
                ? `${markX + 12},${barMid} ${markX},${barMid - 9} ${markX},${barMid + 9}`
                : `${markX - 12},${barMid} ${markX},${barMid - 9} ${markX},${barMid + 9}`
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
    <svg className="narrow-scroll" width={B.width} height={B.height} viewBox={`0 0 ${B.width} ${B.height}`} style={svgStyle} role="img" aria-label={label}>
      {/* the lab time when the run stopped: the end of the moving bar, and what the rest clock read (the rest bar ends before it) */}
      <line x1={stoppedX} y1={REST_BAR_Y - 8} x2={stoppedX} y2={MOVING_BAR_Y + BAR_H + 6} stroke={TEXT_COLOR} strokeWidth={1.5} strokeDasharray="3 3" />
      <text x={stoppedX} y={20} fill={TEXT_COLOR} fontSize="11" fontWeight="bold" textAnchor="middle" {...stroke}>
        run stopped: lab time {experiment.movingTickDuration.toFixed(3)} s
      </text>
      {/* a dashed line joins the two bars where both pulses leave the bottom mirror together */}
      <line x1={px(0)} y1={REST_BAR_Y} x2={px(0)} y2={MOVING_BAR_Y + BAR_H} stroke={MUTED_COLOR} strokeWidth={1.5} strokeDasharray="4 4" />

      <text x={4} y={REST_BAR_Y + 16} fill={TEXT_COLOR} fontSize="12" fontWeight="bold">
        Rest clock
      </text>
      <rect x={px(0)} y={REST_BAR_Y} width={restEnd - px(0)} height={BAR_H} fill={REST_COLOR} />
      <text x={restEnd} y={REST_BAR_Y + BAR_H + 15} fill={TEXT_COLOR} fontSize="12" fontWeight="bold" textAnchor="middle" {...stroke}>
        one tick: {experiment.restTickDuration.toFixed(3)} s
      </text>

      <text x={4} y={MOVING_BAR_Y + 16} fill={movingColor} fontSize="12" fontWeight="bold">
        Moving clock
      </text>
      <rect x={px(0)} y={MOVING_BAR_Y} width={movingEnd - px(0)} height={BAR_H} fill={movingColor} />
      <text x={movingEnd} y={MOVING_BAR_Y + BAR_H + 16} fill={movingColor} fontSize="12" fontWeight="bold" textAnchor="middle" {...stroke}>
        one tick: {experiment.movingTickDuration.toFixed(3)} s
      </text>

      <line x1={B.left} y1={AXIS_Y} x2={B.right} y2={AXIS_Y} stroke={MUTED_COLOR} strokeWidth={2} />
      {[0, tickMark, scaleEnd].map((t, i) => (
        <g key={i}>
          <line x1={px(t)} y1={AXIS_Y - 5} x2={px(t)} y2={AXIS_Y + 5} stroke={MUTED_COLOR} />
          <text x={px(t)} y={AXIS_Y + 18} fill={MUTED_COLOR} fontSize="10" textAnchor={i === 0 ? 'start' : i === 2 ? 'end' : 'middle'}>
            {round3(t)} s
          </text>
        </g>
      ))}
      <text x={14} y={B.height - 6} fill={MUTED_COLOR} fontSize="10">
        one tick of each clock, in lab seconds (0 s: both pulses leave the bottom mirror together)
      </text>
      {/* white: the learner's guess, placed on the same scale; a number has a position, so the mark follows it */}
      {guessMark()}
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

// Shown from the start: only what is drawn before the run.
export function PanelsCaption() {
  return (
    <CaptionBox>
      <p style={{ marginTop: 0, marginBottom: '0.5rem' }}>
        <strong>How to read the two light clocks.</strong>
      </p>
      <ul style={{ margin: 0, paddingLeft: '1.25rem' }}>
        <li>
          <strong>Two panels</strong> show the same kind of clock. The left, the <strong>Rest clock</strong>, stands still in the lab.
          The right, the <strong>Moving clock</strong>, moves sideways, seen from the lab.
        </li>
        <li>
          <strong>In each panel,</strong> the two black bars are the <strong>mirrors</strong>, one above the other. The yellow dot is
          the <strong>light pulse</strong>, and the yellow line is the <strong>path</strong> it has taken so far. The two panels use
          the same scale, so you can compare the paths by eye.
        </li>
        <li>
          <strong>The moving clock:</strong> the whole clock, the light source and both mirrors, slides sideways together. The dashed
          lines show where the mirrors started.
        </li>
        <li>
          <strong>The readouts:</strong> above the panels, &ldquo;Lab time&rdquo; is the time on the clocks standing still in the lab.
          Each panel&rsquo;s box shows that clock&rsquo;s own reading (minutes:seconds.tenths: 00:01.2 is 1.2 seconds), and the note
          under it says when it was read. A reading is not the length of a tick; the bars that appear when the run ends show tick
          lengths.
        </li>
        <li>
          <strong>When the run ends:</strong> the run lasts exactly one tick of the moving clock (one round trip of its pulse). The
          rest clock keeps ticking, so at the end it is already part-way through its second trip.
        </li>
      </ul>
    </CaptionBox>
  )
}

export function BarsCaption({
  name,
  experiment,
  guesses,
  pink,
}: {
  name: string
  experiment: LightClockExperimentResult
  guesses: boolean
  pink: boolean
}) {
  const e = experiment
  const scaleEnd = tickBarsScaleEnd(e, pink ? 'moving' : 'rest')
  const rest = e.restTickDuration.toFixed(3)
  const moving = e.movingTickDuration.toFixed(3)
  const gap = (e.movingTickDuration - e.restTickDuration).toFixed(3)
  const sample = guessPositionOnTickBars(e, 1.3)
  const items = [
    {
      look: 'the ends of the two bars.',
      means: `How long one tick took on the lab’s clocks, for each clock: ${rest} s and ${moving} s.`,
      matters: 'The question of this experiment is how long one tick of a moving light clock takes, compared with one tick of a clock that stands still.',
    },
    {
      look: 'the gap between the end of the rest bar and the end of the moving bar.',
      means: `How much longer the moving clock’s tick took: ${moving} − ${rest} = ${gap} seconds.`,
      matters: 'It makes the difference visible as a length, not only as a number.',
    },
  ]
  if (guesses) {
    items.push({
      look: 'the white YOUR GUESS mark and the end of the moving bar.',
      means: 'The gap between them, if there is one, is how far your guess was from the real tick, in seconds.',
      matters: 'It puts what you expected beside what the clock showed.',
    })
  }
  if (pink) {
    items.splice(0, 2, {
      look: 'the pink bar’s end in each run in “Runs so far”.',
      means: `How long one tick of the moving clock took for the speed you chose (here ${moving} s). Faster speeds give longer ticks.`,
      matters: 'It shows how the tick you saw in Part 1 depends on the speed.',
    })
  }
  return (
    <CaptionBox>
      <p style={{ marginTop: 0, marginBottom: '0.5rem' }}>
        <strong>How to read {name}.</strong>
      </p>
      <ul style={{ margin: 0, paddingLeft: '1.25rem' }}>
        <li>
          <strong>The bars</strong> appear when the run ends. They are a time scale in lab seconds: the further right, the longer. 0
          s is the moment both pulses left the bottom mirror, {round3(pink ? e.movingTickDuration : e.restTickDuration)} s is one tick
          of the {pink ? 'moving' : 'rest'} clock and {round3(scaleEnd)} s is twice that, so there is room to the right. The top bar
          is how long one tick of the rest clock took; the bottom bar is how long one tick of the moving clock took, both on the
          lab&rsquo;s clocks.
        </li>
        {pink ? (
          <li>
            <strong>Pink</strong> marks your own speed (the moving clock&rsquo;s bar and its number), so you can tell this drawing
            from Part 1&rsquo;s. The scale changes with the speed: it always runs to twice the moving tick, so the pink bar always
            ends halfway. &ldquo;Runs so far&rdquo; lists every run in this Part.
          </li>
        ) : (
          guesses && (
            <li>
              <strong>The white mark and the YOUR GUESS box</strong> are your guess, placed on the same scale. A white arrow at the
              edge means your guess is beyond the end of the scale. The mark is only your guess; it never moves a bar.
            </li>
          )
        )}
      </ul>
      <p style={{ marginBottom: '0.5rem' }}>
        <strong>A worked moment.</strong> At {e.velocity}c, one tick of the moving clock took {moving} s on the lab&rsquo;s clocks,
        while one tick of the rest clock took {rest} s. During that tick the moving clock slid {e.velocity} × {moving} ={' '}
        {e.sidewaysDistancePerTick.toFixed(3)} light-seconds sideways.
        {!pink &&
          guesses &&
          ` If you had guessed 1.3, your white mark would sit at 1.3 s, ${Math.abs(sample.differenceFromMoving).toFixed(3)} seconds ${sample.differenceFromMoving >= 0 ? 'to the right of' : 'to the left of'} the end of the moving bar.`}
      </p>
      <LookFor items={items} />
    </CaptionBox>
  )
}

// "Reading the clocks and the bars together": the clocks and the bars answer two different questions, so their numbers differ.
// Every number comes from the physics module (the rest clock's reading and whole ticks, the moving clock's reading, the two tick lengths).
export function ClocksAndBarsBox({ experiment }: { experiment: LightClockExperimentResult }) {
  const e = experiment
  const end = lightClockStateAt(e, e.movingTickDuration)
  const rest = restClockAtRunEnd(e)
  const restTick = e.restTickDuration.toFixed(3)
  const movingTick = e.movingTickDuration.toFixed(3)
  const restShown = formatClockReading(end.restClockReading)
  const movingShown = formatClockReading(end.movingClockReading)
  const firstTick = rest.wholeTicks === 1
  const cell = { padding: '0.35rem 0.6rem', border: '1px solid var(--border)', textAlign: 'left' } as const
  return (
    <div
      style={{
        marginTop: '0.75rem',
        padding: '0.75rem 1rem',
        fontSize: '0.875rem',
        borderLeft: '4px solid var(--accent-blue)',
        backgroundColor: 'rgba(37, 99, 235, 0.06)',
      }}
    >
      <p style={{ marginTop: 0, marginBottom: '0.5rem' }}>
        <strong>Reading the clocks and the bars together.</strong> The clocks and the bars answer two different questions. That is why
        the numbers differ.
      </p>
      <p style={{ marginTop: 0, marginBottom: '0.5rem' }}>
        <strong>Question 1, for the clocks:</strong> &ldquo;What does this clock show at the moment the run stops?&rdquo; The run stops
        the instant the moving flash gets back to its bottom mirror. At that moment the lab&rsquo;s clocks show {movingTick} seconds.
      </p>
      <p style={{ marginTop: 0, marginBottom: '0.5rem' }}>
        <strong>Question 2, for the bars:</strong> &ldquo;How long did ONE tick take, on the lab&rsquo;s clocks?&rdquo;
      </p>
      <p style={{ marginTop: 0, marginBottom: '0.5rem' }}>
        <strong>An everyday example.</strong> Start a stopwatch when a race begins. When the winner finishes, it shows 62 seconds. That
        is the stopwatch&rsquo;s <em>reading at that moment</em>. How long one lap took, say 20 seconds, is a different number, even
        though it comes from the same race. A reading says how much time has passed since the start. A tick length says how long one
        round trip took.
      </p>
      <table style={{ borderCollapse: 'collapse', margin: '0.5rem 0 0.75rem', fontSize: '0.8125rem' }}>
        <thead>
          <tr>
            <th style={cell}></th>
            <th style={cell}>The clock&rsquo;s own display when the run stops</th>
            <th style={cell}>One tick, measured on the lab&rsquo;s clocks (the bar)</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <th style={cell}>Rest clock</th>
            <td style={cell}>
              {restShown} (really {movingTick} s)
            </td>
            <td style={cell}>{restTick} s</td>
          </tr>
          <tr>
            <th style={cell}>Moving clock</th>
            <td style={cell}>{movingShown}</td>
            <td style={cell}>{movingTick} s</td>
          </tr>
        </tbody>
      </table>
      <p style={{ marginTop: 0, marginBottom: '0.5rem' }}>
        <strong>The rest clock.</strong> It stands still in the lab, so its display is just lab time. It has been running since the
        start, so when the run stops it shows {movingTick} s (the display rounds to one decimal, so you see {restShown}). That is{' '}
        {firstTick
          ? `its first tick, ${restTick} s, plus ${rest.partialTick.toFixed(3)} s of its second tick, which has already begun`
          : `${rest.wholeTicks} whole ticks of ${restTick} s each, plus ${rest.partialTick.toFixed(3)} s of the next tick, which has already begun`}
        . The bar shows only one tick: {restTick} s.
      </p>
      <p style={{ marginTop: 0, marginBottom: '0.5rem' }}>
        <strong>The moving clock.</strong> When its flash gets back, it has counted exactly one tick on its own display:{' '}
        {movingShown}. The bar shows how long that same tick lasted on the lab&rsquo;s clocks: {movingTick} s.
      </p>
      <p style={{ marginTop: 0, marginBottom: '0.5rem' }}>
        <strong>This is the important part.</strong> Look at the moving clock&rsquo;s row: {movingShown} on its own display,{' '}
        {movingTick} on the lab&rsquo;s clocks. That is one tick, measured two ways, giving two different numbers. That difference is
        time dilation. The moving bar is longer than the rest bar for the same reason.
      </p>
      <p style={{ marginTop: 0, marginBottom: 0 }}>
        <strong>One more link between the two.</strong> The lab time when the run stops ({movingTick} s, the dashed line on the bars)
        is the same number as the end of the moving bar. The rest clock&rsquo;s display shows it too (rounded to {restShown}).
      </p>
    </div>
  )
}

interface RunRecord {
  result: LightClockExperimentResult
}

interface Experiment4Props {
  onComplete?: () => void
  onTutorComplete?: () => void
}

export function Experiment4({ onComplete, onTutorComplete }: Experiment4Props) {
  const [predictionInput, setPredictionInput] = useState('')
  const [submitted, setSubmitted] = useState<number | null>(null)
  const [velocity, setVelocity] = useState<VelocityOption>(0.8)
  const [customVelocity, setCustomVelocity] = useState('')
  const [part2Runs, setPart2Runs] = useState<RunRecord[]>([])
  const [part2Experiment, setPart2Experiment] = useState<LightClockExperimentResult | null>(null)
  const part1 = useClockRunner(onComplete)
  const part2 = useClockRunner()
  const part1Ref = useRef<HTMLDivElement>(null)
  const part2Ref = useRef<HTMLDivElement>(null)

  const part1Result = runLightClockExperiment(PART1_VELOCITY)
  const part1Running = part1.status === 'running'
  const part1Done = part1.status === 'complete'
  const part2Running = part2.status === 'running'
  const part2Done = part2.status === 'complete'
  const locked = submitted !== null

  const predictionValue = predictionInput.trim() ? Number(predictionInput) : null
  const hasPrediction = predictionValue !== null && isFinite(predictionValue)

  const selectedVelocity = velocity === 'other' ? Number(customVelocity) : velocity
  const speedValid = isFinite(selectedVelocity) && selectedVelocity >= 0.01 && selectedVelocity <= 0.99
  const speedText = speedValid ? `${selectedVelocity}c` : '—'

  const hasAnythingToClear = predictionInput !== '' || locked || part1.status !== 'idle' || part2Runs.length > 0
  const startOverDisabled = !hasAnythingToClear || part1Running || part2Running

  const handleStart = () => {
    if (!hasPrediction || locked) return
    setSubmitted(predictionValue as number)
    part1.start(part1Result.movingTickDuration)
    // Bring the two clocks fully into view so the learner can watch the run.
    part1Ref.current?.scrollIntoView({ behavior: 'smooth', block: 'center' })
  }

  const handleRunPart2 = () => {
    if (!speedValid || part1Running || part2Running) return
    const run = runLightClockExperiment(selectedVelocity)
    setPart2Experiment(run)
    part2.start(run.movingTickDuration)
    part2Ref.current?.scrollIntoView({ behavior: 'smooth', block: 'center' })
  }

  // Record each finished Part 2 run once.
  useEffect(() => {
    if (part2Done && part2Experiment) {
      setPart2Runs((runs) => [...runs, { result: part2Experiment }])
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [part2Done])

  // Start over: clears the guess, the runs, the results and the tutor, and returns the page to its first state.
  const handleStartOver = () => {
    part1.reset()
    part2.reset()
    setPredictionInput('')
    setSubmitted(null)
    setVelocity(0.8)
    setCustomVelocity('')
    setPart2Runs([])
    setPart2Experiment(null)
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
  const part2Geometry = part2Experiment ?? (speedValid ? runLightClockExperiment(selectedVelocity) : null)

  return (
    <div style={{ padding: '2rem', maxWidth: '900px', margin: '0 auto' }}>
      <h2>Experiment 4 — The Light Clock: Why Time Dilation Happens</h2>

      <div className="exp-card" style={{ marginTop: '2rem', padding: '1.5rem' }}>
        <div style={{ marginBottom: '2rem', fontSize: '0.875rem', color: 'var(--text-muted)' }}>
          <p style={paragraph}>
            <strong>The question.</strong> In &ldquo;A moving clock&rdquo;, the moving clock measured less time than the lab clock.
            This effect is called <strong>time dilation</strong>. But why does it happen? What is going on inside a clock that could
            make it behave differently when it moves? To find out, we look inside the simplest clock we can build.
          </p>
          <p style={paragraph}>
            <strong>What a light clock is.</strong> Any steady, repeating process can work as a clock: a heartbeat, a dripping
            faucet, a pendulum&rsquo;s swing. A light clock is the simplest version physics can build. Two mirrors face each other,
            one above the other, and a flash of light bounces between them: up, down, up, down. One trip up and back down is one{' '}
            <strong>tick</strong>, just like one tick of an ordinary clock, and the clock counts ticks.
          </p>
          <p style={paragraph}>
            <strong>How far apart are the mirrors?</strong> Light travels about 300,000 km in one second. We place the mirrors about{' '}
            {(MIRROR_SEPARATION * 300000).toLocaleString('en-US')} km apart, which is half of that distance. So light needs half a
            second to get from one mirror to the other, and one second for the whole trip up and back. That means one tick takes
            exactly {REST_TICK_DURATION} second when the clock is standing still. Real light clocks are much smaller: with the
            mirrors only 15 cm apart, a clock would tick about a billion times a second. We use a giant clock so that the numbers are
            easy to read. The distance light travels in one second has a name: a <strong>light-second</strong>. So the mirrors are
            half a light-second apart.
          </p>
          <WhyTimeDilationSection />
          <p style={paragraph}>
            <strong>What happens.</strong> Two identical light clocks start at the same moment: in both, a flash of light leaves the
            bottom mirror together. One clock stands still in the lab, the place where the experiment is set up. The other moves{' '}
            <strong>sideways</strong>, across the light&rsquo;s up-and-down path, at a steady speed. From the lab, we watch one tick of
            each clock and draw the path the flash of light takes. In Part 1 the moving clock goes at {PART1_VELOCITY}c, which is
            half the speed of light. When the run ends, two bars appear that show how long each tick took on the lab&rsquo;s clocks.
            In Part 2 you choose any speed and run that.
          </p>
          <p style={paragraph}>
            <strong>Your job.</strong> Before you press START, predict how long one tick of the moving clock will take. Give your
            answer in <strong>lab seconds</strong>: seconds counted by the clocks standing still in the lab. A wrong guess is fine.
            Guesses are not scored. You can now work out your guess with the steps above. Then watch both clocks, try other speeds in Part 2,
            and talk it over with the tutor.
          </p>
          <p style={paragraph}>
            <strong>Your guess and the real pictures.</strong> Your guess never changes the real pictures, the clocks or the numbers:
            they come from a calculation that knows nothing about what you guessed. Your guess is drawn on the bars in white, in a box
            labelled YOUR GUESS, and it is shown again beside the results. In Part 2 the speed you choose does change the clocks and
            the drawings, and the marks it moves are pink.
          </p>
          <p style={paragraph}>
            <strong>How this differs from &ldquo;A moving clock&rdquo;.</strong> &ldquo;A moving clock&rdquo; compared two clocks
            over a longer time, to see <em>how big</em> the difference is. This experiment looks at just one tick, to see{' '}
            <em>why</em> the difference happens.
          </p>
          <p style={paragraph}>
            <strong>Some new words.</strong> The &ldquo;Words and formulas&rdquo; box below has each one, with a short plain meaning:
            light clock, tick, mirror, light pulse, light-second, lab seconds, lab time, reference frame, at rest, moving, sideways, right
            triangle, diagonal, postulate, formula, c, time dilation.
          </p>
          <p style={{ marginTop: 0, marginBottom: '0.25rem' }}>
            <strong>What we assume.</strong>
          </p>
          <ul style={{ marginTop: 0, marginBottom: 0, paddingLeft: '1.25rem' }}>
            <li>There is no gravity, and the moving clock keeps a steady speed. It never speeds up or slows down.</li>
            <li>The moving clock moves sideways, across the light&rsquo;s up-and-down path, not along it.</li>
            <li>Both clocks start together: their pulses of light leave the bottom mirror at the same moment.</li>
            <li>
              We watch both clocks from the lab. The lab is a <strong>reference frame</strong>, as in &ldquo;Two clocks at
              rest&rdquo;: a group of people and clocks that are all standing still relative to one another, with their clocks set to
              agree. <strong>Lab time</strong> is the time shown on those clocks.
            </li>
            <li>
              The moving clock is not standing still relative to the lab, so it is not part of the lab&rsquo;s reference frame. It has
              its own reference frame: the point of view of someone riding along with it. So two reference frames are involved: the
              lab&rsquo;s and the moving clock&rsquo;s.
            </li>
            <li>
              The light source (the small lamp that sends out the pulse) and both mirrors are parts of the moving clock. Seen from the
              lab, they all move together, sideways, at the same speed.
            </li>
            <li>
              <strong>c</strong> is the speed of light, about 300,000 km every second. A speed written as 0.5c is half of that.
            </li>
          </ul>
        </div>

        <ReferencePanel entries={REFERENCE_ENTRIES} />

        <div style={{ marginBottom: '2rem', fontSize: '0.875rem', color: 'var(--text-muted)' }}>
          <p style={{ marginTop: 0, marginBottom: '0.25rem' }}>
            <strong>Want to know more?</strong> Plainer-language pages are listed here. Checked on 8 November 2026. The links open in a new tab. This page has no real experimental result, so there is no paper to link.
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
          First you guess how long one tick of the moving clock will take, in lab seconds. You can now work out your guess with the steps in
          the introduction. Then you press START and watch one tick of
          each clock, with the moving clock going at {PART1_VELOCITY}c and the path of each flash of light drawn as it goes. When the
          run finishes, two bars appear that show how long each tick took on the lab&rsquo;s clocks, with your guess drawn on them in
          white.
        </PartHeader>

        <div style={{ marginBottom: '1.5rem' }}>
          <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold' }}>Make a prediction</label>
          <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)', marginBottom: '1rem' }}>
            The clock standing still ticks once every {REST_TICK_DURATION} second. The other clock moves sideways at {PART1_VELOCITY}c.
            Someone in the lab watches the light pulse in each clock, timing it with the lab&rsquo;s clocks. How many lab seconds will
            one tick of the moving clock take? Type a number.
          </p>
          <label style={{ display: 'block', fontSize: '0.875rem', marginBottom: '0.25rem', fontWeight: 'bold' }}>
            Your guess for one tick of the moving clock (lab seconds)
          </label>
          <input
            type="number"
            step="any"
            value={predictionInput}
            onChange={(e) => setPredictionInput(e.target.value)}
            disabled={locked}
            placeholder="Enter seconds"
            aria-label="Your guess for one tick of the moving clock, in lab seconds"
            className="field-input"
            style={inputStyle(locked)}
          />
          <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
            {locked
              ? `Your prediction: ${submitted} seconds. Your prediction is locked while you try other speeds. To change it, press Start over.`
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

        {/* Placed directly under START so the run is on screen the moment it begins. */}
        <div ref={part1Ref} style={{ marginTop: '2rem' }}>
          <LightClockPanels
            geometry={part1Result}
            labTime={part1.time}
            running={part1Running}
            movingTitle="Moving clock: seen from the lab"
          />
          <WhereFrom>
            Calculated here from the speed, not measured: the clock slides sideways while the flash goes up and down. The light clock
            itself is imagined: a giant clock with its mirrors half a light-second (150,000 km) apart, so that the numbers are easy to
            read. Real light clocks are much smaller. No instrument measured these ticks.
          </WhereFrom>
          <PanelsCaption />
        </div>

        {part1Done && submitted !== null ? (
          <Block>
            <TickBars
              experiment={part1Result}
              basis="rest"
              pink={false}
              guess={submitted}
              label={`The two tick bars for the run at ${PART1_VELOCITY}c: one tick of the rest clock took ${part1Result.restTickDuration.toFixed(3)} seconds, one tick of the moving clock ${part1Result.movingTickDuration.toFixed(3)} seconds, and your guess of ${submitted} seconds is in white in a box marked YOUR GUESS.`}
            />
            <WhereFrom>
              Calculated here, not measured: each tick&rsquo;s length comes from the path the flash takes. The light clock is imagined,
              as above. The white mark is only your guess, placed on the same scale.
            </WhereFrom>
            <ClocksAndBarsBox experiment={part1Result} />
            <BarsCaption name="the two tick bars" experiment={part1Result} guesses pink={false} />
          </Block>
        ) : (
          <p style={smallNote}>
            {part1Running ? 'The bars will appear when the run ends.' : 'After you press START, two bars showing how long each tick took will appear here when the run ends.'}
          </p>
        )}

        {/* ===== Part 2 ===== */}
        {part1Done && (
          <>
            <PartHeader color="#be185d" title="Part 2: Now try it yourself">
              Now you choose a speed from 0.01c to 0.99c and watch one tick of each clock at that speed. The speed you choose changes
              the clocks and the drawing in this Part, marked in pink. It does not change Part 1&rsquo;s pictures, the results in
              Part 3, or your guess.
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
                    onClick={() => setVelocity(preset)}
                    disabled={part2Running}
                    className={`toggle-button${velocity === preset ? ' is-selected' : ''}`}
                    style={{ marginRight: '0.5rem', padding: '0.5rem 1rem', fontSize: '0.875rem', opacity: part2Running ? 0.6 : 1 }}
                  >
                    {preset}c
                  </button>
                ))}
                <button
                  onClick={() => setVelocity('other')}
                  disabled={part2Running}
                  className={`toggle-button${velocity === 'other' ? ' is-selected' : ''}`}
                  style={{ padding: '0.5rem 1rem', fontSize: '0.875rem', opacity: part2Running ? 0.6 : 1 }}
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
              <p style={smallNote}>Your guess does not change these drawings, but the speed you choose does.</p>
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
                  <LightClockPanels
                    geometry={part2Geometry}
                    labTime={part2Experiment ? part2.time : 0}
                    running={part2Running}
                    movingTitle={`Moving clock at ${part2Geometry.velocity}c: seen from the lab`}
                  />
                </Block>
              ) : (
                <p style={smallNote}>Choose a speed between 0.01c and 0.99c to see the clocks.</p>
              )}
            </div>

            {lastPart2 && !part2Running ? (
              <Block>
                <TickBars
                  experiment={lastPart2.result}
                  basis="moving"
                  pink
                  guess={null}
                  label={`Drawing A: the two tick bars for your run at ${lastPart2.result.velocity}c, with the moving clock's bar in pink.`}
                />
                <WhereFrom>
                  Calculated here, not measured: each tick&rsquo;s length comes from the speed you chose and the path the flash takes.
                  The light clock is imagined, as in Part 1. No instrument measured these ticks.
                </WhereFrom>
                <ClocksAndBarsBox experiment={lastPart2.result} />
                <BarsCaption name="Drawing A" experiment={lastPart2.result} guesses={false} pink />
                <p style={{ fontSize: '0.875rem', marginBottom: 0, marginTop: '0.75rem' }}>
                  <strong>Runs so far</strong>
                </p>
                <ul style={{ fontSize: '0.875rem', marginTop: '0.25rem', paddingLeft: '1.25rem' }}>
                  {part2Runs.map((run, i) => (
                    <li key={i}>
                      {run.result.velocity}c: rest tick {run.result.restTickDuration.toFixed(3)} s, moving tick{' '}
                      {run.result.movingTickDuration.toFixed(3)} s
                    </li>
                  ))}
                </ul>
              </Block>
            ) : (
              !part2Running && (
                <p style={smallNote}>
                  Not run yet. Choose a speed and press Run your speed; the drawing for it will appear here.
                </p>
              )
            )}
          </>
        )}

        {/* ===== Part 3 ===== */}
        {part1Done && submitted !== null && (
          <>
            <PartHeader color="#0f766e" title="Part 3: The results">
              Here are the numbers from the Part 1 run, with your guess listed beside them. Nothing in this Part changes with your
              guess or with the speed you choose in Part 2.
            </PartHeader>

            <div style={{ marginBottom: '1.5rem' }}>
              <p style={{ margin: '0.5rem 0', fontSize: '0.875rem' }}>
                <strong>Moving clock speed:</strong> {part1Result.velocity}c
              </p>
              <p style={{ margin: '0.5rem 0', fontSize: '0.875rem', color: 'var(--text-muted)' }}>
                c is the speed of light. A light speed of 1.000c means exactly the speed of light. A light-second is the distance
                light travels in one second.
              </p>
            </div>

            <div style={{ marginBottom: '1.5rem', paddingTop: '1rem', borderTop: '1px solid var(--border)' }}>
              <p style={{ margin: '0.5rem 0', fontSize: '0.875rem', fontWeight: 'bold' }}>Rest clock</p>
              <p style={{ margin: '0.5rem 0', fontSize: '0.875rem' }}>
                Distance the light travels in one tick: {part1Result.restLightPath.toFixed(3)} light-seconds
              </p>
              <p style={{ margin: '0.5rem 0', fontSize: '0.875rem' }}>
                Time for one tick, on the lab&rsquo;s clocks: {part1Result.restTickDuration.toFixed(3)} s
              </p>
              <p style={{ margin: '0.5rem 0', fontSize: '0.875rem' }}>
                Light&rsquo;s speed, seen from the lab (distance ÷ time): {part1Result.lightSpeedRest.toFixed(3)}c
              </p>
            </div>

            <div style={{ marginBottom: '1.5rem', paddingTop: '1rem', borderTop: '1px solid var(--border)' }}>
              <p style={{ margin: '0.5rem 0', fontSize: '0.875rem', fontWeight: 'bold' }}>Moving clock</p>
              <p style={{ margin: '0.5rem 0', fontSize: '0.875rem' }}>
                Distance the light travels in one tick: {part1Result.movingLightPath.toFixed(3)} light-seconds
              </p>
              <p style={{ margin: '0.5rem 0', fontSize: '0.875rem' }}>
                Time for one tick, on the lab&rsquo;s clocks: {part1Result.movingTickDuration.toFixed(3)} s
                <GuessTag />
                <span style={{ marginLeft: '0.4rem', fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                  Your guess is drawn on Part 1&rsquo;s bars as the white mark.
                </span>
              </p>
              <p style={{ margin: '0.5rem 0', fontSize: '0.875rem' }}>
                Distance the clock moves sideways during one tick: {part1Result.sidewaysDistancePerTick.toFixed(3)} light-seconds
              </p>
              <p style={{ margin: '0.5rem 0', fontSize: '0.875rem' }}>
                Light&rsquo;s speed, seen from the lab (distance ÷ time): {part1Result.lightSpeedMoving.toFixed(3)}c
              </p>
            </div>

            <div style={{ marginBottom: '1rem', paddingTop: '1rem', borderTop: '1px solid var(--border)' }}>
              <p style={{ margin: '0.5rem 0', fontSize: '0.875rem' }}>
                <strong>You guessed:</strong> {submitted} seconds
              </p>
              <p style={{ margin: '0.5rem 0', fontSize: '0.875rem' }}>
                <strong>The real time for one tick of the moving clock, on the lab&rsquo;s clocks:</strong>{' '}
                {part1Result.movingTickDuration.toFixed(3)} seconds
              </p>
            </div>

            <div style={{ marginTop: '1rem', fontSize: '0.875rem' }}>
              <p style={{ marginBottom: '0.5rem' }}>
                <strong>What these results tell us.</strong>
              </p>
              <ul style={{ margin: 0, paddingLeft: '1.25rem' }}>
                <li style={{ marginBottom: '0.5rem' }}>
                  <strong>The rest clock.</strong> One tick: {part1Result.restLightPath.toFixed(3)} light-second of path in{' '}
                  {part1Result.restTickDuration.toFixed(3)} s. <em>Why it matters:</em> this clock stands still, so it is the one to
                  compare the moving clock with.
                </li>
                <li style={{ marginBottom: '0.5rem' }}>
                  <strong>The moving clock.</strong> One tick: a path of {part1Result.movingLightPath.toFixed(3)} light-seconds in{' '}
                  {part1Result.movingTickDuration.toFixed(3)} s, while the clock slid {part1Result.sidewaysDistancePerTick.toFixed(3)}{' '}
                  light-seconds sideways. <em>Why it matters:</em> the path is longer, and so is the tick.
                </li>
                <li style={{ marginBottom: '0.5rem' }}>
                  <strong>Light&rsquo;s speed, seen from the lab.</strong> Path divided by time: {part1Result.lightSpeedRest.toFixed(3)}c
                  for the rest clock and {part1Result.lightSpeedMoving.toFixed(3)}c for the moving clock.{' '}
                  <em>Why it matters:</em> the two numbers are equal, which is worth noticing; the tutor will ask you about it.
                </li>
              </ul>
            </div>
            <p style={{ ...smallNote, marginTop: '0.75rem' }}>
              <strong>Where this comes from:</strong> calculated here from the speed (see the captions under the pictures). Nothing
              here changes with your guess or with the speed you choose in Part 2.
            </p>
          </>
        )}

        {/* ===== Part 4 ===== */}
        {part1Done && submitted !== null && (
          <>
            <PartHeader color="#0066cc" title="Part 4: The tutor">
              Talk through what you saw. The tutor points to your white guess mark, then explains.
            </PartHeader>
            <Experiment4Tutor
              onExplained={onTutorComplete}
              key={`${PART1_VELOCITY}-${submitted}`}
              velocity={PART1_VELOCITY}
              prediction={submitted}
            />
          </>
        )}
      </div>
    </div>
  )
}
