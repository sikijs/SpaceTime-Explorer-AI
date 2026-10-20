import type { ReactNode } from 'react'
import { chanceOfNoEvents, EXPECTED_AT_LIMIT, LZ_DECEMBER_2025 } from '../physics/darkMatterSearches'
import { ReferencePanel } from './EnergyMomentumExperiment'

// Frontier and Beyond, Experiment 6 (docs/experiments/frontier-and-beyond/06-where-is-the-dark-matter.md).
// Step 2 builds the status line, the introduction with its new-word list and its "Want to know more?" links, a drawing of a detector (an
// illustration, not data), the collapsed "Words and formulas" panel and the skeleton of Picture 1 with its guide. The predictions, Run, the
// other two pictures, the results, the controls, the tutor and the chapter summary come in later steps. All wording is draft for the owner's
// line-by-line approval (CLAUDE.md §28.1), written to the standard of §29. The introduction does not give the 2026 event's energy, exposure
// or significance, or say how the global significance compares with the local one (that is what Prediction 2 asks, §12). The interface only
// displays numbers from src/physics (CLAUDE.md §9); the only calculation here is where a point is drawn.

interface DarkMatterSearchesExperimentProps {
  onComplete?: () => void
  onTutorComplete?: () => void
}

const VIEW_WIDTH = 560
const TEXT_COLOR = '#e2e8f0'
const MUTED_COLOR = '#94a3b8'
const PARTICLE_COLOR = '#a78bfa' // violet: the dark-matter particle
const XENON_COLOR = '#38bdf8' // sky blue: the liquid xenon
const FLASH_COLOR = '#fde047' // yellow: the flash of light
const ELECTRON_COLOR = '#4ade80' // green: the freed electrons
const ROCK_COLOR = '#475569'
const CURVE_COLOR = '#fb923c' // orange: the chance of seeing nothing

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

