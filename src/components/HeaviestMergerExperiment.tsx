import { useEffect, useState } from 'react'
import type { ReactNode } from 'react'
import { exampleMerger, GAP_MEASURED_LOW_SOLAR, GAP_THEORY_SOLAR, GW231123, massRuler, mergerCheckUp, POSSIBLE_CHOICES, guessSpin, LOG_AXIS_MAX_SOLAR, LOG_AXIS_MIN_SOLAR, MASS_CHOICES_SOLAR, ROUND_CHOICES, SPIN_GUESS_CHOICES, spinPicture, trialPicture } from '../physics/heaviestMerger'
import type { PossibleChoice, SpinGuessChoice } from '../physics/heaviestMerger'
import { ReferencePanel } from './EnergyMomentumExperiment'
import { LookForList } from './WideBinariesExperiment'
import type { LookFor } from './WideBinariesExperiment'

// Frontier and Beyond, Experiment 20 (docs/experiments/frontier-and-beyond/20-the-heaviest-merger.md).
// STEPS 2 to 6 (the interface skeleton and the introduction, the two predictions, the run and Picture 1, Picture 2, then Part 2: the learner's own climb): this file has the title, the status line, the introduction, one illustration (two ways a very heavy star can end, to explain
// "the gap") with its guide, the new-word list, the collapsed "Words and formulas" panel and the "Want to know more?" links. It also has the two predictions (Part 1), and Run only records them. It has no run, pictures, results, tutor or
// chapter summary yet; those are later steps (CLAUDE.md §6). All wording is a DRAFT for the owner's line-by-line approval (CLAUDE.md §28.1), written to the standard of §29. Nothing here
// says that merging can fill the gap, what a merger's remnant spin is, or what the spins of GW231123 were (CLAUDE.md §12): those are the predictions' answers and the run's results.
// The links that give them away (LIGO's summary, the Monash article, the papers) are listed only after the run, in a later step.

const VIEW_WIDTH = 560
const TEXT_COLOR = '#e2e8f0'
const MUTED_COLOR = '#94a3b8'
const STAR_COLOR = '#fbbf24' // amber: a star
const BLACK_HOLE_COLOR = '#f87171' // red: a black hole and its horizon
const BLAST_COLOR = '#fb923c' // orange: an explosion
const GAP_COLOR = '#e879f9' // pink-purple: the gap (from theory)
const MEASURED_COLOR = '#34d399' // green: a value measured by the detectors
const IMAGINED_COLOR = '#2dd4bf' // teal: imagined for the question, and calculated here from imagined values
const YOURS_COLOR = '#ffffff' // white: the learner's guess

function ExternalLink({ href, children }: { href: string; children: ReactNode }) {
  return (
    <a href={href} target="_blank" rel="noopener noreferrer">
      {children}
    </a>
  )
}

const svgStyle = {
  display: 'block',
  maxWidth: '100%',
  height: 'auto',
  border: '1px solid var(--border-color, #ccc)',
  borderRadius: '8px',
  overflow: 'hidden',
  backgroundColor: '#0b1020',
} as const

const paragraph = { marginTop: 0, marginBottom: '0.75rem' } as const

function SvgLines({ x, y, lines, fill, size = 10, bold = false, anchor = 'start' }: { x: number; y: number; lines: string[]; fill: string; size?: number; bold?: boolean; anchor?: 'start' | 'middle' | 'end' }) {
  return (
    <text x={x} y={y} fill={fill} fontSize={size} fontWeight={bold ? 'bold' : 'normal'} textAnchor={anchor}>
      {lines.map((line, i) => (
        <tspan key={i} x={x} dy={i === 0 ? 0 : size + 3}>
          {line}
        </tspan>
      ))}
    </text>
  )
}

// A sketch of two ways a star can end. No sizes, no masses, no numbers: it shows the idea of "the gap" and nothing that a prediction asks.
function TwoEndingsDrawing() {
  const height = 430
  const cy = 190
  const spikes = [0, 45, 90, 135, 180, 225, 270, 315]
  return (
    <svg
      width={VIEW_WIDTH}
      height={height}
      viewBox={`0 0 ${VIEW_WIDTH} ${height}`}
      style={svgStyle}
      role="img"
      aria-label="Illustration, not to scale, in two panels. Panel one: a heavy star in amber, then an arrow, then a small dark black hole with a red outline, labelled the star leaves a black hole behind. Panel two: a still heavier star in amber, then an arrow, then an orange burst of lines with nothing at its centre, labelled the star blows itself apart and leaves nothing behind. Below, the words a gap in black hole masses: black holes of the masses in between are not expected to form from a single star."
    >
      <text x={20} y={22} fill={TEXT_COLOR} fontSize="13" fontWeight="bold">
        Illustration: two ways a very heavy star can end
      </text>

      {/* Panel 1: a star that leaves a black hole. */}
      <SvgLines x={20} y={52} lines={['1. Most heavy stars: a black hole is left']} fill={TEXT_COLOR} bold size={12} />
      <circle cx={70} cy={cy} r={34} fill={STAR_COLOR} stroke="#b45309" strokeWidth={2} />
      <SvgLines x={70} y={cy + 4} lines={['a heavy', 'star']} fill="#451a03" bold size={10} anchor="middle" />
      <line x1={112} y1={cy} x2={160} y2={cy} stroke={TEXT_COLOR} strokeWidth={2} />
      <polygon points={`168,${cy} 156,${cy - 6} 156,${cy + 6}`} fill={TEXT_COLOR} />
      <circle cx={210} cy={cy} r={16} fill="#05070f" stroke={BLACK_HOLE_COLOR} strokeWidth={3} />
      <SvgLines x={210} y={cy + 40} lines={['a black hole']} fill={BLACK_HOLE_COLOR} bold anchor="middle" />
      <SvgLines x={140} y={cy + 100} lines={['the star’s core collapses,', 'and a black hole is left']} fill={MUTED_COLOR} anchor="middle" size={11} />

      <line x1={280} y1={44} x2={280} y2={350} stroke={MUTED_COLOR} strokeWidth={1} strokeDasharray="4 4" />

      {/* Panel 2: a star that blows itself apart. */}
      <SvgLines x={296} y={52} lines={['2. The heaviest stars: nothing is left']} fill={TEXT_COLOR} bold size={12} />
      <circle cx={340} cy={cy} r={40} fill={STAR_COLOR} stroke="#b45309" strokeWidth={2} />
      <SvgLines x={340} y={cy + 4} lines={['a still', 'heavier star']} fill="#451a03" bold size={10} anchor="middle" />
      <line x1={390} y1={cy} x2={430} y2={cy} stroke={TEXT_COLOR} strokeWidth={2} />
      <polygon points={`438,${cy} 426,${cy - 6} 426,${cy + 6}`} fill={TEXT_COLOR} />
      {spikes.map((a) => {
        const r1 = 12
        const r2 = 40
        const rad = (a * Math.PI) / 180
        return <line key={a} x1={500 + r1 * Math.cos(rad)} y1={cy + r1 * Math.sin(rad)} x2={500 + r2 * Math.cos(rad)} y2={cy + r2 * Math.sin(rad)} stroke={BLAST_COLOR} strokeWidth={4} strokeLinecap="round" />
      })}
      <SvgLines x={500} y={cy + 66} lines={['a blast', 'with nothing left']} fill={BLAST_COLOR} bold anchor="middle" />
      <SvgLines x={420} y={cy + 100} lines={['the star blows itself', 'apart, so no black hole', 'is made']} fill={MUTED_COLOR} anchor="middle" size={11} />

      {/* The gap, as a words-only strip: no numbers. */}
      <rect x={20} y={348} width={520} height={34} rx={4} fill="none" stroke={GAP_COLOR} strokeWidth={2} strokeDasharray="6 4" />
      <SvgLines x={280} y={369} lines={['The gap: black holes of the masses in between are not expected from a single star']} fill={GAP_COLOR} bold size={11} anchor="middle" />

      <SvgLines
        x={20}
        y={height - 28}
        lines={['A sketch. Not to scale. No real mass, size or number is drawn. Which stars end which way, and the masses', 'where the change happens, are in the text above and the pictures that come after the run.']}
        fill={MUTED_COLOR}
        size={9}
      />
    </svg>
  )
}


// ---- The run: stages. The timer only paces the display; no number depends on it (CLAUDE.md §11). ----
const STAGE_MS = 2600
const LAST_STAGE = 6
const STAGE_NAMES = ['', 'The two black holes that merged', 'The black hole they made', 'The gap', 'A check by hand', 'The spins', 'What a simple merger gives']
const STAGE_LINES = [
  '',
  'Picture 1, panel A, draws the two black holes that merged, as the teams measured them, each with its give-or-take.',
  'Panel A now shows the black hole that they made.',
  'Panel A now shows the gap, in pink: the range from theory, and the lower edge measured in a 2025 study.',
  'Panel B does a check by hand with two imagined black holes. Your guess for Prediction 1 is drawn on it in white.',
  'Picture 2 draws the spins of the two black holes that merged, as the teams measured them, each with its give-or-take.',
  'Picture 2 now shows the spin that a merger of two equal black holes that are not spinning gives, from a published calculation. Your guess for Prediction 2 is drawn on it in white.',
]

const P_X0 = 60
const P_X1 = 520
const P_W = P_X1 - P_X0

