import type { ReactNode } from 'react'
import { PART_ONE_DIRECTION, PART_ONE_SPEED, closedFormImageSpeed, runSeeingExperiment } from '../physics/seeingThePast'
import { LookForList } from './WideBinariesExperiment'

// Spacetime Geometry 4, the introduction above Part 1 (audit update, 2026-11-21). Wording from docs/audit/spacetime-geometry/04-draft-wording.md, approved by
// the owner on 2026-11-21 (CLAUDE.md §28.1). The introduction states the question and teaches what "seeing" is, without saying whether the image moves
// faster, slower or at the same speed: that is what the learner is asked to predict (CLAUDE.md §12). The links about jets that appear faster than light, and the
// formulas, are held back until after the first Run for the same reason.

const SVG_STYLE = {
  display: 'block',
  width: '100%',
  height: 'auto',
  border: '1px solid var(--border-color, #ccc)',
  borderRadius: '8px',
  overflow: 'hidden',
  backgroundColor: '#0b1020',
} as const
const TEXT_COLOR = '#e2e8f0'
const TICK_COLOR = '#cbd5e1'
const LAB_LINE_COLOR = '#38bdf8'
const SHIP_COLOR = '#f59e0b'
const CONE_COLOR = '#facc15'
const HALO = { paintOrder: 'stroke', stroke: '#0b1020', strokeWidth: 3 } as const
const captionStyle = { fontSize: '0.8125rem', color: 'var(--text-muted)', margin: '0.25rem 0 1rem' } as const
const paragraph = { marginTop: 0, marginBottom: '0.75rem' } as const
const two = (value: number) => value.toFixed(2)

function Ext({ href, children }: { href: string; children: ReactNode }) {
  return (
    <a href={href} target="_blank" rel="noreferrer">
      {children}
    </a>
  )
}

// ---- Figure A: one flash of light takes a trip, and the spaceship keeps flying ----

const A_WIDTH = 480
const A_HEIGHT = 240
const A_LEFT = 60
const A_PER_LS = 95
const aX = (position: number) => A_LEFT + position * A_PER_LS

export function LightTripFigure() {
  const axisY = 150
  const flashY = 82
  return (
    <svg
      viewBox={`0 0 ${A_WIDTH} ${A_HEIGHT}`}
      role="img"
      aria-label="Figure A: a line of distance from the lab in light-seconds. The lab's telescope is at 0. A spaceship was at 3 light-seconds when it sent a flash of light. The flash takes 3 seconds to reach the telescope. The spaceship keeps flying, so when the flash arrives it is somewhere else along the line. The telescope shows the spaceship at 3 light-seconds, where it was."
      style={SVG_STYLE}
    >
      <text x="12" y="20" fontSize="12" fontWeight="bold" fill={TEXT_COLOR}>
        A flash of light takes a trip
      </text>
      <line x1={aX(0)} y1={axisY} x2={aX(4)} y2={axisY} stroke={TICK_COLOR} strokeWidth="1.5" />
      {[0, 1, 2, 3, 4].map((p) => (
        <g key={p}>
          <line x1={aX(p)} y1={axisY} x2={aX(p)} y2={axisY + 5} stroke={TICK_COLOR} />
          <text x={aX(p)} y={axisY + 18} textAnchor="middle" fontSize="11" fill={TICK_COLOR}>
            {p}
          </text>
        </g>
      ))}

      {/* The flash: an arrow above the line, from where the spaceship was back to the telescope. */}
      <line x1={aX(3)} y1={flashY} x2={aX(3)} y2={axisY - 10} stroke={CONE_COLOR} strokeWidth="1" strokeDasharray="2 3" />
      <line x1={aX(0)} y1={flashY} x2={aX(0)} y2={axisY - 14} stroke={CONE_COLOR} strokeWidth="1" strokeDasharray="2 3" />
      <line x1={aX(3)} y1={flashY} x2={aX(0) + 10} y2={flashY} stroke={CONE_COLOR} strokeWidth="2.5" />
      <polygon points={`${aX(0)},${flashY} ${aX(0) + 11},${flashY - 5} ${aX(0) + 11},${flashY + 5}`} fill={CONE_COLOR} />
      <text x={(aX(0) + aX(3)) / 2} y={flashY - 10} textAnchor="middle" fontSize="11" fill={CONE_COLOR} style={HALO}>
        The flash: 3 seconds on the way
      </text>

      {/* The lab's telescope, at 0. */}
      <circle cx={aX(0)} cy={axisY} r="8" fill="#0b1020" stroke={LAB_LINE_COLOR} strokeWidth="2.5" />
      <text x={aX(0) - 20} y={axisY - 22} fontSize="11" fill={LAB_LINE_COLOR} style={HALO}>
        The lab's telescope
      </text>

      {/* Where the spaceship was when it sent the flash (solid square), and where it has flown to by the time the flash arrives (hollow square). */}
      <rect x={aX(3) - 7} y={axisY - 7} width="14" height="14" fill={SHIP_COLOR} />
      <line x1={aX(3) - 10} y1={axisY - 18} x2={aX(2) + 16} y2={axisY - 18} stroke={SHIP_COLOR} strokeWidth="1.5" strokeDasharray="4 3" />
      <polygon points={`${aX(2) + 8},${axisY - 18} ${aX(2) + 17},${axisY - 22} ${aX(2) + 17},${axisY - 14}`} fill={SHIP_COLOR} />
      <rect x={aX(2) - 7} y={axisY - 7} width="14" height="14" fill="#0b1020" stroke={SHIP_COLOR} strokeWidth="2.5" />
      <text x={aX(2) + 6} y={axisY - 30} textAnchor="middle" fontSize="11" fill={SHIP_COLOR} style={HALO}>
        Where it is when the flash arrives
      </text>
      <line x1={aX(3)} y1={axisY + 22} x2={aX(3)} y2={axisY + 36} stroke={SHIP_COLOR} strokeWidth="1" strokeDasharray="2 3" />
      <text x={aX(3) + 30} y={axisY + 48} textAnchor="end" fontSize="11" fill={SHIP_COLOR}>
        Where it was: the telescope shows it here
      </text>

      <text x={(aX(0) + aX(4)) / 2} y={axisY + 78} textAnchor="middle" fontSize="11" fill={TEXT_COLOR}>
        Distance from the lab (light-seconds)
      </text>
    </svg>
  )
}

