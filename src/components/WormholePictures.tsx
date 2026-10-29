import type { ReactNode } from 'react'
import {
  ENERGY_RULER,
  MASS_LANDMARKS,
  MASS_RULER,
  TENSION_AXES,
  bridgeSnapshots,
  energyRulerPosition,
  massChoiceKg,
  massRulerPosition,
  pictureOne,
  pictureRayEndsAtT,
  pictureThree,
  radiusAxisPosition,
  tensionAxisPosition,
  tensionCurve,
  tensionMarks,
} from '../physics/wormholes'
import type { CrossChoiceId, MassChoiceId, TrialPicture } from '../physics/wormholes'
import { CaptionBlock } from './BlackHoleGrowthPictures'
import type { LookFor } from './WideBinariesExperiment'

// Evidence and Imagination, Experiment 1: Picture 1 (the shape), Picture 2 (the simplest wormhole over time) and Picture 3 (the cost), with their captions. The wording is the owner's draft of
// 2026-10-29, approved (CLAUDE.md §28.1). Every number drawn or written here is read from the physics module (CLAUDE.md §9); this file only draws it. Colours: cyan is calculated here, pink is
// imagined for the question (the tunnel, the places, the arrows), yellow is the ray of light (a calculated path of an imagined ray), and white is always the learner's guess (CLAUDE.md §14).

const TEXT_COLOR = '#e2e8f0'
const MUTED_COLOR = '#94a3b8'
const CYAN = '#22d3ee'
const PINK = '#f472b6'
const YELLOW = '#facc15'
const YOURS_COLOR = '#ffffff'

const svgStyle = {
  display: 'block',
  maxWidth: '100%',
  height: 'auto',
  border: '1px solid var(--border-color, #ccc)',
  borderRadius: '8px',
  overflow: 'hidden',
  backgroundColor: '#0b1020',
} as const

const n1 = (x: number) => x.toFixed(1)
const n2 = (x: number) => x.toFixed(2)
const SUPERSCRIPT: Record<string, string> = { '0': '⁰', '1': '¹', '2': '²', '3': '³', '4': '⁴', '5': '⁵', '6': '⁶', '7': '⁷', '8': '⁸', '9': '⁹', '-': '⁻' }
// 4.8 x 10^42, written with a superscript exponent.
function sci(x: number, digits: number = 1): string {
  const exponent = Math.floor(Math.log10(x))
  const mantissa = x / Math.pow(10, exponent)
  return `${mantissa.toFixed(digits)} × 10${String(exponent).split('').map((c) => SUPERSCRIPT[c]).join('')}`
}
function tenPower(x: number): string {
  return `10${String(Math.round(Math.log10(x))).split('').map((c) => SUPERSCRIPT[c]).join('')}`
}

function SvgLines({ x, y, lines, fill, size = 10, bold = false, anchor = 'start' }: { x: number; y: number; lines: string[]; fill: string; size?: number; bold?: boolean; anchor?: 'start' | 'middle' | 'end' }) {
  return (
    <text x={x} y={y} fill={fill} fontSize={size} fontWeight={bold ? 'bold' : 'normal'} textAnchor={anchor} stroke="#0b1020" strokeWidth={3} paintOrder="stroke" strokeLinejoin="round">
      {lines.map((line, i) => (
        <tspan key={i} x={x} dy={i === 0 ? 0 : size + 3}>
          {line}
        </tspan>
      ))}
    </text>
  )
}

// The white box that holds the learner's guess, joined to the guess mark by a line (CLAUDE.md §14).
function GuessBox({ x, y, w, lines, fromX, fromY }: { x: number; y: number; w: number; lines: string[]; fromX: number; fromY: number }) {
  const h = 14 + lines.length * 13
  return (
    <g>
      <line x1={fromX} y1={fromY} x2={x + w / 2} y2={fromY < y ? y : y + h} stroke={YOURS_COLOR} strokeWidth={2} />
      <rect x={x} y={y} width={w} height={h} rx={4} fill="#0b1020" stroke={YOURS_COLOR} strokeWidth={2.5} />
      <SvgLines x={x + w / 2} y={y + 16} lines={lines} fill={YOURS_COLOR} bold size={10} anchor="middle" />
    </g>
  )
}

// ---- Picture 1: the shape ----
const P1_W = 760
const P1_H = 505