// ---- The detector (an illustration, not data) ----
function DetectorDrawing() {
  const height = 330
  const tankX = 110
  const tankY = 150
  const tankW = 200
  const tankH = 130
  const bumpX = 214
  const bumpY = tankY + 66
  const labelX = tankX + tankW + 14
  return (
    <svg
      width={VIEW_WIDTH}
      height={height}
      viewBox={`0 0 ${VIEW_WIDTH} ${height}`}
      style={svgStyle}
      role="img"
      aria-label="A tank of liquid xenon deep underground: a dark-matter particle passes into the tank, bumps a xenon nucleus, and sensors above and below pick up a flash of light and a few freed electrons"
    >
      <text x={20} y={22} fill={TEXT_COLOR} fontSize="13" fontWeight="bold">
        Illustration: a dark-matter detector
      </text>

      {/* The surface and the rock. */}
      <line x1={20} y1={44} x2={540} y2={44} stroke={TEXT_COLOR} strokeWidth={2} />
      <text x={28} y={38} fill={TEXT_COLOR} fontSize="11">
        The Earth’s surface
      </text>
      <rect x={20} y={46} width={520} height={height - 70} fill={ROCK_COLOR} opacity={0.25} />
      <text x={labelX} y={72} fill={MUTED_COLOR} fontSize="11">
        solid rock
      </text>
      <text x={labelX} y={88} fill={MUTED_COLOR} fontSize="10">
        (blocks most cosmic rays)
      </text>

      {/* The depth. */}
      <line x1={38} y1={56} x2={38} y2={tankY - 12} stroke={TEXT_COLOR} strokeWidth={1.5} strokeDasharray="4 3" />
      <polygon points="34,58 38,48 42,58" fill={TEXT_COLOR} />
      <polygon points={`34,${tankY - 14} 38,${tankY - 4} 42,${tankY - 14}`} fill={TEXT_COLOR} />
      <text x={48} y={100} fill={TEXT_COLOR} fontSize="11">
        nearly a mile
      </text>
      <text x={48} y={114} fill={TEXT_COLOR} fontSize="11">
        down
      </text>

      {/* The tank. */}
      <rect x={tankX} y={tankY} width={tankW} height={tankH} fill={XENON_COLOR} opacity={0.18} stroke={XENON_COLOR} strokeWidth={2} rx={6} />
      <text x={tankX + 10} y={tankY + tankH - 10} fill={XENON_COLOR} fontSize="12" fontWeight="bold">
        liquid xenon
      </text>
      {/* The light sensors, above and below. */}
      {[0, 1, 2, 3, 4].map((i) => (
        <g key={i}>
          <rect x={tankX + 10 + i * 38} y={tankY - 14} width={28} height={10} fill={TEXT_COLOR} opacity={0.8} />
          <rect x={tankX + 10 + i * 38} y={tankY + tankH + 4} width={28} height={10} fill={TEXT_COLOR} opacity={0.8} />
        </g>
      ))}
      <text x={labelX} y={tankY - 6} fill={TEXT_COLOR} fontSize="11">
        light sensors (above and below)
      </text>

      {/* The particle, the bump, the flash and the electrons. */}
      <line x1={186} y1={tankY - 40} x2={bumpX - 4} y2={bumpY - 10} stroke={PARTICLE_COLOR} strokeWidth={2.5} strokeDasharray="6 4" />
      <polygon points={`${bumpX - 10},${bumpY - 14} ${bumpX - 2},${bumpY - 8} ${bumpX - 14},${bumpY - 4}`} fill={PARTICLE_COLOR} />
      <text x={labelX} y={tankY - 38} fill={PARTICLE_COLOR} fontSize="11" fontWeight="bold">
        a dark-matter particle
      </text>
      <text x={labelX} y={tankY - 24} fill={PARTICLE_COLOR} fontSize="10">
        (almost always passes straight through)
      </text>
      <polygon
        points="0,-22 6,-8 22,-8 9,2 14,18 0,8 -14,18 -9,2 -22,-8 -6,-8"
        fill={FLASH_COLOR}
        opacity={0.85}
        transform={`translate(${bumpX}, ${bumpY})`}
      />
      <circle cx={bumpX} cy={bumpY} r={5} fill={TEXT_COLOR} />
      <text x={labelX} y={tankY + 34} fill={FLASH_COLOR} fontSize="11" fontWeight="bold">
        a flash of light
      </text>
      <text x={labelX} y={tankY + 66} fill={TEXT_COLOR} fontSize="11">
        a xenon nucleus is bumped (a recoil)
      </text>
      {[0, 1, 2, 3, 4].map((i) => (
        <circle key={i} cx={bumpX + 12 + i * 9} cy={bumpY + 26 - i * 3} r={2.4} fill={ELECTRON_COLOR} />
      ))}
      <text x={labelX} y={tankY + 98} fill={ELECTRON_COLOR} fontSize="11" fontWeight="bold">
        a few freed electrons
      </text>

      <text x={20} y={height - 8} fill={MUTED_COLOR} fontSize="10">
        Not to scale, and most particles do not bump anything.
      </text>
    </svg>
  )
}

// ---- Picture 1: what does seeing nothing rule out? (Step 2: the axes and the curve) ----
const P1_LEFT = 70
const P1_RIGHT = 520
const P1_TOP = 56
const P1_BOTTOM = 210
const P1_MAX_N = 6
const P1_HEIGHT = 290
const nToX = (n: number) => P1_LEFT + (n / P1_MAX_N) * (P1_RIGHT - P1_LEFT)
const chanceToY = (chance: number) => P1_BOTTOM - chance * (P1_BOTTOM - P1_TOP)

const CURVE_POINTS = (() => {
  const points: string[] = []
  const steps = 120
  for (let i = 0; i <= steps; i++) {
    const n = (P1_MAX_N * i) / steps
    points.push(`${i === 0 ? 'M' : 'L'}${nToX(n).toFixed(1)},${chanceToY(chanceOfNoEvents(n)).toFixed(1)}`)
  }
  return points.join(' ')
})()

