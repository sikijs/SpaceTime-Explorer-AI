import { useState } from 'react'
import type { ReactNode } from 'react'
import { CYCLE_CHOICES, SHIFT_CHOICES_NANOSECONDS } from '../physics/pulsarTimingBackground'
import type { CycleChoiceId, ShiftChoice } from '../physics/pulsarTimingBackground'
import { ReferencePanel } from './EnergyMomentumExperiment'

// Frontier and Beyond, Experiment 22 (docs/experiments/frontier-and-beyond/22-does-the-universe-hum.md).
// STEPS 2 and 3 (the interface skeleton and the introduction, then the two predictions): this file has the title, the status line, the introduction, the new-word list, the collapsed "Words and formulas" panel and the
// "Want to know more?" links. It also has the two predictions (Part 1), and Run only records them. It has no run, pictures, controls, results, tutor or chapter summary yet; those are later steps (CLAUDE.md §6). All wording is a DRAFT for the
// owner's line-by-line approval (CLAUDE.md §28.1), written to the standard of §29. Nothing here says how long one wave cycle of a pair of supermassive black holes lasts, how big the shift in a
// pulse's arrival time is, or what "nanohertz" means (CLAUDE.md §12): those are the predictions' answers and the run's results. The links that give them away (NANOGrav's own pages, which say
// "years to decades", the IPTA's page and the papers) are listed only after the run, in a later step.

function ExternalLink({ href, children }: { href: string; children: ReactNode }) {
  return (
    <a href={href} target="_blank" rel="noopener noreferrer">
      {children}
    </a>
  )
}

const paragraph = { marginTop: 0, marginBottom: '0.75rem' } as const

function referenceEntries(): { term: string; meaning: string }[] {
  return [
    { term: 'Gravitational wave', meaning: 'a ripple in spacetime that is sent out when heavy things speed up or change direction, for example two black holes circling each other. As it passes, it very slightly stretches and squeezes space (Gravitational Waves Experiment 1).' },
    { term: 'Hertz', meaning: 'a unit for how often something repeats. One hertz is one repeat (one cycle) every second, so a sound of 100 hertz repeats 100 times a second.' },
    { term: 'Orbit and orbital period', meaning: 'an orbit is the path of one object going round another, and the orbital period is the time it takes to go round once (Gravity Experiment 6). A year is the Earth’s orbital period round the Sun.' },
    { term: 'Parsec', meaning: 'a unit for distances between stars and black holes. One parsec is about 3.26 light-years, which is about 31 million million kilometres. So 0.01 parsecs is about 0.03 light-years.' },
    { term: 'Nanosecond', meaning: 'a billionth of a second. In one nanosecond, light travels about 30 centimetres.' },
    { term: 'Supermassive black hole', meaning: 'a black hole millions to billions of times as heavy as the Sun, found at the centre of most large galaxies. The one at the centre of our own galaxy, Sagittarius A*, is about 4 million Suns (Frontier and Beyond Experiment 21).' },
    { term: 'Neutron star', meaning: 'the extremely dense core left behind when a heavy star explodes, with the mass of more than the Sun squeezed into a sphere about 12 kilometres across (Frontier and Beyond Experiment 15).' },
    { term: 'Pulsar', meaning: 'a neutron star that spins and gives out beams of radio waves from its poles. As it spins, a beam sweeps round the sky like the light of a lighthouse, and each time it points at the Earth, telescopes pick up a short pulse.' },
    { term: 'Millisecond pulsar', meaning: 'a pulsar that spins hundreds of times every second, so a pulse arrives every few thousandths of a second. They are among the steadiest natural clocks known, which is why they are used here.' },
    { term: 'Arrival time', meaning: 'the moment a pulse reaches a radio telescope on Earth. Astronomers compare each pulse’s real arrival time with the time a model says it should arrive, and look at the difference.' },
    { term: 'Background (of gravitational waves)', meaning: 'many waves from many different sources, added together, so that no one wave stands out, like the murmur of a crowd, in which you cannot pick out one voice. A background is a steady, faint signal from all directions.' },
    { term: 'Sigma', meaning: 'a way of saying how many give-or-takes a result is from a value that was expected (Experiment 1 of this group): the bigger the number, the harder it is to say the gap is just chance. About 3 sigma is often called a hint or evidence, and 5 sigma is the usual bar for a discovery.' },
    { term: 'Give-or-take', meaning: 'the size of the uncertainty of a measurement, written “2.4 ± 0.7”. It says how far the true value could be from the measured one. (Experiment 1 of this group explains it.)' },
  ]
}

