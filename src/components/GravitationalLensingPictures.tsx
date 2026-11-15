import {
  LENS_DISTANCE_MPC,
  MAX_LENS_MASS_SOLAR_MASSES,
  OBSERVED_RING_ARCSECONDS,
  SOURCE_DISTANCE_MPC,
  einsteinRingArcseconds,
  fourTimesGuessMark,
  imaginedFourTimes,
  observedBendArcseconds,
  ringComparisonExample,
  ringSizeGuessMarker,
  runGravitationalLensingExperiment,
  visibleOnlyMassSolarMasses,
  visibleOnlyRingArcseconds,
  yourComparison,
} from '../physics/gravitationalLensingExperiment'
import type { FourTimesGuess, RingSizeGuess } from '../physics/gravitationalLensingExperiment'
import { MUTED_COLOR, TEXT_COLOR, svgStyle } from './GravitationalWaveExperiment'
import { CaptionBox, LookFor, listStyle } from './TidalEffectExperiment'

// Cosmology, Experiment 7, audited to the newer rules (docs/audit/cosmology/07-draft-wording.md, approved by the owner on 2026-11-15).
// Three pictures, each with its own caption: the side view, the sky view and the ring-against-mass graph. Every number (a ring, a bend, the
// place of a guess mark) comes from the physics module; this file only draws and words it (CLAUDE.md §9). White is only ever the learner's
// guess (§14). The guess marks and the violet "imagined" ring are drawn only once the run has finished (§12).

export const GUESS_COLOR = '#ffffff'
export const VISIBLE_COLOR = '#38bdf8' // blue: the ring the visible matter alone would make (calculated here)
export const OBSERVED_COLOR = '#4ade80' // green: the observed ring (measured by others, a given value)
export const YOUR_MASS_COLOR = '#fbbf24' // gold: the learner's own mass (Part 2)
export const IMAGINED_COLOR = '#c084fc' // violet: imagined for the question (four times the visible mass)
const RAY_COLOR = '#fde68a'

export const RING_SIZE_GUESS_TEXT: Record<RingSizeGuess, string> = {
  larger: 'a larger ring',
  same: 'a ring of the same size',
  smaller: 'a smaller ring',
}
export const FOUR_TIMES_GUESS_TEXT: Record<FourTimesGuess, string> = {
  four: 'four times as wide',
  two: 'twice as wide',
  same: 'about the same width',
}

const SUPERSCRIPT_DIGITS = '⁰¹²³⁴⁵⁶⁷⁸⁹'
export function massLabel(mass: number): string {
  const exponent = Math.floor(Math.log10(mass))
  const mantissa = mass / 10 ** exponent
  const exponentText = String(exponent)
    .split('')
    .map((digit) => SUPERSCRIPT_DIGITS[Number(digit)])
    .join('')
  return `${mantissa.toFixed(1)} × 10${exponentText}`
}

function GuessBox({ x, y, width, line }: { x: number; y: number; width: number; line: string }) {
  return (
    <g>
      <rect x={x} y={y} width={width} height={32} rx={4} fill="#0b1020" stroke={GUESS_COLOR} strokeWidth={2.5} />
      <text x={x + width / 2} y={y + 14} fill={GUESS_COLOR} fontSize="11" fontWeight="bold" textAnchor="middle">
        YOUR GUESS
      </text>
      <text x={x + width / 2} y={y + 27} fill={GUESS_COLOR} fontSize="9.5" textAnchor="middle">
        {line}
      </text>
    </g>
  )
}

const halo = { stroke: '#0b1020', strokeWidth: 3, paintOrder: 'stroke' } as const

// ---- Picture 1: the side view ----
const GEOMETRY_WIDTH = 560
const GEOMETRY_HEIGHT = 250
const GEOMETRY_MID_Y = GEOMETRY_HEIGHT / 2
const EARTH_X = 40
const SOURCE_X = 510
const LENS_X = EARTH_X + (LENS_DISTANCE_MPC / SOURCE_DISTANCE_MPC) * (SOURCE_X - EARTH_X)

export interface SideViewProps {
  // The mass whose ring sets how far the drawn bend is exaggerated (Part 1: the real cluster)
  mass: number
  // 0 to 1: how far the two yellow dots have travelled from the source to Earth
  travel: number
}

