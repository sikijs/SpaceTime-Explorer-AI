import type { CSSProperties } from 'react'
import { guessMarkerSpeed, orderStripForEvent } from '../physics/causeBeforeEffect'
import type { PredictionAnswer } from '../physics/causeBeforeEffect'
import type { WorldlinePoint } from '../physics/spacetimeDiagramView'

// Figures A to C and E of the introduction of Spacetime Geometry 3, and the strip of observer speeds
// (docs/audit/spacetime-geometry/03-draft-wording.md, sections 1 and 4). The four figures are illustrations drawn for the introduction,
// not results. They show no event B, say nothing about which side of a line an event can be on, and give no answer to the prediction
// (CLAUDE.md §12). Figure D of the introduction is Figure C of the last experiment (ConeFigure in LightConesFigures.tsx).
// White is used only for the learner's guess on the strip (CLAUDE.md §14), never in a figure.

const SVG_STYLE: CSSProperties = {
  display: 'block',
  width: '100%',
  height: 'auto',
  border: '1px solid var(--border-color, #ccc)',
  borderRadius: '8px',
  overflow: 'hidden',
  backgroundColor: '#0b1020',
}
const TEXT_COLOR = '#e2e8f0'
const MUTED_COLOR = '#94a3b8'
const TICK_COLOR = '#cbd5e1'
const EVENT_O_COLOR = '#3b82f6'
const EVENT_B_COLOR = '#f59e0b'
const FLASH_COLOR = '#facc15'
const OBSERVER_COLOR = '#8b5cf6'
const LAB_LINE_COLOR = '#38bdf8'
const IMAGINED_COLOR = '#a5a3c9'
const GUESS_COLOR = '#ffffff'
const PART2_COLOR = '#be185d'
const HALO: CSSProperties = { paintOrder: 'stroke', stroke: '#0b1020', strokeWidth: 3 }

// ---- Figure A: a cause makes a trip ----
export function ChainFigure() {
  const x = (d: number) => 150 + d * 170
  const y = (t: number) => 215 - t * 85
  return (
    <svg
      viewBox="0 0 600 280"
      role="img"
      aria-label="Figure A: a flash is sent at time 0 from a lamp, travels 1 light-second to a switch, arrives at 1 second, and the firecracker goes off just after."
      style={SVG_STYLE}
    >
      <text x="300" y="20" textAnchor="middle" fontSize="13" fontWeight="bold" fill={TEXT_COLOR}>
        A flash sets off a firecracker
      </text>
      <line x1={x(0)} y1={y(0)} x2={x(2.1)} y2={y(0)} stroke={MUTED_COLOR} strokeWidth="2" />
      <line x1={x(0)} y1={y(0)} x2={x(0)} y2={y(2)} stroke={MUTED_COLOR} strokeWidth="2" />
      {[0, 1, 2].map((m) => (
        <g key={m}>
          <line x1={x(m)} y1={y(0) - 4} x2={x(m)} y2={y(0) + 4} stroke={TICK_COLOR} />
          <text x={x(m)} y={y(0) + 17} textAnchor="middle" fontSize="11" fill={MUTED_COLOR}>
            {m}
          </text>
          <line x1={x(0) - 4} y1={y(m)} x2={x(0) + 4} y2={y(m)} stroke={TICK_COLOR} />
          {m > 0 && (
            <text x={x(0) - 9} y={y(m) + 4} textAnchor="end" fontSize="11" fill={MUTED_COLOR}>
              {m}
            </text>
          )}
        </g>
      ))}
      <text x={x(1)} y="262" textAnchor="middle" fontSize="11" fill={TEXT_COLOR}>
        Distance from the lamp (light-seconds)
      </text>
      <text x={x(0) - 9} y={y(2) - 8} textAnchor="end" fontSize="11" fill={TEXT_COLOR}>
        Time (seconds)
      </text>
      <line x1={x(1)} y1={y(0)} x2={x(1)} y2={y(2)} stroke={MUTED_COLOR} strokeWidth="1.5" strokeDasharray="5 4" />
      <text x={x(1) + 8} y={y(2) + 10} fontSize="11" fill={MUTED_COLOR}>
        the switch, 1 light-second away
      </text>
      <line x1={x(0)} y1={y(0)} x2={x(1)} y2={y(1)} stroke={FLASH_COLOR} strokeWidth="3" />
      <rect x={x(0) - 7} y={y(0) - 7} width="14" height="14" rx="2" fill={EVENT_O_COLOR} />
      <text x={x(0) - 14} y={y(0) - 18} textAnchor="end" fontSize="12" fill={TEXT_COLOR} style={HALO}>
        Flash sent
      </text>
      <text x={x(0) - 14} y={y(0) - 5} textAnchor="end" fontSize="11" fill={MUTED_COLOR} style={HALO}>
        (the cause)
      </text>
      <circle cx={x(1)} cy={y(1)} r="6" fill={FLASH_COLOR} />
      <text x={x(1) + 12} y={y(1) + 4} fontSize="12" fill={TEXT_COLOR} style={HALO}>
        Flash arrives at the switch
      </text>
      <line x1={x(1)} y1={y(1) - 8} x2={x(1)} y2={y(1.5) + 10} stroke={EVENT_B_COLOR} strokeWidth="2" />
      <polygon points={`${x(1)},${y(1.5) + 8} ${x(1) - 4},${y(1.5) + 15} ${x(1) + 4},${y(1.5) + 15}`} fill={EVENT_B_COLOR} />
      <rect x={x(1) - 7} y={y(1.5) - 7} width="14" height="14" rx="2" fill={EVENT_B_COLOR} />
      <text x={x(1) + 12} y={y(1.5) - 1} fontSize="12" fill={TEXT_COLOR} style={HALO}>
        Firecracker goes off
      </text>
      <text x={x(1) + 12} y={y(1.5) + 12} fontSize="11" fill={MUTED_COLOR} style={HALO}>
        (the effect)
      </text>
    </svg>
  )
}

