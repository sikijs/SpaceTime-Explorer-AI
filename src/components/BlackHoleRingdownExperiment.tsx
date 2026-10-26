import { useEffect, useState } from 'react'
import type { ReactNode } from 'react'
import { GW250114 } from '../physics/horizonAreaLaw'
import { checkUp, comparisonRows, dimensionlessPitch, FASTER_SPIN, GW250114_RINGDOWN, lightCrossingTimeS, MASS_CHOICES_SOLAR, massTable, SECOND_TONE_SIGNIFICANCE, PITCH_CHOICES, pitchGuessMark, pitchMassPicture, pitchSpinPicture, ringingPicture, SPIN_CHOICES, spinTable, swingsGuessBar, swingsPicture, SWINGS_CHOICES, trialRinging, TRIAL_WAVE_SWINGS } from '../physics/blackHoleRingdown'
import type { TrialRinging } from '../physics/blackHoleRingdown'
import type { ComparisonRow } from '../physics/blackHoleRingdown'
import type { PitchChoice, SwingsChoice } from '../physics/blackHoleRingdown'
import { ReferencePanel } from './EnergyMomentumExperiment'
import { BlackHoleRingdownTutor } from './BlackHoleRingdownTutor'
import { LookForList, ResultsTable } from './WideBinariesExperiment'
import type { LookFor } from './WideBinariesExperiment'

// Frontier and Beyond, Experiment 19 (docs/experiments/frontier-and-beyond/19-do-black-holes-ring-like-bells.md).
// STEPS 2 to 8 (the interface skeleton and the introduction, the two predictions, the run and Picture 1, Pictures 2 and 3, Part 2: the learner's own trial black hole, Part 3: the results, then Part 4: the tutor): this file has the title, the status line, the introduction, one illustration (a bell and a black hole, to explain "ringing") with its
// guide, the new-word list, the collapsed "Words and formulas" panel and the "Want to know more?" links. The two predictions are there, and Run starts a five-stage run that draws Picture 1 (the ringing, its swings and the comparison with the measurement, with Prediction 2's guess on it in white), Picture 2 (pitch against spin, with Prediction 1's guess on it in white) and Picture 3 (pitch against mass). Part 2 ("Now try it yourself") has two controls, the mass and the spin, and one drawing that follows them. Part 3 has the results: a reading guide, a check-up table, two more tables, a note under each and the learner's predictions beside them. Part 4 is the tutor. It has no chapter summary yet; those are
// later steps (CLAUDE.md §6). All wording is a DRAFT for the owner's line-by-line approval (CLAUDE.md §28.1), written to the standard of §29. Nothing here says which way the pitch changes
// with spin, how long the ringing lasts, or what was measured (CLAUDE.md §12): those are the predictions' answers and the run's results. The paper that gives them is listed only after the run.

const VIEW_WIDTH = 560
const TEXT_COLOR = '#e2e8f0'
const MUTED_COLOR = '#94a3b8'
const BELL_COLOR = '#fbbf24' // amber: the bell, a comparison
const BLACK_HOLE_COLOR = '#f87171' // red: a black hole and its horizon
const WAVE_COLOR = '#38bdf8' // sky blue: sound, or gravitational waves, and a value calculated here
const MEASURED_COLOR = '#34d399' // green: a value measured by the detectors, and the real swings
const ENVELOPE_COLOR = '#fbbf24' // amber: how far the ringing has faded
const YOURS_COLOR = '#ffffff' // white: the learner's guess
const IMAGINED_COLOR = '#e879f9' // pink-purple: imagined for the question (a black hole that was not observed, or a trial value)
const PART_TWO_COLOR = '#0d9488'
const PART_THREE_COLOR = '#7c3aed'
const PART_FOUR_COLOR = '#0066cc'

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

// A sketch of "ringing": a struck bell sends out sound; a black hole shaken by a merger sends out gravitational waves. No sizes, no pitches, no numbers.
function RingingDrawing() {
  const height = 400
  const cy = 190
  return (
    <svg
      width={VIEW_WIDTH}
      height={height}
      viewBox={`0 0 ${VIEW_WIDTH} ${height}`}
      style={svgStyle}
      role="img"
      aria-label="Illustration, not to scale, in two panels. Panel one, a comparison: a bell in amber with curved blue lines coming out of it, labelled sound, and the words its size and shape set its pitch. Panel two, a black hole just after a merger: a dark shape with a wobbling red outline and curved blue lines coming out of it, labelled gravitational waves, and the words its mass and spin set its pitch. Below, the words a black hole that has just formed is shaken, like a struck bell."
    >
      <text x={20} y={22} fill={TEXT_COLOR} fontSize="13" fontWeight="bold">
        Illustration: what does it mean for a black hole to “ring”?
      </text>

      {/* Panel 1: a bell (a comparison). */}
      <SvgLines x={20} y={52} lines={['1. A comparison: a struck bell']} fill={TEXT_COLOR} bold size={12} />
      <path d="M100 150 Q100 100 140 100 Q180 100 180 150 L196 190 L84 190 Z" fill={BELL_COLOR} stroke="#b45309" strokeWidth={2} />
      <circle cx={140} cy={198} r={6} fill="#b45309" />
      <line x1={140} y1={100} x2={140} y2={84} stroke="#b45309" strokeWidth={3} />
      {[1, 2, 3].map((i) => (
        <path key={i} d={`M${200 + i * 14} ${130 - i * 6} Q${216 + i * 14} 150 ${200 + i * 14} ${170 + i * 6}`} fill="none" stroke={WAVE_COLOR} strokeWidth={2} opacity={1 - i * 0.2} />
      ))}
      <SvgLines x={232} y={200} lines={['sound']} fill={WAVE_COLOR} bold anchor="middle" />
      <SvgLines x={140} y={cy + 52} lines={['the bell']} fill={BELL_COLOR} bold anchor="middle" />
      <SvgLines x={140} y={cy + 100} lines={['its size and shape', 'set its pitch']} fill={MUTED_COLOR} anchor="middle" size={11} />

      <line x1={280} y1={44} x2={280} y2={350} stroke={MUTED_COLOR} strokeWidth={1} strokeDasharray="4 4" />

      {/* Panel 2: a black hole just after a merger. */}
      <SvgLines x={296} y={52} lines={['2. A black hole just after a merger']} fill={TEXT_COLOR} bold size={12} />
      <path d="M420 120 Q458 118 470 150 Q486 190 452 222 Q420 246 388 220 Q356 190 372 150 Q384 120 420 120 Z" fill="#05070f" stroke={BLACK_HOLE_COLOR} strokeWidth={3} strokeDasharray="7 5" />
      <SvgLines x={420} y={cy + 4} lines={['the new', 'black hole']} fill={BLACK_HOLE_COLOR} bold anchor="middle" size={11} />
      {[1, 2, 3].map((i) => (
        <path key={i} d={`M${490 + i * 14} ${130 - i * 6} Q${506 + i * 14} 150 ${490 + i * 14} ${170 + i * 6}`} fill="none" stroke={WAVE_COLOR} strokeWidth={2} opacity={1 - i * 0.2} />
      ))}
      <SvgLines x={515} y={200} lines={['gravitational', 'waves']} fill={WAVE_COLOR} bold anchor="middle" />
      <SvgLines x={420} y={cy + 100} lines={['its mass and spin', 'set its pitch']} fill={MUTED_COLOR} anchor="middle" size={11} />

      <SvgLines x={20} y={height - 48} lines={['A black hole that has just formed in a merger is shaken, like a struck bell.']} fill={TEXT_COLOR} />
      <SvgLines
        x={20}
        y={height - 22}
        lines={['A sketch. Not to scale. The wobbly outline stands for the shaking; no real shape, size or pitch is drawn.', 'The bell is a comparison: gravitational waves are not sound.']}
        fill={MUTED_COLOR}
        size={9}
      />
    </svg>
  )
}

// ---- The run: stages. The timer only paces the display; no number depends on it (CLAUDE.md §11). ----
const STAGE_MS = 2600
const LAST_STAGE = 5
const STAGE_NAMES = ['', 'The ringing after the merger', 'How fast it fades', 'What the detectors measured', 'Pitch and spin', 'Pitch and mass']
const STAGE_LINES = [
  '',
  'Picture 1, panel A, draws the note of the black hole that the merger made, as a calculation.',
  'Panel A now shows how fast the note fades. Panel B counts its swings, and your guess is drawn on it in white.',
  'Panel C sets the calculated pitch and fade time beside what the detectors measured.',
  'Picture 2 shows how the pitch depends on the spin. A black hole of the same mass, spinning faster, is imagined, and your guess for Prediction 1 is drawn on it in white.',
  'Picture 3 shows how the pitch depends on the mass.',
]

function one(n: number): string {
  return n.toFixed(1)
}

const P_X0 = 60
const P_X1 = 520
const P_W = P_X1 - P_X0

function ComparisonPanel({ row, y }: { row: ComparisonRow; y: number }) {
  const x = (v: number) => P_X0 + ((v - row.axisMin) / (row.axisMax - row.axisMin)) * P_W
  const step = row.unit === 'Hz' ? 10 : 0.5
  const ticks: number[] = []
  for (let v = Math.ceil(row.axisMin / step) * step; v <= row.axisMax + 1e-9; v += step) ticks.push(Number(v.toFixed(2)))
  const dec = row.unit === 'Hz' ? 1 : 2
  return (
    <g>
      <SvgLines
        x={P_X0}
        y={y}
        lines={[`${row.name === 'pitch' ? 'Pitch' : 'Fade time'}: calculated ${row.calculated.toFixed(dec)} ${row.unit}, measured ${row.measured.toFixed(dec)} ${row.unit} (give-or-take ${row.low.toFixed(dec)} to ${row.high.toFixed(dec)})`]}
        fill={TEXT_COLOR}
        size={10}
      />
      {/* calculated: a blue triangle above the axis */}
      <polygon points={`${x(row.calculated)},${y + 34} ${x(row.calculated) - 7},${y + 20} ${x(row.calculated) + 7},${y + 20}`} fill={WAVE_COLOR} />
      <SvgLines x={x(row.calculated) - 12} y={y + 30} lines={['calculated']} fill={WAVE_COLOR} size={9} anchor="end" />
      {/* measured: a green dot with its give-or-take as a line */}
      <line x1={x(row.low)} y1={y + 46} x2={x(row.high)} y2={y + 46} stroke={MEASURED_COLOR} strokeWidth={3} />
      <line x1={x(row.low)} y1={y + 40} x2={x(row.low)} y2={y + 52} stroke={MEASURED_COLOR} strokeWidth={2} />
      <line x1={x(row.high)} y1={y + 40} x2={x(row.high)} y2={y + 52} stroke={MEASURED_COLOR} strokeWidth={2} />
      <circle cx={x(row.measured)} cy={y + 46} r={5} fill={MEASURED_COLOR} />
      <SvgLines x={x(row.high) + 10} y={y + 50} lines={['measured, with its give-or-take']} fill={MEASURED_COLOR} size={9} />
      <line x1={P_X0} y1={y + 62} x2={P_X1} y2={y + 62} stroke={MUTED_COLOR} strokeWidth={1} />
      {ticks.map((v) => (
        <g key={v}>
          <line x1={x(v)} y1={y + 62} x2={x(v)} y2={y + 67} stroke={MUTED_COLOR} />
          <SvgLines x={x(v)} y={y + 78} lines={[String(v)]} fill={MUTED_COLOR} size={9} anchor="middle" />
        </g>
      ))}
      <SvgLines x={P_X1} y={y + 90} lines={[`${row.unit} (each row has its own scale)`]} fill={MUTED_COLOR} size={9} anchor="end" />
    </g>
  )
}

