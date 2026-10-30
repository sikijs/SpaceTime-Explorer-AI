import type { ReactNode } from 'react'

// "Einstein's two theories in plain words": an optional, collapsed guide on the Welcome page. Wording approved by the owner on 2026-10-30 (CLAUDE.md §28.1), after revisions to the k formula, the interval example and the gravity-and-clocks bullet; written at the owner's request
// ("the theory explained in detailed simple terms with basic formulas").
// It is a reference, not an experiment: no prediction, no run, no physics module. Every worked example is plain arithmetic that the reader can check by hand, and every formula is one that an
// experiment of the project already uses. The speed 0.6c is used for the worked examples because it is not one of the preset speeds of Experiments 3 to 6, so no early prediction is answered here.
// It is collapsed by default so that a learner who prefers to predict first (CLAUDE.md §12) is not given the explanations before the experiments.

const paragraph = { marginTop: 0, marginBottom: '0.75rem' } as const
const list = { margin: '0.25rem 0 0.75rem', paddingLeft: '1.25rem' } as const
const heading = { marginTop: '1.25rem', marginBottom: '0.5rem' } as const

function Formula({ children }: { children: ReactNode }) {
  return (
    <div
      style={{
        fontFamily: 'ui-monospace, SFMono-Regular, Menlo, Consolas, monospace',
        background: 'rgba(127, 127, 127, 0.12)',
        borderRadius: '6px',
        padding: '0.5rem 0.75rem',
        margin: '0.25rem 0 0.75rem',
        overflowX: 'auto',
      }}
    >
      {children}
    </div>
  )
}