const GAP_ARROW_COLOR = '#fbbf24' // amber: how much higher a measured spin is than the simple-merger value
const PART_TWO_COLOR = '#0d9488'
const CALC_COLOR = '#38bdf8' // sky blue: a published result that this page uses but did not calculate

const POSSIBLE_PHRASE: Record<PossibleChoice, string> = { no: 'no, it could not', yes: 'yes, it could', unsure: 'not sure' }
const POSSIBLE_GLYPH: Record<PossibleChoice, string> = { no: '✗', yes: '✓', unsure: '?' }

function PictureOne({ stage, possibleGuess }: { stage: number; possibleGuess: PossibleChoice | null }) {
  const ruler = massRuler()
  const ex = exampleMerger()
  const x = (m: number) => P_X0 + (m / ruler.axisMaxSolar) * P_W
  const ticks = [0, 50, 100, 150, 200, 250, 300]
  const rowY = [112, 164, 216]
  const axisA = 250
  const topA = 72
  const panelB = 312
  const rowB = 352
  const axisB = 412
  const height = stage >= 4 ? 462 : 292
  const gap = ruler.gapTheory
  const low = ruler.gapMeasuredLow
  const labels = ['Heavier black hole', 'Lighter black hole', 'The black hole they made']
  const marks = ruler.marks.slice(0, stage >= 2 ? 3 : 2)
  const bandA = stage >= 3 && (
    <g>
      <rect x={x(gap.low)} y={topA} width={x(gap.high) - x(gap.low)} height={axisA - topA} fill={GAP_COLOR} opacity={0.18} />
      <line x1={x(low.value)} y1={topA} x2={x(low.value)} y2={axisA} stroke={GAP_COLOR} strokeWidth={2} strokeDasharray="5 4" />
      <line x1={x(low.value - low.minus)} y1={topA + 4} x2={x(low.value + low.plus)} y2={topA + 4} stroke={GAP_COLOR} strokeWidth={3} />
      <SvgLines x={x(low.value) - 6} y={topA + 16} lines={['measured lower edge:', `${low.value} (+${low.plus}, −${low.minus})`]} fill={GAP_COLOR} size={9} anchor="end" />
    </g>
  )
  return (
    <svg
      width={VIEW_WIDTH}
      height={height}
      viewBox={`0 0 ${VIEW_WIDTH} ${height}`}
      style={svgStyle}
      role="img"
      aria-label={`Picture 1, a ruler of black hole masses in Suns from 0 to ${ruler.axisMaxSolar}. Panel A, measured: the heavier black hole, about ${ruler.marks[0].massSolar} Suns, range ${ruler.marks[0].lowSolar} to ${ruler.marks[0].highSolar}; the lighter, about ${ruler.marks[1].massSolar}, range ${ruler.marks[1].lowSolar} to ${ruler.marks[1].highSolar}.${
        stage >= 2 ? ` The black hole they made, more than ${GW231123.finalBestFitSolar}, range ${ruler.marks[2].lowSolar} to ${ruler.marks[2].highSolar}.` : ''
      }${stage >= 3 ? ` A pink band for the gap from ${gap.low} to ${gap.high} Suns, and a dashed pink line for the lower edge measured in a 2025 study, ${low.value}.` : ''}${
        stage >= 4 ? ` Panel B, imagined: two black holes of ${ex.startSolar} Suns, below the gap, make one of ${ex.resultSolar} Suns, inside the gap.${possibleGuess ? ` Your guess for Prediction 1, ${POSSIBLE_PHRASE[possibleGuess]}, is drawn in white as a marker.` : ''}` : ''
      }`}
    >
      <text x={20} y={22} fill={TEXT_COLOR} fontSize="13" fontWeight="bold">
        Picture 1: the merger on a ruler of masses
      </text>
      <SvgLines x={20} y={40} lines={['masses in Suns (the Sun is 1), as they were at the black holes’ own place and time']} fill={MUTED_COLOR} />

      <SvgLines x={P_X0} y={62} lines={['A. GW231123, as measured']} fill={TEXT_COLOR} bold size={11} />
      {bandA}
      {marks.map((m, i) => (
        <g key={m.label}>
          <SvgLines
            x={i === 2 ? x(m.highSolar) : x(m.lowSolar)}
            y={rowY[i] - 14}
            lines={[`${labels[i]}: ${i === 2 ? 'more than ' : 'about '}${m.massSolar} (${m.lowSolar} to ${m.highSolar})`]}
            fill={MEASURED_COLOR}
            size={10}
            bold
            anchor={i === 2 ? 'end' : 'start'}
          />
          <line x1={x(m.lowSolar)} y1={rowY[i]} x2={x(m.highSolar)} y2={rowY[i]} stroke={MEASURED_COLOR} strokeWidth={3} />
          <line x1={x(m.lowSolar)} y1={rowY[i] - 6} x2={x(m.lowSolar)} y2={rowY[i] + 6} stroke={MEASURED_COLOR} strokeWidth={2} />
          <line x1={x(m.highSolar)} y1={rowY[i] - 6} x2={x(m.highSolar)} y2={rowY[i] + 6} stroke={MEASURED_COLOR} strokeWidth={2} />
          <circle cx={x(m.massSolar)} cy={rowY[i]} r={6} fill={MEASURED_COLOR} />
        </g>
      ))}
      {stage >= 3 && <SvgLines x={x(ruler.marks[1].highSolar) + 10} y={rowY[1] + 4} lines={[`${ruler.lighterInGapPercent} percent chance`, 'this one is in the gap']} fill={GAP_COLOR} size={9} />}
      <line x1={P_X0} y1={axisA} x2={P_X1} y2={axisA} stroke={MUTED_COLOR} strokeWidth={1} />
      {ticks.map((t) => (
        <g key={t}>
          <line x1={x(t)} y1={axisA} x2={x(t)} y2={axisA + 5} stroke={MUTED_COLOR} />
          <SvgLines x={x(t)} y={axisA + 17} lines={[String(t)]} fill={MUTED_COLOR} size={9} anchor="middle" />
        </g>
      ))}
      <SvgLines x={P_X1} y={axisA + 31} lines={['mass in Suns']} fill={MUTED_COLOR} size={9} anchor="end" />
      {stage >= 3 && <SvgLines x={P_X0} y={axisA + 31} lines={[`pink band: the gap from theory, ${gap.low} to ${gap.high}`]} fill={GAP_COLOR} size={9} />}

      {stage >= 4 && (
        <g>
          <SvgLines x={P_X0} y={panelB} lines={['B. A check by hand (imagined starting masses, calculated here)']} fill={TEXT_COLOR} bold size={11} />
          <rect x={x(gap.low)} y={panelB + 10} width={x(gap.high) - x(gap.low)} height={axisB - panelB - 10} fill={GAP_COLOR} opacity={0.18} />
          <SvgLines x={x(ex.startSolar) - 8} y={rowB - 14} lines={[`two black holes of ${ex.startSolar}`]} fill={IMAGINED_COLOR} size={10} bold anchor="middle" />
          <circle cx={x(ex.startSolar)} cy={rowB - 4} r={6} fill={IMAGINED_COLOR} />
          <circle cx={x(ex.startSolar)} cy={rowB + 8} r={6} fill={IMAGINED_COLOR} />
          <line x1={x(ex.startSolar) + 12} y1={rowB + 2} x2={x(ex.resultSolar) - 14} y2={rowB + 2} stroke={TEXT_COLOR} strokeWidth={2} />
          <polygon points={`${x(ex.resultSolar) - 8},${rowB + 2} ${x(ex.resultSolar) - 18},${rowB - 4} ${x(ex.resultSolar) - 18},${rowB + 8}`} fill={TEXT_COLOR} />
          <circle cx={x(ex.resultSolar)} cy={rowB + 2} r={8} fill={IMAGINED_COLOR} />
          <SvgLines x={x(ex.resultSolar) + 14} y={rowB - 8} lines={[`${ex.startSolar} + ${ex.startSolar} = ${ex.sumSolar}, minus ${Math.round(ex.share * 100)} percent`, `(${ex.radiatedSolar} Suns sent out as waves) = ${ex.resultSolar}`]} fill={IMAGINED_COLOR} size={10} bold />
          {possibleGuess && (
            <g>
              <text x={x(ex.resultSolar)} y={rowB + 42} fill={YOURS_COLOR} fontSize={26} fontWeight="bold" textAnchor="middle">
                {POSSIBLE_GLYPH[possibleGuess]}
              </text>
              <line x1={x(ex.resultSolar) + 12} y1={rowB + 32} x2={x(ex.resultSolar) + 26} y2={rowB + 32} stroke={YOURS_COLOR} strokeWidth={2} />
              <rect x={x(ex.resultSolar) + 26} y={rowB + 18} width={230} height={28} rx={4} fill="#0b1020" stroke={YOURS_COLOR} strokeWidth={2.5} />
              <SvgLines x={x(ex.resultSolar) + 141} y={rowB + 36} lines={[`YOUR GUESS: ${POSSIBLE_PHRASE[possibleGuess]}`]} fill={YOURS_COLOR} bold size={10} anchor="middle" />
            </g>
          )}
          <line x1={P_X0} y1={axisB} x2={P_X1} y2={axisB} stroke={MUTED_COLOR} strokeWidth={1} />
          {ticks.map((t) => (
            <g key={t}>
              <line x1={x(t)} y1={axisB} x2={x(t)} y2={axisB + 5} stroke={MUTED_COLOR} />
              <SvgLines x={x(t)} y={axisB + 17} lines={[String(t)]} fill={MUTED_COLOR} size={9} anchor="middle" />
            </g>
          ))}
          <SvgLines x={P_X1} y={axisB + 31} lines={['mass in Suns']} fill={MUTED_COLOR} size={9} anchor="end" />
        </g>
      )}
    </svg>
  )
}


