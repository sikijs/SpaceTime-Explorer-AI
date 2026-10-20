import { useState } from 'react'
import {
  CEILINGS,
  EV_FOR_ONE_OMEGA_H_SQUARED,
  HUBBLE_PARAMETER_H,
  OMEGA_MATTER,
  PREDICTION_TOTAL_MASS_EV,
  SMOOTHING_FACTOR,
  DESI_JULY_2026,
  heavyBeforeRelease,
  MASS_SQUARED_GAPS,
  oscillationFloor,
  roomRange,
  roomUnder,
  runNeutrinoMass,
} from '../physics/neutrinoMass'
import type { HeavyTiming, RoomRange } from '../physics/neutrinoMass'

type TutorStep = 'observe' | 'compare' | 'conceptual' | 'explained'

interface NeutrinoMassTutorProps {
  totalMassEv: number // the total the learner chose with "Try a different total mass"
  timingPrediction: HeavyTiming
  roomPrediction: RoomRange
  onExplained?: () => void
}

const timingWords: Record<HeavyTiming, string> = {
  before: 'before the microwave background was released',
  after: 'after the microwave background was released',
}
const roomWords: Record<RoomRange, string> = {
  plenty: 'plenty of room (the maximum is more than twice the minimum)',
  veryLittle: 'very little room (the maximum is at most 20 percent above the minimum)',
  none: 'no room (the maximum is below the minimum)',
}

// How a total is written everywhere on the page: DESI's limit as 0.0592, any other total with two decimals (0.10, 0.12, 0.30, 0.50, 0.06).
export const formatTotal = (value: number) => (value === DESI_JULY_2026.value ? String(value) : value.toFixed(2))

const paragraphStyle = { marginBottom: '1rem', fontSize: '0.95rem', color: '#333', lineHeight: '1.6' } as const

