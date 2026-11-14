import {
  MARKER_STAR_RADII_KPC,
  MAX_DARK_MATTER_AMOUNT,
  MAX_RADIUS_KPC,
  MIN_RADIUS_KPC,
  OBSERVED_SPEED_KM_PER_S,
  guessLineEndpoints,
  guessMarker,
  lapsInSimulatedSpan,
  orbitalPeriodYears,
  rotationCurve,
  runDarkMatterExperiment,
} from '../physics/darkMatterExperiment'
import type { MeasuredGuess, SpeedGuess } from '../physics/darkMatterExperiment'
import { MUTED_COLOR, TEXT_COLOR, YOURS_COLOR, svgStyle } from './GravitationalWaveExperiment'
import { CaptionBox, LookFor, listStyle } from './TidalEffectExperiment'

// Cosmology, Experiment 4, audited to the newer rules (docs/audit/cosmology/04-draft-wording.md, sections 3 and 4).
// Two pictures: the galaxy seen from above and the speed-against-distance graph. Every number (a speed, a lap, the position of a
// guess mark) comes from the physics module; this file only draws and words it (CLAUDE.md §9). White is only ever the learner's guess
// (§14). The guess marks are drawn only once the run has finished (§12).

export const GUESS_COLOR = '#ffffff'
export const VISIBLE_COLOR = '#38bdf8' // blue: calculated here, visible matter only
export const OBSERVED_COLOR = '#4ade80' // green: the page's given, measured reference
export const DARK_MATTER_COLOR = '#c084fc' // purple: the learner's dark matter (Part 2)

export const SPEED_GUESS_TEXT: Record<SpeedGuess, string> = {
  faster: 'faster than a near star',
  same: 'about the same as a near star',
  slower: 'slower than a near star',
}
export const MEASURED_GUESS_TEXT: Record<MeasuredGuess, string> = {
  match: 'match the visible-matter line',
  faster: 'be faster than the visible-matter line',
  slower: 'be slower than the visible-matter line',
}

// ---- galaxy view geometry ----
const GALAXY_SIZE = 380
const GALAXY_CENTER = GALAXY_SIZE / 2
const GALAXY_PX_PER_KPC = 150 / MAX_RADIUS_KPC

// ---- graph geometry ----
const GRAPH_WIDTH = 520
const GRAPH_HEIGHT = 340
const GRAPH_LEFT = 58
const GRAPH_RIGHT = GRAPH_WIDTH - 24
const GRAPH_TOP = 34
const GRAPH_BOTTOM = GRAPH_HEIGHT - 52
const GRAPH_MAX_SPEED = 300

const graphX = (radiusKpc: number) => GRAPH_LEFT + ((radiusKpc - MIN_RADIUS_KPC) / (MAX_RADIUS_KPC - MIN_RADIUS_KPC)) * (GRAPH_RIGHT - GRAPH_LEFT)
const graphY = (speed: number) => GRAPH_BOTTOM - (speed / GRAPH_MAX_SPEED) * (GRAPH_BOTTOM - GRAPH_TOP)
const fmt0 = (v: number) => v.toFixed(0)

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

