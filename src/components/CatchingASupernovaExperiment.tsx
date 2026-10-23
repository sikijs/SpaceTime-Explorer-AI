import { useEffect, useState } from 'react'
import type { ReactNode } from 'react'
import {
  compareWithPublished,
  inSunLifetimes,
  LIGHT_YEARS_PER_PARSEC,
  LITERATURE,
  massEstimates,
  MASS_2026,
  oneInN,
  overlaps,
  restShare,
  runCatchingASupernova,
  SOLAR_MASS_KG,
  SUPERNOVA,
  sunLifetimeEnergyJ,
  whereInRange,
  G,
  ergFromJoules,
  joulesFromErg,
} from '../physics/catchingASupernova'
import type { LightTravelAnswer, VisibleShareAnswer } from '../physics/catchingASupernova'
import { ReferencePanel } from './EnergyMomentumExperiment'
import { LookForList, ResultsTable } from './WideBinariesExperiment'
import type { LookFor } from './WideBinariesExperiment'

// Frontier and Beyond, Experiment 13 (docs/experiments/frontier-and-beyond/13-catching-a-supernova.md).
// Step 4 builds the five-stage run and the three pictures, each with a guide: Picture 1 (the star's mass estimates) at stages 1 and 2, Picture 2 (the gas it shed) at
// stage 3 and Picture 3 (where the energy went, and how long ago the light left) at stages 4 and 5. The controls, the results, the tutor and the chapter summary are later steps.
// Step 3 builds the two predictions (their answer buttons, Run gated on both, and Start over); Run only records the predictions, because the run is a later step.
// Step 2 (the interface skeleton) builds the page's skeleton: the status line, the introduction with its new-word list, its assumptions and its "Want to know more?"
// links, one illustration (what happens in a core-collapse supernova) with its guide, and the collapsed "Words and formulas" panel. The two predictions, the run, the three
// pictures, the controls, the results and the tutor are later steps. All wording is draft for the owner's line-by-line approval (CLAUDE.md §28.1), written to the standard
// of §29. The introduction does not give the distance to M101 or the age of the light, the share of the energy that is light, the star's mass or the time before the
// explosion at which the gas was shed (those are what the predictions and the run show, §12). The interface only displays numbers from src/physics (CLAUDE.md §9); this
// step shows none of the results.

const VIEW_WIDTH = 560
const TEXT_COLOR = '#e2e8f0'
const MUTED_COLOR = '#94a3b8'
const ENVELOPE_COLOR = '#fb923c' // orange: the star's outer layer of hydrogen gas
const LAYER_COLOR = '#fcd34d' // yellow: the inner layers
const CORE_COLOR = '#f87171' // red: the core
const FALL_COLOR = '#38bdf8' // sky blue: material falling inward
const BLAST_COLOR = '#c084fc' // purple: material blown outward
const REMNANT_COLOR = '#e2e8f0' // pale: the neutron star
const ESTIMATE_COLOR = '#fb923c' // orange: an estimate of the star's mass
const NEW_COLOR = '#22d3ee' // cyan: the 2026 paper's two ranges
const GAS_COLOR = '#c084fc' // purple: the gas the star shed, and the gas's motion
const COLLAPSE_COLOR = '#f87171' // red: the energy freed by the collapse
const LIGHT_COLOR = '#fde047' // yellow: the visible light
const SUN_COLOR = '#ffffff' // white: the Sun's whole-life output, the yardstick
const RING_COLOR = '#94a3b8' // grey: Neptune's orbit, for scale
const YOURS_COLOR = '#ffffff' // white: the learner's own choice

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

// ---- Illustration: what happens in a core-collapse supernova (not to scale; it shows the idea, not SN 2023ixf) ----
function CollapseDrawing() {
  const height = 330
  const cy = 150
  const centres = [95, 280, 465] // the three panels
  const angles = [0, 45, 90, 135, 180, 225, 270, 315].map((d) => (d * Math.PI) / 180)
  return (
    <svg
      width={VIEW_WIDTH}
      height={height}
      viewBox={`0 0 ${VIEW_WIDTH} ${height}`}
      style={svgStyle}
      role="img"
      aria-label="Illustration, not to scale, in three panels, left to right. Panel 1, before: a large star drawn as nested circles, an outer orange layer of hydrogen gas, yellow inner layers and a red core at the centre. Panel 2, the core collapses: the same star, with the core shrunk to a small red ball and blue arrows pointing inward to it. Panel 3, the explosion: a tiny pale dot at the centre, the neutron star, with purple arrows pointing outward and a dashed purple circle for the outer layers being blown away"
    >
      <text x={20} y={22} fill={TEXT_COLOR} fontSize="13" fontWeight="bold">
        Illustration: what happens in a core-collapse supernova
      </text>

      {/* Panel 1: before. */}
      <SvgLines x={centres[0]} y={48} lines={['1. Before']} fill={TEXT_COLOR} bold anchor="middle" size={12} />
      <circle cx={centres[0]} cy={cy} r={72} fill={ENVELOPE_COLOR} fillOpacity={0.75} stroke={ENVELOPE_COLOR} strokeWidth={2} />
      <circle cx={centres[0]} cy={cy} r={46} fill={LAYER_COLOR} fillOpacity={0.85} stroke={LAYER_COLOR} strokeWidth={2} />
      <circle cx={centres[0]} cy={cy} r={22} fill={CORE_COLOR} stroke={CORE_COLOR} strokeWidth={2} />
      <SvgLines x={centres[0]} y={cy + 4} lines={['core']} fill="#0b1020" bold anchor="middle" />
      <SvgLines x={centres[0]} y={cy - 30} lines={['inner layers']} fill="#0b1020" bold anchor="middle" />
      <SvgLines x={centres[0]} y={cy - 56} lines={['outer layer']} fill="#0b1020" bold anchor="middle" />
      <SvgLines x={centres[0]} y={cy + 100} lines={['a red supergiant:', 'a very large, cool star']} fill={MUTED_COLOR} anchor="middle" />

      {/* Panel 2: the core collapses. */}
      <SvgLines x={centres[1]} y={48} lines={['2. The core collapses']} fill={TEXT_COLOR} bold anchor="middle" size={12} />
      <circle cx={centres[1]} cy={cy} r={72} fill={ENVELOPE_COLOR} fillOpacity={0.35} stroke={ENVELOPE_COLOR} strokeWidth={2} />
      <circle cx={centres[1]} cy={cy} r={46} fill={LAYER_COLOR} fillOpacity={0.35} stroke={LAYER_COLOR} strokeWidth={2} />
      <circle cx={centres[1]} cy={cy} r={8} fill={CORE_COLOR} stroke={CORE_COLOR} strokeWidth={2} />
      {angles.map((a, i) => (
        <Arrow key={i} x1={centres[1] + 42 * Math.cos(a)} y1={cy + 42 * Math.sin(a)} x2={centres[1] + 18 * Math.cos(a)} y2={cy + 18 * Math.sin(a)} color={FALL_COLOR} />
      ))}
      <SvgLines x={centres[1]} y={cy + 100} lines={['the core falls inward on itself,', 'in a fraction of a second']} fill={FALL_COLOR} bold anchor="middle" />

      {/* Panel 3: the explosion. */}
      <SvgLines x={centres[2]} y={48} lines={['3. Rebound and explosion']} fill={TEXT_COLOR} bold anchor="middle" size={12} />
      <circle cx={centres[2]} cy={cy} r={72} fill="none" stroke={BLAST_COLOR} strokeWidth={2} strokeDasharray="5 4" />
      <circle cx={centres[2]} cy={cy} r={4} fill={REMNANT_COLOR} />
      {angles.map((a, i) => (
        <Arrow key={i} x1={centres[2] + 16 * Math.cos(a)} y1={cy + 16 * Math.sin(a)} x2={centres[2] + 48 * Math.cos(a)} y2={cy + 48 * Math.sin(a)} color={BLAST_COLOR} />
      ))}
      <SvgLines x={centres[2] + 10} y={cy + 4} lines={['neutron', 'star']} fill={REMNANT_COLOR} bold />
      <SvgLines x={centres[2]} y={cy + 100} lines={['the outer layers are blown outward;', 'a neutron star is left behind']} fill={BLAST_COLOR} bold anchor="middle" />

      <SvgLines x={20} y={height - 8} lines={['Not to scale: the neutron star is millions of times smaller than the star it came from.']} fill={MUTED_COLOR} />
    </svg>
  )
}

const lookForDrawing: LookFor[] = [
  {
    look: 'panel 1: the nested circles, with the red core at the centre and the orange outer layer round the outside.',
    means: 'a red supergiant is built in layers, like an onion: a very hot, dense core in the middle, and a huge, thin, cool layer of gas round the outside.',
    matters: 'the explosion starts in the core, deep inside, but what we see from far away is the outer layer and what happens to it. That is why the star has to be understood in layers.',
  },
  {
    look: 'panel 2: the small red ball and the blue arrows pointing inward.',
    means: 'the core can no longer hold itself up, so it falls in on itself. It happens in a fraction of a second. If the collapsing core holds, it ends as a neutron star about 12 kilometres in radius (panel 3).',
    matters: 'this fall is where the energy of the whole explosion comes from, so everything the experiment asks about starts here.',
  },
  {
    look: 'panel 3: the tiny pale dot, the purple arrows pointing outward and the dashed purple circle.',
    means: 'the falling material is stopped and springs back, and drives a shock outward through the star. The outer layers are blown away (the dashed circle is where they are heading). What is left at the centre is a neutron star.',
    matters: 'the blown-away outer layers are what we photograph as the supernova. How the energy is shared between the blast, the light and everything else is what you will be asked about.',
  },
]

const REFERENCE_ENTRIES: { term: string; meaning: string }[] = [
  { term: 'Supernova', meaning: 'the explosion of a star at the end of its life, so bright that it can be seen from millions of light-years away for weeks or months. This experiment is about one kind, a core-collapse supernova, in which a very heavy star’s core collapses. (NASA: “The result is a huge explosion called a supernova.”)' },
  { term: 'Core collapse', meaning: 'what happens when the core of a very heavy star can no longer hold itself up against its own weight. It falls in on itself in a fraction of a second. NASA says: “The core collapses and then rebounds back to its original size, creating a shock wave that travels through the star’s outer layers.”' },
  { term: 'Neutron star', meaning: 'the very small, very dense ball that is left when a core collapses and holds. NASA: “The remnant core is a superdense neutron star.” It holds about 1.4 Suns’ worth of material in a ball only about 12 kilometres in radius, roughly the size of a city. Black Holes Experiment 9 explains what holds it up.' },
  { term: 'Rebound and shock wave', meaning: 'think of a ball dropped on a hard floor. It squashes, then springs back. In a supernova the falling material is stopped by the newly formed, extremely dense core and springs back, and the springing back sends a sudden sweep of pressure, a shock wave, outward through the star, like a wave through a crowd that all jump at once.' },
  { term: 'Neutrino', meaning: 'a tiny particle with almost no mass and no electric charge that hardly ever interacts with anything. CERN: “It is neutrinos’ weak interaction with matter that makes them almost impossible to detect”, and they can pass through the whole Earth. A supernova makes them in enormous numbers.' },
  { term: 'Red supergiant', meaning: 'a star much heavier than the Sun that has used up the hydrogen in its core and swollen to many times its old size, with a cooler, redder surface (Experiment 12). Betelgeuse is one, and so was the star in this experiment.' },
  { term: 'Progenitor', meaning: 'the star that existed before a supernova, “the one that came before”. Finding it in old pictures is rare, and it is what lets astronomers say what kind of star exploded.' },
  { term: 'Initial mass', meaning: 'how heavy a star was when it was born, in solar masses (one solar mass is the Sun’s mass). A star loses material through its life, so its mass just before the explosion is less than its initial mass. “17 solar masses” means 17 times as heavy as the Sun.' },
  { term: 'Circumstellar gas', meaning: 'gas that lies round a star, thrown off by the star itself. A red supergiant keeps shedding its outer layer into space, a bit like a pot boiling over, and the gas drifts away from the star. “Circum-” means “round”.' },
  { term: 'Spectrum', meaning: 'light spread out into its colours, like a rainbow. Each kind of gas leaves its own pattern of bright or dark lines in a spectrum, so a spectrum tells astronomers what a gas is made of, and (from how the lines are shifted) how it is moving.' },
  { term: 'Flash spectroscopy', meaning: 'taking a spectrum of a supernova in its first hours and days, before the blast has swept away the gas that lay close to the star. The explosion’s first light shines through and lights that gas up, so the lines of the gas show for a few days: a “flash” that tells astronomers what the star was shedding just before it exploded.' },
  { term: 'Light-year', meaning: 'the distance light travels in a year, about 9.5 million million kilometres. NASA says that because light takes time to cross space, looking at a faraway object is looking at it as it was in the past: we see the Sun as it was 8.3 minutes ago.' },
  { term: 'Astronomical unit (AU)', meaning: 'the average distance from the Earth to the Sun, about 150 million kilometres. Neptune, the farthest planet, is about 30 AU from the Sun.' },
  { term: 'Parsec and megaparsec', meaning: 'a parsec is a unit of distance used by astronomers, about 3.26 light-years. A megaparsec (Mpc) is a million parsecs, about 3.26 million light-years.' },
  { term: 'Log scale', meaning: 'a scale where each step along the axis multiplies the number by 10 instead of adding the same amount. It lets numbers that differ a million-fold fit on one picture. On Picture 3, a bar one step longer is 10 times more energy, and a bar three steps longer is 1,000 times more, so bars that look fairly close can differ enormously.' },
  { term: 'Joule and erg', meaning: 'two units of energy. One joule is about the energy it takes to lift an apple (about 100 grams) 1 metre. An erg is one ten-millionth of a joule, a unit astronomers often use because the energies in space are so huge. The numbers in this experiment come in both, and the experiment shows how to change from one to the other.' },
]

