import { useEffect, useState } from 'react'
import type { ReactNode } from 'react'
import { areaChange, areaPicture, checkUp, pressAreaChange, areaSteps, ceilingHeadroomPercent, ceilingPicture, DIRECTION_CHOICES, directionMarker, guessBar, GW250114, massPicture, radiatedFraction, runHorizonAreaLaw, SHARE_CHOICES_PERCENT, SIZE_CHOICES, SPIN_CHOICES, trialMerger, trialOverRealAfter, TRIAL_AXIS_MAX_KM2 } from '../physics/horizonAreaLaw'
import type { TrialMerger } from '../physics/horizonAreaLaw'
import type { DirectionChoice, SizeChoice } from '../physics/horizonAreaLaw'
import { ReferencePanel } from './EnergyMomentumExperiment'
import { HorizonAreaLawTutor } from './HorizonAreaLawTutor'
import { LookForList, ResultsTable } from './WideBinariesExperiment'
import type { LookFor } from './WideBinariesExperiment'

// Cosmic Horizons, Experiment 18 (docs/experiments/cosmic-horizons/18-does-a-black-holes-area-ever-shrink.md).
// STEPS 2 and 3 (the interface skeleton, the introduction and the two predictions): this file has the status line, the introduction, one illustration (what the "area" of a black
// hole is) with its guide, the new-word list, the collapsed "Words and formulas" panel, the "Want to know more?" links and the two predictions (Run only records them). It has no
// run, pictures, controls, results or tutor yet; those are later steps (CLAUDE.md §6). The few published numbers the introduction states are read from src/physics/horizonAreaLaw.ts (CLAUDE.md §9). All wording is a DRAFT for the
// owner's line-by-line approval (CLAUDE.md §28.1) and is written to the standard of §29. Nothing here says which way the area went, how big the change was, or what the area
// theorem says (CLAUDE.md §12): those are the two predictions' answers. The papers and press releases that give them are listed only after the run.

const VIEW_WIDTH = 560
const TEXT_COLOR = '#e2e8f0'
const MUTED_COLOR = '#94a3b8'
const AREA_COLOR = '#fbbf24' // amber: a surface, and its area
const BLACK_HOLE_COLOR = '#f87171' // red: a black hole and its horizon

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
    <>
      {lines.map((line, i) => (
        <text key={i} x={x} y={y + i * (size + 2)} fill={fill} fontSize={size} fontWeight={bold ? 'bold' : 'normal'} textAnchor={anchor} stroke={fill === '#0b1020' ? 'none' : '#0b1020'} strokeWidth={3} paintOrder="stroke">
          {line}
        </text>
      ))}
    </>
  )
}

// A short arrow from (x1, y1) to (x2, y2), with a small head at the end.
function Arrow({ x1, y1, x2, y2, color, width = 2.5 }: { x1: number; y1: number; x2: number; y2: number; color: string; width?: number }) {
  const angle = Math.atan2(y2 - y1, x2 - x1)
  const head = 7
  const a1 = angle + Math.PI - 0.45
  const a2 = angle + Math.PI + 0.45
  return (
    <g>
      <line x1={x1} y1={y1} x2={x2} y2={y2} stroke={color} strokeWidth={width} />
      <path d={`M ${x2} ${y2} L ${x2 + head * Math.cos(a1)} ${y2 + head * Math.sin(a1)} L ${x2 + head * Math.cos(a2)} ${y2 + head * Math.sin(a2)} Z`} fill={color} />
    </g>
  )
}

// ---- Illustration: what the "area" of a black hole is (a sketch of the idea, not to scale, and not any particular black hole) ----
function AreaDrawing() {
  const height = 400
  const cy = 190
  return (
    <svg
      width={VIEW_WIDTH}
      height={height}
      viewBox={`0 0 ${VIEW_WIDTH} ${height}`}
      style={svgStyle}
      role="img"
      aria-label="Illustration, not to scale, in two panels. Panel one, a comparison: a ball, a light grey circle with a thick amber outline, labelled the ball's surface, its skin; below it the words its area is how much paint it takes to cover the skin. Panel two, a black hole: a small dark circle with a red outline at the centre, labelled inside, nothing gets back out, surrounded by a dashed amber ring labelled the horizon, the black hole's surface, with a red arrow pointing in from outside to the ring, labelled anything that crosses cannot come back out. Below it the words its area is the size of this surface, and its size is set by its mass and its spin."
    >
      <text x={20} y={22} fill={TEXT_COLOR} fontSize="13" fontWeight="bold">
        Illustration: what is the “area” of a black hole?
      </text>

      {/* Panel 1: a ball (a comparison). */}
      <SvgLines x={20} y={52} lines={['1. A comparison: a ball']} fill={TEXT_COLOR} bold size={12} />
      <circle cx={140} cy={cy} r={64} fill="#cbd5e1" stroke={AREA_COLOR} strokeWidth={6} />
      <SvgLines x={140} y={cy + 4} lines={['the ball']} fill="#0b1020" bold size={11} anchor="middle" />
      <Arrow x1={60} y1={cy - 96} x2={92} y2={cy - 52} color={AREA_COLOR} width={2} />
      <SvgLines x={20} y={cy - 108} lines={['the ball’s surface:', 'its outer skin']} fill={AREA_COLOR} bold anchor="start" />
      <SvgLines x={140} y={cy + 100} lines={['its area is how much paint', 'it takes to cover the skin']} fill={MUTED_COLOR} anchor="middle" size={11} />

      <line x1={280} y1={44} x2={280} y2={350} stroke={MUTED_COLOR} strokeWidth={1} strokeDasharray="4 4" />

      {/* Panel 2: a black hole. */}
      <SvgLines x={296} y={52} lines={['2. A black hole']} fill={TEXT_COLOR} bold size={12} />
      <circle cx={420} cy={cy} r={64} fill="#05070f" stroke={AREA_COLOR} strokeWidth={4} strokeDasharray="7 5" />
      <circle cx={420} cy={cy} r={14} fill="#05070f" stroke={BLACK_HOLE_COLOR} strokeWidth={2.5} />
      <SvgLines x={420} y={cy + 36} lines={['inside: nothing', 'gets back out']} fill={BLACK_HOLE_COLOR} anchor="middle" />
      <Arrow x1={540} y1={cy - 100} x2={470} y2={cy - 52} color={BLACK_HOLE_COLOR} width={2} />
      <SvgLines x={540} y={cy - 130} lines={['anything that crosses', 'cannot come back out']} fill={BLACK_HOLE_COLOR} bold anchor="end" />
      <SvgLines x={420} y={cy - 94} lines={['the horizon: the black', 'hole’s surface']} fill={AREA_COLOR} bold anchor="middle" />
      <SvgLines x={420} y={cy + 100} lines={['its area is the size of', 'this surface']} fill={MUTED_COLOR} anchor="middle" size={11} />

      <SvgLines x={20} y={height - 48} lines={['Its size is set by its mass and its spin (Black Holes Experiments 1 and 8).']} fill={TEXT_COLOR} />
      <SvgLines
        x={20}
        y={height - 22}
        lines={['A sketch. Not to scale, and not any particular black hole.', 'A flat circle stands for a surface that really goes all the way round.']}
        fill={MUTED_COLOR}
        size={9}
      />
    </svg>
  )
}

const lookForArea: LookFor[] = [
  {
    look: 'the thick amber outline of the ball on the left, and the dashed amber ring round the black hole on the right.',
    means: 'both are drawn in the same colour because both are a surface. A ball’s surface is its skin. A black hole’s surface is its horizon, the boundary NASA describes as “the black hole’s surface”.',
    matters: 'a surface has an area, a number we can calculate and compare. This experiment is about what happens to that one number when two black holes merge into one.',
  },
  {
    look: 'the red arrow pointing in to the dashed ring, and the red words inside it.',
    means: 'anything that crosses the horizon, even light, cannot come back out, so the horizon is the edge of the black hole. There is nothing solid there: it is a boundary in space.',
    matters: 'because the horizon is the edge, its area is a measure of the size of the black hole itself, and not of any gas or stars around it.',
  },
  {
    look: 'the line at the bottom of the picture: “Its size is set by its mass and its spin”.',
    means: 'in Black Holes Experiments 1 and 8 you saw that a black hole’s horizon depends on how heavy it is, and that spin changes it too. So to work out an area, you need to know a black hole’s mass and its spin.',
    matters: 'that is why GW250114 could be used for this test: it was clear enough for teams to measure the masses and the spins, before the merger and after it.',
  },
]

// The Words entries that quote a published figure read it from the module (CLAUDE.md §9).
function referenceEntries(): { term: string; meaning: string }[] {
  return [
    { term: 'Horizon (event horizon)', meaning: 'the boundary round a black hole. Anything that crosses it, even light, cannot come back out (Black Holes Experiment 1). NASA: “We can think of the event horizon as the black hole’s surface.”' },
    { term: 'Horizon area', meaning: 'the size of the horizon, measured as the area of a surface is measured: how much paint it would take to cover it. It is worked out from a black hole’s mass and spin, and it is given here in square kilometres.' },
    { term: 'Area of a horizon (the formula)', meaning: 'for a black hole of mass M and spin χ (chi), the area is 16π × (GM/c²)² × h. Here GM/c² is a length that is half the horizon radius of a black hole that is not spinning (Black Holes Experiment 1), π is about 3.14, and h is a “spin factor” that is 1 for no spin and gets smaller as the spin rises (Black Holes Experiment 8). You see it worked step by step in the captions.' },
    { term: 'Ceiling on the share radiated', meaning: 'the largest share of its mass that a merger could give off as gravitational waves and still leave the one horizon with at least as much area as the two had before, for a chosen spin after. It is worked out from the same formula, in Picture 3. It is arithmetic, not a measurement.' },
    { term: 'Square kilometre (km²)', meaning: 'a unit of area: the area of a square that is 1 kilometre on each side. A square 10 kilometres on each side has an area of 100 square kilometres.' },
    { term: 'Area theorem (area law)', meaning: 'a rule that Stephen Hawking proved in 1971 about the horizon areas of black holes. What it says is the subject of the predictions below, so it is not stated here.' },
    { term: 'Black hole merger', meaning: 'two black holes that have been circling each other come together and join into one black hole. A merger sends out gravitational waves (Gravitational Waves Experiments 1 to 4).' },
    { term: 'Gravitational waves', meaning: 'ripples in space itself, made when heavy objects such as black holes move fast. They carry energy away from the objects that make them. NASA: “A gravitational wave is an invisible (yet incredibly fast) ripple in space.”' },
    { term: 'Spin', meaning: 'how fast a black hole turns. In Black Holes Experiment 8 it is a number from 0 (not turning) up to just under 1 (turning as fast as is possible).' },
    { term: 'Signal-to-noise ratio', meaning: 'a number for how clearly a signal stands out from the random background noise in a detector. Think of a friend talking at a party. If their voice is only as loud as the chatter around you (a ratio of about 1), you can barely make out the words. If it is 10 times louder than the chatter (a ratio of about 10), you hear every word. The larger the ratio, the clearer the signal and the better the measurements that can be made from it. (The number reported for LIGO is a “matched-filter” ratio, which compares the detectors’ data with a model of the wave. You do not need that detail to follow this experiment.)' },
    { term: 'Solar mass', meaning: 'a unit for how heavy stars and black holes are. One solar mass is the mass of the Sun, so “10 solar masses” means 10 times as heavy as the Sun.' },
    { term: 'Give-or-take', meaning: 'the size of the uncertainty of a measurement, written “11 ± 1”. It says how far the true value could be from the measured one. (Experiment 1 of this group explains it.)' },
    { term: 'Light-year', meaning: 'the distance light travels in a year, about 9.5 million million kilometres. The merger in this experiment happened about a billion light-years away, so its waves took about a billion years to reach us.' },
  ]
}