// ---- the galaxy, seen from above ----
// `progress` is 0 to 1 of the fixed span of simulated time; the stars move at the speeds of `amount` (0 in Part 1).
// `showSpeeds` writes each star's speed beside it; it stays off until the run starts, so the picture does not give away guess 1 (§12).
export function GalaxyPicture({ amount, progress, showHalo, showSpeeds }: { amount: number; progress: number; showHalo: boolean; showSpeeds: boolean }) {
  const stars = rotationCurve(amount, MARKER_STAR_RADII_KPC).map((p) => {
    const speed = p.withDarkMatterSpeedKmPerS
    const laps = lapsInSimulatedSpan(p.radiusKpc, speed) * progress
    const angle = 2 * Math.PI * laps
    const rPx = p.radiusKpc * GALAXY_PX_PER_KPC
    return { ...p, speed, laps, x: GALAXY_CENTER + rPx * Math.cos(angle), y: GALAXY_CENTER - rPx * Math.sin(angle) }
  })
  const haloOpacity = !showHalo || amount === 0 ? 0 : 0.45 + 0.55 * Math.min(1, amount / MAX_DARK_MATTER_AMOUNT)
  return (
    <svg width={GALAXY_SIZE} height={GALAXY_SIZE} viewBox={`0 0 ${GALAXY_SIZE} ${GALAXY_SIZE}`} style={{ ...svgStyle, width: GALAXY_SIZE, maxWidth: '100%' }} role="img" aria-label="The galaxy, seen from above">
      <defs>
        <radialGradient id="dm-halo">
          <stop offset="0%" stopColor={DARK_MATTER_COLOR} stopOpacity={1} />
          <stop offset="100%" stopColor={DARK_MATTER_COLOR} stopOpacity={0.45} />
        </radialGradient>
        <radialGradient id="dm-visible">
          <stop offset="0%" stopColor="#fef3c7" stopOpacity={1} />
          <stop offset="100%" stopColor="#fbbf24" stopOpacity={0} />
        </radialGradient>
      </defs>
      <text x={GALAXY_CENTER} y={18} fill={TEXT_COLOR} fontSize="12" fontWeight="600" textAnchor="middle">
        The galaxy, seen from above
      </text>
      {haloOpacity > 0 && (
        <>
          <circle cx={GALAXY_CENTER} cy={GALAXY_CENTER} r={165} fill="url(#dm-halo)" opacity={haloOpacity} />
          <circle cx={GALAXY_CENTER} cy={GALAXY_CENTER} r={165} fill="none" stroke={DARK_MATTER_COLOR} strokeWidth={2} opacity={haloOpacity} />
        </>
      )}
      {MARKER_STAR_RADII_KPC.map((r) => (
        <g key={r}>
          <circle cx={GALAXY_CENTER} cy={GALAXY_CENTER} r={r * GALAXY_PX_PER_KPC} fill="none" stroke="#475569" strokeWidth={1} strokeDasharray="4 4" />
          <text x={GALAXY_CENTER} y={GALAXY_CENTER - r * GALAXY_PX_PER_KPC - 4} fill={MUTED_COLOR} fontSize="10" textAnchor="middle">
            {r} kpc{r === 8 ? ' (about the Sun)' : ''}
          </text>
        </g>
      ))}
      <circle cx={GALAXY_CENTER} cy={GALAXY_CENTER} r={26} fill="url(#dm-visible)" />
      <text x={GALAXY_CENTER} y={GALAXY_CENTER + 42} fill="#fde68a" fontSize="10" textAnchor="middle">
        visible matter (stars, gas)
      </text>
      {stars.map((s, i) => (
        <g key={s.radiusKpc}>
          <circle cx={s.x} cy={s.y} r={6} fill="#fde68a" stroke="#f8fafc" strokeWidth={1.5} />
          {/* The middle star's label goes below, so labels do not overlap when the stars line up */}
          {showSpeeds && (
            <text x={s.x} y={i === 1 ? s.y + 19 : s.y - 10} fill="#fde68a" fontSize="9" textAnchor="middle">
              {fmt0(s.speed)} km/s
            </text>
          )}
        </g>
      ))}
      <circle cx={GALAXY_CENTER - 78} cy={GALAXY_SIZE - 28} r={5} fill="#fde68a" stroke="#f8fafc" strokeWidth={1.5} />
      <text x={GALAXY_CENTER - 68} y={GALAXY_SIZE - 25} fill={TEXT_COLOR} fontSize="10">
        = a star orbiting at that distance
      </text>
      <text x={GALAXY_CENTER} y={GALAXY_SIZE - 10} fill={DARK_MATTER_COLOR} fontSize="10" textAnchor="middle">
        {haloOpacity > 0 ? 'purple glow = dark matter halo (imagined: it gives off no light)' : 'no dark matter halo'}
      </text>
    </svg>
  )
}

// ---- the graph: orbit speed against distance ----
export interface GraphPictureProps {
  // How much of the blue line is drawn (0 to 1 across 5 to 30 kpc); null draws no blue or green line (before the first Run).
  drawn: number | null
  // The learner's amount, for the purple line (Part 2); null draws none.
  amount: number | null
  // The learner's guesses; drawn in white only once the run has finished.
  guesses: { speed: SpeedGuess; measured: MeasuredGuess } | null
}

