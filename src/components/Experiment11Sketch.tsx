import { AXES_SKETCH_EXTENT, axesSketchFor } from '../physics/lorentzTransform'
import type { WorldlinePoint } from '../physics/spacetimeDiagramView'
import { MUTED_COLOR, TEXT_COLOR, svgStyle } from './GravitationalWaveExperiment'
import { AXES_COLOR } from './Experiment8Pictures'
import { CaptionBox } from './Experiment6Pictures'
import { LookForList } from './WideBinariesExperiment'

// Relativity of Time and Motion, Experiment 11: the introduction sketch "What a frame's own axes are" (docs/audit/
// relativity-of-time-and-motion/11-draft-wording.md, section 6a). It shows no block, no flash and no events, so it gives no answer to the
// guess. Every number drawn comes from the physics module (axesSketchFor; CLAUDE.md §9). The wording is the owner's to approve line by
// line (CLAUDE.md §28.1).

const W = 560
const H = 380
const ORIGIN = { x: 150, y: 330 }
const SCALE = 440 // pixels per light-second and per second (one scale for both)
const INK = '#0b1020'
const GRID = '#1e293b'
const stroke = { stroke: INK, strokeWidth: 4, paintOrder: 'stroke' } as const

export function AxesSketch() {
  const sketch = axesSketchFor()
  const px = (p: WorldlinePoint) => ({ x: ORIGIN.x + p.position * SCALE, y: ORIGIN.y - p.time * SCALE })
  const ticks = [0.1, 0.2, 0.3, 0.4, 0.5, 0.6].filter((t) => t <= AXES_SKETCH_EXTENT + 1e-9)

  const arrow = (a: WorldlinePoint, b: WorldlinePoint, color: string, dashed: boolean, key: string) => {
    const from = px(a)
    const to = px(b)
    const angle = Math.atan2(to.y - from.y, to.x - from.x)
    const head = [
      `${to.x},${to.y}`,
      `${to.x - 12 * Math.cos(angle - 0.4)},${to.y - 12 * Math.sin(angle - 0.4)}`,
      `${to.x - 12 * Math.cos(angle + 0.4)},${to.y - 12 * Math.sin(angle + 0.4)}`,
    ].join(' ')
    return (
      <g key={key}>
        <line x1={from.x} y1={from.y} x2={to.x} y2={to.y} stroke={color} strokeWidth={3.5} strokeDasharray={dashed ? '9 6' : undefined} />
        <polygon points={head} fill={color} />
      </g>
    )
  }

  const tEnd = px(sketch.movingTimeAxis[1])
  const sEnd = px(sketch.movingSpaceAxis[1])
  const labTop = px(sketch.labTimeAxis[1])
  const labRight = px(sketch.labSpaceAxis[1])

  return (
    <div style={{ margin: '0.75rem 0 1rem' }}>
      <p style={{ margin: '0 0 0.5rem', fontWeight: 'bold' }}>What a frame’s own axes are (a sketch, not the real diagram)</p>
      <svg
        width={W}
        height={H}
        viewBox={`0 0 ${W} ${H}`}
        style={svgStyle}
        role="img"
        aria-label={`A sketch with two pairs of lines through one point. The lab's pair in grey: a time axis going straight up and a space axis going straight across. A moving frame's pair in orange: a time axis leaning to the right, ${sketch.lean} light-second across for every second up, and a space axis leaning up, ${sketch.lean} second up for every light-second across.`}
      >
        <text x={14} y={22} fill={TEXT_COLOR} fontSize="13" fontWeight="bold">
          TWO FRAMES’ AXES, THROUGH ONE POINT
        </text>
        {ticks.map((t) => (
          <g key={t}>
            <line x1={ORIGIN.x + t * SCALE} y1={ORIGIN.y} x2={ORIGIN.x + t * SCALE} y2={ORIGIN.y + 5} stroke={MUTED_COLOR} />
            <text x={ORIGIN.x + t * SCALE} y={ORIGIN.y + 19} fill={MUTED_COLOR} fontSize="11" textAnchor="middle">
              {t}
            </text>
            <line x1={ORIGIN.x} y1={ORIGIN.y - t * SCALE} x2={ORIGIN.x - 5} y2={ORIGIN.y - t * SCALE} stroke={MUTED_COLOR} />
            <text x={ORIGIN.x - 9} y={ORIGIN.y - t * SCALE + 4} fill={MUTED_COLOR} fontSize="11" textAnchor="end">
              {t}
            </text>
            <line x1={ORIGIN.x} y1={ORIGIN.y - t * SCALE} x2={ORIGIN.x + AXES_SKETCH_EXTENT * SCALE} y2={ORIGIN.y - t * SCALE} stroke={GRID} />
            <line x1={ORIGIN.x + t * SCALE} y1={ORIGIN.y} x2={ORIGIN.x + t * SCALE} y2={ORIGIN.y - AXES_SKETCH_EXTENT * SCALE} stroke={GRID} />
          </g>
        ))}

        {arrow(sketch.labTimeAxis[0], sketch.labTimeAxis[1], '#cbd5e1', false, 'lt')}
        {arrow(sketch.labSpaceAxis[0], sketch.labSpaceAxis[1], '#cbd5e1', true, 'ls')}
        {arrow(sketch.movingTimeAxis[0], sketch.movingTimeAxis[1], AXES_COLOR, false, 'mt')}
        {arrow(sketch.movingSpaceAxis[0], sketch.movingSpaceAxis[1], AXES_COLOR, true, 'ms')}

        <text x={labTop.x - 16} y={labTop.y + 4} fill="#cbd5e1" fontSize="12" fontWeight="bold" textAnchor="end" {...stroke}>
          The lab’s time axis
        </text>
        <text x={labRight.x - 4} y={labRight.y - 12} fill="#cbd5e1" fontSize="12" fontWeight="bold" textAnchor="end" {...stroke}>
          The lab’s space axis
        </text>
        <text x={tEnd.x + 10} y={tEnd.y + 4} fill={AXES_COLOR} fontSize="12" fontWeight="bold" {...stroke}>
          A moving frame’s time axis
        </text>
        <text x={sEnd.x - 4} y={sEnd.y - 12} fill={AXES_COLOR} fontSize="12" fontWeight="bold" textAnchor="end" {...stroke}>
          A moving frame’s space axis
        </text>
        <text x={ORIGIN.x + AXES_SKETCH_EXTENT * SCALE / 2} y={ORIGIN.y + 44} fill={TEXT_COLOR} fontSize="12" fontWeight="bold" textAnchor="middle">
          position (light-seconds) →
        </text>
        <text x={22} y={ORIGIN.y - (AXES_SKETCH_EXTENT * SCALE) / 2} fill={TEXT_COLOR} fontSize="12" fontWeight="bold" textAnchor="middle" transform={`rotate(-90 22 ${ORIGIN.y - (AXES_SKETCH_EXTENT * SCALE) / 2})`}>
          time (seconds) →
        </text>
      </svg>
      <CaptionBox>
        <p style={{ marginTop: 0, marginBottom: '0.5rem' }}>
          <strong>How to read this sketch.</strong>
        </p>
        <ul style={{ margin: '0 0 0.75rem', paddingLeft: '1.25rem' }}>
          <li>
            <strong>What it is.</strong> A small picture to help you read the real diagram further down. It has no block, no flash and no
            events in it, and shows no result of the experiment. <strong>Position</strong> runs across, in light-seconds;{' '}
            <strong>time</strong> runs up, in seconds.
          </li>
          <li>
            <strong>The grey pair</strong> is the lab&rsquo;s: its time axis is straight up and its space axis (dashed) is straight
            across.
          </li>
          <li>
            <strong>The orange pair</strong> is a moving frame&rsquo;s. A frame moving at a quarter of the speed of light (0.25c, an
            example speed only) has a time axis that leans to the right and a space axis (dashed) that leans up. Both lean by the same
            amount, {sketch.lean}.
          </li>
        </ul>
        <p style={{ margin: '0 0 0.75rem' }}>
          <strong>A worked moment.</strong> The orange time axis moves {sketch.lean} light-second across for every second it goes up,
          which is 0.25c, the frame&rsquo;s speed. The orange space axis goes up {sketch.lean} s for every light-second across, so its
          lean is also {sketch.lean}.
        </p>
        <p style={{ margin: '0 0 0.25rem' }}>
          <strong>What to look for</strong>
        </p>
        <LookForList
          items={[
            {
              look: 'the grey pair.',
              means: 'Straight up and straight across, at right angles.',
              matters: 'This is how the lab, standing still, draws its own time and its own “same moment”.',
            },
            {
              look: 'the orange pair.',
              means: `Both lines lean, by the same amount, ${sketch.lean}.`,
              matters: 'A moving frame’s “time” and “same moment” are both tilted on the lab’s diagram, and the faster the frame, the more they lean.',
            },
          ]}
        />
        <p style={{ margin: '0.75rem 0 0', fontSize: '0.8125rem' }}>
          <strong>Where this picture comes from.</strong> <em>Imagined for illustration:</em> the 0.25c frame. <em>Measured:</em> nothing.{' '}
          <em>Calculated here:</em> only the lines drawn, from the {sketch.lean} lean.
        </p>
      </CaptionBox>
    </div>
  )
}
