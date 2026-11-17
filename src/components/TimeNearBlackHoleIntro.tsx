import type { ReactNode } from 'react'
import {
  FAR_CLOCK_RUN_SECONDS,
  JUST_OUTSIDE_GUESS_FACTOR,
  MIN_DISTANCE_IN_HORIZON_RADII,
  NEPTUNE_ORBIT_AU,
  BLACK_HOLE_PRESETS,
  escapeSpeedLadder,
  horizonComparisons,
  lightDistanceKm,
  runPartOne,
  runTimeNearBlackHoleExperiment,
  twoHolesAtTwoRadii,
  yearsToDriftOneSecond,
} from '../physics/timeNearBlackHoleExperiment'
import { M87_IMAGE, SGRA_IMAGE } from './BlackHoleIntro'
import { MUTED_COLOR, TEXT_COLOR, svgStyle } from './GravitationalWaveExperiment'
import { paragraph } from './TidalEffectExperiment'
import type { ObjectPreset } from '../physics/blackHoleSizeExperiment'
import { horizonRadiusKm } from '../physics/blackHoleSizeExperiment'
import { RUN_PLAYBACK_SECONDS, formatDistance, formatNumber, formatSmall } from './TimeNearBlackHolePictures'

// Black Holes, Experiment 2 (audit update): the illustrated introduction, the real tests so far, the "Want to know more?" list and the
// "Words and formulas" box (docs/audit/black-holes-and-strong-gravity/02-draft-wording.md, approved by the owner on 2026-11-16).
// It gives no answer to the three guesses (CLAUDE.md §12): it does not say that the slowing reaches zero at the horizon, that the mass does
// not matter, or where the simple formula fails. Two real pictures (the EHT, CC BY 4.0, via ESO) and one drawing made for this page.

const imgStyle = {
  display: 'block',
  maxWidth: '100%',
  height: 'auto',
  borderRadius: '8px',
  border: '1px solid var(--border-color, #ccc)',
  backgroundColor: '#000',
} as const

function Figure({ children, caption, credit }: { children: ReactNode; caption: ReactNode; credit: ReactNode }) {
  return (
    <figure style={{ margin: '1rem 0', padding: 0 }}>
      {children}
      <figcaption style={{ marginTop: '0.5rem', fontSize: '0.8125rem' }}>
        {caption} <span style={{ fontSize: '0.75rem' }}>{credit}</span>
      </figcaption>
    </figure>
  )
}

function Ext({ href, children }: { href: string; children: ReactNode }) {
  return (
    <a href={href} target="_blank" rel="noreferrer">
      {children}
    </a>
  )
}

// NIST, "Putting Einstein to the Test" (updated 17 April 2025), read on 2026-11-16.
const GPS_GRAVITY_MICROSECONDS_PER_DAY = 45
const GPS_SPEED_MICROSECONDS_PER_DAY = 7
const GPS_NET_MICROSECONDS_PER_DAY = 38

// Made-up reading, used only to show how the slowing factor is worked out (not a result of the experiment).
const MADE_UP_HOVERING_SECONDS = 36

const AMBER = '#f59e0b'
const SKY = '#60a5fa'
const GREEN = '#4ade80'

// Drawing 1: two clocks at different heights (an illustration, far exaggerated).
function HeightDrawing() {
  const clock = (cx: number, cy: number, color: string, hand: number) => (
    <g>
      <circle cx={cx} cy={cy} r={24} fill="#0f172a" stroke={color} strokeWidth={3} />
      <line x1={cx} y1={cy} x2={cx + 15 * Math.sin(hand)} y2={cy - 15 * Math.cos(hand)} stroke={color} strokeWidth={3} strokeLinecap="round" />
      <circle cx={cx} cy={cy} r={2.5} fill={color} />
    </g>
  )
  return (
    <svg
      viewBox="0 0 720 250"
      width="100%"
      style={{ ...svgStyle, maxWidth: '720px' }}
      role="img"
      aria-label="A mountain with a clock on top and a clock at sea level. The clock on top is labeled a little faster and the one at sea level a little slower. Illustration, far exaggerated."
    >
      <text x={14} y={22} fill={TEXT_COLOR} fontSize="13" fontWeight="bold">
        Drawing 1: a clock higher up ticks a little faster (illustration, far exaggerated)
      </text>
      <path d="M 90 220 L 250 70 L 410 220 Z" fill="#334155" stroke={MUTED_COLOR} />
      <line x1={20} y1={220} x2={700} y2={220} stroke={SKY} strokeWidth={3} />
      <text x={600} y={242} fill={SKY} fontSize="11" textAnchor="middle">
        sea level
      </text>
      {clock(250, 46, AMBER, 1.1)}
      <text x={290} y={50} fill={AMBER} fontSize="12">
        on the mountain: a little faster
      </text>
      {clock(520, 195, GREEN, 0.6)}
      <text x={520} y={150} fill={GREEN} fontSize="12" textAnchor="middle">
        at sea level: a little slower
      </text>
      <text x={14} y={240} fill={MUTED_COLOR} fontSize="11">
        The real difference is far too small to draw: see the real tests described above.
      </text>
    </svg>
  )
}