// ---- The run: five named stages. The timer only paces the display; no number depends on it (CLAUDE.md §11). ----
const STAGE_MS = 2600
const LAST_STAGE = 5
const STAGE_NAMES = ['', 'The two black holes', 'The merger, and what left as waves', 'The area before', 'The area after', 'How much could a merger give off?']
const STAGE_LINES = [
  '',
  'Picture 1 starts with the two black holes before the merger, as two masses.',
  'Picture 1 now adds the one black hole after the merger, and the mass-energy that left as gravitational waves.',
  'Picture 2 starts with the area of the two horizons before the merger.',
  'Picture 2 now adds the area of the one horizon after the merger, and your two guesses, in white.',
  'Picture 3 asks how much a merger could give off as waves before the area after would fall below the area before.',
]

const YOURS_COLOR = '#ffffff' // white: the learner's guess
const BH1_COLOR = '#38bdf8' // sky blue: the first black hole before the merger
const BH2_COLOR = '#a78bfa' // violet: the second black hole before the merger
const AFTER_COLOR = '#fb7185' // rose: the one black hole after the merger
const WAVES_COLOR = '#facc15' // yellow: energy that left as gravitational waves
const PRESS_COLOR = '#fb923c' // orange: a figure from a press release
const FLOOR_COLOR = '#f87171' // red: the line where the area after equals the area before
const REAL_COLOR = '#34d399' // green: the real event on Picture 3

function thousands(n: number): string {
  return Math.round(n).toLocaleString('en-US')
}
function one(n: number): string {
  return n.toFixed(1)
}
function two(n: number): string {
  return n.toFixed(2)
}

// ---- Picture 1: the masses before and after ----
const P1_X0 = 40
const P1_SUNS_FULL = 70
const P1_PX_PER_SUN = 390 / P1_SUNS_FULL

function PictureOne({ stage }: { stage: number }) {
  const m = massPicture()
  const k = P1_PX_PER_SUN
  const [m1, m2] = m.massesBeforeSolar
  const height = 330
  const totalX = P1_X0 + m.totalBeforeSolar * k
  return (
    <svg
      width={VIEW_WIDTH}
      height={height}
      viewBox={`0 0 ${VIEW_WIDTH} ${height}`}
      style={svgStyle}
      role="img"
      aria-label={`Picture 1, bars of mass in Suns. Before: two black holes of ${m1} and ${m2} Suns side by side, together ${m.totalBeforeSolar}. ${
        stage >= 2 ? `After: one black hole of ${m.massAfterSolar} Suns, followed by a dashed piece of ${one(m.radiatedSolar)} Suns that left as gravitational waves.` : ''
      }`}
    >
      <text x={20} y={22} fill={TEXT_COLOR} fontSize="13" fontWeight="bold">
        Picture 1: before and after, the masses
      </text>
      <SvgLines x={20} y={42} lines={['a longer bar is a heavier black hole; the unit is the mass of the Sun, written “Suns”']} fill={MUTED_COLOR} />

      {stage >= 1 && (
        <g>
          <SvgLines x={P1_X0} y={82} lines={['BEFORE: two black holes (measured)']} fill={TEXT_COLOR} bold size={12} />
          <rect x={P1_X0} y={92} width={m1 * k} height={42} fill={BH1_COLOR} stroke="#0b1020" strokeWidth={1.5} />
          <rect x={P1_X0 + m1 * k} y={92} width={m2 * k} height={42} fill={BH2_COLOR} stroke="#0b1020" strokeWidth={1.5} />
          <SvgLines x={P1_X0 + (m1 * k) / 2} y={118} lines={[String(m1)]} fill="#0b1020" bold size={13} anchor="middle" />
          <SvgLines x={P1_X0 + m1 * k + (m2 * k) / 2} y={118} lines={[String(m2)]} fill="#0b1020" bold size={13} anchor="middle" />
          <SvgLines x={P1_X0 + (m1 * k) / 2} y={152} lines={['black hole 1', `${m1} Suns`]} fill={BH1_COLOR} bold anchor="middle" />
          <SvgLines x={P1_X0 + m1 * k + (m2 * k) / 2} y={152} lines={['black hole 2', `${m2} Suns`]} fill={BH2_COLOR} bold anchor="middle" />
          <SvgLines x={P1_X0} y={188} lines={[`together: ${one(m.totalBeforeSolar)} Suns. Their spins are small, at most about ${m.spinBeforeMax}.`]} fill={MUTED_COLOR} />
        </g>
      )}

      {stage >= 2 && (
        <g>
          <SvgLines x={P1_X0} y={226} lines={['AFTER: one black hole (measured)']} fill={TEXT_COLOR} bold size={12} />
          <rect x={P1_X0} y={236} width={m.massAfterSolar * k} height={42} fill={AFTER_COLOR} stroke="#0b1020" strokeWidth={1.5} />
          <SvgLines x={P1_X0 + (m.massAfterSolar * k) / 2} y={262} lines={[String(m.massAfterSolar)]} fill="#0b1020" bold size={13} anchor="middle" />
          <rect x={P1_X0 + m.massAfterSolar * k} y={236} width={m.radiatedSolar * k} height={42} fill="none" stroke={WAVES_COLOR} strokeWidth={2.5} strokeDasharray="4 3" />
          <line x1={totalX} y1={196} x2={totalX} y2={282} stroke={MUTED_COLOR} strokeWidth={1} strokeDasharray="2 3" />
          <SvgLines x={P1_X0} y={298} lines={[`one black hole: ${m.massAfterSolar} Suns. Its spin is about ${m.spinAfter}.`]} fill={AFTER_COLOR} bold />
          <SvgLines x={totalX + 6} y={250} lines={['left as', 'gravitational', 'waves:', `${one(m.radiatedSolar)} Suns`]} fill={WAVES_COLOR} bold size={10} />
          <SvgLines x={totalX + 6} y={206} lines={['the total before:', `${one(m.totalBeforeSolar)}`]} fill={MUTED_COLOR} size={9} />
          <SvgLines x={20} y={height - 8} lines={['Black holes: measured from the signal. The 3.1 and the shares are calculated here (see “Where the real picture comes from”, below).']} fill={MUTED_COLOR} size={9} />
        </g>
      )}
    </svg>
  )
}

// ---- Picture 2: the area before and after, and the guesses ----
const P2_BASE_Y = 360
const P2_TOP_Y = 96
const P2_BEFORE_X = 90
const P2_AFTER_X = 230
const P2_BAR_W = 64
const P2_MARK_X = 345
const P2_GUESS_X = 450

function PictureTwo({ stage, directionGuess, sizeGuess }: { stage: number; directionGuess: DirectionChoice | null; sizeGuess: SizeChoice | null }) {
  const a = areaPicture()
  const scale = (P2_BASE_Y - P2_TOP_Y) / a.axisMaxKm2
  const y = (km2: number) => P2_BASE_Y - km2 * scale
  const lineY = y(a.totalBeforeKm2)
  const [seg1, seg2] = a.segmentsBeforeKm2
  const height = 470
  const gb = sizeGuess === null ? null : guessBar(sizeGuess)
  const dm = directionGuess === null ? null : directionMarker(directionGuess)
  const ticks = [0, 200_000, 400_000, 600_000, 800_000]
  return (
    <svg
      width={VIEW_WIDTH}
      height={height}
      viewBox={`0 0 ${VIEW_WIDTH} ${height}`}
      style={svgStyle}
      role="img"
      aria-label={`Picture 2, bars of horizon area in square kilometres. Before: two stacked segments, ${thousands(seg1)} and ${thousands(seg2)}, together ${thousands(a.totalBeforeKm2)}.${
        stage >= 4 ? ` After: one bar of ${thousands(a.afterKm2)}, higher than the dashed line at the area before.` : ''
      }${stage >= 4 && directionGuess !== null && sizeGuess !== null ? ` Your guesses, in white: a marker for ${directionGuess} and an outlined bar for about ${sizeGuess} times the area before.` : ''}`}
    >
      <text x={20} y={22} fill={TEXT_COLOR} fontSize="13" fontWeight="bold">
        Picture 2: the total area of the horizons, before and after
      </text>
      <SvgLines x={20} y={42} lines={['a taller bar is a larger area; the unit is the square kilometre (km²)']} fill={MUTED_COLOR} />

      {/* The scale. */}
      <line x1={70} y1={P2_TOP_Y - 6} x2={70} y2={P2_BASE_Y} stroke={MUTED_COLOR} strokeWidth={1.5} />
      {ticks.map((t) => (
        <g key={t}>
          <line x1={66} y1={y(t)} x2={70} y2={y(t)} stroke={MUTED_COLOR} />
          <SvgLines x={62} y={y(t) + 3} lines={[thousands(t)]} fill={MUTED_COLOR} size={9} anchor="end" />
        </g>
      ))}
      <line x1={70} y1={P2_BASE_Y} x2={540} y2={P2_BASE_Y} stroke={MUTED_COLOR} strokeWidth={1.5} />

      {stage >= 3 && (
        <g>
          <rect x={P2_BEFORE_X} y={y(seg1)} width={P2_BAR_W} height={seg1 * scale} fill={BH1_COLOR} stroke="#0b1020" strokeWidth={1.5} />
          <rect x={P2_BEFORE_X} y={y(seg1 + seg2)} width={P2_BAR_W} height={seg2 * scale} fill={BH2_COLOR} stroke="#0b1020" strokeWidth={1.5} />
          <SvgLines x={P2_BEFORE_X + P2_BAR_W / 2} y={y(seg1 / 2) + 3} lines={[thousands(seg1)]} fill="#0b1020" bold size={10} anchor="middle" />
          <SvgLines x={P2_BEFORE_X + P2_BAR_W / 2} y={y(seg1 + seg2 / 2) + 3} lines={[thousands(seg2)]} fill="#0b1020" bold size={10} anchor="middle" />
          <line x1={P2_BEFORE_X - 6} y1={y(a.pressBeforeKm2)} x2={P2_BEFORE_X + P2_BAR_W + 6} y2={y(a.pressBeforeKm2)} stroke={PRESS_COLOR} strokeWidth={2.5} />
          <SvgLines x={P2_BEFORE_X + P2_BAR_W / 2} y={y(a.pressBeforeKm2) - 8} lines={[`press: about ${thousands(a.pressBeforeKm2)}`]} fill={PRESS_COLOR} bold size={9} anchor="middle" />
          <SvgLines x={P2_BEFORE_X + P2_BAR_W / 2} y={P2_BASE_Y + 16} lines={['BEFORE: the two', 'horizons added up', `${thousands(a.totalBeforeKm2)} km²`]} fill={TEXT_COLOR} bold anchor="middle" size={10} />
          <line x1={72} y1={lineY} x2={540} y2={lineY} stroke={MUTED_COLOR} strokeWidth={1.5} strokeDasharray="5 4" />
          <SvgLines x={P2_BEFORE_X + P2_BAR_W + 8} y={lineY + 13} lines={['area before']} fill={MUTED_COLOR} size={9} />
        </g>
      )}

      {stage >= 4 && (
        <g>
          <rect x={P2_AFTER_X} y={y(a.afterKm2)} width={P2_BAR_W} height={a.afterKm2 * scale} fill={AFTER_COLOR} stroke="#0b1020" strokeWidth={1.5} />
          <SvgLines x={P2_AFTER_X + P2_BAR_W / 2} y={y(a.afterKm2 / 2) + 3} lines={[thousands(a.afterKm2)]} fill="#0b1020" bold size={10} anchor="middle" />
          <line x1={P2_AFTER_X - 6} y1={y(a.pressAfterKm2)} x2={P2_AFTER_X + P2_BAR_W + 6} y2={y(a.pressAfterKm2)} stroke={PRESS_COLOR} strokeWidth={2.5} />
          <SvgLines x={P2_AFTER_X + P2_BAR_W / 2} y={y(a.pressAfterKm2) - 8} lines={[`press: about ${thousands(a.pressAfterKm2)}`]} fill={PRESS_COLOR} bold size={9} anchor="middle" />
          <SvgLines x={P2_AFTER_X + P2_BAR_W / 2} y={P2_BASE_Y + 16} lines={['AFTER: the one', 'horizon', `${thousands(a.afterKm2)} km²`]} fill={TEXT_COLOR} bold anchor="middle" size={10} />
        </g>
      )}

      {/* Your guesses, in white (only from stage 4, when the bar beside them is drawn). A direction has no size of its own, so the arrow is only a marker. */}
      {stage >= 4 && dm !== null && directionGuess !== null && (
        <g>
          {dm === 1 && (
            <>
              <line x1={P2_MARK_X} y1={lineY} x2={P2_MARK_X} y2={lineY - 34} stroke={YOURS_COLOR} strokeWidth={5} />
              <path d={`M ${P2_MARK_X} ${lineY - 52} l -13 20 l 26 0 Z`} fill={YOURS_COLOR} />
            </>
          )}
          {dm === -1 && (
            <>
              <line x1={P2_MARK_X} y1={lineY} x2={P2_MARK_X} y2={lineY + 34} stroke={YOURS_COLOR} strokeWidth={5} />
              <path d={`M ${P2_MARK_X} ${lineY + 52} l -13 -20 l 26 0 Z`} fill={YOURS_COLOR} />
            </>
          )}
          {dm === 0 && (
            <>
              <line x1={P2_MARK_X - 16} y1={lineY - 5} x2={P2_MARK_X + 16} y2={lineY - 5} stroke={YOURS_COLOR} strokeWidth={4} />
              <line x1={P2_MARK_X - 16} y1={lineY + 5} x2={P2_MARK_X + 16} y2={lineY + 5} stroke={YOURS_COLOR} strokeWidth={4} />
            </>
          )}
          <line x1={P2_MARK_X} y1={92} x2={P2_MARK_X} y2={dm === 1 ? lineY - 54 : lineY - 8} stroke={YOURS_COLOR} strokeWidth={2} />
          <rect x={P2_MARK_X - 55} y={52} width={110} height={42} rx={6} fill={YOURS_COLOR} stroke={MUTED_COLOR} strokeWidth={2} />
          <text x={P2_MARK_X - 48} y={67} fill="#0b1020" fontSize="11" fontWeight="bold">YOUR GUESS 1</text>
          <text x={P2_MARK_X - 48} y={80} fill="#0b1020" fontSize="9" fontWeight="bold">{DIRECTION_LABELS[directionGuess].toLowerCase()}</text>
          <text x={P2_MARK_X - 48} y={90} fill="#0b1020" fontSize="8" fontWeight="bold">(only a marker, no size)</text>
        </g>
      )}
      {stage >= 4 && gb !== null && sizeGuess !== null && (
        <g>
          <rect x={P2_GUESS_X} y={y(gb.drawnKm2)} width={P2_BAR_W} height={gb.drawnKm2 * scale} fill="none" stroke={YOURS_COLOR} strokeWidth={3.5} />
          {gb.offScale && (
            <>
              <line x1={P2_GUESS_X - 4} y1={P2_TOP_Y + 8} x2={P2_GUESS_X + P2_BAR_W + 4} y2={P2_TOP_Y - 2} stroke="#0b1020" strokeWidth={8} />
              <path d={`M ${P2_GUESS_X + P2_BAR_W / 2} ${P2_TOP_Y - 18} l -9 12 l 18 0 Z`} fill={YOURS_COLOR} />
              <SvgLines x={P2_GUESS_X + P2_BAR_W / 2} y={P2_TOP_Y + 24} lines={['off the', 'scale:', thousands(gb.areaKm2), 'km²']} fill={YOURS_COLOR} bold size={9} anchor="middle" />
            </>
          )}
          <line x1={P2_GUESS_X + P2_BAR_W / 2} y1={92} x2={P2_GUESS_X + P2_BAR_W / 2} y2={gb.offScale ? P2_TOP_Y - 18 : y(gb.drawnKm2) - 2} stroke={YOURS_COLOR} strokeWidth={2} />
          <rect x={P2_GUESS_X - 40} y={52} width={140} height={42} rx={6} fill={YOURS_COLOR} stroke={MUTED_COLOR} strokeWidth={2} />
          <text x={P2_GUESS_X - 33} y={67} fill="#0b1020" fontSize="11" fontWeight="bold">YOUR GUESS 2</text>
          <text x={P2_GUESS_X - 33} y={80} fill="#0b1020" fontSize="9" fontWeight="bold">about {sizeGuess} × the area before</text>
          <text x={P2_GUESS_X - 33} y={90} fill="#0b1020" fontSize="8" fontWeight="bold">= {thousands(gb.areaKm2)} km²</text>
          <SvgLines x={P2_GUESS_X + P2_BAR_W / 2} y={P2_BASE_Y + 16} lines={['YOUR GUESS 2:', 'the area after']} fill={YOURS_COLOR} bold anchor="middle" size={10} />
        </g>
      )}

      <SvgLines
        x={20}
        y={height - 24}
        lines={['White is only ever your guess. The coloured bars are real: the masses and spins were measured,', 'the areas are calculated here with the formula (see “Where the real picture comes from”, below).']}
        fill={MUTED_COLOR}
        size={9}
      />
    </svg>
  )
}

