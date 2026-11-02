import type { ReactNode } from 'react'
import {
  DIFFERENCE_RULER_K,
  EARTH_ORBITAL_SPEED_KM_S,
  MICROWAVE_TEMPERATURE_K,
  PLANCK_DIPOLE_AMPLITUDE_UK,
  PUBLISHED_SPEED_KM_S,
  QUASAR_COUNT,
  QUASAR_DIRECTION_GALACTIC,
  QUASAR_EXPECTED_AMPLITUDE,
  QUASAR_2021_CHANCE,
  QUASAR_OBSERVED_AMPLITUDE,
  QUASAR_OFFSET_DEGREES,
  QUASAR_SIGNIFICANCE,
  COLOUR_FULL_SCALE_K,
  DIPOLE_DIRECTION_GALACTIC,
  MEASURED_SPEED_KM_S,
  SPEED_OF_LIGHT_KM_S,
  SPEED_RULER_KM_S,
  betaFromAmplitude,
  differenceGuessKelvin,
  insideGiveOrTake,
  logFraction,
  pictureOneFigures,
  quasarCmbSeparationDegrees,
  quasarObservedOverExpected,
  skyColourFraction,
  speedFromAmplitudeKmS,
  speedGuessKmS,
  trialFigures,
  trialSkyColourFraction,
} from '../physics/microwaveDipole'
import { CaptionBlock } from './BlackHoleGrowthPictures'
import type { LookFor } from './WideBinariesExperiment'

// Evidence and Imagination, Experiment 7: Picture 1 (the glow in its own frame, what a moving observer meets, the sky map), Picture 2 (how big is it: the temperature difference and the speed, with the learner's two
// guesses) and Picture 3 (the second test, with quasars), with their captions. The wording is Claude's DRAFT of 2026-11-02, for the owner's approval (CLAUDE.md §28.1).
// Every number drawn or written here is read from the physics module (CLAUDE.md §9); this file only draws it (pixel positions are the only arithmetic done here).
// Colours: pink is imagined for the question (Drawing A's trial settings), cyan is calculated here, dashed cyan is calculated by others, green is measured by others, orange and blue tell the warm and cool parts of the sky map apart (stretched colours), yellow is the observer,
// white is always the learner's guess. Nothing here says why the observer's motion changes the temperature (CLAUDE.md §12): that is the tutor's.

const TEXT_COLOR = '#e2e8f0'
const MUTED_COLOR = '#94a3b8'
const CYAN = '#22d3ee'
const GREEN = '#4ade80'
const YELLOW = '#fde047'
const PINK = '#f472b6'
const WARM = '#f97316'
const COOL = '#2563eb'
const NEUTRAL = '#cbd5e1'
const GLOW_ARROW = '#7dd3fc'
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

const k6 = (x: number) => x.toFixed(6)
const k5 = (x: number) => x.toFixed(5)
const n1 = (x: number) => x.toFixed(1)
const n2 = (x: number) => x.toFixed(2)
const km = (x: number) => x.toLocaleString('en-US', { maximumFractionDigits: 2 })

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
      <line x1={fromX} y1={fromY} x2={x + w / 2} y2={y} stroke={YOURS_COLOR} strokeWidth={2} />
      <rect x={x} y={y} width={w} height={h} rx={4} fill="#0b1020" stroke={YOURS_COLOR} strokeWidth={2.5} />
      <SvgLines x={x + w / 2} y={y + 16} lines={lines} fill={YOURS_COLOR} bold size={10} anchor="middle" />
    </g>
  )
}

function Diamond({ cx, cy, r = 8, fill }: { cx: number; cy: number; r?: number; fill: string }) {
  return <polygon points={`${cx},${cy - r} ${cx + r},${cy} ${cx},${cy + r} ${cx - r},${cy}`} fill={fill} stroke="#0b1020" strokeWidth={1.5} />
}

function Arrow({ x1, y1, x2, y2, color, width = 2 }: { x1: number; y1: number; x2: number; y2: number; color: string; width?: number }) {
  const angle = Math.atan2(y2 - y1, x2 - x1)
  const head = 8
  const p1 = `${x2 - head * Math.cos(angle - 0.4)},${y2 - head * Math.sin(angle - 0.4)}`
  const p2 = `${x2 - head * Math.cos(angle + 0.4)},${y2 - head * Math.sin(angle + 0.4)}`
  return (
    <g>
      <line x1={x1} y1={y1} x2={x2} y2={y2} stroke={color} strokeWidth={width} />
      <polygon points={`${x2},${y2} ${p1} ${p2}`} fill={color} />
    </g>
  )
}

// Mix two hex colours: t = 0 gives a, t = 1 gives b.
function mixColour(a: string, b: string, t: number): string {
  const pa = [1, 3, 5].map((i) => parseInt(a.slice(i, i + 2), 16))
  const pb = [1, 3, 5].map((i) => parseInt(b.slice(i, i + 2), 16))
  const c = pa.map((v, i) => Math.round(v + (pb[i] - v) * Math.min(1, Math.max(0, t))))
  return `rgb(${c[0]},${c[1]},${c[2]})`
}
// The sky map's colour for a colour fraction from -1 (cool) to +1 (warm), grey near 0.
function skyColour(fraction: number): string {
  return fraction >= 0 ? mixColour(NEUTRAL, WARM, fraction) : mixColour(NEUTRAL, COOL, -fraction)
}

// ---- Picture 1: the glow in its own frame, what a moving observer meets, and the sky map ----
const P1_W = 760
const P1_H = 830

