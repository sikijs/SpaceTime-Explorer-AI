import { useEffect, useState } from 'react'
import type { ReactNode } from 'react'
import {
  ASTRONOMICAL_UNIT,
  closestApproachDistance,
  closestApproachTerms,
  earthMatchDistance,
  earthTerms,
  farOrbitDistance,
  gapSeconds,
  lagMillisecondsPerDay,
  lagOverOneOrbitSeconds,
  orbitAverageTerms,
  orbitSpeed,
  PARKER,
  runFastestSpacecraft,
  SECONDS_PER_DAY,
  speedAt,
  SPEED_OF_LIGHT,
  SUN,
} from '../physics/fastestSpacecraft'
import type { Effects, TimeScale } from '../physics/fastestSpacecraft'
import { FastestSpacecraftTutor } from './FastestSpacecraftTutor'
import { ReferencePanel } from './EnergyMomentumExperiment'
import { LookForList, ResultsTable } from './WideBinariesExperiment'
import type { LookFor } from './WideBinariesExperiment'

// Frontier and Beyond, Experiment 11 (docs/experiments/frontier-and-beyond/11-the-fastest-spacecraft.md).
// Step 7 builds the tutor (FastestSpacecraftTutor.tsx) and, in App, the chapter summary.
// Step 6 builds the controls (the point on the orbit, and the time), shown after the run, which add a white mark to each picture and a Table 4.
// Step 5 builds the results (the status label, three tables, the formulas in the "Words and formulas" panel and the link kept back until after the run).
// Step 4 builds the five-stage run: Picture 1 fills in at stages 1 to 3, Picture 2 at stage 4 and Picture 3 at stage 5, each with a guide.
// Step 3 builds the two predictions (their answer buttons, Run gated on both, and Start over); Run only records them, because the run is Step 4.
// Step 2 builds the page's skeleton: the status line, the introduction with its new-word list and its "Want to know more?" links, a drawing of the probe's orbit
// (to scale, apart from the Sun's size) with its guide, and the collapsed "Words and formulas" panel. The two predictions, the run, the results and the tutor are
// later steps. All wording is draft for the owner's line-by-line approval (CLAUDE.md §28.1), written to the standard of §29. The introduction does not say how
// big the lag is, or give the sizes of the two terms (that is what the predictions will ask, §12). The interface only displays numbers from src/physics
// (CLAUDE.md §9); the only calculation here is where a point is drawn.

const VIEW_WIDTH = 560
const TEXT_COLOR = '#e2e8f0'
const MUTED_COLOR = '#94a3b8'
const SUN_COLOR = '#fbbf24' // amber: the Sun
const YOURS_COLOR = '#ffffff' // white: the learner's own choice
const EARTH_COLOR = '#38bdf8' // sky blue: the Earth and its orbit
const VENUS_COLOR = '#fdba74' // peach: Venus's orbit
const PROBE_COLOR = '#4ade80' // green: the probe and its orbit
const CLOCK_COLOR = '#fde047' // yellow: a clock
const FAR_COLOR = '#c084fc' // purple: the clock far from everything
const GRAVITY_COLOR = '#a5b4fc' // lavender: gravity's part
const MOTION_COLOR = '#4ade80' // green: motion's part

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

// ---- The probe's orbit (drawn to scale, except that the Sun is drawn larger than it is) ----
const VENUS_DISTANCE_AU = 0.72 // Venus's mean distance from the Sun, about 0.72 AU (a standard value, to be source-checked)
const PX_PER_AU = 190
const SUN_X = 250
const SUN_Y = 262

function OrbitDrawing() {
  const height = 520
  const near = (closestApproachDistance() / ASTRONOMICAL_UNIT) * PX_PER_AU // the closest point, in pixels from the Sun (about 10)
  const far = (farOrbitDistance() / ASTRONOMICAL_UNIT) * PX_PER_AU // the far end, in pixels from the Sun (about 160)
  // The ellipse has the Sun at one focus: the closest point is on the right, the far end on the left.
  const semiMajor = (near + far) / 2
  const focusToCentre = (far - near) / 2
  const semiMinor = Math.sqrt(semiMajor * semiMajor - focusToCentre * focusToCentre)
  const centreX = SUN_X - focusToCentre
  return (
    <svg
      width={VIEW_WIDTH}
      height={height}
      viewBox={`0 0 ${VIEW_WIDTH} ${height}`}
      style={svgStyle}
      role="img"
      aria-label="The Sun at the centre, with three circles round it: the Earth's orbit, Venus's orbit, and a long thin oval, the orbit of Parker Solar Probe. The oval reaches very close to the Sun on the right, where the probe's closest point is marked, and out to about Venus's distance on the left. A small clock far from everything is in the top corner"
    >
      <text x={20} y={22} fill={TEXT_COLOR} fontSize="13" fontWeight="bold">
        Illustration: the orbit of Parker Solar Probe, seen from above (to scale)
      </text>

      {/* The Earth's orbit and Venus's orbit. */}
      <circle cx={SUN_X} cy={SUN_Y} r={PX_PER_AU} fill="none" stroke={EARTH_COLOR} strokeWidth={1.2} strokeDasharray="4 4" />
      <circle cx={SUN_X} cy={SUN_Y} r={VENUS_DISTANCE_AU * PX_PER_AU} fill="none" stroke={VENUS_COLOR} strokeWidth={1.2} strokeDasharray="4 4" />
      <circle cx={SUN_X + PX_PER_AU} cy={SUN_Y} r={5} fill={EARTH_COLOR} stroke={TEXT_COLOR} strokeWidth={1} />
      <SvgLines x={SUN_X + PX_PER_AU + 10} y={SUN_Y - 6} lines={['Earth', '(1 AU from', 'the Sun)']} fill={EARTH_COLOR} bold />
      <SvgLines x={SUN_X} y={SUN_Y - VENUS_DISTANCE_AU * PX_PER_AU - 6} lines={['Venus’s orbit (about 0.72 AU)']} fill={VENUS_COLOR} bold anchor="middle" />
      <SvgLines x={SUN_X} y={SUN_Y - PX_PER_AU - 6} lines={['Earth’s orbit (1 AU)']} fill={EARTH_COLOR} bold anchor="middle" />

      {/* The probe's orbit: a long, thin oval with the Sun at one focus. */}
      <ellipse cx={centreX} cy={SUN_Y} rx={semiMajor} ry={semiMinor} fill="none" stroke={PROBE_COLOR} strokeWidth={2.5} />
      <SvgLines x={centreX} y={SUN_Y - semiMinor - 10} lines={['the probe’s orbit (the green oval)']} fill={PROBE_COLOR} bold anchor="middle" />

      {/* The Sun, drawn larger than it really is. */}
      <circle cx={SUN_X} cy={SUN_Y} r={6} fill={SUN_COLOR} />
      <SvgLines x={SUN_X + 14} y={SUN_Y + 26} lines={['Sun (drawn much', 'larger than it is)']} fill={SUN_COLOR} bold />

      {/* The closest point and the far end of the probe's orbit. */}
      <circle cx={SUN_X + near} cy={SUN_Y} r={4} fill={CLOCK_COLOR} stroke={TEXT_COLOR} strokeWidth={1} />
      <SvgLines x={SUN_X + 34} y={SUN_Y - 100} lines={['closest point (the yellow dot):', '6.2 million km above the Sun’s surface,', 'moving at about 192 km/s']} fill={CLOCK_COLOR} bold />
      <line x1={SUN_X + near + 3} y1={SUN_Y - 4} x2={SUN_X + 38} y2={SUN_Y - 68} stroke={CLOCK_COLOR} strokeWidth={1} strokeDasharray="2 3" />
      <circle cx={SUN_X - far} cy={SUN_Y} r={4} fill={PROBE_COLOR} stroke={TEXT_COLOR} strokeWidth={1} />
      <SvgLines x={SUN_X - far - 10} y={SUN_Y + 44} lines={['far end of the orbit', '(about 0.73 AU)']} fill={PROBE_COLOR} bold anchor="start" />

      {/* A clock far from everything. */}
      <circle cx={510} cy={62} r={9} fill="none" stroke={FAR_COLOR} strokeWidth={2} />
      <line x1={510} y1={62} x2={510} y2={56} stroke={FAR_COLOR} strokeWidth={1.5} />
      <line x1={510} y1={62} x2={515} y2={64} stroke={FAR_COLOR} strokeWidth={1.5} />
      <SvgLines x={496} y={48} lines={['a clock far from', 'everything (the', 'reference)']} fill={FAR_COLOR} bold anchor="end" />

      <SvgLines
        x={20}
        y={height - 40}
        lines={['Distances are to scale: 1 AU is the distance from the Earth to the Sun,', 'about 150 million km. Only the Sun is drawn larger than it really is.', 'The probe goes round the oval in about 88 days; the real orbit is not exactly this oval.']}
        fill={MUTED_COLOR}
      />
    </svg>
  )
}


// ---- Number formats (every value comes from the physics module) ----
const SUPERSCRIPT: Record<string, string> = { '-': '⁻', '0': '⁰', '1': '¹', '2': '²', '3': '³', '4': '⁴', '5': '⁵', '6': '⁶', '7': '⁷', '8': '⁸', '9': '⁹' }
const tenTo = (exponent: number) => `10${String(exponent).split('').map((c) => SUPERSCRIPT[c]).join('')}`
function sciText(value: number, digits = 2): string {
  const [mantissa, exponent] = value.toExponential(digits).split('e')
  return `${mantissa} × ${tenTo(Number(exponent))}`
}
const msText = (value: number, digits = 1) => `${value > 0 ? '+' : value < 0 ? '−' : ''}${Math.abs(value).toFixed(digits)} ms`
const auText = (distanceM: number, digits = 3) => (distanceM / ASTRONOMICAL_UNIT).toFixed(digits)

// ---- The run: five named stages. The timer only paces the display; no number depends on it (CLAUDE.md §11). ----
const STAGE_MS = 2600
const LAST_STAGE = 5
const STAGE_NAMES = ['', 'A clock on the Earth', 'A clock on the probe', 'The difference', 'Along the orbit', 'A whole orbit']

