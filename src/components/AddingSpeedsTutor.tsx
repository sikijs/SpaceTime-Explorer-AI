import { useState } from 'react'
import {
  FLASH_ANSWER_CHOICES,
  SPEED_ANSWER_CHOICES,
  flashGuessResult,
  pionWorked,
  predictionOneAnswerId,
  predictionTwoAnswerId,
  speedGuessResult,
  tutorFigures,
} from '../physics/addingSpeeds'

// Evidence and Imagination, Experiment 3: Part 4, the tutor. The wording is Claude's DRAFT of 2026-10-30, for the owner's approval (CLAUDE.md §28.1). Observe, compare with the predictions, one
// conceptual question, then the explanation. Every number comes from the physics module (addingSpeeds.ts), never typed in by hand (CLAUDE.md §9). The predictions are marked only in the
// explanation (CLAUDE.md §12, §13). The tutor does not say that a speed limit "cannot be broken" beyond what the two tests show, and gives no verdict on theories beyond special relativity.
// Unsourced here: the daily-life comparisons and the reading of the 1964 paper's remark about the material the gamma rays passed through (from a machine-read scan, to be checked).

type TutorStep = 'observe' | 'compare' | 'conceptual' | 'explained'

interface AddingSpeedsTutorProps {
  shipPrediction: string
  flashPrediction: string
  onExplained?: () => void
}

const paragraphStyle = { marginBottom: '1rem', fontSize: '0.95rem', color: '#333', lineHeight: '1.6' } as const
// A speed written to as many decimals as it needs (up to five), without trailing zeros.
const fmt = (x: number) => {
  const t = x.toFixed(5).replace(/0+$/, '')
  return t.endsWith('.') ? t + '0' : t
}
const n3 = (x: number) => x.toFixed(3)
const num = (x: number) => String(Number(x.toFixed(3)))
const spaced = (x: number) => String(Math.round(x)).replace(/\B(?=(\d{3})+(?!\d))/g, ' ')