function PictureTwo({ stage, spinGuess }: { stage: number; spinGuess: SpinGuessChoice | null }) {
  const pic = spinPicture()
  const x = (v: number) => P_X0 + (v / pic.axisMax) * P_W
  const rowY = [140, 206]
  const axisY = 268
  const height = stage >= 6 ? 360 : 306
  const ticks = [0, 0.2, 0.4, 0.6, 0.8, 1]
  const guess = spinGuess === null ? null : guessSpin(spinGuess)
  const boxW = 210
  const boxX = guess === null ? 0 : Math.min(Math.max(x(guess) - boxW / 2, 20), VIEW_WIDTH - boxW - 20)
  return (
    <svg
      width={VIEW_WIDTH}
      height={height}
      viewBox={`0 0 ${VIEW_WIDTH} ${height}`}
      style={svgStyle}
      role="img"
      aria-label={`Picture 2, the spins, on a scale from 0, not turning, to 1, as fast as is possible. In green, as measured: the heavier black hole, spin about ${pic.rows[0].value}, range ${pic.rows[0].low} to ${pic.rows[0].high}; the lighter, about ${pic.rows[1].value}, range ${pic.rows[1].low} to ${pic.rows[1].high}.${
        stage >= 6 ? ` A dashed blue line at ${pic.simple}, the published spin of the black hole made by two equal black holes that do not spin.${spinGuess ? ` Your guess for Prediction 2, about ${spinGuess}, is drawn in white.` : ''}` : ''
      }`}
    >
      <text x={20} y={22} fill={TEXT_COLOR} fontSize="13" fontWeight="bold">
        Picture 2: the spins
      </text>
      <SvgLines x={20} y={40} lines={['spin: 0 is not turning, 1 is the fastest possible']} fill={MUTED_COLOR} />
      <SvgLines x={P_X0} y={62} lines={['A. GW231123, as measured']} fill={TEXT_COLOR} bold size={11} />

      {pic.rows.map((r, i) => (
        <g key={r.label}>
          <SvgLines
            x={x(pic.simple) - 8}
            y={rowY[i] - 14}
            lines={[`${r.label === 'Heavier black hole' ? 'Heavier' : 'Lighter'}: about ${r.value.toFixed(2)} (${r.low.toFixed(2)} to ${r.high.toFixed(2)})`]}
            fill={MEASURED_COLOR}
            size={10}
            bold
            anchor="end"
          />
          <line x1={x(r.low)} y1={rowY[i]} x2={x(r.high)} y2={rowY[i]} stroke={MEASURED_COLOR} strokeWidth={3} />
          <line x1={x(r.low)} y1={rowY[i] - 6} x2={x(r.low)} y2={rowY[i] + 6} stroke={MEASURED_COLOR} strokeWidth={2} />
          <line x1={x(r.high)} y1={rowY[i] - 6} x2={x(r.high)} y2={rowY[i] + 6} stroke={MEASURED_COLOR} strokeWidth={2} />
          <circle cx={x(r.value)} cy={rowY[i]} r={6} fill={MEASURED_COLOR} />
          {stage >= 6 && (
            <g>
              <line x1={x(pic.simple)} y1={rowY[i] + 14} x2={x(r.value) - 4} y2={rowY[i] + 14} stroke={GAP_ARROW_COLOR} strokeWidth={1.5} />
              <polygon points={`${x(r.value)},${rowY[i] + 14} ${x(r.value) - 8},${rowY[i] + 10} ${x(r.value) - 8},${rowY[i] + 18}`} fill={GAP_ARROW_COLOR} />
              <SvgLines x={x(pic.simple) + 6} y={rowY[i] + 28} lines={[`${r.gapFromSimple.toFixed(2)} more than the simple merger gives`]} fill={GAP_ARROW_COLOR} size={9} />
            </g>
          )}
        </g>
      ))}

      {stage >= 6 && (
        <g>
          <line x1={x(pic.simple)} y1={76} x2={x(pic.simple)} y2={axisY} stroke={CALC_COLOR} strokeWidth={2} strokeDasharray="5 4" />
          <SvgLines x={x(pic.simple) - 8} y={86} lines={['two equal black holes that', `do not spin: ${pic.simple.toFixed(2)} (published)`]} fill={CALC_COLOR} size={9} bold anchor="end" />
          {guess !== null && (
            <g>
              <line x1={x(guess)} y1={axisY} x2={x(guess)} y2={axisY + 40} stroke={YOURS_COLOR} strokeWidth={4} />
              <polygon points={`${x(guess)},${axisY} ${x(guess) - 7},${axisY + 12} ${x(guess) + 7},${axisY + 12}`} fill={YOURS_COLOR} />
              <rect x={boxX} y={axisY + 40} width={boxW} height={28} rx={4} fill="#0b1020" stroke={YOURS_COLOR} strokeWidth={2.5} />
              <SvgLines x={boxX + boxW / 2} y={axisY + 58} lines={[`YOUR GUESS: about ${spinGuess}`]} fill={YOURS_COLOR} bold size={10} anchor="middle" />
            </g>
          )}
        </g>
      )}

      <line x1={P_X0} y1={axisY} x2={P_X1} y2={axisY} stroke={MUTED_COLOR} strokeWidth={1} />
      {ticks.map((t) => (
        <g key={t}>
          <line x1={x(t)} y1={axisY} x2={x(t)} y2={axisY - 5} stroke={MUTED_COLOR} />
          <SvgLines x={x(t)} y={axisY + (stage >= 6 ? -9 : 17)} lines={[String(t)]} fill={MUTED_COLOR} size={9} anchor="middle" />
        </g>
      ))}
      <SvgLines x={P_X1} y={stage >= 6 ? axisY + 14 : axisY + 31} lines={['spin']} fill={MUTED_COLOR} size={9} anchor="end" />
    </svg>
  )
}

// Part 2's drawing: the learner's own climb. Everything in it is imagined for the question (teal), except the green ticks (the real black holes) and the pink band (the gap from theory).
function ClimbDrawing({ trial }: { trial: ReturnType<typeof trialPicture> }) {
  const left = 60
  const right = 520
  const w = right - left
  const x = (pos: number) => left + pos * w
  const top = 84
  const rowGap = 54
  const n = trial.rows.length
  const rowY = (g: number) => top + (n - 1 - g) * rowGap + 20
  const axisY = top + n * rowGap + 16
  const height = axisY + 70
  const zoneWord = { below: 'below the gap', in: 'in the gap', above: 'above the gap' }
  const ticks = [10, 20, 50, 100, 200, 500, 1000]
  return (
    <svg
      width={VIEW_WIDTH}
      height={height}
      viewBox={`0 0 ${VIEW_WIDTH} ${height}`}
      style={svgStyle}
      role="img"
      aria-label={`Drawing A, your own climb. A scale of masses in Suns from ${LOG_AXIS_MIN_SOLAR} to ${LOG_AXIS_MAX_SOLAR}, going up in steps of ten, with a pink band for the gap. Starting with black holes of ${trial.startSolar} Suns and ${trial.rounds} ${trial.rounds === 1 ? 'round' : 'rounds'} of merging, the masses are ${trial.rows.map((r) => `${Number(r.massSolar.toFixed(1))} (${zoneWord[r.zone]})`).join(', ')}. Green ticks mark the real black holes of GW231123.`}
    >
      <text x={20} y={22} fill={TEXT_COLOR} fontSize="13" fontWeight="bold">
        Drawing A: your own climb (imagined)
      </text>
      <SvgLines x={20} y={40} lines={[`starting black holes of ${trial.startSolar} Suns, ${trial.rounds} ${trial.rounds === 1 ? 'round' : 'rounds'} of merging`, 'each round merges two equal black holes from the round before']} fill={MUTED_COLOR} />
      <rect x={x(trial.gapPositions.low)} y={top - 6} width={x(trial.gapPositions.high) - x(trial.gapPositions.low)} height={axisY - top + 6} fill={GAP_COLOR} opacity={0.18} />
      {trial.rows.map((r, i) => {
        const dotX = x(r.position)
        const y = rowY(r.generation)
        const prev = i > 0 ? trial.rows[i - 1] : null
        const textRight = dotX < 300
        const text = r.generation === 0 ? `Round 0: ${Number(r.massSolar.toFixed(1))} Suns, ${zoneWord[r.zone]}` : `Round ${r.generation}: ${Number(r.massSolar.toFixed(1))} Suns, ${zoneWord[r.zone]}`
        return (
          <g key={r.generation}>
            {prev && <line x1={x(prev.position)} y1={rowY(prev.generation)} x2={dotX} y2={y} stroke={IMAGINED_COLOR} strokeWidth={1.5} strokeDasharray="3 3" />}
            <circle cx={dotX} cy={y} r={7} fill={IMAGINED_COLOR} />
            <SvgLines x={textRight ? dotX + 12 : dotX - 12} y={textRight ? y + 16 : y - 18} lines={[text, `${r.originalCount} starting black ${r.originalCount === 1 ? 'hole' : 'holes'} combined`]} fill={IMAGINED_COLOR} size={10} bold anchor={textRight ? 'start' : 'end'} />
          </g>
        )
      })}
      <line x1={left} y1={axisY} x2={right} y2={axisY} stroke={MUTED_COLOR} strokeWidth={1} />
      {ticks.map((t) => (
        <g key={t}>
          <line x1={x((Math.log10(t) - 1) / 2)} y1={axisY} x2={x((Math.log10(t) - 1) / 2)} y2={axisY + 5} stroke={MUTED_COLOR} />
          <SvgLines x={x((Math.log10(t) - 1) / 2)} y={axisY + 17} lines={[t.toLocaleString('en-US')]} fill={MUTED_COLOR} size={9} anchor="middle" />
        </g>
      ))}
      {trial.realTicks.map((t) => (
        <line key={t.label} x1={x(t.position)} y1={axisY - 10} x2={x(t.position)} y2={axisY + 3} stroke={MEASURED_COLOR} strokeWidth={3} />
      ))}
      <SvgLines x={left} y={axisY + 33} lines={[`green ticks: GW231123’s black holes (${trial.realTicks.map((t) => t.massSolar).join(', ')} Suns)`]} fill={MEASURED_COLOR} size={9} />
      <SvgLines x={left} y={axisY + 46} lines={[`pink band: the gap from theory, ${GAP_THEORY_SOLAR.low} to ${GAP_THEORY_SOLAR.high} Suns`]} fill={GAP_COLOR} size={9} />
      <SvgLines x={right} y={axisY + 59} lines={['mass in Suns (steps of ten)']} fill={MUTED_COLOR} size={9} anchor="end" />
    </svg>
  )
}

