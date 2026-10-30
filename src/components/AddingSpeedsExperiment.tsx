import type { ReactNode } from 'react'

// Evidence and Imagination, Experiment 3 (docs/experiments/evidence-and-imagination/03-adding-speeds.md).
// Step 2: the title, the status line, the introduction and the "Want to know more?" links. The predictions, the run, the pictures, the results and the tutor come in later steps.
// The wording is Claude's DRAFT of 2026-10-30, for the owner's approval (CLAUDE.md §28.1). Nothing here gives the result of adding 0.5 c and 0.5 c, says what happens when one of the speeds is
// the speed of light, or gives either test's result, because the predictions and the results ask for them (CLAUDE.md §12). The papers, and NASA's page on the speed of light, are listed only after the run.

function ExternalLink({ href, children }: { href: string; children: ReactNode }) {
  return (
    <a href={href} target="_blank" rel="noopener noreferrer">
      {children}
    </a>
  )
}

const paragraph = { marginTop: 0, marginBottom: '0.5rem' } as const
const list = { margin: '0.25rem 0 0.75rem', paddingLeft: '1.25rem' } as const

interface AddingSpeedsExperimentProps {
  onComplete?: () => void
  onTutorComplete?: () => void
}

export function AddingSpeedsExperiment(_props: AddingSpeedsExperimentProps) {
  return (
    <div>
      <h2>Experiment 3 — Can Speeds Simply Be Added?</h2>
      <div className="exp-card" style={{ marginTop: '2rem', padding: '1.5rem' }}>
        <p style={{ marginTop: 0, marginBottom: '1.5rem', fontSize: '0.875rem' }}>
          <strong>
            Status as of October 2026: Settled. “Settled” means that it has been tested by real measurements and scientists no longer doubt it. The two tests used on this page are old ones, from 1851 and 1964. Nothing here is a new result. The
            page shows how the rule has been tested, not a discovery.
          </strong>
        </p>

        <div style={{ marginBottom: '1.5rem' }}>
          <p style={paragraph}>
            <strong>The question.</strong> Everyone knows how to add speeds. If you walk forward at 1 metre per second on a train that moves at 20 metres per second, a person standing on the platform sees you move at 21 metres per second. You just add the
            two. This experiment asks whether that everyday rule keeps working when the speeds are very large, as large as a good fraction of the speed of light, and what has actually been measured.
          </p>

          <p style={paragraph}>
            <strong>An everyday picture.</strong> A speed is always a speed <em>relative to</em> something. The 1 metre per second is your speed relative to the train, and the 20 metres per second is the train’s speed relative to the platform. The question of
            adding speeds is: if I know both, what is your speed relative to the platform? Who measures matters, so this page always says whose measurement it is. Two observers who are moving relative to each other can each have their own measurements, as you
            saw in Experiment 2 of the first chapter, where each one is said to have a <strong>reference frame</strong>. Here there are two: the <strong>lab’s</strong> (the platform, at rest) and the <strong>spaceship’s</strong>.
          </p>

          <p style={{ ...paragraph, marginBottom: '0.25rem' }}>
            <strong>Words you will need.</strong>
          </p>
          <ul style={list}>
            <li>
              <strong>Relative to:</strong> measured by someone who is moving along with the thing, or who is at rest compared with it. “The spaceship’s speed relative to the lab” is the speed that someone in the lab measures for the spaceship.
            </li>
            <li>
              <strong>Reference frame:</strong> the point of view of an observer, with the rulers and clocks that observer carries.
            </li>
            <li>
              <strong>The everyday sum:</strong> simply adding the two speeds, as in the train example. It is the rule you already use, and this page calls it “the everyday sum” so that it can be compared with the rule that is actually measured.
            </li>
            <li>
              <strong>c:</strong> the speed of light in empty space, about 300,000 kilometres per second. “0.5 c” means half of that, about 150,000 kilometres per second.
            </li>
            <li>
              <strong>Probe:</strong> in this page’s imagined spaceship, a small object that the spaceship fires straight ahead.
            </li>
            <li>
              <strong>Gamma ray:</strong> light with extremely high energy. According to NASA, gamma rays have the smallest wavelengths and the most energy of any wave in the electromagnetic spectrum, the family that also includes radio waves, visible light
              and X-rays.
            </li>
            <li>
              <strong>Neutral pion:</strong> a very short-lived particle that can be made when fast particles hit a target. This page uses only one fact about it: when it falls apart, it gives out gamma rays. (How or why is not needed here.)
            </li>
          </ul>

          <p style={paragraph}>
            <strong>Where the question comes from.</strong> The earlier experiments of this site used one idea again and again: how time, length and speed look to observers who move. Speeds are the next thing to look at. Two real tests are on this page: an
            experiment by Hippolyte Fizeau in 1851 on light that passes through flowing water, and an experiment at CERN in 1964 that timed gamma rays from very fast particles. Neither is a new result. They are here because they let you compare the everyday sum
            with what was measured. This page does not give the results until you have made your predictions.
          </p>

          <p style={paragraph}>
            <strong>What you will do.</strong> Make two predictions: one about an imagined spaceship and its probe, and one about the 1964 test. Then run the experiment in five stages: the everyday rule on a train; the same two speeds near the speed of light;
            Fizeau’s water; the 1964 flash; and what happens when one of the two speeds is the speed of light. Then read the results and talk them through with the tutor. Under “Now try it yourself” you can change two settings: the spaceship’s speed and the
            probe’s speed.
          </p>

          <p style={paragraph}>
            <strong>Your predictions never change the real pictures or tables.</strong> Your guesses are drawn on them in white and shown again beside the results. Only the two controls under “Now try it yourself” change a drawing, and only Drawing A.
          </p>

          <p style={{ marginTop: 0, marginBottom: '0.75rem' }}>
            <strong>Assumptions.</strong> Everything happens along one straight line, in one direction. The spaceship and its probe are imagined for the question, and the speeds are steady (no speeding up or turning). Each speed is measured by the observer
            named, with that observer’s own ruler and clock. Sideways motion is left out. The two real tests are described only as far as the page needs them.
          </p>

          <p style={{ marginTop: 0, marginBottom: '0.75rem' }}>
            <strong>Want to know more?</strong> Plainer-language pages are listed here. Links open in a new tab. This page was written as of October 2026. The papers behind the tests, and a NASA page about the speed of light, are listed after the run, because
            they give away the answers to the predictions.
          </p>
          <ul style={{ margin: '0.25rem 0 0.75rem', paddingLeft: '1.25rem' }}>
            <li>
              <ExternalLink href="https://science.nasa.gov/ems/12_gammarays/">NASA Science: Gamma Rays</ExternalLink>: a plain account of what gamma rays are, how they differ from other kinds of light, and where they come from.
            </li>
          </ul>
          <p style={{ marginTop: 0, marginBottom: 0, fontSize: '0.875rem' }}>
            No plain page from NASA, ESA, CERN or another official source was found for adding speeds, for neutral pions or for how a particle accelerator works, so this page explains them in its own words.
          </p>
        </div>

        {/* Temporary note: removed as the later steps (predictions, run, results, tutor) are built. */}
        <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: 0 }}>The predictions, the run, the results and the tutor are not built yet.</p>
      </div>
    </div>
  )
}