export function GraphPicture({ drawn, amount, guesses }: GraphPictureProps) {
  const curve = runDarkMatterExperiment(amount ?? 0).curve
  const limit = MIN_RADIUS_KPC + (drawn ?? 0) * (MAX_RADIUS_KPC - MIN_RADIUS_KPC)
  const blue = curve.filter((p) => p.radiusKpc <= limit).map((p) => `${graphX(p.radiusKpc).toFixed(1)},${graphY(p.visibleOnlySpeedKmPerS).toFixed(1)}`).join(' ')
  const purple = amount === null ? '' : curve.map((p) => `${graphX(p.radiusKpc).toFixed(1)},${graphY(p.withDarkMatterSpeedKmPerS).toFixed(1)}`).join(' ')
  const line = guesses ? guessLineEndpoints(guesses.speed) : null
  const marker = guesses ? guessMarker(guesses.measured) : null
  const mx = marker ? graphX(marker.radiusKpc) - 16 : 0
  return (
    <svg width={GRAPH_WIDTH} height={GRAPH_HEIGHT} viewBox={`0 0 ${GRAPH_WIDTH} ${GRAPH_HEIGHT}`} style={{ ...svgStyle, width: GRAPH_WIDTH, maxWidth: '100%' }} role="img" aria-label="Orbit speed against distance from the centre">
      <text x={GRAPH_WIDTH / 2} y={16} fill={TEXT_COLOR} fontSize="12" fontWeight="600" textAnchor="middle">
        Orbit speed against distance from the centre
      </text>
      <line x1={GRAPH_LEFT} y1={GRAPH_TOP} x2={GRAPH_LEFT} y2={GRAPH_BOTTOM} stroke={MUTED_COLOR} />
      <line x1={GRAPH_LEFT} y1={GRAPH_BOTTOM} x2={GRAPH_RIGHT} y2={GRAPH_BOTTOM} stroke={MUTED_COLOR} />
      {[0, 100, 200, 300].map((speed) => (
        <g key={speed}>
          <line x1={GRAPH_LEFT - 4} y1={graphY(speed)} x2={GRAPH_LEFT} y2={graphY(speed)} stroke={MUTED_COLOR} />
          <text x={GRAPH_LEFT - 8} y={graphY(speed) + 3} fill={MUTED_COLOR} fontSize="10" textAnchor="end">
            {speed}
          </text>
        </g>
      ))}
      {[5, 10, 15, 20, 25, 30].map((r) => (
        <g key={r}>
          <line x1={graphX(r)} y1={GRAPH_BOTTOM} x2={graphX(r)} y2={GRAPH_BOTTOM + 4} stroke={MUTED_COLOR} />
          <text x={graphX(r)} y={GRAPH_BOTTOM + 16} fill={MUTED_COLOR} fontSize="10" textAnchor="middle">
            {r}
          </text>
        </g>
      ))}
      <text x={(GRAPH_LEFT + GRAPH_RIGHT) / 2} y={GRAPH_BOTTOM + 32} fill={TEXT_COLOR} fontSize="11" textAnchor="middle">
        distance from the galaxy&rsquo;s centre (kpc)
      </text>
      <text x={14} y={(GRAPH_TOP + GRAPH_BOTTOM) / 2} fill={TEXT_COLOR} fontSize="11" textAnchor="middle" transform={`rotate(-90 14 ${(GRAPH_TOP + GRAPH_BOTTOM) / 2})`}>
        orbit speed (km/s)
      </text>

      {drawn !== null && (
        <>
          <line x1={graphX(MIN_RADIUS_KPC)} y1={graphY(OBSERVED_SPEED_KM_PER_S)} x2={graphX(MAX_RADIUS_KPC)} y2={graphY(OBSERVED_SPEED_KM_PER_S)} stroke={OBSERVED_COLOR} strokeWidth={2.5} strokeDasharray="6 4" />
          {blue && <polyline points={blue} fill="none" stroke={VISIBLE_COLOR} strokeWidth={3} />}
        </>
      )}
      {purple && <polyline points={purple} fill="none" stroke={DARK_MATTER_COLOR} strokeWidth={3} />}

      {/* Guess 1: a white line from the blue line's start, a direction only */}
      {line && (
        <g>
          <line x1={graphX(line.startRadiusKpc)} y1={graphY(line.startSpeedKmPerS)} x2={graphX(line.endRadiusKpc)} y2={graphY(line.endSpeedKmPerS)} stroke={GUESS_COLOR} strokeWidth={4} strokeDasharray="2 5" strokeLinecap="round" />
          <circle cx={graphX(line.endRadiusKpc)} cy={graphY(line.endSpeedKmPerS)} r={5} fill={GUESS_COLOR} />
          <line x1={graphX((line.startRadiusKpc + line.endRadiusKpc) / 2) - 40} y1={GRAPH_TOP + 36} x2={graphX((line.startRadiusKpc + line.endRadiusKpc) / 2) - 40} y2={graphY((line.startSpeedKmPerS + line.endSpeedKmPerS) / 2)} stroke={GUESS_COLOR} strokeWidth={1.5} />
          <GuessBox x={graphX((line.startRadiusKpc + line.endRadiusKpc) / 2) - 120} y={GRAPH_TOP + 4} width={160} line={`a far star: ${guesses!.speed === 'faster' ? 'faster' : guesses!.speed === 'slower' ? 'slower' : 'about the same'}`} />
        </g>
      )}

      {/* Guess 2: a white marker at the far end, a marker only */}
      {marker && (
        <g>
          {marker.kind === 'equals' && (
            <>
              <line x1={mx - 15} y1={graphY((marker.anchorSpeedKmPerS + marker.measuredSpeedKmPerS) / 2) - 7} x2={mx + 15} y2={graphY((marker.anchorSpeedKmPerS + marker.measuredSpeedKmPerS) / 2) - 7} stroke={GUESS_COLOR} strokeWidth={5} />
              <line x1={mx - 15} y1={graphY((marker.anchorSpeedKmPerS + marker.measuredSpeedKmPerS) / 2) + 7} x2={mx + 15} y2={graphY((marker.anchorSpeedKmPerS + marker.measuredSpeedKmPerS) / 2) + 7} stroke={GUESS_COLOR} strokeWidth={5} />
            </>
          )}
          {marker.kind === 'up' && (
            <>
              <line x1={mx} y1={graphY(marker.anchorSpeedKmPerS) - 4} x2={mx} y2={graphY(marker.measuredSpeedKmPerS + 40) + 8} stroke={GUESS_COLOR} strokeWidth={4} />
              <path d={`M ${mx - 8} ${graphY(marker.measuredSpeedKmPerS + 40) + 10} L ${mx} ${graphY(marker.measuredSpeedKmPerS + 40) - 4} L ${mx + 8} ${graphY(marker.measuredSpeedKmPerS + 40) + 10} Z`} fill={GUESS_COLOR} />
            </>
          )}
          {marker.kind === 'down' && (
            <>
              <line x1={mx} y1={graphY(marker.anchorSpeedKmPerS) + 4} x2={mx} y2={graphY(marker.anchorSpeedKmPerS - 45) - 8} stroke={GUESS_COLOR} strokeWidth={4} />
              <path d={`M ${mx - 8} ${graphY(marker.anchorSpeedKmPerS - 45) - 10} L ${mx} ${graphY(marker.anchorSpeedKmPerS - 45) + 4} L ${mx + 8} ${graphY(marker.anchorSpeedKmPerS - 45) - 10} Z`} fill={GUESS_COLOR} />
            </>
          )}
          <line x1={mx} y1={GRAPH_BOTTOM - 36} x2={mx} y2={marker.kind === 'down' ? graphY(marker.anchorSpeedKmPerS - 45) + 4 : marker.kind === 'equals' ? graphY((marker.anchorSpeedKmPerS + marker.measuredSpeedKmPerS) / 2) + 10 : graphY(marker.anchorSpeedKmPerS) + 6} stroke={GUESS_COLOR} strokeWidth={1.5} />
          <GuessBox x={mx - 150} y={GRAPH_BOTTOM - 34} width={180} line={`measured: ${guesses!.measured === 'match' ? 'matches the blue line' : guesses!.measured === 'faster' ? 'faster than the blue line' : 'slower than the blue line'}`} />
        </g>
      )}

      {/* Legend: only once the lines are drawn, so it names nothing before the learner has guessed (§12) */}
      {drawn !== null && (
      <g transform={`translate(${GRAPH_LEFT + 10}, ${GRAPH_BOTTOM - 74})`}>
        <line x1={0} y1={0} x2={22} y2={0} stroke={OBSERVED_COLOR} strokeWidth={2.5} strokeDasharray="6 4" />
        <text x={28} y={3} fill={TEXT_COLOR} fontSize="9.5">
          measured near the Sun, {OBSERVED_SPEED_KM_PER_S} km/s, rounded (given)
        </text>
        <line x1={0} y1={14} x2={22} y2={14} stroke={VISIBLE_COLOR} strokeWidth={3} />
        <text x={28} y={17} fill={TEXT_COLOR} fontSize="9.5">
          visible matter only: calculated here, teaching model
        </text>
        {amount !== null && (
          <>
            <line x1={0} y1={28} x2={22} y2={28} stroke={DARK_MATTER_COLOR} strokeWidth={3} />
            <text x={28} y={31} fill={TEXT_COLOR} fontSize="9.5">
              with your dark matter: calculated here
            </text>
          </>
        )}
      </g>
      )}
    </svg>
  )
}