// ---- Picture 1: what changes each clock's rate? Stage 1: the Earth's bar; stage 2: the probe's bar; stage 3: the difference ----
const P1_LEFT = 190
const P1_RIGHT = 520
const MAX_LOWERING = 4.5e-7 // the right-hand end of the axis
const loweringToX = (v: number) => P1_LEFT + (v / MAX_LOWERING) * (P1_RIGHT - P1_LEFT)

function StackedBar({ y, parts }: { y: number; parts: { value: number; color: string }[] }) {
  let start = 0
  return (
    <>
      {parts.map((part, i) => {
        const x = loweringToX(start)
        const width = loweringToX(start + part.value) - x
        start += part.value
        return <rect key={i} x={x} y={y} width={Math.max(width, 0)} height={30} fill={part.color} stroke="#0b1020" strokeWidth={0.5} />
      })}
    </>
  )
}

type DurationName = '1 day' | '1 orbit (88 days)' | '1 year'
const DURATIONS: { name: DurationName; seconds: number }[] = [
  { name: '1 day', seconds: SECONDS_PER_DAY },
  { name: '1 orbit (88 days)', seconds: PARKER.periodDays * SECONDS_PER_DAY },
  { name: '1 year', seconds: 365.25 * SECONDS_PER_DAY },
]
const secondsText = (value: number) => (Math.abs(value) < 1 ? `${(value * 1000).toFixed(2)} milliseconds` : `${value.toFixed(2)} seconds`)

type Yours = { distanceM: number; terms: { gravity: number; speed: number; total: number }; lag: number; speedKmS: number } | null

function PictureOne({ stage, yours }: { stage: number; yours: Yours }) {
  const yoursLabel = yours ? `. A third bar outlined in white shows the learner's chosen point on the orbit, ${(yours.distanceM / ASTRONOMICAL_UNIT).toFixed(2)} AU from the Sun, with its own gravity and motion parts` : ''
  const shift = yours ? 90 : 0 // the room for the learner's own bar
  const height = 350 + shift
  const earth = earthTerms()
  const probe = closestApproachTerms()
  const earthY = 82
  const probeY = 172
  const ticks = [0, 1e-7, 2e-7, 3e-7, 4e-7]
  return (
    <svg
      width={VIEW_WIDTH}
      height={height}
      viewBox={`0 0 ${VIEW_WIDTH} ${height}`}
      style={svgStyle}
      role="img"
      aria-label={`Picture 1: two horizontal bars. Each bar shows by what fraction a clock ticks slower than a clock far from everything, split into a gravity part and a motion part. The first bar is for a clock on the Earth and is very short. The second bar is for the probe at its closest point to the Sun and is much longer, with its gravity and motion parts nearly equal. A yellow bracket marks the difference between the two bars${yoursLabel}`}
    >
      <text x={20} y={22} fill={TEXT_COLOR} fontSize="13" fontWeight="bold">
        Picture 1: what changes each clock’s rate?
      </text>
      <SvgLines x={20} y={40} lines={['How much slower each clock ticks than a clock far from everything (the purple line, at zero)']} fill={MUTED_COLOR} />

      {/* The axis. */}
      <line x1={P1_LEFT} y1={52} x2={P1_LEFT} y2={264 + shift} stroke={FAR_COLOR} strokeWidth={2} />
      {ticks.map((t) => (
        <g key={t}>
          <line x1={loweringToX(t)} y1={260 + shift} x2={loweringToX(t)} y2={266 + shift} stroke={MUTED_COLOR} />
          <text x={loweringToX(t)} y={280 + shift} fill={MUTED_COLOR} fontSize="10" textAnchor="middle">
            {t === 0 ? '0' : sciText(t, 0)}
          </text>
        </g>
      ))}
      <line x1={P1_LEFT} y1={262 + shift} x2={P1_RIGHT} y2={262 + shift} stroke={MUTED_COLOR} />
      <text x={(P1_LEFT + P1_RIGHT) / 2} y={298 + shift} fill={MUTED_COLOR} fontSize="10" textAnchor="middle">
        fraction by which the clock ticks slower (longer bar = slower clock)
      </text>
      <SvgLines x={P1_LEFT - 4} y={62} lines={['far from everything']} fill={FAR_COLOR} bold anchor="end" size={9} />

      {/* Stage 1: the Earth's clock. */}
      {stage >= 1 && (
        <g>
          <SvgLines x={P1_LEFT - 12} y={earthY + 12} lines={['clock on the', 'Earth’s equator']} fill={EARTH_COLOR} bold anchor="end" />
          <StackedBar
            y={earthY}
            parts={[
              { value: earth.gravity, color: GRAVITY_COLOR },
              { value: earth.speed, color: MOTION_COLOR },
            ]}
          />
          <SvgLines
            x={loweringToX(earth.total) + 8}
            y={earthY + 12}
            lines={[`total ${sciText(earth.total)}`, `gravity ${sciText(earth.gravity)}`, `motion ${sciText(earth.speed)}`]}
            fill={TEXT_COLOR}
            size={10}
          />
        </g>
      )}

      {/* Stage 2: the probe's clock at its closest point. */}
      {stage >= 2 && (
        <g>
          <SvgLines x={P1_LEFT - 12} y={probeY + 12} lines={['probe at its', 'closest point']} fill={PROBE_COLOR} bold anchor="end" />
          <StackedBar
            y={probeY}
            parts={[
              { value: probe.gravity, color: GRAVITY_COLOR },
              { value: probe.speed, color: MOTION_COLOR },
            ]}
          />
          <SvgLines x={loweringToX(probe.gravity / 2)} y={probeY + 19} lines={['gravity']} fill="#0b1020" bold anchor="middle" />
          <SvgLines x={loweringToX(probe.gravity + probe.speed / 2)} y={probeY + 19} lines={['motion']} fill="#0b1020" bold anchor="middle" />
          <SvgLines
            x={loweringToX(probe.gravity / 2)}
            y={probeY + 48}
            lines={[`gravity ${sciText(probe.gravity)}`, `motion ${sciText(probe.speed)}`, `total ${sciText(probe.total)}`]}
            fill={TEXT_COLOR}
            size={10}
            anchor="start"
          />
        </g>
      )}

      {/* Stage 3: the difference, as a yellow bracket from the end of the Earth's bar to the end of the probe's bar. */}
      {stage >= 3 && (
        <g>
          <line x1={loweringToX(earth.total)} y1={142} x2={loweringToX(probe.total)} y2={142} stroke={CLOCK_COLOR} strokeWidth={2.5} />
          <line x1={loweringToX(earth.total)} y1={136} x2={loweringToX(earth.total)} y2={148} stroke={CLOCK_COLOR} strokeWidth={2.5} />
          <line x1={loweringToX(probe.total)} y1={136} x2={loweringToX(probe.total)} y2={148} stroke={CLOCK_COLOR} strokeWidth={2.5} />
          <SvgLines x={(loweringToX(earth.total) + loweringToX(probe.total)) / 2} y={130} lines={[`difference ${sciText(probe.total - earth.total)}`]} fill={CLOCK_COLOR} bold anchor="middle" />
        </g>
      )}

      {/* The learner's own point on the orbit: a third bar, outlined in white. */}
      {yours && (
        <g>
          <SvgLines x={P1_LEFT - 12} y={262} lines={['your point on', 'the orbit']} fill={YOURS_COLOR} bold anchor="end" />
          <StackedBar
            y={252}
            parts={[
              { value: yours.terms.gravity, color: GRAVITY_COLOR },
              { value: yours.terms.speed, color: MOTION_COLOR },
            ]}
          />
          <rect x={P1_LEFT} y={252} width={Math.max(loweringToX(yours.terms.total) - P1_LEFT, 1)} height={30} fill="none" stroke={YOURS_COLOR} strokeWidth={2} />
          <SvgLines
            x={loweringToX(yours.terms.total) + 8 > P1_RIGHT - 120 ? P1_LEFT + 6 : loweringToX(yours.terms.total) + 8}
            y={yours.terms.total > 1.2e-7 ? 304 : 262}
            lines={[`${(yours.distanceM / ASTRONOMICAL_UNIT).toFixed(2)} AU from the Sun`, `gravity ${sciText(yours.terms.gravity)}`, `motion ${sciText(yours.terms.speed)}`, `total ${sciText(yours.terms.total)}`]}
            fill={TEXT_COLOR}
            size={10}
          />
        </g>
      )}

      {/* The legend. */}
      <rect x={20} y={312 + shift} width={12} height={12} fill={GRAVITY_COLOR} />
      <text x={38} y={322 + shift} fill={TEXT_COLOR} fontSize="10">
        gravity’s part (the Sun’s, and for the Earth’s clock its own too)
      </text>
      <rect x={20} y={330 + shift} width={12} height={12} fill={MOTION_COLOR} />
      <text x={38} y={340 + shift} fill={TEXT_COLOR} fontSize="10">
        motion’s part
      </text>
    </svg>
  )
}

// ---- Picture 2: the lag at five points on the probe's orbit (drawn to scale) ----
const P2_PX_PER_AU = 520
const P2_LEFT = 60
const P2_SUN_Y = 262
const P2_POINTS_AU = [0.1, 0.2, 0.4] // between the closest point and the far end

