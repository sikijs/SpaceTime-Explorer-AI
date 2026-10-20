import { useState } from 'react'
import {
  ageShareRange,
  countRange,
  LYMAN_ALPHA_NM,
  monthsOfFirstFourYears,
  MONTHS_IN_FOUR_YEARS,
  MOM_Z14_PAPER_AGE_YEARS,
  MOM_Z14_REDSHIFT,
  NUMBER_DENSITY_EXCESS,
  paperAgeGapPercent,
  runEarliestGalaxies,
} from '../physics/earliestGalaxies'
import type { AgeShareRange, CountRange } from '../physics/earliestGalaxies'

type TutorStep = 'observe' | 'compare' | 'conceptual' | 'explained'

interface EarliestGalaxiesTutorProps {
  redshift: number // the galaxy the learner is looking at with "Look at another galaxy"
  galaxyName: string // its name, or "the imaginary galaxy"
  isImaginary: boolean
  agePrediction: AgeShareRange
  countPrediction: CountRange
  onExplained?: () => void
}

const ageWords: Record<AgeShareRange, string> = {
  about1: 'about 1 percent (under 1.5 percent)',
  about2: 'about 2 percent (1.5 to 4 percent)',
  about10: 'about 10 percent (over 4 percent)',
}
const countWords: Record<CountRange, string> = {
  fewer: 'fewer than the models predicted',
  same: 'about the same as the models predicted',
  few: 'a few times more than the models predicted',
  hundred: 'about a hundred times more than the models predicted, or higher',
}

const paragraphStyle = { marginBottom: '1rem', fontSize: '0.95rem', color: '#333', lineHeight: '1.6' } as const