// ---- Picture 3: how much could a merger give off? ----
const P3_X0 = 76
const P3_X1 = 520
const P3_Y_BASE = 300
const P3_Y_TOP = 70

function PictureThree() {
  const c = ceilingPicture()
  const x = (percent: number) => P3_X0 + (percent / c.shareMaxPercent) * (P3_X1 - P3_X0)
  const y = (ratio: number) => P3_Y_BASE - (ratio / c.ratioMax) * (P3_Y_BASE - P3_Y_TOP)
  const line = (points: { sharePercent: number; ratio: number }[]) => points.map((p) => `${x(p.sharePercent)},${y(p.ratio)}`).join(' ')
  const height = 410
  return (
    <svg
      width={VIEW_WIDTH}
      height={height}
      viewBox={`0 0 ${VIEW_WIDTH} ${height}`}
      style={svgStyle}
      role="img"
      aria-label={`Picture 3, a graph. Across, the share of the mass radiated, from 0 to ${c.shareMaxPercent} percent. Up, the area after divided by the area before. Two falling curves: one for a final spin of ${GW250114.finalSpin}, which crosses the line at 1 at ${one(c.ceilingMeasuredSpinPercent)} percent, and one for no spin, which crosses at ${one(c.ceilingNoSpinPercent)} percent. A green dot marks GW250114, at ${one(c.real.sharePercent)} percent and ${two(c.real.ratio)}.`}
    >
      <text x={20} y={22} fill={TEXT_COLOR} fontSize="13" fontWeight="bold">
        Picture 3: how much could a merger give off as waves?
      </text>
      <SvgLines x={20} y={42} lines={['calculated here from the published masses and the area formula; not a measurement']} fill={MUTED_COLOR} />

      {/* The region where the area would have shrunk. */}
      <rect x={P3_X0} y={y(1)} width={P3_X1 - P3_X0} height={P3_Y_BASE - y(1)} fill={FLOOR_COLOR} fillOpacity={0.12} />
      <SvgLines x={P3_X0 + 8} y={y(1) + 18} lines={['faint red region: here the area after', 'would be smaller than the area before']} fill={FLOOR_COLOR} bold size={9} />

      <line x1={P3_X0} y1={P3_Y_TOP - 6} x2={P3_X0} y2={P3_Y_BASE} stroke={MUTED_COLOR} strokeWidth={1.5} />
      <line x1={P3_X0} y1={P3_Y_BASE} x2={P3_X1} y2={P3_Y_BASE} stroke={MUTED_COLOR} strokeWidth={1.5} />
      {[0, 0.5, 1, 1.5, 2].map((t) => (
        <g key={t}>
          <line x1={P3_X0 - 4} y1={y(t)} x2={P3_X0} y2={y(t)} stroke={MUTED_COLOR} />
          <SvgLines x={P3_X0 - 8} y={y(t) + 3} lines={[String(t)]} fill={MUTED_COLOR} size={9} anchor="end" />
        </g>
      ))}
      {[0, 5, 10, 15, 20, 25, 30, 35].map((t) => (
        <g key={t}>
          <line x1={x(t)} y1={P3_Y_BASE} x2={x(t)} y2={P3_Y_BASE + 4} stroke={MUTED_COLOR} />
          <SvgLines x={x(t)} y={P3_Y_BASE + 16} lines={[String(t)]} fill={MUTED_COLOR} size={9} anchor="middle" />
        </g>
      ))}
      <SvgLines x={(P3_X0 + P3_X1) / 2} y={P3_Y_BASE + 32} lines={['the share of the mass radiated as gravitational waves (percent)']} fill={TEXT_COLOR} bold size={10} anchor="middle" />
      <SvgLines x={20} y={P3_Y_TOP - 14} lines={['area after ÷ area before']} fill={TEXT_COLOR} bold size={10} />

      <line x1={P3_X0} y1={y(1)} x2={P3_X1} y2={y(1)} stroke={FLOOR_COLOR} strokeWidth={2} strokeDasharray="6 4" />
      <SvgLines x={P3_X0 + 6} y={y(1) - 6} lines={['1: the area after equals the area before']} fill={FLOOR_COLOR} bold size={9} />

      <polyline points={line(c.noSpin)} fill="none" stroke={BH1_COLOR} strokeWidth={2.5} />
      <polyline points={line(c.measuredSpin)} fill="none" stroke="#fbbf24" strokeWidth={2.5} />
      <SvgLines x={x(17)} y={y(c.noSpin[34].ratio) - 8} lines={['no spin after']} fill={BH1_COLOR} bold size={10} />
      <SvgLines x={x(17)} y={y(c.measuredSpin[34].ratio) - 8} lines={[`spin ${GW250114.finalSpin} after`]} fill="#fbbf24" bold size={10} />

      {/* Where each curve crosses 1. */}
      <line x1={x(c.ceilingMeasuredSpinPercent)} y1={y(1)} x2={x(c.ceilingMeasuredSpinPercent)} y2={P3_Y_BASE} stroke="#fbbf24" strokeWidth={1.5} strokeDasharray="3 3" />
      <SvgLines x={x(c.ceilingMeasuredSpinPercent)} y={P3_Y_BASE - 8} lines={[`${one(c.ceilingMeasuredSpinPercent)}%`]} fill="#fbbf24" bold size={10} anchor="end" />
      <line x1={x(c.ceilingNoSpinPercent)} y1={y(1)} x2={x(c.ceilingNoSpinPercent)} y2={P3_Y_BASE} stroke={BH1_COLOR} strokeWidth={1.5} strokeDasharray="3 3" />
      <SvgLines x={x(c.ceilingNoSpinPercent) + 3} y={P3_Y_BASE - 8} lines={[`${one(c.ceilingNoSpinPercent)}%`]} fill={BH1_COLOR} bold size={10} />

      {/* The real event. */}
      <circle cx={x(c.real.sharePercent)} cy={y(c.real.ratio)} r={6} fill={REAL_COLOR} stroke="#0b1020" strokeWidth={1.5} />
      <line x1={x(c.real.sharePercent) + 5} y1={y(c.real.ratio) - 4} x2={x(c.real.sharePercent) + 40} y2={y(c.real.ratio) - 36} stroke={REAL_COLOR} strokeWidth={1.5} />
      <SvgLines x={x(c.real.sharePercent) + 42} y={y(c.real.ratio) - 42} lines={['GW250114:', `${one(c.real.sharePercent)} percent radiated,`, `area ${two(c.real.ratio)} × before`]} fill={REAL_COLOR} bold size={10} />

      <SvgLines x={20} y={height - 48} lines={['Each curve is the area after a merger that radiates the share shown,', `for the final spin named. The spin of ${GW250114.finalSpin} is GW250114’s. The curve for no spin`, 'is there to show that the spin matters. No guess is drawn on this picture.']} fill={MUTED_COLOR} size={9} />
    </svg>
  )
}