export function SideView({ mass, travel }: SideViewProps) {
  const result = runGravitationalLensingExperiment(mass)
  const bendHeight = 14 + result.ringArcseconds * 1.0
  const rayPoint = (sign: 1 | -1, t: number) => {
    const bendY = GEOMETRY_MID_Y + sign * bendHeight
    if (t <= 0.5) {
      const u = t / 0.5
      return { x: SOURCE_X + (LENS_X - SOURCE_X) * u, y: GEOMETRY_MID_Y + (bendY - GEOMETRY_MID_Y) * u }
    }
    const u = (t - 0.5) / 0.5
    return { x: LENS_X + (EARTH_X - LENS_X) * u, y: bendY + (GEOMETRY_MID_Y - bendY) * u }
  }
  return (
    <svg
      width={GEOMETRY_WIDTH}
      height={GEOMETRY_HEIGHT}
      viewBox={`0 0 ${GEOMETRY_WIDTH} ${GEOMETRY_HEIGHT}`}
      style={{ ...svgStyle, width: GEOMETRY_WIDTH, maxWidth: '100%', backgroundColor: '#0b1020' }}
      role="img"
      aria-label="Side view: light from a distant galaxy bends around a galaxy cluster on its way to Earth"
    >
      <text x={GEOMETRY_WIDTH / 2} y={20} fill={TEXT_COLOR} fontSize="12" fontWeight="600" textAnchor="middle">
        Side view: light from a distant galaxy bends around the cluster (not to scale)
      </text>
      <line x1={EARTH_X} y1={GEOMETRY_MID_Y} x2={SOURCE_X} y2={GEOMETRY_MID_Y} stroke="#334155" strokeDasharray="3 4" />
      {[1, -1].map((sign) => (
        <polyline
          key={sign}
          points={`${SOURCE_X},${GEOMETRY_MID_Y} ${LENS_X},${GEOMETRY_MID_Y + sign * bendHeight} ${EARTH_X},${GEOMETRY_MID_Y}`}
          fill="none"
          stroke={RAY_COLOR}
          strokeWidth={1.5}
          opacity={0.5}
        />
      ))}
      {[1, -1].map((sign) => {
        const p = rayPoint(sign as 1 | -1, travel)
        return <circle key={sign} cx={p.x} cy={p.y} r={4.5} fill={RAY_COLOR} />
      })}
      <circle cx={EARTH_X} cy={GEOMETRY_MID_Y} r={12} fill="#38bdf8" />
      <text x={EARTH_X} y={GEOMETRY_MID_Y + 32} fill={TEXT_COLOR} fontSize="11" textAnchor="middle">
        Earth
      </text>
      <defs>
        <radialGradient id="lensing-cluster-glow">
          <stop offset="0%" stopColor="#ede9fe" stopOpacity={1} />
          <stop offset="100%" stopColor="#7c3aed" stopOpacity={0.35} />
        </radialGradient>
      </defs>
      <circle cx={LENS_X} cy={GEOMETRY_MID_Y} r={20} fill="url(#lensing-cluster-glow)" />
      <text x={LENS_X} y={GEOMETRY_MID_Y + 40} fill={TEXT_COLOR} fontSize="11" textAnchor="middle" {...halo}>
        Galaxy cluster (the lens)
      </text>
      <text x={LENS_X} y={GEOMETRY_MID_Y + 54} fill={MUTED_COLOR} fontSize="10" textAnchor="middle" {...halo}>
        light bends toward it here
      </text>
      <ellipse cx={SOURCE_X} cy={GEOMETRY_MID_Y} rx={14} ry={7} fill="#fde68a" />
      <text x={SOURCE_X} y={GEOMETRY_MID_Y + 32} fill={TEXT_COLOR} fontSize="11" textAnchor="middle">
        Distant galaxy
      </text>
      <text x={SOURCE_X} y={GEOMETRY_MID_Y + 46} fill={TEXT_COLOR} fontSize="11" textAnchor="middle">
        (the source)
      </text>
      <text x={(LENS_X + SOURCE_X) / 2 + 10} y={GEOMETRY_MID_Y - bendHeight + 18} fill={RAY_COLOR} fontSize="10">
        light rays
      </text>
    </svg>
  )
}

// ---- Picture 2: the sky view ----
const SKY_SIZE = 380
const SKY_CENTER = SKY_SIZE / 2
const SKY_PIXELS_PER_ARCSECOND = 2.2
const SCALE_BAR_ARCSECONDS = 20
const px = (arcseconds: number) => arcseconds * SKY_PIXELS_PER_ARCSECOND

export interface SkyViewProps {
  // 0 to 1: how far the blue and green rings have been drawn out from the cluster (Part 1's run); 1 in Part 2
  ringProgress: number
  // Part 2: the learner's mass, drawn as the gold ring, and how far it has been drawn (0 to 1)
  yourMass: number | null
  yourProgress: number
  // Only after the run has finished: the white marks and the violet "imagined" ring
  finished: boolean
  guesses: { ringSize: RingSizeGuess; fourTimes: FourTimesGuess } | null
}