export function PictureOne({ stage }: { stage: number }) {
  const f = pictureOneFigures()
  const d = f.dipole
  // Part A: the observer sits at (obsX, 100).
  const obsX = 250
  // Part C: an all-sky disk centred on straight ahead; the rim is straight behind.
  const cx = 170
  const cy = 640
  const R = 120
  const rings = Array.from({ length: 61 }, (_, i) => 180 - i * 3) // 180, 177, ..., 0 degrees from the direction of travel
  const barX = 330
  const barY = cy + 8
  const barW = 390
  const barH = 22
  const barSteps = Array.from({ length: 41 }, (_, i) => -1 + i / 20) // -1 (left, cool) up to +1 (right, warm)
  return (
    <svg viewBox={`0 0 ${P1_W} ${P1_H}`} width="100%" style={svgStyle} role="img" aria-label="Picture 1: the microwave glow in its own frame, what a moving observer meets, and a map of the whole sky as that observer measures it">
      <SvgLines x={20} y={24} lines={['A. In the glow’s own frame the glow comes from every direction']} fill={TEXT_COLOR} size={12} bold />
      {[0, 45, 90, 135, 180, 225, 270, 315].map((deg) => {
        const rad = (deg * Math.PI) / 180
        return <Arrow key={deg} x1={obsX + 78 * Math.cos(rad)} y1={100 + 78 * Math.sin(rad)} x2={obsX + 18 * Math.cos(rad)} y2={100 + 18 * Math.sin(rad)} color={GLOW_ARROW} width={2} />
      })}
      <circle cx={obsX} cy={100} r={9} fill={YELLOW} stroke="#0b1020" strokeWidth={1.5} />
      <SvgLines x={obsX} y={196} lines={['The Solar System (the observer)']} fill={YELLOW} size={11} bold anchor="middle" />
      <Arrow x1={obsX + 16} y1={100} x2={obsX + 130} y2={100} color={YELLOW} width={3} />
      <SvgLines x={obsX + 142} y={86} lines={['The direction the Solar System is', 'moving, relative to the glow:', '“straight ahead”']} fill={YELLOW} size={11} />
      <SvgLines x={20} y={50} lines={['Pale blue arrows: microwave light', 'arriving from every direction']} fill={GLOW_ARROW} size={10} />
      <SvgLines x={605} y={72} lines={['Average temperature', 'in this frame:', `${MICROWAVE_TEMPERATURE_K} K in every`, 'direction (measured;', 'the arrows are a sketch)']} fill={TEXT_COLOR} size={11} />

      {stage >= 2 && (
        <g>
          <line x1={20} y1={216} x2={P1_W - 20} y2={216} stroke="#334155" />
          <SvgLines x={20} y={238} lines={['B. What the moving observer meets: the crests of the waves, from straight behind and from straight ahead']} fill={TEXT_COLOR} size={12} bold />
          {/* Behind (left): crests far apart. Ahead (right): crests close together. Exaggerated spacing. */}
          {Array.from({ length: 8 }, (_, i) => 50 + i * 38).map((x) => (
            <line key={`b${x}`} x1={x} y1={262} x2={x} y2={332} stroke={GLOW_ARROW} strokeWidth={2} />
          ))}
          {Array.from({ length: 19 }, (_, i) => 430 + i * 14).map((x) => (
            <line key={`a${x}`} x1={x} y1={262} x2={x} y2={332} stroke={GLOW_ARROW} strokeWidth={2} />
          ))}
          <circle cx={385} cy={297} r={9} fill={YELLOW} stroke="#0b1020" strokeWidth={1.5} />
          <Arrow x1={398} y1={297} x2={424} y2={297} color={YELLOW} width={3} />
          <SvgLines x={385} y={352} lines={['The observer']} fill={YELLOW} size={11} bold anchor="middle" />
          <SvgLines x={20} y={358} lines={['Waves from straight behind: the crests are far apart,', 'so they reach the observer less often.']} fill={TEXT_COLOR} size={11} />
          <SvgLines x={740} y={358} lines={['Waves from straight ahead: the crests are close together,', 'so they reach the observer more often.']} fill={TEXT_COLOR} size={11} anchor="end" />
          <SvgLines x={20} y={400} lines={['The spacing is exaggerated so that you can see it. In the real glow the difference in spacing is far smaller.']} fill={MUTED_COLOR} size={10} />
        </g>
      )}

      {stage >= 3 && (
        <g>
          <line x1={20} y1={420} x2={P1_W - 20} y2={420} stroke="#334155" />
          <SvgLines x={20} y={442} lines={['C. The whole sky as the moving observer measures it (the colours are stretched)']} fill={TEXT_COLOR} size={12} bold />
          {rings.map((angle) => (
            <circle key={angle} cx={cx} cy={cy} r={(angle / 180) * R} fill={skyColour(skyColourFraction(angle))} />
          ))}
          <circle cx={cx} cy={cy} r={R / 2} fill="none" stroke="#0b1020" strokeWidth={1} strokeDasharray="4 3" />
          <circle cx={cx} cy={cy} r={R} fill="none" stroke={MUTED_COLOR} strokeWidth={1.5} />
          <SvgLines x={cx - R} y={cy - R - 10} lines={['Centre: straight ahead (0°)']} fill={WARM} size={11} bold />
          <line x1={cx + R / 2} y1={cy} x2={cx + R + 22} y2={cy - 14} stroke={MUTED_COLOR} strokeWidth={1} />
          <SvgLines x={cx + R + 26} y={cy - 10} lines={['Dashed ring: sideways (90°)']} fill={TEXT_COLOR} size={11} bold />
          <line x1={cx - R * Math.cos(Math.PI / 4)} y1={cy + R * Math.sin(Math.PI / 4)} x2={cx - R - 6} y2={cy + R + 18} stroke={MUTED_COLOR} strokeWidth={1} />
          <SvgLines x={cx - R} y={cy + R + 34} lines={['Outer edge: straight behind (180°)']} fill="#93c5fd" size={11} bold />
          <SvgLines x={barX} y={cy - R + 6} lines={[`Straight ahead: ${k6(d.aheadK)} K`, `Sideways: ${k6(d.sidewaysK)} K`, `Straight behind: ${k6(d.behindK)} K`, `The average is ${MICROWAVE_TEMPERATURE_K} K.`]} fill={TEXT_COLOR} size={11} bold />
          {/* The colour bar, cool on the left and warm on the right. */}
          {barSteps.map((v, i) => (
            <rect key={i} x={barX + (i / 41) * barW} y={barY} width={barW / 41 + 0.6} height={barH} fill={skyColour(v)} />
          ))}
          <rect x={barX} y={barY} width={barW} height={barH} fill="none" stroke={MUTED_COLOR} strokeWidth={1} />
          <SvgLines x={barX} y={barY + barH + 16} lines={['Blue: cooler', 'than the average', `(coolest part: ${k6(d.behindK)} K)`]} fill="#93c5fd" size={10} />
          <SvgLines x={barX + barW / 2} y={barY + barH + 16} lines={['Grey: about', 'the average']} fill={TEXT_COLOR} size={10} anchor="middle" />
          <SvgLines x={barX + barW} y={barY + barH + 16} lines={['Orange: warmer', 'than the average', `(warmest part: ${k6(d.aheadK)} K)`]} fill={WARM} size={10} anchor="end" />
          <SvgLines x={barX} y={barY + barH + 78} lines={['The colours are stretched. The warmest part is only about', `1 part in ${Math.round(f.aheadOneInParts)} above the average. At true scale the whole disk`, 'would look the same colour.']} fill={MUTED_COLOR} size={10} />
          <SvgLines x={20} y={P1_H - 12} lines={['The disk is an imagined map of the sky, centred on straight ahead: the temperatures on it are calculated here.']} fill={MUTED_COLOR} size={10} />
        </g>
      )}
    </svg>
  )
}

// ---- Picture 2: how big is it? ----
const P2_W = 760
const P2_H = 600

