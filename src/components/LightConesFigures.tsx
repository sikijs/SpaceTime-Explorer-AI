import type { CSSProperties } from 'react'

// Figures A to C of the introduction of Spacetime Geometry 2 (docs/audit/spacetime-geometry/02-draft-wording.md, section 1).
// They are illustrations drawn for the introduction, not results: the shout across a field, four snapshots of one flash of light,
// and the snapshots stacked into a light cone. They show no event B, no teal or rose regions and no meaning for the three kinds of
// place, because what those mean is the question the learner is asked to predict (CLAUDE.md §12). The numbers drawn are the
// sound speed used in the introduction (340 meters per second) and light's one light-second per second.

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
const FLASH_COLOR = '#facc15'
const SOUND_COLOR = '#38bdf8'
const FRIEND_COLOR = '#f59e0b'
const HALO: CSSProperties = { paintOrder: 'stroke', stroke: '#0b1020', strokeWidth: 3 }

const SOUND_SPEED = 340 // meters per second, the figure used in the introduction's shout

// ---- Figure A: the shout across a field ----
const A_W = 560
const A_H = 270
const A_LEFT = 50
const A_BOTTOM = 225
const A_PER_METER = 0.4
const A_PER_SECOND = 58
const aX = (meters: number) => A_LEFT + meters * A_PER_METER
const aY = (seconds: number) => A_BOTTOM - seconds * A_PER_SECOND

export function ShoutFigure() {
  const friends = [
    { meters: 340, anchor: 'middle' as const, dx: 0, line1: 'Friend at 340 m', line2: '(sound has passed)' },
    { meters: 680, anchor: 'start' as const, dx: 4, line1: 'Friend at 680 m', line2: '(sound arriving now)' },
    { meters: 1000, anchor: 'start' as const, dx: -14, line1: 'Friend at 1,000 m', line2: '(sound not here yet)' },
  ]
  const nowY = aY(2)
  return (
    <svg
      viewBox={`0 0 ${A_W} ${A_H}`}
      role="img"
      aria-label="Figure A: a shout across a field. Distance in meters runs across and time in seconds runs up. The sound travels 340 meters every second, so it is 340 meters away after 1 second, 680 meters after 2 seconds and 1,020 meters after 3 seconds. Two seconds after the shout, a friend 340 meters away has already heard it, a friend 680 meters away is hearing it right now, and a friend 1,000 meters away has not heard it yet."
      style={SVG_STYLE}
    >
      <text x="12" y="18" fontSize="12" fontWeight="bold" fill={TEXT_COLOR}>
        Figure A: a shout across a field
      </text>

      {/* Time axis (seconds) and distance axis (meters). */}
      <line x1={A_LEFT} y1={A_BOTTOM} x2={A_LEFT} y2={aY(3) - 6} stroke={MUTED_COLOR} strokeWidth="2" />
      {[0, 1, 2, 3].map((s) => (
        <g key={`s${s}`}>
          <line x1={A_LEFT - 4} y1={aY(s)} x2={A_LEFT + 4} y2={aY(s)} stroke={TICK_COLOR} strokeWidth="1.5" />
          <text x={A_LEFT - 8} y={aY(s) + 4} textAnchor="end" fontSize="10" fill={MUTED_COLOR}>
            {s}
          </text>
        </g>
      ))}
      <text x={A_LEFT + 6} y={aY(3) - 14} fontSize="10" fill={TEXT_COLOR}>
        Time after the shout (seconds)
      </text>
      <line x1={A_LEFT} y1={A_BOTTOM} x2={aX(1200)} y2={A_BOTTOM} stroke={MUTED_COLOR} strokeWidth="2" />
      {[0, 340, 680, 1020].map((m) => (
        <g key={`m${m}`}>
          <line x1={aX(m)} y1={A_BOTTOM - 4} x2={aX(m)} y2={A_BOTTOM + 4} stroke={TICK_COLOR} strokeWidth="1.5" />
          <text x={aX(m)} y={A_BOTTOM + 16} textAnchor="middle" fontSize="10" fill={MUTED_COLOR}>
            {m.toLocaleString('en-US')}
          </text>
        </g>
      ))}
      <text x={aX(600)} y={A_H - 8} textAnchor="middle" fontSize="11" fill={TEXT_COLOR}>
        Distance from you (meters)
      </text>

      {/* The sound: one sloping line at 340 meters every second. */}
      <line x1={aX(0)} y1={aY(0)} x2={aX(3 * SOUND_SPEED)} y2={aY(3)} stroke={SOUND_COLOR} strokeWidth="2.5" />
      <text x={aX(1.2 * SOUND_SPEED) + 12} y={aY(1.2)} fontSize="10" fill={SOUND_COLOR} style={HALO}>
        The sound: 340 meters every second
      </text>

      {/* The moment we look at: 2 seconds after the shout. */}
      <line x1={A_LEFT} y1={nowY} x2={aX(1200)} y2={nowY} stroke={TEXT_COLOR} strokeOpacity="0.5" strokeDasharray="3 4" />
      <text x={aX(1200)} y={nowY - 12} textAnchor="end" fontSize="10" fill={MUTED_COLOR}>
        2 seconds after the shout
      </text>

      {/* The shout itself. */}
      <rect x={aX(0) - 6} y={aY(0) - 6} width="12" height="12" rx="2" fill={EVENT_O_COLOR} />
      <text x={aX(0) + 40} y={aY(0) - 6} fontSize="10" fill={TEXT_COLOR}>
        You shout (time 0)
      </text>

      {/* The three friends, all looked at 2 seconds after the shout. */}
      {friends.map((f) => (
        <g key={f.meters}>
          <circle cx={aX(f.meters)} cy={nowY} r="5" fill={FRIEND_COLOR} />
          <text x={aX(f.meters) + f.dx} y={nowY + 18} textAnchor={f.anchor} fontSize="9" fill={TEXT_COLOR} style={HALO}>
            {f.line1}
          </text>
          <text x={aX(f.meters) + f.dx} y={nowY + 29} textAnchor={f.anchor} fontSize="9" fill={MUTED_COLOR} style={HALO}>
            {f.line2}
          </text>
        </g>
      ))}
    </svg>
  )
}

