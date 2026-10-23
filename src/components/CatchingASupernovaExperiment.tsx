import { useEffect, useState } from 'react'
import type { ReactNode } from 'react'
import {
  inSunLifetimes,
  massEstimates,
  MASS_2026,
  oneInN,
  overlaps,
  runCatchingASupernova,
  SOLAR_MASS_KG,
  SUPERNOVA,
  sunLifetimeEnergyJ,
  G,
  ergFromJoules,
  joulesFromErg,
} from '../physics/catchingASupernova'
import type { LightTravelAnswer, VisibleShareAnswer } from '../physics/catchingASupernova'
import { ReferencePanel } from './EnergyMomentumExperiment'
import { LookForList } from './WideBinariesExperiment'
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

function PictureTwo({ yearsBefore, shellAU, speed }: { yearsBefore: [number, number]; shellAU: [number, number]; speed: number }) {
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
    </svg>
  )
}

// ---- Picture 3: where the energy went, on a log scale (stage 4), and how long ago the light left (stage 5) ----
const P3_LEFT = 175
const P3_MIN_LOG = 48
const P3_MAX_LOG = 54
const P3_PX_PER_DECADE = (545 - P3_LEFT) / (P3_MAX_LOG - P3_MIN_LOG)
const p3x = (erg: number) => P3_LEFT + (Math.log10(erg) - P3_MIN_LOG) * P3_PX_PER_DECADE

function PictureThree({ stage }: { stage: number }) {
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
      {[48, 49, 50, 51, 52, 53, 54].map((e) => (
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
          <SvgLines x={280} y={height - 8} lines={['not to scale in time: the strip only shows the order']} fill={MUTED_COLOR} anchor="middle" size={9} />
        </g>
      )}
    </svg>
  )
}

interface CatchingASupernovaExperimentProps {
  onComplete?: () => void
}

export function CatchingASupernovaExperiment({ onComplete }: CatchingASupernovaExperimentProps) {
  const [sharePrediction, setSharePrediction] = useState<VisibleShareAnswer | null>(null)
  const [travelPrediction, setTravelPrediction] = useState<LightTravelAnswer | null>(null)
  const [status, setStatus] = useState<'idle' | 'running' | 'complete'>('idle')
  const [stage, setStage] = useState(0)
  const hasRun = status !== 'idle'
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
  const [innerCm, outerCm] = SUPERNOVA.gasShellRadiiCm
  const speedCmS = SUPERNOVA.windSpeedKmS * 1e5
  const outerSeconds = outerCm / speedCmS
  const massKg = SUPERNOVA.coreMassSolar * SOLAR_MASS_KG
  const lightOneInRounded = Math.round(result.lightOneIn / 1000) * 1000
  const lookForPictureOne: LookFor[] = [
    {
      look: 'the seven orange bars, one for each team’s estimate of the star’s mass when it was born, and the number at the end of each bar.',
      means: `each bar is the range of masses that team gives, from ${lowest.who}’s ${lowest.lowSolar} to ${lowest.highSolar} Suns up to ${highest.who}’s ${highest.lowSolar} to ${highest.highSolar}. A long bar means the team is less sure. The dot is an estimate with no range quoted.`,
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

        <ReferencePanel entries={REFERENCE_ENTRIES} />

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
                <span style={{ color: 'var(--text-muted)' }}> (all {LAST_STAGE} stages shown). Your predictions are recorded and not marked here. The controls, the results and the tutor will appear here.</span>
              )}
            </>
          )}
        </p>
        {status === 'running' && (
          <p style={{ fontSize: '0.875rem', marginTop: 0, color: 'var(--text-muted)' }}>
            {stage === 1 && `Picture 1 shows seven teams’ estimates of the star’s mass when it was born, from ${lowest.lowSolar} to ${highest.highSolar} times the Sun’s.`}
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
            <PictureTwo yearsBefore={result.gasShedYearsBefore} shellAU={result.gasShellAU} speed={result.windSpeedKmS} />
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
            <PictureThree stage={stage} />
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
      </div>
    </div>
  )
}
