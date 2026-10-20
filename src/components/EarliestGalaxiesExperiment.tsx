import { useEffect, useState } from 'react'
import type { ReactNode } from 'react'
import {
  ageAfterBigBangYears,
  LYMAN_ALPHA_NM,
  MAX_REDSHIFT,
  MOM_Z14_PAPER_AGE_YEARS,
  MOM_Z14_REDSHIFT,
  NUMBER_DENSITY_EXCESS,
  observedWavelengthNm,
  RECORDS,
  runEarliestGalaxies,
  SLIDER_MIN_REDSHIFT,
} from '../physics/earliestGalaxies'
import type { AgeShareRange, CountRange } from '../physics/earliestGalaxies'
import { EarliestGalaxiesTutor } from './EarliestGalaxiesTutor'
import { ReferencePanel } from './EnergyMomentumExperiment'

// Frontier and Beyond, Experiment 5 (docs/experiments/frontier-and-beyond/05-how-early-can-galaxies-form.md).
// Step 2 built the status line, the introduction with its new-word list and its "Want to know more?" links, a drawing of a stretched wave
// (an illustration, not data), the collapsed "Words and formulas" panel and the skeleton of Picture 1 with its guide. Step 3 adds the two
// predictions, Run, the five-stage run, the stretching and Webb's range on Picture 1, Picture 2 (the clock and the ruler) and Picture 3
// (the count), each with a guide. Step 4 added the "Look at another galaxy" control, the results tables and their guide, the formulas and the links
// kept back. Step 5 adds the tutor (EarliestGalaxiesTutor.tsx) and the chapter summary (in App.tsx).
// All wording is draft for the owner's line-by-line approval (CLAUDE.md §28.1), written to the standard of §29. Nothing the predictions ask
// is shown before the run (§12). The interface only displays numbers from src/physics (CLAUDE.md §9); the only calculation here is where a
// point is drawn.

interface EarliestGalaxiesExperimentProps {
  onComplete?: () => void
  onTutorComplete?: () => void
}

const VIEW_WIDTH = 560
const TEXT_COLOR = '#e2e8f0'
const MUTED_COLOR = '#94a3b8'
const ULTRAVIOLET_COLOR = '#a78bfa' // violet: ultraviolet light
const VISIBLE_COLOR = '#fde047' // yellow: visible light
const INFRARED_COLOR = '#f87171' // red: infrared light
const LYMAN_COLOR = '#38bdf8' // sky blue: the Lyman-alpha light being followed

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

// ---- The stretched wave (an illustration, not data) ----
// A wave drawn on a rubber band, before and after the band is pulled to twice its length. Drawn with a sine path.
const BAND_X = 40
const BAND_SHORT = 200
const BAND_STRETCH = 2
const WAVE_CYCLES = 4

function wavePath(x0: number, width: number, y: number, amplitude: number): string {
  const points: string[] = []
  const steps = 160
  for (let i = 0; i <= steps; i++) {
    const x = x0 + (width * i) / steps
    const yy = y - amplitude * Math.sin((2 * Math.PI * WAVE_CYCLES * i) / steps)
    points.push(`${i === 0 ? 'M' : 'L'}${x.toFixed(1)},${yy.toFixed(1)}`)
  }
  return points.join(' ')
}

function StretchedWaveDrawing() {
  const height = 266
  const longWidth = BAND_SHORT * BAND_STRETCH
  const rows = [
    { y: 84, width: BAND_SHORT, label: 'Before: the rubber band is relaxed', color: LYMAN_COLOR, note: 'one wave is 50 units long; the two dots are 200 units apart' },
    { y: 190, width: longWidth, label: 'After: the band is pulled to twice its length', color: INFRARED_COLOR, note: 'one wave is now 100 units long; the dots are 400 units apart' },
  ]
  return (
    <svg
      width={VIEW_WIDTH}
      height={height}
      viewBox={`0 0 ${VIEW_WIDTH} ${height}`}
      style={svgStyle}
      role="img"
      aria-label="A wave drawn on a rubber band, shown before and after the band is stretched to twice its length: the wave becomes twice as long and the two dots twice as far apart"
    >
      <text x={BAND_X} y={22} fill={TEXT_COLOR} fontSize="13" fontWeight="bold">
        Illustration: a wave on a rubber band that is pulled
      </text>
      {rows.map((row) => (
        <g key={row.label}>
          <text x={BAND_X} y={row.y - 40} fill={row.color} fontSize="11" fontWeight="bold">
            {row.label}
          </text>
          <line x1={BAND_X} y1={row.y} x2={BAND_X + row.width} y2={row.y} stroke={MUTED_COLOR} strokeWidth={1} strokeDasharray="3 3" />
          <path d={wavePath(BAND_X, row.width, row.y, 16)} fill="none" stroke={row.color} strokeWidth={2.5} />
          <circle cx={BAND_X} cy={row.y} r={5} fill={TEXT_COLOR} />
          <circle cx={BAND_X + row.width} cy={row.y} r={5} fill={TEXT_COLOR} />
          <text x={BAND_X} y={row.y + 34} fill={TEXT_COLOR} fontSize="11">
            {row.note}
          </text>
        </g>
      ))}
      <text x={BAND_X} y={height - 6} fill={MUTED_COLOR} fontSize="10">
        The units are for illustration only. The two white dots stand for two galaxies.
      </text>
    </svg>
  )
}

// ---- Picture 1: the wave of light, and where it sits (Step 2: the axis, the three kinds of light and the light as it leaves the galaxy) ----
const AXIS_LEFT = 40
const AXIS_RIGHT = 520
const AXIS_MIN_NM = 100
const AXIS_MAX_NM = 3000
const AXIS_Y = 132
const BAND_TOP = 98
const ULTRAVIOLET_TO_VISIBLE_NM = 400
const VISIBLE_TO_INFRARED_NM = 700
// The axis is not even: it spaces the logarithm of the wavelength, so 100 nm, 1,000 nm and a few thousand nm are all on the page.
const xOfNm = (nm: number) =>
  AXIS_LEFT + ((Math.log10(nm) - Math.log10(AXIS_MIN_NM)) / (Math.log10(AXIS_MAX_NM) - Math.log10(AXIS_MIN_NM))) * (AXIS_RIGHT - AXIS_LEFT)
const P1_HEIGHT = 274
const WEBB_MIN_NM = 600 // NASA: NIRCam is designed to capture light from 0.6 microns to 5 microns
const ARRIVED_COLOR = '#f87171' // red: the light after the stretching
const WEBB_COLOR = '#4ade80' // green: Webb's range

// Picture 2: the clock and the ruler.
const TL_LEFT = 40
const TL_RIGHT = 520
const ZOOM_MAX_MYR = 500 // the zoomed bar shows the first 500 million years
const ZOOM_BAR_Y = 202
const RULER_TOP = 288
const RULER_MAX_GLY = 40
const P2_HEIGHT_CLOCK = 274
const P2_HEIGHT_FULL = RULER_TOP + 186
const MOM_COLOR = '#fb923c' // orange: the galaxy of this run
const RECORD_COLOR = '#cbd5e1' // grey-blue: the earlier record holders
const TRAVEL_COLOR = '#38bdf8' // sky blue: how far the light travelled
const THEN_COLOR = '#34d399' // green: the distance when the light left
const NOW_COLOR = '#fbbf24' // yellow: the distance now

// Picture 3: the count.
const P3_AXIS_Y = 190
const P3_HEIGHT = 250
const MODEL_COLOR = '#a78bfa' // violet: the models
const SURVEY_COLOR = '#f472b6' // pink: the survey's estimate
// A logarithmic scale from 1 to 1,000: each tick is ten times the one before.
const countX = (times: number) => TL_LEFT + (Math.log10(times) / 3) * (TL_RIGHT - TL_LEFT)

const STAGE_MS = 2600
const STAGES = [
  'The light is stretched',
  'The age of the universe then',
  'The distance',
  'The record holders',
  'How many were expected?',
]
const LAST_STAGE = STAGES.length

const AGE_CHOICES: ReadonlyArray<{ value: AgeShareRange; label: string }> = [
  { value: 'about1', label: 'About 1 percent (under 1.5 percent)' },
  { value: 'about2', label: 'About 2 percent (1.5 to 4 percent)' },
  { value: 'about10', label: 'About 10 percent (over 4 percent)' },
]
const COUNT_CHOICES: ReadonlyArray<{ value: CountRange; label: string }> = [
  { value: 'fewer', label: 'Fewer than the models predicted' },
  { value: 'same', label: 'About the same as the models predicted' },
  { value: 'few', label: 'A few times more than the models predicted' },
  { value: 'hundred', label: 'About a hundred times more, or higher' },
]

