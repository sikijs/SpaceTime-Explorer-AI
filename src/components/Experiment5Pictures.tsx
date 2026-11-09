import type { ReactNode } from 'react'
import {
  choiceMarker,
  guessPositionOnTickBars,
  invariantLightSpeedStateAt,
  tickBarsScaleEnd,
} from '../physics/invariantLightSpeedExperiment'
import type { InvariantLightSpeedResult, RuleChoice } from '../physics/invariantLightSpeedExperiment'
import { MUTED_COLOR, TEXT_COLOR, YOURS_COLOR, svgStyle } from './GravitationalWaveExperiment'
import { LookForList } from './WideBinariesExperiment'

// Relativity of Time and Motion, Experiment 5: the pictures (the three light clocks, the three tick bars and their captions),
// audited to the newer rules (docs/audit/relativity-of-time-and-motion/05-draft-wording.md, approved by the owner on 2026-11-09).
// Every number drawn comes from the physics module (src/physics/invariantLightSpeedExperiment.ts; CLAUDE.md §9). The wording is
// the owner's to approve line by line (CLAUDE.md §28.1).

export const GUESS_COLOR = '#ffffff' // white: the learner's guess, and nothing else (CLAUDE.md §14)
const REST_COLOR = '#3b82f6' // blue: the rest clock
const ACTUAL_COLOR = '#f59e0b' // amber: the moving clock under light's actual rule
const IMAGINED_COLOR = '#a78bfa' // violet: the moving clock under the everyday rule, which is imagined (on the dark bars)
const IMAGINED_DARK = '#6d28d9' // the same violet, darker, for the light-blue clock panels
const ACTUAL_DARK = '#b45309' // the same amber, darker, for text on the light-blue clock panels
const REST_DARK = '#1d4ed8' // the same blue, darker, for text on the light-blue clock panels

// Drawing constants (SVG units). Distances from the model are in light-seconds.
const VIEW_WIDTH = 200
const VIEW_HEIGHT = 276
const CENTER_Y = 139
const MAX_PX_PER_LS = 280
const DRAW_MARGIN = 15
const MIRROR_WIDTH_LS = 0.4
// When the moving clocks travel far in one tick (high speeds), the drawing would become tiny in a
// square box. Above this distance the panels are stacked and drawn in a wider box instead.
const WIDE_THRESHOLD_LS = 2.5
const WIDE_VIEW_WIDTH = 720

const round3 = (n: number) => parseFloat(n.toFixed(3))

export function formatClockReading(seconds: number): string {
  const tenths = Math.round(seconds * 10)
  const whole = Math.floor(tenths / 10)
  const minutes = Math.floor(whole / 60)
  const secs = whole % 60
  return `${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}.${tenths % 10}`
}

// Same clock look as Experiments 3 and 4.
// Three readouts sit side by side here, so the text is smaller than in Experiments 3 and 4 (2.5rem would run over the box).
const clockBoxStyle = {
  fontSize: '1.7rem',
  fontFamily: 'monospace',
  fontWeight: 'bold' as const,
  padding: '1rem 0.5rem',
  textAlign: 'center' as const,
  marginBottom: '0.25rem',
}

function widestSideways(geometry: InvariantLightSpeedResult): number {
  return Math.max(geometry.sidewaysDistancePerTick.everydayRule, geometry.sidewaysDistancePerTick.actualRule)
}

export function isWideRun(geometry: InvariantLightSpeedResult): boolean {
  return widestSideways(geometry) > WIDE_THRESHOLD_LS
}

function viewWidthFor(geometry: InvariantLightSpeedResult): number {
  return isWideRun(geometry) ? WIDE_VIEW_WIDTH : VIEW_WIDTH
}

// All three panels share one scale so the light paths can be compared by eye.
function pixelsPerLightSecond(geometry: InvariantLightSpeedResult): number {
  return Math.min(MAX_PX_PER_LS, (viewWidthFor(geometry) - 2 * DRAW_MARGIN) / (widestSideways(geometry) + MIRROR_WIDTH_LS))
}