export function PictureOne({ stage }: { stage: number }) {
  const pic = pictureOne()
  // Panel B: the outline. Different scales across and up (100 px per metre along, 28 px per metre of radius).
  const cx = 380
  const cy = 350
  const sx = 100
  const sy = 28
  const top = pic.profile.map((p, i) => `${i === 0 ? 'M' : 'L'} ${cx + sx * p.l} ${cy - sy * p.r}`).join(' ')
  const bottom = pic.profile.map((p, i) => `${i === 0 ? 'M' : 'L'} ${cx + sx * p.l} ${cy + sy * p.r}`).join(' ')
  const ticks: number[] = []
  for (let l = -pic.halfLengthM; l <= pic.halfLengthM; l++) ticks.push(l)
  return (
    <svg viewBox={`0 0 ${P1_W} ${P1_H}`} style={svgStyle} role="img" aria-label="Picture 1: a sketch of a tunnel joining two far places, and the outline of a throat one metre in radius">
      <SvgLines x={20} y={20} lines={['A. A wormhole as a tunnel (a sketch, not to scale; everything here is imagined)']} fill={TEXT_COLOR} bold size={12} />
      {/* Two far places. */}
      <ellipse cx={130} cy={120} rx={95} ry={45} fill="#1e293b" stroke={MUTED_COLOR} />
      <ellipse cx={630} cy={120} rx={95} ry={45} fill="#1e293b" stroke={MUTED_COLOR} />
      <SvgLines x={130} y={124} lines={['place A']} fill={MUTED_COLOR} bold size={12} anchor="middle" />
      <SvgLines x={630} y={124} lines={['place B']} fill={MUTED_COLOR} bold size={12} anchor="middle" />
      {/* The tunnel, narrowest in the middle. */}
      <path d="M 225 108 C 300 108 320 115 380 115 C 440 115 460 108 535 108" fill="none" stroke={PINK} strokeWidth={2.5} />
      <path d="M 225 132 C 300 132 320 125 380 125 C 440 125 460 132 535 132" fill="none" stroke={PINK} strokeWidth={2.5} />
      <SvgLines x={226} y={156} lines={['mouth']} fill={PINK} bold size={11} anchor="middle" />
      <SvgLines x={534} y={156} lines={['mouth']} fill={PINK} bold size={11} anchor="middle" />
      <SvgLines x={380} y={152} lines={['throat']} fill={PINK} bold size={11} anchor="middle" />
      <line x1={380} y1={138} x2={380} y2={129} stroke={PINK} strokeWidth={1} />
      <SvgLines x={380} y={172} lines={['the tunnel (the wormhole)']} fill={PINK} size={10} anchor="middle" />
      {/* The way through: short. */}
      <line x1={255} y1={120} x2={496} y2={120} stroke={PINK} strokeWidth={3} />
      <polygon points="496,114 508,120 496,126" fill={PINK} />
      <SvgLines x={380} y={102} lines={['the way through (short)']} fill={PINK} bold size={11} anchor="middle" />
      {/* The way round: long. */}
      <path d="M 130 75 C 130 12 630 12 630 75" fill="none" stroke={PINK} strokeWidth={2.5} strokeDasharray="7 5" />
      <polygon points="624,66 630,80 636,66" fill={PINK} />
      <SvgLines x={380} y={40} lines={['the way round (long)']} fill={PINK} bold size={11} anchor="middle" />
      {/* Panel B: the outline of a throat (stage 2). */}
      {stage >= 2 && (
        <g>
          <line x1={20} y1={196} x2={P1_W - 20} y2={196} stroke="#334155" />
          <SvgLines x={20} y={218} lines={[`B. The outline of a throat ${pic.throatRadiusM} metre in radius (calculated here)`]} fill={TEXT_COLOR} bold size={12} />
          <line x1={cx + sx * -pic.halfLengthM} y1={cy} x2={cx + sx * pic.halfLengthM} y2={cy} stroke={MUTED_COLOR} strokeDasharray="3 4" />
          <path d={top} fill="none" stroke={CYAN} strokeWidth={2.5} />
          <path d={bottom} fill="none" stroke={CYAN} strokeWidth={2.5} />
          {/* The throat: the narrowest circle, seen edge on. */}
          <line x1={cx} y1={cy - sy * pic.throatRadiusM} x2={cx} y2={cy + sy * pic.throatRadiusM} stroke={CYAN} strokeWidth={5} />
          <SvgLines x={cx + 12} y={cy + sy * pic.throatRadiusM + 36} lines={[`throat: radius ${pic.throatRadiusM} m`]} fill={CYAN} bold size={11} />
          {/* The circle three metres along. */}
          <line x1={cx + sx * pic.halfLengthM} y1={cy - sy * pic.radiusAtEndM} x2={cx + sx * pic.halfLengthM} y2={cy + sy * pic.radiusAtEndM} stroke={CYAN} strokeWidth={1.5} strokeDasharray="4 3" />
          <SvgLines x={cx + sx * pic.halfLengthM + 6} y={cy - sy * pic.radiusAtEndM + 14} lines={[`radius ${n2(pic.radiusAtEndM)} m,`, `${pic.halfLengthM} m along`]} fill={CYAN} size={10} />
          {ticks.map((l) => (
            <g key={l}>
              <line x1={cx + sx * l} y1={cy + sy * pic.radiusAtEndM + 4} x2={cx + sx * l} y2={cy + sy * pic.radiusAtEndM + 10} stroke={MUTED_COLOR} />
              <SvgLines x={cx + sx * l} y={cy + sy * pic.radiusAtEndM + 24} lines={[`${l} m`]} fill={MUTED_COLOR} size={10} anchor="middle" />
            </g>
          ))}
          <SvgLines x={cx} y={P1_H - 8} lines={['distance along the tunnel (the two rulers have different scales, so the outline is stretched sideways)']} fill={MUTED_COLOR} size={10} anchor="middle" />
        </g>
      )}
    </svg>
  )
}

