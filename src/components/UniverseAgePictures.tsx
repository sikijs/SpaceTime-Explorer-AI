import {
  BEST_FIT_DARK_ENERGY_FRACTION,
  GRAPH_MAX_YEARS,
  OLDEST_STARS_AGE_YEARS,
  constantSpeedRelativeSize,
  darkEnergyGuessMarker,
  darkEnergyExample,
  earlySizes,
  matterOnlyExample,
  matterOnlyGuessMarker,
  relativeSizeAtTime,
  runUniverseAgeExperiment,
  starTestPassShare,
  universeAgeYears,
} from '../physics/universeAgeExperiment'
import type { DarkEnergyGuess, MatterOnlyGuess } from '../physics/universeAgeExperiment'
import { hubbleTimeYears } from '../physics/bigBangExperiment'
import { MUTED_COLOR, TEXT_COLOR, svgStyle } from './GravitationalWaveExperiment'
import { CaptionBox, LookFor, listStyle } from './TidalEffectExperiment'

// Cosmology, Experiment 6, audited to the newer rules (docs/audit/cosmology/06-draft-wording.md, approved by the owner on 2026-11-15).
// One graph: how big the universe has been since the Big Bang, in three versions (purple, blue, green) and, in Part 2, the learner's own
// share (amber). Every number (an age, a size, the place of a guess mark) comes from the physics module; this file only draws and words it
// (CLAUDE.md §9). White is only ever the learner's guess (§14). The grey line and the guess marks are drawn only once the run has finished
// (§12).

export const GUESS_COLOR = '#ffffff'
export const CONSTANT_COLOR = '#a78bfa' // purple: Cosmology 2's constant-speed picture (a simplified model)
export const MATTER_ONLY_COLOR = '#38bdf8' // blue: a universe of only matter (calculated here)
export const BEST_FIT_COLOR = '#4ade80' // green: astronomers' best fit (calculated here at a given, rounded 70 percent)
export const YOUR_SHARE_COLOR = '#fbbf24' // amber: the learner's own share (Part 2)
const STARS_COLOR = '#94a3b8'

export const MATTER_GUESS_TEXT: Record<MatterOnlyGuess, string> = {
  longer: 'be older than',
  shorter: 'be younger than',
  same: 'be the same age as',
}
export const DARK_GUESS_TEXT: Record<DarkEnergyGuess, string> = {
  older: 'make the universe older',
  younger: 'make the universe younger',
  same: 'leave the universe the same age',
}

const billions = (years: number) => (years / 1e9).toFixed(2)
const BEST_PERCENT = Math.round(BEST_FIT_DARK_ENERGY_FRACTION * 100)

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

// ---- the graph ----
const GRAPH_WIDTH = 560
const GRAPH_LEFT = 60
const GRAPH_RIGHT = GRAPH_WIDTH - 20
const GRAPH_TOP = 114
const GRAPH_BOTTOM = 290
const GRAPH_MAX_SIZE = 1.15
const CURVE_POINTS = 120
// The guess strip (below the time axis) holds the two white marks, one row each.
const STRIP_ROW_1 = 352
const STRIP_ROW_2 = 390
const BASE_HEIGHT = 340
const GUESS_HEIGHT = 424

export const graphX = (years: number) => GRAPH_LEFT + (years / GRAPH_MAX_YEARS) * (GRAPH_RIGHT - GRAPH_LEFT)
export const graphY = (size: number) => GRAPH_BOTTOM - (size / GRAPH_MAX_SIZE) * (GRAPH_BOTTOM - GRAPH_TOP)

export interface AgeGraphProps {
  // 0 to 1: how far the purple, blue and green lines have been drawn (Part 1's run). 1 in Part 2.
  drawn: number
  // Part 2: the learner's share, drawn as the amber line, and how far it has been drawn (0 to 1)
  share: number | null
  shareDrawn: number
  // Only after the run has finished: the grey line and the white marks
  finished: boolean
  guesses: { matter: MatterOnlyGuess; dark: DarkEnergyGuess } | null
}