// The note under a results table (CLAUDE.md §14, "Reading the Results"): each item says what it is, what it means with the real numbers, why it matters and how sure it is.
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

// A caption block: how to read, a worked moment, and the three-part "What to look for" items that have been drawn so far (CLAUDE.md §14, §29).
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

// ---- Part 2: the learner's own trial values (one drawing that follows the two controls; the real pictures never change) ----
const PART_TWO_COLOR = '#0d9488'
const PART_THREE_COLOR = '#7c3aed'
const PART_FOUR_COLOR = '#0066cc'
const TRIAL_COLOR = '#e879f9' // pink-purple: imagined for the question (a trial value)

function TrialDrawing({ trial }: { trial: TrialMerger }) {
  const a = areaPicture()
  const baseY = 300
  const topY = 80
  const scale = (baseY - topY) / TRIAL_AXIS_MAX_KM2
  const y = (km2: number) => baseY - km2 * scale
  const beforeX = 90
  const trialX = 210
  const barW = 70
  const lineY = y(a.totalBeforeKm2)
  const height = 400
  const headroom = ceilingHeadroomPercent(trial)
  const ticks = [0, 100_000, 200_000, 300_000, 400_000, 500_000]
  const readout = [
    `mass after: ${one(trial.massAfterSolar)} Suns`,
    `(${one(trial.share * 100)} percent radiated)`,
    `spin after: ${trial.spinAfter}`,
    `area after: ${thousands(trial.areaAfterKm2)} km²`,
    `${two(trial.ratio)} × the area before`,
  ]
  return (
    <svg
      width={VIEW_WIDTH}
      height={height}
      viewBox={`0 0 ${VIEW_WIDTH} ${height}`}
      style={svgStyle}
      role="img"
      aria-label={`Drawing A, imagined for the question. Two bars of area. The grey bar is the real total before, ${thousands(a.totalBeforeKm2)} square kilometres. The pink-purple bar is your trial: ${one(trial.share * 100)} percent of the mass radiated and a spin of ${trial.spinAfter} after, giving an area of ${thousands(trial.areaAfterKm2)}, which is ${two(trial.ratio)} times the area before${trial.areaWentDown ? ', below the dashed line' : ', above the dashed line'}.`}
    >
      <text x={20} y={22} fill={TEXT_COLOR} fontSize="13" fontWeight="bold">
        Drawing A: the area after, for your trial values (imagined)
      </text>
      <SvgLines x={20} y={42} lines={['the grey bar is real and never changes; the pink-purple bar follows your two choices']} fill={MUTED_COLOR} />
      <line x1={70} y1={topY - 6} x2={70} y2={baseY} stroke={MUTED_COLOR} strokeWidth={1.5} />
      {ticks.map((t) => (
        <g key={t}>
          <line x1={66} y1={y(t)} x2={70} y2={y(t)} stroke={MUTED_COLOR} />
          <SvgLines x={62} y={y(t) + 3} lines={[thousands(t)]} fill={MUTED_COLOR} size={9} anchor="end" />
        </g>
      ))}
      <line x1={70} y1={baseY} x2={540} y2={baseY} stroke={MUTED_COLOR} strokeWidth={1.5} />

      <rect x={beforeX} y={y(a.totalBeforeKm2)} width={barW} height={a.totalBeforeKm2 * scale} fill="#64748b" stroke="#0b1020" strokeWidth={1.5} />
      <SvgLines x={beforeX + barW / 2} y={y(a.totalBeforeKm2 / 2) + 3} lines={[thousands(a.totalBeforeKm2)]} fill="#0b1020" bold size={10} anchor="middle" />
      <SvgLines x={beforeX + barW / 2} y={baseY + 16} lines={['BEFORE: the two', 'horizons (real)']} fill={TEXT_COLOR} bold size={10} anchor="middle" />

      <rect x={trialX} y={y(trial.areaAfterKm2)} width={barW} height={trial.areaAfterKm2 * scale} fill={TRIAL_COLOR} stroke="#0b1020" strokeWidth={1.5} />
      <SvgLines x={trialX + barW / 2} y={y(trial.areaAfterKm2 / 2) + 3} lines={[thousands(trial.areaAfterKm2)]} fill="#0b1020" bold size={10} anchor="middle" />
      <SvgLines x={trialX + barW / 2} y={baseY + 16} lines={['YOUR TRIAL:', 'the area after', '(imagined)']} fill={TRIAL_COLOR} bold size={10} anchor="middle" />

      <line x1={72} y1={lineY} x2={540} y2={lineY} stroke={MUTED_COLOR} strokeWidth={1.5} strokeDasharray="5 4" />
      <SvgLines x={beforeX + barW + 8} y={lineY - 5} lines={['area before']} fill={MUTED_COLOR} size={9} />
      {/* The real area after (Picture 2), as a tick across the trial bar, so the trial can be compared with the real event. */}
      <line x1={trialX - 8} y1={y(a.afterKm2)} x2={trialX + barW + 8} y2={y(a.afterKm2)} stroke={REAL_COLOR} strokeWidth={3} />
      <SvgLines x={trialX + barW + 12} y={y(a.afterKm2) - 2} lines={['real area after', `(GW250114): ${thousands(a.afterKm2)}`]} fill={REAL_COLOR} bold size={9} />

      <SvgLines x={410} y={topY + 4} lines={readout} fill={TRIAL_COLOR} bold size={10} />
      {trial.areaWentDown ? (
        <SvgLines x={410} y={lineY + 20} lines={['In this trial the area', 'after is smaller than the', 'area before: below the', 'dashed line. This is not', 'what GW250114 showed.']} fill={FLOOR_COLOR} bold size={10} />
      ) : (
        <SvgLines x={410} y={lineY + 20} lines={['In this trial the area', 'after is larger than the', 'area before: above the', 'dashed line.']} fill={TEXT_COLOR} bold size={10} />
      )}
      <SvgLines
        x={20}
        y={height - 40}
        lines={[
          `At a spin of ${trial.spinAfter} after, the trial area would equal the area before at ${one(trial.ceiling * 100)} percent radiated.`,
          `Your trial is ${one(Math.abs(headroom))} percentage points ${headroom >= 0 ? 'below' : 'above'} that.`,
          'Nothing here is a real merger: the two settings are your own trial values.',
        ]}
        fill={MUTED_COLOR}
        size={9}
      />
    </svg>
  )
}

// The button labels. The values (and the answers) are the physics module's (CLAUDE.md §9); no label says which is right.
const DIRECTION_LABELS: Record<DirectionChoice, string> = { down: 'Went down', same: 'Stayed about the same', up: 'Went up' }
const SIZE_LABELS: Record<SizeChoice, string> = {
  0.17: 'About 0.17 (about one sixth as much)',
  0.6: 'About 0.6 (about 40 percent less)',
  0.95: 'About 0.95 (a few percent less than before)',
  1.05: 'About 1.05 (a few percent more than before)',
  1.6: 'About 1.6 (about half as much again)',
  6: 'About 6 (about six times as much)',
}

interface HorizonAreaLawExperimentProps {
  onComplete?: () => void
  onTutorComplete?: () => void
}