export function PictureTwo({ differenceGuessId, speedGuessId }: { differenceGuessId: string | null; speedGuessId: string | null }) {
  const f = pictureOneFigures()
  const d = f.dipole
  const x0 = 60
  const x1 = 700
  const dx = (kelvin: number) => x0 + logFraction(kelvin, DIFFERENCE_RULER_K.min, DIFFERENCE_RULER_K.max) * (x1 - x0)
  const sx = (kmS: number) => x0 + logFraction(kmS, SPEED_RULER_KM_S.min, SPEED_RULER_KM_S.max) * (x1 - x0)
  const diffTicks = [0.00001, 0.0001, 0.001, 0.01, 0.1, 1]
  const speedTicks = [1, 10, 100, 1000, 10000, 100000]
  const planckSpeed = speedFromAmplitudeKmS(PLANCK_DIPOLE_AMPLITUDE_UK.value)
  const yDiff = 120
  const ySpeed = 330
  return (
    <svg viewBox={`0 0 ${P2_W} ${P2_H}`} width="100%" style={svgStyle} role="img" aria-label="Picture 2: two log rulers, the temperature difference between straight ahead and straight behind, and the speed of the Solar System relative to the glow, with the real values and your two guesses, and the measurement they come from">
      <SvgLines x={20} y={24} lines={['A. The difference between the temperature straight ahead and straight behind (a log ruler, in kelvin)']} fill={TEXT_COLOR} size={12} bold />
      <line x1={x0} y1={yDiff} x2={x1} y2={yDiff} stroke={MUTED_COLOR} strokeWidth={2} />
      {diffTicks.map((t) => (
        <g key={t}>
          <line x1={dx(t)} y1={yDiff - 5} x2={dx(t)} y2={yDiff + 5} stroke={MUTED_COLOR} />
          <SvgLines x={dx(t)} y={yDiff + 20} lines={[`${t}`]} fill={MUTED_COLOR} size={10} anchor="middle" />
        </g>
      ))}
      <SvgLines x={dx(d.aheadMinusBehindK)} y={yDiff - 40} lines={['Straight ahead minus straight behind (Picture 1, Part C),', `worked out from the measured speed: ${k5(d.aheadMinusBehindK)} K (${n2(d.aheadMinusBehindK * 1000)} mK)`]} fill={CYAN} size={11} bold anchor="middle" />
      <line x1={dx(d.aheadMinusBehindK)} y1={yDiff - 22} x2={dx(d.aheadMinusBehindK)} y2={yDiff - 8} stroke={CYAN} />
      <SvgLines x={740} y={yDiff - 44} lines={['The average temperature,', `${MICROWAVE_TEMPERATURE_K} K, is far off`, 'the right end of this ruler →']} fill={MUTED_COLOR} size={9} anchor="end" />
      {differenceGuessId !== null && (
        <g>
          <Diamond cx={dx(differenceGuessKelvin(differenceGuessId))} cy={yDiff} r={12} fill={YOURS_COLOR} />
          <GuessBox x={Math.min(Math.max(dx(differenceGuessKelvin(differenceGuessId)) - 70, 20), 540)} y={yDiff + 44} w={140} lines={['YOUR GUESS', `about ${differenceGuessKelvin(differenceGuessId)} K`]} fromX={dx(differenceGuessKelvin(differenceGuessId))} fromY={yDiff + 8} />
        </g>
      )}

      {/* The real dots are drawn after the white diamonds, so a guess close to a real value cannot hide it. */}
      <circle cx={dx(d.aheadMinusBehindK)} cy={yDiff} r={7} fill={CYAN} stroke="#0b1020" strokeWidth={1.5} />

      <line x1={20} y1={216} x2={P2_W - 20} y2={216} stroke="#334155" />
      <SvgLines x={20} y={238} lines={['B. The speed of the Solar System relative to the glow (a log ruler, in kilometres per second)']} fill={TEXT_COLOR} size={12} bold />
      <line x1={x0} y1={ySpeed} x2={x1} y2={ySpeed} stroke={MUTED_COLOR} strokeWidth={2} />
      {speedTicks.map((t) => (
        <g key={t}>
          <line x1={sx(t)} y1={ySpeed - 5} x2={sx(t)} y2={ySpeed + 5} stroke={MUTED_COLOR} />
          <SvgLines x={sx(t)} y={ySpeed + 20} lines={[t.toLocaleString('en-US')]} fill={MUTED_COLOR} size={10} anchor="middle" />
        </g>
      ))}
      <SvgLines x={sx(EARTH_ORBITAL_SPEED_KM_S) - 8} y={ySpeed - 24} lines={['The Earth round the Sun:', `${km(EARTH_ORBITAL_SPEED_KM_S)} km/s (calculated here)`]} fill={CYAN} size={10} anchor="end" />
      <SvgLines x={sx(PUBLISHED_SPEED_KM_S.value) + 4} y={ySpeed - 50} lines={['Measured with Planck:', `${km(PUBLISHED_SPEED_KM_S.value)} ± ${PUBLISHED_SPEED_KM_S.giveOrTake} km/s`]} fill={GREEN} size={11} bold />
      <line x1={sx(PUBLISHED_SPEED_KM_S.value)} y1={ySpeed - 30} x2={sx(PUBLISHED_SPEED_KM_S.value)} y2={ySpeed - 9} stroke={GREEN} />
      <SvgLines x={740} y={ySpeed - 44} lines={['The speed of light,', `${Math.round(SPEED_OF_LIGHT_KM_S).toLocaleString('en-US')} km/s, is far off`, 'the right end of this ruler →']} fill={MUTED_COLOR} size={9} anchor="end" />
      {speedGuessId !== null && (
        <g>
          <Diamond cx={sx(speedGuessKmS(speedGuessId))} cy={ySpeed} r={12} fill={YOURS_COLOR} />
          <GuessBox x={Math.min(Math.max(sx(speedGuessKmS(speedGuessId)) - 70, 20), 540)} y={ySpeed + 44} w={140} lines={['YOUR GUESS', `about ${speedGuessKmS(speedGuessId).toLocaleString('en-US')} km/s`]} fromX={sx(speedGuessKmS(speedGuessId))} fromY={ySpeed + 8} />
        </g>
      )}

      {/* The real dots are drawn after the white diamonds, so a guess close to a real value cannot hide it. */}
      <circle cx={sx(EARTH_ORBITAL_SPEED_KM_S)} cy={ySpeed} r={6} fill={CYAN} stroke="#0b1020" strokeWidth={1.5} />
      <circle cx={sx(PUBLISHED_SPEED_KM_S.value)} cy={ySpeed} r={7} fill={GREEN} stroke="#0b1020" strokeWidth={1.5} />

      <line x1={20} y1={424} x2={P2_W - 20} y2={424} stroke="#334155" />
      <SvgLines x={20} y={446} lines={['C. The measurement the speed is worked out from (Planck, as listed by NASA)']} fill={TEXT_COLOR} size={12} bold />
      <rect x={34} y={458} width={692} height={116} fill="none" stroke={GREEN} strokeWidth={1.5} />
      <SvgLines
        x={46}
        y={478}
        lines={[
          `The size of the warm-to-average difference: ${PLANCK_DIPOLE_AMPLITUDE_UK.value} ± ${PLANCK_DIPOLE_AMPLITUDE_UK.giveOrTake} µK (measured).`,
          `Its direction: l = ${DIPOLE_DIRECTION_GALACTIC.l}°, b = ${DIPOLE_DIRECTION_GALACTIC.b}° (Galactic coordinates, measured).`,
          `Speed worked out from that size (calculated here): ${n2(planckSpeed)} km/s.`,
          `The published speed (measured): ${km(PUBLISHED_SPEED_KM_S.value)} ± ${PUBLISHED_SPEED_KM_S.giveOrTake} km/s.`,
          `${insideGiveOrTake(planckSpeed, PUBLISHED_SPEED_KM_S) ? 'The two speeds agree to within the published give-or-take.' : 'The two speeds differ by more than the published give-or-take.'}`,
        ]}
        fill={TEXT_COLOR}
        size={11}
      />
    </svg>
  )
}

// ---- Picture 3: a second test, with quasars ----
const P3_W = 760
const P3_H = 660