export function SkyView({ ringProgress, yourMass, yourProgress, finished, guesses }: SkyViewProps) {
  const visible = px(visibleOnlyRingArcseconds())
  const observed = px(OBSERVED_RING_ARCSECONDS)
  const yourRing = yourMass === null ? 0 : px(einsteinRingArcseconds(yourMass))
  const imagined = imaginedFourTimes()
  const imaginedR = px(imagined.ringArcseconds)
  const marks =
    finished && guesses
      ? { first: ringSizeGuessMarker(guesses.ringSize), second: fourTimesGuessMark(guesses.fourTimes) }
      : null
  const secondR = marks ? px(marks.second.ringArcseconds) : 0
  // Guess 1: a short arrow along the line to the left of the cluster, starting on the blue ring.
  const arrowStartX = SKY_CENTER - visible
  const arrowEndX = marks ? SKY_CENTER - px(marks.first.toArcseconds) : arrowStartX
  const head = marks?.first.kind === 'out' ? [arrowEndX, arrowEndX + 9] : [arrowEndX, arrowEndX - 9]
  // Guess 2: its box sits at the lower right, joined to the ring at an angle of 50 degrees.
  const ringPointX = SKY_CENTER + secondR * Math.cos((50 * Math.PI) / 180)
  const ringPointY = SKY_CENTER + secondR * Math.sin((50 * Math.PI) / 180)
  const boxX = SKY_SIZE - 212
  const boxY = SKY_SIZE - 46

  return (
    <svg
      width={SKY_SIZE}
      height={SKY_SIZE}
      viewBox={`0 0 ${SKY_SIZE} ${SKY_SIZE}`}
      style={{ ...svgStyle, width: SKY_SIZE, maxWidth: '100%', backgroundColor: '#0b1020' }}
      role="img"
      aria-label="What we see on the sky from Earth: rings of light around a galaxy cluster"
    >
      <defs>
        <radialGradient id="lensing-cluster-glow-sky">
          <stop offset="0%" stopColor="#ede9fe" stopOpacity={1} />
          <stop offset="100%" stopColor="#7c3aed" stopOpacity={0.35} />
        </radialGradient>
      </defs>
      <text x={SKY_SIZE / 2} y={20} fill={TEXT_COLOR} fontSize="12" fontWeight="600" textAnchor="middle">
        What we see on the sky from Earth
      </text>

      {/* The ring that visible matter alone would make, and the observed ring of the real cluster */}
      <circle cx={SKY_CENTER} cy={SKY_CENTER} r={visible * ringProgress} fill="none" stroke={VISIBLE_COLOR} strokeWidth={2} strokeDasharray="6 4" />
      <circle cx={SKY_CENTER} cy={SKY_CENTER} r={observed * ringProgress} fill="none" stroke={OBSERVED_COLOR} strokeWidth={2} strokeDasharray="2 3" />

      {/* Part 2: the ring for the learner's mass */}
      {yourMass !== null && yourProgress > 0 && (
        <>
          <circle cx={SKY_CENTER} cy={SKY_CENTER} r={yourRing * yourProgress} fill="none" stroke={YOUR_MASS_COLOR} strokeWidth={9} opacity={0.25} />
          <circle cx={SKY_CENTER} cy={SKY_CENTER} r={yourRing * yourProgress} fill="none" stroke={YOUR_MASS_COLOR} strokeWidth={3.5} />
        </>
      )}

      {/* Imagined for the question: four times the visible mass (drawn only once the run has finished) */}
      {finished && guesses && (
        <>
          <circle cx={SKY_CENTER} cy={SKY_CENTER} r={imaginedR} fill="none" stroke={IMAGINED_COLOR} strokeWidth={2.5} strokeDasharray="1 4" strokeLinecap="round" />
          <text fill={IMAGINED_COLOR} fontSize="10" fontWeight="600" {...halo}>
            <tspan x={SKY_CENTER + imaginedR * 0.82 + 8} y={SKY_CENTER + imaginedR * 0.57 + 6}>imagined: four times</tspan>
            <tspan x={SKY_CENTER + imaginedR * 0.82 + 8} y={SKY_CENTER + imaginedR * 0.57 + 18}>the visible mass</tspan>
            <tspan x={SKY_CENTER + imaginedR * 0.82 + 8} y={SKY_CENTER + imaginedR * 0.57 + 30}>({imagined.ringArcseconds.toFixed(1)}″)</tspan>
          </text>
        </>
      )}

      {/* The cluster at the centre; the source is exactly behind it */}
      <circle cx={SKY_CENTER} cy={SKY_CENTER} r={11} fill="url(#lensing-cluster-glow-sky)" />
      <text x={SKY_CENTER} y={SKY_CENTER - 16} fill={TEXT_COLOR} fontSize="10" textAnchor="middle" {...halo}>
        Cluster
      </text>

      {/* Ring labels */}
      {ringProgress >= 1 && (
        <>
          <text x={SKY_CENTER + observed * 0.82 + 8} y={SKY_CENTER - observed * 0.57 - 2} fill={OBSERVED_COLOR} fontSize="10" fontWeight="600" {...halo}>
            <tspan>Observed ring</tspan>
            <tspan x={SKY_CENTER + observed * 0.82 + 8} dy="11">({OBSERVED_RING_ARCSECONDS}″, measured)</tspan>
          </text>
          <text x={SKY_CENTER} y={SKY_CENTER + visible + 14} fill={VISIBLE_COLOR} fontSize="10" fontWeight="600" textAnchor="middle" {...halo}>
            Visible matter only
          </text>
        </>
      )}
      {yourMass !== null && yourProgress >= 1 && (
        <text
          x={yourRing >= 70 ? SKY_CENTER - yourRing * 0.71 + 8 : SKY_CENTER}
          y={yourRing >= 70 ? SKY_CENTER + yourRing * 0.71 - 6 : SKY_CENTER + yourRing + 28}
          fill={YOUR_MASS_COLOR}
          fontSize="10"
          fontWeight="600"
          textAnchor={yourRing >= 70 ? 'start' : 'middle'}
          {...halo}
        >
          Ring for your chosen mass
        </text>
      )}

      {/* The white guess marks: drawn only once the run has finished. Markers only for guess 1; guess 2 is a ring at a fixed multiple. */}
      {marks && (
        <g>
          {/* guess 1 */}
          {marks.first.kind === 'ring' ? (
            <circle cx={arrowStartX} cy={SKY_CENTER} r={9} fill="none" stroke={GUESS_COLOR} strokeWidth={3.5} />
          ) : (
            <>
              <line x1={arrowStartX} y1={SKY_CENTER} x2={arrowEndX} y2={SKY_CENTER} stroke={GUESS_COLOR} strokeWidth={4} />
              <polygon points={`${arrowEndX},${SKY_CENTER} ${head[1]},${SKY_CENTER - 6} ${head[1]},${SKY_CENTER + 6}`} fill={GUESS_COLOR} />
            </>
          )}
          <line x1={80} y1={68} x2={arrowStartX - (marks.first.kind === 'ring' ? 9 : 0)} y2={SKY_CENTER} stroke={GUESS_COLOR} strokeWidth={2} />
          <GuessBox x={6} y={34} width={150} line={`more mass: ${guesses!.ringSize === 'larger' ? 'a larger ring' : guesses!.ringSize === 'smaller' ? 'a smaller ring' : 'the same size'}`} />
          {/* guess 2 */}
          <circle cx={SKY_CENTER} cy={SKY_CENTER} r={secondR} fill="none" stroke={GUESS_COLOR} strokeWidth={3.5} />
          <line x1={boxX + 100} y1={boxY} x2={ringPointX} y2={ringPointY} stroke={GUESS_COLOR} strokeWidth={2} />
          <GuessBox x={boxX} y={boxY} width={206} line={`four times the mass: ${guesses!.fourTimes === 'four' ? 'four times' : guesses!.fourTimes === 'two' ? 'twice' : 'about the same'} as wide`} />
        </g>
      )}

      {/* Scale bar */}
      <line x1={20} y1={SKY_SIZE - 22} x2={20 + px(SCALE_BAR_ARCSECONDS)} y2={SKY_SIZE - 22} stroke="#cbd5e1" strokeWidth={2} />
      <text x={20} y={SKY_SIZE - 8} fill="#cbd5e1" fontSize="10">
        {SCALE_BAR_ARCSECONDS} arcseconds
      </text>
    </svg>
  )
}