export function LightTripCaption() {
  return (
    <div style={captionStyle}>
      <p style={{ margin: '0 0 0.5rem' }}>
        <strong>How to read Figure A.</strong> The line is distance from the lab, in <strong>light-seconds</strong> (a light-second is the distance light travels in one second, about 300,000
        kilometers). The lab's telescope is at 0. The picture shows one flash of light and one spaceship. It is an example, so how far the spaceship flies is only an example: that depends on its
        speed.
      </p>
      <ul style={{ margin: '0 0 0.5rem', paddingLeft: '1.25rem' }}>
        <li>
          <strong>The small circle, "The lab's telescope".</strong> Where the observer stands and looks.
        </li>
        <li>
          <strong>The solid orange square, "Where it was".</strong> The spaceship at the moment it sent the flash, 3 light-seconds from the telescope. This is also the place where the telescope shows it.
        </li>
        <li>
          <strong>The yellow arrow, "The flash".</strong> The flash travels back to the telescope. Light covers 1 light-second each second, so 3 light-seconds takes 3 seconds.
        </li>
        <li>
          <strong>The dashed orange arrow and the hollow square, "Where it is when the flash arrives".</strong> In those 3 seconds the spaceship kept flying toward the lab, so it is now closer to the telescope.
        </li>
        <li>
          <strong>The words under the line, "the telescope shows it here".</strong> What the telescope shows is the flash, and the flash left from the solid square. So the telescope shows the
          spaceship where it was.
        </li>
      </ul>
      <LookForList
        items={[
          {
            look: 'the solid square and the hollow square',
            means: 'the place the spaceship is shown at (the solid square) and the place it really is when the flash arrives (the hollow square) are different',
            matters: 'this gap is what the rest of the page is about: what you see is the past',
          },
        ]}
      />
      <p style={{ margin: '0.5rem 0 0', fontSize: '0.75rem' }}>
        <strong>Where the real picture comes from.</strong> <em>Calculated here:</em> the trip time, distance divided by the speed of light. <em>Imagined:</em> the spaceship, the lab and the flight; nothing
        was measured.
      </p>
    </div>
  )
}

// ---- Figure B: the map of space and time, one moment of looking, a generic path ----

const B_WIDTH = 600
const B_HEIGHT = 330
const B_ORIGIN_X = 130
const B_PER_LS = 80
const B_ORIGIN_Y = 285
const B_PER_S = 62
const bX = (position: number) => B_ORIGIN_X + position * B_PER_LS
const bY = (time: number) => B_ORIGIN_Y - time * B_PER_S

