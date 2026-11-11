import { levelLineSketchFor } from '../physics/spacetimeDiagramView'
import type { LineSketch } from '../physics/spacetimeDiagramView'
import { MUTED_COLOR, TEXT_COLOR, svgStyle } from './GravitationalWaveExperiment'
import { CaptionBox } from './Experiment6Pictures'
import { LookForList } from './WideBinariesExperiment'

// Relativity of Time and Motion, Experiment 9: the sketch in the introduction, "What a level line means". A fixed illustration (not the
// real diagram): two events at the same time joined by a level line, and two events at different times joined by a leaning line, at one
// scale. Every position comes from levelLineSketchFor in src/physics/spacetimeDiagramView.ts (CLAUDE.md §9). The wording is the owner's,
// approved on 2026-11-10 (CLAUDE.md §28.1).

const LINE_COLOR = '#cbd5e1' // pale grey: neutral, so that white stays the learner's guess and green the block's own line
const INK = '#0b1020'
const GRID = '#1e293b'
const VIEW_WIDTH = 720
const VIEW_HEIGHT = 300
const SCALE = 400 // pixels per unit, the same on both axes and in both panels
const BASE_Y = 250 // the picture's time 0
const PLOT_HALF = 0.3 // light-seconds either side of the middle
const TIME_MAX = 0.4
const PANEL_CENTRES = [185, 535]

const stroke = { stroke: INK, strokeWidth: 4, paintOrder: 'stroke' } as const
const tick = (value: number) => String(parseFloat(value.toFixed(1)))

function Panel({ centre, title, sketch, note }: { centre: number; title: string; sketch: LineSketch; note: string }) {
  const x = (position: number) => centre + position * SCALE
  const y = (time: number) => BASE_Y - time * SCALE
  const left = x(-PLOT_HALF)
  const right = x(PLOT_HALF)
  const top = y(TIME_MAX)
  const positionTicks = [-0.3, -0.2, -0.1, 0, 0.1, 0.2, 0.3]
  const timeTicks = [0, 0.1, 0.2, 0.3, 0.4]
  const [a, b] = sketch.points
  return (
    <g>
      <text x={centre} y={20} fill={TEXT_COLOR} fontSize="13" fontWeight="bold" textAnchor="middle">
        {title}
      </text>
      {positionTicks.map((p) => (
        <g key={`p${p}`}>
          <line x1={x(p)} y1={top} x2={x(p)} y2={BASE_Y} stroke={GRID} strokeWidth={1} />
          <line x1={x(p)} y1={BASE_Y} x2={x(p)} y2={BASE_Y + 5} stroke={MUTED_COLOR} strokeWidth={1.5} />
          <text x={x(p)} y={BASE_Y + 19} fill={MUTED_COLOR} fontSize="11" textAnchor="middle">
            {tick(p)}
          </text>
        </g>
      ))}
      {timeTicks.map((t) => (
        <g key={`t${t}`}>
          <line x1={left} y1={y(t)} x2={right} y2={y(t)} stroke={GRID} strokeWidth={1} />
          <line x1={left - 5} y1={y(t)} x2={left} y2={y(t)} stroke={MUTED_COLOR} strokeWidth={1.5} />
          <text x={left - 9} y={y(t) + 4} fill={MUTED_COLOR} fontSize="11" textAnchor="end">
            {tick(t)}
          </text>
        </g>
      ))}
      <line x1={left} y1={BASE_Y} x2={right + 6} y2={BASE_Y} stroke={TEXT_COLOR} strokeWidth={1.5} />
      <polygon points={`${right + 6},${BASE_Y - 5} ${right + 6},${BASE_Y + 5} ${right + 15},${BASE_Y}`} fill={TEXT_COLOR} />
      <line x1={left} y1={BASE_Y} x2={left} y2={top - 6} stroke={TEXT_COLOR} strokeWidth={1.5} />
      <polygon points={`${left - 5},${top - 6} ${left + 5},${top - 6} ${left},${top - 15}`} fill={TEXT_COLOR} />
      <text x={centre} y={BASE_Y + 40} fill={TEXT_COLOR} fontSize="12" fontWeight="bold" textAnchor="middle">
        position (light-seconds) →
      </text>
      <text x={left - 38} y={(top + BASE_Y) / 2} fill={TEXT_COLOR} fontSize="12" fontWeight="bold" textAnchor="middle" transform={`rotate(-90 ${left - 38} ${(top + BASE_Y) / 2})`}>
        time (seconds) →
      </text>

      <line x1={x(a.position)} y1={y(a.time)} x2={x(b.position)} y2={y(b.time)} stroke={LINE_COLOR} strokeWidth={3} />
      {[a, b].map((p, i) => (
        <g key={i}>
          <circle cx={x(p.position)} cy={y(p.time)} r={7} fill={LINE_COLOR} stroke={INK} strokeWidth={1.5} />
          <text x={x(p.position)} y={y(p.time) - 14} fill={LINE_COLOR} fontSize="12" fontWeight="bold" textAnchor="middle" {...stroke}>
            {p.time.toFixed(1)} s
          </text>
        </g>
      ))}
      <text x={centre} y={top + 26} fill={LINE_COLOR} fontSize="12" fontWeight="bold" textAnchor="middle">
        {note}
      </text>
    </g>
  )
}

