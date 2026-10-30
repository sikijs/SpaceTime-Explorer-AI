import { useEffect, useState } from 'react'
import type { ReactNode } from 'react'
import {
  earthEquatorTerms,
  earthOrbitTerms,
  EARTH,
  GEOSTATIONARY_RADIUS_M,
  DAYS_PER_MONTH,
  DAYS_PER_YEAR,
  gainMicrosecondsPerDay,
  gapSeconds,
  GPS_ALTITUDE_M,
  NIST_2024,
  MOON,
  moonOrbitCrossoverAltitude,
  moonOrbitTerms,
  moonSurfaceTerms,
  runLunarClocks,
  SECONDS_PER_DAY,
  SPEED_OF_LIGHT,
} from '../physics/lunarClocks'
import type { Direction, Place, Terms, TimeScale } from '../physics/lunarClocks'
import { LunarClocksTutor } from './LunarClocksTutor'
import { ReferencePanel } from './EnergyMomentumExperiment'
import { LookForList, ResultsTable } from './WideBinariesExperiment'
import type { LookFor } from './WideBinariesExperiment'

// Cosmic Horizons, Experiment 10 (docs/experiments/frontier-and-beyond/10-does-time-tick-faster-on-the-moon.md).
// Step 6 builds the controls (the place, the length of an orbit and the duration), shown after the run, which add a white mark to each picture and a Table 4. Step 5 built the results (the status label, three tables, the formulas in the "Words and formulas" panel and the links kept back until after the run). Step 4 built the five-stage run: Picture 1 fills in at stages 1 to 3, Picture 2 at stages 3 and 4 and Picture 3 at stage 5, each with a guide. Step 3 built the two predictions (their answer buttons, Run gated on both, and Start over); Step 2 built the status line, the introduction with its new-word list and its "Want to know more?" links, a drawing of the Earth and the Moon with the
// influences on a clock (an illustration, not data), the collapsed "Words and formulas" panel and the skeleton of Picture 1 (its axes and a guide). Step 7 built the tutor (LunarClocksTutor.tsx) and, in App,
// the chapter summary. All wording is draft for the owner's
// line-by-line approval (CLAUDE.md §28.1), written to the standard of §29. The introduction does not say which clock ticks faster, by how much, or the sizes of
// the terms (that is what the two predictions ask, §12). The interface only displays numbers from src/physics (CLAUDE.md §9); the only calculation here is
// where a point is drawn.

interface LunarClocksExperimentProps {
  onComplete?: () => void
  onTutorComplete?: () => void
}

const VIEW_WIDTH = 560
const TEXT_COLOR = '#e2e8f0'
const MUTED_COLOR = '#94a3b8'
const EARTH_COLOR = '#38bdf8' // sky blue: the Earth and its gravity
const MOON_COLOR = '#d1d5db' // light grey: the Moon
const MOON_GRAVITY_COLOR = '#a5b4fc' // lavender: the Moon's own gravity
const MOTION_COLOR = '#4ade80' // green: motion
const PULL_COLOR = '#fb7185' // rose: the Earth's pull at the Moon
const CLOCK_COLOR = '#fde047' // yellow: a clock
const FAR_COLOR = '#c084fc' // purple: the clock far from everything
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
        <text key={i} x={x} y={y + i * (size + 2)} fill={fill} fontSize={size} fontWeight={bold ? 'bold' : 'normal'} textAnchor={anchor}>
          {line}
        </text>
      ))}
    </>
  )
}

// A power of ten written as 10⁻¹⁰.
const SUPERSCRIPT: Record<string, string> = { '-': '⁻', '0': '⁰', '1': '¹', '2': '²', '3': '³', '4': '⁴', '5': '⁵', '6': '⁶', '7': '⁷', '8': '⁸', '9': '⁹' }
const tenTo = (exponent: number) => `10${String(exponent).split('').map((c) => SUPERSCRIPT[c]).join('')}`

// ---- The Earth and the Moon (an illustration, not data) ----
function EarthMoonDrawing() {
  const height = 470
  return (
    <svg
      width={VIEW_WIDTH}
      height={height}
      viewBox={`0 0 ${VIEW_WIDTH} ${height}`}
      style={svgStyle}
      role="img"
      aria-label="The Earth on the left and the Moon on the right, not to scale. A clock sits on the Earth's equator, which turns with the Earth, and a clock sits on the Moon's surface. Arrows show the Earth's gravity at the first clock, the Earth's spin, the Moon's gravity at the second clock, the Earth's pull on the Moon, and the Moon's motion round the Earth. A small clock in the top corner is far from everything"
    >
      <text x={20} y={22} fill={TEXT_COLOR} fontSize="13" fontWeight="bold">
        Illustration: the Earth, the Moon and two clocks, seen from above
      </text>

      {/* The Earth. */}
      <circle cx={130} cy={250} r={80} fill="#0c4a6e" stroke={EARTH_COLOR} strokeWidth={2} />
      <text x={130} y={254} fill={EARTH_COLOR} fontSize="13" fontWeight="bold" textAnchor="middle">
        Earth
      </text>
      {/* The clock on the Earth's equator, with the Earth's gravity and spin. */}
      <circle cx={210} cy={250} r={7} fill={CLOCK_COLOR} stroke={TEXT_COLOR} strokeWidth={1.5} />
      <line x1={203} y1={250} x2={172} y2={250} stroke={EARTH_COLOR} strokeWidth={3} />
      <polygon points="174,244 160,250 174,256" fill={EARTH_COLOR} />
      <SvgLines x={130} y={150} lines={['clock on the Earth’s equator', '(the yellow dot)']} fill={CLOCK_COLOR} bold anchor="middle" />
      <line x1={150} y1={170} x2={205} y2={243} stroke={CLOCK_COLOR} strokeWidth={1} strokeDasharray="2 3" />
      <SvgLines x={130} y={286} lines={['Earth’s gravity pulls', 'the clock down', '(the blue arrow)']} fill={EARTH_COLOR} bold anchor="middle" />
      <path d="M 210 250 A 80 80 0 0 0 130 330" fill="none" stroke={MOTION_COLOR} strokeWidth={2.5} strokeDasharray="5 4" />
      <polygon points="136,324 124,330 136,338" fill={MOTION_COLOR} />
      <SvgLines x={20} y={356} lines={['the Earth’s spin carries the clock', 'round once a day']} fill={MOTION_COLOR} bold />

      {/* The Moon. */}
      <circle cx={450} cy={250} r={34} fill="#4b5563" stroke={MOON_COLOR} strokeWidth={2} />
      <text x={462} y={238} fill={MOON_COLOR} fontSize="12" fontWeight="bold" textAnchor="middle">
        Moon
      </text>
      <circle cx={416} cy={250} r={6} fill={CLOCK_COLOR} stroke={TEXT_COLOR} strokeWidth={1.5} />
      <SvgLines x={400} y={214} lines={['clock on the', 'Moon’s surface']} fill={CLOCK_COLOR} bold anchor="end" />
      {/* The Earth's pull at the Moon (toward the Earth). */}
      <line x1={409} y1={250} x2={384} y2={250} stroke={PULL_COLOR} strokeWidth={3} />
      <polygon points="386,244 376,250 386,256" fill={PULL_COLOR} />
      <SvgLines x={392} y={274} lines={['the Earth’s pull', 'at the Moon']} fill={PULL_COLOR} bold anchor="end" />
      {/* The Moon's own gravity (toward the Moon's centre). */}
      <line x1={424} y1={250} x2={440} y2={250} stroke={MOON_GRAVITY_COLOR} strokeWidth={3} />
      <polygon points="438,245 446,250 438,255" fill={MOON_GRAVITY_COLOR} />
      <line x1={438} y1={246} x2={470} y2={176} stroke={MOON_GRAVITY_COLOR} strokeWidth={1} strokeDasharray="2 3" />
      <SvgLines x={500} y={150} lines={['the Moon’s own gravity pulls', 'a clock on its surface toward', 'its centre (the small lavender arrow)']} fill={MOON_GRAVITY_COLOR} bold anchor="end" />
      {/* The Moon's motion round the Earth. */}
      <line x1={450} y1={292} x2={450} y2={340} stroke={MOTION_COLOR} strokeWidth={3} />
      <polygon points="444,334 450,346 456,334" fill={MOTION_COLOR} />
      <SvgLines x={450} y={364} lines={['the Moon’s motion round the Earth', '(it goes once round in about a month)']} fill={MOTION_COLOR} bold anchor="middle" />
      <line x1={218} y1={250} x2={374} y2={250} stroke={MUTED_COLOR} strokeWidth={0.8} strokeDasharray="2 5" />
      <text x={296} y={312} fill={MUTED_COLOR} fontSize="10" textAnchor="middle">
        far apart: not to scale
      </text>

      {/* A clock far from everything. */}
      <circle cx={500} cy={62} r={9} fill="none" stroke={FAR_COLOR} strokeWidth={2} />
      <line x1={500} y1={62} x2={500} y2={56} stroke={FAR_COLOR} strokeWidth={1.5} />
      <line x1={500} y1={62} x2={505} y2={64} stroke={FAR_COLOR} strokeWidth={1.5} />
      <SvgLines x={486} y={48} lines={['a clock far from', 'everything (the', 'reference)']} fill={FAR_COLOR} bold anchor="end" />

      <SvgLines
        x={20}
        y={height - 46}
        lines={['A sketch of the idea, not to scale. In reality the Moon is much farther from the Earth', '(about 384,400 km) and much smaller. The arrows show influences on a clock;', 'their lengths do not show how big the influences are.']}
        fill={MUTED_COLOR}
      />
    </svg>
  )
}

const lookForDrawing: LookFor[] = [
  {
    look: 'the clock on the Earth’s equator, and the two arrows beside it (the blue one and the green dashed one).',
    means: 'this clock sits deep in the Earth’s gravity, which pulls on it, and it is carried round by the Earth’s spin. Gravity and motion are the two things that change how a clock ticks.',
    matters: 'in Gravity Experiments 2 and 9 you saw that gravity and motion both change a clock’s rate. To compare two clocks, you have to find out which of these act on each.',
  },
  {
    look: 'the clock on the Moon’s surface, and the three arrows around it (lavender, rose and green).',
    means: 'this clock is in the Moon’s gravity, in the Earth’s gravity too (the rose arrow, though the Earth is far away), and it moves with the Moon as the Moon goes round the Earth.',
    matters: 'a clock on the Moon is affected by more things than a clock on the Earth. Each one has to be counted, and the experiment’s job is to count them.',
  },
  {
    look: 'the small purple clock in the corner.',
    means: 'it is a clock “far from everything”: far from the Earth, the Moon and every other gravity, and not moving. It is only an idea, used as a fixed yardstick.',
    matters: 'to say how much a clock is slowed, we need something to measure it against. A clock far from everything is not slowed at all, so every other clock is slower than it, and we can compare how much.',
  },
]

