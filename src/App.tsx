import { Experiment1 } from './components/Experiment1'
import { Experiment2 } from './components/Experiment2'

export function App() {
  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#fafafa' }}>
      <div style={{ padding: '2rem', maxWidth: '1400px', margin: '0 auto' }}>
        <h1 style={{ textAlign: 'center', marginBottom: '2rem' }}>
          Time Measurement in a Reference Frame
        </h1>
        <p style={{ textAlign: 'center', color: '#666', marginBottom: '3rem', maxWidth: '800px', margin: '0 auto 3rem' }}>
          Compare how a single clock and two clocks measure elapsed time. Run each experiment independently to explore time measurement.
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
      </div>
    </div>
  )
}