export function ConeFigure() {
  // One moment of looking (the dot) at time 3.2, a generic path that crosses the right-hand yellow line, and the squares it gives.
  const lookT = 3.2
  const pathFrom = { p: 1.0, t: 0.2 }
  const pathTo = { p: 3.0, t: 3.9 }
  const at = (u: number) => ({ p: pathFrom.p + (pathTo.p - pathFrom.p) * u, t: pathFrom.t + (pathTo.t - pathFrom.t) * u })
  const uSeen = (lookT - pathFrom.p - pathFrom.t) / (pathTo.t - pathFrom.t + (pathTo.p - pathFrom.p)) // where  t = lookT - p  on the path
  const uReal = (lookT - pathFrom.t) / (pathTo.t - pathFrom.t)
  const seen = at(uSeen)
  const real = at(uReal)
  return (
    <svg
      viewBox={`0 0 ${B_WIDTH} ${B_HEIGHT}`}
      role="img"
      aria-label="Figure B: a map of space and time, position across and time up. The lab's clock line goes straight up from position 0. A yellow dot on it is the moment of looking. Two yellow lines go down from the dot at 45 degrees: the past light cone. A spaceship's path crosses the right-hand yellow line. A hollow square marks where the path crosses the line, where the spaceship looks to be. A solid square on the path level with the dot marks where the spaceship really is at that moment."
      style={SVG_STYLE}
    >
      <text x="12" y="20" fontSize="12" fontWeight="bold" fill={TEXT_COLOR}>
        One moment of looking, on the map of space and time
      </text>
      <line x1={bX(-1)} y1={B_ORIGIN_Y} x2={bX(4)} y2={B_ORIGIN_Y} stroke={TICK_COLOR} strokeWidth="1.5" />
      <line x1={bX(-1)} y1={B_ORIGIN_Y} x2={bX(-1)} y2={bY(4.4)} stroke={TICK_COLOR} strokeWidth="1.5" />
      <text x={(bX(-1) + bX(4)) / 2} y={B_ORIGIN_Y + 32} textAnchor="middle" fontSize="11" fill={TEXT_COLOR}>
        Position (light-seconds, right is positive)
      </text>
      <text x="14" y={(B_ORIGIN_Y + bY(4.4)) / 2} textAnchor="middle" fontSize="11" fill={TEXT_COLOR} transform={`rotate(-90 14 ${(B_ORIGIN_Y + bY(4.4)) / 2})`}>
        Time on the lab's clock (seconds)
      </text>
      {[0, 1, 2, 3, 4].map((p) => (
        <g key={`p${p}`}>
          <line x1={bX(p)} y1={B_ORIGIN_Y} x2={bX(p)} y2={B_ORIGIN_Y + 5} stroke={TICK_COLOR} />
          <text x={bX(p)} y={B_ORIGIN_Y + 18} textAnchor="middle" fontSize="10" fill={TICK_COLOR}>
            {p}
          </text>
        </g>
      ))}
      {[0, 1, 2, 3, 4].map((t) => (
        <g key={`t${t}`}>
          <line x1={bX(-1) - 5} y1={bY(t)} x2={bX(-1)} y2={bY(t)} stroke={TICK_COLOR} />
          <text x={bX(-1) - 9} y={bY(t) + 4} textAnchor="end" fontSize="10" fill={TICK_COLOR}>
            {t}
          </text>
        </g>
      ))}

      {/* The lab's clock line. */}
      <line x1={bX(0)} y1={B_ORIGIN_Y} x2={bX(0)} y2={bY(4.4)} stroke={LAB_LINE_COLOR} strokeWidth="2" strokeDasharray="6 4" />
      <text x={bX(0) + 6} y={B_ORIGIN_Y - 8} fontSize="11" fill={LAB_LINE_COLOR} style={HALO}>
        The lab's clock line
      </text>

      {/* The past light cone from the moment of looking: two yellow lines going down at 45 degrees. */}
      <line x1={bX(0)} y1={bY(lookT)} x2={bX(lookT)} y2={bY(0)} stroke={CONE_COLOR} strokeWidth="2.5" />
      <line x1={bX(0)} y1={bY(lookT)} x2={bX(-1)} y2={bY(lookT - 1)} stroke={CONE_COLOR} strokeWidth="2.5" />
      <text x={bX(2.45)} y={bY(0.45) - 8} fontSize="10" fill={CONE_COLOR} textAnchor="middle" transform={`rotate(45 ${bX(2.45)} ${bY(0.45) - 8})`} style={HALO}>
        Past light cone
      </text>

      {/* A generic spaceship path (its speed is not shown), with where it looks to be and where it really is. */}
      <line x1={bX(pathFrom.p)} y1={bY(pathFrom.t)} x2={bX(pathTo.p)} y2={bY(pathTo.t)} stroke={SHIP_COLOR} strokeWidth="3" />
      <text x={bX(pathTo.p) + 6} y={bY(pathTo.t) + 4} fontSize="10" fill={SHIP_COLOR} style={HALO}>
        The spaceship's path
      </text>
      <circle cx={bX(0)} cy={bY(lookT)} r="6" fill={CONE_COLOR} stroke="#0b1020" strokeWidth="1.5" />
      <text x={bX(0) + 10} y={bY(lookT) - 8} fontSize="11" fill={CONE_COLOR} style={HALO}>
        The lab looks now
      </text>
      <rect x={bX(real.p) - 6} y={bY(lookT) - 6} width="12" height="12" fill={SHIP_COLOR} stroke="#0b1020" strokeWidth="1.5" />
      <text x={bX(real.p) + 12} y={bY(lookT) + 4} fontSize="11" fill={SHIP_COLOR} style={HALO}>
        Where the spaceship really is now
      </text>
      <rect x={bX(seen.p) - 6} y={bY(seen.t) - 6} width="12" height="12" fill="#0b1020" stroke={SHIP_COLOR} strokeWidth="2.5" />
      <text x={bX(seen.p) + 12} y={bY(seen.t) + 4} fontSize="11" fill={SHIP_COLOR} style={HALO}>
        Where the spaceship looks to be
      </text>
    </svg>
  )
}

