import { useEffect, useState } from 'react'
import type { ReactNode } from 'react'
import {
  CHANDRASEKHAR_LIMIT_SOLAR_MASSES,
  distanceErrorPercent,
  EARTH_RADIUS_KM,
  KM_PER_PARSEC,
  distanceErrorWorkedExample,
  LIGHT_YEARS_PER_PARSEC,
  runWhiteDwarfExplosion,
  shellSpeedRangeKmS,
  shellSpeedWorkedExample,
  twoAnalysesComparison,
  WHITE_DWARF_EXPLOSION,
} from '../physics/whiteDwarfExplosion'
import type { SizeAnswer, SpeedAnswer } from '../physics/whiteDwarfExplosion'
import { ReferencePanel } from './EnergyMomentumExperiment'
import { WhiteDwarfExplosionTutor } from './WhiteDwarfExplosionTutor'
import { LookForList, ResultsTable } from './WideBinariesExperiment'
import type { LookFor } from './WideBinariesExperiment'

// Cosmic Horizons, Experiment 14 (docs/experiments/cosmic-horizons/14-what-makes-a-white-dwarf-explode.md).
// Step 6 builds the tutor (WhiteDwarfExplosionTutor.tsx) and, in App, the chapter summary.
// Step 5 builds the three controls (the white dwarf's weight, the remnant's age and a brightness difference), shown after the run, which add white marks to Pictures 1 and 3, and the
// results with the reading guide (the check-up, three tables with notes, the predictions beside the results and the held-back paper links).
// Step 4 builds the five-stage run and the three pictures, each with a guide: Picture 1 (white dwarf sizes and the limit) at stage 1, Picture 2 (the two routes) at stages 2 and 3,
// Picture 3 (the two calcium shells, then the distance strip) at stages 4 and 5. The controls, the results and the tutor are later steps.
// Step 3 builds the two predictions (their answer buttons, Run gated on both, and Start over); Run only records the predictions, because the run is a later step.
// Step 2 (the interface skeleton) builds the page's skeleton: the status line, the introduction with its new-word list, its assumptions and its "Want to know more?" links,
// one illustration (a white dwarf and a close pair) with its guide, and the collapsed "Words and formulas" panel. The two predictions, the run, the three pictures, the
// controls, the results and the tutor are later steps. All wording is draft for the owner's line-by-line approval (CLAUDE.md §28.1), written to the standard of §29. The
// introduction does not give the white dwarf's mass in the remnant, the shells' radii or their speed (those are what the predictions and the run show, §12). The interface only
// displays numbers from src/physics (CLAUDE.md §9).

const VIEW_WIDTH = 560
const TEXT_COLOR = '#e2e8f0'
const MUTED_COLOR = '#94a3b8'
const CORE_COLOR = '#93c5fd' // light blue: the carbon-oxygen core of the white dwarf
const HELIUM_COLOR = '#fcd34d' // yellow: the helium layer
const PARTNER_COLOR = '#fb923c' // orange: the partner star
const GAS_COLOR = '#c084fc' // purple: gas flowing from the partner to the white dwarf

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
function Arrow({ x1, y1, x2, y2, color }: { x1: number; y1: number; x2: number; y2: number; color: string }) {
  const angle = Math.atan2(y2 - y1, x2 - x1)
  const head = 6
  const a1 = angle + Math.PI - 0.45
  const a2 = angle + Math.PI + 0.45
  return (
    <g>
      <line x1={x1} y1={y1} x2={x2} y2={y2} stroke={color} strokeWidth={2.5} />
      <path d={`M ${x2} ${y2} L ${x2 + head * Math.cos(a1)} ${y2 + head * Math.sin(a1)} L ${x2 + head * Math.cos(a2)} ${y2 + head * Math.sin(a2)} Z`} fill={color} />
    </g>
  )
}

// ---- Illustration: a white dwarf, and a white dwarf in a close pair (not to scale; it shows the idea, not SNR 0509-67.5) ----
function WhiteDwarfDrawing() {
  const height = 300
  const cy = 140
  return (
    <svg
      width={VIEW_WIDTH}
      height={height}
      viewBox={`0 0 ${VIEW_WIDTH} ${height}`}
      style={svgStyle}
      role="img"
      aria-label="Illustration, not to scale, in two panels. Panel 1, a white dwarf: a ball drawn as a light blue core with a thin yellow layer round the outside, labelled carbon-oxygen core and helium layer. Panel 2, a white dwarf in a close pair: a small white dwarf on the right, a larger orange partner star on the left, and a purple arrow showing gas flowing from the partner star onto the white dwarf."
    >
      <text x={20} y={22} fill={TEXT_COLOR} fontSize="13" fontWeight="bold">
        Illustration: a white dwarf, and a white dwarf in a close pair
      </text>

      {/* Panel 1: a white dwarf. */}
      <SvgLines x={140} y={48} lines={['1. A white dwarf']} fill={TEXT_COLOR} bold anchor="middle" size={12} />
      <circle cx={140} cy={cy} r={68} fill={HELIUM_COLOR} fillOpacity={0.9} stroke={HELIUM_COLOR} strokeWidth={2} />
      <circle cx={140} cy={cy} r={58} fill={CORE_COLOR} stroke={CORE_COLOR} strokeWidth={2} />
      <SvgLines x={140} y={cy - 2} lines={['carbon-oxygen', 'core']} fill="#0b1020" bold anchor="middle" />
      <SvgLines x={205} y={cy - 78} lines={['helium layer']} fill={HELIUM_COLOR} bold />
      <line x1={203} y1={cy - 80} x2={176} y2={cy - 62} stroke={HELIUM_COLOR} strokeWidth={1.5} />
      <SvgLines x={140} y={cy + 100} lines={['the small, dense ball left by a star', 'like the Sun, with a thin helium layer outside']} fill={MUTED_COLOR} anchor="middle" />

      {/* Panel 2: a close pair. */}
      <SvgLines x={400} y={48} lines={['2. A white dwarf in a close pair']} fill={TEXT_COLOR} bold anchor="middle" size={12} />
      <circle cx={340} cy={cy} r={52} fill={PARTNER_COLOR} fillOpacity={0.85} stroke={PARTNER_COLOR} strokeWidth={2} />
      <SvgLines x={340} y={cy + 4} lines={['partner star']} fill="#0b1020" bold anchor="middle" />
      <circle cx={470} cy={cy} r={22} fill={CORE_COLOR} stroke={HELIUM_COLOR} strokeWidth={4} />
      <SvgLines x={470} y={cy + 40} lines={['white dwarf']} fill={CORE_COLOR} bold anchor="middle" />
      <Arrow x1={398} y1={cy - 6} x2={440} y2={cy - 6} color={GAS_COLOR} />
      <SvgLines x={418} y={cy - 38} lines={['gas flows', 'across']} fill={GAS_COLOR} bold anchor="middle" />
      <SvgLines x={400} y={cy + 100} lines={['the white dwarf can take gas from its partner']} fill={GAS_COLOR} bold anchor="middle" />

      <SvgLines x={20} y={height - 8} lines={['Not to scale: a white dwarf is far smaller than the star beside it, and the layers are only a sketch.']} fill={MUTED_COLOR} />
    </svg>
  )
}

const lookForDrawing: LookFor[] = [
  {
    look: 'panel 1: the light blue ball and the thin yellow layer round it.',
    means: 'a white dwarf is mostly a ball of carbon and oxygen. Outside it can be a thin layer of helium, a different gas that the white dwarf has gathered or kept.',
    matters: 'the two layers are what the two routes to an explosion will turn on: one route lights the centre, and the other lights this outer layer first.',
  },
  {
    look: 'panel 2: the small white dwarf, the larger orange star and the purple arrow between them.',
    means: 'a white dwarf can have a partner star close by. Gas from the partner can flow across to the white dwarf and pile up on it.',
    matters: 'this is how a white dwarf can gain weight, or collect the helium layer, so a close partner is part of every story about why one explodes.',
  },
]

// ---- The run: five named stages. The timer only paces the display; no number depends on it (CLAUDE.md §11). ----
const STAGE_MS = 2600
const LAST_STAGE = 5
const STAGE_NAMES = ['', 'How big is a white dwarf?', 'Route 1: growing to the limit', 'Route 2: a double detonation', 'The remnant’s two calcium shells', 'Why distances care']

const LIMIT_COLOR = '#f87171' // red: the limit
const EARTH_COLOR = '#e2e8f0' // pale: the Earth, for scale
const SHELL_COLOR = '#34d399' // green: the calcium shells
const FLASH_COLOR = '#fde047' // bright yellow: ignition
const ERROR_COLOR = '#fb923c' // orange: a distance error
const PICTURE_THREE_PX_PER_PC = 80 // the drawing's scale in Picture 3
const YOURS_COLOR = '#ffffff' // white: the learner's own trial value

interface YoursOne {
  massSolar: number
  radiusEarths: number
  radiusKm: number
}
interface YoursThree {
  ageYears: number
  innerSpeedKmS: number
  outerSpeedKmS: number
  brightnessChange: number
  distanceErrorPercent: number
}

const thousandsComma = (value: number): string => Math.round(value).toLocaleString('en-US')
const roundTo = (value: number, step: number): number => Math.round(value / step) * step

