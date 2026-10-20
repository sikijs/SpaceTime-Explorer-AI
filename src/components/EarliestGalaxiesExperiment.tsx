import type { ReactNode } from 'react'
import { LYMAN_ALPHA_NM, observedWavelengthNm } from '../physics/earliestGalaxies'
import { ReferencePanel } from './EnergyMomentumExperiment'

// Frontier and Beyond, Experiment 5 (docs/experiments/frontier-and-beyond/05-how-early-can-galaxies-form.md).
// Step 2 builds the status line, the introduction with its new-word list and its "Want to know more?" links, a drawing of a stretched wave
// (an illustration, not data), the collapsed "Words and formulas" panel and the skeleton of Picture 1 with its guide. The predictions, Run,
// the other two pictures, the results, the control, the tutor and the chapter summary come in later steps. All wording is draft for the
// owner's line-by-line approval (CLAUDE.md §28.1), written to the standard of §29. The introduction does not say how old the universe was
// at the galaxy's redshift, what share of its present age that is, that there are more bright galaxies than models expected, or any number
// from the count comparison (that is what the predictions ask, §12). The interface only displays numbers from src/physics (CLAUDE.md §9);
// the only calculation here is where a point is drawn.

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
  { term: 'Bright', meaning: 'in this experiment, “bright” means giving out a lot of light, whatever the distance. A galaxy can look faint because it is far away and still be intrinsically bright.' },
]

export function EarliestGalaxiesExperiment(_props: EarliestGalaxiesExperimentProps) {
  const lymanX = xOfNm(LYMAN_ALPHA_NM)
  const doubledNm = observedWavelengthNm(LYMAN_ALPHA_NM, 1) // a worked example for the guide: a stretch by 2 (z = 1)
  const p1Height = 230

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
              <ExternalLink href="https://www.stsci.edu/contents/news-releases/2019/news-2019-20">
                NASA and STScI: Webb to explore galaxies from cosmic dawn to present day
              </ExternalLink>
              : the questions Webb was built to answer about how the first galaxies formed (written in 2019, before Webb launched).
            </li>
          </ul>
        </div>

        <ReferencePanel entries={REFERENCE_ENTRIES} />

        {/* Picture 1 (Step 2: the skeleton). The light is drawn as it leaves the galaxy; its stretched position comes with Run in a later step. */}
        <div style={{ marginBottom: '1rem' }}>
          <svg
            width={VIEW_WIDTH}
            height={p1Height}
            viewBox={`0 0 ${VIEW_WIDTH} ${p1Height}`}
            style={svgStyle}
            role="img"
            aria-label="A scale of the wavelength of light from 100 to 3,000 nanometres, showing the ultraviolet, visible and near-infrared regions and the wavelength of Lyman-alpha light as it leaves a galaxy"
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
            <text x={(xOfNm(VISIBLE_TO_INFRARED_NM) + AXIS_RIGHT) / 2} y={BAND_TOP + 20} fill={INFRARED_COLOR} fontSize="11" textAnchor="middle">
              near-infrared (and beyond)
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
            <line x1={lymanX} y1={56} x2={lymanX} y2={AXIS_Y} stroke={LYMAN_COLOR} strokeWidth={2.5} />
            <circle cx={lymanX} cy={AXIS_Y} r={4} fill={LYMAN_COLOR} />
            <text x={lymanX + 8} y={54} fill={LYMAN_COLOR} fontSize="11" fontWeight="bold">
              Lyman-alpha as it leaves the galaxy: {LYMAN_ALPHA_NM} nm (ultraviolet)
            </text>

            <text x={AXIS_LEFT} y={AXIS_Y + 80} fill={MUTED_COLOR} fontSize="11">
              Where this light sits after the stretching is drawn here when Run is built (a later step).
            </text>
          </svg>
        </div>
        <div style={{ fontSize: '0.875rem', color: 'var(--text-muted)' }}>
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
              the part of it closest to red. The scale ends at 3,000 nm.
            </li>
            <li>
              <strong>The blue vertical line is the light this experiment follows.</strong> It is <strong>Lyman-alpha</strong>, the particular
              ultraviolet wavelength of {LYMAN_ALPHA_NM} nm that hydrogen gives out and takes in, and that gives the sharp edge used to measure
              a redshift. The line shows where it sits <em>as it leaves the galaxy</em>: in the ultraviolet, where no telescope that sees only
              visible or near-infrared light could see it.
            </li>
            <li>
              <strong>Nothing has been stretched yet.</strong> After you press Run, the picture will show how far the stretching of space moves
              this wavelength to the right.
            </li>
          </ul>
          <p style={paragraph}>
            <strong>A worked moment.</strong> Suppose a galaxy’s light has a redshift of 1. Then it has been stretched to 1 + 1 = 2 times its
            length, so the Lyman-alpha wave leaves at {LYMAN_ALPHA_NM} nm and arrives at {LYMAN_ALPHA_NM} × 2 = {doubledNm.toFixed(1)} nm. That
            is still ultraviolet, so a redshift of 1 is not enough to bring it into the range of visible or near-infrared telescopes. A larger
            redshift moves it further right.
          </p>
          <p style={{ marginTop: 0, marginBottom: 0 }}>
            <strong>What to look for.</strong> Which of the three regions the blue line is in, and how far it would have to move right to reach
            the near-infrared region. The predictions and Run, which show how far the stretching of space really moves it, come in the next step.
          </p>
        </div>
      </div>
    </div>
  )
}
