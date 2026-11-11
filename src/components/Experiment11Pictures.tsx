import { blockFrameEventsFor, checkUpRowsFor, clockRowsFor, lorentzWorkedNumbers, timeGuessMarkerFor } from '../physics/lorentzTransform'
import type { TimeChoice } from '../physics/lorentzTransform'
import type { SimultaneityResult } from '../physics/relativityOfSimultaneityExperiment'
import { GUESS_COLOR } from './Experiment8Pictures'
import { MUTED_COLOR, TEXT_COLOR, YOURS_COLOR, svgStyle } from './GravitationalWaveExperiment'
import { CaptionBox } from './Experiment6Pictures'
import { LookForList } from './WideBinariesExperiment'

// Relativity of Time and Motion, Experiment 11: the panel "The two events on two sets of clocks" with the white guess marker, and the
// captions, worked moment, look-fors and check-up table, audited to the newer rules (docs/audit/relativity-of-time-and-motion/
// 11-draft-wording.md, approved by the owner on 2026-11-11). Every number comes from the physics module (src/physics/lorentzTransform.ts;
// CLAUDE.md §9). The wording is the owner's to approve line by line (CLAUDE.md §28.1).

const BACK = '#60a5fa' // blue: the back end
const FRONT = '#a78bfa' // purple: the front end
const INK = '#0b1020'
const stroke = { stroke: INK, strokeWidth: 4, paintOrder: 'stroke' } as const

export const timeChoiceLabels: Record<TimeChoice, string> = { same: 'Same time', different: 'Different times' }
export const timeChoiceSentences: Record<TimeChoice, string> = {
  same: 'the two events will come out at the same time',
  different: 'the two events will come out at different times',
}

const trim = (n: number) => String(parseFloat(n.toFixed(3)))
const f3 = (n: number) => n.toFixed(3)

const W = 720
const LEFT = 170
const RIGHT = 580
const LAB_Y = 84
const BLOCK_Y = 176
const AXIS_Y = 262
const H = 312

