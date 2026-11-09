import type { ReactNode } from 'react'
import { halfTripNumbers, runLightClockExperiment, trialTickCheck, triangleSquares } from '../physics/lightClockExperiment'
import { MUTED_COLOR, TEXT_COLOR, svgStyle } from './GravitationalWaveExperiment'
import { LookForList } from './WideBinariesExperiment'

// Relativity of Time and Motion, Experiment 4: the introduction's "Why does time dilation happen?" section, added at the owner's
// request on 2026-11-08 (docs/audit/relativity-of-time-and-motion/04-draft-wording.md, Addendum 3, approved "approved all"): the
// whole reason in seven small steps, a worked example at 0.6c (a 3-4-5 triangle) and a static picture of that triangle. The worked
// example is NOT Part 1's speed (0.5c), so the learner still has to apply the method to predict. Every number comes from the
// physics module (src/physics/lightClockExperiment.ts; CLAUDE.md §9). The wording is the owner's to approve line by line (§28.1).

export const WORKED_VELOCITY = 0.6
const WORKED_LAB_SECONDS = 10

const GUESS_FREE_COLORS = { side: '#f59e0b', rise: '#3b82f6', diagonal: '#e6a700' }

const round3 = (n: number) => parseFloat(n.toFixed(3))
// The squares in the right-triangle check are exact short decimals (0.140625, 0.390625), shown in full as the approved wording does.
const exact = (n: number) => parseFloat(n.toFixed(6))
const pad = { marginTop: 0, marginBottom: '0.75rem' } as const

// ---- The picture: the right triangle for one trip up at 0.6c ----
const W = { width: 580, height: 330 }
const SCALE = 340 // drawing pixels per light-second
const ORIGIN = { x: 230, y: 232 } // the corner where the flash starts (bottom-left)

export function RightTriangleFigure({ label }: { label: string }) {
  const e = runLightClockExperiment(WORKED_VELOCITY)
  const n = halfTripNumbers(e)
  const q = triangleSquares(e)
  const a = { x: ORIGIN.x, y: ORIGIN.y } // where the flash starts
  const b = { x: ORIGIN.x + n.sidewaysHalf * SCALE, y: ORIGIN.y } // directly below the top mirror's new place (the square corner)
  const c = { x: b.x, y: ORIGIN.y - n.rise * SCALE } // the top mirror's new place
  const corner = 14
  const stroke = { stroke: '#0b1020', strokeWidth: 4, paintOrder: 'stroke' } as const

  return (
    <svg width={W.width} height={W.height} viewBox={`0 0 ${W.width} ${W.height}`} style={svgStyle} role="img" aria-label={label}>
      <text x={14} y={22} fill={TEXT_COLOR} fontSize="13" fontWeight="bold">
        One trip up in a light clock moving at {WORKED_VELOCITY}c, seen from the lab (units: light-seconds)
      </text>
      {/* the sideways leg: how far the clock slides during the trip up */}
      <line x1={a.x} y1={a.y} x2={b.x} y2={b.y} stroke={GUESS_FREE_COLORS.side} strokeWidth={5} />
      <text x={(a.x + b.x) / 2} y={a.y + 24} fill={GUESS_FREE_COLORS.side} fontSize="12" fontWeight="bold" textAnchor="middle" {...stroke}>
        The clock slides sideways: {round3(n.sidewaysHalf)}
      </text>
      {/* the vertical leg: how far the flash rises */}
      <line x1={b.x} y1={b.y} x2={c.x} y2={c.y} stroke={GUESS_FREE_COLORS.rise} strokeWidth={5} />
      <text x={b.x + 12} y={(b.y + c.y) / 2 + 4} fill={GUESS_FREE_COLORS.rise} fontSize="12" fontWeight="bold" {...stroke}>
        The flash rises: {round3(n.rise)}
      </text>
      {/* the diagonal: the flash's path up the slant */}
      <line x1={a.x} y1={a.y} x2={c.x} y2={c.y} stroke={GUESS_FREE_COLORS.diagonal} strokeWidth={5} />
      <text x={(a.x + c.x) / 2 - 10} y={(a.y + c.y) / 2 - 8} fill={GUESS_FREE_COLORS.diagonal} fontSize="12" fontWeight="bold" textAnchor="end" {...stroke}>
        The diagonal (the flash&rsquo;s path): {round3(n.diagonal)}
      </text>
      {/* the square corner */}
      <polyline points={`${b.x - corner},${b.y} ${b.x - corner},${b.y - corner} ${b.x},${b.y - corner}`} fill="none" stroke={TEXT_COLOR} strokeWidth={1.5} />
      <text x={b.x + 8} y={b.y - 22} fill={MUTED_COLOR} fontSize="10">
        square corner
      </text>
      {/* the two ends of the slant */}
      <circle cx={a.x} cy={a.y} r={6} fill={TEXT_COLOR} />
      <text x={a.x - 10} y={a.y + 4} fill={TEXT_COLOR} fontSize="11" textAnchor="end" {...stroke}>
        Flash leaves the bottom mirror
      </text>
      <circle cx={c.x} cy={c.y} r={6} fill={TEXT_COLOR} />
      <text x={c.x + 12} y={c.y - 8} fill={TEXT_COLOR} fontSize="11" {...stroke}>
        Top mirror, now further along
      </text>
      <text x={14} y={W.height - 34} fill={TEXT_COLOR} fontSize="12" fontWeight="bold">
        {round3(n.rise)} × {round3(n.rise)} + {round3(n.sidewaysHalf)} × {round3(n.sidewaysHalf)} = {exact(q.riseSquared)} +{' '}
        {exact(q.sidewaysHalfSquared)} = {exact(q.sum)}
      </text>
      <text x={14} y={W.height - 16} fill={TEXT_COLOR} fontSize="12" fontWeight="bold">
        {round3(n.diagonal)} × {round3(n.diagonal)} = {exact(q.diagonalSquared)}: the two are equal
      </text>
    </svg>
  )
}