export function PictureThree() {
  const x0 = 60
  const x1 = 700
  const ax = (v: number) => x0 + (v / 0.02) * (x1 - x0)
  const yA = 110
  const ratio = quasarObservedOverExpected()
  // Part B: a zoomed flat chart of Galactic longitude (200 to 300) and latitude (0 to 70).
  const cL0 = 200
  const cL1 = 300
  const cB0 = 0
  const cB1 = 70
  const cX = 60
  const cY = 214
  const cW = 380
  const cH = 266
  const gx = (l: number) => cX + ((l - cL0) / (cL1 - cL0)) * cW
  const gy = (b: number) => cY + cH - ((b - cB0) / (cB1 - cB0)) * cH
  const sep = quasarCmbSeparationDegrees()
  // Part C: a ruler of sigma from 0 to 6.
  const sx = (v: number) => x0 + (v / 6) * (x1 - x0)
  const yC = 590
  const [s26a, s26b, s26c] = QUASAR_SIGNIFICANCE.bashir2026
  const low26 = Math.min(s26a, s26b, s26c)
  const high26 = Math.max(s26a, s26b, s26c)
  return (
    <svg viewBox={`0 0 ${P3_W} ${P3_H}`} width="100%" style={svgStyle} role="img" aria-label="Picture 3: the size of the dipole in the quasar counts against the size expected, the two dipoles' directions on the sky, and how sure three published analyses are">
      <SvgLines x={20} y={24} lines={['A. The size of the dipole in the quasar counts, against the size expected (a plain ruler, numbers quoted)']} fill={TEXT_COLOR} size={12} bold />
      <line x1={x0} y1={yA} x2={x1} y2={yA} stroke={MUTED_COLOR} strokeWidth={2} />
      {[0, 0.005, 0.01, 0.015, 0.02].map((t) => (
        <g key={t}>
          <line x1={ax(t)} y1={yA - 5} x2={ax(t)} y2={yA + 5} stroke={MUTED_COLOR} />
          <SvgLines x={ax(t)} y={yA + 20} lines={[`${t}`]} fill={MUTED_COLOR} size={10} anchor="middle" />
        </g>
      ))}
      <circle cx={ax(QUASAR_EXPECTED_AMPLITUDE)} cy={yA} r={7} fill="#0b1020" stroke={CYAN} strokeWidth={2.5} strokeDasharray="3 2" />
      <SvgLines x={ax(QUASAR_EXPECTED_AMPLITUDE)} y={yA - 44} lines={['Expected from our motion alone', `(calculated by the paper’s authors): about ${QUASAR_EXPECTED_AMPLITUDE}`]} fill={CYAN} size={11} bold anchor="middle" />
      <line x1={ax(QUASAR_EXPECTED_AMPLITUDE)} y1={yA - 22} x2={ax(QUASAR_EXPECTED_AMPLITUDE)} y2={yA - 9} stroke={CYAN} />
      <circle cx={ax(QUASAR_OBSERVED_AMPLITUDE)} cy={yA} r={7} fill={GREEN} stroke="#0b1020" strokeWidth={1.5} />
      <SvgLines x={ax(QUASAR_OBSERVED_AMPLITUDE) + 14} y={yA - 36} lines={['Counted in', `${QUASAR_COUNT.toLocaleString('en-US')} quasars:`, `${QUASAR_OBSERVED_AMPLITUDE} (measured)`]} fill={GREEN} size={11} bold />
      <line x1={ax(QUASAR_OBSERVED_AMPLITUDE)} y1={yA - 22} x2={ax(QUASAR_OBSERVED_AMPLITUDE)} y2={yA - 9} stroke={GREEN} />
      <SvgLines x={x0} y={yA + 46} lines={[`The counted size is ${n2(ratio)} times the expected size (the paper says “over twice as large as expected”).`]} fill={TEXT_COLOR} size={11} />

      <line x1={20} y1={cY - 38} x2={P3_W - 20} y2={cY - 38} stroke="#334155" />
      <SvgLines x={20} y={cY - 16} lines={['B. Where the two dipoles point on the sky (a flat chart, zoomed in; Galactic longitude and latitude, in degrees)']} fill={TEXT_COLOR} size={12} bold />
      <rect x={cX} y={cY} width={cW} height={cH} fill="none" stroke={MUTED_COLOR} strokeWidth={1.5} />
      {[200, 225, 250, 275, 300].map((l) => (
        <g key={l}>
          <line x1={gx(l)} y1={cY} x2={gx(l)} y2={cY + cH} stroke="#334155" />
          <SvgLines x={gx(l)} y={cY + cH + 14} lines={[`l = ${l}°`]} fill={MUTED_COLOR} size={9} anchor="middle" />
        </g>
      ))}
      {[0, 20, 40, 60].map((b) => (
        <g key={b}>
          <line x1={cX} y1={gy(b)} x2={cX + cW} y2={gy(b)} stroke="#334155" />
          <SvgLines x={cX - 6} y={gy(b) + 3} lines={[`b = ${b}°`]} fill={MUTED_COLOR} size={9} anchor="end" />
        </g>
      ))}
      <line x1={gx(DIPOLE_DIRECTION_GALACTIC.l)} y1={gy(DIPOLE_DIRECTION_GALACTIC.b)} x2={gx(QUASAR_DIRECTION_GALACTIC.l)} y2={gy(QUASAR_DIRECTION_GALACTIC.b)} stroke={TEXT_COLOR} strokeWidth={1.5} strokeDasharray="4 3" />
      <circle cx={gx(DIPOLE_DIRECTION_GALACTIC.l)} cy={gy(DIPOLE_DIRECTION_GALACTIC.b)} r={7} fill={GREEN} stroke="#0b1020" strokeWidth={1.5} />
      <rect x={gx(QUASAR_DIRECTION_GALACTIC.l) - 7} y={gy(QUASAR_DIRECTION_GALACTIC.b) - 7} width={14} height={14} fill={GREEN} stroke="#0b1020" strokeWidth={1.5} />
      <SvgLines x={gx(DIPOLE_DIRECTION_GALACTIC.l) - 12} y={gy(DIPOLE_DIRECTION_GALACTIC.b) - 14} lines={['Round dot: the microwave', `dipole (l = ${DIPOLE_DIRECTION_GALACTIC.l}°, b = ${DIPOLE_DIRECTION_GALACTIC.b}°)`]} fill={GREEN} size={10} bold anchor="end" />
      <SvgLines x={gx(QUASAR_DIRECTION_GALACTIC.l) - 12} y={gy(QUASAR_DIRECTION_GALACTIC.b) + 22} lines={['Square: the quasar dipole', `(l = ${QUASAR_DIRECTION_GALACTIC.l}°, b = ${QUASAR_DIRECTION_GALACTIC.b}°)`]} fill={GREEN} size={10} bold anchor="start" />
      <SvgLines x={480} y={cY + 60} lines={[`The two directions are about ${n1(sep)}° apart`, '(calculated here from the two sets of numbers;', `the paper states ${QUASAR_OFFSET_DEGREES}°).`, '', 'The chart is flat and zoomed in, so the', 'angle is worked out on the sphere of the sky,', 'not read off the chart.']} fill={TEXT_COLOR} size={11} />

      <line x1={20} y1={yC - 62} x2={P3_W - 20} y2={yC - 62} stroke="#334155" />
      <SvgLines x={20} y={yC - 42} lines={['C. How sure are three published analyses? (a ruler of sigma, as each source states it)']} fill={TEXT_COLOR} size={12} bold />
      <line x1={x0} y1={yC} x2={x1} y2={yC} stroke={MUTED_COLOR} strokeWidth={2} />
      {[0, 1, 2, 3, 4, 5, 6].map((t) => (
        <g key={t}>
          <line x1={sx(t)} y1={yC - 5} x2={sx(t)} y2={yC + 5} stroke={MUTED_COLOR} />
          <SvgLines x={sx(t)} y={yC + 20} lines={[`${t}σ`]} fill={MUTED_COLOR} size={10} anchor="middle" />
        </g>
      ))}
      <rect x={sx(low26)} y={yC - 6} width={sx(high26) - sx(low26)} height={12} fill={GREEN} fillOpacity={0.45} stroke={GREEN} />
      <SvgLines x={sx(low26)} y={yC - 12} lines={[`2026, a reanalysis of the same data: ${low26}σ to ${high26}σ`]} fill={GREEN} size={10} anchor="start" />
      <circle cx={sx(QUASAR_SIGNIFICANCE.secrest2021)} cy={yC + 30} r={6} fill={GREEN} stroke="#0b1020" strokeWidth={1.5} />
      <SvgLines x={sx(QUASAR_SIGNIFICANCE.secrest2021) - 10} y={yC + 34} lines={[`2021: ${QUASAR_SIGNIFICANCE.secrest2021}σ`]} fill={GREEN} size={10} anchor="end" />
      <Arrow x1={sx(QUASAR_SIGNIFICANCE.secrest2025AtLeast)} y1={yC + 52} x2={sx(6)} y2={yC + 52} color={GREEN} width={3} />
      <SvgLines x={sx(QUASAR_SIGNIFICANCE.secrest2025AtLeast) - 10} y={yC + 56} lines={['2025: “now exceeds 5σ”']} fill={GREEN} size={10} anchor="end" />
    </svg>
  )
}

// ---- Captions ----
function sigmaText(s: number) {
  return `${s}σ`
}