// ---- captions: one for each picture. Sections appear as their feature appears (§12). ----

// Part 1, the galaxy picture.
export function Part1GalaxyCaption({ started, arrived }: { started: boolean; arrived: boolean }) {
  const [sun, , far] = rotationCurve(0, MARKER_STAR_RADII_KPC)
  const sunPeriodMillion = orbitalPeriodYears(8, sun.visibleOnlySpeedKmPerS) / 1e6
  const sunLaps = lapsInSimulatedSpan(8, sun.visibleOnlySpeedKmPerS)
  const ringRatio = MARKER_STAR_RADII_KPC[2] / MARKER_STAR_RADII_KPC[0]
  return (
    <CaptionBox>
      <p style={{ marginTop: 0, marginBottom: '0.5rem' }}>
        <strong>How to read this picture: the galaxy, seen from above.</strong>
      </p>
      <ul style={listStyle}>
        <li>
          The bright patch in the middle is the <strong>visible matter</strong>: the stars and gas we can see.
        </li>
        <li>
          The three dashed rings are <strong>8, 16 and 30 kpc</strong> from the centre. A kpc, or kiloparsec, is about 3,260 light-years. 8 kpc is about where our Sun is in the Milky Way.
        </li>
        <li>
          A small star orbits on each ring. A &ldquo;lap&rdquo; is one full circle around the centre.
        </li>
        {started && (
          <li>
            The number beside each star is its speed in <strong>km/s</strong>, kilometres per second (220 km/s is about 800,000 km an hour). They are the speeds the visible matter alone would give. The stars move at those speeds for a fixed billion years of galaxy time, played back in six
            seconds, so a faster star completes more laps.
          </li>
        )}
        <li>In Part 1 there is nothing else in this picture. There is no dark matter in it.</li>
      </ul>
      {arrived && (
        <>
          <p style={{ marginTop: '0.5rem', marginBottom: '0.5rem' }}>
            <strong>A worked moment (real numbers).</strong> Look at the star on the 8 kpc ring. It moves at <strong>{fmt0(sun.visibleOnlySpeedKmPerS)} km/s</strong>. One lap is 2 × π × 8 kpc ÷ {fmt0(sun.visibleOnlySpeedKmPerS)} km/s, which comes to about{' '}
            <strong>{fmt0(sunPeriodMillion)} million years</strong>. In the six seconds of the run a billion years go past, so this star makes about <strong>{sunLaps.toFixed(1)} laps</strong>.
          </p>
          <LookFor
            items={[
              {
                look: 'the three dashed rings.',
                means: `the outer ring is ${ringRatio.toFixed(2)} times as far from the centre as the 8 kpc ring (30 ÷ 8).`,
                matters: 'the graph beside this picture uses the same distances, so each ring is one place on its horizontal axis.',
              },
              {
                look: 'the three stars.',
                means: `the star on the 8 kpc ring moves at ${fmt0(sun.visibleOnlySpeedKmPerS)} km/s and the star on the 30 kpc ring at ${fmt0(far.visibleOnlySpeedKmPerS)} km/s, so the inner star finishes more laps in the same time.`,
                matters: "a star's speed decides how many laps it completes, so the stars' motion is another way of reading the graph.",
              },
            ]}
          />
        </>
      )}
    </CaptionBox>
  )
}