const REFERENCE_ENTRIES: { term: string; meaning: string }[] = [
  { term: 'Dark matter', meaning: 'the unseen material that supplies extra gravity in galaxies and galaxy clusters (Cosmology Experiments 4 and 7). Its gravity is measured. What it is made of is not known.' },
  { term: 'WIMP', meaning: 'a “weakly interacting massive particle”: the kind of particle that many dark-matter searches look for. Weakly interacting means that it almost never touches ordinary matter, and massive means that it has a mass, probably far more than a neutrino’s.' },
  { term: 'GeV/c²', meaning: 'a unit of mass used for particles. A proton weighs about 1 GeV/c², so a particle of “3 to 9 GeV/c²” weighs about three to nine times a proton.' },
  { term: 'Liquid xenon detector', meaning: 'a tank of xenon, a very heavy, very pure gas, cooled until it is a liquid. When a particle bumps a xenon nucleus, the atom gives out a flash of light and some electrons, and sensors count both (see the Imperial College link below).' },
  { term: 'Nuclear recoil, and keV', meaning: 'a nuclear recoil is what happens when something bumps the nucleus at the centre of an atom, and the nucleus is knocked back. Its energy is measured in keV (kilo-electron-volts, thousands of electron-volts, a unit of energy used for particles: Spacetime Geometry Experiment 5). A bigger number means a harder bump.' },
  { term: 'Cross-section', meaning: 'how strongly a particle interacts, pictured as the size of the target it sees: a bigger target is bumped more often. It is written as an area, in square centimetres (cm²). A smaller number means a weaker interaction.' },
  { term: 'Exposure, tonne-year and live day', meaning: 'how much chance a detector has had to catch something: the mass of the target times the time it has been watching. A tonne-year is one tonne of target watched for one year. A live day is a day when the detector was working and taking good data, which is not every day.' },
  { term: 'Expected events', meaning: 'the average number of bumps you would count if a particle of a given strength were really there. It is bigger for a stronger interaction and for a bigger exposure. You can expect 0.1 events and see none, or expect 5 and see none. The second is much more surprising.' },
  { term: 'Limit (90 percent)', meaning: 'a statement of the kind “particles stronger than this are ruled out”. It is not a measurement of the particle. It is drawn where seeing nothing would be a 1-in-10 accident, so a 90 percent limit means that we are 90 percent sure that nothing stronger is out there.' },
  { term: 'Background', meaning: 'anything that makes the same kind of flash as a dark-matter particle but is not one, such as a trace of radioactivity in the materials, or particles from space. Searches try to make the background as close to zero as they can.' },
  { term: 'Neutrino', meaning: 'a particle with no electric charge that almost never touches anything, so it passes through ordinary matter almost untouched (Experiment 4 of this group). Neutrinos come from many places, including the Sun’s core.' },
  { term: 'Boron-8 neutrinos, and CEvNS', meaning: 'boron-8 neutrinos are a rare kind made in the Sun’s fusion. CEvNS is the long name, “coherent elastic neutrino-nucleus scattering”, for what happens when a neutrino bumps a whole atomic nucleus at once instead of its parts. It gives the same kind of flash as a light dark-matter particle.' },
  { term: 'Neutrino fog', meaning: 'the name for the point where neutrinos from the Sun and the atmosphere make the same flashes as dark matter would. They are a real signal that is worth detecting, and they are also a background for the search. LZ’s new view of boron-8 neutrinos, at 4.5 sigma, shows it is reaching the fog.' },
  { term: 'Sigma', meaning: 'a way of saying how sure a measurement or detection is (Experiment 1 of this group): the size of a result counted in units of its own “give or take”. The bigger the number, the less likely it is just chance. About 1 sigma is ordinary, and 5 sigma is the usual bar in many sciences for calling something real.' },
  { term: 'Hint, evidence and discovery', meaning: 'the three names used in this group (Experiment 2): below about 3 sigma is a hint, from about 3 sigma it is often called evidence, and about 5 sigma is the usual bar for a discovery.' },
]

