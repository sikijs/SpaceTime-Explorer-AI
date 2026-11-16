import type { ReactNode } from 'react'
import { KM_PER_AU } from '../physics/blackHoleSizeExperiment'
import { CaptionBox } from './TidalEffectExperiment'

// Black Holes, Experiment 1 (audit update): the pictures. Picture 1 (the ruler for the real Sun) and Picture 1b (one Sun against 1,000 Suns)
// are the real pictures of Part 1 and carry the white guess marks. Picture 2 (the ruler for the learner's object) and Picture 3 (the ball)
// follow the controls in Part 2 and carry no guess mark (CLAUDE.md §14, "Predictions and the Real Results"). Every number is passed in from
// the physics module.

export const GUESS_COLOR = '#ffffff'
const MARKER_COLOR = '#facc15'
const BLACK_HOLE_COLOR = '#e879f9'
const HORIZON_COLOR = '#fb7185'
const BAR_COLOR = '#fb7185'

const VIEW_WIDTH = 640
const AXIS_LEFT = 40
const AXIS_RIGHT = 600
const AXIS_Y = 170
const REGION_TOP = 62
const REGION_BOTTOM = 238
const GUESS_ROW = 76 // extra height at the top for the YOUR GUESS box and its line

// Three significant figures, with no trailing zeros ("10", "2.95", "235,571").
export function formatNumber(value: number): string {
  // A whole number is printed exactly, so a published radius such as 695,700 km is never shown rounded to 696,000.
  if (Number.isInteger(value)) return value.toLocaleString('en-US')
  if (value >= 1000) return Number(value.toPrecision(3)).toLocaleString('en-US')
  return String(Number(value.toPrecision(3)))
}

// A length in plain units, from millimeters to trillions of kilometers.
export function formatLength(km: number): string {
  if (km < 1e-3) return `${formatNumber(km * 1e6)} mm`
  if (km < 1) return `${formatNumber(km * 1000)} m`
  if (km < 1e6) return `${formatNumber(km)} km`
  if (km < 1e9) return `${formatNumber(km / 1e6)} million km`
  if (km < 1e12) return `${formatNumber(km / 1e9)} billion km`
  return `${formatNumber(km / 1e12)} trillion km`
}

export function formatMass(solarMasses: number): string {
  if (solarMasses < 1e-3) return `${(solarMasses * 1e6).toFixed(0)} millionths of a solar mass`
  if (solarMasses === 1) return '1 solar mass'
  if (solarMasses < 1e3) return `${solarMasses} solar masses`
  if (solarMasses < 1e9) return `${solarMasses / 1e6} million solar masses`
  return `${solarMasses / 1e9} billion solar masses`
}

// Fixed, illustrative landmarks, drawn only when they fall inside the current axis range. They exist only to make the scale
// understandable; they are not results.
const LANDMARKS: Array<{ label: string; km: number }> = [
  { label: 'a coin (1 cm)', km: 1e-5 },
  { label: 'a person (2 m)', km: 2e-3 },
  { label: 'a small city (10 km)', km: 10 },
  { label: 'Earth (6,371 km)', km: 6371 },
  { label: 'the Sun (695,700 km)', km: 695_700 },
  { label: "Mercury's orbit (0.39 AU)", km: 0.39 * KM_PER_AU },
  { label: 'Earth to Sun (1 AU)', km: KM_PER_AU },
  { label: "Neptune's orbit (30 AU)", km: 30 * KM_PER_AU },
]

const svgBox = {
  display: 'block',
  maxWidth: `${VIEW_WIDTH}px`,
  border: '1px solid var(--border-color, #ccc)',
  borderRadius: '8px',
  overflow: 'hidden',
  backgroundColor: '#0b1020',
} as const

// The white YOUR GUESS box, joined by a line to its mark. Drawn in the picture's own coordinates.
function GuessBox({ x, y, width, line1, line2 }: { x: number; y: number; width: number; line1: string; line2?: string }) {
  const height = line2 ? 44 : 30
  return (
    <g>
      <rect x={x - width / 2} y={y} width={width} height={height} rx={6} fill="#0b1020" stroke={GUESS_COLOR} strokeWidth={3} />
      <text x={x} y={y + 19} fill={GUESS_COLOR} fontSize="14" fontWeight="bold" textAnchor="middle">
        {line1}
      </text>
      {line2 && (
        <text x={x} y={y + 36} fill={GUESS_COLOR} fontSize="12" textAnchor="middle">
          {line2}
        </text>
      )}
    </g>
  )
}