// ---- Picture 2: the simplest wormhole, over time ----
const P2_W = 760
const P2_H = 560
const P2_SCALE = 40 // px per horizon radius, the same across and up

export function PictureTwo({ crossGuess }: { crossGuess: CrossChoiceId | null }) {
  const snaps = bridgeSnapshots()
  return (
    <svg viewBox={`0 0 ${P2_W} ${P2_H}`} style={svgStyle} role="img" aria-label="Picture 2: the simplest wormhole, the Einstein-Rosen bridge, at four moments, with a ray of light sent in from the left">
      <SvgLines x={20} y={20} lines={['The simplest wormhole (the Einstein–Rosen bridge) at four moments, with a ray of light sent in from the left']} fill={TEXT_COLOR} bold size={12} />
      {snaps.map((s, i) => {
        const ox = 20 + (i % 2) * 370
        const oy = 34 + Math.floor(i / 2) * 260
        const cx = ox + 175
        const cy = oy + 125
        const top = s.slice.map((p, j) => `${j === 0 ? 'M' : 'L'} ${cx + P2_SCALE * p.distance} ${cy - P2_SCALE * p.radiusFraction}`).join(' ')
        const bottom = s.slice.map((p, j) => `${j === 0 ? 'M' : 'L'} ${cx + P2_SCALE * p.distance} ${cy + P2_SCALE * p.radiusFraction}`).join(' ')
        const rayX = cx + P2_SCALE * s.ray.distance
        const lastX = cx + P2_SCALE * s.slice[s.slice.length - 1].distance
        const isLast = i === snaps.length - 1
        return (
          <g key={s.T}>
            <rect x={ox} y={oy} width={350} height={245} rx={6} fill="none" stroke="#334155" />
            <SvgLines x={ox + 10} y={oy + 18} lines={[`T = ${s.T}${s.T === 0 ? ' (the widest moment)' : ''}`]} fill={TEXT_COLOR} bold size={12} />
            <SvgLines x={ox + 10} y={oy + 33} lines={[`throat radius ${n2(s.throatRadiusFraction)} horizon radii`]} fill={CYAN} bold size={11} />
            <line x1={ox + 8} y1={cy} x2={ox + 342} y2={cy} stroke={MUTED_COLOR} strokeDasharray="3 4" />
            <path d={top} fill="none" stroke={CYAN} strokeWidth={2.5} />
            <path d={bottom} fill="none" stroke={CYAN} strokeWidth={2.5} />
            <line x1={cx} y1={cy - P2_SCALE * s.throatRadiusFraction} x2={cx} y2={cy + P2_SCALE * s.throatRadiusFraction} stroke={CYAN} strokeWidth={5} />
            {s.earlierRays.map((r, j) => (
              <circle key={j} cx={cx + P2_SCALE * r.distance} cy={cy} r={3} fill={YELLOW} opacity={0.45} />
            ))}
            <circle cx={rayX} cy={cy} r={5.5} fill={YELLOW} stroke="#0b1020" strokeWidth={1.5} />
            <SvgLines x={rayX} y={cy - 12} lines={['ray']} fill={YELLOW} bold size={11} anchor="middle" />
            <SvgLines x={ox + 12} y={oy + 238} lines={['left side']} fill={MUTED_COLOR} size={10} />
            <SvgLines x={ox + 338} y={oy + 238} lines={['right side']} fill={MUTED_COLOR} size={10} anchor="end" />
            {/* The learner's guess: a marker only, since a yes or no has no size (CLAUDE.md §14). */}
            {isLast && crossGuess === 'yes' && (
              <g>
                <circle cx={lastX - 6} cy={cy} r={8} fill="none" stroke={YOURS_COLOR} strokeWidth={3} />
                <GuessBox x={cx - 75} y={oy + 192} w={150} lines={['YOUR GUESS', 'yes: comes out here']} fromX={lastX - 6} fromY={cy + 8} />
              </g>
            )}
            {isLast && crossGuess === 'no' && (
              <g>
                <line x1={rayX - 9} y1={cy - 9} x2={rayX + 9} y2={cy + 9} stroke={YOURS_COLOR} strokeWidth={3} />
                <line x1={rayX + 9} y1={cy - 9} x2={rayX - 9} y2={cy + 9} stroke={YOURS_COLOR} strokeWidth={3} />
                <GuessBox x={cx - 75} y={oy + 192} w={150} lines={['YOUR GUESS', 'no: does not come out']} fromX={rayX} fromY={cy + 9} />
              </g>
            )}
          </g>
        )
      })}
      <SvgLines x={20} y={P2_H - 10} lines={['sizes are in horizon radii (the distance from a black hole’s centre to its edge); T is a clock for the picture, not seconds']} fill={MUTED_COLOR} size={10} />
    </svg>
  )
}

// ---- Picture 3: the cost ----
const P3_W = 760
const P3_H = 560

