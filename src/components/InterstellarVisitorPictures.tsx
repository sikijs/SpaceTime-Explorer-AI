import type { ReactNode } from 'react'
import {
  BEND_CHOICES,
  DISTANCE_TICKS_AU,
  SPEED_RULER_MAX_KM_S,
  SPEED_TICKS_KM_S,
  bendGuessHeadingDegrees,
  distanceRulerPosition,
  esaSpeedAtClosestKmS,
  nasaSpeedAtClosestKmS,
  pictureOne,
  pictureTwo,
  speedChoiceKmS,
  speedRulerPosition,
} from '../physics/interstellarVisitor'
import type { BendChoiceId, SpeedChoiceId } from '../physics/interstellarVisitor'
import { CaptionBlock } from './BlackHoleGrowthPictures'
import type { LookFor } from './WideBinariesExperiment'

// Frontier and Beyond, Experiment 24: Picture 1 (the path of 3I/ATLAS past the Sun, seen from above) and Picture 2 (its speed against its distance from the Sun), with their captions.
// Every number drawn or written here is read from the physics module (CLAUDE.md §9); this file only draws it. Colours: cyan is calculated here, orange is estimated from a measurement,
// pink is imagined for the question, yellow is the Sun, and white is always the learner's guess (CLAUDE.md §14).

const TEXT_COLOR = '#e2e8f0'
const MUTED_COLOR = '#94a3b8'
const CALC_COLOR = '#22d3ee'
const SUN_COLOR = '#fde047'
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

function SvgLines({ x, y, lines, fill, size = 10, bold = false, anchor = 'start' }: { x: number; y: number; lines: string[]; fill: string; size?: number; bold?: boolean; anchor?: 'start' | 'middle' | 'end' }) {
  return (
    <text x={x} y={y} fill={fill} fontSize={size} fontWeight={bold ? 'bold' : 'normal'} textAnchor={anchor}>
      {lines.map((line, i) => (
        <tspan key={i} x={x} dy={i === 0 ? 0 : size + 3}>
          {line}
        </tspan>
      ))}
    </text>
  )
}

function Legend({ x, y, items, size = 10 }: { x: number; y: number; items: { lines: string[]; color: string }[]; size?: number }) {
  let at = y
  return (
    <g>
      {items.map((item, i) => {
        const here = at
        at += item.lines.length * (size + 3) + 5
        return <SvgLines key={i} x={x} y={here} lines={item.lines} fill={item.color} bold size={size} />
      })}
    </g>
  )
}

// The white box that holds the learner's guess, joined to the guess mark by a line (CLAUDE.md §14).
function GuessBox({ x, y, w, label, fromX, fromY }: { x: number; y: number; w: number; label: string; fromX: number; fromY: number }) {
  return (
    <g>
      <line x1={fromX} y1={fromY} x2={x} y2={y + 14} stroke={YOURS_COLOR} strokeWidth={2} />
      <rect x={x} y={y} width={w} height={28} rx={4} fill="#0b1020" stroke={YOURS_COLOR} strokeWidth={2.5} />
      <SvgLines x={x + w / 2} y={y + 18} lines={[label]} fill={YOURS_COLOR} bold size={10} anchor="middle" />
    </g>
  )
}

function Arrowhead({ x, y, headingDegrees, size, color }: { x: number; y: number; headingDegrees: number; size: number; color: string }) {
  // The tip is at (x, y); the heading is in degrees anticlockwise from the +x axis, on the page (y up), so the screen's y is flipped.
  const h = (headingDegrees * Math.PI) / 180
  const back = (d: number) => [x - size * Math.cos(h + d), y + size * Math.sin(h + d)]
  const [ax, ay] = back(0.4)
  const [bx, by] = back(-0.4)
  return <polygon points={`${x},${y} ${ax},${ay} ${bx},${by}`} fill={color} />
}

// ---- Number formats (display only) ----
function n1(x: number): string {
  return x.toFixed(1)
}
function n2(x: number): string {
  return x.toFixed(2)
}

