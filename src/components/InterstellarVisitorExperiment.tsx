import type { ReactNode } from 'react'
import { ReferencePanel } from './EnergyMomentumExperiment'
import { AU, escapeSpeed } from '../physics/interstellarVisitor'
import { EARTH } from '../physics/fastestSpacecraft'

// Frontier and Beyond, Experiment 24 (docs/experiments/frontier-and-beyond/24-a-visitor-from-another-star.md).
// STEP 2 (the interface skeleton and the introduction): this file has the title, the status line, the introduction, the collapsed "Words and formulas" panel and the "Want to know more?" links.
// It has no predictions, run, pictures, controls, results, tutor or summary yet; those are later steps (CLAUDE.md §6). All wording is a DRAFT for the owner's line-by-line approval
// (CLAUDE.md §28.1), written to the standard of §29. Nothing here says how much the Sun bends the path of 3I/ATLAS, how fast it was going at its closest approach, or any other number that
// the two predictions ask for (CLAUDE.md §12). The pages that give those numbers away (NASA's and ESA's pages on 3I/ATLAS both give its speed at closest approach) are listed only after the
// run, in a later step. The introduction has no computed number in it, so it needs nothing from the physics module (CLAUDE.md §9).

function ExternalLink({ href, children }: { href: string; children: ReactNode }) {
  return (
    <a href={href} target="_blank" rel="noopener noreferrer">
      {children}
    </a>
  )
}

const paragraph = { marginTop: 0, marginBottom: '0.5rem' } as const

// The "Words and formulas" panel. Terms only, with no formula and no number that a prediction asks for (CLAUDE.md §12): the formulas are shown in Part 3, after the run.
function referenceEntries(): { term: string; meaning: string }[] {
  return [
    {
      term: 'Interstellar object',
      meaning:
        'something that comes from outside our solar system, from the space between the stars, passes through it, and leaves again. “Interstellar” means “between the stars”. Only three have ever been seen: 1I/ʻOumuamua in 2017, 2I/Borisov in 2019 and 3I/ATLAS in 2025. In the name, the number says which one it is, the “I” says interstellar, and the rest is its name.',
    },
    {
      term: 'Comet',
      meaning:
        'a ball of ice, rock and dust, a few hundred metres to several kilometres across, that gives off gas and dust as it is warmed by the Sun. The gas and dust form a glowing cloud round it and long tails, which can be much bigger than the ball itself.',
    },
    {
      term: 'Orbit',
      meaning: 'the path of one object moving under the pull of another, such as a planet round the Sun. In this experiment the Sun’s gravity is the only pull we use.',
    },
    {
      term: 'Closed path (ellipse)',
      meaning: 'an orbit that loops back on itself, like an oval. An object on a closed path goes round and round the Sun for ever, such as the Earth or a comet that returns every few years.',
    },
    {
      term: 'Open path (hyperbola)',
      meaning:
        'an orbit that does not loop back. The object comes in from far away, swings past the Sun, and goes off again, never to return. Its path is a curve that is bent near the Sun and nearly straight far away on both sides.',
    },
    {
      term: 'Escape speed',
      meaning:
        'the speed above which an object will never be pulled back by the gravity of the body it is leaving (a planet, or the Sun), however long it travels. A ball thrown gently upwards from the ground comes back down, because the Earth’s pull slows it to a stop and then pulls it back. Thrown hard enough, it would never come back: for the Earth, that speed is about 11 kilometres a second (Smithsonian). The escape speed is bigger nearer to the Sun, where the pull is stronger and there is more of it to climb out of.',
    },
    {
      term: 'Closest approach (perihelion)',
      meaning: 'the point on the path where the object is nearest to the Sun. “Peri” means “near” and “helios” means “Sun”.',
    },
    {
      term: 'Speed far away',
      meaning: 'the speed an object has when it is so far from the Sun that the Sun’s pull on it has almost gone. It is the speed it comes in with, and, in this model, the speed it goes away with.',
    },
    {
      term: 'Eccentricity',
      meaning:
        'a number that says how open a path is. Zero is a perfect circle, a number between zero and one is an oval (a closed path), and a number above one is an open path. The higher the number above one, the straighter the path.',
    },
    {
      term: 'Bend',
      meaning: 'the angle through which the Sun’s pull turns an object’s direction of travel: the angle between the direction it was travelling in before it reached the Sun and the direction it travels in after it has gone past. A path that is not bent at all is a straight line, and its bend is 0 degrees.',
    },
    {
      term: 'Astronomical unit (AU)',
      meaning: 'the average distance from the Earth to the Sun, about 150 million kilometres. Distances in the solar system are often given in AU: Mars is about 1.5 AU from the Sun, and Jupiter about 5.',
    },
    {
      term: 'Kilometres per second (km/s)',
      meaning: 'a way of giving speed. One kilometre per second is 3,600 kilometres an hour, so a car at 100 kilometres an hour is going less than 0.03 km/s. The Earth goes round the Sun at about 30 km/s.',
    },
  ]
}

