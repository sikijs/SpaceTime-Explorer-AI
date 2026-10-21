import { useState } from 'react'
import {
  boostRange,
  contaminationRange,
  darkMatterInsideSolarMasses,
  fakeBoostPercent,
  fractionToFake,
  GAMMA_MOND_WIDE_BINARY,
  PUBLISHED_RESULTS,
  runWideBinaries,
  speedBoost,
  speedBoostPercent,
} from '../physics/wideBinaries'
import type { BoostRange, ContaminationRange } from '../physics/wideBinaries'

type TutorStep = 'observe' | 'compare' | 'conceptual' | 'explained'

interface WideBinariesTutorProps {
  massSuns: number // the learner's own pair ("Choose a pair")
  separationAu: number
  fraction: number // "How many pairs are really triples?", as a fraction from 0 to 1
  factor: number
  boostPrediction: BoostRange
  contaminationPrediction: ContaminationRange
  onExplained?: () => void
}

const boostWords: Record<BoostRange, string> = {
  none: 'no noticeable difference',
  about20: 'about 20 percent faster',
  about40: 'about 40 percent faster',
  about100: 'about twice as fast',
}
const contaminationWords: Record<ContaminationRange, string> = {
  about2: 'about 2 percent',
  about20: 'about 20 percent',
  about100: 'about 100 percent',
}

// "8.90 × 10⁻¹¹" from a number, with the exponent in superscript digits.
const SUPERSCRIPT: Record<string, string> = { '-': '⁻', '0': '⁰', '1': '¹', '2': '²', '3': '³', '4': '⁴', '5': '⁵', '6': '⁶', '7': '⁷', '8': '⁸', '9': '⁹' }
const sci = (value: number, digits = 3) => {
  const [mantissa, exponent] = value.toExponential(digits - 1).split('e')
  return `${mantissa} × 10${String(Number(exponent)).split('').map((c) => SUPERSCRIPT[c]).join('')}`
}

const paragraphStyle = { marginBottom: '1rem', fontSize: '0.95rem', color: '#333', lineHeight: '1.6' } as const

// The published results the explanation quotes, read from the physics module's table (never retyped here, CLAUDE.md §9).
const result = (name: string, year: number) => {
  const found = PUBLISHED_RESULTS.find((r) => r.name === name && r.year === year)
  if (!found) throw new Error(`No published result named ${name}, ${year}`)
  return found
}
const withRange = (value: number, plus: number, minus: number, decimals = 2) =>
  plus === minus ? `${value.toFixed(decimals)} ± ${plus.toFixed(decimals)}` : `${value.toFixed(decimals)} (+${plus.toFixed(decimals)}, −${minus.toFixed(decimals)})`

