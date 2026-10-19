import { useEffect, useState } from 'react'
import type { ReactNode } from 'react'
import { ANCHOR_REDSHIFT, brightnessPercentChange, FITS, PUBLISHED_SIGMAS, runEvolvingDarkEnergy } from '../physics/evolvingDarkEnergy'

// Frontier and Beyond, Experiment 2 (docs/experiments/frontier-and-beyond/02-does-dark-energy-change.md).
// Step 2 built the status label, the introduction (with its section on supernovae and its "Want to know more?" links), the choice of
// supernova collection and Picture 1 with its guide (wording approved by the owner on 2026-10-19). Step 3 adds the two predictions, Run,
// the staged run and Pictures 2 and 3 with their guides (draft wording for the owner's review, CLAUDE.md §28.1, written to the standard of
// §29). The "How far back?" control, the results, the "Words and formulas" panel and the tutor come in later steps.
// The interface only displays numbers from src/physics/evolvingDarkEnergy.ts (CLAUDE.md §9). The only calculation here is where a point is drawn.

interface EvolvingDarkEnergyExperimentProps {
  onComplete?: () => void
  onTutorComplete?: () => void
}

const VIEW_WIDTH = 560
const VIEW_HEIGHT = 340
const PLOT_LEFT = 64
const PLOT_RIGHT = 520
const PLOT_TOP = 48
const PLOT_BOTTOM = 252
const RATIO_MIN = 0.6
const RATIO_MAX = 1.4
const REDSHIFT_MAX = 2
const REDSHIFT_TICKS = [2, 1.5, 1, 0.5, 0]
const RATIO_TICKS = [0.6, 0.8, 1, 1.2, 1.4]

const FIT_COLOR = '#fb923c' // orange: the chosen fit
const OTHER_COLOR = '#38bdf8' // sky blue: the other published results
const CONSTANT_COLOR = '#cbd5e1' // light grey: a constant dark energy (the standard model)
const TEXT_COLOR = '#e2e8f0'
const MUTED_COLOR = '#94a3b8'

// Left = far in the past (redshift 2), right = today (redshift 0).
const xOf = (redshift: number) => PLOT_LEFT + ((REDSHIFT_MAX - redshift) / REDSHIFT_MAX) * (PLOT_RIGHT - PLOT_LEFT)
const yOf = (ratio: number) => PLOT_BOTTOM - ((ratio - RATIO_MIN) / (RATIO_MAX - RATIO_MIN)) * (PLOT_BOTTOM - PLOT_TOP)
const fixed2 = (value: number) => value.toFixed(2)
const signed2 = (value: number) => (value < 0 ? `−${Math.abs(value).toFixed(2)}` : value.toFixed(2))
// A published value exactly as written, with a true minus sign.
const published = (value: number) => String(value).replace('-', '−')

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

// The run's stages, in the order the learner sees them (the result does not depend on playback speed, CLAUDE.md §11).
const STAGE_MS = 2600
const STAGES = [
  'Dark energy in the standard model: constant (the grey line in Picture 1)',
  'The fit you chose: how its strength changes (the orange line in Picture 1)',
  'What that does to distances (Picture 2, left)',
  'The same thing in brightness (Picture 2, right)',
  'How strong is the hint? (Picture 3)',
  'Newer results (Picture 3, last row)',
]
const LAST_STAGE = STAGES.length

type DistanceChoice = 'under05' | 'between05and2' | 'between2and5' | 'over5'
const DISTANCE_CHOICES: Array<{ value: DistanceChoice; label: string }> = [
  { value: 'under05', label: 'Less than 0.5 percent' },
  { value: 'between05and2', label: 'Between 0.5 and 2 percent' },
  { value: 'between2and5', label: 'Between 2 and 5 percent' },
  { value: 'over5', label: 'More than 5 percent' },
]

type RecalibrationChoice = 'weaker' | 'same' | 'stronger'
const RECALIBRATION_CHOICES: Array<{ value: RecalibrationChoice; label: string }> = [
  { value: 'weaker', label: 'Weaker' },
  { value: 'same', label: 'About the same' },
  { value: 'stronger', label: 'Stronger' },
]

// Layout of Picture 2: two small charts side by side, both with time running from the far past (left) to today (right).
const P2_TOP = 74
const P2_BOTTOM = 236
const DIST_LEFT = 62
const DIST_RIGHT = 262
const MAG_LEFT = 346
const MAG_RIGHT = 536
const DIST_MIN = -4
const DIST_MAX = 1
const MAG_MIN = -0.07
const MAG_MAX = 0.01
const DIST_TICKS = [-4, -3, -2, -1, 0, 1]
const MAG_TICKS = [-0.06, -0.04, -0.02, 0]
const P2_REDSHIFT_TICKS = [2, 1, 0]
const MARKED_REDSHIFT = 0.5 // the "How far back?" control (a later step) will move this; for now it is the redshift Prediction 1 names

const xIn = (redshift: number, left: number, right: number) => left + ((REDSHIFT_MAX - redshift) / REDSHIFT_MAX) * (right - left)
const yIn = (value: number, min: number, max: number) => P2_BOTTOM - ((value - min) / (max - min)) * (P2_BOTTOM - P2_TOP)

// Layout of Picture 3: one bar for each published result, longest sigma on the right.
const P3_LEFT = 40
const P3_RIGHT = 520
const P3_SIGMA_MAX = 6
const xSigma = (sigma: number) => P3_LEFT + (sigma / P3_SIGMA_MAX) * (P3_RIGHT - P3_LEFT)