// ---- Picture 1: how big is a white dwarf, and where is its limit? ----
function PictureOne({ yours }: { yours: YoursOne | null }) {
  const d = WHITE_DWARF_EXPLOSION
  const height = 420
  const cy = 125
  const px = 44 // pixels for one Earth radius
  const xs = [190, 295, 385, 465]
  const runs = d.pictureMassesSolar.map((m) => runWhiteDwarfExplosion({ massSolar: m }))
  const scaleX = (m: number) => 40 + (m / 1.5) * 480
  const scaleY = 325
  return (
    <svg
      width={VIEW_WIDTH}
      height={height}
      viewBox={`0 0 ${VIEW_WIDTH} ${height}`}
      style={svgStyle}
      role="img"
      aria-label={`Picture 1, to scale. Five circles in a row: the Earth, and white dwarfs of ${d.pictureMassesSolar.join(', ')} solar masses, which get smaller as they get heavier. Below, a scale of mass from 0 to 1.5 solar masses with the white dwarfs marked and the limit of ${CHANDRASEKHAR_LIMIT_SOLAR_MASSES} solar masses marked in red.`}
    >
      <text x={20} y={22} fill={TEXT_COLOR} fontSize="13" fontWeight="bold">
        Picture 1: how big is a white dwarf, and where is its limit?
      </text>
      <circle cx={70} cy={cy} r={px} fill="none" stroke={EARTH_COLOR} strokeWidth={2} strokeDasharray="5 4" />
      <SvgLines x={70} y={cy + 4} lines={['Earth']} fill={EARTH_COLOR} bold anchor="middle" />
      <SvgLines x={70} y={cy + 72} lines={['for scale:', '1 Earth radius']} fill={MUTED_COLOR} anchor="middle" />
      {runs.map((r, i) => (
        <g key={i}>
          <circle cx={xs[i]} cy={cy} r={r.radiusEarths * px} fill={CORE_COLOR} stroke={CORE_COLOR} strokeWidth={2} />
          <SvgLines x={xs[i]} y={cy + 72} lines={[`${r.massSolar} ${r.massSolar === 1 ? 'Sun' : 'Suns'}`, `radius ${r.radiusEarths.toFixed(2)}`, 'Earth radii', `(${thousandsComma(roundTo(r.radiusKm, 10))} km)`]} fill={TEXT_COLOR} bold anchor="middle" size={9} />
        </g>
      ))}
      <SvgLines x={20} y={scaleY - 22} lines={['How heavy (in Suns):']} fill={TEXT_COLOR} bold />
      <line x1={scaleX(0)} y1={scaleY} x2={scaleX(1.5)} y2={scaleY} stroke={MUTED_COLOR} strokeWidth={2} />
      {[0, 0.5, 1.0, 1.5].map((t) => (
        <g key={t}>
          <line x1={scaleX(t)} y1={scaleY - 5} x2={scaleX(t)} y2={scaleY + 5} stroke={MUTED_COLOR} strokeWidth={2} />
          <SvgLines x={scaleX(t)} y={scaleY + 20} lines={[String(t)]} fill={MUTED_COLOR} anchor="middle" />
        </g>
      ))}
      {d.pictureMassesSolar.map((m) => (
        <circle key={m} cx={scaleX(m)} cy={scaleY} r={5} fill={CORE_COLOR} />
      ))}
      <line x1={scaleX(CHANDRASEKHAR_LIMIT_SOLAR_MASSES)} y1={scaleY - 30} x2={scaleX(CHANDRASEKHAR_LIMIT_SOLAR_MASSES)} y2={scaleY + 8} stroke={LIMIT_COLOR} strokeWidth={3} strokeDasharray="4 3" />
      <SvgLines x={scaleX(CHANDRASEKHAR_LIMIT_SOLAR_MASSES) + 4} y={scaleY - 34} lines={[`the limit: ${CHANDRASEKHAR_LIMIT_SOLAR_MASSES}`]} fill={LIMIT_COLOR} bold anchor="end" />
      {yours && (
        <g>
          <line x1={scaleX(yours.massSolar)} y1={scaleY - 16} x2={scaleX(yours.massSolar)} y2={scaleY + 8} stroke={YOURS_COLOR} strokeWidth={3} />
          <circle cx={scaleX(yours.massSolar)} cy={scaleY} r={7} fill="none" stroke={YOURS_COLOR} strokeWidth={3} />
          <SvgLines x={scaleX(yours.massSolar)} y={scaleY + 42} lines={[`your setting: ${yours.massSolar} Suns`, `radius ${yours.radiusEarths.toFixed(2)} Earth radii (${thousandsComma(roundTo(yours.radiusKm, 10))} km)`]} fill={YOURS_COLOR} bold size={9} anchor="middle" />
        </g>
      )}
      <SvgLines x={20} y={height - 8} lines={['Drawn to scale: the sizes of the white dwarfs and the Earth are in proportion; the mass scale is a separate line.']} fill={MUTED_COLOR} />
    </svg>
  )
}

// ---- Picture 2: two ways to explode (stage 2: route 1; stage 3 adds route 2) ----
function PictureTwo({ stage }: { stage: number }) {
  const d = WHITE_DWARF_EXPLOSION
  const run = runWhiteDwarfExplosion()
  const height = stage >= 3 ? 420 : 200
  const xs = [100, 280, 460]
  const rowA = 100
  const rowB = 270
  return (
    <svg
      width={VIEW_WIDTH}
      height={height}
      viewBox={`0 0 ${VIEW_WIDTH} ${height}`}
      style={svgStyle}
      role="img"
      aria-label={`Picture 2, a sketch. Route 1, in three steps: a white dwarf takes gas from a partner star; its weight creeps up towards the limit of ${CHANDRASEKHAR_LIMIT_SOLAR_MASSES} solar masses; its centre ignites.${stage >= 3 ? ` Route 2, in three steps: a thin helium layer collects on a white dwarf; the helium layer ignites and a shock runs inward; the shock ignites the core. In the matching simulation the core is ${d.simulationCoreSolar} solar masses and the helium layer ${d.simulationShellSolar}, ${run.simulationMassSolar.toFixed(3)} in all, ${run.simulationGapBelowLimitSolar.toFixed(3)} below the limit.` : ''}`}
    >
      <text x={20} y={22} fill={TEXT_COLOR} fontSize="13" fontWeight="bold">
        Picture 2: two ways a white dwarf might explode
      </text>

      {/* Route 1. */}
      <SvgLines x={20} y={46} lines={['Route 1: the white dwarf grows to the limit']} fill={TEXT_COLOR} bold size={11} />
      <circle cx={xs[0] - 38} cy={rowA} r={26} fill={PARTNER_COLOR} fillOpacity={0.85} />
      <circle cx={xs[0] + 36} cy={rowA} r={14} fill={CORE_COLOR} />
      <Arrow x1={xs[0] - 8} y1={rowA} x2={xs[0] + 16} y2={rowA} color={GAS_COLOR} />
      <SvgLines x={xs[0]} y={rowA + 52} lines={['1. It takes gas', 'from a partner']} fill={TEXT_COLOR} bold anchor="middle" size={9} />
      <Arrow x1={xs[0] + 66} y1={rowA} x2={xs[1] - 70} y2={rowA} color={MUTED_COLOR} />
      <rect x={xs[1] - 55} y={rowA - 10} width={110} height={20} fill="none" stroke={MUTED_COLOR} strokeWidth={2} />
      <rect x={xs[1] - 55} y={rowA - 10} width={100} height={20} fill={CORE_COLOR} />
      <line x1={xs[1] + 50} y1={rowA - 18} x2={xs[1] + 50} y2={rowA + 18} stroke={LIMIT_COLOR} strokeWidth={3} strokeDasharray="4 3" />
      <SvgLines x={xs[1] + 50} y={rowA - 24} lines={[`limit ${CHANDRASEKHAR_LIMIT_SOLAR_MASSES}`]} fill={LIMIT_COLOR} bold anchor="middle" size={9} />
      <SvgLines x={xs[1]} y={rowA + 52} lines={['2. Its weight creeps up', 'towards the limit']} fill={TEXT_COLOR} bold anchor="middle" size={9} />
      <Arrow x1={xs[1] + 74} y1={rowA} x2={xs[2] - 40} y2={rowA} color={MUTED_COLOR} />
      <circle cx={xs[2]} cy={rowA} r={26} fill={CORE_COLOR} />
      <circle cx={xs[2]} cy={rowA} r={11} fill={FLASH_COLOR} />
      <SvgLines x={xs[2]} y={rowA + 52} lines={['3. The centre ignites', 'and the star explodes']} fill={TEXT_COLOR} bold anchor="middle" size={9} />

      {/* Route 2 (from stage 3). */}
      {stage >= 3 && (
        <g>
          <SvgLines x={20} y={rowB - 56} lines={['Route 2: a double detonation']} fill={TEXT_COLOR} bold size={11} />
          <circle cx={xs[0]} cy={rowB} r={30} fill={HELIUM_COLOR} />
          <circle cx={xs[0]} cy={rowB} r={25} fill={CORE_COLOR} />
          <SvgLines x={xs[0]} y={rowB + 52} lines={['1. A thin helium layer', 'collects on the surface']} fill={TEXT_COLOR} bold anchor="middle" size={9} />
          <Arrow x1={xs[0] + 40} y1={rowB} x2={xs[1] - 52} y2={rowB} color={MUTED_COLOR} />
          <circle cx={xs[1]} cy={rowB} r={30} fill={FLASH_COLOR} />
          <circle cx={xs[1]} cy={rowB} r={22} fill={CORE_COLOR} />
          {[0, 90, 180, 270].map((deg) => {
            const a = (deg * Math.PI) / 180
            return <Arrow key={deg} x1={xs[1] + 44 * Math.cos(a)} y1={rowB + 44 * Math.sin(a)} x2={xs[1] + 28 * Math.cos(a)} y2={rowB + 28 * Math.sin(a)} color={FLASH_COLOR} />
          })}
          <SvgLines x={xs[1]} y={rowB + 60} lines={['2. The helium layer ignites;', 'a shock runs inward']} fill={TEXT_COLOR} bold anchor="middle" size={9} />
          <Arrow x1={xs[1] + 56} y1={rowB} x2={xs[2] - 40} y2={rowB} color={MUTED_COLOR} />
          <circle cx={xs[2]} cy={rowB} r={30} fill={HELIUM_COLOR} fillOpacity={0.5} />
          <circle cx={xs[2]} cy={rowB} r={22} fill={FLASH_COLOR} />
          <SvgLines x={xs[2]} y={rowB + 52} lines={['3. The shock ignites', 'the core']} fill={TEXT_COLOR} bold anchor="middle" size={9} />
          <SvgLines
            x={20}
            y={height - 42}
            lines={['In the matching simulation (Das and others 2025):', `core ${d.simulationCoreSolar} Suns + helium layer ${d.simulationShellSolar} Suns = ${run.simulationMassSolar.toFixed(3)} Suns,`, `which is ${run.simulationGapBelowLimitSolar.toFixed(3)} Suns below the limit of ${CHANDRASEKHAR_LIMIT_SOLAR_MASSES}.`]}
            fill={HELIUM_COLOR}
            bold
            size={10}
          />
        </g>
      )}
      {stage < 3 && <SvgLines x={20} y={height - 10} lines={['Sketch, not to scale. Route 2 is added at the next stage.']} fill={MUTED_COLOR} />}
    </svg>
  )
}