function PictureOne({ stage, swingsGuess }: { stage: number; swingsGuess: SwingsChoice | null }) {
  const pic = ringingPicture()
  const swings = swingsPicture()
  const rows = comparisonRows()
  const height = stage >= 3 ? 680 : stage >= 2 ? 420 : 250
  const tx = (tMs: number) => P_X0 + (tMs / pic.axisMaxMs) * P_W
  const CY = 140
  const AMP = 50
  const path = pic.wave.map((p, i) => `${i === 0 ? 'M' : 'L'}${tx(p.tMs).toFixed(1)} ${(CY - p.value * AMP).toFixed(1)}`).join(' ')
  const up = pic.wave.map((p, i) => `${i === 0 ? 'M' : 'L'}${tx(p.tMs).toFixed(1)} ${(CY - p.envelope * AMP).toFixed(1)}`).join(' ')
  const down = pic.wave.map((p, i) => `${i === 0 ? 'M' : 'L'}${tx(p.tMs).toFixed(1)} ${(CY + p.envelope * AMP).toFixed(1)}`).join(' ')
  const sx = (pos: number) => P_X0 + pos * P_W
  const guess = swingsGuess === null ? null : swingsGuessBar(swingsGuess)
  const guessText = swingsGuess === null ? '' : `YOUR GUESS: about ${swingsGuess} ${swingsGuess === 1 ? 'swing' : 'swings'}`
  return (
    <svg
      width={VIEW_WIDTH}
      height={height}
      viewBox={`0 0 ${VIEW_WIDTH} ${height}`}
      style={svgStyle}
      role="img"
      aria-label={`Picture 1. Panel A, a calculated fading wave: the ringing of the black hole after the merger, with one swing of ${one(pic.periodMs)} milliseconds marked.${
        stage >= 2 ? ` It has fallen to about a third of its size after ${one(pic.dampingTimeMs)} milliseconds, about ${one(swings.realSwings)} swing. Panel B, the number of swings on a stretched scale: the calculated value is about ${one(swings.realSwings)}${guess ? `, and your guess of about ${swingsGuess} is drawn in white` : ''}.` : ''
      }${stage >= 3 ? ' Panel C, calculated against measured: for the pitch and for the fade time, the calculated value and the measured value with its give-or-take.' : ''}`}
    >
      <text x={20} y={22} fill={TEXT_COLOR} fontSize="13" fontWeight="bold">
        Picture 1: the ringing of the new black hole
      </text>
      <SvgLines x={20} y={40} lines={[`${GW250114_RINGDOWN.finalMassSolar} Suns, spin ${GW250114_RINGDOWN.finalSpin} (the merger GW250114), as the detectors would record it`]} fill={MUTED_COLOR} />

      {stage >= 1 && (
        <g>
          <SvgLines x={P_X0} y={62} lines={['A. The note, as a fading wave (calculated)']} fill={TEXT_COLOR} bold size={11} />
          <path d={path} fill="none" stroke={WAVE_COLOR} strokeWidth={2} />
          <line x1={P_X0} y1={CY} x2={P_X1} y2={CY} stroke={MUTED_COLOR} strokeWidth={0.5} strokeDasharray="2 3" />
          {/* one swing: from the first crest to the next */}
          <line x1={tx(0)} y1={80} x2={tx(pic.periodMs)} y2={80} stroke={TEXT_COLOR} strokeWidth={1.5} />
          <line x1={tx(0)} y1={75} x2={tx(0)} y2={85} stroke={TEXT_COLOR} strokeWidth={1.5} />
          <line x1={tx(pic.periodMs)} y1={75} x2={tx(pic.periodMs)} y2={85} stroke={TEXT_COLOR} strokeWidth={1.5} />
          <SvgLines x={tx(pic.periodMs) + 8} y={83} lines={[`one swing: ${one(pic.periodMs)} ms`]} fill={TEXT_COLOR} size={10} />
          <line x1={P_X0} y1={CY + AMP + 12} x2={P_X1} y2={CY + AMP + 12} stroke={MUTED_COLOR} strokeWidth={1} />
          {[0, 5, 10, 15, 20].map((t) => (
            <g key={t}>
              <line x1={tx(t)} y1={CY + AMP + 12} x2={tx(t)} y2={CY + AMP + 17} stroke={MUTED_COLOR} />
              <SvgLines x={tx(t)} y={CY + AMP + 29} lines={[String(t)]} fill={MUTED_COLOR} size={9} anchor="middle" />
            </g>
          ))}
          <SvgLines x={P_X1} y={CY + AMP + 42} lines={['time after the ringing starts, in milliseconds (ms)']} fill={MUTED_COLOR} size={9} anchor="end" />
        </g>
      )}

      {stage >= 2 && (
        <g>
          <path d={up} fill="none" stroke={ENVELOPE_COLOR} strokeWidth={1.5} strokeDasharray="5 3" />
          <path d={down} fill="none" stroke={ENVELOPE_COLOR} strokeWidth={1.5} strokeDasharray="5 3" />
          <line x1={tx(pic.dampingTimeMs)} y1={CY - AMP - 4} x2={tx(pic.dampingTimeMs)} y2={CY + AMP + 12} stroke={ENVELOPE_COLOR} strokeWidth={1} strokeDasharray="1 3" />
          <line x1={tx(pic.dampingTimeMs)} y1={98} x2={tx(7) - 6} y2={98} stroke={ENVELOPE_COLOR} strokeWidth={1} />
          <SvgLines x={tx(7)} y={101} lines={[`fade time: ${one(pic.dampingTimeMs)} ms`, 'the size has fallen to about', 'a third (1/e, which is 0.37)']} fill={ENVELOPE_COLOR} size={10} bold />

          <SvgLines x={P_X0} y={254} lines={['B. How many swings is one fade time? (calculated)']} fill={TEXT_COLOR} bold size={11} />
          <SvgLines x={P_X0} y={272} lines={[`calculated: about ${one(swings.realSwings)} ${one(swings.realSwings) === '1.0' ? 'swing' : 'swings'}`]} fill={MEASURED_COLOR} size={10} bold />
          <rect x={P_X0} y={278} width={swings.realPosition * P_W} height={14} fill={MEASURED_COLOR} />
          {guess && (
            <g>
              <rect x={P_X0} y={300} width={Math.max(guess.position * P_W, 2)} height={14} fill={YOURS_COLOR} />
              <line x1={sx(guess.position)} y1={314} x2={Math.min(Math.max(sx(guess.position), 340), 500)} y2={326} stroke={YOURS_COLOR} strokeWidth={2} />
              <rect x={340} y={326} width={180} height={26} rx={4} fill="#0b1020" stroke={YOURS_COLOR} strokeWidth={2.5} />
              <SvgLines x={430} y={343} lines={[guessText]} fill={YOURS_COLOR} bold size={10} anchor="middle" />
            </g>
          )}
          <line x1={P_X0} y1={370} x2={P_X1} y2={370} stroke={MUTED_COLOR} strokeWidth={1} />
          {swings.ticks.map((t) => (
            <g key={t.swings}>
              <line x1={sx(t.position)} y1={370} x2={sx(t.position)} y2={375} stroke={MUTED_COLOR} />
              <SvgLines x={sx(t.position)} y={388} lines={[String(t.swings)]} fill={MUTED_COLOR} size={9} anchor="middle" />
            </g>
          ))}
          <SvgLines x={P_X1} y={402} lines={['number of swings (a stretched scale: each step is a multiple)']} fill={MUTED_COLOR} size={9} anchor="end" />
        </g>
      )}

      {stage >= 3 && (
        <g>
          <SvgLines x={P_X0} y={430} lines={['C. Calculated against measured']} fill={TEXT_COLOR} bold size={11} />
          <ComparisonPanel row={rows[0]} y={452} />
          <ComparisonPanel row={rows[1]} y={570} />
        </g>
      )}
    </svg>
  )
}

const Q_X0 = 70
const Q_X1 = 520
const Q_W = Q_X1 - Q_X0
const Q_BOTTOM = 330
const Q_TOP = 60
const Q_H = Q_BOTTOM - Q_TOP

function PictureTwo({ pitchGuess }: { pitchGuess: PitchChoice | null }) {
  const pic = pitchSpinPicture()
  const xs = (spin: number) => Q_X0 + spin * Q_W
  const yv = (hz: number) => Q_BOTTOM - (hz / pic.axisMaxHz) * Q_H
  const path = pic.curve.map((p, i) => `${i === 0 ? 'M' : 'L'}${xs(p.spin).toFixed(1)} ${yv(p.frequencyHz).toFixed(1)}`).join(' ')
  const mark = pitchGuess === null ? null : pitchGuessMark(pitchGuess)
  const mx = xs(FASTER_SPIN)
  const my = yv(pic.real.frequencyHz)
  const endY = mark === null ? my : my - mark.direction * 26
  return (
    <svg
      width={VIEW_WIDTH}
      height={420}
      viewBox="0 0 560 420"
      style={svgStyle}
      role="img"
      aria-label={`Picture 2, pitch against spin for a black hole of ${pic.massSolar} Suns. A rising blue curve from ${Math.round(pic.curve[0].frequencyHz)} hertz at spin 0 to ${Math.round(pic.curve[pic.curve.length - 1].frequencyHz)} hertz at spin 0.99. A green dot for the black hole GW250114 made, spin ${pic.real.spin}, ${Math.round(pic.real.frequencyHz)} hertz. A pink dot for an imagined black hole of the same mass with spin ${pic.faster.spin}, ${Math.round(pic.faster.frequencyHz)} hertz.${pitchGuess ? ` Your guess, ${PITCH_PHRASE[pitchGuess]}, is drawn in white as an arrow.` : ''}`}
    >
      <text x={20} y={22} fill={TEXT_COLOR} fontSize="13" fontWeight="bold">
        Picture 2: the pitch and the spin
      </text>
      <SvgLines x={20} y={40} lines={[`for a black hole of ${pic.massSolar} Suns; pitch in the black hole’s own frame`]} fill={MUTED_COLOR} />
      <line x1={Q_X0} y1={Q_BOTTOM} x2={Q_X1} y2={Q_BOTTOM} stroke={MUTED_COLOR} />
      <line x1={Q_X0} y1={Q_TOP} x2={Q_X0} y2={Q_BOTTOM} stroke={MUTED_COLOR} />
      {[0, 100, 200, 300, 400, 500].map((hz) => (
        <g key={hz}>
          <line x1={Q_X0 - 4} y1={yv(hz)} x2={Q_X0} y2={yv(hz)} stroke={MUTED_COLOR} />
          <SvgLines x={Q_X0 - 8} y={yv(hz) + 3} lines={[String(hz)]} fill={MUTED_COLOR} size={9} anchor="end" />
        </g>
      ))}
      {[0, 0.2, 0.4, 0.6, 0.8, 1].map((sp) => (
        <g key={sp}>
          <line x1={xs(sp)} y1={Q_BOTTOM} x2={xs(sp)} y2={Q_BOTTOM + 5} stroke={MUTED_COLOR} />
          <SvgLines x={xs(sp)} y={Q_BOTTOM + 18} lines={[String(sp)]} fill={MUTED_COLOR} size={9} anchor="middle" />
        </g>
      ))}
      <SvgLines x={Q_X1} y={Q_BOTTOM + 34} lines={['spin (0 is not turning; 1 is the fastest possible)']} fill={MUTED_COLOR} size={9} anchor="end" />
      <SvgLines x={Q_X0 - 8} y={Q_TOP - 8} lines={['pitch (Hz)']} fill={MUTED_COLOR} size={9} anchor="end" />

      <path d={path} fill="none" stroke={WAVE_COLOR} strokeWidth={2.5} />
      <SvgLines x={xs(0.06)} y={yv(pic.curve[6].frequencyHz) - 12} lines={['calculated']} fill={WAVE_COLOR} bold size={10} />
      <line x1={xs(pic.real.spin)} y1={my} x2={Q_X1} y2={my} stroke={MEASURED_COLOR} strokeWidth={1} strokeDasharray="4 3" />
      <circle cx={xs(pic.real.spin)} cy={my} r={6} fill={MEASURED_COLOR} />
      <SvgLines x={xs(pic.real.spin) - 14} y={my - 12} lines={['the black hole GW250114 made:', `spin ${pic.real.spin} (measured), ${Math.round(pic.real.frequencyHz)} Hz`]} fill={MEASURED_COLOR} bold size={10} anchor="end" />
      <circle cx={xs(pic.faster.spin)} cy={yv(pic.faster.frequencyHz)} r={6} fill={IMAGINED_COLOR} />
      <SvgLines x={xs(pic.faster.spin) - 12} y={yv(pic.faster.frequencyHz) - 18} lines={['imagined: the same mass,', `spin ${pic.faster.spin}: ${Math.round(pic.faster.frequencyHz)} Hz`]} fill={IMAGINED_COLOR} bold size={10} anchor="end" />

      {mark && (
        <g>
          {mark.direction === 0 ? (
            <line x1={mx - 16} y1={my} x2={mx + 16} y2={my} stroke={YOURS_COLOR} strokeWidth={5} />
          ) : (
            <g>
              <line x1={mx} y1={my} x2={mx} y2={endY} stroke={YOURS_COLOR} strokeWidth={5} />
              <polygon points={`${mx},${endY - mark.direction * 8} ${mx - 8},${endY} ${mx + 8},${endY}`} fill={YOURS_COLOR} />
            </g>
          )}
          <line x1={mx} y1={my} x2={mx} y2={252} stroke={YOURS_COLOR} strokeWidth={2} />
          <rect x={320} y={252} width={200} height={26} rx={4} fill="#0b1020" stroke={YOURS_COLOR} strokeWidth={2.5} />
          <SvgLines x={420} y={269} lines={[`YOUR GUESS: ${PITCH_LABELS[pitchGuess as PitchChoice].toLowerCase()} pitch`]} fill={YOURS_COLOR} bold size={10} anchor="middle" />
        </g>
      )}
      <SvgLines x={20} y={404} lines={['The white arrow only shows the direction of your guess, from the green dot’s pitch. Its length means nothing.']} fill={MUTED_COLOR} size={9} />
    </svg>
  )
}