function CaptionBlock({ title, intro, bullets, worked, lookFor, whereFrom }: { title: string; intro: ReactNode; bullets: ReactNode[]; worked: ReactNode; lookFor: LookFor[]; whereFrom: ReactNode }) {
  return (
    <div style={{ fontSize: '0.875rem', color: 'var(--text-muted)', marginTop: '0.75rem', marginBottom: '1.5rem' }}>
      <p style={paragraph}>
        <strong>How to read {title}.</strong> {intro}
      </p>
      <ul style={{ margin: '0 0 0.75rem', paddingLeft: '1.25rem' }}>
        {bullets.map((b, i) => (
          <li key={i}>{b}</li>
        ))}
      </ul>
      <p style={paragraph}>
        <strong>A worked moment.</strong> {worked}
      </p>
      {lookFor.length > 0 && (
        <>
          <p style={{ marginTop: 0, marginBottom: '0.5rem' }}>
            <strong>What to look for.</strong>
          </p>
          <LookForList items={lookFor} />
        </>
      )}
      <p style={{ ...paragraph, marginTop: '0.75rem' }}>
        <strong>Where the real picture comes from.</strong> {whereFrom}
      </p>
    </div>
  )
}

const lookForEndings: LookFor[] = [
  {
    look: 'the amber star on the left of panel 1, the arrow, and the small dark circle with a red outline on its right.',
    means: 'a heavy star runs out of fuel, its core collapses, and what is left behind is a black hole. This is how most black holes made by single stars are thought to form (Black Holes Experiment 9).',
    matters: 'it is the ordinary route, so black holes made this way are common. The question of this experiment is about black holes that this route does not seem to make.',
  },
  {
    look: 'the orange burst in panel 2, and the empty space at its centre.',
    means: 'a star that is heavy enough can blow itself apart completely, so nothing is left to become a black hole. The empty centre stands for “nothing left behind”.',
    matters: 'if the very heaviest stars leave nothing, then black holes should be missing from a range of masses. That missing range is called “the gap”.',
  },
  {
    look: 'the pink dashed box labelled “The gap”.',
    means: 'it stands for the range of black hole masses that single stars are not expected to leave. It has no numbers on it here, because the numbers come after the run, where they can be drawn to scale.',
    matters: 'black holes seen in or above the gap would need another explanation, which is what makes the merger in this experiment so puzzling.',
  },
]

function referenceEntries(): { term: string; meaning: string }[] {
  return [
    { term: 'Solar mass', meaning: 'a unit for how heavy stars and black holes are. One solar mass is the mass of the Sun, so “100 solar masses” means 100 times as heavy as the Sun. This page also says “Suns”.' },
    { term: 'The mass gap', meaning: 'a range of black hole masses where black holes are not expected to form from a single star. Stars heavy enough to make black holes in this range are thought to blow themselves apart instead.' },
    { term: 'Gas pressure and light pressure', meaning: 'two ways the inside of a star pushes outward against its own weight. Gas pressure comes from hot gas particles bouncing about. Light pressure (radiation pressure) comes from the tiny push of the light that fills the star. In a star like the Sun the gas does almost all of the holding up. In the very heaviest stars, which are much hotter inside, light does a large share.' },
    { term: 'Pair-instability supernova', meaning: 'the explosion of a very heavy star that destroys the whole star, leaving no black hole. It happens because, at the extreme heat inside the star, some of its light turns into pairs of tiny particles (an electron and its opposite, a positron). That uses up some of the light that was helping to hold the star up, so the star sags and heats up, and the nuclear burning runs away.' },
    { term: 'Supernova', meaning: 'the explosion of a star at the end of its life, bright enough to outshine its galaxy for a while. (Experiments 13, 14 and 17 of this group describe three kinds.)' },
    { term: 'Black hole merger', meaning: 'two black holes that have been circling each other come together and join into one black hole. A merger sends out gravitational waves (Gravitational Waves Experiments 1 to 4).' },
    { term: 'Gravitational waves', meaning: 'ripples in space itself, made when heavy objects such as black holes move fast. They carry energy away from the objects that make them.' },
    { term: 'Spin', meaning: 'how fast a black hole turns. In Black Holes Experiment 8 it is a number from 0 (not turning) up to just under 1 (turning as fast as is possible).' },
    { term: 'Source frame', meaning: 'a mass worked out for the black hole as it was at its own place and time. Because the universe is expanding, a signal from far away arrives stretched, and the mass that the stretched signal seems to give is larger. Scientists correct for this, and the masses on this page are the corrected ones.' },
    { term: 'Give-or-take', meaning: 'the size of the uncertainty of a measurement, written “11 ± 1”. It says how far the true value could be from the measured one. (Experiment 1 of this group explains it.)' },
    { term: 'Redshift', meaning: 'the stretching of a signal that has travelled a long way across the expanding universe (Cosmology Experiment 1). A larger redshift means a farther, older source.' },
    { term: 'Hierarchical merger', meaning: 'a merger of black holes that were themselves made by earlier mergers. The word “hierarchical” means “in steps” or “in layers”.' },
    { term: 'Primordial black hole', meaning: 'a black hole that, in one proposal, formed in the very early universe, not from a star. Nobody has found one for certain.' },
    { term: 'Gravitational lensing', meaning: 'the bending of light, or of other waves, by the gravity of something heavy that lies between us and the source (Cosmology Experiment 7). It can make a source look brighter, and so heavier, than it is.' },
    { term: 'Signal-to-noise ratio', meaning: 'a number for how clearly a signal stands out from the random background noise in a detector. Think of a friend talking at a party: the louder their voice is compared with the chatter, the more clearly you hear them.' },
  ]
}

const POSSIBLE_LABELS: Record<PossibleChoice, string> = { no: 'No, it could not', yes: 'Yes, it could', unsure: 'Not sure' }
const SPIN_LABELS: Record<SpinGuessChoice, string> = {
  0.1: 'About 0.1 (hardly turning)',
  0.3: 'About 0.3',
  0.5: 'About 0.5 (half-way)',
  0.7: 'About 0.7',
  0.9: 'About 0.9 (very fast)',
  0.99: 'About 0.99 (almost as fast as is possible)',
}

interface HeaviestMergerExperimentProps {
  onComplete?: () => void
}