// Part 1, the graph.
export function Part1GraphCaption({ started, arrived }: { started: boolean; arrived: boolean }) {
  const [near, sun, , far] = rotationCurve(0, [MIN_RADIUS_KPC, 8, 16, MAX_RADIUS_KPC])
  return (
    <CaptionBox>
      <p style={{ marginTop: 0, marginBottom: '0.5rem' }}>
        <strong>How to read this picture: orbit speed against distance.</strong>
      </p>
      <ul style={listStyle}>
        <li>
          This graph is called a <strong>rotation curve</strong>. Along the bottom is distance from the centre in kpc, from 5 to 30. Up the side is orbit speed in <strong>km/s</strong>.
        </li>
        {started && (
          <>
            <li>
              The <strong style={{ color: VISIBLE_COLOR }}>blue line</strong> is the speed each star would need if the visible matter were all the mass. It is <strong>calculated here</strong> from a teaching model, not measured.
            </li>
            <li>
              The <strong style={{ color: OBSERVED_COLOR }}>green dashed line</strong> is a measured speed near the Sun, <strong>{OBSERVED_SPEED_KM_PER_S} km/s</strong>, drawn flat across the graph as a reference. It is rounded and given, not worked out here.
            </li>
          </>
        )}
        {arrived && (
          <>
            <li>
              A <strong>white dotted line</strong> with a YOUR GUESS box is your guess 1: a far star faster than, about the same as, or slower than a near star. It starts where the blue line starts. It is <strong>only a direction</strong> (up, level or down) with a fixed size that means
              nothing in itself. The real blue line is separate.
            </li>
            <li>
              A <strong>white marker</strong> at 30 kpc with a YOUR GUESS box is your guess 2: an equals sign between the two lines for &ldquo;match&rdquo;, an arrow pointing up for &ldquo;faster&rdquo;, an arrow pointing down for &ldquo;slower&rdquo;. It is{' '}
              <strong>only a marker</strong>: three answers carry no size. Neither mark says right or wrong.
            </li>
          </>
        )}
      </ul>
      {arrived && (
        <>
          <p style={{ marginTop: '0.5rem', marginBottom: '0.5rem' }}>
            <strong>A worked moment (real numbers).</strong> At 8 kpc the blue line is at <strong>{fmt0(sun.visibleOnlySpeedKmPerS)} km/s</strong> and the green line at {OBSERVED_SPEED_KM_PER_S}, a difference of {fmt0(OBSERVED_SPEED_KM_PER_S - sun.visibleOnlySpeedKmPerS)} km/s. At 30 kpc the
            blue line is at {fmt0(far.visibleOnlySpeedKmPerS)} and the green line still at {OBSERVED_SPEED_KM_PER_S}, a difference of {fmt0(OBSERVED_SPEED_KM_PER_S - far.visibleOnlySpeedKmPerS)}.
          </p>
          <LookFor
            items={[
              {
                look: 'the blue line, from left to right.',
                means: `it starts at ${fmt0(near.visibleOnlySpeedKmPerS)} km/s at 5 kpc and ends at ${fmt0(far.visibleOnlySpeedKmPerS)} km/s at 30 kpc: a drop of about half.`,
                matters: 'it is the speed the visible matter alone would give, so it is what a star would need to stay in orbit if nothing else were pulling on it.',
              },
              {
                look: 'the green dashed line.',
                means: `it stays at ${OBSERVED_SPEED_KM_PER_S} km/s across the whole graph.`,
                matters: 'it is the measured speed that the blue line is being compared with. It is a given value, not something this page works out.',
              },
              {
                look: 'the gap between the two lines at 30 kpc, and again at 8 kpc.',
                means: `at 30 kpc the gap is ${fmt0(OBSERVED_SPEED_KM_PER_S - far.visibleOnlySpeedKmPerS)} km/s; at 8 kpc it is ${fmt0(OBSERVED_SPEED_KM_PER_S - sun.visibleOnlySpeedKmPerS)}.`,
                matters: 'the experiment asks whether the matter we can see is enough, and this gap is the place where the two numbers sit side by side.',
              },
              {
                look: 'your white marks.',
                means: 'each shows where your guess sat against the lines you now see.',
                matters: 'you can compare your picture with the real one directly. The tutor in Part 4 goes through each guess.',
              },
            ]}
          />
        </>
      )}
    </CaptionBox>
  )
}