const REFERENCE_ENTRIES: { term: string; meaning: string }[] = [
  { term: 'Clock rate', meaning: 'how fast a clock ticks, compared with another clock. Two perfect clocks can tick at different rates when they are in different places or moving differently, and nothing is wrong with either.' },
  { term: 'Gravity’s effect on a clock', meaning: 'a clock in a stronger gravity ticks more slowly than one in a weaker gravity. In Gravity Experiment 2 you saw that a clock higher up, where gravity is weaker, ticks a little faster.' },
  { term: 'Motion’s effect on a clock', meaning: 'a moving clock ticks more slowly than a clock that stays still, as you saw in Relativity of Time and Motion Experiments 3 and 4. The faster it moves, the slower it ticks. For the speeds in this experiment the effect is tiny.' },
  { term: 'Gravitational potential', meaning: 'a way of saying how deep a clock sits in the gravity of a body. The nearer to a heavy body, the deeper it sits. A clock far from everything sits at the top, and the deeper a clock sits, the more slowly it ticks.' },
  { term: 'Far from everything (the reference clock)', meaning: 'an imagined clock very far from every body and at rest. Gravity and motion do not slow it, so it is a fixed yardstick: every real clock is slower than it, and the experiment asks by how much.' },
  { term: 'Equator', meaning: 'the line round the middle of the Earth, farthest from its axis. A clock on the equator moves fastest as the Earth spins.' },
  { term: 'The Moon’s motion', meaning: 'the Moon goes round the Earth once in about a month, at a speed of about 1 kilometre per second. A clock on the Moon goes with it.' },
  { term: 'Fractional rate difference', meaning: 'by what fraction one clock ticks faster or slower than another, written as a power of ten (Experiment 9 of this group): 10⁻⁶ is one part in a million, 10⁻¹⁰ one part in ten thousand million.' },
  { term: 'Microsecond and millisecond', meaning: 'a millionth and a thousandth of a second. A day has 86,400 seconds.' },
  { term: 'Artemis II', meaning: 'the first crewed flight of NASA’s Artemis programme. Four astronauts (three from NASA, one from the Canadian Space Agency) launched on 1 April 2026, flew round the Moon on 6 and 7 April, and splashed down on 10 April 2026.' },
  { term: 'ACES', meaning: 'the Atomic Clock Ensemble in Space: two very precise clocks installed on the outside of the International Space Station in April 2025 by ESA, the European Space Agency. They are meant to test how gravity changes the rate of clocks. As of ESA’s page there is no result yet.' },
  { term: 'UTC and a lunar time scale', meaning: 'UTC (Coordinated Universal Time) is the time that the world’s clocks follow. A lunar time scale would be a time kept for the Moon and tied to UTC. The 28th General Conference on Weights and Measures asked for one in October 2026, and left its details open.' },
  { term: 'BIPM and CGPM', meaning: 'the BIPM is the international bureau that looks after the units of measurement. The CGPM is the general conference of its member states (the 28th met on 13 to 15 October 2026). The CIPM is the committee that prepares its work.' },
  { term: 'Coordinate time, TCL and TT', meaning: 'a coordinate time is a time kept for a whole place, such as the Earth or the Moon, so that all the clocks there can be compared; a clock’s own ticking differs from it a little, depending on where the clock sits. TCL (Lunar Coordinate Time) is the one that the International Astronomical Union defined for the Moon in 2024. TT (Terrestrial Time) is the one used for the Earth. Comparing two coordinate times is not the same as comparing two clocks.' },
  { term: 'Geostationary orbit', meaning: `an orbit about ${(Math.round((GEOSTATIONARY_RADIUS_M - EARTH.equatorialRadius) / 100000) * 100).toLocaleString('en-US')} kilometres above the Earth’s surface, in which a satellite goes round once a day, so it stays above the same spot on the Earth.` },
]

// ---- Number formats (every value comes from the physics module) ----
function sciText(value: number, digits = 2): string {
  const [mantissa, exponent] = value.toExponential(digits).split('e')
  return `${mantissa} × ${tenTo(Number(exponent))}`
}
const microsText = (value: number, digits = 1) => `${value > 0 ? '+' : value < 0 ? '−' : ''}${Math.abs(value).toFixed(digits)} µs`

// The durations of the control (a month is a twelfth of a year of 365.25 days).
type DurationName = '1 day' | '1 month' | '1 year'
const DURATIONS: { name: DurationName; seconds: number }[] = [
  { name: '1 day', seconds: SECONDS_PER_DAY },
  { name: '1 month', seconds: SECONDS_PER_DAY * DAYS_PER_MONTH },
  { name: '1 year', seconds: SECONDS_PER_DAY * DAYS_PER_YEAR },
]
const PLACE_BUTTONS: { place: Place; label: string }[] = [
  { place: 'earthEquator', label: 'The Earth’s equator (the reference)' },
  { place: 'earthOrbit', label: 'An orbit round the Earth' },
  { place: 'gps', label: 'A GPS satellite' },
  { place: 'geostationary', label: 'A geostationary satellite' },
  { place: 'moonSurface', label: 'The Moon’s surface' },
  { place: 'moonOrbit', label: 'An orbit round the Moon' },
]

// ---- The run: five named stages. The timer only paces the display; no number depends on it (CLAUDE.md §11). ----
const STAGE_MS = 2600
const LAST_STAGE = 5
const STAGE_NAMES = ['', 'A clock on the Earth', 'A clock on the Moon', 'The difference', 'Other places', 'A clock orbiting the Moon']

// ---- Picture 1: what slows each clock? Stage 1: the Earth's bar; stage 2: the Moon's bar; stage 3: the difference ----
const P1_LEFT = 170
const P1_RIGHT = 520
const P1_TOP = 66
const MAX_LOWERING = 12e-10 // the right-hand end of the axis (wide enough for a low orbit round the Earth)
const loweringToX = (v: number) => P1_LEFT + (v / MAX_LOWERING) * (P1_RIGHT - P1_LEFT)
const GRAVITY_EARTH_COLOR = EARTH_COLOR

// A name split into lines of at most 22 characters, at spaces.
function wrapName(name: string): string[] {
  const words = name.split(' ')
  const lines: string[] = []
  let line = ''
  for (const word of words) {
    if ((line + ' ' + word).trim().length > 22) {
      lines.push(line)
      line = word
    } else line = (line + ' ' + word).trim()
  }
  if (line) lines.push(line)
  return lines
}

function StackedBar({ y, parts }: { y: number; parts: { value: number; color: string }[] }) {
  let start = 0
  return (
    <g>
      {parts.map((part, i) => {
        const x1 = loweringToX(start)
        const x2 = loweringToX(start + part.value)
        start += part.value
        return <rect key={i} x={x1} y={y} width={Math.max(x2 - x1, 1.5)} height={22} fill={part.color} />
      })}
    </g>
  )
}

function PictureOne({ stage, yours }: { stage: number; yours: { terms: Terms; moonBased: boolean; name: string } | null }) {
  const P1_AXIS_Y = yours !== null ? 374 : 290
  const P1_HEIGHT = yours !== null ? 434 : 350
  const part = (v: number) => (v === 0 ? '0' : sciText(v))
  const earth = earthEquatorTerms()
  const moon = moonSurfaceTerms()
  const gain = earth.total - moon.total
  return (
    <svg
      width={VIEW_WIDTH}
      height={P1_HEIGHT}
      viewBox={`0 0 ${VIEW_WIDTH} ${P1_HEIGHT}`}
      style={svgStyle}
      role="img"
      aria-label="How much each of two clocks is slowed, compared with a clock far from everything, as bars made of coloured parts. From the first stage a bar for a clock on the Earth's equator, from the second stage a bar for a clock on the Moon's surface, and from the third stage a bracket for the difference between the two bars"
    >
      <text x={20} y={22} fill={TEXT_COLOR} fontSize="13" fontWeight="bold">
        Picture 1: what slows each clock?
      </text>
      <text x={20} y={40} fill={MUTED_COLOR} fontSize="10">
        How much each clock is slowed, compared with a clock far from everything (a longer bar means slower)
      </text>
      <line x1={P1_LEFT} y1={P1_AXIS_Y} x2={P1_RIGHT} y2={P1_AXIS_Y} stroke={TEXT_COLOR} strokeWidth={1.5} />
      <line x1={P1_LEFT} y1={P1_TOP - 10} x2={P1_LEFT} y2={P1_AXIS_Y} stroke={TEXT_COLOR} strokeWidth={1.5} />
      {[0, 2e-10, 4e-10, 6e-10, 8e-10, 10e-10, 12e-10].map((v) => (
        <g key={v}>
          <line x1={loweringToX(v)} y1={P1_TOP - 10} x2={loweringToX(v)} y2={P1_AXIS_Y} stroke={MUTED_COLOR} strokeWidth={0.5} strokeDasharray="2 4" />
          <line x1={loweringToX(v)} y1={P1_AXIS_Y} x2={loweringToX(v)} y2={P1_AXIS_Y + 5} stroke={TEXT_COLOR} />
          <text x={loweringToX(v)} y={P1_AXIS_Y + 18} fill={TEXT_COLOR} fontSize="10" textAnchor="middle">
            {v === 0 ? '0' : `${v / 1e-10} × ${tenTo(-10)}`}
          </text>
        </g>
      ))}
      <text x={P1_RIGHT} y={P1_AXIS_Y + 38} fill={MUTED_COLOR} fontSize="10" textAnchor="end">
        the fraction by which a clock ticks slower than the clock far from everything
      </text>
      <SvgLines x={20} y={P1_TOP + 26} lines={['clock on the Earth’s', 'equator']} fill={EARTH_COLOR} bold />
      <SvgLines x={20} y={P1_TOP + 126} lines={['clock on the Moon’s', 'surface']} fill={MOON_COLOR} bold />

      {stage >= 1 && (
        <g>
          <StackedBar y={P1_TOP + 10} parts={[{ value: earth.gravityOwn, color: GRAVITY_EARTH_COLOR }, { value: earth.speed, color: MOTION_COLOR }]} />
          <SvgLines
            x={P1_LEFT + 6}
            y={P1_TOP + 48}
            lines={[
              `blue: the Earth’s gravity ${sciText(earth.gravityOwn)}`,
              `green: the Earth’s spin ${sciText(earth.speed)} (too thin to see)`,
              `total slowing: ${sciText(earth.total)}`,
            ]}
            fill={TEXT_COLOR}
          />
        </g>
      )}
      {stage >= 2 && (
        <g>
          <StackedBar
            y={P1_TOP + 110}
            parts={[
              { value: moon.gravityOwn, color: MOON_GRAVITY_COLOR },
              { value: moon.gravityOther, color: PULL_COLOR },
              { value: moon.speed, color: MOTION_COLOR },
            ]}
          />
          <SvgLines
            x={P1_LEFT + 6}
            y={P1_TOP + 148}
            lines={[
              `lavender: the Moon’s gravity ${sciText(moon.gravityOwn)}`,
              `rose: the Earth’s pull at the Moon ${sciText(moon.gravityOther)}`,
              `green: the Moon’s motion round the Earth ${sciText(moon.speed)}`,
              `total slowing: ${sciText(moon.total)}`,
            ]}
            fill={TEXT_COLOR}
          />
        </g>
      )}
      {stage >= 3 && (
        <g>
          <line x1={loweringToX(moon.total)} y1={P1_TOP + 98} x2={loweringToX(earth.total)} y2={P1_TOP + 98} stroke={CLOCK_COLOR} strokeWidth={2.5} />
          <line x1={loweringToX(moon.total)} y1={P1_TOP + 92} x2={loweringToX(moon.total)} y2={P1_TOP + 104} stroke={CLOCK_COLOR} strokeWidth={2.5} />
          <line x1={loweringToX(earth.total)} y1={P1_TOP + 34} x2={loweringToX(earth.total)} y2={P1_TOP + 104} stroke={CLOCK_COLOR} strokeWidth={1.5} strokeDasharray="4 3" />
          <text x={(loweringToX(moon.total) + loweringToX(earth.total)) / 2} y={P1_TOP + 88} fill={CLOCK_COLOR} fontSize="11" fontWeight="bold" textAnchor="middle">
            difference: {sciText(gain)}
          </text>
        </g>
      )}
      {yours !== null && (
        <g>
          <SvgLines x={20} y={P1_TOP + 220} lines={['your clock:', ...wrapName(yours.name)]} fill={YOURS_COLOR} bold />
          <StackedBar
            y={P1_TOP + 216}
            parts={[
              { value: yours.terms.gravityOwn, color: yours.moonBased ? MOON_GRAVITY_COLOR : GRAVITY_EARTH_COLOR },
              { value: yours.terms.gravityOther, color: PULL_COLOR },
              { value: yours.terms.speed, color: MOTION_COLOR },
            ]}
          />
          <rect x={P1_LEFT} y={P1_TOP + 216} width={Math.max(loweringToX(yours.terms.total) - P1_LEFT, 1.5)} height={22} fill="none" stroke={YOURS_COLOR} strokeWidth={1.5} />
          <SvgLines
            x={P1_LEFT + 6}
            y={P1_TOP + 254}
            lines={[
              `${yours.moonBased ? 'lavender: the Moon’s gravity' : 'blue: the Earth’s gravity'} ${part(yours.terms.gravityOwn)}`,
              `rose: the Earth’s pull at the Moon ${part(yours.terms.gravityOther)}`,
              `green: motion ${part(yours.terms.speed)}`,
              `total slowing: ${sciText(yours.terms.total)}`,
            ]}
            fill={YOURS_COLOR}
          />
        </g>
      )}
      {stage === 0 && (
        <text x={P1_LEFT} y={P1_HEIGHT - 12} fill={MUTED_COLOR} fontSize="11">
          The bars, with their parts, are drawn here when you press Run.
        </text>
      )}
    </svg>
  )
}