// ---- Figure B: four snapshots of one flash ----
const B_W = 460
const B_H = 268
const B_CENTER = 230
const B_PER_LS = 52
const B_TOP = 48
const B_STEP = 52
const bX = (position: number) => B_CENTER + position * B_PER_LS
const bY = (second: number) => B_TOP + second * B_STEP

export function SnapshotsFigure() {
  return (
    <svg
      viewBox={`0 0 ${B_W} ${B_H}`}
      role="img"
      aria-label="Figure B: four snapshots of one flash of light, along a line marked in light-seconds from minus 3 to plus 3. At 0 seconds the flash goes off in the middle. At 1 second two fronts are at minus 1 and plus 1. At 2 seconds they are at minus 2 and plus 2. At 3 seconds they are at minus 3 and plus 3."
      style={SVG_STYLE}
    >
      <text x="12" y="18" fontSize="12" fontWeight="bold" fill={TEXT_COLOR}>
        Figure B: four snapshots of one flash
      </text>
      {[0, 1, 2, 3].map((second) => (
        <g key={second}>
          <text x="14" y={bY(second) + 4} fontSize="11" fontWeight="bold" fill={TEXT_COLOR}>
            {second} s
          </text>
          <line x1={bX(-3)} y1={bY(second)} x2={bX(3)} y2={bY(second)} stroke={MUTED_COLOR} strokeWidth="2" />
          {[-3, -2, -1, 0, 1, 2, 3].map((p) => (
            <line key={p} x1={bX(p)} y1={bY(second) - 4} x2={bX(p)} y2={bY(second) + 4} stroke={TICK_COLOR} strokeWidth="1.5" />
          ))}
          {second === 0 ? (
            <circle cx={bX(0)} cy={bY(0)} r="6" fill={FLASH_COLOR} />
          ) : (
            <g>
              <circle cx={bX(-second)} cy={bY(second)} r="6" fill={FLASH_COLOR} />
              <circle cx={bX(second)} cy={bY(second)} r="6" fill={FLASH_COLOR} />
            </g>
          )}
        </g>
      ))}
      {/* Faint dashed lines join each front to where it was one second earlier. */}
      {[1, 2, 3].map((second) => (
        <g key={`j${second}`} stroke={FLASH_COLOR} strokeOpacity="0.45" strokeDasharray="3 3">
          <line x1={bX(-(second - 1))} y1={bY(second - 1)} x2={bX(-second)} y2={bY(second)} />
          <line x1={bX(second - 1)} y1={bY(second - 1)} x2={bX(second)} y2={bY(second)} />
        </g>
      ))}
      <text x={bX(0) + 12} y={bY(0) - 10} fontSize="10" fill={TEXT_COLOR} style={HALO}>
        the flash goes off
      </text>
      <text x={bX(3) - 6} y={bY(1) - 10} textAnchor="end" fontSize="10" fill={FLASH_COLOR} style={HALO}>
        two fronts move out, 1 light-second farther every second
      </text>
      {[-3, -2, -1, 1, 2, 3].map((p) => (
        <text key={p} x={bX(p)} y={bY(3) + 20} textAnchor="middle" fontSize="10" fill={MUTED_COLOR}>
          {p}
        </text>
      ))}
      <text x={bX(0)} y={B_H - 10} textAnchor="middle" fontSize="11" fill={TEXT_COLOR}>
        Position along the line (light-seconds; left is negative, right is positive)
      </text>
    </svg>
  )
}

// ---- Figure C: the snapshots stacked into a graph, so the fronts trace the edges of the light cone ----
const C_W = 460
const C_H = 372
const C_CENTER = 230
const C_PER_LS = 40
const C_ORIGIN_Y = 194
const C_PER_SECOND = 40
const cX = (position: number) => C_CENTER + position * C_PER_LS
const cY = (second: number) => C_ORIGIN_Y - second * C_PER_SECOND