export function PictureThree({ massGuess }: { massGuess: MassChoiceId | null }) {
  const pic = pictureThree()
  const rx0 = 60
  const rx1 = 700
  const ry = 170
  const xAt = (kg: number) => rx0 + (rx1 - rx0) * massRulerPosition(kg)
  const guessKg = massGuess === null ? null : massChoiceKg(massGuess)
  const needX = rx0 + (rx1 - rx0) * pic.rulerPosition
  // Panel B.
  const bx0 = 90
  const bx1 = 700
  const by0 = 305
  const by1 = 505
  const px = (r: number) => bx0 + (bx1 - bx0) * radiusAxisPosition(r)
  const py = (pa: number) => by1 - (by1 - by0) * tensionAxisPosition(pa)
  const curve = tensionCurve(70).map((p, i) => `${i === 0 ? 'M' : 'L'} ${px(p.radiusM)} ${py(p.tensionPa)}`).join(' ')
  const marks = tensionMarks()
  const staggered: Record<string, number> = { car: 118, mountain: 118, moon: 118, earth: 136, jupiter: 118, sun: 136 }
  const yTicks: number[] = []
  for (let e = Math.log10(TENSION_AXES.minPa); e <= Math.log10(TENSION_AXES.maxPa); e += 3) yTicks.push(Math.pow(10, e))
  const xTicks: number[] = []
  for (let e = Math.log10(TENSION_AXES.minRadiusM); e <= Math.log10(TENSION_AXES.maxRadiusM); e += 1) xTicks.push(Math.pow(10, e))
  return (
    <svg viewBox={`0 0 ${P3_W} ${P3_H}`} style={svgStyle} role="img" aria-label="Picture 3: a ruler of masses with the negative mass a one metre throat needs, and the tension against the throat radius">
      <SvgLines x={20} y={20} lines={['A. How much negative mass would a throat 1 metre in radius need? (a ruler of masses, on a log scale)']} fill={TEXT_COLOR} bold size={12} />
      <line x1={rx0} y1={ry} x2={rx1} y2={ry} stroke={TEXT_COLOR} strokeWidth={1.5} />
      {MASS_RULER.ticks.map((t) => (
        <g key={t}>
          <line x1={xAt(t)} y1={ry} x2={xAt(t)} y2={ry + 6} stroke={MUTED_COLOR} />
          <SvgLines x={Math.abs(xAt(t) - needX) < 30 ? xAt(t) - 8 : xAt(t)} y={ry + 18} lines={[`${tenPower(t)} kg`]} fill={MUTED_COLOR} size={10} anchor={Math.abs(xAt(t) - needX) < 30 ? 'end' : 'middle'} />
        </g>
      ))}
      {MASS_LANDMARKS.map((l) => (
        <g key={l.id}>
          <line x1={xAt(l.kg)} y1={ry - 8} x2={xAt(l.kg)} y2={ry + 8} stroke={MUTED_COLOR} strokeWidth={2} />
          <SvgLines x={xAt(l.kg)} y={staggered[l.id]} lines={[l.label]} fill={MUTED_COLOR} size={10} anchor="middle" />
          <line x1={xAt(l.kg)} y1={staggered[l.id] + 4} x2={xAt(l.kg)} y2={ry - 8} stroke="#334155" />
        </g>
      ))}
      {/* The negative mass a 1 metre throat needs. */}
      <line x1={needX} y1={ry} x2={needX} y2={ry + 52} stroke={CYAN} strokeWidth={3} />
      <circle cx={needX} cy={ry} r={5} fill={CYAN} />
      <SvgLines x={needX} y={ry + 68} lines={[`needed for a ${pic.throatRadiusM} m throat: ${sci(pic.negativeMassKg)} kg`, `(${n1(pic.inUnits.jupiters)} Jupiters, about ${Math.round(pic.inUnits.earths)} Earths)`]} fill={CYAN} bold size={11} anchor="middle" />
      {guessKg !== null && (
        <g>
          <polygon points={`${xAt(guessKg)},${ry - 7} ${xAt(guessKg) + 7},${ry} ${xAt(guessKg)},${ry + 7} ${xAt(guessKg) - 7},${ry}`} fill="#0b1020" stroke={YOURS_COLOR} strokeWidth={2.5} />
          <GuessBox
            x={Math.min(Math.max(xAt(guessKg) - 95, 10), P3_W - 200)}
            y={44}
            w={190}
            lines={['YOUR GUESS', `about ${tenPower(guessKg)} kg`]}
            fromX={xAt(guessKg)}
            fromY={ry - 8}
          />
        </g>
      )}
      {/* Panel B: the tension against the throat radius. */}
      <line x1={20} y1={268} x2={P3_W - 20} y2={268} stroke="#334155" />
      <SvgLines x={20} y={290} lines={['B. How big a pull would hold it? (tension at the throat against throat radius, both rulers on a log scale)']} fill={TEXT_COLOR} bold size={12} />
      <rect x={bx0} y={by0} width={bx1 - bx0} height={by1 - by0} fill="none" stroke="#334155" />
      {yTicks.map((t) => (
        <g key={t}>
          <line x1={bx0 - 4} y1={py(t)} x2={bx0} y2={py(t)} stroke={MUTED_COLOR} />
          <SvgLines x={bx0 - 8} y={py(t) + 3} lines={[`${tenPower(t)} Pa`]} fill={MUTED_COLOR} size={9} anchor="end" />
        </g>
      ))}
      {xTicks.map((t) => (
        <g key={t}>
          <line x1={px(t)} y1={by1} x2={px(t)} y2={by1 + 4} stroke={MUTED_COLOR} />
          <SvgLines x={px(t)} y={by1 + 16} lines={[`${tenPower(t)} m`]} fill={MUTED_COLOR} size={9} anchor="middle" />
        </g>
      ))}
      <path d={curve} fill="none" stroke={CYAN} strokeWidth={2.5} />
      {marks.map((m) => (
        <g key={m.id}>
          <circle cx={px(m.radiusM)} cy={py(m.tensionPa)} r={5} fill={CYAN} stroke="#0b1020" strokeWidth={1.5} />
        </g>
      ))}
      <SvgLines x={px(marks[0].radiusM) + 10} y={py(marks[0].tensionPa) - 4} lines={[`${marks[0].radiusM} m throat: ${sci(marks[0].tensionPa)} Pa`]} fill={CYAN} bold size={10} />
      <line x1={px(marks[1].radiusM) - 6} y1={py(marks[1].tensionPa) - 2} x2={px(marks[1].radiusM) - 146} y2={py(marks[1].tensionPa) - 8} stroke={CYAN} strokeWidth={1} />
      <SvgLines
        x={px(marks[1].radiusM) - 390}
        y={py(marks[1].tensionPa) - 12}
        lines={['3 km throat: ' + sci(marks[1].tensionPa) + ' Pa', 'the published statement: the same size as the pressure', 'at the centre of a massive neutron star']}
        fill={CYAN}
        bold
        size={10}
      />
      <SvgLines x={(bx0 + bx1) / 2} y={P3_H - 8} lines={['throat radius']} fill={MUTED_COLOR} size={10} anchor="middle" />
    </svg>
  )
}