interface PanelProps {
  title: string
  titleColor: string
  titleLines: string[] // drawn inside the picture, one line each, so a long title is not cut off at the edges
  readingNote: string
  geometry: InvariantLightSpeedResult
  sidewaysPerTick: number // 0 for the rest clock
  clockReading: number
  pulseHeight: number
  phase: number
  sidewaysOffset: number
  pulseColor: string
  pathLabelColor: string
}

// Draws what the physics model reports at the current lab time; no physics is calculated here.
function LightClockPanel({
  title,
  titleColor,
  titleLines,
  readingNote,
  geometry,
  sidewaysPerTick: sideways,
  clockReading,
  pulseHeight,
  phase,
  sidewaysOffset,
  pulseColor,
  pathLabelColor,
}: PanelProps) {
  const scale = pixelsPerLightSecond(geometry)
  const wide = isWideRun(geometry)
  const viewWidth = viewWidthFor(geometry)
  const L = geometry.mirrorSeparation
  const moving = sideways > 0
  const bottomY = CENTER_Y + (L * scale) / 2
  const topY = CENTER_Y - (L * scale) / 2
  const drawWidth = (sideways + MIRROR_WIDTH_LS) * scale
  const startX = (viewWidth - drawWidth) / 2 + (MIRROR_WIDTH_LS / 2) * scale
  const currentX = startX + sidewaysOffset * scale
  const halfMirror = (MIRROR_WIDTH_LS / 2) * scale
  const pulseY = bottomY - pulseHeight * scale
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
      <p style={{ fontSize: '0.875rem', color: titleColor, fontWeight: 'bold', marginBottom: '0.5rem', minHeight: '2.5em' }}>{title}</p>
      <div className="clock-readout" style={clockBoxStyle}>
        {formatClockReading(clockReading)}
      </div>
      <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', margin: '0 0 0.5rem' }}>{readingNote}</p>
      <div style={{ backgroundColor: '#d9ecff', borderRadius: '6px', padding: '0.5rem' }}>
        <svg
          viewBox={`0 0 ${viewWidth} ${VIEW_HEIGHT}`}
          role="img"
          aria-label={`${titleLines.join(' ')}: light pulse travelling between two mirrors`}
          style={{ width: '100%', maxWidth: wide ? '100%' : '220px', height: 'auto' }}
        >
          <text x={viewWidth / 2} y={14} textAnchor="middle" fontSize="11" fontWeight="bold" fill={titleColor}>
            {titleLines.map((line, i) => (
              <tspan key={i} x={viewWidth / 2} dy={i === 0 ? 0 : 12}>
                {line}
              </tspan>
            ))}
          </text>
          {showStart && (
            <>
              <line x1={startX - halfMirror} y1={topY} x2={startX + halfMirror} y2={topY} stroke="#999" strokeWidth="2" strokeDasharray="4 3" />
              <line x1={startX - halfMirror} y1={bottomY} x2={startX + halfMirror} y2={bottomY} stroke="#999" strokeWidth="2" strokeDasharray="4 3" />
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
          <polyline points={trace.map(([x, y]) => `${x},${y}`).join(' ')} fill="none" stroke={pulseColor} strokeWidth="2" />
          <line x1={currentX - halfMirror} y1={topY} x2={currentX + halfMirror} y2={topY} stroke="#333" strokeWidth="6" />
          <line x1={currentX - halfMirror} y1={bottomY} x2={currentX + halfMirror} y2={bottomY} stroke="#333" strokeWidth="6" />
          <circle cx={currentX} cy={pulseY} r="6" fill={pulseColor} />
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
            fill={pathLabelColor}
          >
            Light pulse
          </text>
          <line x1={10} y1={VIEW_HEIGHT - 26} x2={30} y2={VIEW_HEIGHT - 26} stroke={pulseColor} strokeWidth="2" />
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

// The three panels (the rest clock, and the same moving clock under the everyday rule and under light's actual rule),
// with the lab-time readout above them.
export function ThreeClockPanels({
  geometry,
  labTime,
  running,
}: {
  geometry: InvariantLightSpeedResult
  labTime: number
  running: boolean
}) {
  const state = invariantLightSpeedStateAt(geometry, Math.max(labTime, 0))
  // A reading is not a tick length: say when it was read (the bars show tick lengths, in lab seconds).
  const finished = labTime >= geometry.actualRule.movingTickDuration - 1e-9
  const readingNote = running ? 'reading now' : finished ? 'reading when the run ended' : 'reading at the start'
  return (
    <div>
      <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)' }}>
        {running ? 'Running...' : 'At rest'} · Lab time: <strong>{labTime.toFixed(3)} s</strong> · Moving clocks at{' '}
        <strong>{geometry.velocity}c</strong>
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
        <LightClockPanel
          title="Rest Clock"
          titleColor={REST_DARK}
          titleLines={['Rest clock:', 'at rest in the lab']}
          readingNote={readingNote}
          geometry={geometry}
          sidewaysPerTick={0}
          clockReading={state.restClock.clockReading}
          pulseHeight={state.restClock.pulseHeight}
          phase={state.restClock.phase}
          sidewaysOffset={0}
          pulseColor="#e6a700"
          pathLabelColor="#7a5600"
        />
        <LightClockPanel
          title="Moving Clock, everyday rule (imagined)"
          titleColor={IMAGINED_DARK}
          titleLines={['IMAGINED: moving clock,', 'everyday rule,', 'seen from the lab']}
          readingNote={readingNote}
          geometry={geometry}
          sidewaysPerTick={geometry.sidewaysDistancePerTick.everydayRule}
          clockReading={state.everydayRule.clockReading}
          pulseHeight={state.everydayRule.pulseHeight}
          phase={state.everydayRule.phase}
          sidewaysOffset={state.everydayRule.sidewaysOffset}
          pulseColor={IMAGINED_DARK}
          pathLabelColor={IMAGINED_DARK}
        />
        <LightClockPanel
          title="Moving Clock, light's actual rule"
          titleColor={ACTUAL_DARK}
          titleLines={['Moving clock,', "light's actual rule:", 'seen from the lab']}
          readingNote={readingNote}
          geometry={geometry}
          sidewaysPerTick={geometry.sidewaysDistancePerTick.actualRule}
          clockReading={state.actualRule.clockReading}
          pulseHeight={state.actualRule.pulseHeight}
          phase={state.actualRule.phase}
          sidewaysOffset={state.actualRule.sidewaysOffset}
          pulseColor="#e6a700"
          pathLabelColor="#7a5600"
        />
      </div>
    </div>
  )
}

// ---- The three tick bars (Part 1's picture, and Drawing A in Part 2 with the learner's speed in pink) ----
const B = { width: 640, left: 150, right: 600, height: 350 }
const REST_BAR_Y = 40
const EVERYDAY_BAR_Y = 130
const ACTUAL_BAR_Y = 220
const BAR_H = 22
const AXIS_Y = 270
const TAG_Y = 314

export interface TickGuesses {
  choice: RuleChoice
  everydayTick: number
  actualTick: number
}

const CHOICE_TEXT: Record<RuleChoice, string> = {
  everyday: 'the everyday rule gives the longer tick',
  actual: "light's actual rule gives the longer tick",
  same: 'both rules give the same tick',
}

export function TickBars({
  experiment,
  basis,
  pinkSpeed,
  guesses,
  label,
}: {
  experiment: InvariantLightSpeedResult
  basis: 'rest' | 'actual'
  pinkSpeed: number | null // Drawing A: the learner's own speed, written in pink
  guesses: TickGuesses | null // Part 1: the learner's three guesses, in white
  label: string
}) {
  const scaleEnd = tickBarsScaleEnd(experiment, basis)
  const px = (seconds: number) => B.left + (seconds / scaleEnd) * (B.right - B.left)
  const restEnd = px(experiment.restTickDuration)
  const everydayEnd = px(experiment.everydayRule.movingTickDuration)
  const actualEnd = px(experiment.actualRule.movingTickDuration)
  const stroke = { stroke: '#0b1020', strokeWidth: 4, paintOrder: 'stroke' } as const
  const tickMark = basis === 'rest' ? experiment.restTickDuration : experiment.actualRule.movingTickDuration

  // A number has a position, so its mark follows it (a white dot on the bar, joined by a line to a YOUR GUESS box).
  const guessMark = (rule: 'everyday' | 'actual', value: number, barY: number) => {
    const mark = guessPositionOnTickBars(experiment, rule, value)
    const markX = B.left + mark.fraction * (B.right - B.left)
    const text = `YOUR GUESS: ${value} seconds${mark.offEdge ? ' (off the scale)' : ''}`
    const boxWidth = Math.max(150, text.length * 8 + 16)
    const boxX = Math.min(Math.max(markX - boxWidth / 2, 4), B.width - boxWidth - 4)
    const boxY = barY - 40
    const barMid = barY + BAR_H / 2
    return (
      <g key={rule}>
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

  // The choice has no size or position, so it is a marker only: the label of the chosen bar is outlined in white and a white line
  // joins it to a white tag at the bottom. For "both the same" both moving bars' labels are outlined.
  const choiceMark = (choice: RuleChoice) => {
    const marker = choiceMarker(experiment, choice)
    const ys = marker.pointsAt === 'both' ? [EVERYDAY_BAR_Y, ACTUAL_BAR_Y] : marker.pointsAt === 'everyday' ? [EVERYDAY_BAR_Y] : [ACTUAL_BAR_Y]
    const top = Math.min(...ys) + BAR_H / 2
    const text = `YOUR GUESS (a marker only): ${CHOICE_TEXT[choice]}`
    const boxWidth = text.length * 7.4 + 16
    return (
      <g>
        <line x1={7} y1={TAG_Y} x2={7} y2={top} stroke={GUESS_COLOR} strokeWidth={2} />
        {ys.map((y) => (
          <g key={y}>
            <line x1={7} y1={y + BAR_H / 2} x2={12} y2={y + BAR_H / 2} stroke={GUESS_COLOR} strokeWidth={2} />
            <rect x={12} y={y - 6} width={B.left - 26} height={BAR_H + 14} fill="none" stroke={GUESS_COLOR} strokeWidth={2} rx={3} />
          </g>
        ))}
        <rect x={4} y={TAG_Y} width={boxWidth} height={26} fill="#0b1020" stroke={GUESS_COLOR} strokeWidth={2} rx={3} />
        <text x={12} y={TAG_Y + 17} fill={GUESS_COLOR} fontSize="12" fontWeight="bold">
          {text}
        </text>
      </g>
    )
  }

  return (
    <svg width={B.width} height={B.height} viewBox={`0 0 ${B.width} ${B.height}`} style={svgStyle} role="img" aria-label={label}>
      {/* the lab time when the run stopped: the end of the actual-rule bar */}
      <line x1={actualEnd} y1={REST_BAR_Y - 8} x2={actualEnd} y2={ACTUAL_BAR_Y + BAR_H + 6} stroke={TEXT_COLOR} strokeWidth={1.5} strokeDasharray="3 3" />
      <text x={actualEnd} y={20} fill={TEXT_COLOR} fontSize="11" fontWeight="bold" textAnchor="middle" {...stroke}>
        run stopped: lab time {experiment.actualRule.movingTickDuration.toFixed(3)} s
      </text>
      {pinkSpeed !== null && (
        <text x={4} y={16} fill={YOURS_COLOR} fontSize="13" fontWeight="bold">
          your speed: {pinkSpeed}c
        </text>
      )}
      {/* a dashed line joins the three bars where all three pulses leave the bottom mirror together */}
      <line x1={px(0)} y1={REST_BAR_Y} x2={px(0)} y2={ACTUAL_BAR_Y + BAR_H} stroke={MUTED_COLOR} strokeWidth={1.5} strokeDasharray="4 4" />

      <text x={16} y={REST_BAR_Y + 16} fill={TEXT_COLOR} fontSize="12" fontWeight="bold">
        Rest clock
      </text>
      <rect x={px(0)} y={REST_BAR_Y} width={restEnd - px(0)} height={BAR_H} fill={REST_COLOR} />
      <text x={restEnd} y={REST_BAR_Y + BAR_H + 15} fill={TEXT_COLOR} fontSize="12" fontWeight="bold" textAnchor="middle" {...stroke}>
        one tick: {experiment.restTickDuration.toFixed(3)} s
      </text>

      <text x={16} y={EVERYDAY_BAR_Y + 10} fill={IMAGINED_COLOR} fontSize="12" fontWeight="bold">
        IMAGINED:
      </text>
      <text x={16} y={EVERYDAY_BAR_Y + 23} fill={IMAGINED_COLOR} fontSize="12" fontWeight="bold">
        everyday rule
      </text>
      <rect x={px(0)} y={EVERYDAY_BAR_Y} width={everydayEnd - px(0)} height={BAR_H} fill={IMAGINED_COLOR} />
      <text x={everydayEnd} y={EVERYDAY_BAR_Y + BAR_H + 15} fill={IMAGINED_COLOR} fontSize="12" fontWeight="bold" textAnchor="middle" {...stroke}>
        one tick: {experiment.everydayRule.movingTickDuration.toFixed(3)} s
      </text>

      <text x={16} y={ACTUAL_BAR_Y + 10} fill={ACTUAL_COLOR} fontSize="12" fontWeight="bold">
        Light&rsquo;s actual
      </text>
      <text x={16} y={ACTUAL_BAR_Y + 23} fill={ACTUAL_COLOR} fontSize="12" fontWeight="bold">
        rule
      </text>
      <rect x={px(0)} y={ACTUAL_BAR_Y} width={actualEnd - px(0)} height={BAR_H} fill={ACTUAL_COLOR} />
      <text x={actualEnd} y={ACTUAL_BAR_Y + BAR_H + 16} fill={ACTUAL_COLOR} fontSize="12" fontWeight="bold" textAnchor="middle" {...stroke}>
        one tick: {experiment.actualRule.movingTickDuration.toFixed(3)} s
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
      <text x={14} y={AXIS_Y + 36} fill={MUTED_COLOR} fontSize="10">
        one tick of each clock, in lab seconds (0 s: all three pulses leave the bottom mirror together)
      </text>
      {/* white: the learner's guesses, placed on the same scale */}
      {guesses && guessMark('everyday', guesses.everydayTick, EVERYDAY_BAR_Y)}
      {guesses && guessMark('actual', guesses.actualTick, ACTUAL_BAR_Y)}
      {guesses && choiceMark(guesses.choice)}
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
        <strong>How to read the three light clocks.</strong>
      </p>
      <ul style={{ margin: 0, paddingLeft: '1.25rem' }}>
        <li>
          <strong>Three panels</strong> show the same kind of clock. The left, the <strong>Rest clock</strong>, stands still in the
          lab. The two on the right are the <strong>same moving clock</strong>, seen from the lab, drawn twice: the amber-titled one
          follows <strong>light&rsquo;s actual rule</strong>; the violet one, labelled <strong>IMAGINED</strong>, follows the{' '}
          <strong>everyday rule</strong> (a &ldquo;what if&rdquo;, not how light really works).
        </li>
        <li>
          <strong>In each panel,</strong> the two black bars are the <strong>mirrors</strong>, one above the other. The dot is the{' '}
          <strong>light pulse</strong>, and the line is the <strong>path</strong> it has taken so far (violet in the imagined panel,
          yellow in the other two). The three panels use the same scale, so you can compare the paths by eye.
        </li>
        <li>
          <strong>The moving clocks:</strong> the whole clock, the light source and both mirrors, slides sideways together. The dashed
          lines show where the mirrors started.
        </li>
        <li>
          <strong>The readouts:</strong> above the panels, &ldquo;Lab time&rdquo; is the time on the clocks standing still in the lab.
          Each panel&rsquo;s box shows that clock&rsquo;s own reading (minutes:seconds.tenths: 00:01.2 is 1.2 seconds), and the note
          under it says when it was read. A reading is not the length of a tick; the bars that appear when the run ends show tick
          lengths.
        </li>
        <li>
          <strong>When the run ends:</strong> the run lasts until the slower moving clock has made one round trip. The rest clock keeps
          ticking; each moving clock stops after its one tick.
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
  experiment: InvariantLightSpeedResult
  guesses: boolean
  pink: boolean
}) {
  const e = experiment
  const scaleEnd = tickBarsScaleEnd(e, pink ? 'actual' : 'rest')
  const rest = e.restTickDuration.toFixed(3)
  const everyday = e.everydayRule.movingTickDuration.toFixed(3)
  const actual = e.actualRule.movingTickDuration.toFixed(3)
  const gap = (e.actualRule.movingTickDuration - e.everydayRule.movingTickDuration).toFixed(3)
  const sample = guessPositionOnTickBars(e, 'everyday', 1.2)
  const items = pink
    ? [
        {
          look: 'the violet and amber bars in each run in “Runs so far”.',
          means: `The violet tick stays at ${everyday} s at every speed, while the amber tick grows (here ${actual} s at ${e.velocity}c; at 0.1c it is 1.005 s and at 0.8c it is 1.667 s).`,
          matters: 'It shows how the Part 1 result depends on the speed.',
        },
      ]
    : [
        {
          look: 'the right end of the blue bar.',
          means: `One tick of the clock standing still takes ${rest} s, which is our starting point.`,
          matters: 'Every other bar is compared with this one, so it shows what “no change” looks like.',
        },
        {
          look: 'the blue bar and the violet bar together.',
          means: `They end in the same place, ${rest} s and ${everyday} s. Under the everyday rule, moving the clock sideways did not change how long one tick took.`,
          matters: 'It shows what the everyday rule gives. Under that rule, a moving clock would keep the same time as a clock standing still.',
        },
        {
          look: 'the gap between the end of the violet bar and the end of the amber bar.',
          means: `Under light’s actual rule, one tick lasts ${actual} − ${everyday} = ${gap} seconds longer.`,
          matters: 'It turns the difference between the two rules into a length you can see. The tutor will help you work out why the two rules give different bars.',
        },
      ]
  if (guesses) {
    items.push({
      look: 'each white YOUR GUESS mark and the end of the bar beside it, and at the white marker tag.',
      means: 'The gap between a mark and the end of its bar is how far that guess was from the real tick, in seconds. The tag only says which rule you chose.',
      matters: 'It puts what you expected beside what the clocks showed.',
    })
  }
  return (
    <CaptionBox>
      <p style={{ marginTop: 0, marginBottom: '0.5rem' }}>
        <strong>How to read {name}.</strong>
      </p>
      <ul style={{ margin: 0, paddingLeft: '1.25rem' }}>
        <li>
          <strong>The bars</strong> appear when the run ends. They are a time scale in lab seconds: the further right, the longer.
          {pink ? (
            <>
              {' '}
              0 s is the moment all three pulses left the bottom mirror, {round3(e.actualRule.movingTickDuration)} s is one tick of
              the amber clock and {round3(scaleEnd)} s is twice that, so there is room to the right. Each bar is how long one tick of
              that clock took on the lab&rsquo;s clocks.
            </>
          ) : (
            <>
              {' '}
              Each bar is one of the three clocks, and its length is how long <strong>one tick</strong> took, timed by the
              lab&rsquo;s clocks, in lab seconds. Think of lap times on a running track: a longer bar is a longer lap, which means a
              slower clock. The left end (0 s) is the moment all three flashes left their bottom mirrors together. The right end is
              the moment that clock&rsquo;s flash got back to the bottom mirror, so one tick was finished. The scale runs to{' '}
              {round3(scaleEnd)} s, twice the rest clock&rsquo;s tick, so there is room on the right.
            </>
          )}
        </li>
        {pink ? (
          <li>
            <strong>Blue</strong> is the rest clock. <strong>Amber</strong> is the moving clock under light&rsquo;s actual rule.{' '}
            <strong>Violet</strong> is the moving clock under the everyday rule: imagined, drawn only to answer the question.
          </li>
        ) : (
          <>
            <li>
              <strong>Blue: the clock standing still.</strong> This is the baseline. Its one tick is {rest} s.
            </li>
            <li>
              <strong>Violet: the moving clock under the everyday rule.</strong> This one is imagined, drawn only to answer the
              question. Here the lamp&rsquo;s sideways speed is added to the light&rsquo;s speed. One tick is {everyday} s.
            </li>
            <li>
              <strong>Amber: the moving clock under light&rsquo;s actual rule.</strong> Here the lab always sees the light at exactly c.
              One tick is {actual} s.
            </li>
          </>
        )}
        {pink ? (
          <li>
            <strong>Pink</strong> marks your own speed, written above the bars, so you can tell this drawing from Part 1&rsquo;s. The
            scale changes with the speed: it always runs to twice the amber tick, so the amber bar always ends halfway.
            &ldquo;Runs so far&rdquo; lists every run in this Part.
          </li>
        ) : (
          guesses && (
            <li>
              <strong>The white marks and the YOUR GUESS boxes</strong> are your two tick guesses, placed on the same scale. A white
              arrow at the edge means a guess is beyond the end of the scale. The <strong>white marker tag</strong> is your choice of
              rule: it has no size, it is only a marker that points at the rule you chose. None of the white things ever moves a
              bar.
            </li>
          )
        )}
      </ul>
      <p style={{ marginBottom: '0.5rem' }}>
        <strong>A worked moment.</strong>{' '}
        {pink
          ? `At ${e.velocity}c the clock slid ${e.velocity} × ${actual} = ${e.sidewaysDistancePerTick.actualRule.toFixed(3)} light-seconds sideways during the amber tick, and one tick took ${actual} s under light’s actual rule and ${everyday} s under the everyday rule.`
          : `At ${e.velocity}c, one tick took ${rest} s for the clock standing still, ${everyday} s for the violet clock and ${actual} s for the amber clock. The light’s speed is its path divided by its time. Violet clock: the path was ${e.everydayRule.lightPath.toFixed(3)} light-seconds, covered in ${everyday} s, so ${e.everydayRule.lightPath.toFixed(3)} ÷ ${everyday} = ${e.everydayRule.lightSpeedInLab.toFixed(3)}c, because the lamp’s speed was added. Amber clock: the path was ${e.actualRule.lightPath.toFixed(3)} light-seconds, covered in ${actual} s, so ${e.actualRule.lightPath.toFixed(3)} ÷ ${actual} = ${e.actualRule.lightSpeedInLab.toFixed(3)}c.${
              guesses
                ? ` If you had guessed 1.2 s for the everyday rule, your white mark would sit at 1.2 s, ${Math.abs(sample.differenceFromReal).toFixed(3)} seconds ${sample.differenceFromReal >= 0 ? 'to the right of' : 'to the left of'} the end of the violet bar.`
                : ''
            }`}
      </p>
      <LookFor items={items} />
    </CaptionBox>
  )
}
