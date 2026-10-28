import type { ReactNode } from 'react'
import {
  KPC_PER_GYR_PER_KM_S,
  PASS_RULER,
  TIME_RULER,
  fallChoiceGyr,
  passChoiceKpc,
  passRulerPosition,
  pictureOne,
  pictureTwo,
  timeRulerPosition,
} from '../physics/localGroupCollision'
import type { FallChoiceId, OrbitTrack, PassChoiceId } from '../physics/localGroupCollision'
import { CaptionBlock } from './BlackHoleGrowthPictures'
import type { LookFor } from './WideBinariesExperiment'

// Frontier and Beyond, Experiment 25: Picture 1 (the fall: a sketch of the two galaxies and a ruler of times) and Picture 2 (the orbit seen from above, and the first pass against the sideways speed), with their captions.
// Every number drawn or written here is read from the physics module (CLAUDE.md §9); this file only draws it. Colours: cyan is calculated here from the 2026 study's sideways speed, orange from the 2025 study's,
// pink and violet are imagined for the question (no sideways motion; a speed that stays the same), and white is always the learner's guess (CLAUDE.md §14).

const TEXT_COLOR = '#e2e8f0'
const MUTED_COLOR = '#94a3b8'
const CYAN = '#22d3ee'
const ORANGE = '#fb923c'
const PINK = '#f472b6'
const VIOLET = '#c084fc'
const MILKY_COLOR = '#60a5fa'
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

// ---- Picture 1 ----
const P1_W = 760
const P1_H = 470