export function ConeCaption() {
  return (
    <div style={captionStyle}>
      <p style={{ margin: '0 0 0.5rem' }}>
        <strong>How to read Figure B.</strong> This is a <strong>map of space and time</strong>, the kind used in the earlier experiments of this group. Sideways is <em>where</em>, in light-seconds
        from the lab. Upward is <em>when</em>, by the lab's clock, in seconds. A flash of light travels one light-second every second, so on the map it is a line sloping at 45 degrees.
      </p>
      <ul style={{ margin: '0 0 0.5rem', paddingLeft: '1.25rem' }}>
        <li>
          <strong>The lab's clock line.</strong> The dashed sky-blue line going straight up from position 0. The lab stays where it is, so as time passes it only moves up.
        </li>
        <li>
          <strong>The yellow dot, "The lab looks now".</strong> One moment when the observer looks through the telescope.
        </li>
        <li>
          <strong>The two yellow lines, the "past light cone".</strong> They go down from the dot at 45 degrees. Light covers 1 light-second each second, so light that reaches the telescope now and
          left 2 seconds ago came from 2 light-seconds away. Anything on a yellow line is something the telescope is showing right now.
        </li>
        <li>
          <strong>The orange line, "The spaceship's path".</strong> Where the lab works out the spaceship is at each moment. It is a generic path, drawn to show the idea, and its speed is not meant to
          match any run on this page.
        </li>
        <li>
          <strong>The hollow square, "Where the spaceship looks to be".</strong> Where the right-hand yellow line crosses the path: the place the spaceship was when it sent the light that is arriving now.
        </li>
        <li>
          <strong>The solid square, "Where the spaceship really is now".</strong> The spaceship's place on the path at the same height as the dot, which means at the same moment on the lab's clock.
        </li>
      </ul>
      <LookForList
        items={[
          {
            look: 'the hollow square, where the right-hand yellow line meets the orange path',
            means: 'it is the one place on the path whose light reaches the telescope at this moment',
            matters: 'this is how the page finds where the spaceship looks to be, at every moment of looking',
          },
        ]}
      />
      <p style={{ margin: '0.5rem 0 0', fontSize: '0.75rem' }}>
        <strong>Where the real picture comes from.</strong> <em>Calculated here:</em> the 45-degree lines (light covers one light-second each second) and where the path crosses them. <em>Imagined:</em>{' '}
        the path and the lab; nothing was measured.
      </p>
    </div>
  )
}

function Figure({ children, caption }: { children: ReactNode; caption: ReactNode }) {
  return (
    <div style={{ marginBottom: '0.75rem', maxWidth: '600px' }}>
      {children}
      {caption}
    </div>
  )
}