// ---- Picture 2: how much does each clock gain a day? Stage 3: the Moon; stage 4: the other places ----
const P2_LEFT = 175
const P2_RIGHT = 520
const P2_TOP = 56
const MIN_GAIN = -30
const MAX_GAIN = 62
const gainToX = (v: number) => P2_LEFT + ((v - MIN_GAIN) / (MAX_GAIN - MIN_GAIN)) * (P2_RIGHT - P2_LEFT)
const P2_PLACES: { place: Place; altitudeM: number; name: string; color: string; fromStage: number }[] = [
  { place: 'earthOrbit', altitudeM: 4.0e5, name: 'the International Space Station', color: '#fb923c', fromStage: 4 },
  { place: 'earthEquator', altitudeM: 0, name: 'the Earth’s equator (the reference)', color: EARTH_COLOR, fromStage: 3 },
  { place: 'gps', altitudeM: 0, name: 'a GPS satellite', color: '#fbbf24', fromStage: 4 },
  { place: 'geostationary', altitudeM: 0, name: 'a geostationary satellite', color: '#a3e635', fromStage: 4 },
  { place: 'moonOrbit', altitudeM: 1e5, name: 'an orbit 100 km above the Moon', color: MOON_GRAVITY_COLOR, fromStage: 4 },
  { place: 'moonSurface', altitudeM: 0, name: 'the Moon’s surface', color: MOON_COLOR, fromStage: 3 },
]

function PictureTwo({ stage, yours }: { stage: number; yours: { gain: number; name: string; gapLabel: string } | null }) {
  const axisY = P2_TOP + 30 + (P2_PLACES.length + (yours !== null ? 1 : 0)) * 44 + 8
  const P2_HEIGHT = axisY + 70
  return (
    <svg
      width={VIEW_WIDTH}
      height={P2_HEIGHT}
      viewBox={`0 0 ${VIEW_WIDTH} ${P2_HEIGHT}`}
      style={svgStyle}
      role="img"
      aria-label="How many microseconds a day each place's clock gains on a clock on the Earth's equator, on a number line from minus 30 to plus 60. From the third stage the Earth's equator, at zero, and the Moon's surface; from the fourth stage the International Space Station, a GPS satellite, a geostationary satellite and an orbit 100 kilometres above the Moon"
    >
      <text x={20} y={22} fill={TEXT_COLOR} fontSize="13" fontWeight="bold">
        Picture 2: how much does each clock gain a day?
      </text>
      <text x={20} y={40} fill={MUTED_COLOR} fontSize="10">
        Microseconds a day, against a clock on the Earth’s equator (to the right: gains; to the left: loses)
      </text>
      <line x1={P2_LEFT} y1={axisY} x2={P2_RIGHT} y2={axisY} stroke={TEXT_COLOR} strokeWidth={1.5} />
      {[-30, -20, -10, 0, 10, 20, 30, 40, 50, 60].map((v) => (
        <g key={v}>
          <line x1={gainToX(v)} y1={P2_TOP} x2={gainToX(v)} y2={axisY} stroke={v === 0 ? TEXT_COLOR : MUTED_COLOR} strokeWidth={v === 0 ? 1.2 : 0.5} strokeDasharray={v === 0 ? undefined : '2 4'} />
          <line x1={gainToX(v)} y1={axisY} x2={gainToX(v)} y2={axisY + 5} stroke={TEXT_COLOR} />
          <text x={gainToX(v)} y={axisY + 18} fill={TEXT_COLOR} fontSize="10" textAnchor="middle">
            {v}
          </text>
        </g>
      ))}
      <text x={P2_RIGHT} y={axisY + 38} fill={MUTED_COLOR} fontSize="10" textAnchor="end">
        microseconds gained a day (a microsecond is a millionth of a second)
      </text>
      {P2_PLACES.map((p, i) => {
        const y = P2_TOP + 30 + i * 44
        const result = runLunarClocks(p.place, p.altitudeM, SECONDS_PER_DAY)
        const g = result.gainMicrosecondsPerDay
        const shown = stage >= p.fromStage
        return (
          <g key={p.name}>
            <SvgLines x={20} y={y - 2} lines={p.name.length > 24 ? [p.name.slice(0, p.name.lastIndexOf(' ', 24)), p.name.slice(p.name.lastIndexOf(' ', 24) + 1)] : [p.name]} fill={shown ? p.color : MUTED_COLOR} bold />
            {shown && (
              <>
                <line x1={gainToX(0)} y1={y} x2={gainToX(g)} y2={y} stroke={p.color} strokeWidth={2.5} />
                <circle cx={gainToX(g)} cy={y} r={6} fill={p.color} stroke={TEXT_COLOR} strokeWidth={1} />
                <text x={g >= 0 ? Math.min(gainToX(g) + 10, P2_RIGHT - 52) : gainToX(g) + 4} y={y + (g >= 0 ? (gainToX(g) + 10 > P2_RIGHT - 52 ? -10 : 4) : -10)} fill={p.color} fontSize="10" fontWeight="bold" textAnchor="start">
                  {p.place === 'earthEquator' ? '0 (reference)' : microsText(g, 1)}
                </text>
              </>
            )}
          </g>
        )
      })}
      {yours !== null &&
        (() => {
          const y = P2_TOP + 30 + P2_PLACES.length * 44
          const g = yours.gain
          return (
            <g>
              <SvgLines x={20} y={y - 8} lines={['your clock:', ...wrapName(yours.name)]} fill={YOURS_COLOR} bold />
              <line x1={gainToX(0)} y1={y} x2={gainToX(g)} y2={y} stroke={YOURS_COLOR} strokeWidth={2.5} />
              <circle cx={gainToX(g)} cy={y} r={7} fill="none" stroke={YOURS_COLOR} strokeWidth={2.5} />
              <text x={Math.min(gainToX(g) + 12, P2_RIGHT - 150)} y={y - 11} fill={YOURS_COLOR} fontSize="10" fontWeight="bold">
                {microsText(g, 2)} a day ({yours.gapLabel})
              </text>
            </g>
          )
        })()}
    </svg>
  )
}

// ---- Picture 3: a clock orbiting the Moon, against a clock on the Moon's surface (stage 5) ----
const P3_LEFT = 90
const P3_RIGHT = 520
const P3_TOP = 70
const P3_BOTTOM = 290
const P3_HEIGHT = 390
const MIN_ALT_EXP = 4.3 // 20 km
const MAX_ALT_EXP = 7 // 10,000 km
const MIN_Y = -1.5
const MAX_Y = 2.5
const altToX = (exp: number) => P3_LEFT + ((exp - MIN_ALT_EXP) / (MAX_ALT_EXP - MIN_ALT_EXP)) * (P3_RIGHT - P3_LEFT)
const yToPx = (v: number) => P3_BOTTOM - ((v - MIN_Y) / (MAX_Y - MIN_Y)) * (P3_BOTTOM - P3_TOP)
const againstSurface = (altitudeM: number) => gainMicrosecondsPerDay(moonSurfaceTerms(), moonOrbitTerms(altitudeM))
const P3_CURVE = (() => {
  const pts: string[] = []
  const n = 60
  for (let i = 0; i <= n; i++) {
    const e = MIN_ALT_EXP + ((MAX_ALT_EXP - MIN_ALT_EXP) * i) / n
    pts.push(`${i === 0 ? 'M' : 'L'}${altToX(e).toFixed(1)},${yToPx(againstSurface(10 ** e)).toFixed(1)}`)
  }
  return pts.join(' ')
})()