// The two prediction questions' answers (the specification's "Prediction Activity"). The labels do not say which answer is right.
const SHARE_CHOICES: ReadonlyArray<{ value: VisibleShareAnswer; label: string }> = [
  { value: 'about half', label: 'About half' },
  { value: '1 in 10', label: 'About 1 part in 10 (10 percent)' },
  { value: '1 in 100', label: 'About 1 part in 100 (1 percent)' },
  { value: '1 in 10,000', label: 'About 1 part in 10,000 (0.01 percent)' },
]
const TRAVEL_CHOICES: ReadonlyArray<{ value: LightTravelAnswer; label: string }> = [
  { value: 'a few months', label: 'A few months' },
  { value: 'about 20 thousand years', label: 'About 20 thousand years' },
  { value: 'about 20 million years', label: 'About 20 million years' },
]

// ---- Number formats (every value comes from the physics module) ----
const SUPERSCRIPT: Record<string, string> = { '-': '⁻', '0': '⁰', '1': '¹', '2': '²', '3': '³', '4': '⁴', '5': '⁵', '6': '⁶', '7': '⁷', '8': '⁸', '9': '⁹' }
// A number in the form 4.3 × 10⁵³.
function sciText(value: number, digits = 1): string {
  const [mantissa, exponent] = value.toExponential(digits).split('e')
  return `${mantissa} × 10${String(Number(exponent)).split('').map((c) => SUPERSCRIPT[c]).join('')}`
}
const millions = (value: number): string => (value / 1e6).toFixed(1)
const thousandsComma = (value: number): string => Math.round(value).toLocaleString('en-US')

// ---- The run: five named stages. The timer only paces the display; no number depends on it (CLAUDE.md §11). ----
const STAGE_MS = 2600
const LAST_STAGE = 5
const STAGE_NAMES = ['', 'The star before it exploded', 'How sure are we of its mass?', 'The gas it shed', 'Where did the energy go?', 'How long ago?']

// How each team's estimate was made, in a few words (only where the paper's abstract or title was read; see the specification's open items).
const METHOD_WORDS: Record<string, string> = {
  'Pledger and Shara': 'brightness against stellar models',
  'Kilpatrick and others': 'colours and brightness, dusty models',
  'Van Dyk and others': 'method not read',
  'Niu and others': 'dusty star’s colours; its neighbours gave 17 to 19',
  'Jencson and others': 'a luminous, dusty, variable star',
  'Qin and others': 'method not read',
  'Soraisam and others': 'how the star pulsed over 19 years',
}

// ---- Picture 1: seven estimates of the star's mass. Stage 1: the seven bars; stage 2: the 2026 paper's two ranges ----
const P1_LEFT = 215
const P1_RIGHT = 535
const P1_MIN = 4
const P1_MAX = 26
const p1x = (mass: number) => P1_LEFT + ((mass - P1_MIN) / (P1_MAX - P1_MIN)) * (P1_RIGHT - P1_LEFT)