const MASS_X_TICKS: { mass: number; label: string }[] = [
  { mass: 10, label: '10' },
  { mass: 100, label: '100' },
  { mass: 1e3, label: '1,000' },
  { mass: 1e4, label: '10,000' },
  { mass: 1e5, label: '100,000' },
  { mass: 1e6, label: '1 million' },
  { mass: 1e7, label: '10 million' },
]
const PITCH_Y_TICKS: { hz: number; label: string }[] = [
  { hz: 0.01, label: '0.01' },
  { hz: 0.1, label: '0.1' },
  { hz: 1, label: '1' },
  { hz: 10, label: '10' },
  { hz: 100, label: '100' },
  { hz: 1000, label: '1,000' },
]

function fmtHz(hz: number): string {
  return hz >= 100 ? Math.round(hz).toLocaleString('en-US') : hz >= 1 ? hz.toFixed(1) : hz.toFixed(4)
}

function PictureThree() {
  const pic = pitchMassPicture()
  const lx = Math.log(pic.massAxis.max / pic.massAxis.min)
  const ly = Math.log(pic.pitchAxis.max / pic.pitchAxis.min)
  const xm = (mass: number) => Q_X0 + (Math.log(mass / pic.massAxis.min) / lx) * Q_W
  const yh = (hz: number) => Q_BOTTOM - (Math.log(hz / pic.pitchAxis.min) / ly) * Q_H
  const px = (pos: number) => Q_X0 + pos * Q_W
  const py = (pos: number) => Q_BOTTOM - pos * Q_H
  const pts = pic.points
  return (
    <svg
      width={VIEW_WIDTH}
      height={420}
      viewBox="0 0 560 420"
      style={svgStyle}
      role="img"
      aria-label={`Picture 3, pitch against mass for black holes that spin at ${pic.spin}, on scales where each step is a multiple of ten. A straight blue line falls from left to right. ${pts.map((p) => `${p.label}: ${fmtHz(p.frequencyHz)} hertz`).join('; ')}.`}
    >
      <text x={20} y={22} fill={TEXT_COLOR} fontSize="13" fontWeight="bold">
        Picture 3: the pitch and the mass
      </text>
      <SvgLines x={20} y={40} lines={[`for black holes that spin at ${pic.spin}; pitch in each black hole’s own frame; both scales go up in steps of ten`]} fill={MUTED_COLOR} />
      <line x1={Q_X0} y1={Q_BOTTOM} x2={Q_X1} y2={Q_BOTTOM} stroke={MUTED_COLOR} />
      <line x1={Q_X0} y1={Q_TOP} x2={Q_X0} y2={Q_BOTTOM} stroke={MUTED_COLOR} />
      {PITCH_Y_TICKS.map((t) => (
        <g key={t.hz}>
          <line x1={Q_X0 - 4} y1={yh(t.hz)} x2={Q_X0} y2={yh(t.hz)} stroke={MUTED_COLOR} />
          <SvgLines x={Q_X0 - 8} y={yh(t.hz) + 3} lines={[t.label]} fill={MUTED_COLOR} size={9} anchor="end" />
        </g>
      ))}
      {MASS_X_TICKS.map((t) => (
        <g key={t.mass}>
          <line x1={xm(t.mass)} y1={Q_BOTTOM} x2={xm(t.mass)} y2={Q_BOTTOM + 5} stroke={MUTED_COLOR} />
          <SvgLines x={xm(t.mass)} y={Q_BOTTOM + 18} lines={[t.label]} fill={MUTED_COLOR} size={9} anchor="middle" />
        </g>
      ))}
      <SvgLines x={Q_X1} y={Q_BOTTOM + 34} lines={['mass of the black hole, in Suns']} fill={MUTED_COLOR} size={9} anchor="end" />
      <SvgLines x={Q_X0 - 8} y={Q_TOP - 8} lines={['pitch (Hz)']} fill={MUTED_COLOR} size={9} anchor="end" />

      <line x1={px(pic.line.from.xPosition)} y1={py(pic.line.from.yPosition)} x2={px(pic.line.to.xPosition)} y2={py(pic.line.to.yPosition)} stroke={WAVE_COLOR} strokeWidth={2.5} />
      <SvgLines x={xm(3e3) + 12} y={yh((pts[2].frequencyHz * pts[2].massSolar) / 3e3) - 8} lines={['calculated']} fill={WAVE_COLOR} bold size={10} />

      {pts.slice(0, 4).map((p, i) => {
        const isReal = p.massSolar === GW250114_RINGDOWN.finalMassSolar
        const colour = isReal ? MEASURED_COLOR : IMAGINED_COLOR
        const ly0 = 74 + i * 16
        return (
          <g key={p.label}>
            <line x1={px(p.xPosition)} y1={py(p.yPosition)} x2={236} y2={ly0 - 3} stroke={colour} strokeWidth={1} opacity={0.6} />
            <circle cx={px(p.xPosition)} cy={py(p.yPosition)} r={5} fill={colour} />
            <SvgLines x={240} y={ly0} lines={[`${p.label}: ${fmtHz(p.frequencyHz)} Hz${isReal ? ' (calculated)' : ' (imagined)'}`]} fill={colour} bold={isReal} size={10} />
          </g>
        )
      })}
      {(() => {
        const sgr = pts[4]
        return (
          <g>
            <line x1={px(sgr.xPosition)} y1={py(sgr.yPosition)} x2={500} y2={228} stroke={IMAGINED_COLOR} strokeWidth={1} opacity={0.6} />
            <circle cx={px(sgr.xPosition)} cy={py(sgr.yPosition)} r={5} fill={IMAGINED_COLOR} />
            <SvgLines x={520} y={196} lines={[sgr.label, `${fmtHz(sgr.frequencyHz)} Hz: one swing`, `every ${(sgr.periodSeconds / 60).toFixed(0)} minutes (imagined)`]} fill={IMAGINED_COLOR} size={10} anchor="end" />
          </g>
        )
      })()}
      <SvgLines x={20} y={404} lines={['No guess is drawn on this picture: none of the predictions is about the mass.']} fill={MUTED_COLOR} size={9} />
    </svg>
  )
}

// ---- Part 2: the learner's own trial black hole (one drawing that follows the two controls; the real pictures never change) ----

const MASS_TRIAL_LABELS: Record<number, string> = {
  10: '10 Suns',
  30: '30 Suns',
  [GW250114_RINGDOWN.finalMassSolar]: `${GW250114_RINGDOWN.finalMassSolar} Suns (GW250114’s)`,
  100: '100 Suns',
  4.3e6: '4.3 million Suns (Sagittarius A*)',
}

// A length of time given in seconds, in a unit that reads easily.
function formatTime(seconds: number): string {
  if (seconds >= 60) return `${(seconds / 60).toFixed(1)} minutes`
  if (seconds >= 1) return `${seconds.toFixed(2)} seconds`
  return `${(seconds * 1000).toFixed(2)} ms`
}

function TrialDrawing({ trial }: { trial: TrialRinging }) {
  const xs = (pos: number) => Q_X0 + pos * Q_W
  const xw = (swings: number) => Q_X0 + (swings / TRIAL_WAVE_SWINGS) * Q_W
  const CY = 246
  const AMP = 48
  const wave = trial.wave.map((p, i) => `${i === 0 ? 'M' : 'L'}${xw(p.swings).toFixed(1)} ${(CY - p.value * AMP).toFixed(1)}`).join(' ')
  const trialUp = trial.wave.map((p, i) => `${i === 0 ? 'M' : 'L'}${xw(p.swings).toFixed(1)} ${(CY - p.envelope * AMP).toFixed(1)}`).join(' ')
  const realUp = trial.realEnvelope.map((p, i) => `${i === 0 ? 'M' : 'L'}${xw(p.swings).toFixed(1)} ${(CY - p.envelope * AMP).toFixed(1)}`).join(' ')
  const realDown = trial.realEnvelope.map((p, i) => `${i === 0 ? 'M' : 'L'}${xw(p.swings).toFixed(1)} ${(CY + p.envelope * AMP).toFixed(1)}`).join(' ')
  return (
    <svg
      width={VIEW_WIDTH}
      height={410}
      viewBox="0 0 560 410"
      style={svgStyle}
      role="img"
      aria-label={`Drawing A, your trial black hole of ${MASS_TRIAL_LABELS[trial.massSolar] ?? `${trial.massSolar} Suns`} with spin ${trial.spin}, imagined for the question. Top: its pitch, ${fmtHz(trial.frequencyHz)} hertz, as a pink dot on a stretched scale, beside a green tick for the black hole GW250114 made. Below: its ringing, counted in swings, as a pink wave that falls to a third of its size after ${trial.swingsToFade.toFixed(1)} swings, beside the green dashed curve for GW250114's black hole.`}
    >
      <text x={20} y={22} fill={TEXT_COLOR} fontSize="13" fontWeight="bold">
        Drawing A: your trial black hole
      </text>
      <SvgLines x={20} y={40} lines={['imagined for the question; pitch in the black hole’s own frame']} fill={MUTED_COLOR} />

      <SvgLines x={Q_X0} y={64} lines={['The pitch (each step on the scale is a multiple of ten)']} fill={TEXT_COLOR} bold size={11} />
      <SvgLines x={Q_X0} y={80} lines={[`green tick: the black hole GW250114 made (${Math.round(GW250114_PITCH_HZ)} Hz)`]} fill={MEASURED_COLOR} size={10} />
      <SvgLines x={Q_X0} y={93} lines={[`pink dot: your trial (${fmtHz(trial.frequencyHz)} Hz)`]} fill={IMAGINED_COLOR} size={10} bold />
      <line x1={Q_X0} y1={124} x2={Q_X1} y2={124} stroke={MUTED_COLOR} />
      {PITCH_Y_TICKS.map((t) => {
        const pos = Math.log(t.hz / 0.002) / Math.log(5000 / 0.002)
        return (
          <g key={t.hz}>
            <line x1={xs(pos)} y1={124} x2={xs(pos)} y2={129} stroke={MUTED_COLOR} />
            <SvgLines x={xs(pos)} y={142} lines={[t.label]} fill={MUTED_COLOR} size={9} anchor="middle" />
          </g>
        )
      })}
      <SvgLines x={Q_X1} y={154} lines={['pitch (Hz)']} fill={MUTED_COLOR} size={9} anchor="end" />
      <line x1={xs(trial.realPitchPosition)} y1={102} x2={xs(trial.realPitchPosition)} y2={124} stroke={MEASURED_COLOR} strokeWidth={3} />
      <circle cx={xs(trial.pitchPosition)} cy={113} r={7} fill={IMAGINED_COLOR} />

      <SvgLines x={Q_X0} y={180} lines={['The ringing, counted in swings (not in seconds)']} fill={TEXT_COLOR} bold size={11} />
      <SvgLines x={Q_X0} y={195} lines={['pink wave and pink dashed curve: your trial. green dashed curve: GW250114’s black hole']} fill={MUTED_COLOR} size={10} />
      <line x1={Q_X0} y1={CY} x2={Q_X1} y2={CY} stroke={MUTED_COLOR} strokeWidth={0.5} strokeDasharray="2 3" />
      <path d={realUp} fill="none" stroke={MEASURED_COLOR} strokeWidth={1.5} strokeDasharray="5 3" />
      <path d={realDown} fill="none" stroke={MEASURED_COLOR} strokeWidth={1.5} strokeDasharray="5 3" />
      <path d={wave} fill="none" stroke={IMAGINED_COLOR} strokeWidth={2} />
      <path d={trialUp} fill="none" stroke={IMAGINED_COLOR} strokeWidth={1.2} strokeDasharray="2 3" />
      <line x1={Q_X0} y1={CY + AMP + 10} x2={Q_X1} y2={CY + AMP + 10} stroke={MUTED_COLOR} />
      {[0, 1, 2, 3, 4, 5, 6].map((n) => (
        <g key={n}>
          <line x1={xw(n)} y1={CY + AMP + 10} x2={xw(n)} y2={CY + AMP + 15} stroke={MUTED_COLOR} />
          <SvgLines x={xw(n)} y={CY + AMP + 27} lines={[String(n)]} fill={MUTED_COLOR} size={9} anchor="middle" />
        </g>
      ))}
      <SvgLines x={Q_X1} y={CY + AMP + 40} lines={['number of swings since the ringing started']} fill={MUTED_COLOR} size={9} anchor="end" />

      <SvgLines
        x={Q_X0}
        y={348}
        lines={[
          `your trial: ${MASS_TRIAL_LABELS[trial.massSolar] ?? `${trial.massSolar} Suns`}, spin ${trial.spin}`,
          `pitch ${fmtHz(trial.frequencyHz)} Hz; one swing ${formatTime(trial.periodSeconds)}; fades to a third in ${formatTime(trial.dampingTimeMs / 1000)}`,
          `that is ${trial.swingsToFade.toFixed(1)} swings; the pitch is ${trial.pitchOverReal.toFixed(2)} times GW250114’s black hole’s`,
        ]}
        fill={IMAGINED_COLOR}
        bold
        size={10}
      />
      <SvgLines x={20} y={400} lines={['These are your own trial values. They do not say that a real black hole is like this.']} fill={MUTED_COLOR} size={9} />
    </svg>
  )
}