// ---- Captions ----
export function pictureOneCaption(stage: number): ReactNode {
  const pic = pictureOne()
  const lookFor: LookFor[] = [
    ...(stage >= 2
      ? [
          {
            look: 'the narrowest circle in panel B, the short thick cyan line.',
            means: `it is the throat. The tunnel is ${pic.throatRadiusM} m in radius there, which is ${2 * pic.throatRadiusM} m across, and it widens in both directions.`,
            matters: 'a traveller needs the throat open, so the whole experiment is about whether it stays open and what would hold it.',
          },
          {
            look: 'the way the walls curve outward on both sides of the throat.',
            means: 'this is called the “flare-out”. The walls bend away from the middle, like the neck of a vase.',
            matters: 'this outward bend is the feature that turns out to be hard to make. You will see why at stage 4.',
          },
        ]
      : []),
    {
      look: 'the two pink arrows in panel A, the way round and the way through.',
      means: 'a tunnel is a shortcut only if the way through is shorter than the way round.',
      matters: 'that is the whole attraction of a wormhole as a means of travel. The picture is imagined, and it says nothing about any real wormhole.',
    },
  ]
  return (
    <CaptionBlock
      title="Picture 1"
      intro="Panel A is a sketch of a tunnel joining two far places, not drawn to scale. Panel B, which appears at stage 2, is the outline of a throat 1 metre in radius, worked out from the mathematics."
      bullets={[
        <>
          <strong>The grey ovals</strong> are two far-apart places, A and B. <strong>The pink tube</strong> between them is the tunnel, with a <strong>mouth</strong> at each end and a <strong>throat</strong>, its narrowest part, in the middle. Everything pink is
          imagined for the question.
        </>,
        <>
          <strong>The pink dashed arrow</strong> is the way round, outside the tunnel. <strong>The pink solid arrow</strong> is the way through.
        </>,
        ...(stage >= 2
          ? [
              <>
                <strong>The cyan outline</strong> in panel B is the shape of the throat, as the radius of a circle against the distance along the tunnel. The grey dashed line is the middle of the tunnel. <strong>The short thick cyan line</strong> is the throat,
                the narrowest circle, seen edge on. <strong>The dashed cyan line</strong> on the right is the circle {pic.halfLengthM} m along. The two rulers have different scales, so the outline is stretched sideways.
              </>,
            ]
          : []),
      ]}
      worked={
        stage >= 2 ? (
          <>
            {pic.halfLengthM} m along the tunnel, the circle’s radius is √({pic.halfLengthM}² + {pic.throatRadiusM}²) = {n2(pic.radiusAtEndM)} m. At the throat itself it is {pic.throatRadiusM} m, the smallest it ever is.
          </>
        ) : null
      }
      lookFor={lookFor}
      whereFrom={
        <>
          <strong>Measured:</strong> nothing here; no wormhole has been seen. <strong>Calculated here:</strong> the outline in panel B, for the simplest throat that Morris and Thorne’s mathematics allows. <strong>Imagined for the question:</strong> the two far
          places, the tunnel in panel A and both arrows.
        </>
      }
    />
  )
}

