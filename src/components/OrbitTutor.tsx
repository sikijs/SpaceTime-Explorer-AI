import { useState } from 'react'
import {
  COLLISION_RADIUS_FACTOR,
  ORBIT_GRAVITATIONAL_PARAMETER,
  ORBIT_INITIAL_DISTANCE,
  PART_ONE_PUSHES,
  circularSpeedFor,
  farthestPointFraction,
  pushEdgeForCollisionSize,
  pushEdges,
  pushSummary,
  tutorMarking,
} from '../physics/orbitExperiment'
import type { OrbitOutcome, YesNo } from '../physics/orbitExperiment'

// Gravity and Curved Spacetime, Experiment 6's tutor (Part 4), audited to the newer rules (docs/audit/gravity-and-curved-spacetime/
// 06-draft-wording.md, section 9, approved by the owner on 2026-11-12). The prompts point to the three white marks on the graph by
// name and give no verdict; the explanation marks all three guesses and states the three bands. Every number comes from the physics
// module (CLAUDE.md §9).

type TutorStep = 'observe' | 'compare' | 'conceptual' | 'explained'

interface OrbitTutorProps {
  slowPrediction: OrbitOutcome
  fastPrediction: OrbitOutcome
  inBetweenPrediction: YesNo
  onExplained?: () => void
}

function outcomeText(outcome: OrbitOutcome): string {
  if (outcome === 'falls-in') return 'falls into the mass'
  if (outcome === 'escapes') return 'flies away and never returns'
  return 'curves around and comes back'
}

const pointStyle = { marginBottom: '1rem', fontSize: '0.95rem', color: '#333', lineHeight: '1.6' } as const
const push100 = (fraction: number) => Math.round(fraction * 100)
const matchText = (matches: boolean) => (matches ? 'That matches what you guessed.' : 'That is different from what you guessed.')