export function PictureOne({ stage, fallGuess }: { stage: number; fallGuess: FallChoiceId | null }) {
  const pic = pictureOne()
  // Panel B: the ruler of times.
  const rx0 = 60
  const rx1 = 700
  const ry = 330
  const xAt = (gyr: number) => rx0 + (rx1 - rx0) * timeRulerPosition(gyr)
  const guessGyr = fallGuess === null ? null : fallChoiceGyr(fallGuess)
  const guessLabel = fallGuess === null ? '' : `about ${guessGyr} billion years`
  return (
    <svg viewBox={`0 0 ${P1_W} ${P1_H}`} style={svgStyle} role="img" aria-label="Picture 1: a sketch of the Milky Way and Andromeda, and a ruler of times for the fall">
      <SvgLines x={20} y={22} lines={['A. The two galaxies (a sketch, not drawn to scale)']} fill={TEXT_COLOR} bold size={12} />
      {/* The Milky Way, Andromeda and their halos. */}
      <circle cx={120} cy={95} r={52} fill="none" stroke={MUTED_COLOR} strokeDasharray="4 4" />
      <circle cx={640} cy={95} r={60} fill="none" stroke={MUTED_COLOR} strokeDasharray="4 4" />
      <circle cx={120} cy={95} r={20} fill={MILKY_COLOR} />
      <circle cx={640} cy={95} r={24} fill={VIOLET} />
      <SvgLines x={120} y={168} lines={['Milky Way']} fill={MILKY_COLOR} bold size={12} anchor="middle" />
      <SvgLines x={640} y={176} lines={['Andromeda (M31)']} fill={VIOLET} bold size={12} anchor="middle" />
      <SvgLines x={120} y={182} lines={['(dashed ring: its halo)']} fill={MUTED_COLOR} size={10} anchor="middle" />
      <SvgLines x={640} y={190} lines={['(dashed ring: its halo)']} fill={MUTED_COLOR} size={10} anchor="middle" />
      {/* The distance. */}
      <line x1={178} y1={95} x2={574} y2={95} stroke={TEXT_COLOR} strokeWidth={1.5} strokeDasharray="2 4" />
      <SvgLines x={376} y={86} lines={[`about ${Math.round(pic.distanceKpc)} kpc apart`]} fill={TEXT_COLOR} bold size={12} anchor="middle" />
      <SvgLines x={376} y={116} lines={[`(about ${n2(pic.distanceMillionLightYears)} million light-years)`]} fill={MUTED_COLOR} size={10} anchor="middle" />
      {/* Stage 2: the approach speed. */}
      {stage >= 2 && (
        <g>
          <line x1={530} y1={140} x2={410} y2={140} stroke={VIOLET} strokeWidth={3} />
          <polygon points="410,134 398,140 410,146" fill={VIOLET} />
          <SvgLines x={470} y={158} lines={[`approaching at about ${Math.round(pic.approachKmS)} km/s`]} fill={VIOLET} bold size={11} anchor="middle" />
        </g>
      )}
      {/* Panel B: the ruler of times (stage 3). */}
      {stage >= 3 && (
        <g>
          <line x1={20} y1={216} x2={P1_W - 20} y2={216} stroke="#334155" />
          <SvgLines x={20} y={240} lines={['B. How long would the fall take? (a ruler of times, on a log scale)']} fill={TEXT_COLOR} bold size={12} />
          <line x1={rx0} y1={ry} x2={rx1} y2={ry} stroke={TEXT_COLOR} strokeWidth={2} />
          {TIME_RULER.ticks.map((t) => (
            <g key={t}>
              <line x1={xAt(t)} y1={ry - 5} x2={xAt(t)} y2={ry + 5} stroke={TEXT_COLOR} />
              <SvgLines x={xAt(t)} y={ry + 20} lines={[String(t)]} fill={MUTED_COLOR} size={10} anchor="middle" />
            </g>
          ))}
          <SvgLines x={(rx0 + rx1) / 2} y={ry + 124} lines={['billions of years (each step is about 3 times the one before)']} fill={MUTED_COLOR} size={10} anchor="middle" />
          {/* The straight fall (imagined: no sideways motion). */}
          <line x1={xAt(pic.straightFallGyr)} y1={ry} x2={xAt(pic.straightFallGyr)} y2={ry + 62} stroke={PINK} strokeWidth={2.5} />
          <circle cx={xAt(pic.straightFallGyr)} cy={ry} r={5} fill={PINK} />
          <SvgLines
            x={xAt(pic.straightFallGyr) - 8}
            y={ry + 78}
            lines={['Straight fall, no sideways motion (imagined):', `${n2(pic.straightFallGyr)} billion years`]}
            fill={PINK}
            bold
            size={10}
            anchor="end"
          />
          {/* The constant speed (imagined: the speed never changes). */}
          <line x1={xAt(pic.constantSpeedGyr)} y1={ry} x2={xAt(pic.constantSpeedGyr)} y2={ry + 62} stroke={VIOLET} strokeWidth={2.5} />
          <circle cx={xAt(pic.constantSpeedGyr)} cy={ry} r={5} fill={VIOLET} />
          <SvgLines
            x={xAt(pic.constantSpeedGyr) + 8}
            y={ry + 78}
            lines={['If the speed stayed the same (imagined):', `${n2(pic.constantSpeedGyr)} billion years`]}
            fill={VIOLET}
            bold
            size={10}
          />
          {/* The learner's guess. */}
          {guessGyr !== null && (
            <g>
              <polygon points={`${xAt(guessGyr) - 6},${ry - 24} ${xAt(guessGyr) + 6},${ry - 24} ${xAt(guessGyr)},${ry - 8}`} fill={YOURS_COLOR} />
              <GuessBox x={Math.min(Math.max(xAt(guessGyr) - 75, 10), P1_W - 160)} y={ry - 80} w={150} lines={['YOUR GUESS', guessLabel]} fromX={xAt(guessGyr)} fromY={ry - 24} />
            </g>
          )}
        </g>
      )}
    </svg>
  )
}

// ---- Picture 2 ----
const P2_W = 900
const P2_H = 540
// Panel A: the orbit, drawn to scale about the Milky Way at the centre.
const AX = 200
const AY = 250
const A_RADIUS = 170
// Panel B: the first pass (vertical, log) against the sideways speed (horizontal, linear).
const BX0 = 470
const BX1 = 740
const BY0 = 70 // the top (1,000 kpc)
const BY1 = 400 // the bottom (1 kpc)
const B_MAX_KM_S = 120

function trackPath(track: OrbitTrack, scale: number): string {
  return track.points.map((q, i) => `${i === 0 ? 'M' : 'L'}${(AX + q.x * scale).toFixed(1)},${(AY - q.y * scale).toFixed(1)}`).join(' ')
}