// ---- Picture 3: ring radius against cluster mass ----
const GRAPH_WIDTH = 460
const GRAPH_HEIGHT = 300
const GRAPH_LEFT = 60
const GRAPH_RIGHT = GRAPH_WIDTH - 20
const GRAPH_TOP = 64 // leaves a band above the plot for the YOUR GUESS box
const GRAPH_BOTTOM = GRAPH_HEIGHT - 50
const GRAPH_MAX_RING = 75
const CURVE_SAMPLES = 80
const graphX = (mass: number) => GRAPH_LEFT + (mass / MAX_LENS_MASS_SOLAR_MASSES) * (GRAPH_RIGHT - GRAPH_LEFT)
const graphY = (ring: number) => GRAPH_BOTTOM - (ring / GRAPH_MAX_RING) * (GRAPH_BOTTOM - GRAPH_TOP)

export interface MassGraphProps {
  // Part 2: the learner's mass, drawn as the gold dot
  yourMass: number | null
  finished: boolean
  guesses: { ringSize: RingSizeGuess; fourTimes: FourTimesGuess } | null
}

export function MassGraph({ yourMass, finished, guesses }: MassGraphProps) {
  const curvePoints = Array.from({ length: CURVE_SAMPLES + 1 }, (_, i) => {
    const m = MAX_LENS_MASS_SOLAR_MASSES * (i / CURVE_SAMPLES) ** 2
    return `${graphX(m).toFixed(1)},${graphY(m === 0 ? 0 : einsteinRingArcseconds(m)).toFixed(1)}`
  }).join(' ')
  const visibleMass = visibleOnlyMassSolarMasses()
  const visibleRing = visibleOnlyRingArcseconds()
  const imagined = imaginedFourTimes()
  const mark = finished && guesses ? fourTimesGuessMark(guesses.fourTimes) : null
  const yourRing = yourMass === null ? 0 : einsteinRingArcseconds(yourMass)
  return (
    <svg
      width={GRAPH_WIDTH}
      height={GRAPH_HEIGHT}
      viewBox={`0 0 ${GRAPH_WIDTH} ${GRAPH_HEIGHT}`}
      style={{ ...svgStyle, width: GRAPH_WIDTH, maxWidth: '100%', backgroundColor: '#0b1020' }}
      role="img"
      aria-label="Ring radius against cluster mass: a purple curve with a blue dot, a green line and, in Part 2, a gold dot"
    >
      <text x={GRAPH_WIDTH / 2} y={18} fill={TEXT_COLOR} fontSize="12" fontWeight="600" textAnchor="middle">
        Ring radius against cluster mass
      </text>
      <line x1={GRAPH_LEFT} y1={GRAPH_TOP} x2={GRAPH_LEFT} y2={GRAPH_BOTTOM} stroke="#64748b" />
      <line x1={GRAPH_LEFT} y1={GRAPH_BOTTOM} x2={GRAPH_RIGHT} y2={GRAPH_BOTTOM} stroke="#64748b" />
      {[0, 1e14, 2e14, 3e14, 4e14].map((m) => (
        <g key={m}>
          <line x1={graphX(m)} y1={GRAPH_BOTTOM} x2={graphX(m)} y2={GRAPH_BOTTOM + 4} stroke="#64748b" />
          <text x={graphX(m)} y={GRAPH_BOTTOM + 16} fill="#cbd5e1" fontSize="10" textAnchor={m === MAX_LENS_MASS_SOLAR_MASSES ? 'end' : 'middle'}>
            {m === 0 ? '0' : massLabel(m)}
          </text>
        </g>
      ))}
      {[0, 25, 50, 75].map((r) => (
        <g key={r}>
          <line x1={GRAPH_LEFT - 4} y1={graphY(r)} x2={GRAPH_LEFT} y2={graphY(r)} stroke="#64748b" />
          <text x={GRAPH_LEFT - 8} y={graphY(r) + 4} fill="#cbd5e1" fontSize="10" textAnchor="end">
            {r}
          </text>
        </g>
      ))}
      <text x={(GRAPH_LEFT + GRAPH_RIGHT) / 2} y={GRAPH_HEIGHT - 8} fill="#cbd5e1" fontSize="11" textAnchor="middle">
        Cluster mass (solar masses)
      </text>
      <text x={14} y={(GRAPH_TOP + GRAPH_BOTTOM) / 2} fill="#cbd5e1" fontSize="11" textAnchor="middle" transform={`rotate(-90 14 ${(GRAPH_TOP + GRAPH_BOTTOM) / 2})`}>
        Ring radius (arcseconds)
      </text>

      <line x1={GRAPH_LEFT} y1={graphY(OBSERVED_RING_ARCSECONDS)} x2={GRAPH_RIGHT} y2={graphY(OBSERVED_RING_ARCSECONDS)} stroke={OBSERVED_COLOR} strokeDasharray="2 3" />
      <text x={GRAPH_RIGHT} y={graphY(OBSERVED_RING_ARCSECONDS) + 14} fill={OBSERVED_COLOR} fontSize="10" fontWeight="600" textAnchor="end" {...halo}>
        Observed ring: {OBSERVED_RING_ARCSECONDS} arcseconds (measured)
      </text>

      <polyline points={curvePoints} fill="none" stroke="#a78bfa" strokeWidth={2.5} />
      <text x={GRAPH_RIGHT} y={graphY(einsteinRingArcseconds(MAX_LENS_MASS_SOLAR_MASSES)) - 8} fill="#a78bfa" fontSize="10" fontWeight="600" textAnchor="end">
        Ring for any mass (calculated here)
      </text>

      <circle cx={graphX(visibleMass)} cy={graphY(visibleRing)} r={5} fill={VISIBLE_COLOR} />
      <text x={graphX(visibleMass) + 8} y={graphY(visibleRing) + 14} fill={VISIBLE_COLOR} fontSize="10" fontWeight="600" {...halo}>
        Visible matter only
      </text>

      {yourMass !== null && (
        <>
          <circle cx={graphX(yourMass)} cy={graphY(yourRing)} r={6} fill={YOUR_MASS_COLOR} stroke="#0b1020" strokeWidth={2} />
          <text x={graphX(yourMass)} y={graphY(yourRing) + 20} fill={YOUR_MASS_COLOR} fontSize="10" fontWeight="600" textAnchor={graphX(yourMass) > GRAPH_RIGHT - 60 ? 'end' : 'middle'} {...halo}>
            Your chosen mass
          </text>
        </>
      )}

      {/* Imagined for the question, and guess 2's white point: drawn only once the run has finished */}
      {finished && guesses && mark && (
        <g>
          <circle cx={graphX(imagined.massSolarMasses)} cy={graphY(imagined.ringArcseconds)} r={5} fill={IMAGINED_COLOR} />
          <text x={graphX(imagined.massSolarMasses) + 9} y={graphY(imagined.ringArcseconds) + 14} fill={IMAGINED_COLOR} fontSize="10" fontWeight="600" {...halo}>
            imagined: four times the visible mass
          </text>
          <circle cx={graphX(mark.massSolarMasses)} cy={graphY(mark.ringArcseconds)} r={8} fill="none" stroke={GUESS_COLOR} strokeWidth={3.5} />
          <line x1={GRAPH_LEFT + 8 + 100} y1={GRAPH_TOP - 6} x2={graphX(mark.massSolarMasses)} y2={graphY(mark.ringArcseconds) - 8} stroke={GUESS_COLOR} strokeWidth={2} />
          <GuessBox x={GRAPH_LEFT + 8} y={GRAPH_TOP - 38} width={206} line={`four times the mass: ${guesses.fourTimes === 'four' ? 'four times' : guesses.fourTimes === 'two' ? 'twice' : 'about the same'} as wide`} />
        </g>
      )}
    </svg>
  )
}