export function pictureOneCaption(stage: number): ReactNode {
  const f = pictureOneFigures()
  const d = f.dipole
  const lookFor: LookFor[] = [
    {
      look: <>The pale blue arrows in Part A, all the same length.</>,
      means: <>In the glow’s own frame the glow has the same average temperature, {MICROWAVE_TEMPERATURE_K} K, from every direction.</>,
      matters: <>This is the starting point. An observer for whom the glow is the same all round would see no pattern at all, so any pattern must come from something about the observer.</>,
    },
    ...(stage >= 2
      ? [
          {
            look: <>The spacing of the crests in Part B: close together on the right, far apart on the left.</>,
            means: <>The same light reaches the moving observer more often from straight ahead (the crests are close) and less often from straight behind (the crests are far apart).</>,
            matters: <>How often waves arrive is the frequency of the light. Part C shows what the observer then measures. How the one leads to the other is for the tutor to explain.</>,
          },
        ]
      : []),
    ...(stage >= 3
      ? [
          {
            look: <>The orange centre and the blue edge of the disk in Part C.</>,
            means: (
              <>
                The sky is warmest straight ahead, {k6(d.aheadK)} K, and coolest straight behind, {k6(d.behindK)} K. The dashed ring (sideways) is about the average: {k6(d.sidewaysK)} K.
              </>
            ),
            matters: <>So the microwave sky is not equally warm in every direction, which is the question this experiment asked. But the differences are tiny.</>,
          },
          {
            look: <>The colour bar beside the disk, and the sentence under it.</>,
            means: <>The warmest part is only about 1 part in {Math.round(f.aheadOneInParts)} above the average, so the colours are stretched far beyond the real size of the difference.</>,
            matters: <>If the disk were drawn at true scale it would look the same colour everywhere. The stretching is only there so that you can see where the warm and cool parts are.</>,
          },
        ]
      : []),
  ]
  return (
    <CaptionBlock
      title="Picture 1"
      intro={
        <>
          Picture 1 builds up in three parts, one stage at a time. It looks at the microwave glow from the point of view of the Solar System. Part A shows the glow in its own frame. Part B (from stage 2) shows what an observer who is moving meets. Part C (from stage 3) is a map of the
          whole sky as that observer measures it. These pictures are calculated and sketched here, so the numbers on them are calculated here from the measured speed and the measured average temperature.
        </>
      }
      bullets={[
        <>
          <strong>Part A:</strong> the <strong>yellow dot</strong> is the Solar System, the observer. The <strong>pale blue arrows</strong> pointing at it are the microwave light that reaches it from every direction. The <strong>long yellow arrow</strong> is the direction the Solar System is moving relative to the glow. “Straight ahead” means straight along that
          arrow, and “straight behind” the opposite way.
        </>,
        ...(stage >= 2
          ? [
              <>
                <strong>Part B:</strong> a side-on sketch of the waves of microwave light. Light travels as waves, a little like ripples on a pond. Each <strong>vertical blue line</strong> marks the top of one wave, called a <strong>crest</strong>. The <strong>yellow dot</strong> is the observer, and its arrow shows that it is
                moving to the right. So the waves on the <strong>right</strong> are the ones it is moving toward: they come from straight ahead. The waves on the <strong>left</strong> are the ones it is moving away from: they come from straight behind. Think of wading into the sea: you meet more waves each minute than
                someone wading out. In the same way, the observer meets the crests on the right more often than the crests on the left. The picture shows “more often” as “closer together”, and “less often” as “farther apart”. The gaps are exaggerated so that you can see them.
              </>,
            ]
          : []),
        ...(stage >= 3
          ? [
              <>
                <strong>Part C:</strong> a map of the whole sky, drawn as a round disk like a <strong>dartboard</strong>. The <strong>bullseye in the centre</strong> is the spot straight ahead, the direction the observer is heading. The further a spot is from the centre, the further round from straight ahead you are
                looking. The <strong>dashed ring</strong> half-way out is looking sideways. The <strong>outer edge</strong> is the spot straight behind. Every direction in the sky has a place on the disk, and all the spots on one ring are the same distance round from straight ahead. Each spot is coloured by how warm the glow is in that
                direction: <strong>orange</strong> means warmer than the average, <strong>blue</strong> means cooler, and <strong>grey</strong> means about the average. The labels beside the disk give the temperature, in kelvin, straight ahead, sideways and straight behind.
              </>,
            ]
          : []),
      ]}
      worked={
        stage >= 3 ? (
          <>
            Straight ahead the disk’s centre reads {k6(d.aheadK)} K and straight behind its rim reads {k6(d.behindK)} K. The difference is {k6(d.aheadK)} − {k6(d.behindK)} = {k6(d.aheadMinusBehindK)} K, which is {n2(d.aheadMinusBehindK * 1000)} mK. A millikelvin (mK) is one thousandth of a kelvin.
          </>
        ) : null
      }
      lookFor={lookFor}
      whereFrom={
        <>
          <strong>Measured:</strong> the average temperature, {MICROWAVE_TEMPERATURE_K} K, and the speed, {PUBLISHED_SPEED_KM_S.value} km/s, both as quoted in a 2025 review (Secrest and colleagues) from Planck, a satellite that measured the microwave sky. <strong>Calculated here:</strong> the temperature in each direction, from the rule for light and motion that you met in Experiment 8, and the
          colours made from them. <strong>Imagined for the question:</strong> the arrows, the wave crests and their spacing, and the disk map’s shape (a sketch of the sky, not a photograph). <strong>Your guess:</strong> there is no white mark in this picture. Your guesses are drawn in Picture 2.
        </>
      }
    />
  )
}

