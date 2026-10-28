import type { ReactNode } from 'react'
import {
  APPROACH_SPEED_ALTERNATIVE_KM_S,
  APPROACH_SPEED_KM_S,
  MERGER_DISTANCE_KPC,
  MONTE_CARLO_TRIALS_2025,
  PUBLISHED_2025,
  PUBLISHED_2026,
  SIDEWAYS_SPEED_2025_KM_S,
  SIDEWAYS_SPEED_2026_KM_S,
  SIDEWAYS_SPEED_2026_PLUS_MINUS_KM_S,
  distanceKpc,
  sidewaysRange2026,
} from '../physics/localGroupCollision'

// Frontier and Beyond, Experiment 25 (docs/experiments/frontier-and-beyond/25-will-the-milky-way-and-andromeda-collide.md).
// Step 2: the title, the status line, the introduction and the "Want to know more?" links. The predictions, the run, the controls, the results and the tutor come in later steps.
// The wording is the owner's draft of 2026-10-28, approved line by line (CLAUDE.md §28.1), with the one correction listed in the Implementation Notes. Every number comes from the physics module (CLAUDE.md §9).
// Nothing here says how long a straight fall takes, how close the first pass is, or the date the old textbook gave for the collision, because the two predictions ask for them (CLAUDE.md §12).
// The pages that give those dates away are listed only after the run (a later step).

function ExternalLink({ href, children }: { href: string; children: ReactNode }) {
  return (
    <a href={href} target="_blank" rel="noopener noreferrer">
      {children}
    </a>
  )
}

const paragraph = { marginTop: 0, marginBottom: '0.5rem' } as const
const list = { margin: '0.25rem 0 0.75rem', paddingLeft: '1.25rem' } as const

interface LocalGroupCollisionExperimentProps {
  onComplete?: () => void
  onTutorComplete?: () => void
}