export function ClocksPanel({
  result,
  scaleEnd,
  guess,
  pinkSpeed,
  label,
}: {
  result: SimultaneityResult
  scaleEnd: number
  guess: TimeChoice | null
  pinkSpeed: number | null
  label: string
}) {
  const rows = clockRowsFor(result, scaleEnd)
  const events = blockFrameEventsFor(result)
  const x = (fraction: number) => LEFT + fraction * (RIGHT - LEFT)
  const step = scaleEnd <= 0.5 ? 0.1 : 0.2
  const ticks: number[] = []
  for (let t = 0; t <= scaleEnd + 1e-9; t += step) ticks.push(parseFloat(t.toFixed(3)))
  const labOverlap = Math.abs(rows.lab.back.time - rows.lab.front.time) < 1e-9
  const blockOverlap = events.timesAgree

  const markers = (y: number, back: number, front: number, overlap: boolean) => (
    <g>
      {overlap ? (
        <>
          <circle cx={x(front)} cy={y} r={14} fill="none" stroke={FRONT} strokeWidth={4} />
          <circle cx={x(back)} cy={y} r={7} fill={BACK} stroke={INK} strokeWidth={1.5} />
        </>
      ) : (
        <>
          <circle cx={x(back)} cy={y} r={8} fill={BACK} stroke={INK} strokeWidth={1.5} />
          <circle cx={x(front)} cy={y} r={8} fill={FRONT} stroke={INK} strokeWidth={1.5} />
        </>
      )}
    </g>
  )

  const marker = () => {
    if (guess === null) return null
    const kind = timeGuessMarkerFor(guess)
    const boxX = LEFT
    const boxY = BLOCK_Y + 22
    const boxW = 400
    const cx = boxX + 40
    const tickTop = boxY + 5
    const tickBottom = boxY + 35
    const gapPx = kind.kind === 'apart' ? 22 : 0
    return (
      <g>
        <line x1={cx} y1={boxY} x2={cx} y2={BLOCK_Y + 14} stroke={GUESS_COLOR} strokeWidth={2} strokeDasharray="5 4" />
        <rect x={boxX} y={boxY} width={boxW} height={40} fill={INK} stroke={GUESS_COLOR} strokeWidth={3} rx={4} />
        {/* two white ticks, one above the other: level for "same time", one shifted along the time scale for "different times" */}
        <line x1={cx - gapPx / 2} y1={tickTop} x2={cx - gapPx / 2} y2={tickTop + 9} stroke={GUESS_COLOR} strokeWidth={4} />
        <line x1={cx + gapPx / 2} y1={tickBottom - 9} x2={cx + gapPx / 2} y2={tickBottom} stroke={GUESS_COLOR} strokeWidth={4} />
        <text x={boxX + 74} y={boxY + 17} fill={GUESS_COLOR} fontSize="13" fontWeight="bold">
          YOUR GUESS (a marker only):
        </text>
        <text x={boxX + 74} y={boxY + 33} fill={GUESS_COLOR} fontSize="13" fontWeight="bold">
          {timeChoiceSentences[guess]}
        </text>
      </g>
    )
  }

  return (
    <svg className="narrow-scroll" width={W} height={H} viewBox={`0 0 ${W} ${H}`} style={svgStyle} role="img" aria-label={label}>
      <text x={14} y={22} fill={TEXT_COLOR} fontSize="13" fontWeight="bold">
        THE TWO EVENTS ON TWO SETS OF CLOCKS
      </text>
      {pinkSpeed !== null && (
        <text x={W - 14} y={22} fill={YOURS_COLOR} fontSize="13" fontWeight="bold" textAnchor="end">
          your speed: {pinkSpeed}c
        </text>
      )}

      <text x={14} y={LAB_Y - 2} fill={TEXT_COLOR} fontSize="12" fontWeight="bold">
        The lab&rsquo;s clocks
      </text>
      <text x={14} y={LAB_Y + 13} fill={MUTED_COLOR} fontSize="10">
        (standing still)
      </text>
      <line x1={LEFT} y1={LAB_Y} x2={RIGHT} y2={LAB_Y} stroke={MUTED_COLOR} strokeWidth={2} />
      {markers(LAB_Y, rows.lab.back.fraction, rows.lab.front.fraction, labOverlap)}
      {labOverlap ? (
        <text x={x(rows.lab.back.fraction)} y={LAB_Y + 34} fill={TEXT_COLOR} fontSize="12" fontWeight="bold" textAnchor="middle" {...stroke}>
          Back and front events: {f3(rows.lab.back.time)} s
        </text>
      ) : (
        <>
          <text x={x(rows.lab.back.fraction) + 10} y={LAB_Y + 32} fill={BACK} fontSize="12" fontWeight="bold" textAnchor="end" {...stroke}>
            Back end reached {f3(rows.lab.back.time)} s
          </text>
          <text x={x(rows.lab.front.fraction) - 10} y={LAB_Y + 32} fill={FRONT} fontSize="12" fontWeight="bold" textAnchor="start" {...stroke}>
            Front end reached {f3(rows.lab.front.time)} s
          </text>
        </>
      )}

      <text x={14} y={BLOCK_Y - 2} fill={TEXT_COLOR} fontSize="12" fontWeight="bold">
        The block&rsquo;s own clocks
      </text>
      <text x={14} y={BLOCK_Y + 13} fill={MUTED_COLOR} fontSize="10">
        (riding along with it)
      </text>
      <line x1={LEFT} y1={BLOCK_Y} x2={RIGHT} y2={BLOCK_Y} stroke={MUTED_COLOR} strokeWidth={2} />
      {markers(BLOCK_Y, rows.block.back.fraction, rows.block.front.fraction, blockOverlap)}
      {blockOverlap ? (
        <text x={x(rows.block.back.fraction)} y={BLOCK_Y - 22} fill={TEXT_COLOR} fontSize="12" fontWeight="bold" textAnchor="middle" {...stroke}>
          Back and front events: {f3(rows.block.back.time)} s
        </text>
      ) : (
        <>
          <text x={x(rows.block.back.fraction) + 10} y={BLOCK_Y - 16} fill={BACK} fontSize="12" fontWeight="bold" textAnchor="end" {...stroke}>
            Back end reached {f3(rows.block.back.time)} s
          </text>
          <text x={x(rows.block.front.fraction) - 10} y={BLOCK_Y - 16} fill={FRONT} fontSize="12" fontWeight="bold" textAnchor="start" {...stroke}>
            Front end reached {f3(rows.block.front.time)} s
          </text>
        </>
      )}

      <line x1={LEFT} y1={AXIS_Y} x2={RIGHT} y2={AXIS_Y} stroke={TEXT_COLOR} strokeWidth={1.5} />
      {ticks.map((t) => (
        <g key={t}>
          <line x1={x(t / scaleEnd)} y1={AXIS_Y} x2={x(t / scaleEnd)} y2={AXIS_Y + 5} stroke={MUTED_COLOR} strokeWidth={1.5} />
          <text x={x(t / scaleEnd)} y={AXIS_Y + 19} fill={MUTED_COLOR} fontSize="11" textAnchor="middle">
            {trim(t)}
          </text>
        </g>
      ))}
      <text x={(LEFT + RIGHT) / 2} y={AXIS_Y + 40} fill={TEXT_COLOR} fontSize="12" fontWeight="bold" textAnchor="middle">
        clock reading (seconds) →
      </text>
      <text x={14} y={AXIS_Y + 40} fill={MUTED_COLOR} fontSize="10">
        0 s: the flash is released
      </text>
      {marker()}
    </svg>
  )
}