export function HeaviestMergerExperiment({ onComplete }: HeaviestMergerExperimentProps) {
  const g = GW231123
  const [heavier, lighter] = g.masses
  const [possibleGuess, setPossibleGuess] = useState<PossibleChoice | null>(null)
  const [spinGuess, setSpinGuess] = useState<SpinGuessChoice | null>(null)
  const [massChoice, setMassChoice] = useState<number>(40)
  const [roundsChoice, setRoundsChoice] = useState<number>(1)
  const [status, setStatus] = useState<'idle' | 'running' | 'complete'>('idle')
  const [stage, setStage] = useState(0)
  const recorded = status !== 'idle'
  const done = status === 'complete'
  const bothPredicted = possibleGuess !== null && spinGuess !== null

  // Presentation only: advances one stage at a time. The numbers do not depend on this timer (CLAUDE.md §11).
  useEffect(() => {
    if (status !== 'running') return
    const timer = window.setTimeout(() => {
      if (stage < LAST_STAGE) setStage(stage + 1)
      else {
        setStatus('complete')
        onComplete?.()
      }
    }, STAGE_MS)
    return () => window.clearTimeout(timer)
  }, [status, stage, onComplete])

  const startOver = () => {
    setPossibleGuess(null)
    setSpinGuess(null)
    setMassChoice(40)
    setRoundsChoice(1)
    setStatus('idle')
    setStage(0)
  }
  const run = () => {
    setStage(1)
    setStatus('running')
  }
  // Every number in the captions comes from the physics module (CLAUDE.md §9).
  const ruler = massRuler()
  const ex = exampleMerger()
  const check = mergerCheckUp()
  const [mHeavy, mLight, mFinal] = ruler.marks
  const spic = spinPicture()
  const mine = trialPicture(massChoice, roundsChoice)
  const masses = mine.rows.map((r) => Number(r.massSolar.toFixed(1)))
  return (
    <div>
      <h2>Experiment 20 — Black Holes That Should Not Exist: The Heaviest Merger (GW231123)</h2>
      <div className="exp-card" style={{ marginTop: '2rem', padding: '1.5rem' }}>
        <p style={{ marginTop: 0, marginBottom: '1.5rem', fontSize: '0.875rem' }}>
          <strong>
            Where this stands (as of October 2026): there is strong evidence that GW231123 is the heaviest merger of black holes seen so far in gravitational waves, with black holes much
            heavier than most. The measured masses have wide give-or-takes, and how heavy the merger really was depends a little on the analysis. What made such
            black holes is an open question: scientists have proposed several explanations, and they do not agree on which is likely. What was measured, and what has been proposed, are
            shown after you press Run, so that you can guess first.
          </strong>
        </p>

        <div style={{ marginBottom: '1.5rem' }}>
          <p style={{ marginTop: 0, marginBottom: '0.5rem' }}>
            <strong>The question.</strong> Most black holes that come from stars are made when a heavy star runs out of fuel. With nothing left to hold it up, the star’s core is squeezed
            by its own weight into a black hole. You might expect that the heavier the star, the heavier the black hole it leaves. Theory says that stops being true for the very heaviest stars:
          </p>
          <ul style={{ margin: '0 0 0.75rem', paddingLeft: '1.25rem' }}>
            <li>
              <strong>An ordinary heavy star</strong> dies, its core collapses, and a black hole is left behind.
            </li>
            <li>
              <strong>A star in a certain range of very heavy weights</strong> dies so violently that the whole star is blown to pieces. Nothing is left in the middle to collapse, so{' '}
              <em>no black hole is made at all</em>.
            </li>
          </ul>
          <p style={paragraph}>
            So the black holes that those stars would have left are missing, and black holes of those masses should be rare or absent. That missing range of masses is the “gap” you will meet
            below. Yet in November 2023 the LIGO, Virgo and KAGRA detectors recorded a merger of two black holes that are in, or above, that range. How can black holes “that should not
            exist” exist? And what can we tell about them from how they merged?
          </p>

          <p style={paragraph}>
            <strong>Where we left off.</strong> In Black Holes Experiment 9 you saw how the core of a dead star can become a black hole. In Experiment 17 of this group you met a star that may have
            become a black hole without a bright explosion. In Experiment 18 you met GW250114, a merger of two black holes that was recorded very clearly, and saw that when two black holes
            merge a little of their mass leaves as gravitational waves. This experiment turns to the other end of the scale: black holes that seem too heavy to have come from a single star.
          </p>

          <p style={{ marginTop: 0, marginBottom: '0.5rem' }}>
            <strong>Why a very heavy star can leave nothing.</strong> A star is held up, against its own weight, by pressure from the hot stuff inside it. There are two kinds of push:
          </p>
          <ul style={{ margin: '0 0 0.75rem', paddingLeft: '1.25rem' }}>
            <li>
              <strong>Gas pressure:</strong> the hot gas particles bouncing about and pushing on each other, like the air inside a tyre.
            </li>
            <li>
              <strong>Light pressure (radiation pressure):</strong> light carries a very small push, and the inside of a star is so full of light that these pushes add up.
            </li>
          </ul>
          <p style={paragraph}>
            In a star like the Sun, almost all of the holding up is done by the gas, and light’s share is small. But the two do not grow at the same rate as the star gets hotter. Double the
            temperature and the gas’s push doubles, while the light’s push grows 16 times. The heavier a star is, the hotter its middle, so in the very heaviest stars the light does a large
            share of the holding up. Compare a tent that stays up because air is blown into it: the air’s push holds the cloth up, and in these stars part of that “air” is light.
          </p>
          <p style={{ marginTop: 0, marginBottom: '0.5rem' }}>
            Now the middle of such a star gets so hot that some of its light turns into pairs of tiny particles (an electron and its opposite, a positron). Making the pairs uses up the light’s
            energy, which becomes the mass of the particles, so the light’s push falls. It is like part of the air in the tent suddenly no longer pushing:
          </p>
          <ul style={{ margin: '0 0 0.75rem', paddingLeft: '1.25rem' }}>
            <li>the star sags, because less is holding it up;</li>
            <li>the squeeze heats the star’s middle even more;</li>
            <li>the extra heat makes the nuclear burning run away, and the burning blows the whole star apart.</li>
          </ul>
          <p style={paragraph}>
            This is called a <strong>pair-instability supernova</strong>. It leaves no black hole behind. Because stars of a certain range of masses should end like this, the black holes they would
            have left are missing: black holes should be rare or absent in a range of masses, called <strong>the gap</strong>. Theory puts the gap between about {GAP_THEORY_SOLAR.low} and{' '}
            {GAP_THEORY_SOLAR.high} times the mass of the Sun. A 2025 study of the black holes that the detectors had seen by then found the gap’s lower edge nearer {GAP_MEASURED_LOW_SOLAR.value}{' '}
            times the mass of the Sun. So the exact edges are still being worked out, and this page shows both.
          </p>

          <div style={{ marginBottom: '0.75rem' }}>
            <TwoEndingsDrawing />
          </div>
          <div style={{ fontSize: '0.875rem', color: 'var(--text-muted)', marginBottom: '0.75rem' }}>
            <p style={paragraph}>
              <strong>How to read this illustration.</strong> It explains the word “gap”. It is a sketch of the idea, not a drawing of real stars, and it is not to scale. It shows no mass and
              no number.
            </p>
            <ul style={{ margin: '0 0 0.75rem', paddingLeft: '1.25rem' }}>
              <li>
                <strong>The two panels.</strong> Panel 1 is the ordinary ending: a heavy star leaves a black hole. Panel 2 is the ending of the very heaviest stars: they blow themselves apart.
                Which stars end which way is a matter of mass, but the illustration does not say how much.
              </li>
              <li>
                <strong>The amber circles</strong> are stars, the one in panel 2 drawn bigger because it is heavier. <strong>The arrows</strong> point to how each star ends.
              </li>
              <li>
                <strong>The small dark circle with a red outline</strong> is a black hole. <strong>The orange burst with an empty centre</strong> is a star blowing itself apart, with nothing
                left to make a black hole.
              </li>
              <li>
                <strong>The pink dashed box</strong> is the gap: the range of black hole masses that single stars are not expected to leave. It has no numbers here, because the numbers are
                drawn to scale in a later picture.
              </li>
            </ul>
            <p style={paragraph}>
              <strong>A worked moment, with a count of black holes.</strong> Suppose astronomers find a thousand black holes made by stars, and their masses run from about 5 to about 45 times the
              Sun’s, with hardly any heavier. The missing heavier ones are the gap. If one black hole then turned up with, say, 100 times the Sun’s mass, it would be a puzzle, because no single
              star should have left it. (The 5, 45 and 100 here are made up to explain the idea. They are not real counts.)
            </p>
            <p style={{ marginTop: 0, marginBottom: '0.5rem' }}>
              <strong>What to look for.</strong>
            </p>
            <LookForList items={lookForEndings} />
          </div>

          <p style={paragraph}>
            <strong>What GW231123 was.</strong> On {g.detected} the LIGO detectors, together with the Virgo and KAGRA detectors, recorded a very short, loud gravitational-wave signal that the teams
            named GW231123 (the name is the date). It was announced on {g.announced}. It came from two black holes that merged into one. The teams’ best estimate is that the two had about{' '}
            {heavier.value} and {lighter.value} times the mass of the Sun, and that the black hole they made was heavier than 225 times the mass of the Sun. The measured masses have wide
            give-or-takes: the lighter one could be anywhere from about {lighter.value - lighter.minus} to about {lighter.value + lighter.plus} times the mass of the Sun. The teams say the lighter
            black hole has an {g.lighterInGapPercent} percent chance of lying in the gap, and that the heavier one is above or in it. These are the heaviest black holes yet seen merging in
            gravitational waves.
          </p>

          <p style={paragraph}>
            <strong>Where the question stands (October 2026).</strong> That GW231123 was a very heavy merger is strong evidence, but the masses are measured with wide give-or-takes and depend a little on how the
            signal is analysed. <em>How</em> such black holes came to exist is not known. Several explanations have been proposed, and papers from 2025 and 2026 disagree about how likely each is. The
            page does not choose between them. After the run it says what each one is, and what has been read about it, with its source.
          </p>

          <div style={{ marginBottom: '0.75rem' }}>
            <p style={{ marginTop: 0, marginBottom: '0.5rem' }}>
              <strong>Some new words.</strong> The “Words and formulas” box below has each one, with a few from earlier experiments.
            </p>
            <ul style={{ margin: 0, paddingLeft: '1.25rem' }}>
              <li>
                <strong>Gas pressure</strong> and <strong>light pressure</strong>: the two pushes that hold a star up.
              </li>
              <li>
                <strong>The gap</strong> and <strong>pair-instability supernova</strong>: the range of black hole masses single stars are not expected to leave, and the explosion that destroys
                the heaviest stars completely.
              </li>
              <li>
                <strong>Hierarchical merger</strong> and <strong>primordial black hole</strong>: two of the proposed explanations for black holes this heavy. They are explained after the run.
              </li>
              <li>
                <strong>Gravitational lensing</strong>: the bending of waves by something heavy in between, which is another proposed explanation.
              </li>
              <li>
                <strong>Source frame</strong> and <strong>redshift</strong>: how a mass is corrected for the stretching of a signal that travelled across the expanding universe.
              </li>
              <li>
                <strong>Solar mass</strong>, <strong>supernova</strong>, <strong>black hole merger</strong>, <strong>gravitational waves</strong>, <strong>spin</strong>, <strong>give-or-take</strong> and{' '}
                <strong>signal-to-noise ratio</strong>: units and ideas from earlier experiments.
              </li>
            </ul>
          </div>

          <p style={paragraph}>
            <strong>What you will do.</strong> You will make two predictions and press Run. Later steps will draw the pictures one stage at a time, and then let you try other values in a part of
            its own. Nothing here is graded. Your predictions are your own guesses, made before you see anything. They never change the real pictures or the tables, which come from the
            physics and the published numbers. Your guesses will be drawn on top of the real pictures, in white, so you can compare each guess with the real result, and they will be shown again
            beside the results. The page will have four parts: first you predict and watch the pictures; then, in “Now try it yourself”, you can choose the mass of two black holes and the number
            of rounds of merging, and watch a drawing of your own follow your choices; then come the results; and last a tutor asks you some questions. The real pictures and the results tables
            never change. Your white guess marks appear on the real pictures, and only the drawing in “Now try it yourself” follows your choices.
          </p>

          <p style={paragraph}>
            <strong>What we assume.</strong> This experiment uses the masses and spins that the teams published for GW231123, with their give-or-takes, and some simple arithmetic about merging.
            It does not simulate stars, star clusters or the signal itself, and it does not decide how such heavy black holes came to exist. The answers to the predictions you will make are not
            given here.
          </p>

          <p style={{ marginTop: 0, marginBottom: '0.75rem' }}>
            <strong>Want to know more?</strong> Plainer-language pages are listed here. Links open in a new tab. This page was written as of October 2026. The papers and articles behind the
            measured numbers and the proposed explanations are listed after the run, so that they do not give away the predictions.
          </p>
          <ul style={{ margin: '0.25rem 0 0', paddingLeft: '1.25rem' }}>
            <li>
              <ExternalLink href="https://science.nasa.gov/universe/black-holes/">NASA: Black holes</ExternalLink>: what a black hole is, the event horizon, how black holes are born when
              massive stars run out of fuel, and how scientists detect them, including by gravitational waves.
            </li>
            <li>
              <ExternalLink href="https://spaceplace.nasa.gov/gravitational-waves/en/">NASA Space Place: What is a gravitational wave?</ExternalLink> What a gravitational wave is, as a
              ripple in space, and how LIGO first detected one in 2015.
            </li>
          </ul>
        </div>

        <ReferencePanel entries={referenceEntries()} />

        {/* The two predictions: draft wording for the owner's review (CLAUDE.md §28.1), from the specification's "Prediction Activity". Neither says which answer is right. */}
        <div style={{ marginTop: '2.5rem', paddingTop: '1.5rem', borderTop: '6px solid #d97706' }}>
          <h3 style={{ margin: '0 0 0.5rem', color: '#d97706' }}>Part 1: Predict, then watch</h3>
          <p style={{ ...paragraph, fontSize: '0.875rem', color: 'var(--text-muted)' }}>
            <strong>What we are about to do.</strong> This part is the experiment itself. You make your two predictions and press Run. The pictures that the run will draw show fixed
            things: the measured masses and spins of one merger, and some arithmetic about how black holes merge. They are the same for everyone. When they are drawn, your guesses appear on
            them in white, so you can see how each guess compares with the real result. The real pictures stay the same whatever you guess.
          </p>

          {(
            [
              {
                title: 'Prediction 1: can two black holes below the gap merge into one inside it?',
                text: (
                  <>
                    Imagine two black holes, each made when one star died, so that each black hole came from its own star. Both are lighter than the gap, so neither is in it. The two
                    black holes circle each other and merge into one black hole. In a merger, a little of the mass leaves as gravitational waves, so the new black hole is a bit lighter than the two together. Could the black hole that they make be
                    inside the gap?
                  </>
                ),
                choices: POSSIBLE_CHOICES.map((value) => ({ value, label: POSSIBLE_LABELS[value] })),
                value: possibleGuess,
                set: (v: string) => setPossibleGuess(v as PossibleChoice),
              },
              {
                title: 'Prediction 2: how fast does the black hole made by two equal, non-spinning black holes spin?',
                text: (
                  <>
                    Spin is a number from 0 (not turning) to just under 1 (turning as fast as is possible). Imagine two black holes of the same mass, neither of them spinning, circling each
                    other and merging into one. About what spin does the new black hole have? This is a separate guess from Prediction 1, so your two answers do not have to agree with each
                    other.
                  </>
                ),
                choices: SPIN_GUESS_CHOICES.map((value) => ({ value: String(value), label: SPIN_LABELS[value] })),
                value: spinGuess === null ? null : String(spinGuess),
                set: (v: string) => setSpinGuess(Number(v) as SpinGuessChoice),
              },
            ] as const
          ).map((question) => (
            <div key={question.title} style={{ marginTop: '1.5rem', marginBottom: '2rem' }}>
              <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold' }}>{question.title}</label>
              <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)', marginTop: 0, marginBottom: '0.75rem' }}>{question.text} You are not graded, and a guess is fine.</p>
              <div>
                {(question.choices as ReadonlyArray<{ value: string; label: string }>).map((choice) => (
                  <button
                    key={choice.value}
                    type="button"
                    onClick={() => (question.set as (v: string) => void)(choice.value)}
                    disabled={recorded}
                    className={`toggle-button${question.value === choice.value ? ' is-selected' : ''}`}
                    style={{ marginRight: '0.5rem', marginBottom: '0.5rem', padding: '0.5rem 1rem', fontSize: '0.875rem' }}
                  >
                    {choice.label}
                  </button>
                ))}
              </div>
              <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.5rem', marginBottom: 0 }}>
                {question.value !== null
                  ? `Your prediction: ${(question.choices as ReadonlyArray<{ value: string; label: string }>).find((c) => c.value === question.value)?.label.toLowerCase()}.`
                  : 'Choose an option to continue'}
              </p>
            </div>
          ))}

          <button type="button" className="action-button" onClick={run} disabled={!bothPredicted || recorded} style={{ padding: '0.6rem 1.5rem' }}>
            Run
          </button>
          {recorded && (
            <button type="button" className="secondary-button" onClick={startOver} style={{ marginLeft: '0.75rem', padding: '0.6rem 1.25rem' }}>
              Start over
            </button>
          )}
          {!bothPredicted && !recorded && (
            <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: 0 }}>Answer both predictions above to run the experiment.</p>
          )}
          {/* The run's stage, named (CLAUDE.md §14): what the learner is looking at now. */}
          <p style={{ fontSize: '0.875rem', margin: '1.5rem 0 0.75rem', minHeight: '1.5rem' }}>
            {status === 'idle' && <span style={{ color: 'var(--text-muted)' }}>The picture fills in, one stage at a time, after you press Run.</span>}
            {status !== 'idle' && (
              <span>
                <strong>{done ? 'Run complete.' : `Stage ${stage} of ${LAST_STAGE}: ${STAGE_NAMES[stage]}.`}</strong>{' '}
                {done ? 'Pictures 1 and 2 are drawn. Your predictions are recorded and not marked here. The controls, the results and the tutor are built in later steps.' : STAGE_LINES[stage]}
              </span>
            )}
          </p>

          {stage >= 1 && (
            <div>
              <PictureOne stage={stage} possibleGuess={possibleGuess} />
              <CaptionBlock
                title="Picture 1"
                intro={`It is a ruler of black hole masses, in Suns, from 0 to ${ruler.axisMaxSolar}. A mark further to the right is a heavier black hole. Panel A draws the real merger, GW231123, one feature at a time. Panel B, which appears last, is a check that you can follow by hand.`}
                bullets={[
                  <><strong>Each green line with a dot</strong> in panel A is a black hole. The dot is the teams’ best estimate of its mass. <strong>The line</strong> is its give-or-take: the range in which the teams say the true mass lies, with a 90 percent chance (9 chances in 10). The two black holes that merged are called the heavier and the lighter. “Suns” means times the mass of the Sun.</>,
                  ...(stage >= 2 ? [<><strong>The third green line</strong> is the black hole that the merger made.</>] : []),
                  ...(stage >= 3 ? [
                    <><strong>The pink band</strong> is the gap as theory gives it, from {ruler.gapTheory.low} to {ruler.gapTheory.high} Suns: black holes of those masses are not expected to be left by a single star. <strong>The dashed pink line</strong> is the lower edge of the gap that a 2025 study of the black holes the detectors had seen found instead, {ruler.gapMeasuredLow.value} (+{ruler.gapMeasuredLow.plus}, −{ruler.gapMeasuredLow.minus}), with a short bar for its own give-or-take. <strong>The pink note</strong> says how likely the teams think it is that the lighter black hole is in the gap.</>,
                  ] : []),
                  ...(stage >= 4 ? [
                    <><strong>In panel B, the teal dots, the arrow and the larger teal dot</strong> are imagined for the question: two black holes of {ex.startSolar} Suns, each below the gap, merge into one. The arrow points to the black hole they make. The note beside it does the sum: {ex.startSolar} + {ex.startSolar} = {ex.sumSolar}, minus {Math.round(ex.share * 100)} percent (about {ex.radiatedSolar} Suns sent out as gravitational waves) leaves {ex.resultSolar}. The {Math.round(ex.share * 100)} percent is an assumption, taken from GW250114 in Experiment 18. For GW231123 itself, the best estimates give a total of {check.totalSolar} Suns before and about {GW231123.finalBestFitSolar} after, so about {check.impliedRadiatedSolar} Suns, or {(check.impliedRadiatedShare * 100).toFixed(1)} percent, were lost. That is a rough subtraction of best estimates, not a measurement.</>,
                    <><strong>The white mark and the box “YOUR GUESS”</strong> are your answer to Prediction 1. A yes or a no has no size or position of its own, so the white mark is only a marker, a tick for yes, a cross for no and a question mark for not sure, drawn beside the result of the sum. Where it sits means nothing.</>,
                  ] : []),
                ]}
                worked={
                  stage < 3 ? (
                    <>The heavier black hole’s dot is at {mHeavy.massSolar} Suns and its line runs from {mHeavy.lowSolar} to {mHeavy.highSolar}. So the true mass could be a little more or less than {mHeavy.massSolar}: the teams say there is a 90 percent chance that it lies between {mHeavy.lowSolar} and {mHeavy.highSolar}. The lighter black hole’s line runs from {mLight.lowSolar} to {mLight.highSolar}, much longer, because its mass is much less certain.</>
                  ) : stage < 4 ? (
                    <>The lighter black hole’s dot, {mLight.massSolar} Suns, is inside the pink band, which starts at {ruler.gapTheory.low}. Its line runs from {mLight.lowSolar} to {mLight.highSolar}, so part of its range is below the band’s start, and the teams put the chance that it is in the gap at {ruler.lighterInGapPercent} percent. The heavier black hole’s dot, {mHeavy.massSolar}, is just above the band, which ends at {ruler.gapTheory.high}, but its line (from {mHeavy.lowSolar}) reaches into it.</>
                  ) : (
                    <>Take two black holes of {ex.startSolar} Suns. Added together they are {ex.startSolar} + {ex.startSolar} = {ex.sumSolar} Suns. About {Math.round(ex.share * 100)} percent of that, {ex.radiatedSolar} Suns, leaves as gravitational waves, so the one they make is {ex.sumSolar} − {ex.radiatedSolar} = {ex.resultSolar} Suns. The band starts at {ruler.gapTheory.low}, and {ex.resultSolar} is more than that and less than {ruler.gapTheory.high}.</>
                  )
                }
                lookFor={[
                  { look: 'the two green lines with dots in panel A, one for each black hole that merged.', means: `the heavier black hole is about ${mHeavy.massSolar} Suns (${mHeavy.lowSolar} to ${mHeavy.highSolar}) and the lighter about ${mLight.massSolar} (${mLight.lowSolar} to ${mLight.highSolar}).`, matters: 'the give-or-take is part of the result. The lighter black hole’s line is much longer than the heavier one’s, so its mass is much less certain, and that matters for whether it is in the gap.' },
                  ...(stage >= 2 ? [
                    { look: 'the third green line, for the black hole they made.', means: `it is more than ${GW231123.finalBestFitSolar} Suns (${mFinal.lowSolar} to ${mFinal.highSolar}). The two before add up to ${check.totalSolar}, so about ${check.impliedRadiatedSolar} Suns fewer ended up in the black hole (a rough subtraction of best estimates).`, matters: 'merging two black holes makes one that is a little lighter than the two added together. That is what Prediction 1 is about, because the black hole you are asked about is a merged one.' },
                  ] : []),
                  ...(stage >= 3 ? [
                    { look: 'the pink band, the dashed pink line and the green lines against them.', means: `the lighter black hole’s best estimate, ${mLight.massSolar}, is inside the band and the heavier one’s, ${mHeavy.massSolar}, is just above it, while the black hole they made, more than ${GW231123.finalBestFitSolar}, is far above it. The dashed line, ${ruler.gapMeasuredLow.value}, shows that the real lower edge of the gap may be lower than theory says.`, matters: 'single stars are not expected to leave black holes in the gap, so black holes in it, or above it, need another explanation. That is what makes the merger so puzzling, and what the rest of this experiment is about.' },
                  ] : []),
                  ...(stage >= 4 ? [
                    { look: 'the teal dots, the arrow and the larger teal dot inside the pink band in panel B.', means: `two black holes of ${ex.startSolar} Suns, each below the band, give one of ${ex.resultSolar} Suns after the merger, which is inside the band.`, matters: 'a black hole inside the gap does not by itself show that a single star made it. Whether this is how the black holes of GW231123 were made is not settled. It is one of several explanations, set out later.' },
                    ...(possibleGuess ? [{ look: 'the white mark and the box “YOUR GUESS”.', means: `your answer to Prediction 1 (${POSSIBLE_PHRASE[possibleGuess]}), drawn beside the result of the sum. It is only a marker, so its place shows no verdict.`, matters: 'you can see your guess beside the calculated result. The tutor goes through Prediction 1 with you later.' }] : []),
                  ] : []),
                ]}
                whereFrom={
                  <>
                    <strong>Measured:</strong> the masses and their give-or-takes, and the chance that the lighter black hole is in the gap ({ruler.lighterInGapPercent} percent), by the LIGO, Virgo and KAGRA teams. This page’s numbers come from LIGO’s summary page and from a search summary of the paper’s abstract, not from the paper itself, so each should be checked against it.
                    {stage >= 3 ? <> The band ({ruler.gapTheory.low} to {ruler.gapTheory.high}) is the range LIGO’s summary quotes from theory; the lower edge ({ruler.gapMeasuredLow.value}, +{ruler.gapMeasuredLow.plus}, −{ruler.gapMeasuredLow.minus}) is from a 2025 catalogue analysis by the same teams, read only through search summaries.</> : null}
                    {stage >= 4 ? <> <strong>Calculated here:</strong> the sum in panel B ({ex.startSolar} + {ex.startSolar} − {ex.radiatedSolar} = {ex.resultSolar}). <strong>Imagined for the question:</strong> the two black holes of {ex.startSolar} Suns, and the {Math.round(ex.share * 100)} percent radiated, which is assumed from GW250114. The white mark is your guess.</> : <> <strong>Calculated here:</strong> nothing yet. <strong>Imagined for the question:</strong> nothing yet.</>}
                  </>
                }
              />
            </div>
          )}

          {stage >= 5 && (
            <div>
              <PictureTwo stage={stage} spinGuess={spinGuess} />
              <CaptionBlock
                title="Picture 2"
                intro={`It shows how fast the two black holes that merged were spinning. Spin is a number from 0, a black hole that is not turning, up to 1, one turning as fast as is possible (Black Holes Experiment 8). A mark further to the right is a faster spin.`}
                bullets={[
                  <><strong>Each green line with a dot</strong> is one of the two black holes that merged. The dot is the teams’ best estimate of its spin, and the line is its give-or-take: the range in which the teams say the true spin lies, with a 90 percent chance (9 chances in 10).</>,
                  ...(stage >= 6 ? [
                    <><strong>The dashed blue line</strong> is the spin of the black hole that a merger of two equal black holes that are not spinning makes, {spic.simple.toFixed(2)}. It is a published result of computer simulations of such mergers, which this page uses but did not calculate. <strong>The amber arrows</strong> show how much higher each measured spin is than that line.</>,
                    <><strong>The white mark and the box “YOUR GUESS”</strong> are your answer to Prediction 2. The mark sits at the spin you chose, about {spinGuess}, so a different guess puts it somewhere else. It is drawn so that you can compare it with the dashed blue line, and it shows no verdict.</>,
                  ] : []),
                ]}
                worked={
                  stage < 6 ? (
                    <>The heavier black hole’s dot is at {spic.rows[0].value.toFixed(2)} and its line runs from {spic.rows[0].low.toFixed(2)} to {spic.rows[0].high.toFixed(2)}. So the teams’ best estimate is a spin close to the top of the scale, and they say there is a 90 percent chance that the true spin is somewhere in that range. The lighter black hole’s line, from {spic.rows[1].low.toFixed(2)} to {spic.rows[1].high.toFixed(2)}, is much longer, because its spin is much less certain.</>
                  ) : (
                    <>The heavier black hole’s dot is at {spic.rows[0].value.toFixed(2)} and the dashed line is at {spic.simple.toFixed(2)}, so {spic.rows[0].value.toFixed(2)} − {spic.simple.toFixed(2)} = {spic.rows[0].gapFromSimple.toFixed(2)}. For the lighter black hole it is {spic.rows[1].value.toFixed(2)} − {spic.simple.toFixed(2)} = {spic.rows[1].gapFromSimple.toFixed(2)}.</>
                  )
                }
                lookFor={[
                  { look: 'the two green lines with dots.', means: `the heavier black hole spins at about ${spic.rows[0].value.toFixed(2)} (${spic.rows[0].low.toFixed(2)} to ${spic.rows[0].high.toFixed(2)}) and the lighter at about ${spic.rows[1].value.toFixed(2)} (${spic.rows[1].low.toFixed(2)} to ${spic.rows[1].high.toFixed(2)}). Both best estimates are near the fast end of the scale, and the lighter one’s range is much wider.`, matters: 'a very fast spin is one of the two unusual things about this merger, along with its mass. The wide range of the lighter black hole means its spin is less certain than the heavier one’s.' },
                  ...(stage >= 6 ? [
                    { look: 'the dashed blue line, and the amber arrows from it to the green dots.', means: `a merger of two equal black holes that do not spin gives a black hole spinning at about ${spic.simple.toFixed(2)}. The measured best estimates are ${spic.rows[0].gapFromSimple.toFixed(2)} and ${spic.rows[1].gapFromSimple.toFixed(2)} higher. The heavier black hole’s range (from ${spic.rows[0].low.toFixed(2)}) does not reach down to the line, and the lighter one’s range (from ${spic.rows[1].low.toFixed(2)}) does.`, matters: 'the spins of the two black holes that merged are higher than the simple case gives, so how they came to spin so fast is part of the puzzle. The explanations for it come later.' },
                    ...(spinGuess !== null ? [{ look: 'the white mark and the box “YOUR GUESS”.', means: `your answer to Prediction 2 (about ${spinGuess}), drawn on the same scale as the dashed blue line. It shows no verdict.`, matters: 'you can see your guess beside the published value. The tutor goes through Prediction 2 with you later.' }] : []),
                  ] : []),
                ]}
                whereFrom={
                  <>
                    <strong>Measured:</strong> the two spins and their give-or-takes, by the LIGO, Virgo and KAGRA teams. This page’s numbers come from a search summary of the paper’s abstract, not from the paper itself, so each should be checked against it.
                    {stage >= 6 ? <> <strong>Published, not calculated here:</strong> the {spic.simple.toFixed(2)} for two equal black holes that do not spin, from computer simulations of mergers, read only through a search summary and not at a paper. <strong>Calculated here:</strong> the differences from it ({spic.rows[0].gapFromSimple.toFixed(2)} and {spic.rows[1].gapFromSimple.toFixed(2)}). <strong>Imagined for the question:</strong> two equal black holes that do not spin, which is a simple case, not a real merger. The white mark is your guess.</> : <> <strong>Calculated here:</strong> nothing yet. <strong>Imagined for the question:</strong> nothing yet.</>}
                  </>
                }
              />
            </div>
          )}
        </div>

        {done && (
          <div style={{ marginTop: '2.5rem', paddingTop: '1.5rem', borderTop: `6px solid ${PART_TWO_COLOR}` }}>
            <h3 style={{ margin: '0 0 0.5rem', color: PART_TWO_COLOR }}>Part 2: Now try it yourself</h3>
            <p style={{ ...paragraph, fontSize: '0.875rem', color: 'var(--text-muted)' }}>
              <strong>What we are about to do.</strong> In Picture 1 you saw two imagined black holes of {ex.startSolar} Suns merge. Here you can choose how heavy the starting black holes are and how many
              rounds of merging to follow, and watch one drawing show the climb, beside the real black holes of GW231123. The real pictures above do not change, and your two guesses do not change this
              drawing: only the two settings below do.
            </p>
            <p style={{ ...paragraph, fontSize: '0.875rem', color: 'var(--text-muted)' }}>
              <strong>These are your own trial values, not real events.</strong> Each button is a number to try. For example, if you choose {mine.startSolar} Suns and {mine.rounds}{' '}
              {mine.rounds === 1 ? 'round' : 'rounds'}, you start with {mine.startingCount} black holes of {mine.startSolar} Suns and the last merger makes one of {masses[masses.length - 1]} Suns. Real black holes
              would rarely meet in such an orderly way: this is a simple picture to show the arithmetic. It is imagined for the question, and it is drawn in teal.
            </p>

            {(
              [
                {
                  title: 'How heavy is each starting black hole? (in Suns, the mass of the Sun; all are below the gap)',
                  choices: MASS_CHOICES_SOLAR.map((v) => ({ value: v, label: v === ex.startSolar ? `${v} (as in Picture 1)` : `${v}` })),
                  value: massChoice,
                  set: setMassChoice,
                },
                {
                  title: 'How many rounds of merging? (each round merges two equal black holes made in the round before)',
                  choices: ROUND_CHOICES.map((v) => ({ value: v, label: v === 1 ? '1 round' : `${v} rounds` })),
                  value: roundsChoice,
                  set: setRoundsChoice,
                },
              ] as const
            ).map((control) => (
              <div key={control.title} style={{ marginTop: '1rem', marginBottom: '1rem' }}>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold' }}>{control.title}</label>
                <div>
                  {control.choices.map((choice) => (
                    <button
                      key={choice.value}
                      type="button"
                      onClick={() => (control.set as (v: number) => void)(choice.value)}
                      className={`toggle-button${control.value === choice.value ? ' is-selected' : ''}`}
                      style={{ marginRight: '0.5rem', marginBottom: '0.5rem', padding: '0.5rem 1rem', fontSize: '0.875rem' }}
                    >
                      {choice.label}
                    </button>
                  ))}
                </div>
              </div>
            ))}

            <ClimbDrawing trial={mine} />
            <CaptionBlock
              title="Drawing A"
              intro={`It shows the climb that your two trial values give, on a ruler of masses in Suns that goes up in steps of ten (10, 100, 1,000), so that a black hole of ${LOG_AXIS_MIN_SOLAR} Suns and one of hundreds fit together. Round 0, at the bottom, is the starting black holes. Each round above it is the black hole made by merging two equal black holes from the round before. It is imagined for the question, not observed.`}
              bullets={[
                <><strong>The teal dots</strong> are black holes in your climb, one for each round. Each is joined by a dotted teal line to the one before it. The words beside a dot give its mass, say whether it is below, in or above the gap, and say how many of the starting black holes were combined to make it.</>,
                <><strong>The pink band</strong> is the gap from theory, {GAP_THEORY_SOLAR.low} to {GAP_THEORY_SOLAR.high} Suns, as in Picture 1. <strong>The green ticks</strong> on the ruler are the real black holes of GW231123: {mine.realTicks.map((t) => t.massSolar).join(', ')} Suns. They do not move when you change a setting.</>,
                <><strong>The ruler goes up in steps of ten</strong>, so equal distances along it mean equal multiples of mass, not equal amounts. That is why a round that nearly doubles the mass always moves the dot the same distance to the right.</>,
              ]}
              worked={
                <>
                  You chose {mine.startSolar} Suns and {mine.rounds} {mine.rounds === 1 ? 'round' : 'rounds'}.{' '}
                  {mine.rows
                    .slice(1)
                    .map((r) => `Round ${r.generation}: ${Number((r.sumSolar! / 2).toFixed(1))} + ${Number((r.sumSolar! / 2).toFixed(1))} = ${Number(r.sumSolar!.toFixed(1))}, minus ${Math.round(ex.share * 100)} percent (${Number(r.radiatedSolar!.toFixed(2))} Suns) = ${Number(r.massSolar.toFixed(1))}.`)
                    .join(' ')}{' '}
                  Each round doubles the number of starting black holes that went into the result, so {mine.rounds} {mine.rounds === 1 ? 'round needs' : 'rounds need'} {mine.startingCount} starting black holes in all.
                </>
              }
              lookFor={[
                { look: 'the teal dots rising from the bottom, and the pink band.', means: `with ${mine.startSolar} Suns and ${mine.rounds} ${mine.rounds === 1 ? 'round' : 'rounds'} the masses are ${masses.join(', ')} Suns, and ${mine.inGapCount} of the ${mine.rows.length} black holes ${mine.inGapCount === 1 ? 'is' : 'are'} in the gap.`, matters: 'this is the arithmetic that Prediction 1 asked about: black holes made by merging can land in the gap, even though each starting black hole is below it.' },
                { look: 'the green ticks, and the teal dot at the top.', means: `your last black hole is ${masses[masses.length - 1]} Suns, which is ${mine.finalOverHeavier.toFixed(2)} times the heavier real black hole of GW231123 (${mine.realTicks[1].massSolar} Suns).`, matters: 'starting black holes below the gap can reach masses like those of GW231123 in a few rounds. That shows only that the arithmetic allows it, not that it happened.' },
                { look: 'the words “starting black holes combined” beside each dot.', means: `the black hole at the top of your climb is made from ${mine.startingCount} starting black holes.`, matters: 'the more rounds, the more earlier black holes have to have met, and whether that happened for GW231123 is not known. It is one of the explanations that come later.' },
              ]}
              whereFrom={
                <>
                  <strong>Real:</strong> the green ticks are the masses of the black holes of GW231123 ({mine.realTicks.map((t) => t.massSolar).join(', ')} Suns), by the LIGO, Virgo and KAGRA teams (the first two from LIGO’s summary and a search summary of the paper’s abstract, and the last a best estimate). The pink band is the gap from theory ({GAP_THEORY_SOLAR.low} to {GAP_THEORY_SOLAR.high}), as LIGO’s summary quotes it.{' '}
                  <strong>Calculated here:</strong> each round’s mass, from the sum and the {Math.round(ex.share * 100)} percent sent out as waves. <strong>Imagined for the question:</strong> everything in teal: the starting black holes, the rounds, and the assumption that the {Math.round(ex.share * 100)} percent (taken from GW250114) holds for every round. Nothing in the teal was observed.
                </>
              }
            />
          </div>
        )}
      </div>
    </div>
  )
}
