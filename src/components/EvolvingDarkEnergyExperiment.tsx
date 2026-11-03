import { useEffect, useState } from 'react'
import type { ReactNode } from 'react'
import {
  ANCHOR_REDSHIFT,
  brightnessSteps,
  darkEnergyCheckUp,
  deepestDistanceDip,
  densityCrossingRedshift,
  densityRatioSteps,
  DES_RECALIBRATION,
  distanceGuessBand,
  FITS,
  NEWER_RESULT_NAME,
  PUBLISHED_SIGMAS,
  recalibrationGuessDirection,
  RESULT_REDSHIFTS,
  runEvolvingDarkEnergy,
  trialTimeValues,
} from '../physics/evolvingDarkEnergy'
import { ReferencePanel } from './EnergyMomentumExperiment'
import { EvolvingDarkEnergyTutor } from './EvolvingDarkEnergyTutor'
import type { DistanceRange, RecalibrationEffect } from '../physics/evolvingDarkEnergy'

// Cosmic Horizons, Experiment 2 (docs/experiments/cosmic-horizons/02-does-dark-energy-change.md).
// Step 5 adds the tutor (EvolvingDarkEnergyTutor.tsx), shown below the results after the run; the chapter summary in App appears once the
// learner reaches its explanation. Step 4 adds the "Words and formulas" panel (the formulas appear after the run), the "How far back?" control and the neutral results (both
// shown after the run), and the links withheld until then. The wording of Step 4 is draft wording for the owner's review (§28.1).
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
const GUESS_COLOR = '#ffffff' // white: the learner's guess, and nothing else (CLAUDE.md §14, "Predictions and the Real Results")
const TRIAL_COLOR = '#f472b6' // pink: the time the learner chose in Part 2
const TEXT_COLOR = '#e2e8f0'
const MUTED_COLOR = '#94a3b8'

// Left = far in the past (redshift 2), right = today (redshift 0).
const xOf = (redshift: number) => PLOT_LEFT + ((REDSHIFT_MAX - redshift) / REDSHIFT_MAX) * (PLOT_RIGHT - PLOT_LEFT)
const yOf = (ratio: number) => PLOT_BOTTOM - ((ratio - RATIO_MIN) / (RATIO_MAX - RATIO_MIN)) * (PLOT_BOTTOM - PLOT_TOP)
const fixed2 = (value: number) => value.toFixed(2)
// A number to a fixed count of decimals, with a true minus sign, and no minus sign on a value that rounds to zero ("0.00", not "−0.00").
const signedFixed = (value: number, decimals: number) => {
  const text = Math.abs(value).toFixed(decimals)
  return value < 0 && Number(text) !== 0 ? `−${text}` : text
}
const signed2 = (value: number) => signedFixed(value, 2)
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

// The four Parts of the page (CLAUDE.md §14, "The Page in Four Parts"): a thick coloured line, a coloured heading and a short lead.
function PartHeader({ color, title, children }: { color: string; title: string; children: ReactNode }) {
  return (
    <div style={{ marginTop: '2.5rem', paddingTop: '1.5rem', borderTop: `6px solid ${color}` }}>
      <h3 style={{ margin: '0 0 0.5rem', color }}>{title}</h3>
      <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)', marginTop: 0, marginBottom: '1rem' }}>
        <strong>What we are about to do.</strong> {children}
      </p>
    </div>
  )
}

const RECALIBRATION_SHORT = { weaker: 'weaker', same: 'about the same', stronger: 'stronger' } as const
const DIST_LABELS = { under05: 'less than 0.5', between05and2: 'between 0.5 and 2', between2and5: 'between 2 and 5', over5: 'more than 5' } as const

// Drawing A, in Part 2: the time the learner chose, beside the real description (CLAUDE.md §14). Each row has its own scale.
const DA_X0 = 120
const DA_X1 = 500
const daX = (value: number, min: number, max: number) => DA_X0 + ((value - min) / (max - min)) * (DA_X1 - DA_X0)
const DA_TIME_X0 = 60
const DA_TIME_X1 = 520
const daTimeX = (redshift: number) => DA_TIME_X0 + ((REDSHIFT_MAX - redshift) / REDSHIFT_MAX) * (DA_TIME_X1 - DA_TIME_X0)
const BRIGHT_MIN = -1
const BRIGHT_MAX = 7

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

type DistanceChoice = DistanceRange
const DISTANCE_CHOICES: Array<{ value: DistanceChoice; label: string }> = [
  { value: 'under05', label: 'Less than 0.5 percent' },
  { value: 'between05and2', label: 'Between 0.5 and 2 percent' },
  { value: 'between2and5', label: 'Between 2 and 5 percent' },
  { value: 'over5', label: 'More than 5 percent' },
]

type RecalibrationChoice = RecalibrationEffect
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
const DEFAULT_LOOKBACK = 0.5 // the redshift Prediction 1 names; the "How far back?" control (shown after the run) can move it
const LOOKBACK_CHOICES = RESULT_REDSHIFTS // 0.3, 0.5, 1 and 2

const xIn = (redshift: number, left: number, right: number) => left + ((REDSHIFT_MAX - redshift) / REDSHIFT_MAX) * (right - left)
const yIn = (value: number, min: number, max: number) => P2_BOTTOM - ((value - min) / (max - min)) * (P2_BOTTOM - P2_TOP)

// Layout of Picture 3: one bar for each published result, longest sigma on the right.
const P3_LEFT = 40
const P3_RIGHT = 520
const P3_SIGMA_MAX = 6
const xSigma = (sigma: number) => P3_LEFT + (sigma / P3_SIGMA_MAX) * (P3_RIGHT - P3_LEFT)

// Terms the introduction and the guides define, repeated in the "Words and formulas" panel with no new claims. The formulas are added after the
// run, because their worked examples use the learner's own numbers (§12).
const REFERENCE_ENTRIES: { term: string; meaning: string }[] = [
  { term: 'Dark energy', meaning: 'the name for whatever is making the expansion of the universe speed up. Nobody knows what it is.' },
  { term: 'Constant dark energy', meaning: 'the simplest idea, part of the standard model: dark energy has the same strength at every time. In the two-number description it is w₀ = −1 and wₐ = 0.' },
  { term: 'Changing dark energy', meaning: 'dark energy whose strength was different in the past.' },
  { term: 'w', meaning: 'a number that says how the dark energy’s density changes as the universe grows. w = −1: the density stays the same. w above −1: it thins out as space grows. w below −1: it grows.' },
  { term: 'w₀ and wₐ', meaning: 'the two numbers that describe a dark energy that changes: w₀ is the value of w today, and wₐ says how much w was different in the past.' },
  { term: 'Redshift, z, and the universe’s size', meaning: 'the redshift says how much the universe has grown since light set out. z = 1 means the universe was half its present size, z = 0.5 two thirds, z = 2 one third. z = 0 is today.' },
  { term: 'Density of dark energy', meaning: 'how much dark energy there is in each cubic metre of space. “1×” means the same as today, 1.2× means 20 percent more than today.' },
  { term: 'Matter fraction, Ωm (said “omega-m”)', meaning: 'the share of the universe’s energy today that is matter, meaning ordinary matter plus dark matter. In this simplified universe the rest is dark energy. For example, 0.3114 means about 31 percent matter and 69 percent dark energy.' },
  { term: 'Supernova', meaning: 'a star exploding so powerfully that, for a few weeks, it shines as brightly as a whole galaxy.' },
  { term: 'Type Ia supernova', meaning: 'the kind used to measure distances. A white dwarf explodes, and the explosions reach nearly the same peak brightness, so how dim one looks tells how far away it is.' },
  { term: 'White dwarf', meaning: 'the burnt-out core of a star like our Sun: about the size of the Earth, with about as much material as the Sun, slowly cooling.' },
  { term: 'Electron degeneracy pressure', meaning: 'the outward push from electrons, which cannot be in exactly the same state, when gravity squeezes them together. It is what holds a white dwarf up.' },
  { term: 'Standard candle and standard ruler', meaning: 'something whose true brightness (candle) or true length (ruler) is known, so how dim or how small it looks tells how far away it is.' },
  { term: 'BAO (baryon acoustic oscillations)', meaning: 'a preferred spacing of about 500 million light-years between galaxies, left by sound waves in the early universe. It is used as a standard ruler.' },
  { term: 'DESI', meaning: 'the Dark Energy Spectroscopic Instrument, a survey that measured the positions of more than 14 million galaxies and quasars.' },
  { term: 'CMB (the cosmic microwave background)', meaning: 'the faint afterglow of the Big Bang, which reaches us from every direction in the sky (Cosmology Experiment 3). “CMB” is its short name. In the bar names and tables, “DESI + CMB” means DESI’s galaxy ruler combined with the microwave background.' },
  { term: 'Quasar', meaning: 'the extremely bright centre of a distant galaxy, where a huge black hole is pulling in gas. It is so bright that it can be seen from billions of light-years away.' },
  { term: 'Lyman-alpha forest', meaning: 'light from a distant quasar passes through many clouds of hydrogen gas on its way to us. Each cloud takes a little light out at one particular colour, so the quasar’s light has many thin dark gaps, like the trunks of a forest. Where each gap falls says where its cloud is, so the pattern is another map of the early universe, from farther back in time than the galaxies DESI uses.' },
  { term: 'Supernova collection', meaning: 'a list of supernova measurements gathered by different telescopes and calibrated in different ways. Different collections can give slightly different answers.' },
  { term: 'Calibration, and recalibration', meaning: 'checking a measuring tool against something whose true value is known, as you might check a kitchen scale with a 1-kilogram weight. For supernovae, it means checking that a given brightness really means a given distance, using nearby supernovae whose distances are known another way. Recalibrating means improving that check.' },
  { term: 'Sigma', meaning: 'how many “give or takes” a result is away from what a constant dark energy predicts (Experiment 1 of this group). The bigger the number, the harder it is to put the difference down to chance.' },
  { term: 'The lines at 3 and 5 sigma', meaning: '“often called evidence” and “the usual bar for a discovery”. These are rules of thumb that some sciences use, not laws.' },
  { term: 'Distance difference', meaning: 'how much nearer or farther, in percent, a galaxy would look with a changing dark energy than with a constant one that has the same amount of matter. A minus sign means nearer.' },
  { term: 'Magnitude', meaning: 'the scale astronomers use for brightness. It runs backwards: a smaller number is brighter. A difference of 2.5 magnitudes is a factor of 10 in brightness, and 0.1 magnitudes is about 10 percent.' },
  { term: 'Nearby supernovae lined up', meaning: 'a supernova survey cannot fix the Hubble constant by itself, so the comparison lines the nearby supernovae (z = 0.05) up so that both agree there, and shows how the farther ones differ.' },
]