// onComplete is called when the run reaches its end. onTutorComplete is called when the learner reaches the tutor's explanation.
export function HorizonAreaLawExperiment({ onComplete, onTutorComplete }: HorizonAreaLawExperimentProps) {
  const g = GW250114
  const [low, high] = g.strongerThanPreviousBest
  const [directionGuess, setDirectionGuess] = useState<DirectionChoice | null>(null)
  const [sizeGuess, setSizeGuess] = useState<SizeChoice | null>(null)
  const realShare = Number((radiatedFraction() * 100).toFixed(1))
  const [shareChoice, setShareChoice] = useState<number>(realShare)
  const [spinChoice, setSpinChoice] = useState<number>(GW250114.finalSpin)
  const [status, setStatus] = useState<'idle' | 'running' | 'complete'>('idle')
  const [stage, setStage] = useState(0)
  const recorded = status !== 'idle'
  const done = status === 'complete'
  const bothPredicted = directionGuess !== null && sizeGuess !== null

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

  // The worked example for Prediction 2: 100 units before, and what each button stands for (read from the module's button values).
  const exampleBefore = 100
  function startOver() {
    setDirectionGuess(null)
    setSizeGuess(null)
    setShareChoice(realShare)
    setSpinChoice(GW250114.finalSpin)
    setStatus('idle')
    setStage(0)
  }
  function run() {
    setStage(1)
    setStatus('running')
  }
  // Every number in the captions comes from the physics module (CLAUDE.md §9).
  const mass = massPicture()
  const area = areaPicture()
  const change = areaChange()
  const ceiling = { ...ceilingPicture(), spin: g.finalSpin }
  const steps1 = areaSteps(mass.massesBeforeSolar[0], 0)
  const steps2 = areaSteps(mass.massesBeforeSolar[1], 0)
  const stepsAfter = areaSteps(mass.massAfterSolar, mass.spinAfter)
  const trial10 = trialMerger(0.1, g.finalSpin)
  const trial30 = trialMerger(0.3, g.finalSpin)
  const mine = runHorizonAreaLaw({ sharePercent: shareChoice, spinAfter: spinChoice }).trial
  const mineSteps = areaSteps(mine.massAfterSolar, mine.spinAfter)
  const cu = checkUp()
  return (
    <div>
      <h2>Experiment 18 — Does a Black Hole’s Surface Area Ever Shrink? (GW250114 and Hawking’s Area Theorem)</h2>
      <div className="exp-card" style={{ marginTop: '2rem', padding: '1.5rem' }}>
        <p style={{ marginTop: 0, marginBottom: '1.5rem', fontSize: '0.875rem' }}>
          <strong>
            Where this stands (as of October 2026): in January 2025 the LIGO detectors recorded the clearest gravitational-wave signal so far, from two black holes merging. It was clear
            enough for the teams to test a prediction that Stephen Hawking made in 1971 about the surface of black holes. That is strong evidence, from one very clear event. It is a
            test of a prediction of general relativity, not a new law. What the test found is shown after you press Run, so that you can guess first.
          </strong>
        </p>

        <div style={{ marginBottom: '1.5rem' }}>
          <p style={paragraph}>
            <strong>The question.</strong> When two black holes merge, they become one black hole, and while they do it a great deal of energy leaves as gravitational waves. The new
            black hole is lighter than the two that made it, because that energy has gone. Does the surface of the black hole shrink too? In 2025 a very clear signal let scientists
            measure this, and compare what they found with a prediction made more than fifty years earlier.
          </p>

          <p style={paragraph}>
            <strong>Where we left off.</strong> In Black Holes Experiments 1 and 8 you saw that a black hole has a boundary, the horizon, and that its size depends on its mass and
            on how fast it spins. In Gravitational Waves Experiments 1 to 4 you saw that two black holes circling each other send out gravitational waves, and that the waves carry
            energy away. In Experiment 1 of this group you met the “give-or-take” of a measurement. This experiment puts those ideas together.
          </p>

          <p style={paragraph}>
            <strong>What the “area” of a black hole is.</strong> A ball has a surface, its outer skin, and the <strong>area</strong> of that skin is how much paint you would need to
            cover it. For example, a ball with a radius of 10 centimetres has a skin of about 1,260 square centimetres (4 × 3.14 × 10 × 10), so a tin of paint that covers 1,000
            square centimetres would not quite be enough. A black hole has a kind of surface too: its <strong>horizon</strong>, the boundary beyond which nothing can come back out. We
            can work out the area of the horizon from a black hole’s mass and spin, and we give it in <strong>square kilometres</strong>, where one square kilometre is the area of a
            square one kilometre on each side. In 1971 Stephen Hawking proved a rule about these areas, called the <strong>area theorem</strong>. What the rule says is not given
            here, because it is the subject of the predictions you are about to make.
          </p>

          <div style={{ marginBottom: '0.75rem' }}>
            <AreaDrawing />
          </div>
          <div style={{ fontSize: '0.875rem', color: 'var(--text-muted)', marginBottom: '0.75rem' }}>
            <p style={paragraph}>
              <strong>How to read this illustration.</strong> It explains the word “area” when it is used for a black hole. It is a sketch of the idea, not a drawing of a real black
              hole, and it is not to scale. It is a flat drawing of something that really goes all the way round, as a flat circle stands for a ball.
            </p>
            <ul style={{ margin: '0 0 0.75rem', paddingLeft: '1.25rem' }}>
              <li>
                <strong>The two panels.</strong> Panel 1 is a comparison, a ball, which is something you can picture. Panel 2 is a black hole. The ball is there only to explain the
                idea of a surface and its area.
              </li>
              <li>
                <strong>The light grey circle</strong> in panel 1 is the ball. <strong>The thick amber outline</strong> round it is its surface, its skin. <strong>The amber words</strong>
                name it. The grey words underneath say what its area is.
              </li>
              <li>
                <strong>The small dark circle with a red outline</strong> in panel 2 is the inside of the black hole, where nothing gets back out. <strong>The dashed amber ring</strong>
                round it is the horizon, the black hole’s surface. It is dashed, not solid, because there is nothing solid there: it is a boundary in space.
              </li>
              <li>
                <strong>The red arrow</strong> points in from outside, to show that anything that crosses the horizon cannot come back out. It does not show a real path. The
                same amber colour is used in both panels because both rings are a surface.
              </li>
              <li>
                <strong>The words at the bottom</strong> say that a black hole’s size is set by its mass and its spin. No sizes are drawn, and no number is shown, because the
                drawing is only to explain the word “area”.
              </li>
            </ul>
            <p style={paragraph}>
              <strong>A worked moment, with the ball.</strong> A ball with a radius of 10 centimetres has a skin of about 1,260 square centimetres: 4 × 3.14 × 10 × 10 = 1,256. A tin
              of paint that covers 1,000 square centimetres would paint most of it, and you would need part of a second tin. The area of a black hole’s horizon is the same kind of
              number, only far bigger, which is why it is given in square kilometres. The real numbers come after the run.
            </p>
            <p style={{ marginTop: 0, marginBottom: '0.5rem' }}>
              <strong>What to look for.</strong>
            </p>
            <LookForList items={lookForArea} />
          </div>

          <p style={paragraph}>
            <strong>What GW250114 was.</strong> On {g.detected} the two LIGO detectors, in Washington and Louisiana, recorded a gravitational-wave signal that the teams named
            GW250114 (the name is the date). It came from two black holes, each about the same weight, of about {Math.round(g.massesSolar[0])} and {Math.round(g.massesSolar[1])} times the
            mass of the Sun, that spiralled together and merged about {g.distanceBillionLightYears} billion light-years away. It was the clearest signal recorded so far: its signal-to-noise
            ratio was about {g.signalToNoise}, which is {low} to {high} times higher than the previous best. (Think of a friend talking at a party: the louder their voice is compared with the chatter around you, the more clearly you hear them. The signal-to-noise ratio is that comparison for a detector.) A clearer signal means better measurements, so the teams could work out the
            masses and the spins of the black holes before the merger, and the mass and the spin of the one black hole after it, well enough to calculate the horizon areas.
          </p>

          <p style={paragraph}>
            <strong>Where the question stands (October 2026).</strong> The result comes from one event, so it is strong evidence, and not yet something settled by many. What was tested
            is a prediction of general relativity, the theory of gravity from the Gravity and Curved Spacetime chapter. It is not a new law of nature. The areas are worked out from
            masses and spins that the teams fitted to the signal, so they carry a give-or-take. What the numbers add up to is shown after the run, with each number’s source.
          </p>

          <div style={{ marginBottom: '0.75rem' }}>
            <p style={{ marginTop: 0, marginBottom: '0.5rem' }}>
              <strong>Some new words.</strong> The “Words and formulas” box below has each one, with a few from earlier experiments.
            </p>
            <ul style={{ margin: 0, paddingLeft: '1.25rem' }}>
              <li>
                <strong>Horizon</strong>, <strong>horizon area</strong> and <strong>square kilometre</strong>: the edge of a black hole, the size of that edge, and the unit it is given in.
              </li>
              <li>
                <strong>Area theorem</strong>: a rule that Hawking proved in 1971. Its content is held back for the predictions.
              </li>
              <li>
                <strong>Black hole merger</strong>, <strong>gravitational waves</strong> and <strong>spin</strong>: ideas from earlier experiments.
              </li>
              <li>
                <strong>Signal-to-noise ratio</strong>: how clearly a signal stands out from the background noise.
              </li>
              <li>
                <strong>Solar mass</strong>, <strong>give-or-take</strong> and <strong>light-year</strong>: the unit for star and black hole weights, the uncertainty of a measurement,
                and a unit of distance.
              </li>
            </ul>
          </div>

          <p style={paragraph}>
            <strong>What you will do.</strong> You will make two predictions, press Run to watch the pictures build up one stage at a time, and then try other values in a part of its
            own. Nothing here is graded. Your predictions are your own guesses, made before you see anything. They never change the real pictures or the tables, which come from the
            physics and the published numbers. Your guesses are drawn on top of the real picture, in white, so you can compare each guess with the real result. They are shown again
            beside the results too. The page has four parts: first you predict and watch the pictures; then, in “Now try it yourself”, you can choose how much of the mass a merger
            gives off as gravitational waves and how fast the black hole afterwards spins, and watch a drawing of your own follow your choices; then come the results; and last a
            tutor asks you some questions. The real pictures and the results tables never change. Your white guess marks appear on the real picture, and only the drawing in “Now
            try it yourself” follows your choices.
          </p>

          <p style={paragraph}>
            <strong>What we assume.</strong> This experiment is arithmetic on published numbers, with one formula for the area of a spinning black hole’s horizon, from Black Holes
            Experiment 8. It does not simulate the merger and it does not fit a signal. It does not work out the uncertainties of the areas, which the scientists’ paper does. It takes
            the masses and the spins that the teams measured and works out the areas from them.
          </p>

          <p style={{ marginTop: 0, marginBottom: '0.75rem' }}>
            <strong>Want to know more?</strong> Plainer-language pages are listed here. Links open in a new tab. This page was written as of October 2026. The papers and news releases
            behind the numbers are listed after the run, so that they do not give away the predictions.
          </p>
          <ul style={{ margin: '0.25rem 0 0', paddingLeft: '1.25rem' }}>
            <li>
              <ExternalLink href="https://science.nasa.gov/universe/black-holes/anatomy/">NASA: Anatomy of a black hole</ExternalLink>: what the event horizon is, and why we can
              think of it as the black hole’s surface.
            </li>
            <li>
              <ExternalLink href="https://science.nasa.gov/universe/black-holes/">NASA: Black holes</ExternalLink>: what a black hole is and how one forms from a massive star.
            </li>
            <li>
              <ExternalLink href="https://spaceplace.nasa.gov/gravitational-waves/en/">NASA Space Place: What is a gravitational wave?</ExternalLink> What a gravitational wave is,
              and how two black holes merging make one.
            </li>
            <li>
              <ExternalLink href="https://www.ligo.caltech.edu/page/what-are-gw">LIGO: What are gravitational waves?</ExternalLink> A plain account from the observatory that made the
              detection, of how its detectors measure the ripples.
            </li>
          </ul>
        </div>

        <ReferencePanel entries={referenceEntries()} />

        {/* The two predictions: draft wording for the owner's review (CLAUDE.md §28.1), from the specification's "Prediction Activity". Neither says which answer is right. */}
        <div style={{ marginTop: '2.5rem', paddingTop: '1.5rem', borderTop: '6px solid #d97706' }}>
          <h3 style={{ margin: '0 0 0.5rem', color: '#d97706' }}>Part 1: Predict, then watch</h3>
          <p style={{ ...paragraph, fontSize: '0.875rem', color: 'var(--text-muted)' }}>
            <strong>What we are about to do.</strong> This part is the experiment itself. You make your two predictions, press Run, and watch three pictures build up one stage at a
            time. The pictures show fixed things: the masses and spins that the teams measured for one merger, the horizon areas worked out from them, and a calculation of how much a
            merger could give off as waves. They are the same for everyone. When the run reaches stage 4, your guesses are drawn on Picture 2 in white, so you can see how each guess
            compares with the real result. The real pictures stay the same whatever you guess.
          </p>
          {(
            [
              {
                title: 'Prediction 1: which way did the total area go?',
                text: (
                  <>
                    Before the merger there are two black holes, each with a horizon that has an area. Add those two areas together to get the total area before. After the merger
                    there is only one black hole, with one horizon and one area. Is that one area smaller than, about the same as, or bigger than the total from before? What do you
                    think happened?
                  </>
                ),
                choices: DIRECTION_CHOICES.map((value) => ({ value, label: DIRECTION_LABELS[value] })),
                value: directionGuess,
                set: (v: string) => setDirectionGuess(v as DirectionChoice),
              },
              {
                title: 'Prediction 2: by how much?',
                text: (
                  <>
                    Think of the total area of the two horizons before the merger as 1. About how large do you think the area of the one horizon after the merger was? For example,
                    if the area before were {exampleBefore} units (we use {exampleBefore} only because it is a round number that makes the sums easy; these are not real units of area),
                    then {SIZE_CHOICES.map((c, k) => (
                      <span key={c}>
                        {k > 0 ? (k === SIZE_CHOICES.length - 1 ? ' and ' : ', ') : ''}“about {c}” would be about {Math.round(c * exampleBefore)} units
                      </span>
                    ))}. This is a separate guess from Prediction 1, so your two answers do not have to agree with each other.
                    If you are unsure of one, a guess is fine.
                  </>
                ),
                choices: SIZE_CHOICES.map((value) => ({ value: String(value), label: SIZE_LABELS[value] })),
                value: sizeGuess === null ? null : String(sizeGuess),
                set: (v: string) => setSizeGuess(Number(v) as SizeChoice),
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
            {status === 'idle' && <span style={{ color: 'var(--text-muted)' }}>The pictures fill in, one stage at a time, after you press Run.</span>}
            {status !== 'idle' && (
              <span>
                <strong>
                  {done ? 'Run complete.' : `Stage ${stage} of ${LAST_STAGE}: ${STAGE_NAMES[stage]}.`}
                </strong>{' '}
                {done ? 'All three pictures are drawn. Your predictions are recorded and not marked here.' : STAGE_LINES[stage]}
              </span>
            )}
          </p>

          {stage >= 1 && (
            <div>
              <PictureOne stage={stage} />
              <CaptionBlock
                title="Picture 1"
                intro={`It shows the masses before and after the merger as bars on one scale. The unit is the mass of the Sun: a black hole of ${mass.massesBeforeSolar[0]} “Suns” is ${mass.massesBeforeSolar[0]} times as heavy as the Sun. The longer the bar, the heavier the black hole.`}
                bullets={[
                  <><strong>The blue and violet segments</strong> in the first row are the two black holes before the merger, side by side. Their lengths are their masses, and the numbers inside are the same masses. This row appears first.</>,
                  <><strong>The red bar</strong> in the second row, which appears second, is the one black hole after the merger. Its length is its mass.</>,
                  <><strong>The yellow dashed outline</strong> at the end of the red bar is the mass-energy that left as gravitational waves. It is an outline with no fill because no black hole holds it: the waves carried it away.</>,
                  <><strong>The thin dotted vertical line</strong> marks the total mass before ({one(mass.totalBeforeSolar)} Suns), so you can see that the red bar and the dashed piece together reach it.</>,
                  <><strong>The words under each bar</strong> say how fast each black hole spins, on the 0 to 1 scale of Black Holes Experiment 8 (0 is not turning).</>,
                ]}
                worked={stage < 2 ? <>{mass.massesBeforeSolar[0]} + {mass.massesBeforeSolar[1]} = {one(mass.totalBeforeSolar)} Suns before the merger. The one black hole after it appears at the next stage, and the worked sum is completed then.</> : <>{mass.massesBeforeSolar[0]} + {mass.massesBeforeSolar[1]} = {one(mass.totalBeforeSolar)} Suns before. After the merger there is one black hole of {mass.massAfterSolar} Suns, so {one(mass.totalBeforeSolar)} − {mass.massAfterSolar} = {one(mass.radiatedSolar)} Suns’ worth of mass-energy went away as waves. As a share of the mass before, {one(mass.radiatedSolar)} ÷ {one(mass.totalBeforeSolar)} = {(mass.radiatedSolar / mass.totalBeforeSolar).toFixed(3)}, which is {one(mass.radiatedPercent)} percent. (Mass and energy are two forms of the same thing, E = mc², as in Spacetime Geometry Experiment 5, so “{one(mass.radiatedSolar)} Suns’ worth” of energy is the energy that {one(mass.radiatedSolar)} Suns of mass would have.)</>}
                lookFor={[
                  ...(stage >= 1 ? [{ look: 'the blue and violet segments in the first row, with their numbers.', means: `before the merger there were two black holes of ${mass.massesBeforeSolar[0]} and ${mass.massesBeforeSolar[1]} Suns, almost the same weight, and ${one(mass.totalBeforeSolar)} Suns between them.`, matters: 'these two masses, and their spins, are what the area before is worked out from in Picture 2.' }] : []),
                  ...(stage >= 2 ? [
                    { look: 'the red bar in the second row, and how it ends short of the dotted line.', means: `after the merger the one black hole weighs ${mass.massAfterSolar} Suns, ${one(mass.radiatedSolar)} Suns less than the two together, so it is lighter than the two black holes that made it.`, matters: 'this is the sense in which the merged black hole is “smaller”: it weighs less. Whether its surface is smaller too is what Picture 2 shows.' },
                    { look: 'the yellow dashed piece at the end of the red bar.', means: `the ${one(mass.radiatedSolar)} Suns’ worth of energy that the gravitational waves carried away, which is ${one(mass.radiatedPercent)} percent of the mass before.`, matters: 'this is why the black hole after is lighter. Picture 3 asks how large this piece could be.' },
                  ] : []),
                ]}
                whereFrom={<><strong>Measured:</strong> the masses ({mass.massesBeforeSolar[0]}, {mass.massesBeforeSolar[1]}{stage >= 2 ? <> and {mass.massAfterSolar}</> : null} Suns) and the spins were found by the LIGO, Virgo and KAGRA teams by fitting a model of the merger to the signal. This page’s numbers come from summaries of their paper, not from the paper itself, so each should be checked against it. <strong>Calculated here:</strong> the total before ({mass.massesBeforeSolar[0]} + {mass.massesBeforeSolar[1]} = {one(mass.totalBeforeSolar)}){stage >= 2 ? <>, the mass-energy that left ({one(mass.totalBeforeSolar)} − {mass.massAfterSolar} = {one(mass.radiatedSolar)}) and its share ({one(mass.radiatedPercent)} percent)</> : null}. <strong>Imagined for the question:</strong> nothing. No guess is drawn on this picture.</>}
              />
            </div>
          )}

          {stage >= 3 && (
            <div>
              <PictureTwo stage={stage} directionGuess={directionGuess} sizeGuess={sizeGuess} />
              <CaptionBlock
                title="Picture 2"
                intro={`It shows the area of the black holes’ horizons as bars on one scale, in square kilometres (km²). A taller bar is a larger area. The scale stops at ${thousands(area.axisMaxKm2)} km² so that the real bars are big enough to compare.`}
                bullets={[
                  <><strong>The blue and violet segments</strong> stacked in the BEFORE bar are the horizon areas of the two black holes before the merger. Added together they make the total before: {thousands(area.segmentsBeforeKm2[0])} + {thousands(area.segmentsBeforeKm2[1])} = {thousands(area.totalBeforeKm2)} km².</>,
                  <><strong>The red AFTER bar</strong> is the area of the one horizon after the merger. It appears at stage 4.</>,
                  <><strong>The grey dashed line</strong> is the total before, carried across the picture so that you can compare the AFTER bar with it.</>,
                  <><strong>The orange ticks</strong> are the rounded figures in a press release (about {thousands(area.pressBeforeKm2)}{stage >= 4 ? <> and about {thousands(area.pressAfterKm2)}</> : null} km²).</>,
                  <><strong>White is only ever your guess.</strong> Your first guess is an arrow (up or down) or two short bars (the same). It is only a marker for the direction you chose and has no size of its own. Your second guess is the white outlined bar: its height is the area you chose (“about {sizeGuess ?? '…'} times the area before”). If it would be too tall for the scale, it is cut off and says “off the scale”. Both appear only after the red bar is drawn.</>,
                ]}
                worked={stage < 4 ? <>For black hole 1 ({steps1.massSolar} Suns): GM/c² is a length, {one(steps1.gmKm)} km (half the horizon radius of a black hole that is not spinning). Squared, that is {thousands(steps1.gmSquaredKm2)} km². Times 16π (about {one(steps1.sixteenPi)}), that is {thousands(steps1.areaKm2)} km² (a spin of 0 gives a spin factor of 1; Black Holes Experiment 8’s formula). Black hole 2 ({steps2.massSolar} Suns) gives {thousands(steps2.areaKm2)} km². The area of the one horizon after the merger is worked out the same way at the next stage.</> : <>For black hole 1 ({steps1.massSolar} Suns): GM/c² is a length, {one(steps1.gmKm)} km (half the horizon radius of a black hole that is not spinning). Squared, that is {thousands(steps1.gmSquaredKm2)} km². Times 16π (about {one(steps1.sixteenPi)}), that is {thousands(steps1.areaKm2)} km² (a spin of 0 gives a spin factor of 1; Black Holes Experiment 8’s formula). Black hole 2 ({steps2.massSolar} Suns) gives {thousands(steps2.areaKm2)} km². For the one black hole after ({stepsAfter.massSolar} Suns, spin {stepsAfter.spin}): GM/c² = {one(stepsAfter.gmKm)} km; squared, {thousands(stepsAfter.gmSquaredKm2)}; times 16π, {thousands(stepsAfter.gmSquaredKm2 * stepsAfter.sixteenPi)}; times the spin factor {two(stepsAfter.h)} (it is 1 for no spin and gets smaller as the spin rises), {thousands(stepsAfter.areaKm2)} km².</>}
                lookFor={[
                  ...(stage >= 3 ? [{ look: 'the BEFORE bar, made of a blue and a violet segment.', means: `the two horizons together had an area of ${thousands(area.totalBeforeKm2)} km². The blue black hole, a little heavier, has the bigger area (${thousands(area.segmentsBeforeKm2[0])} against ${thousands(area.segmentsBeforeKm2[1])}).`, matters: 'this total is the number that the area after is compared with.' }] : []),
                  ...(stage >= 4 ? [
                    { look: 'the red AFTER bar against the grey dashed line.', means: `the area after is ${thousands(area.afterKm2)} km², which is ${two(change.ratio)} times the area before, ${Math.round(change.percent)} percent more.`, matters: `the mass fell by ${one(mass.radiatedPercent)} percent (Picture 1), but this area rose. The two do not move together, and the tutor goes through why.` },
                    { look: 'the orange ticks beside each bar.', means: `the press release’s rounded figures. About ${thousands(area.pressBeforeKm2)} is within ${one(Math.abs(area.pressBeforeKm2 / area.totalBeforeKm2 - 1) * 100)} percent of the BEFORE bar. About ${thousands(area.pressAfterKm2)} is ${one((area.pressAfterKm2 / area.afterKm2 - 1) * 100)} percent above the AFTER bar.`, matters: 'the scientists’ own figure for the area after was not read for this page, so we do not know whether the press rounded up or the paper’s value differs. Either way the area after is larger than the area before.' },
                    { look: 'your white marks beside the real bars.', means: 'your two guesses, drawn on the same scale as the real result.', matters: 'you can compare each guess with the real bar yourself. This picture does not say whether a guess was right: the tutor does that later.' },
                  ] : []),
                ]}
                whereFrom={<><strong>Measured:</strong> the masses and the spins of the black holes (by the LIGO, Virgo and KAGRA teams, as for Picture 1). <strong>Calculated here:</strong> every area on the bars, with the formula from Black Holes Experiment 8. The two black holes before are taken as not spinning; if both spun at the paper’s upper limit of {mass.spinBeforeMax}, the total before would be {one(area.spinsLowerBeforeByPercent)} percent lower, which does not change what you see. The scientists’ own areas, with their give-or-take, are in their paper, which was not read for this page. <strong>From a press release:</strong> the two orange ticks. <strong>Imagined for the question:</strong> nothing.</>}
              />
            </div>
          )}

          {stage >= 5 && (
            <div>
              <PictureThree />
              <CaptionBlock
                title="Picture 3"
                intro={`It asks a question the real merger did not have to answer: how much mass could a merger give off as gravitational waves before the area of the one horizon after it would be smaller than the area before? Across the bottom is the share of the mass that is radiated, in percent. Up the side is the area after divided by the area before, so 1 means the same area and more than 1 means a larger area.`}
                bullets={[
                  <><strong>The amber curve</strong> is the area after a merger that radiates the share shown, if the black hole after spins at {ceiling.spin} (GW250114’s). <strong>The blue curve</strong> is the same if the black hole after does not spin at all.</>,
                  <><strong>The red dashed line</strong> at 1 is where the area after equals the area before. <strong>The faint red region</strong> below it is where the area after would be smaller than the area before.</>,
                  <><strong>The two short dashed vertical lines</strong> drop from where each curve crosses the red line, and say at what share that happens.</>,
                  <><strong>The green dot</strong> is the real merger, GW250114.</>,
                  <>No white mark is drawn here, because neither of your guesses is about this picture.</>,
                ]}
                worked={<>Suppose a merger radiated 10 percent of the mass instead of {one(mass.radiatedPercent)}. The black hole after would weigh {one(trial10.massAfterSolar)} Suns. With a spin of {ceiling.spin} its area would be {two(trial10.ratio)} times the area before. At 30 percent it would weigh {one(trial30.massAfterSolar)} Suns, and its area would be {two(trial30.ratio)} times the area before: below 1, so below the line.</>}
                lookFor={[
                  { look: 'the amber curve, and how it falls from left to right.', means: `with nothing radiated, the area after would be ${two(ceiling.measuredSpin[0].ratio)} times the area before, and each extra percent radiated lowers it: ${two(trial10.ratio)} times at 10 percent, ${two(trial30.ratio)} times at 30.`, matters: 'a black hole that has given off more of its mass has a smaller area, so there is a limit to how much a merger can give off.' },
                  { look: 'where the two curves cross the red dashed line, at the two vertical markers.', means: `at ${one(ceiling.ceilingMeasuredSpinPercent)} percent (spin ${ceiling.spin} after) or ${one(ceiling.ceilingNoSpinPercent)} percent (no spin after) the area after would exactly equal the area before. Radiating more would make it smaller.`, matters: `the real merger radiated ${one(ceiling.real.sharePercent)} percent, about a fifth of the lower of the two, so it was far from the edge.` },
                  { look: 'the blue curve against the amber one.', means: 'a black hole that spins has a smaller area than one of the same mass that does not, so the spin after the merger changes where the limit is.', matters: 'the mass and the spin after the merger both come from the signal, and both are needed to know the area.' },
                  { look: 'the green dot.', means: `GW250114 sits on the amber curve at ${one(ceiling.real.sharePercent)} percent, with an area ${two(ceiling.real.ratio)} times the area before, well above the red dashed line.`, matters: 'the real merger was nowhere near the line; the line matters for what a merger could do, not for what this one did.' },
                ]}
                whereFrom={<><strong>Calculated here, entirely:</strong> from the published mass before ({one(mass.totalBeforeSolar)} Suns) and the area formula, for each share and each final spin. Nothing on this picture was measured except GW250114’s masses and its final spin, which the calculation starts from. <strong>Imagined for the question:</strong> the shares other than {one(ceiling.real.sharePercent)} percent are trial values, and no real merger is claimed to have radiated any of them. The {one(ceiling.ceilingNoSpinPercent)} percent for no spin is the simplest case of a limit that Hawking found, and it has not been checked against a source for this page.</>}
              />
            </div>
          )}

          {done && (
            <div style={{ fontSize: '0.875rem', marginTop: '1rem' }}>
              <p style={paragraph}>
                <strong>The papers and releases behind these numbers.</strong> They were held back until now, because they give the numbers that your predictions were about. Links open in
                a new tab.
              </p>
              <ul style={{ margin: '0 0 0.75rem', paddingLeft: '1.25rem' }}>
                <li>
                  <ExternalLink href="https://arxiv.org/abs/2509.08054">LIGO, Virgo and KAGRA: “GW250114: testing Hawking’s area law and the Kerr nature of black holes”</ExternalLink>: the
                  scientists’ paper (Physical Review Letters, September 2025), where the masses, the spins and the area test are reported. It is a research paper, and harder reading than
                  the pages above.
                </li>
                <li>
                  <ExternalLink href="https://arxiv.org/abs/2509.08099">LIGO, Virgo and KAGRA: “Black hole spectroscopy and tests of general relativity with GW250114”</ExternalLink>: a
                  companion paper on the same signal, about the way the new black hole “rings” after the merger.
                </li>
                <li>
                  <ExternalLink href="https://www.birmingham.ac.uk/news/2025/hawking-and-kerr-black-hole-theories-confirmed-by-gravitational-wave">
                    University of Birmingham: “Hawking and Kerr black hole theories confirmed by gravitational wave”
                  </ExternalLink>
                  : a plain news release that gives the areas before and after as the “size of the United Kingdom” and about 400,000 square kilometres.
                </li>
              </ul>
            </div>
          )}
        </div>

        {done && (
          <div style={{ marginTop: '2.5rem', paddingTop: '1.5rem', borderTop: `6px solid ${PART_TWO_COLOR}` }}>
            <h3 style={{ margin: '0 0 0.5rem', color: PART_TWO_COLOR }}>Part 2: Now try it yourself</h3>
            <p style={{ ...paragraph, fontSize: '0.875rem', color: 'var(--text-muted)' }}>
              <strong>What we are about to do.</strong> The real merger gave off one share of its mass and ended with one spin. Here you can choose other shares and other spins, and watch
              one drawing show the area that such a black hole would have, beside the real area before. The real pictures and tables above do not change, and your two guesses do not
              change this drawing: only the two settings below do.
            </p>
            <p style={{ ...paragraph, fontSize: '0.875rem', color: 'var(--text-muted)' }}>
              <strong>These are your own trial values, not real measurements.</strong> Each button is a number to try. For example, if you choose {SHARE_CHOICES_PERCENT[3]} percent,
              the black hole after weighs {SHARE_CHOICES_PERCENT[3]} percent less than the two before it put together: {one(mass.totalBeforeSolar)} × (1 − {SHARE_CHOICES_PERCENT[3] / 100}) ={' '}
              {one(trialMerger(SHARE_CHOICES_PERCENT[3] / 100, 0).massAfterSolar)} Suns. The area after is then worked out from that mass and the spin you choose.
            </p>
            <p style={{ ...paragraph, fontSize: '0.875rem', color: 'var(--text-muted)' }}>
              <strong>One thing to know.</strong> In this experiment the share radiated and the spin after are two separate settings. In a real merger they come out together, from
              the merger itself, which this page does not calculate. It does not check whether a real merger could give off the share you choose and end with the spin you choose.
            </p>

            {(
              [
                {
                  title: 'How much of the mass does the merger give off as gravitational waves? (percent)',
                  choices: SHARE_CHOICES_PERCENT.map((v) => ({ value: v, label: v === realShare ? `${v} percent (GW250114’s)` : `${v} percent` })),
                  value: shareChoice,
                  set: setShareChoice,
                },
                {
                  title: 'How fast does the black hole after the merger spin? (0 means not spinning; the highest possible is just under 1)',
                  choices: SPIN_CHOICES.map((v) => ({ value: v, label: v === GW250114.finalSpin ? `${v} (GW250114’s)` : `${v}` })),
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
              intro={`It shows the area of the one horizon after a merger with your two trial values, beside the real area before. It uses the same kind of bars as Picture 2, on a scale that stops at ${thousands(TRIAL_AXIS_MAX_KM2)} km². It is imagined for the question: it is not a real merger.`}
              bullets={[
                <><strong>The grey bar</strong> is the real total area before, the same as the BEFORE bar in Picture 2. <strong>The grey dashed line</strong> carries its height across.</>,
                <><strong>The pink-purple bar</strong> is your trial: the area of the one horizon after, for the share and the spin you chose. It moves when you change a setting. Pink-purple always means “imagined for the question”, and white is kept for your guesses.</>,
                <><strong>The green tick</strong> across it is the real area after, from Picture 2 ({thousands(areaPicture().afterKm2)} km²), so you can compare your trial with the real event.</>,
                <><strong>The pink-purple words</strong> at the right give the mass after, the spin and the area after for your settings, worked out from the module. <strong>The words at the bottom</strong> say at what share the area after would equal the area before, for the spin you chose.</>,
              ]}
              worked={<>Your trial is {one(mine.share * 100)} percent radiated with a spin of {mine.spinAfter}. The mass after is {one(mass.totalBeforeSolar)} × (1 − {mine.share.toFixed(3)}) = {one(mine.massAfterSolar)} Suns. GM/c² is {one(mineSteps.gmKm)} km; squared, {thousands(mineSteps.gmSquaredKm2)}; times 16π, {thousands(mineSteps.gmSquaredKm2 * mineSteps.sixteenPi)}; times the spin factor {two(mineSteps.h)}, {thousands(mineSteps.areaKm2)} km². Divided by the area before ({thousands(area.totalBeforeKm2)}), that is {two(mine.ratio)} times, and {two(trialOverRealAfter(mine))} times the real area after.</>}
              lookFor={[
                { look: 'the pink-purple bar against the grey dashed line.', means: `for your settings the area after is ${two(mine.ratio)} times the area before, ${mine.areaWentDown ? 'below the line: smaller than before' : 'above the line: larger than before'}.`, matters: 'this is the question of the whole experiment, asked for a merger you chose. Try the largest share and the highest spin together, and then the smallest share and no spin, and see how far the bar can move.' },
                { look: 'the pink-purple bar against the green tick.', means: `your trial area is ${two(trialOverRealAfter(mine))} times the real area after. At ${one(realShare)} percent and a spin of ${GW250114.finalSpin} the two are nearly the same, as they should be (${one(realShare)} is the real ${two(radiatedFraction() * 100)} rounded).`, matters: 'it shows how much the real merger’s numbers matter: a different share or a different spin gives a visibly different area.' },
                { look: 'the sentence at the bottom about the share where the area would equal the area before.', means: `at a spin of ${mine.spinAfter} that share is ${one(mine.ceiling * 100)} percent, and your trial is ${one(Math.abs(ceilingHeadroomPercent(mine)))} percentage points ${ceilingHeadroomPercent(mine) >= 0 ? 'below' : 'above'} it.`, matters: 'it is the same ceiling as in Picture 3, now for the spin you chose. A trial above it puts the bar below the dashed line.' },
              ]}
              whereFrom={<><strong>Real:</strong> the grey bar, the dashed line and the green tick are the same as in Picture 2 (calculated here from the published masses and spins, which were measured). <strong>Imagined for the question:</strong> the pink-purple bar and its numbers are your trial values, worked out with the same formula. They are not a real merger, and the page does not check that a real merger could give off the share you chose and end with the spin you chose.</>}
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
                  <strong>Strong evidence</strong> (from one very clear event) that the total horizon area after the merger GW250114 was larger than the total before it. The teams could
                  say this to a high but not exactly known degree of confidence, and this page does not give a number for it, because the sources it summarises give different ones.
                </li>
                <li>
                  What was tested is <strong>a prediction of general relativity</strong>, made by Stephen Hawking in 1971. It is not a new law of nature.
                </li>
                <li>
                  The areas come from masses and spins that the teams fitted to the signal, so they carry a give-or-take. The press and the formula disagree by about{' '}
                  {one(cu.areaAfter.pressOverFormulaPercent)} percent about the area after, and this page has not seen the paper’s own figure.
                </li>
              </ul>
            </div>

            <div style={{ marginBottom: '1.5rem', fontSize: '0.875rem' }}>
              <strong>Your predictions, beside the results.</strong> These are your guesses, shown again so that you can find the real number for each. They are not marked here.
              <ul style={{ margin: '0.5rem 0 0', paddingLeft: '1.25rem' }}>
                <li>
                  <strong>Prediction 1</strong> (which way did the total area go?): you guessed <strong>{directionGuess ? DIRECTION_LABELS[directionGuess].toLowerCase() : '…'}</strong>. The real
                  direction is in Table 1, in the row “Which way the area went”.
                </li>
                <li>
                  <strong>Prediction 2</strong> (by how much?): you guessed <strong>{sizeGuess !== null ? `about ${sizeGuess} times the area before` : '…'}</strong>. The real number is in Table 1, in the row
                  “The area after as a multiple of the area before”.
                </li>
              </ul>
            </div>

            <p style={paragraph}>
              <strong>How to read these results.</strong> A table of numbers is like a blood test: it means little until someone says what each number is and what it is compared
              with. So each table has a note under it, called “What this table tells us”, that says what the numbers are, what they mean here, why they matter, and how sure we can be of
              them. The first table is a check-up: it sets each number beside something to compare it with, and says in plain words what the comparison shows. It does not say “good” or
              “bad”, because none of these numbers has an accepted range.
            </p>

            <p style={{ marginTop: '1.5rem', marginBottom: '0.5rem', fontWeight: 'bold' }}>Check-up: what we found, and what it can be compared with</p>
            <ResultsTable
              minWidth={560}
              head={['What we compare', 'The reference', 'What we found', 'How to read it']}
              rows={[
                [
                  'The mass after the merger, against the mass before',
                  `before: ${cu.mass.beforeSolar.toFixed(1)} Suns (${mass.massesBeforeSolar[0]} + ${mass.massesBeforeSolar[1]})`,
                  `after: ${cu.mass.afterSolar} Suns`,
                  `Less, by ${one(cu.mass.lessByPercent)} percent. That is the ${one(mass.radiatedSolar)} Suns’ worth that left as waves.`,
                ],
                [
                  'The area before: this page’s formula, against the press release',
                  `press release: about ${thousands(cu.areaBefore.pressKm2)} km²`,
                  `formula: ${thousands(cu.areaBefore.formulaKm2)} km²`,
                  `The press figure is ${one(cu.areaBefore.pressOverFormulaPercent)} percent higher than the formula’s.`,
                ],
                [
                  'The area after: this page’s formula, against the press release',
                  `press release: about ${thousands(cu.areaAfter.pressKm2)} km²`,
                  `formula: ${thousands(cu.areaAfter.formulaKm2)} km²`,
                  `The press figure is ${one(cu.areaAfter.pressOverFormulaPercent)} percent higher than the formula’s. We do not know which is nearer the paper’s own figure.`,
                ],
                [
                  'How the area changed',
                  `press figures: ${two(cu.areaChange.pressRatio)} times the area before`,
                  `formula: ${two(cu.areaChange.formulaRatio)} times the area before`,
                  `More: by ${Math.round(cu.areaChange.formulaPercent)} percent by the formula, and by ${Math.round(cu.areaChange.pressPercent)} percent by the press figures. Both ways, more.`,
                ],
                [
                  'The share of the mass radiated, against the ceiling',
                  `ceiling at a spin of ${mass.spinAfter}: ${one(cu.ceiling.ceilingPercent)} percent`,
                  `found: ${one(cu.ceiling.sharePercent)} percent`,
                  `Under the ceiling: ${one(cu.ceiling.sharePercent)} ÷ ${one(cu.ceiling.ceilingPercent)} = ${two(cu.ceiling.shareOverCeiling)}, about a fifth of the way up.`,
                ],
              ]}
            />
            <NoteList
              items={[
                { name: 'The mass row', what: 'it compares the mass of the black hole after with the two before put together (Picture 1).', means: `the new black hole weighs ${one(cu.mass.lessByPercent)} percent less, ${one(mass.radiatedSolar)} Suns’ worth.`, matters: 'it is the first piece of the puzzle: mass went down.', sure: `the masses are fitted from the signal, and each has a give-or-take that this page does not show; the Wikipedia summary it comes from gives the energy radiated as ${one(mass.radiatedSolar)} ± ${one(GW250114.radiatedUncertaintySolar)} Suns.` },
                { name: 'The two area rows', what: 'they set the areas calculated here beside the rounded figures in the press release.', means: `the two sets of numbers differ by ${one(cu.areaBefore.pressOverFormulaPercent)} percent for the area before and by ${one(cu.areaAfter.pressOverFormulaPercent)} percent for the area after.`, matters: 'it shows that the areas are not known to the last digit by this page.', sure: 'the scientists’ own areas, with their give-or-take, are in the paper, which was not read for this page; so the page cannot say which figure is nearer the paper’s.' },
                { name: 'The change row', what: 'the area after divided by the area before, by the formula and by the press figures.', means: `${two(cu.areaChange.formulaRatio)} or ${two(cu.areaChange.pressRatio)}: the area is more than one and a half times as large.`, matters: 'whichever figure you use, the area after is larger, and that is the answer to the question of the experiment.', sure: 'the direction is the same in both; the size differs by about a tenth.' },
                { name: 'The ceiling row', what: 'the share of the mass that the real merger radiated, set beside the largest share that the area formula would allow at the measured spin (Picture 3).', means: `${one(cu.ceiling.sharePercent)} percent against ${one(cu.ceiling.ceilingPercent)}, about ${one(cu.ceiling.ceilingOverShare)} times below.`, matters: 'the real merger was far from the edge of what the formula allows.', sure: 'the ceiling is arithmetic on published numbers, not a measurement, and it assumes the two black holes before did not spin.' },
              ]}
            />

            <p style={{ marginTop: '2rem', marginBottom: '0.5rem', fontWeight: 'bold' }}>Table 1: before and after</p>
            <ResultsTable
              minWidth={600}
              head={['Quantity', 'Value', 'Where it comes from', 'Your guess']}
              rows={[
                ['Mass of black hole 1', `${mass.massesBeforeSolar[0]} Suns`, 'measured (fitted from the signal)', ''],
                ['Mass of black hole 2', `${mass.massesBeforeSolar[1]} Suns`, 'measured (fitted from the signal)', ''],
                ['Mass of the one black hole after', `${mass.massAfterSolar} Suns`, 'measured (fitted from the signal)', ''],
                ['Mass-energy that left as waves', `${one(mass.radiatedSolar)} Suns’ worth (${one(mass.radiatedPercent)} percent)`, `calculated here (${one(mass.totalBeforeSolar)} − ${mass.massAfterSolar})`, ''],
                ['Spin of each black hole before', `small, at most about ${mass.spinBeforeMax}`, 'measured (fitted from the signal)', ''],
                ['Spin of the black hole after', String(mass.spinAfter), 'measured (fitted from the signal)', ''],
                ['Horizon area of black hole 1', `${thousands(area.segmentsBeforeKm2[0])} km²`, 'calculated here (the formula; spin 0)', ''],
                ['Horizon area of black hole 2', `${thousands(area.segmentsBeforeKm2[1])} km²`, 'calculated here (the formula; spin 0)', ''],
                ['Total area before', `${thousands(area.totalBeforeKm2)} km²`, 'calculated here', ''],
                ['Area of the one horizon after', `${thousands(area.afterKm2)} km²`, `calculated here (the formula; spin ${mass.spinAfter})`, ''],
                ['Which way the area went', `up: ${thousands(area.afterKm2)} is more than ${thousands(area.totalBeforeKm2)}`, 'calculated here', directionGuess ? `Your Prediction 1: ${DIRECTION_LABELS[directionGuess].toLowerCase()}` : ''],
                ['The area after as a multiple of the area before', `${two(change.ratio)} (${Math.round(change.percent)} percent more); press figures ${two(pressAreaChange().ratio)}`, 'calculated here', sizeGuess !== null ? `Your Prediction 2: about ${sizeGuess} times` : ''],
              ]}
            />
            <NoteList
              items={[
                { name: 'The masses and spins', what: 'the numbers the teams fitted to the signal: two masses and two small spins before, and one mass and one spin after.', means: `the black holes were almost the same weight (${mass.massesBeforeSolar[0]} and ${mass.massesBeforeSolar[1]} Suns), and the one after spins at ${mass.spinAfter}, on a scale where 1 is the fastest possible.`, matters: 'the whole test rests on these numbers, because the areas are worked out from them.', sure: 'each has a give-or-take, which this page leaves out and the paper gives; the page’s values come from summaries of the paper.' },
                { name: 'The areas', what: 'the horizon areas worked out here with the formula from Black Holes Experiment 8, from those masses and spins.', means: `${thousands(area.totalBeforeKm2)} km² before and ${thousands(area.afterKm2)} km² after: the area after is ${two(change.ratio)} times the area before.`, matters: 'the area is the quantity that Hawking’s rule is about, so these are the numbers the test turns on.', sure: `taking the two black holes before as not spinning is a choice; the paper’s upper limit of ${mass.spinBeforeMax} for each spin would lower the total before by ${one(area.spinsLowerBeforeByPercent)} percent, which does not change which way the area went.` },
                { name: 'The two rows with your guesses', what: 'the real direction and the real size, beside the guesses you made before the run.', means: `the real direction is up, and the real size is ${two(change.ratio)} times (${two(pressAreaChange().ratio)} by the press figures).`, matters: 'they are the numbers that your two predictions were about, so you can compare your guess with them yourself.', sure: 'this page shows the guess only and does not mark it. The tutor does that.' },
              ]}
            />

            <p style={{ marginTop: '2rem', marginBottom: '0.5rem', fontWeight: 'bold' }}>Table 2: the sources behind the numbers</p>
            <ResultsTable
              minWidth={640}
              head={['Source', 'What it gave this page', 'What kind of source it is', 'How strong it is, and what was read']}
              rows={[
                ['LIGO, Virgo and KAGRA, “GW250114: testing Hawking’s area law and the Kerr nature of black holes”, Physical Review Letters 135, 111403 (September 2025)', 'the masses, the spins and the area test', 'a peer-reviewed research paper by the collaborations that made the measurement', 'the strongest source here. Only summaries of its abstract were read for this page: its areas, uncertainties and confidence figure were not.'],
                ['LIGO, Virgo and KAGRA, “Black hole spectroscopy and tests of general relativity with GW250114”, arXiv:2509.08099 (Physical Review Letters 136, 2026)', 'no numbers; background about the same signal', 'a second research paper on the same event', 'its abstract was read. It is about the way the new black hole rings after the merger.'],
                ['University of Birmingham, news release, 2025', `the rounded areas: about ${thousands(area.pressBeforeKm2)} and about ${thousands(area.pressAfterKm2)} km²`, 'a university news release', 'plain and easy to read, but a news release rounds numbers, and its figure for the area after is above the formula’s.'],
                ['An encyclopaedia summary (Wikipedia, “GW250114”)', 'a way to find the masses, the final mass, the spins and the energy radiated', 'a general reference that cites the paper’s supplement', 'weaker than the paper. Each number from it should be checked against the paper.'],
                ['Hawking (1971), Physical Review Letters 26, 1344; and a 2026 Nature paper on the horizon of this event', 'the date of Hawking’s rule only', 'a research paper', 'not read. Only the date and the title were taken, from summaries.'],
              ]}
            />
            <NoteList
              items={[
                { name: 'The table', what: 'a list of where each number on this page came from and how much weight it can bear.', means: 'only one source here is a research paper by the people who made the measurement, and its own numbers were not read for this page; the other sources are a news release and a general reference.', matters: 'it lets you see how far to trust each number, and where to look to check it.', sure: 'so the page’s own figures are as good as its summaries, no better; the direction of the change is firm in every source, and the sizes are not.' },
              ]}
            />

            <p style={{ marginTop: '2rem', marginBottom: '0.5rem', fontWeight: 'bold' }}>Table 3: what each claim rests on</p>
            <ResultsTable
              minWidth={640}
              head={['Claim', 'Measured', 'Calculated here', 'Assumed']}
              rows={[
                ['The masses and spins', 'fitted by the teams from the signal', 'nothing', 'that the signal comes from two black holes merging and general relativity describes it'],
                ['The horizon areas', 'the masses and the spins that go in', 'the areas, with the formula from Black Holes Experiment 8', 'that the two black holes before did not spin (a small effect)'],
                ['The area after is larger than the area before', 'the masses and spins that go in', 'the two areas and their ratio', 'that the formula holds for these black holes'],
                ['The ceiling on the share radiated', 'the mass before and the spin after', 'the share at which the areas would be equal', 'that the share and the spin can be chosen separately (they are not separate in a real merger)'],
              ]}
            />
            <NoteList
              items={[
                { name: 'The table', what: 'a sorting of each claim into what was measured, what was worked out here and what was taken for granted.', means: 'the only measured things are the masses and the spins; the areas, the ratio and the ceiling are calculated from them with one formula.', matters: 'a calculation can only be as good as the numbers that go into it, and it is useful to know which step is which.', sure: 'the paper’s own area test uses its own fits and gives uncertainties, which this page has not read; this page repeats the calculation in a simpler form.' },
              ]}
            />
            <p style={{ ...paragraph, fontSize: '0.75rem', color: 'var(--text-muted)' }}>
              No table here follows your settings from Part 2, because those settings only move the drawing in Part 2.
            </p>
          </div>
        )}

        {/* Part 4, the tutor (after the results): observe, compare with the predictions, a conceptual question, then the explanation. DRAFT wording for the owner's approval. */}
        {done && directionGuess !== null && sizeGuess !== null && (
          <div style={{ marginTop: '2.5rem', paddingTop: '1.5rem', borderTop: `6px solid ${PART_FOUR_COLOR}` }}>
            <h3 style={{ margin: '0 0 0.5rem', color: PART_FOUR_COLOR }}>Part 4: The tutor</h3>
            <p style={{ ...paragraph, fontSize: '0.875rem', color: 'var(--text-muted)' }}>
              <strong>What we are about to do.</strong> You have now seen the pictures and the tables. This last part is a short conversation with a tutor, to help you make sense of them.
            </p>
            <ul style={{ margin: '0 0 0.75rem', paddingLeft: '1.25rem', fontSize: '0.875rem', color: 'var(--text-muted)' }}>
              <li>
                <strong>Three questions, one at a time.</strong> First, the tutor asks what you see in Pictures 1 and 2. Second, it asks you to compare your own guesses (the white marks) with the real
                results. Third, it asks one bigger question, about how a black hole differs from a raindrop. Type a few words for each. Nothing is graded, and a short answer is fine.
              </li>
              <li>
                <strong>No verdict until you have replied.</strong> The tutor will not say whether your guesses were right until you have answered all three, so you can think it through first.
              </li>
              <li>
                <strong>Then the explanation.</strong> The tutor marks each of your two predictions as matched or not matched, and then goes through what lies behind the numbers in seven short
                parts: how the area is worked out, why it rose although the mass fell, what the area theorem says, the ceiling on what a merger can radiate, what was measured and how sure we are,
                why physicists care, and what was and was not shown. Some parts use a worked sum or an everyday comparison.
              </li>
            </ul>
            <HorizonAreaLawTutor directionPrediction={directionGuess} sizePrediction={sizeGuess} onExplained={onTutorComplete} />
          </div>
        )}
      </div>
    </div>
  )
}
