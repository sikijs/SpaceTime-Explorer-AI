import { Experiment1 } from './components/Experiment1'
import { Experiment2 } from './components/Experiment2'
import { Experiment3 } from './components/Experiment3'
import { Experiment4 } from './components/Experiment4'

export function App() {
  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#fafafa' }}>
      <div style={{ padding: '2rem', maxWidth: '1400px', margin: '0 auto' }}>
        <h1 style={{ textAlign: 'center', marginBottom: '2rem' }}>
          How Clocks Measure Time
        </h1>
        <p style={{ textAlign: 'center', color: '#666', marginBottom: '3rem', maxWidth: '800px', margin: '0 auto 3rem' }}>
          Four experiments on time: one clock, two clocks at rest, a moving clock, and a light clock that shows why a moving clock runs slow. Run each experiment independently.
        </p>

        <div
          style={{
            display: 'grid',
            gridTemplateColumns: '1fr 1fr',
            gap: '2rem',
          }}
        >
          <Experiment1 />
          <Experiment2 />
        </div>

        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'minmax(0, 1fr) minmax(0, 1fr)',
            gap: '2rem',
            marginTop: '2rem',
          }}
        >
          <Experiment3 />
          <Experiment4 />
        </div>
      </div>
    </div>
  )
}