// ---- Picture 1: the path from above the Sun ----
const P1_W = 560
const P1_H = 455
const SCALE = 22 // pixels per AU
const CX = 190
const CY = 318

export function PictureOne({ stage, bendGuess }: { stage: number; bendGuess: BendChoiceId | null }) {
  const pic = pictureOne()
  const px = (x: number) => CX + SCALE * x
  const py = (y: number) => CY - SCALE * y
  const line = (pts: { x: number; y: number }[]) => pts.map((p) => `${px(p.x)},${py(p.y)}`).join(' ')
  const inPath = pic.path.slice(0, pic.closestIndex + 1)
  const outPath = pic.path.slice(pic.closestIndex)
  const closest = pic.path[pic.closestIndex]
  const exit = pic.path[pic.path.length - 1]
  const ex = px(exit.x)
  const ey = py(exit.y)
  const dirPoint = (headingDeg: number, len: number) => {
    const h = (headingDeg * Math.PI) / 180
    return { x: ex + len * Math.cos(h), y: ey - len * Math.sin(h) }
  }
  const dashedEnd = dirPoint(pic.headingInDegrees, 58)
  const outEnd = dirPoint(pic.headingOutDegrees, 58)
  const arcR = 38
  const arcA = dirPoint(pic.headingInDegrees, arcR)
  const arcB = dirPoint(pic.headingOutDegrees, arcR)
  const guessHeading = bendGuess !== null ? bendGuessHeadingDegrees(bendGuess) : null
  const guessEnd = guessHeading !== null ? dirPoint(guessHeading, 64) : null
  // Travel arrow on the incoming half of the path.
  const mid = pic.path[Math.floor(pic.closestIndex / 2)]
  const next = pic.path[Math.floor(pic.closestIndex / 2) + 1]
  const travelHeading = (Math.atan2(next.y - mid.y, next.x - mid.x) * 180) / Math.PI
  const legend: { lines: string[]; color: string }[] = [
    { lines: ['yellow dot: the Sun, at the centre'], color: SUN_COLOR },
    { lines: ['grey circles: the orbits of Earth, Mars and Jupiter, for scale (1 AU is the Earth’s distance from the Sun)'], color: MUTED_COLOR },
    ...(stage >= 2 ? [{ lines: ['cyan line: the path of 3I/ATLAS, calculated from its published orbit (the arrow shows which way it travels)'], color: CALC_COLOR }] : []),
    ...(stage >= 5
      ? [
          { lines: ['dashed cyan line: the way it was heading before it reached the Sun; cyan arrow: the way it leaves;', 'the angle between them is the bend'], color: CALC_COLOR },
        ]
      : []),
  ]
  const label = bendGuess !== null ? BEND_CHOICES.find((c) => c.id === bendGuess)!.label : ''
  return (
    <svg viewBox={`0 0 ${P1_W} ${P1_H}`} style={svgStyle} role="img" aria-label="Picture 1: the path of 3I/ATLAS past the Sun, seen from above, with the orbits of Earth, Mars and Jupiter for scale">
      <text x={14} y={20} fill={TEXT_COLOR} fontSize={13} fontWeight="bold">
        Picture 1: the path of 3I/ATLAS past the Sun, seen from above
      </text>
      <Legend x={14} y={38} items={legend} size={9} />

      {pic.planets.map((p, i) => {
        // The labels sit at different angles round the circles (upper left, left, lower left) so that they do not run into each other.
        const angle = [140, 180, 220][i % 3]
        const a = (angle * Math.PI) / 180
        const lx = CX + SCALE * p.au * Math.cos(a)
        const ly = CY - SCALE * p.au * Math.sin(a)
        return (
          <g key={p.name}>
            <circle cx={CX} cy={CY} r={SCALE * p.au} fill="none" stroke={MUTED_COLOR} strokeWidth={1} strokeDasharray="3 4" />
            <text x={lx - 3} y={ly + 3} fill={MUTED_COLOR} fontSize={8} textAnchor="end">
              {p.name}
            </text>
          </g>
        )
      })}
      <circle cx={CX} cy={CY} r={7} fill={SUN_COLOR} />
      <text x={CX} y={CY + 19} fill={SUN_COLOR} fontSize={10} fontWeight="bold" textAnchor="middle">
        Sun
      </text>

      {stage >= 2 && <polyline points={line(inPath)} fill="none" stroke={CALC_COLOR} strokeWidth={2.5} />}
      {stage >= 2 && <Arrowhead x={px(mid.x)} y={py(mid.y)} headingDegrees={travelHeading} size={9} color={CALC_COLOR} />}
      {stage >= 3 && (
        <g>
          <line x1={CX} y1={CY} x2={px(closest.x)} y2={py(closest.y)} stroke={CALC_COLOR} strokeWidth={1} strokeDasharray="2 3" />
          <circle cx={px(closest.x)} cy={py(closest.y)} r={5} fill={CALC_COLOR} stroke="#0b1020" strokeWidth={1.5} />
          <SvgLines x={px(closest.x) + 10} y={py(closest.y) - 4} lines={['closest approach:', `${n2(pic.closestApproachAu)} AU from the Sun`]} fill={CALC_COLOR} bold size={9} />
        </g>
      )}
      {stage >= 4 && <polyline points={line(outPath)} fill="none" stroke={CALC_COLOR} strokeWidth={2.5} />}
      {stage >= 5 && (
        <g>
          <line x1={ex} y1={ey} x2={dashedEnd.x} y2={dashedEnd.y} stroke={CALC_COLOR} strokeWidth={1.5} strokeDasharray="4 3" />
          <line x1={ex} y1={ey} x2={outEnd.x} y2={outEnd.y} stroke={CALC_COLOR} strokeWidth={2.5} />
          <Arrowhead x={outEnd.x} y={outEnd.y} headingDegrees={pic.headingOutDegrees} size={9} color={CALC_COLOR} />
          <path d={`M ${arcA.x} ${arcA.y} A ${arcR} ${arcR} 0 0 0 ${arcB.x} ${arcB.y}`} fill="none" stroke={CALC_COLOR} strokeWidth={1.5} />
          <SvgLines x={ex - 14} y={ey - 34} lines={[`bend: ${n1(pic.bendDegrees)} degrees`]} fill={CALC_COLOR} bold size={10} anchor="end" />
        </g>
      )}
      {stage >= 5 && guessEnd !== null && guessHeading !== null && (
        <g>
          <line x1={ex} y1={ey} x2={guessEnd.x} y2={guessEnd.y} stroke={YOURS_COLOR} strokeWidth={4} />
          <Arrowhead x={guessEnd.x} y={guessEnd.y} headingDegrees={guessHeading} size={11} color={YOURS_COLOR} />
          <GuessBox x={330} y={150} w={215} label={`YOUR GUESS: ${label}`} fromX={guessEnd.x} fromY={guessEnd.y} />
        </g>
      )}
    </svg>
  )
}