export function PictureTwo({ stage, passGuess }: { stage: number; passGuess: PassChoiceId | null }) {
  const pic = pictureTwo()
  const scale = A_RADIUS / pic.extentKpc
  const bx = (kmS: number) => BX0 + ((BX1 - BX0) * kmS) / B_MAX_KM_S
  const by = (kpc: number) => BY1 - (BY1 - BY0) * passRulerPosition(kpc)
  const curve = pic.curve.map((c, i) => `${i === 0 ? 'M' : 'L'}${bx(c.sidewaysKmS).toFixed(1)},${by(c.firstPassKpc).toFixed(1)}`).join(' ')
  const guessKpc = passGuess === null ? null : passChoiceKpc(passGuess)
  const first2026 = pic.study2026.firstPass
  const first2025 = pic.study2025.firstPass
  return (
    <svg viewBox={`0 0 ${P2_W} ${P2_H}`} style={svgStyle} role="img" aria-label="Picture 2: the orbit of Andromeda about the Milky Way seen from above, and the first pass against the sideways speed">
      <SvgLines x={20} y={22} lines={['A. The orbit, seen from above (to scale)']} fill={TEXT_COLOR} bold size={12} />
      <rect x={AX - A_RADIUS - 10} y={AY - A_RADIUS - 10} width={2 * A_RADIUS + 20} height={2 * A_RADIUS + 20} fill="none" stroke="#334155" />
      <SvgLines x={AX} y={AY + A_RADIUS + 28} lines={[`The box is ${2 * pic.extentKpc} kpc across.`]} fill={MUTED_COLOR} size={10} anchor="middle" />
      {/* The straight fall (imagined). */}
      <path d={trackPath(pic.straight, scale)} fill="none" stroke={PINK} strokeWidth={2} strokeDasharray="6 4" />
      {/* The 2025 study's orbit (stage 5). */}
      {stage >= 5 && <path d={trackPath(pic.study2025, scale)} fill="none" stroke={ORANGE} strokeWidth={2} />}
      {/* The 2026 study's orbit. */}
      <path d={trackPath(pic.study2026, scale)} fill="none" stroke={CYAN} strokeWidth={2.5} />
      {/* The 20 kpc ring (stage 5), drawn at its true size, which is small. */}
      {stage >= 5 && (
        <g>
          <circle cx={AX} cy={AY} r={pic.ringKpc * scale} fill="none" stroke={TEXT_COLOR} strokeWidth={1.5} strokeDasharray="2 2" />
          <line x1={AX - pic.ringKpc * scale} y1={AY} x2={110} y2={206} stroke={TEXT_COLOR} strokeWidth={1} />
          <SvgLines x={20} y={196} lines={[`dashed ring: ${pic.ringKpc} kpc`, '(the studies call this “merged”)']} fill={TEXT_COLOR} size={10} />
        </g>
      )}
      {/* The Milky Way and where Andromeda is now. */}
      <circle cx={AX} cy={AY} r={4} fill={MILKY_COLOR} />
      <line x1={90} y1={158} x2={AX - 3} y2={AY - 4} stroke={MILKY_COLOR} strokeWidth={1} />
      <SvgLines x={20} y={150} lines={['Milky Way (the centre)']} fill={MILKY_COLOR} bold size={10} />
      <circle cx={AX + pic.study2026.start.x * scale} cy={AY} r={5} fill={VIOLET} />
      <SvgLines x={AX + pic.study2026.start.x * scale + 14} y={AY + 20} lines={['Andromeda now']} fill={VIOLET} bold size={10} anchor="end" />
      {/* The first passes. */}
      <circle cx={AX + first2026.x * scale} cy={AY - first2026.y * scale} r={4} fill={CYAN} stroke="#0b1020" />
      {stage >= 5 && <circle cx={AX + first2025.x * scale} cy={AY - first2025.y * scale} r={4} fill={ORANGE} stroke="#0b1020" />}
      {/* The legend of panel A. */}
      <SvgLines x={20} y={P2_H - 62} lines={['pink dashed: straight fall (imagined)']} fill={PINK} bold size={10} />
      <SvgLines x={20} y={P2_H - 46} lines={[`cyan: ${pic.study2026.sidewaysKmS} km/s sideways (2026 study’s speed)`]} fill={CYAN} bold size={10} />
      {stage >= 5 && <SvgLines x={20} y={P2_H - 30} lines={[`orange: ${pic.study2025.sidewaysKmS} km/s sideways (2025 study’s speed)`]} fill={ORANGE} bold size={10} />}

      {/* Panel B: the first pass against the sideways speed. */}
      <SvgLines x={BX0 - 40} y={22} lines={['B. How close is the first pass? (on its own scale)']} fill={TEXT_COLOR} bold size={12} />
      <line x1={BX0} y1={BY0} x2={BX0} y2={BY1} stroke={TEXT_COLOR} />
      <line x1={BX0} y1={BY1} x2={BX1} y2={BY1} stroke={TEXT_COLOR} />
      {PASS_RULER.ticks.map((t) => (
        <g key={t}>
          <line x1={BX0 - 4} y1={by(t)} x2={BX0} y2={by(t)} stroke={TEXT_COLOR} />
          <line x1={BX0} y1={by(t)} x2={BX1} y2={by(t)} stroke="#1e293b" />
          <SvgLines x={BX0 - 8} y={by(t) + 3} lines={[String(t)]} fill={MUTED_COLOR} size={10} anchor="end" />
        </g>
      ))}
      {[0, 20, 40, 60, 80, 100, 120].map((v) => (
        <g key={v}>
          <line x1={bx(v)} y1={BY1} x2={bx(v)} y2={BY1 + 4} stroke={TEXT_COLOR} />
          <SvgLines x={bx(v)} y={BY1 + 16} lines={[String(v)]} fill={MUTED_COLOR} size={10} anchor="middle" />
        </g>
      ))}
      <SvgLines x={(BX0 + BX1) / 2} y={BY1 + 32} lines={['sideways speed (km/s)']} fill={MUTED_COLOR} size={10} anchor="middle" />
      <SvgLines x={BX0 - 40} y={BY0 - 14} lines={['first pass (kpc, each step about 3 times the one before)']} fill={MUTED_COLOR} size={10} />
      {/* The 2026 give-or-take band (stage 5). */}
      {stage >= 5 && (
        <g>
          <rect x={bx(pic.band.lowKmS)} y={BY0} width={bx(pic.band.highKmS) - bx(pic.band.lowKmS)} height={BY1 - BY0} fill={CYAN} opacity={0.12} />
          <SvgLines x={bx(pic.band.lowKmS) + 3} y={BY0 + 12} lines={['2026 give-or-take', `${n1(pic.band.lowKmS)} to ${n1(pic.band.highKmS)} km/s`]} fill={CYAN} size={9} />
          <SvgLines x={bx(pic.band.highKmS) + 2} y={by(pic.band.highPassKpc) + 16} lines={[`${n1(pic.band.highPassKpc)} kpc`]} fill={CYAN} size={9} />
          <SvgLines x={bx(pic.band.lowKmS) - 4} y={by(pic.band.lowPassKpc) + 3} lines={[`${n1(pic.band.lowPassKpc)} kpc`]} fill={CYAN} size={9} anchor="end" />
          {/* The 20 kpc line. */}
          <line x1={BX0} y1={by(pic.ringKpc)} x2={BX1} y2={by(pic.ringKpc)} stroke={TEXT_COLOR} strokeWidth={1.5} strokeDasharray="2 3" />
          <SvgLines x={BX1 - 4} y={by(pic.ringKpc) + 12} lines={[`${pic.ringKpc} kpc: “merged” (reached at ${n1(pic.sidewaysFor20Kpc)} km/s)`]} fill={TEXT_COLOR} size={9} anchor="end" />
        </g>
      )}
      {/* The line where the orbit stops being bound. */}
      <line x1={bx(pic.unboundKmS)} y1={BY0} x2={bx(pic.unboundKmS)} y2={BY1} stroke={MUTED_COLOR} strokeDasharray="4 4" />
      <SvgLines x={bx(pic.unboundKmS) - 4} y={BY0 + 12} lines={[`${n1(pic.unboundKmS)} km/s:`, 'no longer bound']} fill={MUTED_COLOR} size={9} anchor="end" />
      {/* The curve. */}
      <path d={curve} fill="none" stroke={CYAN} strokeWidth={2.5} />
      <circle cx={bx(pic.study2026.sidewaysKmS)} cy={by(pic.study2026.firstPassKpc)} r={5} fill={CYAN} stroke="#0b1020" />
      <SvgLines x={bx(pic.study2026.sidewaysKmS) + 9} y={by(pic.study2026.firstPassKpc) + 16} lines={[`2026: ${n1(pic.study2026.sidewaysKmS)} km/s, ${n1(pic.study2026.firstPassKpc)} kpc`]} fill={CYAN} bold size={10} />
      {stage >= 5 && (
        <g>
          <circle cx={bx(pic.study2025.sidewaysKmS)} cy={by(pic.study2025.firstPassKpc)} r={5} fill={ORANGE} stroke="#0b1020" />
          <SvgLines x={bx(pic.study2025.sidewaysKmS) - 8} y={by(pic.study2025.firstPassKpc) - 8} lines={[`2025: ${pic.study2025.sidewaysKmS} km/s, ${n1(pic.study2025.firstPassKpc)} kpc`]} fill={ORANGE} bold size={10} anchor="end" />
        </g>
      )}
      {/* The learner's guess for Prediction 2: a white line across the graph at the guessed distance, with its box. */}
      {guessKpc !== null && (
        <g>
          <line x1={BX0} y1={by(guessKpc)} x2={BX1} y2={by(guessKpc)} stroke={YOURS_COLOR} strokeWidth={2} strokeDasharray="8 4" />
          <polygon points={`${BX0 - 14},${by(guessKpc) - 6} ${BX0 - 14},${by(guessKpc) + 6} ${BX0 - 2},${by(guessKpc)}`} fill={YOURS_COLOR} />
          <GuessBox x={BX1 + 12} y={Math.min(Math.max(by(guessKpc) - 22, 40), BY1 - 40)} w={138} lines={['YOUR GUESS', `about ${guessKpc} kpc`]} fromX={BX1} fromY={by(guessKpc)} />
        </g>
      )}
    </svg>
  )
}