export function AgeGraph({ drawn, share, shareDrawn, finished, guesses }: AgeGraphProps) {
  const reached = drawn * GRAPH_MAX_YEARS
  const matterAge = universeAgeYears(0)
  const bestAge = universeAgeYears(BEST_FIT_DARK_ENERGY_FRACTION)
  const hubble = hubbleTimeYears()
  const yourAge = share === null ? null : universeAgeYears(share)
  const yourReached = shareDrawn * GRAPH_MAX_YEARS

  const lineUpTo = (sizeAt: (years: number) => number, endYears: number, reachedYears: number) => {
    const last = Math.min(reachedYears, endYears)
    if (last <= 0) return ''
    return Array.from({ length: CURVE_POINTS + 1 }, (_, i) => {
      const years = (i / CURVE_POINTS) * last
      return `${graphX(years).toFixed(1)},${graphY(sizeAt(years)).toFixed(1)}`
    }).join(' ')
  }
  const constantLine = lineUpTo(constantSpeedRelativeSize, hubble, reached)
  const matterLine = lineUpTo((t) => relativeSizeAtTime(t, 0), matterAge, reached)
  const bestLine = lineUpTo((t) => relativeSizeAtTime(t, BEST_FIT_DARK_ENERGY_FRACTION), bestAge, reached)
  const yourLine = share === null || yourAge === null ? '' : lineUpTo((t) => relativeSizeAtTime(t, share), yourAge, yourReached)

  // End dots: where each version reaches today's size. Labels are staggered in height because the ages can lie close together.
  const dots: Array<{ key: string; years: number; color: string; lift: number; name: string; reachedYears: number }> = [
    { key: 'matter', years: matterAge, color: MATTER_ONLY_COLOR, lift: 14, name: 'Matter only', reachedYears: reached },
    { key: 'best', years: bestAge, color: BEST_FIT_COLOR, lift: 32, name: `Best fit (${BEST_PERCENT}%)`, reachedYears: reached },
    { key: 'constant', years: hubble, color: CONSTANT_COLOR, lift: 50, name: 'Constant speed', reachedYears: reached },
  ]
  if (share !== null && yourAge !== null) dots.push({ key: 'yours', years: yourAge, color: YOUR_SHARE_COLOR, lift: 68, name: `Your share (${Math.round(share * 100)}%)`, reachedYears: yourReached })

  const marks = finished && guesses ? { matter: matterOnlyGuessMarker(guesses.matter), dark: darkEnergyGuessMarker(guesses.dark) } : null
  const height = marks ? GUESS_HEIGHT : BASE_HEIGHT
  const ticks = [0, 5, 10, 15, 20]
  const starX = graphX(OLDEST_STARS_AGE_YEARS)

  const drawMark = (kind: 'left' | 'right' | 'ring', fromYears: number, toYears: number, y: number, color: string) => {
    const x0 = graphX(fromYears)
    const x1 = graphX(toYears)
    return (
      <g>
        <circle cx={x0} cy={y} r={5} fill={color} />
        {kind === 'ring' ? (
          <circle cx={x0} cy={y} r={11} fill="none" stroke={GUESS_COLOR} strokeWidth={3.5} />
        ) : (
          <>
            <line x1={x0} y1={y} x2={x1} y2={y} stroke={GUESS_COLOR} strokeWidth={4} />
            <polygon
              points={kind === 'left' ? `${x1},${y} ${x1 + 9},${y - 6} ${x1 + 9},${y + 6}` : `${x1},${y} ${x1 - 9},${y - 6} ${x1 - 9},${y + 6}`}
              fill={GUESS_COLOR}
            />
          </>
        )}
      </g>
    )
  }

  return (
    <svg
      width={GRAPH_WIDTH}
      height={height}
      viewBox={`0 0 ${GRAPH_WIDTH} ${height}`}
      style={{ ...svgStyle, width: GRAPH_WIDTH, maxWidth: '100%', backgroundColor: '#0b1020' }}
      role="img"
      aria-label="How big the universe has been from the Big Bang to today: a purple dashed, a blue, a green and, in Part 2, an amber line, each ending at a dot that shows its age"
    >
      <text x={GRAPH_WIDTH / 2} y={16} fill={TEXT_COLOR} fontSize="12" fontWeight="600" textAnchor="middle">
        How big the universe was, from the Big Bang to today
      </text>

      {/* Legend */}
      <g fontSize="10" fill={TEXT_COLOR}>
        <line x1={GRAPH_LEFT + 4} y1={32} x2={GRAPH_LEFT + 28} y2={32} stroke={CONSTANT_COLOR} strokeWidth={2.5} strokeDasharray="6 4" />
        <text x={GRAPH_LEFT + 34} y={35}>Constant speed (Cosmology 2; calculated here)</text>
        <line x1={GRAPH_LEFT + 290} y1={32} x2={GRAPH_LEFT + 314} y2={32} stroke={MATTER_ONLY_COLOR} strokeWidth={2.5} />
        <text x={GRAPH_LEFT + 320} y={35}>Matter only (calculated here)</text>
        <line x1={GRAPH_LEFT + 4} y1={48} x2={GRAPH_LEFT + 28} y2={48} stroke={BEST_FIT_COLOR} strokeWidth={3} />
        <text x={GRAPH_LEFT + 34} y={51}>Astronomers&rsquo; best fit, about {BEST_PERCENT}% dark energy (calculated here)</text>
        {share !== null && (
          <>
            <line x1={GRAPH_LEFT + 372} y1={48} x2={GRAPH_LEFT + 394} y2={48} stroke={YOUR_SHARE_COLOR} strokeWidth={3.5} />
            <text x={GRAPH_LEFT + 399} y={51}>Your trial share</text>
          </>
        )}
      </g>

      {/* Axes */}
      <line x1={GRAPH_LEFT} y1={GRAPH_TOP} x2={GRAPH_LEFT} y2={GRAPH_BOTTOM} stroke={MUTED_COLOR} />
      <line x1={GRAPH_LEFT} y1={GRAPH_BOTTOM} x2={GRAPH_RIGHT} y2={GRAPH_BOTTOM} stroke={MUTED_COLOR} />
      {ticks.map((t) => (
        <g key={t}>
          <line x1={graphX(t * 1e9)} y1={GRAPH_BOTTOM} x2={graphX(t * 1e9)} y2={GRAPH_BOTTOM + 4} stroke={MUTED_COLOR} />
          <text x={graphX(t * 1e9)} y={GRAPH_BOTTOM + 16} fill={MUTED_COLOR} fontSize="10" textAnchor="middle">
            {t}
          </text>
        </g>
      ))}
      <text x={(GRAPH_LEFT + GRAPH_RIGHT) / 2} y={GRAPH_BOTTOM + 32} fill={TEXT_COLOR} fontSize="11" textAnchor="middle">
        Time since the Big Bang (billions of years)
      </text>
      <text x={14} y={(GRAPH_TOP + GRAPH_BOTTOM) / 2} fill={TEXT_COLOR} fontSize="11" textAnchor="middle" transform={`rotate(-90 14 ${(GRAPH_TOP + GRAPH_BOTTOM) / 2})`}>
        Relative size (today = 1)
      </text>
      <text x={GRAPH_LEFT - 6} y={graphY(0) + 4} fill={MUTED_COLOR} fontSize="10" textAnchor="end">
        0
      </text>
      <text x={GRAPH_LEFT - 6} y={graphY(1) + 4} fill={MUTED_COLOR} fontSize="10" textAnchor="end">
        1
      </text>

      {/* "Today" level */}
      <line x1={GRAPH_LEFT} y1={graphY(1)} x2={GRAPH_RIGHT} y2={graphY(1)} stroke="#475569" strokeDasharray="4 4" />
      <text x={GRAPH_LEFT + 8} y={graphY(1) - 5} fill={STARS_COLOR} fontSize="10">
        today&rsquo;s size
      </text>

      {/* Oldest known star clusters: a dotted line, only once the run has finished */}
      {finished && (
        <g>
          <line x1={starX} y1={graphY(1)} x2={starX} y2={GRAPH_BOTTOM} stroke={STARS_COLOR} strokeWidth={1.5} strokeDasharray="3 3" />
          <line x1={starX} y1={graphY(0.45)} x2={starX + 12} y2={graphY(0.45)} stroke={STARS_COLOR} strokeWidth={1.5} />
          <text fill={STARS_COLOR} fontSize="10">
            <tspan x={starX + 16} y={graphY(0.45) - 6}>◄ Oldest known star clusters:</tspan>
            <tspan x={starX + 16} y={graphY(0.45) + 7}>older than about {(OLDEST_STARS_AGE_YEARS / 1e9).toFixed(1)}</tspan>
            <tspan x={starX + 16} y={graphY(0.45) + 20}>billion years (a 2023 study)</tspan>
          </text>
        </g>
      )}

      {/* The versions of the universe's growth */}
      {constantLine && <polyline points={constantLine} fill="none" stroke={CONSTANT_COLOR} strokeWidth={2.5} strokeDasharray="6 4" />}
      {matterLine && <polyline points={matterLine} fill="none" stroke={MATTER_ONLY_COLOR} strokeWidth={2.5} />}
      {bestLine && <polyline points={bestLine} fill="none" stroke={BEST_FIT_COLOR} strokeWidth={3} />}
      {yourLine && <polyline points={yourLine} fill="none" stroke={YOUR_SHARE_COLOR} strokeWidth={3.5} />}

      {/* End dots with their ages */}
      {dots.map((d) =>
        d.reachedYears >= d.years ? (
          <g key={d.key}>
            <line x1={graphX(d.years)} y1={graphY(1)} x2={graphX(d.years)} y2={graphY(1) - d.lift + 4} stroke={d.color} strokeWidth={1} />
            <circle cx={graphX(d.years)} cy={graphY(1)} r={5} fill={d.color} />
            <text
              x={graphX(d.years)}
              y={graphY(1) - d.lift}
              fill={d.color}
              stroke="#0b1020"
              strokeWidth={3}
              paintOrder="stroke"
              fontSize="10"
              fontWeight="600"
              textAnchor={graphX(d.years) > GRAPH_WIDTH - 110 ? 'end' : 'middle'}
            >
              {d.name}: {billions(d.years)} billion years
            </text>
          </g>
        ) : null,
      )}

      {/* The white guess marks: drawn only once the run has finished, one row each below the time axis, each starting under the dot it
          is compared with. Markers only: the arrow's length is fixed and means nothing as a number. */}
      {marks && (
        <g>
          <line x1={graphX(hubble)} y1={graphY(1) + 6} x2={graphX(hubble)} y2={STRIP_ROW_1} stroke={CONSTANT_COLOR} strokeWidth={1} strokeDasharray="2 3" />
          <line x1={graphX(matterAge)} y1={graphY(1) + 6} x2={graphX(matterAge)} y2={STRIP_ROW_2} stroke={MATTER_ONLY_COLOR} strokeWidth={1} strokeDasharray="2 3" />
          <line x1={GRAPH_LEFT} y1={STRIP_ROW_1} x2={GRAPH_RIGHT} y2={STRIP_ROW_1} stroke="#1e293b" />
          <line x1={GRAPH_LEFT} y1={STRIP_ROW_2} x2={GRAPH_RIGHT} y2={STRIP_ROW_2} stroke="#1e293b" />
          <text x={GRAPH_RIGHT} y={STRIP_ROW_1 - 8} fill={MUTED_COLOR} fontSize="9" textAnchor="end">
            guess 1, from the purple dot
          </text>
          <text x={GRAPH_RIGHT} y={STRIP_ROW_2 - 8} fill={MUTED_COLOR} fontSize="9" textAnchor="end">
            guess 2, from the blue dot
          </text>
          {drawMark(marks.matter.kind, marks.matter.fromYears, marks.matter.toYears, STRIP_ROW_1, CONSTANT_COLOR)}
          {drawMark(marks.dark.kind, marks.dark.fromYears, marks.dark.toYears, STRIP_ROW_2, MATTER_ONLY_COLOR)}
          <line x1={GRAPH_LEFT + 150} y1={STRIP_ROW_1} x2={Math.min(graphX(marks.matter.fromYears), graphX(marks.matter.toYears)) - (marks.matter.kind === 'ring' ? 11 : 0)} y2={STRIP_ROW_1} stroke={GUESS_COLOR} strokeWidth={2} />
          <line x1={GRAPH_LEFT + 150} y1={STRIP_ROW_2} x2={Math.min(graphX(marks.dark.fromYears), graphX(marks.dark.toYears)) - (marks.dark.kind === 'ring' ? 11 : 0)} y2={STRIP_ROW_2} stroke={GUESS_COLOR} strokeWidth={2} />
          <GuessBox x={GRAPH_LEFT} y={STRIP_ROW_1 - 16} width={150} line={`matter only: ${guesses!.matter === 'shorter' ? 'shorter' : guesses!.matter === 'longer' ? 'longer' : 'the same'}`} />
          <GuessBox x={GRAPH_LEFT} y={STRIP_ROW_2 - 16} width={150} line={`dark energy: ${guesses!.dark === 'older' ? 'older' : guesses!.dark === 'younger' ? 'younger' : 'the same age'}`} />
        </g>
      )}
    </svg>
  )
}