// The tutor of Frontier and Beyond Experiment 5. Draft wording for the owner's review (CLAUDE.md §28.1, §29), from the specification's "AI Tutor
// Behavior": observe, compare with the predictions, one conceptual question, then the explanation after the learner has responded. Every number
// comes from the physics module (earliestGalaxies.ts), never typed in by hand (CLAUDE.md §9), except the published statements' wording, which follows
// the Naidu et al. paper (arXiv:2505.11263), the ESA/Webb release of 28 January 2026, and the abstracts of Sun et al. (arXiv:2307.15305) and Dekel
// et al. (arXiv:2303.04827). The predictions are marked only in the explanation (the owner's choice for the group), never before it. The proposed
// explanations are named as possibilities, not findings.
export function EarliestGalaxiesTutor({ redshift, galaxyName, isImaginary, agePrediction, countPrediction, onExplained }: EarliestGalaxiesTutorProps) {
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

  // The learner's own galaxy, and MoM-z14, which the predictions and the survey are about.
  const mine = runEarliestGalaxies(redshift)
  const mom = runEarliestGalaxies(MOM_Z14_REDSHIFT)
  const actualAge = ageShareRange(MOM_Z14_REDSHIFT)
  const actualCount = countRange()
  const millions = (years: number) => Math.round(years / 1e6).toLocaleString('en-US')
  const f2 = (value: number) => value.toFixed(2)
  const billions = (years: number) => (years / 1e9).toFixed(2)
  const paperGap = paperAgeGapPercent()
  // A person's age, for the comparison with the share: the same share of a 4-year-old's 48 months.
  const monthsOf48 = monthsOfFirstFourYears(redshift)

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
          <p style={paragraphStyle}>
            {tutorStep === 'observe' &&
              'Look at Picture 2 and Picture 3. What do you notice about where the galaxy’s light left on the timeline in Picture 2, and about the survey’s estimate compared with the models’ in Picture 3?'}
            {tutorStep === 'compare' &&
              `You predicted that, when the light of a galaxy at a redshift of about 14.4 left it, ${ageWords[agePrediction]} of the universe’s present age had passed, and that the number of bright galaxies the survey implies would be ${countWords[countPrediction]}. Look at Pictures 2 and 3 again. Is there anything that surprises you? I will say how each prediction compared once you have thought about it.`}
            {tutorStep === 'conceptual' &&
              `The galaxy MoM-z14 is bright and compact, and its light left it only about ${millions(mom.ageAfterBigBangYears)} million years after the Big Bang. The survey behind it implies far more galaxies like it than the models used before Webb predicted. Which of these would you have to change to explain that: the age of the universe at that redshift, or the way stars form in the first galaxies? Why?`}
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
        <div>
          {/* The predictions are marked here, in the explanation, and nowhere earlier, so the learner reasons first (CLAUDE.md §12). */}
          <p style={paragraphStyle}>
            <strong>Your predictions.</strong> Now that you have thought about it, here is how each one compared with the result. You predicted
            that <em>{ageWords[agePrediction]}</em> of the universe’s present age had passed when the light of a galaxy at a redshift of about 14.4
            left it. For MoM-z14 (redshift {MOM_Z14_REDSHIFT}) the model gives {millions(mom.ageAfterBigBangYears)} million years, and{' '}
            {millions(mom.ageAfterBigBangYears)} ÷ {millions(mom.presentAgeYears)} = {f2(mom.shareOfPresentAge * 100)} percent:{' '}
            <em>{ageWords[actualAge]}</em>. {agePrediction === actualAge ? 'Your prediction matched.' : 'Your prediction did not match.'}
            {agePrediction === 'about10' &&
              ' It is an easy mistake to make: a few hundred million years sounds like a lot, but next to ' + (mom.presentAgeYears / 1e9).toFixed(1) + ' billion years it is a small slice.'}{' '}
            You predicted that the number of bright galaxies the survey implies would be <em>{countWords[countPrediction]}</em>. The survey’s
            best estimate is {NUMBER_DENSITY_EXCESS.best} times the models, with a range from {NUMBER_DENSITY_EXCESS.low} to{' '}
            {NUMBER_DENSITY_EXCESS.high} times, which is <em>{countWords[actualCount]}</em>.{' '}
            {countPrediction === actualCount ? 'Your prediction matched.' : 'Your prediction did not match.'}
            {countPrediction === 'few' &&
              ' “A few times more” is a reasonable guess. Other surveys, and other redshifts, may well give different numbers, and this experiment has not looked at them. This estimate is one survey’s, at redshifts of about 14 to 15.'}{' '}
            Either way, the parts below explain what lies behind the numbers.
          </p>

          <p style={paragraphStyle}>
            <strong>1. What the results show, in your own numbers.</strong> You looked at{' '}
            {isImaginary ? 'an imaginary galaxy (no galaxy is confirmed beyond a redshift of ' + MOM_Z14_REDSHIFT + ')' : galaxyName}, at a redshift of {redshift}.
            Its light was stretched by 1 + {redshift} = {f2(mine.stretchFactor)} times, so Lyman-alpha, which leaves at {LYMAN_ALPHA_NM} nm, arrives
            at {LYMAN_ALPHA_NM} × {f2(mine.stretchFactor)} = {mine.lymanAlphaObservedNm.toFixed(1)} nm. The universe was then 1 ÷ {f2(mine.stretchFactor)} ={' '}
            {f2(mine.relativeSizeThen * 100)} percent of its present size, and it was {millions(mine.ageAfterBigBangYears)} million years old, which is{' '}
            {millions(mine.ageAfterBigBangYears)} ÷ {millions(mine.presentAgeYears)} = {f2(mine.shareOfPresentAge * 100)} percent of its present age. The
            light has travelled for the rest of history: {millions(mine.presentAgeYears)} − {millions(mine.ageAfterBigBangYears)} ={' '}
            {millions(mine.lightTravelYears)} million years, or {billions(mine.lightTravelYears)} billion years. The galaxy was {billions(mine.distanceThenLightYears)}{' '}
            billion light-years away when the light left ({billions(mine.distanceTodayLightYears)} ÷ {f2(mine.stretchFactor)}), and it is{' '}
            {billions(mine.distanceTodayLightYears)} billion light-years away now.
          </p>

          <p style={paragraphStyle}>
            <strong>2. Why the share is so small, and why two distances are different.</strong> A share of {f2(mine.shareOfPresentAge * 100)} percent
            is like the first {monthsOf48.toFixed(1)} months of the life of a child who is now 4 years old ({MONTHS_IN_FOUR_YEARS} months): a very early moment in a long history.
            The light then spent almost all of that history on its way to us. It did not travel {billions(mine.distanceTodayLightYears)} billion
            light-years, though, only {billions(mine.lightTravelYears)} billion. The rest is the stretching of space itself (Cosmology Experiment 8): think of two
            dots on a balloon that is being blown up. While a message crawls from one dot to the other, the balloon keeps stretching, so the dots end up
            much further apart than the distance the message crawled. The galaxy’s light was stretched in the same way, and so was the distance to it.
          </p>

          <p style={paragraphStyle}>
            <strong>3. Why a spectrum matters.</strong> The redshift of a distant galaxy candidate is often first estimated from colour filters,
            which is like guessing a person’s height from a blurry photo. A spectrum is like using a tape measure. For MoM-z14 the paper reports two
            measurements from its spectrum that agree: the bright lines of its gas give a redshift of {MOM_Z14_REDSHIFT} (taken together at about 6 sigma:
            sigma is a way of saying how sure a detection is, as in Experiment 1 of this group. About 1 sigma is ordinary, and 5 sigma is the usual bar
            for calling something real), and the sharp Lyman-alpha edge gives 14.42. That is why it
            is counted as confirmed.
          </p>

          <p style={paragraphStyle}>
            <strong>4. What the puzzle is, and what it is not.</strong> The age of the universe at a given redshift, and the distances, come from how the
            universe expands (the model in Pictures 1 and 2). They do not depend on how galaxies form. What does depend on that is how many galaxies there are,
            and how bright: it depends on how fast gas turns into stars. Think of a recipe. The baking time is fixed, but how many loaves you get from a
            given amount of dough depends on the baker. The models used before Webb predicted how many bright galaxies there should be at this early time.
            The survey found {NUMBER_DENSITY_EXCESS.best} times as many, with a range from {NUMBER_DENSITY_EXCESS.low} to {NUMBER_DENSITY_EXCESS.high} times.
            ESA’s and NASA’s announcement of the galaxy, in January 2026, speaks of “a growing chasm between theory and observation related to the early
            Universe”. So the puzzle is about how galaxies form so early. It is not about the age or the distance shown in Picture 2.
          </p>

          <p style={paragraphStyle}>
            <strong>5. What has been proposed.</strong> These are possibilities. None is established, and this experiment does not model any of them.
            <em> Bursts.</em> One team’s computer simulations of galaxies at redshifts of 8 to 12 find that stars that form in short, strong bursts make a
            galaxy temporarily very bright, which can account for the observed number of bright galaxies without needing a different cosmology or an
            unusually high star-formation efficiency (Sun and colleagues, 2023).
            <em> Efficient star formation.</em> Another team proposes that, in the first very dense galaxies, gas can turn into stars before the winds and
            explosions of the first stars blow it away, so a larger share of the gas becomes stars (Dekel and colleagues, 2023, for redshifts of about 10
            and above). Other ideas that have been named include less dust dimming the light, and a different mix of star sizes. Whether any of these
            works at a redshift as high as 14 has not been checked here.
          </p>

          <p style={paragraphStyle}>
            <strong>6. Why the label says “Strong evidence” and “Open”.</strong> The galaxies are well measured: several teams, several galaxies, redshifts
            from spectra. That is the “Strong evidence”. What built them so quickly is not known, which is the “Open”. And the count of{' '}
            {NUMBER_DENSITY_EXCESS.best} comes from one survey, with a range from {NUMBER_DENSITY_EXCESS.low} to {NUMBER_DENSITY_EXCESS.high} times, so
            it is best read as “a lot more than predicted”, not as a precise number.
          </p>

          <p style={{ ...paragraphStyle, marginBottom: 0 }}>
            <strong>7. What was shown, and what was not.</strong> You saw how a redshift becomes a stretch, a time and a distance, and that MoM-z14’s
            light left about {millions(mom.ageAfterBigBangYears)} million years after the Big Bang (the paper says {millions(MOM_Z14_PAPER_AGE_YEARS)},
            and the model is {paperGap.toFixed(1)} percent above it, for a reason this experiment has not worked out). What this experiment did{' '}
            <strong>not</strong> do is model how galaxies form, so it cannot say which explanation, if any, is right, or whether the excess of bright
            galaxies is as large at every redshift.
          </p>
        </div>
      )}
    </div>
  )
}