// ---- Captions ----
export function pictureOneCaption(stage: number): ReactNode {
  const pic = pictureOne()
  const speedKpcPerGyr = pic.approachKmS * KPC_PER_GYR_PER_KM_S
  const lookFor: LookFor[] = [
    ...(stage >= 1
      ? [
          {
            look: 'the dotted line between the two dots, and its label.',
            means: (
              <>
                The two galaxies are about {Math.round(pic.distanceKpc)} kpc apart. One kpc is about 3,260 light-years, so this is about {n2(pic.distanceMillionLightYears)} million light-years: light, the fastest thing there is, would take about {n2(pic.distanceMillionLightYears)} million
                years to cross it.
              </>
            ),
            matters: 'this is the gap that gravity has to close. Every other number in this experiment starts from this gap, and the straight fall in the next stage crosses exactly this distance.',
          },
        ]
      : []),
    ...(stage >= 3
      ? [
          {
            look: 'the violet mark and the pink mark on the ruler.',
            means: (
              <>
                The violet mark is {n2(pic.constantSpeedGyr)} billion years. That is how long the trip would take if Andromeda kept its present speed of {Math.round(pic.approachKmS)} km/s all the way, which you get by dividing the distance by the speed: {Math.round(pic.distanceKpc)} ÷ {n1(speedKpcPerGyr)} = {n2(pic.constantSpeedGyr)}. The
                pink mark is {n2(pic.straightFallGyr)} billion years. That is how long the trip takes when gravity alone pulls the two galaxies together the whole way, with no sideways motion. The pink time is a little over half the violet time ({n2(pic.straightFallGyr)} ÷ {n2(pic.constantSpeedGyr)} = {n2(pic.straightFallGyr / pic.constantSpeedGyr)}), so the fall is much
                quicker than the steady-speed answer.
              </>
            ),
            matters: (
              <>
                If Andromeda really kept {Math.round(pic.approachKmS)} km/s, the trip would take {n2(pic.constantSpeedGyr)} billion years. It takes only {n2(pic.straightFallGyr)}, so it must go faster than {Math.round(pic.approachKmS)} km/s for part of the way. Today’s speed is not the speed it keeps, so “distance ÷ speed” gives the wrong answer here. Think of a car that is 100
                km from a town and is going 50 km/h now: if it never changed speed, the trip would take 2 hours, but a car that speeds up on the way arrives sooner. The tutor explains why Andromeda’s speed changes.
              </>
            ),
          },
          {
            look: 'the white marker with the box “YOUR GUESS”, against the pink mark.',
            means: 'the white marker is your guess for Prediction 1, drawn on the ruler at the time you guessed. A mark further left is a shorter time and a mark further right is a longer time. The pink mark is the calculated straight fall.',
            matters: 'it lets you compare your own estimate with the calculated time by eye, on the same ruler. The tutor says what that comparison means.',
          },
        ]
      : []),
  ]
  return (
    <CaptionBlock
      title="Picture 1"
      intro="Panel A is a sketch of the two galaxies, not drawn to scale. Panel B, which appears at stage 3, is a ruler of times on a log scale: each step along it is about three times the one before (0.3, 1, 3, 10 and 30 billion years), so that short and long times fit on one picture."
      bullets={[
        <>
          <strong>The blue dot</strong> is the Milky Way and <strong>the violet dot</strong> is Andromeda. <strong>The dashed rings</strong> are their halos, the invisible clouds of dark matter round each galaxy. The dots and rings are much too big for the
          distance between them, so that you can see them.
        </>,
        ...(stage >= 2
          ? [
              <>
                <strong>The violet arrow</strong> is Andromeda’s approach speed, about {Math.round(pic.approachKmS)} km/s, straight towards the Milky Way. It shows only this straight-on part of Andromeda’s motion. (Andromeda also moves sideways. That comes at stage 4.)
              </>,
            ]
          : []),
        ...(stage >= 3
          ? [
              <>
                <strong>The pink marker</strong> is how long a straight fall would take, with gravity alone pulling the two galaxies together the whole way. “No sideways motion” is an imagined case: Andromeda would move only straight at the Milky Way, with no drift across the sky at all, like a ball dropped from a tower, which lands at the foot of the tower, while a ball thrown with a sideways push lands farther out. In reality Andromeda does have a sideways speed (stage 4). <strong>The violet marker</strong> is how long the gap would take to cross if the speed never changed, which
                is an imagined case. <strong>The white marker</strong> and its box are your guess for Prediction 1. Only its position along the ruler matters.
              </>,
            ]
          : []),
      ]}
      worked={
        stage >= 3 ? (
          <>
            One km/s is {KPC_PER_GYR_PER_KM_S.toFixed(4)} kpc per billion years, so {Math.round(pic.approachKmS)} km/s is {Math.round(pic.approachKmS)} × {KPC_PER_GYR_PER_KM_S.toFixed(4)} = {n1(speedKpcPerGyr)} kpc per billion years. At that speed, {Math.round(pic.distanceKpc)} kpc takes{' '}
            {Math.round(pic.distanceKpc)} ÷ {n1(speedKpcPerGyr)} = {n2(pic.constantSpeedGyr)} billion years (the violet marker). The calculation of the straight fall, with gravity alone pulling the two galaxies together the whole way, gives {n2(pic.straightFallGyr)} billion years (the pink marker).
          </>
        ) : null
      }
      lookFor={lookFor}
      whereFrom={
        <>
          <strong>Measured by others:</strong> the distance, from a distance modulus of 24.407 ± 0.032 that both studies use (read in the text of both papers, 2026-10-28). The masses, 1.0 and 1.3 trillion Suns, are the two studies’ halo masses, and their sum, {n1(pic.totalMass / 1e12)} trillion, is used here. The{' '}
          {Math.round(pic.approachKmS)} km/s is not given in either paper: it is a rounded value from the earlier literature (Wikipedia gives “about 110”), and a conversion of the 2026 paper’s own inputs gives about 114. <strong>Calculated here:</strong> both times (the straight fall by the standard
          formula for two points falling together, and the other by distance ÷ speed). <strong>Imagined for the question:</strong> the straight fall (Andromeda does have sideways motion) and the speed that never changes. Your guess is drawn in white and never changes the real picture.
        </>
      }
    />
  )
}