function PictureOne({ stage }: { stage: number }) {
  const estimates = massEstimates()
  const height = 420
  const rowY = (i: number) => 62 + i * 30
  const axisY = 372
  return (
    <svg
      width={VIEW_WIDTH}
      height={height}
      viewBox={`0 0 ${VIEW_WIDTH} ${height}`}
      style={svgStyle}
      role="img"
      aria-label={`Picture 1: how heavy was the star? Seven published estimates of the star's mass when it was born, in solar masses, each drawn as an orange bar: ${estimates.map((e) => `${e.who} ${e.lowSolar === e.highSolar ? e.lowSolar : `${e.lowSolar} to ${e.highSolar}`}`).join('; ')}${stage >= 2 ? `. Two cyan bars from a 2026 paper: ${MASS_2026.lightCurveRangeSolar[0]} to ${MASS_2026.lightCurveRangeSolar[1]} from modelling the explosion's light, and ${MASS_2026.spectraRangeSolar[0]} to ${MASS_2026.spectraRangeSolar[1]} from later spectra` : ''}`}
    >
      <text x={20} y={22} fill={TEXT_COLOR} fontSize="13" fontWeight="bold">
        Picture 1: how heavy was the star before it exploded?
      </text>
      <SvgLines x={20} y={40} lines={['each bar is one team’s range for the star’s mass when it was born']} fill={MUTED_COLOR} />

      {/* The scale: initial mass in solar masses. */}
      {[5, 10, 15, 20, 25].map((m) => (
        <g key={m}>
          <line x1={p1x(m)} y1={50} x2={p1x(m)} y2={axisY} stroke={MUTED_COLOR} strokeOpacity={0.3} strokeDasharray="2 4" />
          <text x={p1x(m)} y={axisY + 16} fill={MUTED_COLOR} fontSize="10" textAnchor="middle">
            {m}
          </text>
        </g>
      ))}
      <line x1={P1_LEFT} y1={axisY} x2={P1_RIGHT} y2={axisY} stroke={MUTED_COLOR} />
      <SvgLines x={(P1_LEFT + P1_RIGHT) / 2} y={axisY + 32} lines={['star’s mass when it was born, in solar masses (1 = the Sun’s mass)']} fill={MUTED_COLOR} anchor="middle" />

      {/* Stage 1: the seven earlier estimates. */}
      {estimates.map((e, i) => (
        <g key={e.who}>
          <SvgLines x={20} y={rowY(i) - 2} lines={[`${e.who} ${e.year}`]} fill={TEXT_COLOR} bold size={10} />
          <SvgLines x={20} y={rowY(i) + 10} lines={[METHOD_WORDS[e.who]]} fill={MUTED_COLOR} size={9} />
          {e.lowSolar === e.highSolar ? (
            <circle cx={p1x(e.lowSolar)} cy={rowY(i) + 2} r={6} fill={ESTIMATE_COLOR} />
          ) : (
            <rect x={p1x(e.lowSolar)} y={rowY(i) - 5} width={p1x(e.highSolar) - p1x(e.lowSolar)} height={14} rx={3} fill={ESTIMATE_COLOR} fillOpacity={0.85} />
          )}
          <SvgLines x={e.highSolar <= 20 ? p1x(e.highSolar) + 8 : p1x(e.lowSolar) - 8} y={rowY(i) + 6} lines={[e.lowSolar === e.highSolar ? `${e.lowSolar}` : `${e.lowSolar} to ${e.highSolar}`]} fill={ESTIMATE_COLOR} bold size={10} anchor={e.highSolar <= 20 ? 'start' : 'end'} />
        </g>
      ))}

      {/* Stage 2: the 2026 paper's two ranges. */}
      {stage >= 2 && (
        <g>
          <line x1={20} y1={270} x2={P1_RIGHT} y2={270} stroke={MUTED_COLOR} strokeOpacity={0.4} />
          <SvgLines x={20} y={286} lines={['A 2026 paper (two ways of finding the mass):']} fill={NEW_COLOR} bold size={10} />
          {[
            { label: 'modelling the explosion’s light', range: MASS_2026.lightCurveRangeSolar, y: 308 },
            { label: 'spectra taken long after', range: MASS_2026.spectraRangeSolar, y: 334 },
          ].map((b) => (
            <g key={b.label}>
              <SvgLines x={20} y={b.y + 3} lines={[b.label]} fill={TEXT_COLOR} size={10} />
              <rect x={p1x(b.range[0])} y={b.y - 6} width={p1x(b.range[1]) - p1x(b.range[0])} height={14} rx={3} fill={NEW_COLOR} fillOpacity={0.85} />
              <SvgLines x={p1x(b.range[1]) + 8} y={b.y + 5} lines={[`${b.range[0]} to ${b.range[1]}`]} fill={NEW_COLOR} bold size={10} />
            </g>
          ))}
          <SvgLines x={P1_RIGHT} y={354} lines={[`the authors say dust could make brightness-based masses about ${MASS_2026.dustBiasSolar} too low`]} fill={NEW_COLOR} size={9} anchor="end" />
        </g>
      )}
    </svg>
  )
}

// ---- Picture 2: the gas the star shed, to scale in astronomical units, seen from above. Stage 3 ----
const P2_PX_PER_AU = 2.3
const P2_X = 280
const P2_Y = 205

interface YoursTwo {
  speed: number
  yearsBefore: [number, number]
}
interface YoursThree {
  collapseErg: number
  distanceMpc: number
  lightYears: number
}

function PictureTwo({ yearsBefore, shellAU, speed, yours }: { yearsBefore: [number, number]; shellAU: [number, number]; speed: number; yours: YoursTwo | null }) {
  const height = 400
  const px = (au: number) => au * P2_PX_PER_AU
  const [rin, rout] = [px(shellAU[0]), px(shellAU[1])]
  const neptune = 30
  return (
    <svg
      width={VIEW_WIDTH}
      height={height}
      viewBox={`0 0 ${VIEW_WIDTH} ${height}`}
      style={svgStyle}
      role="img"
      aria-label={`Picture 2, to scale, seen from above: the star as a tiny dot at the centre; a dashed grey ring for Neptune's orbit, ${neptune} astronomical units; and a purple band of dense gas from ${shellAU[0].toFixed(1)} to ${shellAU[1].toFixed(1)} astronomical units from the star. At a gas speed of ${speed} kilometres per second, the inner edge of the gas was shed ${yearsBefore[0].toFixed(1)} years before the explosion and the outer edge ${yearsBefore[1].toFixed(1)} years before`}
    >
      <text x={20} y={22} fill={TEXT_COLOR} fontSize="13" fontWeight="bold">
        Picture 2: the gas the star shed in its last years
      </text>
      <SvgLines x={20} y={40} lines={['seen from above, to scale (1 AU is the Earth’s distance from the Sun)']} fill={MUTED_COLOR} />

      {/* The dense gas: a band between two circles. */}
      <path
        d={`M ${P2_X - rout} ${P2_Y} a ${rout} ${rout} 0 1 0 ${2 * rout} 0 a ${rout} ${rout} 0 1 0 ${-2 * rout} 0 Z M ${P2_X - rin} ${P2_Y} a ${rin} ${rin} 0 1 1 ${2 * rin} 0 a ${rin} ${rin} 0 1 1 ${-2 * rin} 0 Z`}
        fill={GAS_COLOR}
        fillOpacity={0.45}
        fillRule="evenodd"
        stroke={GAS_COLOR}
        strokeWidth={1.5}
      />
      <circle cx={P2_X} cy={P2_Y} r={px(neptune)} fill="none" stroke={RING_COLOR} strokeWidth={1.2} strokeDasharray="4 4" />
      <SvgLines x={P2_X} y={P2_Y - px(neptune) + 16} lines={['Neptune’s orbit', `(${neptune} AU), for scale`]} fill={RING_COLOR} anchor="middle" size={9} />
      <circle cx={P2_X} cy={P2_Y} r={3} fill={LIGHT_COLOR} />
      <SvgLines x={P2_X} y={P2_Y + 16} lines={['the star (far too', 'small to show at', 'this scale)']} fill={LIGHT_COLOR} anchor="middle" size={9} />

      {/* The two edges of the gas, with the years before the explosion at which each was shed. */}
      <line x1={P2_X - rin} y1={P2_Y} x2={P2_X - rout - 4} y2={P2_Y} stroke={GAS_COLOR} strokeWidth={1} strokeDasharray="2 3" />
      <SvgLines x={P2_X - rout - 6} y={P2_Y - 18} lines={['inner edge of the gas:', `${shellAU[0].toFixed(1)} AU`, `shed ${yearsBefore[0].toFixed(1)} years`, 'before the explosion']} fill={GAS_COLOR} bold anchor="end" size={9} />
      <SvgLines x={P2_X + rout + 6} y={P2_Y - 18} lines={['outer edge of the gas:', `${shellAU[1].toFixed(1)} AU`, `shed ${yearsBefore[1].toFixed(1)} years`, 'before the explosion']} fill={GAS_COLOR} bold size={9} />
      <SvgLines x={P2_X} y={height - 10} lines={[`gas speed taken as ${speed} km/s (the authors’ assumption): time = radius ÷ speed`]} fill={MUTED_COLOR} anchor="middle" />
      {/* The learner's own speed (after the run): white. */}
      {yours && (
        <SvgLines x={P2_X} y={height - 30} lines={[`your setting (white): ${yours.speed} km/s, so the gas was shed ${yours.yearsBefore[0].toFixed(1)} to ${yours.yearsBefore[1].toFixed(1)} years before`]} fill={YOURS_COLOR} bold anchor="middle" size={10} />
      )}
    </svg>
  )
}

// ---- Picture 3: where the energy went, on a log scale (stage 4), and how long ago the light left (stage 5) ----
const P3_LEFT = 175
const P3_MIN_LOG = 48
const P3_MAX_LOG = 55
const P3_PX_PER_DECADE = (545 - P3_LEFT) / (P3_MAX_LOG - P3_MIN_LOG)
const p3x = (erg: number) => P3_LEFT + (Math.log10(erg) - P3_MIN_LOG) * P3_PX_PER_DECADE

function PictureThree({ stage, yours }: { stage: number; yours: YoursThree | null }) {
  const run = runCatchingASupernova()
  const height = 500
  const collapseErg = run.collapseErg
  const gasErg = ergFromJoules(run.gasMotionJ)
  const lightErg = ergFromJoules(run.lightJ)
  const sunErg = ergFromJoules(sunLifetimeEnergyJ())
  const axisY = 280
  const rows = [
    { name: 'the collapse', sub: 'the energy it frees', erg: collapseErg, color: COLLAPSE_COLOR, y: 110 },
    { name: 'the blast', sub: 'the motion of the blown-off gas', erg: gasErg, color: GAS_COLOR, y: 160 },
    { name: 'the visible light', sub: 'what telescopes photograph', erg: lightErg, color: LIGHT_COLOR, y: 210 },
  ]
  const lightHigh = SUPERNOVA.lightRangeErg[1]
  return (
    <svg
      width={VIEW_WIDTH}
      height={height}
      viewBox={`0 0 ${VIEW_WIDTH} ${height}`}
      style={svgStyle}
      role="img"
      aria-label={`Picture 3: where did the energy go? Three horizontal bars on a scale where each step to the right is ten times more energy: the collapse frees ${sciText(collapseErg)} erg, the motion of the blown-off gas carries ${sciText(gasErg)} erg and the visible light carries ${sciText(lightErg)} erg, up to ${sciText(lightHigh)}. A white dashed line marks the Sun's whole-life output, ${sciText(sunErg)} erg. The light's bar is about 1 part in ${thousandsComma(run.lightOneIn)} of the collapse's${stage >= 5 ? `. Below, a strip shows that the light took ${millions(run.lightTravelYears)} million years to arrive from M101` : ''}`}
    >
      <text x={20} y={22} fill={TEXT_COLOR} fontSize="13" fontWeight="bold">
        Picture 3: where did the energy go?
      </text>
      <SvgLines x={20} y={40} lines={['energy on a log scale: each step to the right is 10 times more (1 erg = 0.0000001 joule)']} fill={MUTED_COLOR} />

      {/* The log scale. */}
      {[48, 49, 50, 51, 52, 53, 54, 55].map((e) => (
        <g key={e}>
          <line x1={p3x(10 ** e)} y1={56} x2={p3x(10 ** e)} y2={axisY} stroke={MUTED_COLOR} strokeOpacity={0.25} strokeDasharray="2 4" />
          <text x={p3x(10 ** e)} y={axisY + 14} fill={MUTED_COLOR} fontSize="10" textAnchor="middle">
            {sciText(10 ** e, 0).replace('1 × ', '')}
          </text>
        </g>
      ))}
      <line x1={P3_LEFT} y1={axisY} x2={545} y2={axisY} stroke={MUTED_COLOR} />
      <SvgLines x={(P3_LEFT + 545) / 2} y={axisY + 30} lines={['energy, in erg (10⁷ erg = 1 joule)']} fill={MUTED_COLOR} anchor="middle" />

      {/* The three bars. */}
      {rows.map((r) => (
        <g key={r.name}>
          <SvgLines x={20} y={r.y} lines={[r.name]} fill={TEXT_COLOR} bold size={11} />
          <SvgLines x={20} y={r.y + 13} lines={[r.sub]} fill={MUTED_COLOR} size={9} />
          <rect x={P3_LEFT} y={r.y - 12} width={p3x(r.erg) - P3_LEFT} height={26} rx={3} fill={r.color} fillOpacity={0.85} />
        </g>
      ))}
      {/* The literature range for the light: a paler extension, because SN 2023ixf's own value is not yet read. */}
      <rect x={p3x(lightErg)} y={198} width={p3x(lightHigh) - p3x(lightErg)} height={26} rx={3} fill={LIGHT_COLOR} fillOpacity={0.3} stroke={LIGHT_COLOR} strokeDasharray="3 3" />
      <SvgLines x={p3x(collapseErg) - 6} y={114} lines={[`${sciText(collapseErg)} erg`]} fill="#0b1020" bold anchor="end" size={11} />
      <SvgLines x={p3x(gasErg) + 8} y={164} lines={[`${sciText(gasErg)} erg`]} fill={GAS_COLOR} bold size={11} />
      <SvgLines x={P3_LEFT} y={246} lines={[`${sciText(lightErg)} erg`, `(the pale part: up to ${sciText(lightHigh)})`]} fill={LIGHT_COLOR} bold size={10} />

      {/* The learner's own core (after the run): a white mark on the collapse bar. */}
      {yours && (
        <g>
          <line x1={p3x(yours.collapseErg)} y1={96} x2={p3x(yours.collapseErg)} y2={138} stroke={YOURS_COLOR} strokeWidth={3} />
          <SvgLines x={p3x(yours.collapseErg)} y={92} lines={[`your setting: ${sciText(yours.collapseErg)} erg`]} fill={YOURS_COLOR} bold anchor="end" size={9} />
        </g>
      )}

      {/* The Sun's whole-life output: a yardstick. */}
      <line x1={p3x(sunErg)} y1={80} x2={p3x(sunErg)} y2={axisY} stroke={SUN_COLOR} strokeWidth={1.5} strokeDasharray="6 4" />
      <SvgLines x={p3x(sunErg) - 6} y={64} lines={['the Sun’s whole-life output:', `${sciText(sunErg)} erg`]} fill={SUN_COLOR} bold anchor="end" size={9} />

      {/* Stage 5: how long ago the light left. */}
      {stage >= 5 && (
        <g>
          <line x1={20} y1={336} x2={540} y2={336} stroke={MUTED_COLOR} strokeOpacity={0.4} />
          <SvgLines x={20} y={356} lines={['How long ago? The light we saw in May 2023 had to cross the distance to M101.']} fill={TEXT_COLOR} bold size={11} />
          <Arrow x1={60} y1={412} x2={500} y2={412} color={LIGHT_COLOR} />
          <circle cx={60} cy={412} r={6} fill={COLLAPSE_COLOR} />
          <SvgLines x={60} y={386} lines={[`${millions(run.lightTravelYears)} million years ago`]} fill={COLLAPSE_COLOR} bold anchor="middle" size={10} />
          <SvgLines x={60} y={440} lines={['the star explodes;', 'the light sets out']} fill={COLLAPSE_COLOR} anchor="middle" size={9} />
          <circle cx={500} cy={412} r={6} fill={LIGHT_COLOR} />
          <SvgLines x={500} y={386} lines={['May 2023']} fill={LIGHT_COLOR} bold anchor="middle" size={10} />
          <SvgLines x={500} y={440} lines={['the light arrives;', 'it is seen from Earth']} fill={LIGHT_COLOR} anchor="middle" size={9} />
          <SvgLines x={280} y={404} lines={[`${SUPERNOVA.distanceMpc} Mpc = ${millions(run.lightYears)} million light-years`]} fill={TEXT_COLOR} bold anchor="middle" size={10} />
          <SvgLines x={280} y={432} lines={['travel time = distance ÷ the speed of light']} fill={MUTED_COLOR} anchor="middle" size={9} />
          {yours && (
            <SvgLines x={280} y={height - 26} lines={[`your setting (white): ${yours.distanceMpc} Mpc = ${millions(yours.lightYears)} million light-years, so the light left ${millions(yours.lightYears)} million years ago`]} fill={YOURS_COLOR} bold anchor="middle" size={10} />
          )}
          <SvgLines x={280} y={height - 8} lines={['not to scale in time: the strip only shows the order']} fill={MUTED_COLOR} anchor="middle" size={9} />
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

const pct = (n: number): string => {
  const a = Math.abs(n)
  return a < 10 ? a.toFixed(1) : String(Math.round(a))
}
const isSame = (n: number): boolean => Math.abs(n) < 1e-9
const word = (sign: -1 | 0 | 1, bigger: string, smaller: string, same: string): string => (sign === 0 ? same : sign < 0 ? smaller : bigger)

interface CatchingASupernovaExperimentProps {
  onComplete?: () => void
}

export function CatchingASupernovaExperiment({ onComplete }: CatchingASupernovaExperimentProps) {
  const [sharePrediction, setSharePrediction] = useState<VisibleShareAnswer | null>(null)
  const [travelPrediction, setTravelPrediction] = useState<LightTravelAnswer | null>(null)
  const [status, setStatus] = useState<'idle' | 'running' | 'complete'>('idle')
  const [stage, setStage] = useState(0)
  // The controls that appear after the run.
  const [coreMassChoice, setCoreMassChoice] = useState<number>(SUPERNOVA.coreMassSolar)
  const [coreRadiusChoice, setCoreRadiusChoice] = useState<number>(SUPERNOVA.coreRadiusKm)
  const [distanceChoice, setDistanceChoice] = useState<number>(SUPERNOVA.distanceMpc)
  const [speedChoice, setSpeedChoice] = useState<number>(SUPERNOVA.windSpeedKmS)
  const hasRun = status !== 'idle'
  const done = status === 'complete'
  const bothPredicted = sharePrediction !== null && travelPrediction !== null

  // Presentation only: advances one stage at a time. The numbers do not depend on this timer (CLAUDE.md §11).
  useEffect(() => {
    if (status !== 'running') return
    const timer = window.setTimeout(() => {
      if (stage < LAST_STAGE) {
        setStage(stage + 1)
      } else {
        setStatus('complete')
        onComplete?.()
      }
    }, STAGE_MS)
    return () => window.clearTimeout(timer)
  }, [status, stage, onComplete])

  function startOver() {
    setSharePrediction(null)
    setTravelPrediction(null)
    setStatus('idle')
    setStage(0)
    setCoreMassChoice(SUPERNOVA.coreMassSolar)
    setCoreRadiusChoice(SUPERNOVA.coreRadiusKm)
    setDistanceChoice(SUPERNOVA.distanceMpc)
    setSpeedChoice(SUPERNOVA.windSpeedKmS)
  }
  function run() {
    setStage(1)
    setStatus('running')
  }

  // Every number below comes from the physics module (CLAUDE.md §9).
  const result = runCatchingASupernova()
  const estimates = massEstimates()
  const byName = (who: string) => estimates.find((e) => e.who === who)!
  const niu = byName('Niu and others')
  const jencson = byName('Jencson and others')
  const pledger = byName('Pledger and Shara')
  const lowest = estimates.reduce((a, b) => (a.highSolar < b.highSolar ? a : b))
  const highest = estimates.reduce((a, b) => (a.lowSolar > b.lowSolar ? a : b))
  // The overall range of the estimates (not the same as `lowest` and `highest`, which are the pair that share the least).
  const top = estimates.reduce((a, b) => (a.highSolar > b.highSolar ? a : b))
  const overallLow = Math.min(...estimates.map((e) => e.lowSolar))
  const overallHigh = top.highSolar
  const [innerCm, outerCm] = SUPERNOVA.gasShellRadiiCm
  const speedCmS = SUPERNOVA.windSpeedKmS * 1e5
  const outerSeconds = outerCm / speedCmS
  const massKg = SUPERNOVA.coreMassSolar * SOLAR_MASS_KG
  const lightOneInRounded = Math.round(result.lightOneIn / 1000) * 1000
  const settings = { coreMassSolar: coreMassChoice, coreRadiusKm: coreRadiusChoice, distanceMpc: distanceChoice, windSpeedKmS: speedChoice }
  const mine = runCatchingASupernova(settings)
  const cmp = compareWithPublished(settings)
  const allPublished = cmp.coreMass === 0 && cmp.coreRadius === 0 && isSame(cmp.distancePercent) && cmp.windSpeed === 0
  const coreChanged = cmp.coreMass !== 0 || cmp.coreRadius !== 0
  const yoursTwo: YoursTwo | null = done ? { speed: speedChoice, yearsBefore: mine.gasShedYearsBefore } : null
  const yoursThree: YoursThree | null = done ? { collapseErg: mine.collapseErg, distanceMpc: distanceChoice, lightYears: mine.lightYears } : null
  // The range of the light's share over all nine core settings (for "What your numbers show").
  const shares = SUPERNOVA.coreMassChoicesSolar.flatMap((m) => SUPERNOVA.coreRadiusChoicesKm.map((r) => runCatchingASupernova({ coreMassSolar: m, coreRadiusKm: r }).lightOneIn))
  const sharesLow = Math.min(...shares)
  const sharesHigh = Math.max(...shares)
  const oneInText = (x: number): string => thousandsComma(x)
  const neutrinoRange = `${LITERATURE.neutrinoEnergyErg[0] / 1e53} to ${LITERATURE.neutrinoEnergyErg[1] / 1e53} × 10⁵³`
  const rangeText = (check: { verdict: 'inside' | 'below' | 'above'; factor: number }): string =>
    check.verdict === 'inside' ? `Inside the published range for neutrinos (${neutrinoRange} erg).` : `Outside the published range for neutrinos (${neutrinoRange} erg): ${check.verdict} it by a factor of ${check.factor.toFixed(1)}.`
  const sunWhole = ergFromJoules(sunLifetimeEnergyJ())
  const rest = restShare(result.collapseJ, result.gasMotionJ, result.lightJ)
  const wideCheck = whereInRange(ergFromJoules(result.gasMotionJ), LITERATURE.explosionEnergyWideErg)
  const narrowCheck = whereInRange(ergFromJoules(result.gasMotionJ), LITERATURE.explosionEnergyErg)
  const collapseCheck = whereInRange(result.collapseErg, LITERATURE.neutrinoEnergyErg)
  const farMpc = SUPERNOVA.distanceMpc + 0.15
  const nearMpc = SUPERNOVA.distanceMpc - 0.15
  const formulaEntries: { term: string; meaning: string }[] = [
    {
      term: 'The energy of a collapse (formula)',
      meaning: `E = G × M² ÷ R, the gravitational energy of a neutron star of mass M and radius R (G is the gravitational constant, ${sciText(G, 3)} in SI units). For ${SUPERNOVA.coreMassSolar} Suns, M = ${SUPERNOVA.coreMassSolar} × ${sciText(SOLAR_MASS_KG, 3)} kg = ${sciText(massKg)} kg, and R = ${SUPERNOVA.coreRadiusKm * 1000} m, so E = ${sciText(G, 3)} × (${sciText(massKg)})² ÷ ${SUPERNOVA.coreRadiusKm * 1000} = ${sciText(result.collapseJ)} J = ${sciText(result.collapseErg)} erg. It is a rough estimate: a ball of the same mass and size but the same density throughout would give 3/5 of it.`,
    },
    {
      term: 'A share of the energy (formula)',
      meaning: `share = the part ÷ the whole, and “1 part in N” means N = the whole ÷ the part. For the light: ${sciText(ergFromJoules(result.lightJ))} ÷ ${sciText(result.collapseErg)} = ${(result.lightShare * 100).toFixed(4)} percent, so N = ${oneInText(result.lightOneIn)}. For comparison, 1 part in 43,000 is about one minute out of a 30-day month.`,
    },
    {
      term: 'The Sun’s whole-life output (formula)',
      meaning: `the Sun’s power (${sciText(3.828e26, 3)} watts, which is joules a second) times about ten billion years (${sciText(1e10, 0)} × ${thousandsComma(365.25 * 86400)} seconds) = ${sciText(sunLifetimeEnergyJ())} J = ${sciText(sunWhole)} erg. The collapse is ${sciText(result.collapseErg)} ÷ ${sciText(sunWhole)} = about ${Math.round(result.sunLifetimes.collapse)} times that.`,
    },
    {
      term: 'The light-travel time (formula)',
      meaning: `time = distance ÷ the speed of light. In the astronomers’ units this is easy: one light-year is how far light goes in one year, so a distance of ${millions(result.lightYears)} million light-years takes ${millions(result.lightTravelYears)} million years. The distance in light-years is the distance in megaparsecs times ${LIGHT_YEARS_PER_PARSEC} million: ${SUPERNOVA.distanceMpc} × ${LIGHT_YEARS_PER_PARSEC} = ${(SUPERNOVA.distanceMpc * LIGHT_YEARS_PER_PARSEC).toFixed(2)} million.`,
    },
    {
      term: 'How long before the explosion the gas was shed (formula)',
      meaning: `time = radius ÷ speed. For the outer edge: ${sciText(outerCm)} cm ÷ ${sciText(speedCmS)} cm/s = ${sciText(outerSeconds)} s = ${result.gasShedYearsBefore[1].toFixed(1)} years. Doubling the speed halves the time, and doubling the radius doubles it.`,
    },
  ]
  const lookForPictureOne: LookFor[] = [
    {
      look: 'the seven orange bars, one for each team’s estimate of the star’s mass when it was born, and the number at the end of each bar.',
      means: `each bar is the range of masses that team gives, from ${lowest.who}’s ${lowest.lowSolar} to ${lowest.highSolar} Suns up to ${top.who}’s ${top.lowSolar} to ${top.highSolar}. A long bar means the team is less sure. The dot is an estimate with no range quoted.`,
      matters: 'the star was photographed before it exploded, so you might expect everyone to find the same mass. The mass decides how the star lived and how it died, so it is worth knowing, and the teams do not agree.',
    },
    {
      look: `a pair of bars that do not touch, such as ${pledger.who}’s (${pledger.lowSolar} to ${pledger.highSolar}) and ${jencson.who}’s (${jencson.lowSolar} to ${jencson.highSolar}), compared with a pair that overlap, such as ${niu.who}’s (${niu.lowSolar} to ${niu.highSolar}) and ${jencson.who}’s.`,
      means: `${overlaps(pledger, jencson) ? 'These two ranges share some values.' : 'These two ranges share no value at all.'} ${overlaps(niu, jencson) ? 'The other pair share values.' : 'The other pair share no value.'} The lowest and the highest estimates ${overlaps(lowest, highest) ? 'overlap' : 'do not overlap'}.`,
      matters: 'if two estimates share no value, the teams are not just giving and taking a little: they are using methods that give different answers. That is why the mass is labelled contested, not settled. The experiment does not say which team is right.',
    },
    {
      look: `the two cyan bars that appear in stage 2: ${MASS_2026.lightCurveRangeSolar[0]} to ${MASS_2026.lightCurveRangeSolar[1]} from modelling the explosion’s light, and ${MASS_2026.spectraRangeSolar[0]} to ${MASS_2026.spectraRangeSolar[1]} from spectra taken long after.`,
      means: `even one paper, in 2026, gets two answers from two methods, and its authors say that dust round the star could make masses worked out from the star’s brightness about ${MASS_2026.dustBiasSolar} Suns too low. That is the authors’ explanation, and this experiment does not decide whether it is right.`,
      matters: 'the dust may be why the star looked fainter, and so lighter, in the old pictures. The disagreement may be as much about the dust as about the star.',
    },
  ]
  const lookForPictureTwo: LookFor[] = [
    {
      look: 'the dashed grey ring, Neptune’s orbit, and the tiny yellow dot at the centre.',
      means: 'the ring is 30 AU from the centre, the farthest planet’s distance from the Sun, so you can judge the scale. The dot is the star, far too small to show at this scale.',
      matters: 'the gas is not a small cloud next to the star. It reaches out past the edge of our own Solar System.',
    },
    {
      look: 'the purple band between the two circles.',
      means: `the dense gas the first spectra revealed. It runs from ${result.gasShellAU[0].toFixed(1)} AU (${sciText(innerCm)} cm) out to ${result.gasShellAU[1].toFixed(1)} AU (${sciText(outerCm)} cm) from the star, so its inner edge is just past Neptune’s orbit.`,
      matters: 'gas this thick, so close to the star, is not the star’s usual stream of gas. It is evidence that the star was shedding gas unusually fast just before it exploded.',
    },
    {
      look: 'the two labels with years: the inner edge and the outer edge.',
      means: `if the gas moves out at ${result.windSpeedKmS} km/s, the gas now at the outer edge left the star ${result.gasShedYearsBefore[1].toFixed(1)} years before the explosion, and the gas at the inner edge ${result.gasShedYearsBefore[0].toFixed(1)} years before. That is the paper’s “3 to 6 years” (the speed of ${result.windSpeedKmS} km/s is the authors’ assumption, not a measurement).`,
      matters: 'a distance and a speed give a time, so the picture tells us how long before the end the star started shedding gas. If the real speed is different, the times change in proportion, which you can try later.',
    },
  ]
  const lookForPictureThree: LookFor[] = [
    {
      look: 'the three bars: the collapse (red), the blast (purple) and the visible light (yellow).',
      means: `the red bar is the energy the collapse frees, ${sciText(result.collapseErg)} erg. The purple bar is the motion of the blown-off gas, ${sciText(ergFromJoules(result.gasMotionJ))} erg, and the yellow bar the visible light, ${sciText(ergFromJoules(result.lightJ))} erg. On this scale each step to the right is 10 times more, so the yellow bar is far, far shorter than it looks: the light is about 1 part in ${thousandsComma(lightOneInRounded)} of the collapse’s energy.`,
      matters: 'the flash we photograph is only a tiny share of the energy of the event. This is what you were asked to guess in Prediction 1. Where the rest of the collapse’s energy goes is for the tutor.',
    },
    {
      look: 'the white dashed line, the Sun’s whole-life output.',
      means: `it marks the energy the Sun will give out over about ten billion years, ${sciText(ergFromJoules(sunLifetimeEnergyJ()))} erg. The blast’s motion is about ${inSunLifetimes(result.gasMotionJ).toFixed(1)} of that, the collapse about ${Math.round(inSunLifetimes(result.collapseJ))} times it, and the visible light only about ${inSunLifetimes(result.lightJ).toFixed(3)} of it.`,
      matters: `the supernova’s light is about ${(inSunLifetimes(result.lightJ) * 100).toFixed(1)} percent of all the Sun will ever give out (up to about ${(inSunLifetimes(joulesFromErg(SUPERNOVA.lightRangeErg[1])) * 100).toFixed(0)} percent at the top of the range), released in weeks. That is a great deal of light, and it is still a tiny share of what the collapse frees.`,
    },
    {
      look: 'the pale, dashed extension of the yellow bar.',
      means: `the light given out by supernovae of this kind is usually between ${sciText(SUPERNOVA.lightRangeErg[0])} and ${sciText(SUPERNOVA.lightRangeErg[1])} erg. SN 2023ixf’s own value is not used here, so the page shows the range.`,
      matters: `even at the top of the range the light is only about 1 part in ${thousandsComma(Math.round(oneInN(joulesFromErg(SUPERNOVA.lightRangeErg[1]), result.collapseJ) / 100) * 100)} of the collapse. The answer to Prediction 1 does not depend on the exact value.`,
    },
    {
      look: 'the strip at the bottom (stage 5): the red dot on the left, the yellow dot on the right and the arrow between them.',
      means: `M101 is ${SUPERNOVA.distanceMpc} Mpc, or ${millions(result.lightYears)} million light-years, away. Light travels one light-year in a year, so the light that reached Earth in May 2023 left the star about ${millions(result.lightTravelYears)} million years earlier.`,
      matters: 'we are looking at the past. The star exploded long before there were humans, and everything the experiment says about it happened that long ago. This is what Prediction 2 asked.',
    },
  ]
  return (
    <div>
      <h2>Experiment 13 — Catching a Supernova in the Act: What Exploded, and Where Did the Energy Go? (SN 2023ixf)</h2>
      <div className="exp-card" style={{ marginTop: '2rem', padding: '1.5rem' }}>
        <p style={{ marginTop: 0, marginBottom: '1.5rem', fontSize: '0.875rem' }}>
          <strong>
            Where this stands (as of October 2026): in May 2023 a red supergiant exploded in a galaxy called M101, and astronomers had photographed the star before it blew
            up. How heavy it was is still debated. What the evidence adds up to is shown after you press Run, so that you can guess first.
          </strong>
        </p>

        <div style={{ marginBottom: '1.5rem' }}>
          <p style={paragraph}>
            <strong>The question.</strong> When a very large star dies, it explodes, and for weeks the explosion can be seen from millions of light-years away. That sounds like the
            biggest event imaginable, but how much of its energy do we actually see? And what can we learn about the star itself, from pictures taken before it exploded and
            from the first light afterwards? This experiment follows one real explosion, a supernova called SN 2023ixf.
          </p>

          <p style={paragraph}>
            <strong>Where we left off.</strong> In Experiment 12 you met Betelgeuse, a red supergiant near the end of its life, and learned that a very large, aging star
            swells and cools. In Black Holes Experiment 9 you saw what can hold up a dead star’s core, and in Spacetime Geometry Experiment 4 you saw that what we see is the
            past, because light takes time to arrive. All three come back here.
          </p>

          <p style={paragraph}>
            <strong>What a supernova is.</strong> A star shines because its core is making energy, and the energy pushing outward holds the star up against its own weight.
            In a very heavy star, a time comes when the core can no longer do that. With nothing holding it up, the core falls in on itself, in a fraction of a second. NASA
            describes what happens next: the core collapses and then rebounds, “creating a shock wave that travels through the star’s outer layers”, and the result is “a huge
            explosion called a supernova”. A good picture is a ball dropped on a hard floor: it squashes, then springs back, and the springing back is what drives the
            outer layers away. At the centre, “the remnant core is a superdense neutron star”: about 1.4 Suns’ worth of material squeezed into a ball only about 12
            kilometres in radius, roughly the size of a city. The illustration below shows the three steps.
          </p>

          <p style={paragraph}>
            <strong>The star we can see before it explodes.</strong> A supernova is a rare event in any one galaxy, and almost always the star that exploded is unknown,
            because nobody was looking at that star before. SN 2023ixf was different. M101, a spiral galaxy often called the Pinwheel Galaxy, had been photographed many times,
            including by the Hubble Space Telescope and the Spitzer Space Telescope. After the explosion, astronomers looked back through the old pictures, found a star
            at the spot, and could say what it had been: a cool, dusty red supergiant, the same kind of star as Betelgeuse. How heavy it was is much harder to say, and
            different teams, using different methods, have found different answers.
          </p>

          <p style={paragraph}>
            <strong>What was found.</strong> A Japanese amateur astronomer, Kōichi Itagaki, found the supernova on 19 May 2023. Astronomers all over the world pointed
            their telescopes at it. It was the closest supernova in about ten years. In the first days after the explosion, spectra of its light showed that
            the star was surrounded by dense gas that it had thrown off before it exploded, so the star had been shedding its outer layer faster than usual, in the years
            just before the end.
          </p>

          <div style={{ marginBottom: '0.75rem' }}>
            <CollapseDrawing />
          </div>
          <div style={{ fontSize: '0.875rem', color: 'var(--text-muted)', marginBottom: '0.75rem' }}>
            <p style={paragraph}>
              <strong>How to read this illustration.</strong> It shows the idea of a core-collapse supernova in three steps, from left to right. It is a sketch of any star of
              this kind, not of SN 2023ixf itself, and it is not to scale.
            </p>
            <ul style={{ margin: '0 0 0.75rem', paddingLeft: '1.25rem' }}>
              <li>
                <strong>The three panels</strong> are three moments, in order: 1, before the explosion; 2, the core collapsing; 3, the explosion.
              </li>
              <li>
                <strong>The orange outer circle</strong> in panel 1 is the star’s huge outer layer of gas. <strong>The yellow circle</strong> is its inner layers.{' '}
                <strong>The red ball</strong> at the centre is the core.
              </li>
              <li>
                <strong>The blue arrows</strong> in panel 2 show material falling inward. In panel 2 the outer layers are drawn faint, because they have not yet moved.
                The core is now much smaller.
              </li>
              <li>
                <strong>The purple arrows and the dashed purple circle</strong> in panel 3 show material being blown outward, and where the outer layers are heading.
              </li>
              <li>
                <strong>The tiny pale dot</strong> in panel 3 is the neutron star left behind. It is drawn far bigger than it should be, because to scale it would be too
                small to see.
              </li>
            </ul>
            <p style={paragraph}>
              <strong>A worked moment, with a ball.</strong> Drop a rubber ball from 1 metre onto a hard floor. It speeds up as it falls, hits the floor and is squashed
              flat for a moment, and then springs back up, almost as high as it started. Nobody pushed it up: the floor pushed back on it. In a supernova, the falling
              material meets the newly formed, extremely dense core, which acts like that floor, and springs back in the same way, with enough force to throw the whole star’s
              outer layers into space.
            </p>
            <p style={{ marginTop: 0, marginBottom: '0.5rem' }}>
              <strong>What to look for.</strong>
            </p>
            <LookForList items={lookForDrawing} />
          </div>

          <p style={paragraph}>
            <strong>Where the question stands (October 2026).</strong> That a red supergiant exploded in M101 in May 2023 is well established. How heavy the star was is
            still contested, and why it shed so much gas in its last years is still open. Where the energy of the explosion goes is shown after the run, with each number’s source.
          </p>
          <div style={{ marginBottom: '0.75rem' }}>
            <p style={{ marginTop: 0, marginBottom: '0.5rem' }}>
              <strong>Some new words.</strong> The “Words and formulas” box below has each one, with a few from earlier experiments.
            </p>
            <ul style={{ margin: 0, paddingLeft: '1.25rem' }}>
              <li>
                <strong>Supernova</strong>, <strong>core collapse</strong>, <strong>rebound</strong> and <strong>neutron star</strong>: the explosion, how it starts, and
                what it leaves behind.
              </li>
              <li>
                <strong>Neutrino</strong>: a tiny particle that hardly ever interacts with anything.
              </li>
              <li>
                <strong>Progenitor</strong> and <strong>initial mass</strong>: the star before the explosion, and how heavy it was when it was born.
              </li>
              <li>
                <strong>Circumstellar gas</strong>, <strong>spectrum</strong> and <strong>flash spectroscopy</strong>: gas round a star, light spread into its colours, and
                how a supernova’s first light reveals that gas.
              </li>
              <li>
                <strong>Light-year</strong>, <strong>astronomical unit</strong>, <strong>parsec</strong> and <strong>megaparsec</strong>: rulers for distances in space.
              </li>
              <li>
                <strong>Joule</strong> and <strong>erg</strong>: two units of energy.
              </li>
            </ul>
          </div>

          <p style={paragraph}>
            <strong>What you will do.</strong> You will make two predictions, press Run to watch the pictures build up one stage at a time, and then try other values for the
            collapsing core, the distance to M101 and the speed of the gas. Nothing here is graded. Your predictions are your own guesses, made before you see anything: they
            do not change the pictures or the tables, which come from the physics and the published numbers. They are shown again beside the results so you can compare. What
            does change the pictures and Table 4 is the “Now try it yourself” controls, which appear after the run finishes.
          </p>

          <p style={paragraph}>
            <strong>What we assume.</strong> This experiment is a simple model. It estimates the energy of the collapse with one simple formula (a neutron star’s own
            gravitational energy, which is only a rough estimate), uses published values for the energy of the blast and of the light, and takes the
            distance to M101 and the speed of the gas from the papers. It does not model the collapse, the neutrinos, the shock or the light of the explosion, and it does
            not say which estimate of the star’s mass is right.
          </p>

          <p style={{ marginTop: 0, marginBottom: '0.75rem' }}>
            <strong>Want to know more?</strong> Plainer-language pages are listed here. Links open in a new tab. This page was written as of October 2026. The papers behind
            the numbers are listed after the run, so that they do not give away the predictions.
          </p>
          <ul style={{ margin: '0.25rem 0 0', paddingLeft: '1.25rem' }}>
            <li>
              <ExternalLink href="https://science.nasa.gov/universe/stars/types/">NASA: Star types</ExternalLink>: how a very heavy star ends, with its core collapsing into a
              neutron star and exploding as a supernova.
            </li>
            <li>
              <ExternalLink href="https://spaceplace.nasa.gov/light-year/en/">NASA Space Place: What is a light-year?</ExternalLink> What a light-year is, and why looking far
              away is looking back in time.
            </li>
            <li>
              <ExternalLink href="https://scienceinschool.web.cern.ch/article/2011/neutrinos">CERN, Science in School: Neutrinos, an introduction</ExternalLink>: what
              neutrinos are, why they are so hard to detect, and how supernovae make them.
            </li>
          </ul>
        </div>

        <ReferencePanel entries={done ? [...REFERENCE_ENTRIES, ...formulaEntries] : REFERENCE_ENTRIES} />

        {/* The two predictions: draft wording for the owner's review (CLAUDE.md §28.1), from the specification's "Prediction Activity". Neither says which answer is
            right, and neither gives the share of the light or the distance. */}
        {(
          [
            {
              title: 'Prediction 1: how much of the energy is visible light?',
              text: (
                <>
                  A massive star’s core collapses to a neutron star, and the star explodes. The collapse frees a huge amount of energy. About how much of that energy comes
                  out as the visible light that telescopes photograph?
                </>
              ),
              choices: SHARE_CHOICES,
              value: sharePrediction,
              set: (v: VisibleShareAnswer) => setSharePrediction(v),
            },
            {
              title: 'Prediction 2: when did it really happen?',
              text: (
                <>
                  The explosion was first seen from Earth in May 2023, in a galaxy a long way off. About how long before May 2023 did the star really explode? (Light takes
                  time to cross space.)
                </>
              ),
              choices: TRAVEL_CHOICES,
              value: travelPrediction,
              set: (v: LightTravelAnswer) => setTravelPrediction(v),
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
              {status === 'complete' && (
                <span style={{ color: 'var(--text-muted)' }}> (all {LAST_STAGE} stages shown). Your predictions are recorded and not marked here.</span>
              )}
            </>
          )}
        </p>
        {status === 'running' && (
          <p style={{ fontSize: '0.875rem', marginTop: 0, color: 'var(--text-muted)' }}>
            {stage === 1 && `Picture 1 shows seven teams’ estimates of the star’s mass when it was born, from ${overallLow} to ${overallHigh} times the Sun’s.`}
            {stage === 2 && 'Two more ranges are added, from a 2026 paper that used two methods and a possible effect of dust.'}
            {stage === 3 && `Picture 2 appears below Picture 1. It shows the gas the star shed, out to ${result.gasShellAU[1].toFixed(1)} AU, and how long before the explosion it was shed.`}
            {stage === 4 && 'Picture 3 appears below Picture 2. It shows the energy of the collapse, of the blast and of the light, on a scale where each step is 10 times more.'}
            {stage === 5 && `A strip is added to Picture 3: the light took ${millions(result.lightTravelYears)} million years to arrive.`}
          </p>
        )}
        {/* Picture 1: the seven bars from stage 1, the 2026 ranges from stage 2. */}
        {hasRun && (
          <div style={{ marginTop: '1.5rem', marginBottom: '1rem' }}>
            <PictureOne stage={stage} />
          </div>
        )}
        {hasRun && (
          <div style={{ fontSize: '0.875rem', color: 'var(--text-muted)', marginBottom: '1.5rem' }}>
            <p style={paragraph}>
              <strong>How to read Picture 1.</strong> Each row is one team’s estimate of how heavy the star was when it was born. The name and year are on the left, with a few
              words on how they made it (“method not read” means this page has not yet seen how the team did it). The scale along the bottom is in <strong>solar masses</strong>:
              1 is the Sun’s mass, so 17 means 17 times as heavy as the Sun. An <strong>orange bar</strong> runs from the lowest to the highest mass the team allows, and the numbers
              at its end say what they are; a dot is an estimate with no range. A longer bar means the team is less sure.
            </p>
            {stage >= 2 && (
              <p style={paragraph}>
                <strong>The two cyan bars</strong> (stage 2) come from one paper in 2026. The first is the mass it finds by modelling how the explosion’s light rose and faded.
                The second is the mass it finds from spectra taken long after the explosion. The note under them is the authors’ own explanation, that dust could hide some of
                the star’s brightness.
              </p>
            )}
            <p style={paragraph}>
              <strong>A worked moment.</strong> Do two estimates agree? Check whether their ranges share a value. {niu.who}: {niu.lowSolar} to {niu.highSolar}. {jencson.who}:{' '}
              {jencson.lowSolar} to {jencson.highSolar}. The first starts at {niu.lowSolar}, below where the second ends ({jencson.highSolar}), and the second starts at{' '}
              {jencson.lowSolar}, below where the first ends ({niu.highSolar}), so they{overlaps(niu, jencson) ? ' share values' : ' share no value'}. {pledger.who}: {pledger.lowSolar} to{' '}
              {pledger.highSolar}. It ends at {pledger.highSolar}, and {jencson.who}’s starts at {jencson.lowSolar}, so those two{overlaps(pledger, jencson) ? ' share values' : ' share no value'}.
            </p>
            <p style={{ marginTop: 0, marginBottom: '0.5rem' }}>
              <strong>What to look for.</strong>
            </p>
            <LookForList items={lookForPictureOne.slice(0, stage >= 2 ? 3 : 2)} />
          </div>
        )}
        {stage >= 3 && (
          <div style={{ marginTop: '1.5rem', marginBottom: '1rem' }}>
            <PictureTwo yearsBefore={result.gasShedYearsBefore} shellAU={result.gasShellAU} speed={result.windSpeedKmS} yours={yoursTwo} />
          </div>
        )}
        {stage >= 3 && (
          <div style={{ fontSize: '0.875rem', color: 'var(--text-muted)', marginBottom: '1.5rem' }}>
            <p style={paragraph}>
              <strong>How to read Picture 2.</strong> You are looking down on the star and the gas round it, drawn to one scale: an <strong>astronomical unit (AU)</strong> is the
              Earth’s distance from the Sun. The tiny <strong>yellow dot</strong> at the centre is the star. The <strong>dashed grey ring</strong> is where Neptune’s orbit would be
              if the star were at the Sun’s place, 30 AU out, so you can see how big this is. The <strong>purple band</strong> is the dense gas that the first spectra
              revealed: it lies between {result.gasShellAU[0].toFixed(1)} AU and {result.gasShellAU[1].toFixed(1)} AU from the star. The two labels give, for the inner and the outer edge
              of the band, how many years before the explosion that gas left the star, if it moves outward at {result.windSpeedKmS} km/s.
            </p>
            <p style={paragraph}>
              <strong>A worked moment.</strong> The outer edge of the gas is {sciText(outerCm)} centimetres from the star, and the gas moves at {result.windSpeedKmS} km/s, which is{' '}
              {sciText(speedCmS)} centimetres a second. Time = distance ÷ speed = {sciText(outerCm)} ÷ {sciText(speedCmS)} = {sciText(outerSeconds)} seconds, and one year is{' '}
              {thousandsComma(365.25 * 86400)} seconds, so that is {result.gasShedYearsBefore[1].toFixed(1)} years. The inner edge is half as far out ({sciText(innerCm)} cm), so it
              takes half as long: {result.gasShedYearsBefore[0].toFixed(1)} years. Think of cars driving away from a traffic light at a steady 50 km/h: the car now 100 km away left
              2 hours ago, and the one 50 km away left 1 hour ago.
            </p>
            <p style={{ marginTop: 0, marginBottom: '0.5rem' }}>
              <strong>What to look for.</strong>
            </p>
            <LookForList items={lookForPictureTwo} />
          </div>
        )}
        {stage >= 4 && (
          <div style={{ marginTop: '1.5rem', marginBottom: '1rem' }}>
            <PictureThree stage={stage} yours={yoursThree} />
          </div>
        )}
        {stage >= 4 && (
          <div style={{ fontSize: '0.875rem', color: 'var(--text-muted)', marginBottom: '1.5rem' }}>
            <p style={paragraph}>
              <strong>How to read Picture 3.</strong> The three horizontal bars are three amounts of energy: <strong>the collapse</strong> (red), the energy the falling core
              frees; <strong>the blast</strong> (purple), the energy of motion of the gas that is thrown outward; and <strong>the visible light</strong> (yellow), the light that
              telescopes photograph. The scale along the bottom is a <strong>log scale</strong>: each step to the right, from one tick to the next, is 10 times more energy,
              so a bar that looks only a little longer can hold a hundred or a thousand times more. The energy is in <strong>ergs</strong>; 10 million ergs make 1 joule. The{' '}
              <strong>white dashed line</strong> is a yardstick everyone can picture: all the energy the Sun will give out in its whole life.
            </p>
            {stage >= 5 && (
              <p style={paragraph}>
                <strong>The strip at the bottom</strong> (stage 5) is a timeline. The red dot on the left is the moment the star exploded, and the yellow dot on the right is the
                moment the light reached Earth, in May 2023. The arrow is the light’s journey. The distance to M101 is in megaparsecs (Mpc, 1 Mpc is 3.26 million light-years).
              </p>
            )}
            <p style={paragraph}>
              <strong>A worked moment.</strong> The collapse frees about the gravitational energy of a neutron star, G × M² ÷ R. With {SUPERNOVA.coreMassSolar} Suns, M is{' '}
              {sciText(massKg)} kg, R is {SUPERNOVA.coreRadiusKm * 1000} metres and G is {sciText(G, 3)}, so G × M² ÷ R = {sciText(G, 3)} × ({sciText(massKg)})² ÷ {SUPERNOVA.coreRadiusKm * 1000} ={' '}
              {sciText(result.collapseJ)} joules, which is {sciText(result.collapseErg)} ergs. The light is {sciText(ergFromJoules(result.lightJ))} ergs, so the light is{' '}
              {sciText(ergFromJoules(result.lightJ))} ÷ {sciText(result.collapseErg)}, about 1 part in {thousandsComma(lightOneInRounded)}. (This is only a rough estimate of the collapse’s
              energy.)
              {stage >= 5 && (
                <>
                  {' '}
                  For the strip: {SUPERNOVA.distanceMpc} Mpc × 3.26 million light-years per Mpc = {millions(result.lightYears)} million light-years, and light takes one year to travel one
                  light-year, so the light took {millions(result.lightTravelYears)} million years.
                </>
              )}
            </p>
            <p style={{ marginTop: 0, marginBottom: '0.5rem' }}>
              <strong>What to look for.</strong>
            </p>
            <LookForList items={lookForPictureThree.slice(0, stage >= 5 ? 4 : 3)} />
          </div>
        )}

        {/* The controls (after the run): the core, the distance and the speed of the gas. They add a white mark to Pictures 2 and 3, and fill Table 4. */}
        {done && (
          <div style={{ marginTop: '2rem', padding: '1rem 1.25rem', border: '2px solid var(--border-color, #ccc)', borderRadius: '8px' }}>
            <h3 style={{ marginTop: 0 }}>Now try it yourself</h3>
            <p style={{ ...paragraph, fontSize: '0.875rem', color: 'var(--text-muted)' }}>
              Your predictions do not change the pictures or Table 4, because the results come from the physics, not from your guesses. These settings do: change one and watch
              the white marks in Pictures 2 and 3 above, and Table 4 below, follow it. Picture 1 does not change, because the mass estimates are the teams’, not yours. While every
              setting is on its published value, Table 4 says “the same” in every row, so change a setting to see it move. Each choice is a trial value: it shows what would
              happen with that number, and does not say that the real star is like that.
            </p>
            <p style={{ ...paragraph, fontWeight: 'bold' }}>How heavy is the collapsing core? (solar masses) It moves the white mark in Picture 3.</p>
            <ChoiceButtons options={SUPERNOVA.coreMassChoicesSolar} value={coreMassChoice} onChange={setCoreMassChoice} format={(v) => `${v}${v === SUPERNOVA.coreMassSolar ? ' (the usual value)' : ''}`} />
            <p style={{ ...paragraph, fontWeight: 'bold' }}>How big is the core after it collapses? (radius in kilometres)</p>
            <ChoiceButtons options={SUPERNOVA.coreRadiusChoicesKm} value={coreRadiusChoice} onChange={setCoreRadiusChoice} format={(v) => `${v} km${v === SUPERNOVA.coreRadiusKm ? ' (the usual value)' : ''}`} />
            <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)', marginTop: 0 }}>
              A core of {coreMassChoice} Suns, {coreRadiusChoice} km in radius, frees {sciText(mine.collapseErg)} erg ({Math.round(mine.sunLifetimes.collapse)} times the Sun’s whole-life output). The light,{' '}
              {sciText(ergFromJoules(mine.lightJ))} erg, is then 1 part in {oneInText(mine.lightOneIn)} of it.
            </p>
            <p style={{ ...paragraph, fontWeight: 'bold' }}>How far away is M101? (megaparsecs) It moves the white line under Picture 3.</p>
            <ChoiceButtons options={SUPERNOVA.distanceChoicesMpc} value={distanceChoice} onChange={setDistanceChoice} format={(v) => `${v} Mpc${v === SUPERNOVA.distanceMpc ? ' (the published value)' : ''}`} />
            <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)', marginTop: 0 }}>
              At {distanceChoice} Mpc ({millions(mine.lightYears)} million light-years) the light took {millions(mine.lightTravelYears)} million years to arrive. The distance is known to about ± 0.15 Mpc,
              which changes the time by about half a million years out of 22 million.
            </p>
            <p style={{ ...paragraph, fontWeight: 'bold' }}>How fast was the gas moving? (kilometres a second) It moves the white label in Picture 2.</p>
            <ChoiceButtons options={SUPERNOVA.windSpeedChoicesKmS} value={speedChoice} onChange={setSpeedChoice} format={(v) => `${v} km/s${v === SUPERNOVA.windSpeedKmS ? ' (the authors’ assumption)' : ''}`} />
            <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)', marginTop: 0, marginBottom: 0 }}>
              At {speedChoice} km/s the gas now at the inner and outer edges left the star {mine.gasShedYearsBefore[0].toFixed(1)} and {mine.gasShedYearsBefore[1].toFixed(1)} years before the explosion. A faster
              gas means a shorter time, and the speed was assumed, not measured.
            </p>
          </div>
        )}

        {/* The results, shown only after the run completes: the status label, the predictions again, the check-up, four tables, and the links kept back until now. */}
        {done && (
          <div style={{ marginTop: '2rem' }}>
            <h3 style={{ marginTop: 0 }}>Results</h3>
            <p style={{ ...paragraph, padding: '0.75rem 1rem', border: '2px solid var(--border-color, #ccc)', borderRadius: '8px', fontSize: '0.875rem' }}>
              <strong>Where this stands (as of October 2026).</strong> <strong>Strong evidence:</strong> a red supergiant exploded in M101 in May 2023 (the star was photographed
              before it blew up, and the first spectra showed gas it had shed). <strong>Strong evidence from theory and from one earlier supernova (SN 1987A):</strong> almost all
              of a collapse’s energy leaves as neutrinos, although none were reported from SN 2023ixf itself. <strong>Contested:</strong> how heavy the star was (estimates run from about{' '}
              {overallLow} to about {overallHigh} solar masses). <strong>Open:</strong> why the star shed so much gas in its last years.
            </p>
            <div style={{ ...paragraph, fontSize: '0.875rem', color: 'var(--text-muted)' }}>
              <p style={{ margin: '0 0 0.5rem' }}>
                <strong>Your predictions, beside the results.</strong> Before the run you made two predictions. Here they are again, each with the place on this page where its
                number appears. Compare them yourself. The tutor will go through them with you after the tables.
              </p>
              <p style={{ margin: '0 0 0.5rem' }}>
                <strong>Prediction 1: how much of the energy is visible light?</strong> You predicted: <strong>{SHARE_CHOICES.find((c) => c.value === sharePrediction)?.label}</strong>. The question
                was what share of the energy freed by the collapse comes out as visible light. Its number is in Table 1, in the row “The visible light”, and in Picture 3.
              </p>
              <p style={{ margin: 0 }}>
                <strong>Prediction 2: when did it really happen?</strong> You predicted: <strong>{TRAVEL_CHOICES.find((c) => c.value === travelPrediction)?.label}</strong>. The question was how long
                before May 2023 the star really exploded. Its number is in Table 2, in the row “How long the light took”, and in the strip under Picture 3.
              </p>
            </div>
            <p style={{ ...paragraph, fontSize: '0.875rem', color: 'var(--text-muted)' }}>
              <strong>How to read these results.</strong> Think of these tables as a set of test results, and this section as the doctor explaining them. A supernova is far
              too far away, and too violent, to measure directly, so what we know comes as numbers from many different sources: an energy worked out from a formula, energies
              measured by teams, a distance, a speed, and a list of estimates of the star’s mass. None of the numbers is a picture of the explosion. The question to keep in mind
              is: <strong>do the numbers agree with each other, and how strong is each one?</strong>
            </p>
            <p style={{ ...paragraph, fontSize: '0.875rem', color: 'var(--text-muted)' }}>
              First comes a short check-up that sets what we would expect beside what was found. Then each table has a plain-words note under it. The experiment explains what
              each number means. It does not decide for you what the evidence adds up to. The tutor will help you with that, after the tables. The “Words and formulas” box
              now has the formulas worked with these numbers.
            </p>
            <p style={{ marginBottom: '0.25rem' }}>
              <strong>The check-up: what we would expect, and what was found</strong>
            </p>
            <ResultsTable
              head={['What was checked', 'What we would expect', 'What was found', 'What this tells us']}
              minWidth={640}
              rows={[
                [
                  'The energy the collapse frees',
                  `${neutrinoRange} erg: the energy carried by neutrinos in a core collapse, in published reviews (about ${LITERATURE.sn1987aEnergyErg[0] / 1e53} to ${LITERATURE.sn1987aEnergyErg[1] / 1e53} × 10⁵³ erg for SN 1987A)`,
                  `${sciText(result.collapseErg)} erg, worked out here as G × M² ÷ R for ${SUPERNOVA.coreMassSolar} Suns and ${SUPERNOVA.coreRadiusKm} km`,
                  `${collapseCheck.verdict === 'inside' ? 'Close: inside the published range.' : `Outside the published range, ${collapseCheck.verdict} it by ${collapseCheck.factor.toFixed(1)} times.`} It is a rough estimate, so trust the size, not the last digit.`,
                ],
                [
                  'The energy of the blast (the motion of the gas)',
                  `${LITERATURE.explosionEnergyErg[0] / 1e51} to ${LITERATURE.explosionEnergyErg[1] / 1e51} × 10⁵¹ erg for SN 2023ixf in one analysis; another analysis gives ${LITERATURE.explosionEnergyWideErg[0] / 1e51} to ${LITERATURE.explosionEnergyWideErg[1] / 1e51} × 10⁵¹`,
                  `${sciText(ergFromJoules(result.gasMotionJ))} erg, the value used here`,
                  `${narrowCheck.verdict === 'inside' && wideCheck.verdict === 'inside' ? 'Close: inside both ranges.' : 'Not inside both ranges.'} The two analyses differ, so this number is only good to a factor of a few.`,
                ],
                [
                  'How long before the explosion the gas was shed',
                  `${LITERATURE.paperGasYears[0]} to ${LITERATURE.paperGasYears[1]} years (Jacobson-Galán and others, 2023)`,
                  `${result.gasShedYearsBefore[0].toFixed(1)} to ${result.gasShedYearsBefore[1].toFixed(1)} years, from radius ÷ speed at the paper’s assumed ${result.windSpeedKmS} km/s`,
                  `The same, to the nearest year. This is the paper’s own sum, so it checks the arithmetic, and the speed is an assumption.`,
                ],
                [
                  'How heavy the star was',
                  'One agreed value',
                  `Seven estimates from ${overallLow} to ${overallHigh} solar masses, and two 2026 ranges (${MASS_2026.lightCurveRangeSolar[0]} to ${MASS_2026.lightCurveRangeSolar[1]} and ${MASS_2026.spectraRangeSolar[0]} to ${MASS_2026.spectraRangeSolar[1]})`,
                  `Not settled. The lowest and the highest estimates ${overlaps(lowest, highest) ? 'overlap' : 'share no value'}.`,
                ],
                [
                  'Neutrinos seen from SN 2023ixf',
                  'From the collapse itself, too few to detect at this distance (Super-Kamiokande’s own estimate was below its threshold, from a search summary)',
                  'None reported. IceCube searched separately for higher-energy neutrinos from the blast hitting the gas and found only background',
                  'As expected for the collapse’s burst. The IceCube search is a different question. Both were read in summaries or abstracts only.',
                ],
              ]}
            />
            <p style={{ ...paragraph, fontSize: '0.875rem', color: 'var(--text-muted)', marginTop: '0.5rem' }}>
              A doctor reads each result against a reference. Here the reference is a published value, or what the same physics predicts. Two rows are close, one is the paper’s own
              sum, one is not settled and one is as expected. That is why the status label says “Strong evidence” for the explosion, “Contested” for the mass and “Open” for why the
              star shed so much gas.
            </p>

            <p style={{ margin: '1.5rem 0 0.25rem' }}>
              <strong>Table 1: where did the energy go?</strong>
            </p>
            <ResultsTable
              head={['Quantity', 'Value', 'Where it comes from']}
              minWidth={560}
              rows={[
                [
                  'The collapse (the energy it frees)',
                  `${sciText(result.collapseJ)} J = ${sciText(result.collapseErg)} erg = ${Math.round(result.sunLifetimes.collapse)} times the Sun’s whole-life output`,
                  `worked out here: G × M² ÷ R for ${SUPERNOVA.coreMassSolar} Suns and ${SUPERNOVA.coreRadiusKm} km (an order-of-magnitude estimate)`,
                ],
                [
                  'The blast (the motion of the gas)',
                  `${sciText(ergFromJoules(result.gasMotionJ))} erg = ${result.sunLifetimes.gasMotion.toFixed(2)} of the Sun’s whole-life output; 1 part in ${oneInText(result.gasMotionOneIn)} of the collapse (${(result.gasMotionShare * 100).toFixed(2)} percent)`,
                  'the usual range of about 0.5 to 2 × 10⁵¹ erg; SN 2023ixf analyses give 0.7 to 1.2 and 1.0 to 5.7 × 10⁵¹',
                ],
                [
                  'The visible light (the row for Prediction 1)',
                  `${sciText(ergFromJoules(result.lightJ))} erg = ${result.sunLifetimes.light.toFixed(4)} of the Sun’s whole-life output; 1 part in ${oneInText(result.lightOneIn)} of the collapse (${(result.lightShare * 100).toFixed(4)} percent)`,
                  `the usual range for a core-collapse supernova, ${sciText(SUPERNOVA.lightRangeErg[0], 0)} to ${sciText(SUPERNOVA.lightRangeErg[1], 0)} erg, taking the bottom; SN 2023ixf’s own value is not used. At the top of the range the light is 1 part in ${oneInText(oneInN(joulesFromErg(SUPERNOVA.lightRangeErg[1]), result.collapseJ))}`,
                ],
                [
                  'What is left over',
                  `${(rest * 100).toFixed(2)} percent of the collapse’s energy`,
                  'worked out here: the collapse minus the blast and the light. The reviews say almost all of it is carried by neutrinos (more than about 99 percent)',
                ],
                [
                  'The Sun’s whole-life output (the yardstick)',
                  `${sciText(sunLifetimeEnergyJ())} J = ${sciText(sunWhole)} erg`,
                  'the Sun’s power times about ten billion years (standard figures; no source read)',
                ],
              ]}
            />
            <div style={{ ...paragraph, fontSize: '0.875rem', color: 'var(--text-muted)', marginTop: '0.5rem' }}>
              <strong>What this table tells us.</strong>
              <ul style={{ margin: '0.25rem 0 0', paddingLeft: '1.25rem' }}>
                <li>
                  <strong>Where the numbers come from.</strong> The collapse’s energy comes from one simple formula: the energy freed as {SUPERNOVA.coreMassSolar} Suns’ worth of material falls into a ball{' '}
                  {SUPERNOVA.coreRadiusKm} km in radius. Think of dropping a very heavy weight a very long way: the more it weighs and the farther it falls, the more energy it gives
                  up. The blast and the light are measured by teams, not worked out.
                </li>
                <li>
                  <strong>What it means.</strong> The collapse frees {sciText(result.collapseErg)} erg, about {Math.round(result.sunLifetimes.collapse)} times all the energy the Sun will give out in ten billion
                  years. The blast’s motion is about one Sun’s lifetime, 1 part in {oneInText(result.gasMotionOneIn)} of the collapse. The light is 1 part in {oneInText(result.lightOneIn)}, which is about one
                  minute out of a 30-day month. Almost all the rest, {(rest * 100).toFixed(2)} percent, is neither motion nor light.
                </li>
                <li>
                  <strong>Why it matters.</strong> What telescopes photograph is a tiny corner of the event. Astronomers had to work out the rest from theory and from the one supernova,
                  SN 1987A, whose neutrinos were caught. Where the rest goes is for the tutor.
                </li>
                <li>
                  <strong>How sure is it?</strong> The collapse’s energy is the weakest number: a ball of the same mass and size with the same density throughout would give 3/5 of it, and
                  real neutron stars need general relativity. The light’s value is a range, not a measurement for this star. Either way the light stays a tiny share, between 1 part in{' '}
                  {oneInText(sharesLow)} and 1 part in {oneInText(sharesHigh)} for all nine core settings below.
                </li>
              </ul>
            </div>

            <p style={{ margin: '1.5rem 0 0.25rem' }}>
              <strong>Table 2: when and where?</strong>
            </p>
            <ResultsTable
              head={['Quantity', 'Value', 'Where it comes from']}
              minWidth={560}
              rows={[
                [
                  'Distance to M101',
                  `${SUPERNOVA.distanceMpc} Mpc = ${millions(result.lightYears)} million light-years`,
                  'about 6.85 Mpc in the 2025 review (Jacobson-Galán); Riess and others 2022 (Cepheid stars) give 6.85 ± 0.15. The IceCube paper uses 6.4 Mpc, which is the “21 million light-years” some pages give',
                ],
                [
                  'How long the light took (the row for Prediction 2)',
                  `${millions(result.lightTravelYears)} million years`,
                  'worked out here: distance ÷ the speed of light (one light-year takes one year)',
                ],
                [
                  'The edges of the dense gas',
                  `${sciText(innerCm)} cm and ${sciText(outerCm)} cm = ${result.gasShellAU[0].toFixed(1)} and ${result.gasShellAU[1].toFixed(1)} AU`,
                  'Jacobson-Galán and others 2023 (the abstract)',
                ],
                ['The speed of the gas', `${result.windSpeedKmS} km/s`, 'assumed by the authors, not measured'],
                [
                  'How long before the explosion the gas was shed',
                  `${result.gasShedYearsBefore[0].toFixed(1)} and ${result.gasShedYearsBefore[1].toFixed(1)} years`,
                  'worked out here: radius ÷ speed. The paper says 3 to 6 years',
                ],
              ]}
            />
            <div style={{ ...paragraph, fontSize: '0.875rem', color: 'var(--text-muted)', marginTop: '0.5rem' }}>
              <strong>What this table tells us.</strong>
              <ul style={{ margin: '0.25rem 0 0', paddingLeft: '1.25rem' }}>
                <li>
                  <strong>Light is a messenger from the past.</strong> The explosion was seen in May 2023, but the light had been travelling for {millions(result.lightTravelYears)} million years. It is like seeing a firework
                  burst long before you hear it, except that the delay is not seconds but millions of years. The star was already gone when we first saw it.
                </li>
                <li>
                  <strong>What the gas times mean.</strong> Gas {result.gasShellAU[1].toFixed(1)} AU out, moving at {result.windSpeedKmS} km/s, left the star {result.gasShedYearsBefore[1].toFixed(1)} years before the explosion. Cars leaving a
                  traffic light show the same idea: the car now 100 km away left 2 hours ago if it drives at 50 km/h.
                </li>
                <li>
                  <strong>Why it matters.</strong> It means a red supergiant was throwing off dense gas in the last few years of its life, much faster than usual, which is what the first spectra
                  showed. Why it did that is still open.
                </li>
                <li>
                  <strong>How sure is it?</strong> The distance is good to about ±{(0.15 / SUPERNOVA.distanceMpc * 100).toFixed(0)} percent ({nearMpc.toFixed(2)} to {farMpc.toFixed(2)} Mpc), so the travel time is 22 million years give or take half a million. The gas
                  times rest on an assumed speed, so they could be longer or shorter in proportion.
                </li>
              </ul>
            </div>

            <p style={{ margin: '1.5rem 0 0.25rem' }}>
              <strong>Table 3: the star’s mass, estimates side by side.</strong> No estimate is marked right.
            </p>
            <ResultsTable
              head={['Who', 'How they worked it out', 'Mass when born (solar masses)', 'Shares a value with how many of the other six']}
              minWidth={640}
              rows={[
                ...estimates.map((e) => [
                  `${e.who} (${e.year})`,
                  METHOD_WORDS[e.who],
                  e.lowSolar === e.highSolar ? `${e.lowSolar} (no range quoted)` : `${e.lowSolar} to ${e.highSolar}`,
                  String(estimates.filter((o) => o.who !== e.who && overlaps(e, o)).length),
                ]),
                ['A 2026 paper (Astronomy and Astrophysics)', 'modelling the explosion’s light', `${MASS_2026.lightCurveRangeSolar[0]} to ${MASS_2026.lightCurveRangeSolar[1]}`, '(not counted)'],
                ['The same 2026 paper', 'spectra taken long after the explosion', `${MASS_2026.spectraRangeSolar[0]} to ${MASS_2026.spectraRangeSolar[1]}`, '(not counted)'],
              ]}
            />
            <div style={{ ...paragraph, fontSize: '0.875rem', color: 'var(--text-muted)', marginTop: '0.5rem' }}>
              <strong>What this table tells us.</strong>
              <ul style={{ margin: '0.25rem 0 0', paddingLeft: '1.25rem' }}>
                <li>
                  <strong>What it is.</strong> Each row is one team’s answer to “how heavy was the star when it was born?”, with the range they allow.
                </li>
                <li>
                  <strong>What it means.</strong> The answers run from {overallLow} to {overallHigh} Suns. The last column counts, for each estimate, how many of the other six it shares at least one value with. An estimate that shares a value
                  with none, or with only one, is far from the rest. The teams used different methods and different assumptions about the dust, so they could differ even if each did careful work.
                </li>
                <li>
                  <strong>Why it matters.</strong> A star’s mass decides how it lives and how it ends. NASA says stars of about 8 to 20 times the Sun’s mass end this way, so a star of about 10 Suns would be near the lower edge, and one of about
                  20 near the upper edge. The disagreement is why the label for the mass is “Contested”.
                </li>
                <li>
                  <strong>How sure is it?</strong> Not very. The 2026 paper’s authors argue that dust round the star hid some of its light, which would push the lower estimates up. This page reports the argument and does not decide
                  it.
                </li>
              </ul>
            </div>

            <p style={{ margin: '1.5rem 0 0.25rem' }}>
              <strong>Table 4: your own numbers, checked against the published ones.</strong> It follows the settings above.
            </p>
            <ResultsTable
              head={['Quantity', 'Your value', 'Published value', 'How yours compares', 'How it was worked out']}
              minWidth={900}
              rows={[
                [
                  'The collapsing core',
                  `${coreMassChoice} Suns, ${coreRadiusChoice} km`,
                  `${SUPERNOVA.coreMassSolar} Suns, ${SUPERNOVA.coreRadiusKm} km`,
                  coreChanged
                    ? `Mass: ${word(cmp.coreMass, 'heavier than', 'lighter than', 'the same as')} the usual value. Radius: ${word(cmp.coreRadius, 'larger than', 'smaller than', 'the same as')} the usual value.`
                    : 'The same as the published core.',
                  'a trial value (the usual neutron star is about 1.4 Suns and 12 km)',
                ],
                [
                  'The energy the collapse frees',
                  `${sciText(mine.collapseErg)} erg`,
                  `${sciText(result.collapseErg)} erg`,
                  isSame(cmp.collapsePercent)
                    ? 'The same.'
                    : `${pct(cmp.collapsePercent)} percent ${cmp.collapsePercent > 0 ? 'more' : 'less'} than the published value. ${rangeText(cmp.collapseVsNeutrinoRange)}`,
                  'G × M² ÷ R',
                ],
                [
                  'The light as a share of the collapse',
                  `1 part in ${oneInText(mine.lightOneIn)}`,
                  `1 part in ${oneInText(cmp.lightOneInPublished)}`,
                  cmp.lightOneInMine === cmp.lightOneInPublished
                    ? 'The same.'
                    : `${cmp.lightOneInMine > cmp.lightOneInPublished ? 'A smaller' : 'A larger'} share than the published one: 1 part in ${oneInText(cmp.lightOneInMine)} against 1 part in ${oneInText(cmp.lightOneInPublished)}.`,
                  `${sciText(ergFromJoules(mine.lightJ))} erg ÷ the collapse’s energy`,
                ],
                [
                  'Distance to M101',
                  `${distanceChoice} Mpc = ${millions(mine.lightYears)} million light-years`,
                  `${SUPERNOVA.distanceMpc} Mpc (± 0.15)`,
                  isSame(cmp.distancePercent)
                    ? 'The same as the published value.'
                    : `${pct(cmp.distancePercent)} percent ${cmp.distancePercent > 0 ? 'farther' : 'nearer'} than the published value, ${whereInRange(distanceChoice, [nearMpc, farMpc]).verdict === 'inside' ? 'at the edge of its give-or-take of 0.15 Mpc' : 'outside its give-or-take'}.`,
                  'a trial value within the give-or-take of Riess and others 2022',
                ],
                [
                  'How long the light took',
                  `${millions(mine.lightTravelYears)} million years`,
                  `${millions(result.lightTravelYears)} million years`,
                  isSame(cmp.travelYearsDifference)
                    ? 'The same.'
                    : `${Math.abs(cmp.travelYearsDifference / 1e6).toFixed(2)} million years ${cmp.travelYearsDifference > 0 ? 'longer' : 'shorter'} than the published value.`,
                  `${distanceChoice} × ${LIGHT_YEARS_PER_PARSEC} million`,
                ],
                [
                  'The speed of the gas',
                  `${speedChoice} km/s`,
                  `${SUPERNOVA.windSpeedKmS} km/s (assumed)`,
                  cmp.windSpeed === 0 ? 'The same as the assumed speed.' : `${word(cmp.windSpeed, 'Faster', 'Slower', 'The same')} than the assumed speed.`,
                  'a trial value',
                ],
                [
                  'How long before the explosion the gas was shed',
                  `${mine.gasShedYearsBefore[0].toFixed(1)} to ${mine.gasShedYearsBefore[1].toFixed(1)} years`,
                  `${result.gasShedYearsBefore[0].toFixed(1)} to ${result.gasShedYearsBefore[1].toFixed(1)} years (the paper: ${LITERATURE.paperGasYears[0]} to ${LITERATURE.paperGasYears[1]})`,
                  `${isSame(cmp.gasTimePercent) ? 'The same.' : `${pct(cmp.gasTimePercent)} percent ${cmp.gasTimePercent > 0 ? 'longer' : 'shorter'} than the published value.`} ${
                    cmp.gasYearsMatchPaper ? 'It rounds to the paper’s “3 to 6 years”.' : `It rounds to ${cmp.gasYearsRounded[0]} to ${cmp.gasYearsRounded[1]} years, not the paper’s “3 to 6”.`
                  }`,
                  `radius ÷ ${speedChoice} km/s`,
                ],
              ]}
            />
            <p style={{ ...paragraph, fontSize: '0.875rem', color: 'var(--text-muted)', marginTop: '0.5rem' }}>
              <strong>What this table tells us.</strong> It shows how each number moves when you change the core, the distance or the speed. Ask yourself:{' '}
              <em>which of the findings above still hold when I change the inputs, and which do not?</em> A finding that holds across many trial values is sturdier than one that
              depends on a single choice.
            </p>
            <div style={{ ...paragraph, fontSize: '0.875rem', color: 'var(--text-muted)', marginTop: '0.5rem' }}>
              <p style={{ margin: '0 0 0.5rem' }}>
                <strong>What your numbers show.</strong>{' '}
                {allPublished && 'Your settings are the published values, so every row matches the published column. Change a setting above and watch which rows move.'}
              </p>
              {coreChanged && (
                <p style={{ margin: '0 0 0.5rem' }}>
                  With a core of {coreMassChoice} Suns and {coreRadiusChoice} km the collapse frees {sciText(mine.collapseErg)} erg, {pct(cmp.collapsePercent)} percent {cmp.collapsePercent > 0 ? 'more' : 'less'} than the
                  published value. {rangeText(cmp.collapseVsNeutrinoRange)} The light, still {sciText(ergFromJoules(mine.lightJ))} erg, is now 1 part in {oneInText(mine.lightOneIn)} of that. Across all nine core settings
                  the light stays between 1 part in {oneInText(sharesLow)} and 1 part in {oneInText(sharesHigh)}, so the light is a tiny share however the core is chosen.
                </p>
              )}
              {!isSame(cmp.distancePercent) && (
                <p style={{ margin: '0 0 0.5rem' }}>
                  At {distanceChoice} Mpc the light took {millions(mine.lightTravelYears)} million years, {Math.abs(cmp.travelYearsDifference / 1e6).toFixed(2)} million {cmp.travelYearsDifference > 0 ? 'more' : 'less'} than the published{' '}
                  {millions(result.lightTravelYears)}. It is still about twenty-two million years, and nowhere near a few months or a few thousand years, so the distance does not change the answer
                  to Prediction 2.
                </p>
              )}
              {cmp.windSpeed !== 0 && (
                <p style={{ margin: '0 0 0.5rem' }}>
                  At {speedChoice} km/s the gas was shed {mine.gasShedYearsBefore[0].toFixed(1)} to {mine.gasShedYearsBefore[1].toFixed(1)} years before the explosion, {pct(cmp.gasTimePercent)} percent{' '}
                  {cmp.gasTimePercent > 0 ? 'longer' : 'shorter'} than the published times. {cmp.gasYearsMatchPaper ? 'That still rounds to the paper’s “3 to 6 years”.' : `That rounds to ${cmp.gasYearsRounded[0]} to ${cmp.gasYearsRounded[1]} years, not the paper’s “3 to 6”.`}{' '}
                  The speed was assumed, so the real times could differ by the same factor. The energy and the distance do not depend on the speed.
                </p>
              )}
              <p style={{ margin: 0 }}>
                These are trial values. They show how the checks respond when a number changes. They do not say that the real star or the real explosion is like this.
              </p>
            </div>

            <p style={{ margin: '1.5rem 0 0.5rem' }}>
              <strong>The papers behind these results.</strong> Kept until now, so that they did not give away the predictions. Links open in a new tab.
            </p>
            <ul style={{ margin: 0, paddingLeft: '1.25rem', fontSize: '0.875rem' }}>
              <li>
                <ExternalLink href="https://arxiv.org/abs/2306.04721">Jacobson-Galán and others, “SN 2023ixf in Messier 101: Photo-ionization of Dense, Close-in Circumstellar Material in a Nearby Type II Supernova”</ExternalLink>{' '}
                (2023): the first spectra and the gas the star shed.
              </li>
              <li>
                <ExternalLink href="https://arxiv.org/abs/2507.08078">Jacobson-Galán, “SN 2023ixf: The Closest Supernova of the Decade”</ExternalLink> (2025): a review of more than 80 studies.
              </li>
              <li>
                <ExternalLink href="https://arxiv.org/abs/2305.14447">Pledger and Shara, the Hubble pre-explosion image of the progenitor</ExternalLink> (2023): a mass of about 8 to 10 Suns.
              </li>
              <li>
                <ExternalLink href="https://arxiv.org/abs/2306.04722">Kilpatrick and others, “A Variable Red Supergiant as the Progenitor Candidate”</ExternalLink> (2023): about 11 Suns.
              </li>
              <li>
                <ExternalLink href="https://arxiv.org/abs/2308.04677">Niu and others, “The dusty red supergiant progenitor and the local environment”</ExternalLink> (2023): 16.2 to 17.4 Suns, and 17 to 19 from the stars around it.
              </li>
              <li>
                <ExternalLink href="https://arxiv.org/abs/2306.10783">Soraisam and others, “The SN 2023ixf Progenitor in M101: I. Infrared Variability”</ExternalLink> (2023): a pulsation period and 20 ± 4 Suns.
              </li>
              <li>
                <ExternalLink href="https://www.aanda.org/10.1051/0004-6361/202557952">“Unveiling the progenitor of SN 2023ixf: Circumstellar dust and its implications for the red supergiant problem”</ExternalLink>{' '}
                (Astronomy and Astrophysics, February 2026): the two ranges of the 2026 paper and the dust argument.
              </li>
              <li>
                <ExternalLink href="https://arxiv.org/abs/2507.07097">Mand and others, “Results from IceCube Follow-up of Nearby Supernova SN2023ixf”</ExternalLink> (2025): the search for high-energy neutrinos.
              </li>
            </ul>
          </div>
        )}
      </div>
    </div>
  )
}