// ---- captions ----

const arcsec = (v: number) => v.toFixed(1)

export function Part1SideCaption({ started }: { started: boolean }) {
  const bend = observedBendArcseconds()
  return (
    <CaptionBox>
      <p style={{ marginTop: 0, marginBottom: '0.5rem' }}>
        <strong>How to read this picture: the side view, how the light travels.</strong>
      </p>
      <ul style={listStyle}>
        <li>
          <strong>Earth</strong> is on the left, the <strong>cluster (the lens)</strong> is in the middle and the <strong>distant galaxy (the source)</strong> is on the right, placed in proportion to their distances. The dashed line is the perfect line-up. The picture is not to scale in other ways.
        </li>
        {started && (
          <>
            <li>
              When you press Run, two yellow dots leave the source and travel along two <strong>light rays</strong>, one passing above the cluster and one below. Each is pulled toward the cluster by its gravity, so it changes direction there and then heads to Earth. Without the cluster, light from the source would go straight and miss us.
            </li>
            <li>
              Why two rays? Light leaves the source in every direction, and light passing the cluster on <em>every</em> side is bent toward us, not only above and below. The picture shows two as examples; all of them together make the ring.
            </li>
            <li>
              <strong>The bend is drawn far larger than it really is</strong>, so you can see it. The real bend at the ring&rsquo;s edge is only about {bend.toFixed(0)} arcseconds, which is about {(bend / 3600).toFixed(3)} of a degree.
            </li>
          </>
        )}
      </ul>
      {started && (
        <LookFor
          items={[
            {
              look: 'the two yellow dots as they pass the cluster',
              means: 'each changes direction at the cluster, and then heads for Earth.',
              matters: 'that change of direction, from gravity alone, is the whole effect.',
            },
          ]}
        />
      )}
    </CaptionBox>
  )
}