export function pictureTwoCaption(): ReactNode {
  const snaps = bridgeSnapshots()
  const radii = snaps.map((s) => n2(s.throatRadiusFraction))
  return (
    <CaptionBlock
      title="Picture 2"
      intro="These are four drawings of the same Einstein–Rosen bridge at four moments. T is a clock for the picture, not seconds: 0 is the moment the throat is widest, and at T = 1 it would have shrunk to nothing. The picture stops at 0.99 because at 1 the outline is cut in two."
      bullets={[
        <>
          <strong>The cyan outline</strong> is the bridge, as the radius of a circle against the distance along it, in <strong>horizon radii</strong> (the distance from a black hole’s centre to its edge). The scale is the same across and up. Each drawing is labelled
          with its throat radius, and <strong>the short thick cyan line</strong> is the throat.
        </>,
        <>
          <strong>The yellow dot</strong> is a ray of light sent in from the left side at T = 0. The fainter dots show where it was at the earlier moments. It is a calculated path of an imagined ray.
        </>,
        <>
          <strong>The white box “YOUR GUESS”</strong> is your answer to Prediction 1. A yes or no has no size of its own, so it is drawn only as a marker: a ring on the right side if you said yes, or a cross on the ray if you said no.
        </>,
      ]}
      worked={
        <>
          At T = {snaps[2].T} the throat is {n2(snaps[2].throatRadiusFraction)} of the horizon radius, about half of what it was at T = 0 ({n2(snaps[0].throatRadiusFraction)}).
        </>
      }
      lookFor={[
        {
          look: 'the narrowest part of the outline in the four drawings.',
          means: `the throat shrinks steadily, from ${radii[0]} to ${radii[1]} to ${radii[2]} to ${radii[3]} horizon radii.`,
          matters: 'a tunnel that closes cannot be used for travel.',
        },
        {
          look: 'where the yellow dot is in each drawing.',
          means: `it moves towards the middle but is still on the left side when the throat is nearly shut. In the mathematics it ends on the singularity, where the equations stop working, at T = ${n2(pictureRayEndsAtT())}.`,
          matters: 'this is the picture to compare with Prediction 1.',
        },
      ]}
      whereFrom={
        <>
          <strong>Measured:</strong> nothing; the other side of a real black hole has never been seen. <strong>Calculated here:</strong> the outline at each moment, from the standard description of a black hole’s full solution (the one Fuller and Wheeler drew).{' '}
          <strong>Imagined for the question:</strong> the second mouth, and the ray.
        </>
      }
    />
  )
}

export function pictureThreeCaption(): ReactNode {
  const pic = pictureThree()
  const marks = tensionMarks()
  const w = pic.worked
  return (
    <CaptionBlock
      title="Picture 3"
      intro={`Panel A is a ruler of masses on a log scale: each labelled step along it is ${(MASS_RULER.ticks[1] / MASS_RULER.ticks[0]).toLocaleString('en-US')} times the one before. Panel B is a graph on its own scale: the pull along the tunnel at the throat against the throat’s radius, with both rulers on a log scale.`}
      bullets={[
        <>
          <strong>The grey ticks</strong> are landmarks: a car, a mountain, the Moon, the Earth, Jupiter and the Sun. <strong>The cyan mark</strong> is the negative mass that a throat {pic.throatRadiusM} m in radius needs: {sci(pic.negativeMassKg)} kg, which is{' '}
          {n1(pic.inUnits.jupiters)} Jupiters or about {Math.round(pic.inUnits.earths)} Earths. <strong>The white diamond with the box “YOUR GUESS”</strong> is your answer to Prediction 2.
        </>,
        <>
          <strong>The cyan line in panel B</strong> is the tension at the throat for every radius. <strong>The two cyan dots</strong> are the {marks[0].radiusM} m throat, {sci(marks[0].tensionPa)} Pa, and the {marks[1].radiusM / 1000} km throat, {sci(marks[1].tensionPa)} Pa.
        </>,
      ]}
      worked={
        <>
          M = π × {w.radiusM} m × c² ÷ (2G) = 3.14 × ({w.c.toLocaleString('en-US')})² ÷ (2 × {sci(w.g, 4)}) = {sci(w.kg)} kg.
        </>
      }
      lookFor={[
        {
          look: 'the cyan mark on the ruler.',
          means: `about ${n1(pic.inUnits.jupiters)} Jupiters’ worth of negative mass, about ${Math.round(pic.inUnits.earths)} Earths, for a tunnel ${2 * pic.throatRadiusM} m across.`,
          matters: 'no negative mass of any size has been found beyond a trace, so this is the scale of what would be needed.',
        },
        {
          look: 'the white mark beside it.',
          means: 'your guess.',
          matters: 'it shows how far your intuition was from the number.',
        },
        {
          look: 'the falling line in panel B.',
          means: `a smaller throat needs a bigger tension. At ${marks[1].radiusM / 1000} km the tension equals the pressure at the centre of a massive neutron star.`,
          matters: 'even a large tunnel needs the strongest pulls known.',
        },
      ]}
      whereFrom={
        <>
          <strong>Measured:</strong> nothing about a wormhole. <strong>Calculated here:</strong> the mass and the tension for the simplest throat. The mass formula is derived here, and a secondary source’s formula gives {n2(pic.secondaryJupiters)} Jupiters, which
          is the same order. The {marks[1].radiusM / 1000} km comparison is the published statement of Kuhfittig 2022, repeating Morris and Thorne. <strong>Imagined for the question:</strong> the {pic.throatRadiusM} m wormhole.
        </>
      }
    />
  )
}