// The tutor of Frontier and Beyond Experiment 7. Draft wording for the owner's review (CLAUDE.md §28.1, §29), from the specification's "AI Tutor
// Behavior": observe, compare with the predictions, one conceptual question, then the explanation after the learner has responded. Every number
// comes from the physics module (wideBinaries.ts), never typed in by hand (CLAUDE.md §9); the published statements follow the specification's source
// table (arXiv abstracts, read through fetch summaries). The predictions are marked only in the explanation (the owner's choice for the group). The
// tutor does not say that gravity changes, and does not say that it does not.
export function WideBinariesTutor({ massSuns, separationAu, fraction, factor, boostPrediction, contaminationPrediction, onExplained }: WideBinariesTutorProps) {
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

  // The learner's own pair and triples, and Prediction 1 and 2's own numbers.
  const mine = runWideBinaries(massSuns, separationAu, GAMMA_MOND_WIDE_BINARY, fraction, factor)
  const boost = speedBoost(GAMMA_MOND_WIDE_BINARY)
  const boostPercent = speedBoostPercent(GAMMA_MOND_WIDE_BINARY)
  const actualBoost = boostRange(boostPercent)
  const exampleRatio = runWideBinaries(1.5, 10000, GAMMA_MOND_WIDE_BINARY, 0.2, 2).contaminatedRatio
  const actualContamination = contaminationRange(0.2, 2)
  const needed = fractionToFake(boostPercent, 2)
  const darkMatter = darkMatterInsideSolarMasses(30000)
  const chae2023 = result('Chae', 2023)
  const chae2024 = result('Chae', 2024)
  const chae2026 = result('Chae and colleagues', 2026)
  const forward = result('Saad and Ting (forward-modelled orbits)', 2026)
  const geometric = result('Saad and Ting (geometric de-projection)', 2026)
  const banik = result('Banik and colleagues', 2024)
  const chae2025 = result('Chae', 2025)
  const saglia = result('Saglia and colleagues', 2025)
  const binaries = (n: number | null) => (n === null ? '' : n.toLocaleString('en-US'))

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
              'Look at Picture 1 and Picture 3. In Picture 1, how much higher is the rose line than the blue one? In Picture 3, how do the five published results compare with the blue line (γ = 1) and the rose line (γ ≈ 1.4)?'}
            {tutorStep === 'compare' &&
              `You predicted that a pull ${GAMMA_MOND_WIDE_BINARY} times as strong would make two stars 10,000 AU apart orbit ${boostWords[boostPrediction]}, and that a study in which 1 pair in 5 is secretly a triple moving twice as fast would have an average speed ${contaminationWords[contaminationPrediction]} higher. Now look at Table 1a and Table 1b, and at your own pair and your own triples. Do the numbers look the way you expected? What surprised you, if anything?`}
            {tutorStep === 'conceptual' &&
              'Two teams look at the same kind of Gaia data and get different answers. What could make that happen, and what would you want to check before you believed either of them?'}
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
            <strong>Your predictions.</strong> Now that you have thought about it, here is how each one compared with the result. You predicted that a pull{' '}
            {GAMMA_MOND_WIDE_BINARY} times as strong would make the stars orbit <em>{boostWords[boostPrediction]}</em>. The speed grows by the square root of
            the pull: √{GAMMA_MOND_WIDE_BINARY} = {boost.toFixed(3)}, which is {boostPercent.toFixed(1)} percent faster, so <em>{boostWords[actualBoost]}</em>.{' '}
            {boostPrediction === actualBoost ? 'Your prediction matched.' : 'Your prediction did not match.'}
            {boostPrediction === 'about40' &&
              ' It is a natural thought: the pull is 40 percent stronger, so it seems that the speed should be 40 percent higher. The next part explains why the speed rises more slowly than the pull.'}
            {boostPrediction === 'about100' &&
              ' To make the stars orbit twice as fast, the pull would have to be four times as strong (the next part explains why).'}
            {boostPrediction === 'none' &&
              ' A 20 percent change is easy to overlook, and it is exactly the size of the signal that the teams in this experiment are looking for.'}{' '}
            You predicted that the average speed of the study would be <em>{contaminationWords[contaminationPrediction]}</em> higher. With 1 pair in 5 a triple
            moving twice as fast, the average is 0.8 × 1 + 0.2 × 2 = {exampleRatio.toFixed(1)}, which is <em>{contaminationWords[actualContamination]}</em>.{' '}
            {contaminationPrediction === actualContamination ? 'Your prediction matched.' : 'Your prediction did not match.'}
            {contaminationPrediction === 'about2' &&
              ' It is a natural thought: 4 pairs in 5 are true pairs, so a minority should matter little. But the minority moves twice as fast, and that pulls the average up by a lot.'}
            {contaminationPrediction === 'about100' &&
              ' It is a natural thought: a triple moves twice as fast, which is 100 percent faster. But only 1 pair in 5 is a triple, so only a fifth of that 100 percent reaches the average.'}{' '}
            Either way, the parts below explain what lies behind the numbers.
          </p>

          <p style={paragraphStyle}>
            <strong>1. Your own pair, in numbers.</strong> You chose a pair with a total mass of {massSuns} Suns, {separationAu.toLocaleString('en-US')} AU apart.
            Newton’s law gives an orbital speed of {mine.newtonSpeed.toFixed(0)} m/s and a pull of {sci(mine.pull)} m/s², which is{' '}
            {mine.pullInA0.toFixed(2)} a₀. {mine.pullInA0 < 1 ? 'That is below a₀, in the range where MOND says that gravity changes.' : 'That is above a₀, so this pair is not in the range where MOND says that gravity changes.'}{' '}
            If the pull were {GAMMA_MOND_WIDE_BINARY} times as strong, the speed would be {mine.newtonSpeed.toFixed(0)} × {boost.toFixed(3)} ={' '}
            {mine.boostedSpeed.toFixed(0)} m/s, which is {mine.speedBoostPercent.toFixed(1)} percent more.
          </p>

          <p style={paragraphStyle}>
            <strong>2. Why the speed rises more slowly than the pull.</strong> In a circular orbit, v² = G × M ÷ s. The square of the speed is proportional to
            the pull, so when the pull is multiplied by 1.4, the square of the speed is multiplied by 1.4, and the speed itself by the square root of 1.4:{' '}
            {boost.toFixed(3)} (check: {boost.toFixed(3)} × {boost.toFixed(3)} = {(boost * boost).toFixed(2)}). A pull 4 times as strong would give only
            2 times the speed, because √4 = 2. Think of a car going round a bend: better grip lets it take the bend faster, but to go round twice as fast it needs
            four times the grip. The stars are the same: a stronger pull makes them faster, but not in the same proportion.
          </p>

          <p style={paragraphStyle}>
            <strong>3. Why wide binaries are a clean test.</strong> Dark matter is spread through the Galaxy. At the density near the Sun (a rough number, about
            0.01 of a Sun in every cubic parsec), the dark matter inside a sphere 30,000 AU across would weigh only about {sci(darkMatter, 2)} of a Sun,
            against {massSuns} Suns of stars in your pair. So it adds almost no extra pull to a wide pair. If a wide pair moved faster than Newton’s law says, hidden
            mass would be a poor explanation, so the speed-up would need another one: a different law of gravity, or something in the data, such as the hidden
            stars of the next part. That does not mean that dark matter is not needed
            for galaxies: the evidence from the way galaxies spin and bend light (Cosmology Experiments 4 and 7) is separate. A wide binary tests how gravity behaves when it is
            very weak. It does not test whether dark matter exists.
          </p>

          <p style={paragraphStyle}>
            <strong>4. Why a few hidden stars matter.</strong> Think of 5 delivery trips. Four take 1 hour and one takes 2 hours. The average is (4 × 1 + 1 × 2) ÷ 5 ={' '}
            {exampleRatio.toFixed(1)} hours: one slow trip in five raises the average by a fifth. A hidden third star does the same to a wide pair: the pair looks
            like two stars but moves like three, so it moves faster than Newton’s law says for two. In your own choice, {(fraction * 100).toFixed(0)} percent of the “pairs”
            are triples that move {factor} times as fast, so the average is (1 − {fraction.toFixed(2)}) × 1 + {fraction.toFixed(2)} × {factor} ={' '}
            {mine.contaminatedRatio.toFixed(2)}: a fake boost of {fakeBoostPercent(fraction, factor).toFixed(1)} percent, against the {boostPercent.toFixed(1)} percent
            that the MOND papers expect. {factor > 1 ? `With triples that move twice as fast, it takes only ${(needed * 100).toFixed(1)} percent of the “pairs” to fake the whole expected boost: about 1 pair in ${Math.round(1 / needed)}.` : 'A triple that moves no faster than a true pair changes nothing, so the factor matters as much as the share.'}{' '}
            That is why the teams work so hard to keep triples out of their samples, and why they do not always agree on how well they have done it.
          </p>

          <p style={paragraphStyle}>
            <strong>5. What the teams found.</strong> Banik and colleagues (2024) studied {binaries(banik.binaries)} wide binaries and report that Newton’s law is
            preferred at {banik.sigma} sigma. Chae (2023) studied {binaries(chae2023.binaries)} and reports a boost of{' '}
            {withRange(chae2023.value as number, chae2023.errorPlus, chae2023.errorMinus)} at {chae2023.sigma} sigma, and Chae (2024) reports about {chae2024.sigma} sigma
            for {binaries(chae2024.binaries)} “statistically pure” binaries. Saglia and colleagues (2025) found their {binaries(saglia.binaries)} usable pairs consistent
            with Newton, while Chae (2025) reports an anomaly in {binaries(chae2025.binaries)} binaries with three-dimensional velocities that agrees with MOND. Then,
            for the same {binaries(chae2026.binaries)} binaries, Chae and colleagues (2026) report γ = {withRange(chae2026.value as number, chae2026.errorPlus, chae2026.errorMinus)},
            and Saad and Ting (2026) report γ = {withRange(forward.value as number, forward.errorPlus, forward.errorMinus)} when they model the orbits forward, and{' '}
            {withRange(geometric.value as number, geometric.errorPlus, geometric.errorMinus)} with a different way of working out the separation, which brings back
            the first team’s value. Cookson and colleagues (2026) report that their cleanest sample shows no 20 percent enhancement. So the same
            36 binaries gave γ = {chae2026.value?.toFixed(2)} and γ = {forward.value?.toFixed(2)}, depending on how the orbits were modelled. That is the meaning of{' '}
            <strong>Contested</strong>: careful teams, with similar data, reach different answers.
          </p>

          <p style={paragraphStyle}>
            <strong>6. Why this does not make either team dishonest.</strong> The effect is small, about a fifth in the speed, and the data are hard: stars are seen
            at an angle, distances and masses have errors, and some pairs hide a third star. When an effect is only a little bigger than the things that can fake it,
            two honest teams can make different choices about how to deal with them, and get different answers. Science makes progress by those choices being
            checked, repeated and argued over in the open.
          </p>

          <p style={paragraphStyle}>
            <strong>7. What would settle it.</strong> Cleaner samples, with fewer hidden companions; more binaries whose velocities are measured in all three
            dimensions (for example, with radial velocities for the stars where Gaia has none); a shared way of treating hidden companions; and a clear
            treatment of the pull of the whole Galaxy on a pair (the external field effect, in which the papers expect a boost of about {GAMMA_MOND_WIDE_BINARY}{' '}
            and not more). Until then, the results as of October 2026 do not agree.
          </p>

          <p style={{ ...paragraphStyle, marginBottom: 0 }}>
            <strong>8. What was shown, and what was not.</strong> You saw how fast two stars orbit, how weak the pull is in a wide pair, why a pull {GAMMA_MOND_WIDE_BINARY} times as
            strong makes the speed {boostPercent.toFixed(0)} percent higher and not 40, and how a hidden fraction of triples can fake a boost of that size. What this
            experiment did <strong>not</strong> do is analyse any Gaia data, decide between the teams, or say whether gravity changes or whether dark matter exists in some
            other form. Those are open questions.
          </p>
        </div>
      )}
    </div>
  )
}