export function LevelLineSketch() {
  const sketch = levelLineSketchFor()
  return (
    <div style={{ margin: '0.75rem 0 1rem' }}>
      <p style={{ margin: '0 0 0.5rem', fontWeight: 'bold' }}>What a level line means (a sketch, not the real diagram)</p>
      <svg
        width={VIEW_WIDTH}
        height={VIEW_HEIGHT}
        viewBox={`0 0 ${VIEW_WIDTH} ${VIEW_HEIGHT}`}
        style={svgStyle}
        role="img"
        aria-label="A sketch with two pictures. On the left, two dots at the same height, 0.3 seconds, joined by a level line: the same moment. On the right, two dots at different heights, 0.2 and 0.3 seconds, joined by a leaning line: different moments."
      >
        <Panel centre={PANEL_CENTRES[0]} title="A LEVEL LINE" sketch={sketch.level} note="same height: the same moment" />
        <Panel centre={PANEL_CENTRES[1]} title="A LEANING LINE" sketch={sketch.leaning} note="different heights: different moments" />
      </svg>
      <CaptionBox>
        <p style={{ marginTop: 0, marginBottom: '0.5rem' }}>
          <strong>How to read this sketch.</strong>
        </p>
        <ul style={{ margin: '0 0 0.75rem', paddingLeft: '1.25rem' }}>
          <li>
            <strong>What it is.</strong> A small picture to help you read the real diagram further down. It has no block and no flash in
            it, and it does not show any result of the experiment. In both pictures, <strong>position</strong> runs across in
            light-seconds and <strong>time</strong> runs up in seconds.
          </li>
          <li>
            <strong>Each dot</strong> is an event: something that happens at one place and one moment. The height of a dot is the time it
            happens, and how far across it is shows where.
          </li>
          <li>
            <strong>The line</strong> joins the two dots. <strong>On the left</strong> the dots are at the same height, so the line is{' '}
            <strong>level</strong>. <strong>On the right</strong> the dots are at different heights, so the line <strong>leans</strong>.
          </li>
        </ul>
        <p style={{ margin: '0 0 0.75rem' }}>
          <strong>A worked moment.</strong> On the left both dots are at 0.3 s, so the line rises 0.3 − 0.3 = 0 s over 0.4 light-second
          across: it leans 0 ÷ 0.4 = 0. On the right the dots are at 0.2 s and 0.3 s, so the line rises 0.1 s over the same 0.4
          light-second: it leans 0.1 ÷ 0.4 = 0.25 s for every light-second.
        </p>
        <p style={{ margin: '0 0 0.25rem' }}>
          <strong>What to look for</strong>
        </p>
        <LookForList
          items={[
            {
              look: 'the two dots on the left and the level line between them.',
              means: 'both happen at 0.3 s, at the same moment, according to the lab.',
              matters: 'any level line on a diagram joins events that are at the same moment for the lab.',
            },
            {
              look: 'the two dots on the right and the leaning line between them.',
              means: 'one is at 0.2 s and the other at 0.3 s, 0.1 s apart, so the lab says they happen at different moments.',
              matters: 'a line that leans joins events at different moments, according to the lab. The lean, 0.25, says how much the time changes for each light-second across.',
            },
          ]}
        />
        <p style={{ margin: '0.75rem 0 0', fontSize: '0.8125rem' }}>
          <strong>Where this picture comes from.</strong> <em>Imagined for illustration:</em> the dots and their times. <em>Measured:</em>{' '}
          nothing. <em>Calculated here:</em> only the positions drawn, from the times and positions above.
        </p>
      </CaptionBox>
    </div>
  )
}