// ---- Captions ----

const nameList = { margin: 0, paddingLeft: '1.25rem' } as const

// Appears when the drawing starts; no times and no answers (CLAUDE.md §12).
export function DiagramCaption11({ speedLabel, part }: { speedLabel: string; part: 1 | 2 }) {
  return (
    <CaptionBox>
      <p style={{ marginTop: 0, marginBottom: '0.5rem' }}>
        <strong>{part === 1 ? 'How to read this diagram.' : 'How to read the diagram at your speed.'}</strong>
      </p>
      <ul style={nameList}>
        <li>
          <strong>The picture.</strong> The spacetime diagram of &ldquo;Same time, different line&rdquo;, for a block moving at{' '}
          {speedLabel}: <strong>position</strong> runs across, in light-seconds (a light-second is the distance light travels in one
          second, about 300,000 km), and <strong>time</strong> runs up, in seconds, from the moment the flash was released. Both axes
          use the same scale, so no line&rsquo;s lean is stretched.
        </li>
        <li>
          <strong>The amber dot</strong> is the flash being released. <strong>The two solid lines</strong> are the block&rsquo;s two ends
          (blue back, purple front); <strong>the two dashed lines</strong> are the flash going toward each end. <strong>The dots</strong>{' '}
          are the two events, the flash reaching each end, with the lab&rsquo;s time beside each.
        </li>
        <li>
          <strong>The green line</strong> is the line from &ldquo;Same time, different line&rdquo; through the two dots: the block&rsquo;s
          own idea of &ldquo;the same moment&rdquo;.
        </li>
        <li>
          <strong>After the dots, the two orange lines appear.</strong> <strong>The solid orange line</strong> is{' '}
          <strong>the block&rsquo;s own time axis</strong>: where the block&rsquo;s centre is at every moment.{' '}
          <strong>The dashed orange line</strong> is <strong>the block&rsquo;s own space axis</strong>: the block&rsquo;s own &ldquo;same
          moment&rdquo; line, but through the origin instead of through the two dots. Both are tilted because the block is moving. They
          have no tick marks: they show direction only.
        </li>
        <li>
          <strong>How it is drawn.</strong> The lines grow upward over a few seconds. Playback speed only changes how long the drawing
          takes, not what is drawn.
        </li>
        <li>
          <strong>The panel</strong> (when the orange lines have appeared) has two rows on one time scale: <strong>the lab&rsquo;s
          clocks</strong> (the times you already know) and <strong>the block&rsquo;s own clocks</strong> (the times found by the Lorentz
          transformation).
          {part === 1 && (
            <>
              {' '}
              <strong>The white marker</strong> is your guess: two white ticks, level for &ldquo;same time&rdquo; and apart for
              &ldquo;different times&rdquo;. It is only a marker: how far apart the ticks are is an example, not the real gap.
            </>
          )}
          {part === 2 && (
            <>
              {' '}
              The pink shows your chosen speed. The scale is the same in every run.
            </>
          )}
        </li>
      </ul>
    </CaptionBox>
  )
}

// The worked moment appears when the panel does (it states the answer to the guess).
export function WorkedMoment11({ result, part }: { result: SimultaneityResult; part: 1 | 2 }) {
  const events = blockFrameEventsFor(result)
  const back = lorentzWorkedNumbers(events.lab.back, result.velocity)
  const front = lorentzWorkedNumbers(events.lab.front, result.velocity)
  const v = result.velocity
  return (
    <CaptionBox>
      <p style={{ marginTop: 0, marginBottom: '0.5rem' }}>
        <strong>A worked moment{part === 2 ? ` at ${v}c` : ''}.</strong> At {v}c, on the lab&rsquo;s clocks the back event is at
        position {f3(events.lab.back.position)} light-seconds and time {f3(events.lab.back.time)} s, and the front event is at position{' '}
        {f3(events.lab.front.position)} light-seconds and time {f3(events.lab.front.time)} s. The time dilation factor is{' '}
        {f3(back.factor)}, so 1 ÷ {f3(back.factor)} = {f3(back.inverseFactor)}.
      </p>
      <ul style={nameList}>
        <li>
          Back event: {f3(back.inverseFactor)} × ({f3(events.lab.back.time)} − {v} × {f3(events.lab.back.position)}) = {f3(back.inverseFactor)}{' '}
          × {f3(back.timeTerm)} = <strong>{f3(back.blockTime)} s</strong>.
        </li>
        <li>
          Front event: {f3(front.inverseFactor)} × ({f3(events.lab.front.time)} − {v} × {f3(events.lab.front.position)}) ={' '}
          {f3(front.inverseFactor)} × {f3(front.timeTerm)} = <strong>{f3(front.blockTime)} s</strong>.
        </li>
        {v === 0 && <li>At 0c the factor is 1 and the transformation changes nothing.</li>}
      </ul>
    </CaptionBox>
  )
}