export interface RulerPictureProps {
  title: string
  objectLabel: string
  horizonKm: number
  startKm: number
  minKm: number
  markerRadiusKm: number
  status: 'idle' | 'running' | 'complete'
  hypotheticalStart: boolean
  chosenRadiusKm?: number
  // Part 1 only: the learner's guess, drawn once the run has finished.
  guess?: { km: number; label: string } | null
  reserveGuessRow?: boolean
}

export function RulerPicture({
  title,
  objectLabel,
  horizonKm,
  startKm,
  minKm,
  markerRadiusKm,
  status,
  hypotheticalStart,
  chosenRadiusKm,
  guess,
  reserveGuessRow,
}: RulerPictureProps) {
  const pad = reserveGuessRow ? GUESS_ROW : 0
  const height = 290 + pad
  const markerIsBlackHole = markerRadiusKm <= horizonKm

  // A logarithmic axis from the start radius (right) down to 0.1 of the horizon radius (left), so a squeeze moves the marker left.
  const logMin = Math.log10(minKm)
  const logMax = Math.log10(startKm)
  const xFor = (km: number) => AXIS_LEFT + ((Math.log10(km) - logMin) / (logMax - logMin)) * (AXIS_RIGHT - AXIS_LEFT)

  const horizonX = xFor(horizonKm)
  const markerX = xFor(markerRadiusKm)
  const markerLabelX = Math.min(Math.max(markerX, AXIS_LEFT + 80), AXIS_RIGHT - 80)
  const color = markerIsBlackHole ? BLACK_HOLE_COLOR : MARKER_COLOR

  const decades: number[] = []
  for (let k = Math.ceil(logMin - 1e-9); k <= Math.floor(logMax + 1e-9); k++) decades.push(k)
  const visibleLandmarks = LANDMARKS.filter((l) => l.km >= minKm && l.km <= startKm * 1.0000001)

  const guessX = guess ? xFor(guess.km) : 0
  const boxWidth = 250
  const boxX = Math.min(Math.max(guessX, AXIS_LEFT + boxWidth / 2 - 20), AXIS_RIGHT - boxWidth / 2 + 20)

  return (
    <svg
      viewBox={`0 0 ${VIEW_WIDTH} ${height}`}
      width="100%"
      style={{ ...svgBox, marginTop: '1rem' }}
      role="img"
      aria-label={`${title}. A logarithmic ruler of radii with the horizon radius marked in red and the radius of ${objectLabel} marked as a dot.`}
    >
      <text x={12} y={20} fill="#e2e8f0" fontSize="12" fontWeight="bold">
        {title}
      </text>
      <g transform={`translate(0, ${pad})`}>
        {/* Inside the horizon: a distinct shaded region to the left of the horizon line */}
        <rect
          x={AXIS_LEFT}
          y={REGION_TOP}
          width={Math.max(horizonX - AXIS_LEFT, 0)}
          height={REGION_BOTTOM - REGION_TOP}
          fill="rgba(251, 113, 133, 0.16)"
        />
        <line x1={AXIS_LEFT} y1={REGION_BOTTOM + 6} x2={horizonX} y2={REGION_BOTTOM + 6} stroke={HORIZON_COLOR} strokeWidth={2} />
        <text x={AXIS_LEFT} y={REGION_BOTTOM + 22} fill={HORIZON_COLOR} fontSize="12">
          Inside the horizon: a black hole
        </text>

        {/* The axis and its decade ticks */}
        <line x1={AXIS_LEFT} y1={AXIS_Y} x2={AXIS_RIGHT} y2={AXIS_Y} stroke="#94a3b8" strokeWidth={2} />
        {decades.map((k) => (
          <g key={k}>
            <line x1={xFor(10 ** k)} y1={AXIS_Y - 5} x2={xFor(10 ** k)} y2={AXIS_Y + 5} stroke="#94a3b8" />
            <text x={xFor(10 ** k)} y={AXIS_Y + 20} fill="#94a3b8" fontSize="10" textAnchor="middle">
              {formatLength(10 ** k)}
            </text>
          </g>
        ))}

        {/* Fixed landmarks for scale, only those inside this range */}
        {visibleLandmarks.map((l, index) => {
          const x = xFor(l.km)
          const labelY = AXIS_Y - 22 - (index % 3) * 20
          return (
            <g key={l.label}>
              <line x1={x} y1={AXIS_Y} x2={x} y2={labelY + 4} stroke="#64748b" strokeDasharray="2 3" />
              <circle cx={x} cy={AXIS_Y} r={3} fill="#64748b" />
              <text
                x={x > AXIS_RIGHT - 70 ? x + 4 : x < AXIS_LEFT + 70 ? x - 4 : x}
                y={labelY}
                fill="#cbd5e1"
                fontSize="10"
                textAnchor={x > AXIS_RIGHT - 70 ? 'end' : x < AXIS_LEFT + 70 ? 'start' : 'middle'}
              >
                {l.label}
              </text>
            </g>
          )
        })}

        {/* The horizon line */}
        <line x1={horizonX} y1={REGION_TOP} x2={horizonX} y2={REGION_BOTTOM} stroke={HORIZON_COLOR} strokeWidth={2} />
        <text x={horizonX + 6} y={REGION_BOTTOM - 8} fill={HORIZON_COLOR} fontSize="12">
          Horizon radius: {formatLength(horizonKm)}
        </text>

        {/* Where the learner chose to squeeze to (Part 2 only), until the run reaches it */}
        {chosenRadiusKm !== undefined && status !== 'complete' && (
          <g>
            <circle cx={xFor(chosenRadiusKm)} cy={AXIS_Y} r={9} fill="none" stroke="#e2e8f0" strokeDasharray="3 3" />
            <text x={xFor(chosenRadiusKm)} y={AXIS_Y + 42} fill="#e2e8f0" fontSize="10" textAnchor="middle">
              your chosen radius
            </text>
          </g>
        )}

        {/* The object's radius */}
        <line x1={markerX} y1={AXIS_Y} x2={markerX} y2={REGION_TOP - 6} stroke={color} />
        <circle cx={markerX} cy={AXIS_Y} r={7} fill={color} />
        <text x={markerLabelX} y={REGION_TOP - 24} fill={color} fontSize="12" fontWeight="bold" textAnchor="middle">
          {objectLabel} radius: {formatLength(markerRadiusKm)}
        </text>
        <text x={markerLabelX} y={REGION_TOP - 10} fill={color} fontSize="11" textAnchor="middle">
          {markerIsBlackHole ? 'a black hole' : hypotheticalStart && status === 'idle' ? 'hypothetical start' : 'not a black hole'}
        </text>

        {/* The learner's guess (Part 1 only): a thick white line, a pointer on the ruler and a YOUR GUESS box */}
        {guess && (
          <g>
            <line x1={guessX} y1={-GUESS_ROW + 70} x2={guessX} y2={AXIS_Y - 8} stroke={GUESS_COLOR} strokeWidth={4} />
            <polygon points={`${guessX - 9},${AXIS_Y - 22} ${guessX + 9},${AXIS_Y - 22} ${guessX},${AXIS_Y - 6}`} fill={GUESS_COLOR} />
          </g>
        )}
      </g>
      {guess && <GuessBox x={boxX} y={28} width={boxWidth} line1="YOUR GUESS" line2={guess.label} />}
    </svg>
  )
}