// ---- Figure B: the order we expect, and effect before cause (imagined) ----
export function ScrambledFigure() {
  const boxes = (rowY: number, items: [string, string][], color: string, dashed: boolean) =>
    items.map(([title, sub], i) => {
      const bx = 20 + i * 200
      return (
        <g key={`${rowY}-${i}`}>
          <rect
            x={bx}
            y={rowY}
            width="160"
            height="50"
            rx="6"
            fill="none"
            stroke={color}
            strokeWidth="2.5"
            strokeDasharray={dashed ? '6 4' : undefined}
          />
          <text x={bx + 80} y={rowY + 22} textAnchor="middle" fontSize="13" fontWeight="bold" fill={TEXT_COLOR}>
            {title}
          </text>
          <text x={bx + 80} y={rowY + 40} textAnchor="middle" fontSize="11" fill={MUTED_COLOR}>
            {sub}
          </text>
          {i < items.length - 1 && (
            <g>
              <line x1={bx + 164} y1={rowY + 25} x2={bx + 192} y2={rowY + 25} stroke={color} strokeWidth="2" strokeDasharray={dashed ? '4 3' : undefined} />
              <polygon points={`${bx + 196},${rowY + 25} ${bx + 188},${rowY + 20} ${bx + 188},${rowY + 30}`} fill={color} />
            </g>
          )}
        </g>
      )
    })
  return (
    <svg
      viewBox="0 0 600 240"
      role="img"
      aria-label="Figure B: two rows. The order we expect: flash sent, flash arrives, bang. Effect before cause, imagined and not a result: bang, flash sent, flash arrives."
      style={SVG_STYLE}
    >
      <text x="20" y="22" fontSize="13" fontWeight="bold" fill={TEXT_COLOR}>
        The order we expect
      </text>
      {boxes(34, [['1. Flash sent', '(the cause)'], ['2. Flash arrives', 'at the switch'], ['3. Bang', '(the effect)']], EVENT_O_COLOR, false)}
      <text x="20" y="124" fontSize="13" fontWeight="bold" fill={IMAGINED_COLOR}>
        Effect before cause (imagined)
      </text>
      {boxes(136, [['1. Bang', '(the effect)'], ['2. Flash sent', '(the cause)'], ['3. Flash arrives', 'at the switch']], IMAGINED_COLOR, true)}
      <text x="20" y="214" fontSize="11" fill={IMAGINED_COLOR}>
        IMAGINED: a picture of an idea, not measured and not a result of this experiment
      </text>
    </svg>
  )
}