export function LocalGroupCollisionExperiment(_props: LocalGroupCollisionExperimentProps) {
  // Display rounding of the module's numbers (no physics here, CLAUDE.md §9).
  const distance = Math.round(distanceKpc())
  const approach = APPROACH_SPEED_KM_S
  const range = sidewaysRange2026()
  const lowRange = Math.round(range.low)
  const highRange = Math.round(range.high)
  const sideways2026 = SIDEWAYS_SPEED_2026_KM_S.toFixed(1)
  const plusMinus = SIDEWAYS_SPEED_2026_PLUS_MINUS_KM_S.toFixed(1)
  return (
    <div>
      <h2>Experiment 25 — Will the Milky Way and Andromeda Collide? (Two Studies, Two Answers)</h2>
      <div className="exp-card" style={{ marginTop: '2rem', padding: '1.5rem' }}>
        <p style={{ marginTop: 0, marginBottom: '1.5rem', fontSize: '0.875rem' }}>
          <strong>Status as of October 2026: Contested. “Contested” means that careful studies disagree.</strong>
        </p>

        <div style={{ marginBottom: '1.5rem' }}>
          <p style={paragraph}>
            <strong>The question.</strong> Our galaxy, the Milky Way, has a big neighbour, the Andromeda galaxy. For years the textbook answer was that the two will certainly crash into each other. In 2025 one study said the chance is only about
            50-50. In 2026 another said about 90 percent. How can two careful studies disagree? This experiment shows that the answer depends on one number that is very hard to measure.
          </p>

          <p style={{ ...paragraph, marginBottom: '0.25rem' }}>
            <strong>Words you will need.</strong>
          </p>
          <ul style={list}>
            <li>
              <strong>Galaxy:</strong> a huge family of stars, gas and dust held together by gravity. The Milky Way holds a few hundred billion stars.
            </li>
            <li>
              <strong>Local Group:</strong> the small neighbourhood of more than fifty galaxies that the Milky Way belongs to. Andromeda and the Milky Way are its two biggest members.
            </li>
            <li>
              <strong>Halo:</strong> a huge, invisible cloud of dark matter around a galaxy, far bigger than its stars. Its mass is what mostly decides how the two galaxies pull on each other (Experiments 6 and 7).
            </li>
            <li>
              <strong>Kiloparsec (kpc):</strong> a distance of about 3,260 light-years. Andromeda is about {distance} kpc away, about 2.5 million light-years.
            </li>
            <li>
              <strong>A billion years:</strong> 1,000 million years.
            </li>
            <li>
              <strong>km/s:</strong> kilometres per second. A fast jet flies at about 0.25 km/s.
            </li>
            <li>
              <strong>Approach speed:</strong> how fast Andromeda moves straight towards us, about {approach} km/s. We measure it from a colour shift in its light, as in Cosmology 1.
            </li>
            <li>
              <strong>Sideways speed:</strong> how fast Andromeda moves across our line of sight. We find it from its <strong>proper motion</strong>, the tiny change in its position on the sky each year. That change is only tens of millionths of an
              arcsecond a year, and an arcsecond is 1/3600 of a degree. The Moon is about 1,800 arcseconds wide, so this is tens of millions of times smaller than the Moon’s width. Gaia, ESA’s star-mapping telescope, measures such shifts.
            </li>
            <li>
              <strong>Merger:</strong> the studies call two galaxies merged when they come within {MERGER_DISTANCE_KPC} kpc of each other.
            </li>
            <li>
              <strong>Dynamical friction:</strong> a slow drag a galaxy feels as it moves through another galaxy’s halo. It takes energy from the orbit and can pull the two together.
            </li>
            <li>
              <strong>Monte Carlo:</strong> a method that repeats a calculation many times with the uncertain numbers drawn at random. The studies ran {MONTE_CARLO_TRIALS_2025.toLocaleString('en-US')} trials.
            </li>
            <li>
              <strong>Give-or-take:</strong> how far a measured number might be off. {sideways2026} ± {plusMinus} km/s means the true value is probably between about {lowRange} and about {highRange}.
            </li>
          </ul>

          <p style={paragraph}>
            <strong>What a “collision” means.</strong> Almost no stars would hit each other. If the Sun were a grain of sand, the nearest star would be about 30 km away. Two galaxies passing through each other are like two swarms of bees flying through
            each other: the pull of gravity bends every path, and over billions of years they settle into one galaxy.
          </p>

          <p style={paragraph}>
            <strong>What the two studies did.</strong> Both studies used the same kind of method, and mostly the same masses. They differ mainly in Andromeda’s sideways speed. In June 2025 Sawala and others (<em>Nature Astronomy</em>) found about{' '}
            {SIDEWAYS_SPEED_2025_KM_S} km/s and about a {PUBLISHED_2025.mergerPercentWithin10Gyr} percent chance of a merger within 10 billion years. In March 2026 Wu and others (accepted by <em>The Astrophysical Journal Letters</em>) used newer Gaia
            measurements and found {sideways2026} ± {plusMinus} km/s and about {PUBLISHED_2026.mergerPercent} percent. Neither study’s sideways-speed paragraph names its frame, so this page says only “the sideways speed the study found”.
          </p>

          <p style={paragraph}>
            <strong>What you will do.</strong> Make two predictions, run the experiment in five stages (the state now, the approach, a straight fall, the sideways loop, the two studies’ values), read the results, then talk it through with the tutor.
            Then, under “Now try it yourself”, you can change the sideways speed and the total mass.
          </p>

          <p style={paragraph}>
            <strong>Your predictions never change the real pictures or tables.</strong> Your guesses are drawn on them in white and shown again beside the results. Only the two controls under “Now try it yourself” change a drawing, and only Drawing A.
          </p>

          <p style={{ marginTop: 0, marginBottom: '0.75rem' }}>
            <strong>Assumptions.</strong> The model has only two points, the Milky Way and Andromeda. It leaves out the Large Magellanic Cloud, M33, the halos’ size, dynamical friction and the expansion of the universe.{' '}
            <strong>It does not calculate a probability of a merger;</strong> the two probabilities above are the studies’ own. The {approach} km/s is a rounded literature value, and a conversion of the 2026 paper’s inputs gives about{' '}
            {APPROACH_SPEED_ALTERNATIVE_KM_S}.
          </p>

          <p style={{ marginTop: 0, marginBottom: '0.75rem' }}>
            <strong>Want to know more?</strong> Plainer-language pages are listed here. Links open in a new tab. This page was written as of October 2026. The papers, and the NASA and ESA pages about the two studies, are listed after the run, because
            they give numbers that the predictions ask for.
          </p>
          <ul style={{ margin: '0.25rem 0 0', paddingLeft: '1.25rem' }}>
            <li>
              <ExternalLink href="https://spaceplace.nasa.gov/galaxy/en/">NASA Space Place: What is a galaxy?</ExternalLink>: a plain definition of a galaxy, with the Milky Way and Andromeda as examples.
            </li>
            <li>
              <ExternalLink href="https://science.nasa.gov/missions/hubble/hubble-meeting-the-neighbors/">NASA Hubble: Meeting the neighbors</ExternalLink>: the Local Group, the gathering of more than fifty galaxies that the Milky Way belongs to.
            </li>
            <li>
              <ExternalLink href="https://science.nasa.gov/mission/hubble/science/science-behind-the-discoveries/hubble-dark-matter/">NASA Hubble: dark matter</ExternalLink>: what dark matter is, and how Hubble found that galaxies can be embedded in haloes of it.
            </li>
            <li>
              <ExternalLink href="https://www.esa.int/Science_Exploration/Space_Science/Gaia/Proper_motion">ESA: Proper motion</ExternalLink>: a short, plain account of what proper motion is, and how it is turned into a speed once the distance is known.
            </li>
            <li>
              <ExternalLink href="https://www.esa.int/Science_Exploration/Space_Science/Gaia">ESA: Gaia</ExternalLink>: the mission that maps the positions and motions of about a billion stars, and its schedule of data releases (the next, Data Release 4, is listed as
              expected in December 2026).
            </li>
            <li>
              <ExternalLink href="https://science.nasa.gov/missions/hubble/what-happens-when-galaxies-collide-hubble-space-telescope-finds-new-surprises/">NASA Hubble: What happens when galaxies collide</ExternalLink>: a 1993 NASA release on what
              happens to the gas and stars when two galaxies collide.
            </li>
          </ul>
        </div>

        {/* Temporary note: removed in Step 3, when the predictions and the run are built. */}
        <p style={{ margin: 0, fontSize: '0.875rem', color: 'var(--text-muted)' }}>The predictions and the run are not built yet.</p>
      </div>
    </div>
  )
}