function PictureThree({ yourAltitudeM }: { yourAltitudeM: number | null }) {
  const cross = moonOrbitCrossoverAltitude()
  const crossX = altToX(Math.log10(cross))
  const lowAlt = 1e5
  return (
    <svg
      width={VIEW_WIDTH}
      height={P3_HEIGHT}
      viewBox={`0 0 ${VIEW_WIDTH} ${P3_HEIGHT}`}
      style={svgStyle}
      role="img"
      aria-label="The gain of a clock in orbit round the Moon against a clock on the Moon's surface, in microseconds a day, against the height of the orbit on a logarithmic scale from 20 kilometres to 10,000 kilometres. The curve is below zero at low orbits, crosses zero at about 869 kilometres, which is half a Moon radius, and rises above zero at higher orbits"
    >
      <text x={20} y={22} fill={TEXT_COLOR} fontSize="13" fontWeight="bold">
        Picture 3: a clock orbiting the Moon, against one on its surface
      </text>
      <text x={20} y={40} fill={MUTED_COLOR} fontSize="10">
        Microseconds a day gained by a clock in a circular orbit round the Moon (above the line: gains; below: loses)
      </text>
      <line x1={P3_LEFT} y1={P3_TOP} x2={P3_LEFT} y2={P3_BOTTOM} stroke={TEXT_COLOR} strokeWidth={1.5} />
      {[-1, 0, 1, 2].map((v) => (
        <g key={v}>
          <line x1={P3_LEFT - 5} y1={yToPx(v)} x2={P3_RIGHT} y2={yToPx(v)} stroke={v === 0 ? CLOCK_COLOR : MUTED_COLOR} strokeWidth={v === 0 ? 1.5 : 0.5} strokeDasharray={v === 0 ? '6 3' : '2 4'} />
          <text x={P3_LEFT - 9} y={yToPx(v) + 3} fill={TEXT_COLOR} fontSize="10" textAnchor="end">
            {v > 0 ? `+${v}` : v}
          </text>
        </g>
      ))}
      <text x={P3_LEFT + 8} y={yToPx(0) - 5} fill={CLOCK_COLOR} fontSize="10" fontWeight="bold" textAnchor="start">
        same rate as a clock on the Moon’s surface
      </text>
      {[[4.7, '50 km'], [5, '100 km'], [5.7, '500 km'], [6, '1,000 km'], [6.7, '5,000 km']].map(([e, label]) => (
        <g key={String(label)}>
          <line x1={altToX(e as number)} y1={P3_BOTTOM} x2={altToX(e as number)} y2={P3_BOTTOM + 5} stroke={TEXT_COLOR} />
          <text x={altToX(e as number)} y={P3_BOTTOM + 18} fill={TEXT_COLOR} fontSize="10" textAnchor="middle">
            {label}
          </text>
        </g>
      ))}
      <line x1={P3_LEFT} y1={P3_BOTTOM} x2={P3_RIGHT} y2={P3_BOTTOM} stroke={TEXT_COLOR} strokeWidth={1.5} />
      <text x={P3_RIGHT} y={P3_BOTTOM + 36} fill={MUTED_COLOR} fontSize="10" textAnchor="end">
        height of the orbit above the Moon’s surface (a logarithmic scale: each step multiplies the height)
      </text>
      <path d={P3_CURVE} fill="none" stroke={MOON_GRAVITY_COLOR} strokeWidth={2.5} />
      {yourAltitudeM !== null && (
        <g>
          <text x={P3_LEFT} y={P3_BOTTOM + 58} fill={YOURS_COLOR} fontSize="11" fontWeight="bold">
            your orbit (the white ring): {(yourAltitudeM / 1000).toLocaleString('en-US')} km up, {microsText(againstSurface(yourAltitudeM), 2)} a day against the surface clock
          </text>
          <circle cx={altToX(Math.log10(yourAltitudeM))} cy={yToPx(againstSurface(yourAltitudeM))} r={7} fill="none" stroke={YOURS_COLOR} strokeWidth={2.5} />
        </g>
      )}
      <line x1={crossX} y1={P3_TOP} x2={crossX} y2={P3_BOTTOM} stroke={CLOCK_COLOR} strokeWidth={1.2} strokeDasharray="4 3" />
      <circle cx={crossX} cy={yToPx(0)} r={5.5} fill={CLOCK_COLOR} stroke={TEXT_COLOR} strokeWidth={1} />
      <SvgLines x={crossX + 10} y={yToPx(0) + 22} lines={[`crossover: ${(cross / 1000).toFixed(0)} km`, '(half a Moon radius)']} fill={CLOCK_COLOR} bold />
      <circle cx={altToX(Math.log10(lowAlt))} cy={yToPx(againstSurface(lowAlt))} r={5} fill={MOON_GRAVITY_COLOR} stroke={TEXT_COLOR} strokeWidth={1} />
      <SvgLines x={altToX(Math.log10(lowAlt)) + 8} y={yToPx(againstSurface(lowAlt)) + 18} lines={[`100 km: ${microsText(againstSurface(lowAlt), 2)} a day`]} fill={MOON_GRAVITY_COLOR} bold />
      <SvgLines x={P3_LEFT + 8} y={yToPx(0) + 14} lines={['below the line: the orbiting clock is slower']} fill={MUTED_COLOR} />
      <SvgLines x={P3_LEFT + 8} y={P3_TOP + 14} lines={['above the line: the orbiting clock is faster']} fill={MUTED_COLOR} />
    </svg>
  )
}

// The papers behind the results, shown only after the run because their summaries state what the predictions ask (CLAUDE.md §12). Each address was fetched on
// 2026-10-21 (the arXiv pages for their abstracts).
const PAPER_LINKS: { href: string; label: string; what: string }[] = [
  {
    href: 'https://arxiv.org/abs/2402.11150',
    label: 'arXiv:2402.11150: the NIST study (Ashby and Patla, The Astronomical Journal, 2024)',
    what: 'the original calculation of the rate of a clock on the Moon, with the framework that extends to points in space between the Earth and the Moon. It is written for scientists.',
  },
  {
    href: 'https://arxiv.org/abs/2511.02709',
    label: 'arXiv:2511.02709: “Lunar Time” (Defraigne, Meynadier and Bourgoin, 2025)',
    what: 'a study of how a lunar time scale could be defined, and why the rate of a lunar clock depends on which time scale it is compared with. It is written for scientists.',
  },
]

// The two prediction questions' answers (the specification's "Prediction Activity"). The labels do not say which answer is right.
const DIRECTION_CHOICES: ReadonlyArray<{ value: Direction; label: string }> = [
  { value: 'slower', label: 'Slower' },
  { value: 'same', label: 'The same' },
  { value: 'faster', label: 'Faster' },
]
const SIZE_CHOICES: ReadonlyArray<{ value: TimeScale; label: string }> = [
  { value: 'nanosecond', label: 'About 56 nanoseconds (billionths of a second)' },
  { value: 'microsecond', label: 'About 56 microseconds (millionths of a second)' },
  { value: 'millisecond', label: 'About 56 milliseconds (thousandths of a second)' },
]