function CaptionBox({ children }: { children: ReactNode }) {
  return (
    <div
      style={{
        marginTop: '0.75rem',
        padding: '0.75rem 1rem',
        fontSize: '0.8125rem',
        border: '1px solid var(--border)',
        borderRadius: '6px',
        color: 'var(--text-muted)',
      }}
    >
      {children}
    </div>
  )
}

export function TriangleCaption() {
  const e = runLightClockExperiment(WORKED_VELOCITY)
  const n = halfTripNumbers(e)
  const q = triangleSquares(e)
  const items = [
    {
      look: 'the diagonal and the two short sides.',
      means: `The diagonal is ${round3(n.diagonal)} light-seconds long; the two short sides are ${round3(n.rise)} and ${round3(n.sidewaysHalf)}. The diagonal is longer than either.`,
      matters: 'It shows that the flash has farther to go in the lab than if it only went straight up.',
    },
    {
      look: 'the square corner.',
      means: 'The up side and the sideways side meet at a right angle, like the corner of a sheet of paper.',
      matters: 'The rule that links the three sides works only for a triangle with a square corner.',
    },
    {
      look: 'the two lines of arithmetic at the bottom.',
      means: `${round3(n.rise)} × ${round3(n.rise)} + ${round3(n.sidewaysHalf)} × ${round3(n.sidewaysHalf)} = ${exact(q.sum)}, and ${round3(n.diagonal)} × ${round3(n.diagonal)} = ${exact(q.diagonalSquared)}. They are equal.`,
      matters: 'It is how we know that 1.25 seconds is the right tick for this speed: only then do the three sides fit the rule exactly.',
    },
  ]
  return (
    <CaptionBox>
      <p style={{ marginTop: 0, marginBottom: '0.5rem' }}>
        <strong>How to read this drawing.</strong>
      </p>
      <ul style={{ margin: 0, paddingLeft: '1.25rem' }}>
        <li>
          <strong>What it shows:</strong> only the <em>trip up</em>, which is half of one tick, for a light clock moving sideways at{' '}
          {WORKED_VELOCITY}c, seen from the lab. It is a worked example for the explanation, not Part 1&rsquo;s run (Part 1 uses 0.5c).
        </li>
        <li>
          <strong>The three sides:</strong> the amber side along the bottom is how far the clock slides sideways while the flash goes
          up ({round3(n.sidewaysHalf)}); the blue side is how far the flash rises (the mirror gap, {round3(n.rise)}); the yellow
          slanted side is the path the flash takes in the lab ({round3(n.diagonal)}). All are in light-seconds (one light-second is
          about 300,000 km).
        </li>
        <li>
          <strong>The two dots:</strong> the lower dot is where the flash leaves the bottom mirror; the upper dot is where the top
          mirror has got to by the time the flash arrives.
        </li>
      </ul>
      <p style={{ marginBottom: '0.5rem' }}>
        <strong>A worked moment.</strong> The whole tick is the trip up and the trip back down, so every number doubles: the flash
        travels 2 × {round3(n.diagonal)} = {round3(e.movingLightPath)} light-seconds, the clock slides 2 × {round3(n.sidewaysHalf)} ={' '}
        {round3(e.sidewaysDistancePerTick)}, and the tick takes {round3(e.movingTickDuration)} seconds.
      </p>
      <p style={{ marginTop: 0, marginBottom: '0.5rem' }}>
        <strong>What to look for.</strong>
      </p>
      <LookForList items={items} />
    </CaptionBox>
  )
}

