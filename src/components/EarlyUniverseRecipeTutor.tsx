import { useState } from 'react'
import { ATOM_ANSWER_CHOICES, HELIUM_TO_HYDROGEN_WEIGHT, SHARE_ANSWER_CHOICES, atomGuessResult, predictionOneAnswerId, predictionTwoAnswerId, shareGuessResult, tutorFigures } from '../physics/earlyUniverseRecipe'

// Evidence and Imagination, Experiment 6: Part 4, the tutor. The wording is Claude's DRAFT of 2026-11-01, for the owner's approval (CLAUDE.md §28.1). Observe, compare with the predictions, one
// conceptual question, then the explanation. Every number comes from the physics module (earlyUniverseRecipe.ts), never typed in by hand (CLAUDE.md §9). The predictions are marked only in the explanation
// (CLAUDE.md §12, §13). The tutor does not claim more than the sources read show, says plainly that the page's own calculation uses a temperature it chose, and says which statements are not checked at a source.
// Unsourced here: the rule "neutrons per proton = e to the power of minus (the mass difference divided by the temperature)" (stated as this page's rule, from memory); the shelf comparison and the bucket comparison;
// the standard account of why helium could only be built after about three minutes (deuterium broken apart by the hot universe's light until it cooled); the assumption that every neutron left ends up in helium-4
// with no heavier elements. From a source read: "about 1 MeV" and "about 1 second" (Berkeley Lab, Silk's page), the sentence that the weak interaction rate became slower than the expansion rate (the same page),
// "after about three minutes" (the same page), the lithium gap "well above" across the 2026 review's scanned range and the 2013 paper's "cannot alleviate" (read in the papers' text). The proposed explanations for lithium
// were seen in search summaries only; none was read.

type TutorStep = 'observe' | 'compare' | 'conceptual' | 'explained'

interface EarlyUniverseRecipeTutorProps {
  shareGuess: string
  atomGuess: string
  onExplained?: () => void
}

const paragraphStyle = { marginBottom: '1rem', fontSize: '0.95rem', color: '#333', lineHeight: '1.6' } as const
const n1 = (x: number) => x.toFixed(1)
const n2 = (x: number) => x.toFixed(2)
const n3 = (x: number) => x.toFixed(3)
const n4 = (x: number) => x.toFixed(4)

