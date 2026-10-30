import { useState } from 'react'
import { BEFORE_CHOICES, CLOCK_CHOICES, beforeGuessResult, clockGuessResult, exampleSteps, friendlyDuration, pictureTwo, predictionOneAnswerId, predictionTwoAnswerId, tutorFigures } from '../physics/timeTravel'

// Evidence and Imagination, Experiment 2: Part 4, the tutor. The wording is approved by the owner (2026-10-30) (CLAUDE.md §28.1). Observe, compare with the
// predictions, one conceptual question, then the explanation. Every number comes from the physics module (timeTravel.ts), never typed in by hand (CLAUDE.md §9), except the everyday comparison
// (the time-zone border). The predictions are marked only in the explanation (CLAUDE.md §12, §13). The tutor never says that travel to the past is possible, and never that it
// is impossible. The time-zone comparison and the "no gap before the trip" argument have no source (to be listed under "Open" in the specification).

type TutorStep = 'observe' | 'compare' | 'conceptual' | 'explained'

interface TimeTravelTutorProps {
  clockPrediction: string
  beforePrediction: string
  onExplained?: () => void
}

const paragraphStyle = { marginBottom: '1rem', fontSize: '0.95rem', color: '#333', lineHeight: '1.6' } as const
const n = (x: number) => String(Number(x.toFixed(2)))
// Years written in plain words. The module's years carry floating-point dust (a 1-year exit can be 0.9999999999999991), so round first or 1 year would read as 365 days.
const yrs = (x: number) => friendlyDuration(Number(x.toFixed(6)))
const days = (x: number) => String(Math.round(x))