export function OrbitExplanation({ slowPrediction, fastPrediction, inBetweenPrediction }: Omit<OrbitTutorProps, 'onExplained'>) {
  const marking = tutorMarking(slowPrediction, fastPrediction, inBetweenPrediction)
  const edges = pushEdges()
  const weak = push100(PART_ONE_PUSHES.weak)
  const strong = push100(PART_ONE_PUSHES.strong)
  const farthest = (f: number) => farthestPointFraction(f)
  const weakSummary = pushSummary(PART_ONE_PUSHES.weak)
  const justAbove = pushSummary(0.45)
  const num = (value: number) => value.toFixed(2)
  const strongerPullSpeed = circularSpeedFor(4 * ORBIT_GRAVITATIONAL_PARAMETER, ORBIT_INITIAL_DISTANCE)
  const edgeRounded = push100(edges.fallsInBelow) / 100
  const inBetweenActual =
    marking.inBetween.actual === 'yes'
      ? `yes: a wide band of pushes, from about ${push100(edges.fallsInBelow)} to about ${push100(edges.escapesFrom)}, make the object orbit`
      : 'no'
  return (
    <div>
      <p style={pointStyle}>
        <strong>Your guesses, marked.</strong> You guessed that a very weak push {outcomeText(marking.weak.guess)}. At push strength {weak}{' '}
        it {outcomeText(marking.weak.actual)}. {matchText(marking.weak.matches)} You guessed that a very strong push{' '}
        {outcomeText(marking.strong.guess)}. At push strength {strong} it {outcomeText(marking.strong.actual)}.{' '}
        {matchText(marking.strong.matches)} You guessed {marking.inBetween.guess === 'yes' ? 'yes' : 'no'}, that{' '}
        {marking.inBetween.guess === 'yes' ? 'something different happens' : 'nothing different happens'} in between. In fact the answer
        is {inBetweenActual}. {matchText(marking.inBetween.matches)}
      </p>
      <p style={pointStyle}>
        <strong>1. The object is always just falling under gravity</strong>, exactly like the dropped ball in Experiment 1 (the equivalence
        principle). The only push it ever got was the one you gave it at the very start. After that, gravity is the only force acting on it.
      </p>
      <p style={pointStyle}>
        <strong>2. The only difference between falling in, orbiting and flying away is how strong that starting push was.</strong> The mass
        and the starting distance never changed. Only the push did.
      </p>
      <p style={pointStyle}>
        <strong>3. Three kinds of path.</strong> A push below about {push100(edges.fallsInBelow)} falls in. A push from about{' '}
        {push100(edges.fallsInBelow)} to about {push100(edges.escapesFrom)} orbits. A push above about {push100(edges.escapesFrom)} flies
        away and never comes back. In between there is not one &ldquo;right&rdquo; push: a whole band of them orbits, and only 100 makes a
        perfect circle. The others make a stretched oval, longer and longer as the push gets stronger. At 105 the farthest point is{' '}
        {farthest(1.05).toFixed(1)} times the start distance, at 120 it is {farthest(1.2).toFixed(1)} times, at 135 it is{' '}
        {farthest(1.35).toFixed(0)} times, and at 140 it is {farthest(1.4).toFixed(0)} times, almost leaving. Think of throwing a ball off
        the edge of a cliff harder and harder: a gentle throw lands close by, a hard throw lands far away, and if you could throw it hard
        enough, it would keep falling toward the ground while the ground itself curves away beneath it just as fast, so it never
        actually lands. That is an orbit.
      </p>
      <p style={pointStyle}>
        <strong>4. Where the {push100(edges.escapesFrom)} comes from.</strong> The speed that is just enough to escape is the square root of
        2 times the circular-orbit speed. With this page&rsquo;s numbers the circular-orbit speed is the square root of (1 ÷ 1) = 1, so the
        escape speed is 1.414 times it: push strength {push100(edges.escapesFrom)}. Above that, the pull of the mass can never bring the
        object back; below it, it always can.
      </p>
      <p style={pointStyle}>
        <strong>5. Where the {push100(edges.fallsInBelow)} comes from.</strong> It is not a law of gravity. It comes from how wide we made
        the mass, not from how much mass there is. The &ldquo;mass&rdquo; is the pale yellow dot in the middle of the drawing: the thing
        the object is pulled toward, like a planet or a star. We drew it as a small ball with a radius of {COLLISION_RADIUS_FACTOR} of the object&rsquo;s starting distance (the
        drawing is to scale). &ldquo;Its size&rdquo; here means how wide it is, not how heavy it is. We count the object as having fallen
        in if its path comes inside that dot, as if it had hit the surface. A real planet or star has a surface too.
      </p>
      <p style={pointStyle}>
        With the numbers: a push of 20 gets as close as {num(weakSummary.closestApproach)} of the starting distance, well inside the dot
        (radius {COLLISION_RADIUS_FACTOR}), so it falls in. A push of 45 gets as close as {num(justAbove.closestApproach)}, just outside the
        dot, so it swings past and goes on orbiting. The edge is the push whose closest approach is exactly {COLLISION_RADIUS_FACTOR}: about{' '}
        {push100(edges.fallsInBelow)}. It is like throwing a ball past a tree: whether it hits depends on how wide the tree is. If we
        had made the mass wider, with a radius of 0.2, the edge would move up to about {push100(pushEdgeForCollisionSize(0.2))}; thinner,
        with a radius of 0.05, down to about {push100(pushEdgeForCollisionSize(0.05))}. The other edge, {push100(edges.escapesFrom)}, does
        not move: it depends on gravity alone, not on how wide the mass is.
      </p>
      <p style={pointStyle}>
        <strong>What about the mass&rsquo;s value?</strong> On this page the mass has a pull of {ORBIT_GRAVITATIONAL_PARAMETER} (a relative
        number, not kilograms: it says how strongly the mass attracts the object, so a heavier mass would have a bigger pull), and the
        object starts at a distance of {ORBIT_INITIAL_DISTANCE}. Neither number moves the two edges. Push strength is measured against the
        circular-orbit speed, and that speed already includes the pull. With a pull of 4 instead, the circular-orbit speed would be{' '}
        {strongerPullSpeed}, so a push of {push100(edges.fallsInBelow)} would be a starting speed of {edgeRounded} &times;{' '}
        {strongerPullSpeed} = {(edgeRounded * strongerPullSpeed).toFixed(2)} instead of {edgeRounded} &times; 1 = {edgeRounded}. That is a
        faster object, but the stronger pull drags it in just as much harder. The formulas for the two edges have no pull in them, so with a
        pull of 4 the edges would still be at push {push100(edges.fallsInBelow)} and {push100(edges.escapesFrom)}. Only the width of the mass moves the {push100(edges.fallsInBelow)}.
      </p>
      <p style={pointStyle}>
        <strong>6. This is the same idea as the geodesics in Experiment 4 (curved spacetime).</strong> The path is as straight as spacetime
        allows, and it curves because spacetime near the mass is curved (Experiment 4), by an amount that depends on the mass and distance
        (Experiment 5, what curves spacetime).
      </p>
      <p style={{ ...pointStyle, marginBottom: 0 }}>
        <strong>7. This used ordinary, first-order gravity</strong> &mdash; the same rule used to predict real satellites and planets
        &mdash; not the exact general-relativistic calculation, the same simplification Experiments 2, 3 and 5 of this chapter use.
      </p>
    </div>
  )
}