// Part 2, the galaxy with the learner's dark matter.
export function Part2GalaxyCaption({ amount }: { amount: number }) {
  const at8 = rotationCurve(amount, [8])[0]
  const at30 = rotationCurve(amount, [MAX_RADIUS_KPC])[0]
  const lapsAt8 = lapsInSimulatedSpan(8, at8.withDarkMatterSpeedKmPerS)
  const lapsAt30 = lapsInSimulatedSpan(MAX_RADIUS_KPC, at30.withDarkMatterSpeedKmPerS)
  return (
    <CaptionBox>
      <p style={{ marginTop: 0, marginBottom: '0.5rem' }}>
        <strong>How to read this picture: the galaxy with your dark matter.</strong>
      </p>
      <ul style={listStyle}>
        <li>
          <strong style={{ color: DARK_MATTER_COLOR }}>The purple glow</strong> shows how much dark matter you added: none, a faint glow or a strong one. It is <strong>imagined</strong> for the question. Real dark matter gives off no light, and nobody has photographed it.
        </li>
        <li>
          <strong>The stars</strong> now move at the speeds with your dark matter added, written beside each star. Press Run to play a billion years of galaxy time in six seconds.
        </li>
        <li>The bright patch, the dashed rings and the stars mean what they did in Part 1.</li>
      </ul>
      <p style={{ marginTop: '0.5rem', marginBottom: '0.5rem' }}>
        <strong>A worked moment (real numbers).</strong> With {amount.toFixed(2)} × the matching amount, the star on the 8 kpc ring moves at <strong>{fmt0(at8.withDarkMatterSpeedKmPerS)} km/s</strong>, which is about {lapsAt8.toFixed(1)} laps in a billion years. The star on the 30 kpc ring moves
        at {fmt0(at30.withDarkMatterSpeedKmPerS)} km/s, about {lapsAt30.toFixed(1)} laps.
      </p>
      <LookFor
        items={[
          {
            look: 'the strength of the purple glow.',
            means: 'a stronger glow is a larger amount.',
            matters: 'it is a way of seeing the size of the amount you chose, nothing more.',
          },
          {
            look: "the stars' speeds and laps.",
            means: 'with more dark matter the outer stars go faster, so they finish more laps in the same time.',
            matters: 'the amount changes the speeds. It does not change the distances.',
          },
        ]}
      />
    </CaptionBox>
  )
}