function Step({ title, children }: { title: string; children: ReactNode }) {
  return (
    <div style={{ marginBottom: '1rem' }}>
      <p style={{ margin: '0 0 0.25rem' }}>
        <strong>{title}</strong>
      </p>
      {children}
    </div>
  )
}

// The numbers for the "try a tick" step come from trialTickCheck. Every trial has the same four lines so the three can be compared.
function TrialBlock({ tick, rise }: { tick: number; rise: number }) {
  const t = trialTickCheck(WORKED_VELOCITY, tick)
  const unit = (x: number) => (x === 1 ? 'second' : 'seconds')
  const needSquared = rise * rise + t.sidewaysHalf * t.sidewaysHalf
  const verdictText =
    t.verdict === 'too-short'
      ? `In ${tick} ${unit(tick)} the flash has gone ${round3(t.flashHalfPath)}, but it must go ${round3(t.triangleHalfPath)} to reach the mirror. It is still on its way, so the trip up needs more time. The tick is longer than ${tick} s.`
      : t.verdict === 'too-long'
        ? `In ${tick} ${unit(tick)} the flash would go ${round3(t.flashHalfPath)}, but it only has to go ${round3(t.triangleHalfPath)} to reach the mirror. It would get there early, so the trip up needs less time. The tick is shorter than ${tick} s.`
        : `In ${tick} ${unit(tick)} the flash goes ${round3(t.flashHalfPath)}, and it must go ${round3(t.triangleHalfPath)} to reach the mirror. They are the same, so the flash reaches the mirror exactly when the trip up ends. The tick is ${tick} s.`
  return (
    <li style={{ marginBottom: '0.75rem' }}>
      <strong>Try a tick of {tick} {unit(tick)}.</strong>
      <ul style={{ margin: '0.25rem 0 0', paddingLeft: '1.25rem' }}>
        <li>
          <em>How far the flash goes up the slant:</em> light goes 1 light-second every second, so in {tick} {unit(tick)} it goes {round3(t.tick)}.
          The trip up is half of that: {round3(t.flashHalfPath)}.
        </li>
        <li>
          <em>How far the clock slides during the trip up:</em> in {tick} {unit(tick)} it slides {WORKED_VELOCITY} × {tick} = {round3(WORKED_VELOCITY * tick)}.
          Half of that: {round3(t.sidewaysHalf)}.
        </li>
        <li>
          <em>How far the flash needs to go to reach the mirror:</em> that is the long side of the triangle from Step 3, with short
          sides {rise} and {round3(t.sidewaysHalf)}. {rise} × {rise} + {round3(t.sidewaysHalf)} × {round3(t.sidewaysHalf)} = {exact(needSquared)}.
          The number that multiplied by itself gives {exact(needSquared)} is {round3(t.triangleHalfPath)}, so the flash needs {round3(t.triangleHalfPath)}.
        </li>
        <li>
          <em>Compare:</em> {verdictText}
        </li>
      </ul>
    </li>
  )
}