export function OrbitTutor({ slowPrediction, fastPrediction, inBetweenPrediction, onExplained }: OrbitTutorProps) {
  const [tutorStep, setTutorStep] = useState<TutorStep>('observe')
  const [responseInput, setResponseInput] = useState('')

  const handleContinue = () => {
    if (responseInput.trim() === '') return

    if (tutorStep === 'observe') {
      setTutorStep('compare')
    } else if (tutorStep === 'compare') {
      setTutorStep('conceptual')
    } else if (tutorStep === 'conceptual') {
      setTutorStep('explained')
      onExplained?.()
    }
    setResponseInput('')
  }

  const isResponseEmpty = responseInput.trim() === ''

  return (
    <div
      style={{
        marginTop: '2rem',
        padding: '1.5rem',
        border: '1px solid #d9e8f5',
        borderRadius: '8px',
        backgroundColor: '#f0f7ff',
      }}
    >
      <h2 style={{ marginTop: 0, marginBottom: '1rem', fontSize: '1.125rem', color: '#0066cc' }}>
        Let's reflect on what you observed
      </h2>

      {(tutorStep === 'observe' || tutorStep === 'compare' || tutorStep === 'conceptual') && (
        <div>
          <p style={{ marginBottom: '1rem', fontSize: '0.95rem', color: '#333' }}>
            {tutorStep === 'observe' &&
              'Look at the drawing and the graph. What happened to each of the three pushes? Say what you saw on each path.'}
            {tutorStep === 'compare' &&
              `Your guesses are the three white marks on the graph. You guessed that a very weak push ${outcomeText(slowPrediction)} and that a very strong push ${outcomeText(fastPrediction)}, and you guessed ${inBetweenPrediction === 'yes' ? 'yes' : 'no'} to something different happening in between. Look at where each white mark sits compared with the heavy teal (blue-green) line. What do you notice, and was anything a surprise?`}
            {tutorStep === 'conceptual' &&
              'The mass and the starting distance were the same the whole time. What was the only thing that changed between falling in, escaping, and orbiting? If you have not already, try a few pushes of your own in Part 2 and see where the paths change.'}
          </p>

          <textarea
            value={responseInput}
            onChange={(e) => setResponseInput(e.target.value)}
            placeholder="Type your thoughts here..."
            style={{
              width: '100%',
              minHeight: '100px',
              padding: '0.75rem',
              fontSize: '0.875rem',
              border: '1px solid #ccc',
              borderRadius: '4px',
              fontFamily: 'inherit',
              resize: 'vertical',
            }}
          />

          <button
            onClick={handleContinue}
            disabled={isResponseEmpty}
            style={{
              marginTop: '0.75rem',
              padding: '0.5rem 1.5rem',
              fontSize: '0.875rem',
              fontWeight: 'bold',
              backgroundColor: isResponseEmpty ? '#ccc' : '#0066cc',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: isResponseEmpty ? 'not-allowed' : 'pointer',
              opacity: isResponseEmpty ? 0.6 : 1,
            }}
          >
            Continue
          </button>
        </div>
      )}

      {tutorStep === 'explained' && (
        <OrbitExplanation
          slowPrediction={slowPrediction}
          fastPrediction={fastPrediction}
          inBetweenPrediction={inBetweenPrediction}
        />
      )}
    </div>
  )
}