// ---- The introduction ----

export function SeeingThePastIntro() {
  return (
    <div style={{ marginBottom: '1.5rem', fontSize: '0.875rem', color: 'var(--text-muted)' }}>
      <p style={paragraph}>
        <strong>The question.</strong> When you look at something through a telescope, you do not see it as it is now. Light takes time to travel, so the light that reaches your eye left the thing
        a while ago. You already know this for the Sun: it is about 8 light-minutes from Earth (a light-minute is the distance light travels in one minute), so its light takes about 8 minutes to
        reach us and we see the Sun as it was 8 minutes ago. The nearest star system, Alpha Centauri, is about 4.3 light-years away (a light-year is the distance light travels in one year), so we
        see it as it was about 4.3 years ago. Now think of a spaceship that is <em>moving</em>. While its light is on the way to you, the spaceship keeps flying. So the place where it <em>looks</em>{' '}
        to be is not the place where it <em>is</em>. This experiment asks: where does the spaceship look to be, and does its image move at the same speed as the spaceship itself? The first three
        experiments of this group were about what is <em>measured</em>: the times and distances an observer works out from their own ruler and synchronized clocks, after allowing for the time light
        takes to travel. Experiment 3 ended by saying that this is not what the observer sees with their own eyes. This experiment is about what is <em>seen</em>.
      </p>

      <p style={paragraph}>
        <strong>A light trip takes time.</strong> Look at Figure A. A spaceship is 3 light-seconds from the lab. It sends out a flash of light, and the light needs 3 seconds to cross those 3
        light-seconds. In those 3 seconds the spaceship has flown on toward the lab, so it is now closer than 3 light-seconds. When the flash arrives, the telescope shows the spaceship where it <em>was</em>, 3 seconds ago, and not where it is now. A
        comparison from daily life: the light of a star you see tonight left the star years ago, and the star may have changed since.
      </p>
      <Figure caption={<LightTripCaption />}>
        <LightTripFigure />
      </Figure>

      <div style={{ marginBottom: '0.75rem' }}>
        <p style={{ marginTop: 0, marginBottom: '0.5rem' }}>
          <strong>Some words we will use.</strong> Here is each one in plain language.
        </p>
        <ul style={{ margin: 0, paddingLeft: '1.25rem' }}>
          <li>
            <strong>The lab's telescope:</strong> the telescope the observer looks through. It is <em>in the lab</em>, not on the spaceship. It stays at the lab's own place, which we call position
            0, and it never moves. On the diagram, the small circle at position 0 marks it and is labeled "The lab's eye and telescope". The spaceship is the thing being watched, far away from the
            telescope. The light that the telescope collects is light that left the spaceship and travelled to position 0.
          </li>
          <li>
            <strong>Light-second:</strong> the distance light travels in one second, about 300,000 kilometers. We measure distances in light-seconds, so light covers 1 light-second in 1 second, 2 in
            2 seconds, and so on.
          </li>
          <li>
            <strong>Measured position:</strong> where the lab works out the spaceship is at a given moment, using its ruler and its synchronized clocks, as in the earlier experiments.
          </li>
          <li>
            <strong>Looking time:</strong> the reading of the lab's clock at the moment the observer looks through the lab's telescope.
          </li>
          <li>
            <strong>Seen position, or where the spaceship looks to be:</strong> the position the spaceship had when it sent the light that reaches the telescope at the looking time. The light has to
            travel first, so what the telescope shows is the spaceship as it was earlier. For example, if the spaceship was 3 light-seconds away when it sent the light, the light takes 3 seconds to
            arrive, so at the moment it arrives, the telescope shows the spaceship as it was 3 seconds earlier. We call this the spaceship's <strong>image</strong>. When we say the image{' '}
            <em>moves</em>, we mean that the place where the spaceship looks to be changes as the looking time goes on.
          </li>
          <li>
            <strong>Past light cone:</strong> the set of all the events whose light reaches the observer at one moment. In Experiment 2, a light cone showed which events a flash of light from one event
            could reach later. The past light cone is the same cone turned to point back in time: it holds the events from which a flash of light could have reached the observer's eye now. On the
            diagram, its two edges go downward from the moment of looking, because the light left earlier.
          </li>
        </ul>
      </div>

      <div style={paragraph}>
        <p style={{ marginTop: 0, marginBottom: '0.5rem' }}>
          <strong>The map of space and time.</strong> Figure A showed one flash on a single line. To follow a spaceship that keeps moving, we need to show <em>where</em> it is and{' '}
          <em>when</em> it is there, both at once. A map can do that. Think of a train timetable: it tells you that the train is at one station at 9:00 and at the next station at 9:30. The
          map of space and time is that kind of timetable, drawn as a picture. <strong>Figure B, just below, is such a map. Read the steps here with Figure B in front of you.</strong>
        </p>
        <ol style={{ margin: '0 0 0.5rem', paddingLeft: '1.25rem' }}>
          <li>
            <strong>The two edges.</strong> The bottom edge is <em>where</em>: distance from the lab in light-seconds (0, 1, 2, 3, 4). The left edge is <em>when</em>: time on the lab's clock in
            seconds (0, 1, 2, 3, 4), with later times higher up. One dot on the map is one event: one place at one time.
          </li>
          <li>
            <strong>The lab: the sky-blue dashed line.</strong> The lab stays at position 0 all the time. As the seconds pass it only goes up, so its line is straight up and down. A thing that
            stays still always draws a straight up-and-down line.
          </li>
          <li>
            <strong>The spaceship: the orange line.</strong> It starts near the bottom, about 1 light-second from the lab, and ends near the top, about 3 light-seconds from the lab. It goes up
            (time passes) and also to the <em>right</em> (farther from the lab). So in Figure B this example spaceship is flying <em>away</em> from the lab. (Figure A's spaceship flew toward the
            lab. Either direction works the same way. A line leaning toward the right means moving away from the lab, and a line leaning toward the left means moving toward it.)
          </li>
          <li>
            <strong>How light is drawn: the two yellow lines.</strong> Figure B has no separate picture of a flash. The two yellow lines <em>are</em> the paths of light, as you will see in
            the next step. Light covers 1 light-second every second, so on the map, for every 1 step to the side, light goes 1 step up (1 light-second across takes 1 second). Steps of equal
            size to the side and up make a line slanting at exactly 45 degrees, like the diagonal of a square, and that is the slant of both yellow lines. (The ship's orange line leans less
            than 45 degrees away from straight up, about 28 degrees. That is right: a spaceship is slower than light. A line leaning <em>more</em> than 45 degrees would mean covering more than 1 light-second in
            1 second, which is faster than light, and nothing can do that.)
          </li>
          <li>
            <strong>The moment of looking: the yellow dot and the past light cone.</strong> The dot is on the lab's line, at about 3.2 seconds. The light that reaches the telescope at this
            moment left earlier, so it came from lower on the map, and it came from both sides. So think of two flashes arriving at the dot, one from the left and one from the right. Follow
            each one backward in time: that gives the two yellow lines going <em>down</em> and outward from the dot at 45 degrees. Together they are the <strong>past light cone</strong>.
            Every event on a yellow line sent out light that arrives at the telescope exactly now. So the telescope shows you the events on the yellow lines.
          </li>
          <li>
            <strong>The two squares: what you see, and what is true.</strong> The orange line has two squares on it. Read them one at a time.
            <ul style={{ margin: '0.25rem 0', paddingLeft: '1.25rem' }}>
              <li>
                <strong>The hollow square, "Where the spaceship looks to be".</strong> It is where the orange line crosses the right-hand yellow line. Look straight down from it to the bottom
                edge: it reads about <strong>1.7</strong>, so the spaceship was 1.7 light-seconds from the lab. Look straight left from it to the left edge: it reads about <strong>1.5</strong>,
                so this was at 1.5 seconds on the lab's clock. At that time the spaceship sent out the light that the telescope is receiving right now.
              </li>
              <li>
                <strong>The journey of that light.</strong> Follow the yellow line from the hollow square up to the yellow dot. It goes 1.7 across and 1.7 up, so the light took about 1.7 seconds.
                It left at 1.5 seconds, and 1.5 + 1.7 = 3.2, which is the moment of looking. The light is old: it left 1.7 seconds before the telescope looks.
              </li>
              <li>
                <strong>The solid square, "Where the spaceship really is now".</strong> To find it, start at the yellow dot (3.2 seconds) and go straight across, sideways, to the orange
                line. Everything on that level is at the same moment, 3.2 seconds. Now look straight down from the solid square to the bottom edge: it reads about <strong>2.6</strong>, so the
                spaceship is really 2.6 light-seconds from the lab at this moment.
              </li>
            </ul>
            <strong>Putting them together.</strong> The telescope shows the spaceship at 1.7 light-seconds, but it is really at 2.6. The two are about 0.9 light-seconds apart, because the
            spaceship kept flying away during the 1.7 seconds the light was on its way. The gap between the squares is the gap between what you see and where the spaceship is.
          </li>
        </ol>
        <p style={{ marginTop: 0, marginBottom: '0.5rem' }}>
          The path in Figure B is only an example, drawn to show the idea. Its speed is not the speed of any run on this page, and the numbers above are read off the picture, so they are
          approximate.
        </p>
      </div>
      <Figure caption={<ConeCaption />}>
        <ConeFigure />
      </Figure>

      <p style={paragraph}>
        <strong>What happens.</strong> A spaceship flies in a straight line, steadily, either toward the lab or away from it. The lab can work out where the spaceship really is at every moment,
        using its ruler and synchronized clocks. An observer in the lab also watches the spaceship through a telescope. As the lab's clock runs, the diagram shows a yellow dot, which is the moment of
        looking, climbing the lab's clock line. From the dot, the past light cone goes down. Where the cone crosses the spaceship's path, a hollow square shows where the spaceship looks to be. A
        solid square shows where the spaceship really is at that same moment. A second drawing plots both positions against the lab's clock, so you can compare how they change. At the end, a table
        and a drawing give the two speeds.
      </p>
      <p style={paragraph}>
        <strong>Your job.</strong> There are two things to do in Part 1. First, make your guess. A spaceship will fly <strong>toward the lab at 0.6c</strong> (0.6 of the speed of light). Compared with
        the spaceship's real speed, will its image seem to move slower, at the same speed, or faster? You are not graded, and a guess is fine. Second, press Run and watch the two squares and the graph.{' '}
        <strong>Your guess never changes the real pictures or the tables.</strong> Once you press Run it is drawn in white on the real picture beside the real result, and it is shown again beside the
        results. It is locked while you try other things; to change it, press Start over. In Part 2 you can choose the direction and the speed yourself. Those settings change the drawings in Part 2,
        and your guess does not.
      </p>
      <p style={paragraph}>
        <strong>What we assume.</strong> To keep the idea clear, we simplify the situation in five ways. (1) The spaceship flies straight toward the lab or straight away from it, so everything
        happens along one line. (2) Its speed stays steady, and there is no gravity. (3) The telescope shows only <em>where</em> the spaceship looks to be. It shows nothing about the spaceship's
        brightness or color. (4) The lab and its telescope stay at rest at position 0. Only the spaceship moves. (5) Nothing can travel faster than light. This rule applies to the spaceship, and to
        anything that carries a signal. Speeds are given as a fraction of <strong>c</strong>, the speed of light. For example, 0.6c means 60 percent of the speed of light, and 1c is the speed of light
        itself.
      </p>
      <p style={{ marginTop: 0, marginBottom: 0 }}>
        <strong>Some new words.</strong> The "Words and formulas" box below has each one in plain language: the lab's telescope, light-second, light-year, image and past light cone.
      </p>
    </div>
  )
}