export function WhyTimeDilationSection() {
  const e = runLightClockExperiment(WORKED_VELOCITY)
  const n = halfTripNumbers(e)
  const rest = runLightClockExperiment(0.5)
  const tenSeconds = WORKED_LAB_SECONDS * e.timeDilationFactor

  return (
    <div
      style={{
        marginTop: 0,
        marginBottom: '0.75rem',
        padding: '0.75rem 1rem',
        borderLeft: '4px solid var(--accent-blue)',
        backgroundColor: 'rgba(37, 99, 235, 0.06)',
      }}
    >
      <p style={{ marginTop: 0, marginBottom: '0.5rem' }}>
        <strong>Why does time dilation happen? The whole idea, step by step.</strong>
      </p>
      <p style={pad}>
        In &ldquo;A moving clock&rdquo;, a moving clock counted less time than the lab&rsquo;s clock between the same two events.
        That is time dilation. Here is the whole reason, in seven small steps. Nothing needs more than a bit of arithmetic. We use the
        light clock because it makes each step easy to see.
      </p>

      <Step title="Step 1. A tick is a distance divided by a speed.">
        <p style={pad}>
          A light clock ticks each time the flash makes one round trip, up and back. How long that takes depends on only two things:
          how far the flash travels and how fast it goes. Time is distance divided by speed. A car going 60 km at 60 km an hour takes
          1 hour to go 60 km; going 120 km takes 2 hours. In our clock the flash goes up {rest.mirrorSeparation} and back down{' '}
          {rest.mirrorSeparation}, {rest.restLightPath} light-second in all. Light goes 1 light-second every second, so:
          time = distance ÷ speed = {rest.restLightPath} light-second ÷ 1 light-second per second = {rest.restTickDuration} second.
          One tick takes {rest.restTickDuration} second.
        </p>
      </Step>

      <Step title="Step 2. One tick, two views.">
        <p style={pad}>
          Now let the clock move sideways. Someone riding along with the clock sees nothing unusual: the lamp and both mirrors are
          right beside them, so the flash goes straight up and straight back down, exactly as in the clock that stands still. But
          someone in the lab sees the whole clock slide sideways while the flash is travelling. Toss a ball straight up inside a
          train moving at a steady speed. To you, on the train, it goes straight up and down. To a friend on the platform it traces
          a slanted path, because the train carries it forward all the time it is in the air. Same ball, two views, and both are
          correct. The same happens to the flash. So, from the lab, its path is slanted: up and sideways, then down and sideways, like an
          upside-down &ldquo;V&rdquo;.
        </p>
        <p style={pad}>
          Why that shape? Follow the flash in two trips. <strong>On the way up</strong>, the flash leaves the lamp and heads for the top
          mirror. All the while, the clock keeps sliding sideways, so the top mirror is farther along when the flash arrives than it
          was when the flash left. The flash has to cover that sideways drift as well as the rise, so it climbs at a slant: up and
          forward, like a ball tossed up on the train and seen from the platform. <strong>On the way down</strong>, the flash heads
          back to the lamp, which is still sliding sideways. So the flash again goes forward as it falls: down and forward. Put the two
          trips together and the path rises to a peak at the top mirror, then comes down again, both trips leaning the same way
          along the direction of motion. That is an upside-down &ldquo;V&rdquo;. (If the clock stood still, there would be no sideways
          drift, and the two trips would be a straight line up and the same line back down.)
        </p>
      </Step>

      <Step title="Step 3. The slanted path is longer.">
        <p style={pad}>
          Look at one half of the V, the trip up. It has two parts: the flash rises {n.rise} light-seconds, and, while it rises, the
          clock slides sideways. Together they make a <strong>right triangle</strong>. A right triangle has one square corner; the
          slanted side opposite the corner is the <strong>diagonal</strong>, and it is always longer than either of the other two
          sides. (Cutting across a field is shorter than walking along two sides of it, but longer than walking along either side
          alone.) So the flash has farther to go in the lab than in its own clock. The rule that links the three sides: each short
          side multiplied by itself, added together, equals the long side multiplied by itself. For example, a triangle with sides 3
          and 4 has a long side 5, because 3 × 3 + 4 × 4 = 9 + 16 = 25 = 5 × 5.
        </p>
        <RightTriangleFigure label={`A right triangle for one trip up at ${WORKED_VELOCITY}c: the clock slides sideways ${round3(n.sidewaysHalf)} light-seconds, the flash rises ${round3(n.rise)}, and the slanted path is ${round3(n.diagonal)}, with the arithmetic that shows they fit the rule.`} />
        <p style={{ marginTop: '0.5rem', marginBottom: 0, fontSize: '0.75rem' }}>
          <strong>Where the real picture comes from.</strong> Calculated here from the speed {WORKED_VELOCITY}c, not measured. The light
          clock is imagined: a giant clock with its mirrors half a light-second (150,000 km) apart, so that the numbers are easy to
          read. This is a worked example, not Part 1&rsquo;s run.
        </p>
        <TriangleCaption />
      </Step>

      <Step title="Step 4. Light does not speed up to make up the difference.">
        <p style={pad}>
          This is the key assumption, and it is surprising. In the lab, light always travels at the same speed, <strong>c</strong>,
          which is 1 light-second every second, whether the clock stands still or moves. It does not get a boost from the
          clock&rsquo;s sideways motion. This is one of the two basic ideas, called <strong>postulates</strong>, of Einstein&rsquo;s
          special theory of relativity; a postulate is a starting point a theory is built on. It is not what you would expect from
          everyday life: a ball thrown forward from a moving train is seen by the friend on the platform to go faster than the
          thrower&rsquo;s own throw, because the train&rsquo;s speed adds. Light does not behave like that. We take it as a fact of
          nature here, and the next chapter, &ldquo;Why can&rsquo;t light go faster?&rdquo;, looks at it.
        </p>
      </Step>

      <Step title="Step 5. A longer path at the same speed takes more time.">
        <p style={{ ...pad, marginBottom: '0.5rem' }}>
          Two runners at the same speed set off together; one runs straight, the other has to zig-zag. The zig-zagger arrives later.
          The flash is the second runner. Let us find its tick at {WORKED_VELOCITY}c (not the speed you will predict, so you still
          have work to do) by trying a value. For each try we ask two questions: how far does the flash go in that time, and how
          far does it need to go to reach the mirror? If the two match, we have the right tick. If the flash goes too short a
          distance, the tick must be longer; if it goes too far, the tick must be shorter. Each try uses the same four lines.
        </p>
        <ul style={{ marginTop: 0, marginBottom: '0.5rem', paddingLeft: '1.25rem' }}>
          <TrialBlock tick={1.0} rise={n.rise} />
          <TrialBlock tick={1.5} rise={n.rise} />
          <TrialBlock tick={e.movingTickDuration} rise={n.rise} />
        </ul>
        <p style={pad}>
          So at {WORKED_VELOCITY}c one tick takes {round3(e.movingTickDuration)} seconds on the lab&rsquo;s clocks, instead of{' '}
          {e.restTickDuration}.
        </p>
      </Step>

      <Step title="Step 6. What the moving clock itself says.">
        <p style={pad}>
          The person riding with the clock saw the flash go straight up and down, {e.restLightPath} light-second, which is one tick
          of their own clock: one second on their clock. But the lab says {round3(e.movingTickDuration)} seconds passed. So the lab
          says the moving clock counted 1 second while the lab&rsquo;s clocks counted {round3(e.movingTickDuration)}: the moving clock
          counts 1 ÷ {round3(e.movingTickDuration)} = {round3(e.timeDilationFactor)} of the lab&rsquo;s time. Over{' '}
          {WORKED_LAB_SECONDS} lab seconds it counts {WORKED_LAB_SECONDS} × {round3(e.timeDilationFactor)} = {round3(tenSeconds)} seconds.
          That is what &ldquo;A moving clock&rdquo; showed at {WORKED_VELOCITY}c: {WORKED_LAB_SECONDS} seconds on the lab&rsquo;s
          clocks, {round3(tenSeconds)} on the moving clock. The size of the effect depends on the speed: the faster the clock, the
          bigger the sideways slide, the longer the slant and the longer the tick.
        </p>
        <p style={pad}>
          <strong>Another way to see it.</strong> Think of the flash&rsquo;s speed as split into two parts: some of it keeps pace
          sideways with the clock, and what is left carries it up. The speed is c in all, so the part that carries it up is less than
          c. It climbs more slowly than in the clock that stands still, so each trip up takes longer. This is the same reason from
          another side.
        </p>
      </Step>

      <Step title="Step 7. Not only light clocks.">
        <p style={pad}>
          A light clock is just the simplest clock to reason about. If a light clock and some other clock were side by side, they
          could not disagree, so the other clock must slow down in the same way. (This step goes a little beyond the light clock
          itself; it is the same step the tutor&rsquo;s &ldquo;What this means for a traveller&rdquo; takes.)
        </p>
      </Step>

      <p style={pad}>
        <strong>In one breath.</strong> A moving light clock&rsquo;s flash has a longer, slanted path to cover in the lab; light&rsquo;s
        speed is the same, so each tick takes longer on the lab&rsquo;s clocks. That is time dilation.
      </p>
      <p style={{ marginTop: 0, marginBottom: 0 }}>
        <strong>How to use this in Part 1.</strong> You can now work out your prediction the same way: for the speed in Part 1, find
        the tick for which the flash just reaches the mirror. A close estimate is a good guess; it does not have to be exact.
      </p>
    </div>
  )
}