export function LookFor11({ result, part, runs }: { result: SimultaneityResult; part: 1 | 2; runs?: SimultaneityResult[] }) {
  const events = blockFrameEventsFor(result)
  const v = result.velocity
  const labGap = events.lab.front.time - events.lab.back.time
  const items =
    part === 1
      ? [
          {
            look: 'the two orange axes, and where they lean.',
            means: `The block’s own time axis moves ${v} light-second across for every second up, which is the block’s speed, ${v}c. The block’s own space axis rises ${v} s for every light-second across.`,
            matters: 'The block’s own “time” and “same moment” are tilted on the lab’s diagram, and the tilt is the block’s speed.',
          },
          {
            look: 'the “block’s own clocks” row of the panel.',
            means: `Both events are at ${f3(events.block.back.time)} s.`,
            matters: 'The block’s own clocks say the two events happened at the same time.',
          },
          {
            look: 'the “lab’s clocks” row beside it.',
            means: `The same two events are at ${f3(events.lab.back.time)} s and ${f3(events.lab.front.time)} s, so ${f3(labGap)} s apart.`,
            matters: 'The lab and the block describe the very same events with different times, as “At the same time... for whom?” found.',
          },
          {
            look: 'the white marker and the two rows.',
            means: 'The marker shows the choice you made; how far apart its ticks are is only an example.',
            matters: 'It puts what you expected beside what the clocks gave.',
          },
        ]
      : [
          {
            look: 'the “block’s own clocks” row in each run of “Runs so far”.',
            means: `It reads ${f3(events.block.back.time)} s for both events at every speed you try, at 0c too.`,
            matters: 'The block’s own clocks give the same time for the two events whatever the speed, while the lab’s times change.',
          },
          {
            look: 'the orange axes at 0c, if you have run it.',
            means: 'They lie on the lab’s own up and across.',
            matters: 'With no motion there is nothing to tilt.',
          },
        ]
  void runs
  return (
    <CaptionBox>
      <p style={{ marginTop: 0, marginBottom: '0.5rem' }}>
        <strong>What to look for.</strong>
      </p>
      <LookForList items={items} />
    </CaptionBox>
  )
}

// The check-up table: the transformation's results beside numbers earlier chapters worked out by other routes.
export function CheckUpTable({ result }: { result: SimultaneityResult }) {
  const rows = checkUpRowsFor(result)
  const unit = (i: number) => (i < 2 ? 's' : 'light-seconds')
  const source = (i: number) =>
    i < 2
      ? '“At the same time... for whom?”: half the block’s length at rest, divided by c'
      : '“Does motion change length?”: half the block’s length at rest'
  const cell = { padding: '0.35rem 0.6rem', borderBottom: '1px solid var(--border)', textAlign: 'left', verticalAlign: 'top' } as const
  return (
    <div style={{ overflowX: 'auto' }}>
      <table className="stack-on-narrow" style={{ borderCollapse: 'collapse', fontSize: '0.8125rem', width: '100%' }}>
        <thead>
          <tr>
            <th style={cell}>What we checked</th>
            <th style={cell}>Expected (and where it comes from)</th>
            <th style={cell}>Found (by the transformation)</th>
            <th style={cell}>How they compare</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((row, i) => (
            <tr key={row.label}>
              <td style={cell} data-label="What we checked">{row.label.replace("block's", 'block’s')}</td>
              <td style={cell} data-label="Expected (and where it comes from)">
                {f3(row.expected)} {unit(i)} ({source(i)})
              </td>
              <td style={cell} data-label="Found (by the transformation)">
                {f3(row.found)} {unit(i)}
              </td>
              <td style={cell} data-label="How they compare">
                <strong>{row.reading === 'the same' ? 'The same' : row.reading === 'more' ? 'More' : 'Less'}</strong>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
