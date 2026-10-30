import { useState } from 'react'
import { climbFacts, exampleMerger, GAP_MEASURED_LOW_SOLAR, GAP_THEORY_SOLAR, GW231123, ORIGIN_FIGURES, possibleGuessResult, spinGuessResult, spinPicture } from '../physics/heaviestMerger'
import type { PossibleChoice, SpinGuessChoice } from '../physics/heaviestMerger'

type TutorStep = 'observe' | 'compare' | 'conceptual' | 'explained'

interface HeaviestMergerTutorProps {
  possiblePrediction: PossibleChoice
  spinPrediction: SpinGuessChoice
  onExplained?: () => void
}

const possibleWords: Record<PossibleChoice, string> = { no: 'no, it could not', yes: 'yes, it could', unsure: 'not sure' }

const paragraphStyle = { marginBottom: '1rem', fontSize: '0.95rem', color: '#333', lineHeight: '1.6' } as const

function n(x: number): string {
  return String(Number(x.toFixed(1)))
}
function two(x: number): string {
  return x.toFixed(2)
}

// The tutor of Cosmic Horizons Experiment 20. DRAFT wording for the owner's line-by-line approval (CLAUDE.md §28.1), from the specification's "AI Tutor Behavior" and the group's
// tutor pattern: observe, compare with the predictions, one conceptual question, then the explanation after the learner has responded. Every number comes from the physics module
// (heaviestMerger.ts), never typed in by hand (CLAUDE.md §9). The predictions are marked only in the explanation (the owner's choice for the group). The tutor does not say which
// explanation of GW231123 is right, does not give any explanation's likelihood as settled, and does not claim that merging is how GW231123 was made.
export function HeaviestMergerTutor({ possiblePrediction, spinPrediction, onExplained }: HeaviestMergerTutorProps) {
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

  // Every number below is computed from the module.
  const ex = exampleMerger()
  const f = climbFacts()
  const sp = spinPicture()
  const pr1 = possibleGuessResult(possiblePrediction)
  const pr2 = spinGuessResult(spinPrediction)
  const [heavier, lighter] = GW231123.masses
  const [firstA, firstB] = ORIGIN_FIGURES.firstGenerationCounts

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
      <h2 style={{ marginTop: 0, marginBottom: '1rem', fontSize: '1.125rem', color: '#0066cc' }}>Let's reflect on what you observed</h2>
      {(tutorStep === 'observe' || tutorStep === 'compare' || tutorStep === 'conceptual') && (
        <div>
          {tutorStep === 'observe' && (
            <>
              <p style={paragraphStyle}>
                Let’s start with what is in front of you. Look at <strong>Picture 1</strong>, panel A. Find the pink band and the three green lines. Which of the three black holes is
                inside the band, and which are not? Then look at panel B: where does the teal dot at the end of the arrow sit, compared with the band?
              </p>
              <p style={paragraphStyle}>
                Now look at <strong>Picture 2</strong>. Find the dashed blue line and the two green dots. Are the green dots to the left or the right of the line?
              </p>
              <p style={paragraphStyle}>Tell me what you see, in your own words. There is no wrong answer here.</p>
            </>
          )}
          {tutorStep === 'compare' && (
            <>
              <p style={paragraphStyle}>
                Now bring your own guesses back. In Part 1 you made two predictions, and they are drawn in white on the real pictures, so you can see each guess next to the real result.
              </p>
              <ul style={{ ...paragraphStyle, paddingLeft: '1.25rem' }}>
                <li>
                  <strong>The white mark and the box “YOUR GUESS”</strong> in panel B of Picture 1 are your guess for Prediction 1. It is only a marker (a tick, a cross or a question mark), with no size. How
                  does the black hole at the end of the arrow compare with what you expected?
                </li>
                <li>
                  <strong>The white mark</strong> in Picture 2 is your guess for Prediction 2. It sits at the spin you chose. How far is it from the dashed blue line?
                </li>
              </ul>
              <p style={paragraphStyle}>
                Then check <strong>Table 4</strong> (the row “The black hole they make”) and <strong>Table 3</strong> (the row “Two equal black holes that do not spin”), which have the numbers for both
                predictions. Did anything match what you expected, or surprise you? Tell me what you notice. I won’t say yet whether you were right, because I want to hear how you read it first.
              </p>
            </>
          )}
          {tutorStep === 'conceptual' && (
            <>
              <p style={paragraphStyle}>
                One last question before the explanation. Imagine a forest where, for a reason that scientists understand well, no tree should grow taller than a certain height. One day a hiker
                finds a tree far taller than that limit. How could it have got there? Think of as many different ways as you can. That is an everyday comparison, not black-hole physics.
              </p>
              <p style={paragraphStyle}>
                Now the black holes. Single stars are not expected to leave black holes in the gap, yet GW231123 contains black holes in or above it. Suppose you had to explain it. What would you suggest?
                Make a guess, even if you are not sure.
              </p>
            </>
          )}
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
        <div>
          {/* The predictions are marked here, in the explanation, and nowhere earlier, so the learner reasons first (CLAUDE.md §12). */}
          <p style={paragraphStyle}>
            <strong>Your predictions.</strong> Now that you have thought about it, here is how each one compared with the result. For Prediction 1 you answered: <em>{possibleWords[possiblePrediction]}</em>. The sum in Table 4
            gives {ex.startSolar} + {ex.startSolar} − {n(ex.radiatedSolar)} = {n(ex.resultSolar)} Suns, which is inside the band that starts at {GAP_THEORY_SOLAR.low}, so the real answer is <em>{possibleWords[pr1.real]}</em>.{' '}
            {pr1.unsure ? 'You said you were not sure, so this one is neither matched nor missed.' : pr1.matched ? 'Your prediction matched.' : 'Your prediction did not match.'} For Prediction 2 you answered: <em>about {spinPrediction}</em>.
            The published spin of the black hole that two equal black holes that do not spin make is <em>{two(sp.simple)}</em>, so the nearest answer is <em>about {pr2.nearest}</em>. {pr2.matched ? 'Your prediction matched.' : 'Your prediction did not match.'}{' '}
            Keep in mind that Prediction 1 is about arithmetic with imagined numbers, not about how GW231123 was made, and that the {two(sp.simple)} was read only in a summary of simulations.
          </p>
          <p style={paragraphStyle}>
            <strong>1. Why single stars should not leave these black holes.</strong> A star is held up by two pushes from the inside, the gas’s and the light’s, and in the very heaviest stars the light’s share is large. At the
            extreme heat there, some of the light turns into pairs of tiny particles, the push falls, the star sags and heats, and the burning runs away and blows the whole star apart: a pair-instability supernova. No black hole is left, so black holes
            of the masses that such stars would have left should be missing. Theory puts that range at about {GAP_THEORY_SOLAR.low} to {GAP_THEORY_SOLAR.high} Suns, and a 2025 study of the black holes the detectors had seen put the lower edge nearer {GAP_MEASURED_LOW_SOLAR.value}.
            So the edges are not sharp, and that is why this page drew both.
          </p>
          <p style={paragraphStyle}>
            <strong>2. Why merging can fill the gap.</strong> When two equal black holes merge, the new one has about twice the mass, less the share sent out as waves. With the {Math.round(ex.share * 100)} percent that this page assumed, each merger multiplies the mass by 2 × {two(1 - ex.share)} = {two(f.stepFactor)}. The band’s top is{' '}
            {GAP_THEORY_SOLAR.high} ÷ {GAP_THEORY_SOLAR.low} = {two(f.bandRatio)} times its bottom. Think of stepping stones across a stream: if each step is shorter than the stream is wide, you cannot jump clean over it, and you must put a foot in the water. Here each step multiplies by {two(f.stepFactor)},
            which is less than {two(f.bandRatio)}, so a climb that starts below the band has to land in it at least once. That is what Table 4 and Drawing A showed: {ex.startSolar} Suns went to {n(ex.resultSolar)}, in the band. A black hole heavier than {n(f.jumpOverMassSolar)} Suns is the first that one equal merger could carry clean over the top, and nothing below the band is that heavy. This is arithmetic for equal black holes and an assumed share. It shows that merging <em>can</em> put a black hole in the gap. It does not show that GW231123’s black holes were made this way.
          </p>
          <p style={paragraphStyle}>
            <strong>3. What it would take.</strong> Each round doubles the number of starting black holes. In the example, {f.twentyStartingCount} black holes of 20 Suns, merged in three rounds, make one of {n(f.twentyAfterThree)} Suns, about the heavier black hole of GW231123 ({heavier.value}). That is only a coincidence of
            arithmetic, and the page does not claim it. But it shows the cost: many black holes have to meet, one after another, which needs a crowded place such as a dense star cluster. One analysis counts about {firstA} and {firstB} first-generation black holes behind the two black holes of GW231123. Whether that many met is not known.
          </p>
          <p style={paragraphStyle}>
            <strong>4. The spin clue.</strong> A merger of two equal black holes that do not spin makes a black hole that does spin, at about {two(sp.simple)}. That is because the two were circling each other, and the turning of their orbit has to go somewhere: it ends up as the spin of the new black hole. (This is a general
            statement that this page did not check against a source.) The measured best estimates, {two(sp.rows[0].value)} and {two(sp.rows[1].value)}, are higher by {two(sp.rows[0].gapFromSimple)} and {two(sp.rows[1].gapFromSimple)}, and the heavier black hole’s whole range starts at {two(sp.rows[0].low)}, above {two(sp.simple)}. If each black hole were itself
            the product of a merger like that, you might expect spins nearer {two(sp.simple)}, and one analysis finds it possible, at about {ORIGIN_FIGURES.hierarchicalClusterChancePercent} percent, that a cluster makes a pair with spins like these. So the spins are a clue that makes the earlier-mergers idea harder, not a verdict against it. The lighter black hole’s range, from {two(sp.rows[1].low)}, is wide enough to include {two(sp.simple)}.
          </p>
          <p style={paragraphStyle}>
            <strong>5. The four proposals.</strong> Earlier mergers is the idea you have just seen. <em>Primordial black holes</em> would not come from stars at all, so the gap would not apply. The other two say that the signal may have been misread. If it was <em>lensed</em>, the black holes would only look heavier than they are, and the total would be {ORIGIN_FIGURES.lensedTotalRangeSolar[0]} to {ORIGIN_FIGURES.lensedTotalRangeSolar[1]} Suns,
            and a 2026 analysis favours that reading, with a false-alarm probability below {ORIGIN_FIGURES.lensingFalseAlarmBelowPercent} percent. If it was <em>two overlapping signals</em>, there would be two mergers and each black hole could be lighter than it looks. None of the four is confirmed, the papers disagree on how likely each is, and no paper behind them was read in full for this page, so I will not choose one.
            Whatever you suggested in the last question, compare it with these four.
          </p>
          <p style={paragraphStyle}>
            <strong>6. How sure we are.</strong> That GW231123 was a very heavy merger is strong evidence, and the masses and spins have wide give-or-takes: the lighter black hole’s mass runs from {n(lighter.value - lighter.minus)} to {n(lighter.value + lighter.plus)} Suns, and its spin from {two(sp.rows[1].low)} to {two(sp.rows[1].high)}. The gap’s edges are not sharp. The
            numbers on this page come from LIGO’s summary page and from summaries of the discovery paper’s abstract, not from the paper itself. It is one event. And what made it is open, which is why the status is strong evidence for what was seen and open for what it was.
          </p>
          <p style={{ ...paragraphStyle, marginBottom: 0 }}>
            <strong>7. What was shown, and what was not.</strong> You saw that single stars are not expected to leave black holes in the gap, that merging two black holes below it can make one inside it, that the spins of GW231123’s black holes are higher than a simple merger of non-spinning black holes gives, and that four explanations have been proposed. You did not see
            how GW231123 was actually made, a ranking of the explanations, or a measurement of any star cluster or any lens: those are not in these numbers. Try the settings in Part 2 again if you like: they show how other starting masses would climb, and the real pictures and tables will not change.
          </p>
        </div>
      )}
    </div>
  )
}