// ---- Figure C: seeing is not finding ----
export function SeeingFigure() {
  const x = (t: number) => 60 + t * 160
  const lineY = 118
  return (
    <svg
      viewBox="0 0 600 230"
      role="img"
      aria-label="Figure C: a firecracker goes off at 0 seconds, 3 light-seconds away. Its light takes 3 seconds to arrive, so an observer sees it at 3 seconds. A careful observer takes away the 3 seconds of travel and finds it happened at 0 seconds."
      style={SVG_STYLE}
    >
      <text x="300" y="20" textAnchor="middle" fontSize="13" fontWeight="bold" fill={TEXT_COLOR}>
        Seeing an event, and finding when it happened
      </text>
      <line x1={x(0)} y1={lineY} x2={x(3)} y2={lineY} stroke={MUTED_COLOR} strokeWidth="2" />
      {[0, 1, 2, 3].map((m) => (
        <g key={m}>
          <line x1={x(m)} y1={lineY - 4} x2={x(m)} y2={lineY + 4} stroke={TICK_COLOR} />
          <text x={x(m)} y={lineY + 18} textAnchor="middle" fontSize="11" fill={MUTED_COLOR}>
            {m}
          </text>
        </g>
      ))}
      <text x={(x(0) + x(3)) / 2} y={lineY + 33} textAnchor="middle" fontSize="11" fill={TEXT_COLOR}>
        Time on the observer&rsquo;s clock (seconds)
      </text>
      <circle cx={x(0)} cy={lineY} r="7" fill={EVENT_B_COLOR} />
      <text x={x(0)} y="46" fontSize="12" fill={TEXT_COLOR}>
        The firecracker goes off, 3 light-seconds away (time 0)
      </text>
      <line x1={x(0) + 10} y1={lineY - 14} x2={x(3) - 22} y2={lineY - 14} stroke={FLASH_COLOR} strokeWidth="3" />
      <polygon points={`${x(3) - 16},${lineY - 14} ${x(3) - 26},${lineY - 20} ${x(3) - 26},${lineY - 8}`} fill={FLASH_COLOR} />
      <text x={(x(0) + x(3)) / 2 - 20} y={lineY - 22} textAnchor="middle" fontSize="11" fill={FLASH_COLOR}>
        The light takes 3 seconds to arrive
      </text>
      {/* The observer's eye, drawn in light blue because white means the learner's guess. */}
      <ellipse cx={x(3)} cy={lineY - 14} rx="13" ry="8" fill="none" stroke="#7dd3fc" strokeWidth="2" />
      <circle cx={x(3)} cy={lineY - 14} r="3.5" fill="#7dd3fc" />
      <text x={x(3)} y="70" textAnchor="end" fontSize="12" fill="#7dd3fc">
        The observer sees it now (time 3 s)
      </text>
      <path
        d={`M ${x(3)} ${lineY + 44} C ${x(2)} ${lineY + 84}, ${x(1)} ${lineY + 84}, ${x(0) + 6} ${lineY + 48}`}
        fill="none"
        stroke="#34d399"
        strokeWidth="2.5"
        strokeDasharray="6 4"
      />
      <polygon points={`${x(0)},${lineY + 44} ${x(0) + 12},${lineY + 44} ${x(0) + 6},${lineY + 55}`} fill="#34d399" transform={`rotate(-20 ${x(0)} ${lineY + 48})`} />
      <text x={(x(0) + x(3)) / 2} y={lineY + 100} textAnchor="middle" fontSize="12" fill="#34d399">
        A careful observer: 3 s seen, minus 3 s of travel, means it happened at 0 s
      </text>
    </svg>
  )
}