// ---- Want to know more? Only the pages about light taking time are here; the pages about jets that appear faster than light wait until after the run (§12). ----

const linkItem = { marginBottom: '0.4rem' } as const

export function SeeingThePastLinks() {
  return (
    <div style={{ marginBottom: '1.5rem', fontSize: '0.875rem', color: 'var(--text-muted)' }}>
      <h4 style={{ margin: '0 0 0.5rem' }}>Want to know more?</h4>
      <p style={{ margin: '0 0 0.25rem', fontWeight: 'bold' }}>Plain pages</p>
      <ul style={{ marginTop: 0, marginBottom: '0.75rem', paddingLeft: '1.25rem' }}>
        <li style={linkItem}>
          <Ext href="https://science.nasa.gov/solar-system/cosmic-distances/">NASA Science, "Cosmic Distances"</Ext> (updated 6 November 2024): why the Sun is about 8 light-minutes away and looking at it is
          looking back about 8 minutes, the nearest star system, and what a light-year is.
        </li>
        <li style={linkItem}>
          <Ext href="https://science.nasa.gov/mission/hubble/science/science-behind-the-discoveries/time-travel-observing-cosmic-history/">NASA Science, "Time Travel: Observing Cosmic History"</Ext>{' '}
          (Hubble, updated 18 June 2026): that light takes time to reach a telescope, so we see objects as they were.
        </li>
        <li style={linkItem}>
          <Ext href="https://spaceplace.nasa.gov/light-year/en/">NASA Space Place, "What Is a Light-Year?"</Ext> (article updated 27 August 2020): a simple page on the light-year and on seeing farther
          away as seeing farther back in time.
        </li>
      </ul>
      <p style={{ margin: 0, fontSize: '0.75rem' }}>
        More links appear at the end of Part 3, after your run, because they would give away what Part 1 asks you to predict. No official page was found that explains "where a moving thing looks to be
        compared with where it is", so this page explains it in its own words.
      </p>
    </div>
  )
}