// ---- Drawing A: your trial throat and your trial plates (follows the two controls; the guesses do not change it) ----
const A_W = 760
const A_H = 490
const unitText = (t: TrialPicture) =>
  t.inUnits.suns >= 1 ? `${sci(t.inUnits.suns)} Suns` : t.inUnits.jupiters >= 1 ? `${sci(t.inUnits.jupiters)} Jupiters` : t.inUnits.earths >= 0.01 ? `${sci(t.inUnits.earths)} Earths` : `${sci(t.negativeMassKg)} kg`
const radiusText = (m: number) => (m < 1 ? `${m * 1000} millimetre${m * 1000 === 1 ? '' : 's'}` : m >= 1000 ? `${m / 1000} kilometre${m === 1000 ? '' : 's'}` : `${m} metre${m === 1 ? '' : 's'}`)
const gapText = (m: number) => `${m * 1e6} micrometre${m * 1e6 === 1 ? '' : 's'}`
const ratioText = (x: number) => (x >= 1 ? `${sci(x)} times` : `${sci(x)} times (less than 1)`)

export function TrialDrawing({ trial }: { trial: TrialPicture }) {
  const rx0 = 60
  const rx1 = 700
  const ry = 120
  const xm = (kg: number) => rx0 + (rx1 - rx0) * (Math.log10(kg) - Math.log10(MASS_RULER.minKg)) / (Math.log10(MASS_RULER.maxKg) - Math.log10(MASS_RULER.minKg))
  const needX = rx0 + (rx1 - rx0) * trial.massRulerPosition
  const ex0 = 60
  const ex1 = 700
  const ey = 352
  const casX = ex0 + (ex1 - ex0) * trial.casimirEnergyRulerPosition
  const needEX = ex0 + (ex1 - ex0) * trial.neededEnergyRulerPosition
  const labelRight = needX < 380
  return (
    <svg viewBox={`0 0 ${A_W} ${A_H}`} style={svgStyle} role="img" aria-label="Drawing A: the negative mass and tension for your trial throat, and the Casimir energy for your trial plates">
      <SvgLines x={20} y={20} lines={[`Drawing A. Your trial throat, ${radiusText(trial.throatRadiusM)} in radius, and your trial plates, ${gapText(trial.plateGapM)} apart`]} fill={TEXT_COLOR} bold size={13} />
      <SvgLines x={20} y={46} lines={['A1. The negative mass that this throat would need (ruler of masses, log scale)']} fill={TEXT_COLOR} bold size={11} />
      <line x1={rx0} y1={ry} x2={rx1} y2={ry} stroke={TEXT_COLOR} strokeWidth={1.5} />
      {MASS_RULER.ticks.map((t) => (
        <g key={t}>
          <line x1={xm(t)} y1={ry} x2={xm(t)} y2={ry + 6} stroke={MUTED_COLOR} />
          <SvgLines x={xm(t)} y={ry + 18} lines={[`${tenPower(t)} kg`]} fill={MUTED_COLOR} size={10} anchor="middle" />
        </g>
      ))}
      {MASS_LANDMARKS.map((l, i) => (
        <g key={l.id}>
          <line x1={xm(l.kg)} y1={ry - 8} x2={xm(l.kg)} y2={ry + 8} stroke={MUTED_COLOR} strokeWidth={2} />
          <SvgLines x={xm(l.kg)} y={ry - 14 - (i % 2) * 13} lines={[l.label]} fill={MUTED_COLOR} size={10} anchor="middle" />
        </g>
      ))}
      <line x1={needX} y1={ry} x2={needX} y2={ry + 40} stroke={PINK} strokeWidth={3} />
      <circle cx={needX} cy={ry} r={6} fill={PINK} />
      <SvgLines
        x={labelRight ? needX + 8 : needX - 8}
        y={ry + 54}
        lines={[`needed: ${sci(trial.negativeMassKg)} kg`, `(${unitText(trial)})`]}
        fill={PINK}
        bold
        size={11}
        anchor={labelRight ? 'start' : 'end'}
      />
      <SvgLines
        x={20}
        y={ry + 100}
        lines={[
          `Tension at this throat: ${sci(trial.tensionPa)} Pa, which is ${ratioText(trial.tensionOverNeutronStarCentre)} the tension of a 3 km throat.`,
          'The published statement: a 3 km throat has a tension the same size as the pressure at the centre of a massive neutron star.',
        ]}
        fill={PINK}
        size={11}
      />
      <line x1={20} y1={250} x2={A_W - 20} y2={250} stroke="#334155" />
      <SvgLines x={20} y={272} lines={['A2. The Casimir energy of 1 square metre of your plates, against the energy this throat needs (ruler of energies, log scale)']} fill={TEXT_COLOR} bold size={11} />
      <line x1={ex0} y1={ey} x2={ex1} y2={ey} stroke={TEXT_COLOR} strokeWidth={1.5} />
      {ENERGY_RULER.ticks.map((t) => (
        <g key={t}>
          <line x1={ex0 + (ex1 - ex0) * energyRulerPosition(t)} y1={ey} x2={ex0 + (ex1 - ex0) * energyRulerPosition(t)} y2={ey + 6} stroke={MUTED_COLOR} />
          <SvgLines x={ex0 + (ex1 - ex0) * energyRulerPosition(t)} y={ey + 18} lines={[`${tenPower(t)} J`]} fill={MUTED_COLOR} size={10} anchor="middle" />
        </g>
      ))}
      <line x1={casX} y1={ey} x2={casX} y2={ey - 34} stroke={CYAN} strokeWidth={3} />
      <circle cx={casX} cy={ey} r={6} fill={CYAN} />
      <SvgLines x={casX} y={ey - 52} lines={[`Casimir energy: ${sci(trial.casimirJPerM2)} J`]} fill={CYAN} bold size={11} anchor="start" />
      <line x1={needEX} y1={ey} x2={needEX} y2={ey - 34} stroke={PINK} strokeWidth={3} />
      <circle cx={needEX} cy={ey} r={6} fill={PINK} />
      <SvgLines x={needEX} y={ey - 52} lines={[`needed: ${sci(trial.neededJ)} J`]} fill={PINK} bold size={11} anchor="end" />
      <line x1={casX} y1={ey + 38} x2={needEX} y2={ey + 38} stroke={MUTED_COLOR} strokeWidth={1.5} strokeDasharray="5 4" />
      <SvgLines x={(casX + needEX) / 2} y={ey + 56} lines={[`the gap: the energy needed is ${sci(trial.shortfall)} times the Casimir energy`]} fill={TEXT_COLOR} bold size={11} anchor="middle" />
      <SvgLines x={20} y={ey + 84} lines={[`To make up the gap with plates like these you would need ${sci(trial.plateAreaM2)} square metres of them,`, `which is ${sci(trial.fractionOfUniverseSurface)} times the surface of the observable universe.`]} fill={MUTED_COLOR} size={11} />
    </svg>
  )
}