// ---- Figure E: the lab's same-moment line and a passing observer's (tilted) one ----
export function SameMomentFigure() {
  const cx = 260
  const oy = 170
  const xs = 48
  const ys = 40
  const x = (p: number) => cx + p * xs
  const y = (t: number) => oy - t * ys
  const slope = 0.5
  return (
    <svg
      viewBox="0 0 520 330"
      role="img"
      aria-label="Figure E: through event O, the lab's same-moment line is level, and the same-moment line of a passing observer moving right at half the speed of light is tilted, rising to the right."
      style={SVG_STYLE}
    >
      <text x="12" y="20" fontSize="13" fontWeight="bold" fill={TEXT_COLOR}>
        Two same-moment lines through O
      </text>
      <line x1={x(-4)} y1={oy} x2={x(4)} y2={oy} stroke={MUTED_COLOR} strokeWidth="1.5" />
      <line x1={cx} y1={y(3)} x2={cx} y2={y(-3)} stroke={MUTED_COLOR} strokeWidth="1.5" />
      {[-4, -3, -2, -1, 1, 2, 3, 4].map((m) => (
        <g key={`p${m}`}>
          <line x1={x(m)} y1={oy - 4} x2={x(m)} y2={oy + 4} stroke={TICK_COLOR} />
          <text x={x(m)} y={oy + 17} textAnchor="middle" fontSize="10" fill={MUTED_COLOR}>
            {m}
          </text>
        </g>
      ))}
      {[-3, -2, -1, 1, 2, 3].map((m) => (
        <g key={`t${m}`}>
          <line x1={cx - 4} y1={y(m)} x2={cx + 4} y2={y(m)} stroke={TICK_COLOR} />
          <text x={cx - 9} y={y(m) + 4} textAnchor="end" fontSize="10" fill={MUTED_COLOR}>
            {m}
          </text>
        </g>
      ))}
      <text x={cx - 9} y={y(3) - 8} textAnchor="end" fontSize="10" fill={TEXT_COLOR}>
        Time (seconds)
      </text>
      <text x={cx} y="322" textAnchor="middle" fontSize="11" fill={TEXT_COLOR}>
        Position along the lab&rsquo;s ruler (light-seconds)
      </text>
      <line x1={x(-4)} y1={oy} x2={x(4)} y2={oy} stroke={LAB_LINE_COLOR} strokeWidth="3" />
      <text x={x(-4) + 4} y={oy - 8} fontSize="11" fill={LAB_LINE_COLOR} style={HALO}>
        the lab&rsquo;s same-moment line (level)
      </text>
      <line x1={x(-4)} y1={y(-4 * slope)} x2={x(4)} y2={y(4 * slope)} stroke={OBSERVER_COLOR} strokeWidth="3" />
      <text x={x(-4) + 4} y={y(-4 * slope) + 22} fontSize="11" fill={OBSERVER_COLOR} style={HALO}>
        a passing observer&rsquo;s same-moment line (tilted)
      </text>
      <rect x={cx - 7} y={oy - 7} width="14" height="14" rx="2" fill={EVENT_O_COLOR} />
      <text x={cx + 12} y={oy + 28} fontSize="11" fill={TEXT_COLOR} style={HALO}>
        O: here, now
      </text>
      <rect x="388" y="34" width="32" height="20" rx="3" fill={OBSERVER_COLOR} />
      <line x1="424" y1="44" x2="448" y2="44" stroke={OBSERVER_COLOR} strokeWidth="3" />
      <polygon points="456,44 448,39 448,49" fill={OBSERVER_COLOR} />
      <text x="420" y="72" textAnchor="middle" fontSize="11" fill={TEXT_COLOR}>
        Passing observer
      </text>
      <text x="420" y="85" textAnchor="middle" fontSize="10" fill={MUTED_COLOR}>
        0.5c, to the right (example)
      </text>
    </svg>
  )
}

