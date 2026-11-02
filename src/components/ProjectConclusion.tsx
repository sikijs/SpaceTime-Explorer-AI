// The project's Conclusion page: a standalone page, like Welcome, not an experiment. It is a congratulation: a banner, a short look back at
// what the learner has picked up, some everyday moments the learner will now see differently, and a pat on the back. It has no
// statistics, no controls, no prediction and no tutor, and it assumes the learner has been through everything (the owner's direction of
// 2026-11-02). See docs/experiments/conclusion/00-conclusion-page.md. The wording is draft for the owner's line-by-line approval
// (CLAUDE.md §28.1).

// What the learner has picked up, one line per group, in the sidebar's order. Each line repeats what that group's own overview and
// summaries say it teaches.
const PICKED_UP: { topic: string; text: string }[] = [
  { topic: 'Time and motion.', text: 'Why a moving clock ticks slower, and why “at the same time” isn’t the same for everyone.' },
  { topic: 'Gravity and clocks.', text: 'Why a clock higher up ticks faster, and why the GPS satellites overhead need correcting.' },
  { topic: 'Gravitational waves.', text: 'How two black holes spiralling together make ripples in spacetime, and how we catch those ripples.' },
  { topic: 'The expanding universe.', text: 'How the universe has been stretching since the Big Bang, and why we think dark matter and dark energy are out there.' },
  { topic: 'Black holes.', text: 'What a black hole really is, and what falling into one would be like.' },
  { topic: 'Spacetime.', text: 'What every observer agrees on, what depends on who’s looking, and the difference between what is measured and what is only seen.' },
  { topic: 'Tested and imagined.', text: 'Which big ideas have really been tested, and which are still only imagined, like wormholes and travel to the past.' },
  { topic: 'Today’s science.', text: 'How to read the latest science news: where scientists disagree, what “sigma” means, and what it takes to call something a discovery.' },
]

// Highlights the learner may remember, one line each, each repeating an experiment's own approved summary: the twin paradox (Relativity of
// Time and Motion 10), falling into a black hole (Black Holes 5 and 6), the chirp (Gravitational Waves 2), a comet from another star
// (Cosmic Horizons 23) and Andromeda's approach (Cosmic Horizons 24).
const MOMENTS: { title: string; text: string }[] = [
  { title: 'The twin who came home younger.', text: 'One twin zooms off and comes back. The twin who stayed home is older. Yes, really.' },
  { title: 'Falling into a black hole.', text: 'On your own watch, you’d get there. But to anyone watching from far away, you’d never quite arrive.' },
  {
    title: 'A chirp across the universe.',
    text: 'Two black holes circle each other faster and faster, and the signal climbs in pitch and loudness, like a chirp, until they become one.',
  },
  { title: 'A visitor from another star.', text: 'A comet from outside our solar system dropped in, swung past the Sun and headed off again.' },
  { title: 'Andromeda is on its way.', text: 'The big galaxy next door is heading towards us. No rush, though: it takes billions of years.' },
]

// Everyday moments the learner will now see differently. Each repeats what an experiment showed: the night sky (Spacetime Geometry 4, what
// you see is the past), a photographed black hole (Cosmic Horizons 20, the Event Horizon Telescope), gravitational waves (the Gravitational
// Waves group), time travel (Evidence and Imagination 2) and the expansion-rate headline (Cosmic Horizons 1, the Hubble tension).
const NEXT_TIME: { moment: string; knowing: string }[] = [
  { moment: 'look up at the night sky', knowing: 'you’ll know you’re seeing the past, because the light has been travelling all that time.' },
  { moment: 'hear that a black hole has been photographed', knowing: 'you’ll know what that glowing ring is: glowing gas around a dark shadow.' },
  { moment: 'hear about gravitational waves', knowing: 'you’ll know what’s rippling (spacetime itself) and how scientists catch it.' },
  {
    moment: 'watch a film about time travel',
    knowing: 'you’ll know which way is real (forwards, which real clocks have done) and which is still an open question (backwards).',
  },
  {
    moment: 'see a headline about scientists disagreeing over how fast the universe is expanding',
    knowing: 'you’ll know what’s being argued, and what to ask next.',
  },
]