export function Part1SkyCaption({ started, arrived }: { started: boolean; arrived: boolean }) {
  const e = ringComparisonExample()
  const imagined = imaginedFourTimes()
  return (
    <CaptionBox>
      <p style={{ marginTop: 0, marginBottom: '0.5rem' }}>
        <strong>How to read this picture: the sky view, what we see.</strong>
      </p>
      <ul style={listStyle}>
        <li>
          This is what we would see through a telescope pointed at the cluster, which is the glow at the centre. The source is exactly behind it, so its light arrives from all around it and forms a ring. The scale bar shows how big 20 arcseconds is on this picture.
        </li>
        {started && (
          <>
            <li>
              The <strong style={{ color: VISIBLE_COLOR }}>dashed blue ring</strong> is the ring that the cluster&rsquo;s visible matter alone (stars and hot gas) would make: <strong>{arcsec(e.visibleRingArcseconds)} arcseconds</strong> in radius. <strong>Calculated here.</strong>
            </li>
            <li>
              The <strong style={{ color: OBSERVED_COLOR }}>dotted green ring</strong> is the ring actually seen for a real cluster, Abell 1689: <strong>{e.observedRingArcseconds} arcseconds</strong>. <strong>Measured by others; a given, rounded value.</strong>
            </li>
          </>
        )}
        {arrived && (
          <>
            <li>
              The <strong style={{ color: IMAGINED_COLOR }}>dotted violet ring</strong>, labelled <em>imagined</em>, is the ring a cluster with <strong>four times the visible mass</strong> would make: <strong>{arcsec(imagined.ringArcseconds)} arcseconds</strong>. <strong>Calculated here, for the question</strong>; there is no such cluster.
            </li>
            <li>
              The <strong>white marks</strong> are your guesses, each in a YOUR GUESS box. <strong>Guess 1</strong> is an arrow starting on the blue ring: pointing outward for &ldquo;larger&rdquo;, inward for &ldquo;smaller&rdquo;, or a small ring on it for &ldquo;the same size&rdquo;. It is <strong>only a marker</strong>: every arrow has the same fixed length, which means nothing as a number. <strong>Guess 2</strong> is a white ring at the width you guessed, measured against the blue ring: 1 times, 2 times or 4 times as wide. They do not say right or wrong.
            </li>
            <li>
              <strong>A worked moment.</strong> Measure from the cluster at the centre to each ring. The blue ring is {arcsec(e.visibleRingArcseconds)} arcseconds out and the green is {arcsec(e.observedRingArcseconds)}. The green ring is {arcsec(e.differenceArcseconds)} arcseconds farther out, and {arcsec(e.observedRingArcseconds)} ÷ {arcsec(e.visibleRingArcseconds)} ≈ {e.ratio.toFixed(1)}, so it is about {e.ratio.toFixed(1)} times as wide. The violet ring is {arcsec(imagined.ringArcseconds)} ÷ {arcsec(e.visibleRingArcseconds)} = {(imagined.ringArcseconds / e.visibleRingArcseconds).toFixed(1)} times the blue one.
            </li>
          </>
        )}
      </ul>
      {arrived && (
        <LookFor
          items={[
            {
              look: 'the blue ring and the green ring',
              means: `the green ring, the real one, is ${arcsec(e.differenceArcseconds)} arcseconds wider than the ring the visible matter alone would make.`,
              matters: 'it is a measured difference between two rings, and the whole experiment is about what it means.',
            },
            {
              look: 'the violet ring against the blue ring',
              means: `it is exactly twice as wide (${arcsec(imagined.ringArcseconds)} against ${arcsec(e.visibleRingArcseconds)}).`,
              matters: 'it shows what four times the mass does to the ring.',
            },
            {
              look: 'the white marks',
              means: 'each shows what you guessed, beside the real rings.',
              matters: 'you can compare at a glance; the tutor in Part 4 goes through each guess.',
            },
          ]}
        />
      )}
    </CaptionBox>
  )
}