// Picture 1b: the horizon of one Sun against the horizon of 1,000 Suns, on its own logarithmic scale.
const BARS_MIN_KM = 1
const BARS_MAX_KM = 1e7
const BARS_LEFT = 215
const BARS_RIGHT = 620

export function HorizonBarsPicture({
  smallKm,
  largeKm,
  guess,
}: {
  smallKm: number
  largeKm: number
  guess: { widthKm: number; label: string } | null
}) {
  const x0 = BARS_LEFT
  const xFor = (km: number) => x0 + ((Math.log10(km) - Math.log10(BARS_MIN_KM)) / (Math.log10(BARS_MAX_KM) - Math.log10(BARS_MIN_KM))) * (BARS_RIGHT - BARS_LEFT)
  const ticks = [0, 1, 2, 3, 4, 5, 6, 7]
  const rowH = 22
  const guessEnd = guess ? xFor(guess.widthKm) : 0
  const boxWidth = 250
  const boxX = Math.min(Math.max(guessEnd, 30 + boxWidth / 2), VIEW_WIDTH - 8 - boxWidth / 2)
  return (
    <svg
      viewBox={`0 0 ${VIEW_WIDTH} 285`}
      width="100%"
      style={{ ...svgBox, marginTop: '1rem' }}
      role="img"
      aria-label="Picture 1b. Two red bars on a logarithmic scale: the horizon radius of one Sun and of 1,000 Suns. After the run, a white bar shows your guess for the second."
    >
      <text x={12} y={20} fill="#e2e8f0" fontSize="12" fontWeight="bold">
        Picture 1b: one Sun against 1,000 Suns (how wide is the horizon?)
      </text>
      <text x={12} y={37} fill="#94a3b8" fontSize="10">
        Its own logarithmic scale: each tick is 10 times the one before (labelled every second tick). The bars start at 1 km.
      </text>

      <text x={12} y={78} fill={BAR_COLOR} fontSize="12" fontWeight="bold">
        Horizon of 1 Sun
      </text>
      <text x={12} y={93} fill={BAR_COLOR} fontSize="11">
        {formatLength(smallKm)}
      </text>
      <rect x={x0} y={72} width={Math.max(xFor(smallKm) - x0, 1)} height={rowH} fill={BAR_COLOR} />

      <text x={12} y={128} fill={BAR_COLOR} fontSize="12" fontWeight="bold">
        Horizon of 1,000 Suns
      </text>
      <text x={12} y={143} fill={BAR_COLOR} fontSize="11">
        {formatLength(largeKm)}
      </text>
      <rect x={x0} y={122} width={Math.max(xFor(largeKm) - x0, 1)} height={rowH} fill={BAR_COLOR} />

      {guess && (
        <g>
          <line x1={guessEnd} y1={196} x2={guessEnd} y2={216} stroke={GUESS_COLOR} strokeWidth={4} />
          <text x={12} y={228} fill={GUESS_COLOR} fontSize="12" fontWeight="bold">
            Your guess for 1,000 Suns
          </text>
          <rect x={x0} y={216} width={Math.max(guessEnd - x0, 1)} height={rowH} fill="none" stroke={GUESS_COLOR} strokeWidth={4} />
          <rect x={x0} y={216} width={Math.max(guessEnd - x0, 1)} height={rowH} fill="rgba(255,255,255,0.35)" />
        </g>
      )}
      {guess && <GuessBox x={boxX} y={152} width={boxWidth} line1="YOUR GUESS" line2={guess.label} />}

      <line x1={x0} y1={262} x2={BARS_RIGHT} y2={262} stroke="#94a3b8" strokeWidth={2} />
      {ticks.map((k) => (
        <g key={k}>
          <line x1={xFor(10 ** k)} y1={258} x2={xFor(10 ** k)} y2={266} stroke="#94a3b8" />
          {k % 2 === 0 && (
            <text x={xFor(10 ** k)} y={279} fill="#94a3b8" fontSize="10" textAnchor="middle">
              {formatLength(10 ** k)}
            </text>
          )}
        </g>
      ))}
    </svg>
  )
}