// Part 2, the graph with the purple line.
export function Part2GraphCaption({ amount }: { amount: number }) {
  const at8 = rotationCurve(amount, [8])[0]
  const matching8 = rotationCurve(1, [8])[0]
  const matching = rotationCurve(1, [MAX_RADIUS_KPC])[0]
  const half30 = rotationCurve(0.5, [MAX_RADIUS_KPC])[0]
  const double30 = rotationCurve(2, [MAX_RADIUS_KPC])[0]
  return (
    <CaptionBox>
      <p style={{ marginTop: 0, marginBottom: '0.5rem' }}>
        <strong>How to read this picture: orbit speed with your dark matter.</strong>
      </p>
      <ul style={listStyle}>
        <li>
          <strong style={{ color: DARK_MATTER_COLOR }}>The purple line</strong> is the speed each star would need with the visible matter <strong>and</strong> your dark matter, using v = √(G × M ÷ r), where M is all the mass inside the orbit. It is <strong>calculated here</strong>.
        </li>
        <li>
          The <strong style={{ color: VISIBLE_COLOR }}>blue line</strong> and the <strong style={{ color: OBSERVED_COLOR }}>green dashed line</strong> are the same as in Part 1. Your white guess marks stay in Part 1&rsquo;s graph.
        </li>
      </ul>
      <p style={{ marginTop: '0.5rem', marginBottom: '0.5rem' }}>
        <strong>A worked moment (real numbers).</strong> At 8 kpc, with the amount you chose ({amount.toFixed(2)} × the matching amount), the purple line is at <strong>{fmt0(at8.withDarkMatterSpeedKmPerS)} km/s</strong>. The visible matter alone gives {fmt0(at8.visibleOnlySpeedKmPerS)}, and at the
        matching amount it is {fmt0(matching8.withDarkMatterSpeedKmPerS)}.
      </p>
      <LookFor
        items={[
          {
            look: 'the purple line against the green dashed line.',
            means: `at the matching amount the purple line is ${fmt0(matching.withDarkMatterSpeedKmPerS)} km/s at 30 kpc, against the green ${OBSERVED_SPEED_KM_PER_S}; at half that amount it is ${fmt0(half30.withDarkMatterSpeedKmPerS)}, and at twice it is ${fmt0(double30.withDarkMatterSpeedKmPerS)}.`,
            matters: 'it shows how much extra mass the model needs to reach the measured speed, and that too little and too much both miss it.',
          },
        ]}
      />
    </CaptionBox>
  )
}

export { YOURS_COLOR }