export function pictureTwoCaption(): ReactNode {
  const f = pictureOneFigures()
  const d = f.dipole
  const planckSpeed = speedFromAmplitudeKmS(PLANCK_DIPOLE_AMPLITUDE_UK.value)
  const beta = betaFromAmplitude(PLANCK_DIPOLE_AMPLITUDE_UK.value)
  const fasterThanEarth = PUBLISHED_SPEED_KM_S.value / EARTH_ORBITAL_SPEED_KM_S
  const percentOfLight = (PUBLISHED_SPEED_KM_S.value / SPEED_OF_LIGHT_KM_S) * 100
  const lookFor: LookFor[] = [
    {
      look: <>The cyan dot in Part A, and the white diamond beside it.</>,
      means: (
        <>
          Between straight ahead and straight behind the temperatures differ by {k5(d.aheadMinusBehindK)} K, about {n2(d.aheadMinusBehindK * 1000)} thousandths of a kelvin. Your white diamond is where your guess sits on the same ruler.
        </>
      ),
      matters: <>The glow is not the same temperature everywhere, but the difference is only about 1 part in {Math.round(f.differenceOneInParts)} of the average temperature. A telescope has to be very sensitive to see it.</>,
    },
    {
      look: <>The green dot in Part B, with the Earth’s dot and the arrow for light.</>,
      means: (
        <>
          The measured speed is {km(PUBLISHED_SPEED_KM_S.value)} km/s. That is about {n1(fasterThanEarth)} times the Earth’s speed round the Sun ({km(EARTH_ORBITAL_SPEED_KM_S)} km/s), and about {n2(percentOfLight)} percent of the speed of light ({Math.round(SPEED_OF_LIGHT_KM_S).toLocaleString('en-US')} km/s).
        </>
      ),
      matters: <>It is very fast by everyday standards, and slow beside light, which is why the differences in temperature are so small.</>,
    },
    {
      look: <>The two speeds in Part C.</>,
      means: (
        <>
          The speed worked out here from the size of the warm-to-average difference, {n2(planckSpeed)} km/s, is the same as the published speed, {km(PUBLISHED_SPEED_KM_S.value)} ± {PUBLISHED_SPEED_KM_S.giveOrTake} km/s, to within its give-or-take.
        </>
      ),
      matters: <>The speed is not measured by a speedometer. It is worked out from a temperature pattern, so it matters that the page’s calculation and the published figure agree.</>,
    },
    {
      look: <>The two white diamonds, one in each ruler.</>,
      means: <>They show your two guesses, on the same rulers as the real numbers. Each moves if you had chosen a different button.</>,
      matters: <>You can see by eye how far each guess is from the real value. The page does not mark them right or wrong: the tutor does that after you have looked.</>,
    },
  ]
  return (
    <CaptionBlock
      title="Picture 2"
      intro={
        <>
          Picture 2 has three parts. Part A is a ruler of the difference in temperature between straight ahead and straight behind. Part B is a ruler of the Solar System’s speed relative to the glow. Part C lists the measurement from which the speed is worked out. Both rulers are{' '}
          <em>log rulers</em>: each step of the same length multiplies the number by ten, so a very small number and a very large one fit on one ruler.
        </>
      }
      bullets={[
        <>
          <strong>New words.</strong> The warm-and-cool pattern in Picture 1’s map is called the <strong>dipole</strong> (“two poles”: one warm, one cool). Its <strong>amplitude</strong> is how far the warm pole is above the average. A <strong>millikelvin</strong> (mK) is one thousandth of a kelvin and a <strong>microkelvin</strong> (µK) is one millionth. A number written like {PUBLISHED_SPEED_KM_S.value} ± {PUBLISHED_SPEED_KM_S.giveOrTake} means “about {PUBLISHED_SPEED_KM_S.value}, give or take {PUBLISHED_SPEED_KM_S.giveOrTake}”: the <strong>give-or-take</strong> is the size of the doubt that the people who made the number put on it.
        </>,
        <>
          <strong>Part A:</strong> a ruler for how different the temperatures are, between straight ahead and straight behind, in kelvin. The <strong>cyan dot</strong> is the difference between the two temperatures in Picture 1, Part C: straight ahead minus straight behind, which is {k5(d.aheadMinusBehindK)} K, about {n1(d.aheadMinusBehindK * 1000)} thousandths of a kelvin. Those two temperatures were worked out from the measured speed. The glow’s own average temperature,
          {MICROWAVE_TEMPERATURE_K} K, is much bigger than anything on this ruler, so it does not fit. A note at the right-hand end says so.
        </>,
        <>
          <strong>Part B:</strong> a ruler for how fast the Solar System is moving relative to the glow, in kilometres per second. The <strong>green dot</strong> is the speed that was measured: {km(PUBLISHED_SPEED_KM_S.value)} km/s. The <strong>cyan dot</strong> is the speed of the Earth round the Sun, {km(EARTH_ORBITAL_SPEED_KM_S)} km/s, so that you have something to compare it with: the measured speed is about {n1(fasterThanEarth)} times
          faster. Light is much faster than anything on this ruler, {Math.round(SPEED_OF_LIGHT_KM_S).toLocaleString('en-US')} km/s, so it does not fit. A note at the right-hand end says so.
        </>,
        <>
          <strong>Part C:</strong> the measurement that the speed is worked out from. Planck is a satellite that measured the temperature of the glow all over the sky. The box lists what it found, as NASA lists it: how far the warmest spot is above the average ({PLANCK_DIPOLE_AMPLITUDE_UK.value} µK), where the warmest spot is (two angles, l and b, that name a place in the sky), and the speed that follows from that size ({n2(planckSpeed)} km/s), beside
          the published speed so that you can compare the two.
        </>,
        <>
          <strong>The white diamonds</strong> are always your guesses, each in its own ruler, with a box labelled YOUR GUESS joined to it by a line.
        </>,
      ]}
      worked={
        <>
          The amplitude is {PLANCK_DIPOLE_AMPLITUDE_UK.value} µK, which is {(PLANCK_DIPOLE_AMPLITUDE_UK.value / 1000).toFixed(5)} K. Divide by the average temperature: {(PLANCK_DIPOLE_AMPLITUDE_UK.value / 1000000).toFixed(8)} ÷ {MICROWAVE_TEMPERATURE_K} = {beta.toFixed(7)}. Multiply by the speed of light: {beta.toFixed(7)} × {Math.round(SPEED_OF_LIGHT_KM_S).toLocaleString('en-US')} km/s = {n2(planckSpeed)} km/s.
        </>
      }
      lookFor={lookFor}
      whereFrom={
        <>
          <strong>Measured:</strong> the amplitude, {PLANCK_DIPOLE_AMPLITUDE_UK.value} ± {PLANCK_DIPOLE_AMPLITUDE_UK.giveOrTake} µK, and its direction, by the Planck satellite (a table on NASA’s LAMBDA site, “Planck HFI 2020”); the speed, {PUBLISHED_SPEED_KM_S.value} ± {PUBLISHED_SPEED_KM_S.giveOrTake} km/s, from Planck as quoted in a 2025 review; the average temperature, {MICROWAVE_TEMPERATURE_K} K, from the same review.{' '}
          <strong>Calculated here:</strong> the difference between straight ahead and straight behind, the speed worked out from the amplitude, and the Earth’s speed round the Sun (from this site’s Experiment 11). <strong>Imagined for the question:</strong> nothing in this picture. <strong>Your guess:</strong> the white marks.
        </>
      }
    />
  )
}

export function pictureThreeCaption(): ReactNode {
  const chanceIn10M = Number((QUASAR_2021_CHANCE * 1e7).toPrecision(6)) // the 2021 paper's chance as "N in 10 million"
  const ratio = quasarObservedOverExpected()
  const sep = quasarCmbSeparationDegrees()
  const low26 = Math.min(...QUASAR_SIGNIFICANCE.bashir2026)
  const high26 = Math.max(...QUASAR_SIGNIFICANCE.bashir2026)
  const lookFor: LookFor[] = [
    {
      look: <>The green dot and the dashed cyan circle in Part A.</>,
      means: (
        <>
          The counted size, {QUASAR_OBSERVED_AMPLITUDE}, is {n2(ratio)} times the size expected from our motion alone, about {QUASAR_EXPECTED_AMPLITUDE}. The authors of the 2021 paper describe it as “over twice as large as expected”.
        </>
      ),
      matters: <>If the glow’s pattern and the quasars’ pattern were both made by our motion alone, the two sizes should agree. In this count they do not.</>,
    },
    {
      look: <>The round dot and the square in Part B.</>,
      means: <>The two dipoles point in directions about {n1(sep)}° apart, which the paper calls similar.</>,
      matters: <>The difference is mostly in size, not in direction.</>,
    },
    {
      look: <>The three rows in Part C.</>,
      means: (
        <>
          The 2021 paper gives {sigmaText(QUASAR_SIGNIFICANCE.secrest2021)}. A 2025 review by overlapping authors says the difference “now exceeds 5σ”. A 2026 reanalysis of the same quasars, with three different assumptions about how clustered the quasars are, gives {sigmaText(low26)} to {sigmaText(high26)}, with the lowest,{' '}
          {sigmaText(low26)}, when the clustering points the same way as the motion.
        </>
      ),
      matters: <>The analyses use the same quasars but give different figures for how surprising the difference is, and scientists do not agree on what it means. The page does not choose between them, which is why this part is labelled Contested.</>,
    },
  ]
  return (
    <CaptionBlock
      title="Picture 3"
      intro={
        <>
          Picture 3 shows a second, independent test. A <strong>quasar</strong> is the very bright centre of a very distant galaxy, powered by a black hole that is swallowing gas. If the microwave pattern comes from the Solar System’s motion, then our motion should also make the count of distant objects a little lopsided, in the same direction, and by an amount that can be calculated. Scientists have counted
          {' '}{QUASAR_COUNT.toLocaleString('en-US')} quasars seen by a satellite called WISE to check. In this picture the quasars’ numbers are quoted from papers and not calculated here.
        </>
      }
      bullets={[
        <>
          <strong>New words.</strong> <strong>σ (sigma)</strong> says how unlikely it is that chance alone made a result: a bigger number means chance is less likely. The 2021 paper gives {QUASAR_SIGNIFICANCE.secrest2021}σ as a {chanceIn10M} in 10 million chance (p = {chanceIn10M} × 10⁻⁷), counted one-sided.
        </>,
        <>
          <strong>Part A:</strong> a plain ruler, from 0 to 0.02, for <em>how lopsided</em> the quasar counts are. The quasars were counted all over the sky. If our motion alone makes the counts lopsided, a few more quasars are seen on one side of the sky than on the opposite side. The number on the ruler says how many more, as a fraction of the average count. So {QUASAR_EXPECTED_AMPLITUDE} means about {n1(QUASAR_EXPECTED_AMPLITUDE * 100)} percent more than average on one side
          ({n1(QUASAR_EXPECTED_AMPLITUDE * 1000)} in every 1,000), and {QUASAR_OBSERVED_AMPLITUDE} means about {n1(QUASAR_OBSERVED_AMPLITUDE * 100)} percent more ({n1(QUASAR_OBSERVED_AMPLITUDE * 1000)} in every 1,000). The <strong>dashed cyan circle</strong> is how lopsided the authors of the 2021 paper calculated the counts should be from our motion alone: about {QUASAR_EXPECTED_AMPLITUDE} (the paper rounds it). The <strong>green dot</strong> is how lopsided the counts really are:
          {QUASAR_OBSERVED_AMPLITUDE}, more than twice as much.
        </>,
        <>
          <strong>Part B:</strong> a flat chart of where in the sky the two lopsided patterns point. A place in the sky is named by two angles, <strong>l</strong> and <strong>b</strong> (called Galactic coordinates): l says how far round the sky, and b says how far up or down, a little like longitude and latitude on a map of the Earth. The chart is zoomed in on the small part of the sky where both patterns point. The <strong>round dot</strong> is the direction in which the microwave glow is warmest. The <strong>square</strong>
          is the direction in which the quasar counts are highest. The <strong>dashed line</strong> joins them. They are about {n1(sep)}° apart, which is less than a tenth of the way round the sky.
        </>,
        <>
          <strong>Part C:</strong> a ruler of σ (sigma), which says how sure scientists are that a difference is real and not just chance: the bigger the number, the less likely it is chance. It shows three published answers about the same difference in size. The <strong>dot</strong> is the 2021 paper’s answer, {sigmaText(QUASAR_SIGNIFICANCE.secrest2021)}. The <strong>bar</strong> is the answer of a later team, in 2026, who looked at the same quasars again with three different assumptions about how the quasars are bunched together:
          from {sigmaText(low26)} to {sigmaText(high26)}. The <strong>arrow</strong> is a 2025 review, written by some of the authors of the 2021 paper, which says the difference “now exceeds 5σ”, so the arrow points to the right from 5σ.
        </>,
      ]}
      worked={
        <>
          The counted size divided by the expected size: {QUASAR_OBSERVED_AMPLITUDE} ÷ {QUASAR_EXPECTED_AMPLITUDE} = {n2(ratio)}.
        </>
      }
      lookFor={lookFor}
      whereFrom={
        <>
          <strong>Measured by others:</strong> the quasar counts (the WISE satellite, in the CatWISE2020 catalogue) and the direction of the dipole in them. <strong>Calculated by others:</strong> the expected size, about {QUASAR_EXPECTED_AMPLITUDE} (the 2021 paper’s authors), and the three significances (the 2021 paper, the 2025 review and the 2026 reanalysis). <strong>Calculated here:</strong> the ratio, {n2(ratio)}, and the angle between the two directions, {n1(sep)}°, from the two
          sets of coordinates. <strong>Imagined for the question:</strong> nothing. <strong>Your guess:</strong> this picture has no white mark, because no prediction was about it.
        </>
      }
    />
  )
}