export function InterstellarVisitorExperiment() {
  // Display rounding of the module's escape speeds (no physics here, CLAUDE.md §9).
  const earthEscape = Math.round(escapeSpeed(AU) / 1e3)
  const earthSpeed = Math.round(EARTH.orbitalSpeed / 1e3)
  const jupiterEscape = Math.round(escapeSpeed(5 * AU) / 1e3)
  return (
    <div>
      <h2>Experiment 24 — A Visitor From Another Star (How Far Does the Sun Bend Its Path?)</h2>
      <div className="exp-card" style={{ marginTop: '2rem', padding: '1.5rem' }}>
        <p style={{ marginTop: 0, marginBottom: '1.5rem', fontSize: '0.875rem' }}>
          <strong>
            Where this stands (as of October 2026): settled. In July 2025 astronomers found a comet, named 3I/ATLAS, that had come from outside our solar system, from the space between the stars. Its path round the Sun is known very precisely, and this experiment uses only that path. What the object is made of, and
            how old it is, are separate questions that are still being studied, and they are not part of this experiment. The numbers, and where each comes from, are shown after you press Run, so that you can guess first.
          </strong>
        </p>

        <div style={{ marginBottom: '1.5rem' }}>
          <p style={paragraph}>
            <strong>The question.</strong> In Gravity Experiment 6 you launched a body near a heavy one and saw one of three things: it fell in, it went round and round, or it escaped. This experiment looks at a real case of the third kind. On
            July 1, 2025, an object was found that had come from another star and was passing the Sun. The question is not what it is made of. It is about its path: why the Sun could not hold on to it, what the Sun’s gravity did to its speed, and how much the Sun
            bent its path as it went by.
          </p>

          <p style={paragraph}>
            <strong>A visitor from another star.</strong> Things from outside our solar system, passing through it, are called <strong>interstellar objects</strong>. Before 2017 none had been confirmed. Since then there have been three: 1I/ʻOumuamua
            (2017), 2I/Borisov (2019) and, on July 1, 2025, <strong>3I/ATLAS</strong>, found by the ATLAS survey, a NASA-funded telescope in Chile. The name tells you three things: the “3” says it is the third, the “I” says it is interstellar, and “ATLAS” is the survey that found it.
            It is a <strong>comet</strong>: a ball of ice and rock that gives off gas and dust when the Sun warms it, which forms a glowing cloud and tails round it. It came in from the general direction of the constellation Sagittarius. At the end of October 2025
            it passed closest to the Sun, between the orbits of Earth and Mars, and then it kept going: it passed Mars in October, came no closer to Earth than about 270 million kilometres in December, and passed Jupiter in March 2026. It is now on its way
            out of the solar system for good.
          </p>

          <p style={paragraph}>
            <strong>Why some paths close and others do not.</strong> Think of throwing a ball straight up from the ground (and ignore the air, which would slow it too). Thrown gently, it rises, slows, stops and falls back: the Earth’s gravity has held on to it. Thrown fast enough, it would never come back, because
            gravity could never slow it to a stop. That speed is called the <strong>escape speed</strong>, and for the Earth it is about 11 kilometres a second. The same is true for the Sun. An object that is moving more slowly than the Sun’s escape speed
            at its distance is held, and goes round the Sun on a closed path, an oval called an <strong>ellipse</strong>, like the Earth or a comet that comes back every few years. The Earth is an example: it moves at about {earthSpeed} kilometres a second round the Sun, which is less than the {earthEscape} kilometres a second that is the escape speed at its distance, so the Sun holds it. An object that is moving faster than the escape speed is not held. It comes in,
            is pulled round the Sun, and leaves for good on an open path called a <strong>hyperbola</strong>. The escape speed is larger the closer you are to the Sun. Here is why. The Sun’s pull gets weaker with distance. An object that starts close to the Sun is deep in its pull and has a long way to climb out of it, so it needs a high speed. An object that starts far away is already out where the pull is weak, so a lower speed is enough. It is like climbing out of a deep hole: from near the bottom you need a big push to reach the top, but from halfway up a small push is enough. For example, at the Earth’s distance from the Sun the escape speed is about {earthEscape} kilometres a second, and at Jupiter’s distance, about five times farther out, it is only about {jupiterEscape}. Every interstellar object found so far, 3I/ATLAS included, has been on an open path.
          </p>

          <p style={paragraph}>
            <strong>Two numbers that describe the path.</strong> A hyperbola is described by how open it is, a number called its <strong>eccentricity</strong>. Zero is a perfect circle, a number between zero and one is an oval, and a number above one is an open
            path, and the higher it is above one, the straighter the path. The Sun’s pull also turns the object as it goes by, and the angle it is turned through is called the <strong>bend</strong>. Far from the Sun, before the object gets near, it travels in a straight line in one direction. Near the Sun, its path curves.
            Then, far on the other side, it travels in a straight line again, but in a different direction. The bend is the angle between those two directions of travel. It is like a car that drives along a street, turns a corner and drives on: if it turns
            at a crossroads from one street into another at right angles, it has been turned through 90 degrees, and if it drives straight on, it has been turned through 0 degrees. In this experiment you will see these two numbers for 3I/ATLAS, and they are worked out from only two measurements: how fast it was going when it was far from the Sun, and how close it came.
          </p>

          <p style={paragraph}>
            <strong>Your job.</strong> You will make two guesses before anything is shown: how much the Sun’s gravity bent the path of 3I/ATLAS in all, and how fast it was going at its closest approach. Then you will run the experiment, compare your guesses
            with what the calculation gives, and try other speeds and other closest approaches of your own, to see what would make the path bend more or less. After that, a tutor will talk it over with you.
          </p>

          <p style={paragraph}>
            <strong>What your guesses do.</strong> Your guesses never change the real pictures or tables. The pictures and tables come only from the calculation. Your guesses are drawn on the pictures in white, so that you can compare them with the real result,
            and they are shown again next to the results. In the “Now try it yourself” part, the settings you choose do change the drawing next to them, and only that drawing.
          </p>

          <p style={{ marginTop: 0, marginBottom: '0.75rem' }}>
            <strong>What this page does and does not model.</strong> It treats the Sun’s gravity as the only pull on the object. It does not model the planets’ pulls (small here), the push of the comet’s own gas as it boils off (astronomers have measured a tiny push of this kind), the effects of relativity (tiny at these speeds), or anything about what the object is made of or how old it is. The real path of 3I/ATLAS, as published, is the starting point.
          </p>

          <p style={{ marginTop: 0, marginBottom: '0.75rem' }}>
            <strong>Want to know more?</strong> Plainer-language pages are listed here. Links open in a new tab. This page was written as of October 2026. The papers, and the NASA and ESA pages about 3I/ATLAS itself, are listed after the run, because they give
            the numbers that the predictions ask for.
          </p>
          <ul style={{ margin: '0.25rem 0 0', paddingLeft: '1.25rem' }}>
            <li>
              <ExternalLink href="https://science.nasa.gov/solar-system/comets/">NASA: Comets</ExternalLink>: NASA’s plain account of what a comet is, why it grows a glowing head and a tail near the Sun, and the comets that have come
              from beyond our solar system.
            </li>
            <li>
              <ExternalLink href="https://howthingsfly.si.edu/ask-an-explainer/what-speed-spacecraft-has-reach-it-escapes-earths-gravitational-field-and-able-trav">
                Smithsonian National Air and Space Museum: What speed must a spacecraft reach to escape the Earth’s gravity?
              </ExternalLink>
              : a short answer from the Museum’s “How Things Fly” site, giving the Earth’s escape speed (about 11 kilometres a second) and saying that other planets, moons and stars have their own.
            </li>
          </ul>
        </div>

        <ReferencePanel entries={referenceEntries()} />
      </div>
    </div>
  )
}