// ---- Picture 2: speed against distance ----
const P2_W = 560
const P2_H = 420
const PLOT_X0 = 74
const PLOT_X1 = 530
const PLOT_Y0 = 326 // the bottom (zero speed)
const PLOT_Y1 = 126 // the top (the largest speed on the ruler)

export function PictureTwo({ stage, speedGuess }: { stage: number; speedGuess: SpeedChoiceId | null }) {
  const pic = pictureTwo()
  const gx = (position: number) => PLOT_X0 + (PLOT_X1 - PLOT_X0) * position
  const gy = (position: number) => PLOT_Y0 - (PLOT_Y0 - PLOT_Y1) * position
  const speedLine = pic.curve.map((c) => `${gx(c.position)},${gy(c.speedPosition)}`).join(' ')
  const escapeLine = pic.curve.map((c) => `${gx(c.position)},${gy(c.escapePosition)}`).join(' ')
  const xq = gx(pic.closestPosition)
  // The box shows the guessed speed only (the button's longer words would not fit).
  const speedLabel = speedGuess !== null ? `about ${speedChoiceKmS(speedGuess)} km/s` : ''
  const guessY = speedGuess !== null ? gy(speedRulerPosition(speedChoiceKmS(speedGuess))) : 0
  return (
    <svg viewBox={`0 0 ${P2_W} ${P2_H}`} style={svgStyle} role="img" aria-label="Picture 2: the speed of 3I/ATLAS against its distance from the Sun, with the escape speed at each distance">
      <text x={14} y={20} fill={TEXT_COLOR} fontSize={13} fontWeight="bold">
        Picture 2: how fast 3I/ATLAS goes at each distance from the Sun
      </text>
      <Legend
        x={14}
        y={38}
        size={9}
        items={[
          { lines: ['cyan line: the speed of 3I/ATLAS at each distance from the Sun, calculated'], color: CALC_COLOR },
          { lines: ['dashed cyan line: the escape speed at each distance, calculated', '(the speed above which an object is not held by the Sun)'], color: CALC_COLOR },
          { lines: [`dotted line: its speed far from the Sun, ${n1(pic.speedFarAwayKmS)} km/s, calculated`], color: MUTED_COLOR },
        ]}
      />

      {SPEED_TICKS_KM_S.map((v) => (
        <g key={v}>
          <line x1={PLOT_X0} y1={gy(speedRulerPosition(v))} x2={PLOT_X1} y2={gy(speedRulerPosition(v))} stroke="#1e293b" strokeWidth={1} />
          <text x={PLOT_X0 - 6} y={gy(speedRulerPosition(v)) + 3} fill={MUTED_COLOR} fontSize={9} textAnchor="end">
            {v}
          </text>
        </g>
      ))}
      <text x={14} y={(PLOT_Y0 + PLOT_Y1) / 2} fill={MUTED_COLOR} fontSize={9} textAnchor="middle" transform={`rotate(-90 14 ${(PLOT_Y0 + PLOT_Y1) / 2})`}>
        speed (km/s)
      </text>
      <line x1={PLOT_X0} y1={PLOT_Y0} x2={PLOT_X1} y2={PLOT_Y0} stroke={MUTED_COLOR} strokeWidth={1} />
      {DISTANCE_TICKS_AU.map((d) => (
        <g key={d}>
          <line x1={gx(distanceRulerPosition(d))} y1={PLOT_Y0} x2={gx(distanceRulerPosition(d))} y2={PLOT_Y0 + 5} stroke={MUTED_COLOR} />
          <text x={gx(distanceRulerPosition(d))} y={PLOT_Y0 + 17} fill={MUTED_COLOR} fontSize={9} textAnchor="middle">
            {d}
          </text>
        </g>
      ))}
      <text x={(PLOT_X0 + PLOT_X1) / 2} y={PLOT_Y0 + 34} fill={MUTED_COLOR} fontSize={9} textAnchor="middle">
        distance from the Sun, in AU (each step to the right is about three times farther)
      </text>

      {stage >= 3 && (
        <g>
          <polyline points={escapeLine} fill="none" stroke={CALC_COLOR} strokeWidth={2} strokeDasharray="6 4" />
          <polyline points={speedLine} fill="none" stroke={CALC_COLOR} strokeWidth={2.5} />
          <line x1={PLOT_X0} y1={gy(pic.speedFarAwayPosition)} x2={PLOT_X1} y2={gy(pic.speedFarAwayPosition)} stroke={MUTED_COLOR} strokeWidth={1} strokeDasharray="1 3" />
          <line x1={xq} y1={PLOT_Y0} x2={xq} y2={PLOT_Y1} stroke={CALC_COLOR} strokeWidth={1} strokeDasharray="2 3" />
          <SvgLines x={PLOT_X1 - 4} y={gy(pic.speedFarAwayPosition) + 12} lines={[`speed far away: ${n1(pic.speedFarAwayKmS)} km/s`]} fill={MUTED_COLOR} size={9} anchor="end" />
        </g>
      )}
      {/* The guess is drawn under the real dots, so that a guess close to the real value does not hide the real dot. */}
      {stage >= 3 && speedGuess !== null && (
        <g>
          <line x1={xq - 12} y1={guessY} x2={xq + 12} y2={guessY} stroke={YOURS_COLOR} strokeWidth={4} />
          <polygon points={`${xq},${guessY - 9} ${xq + 9},${guessY} ${xq},${guessY + 9} ${xq - 9},${guessY}`} fill={YOURS_COLOR} />
          <GuessBox x={300} y={122} w={225} label={`YOUR GUESS: ${speedLabel}`} fromX={xq + 9} fromY={guessY} />
        </g>
      )}
      {stage >= 3 && (
        <g>
          <circle cx={xq} cy={gy(pic.speedAtClosestPosition)} r={4.5} fill={CALC_COLOR} stroke="#0b1020" strokeWidth={1.5} />
          <circle cx={xq} cy={gy(pic.escapeAtClosestPosition)} r={4} fill="#0b1020" stroke={CALC_COLOR} strokeWidth={2} />
          <line x1={xq - 4} y1={gy(pic.speedAtClosestPosition) - 4} x2={xq - 12} y2={gy(pic.speedAtClosestPosition) - 22} stroke={CALC_COLOR} strokeWidth={1} />
          <SvgLines x={xq - 14} y={gy(pic.speedAtClosestPosition) - 38} lines={[`closest approach, ${n2(pic.closestApproachAu)} AU:`, `${n1(pic.speedAtClosestKmS)} km/s`]} fill={CALC_COLOR} bold size={9} anchor="end" />
          <SvgLines x={xq - 10} y={PLOT_Y0 - 9} lines={[`escape speed there: ${n1(pic.escapeSpeedAtClosestKmS)} km/s`]} fill={CALC_COLOR} bold size={9} anchor="end" />
        </g>
      )}
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
            look: 'the cyan line, against the grey circles.',
            means: 'the path comes in from beyond the orbit of Jupiter, passes the Sun between the orbits of Earth and Mars, and goes out again beyond Jupiter’s orbit. It never loops back.',
            matters: 'this is an open path: the object passes the Sun once and is gone. A closed path would loop round and round, like the grey circles.',
          },
        ]
      : []),
    ...(stage >= 3
      ? [
          {
            look: 'the cyan dot, and the line from the Sun to it.',
            means: `the closest approach is ${n2(pic.closestApproachAu)} AU from the Sun, about ${n2(pic.closestApproachAu)} times the Earth’s distance.`,
            matters: 'this distance, together with the speed far away, is all that is needed to work out the whole path. It is also where the Sun’s pull on the object is strongest.',
          },
        ]
      : []),
    ...(stage >= 5
      ? [
          {
            look: 'the angle between the dashed cyan line and the cyan arrow, near the top.',
            means: `${n1(pic.bendDegrees)} degrees. Without the Sun’s pull the object would have gone straight on along the dashed line. The pull turned it by this angle.`,
            matters: 'this is the answer to the question of the experiment: how far the Sun bends the path of this visitor. The tutor says what it means.',
          },
          {
            look: 'the white line with the box “YOUR GUESS”, against the cyan arrow.',
            means: 'your guess for Prediction 1, drawn as a line that leaves the same point as the real path, turned from the dashed line by the angle you guessed.',
            matters: 'it shows at a glance how your guess compares with the calculated bend. The tutor says what that means.',
          },
        ]
      : []),
  ]
  return (
    <CaptionBlock
      title="Picture 1"
      intro="This is a map of the solar system seen from above, with the Sun at the centre, drawn to scale. It shows the real path of 3I/ATLAS, calculated from its published orbit. It builds up in stages as the run goes on."
      bullets={[
        <>
          <strong>The yellow dot</strong> is the Sun. <strong>The grey circles</strong> are the orbits of the Earth, Mars and Jupiter, drawn for scale. One AU (astronomical unit) is the Earth’s distance from the Sun, about 150 million kilometres.
        </>,
        ...(stage >= 2
          ? [
              <>
                <strong>The cyan line</strong> is the path of 3I/ATLAS. <strong>The small arrow</strong> on it shows which way it travels: it comes in from the bottom of the picture and goes out at the top.
              </>,
            ]
          : []),
        ...(stage >= 3
          ? [
              <>
                <strong>The cyan dot</strong> is the closest approach, the point where the object is nearest to the Sun.
              </>,
            ]
          : []),
        ...(stage >= 5
          ? [
              <>
                <strong>The dashed cyan line</strong> is the way the object was heading before it reached the Sun, carried on in a straight line. <strong>The cyan arrow</strong> is the way it actually leaves. <strong>The curved line</strong> between them marks the
                angle, the bend. <strong>The white line</strong> is your guess. It is only the angle that matters: a longer or shorter white line means nothing.
              </>,
            ]
          : []),
      ]}
      worked={
        stage >= 5 ? (
          <>
            Measure each direction of travel as an angle from the direction that points to the right across the page, turning anticlockwise. On the way in, far from the Sun, the object is heading at {pic.headingInDegrees.toFixed(2)} degrees. On the way out it is
            heading at {pic.headingOutDegrees.toFixed(2)} degrees. The difference is {pic.headingOutDegrees.toFixed(2)} − {pic.headingInDegrees.toFixed(2)} = {pic.bendDegrees.toFixed(2)} degrees, which is the bend, {n1(pic.bendDegrees)} degrees. (Part 3 shows how
            the bend follows from the eccentricity of the path, {pic.eccentricity}.)
          </>
        ) : null
      }
      lookFor={lookFor}
      whereFrom={
        <>
          <strong>Estimated from measurements:</strong> the path’s eccentricity, {pic.eccentricity}, and closest approach, {pic.closestApproachAu} AU, come from the published orbit of 3I/ATLAS, which astronomers worked out from many observations (read from Wikipedia’s orbit table, in part; the discovery
          paper’s abstract, arXiv:2507.02757, gives 6.1 and 1.36). <strong>Calculated here:</strong> the curve of the path (the standard formula for a path under the Sun’s gravity alone), the directions and the bend. The planets’ circles are drawn at their average distances, for scale (standard
          values; no source was read for them). <strong>Imagined for the question:</strong> nothing. Your guess is drawn in white and never changes the real picture.
        </>
      }
    />
  )
}