export function EarlyUniverseRecipeTutor({ shareGuess, atomGuess, onExplained }: EarlyUniverseRecipeTutorProps) {
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
  const shareGuessLabel = SHARE_ANSWER_CHOICES.find((x) => x.id === shareGuess)!.label
  const shareAnswerLabel = SHARE_ANSWER_CHOICES.find((x) => x.id === predictionOneAnswerId())!.label
  const atomGuessLabel = ATOM_ANSWER_CHOICES.find((x) => x.id === atomGuess)!.label
  const atomAnswerLabel = ATOM_ANSWER_CHOICES.find((x) => x.id === predictionTwoAnswerId())!.label
  const shareResult = shareGuessResult(shareGuess)
  const atomResult = atomGuessResult(atomGuess)
  const c = t.check
  const r = t.real
  const s = t.sample
  const heliumWeightUnits = t.atomsFromMeasured * HELIUM_TO_HYDROGEN_WEIGHT
  const shareFromAtoms = (heliumWeightUnits / (100 + heliumWeightUnits)) * 100

  return (
    <div style={{ marginTop: '2rem', padding: '1.5rem', border: '1px solid #d9e8f5', borderRadius: '8px', backgroundColor: '#f0f7ff' }}>
      <h2 style={{ marginTop: 0, marginBottom: '1rem', fontSize: '1.125rem', color: '#0066cc' }}>Let's reflect on what you observed</h2>
      {(tutorStep === 'observe' || tutorStep === 'compare' || tutorStep === 'conceptual') && (
        <div>
          {tutorStep === 'observe' && (
            <>
              <p style={paragraphStyle}>
                Look at <strong>Picture 1</strong>: the dots in Part A and in Part B. Then look at <strong>Picture 2</strong>: the sorted blocks of helium and hydrogen, and the rows on the two rulers. Last, look at the bars in <strong>Picture 3</strong> for helium, deuterium and lithium-7. What do you
                notice about how many neutrons there are compared with protons, about how the rows in Picture 2 sit beside one another, and about which bars in Picture 3 meet and which do not?
              </p>
              <p style={paragraphStyle}>Tell me what you see, in your own words. There is no wrong answer here.</p>
            </>
          )}
          {tutorStep === 'compare' && (
            <>
              <p style={paragraphStyle}>Now bring your guesses back. They are drawn in white on the real pictures, so you can see each guess next to the real result.</p>
              <ul style={{ ...paragraphStyle, paddingLeft: '1.25rem' }}>
                <li>
                  <strong>The white diamond and the box “YOUR GUESS” in Picture 2, Part B</strong> is your guess for the share of the weight that was helium. How does it sit beside the green dots, the cyan dot and the dashed cyan one?
                </li>
                <li>
                  <strong>The white diamond in Picture 2, Part C</strong> is your guess for the helium atoms for every 100 hydrogen atoms. How does it sit beside the green and cyan dots on the log ruler?
                </li>
              </ul>
              <p style={paragraphStyle}>
                Then check <strong>Table 1</strong>, the first row and the last row. Did anything match what you expected, or surprise you? I won’t say yet whether you were right, because I would like you to look first.
              </p>
            </>
          )}
          {tutorStep === 'conceptual' && (
            <>
              <p style={paragraphStyle}>
                One last question before the explanation. Suppose the neutrons had waited <strong>{t.longWaitS} seconds</strong> before they were counted, instead of {t.waitS} seconds. Would there then be <strong>more</strong> helium, <strong>less</strong>, or <strong>the same</strong>? Tell me why you think so.
              </p>
              <p style={paragraphStyle}>Make a guess, even if you are not sure. The pink dots in Drawing A, if you have tried a longer wait there, may help.</p>
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
            <strong>Your predictions.</strong> For Prediction 1 you answered <em>{shareGuessLabel.toLowerCase()}</em> helium by mass. The LBT measurement is {n2(t.lbtPercent)} ± {n2(t.lbtGiveOrTakePoints)} percent and the published calculation is {n2(t.theoryPercent)} percent, nearest to <em>{shareAnswerLabel.toLowerCase()}</em>, so{' '}
            {shareResult === 'matched' ? 'your prediction matched.' : 'your prediction did not match.'} For Prediction 2 you answered <em>{atomGuessLabel.toLowerCase()}</em> helium atoms for every 100 hydrogen atoms. Counting from the measured share, it is {n2(t.atomsFromMeasured)}, nearest to <em>{atomAnswerLabel.toLowerCase()}</em>, so{' '}
            {atomResult === 'matched' ? 'your prediction matched.' : 'your prediction did not match.'} The first number is a measurement and the second is worked out from it by this page.
          </p>
          <p style={paragraphStyle}>
            <strong>1. The recipe.</strong> About a quarter of the weight of the early universe’s ordinary matter was helium ({n2(t.lbtPercent)} percent, measured) and about three-quarters was hydrogen ({n2(t.hydrogenPercentLbt)} percent), with only traces of deuterium and lithium. Counting atoms instead of weighing them gives a very different-sounding
            number, {n2(t.atomsFromMeasured)} helium atoms for every 100 hydrogen atoms, because a helium atom weighs {HELIUM_TO_HYDROGEN_WEIGHT} times as much. You can check it: {n2(t.atomsFromMeasured)} helium atoms weigh {n2(t.atomsFromMeasured)} × {HELIUM_TO_HYDROGEN_WEIGHT} = {n1(heliumWeightUnits)} units, against 100 units for the hydrogen, and {n1(heliumWeightUnits)} ÷ (100 + {n1(heliumWeightUnits)}) ={' '}
            {n1(shareFromAtoms)} percent of the weight. So “a quarter helium” and “fewer than one atom in ten” are the same early universe, described by weight and by count.
          </p>
          <p style={paragraphStyle}>
            <strong>2. Why there were so few neutrons to begin with.</strong> A neutron is a little heavier than a proton, by {n2(t.massDifferenceMeV)} MeV. In the first second the universe was so hot that collisions kept turning neutrons into protons and protons into neutrons. Think of a ball that can sit on a low shelf or a high shelf: shaken hard, it lands on either, and when the shaking stops it stays on the
            low one. As the universe cooled, the lower “shelf”, the proton, was favoured. The Berkeley Lab page says that when the temperature fell below about 1 MeV, about 1 second after the start, these changes became slower than the expansion of the universe and stopped keeping up. This page uses a simple rule for how many neutrons that leaves: the number of neutrons for every proton is e to the power of minus (the mass difference ÷ the temperature),
            with the temperature written in MeV. With the page’s chosen temperature of {n2(t.freezeOutKtMeV)} MeV that is {n2(t.massDifferenceMeV)} ÷ {n2(t.freezeOutKtMeV)} = {n2(t.massOverTemperature)}, and e to the power of minus {n2(t.massOverTemperature)} is {n3(r.freezeOutNeutronsPerProton)}: 1 neutron for every {n1(1 / r.freezeOutNeutronsPerProton)} protons. That is the {s.neutronsAtFreezeOut} neutrons in
            the {s.total} dots of Picture 1, Part A. Halving the mass difference in Part 2 raises that share and doubling it lowers it, as Drawing A showed. The rule is the page’s own, stated from memory, and the temperature was chosen: the page did not take either from a source.
          </p>
          <p style={paragraphStyle}>
            <strong>3. Why the neutrons wait, and why waiting costs neutrons.</strong> After that, the neutrons were not safe. On their own they last {n1(t.lifetimeS)} seconds on average, and the Berkeley Lab page says that only after about three minutes did neutrons and protons join to form deuterium and then helium. A standard account, which this page did not check at a source, says the hot universe’s light kept knocking deuterium apart until it
            cooled enough for deuterium to survive, and only then could helium be built. Until then the neutrons kept decaying. Over the page’s {t.decaySeconds} seconds, {Math.round(r.neutronsLeftFraction * 100)} percent of them were left: {n4(r.freezeOutNeutronsPerProton)} × {n4(r.neutronsLeftFraction)} = {n4(r.neutronsPerProton)}, which is 1 neutron for every {n1(r.neutronsPerProtonAsOneIn)} protons, the {s.neutronsAfterWait} neutrons of Part B. Think of a bucket with a slow leak:
            the longer you wait before using it, the less water is left. That is why a longer wait gives less helium.
          </p>
          <p style={paragraphStyle}>
            <strong>4. From neutrons to helium.</strong> The page then makes a simple assumption: every neutron that is left ends up inside a helium-4 nucleus, with two protons, and no heavier element is made. {s.neutronsAfterWait} neutrons in {s.total} particles pair with {s.neutronsAfterWait} protons into {s.heliumNuclei} helium nuclei of {HELIUM_TO_HYDROGEN_WEIGHT} particles each, which is {s.heliumDots} of the {s.total} particles, or{' '}
            {Math.round((s.heliumDots / s.total) * 100)} percent of the weight (the exact figure, {n1(r.heliumMassShare * 100)} percent, is the 2 × {n3(r.neutronsPerProton)} ÷ (1 + {n3(r.neutronsPerProton)}) of Table 2). The real calculation follows a whole chain of nuclear reactions and does not simply assume this. This page does not, so its helium share is a teaching estimate.
          </p>
          <p style={paragraphStyle}>
            <strong>5. What matched, and what did not.</strong> For helium, the LBT measurement and the published calculation agree within their give-or-takes ({n2(c.helium.difference)} apart, against {n2(c.helium.combinedGiveOrTake)} together). The EMPRESS value is lower, and its range does not reach the calculation’s; this page does not choose between the two measurements. For deuterium the calculation and the measurement agree ({n3(c.deuterium.difference)} apart, against{' '}
            {n3(c.deuterium.combinedGiveOrTake)}). This page’s own helium share, {n1(c.pageHelium.value)} percent, is {n2(c.pageHelium.difference)} points below the measured one, which looks close but is not a test: with the temperature at {n2(t.sensitivity[0].kt)} MeV it would be {n1(t.sensitivity[0].heliumPercent)} percent, and at {n2(t.sensitivity[2].kt)} MeV, {n1(t.sensitivity[2].heliumPercent)} percent. The published calculation is a full one and not a shortcut like this page’s, which is why it, and not this page’s number, is the one set beside the measurements.
          </p>
          <p style={paragraphStyle}>
            <strong>6. The lithium gap.</strong> For lithium-7 the published calculation is {n1(t.lithiumRatio)} times the measurement, and the two ranges are far apart: the gap is {n1(t.lithiumGapTimes)} times their give-or-takes added together. The 2026 review that this page read says the calculated value lies well above the observed one across the whole range of inputs it scanned, and an earlier paper, from 2013, found that adjusting the inputs it studied cannot close the
            gap. Several explanations have been proposed, such as lithium being destroyed in old stars or changes to the nuclear physics, but this page saw them only in search summaries and has not read them, so it does not say which, if any, is right. That is why lithium is “Open”.
          </p>
          <p style={paragraphStyle}>
            <strong>7. About the question you were asked.</strong> With a wait of {t.longWaitS} seconds instead of {t.waitS}, there would be <strong>less</strong> helium. Only {Math.round(t.longNeutronsLeftFraction * 100)} percent of the neutrons would be left, and the page’s helium share would fall from {n1(r.heliumMassShare * 100)} to {n1(t.longHeliumPercent)} percent (at {t.middleWaitS} seconds, {n1(t.middleHeliumPercent)} percent). Neutrons on their own keep decaying, so
            waiting longer leaves fewer neutrons to make helium. That is the bucket with the leak.
          </p>
          <p style={{ ...paragraphStyle, marginBottom: 0 }}>
            <strong>8. What is settled, and what this page does not show.</strong> The light elements’ amounts are long-standing results, and for helium (the LBT value) and deuterium the calculations and measurements agree. This page read a 2026 review (parts of it only through a summary), parts of the LBT paper, NIST’s page on the neutron’s lifetime and two Berkeley Lab pages, and it did not read the Particle Data Group’s review. Its own calculation
            leaves out the chain of nuclear reactions, how the amounts depend on the density of ordinary matter, and the number of kinds of neutrino. So it shows the idea and the size of the effect, not the papers’ full analysis, and it does not explain the lithium gap.
          </p>
        </div>
      )}
    </div>
  )
}