// ---- Picture 3: the remnant's two calcium shells (stage 4); the distance strip is added at stage 5 ----
function PictureThree({ stage, yours }: { stage: number; yours: YoursThree | null }) {
  const d = WHITE_DWARF_EXPLOSION
  const run = runWhiteDwarfExplosion()
  const height = stage >= 5 ? 700 : 470
  const cx = 280
  const cy = 225
  const pxPerPc = PICTURE_THREE_PX_PER_PC
  const inner = d.innerShellPc * pxPerPc
  const outer = d.outerShellPc * pxPerPc
  const changes = d.pictureBrightnessChanges
  const stripTop = 470
  const barX = 150
  const barMax = 220 // pixels for 20 percent
  return (
    <svg
      width={VIEW_WIDTH}
      height={height}
      viewBox={`0 0 ${VIEW_WIDTH} ${height}`}
      style={svgStyle}
      role="img"
      aria-label={`Picture 3. The remnant seen from the front, to scale: two rings of calcium round a centre, an inner ring ${d.innerShellPc} parsecs out and an outer ring ${d.outerShellPc} parsecs out, with the gap of ${run.shellGapPc.toFixed(2)} parsecs between them.${stage >= 5 ? ` Below, three bars show how far off a distance would be if a supernova were ${changes.map((c) => Math.abs(c) * 100).join(', ')} percent dimmer than assumed: ${changes.map((c) => distanceErrorPercent(c).toFixed(1)).join(', ')} percent too large.` : ''}`}
    >
      <text x={20} y={22} fill={TEXT_COLOR} fontSize="13" fontWeight="bold">
        Picture 3: the remnant SNR 0509-67.5, and why distances care
      </text>
      <SvgLines x={20} y={42} lines={[`Seen from the front, to scale: 1 parsec is ${PICTURE_THREE_PX_PER_PC} pixels. The remnant is about ${run.ageYears} years old (the paper: 300 to 350).`]} fill={MUTED_COLOR} />
      <circle cx={cx} cy={cy} r={outer} fill="none" stroke={SHELL_COLOR} strokeWidth={5} strokeOpacity={0.6} />
      <circle cx={cx} cy={cy} r={inner} fill="none" stroke={SHELL_COLOR} strokeWidth={5} />
      <circle cx={cx} cy={cy} r={4} fill={FLASH_COLOR} />
      <SvgLines x={cx + 8} y={cy + 4} lines={['the explosion’s centre']} fill={FLASH_COLOR} bold size={9} />
      <line x1={cx - inner * Math.cos(Math.PI / 4)} y1={cy - inner * Math.sin(Math.PI / 4)} x2={150} y2={104} stroke={SHELL_COLOR} strokeWidth={1.5} />
      <SvgLines x={20} y={74} lines={[`inner calcium shell: ${d.innerShellPc} pc`, `(${run.innerShellLightYears.toFixed(1)} light-years)`, `about ${thousandsComma(roundTo(run.innerShellSpeedKmS, 10))} km/s on average`]} fill={SHELL_COLOR} bold size={9} />
      <line x1={cx + outer * Math.cos(Math.PI / 4)} y1={cy - outer * Math.sin(Math.PI / 4)} x2={410} y2={104} stroke={SHELL_COLOR} strokeWidth={1.5} strokeOpacity={0.6} />
      <SvgLines x={540} y={74} lines={[`outer calcium shell: ${d.outerShellPc} pc`, `(${run.outerShellLightYears.toFixed(1)} light-years)`, `about ${thousandsComma(roundTo(run.outerShellSpeedKmS, 10))} km/s on average`]} fill={SHELL_COLOR} bold size={9} anchor="end" />
      <SvgLines x={cx} y={cy + outer + 26} lines={[`gap between the shells: ${run.shellGapPc.toFixed(2)} pc = ${run.shellGapLightYears.toFixed(2)} light-years`]} fill={TEXT_COLOR} bold anchor="middle" size={10} />
      {yours && (
        <SvgLines x={cx} y={cy + outer + 46} lines={[`your setting (white): age ${yours.ageYears} years: inner shell ${thousandsComma(roundTo(yours.innerSpeedKmS, 10))} km/s, outer shell ${thousandsComma(roundTo(yours.outerSpeedKmS, 10))} km/s`]} fill={YOURS_COLOR} bold anchor="middle" size={9} />
      )}
      {stage >= 5 && (
        <g>
          <line x1={20} y1={stripTop - 12} x2={VIEW_WIDTH - 20} y2={stripTop - 12} stroke={MUTED_COLOR} strokeWidth={1} />
          <SvgLines x={20} y={stripTop + 4} lines={['If a supernova were dimmer than assumed, a distance worked out from its brightness would be wrong:']} fill={TEXT_COLOR} bold size={10} />
          {changes.map((c, i) => {
            const e = distanceErrorPercent(c)
            const y = stripTop + 28 + i * 34
            return (
              <g key={c}>
                <SvgLines x={barX - 8} y={y + 12} lines={[`${Math.abs(c) * 100} percent dimmer`]} fill={TEXT_COLOR} bold size={10} anchor="end" />
                <rect x={barX} y={y} width={(e / 20) * barMax} height={18} fill={ERROR_COLOR} />
                <SvgLines x={barX + (e / 20) * barMax + 6} y={y + 13} lines={[`distance ${e.toFixed(1)} percent too large`]} fill={ERROR_COLOR} bold size={10} />
              </g>
            )
          })}
          {yours && (
            <g>
              <SvgLines x={barX - 8} y={stripTop + 28 + 3 * 34 + 12} lines={['your setting']} fill={YOURS_COLOR} bold size={10} anchor="end" />
              <rect x={barX} y={stripTop + 28 + 3 * 34} width={(Math.abs(yours.distanceErrorPercent) / 20) * barMax} height={18} fill={YOURS_COLOR} />
              <SvgLines
                x={barX + (Math.abs(yours.distanceErrorPercent) / 20) * barMax + 6}
                y={stripTop + 28 + 3 * 34 + 13}
                lines={[yours.brightnessChange === 0 ? 'no difference, no error' : `${Math.abs(yours.brightnessChange) * 100} percent ${yours.brightnessChange < 0 ? 'dimmer' : 'brighter'}: distance ${Math.abs(yours.distanceErrorPercent).toFixed(1)} percent too ${yours.distanceErrorPercent > 0 ? 'large' : 'small'}`]}
                fill={YOURS_COLOR}
                bold
                size={10}
              />
            </g>
          )}
          <SvgLines x={20} y={height - 20} lines={['Trial values, not measured differences between real supernovae.', 'Rule used: brightness falls as 1 ÷ distance², so a small difference gives a distance error about half as big.']} fill={MUTED_COLOR} size={9} />
        </g>
      )}
    </svg>
  )
}

function ChoiceButtons<T extends number>({ options, value, onChange, format }: { options: ReadonlyArray<T>; value: number; onChange: (v: T) => void; format: (v: T) => string }) {
  return (
    <div>
      {options.map((option) => (
        <button
          key={option}
          type="button"
          onClick={() => onChange(option)}
          className={`toggle-button${value === option ? ' is-selected' : ''}`}
          style={{ marginRight: '0.5rem', marginBottom: '0.5rem', padding: '0.5rem 1rem', fontSize: '0.875rem' }}
        >
          {format(option)}
        </button>
      ))}
    </div>
  )
}

// A signed percentage as an unsigned number, for a sentence such as "12.3 percent larger".

const REFERENCE_ENTRIES: { term: string; meaning: string }[] = [
  { term: 'White dwarf', meaning: 'the small, dense, slowly cooling ball left when a star like the Sun has used up its fuel. NASA: “A typical white dwarf is half as massive as the Sun, yet only slightly bigger than Earth.” (Black Holes Experiment 9 explains what holds it up.)' },
  { term: 'Electron degeneracy pressure', meaning: 'the resistance of electrons to being crowded together, because no two can be in exactly the same state (like one person to a theatre seat). It is what holds a white dwarf up against its own weight. Chandra: “The complete collapse of the white dwarf is prevented because it is held in equilibrium with gravity by electron degeneracy pressure.”' },
  { term: 'Chandrasekhar limit', meaning: 'the most mass a white dwarf can have before electron degeneracy pressure can no longer hold it up. NASA and Chandra give it as 1.4 times the mass of the Sun; the model of Black Holes Experiment 9, which this experiment reuses, uses 1.44. The two figures are the same limit worked out to different accuracy.' },
  { term: 'Solar mass', meaning: 'a unit for how heavy stars are. One solar mass is the mass of the Sun, so “1.4 solar masses” means 1.4 times as heavy as the Sun.' },
  { term: 'Type Ia supernova', meaning: 'the explosion of a white dwarf. NASA: when the white dwarf nears 1.4 times the mass of the Sun, “the pressure at the center will exceed the threshold for the carbon and oxygen nuclei to start to fuse uncontrollably.” Astronomers use these explosions as “standard candles” to measure distances. (The other kind of supernova, a massive star’s core collapsing, is Experiment 13.)' },
  { term: 'Standard candle', meaning: 'an object whose true brightness is known, so that how faint it looks tells us how far away it is, like judging how far away a street lamp is from how dim it appears. NASA: “Since Type Ia supernovae release the same amount of energy every time, astronomers use them as ‘standard candles’ to determine distance.”' },
  { term: 'Helium layer', meaning: 'a thin layer of helium, a light gas, on the outside of a white dwarf, round its carbon-oxygen core.' },
  { term: 'Double detonation', meaning: 'one proposed way for a white dwarf to explode, in two steps: the helium layer on its surface ignites first, and the shock from that explosion runs inward and sets off the carbon-oxygen core. ESO’s release describes the 2025 finding as a “double-detonation” mechanism.' },
  { term: 'Supernova remnant', meaning: 'the cloud of gas thrown out by a supernova, which keeps glowing for centuries as it spreads through the space around it. SNR 0509-67.5 is one: “SNR” stands for “supernova remnant”.' },
  { term: 'Calcium shell', meaning: 'a ring-shaped layer of calcium gas in a remnant. Calcium glows at particular colours when the gas is hot, so a telescope that splits light into its colours can show where the calcium is. (The 2025 team found two such shells, one outside the other.)' },
  { term: 'Large Magellanic Cloud', meaning: 'a small galaxy that orbits ours, in the southern sky, about 150,000 to 160,000 light-years away. ESA/Hubble calls it “a dwarf irregular galaxy”. SNR 0509-67.5 lies in it.' },
  { term: 'Parsec', meaning: 'a unit of distance used by astronomers, about 3.26 light-years. A light-year is how far light travels in a year.' },
]

// The two prediction questions' answers (the specification's "Prediction Activity"). The labels do not say which answer is right.
const SIZE_CHOICES: ReadonlyArray<{ value: SizeAnswer; label: string }> = [
  { value: 'about 0.5 Suns', label: 'About 0.5 Suns' },
  { value: 'about 1.0 Sun', label: 'About 1.0 Sun' },
  { value: 'about 1.4 Suns', label: 'About 1.4 Suns (the limit)' },
]
const SPEED_CHOICES: ReadonlyArray<{ value: SpeedAnswer; label: string }> = [
  { value: 'about 50 km/s', label: 'About 50 kilometres a second' },
  { value: 'about 5,000 km/s', label: 'About 5,000 kilometres a second' },
  { value: 'about 300,000 km/s', label: 'About 300,000 kilometres a second (the speed of light)' },
]

interface WhiteDwarfExplosionExperimentProps {
  onComplete?: () => void
  onTutorComplete?: () => void
}