export function DarkMatterSearchesExperiment(_props: DarkMatterSearchesExperimentProps) {
  const chanceAt1 = chanceOfNoEvents(1)
  const chanceAt5 = chanceOfNoEvents(5)

  return (
    <div>
      <h2>Experiment 6 — Where Is the Dark Matter?</h2>
      <div className="exp-card" style={{ marginTop: '2rem', padding: '1.5rem' }}>
        <p style={{ marginTop: 0, marginBottom: '1.5rem', fontSize: '0.875rem' }}>
          <strong>
            Where this stands (as of October 2026): Strong evidence about what dark matter is not; Open: what it is, and what one unexplained event
            means.
          </strong>{' '}
          Searches have ruled out some kinds of dark-matter particle. No search has found one.
        </p>

        {/* Introduction: draft wording for the owner's review (CLAUDE.md §28.1), written to the standard of CLAUDE.md §29. */}
        <div style={{ marginBottom: '2rem', fontSize: '0.875rem', color: 'var(--text-muted)' }}>
          <p style={paragraph}>
            <strong>The question.</strong> If dark-matter particles are passing through the Earth all the time, why has no one caught one? And what
            does it mean when a search finds nothing, or finds a single odd event?
          </p>

          <p style={paragraph}>
            <strong>Where we left off.</strong> In Cosmology Experiments 4 and 7 you saw that galaxies spin too fast to be held together by the matter
            we can see, and that light is bent by more mass than we can see. Something unseen supplies the extra gravity, and we call it{' '}
            <strong>dark matter</strong>. NASA calls it “the invisible glue that holds the universe together”. In Experiments 1 to 5 of this group you
            met sigma, the difference between a hint and a discovery, and what happens when a new telescope looks further than any before it. This
            experiment is about a different kind of search: not looking at the sky, but waiting, deep underground, for a single particle to bump a
            single atom.
          </p>

          <p style={paragraph}>
            <strong>What would a dark-matter particle do?</strong> The gravity of dark matter is measured, but what it is made of is not known. One
            leading idea is that it is a particle that has mass and almost never touches anything else. As CERN puts it, dark matter “does not absorb,
            reflect or emit light”, which is why it is so hard to spot. Think of a ghost that walks through walls: it is there, but it almost never
            touches anything. If it is a particle, then nearly all of them pass through the Earth, and through you, without a trace. Once in a very
            great while, one might bump the nucleus of an atom.
          </p>

          <p style={paragraph}>
            <strong>How to catch one.</strong> One of the largest experiments of this kind is <strong>LZ</strong> (LUX-ZEPLIN), in South Dakota. At its heart is a
            tank of liquid xenon: 10 tonnes in all, of which, LZ’s own site says, seven active tonnes act as the target. Xenon is a very heavy, very
            pure gas, cooled until it is a liquid, and it is kept nearly a mile underground, in an old gold mine, so that the rock blocks most
            particles from space. When a particle bumps a xenon nucleus, the atom gives out <strong>a flash of light and some electrons</strong>, and
            very sensitive sensors count both. A bump is called a <strong>recoil</strong>, because the nucleus is knocked back.
          </p>

          <div style={{ marginBottom: '0.75rem' }}>
            <DetectorDrawing />
          </div>
          <div style={{ fontSize: '0.875rem', color: 'var(--text-muted)', marginBottom: '0.75rem' }}>
            <p style={paragraph}>
              <strong>How to read this drawing.</strong> It is an illustration of the idea, not a plan of the real detector. The thick line at the top is
              the Earth’s surface. Below it is solid rock, and the vertical arrow shows that the tank is{' '}
              <strong>nearly a mile down</strong> (LZ’s own site gives its depth as the 4,850-foot level of the mine). The blue box is the tank of{' '}
              <strong>liquid xenon</strong>. The white blocks above and below it are the <strong>light sensors</strong>. The violet dashed arrow is a{' '}
              <strong>dark-matter particle</strong>, drawn as if one were passing through: nearly all would pass straight through without touching
              anything. The white dot is a xenon nucleus that has been <strong>bumped</strong>. The yellow star is the <strong>flash of light</strong> that
              this gives, and the green dots are the <strong>freed electrons</strong>. Both are what the sensors count. The point of the picture is that
              the experiment does not see the particle itself. It sees the flash and the electrons that a bump leaves behind. The sizes and the
              position of the bump are for illustration only.
            </p>
          </div>

          <p style={paragraph}>
            <strong>Strength, in plain words.</strong> How often a particle bumps something depends on how strongly it interacts. Physicists describe
            that as a <strong>cross-section</strong>, which you can picture as the size of the target the particle sees: a bigger target is bumped more
            often. It is written as an area, in square centimetres. A smaller number means a weaker interaction, and so fewer bumps.
          </p>

          <p style={paragraph}>
            <strong>How many bumps to expect.</strong> Think of rain on a roof. A bigger roof and a longer storm both mean more raindrops. In the same way
            the number of bumps you <em>expect</em> depends on how strong the interaction is, and on the <strong>exposure</strong>: how much xenon you
            have and how long you have watched it. Exposure is measured in <strong>tonne-years</strong>, and the days when the detector is taking good
            data are called <strong>live days</strong>. If the strength doubles, you expect twice as many bumps. If the exposure doubles, you also expect
            twice as many.
          </p>

          <p style={paragraph}>
            <strong>Counting, and what seeing nothing means.</strong> Expecting 5 bumps and seeing none would be very surprising. Expecting a tenth of
            a bump and seeing none would not be. So when a search sees nothing, it can rule out the strengths for which it would have expected to see
            something, and say nothing about weaker ones. A <strong>limit</strong> is where that line is drawn: the strength at which the experiment
            would have expected about {EXPECTED_AT_LIMIT.toFixed(1)} bumps, so that seeing none would happen about 1 time in 10. A limit is a statement
            about what the data allow. It is not a measurement of the particle.
          </p>

          <p style={paragraph}>
            <strong>The neutrino fog.</strong> A tank that sensitive picks up more than dark matter. Neutrinos (Experiment 4) come from the Sun’s core
            too, and a rare kind, called boron-8 neutrinos, sometimes bump a whole xenon nucleus at once. That gives the same kind of flash as a light
            dark-matter particle would. These neutrinos are a real signal, and they are also a background: the more sensitive the detector, the more
            they get in the way. This is called the <strong>neutrino fog</strong>. In December 2025 LZ saw the boron-8 neutrinos at{' '}
            {LZ_DECEMBER_2025.boron8Sigma} sigma, which its team calls strong evidence.
          </p>

          <p style={paragraph}>
            <strong>What LZ found.</strong> In December 2025 LZ reported that {LZ_DECEMBER_2025.liveDays} live days of data (March 2023 to April 2025)
            showed no sign of dark-matter particles of 3 to 9 times a proton’s mass, and the strongest limits yet above 5 times a proton’s mass. That
            narrows what dark matter can be: the simplest kinds of particle are ruled out at those masses and strengths. It does <em>not</em> show that
            dark matter does not exist, because its gravity is measured. In 2026 the experiment also looked at a wider range of recoil energies, up
            to much harder bumps, and found one event at a very high energy. What that event is, and how sure we can be that it means anything, is the other half of this
            experiment.
          </p>

          <div style={{ marginBottom: '0.75rem' }}>
            <p style={{ marginTop: 0, marginBottom: '0.5rem' }}>
              <strong>Some new words.</strong> The “Words and formulas” box below has each one, with the ones from earlier experiments.
            </p>
            <ul style={{ margin: 0, paddingLeft: '1.25rem' }}>
              <li>
                <strong>WIMP</strong>: a “weakly interacting massive particle”, the kind of particle that many searches look for.
              </li>
              <li>
                <strong>Recoil</strong> and <strong>keV</strong>: a bump of a nucleus, and the unit, thousands of electron-volts, that measures how hard it
                was.
              </li>
              <li>
                <strong>Cross-section</strong>: the strength of an interaction, pictured as the size of a target. A smaller number is a weaker interaction.
              </li>
              <li>
                <strong>Exposure</strong>, <strong>tonne-year</strong> and <strong>live day</strong>: how much chance a detector has had to catch
                something.
              </li>
              <li>
                <strong>Limit</strong>: the strength at which you would expect about {EXPECTED_AT_LIMIT.toFixed(1)} bumps, so that seeing none is a 1-in-10
                accident.
              </li>
              <li>
                <strong>Background</strong> and <strong>neutrino fog</strong>: flashes that look like dark matter but are not, and the point where
                neutrinos from the Sun become one.
              </li>
              <li>
                <strong>Sigma</strong> (reminder from Experiments 1 and 2): how sure a result is. About 3 sigma is often called evidence, and 5 sigma is the
                usual bar for a discovery.
              </li>
            </ul>
          </div>

          <p style={paragraph}>
            <strong>What you will do.</strong> You will make two predictions, press Run to watch the pictures build up one stage at a time, and then try a
            search of your own and change how many places were looked. Nothing here is graded.
          </p>

          <p style={paragraph}>
            <strong>What we assume.</strong> This experiment is a counting model, and it is simpler than the real analysis. It treats the number of
            bumps you expect as proportional to the strength and to the exposure. It treats a limit as the strength at which you would expect about{' '}
            {EXPECTED_AT_LIMIT.toFixed(1)} bumps, as an illustration: LZ’s own limits come from a more detailed statistical method. Where it shows how
            a limit improves with more data, it uses two idealised cases, and these are not LZ’s own forecast. Where it asks how many places were
            looked, it treats them as separate tries with equal chance, which is not how LZ worked out its own number. And all the published numbers are
            quoted as the papers state them. This experiment cannot reproduce LZ’s limits, and it cannot say what the unusual event is.
          </p>

          <p style={{ marginTop: 0, marginBottom: '0.75rem' }}>
            <strong>Want to know more?</strong> Plainer-language pages are listed here. Links to the original scientific papers appear below the results,
            after you press Run, because their summaries state what the predictions ask, and you should get to guess first. Links open in a new tab. This
            page was written as of October 2026.
          </p>
          <ul style={{ margin: '0.25rem 0 0', paddingLeft: '1.25rem' }}>
            <li>
              <ExternalLink href="https://home.cern/science/physics/dark-matter">CERN: Dark matter</ExternalLink>: what dark matter is, why galaxies need
              it, and how physicists look for it, in plain words.
            </li>
            <li>
              <ExternalLink href="https://science.nasa.gov/dark-matter/">NASA: Dark matter</ExternalLink>: how dark matter was first suspected, how much
              of the universe it makes up, and how astronomers map it by the way its gravity bends light.
            </li>
            <li>
              <ExternalLink href="https://lz.lbl.gov/">LZ: the LUX-ZEPLIN experiment</ExternalLink>: the experiment’s own site, from the team that runs it,
              on what it is, how its detector is built and where it is.
            </li>
            <li>
              <ExternalLink href="https://www6.slac.stanford.edu/news/2025-12-08-lz-sets-worlds-best-hunt-galactic-dark-matter-and-gets-new-look-neutrinos-suns-core">
                SLAC: LZ sets a world’s best in the hunt for galactic dark matter (8 December 2025)
              </ExternalLink>
              : the announcement of the December 2025 results, with the live days, the masses searched and the solar neutrinos.
            </li>
            <li>
              <ExternalLink href="https://www.imperial.ac.uk/news/articles/natural-sciences/physics/2025/dark-matter-search-sets-new-limits-and-achieves-neutrino-breakthrough/">
                Imperial College London: Dark matter search sets new limits and achieves neutrino breakthrough (8 December 2025)
              </ExternalLink>
              : the same results explained in plain words, including how the detector turns a bump into a flash and electrons.
            </li>
          </ul>
        </div>

        <ReferencePanel entries={REFERENCE_ENTRIES} />

        {/* Picture 1 (Step 2: the skeleton). The curve is drawn; the limit, the shaded regions and the learner's own search come with Run. */}
        <div style={{ marginBottom: '1rem' }}>
          <svg
            width={VIEW_WIDTH}
            height={P1_HEIGHT}
            viewBox={`0 0 ${VIEW_WIDTH} ${P1_HEIGHT}`}
            style={svgStyle}
            role="img"
            aria-label="A curve of the chance of seeing no events against the number of events expected, falling from 1 when none are expected toward 0"
          >
            <text x={P1_LEFT} y={22} fill={TEXT_COLOR} fontSize="13" fontWeight="bold">
              Picture 1: what does seeing nothing rule out?
            </text>

            {/* The axes and ticks. */}
            <line x1={P1_LEFT} y1={P1_BOTTOM} x2={P1_RIGHT} y2={P1_BOTTOM} stroke={TEXT_COLOR} strokeWidth={1.5} />
            <line x1={P1_LEFT} y1={P1_TOP} x2={P1_LEFT} y2={P1_BOTTOM} stroke={TEXT_COLOR} strokeWidth={1.5} />
            {[0, 1, 2, 3, 4, 5, 6].map((n) => (
              <g key={n}>
                <line x1={nToX(n)} y1={P1_BOTTOM} x2={nToX(n)} y2={P1_BOTTOM + 6} stroke={TEXT_COLOR} />
                <text x={nToX(n)} y={P1_BOTTOM + 20} fill={TEXT_COLOR} fontSize="10" textAnchor="middle">
                  {n}
                </text>
              </g>
            ))}
            {[0, 0.25, 0.5, 0.75, 1].map((chance) => (
              <g key={chance}>
                <line x1={P1_LEFT - 6} y1={chanceToY(chance)} x2={P1_LEFT} y2={chanceToY(chance)} stroke={TEXT_COLOR} />
                <text x={P1_LEFT - 10} y={chanceToY(chance) + 3} fill={TEXT_COLOR} fontSize="10" textAnchor="end">
                  {Math.round(chance * 100)}%
                </text>
              </g>
            ))}
            <text x={(P1_LEFT + P1_RIGHT) / 2} y={P1_BOTTOM + 40} fill={MUTED_COLOR} fontSize="10" textAnchor="middle">
              the number of events expected, if a particle of that strength were really there
            </text>
            <text x={P1_LEFT} y={P1_TOP - 8} fill={MUTED_COLOR} fontSize="10">
              the chance of seeing none
            </text>

            {/* The curve: the chance of seeing no events when N are expected (from the physics module). */}
            <path d={CURVE_POINTS} fill="none" stroke={CURVE_COLOR} strokeWidth={2.5} />
            <text x={nToX(0.2)} y={chanceToY(chanceOfNoEvents(0.2)) - 8} fill={CURVE_COLOR} fontSize="11" fontWeight="bold">
              chance of seeing none
            </text>

            <text x={P1_LEFT} y={P1_HEIGHT - 12} fill={MUTED_COLOR} fontSize="11">
              Today’s limit, and the regions it rules out, are drawn here when you press Run.
            </text>
          </svg>
        </div>
        <div style={{ fontSize: '0.875rem', color: 'var(--text-muted)' }}>
          <p style={paragraph}>
            <strong>How to read Picture 1.</strong> This picture is about a search that sees <em>nothing</em>. The horizontal line is the number of events
            the experiment would <strong>expect</strong> to count if a particle of some given strength were really there. Further to the right means a
            stronger interaction (or more exposure). The vertical line is the <strong>chance of seeing none</strong>, from 0 percent to 100 percent.
          </p>
          <ul style={{ margin: '0 0 0.75rem', paddingLeft: '1.25rem' }}>
            <li>
              <strong>The orange curve</strong> gives that chance for every expected number. At the far left, nothing is expected, so seeing none is
              certain (100 percent). As the expected number grows, seeing none becomes less and less likely. <strong>A curve that falls faster</strong>{' '}
              would mean that seeing nothing rules out more.
            </li>
            <li>
              <strong>Nothing else is drawn yet.</strong> After you press Run, the picture will mark today’s limit on this curve and shade the strengths
              that seeing nothing rules out and those it does not.
            </li>
          </ul>
          <p style={paragraph}>
            <strong>A worked moment.</strong> Suppose the experiment expects 1 event. The curve says the chance of seeing none is{' '}
            {(chanceAt1 * 100).toFixed(1)} percent, which is not unusual: seeing nothing would tell you little. Suppose it expects 5 events. Then the
            chance of seeing none is only {(chanceAt5 * 100).toFixed(1)} percent, so if nothing is seen, a particle that strong is very unlikely to be
            there.
          </p>
          <p style={{ marginTop: 0, marginBottom: 0 }}>
            <strong>What to look for.</strong> How quickly the curve falls, and roughly where it is at the 10 percent level. The predictions and Run, which
            mark where today’s limit sits, come in the next step.
          </p>
        </div>
      </div>
    </div>
  )
}