const CYCLE_LABELS: Record<CycleChoiceId, string> = {
  minute: 'About a minute',
  day: 'About a day',
  month: 'About a month',
  year: 'About a year',
  decade: 'About a decade (10 years)',
  century: 'About a century (100 years)',
}
const SHIFT_LABELS: Record<ShiftChoice, string> = {
  0.1: 'About 0.1 nanoseconds',
  1: 'About 1 nanosecond',
  10: 'About 10 nanoseconds',
  100: 'About 100 nanoseconds',
  1000: 'About 1,000 nanoseconds (a millionth of a second)',
}

export function PulsarTimingBackgroundExperiment() {
  const [cycleGuess, setCycleGuess] = useState<CycleChoiceId | null>(null)
  const [shiftGuess, setShiftGuess] = useState<ShiftChoice | null>(null)
  const [recorded, setRecorded] = useState(false)
  const bothPredicted = cycleGuess !== null && shiftGuess !== null
  const startOver = () => {
    setCycleGuess(null)
    setShiftGuess(null)
    setRecorded(false)
  }
  return (
    <div>
      <h2>Experiment 22 — Does the Universe Hum? (Pulsar Timing Arrays)</h2>
      <div className="exp-card" style={{ marginTop: '2rem', padding: '1.5rem' }}>
        <p style={{ marginTop: 0, marginBottom: '1.5rem', fontSize: '0.875rem' }}>
          <strong>
            Where this stands (as of October 2026): there is strong evidence, at about 3 to 4 sigma in the best-known data set, for a faint background of gravitational waves of a different kind
            from the ones LIGO detects. No team has yet announced the 5 sigma that is the usual bar for a discovery, and the teams are combining their data to try to reach it. The most likely source is
            many pairs of supermassive black holes, but this is not proven. The numbers, and where each comes from, are shown after you press Run, so that you can guess first.
          </strong>
        </p>

        <div style={{ marginBottom: '1.5rem' }}>
          <p style={{ marginTop: 0, marginBottom: '0.5rem' }}>
            <strong>The question.</strong> In Gravitational Waves Experiments 1 and 2 you saw that two black holes circling each other send out gravitational waves, ripples in spacetime, and that the
            waves change as the pair spirals in. The detectors LIGO and Virgo pick up waves from pairs of black holes of a few tens of times the mass of the Sun, in the last moments before they merge. But
            these are not the only black holes there are, and a pair of them circling each other is not the only way to make a wave. This experiment asks about a different kind of wave, from much heavier black holes,
            and about a very different kind of detector.
          </p>

          <p style={{ marginTop: 0, marginBottom: '0.5rem' }}>
            <strong>Much heavier black holes.</strong> At the centre of most large galaxies there is a supermassive black hole, millions or billions of times as heavy as the Sun. Our own galaxy has one,
            Sagittarius A*, and in Experiment 21 you met another, M87*, of 6.5 billion Suns. Galaxies sometimes merge, and when two galaxies merge, the supermassive black holes at their centres can end up in
            the same galaxy. Over time they can drift towards each other and begin to circle one another: two enormous black holes, in orbit. Just as a pair of small black holes sends out gravitational waves,
            so does a pair of enormous ones.
          </p>

          <p style={{ marginTop: 0, marginBottom: '0.5rem' }}>
            <strong>The big question about such a pair</strong> is what its waves are like. For two black holes in orbit, you can work that out from how heavy they are and how far apart they circle, using the
            same law (Kepler’s law) that gives the Earth’s year. It is your job, in a moment, to guess how long one cycle of such a wave lasts, and then to see how it compares with the waves LIGO detects.
          </p>

          <p style={{ marginTop: 0, marginBottom: '0.5rem' }}>
            <strong>What is a pulsar?</strong> To look for waves from such a pair we use stars as clocks. A <strong>neutron star</strong> (Frontier and Beyond Experiment 15) is the core left over when a heavy
            star explodes: a sphere about 12 kilometres across, with more mass than the Sun. Some neutron stars spin and give out a narrow beam of radio waves from their poles. As the star spins, the beam sweeps
            round the sky, like the light of a lighthouse. From far away, you do not see a steady light, you see a flash each time the beam points at you. A neutron star seen this way is called a
            <strong> pulsar</strong>, because it pulses.
          </p>
          <p style={{ marginTop: 0, marginBottom: '0.5rem' }}>
            <strong>Why pulsars make good clocks.</strong> The fastest ones, <strong>millisecond pulsars</strong>, spin hundreds of times every second, and they spin so steadily that they approach the
            steadiness of the best atomic clocks on Earth. Each pulse arrives at a radio telescope on Earth at a time that can be predicted very precisely. Think of a very steady drummer in a faraway field:
            if the beats you hear are always exactly evenly spaced, then any beat that comes a tiny bit early or late tells you something happened to the sound on its way to you.
          </p>

          <p style={{ marginTop: 0, marginBottom: '0.5rem' }}>
            <strong>How a gravitational wave could change the pulses.</strong> You saw in Gravitational Waves Experiment 1 that a passing wave stretches and squeezes space. If a wave passes through the space
            between the Earth and a pulsar, then for a moment that space is a little longer or a little shorter, so a pulse takes a little longer or a little less time to arrive. The pulse arrives a little late, or a
            little early, compared with its expected time. The shift is tiny, so the detector has to watch the pulses for years. The size of the shift is the second thing you will be asked to guess.
          </p>
          <p style={paragraph}>
            This is a very different kind of detector from LIGO. The “arms” are the paths from the pulsars to the Earth, and there are dozens of them, pointing in different directions across our galaxy. The
            group of pulsars watched together is called a <strong>pulsar timing array</strong>. Several teams around the world have built one, and they are now combining their data.
          </p>

          <p style={{ marginTop: 0, marginBottom: '0.5rem' }}>
            <strong>A hum, not a single voice.</strong> There are many such pairs of supermassive black holes in the universe, and each sends out its own waves. If you add the waves from all of them, you do not get
            one clear signal. You get a steady, faint <strong>background</strong>, like the murmur of a crowd, in which you cannot pick out one voice. That is why this experiment is called “Does the universe hum?”.
          </p>

          <p style={{ marginTop: 0, marginBottom: '0.5rem' }}>
            <strong>How sure is the result?</strong> In 2023, teams reported evidence for such a background. The most-quoted result is the 15-year data set of a team called NANOGrav, and it is stated as
            evidence, not as a discovery. Scientists measure how sure a result is in <strong>sigma</strong>. Roughly, the bigger the number, the harder it is to say the result is just chance. About 3 sigma
            is often called a hint or evidence, and 5 sigma is the usual bar for a discovery. This page will show where each team stands, and what the result can and cannot say.
          </p>

          <p style={paragraph}>
            <strong>What this page does and does not model.</strong> It works out, with one law and two short formulas, what the waves from a pair of supermassive black holes are like and how big the shift in
            a pulse’s arrival time is. It does not model the pulsars’ own irregularities, the data analysis that picks the signal out of the noise, how many pairs there are, how pairs come to be so close,
            or the other explanations that have been proposed for the signal. The numbers for the real results are published ones.
          </p>


          <p style={paragraph}>
            <strong>What you will do.</strong> You will make two predictions and press Run. Later steps will draw the pictures one stage at a time, and then let you try other values in a part of its own.
            Nothing here is graded. Your predictions are your own guesses, made before you see anything. They never change the real pictures or the tables, which come from the physics and the published
            numbers. Your guesses will be drawn on top of the real pictures, in white, so you can compare each guess with the real result, and they will be shown again beside the results. The page will have
            four parts: first you predict and watch the pictures; then, in “Now try it yourself”, you can choose the mass of each black hole in a pair and how far apart they are, and watch a drawing follow your
            choices; then come the results; and last a tutor asks you some questions. The real pictures and the results tables never change. Your white guess marks appear on the real pictures, and only the
            drawing in “Now try it yourself” follows your choices.
          </p>

          <p style={{ marginTop: 0, marginBottom: '0.75rem' }}>
            <strong>Want to know more?</strong> Plainer-language pages are listed here. Links open in a new tab. This page was written as of October 2026. The pages of the teams themselves, and the papers, are listed
            after the run, so that they do not give away the predictions.
          </p>
          <ul style={{ margin: '0.25rem 0 0', paddingLeft: '1.25rem' }}>
            <li>
              <ExternalLink href="https://science.nasa.gov/mission/hubble/science/science-behind-the-discoveries/hubble-pulsars/">NASA: Pulsars</ExternalLink>: NASA’s account of pulsars, spinning neutron stars whose
              beams sweep across space like a lighthouse, and of the fastest ones, the millisecond pulsars.
            </li>
            <li>
              <ExternalLink href="https://science.nasa.gov/universe/black-holes/">NASA: Black Holes</ExternalLink>: NASA’s overview of black holes, including the supermassive ones at the centres of
              galaxies, with links to their types.
            </li>
          </ul>
        </div>

        <ReferencePanel entries={referenceEntries()} />

        {/* The two predictions: draft wording for the owner's review (CLAUDE.md §28.1), from the specification's "Prediction Activity". Neither says which answer is right. */}
        <div style={{ marginTop: '2.5rem', paddingTop: '1.5rem', borderTop: '6px solid #d97706' }}>
          <h3 style={{ margin: '0 0 0.5rem', color: '#d97706' }}>Part 1: Predict, then watch</h3>
          <p style={{ ...paragraph, fontSize: '0.875rem', color: 'var(--text-muted)' }}>
            <strong>What we are about to do.</strong> This part is the experiment itself. You make your two predictions and press Run. The pictures that the run will draw show fixed things: a calculation
            for a pair of black holes, and published numbers for the real results. They are the same for everyone. When they are drawn, your guesses appear on them in white, so you can see how each guess
            compares with the real result. The real pictures stay the same whatever you guess.
          </p>

          {(
            [
              {
                title: 'Prediction 1: how long does one cycle of the wave last?',
                text: (
                  <>
                    Two supermassive black holes, each a billion times as heavy as the Sun, circle each other. They are 0.01 parsecs apart, which is about 0.03 light-years, or roughly 2,000 times the distance
                    from the Earth to the Sun. Such a pair sends out gravitational waves. A wave goes through one cycle (one full up-and-down) and then repeats. How long does one cycle of this pair’s wave last?
                  </>
                ),
                choices: CYCLE_CHOICES.map((c) => ({ value: c.id as string, label: CYCLE_LABELS[c.id] })),
                value: cycleGuess as string | null,
                set: (v: string) => setCycleGuess(v as CycleChoiceId),
              },
              {
                title: 'Prediction 2: how much earlier or later does a pulse arrive?',
                text: (
                  <>
                    A gravitational wave of the kind that the NANOGrav team reports squeezes and stretches space by a very small fraction: about 2.4 parts in a million billion (a million billion is 1 followed by 15
                    zeros). The pulses of a millisecond pulsar arrive every few thousandths of a second. Because of such a wave, a pulse arrives a little earlier or later than it would otherwise. About how
                    big is that shift, in billionths of a second (nanoseconds)? This is a separate guess from Prediction 1, so your two answers do not have to agree with each other.
                  </>
                ),
                choices: SHIFT_CHOICES_NANOSECONDS.map((c) => ({ value: String(c), label: SHIFT_LABELS[c] })),
                value: shiftGuess === null ? null : String(shiftGuess),
                set: (v: string) => setShiftGuess(Number(v) as ShiftChoice),
              },
            ] as const
          ).map((question) => (
            <div key={question.title} style={{ marginTop: '1.5rem', marginBottom: '2rem' }}>
              <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold' }}>{question.title}</label>
              <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)', marginTop: 0, marginBottom: '0.75rem' }}>{question.text} You are not graded, and a guess is fine.</p>
              <div>
                {(question.choices as ReadonlyArray<{ value: string; label: string }>).map((choice) => (
                  <button
                    key={choice.value}
                    type="button"
                    onClick={() => (question.set as (v: string) => void)(choice.value)}
                    disabled={recorded}
                    className={`toggle-button${question.value === choice.value ? ' is-selected' : ''}`}
                    style={{ marginRight: '0.5rem', marginBottom: '0.5rem', padding: '0.5rem 1rem', fontSize: '0.875rem' }}
                  >
                    {choice.label}
                  </button>
                ))}
              </div>
              <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.5rem', marginBottom: 0 }}>
                {question.value !== null
                  ? `Your prediction: ${(question.choices as ReadonlyArray<{ value: string; label: string }>).find((c) => c.value === question.value)?.label.toLowerCase()}.`
                  : 'Choose an option to continue'}
              </p>
            </div>
          ))}

          <button type="button" className="action-button" onClick={() => setRecorded(true)} disabled={!bothPredicted || recorded} style={{ padding: '0.6rem 1.5rem' }}>
            Run
          </button>
          {recorded && (
            <button type="button" className="secondary-button" onClick={startOver} style={{ marginLeft: '0.75rem', padding: '0.6rem 1.25rem' }}>
              Start over
            </button>
          )}
          {!bothPredicted && !recorded && (
            <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: 0 }}>Answer both predictions above to run the experiment.</p>
          )}
          {recorded && (
            <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)', marginBottom: 0 }}>
              Your predictions are recorded. The pictures and the results are built in later steps, so nothing more happens yet.
            </p>
          )}
        </div>
      </div>
    </div>
  )
}