const REFERENCE_ENTRIES: { term: string; meaning: string }[] = [
  { term: 'Galaxy', meaning: 'a huge family of stars, gas and dust held together by gravity. Our own galaxy, the Milky Way, has hundreds of billions of stars. The universe has a vast number of galaxies (Cosmology Experiments 4, 7 and 9).' },
  { term: 'Cosmic dawn', meaning: 'the time, a few hundred million years after the Big Bang, when the first stars and galaxies began to shine. “Dawn” is the first light of the day; this was the first light of the universe’s stars.' },
  { term: 'Redshift (z)', meaning: 'a way of saying how much the light of a far-away galaxy has been stretched on its way to us (Cosmology Experiments 1 and 8). z = 0 is no stretch. A redshift z means the light has been stretched to 1 + z times its original length. The bigger z is, the longer ago the light left, and the more it has been stretched.' },
  { term: 'Stretch factor (1 + z)', meaning: 'how many times longer the light’s wavelength has become. For z = 1 it is 2: every wave is twice as long as when it left. For z = 5 it is 6.' },
  { term: 'Wavelength, and nm and µm', meaning: 'light is a wave, and its wavelength is the distance from one crest to the next. A nanometre (nm) is a billionth of a metre. A micrometre (µm) is a thousand nanometres, a thousandth of a millimetre. Different wavelengths are different kinds of light.' },
  { term: 'Ultraviolet, visible and infrared light', meaning: 'three kinds of light, sorted by wavelength. Visible light is what our eyes can see, from about 400 nm (violet) to about 700 nm (red). Ultraviolet has shorter waves than violet, and our eyes cannot see it (it is what causes sunburn). Infrared has longer waves than red, and our eyes cannot see it either (it is the heat you feel from a warm stove). “Near-infrared” is the infrared closest to red.' },
  { term: 'Spectrum', meaning: 'light split into its separate colours, like a rainbow made by a prism. Telescopes can make a spectrum of a single galaxy. It shows bright lines, dark edges and other marks at particular wavelengths, which work like fingerprints.' },
  { term: 'Lyman-alpha and the Lyman-alpha break', meaning: 'Lyman-alpha is a particular wavelength of ultraviolet light, 121.6 nm, given out and taken in by hydrogen, the most common gas in the universe. Cool hydrogen gas soaks up light bluer than this wavelength, so the spectrum of a very distant galaxy has a sharp edge, called the Lyman-alpha break: bright on one side, dark on the other. Where the edge falls tells us the redshift.' },
  { term: 'Photometric and spectroscopic redshift', meaning: 'two ways to find a redshift. Photometric: photograph the galaxy through several colour filters and estimate the redshift from which filters it shows up in, like guessing a person’s height from a blurry photo. It can be wrong. Spectroscopic: make a spectrum and measure where the Lyman-alpha break and the bright lines fall, like using a tape measure. A galaxy is called “confirmed” only when its redshift comes from a spectrum.' },
  { term: 'Light-year', meaning: 'the distance light travels in one year, about 9.5 trillion kilometres (Cosmology Experiment 8). Light from a galaxy 1 billion light-years away took about 1 billion years to arrive.' },
  { term: 'James Webb Space Telescope (JWST)', meaning: 'a large space telescope that observes infrared light. NASA, ESA (the European Space Agency) and CSA (the Canadian Space Agency) built it together. It was designed to see the first galaxies, whose light has been stretched into the infrared on the way to us.' },
  { term: 'NIRSpec', meaning: 'one of JWST’s instruments, the Near-InfraRed Spectrograph. It splits the near-infrared light of a galaxy into a spectrum, which is how redshifts are confirmed (see the ESA link below).' },
  { term: 'Number density', meaning: 'how many of something there are in a given volume of space, such as how many bright galaxies in a cube of space a billion light-years across.' },
  { term: 'Time after the Big Bang', meaning: 'how long it had been since the universe began to expand, at the moment the light we are looking at left its galaxy. It is how old the universe was then (Cosmology Experiment 2). The universe is now about 13.8 billion years old.' },
  { term: 'Distance when the light left, and distance now', meaning: 'two different distances to the same galaxy (Cosmology Experiment 8). Space has been stretching ever since the light left, so the galaxy is now much further away than it was then. Neither is the same as how far the light travelled.' },
  { term: 'Models of galaxy formation', meaning: 'computer programs that start from the early universe and follow how gas gathers, cools and turns into stars and galaxies, to predict how many galaxies of each size and brightness there should be at each time. They are tested by comparing their predictions with what telescopes see.' },
  { term: 'Logarithmic scale', meaning: 'a scale on which each step along the line multiplies the value instead of adding to it, for example by 10. It lets numbers that differ a lot, such as 1 and 1,000, fit on one picture. On this page it is used for wavelengths (Picture 1) and for numbers of galaxies (Picture 3).' },
  { term: 'Bright', meaning: 'in this experiment, “bright” means giving out a lot of light, whatever the distance. A galaxy can look faint because it is far away and still be intrinsically bright.' },
]