// Picture 3: the ball, drawn for the learner's own object and radius (Part 2).
const BALL_VIEW_HEIGHT = 230
const BALL_CENTER_X = 450
const BALL_CENTER_Y = 115
const HORIZON_DRAWN_RADIUS = 22
const BALL_GROWTH = 0.35

// Real sizes span up to ten powers of ten, so the drawn radius grows only slowly with the real one. It equals the red circle exactly at
// the horizon radius, is smaller below it and bigger above it, so the comparison with the red circle is honest although the sizes are not
// to scale.
function drawnBallRadius(radiusInHorizonRadii: number): number {
  return Math.max(HORIZON_DRAWN_RADIUS * (1 + BALL_GROWTH * Math.log10(radiusInHorizonRadii)), 3)
}

export function BallPicture({ markerRadiusKm, horizonKm }: { markerRadiusKm: number; horizonKm: number }) {
  const markerIsBlackHole = markerRadiusKm <= horizonKm
  const color = markerIsBlackHole ? BLACK_HOLE_COLOR : MARKER_COLOR
  const r = drawnBallRadius(markerRadiusKm / horizonKm)
  return (
    <svg
      viewBox={`0 0 ${VIEW_WIDTH} ${BALL_VIEW_HEIGHT}`}
      width="100%"
      style={{ ...svgBox, marginTop: '1rem' }}
      role="img"
      aria-label="Picture 3. A filled circle, the ball, drawn against a red dashed circle, the horizon radius. Not to scale."
    >
      <text x={20} y={26} fill="#e2e8f0" fontSize="12" fontWeight="bold">
        Picture 3: the ball (the object squeezed to this radius)
      </text>
      <circle cx={BALL_CENTER_X} cy={BALL_CENTER_Y} r={r} fill={color} fillOpacity={markerIsBlackHole ? 0.9 : 0.55} stroke={color} strokeWidth={2} />
      <circle cx={BALL_CENTER_X} cy={BALL_CENTER_Y} r={HORIZON_DRAWN_RADIUS} fill="none" stroke={HORIZON_COLOR} strokeWidth={2} strokeDasharray="5 4" />
      <text x={BALL_CENTER_X + Math.max(r, HORIZON_DRAWN_RADIUS) + 10} y={BALL_CENTER_Y - 6} fill={color} fontSize="12" fontWeight="bold">
        The ball
      </text>
      <text x={BALL_CENTER_X + Math.max(r, HORIZON_DRAWN_RADIUS) + 10} y={BALL_CENTER_Y + 12} fill={HORIZON_COLOR} fontSize="12" fontWeight="bold">
        Horizon radius
      </text>
      <circle cx={30} cy={56} r={7} fill={color} fillOpacity={0.7} />
      <text x={46} y={60} fill={color} fontSize="12">
        The ball: radius {formatLength(markerRadiusKm)}
      </text>
      <circle cx={30} cy={82} r={7} fill="none" stroke={HORIZON_COLOR} strokeWidth={2} strokeDasharray="3 2" />
      <text x={46} y={86} fill={HORIZON_COLOR} fontSize="12">
        Red circle: horizon radius, {formatLength(horizonKm)}
      </text>
      <text x={20} y={BALL_VIEW_HEIGHT - 16} fill="#94a3b8" fontSize="11">
        {markerIsBlackHole ? 'The ball is at or inside the red circle: a black hole.' : 'The ball is bigger than the red circle: not a black hole.'}
      </text>
    </svg>
  )
}

