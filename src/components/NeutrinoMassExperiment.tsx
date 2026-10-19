import type { ReactNode } from 'react'
import { RECOMBINATION_REDSHIFT, RECOMBINATION_YEARS_AFTER_BIG_BANG, CMB_TEMPERATURE_TODAY_KELVIN } from '../physics/cosmicMicrowaveBackgroundExperiment'
import { NEUTRINO_TEMPERATURE_TODAY_KELVIN } from '../physics/neutrinoMass'
import { ReferencePanel } from './EnergyMomentumExperiment'

// Frontier and Beyond, Experiment 4 (docs/experiments/frontier-and-beyond/04-can-the-universe-weigh-a-neutrino.md).
// Step 2 builds the status label, the introduction with its new-word list and its "Want to know more?" links, a drawing of the relic neutrino
// sea, and the skeleton of Picture 1 with its guide. The predictions, Run, the neutrino markers, Pictures 2 and 3, the results, the "Try a
// different total mass" control, the tutor and the chapter summary come in later steps. All wording is draft wording for the owner's review
// (CLAUDE.md §28.1), written to the standard of §29. The interface only displays numbers from src/physics (CLAUDE.md §9); the only calculation
// here is where a point is drawn.

interface NeutrinoMassExperimentProps {
  onComplete?: () => void
  onTutorComplete?: () => void
}

const VIEW_WIDTH = 560
const TEXT_COLOR = '#e2e8f0'
const MUTED_COLOR = '#94a3b8'
const LIGHT_COLOR = '#38bdf8' // sky blue: the microwave background (light), as in Experiment 3
const NEUTRINO_COLOR = '#a78bfa' // violet: neutrinos

function ExternalLink({ href, children }: { href: string; children: ReactNode }) {
  return (
    <a href={href} target="_blank" rel="noopener noreferrer">
      {children}
    </a>
  )
}

const svgStyle = {
  display: 'block',
  maxWidth: '100%',
  height: 'auto',
  border: '1px solid var(--border-color, #ccc)',
  borderRadius: '8px',
  overflow: 'hidden',
  backgroundColor: '#0b1020',
} as const

const paragraph = { marginTop: 0, marginBottom: '0.75rem' } as const

// ---- The relic sea (an illustration, not data) ----
// A seeded random-number generator, so the drawing is the same every time.
function seeded(seed: number) {
  let state = seed
  return () => {
    state = (state * 1664525 + 1013904223) % 4294967296
    return state / 4294967296
  }
}

const SEA_W = 250
const SEA_H = 118
const SEA_TOP = 44
const SEA_X = [20, 290]
const PHOTONS = (() => {
  const rand = seeded(11)
  return Array.from({ length: 46 }, () => ({ x: 6 + rand() * (SEA_W - 12), y: 6 + rand() * (SEA_H - 12) }))
})()
const NEUTRINOS = (() => {
  const rand = seeded(29)
  return Array.from({ length: 46 }, () => ({ x: 6 + rand() * (SEA_W - 12), y: 6 + rand() * (SEA_H - 12) }))
})()