export function TimeNearBlackHoleIntro() {
  const ladder = escapeSpeedLadder()
  const horizons = horizonComparisons()
  const holes = twoHolesAtTwoRadii()
  const run = runPartOne()
  return (
    <div style={{ marginBottom: '1.5rem', fontSize: '0.875rem', color: 'var(--text-muted)' }}>
      <p style={paragraph}>
        <strong>The question.</strong> In Gravity and Curved Spacetime you saw that gravity slows clocks: a clock lower down in a gravity field
        ticks a little more slowly than one higher up. There the effect was tiny, or exaggerated on purpose. Near a black hole, gravity is as
        strong as it ever gets. So here is the question: how much does that slow a clock, and could it slow a clock all the way to a stop?
      </p>

      <h4 style={{ margin: '1.25rem 0 0.5rem' }}>Clocks really do tick at different rates</h4>
      <p style={paragraph}>
        This is not only a prediction of Einstein’s theory. Careful experiments have measured it, again and again, and every one of them agrees
        with one simple rule: <strong>the higher clock, where gravity is a little weaker, ticks a little faster than the lower clock, where
        gravity is a little stronger.</strong> Here are three of those tests.
      </p>

      <p style={{ ...paragraph, marginBottom: '0.3rem' }}>
        <strong>First, what does it mean for a clock to “tick faster”?</strong>
      </p>
      <p style={paragraph}>
        Every clock counts something that repeats at a steady pace: the swings of a pendulum, the beats of a quartz crystal, or, in an atomic
        clock, the vibrations of an atom. The NIST clocks used below each count the vibrations of one electrically charged aluminum atom.
        It vibrates more than a million billion times every second, and the best of the pair keeps time to within 1 second in about 3.7 billion
        years. “Ticking faster” means counting more of these repeats in the same stretch of time. Two clocks that count at different rates drift
        apart, like two runners at slightly different speeds: at first you cannot tell, but the gap keeps growing.
      </p>

      <p style={{ ...paragraph, marginBottom: '0.3rem' }}>
        <strong>Test 1 (2010): two clocks a foot apart.</strong>
      </p>
      <p style={paragraph}>
        Scientists at NIST, the United States’ standards institute, built two almost identical atomic clocks in two laboratories and joined them
        with a 75-meter optical fiber so that they could compare their ticks. Then they raised one clock, by lifting its laser table about
        one-third of a meter (33 centimeters, about a foot) above the other. The higher clock ran at a slightly faster rate, just as the theory
        predicts. The difference is far too small to notice in daily life: over a whole lifetime of 79 years it adds up to only about 90 billionths
        of a second. A blink of an eye lasts about a tenth of a second, so this is over a million times
        shorter than a blink. Yet the clocks could see it.
      </p>

      <p style={{ ...paragraph, marginBottom: '0.3rem' }}>
        <strong>Test 2 (2022): a gap the width of a pencil tip.</strong>
      </p>
      <p style={paragraph}>
        Scientists at JILA, a laboratory run jointly by NIST and the University of Colorado Boulder, went much smaller. They held about 100,000
        ultracold strontium atoms in a stack of very thin layers of laser light, like a stack of pancakes, and compared the ticking at the top of
        the stack with the ticking at the bottom, about a millimeter lower. The two ends of the same cloud ticked at slightly different rates. The
        difference was about 0.0000000000000000001 of the rate, or 10⁻¹⁹: one part in ten billion billion. To see how small that is: two clocks
        whose rates differed by that fraction would need about {formatNumber(yearsToDriftOneSecond(1e-19) / 1e9)} billion years to disagree by a
        single second, which is more than 20 times the age of the universe. The atoms ticked together for 37 seconds, a record, and after 90 hours
        of data the measurement was 50 times more precise than any earlier clock comparison.
      </p>

      <p style={{ ...paragraph, marginBottom: '0.3rem' }}>
        <strong>Test 3 (every day): the clocks in GPS satellites.</strong>
      </p>
      <p style={paragraph}>
        The satellites that make the blue dot on a phone map each carry atomic clocks, and they orbit high above the Earth, where gravity is
        weaker. NIST says that, because of the weaker gravity, those clocks should run faster than clocks on the ground by about{' '}
        {GPS_GRAVITY_MICROSECONDS_PER_DAY} millionths of a second every day. The satellites also move fast, and motion slows a clock (you met that
        in Relativity of Time and Motion), by about {GPS_SPEED_MICROSECONDS_PER_DAY} millionths of a second per day. Putting the two together, the
        satellite clocks run about {GPS_NET_MICROSECONDS_PER_DAY} millionths of a second per day faster than clocks on the ground.
      </p>
      <p style={paragraph}>
        <strong>Why this has to be corrected.</strong> When the first satellites were launched, the engineers realized they had to correct for
        this to get accurate time on Earth. NASA says that without such corrections, small differences in time would add up quickly and give
        inaccurate positions. A worked example: light travels about{' '}
        {formatNumber(lightDistanceKm(1) * 1000)} meters in a millionth of a second, so a timing error of {GPS_NET_MICROSECONDS_PER_DAY} millionths
        of a second is a distance error of about {formatNumber(lightDistanceKm(GPS_NET_MICROSECONDS_PER_DAY))} kilometers, and the error would grow by that much every day it was not corrected (this page’s own arithmetic).
      </p>
      <p style={paragraph}>
        <strong>The longest-running test.</strong> NIST says that, because it has worked for so long, GPS could be seen as the longest-running
        test we have of Einstein’s theories.
      </p>

      <div style={{ overflowX: 'auto', maxWidth: '100%' }}>
        <table style={{ fontSize: '0.8125rem', borderCollapse: 'collapse', marginBottom: '0.75rem' }}>
          <thead>
            <tr>
              {['Test', 'Gap between the clocks', 'What was found'].map((h) => (
                <th key={h} style={{ textAlign: 'left', padding: '0.25rem 1rem 0.25rem 0', borderBottom: '1px solid var(--border-color, #ccc)' }}>
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {[
              ['NIST, 2010', 'about 33 centimeters (a foot) in height', 'the higher clock ticked slightly faster; about 90 billionths of a second over 79 years'],
              ['JILA, 2022', 'about 1 millimeter, inside one cloud of atoms', 'the top ticked slightly faster than the bottom; a difference of about 10⁻¹⁹ of the rate'],
              ['GPS satellites', 'a satellite in medium Earth orbit against the ground', `gravity alone makes the satellite clock run about ${GPS_GRAVITY_MICROSECONDS_PER_DAY} millionths of a second per day faster`],
            ].map(([a, b, c]) => (
              <tr key={a}>
                <td style={{ padding: '0.25rem 1rem 0.25rem 0', verticalAlign: 'top' }}>
                  <strong>{a}</strong>
                </td>
                <td style={{ padding: '0.25rem 1rem 0.25rem 0', verticalAlign: 'top' }}>{b}</td>
                <td style={{ padding: '0.25rem 0', verticalAlign: 'top' }}>{c}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <p style={paragraph}>
        <strong>And beyond Earth.</strong> In 2020, NASA reported that an effect predicted by Einstein, gravity shifting light to longer
        wavelengths, had been identified in a double-star system about 29,000 light-years from Earth. It was the first strong evidence of that
        kind in a pair of stars, and NASA links it to the same effect that GPS has to correct for.
      </p>
      <p style={paragraph}>
        <strong>What these tests have in common, and what they leave open.</strong> In the three tests above, gravity was weak, and the clocks differed by
        a tiny amount. The effect was real, but it was almost too small to see. The question of this experiment is what happens where gravity is as
        strong as it can be.
      </p>
      <HeightDrawing />

      <TimeNearBlackHoleRealTests />

      <h4 style={{ margin: '1.25rem 0 0.5rem' }}>Why a black hole is the strongest test</h4>
      <p style={{ ...paragraph, marginBottom: '0.3rem' }}>
        <strong>What a black hole is.</strong>
      </p>
      <p style={paragraph}>
        A black hole is a region of space where gravity is so strong that nothing that gets close enough can leave, not even light. Its edge is
        the <strong>horizon</strong> (the event horizon). NASA describes it as a boundary that contains all the matter that makes up the black
        hole, and not as a surface like the Earth’s or the Sun’s. In Black Holes 1 you found its size, the <strong>horizon radius</strong>: the
        distance from the black hole’s center to its horizon.
      </p>
      <p style={{ ...paragraph, marginBottom: '0.3rem' }}>
        <strong>Why the edge, and not the whole black hole.</strong>
      </p>
      <p style={paragraph}>
        NASA is clear that a black hole does not “suck in” everything around it. From far enough away, its gravity is just like that of any other
        object with the same mass. So the extreme part of a black hole is only its edge, and the space just outside it. That is where we want to
        put our clock.
      </p>

      <p style={{ ...paragraph, marginBottom: '0.3rem' }}>
        <strong>How strong is “as strong as gravity gets”?</strong>
      </p>
      <p style={paragraph}>
        One way to measure the strength of gravity is the <strong>escape speed</strong>: the speed you would have to be given to leave an object
        for good and never fall back. Think of throwing a ball upward. The harder you throw it, the higher it goes, and with enough speed it never
        comes back. A stronger pull needs a bigger throw. Here is the ladder:
      </p>
      <div style={{ overflowX: 'auto', maxWidth: '100%' }}>
        <table style={{ fontSize: '0.8125rem', borderCollapse: 'collapse', marginBottom: '0.75rem' }}>
          <thead>
            <tr>
              {['Where', 'Escape speed', 'Compared with the step above'].map((h) => (
                <th key={h} style={{ textAlign: 'left', padding: '0.25rem 1rem 0.25rem 0', borderBottom: '1px solid var(--border-color, #ccc)' }}>
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {[
              [
                'The Earth’s surface',
                `${formatNumber(ladder.earthKmPerSecond)} kilometers per second (about ${formatNumber(ladder.earthKmPerHour)} kilometers per hour)`,
                'the starting point',
              ],
              ['The Sun’s surface', `${formatNumber(ladder.sunKmPerSecond)} kilometers per second`, `about ${formatNumber(ladder.sunOverEarth)} times as fast`],
              [
                'The horizon of a black hole',
                `${Math.round(ladder.lightKmPerSecond).toLocaleString('en-US')} kilometers per second: the speed of light`,
                `about ${formatNumber(ladder.lightOverSun)} times as fast (about ${formatNumber(ladder.lightOverEarth)} times the Earth’s)`,
              ],
            ].map(([a, b, c]) => (
              <tr key={a}>
                <td style={{ padding: '0.25rem 1rem 0.25rem 0', verticalAlign: 'top' }}>
                  <strong>{a}</strong>
                </td>
                <td style={{ padding: '0.25rem 1rem 0.25rem 0', verticalAlign: 'top' }}>{b}</td>
                <td style={{ padding: '0.25rem 0', verticalAlign: 'top' }}>{c}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <p style={paragraph}>
        Nothing can go faster than light, so at the horizon no throw is big enough. That is exactly what makes the horizon the edge. (The Earth and
        Sun speeds are NASA’s fact-sheet values. The escape speed is the ordinary-gravity picture used in Black Holes 1; it is a way to picture the
        strength of gravity here, not the exact theory.)
      </p>

      <p style={{ ...paragraph, marginBottom: '0.3rem' }}>
        <strong>The three black holes this experiment uses.</strong>
      </p>
      <p style={paragraph}>
        They are the three from Black Holes 1. Black holes come in different sizes. NASA divides them by mass into stellar-mass, intermediate-mass
        and supermassive ones. Two kinds matter here. Stellar-mass black holes form when a star with around 20 Suns’ worth of mass or more runs out
        of fuel and its core collapses. Supermassive black holes are found at the centers of almost every large galaxy.
      </p>
      <div style={{ overflowX: 'auto', maxWidth: '100%' }}>
        <table style={{ fontSize: '0.8125rem', borderCollapse: 'collapse', marginBottom: '0.5rem' }}>
          <thead>
            <tr>
              {['Black hole', 'Mass', 'Distance from Earth', 'Horizon radius', 'A comparison'].map((h) => (
                <th key={h} style={{ textAlign: 'left', padding: '0.25rem 1rem 0.25rem 0', borderBottom: '1px solid var(--border-color, #ccc)' }}>
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {[
              [
                'A stellar black hole',
                '10 Suns (a round, typical size)',
                'not a particular object',
                formatDistance(horizons.stellarHorizonKm),
                `as a ball, its horizon is about ${formatNumber(horizons.stellarHorizonKm * 2)} kilometers across`,
              ],
              [
                'Sagittarius A*',
                'about 4 million Suns (ESO)',
                'about 27,000 light-years (ESO)',
                formatDistance(horizons.sgrAHorizonKm),
                `its horizon radius is about ${formatNumber(horizons.sgrAHorizonInSunRadii)} times the Sun’s radius. Seen from Earth, ESO says, the black hole looks about as big as a doughnut on the Moon`,
              ],
              [
                'M87*',
                'about 6.5 billion Suns (ESO)',
                'about 55 million light-years (ESO)',
                formatDistance(horizons.m87HorizonKm),
                `its horizon radius is about ${formatNumber(horizons.m87HorizonInNeptuneOrbits)} times the radius of Neptune’s orbit (${NEPTUNE_ORBIT_AU} AU)`,
              ],
            ].map(([a, b, c, d, e]) => (
              <tr key={a}>
                <td style={{ padding: '0.25rem 1rem 0.25rem 0', verticalAlign: 'top' }}>
                  <strong>{a}</strong>
                </td>
                <td style={{ padding: '0.25rem 1rem 0.25rem 0', verticalAlign: 'top' }}>{b}</td>
                <td style={{ padding: '0.25rem 1rem 0.25rem 0', verticalAlign: 'top' }}>{c}</td>
                <td style={{ padding: '0.25rem 1rem 0.25rem 0', verticalAlign: 'top' }}>{d}</td>
                <td style={{ padding: '0.25rem 0', verticalAlign: 'top' }}>{e}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <p style={{ ...paragraph, fontSize: '0.75rem' }}>
        The horizon radii are calculated here from the masses this page uses. For Sagittarius A* the page uses a rounded 4.3 million Suns, a little
        more than ESO’s “four million”, so its horizon radius is a little larger than a four-million-Sun figure would give. NASA also says that
        astronomers think there may be as many as 100 million stellar-mass black holes in our galaxy, although binary stars have revealed only
        around 50 suspected or confirmed ones.
      </p>

      <p style={{ ...paragraph, marginBottom: '0.3rem' }}>
        <strong>So why is this the strongest test?</strong>
      </p>
      <p style={paragraph}>
        Close to a horizon, gravity is stronger than anywhere else we know of, so the slowing of clocks there should be far greater than at the
        Earth’s surface, where even the best clocks in the tests above could barely see it. We cannot go there. What astronomers do see is the effect of that gravity on
        light and on stars. The pictures below show the shadow of a black hole, which ESO says is caused by the black hole bending and capturing
        light, and NASA tells how astronomers tracked stars orbiting close to the black hole at the center of our galaxy (a discovery that won the
        2020 Nobel Prize in Physics). No one has ever put a clock next to a horizon. So this experiment is a thought experiment: it asks what a
        clock held there would do.
      </p>
      <Figure
        caption={
          <>
            The first picture of a black hole’s shadow (April 2019): M87*. The bright ring is hot gas just outside the horizon; the dark middle
            is the shadow. It is a real observation, not a drawing.
          </>
        }
        credit="Image: EHT Collaboration (CC BY 4.0), via ESO."
      >
        <img
          src={M87_IMAGE}
          alt="A blurry ring of orange and yellow glowing gas, brighter at the bottom, around a dark patch in the middle, on a black background."
          width={1280}
          height={746}
          style={imgStyle}
        />
      </Figure>
      <Figure
        caption={
          <>
            Our own galaxy’s black hole, Sagittarius A* (12 May 2022), about 4 million Suns. Also a real observation: a ring of glowing gas
            around a dark shadow.
          </>
        }
        credit="Image: EHT Collaboration (CC BY 4.0), via ESO."
      >
        <img
          src={SGRA_IMAGE}
          alt="A blurry ring of orange and yellow glowing gas with three brighter spots, around a dark patch in the middle, on a black background."
          width={1280}
          height={1280}
          style={{ ...imgStyle, maxWidth: 'min(100%, 420px)' }}
        />
      </Figure>

      <h4 style={{ margin: '1.25rem 0 0.5rem' }}>Two clocks (new words)</h4>
      <p style={{ ...paragraph, marginBottom: '0.3rem' }}>
        <strong>Why do we need two clocks?</strong>
      </p>
      <p style={paragraph}>
        One clock on its own cannot tell you that anything is slowed. It simply counts its own ticks, and to the clock, every second feels like a
        second. To find out whether time runs slower in one place, you have to compare it with something. Think of two watches lying on a table.
        Each one, looked at alone, seems perfectly fine. Only by checking one against the other, over a long time, do you notice that one has
        crept ahead. The NIST scientists in Test 1 had the same problem, so they built two
        nearly identical clocks and joined them with a fiber, so that they could compare the two. We do the same, with two <strong>identical</strong>{' '}
        clocks: they are built the same way, so if their ticks ever differ, the clocks are not the reason.
      </p>

      <p style={{ ...paragraph, marginBottom: '0.3rem' }}>
        <strong>The far-away clock: our reference.</strong>
      </p>
      <ul style={{ marginTop: 0, marginBottom: '0.75rem', paddingLeft: '1.25rem' }}>
        <li style={{ marginBottom: '0.3rem' }}>
          It is held so far from the black hole that the black hole’s gravity does not affect it. “Far” here means many horizon radii away, far
          enough that the effect is too small to matter.
        </li>
        <li style={{ marginBottom: '0.3rem' }}>
          We call its rate the <strong>normal rate</strong>, and we compare everything with it. In this experiment it runs for{' '}
          {FAR_CLOCK_RUN_SECONDS} seconds of its own time, and its picture is a <strong>gold</strong> dial.
        </li>
      </ul>

      <p style={{ ...paragraph, marginBottom: '0.3rem' }}>
        <strong>The hovering clock: the one near the black hole.</strong>
      </p>
      <ul style={{ marginTop: 0, marginBottom: '0.75rem', paddingLeft: '1.25rem' }}>
        <li style={{ marginBottom: '0.3rem' }}>
          It is held <strong>at rest</strong> at a chosen distance from the black hole’s center. It is not falling in, not circling, and not
          moving sideways. Imagine it hanging in place. Its picture is a <strong>blue</strong> dial.
        </li>
        <li style={{ marginBottom: '0.3rem' }}>
          Its distance is given in <strong>horizon radii</strong>: the distance from the center divided by the horizon radius. “2 horizon radii”
          means twice as far from the center as the edge is. For the 10-Sun black hole that is about {formatDistance(holes.small.distanceKm)} from
          the center, because its horizon radius is about {formatDistance(holes.small.horizonRadiusKm)}.
        </li>
        <li style={{ marginBottom: '0.3rem' }}>
          Because it is at rest, speed is not involved. Any difference from the far-away clock would have to come from where it hangs.
        </li>
      </ul>

      <p style={{ ...paragraph, marginBottom: '0.3rem' }}>
        <strong>How do we compare them from far away?</strong>
      </p>
      <p style={paragraph}>
        We watch both clocks from the far-away clock’s position. Light carries the news: the hovering clock can send a flash of light with each of
        its ticks, and an observer next to the far-away clock counts the flashes that arrive. Both clocks start together. When the far-away clock
        has run for {FAR_CLOCK_RUN_SECONDS} seconds, we read both dials.
      </p>

      <p style={{ ...paragraph, marginBottom: '0.3rem' }}>
        <strong>What we compare: the slowing factor.</strong>
      </p>
      <p style={paragraph}>
        The <strong>slowing factor</strong> is the hovering clock’s rate divided by the far-away clock’s rate. A factor of 1 means the same rate, a
        factor below 1 means the hovering clock is slower, and a factor of 0 would mean it is not ticking at all. You can also read it straight
        from the dials: it is the hovering clock’s reading divided by the far-away clock’s reading. A made-up example, with numbers chosen only to
        show the arithmetic: if the hovering clock read {MADE_UP_HOVERING_SECONDS} seconds when the far-away clock read{' '}
        {FAR_CLOCK_RUN_SECONDS} seconds, the factor would be {MADE_UP_HOVERING_SECONDS} ÷ {FAR_CLOCK_RUN_SECONDS} ={' '}
        {formatSmall(MADE_UP_HOVERING_SECONDS / FAR_CLOCK_RUN_SECONDS)}, and the hovering clock would be ticking at{' '}
        {Math.round((MADE_UP_HOVERING_SECONDS / FAR_CLOCK_RUN_SECONDS) * 100)}% of the normal rate. These are not the experiment’s results.
      </p>

      <p style={{ ...paragraph, marginBottom: '0.3rem' }}>
        <strong>A thought experiment.</strong>
      </p>
      <p style={paragraph}>
        Nobody can actually hold a clock still near a black hole. Something would have to hold it up against gravity. Think of a helicopter
        hovering above the ground: it keeps pushing down on the air, and the stronger gravity is, the harder it must push. Near a black hole the
        push needed would grow larger and larger as the clock got closer, without limit. This experiment does not model that push or whatever
        provides it; it only asks what the two clocks would show if the hovering one could be held there. (The helicopter is a comparison for the
        push only, not for what happens to time.) That is why this is a <strong>thought experiment</strong>.
      </p>

      <h4 style={{ margin: '1.25rem 0 0.5rem' }}>This is not a falling traveler</h4>
      <p style={paragraph}>
        This experiment compares two clocks that stay at rest. It does not describe what a traveler who falls into a black hole experiences;
        that is Black Holes 5.
      </p>

      <p style={{ ...paragraph, marginBottom: '0.3rem' }}>
        <strong>What happens.</strong> The page is in four Parts. Here is the order:
      </p>
      <ol style={{ marginTop: 0, marginBottom: '0.75rem', paddingLeft: '1.25rem' }}>
        <li style={{ marginBottom: '0.4rem' }}>
          <strong>You make three guesses (Part 1).</strong> They are about how fast a clock ticks when it hovers only 1% beyond the horizon, about
          which of two clocks, one near a small black hole and one near a giant one, ticks more slowly, and about whether the simple formula from
          the earlier experiments still works. Nothing is marked right or wrong at this stage.
        </li>
        <li style={{ marginBottom: '0.4rem' }}>
          <strong>You press Run.</strong> The page shows a black hole of 10 Suns with the hovering clock held {formatSmall(run.distanceInHorizonRadii)}{' '}
          horizon radii from its center, very close to its edge. Both clocks start together, and the far-away clock runs for{' '}
          {FAR_CLOCK_RUN_SECONDS} seconds of its own time. You watch it in about {RUN_PLAYBACK_SECONDS} seconds of real time. Playing it faster or
          slower would not change what the clocks read: the speed is only for watching.
        </li>
        <li style={{ marginBottom: '0.4rem' }}>
          <strong>The pictures fill in.</strong> Picture 1 shows the two clocks and a ruler for the distance. Picture 2 is a graph of how fast
          the hovering clock ticks at each distance. Picture 3 draws what each clock reads as the run plays. When the run finishes, a fourth,
          Picture 2b, appears, and your three guesses are drawn on the graphs in white.
        </li>
        <li style={{ marginBottom: '0.4rem' }}>
          <strong>Parts 2, 3 and 4 appear.</strong> In Part 2 you choose a black hole and a distance of your own and run again, as often as you
          like. Part 3 gives the numbers: tables, a check of the simple formula against the exact one, and your three guesses beside the results.
          In Part 4 a tutor asks what you saw and then goes through your three guesses one by one.
        </li>
        <li style={{ marginBottom: '0.4rem' }}>
          <strong>You can start over.</strong> Once you press Run, your guesses are locked while you try other settings. The Start over button
          clears the guesses, the runs, the results and the tutor, and returns the page to the beginning. It is always on the page, and it is
          grayed out until there is something to clear and while a run is playing.
        </li>
      </ol>
      <p style={paragraph}>
        <strong>Your job.</strong> Make your three guesses, watch the run, then try other distances and other black holes and compare. It helps to
        try a distance close to the horizon and one far from it, and a black hole of each size.
      </p>
      <p style={paragraph}>
        <strong>What to look for.</strong> Which clock is behind and by how much; what changes when you move the hovering clock nearer or farther;
        and what changes, and what stays the same, when you change the black hole.
      </p>
      <p style={paragraph}>
        <strong>Your guesses and the real pictures.</strong> Your guesses never change the real pictures or tables. After the run they are
        drawn on the real graphs in <strong>white</strong>, in a box labeled YOUR GUESS, and shown again beside the results. The black hole and
        distance you choose in Part 2 do change the drawings in Part 2, and only those.
      </p>
      <p style={paragraph}>
        <strong>Some new words.</strong> far-away clock, hovering clock, slowing factor, first-order formula, logarithmic scale, escape speed,
        atomic clock, wavelength, microsecond. All are in the Words and formulas box below.
      </p>

      <p style={{ marginTop: 0, marginBottom: '0.25rem' }}>
        <strong>What we assume.</strong> Every experiment simplifies the real world to ask one clear question. These are the simplifications
        here, in plain words, and what each means for you.
      </p>
      <ul style={{ marginTop: 0, marginBottom: 0, paddingLeft: '1.25rem' }}>
        <li style={{ marginBottom: '0.4rem' }}>
          <strong>It is a thought experiment.</strong> We ask “what would happen if?” about something nobody can do. Holding a clock still near a
          black hole would take a push that grows without limit as the clock gets closer. We leave that push out, because the question is only
          about the two clocks.
        </li>
        <li style={{ marginBottom: '0.4rem' }}>
          <strong>Only two clocks, each held at rest, are compared.</strong> Neither clock falls, circles or moves. A clock that is orbiting or
          falling would show something different. Orbits are the subject of Black Holes 3, and what a traveler who falls toward a black hole
          experiences is Black Holes 5. So when this page says a clock “ticks slower”, it means a clock held still.
        </li>
        <li style={{ marginBottom: '0.4rem' }}>
          <strong>Nothing inside the horizon is modeled.</strong> A clock cannot be held at rest inside the horizon, and the formula used here is
          only for outside it. So the distance control stops just short of the horizon, at {MIN_DISTANCE_IN_HORIZON_RADII} horizon radii.
        </li>
        <li style={{ marginBottom: '0.4rem' }}>
          <strong>The formula for the slowing is given, not derived.</strong> It comes from Einstein’s general theory of relativity, the exact
          theory of gravity. Deriving it needs Einstein’s equations, which are outside this project, so we use the result and look at what it says.
          It is exact for the simplest kind of black hole: one that does not spin and has no electric charge. Real black holes usually spin, which
          changes the picture; Black Holes 8 looks at spinning ones. The simple formula from the earlier experiments is shown beside the exact one,
          labeled as an approximation for weak gravity.
        </li>
        <li style={{ marginBottom: '0.4rem' }}>
          <strong>The far-away clock is treated as infinitely far away.</strong> No real clock is infinitely far from a black hole. A clock many
          horizon radii out is close enough: the black hole’s gravity matters far less there than at the distances this experiment is about.
        </li>
        <li style={{ marginBottom: '0.4rem' }}>
          <strong>Distance is measured as in Black Holes 1.</strong> Imagine a circle around the black hole that passes through the clock. Divide
          the circle’s length by 2π (about 6.28), as you would for any circle, and you get the distance used here. Near a black hole space is
          curved, so this is not the same as measuring straight inward with a ruler. This experiment does not discuss that difference.
        </li>
        <li style={{ marginBottom: 0 }}>
          <strong>The masses are rounded.</strong> Sagittarius A* uses 4.3 million Suns (ESO says about four million) and M87* uses 6.5 billion.
          The stellar black hole’s mass of 10 Suns is an illustrative round value, not a particular object. The run in Part 1 holds the clock{' '}
          {formatSmall(run.distanceInHorizonRadii)} horizon radii from the center of that 10-Sun black hole, about {formatDistance(run.distanceKm)}{' '}
          from the center.
        </li>
      </ul>
    </div>
  )
}

export function TimeNearBlackHoleRealTests() {
  return (
    <div style={{ margin: '1.25rem 0 1.5rem', fontSize: '0.875rem', color: 'var(--text-muted)' }}>
      <h4 style={{ margin: '0 0 0.5rem' }}>Where to read about these tests (as of November 2026)</h4>
      <p style={{ margin: '0 0 0.5rem' }}>
        These are the tests described above, with where each was reported, and one more that reaches nearer to a black hole: ESO’s 2018
        measurement of light from a star passing our galaxy’s central black hole.
      </p>
      <ol style={{ marginTop: 0, marginBottom: '0.5rem', paddingLeft: '1.25rem' }}>
        <li style={{ marginBottom: '0.4rem' }}>
          <strong>2010.</strong> NIST: two clocks 33 centimeters apart ticked at different rates.{' '}
          <Ext href="https://www.nist.gov/news-events/news/2010/09/nist-pair-aluminum-atomic-clocks-reveal-einsteins-relativity-personal">
            NIST’s news release
          </Ext>
        </li>
        <li style={{ marginBottom: '0.4rem' }}>
          <strong>26 July 2018.</strong> ESO’s GRAVITY team: light from the star S2, which passed within 20 billion kilometers of our galaxy’s
          black hole in May 2018, was stretched to longer wavelengths by the black hole’s gravity.{' '}
          <Ext href="https://www.eso.org/public/news/eso1825/">ESO’s release</Ext>
        </li>
        <li style={{ marginBottom: '0.4rem' }}>
          <strong>16 February 2022.</strong> JILA and NIST: the same effect across about a millimeter.{' '}
          <Ext href="https://www.nist.gov/news-events/news/2022/02/jila-atomic-clocks-measure-einsteins-general-relativity-millimeter-scale">
            NIST’s news release
          </Ext>
        </li>
      </ol>
      <p style={{ margin: 0, fontSize: '0.75rem' }}>
        Each of these tests found the effect that Einstein’s theory predicts. None was made at the edge of a black hole’s horizon. Science
        changes quickly; this list shows what was true on the date above.
      </p>
    </div>
  )
}

const linkItem = { marginBottom: '0.4rem' } as const

export function TimeNearBlackHoleLinks() {
  return (
    <div style={{ marginBottom: '1.5rem', fontSize: '0.875rem', color: 'var(--text-muted)' }}>
      <h4 style={{ margin: '0 0 0.5rem' }}>Want to know more?</h4>
      <p style={{ margin: '0 0 0.25rem' }}>
        <strong>Start here</strong>
      </p>
      <ul style={{ marginTop: 0, marginBottom: '0.75rem', paddingLeft: '1.25rem' }}>
        <li style={linkItem}>
          <Ext href="https://www.nist.gov/news-events/news/2010/09/nist-pair-aluminum-atomic-clocks-reveal-einsteins-relativity-personal">
            NIST, “NIST Pair of Aluminum Atomic Clocks Reveal Einstein’s Relativity at a Personal Scale”
          </Ext>
          : two real clocks a foot apart, ticking at different rates.
        </li>
        <li style={linkItem}>
          <Ext href="https://www.nist.gov/node/1879246">NIST, “Putting Einstein to the Test”</Ext>: why the clocks in GPS satellites have to be
          corrected.
        </li>
        <li style={linkItem}>
          <Ext href="https://science.nasa.gov/universe/black-holes/types/">NASA, “Black Hole Types”</Ext>: how heavy stellar and giant black
          holes are.
        </li>
      </ul>
      <p style={{ margin: '0 0 0.25rem' }}>
        <strong>The discoveries</strong>
      </p>
      <ul style={{ marginTop: 0, marginBottom: '0.75rem', paddingLeft: '1.25rem' }}>
        <li style={linkItem}>
          <Ext href="https://www.eso.org/public/news/eso1825/">
            ESO, “First Successful Test of Einstein’s General Relativity Near Supermassive Black Hole”
          </Ext>
          : how the star S2’s light was stretched near our galaxy’s black hole.
        </li>
        <li style={linkItem}>
          <Ext href="https://www.nist.gov/news-events/news/2022/02/jila-atomic-clocks-measure-einsteins-general-relativity-millimeter-scale">
            NIST, “JILA Atomic Clocks Measure Einstein’s General Relativity at Millimeter Scale”
          </Ext>
          : the same effect across a pencil-tip-wide cloud of atoms.
        </li>
        <li style={linkItem}>
          <Ext href="https://www.eso.org/public/news/eso1907/">ESO, “First Image of a Black Hole”</Ext>: M87* and its mass.
        </li>
        <li style={linkItem}>
          <Ext href="https://www.nasa.gov/image-article/einsteins-theory-of-relativity-critical-gps-seen-distant-stars/">
            NASA, “Einstein’s Theory of Relativity, Critical For GPS, Seen In Distant Stars”
          </Ext>
          : the same slowing seen in light from a double star.
        </li>
      </ul>
      <p style={{ margin: '0 0 0.25rem' }}>
        <strong>Go deeper</strong>
      </p>
      <ul style={{ marginTop: 0, marginBottom: '0.25rem', paddingLeft: '1.25rem' }}>
        <li style={linkItem}>
          <Ext href="https://arxiv.org/abs/2109.12238">arXiv 2109.12238, Bothwell and colleagues</Ext>: the millimeter-scale result as first
          written for scientists.
        </li>
      </ul>
      <p style={{ margin: 0, fontSize: '0.75rem' }}>
        All links open in a new tab. After your first run, Part 3 adds links to two NASA pages about how something near a black hole looks from
        far away. They are held back so they do not give away your guesses.
      </p>
    </div>
  )
}

// The entries of the shared "Words and formulas" panel (ReferencePanel, as in the other experiments). The formula and its worked example give
// Guess 2 away, so they appear only after the first run (CLAUDE.md §12).
export function timeNearBlackHoleWordsEntries(afterRun: boolean): { term: string; meaning: string }[] {
  const run = runPartOne()
  const d = run.distanceInHorizonRadii
  const ladder = escapeSpeedLadder()
  const entries = [
    { term: 'Far-away clock', meaning: 'a clock so far from the black hole that gravity does not affect it; our reference. We call its rate the normal rate.' },
    { term: 'Hovering clock', meaning: 'a clock held at rest at a chosen distance from the black hole. Not falling, not circling, not moving.' },
    { term: 'Horizon, horizon radius', meaning: 'the one-way edge of a black hole, and its distance from the center (written r_s). From Black Holes 1.' },
    { term: 'Distance in horizon radii', meaning: 'the distance from the center divided by r_s. “2 horizon radii” means twice as far from the center as the horizon is.' },
    { term: 'Slowing factor', meaning: 'the hovering clock’s rate divided by the far-away clock’s rate. 1 means the same rate; 0.5 means half as fast. It is also the hovering clock’s reading divided by the far-away clock’s reading.' },
    { term: 'First-order formula', meaning: 'the simple weak-gravity formula from Gravity and Curved Spacetime, Experiments 2 and 9. It is shown here only to compare with the exact one.' },
    { term: 'Logarithmic scale', meaning: 'a scale where equal steps multiply the number by the same amount (100, 10, 1), so very different sizes fit in one picture.' },
    { term: 'Thought experiment', meaning: 'a situation imagined to test an idea, not one that anyone has built. Here, a clock held at rest near a black hole.' },
    { term: 'Atomic clock', meaning: 'a clock that counts the vibrations of atoms. They vibrate at a very steady rate, so these are the most precise clocks we have.' },
    { term: 'Escape speed', meaning: `the speed you must be given to leave an object for good and never fall back: ${formatNumber(ladder.earthKmPerSecond)} kilometers per second at the Earth’s surface. At a black hole’s horizon it is the speed of light.` },
    { term: 'Wavelength', meaning: 'the distance between two crests of a light wave. Gravity can stretch light to longer wavelengths, which makes it redder.' },
    { term: 'Microsecond', meaning: 'a millionth of a second. A billionth of a second is a thousand times shorter.' },
    { term: '10⁻¹⁹', meaning: 'scientific notation for 0.0000000000000000001: one divided by a 1 followed by 19 zeros.' },
    { term: 'Light-year', meaning: 'the distance light travels in one year, about 9.5 trillion kilometers.' },
    { term: 'Astronomical unit (AU)', meaning: 'the distance from the Earth to the Sun, about 150 million kilometers.' },
    { term: 'Stellar-mass and supermassive black holes', meaning: 'NASA’s names for black holes of a few to hundreds of Suns’ worth of mass, made when a star dies, and of hundreds of thousands to billions of Suns, found at the centers of galaxies.' },
  ]
  if (afterRun) {
    entries.push({
      term: 'Formula: the slowing factor',
      meaning: `slowing factor = √(1 − r_s ÷ r), where r is the distance from the center. It is given by general relativity for a black hole that does not spin and has no electric charge. Worked example with Part 1’s run, at ${formatSmall(d)} horizon radii: r_s ÷ r = 1 ÷ ${formatSmall(d)} = ${formatSmall(1 / d)}; 1 − ${formatSmall(1 / d)} = ${formatSmall(1 - 1 / d)}; √${formatSmall(1 - 1 / d)} = ${formatSmall(run.exactFactor)}; in ${run.farClockReadingSeconds} seconds of far-away time the hovering clock reads ${formatSmall(run.exactFactor)} × ${run.farClockReadingSeconds} = ${run.hoveringClockReadingSeconds.toFixed(2)} s.`,
    })
  } else {
    entries.push({
      term: 'More words',
      meaning: 'the formula for the slowing factor, with a worked example, appears here after your first run. It is held back so that it does not give away your guesses.',
    })
  }
  return entries
}

// ---------------------------------------------------------------------------------------------------------------
// The notes under the three Part 1 questions: the situation with real numbers, what each choice means, and what the learner already knows.
// They give nothing away (CLAUDE.md §12): no rate at 1.01 or 2 horizon radii is stated, nothing says whether the mass or the distance matters,
// and nothing says where the simple formula fails.
// ---------------------------------------------------------------------------------------------------------------
const notesBox = {
  margin: '0 0 0.75rem',
  padding: '0.5rem 0.75rem',
  fontSize: '0.8125rem',
  color: 'var(--text-muted)',
  borderLeft: '3px solid #d97706',
} as const
const noteItem = { marginBottom: '0.3rem' } as const

export function GuessNotes({ n }: { n: 1 | 2 | 3 }) {
  if (n === 1) {
    const run = runPartOne()
    const edge = run.horizonRadiusKm
    const outsideKm = run.distanceKm - edge
    const ticksFor = (factor: number) => String(Math.round(factor * 10))
    return (
      <ul style={{ ...notesBox, listStylePosition: 'inside', paddingLeft: '0.75rem' }}>
        <li style={noteItem}>
          <strong>The situation.</strong> The black hole is the 10-Sun one from Black Holes 1, whose edge is about {formatNumber(edge)} km from its
          center. “Only 1% farther” means the clock hangs about {formatNumber(run.distanceKm)} km from the center, which is only about{' '}
          {formatNumber(outsideKm * 1000)} meters outside the edge. It is held still. You watch it from far away, next to an identical clock that
          gravity does not affect. This is exactly the situation in the run you are about to watch.
        </li>
        <li style={noteItem}>
          <strong>What the choices mean.</strong> Count ticks. While your clock next to you ticks 10 times, the hovering clock ticks about{' '}
          {ticksFor(JUST_OUTSIDE_GUESS_FACTOR.same)} times if it runs at the same rate, about {ticksFor(JUST_OUTSIDE_GUESS_FACTOR.half)} times if
          it is half as fast, about {ticksFor(JUST_OUTSIDE_GUESS_FACTOR.tenth)} time if it is one tenth as fast, and never if it has stopped.
        </li>
        <li style={noteItem}>
          <strong>What you already know.</strong> From Gravity and Curved Spacetime you know that a clock deeper in gravity ticks more slowly, and
          that for the Earth the effect is tiny. The question is how big it becomes this close to a black hole’s edge.
        </li>
        <li style={noteItem}>
          <strong>How to answer.</strong> Pick the choice nearest to your feeling. “About” means a rough match is fine.
        </li>
      </ul>
    )
  }
  if (n === 2) {
    const { small, giant } = twoHolesAtTwoRadii()
    const ratioMillions = Math.round(giant.preset.massSolarMasses / small.preset.massSolarMasses / 1e6)
    return (
      <ul style={{ ...notesBox, listStylePosition: 'inside', paddingLeft: '0.75rem' }}>
        <li style={noteItem}>
          <strong>The situation.</strong> Two different black holes, each with its own hovering clock. The small one has 10 Suns’ worth of mass and
          an edge about {formatNumber(small.horizonRadiusKm)} km from its center. The giant one is M87*, {ratioMillions} million times as heavy, with an
          edge about {formatDistance(giant.horizonRadiusKm)} from its center. Each clock is held at twice its own black hole’s horizon radius, which
          is about {formatDistance(small.distanceKm)} from the center of the small one and about {formatDistance(giant.distanceKm)} from the center of
          M87*. Each clock is compared with its own far-away clock.
        </li>
        <li style={noteItem}>
          <strong>What the choices mean.</strong> “Ticks more slowly” means a lower rate compared with its far-away clock. “The same relative rate”
          means both hovering clocks tick at the same fraction of the normal rate, for example the same percentage.
        </li>
        <li style={noteItem}>
          <strong>Something to think about.</strong> What could make one clock tick more slowly than the other: the black hole’s mass, the clock’s
          distance, or both?
        </li>
      </ul>
    )
  }
  return (
    <ul style={{ ...notesBox, listStylePosition: 'inside', paddingLeft: '0.75rem' }}>
      <li style={noteItem}>
        <strong>The situation.</strong> In Gravity and Curved Spacetime, Experiments 2 and 9, we used a simple formula for how much gravity slows a
        clock. It was good enough for the Earth and for GPS satellites. It is called a <strong>first-order</strong> formula because it is the
        first, simplest step toward the exact answer, made for weak gravity. The exact answer, from Einstein’s general theory, is what this
        page calls the exact formula.
      </li>
      <li style={noteItem}>
        <strong>What “accurate” means.</strong> Both formulas give a number for the slowing factor. The simple formula is accurate where its
        number is close to the exact one. After the run, Picture 2 draws both as two lines, so you can see where they agree and where they do
        not.
      </li>
      <li style={noteItem}>
        <strong>What the choices mean.</strong> The first says the simple formula stays accurate even right next to the horizon. The second says it
        is accurate far from the horizon, many horizon radii out, but gets worse the closer you get. The third says it is wrong everywhere near a
        black hole, even far from the horizon.
      </li>
    </ul>
  )
}

// ---------------------------------------------------------------------------------------------------------------
// Part 2: how it works, what the three black holes are, and what the distance presets mean for the chosen black hole. These give no
// result of the experiment: no slowing factor and no clock reading appears here.
// ---------------------------------------------------------------------------------------------------------------
export const PART_TWO_DISTANCE_PRESETS = [100, 10, 3, 1.5, 1.1, 1.01]

const stepItem = { marginBottom: '0.4rem' } as const
const partTwoBox = { margin: '0 0 1rem', fontSize: '0.875rem', color: 'var(--text-muted)' } as const

export function PartTwoGuide() {
  return (
    <div style={partTwoBox}>
      <p style={{ marginTop: 0, marginBottom: '0.3rem' }}>
        <strong>How Part 2 works.</strong> In Part 1 the black hole and the distance were chosen for you. Now they are yours, and you can run the
        clocks as many times as you like.
      </p>
      <ol style={{ marginTop: 0, marginBottom: '0.5rem', paddingLeft: '1.25rem' }}>
        <li style={stepItem}>
          <strong>Choose a black hole.</strong> These are the three from Black Holes 1: a stellar black hole, our galaxy’s Sagittarius A* and the giant
          M87*. They are very different in mass and in size.
        </li>
        <li style={stepItem}>
          <strong>Choose a distance for the hovering clock,</strong> in horizon radii, with the buttons or the slider. A bigger number is farther
          from the black hole. 1 would be the edge itself, so the control stops just short of it, at {MIN_DISTANCE_IN_HORIZON_RADII}.
        </li>
        <li style={stepItem}>
          <strong>Press “Run your choice”.</strong> The two clocks start together again, the far-away clock runs for {FAR_CLOCK_RUN_SECONDS} seconds of
          its own time, and you watch it in about {RUN_PLAYBACK_SECONDS} seconds. If you change a setting afterwards, the pictures switch to the new
          settings and the clocks go back to 0 until you run again.
        </li>
        <li style={stepItem}>
          <strong>Compare.</strong> Three things worth trying: keep the black hole and move the distance from far away to very near; keep the
          distance and change the black hole; and go as near as the control allows, then compare with the run in Part 1.
        </li>
        <li style={stepItem}>
          <strong>Read the numbers.</strong> Table 4 in Part 3 follows your last completed run.
        </li>
      </ol>
      <p style={{ margin: 0, fontSize: '0.75rem' }}>
        Pictures 4, 5 and 6 below are drawn the same way as Pictures 1, 2 and 3 of Part 1, for your settings. Your guesses are not drawn on them.
      </p>
    </div>
  )
}

export function BlackHoleOptionsNote() {
  const rows = BLACK_HOLE_PRESETS.map((p) => ({
    id: p.id,
    label: p.label,
    horizon: horizonRadiusKm(p.massSolarMasses),
    mass: p.massSolarMasses,
  }))
  const massText: Record<string, string> = {
    'stellar-black-hole': '10 Suns (a round, typical size)',
    'sgr-a-star': 'about 4 million Suns (ESO); this page uses a rounded 4.3 million',
    'm87-star': 'about 6.5 billion Suns (ESO)',
  }
  return (
    <ul style={{ ...partTwoBox, margin: '0.25rem 0 0.5rem', paddingLeft: '1.25rem' }}>
      {rows.map((r) => (
        <li key={r.id} style={{ marginBottom: '0.2rem' }}>
          <strong>{r.label}:</strong> {massText[r.id]}. Its horizon radius is about {formatDistance(r.horizon)}.
        </li>
      ))}
    </ul>
  )
}

// What each distance preset means, in kilometers, for the black hole the learner has chosen.
export function DistanceTable({ presetId }: { presetId: ObjectPreset['id'] }) {
  const rows = [...PART_TWO_DISTANCE_PRESETS, MIN_DISTANCE_IN_HORIZON_RADII].map((d) => {
    const r = runTimeNearBlackHoleExperiment(presetId, d)
    return { d, from: r.distanceKm, outside: r.distanceKm - r.horizonRadiusKm, label: r.preset.label }
  })
  const note = (d: number) => (d === 100 ? 'far' : d === MIN_DISTANCE_IN_HORIZON_RADII ? 'the closest the control allows' : '')
  return (
    <div style={{ overflowX: 'auto', maxWidth: '100%' }}>
      <table style={{ fontSize: '0.75rem', borderCollapse: 'collapse', margin: '0.5rem 0' }}>
        <caption style={{ captionSide: 'top', textAlign: 'left', paddingBottom: '0.25rem', color: 'var(--text-muted)' }}>
          What each preset means for {rows[0].label}
        </caption>
        <thead>
          <tr>
            {['Horizon radii', 'Distance from the center', 'Outside the edge by', ''].map((h) => (
              <th key={h} style={{ textAlign: 'left', padding: '0.2rem 1rem 0.2rem 0', borderBottom: '1px solid var(--border-color, #ccc)' }}>
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((r) => (
            <tr key={r.d}>
              <td style={{ padding: '0.2rem 1rem 0.2rem 0' }}>{formatSmall(r.d)}</td>
              <td style={{ padding: '0.2rem 1rem 0.2rem 0' }}>{formatDistance(r.from)}</td>
              <td style={{ padding: '0.2rem 1rem 0.2rem 0' }}>{formatDistance(r.outside)}</td>
              <td style={{ padding: '0.2rem 0' }}>{note(r.d)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