const li = { marginBottom: '0.4rem' } as const

function LookFor({ look, means, matters }: { look: ReactNode; means: ReactNode; matters: ReactNode }) {
  return (
    <li style={li}>
      <strong>Look at:</strong> {look}
      <br />
      <strong>What it means:</strong> {means}
      <br />
      <strong>Why it matters:</strong> {matters}
    </li>
  )
}

// The caption under Picture 1 and Picture 1b (Part 1). Its numbers appear only once the run has finished, so nothing is explained before
// the learner has seen it (CLAUDE.md §12).
export function PartOneCaption({
  complete,
  sunHorizonKm,
  squeezeFactor,
  largeHorizonKm,
}: {
  complete: boolean
  sunHorizonKm: number
  squeezeFactor: number
  largeHorizonKm: number
}) {
  return (
    <CaptionBox>
      <p style={{ marginTop: 0, marginBottom: '0.5rem' }}>
        <strong>How to read these diagrams.</strong> Imagine taking all of the Sun’s mass and squeezing it into a
        smaller and smaller ball. The size of the ball is measured by its <strong>radius</strong>: the distance from
        the middle of the ball to its surface. Picture 1 (the ruler) shows the squeeze of the real Sun. Picture 1b
        (two bars) compares the critical size of one Sun with that of 1,000 Suns, and appears when the squeeze
        finishes.
      </p>
      <p style={{ marginTop: '0.6rem', marginBottom: '0.3rem' }}>
        <strong>Picture 1, the ruler</strong>
      </p>
      <ol style={{ margin: 0, paddingLeft: '1.1rem' }}>
        <li style={li}>
          <strong>The line across the middle is a ruler for the radius.</strong> Each place on it stands for a ball of
          a certain size: the further right, the bigger the ball; the further left, the smaller. A spot marked 10 km
          means a ball with a radius of 10 km.
        </li>
        <li style={li}>
          <strong>Each tick on the ruler is 10 times bigger than the one before it.</strong> It reads, for example,
          1 km, 10 km, 100 km, 1,000 km. This is a logarithmic ruler. We use it because the sizes here are so
          different that on an ordinary ruler everything small would shrink to a dot. A step from 1 km to 10 km takes
          the same space as a step from 10 km to 100 km, even though the second step is ten times longer.
        </li>
        <li style={li}>
          <strong>The yellow dot is the Sun’s radius right now.</strong> It always has the same size; only its
          position changes. Before the run it sits at the right end, the Sun’s real radius (695,700 km, NASA’s
          published value). When you press Run it slides left, which is the squeezing.
        </li>
        <li style={li}>
          <strong>The red line is the horizon radius, the critical size.</strong> A ball bigger than this is not a
          black hole. A ball squeezed to this size or smaller is: nothing, not even light, can get out. The shaded
          area to the left of the red line is the “inside the horizon” zone. When the dot reaches the line it turns
          pink and its label changes to “a black hole”.
        </li>
        <li style={li}>
          <strong>The gray dots are everyday things to compare with</strong> (a coin, a person, a small city, the
          Earth, the Sun and some distances in the Solar System). Their places are fixed and they are not results.
        </li>
        <li style={li}>
          <strong>The white mark and the YOUR GUESS box</strong> appear when the squeeze finishes. They show where
          your first guess lies on this ruler. A different guess puts the mark in a different place. The mark shows
          your guess only; it does not say whether it is right.
        </li>
      </ol>
      <p style={{ marginTop: '0.6rem', marginBottom: '0.3rem' }}>
        <strong>Picture 1b, one Sun against 1,000 Suns</strong> <em>(appears when the squeeze finishes)</em>
      </p>
      <ol style={{ margin: 0, paddingLeft: '1.1rem' }}>
        <li style={li}>
          <strong>The two red bars are the real horizon radii:</strong> the top one for one Sun, the one below it for
          a black hole with 1,000 times the Sun’s mass. They are calculated here from the same formula as the red
          line in Picture 1. 1,000 Suns is an invented pair, chosen to make the comparison easy to read.
        </li>
        <li style={li}>
          <strong>The scale is logarithmic too:</strong> each tick is 10 times the one before, and every bar starts
          at 1 km. So the picture shows which bar is longer, and the numbers beside them say by how much.
        </li>
        <li style={li}>
          <strong>The white bar and its YOUR GUESS box</strong> show how wide your second guess says the horizon of
          1,000 Suns is, drawn on the same scale. Again, a marker for your guess only: no “right” or “wrong”.
        </li>
      </ol>
      {complete && (
        <>
          <p style={{ marginTop: '0.6rem', marginBottom: '0.3rem' }}>
            <strong>A worked moment.</strong> The real Sun’s radius is 695,700 km. Its horizon radius is about{' '}
            {formatLength(sunHorizonKm)}. So the ball had to be squeezed by a factor of 695,700 ÷ {formatNumber(sunHorizonKm)}{' '}
            ≈ {formatNumber(squeezeFactor)}, which is why the yellow dot had to travel almost the whole ruler. On
            Picture 1b, one Sun’s horizon is {formatLength(sunHorizonKm)} and that of 1,000 Suns is{' '}
            {formatLength(largeHorizonKm)}.
          </p>
          <p style={{ marginTop: '0.6rem', marginBottom: '0.3rem' }}>
            <strong>What to look for</strong>
          </p>
          <ol style={{ margin: 0, paddingLeft: '1.1rem' }}>
            <LookFor
              look={<>the yellow dot and the red horizon line in Picture 1.</>}
              means={
                <>
                  the red line is the critical size, and the dot began about {formatNumber(squeezeFactor)} times
                  farther out. It had to travel all the way down to it.
                </>
              }
              matters={<>it shows how far an ordinary star is from being a black hole.</>}
            />
            <LookFor
              look={<>the white YOUR GUESS box on the ruler and the red line.</>}
              means={<>your first guess, drawn on the same ruler as the real result, so the two can be compared at a glance.</>}
              matters={<>you can see how near or far your guess was without any text. The tutor will go through it with you.</>}
            />
            <LookFor
              look={<>the two red bars and the white bar in Picture 1b.</>}
              means={
                <>
                  the horizon of 1,000 Suns ({formatLength(largeHorizonKm)}) next to that of one Sun (
                  {formatLength(sunHorizonKm)}), and your guess beside them.
                </>
              }
              matters={<>it shows how the critical size depends on the mass.</>}
            />
          </ol>
        </>
      )}
    </CaptionBox>
  )
}

