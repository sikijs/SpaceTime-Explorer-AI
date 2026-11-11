import { sameMomentLeanFor, spacetimeDiagramFor } from '../physics/spacetimeDiagramView'
import type { SpacetimeDiagramData } from '../physics/spacetimeDiagramView'
import type { SimultaneityResult } from '../physics/relativityOfSimultaneityExperiment'
import { CaptionBox } from './Experiment6Pictures'
import { LookForList } from './WideBinariesExperiment'

// Relativity of Time and Motion, Experiment 9: the captions of the diagram (the diagram itself is the one of Experiment 8, drawn by
// SpacetimeDiagram in Experiment8Pictures.tsx with two more lines). Audited to the newer rules (docs/audit/
// relativity-of-time-and-motion/09-draft-wording.md, approved by the owner on 2026-11-10). Every number comes from the physics module
// (src/physics/spacetimeDiagramView.ts; CLAUDE.md §9). The wording is the owner's to approve line by line (CLAUDE.md §28.1).

const heading = { margin: '0 0 0.25rem' } as const
const list = { margin: '0 0 0.75rem', paddingLeft: '1.25rem' } as const

const signed = (n: number) => n.toFixed(3).replace('-', '−')

// Appears when the drawing starts; no times, no leans and no answers (CLAUDE.md §12).
export function DiagramCaption9({ speedLabel, part }: { speedLabel: string; part: 1 | 2 }) {
  return (
    <CaptionBox>
      <p style={heading}>
        <strong>How to read this diagram.</strong>
      </p>
      <ul style={list}>
        <li>
          <strong>The picture.</strong> A spacetime diagram of one flash and one block {part === 1 ? `moving at ${speedLabel}` : 'at the speed you chose'}:
          the one from &ldquo;Drawing Spacetime&rdquo;. <strong>Position</strong> runs across, in light-seconds (a light-second is the
          distance light travels in one second, about 300,000 km). <strong>Time</strong> runs up, in seconds, from the moment the flash was
          released. Both axes use the same scale, so no line&rsquo;s lean is stretched.
        </li>
        <li>
          <strong>The amber dot</strong> is the flash being released: position 0, time 0.
        </li>
        <li>
          <strong>The two solid lines</strong> are the block&rsquo;s two ends: <strong>blue</strong> is the back end, <strong>purple</strong>{' '}
          is the front end. <strong>The two dashed lines</strong> are the flash going towards each end, in the same colours.{' '}
          <strong>The dots</strong> appear where a dashed line meets the solid line of the same colour. Each is an <strong>event</strong>:
          the flash reaching that end. The number beside it is the time, in seconds.
        </li>
        <li>
          <strong>After the dots, two lines appear.</strong> Each one is a &ldquo;same moment&rdquo; line: a line that says &ldquo;every
          point on me happens at the same moment.&rdquo; They belong to two different people, so they are drawn in two different colours.
        </li>
        <li>
          <strong>The green line</strong> is the new one. It is drawn straight through the two dots. It belongs to the person riding on the
          block. Remember, that person says the flash reached the back end and the front end at the same moment. The two dots are exactly
          those two arrivals, so the green line is the line that joins them. It is the block&rsquo;s own &ldquo;same moment&rdquo; line.
        </li>
        <li>
          <strong>Why a &ldquo;same moment&rdquo; line can have two different heights.</strong> The height up the side of the diagram is
          the time on the <em>lab&rsquo;s</em> clocks. The person riding on the block uses their own clocks, not the lab&rsquo;s. By the
          rider&rsquo;s clocks the flash reached both ends at the same moment, even though the lab&rsquo;s clocks show two different times
          for those same two arrivals. So a line joining events that are &ldquo;the same moment&rdquo; for the rider does not have to be
          level on a diagram that is drawn with the lab&rsquo;s time going up.
        </li>
        <li>
          <strong>In short:</strong> for the lab, the flash reaches the back end and the front end at two different times. For the rider
          on the block, it reaches both ends at the same time. Neither is a mistake: both people are measuring the same two events, each
          with their own clocks.
        </li>
        <li>
          <strong>The green line is drawn by the lab&rsquo;s clock.</strong> Every height on this diagram, including each end of the
          green line, is read from the lab&rsquo;s clock. The times written beside the two dots are the lab&rsquo;s clock readings. The
          green line only joins the two dots; it does not show the rider&rsquo;s own clock readings, which are not drawn here.
        </li>
        <li>
          <strong>The pale grey dashed line</strong> belongs to the lab, the person standing still and watching. For the lab, a
          &ldquo;same moment&rdquo; line is a level line, the kind that does not lean up or down. It is drawn through the lower dot. It is
          there for one reason: so you can hold the block&rsquo;s line up against the lab&rsquo;s line and compare them.
        </li>
        {part === 1 ? (
          <li>
            <strong>The white marker</strong> (when the green line appears) is your guess. Its lean is only an example, not the real lean.
            It is only a marker.
          </li>
        ) : (
          <li>
            <strong>The pink writing</strong> shows the speed you chose. The scale is the same in every run, so you can compare runs.
          </li>
        )}
        <li>
          <strong>How it is drawn.</strong> The lines grow upward over a few seconds. Playback speed only changes how long the drawing
          takes, not what is drawn.
        </li>
        <li>
          <strong>When the drawing ends:</strong> the green and grey lines appear, and the worked moment and &ldquo;What to look for&rdquo;
          appear below.
        </li>
      </ul>
    </CaptionBox>
  )
}

