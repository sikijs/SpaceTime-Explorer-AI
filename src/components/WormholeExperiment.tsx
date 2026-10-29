import type { ReactNode } from 'react'

// Evidence and Imagination, Experiment 1 (docs/experiments/evidence-and-imagination/01-can-a-wormhole-exist.md).
// Step 2: the title, the status line, the introduction and the "Want to know more?" links. The predictions, the run, the pictures, the results and the tutor come in later steps.
// The wording is the owner's draft of 2026-10-29, approved (CLAUDE.md §28.1), with the one-line honesty note kept on the page at the owner's request. Nothing here says that a throat pinches
// off, how much negative mass a throat needs, or how small the Casimir energy is, because the predictions and the results ask for them (CLAUDE.md §12). The papers are listed only after the run.

function ExternalLink({ href, children }: { href: string; children: ReactNode }) {
  return (
    <a href={href} target="_blank" rel="noopener noreferrer">
      {children}
    </a>
  )
}

const paragraph = { marginTop: 0, marginBottom: '0.5rem' } as const
const list = { margin: '0.25rem 0 0.75rem', paddingLeft: '1.25rem' } as const

interface WormholeExperimentProps {
  onComplete?: () => void
  onTutorComplete?: () => void
}

export function WormholeExperiment(_props: WormholeExperimentProps) {
  return (
    <div>
      <h2>Experiment 1 — Can a Wormhole Exist? (What Would It Take to Hold One Open?)</h2>
      <div className="exp-card" style={{ marginTop: '2rem', padding: '1.5rem' }}>
        <p style={{ marginTop: 0, marginBottom: '1.5rem', fontSize: '0.875rem' }}>
          <strong>Status as of October 2026: Open. “Open” means that nobody knows whether any wormhole exists. The mathematics allows them on paper, and no one has seen one.</strong>
        </p>

        <div style={{ marginBottom: '1.5rem' }}>
          <p style={paragraph}>
            <strong>The question.</strong> Films often show a wormhole as a tunnel that joins two faraway places, so that a ship can cross the galaxy in minutes. Could such a tunnel really exist? Einstein’s theory of gravity, general relativity, allows
            tunnel-like shapes in its equations. This experiment asks two plain questions about the simplest ones: will the tunnel stay open, and what would it take to hold one open? It does not say that wormholes exist, and it does not say that they cannot.
            It shows what the mathematics says, what it needs, and what astronomers have looked for.
          </p>

          <p style={paragraph}>
            <strong>An everyday picture.</strong> Two towns sit on opposite sides of a mountain. The road goes round the mountain, which is long. A tunnel goes straight through, which is short. A wormhole is the same idea for space itself: a tunnel that is
            shorter than any route outside it. You met curved space in the Gravity and Curved Spacetime chapter: mass bends space, and the bending is what we feel as gravity. A wormhole is a bend so strong that space forms a tunnel.
          </p>

          <p style={{ ...paragraph, marginBottom: '0.25rem' }}>
            <strong>Words you will need.</strong>
          </p>
          <ul style={list}>
            <li>
              <strong>Spacetime:</strong> space and time taken together as one stage. Mass bends it, and that bending is gravity.
            </li>
            <li>
              <strong>Wormhole:</strong> a possible tunnel through spacetime that joins two places, or two universes.
            </li>
            <li>
              <strong>Mouth and throat:</strong> a wormhole has two mouths (its openings) and a throat, its narrowest part, between them.
            </li>
            <li>
              <strong>Einstein–Rosen bridge:</strong> the first wormhole-like shape, found in 1935. It is part of the full mathematical solution for a black hole (Black Holes and Strong Gravity chapter).
            </li>
            <li>
              <strong>Negative energy and exotic matter:</strong> ordinary matter and light have energy above zero. Negative energy would be below the energy of empty space. Matter that had it would be called exotic. No such matter is known in more than a
              trace.
            </li>
            <li>
              <strong>Tension:</strong> a stretching pull, like the pull along a taut rope. Here it is measured as force per square metre (pascals).
            </li>
            <li>
              <strong>Casimir effect:</strong> two metal plates placed very close together in a vacuum are pushed together by a tiny force. The energy in the gap is slightly below that of empty space, which is a very small amount of negative energy. It has
              been measured.
            </li>
            <li>
              <strong>Echo:</strong> a faint repeat of a signal, a little later, in gravitational-wave data. Some ideas say a wormhole, unlike a black hole, would leave one.
            </li>
          </ul>

          <p style={paragraph}>
            <strong>Where the idea comes from.</strong> The first tunnel-like shape was found in 1935 by Albert Einstein and Nathan Rosen, who were trying to model a particle, not a tunnel. In 1962 Robert Fuller and John Wheeler studied whether such a shape
            could be crossed. In 1988 Michael Morris and Kip Thorne worked out tunnels that a traveller could in principle pass through, and wrote it up, in their paper’s own words, as “a tool for teaching general relativity”.
          </p>

          <p style={paragraph}>
            <strong>What is known today.</strong> No wormhole has ever been seen. NASA says that the mathematics of general relativity allows wormholes, that nobody knows how one would be made, and that there is no evidence for one in the observed universe.
            NASA’s page on black holes adds that black holes are not wormholes: they do not provide shortcuts between different points in space.
          </p>

          <p style={paragraph}>
            <strong>What you will do.</strong> Make two predictions. Then run the experiment in five stages: what a wormhole would be, the shape of its throat, what happens to the simplest one, what it would take to hold one open, and what has been looked
            for. Then read the results and talk them through with the tutor. Under “Now try it yourself” you can change two settings: the size of the throat, and the gap between two metal plates.
          </p>

          <p style={paragraph}>
            <strong>Your predictions never change the real pictures or tables.</strong> Your guesses are drawn on them in white and shown again beside the results. Only the two controls under “Now try it yourself” change a drawing, and only Drawing A.
          </p>

          <p style={{ marginTop: 0, marginBottom: '0.75rem' }}>
            <strong>Assumptions.</strong> Every picture is a toy: a shape worked out from the mathematics, not something anyone has photographed. The model uses only the simplest throat, with no spin, no electric charge and no pull on a traveller’s body, and
            nothing about how one might form.
          </p>

          <p style={{ marginTop: 0, marginBottom: '0.75rem' }}>
            <strong>Want to know more?</strong> Plainer-language pages are listed here. Links open in a new tab. This page was written as of October 2026. The papers behind the numbers are listed after the run, because they give the answers to the
            predictions.
          </p>
          <ul style={{ margin: '0.25rem 0 0.75rem', paddingLeft: '1.25rem' }}>
            <li>
              <ExternalLink href="https://science.gsfc.nasa.gov/attic/cosmicopia.gsfc.nasa.gov/qa_sp_sl.html">NASA Cosmicopia: Are wormholes in space real, or are they only science fiction?</ExternalLink>: NASA’s short answer: the mathematics of general
              relativity allows wormholes, and there is no evidence that any exists. It is a 2005 page, now kept in NASA’s archive.
            </li>
            <li>
              <ExternalLink href="https://science.nasa.gov/universe/black-holes/">NASA Science: Black Holes</ExternalLink>: a plain account of what black holes are, including that they are not shortcuts to other places.
            </li>
            <li>
              <ExternalLink href="https://spaceplace.nasa.gov/what-is-gravity/en/">NASA Space Place: What Is Gravity?</ExternalLink>: gravity described as a curve in space, Einstein’s idea.
            </li>
          </ul>
          <p style={{ marginTop: 0, marginBottom: 0, fontSize: '0.875rem' }}>
            No plain NASA or ESA page was found for negative energy, exotic matter or the Casimir effect, so this page explains them in its own words.
          </p>
        </div>

        {/* Temporary note: removed as the later steps (predictions, run, results, tutor) are built. */}
        <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: 0 }}>The predictions, the run, the results and the tutor are not built yet.</p>
      </div>
    </div>
  )
}