// The caption under Picture 2 and Picture 3 (Part 2).
export function PartTwoCaption({ hasRun, objectLabel }: { hasRun: boolean; objectLabel: string }) {
  return (
    <CaptionBox>
      <p style={{ marginTop: 0, marginBottom: '0.5rem' }}>
        <strong>How to read these diagrams.</strong> They show the same squeeze as Picture 1, but for the object and
        the final radius that <em>you</em> choose. They carry no white marks: your guesses are about the real Sun in
        Part 1.
      </p>
      <p style={{ marginTop: '0.6rem', marginBottom: '0.3rem' }}>
        <strong>Picture 2, your ruler</strong>
      </p>
      <ol style={{ margin: 0, paddingLeft: '1.1rem' }}>
        <li style={li}>
          <strong>The ruler, the red horizon line and the gray dots</strong> mean exactly what they did in Picture 1.
          The ruler’s ends change with the object you pick, because every object has its own horizon radius.
        </li>
        <li style={li}>
          <strong>The dot is the object’s radius right now.</strong> Before you press Run it sits at the right end,
          the starting size. For Earth, the Sun and the neutron star that is the real size. The three black holes
          have no real size to start from, so they start from a made-up (hypothetical) ball 100 times wider than
          their horizon radius. When you press Run, the dot slides left and stops at the dashed circle, the radius
          you chose.
        </li>
      </ol>
      <p style={{ marginTop: '0.6rem', marginBottom: '0.3rem' }}>
        <strong>Picture 3, the ball</strong>
      </p>
      <ol style={{ margin: 0, paddingLeft: '1.1rem' }}>
        <li style={li}>
          <strong>The filled circle (labelled “The ball”) is the object</strong> with all of its mass squeezed to the
          radius in the legend. <strong>The red dashed circle (labelled “Horizon radius”) is the critical size</strong>,
          the same as the red line in Picture 2. It never changes size.
        </li>
        <li style={li}>
          <strong>Compare the two circles.</strong> While the filled circle is bigger than the red one, the object is
          not a black hole. When it fits inside the red one it turns pink: a black hole.
        </li>
        <li style={li}>
          <strong>This picture is not to scale.</strong> Real sizes differ by billions of times and cannot be drawn
          on one screen, so the drawing grows much more slowly than the real size. Trust only the comparison:
          bigger than the red circle, the same, or smaller. Picture 2 tells you by how much.
        </li>
      </ol>
      {hasRun ? (
        <>
          <p style={{ marginTop: '0.6rem', marginBottom: '0.3rem' }}>
            <strong>What to look for</strong> (for {objectLabel})
          </p>
          <ol style={{ margin: 0, paddingLeft: '1.1rem' }}>
            <LookFor
              look={<>the dot’s starting place and the red line in Picture 2.</>}
              means={<>how far this object’s real size is from its own critical size.</>}
              matters={<>different objects are far from, or close to, being black holes.</>}
            />
            <LookFor
              look={<>the filled circle and the red dashed circle in Picture 3 as the squeeze passes the horizon.</>}
              means={<>the object turns pink and its label changes once the ball is at or inside the red circle.</>}
              matters={<>it shows that being a black hole depends only on mass squeezed inside its horizon radius.</>}
            />
          </ol>
        </>
      ) : (
        <p style={{ marginTop: '0.6rem', marginBottom: 0 }}>
          <strong>What to look for:</strong> choose an object and a radius above and press Run. The “what to look
          for” items appear once you have run it.
        </p>
      )}
    </CaptionBox>
  )
}