function PictureTwo({ stage, yours }: { stage: number; yours: Yours }) {
  const height = 470
  const near = closestApproachDistance()
  const far = farOrbitDistance()
  const nearAu = near / ASTRONOMICAL_UNIT
  const farAu = far / ASTRONOMICAL_UNIT
  const semiMajorAu = (nearAu + farAu) / 2
  const e = (farAu - nearAu) / (farAu + nearAu)
  const p = semiMajorAu * (1 - e * e)
  const sunX = P2_LEFT + farAu * P2_PX_PER_AU
  const centreX = sunX - ((farAu - nearAu) / 2) * P2_PX_PER_AU
  const semiMinorAu = semiMajorAu * Math.sqrt(1 - e * e)
  // A point on the upper half of the oval at a distance from the Sun, by r = p / (1 + e cos(angle)).
  function pointAt(distanceAu: number) {
    const cosAngle = Math.max(-1, Math.min(1, (p / distanceAu - 1) / e))
    const sinAngle = Math.sqrt(1 - cosAngle * cosAngle)
    return { x: sunX + distanceAu * cosAngle * P2_PX_PER_AU, y: P2_SUN_Y - distanceAu * sinAngle * P2_PX_PER_AU }
  }
  const points = [farAu, ...P2_POINTS_AU.slice().reverse(), nearAu].map((au, i, all) => {
    const distanceM = i === 0 ? far : i === all.length - 1 ? near : au * ASTRONOMICAL_UNIT
    const result = runFastestSpacecraft(distanceM, SECONDS_PER_DAY)
    return { au, distanceM, result, ...pointAt(au) }
  })
  const labelXs = [64, 174, 284, 394, 498]
  return (
    <svg
      width={VIEW_WIDTH}
      height={height}
      viewBox={`0 0 ${VIEW_WIDTH} ${height}`}
      style={svgStyle}
      role="img"
      aria-label={`Picture 2: the probe's oval orbit round the Sun, drawn to scale, with five marked points from the far end on the left to the closest point on the right. Each point has a label giving its distance from the Sun, the probe's speed there, and by how many milliseconds a day the probe's clock differs from a clock on the Earth. The difference is large at the closest point and shrinks to a small negative number at the far end${yours ? `. A white ring marks the learner's chosen point, ${(yours.distanceM / ASTRONOMICAL_UNIT).toFixed(2)} AU from the Sun` : ''}`}
    >
      <text x={20} y={22} fill={TEXT_COLOR} fontSize="13" fontWeight="bold">
        Picture 2: how the probe’s clock differs from the Earth’s round its orbit
      </text>
      <SvgLines x={20} y={40} lines={['The probe’s orbit, to scale, with its speed and the clock difference at five points']} fill={MUTED_COLOR} />
      <ellipse cx={centreX} cy={P2_SUN_Y} rx={semiMajorAu * P2_PX_PER_AU} ry={semiMinorAu * P2_PX_PER_AU} fill="none" stroke={PROBE_COLOR} strokeWidth={2.5} />
      <circle cx={sunX} cy={P2_SUN_Y} r={6} fill={SUN_COLOR} />
      <SvgLines x={sunX + 4} y={P2_SUN_Y + 30} lines={['Sun (drawn much', 'larger than it is)']} fill={SUN_COLOR} bold anchor="middle" />
      <SvgLines x={centreX} y={P2_SUN_Y + semiMinorAu * P2_PX_PER_AU + 26} lines={['the probe’s orbit (to scale)']} fill={PROBE_COLOR} bold anchor="middle" />

      {stage >= 4 &&
        points.map((pt, i) => {
          const lag = pt.result.lagMillisecondsPerDay
          const speed = speedAt(pt.distanceM)
          const isClosest = i === points.length - 1
          return (
            <g key={i}>
              <line x1={pt.x} y1={pt.y} x2={labelXs[i]} y2={112} stroke={CLOCK_COLOR} strokeWidth={0.8} strokeDasharray="2 3" />
              <circle cx={pt.x} cy={pt.y} r={5} fill={CLOCK_COLOR} stroke={TEXT_COLOR} strokeWidth={1} />
              <SvgLines
                x={labelXs[i]}
                y={64}
                lines={[isClosest ? 'closest point' : i === 0 ? 'far end' : `point ${i}`, `${pt.au.toFixed(2)} AU`, `${(speed / 1000).toFixed(0)} km/s`, lag >= 0 ? 'behind by' : 'ahead by', `${Math.abs(lag).toFixed(1)} ms a day`]}
                fill={CLOCK_COLOR}
                bold
                size={9}
                anchor="middle"
              />
            </g>
          )
        })}
      {yours && (
        <g>
          <circle cx={pointAt(yours.distanceM / ASTRONOMICAL_UNIT).x} cy={pointAt(yours.distanceM / ASTRONOMICAL_UNIT).y} r={9} fill="none" stroke={YOURS_COLOR} strokeWidth={2.5} />
          <SvgLines
            x={centreX - 40}
            y={P2_SUN_Y - 8}
            lines={['your point (the white ring):', `${(yours.distanceM / ASTRONOMICAL_UNIT).toFixed(2)} AU from the Sun, ${yours.speedKmS.toFixed(0)} km/s`, `${yours.lag >= 0 ? 'behind' : 'ahead'} by ${Math.abs(yours.lag).toFixed(2)} ms a day`]}
            fill={YOURS_COLOR}
            bold
            size={10}
            anchor="middle"
          />
        </g>
      )}
      <SvgLines
        x={20}
        y={height - 46}
        lines={['“Behind” and “ahead” compare the probe’s clock with a clock on the Earth:', 'behind means it ticks slower. The numbers come from the experiment’s model: NASA’s', 'speed at the closest point and a plain oval of the right period for the rest.']}
        fill={MUTED_COLOR}
      />
    </svg>
  )
}

// ---- Picture 3: the lag against the distance from the Sun, and over a whole orbit ----
const P3_LEFT = 80
const P3_RIGHT = 520
const P3_TOP = 66
const P3_BOTTOM = 246
const MIN_LAG = -4
const MAX_LAG = 38
const lagToY = (v: number) => P3_BOTTOM - ((v - MIN_LAG) / (MAX_LAG - MIN_LAG)) * (P3_BOTTOM - P3_TOP)
const MIN_AU_LOG = Math.log10(0.04)
const MAX_AU_LOG = Math.log10(0.8)
const auToX = (au: number) => P3_LEFT + ((Math.log10(au) - MIN_AU_LOG) / (MAX_AU_LOG - MIN_AU_LOG)) * (P3_RIGHT - P3_LEFT)

function PictureThree({ yours }: { yours: Yours }) {
  const height = 450
  const near = closestApproachDistance()
  const far = farOrbitDistance()
  const earth = earthTerms()
  const curve: string[] = []
  const samples = 80
  for (let i = 0; i <= samples; i += 1) {
    const distanceM = near * Math.pow(far / near, i / samples)
    const result = runFastestSpacecraft(i === 0 ? near : i === samples ? far : distanceM, SECONDS_PER_DAY)
    curve.push(`${i === 0 ? 'M' : 'L'} ${auToX(distanceM / ASTRONOMICAL_UNIT).toFixed(1)} ${lagToY(result.lagMillisecondsPerDay).toFixed(1)}`)
  }
  const match = earthMatchDistance()
  const closestLag = lagMillisecondsPerDay(earth, closestApproachTerms())
  const farLag = lagMillisecondsPerDay(earth, runFastestSpacecraft(far, 1).terms)
  const atClosest = gapSeconds(earth, closestApproachTerms(), PARKER.periodDays * SECONDS_PER_DAY)
  const actual = lagOverOneOrbitSeconds()
  const BAR_LEFT = 230
  const BAR_RIGHT = 520
  const barX = (v: number) => BAR_LEFT + (v / 3.5) * (BAR_RIGHT - BAR_LEFT)
  const yTicks = [0, 10, 20, 30]
  const xTicks = [0.05, 0.1, 0.2, 0.5]
  return (
    <svg
      width={VIEW_WIDTH}
      height={height}
      viewBox={`0 0 ${VIEW_WIDTH} ${height}`}
      style={svgStyle}
      role="img"
      aria-label={`Picture 3. Top: a curve of how many milliseconds a day the probe's clock is behind a clock on the Earth, against the probe's distance from the Sun on a logarithmic scale. The curve starts high at the closest point and falls steadily, crossing zero near 0.70 AU and ending slightly below zero at the far end. Bottom: two bars comparing the lag that builds up over one whole 88-day orbit if the closest-point rate lasted all the time, which is long, with the lag that really builds up, which is much shorter${yours ? `. A white ring on the curve marks the learner's chosen point, ${(yours.distanceM / ASTRONOMICAL_UNIT).toFixed(2)} AU from the Sun` : ''}`}
    >
      <text x={20} y={22} fill={TEXT_COLOR} fontSize="13" fontWeight="bold">
        Picture 3: the lag against the distance, and over a whole orbit
      </text>
      <SvgLines x={20} y={40} lines={['Top: how far the probe’s clock is behind the Earth’s each day. Bottom: how far behind it falls over one orbit']} fill={MUTED_COLOR} />
      <line x1={P3_LEFT} y1={P3_TOP} x2={P3_LEFT} y2={P3_BOTTOM} stroke={MUTED_COLOR} />
      <line x1={P3_LEFT} y1={lagToY(0)} x2={P3_RIGHT} y2={lagToY(0)} stroke={EARTH_COLOR} strokeWidth={1} strokeDasharray="4 3" />
      {yTicks.map((t) => (
        <g key={t}>
          <line x1={P3_LEFT - 4} y1={lagToY(t)} x2={P3_LEFT} y2={lagToY(t)} stroke={MUTED_COLOR} />
          <text x={P3_LEFT - 8} y={lagToY(t) + 3} fill={MUTED_COLOR} fontSize="10" textAnchor="end">
            {t}
          </text>
        </g>
      ))}
      <text x={20} y={P3_TOP - 8} fill={MUTED_COLOR} fontSize="10">
        ms a day behind
      </text>
      {xTicks.map((t) => (
        <g key={t}>
          <line x1={auToX(t)} y1={P3_BOTTOM} x2={auToX(t)} y2={P3_BOTTOM + 4} stroke={MUTED_COLOR} />
          <text x={auToX(t)} y={P3_BOTTOM + 16} fill={MUTED_COLOR} fontSize="10" textAnchor="middle">
            {t} AU
          </text>
        </g>
      ))}
      <text x={(P3_LEFT + P3_RIGHT) / 2} y={P3_BOTTOM + 32} fill={MUTED_COLOR} fontSize="10" textAnchor="middle">
        the probe’s distance from the Sun (a log scale: each step to the right is a multiple, not an addition)
      </text>
      <path d={curve.join(' ')} fill="none" stroke={PROBE_COLOR} strokeWidth={2.5} />
      <circle cx={auToX(near / ASTRONOMICAL_UNIT)} cy={lagToY(closestLag)} r={5} fill={CLOCK_COLOR} stroke={TEXT_COLOR} />
      <SvgLines x={auToX(near / ASTRONOMICAL_UNIT) + 10} y={lagToY(closestLag) + 4} lines={[`closest point: ${closestLag.toFixed(1)} ms a day`]} fill={CLOCK_COLOR} bold size={10} />
      <circle cx={auToX(match / ASTRONOMICAL_UNIT)} cy={lagToY(0)} r={5} fill={EARTH_COLOR} stroke={TEXT_COLOR} />
      <line x1={auToX(match / ASTRONOMICAL_UNIT)} y1={lagToY(0) - 6} x2={P3_RIGHT - 60} y2={150} stroke={EARTH_COLOR} strokeWidth={0.8} strokeDasharray="2 3" />
      <SvgLines x={P3_RIGHT} y={136} lines={['dashed line: the same rate as', `the Earth’s clock (reached at ${auText(match, 2)} AU)`]} fill={EARTH_COLOR} bold size={10} anchor="end" />
      <circle cx={auToX(far / ASTRONOMICAL_UNIT)} cy={lagToY(farLag)} r={5} fill={PROBE_COLOR} stroke={TEXT_COLOR} />
      <line x1={auToX(far / ASTRONOMICAL_UNIT)} y1={lagToY(farLag) - 6} x2={P3_RIGHT - 20} y2={196} stroke={PROBE_COLOR} strokeWidth={0.8} strokeDasharray="2 3" />
      <SvgLines x={P3_RIGHT} y={172} lines={[`far end: ${msText(farLag)} a day`, '(below zero: the probe’s clock', 'is slightly ahead of the Earth’s)']} fill={PROBE_COLOR} bold size={10} anchor="end" />

      {yours && (
        <g>
          <circle cx={auToX(yours.distanceM / ASTRONOMICAL_UNIT)} cy={lagToY(yours.lag)} r={8} fill="none" stroke={YOURS_COLOR} strokeWidth={2.5} />
          <line x1={auToX(yours.distanceM / ASTRONOMICAL_UNIT) + 6} y1={lagToY(yours.lag) - 6} x2={P3_RIGHT - 70} y2={106} stroke={YOURS_COLOR} strokeWidth={0.8} strokeDasharray="2 3" />
          <SvgLines x={P3_RIGHT} y={92} lines={[`your point: ${(yours.distanceM / ASTRONOMICAL_UNIT).toFixed(2)} AU,`, `${yours.lag >= 0 ? 'behind' : 'ahead'} by ${Math.abs(yours.lag).toFixed(2)} ms a day`]} fill={YOURS_COLOR} bold size={10} anchor="end" />
        </g>
      )}

      {/* Stage 5: the lag over one whole orbit. */}
      <line x1={20} y1={308} x2={540} y2={308} stroke={MUTED_COLOR} strokeWidth={0.5} />
      <SvgLines x={20} y={326} lines={[`The lag after one whole orbit of ${PARKER.periodDays} days, against the Earth’s clock (seconds)`]} fill={TEXT_COLOR} bold size={11} />
      <SvgLines x={BAR_LEFT - 10} y={358} lines={['if the closest-point', 'rate lasted all orbit']} fill={CLOCK_COLOR} bold size={10} anchor="end" />
      <rect x={BAR_LEFT} y={346} width={barX(atClosest) - BAR_LEFT} height={26} fill={CLOCK_COLOR} />
      <SvgLines x={barX(atClosest) - 6} y={364} lines={[`${atClosest.toFixed(2)} s`]} fill="#0b1020" bold size={11} anchor="end" />
      <SvgLines x={BAR_LEFT - 10} y={408} lines={['the real orbit', '(its rate changes)']} fill={PROBE_COLOR} bold size={10} anchor="end" />
      <rect x={BAR_LEFT} y={396} width={barX(actual) - BAR_LEFT} height={26} fill={PROBE_COLOR} />
      <SvgLines x={barX(actual) + 8} y={414} lines={[`${actual.toFixed(3)} s`]} fill={PROBE_COLOR} bold size={11} />
    </svg>
  )
}


const lookForDrawing: LookFor[] = [
  {
    look: 'the yellow dot, the probe’s closest point to the Sun, right beside the Sun on the right.',
    means: 'here the probe is 6.2 million kilometres above the Sun’s surface, deep in the Sun’s gravity, and it is moving at about 192 kilometres a second, about 430,000 miles an hour. On this drawing it looks almost touching the Sun, because the Sun’s own size is drawn larger than the truth.',
    matters: 'gravity and motion are the two things that change how a clock ticks (Gravity Experiments 2 and 9). The probe’s closest point is a place with a great deal of both, so it is a hard test of the rule you learned for the Moon.',
  },
  {
    look: 'the far end of the green oval, on the left, about as far from the Sun as Venus’s orbit.',
    means: 'the probe goes round once in about 88 days, and it swings out to about 0.73 AU before it falls back toward the Sun. Its distance from the Sun, and so its gravity and its speed, are changing all the time.',
    matters: 'a clock’s rate depends on where it is and how fast it moves, so the probe’s clock does not keep one steady rate round its orbit. The experiment asks about the closest point first, and you will see later how the rest of the orbit compares.',
  },
  {
    look: 'the blue dashed circle with the blue dot, the Earth and its orbit.',
    means: 'the Earth is 1 AU, about 150 million kilometres, from the Sun, moving round it at about 29.8 kilometres a second. The Earth is also in the Sun’s gravity and moving, but far less than the probe at its closest point.',
    matters: 'a clock on the Earth is the clock that mission engineers and learners compare the probe’s clock with. To compare two clocks you must know what acts on each, and the Earth’s clock has influences of its own.',
  },
]

const REFERENCE_ENTRIES: { term: string; meaning: string }[] = [
  { term: 'Clock rate', meaning: 'how fast a clock ticks, compared with another clock. Two perfect clocks can tick at different rates when they are in different places or moving differently, and nothing is wrong with either.' },
  { term: 'Gravity’s effect on a clock', meaning: 'a clock in a stronger gravity ticks more slowly than one in a weaker gravity. In Gravity Experiment 2 you saw that a clock higher up, where gravity is weaker, ticks a little faster.' },
  { term: 'Motion’s effect on a clock', meaning: 'a moving clock ticks more slowly than a clock that stays still, as you saw in Relativity of Time and Motion Experiments 3 and 4. The faster it moves, the slower it ticks.' },
  { term: 'Gravitational potential', meaning: 'a way of saying how deep a clock sits in the gravity of a body. The nearer to a heavy body, the deeper it sits. A clock far from everything sits at the top, and the deeper a clock sits, the more slowly it ticks.' },
  { term: 'Far from everything (the reference clock)', meaning: 'an imagined clock very far from every body and at rest. Gravity and motion do not slow it, so it is a fixed yardstick: every real clock is slower than it, and the experiment asks by how much.' },
  { term: 'Orbit and closest approach', meaning: 'an orbit is the path of an object going round a body under its gravity. Most orbits are ovals (ellipses) and not circles, so the object is sometimes nearer to the body and sometimes farther. The point of an orbit nearest the body is called the closest approach. Near it the object is deepest in gravity and moves fastest.' },
  { term: 'Astronomical unit (AU)', meaning: `the average distance from the Earth to the Sun: about ${(ASTRONOMICAL_UNIT / 1e9).toFixed(0)} million kilometres. It is a handy ruler for distances in the solar system: Venus is about 0.72 AU from the Sun.` },
  { term: 'Speed compared with light', meaning: `light travels at ${SPEED_OF_LIGHT.toLocaleString('en-US')} metres a second. The probe’s speed of about ${(PARKER.closestApproachSpeed / 1000).toFixed(0)} kilometres a second is about ${((PARKER.closestApproachSpeed / SPEED_OF_LIGHT) * 100).toFixed(3)} percent of that: very fast for a spacecraft, and still a tiny fraction of the speed of light.` },
  { term: 'Fractional rate difference', meaning: 'by what fraction one clock ticks faster or slower than another, written as a power of ten (Experiment 9 of this group): 10⁻⁶ is one part in a million, 10⁻¹⁰ one part in ten thousand million.' },
  { term: 'Microsecond, millisecond and second', meaning: 'a millionth, a thousandth and one whole second, written µs, ms and s. A day has 86,400 seconds.' },
  { term: 'km/s', meaning: 'kilometres a second, a unit of speed. A speed of 1 km/s covers 1,000 metres every second, about 3,600 kilometres an hour.' },
]

// The two prediction questions' answers (the specification's "Prediction Activity"). The labels do not say which answer is right.
const EFFECTS_CHOICES: ReadonlyArray<{ value: Effects; label: string }> = [
  { value: 'both slow', label: 'Both slow the clock' },
  { value: 'both speed up', label: 'Both speed the clock up' },
  { value: 'work against each other', label: 'They work against each other' },
]
const SIZE_CHOICES: ReadonlyArray<{ value: TimeScale; label: string }> = [
  { value: 'microsecond', label: 'About 35 microseconds (millionths of a second)' },
  { value: 'millisecond', label: 'About 35 milliseconds (thousandths of a second)' },
  { value: 'second', label: 'About 35 seconds' },
]

interface FastestSpacecraftExperimentProps {
  onComplete?: () => void
  onTutorComplete?: () => void
}

export function FastestSpacecraftExperiment({ onComplete, onTutorComplete }: FastestSpacecraftExperimentProps) {
  const [effectsPrediction, setEffectsPrediction] = useState<Effects | null>(null)
  const [sizePrediction, setSizePrediction] = useState<TimeScale | null>(null)
  const [status, setStatus] = useState<'idle' | 'running' | 'complete'>('idle')
  const [stage, setStage] = useState(0)
  // The controls that appear after the run: the point on the orbit (0 is the closest point, 100 the far end, on a log scale) and the time.
  const [orbitPosition, setOrbitPosition] = useState(0)
  const [durationName, setDurationName] = useState<DurationName>('1 day')
  const hasRun = status !== 'idle'
  const bothPredicted = effectsPrediction !== null && sizePrediction !== null

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
    setEffectsPrediction(null)
    setSizePrediction(null)
    setStatus('idle')
    setStage(0)
    setOrbitPosition(0)
    setDurationName('1 day')
  }
  function run() {
    setStage(1)
    setStatus('running')
  }

  // Every number below comes from the physics module (CLAUDE.md §9).
  const earth = earthTerms()
  const probe = closestApproachTerms()
  const difference = probe.total - earth.total
  const lagDay = lagMillisecondsPerDay(earth, probe)
  const farResult = runFastestSpacecraft(farOrbitDistance(), SECONDS_PER_DAY)
  const matchAu = earthMatchDistance() / ASTRONOMICAL_UNIT
  const average = orbitAverageTerms()
  const atClosestOrbit = gapSeconds(earth, probe, PARKER.periodDays * SECONDS_PER_DAY)
  const actualOrbit = lagOverOneOrbitSeconds()
  const c2 = SPEED_OF_LIGHT * SPEED_OF_LIGHT
  const done = status === 'complete'
  // The learner's point: a position on a log scale between the closest point and the far end (the ends are exact, so that the closest point uses NASA's speed).
  const yourDistanceM = orbitPosition <= 0 ? closestApproachDistance() : orbitPosition >= 100 ? farOrbitDistance() : closestApproachDistance() * Math.pow(farOrbitDistance() / closestApproachDistance(), orbitPosition / 100)
  const yourAu = (yourDistanceM / ASTRONOMICAL_UNIT).toFixed(orbitPosition === 0 ? 3 : 2)
  const yourDuration = DURATIONS.find((d) => d.name === durationName) as { name: DurationName; seconds: number }
  const mine = runFastestSpacecraft(yourDistanceM, yourDuration.seconds)
  const yourSpeedKmS = speedAt(yourDistanceM) / 1000
  const yoursFor: Yours = { distanceM: yourDistanceM, terms: mine.terms, lag: mine.lagMillisecondsPerDay, speedKmS: yourSpeedKmS }
  const nearM = closestApproachDistance()
  const farM = farOrbitDistance()
  const orbitRows = [farM, 0.4 * ASTRONOMICAL_UNIT, 0.2 * ASTRONOMICAL_UNIT, 0.1 * ASTRONOMICAL_UNIT, nearM].map((distanceM) => {
    const result = runFastestSpacecraft(distanceM, SECONDS_PER_DAY)
    const lag = result.lagMillisecondsPerDay
    return [
      `${auText(distanceM, distanceM === nearM ? 3 : 2)} AU${distanceM === nearM ? ' (closest point)' : distanceM === farM ? ' (far end)' : ''}`,
      `${(speedAt(distanceM) / 1000).toFixed(1)} km/s`,
      sciText(result.terms.total),
      `${lag >= 0 ? 'behind' : 'ahead'} by ${Math.abs(lag).toFixed(2)} ms a day`,
    ]
  })
  const solarRadii = nearM / SUN.radius
  const ovalNearSpeedKmS = orbitSpeed(nearM) / 1000
  const formulaEntries: { term: string; meaning: string }[] = [
    {
      term: 'How much a clock is slowed (formula)',
      meaning: `slowing = Φ ÷ c² + v² ÷ (2 × c²), where Φ is GM ÷ distance for the body whose gravity the clock sits in (here the Sun, for the probe), v is the clock’s speed, and c = ${SPEED_OF_LIGHT.toLocaleString('en-US')} m/s. Both parts lower a clock’s rate, compared with a clock far from everything.`,
    },
    {
      term: 'The probe at its closest point (formula)',
      meaning: `gravity GM ÷ (r × c²) = ${sciText(SUN.gm, 3)} ÷ (${sciText(nearM, 3)} × ${sciText(c2, 3)}) = ${sciText(probe.gravity)}; motion v² ÷ (2 × c²) with v = ${PARKER.closestApproachSpeed.toLocaleString('en-US')} m/s = ${sciText(probe.speed)}; total ${sciText(probe.total)}. Here r is the distance from the Sun’s centre: ${(PARKER.closestApproachAltitude / 1e9).toFixed(3)} × 10⁶ km above the surface plus the Sun’s radius, ${(SUN.radius / 1e6).toFixed(0)} × 10³ km.`,
    },
    {
      term: 'The Earth’s clock in this experiment (formula)',
      meaning: `gravity: the Earth’s own GM ÷ (R × c²) plus the Sun’s gravity at the Earth’s distance GM_Sun ÷ (1 AU × c²); motion: the Earth’s speed round the Sun, ${(29780).toLocaleString('en-US')} m/s, and its spin. Total ${sciText(earth.total)}: gravity ${sciText(earth.gravity)}, motion ${sciText(earth.speed)}.`,
    },
    {
      term: 'The lag of one clock behind another (formula)',
      meaning: `lag = (the first clock’s slowing − the second clock’s slowing) × the time. Example, the probe’s clock behind the Earth’s for one day at the closest point: (${sciText(probe.total)} − ${sciText(earth.total)}) × ${SECONDS_PER_DAY.toLocaleString('en-US')} s = ${(lagDay / 1000).toFixed(4)} s = ${lagDay.toFixed(1)} ms. A negative lag means the first clock ticks faster.`,
    },
    {
      term: 'A speed on an oval orbit (formula)',
      meaning: `on an oval orbit round a body, the speed at a distance r is v = √(GM × (2 ÷ r − 1 ÷ a)), where a is half the oval’s longest width. For the probe, a = ${((nearM + farM) / 2 / ASTRONOMICAL_UNIT).toFixed(3)} AU, which gives ${ovalNearSpeedKmS.toFixed(1)} km/s at the closest point (NASA’s measured 192.22 km/s differs by 0.8 percent, because the real orbit is not exactly this oval).`,
    },
    {
      term: 'The average over a whole orbit (formula)',
      meaning: `over a whole oval orbit the clock’s average gravity part is GM ÷ (a × c²) and its average motion part GM ÷ (2 × a × c²), so the two average 1.5 × GM ÷ (a × c²) = ${sciText(average.total)}. Against the Earth’s ${sciText(earth.total)}, the difference ${sciText(average.total - earth.total)} times ${PARKER.periodDays} × ${SECONDS_PER_DAY.toLocaleString('en-US')} s = ${actualOrbit.toFixed(3)} s.`,
    },
    {
      term: 'Solar radii',
      meaning: `a solar radius is the Sun’s radius, ${(SUN.radius / 1000).toLocaleString('en-US')} km, used as a ruler near the Sun. The probe’s closest point is ${solarRadii.toFixed(2)} solar radii from the Sun’s centre.`,
    },
  ]
  const lookForPictureOne: LookFor[] = [
    {
      look: 'the two bars: the short one for the Earth’s clock and the long one for the probe’s clock.',
      means: `the Earth’s clock is slower than the far-away clock by ${sciText(earth.total)}, and the probe’s clock at its closest point by ${sciText(probe.total)}, about ${(probe.total / earth.total).toFixed(0)} times as much.`,
      matters: 'no real clock matches the far-away clock, and these two differ from it by very different amounts. The question is how much the two differ from each other, which is the yellow bracket you will see in stage 3.',
    },
    {
      look: 'the two colours inside the probe’s bar, lavender for gravity and green for motion.',
      means: `gravity’s part is ${sciText(probe.gravity)} and motion’s part is ${sciText(probe.speed)}, so each makes up about half of the bar. The Earth’s bar is made of the same two colours but is mostly gravity, ${sciText(earth.gravity)} against ${sciText(earth.speed)}.`,
      matters: 'at the probe’s closest point both gravity and motion change its clock’s rate by a large amount, and by similar amounts. Neither one can be left out when you work out how its clock ticks.',
    },
    {
      look: 'the yellow bracket from the end of the Earth’s bar to the end of the probe’s bar.',
      means: `the two clocks differ by ${sciText(difference)}. In one day (${SECONDS_PER_DAY.toLocaleString('en-US')} seconds) that is ${sciText(difference)} × ${SECONDS_PER_DAY.toLocaleString('en-US')} s = ${(difference * SECONDS_PER_DAY * 1000).toFixed(1)} milliseconds.`,
      matters: 'this is the number that Prediction 2 asked for: how far apart the two clocks would be after a day at the probe’s closest point.',
    },
  ]
  const lookForPictureTwo: LookFor[] = [
    {
      look: 'the label at the closest point (the yellow dot nearest the Sun) and the label at the far end (the dot on the far left).',
      means: `at the closest point the probe’s clock is ${lagDay.toFixed(1)} milliseconds a day behind the Earth’s clock; at the far end it is ${Math.abs(farResult.lagMillisecondsPerDay).toFixed(1)} milliseconds a day ${farResult.lagMillisecondsPerDay < 0 ? 'ahead of' : 'behind'} it.`,
      matters: 'the probe’s clock does not keep one steady rate. Its difference from the Earth’s clock depends on where the probe is on its orbit, so the closest-approach number is the largest, not the typical one.',
    },
    {
      look: 'the speed in each label, and how it changes from the far end to the closest point.',
      means: 'the probe moves slowly at the far end and faster and faster as it falls toward the Sun, reaching its top speed at the closest point.',
      matters: 'speed is one of the two things that change a clock’s rate, and here it changes by a large factor round the orbit, as the probe’s distance from the Sun, and so the Sun’s gravity on it, does too.',
    },
  ]
  const lookForPictureThree: LookFor[] = [
    {
      look: 'the green curve, from the high yellow dot at the closest point down to the dot at the far end.',
      means: `the lag falls steadily as the probe moves out, from ${lagDay.toFixed(1)} milliseconds a day to about zero, then a little below it.`,
      matters: 'most of the probe’s lag is earned in a short stretch near the Sun. Farther out, the probe’s clock is much closer to the Earth’s.',
    },
    {
      look: `the blue dot where the curve crosses the dashed zero line, at ${matchAu.toFixed(2)} AU.`,
      means: `at that distance the probe’s clock ticks at the same rate as the Earth’s clock. Closer in, it ticks slower; farther out, up to the far end, it ticks very slightly faster (${Math.abs(farResult.lagMillisecondsPerDay).toFixed(2)} milliseconds a day at the far end).`,
      matters: 'being nearer the Sun does not always mean a slower clock than the Earth’s: the Earth has its own speed and its own place in the Sun’s gravity, and the probe’s clock matches it at one point of its orbit.',
    },
    {
      look: 'the two bars at the bottom.',
      means: `if the closest-point rate lasted a whole 88-day orbit, the lag would be ${atClosestOrbit.toFixed(2)} seconds; the lag that really builds up is ${actualOrbit.toFixed(3)} seconds, about ${(atClosestOrbit / actualOrbit).toFixed(0)} times smaller.`,
      matters: 'the probe spends only a short time near the Sun, so a statement that “the probe’s clock loses 35 milliseconds a day” is true only at one moment of an orbit, not over the whole of it.',
    },
  ]
  const closestKm = PARKER.closestApproachAltitude / 1000
  const speedKmS = PARKER.closestApproachSpeed / 1000
  return (
    <div>
      <h2>Experiment 11 — The Fastest Spacecraft: How Much Does Its Clock Lag?</h2>
      <div className="exp-card" style={{ marginTop: '2rem', padding: '1.5rem' }}>
        <p style={{ marginTop: 0, marginBottom: '1.5rem', fontSize: '0.875rem' }}>
          <strong>
            Where this stands (as of October 2026): NASA’s Parker Solar Probe is still flying close to the Sun. Its most recent record-matching close approach was on 4
            September 2026, and its mission has been extended into 2029. What relativity says about its clock, and whether anyone has measured it, is shown after you
            press Run, so that you can guess first.
          </strong>
        </p>

        <div style={{ marginBottom: '1.5rem' }}>
          <p style={paragraph}>
            <strong>The question.</strong> A spacecraft flies closer to the Sun, and faster, than any other. Does its clock tick at the same rate as a clock on the
            Earth? In Experiment 10 you saw that a clock on the Moon ticks at a different rate from a clock on the Earth, because gravity and motion both change a
            clock’s rate. Near the Sun the probe sits in much stronger gravity than the Earth’s, and it moves much faster. How much does that change the rate of its
            clock?
          </p>

          <p style={paragraph}>
            <strong>Where we left off.</strong> In Gravity Experiment 2 you saw that a clock in stronger gravity ticks more slowly. In Gravity Experiment 9 and in
            Experiment 10 of this group you saw that gravity and motion both change a clock’s rate, and that the two can work in the same direction or in different
            directions, depending on the place. In Relativity of Time and Motion Experiments 3 and 4 you saw that moving clocks tick more slowly, and in Experiment 9 of
            this group you saw how tiny differences are written as powers of ten.
          </p>

          <p style={paragraph}>
            <strong>Why this spacecraft, and why now.</strong> <strong>Parker Solar Probe</strong> is a NASA mission that flies close to the Sun to study it. On 24
            December 2024 it passed {closestKm.toLocaleString('en-US', { maximumFractionDigits: 0 })} kilometres above the Sun’s surface (about 3.8 million miles), moving at about{' '}
            {speedKmS.toFixed(0)} kilometres a second (about 430,000 miles an hour). Those are the closest approach to the Sun, and the highest speed, of any spacecraft
            so far. NASA reports that it has matched both records on every close approach since, most recently on 4 September 2026, its 29th close approach, and the
            mission has been extended into 2029. It goes round the Sun about every 88 days.
          </p>

          <div style={{ marginBottom: '0.75rem' }}>
            <OrbitDrawing />
          </div>
          <div style={{ fontSize: '0.875rem', color: 'var(--text-muted)', marginBottom: '0.75rem' }}>
            <p style={paragraph}>
              <strong>How to read this drawing.</strong> You are looking down on the solar system from above. Distances are drawn to scale, except that the Sun is drawn
              larger than it really is, or it would be a dot too small to see.
            </p>
            <ul style={{ margin: '0 0 0.75rem', paddingLeft: '1.25rem' }}>
              <li>
                <strong>The amber dot</strong> in the middle is the Sun.
              </li>
              <li>
                <strong>The blue dashed circle</strong> is the Earth’s orbit, and <strong>the blue dot</strong> on it is the Earth. Its distance from the Sun, about 150
                million kilometres, is called 1 AU (an astronomical unit; see the “Words and formulas” box).
              </li>
              <li>
                <strong>The peach dashed circle</strong> is Venus’s orbit, about 0.72 AU from the Sun.
              </li>
              <li>
                <strong>The long green oval</strong> is the probe’s orbit. The Sun is not in the middle of the oval but off to one side, near the right-hand end.{' '}
                <strong>The yellow dot</strong> at that end is the probe’s closest point, and <strong>the green dot</strong> at the left-hand end is the far end of its
                orbit.
              </li>
              <li>
                <strong>The small purple clock</strong> in the corner is the clock far from everything, used as a yardstick, as in Experiment 10.
              </li>
            </ul>
            <p style={paragraph}>
              <strong>A worked moment.</strong> At the closest point the probe is {closestKm.toLocaleString('en-US', { maximumFractionDigits: 0 })} km above the Sun’s surface. The
              Sun’s radius is {(SUN.radius / 1000).toLocaleString('en-US')} km, so the probe is about {((closestKm + SUN.radius / 1000) / 1e6).toFixed(1)} million km from the
              Sun’s centre, which is {((closestApproachDistance() / ASTRONOMICAL_UNIT)).toFixed(3)} AU. That is about {(1 / (closestApproachDistance() / ASTRONOMICAL_UNIT)).toFixed(0)}{' '}
              times closer than the Earth.
            </p>
            <p style={{ marginTop: 0, marginBottom: '0.5rem' }}>
              <strong>What to look for.</strong>
            </p>
            <LookForList items={lookForDrawing} />
          </div>

          <p style={paragraph}>
            <strong>What can change a clock’s rate here.</strong> As in Experiment 10, a clock is compared with a clock <strong>far from everything</strong> (not in
            anyone’s gravity, and not moving). Gravity changes a clock’s rate, and the deeper the clock sits in gravity, the more. Motion changes a clock’s rate, and
            the faster it moves, the more. Every real clock differs from the far-away clock by a tiny fraction, and that fraction is the sum of a gravity part and a
            motion part. The probe’s clock has the Sun’s gravity and its own speed to count, and the clock on the Earth has the Earth’s gravity and spin and, as the Earth
            is also in the Sun’s gravity and goes round the Sun, those too. The sizes of these, and which of the two clocks differs from the other and by how much, are what
            the predictions ask, so the numbers are shown after the run.
          </p>

          <p style={paragraph}>
            <strong>Tiny numbers and times.</strong> The differences are written as powers of ten, as in Experiments 9 and 10: 10⁻⁶ is one part in a million. A day has
            86,400 seconds. A <strong>microsecond</strong> is a millionth of a second, a <strong>millisecond</strong> a thousandth and a <strong>second</strong> is one
            whole second.
          </p>

          <p style={paragraph}>
            <strong>Where the question stands (October 2026).</strong> The speed and the distance are NASA’s. What relativity says about the probe’s clock is a
            calculation, with the same formula that has been tested with clocks on the Earth and in orbit, and the status label, shown after the run, says how it stands.
          </p>

          <div style={{ marginBottom: '0.75rem' }}>
            <p style={{ marginTop: 0, marginBottom: '0.5rem' }}>
              <strong>Some new words.</strong> The “Words and formulas” box below has each one, with the ones from earlier experiments.
            </p>
            <ul style={{ margin: 0, paddingLeft: '1.25rem' }}>
              <li>
                <strong>Orbit</strong> and <strong>closest approach</strong>: the path round the Sun, and the point on it nearest the Sun.
              </li>
              <li>
                <strong>Astronomical unit (AU)</strong>: the Earth’s distance from the Sun, used as a ruler.
              </li>
              <li>
                <strong>Speed compared with light</strong>: how fast the probe goes against the speed of light.
              </li>
            </ul>
          </div>

          <p style={paragraph}>
            <strong>What you will do.</strong> You will make two predictions, press Run to watch the pictures build up one stage at a time, and then look at other points
            on the probe’s orbit. Nothing here is graded.
          </p>

          <p style={paragraph}>
            <strong>What we assume.</strong> This experiment is a simple model. It treats the Sun as a perfect sphere, uses NASA’s distance and speed for the closest
            point, and draws the rest of the orbit as a plain oval of the right period, so it does not show the real path (which the planets’ pulls and the probe’s
            passes by Venus change a little). It does not say how the probe’s own clock is kept or corrected, and it does not claim that the probe’s clock has been
            compared with a clock on the Earth.
          </p>

          <p style={{ marginTop: 0, marginBottom: '0.75rem' }}>
            <strong>Want to know more?</strong> Plainer-language pages are listed here. Links open in a new tab. This page was written as of October 2026.
          </p>
          <ul style={{ margin: '0.25rem 0 0', paddingLeft: '1.25rem' }}>
            <li>
              <ExternalLink href="https://science.nasa.gov/blogs/parker-solar-probe/2026/09/10/after-latest-swing-past-sun-nasas-parker-solar-probe-checks-in/">
                NASA: after its latest swing past the Sun, Parker Solar Probe checks in
              </ExternalLink>
              : NASA’s account of the close approach of 4 September 2026 (the 29th) and of the mission’s extension into 2029.
            </li>
            <li>
              <ExternalLink href="https://science.nasa.gov/blogs/parker-solar-probe/2025/12/18/nasas-parker-solar-probe-completes-26th-closest-approach-to-sun/">
                NASA: Parker Solar Probe completes its 26th closest approach to the Sun
              </ExternalLink>
              : NASA’s account of the probe matching its record speed and distance.
            </li>
            <li>
              <ExternalLink href="https://www.nasa.gov/reference/parker-solar-probe">NASA: Parker Solar Probe</ExternalLink>: the mission in NASA’s words, with its purpose and
              its launch in 2018.
            </li>
            <li>
              <ExternalLink href="https://science.nasa.gov/sun/">NASA: The Sun</ExternalLink>: a plain account of the star the probe is flying to.
            </li>
            <li>
              <ExternalLink href="https://svs.gsfc.nasa.gov/5534">NASA: Parker Solar Probe, the extended mission</ExternalLink>: an animation of the probe’s orbit as NASA
              projects it through 2029, to compare with the drawing above.
            </li>
            <li>
              <ExternalLink href="https://www.nist.gov/news-events/news/2024/08/what-time-it-moon">NIST: What time is it on the Moon?</ExternalLink>: the national
              measurement laboratory of the United States explains in plain words why clocks in different places tick at different rates, because of gravity and the
              motion of the Earth and the Moon (the same effects you used in Experiment 10).
            </li>
          </ul>
        </div>

        <ReferencePanel entries={done ? [...REFERENCE_ENTRIES, ...formulaEntries] : REFERENCE_ENTRIES} />

        {/* The two predictions: draft wording for the owner's review (CLAUDE.md §28.1), from the specification's "Prediction Activity". Neither says
            which answer is right, or gives the sizes of the terms. */}
        {(
          [
            {
              title: 'Prediction 1: gravity and speed',
              text: (
                <>
                  At its closest point to the Sun, the probe is deep in the Sun’s gravity and moving very fast. Compared with a clock far from everything, what do
                  these two effects do to the probe’s clock? Do they <strong>both slow</strong> it, <strong>both speed it up</strong>, or{' '}
                  <strong>work against each other</strong> (one speeds it up and the other slows it down)?
                </>
              ),
              choices: EFFECTS_CHOICES,
              value: effectsPrediction,
              set: (v: Effects) => setEffectsPrediction(v),
            },
            {
              title: 'Prediction 2: how much in one day?',
              text: (
                <>
                  Imagine the probe stayed at its closest point for <strong>one whole day</strong>, and a clock on the Earth kept time for the same day. How far apart
                  would the two clocks be at the end of the day?
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
              `Picture 1 now shows a clock on the Earth’s equator. Compared with a clock far from everything it is slowed by ${sciText(earth.total)}: gravity’s part (lavender) is ${sciText(earth.gravity)} and motion’s part (green) is ${sciText(earth.speed)}.`}
            {stage === 2 &&
              `The probe’s clock at its closest point is added. Gravity’s part is ${sciText(probe.gravity)} and motion’s part is ${sciText(probe.speed)}; the total is ${sciText(probe.total)}.`}
            {stage === 3 &&
              `The two bars differ by ${sciText(difference)}. Over one day (${SECONDS_PER_DAY.toLocaleString('en-US')} seconds) that is ${lagDay.toFixed(1)} milliseconds.`}
            {stage === 4 &&
              'Picture 2 appears below Picture 1. It shows five points on the probe’s orbit, with the probe’s speed and the clock difference at each. The probe is not always at its closest point.'}
            {stage === 5 &&
              'Picture 3 appears below Picture 2. It shows the difference against the probe’s distance from the Sun, and what builds up over one whole orbit.'}
          </p>
        )}

        {/* Picture 1: the Earth's bar from stage 1, the probe's bar from stage 2, the difference from stage 3. */}
        {status !== 'idle' && (
          <div style={{ marginTop: '1.5rem', marginBottom: '1rem' }}>
            <PictureOne stage={stage} yours={done ? yoursFor : null} />
          </div>
        )}
        {status !== 'idle' && (
          <div style={{ fontSize: '0.875rem', color: 'var(--text-muted)', marginBottom: '1.5rem' }}>
            <p style={paragraph}>
              <strong>How to read Picture 1.</strong> Each horizontal bar is one clock. The purple line at the left, at zero, stands for the clock far from everything,
              which is not slowed at all. The <strong>length of a bar</strong> is the fraction by which that clock ticks slower than the clock far from everything,
              so a longer bar is a slower clock. Numbers like {sciText(1e-7, 0)} are powers of ten: {tenTo(-7)} is one part in ten million.
            </p>
            <ul style={{ margin: '0 0 0.75rem', paddingLeft: '1.25rem' }}>
              <li>
                <strong>The lavender part</strong> of a bar is what gravity does to the clock, and <strong>the green part</strong> is what motion does. They are added.
                For the Earth’s clock, gravity’s part is the Sun’s gravity at the Earth’s distance plus the Earth’s own, and motion’s part is the Earth’s speed round the
                Sun plus its spin.
              </li>
              <li>
                <strong>The top bar</strong> is a clock on the Earth’s equator (it appears at stage 1). <strong>The bottom bar</strong> is the probe at its closest
                point to the Sun (stage 2).
              </li>
              {stage >= 3 && (
                <li>
                  <strong>The yellow bracket</strong> (stage 3) is the gap between the ends of the two bars: how much more one clock is slowed than the other.
                </li>
              )}
            </ul>
            {stage >= 2 && (
              <p style={paragraph}>
                <strong>A worked moment.</strong> The probe’s gravity part is GM ÷ (r × c²) = {sciText(SUN.gm, 3)} ÷ ({sciText(closestApproachDistance(), 3)} × {sciText(c2, 3)}) ={' '}
                {sciText(probe.gravity)}. Its motion part is v² ÷ (2 × c²) = ({PARKER.closestApproachSpeed.toLocaleString('en-US')})² ÷ (2 × {sciText(c2, 3)}) = {sciText(probe.speed)}. Added:{' '}
                {sciText(probe.total)}.
              </p>
            )}
            <p style={{ marginTop: 0, marginBottom: '0.5rem' }}>
              <strong>What to look for.</strong>
            </p>
            <LookForList items={lookForPictureOne.slice(0, stage >= 3 ? 3 : stage >= 2 ? 2 : 0)} />
          </div>
        )}

        {stage >= 4 && (
          <div style={{ marginTop: '1.5rem', marginBottom: '1rem' }}>
            <PictureTwo stage={stage} yours={done ? yoursFor : null} />
          </div>
        )}
        {stage >= 4 && (
          <div style={{ fontSize: '0.875rem', color: 'var(--text-muted)', marginBottom: '1.5rem' }}>
            <p style={paragraph}>
              <strong>How to read Picture 2.</strong> The green oval is the probe’s orbit, seen from above and drawn to scale; the amber dot is the Sun, drawn larger than it
              is. Each <strong>yellow dot</strong> is a point on the orbit, and the label above it says how far that point is from the Sun (in AU, the Earth’s distance from
              the Sun), how fast the probe moves there, and by how many milliseconds a day its clock is <strong>behind</strong> (ticks slower than) or <strong>ahead of</strong>{' '}
              (ticks faster than) a clock on the Earth. In the labels, <strong>km/s</strong> means kilometres a second and <strong>ms</strong> means a millisecond, a thousandth of a second. The labels run from the far end on the left to the closest point on the right.
            </p>
            <p style={paragraph}>
              <strong>A worked moment.</strong> At the closest point the two clocks differ by {sciText(difference)}. A day has {SECONDS_PER_DAY.toLocaleString('en-US')} seconds, so
              the probe’s clock falls behind by {sciText(difference)} × {SECONDS_PER_DAY.toLocaleString('en-US')} s = {(difference * SECONDS_PER_DAY).toFixed(4)} s, which is {lagDay.toFixed(1)}{' '}
              milliseconds, as the right-hand label says.
            </p>
            <p style={{ marginTop: 0, marginBottom: '0.5rem' }}>
              <strong>What to look for.</strong>
            </p>
            <LookForList items={lookForPictureTwo} />
          </div>
        )}

        {stage >= 5 && (
          <div style={{ marginTop: '1.5rem', marginBottom: '1rem' }}>
            <PictureThree yours={done ? yoursFor : null} />
          </div>
        )}
        {stage >= 5 && (
          <div style={{ fontSize: '0.875rem', color: 'var(--text-muted)', marginBottom: '1.5rem' }}>
            <p style={paragraph}>
              <strong>How to read Picture 3.</strong> The <strong>top graph</strong> plots, for every point of the orbit, how many milliseconds a day the probe’s clock is behind
              a clock on the Earth, in <strong>ms</strong> (milliseconds, thousandths of a second) a day; the bars at the bottom use <strong>s</strong>, seconds. Reading across, the horizontal axis is the probe’s distance from the Sun, on a log scale (each step to the right multiplies the distance
              rather than adding to it, so the short stretch near the Sun is not squashed). The <strong>green curve</strong> is the lag; the{' '}
              <strong>dashed blue line</strong> at zero is where the two clocks tick at the same rate; above it the probe’s clock is the slower one, below it the faster. The{' '}
              <strong>yellow dot</strong> is the closest point.
            </p>
            <p style={paragraph}>
              The <strong>two bars at the bottom</strong> show the lag after one whole orbit of {PARKER.periodDays} days, in seconds. The <strong>yellow bar</strong> pretends
              that the closest-point rate lasts the whole orbit: {lagDay.toFixed(1)} ms a day × {PARKER.periodDays} days = {atClosestOrbit.toFixed(2)} s. The{' '}
              <strong>green bar</strong> uses the rate the probe really has at each moment of the orbit, averaged over time, so it is much shorter.
            </p>
            <p style={paragraph}>
              <strong>A worked moment.</strong> Over a whole orbit the probe’s two parts average {sciText(average.total)} (1.5 × GM ÷ (a × c²), with a the orbit’s long half-width), against {sciText(earth.total)} for
              the Earth. The difference, {sciText(average.total - earth.total)}, times {PARKER.periodDays} × {SECONDS_PER_DAY.toLocaleString('en-US')} s = {actualOrbit.toFixed(3)} s.
            </p>
            <p style={{ marginTop: 0, marginBottom: '0.5rem' }}>
              <strong>What to look for.</strong>
            </p>
            <LookForList items={lookForPictureThree} />
          </div>
        )}


        {/* The controls (after the run): the point on the orbit and the time. They add a white mark to each picture and fill Table 4. */}
        {done && (
          <div style={{ marginTop: '1.5rem', marginBottom: '1.5rem' }}>
            <p style={{ fontWeight: 'bold', marginTop: 0, marginBottom: '0.5rem' }}>Now try other points on the orbit</p>
            <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)', marginTop: 0, marginBottom: '0.75rem' }}>
              Move the slider to put the probe at a different point on its orbit, from its closest point to its far end, and choose for how long it stays there. A white mark
              on each picture shows your point, and Table 4 below gives the numbers (km/s is kilometres a second, ms is a millisecond). The slider is on a log scale, like Picture 3: equal steps multiply the distance.
            </p>
            <label htmlFor="orbit-slider" style={{ display: 'block', fontWeight: 'bold', marginBottom: '0.25rem' }}>
              Where on the orbit? {yourAu} AU from the Sun ({yourSpeedKmS.toFixed(0)} km/s)
            </label>
            <input
              id="orbit-slider"
              type="range"
              min={0}
              max={100}
              step={1}
              value={orbitPosition}
              onChange={(e) => setOrbitPosition(Number(e.target.value))}
              style={{ width: '100%', maxWidth: '480px' }}
            />
            <div style={{ display: 'flex', justifyContent: 'space-between', maxWidth: '480px', fontSize: '0.75rem', color: 'var(--text-muted)' }}>
              <span>closest point</span>
              <span>far end</span>
            </div>
            <p style={{ fontWeight: 'bold', margin: '1rem 0 0.5rem' }}>For how long (if the probe stayed at that point)?</p>
            <div>
              {DURATIONS.map((d) => (
                <button
                  key={d.name}
                  type="button"
                  onClick={() => setDurationName(d.name)}
                  className={`toggle-button${durationName === d.name ? ' is-selected' : ''}`}
                  style={{ marginRight: '0.5rem', marginBottom: '0.5rem', padding: '0.5rem 1rem', fontSize: '0.875rem' }}
                >
                  {d.name}
                </button>
              ))}
            </div>
            <p style={{ fontSize: '0.875rem', margin: '0.75rem 0 0' }}>
              <strong>
                At {yourAu} AU the probe’s clock is {mine.lagMillisecondsPerDay >= 0 ? 'behind' : 'ahead of'} the Earth’s by{' '}
                {Math.abs(mine.lagMillisecondsPerDay).toFixed(2)} milliseconds a day, so after {durationName} at that rate the gap would be {secondsText(Math.abs(mine.gapSeconds))}.
              </strong>{' '}
              (A real probe does not stay at one point; this is the rate at that point.)
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
                Where this stands (as of October 2026): Settled: the probe’s distance and speed (NASA’s) and the physics (the formula has been tested with clocks on the
                Earth and in orbit). A calculation: the lag of {lagDay.toFixed(0)} milliseconds a day at the closest point is worked out here from relativity, and the
                sources read for this page do not report the mission measuring it.
              </strong>
            </p>
            <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)', marginTop: 0, marginBottom: '1rem' }}>
              These tables only report numbers, step by step. Table 1 is Picture 1. Table 2 is Pictures 2 and 3. Table 3 lists the published facts that this experiment
              uses, as the sources state them. In the tables, ms is a millisecond (a thousandth of a second), s is a second, km/s is kilometres a second and AU is the Earth’s distance from the Sun. Table 4 follows your own point on the orbit, from the controls above. Your predictions are not marked here.
            </p>

            <p style={{ fontWeight: 'bold', marginTop: 0, marginBottom: '0.5rem' }}>Table 1: what changes each clock’s rate</p>
            <ResultsTable
              minWidth={560}
              head={['Part', 'Clock on the Earth’s equator', 'Probe at its closest point', 'How it is worked out']}
              rows={[
                ['Gravity', sciText(earth.gravity), sciText(probe.gravity), 'GM ÷ (distance × c²); for the Earth’s clock the Earth’s own plus the Sun’s at 1 AU'],
                ['Motion', sciText(earth.speed), sciText(probe.speed), 'v² ÷ (2c²); for the Earth’s clock its speed round the Sun plus its spin'],
                ['Total slowing', sciText(earth.total), sciText(probe.total), 'the two parts added'],
                ['Difference (probe − Earth)', sciText(difference), '', `${sciText(probe.total)} − ${sciText(earth.total)}`],
                ['Lag in one day', `${lagDay.toFixed(2)} ms`, '', `${sciText(difference)} × ${SECONDS_PER_DAY.toLocaleString('en-US')} s`],
              ]}
            />

            <p style={{ fontWeight: 'bold', margin: '1.5rem 0 0.5rem' }}>Table 2: round the orbit</p>
            <ResultsTable
              minWidth={560}
              head={['Distance from the Sun', 'Speed', 'Total slowing', 'The probe’s clock, against the Earth’s']}
              rows={orbitRows}
            />
            <div style={{ height: '1rem' }} />
            <ResultsTable
              minWidth={560}
              head={['After one whole orbit of 88 days', 'Lag', 'How it is worked out']}
              rows={[
                ['If the closest-point rate lasted all orbit', `${atClosestOrbit.toFixed(2)} s`, `${lagDay.toFixed(2)} ms a day × ${PARKER.periodDays} days`],
                ['The real orbit, averaged over time', `${actualOrbit.toFixed(3)} s`, `(${sciText(average.total)} − ${sciText(earth.total)}) × ${PARKER.periodDays} × ${SECONDS_PER_DAY.toLocaleString('en-US')} s`],
              ]}
            />
            <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', margin: '0.5rem 0 1.5rem' }}>
              The closest-point row uses NASA’s speed of {(PARKER.closestApproachSpeed / 1000).toFixed(2)} km/s. A plain oval of the same period would give{' '}
              {ovalNearSpeedKmS.toFixed(1)} km/s there, 0.8 percent less, which is why the oval’s points
              and the closest point are not exactly on one curve. The real orbit is not exactly an oval.
            </p>

            <p style={{ fontWeight: 'bold', margin: '1.5rem 0 0.5rem' }}>Table 3: the published facts this experiment uses</p>
            <ResultsTable
              minWidth={560}
              head={['Fact', 'As the source states it', 'Source', 'In this experiment']}
              rows={[
                ['Closest approach, 24 December 2024', `6,167,590 km from the Sun’s surface, 192.22 km/s relative to the Sun, at 11:53:48 UTC`, 'Guinness World Records entry', `${(PARKER.closestApproachAltitude / 1e9).toFixed(3)} × 10⁶ km and ${(PARKER.closestApproachSpeed / 1000).toFixed(2)} km/s`],
                ['The records matched since', 'set on 24 December 2024 and matched on 22 March, 19 June and 16 September (2025); about 3.8 million miles from the surface at 430,000 miles per hour', 'NASA, 18 December 2025', 'the same distance and speed'],
                ['The latest pass', 'its 29th close approach, on 4 September 2026; the mission is extended into 2029', 'NASA, 10 September 2026', 'named in the introduction'],
                ['The mission’s plan', 'the final orbits come below 10 solar radii from the Sun (24 orbits over seven years, with Venus gravity assists)', 'Fox and others, Space Science Reviews, 2016 (abstract)', `the closest point is ${solarRadii.toFixed(2)} solar radii from the Sun’s centre`],
                ['Fastest and closest', 'closer to the Sun than any previous human-made object; the page calls the probe the fastest human-made object and quotes 244,225 mph from 2020 (NASA’s later pages give 430,000 mph)', 'NASA, Parker Solar Probe page', 'the introduction’s claim'],
              ]}
            />
            <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', margin: '0.5rem 0 1.5rem' }}>
              The sources do not give the length of one orbit in the pages read; the 88 days is the figure usually given for the probe’s current orbit and is not read from a
              NASA page. The size of the Sun’s radius and the Earth’s speed are standard values, not read from a source for this page.
            </p>

            <p style={{ fontWeight: 'bold', margin: '1.5rem 0 0.5rem' }}>Table 4: your point on the orbit</p>
            <ResultsTable
              minWidth={560}
              head={['Item', 'Value', 'How it is worked out']}
              rows={[
                ['Distance from the Sun', `${(yourDistanceM / ASTRONOMICAL_UNIT).toFixed(3)} AU`, 'your choice (the slider)'],
                ['Speed', `${yourSpeedKmS.toFixed(1)} km/s`, orbitPosition === 0 ? 'NASA’s speed at the closest point' : 'from the oval’s energy: v = √(GM × (2 ÷ r − 1 ÷ a))'],
                ['Gravity', sciText(mine.terms.gravity), 'GM ÷ (r × c²)'],
                ['Motion', sciText(mine.terms.speed), 'v² ÷ (2 × c²)'],
                ['Total slowing', sciText(mine.terms.total), 'the two parts added'],
                ['The Earth’s clock', sciText(earth.total), 'as in Table 1'],
                ['Lag behind the Earth’s clock, per day', `${mine.lagMillisecondsPerDay >= 0 ? '' : '−'}${Math.abs(mine.lagMillisecondsPerDay).toFixed(2)} ms`, `(${sciText(mine.terms.total)} − ${sciText(earth.total)}) × ${SECONDS_PER_DAY.toLocaleString('en-US')} s`],
                ['Time', durationName, 'your choice'],
                ['Gap after that time, at this rate', `${mine.gapSeconds < 0 ? '−' : ''}${secondsText(Math.abs(mine.gapSeconds))}`, 'the lag per day × the days'],
              ]}
            />

            <p style={{ marginTop: 0, marginBottom: '0.5rem' }}>
              <strong>Want to know more?</strong> The scientific paper on the mission is listed here now. It is written for scientists. The link opens in a new tab.
            </p>
            <ul style={{ margin: '0.25rem 0 0', paddingLeft: '1.25rem' }}>
              <li>
                <ExternalLink href="https://doi.org/10.1007/s11214-015-0211-6">Fox and others, “The Solar Probe Plus Mission: Humanity’s First Visit to Our Star” (Space Science Reviews, 2016)</ExternalLink>
                : the mission’s plan, its science goals and its orbits. The link goes to the publisher’s page, which may ask for a subscription.
              </li>
            </ul>
          </div>
        )}

        {/* The tutor: observe, compare with the predictions, one conceptual question, then the explanation. The chapter summary below the experiment
            (in App) is shown only once the learner reaches the explanation. */}
        {done && effectsPrediction !== null && sizePrediction !== null && (
          <FastestSpacecraftTutor effectsPrediction={effectsPrediction} sizePrediction={sizePrediction} onExplained={() => onTutorComplete?.()} />
        )}
      </div>
    </div>
  )
}