function RelicSeaDrawing() {
  const height = SEA_TOP + SEA_H + 62
  return (
    <svg
      width={VIEW_WIDTH}
      height={height}
      viewBox={`0 0 ${VIEW_WIDTH} ${height}`}
      style={svgStyle}
      role="img"
      aria-label="Two patches of space side by side, one filled with light left over from the Big Bang and one with neutrinos left over from the Big Bang"
    >
      <text x={20} y={22} fill={TEXT_COLOR} fontSize="13" fontWeight="bold">
        Illustration: two leftovers from the Big Bang
      </text>
      {[
        { x: SEA_X[0], color: LIGHT_COLOR, dots: PHOTONS, title: 'Leftover light (the microwave background)', temp: `${CMB_TEMPERATURE_TODAY_KELVIN} K` },
        { x: SEA_X[1], color: NEUTRINO_COLOR, dots: NEUTRINOS, title: 'Leftover neutrinos (the “neutrino sea”)', temp: `about ${NEUTRINO_TEMPERATURE_TODAY_KELVIN.toFixed(2)} K (colder)` },
      ].map((panel) => (
        <g key={panel.title}>
          <text x={panel.x} y={SEA_TOP - 8} fill={panel.color} fontSize="11" fontWeight="bold">
            {panel.title}
          </text>
          <rect x={panel.x} y={SEA_TOP} width={SEA_W} height={SEA_H} fill="none" stroke={MUTED_COLOR} strokeDasharray="4 3" rx={6} />
          {panel.dots.map((d, i) => (
            <circle key={i} cx={panel.x + d.x} cy={SEA_TOP + d.y} r={panel.color === NEUTRINO_COLOR ? 3.2 : 2.2} fill={panel.color} opacity={0.9} />
          ))}
          <text x={panel.x} y={SEA_TOP + SEA_H + 18} fill={TEXT_COLOR} fontSize="11">
            Temperature today:
          </text>
          <text x={panel.x} y={SEA_TOP + SEA_H + 34} fill={panel.color} fontSize="12" fontWeight="bold">
            {panel.temp}
          </text>
        </g>
      ))}
      <text x={20} y={SEA_TOP + SEA_H + 56} fill={MUTED_COLOR} fontSize="10">
        A thimble-sized patch of empty space, magnified. The number of dots is for illustration only.
      </text>
    </svg>
  )
}

// ---- Picture 1: when do the neutrinos turn heavy? (Step 2: the timeline and the microwave background's release) ----
const AXIS_LEFT = 40
const AXIS_RIGHT = 520
const AXIS_MAX_Z = 1100
const AXIS_Y = 150
const TICK_REDSHIFTS = [0, 10, 100, 1000]
// The line is not even: it spaces 1 + z (how much the universe has stretched), not z, so that early times are not squeezed into a speck.
const xOfZ = (z: number) => AXIS_RIGHT - (Math.log10(1 + z) / Math.log10(1 + AXIS_MAX_Z)) * (AXIS_RIGHT - AXIS_LEFT)

const REFERENCE_ENTRIES: { term: string; meaning: string }[] = [
  { term: 'Neutrino', meaning: 'a particle with no electric charge that hardly ever interacts with anything, so it passes through ordinary matter almost untouched. It comes in three kinds (electron, muon and tau), and it has a very small mass.' },
  { term: 'Electron-volt (eV)', meaning: 'a tiny unit of energy. Because mass and energy are linked (E = mc², Spacetime Geometry Experiment 5), it is also used for mass: an electron weighs about 511,000 eV, and a neutrino less than 0.1 eV.' },
  { term: 'The neutrino sea (cosmic neutrino background)', meaning: 'the neutrinos left over from the first second of the Big Bang. They fill all of space, like the microwave background, which is leftover light. They have been flying freely ever since, so they are colder than the light.' },
  { term: 'Light-like and matter-like', meaning: 'a particle that carries far more energy than its own mass energy (E = mc²) moves almost at the speed of light and acts like light. When it has cooled so that its energy is below its mass energy it moves slowly and acts like matter. The same neutrino is light-like when the universe is hot and matter-like when it is cool.' },
  { term: 'Redshift (z)', meaning: 'a way of saying how long ago, from Cosmology Experiments 1 and 3. z = 0 is today. The larger z is, the longer ago, and 1 + z is how many times smaller the universe was then. A redshift of 1,089.8 means the universe was 1,090.8 times smaller.' },
  { term: 'Oscillation', meaning: 'the way a neutrino of one kind turns into another kind as it flies. This can only happen if the kinds have different masses, so seeing it proves that neutrinos have mass. It tells us how far apart the masses are, not how big they are.' },
  { term: 'Floor and ceiling', meaning: 'two limits on the sum of the three neutrino masses. The floor is a minimum, from oscillation experiments: the masses cannot add up to less. The ceiling is a maximum: they cannot add up to more.' },
  { term: 'Normal and inverted ordering', meaning: 'two possible patterns for the three masses. In the normal ordering one neutrino is much heavier than the other two, and the floor is about 0.059 eV. In the inverted ordering two are heavy and close together, and the floor is about 0.10 eV. Experiments have not yet decided which is true.' },
  { term: 'Upper limit (95 percent)', meaning: 'a statement of the kind “I am 95 percent sure the parcel weighs less than this”. It is not a measurement of the weight. It says how big the quantity could be and still agree with the data.' },
  { term: 'Tension', meaning: 'as in Experiments 1 to 3 of this group, a disagreement between two measurements that is too big to put down to chance. It is a puzzle, not yet a discovery.' },
  { term: 'Standard model of the universe', meaning: 'the model built in the Cosmology experiments, with ordinary matter, dark matter and dark energy. The cosmic limits on neutrino mass assume it.' },
  { term: 'arXiv', meaning: 'the free website where scientists post their papers. Links to “arxiv.org” on this page lead to the original papers, which use technical words.' },
]