export function LunarClocksExperiment({ onComplete, onTutorComplete }: LunarClocksExperimentProps) {
  const [directionPrediction, setDirectionPrediction] = useState<Direction | null>(null)
  const [sizePrediction, setSizePrediction] = useState<TimeScale | null>(null)
  const [status, setStatus] = useState<'idle' | 'running' | 'complete'>('idle')
  const [stage, setStage] = useState(0)
  // The controls that appear after the run (the specification's "Learner Controls"). They start at the Moon's surface, one day, and 400 km and 100 km orbits.
  const [place, setPlace] = useState<Place>('moonSurface')
  const [earthAltKm, setEarthAltKm] = useState(400)
  const [moonAltExp, setMoonAltExp] = useState(2) // the slider holds the power of ten of the altitude in kilometres
  const [durationName, setDurationName] = useState<DurationName>('1 day')
  const hasRun = status !== 'idle'
  const bothPredicted = directionPrediction !== null && sizePrediction !== null

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
    setDirectionPrediction(null)
    setSizePrediction(null)
    setStatus('idle')
    setStage(0)
    setPlace('moonSurface')
    setEarthAltKm(400)
    setMoonAltExp(2)
    setDurationName('1 day')
  }
  function run() {
    setStage(1)
    setStatus('running')
  }
  const earth = earthEquatorTerms()
  const moon = moonSurfaceTerms()
  const difference = earth.total - moon.total
  const cSquared = SPEED_OF_LIGHT * SPEED_OF_LIGHT
  const gainMoon = gainMicrosecondsPerDay(earth, moon)
  const iss = earthOrbitTerms(4.0e5)
  const gainIss = gainMicrosecondsPerDay(earth, iss)
  const gainGps = gainMicrosecondsPerDay(earth, earthOrbitTerms(GPS_ALTITUDE_M))
  const gainGeo = gainMicrosecondsPerDay(earth, earthOrbitTerms(GEOSTATIONARY_RADIUS_M - EARTH.equatorialRadius))
  const gainLowMoon = gainMicrosecondsPerDay(earth, moonOrbitTerms(1e5))
  const gainLowAgainstSurface = gainMicrosecondsPerDay(moon, moonOrbitTerms(1e5))
  const cross = moonOrbitCrossoverAltitude()
  const done = status === 'complete'
  const spinSpeed = EARTH.rotation * EARTH.equatorialRadius
  const gapDay = gapSeconds(earth, moon, SECONDS_PER_DAY)
  const gapMonth = gapSeconds(earth, moon, SECONDS_PER_DAY * DAYS_PER_MONTH)
  const gapYear = gapSeconds(earth, moon, SECONDS_PER_DAY * DAYS_PER_YEAR)
  const nistAgreement = (Math.abs(gainMoon - NIST_2024.gainMicrosecondsPerDay) / NIST_2024.gainMicrosecondsPerDay) * 100
  const moonOwnMicros = moon.gravityOwn * SECONDS_PER_DAY * 1e6
  const secondsText = (value: number) => (value < 1e-3 ? `${(value * 1e6).toFixed(1)} microseconds` : `${(value * 1e3).toFixed(2)} milliseconds`)
  const yourMoonAltKm = Number((10 ** moonAltExp).toPrecision(2))
  const yourAltitudeM = place === 'earthOrbit' ? earthAltKm * 1000 : place === 'moonOrbit' ? yourMoonAltKm * 1000 : 0
  const yourDuration = DURATIONS.find((d) => d.name === durationName) as { name: DurationName; seconds: number }
  const mine = runLunarClocks(place, yourAltitudeM, yourDuration.seconds)
  const yourName =
    place === 'earthOrbit'
      ? `an orbit ${earthAltKm.toLocaleString('en-US')} km above the Earth`
      : place === 'moonOrbit'
        ? `an orbit ${yourMoonAltKm.toLocaleString('en-US')} km above the Moon`
        : (PLACE_BUTTONS.find((b) => b.place === place) as { label: string }).label.toLowerCase().replace(' (the reference)', '')
  const yourMoonBased = place === 'moonSurface' || place === 'moonOrbit'
  // Formulas with worked examples: shown in the panel only after the run (the specification's "Results"). Every number is from the module.
  const formulaEntries: { term: string; meaning: string }[] = [
    {
      term: 'How much a clock is slowed (formula)',
      meaning: `slowing = Φ ÷ c² + v² ÷ (2 × c²), where Φ is the sum of GM ÷ distance for each body that matters (how deep the clock sits in gravity), v is the clock’s speed, and c = ${SPEED_OF_LIGHT.toLocaleString('en-US')} m/s. Both parts lower a clock’s rate, compared with a clock far from everything.`,
    },
    {
      term: 'The Earth’s equator clock (formula)',
      meaning: `gravity GM ÷ (R × c²) = ${sciText(EARTH.gm, 3)} ÷ (${sciText(EARTH.equatorialRadius, 3)} × ${sciText(cSquared, 3)}) = ${sciText(earth.gravityOwn)}; spin (ω × R)² ÷ (2c²), with ω × R = ${spinSpeed.toFixed(1)} m/s, = ${sciText(earth.speed)}; total ${sciText(earth.total)}.`,
    },
    {
      term: 'The Moon’s surface clock (formula)',
      meaning: `the Moon’s gravity ${sciText(moon.gravityOwn)}, the Earth’s pull at the Moon GM_Earth ÷ (d × c²) = ${sciText(EARTH.gm, 3)} ÷ (${sciText(MOON.meanDistance, 3)} × ${sciText(cSquared, 3)}) = ${sciText(moon.gravityOther)}, and the motion v² ÷ (2c²) with v = ${MOON.orbitalSpeed} m/s, = ${sciText(moon.speed)}; total ${sciText(moon.total)}.`,
    },
    {
      term: 'A circular orbit (formula)',
      meaning: `a clock in a circular orbit at distance r from the centre has the orbital speed √(GM ÷ r), so its motion term is GM ÷ (2 × r × c²), half of its gravity term GM ÷ (r × c²), and the two add to 1.5 × GM ÷ (r × c²). Example, the International Space Station at r = ${sciText(EARTH.equatorialRadius + 4.0e5, 3)} m: 1.5 × ${sciText(EARTH.gm, 3)} ÷ (${sciText(EARTH.equatorialRadius + 4.0e5, 3)} × ${sciText(cSquared, 3)}) = ${sciText(iss.total)}.`,
    },
    {
      term: 'The gain of a clock (formula)',
      meaning: `gain = (the reference clock’s slowing − the clock’s slowing) × the time. Example, the Moon’s surface against the Earth’s equator for one day: (${sciText(earth.total)} − ${sciText(moon.total)}) × ${SECONDS_PER_DAY.toLocaleString('en-US')} s = ${microsText(gainMoon, 2)}. A positive gain means the clock ticks faster; a negative one, slower.`,
    },
    {
      term: 'The crossover round the Moon (formula)',
      meaning: `a clock in orbit gains from weaker gravity GM × (1 ÷ R − 1 ÷ r) ÷ c² and loses from its speed GM ÷ (2 × r × c²); the two cancel at r = 1.5 × R. For the Moon, R = ${(MOON.radius / 1000).toLocaleString('en-US')} km, so r = ${((1.5 * MOON.radius) / 1000).toFixed(0)} km from the centre, an altitude of ${(cross / 1000).toFixed(0)} km.`,
    },
  ]
  const moonGravity = MOON.gm / (MOON.radius * MOON.radius)
  const earthGravity = EARTH.gm / (EARTH.equatorialRadius * EARTH.equatorialRadius)
  const moonDistanceKm = MOON.meanDistance / 1000
  return (
    <div>
      <h2>Experiment 10 — Does Time Tick Faster on the Moon?</h2>
      <div className="exp-card" style={{ marginTop: '2rem', padding: '1.5rem' }}>
        <p style={{ marginTop: 0, marginBottom: '1.5rem', fontSize: '0.875rem' }}>
          <strong>
            Where this stands (as of October 2026): physicists have worked out what relativity says about a clock on the Moon, space agencies are planning
            for clocks there, and astronauts flew round the Moon in April 2026. The full status, with what the calculation gives and whether any clock has
            measured it, is shown after you press Run, so that you can guess first.
          </strong>
        </p>

        <div style={{ marginBottom: '1.5rem' }}>
          <p style={paragraph}>
            <strong>The question.</strong> A clock sits on the ground, and an identical clock sits on the Moon. Do they tick at the same rate? In Gravity
            Experiments 2 and 9 you saw that both gravity and motion change the rate of a clock, so the answer depends on how strong gravity is where each
            clock sits and how fast each is moving. The Moon’s gravity at its surface is about {(earthGravity / moonGravity).toFixed(0)} times weaker than the Earth’s (about a
            sixth). Which clock ticks faster, and by how much?
          </p>

          <p style={paragraph}>
            <strong>Where we left off.</strong> In Gravity Experiment 2 you saw that a clock higher up ticks a little faster than one lower down. In Gravity
            Experiment 9 you saw that the clocks of GPS satellites need a correction, because two effects compete: gravity is weaker up there, which speeds a clock
            up, and the satellite is moving, which slows it down. In Relativity of Time and Motion Experiments 3 and 4 you saw that moving clocks tick more
            slowly, and in Experiment 9 of this group you saw how tiny differences are written as powers of ten.
          </p>

          <p style={paragraph}>
            <strong>Why the Moon, and why now.</strong> On 1 April 2026 four astronauts launched on <strong>Artemis II</strong>, flew round the Moon on 6 and 7 April and
            returned on 10 April: the first crewed flight to the Moon in more than 50 years. Space agencies plan navigation and communication systems for the Moon, and such
            systems depend on clocks. In 2024 two physicists at NIST, the national measurement laboratory of the United States, Neil Ashby and Bijunath Patla,
            worked out what relativity says about the rate of a clock on the Moon. The International Astronomical Union defined a “Lunar Coordinate Time” in
            2024, and in October 2026 the General Conference on Weights and Measures asked for an international <strong>lunar time scale</strong>, tied to UTC, the
            time that the world’s clocks follow. On the International Space Station, ESA’s <strong>ACES</strong> clocks, installed in April 2025, are meant to test how gravity changes a clock’s rate.
          </p>

          <div style={{ marginBottom: '0.75rem' }}>
            <EarthMoonDrawing />
          </div>
          <div style={{ fontSize: '0.875rem', color: 'var(--text-muted)', marginBottom: '0.75rem' }}>
            <p style={paragraph}>
              <strong>How to read this drawing.</strong> It is a sketch of the idea, not a map, and it is not to scale. You are looking at the Earth and the Moon
              from above.
            </p>
            <ul style={{ margin: '0 0 0.75rem', paddingLeft: '1.25rem' }}>
              <li>
                <strong>The blue circle</strong> is the Earth. <strong>The yellow dot on its edge</strong> is a clock on the equator. <strong>The blue arrow</strong>{' '}
                is the Earth’s gravity pulling that clock down, and <strong>the green dashed curve</strong> is the Earth’s spin carrying the clock round once a day.
              </li>
              <li>
                <strong>The grey circle</strong> is the Moon, and <strong>the yellow dot</strong> on its near side is a clock on the Moon’s surface. The{' '}
                <strong>lavender arrow</strong> is the Moon’s own gravity, the <strong>rose arrow</strong> is the Earth’s pull reaching out to the Moon, and the{' '}
                <strong>green arrow</strong> below the Moon is its motion round the Earth.
              </li>
              <li>
                <strong>The small purple clock</strong> in the corner is the clock far from everything, used as a yardstick.
              </li>
            </ul>
            <p style={{ marginTop: 0, marginBottom: '0.5rem' }}>
              <strong>What to look for.</strong>
            </p>
            <LookForList items={lookForDrawing} />
          </div>

          <p style={paragraph}>
            <strong>Adding up what slows a clock.</strong> Gravity slows a clock, and the deeper the clock sits in gravity, the more. Motion slows a clock, and the
            faster it moves, the more. Compared with a clock <strong>far from everything</strong> (not in anyone’s gravity, and not moving), every real clock is
            slowed by a tiny fraction, and that fraction is the sum of a gravity part and a motion part. So the question is not whether a clock is slowed, but
            which of two clocks is slowed less. A clock on the Moon has three influences to count: the Moon’s gravity, the Earth’s gravity at the Moon’s distance
            (about {moonDistanceKm.toLocaleString('en-US')} kilometres), and the Moon’s motion round the Earth (about {(MOON.orbitalSpeed / 1000).toFixed(3)} kilometres a second). A
            clock on the Earth’s equator has the Earth’s gravity and the Earth’s spin. The sizes of these, and which clock wins, are what the two predictions
            below ask, so the numbers are shown after the run.
          </p>

          <p style={paragraph}>
            <strong>Tiny numbers and times.</strong> The differences are written as powers of ten, as in Experiment 9: {tenTo(-6)} is one part in a million. A day has{' '}
            {SECONDS_PER_DAY.toLocaleString('en-US')} seconds. A <strong>millisecond</strong> is a thousandth of a second and a <strong>microsecond</strong> a millionth.
          </p>

          <p style={paragraph}>
            <strong>Where the question stands (October 2026).</strong> The calculation has been done and published (NIST, 2024), and it uses relativity that has been
            tested with clocks on the Earth, in orbit and across small heights. What it gives, and whether any clock has measured it, are shown after the run. The 28th
            General Conference on Weights and Measures (13 to 15 October 2026) asked for an international lunar time scale and did not give a rate difference. In April
            2024 the White House’s Office of Science and Technology Policy asked NASA to make a plan for a “Coordinated Lunar Time” by the end of 2026.
          </p>

          <div style={{ marginBottom: '0.75rem' }}>
            <p style={{ marginTop: 0, marginBottom: '0.5rem' }}>
              <strong>Some new words.</strong> The “Words and formulas” box below has each one, with the ones from earlier experiments.
            </p>
            <ul style={{ margin: 0, paddingLeft: '1.25rem' }}>
              <li>
                <strong>Gravitational potential</strong> and <strong>far from everything</strong>: how deep a clock sits in gravity, and the yardstick clock.
              </li>
              <li>
                <strong>Gravity’s effect</strong>, <strong>motion’s effect</strong> and <strong>clock rate</strong>: what changes how a clock ticks.
              </li>
              <li>
                <strong>Artemis II</strong>, <strong>ACES</strong>, <strong>UTC and a lunar time scale</strong>, <strong>BIPM and CGPM</strong>, <strong>coordinate time</strong> and{' '}
                <strong>geostationary orbit</strong>: the missions, the organisations and the time scales in the news.
              </li>
            </ul>
          </div>

          <p style={paragraph}>
            <strong>What you will do.</strong> You will make two predictions, press Run to watch the pictures build up one stage at a time, and then try other places,
            other durations and other orbits of your own. Nothing here is graded.
          </p>

          <p style={paragraph}>
            <strong>What we assume.</strong> This experiment is a simple model. It uses the average distance and the average speed of the Moon, so it does not show the
            small changes in the rate during a month (the Moon’s orbit is not a perfect circle). It treats the Earth and the Moon as perfect spheres, leaves out the
            Sun (whose pull is nearly the same on both, so it nearly cancels), and uses the Earth’s equator for the Earth clock. It does not define a lunar time
            scale and does not claim that a clock on the Moon has been measured. It uses the published numbers as the sources state them.
          </p>

          <p style={{ marginTop: 0, marginBottom: '0.75rem' }}>
            <strong>Want to know more?</strong> Plainer-language pages are listed here. The link to the original scientific paper appears below the results, after you
            press Run, because its summary states what the predictions ask, and you should get to guess first. Links open in a new tab. This page was written as of
            October 2026.
          </p>
          <ul style={{ margin: '0.25rem 0 0', paddingLeft: '1.25rem' }}>
            <li>
              <ExternalLink href="https://www.nist.gov/news-events/news/2024/08/what-time-it-moon">NIST: What time is it on the Moon?</ExternalLink>: the laboratory’s own
              plain account of the 2024 study of clocks on the Moon, and why a lunar time standard is needed.
            </li>
            <li>
              <ExternalLink href="https://www.bipm.org/en/cgpm-2026">BIPM: the 28th General Conference on Weights and Measures (2026)</ExternalLink>: the seven
              resolutions of October 2026, including Resolution 6 on an international lunar reference time scale.
            </li>
            <li>
              <ExternalLink href="https://www.nasa.gov/mission/artemis-ii/">NASA: Artemis II</ExternalLink>: the first crewed Artemis flight, with its crew, dates and
              pictures.
            </li>
            <li>
              <ExternalLink href="https://nssdc.gsfc.nasa.gov/planetary/factsheet/moonfact.html">NASA: Moon fact sheet</ExternalLink>: the Moon’s size, mass, gravity,
              distance from the Earth and speed, which this experiment uses.
            </li>
            <li>
              <ExternalLink href="https://www.esa.int/Science_Exploration/Human_and_Robotic_Exploration/ACES_finds_its_home_in_orbit">ESA: ACES finds its home in orbit</ExternalLink>:
              the clocks on the International Space Station, what they are meant to test, and when their results are expected.
            </li>
          </ul>
        </div>

        <ReferencePanel entries={done ? [...REFERENCE_ENTRIES, ...formulaEntries] : REFERENCE_ENTRIES} />

        {/* The two predictions: draft wording for the owner's review (CLAUDE.md §28.1), from the specification's "Prediction Activity". Neither says
            which answer is right, gives the sign, or gives the sizes of the terms. */}
        {(
          [
            {
              title: 'Prediction 1: faster or slower?',
              text: (
                <>
                  Two identical, perfect clocks are set to the same time. One is kept on the <strong>Earth’s surface</strong>. The other is taken to the{' '}
                  <strong>Moon’s surface</strong>, where gravity is about a sixth of the Earth’s, and left there. Compared with the clock on the Earth, will the
                  clock on the Moon tick <strong>slower</strong>, at <strong>the same rate</strong>, or <strong>faster</strong>?
                </>
              ),
              choices: DIRECTION_CHOICES,
              value: directionPrediction,
              set: (v: Direction) => setDirectionPrediction(v),
            },
            {
              title: 'Prediction 2: by how much?',
              text: (
                <>
                  If the clock on the Moon ticks at a different rate, how far apart would the two clocks be after <strong>one day</strong>?
                </>
              ),
              choices: SIZE_CHOICES,
              value: sizePrediction,
              set: (v: TimeScale) => setSizePrediction(v),
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
                <span style={{ color: 'var(--text-muted)' }}>
                  {' '}
                  (all {LAST_STAGE} stages shown). Your predictions are recorded and not marked here.
                </span>
              )}
            </>
          )}
        </p>
        {status === 'running' && (
          <p style={{ fontSize: '0.875rem', marginTop: 0, color: 'var(--text-muted)' }}>
            {stage === 1 &&
              `Picture 1 now shows a clock on the Earth’s equator. It is slowed, compared with a clock far from everything, by ${sciText(earth.total)}: almost all of it from the Earth’s gravity (blue), and a very little from the Earth’s spin (green).`}
            {stage === 2 &&
              `The Moon’s clock is added. It has three influences: the Moon’s gravity (lavender, ${sciText(moon.gravityOwn)}), the Earth’s pull at the Moon (rose, ${sciText(moon.gravityOther)}) and the Moon’s motion round the Earth (green, ${sciText(moon.speed)}). Its total is ${sciText(moon.total)}.`}
            {stage === 3 &&
              `The two bars differ by ${sciText(difference)}. Picture 2 appears below Picture 1: ${difference > 0 ? 'the clock that is slowed less ticks faster' : 'the clock that is slowed more ticks slower'}, by this fraction. Over one day (${SECONDS_PER_DAY.toLocaleString('en-US')} seconds) that is ${microsText(gainMoon, 2)}.`}
            {stage === 4 &&
              'Picture 2 now shows other places, using the same rule: the International Space Station, a GPS satellite, a geostationary satellite and an orbit 100 kilometres above the Moon. A clock can gain or lose, depending on where it is.'}
            {stage === 5 &&
              'Picture 3 appears below Picture 2. It compares a clock orbiting the Moon with a clock on the Moon’s surface, for orbits of different heights. Look for the height at which the two tick at the same rate.'}
          </p>
        )}

        {/* Picture 1: the bars from stage 1, the Moon's bar from stage 2, the difference from stage 3. */}
        <div style={{ marginTop: '1.5rem', marginBottom: '1rem' }}>
          <PictureOne stage={stage} yours={done ? { terms: mine.terms, moonBased: yourMoonBased, name: yourName } : null} />
        </div>
        <div style={{ fontSize: '0.875rem', color: 'var(--text-muted)', marginBottom: '1.5rem' }}>
          <p style={paragraph}>
            <strong>How to read Picture 1.</strong> This picture shows how much each of two clocks is slowed, compared with a clock far from everything. Each row is one
            clock. Each bar starts at 0 on the left, where the clock far from everything sits, and its length is the fraction by which that clock ticks slower than
            it. A longer bar means a clock that is slowed more.
          </p>
          <ul style={{ margin: '0 0 0.75rem', paddingLeft: '1.25rem' }}>
            <li>
              <strong>The horizontal line</strong> is that fraction, written as a power of ten: <strong>2 × {tenTo(-10)}</strong> means two parts in ten thousand
              million. The scale runs from 0 to 12 × {tenTo(-10)}.
            </li>
            <li>
              <strong>The colours</strong> are the influences that add up to a bar: <strong>blue</strong> is the Earth’s gravity, <strong>lavender</strong> is the
              Moon’s own gravity, <strong>rose</strong> is the Earth’s pull at the Moon’s distance, and <strong>green</strong> is motion (the Earth’s spin for the Earth
              clock, the Moon’s motion round the Earth for the Moon clock). The numbers beside each bar give each part and the total.
            </li>
            {stage === 0 && (
              <li>
                <strong>Nothing is drawn yet.</strong> After you press Run, the Earth’s bar appears, then the Moon’s bar, then the difference.
              </li>
            )}
            {stage >= 1 && (
              <li>
                <strong>The top bar</strong> is the clock on the Earth’s equator. A very thin green part is its spin, too thin to see.
              </li>
            )}
            {stage >= 2 && (
              <li>
                <strong>The lower bar</strong> is the clock on the Moon’s surface, with three parts: lavender, rose and green.
              </li>
            )}
            {done && (
              <li>
                <strong>The white-outlined bottom bar</strong> is your own clock, from control 1 below the pictures. It starts as the Moon’s surface, so at first it
                matches the Moon’s bar above it, and its parts are written beneath it.
              </li>
            )}
            {stage >= 3 && (
              <li>
                <strong>The yellow bracket</strong> is the difference between the two bars: how much more slowed the longer bar is than the shorter one.
              </li>
            )}
          </ul>
          {stage >= 1 && (
            <p style={paragraph}>
              <strong>A worked moment.</strong> For the Earth’s gravity the fraction is GM ÷ (R × c²), where GM measures the Earth’s gravity, R is the Earth’s
              radius at the equator and c is the speed of light: {sciText(EARTH.gm, 3)} ÷ ({sciText(EARTH.equatorialRadius, 3)} × {sciText(cSquared, 3)}) ={' '}
              {sciText(earth.gravityOwn)}.
              {stage >= 2 && (
                <>
                  {' '}
                  For the Moon’s own gravity the same rule with the Moon’s numbers gives {sciText(MOON.gm, 3)} ÷ ({sciText(MOON.radius, 3)} × {sciText(cSquared, 3)}) ={' '}
                  {sciText(moon.gravityOwn)}.
                </>
              )}
              {stage >= 3 && (
                <>
                  {' '}
                  The difference is {sciText(earth.total)} − {sciText(moon.total)} = {sciText(difference)}.
                </>
              )}
            </p>
          )}
          {stage >= 1 && (
            <>
              <p style={{ marginTop: 0, marginBottom: '0.5rem' }}>
                <strong>What to look for.</strong>
              </p>
              <LookForList
                items={[
                  {
                    look: 'the top bar (the Earth’s clock) and its colours.',
                    means: `it is slowed by ${sciText(earth.total)}, and nearly all of that is the blue part, the Earth’s gravity; the Earth’s spin adds only ${sciText(earth.speed)}.`,
                    matters: 'a clock on the Earth’s surface sits very deep in the Earth’s gravity, and that is what slows it. Motion hardly matters on the Earth’s equator.',
                  },
                  ...(stage >= 2
                    ? [
                        {
                          look: 'the lower bar (the Moon’s clock), compared with the top bar.',
                          means: `it is slowed by ${sciText(moon.total)}, about ${(earth.total / moon.total).toFixed(0)} times less than the Earth’s clock, even though three influences are added together. The largest part is the Moon’s own gravity (${sciText(moon.gravityOwn)}), then the Earth’s pull at that distance (${sciText(moon.gravityOther)}), then the motion (${sciText(moon.speed)}).`,
                          matters: 'the Moon’s gravity at its surface is much shallower than the Earth’s, and that outweighs the extra influences. So the Moon’s clock is slowed much less.',
                        },
                      ]
                    : []),
                  ...(stage >= 3
                    ? [
                        {
                          look: 'the yellow bracket.',
                          means: `a clock that is slowed less ticks faster, compared with one that is slowed more. The Moon’s clock is slowed less than the Earth’s by ${sciText(difference)}, so it ticks faster than the Earth’s clock by that fraction. Over a day that is ${sciText(difference)} × ${SECONDS_PER_DAY.toLocaleString('en-US')} s = ${microsText(gainMoon, 2)}.`,
                          matters: 'this is the answer to the question of the experiment: not that the Moon’s clock is free of slowing, but that the Earth’s is slowed so much more.',
                        },
                      ]
                    : []),
                ]}
              />
            </>
          )}
        </div>

        {/* Picture 2: the Earth's equator and the Moon from stage 3, the other places from stage 4. */}
        {stage >= 3 && (
          <>
            <div style={{ marginBottom: '1rem' }}>
              <PictureTwo stage={stage} yours={done ? { gain: mine.gainMicrosecondsPerDay, name: yourName, gapLabel: `${mine.gapSeconds < 0 ? '−' : ''}${secondsText(Math.abs(mine.gapSeconds))} after ${durationName}` } : null} />
            </div>
            <div style={{ fontSize: '0.875rem', color: 'var(--text-muted)', marginBottom: '1.5rem' }}>
              <p style={paragraph}>
                <strong>How to read Picture 2.</strong> This picture shows how many microseconds a day each place’s clock gains on a clock on the Earth’s equator. A
                <strong> microsecond</strong> is a millionth of a second. Each row is one place. To the right of the black zero line a clock gains (ticks faster than the
                Earth’s equator clock), and to the left it loses (ticks slower).
              </p>
              <ul style={{ margin: '0 0 0.75rem', paddingLeft: '1.25rem' }}>
                <li>
                  <strong>The black vertical line at 0</strong> is the reference: a clock on the Earth’s equator, which neither gains nor loses against itself.
                </li>
                <li>
                  <strong>Each dot</strong> is the gain of a clock in one place, in microseconds a day, and its line runs back to the zero line. The number beside the dot
                  is the gain.
                </li>
                {stage >= 3 && (
                  <li>
                    <strong>The first two rows shown</strong> are the Earth’s equator (blue, at 0) and the Moon’s surface (grey).
                  </li>
                )}
                {done && (
                  <li>
                    <strong>The white ring on the last row</strong> is your own clock and your own time, from controls 1 and 2 below the pictures. Its label gives
                    the gain a day and the gap after the time that you chose.
                  </li>
                )}
                {stage >= 4 && (
                  <li>
                    <strong>The other rows</strong> use the same rule: a clock in a circular orbit round the Earth (the International Space Station at 400 km, a GPS
                    satellite at 20,200 km, a geostationary satellite) and a clock in a circular orbit 100 km above the Moon.
                  </li>
                )}
              </ul>
              <p style={paragraph}>
                <strong>A worked moment.</strong> The gain is the difference of two clocks’ slowing, times the seconds in a day. For the Moon’s surface: ({sciText(earth.total)}{' '}
                − {sciText(moon.total)}) × {SECONDS_PER_DAY.toLocaleString('en-US')} s = {microsText(gainMoon, 2)} a day.
                {stage >= 4 && (
                  <>
                    {' '}
                    For the International Space Station the speed and gravity terms of a circular orbit add to 1.5 × GM ÷ (r × c²) = {sciText(iss.total)}, so the gain is ({sciText(earth.total)} −{' '}
                    {sciText(iss.total)}) × {SECONDS_PER_DAY.toLocaleString('en-US')} s = {microsText(gainIss, 1)} a day.
                  </>
                )}
              </p>
              <p style={{ marginTop: 0, marginBottom: '0.5rem' }}>
                <strong>What to look for.</strong>
              </p>
              <LookForList
                items={[
                  {
                    look: 'the Moon’s dot, to the right of the zero line.',
                    means: `a clock on the Moon’s surface gains ${microsText(gainMoon, 2)} a day on a clock on the Earth’s equator.`,
                    matters: 'this is the size of the effect that lunar navigation and a lunar time scale have to deal with: tiny for a person, but large for clocks that work in billionths of a second.',
                  },
                  ...(stage >= 4
                    ? [
                        {
                          look: 'the other dots: the one to the left of zero, and the ones to the right.',
                          means: `the International Space Station’s clock loses ${Math.abs(gainIss).toFixed(1)} µs a day, a GPS clock gains ${gainGps.toFixed(1)}, a geostationary clock ${gainGeo.toFixed(1)}, and a clock in a 100 km orbit round the Moon ${gainLowMoon.toFixed(1)}.`,
                          matters: 'the answer is not always “faster”: a low orbit round the Earth is deep in gravity and fast-moving, so its clock loses; higher or in weaker gravity, the clock gains. Where a clock sits decides its rate.',
                        },
                      ]
                    : []),
                ]}
              />
            </div>
          </>
        )}

        {/* Picture 3: a clock orbiting the Moon, from stage 5. */}
        {stage >= 5 && (
          <>
            <div style={{ marginBottom: '1rem' }}>
              <PictureThree yourAltitudeM={done && place === 'moonOrbit' ? yourMoonAltKm * 1000 : null} />
            </div>
            <div style={{ fontSize: '0.875rem', color: 'var(--text-muted)', marginBottom: '1.5rem' }}>
              <p style={paragraph}>
                <strong>How to read Picture 3.</strong> This picture compares a clock in a circular orbit round the Moon with a clock sitting on the Moon’s surface, for
                orbits of different heights. The horizontal line is the height of the orbit above the Moon’s surface, from 20 kilometres to 10,000 kilometres, on a{' '}
                <strong>logarithmic</strong> scale (each step to the right multiplies the height). The vertical line is how many microseconds a day the orbiting clock
                gains on the clock on the surface.
              </p>
              <ul style={{ margin: '0 0 0.75rem', paddingLeft: '1.25rem' }}>
                <li>
                  <strong>The lavender curve</strong> is the gain of the orbiting clock at each height.
                </li>
                <li>
                  <strong>The yellow dashed horizontal line</strong> is zero: the orbiting clock ticks at the same rate as the clock on the surface. Above it the
                  orbiting clock is faster, and below it slower.
                </li>
                {done && (
                  <li>
                    <strong>The white ring on the curve</strong> (shown when your clock is in an orbit round the Moon) is your own orbit, from control 1 below the
                    pictures.
                  </li>
                )}
                <li>
                  <strong>The yellow dashed vertical line and dot</strong> mark the height where the curve crosses zero: {(cross / 1000).toFixed(0)} kilometres, half
                  a Moon radius. <strong>The lavender dot</strong> marks an orbit 100 kilometres up.
                </li>
              </ul>
              <p style={paragraph}>
                <strong>A worked moment.</strong> For an orbit at a distance r from the Moon’s centre, going higher helps a clock’s rate (weaker gravity) and the orbital
                speed hurts it. The two cancel when the gravity gain GM × (1 ÷ R − 1 ÷ r) ÷ c² equals the speed loss GM ÷ (2 × r × c²), which happens when r = 1.5 × R, that
                is 1.5 × {(MOON.radius / 1000).toLocaleString('en-US')} km = {((1.5 * MOON.radius) / 1000).toFixed(0)} km from the centre, or {(cross / 1000).toFixed(0)} km above the
                surface. At 100 km up the orbiting clock is {microsText(gainLowAgainstSurface, 2)} a day against the surface clock.
              </p>
              <p style={{ marginTop: 0, marginBottom: '0.5rem' }}>
                <strong>What to look for.</strong>
              </p>
              <LookForList
                items={[
                  {
                    look: 'where the curve crosses the yellow dashed zero line.',
                    means: `an orbit ${(cross / 1000).toFixed(0)} km above the Moon, half a Moon radius, gives a clock that ticks at the same rate as one on the surface.`,
                    matters: 'below that height the speed effect wins and the orbiting clock is slower; above it gravity’s gain wins and the clock is faster. It is the same balance as for GPS satellites round the Earth (Gravity Experiment 9), which cross at 1.5 Earth radii.',
                  },
                  {
                    look: 'the size of the numbers on the vertical line.',
                    means: `even at 10,000 km the orbiting clock gains only ${againstSurface(1e7).toFixed(1)} µs a day on the surface clock, and at 100 km it loses ${Math.abs(gainLowAgainstSurface).toFixed(1)}.`,
                    matters: 'the differences between a lunar orbit and the Moon’s surface are a few microseconds a day, much smaller than the 56 microseconds between the Moon and the Earth.',
                  },
                ]}
              />
            </div>
          </>
        )}

        {/* The controls (after the run): the specification's "Learner Controls". */}
        {done && (
          <div style={{ marginTop: '1.5rem', marginBottom: '1.5rem', padding: '1rem', border: '1px solid var(--border-color, #ccc)', borderRadius: '8px' }}>
            <p style={{ fontWeight: 'bold', marginTop: 0, marginBottom: '0.5rem' }}>Try your own clock</p>
            <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)', marginTop: 0, marginBottom: '1rem' }}>
              The controls below add a white mark to each picture and fill in Table 4. Every clock is compared with the clock on the Earth’s equator. The “Start over”
              button puts everything back.
            </p>

            <p style={{ fontWeight: 'bold', marginTop: 0, marginBottom: '0.25rem' }}>1. Where is the clock?</p>
            <div style={{ marginBottom: '0.5rem' }}>
              {PLACE_BUTTONS.map((b) => (
                <button
                  key={b.place}
                  type="button"
                  onClick={() => setPlace(b.place)}
                  className={`toggle-button${place === b.place ? ' is-selected' : ''}`}
                  style={{ marginRight: '0.5rem', marginBottom: '0.5rem', padding: '0.4rem 0.9rem', fontSize: '0.875rem' }}
                >
                  {b.label}
                </button>
              ))}
            </div>
            {place === 'earthOrbit' && (
              <label style={{ display: 'block', fontSize: '0.875rem', marginBottom: '0.5rem' }}>
                Height of the orbit above the Earth: <strong>{earthAltKm.toLocaleString('en-US')} km</strong> (the International Space Station is at about 400 km)
                <input
                  type="range"
                  min={200}
                  max={2000}
                  step={50}
                  value={earthAltKm}
                  onChange={(e) => setEarthAltKm(Number(e.target.value))}
                  style={{ display: 'block', width: '100%', maxWidth: '420px' }}
                />
              </label>
            )}
            {place === 'moonOrbit' && (
              <label style={{ display: 'block', fontSize: '0.875rem', marginBottom: '0.5rem' }}>
                Height of the orbit above the Moon: <strong>{yourMoonAltKm.toLocaleString('en-US')} km</strong> (20 km to 10,000 km; each step on the slider multiplies by about 1.05)
                <input
                  type="range"
                  min={1.3}
                  max={4}
                  step={0.02}
                  value={moonAltExp}
                  onChange={(e) => setMoonAltExp(Number(e.target.value))}
                  style={{ display: 'block', width: '100%', maxWidth: '420px' }}
                />
              </label>
            )}

            <p style={{ fontWeight: 'bold', marginTop: '0.75rem', marginBottom: '0.25rem' }}>2. For how long?</p>
            <div style={{ marginBottom: '0.5rem' }}>
              {DURATIONS.map((d) => (
                <button
                  key={d.name}
                  type="button"
                  onClick={() => setDurationName(d.name)}
                  className={`toggle-button${durationName === d.name ? ' is-selected' : ''}`}
                  style={{ marginRight: '0.5rem', padding: '0.4rem 0.9rem', fontSize: '0.875rem' }}
                >
                  {d.name}
                </button>
              ))}
            </div>
            <p style={{ fontSize: '0.875rem', marginTop: 0, marginBottom: 0 }}>
              A clock on <strong>{yourName}</strong> is slowed, compared with a clock far from everything, by <strong>{sciText(mine.terms.total)}</strong> ({
                yourMoonBased ? 'the Moon’s gravity' : 'the Earth’s gravity'
              }{' '}
              {sciText(mine.terms.gravityOwn)}
              {mine.terms.gravityOther > 0 ? `, the Earth’s pull at the Moon ${sciText(mine.terms.gravityOther)}` : ''}, motion {sciText(mine.terms.speed)}). The Earth’s equator clock is slowed by {sciText(earth.total)}. So
              this clock ticks{' '}
              {mine.direction === 'same' ? (
                <strong>at the same rate as</strong>
              ) : (
                <>
                  <strong>{mine.direction}</strong> than
                </>
              )}{' '}
              the Earth’s equator clock{mine.direction === 'same' ? '' : <>, by <strong>{microsText(Math.abs(mine.gainMicrosecondsPerDay), 2).replace(/^[+−]/, '')} a day</strong></>}. After{' '}
              <strong>{durationName}</strong> the gap is <strong>{secondsText(Math.abs(mine.gapSeconds))}</strong>.{' '}
              <span style={{ color: 'var(--text-muted)' }}>
                ({sciText(earth.total)} − {sciText(mine.terms.total)}) × {SECONDS_PER_DAY.toLocaleString('en-US')} s = {microsText(mine.gainMicrosecondsPerDay, 2)} a day. Picture 1 shows
                its parts as a white-outlined bar, Picture 2 shows its gain as a white ring on its last row
                {place === 'moonOrbit' ? ', and Picture 3 shows your orbit as a white ring on the curve' : ' (Picture 3 shows a mark only for an orbit round the Moon)'}.
              </span>
            </p>
          </div>
        )}

        {/* The results (after the run): the status label, three tables, and the link kept back until now (CLAUDE.md §12). The tables only report numbers;
            the explanation is the tutor's. */}
        {done && (
          <div style={{ marginTop: '1.5rem', marginBottom: '1.5rem' }}>
            <p style={{ fontWeight: 'bold', marginTop: 0, marginBottom: '0.5rem' }}>Results</p>
            <p style={{ fontSize: '0.875rem', marginTop: 0, marginBottom: '0.75rem' }}>
              <strong>
                Where this stands (as of October 2026): Strong evidence: relativity, which has been tested with clocks on the Earth, in orbit and across small heights,
                gives a clock on the Moon a gain of about {gainMoon.toFixed(0)} microseconds a day on a clock on the Earth. Open: as far as the sources read for this page say, no clock on the
                Moon has yet been compared with one on the Earth, and ACES, on the International Space Station, has not published a result.
              </strong>
            </p>
            <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)', marginTop: 0, marginBottom: '1rem' }}>
              These tables only report numbers, step by step. Table 1 is Picture 1. Table 2 is Picture 2, with the gap over a month and a year. Table 3 lists the published
              results and plans that this experiment uses, as the sources state them. Table 4 follows your own clock below. Your predictions are not marked here.
            </p>

            <p style={{ fontWeight: 'bold', marginTop: 0, marginBottom: '0.5rem' }}>Table 1: what slows each clock</p>
            <ResultsTable
              minWidth={700}
              head={['Quantity', 'Earth’s equator', 'Moon’s surface', 'How it is worked out']}
              rows={[
                [
                  'The body’s own gravity',
                  sciText(earth.gravityOwn),
                  sciText(moon.gravityOwn),
                  `GM ÷ (R × c²): Earth ${sciText(EARTH.gm, 3)} ÷ (${sciText(EARTH.equatorialRadius, 3)} × ${sciText(cSquared, 3)}); Moon ${sciText(MOON.gm, 3)} ÷ (${sciText(MOON.radius, 3)} × ${sciText(cSquared, 3)})`,
                ],
                [
                  'The other body’s gravity',
                  '0',
                  sciText(moon.gravityOther),
                  `the Earth’s pull at the Moon: ${sciText(EARTH.gm, 3)} ÷ (${sciText(MOON.meanDistance, 3)} × ${sciText(cSquared, 3)})`,
                ],
                [
                  'Motion',
                  sciText(earth.speed),
                  sciText(moon.speed),
                  `v² ÷ (2c²): the Earth’s spin carries the equator at ${spinSpeed.toFixed(1)} m/s; the Moon moves at ${MOON.orbitalSpeed} m/s round the Earth`,
                ],
                ['Total slowing', sciText(earth.total), sciText(moon.total), 'the three added'],
                ['Difference (Earth’s slowing − Moon’s slowing)', sciText(difference), '', `${sciText(earth.total)} − ${sciText(moon.total)}`],
                ['Gain of the Moon’s clock over one day', microsText(gainMoon, 2), '', `${sciText(difference)} × ${SECONDS_PER_DAY.toLocaleString('en-US')} s`],
              ]}
            />
            <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', margin: '0.5rem 0 1.5rem' }}>
              “Slowing” is the fraction by which a clock ticks slower than a clock far from everything. The Moon is at its average distance and speed.
            </p>

            <p style={{ fontWeight: 'bold', marginTop: 0, marginBottom: '0.5rem' }}>Table 2: how much each clock gains</p>
            <ResultsTable
              minWidth={640}
              head={['Place', 'Total slowing', 'Gain on the Earth’s equator', 'How it is worked out']}
              rows={[
                ...P2_PLACES.map((p) => {
                  const r = runLunarClocks(p.place, p.altitudeM, SECONDS_PER_DAY)
                  return [
                    p.name,
                    p.place === 'earthEquator' ? sciText(earth.total) : sciText(r.terms.total),
                    p.place === 'earthEquator' ? '0 (the reference)' : `${microsText(r.gainMicrosecondsPerDay, 2)} a day`,
                    p.place === 'earthEquator' ? 'the clock that the others are compared with' : `(${sciText(earth.total)} − ${sciText(r.terms.total)}) × ${SECONDS_PER_DAY.toLocaleString('en-US')} s`,
                  ]
                }),
                ['The Moon’s surface, after one day', '', secondsText(gapDay), `${sciText(difference)} × ${SECONDS_PER_DAY.toLocaleString('en-US')} s`],
                ['The Moon’s surface, after one month', '', secondsText(gapMonth), `${secondsText(gapDay)} × ${DAYS_PER_MONTH} days`],
                ['The Moon’s surface, after one year', '', secondsText(gapYear), `${secondsText(gapDay)} × ${DAYS_PER_YEAR} days`],
              ]}
            />
            <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', margin: '0.5rem 0 1.5rem' }}>
              A positive gain means the clock ticks faster than the Earth’s equator clock, and a negative one means slower. A month here is a twelfth of a year of 365.25
              days. Some sources quote 58.7 microseconds a day for the Moon. That compares two coordinate time scales, TCL and TT, and not two clocks (see “Coordinate time, TCL and TT” in “Words and formulas”). It is the
              {` ${gainMoon.toFixed(0)}`} microseconds a day of the clocks plus {moonOwnMicros.toFixed(1)} microseconds a day, which is the Moon’s own gravity (the lavender part of Picture 1, {sciText(moon.gravityOwn)} ×{' '}
              {SECONDS_PER_DAY.toLocaleString('en-US')} s). This matches the “Lunar Time” paper, which gives about 56 and about 2.7 microseconds a day.
            </p>

            <p style={{ fontWeight: 'bold', marginTop: 0, marginBottom: '0.5rem' }}>Table 3: the published results and plans</p>
            <ResultsTable
              minWidth={700}
              head={['Item', 'What the source says', 'Source']}
              rows={[
                [
                  'NIST, 2024: a clock on the Moon',
                  `“a clock near the Moon’s equator ticks faster than one near the Earth’s equator, accumulating an extra ${NIST_2024.gainMicrosecondsPerDay} microseconds per day”. The published version of the abstract compares a clock near the Moon’s selenoid (the Moon’s reference surface) with one near the Earth’s geoid (the Earth’s: the surface of mean sea level), and the number is the same. This experiment’s own arithmetic, for the Earth’s equator and the Moon’s mean surface, gives ${gainMoon.toFixed(2)}, which is ${nistAgreement.toFixed(2)} percent from it.`,
                  'Ashby and Patla, The Astronomical Journal (12 August 2024), abstract',
                ],
                [
                  'The “Lunar Time” paper, 2025',
                  'against unscaled Lunar Coordinate Time, a clock on the Moon’s surface differs by about 3.14 × 10⁻¹¹ (about 2.7 microseconds a day); against a scaled lunar time, by about 6.5 × 10⁻¹⁰ (56 microseconds a day). It says that “a universal difference between TCL and TT does not exist”.',
                  'Defraigne, Meynadier and Bourgoin, arXiv:2511.02709 (4 November 2025)',
                ],
                [
                  'The International Astronomical Union, 2024',
                  'Resolution II sets up a Lunar Celestial Reference System and Lunar Coordinate Time (TCL). Resolution III is on a coordinated lunar time standard by international agreement. (Only the titles of the resolutions were read.)',
                  'IAU, XXXII General Assembly, Cape Town (August 2024)',
                ],
                [
                  'The 28th CGPM, 13 to 15 October 2026',
                  'Resolution 6 supports an international lunar reference time scale based on TCL, says that TCL without scaling would meet the scientific requirements, asks space agencies, the CIPM (the committee that prepares the CGPM’s work), the BIPM and national laboratories to work together, and gives no rate difference and no date.',
                  'BIPM, Resolution 6 of the 28th CGPM',
                ],
                [
                  'The United States, 2024',
                  'the White House’s Office of Science and Technology Policy asked NASA to deliver, with other departments, a strategy for a Coordinated Lunar Time “no later than December 31, 2026”. The release gives no rate.',
                  'White House OSTP release, 2 April 2024',
                ],
                [
                  'ACES, on the International Space Station',
                  'installed on ESA’s Columbus laboratory in April 2025; a six-month commissioning, then a two-year science phase of ten planned 25-day sessions, with no start date given; “after validation by the ACES science team, results will be shared”. No results were available on ESA’s page.',
                  'ESA, “ACES finds its home in orbit” (the page is undated)',
                ],
                [
                  'Artemis II',
                  'launched on 1 April 2026, flew round the Moon on 6 and 7 April (closest approach 4,070 miles above the surface) and splashed down on 10 April 2026. This page does not report any clock result from it.',
                  'NASA, Artemis II page and flight-day-6 blog',
                ],
                [
                  'The Moon’s numbers used here',
                  `mean radius ${(MOON.radius / 1000).toLocaleString('en-US')} km, GM ${sciText(MOON.gm, 4)} m³/s², mean orbital speed ${(MOON.orbitalSpeed / 1000).toFixed(3)} km/s, mean distance from the Earth ${(MOON.meanDistance / 1000).toLocaleString('en-US')} km (the semimajor axis).`,
                  'NASA, Moon fact sheet',
                ],
              ]}
            />
            <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', margin: '0.5rem 0 1.5rem' }}>
              The numbers are quoted as the sources state them. This experiment does not model the small changes in the rate during a month, does not define a lunar time
              scale, and does not claim that a clock on the Moon has been measured.
            </p>

            <p style={{ fontWeight: 'bold', marginTop: '1.5rem', marginBottom: '0.5rem' }}>Table 4: your own clock</p>
            <ResultsTable
              minWidth={560}
              head={['Quantity', 'Value', 'How it is worked out']}
              rows={[
                ['Place', yourName, 'your choice (control 1)'],
                ...(place === 'earthOrbit' || place === 'moonOrbit' ? [['Height of the orbit', `${(yourAltitudeM / 1000).toLocaleString('en-US')} km`, 'your choice']] : []),
                [yourMoonBased ? 'The Moon’s gravity' : 'The Earth’s gravity', sciText(mine.terms.gravityOwn), 'GM ÷ (distance × c²), or 1.5 × GM ÷ (r × c²) for a circular orbit with its motion'],
                ['The Earth’s pull at the Moon', sciText(mine.terms.gravityOther), 'only for a clock on or near the Moon'],
                ['Motion', sciText(mine.terms.speed), 'v² ÷ (2c²), or inside the orbit figure above'],
                ['Total slowing', sciText(mine.terms.total), 'the parts added'],
                ['Gain on the Earth’s equator, per day', `${microsText(mine.gainMicrosecondsPerDay, 2)} a day`, `(${sciText(earth.total)} − ${sciText(mine.terms.total)}) × ${SECONDS_PER_DAY.toLocaleString('en-US')} s`],
                ['Time', `${durationName}`, 'your choice (control 2)'],
                ['Gap after that time', `${mine.gapSeconds < 0 ? '−' : ''}${secondsText(Math.abs(mine.gapSeconds))}`, `${microsText(mine.gainMicrosecondsPerDay, 2)} a day × the days`],
              ]}
            />
            <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', margin: '0.5rem 0 1.5rem' }}>
              For an orbit, the gravity and the motion are combined in the orbit’s terms as in the formulas above; a positive gain means that the clock ticks faster than
              the Earth’s equator clock and a negative one that it ticks slower.
            </p>

            <p style={{ marginTop: 0, marginBottom: '0.5rem' }}>
              <strong>Want to know more?</strong> The scientific papers behind these numbers are listed here now, because their summaries state what the predictions asked.
              They are written for scientists. Links open in a new tab.
            </p>
            <ul style={{ margin: '0.25rem 0 0', paddingLeft: '1.25rem' }}>
              {PAPER_LINKS.map((paper) => (
                <li key={paper.href}>
                  <ExternalLink href={paper.href}>{paper.label}</ExternalLink>: {paper.what}
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* The tutor: observe, compare with the predictions, one conceptual question, then the explanation. The chapter summary below the experiment
            (in App) is shown only once the learner reaches the explanation. */}
        {done && directionPrediction !== null && sizePrediction !== null && (
          <LunarClocksTutor directionPrediction={directionPrediction} sizePrediction={sizePrediction} onExplained={() => onTutorComplete?.()} />
        )}
      </div>
    </div>
  )
}
