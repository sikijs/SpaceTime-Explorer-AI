// The Spacetime Geometry group's closing recap. It adds no physics and no controls: it sorts what the ten experiments showed into what
// every observer agrees on, what each observer measures differently, and what each observer only sees. Every figure comes from
// `synthesisFigures`, which reads it from the earlier experiment's own function, so it cannot drift from what the learner saw. See
// docs/experiments/spacetime-geometry/closing-synthesis.md (approved with defaults on 2026-10-16). The wording is draft for the owner's
// line-by-line approval (CLAUDE.md §28.1).
import { EXAMPLE_EVENT, EXAMPLE_PASSING_SPEED, EXAMPLE_SPEED, PUSH_ENERGIES, synthesisFigures } from '../physics/synthesisFigures'

const textStyle = { fontSize: '0.9375rem', lineHeight: 1.6 } as const

const two = (value: number) => value.toFixed(2)
const one = (value: number) => value.toFixed(1)
const three = (value: number) => value.toFixed(3)

export function SpacetimeGeometrySynthesis() {
  const f = synthesisFigures()
  const speed = EXAMPLE_SPEED

  return (
    <div className="exp-card" style={{ marginTop: '2rem', padding: '1.5rem', ...textStyle }}>
      <h2 style={{ marginTop: 0 }}>Putting It All Together: What Do Observers Agree On, and What Do They Only See?</h2>
      <p>
        You have now run all ten experiments in this group. They asked different questions, but they had one thing in common: two observers
        who move differently, looking at the same events. This section sorts what they showed into three kinds of answer. It adds nothing
        new: every number below is one you have already seen.
      </p>

      <h3>1. What every observer agrees on</h3>
      <ul>
        <li>
          <strong>The interval</strong> (Experiment 1). Two observers can measure different times and distances between the same two events,
          but squaring the time, squaring the distance and subtracting gives the same answer for all of them.
        </li>
        <li>
          <strong>Which kind of pair two events are</strong> (Experiment 2). Whether a signal slower than light could make the trip, only
          light could, or nothing could (timelike, lightlike or spacelike). Every observer gets the same answer.
        </li>
        <li>
          <strong>The order of cause and effect</strong> (Experiment 3). If one event is inside or on the edge of another’s light cone, every
          observer finds the same one first. No observer ever finds a cause after its effect.
        </li>
        <li>
          <strong>Mass</strong> (Experiment 5). Energy and momentum differ between observers, but E² − (pc)² is the same for all, and it is
          the square of the mass. For example, two lumps of mass m that meet at {speed}c make one lump of mass {one(f.lumpMass)} m, not 2 m,
          because their energy of motion becomes internal energy, and every observer agrees on that {one(f.lumpMass)} m.
        </li>
        <li>
          <strong>The speed of light</strong> (earlier chapters). Every observer measures the same speed for light.
        </li>
      </ul>

      <h3>2. What each observer measures differently</h3>
      <ul>
        <li>
          <strong>Times and distances</strong> between the same two events (Experiment 1, and the time dilation and length contraction of
          the first chapter).
        </li>
        <li>
          <strong>The order of two events that could not be cause and effect</strong> (Experiment 3). For an event {EXAMPLE_EVENT.time} seconds
          after O and {EXAMPLE_EVENT.position} light-seconds away, the lab finds it {two(f.labTimeBetween)} seconds after O, and an observer
          passing at {EXAMPLE_PASSING_SPEED}c finds it {two(Math.abs(f.passingTimeBetween))} seconds before O.
        </li>
        <li>
          <strong>Energy and momentum</strong> (Experiment 5).
        </li>
        <li>
          <strong>The direction, color and brightness of starlight</strong> (Experiments 7, 8 and 9). At {speed}c, a traveler sees the star
          the lab sees sideways at {one(f.sidewaysStarTravelerAngle)} degrees; sees light at {two(f.frequencyAhead)} times the frequency
          straight ahead and {two(f.frequencyBehind)} times straight behind; and sees a star {two(f.brightnessAhead)} times as bright
          straight ahead and {two(f.brightnessBehind)} times straight behind. The stars have not changed. Each observer measures the light
          that reaches them.
        </li>
      </ul>

      <h3>3. What an observer sees is a different question again</h3>
      <p>
        “Measured” means what an observer works out with rulers and clocks, after allowing for the time light takes to travel. “Seen” means
        the light that reaches them now, which left its source earlier. They are different questions, and both answers are right.
      </p>
      <ul>
        <li>
          <strong>A spaceship’s image</strong> (Experiment 4). A spaceship flying toward the lab at {speed}c has an image that seems to cover
          the distance at {two(f.approachingImageSpeed)}c. That breaks no rule, because the spaceship itself is below the speed of light and
          nothing travels along the image.
        </li>
        <li>
          <strong>A cube’s photograph</strong> (Experiment 10). At {speed}c the lab’s ruler finds the cube’s front face {two(f.cubeFrontFace)}{' '}
          as wide as at rest. But a photograph also shows the trailing face, because light from the far side left earlier, when the cube was
          farther back. The photograph is {two(f.cubeFrontFace)} + {two(f.cubeTrailingFace)} = {two(f.cubePhotographWidth)} wide and looks
          like a cube turned by {one(f.cubeTurnDegrees)} degrees. The cube has not turned, and it is still measured as shorter.
        </li>
      </ul>

      <h3>4. Why pushing harder gives less speed</h3>
      <p>
        A moving particle’s energy is its rest energy divided by the time dilation factor D (Experiment 5), and it grows without limit as
        the speed nears the speed of light. A speed cannot pass the speed of light, but energy has no such limit. So the more energy you give
        a particle, the less speed each extra bit of energy adds. Energies of {PUSH_ENERGIES[0]}, {PUSH_ENERGIES[1]} and {PUSH_ENERGIES[2]}{' '}
        rest energies give speeds of {three(f.pushSpeeds[0])}c, {three(f.pushSpeeds[1])}c and {three(f.pushSpeeds[2])}c. The extra energy is
        still there: it shows up as energy, not as much more speed.
      </p>

      <h3>What this group did not cover</h3>
      <p>
        Everything here was steady motion in a straight line, in flat spacetime, shown on one line or a flat slice. We did not look at
        acceleration, at forces, at electric charge or at quantum effects. Gravity is the subject of the Gravity and Curved Spacetime
        chapter. The formulas were used, not derived, and the comparison of the interval with a stick’s length in Experiment 1 was not exact.
      </p>
      <p style={{ marginBottom: 0 }}>
        <strong>A habit to keep.</strong> When two observers disagree, ask two questions. What does each one measure? And what does each one
        see? Much of the confusion about relativity comes from mixing them up.
      </p>
    </div>
  )
}