export function ConeFigure() {
  return (
    <svg
      viewBox={`0 0 ${C_W} ${C_H}`}
      role="img"
      aria-label="Figure C: the four snapshots stacked into a graph, with position in light-seconds across and time in seconds up. The two fronts of the flash trace two straight yellow lines that spread apart like a V above the point O, where and when the flash goes off. These are the edges of the light cone. The upper half is the future half of the cone, and the lower half, drawn dimmer, is the past half."
      style={SVG_STYLE}
    >
      <text x="12" y="18" fontSize="12" fontWeight="bold" fill={TEXT_COLOR}>
        Figure C: the snapshots stacked into a graph
      </text>

      {/* The two axes. */}
      <line x1={cX(-4)} y1={C_ORIGIN_Y} x2={cX(4)} y2={C_ORIGIN_Y} stroke={MUTED_COLOR} strokeWidth="2" />
      {[-4, -3, -2, -1, 1, 2, 3, 4].map((p) => (
        <g key={`x${p}`}>
          <line x1={cX(p)} y1={C_ORIGIN_Y - 4} x2={cX(p)} y2={C_ORIGIN_Y + 4} stroke={TICK_COLOR} strokeWidth="1.5" />
          <text x={cX(p)} y={C_ORIGIN_Y + 17} textAnchor="middle" fontSize="10" fill={MUTED_COLOR}>
            {p}
          </text>
        </g>
      ))}
      <line x1={C_CENTER} y1={cY(3.4)} x2={C_CENTER} y2={cY(-3.4)} stroke={MUTED_COLOR} strokeWidth="2" />
      {[-3, -2, -1, 1, 2, 3].map((s) => (
        <g key={`t${s}`}>
          <line x1={C_CENTER - 4} y1={cY(s)} x2={C_CENTER + 4} y2={cY(s)} stroke={TICK_COLOR} strokeWidth="1.5" />
          <text x={C_CENTER - 8} y={cY(s) + 4} textAnchor="end" fontSize="10" fill={MUTED_COLOR}>
            {s}
          </text>
        </g>
      ))}
      <text x={C_CENTER + 8} y={cY(2.5) + 4} fontSize="10" fill={TEXT_COLOR} style={HALO}>
        Time (seconds)
      </text>

      {/* The past half of the cone, dimmer and dashed. */}
      <g stroke={FLASH_COLOR} strokeOpacity="0.45" strokeDasharray="5 4" strokeWidth="2">
        <line x1={C_CENTER} y1={C_ORIGIN_Y} x2={cX(-3)} y2={cY(-3)} />
        <line x1={C_CENTER} y1={C_ORIGIN_Y} x2={cX(3)} y2={cY(-3)} />
      </g>
      {/* The future half: the two fronts of the flash, one snapshot per second. */}
      <g stroke={FLASH_COLOR} strokeWidth="2.5">
        <line x1={C_CENTER} y1={C_ORIGIN_Y} x2={cX(-3)} y2={cY(3)} />
        <line x1={C_CENTER} y1={C_ORIGIN_Y} x2={cX(3)} y2={cY(3)} />
      </g>
      {[1, 2, 3].map((s) => (
        <g key={`d${s}`} fill={FLASH_COLOR}>
          <circle cx={cX(-s)} cy={cY(s)} r="4.5" />
          <circle cx={cX(s)} cy={cY(s)} r="4.5" />
        </g>
      ))}

      {/* Labels. */}
      <text x={cX(3) + 8} y={cY(3) + 4} fontSize="10" fill={FLASH_COLOR} style={HALO}>
        Edge of the cone:
      </text>
      <text x={cX(3) + 8} y={cY(3) + 16} fontSize="10" fill={FLASH_COLOR} style={HALO}>
        front moving right
      </text>
      <text x={cX(-3) - 8} y={cY(3) + 4} textAnchor="end" fontSize="10" fill={FLASH_COLOR} style={HALO}>
        Edge of the cone:
      </text>
      <text x={cX(-3) - 8} y={cY(3) + 16} textAnchor="end" fontSize="10" fill={FLASH_COLOR} style={HALO}>
        front moving left
      </text>
      <text x={C_CENTER} y={cY(3.4) + 4} textAnchor="middle" fontSize="10" fill={TEXT_COLOR} style={HALO}>
        Future half: where the flash can get to later
      </text>
      <text x={C_CENTER} y={cY(-3) + 22} textAnchor="middle" fontSize="10" fill={MUTED_COLOR}>
        Past half: where a flash could have come from
      </text>
      <rect x={C_CENTER - 7} y={C_ORIGIN_Y - 7} width="14" height="14" rx="2" fill={EVENT_O_COLOR} />
      <text x={C_CENTER + 12} y={C_ORIGIN_Y + 30} fontSize="10" fill={TEXT_COLOR} style={HALO}>
        O: where and when the flash goes off
      </text>
      <text x={C_CENTER} y={C_H - 8} textAnchor="middle" fontSize="11" fill={TEXT_COLOR}>
        Position along the line (light-seconds; left is negative, right is positive)
      </text>
    </svg>
  )
}