export function Part1GraphCaption({ started, arrived }: { started: boolean; arrived: boolean }) {
  const e = ringComparisonExample()
  const imagined = imaginedFourTimes()
  return (
    <CaptionBox>
      <p style={{ marginTop: 0, marginBottom: '0.5rem' }}>
        <strong>How to read this picture: the graph, ring size for every mass.</strong>
      </p>
      <ul style={listStyle}>
        <li>
          Across the bottom is the cluster&rsquo;s mass in <strong>solar masses</strong> (one solar mass is the mass of our Sun). Up the side is the ring&rsquo;s radius in arcseconds (one arcsecond is a 3,600th of a degree). The <strong style={{ color: '#a78bfa' }}>purple curve</strong> shows the ring for every mass: <strong>calculated here</strong>.
        </li>
        {started && (
          <li>
            The <strong style={{ color: VISIBLE_COLOR }}>blue dot</strong> is visible matter only ({massLabel(e.visibleMassSolarMasses)} solar masses, a ring of {arcsec(e.visibleRingArcseconds)}). The <strong style={{ color: OBSERVED_COLOR }}>dotted green line</strong> is the observed ring, {e.observedRingArcseconds} arcseconds (measured by others). The curve meets the green line at the mass inside the observed ring, about {massLabel(e.observedMassSolarMasses)} solar masses, <strong>calculated here</strong> by running the formula backward.
          </li>
        )}
        {arrived && (
          <li>
            The <strong style={{ color: IMAGINED_COLOR }}>violet dot</strong> (imagined) is on the curve at four times the visible mass ({massLabel(imagined.massSolarMasses)}), a ring of {arcsec(imagined.ringArcseconds)}. The <strong>white ring</strong> is your guess 2 at the same mass: it sits at the ring width you guessed (1, 2 or 4 times the blue dot&rsquo;s ring). It is only a marker and does not say right or wrong.
          </li>
        )}
      </ul>
      {started && (
        <LookFor
          items={[
            {
              look: 'where the purple curve crosses the green line, then straight down to the mass axis',
              means: `about ${massLabel(e.observedMassSolarMasses)} solar masses is inside the observed ring.`,
              matters: 'the ring has turned into a weighing: its size tells us the mass inside it.',
            },
            {
              look: 'the blue dot against that crossing',
              means: `the visible matter is ${massLabel(e.visibleMassSolarMasses)}, the crossing is ${massLabel(e.observedMassSolarMasses)}.`,
              matters: 'the two numbers are far apart, and a tutor question in Part 4 asks why.',
            },
            ...(arrived
              ? [
                  {
                    look: 'the white ring and the violet dot at four times the visible mass',
                    means: `the violet one is on the curve at ${arcsec(imagined.ringArcseconds)} and the white one is where you guessed.`,
                    matters: 'this is the part of the curve you were asked about.',
                  },
                ]
              : []),
          ]}
        />
      )}
    </CaptionBox>
  )
}

export function Part2Caption({ mass }: { mass: number }) {
  const c = yourComparison(mass)
  return (
    <CaptionBox>
      <p style={{ marginTop: 0, marginBottom: '0.5rem' }}>
        <strong>How to read these pictures.</strong> They are the Part 1 pictures again, with your cluster added. In the side view the drawn bend follows your mass. In the sky view the <strong style={{ color: YOUR_MASS_COLOR }}>gold ring</strong> is the ring for the mass you chose, drawn out when its own Run is pressed, and in the graph the <strong style={{ color: YOUR_MASS_COLOR }}>gold dot</strong> is your mass on the purple curve. The blue and green rings, the blue dot and the green line are exactly as in Part 1. While your mass is on the observed total, the gold ring lies on the green one, so change it to see the gold ring move. <strong>Calculated here from the mass you choose; imagined for the question.</strong>
      </p>
      <LookFor
        items={[
          {
            look: 'the gold ring against the blue and green rings as you move the mass',
            means: `with ${massLabel(mass)} solar masses the gold ring is ${arcsec(c.ringArcseconds)} arcseconds, ${c.againstObserved.reading === 'the same' ? 'the same as' : `${c.againstObserved.reading} than`} the green ring's ${OBSERVED_RING_ARCSECONDS}, and ${c.ringOverVisibleRing.toFixed(2)} times the blue ring.`,
            matters: 'it shows how the ring depends on the mass.',
          },
        ]}
      />
    </CaptionBox>
  )
}