export function EvolvingDarkEnergyExperiment({ onComplete }: EvolvingDarkEnergyExperimentProps) {
  const [fitName, setFitName] = useState(FITS[0].name)
  const [distancePrediction, setDistancePrediction] = useState<DistanceChoice | null>(null)
  const [recalibrationPrediction, setRecalibrationPrediction] = useState<RecalibrationChoice | null>(null)
  const [status, setStatus] = useState<'idle' | 'running' | 'complete'>('idle')
  const [stage, setStage] = useState(0)
  const fit = FITS.find((f) => f.name === fitName)!
  // The curve does not depend on the redshift argument; 0.5 is only the default "How far back?" value of a later step.
  const result = runEvolvingDarkEnergy(fit, 0.5)
  const at = (redshift: number) => result.curve.find((r) => r.redshift === redshift)!
  const atHalfSize = at(1)
  const atTwoThirds = at(0.5)
  const path = result.curve.map((r) => `${xOf(r.redshift).toFixed(1)},${yOf(r.densityRatio).toFixed(1)}`).join(' ')
  const bothPredicted = distancePrediction !== null && recalibrationPrediction !== null
  const marked = result.curve.find((r) => r.redshift === MARKED_REDSHIFT)!
  const brighterPercent = brightnessPercentChange(marked.magnitudeDifference)

  // Presentation only: advances one stage at a time. The result does not depend on this timer.
  useEffect(() => {
    if (status !== 'running') return
    const timer = window.setTimeout(() => {
      if (stage < LAST_STAGE) {
        setStage(stage + 1)
      } else {
        setStatus('complete')
        onComplete?.()
      }
    }, STAGE_MS)
    return () => window.clearTimeout(timer)
  }, [status, stage, onComplete])

  const startOver = () => {
    setDistancePrediction(null)
    setRecalibrationPrediction(null)
    setStatus('idle')
    setStage(0)
  }
  const choose = (name: string) => {
    setFitName(name)
    startOver() // Prediction 1 names the collection, so changing it clears both predictions
  }
  const run = () => {
    setStage(1)
    setStatus('running')
  }

  const distPath = result.curve.map((r) => `${xIn(r.redshift, DIST_LEFT, DIST_RIGHT).toFixed(1)},${yIn(r.distanceDifferencePercent, DIST_MIN, DIST_MAX).toFixed(1)}`).join(' ')
  // The brightness chart starts at the anchor (z = 0.05), where the nearby supernovae are lined up and the difference is 0 by construction;
  // the samples at 0 would only show an artefact of that choice.
  const magPoints = [{ redshift: ANCHOR_REDSHIFT, magnitudeDifference: 0 }, ...result.curve.filter((r) => r.redshift > ANCHOR_REDSHIFT)]
  const magPath = magPoints.map((r) => `${xIn(r.redshift, MAG_LEFT, MAG_RIGHT).toFixed(1)},${yIn(r.magnitudeDifference, MAG_MIN, MAG_MAX).toFixed(1)}`).join(' ')
  const sigmaRows = PUBLISHED_SIGMAS
  const P3_ROW = 46
  const P3_FIRST_ROW = 74
  const p3AxisY = P3_FIRST_ROW + sigmaRows.length * P3_ROW + 6
  const p3Height = p3AxisY + 100
  const strongerOrWeaker = (ratio: number) => (ratio > 1 ? 'stronger' : 'weaker')
  const percentFromToday = (ratio: number) => Math.abs(Math.round((ratio - 1) * 100))

  return (
    <div>
      <h2>Experiment 2 — Does Dark Energy Change?</h2>
      <div className="exp-card" style={{ marginTop: '2rem', padding: '1.5rem' }}>
        <p style={{ marginTop: 0, marginBottom: '1.5rem', fontSize: '0.875rem' }}>
          <strong>Where this stands (as of October 2026): Contested.</strong> The data are real and published. What they mean is not agreed.
        </p>

        {/* Introduction: draft wording for the owner's review (CLAUDE.md §28.1), written to the standard of CLAUDE.md §29. It does not say how
            small the distance difference is (Prediction 1) or what the recalibration did (Prediction 2), and it does not say whether the
            newest results point toward a constant dark energy. */}
        <div style={{ marginBottom: '2rem', fontSize: '0.875rem', color: 'var(--text-muted)' }}>
          <p style={paragraph}>
            <strong>The question.</strong> Is dark energy always the same strength, or does it change as the universe grows older?
          </p>

          <p style={paragraph}>
            <strong>Where we left off.</strong> In Cosmology Experiment 5 we saw that the expansion of the universe is <em>speeding up</em>.{' '}
            <strong>Dark energy</strong> is the name for whatever is driving that. Nobody knows what it is. The simplest idea is that it is a
            fixed property of empty space, the same strength at every time. That idea is called a <strong>constant</strong> dark energy, and
            it is part of the standard model of the universe. Think of a thermostat fixed at one setting: the heating never changes. The
            other possibility is a dark energy that <strong>changes</strong>: a thermostat that someone slowly turns up and down as the
            years go by. This experiment is about how scientists try to tell those two apart, and why the answer is still being argued about.
          </p>

          <p style={paragraph}>
            <strong>Why anyone suspects it changes.</strong> A large survey called <strong>DESI</strong> (the Dark Energy Spectroscopic
            Instrument) measured the positions of more than 14 million galaxies and quasars (very bright, very distant galaxy centres).
            Galaxies are not scattered completely at random. In the early universe, sound waves rippled through the hot gas, and they left
            behind a preferred spacing between galaxies of about 500 million light-years. Scientists call this pattern <strong>BAO</strong>{' '}
            (baryon acoustic oscillations). The important point is that the true size of the spacing is known. So how <em>big</em> it looks
            in the sky tells us how far away it is, in the same way that you can judge how far away a telegraph pole is from how small it
            looks, once you know how tall telegraph poles really are. A ruler whose true length you know is called a{' '}
            <strong>standard ruler</strong>.
          </p>
          <p style={paragraph}>
            Scientists then combine this ruler with two other kinds of evidence: the cosmic microwave background (the afterglow of the Big
            Bang, Cosmology Experiment 3) and <strong>supernovae</strong>. The combined data, they report, fit a dark energy that changes
            slightly better than a constant one, by between about 3 and 4 sigma depending on which collection of supernovae is used. (Sigma
            was explained in Experiment 1 of this group: how many “give or takes” a result is away from what a constant dark energy
            predicts. The bigger the number, the harder it is to put the difference down to chance.)
          </p>

          <div style={{ marginBottom: '0.75rem' }}>
            <p style={{ marginTop: 0, marginBottom: '0.5rem' }}>
              <strong>What is a supernova?</strong> Supernovae are used so much in this experiment that it is worth taking a few minutes to
              understand them, one small step at a time.
            </p>
            <ul style={{ margin: 0, paddingLeft: '1.25rem' }}>
              <li>
                <strong>A star is a fire that is slowly running out.</strong> A star shines because, deep inside, it joins tiny particles
                together and gives off energy. The star stays the same size because the push of that energy outward balances the pull of its
                own gravity inward, like a balloon that stays round because the air pushes out while the rubber pulls in. Think of a campfire
                that burns steadily as long as there is wood.
              </li>
              <li>
                <strong>What happens when the fuel runs out.</strong> Eventually the fuel is used up and the outward push stops. A star like
                our Sun then shrinks into a <strong>white dwarf</strong>: the burnt-out core, about the size of the Earth but containing about
                as much material as the Sun, so it is extremely dense. A white dwarf no longer makes new energy. It just slowly cools, like the
                embers when the campfire has died down.
                <br />
                <em>But what stops the white dwarf from being crushed by its own gravity?</em> Once the fuel is gone, gravity keeps pulling
                everything inward, and no fire is pushing back. What holds the white dwarf up is the <strong>electrons</strong>: tiny
                particles that move around the outside of every atom. Electrons follow a strict rule: <strong>no two of them can be in
                exactly the same state</strong>. Think of a theatre where every seat holds one person, and you cannot put two people in the
                same seat, however hard you push. When gravity squeezes the electrons closer together, the “seats” run out, and the electrons
                are forced into states in which they move faster and faster, like people in a crowd that is being squeezed into a smaller
                and smaller room, who jostle harder the tighter they are packed. That fast jostling pushes outward. It is called{' '}
                <strong>electron degeneracy pressure</strong>. It comes from this rule, not from heat, so it keeps pushing even as the white
                dwarf cools down. The push balances gravity, and the white dwarf stays the same size. (It has a limit: a white dwarf heavier
                than about one and a half Suns cannot be held up this way. That limit comes up again below.)
              </li>
              <li>
                <strong>A supernova is a star exploding.</strong> A <strong>supernova</strong> (plural: <strong>supernovae</strong>) is an
                explosion so powerful that it blows a whole star apart. For a few weeks, that one star shines as brightly as a whole galaxy
                of billions of stars. Imagine a single match that, for a few weeks, shone as brightly as a whole city. That is why we can see
                supernovae in galaxies billions of light-years away.
              </li>
              <li>
                <strong>There are different kinds.</strong> The very heaviest stars end their lives in one kind of explosion. The kind used to
                measure distances is called <strong>Type Ia</strong> (said “type one-A”), and it happens to a <strong>white dwarf</strong>.
              </li>
              <li>
                <strong>How a white dwarf explodes.</strong> A white dwarf on its own just cools quietly. But if it has a companion, it can be
                pushed over the edge. It can slowly pull gas off a nearby star, or it can merge with another white dwarf. Either way it gets
                heavier, until its inside becomes so hot and dense that the carbon in it suddenly catches fire all at once, like a heap of dry
                paper that has been getting steadily hotter until it bursts into flame. The fire runs through the whole star within seconds
                and blows it apart. Astronomers are still working out how often each route happens.
              </li>
              <li>
                <strong>Why Type Ia supernovae are useful: nearly the same brightness.</strong> The explosions start from nearly the same
                conditions, because a white dwarf cannot get heavier than a certain limit (about one and a half times the mass of the Sun)
                before it explodes. So their peak brightness is <strong>nearly the same every time</strong>. A small difference remains: the
                brighter ones fade more slowly than the dimmer ones, so astronomers can correct for it by watching how fast each one fades.
              </li>
              <li>
                <strong>From brightness to distance.</strong> Suppose you see street lamps far away in the dark. If you know that all the
                lamps along the road have the same power, then the dimmer one is the farther one. A supernova of known true brightness works
                the same way: <strong>the dimmer it looks, the farther away it is</strong>. (Brightness falls with the square of the distance,
                as in Cosmology Experiment 5.) For example, if one supernova looks 4 times dimmer than another of the same true brightness,
                it is 2 times as far away, because 2 × 2 = 4.
              </li>
              <li>
                <strong>Fixing the true brightness.</strong> To use this, astronomers must first know how bright these explosions really are.
                They find out from supernovae in nearby galaxies whose distances are known another way: from the Cepheid stars of Experiment
                1 of this group. That is the distance ladder again.
              </li>
              <li>
                <strong>Catching one.</strong> A supernova shines for only a few weeks, and nobody knows in advance which star will explode.
                So astronomers photograph the same large patches of sky again and again and look for a new bright dot that was not there
                before, as you might spot a new light on a hillside that you look at every night. Then they follow it as it brightens and
                fades.
              </li>
              <li>
                <strong>The two numbers each supernova gives.</strong> First, <strong>how dim it looks</strong>, which gives its distance.
                Second, its <strong>redshift</strong>: the light of the galaxy it is in has been stretched on its way to us by the expansion
                of the universe, so the redshift says how much the universe has grown since the light set out (Cosmology Experiment 1). A
                redshift of 1, written z = 1, means the universe was half its present size when the light set out. Together the two numbers
                say how far away something is and how much the universe has expanded since, which is exactly what is needed to ask how the
                expansion has changed.
              </li>
              <li>
                <strong>What a “supernova collection” is.</strong> It is a list of such measurements, gathered by different telescopes and
                calibrated in different ways. Different collections can give slightly different answers. That is why this experiment lets
                you choose one.
              </li>
            </ul>
          </div>

          <p style={paragraph}>
            <strong>Describing a dark energy that changes.</strong> Scientists describe a dark energy with a number called <strong>w</strong>.
            It says how the dark energy’s density changes as the universe grows. If <strong>w = −1</strong>, the density stays exactly the
            same: that is the constant dark energy. If w is <strong>above −1</strong>, the density thins out as space grows, like a gas
            spreading into a bigger room. If w is <strong>below −1</strong>, the density grows. To describe a dark energy whose w itself
            changes with time, two numbers are used: <strong>w₀</strong>, the value of w today, and <strong>wₐ</strong>, which says how much w
            was different in the past. A constant dark energy is w₀ = −1 and wₐ = 0. You do not need to remember the formula. The pictures
            show what the numbers mean.
          </p>

          <p style={paragraph}>
            <strong>What you will do.</strong> You choose one of three supernova collections, make two predictions, and press Run. The
            pictures will show how the dark energy’s strength changes over cosmic time in the best-fitting description, how much that changes
            the distance to a galaxy, and how strong the claimed evidence is. Nothing here is graded.
          </p>

          <p style={paragraph}>
            <strong>What we assume.</strong> The universe contains only matter and dark energy. (Light left over from the Big Bang has
            some effect too, but it is small for the times we look at, which stay at redshifts below 2, and leaving it out keeps the picture
            simple.) Each description of dark energy is compared with a constant dark energy that has the same amount of matter, so the
            only difference is whether dark energy changes. The scientists’ own analyses fit each model separately, so their comparison is
            subtler. The description with w₀ and wₐ is the simplest curve that fits the data in the range where there are data. It is not
            known to be what dark energy really does, and it is not extended to the far past. We use the best-fitting values published by
            the scientists, and we quote their sigma values rather than calculate them. This experiment cannot tell you whether dark
            energy changes.
          </p>

          <p style={{ marginTop: 0, marginBottom: 0 }}>
            <strong>Want to know more?</strong> These are the original scientific papers and official pages. Links open in a new tab. This
            page was written as of October 2026.
          </p>
          <ul style={{ margin: '0.25rem 0 0.75rem', paddingLeft: '1.25rem' }}>
            <li>
              <ExternalLink href="https://arxiv.org/abs/2503.14738">DESI DR2 Results II (March 2025)</ExternalLink>: the scientific paper
              behind the numbers on this page. It uses technical words. It opens on arxiv.org, the free site where scientists post their papers.
            </li>
            <li>
              <ExternalLink href="https://www.desi.lbl.gov/2025/03/19/desi-dr2-results-march-19-guide/">
                DESI: DR2 Results, March 19 guide
              </ExternalLink>
              : DESI’s own guide to its March 2025 release, from the team that ran the survey.
            </li>
          </ul>
          <p style={{ marginTop: 0, marginBottom: 0 }}>
            <strong>Want it explained in plainer words?</strong> These pages are written for the public, by NASA and the European Space Agency
            (ESA).
          </p>
          <ul style={{ margin: '0.25rem 0 0', paddingLeft: '1.25rem' }}>
            <li>
              <ExternalLink href="https://science.nasa.gov/dark-energy/">NASA: What is Dark Energy?</ExternalLink>: what dark energy is, what
              the leading ideas about it are, and why it is called the biggest mystery in cosmology.
            </li>
            <li>
              <ExternalLink href="https://science.nasa.gov/mission/hubble/science/science-behind-the-discoveries/hubble-stellar-explosions/">
                NASA: Stellar Explosions
              </ExternalLink>
              : how Type Ia supernovae happen and why astronomers use them as “standard candles” to measure distance.
            </li>
            <li>
              <ExternalLink href="https://esahubble.org/wordbank/supernova/">ESA/Hubble: Supernova</ExternalLink>: what a supernova is, with
              Hubble’s pictures of supernovae.
            </li>
          </ul>
        </div>

        {/* The choice of supernova collection (specification, Learner Controls). */}
        <div style={{ marginBottom: '2rem' }}>
          <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold' }}>
            Which supernova collection should the dark energy description be fitted with?
          </label>
          <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)', marginTop: 0, marginBottom: '0.75rem' }}>
            In each case the scientists combined DESI’s galaxy ruler, the cosmic microwave background and that collection of supernovae, and
            found the values of w₀, wₐ and the amount of matter that fit best.
          </p>
          <div>
            {FITS.map((f) => (
              <button
                key={f.name}
                type="button"
                onClick={() => choose(f.name)}
                disabled={status === 'running'}
                className={`toggle-button${f.name === fitName ? ' is-selected' : ''}`}
                style={{ marginRight: '0.5rem', marginBottom: '0.5rem', padding: '0.5rem 1rem', fontSize: '0.875rem' }}
              >
                {f.name}
              </button>
            ))}
          </div>
          <p style={{ fontSize: '0.875rem', marginTop: '0.5rem', marginBottom: 0 }}>
            <strong>{fit.name}:</strong> w₀ = {published(fit.w0)}, wₐ = {published(fit.wa)}, matter fraction ={' '}
            {fit.omegaMatter}. Source: {fit.source}, Table 5.
          </p>
        </div>

        {/* The two predictions: draft wording for the owner's review (CLAUDE.md §28.1), from the specification's "Prediction Activity". Neither says
            which answer is right. */}
        {(
          [
            {
              title: 'Prediction 1: how different would the distance look?',
              text: (
                <>
                  Suppose dark energy changed with time in the way the fit with <strong>{fit.name}</strong> describes. A galaxy whose light was sent
                  out when the universe was about two thirds of its present size (redshift 0.5) would be at a certain distance if dark energy
                  were constant. How much different would its distance be if dark energy changed this way?
                </>
              ),
              choices: DISTANCE_CHOICES,
              value: distancePrediction,
              set: (v: DistanceChoice) => setDistancePrediction(v),
            },
            {
              title: 'Prediction 2: what did the recalibration do?',
              text: (
                <>
                  The Dark Energy Survey’s supernova collection (DES Y5) gave a 4.2 sigma preference for changing dark energy when combined with
                  DESI and the microwave background. In 2025 the team improved how they calibrated the brightness of their supernovae (how they
                  checked that a given brightness really means a given distance). After that, did the preference become <strong>weaker</strong>,{' '}
                  stay <strong>about the same</strong>, or become <strong>stronger</strong>?
                </>
              ),
              choices: RECALIBRATION_CHOICES,
              value: recalibrationPrediction,
              set: (v: RecalibrationChoice) => setRecalibrationPrediction(v),
            },
          ] as const
        ).map((question) => (
          <div key={question.title} style={{ marginBottom: '2rem' }}>
            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold' }}>{question.title}</label>
            <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)', marginTop: 0, marginBottom: '0.75rem' }}>
              {question.text} You are not graded, and a guess is fine.
            </p>
            <div>
              {(question.choices as ReadonlyArray<{ value: string; label: string }>).map((choice) => (
                <button
                  key={choice.value}
                  type="button"
                  onClick={() => (question.set as (v: never) => void)(choice.value as never)}
                  disabled={status !== 'idle'}
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

        <button type="button" className="action-button" onClick={run} disabled={!bothPredicted || status !== 'idle'} style={{ padding: '0.6rem 1.5rem' }}>
          {status === 'running' ? 'Running...' : 'Run'}
        </button>
        {status === 'complete' && (
          <button type="button" className="secondary-button" onClick={startOver} style={{ marginLeft: '0.75rem', padding: '0.6rem 1.25rem' }}>
            Start over
          </button>
        )}
        {!bothPredicted && status === 'idle' && (
          <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: 0 }}>Answer both predictions above to run the experiment.</p>
        )}

        {/* The run's stage, named (CLAUDE.md §14): what the learner is looking at now. */}
        <p style={{ fontSize: '0.875rem', margin: '1.5rem 0 0.75rem', minHeight: '1.5rem' }}>
          {status === 'idle' && <span style={{ color: 'var(--text-muted)' }}>More pictures appear below, one stage at a time, after you press Run.</span>}
          {status !== 'idle' && (
            <>
              <strong>{status === 'complete' ? 'Run complete' : `Stage ${stage} of ${LAST_STAGE}`}</strong>
              {status === 'running' && <>: {STAGES[stage - 1]}</>}
              {status === 'complete' && <span style={{ color: 'var(--text-muted)' }}> (all {LAST_STAGE} stages shown). Your predictions are recorded and not marked here.</span>}
            </>
          )}
        </p>

        {/* Picture 1: how strong dark energy is compared with today. It does not depend on a run. */}
        <div style={{ marginBottom: '1rem' }}>
          <p style={{ marginTop: 0, marginBottom: '0.5rem', fontWeight: 'bold' }}>Picture 1: How strong is dark energy, compared with today?</p>
          <svg
            width={VIEW_WIDTH}
            height={VIEW_HEIGHT}
            viewBox={`0 0 ${VIEW_WIDTH} ${VIEW_HEIGHT}`}
            style={svgStyle}
            role="img"
            aria-label={`Dark energy's density compared with today's, from redshift 2 to today, for a constant dark energy and for the fit with ${fit.name}`}
          >
            {/* Gridlines and axes */}
            {RATIO_TICKS.map((t) => (
              <g key={t}>
                <line x1={PLOT_LEFT} y1={yOf(t)} x2={PLOT_RIGHT} y2={yOf(t)} stroke={MUTED_COLOR} strokeOpacity={0.25} />
                <text x={PLOT_LEFT - 8} y={yOf(t) + 4} fill={MUTED_COLOR} fontSize="11" textAnchor="end">
                  {t.toFixed(1)}×
                </text>
              </g>
            ))}
            <line x1={PLOT_LEFT} y1={PLOT_BOTTOM} x2={PLOT_RIGHT} y2={PLOT_BOTTOM} stroke={MUTED_COLOR} strokeWidth={1.5} />
            {REDSHIFT_TICKS.map((z) => (
              <g key={z}>
                <line x1={xOf(z)} y1={PLOT_BOTTOM - 4} x2={xOf(z)} y2={PLOT_BOTTOM + 4} stroke={MUTED_COLOR} />
                <text x={xOf(z)} y={PLOT_BOTTOM + 18} fill={MUTED_COLOR} fontSize="11" textAnchor="middle">
                  {z === 0 ? 'today' : `z = ${z}`}
                </text>
                <text x={xOf(z)} y={PLOT_BOTTOM + 32} fill={MUTED_COLOR} fontSize="10" textAnchor="middle">
                  {z === 0 ? 'full size' : `size ${fixed2(1 / (1 + z))}`}
                </text>
              </g>
            ))}
            <text x={(PLOT_LEFT + PLOT_RIGHT) / 2} y={PLOT_BOTTOM + 54} fill={TEXT_COLOR} fontSize="12" textAnchor="middle">
              How far back in time (z is the redshift; “size” is the universe’s size compared with today)
            </text>
            <text x={14} y={(PLOT_TOP + PLOT_BOTTOM) / 2} fill={TEXT_COLOR} fontSize="11" textAnchor="middle" transform={`rotate(-90 14 ${(PLOT_TOP + PLOT_BOTTOM) / 2})`}>
              Dark energy’s density, compared with today’s
            </text>

            {/* A constant dark energy: always 1 times today's */}
            <line x1={PLOT_LEFT} y1={yOf(1)} x2={PLOT_RIGHT} y2={yOf(1)} stroke={CONSTANT_COLOR} strokeWidth={2} strokeDasharray="6 4" />
            <text x={PLOT_LEFT + 6} y={yOf(1) - 18} fill={CONSTANT_COLOR} fontSize="11">
              constant dark energy
            </text>
            <text x={PLOT_LEFT + 6} y={yOf(1) - 5} fill={CONSTANT_COLOR} fontSize="11">
              (standard model): always 1×
            </text>

            {/* The chosen fit */}
            <polyline points={path} fill="none" stroke={FIT_COLOR} strokeWidth={3} />
            <text x={PLOT_LEFT + 6} y={PLOT_TOP - 22} fill={FIT_COLOR} fontSize="12">
              Fit with {fit.name}: w₀ = {published(fit.w0)}, wₐ = {published(fit.wa)}
            </text>
            <text x={PLOT_LEFT + 6} y={PLOT_TOP - 8} fill={MUTED_COLOR} fontSize="10">
              (the best-fitting description, not a known fact)
            </text>

            {/* Today: both lines meet at 1 */}
            <circle cx={xOf(0)} cy={yOf(1)} r={5} fill={TEXT_COLOR} />
            <text x={xOf(0) + 4} y={yOf(1) + 22} fill={TEXT_COLOR} fontSize="11" textAnchor="end">
              today: both are 1×
            </text>

            {/* Direction labels */}
            <text x={PLOT_RIGHT} y={PLOT_TOP + 4} fill={MUTED_COLOR} fontSize="10" textAnchor="end">
              ↑ stronger than today
            </text>
            <text x={PLOT_RIGHT} y={PLOT_BOTTOM - 8} fill={MUTED_COLOR} fontSize="10" textAnchor="end">
              ↓ weaker than today
            </text>
          </svg>
        </div>

        {/* Picture 1's guide: draft wording (CLAUDE.md §14 and §29). It does not mention distances or sigma values, which the predictions ask about. */}
        <div style={{ fontSize: '0.875rem', color: 'var(--text-muted)' }}>
          <p style={paragraph}>
            <strong>How to read this diagram.</strong> This picture answers one question about the description you chose: <em>according to
            the best-fitting values, how strong was dark energy at different times in the past, compared with today?</em> Time runs from the
            far past on the left to today on the right.
          </p>
          <p style={{ marginTop: 0, marginBottom: '0.5rem' }}>What is drawn:</p>
          <ul style={{ margin: '0 0 0.75rem', paddingLeft: '1.25rem' }}>
            <li>
              <strong>The bottom line (the “time” axis).</strong> It is marked in <strong>redshift</strong>, z. A redshift of 1 means the
              universe was half its present size, so “size 0.50” is written under z = 1. The mark z = 2 means the universe was one third of
              its present size (“size 0.33”). The mark on the right, “today”, is the universe at its present size. We stop at z = 2, because
              the data used to find these values do not reach farther back.
            </li>
            <li>
              <strong>The side line (the “strength” axis).</strong> The numbers 0.6× to 1.4× say how the dark energy’s <strong>density</strong>{' '}
              (how much dark energy there is in each cubic metre of space) compared with today’s. 1× means the same as today, 1.2× means 20
              percent more than today, and 0.8× means 20 percent less.
            </li>
            <li>
              <strong>The grey dashed line.</strong> This is a <strong>constant dark energy</strong>, the standard model. It is flat at 1×,
              because a constant dark energy has the same density at every time.
            </li>
            <li>
              <strong>The orange line.</strong> This is the dark energy described by the values you chose, for {fit.name}. It uses w₀ ={' '}
              {published(fit.w0)} and wₐ = {published(fit.wa)}. Where it is above the grey line, that description has the dark energy{' '}
              <em>stronger</em> than today; where it is below, <em>weaker</em>.
            </li>
            <li>
              <strong>The white dot.</strong> Today. Both lines meet here at 1×, because everything is compared with today’s value.
            </li>
          </ul>
          <p style={paragraph}>
            <strong>A worked moment, with your numbers.</strong> Look at z = 1, when the universe was half its present size. The orange line
            there is at {fixed2(atHalfSize.densityRatio)}×. So in this description, dark energy back then had{' '}
            {fixed2(atHalfSize.densityRatio)} times today’s density: {percentFromToday(atHalfSize.densityRatio)} percent{' '}
            {strongerOrWeaker(atHalfSize.densityRatio)} than today. At z = 0.5, when the universe was two thirds of its present size, it is at{' '}
            {fixed2(atTwoThirds.densityRatio)}×, which is {percentFromToday(atTwoThirds.densityRatio)} percent{' '}
            {strongerOrWeaker(atTwoThirds.densityRatio)} than today. (The reading at z = 1 uses w = {signed2(atHalfSize.equationOfState)}{' '}
            then, compared with {published(fit.w0)} today.)
          </p>
          <p style={{ marginTop: 0, marginBottom: '0.5rem' }}>What to look for, and what it would mean:</p>
          <ul style={{ margin: 0, paddingLeft: '1.25rem' }}>
            <li>
              <strong>How far the orange line is from the grey one.</strong> If the two lines were on top of each other, the description
              would be a constant dark energy. The farther apart they are, the more this description says dark energy has changed.
            </li>
            <li>
              <strong>Where the orange line is above, and where it is below, the grey line.</strong> The shape is the description’s own
              prediction for how dark energy has changed. Try the other two collections and see whether the shape is the same.
            </li>
            <li>
              <strong>Whether the three collections agree.</strong> Each fit comes from the same galaxy ruler and microwave background but a
              different supernova collection. If the true answer were fixed, you might hope that all three would give the same line.
            </li>
            <li>
              <strong>A caution.</strong> The orange line is the <em>simplest curve with two numbers</em> that fits the data. It is not
              known that dark energy really behaves like this. Do not read the far left of the line as fact: the data barely reach that far back.
            </li>
          </ul>
        </div>

        {/* Picture 2: what the change does to distances and brightness. Appears when Run is pressed; the left chart at stage 3, the right at stage 4. */}
        {status !== 'idle' && (
          <div style={{ marginTop: '2rem' }}>
            <svg
              width={VIEW_WIDTH}
              height={320}
              viewBox={`0 0 ${VIEW_WIDTH} 320`}
              style={svgStyle}
              role="img"
              aria-label={`How much nearer or farther a galaxy would look, and how much brighter or fainter a supernova, if dark energy changed as in the fit with ${fit.name}, compared with a constant dark energy`}
            >
              <text x={PLOT_LEFT - 24} y={22} fill={TEXT_COLOR} fontSize="13" fontWeight="bold">
                Picture 2: how much would a changing dark energy change what we see?
              </text>

              {stage >= 3 && (
                <g>
                  <text x={DIST_LEFT} y={48} fill={TEXT_COLOR} fontSize="12" fontWeight="bold">
                    Distance
                  </text>
                  <text x={DIST_LEFT} y={62} fill={MUTED_COLOR} fontSize="10">
                    percent different from a constant dark energy
                  </text>
                  {DIST_TICKS.map((t) => (
                    <g key={t}>
                      <line x1={DIST_LEFT} y1={yIn(t, DIST_MIN, DIST_MAX)} x2={DIST_RIGHT} y2={yIn(t, DIST_MIN, DIST_MAX)} stroke={MUTED_COLOR} strokeOpacity={0.25} />
                      <text x={DIST_LEFT - 6} y={yIn(t, DIST_MIN, DIST_MAX) + 4} fill={MUTED_COLOR} fontSize="10" textAnchor="end">
                        {t > 0 ? `+${t}` : t < 0 ? `−${Math.abs(t)}` : '0'} %
                      </text>
                    </g>
                  ))}
                  <line x1={DIST_LEFT} y1={yIn(0, DIST_MIN, DIST_MAX)} x2={DIST_RIGHT} y2={yIn(0, DIST_MIN, DIST_MAX)} stroke={CONSTANT_COLOR} strokeWidth={2} strokeDasharray="6 4" />
                  <text x={DIST_LEFT + 4} y={yIn(0, DIST_MIN, DIST_MAX) - 5} fill={CONSTANT_COLOR} fontSize="10">
                    constant dark energy: 0 %
                  </text>
                  <polyline points={distPath} fill="none" stroke={FIT_COLOR} strokeWidth={3} />
                  <circle cx={xIn(MARKED_REDSHIFT, DIST_LEFT, DIST_RIGHT)} cy={yIn(marked.distanceDifferencePercent, DIST_MIN, DIST_MAX)} r={5} fill={FIT_COLOR} stroke={TEXT_COLOR} />
                  <text x={xIn(MARKED_REDSHIFT, DIST_LEFT, DIST_RIGHT)} y={yIn(marked.distanceDifferencePercent, DIST_MIN, DIST_MAX) + 18} fill={FIT_COLOR} fontSize="11" textAnchor="middle">
                    z = {MARKED_REDSHIFT}: {signed2(marked.distanceDifferencePercent)} %
                  </text>
                  <line x1={DIST_LEFT} y1={P2_BOTTOM} x2={DIST_RIGHT} y2={P2_BOTTOM} stroke={MUTED_COLOR} strokeWidth={1.5} />
                  {P2_REDSHIFT_TICKS.map((z) => (
                    <g key={z}>
                      <line x1={xIn(z, DIST_LEFT, DIST_RIGHT)} y1={P2_BOTTOM - 4} x2={xIn(z, DIST_LEFT, DIST_RIGHT)} y2={P2_BOTTOM + 4} stroke={MUTED_COLOR} />
                      <text x={xIn(z, DIST_LEFT, DIST_RIGHT)} y={P2_BOTTOM + 17} fill={MUTED_COLOR} fontSize="10" textAnchor="middle">
                        {z === 0 ? 'today' : `z = ${z}`}
                      </text>
                    </g>
                  ))}
                  <text x={(DIST_LEFT + DIST_RIGHT) / 2} y={P2_BOTTOM + 34} fill={MUTED_COLOR} fontSize="10" textAnchor="middle">
                    far past ← time → today
                  </text>
                  <text x={DIST_LEFT + 4} y={yIn(0, DIST_MIN, DIST_MAX) + 14} fill={MUTED_COLOR} fontSize="9">
                    ↓ below the line: nearer
                  </text>
                </g>
              )}

              {stage >= 4 && (
                <g>
                  <text x={MAG_LEFT} y={48} fill={TEXT_COLOR} fontSize="12" fontWeight="bold">
                    Brightness of a supernova
                  </text>
                  <text x={MAG_LEFT} y={62} fill={MUTED_COLOR} fontSize="10">
                    magnitude difference, nearby lined up
                  </text>
                  {MAG_TICKS.map((t) => (
                    <g key={t}>
                      <line x1={MAG_LEFT} y1={yIn(t, MAG_MIN, MAG_MAX)} x2={MAG_RIGHT} y2={yIn(t, MAG_MIN, MAG_MAX)} stroke={MUTED_COLOR} strokeOpacity={0.25} />
                      <text x={MAG_LEFT - 6} y={yIn(t, MAG_MIN, MAG_MAX) + 4} fill={MUTED_COLOR} fontSize="10" textAnchor="end">
                        {t === 0 ? '0' : `−${Math.abs(t).toFixed(2)}`}
                      </text>
                    </g>
                  ))}
                  <line x1={MAG_LEFT} y1={yIn(0, MAG_MIN, MAG_MAX)} x2={MAG_RIGHT} y2={yIn(0, MAG_MIN, MAG_MAX)} stroke={CONSTANT_COLOR} strokeWidth={2} strokeDasharray="6 4" />
                  <text x={MAG_LEFT + 4} y={yIn(0, MAG_MIN, MAG_MAX) - 5} fill={CONSTANT_COLOR} fontSize="10">
                    constant dark energy: 0
                  </text>
                  <polyline points={magPath} fill="none" stroke={FIT_COLOR} strokeWidth={3} />
                  <circle cx={xIn(ANCHOR_REDSHIFT, MAG_LEFT, MAG_RIGHT)} cy={yIn(0, MAG_MIN, MAG_MAX)} r={3} fill={TEXT_COLOR} />
                  <text x={MAG_RIGHT} y={yIn(0, MAG_MIN, MAG_MAX) - 22} fill={MUTED_COLOR} fontSize="9" textAnchor="end">
                    lined up here (z = {ANCHOR_REDSHIFT})
                  </text>
                  <circle cx={xIn(MARKED_REDSHIFT, MAG_LEFT, MAG_RIGHT)} cy={yIn(marked.magnitudeDifference, MAG_MIN, MAG_MAX)} r={5} fill={FIT_COLOR} stroke={TEXT_COLOR} />
                  <text x={xIn(MARKED_REDSHIFT, MAG_LEFT, MAG_RIGHT)} y={yIn(marked.magnitudeDifference, MAG_MIN, MAG_MAX) + 18} fill={FIT_COLOR} fontSize="11" textAnchor="middle">
                    z = {MARKED_REDSHIFT}: {signed2(marked.magnitudeDifference)}
                  </text>
                  <line x1={MAG_LEFT} y1={P2_BOTTOM} x2={MAG_RIGHT} y2={P2_BOTTOM} stroke={MUTED_COLOR} strokeWidth={1.5} />
                  {P2_REDSHIFT_TICKS.map((z) => (
                    <g key={z}>
                      <line x1={xIn(z, MAG_LEFT, MAG_RIGHT)} y1={P2_BOTTOM - 4} x2={xIn(z, MAG_LEFT, MAG_RIGHT)} y2={P2_BOTTOM + 4} stroke={MUTED_COLOR} />
                      <text x={xIn(z, MAG_LEFT, MAG_RIGHT)} y={P2_BOTTOM + 17} fill={MUTED_COLOR} fontSize="10" textAnchor="middle">
                        {z === 0 ? 'today' : `z = ${z}`}
                      </text>
                    </g>
                  ))}
                  <text x={(MAG_LEFT + MAG_RIGHT) / 2} y={P2_BOTTOM + 34} fill={MUTED_COLOR} fontSize="10" textAnchor="middle">
                    far past ← time → today
                  </text>
                  <text x={MAG_LEFT + 4} y={yIn(0, MAG_MIN, MAG_MAX) + 14} fill={MUTED_COLOR} fontSize="9">
                    ↓ below the line: brighter
                  </text>
                </g>
              )}
              <text x={PLOT_LEFT - 24} y={296} fill={MUTED_COLOR} fontSize="10">
                orange: the fit with {fit.name}; dashed grey: a constant dark energy with the same amount of matter
              </text>
            </svg>

            {/* Picture 2's guide: draft wording (CLAUDE.md §14 and §29) for the owner's review (§28.1). It is shown after the run, so it can say
                what the chart shows. It does not say whether the difference is "large" or "small": the results and tutor come later. */}
            <div style={{ marginTop: '1rem', marginBottom: '2rem', fontSize: '0.875rem', color: 'var(--text-muted)' }}>
              <p style={paragraph}>
                <strong>How to read this diagram.</strong> Picture 1 showed how the dark energy’s <em>density</em> changes in the description you
                chose. This picture shows what that would do to something we can actually measure: how far away things <em>look</em>. It has
                two small charts of the same effect, one in distance and one in brightness. In both, the dashed grey line is a{' '}
                <strong>constant dark energy</strong> (the standard model), which is the comparison, and the orange line is the description you
                chose. Time runs from the far past on the left to today on the right, as in Picture 1.
              </p>
              <p style={{ marginTop: 0, marginBottom: '0.5rem' }}>
                <strong>The left chart: distance.</strong> It appears first, at stage 3.
              </p>
              <ul style={{ margin: '0 0 0.75rem', paddingLeft: '1.25rem' }}>
                <li>
                  <strong>The side line (−4 % to +1 %):</strong> how much <em>different</em>, in percent, the distance to a galaxy would be, compared
                  with a constant dark energy. 0 % means the same. −2 % means 2 percent <em>nearer</em>. A plus sign would mean farther.
                </li>
                <li>
                  <strong>The bottom line:</strong> the time the light set out, marked by redshift as in Picture 1: z = 2 (the universe one third of
                  its present size), z = 1 (half) and today.
                </li>
                <li>
                  <strong>The grey dashed line at 0 %:</strong> a constant dark energy. Nothing differs from it, by definition.
                </li>
                <li>
                  <strong>The orange line and its dot:</strong> your description. The dot is at z = {MARKED_REDSHIFT}, when the universe was two
                  thirds of its present size, with its value written below it. This is the galaxy that Prediction 1 asked about.
                </li>
              </ul>
              <p style={{ marginTop: 0, marginBottom: '0.5rem' }}>
                <strong>The right chart: brightness.</strong> It appears next, at stage 4. Supernovae give distances by how dim they look, so a
                survey sees a change of distance as a change of brightness.
              </p>
              <ul style={{ margin: '0 0 0.75rem', paddingLeft: '1.25rem' }}>
                <li>
                  <strong>Magnitude</strong> is the scale astronomers use for brightness, and it runs backwards: a <em>smaller</em> number is
                  <em> brighter</em>. A difference of 2.5 magnitudes is a factor of 10 in brightness, and a difference of 0.1 magnitudes is
                  about 10 percent. So here a number below zero means the supernova looks <em>brighter</em> than it would with a constant dark
                  energy.
                </li>
                <li>
                  <strong>“Nearby ones lined up”:</strong> a supernova survey cannot tell by itself how fast the universe is expanding today
                  (the Hubble constant of Experiment 1). So the comparison lines up the nearby supernovae (at redshift 0.05) so that both agree
                  there, and then shows how the farther ones differ. The small white dot, “lined up here”, marks that point, which is why the orange line starts at 0 there and stops. This is the part of the effect that a supernova survey can really use.
                </li>
                <li>
                  <strong>The orange line and its dot:</strong> the brightness difference for your description, with the dot again at z ={' '}
                  {MARKED_REDSHIFT}.
                </li>
              </ul>
              <p style={paragraph}>
                <strong>A worked moment, with your numbers.</strong> Suppose a constant dark energy would put a galaxy at redshift {MARKED_REDSHIFT}{' '}
                exactly 100 units of distance away. With the description you chose ({fit.name}), the dot says it would be at{' '}
                {fixed2(100 + marked.distanceDifferencePercent)} units: {fixed2(Math.abs(marked.distanceDifferencePercent))} percent{' '}
                {marked.distanceDifferencePercent < 0 ? 'nearer' : 'farther'}. In brightness, the dot is at {signed2(marked.magnitudeDifference)}{' '}
                magnitudes, which is about {fixed2(Math.abs(brighterPercent))} percent {brighterPercent > 0 ? 'brighter' : 'fainter'} than the
                constant case (once the nearby supernovae are lined up).
              </p>
              <p style={{ marginTop: 0, marginBottom: '0.5rem' }}>What to look for, and what it would mean:</p>
              <ul style={{ margin: 0, paddingLeft: '1.25rem' }}>
                <li>
                  <strong>How low the orange line goes, compared with the 0 % line.</strong> The lower it goes, the easier it is for a survey to
                  notice the difference. A difference that is smaller than the survey’s own measurement uncertainty cannot be seen at all.
                </li>
                <li>
                  <strong>Where the difference is largest.</strong> A survey that gathers many supernovae near that redshift can tell the models
                  apart best. Compare the position of the lowest point with the picture of dark energy’s density in Picture 1.
                </li>
                <li>
                  <strong>The difference at the far left.</strong> It is smaller there than in the middle. It is worth asking why a very
                  different density in the far past matters less for what we see.
                </li>
                <li>
                  <strong>Compare the three collections.</strong> Choose another collection (the predictions will be cleared) and see whether the
                  difference is larger or smaller.
                </li>
              </ul>
            </div>
          </div>
        )}

        {/* Picture 3: how strong is the claimed hint. Appears at stage 5; the last row at stage 6. */}
        {status !== 'idle' && stage >= 5 && (
          <div style={{ marginTop: '2rem' }}>
            <svg
              width={VIEW_WIDTH}
              height={p3Height}
              viewBox={`0 0 ${VIEW_WIDTH} ${p3Height}`}
              style={svgStyle}
              role="img"
              aria-label="The published sigma values for the preference for a changing dark energy, with lines at 3 and 5 sigma"
            >
              <text x={P3_LEFT} y={22} fill={TEXT_COLOR} fontSize="13" fontWeight="bold">
                Picture 3: how strong is the claimed hint?
              </text>
              {[3, 5].map((mark) => (
                <g key={mark}>
                  <line x1={xSigma(mark)} y1={50} x2={xSigma(mark)} y2={p3AxisY} stroke={CONSTANT_COLOR} strokeDasharray="5 4" />
                  <text x={xSigma(mark)} y={44} fill={CONSTANT_COLOR} fontSize="10" textAnchor="middle">
                    {mark === 3 ? '3: often called evidence' : '5: the usual bar for a discovery'}
                  </text>
                </g>
              ))}
              {sigmaRows.map((row, i) => {
                const y = P3_FIRST_ROW + i * P3_ROW
                const chosen = row.name === fit.name
                return (
                  <g key={row.name}>
                    <text x={P3_LEFT} y={y - 6} fill={chosen ? FIT_COLOR : TEXT_COLOR} fontSize="12" fontWeight={chosen ? 'bold' : 'normal'}>
                      {row.name}
                      {chosen ? ' (your choice)' : ''}
                    </text>
                    <rect x={P3_LEFT} y={y} width={xSigma(row.sigma) - P3_LEFT} height={18} fill={chosen ? FIT_COLOR : OTHER_COLOR} opacity={chosen ? 1 : 0.8} />
                    <text x={xSigma(row.sigma) + 6} y={y + 13} fill={TEXT_COLOR} fontSize="12" stroke="#0b1020" strokeWidth={3} paintOrder="stroke">
                      {row.sigma.toFixed(1)} sigma
                    </text>
                  </g>
                )
              })}
              <line x1={P3_LEFT} y1={p3AxisY} x2={P3_RIGHT} y2={p3AxisY} stroke={MUTED_COLOR} strokeWidth={1.5} />
              {[0, 1, 2, 3, 4, 5, 6].map((t) => (
                <g key={t}>
                  <line x1={xSigma(t)} y1={p3AxisY - 4} x2={xSigma(t)} y2={p3AxisY + 4} stroke={MUTED_COLOR} />
                  <text x={xSigma(t)} y={p3AxisY + 18} fill={MUTED_COLOR} fontSize="11" textAnchor="middle">
                    {t}
                  </text>
                </g>
              ))}
              <text x={(P3_LEFT + P3_RIGHT) / 2} y={p3AxisY + 36} fill={TEXT_COLOR} fontSize="12" textAnchor="middle">
                Published preference for a changing dark energy (sigma)
              </text>
              {stage >= 6 && (
                <g>
                  <rect x={P3_LEFT} y={p3AxisY + 52} width={P3_RIGHT - P3_LEFT} height={34} fill="none" stroke={MUTED_COLOR} strokeDasharray="4 3" />
                  <text x={P3_LEFT + 8} y={p3AxisY + 66} fill={TEXT_COLOR} fontSize="11">
                    July 2026, DESI’s Lyman-alpha analysis: its result agrees with the standard model
                  </text>
                  <text x={P3_LEFT + 8} y={p3AxisY + 80} fill={MUTED_COLOR} fontSize="11">
                    (a constant dark energy). No sigma value is quoted for it, so it has no bar.
                  </text>
                </g>
              )}
            </svg>

            {/* Picture 3's guide: draft wording (CLAUDE.md §14 and §29) for the owner's review (§28.1). */}
            <div style={{ marginTop: '1rem', marginBottom: '1rem', fontSize: '0.875rem', color: 'var(--text-muted)' }}>
              <p style={paragraph}>
                <strong>How to read this diagram.</strong> The first two pictures were about what a changing dark energy would mean. This picture
                is about the evidence: how strongly do the published results prefer a changing dark energy over a constant one? It uses{' '}
                <strong>sigma</strong>, from Experiment 1 of this group: how many “give or takes” a result is away from what a constant dark
                energy predicts. The bigger the number, the harder it is to put the preference down to chance.
              </p>
              <p style={{ marginTop: 0, marginBottom: '0.5rem' }}>What is drawn:</p>
              <ul style={{ margin: '0 0 0.75rem', paddingLeft: '1.25rem' }}>
                <li>
                  <strong>The bars.</strong> Each bar is one published result, and its length is the sigma value written beside it. A longer bar
                  is a stronger preference for a changing dark energy. The names say which data were combined: “DESI + CMB alone” uses no
                  supernovae at all; the others add the supernova collection named; “DES Y5 recalibrated (Dovekie)” is the Dark Energy Survey’s
                  supernovae after the team improved their calibration in 2025. These are the numbers the scientists reported. They are quoted
                  here, not worked out here.
                </li>
                <li>
                  <strong>The orange bar</strong> is the collection you chose. The sky-blue bars are the others.
                </li>
                <li>
                  <strong>The line at 3,</strong> “often called evidence”, and <strong>the line at 5,</strong> “the usual bar for a discovery”.
                  These are rules of thumb that some sciences use, not laws. In particle physics, 5 sigma means about a 1-in-3.5-million
                  chance that chance alone could make a bump this big.
                </li>
                <li>
                  <strong>The dashed box at the bottom</strong> appears last, at stage 6. It is a newer result with no sigma value, so it cannot
                  be drawn as a bar. It is described in words.
                </li>
              </ul>
              <p style={paragraph}>
                <strong>A worked moment, with your numbers.</strong> The bar for {fit.name} is {fit.sigma.toFixed(1)} sigma long, so it lies{' '}
                {fit.sigma < 3 ? 'short of the line at 3' : fit.sigma < 5 ? 'between the line at 3 and the line at 5' : 'beyond the line at 5'}.
                That means: if dark energy were really constant, a result this far from it would be an unusual fluke, but not as unusual as the
                line at 5 asks for.
              </p>
              <p style={{ marginTop: 0, marginBottom: '0.5rem' }}>What to look for, and what it would mean:</p>
              <ul style={{ margin: 0, paddingLeft: '1.25rem' }}>
                <li>
                  <strong>Whether any bar reaches the line at 5.</strong> If one did, it would be called a discovery by the usual rule.
                </li>
                <li>
                  <strong>Whether the bars agree.</strong> The same galaxies and the same microwave background went into every bar. Only the
                  supernovae changed. If the preference were a fixed fact about the universe, you might expect every bar to be about the same
                  length.
                </li>
                <li>
                  <strong>The two DES bars.</strong> They use the same supernovae. They differ only in how the brightness was calibrated.
                </li>
                <li>
                  <strong>The last box.</strong> A newer result does not have to point the same way as an older one.
                </li>
              </ul>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
