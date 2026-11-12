import { useState } from 'react'
import { markGuess, finalSeparationMeters, moonTidalNumbers } from '../physics/tidalEffectExperiment'
import type { PredictionChoice, TidalEffectExperimentResult } from '../physics/tidalEffectExperiment'

// Gravity and Curved Spacetime, Experiment 3's tutor (Part 4), audited to the newer rules (docs/audit/gravity-and-curved-spacetime/
// 03-draft-wording.md, section 9, approved by the owner on 2026-11-12 "all approved"). The prompts point to the two white marks on
// the graph by name and give no verdict; the explanation marks both guesses and is the first place "tidal effect" is named. Every
// number comes from the physics module (CLAUDE.md §9).

const CHOICE_PHRASE: Record<PredictionChoice, string> = {
  converge: 'drift together',
  same: 'stay the same distance apart',
  apart: 'drift apart',
}

const pointStyle = { marginBottom: '1rem', fontSize: '0.95rem', color: '#333', lineHeight: '1.6' } as const

type TutorStep = 'observe' | 'compare' | 'conceptual' | 'explained'

interface TidalEffectTutorProps {
  planetPrediction: PredictionChoice
  rocketPrediction: PredictionChoice
  result: TidalEffectExperimentResult
  onExplained?: () => void
}

export function TidalEffectExplanation({
  planetPrediction,
  rocketPrediction,
  result,
}: {
  planetPrediction: PredictionChoice
  rocketPrediction: PredictionChoice
  result: TidalEffectExperimentResult
}) {
  const planetMark = markGuess(result, 'planet', planetPrediction)
  const rocketMark = markGuess(result, 'rocket', rocketPrediction)
  const planetEnd = finalSeparationMeters(result, 'planet').toFixed(3)
  const start = result.initialSeparationMeters.toFixed(1)
  const moon = moonTidalNumbers()
  return (
    <div>
      <p style={pointStyle}>
        <strong>Your guesses, marked.</strong> {planetMark.text} {rocketMark.text}
      </p>
      <p style={pointStyle}>
        <strong>1. A real planet's gravity points toward its center, not in one shared direction.</strong> The two balls started {start} m
        apart. Because each ball is pulled toward the same center point, and that center is in a very slightly different direction from each
        ball's own position, the two pulls are not quite parallel — so the balls drift toward each other as they fall, ending up only{' '}
        {planetEnd} m apart by the time they land. Picture two people walking toward a lamp post on a straight road, one from each side, a
        little apart: if each walks straight at the lamp post, their paths come together as they get closer. In the same way, each ball is
        pulled toward the same center, so their two paths get closer as they fall. At {result.accelerationInG}g and strength{' '}
        {result.convergenceStrength} the separation at the end is {start} × (1 − {result.convergenceStrength}) ={' '}
        {planetEnd} m.
      </p>
      <p style={pointStyle}>
        <strong>2. A rocket's push has no center to point toward.</strong> Every part of the cabin gets shoved in the exact same direction,
        by the exact same amount, no matter how hard the rocket accelerates. So the two balls in the rocket cabin never had any reason to
        drift together or apart — they stayed exactly {start} m apart the whole time.
      </p>
      <p style={pointStyle}>
        <strong>3. This means the equivalence principle (Experiment 1) only holds exactly for a small enough cabin.</strong> A single ball
        couldn't tell the two cabins apart. Two balls, spread far enough apart, can — because only one of the two cabins has a "center" for
        gravity to point toward.
      </p>
      <p style={pointStyle}>
        <strong>4. This convergence is called a tidal effect</strong> — the same kind of effect responsible for ocean tides. The effect here
        is exaggerated so you could see it; a real planet and a real cabin would show a change far too small to notice. The page below this
        explanation has a plain account of tides.
      </p>
      <p style={pointStyle}>
        <strong>5. The tidal effect has two sides, and this experiment showed one.</strong> You saw the sideways squeeze: paths that point at
        one center come together. The same cause also produces a stretch along the line toward the center. Gravity gets weaker with
        distance, so the part of an object nearer the center is pulled a little harder than the part farther away, and the object is
        pulled longer. Picture a line of runners all chasing the same finish line, where the front runner is slightly faster than the back
        runner: the line stretches out as well as narrowing.
      </p>
      <p style={pointStyle}>
        <strong>6. Real tides are this effect on the whole Earth.</strong> The Moon's center is {moon.moonDistanceKm.toLocaleString('en-US')} km
        away, and the Earth is {moon.earthRadiusKm.toLocaleString('en-US')} km in radius. So the side of the Earth facing the Moon is about{' '}
        {moon.nearSideDistanceKm.toLocaleString('en-US')} km from the Moon and the far side about{' '}
        {moon.farSideDistanceKm.toLocaleString('en-US')} km. Because gravity weakens with the square of the distance, the Moon pulls the near
        side about ({moon.farSideDistanceKm.toLocaleString('en-US')} ÷ {moon.nearSideDistanceKm.toLocaleString('en-US')})² ={' '}
        {moon.nearToFarPullRatio.toFixed(3)} times as hard as the far side, roughly 7% more. That small difference stretches the Earth
        slightly toward and away from the Moon, and the oceans, which can flow, rise into two bulges: one under the Moon and one on the
        opposite side. As the Earth turns, a coastline passes through both bulges each day, which is why most coasts see two high tides a
        day. The Sun does the same thing more weakly.
      </p>
      <p style={pointStyle}>
        <strong>7. Why you do not feel it.</strong> The pull only differs across a large distance. Across a cabin a few meters wide the
        difference in pull is far too small to notice or measure with a ball, which is why one ball in a cabin cannot tell a planet from a
        rocket. Only a long separation, such as an ocean or a whole planet, makes the effect easy to see.
      </p>
      <p style={{ ...pointStyle, marginBottom: 0 }}>
        Try other settings in Part 2 to see the same thing: whatever acceleration you choose, the rocket cabin's line stays at {start} m, and
        the bigger the strength, the further the planet cabin's line ends from it.
      </p>
    </div>
  )
}

export function TidalEffectTutor({ planetPrediction, rocketPrediction, result, onExplained }: TidalEffectTutorProps) {
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
              "Look at the graph. It has two lines, a solid indigo one for the planet cabin and a dashed amber one for the rocket cabin. In which cabin did the balls' distance change? Your two guesses are the white marks at the ends of the lines."}
            {tutorStep === 'compare' &&
              `You guessed that the planet cabin's balls would ${CHOICE_PHRASE[planetPrediction]}, and that the rocket cabin's balls would ${CHOICE_PHRASE[rocketPrediction]}. Those are the two white marks. Look at the graph again: what do you notice when you compare what you expected with what was drawn?`}
            {tutorStep === 'conceptual' &&
              'The rocket pushes every part of the cabin the same way, in the same direction. Why might a real planet not do that?'}
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

      {tutorStep === 'explained' && <TidalEffectExplanation planetPrediction={planetPrediction} rocketPrediction={rocketPrediction} result={result} />}
    </div>
  )
}