// ---- captions ----

export function Part1GraphCaption({ started, arrived }: { started: boolean; arrived: boolean }) {
  const hubble = hubbleTimeYears()
  const matter = matterOnlyExample()
  const best = darkEnergyExample()
  const early = earlySizes()
  const matterAge = universeAgeYears(0)
  const bestAge = universeAgeYears(BEST_FIT_DARK_ENERGY_FRACTION)
  return (
    <CaptionBox>
      <p style={{ marginTop: 0, marginBottom: '0.5rem' }}>
        <strong>How to read this diagram.</strong> The graph tells the story of how big the universe has been at each moment since the Big Bang. It asks one question of each version of the story: when does it reach the size the universe has today? That moment is the <strong>age</strong> of that universe.
      </p>
      <p style={{ marginTop: 0, marginBottom: '0.25rem' }}>
        <strong>The two axes.</strong>
      </p>
      <ul style={listStyle}>
        <li>
          <strong>Across the bottom is time</strong>, counted from the Big Bang (on the far left), in billions of years. Moving right means later. (&ldquo;A billion years&rdquo; is 1,000,000,000 years.)
        </li>
        <li>
          <strong>Up the side is the universe&rsquo;s relative size</strong>: how far apart galaxies were, compared with today. The dashed line at 1 is &ldquo;today&rsquo;s size&rdquo;. A height of 0.5 would mean galaxies were half as far apart as now, and 0 is the Big Bang itself. It is not the size of any physical object.
        </li>
      </ul>
      {started && (
        <>
          <p style={{ marginTop: 0, marginBottom: '0.25rem' }}>
            <strong>The three lines.</strong> All three start together, at size 0 at the Big Bang, and grow upward.
          </p>
          <ul style={listStyle}>
            <li>
              <strong style={{ color: CONSTANT_COLOR }}>Purple dashed line:</strong> Cosmology 2&rsquo;s picture, in which the universe grew at one constant speed. It is a straight line. A simplified picture, <strong>calculated here</strong>.
            </li>
            <li>
              <strong style={{ color: MATTER_ONLY_COLOR }}>Blue line:</strong> a universe containing only matter. An imagined universe, <strong>calculated here</strong>.
            </li>
            <li>
              <strong style={{ color: BEST_FIT_COLOR }}>Green line:</strong> a universe with about {BEST_PERCENT} percent dark energy, the value astronomers&rsquo; measurements point to (a rounded value; NASA&rsquo;s WMAP page gives about 70). <strong>Calculated here at {BEST_PERCENT} percent; not a plot of measurements.</strong>
            </li>
          </ul>
          <p style={{ marginTop: 0, marginBottom: '0.25rem' }}>
            <strong>The dots.</strong>
          </p>
          <ul style={listStyle}>
            <li>
              Each line stops at a dot on the &ldquo;today&rsquo;s size&rdquo; line. The dot marks the moment that version reaches today&rsquo;s size. <strong>The number in its label is that version&rsquo;s age</strong>, in billions of years. The farther right the dot, the older the universe. The labels are at different heights only so that they do not overlap.
            </li>
          </ul>
        </>
      )}
      {arrived && (
        <>
          <p style={{ marginTop: 0, marginBottom: '0.25rem' }}>
            <strong>The grey dotted line.</strong>
          </p>
          <ul style={listStyle}>
            <li>
              It marks <strong>about {(OLDEST_STARS_AGE_YEARS / 1e9).toFixed(1)} billion years</strong>, a lower limit for the age of the oldest known star clusters, from a 2023 study (<strong>measured by others</strong>; it depends on the model the study used). A universe cannot be younger than the things inside it, like a pot that cannot have been boiling for longer than the stove has existed. So a dot to the <em>left</em> of the grey line describes a universe too young to be the real one. A dot to the right passes the test, but that only shows it is not too young, not that its age is exactly right. Treat the line as a rough test.
            </li>
          </ul>
          <p style={{ marginTop: 0, marginBottom: '0.25rem' }}>
            <strong>The white marks, below the time axis.</strong>
          </p>
          <ul style={listStyle}>
            <li>
              The <strong>white arrows and rings</strong> are <strong>your guesses</strong>, each in a YOUR GUESS box. <strong>Guess 1</strong> starts under the purple dot: an arrow pointing left for &ldquo;shorter&rdquo;, right for &ldquo;longer&rdquo;, a ring for &ldquo;the same&rdquo;. <strong>Guess 2</strong> starts under the blue dot: an arrow pointing right for &ldquo;older&rdquo;, left for &ldquo;younger&rdquo;, a ring for &ldquo;the same age&rdquo;. They are{' '}
              <strong>only markers</strong>: every arrow has the same fixed length, which means nothing as a number, and a ring only stands for &ldquo;the same&rdquo;. They do not say right or wrong. The faint dotted lines join each mark to the dot it is compared with.
            </li>
          </ul>
          <p style={{ marginTop: 0, marginBottom: '0.25rem' }}>
            <strong>A worked moment (real numbers).</strong> Look at the blue dot. In that version the universe reaches today&rsquo;s size after <strong>{billions(matterAge)} billion years</strong>. Why that number? Cosmology 2&rsquo;s Hubble time is {billions(matter.hubbleTimeYears)} billion years, and for a universe of only matter the page&rsquo;s calculation gives (2 ÷ 3) × {billions(matter.hubbleTimeYears)} = {billions(matter.ageYears)}. The green dot sits at <strong>{billions(bestAge)}</strong> and the purple dot at <strong>{billions(hubble)}</strong>. For the green line, the formula in the Words and formulas box gives {billions(best.hubbleTimeYears)} × {best.factor.toFixed(3)} × {best.asinhValue.toFixed(3)} = {billions(best.ageYears)}.
          </p>
          <LookFor
            items={[
              {
                look: 'the three dots on the “today’s size” line',
                means: `purple ${billions(hubble)}, green ${billions(bestAge)} and blue ${billions(matterAge)} billion years: three different ages from three different stories of the expansion.`,
                matters: 'the age depends on the whole history of the expansion, not on today’s speed alone, and today’s speed is the same in all three.',
              },
              {
                look: 'how steeply each line rises at the start',
                means: `at ${early.yearsAfterBigBang / 1e9} billion years the blue line is already at ${early.matterOnlySize.toFixed(2)}, the green line at ${early.bestFitSize.toFixed(2)} and the purple line at ${early.constantSpeedSize.toFixed(2)}.`,
                matters: 'the blue universe is biggest early, so it has the shortest way to go and gets to today’s size first.',
              },
              {
                look: 'the grey dotted line against the blue dot',
                means: `the blue dot (${billions(matterAge)}) is about ${((OLDEST_STARS_AGE_YEARS - matterAge) / 1e9).toFixed(1)} billion years to the left of the grey line (${(OLDEST_STARS_AGE_YEARS / 1e9).toFixed(1)}).`,
                matters: 'a universe younger than the stars inside it cannot be the real one.',
              },
              {
                look: 'the green dot against the grey line',
                means: `${billions(bestAge)} is to the right of ${(OLDEST_STARS_AGE_YEARS / 1e9).toFixed(1)}, by only ${((bestAge - OLDEST_STARS_AGE_YEARS) / 1e9).toFixed(2)}.`,
                matters: 'this universe passes the test, but narrowly, which is why the line is only a rough test.',
              },
              {
                look: 'the white marks',
                means: 'each shows which side of its dot your guess was on.',
                matters: 'you can compare your guess with the real graph directly; the tutor in Part 4 goes through each guess.',
              },
            ]}
          />
        </>
      )}
    </CaptionBox>
  )
}