// The pitch of the black hole GW250114 made, in its own frame (the same as the green dot in Picture 2).
const GW250114_PITCH_HZ = pitchSpinPicture().real.frequencyHz

function NoteList({ items }: { items: { name: string; what: string; means: string; matters: string; sure: string }[] }) {
  return (
    <div style={{ fontSize: '0.875rem', color: 'var(--text-muted)', marginTop: '0.75rem', marginBottom: '1rem' }}>
      <p style={{ marginTop: 0, marginBottom: '0.5rem' }}>
        <strong>What this table tells us.</strong>
      </p>
      <ul style={{ margin: 0, paddingLeft: '1.25rem' }}>
        {items.map((item) => (
          <li key={item.name} style={{ marginBottom: '0.5rem' }}>
            <strong>{item.name}:</strong> <strong>What it is:</strong> {item.what} <strong>What it means:</strong> {item.means} <strong>Why it matters:</strong> {item.matters}{' '}
            <strong>How sure:</strong> {item.sure}
          </li>
        ))}
      </ul>
    </div>
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

const lookForRinging: LookFor[] = [
  {
    look: 'the amber bell on the left, and the blue curved lines coming out of it.',
    means: 'a struck bell shakes, and the shaking makes sound that spreads out. You can tell a big bell from a small one by its pitch, which is how high or low its note is.',
    matters: 'the pitch of a bell is a fingerprint of the bell itself. This experiment asks whether a black hole has a fingerprint like that too.',
  },
  {
    look: 'the wobbly red outline of the black hole on the right, and the blue curved lines coming out of it.',
    means: 'just after two black holes merge, the one that results is lopsided and shaken, and it settles down by sending out gravitational waves. The wobble stands for the shaking. Gravitational waves are not sound, but they are a ripple that spreads out in the same way.',
    matters: 'those ripples can be recorded, so a pitch and a fade can be measured, as you could with a bell.',
  },
  {
    look: 'the grey words under each picture: “its size and shape set its pitch” and “its mass and spin set its pitch”.',
    means: 'a bell’s pitch depends on how big it is and what shape it has. For a black hole, general relativity says the pitch depends on only two numbers, its mass and its spin, which you met in Black Holes Experiments 1 and 8.',
    matters: 'if a black hole has nothing else about it that matters, then measuring the pitch gives a test: does the ringing match what its mass and spin should give? That is the question of this experiment.',
  },
]

function referenceEntries(): { term: string; meaning: string }[] {
  return [
    { term: 'Swing', meaning: 'one full back-and-forth of the shaking, from one crest of the wave to the next. A note of 100 Hz makes 100 swings in one second.' },
    { term: 'Tone (main tone, second tone)', meaning: 'the ringing of a black hole is made of more than one tone, as the sound of a bell is made of more than one note. The main tone is the loudest and lasts longest. The second tone is fainter and fades faster.' },
    { term: 'Redshift and the stretch', meaning: 'a signal that has travelled a long way across the expanding universe arrives stretched: each swing takes longer, so the pitch is lower than the black hole’s own. The stretch is a factor of 1 + z, where z is the redshift (Cosmology Experiment 1).' },
    { term: 'Give-or-take', meaning: 'the size of the uncertainty of a measurement, written “11 ± 1”. It says how far the true value could be from the measured one. (Experiment 1 of this group explains it.)' },
    { term: 'Millisecond (ms)', meaning: 'a thousandth of a second. A signal that lasts 4 ms is over in four thousandths of a second.' },
    { term: 'Light-year', meaning: 'the distance light travels in a year, about 9.5 million million kilometres. The merger in this experiment happened about a billion light-years away.' },
    { term: 'Quality factor (Q)', meaning: 'a number for how many swings a ringing lasts. The ringing falls to about a third of its size (1/e) after Q ÷ π swings.' },
    { term: 'Ringing (ringdown)', meaning: 'the shaking of a black hole just after a merger, as it settles into a calm, round shape. It gives off gravitational waves with a pitch and a fade, a little like a struck bell gives off sound.' },
    { term: 'Pitch (frequency)', meaning: 'how high or low a note is. It is measured in hertz (Hz), the number of swings in one second. A note of 100 Hz swings 100 times a second.' },
    { term: 'Fade time', meaning: 'how long the ringing takes to die down. It is given as the time for the ringing to fall to about a third (more exactly 1/e, which is 0.37) of its size.' },
    { term: 'No-hair idea', meaning: 'the idea in general relativity that a settled black hole is described by only a few numbers, with nothing else about it that matters: its mass and its spin. (“Hair” stands for any extra detail.) If so, its pitch and fade time must follow from its mass and spin alone.' },
    { term: 'Hertz (Hz)', meaning: 'a unit of pitch: one swing a second. The lowest note on a piano is about 27 Hz and the middle C is about 262 Hz.' },
    { term: 'Black hole merger', meaning: 'two black holes that have been circling each other come together and join into one black hole. A merger sends out gravitational waves (Gravitational Waves Experiments 1 to 4).' },
    { term: 'Gravitational waves', meaning: 'ripples in space itself, made when heavy objects such as black holes move fast. They carry energy away from the objects that make them.' },
    { term: 'Spin', meaning: 'how fast a black hole turns. In Black Holes Experiment 8 it is a number from 0 (not turning) up to just under 1 (turning as fast as is possible).' },
    { term: 'Signal-to-noise ratio', meaning: 'a number for how clearly a signal stands out from the random background noise in a detector. Think of a friend talking at a party: the louder their voice is compared with the chatter, the more clearly you hear them.' },
    { term: 'Solar mass', meaning: 'a unit for how heavy stars and black holes are. One solar mass is the mass of the Sun, so “10 solar masses” means 10 times as heavy as the Sun.' },
  ]
}

const PITCH_LABELS: Record<PitchChoice, string> = { lower: 'Lower', same: 'About the same', higher: 'Higher' }
// The guess as a phrase that reads on its own ("a lower pitch", "about the same pitch", "a higher pitch").
const PITCH_PHRASE: Record<PitchChoice, string> = { lower: 'a lower pitch', same: 'about the same pitch', higher: 'a higher pitch' }
const SWINGS_LABELS: Record<SwingsChoice, string> = {
  0.1: 'About 0.1 (a tenth of one swing)',
  0.3: 'About 0.3 (less than one swing)',
  1: 'About 1 swing',
  3: 'About 3 swings',
  10: 'About 10 swings',
  30: 'About 30 swings',
}

interface BlackHoleRingdownExperimentProps {
  onComplete?: () => void
  onTutorComplete?: () => void
}

export function BlackHoleRingdownExperiment({ onComplete, onTutorComplete }: BlackHoleRingdownExperimentProps) {
  const g = GW250114
  const [low, high] = g.strongerThanPreviousBest
  const [pitchGuess, setPitchGuess] = useState<PitchChoice | null>(null)
  const [swingsGuess, setSwingsGuess] = useState<SwingsChoice | null>(null)
  const [massChoice, setMassChoice] = useState<number>(GW250114_RINGDOWN.finalMassSolar)
  const [spinChoice, setSpinChoice] = useState<number>(GW250114_RINGDOWN.finalSpin)
  const [status, setStatus] = useState<'idle' | 'running' | 'complete'>('idle')
  const [stage, setStage] = useState(0)
  const recorded = status !== 'idle'
  const done = status === 'complete'
  const bothPredicted = pitchGuess !== null && swingsGuess !== null

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
    setPitchGuess(null)
    setSwingsGuess(null)
    setMassChoice(GW250114_RINGDOWN.finalMassSolar)
    setSpinChoice(GW250114_RINGDOWN.finalSpin)
    setStatus('idle')
    setStage(0)
  }
  const run = () => {
    setStage(1)
    setStatus('running')
  }
  // Every number in the captions comes from the physics module (CLAUDE.md §9).
  const pic = ringingPicture()
  const swingsPic = swingsPicture()
  const rows = comparisonRows()
  const guessBar = swingsGuess === null ? null : swingsGuessBar(swingsGuess)
  const spinPic = pitchSpinPicture()
  const massPic = pitchMassPicture()
  const mine = trialRinging(massChoice, spinChoice)
  const mineLight = trialRinging(massPic.points[0].massSolar, spinChoice)
  const cu = checkUp()
  const spinRows = spinTable()
  const massRows = massTable()
  const pct = (n: number) => `${Math.abs(n).toFixed(1)} percent ${n >= 0 ? 'above' : 'below'}`
  return (
    <div>
      <h2>Experiment 19 — Do Black Holes Ring Like Bells? (GW250114’s Ringdown and the “No-Hair” Test)</h2>
      <div className="exp-card" style={{ marginTop: '2rem', padding: '1.5rem' }}>
        <p style={{ marginTop: 0, marginBottom: '1.5rem', fontSize: '0.875rem' }}>
          <strong>
            Where this stands (as of October 2026): the clear signal from the merger GW250114 let the LIGO, Virgo and KAGRA teams listen to the “ringing” of the new black hole and
            compare it with what general relativity says it should be. That is strong evidence, from one very clear event, and it is clearest for the main tone of the ringing. A
            second, faster-fading tone is weaker evidence. What the test found is shown after you press Run, so that you can guess first.
          </strong>
        </p>

        <div style={{ marginBottom: '1.5rem' }}>
          <p style={paragraph}>
            <strong>The question.</strong> When you strike a bell, it rings: it shakes, and it gives off a note that slowly dies away. A big bell has a lower note than a small one. When
            two black holes merge, the single black hole they make is lopsided and shaken, and it also “rings” for a moment, giving off gravitational waves with a pitch and a fade. Do
            black holes ring like bells? And can we tell what a black hole is like from how it rings?
          </p>

          <p style={{ marginTop: 0, marginBottom: '0.5rem' }}>
            <strong>Why a bigger bell has a lower note.</strong> A bell makes sound by shaking back and forth very fast. The pitch is how many times it shakes each second:
          </p>
          <ul style={{ margin: '0 0 0.75rem', paddingLeft: '1.25rem' }}>
            <li>Fast shaking, many swings a second, gives a high note.</li>
            <li>Slow shaking, few swings a second, gives a low note.</li>
          </ul>
          <p style={{ marginTop: 0, marginBottom: '0.5rem' }}>
            A bigger bell is slower to shake, for the same reason a longer thing is slower to swing back and forth:
          </p>
          <ul style={{ margin: '0 0 0.75rem', paddingLeft: '1.25rem' }}>
            <li>
              <strong>A ruler on a desk.</strong> Hold one end down and flick the other. A short overhang buzzes quickly and sounds high. A long overhang wobbles slowly and sounds low.
            </li>
            <li>
              <strong>A guitar string.</strong> A long string, or a thick one, sounds lower than a short, thin one.
            </li>
            <li>
              <strong>A swing.</strong> A long swing takes longer to go back and forth than a short one.
            </li>
          </ul>

          <p style={paragraph}>
            <strong>Where we left off.</strong> In Black Holes Experiments 1 and 8 you saw that a black hole’s size depends on its mass and on its spin. In Gravitational Waves
            Experiments 1 to 4 you saw that two black holes circling each other send out gravitational waves. In Experiment 18 of this group you met GW250114, a merger that was
            recorded very clearly. This experiment asks what the black hole did <em>after</em> the merger.
          </p>

          <p style={paragraph}>
            <strong>What “ringing” is, and the no-hair idea.</strong> Just after a merger the new black hole is not yet a calm, round, spinning ball. It is shaken, and it settles down by
            sending out gravitational waves. Those waves have a <strong>pitch</strong> (how high or low the note is) and a <strong>fade time</strong> (how long the ringing takes to die
            down). General relativity makes a bold claim, called the <strong>no-hair idea</strong>: once a black hole has settled, it is described by only two numbers, its mass and its
            spin. There is no other detail about it (no “hair”) that matters. If that is true, the pitch and the fade time must follow from the mass and the spin alone. So the ringing is
            a test: measure the pitch and the fade time, and see whether they match what the mass and the spin, measured in a different way, should give.
          </p>

          <div style={{ marginBottom: '0.75rem' }}>
            <RingingDrawing />
          </div>
          <div style={{ fontSize: '0.875rem', color: 'var(--text-muted)', marginBottom: '0.75rem' }}>
            <p style={paragraph}>
              <strong>How to read this illustration.</strong> It explains the word “ringing” when it is used for a black hole. It is a sketch of the idea, not a drawing of a real black
              hole, and it is not to scale. It shows no pitch and no number.
            </p>
            <ul style={{ margin: '0 0 0.75rem', paddingLeft: '1.25rem' }}>
              <li>
                <strong>The two panels.</strong> Panel 1 is a comparison, a struck bell, which is something you can hear in your mind. Panel 2 is a black hole just after a merger. The
                bell is there only to explain the idea of ringing.
              </li>
              <li>
                <strong>The amber bell</strong> in panel 1 is the bell. <strong>The blue curved lines</strong> coming out of it are sound spreading out. The more lines, the stronger the
                sound, but the lines are only a sketch.
              </li>
              <li>
                <strong>The dark shape with a wobbly red outline</strong> in panel 2 is the new black hole, shaken. The outline is dashed because there is nothing solid there: it is a
                boundary in space. The wobble stands for the shaking. <strong>The blue curved lines</strong> coming out of it are gravitational waves.
              </li>
              <li>
                <strong>The grey words</strong> under each picture say what sets the pitch: a bell’s size and shape, and a black hole’s mass and spin.
              </li>
            </ul>
            <p style={paragraph}>
              <strong>A worked moment, with a glass.</strong> Tap a small wine glass and it gives a high “ting”. Tap a large mixing bowl made of the same glass and the note is lower. The
              bowl is bigger, so it is slower to shake, and a slower shake is a lower note. In this experiment you will see how a black hole’s mass and its spin set its note. The real
              numbers come after the run.
            </p>
            <p style={{ marginTop: 0, marginBottom: '0.5rem' }}>
              <strong>What to look for.</strong>
            </p>
            <LookForList items={lookForRinging} />
          </div>

          <p style={paragraph}>
            <strong>What GW250114 was.</strong> On {g.detected} the two LIGO detectors, in Washington and Louisiana, recorded a gravitational-wave signal that the teams named
            GW250114 (the name is the date). It came from two black holes of about {Math.round(g.massesSolar[0])} and {Math.round(g.massesSolar[1])} times the mass of the Sun, which
            spiralled together and merged about {g.distanceBillionLightYears} billion light-years away, into one black hole of about {g.finalMassSolar} times the mass of the Sun. It was the
            clearest signal recorded so far: its signal-to-noise ratio was about {g.signalToNoise}, which is {low} to {high} times higher than the previous best. That clarity is what lets the
            teams study the ringing after the merger.
          </p>

          <p style={paragraph}>
            <strong>Tones, and a stretch.</strong> The ringing of a black hole is made of more than one <strong>tone</strong>, as the sound of a bell is made of more than one note. The <strong>main
            tone</strong> is the loudest and lasts longest, and a <strong>second tone</strong> is fainter and fades faster. Most of this experiment is about the main tone. There is also a <strong>stretch</strong>.
            On a long journey across the expanding universe a signal is stretched: every swing takes a little longer, so the pitch is a little lower than the black hole’s own. The stretch is a factor of 1 + z,
            where z is the <strong>redshift</strong>, a number you met in Cosmology Experiment 1. You will see the pitch both ways: as the black hole gave it out, and as the detectors recorded it.
          </p>

          <p style={paragraph}>
            <strong>Where the question stands (October 2026).</strong> The result comes from one event, so it is strong evidence, and not yet something settled by many. It is clearest for the
            main tone of the ringing. A second tone, which fades faster, is weaker evidence: how strong it is depends on how the data are analysed. What was tested is a prediction of
            general relativity, the theory of gravity from the Gravity and Curved Spacetime chapter. It is not a new law of nature. What the numbers add up to is shown after the run, with
            each number’s source.
          </p>

          <div style={{ marginBottom: '0.75rem' }}>
            <p style={{ marginTop: 0, marginBottom: '0.5rem' }}>
              <strong>Some new words.</strong> The “Words and formulas” box below has each one, with a few from earlier experiments.
            </p>
            <ul style={{ margin: 0, paddingLeft: '1.25rem' }}>
              <li>
                <strong>Ringing</strong>, <strong>pitch</strong> and <strong>fade time</strong>: the shaking of a new black hole, how high its note is, and how long it takes to die away.
              </li>
              <li>
                <strong>Hertz (Hz)</strong>: the unit of pitch, swings a second.
              </li>
              <li>
                <strong>No-hair idea</strong>: that a settled black hole is described by only its mass and its spin.
              </li>
              <li>
                <strong>Swing</strong>, <strong>tone</strong> and <strong>redshift (the stretch)</strong>: one back-and-forth of the shaking, one of the notes that make up the ringing, and the lengthening of a signal on a long journey.
              </li>
              <li>
                <strong>Black hole merger</strong>, <strong>gravitational waves</strong>, <strong>spin</strong>, <strong>give-or-take</strong>, <strong>light-year</strong> and <strong>millisecond</strong>: ideas from earlier experiments, or short units.
              </li>
              <li>
                <strong>Signal-to-noise ratio</strong> and <strong>solar mass</strong>: how clearly a signal stands out, and the unit for star and black hole weights.
              </li>
            </ul>
          </div>

          <p style={paragraph}>
            <strong>What you will do.</strong> You will make two predictions, press Run to watch the pictures build up one stage at a time, and then try other values in a part of its
            own. Nothing here is graded. Your predictions are your own guesses, made before you see anything. They never change the real pictures or the tables, which come from the
            physics and the published numbers. Your guesses are drawn on top of the real picture, in white, so you can compare each guess with the real result. They are shown again
            beside the results too. The page has four parts: first you predict and watch the pictures; then, in “Now try it yourself”, you can choose the mass and the spin of a black
            hole and watch a drawing of your own follow your choices; then come the results; and last a tutor asks you some questions. The real pictures and the results tables never
            change. Your white guess marks appear on the real picture, and only the drawing in “Now try it yourself” follows your choices.
          </p>

          <p style={paragraph}>
            <strong>What we assume.</strong> This experiment uses a published formula for the pitch and the fade time of a black hole’s main ringing tone, given its mass and spin. The formula
            is not derived here, and it is good to a few percent. The experiment does not simulate the merger and it does not fit a signal. The answers to the predictions you will
            make are not given here.
          </p>

          <p style={{ marginTop: 0, marginBottom: '0.75rem' }}>
            <strong>Want to know more?</strong> Plainer-language pages are listed here. Links open in a new tab. This page was written as of October 2026. The paper behind the measured
            numbers is listed after the run, so that it does not give away the predictions.
          </p>
          <ul style={{ margin: '0.25rem 0 0', paddingLeft: '1.25rem' }}>
            <li>
              <ExternalLink href="https://science.nasa.gov/universe/black-holes/">NASA: Black holes</ExternalLink>: what a black hole is, the event horizon, and how scientists detect
              black holes, including by gravitational waves.
            </li>
            <li>
              <ExternalLink href="https://spaceplace.nasa.gov/gravitational-waves/en/">NASA Space Place: What is a gravitational wave?</ExternalLink> What a gravitational wave is, as
              a ripple in space, and how LIGO first detected one in 2015.
            </li>
          </ul>
        </div>

        <ReferencePanel entries={referenceEntries()} />

        {/* The two predictions: draft wording for the owner's review (CLAUDE.md §28.1), from the specification's "Prediction Activity". Neither says which answer is right. */}
        <div style={{ marginTop: '2.5rem', paddingTop: '1.5rem', borderTop: '6px solid #d97706' }}>
          <h3 style={{ margin: '0 0 0.5rem', color: '#d97706' }}>Part 1: Predict, then watch</h3>
          <p style={{ ...paragraph, fontSize: '0.875rem', color: 'var(--text-muted)' }}>
            <strong>What we are about to do.</strong> This part is the experiment itself. You make your two predictions and press Run. The pictures that the run will draw show fixed
            things: the measured ringing of one merger, and a calculation of how a black hole’s ringing depends on its mass and spin. They are the same for everyone. When they are
            drawn, your guesses appear on them in white, so you can see how each guess compares with the real result. The real pictures stay the same whatever you guess.
          </p>
          {(
            [
              {
                title: 'Prediction 1: would a faster spin change the pitch?',
                text: (
                  <>
                    The black hole made by the merger spun at a certain speed. Imagine another black hole of the same mass that spun faster. Its ringing would have a pitch too: how
                    high or low its note is. Compared with the first one, would the pitch of the faster-spinning black hole be lower, about the same, or higher?
                  </>
                ),
                choices: PITCH_CHOICES.map((value) => ({ value, label: PITCH_LABELS[value] })),
                value: pitchGuess,
                set: (v: string) => setPitchGuess(v as PitchChoice),
              },
              {
                title: 'Prediction 2: how many swings before the ringing fades?',
                text: (
                  <>
                    The ringing of the new black hole fades away, as a bell’s note does. One <strong>swing</strong> is one full back-and-forth of the shaking: a note of 100 hertz makes
                    100 swings in one second. Count the swings from the start of the ringing until it has faded to about a third of its first size. About how many swings do you think
                    that takes? For example, “about 3 swings” means that after three full swings the ringing has dropped to about a third. This is a separate guess from Prediction 1, so
                    your two answers do not have to agree with each other.
                  </>
                ),
                choices: SWINGS_CHOICES.map((value) => ({ value: String(value), label: SWINGS_LABELS[value] })),
                value: swingsGuess === null ? null : String(swingsGuess),
                set: (v: string) => setSwingsGuess(Number(v) as SwingsChoice),
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
                {done ? 'Picture 1 is drawn. Your predictions are recorded and not marked here. The other pictures are not built yet (a later step).' : STAGE_LINES[stage]}
              </span>
            )}
          </p>

          {stage >= 1 && (
            <div>
              <PictureOne stage={stage} swingsGuess={swingsGuess} />
              <CaptionBlock
                title="Picture 1"
                intro={`It shows the ringing of the black hole that the merger GW250114 made, in three panels that appear one at a time. Panel A draws the note as a fading wave, panel B counts how many swings it makes while it fades, and panel C sets the pitch and the fade time that the calculation gives beside what the detectors measured.`}
                bullets={[
                  <><strong>The blue wavy line</strong> in panel A is the ringing, as the detectors would record it. Up and down is how strong the ripple is at that moment, and left to right is time, in milliseconds (ms): one millisecond is a thousandth of a second. It is a calculation, drawn as the simplest fading wave. It is not the recorded signal.</>,
                  <><strong>The bracket “one swing”</strong> marks one full back-and-forth of the wave, from one crest to the next. It lasts {one(pic.periodMs)} ms, so the note swings about {Math.round(pic.frequencyHz)} times a second. That is its pitch, {Math.round(pic.frequencyHz)} hertz (Hz).</>,
                  ...(stage >= 2 ? [
                    <><strong>The amber dashed curves</strong> follow the size the ringing has fallen to. <strong>The dotted vertical line</strong> marks the fade time, {one(pic.dampingTimeMs)} ms: by then the ringing has fallen to about a third of its first size (exactly 1/e, which is 0.37).</>,
                    <><strong>The green bar</strong> in panel B is the calculated number of swings in one fade time. <strong>The white bar and the box “YOUR GUESS”</strong> show the number of swings you chose in Prediction 2. The white mark is only your guess, drawn so that you can compare it with the real bar. The scale is stretched so that the smallest and the largest guess both fit: each tick is one of the answers you could choose, and each step to the right is a multiple, not an equal amount.</>,
                  ] : []),
                  ...(stage >= 3 ? [
                    <><strong>In panel C, the blue triangle</strong> is the calculated value. <strong>The green dot</strong> is the value the detectors measured, and <strong>the green line</strong> through it is its give-or-take: the range in which the teams say the true value lies, with a 90 percent chance (9 chances in 10). The pitch and the fade time each have their own scale, in Hz and in ms.</>,
                  ] : []),
                ]}
                worked={
                  stage < 2 ? (
                    <>A note of {Math.round(pic.frequencyHz)} Hz makes {Math.round(pic.frequencyHz)} swings in one second, so one swing takes 1 ÷ {Math.round(pic.frequencyHz)} = {(1 / Math.round(pic.frequencyHz)).toFixed(4)} seconds, which is {one(pic.periodMs)} ms. The time scale of panel A runs to {pic.axisMaxMs} ms, about {Math.round(pic.axisMaxMs / pic.periodMs)} swings.</>
                  ) : (
                    <>One swing takes {one(pic.periodMs)} ms and the fade time is {one(pic.dampingTimeMs)} ms. So the ringing makes {one(pic.dampingTimeMs)} ÷ {one(pic.periodMs)} = about {one(swingsPic.realSwings)} swings while it falls to a third of its size. (To make a sum with round numbers: a note with a swing of 4 ms and a fade time of 12 ms would make 12 ÷ 4 = 3 swings.)</>
                  )
                }
                lookFor={[
                  { look: 'the blue wavy line and the bracket “one swing”.', means: `the ringing is a note of about ${Math.round(pic.frequencyHz)} Hz, one swing every ${one(pic.periodMs)} ms, which is a pitch the detectors can record.`, matters: 'the pitch (and, next, the fade time) are the numbers that can be measured and then compared with what the black hole’s mass and spin should give.' },
                  ...(stage >= 2 ? [
                    { look: 'the amber dashed curves and the dotted line at the fade time.', means: `the ringing has fallen to about a third of its size after ${one(pic.dampingTimeMs)} ms, which is only about ${one(swingsPic.realSwings)} swing.`, matters: 'a black hole’s note dies away almost at once, so only a very short stretch of it can be recorded. That is why so clear a signal was needed to measure it.' },
                    { look: guessBar ? 'the green bar and the white bar in panel B.' : 'the green bar in panel B.', means: guessBar ? `the green bar is the calculated number of swings, about ${one(swingsPic.realSwings)}. The white bar is the ${swingsGuess} swings you chose. It is only your guess, so it shows no verdict.` : `the green bar is the calculated number of swings, about ${one(swingsPic.realSwings)}.`, matters: 'this is Prediction 2 laid beside the real result, so that you can see how far apart they are. The tutor goes through it with you later.' },
                  ] : []),
                  ...(stage >= 3 ? [
                    { look: 'in each row of panel C, the blue triangle and the green dot with its line.', means: `for the pitch the calculation gives ${rows[0].calculated.toFixed(1)} Hz and the detectors measured ${rows[0].measured.toFixed(1)} Hz (${rows[0].low.toFixed(1)} to ${rows[0].high.toFixed(1)}); for the fade time it gives ${rows[1].calculated.toFixed(2)} ms and they measured ${rows[1].measured.toFixed(2)} ms (${rows[1].low.toFixed(2)} to ${rows[1].high.toFixed(2)}). Each calculated value lies inside the measured range.`, matters: 'the calculation used the black hole’s mass and spin, which were found from the earlier part of the signal, as the two black holes circled. The ringing then gives a second, separate measurement of the same two numbers. That is the test.' },
                  ] : []),
                ]}
                whereFrom={<><strong>Measured:</strong>{stage >= 3 ? <> the pitch ({rows[0].measured.toFixed(1)} Hz) and the fade time ({rows[1].measured.toFixed(2)} ms) of the main tone, by the LIGO, Virgo and KAGRA teams. This page’s numbers come from a partial read of their paper, so each should be checked against it.</> : <> nothing is measured yet in the stages shown so far.</>} <strong>Calculated here:</strong> the wave and its fade, from a published formula (good to a few percent) for the mass and spin of the black hole that the merger made ({GW250114_RINGDOWN.finalMassSolar} Suns, spin {GW250114_RINGDOWN.finalSpin}, as in Experiment 18), turned into what the detectors record with the stretch of the redshift ({GW250114_RINGDOWN.redshift}){stage >= 2 ? <>, and the number of swings ({one(pic.dampingTimeMs)} ÷ {one(pic.periodMs)} = {one(swingsPic.realSwings)})</> : null}. <strong>Imagined for the question:</strong> nothing. The white bar is your guess.</>}
              />
            </div>
          )}

          {stage >= 4 && (
            <div>
              <PictureTwo pitchGuess={pitchGuess} />
              <CaptionBlock
                title="Picture 2"
                intro={`It shows how the pitch of a black hole’s ringing depends on how fast it spins, for the mass that the merger GW250114 made (${spinPic.massSolar} Suns). The spin is along the bottom, from 0 (not turning) to nearly 1 (as fast as is possible). The pitch is up the side, in hertz (Hz). This picture gives the pitch in the black hole’s own frame, so that it can be compared with other black holes in Picture 3.`}
                bullets={[
                  <><strong>The blue curve</strong> is the calculated pitch at each spin, for this one mass.</>,
                  <><strong>The green dot and its dashed line</strong> are the black hole that GW250114 made: its spin, {spinPic.real.spin}, was measured by the teams, and its pitch, {Math.round(spinPic.real.frequencyHz)} Hz, is calculated. The detectors recorded {Math.round(spinPic.detectedRealHz)} Hz (Picture 1), because the redshift stretches the signal on its way to us; the drawing here is before that stretch.</>,
                  <><strong>The pink dot</strong> is imagined for the question: a black hole of the same mass, spinning at {spinPic.faster.spin}. No such black hole was recorded. Its pitch, {Math.round(spinPic.faster.frequencyHz)} Hz, is calculated with the same formula.</>,
                  <><strong>The white arrow and the box “YOUR GUESS”</strong> are your answer to Prediction 1. A guess about “lower, the same or higher” has no size of its own, so the arrow is only a marker: it starts at the green dot’s pitch, sits above the spin {FASTER_SPIN}, and points down for lower, is flat for the same, and points up for higher. Its length means nothing.</>,
                ]}
                worked={<>The formula needs only the mass and the spin. For {spinPic.massSolar} Suns, the time unit GM/c³ is {(lightCrossingTimeS(spinPic.massSolar) * 1000).toFixed(2)} ms. At spin {spinPic.real.spin} the formula gives 2π × pitch × that time = {dimensionlessPitch(spinPic.real.spin).toFixed(3)}, so the pitch is {dimensionlessPitch(spinPic.real.spin).toFixed(3)} ÷ (2π × {(lightCrossingTimeS(spinPic.massSolar)).toFixed(6)} s) = {Math.round(spinPic.real.frequencyHz)} Hz. At spin {spinPic.faster.spin} it is {dimensionlessPitch(spinPic.faster.spin).toFixed(3)} ÷ (2π × {(lightCrossingTimeS(spinPic.massSolar)).toFixed(6)} s) = {Math.round(spinPic.faster.frequencyHz)} Hz.</>}
                lookFor={[
                  { look: 'the blue curve.', means: `the calculated pitch is ${Math.round(spinPic.curve[0].frequencyHz)} Hz for a black hole that does not turn and ${Math.round(spinPic.curve[spinPic.curve.length - 1].frequencyHz)} Hz at spin ${spinPic.curve[spinPic.curve.length - 1].spin}, with the same mass.`, matters: 'the pitch depends on the spin as well as the mass. So a measured pitch is a number that can be compared with what the black hole’s mass and spin, found in another way, should give.' },
                  { look: 'the green dot and the pink dot.', means: `the black hole GW250114 made has a calculated pitch of ${Math.round(spinPic.real.frequencyHz)} Hz. The imagined one, spinning at ${spinPic.faster.spin}, has ${Math.round(spinPic.faster.frequencyHz)} Hz.`, matters: 'the pink dot is the calculated answer to the question that Prediction 1 asks. It is not an observation.' },
                  ...(pitchGuess ? [{ look: 'the white arrow, and the pink dot beside it.', means: `the arrow shows the direction you chose, ${PITCH_PHRASE[pitchGuess]}, from the green dot’s level. The pink dot shows where the calculation puts the faster-spinning black hole. The arrow shows no verdict.`, matters: 'you can see your guess and the calculated result side by side. The tutor goes through Prediction 1 with you later.' }] : []),
                ]}
                whereFrom={<><strong>Measured:</strong> the spin of the black hole GW250114 made ({spinPic.real.spin}) and its mass ({spinPic.massSolar} Suns), by the LIGO, Virgo and KAGRA teams. This page’s numbers come from summaries of their paper, not from the paper itself, so each should be checked against it. <strong>Calculated here:</strong> the blue curve and both pitches ({Math.round(spinPic.real.frequencyHz)} and {Math.round(spinPic.faster.frequencyHz)} Hz), from a published formula that is good to a few percent. <strong>Imagined for the question:</strong> the black hole of the same mass spinning at {spinPic.faster.spin} (the pink dot). The white arrow is your guess.</>}
              />
            </div>
          )}

          {stage >= 5 && (
            <div>
              <PictureThree />
              <CaptionBlock
                title="Picture 3"
                intro={`It shows how the pitch of a black hole’s ringing depends on its mass, for black holes that spin as fast as the one GW250114 made (${massPic.spin}). The mass is along the bottom, in Suns, and the pitch is up the side, in hertz. Both scales go up in steps of ten (10, 100, 1,000 and so on), so that a black hole of 10 Suns and one of millions of Suns fit in one picture. Like Picture 2, it gives the pitch in each black hole’s own frame.`}
                bullets={[
                  <><strong>The blue line</strong> is the calculated pitch at each mass. It runs from the top left to the bottom right: the heavier the black hole, the lower the pitch.</>,
                  <><strong>The green dot</strong> is the black hole that GW250114 made ({massPic.points[2].massSolar} Suns).</>,
                  <><strong>The pink dots</strong> are imagined for the question: black holes of other masses that ring like it. None of them was recorded. The labels give the mass and the calculated pitch. One of them is a black hole as heavy as the one at the centre of our galaxy, Sagittarius A* ({massPic.points[4].massSolar.toExponential(1).replace('e+6', ' million').replace('4.3', '4.3')} Suns, the mass used in Black Holes Experiment 1).</>,
                ]}
                worked={<>Multiply the pitch by the mass, in Suns, at any point and you get the same number: {Math.round(massPic.points[2].frequencyHz)} × {massPic.points[2].massSolar} = about {Math.round(massPic.points[2].frequencyHz * massPic.points[2].massSolar).toLocaleString('en-US')}. So for a black hole of 10 Suns the pitch is {Math.round(massPic.points[2].frequencyHz * massPic.points[2].massSolar).toLocaleString('en-US')} ÷ 10 = about {Math.round(massPic.points[0].frequencyHz).toLocaleString('en-US')} Hz, and for 100 Suns it is {Math.round(massPic.points[2].frequencyHz * massPic.points[2].massSolar).toLocaleString('en-US')} ÷ 100 = about {Math.round(massPic.points[3].frequencyHz)} Hz.</>}
                lookFor={[
                  { look: 'the blue line falling from left to right.', means: `a black hole that is ten times heavier rings ten times lower: ${Math.round(massPic.points[0].frequencyHz).toLocaleString('en-US')} Hz at 10 Suns, ${Math.round(massPic.points[3].frequencyHz)} Hz at 100 Suns.`, matters: 'the mass sets the scale of the pitch, as the size of a bell does, and the spin sets how much it is shifted from that (Picture 2).' },
                  { look: 'the pink dot for Sagittarius A*, at the bottom right.', means: `a black hole of ${massPic.points[4].massSolar.toExponential(1).replace('e+6', ' million')} Suns would ring at only ${fmtHz(massPic.points[4].frequencyHz)} Hz, one swing every ${(massPic.points[4].periodSeconds / 60).toFixed(0)} minutes.`, matters: 'black holes of every size ring, and a black hole’s mass and spin could be read from how it rings. This is a calculation: no such ringing has been recorded.' },
                ]}
                whereFrom={<><strong>Measured:</strong> the mass of the black hole GW250114 made ({massPic.points[2].massSolar} Suns, from summaries of the teams’ paper) and the mass of Sagittarius A* (taken from Black Holes Experiment 1). <strong>Calculated here:</strong> every pitch, from the same formula as Picture 2. <strong>Imagined for the question:</strong> the black holes of 10, 30 and 100 Suns and of Sagittarius A* ringing like GW250114’s black hole, with spin {massPic.spin} (the pink dots). No guess is drawn on this picture.</>}
              />
            </div>
          )}
        </div>

        {done && (
          <div style={{ marginTop: '2.5rem', paddingTop: '1.5rem', borderTop: `6px solid ${PART_TWO_COLOR}` }}>
            <h3 style={{ margin: '0 0 0.5rem', color: PART_TWO_COLOR }}>Part 2: Now try it yourself</h3>
            <p style={{ ...paragraph, fontSize: '0.875rem', color: 'var(--text-muted)' }}>
              <strong>What we are about to do.</strong> The black hole that GW250114 made had one mass and one spin. Here you can choose other masses and other spins, and watch one
              drawing show how such a black hole would ring, beside the real one. The real pictures above do not change, and your two guesses do not change this drawing: only the two
              settings below do.
            </p>
            <p style={{ ...paragraph, fontSize: '0.875rem', color: 'var(--text-muted)' }}>
              <strong>These are your own trial values, not real measurements.</strong> Each button is a number to try. For example, if you choose {massPic.points[0].massSolar} Suns at a
              spin of {spinChoice}, the formula gives a pitch of {Math.round(mineLight.frequencyHz).toLocaleString('en-US')} Hz. No such black hole was recorded ringing: the drawing is
              imagined for the question, and it is drawn in pink-purple.
            </p>

            {(
              [
                {
                  title: 'How heavy is the black hole? (in Suns, the mass of the Sun)',
                  choices: MASS_CHOICES_SOLAR.map((v) => ({ value: v, label: MASS_TRIAL_LABELS[v] })),
                  value: massChoice,
                  set: setMassChoice,
                },
                {
                  title: 'How fast does it spin? (0 means not spinning; the highest possible is just under 1)',
                  choices: SPIN_CHOICES.map((v) => ({ value: v, label: v === GW250114_RINGDOWN.finalSpin ? `${v} (GW250114’s)` : `${v}` })),
                  value: spinChoice,
                  set: setSpinChoice,
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

            <TrialDrawing trial={mine} />
            <CaptionBlock
              title="Drawing A"
              intro={`It shows how a black hole with your two trial values would ring, beside the real one. The top half is its pitch, and the bottom half is its ringing counted in swings. It is imagined for the question, not recorded, and it uses the same formula as Pictures 2 and 3.`}
              bullets={[
                <><strong>The green tick</strong> in the top half is the pitch of the black hole GW250114 made, {Math.round(GW250114_PITCH_HZ)} Hz, the same as the green dot in Picture 2. <strong>The pink dot</strong> is the pitch of your trial. It moves along when you change a setting. Both scales go up in steps of ten, as in Picture 3.</>,
                <><strong>The pink wave</strong> in the bottom half is your trial’s ringing, counted in swings and not in seconds, so that a black hole of 10 Suns and one of millions of Suns can be drawn in the same way. <strong>The pink dotted curve</strong> follows the size it has fallen to. <strong>The green dashed curves</strong> are the same for GW250114’s black hole.</>,
                <><strong>The pink-purple words</strong> at the bottom give your trial’s pitch, the time of one swing, the fade time, the number of swings to fade, and the pitch as a multiple of GW250114’s black hole’s. Pink-purple always means “imagined for the question”, and white is kept for your guesses.</>,
              ]}
              worked={<>Your trial is {MASS_TRIAL_LABELS[mine.massSolar] ?? `${mine.massSolar} Suns`} at spin {mine.spin}. Its pitch is {fmtHz(mine.frequencyHz)} Hz, so one swing takes 1 ÷ {fmtHz(mine.frequencyHz)} = {formatTime(mine.periodSeconds)}. It fades to a third in {formatTime(mine.dampingTimeMs / 1000)}, which is {formatTime(mine.dampingTimeMs / 1000)} ÷ {formatTime(mine.periodSeconds)} = {mine.swingsToFade.toFixed(1)} swings. Compared with GW250114’s black hole, the pitch is {fmtHz(mine.frequencyHz)} ÷ {Math.round(GW250114_PITCH_HZ)} = {mine.pitchOverReal.toFixed(2)} times.</>}
              lookFor={[
                { look: 'the pink dot against the green tick.', means: `your trial’s pitch is ${mine.pitchOverReal.toFixed(2)} times the pitch of the black hole GW250114 made. When you choose its mass and its spin, the two coincide.`, matters: 'a change of mass moves the dot a long way along the scale, and a change of spin moves it a little. That is how the mass sets the pitch and the spin adjusts it (Pictures 2 and 3).' },
                { look: 'the pink wave against the green dashed curves.', means: `your trial’s ringing falls to a third of its size after ${mine.swingsToFade.toFixed(1)} swings, and GW250114’s black hole after ${trialRinging(GW250114_RINGDOWN.finalMassSolar, GW250114_RINGDOWN.finalSpin).swingsToFade.toFixed(1)}.`, matters: 'the number of swings depends on the spin and not on the mass: change the mass and the wave does not change, change the spin and it does.' },
                { look: 'the pink-purple words at the bottom.', means: `for your settings one swing takes ${formatTime(mine.periodSeconds)} and the ringing fades in ${formatTime(mine.dampingTimeMs / 1000)}.`, matters: 'the mass sets the time scale: at tens of Suns the ringing is over in thousandths of a second, and at millions of Suns a single swing takes minutes.' },
              ]}
              whereFrom={<><strong>Real:</strong> the green tick and the green dashed curves are the black hole that GW250114 made (calculated here, from a mass and a spin that the teams measured; this page’s numbers come from summaries of their paper). <strong>Imagined for the question:</strong> everything in pink-purple: the black hole of the mass and spin you chose, and its pitch, times and swings, all calculated here from the published formula (good to a few percent). Nothing in this drawing was measured.</>}
            />
          </div>
        )}

        {done && (
          <div style={{ marginTop: '2.5rem', paddingTop: '1.5rem', borderTop: `6px solid ${PART_THREE_COLOR}` }}>
            <h3 style={{ margin: '0 0 0.5rem', color: PART_THREE_COLOR }}>Part 3: The results</h3>
            <p style={{ ...paragraph, fontSize: '0.875rem', color: 'var(--text-muted)' }}>
              <strong>What we are about to do.</strong> Here are the numbers behind the pictures, set out in tables, with a short guide to reading each one. These tables are the real
              numbers, so they never change with your guesses or with your settings in Part 2.
            </p>

            <div className="exp-card" style={{ padding: '1rem', marginBottom: '1.5rem', fontSize: '0.875rem' }}>
              <strong>Where this stands (as of October 2026).</strong>
              <ul style={{ margin: '0.5rem 0 0', paddingLeft: '1.25rem' }}>
                <li>
                  <strong>Strong evidence</strong> (from one very clear event) that the main tone of the ringing of the black hole that GW250114 made is what its mass and spin say it
                  should be. The teams report that the pitch matches to within a few percent. The pattern of the main tone and the second, faster-fading tone together matches to tens of percent.
                </li>
                <li>
                  The <strong>second tone is weaker evidence</strong>. One 2026 analysis puts how sure we can be that it is there at {SECOND_TONE_SIGNIFICANCE.earlierPercent} percent with an earlier method and {SECOND_TONE_SIGNIFICANCE.laterPercent} percent with
                  a newer one, so it depends on how the data are analysed. This page does not calculate it.
                </li>
                <li>
                  What was tested is <strong>a prediction of general relativity</strong>, that a settled black hole has no features beyond its mass and spin. It is not a new law of nature.
                </li>
              </ul>
            </div>

            <div style={{ marginBottom: '1.5rem', fontSize: '0.875rem' }}>
              <strong>Your predictions, beside the results.</strong> These are your guesses, shown again so that you can find the real number for each. They are not marked here.
              <ul style={{ margin: '0.5rem 0 0', paddingLeft: '1.25rem' }}>
                <li>
                  <strong>Prediction 1</strong> (would a faster spin change the pitch?): you guessed <strong>{pitchGuess ? `${PITCH_PHRASE[pitchGuess]}` : '…'}</strong>. The real numbers are in Table 2, in the
                  rows for spin {GW250114_RINGDOWN.finalSpin} and spin {FASTER_SPIN}.
                </li>
                <li>
                  <strong>Prediction 2</strong> (how many swings before the ringing fades?): you guessed <strong>{swingsGuess !== null ? `about ${swingsGuess} ${swingsGuess === 1 ? 'swing' : 'swings'}` : '…'}</strong>. The real
                  number is in Table 1, in the row “Swings in one fade time”.
                </li>
              </ul>
            </div>

            <p style={paragraph}>
              <strong>How to read these results.</strong> A table of numbers is like a blood test: it means little until someone says what each number is and what it is compared
              with. So each table has a note under it, called “What this table tells us”, that says what the numbers are, what they mean here, why they matter, and how sure we can be of
              them. The first table is a check-up: it sets each number beside something to compare it with, and says in plain words what the comparison shows. It does not say “good” or
              “bad”, because none of these numbers has an accepted range.
            </p>

            <p style={{ marginTop: '1.5rem', marginBottom: '0.5rem', fontWeight: 'bold' }}>Table 1. Check-up: what the formula expects, and what the detectors found</p>
            <ResultsTable
              minWidth={600}
              head={['What we compare', 'What the formula expects', 'What the detectors found', 'How to read it']}
              rows={[
                [
                  'Pitch of the main tone',
                  `${cu.pitch.calculated.toFixed(1)} Hz`,
                  `${cu.pitch.measured.toFixed(1)} Hz (give-or-take: ${cu.pitch.low!.toFixed(1)} to ${cu.pitch.high!.toFixed(1)})`,
                  `Close. The expected value is inside the give-or-take, and the measured value is ${pct(cu.pitch.percent)} it.`,
                ],
                [
                  'Fade time of the main tone',
                  `${cu.fadeTime.calculated.toFixed(2)} ms`,
                  `${cu.fadeTime.measured.toFixed(2)} ms (give-or-take: ${cu.fadeTime.low!.toFixed(2)} to ${cu.fadeTime.high!.toFixed(2)})`,
                  `Close. The expected value is inside the give-or-take, and the measured value is ${pct(cu.fadeTime.percent)} it.`,
                ],
                [
                  `Swings in one fade time${swingsGuess !== null ? ` (your Prediction 2 guess: about ${swingsGuess})` : ''}`,
                  `${cu.swings.calculated.toFixed(2)}`,
                  `${cu.swings.measured.toFixed(2)}, made from the two measured numbers (${cu.fadeTime.measured.toFixed(2)} ms × ${cu.pitch.measured.toFixed(1)} Hz)`,
                  `About the same: the two differ by ${Math.abs(cu.swings.percent).toFixed(1)} percent. This row has no give-or-take of its own.`,
                ],
              ]}
            />
            <NoteList
              items={[
                {
                  name: 'The pitch and fade time rows',
                  what: `the pitch and fade time that the published formula gives for the mass and spin the teams found for the black hole after the merger (${GW250114_RINGDOWN.finalMassSolar} Suns, spin ${GW250114_RINGDOWN.finalSpin}), turned into what the detectors record with the redshift stretch (divide the pitch by ${cu.redshiftStretch.toFixed(2)} and multiply the time by it), set beside what the detectors measured of the ringing.`,
                  means: `the formula expects ${cu.pitch.calculated.toFixed(1)} Hz and ${cu.fadeTime.calculated.toFixed(2)} ms. The detectors measured ${cu.pitch.measured.toFixed(1)} Hz and ${cu.fadeTime.measured.toFixed(2)} ms. Each expected value lies inside the measured give-or-take. The measured pitch is ${pct(cu.pitch.percent)} the expected one, and the fade time ${pct(cu.fadeTime.percent)}.`,
                  matters: 'general relativity says the ringing depends only on the black hole’s mass and spin. The mass and spin used here were found from a different part of the signal, so this comparison could have failed. For the main tone it did not.',
                  sure: `the measured give-or-take is about ${((cu.pitch.high! - cu.pitch.low!) / 2 / cu.pitch.measured * 100).toFixed(0)} percent for the pitch and about ${((cu.fadeTime.high! - cu.fadeTime.low!) / 2 / cu.fadeTime.measured * 100).toFixed(0)} percent for the fade time. The formula is itself good only to a few percent, so agreement to ${Math.abs(cu.pitch.percent).toFixed(0)} percent does not mean the formula is that exact. The mass and spin carry give-or-takes of their own that this page does not combine. It is one event.`,
                },
                {
                  name: 'The swings row',
                  what: 'how many swings fit into one fade time. The expected number is the fade time divided by the time of one swing. The found number is made from the two measured numbers: the measured fade time times the measured pitch.',
                  means: `the ringing falls to a third of its size in about ${cu.swings.calculated.toFixed(1)} swing, by the formula and from the measurement.`,
                  matters: 'it shows how dull a black hole’s “bell” is. A struck bell rings for very many swings, and this ringing is nearly gone after one. That is why a very clear signal was needed to hear it at all.',
                  sure: 'the two numbers that make the found value each carry a give-or-take, but this page does not combine them, so this row has none. The comparison with a bell is a general one, not a measurement.',
                },
                {
                  name: 'The second tone',
                  what: 'the teams found that at least two tones are needed to describe the ringing. The second is a faster-fading tone of the same kind. It is not in the table, because this page does not calculate it.',
                  means: `the teams report that the second tone, taken with the main one, matches what the mass and spin give to tens of percent. That is a much looser match than the few percent of the main tone. One 2026 analysis puts the chance that the second tone is real at ${SECOND_TONE_SIGNIFICANCE.earlierPercent} percent with an earlier method and ${SECOND_TONE_SIGNIFICANCE.laterPercent} percent with a newer one.`,
                  matters: 'a second tone gives a second, independent test of the same two numbers. It is not yet as strong as the first.',
                  sure: 'weaker than the main tone, and dependent on how the data are analysed. The percentages are from the abstract of a 2026 paper (arXiv:2605.03576); this page has not read the paper itself.',
                },
              ]}
            />

            <p style={{ marginTop: '1.5rem', marginBottom: '0.5rem', fontWeight: 'bold' }}>Table 2. How the ringing depends on the spin (calculated, for {GW250114_RINGDOWN.finalMassSolar} Suns, in the black hole’s own frame)</p>
            <ResultsTable
              minWidth={560}
              head={['Spin', 'Pitch', 'Swings in one fade time', `Pitch compared with spin ${GW250114_RINGDOWN.finalSpin}`]}
              rows={spinRows.map((r) => [
                `${r.spin}${r.spin === GW250114_RINGDOWN.finalSpin ? ' (GW250114’s black hole)' : ''}${r.spin === FASTER_SPIN && pitchGuess ? ` (the faster spin of Prediction 1; your guess: ${PITCH_PHRASE[pitchGuess]})` : r.spin === FASTER_SPIN ? ' (the faster spin of Prediction 1)' : ''}`,
                `${fmtHz(r.frequencyHz)} Hz`,
                r.swingsToFade.toFixed(2),
                r.spin === GW250114_RINGDOWN.finalSpin ? 'the same (1.00 times)' : `${r.pitchOverReal.toFixed(2)} times`,
              ])}
            />
            <NoteList
              items={[
                {
                  name: 'The spin table',
                  what: `the pitch and the number of swings that the formula gives for a black hole of the same mass, ${GW250114_RINGDOWN.finalMassSolar} Suns, at five spins. These are the numbers behind Picture 2.`,
                  means: `from a black hole that does not turn to one that spins at ${spinRows[4].spin}, the pitch goes from ${Math.round(spinRows[0].frequencyHz)} Hz to ${Math.round(spinRows[4].frequencyHz)} Hz, and the number of swings from ${spinRows[0].swingsToFade.toFixed(2)} to ${spinRows[4].swingsToFade.toFixed(1)}. At spin ${FASTER_SPIN} the pitch is ${spinRows[3].pitchOverReal.toFixed(2)} times the pitch at spin ${GW250114_RINGDOWN.finalSpin}.`,
                  matters: 'the number of swings depends on the spin alone, while the pitch depends on the mass and the spin. In principle, then, a measured pitch and a measured fade time together say what the black hole’s mass and spin are.',
                  sure: 'these are calculated from a published formula that is good to a few percent. No black hole at these other spins was recorded ringing.',
                },
              ]}
            />

            <p style={{ marginTop: '1.5rem', marginBottom: '0.5rem', fontWeight: 'bold' }}>Table 3. How the ringing depends on the mass (calculated, for spin {GW250114_RINGDOWN.finalSpin}, in the black hole’s own frame)</p>
            <ResultsTable
              minWidth={560}
              head={['Mass', 'Pitch', 'One swing', 'Fade time']}
              rows={massRows.map((r) => [
                MASS_TRIAL_LABELS[r.massSolar],
                `${fmtHz(r.frequencyHz)} Hz`,
                formatTime(r.periodSeconds),
                formatTime(r.dampingTimeMs / 1000),
              ])}
            />
            <NoteList
              items={[
                {
                  name: 'The mass table',
                  what: `the pitch, the time of one swing and the fade time that the formula gives for five masses, all at the spin of GW250114’s black hole. These are the numbers behind Picture 3 and Part 2.`,
                  means: `a black hole that is ${(massRows[2].massSolar / massRows[0].massSolar).toFixed(2)} times lighter than GW250114’s rings ${massRows[0].pitchOverReal.toFixed(2)} times higher and fades ${(massRows[2].dampingTimeMs / massRows[0].dampingTimeMs).toFixed(2)} times sooner: ${massRows[0].massSolar} Suns gives ${fmtHz(massRows[0].frequencyHz)} Hz and a fade time of ${formatTime(massRows[0].dampingTimeMs / 1000)}, against ${fmtHz(massRows[2].frequencyHz)} Hz and ${formatTime(massRows[2].dampingTimeMs / 1000)} for ${GW250114_RINGDOWN.finalMassSolar} Suns. A black hole of ${massRows[4].massSolar / 1e6} million Suns would take ${formatTime(massRows[4].periodSeconds)} for one swing.`,
                  matters: 'the mass sets the time scale of the ringing, and the spin sets its shape. That is why the same kind of test can be made on black holes of very different sizes, with instruments built for the right time scale.',
                  sure: 'calculated from a published formula, good to a few percent. Only one of these black holes, the one GW250114 made, was recorded ringing; the other four are imagined for the question.',
                },
              ]}
            />

            <div style={{ marginTop: '1.5rem', fontSize: '0.875rem' }}>
              <p style={{ marginTop: 0, marginBottom: '0.5rem' }}>
                <strong>The papers behind these numbers.</strong> They were held back until now, because they give the numbers that your predictions were about. Links open in a new tab.
              </p>
              <ul style={{ margin: 0, paddingLeft: '1.25rem' }}>
                <li>
                  <ExternalLink href="https://arxiv.org/abs/2509.08099">LIGO, Virgo and KAGRA: “Black hole spectroscopy and tests of general relativity with GW250114”</ExternalLink>: the paper that gives the
                  measured pitch and fade time of the ringing, and the tests of the second tone.
                </li>
                <li>
                  <ExternalLink href="https://arxiv.org/abs/gr-qc/0512160">Berti, Cardoso and Will: “On gravitational-wave spectroscopy of massive black holes with the space interferometer LISA”</ExternalLink>:
                  the paper that this page’s formula for the pitch and the quality factor comes from. This page did not find the formula’s coefficients in it, so they should be checked against it.
                </li>
                <li>
                  <ExternalLink href="https://arxiv.org/abs/2605.03576">“Ringdown analysis of GW250114 with orthonormal modes”</ExternalLink>: a 2026 re-analysis of the same ringing, which gives the {SECOND_TONE_SIGNIFICANCE.earlierPercent} and {SECOND_TONE_SIGNIFICANCE.laterPercent} percent
                  figures for the second tone (only its abstract was read for this page).
                </li>
              </ul>
            </div>
          </div>
        )}

        {/* Part 4, the tutor (after the results): observe, compare with the predictions, a conceptual question, then the explanation. DRAFT wording for the owner's approval. */}
        {done && pitchGuess !== null && swingsGuess !== null && (
          <div style={{ marginTop: '2.5rem', paddingTop: '1.5rem', borderTop: `6px solid ${PART_FOUR_COLOR}` }}>
            <h3 style={{ margin: '0 0 0.5rem', color: PART_FOUR_COLOR }}>Part 4: The tutor</h3>
            <p style={{ ...paragraph, fontSize: '0.875rem', color: 'var(--text-muted)' }}>
              <strong>What we are about to do.</strong> You have now seen the pictures and the tables. This last part is a short conversation with a tutor, to help you make sense of them.
            </p>
            <ul style={{ margin: '0 0 0.75rem', paddingLeft: '1.25rem', fontSize: '0.875rem', color: 'var(--text-muted)' }}>
              <li>
                <strong>Three questions, one at a time.</strong> First, the tutor asks what you see in Pictures 1 and 2. Second, it asks you to compare your own guesses (the white marks) with the real
                results. Third, it asks one bigger question, about what it would mean if a black hole’s ringing did not match its mass and spin. Type a few words for each. Nothing is graded, and a short
                answer is fine.
              </li>
              <li>
                <strong>No verdict until you have replied.</strong> The tutor will not say whether your guesses were right until you have answered all three, so you can think it through first.
              </li>
              <li>
                <strong>Then the explanation.</strong> The tutor marks each of your two predictions as matched or not matched, and then goes through what lies behind the numbers in seven short parts: what sets
                the pitch, what the spin does, why the ringing is over so soon, why the detectors saw a different pitch from the black hole’s own, what the comparison tested, how sure we are, and what was and
                was not shown. Some parts use a worked sum or an everyday comparison.
              </li>
            </ul>
            <BlackHoleRingdownTutor pitchPrediction={pitchGuess} swingsPrediction={swingsGuess} onExplained={onTutorComplete} />
          </div>
        )}
      </div>
    </div>
  )
}