// A simple medal, decorative only.
function Medal() {
  return (
    <svg viewBox="0 0 64 64" width="72" height="72" aria-hidden="true" style={{ flex: '0 0 auto' }}>
      <path d="M20 4 L32 26 L44 4 Z" fill="#facc15" stroke="#ffffff" strokeWidth="2" strokeLinejoin="round" />
      <circle cx="32" cy="40" r="19" fill="#facc15" stroke="#ffffff" strokeWidth="3" />
      <path d="M32 28 L35.5 36 L44 37 L37.5 42.8 L39.5 51 L32 46.7 L24.5 51 L26.5 42.8 L20 37 L28.5 36 Z" fill="#b45309" />
    </svg>
  )
}

export function ProjectConclusion() {
  return (
    <div className="exp-card" style={{ marginTop: '1rem', padding: 0, overflow: 'hidden', fontSize: '1rem', lineHeight: 1.65 }}>
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '1.25rem',
          flexWrap: 'wrap',
          padding: '1.75rem',
          background: 'linear-gradient(120deg, #1e3a8a 0%, #0e7490 100%)',
          color: '#ffffff',
        }}
      >
        <Medal />
        <div style={{ flex: '1 1 10rem', minWidth: 0 }}>
          <h2 style={{ margin: 0, color: '#ffffff', fontSize: 'clamp(1.5rem, 5vw, 2rem)', overflowWrap: 'anywhere' }}>Congratulations!</h2>
          <p style={{ margin: '0.25rem 0 0', fontSize: '1.125rem', color: '#e0f2fe' }}>You made it all the way through Frontier and Beyond.</p>
        </div>
      </div>

      <div style={{ padding: '1.5rem 1.75rem' }}>
        <p style={{ marginTop: 0 }}>
          Take a moment to let that sink in. You started with a single clock. Now you’ve been to black holes, to ripples in spacetime and to the edge of the
          observable universe.
        </p>
        <p>
          Along the way you made a prediction, watched what happened and worked out why, again and again. That’s exactly how scientists do it, and you did it
          yourself, one experiment at a time.
        </p>

        <h3>Moments you might remember</h3>
        <p style={{ marginBottom: '0.25rem' }}>The greatest hits.</p>
        <ul>
          {MOMENTS.map(({ title, text }) => (
            <li key={title}>
              <strong>{title}</strong> {text}
            </li>
          ))}
        </ul>

        <h3>Here’s some of what you’ve picked up</h3>
        <ul>
          {PICKED_UP.map(({ topic, text }) => (
            <li key={topic}>
              <strong>{topic}</strong> {text}
            </li>
          ))}
        </ul>

        <h3>So, how well equipped are you?</h3>
        <p>
          Very. You can follow a story about a new gravitational-wave detection, or an argument over how fast the universe is expanding, and know what’s going
          on and what questions to ask. You’re not just someone who has read about relativity any more. You’re someone who has run the experiments.
        </p>

        <h3>Next time you…</h3>
        <ul>
          {NEXT_TIME.map(({ moment, knowing }) => (
            <li key={moment}>
              <strong>{moment},</strong> {knowing}
            </li>
          ))}
        </ul>

        <p>
          And remember the Welcome page, where we said that claims like “GPS satellites need constant correction” can sound like science fiction? Now you know
          why they’re true.
        </p>

        <p>
          <strong>The universe is still full of surprises, and now you’re in on them.</strong>
        </p>

        <p style={{ marginBottom: 0, fontSize: '1.125rem' }}>
          <strong>Well done. Seriously. Give yourself a pat on the back. You’ve earned it.</strong>
        </p>
      </div>
    </div>
  )
}