export function pictureTwoCaption(): ReactNode {
  const pic = pictureTwo()
  const last = pic.curve[pic.curve.length - 1]
  const first = pic.curve[0]
  const lookFor: LookFor[] = [
    {
      look: 'the cyan line at the closest approach, against the dotted line.',
      means: `at the closest approach the speed is ${n1(pic.speedAtClosestKmS)} km/s, which is ${n1(pic.speedAtClosestKmS - pic.speedFarAwayKmS)} km/s (${Math.round(pic.gainShare * 100)} percent) faster than the ${n1(pic.speedFarAwayKmS)} km/s far from the Sun.`,
      matters: 'the Sun’s pull changes the speed even of a very fast visitor, and the line is the same on the way in and the way out. The tutor explains why.',
    },
    {
      look: 'the cyan line, against the dashed cyan line.',
      means: `the cyan line is above the dashed line at every distance. At the closest approach it is ${n1(pic.speedAtClosestKmS)} km/s against an escape speed of ${n1(pic.escapeSpeedAtClosestKmS)} km/s, so ${n2(pic.speedOverEscape)} times the escape speed. At the right-hand end of the line, ${Math.round(last.au)} AU from the Sun, it is ${n1(last.speedKmS)} km/s against ${n1(last.escapeKmS)}.`,
      matters: 'a speed above the escape speed at every distance is what it means for a path to be open. The tutor explains why.',
    },
    {
      look: 'the left end of the cyan line, against the right end.',
      means: `near the Sun (${first.au} AU) the speed is ${n1(first.speedKmS)} km/s; far away it levels off at about ${n1(pic.speedFarAwayKmS)} km/s.`,
      matters: 'far from the Sun the pull has almost gone, so the speed no longer changes. That level is the “speed far away”.',
    },
    {
      look: 'the white marker with the box “YOUR GUESS”, against the cyan dot at the closest approach.',
      means: 'your guess for Prediction 2, drawn at the height of the speed you guessed, above the closest approach.',
      matters: 'it shows at a glance how your guess compares with the calculated speed. The tutor says what that means.',
    },
  ]
  return (
    <CaptionBlock
      title="Picture 2"
      intro="This is a graph. Along the bottom is the distance from the Sun in AU (one AU is the Earth’s distance from the Sun), on a ruler that goes up by about three times at each step (0.3, 1, 3, 10, 30 and 100 AU), so that near and far distances fit on one picture. Up the side is speed in kilometres a second (km/s), on an ordinary ruler. It appears when the run reaches the closest approach."
      bullets={[
        <>
          <strong>The cyan line</strong> is the speed of 3I/ATLAS at each distance from the Sun. It is highest near the Sun and levels off far away. <strong>The dashed cyan line</strong> is the escape speed at each distance, which is also higher nearer the Sun.
        </>,
        <>
          <strong>The dotted grey line</strong> is the speed far from the Sun, {n1(pic.speedFarAwayKmS)} km/s. <strong>The dotted cyan vertical line</strong> marks the closest approach, {n2(pic.closestApproachAu)} AU. <strong>The filled cyan dot</strong> on it is the speed there, and{' '}
          <strong>the ring</strong> is the escape speed there.
        </>,
        <>
          <strong>The white marker</strong> and its box are your guess for Prediction 2. Only the height matters: it is drawn at the speed you guessed, above the closest approach.
        </>,
      ]}
      worked={
        <>
          At the closest approach, {n2(pic.closestApproachAu)} AU, the speed is {n1(pic.speedAtClosestKmS)} km/s. That is {n1(pic.speedAtClosestKmS)} − {n1(pic.speedFarAwayKmS)} = {n1(pic.speedAtClosestKmS - pic.speedFarAwayKmS)} km/s more than the speed far away, or {Math.round(pic.gainShare * 100)} percent more. The escape speed there is{' '}
          {n1(pic.escapeSpeedAtClosestKmS)} km/s, and {n1(pic.speedAtClosestKmS)} ÷ {n1(pic.escapeSpeedAtClosestKmS)} = {n2(pic.speedOverEscape)}, so the object is going {n2(pic.speedOverEscape)} times the escape speed.
        </>
      }
      lookFor={lookFor}
      whereFrom={
        <>
          <strong>Calculated here:</strong> both curves, from the Sun’s gravity alone (the speed at each distance follows from keeping the total energy the same). The speed far away, {n1(pic.speedFarAwayKmS)} km/s, is worked out from the published eccentricity and closest approach; it agrees with the 58 km/s in the discovery paper’s abstract.
          <strong> Measured by others:</strong> NASA’s page on 3I/ATLAS gives its speed at closest approach as about 153,000 miles an hour, which is {n1(nasaSpeedAtClosestKmS())} km/s, and ESA’s page as roughly 250,000 km/h, which is {n1(esaSpeedAtClosestKmS())} km/s. Both agree with the calculated {n1(pic.speedAtClosestKmS)} km/s to
          within about 2 percent (read on the pages on 2026-10-28; they do not say how the figures were worked out). <strong>Imagined for the question:</strong> nothing. Your guess is drawn in white and never changes the real picture. The range of the speed ruler, up to {SPEED_RULER_MAX_KM_S} km/s, was chosen so that every button fits.
        </>
      }
    />
  )
}