// The tutor of Frontier and Beyond Experiment 4. Draft wording for the owner's review (CLAUDE.md §28.1, §29), from the specification's "AI Tutor
// Behavior": observe, compare with the predictions, one conceptual question, then the explanation after the learner has responded. Every number comes
// from the physics module (neutrinoMass.ts), never typed in by hand (CLAUDE.md §9), except the published limits' wording, which follows the abstracts
// of arXiv:2503.14744 (March 2025), arXiv:2607.27410 (July 2026), arXiv:1807.06209 (Planck 2018) and arXiv:2406.14554 (Planck PR4), and DESI's March 2025
// guide. The predictions are marked only in the explanation (the owner's choice for the group), never before it. Possible explanations of the tension are
// named as possibilities, not findings.
export function NeutrinoMassTutor({ totalMassEv, timingPrediction, roomPrediction, onExplained }: NeutrinoMassTutorProps) {
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

  // The learner's own total, and the totals the predictions use (0.06 eV for Prediction 1, DESI's July 2026 ceiling for Prediction 2).
  const mine = runNeutrinoMass(totalMassEv)
  const predicted = runNeutrinoMass(PREDICTION_TOTAL_MASS_EV)
  const actualTiming = heavyBeforeRelease(PREDICTION_TOTAL_MASS_EV)
  const floorNormal = oscillationFloor('normal')
  const floorInverted = oscillationFloor('inverted')
  const julyRoom = roomUnder(DESI_JULY_2026.value, 'normal')
  const actualRoom = roomRange(DESI_JULY_2026.value, 'normal')
  const march2025 = CEILINGS.find((b) => b.name === 'DESI DR2 + CMB (March 2025)')!
  const evolving = CEILINGS.find((b) => b.name === 'DESI DR2 + CMB, evolving dark energy')!
  const planck = CEILINGS.find((b) => b.name === 'Planck 2018 + BAO')!
  const pr4 = CEILINGS.find((b) => b.name === 'DESI + CMB with Planck PR4')!
  const smoothingAtJuly = runNeutrinoMass(DESI_JULY_2026.value).smoothing
  const millions = (years: number) => Math.round(years / 1e6).toLocaleString('en-US')
  const sqrtSolar = Math.sqrt(MASS_SQUARED_GAPS.solar)
  const sqrtAtmos = Math.sqrt(MASS_SQUARED_GAPS.atmosphericNormal)

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
              'Look at Picture 1 and Picture 3. What do you notice about where the neutrinos turn heavy compared with the release of the microwave background in Picture 1, and about the floors and the ceilings in Picture 3?'}
            {tutorStep === 'compare' &&
              `You predicted that, for a total of ${formatTotal(PREDICTION_TOTAL_MASS_EV)} eV, the neutrinos would turn from light-like to matter-like ${timingWords[timingPrediction]}, and that between the oscillation floor and DESI’s 2026 ceiling there would be ${roomWords[roomPrediction]}. Look at Pictures 1 and 3 again. Is there anything that surprises you? I will say how each prediction compared once you have thought about it.`}
            {tutorStep === 'conceptual' &&
              'Two quite different methods, one watching neutrinos change kind in a laboratory and one watching the sky, have squeezed the same number from two sides until they nearly touch. What are the different things that could explain that?'}
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
            <strong>Your predictions.</strong> Now that you have thought about it, here is how each one compared with the result. You predicted that
            three equal neutrinos weighing {formatTotal(PREDICTION_TOTAL_MASS_EV)} eV in all would turn heavy <em>{timingWords[timingPrediction]}</em>. Each would weigh {formatTotal(PREDICTION_TOTAL_MASS_EV)} ÷ 3 = {predicted.massEachEv.toFixed(2)}
            eV, and they turn heavy at a redshift of {predicted.heavyRedshift.toFixed(1)}, about {millions(predicted.heavyTimeYears)} million years
            after the Big Bang, which is <em>{timingWords[actualTiming]}</em> (that was at {predicted.releaseYears.toLocaleString('en-US')} years).{' '}
            {timingPrediction === actualTiming ? 'Your prediction matched.' : 'Your prediction did not match.'} Even if one neutrino carried the whole {formatTotal(PREDICTION_TOTAL_MASS_EV)}
            eV, it would turn heavy at a redshift of {predicted.heavyRedshiftOneNeutrino.toFixed(0)}, still long after the release. You predicted{' '}
            <em>{roomWords[roomPrediction]}</em> between the oscillation floor and DESI’s 2026 ceiling. The floor for the normal ordering is{' '}
            {floorNormal.toFixed(4)} eV and DESI’s July 2026 ceiling is {DESI_JULY_2026.value} eV, which is {julyRoom.ratio.toFixed(3)} times the
            floor, only {julyRoom.difference.toFixed(4)} eV above it: <em>{roomWords[actualRoom]}</em>.{' '}
            {roomPrediction === actualRoom ? 'Your prediction matched.' : 'Your prediction did not match.'}
            {roomPrediction === 'none' &&
              ' “No room” is a reasonable guess. The March 2025 DESI paper found that a different statistical method gives a limit of 0.053 eV, below the floor, and reported a 3 sigma tension between the sky and the floor (part 5 below).'}{' '}
            Either way, the parts below explain what lies behind the numbers.
          </p>

          <p style={paragraphStyle}>
            <strong>1. What the results show, in your own numbers.</strong> You looked at a total of {formatTotal(mine.totalMassEv)} eV. Shared equally, each of the
            three weighs {formatTotal(mine.totalMassEv)} ÷ 3 = {mine.massEachEv.toFixed(4)} eV. A typical neutrino in the cold sea carries an energy of{' '}
            {mine.typicalEnergyTodayEv.toFixed(6)} eV today. In the past that energy was bigger by the same factor, 1 + <em>z</em>, by which the
            universe was smaller. So they turn heavy when 1 + <em>z</em> = {mine.massEachEv.toFixed(4)} ÷ {mine.typicalEnergyTodayEv.toFixed(6)} ={' '}
            {(mine.heavyRedshift + 1).toFixed(1)}, at <em>z</em> = {mine.heavyRedshift.toFixed(1)}, about {millions(mine.heavyTimeYears)} million
            years after the Big Bang: {mine.timesLaterThanRelease.toFixed(0)} times later than the release of the microwave background. Their share of
            the matter is {formatTotal(mine.totalMassEv)} ÷ {EV_FOR_ONE_OMEGA_H_SQUARED} ÷ {(HUBBLE_PARAMETER_H * HUBBLE_PARAMETER_H).toFixed(3)} ÷ {OMEGA_MATTER} = {(mine.share * 100).toFixed(2)} percent, and {SMOOTHING_FACTOR} × {mine.share.toFixed(5)} ={' '}
            {(mine.smoothing * 100).toFixed(2)} percent is how much they smooth the smallest clumps.
          </p>

          <p style={paragraphStyle}>
            <strong>2. Why a hot particle acts like light, and a cool one like matter.</strong> Compare a ball thrown hard and a ball rolled
            gently, which are the same ball. Thrown hard, the energy of its motion is what matters and it flies like a bullet. Rolled gently, it is
            just a slow object. A neutrino is like that. When the universe was hot, its energy of motion was far bigger than the energy of its mass,
            so it flew almost at the speed of light and acted like light. The universe has cooled ever since, and the energy of motion has fallen
            until it equalled the energy of the mass; after that the neutrino moves slowly and acts like matter. The microwave background was
            released when the universe was only {mine.releaseYears.toLocaleString('en-US')} years old, when the neutrinos were still light-like.
            With these masses they only turned heavy much later. That matters because matter, unlike light, can pull things together and help
            clumps grow.
          </p>

          <p style={paragraphStyle}>
            <strong>3. Small, but not nothing.</strong> The neutrinos are well under 1 percent of the matter, yet they are not harmless to the
            clumps. Think of mixing a little fine sand into snow. The snow packs into drifts, but the sand does not settle into them, so the drifts
            come out a little softer. In the same way, neutrinos move too fast to settle into the smallest clumps of matter, and they smooth those clumps
            out by about eight times their share: for a total of {DESI_JULY_2026.value} eV, {SMOOTHING_FACTOR} × {runNeutrinoMass(DESI_JULY_2026.value).share.toFixed(5)}{' '}
            = {(smoothingAtJuly * 100).toFixed(2)} percent. A few percent is small, but large surveys of the sky can measure the sizes of clumps to
            about that precision, which is why the sky can “weigh” the neutrinos.
          </p>

          <p style={paragraphStyle}>
            <strong>4. Where the floor comes from.</strong> Experiments that watch neutrinos change kind measure the gaps between the squares of the
            masses: {MASS_SQUARED_GAPS.solar} and {MASS_SQUARED_GAPS.atmosphericNormal} eV². If the lightest neutrino weighed nothing, the other two
            would weigh √{MASS_SQUARED_GAPS.solar} = {sqrtSolar.toFixed(5)} eV and √{MASS_SQUARED_GAPS.atmosphericNormal} = {sqrtAtmos.toFixed(4)}{' '}
            eV, and the total would be {floorNormal.toFixed(4)} eV. It cannot be less than that, whatever the lightest one weighs: that is the floor.
            It is like knowing how much heavier two of three parcels are than the lightest: even if the lightest weighed nothing, the three together
            would weigh at least the sum of those two amounts. (The real gaps are between squares of the masses, which is why square roots appear.)
            If the pattern is the inverted ordering, the floor is {floorInverted.toFixed(4)} eV.
          </p>

          <p style={paragraphStyle}>
            <strong>5. How the ceiling came down.</strong> A “95 percent upper limit” says: “we are 95 percent sure the total is below this”. It is
            not a measurement. In 2018, Planck’s microwave-background data with other measurements gave {planck.value} eV. DESI’s data release of
            March 2025, with the microwave background, gave {march2025.value} eV, and a new analysis in July 2026 gave {DESI_JULY_2026.value} eV.
            That is almost level with the normal-ordering floor of {floorNormal.toFixed(4)} eV, and below the inverted-ordering floor of{' '}
            {floorInverted.toFixed(4)} eV. The March 2025 paper reported a tension of 3 sigma with the floor, and a second statistical method in the same paper gives a limit of 0.053 eV, which is below it. The statistics, when allowed to try a
            “negative” total in the arithmetic (which is not a real mass, only a way of seeing which way the data lean), leaned toward the negative side.
            DESI’s own July 2026 paper says its result “should not be interpreted as strong evidence” for the normal ordering, because “most of the
            posterior volume is inconsistent with both mass orderings”.
          </p>

          <p style={paragraphStyle}>
            <strong>6. Why the status is Contested.</strong> Possible explanations have been proposed, and none is established. It may be a matter of
            which data and analysis are used: with another version of the Planck data (called PR4), one paper finds that the limit from DESI’s 2024 data
            loosens to about {pr4.value} eV, so both orderings fit. It may be that dark energy is not constant (Experiment 2): if it is allowed to change, the March
            2025 limit loosens to {evolving.value} eV, and the tension goes away. Or it may be that neutrinos behave in a way the standard picture does
            not include, such as decaying; that idea is only named here. Each of these is a possibility. Nobody can yet say which, if any, is right, and
            no result reaches the 5 sigma bar for a discovery.
          </p>

          <p style={{ ...paragraphStyle, marginBottom: 0 }}>
            <strong>7. What was shown, and what was not.</strong> You saw why a tiny mass can leave a mark on the sky: when the neutrinos turn
            heavy, how much matter they make up, and how much they smooth small clumps. You also saw the floor and the ceilings squeeze the same
            number. What this experiment did <strong>not</strong> do is reproduce DESI’s limit, which comes from a computer fit that also uses how
            neutrino mass changes the expansion and the bending of the microwave background’s light. And it did not show whether the tension is
            real. A tension is a puzzle, not yet a discovery.
          </p>
        </div>
      )}
    </div>
  )
}
