interface GravitationalWaveExperimentProps {
  onComplete?: () => void
  onTutorComplete?: () => void
}

const VIEW_SIZE = 320
const CORNER = { x: 60, y: 260 }
const REST_ARM_PIXELS = 180

export function GravitationalWaveExperiment(_props: GravitationalWaveExperimentProps) {
  return (
    <div style={{ padding: '2rem', maxWidth: '900px', margin: '0 auto' }}>
      <h2>Gravitational Waves, Experiment 1 — Ripples in Spacetime</h2>

      <div className="exp-card" style={{ marginTop: '2rem', padding: '1.5rem' }}>
        <div style={{ marginBottom: '2rem', fontSize: '0.875rem', color: 'var(--text-muted)' }}>
          <p style={{ marginTop: 0, marginBottom: '0.75rem' }}>
            <strong>The question.</strong> Experiment 4 showed that curved space can make two
            straight-as-possible paths drift together. But can spacetime's curvature itself move —
            can it travel somewhere, like a ripple on a pond? And if it did, could we ever actually
            detect it?
          </p>
          <p style={{ marginTop: 0, marginBottom: '0.75rem' }}>
            <strong>What happens.</strong> You'll watch two perpendicular "arms" of free-floating
            points, set up the same way a real gravitational-wave detector is built. When a wave
            passes through, you'll see one arm stretch while the other squeezes, over and over,
            before both settle back to normal.
          </p>
          <p style={{ marginTop: 0, marginBottom: '0.75rem' }}>
            <strong>Your job.</strong> Try different wave strengths and speeds — including a
            strength modeled on a real detected event — and watch what the two arms do, together
            and compared to each other.
          </p>
          <p style={{ marginTop: 0, marginBottom: '0.25rem' }}>
            <strong>What we assume.</strong>
          </p>
          <ul style={{ marginTop: 0, marginBottom: 0, paddingLeft: '1.25rem' }}>
            <li>
              The effect here is hugely exaggerated — a real gravitational wave changes a real
              detector's arms by about one-thousandth the width of a single proton, far too small
              to show at any visible scale.
            </li>
            <li>
              The wave here arrives at one constant strength and speed for simplicity; real events
              (like two black holes spiraling together) actually build up in both strength and
              speed right until the moment of collision.
            </li>
          </ul>
        </div>

        <label htmlFor="wave-amplitude" style={{ display: 'block', marginBottom: '0.5rem' }}>
          Wave amplitude
        </label>
        <input id="wave-amplitude" type="range" min={0.05} max={0.4} step={0.01} defaultValue={0.2} style={{ width: '100%' }} />

        <label
          htmlFor="wave-frequency"
          style={{ display: 'block', marginTop: '1rem', marginBottom: '0.5rem' }}
        >
          Wave frequency
        </label>
        <input id="wave-frequency" type="range" min={0.25} max={2} step={0.05} defaultValue={1} style={{ width: '100%' }} />

        <div style={{ marginTop: '1rem' }}>
          <button type="button" className="toggle-button" style={{ marginRight: '0.5rem' }}>
            Distant / weak source
          </button>
          <button type="button" className="toggle-button" style={{ marginRight: '0.5rem' }}>
            Typical detected event
          </button>
          <button type="button" className="toggle-button">
            Strong / nearby source
          </button>
        </div>

        <button
          type="button"
          className="action-button"
          disabled
          style={{ marginTop: '1rem', padding: '0.6rem 1.5rem' }}
        >
          Run
        </button>

        <svg
          width={VIEW_SIZE}
          height={VIEW_SIZE}
          viewBox={`0 0 ${VIEW_SIZE} ${VIEW_SIZE}`}
          style={{ marginTop: '1.5rem', border: '1px solid var(--border-color, #ccc)', overflow: 'hidden' }}
        >
          <line
            x1={CORNER.x}
            y1={CORNER.y}
            x2={CORNER.x + REST_ARM_PIXELS}
            y2={CORNER.y}
            stroke="currentColor"
            strokeWidth={1.5}
          />
          <line
            x1={CORNER.x}
            y1={CORNER.y}
            x2={CORNER.x}
            y2={CORNER.y - REST_ARM_PIXELS}
            stroke="currentColor"
            strokeWidth={1.5}
          />
          <circle cx={CORNER.x} cy={CORNER.y} r={4} fill="currentColor" />
          <circle cx={CORNER.x + REST_ARM_PIXELS} cy={CORNER.y} r={4} fill="currentColor" />
          <circle cx={CORNER.x} cy={CORNER.y - REST_ARM_PIXELS} r={4} fill="currentColor" />
        </svg>
      </div>
    </div>
  )
}