export function TimeTravelTutor({ clockPrediction, beforePrediction, onExplained }: TimeTravelTutorProps) {
  const [tutorStep, setTutorStep] = useState<TutorStep>('observe')
  const [responseInput, setResponseInput] = useState('')

  const handleContinue = () => {
    if (responseInput.trim() === '') return
    if (tutorStep === 'observe') setTutorStep('compare')
    else if (tutorStep === 'compare') setTutorStep('conceptual')
    else if (tutorStep === 'conceptual') {
      setTutorStep('explained')
      onExplained?.()
    }
    setResponseInput('')
  }
  const isResponseEmpty = responseInput.trim() === ''

  const s = exampleSteps()
  const two = pictureTwo()
  const t = tutorFigures()
  const clockGuessLabel = CLOCK_CHOICES.find((x) => x.id === clockPrediction)!.label
  const clockAnswerLabel = CLOCK_CHOICES.find((x) => x.id === predictionOneAnswerId())!.label
  const beforeGuessLabel = BEFORE_CHOICES.find((x) => x.id === beforePrediction)!.label
  const beforeAnswerLabel = BEFORE_CHOICES.find((x) => x.id === predictionTwoAnswerId())!.label
  const clockResult = clockGuessResult(clockPrediction)
  const beforeResult = beforeGuessResult(beforePrediction)

  return (
    <div style={{ marginTop: '2rem', padding: '1.5rem', border: '1px solid #d9e8f5', borderRadius: '8px', backgroundColor: '#f0f7ff' }}>
      <h2 style={{ marginTop: 0, marginBottom: '1rem', fontSize: '1.125rem', color: '#0066cc' }}>Let's reflect on what you observed</h2>
      {(tutorStep === 'observe' || tutorStep === 'compare' || tutorStep === 'conceptual') && (
        <div>
          {tutorStep === 'observe' && (
            <>
              <p style={paragraphStyle}>
                Look at <strong>Picture 1</strong>, panel B: the two cyan bars and the dashed gap between their ends. Then look at <strong>Picture 2</strong>: the pink tunnel link and the route the traveller takes outside it. Where does that route end, compared with where it
                began? Last, look at <strong>Picture 3</strong>: which bar is longer, the cyan one or the yellow one?
              </p>
              <p style={paragraphStyle}>Tell me what you see, in your own words. There is no wrong answer here.</p>
            </>
          )}
          {tutorStep === 'compare' && (
            <>
              <p style={paragraphStyle}>Now bring your guesses back. They are drawn in white on the real pictures, so you can see each guess next to the real result.</p>
              <ul style={{ ...paragraphStyle, paddingLeft: '1.25rem' }}>
                <li>
                  <strong>The white line and the box “YOUR GUESS (Prediction 1)” in Picture 1</strong> is your guess for B’s clock. How does it sit beside the end of B’s cyan bar?
                </li>
                <li>
                  <strong>The white marker and the box “YOUR GUESS (Prediction 2)” in Picture 2</strong> is your guess about getting back before you left. It is only a marker, because yes or no has no size. Where does it sit compared with the traveller’s route?
                </li>
              </ul>
              <p style={paragraphStyle}>
                Then check <strong>Table 1</strong>, the rows “B’s clock after the trip” and “Time gained, at best”. Did anything match what you expected, or surprise you? I won’t say yet whether you were right, because I want to hear how you read it first.
              </p>
            </>
          )}
          {tutorStep === 'conceptual' && (
            <>
              <p style={paragraphStyle}>
                One last question before the explanation. Suppose mouth B moved much more slowly, at only <strong>{t.slowSpeed} c</strong>, for the same {t.tripYears}-year trip, and the mouths ended <strong>1 light-year</strong> apart as before. Would a path back in
                time still exist? And what if they ended only <strong>1 light-day</strong> apart? Tell me why you think so.
              </p>
              <p style={paragraphStyle}>Make a guess, even if you are not sure.</p>
            </>
          )}
          <textarea
            value={responseInput}
            onChange={(e) => setResponseInput(e.target.value)}
            placeholder="Type your thoughts here..."
            style={{ width: '100%', minHeight: '100px', padding: '0.75rem', fontSize: '0.875rem', border: '1px solid #ccc', borderRadius: '4px', fontFamily: 'inherit', resize: 'vertical' }}
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
            <strong>Your predictions.</strong> For Prediction 1 you answered <em>{clockGuessLabel}</em>. Mouth B’s clock counted <em>{clockAnswerLabel}</em>, so {clockResult === 'matched' ? 'your prediction matched.' : 'your prediction did not match.'} For Prediction 2 you
            answered <em>{beforeGuessLabel}</em>. In this model the answer is <em>{beforeAnswerLabel}</em>, so {beforeResult === 'matched' ? 'your prediction matched.' : 'your prediction did not match.'} Both come from the page’s own calculation. No wormhole has been seen, so
            nobody has done this.
          </p>
          <p style={paragraphStyle}>
            <strong>1. Why B’s clock falls behind.</strong> A clock that moves fast counts less time than one that stays put. This is the same arithmetic as the twin paradox, and the same kind of difference that real clocks have shown on aircraft and on GPS satellites. At {s.speed} c the
            factor is {n(s.factor)}, so over {s.tripYears} years on A’s clock, B’s clock counts {s.tripYears} × {n(s.factor)} = {n(s.movingYears)} years. B is {n(s.offsetYears)} years behind A. A faster B counts fewer years still.
          </p>
          <p style={paragraphStyle}>
            <strong>2. Why the tunnel turns that gap into a path back in time.</strong> The tunnel joins moments at which the two mouths’ own clocks show the same reading. Think of a border between two time zones. Cross it, and the clock on the wall jumps back an hour. Nobody
            has gone back in time; only the label changed. The tunnel is like a border, but the jump is {n(s.offsetYears)} years, and it is not a label. The clocks are real clocks, one at each mouth, and they really differ by {n(s.offsetYears)} years. So a traveller who steps into B when A’s clock
            reads {yrs(two.entry.time)} comes out of A when A’s clock reads {yrs(two.exit.time)}, {yrs(two.entry.time - two.exit.time)} earlier.
          </p>
          <p style={paragraphStyle}>
            <strong>3. Why the path closes only when the gap is longer than the light-travel time.</strong> After coming out of A, the traveller still has to get back to B, outside the tunnel. Even at the speed of light, which nothing can beat, that takes {n(s.lightTravelYears)} year for
            mouths {n(s.separationLy)} light-year apart. So the traveller arrives at B when A’s clock reads {yrs(two.arrival.time)}, which is {yrs(s.timeGainedYears)} before the {yrs(two.entry.time)} when they left. A path
            back exists when the gap ({n(s.offsetYears)} years) is longer than the light-travel time ({n(s.lightTravelYears)} year).
          </p>
          <p style={paragraphStyle}>
            <strong>4. About the question you were asked.</strong> At {t.slowSpeed} c the gap is only {yrs(t.slowOffsetYears)}. With the mouths 1 light-year apart, the traveller arrives about {days(t.slowLateDaysAtOneLightYear)} days <em>after</em> leaving, so there is no path back. With
            the mouths only 1 light-day apart, the same gap is longer than the light-travel time, so a path back does exist, and it gains about {days(t.slowGainedAtOneLightDayDays)} days. A path back needs both things at once: a big enough gap, and mouths close enough together. For 1 light-year
            apart the mouth must move faster than {String(Number(t.smallestSpeedAtOneLightYear.toFixed(3)))} c.
          </p>
          <p style={paragraphStyle}>
            <strong>5. Why it could not go back before the machine existed.</strong> In this model the two clocks agree at the start, and the gap builds up only while B is travelling. Before the trip there is no gap to use, so the tunnel cannot lead to a moment earlier than that. The earliest
            moment a traveller could reach is set by when the gap first grew longer than the light-travel time. (This is this page’s own reading of the model; it was not checked at a source.)
          </p>
          <p style={paragraphStyle}>
            <strong>6. The puzzle the model does not answer.</strong> Suppose a traveller used such a path to go back and stop themselves from leaving. Then they would not have left, so they could not have gone back to stop themselves. This is called the grandfather paradox. This page’s model does
            not answer it, and no one has settled it.
          </p>
          <p style={paragraphStyle}>
            <strong>7. What “chronology protection” is, and is not.</strong> In 1992 Stephen Hawking suggested that the energy building up as a path back formed would stop it forming. This is called the chronology protection conjecture. A conjecture is an idea that has been argued for but not
            proved. Papers from 2024 and 2025 found that it holds in the two particular black-hole models they studied, and a 2021 survey says that no general mechanism of protection is currently known. So it is neither proved nor disproved.
          </p>
          <p style={{ ...paragraphStyle, marginBottom: 0 }}>
            <strong>8. What is not settled, and how sure we are.</strong> Travel to the future has been measured with real clocks. Travel to the past exists in the mathematics of some models and has never been seen. Making the tunnel needs negative energy (the experiment before this one), and no
            wormhole has been seen. I am not saying that travel to the past is possible, and I am not saying that it is impossible. The numbers here are exact for the model, but the model is this page’s reading of summaries of the 1988 paper and its abstract, and no paper was read in full.
          </p>
        </div>
      )}
    </div>
  )
}