export function WhiteDwarfExplosionExperiment({ onComplete, onTutorComplete }: WhiteDwarfExplosionExperimentProps) {
  const [sizePrediction, setSizePrediction] = useState<SizeAnswer | null>(null)
  const [speedPrediction, setSpeedPrediction] = useState<SpeedAnswer | null>(null)
  const [status, setStatus] = useState<'idle' | 'running' | 'complete'>('idle')
  const [stage, setStage] = useState(0)
  // The controls that appear after the run.
  const [massChoice, setMassChoice] = useState<number>(WHITE_DWARF_EXPLOSION.simulationCoreSolar + WHITE_DWARF_EXPLOSION.simulationShellSolar)
  const [ageChoice, setAgeChoice] = useState<number>(WHITE_DWARF_EXPLOSION.defaultAgeYears)
  const [brightnessChoice, setBrightnessChoice] = useState<number>(0)
  const hasRun = status !== 'idle'
  const done = status === 'complete'
  const bothPredicted = sizePrediction !== null && speedPrediction !== null

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

  function startOver() {
    setSizePrediction(null)
    setSpeedPrediction(null)
    setStatus('idle')
    setStage(0)
    setMassChoice(runWhiteDwarfExplosion().massSolar)
    setAgeChoice(WHITE_DWARF_EXPLOSION.defaultAgeYears)
    setBrightnessChoice(0)
  }
  function run() {
    setStage(1)
    setStatus('running')
  }

  // Every number below comes from the physics module (CLAUDE.md §9).
  const result = runWhiteDwarfExplosion()
  const d = WHITE_DWARF_EXPLOSION
  const pictureRuns = d.pictureMassesSolar.map((m) => runWhiteDwarfExplosion({ massSolar: m }))
  const wd12 = pictureRuns[2]
  const shellExample = shellSpeedWorkedExample(d.outerShellPc, result.ageYears)
  const brightnessExample = distanceErrorWorkedExample(-0.2)
  const [dimmer10, dimmer20, dimmer30] = d.pictureBrightnessChanges.map((c) => distanceErrorPercent(c))
  const wd06 = pictureRuns[0]
  const wd14 = pictureRuns[3]
  const percentOfLimit = (result.simulationMassSolar / CHANDRASEKHAR_LIMIT_SOLAR_MASSES) * 100
  const sigmaGap = result.separationInUncertainties
  const settings = { massSolar: massChoice, ageYears: ageChoice, brightnessChange: brightnessChoice }
  const mine = runWhiteDwarfExplosion(settings)
  const yoursOne: YoursOne | null = done ? { massSolar: mine.massSolar, radiusEarths: mine.radiusEarths, radiusKm: mine.radiusKm } : null
  const yoursThree: YoursThree | null =
    done ? { ageYears: mine.ageYears, innerSpeedKmS: mine.innerShellSpeedKmS, outerSpeedKmS: mine.outerShellSpeedKmS, brightnessChange: mine.brightnessChange, distanceErrorPercent: mine.distanceErrorPercent } : null
  const twoA = twoAnalysesComparison()
  const outerRange = shellSpeedRangeKmS(d.outerShellPc)
  const innerRange = shellSpeedRangeKmS(d.innerShellPc)
  const sizeLabel = SIZE_CHOICES.find((c) => c.value === sizePrediction)?.label
  const speedLabel = SPEED_CHOICES.find((c) => c.value === speedPrediction)?.label
  const dimWord = (x: number): string => (x < 0 ? 'dimmer' : x > 0 ? 'brighter' : 'no different')
  const [ageLow, ageHigh] = d.ageRangeYears

  const formulaEntries: { term: string; meaning: string }[] = [
    {
      term: 'The size of a white dwarf (formula)',
      meaning: `Black Holes Experiment 9’s formula: R = 0.0131 × (the Sun’s radius) × (M ÷ the Sun’s mass)^(−1/3) × the square root of (1 − (M ÷ ${CHANDRASEKHAR_LIMIT_SOLAR_MASSES})^(4/3)). For M = ${result.simulationMassSolar.toFixed(3)} Suns it gives about ${thousandsComma(roundTo(result.radiusKm, 10))} km, ${result.radiusEarths.toFixed(2)} Earth radii. The square-root term falls to zero at the limit, which is why a white dwarf shrinks as it nears it.`,
    },
    {
      term: 'Average speed (formula)',
      meaning: `speed = distance ÷ time. For the outer shell: ${d.outerShellPc} parsecs = ${(shellExample.radiusKm / 1e12).toFixed(0)} million million km, divided by ${result.ageYears} years = ${(shellExample.ageSeconds / 1e9).toFixed(1)} thousand million seconds, gives about ${thousandsComma(roundTo(shellExample.speedKmS, 10))} km/s. It is an average over the remnant’s life.`,
    },
    {
      term: 'Brightness and distance (formula)',
      meaning: `Brightness falls as 1 ÷ distance², so a distance worked out from an assumed brightness is wrong by 1 ÷ the square root of (the true brightness ÷ the assumed brightness). For a supernova that gives ${(brightnessExample.brightnessFraction * 100).toFixed(0)} percent of the assumed light: 1 ÷ ${brightnessExample.squareRoot.toFixed(3)} = ${brightnessExample.distanceFactor.toFixed(3)}, so the distance is ${brightnessExample.percent.toFixed(1)} percent too large.`,
    },
  ]
  const lookForPictureOne: LookFor[] = [
    {
      look: `the light blue circles, from the ${wd06.massSolar}-Sun white dwarf on the left to the ${wd14.massSolar}-Sun one on the right.`,
      means: `the heavier the white dwarf, the smaller it is. The ${wd06.massSolar}-Sun white dwarf is wider than the Earth (${wd06.radiusEarths.toFixed(2)} Earth radii), the ${wd12.massSolar}-Sun one is ${wd12.radiusEarths.toFixed(2)} and the ${wd14.massSolar}-Sun one only ${wd14.radiusEarths.toFixed(2)}, about ${thousandsComma(roundTo(wd14.radiusKm, 10))} km.`,
      matters: 'a white dwarf holds up more weight only by being squeezed smaller, so a heavier one is a more crushed one. That is why there is a limit: the squeezing cannot go on for ever.',
    },
    {
      look: 'the red dashed line on the line of weight.',
      means: `the limit, ${CHANDRASEKHAR_LIMIT_SOLAR_MASSES} Suns in this model (about 1.4 in NASA’s and Chandra’s pages). No white dwarf can be heavier than this.`,
      matters: 'the question of this experiment is how close to this line a white dwarf has to get before it can explode.',
    },
  ]
  const lookForPictureTwo: LookFor[] = [
    {
      look: 'route 1, step 2: the light blue bar that fills almost all the way to the red dashed line.',
      means: 'on this route the white dwarf’s weight creeps up towards the limit, and the explosion comes as it nears it.',
      matters: 'if this were the only route, every Type Ia supernova would start from nearly the same weight, which is why they were expected to look alike.',
    },
    {
      look: 'route 2, step 1: the thin yellow ring round the light blue core.',
      means: 'a layer of helium on the surface, which on this route ignites first and sends a shock inward to the core (step 2, the yellow arrows).',
      matters: 'it is a second place where an explosion can start, so the core may not need to be near the limit for the star to be set off.',
    },
    {
      look: `the line of numbers under route 2: core ${d.simulationCoreSolar} Suns + helium layer ${d.simulationShellSolar} Suns.`,
      means: `these are the weights in the simulation that matches the remnant in Picture 3: ${result.simulationMassSolar.toFixed(3)} Suns in all, ${result.simulationGapBelowLimitSolar.toFixed(3)} Suns below the limit, about ${percentOfLimit.toFixed(0)} percent of it.`,
      matters: 'it says how heavy a white dwarf has to be on route 2, and so how far below the limit an explosion of this kind can happen. How common it is, is another question that is still open.',
    },
  ]
  const lookForPictureThree: LookFor[] = [
    {
      look: 'the two green rings, one inside the other, and the gap line under them.',
      means: `two separate shells of calcium, ${d.innerShellPc} and ${d.outerShellPc} parsecs from the centre (${result.innerShellLightYears.toFixed(1)} and ${result.outerShellLightYears.toFixed(1)} light-years), with a gap of ${result.shellGapPc.toFixed(2)} parsecs (${result.shellGapLightYears.toFixed(2)} light-years). The measurements give or take ${d.shellUncertaintyPc} parsecs each, so the gap is about ${sigmaGap.toFixed(1)} times their combined give-or-take.`,
      matters: 'simulations of a double detonation predict two shells of calcium like these, so a pair of shells is the fingerprint the astronomers looked for.',
    },
    {
      look: 'the speeds written beside each ring.',
      means: `each shell’s distance divided by the remnant’s age: about ${thousandsComma(roundTo(result.innerShellSpeedKmS, 10))} km/s for the inner shell and ${thousandsComma(roundTo(result.outerShellSpeedKmS, 10))} km/s for the outer one, about ${(result.outerShellFractionOfLightSpeed * 100).toFixed(0)} percent of the speed of light. It is an average, because the gas has slowed since the explosion.`,
      matters: `it turns a distance and a time into a speed, as in Experiment 13, and gives a sense of how violent the explosion was: gas crossing more than ${Math.floor(result.innerShellLightYears)} light-years in about ${result.ageYears} years.`,
    },
    {
      look: 'the three orange bars at the bottom (stage 5).',
      means: `if a supernova were ${Math.abs(d.pictureBrightnessChanges[0]) * 100}, ${Math.abs(d.pictureBrightnessChanges[1]) * 100} or ${Math.abs(d.pictureBrightnessChanges[2]) * 100} percent dimmer than assumed, a distance worked out from its brightness would come out ${dimmer10.toFixed(1)}, ${dimmer20.toFixed(1)} or ${dimmer30.toFixed(1)} percent too large.`,
      matters: 'astronomers use Type Ia supernovae as “standard candles”, which only works if the explosions are alike. If they are not, a distance from brightness needs care.',
    },
  ]

  return (
    <div>
      <h2>Experiment 14 — What Makes a White Dwarf Explode? (the double-detonation remnant SNR 0509-67.5)</h2>
      <div className="exp-card" style={{ marginTop: '2rem', padding: '1.5rem' }}>
        <p style={{ marginTop: 0, marginBottom: '1.5rem', fontSize: '0.875rem' }}>
          <strong>
            Where this stands (as of October 2026): in 2025 astronomers found a pattern in the remains of one supernova that fits a white dwarf exploding in two steps. That is
            strong evidence for that one remnant. Some scientists read the pattern another way, and how many white dwarfs explode like this is not known. What the evidence
            adds up to is shown after you press Run, so that you can guess first.
          </strong>
        </p>

        <div style={{ marginBottom: '1.5rem' }}>
          <p style={paragraph}>
            <strong>The question.</strong> A star like the Sun ends its life as a small, dense, slowly cooling ball called a white dwarf. Most white dwarfs fade quietly for
            ever. But some explode, in an event called a Type Ia supernova, and these explosions are so alike that astronomers use them to measure distances across the
            universe. What makes a white dwarf explode? Does it have to reach a certain weight first? One supernova remnant, studied in 2025, gives some of the best evidence yet.
          </p>

          <p style={paragraph}>
            <strong>Where we left off.</strong> In Black Holes Experiment 9 you saw what holds up a dead star’s core, and that a white dwarf has a limit to its weight. In
            Experiments 1 and 2 of this group, distances measured with Type Ia supernovae were at the centre of the Hubble tension and the question of whether dark energy
            changes. In Experiment 13 you met the other kind of supernova, a massive star’s core collapsing, and worked with distance ÷ speed. This experiment is about the
            kind that those distances rest on.
          </p>

          <p style={paragraph}>
            <strong>How a white dwarf is formed.</strong> A star shines because, deep in its centre (its core), it is hot and squeezed enough to join small atoms into bigger
            ones, which gives off energy. This is called fusion. A star like the Sun spends most of its life, billions of years, joining hydrogen atoms into helium. When the
            hydrogen in the core runs short, the core shrinks and heats up, and the star’s outer layers swell out into a huge, cool, red star, a red giant. The core then joins
            helium atoms into carbon and oxygen. A star as light as the Sun cannot squeeze its core hard enough to go any further, so when the helium is used up, fusion
            stops. The outer layers drift away into space as a glowing cloud, and what is left is the bare core: a hot ball of mostly carbon and oxygen, about as heavy as
            half the Sun or more but not much bigger than the Earth. That ball is a white dwarf. It is “white” because it starts out extremely hot, and it keeps its heat
            only from the past: it makes no new energy, so it cools slowly over billions of years, like the embers of a campfire that has no more wood. (Stars much heavier
            than the Sun end differently: their cores go on fusing until they collapse, as in Experiment 13.)
          </p>

          <p style={paragraph}>
            <strong>What a white dwarf is.</strong> NASA says that “a typical white dwarf is half as massive as the Sun, yet only slightly bigger than Earth”. A white dwarf
            is not making energy any more. What holds it up against its own weight is a rule of nature about electrons: no two of them can be in exactly the same state, so
            when they are squeezed together they push back, a bit like a theatre where every seat holds one person, however hard you push. This is called{' '}
            <strong>electron degeneracy pressure</strong>. But it can hold up only so much weight. Chandra gives the limit: “the mass limit for a white dwarf to remain in
            equilibrium between gravity and electron degeneracy pressure is 1.4 solar masses”. It is named the Chandrasekhar limit, after the scientist who found it.
          </p>

          <p style={paragraph}>
            <strong>Two ways it might explode.</strong> The first idea is the older one. A white dwarf in a close pair takes gas from its partner, and its weight creeps up.
            NASA describes what happens as it nears the limit: “the pressure at the center will exceed the threshold for the carbon and oxygen nuclei to start to fuse
            uncontrollably”, and the white dwarf explodes. Because every white dwarf that explodes this way would start from nearly the same weight, the explosions would
            look much alike, and that is why NASA says astronomers use them as “standard candles”: if you know how bright something really is, how faint it looks tells you how
            far away it is, as a street lamp looks dimmer the farther away it is. The second idea is newer. A white dwarf can also collect a thin layer of helium on its
            surface. If that layer ignites, the explosion runs through it (a detonation: a burning front that races through the material faster than sound), and the shock
            runs inward and can set off the carbon-oxygen core. That would be a <strong>double detonation</strong>: two explosions, one after the other.
          </p>

          <p style={paragraph}>
            <strong>What was found.</strong> In July 2025 a team led by Priyam Das and Ivo Seitenzahl used MUSE, an instrument on the European Southern Observatory’s Very
            Large Telescope that splits the light at every point of a picture into its colours, to look at a supernova remnant called SNR 0509-67.5. A remnant is the cloud of gas
            thrown out by a supernova. This one is in the Large Magellanic Cloud, a small galaxy next to ours about 150,000 to 160,000 light-years away, and it is only about
            300 to 350 years old. The team found calcium gas arranged in two separate shells, one outside the other. Simulations of a double detonation predict two shells like
            that, and ESO’s release says it is a clear sign that this kind of explosion happens. The illustration below shows the parts of a white dwarf and a close pair.
          </p>

          <div style={{ marginBottom: '0.75rem' }}>
            <WhiteDwarfDrawing />
          </div>
          <div style={{ fontSize: '0.875rem', color: 'var(--text-muted)', marginBottom: '0.75rem' }}>
            <p style={paragraph}>
              <strong>How to read this illustration.</strong> It shows the parts that the two ideas turn on. It is a sketch of any white dwarf of this kind, not of the one in
              SNR 0509-67.5, and it is not to scale.
            </p>
            <ul style={{ margin: '0 0 0.75rem', paddingLeft: '1.25rem' }}>
              <li>
                <strong>The two panels</strong> show two things: 1, a white dwarf on its own; 2, a white dwarf with a partner star close by.
              </li>
              <li>
                <strong>The light blue ball</strong> in panel 1 is the carbon-oxygen core, which is most of the white dwarf. <strong>The thin yellow layer</strong> round it is
                the helium layer.
              </li>
              <li>
                <strong>The orange circle</strong> in panel 2 is the partner star. It is drawn bigger than the white dwarf because a white dwarf is only about the size
                of the Earth. <strong>The purple arrow</strong> shows gas flowing from the partner to the white dwarf.
              </li>
              <li>
                <strong>The small blue and yellow circle</strong> in panel 2 is the white dwarf, drawn with its helium layer round it.
              </li>
            </ul>
            <p style={paragraph}>
              <strong>A worked moment, with a street lamp.</strong> Picture two lamps of exactly the same brightness. You see one close by and it looks bright. You see the
              other far down the road and it looks dim. Because you know both are the same lamp, the dimness tells you the distance. Type Ia supernovae are used the same way,
              as lamps in distant galaxies. It only works if the lamps really are alike, and that is why it matters what makes a white dwarf explode.
            </p>
            <p style={{ marginTop: 0, marginBottom: '0.5rem' }}>
              <strong>What to look for.</strong>
            </p>
            <LookForList items={lookForDrawing} />
          </div>

          <p style={paragraph}>
            <strong>Where the question stands (October 2026).</strong> That this one remnant fits a double detonation is strong evidence. Another reading of the same two shells
            has been published, so it is not settled that nothing else could make them. How many white dwarfs explode this way is still open. What the evidence adds up to is
            shown after the run, with each number’s source.
          </p>
          <div style={{ marginBottom: '0.75rem' }}>
            <p style={{ marginTop: 0, marginBottom: '0.5rem' }}>
              <strong>Some new words.</strong> The “Words and formulas” box below has each one, with a few from earlier experiments.
            </p>
            <ul style={{ margin: 0, paddingLeft: '1.25rem' }}>
              <li>
                <strong>White dwarf</strong>, <strong>electron degeneracy pressure</strong>, <strong>Chandrasekhar limit</strong> and <strong>solar mass</strong>: the dead
                star, what holds it up, how much it can weigh, and the unit for star weights.
              </li>
              <li>
                <strong>Type Ia supernova</strong> and <strong>standard candle</strong>: the explosion of a white dwarf, and why its brightness can measure a distance.
              </li>
              <li>
                <strong>Helium layer</strong> and <strong>double detonation</strong>: the thin outer layer, and the two-step explosion it can start.
              </li>
              <li>
                <strong>Supernova remnant</strong> and <strong>calcium shell</strong>: the cloud a supernova leaves, and a ring of calcium gas in it.
              </li>
              <li>
                <strong>Large Magellanic Cloud</strong> and <strong>parsec</strong>: the small galaxy where the remnant is, and a unit of distance.
              </li>
            </ul>
          </div>

          <p style={paragraph}>
            <strong>What you will do.</strong> You will make two predictions, press Run to watch the pictures build up one stage at a time, and then try other values for the
            white dwarf’s weight, the remnant’s age and a difference in brightness. Nothing here is graded. Your predictions are your own guesses, made before you see
            anything: they do not change the pictures or the tables, which come from the physics and the published numbers. They are shown again beside the results so you can
            compare. What does change the pictures is the “Now try it yourself” controls, which appear after the run finishes.
          </p>

          <p style={paragraph}>
            <strong>What we assume.</strong> This experiment is a simple model. It uses the size of a white dwarf and its limit from Black Holes Experiment 9, published
            masses and radii for the remnant, and the plain rule that a speed is a distance divided by a time. It does not simulate either kind of explosion, does not work
            out how bright a supernova is, and does not decide between the double detonation and another reading of the remnant.
          </p>

          <p style={{ marginTop: 0, marginBottom: '0.75rem' }}>
            <strong>Want to know more?</strong> Plainer-language pages are listed here. Links open in a new tab. This page was written as of October 2026. The papers behind the
            numbers are listed after the run, so that they do not give away the predictions.
          </p>
          <ul style={{ margin: '0.25rem 0 0', paddingLeft: '1.25rem' }}>
            <li>
              <ExternalLink href="https://eso.org/public/news/eso2511/">ESO: Double detonation, new image shows remains of a star destroyed by a pair of explosions</ExternalLink>: the
              2025 finding in the observatory’s own words.
            </li>
            <li>
              <ExternalLink href="https://science.nasa.gov/mission/hubble/science/science-behind-the-discoveries/hubble-stellar-explosions/">NASA Hubble: Stellar explosions</ExternalLink>: what a
              Type Ia supernova is, and how astronomers use it as a “standard candle” to find distances.
            </li>
            <li>
              <ExternalLink href="https://chandra.harvard.edu/xray_sources/supernovas.html">NASA’s Chandra X-ray Observatory: Supernovas and supernova remnants</ExternalLink>: the
              two kinds of supernova, a white dwarf’s explosion and a massive star’s collapse.
            </li>
            <li>
              <ExternalLink href="https://chandra.harvard.edu/xray_sources/white_dwarfs.html">NASA’s Chandra X-ray Observatory: White dwarfs</ExternalLink>: how a star like the Sun
              swells into a red giant and leaves a white dwarf, how dense it is, and what the 1.4-Sun limit means.
            </li>
            <li>
              <ExternalLink href="https://chandra.harvard.edu/edu/formal/stellar_ev/story/index7.html">Chandra X-ray Observatory: Stellar evolution, white dwarfs</ExternalLink>:
              electron degeneracy pressure and the Chandrasekhar limit.
            </li>
            <li>
              <ExternalLink href="https://esahubble.org/images/heic0411d/">ESA/Hubble: The Large Magellanic Cloud</ExternalLink>: the small galaxy beside ours where the remnant is.
            </li>
          </ul>
        </div>

        <ReferencePanel entries={done ? [...REFERENCE_ENTRIES, ...formulaEntries] : REFERENCE_ENTRIES} />

        {/* The two predictions: draft wording for the owner's review (CLAUDE.md §28.1), from the specification's "Prediction Activity". Neither says which answer is
            right, and neither gives the white dwarf's mass in the remnant or the shells' speed. */}
        {(
          [
            {
              title: 'Prediction 1: how heavy was the white dwarf?',
              text: (
                <>
                  A white dwarf cannot be heavier than about 1.4 Suns. In the remnant we study, a white dwarf exploded as a Type Ia supernova. About how heavy was it?
                </>
              ),
              choices: SIZE_CHOICES,
              value: sizePrediction,
              set: (v: SizeAnswer) => setSizePrediction(v),
            },
            {
              title: 'Prediction 2: how fast is the debris?',
              text: (
                <>
                  The remnant is about 300 years old, and its outer shell of calcium is about 2 parsecs from the centre, which is about {(2 * LIGHT_YEARS_PER_PARSEC).toFixed(1)} light-years. About
                  how fast has that outer shell moved, on average?
                </>
              ),
              choices: SPEED_CHOICES,
              value: speedPrediction,
              set: (v: SpeedAnswer) => setSpeedPrediction(v),
            },
          ] as const
        ).map((question) => (
          <div key={question.title} style={{ marginTop: '1.5rem', marginBottom: '2rem' }}>
            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold' }}>{question.title}</label>
            <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)', marginTop: 0, marginBottom: '0.75rem' }}>
              {question.text} You are not graded, and a guess is fine.
            </p>
            <div>
              {(question.choices as ReadonlyArray<{ value: string; label: string }>).map((choice) => (
                <button
                  key={choice.value}
                  type="button"
                  onClick={() => (question.set as (v: never) => void)(choice.value as never)}
                  disabled={hasRun}
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

        <button type="button" className="action-button" onClick={run} disabled={!bothPredicted || hasRun} style={{ padding: '0.6rem 1.5rem' }}>
          Run
        </button>
        {hasRun && (
          <button type="button" className="secondary-button" onClick={startOver} style={{ marginLeft: '0.75rem', padding: '0.6rem 1.25rem' }}>
            Start over
          </button>
        )}
        {!bothPredicted && !hasRun && (
          <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: 0 }}>Answer both predictions above to run the experiment.</p>
        )}
        {/* The run's stage, named (CLAUDE.md §14): what the learner is looking at now. */}
        <p style={{ fontSize: '0.875rem', margin: '1.5rem 0 0.75rem', minHeight: '1.5rem' }}>
          {status === 'idle' && <span style={{ color: 'var(--text-muted)' }}>The pictures fill in, one stage at a time, after you press Run.</span>}
          {status !== 'idle' && (
            <>
              <strong>{status === 'complete' ? 'Run complete' : `Stage ${stage} of ${LAST_STAGE}: ${STAGE_NAMES[stage]}`}</strong>
              {status === 'complete' && <span style={{ color: 'var(--text-muted)' }}> (all {LAST_STAGE} stages shown). Your predictions are recorded and not marked here.</span>}
            </>
          )}
        </p>
        {status === 'running' && (
          <p style={{ fontSize: '0.875rem', marginTop: 0, color: 'var(--text-muted)' }}>
            {stage === 1 && 'Picture 1 shows white dwarfs of four weights drawn to scale beside the Earth, and the limit on a scale of weight.'}
            {stage === 2 && 'Picture 2 appears below Picture 1. It sketches the first route to an explosion: the white dwarf grows to the limit.'}
            {stage === 3 && `The second route is added to Picture 2: a double detonation, with the masses of the simulation that matches the remnant.`}
            {stage === 4 && `Picture 3 appears below Picture 2. It shows the remnant’s two calcium shells, ${d.innerShellPc} and ${d.outerShellPc} parsecs from the centre, and their average speeds.`}
            {stage === 5 && 'A strip is added to Picture 3: how a brightness difference would carry into a distance.'}
          </p>
        )}

        {/* Picture 1 (stage 1 on). */}
        {hasRun && (
          <div style={{ marginTop: '1.5rem', marginBottom: '1rem' }}>
            <PictureOne yours={yoursOne} />
          </div>
        )}
        {hasRun && (
          <div style={{ fontSize: '0.875rem', color: 'var(--text-muted)', marginBottom: '1.5rem' }}>
            <p style={paragraph}>
              <strong>How to read Picture 1.</strong> Along the top are five circles drawn to the same scale. The <strong>dashed pale circle</strong> is the Earth, for scale. The{' '}
              <strong>four light blue circles</strong> are white dwarfs of four different weights, each labelled with its weight in <strong>Suns</strong> (1 Sun is the Sun’s mass),
              its radius in Earth radii (1 means as wide as the Earth) and its radius in kilometres. Along the bottom is a <strong>line of weight</strong> from 0 to 1.5 Suns. The
              four blue dots mark the same four white dwarfs, and the <strong>red dashed line</strong> marks the limit, {CHANDRASEKHAR_LIMIT_SOLAR_MASSES} Suns. (NASA and Chandra give the limit as
              1.4; the model this page reuses from Black Holes Experiment 9 uses {CHANDRASEKHAR_LIMIT_SOLAR_MASSES}. It is the same limit worked out to different accuracy.)
            </p>
            <p style={paragraph}>
              <strong>A worked moment.</strong> The white dwarf of {wd12.massSolar} Suns has a radius of {wd12.radiusEarths.toFixed(2)} Earth radii. One Earth radius is {thousandsComma(EARTH_RADIUS_KM)} km, so that is{' '}
              {wd12.radiusEarths.toFixed(2)} × {thousandsComma(EARTH_RADIUS_KM)} = about {thousandsComma(roundTo(wd12.radiusKm, 10))} km. The one of {pictureRuns[3].massSolar} Suns has a radius of only {pictureRuns[3].radiusEarths.toFixed(2)} Earth
              radii, about {thousandsComma(roundTo(pictureRuns[3].radiusKm, 10))} km.
            </p>
            <p style={{ marginTop: 0, marginBottom: '0.5rem' }}>
              <strong>What to look for.</strong>
            </p>
            <LookForList items={lookForPictureOne} />
          </div>
        )}

        {/* Picture 2: route 1 from stage 2, route 2 added at stage 3. */}
        {stage >= 2 && (
          <div style={{ marginTop: '1.5rem', marginBottom: '1rem' }}>
            <PictureTwo stage={stage} />
          </div>
        )}
        {stage >= 2 && (
          <div style={{ fontSize: '0.875rem', color: 'var(--text-muted)', marginBottom: '1.5rem' }}>
            <p style={paragraph}>
              <strong>How to read Picture 2.</strong> It is a sketch, not to scale, of the two ideas for how a white dwarf might explode. Each route is a row of three steps, read
              from left to right, joined by grey arrows. <strong>Light blue</strong> is the carbon-oxygen core of the white dwarf, <strong>yellow</strong> is the helium layer,{' '}
              <strong>orange</strong> is a partner star and the <strong>purple arrow</strong> is gas flowing from it. A <strong>bright yellow centre</strong> means that part has
              ignited.
            </p>
            <p style={paragraph}>
              <strong>Route 1</strong> (the top row): the white dwarf takes gas from a partner, so its weight creeps up towards the red dashed <strong>limit</strong> in step 2, and
              when it nears it the centre ignites. The centre is mostly carbon and oxygen, which are fuel that was never burnt. The extra weight squeezes the centre harder, and near
              the limit it is squeezed enough for carbon to start fusing. {stage >= 3 && (
                <>
                  <strong>Route 2</strong> (the bottom row, added at stage 3): a thin helium layer collects on the surface and ignites first, and the <strong>yellow arrows pointing
                  inward</strong> in step 2 show the shock running inward. In step 3 the shock ignites the core. The line of numbers at the bottom gives the weights of the
                  simulation that matches the remnant you will see in Picture 3.
                </>
              )}
            </p>
            {stage >= 3 && (
              <p style={paragraph}>
                <strong>A worked moment.</strong> The simulation’s core is {d.simulationCoreSolar} Suns and its helium layer {d.simulationShellSolar} Suns, so the white dwarf is {d.simulationCoreSolar} + {d.simulationShellSolar} ={' '}
                {result.simulationMassSolar.toFixed(3)} Suns. The limit is {CHANDRASEKHAR_LIMIT_SOLAR_MASSES}, so it is {CHANDRASEKHAR_LIMIT_SOLAR_MASSES} − {result.simulationMassSolar.toFixed(3)} = {result.simulationGapBelowLimitSolar.toFixed(3)} Suns below the limit,
                or {percentOfLimit.toFixed(0)} percent of it.
              </p>
            )}
            <p style={{ marginTop: 0, marginBottom: '0.5rem' }}>
              <strong>What to look for.</strong>
            </p>
            <LookForList items={lookForPictureTwo.slice(0, stage >= 3 ? 3 : 1)} />
          </div>
        )}

        {/* Picture 3: the shells from stage 4, the distance strip from stage 5. */}
        {stage >= 4 && (
          <div style={{ marginTop: '1.5rem', marginBottom: '1rem' }}>
            <PictureThree stage={stage} yours={yoursThree} />
          </div>
        )}
        {stage >= 4 && (
          <div style={{ fontSize: '0.875rem', color: 'var(--text-muted)', marginBottom: '1.5rem' }}>
            <p style={paragraph}>
              <strong>How to read Picture 3.</strong> You are looking at the remnant from the front, drawn to one scale (1 <strong>parsec</strong>, about {LIGHT_YEARS_PER_PARSEC.toFixed(2)} light-years, is {PICTURE_THREE_PX_PER_PC}{' '}
              pixels). The tiny <strong>yellow dot</strong> at the centre is where the explosion happened. The <strong>two green rings</strong> are the two shells of calcium that
              the telescope found: the bright inner one and the fainter outer one. Each is labelled with its distance from the centre in parsecs and in light-years, and with its
              <strong> average speed</strong>, which is that distance divided by the remnant’s age. The line under the rings gives the gap between the shells.
            </p>
            {stage >= 5 && (
              <p style={paragraph}>
                <strong>The three orange bars</strong> (stage 5) are a separate idea. Each bar says how far off a distance would be if a supernova were {Math.abs(d.pictureBrightnessChanges[0]) * 100}, {Math.abs(d.pictureBrightnessChanges[1]) * 100} or {Math.abs(d.pictureBrightnessChanges[2]) * 100} percent dimmer than
                astronomers had assumed: the longer the bar, the bigger the error. They are trial values, not measured differences between real supernovae.
              </p>
            )}
            <p style={paragraph}>
              <strong>A worked moment.</strong> The outer shell is {d.outerShellPc} parsecs out, which is {d.outerShellPc} × {thousandsComma(KM_PER_PARSEC / 1e9)} thousand million km = about {(shellExample.radiusKm / 1e12).toFixed(0)} million million km. The
              remnant is about {result.ageYears} years old, which is about {(shellExample.ageSeconds / 1e9).toFixed(1)} thousand million seconds. Distance ÷ time = {thousandsComma(roundTo(shellExample.speedKmS, 10))} km/s, which is
              about {(shellExample.fractionOfLight * 100).toFixed(1)} percent of the speed of light.{' '}
              {stage >= 5 && (
                <>
                  For the bars: if a supernova gives out {(brightnessExample.brightnessFraction * 100).toFixed(0)} percent of the light assumed, the distance comes out {brightnessExample.distanceFactor.toFixed(3)} times too large,
                  because the square root of {brightnessExample.brightnessFraction.toFixed(1)} is {brightnessExample.squareRoot.toFixed(3)} and 1 ÷ {brightnessExample.squareRoot.toFixed(3)} = {brightnessExample.distanceFactor.toFixed(3)}: {brightnessExample.percent.toFixed(1)} percent.
                </>
              )}
            </p>
            <p style={{ marginTop: 0, marginBottom: '0.5rem' }}>
              <strong>What to look for.</strong>
            </p>
            <LookForList items={lookForPictureThree.slice(0, stage >= 5 ? 3 : 2)} />
          </div>
        )}

        {/* The controls (after the run): the white dwarf's weight, the remnant's age and a brightness difference. They add white marks to Pictures 1 and 3. */}
        {done && (
          <div style={{ marginTop: '2rem', padding: '1rem 1.25rem', border: '2px solid var(--border-color, #ccc)', borderRadius: '8px' }}>
            <h3 style={{ marginTop: 0 }}>Now try it yourself</h3>
            <p style={{ ...paragraph, fontSize: '0.875rem', color: 'var(--text-muted)' }}>
              Your predictions do not change the pictures, because the results come from the physics, not from your guesses. These settings do: change one and watch the white
              marks in Pictures 1 and 3 above follow it. Picture 2 does not change, because it is a sketch of two ideas.
              Each choice is a trial value: it shows what would happen with that number, and does not say that the real white dwarf or the real remnant is like that.
            </p>
            <p style={{ ...paragraph, fontWeight: 'bold' }}>How heavy is the white dwarf? (Suns) It moves the white marker in Picture 1.</p>
            <ChoiceButtons
              options={d.massChoicesSolar}
              value={massChoice}
              onChange={setMassChoice}
              format={(v) => `${v}${v === result.simulationMassSolar ? ' (the simulation’s)' : v === d.massChoicesSolar[0] ? ' (a typical white dwarf)' : v === d.massChoicesSolar[d.massChoicesSolar.length - 1] ? ' (just below the limit)' : ''}`}
            />
            <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)', marginTop: 0 }}>
              A white dwarf of {mine.massSolar} Suns has a radius of about {thousandsComma(roundTo(mine.radiusKm, 10))} km, {mine.radiusEarths.toFixed(2)} Earth radii. It is {mine.gapBelowLimitSolar.toFixed(3)} Suns below the
              limit of {CHANDRASEKHAR_LIMIT_SOLAR_MASSES}, {mine.percentBelowLimit.toFixed(0)} percent below it.
            </p>
            <p style={{ ...paragraph, fontWeight: 'bold' }}>How old is the remnant? (years) It moves the white labels in Picture 3.</p>
            <ChoiceButtons options={d.ageChoicesYears} value={ageChoice} onChange={setAgeChoice} format={(v) => `${v} years${v === d.defaultAgeYears ? ' (the middle of the paper’s range)' : ''}`} />
            <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)', marginTop: 0 }}>
              At {mine.ageYears} years the average speeds are {thousandsComma(roundTo(mine.innerShellSpeedKmS, 10))} km/s for the inner shell and {thousandsComma(roundTo(mine.outerShellSpeedKmS, 10))} km/s for the outer one. An older remnant
              means the same distance took longer, so a lower average speed. The paper gives the age as {ageLow} to {ageHigh} years.
            </p>
            <p style={{ ...paragraph, fontWeight: 'bold' }}>How much dimmer or brighter is the supernova than assumed? (percent) It moves the white bar in Picture 3.</p>
            <ChoiceButtons
              options={d.brightnessChoices}
              value={brightnessChoice}
              onChange={setBrightnessChoice}
              format={(v) => (v === 0 ? 'No difference (the published value)' : `${Math.abs(v) * 100} percent ${dimWord(v)}`)}
            />
            <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)', marginTop: 0, marginBottom: 0 }}>
              {mine.brightnessChange === 0
                ? 'With no difference in brightness there is no error in the distance.'
                : `A supernova ${Math.abs(mine.brightnessChange) * 100} percent ${dimWord(mine.brightnessChange)} than assumed would give a distance ${Math.abs(mine.distanceErrorPercent).toFixed(1)} percent too ${mine.distanceErrorPercent > 0 ? 'large' : 'small'}. These are trial values, not measured differences.`}
            </p>
          </div>
        )}

        {/* The results, shown only after the run completes: the status label, the predictions again, the check-up, three tables, and the links kept back until now. */}
        {done && (
          <div style={{ marginTop: '2rem' }}>
            <h3 style={{ marginTop: 0 }}>Results</h3>
            <p style={{ ...paragraph, padding: '0.75rem 1rem', border: '2px solid var(--border-color, #ccc)', borderRadius: '8px', fontSize: '0.875rem' }}>
              <strong>Where this stands (as of October 2026).</strong> <strong>Strong evidence:</strong> this one remnant, SNR 0509-67.5, was made by a double detonation of a white dwarf
              of about {Math.round(result.simulationMassSolar)} Sun, well below the limit (two research groups’ simulations match its calcium shells and its small-scale structure).{' '}
              <strong>Contested:</strong> a 2025 paper reads the same two calcium shells as the result of instabilities in a different kind of explosion. <strong>Open:</strong> how many Type Ia supernovae
              explode this way.
            </p>
            <div style={{ ...paragraph, fontSize: '0.875rem', color: 'var(--text-muted)' }}>
              <p style={{ margin: '0 0 0.5rem' }}>
                <strong>Your predictions, beside the results.</strong> Before the run you made two predictions. Here they are again, each with the place on this page where its number
                appears. Compare them yourself. The tutor will go through them with you after the tables.
              </p>
              <p style={{ margin: '0 0 0.5rem' }}>
                <strong>Prediction 1: how heavy was the white dwarf?</strong> You predicted: <strong>{sizeLabel}</strong>. Its number is in Table 1, in the row “The white dwarf’s weight in the
                remnant”, and under route 2 in Picture 2.
              </p>
              <p style={{ margin: 0 }}>
                <strong>Prediction 2: how fast is the debris?</strong> You predicted: <strong>{speedLabel}</strong>. Its number is in Table 2, in the row “Average speed of the outer
                shell”, and in the label beside the outer ring in Picture 3.
              </p>
            </div>
            <p style={{ ...paragraph, fontSize: '0.875rem', color: 'var(--text-muted)' }}>
              <strong>How to read these results.</strong> Think of these tables as a set of test results, and this section as the doctor explaining them. A supernova remnant about 150,000 to
              160,000 light-years away cannot be weighed or timed directly, so what we know comes as numbers from several sources: the sizes of two shells measured by a telescope, a weight
              taken from a simulation that matches them, and an age. None of the numbers is a picture of the explosion. The question to keep in mind is:{' '}
              <strong>do the numbers agree with each other, and how strong is each one?</strong>
            </p>
            <p style={{ ...paragraph, fontSize: '0.875rem', color: 'var(--text-muted)' }}>
              First comes a short check-up that sets what we would expect beside what was found. Then each table has a plain-words note under it. The experiment explains what each number
              means. It does not decide for you what the evidence adds up to. The tutor will help you with that, after the tables. The “Words and formulas” box now has the formulas worked
              with these numbers.
            </p>
            <p style={{ marginBottom: '0.25rem' }}>
              <strong>The check-up: what we would expect, and what was found</strong>
            </p>
            <ResultsTable
              head={['What was checked', 'What we would expect', 'What was found', 'What this tells us']}
              minWidth={640}
              rows={[
                [
                  'The white dwarf’s weight',
                  `A core of about ${d.analysis2026CoreSolar} Sun and a helium shell of more than ${d.analysis2026ShellAboveSolar} Suns, so at least ${twoA.analysis2026AtLeastSolar.toFixed(2)} Suns (Mandal and others, 2026)`,
                  `${twoA.simulationSolar.toFixed(3)} Suns: a core of ${d.simulationCoreSolar} plus a helium layer of ${d.simulationShellSolar} (Das and others, 2025)`,
                  `Close: the two figures differ by about ${Math.abs(twoA.differencePercent).toFixed(1)} percent. The 2026 figure is a lower bound, and the two papers share authors, so this is a check of consistency, not a fully independent one.`,
                ],
                [
                  'How far below the limit',
                  `If the white dwarf had reached the limit, it would be 0 Suns below it (the limit is ${CHANDRASEKHAR_LIMIT_SOLAR_MASSES} Suns here)`,
                  `${result.simulationGapBelowLimitSolar.toFixed(3)} Suns below the limit, ${result.percentBelowLimit.toFixed(0)} percent below it`,
                  'Well below the limit. This number comes from the simulation that matches the shells, so it is a result of that match and not a direct weighing.',
                ],
                [
                  'The two calcium shells',
                  'Two separate peaks, as simulations of a double detonation predict (Das and others, 2025)',
                  `${d.innerShellPc} ± ${d.shellUncertaintyPc} and ${d.outerShellPc} ± ${d.shellUncertaintyPc} parsecs; the gap is ${result.shellGapPc.toFixed(2)} parsecs`,
                  `Two separate peaks: the gap is about ${sigmaGap.toFixed(1)} times the combined give-or-take of the two radii (${d.shellUncertaintyPc} and ${d.shellUncertaintyPc} parsecs together).`,
                ],
                [
                  'The speed of each shell',
                  'No published average speed is used here for comparison',
                  `${thousandsComma(roundTo(innerRange[0], 10))} to ${thousandsComma(roundTo(innerRange[1], 10))} km/s (inner) and ${thousandsComma(roundTo(outerRange[0], 10))} to ${thousandsComma(roundTo(outerRange[1], 10))} km/s (outer), over the paper’s ages`,
                  'A rough average: it is the distance divided by the age, and the gas has slowed since the explosion. It is not a measured speed.',
                ],
                [
                  'Brightness and distance',
                  'No published figure is used here for how much real Type Ia supernovae differ in brightness',
                  `A supernova ${Math.abs(d.pictureBrightnessChanges[1]) * 100} percent dimmer than assumed gives a distance ${distanceErrorPercent(d.pictureBrightnessChanges[1]).toFixed(1)} percent too large`,
                  'Trial values only. It shows how a difference in brightness would carry into a distance, and says nothing about how big the real difference is.',
                ],
              ]}
            />
            <p style={{ ...paragraph, fontSize: '0.875rem', color: 'var(--text-muted)', marginTop: '0.5rem' }}>
              A doctor reads each result against a reference. Here the reference is a published figure, or what the same physics predicts. One row is close, one is well below the limit, one
              is two separate peaks and two have no reference to compare with. That is why the status label says “Strong evidence” for this one remnant, “Contested” for what the two shells
              mean and “Open” for how common the explosion is.
            </p>

            <p style={{ margin: '1.5rem 0 0.25rem' }}>
              <strong>Table 1: the white dwarf</strong>
            </p>
            <ResultsTable
              head={['Quantity', 'Value', 'Where it comes from']}
              minWidth={560}
              rows={[
                [
                  'The white dwarf’s weight in the remnant (the row for Prediction 1)',
                  `${result.simulationMassSolar.toFixed(3)} Suns = ${d.simulationCoreSolar} (the carbon-oxygen core) + ${d.simulationShellSolar} (the helium layer)`,
                  `Das and others (2025), the simulation that matches the two shells (model M10_03). A 2026 analysis of the remnant’s small-scale structure (Mandal and others) finds a core of about ${d.analysis2026CoreSolar} Sun and a layer of more than ${d.analysis2026ShellAboveSolar} Suns`,
                ],
                [
                  'The limit',
                  `${CHANDRASEKHAR_LIMIT_SOLAR_MASSES} Suns (NASA and Chandra say 1.4)`,
                  'Black Holes Experiment 9’s model, reused here; the same limit worked out to different accuracy',
                ],
                [
                  'How far below the limit',
                  `${result.simulationGapBelowLimitSolar.toFixed(3)} Suns: ${result.percentBelowLimit.toFixed(0)} percent below it, or ${(result.fractionOfLimit * 100).toFixed(0)} percent of the limit`,
                  `worked out here: ${CHANDRASEKHAR_LIMIT_SOLAR_MASSES} − ${result.simulationMassSolar.toFixed(3)}`,
                ],
                [
                  'The white dwarf’s size',
                  `a radius of about ${thousandsComma(roundTo(result.radiusKm, 10))} km = ${result.radiusEarths.toFixed(2)} Earth radii`,
                  'Black Holes Experiment 9’s formula for a white dwarf (a fit to a numerical calculation, good to about 3 percent up to 1.2 Suns and about 7 percent up to 1.35)',
                ],
                [
                  'A typical white dwarf (the yardstick)',
                  `${pictureRuns[0].massSolar} Suns, a radius of ${pictureRuns[0].radiusEarths.toFixed(2)} Earth radii`,
                  'NASA says a typical white dwarf is “half as massive as the Sun, yet only slightly bigger than Earth”; this page draws one of 0.6 Suns',
                ],
              ]}
            />
            <div style={{ ...paragraph, fontSize: '0.875rem', color: 'var(--text-muted)', marginTop: '0.5rem' }}>
              <p style={{ margin: '0 0 0.5rem' }}>
                <strong>What this table tells us.</strong>
              </p>
              <p style={{ margin: '0 0 0.5rem' }}>
                <strong>The weight.</strong> What it is: the weight of the white dwarf in the simulation that best matches the two shells, a core plus a thin helium layer. What it means: {result.simulationMassSolar.toFixed(3)} Suns
                is {result.percentBelowLimit.toFixed(0)} percent below the limit of {CHANDRASEKHAR_LIMIT_SOLAR_MASSES}. The 2026 analysis, which used a different feature of the remnant, finds a similar weight, at least about {twoA.analysis2026AtLeastSolar.toFixed(2)} Suns.
                Why it matters: if a white dwarf of this weight really exploded, then a white dwarf does not have to reach the limit to explode. The number is not a direct weighing: it is the weight of the model that fits.
              </p>
              <p style={{ margin: '0 0 0.5rem' }}>
                <strong>The size.</strong> What it is: how wide a white dwarf of that weight is. What it means: {result.radiusEarths.toFixed(2)} Earth radii, about {thousandsComma(roundTo(result.radiusKm, 10))} km, which is a little smaller than the Earth. A white dwarf of
                the limit’s size would be far smaller still. Why it matters: it shows how crushed a white dwarf is, and how little the explosion has to start with. The size comes from a formula, good to about 3 percent here.
              </p>
              <p style={{ margin: 0 }}>
                <strong>The helium layer.</strong> Das and others’ simulation has a layer of {d.simulationShellSolar} Suns, and the 2026 analysis finds more than {d.analysis2026ShellAboveSolar}. These two do not agree, because they come from different features of the remnant.
                This page uses the first and says so.
              </p>
            </div>

            <p style={{ margin: '1.5rem 0 0.25rem' }}>
              <strong>Table 2: the remnant</strong>
            </p>
            <ResultsTable
              head={['Quantity', 'Value', 'Where it comes from']}
              minWidth={560}
              rows={[
                [
                  'Radius of the inner calcium shell',
                  `${d.innerShellPc} ± ${d.shellUncertaintyPc} parsecs = ${result.innerShellLightYears.toFixed(1)} light-years`,
                  'Das and others (2025): the first of two peaks in the calcium light',
                ],
                [
                  'Radius of the outer calcium shell',
                  `${d.outerShellPc} ± ${d.shellUncertaintyPc} parsecs = ${result.outerShellLightYears.toFixed(1)} light-years`,
                  'Das and others (2025): the second peak',
                ],
                [
                  'The gap between the shells',
                  `${result.shellGapPc.toFixed(2)} parsecs = ${result.shellGapLightYears.toFixed(2)} light-years, about ${sigmaGap.toFixed(1)} times the combined give-or-take`,
                  'worked out here: the outer radius minus the inner one',
                ],
                [
                  'The remnant’s age',
                  `${ageLow} to ${ageHigh} years; this page uses ${result.ageYears}, the middle`,
                  'Das and others (2025), “very young (~300–350 yr)”',
                ],
                [
                  'Average speed of the inner shell',
                  `${thousandsComma(roundTo(innerRange[0], 10))} to ${thousandsComma(roundTo(innerRange[1], 10))} km/s over the ages; ${thousandsComma(roundTo(result.innerShellSpeedKmS, 10))} km/s at ${result.ageYears} years`,
                  'worked out here: radius ÷ age (an average, since the gas has slowed)',
                ],
                [
                  'Average speed of the outer shell (the row for Prediction 2)',
                  `${thousandsComma(roundTo(outerRange[0], 10))} to ${thousandsComma(roundTo(outerRange[1], 10))} km/s over the ages; ${thousandsComma(roundTo(result.outerShellSpeedKmS, 10))} km/s at ${result.ageYears} years, about ${(result.outerShellFractionOfLightSpeed * 100).toFixed(0)} percent of the speed of light`,
                  'worked out here: radius ÷ age',
                ],
                [
                  'Where the remnant is',
                  'in the Large Magellanic Cloud, about 150,000 to 160,000 light-years away',
                  'ESA/Hubble and ESO pages (they differ by about 6 percent)',
                ],
              ]}
            />
            <div style={{ ...paragraph, fontSize: '0.875rem', color: 'var(--text-muted)', marginTop: '0.5rem' }}>
              <p style={{ margin: '0 0 0.5rem' }}>
                <strong>What this table tells us.</strong>
              </p>
              <p style={{ margin: '0 0 0.5rem' }}>
                <strong>The two radii.</strong> What it is: how far from the centre the calcium glows brightest, in two places. What it means: {d.innerShellPc} and {d.outerShellPc} parsecs, about {result.innerShellLightYears.toFixed(1)} and {result.outerShellLightYears.toFixed(1)} light-years. Each
                is good to about {d.shellUncertaintyPc} parsecs, and the gap of {result.shellGapPc.toFixed(2)} is about {sigmaGap.toFixed(1)} times the two give-or-takes together, so the two peaks are separate. Why it matters: two separate shells are the
                pattern that simulations of a double detonation predict.
              </p>
              <p style={{ margin: '0 0 0.5rem' }}>
                <strong>The speeds.</strong> What it is: how far each shell has gone divided by the age. What it means: about {thousandsComma(roundTo(result.outerShellSpeedKmS, 100))} km/s for the outer shell, a few percent of the speed of light. For example, {d.outerShellPc} parsecs is about
                {' '}{result.outerShellLightYears.toFixed(1)} light-years, and in {result.ageYears} years light would go {result.ageYears} light-years, so the shell has gone about {(result.outerShellFractionOfLightSpeed * 100).toFixed(0)} percent as far as light would. Why it matters: it shows how violent the
                explosion was. The speed is an average, because the gas has slowed since the explosion, so it is not the speed at the start.
              </p>
              <p style={{ margin: 0 }}>
                <strong>The age.</strong> The paper gives a range, {ageLow} to {ageHigh} years, and this page takes the middle. Changing it changes the speeds, in the opposite direction: an older remnant means a lower average speed.
              </p>
            </div>

            <p style={{ margin: '1.5rem 0 0.25rem' }}>
              <strong>Table 3: the two routes side by side</strong>
            </p>
            <ResultsTable
              head={['Route', 'What it needs', 'What has been said about it']}
              minWidth={640}
              rows={[
                [
                  'Route 1: the white dwarf grows to the limit',
                  'Gas from a partner (or a merger) until the white dwarf nears 1.4 Suns, and the centre ignites (NASA)',
                  'The older, textbook route. The sources read here do not say what pattern of calcium it would leave.',
                ],
                [
                  'Route 2: a double detonation',
                  `A helium layer on the surface that ignites first and sets off the core. The simulation that matches SNR 0509-67.5 has ${result.simulationMassSolar.toFixed(3)} Suns in all`,
                  'Das and others (2025) and ESO: two shells of calcium, the outer one from the helium layer and the inner one from the core, match what is seen. Mandal and others (2026): the small-scale structure is consistent with it',
                ],
                [
                  'A different reading of the same two shells',
                  'One author (Soker, 2025) suggests a “lonely white dwarf” explosion (not a double detonation) in which instabilities during the explosion make the two calcium shells',
                  'Read in its abstract only. The paper says other explanations cannot be completely ruled out. It is why the label says “Contested”',
                ],
              ]}
            />
            <div style={{ ...paragraph, fontSize: '0.875rem', color: 'var(--text-muted)', marginTop: '0.5rem' }}>
              <p style={{ margin: 0 }}>
                <strong>What this table tells us.</strong> What it is: the three explanations that have been put forward for what made this remnant, set side by side with what each needs and what has been said about it. What
                it means: the first is the routine story, the second fits the two shells and a weight below the limit, and the third is another way to get two shells. Why it matters: the experiment does not choose between
                them. It shows what each says, and the tutor will help you think about what would tell them apart.
              </p>
            </div>

            <p style={{ margin: '1.5rem 0 0.5rem' }}>
              <strong>The papers behind these results.</strong> Kept until now, so that they did not give away the predictions. Links open in a new tab.
            </p>
            <ul style={{ margin: 0, paddingLeft: '1.25rem', fontSize: '0.875rem' }}>
              <li>
                <ExternalLink href="https://doi.org/10.1038/s41550-025-02589-5">Das, Seitenzahl, Ruiter, Röpke, Pakmor and others, “Calcium in a supernova remnant as a fingerprint of a sub-Chandrasekhar-mass explosion”</ExternalLink>{' '}
                (Nature Astronomy, 2025): the two calcium shells, their radii and the matching simulation.
              </li>
              <li>
                <ExternalLink href="https://arxiv.org/abs/2509.02422">Mandal, Ghavamian, Das, Seitenzahl, Mohamed and Ruiter, “Deciphering the explosion mechanism of Type Ia SNe using their remnants II”</ExternalLink>{' '}
                (Astrophysical Journal, 2026): the weight from the remnant’s small-scale structure.
              </li>
              <li>
                <ExternalLink href="https://arxiv.org/abs/2503.04709">Soker, “On the progenitor of the type Ia supernova remnant 0509-67.5”</ExternalLink> (2025): a different reading of the two shells.
              </li>
            </ul>
          </div>
        )}
        {/* The tutor, after the results: observe, compare with the predictions, a conceptual question, then the explanation. */}
        {done && sizePrediction !== null && speedPrediction !== null && (
          <WhiteDwarfExplosionTutor sizePrediction={sizePrediction} speedPrediction={speedPrediction} onExplained={onTutorComplete} />
        )}
      </div>
    </div>
  )
}