// ---- The collapsed "Words and formulas" box. The formulas appear only after the first Run, because a formula would give away the prediction. ----

export function seeingThePastWordsEntries(afterRun: boolean): { term: string; meaning: string }[] {
  const entries = [
    { term: "The lab's telescope", meaning: 'the telescope the observer looks through. It is in the lab at position 0 and never moves. The spaceship is the thing it looks at.' },
    { term: 'Light-second, light-minute, light-year', meaning: 'the distance light travels in a second, a minute or a year. A light-second is about 300,000 kilometers. The Sun is about 8 light-minutes from Earth, and the nearest star system, Alpha Centauri, is about 4.3 light-years away.' },
    { term: 'Measured position', meaning: 'where the lab works out the spaceship is at a given moment, using its ruler and synchronized clocks.' },
    { term: 'Looking time', meaning: 'the reading of the lab’s clock at the moment the observer looks through the telescope.' },
    { term: 'Seen position, or where the spaceship looks to be', meaning: 'the position the spaceship had when it sent the light that reaches the telescope at the looking time. The telescope shows the spaceship as it was earlier.' },
    { term: 'Image', meaning: 'the spaceship as the telescope shows it. When the image “moves”, the place where the spaceship looks to be changes as the looking time goes on.' },
    { term: 'Past light cone', meaning: 'all the events whose light reaches the observer at one moment. On the map of space and time it is two lines going down from the moment of looking, at 45 degrees.' },
    { term: 'Map of space and time', meaning: 'a picture with where (in light-seconds) across and when (the lab’s clock, in seconds) upward. A flash of light is a line sloping at 45 degrees.' },
    { term: 'c, and “0.6c”', meaning: 'c is the speed of light. 0.6c means 0.6 of it: 0.6 light-seconds each second, or 60 percent of the speed of light.' },
    { term: 'Image speed', meaning: 'how fast the place where the spaceship looks to be changes: the distance the image covers divided by the time between the first and last pictures arriving.' },
  ]
  if (!afterRun) {
    entries.push({ term: 'Formulas', meaning: 'they appear here after your first Run, because they would give away what Part 1 asks you to predict.' })
    return entries
  }
  // Every number is the physics module's, for Part 1's run.
  const run = runSeeingExperiment(PART_ONE_DIRECTION, PART_ONE_SPEED)
  const v = PART_ONE_SPEED
  const towards = closedFormImageSpeed('approaching', v)
  const away = closedFormImageSpeed('receding', v)
  entries.push(
    {
      term: 'The spaceship’s own speed = distance ÷ time',
      meaning: `for example, in Part 1 the spaceship covers ${two(run.distanceCovered)} light-seconds in ${two(run.measuredDuration)} seconds on the lab’s clock: ${two(run.distanceCovered)} ÷ ${two(run.measuredDuration)} = ${two(run.measuredSpeed)}c.`,
    },
    {
      term: 'The image’s speed = distance ÷ the time between the first and last pictures arriving',
      meaning: `the image covers the same ${two(run.distanceCovered)} light-seconds, but the first picture arrives at ${two(run.firstLooking)} seconds and the last at ${two(run.lastLooking)}: ${two(run.distanceCovered)} ÷ ${two(run.imageDuration)} = ${two(run.imageSpeed)}c.`,
    },
    {
      term: 'A shortcut: v ÷ (1 − v) coming toward the lab, v ÷ (1 + v) going away',
      meaning: `for a spaceship at speed v (as a fraction of c) the image’s speed comes out as this. Coming toward the lab at ${v}c: ${v} ÷ (1 − ${v}) = ${two(towards)}c. Going away at ${v}c: ${v} ÷ (1 + ${v}) = ${away.toFixed(3)}c. It comes only from straight-line motion and the time light takes to travel, so no formula from relativity is used.`,
    },
  )
  return entries
}