// ---- A schematic for the introduction (drawn for this page; not a photograph, not to scale) ----
// Left: a perfect line-up gives a complete ring. Right: a slightly-off line-up breaks it into arcs and separate images of one galaxy.
export function LineUpSchematic() {
  const W = 560
  const H = 230
  const cxA = 140
  const cxB = 420
  const cy = 118
  const R = 62
  const arc = (cx: number, from: number, to: number) => {
    const a0 = (from * Math.PI) / 180
    const a1 = (to * Math.PI) / 180
    const large = Math.abs(to - from) > 180 ? 1 : 0
    return `M ${cx + R * Math.cos(a0)} ${cy - R * Math.sin(a0)} A ${R} ${R} 0 ${large} 0 ${cx + R * Math.cos(a1)} ${cy - R * Math.sin(a1)}`
  }
  const dot = (cx: number, angle: number, r = R) => ({ x: cx + r * Math.cos((angle * Math.PI) / 180), y: cy - r * Math.sin((angle * Math.PI) / 180) })
  const spotA = dot(cxB, 200, R + 6)
  const spotB = dot(cxB, 280, R - 6)
  return (
    <svg
      width={W}
      height={H}
      viewBox={`0 0 ${W} ${H}`}
      style={{ ...svgStyle, width: W, maxWidth: '100%', backgroundColor: '#0b1020' }}
      role="img"
      aria-label="Two schematic skies side by side. On the left, a perfect line-up gives a complete ring of light round a galaxy cluster. On the right, a slightly-off line-up gives two curved arcs and two separate bright spots, all of the same distant galaxy."
    >
      <defs>
        <radialGradient id="lineup-cluster-glow">
          <stop offset="0%" stopColor="#ede9fe" stopOpacity={1} />
          <stop offset="100%" stopColor="#7c3aed" stopOpacity={0.35} />
        </radialGradient>
      </defs>
      <text x={W / 2} y={18} fill={TEXT_COLOR} fontSize="12" fontWeight="600" textAnchor="middle">
        Two skies, drawn for this page (a schematic, not a photograph)
      </text>
      <line x1={W / 2} y1={34} x2={W / 2} y2={H - 30} stroke="#1e293b" />

      {/* Left: the perfect line-up */}
      <circle cx={cxA} cy={cy} r={R} fill="none" stroke={RAY_COLOR} strokeWidth={7} opacity={0.25} />
      <circle cx={cxA} cy={cy} r={R} fill="none" stroke={RAY_COLOR} strokeWidth={3} />
      <circle cx={cxA} cy={cy} r={11} fill="url(#lineup-cluster-glow)" />
      <text x={cxA} y={cy + 4 + 24} fill={TEXT_COLOR} fontSize="10" textAnchor="middle" {...halo}>
        cluster
      </text>
      <text x={cxA} y={H - 40} fill={RAY_COLOR} fontSize="11" fontWeight="600" textAnchor="middle">
        Perfect line-up: a complete ring
      </text>
      <text x={cxA} y={H - 24} fill={MUTED_COLOR} fontSize="10" textAnchor="middle">
        light arrives from every side
      </text>

      {/* Right: a slightly-off line-up */}
      <circle cx={cxB} cy={cy} r={R} fill="none" stroke="#334155" strokeWidth={1} strokeDasharray="2 4" />
      <path d={arc(cxB, 20, 120)} fill="none" stroke={RAY_COLOR} strokeWidth={9} opacity={0.25} strokeLinecap="round" />
      <path d={arc(cxB, 20, 120)} fill="none" stroke={RAY_COLOR} strokeWidth={4} strokeLinecap="round" />
      <path d={arc(cxB, 205, 235)} fill="none" stroke={RAY_COLOR} strokeWidth={3} strokeLinecap="round" />
      <circle cx={spotA.x} cy={spotA.y} r={4.5} fill={RAY_COLOR} />
      <circle cx={spotB.x} cy={spotB.y} r={4.5} fill={RAY_COLOR} />
      <circle cx={cxB} cy={cy} r={11} fill="url(#lineup-cluster-glow)" />
      <text x={cxB + 4} y={cy - R - 14} fill={RAY_COLOR} fontSize="10" textAnchor="middle" {...halo}>
        arc
      </text>
      <text x={cxB - R - 52} y={cy + 24} fill={RAY_COLOR} fontSize="10" textAnchor="middle" {...halo}>
        separate
      </text>
      <text x={cxB - R - 52} y={cy + 36} fill={RAY_COLOR} fontSize="10" textAnchor="middle" {...halo}>
        images
      </text>
      <text x={cxB} y={H - 40} fill={RAY_COLOR} fontSize="11" fontWeight="600" textAnchor="middle">
        Slightly off: arcs and separate images
      </text>
      <text x={cxB} y={H - 24} fill={MUTED_COLOR} fontSize="10" textAnchor="middle">
        all of the same distant galaxy
      </text>
    </svg>
  )
}