// ---- The strip of observer speeds (Part 1 and Part 2, drawn when the run ends) ----
const STRIP_W = 520
const STRIP_H = 230
const STRIP_LEFT = 40
const STRIP_RIGHT = 480
const BAR_TOP = 96
const BAR_BOTTOM = 124
const O_FIRST_COLOR = '#3b82f6'
const B_FIRST_COLOR = '#f59e0b'

const GUESS_TEXT: Record<PredictionAnswer, string> = {
  yes: 'B first for a fast enough speed',
  'same-moment': 'the same moment, but never B first',
  no: 'O first at every speed',
}

function speedText(u: number): string {
  if (u === 0) return '0'
  return `${u < 0 ? '−' : '+'}${Math.abs(u).toFixed(Math.abs(u) === 1 || Math.abs(u * 10 - Math.round(u * 10)) < 1e-9 ? 1 : 2)}c`
}

interface SpeedStripProps {
  event: WorldlinePoint
  // The passing observer's speed in this run, drawn as a purple tick.
  passingSpeed: number
  // The learner's guess, drawn as a white ring in the stretch the answer names (Part 1 only).
  guess?: PredictionAnswer | null
  // True for the Part 2 drawing: framed and titled in the Part 2 colour.
  yours?: boolean
}

export function SpeedStrip({ event, passingSpeed, guess = null, yours = false }: SpeedStripProps) {
  const strip = orderStripForEvent(event)
  const px = (u: number) => STRIP_LEFT + ((u + 1) / 2) * (STRIP_RIGHT - STRIP_LEFT)
  const markerSpeed = guess ? guessMarkerSpeed(guess, strip) : null
  const ringX = markerSpeed === null ? null : px(markerSpeed)
  const boxW = 210
  const boxX = ringX === null ? 0 : Math.min(Math.max(ringX - boxW / 2, 12), STRIP_W - boxW - 12)
  const ringY = (BAR_TOP + BAR_BOTTOM) / 2
  const stretchName = (order: 'o-first' | 'b-first') => (order === 'o-first' ? 'O first' : 'B first')
  return (
    <svg
      viewBox={`0 0 ${STRIP_W} ${STRIP_H}`}
      role="img"
      aria-label={`Strip of observer speeds from minus c to plus c. ${strip.stretches
        .map((s) => `From ${speedText(s.from)} to ${speedText(s.to)}: ${stretchName(s.order)}.`)
        .join(' ')} ${strip.flipSpeed === null ? 'There is no speed at which O and B are at the same moment.' : `At ${speedText(strip.flipSpeed)} they are at the same moment.`} The passing observer in this run is at ${speedText(passingSpeed)}.`}
      style={{ ...SVG_STYLE, border: yours ? `3px solid ${PART2_COLOR}` : SVG_STYLE.border }}
    >
      <defs>
        <pattern id={`hatch-${yours ? 'p2' : 'p1'}`} width="8" height="8" patternUnits="userSpaceOnUse" patternTransform="rotate(45)">
          <rect width="8" height="8" fill="#0b1020" />
          <rect width="4" height="8" fill={B_FIRST_COLOR} fillOpacity="0.55" />
        </pattern>
      </defs>
      <text x="12" y="18" fontSize="12" fontWeight="bold" fill={yours ? PART2_COLOR : TEXT_COLOR}>
        {yours ? 'Your event: ' : ''}Which event each observer finds first, for every speed
      </text>
      {strip.stretches.map((s) => (
        <rect
          key={`${s.from}-${s.to}`}
          x={px(s.from)}
          y={BAR_TOP}
          width={Math.max(px(s.to) - px(s.from), 0)}
          height={BAR_BOTTOM - BAR_TOP}
          fill={s.order === 'o-first' ? O_FIRST_COLOR : `url(#hatch-${yours ? 'p2' : 'p1'})`}
          fillOpacity={s.order === 'o-first' ? 0.6 : 1}
          stroke={s.order === 'o-first' ? O_FIRST_COLOR : B_FIRST_COLOR}
          strokeWidth="1.5"
        />
      ))}
      {[-1, -0.5, 0, 0.5, 1].map((u) => (
        <g key={u}>
          <line x1={px(u)} y1={BAR_BOTTOM} x2={px(u)} y2={BAR_BOTTOM + 6} stroke={TICK_COLOR} strokeWidth="1.5" />
          <text x={px(u)} y={BAR_BOTTOM + 19} textAnchor="middle" fontSize="10" fill={MUTED_COLOR}>
            {u === -1 ? '−c' : u === 1 ? '+c' : u === 0 ? '0 (the lab)' : speedText(u)}
          </text>
        </g>
      ))}
      {strip.stretches.map((s) => (
        <text key={`n${s.from}`} x={(px(s.from) + px(s.to)) / 2} y={BAR_BOTTOM + 58} textAnchor="middle" fontSize="11" fontWeight="bold" fill={s.order === 'o-first' ? '#93c5fd' : B_FIRST_COLOR}>
          {stretchName(s.order)}
        </text>
      ))}
      {strip.flipSpeed !== null && (
        <g>
          <line x1={px(strip.flipSpeed)} y1={BAR_TOP - 6} x2={px(strip.flipSpeed)} y2={BAR_BOTTOM + 6} stroke={FLASH_COLOR} strokeWidth="3" />
        </g>
      )}
      <line x1={px(passingSpeed)} y1={BAR_BOTTOM + 28} x2={px(passingSpeed)} y2={BAR_BOTTOM + 6} stroke={OBSERVER_COLOR} strokeWidth="2.5" />
      <polygon points={`${px(passingSpeed)},${BAR_BOTTOM + 3} ${px(passingSpeed) - 5},${BAR_BOTTOM + 11} ${px(passingSpeed) + 5},${BAR_BOTTOM + 11}`} fill={OBSERVER_COLOR} />
      <text
        x={px(passingSpeed) < STRIP_LEFT + 110 ? Math.max(px(passingSpeed) - 8, 12) : px(passingSpeed) > STRIP_RIGHT - 110 ? Math.min(px(passingSpeed) + 8, STRIP_W - 12) : px(passingSpeed)}
        y={BAR_BOTTOM + 40}
        textAnchor={px(passingSpeed) < STRIP_LEFT + 110 ? 'start' : px(passingSpeed) > STRIP_RIGHT - 110 ? 'end' : 'middle'}
        fontSize="11"
        fill={OBSERVER_COLOR}
      >
        Passing observer in this run: {speedText(passingSpeed)}
      </text>
      <text x="12" y={STRIP_H - 20} fontSize="10" fill={MUTED_COLOR}>
        {strip.flipSpeed === null
          ? 'No speed below c puts O and B at the same moment for this event.'
          : `Yellow line: the speed at which O and B are at the same moment, ${speedText(strip.flipSpeed)}.`}
      </text>
      <text x="12" y={STRIP_H - 6} fontSize="10" fill={MUTED_COLOR}>
        Speeds are fractions of c; negative means moving left, positive means moving right.
      </text>
      {ringX !== null && guess && (
        <g>
          <line x1={ringX} y1={ringY - 11} x2={boxX + boxW / 2} y2="62" stroke={GUESS_COLOR} strokeWidth="2.5" />
          <rect x={boxX} y="28" width={boxW} height="34" rx="4" fill="#0b1020" stroke={GUESS_COLOR} strokeWidth="2.5" />
          <text x={boxX + boxW / 2} y="43" textAnchor="middle" fontSize="12" fontWeight="bold" fill={GUESS_COLOR}>
            YOUR GUESS
          </text>
          <text x={boxX + boxW / 2} y="57" textAnchor="middle" fontSize="10" fill={GUESS_COLOR}>
            {GUESS_TEXT[guess]}
          </text>
          <circle cx={ringX} cy={ringY} r="11" fill="none" stroke="#0b1020" strokeWidth="7" />
          <circle cx={ringX} cy={ringY} r="11" fill="none" stroke={GUESS_COLOR} strokeWidth="3.5" />
        </g>
      )}
    </svg>
  )
}