export function EarliestGalaxiesExperiment({ onComplete, onTutorComplete }: EarliestGalaxiesExperimentProps) {
  const [agePrediction, setAgePrediction] = useState<AgeShareRange | null>(null)
  const [countPrediction, setCountPrediction] = useState<CountRange | null>(null)
  const [status, setStatus] = useState<'idle' | 'running' | 'complete'>('idle')
  const [stage, setStage] = useState(0)
  // The galaxy shown: MoM-z14 (the most distant confirmed with a spectrum) for the run, and after the run the learner can choose another
  // record holder or an imaginary galaxy (the control "Look at another galaxy").
  const [redshift, setRedshift] = useState(MOM_Z14_REDSHIFT)
  const [whatIf, setWhatIf] = useState(false)
  const [sliderZ, setSliderZ] = useState(20)

  // Every number comes from the physics module.
  const result = runEarliestGalaxies(redshift)
  const record = whatIf ? undefined : RECORDS.find((r) => r.redshift === redshift)
  const nameThe = record ? record.name : 'the imaginary galaxy'
  const nameCap = record ? record.name : 'An imaginary galaxy'
  const possessive = record ? `${record.name}’s` : 'the imaginary galaxy’s'
  const galaxyPhrase = record ? `the galaxy ${record.name}` : 'the imaginary galaxy'
  const bothPredicted = agePrediction !== null && countPrediction !== null
  const lymanX = xOfNm(LYMAN_ALPHA_NM)
  const doubledNm = observedWavelengthNm(LYMAN_ALPHA_NM, 1) // a worked example for the guide: a stretch by 2 (z = 1)
  const doubledX = xOfNm(doubledNm)
  const stretchedNm = result.lymanAlphaObservedNm
  // For a redshift above about 23.7 the stretched Lyman-alpha is beyond the 3,000 nm end of the scale: the arrow then runs to the edge.
  const offScale = stretchedNm > AXIS_MAX_NM
  const stretchedX = xOfNm(Math.min(stretchedNm, AXIS_MAX_NM))
  const presentMyr = result.presentAgeYears / 1e6
  const ageMyr = result.ageAfterBigBangYears / 1e6
  const presentBillions = (result.presentAgeYears / 1e9).toFixed(1)
  const travelGly = result.lightTravelYears / 1e9
  const thenGly = result.distanceThenLightYears / 1e9
  const todayGly = result.distanceTodayLightYears / 1e9
  const wholeX = (myr: number) => TL_LEFT + (myr / presentMyr) * (TL_RIGHT - TL_LEFT)
  const zoomX = (myr: number) => TL_LEFT + (myr / ZOOM_MAX_MYR) * (TL_RIGHT - TL_LEFT)
  // The four record holders and, for an imaginary galaxy, that galaxy too. Tier 0 is the lowest label above the zoomed bar: the markers are
  // ordered from the earliest time (the smallest x) up, so that a marker's line never crosses another's label, which ends at its own marker.
  const baseMarkers = RECORDS.map((r) => ({ name: r.name, redshift: r.redshift, myr: ageAfterBigBangYears(r.redshift) / 1e6, isRun: !whatIf && r.redshift === redshift }))
  const allMarkers = whatIf ? [...baseMarkers, { name: 'An imaginary galaxy', redshift, myr: ageMyr, isRun: true }] : baseMarkers
  const markers = allMarkers
    .filter((m) => m.isRun || stage >= 4)
    .sort((a, b) => a.myr - b.myr)
    .map((m, tier) => ({ ...m, tier }))
  const p2Height = stage >= 3 ? P2_HEIGHT_FULL : P2_HEIGHT_CLOCK

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
    setAgePrediction(null)
    setCountPrediction(null)
    setStatus('idle')
    setStage(0)
    setRedshift(MOM_Z14_REDSHIFT)
    setWhatIf(false)
    setSliderZ(20)
  }
  const run = () => {
    setStage(1)
    setStatus('running')
  }

  // After the run: the formulas, each with a worked example for the galaxy shown (the formulas wait until now, §12).
  const f2 = result.stretchFactor.toFixed(2)
  const presentMyrText = Math.round(presentMyr).toLocaleString('en-US')
  const formulaEntries: { term: string; meaning: string }[] = [
    {
      term: 'The stretch factor (formula)',
      meaning: `stretch factor = 1 + z. Example, for ${nameThe}: 1 + ${redshift} = ${f2}, so every wave has become ${f2} times as long as when it left.`,
    },
    {
      term: 'The stretched wavelength (formula)',
      meaning: `wavelength when it arrives = wavelength when it left × (1 + z). Example, for Lyman-alpha: ${LYMAN_ALPHA_NM} × ${f2} = ${stretchedNm.toFixed(1)} nm, which is ${(stretchedNm / 1000).toFixed(3)} µm.`,
    },
    {
      term: 'The size of the universe then (formula)',
      meaning: `size then, as a fraction of today’s = 1 ÷ (1 + z). Example: 1 ÷ ${f2} = ${result.relativeSizeThen.toFixed(4)}, which is ${(result.relativeSizeThen * 100).toFixed(2)} percent of today’s size.`,
    },
    {
      term: 'The age then (the age function)',
      meaning: `The time after the Big Bang at a given redshift comes from the expansion model of Cosmology Experiments 6 and 8: a universe of matter and dark energy, with radiation left out, at Planck’s expansion rate (67.4 km/s per Mpc) and matter share (0.315). It is a formula with an inverse hyperbolic sine in it, so there is no short step-by-step sum to show here. The tests of this experiment check it against a separate numerical integration. For ${nameThe} it gives ${Math.round(ageMyr)} million years.`,
    },
    {
      term: 'The share of the present age (formula)',
      meaning: `share = (time after the Big Bang then) ÷ (the universe’s present age). Example: ${Math.round(ageMyr)} ÷ ${presentMyrText} = ${(result.shareOfPresentAge * 100).toFixed(2)} percent.`,
    },
    {
      term: 'How long the light travelled (formula)',
      meaning: `light travel time = present age − time after the Big Bang then. Example: ${presentMyrText} − ${Math.round(ageMyr)} = ${Math.round(presentMyr - ageMyr).toLocaleString('en-US')} million years, which is ${travelGly.toFixed(2)} billion years. Light covers one light-year in a year, so the distance the light travelled is the same number in light-years.`,
    },
    {
      term: 'The two distances (formulas)',
      meaning: `distance when the light left = distance now ÷ (1 + z). The distance now comes from the comoving-distance function of Cosmology Experiments 5 and 8 (an integral of the expansion rate), at Planck’s expansion rate. Example for ${nameThe}: the distance now is ${todayGly.toFixed(2)} billion light-years, so the distance then is ${todayGly.toFixed(2)} ÷ ${f2} = ${thenGly.toFixed(2)} billion light-years.`,
    },
  ]

  return (
    <div>
      <h2>Experiment 5 — How Early Can Galaxies Form?</h2>
      <div className="exp-card" style={{ marginTop: '2rem', padding: '1.5rem' }}>
        <p style={{ marginTop: 0, marginBottom: '1.5rem', fontSize: '0.875rem' }}>
          <strong>Where this stands (as of October 2026): Strong evidence that these galaxies exist; Open: what built them so fast.</strong> The
          galaxies have been measured, with spectra, by several teams. What explains them is not settled.
        </p>

        {/* Introduction: draft wording for the owner's review (CLAUDE.md §28.1), written to the standard of CLAUDE.md §29. */}
        <div style={{ marginBottom: '2rem', fontSize: '0.875rem', color: 'var(--text-muted)' }}>
          <p style={paragraph}>
            <strong>The question.</strong> How soon after the Big Bang could galaxies already exist, and how can we know?
          </p>

          <p style={paragraph}>
            <strong>Where we left off.</strong> Experiments 1 to 4 of this group were about measurements that disagree, or are close to their limit:
            the expansion rate, a dark energy that might change, the lumpiness of the universe, and the weight of a neutrino. This experiment is
            about a different kind of news. It is not a disagreement between two measurements. It is about what a new telescope found when it
            looked further back in time than any telescope before it.
          </p>

          <p style={paragraph}>
            <strong>What is a galaxy, and what is the cosmic dawn?</strong> A <strong>galaxy</strong> is a huge family of stars, gas and dust held
            together by gravity. Our own, the Milky Way, has hundreds of billions of stars. A few hundred million years after the Big Bang there
            were no galaxies like it yet: the universe was mostly gas, and the first stars were only beginning to light up. Astronomers call that
            time the <strong>cosmic dawn</strong>, like the first light of a new day. One of the main reasons the James Webb Space Telescope (JWST)
            was built was to watch the cosmic dawn: how the first galaxies formed, and whether they made the universe transparent to light (see
            the NASA and STScI link below).
          </p>

          <p style={paragraph}>
            <strong>Looking far away is looking back in time.</strong> Light takes time to travel (Cosmology Experiment 8). When you see a far-away
            street lamp, you see the light that left it a moment ago. When you see a far-away galaxy, you see the light that left it a very long
            time ago, so you see the galaxy <em>as it was</em> then. The further away the galaxy, the further back in time you look. That is how a
            telescope can be a time machine: the most distant galaxies it can see are the youngest ones.
          </p>

          <p style={paragraph}>
            <strong>What is a redshift, and why does it matter here?</strong> The universe is expanding (Cosmology Experiment 1), and the
            expansion stretches the light that travels through it, as a wave drawn on a rubber band gets longer when you pull the band. A
            stretched wave is a <strong>redshifted</strong> wave, because stretching makes light redder. Astronomers sum up how much the light was
            stretched with a number called the <strong>redshift</strong>, written <strong><em>z</em></strong>. The light has been stretched to{' '}
            <strong>1 + <em>z</em> times</strong> its original wavelength. For example, a redshift of 1 means every wave is now twice as long as
            when it left, and a redshift of 5 means six times as long. The bigger the redshift, the longer ago the light left, and the earlier in
            the universe’s history we are looking.
          </p>

          <div style={{ marginBottom: '0.75rem' }}>
            <StretchedWaveDrawing />
          </div>
          <div style={{ fontSize: '0.875rem', color: 'var(--text-muted)', marginBottom: '0.75rem' }}>
            <p style={paragraph}>
              <strong>How to read this drawing.</strong> It is an illustration of the idea, not data. Each row is a rubber band with a wave
              drawn on it. In the top row the band is relaxed: the sky-blue wave has four crests, and one wave is 50 units long. The two white
              dots at the ends stand for two galaxies, 200 units apart. In the bottom row the same band has been pulled to <strong>twice</strong>{' '}
              its length. The wave (now red) is stretched along with it, so each wave is 100 units long, and the two dots are 400 units apart.
              The point of the picture is that the stretching of space makes <strong>waves longer and galaxies further apart together</strong>.
              Light stretched this way is called redshifted, and the red colour in the bottom row stands for that. The units and the number of
              crests are for illustration only.
            </p>
          </div>

          <p style={paragraph}>
            <strong>Why Webb looks in the infrared.</strong> When light is stretched by several times or more, ultraviolet and visible light end
            up as <strong>infrared</strong>, a kind of light our eyes cannot see (think of the heat you feel from a warm stove without seeing any
            glow). Ordinary telescopes are not made to see much of it, and the Earth’s air gets in the way. JWST is built to see infrared light
            from space, so it can see the first galaxies, whose light left as ultraviolet and visible light and arrives as infrared. NASA’s page
            on redshift (below) says the same.
          </p>

          <p style={paragraph}>
            <strong>How is a redshift measured?</strong> There are two ways, and the difference matters.
          </p>
          <ul style={{ margin: '0 0 0.75rem', paddingLeft: '1.25rem' }}>
            <li>
              <strong>A photometric redshift is an estimate.</strong> Astronomers photograph the galaxy through several colour filters. A very
              distant galaxy vanishes from the bluer filters, because of the Lyman-alpha break (explained next), and which filters it shows up
              in gives a rough redshift. It is like guessing a person’s height from a blurry photo. It is quick, but it can be wrong.
            </li>
            <li>
              <strong>A spectroscopic redshift is a measurement.</strong> Astronomers split the galaxy’s light into a <strong>spectrum</strong> (a
              rainbow made by a prism, see the ESA link below) and look for the marks that fall at particular wavelengths. One is a sharp edge
              called the <strong>Lyman-alpha break</strong>. Hydrogen gas, the most common gas in the universe, soaks up ultraviolet light
              bluer than a wavelength of {LYMAN_ALPHA_NM} nm, called Lyman-alpha, so the galaxy’s light is bright on one side of that
              wavelength and dark on the other. How far the edge has been shifted tells us the redshift. Bright lines from the galaxy’s gas give
              a second, independent measurement. It is like measuring the person with a tape. Only a galaxy whose redshift comes from a
              spectrum is called <strong>confirmed</strong>.
            </li>
          </ul>

          <p style={paragraph}>
            <strong>The record, as of October 2026.</strong> JWST’s NIRSpec instrument (a spectrograph, described in the ESA link below) has
            confirmed galaxies at redshifts above 14. The most distant confirmed so far is called <strong>MoM-z14</strong>. Its redshift is{' '}
            <strong>14.44</strong>, so its light has been stretched to 15.44 times its original wavelength. It was reported by a team led by
            Rohan Naidu in 2025 and announced by ESA and NASA in January 2026. This experiment is about that galaxy and the ones before it: what
            a redshift of 14.4 tells us, and what it means that galaxies like this exist.
          </p>

          <div style={{ marginBottom: '0.75rem' }}>
            <p style={{ marginTop: 0, marginBottom: '0.5rem' }}>
              <strong>Some new words.</strong> The “Words and formulas” box below has each one, with the ones from earlier experiments.
            </p>
            <ul style={{ margin: 0, paddingLeft: '1.25rem' }}>
              <li>
                <strong>Redshift</strong> (<em>z</em>): how much light has been stretched. The light is <strong>1 + <em>z</em></strong> times
                longer than when it left.
              </li>
              <li>
                <strong>Wavelength</strong>, <strong>nm</strong> and <strong>µm</strong>: a wavelength is the length of one wave of light. A
                nanometre (nm) is a billionth of a metre, and a micrometre (µm) is 1,000 nm.
              </li>
              <li>
                <strong>Ultraviolet</strong>, <strong>visible</strong> and <strong>infrared</strong>: three kinds of light, from the shortest
                waves to the longest. Our eyes can see only the middle one.
              </li>
              <li>
                <strong>Spectrum</strong> and <strong>Lyman-alpha break</strong>: light split into colours, and the sharp edge in it, at{' '}
                {LYMAN_ALPHA_NM} nm before stretching, that gives the redshift.
              </li>
              <li>
                <strong>Photometric</strong> and <strong>spectroscopic</strong>: an estimate from colour filters, and a measurement from a
                spectrum. Only the second makes a galaxy “confirmed”.
              </li>
              <li>
                <strong>Number density</strong> and <strong>bright</strong>: how many of something there are in a volume of space, and how
                much light a galaxy gives out whatever its distance.
              </li>
            </ul>
          </div>

          <p style={paragraph}>
            <strong>What you will do.</strong> You will make two predictions, press Run to watch the pictures build up one stage at a time, and
            then look at other galaxies, including an imaginary one. Nothing here is graded.
          </p>

          <p style={paragraph}>
            <strong>What we assume.</strong> To turn a redshift into a time and a distance, this experiment has to use a model of how the
            universe has expanded. It is the same simple model as in Cosmology Experiments 5, 6 and 8. These are the choices in it, and what
            each one means.
          </p>
          <ul style={{ margin: '0 0 0.75rem', paddingLeft: '1.25rem' }}>
            <li>
              <strong>The universe contains matter and dark energy.</strong> “Matter” means everything that pulls by gravity: ordinary matter
              (stars, gas, dust) and dark matter. “Dark energy” is whatever makes the expansion speed up (Cosmology Experiment 5). Gravity from
              matter slows the expansion down, and dark energy speeds it up, and the model adds the two together. The model treats dark energy
              as constant, not changing with time.
            </li>
            <li>
              <strong>The universe is “flat”.</strong> This is about the <em>shape of space as a whole</em>, averaged over huge distances. Think
              of a triangle drawn on three different surfaces. On a flat sheet of paper the three angles add up to exactly 180 degrees, and two
              lines that start out parallel stay parallel for ever. On a globe the angles add up to <em>more</em> than 180 degrees (a triangle
              from the North Pole down to the equator, along it, and back up has three right angles, which make 270), and lines that start out
              parallel, like lines of longitude, eventually meet. On a saddle the angles add up to <em>less</em>, and parallel lines drift
              apart. Cosmologists ask the same question about space itself: if you drew an enormous triangle between three far-apart galaxies,
              would its angles add up to 180 degrees, or more, or less? Measurements of the microwave background say the answer is very close
              to 180, so space is called <strong>flat</strong>, and the model takes it to be exactly flat, which makes the sums much simpler.
              Two things “flat” does <em>not</em> mean. It does not mean the universe is standing still: a flat universe can expand, and ours
              does. And it does not mean there is no gravity: stars and planets still bend spacetime around them (the Gravity and Curved
              Spacetime experiments), and “flat” describes the average once all that local lumpiness is smoothed out.
            </li>
            <li>
              <strong>Light and neutrinos are left out.</strong> The early universe also contained a great deal of light and of neutrinos
              (Experiment 4), which together are called <strong>radiation</strong>. Radiation matters most very early on. The model leaves it out
              to keep things simple, as the earlier experiments did. The price is that the times it gives can differ a little from the times in
              a scientific paper, which may include it. Think of working out a car journey from the average speed and leaving out the stops: you
              get a good estimate, not an exact answer.
            </li>
            <li>
              <strong>The two numbers that set the pace are measured, not chosen.</strong> They are how fast the universe is expanding today
              (67.4 kilometres per second for every megaparsec of distance, Experiment 1) and how much of the universe is matter (31.5 percent,
              Experiment 3 of this group). Both come from the microwave background, measured by the Planck satellite, a European Space Agency
              mission. A <strong>megaparsec</strong> is a unit of distance, about 3.26 million light-years. Earlier experiments in the project
              used a round 70 for the expansion rate, to keep the numbers simple, and this experiment switches to Planck’s own value (the
              times and distances are rescaled to match), as Experiment 4 did.
            </li>
            <li>
              <strong>The galaxies are not simulated.</strong> The experiment works out <em>when</em> and <em>how far away</em> a galaxy is from
              its redshift. It does not model how stars or galaxies form. So it can tell you how much time had passed, but it cannot tell you
              why a galaxy is as bright or as big as it is. Where the experiment shows a number from a scientific paper, such as a count of
              galaxies, it is quoted from the paper and not recalculated here.
            </li>
            <li>
              <strong>The redshifts and the wavelength of Lyman-alpha are taken as measured.</strong> The redshifts of the galaxies are the
              published ones (with their uncertainties named in the paper), and the stretching of a wave is exactly 1 + <em>z</em>.
            </li>
          </ul>

          <p style={{ marginTop: 0, marginBottom: '0.75rem' }}>
            <strong>Want to know more?</strong> Plainer-language pages are listed here. Links to the original scientific papers and to the
            announcements of the results appear below the results, after you press Run, because their summaries state what the predictions ask,
            and you should get to guess first. Links open in a new tab. This page was written as of October 2026.
          </p>
          <ul style={{ margin: '0.25rem 0 0', paddingLeft: '1.25rem' }}>
            <li>
              <ExternalLink href="https://science.nasa.gov/asset/webb/what-is-cosmological-redshift/">NASA: What is cosmological redshift?</ExternalLink>:
              how the expansion of the universe stretches light, and why that moves the light of the most distant galaxies into the infrared.
            </li>
            <li>
              <ExternalLink href="https://esawebb.org/about/general/spectroscopy-with-webb/">ESA/Webb: Spectroscopy with Webb</ExternalLink>: how a
              spectrum is made by splitting light into its wavelengths, and why each chemical element leaves its own fingerprint in it.
            </li>
            <li>
              <ExternalLink href="https://esawebb.org/about/instruments/nirspec/">ESA/Webb: NIRSpec, the Near-InfraRed Spectrograph</ExternalLink>:
              the Webb instrument that makes the spectra of distant galaxies, and how it can observe nearly 200 objects at once.
            </li>
            <li>
              <ExternalLink href="https://science.nasa.gov/mission/webb/nircam/">NASA: NIRCam, Webb’s near-infrared camera</ExternalLink>: the camera
              that takes Webb’s deep pictures of the early universe, and the range of light, 0.6 to 5 microns, that it is designed to capture.
            </li>
            <li>
              <ExternalLink href="https://www.stsci.edu/contents/news-releases/2019/news-2019-20">
                NASA and STScI: Webb to explore galaxies from cosmic dawn to present day
              </ExternalLink>
              : the questions Webb was built to answer about how the first galaxies formed (written in 2019, before Webb launched).
            </li>
          </ul>
        </div>

        <ReferencePanel entries={status === 'complete' ? [...REFERENCE_ENTRIES, ...formulaEntries] : REFERENCE_ENTRIES} />

        {/* The two predictions: draft wording for the owner's review (CLAUDE.md §28.1), from the specification's "Prediction Activity". Neither
            says which answer is right, gives the age, the share or any number from the count comparison, or says that there is an excess. */}
        {(
          [
            {
              title: 'Prediction 1: how early?',
              text: (
                <>
                  Light from a galaxy confirmed at a redshift of about <strong>14.4</strong> left it a very long time ago. The universe is now about{' '}
                  {presentBillions} billion years old. When that light left the galaxy, how much of the universe’s <strong>present age</strong>{' '}
                  had passed since the Big Bang?
                </>
              ),
              choices: AGE_CHOICES,
              value: agePrediction,
              set: (v: AgeShareRange) => setAgePrediction(v),
            },
            {
              title: 'Prediction 2: how many?',
              text: (
                <>
                  Before Webb, computer models of galaxy formation predicted how many <strong>bright</strong> galaxies there would be in a given
                  volume of space at this time (the <em>number density</em>). A survey of Webb’s images then found bright galaxies like this one.
                  Compared with what the models predicted, the number the survey implies is:
                </>
              ),
              choices: COUNT_CHOICES,
              value: countPrediction,
              set: (v: CountRange) => setCountPrediction(v),
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
          {status === 'idle' && <span style={{ color: 'var(--text-muted)' }}>The pictures fill in, one stage at a time, after you press Run.</span>}
          {status !== 'idle' && (
            <>
              <strong>{status === 'complete' ? 'Run complete' : `Stage ${stage} of ${LAST_STAGE}`}</strong>
              {status === 'running' && <>: {STAGES[stage - 1]}</>}
              {status === 'complete' && <span style={{ color: 'var(--text-muted)' }}> (all {LAST_STAGE} stages shown). Your predictions are recorded and not marked here.</span>}
            </>
          )}
        </p>

        {/* Picture 1. Before Run: the light as it leaves the galaxy. From stage 1: the stretching, a comparison and Webb's range. */}
        <div style={{ marginBottom: '1rem' }}>
          <svg
            width={VIEW_WIDTH}
            height={P1_HEIGHT}
            viewBox={`0 0 ${VIEW_WIDTH} ${P1_HEIGHT}`}
            style={svgStyle}
            role="img"
            aria-label="A scale of the wavelength of light from 100 to 3,000 nanometres, showing the ultraviolet, visible and near-infrared regions, the wavelength of Lyman-alpha light as it leaves a galaxy, and after the run where the stretching of space moves it"
          >
            <text x={AXIS_LEFT} y={22} fill={TEXT_COLOR} fontSize="13" fontWeight="bold">
              Picture 1: a wave of light, and where it sits
            </text>

            {/* The three kinds of light (shaded). */}
            <rect x={AXIS_LEFT} y={BAND_TOP} width={xOfNm(ULTRAVIOLET_TO_VISIBLE_NM) - AXIS_LEFT} height={AXIS_Y - BAND_TOP} fill={ULTRAVIOLET_COLOR} opacity={0.28} />
            <rect x={xOfNm(ULTRAVIOLET_TO_VISIBLE_NM)} y={BAND_TOP} width={xOfNm(VISIBLE_TO_INFRARED_NM) - xOfNm(ULTRAVIOLET_TO_VISIBLE_NM)} height={AXIS_Y - BAND_TOP} fill={VISIBLE_COLOR} opacity={0.28} />
            <rect x={xOfNm(VISIBLE_TO_INFRARED_NM)} y={BAND_TOP} width={AXIS_RIGHT - xOfNm(VISIBLE_TO_INFRARED_NM)} height={AXIS_Y - BAND_TOP} fill={INFRARED_COLOR} opacity={0.28} />
            <text x={(AXIS_LEFT + xOfNm(ULTRAVIOLET_TO_VISIBLE_NM)) / 2} y={BAND_TOP + 20} fill={ULTRAVIOLET_COLOR} fontSize="11" textAnchor="middle">
              ultraviolet
            </text>
            <text x={(xOfNm(ULTRAVIOLET_TO_VISIBLE_NM) + xOfNm(VISIBLE_TO_INFRARED_NM)) / 2} y={BAND_TOP + 20} fill={VISIBLE_COLOR} fontSize="11" textAnchor="middle">
              visible
            </text>
            <text x={(xOfNm(VISIBLE_TO_INFRARED_NM) + stretchedX) / 2} y={BAND_TOP + 20} fill={INFRARED_COLOR} fontSize="11" textAnchor="middle">
              near-infrared
            </text>

            {/* The axis and its ticks. */}
            <line x1={AXIS_LEFT} y1={AXIS_Y} x2={AXIS_RIGHT} y2={AXIS_Y} stroke={TEXT_COLOR} strokeWidth={1.5} />
            {[
              { nm: 100, label: '100 nm', anchor: 'start' as const },
              { nm: ULTRAVIOLET_TO_VISIBLE_NM, label: '400 nm', anchor: 'middle' as const },
              { nm: VISIBLE_TO_INFRARED_NM, label: '700 nm', anchor: 'middle' as const },
              { nm: 1000, label: '1 µm', anchor: 'middle' as const },
              { nm: AXIS_MAX_NM, label: '3 µm', anchor: 'end' as const },
            ].map((tick) => (
              <g key={tick.nm}>
                <line x1={xOfNm(tick.nm)} y1={AXIS_Y} x2={xOfNm(tick.nm)} y2={AXIS_Y + 6} stroke={TEXT_COLOR} />
                <text x={xOfNm(tick.nm)} y={AXIS_Y + 20} fill={TEXT_COLOR} fontSize="10" textAnchor={tick.anchor}>
                  {tick.label}
                </text>
              </g>
            ))}
            <text x={(AXIS_LEFT + AXIS_RIGHT) / 2} y={AXIS_Y + 40} fill={MUTED_COLOR} fontSize="10" textAnchor="middle">
              wavelength of the light (1 µm = 1,000 nm; a longer wave is further right; the spacing is not even)
            </text>

            {/* The light being followed: Lyman-alpha as it leaves the galaxy. */}
            <line x1={lymanX} y1={48} x2={lymanX} y2={AXIS_Y} stroke={LYMAN_COLOR} strokeWidth={2.5} />
            <circle cx={lymanX} cy={AXIS_Y} r={4} fill={LYMAN_COLOR} />
            <text x={lymanX + 8} y={44} fill={LYMAN_COLOR} fontSize="11" fontWeight="bold">
              Lyman-alpha as it leaves the galaxy: {LYMAN_ALPHA_NM} nm (ultraviolet)
            </text>

            {stage === 0 && (
              <text x={AXIS_LEFT} y={AXIS_Y + 80} fill={MUTED_COLOR} fontSize="11">
                Where this light sits after the stretching is drawn here when you press Run.
              </text>
            )}

            {/* Stage 1: the comparison (a stretch by 2), the galaxy's own stretch, where its light arrives, and Webb's range. */}
            {stage >= 1 && (
              <g>
                <line x1={lymanX} y1={58} x2={doubledX - 8} y2={58} stroke={MUTED_COLOR} strokeWidth={1.5} strokeDasharray="4 3" />
                <polygon points={`${doubledX - 8},54 ${doubledX},58 ${doubledX - 8},62`} fill={MUTED_COLOR} />
                <circle cx={doubledX} cy={AXIS_Y} r={3} fill={MUTED_COLOR} />
                <text x={doubledX + 8} y={62} fill={MUTED_COLOR} fontSize="10">
                  for comparison, a redshift of 1 (stretched 2 times): {doubledNm.toFixed(0)} nm, still ultraviolet
                </text>

                <line x1={lymanX} y1={86} x2={stretchedX - 8} y2={86} stroke={ARRIVED_COLOR} strokeWidth={2.5} />
                <polygon points={`${stretchedX - 9},81 ${stretchedX},86 ${stretchedX - 9},91`} fill={ARRIVED_COLOR} />
                <text x={(lymanX + stretchedX) / 2} y={80} fill={ARRIVED_COLOR} fontSize="11" fontWeight="bold" textAnchor="middle">
                  {nameCap}, redshift {redshift}: stretched {result.stretchFactor.toFixed(2)} times
                </text>
                {!offScale && <line x1={stretchedX} y1={86} x2={stretchedX} y2={AXIS_Y} stroke={ARRIVED_COLOR} strokeWidth={2.5} />}
                {!offScale && <circle cx={stretchedX} cy={AXIS_Y} r={4} fill={ARRIVED_COLOR} />}
                <text x={AXIS_LEFT} y={AXIS_Y + 64} fill={ARRIVED_COLOR} fontSize="11" fontWeight="bold">
                  {nameCap === 'An imaginary galaxy' ? 'The imaginary galaxy’s' : possessive} Lyman-alpha arrives at {stretchedNm.toLocaleString('en-US', { maximumFractionDigits: 0 })} nm ({(stretchedNm / 1000).toFixed(2)} µm), in the near-infrared
                </text>
                {offScale && (
                  <text x={AXIS_LEFT} y={AXIS_Y + 78} fill={ARRIVED_COLOR} fontSize="11">
                    (beyond the right edge of this scale, so the arrow runs to the edge)
                  </text>
                )}

                <line x1={xOfNm(WEBB_MIN_NM)} y1={AXIS_Y + 96} x2={AXIS_RIGHT - 8} y2={AXIS_Y + 96} stroke={WEBB_COLOR} strokeWidth={2} />
                <line x1={xOfNm(WEBB_MIN_NM)} y1={AXIS_Y + 90} x2={xOfNm(WEBB_MIN_NM)} y2={AXIS_Y + 102} stroke={WEBB_COLOR} strokeWidth={2} />
                <polygon points={`${AXIS_RIGHT - 9},${AXIS_Y + 92} ${AXIS_RIGHT},${AXIS_Y + 96} ${AXIS_RIGHT - 9},${AXIS_Y + 100}`} fill={WEBB_COLOR} />
                <text x={AXIS_RIGHT} y={AXIS_Y + 116} fill={WEBB_COLOR} fontSize="10" textAnchor="end">
                  Webb’s NIRCam camera is designed for 0.6 to 5 µm
                </text>
                <text x={AXIS_RIGHT} y={AXIS_Y + 129} fill={WEBB_COLOR} fontSize="10" textAnchor="end">
                  (600 to 5,000 nm); this scale stops at 3 µm
                </text>
              </g>
            )}
          </svg>
        </div>
        <div style={{ fontSize: '0.875rem', color: 'var(--text-muted)', marginBottom: '1.5rem' }}>
          <p style={paragraph}>
            <strong>How to read Picture 1.</strong> This picture is about the <em>wavelength</em> of light, the length of one wave. Wavelengths
            are measured in <strong>nanometres (nm)</strong>, billionths of a metre, and 1,000 nm is 1 <strong>micrometre (µm)</strong>. The
            horizontal line is a scale of wavelength. Short waves are on the left and long waves on the right, and the spacing is not even: each
            step along the line multiplies the wavelength rather than adding to it, so that waves from 100 nm to 3,000 nm all fit on one page.
          </p>
          <ul style={{ margin: '0 0 0.75rem', paddingLeft: '1.25rem' }}>
            <li>
              <strong>The three shaded regions are three kinds of light.</strong> <strong>Ultraviolet</strong> (violet shading, shorter than
              about 400 nm) is light our eyes cannot see. <strong>Visible light</strong> (yellow shading, about 400 to 700 nm) is what our eyes
              can see. <strong>Infrared</strong> (red shading, longer than about 700 nm) is again light our eyes cannot see. “Near-infrared” is
              the part of it closest to red, and the shading carries on to the end of the scale at 3,000 nm.
            </li>
            <li>
              <strong>The sky-blue vertical line is the light this experiment follows.</strong> It is <strong>Lyman-alpha</strong>, the
              particular ultraviolet wavelength of {LYMAN_ALPHA_NM} nm that hydrogen gives out and takes in, and that gives the sharp edge used
              to measure a redshift. The line shows where it sits <em>as it leaves the galaxy</em>: in the ultraviolet.
            </li>
            {stage === 0 && (
              <li>
                <strong>Nothing has been stretched yet.</strong> After you press Run, the picture will show how far the stretching of space
                moves this wavelength to the right.
              </li>
            )}
            {stage >= 1 && (
              <>
                <li>
                  <strong>The red arrow and the red vertical line show the same light after the stretching,</strong> for {galaxyPhrase}.
                  The arrow’s label gives the stretch factor, 1 + {redshift} = {result.stretchFactor.toFixed(2)}: the wave is now{' '}
                  {result.stretchFactor.toFixed(2)} times as long. The red line is where it arrives (if it would be beyond the right edge of the scale, the arrow runs to the edge and the line is left out), and the text under the axis gives the number.
                  A <strong>longer arrow</strong> means a bigger stretch.
                </li>
                <li>
                  <strong>The short grey dashed arrow, and the grey dot on the line below its tip, are a comparison.</strong> They show what a much smaller stretch does, a redshift of 1, which
                  doubles the wavelength.
                </li>
                <li>
                  <strong>The green bracket at the bottom is the range of light that one of Webb’s cameras, NIRCam, is designed to capture.</strong>{' '}
                  NASA’s page on NIRCam says 0.6 µm (visible red) to 5 µm. The scale here stops at 3 µm, so the bracket runs off the right edge,
                  and the arrow-head shows that it carries on.
                </li>
              </>
            )}
          </ul>
          <p style={paragraph}>
            <strong>A worked moment.</strong> Suppose a galaxy’s light has a redshift of 1. Then it has been stretched to 1 + 1 = 2 times its
            length, so the Lyman-alpha wave leaves at {LYMAN_ALPHA_NM} nm and arrives at {LYMAN_ALPHA_NM} × 2 = {doubledNm.toFixed(1)} nm. That
            is still ultraviolet.
            {stage >= 1 && (
              <>
                {' '}
                Now {record ? 'the real galaxy' : 'the imaginary galaxy'}. For {nameThe} the redshift is {redshift}, so the stretch factor is 1 + {redshift} ={' '}
                {result.stretchFactor.toFixed(2)}, and the Lyman-alpha wave arrives at {LYMAN_ALPHA_NM} × {result.stretchFactor.toFixed(2)} ={' '}
                {stretchedNm.toFixed(1)} nm, which is {(stretchedNm / 1000).toFixed(3)} µm.
              </>
            )}
          </p>
          <p style={{ marginTop: 0, marginBottom: 0 }}>
            <strong>What to look for.</strong>{' '}
            {stage === 0 ? (
              <>Which of the three regions the blue line is in, and how far it would have to move right to reach the near-infrared region.</>
            ) : (
              <>
                Which region the red line is in now, compared with the blue line, and whether it falls inside the green bracket. What it would
                mean: light that left the galaxy as <em>ultraviolet</em>, which no telescope for visible or near-infrared light could have
                caught, arrives as <em>near-infrared</em>, which is the light Webb’s NIRCam is designed to capture. That is why this galaxy
                could be found and confirmed with Webb, and why a bigger redshift needs a bigger-reaching infrared telescope.
              </>
            )}
          </p>
        </div>

        {/* Picture 2: the clock (stages 2 and 4) and the ruler (stage 3). */}
        {stage >= 2 && (
          <div style={{ marginBottom: '1rem' }}>
            <svg
              width={VIEW_WIDTH}
              height={p2Height}
              viewBox={`0 0 ${VIEW_WIDTH} ${p2Height}`}
              style={svgStyle}
              role="img"
              aria-label="A timeline of the whole history of the universe and a magnified timeline of its first 500 million years, with the time at which the light of the chosen galaxy left it and, from stage 4, the other record holders, and from stage 3 three bars for how far the light travelled, how far away the galaxy was when the light left and how far away it is now"
            >
              <text x={TL_LEFT} y={22} fill={TEXT_COLOR} fontSize="13" fontWeight="bold">
                Picture 2: the clock and the ruler
              </text>

              {/* The whole history, drawn as one bar, with the first 500 million years marked. */}
              <text x={TL_LEFT} y={42} fill={TEXT_COLOR} fontSize="11" fontWeight="bold">
                The whole history of the universe so far
              </text>
              <rect x={TL_LEFT} y={50} width={TL_RIGHT - TL_LEFT} height={16} fill={MUTED_COLOR} opacity={0.3} />
              <rect x={TL_LEFT} y={50} width={((ZOOM_MAX_MYR / presentMyr) * (TL_RIGHT - TL_LEFT))} height={16} fill={MOM_COLOR} opacity={0.85} />
              <text x={TL_LEFT + 24} y={62} fill={TEXT_COLOR} fontSize="10">
                ◂ the first {ZOOM_MAX_MYR} million years (magnified below)
              </text>
              {[0, 2, 4, 6, 8, 10].map((billion) => (
                <g key={billion}>
                  <line x1={wholeX(billion * 1000)} y1={66} x2={wholeX(billion * 1000)} y2={71} stroke={TEXT_COLOR} />
                  <text x={wholeX(billion * 1000)} y={83} fill={TEXT_COLOR} fontSize="10" textAnchor={billion === 0 ? 'start' : 'middle'}>
                    {billion}
                  </text>
                </g>
              ))}
              <line x1={TL_RIGHT} y1={66} x2={TL_RIGHT} y2={71} stroke={TEXT_COLOR} />
              <text x={TL_RIGHT} y={83} fill={TEXT_COLOR} fontSize="10" textAnchor="end">
                {presentBillions} (today)
              </text>
              <text x={(TL_LEFT + TL_RIGHT) / 2} y={96} fill={MUTED_COLOR} fontSize="10" textAnchor="middle">
                billions of years after the Big Bang (0 is the Big Bang)
              </text>

              {/* The first 500 million years, magnified; the galaxy of this run is marked, and from stage 4 the other record holders. */}
              <text x={TL_LEFT} y={112} fill={TEXT_COLOR} fontSize="11" fontWeight="bold">
                Zoomed in: the first {ZOOM_MAX_MYR} million years, magnified {Math.round(presentMyr / ZOOM_MAX_MYR)} times
              </text>
              <rect x={TL_LEFT} y={ZOOM_BAR_Y} width={TL_RIGHT - TL_LEFT} height={22} fill={MUTED_COLOR} opacity={0.3} />
              <rect x={TL_LEFT} y={ZOOM_BAR_Y} width={zoomX(Math.min(ageMyr, ZOOM_MAX_MYR)) - TL_LEFT} height={22} fill={MOM_COLOR} opacity={0.35} />
              {[0, 100, 200, 300, 400, 500].map((myr) => (
                <g key={myr}>
                  <line x1={zoomX(myr)} y1={ZOOM_BAR_Y + 22} x2={zoomX(myr)} y2={ZOOM_BAR_Y + 27} stroke={TEXT_COLOR} />
                  <text x={zoomX(myr)} y={ZOOM_BAR_Y + 40} fill={TEXT_COLOR} fontSize="10" textAnchor={myr === 0 ? 'start' : myr === ZOOM_MAX_MYR ? 'end' : 'middle'}>
                    {myr}
                  </text>
                </g>
              ))}
              <text x={(TL_LEFT + TL_RIGHT) / 2} y={ZOOM_BAR_Y + 54} fill={MUTED_COLOR} fontSize="10" textAnchor="middle">
                millions of years after the Big Bang
              </text>
              {markers.map((m) => {
                const labelY = ZOOM_BAR_Y - 12 - m.tier * 16
                const beyond = m.myr > ZOOM_MAX_MYR // too late for this bar: the marker sits at its right edge
                const x = zoomX(Math.min(m.myr, ZOOM_MAX_MYR))
                return (
                  <g key={m.name}>
                    <line x1={x} y1={labelY + 3} x2={x} y2={ZOOM_BAR_Y + 22} stroke={m.isRun ? MOM_COLOR : RECORD_COLOR} strokeWidth={m.isRun ? 2.5 : 1.5} />
                    <circle cx={x} cy={ZOOM_BAR_Y + 11} r={m.isRun ? 4.5 : 3.5} fill={m.isRun ? MOM_COLOR : RECORD_COLOR} />
                    <text x={x} y={labelY} fill={m.isRun ? MOM_COLOR : RECORD_COLOR} fontSize="10" fontWeight={m.isRun ? 'bold' : 'normal'} textAnchor="end">
                      {m.name} (redshift {m.redshift}): {Math.round(m.myr)} million years{beyond ? ' (later than this bar: at its right edge)' : ''}
                    </text>
                  </g>
                )
              })}

              {/* Stage 3: the ruler, three distances on one scale. */}
              {stage >= 3 && (
                <g>
                  <text x={TL_LEFT} y={RULER_TOP} fill={TEXT_COLOR} fontSize="11" fontWeight="bold">
                    How far? Three distances for {nameThe}, on one scale (billions of light-years)
                  </text>
                  {[
                    { label: `How far the light travelled: ${travelGly.toFixed(2)} billion light-years (it took ${travelGly.toFixed(2)} billion years)`, value: travelGly, color: TRAVEL_COLOR },
                    { label: `How far away the galaxy was when the light left: ${thenGly.toFixed(2)} billion light-years`, value: thenGly, color: THEN_COLOR },
                    { label: `How far away the galaxy is now: ${todayGly.toFixed(2)} billion light-years`, value: todayGly, color: NOW_COLOR },
                  ].map((row, i) => {
                    const y = RULER_TOP + 26 + i * 40
                    return (
                      <g key={row.label}>
                        <text x={TL_LEFT} y={y} fill={row.color} fontSize="10" fontWeight="bold">
                          {row.label}
                        </text>
                        <rect x={TL_LEFT} y={y + 5} width={(row.value / RULER_MAX_GLY) * (TL_RIGHT - TL_LEFT)} height={14} fill={row.color} opacity={0.8} />
                      </g>
                    )
                  })}
                  {[0, 10, 20, 30, 40].map((gly) => (
                    <g key={gly}>
                      <line x1={TL_LEFT + (gly / RULER_MAX_GLY) * (TL_RIGHT - TL_LEFT)} y1={RULER_TOP + 142} x2={TL_LEFT + (gly / RULER_MAX_GLY) * (TL_RIGHT - TL_LEFT)} y2={RULER_TOP + 148} stroke={TEXT_COLOR} />
                      <text x={TL_LEFT + (gly / RULER_MAX_GLY) * (TL_RIGHT - TL_LEFT)} y={RULER_TOP + 160} fill={TEXT_COLOR} fontSize="10" textAnchor={gly === 0 ? 'start' : 'middle'}>
                        {gly}
                      </text>
                    </g>
                  ))}
                  <line x1={TL_LEFT} y1={RULER_TOP + 142} x2={TL_RIGHT} y2={RULER_TOP + 142} stroke={TEXT_COLOR} />
                  <text x={(TL_LEFT + TL_RIGHT) / 2} y={RULER_TOP + 174} fill={MUTED_COLOR} fontSize="10" textAnchor="middle">
                    billions of light-years (one scale for all three bars)
                  </text>
                </g>
              )}
            </svg>
          </div>
        )}
        {stage >= 2 && (
          <div style={{ fontSize: '0.875rem', color: 'var(--text-muted)', marginBottom: '1.5rem' }}>
            <p style={paragraph}>
              <strong>How to read Picture 2.</strong> It shows <em>when</em> the light of {galaxyPhrase} left it, and, from stage 3,{' '}
              <em>how far</em>. The top bar is the whole history of the universe, from the Big Bang on the left to today on the right, marked in{' '}
              <strong>billions of years</strong>. The orange part at the left end of it is the first {ZOOM_MAX_MYR} million years, which is far
              too thin to read at that scale, so the second bar shows only that stretch, magnified {Math.round(presentMyr / ZOOM_MAX_MYR)} times
              and marked in <strong>millions of years</strong>. “After the Big Bang” means counted from the start of the universe’s expansion
              (Cosmology Experiment 2).
            </p>
            <ul style={{ margin: '0 0 0.75rem', paddingLeft: '1.25rem' }}>
              <li>
                <strong>The orange dot and line on the zoomed bar</strong> mark the moment the light of {nameThe} left the galaxy, with its label:
                the galaxy’s name, its redshift, and the number of millions of years after the Big Bang. The orange shading to its left is the
                time that had passed.
              </li>
              {stage >= 3 && (
                <>
                  <li>
                    <strong>The three coloured bars at the bottom are three distances,</strong> all on one scale in billions of light-years
                    (Cosmology Experiment 8). <span style={{ color: TRAVEL_COLOR }}>The sky-blue bar</span> is how far the light travelled: light
                    covers one light-year in a year, so it is also the number of years the light was on its way.{' '}
                    <span style={{ color: THEN_COLOR }}>The green bar</span> is how far away the galaxy was when the light left it.{' '}
                    <span style={{ color: NOW_COLOR }}>The yellow bar</span> is how far away it is now. A <strong>longer bar</strong> means a
                    longer distance.
                  </li>
                </>
              )}
              {stage >= 4 && (
                <li>
                  <strong>The grey-blue dots and lines are the other record holders,</strong> galaxies whose redshifts were also confirmed
                  with a spectrum (the list is in the second table below the results). Each label gives the galaxy’s name, its redshift and its time after
                  the Big Bang. (The redshift of JADES-GS-z14-0 is the one refined by the ALMA telescope. NIRSpec alone gave 14.32.) A{' '}
                  <strong>larger redshift is further left,</strong> because the light left earlier.
                </li>
              )}
            </ul>
            <p style={paragraph}>
              <strong>A worked moment.</strong> For {nameThe} the model gives {Math.round(ageMyr)} million years after the Big Bang. The universe’s
              present age is {Math.round(presentMyr).toLocaleString('en-US')} million years, so the share is {Math.round(ageMyr)} ÷{' '}
              {Math.round(presentMyr).toLocaleString('en-US')} = {(result.shareOfPresentAge * 100).toFixed(2)} percent.
              {stage >= 3 && (
                <>
                  {' '}
                  The light has been travelling for the rest of history: {Math.round(presentMyr).toLocaleString('en-US')} −{' '}
                  {Math.round(ageMyr)} = {Math.round(presentMyr - ageMyr).toLocaleString('en-US')} million years, which is{' '}
                  {travelGly.toFixed(2)} billion years. When the light left, the universe was 1 ÷ {result.stretchFactor.toFixed(2)} ={' '}
                  {(result.relativeSizeThen * 100).toFixed(1)} percent of its present size, so the galaxy was {todayGly.toFixed(2)} ÷{' '}
                  {result.stretchFactor.toFixed(2)} = {thenGly.toFixed(2)} billion light-years away, and it is {todayGly.toFixed(2)} billion
                  light-years away now.
                </>
              )}
            </p>
            <p style={paragraph}>
              <strong>What to look for.</strong> How thin the orange sliver is in the top bar compared with the whole.
              {stage >= 3 && <> Which of the three distances is longest, and why it is not the same as how far the light travelled (the answer is in Cosmology Experiment 8).</>}
              {stage >= 4 && <> Where the record holders fall on the zoomed bar, and how close together the last two are.</>}
            </p>
            <p style={{ marginTop: 0, marginBottom: 0, fontSize: '0.75rem' }}>
              The ages and distances come from the model described under “What we assume”. A scientific paper’s own figure for a galaxy’s age can
              differ slightly, and the model does not say why.
            </p>
          </div>
        )}

        {/* Picture 3: the count, from stage 5. A published number, not computed here. */}
        {stage >= 5 && (
          <div style={{ marginBottom: '1rem' }}>
            <svg
              width={VIEW_WIDTH}
              height={P3_HEIGHT}
              viewBox={`0 0 ${VIEW_WIDTH} ${P3_HEIGHT}`}
              style={svgStyle}
              role="img"
              aria-label="A scale from 1 to 1,000 times the number of bright galaxies that the models predicted before Webb, with the models at 1 and one survey's estimate of 182 times, with a range from 77 to 511 times"
            >
              <text x={TL_LEFT} y={22} fill={TEXT_COLOR} fontSize="13" fontWeight="bold">
                Picture 3: how many bright galaxies?
              </text>
              <text x={TL_LEFT} y={40} fill={MUTED_COLOR} fontSize="10">
                bright galaxies at redshifts of about 14 to 15, in a given volume of space,
              </text>
              <text x={TL_LEFT} y={53} fill={MUTED_COLOR} fontSize="10">
                as a multiple of what the models predicted
              </text>

              {/* The models, at 1. */}
              <line x1={countX(1)} y1={58} x2={countX(1)} y2={P3_AXIS_Y} stroke={MODEL_COLOR} strokeWidth={2.5} />
              <circle cx={countX(1)} cy={P3_AXIS_Y} r={4.5} fill={MODEL_COLOR} />
              <text x={countX(1) + 8} y={72} fill={MODEL_COLOR} fontSize="11" fontWeight="bold">
                Models used before Webb: 1 (the amount they predicted)
              </text>

              {/* 100 times, a reference. */}
              <line x1={countX(100)} y1={84} x2={countX(100)} y2={P3_AXIS_Y} stroke={MUTED_COLOR} strokeWidth={1} strokeDasharray="4 3" />
              <text x={countX(100)} y={96} fill={MUTED_COLOR} fontSize="10" textAnchor="end">
                100 times ▸
              </text>

              {/* The survey's estimate and the range the paper quotes. */}
              <line x1={countX(NUMBER_DENSITY_EXCESS.low)} y1={P3_AXIS_Y - 36} x2={countX(NUMBER_DENSITY_EXCESS.high)} y2={P3_AXIS_Y - 36} stroke={SURVEY_COLOR} strokeWidth={3} />
              <line x1={countX(NUMBER_DENSITY_EXCESS.low)} y1={P3_AXIS_Y - 42} x2={countX(NUMBER_DENSITY_EXCESS.low)} y2={P3_AXIS_Y - 30} stroke={SURVEY_COLOR} strokeWidth={3} />
              <line x1={countX(NUMBER_DENSITY_EXCESS.high)} y1={P3_AXIS_Y - 42} x2={countX(NUMBER_DENSITY_EXCESS.high)} y2={P3_AXIS_Y - 30} stroke={SURVEY_COLOR} strokeWidth={3} />
              <circle cx={countX(NUMBER_DENSITY_EXCESS.best)} cy={P3_AXIS_Y - 36} r={6} fill={SURVEY_COLOR} />
              <text x={countX(100) + 8} y={P3_AXIS_Y - 64} fill={SURVEY_COLOR} fontSize="11" fontWeight="bold">
                The survey’s estimate:
              </text>
              <text x={countX(100) + 8} y={P3_AXIS_Y - 51} fill={SURVEY_COLOR} fontSize="11" fontWeight="bold">
                {NUMBER_DENSITY_EXCESS.best} times the models
              </text>
              <text x={countX(100) + 8} y={P3_AXIS_Y - 20} fill={SURVEY_COLOR} fontSize="10">
                the range the paper quotes:
              </text>
              <text x={countX(100) + 8} y={P3_AXIS_Y - 8} fill={SURVEY_COLOR} fontSize="10">
                {NUMBER_DENSITY_EXCESS.low} to {NUMBER_DENSITY_EXCESS.high} times
              </text>

              {/* The axis: 1 to 1,000, each tick ten times the last. */}
              <line x1={countX(1)} y1={P3_AXIS_Y} x2={countX(1000)} y2={P3_AXIS_Y} stroke={TEXT_COLOR} strokeWidth={1.5} />
              {[1, 10, 100, 1000].map((v) => (
                <g key={v}>
                  <line x1={countX(v)} y1={P3_AXIS_Y} x2={countX(v)} y2={P3_AXIS_Y + 6} stroke={TEXT_COLOR} />
                  <text x={countX(v)} y={P3_AXIS_Y + 20} fill={TEXT_COLOR} fontSize="10" textAnchor={v === 1 ? 'start' : v === 1000 ? 'end' : 'middle'}>
                    {v.toLocaleString('en-US')}
                  </text>
                </g>
              ))}
              <text x={(TL_LEFT + TL_RIGHT) / 2} y={P3_AXIS_Y + 38} fill={MUTED_COLOR} fontSize="10" textAnchor="middle">
                times the number the models predicted (each tick is ten times the one before)
              </text>
            </svg>
          </div>
        )}
        {stage >= 5 && (
          <div style={{ fontSize: '0.875rem', color: 'var(--text-muted)', marginBottom: '0.5rem' }}>
            <p style={paragraph}>
              <strong>How to read Picture 3.</strong> This picture compares <em>numbers</em> of galaxies, not times or distances. The question
              is: in a given volume of space, at redshifts of about 14 to 15, how many <strong>bright</strong> galaxies (galaxies giving out a
              lot of light, whatever their distance) are there? The number is called the <strong>number density</strong>. Before Webb, computer
              models of galaxy formation predicted a number. The picture shows the number that the survey behind MoM-z14 implies, as a multiple
              of that prediction.
            </p>
            <ul style={{ margin: '0 0 0.75rem', paddingLeft: '1.25rem' }}>
              <li>
                <strong>The horizontal line is the scale.</strong> It runs from 1 to 1,000 times the number the models predicted. It is a{' '}
                <strong>logarithmic</strong> scale: each tick is ten times the one before, so 1, 10, 100 and 1,000 are equally spaced.
              </li>
              <li>
                <strong>The violet line at 1</strong> is the models’ own prediction, taken as the unit. Anything to its right is more than the
                models predicted, and anything to its left would be less.
              </li>
              <li>
                <strong>The pink dot</strong> is the survey’s best estimate, {NUMBER_DENSITY_EXCESS.best} times the models. <strong>The pink
                bar through it</strong> is the range the paper quotes for it, from {NUMBER_DENSITY_EXCESS.low} to {NUMBER_DENSITY_EXCESS.high}{' '}
                times, which is a wide range, so the estimate is not precise. A <strong>longer bar</strong> means a less certain estimate.
              </li>
              <li>
                <strong>The grey dashed line at 100</strong> is a reference mark: the paper says the number is more than 100 times larger.
              </li>
            </ul>
            <p style={paragraph}>
              <strong>A worked moment.</strong> If the models had predicted 1 bright galaxy in some volume of space, the survey’s estimate
              says there would be about {NUMBER_DENSITY_EXCESS.best}, and the range the paper quotes is {NUMBER_DENSITY_EXCESS.low} to{' '}
              {NUMBER_DENSITY_EXCESS.high}. On this scale the dot sits between 100 and 1,000, closer to 100: 100 is two ticks from 1, 1,000 is
              three ticks, and {NUMBER_DENSITY_EXCESS.best} is about {Math.log10(NUMBER_DENSITY_EXCESS.best).toFixed(1)} ticks.
            </p>
            <p style={paragraph}>
              <strong>What to look for.</strong> Where the dot and the bar sit compared with the violet line, and whether the whole bar is to
              the right of the 100 line (it starts a little left of it). What it would mean: the survey found far more bright galaxies than
              the models predicted. It would <em>not</em> mean the age or the distance from Picture 2 are wrong: those come from the
              expansion of the universe, not from how galaxies form.
            </p>
            <p style={{ marginTop: 0, marginBottom: 0, fontSize: '0.75rem' }}>
              This is <strong>one survey’s estimate</strong> (Naidu and colleagues, 2025), and the range the paper quotes for it is wide. It is a published number, quoted here, not something this experiment calculates: the experiment does not model how galaxies
              form.
            </p>
          </div>
        )}

        {/* After the run: the "Look at another galaxy" control, the neutral results, the guide to them and the links kept back until now.
            Draft wording for the owner's review (CLAUDE.md §28.1, §29). The results only report; they do not say why. */}
        {status === 'complete' && (
          <div style={{ marginTop: '2rem' }}>
            <p style={{ fontWeight: 'bold', marginTop: 0, marginBottom: '0.5rem' }}>Look at another galaxy</p>
            <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)', marginTop: 0, marginBottom: '0.75rem' }}>
              Choose one of the four record holders (each one’s redshift was confirmed with a spectrum), or an <strong>imaginary galaxy</strong>:
              move the slider to any redshift from {SLIDER_MIN_REDSHIFT} to {MAX_REDSHIFT}. <strong>No galaxy has been confirmed beyond a redshift of {MOM_Z14_REDSHIFT},</strong> so
              the imaginary galaxy shows only what the model would give. Pictures 1 and 2, the first table below and the worked examples in the “Words
              and formulas” box change with your choice. Picture 3 and the second table do not, because they are published numbers. Your predictions stay
              as they are.
            </p>
            <div style={{ marginBottom: '0.75rem' }}>
              {RECORDS.slice()
                .reverse()
                .map((r) => (
                  <button
                    key={r.name}
                    type="button"
                    onClick={() => {
                      setWhatIf(false)
                      setRedshift(r.redshift)
                    }}
                    className={`toggle-button${!whatIf && redshift === r.redshift ? ' is-selected' : ''}`}
                    style={{ marginRight: '0.5rem', marginBottom: '0.5rem', padding: '0.5rem 1rem', fontSize: '0.875rem' }}
                  >
                    {r.name} (redshift {r.redshift})
                  </button>
                ))}
              <button
                type="button"
                onClick={() => {
                  setWhatIf(true)
                  setRedshift(sliderZ)
                }}
                className={`toggle-button${whatIf ? ' is-selected' : ''}`}
                style={{ marginRight: '0.5rem', marginBottom: '0.5rem', padding: '0.5rem 1rem', fontSize: '0.875rem' }}
              >
                An imaginary galaxy (use the slider)
              </button>
            </div>
            <div style={{ marginBottom: '1.5rem', fontSize: '0.875rem' }}>
              <label htmlFor="what-if-redshift" style={{ display: 'block', marginBottom: '0.25rem' }}>
                Imaginary galaxy’s redshift: <strong>{sliderZ.toFixed(1)}</strong> (an imaginary galaxy: none is confirmed beyond {MOM_Z14_REDSHIFT})
              </label>
              <input
                id="what-if-redshift"
                type="range"
                min={SLIDER_MIN_REDSHIFT}
                max={MAX_REDSHIFT}
                step={0.1}
                value={sliderZ}
                onChange={(e) => {
                  const z = Number(e.target.value)
                  setSliderZ(z)
                  setWhatIf(true)
                  setRedshift(z)
                }}
                style={{ width: '100%', maxWidth: '480px' }}
              />
            </div>

            <div style={{ border: '1px solid var(--border-color, #ccc)', borderRadius: '8px', padding: '1rem', fontSize: '0.875rem' }}>
              <p style={{ marginTop: 0, marginBottom: '0.75rem' }}>
                <strong>Results.</strong> These are the numbers behind the pictures. They only report what was published and what was calculated.
                They do not say why the numbers are what they are.
              </p>

              <p style={{ fontWeight: 'bold', marginBottom: '0.5rem' }}>
                For {nameThe}, redshift {redshift}
                {whatIf ? ' (imaginary: no galaxy is confirmed beyond ' + MOM_Z14_REDSHIFT + ')' : ''}
              </p>
              <div style={{ overflowX: 'auto', marginBottom: '1.5rem' }}>
                <table style={{ borderCollapse: 'collapse', width: '100%', minWidth: '420px' }}>
                  <thead>
                    <tr style={{ borderBottom: '2px solid var(--border-color, #ccc)', textAlign: 'left' }}>
                      <th style={{ padding: '0.4rem 0.5rem 0.4rem 0' }}>Quantity</th>
                      <th style={{ padding: '0.4rem 0.5rem', textAlign: 'right' }}>Value</th>
                      <th style={{ padding: '0.4rem 0 0.4rem 0.5rem' }}>How it is worked out</th>
                    </tr>
                  </thead>
                  <tbody>
                    {(
                      [
                        ['Redshift', `z = ${redshift}`, record ? `the published value (${record.redshiftNote})` : 'the value you chose with the slider'],
                        ['Stretch factor', `${f2} times`, `1 + ${redshift}`],
                        ['Lyman-alpha arrives at', `${stretchedNm.toFixed(1)} nm (${(stretchedNm / 1000).toFixed(3)} µm)`, `${LYMAN_ALPHA_NM} × ${f2}`],
                        ['Size of the universe then', `${(result.relativeSizeThen * 100).toFixed(2)} percent of today’s`, `1 ÷ ${f2}`],
                        ['Time after the Big Bang', `about ${Math.round(ageMyr)} million years`, 'the age function of Cosmology Experiments 6 and 8, at Planck’s expansion rate'],
                        ['The universe’s present age', `${presentMyrText} million years`, 'the same function, today'],
                        ['Share of the present age', `${(result.shareOfPresentAge * 100).toFixed(2)} percent`, `${Math.round(ageMyr)} ÷ ${presentMyrText}`],
                        ['How long the light travelled', `${travelGly.toFixed(2)} billion years`, `${presentMyrText} − ${Math.round(ageMyr)} million years`],
                        ['Distance when the light left', `${thenGly.toFixed(2)} billion light-years`, `${todayGly.toFixed(2)} ÷ ${f2}`],
                        ['Distance now', `${todayGly.toFixed(2)} billion light-years`, 'the comoving-distance function of Cosmology Experiments 5 and 8, at Planck’s expansion rate'],
                        ...(record && record.name === 'MoM-z14'
                          ? ([
                              [
                                'The age stated by the paper and the releases',
                                `${MOM_Z14_PAPER_AGE_YEARS / 1e6} million years`,
                                `the model’s figure is ${(((result.ageAfterBigBangYears - MOM_Z14_PAPER_AGE_YEARS) / MOM_Z14_PAPER_AGE_YEARS) * 100).toFixed(1)} percent above it; this experiment has not worked out why`,
                              ],
                            ] as const)
                          : []),
                      ] as const
                    ).map(([label, value, how]) => (
                      <tr key={label} style={{ borderBottom: '1px solid var(--border-color, #ccc)' }}>
                        <td style={{ padding: '0.4rem 0.5rem 0.4rem 0' }}>{label}</td>
                        <td style={{ padding: '0.4rem 0.5rem', textAlign: 'right' }}>{value}</td>
                        <td style={{ padding: '0.4rem 0 0.4rem 0.5rem', color: 'var(--text-muted)' }}>{how}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <p style={{ fontWeight: 'bold', marginBottom: '0.5rem' }}>The galaxies confirmed with a spectrum, and the count</p>
              <div style={{ overflowX: 'auto', marginBottom: '0.75rem' }}>
                <table style={{ borderCollapse: 'collapse', width: '100%', minWidth: '560px' }}>
                  <thead>
                    <tr style={{ borderBottom: '2px solid var(--border-color, #ccc)', textAlign: 'left' }}>
                      <th style={{ padding: '0.4rem 0.5rem 0.4rem 0' }}>Name</th>
                      <th style={{ padding: '0.4rem 0.5rem', textAlign: 'right' }}>Redshift</th>
                      <th style={{ padding: '0.4rem 0.5rem', textAlign: 'right' }}>Time after the Big Bang (model)</th>
                      <th style={{ padding: '0.4rem 0.5rem' }}>Year</th>
                      <th style={{ padding: '0.4rem 0 0.4rem 0.5rem' }}>Source</th>
                    </tr>
                  </thead>
                  <tbody>
                    {RECORDS.slice()
                      .reverse()
                      .map((r) => (
                        <tr key={r.name} style={{ borderBottom: '1px solid var(--border-color, #ccc)', verticalAlign: 'top' }}>
                          <td style={{ padding: '0.4rem 0.5rem 0.4rem 0' }}>{r.name}</td>
                          <td style={{ padding: '0.4rem 0.5rem', textAlign: 'right' }}>
                            {r.redshift}
                            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{r.redshiftNote}</div>
                          </td>
                          <td style={{ padding: '0.4rem 0.5rem', textAlign: 'right' }}>{Math.round(ageAfterBigBangYears(r.redshift) / 1e6)} million years</td>
                          <td style={{ padding: '0.4rem 0.5rem' }}>{r.year}</td>
                          <td style={{ padding: '0.4rem 0 0.4rem 0.5rem', color: 'var(--text-muted)' }}>{r.source}</td>
                        </tr>
                      ))}
                  </tbody>
                </table>
              </div>
              <p style={{ marginTop: 0, marginBottom: '1rem' }}>
                <strong>The count.</strong> The survey behind MoM-z14 implies a number density of bright galaxies at redshifts of about 14 to 15 of{' '}
                <strong>{NUMBER_DENSITY_EXCESS.best} times</strong> what the models used before Webb predicted, with the range the paper quotes from{' '}
                {NUMBER_DENSITY_EXCESS.low} to {NUMBER_DENSITY_EXCESS.high} times (Naidu et al., arXiv:2505.11263). ESA’s and NASA’s announcements of
                January 2026 say “100 times”.
              </p>

              {/* How to read the results: draft wording (CLAUDE.md §29). It explains each row, column and the control, and says nothing about why. */}
              <div style={{ color: 'var(--text-muted)' }}>
                <p style={{ marginTop: 0, marginBottom: '0.5rem' }}>
                  <strong>How to read these results.</strong>
                </p>
                <ul style={{ margin: 0, paddingLeft: '1.25rem' }}>
                  <li>
                    <strong>The first table</strong> is the chain of arithmetic behind Pictures 1 and 2 for the galaxy shown: its redshift, how much
                    its light was stretched, where its Lyman-alpha light arrives, how old the universe was then and what share of its present age
                    that is, how long the light travelled, and the two distances. The last column shows each step so you can follow it.
                  </li>
                  <li>
                    <strong>“Time after the Big Bang” and “Distance now”</strong> come from the expansion model described under “What we
                    assume”, so they are the model’s numbers. A scientific paper’s own figure can differ slightly. For MoM-z14 the table shows the
                    paper’s figure beside the model’s.
                  </li>
                  <li>
                    <strong>The second table</strong> lists the four galaxies of the staircase in Picture 2, from the most distant down, with
                    the redshift each paper reports, the model’s time after the Big Bang, the year of the paper and where it comes from. The
                    redshift of JADES-GS-z14-0 is the one refined by ALMA. NIRSpec alone gave 14.32.
                  </li>
                  <li>
                    <strong>“The count”</strong> is the number of Picture 3. It is a published number, quoted from the paper, and was not
                    calculated by this experiment.
                  </li>
                  <li>
                    <strong>“Look at another galaxy”</strong> changes only the first table, Pictures 1 and 2 and the worked examples. It does not
                    change the second table, Picture 3 or your predictions. An imaginary galaxy is labelled as one wherever it appears.
                  </li>
                </ul>
              </div>
            </div>

            <div style={{ marginTop: '1.5rem', fontSize: '0.875rem', color: 'var(--text-muted)' }}>
              <p style={{ marginTop: 0, marginBottom: 0 }}>
                <strong>More to read, now that you have seen the results.</strong> These are the papers and announcements behind the experiment,
                and two pages from NASA and ESA, whose summaries state what the predictions ask, so they were kept back until now. They open in
                a new tab. The papers use technical words, and they open on arxiv.org, the free site where scientists post their papers.
              </p>
              <ul style={{ margin: '0.25rem 0 0', paddingLeft: '1.25rem' }}>
                <li>
                  <ExternalLink href="https://arxiv.org/abs/2505.11263">A Cosmic Miracle: a remarkably luminous galaxy at z=14.44 confirmed with JWST (Naidu et al., 2025)</ExternalLink>
                  : the paper behind MoM-z14: its redshift, its spectrum, its size and brightness, and the comparison with the models’ number of
                  bright galaxies.
                </li>
                <li>
                  <ExternalLink href="https://esawebb.org/news/weic2603/">ESA/Webb: the announcement of MoM-z14 (28 January 2026)</ExternalLink>
                  : the plain-language release from ESA and NASA that announced the galaxy, with what it means in everyday words.
                </li>
                <li>
                  <ExternalLink href="https://science.nasa.gov/mission/webb/early-universe">NASA: Webb and the early universe</ExternalLink>: NASA’s
                  overview of what Webb has found about the first galaxies.
                </li>
                <li>
                  <ExternalLink href="https://arxiv.org/abs/2405.18485">Spectroscopic confirmation of two luminous galaxies at z∼14 (Carniani et al., Nature, 2024)</ExternalLink>
                  : the paper behind JADES-GS-z14-0.
                </li>
                <li>
                  <ExternalLink href="https://arxiv.org/abs/2212.04568">Spectroscopic confirmation of four metal-poor galaxies at z=10.3-13.2 (Curtis-Lake et al., 2023)</ExternalLink>
                  : the paper behind JADES-GS-z13-0.
                </li>
                <li>
                  <ExternalLink href="https://arxiv.org/abs/2302.07256">JADES NIRSpec spectroscopy of GN-z11 (Bunker et al., 2023)</ExternalLink>: the paper behind
                  GN-z11’s redshift of 10.603.
                </li>
                <li>
                  <ExternalLink href="https://arxiv.org/abs/2307.15305">Bursty star formation naturally explains the abundance of bright galaxies at cosmic dawn (Sun et al., 2023)</ExternalLink>
                  : one proposed explanation, from computer simulations of galaxies at redshifts 8 to 12.
                </li>
                <li>
                  <ExternalLink href="https://arxiv.org/abs/2303.04827">Efficient formation of massive galaxies at cosmic dawn by feedback-free starbursts (Dekel et al., 2023)</ExternalLink>
                  : another proposed explanation, for redshifts of about 10 and above.
                </li>
              </ul>
            </div>
          </div>
        )}

        {/* The tutor: observe, compare with the predictions, one conceptual question, then the explanation. The summary below the experiment (in
            App) is shown only once the learner reaches the explanation. */}
        {status === 'complete' && agePrediction !== null && countPrediction !== null && (
          <EarliestGalaxiesTutor
            redshift={redshift}
            galaxyName={nameThe}
            isImaginary={whatIf}
            agePrediction={agePrediction}
            countPrediction={countPrediction}
            onExplained={() => onTutorComplete?.()}
          />
        )}
      </div>
    </div>
  )
}