export function NeutrinoMassExperiment(_props: NeutrinoMassExperimentProps) {
  const releaseX = xOfZ(RECOMBINATION_REDSHIFT)
  const height = AXIS_Y + 66

  return (
    <div>
      <h2>Experiment 4 — Can the Universe Weigh a Neutrino?</h2>
      <div className="exp-card" style={{ marginTop: '2rem', padding: '1.5rem' }}>
        <p style={{ marginTop: 0, marginBottom: '1.5rem', fontSize: '0.875rem' }}>
          <strong>Where this stands (as of October 2026): Contested.</strong> The limits below are real and published. What they mean is not
          settled.
        </p>

        {/* Introduction: draft wording for the owner's review (CLAUDE.md §28.1), written to the standard of CLAUDE.md §29. It does not give
            DESI's limit, how it compares with the laboratory floor, that the two nearly meet, or that the statistics lean toward a negative
            mass (that is what the predictions ask, §12). It leaves out the number of neutrinos per cubic centimetre and the number passing
            through a hand each second, which have no source check (Decision 14). */}
        <div style={{ marginBottom: '2rem', fontSize: '0.875rem', color: 'var(--text-muted)' }}>
          <p style={paragraph}>
            <strong>The question.</strong> Can the whole universe, by the way it expands and clumps, tell us how much a neutrino weighs? And does
            that agree with what laboratories find?
          </p>

          <p style={paragraph}>
            <strong>Where we left off.</strong> In Experiment 1 two ways of measuring the expansion rate disagreed. In Experiment 2 a survey hinted
            that dark energy might change. In Experiment 3 a disagreement between surveys shrank in one survey and not in another. This experiment
            has a tension of a different kind, because the two sides are measuring the <em>same particle</em> in completely different ways: one in
            a laboratory, the other in the sky.
          </p>

          <p style={paragraph}>
            <strong>What is a neutrino?</strong> A neutrino is a particle with no electric charge that hardly ever interacts with anything. Think
            of how a wall stops a thrown ball but not a radio wave: a neutrino passes through a wall, through a planet, and through you almost
            untouched. There are three kinds, called electron, muon and tau neutrinos. Apart from light, which has no mass at all, neutrinos are the
            lightest particles known to have any mass. But they do have a mass, small as it is.
          </p>

          <p style={paragraph}>
            <strong>How small?</strong> Physicists measure the mass of tiny particles in <strong>electron-volts</strong> (written <strong>eV</strong>).
            An electron-volt is a very small amount of energy. Energy and mass are linked (E = mc², Spacetime Geometry Experiment 5), so a mass can
            be quoted in eV too. An electron weighs about 511,000 eV. A neutrino weighs less than 0.1 eV, which is millions of times lighter than
            an electron.
          </p>

          <p style={paragraph}>
            <strong>Why weigh a neutrino?</strong> It sounds like a very small thing to care about, but there are three good reasons.
          </p>
          <ul style={{ margin: '0 0 0.75rem', paddingLeft: '1.25rem' }}>
            <li>
              <strong>A mass is a clue that something is missing from physics.</strong> The Standard Model of particle physics is the list of
              the known particles and how they behave (see the CERN page below). In its simplest form, neutrinos have <em>no</em> mass at all. So
              the fact that they have some means the list is incomplete, and the size of the mass is a clue to what is missing. It is like a
              recipe that says “no salt”, when you can taste salt: something else must be in the dish, and how salty it is tells you something
              about what.
            </li>
            <li>
              <strong>We know how far apart the masses are, but not how big they are.</strong> As you will see, experiments that watch
              neutrinos change kind give the <em>gaps</em> between the three masses, and not the masses themselves. The team behind the KATRIN
              experiment, which weighs neutrinos directly, calls the actual scale of neutrino masses “the most important open issue in
              neutrino physics”. The total also bears on which of two possible patterns the masses follow (the normal and inverted
              ordering, explained below).
            </li>
            <li>
              <strong>The sky depends on it, and the sky can check it.</strong> Neutrinos are so numerous that even tiny masses add up to a
              measurable effect on how the universe expanded and how matter clumped into galaxies (the ideas of Cosmology Experiment 9 and of
              Experiment 3 of this group). That means the sky is a second, completely different way of weighing them. If the model of
              the universe is complete, a laboratory and the sky should give the same answer. If they do not, either one has a mistake in it,
              or the model of the universe is missing something too. That is why comparing them is such a good test.
            </li>
          </ul>

          <p style={paragraph}>
            <strong>The cold sea of neutrinos left from the Big Bang.</strong> In the first second after the Big Bang the universe was so hot and
            dense that neutrinos kept colliding with other particles. Then it thinned out enough that they stopped colliding and flew off freely.
            They have been flying ever since, filling all of space. Think of the cosmic microwave background (Cosmology Experiment 3), the
            leftover light of the Big Bang: this is a leftover <em>sea of neutrinos</em>, from an even earlier time. The neutrino sea is a little
            colder than the leftover light. Its temperature today is about {NEUTRINO_TEMPERATURE_TODAY_KELVIN.toFixed(2)} K, against{' '}
            {CMB_TEMPERATURE_TODAY_KELVIN} K for the light, because the light was warmed a little afterwards, when electrons and their
            antimatter partners (positrons) annihilated into light, and the neutrinos, flying freely, were not.
          </p>

          <div style={{ marginBottom: '0.75rem' }}>
            <RelicSeaDrawing />
          </div>
          <div style={{ fontSize: '0.875rem', color: 'var(--text-muted)', marginBottom: '0.75rem' }}>
            <p style={paragraph}>
              <strong>How to read this drawing.</strong> It is an illustration of the idea, not data. Each box is the same small patch of empty
              space, magnified. The sky-blue dots stand for the particles of the leftover light, and the violet dots for the leftover neutrinos.
              The point of the picture is that <strong>both fill all of space</strong>, everywhere, left over from the Big Bang, and that the
              neutrinos are the colder of the two. The number of dots in each box, and their sizes, are for illustration only and do not show
              how many there really are.
            </p>
          </div>

          <p style={paragraph}>
            <strong>“Light-like” and “matter-like”.</strong> A particle behaves like light or like matter depending on how its energy compares
            with its mass. Think of the same ball thrown hard at a wall and rolled gently along the floor. Thrown hard, its energy of motion
            far exceeds anything else about it, and it behaves like a bullet. Rolled gently it is an ordinary slow object. In the same way a
            neutrino has two kinds of energy, the energy of its motion and the energy of its mass (E = mc²). When the universe was young and hot,
            the energy of motion was far bigger, so the neutrinos moved almost at the speed of light and acted like <strong>light</strong>. As
            the universe expanded the sea cooled and the energy of motion fell. Once it fell below the energy of the neutrino’s mass, the
            neutrinos moved slowly and acted like <strong>matter</strong>. Today they act like matter. This switch is one reason a tiny mass
            can leave a mark on the sky.
          </p>

          <p style={paragraph}>
            <strong>Three ways to weigh a neutrino.</strong>
          </p>
          <ul style={{ margin: '0 0 0.75rem', paddingLeft: '1.25rem' }}>
            <li>
              <strong>Watching neutrinos change kind (oscillations).</strong> A neutrino of one kind can turn into another as it flies. That is only
              possible if the kinds have <em>different masses</em>, so seeing it proves that neutrinos have mass. It tells us how far apart the
              masses are, but not how big they are. From the gaps we can work out a <strong>floor</strong>: the three masses together cannot
              add up to less than a certain amount. There are two possible patterns, called the <strong>normal</strong> and the{' '}
              <strong>inverted ordering</strong>, and they have different floors: about 0.059 eV for the normal pattern (one neutrino much heavier
              than the other two) and about 0.10 eV for the inverted one (two heavy ones close together). Think of three people whose weights add
              up to at least some amount, because you know how much heavier one is than another, even though you have not put anyone on the
              scale.
            </li>
            <li>
              <strong>Weighing one directly (the KATRIN experiment).</strong> When a kind of hydrogen called tritium decays, it gives out an
              electron and a neutrino (strictly its antimatter partner, an antineutrino) and shares the energy between them. If the neutrino has mass, a tiny bit of the energy is spent on it,
              and the electrons’ top energy falls just short of what it would be otherwise. KATRIN measures that shortfall very carefully. It has
              not yet seen one, so it gives a <strong>ceiling</strong> on a single neutrino’s mass, a ceiling much higher than the floor.
            </li>
            <li>
              <strong>Weighing the whole sea at once, using the sky.</strong> Even a tiny mass changes how the universe expanded and how matter
              clumped, and surveys of the sky can measure those. This also gives a ceiling, on the three masses added together. DESI, the survey
              of Experiment 2, combined with the microwave background, sets such a ceiling.
            </li>
          </ul>

          <p style={paragraph}>
            <strong>How the sky can weigh them.</strong> This experiment builds three simple reasons a tiny mass leaves a mark. First, <em>when</em>{' '}
            the neutrinos change from light-like to matter-like. Second, <em>how much</em> of the universe’s matter they make up. Third, how much
            they <em>smooth out small clumps</em> of matter (Cosmology Experiment 9 showed how ripples grow into clumps). Think of fine sand mixed
            into a snowdrift: a little extra stuff that will not settle softens the edges of the drifts. One thing to know in advance: these three
            are <strong>not the whole story</strong>. DESI’s limit also depends on how neutrino mass changes the way the universe expanded, and on
            how the microwave background’s light was bent on its way to us, and it comes from a computer fit of everything at once. So this
            experiment cannot reproduce DESI’s number. It shows why the number is possible.
          </p>

          <p style={paragraph}>
            <strong>Not a measurement but a limit.</strong> The sky has so far given a <em>maximum</em>, which scientists call an{' '}
            <strong>upper limit</strong>, and not a value. A “95 percent upper limit” means: “we are 95 percent sure the total mass is below
            this”, in the way you might say you are 95 percent sure a parcel weighs less than a kilogram after lifting it, without knowing
            exactly what it weighs. A limit says how big the quantity could be and still agree with the data.
          </p>

          <div style={{ marginBottom: '0.75rem' }}>
            <p style={{ marginTop: 0, marginBottom: '0.5rem' }}>
              <strong>Some new words.</strong> The “Words and formulas” box above the predictions has each one, with the ones from earlier experiments.
            </p>
            <ul style={{ margin: 0, paddingLeft: '1.25rem' }}>
              <li>
                <strong>Redshift</strong> (reminder from Cosmology Experiments 1 and 3): a way to say how long ago. Today is redshift 0. The
                bigger the number, the longer ago, and a redshift <em>z</em> means the universe was 1 + <em>z</em> times smaller than it is now.
                The microwave background was released at a redshift of {RECOMBINATION_REDSHIFT}.
              </li>
              <li>
                <strong>Floor</strong> and <strong>ceiling</strong>: a minimum and a maximum for the three masses added together.
              </li>
              <li>
                <strong>Tension</strong> (reminder from Experiments 1 to 3): a disagreement between two measurements that is too big to put down
                to chance. A tension is a puzzle, not yet a discovery.
              </li>
            </ul>
          </div>

          <p style={paragraph}>
            <strong>What you will do.</strong> You will make two predictions, press Run to watch the pictures build up one stage at a time, and
            then try a different total mass. Nothing here is graded.
          </p>

          <p style={paragraph}>
            <strong>What we assume.</strong> The total mass is shared <strong>equally</strong> among the three kinds of neutrino (the real masses
            are not equal, but this is the assumption in the papers behind the sky’s limit). A neutrino counts as “matter-like” when the typical
            energy of its motion equals its mass energy, which is a rule of thumb, not a sharp switch. The rest of the universe is taken from
            Planck’s measurements of the microwave background. The limits are quoted as the papers state them. And this experiment cannot say
            whether the disagreement it shows is real.
          </p>

          <p style={{ marginTop: 0, marginBottom: '0.75rem' }}>
            <strong>Want to know more?</strong> Plainer-language pages are listed here. Links to the original scientific papers and to DESI’s own
            pages appear below the results, after you press Run, because their summaries state what the predictions ask, and you should get to
            guess first. Links open in a new tab. This page was written as of October 2026.
          </p>
          <ul style={{ margin: '0.25rem 0 0', paddingLeft: '1.25rem' }}>
            <li>
              <ExternalLink href="https://neutrinos.fnal.gov/whats-a-neutrino/">Fermilab: What’s a neutrino?</ExternalLink>: a plain introduction
              to what neutrinos are, where they come from and why they are hard to catch, including that they have some mass, but not much.
            </li>
            <li>
              <ExternalLink href="https://home.cern/science/physics/standard-model">CERN: The Standard Model</ExternalLink>: the family of known
              particles, where neutrinos sit next to the electron and its heavier cousins, and what the model cannot yet explain.
            </li>
            <li>
              <ExternalLink href="https://www.esa.int/Science_Exploration/Space_Science/Planck/Planck_and_the_cosmic_microwave_background">
                ESA: Planck and the cosmic microwave background
              </ExternalLink>
              : how the Planck satellite mapped the leftover light of the Big Bang, which is where this experiment’s cosmic picture starts.
            </li>
            <li>
              <ExternalLink href="https://www.katrin.kit.edu/">KATRIN: the Karlsruhe Tritium Neutrino experiment</ExternalLink>: the laboratory
              experiment that weighs the neutrino directly, with its set-up, its physics and its latest results.
            </li>
          </ul>
        </div>

        <ReferencePanel entries={REFERENCE_ENTRIES} />

        {/* Picture 1 (Step 2): the timeline and the microwave background's release. The neutrinos' turning-heavy marker and the light-like and
            matter-like bands come with Run (Step 3). */}
        <div style={{ marginBottom: '1rem' }}>
          <svg
            width={VIEW_WIDTH}
            height={height}
            viewBox={`0 0 ${VIEW_WIDTH} ${height}`}
            style={svgStyle}
            role="img"
            aria-label="Timeline of the universe by redshift, with the release of the microwave background marked"
          >
            <text x={AXIS_LEFT} y={22} fill={TEXT_COLOR} fontSize="13" fontWeight="bold">
              Picture 1: when do the neutrinos turn heavy?
            </text>
            <text x={AXIS_LEFT} y={AXIS_Y - 76} fill={MUTED_COLOR} fontSize="11">
              The neutrinos’ turning point is drawn here when Run is built (a later step).
            </text>

            {/* The timeline */}
            <line x1={AXIS_LEFT} y1={AXIS_Y} x2={AXIS_RIGHT} y2={AXIS_Y} stroke={MUTED_COLOR} strokeWidth={1.5} />
            {TICK_REDSHIFTS.map((z) => (
              <g key={z}>
                <line x1={xOfZ(z)} y1={AXIS_Y - 4} x2={xOfZ(z)} y2={AXIS_Y + 4} stroke={MUTED_COLOR} />
                <text x={xOfZ(z)} y={AXIS_Y + 18} fill={MUTED_COLOR} fontSize="11" textAnchor={z === 0 ? 'end' : 'middle'}>
                  {z === 0 ? '0 (today)' : z.toLocaleString('en-US')}
                </text>
              </g>
            ))}
            <text x={(AXIS_LEFT + AXIS_RIGHT) / 2} y={AXIS_Y + 40} fill={TEXT_COLOR} fontSize="12" textAnchor="middle">
              Redshift z (how long ago: bigger means earlier). Not an even scale.
            </text>
            <text x={AXIS_LEFT} y={AXIS_Y + 58} fill={MUTED_COLOR} fontSize="10">
              ← earlier (hotter, smaller universe)
            </text>
            <text x={AXIS_RIGHT} y={AXIS_Y + 58} fill={MUTED_COLOR} fontSize="10" textAnchor="end">
              later (cooler, bigger universe) →
            </text>

            {/* The release of the microwave background */}
            <line x1={releaseX} y1={AXIS_Y - 56} x2={releaseX} y2={AXIS_Y} stroke={LIGHT_COLOR} strokeWidth={2} strokeDasharray="5 3" />
            <circle cx={releaseX} cy={AXIS_Y} r={5} fill={LIGHT_COLOR} />
            <text x={releaseX + 8} y={AXIS_Y - 40} fill={LIGHT_COLOR} fontSize="12">
              The microwave background is released
            </text>
            <text x={releaseX + 8} y={AXIS_Y - 24} fill={LIGHT_COLOR} fontSize="11">
              z = {RECOMBINATION_REDSHIFT}, about {RECOMBINATION_YEARS_AFTER_BIG_BANG.toLocaleString('en-US')} years after the Big Bang
            </text>
          </svg>
        </div>

        {/* Picture 1's guide: draft wording (CLAUDE.md §14 and §29) for the owner's review (§28.1). It does not say where the neutrinos' turning
            point falls relative to the microwave background's release (that is Prediction 1). */}
        <div style={{ fontSize: '0.875rem', color: 'var(--text-muted)', marginBottom: '2rem' }}>
          <p style={paragraph}>
            <strong>How to read this diagram.</strong> This picture is a <strong>timeline of the universe</strong>, laid out like a ruler. It will
            show <em>when</em>, in the history of the universe, the neutrinos change from acting like light to acting like matter. Time is shown by{' '}
            <strong>redshift</strong>, the number <em>z</em> from Cosmology Experiments 1 and 3: <em>z</em> = 0 is today, a bigger <em>z</em> is longer
            ago, and a redshift <em>z</em> means the universe was 1 + <em>z</em> times smaller then than it is now.
          </p>
          <ul style={{ margin: '0 0 0.75rem', paddingLeft: '1.25rem' }}>
            <li>
              <strong>The line and its numbers (0 to 1,000 and a little beyond):</strong> the history of the universe, with today at the right
              end and earlier times to the left. <strong>The scale is not even.</strong> From 10 to 100 to 1,000 each step multiplies the stretching
              (1 + <em>z</em>) by about ten, and each step takes up about the same width on the line, so the early times are not squashed into a
              speck. Between 0 and 10 the step is shorter. Do not read distances along the line as equal stretches of time.
            </li>
            <li>
              <strong>“Earlier” and “later” labels:</strong> the left end is the early, hot, small universe, and the right end is today’s cool,
              big one.
            </li>
            <li>
              <strong>The sky-blue dashed line and dot:</strong> the moment the microwave background (the leftover light of the Big Bang) was
              released, at a redshift of {RECOMBINATION_REDSHIFT}, about {RECOMBINATION_YEARS_AFTER_BIG_BANG.toLocaleString('en-US')} years after
              the Big Bang. At that time the universe was {(RECOMBINATION_REDSHIFT + 1).toLocaleString('en-US', { maximumFractionDigits: 1 })}{' '}
              times smaller than it is now. It is the one fixed marker that the neutrinos’ turning point will be compared with.
            </li>
            <li>
              <strong>What will appear when Run is built:</strong> a violet marker for the redshift at which a neutrino of the mass you choose
              turns from light-like to matter-like, with the earlier part of the line shaded “the neutrinos act like light” and the later part
              “the neutrinos act like matter”.
            </li>
          </ul>
          <p style={paragraph}>
            <strong>A worked moment.</strong> For the microwave background’s release, 1 + <em>z</em> = 1 + {RECOMBINATION_REDSHIFT} ={' '}
            {(RECOMBINATION_REDSHIFT + 1).toLocaleString('en-US', { maximumFractionDigits: 1 })}. So the universe was about{' '}
            {Math.round(RECOMBINATION_REDSHIFT + 1).toLocaleString('en-US')} times smaller than today. A box of space a metre across now was then a
            millimetre across.
          </p>
          <p style={{ marginTop: 0, marginBottom: 0 }}>
            <strong>What to look for after Run:</strong> where the violet marker sits, <em>to the left or to the right</em> of the sky-blue one, and what
            that would mean for the neutrinos at the time the light was released.
          </p>
        </div>
      </div>
    </div>
  )
}