export function Part2Caption({ share }: { share: number }) {
  const run = runUniverseAgeExperiment(share)
  const passShare = starTestPassShare()
  const passes = run.isOlderThanOldestStars
  return (
    <CaptionBox>
      <p style={{ marginTop: 0, marginBottom: '0.5rem' }}>
        <strong>How to read this diagram.</strong> It is the Part 1 graph again, with one new line. The <strong style={{ color: YOUR_SHARE_COLOR }}>amber line</strong> is a universe with <strong>your trial share</strong> of dark energy, and its amber dot, labelled with its age, shows when it reaches today&rsquo;s size. The purple, blue and green lines and the grey line are exactly as in Part 1. While your share is on the best fit ({BEST_PERCENT} percent) the amber line lies on the green one, so change the share to see it move. <strong>Calculated here from the share you choose; imagined for the question.</strong>
      </p>
      <LookFor
        items={[
          {
            look: 'the amber dot against the grey dotted line',
            means: `with ${Math.round(share * 100)} percent dark energy the amber dot is at ${billions(run.ageYears)} billion years, ${passes ? 'to the right of' : 'to the left of'} the grey line (${(OLDEST_STARS_AGE_YEARS / 1e9).toFixed(1)}). In this model the amber dot is to the right of the grey line from a share of about ${(passShare * 100).toFixed(0)} percent upward.`,
            matters: 'below that share this model’s universe is younger than the oldest stars, so it cannot be the real one.',
          },
        ]}
      />
    </CaptionBox>
  )
}