export function trialCaption(trial: TrialPicture): ReactNode {
  return (
    <CaptionBlock
      title="Drawing A"
      intro="This drawing follows the two settings above, and only them. The top half (A1) is for the throat radius. The bottom half (A2) uses both the throat radius and the gap between the plates. Your predictions do not change it, and the real pictures above do not change either."
      bullets={[
        <>
          <strong>The pink mark on the top ruler</strong> is the negative mass a throat {radiusText(trial.throatRadiusM)} in radius would need: {sci(trial.negativeMassKg)} kg, or {unitText(trial)}. The grey ticks are the same landmarks as in Picture 3. It is
          pink because the throat is imagined for the question.
        </>,
        <>
          <strong>The pink line of text</strong> gives the tension at the throat, the pull along the tunnel, and how it compares with the tension of a 3 km throat.
        </>,
        <>
          <strong>The cyan mark on the bottom ruler</strong> is the energy stored between 1 square metre of two plates {gapText(trial.plateGapM)} apart (the Casimir energy), and <strong>the pink mark</strong> is the energy this throat needs. <strong>The dashed line</strong> between
          them is the gap, which you can read as a number of times on the line under it.
        </>,
        <>
          <strong>The last line</strong> says how much plate area it would take to make up the gap, set beside the surface of the observable universe, as a rough illustration.
        </>,
      ]}
      worked={
        <>
          For a throat {radiusText(trial.throatRadiusM)} in radius the energy needed is {sci(trial.neededJ)} J. For plates {gapText(trial.plateGapM)} apart, 1 square metre holds {sci(trial.casimirJPerM2)} J. {sci(trial.neededJ)} ÷ {sci(trial.casimirJPerM2)} = {sci(trial.shortfall)}.
        </>
      }
      lookFor={[
        {
          look: 'the pink mark on the top ruler, when you change the throat radius.',
          means: `it moves right as the throat gets bigger. At ${radiusText(trial.throatRadiusM)} it is ${unitText(trial)}.`,
          matters: 'the bigger the tunnel, the more negative mass it would need, so a tunnel big enough for a person needs far more than a tiny one.',
        },
        {
          look: 'the two marks on the bottom ruler, and the dashed line between them.',
          means: `they are ${sci(trial.shortfall)} times apart. Changing the plate gap moves only the cyan mark, and changing the throat radius moves only the pink one.`,
          matters: 'the only negative energy we know how to make is a tiny fraction of what a tunnel would need, however the plates are set.',
        },
        ...(trial.isPublishedNeutronStarMatch
          ? [
              {
                look: 'the line of text about the tension.',
                means: 'for a 3 km throat the tension is the same size as the pressure at the centre of a massive neutron star, the densest stars known.',
                matters: 'even a throat 3 km in radius needs a pull as strong as anything known to occur in nature.',
              },
            ]
          : []),
      ]}
      whereFrom={
        <>
          <strong>Measured:</strong> that the Casimir effect exists (Lamoreaux, 1997, to within 5 percent, as reported in summaries); nothing about a wormhole. <strong>Calculated here:</strong> the mass, the tension and the energies, with the same formulas as Pictures 1 to 3.{' '}
          <strong>Imagined for the question:</strong> the throat you chose. Its numbers are trial values, not new measurements.
        </>
      }
    />
  )
}