const f3 = (value: number) => signedFixed(value, 3)
const MORE_LINKS_TEXT = 'These are the links that were kept back until you had seen the results.'

export function EvolvingDarkEnergyExperiment({ onComplete, onTutorComplete }: EvolvingDarkEnergyExperimentProps) {
  const [fitName, setFitName] = useState(FITS[0].name)
  const [distancePrediction, setDistancePrediction] = useState<DistanceChoice | null>(null)
  const [recalibrationPrediction, setRecalibrationPrediction] = useState<RecalibrationChoice | null>(null)
  const [status, setStatus] = useState<'idle' | 'running' | 'complete'>('idle')
  const [stage, setStage] = useState(0)
  const [lookback, setLookback] = useState(DEFAULT_LOOKBACK)
  const fit = FITS.find((f) => f.name === fitName)!
  const result = runEvolvingDarkEnergy(fit, lookback)
  const at = (redshift: number) => result.curve.find((r) => r.redshift === redshift)!
  const atHalfSize = at(1)
  const atTwoThirds = at(0.5)
  const path = result.curve.map((r) => `${xOf(r.redshift).toFixed(1)},${yOf(r.densityRatio).toFixed(1)}`).join(' ')
  const bothPredicted = distancePrediction !== null && recalibrationPrediction !== null
  const marked = result.atChosenRedshift
  const brightness = brightnessSteps(marked.magnitudeDifference)
  const densitySteps = densityRatioSteps(lookback, fit.w0, fit.wa)
  const checkUp = darkEnergyCheckUp(fit, lookback)
  const trial = trialTimeValues(fit, lookback)
  const dip = deepestDistanceDip(fit)
  const crossing = densityCrossingRedshift(fit)
  const sigmasOfFits = FITS.map((f) => f.sigma)
  const farLeft = at(2)

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
    setLookback(DEFAULT_LOOKBACK)
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
  const p3Height = p3AxisY + 132
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
            the distance to a galaxy, and how strong the claimed evidence is. Nothing here is graded. Your predictions never change the real pictures
            or tables. They are drawn on the pictures in white, in a box marked YOUR GUESS, so you can compare them with what was measured and
            calculated, and they are listed again beside the results. In Part 2 you can pick the time that the pink dot and the numbers show;
            that choice changes the pink dot, a drawing in Part 2 and some numbers in the tables, but never your guesses.
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

        <ReferencePanel
          entries={
            status === 'complete'
              ? [
                  ...REFERENCE_ENTRIES,
                  {
                    term: 'Dark energy’s density compared with today (formula)',
                    meaning: `density ratio = (1 + z)^(3 × (1 + w₀ + wₐ)) × exp(−3 × wₐ × z ÷ (1 + z)). Example, with ${fit.name} (w₀ = ${published(fit.w0)}, wₐ = ${published(fit.wa)}) at z = ${lookback}: the exponent is 3 × (1 + (${published(fit.w0)}) + (${published(fit.wa)})) = ${f3(densitySteps.exponent)}. The first factor is ${1 + lookback}^(${f3(densitySteps.exponent)}) = ${f3(densitySteps.powerFactor)}. The second is exp(−3 × (${published(fit.wa)}) × ${lookback} ÷ ${1 + lookback}) = ${f3(densitySteps.exponentialFactor)}. Multiplied: ${f3(densitySteps.ratio)}. So the dark energy was ${f3(densitySteps.ratio)} times as dense as it is today.`,
                  },
                  {
                    term: 'w at redshift z (formula)',
                    meaning: `w = w₀ + wₐ × z ÷ (1 + z). Example: ${published(fit.w0)} + (${published(fit.wa)}) × ${lookback} ÷ ${1 + lookback} = ${f3(marked.equationOfState)}.`,
                  },
                  {
                    term: 'Distance and the distance difference (formula)',
                    meaning: `The distance to a galaxy at redshift z is (c ÷ H₀) × the sum of dz′ ÷ E(z′) from 0 to z (an integral, worked out by computer), where E(z) = √(Ωm × (1 + z)³ + (1 − Ωm) × the density ratio above) and Ωm is the amount of matter. The distance difference is the percent by which this distance differs from the one for a constant dark energy with the same Ωm: ${fixed2(Math.abs(marked.distanceDifferencePercent))} percent ${marked.distanceDifferencePercent < 0 ? 'nearer' : 'farther'} at z = ${lookback} with ${fit.name} (Ωm = ${fit.omegaMatter}). The Hubble constant cancels out of this comparison.`,
                  },
                  {
                    term: 'Brightness from magnitudes (formula)',
                    meaning: `brightness factor = 10^(−0.4 × the magnitude difference). Example, at z = ${lookback} with ${fit.name}: the magnitude difference is ${f3(marked.magnitudeDifference)}, so the exponent is −0.4 × (${f3(marked.magnitudeDifference)}) = ${f3(brightness.exponent)}, and 10^(${f3(brightness.exponent)}) = ${f3(brightness.factor)}. That is ${fixed2(Math.abs(brightness.percent))} percent ${brightness.percent > 0 ? 'brighter' : 'fainter'} than the constant case.`,
                  },
                ]
              : REFERENCE_ENTRIES
          }
        />

        <PartHeader color="#d97706" title="Part 1: Predict, then watch">
          We are about to make two predictions, then watch three pictures build up, one stage at a time: how strong dark energy was in the past,
          what that does to distances and brightness, and how strong the hint of a change is. Nothing here tells you the answers. When the pictures
          are drawn, your guesses appear on them in white.
        </PartHeader>

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
              <strong>The pale dot.</strong> Today. Both lines meet here at 1×, because everything is compared with today’s value.
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
          <p style={{ marginTop: 0, marginBottom: '0.5rem' }}>
            <strong>What to look for.</strong> Here are three things to look at, what each one means, and why it matters.
          </p>
          <ul style={{ margin: 0, paddingLeft: '1.25rem' }}>
            <li>
              <strong>Look at</strong> how far the orange line is from the grey one. <strong>What it means:</strong> the grey line is flat at 1×. At z = 1 the orange line is at{' '}
              {fixed2(atHalfSize.densityRatio)}×{crossing !== null ? ` and it crosses the grey line at about z = ${fixed2(crossing)}` : ''}. <strong>Why it matters:</strong> if the two
              lines lay on top of each other the description would be a constant dark energy. The gap is how much change this description claims.
            </li>
            <li>
              <strong>Look at</strong> where the orange line is above the grey one and where it is below. <strong>What it means:</strong> above means stronger than today, below means weaker.{' '}
              For {fit.name} the line is {atTwoThirds.densityRatio > 1 ? 'above' : 'below'} the grey line at z = 0.5 and {atHalfSize.densityRatio > 1 ? 'above' : 'below'} it at z = 1.{' '}
              <strong>Why it matters:</strong> this shape is the description’s own claim about how dark energy changed. Picture 2 turns it into distances.
            </li>
            <li>
              <strong>Look at</strong> whether the three collections give the same line. <strong>What it means:</strong> try the other two. Their values are{' '}
              {FITS.map((f) => `${f.name}: w₀ ${published(f.w0)}, wₐ ${published(f.wa)}`).join('; ')}. <strong>Why it matters:</strong> if the true answer were one fixed fact about
              the universe, you might hope that all three would give the same line.
            </li>
          </ul>
          <p style={{ marginTop: '0.5rem', marginBottom: 0 }}>
            <strong>A caution.</strong> The orange line is the <em>simplest curve with two numbers</em> that fits the data. It is not known that dark energy really behaves like this. Do
            not read the far left of the line as fact: the data barely reach that far back.
          </p>
        </div>

        {/* Picture 2: what the change does to distances and brightness. Appears when Run is pressed; the left chart at stage 3, the right at stage 4. */}
        {status !== 'idle' && (
          <div style={{ marginTop: '2rem' }}>
            <svg
              width={VIEW_WIDTH}
              height={372}
              viewBox={`0 0 ${VIEW_WIDTH} 372`}
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
                  <circle cx={xIn(lookback, DIST_LEFT, DIST_RIGHT)} cy={yIn(marked.distanceDifferencePercent, DIST_MIN, DIST_MAX)} r={5} fill={TRIAL_COLOR} stroke={TEXT_COLOR} />
                  <text x={xIn(lookback, DIST_LEFT, DIST_RIGHT) + (lookback >= 2 ? 10 : -10)} y={yIn(marked.distanceDifferencePercent, DIST_MIN, DIST_MAX) + 18} fill={TRIAL_COLOR} fontSize="11" textAnchor={lookback >= 2 ? 'start' : 'end'}>
                    z = {lookback}: {signed2(marked.distanceDifferencePercent)} %
                  </text>

                  {/* Your guess for Prediction 1: white brackets at z = 0.5 for the size you guessed, on both sides of zero (a size, not a direction). */}
                  {distancePrediction !== null &&
                    (() => {
                      const band = distanceGuessBand(distancePrediction)
                      const x = xIn(DEFAULT_LOOKBACK, DIST_LEFT, DIST_RIGHT)
                      const high = band.hi ?? Infinity
                      const sides = [
                        { a: -high, b: -band.lo, offLabel: `−${band.lo} to −${band.hi ?? '…'}`, direction: 'below' },
                        { a: band.lo, b: high, offLabel: `+${band.lo} to +${band.hi ?? '…'}`, direction: 'above' },
                      ]
                      let lowestY = P2_TOP
                      const parts = sides.map((side) => {
                        const bottom = Math.max(side.a, DIST_MIN)
                        const top = Math.min(side.b, DIST_MAX)
                        if (!(bottom < top)) {
                          // the whole side lies beyond the edge of the chart: an arrow at that edge says so
                          const above = side.direction === 'above'
                          const y = above ? P2_TOP : P2_BOTTOM
                          if (!above) lowestY = Math.max(lowestY, y)
                          return (
                            <g key={side.direction}>
                              <polygon points={above ? `${x - 6},${y + 10} ${x + 6},${y + 10} ${x},${y}` : `${x - 6},${y - 10} ${x + 6},${y - 10} ${x},${y}`} fill={GUESS_COLOR} />
                              <text x={x - 10} y={above ? y + 9 : y - 3} fill={GUESS_COLOR} fontSize="9" textAnchor="end">
                                {above ? '▲ ' : '▼ '}
                                {side.offLabel} % (beyond the chart)
                              </text>
                            </g>
                          )
                        }
                        const yTop = yIn(top, DIST_MIN, DIST_MAX)
                        const yBottom = yIn(bottom, DIST_MIN, DIST_MAX)
                        if (side.direction === 'below') lowestY = Math.max(lowestY, yBottom)
                        return (
                          <g key={side.direction}>
                            <line x1={x} y1={yTop} x2={x} y2={yBottom} stroke={GUESS_COLOR} strokeWidth={5} />
                            <line x1={x - 7} y1={yTop} x2={x + 7} y2={yTop} stroke={GUESS_COLOR} strokeWidth={2} />
                            <line x1={x - 7} y1={yBottom} x2={x + 7} y2={yBottom} stroke={GUESS_COLOR} strokeWidth={2} />
                            {side.b > DIST_MAX && <polygon points={`${x - 6},${yTop + 2} ${x + 6},${yTop + 2} ${x},${yTop - 8}`} fill={GUESS_COLOR} />}
                            {side.a < DIST_MIN && <polygon points={`${x - 6},${yBottom - 2} ${x + 6},${yBottom - 2} ${x},${yBottom + 8}`} fill={GUESS_COLOR} />}
                          </g>
                        )
                      })
                      const boxX = Math.max(10, Math.min(x - 170, VIEW_WIDTH - 350))
                      return (
                        <g>
                          {parts}
                          <line x1={x} y1={lowestY} x2={x} y2={316} stroke={GUESS_COLOR} strokeWidth={2} />
                          <rect x={boxX} y={316} width={340} height={28} rx={4} fill="#0b1020" stroke={GUESS_COLOR} strokeWidth={2} />
                          <text x={boxX + 170} y={335} fill={GUESS_COLOR} fontSize="12" fontWeight="bold" textAnchor="middle">
                            YOUR GUESS: {DIST_LABELS[distancePrediction]} percent (size only)
                          </text>
                        </g>
                      )
                    })()}
                  <text x={14} y={P2_TOP + (P2_BOTTOM - P2_TOP) * 0.78} fill={MUTED_COLOR} fontSize="10" textAnchor="middle" transform={`rotate(-90 14 ${P2_TOP + (P2_BOTTOM - P2_TOP) * 0.78})`}>
                    ↓ nearer
                  </text>
                  <text x={14} y={P2_TOP + (P2_BOTTOM - P2_TOP) * 0.18} fill={MUTED_COLOR} fontSize="10" textAnchor="middle" transform={`rotate(-90 14 ${P2_TOP + (P2_BOTTOM - P2_TOP) * 0.18})`}>
                    farther ↑
                  </text>
                  <line x1={DIST_LEFT} y1={P2_BOTTOM} x2={DIST_RIGHT} y2={P2_BOTTOM} stroke={MUTED_COLOR} strokeWidth={1.5} />
                  {P2_REDSHIFT_TICKS.map((z) => (
                    <g key={z}>
                      <line x1={xIn(z, DIST_LEFT, DIST_RIGHT)} y1={P2_BOTTOM - 4} x2={xIn(z, DIST_LEFT, DIST_RIGHT)} y2={P2_BOTTOM + 4} stroke={MUTED_COLOR} />
                      <text x={xIn(z, DIST_LEFT, DIST_RIGHT)} y={P2_BOTTOM + 17} fill={MUTED_COLOR} fontSize="10" textAnchor="middle">
                        {z === 0 ? 'today' : `z = ${z}`}
                      </text>
                      <text x={xIn(z, DIST_LEFT, DIST_RIGHT)} y={P2_BOTTOM + 29} fill={MUTED_COLOR} fontSize="9" textAnchor="middle">
                        {z === 0 ? 'full size' : `size ${fixed2(1 / (1 + z))}`}
                      </text>
                    </g>
                  ))}
                  <text x={(DIST_LEFT + DIST_RIGHT) / 2} y={P2_BOTTOM + 44} fill={MUTED_COLOR} fontSize="10" textAnchor="middle" stroke="#0b1020" strokeWidth={4} paintOrder="stroke">
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
                  <circle cx={xIn(lookback, MAG_LEFT, MAG_RIGHT)} cy={yIn(marked.magnitudeDifference, MAG_MIN, MAG_MAX)} r={5} fill={TRIAL_COLOR} stroke={TEXT_COLOR} />
                  <text x={xIn(lookback, MAG_LEFT, MAG_RIGHT)} y={yIn(marked.magnitudeDifference, MAG_MIN, MAG_MAX) + 18} fill={TRIAL_COLOR} fontSize="11" textAnchor={lookback >= 2 ? 'start' : 'middle'}>
                    z = {lookback}: {signed2(marked.magnitudeDifference)}
                  </text>
                  <text x={296} y={P2_TOP + (P2_BOTTOM - P2_TOP) * 0.78} fill={MUTED_COLOR} fontSize="10" textAnchor="middle" transform={`rotate(-90 296 ${P2_TOP + (P2_BOTTOM - P2_TOP) * 0.78})`}>
                    ↓ brighter
                  </text>
                  <text x={296} y={P2_TOP + (P2_BOTTOM - P2_TOP) * 0.18} fill={MUTED_COLOR} fontSize="10" textAnchor="middle" transform={`rotate(-90 296 ${P2_TOP + (P2_BOTTOM - P2_TOP) * 0.18})`}>
                    fainter ↑
                  </text>
                  <line x1={MAG_LEFT} y1={P2_BOTTOM} x2={MAG_RIGHT} y2={P2_BOTTOM} stroke={MUTED_COLOR} strokeWidth={1.5} />
                  {P2_REDSHIFT_TICKS.map((z) => (
                    <g key={z}>
                      <line x1={xIn(z, MAG_LEFT, MAG_RIGHT)} y1={P2_BOTTOM - 4} x2={xIn(z, MAG_LEFT, MAG_RIGHT)} y2={P2_BOTTOM + 4} stroke={MUTED_COLOR} />
                      <text x={xIn(z, MAG_LEFT, MAG_RIGHT)} y={P2_BOTTOM + 17} fill={MUTED_COLOR} fontSize="10" textAnchor="middle">
                        {z === 0 ? 'today' : `z = ${z}`}
                      </text>
                      <text x={xIn(z, MAG_LEFT, MAG_RIGHT)} y={P2_BOTTOM + 29} fill={MUTED_COLOR} fontSize="9" textAnchor="middle">
                        {z === 0 ? 'full size' : `size ${fixed2(1 / (1 + z))}`}
                      </text>
                    </g>
                  ))}
                  <text x={(MAG_LEFT + MAG_RIGHT) / 2} y={P2_BOTTOM + 44} fill={MUTED_COLOR} fontSize="10" textAnchor="middle">
                    far past ← time → today
                  </text>
                  <text x={MAG_LEFT + 4} y={yIn(0, MAG_MIN, MAG_MAX) + 14} fill={MUTED_COLOR} fontSize="9">
                    ↓ below the line: brighter
                  </text>
                </g>
              )}
              <text x={PLOT_LEFT - 24} y={296} fill={MUTED_COLOR} fontSize="10" stroke="#0b1020" strokeWidth={4} paintOrder="stroke">
                orange: the fit with {fit.name}; dashed grey: a constant dark energy with the same amount of matter
              </text>
              <text x={PLOT_LEFT - 24} y={360} fill={MUTED_COLOR} fontSize="10">
                pink dot: the time you chose in Part 2 (it starts at z = 0.5); white: your guess
              </text>
            </svg>

            {/* Picture 2's guide: draft wording (CLAUDE.md §14 and §29) for the owner's review (§28.1). It is shown after the run, so it can say
                what the chart shows. It does not say whether the difference is "large" or "small": the results and tutor come later. */}
            <div style={{ marginTop: '1rem', marginBottom: '2rem', fontSize: '0.875rem', color: 'var(--text-muted)' }}>
              <p style={paragraph}>
                <strong>How to read this diagram.</strong>
              </p>
              <p style={paragraph}>
                <strong>What this picture is for.</strong> Picture 1 showed how a changing dark energy would differ from a constant one{' '}
                <em>inside</em> the universe: how dense it was at different times. But nobody can measure that density directly. What astronomers
                can measure is <em>how far away things look</em> and <em>how bright supernovae look</em>. So this picture asks: if dark energy
                changed the way you chose, how differently would distant things look, compared with a constant dark energy?
              </p>
              <p style={paragraph}>
                <strong>How the comparison is made.</strong> Imagine two universes. They have the same amount of matter, and they look the same
                today. The only difference is the dark energy. In one it is constant (the <strong>grey dashed line</strong>). In the other it
                changes the way the fit with {fit.name} describes (the <strong>orange line</strong>). We take one galaxy, at the same place in
                both universes, and ask how far away each universe would put it. The picture shows the difference. It always compares with the
                grey line, which is why the grey line sits at “no difference”.
              </p>

              <p style={{ marginTop: 0, marginBottom: '0.5rem' }}>
                <strong>The left chart: distance.</strong> It appears first, at stage 3.
              </p>
              <ul style={{ margin: '0 0 0.75rem', paddingLeft: '1.25rem' }}>
                <li>
                  <strong>The side line</strong> says how much <em>different</em> the distance is, in <strong>percent</strong>. 0 % means no
                  difference. <strong>−2 % means 2 percent <em>nearer</em></strong> than the grey universe would put it. A plus sign would mean
                  farther. The arrows along the side line and the note “below the line: nearer” are there to remind you.
                </li>
                <li>
                  <strong>The bottom line</strong> is the time the light set out, from the far past on the left (z = 2, when the universe was one
                  third of its present size, written “size 0.33”), through z = 1 (half its present size) to <strong>today</strong> on the right. (“z”
                  is the redshift of Picture 1.)
                </li>
                <li>
                  <strong>The grey dashed line at 0 %</strong> is the constant dark energy. Nothing differs from it, by definition.
                </li>
                <li>
                  <strong>The orange line</strong> is your description. It <strong>reaches 0 % on the right.</strong> That is correct: a galaxy
                  very close to us looks the same distance in every version of the universe. (This is why the simple formula of Cosmology
                  Experiment 1 worked for nearby galaxies.) The differences only build up for far-away galaxies, because they come from the{' '}
                  <em>whole</em> journey of the light.
                </li>
                <li>
                  <strong>The pink dot</strong> marks one time, z = {lookback}, when the universe was {fixed2(1 / (1 + lookback))} of its
                  present size. Its value is written below it.{' '}
                  {lookback === DEFAULT_LOOKBACK ? 'At z = 0.5 this is the galaxy that Prediction 1 asked about. ' : ''}Pink always means a time you chose. After the run you can
                  move it with “How far back?” in Part 2.
                </li>
                <li>
                  <strong>The white brackets and the YOUR GUESS box:</strong> your guess for Prediction 1, drawn at z = 0.5 on the same percent scale. A bracket covers the size range you chose
                  (for example “between 0.5 and 2 percent” covers 0.5 to 2). It is drawn on both sides of 0, because you guessed a size, not a direction. A short arrow means the range
                  reaches past the edge of the chart. The brackets do not move when you change the time in Part 2. They are only where you guessed, not a result.
                </li>
              </ul>

              <p style={{ marginTop: 0, marginBottom: '0.5rem' }}>
                <strong>The right chart: brightness.</strong> It appears next, at stage 4. A supernova does not tell us its distance directly. It
                tells us <strong>how bright it looks</strong>, and the distance is worked out from that. So the same effect can be shown as a
                difference in brightness.
              </p>
              <ul style={{ margin: '0 0 0.75rem', paddingLeft: '1.25rem' }}>
                <li>
                  <strong>Magnitude</strong> is the scale astronomers use for brightness, and it runs <strong>backwards</strong>, like golf scores,
                  where a lower number is better: a <em>smaller</em> magnitude is <em>brighter</em>. A difference of 2.5 magnitudes is a factor of
                  10 in brightness, and 0.1 magnitudes is about 10 percent. So <strong>a number below zero here means the supernova looks
                  brighter</strong> than it would in the grey universe. The arrows along the side line and the note “below the line: brighter” remind
                  you.
                </li>
                <li>
                  <strong>“Lined up” at the pale dot near the right edge (z = {ANCHOR_REDSHIFT}).</strong> A supernova survey does not know exactly
                  how bright its supernovae really are. If every supernova were secretly 5 percent brighter, all of them would look 5 percent
                  brighter, whatever the dark energy. So the survey cannot use the <em>absolute</em> brightness. It uses the <em>differences</em>{' '}
                  between near and far supernovae. The chart does the same: it makes the two universes agree for the nearby supernovae at z ={' '}
                  {ANCHOR_REDSHIFT} (the pale dot), and shows how the farther ones then differ. That is why the orange line <strong>starts</strong>{' '}
                  at that dot, and has no value closer to today.
                </li>
                <li>
                  <strong>The grey dashed line at 0</strong> is the constant dark energy, as on the left. <strong>The orange line</strong> is your
                  description. <strong>The pink dot</strong> is at the same time as the dot on the left chart. (The label on the picture shows two
                  decimals; the worked moment below uses three.)
                </li>
              </ul>

              <p style={paragraph}>
                <strong>The two charts together.</strong> They show the <em>same</em> effect, in two forms. A galaxy that looks nearer is also a
                supernova that looks brighter, because things look brighter when they are closer. That is why the two orange lines have a similar
                shape.
              </p>

              <p style={paragraph}>
                <strong>A worked moment, with your numbers.</strong> Suppose the grey universe puts a galaxy at redshift {lookback} exactly{' '}
                <strong>100 units</strong> away. With {fit.name}, the orange universe puts it at{' '}
                <strong>{fixed2(100 + marked.distanceDifferencePercent)} units</strong>: {fixed2(Math.abs(marked.distanceDifferencePercent))} percent{' '}
                {marked.distanceDifferencePercent < 0 ? 'nearer' : 'farther'}. In brightness, the magnitude difference is{' '}
                {f3(marked.magnitudeDifference)}. To turn that into a percentage, multiply it by −0.4, which gives {f3(brightness.exponent)}, and
                then work out 10 to that power, which gives {f3(brightness.factor)}. So the supernova looks about{' '}
                <strong>
                  {fixed2(Math.abs(brightness.percent))} percent {brightness.percent > 0 ? 'brighter' : 'fainter'}
                </strong>{' '}
                than in the grey universe, once the nearby ones are lined up.
              </p>

              {stage >= 3 && (
                <>
                  <p style={{ marginTop: 0, marginBottom: '0.5rem' }}>
                    <strong>What to look for.</strong> Here are four things to look at, what each one means, and why it matters.
                  </p>
                  <ul style={{ margin: '0 0 0.75rem', paddingLeft: '1.25rem' }}>
                    <li>
                      <strong>Look at</strong> how low the orange line goes. <strong>What it means:</strong> at its lowest, for {fit.name}, it is {signed2(dip.percent)} % (at z = {dip.redshift}).{' '}
                      <strong>Why it matters:</strong> the lower the dip, the easier it would be for a survey to notice. This picture draws the size of the effect, not whether a survey could see it.
                    </li>
                    <li>
                      <strong>Look at</strong> where the dip is deepest. <strong>What it means:</strong> at z = {dip.redshift}, when the universe was {fixed2(1 / (1 + dip.redshift))} of its present size.{' '}
                      <strong>Why it matters:</strong> a survey with many supernovae near that time can tell the two universes apart best. Compare its position with Picture 1.
                    </li>
                    <li>
                      <strong>Look at</strong> the far left of the line. <strong>What it means:</strong> at z = 2 the difference is only {signed2(farLeft.distanceDifferencePercent)} %, smaller than in the
                      middle. <strong>Why it matters:</strong> dark energy was very different then (Picture 1), yet the distance barely changed. The reason is for you to think about. The tutor comes back to it.
                    </li>
                    <li>
                      <strong>Look at</strong> the white brackets at z = 0.5 and the pink dot. <strong>What it means:</strong> the brackets stay at z = 0.5, whatever time you choose later, and show the
                      size you guessed, on both sides of zero. The pink dot starts at z = 0.5 and moves when you choose another time. <strong>Why it matters:</strong> it keeps your guess apart from the
                      real value at the same time, so you can compare them.
                    </li>
                  </ul>
                  <p style={{ marginTop: 0, marginBottom: '0.5rem' }}>
                    <strong>Where the real picture comes from.</strong> <em>Measured:</em> the three fits’ values of w₀, wₐ and the matter fraction, by the DESI team with each supernova collection.{' '}
                    <em>Calculated here:</em> both orange curves and the grey line, from those values. <em>Imagined for the question:</em> the grey constant-dark-energy universe, which is the standard
                    model, not a measurement. The pink dot is your own choice of time, and the white brackets are your guess.
                  </p>
                </>
              )}

              <p style={{ marginTop: 0, marginBottom: 0 }}>
                <strong>Two cautions.</strong> The grey and orange universes are given the same amount of matter, which is simpler than what the
                scientists did (they fitted each separately). And the orange line is the best-fitting curve of a two-number description. It is not
                known to be what dark energy really does, and at the far left the data barely reach.
              </p>
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
                if (row.name === NEWER_RESULT_NAME && stage < 6) return null // the newer result appears at stage 6, with the box below
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
              {recalibrationPrediction !== null &&
                (() => {
                  // Your guess for Prediction 2: only a direction (left for weaker, right for stronger, a tick for about the same). Its length means nothing.
                  const row = sigmaRows.findIndex((r) => r.name === 'DES Y5')
                  const y = P3_FIRST_ROW + row * P3_ROW
                  const x0 = xSigma(sigmaRows[row].sigma)
                  const ay = y + 28
                  const direction = recalibrationGuessDirection(recalibrationPrediction)
                  return (
                    <g>
                      {direction === 0 ? (
                        <line x1={x0} y1={ay - 8} x2={x0} y2={ay + 8} stroke={GUESS_COLOR} strokeWidth={4} />
                      ) : (
                        <>
                          <line x1={x0} y1={ay} x2={x0 + direction * 56} y2={ay} stroke={GUESS_COLOR} strokeWidth={4} />
                          <polygon points={`${x0 + direction * 66},${ay} ${x0 + direction * 52},${ay - 7} ${x0 + direction * 52},${ay + 7}`} fill={GUESS_COLOR} />
                        </>
                      )}
                      <polyline points={`${x0},${ay + 8} ${x0},${y + 47} 392,${y + 47}`} fill="none" stroke={GUESS_COLOR} strokeWidth={2} />
                      <rect x={392} y={y + 36} width={150} height={22} rx={4} fill="#0b1020" stroke={GUESS_COLOR} strokeWidth={2} />
                      <text x={467} y={y + 51} fill={GUESS_COLOR} fontSize="12" fontWeight="bold" textAnchor="middle">
                        YOUR GUESS: {RECALIBRATION_SHORT[recalibrationPrediction]}
                      </text>
                    </g>
                  )
                })()}
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
                  <rect x={P3_LEFT} y={p3AxisY + 52} width={P3_RIGHT - P3_LEFT} height={64} fill="none" stroke={MUTED_COLOR} strokeDasharray="4 3" />
                  <text x={P3_LEFT + 8} y={p3AxisY + 67} fill={TEXT_COLOR} fontSize="11">
                    July 2026, DESI’s Lyman-alpha analysis: on its own, its result agrees with
                  </text>
                  <text x={P3_LEFT + 8} y={p3AxisY + 81} fill={TEXT_COLOR} fontSize="11">
                    the standard model (a constant dark energy). With the microwave background,
                  </text>
                  <text x={P3_LEFT + 8} y={p3AxisY + 95} fill={TEXT_COLOR} fontSize="11">
                    its paper quotes 2.7 sigma for a changing one (the last bar above), and 3.2 sigma
                  </text>
                  <text x={P3_LEFT + 8} y={p3AxisY + 109} fill={MUTED_COLOR} fontSize="11">
                    with supernovae too (no bar: the abstract does not say which collection).
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
                  is a stronger preference for a changing dark energy. The names say which data were combined (CMB means the cosmic microwave background): “DESI + CMB alone” uses no
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
  <strong>The last bar and the dashed box at the bottom</strong> appear last, at stage 6. They are a newer analysis. The box mentions the{' '}
                  <strong>Lyman-alpha forest</strong>, a pattern of thin dark gaps that gas clouds leave in the light of very distant quasars. It is
                  another map of the early universe, and DESI used it to check the others. Its own measurement agrees with a constant dark energy,
                  but when the DESI team combined it with the other data they again found a preference for a changing one. With the microwave
                  background it is <strong>2.7 sigma</strong>. That is the same combination as the first bar, “DESI + CMB alone” (3.1 sigma),
                  with the newer analysis added, so it is drawn as the last bar. With supernovae added too it is 3.2 sigma, but the abstract does not say
                  which supernova collection that uses, so it cannot be given a name like the other bars and is described in words.
                </li>
              </ul>
              <p style={paragraph}>
                <strong>A worked moment, with your numbers.</strong> The bar for {fit.name} is {fit.sigma.toFixed(1)} sigma long, so it lies{' '}
                {fit.sigma < 3 ? 'short of the line at 3' : fit.sigma < 5 ? 'between the line at 3 and the line at 5' : 'beyond the line at 5'}.
                That means: if dark energy were really constant, a result this far from it would be an unusual fluke, but not as unusual as the
                line at 5 asks for.
              </p>
              {stage >= 5 && (
                <>
                  <p style={{ marginTop: 0, marginBottom: '0.5rem' }}>
                    <strong>What to look for.</strong> Here are {stage >= 6 ? 'four' : 'three'} things to look at, what each one means, and why it matters.
                  </p>
                  <ul style={{ margin: 0, paddingLeft: '1.25rem' }}>
                    <li>
                      <strong>Look at</strong> whether any bar reaches the line at 5. <strong>What it means:</strong> the longest of the three collections’ bars is {Math.max(...sigmasOfFits).toFixed(1)}, and none reaches 5.{' '}
                      <strong>Why it matters:</strong> 5 is the usual bar for calling a difference a discovery, so no collection alone meets it.
                    </li>
                    <li>
                      <strong>Look at</strong> whether the bars agree. <strong>What it means:</strong> the three collections run from {Math.min(...sigmasOfFits).toFixed(1)} to {Math.max(...sigmasOfFits).toFixed(1)}.{' '}
                      <strong>Why it matters:</strong> the same galaxies and the same microwave background went into every bar. Only the supernovae changed. If the preference were a fixed fact about the
                      universe, you might expect every bar to be about the same length.
                    </li>
                    <li>
                      <strong>Look at</strong> the two DES bars and the white arrow. <strong>What it means:</strong> DES Y5 is {DES_RECALIBRATION.beforeSigma.toFixed(1)} sigma and the recalibrated bar is{' '}
                      {DES_RECALIBRATION.afterSigma.toFixed(1)}. The white arrow starts at the end of the DES Y5 bar. <strong>Why it matters:</strong> they use the same supernovae and differ only in how the
                      brightness was calibrated, so a calibration step can move the result.
                    </li>
                    {stage >= 6 && (
                      <li>
                        <strong>Look at</strong> the last bar and the box. <strong>What it means:</strong> the July 2026 analysis gives {PUBLISHED_SIGMAS[PUBLISHED_SIGMAS.length - 1].sigma.toFixed(1)} sigma with the microwave background.{' '}
                        <strong>Why it matters:</strong> a newer result does not have to point the same way as an older one.
                      </li>
                    )}
                  </ul>
                  <p style={{ marginTop: '0.75rem', marginBottom: 0 }}>
                    <strong>Where the real picture comes from.</strong> <em>Measured:</em> every sigma bar is quoted from the papers by the teams named in Table 3, and is not worked out here.{' '}
                    <em>Calculated here:</em> nothing. <em>Imagined for the question:</em> nothing. The white arrow is your guess.
                  </p>
                </>
              )}
            </div>
          </div>
        )}

        {/* After the run: the "How far back?" control, the neutral results, the guide to them and the links kept back until now.
            Draft wording for the owner's review (CLAUDE.md §28.1, §29). The results only report; they do not say why. */}
        {status === 'complete' && (
          <div style={{ marginTop: '0.5rem' }}>
            <PartHeader color="#be185d" title="Part 2: Now try it yourself">
              We are about to choose a time in the past and see what the description you chose says about it. Your choice moves the pink dot in Picture 2, the drawing in this part and
              the numbers in the first two tables. It never changes the grey and orange lines, the published sigma values or your guesses.
            </PartHeader>
            <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)', marginTop: 0, marginBottom: '0.75rem' }}>
              Your guesses do not change the drawings or tables. This setting does. The time you choose is a trial value, not a measurement. It changes where the pink dot sits in
              Picture 2, the drawing below, and the numbers in the first two tables.
            </p>
            <p style={{ fontWeight: 'bold', marginTop: 0, marginBottom: '0.5rem' }}>How far back?</p>
            <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)', marginTop: 0, marginBottom: '0.75rem' }}>
              Choose when the light you are asking about set out (z is the redshift, and “size” is the universe’s size compared with today).
            </p>
            <div style={{ marginBottom: '1.5rem' }}>
              {LOOKBACK_CHOICES.map((z) => (
                <button
                  key={z}
                  type="button"
                  onClick={() => setLookback(z)}
                  className={`toggle-button${lookback === z ? ' is-selected' : ''}`}
                  style={{ marginRight: '0.5rem', marginBottom: '0.5rem', padding: '0.5rem 1rem', fontSize: '0.875rem' }}
                >
                  z = {z} (size {fixed2(1 / (1 + z))})
                </button>
              ))}
            </div>

            {/* Drawing A: the time the learner chose, beside the real description. A grey tick is the constant dark energy, the pink dot is what the chosen
                description gives at that time. Every value comes from the physics module. */}
            <svg width={VIEW_WIDTH} height={340} viewBox={`0 0 ${VIEW_WIDTH} 340`} style={svgStyle} role="img" aria-label={`The time you chose, z = ${lookback}, and what the fit with ${fit.name} gives at that time, beside a constant dark energy`}>
              <text x={DA_TIME_X0 - 20} y={22} fill={TEXT_COLOR} fontSize="13" fontWeight="bold">
                Drawing A: your chosen time beside the real description
              </text>
              <line x1={DA_TIME_X0} y1={72} x2={DA_TIME_X1} y2={72} stroke={MUTED_COLOR} strokeWidth={1.5} />
              {[...LOOKBACK_CHOICES, 0].map((z) => (
                <g key={z}>
                  <line x1={daTimeX(z)} y1={68} x2={daTimeX(z)} y2={76} stroke={MUTED_COLOR} />
                  <text x={daTimeX(z)} y={z === 0.3 ? 102 : 90} fill={MUTED_COLOR} fontSize="10" textAnchor="middle">
                    {z === 0 ? 'today' : `z = ${z}`}
                  </text>
                </g>
              ))}
              <text x={DA_TIME_X0} y={38} fill={MUTED_COLOR} fontSize="10">
                far past ← time → today
              </text>
              <polygon points={`${daTimeX(lookback) - 7},${60} ${daTimeX(lookback) + 7},${60} ${daTimeX(lookback)},${70}`} fill={TRIAL_COLOR} />
              <text x={Math.min(daTimeX(lookback), 470)} y={52} fill={TRIAL_COLOR} fontSize="11" fontWeight="bold" textAnchor="middle">
                your time: z = {lookback}
              </text>
              {(
                [
                  { title: 'Dark energy density, compared with today (×)', value: trial.densityRatio, centre: 1, min: RATIO_MIN, max: RATIO_MAX, ticks: [0.6, 0.8, 1, 1.2, 1.4], text: `${f3(trial.densityRatio)}×`, y: 150 },
                  { title: 'Distance difference (%)', value: trial.distanceDifferencePercent, centre: 0, min: DIST_MIN, max: DIST_MAX, ticks: [-4, -3, -2, -1, 0, 1], text: `${signed2(trial.distanceDifferencePercent)} %`, y: 220 },
                  { title: 'Brightness difference (% brighter)', value: trial.brightnessPercent, centre: 0, min: BRIGHT_MIN, max: BRIGHT_MAX, ticks: [-1, 0, 1, 3, 5, 7], text: `${signed2(trial.brightnessPercent)} %`, y: 290 },
                ] as const
              ).map((row) => (
                <g key={row.title}>
                  <text x={DA_X0 - 60} y={row.y - 32} fill={TEXT_COLOR} fontSize="11" fontWeight="bold">
                    {row.title}
                  </text>
                  <line x1={DA_X0} y1={row.y} x2={DA_X1} y2={row.y} stroke={MUTED_COLOR} strokeWidth={1.5} />
                  {row.ticks.map((t) => (
                    <g key={t}>
                      <line x1={daX(t, row.min, row.max)} y1={row.y - 3} x2={daX(t, row.min, row.max)} y2={row.y + 3} stroke={MUTED_COLOR} />
                      <text x={daX(t, row.min, row.max)} y={row.y + 16} fill={MUTED_COLOR} fontSize="9" textAnchor="middle">
                        {t}
                      </text>
                    </g>
                  ))}
                  <line x1={daX(row.centre, row.min, row.max)} y1={row.y - 11} x2={daX(row.centre, row.min, row.max)} y2={row.y + 11} stroke={CONSTANT_COLOR} strokeWidth={3} />
                  <text x={daX(row.centre, row.min, row.max) + 5} y={row.y - 14} fill={CONSTANT_COLOR} fontSize="10">
                    constant
                  </text>
                  <line x1={daX(row.centre, row.min, row.max)} y1={row.y} x2={daX(row.value, row.min, row.max)} y2={row.y} stroke={TRIAL_COLOR} strokeWidth={3} />
                  <circle cx={daX(row.value, row.min, row.max)} cy={row.y} r={6} fill={TRIAL_COLOR} stroke={TEXT_COLOR} />
                  <text x={Math.min(Math.max(daX(row.value, row.min, row.max), 150), 480)} y={row.y + 30} fill={TRIAL_COLOR} fontSize="11" textAnchor="middle">
                    {fit.name} at z = {lookback}: {row.text}
                  </text>
                </g>
              ))}
            </svg>

            <div style={{ marginTop: '1rem', marginBottom: '1.5rem', fontSize: '0.875rem', color: 'var(--text-muted)' }}>
              <p style={paragraph}>
                <strong>How to read this drawing.</strong> It shows the one time you chose, and what the description you chose says about it, beside what a constant dark energy would
                say. Each row has its own scale, so do not compare the rows with each other.
              </p>
              <ul style={{ margin: '0 0 0.75rem', paddingLeft: '1.25rem' }}>
                <li>
                  <strong>The line at the top and the pink marker:</strong> time, from the far past on the left to today on the right. z is the redshift: z = 1 means the universe was half its
                  present size when the light set out. The pink marker shows the time you chose. Pink always means a trial value that you chose.
                </li>
                <li>
                  <strong>The three rows:</strong> the dark energy’s density compared with today (as in Picture 1), the difference in a galaxy’s distance in percent (the left chart of
                  Picture 2), and the difference in how bright a supernova looks in percent (the right chart, turned into percent: more than 0 means brighter).
                </li>
                <li>
                  <strong>The grey tick, “constant”:</strong> a constant dark energy. It is at 1× for the density and at 0 % for the other two, because a constant dark energy is the
                  comparison. It never moves.
                </li>
                <li>
                  <strong>The pink dot and line in each row:</strong> what the fit with {fit.name} gives at the time you chose. The longer the pink line, the more the description differs
                  from a constant dark energy at that time. A dot on the grey tick would mean no difference.
                </li>
              </ul>
              <p style={paragraph}>
                <strong>A worked moment, with your numbers.</strong> At z = {lookback}, the universe was {fixed2(1 / (1 + lookback))} of its present size. The fit with {fit.name} has
                dark energy at {f3(trial.densityRatio)}× today’s density, a galaxy {signed2(Math.abs(trial.distanceDifferencePercent))} percent {trial.distanceDifferencePercent < 0 ? 'nearer' : 'farther'} than a
                constant dark energy would put it, and a supernova {signed2(Math.abs(trial.brightnessPercent))} percent {trial.brightnessPercent > 0 ? 'brighter' : 'fainter'}.
              </p>
              <p style={{ marginTop: 0, marginBottom: '0.5rem' }}>
                <strong>What to look for.</strong> Here are three things to look at, what each one means, and why it matters.
              </p>
              <ul style={{ margin: '0 0 0.75rem', paddingLeft: '1.25rem' }}>
                <li>
                  <strong>Look at</strong> where each pink dot sits against the grey tick. <strong>What it means:</strong> at z = {lookback} the density is {trial.densityRatio > 1 ? 'above' : 'below'} 1×,
                  and the distance and brightness differ from the grey values by {signed2(trial.distanceDifferencePercent)} % and {signed2(trial.brightnessPercent)} %. <strong>Why it matters:</strong>{' '}
                  the distance and brightness are the signals that surveys can measure, and the density is the cause behind them.
                </li>
                <li>
                  <strong>Look at</strong> how the three rows change as you move the pink marker back in time. <strong>What it means:</strong> try z = 0.3, 0.5, 1 and 2. The density changes one way
                  and the distance and brightness another. <strong>Why it matters:</strong> a big change in the density does not give a big change in what we see. The tutor comes back to the reason.
                </li>
                <li>
                  <strong>Look at</strong> the pink dot in Picture 2’s charts above, and the white brackets and arrow in Pictures 2 and 3. <strong>What it means:</strong> the pink dot moves with this
                  choice. The white marks never move. <strong>Why it matters:</strong> it keeps what you chose to look at apart from what you guessed.
                </li>
              </ul>
              <p style={{ marginTop: 0, marginBottom: 0 }}>
                <strong>Where the real picture comes from.</strong> <em>Measured:</em> w₀, wₐ and the matter fraction of the fit, by the DESI team with the collection you chose.{' '}
                <em>Calculated here:</em> the three values at the time you chose, from those numbers. <em>Imagined for the question:</em> the grey constant dark energy, which is the standard
                model and not a measurement. The pink marker is your own choice of time. Your guesses are not drawn here, because they never change a picture.
              </p>
            </div>

            <PartHeader color="#0f766e" title="Part 3: The results">
              We are about to read the numbers: first a check-up against what a constant dark energy would give, then the tables. A guess never changes them. The time you chose in
              Part 2 changes the first two tables, and the page says which time is on.
            </PartHeader>

            <div style={{ border: '1px solid var(--border-color, #ccc)', borderRadius: '8px', padding: '1rem', fontSize: '0.875rem' }}>
              <p style={{ marginTop: 0, marginBottom: '0.75rem' }}>
                <strong>Results.</strong> These are the numbers behind the three pictures, for the fit with {fit.name}. They only report what was
                published and what was calculated. They do not say why the numbers are what they are.
              </p>

              <p style={{ fontWeight: 'bold', marginBottom: '0.5rem' }}>The check-up: what a constant dark energy would give, and what was found</p>
              <table style={{ borderCollapse: 'collapse', width: '100%', marginBottom: '0.75rem' }}>
                <thead>
                  <tr style={{ borderBottom: '2px solid var(--border-color, #ccc)', textAlign: 'left' }}>
                    <th style={{ padding: '0.4rem 0.5rem 0.4rem 0' }}>What was checked</th>
                    <th style={{ padding: '0.4rem 0.5rem' }}>What we would expect</th>
                    <th style={{ padding: '0.4rem 0.5rem' }}>What was found</th>
                    <th style={{ padding: '0.4rem 0' }}>Reading</th>
                  </tr>
                </thead>
                <tbody>
                  {checkUp.map((row, i) => (
                    <tr key={row.label} style={{ borderBottom: '1px solid var(--border-color, #ccc)' }}>
                      <td style={{ padding: '0.4rem 0.5rem 0.4rem 0' }}>
                        {row.label}
                        {i === 2 && lookback === DEFAULT_LOOKBACK ? ' (the row for Prediction 1)' : ''}
                      </td>
                      <td style={{ padding: '0.4rem 0.5rem' }}>
                        {i === 0 ? '−1 (a constant dark energy)' : i === 1 ? '1× (a constant dark energy)' : i === 2 ? '0 % (a constant dark energy)' : '5 (the usual bar for a discovery)'}
                      </td>
                      <td style={{ padding: '0.4rem 0.5rem' }}>{i === 1 ? `${f3(row.found)}×` : i === 3 ? row.found.toFixed(1) : i === 2 ? signed2(row.found) : f3(row.found)}</td>
                      <td style={{ padding: '0.4rem 0', fontWeight: 'bold' }}>{row.reading}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
              <p style={{ color: 'var(--text-muted)', marginTop: 0, marginBottom: '0.75rem' }}>
                The check-up follows the collection you chose and the time you chose in Part 2 (z = {lookback}). It never follows your guesses.
              </p>
              <div style={{ color: 'var(--text-muted)', marginBottom: '1.5rem' }}>
                <p style={{ margin: '0 0 0.5rem' }}>
                  <strong>What this table tells us.</strong>
                </p>
                <ul style={{ margin: 0, paddingLeft: '1.25rem' }}>
                  <li>
                    <strong>w today.</strong> A constant dark energy has w = −1 exactly. The fit with {fit.name} has w₀ = {published(fit.w0)}, which is {checkUp[0].reading} than −1, so this description says dark energy is
                    not exactly constant today. It matters because every later row grows from w₀ and wₐ.
                  </li>
                  <li>
                    <strong>Density.</strong> A constant dark energy keeps 1× at every time. At z = {lookback} this description gives {f3(checkUp[1].found)}×: {checkUp[1].found > 1 ? 'stronger' : 'weaker'} than today by about{' '}
                    {percentFromToday(checkUp[1].found)} percent. It matters because this is the cause that Picture 2 turns into distances.
                  </li>
                  <li>
                    <strong>Distance.</strong> 0 % would be no change. {signed2(checkUp[2].found)} % means a galaxy at z = {lookback} would look {checkUp[2].found < 0 ? 'nearer' : 'farther'}. It matters because this is the kind of
                    signal that surveys look for.
                  </li>
                  <li>
                    <strong>Sigma.</strong> 5 is the usual bar for calling a difference a discovery. The collection you chose has {fit.sigma.toFixed(1)}, which is {checkUp[3].reading}. It matters because it says how strong the
                    hint is, not how likely it is that dark energy really changes.
                  </li>
                </ul>
              </div>

              <p style={{ fontWeight: 'bold', marginBottom: '0.5rem' }}>Your guesses, beside the results</p>
              <p style={{ color: 'var(--text-muted)', marginTop: 0, marginBottom: '0.5rem' }}>
                Your guesses are shown here as you made them, with the place where each one’s number appears. They are not marked here, and they never change a picture or a table.
              </p>
              <ul style={{ marginTop: 0, paddingLeft: '1.25rem', marginBottom: '1.5rem' }}>
                <li>
                  <strong>Prediction 1, how different the distance looks:</strong> {distancePrediction !== null ? DISTANCE_CHOICES.find((c) => c.value === distancePrediction)?.label.toLowerCase() : ''}. The question was about a galaxy at
                  z = 0.5. Its number is in the check-up (the row for Prediction 1), in Table 1 (the row “Distance difference”), in Table 2 (the column z = 0.5) and in Picture 2.
                  {lookback !== DEFAULT_LOOKBACK && ' The check-up and Table 1 are showing the time you chose, z = ' + lookback + ', so choose z = 0.5 in Part 2 to see the row for this prediction.'}
                </li>
                <li>
                  <strong>Prediction 2, what the recalibration did:</strong> {recalibrationPrediction !== null ? RECALIBRATION_CHOICES.find((c) => c.value === recalibrationPrediction)?.label.toLowerCase() : ''}. The question was
                  what the 2025 recalibration of the DES supernovae did to the preference. Its numbers are in Table 3 (the rows “DES Y5” and “DES Y5 recalibrated (Dovekie)”) and in Picture 3.
                </li>
              </ul>

              <p style={{ fontWeight: 'bold', marginBottom: '0.5rem' }}>Your collection, and the time you chose (z = {lookback})</p>
              <table style={{ borderCollapse: 'collapse', width: '100%', marginBottom: '1.5rem' }}>
                <tbody>
                  {(
                    [
                      ['Supernova collection', `${fit.name} (${fit.source}, Table 5)`],
                      ['w₀, wₐ and the amount of matter', `${published(fit.w0)}, ${published(fit.wa)} and ${fit.omegaMatter}`],
                      ['Published preference over a constant dark energy', `${fit.sigma.toFixed(1)} sigma`],
                      ['w today', `${f3(result.equationOfStateToday)}`],
                      [`w at z = ${lookback}`, `${f3(marked.equationOfState)}`],
                      ['Dark energy density today, compared with today', '1.000×'],
                      [`Dark energy density at z = ${lookback}, compared with today`, `${f3(marked.densityRatio)}×`],
                      [`Distance difference at z = ${lookback}${lookback === DEFAULT_LOOKBACK ? ' (the row for Prediction 1)' : ''}`, `${signed2(marked.distanceDifferencePercent)} %`],
                      [`Brightness difference at z = ${lookback} (nearby lined up)`, `${f3(marked.magnitudeDifference)} magnitudes (${signed2(brightness.percent)} % in brightness)`],
                    ] as const
                  ).map(([name, value]) => (
                    <tr key={name} style={{ borderBottom: '1px solid var(--border-color, #ccc)' }}>
                      <td style={{ padding: '0.4rem 0.5rem 0.4rem 0' }}>{name}</td>
                      <td style={{ padding: '0.4rem 0', fontWeight: 'bold', textAlign: 'right' }}>{value}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
              <div style={{ color: 'var(--text-muted)', marginBottom: '1.5rem' }}>
                <p style={{ margin: '0 0 0.5rem' }}>
                  <strong>What this table tells us.</strong>
                </p>
                <ul style={{ margin: 0, paddingLeft: '1.25rem' }}>
                  <li>
                    <strong>The collection, w₀, wₐ and the matter fraction.</strong> These are the numbers the DESI team found fit best with {fit.name}: w₀ = {published(fit.w0)}, wₐ = {published(fit.wa)}, matter fraction {fit.omegaMatter}. They
                    matter because every other number on this page is worked out from them.
                  </li>
                  <li>
                    <strong>The published preference.</strong> {fit.sigma.toFixed(1)} sigma, quoted from the paper, not worked out here. It means a result this far from a constant dark energy would be an unusual fluke if dark energy
                    were constant, but not as unusual as the 5 sigma bar asks for. It matters because it is the strength of the hint, and the page does not say whether the hint is real.
                  </li>
                  <li>
                    <strong>w and the density at z = {lookback}.</strong> w is {f3(marked.equationOfState)} then, compared with {published(fit.w0)} today, and the density is {f3(marked.densityRatio)}× today’s. It matters because w says how the
                    dark energy’s strength is changing, and the density is how much of it there is.
                  </li>
                  <li>
                    <strong>The distance and brightness differences.</strong> At z = {lookback}: {signed2(marked.distanceDifferencePercent)} % in distance and {f3(marked.magnitudeDifference)} magnitudes ({signed2(brightness.percent)} % in brightness).
                    A minus sign on the distance means nearer, and a minus sign on the magnitudes means brighter. It matters because these are what a survey could measure, as in Picture 2.
                  </li>
                </ul>
              </div>

              <p style={{ fontWeight: 'bold', marginBottom: '0.5rem' }}>The same numbers at four times in the past, for {fit.name}</p>
              <div style={{ overflowX: 'auto', marginBottom: '1.5rem' }}>
                <table style={{ borderCollapse: 'collapse', width: '100%', minWidth: '420px' }}>
                  <thead>
                    <tr style={{ borderBottom: '2px solid var(--border-color, #ccc)', textAlign: 'right' }}>
                      <th style={{ padding: '0.4rem 0.5rem 0.4rem 0', textAlign: 'left' }}>At redshift</th>
                      {result.atEachRedshift.map((r) => (
                        <th key={r.redshift} style={{ padding: '0.4rem 0.5rem' }}>
                          z = {r.redshift}
                          <br />
                          <span style={{ fontWeight: 'normal' }}>size {fixed2(1 / (1 + r.redshift))}</span>
                          {r.redshift === DEFAULT_LOOKBACK && (
                            <>
                              <br />
                              <span style={{ fontWeight: 'normal' }}>(the column for Prediction 1)</span>
                            </>
                          )}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {(
                      [
                        ['Dark energy density (× today)', (r: (typeof result.atEachRedshift)[number]) => `${f3(r.densityRatio)}×`],
                        ['w', (r: (typeof result.atEachRedshift)[number]) => f3(r.equationOfState)],
                        ['Distance difference (%)', (r: (typeof result.atEachRedshift)[number]) => signed2(r.distanceDifferencePercent)],
                        ['Brightness difference (magnitudes)', (r: (typeof result.atEachRedshift)[number]) => f3(r.magnitudeDifference)],
                      ] as const
                    ).map(([name, format]) => (
                      <tr key={name} style={{ borderBottom: '1px solid var(--border-color, #ccc)' }}>
                        <td style={{ padding: '0.4rem 0.5rem 0.4rem 0' }}>{name}</td>
                        {result.atEachRedshift.map((r) => (
                          <td
                            key={r.redshift}
                            style={{ padding: '0.4rem 0.5rem', textAlign: 'right', fontWeight: r.redshift === lookback ? 'bold' : 'normal' }}
                          >
                            {format(r)}
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <div style={{ color: 'var(--text-muted)', marginBottom: '1.5rem' }}>
                <p style={{ margin: '0 0 0.5rem' }}>
                  <strong>What this table tells us.</strong>
                </p>
                <ul style={{ margin: 0, paddingLeft: '1.25rem' }}>
                  <li>
                    <strong>The same four numbers at four times.</strong> The distance difference is {signed2(result.atEachRedshift[0].distanceDifferencePercent)} % at z = 0.3, {signed2(result.atEachRedshift[1].distanceDifferencePercent)} % at z = 0.5,{' '}
                    {signed2(result.atEachRedshift[2].distanceDifferencePercent)} % at z = 1 and {signed2(result.atEachRedshift[3].distanceDifferencePercent)} % at z = 2, and the deepest point of the curve is at z = {dip.redshift}. It matters because
                    the density changes more as you go back in time, while the distance difference does not keep growing. The tutor comes back to the reason.
                  </li>
                  <li>
                    <strong>The time you chose</strong> is in bold. It follows “How far back?” in Part 2. The column marked for Prediction 1 is z = 0.5, whatever time you chose.
                  </li>
                </ul>
              </div>

              <p style={{ fontWeight: 'bold', marginBottom: '0.5rem' }}>The published preferences for a changing dark energy</p>
              <table style={{ borderCollapse: 'collapse', width: '100%', marginBottom: '1.5rem' }}>
                <thead>
                  <tr style={{ borderBottom: '2px solid var(--border-color, #ccc)', textAlign: 'left' }}>
                    <th style={{ padding: '0.4rem 0.5rem 0.4rem 0' }}>Data combined</th>
                    <th style={{ padding: '0.4rem 0.5rem', textAlign: 'right' }}>Sigma (quoted)</th>
                    <th style={{ padding: '0.4rem 0 0.4rem 0.5rem' }}>Source</th>
                  </tr>
                </thead>
                <tbody>
                  {PUBLISHED_SIGMAS.map((row) => (
                    <tr key={row.name} style={{ borderBottom: '1px solid var(--border-color, #ccc)', fontWeight: row.name === fit.name ? 'bold' : 'normal' }}>
                      <td style={{ padding: '0.4rem 0.5rem 0.4rem 0' }}>
                        {row.name}
                        {row.name === fit.name ? ' (the one you chose)' : ''}
                        {row.name === 'DES Y5' || row.name === 'DES Y5 recalibrated (Dovekie)' ? ' (the row for Prediction 2)' : ''}
                      </td>
                      <td style={{ padding: '0.4rem 0.5rem', textAlign: 'right' }}>{row.sigma.toFixed(1)}</td>
                      <td style={{ padding: '0.4rem 0 0.4rem 0.5rem' }}>{row.source}</td>
                    </tr>
                  ))}
                  <tr style={{ borderBottom: '1px solid var(--border-color, #ccc)' }}>
                    <td style={{ padding: '0.4rem 0.5rem 0.4rem 0' }}>The same, “also including supernovae” (collection not stated in the abstract; no bar)</td>
                    <td style={{ padding: '0.4rem 0.5rem', textAlign: 'right' }}>3.2</td>
                    <td style={{ padding: '0.4rem 0 0.4rem 0.5rem' }}>DESI Collaboration, arXiv:2607.27410</td>
                  </tr>
                </tbody>
              </table>

              <div style={{ color: 'var(--text-muted)' }}>
                <p style={{ margin: '0 0 0.5rem' }}>
                  <strong>What this table tells us.</strong>
                </p>
                <ul style={{ margin: 0, paddingLeft: '1.25rem' }}>
                  <li>
                    <strong>The sigma values.</strong> Each is quoted from its paper, not worked out here. They run from {Math.min(...sigmasOfFits).toFixed(1)} to {Math.max(...sigmasOfFits).toFixed(1)} for the three collections, {DES_RECALIBRATION.afterSigma.toFixed(1)} for the
                    recalibrated DES supernovae (the number the second prediction is about) and {PUBLISHED_SIGMAS[PUBLISHED_SIGMAS.length - 1].sigma.toFixed(1)} for the July 2026 analysis. It matters because it shows how the strength of the hint
                    depends on which data are combined.
                  </li>
                  <li>
                    <strong>Not to be added up.</strong> The rows are different combinations of data, so they should not be added or averaged.
                  </li>
                </ul>
              </div>
            </div>

            <div style={{ marginTop: '1.5rem', fontSize: '0.875rem', color: 'var(--text-muted)' }}>
              <p style={{ marginTop: 0, marginBottom: 0 }}>
                <strong>More to read, now that you have seen the results.</strong> {MORE_LINKS_TEXT} They open in a new tab.
              </p>
              <ul style={{ margin: '0.25rem 0 0', paddingLeft: '1.25rem' }}>
                <li>
                  <ExternalLink href="https://www.desi.lbl.gov/2026/07/30/new-desi-dr2-lyman-alpha-results-shed-light-on-dark-energy/">
                    DESI: New DR2 Lyman-alpha results shed light on dark energy
                  </ExternalLink>
                  : DESI’s own plain-language note on its July 2026 analysis.
                </li>
                <li>
                  <ExternalLink href="https://arxiv.org/abs/2607.27410">DESI DR2 Results IV (July 2026)</ExternalLink>: the scientific paper
                  behind that note, with the 2.7 and 3.2 sigma values (technical words).
                </li>
                <li>
                  <ExternalLink href="https://arxiv.org/abs/2511.07517">
                    The Dark Energy Survey supernova program: a reanalysis with an updated calibration (2025)
                  </ExternalLink>
                  : the paper on the recalibrated DES supernovae (technical words).
                </li>
              </ul>
            </div>
          </div>
        )}

        {/* The tutor: observe, compare with the predictions, one conceptual question, then the explanation. The summary below the experiment
            (in App) is shown only once the learner reaches the explanation. */}
        {status === 'complete' && (
          <PartHeader color="#0066cc" title="Part 4: The tutor">
            We are about to talk through your two predictions with the tutor, who will compare them with the results. Three short questions, one at a time. Nothing is graded.
          </PartHeader>
        )}
        {status === 'complete' && distancePrediction !== null && recalibrationPrediction !== null && (
          <EvolvingDarkEnergyTutor
            fit={fit}
            distancePrediction={distancePrediction}
            recalibrationPrediction={recalibrationPrediction}
            onExplained={() => onTutorComplete?.()}
          />
        )}
      </div>
    </div>
  )
}