export function AddingSpeedsTutor({ shipPrediction, flashPrediction, onExplained }: AddingSpeedsTutorProps) {
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

  const t = tutorFigures()
  const w = pionWorked()
  const shipGuessLabel = SPEED_ANSWER_CHOICES.find((x) => x.id === shipPrediction)!.label
  const shipAnswerLabel = SPEED_ANSWER_CHOICES.find((x) => x.id === predictionOneAnswerId())!.label
  const flashGuessLabel = FLASH_ANSWER_CHOICES.find((x) => x.id === flashPrediction)!.label
  const flashAnswerLabel = FLASH_ANSWER_CHOICES.find((x) => x.id === predictionTwoAnswerId())!.label
  const shipResult = speedGuessResult(shipPrediction)
  const flashResult = flashGuessResult(flashPrediction)

  return (
    <div style={{ marginTop: '2rem', padding: '1.5rem', border: '1px solid #d9e8f5', borderRadius: '8px', backgroundColor: '#f0f7ff' }}>
      <h2 style={{ marginTop: 0, marginBottom: '1rem', fontSize: '1.125rem', color: '#0066cc' }}>Let's reflect on what you observed</h2>
      {(tutorStep === 'observe' || tutorStep === 'compare' || tutorStep === 'conceptual') && (
        <div>
          {tutorStep === 'observe' && (
            <>
              <p style={paragraphStyle}>
                Look at <strong>Picture 1</strong>, panel B: the two cyan bars and the dashed gap between their ends. Then look at <strong>Picture 2</strong>: the two cyan bars and the green box. Last, look at <strong>Picture 3</strong>, panel A: where does the green dot sit,
                compared with the long cyan bar and the short one?
              </p>
              <p style={paragraphStyle}>Tell me what you see, in your own words. There is no wrong answer here.</p>
            </>
          )}
          {tutorStep === 'compare' && (
            <>
              <p style={paragraphStyle}>Now bring your guesses back. They are drawn in white on the real pictures, so you can see each guess next to the real result.</p>
              <ul style={{ ...paragraphStyle, paddingLeft: '1.25rem' }}>
                <li>
                  <strong>The white line and the box “YOUR GUESS (Prediction 1)” in Picture 1, panel B</strong> is your guess for the speed the lab measures for the probe. How does it sit beside the end of the lower cyan bar?
                </li>
                <li>
                  <strong>The white line and the box “YOUR GUESS (Prediction 2)” in Picture 3, panel A</strong> is your guess for the speed of the gamma ray. How does it sit beside the green dot? If you chose “Less than c”, the white line is only a marker.
                </li>
              </ul>
              <p style={paragraphStyle}>
                Then check <strong>Table 1</strong>, the rows “What the lab measures for the probe” and “The gamma ray’s speed measured in 1964”. Did anything match what you expected, or surprise you? I won’t say yet whether you were right, because I want to hear how you read it first.
              </p>
            </>
          )}
          {tutorStep === 'conceptual' && (
            <>
              <p style={paragraphStyle}>
                One last question before the explanation. Suppose the spaceship moves at <strong>{t.fastest.ship} c</strong> and fires a probe at <strong>{t.fastest.probe} c</strong>, relative to the spaceship. Would the lab see the probe at about {fmt(t.fastest.everyday)} c, at
                exactly c, or at a speed a little below c? Tell me why you think so.
              </p>
              <p style={paragraphStyle}>Make a guess, even if you are not sure. You can try these two numbers in “Now try it yourself” if you like.</p>
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
            <strong>Your predictions.</strong> For Prediction 1 you answered <em>{shipGuessLabel}</em>. The rule gives <em>{shipAnswerLabel}</em>, so {shipResult === 'matched' ? 'your prediction matched.' : 'your prediction did not match.'} For Prediction 2 you answered <em>{flashGuessLabel}</em>. The
            1964 measurement is <em>{flashAnswerLabel.toLowerCase()}</em> (to within its give-or-take), so {flashResult === 'matched' ? 'your prediction matched.' : 'your prediction did not match.'} The first number comes from the rule. The second is a real measurement, an old one.
          </p>
          <p style={paragraphStyle}>
            <strong>1. Why the everyday sum works so well on a train.</strong> The rule is (a + b) ÷ (1 + a × b). For the walker and the train, a × b is only {(t.trainExcess * 1e16).toFixed(1)} × 10⁻¹⁶, so the bottom is 1.00000000000000022. Dividing 21 metres per second by that changes it by about {(t.trainChangeMPerS * 1e15).toFixed(1)}
            × 10⁻¹⁵ metres per second, far less than anything anyone could measure. So the everyday sum is not wrong for a train. It is the rule with a correction too small to see. Think of measuring a table with a ruler: an error of a thousandth of a millimetre would not matter.
            The correction only becomes visible when the speeds are a large fraction of c, because the bottom of the rule, 1 + a × b, grows with both speeds.
          </p>
          <p style={paragraphStyle}>
            <strong>2. How the rule keeps the result below c.</strong> Take the spaceship at {t.fast.ship} c and the probe at {t.fast.probe} c. The top is {t.fast.ship} + {t.fast.probe} = {fmt(t.fast.top)} and the bottom is 1 + {t.fast.ship} × {t.fast.probe} = {fmt(t.fast.bottom)}. The bottom is bigger, so
            the result is {fmt(t.fast.top)} ÷ {fmt(t.fast.bottom)} = {fmt(t.fast.rule)} c, a little below c. This is not an accident. The bottom minus the top is 1 + a × b − (a + b), and that equals (1 − a) × (1 − b). Here it is {n3(1 - t.fast.ship)} × {n3(1 - t.fast.probe)} = {fmt(t.fastOneMinusAOneMinusB)}, and indeed{' '}
            {fmt(t.fast.bottom)} − {fmt(t.fast.top)} = {fmt(t.fastBottomMinusTop)}. When both a and b are below 1 (below c), both brackets are positive, so the bottom is always bigger than the top and the result is always below 1, that is, below c. For the biggest pair on this page, {t.fastest.ship} c and{' '}
            {t.fastest.probe} c, the result is {fmt(t.fastest.rule)} c, only {fmt(t.fastestBelowC)} c below c.
          </p>
          <p style={paragraphStyle}>
            <strong>3. Why a flash of light comes out at c.</strong> If the probe is light, b = 1, the top is a + 1 and the bottom is 1 + a × 1 = 1 + a. These are the same number, so the result is 1, that is c, whatever a is. This is the rule being consistent with a fact that the first chapter began
            from (Experiment 5): light is measured at the same speed by everyone. This page does not prove that fact. It shows that the rule agrees with it, and the 1964 test is a measurement that checks the two together.
          </p>
          <p style={paragraphStyle}>
            <strong>4. What Fizeau’s water tells us.</strong> The everyday sum says that flowing water should carry all of its own speed to the light going through it. In 1851 Fizeau measured that it carries only a fraction. For water, with a refractive index of {num(t.water.n)} (Michelson and Morley used its square, 1.78), the rule gives the
            fraction {n3(t.water.ruleShare)}: the light in still water goes at 1 ÷ {num(t.water.n)} = {n3(t.water.stillWaterSpeed)} c, and the rule adds {n3(t.water.ruleShare)} of the water’s speed to that. In 1886 Michelson and Morley repeated the experiment with longer tubes and measured the fraction as{' '}
            {n3(t.water.measured)}, with a possible error of ±{num(t.water.measuredGiveOrTake)}. The rule’s {n3(t.water.ruleShare)} lies inside that range, and the everyday sum’s 1 does not, so the measurement sides with the rule. Von Laue showed in 1907 that the rule gives this fraction, after the rule had been
            worked out. Their “possible error” is their own estimate, and I read their paper only as a typed copy.
          </p>
          <p style={paragraphStyle}>
            <strong>5. What the 1964 test adds.</strong> The pions were moving at {w.a} c. If the gamma ray had been given that speed on top of its own, as the everyday sum says, it would have gone at about {spaced(w.everydayKmPerS)} kilometres per second. It was measured at {spaced(w.measuredKmPerS)} kilometres per second, with a give-or-take of
            {' '}{spaced(w.giveOrTakeKmPerS)}, and light’s speed in the paper is {spaced(w.lightKmPerS)}. The measured speed is {spaced(w.differenceFromLightKmPerS)} kilometres per second from c, less than the give-or-take, so it agrees with c. A source that was almost as fast as its own light did not give the light a head start. The authors also discuss whether the
            material the gamma rays passed through could have disturbed the result, and argue it could not here (from a machine-read scan, to be checked). One old test never settles everything, which is why this page also uses Fizeau’s.
          </p>
          <p style={paragraphStyle}>
            <strong>6. About the question you were asked.</strong> The everyday sum would give {fmt(t.fastest.everyday)} c, almost twice c. The rule gives {fmt(t.fastest.rule)} c, a little below c, by {fmt(t.fastestBelowC)} c. The two tests above are the evidence that nature follows the rule, not the everyday sum, in the cases that were measured.
          </p>
          <p style={{ ...paragraphStyle, marginBottom: 0 }}>
            <strong>7. What is settled, and what the tests do not show.</strong> The rule is part of special relativity, whose other results, like moving clocks counting less time, were tested in the earlier chapters. These two tests are old, they cover a flash of light and a slow stream of water, and the page read them through a Wikipedia account and
            a machine-read scan. They do not cover speeds that are not along one line. I am not saying more than the tests show. They show that adding speeds follows the rule in these two cases. By themselves they do not say anything about other ways of trying to go faster than light.
          </p>
        </div>
      )}
    </div>
  )
}