// Appears when the drawing ends: it contains the numbers, so it waits until the guess is locked and the line is drawn.
export function WorkedMoment9({ result, diagram, part }: { result: SimultaneityResult; diagram: SpacetimeDiagramData; part: 1 | 2 }) {
  const v = result.velocity
  const back = diagram.backEvent
  const front = diagram.frontEvent
  const rise = front.time - back.time
  const across = front.position - back.position
  const lean = sameMomentLeanFor(diagram)
  const f = (n: number) => n.toFixed(3)
  const level = rise === 0
  return (
    <CaptionBox>
      <p style={{ ...heading, marginBottom: '0.5rem' }}>
        <strong>
          A worked moment, step by step ({part === 1 ? 'at' : 'for'} {v}c).
        </strong>
      </p>
      <ol style={list}>
        <li>
          The flash reaches the back end at <strong>{f(back.time)} s</strong>, at position <strong>{signed(back.position)}</strong> light-second,
          and the front end at <strong>{f(front.time)} s</strong>, at position <strong>{signed(front.position)}</strong> (the blue and purple
          dots, as in &ldquo;Drawing Spacetime&rdquo;).
        </li>
        <li>
          The green line passes through both dots. Going from the blue dot to the purple dot it rises {f(front.time)} − {f(back.time)} ={' '}
          <strong>{f(rise)} s</strong> while it goes {signed(front.position)} − ({signed(back.position)}) = <strong>{f(across)} light-second</strong>{' '}
          across.
        </li>
        <li>
          Its lean is {f(rise)} ÷ {f(across)} = <strong>{f(lean)} s for every light-second</strong>.
        </li>
        <li>
          {level
            ? 'A level line leans 0. The green line leans 0 as well, because both dots are at the same height: nothing is moving, so the block’s own “same moment” line lies on the lab’s.'
            : `A level line would lean 0 (it rises 0 s). The green line leans ${f(lean)}, so it is not level.`}
        </li>
      </ol>
    </CaptionBox>
  )
}

export function LookFor9({ result, diagram, part, runs }: { result: SimultaneityResult; diagram: SpacetimeDiagramData; part: 1 | 2; runs?: SimultaneityResult[] }) {
  const lean = sameMomentLeanFor(diagram)
  const items =
    part === 1
      ? [
          {
            look: 'the green line and the grey dashed line.',
            means: `the green line leans (${lean.toFixed(3)} s for every light-second) and the grey line is level (0).`,
            matters: 'the block’s own “same moment” line is a different line from the lab’s.',
          },
          {
            look: 'the two dots and the green line through them.',
            means: 'the green line passes through both events, the same two you already saw.',
            matters: 'nothing new was calculated. The line was already there in the two events; you only drew it.',
          },
          {
            look: 'the white marker and the green line.',
            means: 'the marker shows the choice you made, and its lean is only an example.',
            matters: 'it puts what you expected beside what was drawn.',
          },
        ]
      : [
          {
            look: 'the lean of the green line in each run of “Runs so far”.',
            means: `it is ${(runs ?? [result]).map((r) => `${sameMomentLeanFor(spacetimeDiagramFor(r)).toFixed(3)} at ${r.velocity}c`).join(', ')}.`,
            matters: 'it shows how much the block’s own line tilts away from the lab’s level line as the block goes faster.',
          },
          {
            look: 'the green line at 0c, if you have run it.',
            means: 'it lies on the grey level line, with no lean.',
            matters: 'it is the baseline: with no motion, the two views agree.',
          },
        ]
  return (
    <CaptionBox>
      <p style={{ ...heading, marginBottom: '0.5rem' }}>
        <strong>What to look for</strong>
      </p>
      <LookForList items={items} />
    </CaptionBox>
  )
}