export function TwoTheoriesGuide() {
  return (
    <details className="exp-card" style={{ marginTop: '1.5rem', padding: '1rem 1.5rem' }}>
      <summary style={{ cursor: 'pointer', fontWeight: 600 }}>Optional: Einstein’s two theories in plain words (read now, or after a few experiments)</summary>

      <div style={{ marginTop: '1rem', fontSize: '0.9375rem', lineHeight: 1.6 }}>
        <p style={paragraph}>
          <strong>Why this guide is here.</strong> Throughout this app you will see the names <em>special relativity</em>, <em>general relativity</em> and <em>Einstein’s equations</em>. They are two theories that Albert Einstein published, and every
          experiment here is one piece of them. You do not need this guide to begin: each experiment lets you meet an idea first, by predicting and watching, and names it afterwards. If you would like to reason out the ideas for yourself first, skip this
          guide and come back later. If you like to see the whole map before you start, read on.
        </p>

        <h3 style={heading}>Special relativity (1905): what happens when things move fast</h3>
        <p style={paragraph}>
          It is called “special” because it covers a special case: <strong>no gravity</strong>, and everything moving at a <strong>steady speed in a straight line</strong>. It rests on two plain ideas.
        </p>
        <p style={paragraph}>
          <strong>Idea 1: the laws of physics are the same for everyone moving steadily.</strong> Sit in a train with the curtains drawn, on perfectly smooth track, at a steady 200 km/h. Pour a cup of coffee: it pours exactly as it would in a parked train.
          No experiment inside the train can tell you that you are “really” moving. Only motion <em>compared with something else</em> means anything.
        </p>
        <p style={paragraph}>
          <strong>Idea 2: light has the same speed for everyone.</strong> In empty space light travels at about 300,000 kilometres per second, written <strong>c</strong>. That is true whether the lamp is moving or not, and whether you are moving towards it or
          away from it. This is odd. If you throw a ball forwards from a moving train, the ball’s speed is the train’s speed <em>plus</em> your throw. Light does not add like that: if you chase a beam of light at half the speed of light, you still measure
          its speed as c.
        </p>
        <p style={paragraph}>
          <strong>What follows.</strong> Speed is distance divided by time. If every observer must get the same speed for light, even though they move differently, then they cannot all agree on distances and times. Something has to give, and what gives is
          time and space themselves. How big the change is depends on one number, which we will call <strong>k</strong>. It tells you how much your speed changes the clocks and rulers. Here <strong>v</strong> is your speed and <strong>c</strong> is the
          speed of light:
        </p>
        <Formula>k = √(1 − v² ÷ c²)</Formula>
        <p style={paragraph}>To work out k, follow four small steps:</p>
        <ol style={list}>
          <li>
            Divide your speed by the speed of light: v ÷ c. This is your speed as a fraction of light’s. A spaceship at 60 percent of light speed has v ÷ c = 0.6.
          </li>
          <li>Multiply that fraction by itself (square it): 0.6 × 0.6 = 0.36.</li>
          <li>Subtract the result from 1: 1 − 0.36 = 0.64.</li>
          <li>Take the square root (the number that, multiplied by itself, gives 0.64): √0.64 = 0.8. So k = <strong>0.8</strong>.</li>
        </ol>
        <p style={paragraph}>
          What k means: it is always a number between 0 and 1. It is <strong>1</strong> when you are at rest, and it gets smaller as you speed up, falling towards <strong>0</strong> as your speed gets close to the speed of light. The smaller k is, the
          stronger the effects below. A few values:
        </p>
        <ul style={list}>
          <li>At rest (v = 0): k = 1, no effect.</li>
          <li>At 10 percent of light speed (v = 0.1 c): k ≈ 0.995, a very small effect.</li>
          <li>At 60 percent (v = 0.6 c): k = 0.8, a clear effect.</li>
          <li>At 99 percent (v = 0.99 c): k ≈ 0.14, a very large effect.</li>
        </ul>
        <p style={paragraph}>
          At everyday speeds you never notice any of this, because k is so close to 1. A car at 100 kilometres per hour is going only about one ten-millionth of light’s speed, and for it k differs from 1 by about 0.000000000000004. That is why time and
          length seem the same for everyone in daily life, even though, strictly, they are not.
        </p>
        <p style={paragraph}>Now use k = 0.8 (a spaceship at 0.6 c) in the effects below.</p>
        <ul style={list}>
          <li>
            <strong>Time dilation: moving clocks run slow.</strong>
            <Formula>time on the moving clock = time on your clock × k</Formula>
            While 10 years pass for you, the spaceship’s clock counts 10 × 0.8 = <strong>8 years</strong>. Nothing is wrong with the clock: it measures the time along its own path.
          </li>
          <li>
            <strong>Length contraction: moving things are shorter along their direction of motion.</strong>
            <Formula>length you measure = length at rest × k</Formula>
            A spaceship that is 10 metres long at rest is measured as 10 × 0.8 = <strong>8 metres</strong> as it flies past you at 0.6 c.
          </li>
          <li>
            <strong>Simultaneity: “at the same time” is not the same for everyone.</strong> Two lightning flashes that look simultaneous to someone standing by the track can look one-after-the-other to someone on a passing train. There is no single “now”
            across space.
          </li>
          <li>
            <strong>One number everyone agrees on.</strong> An <em>event</em> is something that happens at one place and one moment, such as a firework going off. Different observers disagree about the time between two events and about the
            distance between them, but they all agree on this number, called the <strong>interval</strong>:
            <Formula>interval² = (time between)² − (distance between)²</Formula>
            Here time is measured in seconds, and distance in <strong>light-seconds</strong>. A light-second is the distance light travels in one second, about 300,000 kilometres. This way both numbers have the same unit and can be combined.
            <br />
            <br />
            <strong>A worked example.</strong> A firework goes off. Then, 5 seconds later, a second one goes off 3 light-seconds away (about 900,000 kilometres).
            <ol style={list}>
              <li>The time between the two events is 5 seconds. Square it: 5 × 5 = 25.</li>
              <li>The distance between them is 3 light-seconds. Square it: 3 × 3 = 9.</li>
              <li>Subtract: 25 − 9 = 16. That is the interval squared.</li>
              <li>Take the square root: √16 = 4. The interval is <strong>4 seconds</strong>.</li>
            </ol>
            <strong>What the 4 seconds means.</strong> Imagine a clock that travels from the first firework to the second at a steady speed. To cover 3 light-seconds in 5 seconds, it must go at 3 ÷ 5 = 0.6 c. We worked out that k = 0.8 for that speed, so
            the clock runs slow and counts 5 × 0.8 = 4 seconds. The interval is the time that clock reads.
            <br />
            <br />
            <strong>Why everyone agrees.</strong> Now look at the same two fireworks from the clock’s point of view. It travels along with them, so for it both fireworks happen at the <em>same place</em>, with a gap of 4 seconds and a distance of 0.
            Its interval is 4 × 4 − 0 × 0 = 16. You measured 5 seconds and 3 light-seconds, the clock measures 4 seconds and 0, yet both get 16. (You can check the clock’s numbers with the Lorentz transformation of Experiment 11.)
            <br />
            <br />
            <strong>A daily-life comparison.</strong> Turn a map round. The “east” and “north” distances between two towns change as you turn it, but the straight-line distance between them does not. In the same way, observers split the gap between two events
            into “time” and “distance” differently, but the interval stays the same: it is the real separation between them in spacetime. Space and time mix; the interval does not change.
          </li>
          <li>
            <strong>Mass is a form of energy.</strong>
            <Formula>E = m × c²</Formula>
            Because c² is enormous (about 9 × 10¹⁶ in metres and seconds), 1 kilogram of mass corresponds to about 9 × 10¹⁶ joules of energy.
          </li>
        </ul>

        <h3 style={heading}>General relativity (1915): what gravity is</h3>
        <p style={paragraph}>
          It is called “general” because it extends special relativity to the general case: <strong>gravity</strong> and <strong>speeding up</strong>. It also rests on two ideas.
        </p>
        <p style={paragraph}>
          <strong>Idea 1: gravity and acceleration look the same, locally (the equivalence principle).</strong> If the cable of a lift snapped, everyone inside would float, weightless, until the crash. That is the same as coasting in a spaceship with
          the engine off, far from any planet. In a small, sealed cabin, no experiment can tell “standing on a planet” from “in a rocket that is speeding up”.
        </p>
        <p style={paragraph}>
          <strong>Idea 2: gravity is the curving of spacetime.</strong> Spacetime means space and time joined into one four-part stage (three directions of space and one of time). Mass and energy bend it, and everything, light included, follows the
          straightest possible path through the bent stage. What we call the pull of gravity is that bending. A short way to remember it: <em>matter tells spacetime how to curve, and spacetime tells matter how to move.</em> The usual picture is a bowling
          ball on a stretched rubber sheet with a marble rolling round it. It helps, but it only shows the curving of space, not of time.
        </p>
        <p style={paragraph}>
          <strong>“Einstein’s equations”</strong> are the equations that say exactly how much spacetime curves for a given amount of matter and energy. In words:
        </p>
        <Formula>curvature of spacetime = (8πG ÷ c⁴) × matter and energy</Formula>
        <p style={paragraph}>
          The left side describes the bending; the right side describes the matter and energy present; <strong>G</strong> is the gravitational constant, a number that sets how strong gravity is. The factor 8πG ÷ c⁴ is about 2 × 10⁻⁴³ in metres,
          kilograms and seconds, which is extremely small. That is why it takes something as heavy as a planet or a star to bend spacetime noticeably. (In full, this is a set of equations that are hard to solve. This app uses simple, hand-checkable
          versions of their answers, and says so each time.)
        </p>
        <p style={paragraph}>Three results you will meet, each with a formula you can check by hand:</p>
        <ul style={list}>
          <li>
            <strong>Gravity slows clocks.</strong> The closer a clock is to a heavy object such as the Earth, the slower it ticks. So a clock on the ground ticks a tiny bit slower than an identical clock on a tall tower. Neither clock is broken: gravity
            really does change how fast time passes.
            <br />
            <br />
            <strong>What “ticks faster” means.</strong> Imagine two people counting seconds out loud, side by side, starting together. If one of them counts very slightly faster, then after an hour that person has reached a slightly bigger number. In the same
            way, set the two clocks to the same time, say exactly noon, and leave one on the ground and one on the tower. The tower clock ticks very slightly more often. A year later, the tower clock will read a tiny bit <em>ahead</em> of the ground clock (by about
            a third of a millionth of a second, as the worked example below shows). Each clock is right for its own place. The difference only shows up when you bring them together and compare.
            <br />
            <br />
            <strong>Why more ticks means a reading that is ahead.</strong> A clock does not look at the sky to know the time. It only <em>counts its own ticks</em>, and each tick moves its display on by one second. So a clock that makes more ticks in the same stretch
            of time shows a bigger count. Here is an exaggerated example, made up only to show the idea (the real difference is far smaller): suppose the tower clock made 11 ticks in the time the ground clock makes 10. Both start at 12:00:00. When the
            ground clock has made its 10 ticks, it shows <strong>12:00:10</strong>. The tower clock has made 11 ticks in that same stretch, so it shows <strong>12:00:11</strong>: one second <em>ahead</em> of the ground clock. Same stretch of time, but a bigger count, so a reading that is further on.
            In real life the tower clock makes only a tiny fraction of a tick more, so its reading is ahead of the ground clock’s by only a tiny fraction of a second. “Ahead” here means further on in the count, the way a clock that is five minutes fast is ahead, not delayed.
            <br />
            <br />
            <strong>How big is the difference?</strong> For a small height above the ground, the higher clock gains this fraction of the time:
            <Formula>fraction gained ≈ g × h ÷ c²</Formula>
            The letters mean:
            <ul style={list}>
              <li>
                <strong>g</strong> is how strongly gravity pulls. On Earth a dropped object speeds up by 9.8 metres per second, every second, so g = 9.8.
              </li>
              <li>
                <strong>h</strong> is the height difference between the two clocks, in metres.
              </li>
              <li>
                <strong>c²</strong> is the speed of light multiplied by itself: 300,000,000 × 300,000,000 metres per second, about 9 × 10¹⁶ (a 9 followed by 16 zeros).
              </li>
            </ul>
            <strong>A worked example.</strong> Put one clock 100 metres above another.
            <ol style={list}>
              <li>Multiply g by h: 9.8 × 100 = 980.</li>
              <li>Divide by c²: 980 ÷ (9 × 10¹⁶) ≈ 1.1 × 10⁻¹⁴, which is 0.000000000000011.</li>
            </ol>
            <strong>What that means.</strong> The upper clock gains about 11 parts in a thousand million million. That is about one second every 3 million years, or about a third of a millionth of a second per year. It is far too small to notice in daily
            life, but the best atomic clocks can now measure it. The formula is only for small heights close to the ground; far above the Earth, or near a black hole, the full equations are needed.
          </li>
          <li>
            <strong>Black holes.</strong> Squeeze a mass inside a certain radius and nothing, not even light, can leave. That radius is
            <Formula>r = 2 × G × M ÷ c²</Formula>
            where M is the mass. For the Sun it is about 3 kilometres; for the Earth, about 9 millimetres.
          </li>
          <li>
            <strong>Light bends, ripples travel, the universe can expand.</strong> Light passing a heavy object follows its curved paths and bends. A sudden change in curvature, like two black holes merging, sends out ripples called gravitational waves.
            Applied to the whole universe, the same equations allow it to expand.
          </li>
        </ul>

        <h3 style={heading}>How the two theories fit together</h3>
        <p style={paragraph}>
          Special relativity is the special case of general relativity with the gravity switched off, or with a region so small that gravity is the same everywhere in it. General relativity gives back special relativity there. Some real systems need both.
          A GPS satellite is one: its speed slows its clock a little (special relativity), and being high above the Earth speeds it up more (general relativity), so overall its clock runs fast by about 38 millionths of a second per day, and GPS must correct for it.
        </p>

        <h3 style={heading}>Where each group of experiments fits</h3>
        <ul style={list}>
          <li>
            <strong>Relativity of Time and Motion</strong> and <strong>Spacetime Geometry</strong>: special relativity, from the first clock to the interval, light cones, energy and what a fast traveller sees.
          </li>
          <li>
            <strong>Gravity and Curved Spacetime</strong>: general relativity’s two ideas, built up from falling balls to orbits, black holes, bent light and GPS.
          </li>
          <li>
            <strong>Gravitational Waves</strong>, <strong>Black Holes and Strong Gravity</strong>, <strong>Cosmology</strong> and <strong>Cosmic Horizons</strong>: general relativity at work, on ripples, extreme gravity and the whole universe, with recent results.
          </li>
          <li>
            <strong>Evidence and Imagination</strong>: what has been tested in these theories and what has not, including ideas that the equations allow but nobody has seen.
          </li>
        </ul>

        <p style={{ marginTop: 0, marginBottom: 0 }}>
          <strong>One last thing.</strong> These two theories have passed every test so far, but they are not the last word. They do not yet fit together with quantum theory, the physics of the very small, and nobody knows how they will be joined. The project
          says, at each step, what has been tested and what has not.
        </p>
      </div>
    </details>
  )
}