export function pictureTwoCaption(stage: number): ReactNode {
  const pic = pictureTwo()
  const startKpc = pic.study2026.start.x
  const lookFor: LookFor[] = [
    {
      look: 'the cyan path and the pink dashed line in panel A (the map).',
      means: (
        <>
          The pink dashed line is the straight fall: Andromeda heading exactly at the Milky Way. The cyan path is what happens when Andromeda also has the 2026 study’s sideways speed, {n1(pic.study2026.sidewaysKmS)} km/s. Instead of going straight in, it follows a curve, swings past the Milky Way
          at {n1(pic.study2026.firstPassKpc)} kpc (the cyan dot, the closest point, which is the first pass) after {n2(pic.study2026.firstPassGyr as number)} billion years, and carries on out the other side. That first pass is less than a tenth of the {Math.round(startKpc)} kpc it started from ({n1(pic.study2026.firstPassKpc)} ÷ {Math.round(startKpc)} = {n2(pic.study2026.firstPassKpc / startKpc)}), but it is not zero.
        </>
      ),
      matters:
        'a sideways speed is enough to turn a direct hit into a miss, even though it is less than half of the approach speed. Compare a ball dropped from a tower, which lands at its foot, with a ball thrown with a sideways push, which lands farther out. How big the miss is depends on how big the sideways speed is. That is what panel B shows.',
    },
    {
      look: 'the cyan curve in panel B, and the cyan dot on it.',
      means: (
        <>
          To read the graph, pick a sideways speed along the bottom, go straight up to the curve, and read the first-pass distance on the left. The curve climbs to the right: the faster Andromeda moves sideways, the farther away the first pass. The cyan dot is the 2026 speed: {n1(pic.study2026.sidewaysKmS)} km/s gives {n1(pic.study2026.firstPassKpc)} kpc. The
          distances on the left go up by about three times at each step, so the curve climbs steeply.
        </>
      ),
      matters: 'a small change in the sideways speed changes the first-pass distance by a lot. The sideways speed is also the number that is hardest to measure, so how well it is known matters a great deal.',
    },
    {
      look: 'the white dashed line with the box “YOUR GUESS”, and the cyan dot.',
      means: 'the white line is your guess for Prediction 2, drawn across the graph at the distance you guessed. The cyan dot is the calculated first pass for the 2026 speed. A white line above the dot is a larger distance than the calculated one, and a line below it is a smaller distance.',
      matters: 'it lets you compare your own estimate with the calculated first pass by eye, on the same scale. The tutor says what that comparison means.',
    },
    ...(stage >= 5
      ? [
          {
            look: 'the shaded band in panel B, and the two distances beside it.',
            means: (
              <>
                No measurement is exact. The 2026 study gives {n1(pic.study2026.sidewaysKmS)} ± 24.0 km/s, which means the true speed is probably somewhere between {n1(pic.band.lowKmS)} and {n1(pic.band.highKmS)} km/s. That is the shaded band. At its left edge the first pass is {n1(pic.band.lowPassKpc)} kpc, and at its right edge it is {n1(pic.band.highPassKpc)} kpc, which is{' '}
                {n1(pic.band.highPassKpc / pic.band.lowPassKpc)} times as far ({n1(pic.band.highPassKpc)} ÷ {n1(pic.band.lowPassKpc)}).
              </>
            ),
            matters: 'the give-or-take of 24 km/s is about half of the speed itself, and it is enough to put the first pass anywhere from very close to far away. That is how much one hard-to-measure number matters, and it is why the question is hard to settle.',
          },
          {
            look: 'the orange path and dot, against the cyan path and dot.',
            means: (
              <>
                The orange path is for the 2025 study’s sideways speed, {pic.study2025.sidewaysKmS} km/s. It gives a first pass of {n1(pic.study2025.firstPassKpc)} kpc, which is {n1(pic.study2025.firstPassKpc / pic.study2026.firstPassKpc)} times the {n1(pic.study2026.firstPassKpc)} kpc of the 2026 speed ({n1(pic.study2025.firstPassKpc)} ÷ {n1(pic.study2026.firstPassKpc)}). Both paths are worked out in the same way,
                so the only thing that differs between them is the sideways speed.
              </>
            ),
            matters: 'the faster sideways speed of the 2025 study sends Andromeda past the Milky Way farther away. This is the main difference between what the two studies put in. The tutor says what it means for the chance of a merger.',
          },
          {
            look: 'the small dashed ring in the middle of panel A, and the dashed line in panel B.',
            means: (
              <>
                {pic.ringKpc} kpc is the distance that both studies use to say two galaxies have merged: if they come closer than that, they count it. In panel B the curve crosses the {pic.ringKpc} kpc line at a sideways speed of {n1(pic.sidewaysFor20Kpc)} km/s. A slower sideways speed gives a first pass inside the ring, and a faster one gives a first pass outside it. Both the 2026 speed ({n1(pic.study2026.sidewaysKmS)} km/s)
                and the 2025 speed ({pic.study2025.sidewaysKmS} km/s) are faster than {n1(pic.sidewaysFor20Kpc)} km/s, so both first passes are outside the ring.
              </>
            ),
            matters: 'the ring is a rule the studies use for counting a merger. This picture does not calculate whether the galaxies merge. The tutor says what a first pass outside or inside the ring does and does not mean.',
          },
        ]
      : []),
  ]
  return (
    <CaptionBlock
      title="Picture 2"
      intro={`Panel A is a map, seen from above, of the path of Andromeda about the Milky Way, which is at the centre. It is drawn to scale: the box is ${2 * pic.extentKpc} kpc across, so the middle is small. Panel B is a graph on its own scale. Along the bottom is the sideways speed, in km/s, on an ordinary ruler. Up the side is the distance of the first pass, in kpc, on a log ruler: each step is about three times the one before. It appears at stage 4.`}
      bullets={[
        <>
          <strong>The blue dot</strong> is the Milky Way. <strong>The violet dot</strong> is Andromeda now, {Math.round(startKpc)} kpc away. <strong>The cyan path</strong> is the path Andromeda would follow with the sideways speed of the 2026 study, and{' '}
          <strong>the cyan dot</strong> on it is the first pass, the point where the two are closest. <strong>The pink dashed line</strong> is the straight fall, an imagined case with no sideways motion: Andromeda heading exactly at the Milky Way, with no drift across the sky.
        </>,
        ...(stage >= 5
          ? [
              <>
                <strong>The orange path and dot</strong> are the same for the 2025 study’s sideways speed. <strong>The dashed ring</strong> round the Milky Way is {pic.ringKpc} kpc, drawn at its true size, which is small at this scale. <strong>The shaded band</strong> in panel B is the
                2026 study’s give-or-take.
              </>,
            ]
          : []),
        <>
          <strong>The cyan curve in panel B</strong> gives the first pass for every sideways speed, from 1 kpc up to the speed at which the pair is no longer bound, {n1(pic.unboundKmS)} km/s (<strong>the grey dashed line</strong>). Above that speed, in this model, Andromeda would not come back.{' '}
          <strong>The white dashed line</strong> and its box are your guess for Prediction 2. Only its height matters.
        </>,
      ]}
      worked={
        <>
          The first pass for {n1(pic.study2026.sidewaysKmS)} km/s is {n1(pic.study2026.firstPassKpc)} kpc. Andromeda starts {Math.round(startKpc)} kpc away, and {n1(pic.study2026.firstPassKpc)} ÷ {Math.round(startKpc)} = {n2(pic.study2026.firstPassKpc / startKpc)}, so the pass is less than a tenth of the starting distance, but it is not zero.
          {stage >= 5 ? (
            <>
              {' '}For the 2025 speed, {pic.study2025.sidewaysKmS} km/s, the first pass is {n1(pic.study2025.firstPassKpc)} kpc, and {n1(pic.study2025.firstPassKpc)} ÷ {n1(pic.study2026.firstPassKpc)} = {n1(pic.study2025.firstPassKpc / pic.study2026.firstPassKpc)}.
            </>
          ) : null}
        </>
      }
      lookFor={lookFor}
      whereFrom={
        <>
          <strong>Measured by others:</strong> the two sideways speeds, {pic.study2025.sidewaysKmS} km/s (the 2025 study’s “most likely value”) and {n1(pic.study2026.sidewaysKmS)} ± 24.0 km/s (the 2026 study’s), as the studies found them; neither sentence names the frame it is given in. The distance, the masses and the{' '}
          approach speed are those of Picture 1. The {pic.ringKpc} kpc is the studies’ own definition of a merger. <strong>Calculated here:</strong> every path, first pass and time, for two points that pull on each other and nothing else: no other galaxies, no halo size, no dynamical friction. The studies’
          own results come from 100,000 trial runs that include the other galaxies, so the numbers here are not theirs. <strong>Imagined for the question:</strong> the straight fall. Your guess is drawn in white and never changes the real picture.
        </>
      }
    />
  )
}