// ---- Drawing A: the whole sky for the learner's trial speed, and the direction they look in ----
const A_W = 760
const A_H = 640
const trialLabel = (speedKmS: number) => `${km(speedKmS)} km/s`

export function TrialDrawing({ speedKmS, angleDegrees }: { speedKmS: number; angleDegrees: number }) {
  const f = trialFigures(speedKmS, angleDegrees)
  const cx = 180
  const cy = 250
  const R = 120
  const rings = Array.from({ length: 61 }, (_, i) => 180 - i * 3)
  const barX = 340
  const barY = 326
  const barW = 380
  const barH = 22
  const barSteps = Array.from({ length: 41 }, (_, i) => -1 + i / 20)
  // The chosen direction is marked on the disk at its distance from the centre, along a fixed line running up and to the right.
  const markR = (angleDegrees / 180) * R
  const markX = cx + markR * Math.cos(-Math.PI / 4)
  const markY = cy + markR * Math.sin(-Math.PI / 4)
  const x0 = 60
  const x1 = 700
  const dx = (kelvin: number) => x0 + logFraction(kelvin, DIFFERENCE_RULER_K.min, DIFFERENCE_RULER_K.max) * (x1 - x0)
  const ticks = [0.00001, 0.0001, 0.001, 0.01, 0.1, 1]
  const yR = 520
  const warmer = f.atAngleMinusAverageK >= 0
  const ratioText = f.isMeasuredSpeed ? 'the same as the real difference' : `${n2(f.differenceOverReal)} times the real difference`
  return (
    <svg viewBox={`0 0 ${A_W} ${A_H}`} width="100%" style={svgStyle} role="img" aria-label="Drawing A: the whole sky for your trial speed, with the temperature in the direction you chose, and the difference between straight ahead and straight behind beside the real one">
      <SvgLines x={20} y={22} lines={[`Your trial: a speed of ${trialLabel(speedKmS)}, looking ${angleDegrees}° from straight ahead.`]} fill={PINK} size={12} bold />
      <SvgLines x={20} y={38} lines={[`The real settings: ${trialLabel(f.real.speedKmS)}, looking straight ahead. Cyan is calculated here, pink is imagined for the question.`]} fill={MUTED_COLOR} size={10} />
      <SvgLines x={20} y={66} lines={['The whole sky at your trial speed (the same colour stretch as Picture 1, cut off at the full colour)']} fill={TEXT_COLOR} size={12} bold />
      {rings.map((angle) => (
        <circle key={angle} cx={cx} cy={cy} r={(angle / 180) * R} fill={skyColour(trialSkyColourFraction(angle, speedKmS))} />
      ))}
      <circle cx={cx} cy={cy} r={R / 2} fill="none" stroke="#0b1020" strokeWidth={1} strokeDasharray="4 3" />
      <circle cx={cx} cy={cy} r={R} fill="none" stroke={MUTED_COLOR} strokeWidth={1.5} />
      <SvgLines x={cx - R} y={cy - R - 10} lines={['Centre: straight ahead (0°)']} fill={WARM} size={11} bold />
      <SvgLines x={cx - R} y={cy + R + 22} lines={['Outer edge: straight behind (180°)']} fill="#93c5fd" size={11} bold />
      <line x1={cx + R / 2} y1={cy + 6} x2={cx + R + 16} y2={cy + 28} stroke={MUTED_COLOR} strokeWidth={1} />
      <SvgLines x={cx + R + 20} y={cy + 32} lines={['Dashed ring: sideways (90°)']} fill={TEXT_COLOR} size={10} bold />
      {/* The learner's chosen direction. */}
      <line x1={markX} y1={markY} x2={cx + 50} y2={cy - R - 22} stroke={PINK} strokeWidth={1.5} />
      <circle cx={markX} cy={markY} r={7} fill="none" stroke={PINK} strokeWidth={3} />
      <circle cx={markX} cy={markY} r={2} fill={PINK} />
      <SvgLines x={cx - R} y={cy - R - 26} lines={[`You are looking here: ${angleDegrees}° from straight ahead`]} fill={PINK} size={10} bold />
      <SvgLines
        x={340}
        y={126}
        lines={[
          `Straight ahead: ${k6(f.trial.aheadK)} K`,
          `Straight behind: ${k6(f.trial.behindK)} K`,
          `Difference (ahead minus behind): ${k5(f.trial.aheadMinusBehindK)} K (${n2(f.trial.aheadMinusBehindK * 1000)} mK)`,
          `At the real speed the difference is ${k5(f.real.aheadMinusBehindK)} K,`,
          `so yours is ${ratioText}.`,
        ]}
        fill={TEXT_COLOR}
        size={11}
        bold
      />
      <SvgLines
        x={340}
        y={214}
        lines={[
          `In the direction you chose (${angleDegrees}° from straight ahead):`,
          `${k6(f.temperatureAtAngleK)} K, which is ${n2(Math.abs(f.atAngleMinusAverageK) * 1000)} mK ${warmer ? 'warmer' : 'cooler'}`,
          `than the average of ${MICROWAVE_TEMPERATURE_K} K.`,
        ]}
        fill={PINK}
        size={11}
        bold
      />
      {barSteps.map((v, i) => (
        <rect key={i} x={barX + (i / 41) * barW} y={barY} width={barW / 41 + 0.6} height={barH} fill={skyColour(v)} />
      ))}
      <rect x={barX} y={barY} width={barW} height={barH} fill="none" stroke={MUTED_COLOR} strokeWidth={1} />
      <SvgLines x={barX} y={barY + barH + 16} lines={['Blue: cooler than the average', `(full colour: ${n2(COLOUR_FULL_SCALE_K * 1000)} mK cooler)`]} fill="#93c5fd" size={10} />
      <SvgLines x={barX + barW} y={barY + barH + 16} lines={['Orange: warmer than the average', `(full colour: ${n2(COLOUR_FULL_SCALE_K * 1000)} mK warmer)`]} fill={WARM} size={10} anchor="end" />
      <SvgLines x={barX + barW / 2} y={barY - 6} lines={['Grey: about the average']} fill={TEXT_COLOR} size={10} anchor="middle" />
      <SvgLines x={barX} y={barY + barH + 52} lines={['A part that differs from the average by more than the full', 'colour is drawn in the full colour.']} fill={MUTED_COLOR} size={10} />

      <line x1={20} y1={436} x2={A_W - 20} y2={436} stroke="#334155" />
      <SvgLines x={20} y={458} lines={['The difference between straight ahead and straight behind (a log ruler, in kelvin; the same ruler as Picture 2, Part A)']} fill={TEXT_COLOR} size={12} bold />
      <line x1={x0} y1={yR} x2={x1} y2={yR} stroke={MUTED_COLOR} strokeWidth={2} />
      {ticks.map((t) => (
        <g key={t}>
          <line x1={dx(t)} y1={yR - 5} x2={dx(t)} y2={yR + 5} stroke={MUTED_COLOR} />
          <SvgLines x={dx(t)} y={yR + 20} lines={[`${t}`]} fill={MUTED_COLOR} size={10} anchor="middle" />
        </g>
      ))}
      <circle cx={dx(f.real.aheadMinusBehindK)} cy={yR} r={7} fill={CYAN} stroke="#0b1020" strokeWidth={1.5} />
      <SvgLines x={dx(f.real.aheadMinusBehindK)} y={yR - 30} lines={['Real settings', `${k5(f.real.aheadMinusBehindK)} K`]} fill={CYAN} size={10} bold anchor="middle" />
      <circle cx={dx(f.trial.aheadMinusBehindK)} cy={yR} r={6} fill={PINK} stroke="#0b1020" strokeWidth={1.5} />
      <SvgLines x={dx(f.trial.aheadMinusBehindK)} y={yR + 44} lines={['Your trial', `${k5(f.trial.aheadMinusBehindK)} K`]} fill={PINK} size={10} bold anchor="middle" />
      <SvgLines x={20} y={A_H - 14} lines={['The pink marks are imagined for the question: a speed and a direction that you chose. They are not measurements.']} fill={MUTED_COLOR} size={10} />
    </svg>
  )
}

