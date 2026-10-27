import type { ReactNode } from 'react'
import { ReferencePanel } from './EnergyMomentumExperiment'

// Frontier and Beyond, Experiment 22 (docs/experiments/frontier-and-beyond/22-does-the-universe-hum.md).
// STEP 2 (the interface skeleton and the introduction): this file has the title, the status line, the introduction, the new-word list, the collapsed "Words and formulas" panel and the
// "Want to know more?" links. It has no predictions, run, pictures, controls, results, tutor or chapter summary yet; those are later steps (CLAUDE.md §6). All wording is a DRAFT for the
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

export function PulsarTimingBackgroundExperiment() {
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
      </div>
    </div>
  )
}