export function trialCaption(speedKmS: number, angleDegrees: number): ReactNode {
  const f = trialFigures(speedKmS, angleDegrees)
  const warmer = f.atAngleMinusAverageK >= 0
  const lookFor: LookFor[] = [
    {
      look: <>The colours of the disk, compared with Picture 1, Part C.</>,
      means: f.isMeasuredSpeed ? (
        <>Your trial speed is the measured speed, {km(MEASURED_SPEED_KM_S)} km/s, so the disk is the same as in Picture 1. Pick another speed to see it change.</>
      ) : (
        <>
          At {trialLabel(speedKmS)} the difference between straight ahead and straight behind is {n2(f.trial.aheadMinusBehindK * 1000)} mK, which is {n2(f.differenceOverReal)} times the real {n2(f.real.aheadMinusBehindK * 1000)} mK. The colours use the same stretch as Picture 1, so a bigger difference shows as stronger colours, and a smaller one as paler colours.
        </>
      ),
      matters: <>The size of the difference between the warm side and the cool side depends on the speed. That is why a measured difference can be turned back into a speed, as in Picture 2.</>,
    },
    {
      look: <>The pink dot and the cyan dot on the ruler.</>,
      means: f.isMeasuredSpeed ? (
        <>The two dots sit on top of each other, because your speed is the real one, {k5(f.real.aheadMinusBehindK)} K.</>
      ) : (
        <>
          The cyan dot is the real difference, {k5(f.real.aheadMinusBehindK)} K. The pink dot is your trial’s, {k5(f.trial.aheadMinusBehindK)} K. Your speed is {n2(f.speedOverReal)} times the measured speed, and your difference is {n2(f.differenceOverReal)} times the real difference.
        </>
      ),
      matters: <>You can see how far the difference moves along the ruler when the speed changes. They change together.</>,
    },
    {
      look: <>The pink ring on the disk, and the temperature written beside it.</>,
      means: (
        <>
          Looking {angleDegrees}° from straight ahead at {trialLabel(speedKmS)}, the glow is {k6(f.temperatureAtAngleK)} K: {n2(Math.abs(f.atAngleMinusAverageK) * 1000)} mK {warmer ? 'warmer' : 'cooler'} than the average of {MICROWAVE_TEMPERATURE_K} K.
        </>
      ),
      matters: <>Change the direction and the temperature changes with it: warmest straight ahead, about the average sideways, and coolest straight behind. At the fastest speeds the sideways direction is also a little cooler than the average.</>,
    },
  ]
  return (
    <CaptionBlock
      title="Drawing A"
      intro={
        <>
          Drawing A follows the two settings you chose above. It shows the whole sky as a dartboard-style disk, as in Picture 1, Part C, but for your trial speed, and it marks the direction you chose to look in. Under the disk, a ruler sets your trial’s difference between straight ahead and straight behind beside the real one. It is for trying things out, not a new picture of the real sky.
        </>
      }
      bullets={[
        <>
          <strong>The disk:</strong> the centre is straight ahead, the dashed ring is sideways and the outer edge is straight behind, as in Picture 1. The colours use <em>the same stretch as Picture 1</em>: the full orange or full blue is {n2(COLOUR_FULL_SCALE_K * 1000)} mK from the average. Anything further from the average than that is drawn in the full colour, so at the fastest trial speeds a wide part of the disk is one flat colour.
        </>,
        <>
          <strong>The pink ring on the disk</strong> is the direction you chose to look in, placed at its distance from the centre. The line joins it to its label.
        </>,
        <>
          <strong>The numbers beside the disk</strong> are the temperatures straight ahead and straight behind for your trial speed, their difference, the same difference at the real speed, and the temperature in the direction you chose.
        </>,
        <>
          <strong>The ruler:</strong> a log ruler, where each step of the same length multiplies the number by ten. <strong>The cyan dot</strong> is the real difference (the one in Picture 2, Part A). <strong>The pink dot</strong> is your trial’s, <em>imagined for the question</em>.
        </>,
      ]}
      worked={
        <>
          At your trial speed of {trialLabel(speedKmS)}, the sky straight ahead reads {k6(f.trial.aheadK)} K and straight behind {k6(f.trial.behindK)} K. The difference is {k6(f.trial.aheadK)} − {k6(f.trial.behindK)} = {k6(f.trial.aheadMinusBehindK)} K. Divide by the real difference: {k6(f.trial.aheadMinusBehindK)} ÷ {k6(f.real.aheadMinusBehindK)} = {n2(f.differenceOverReal)}, so your difference is {n2(f.differenceOverReal)} times the real one.
        </>
      }
      lookFor={lookFor}
      whereFrom={
        <>
          <strong>Calculated here:</strong> the cyan dot and the real settings’ numbers, from the measured speed ({km(MEASURED_SPEED_KM_S)} km/s) and the measured average temperature ({MICROWAVE_TEMPERATURE_K} K), and the pink numbers and colours, from the speed and direction you chose with the same rule for light and motion. <strong>Imagined for the question:</strong> the pink marks and the trial speed: they do not say that the Solar System moves like that, and the real sky is the one in Pictures 1 to 3. Your guesses are not drawn here.
        </>
      }
    />
  )
}
