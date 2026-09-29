import { useEffect, useState } from 'react'
import {
  runCurvedSpacetimeExperiment,
  separationAt,
} from '../physics/curvedSpacetimeExperiment'
import type { CurvedSpacetimeExperimentResult, CurvedSpacetimeScene } from '../physics/curvedSpacetimeExperiment'
import { CurvedSpacetimeTutor } from './CurvedSpacetimeTutor'

type StrengthPreset = 0.2 | 0.5 | 0.8 | 'other'
type ExperimentStatus = 'idle' | 'running' | 'complete'
export type PredictionChoice = 'converge' | 'same' | 'apart'

const INITIAL_SEPARATION_METERS = 1
const SCENE_WIDTH_PX = 260
const SCENE_HEIGHT_PX = 140
const DOT_SIZE_PX = 14
const VERTICAL_PX_PER_METER = 50
const ANIMATION_DURATION_MS = 2000

interface CurvedSpacetimeExperimentProps {
  onComplete?: () => void
  onTutorComplete?: () => void
}

export const predictionChoices: Array<{ value: PredictionChoice; label: string }> = [
  { value: 'converge', label: "They'll drift closer together" },
  { value: 'same', label: "They'll stay the same distance apart" },
  { value: 'apart', label: "They'll drift farther apart" },
]

// Both scenes call the same separationAt formula (see curvedSpacetimeExperiment.ts): flat
// separation never changes, sphere separation always shrinks for any valid curvatureStrength.
export function actualOutcomeFor(scene: CurvedSpacetimeScene): PredictionChoice {
  return scene === 'sphere' ? 'converge' : 'same'
}

export function labelFor(choice: PredictionChoice): string {
  return predictionChoices.find((c) => c.value === choice)!.label.toLowerCase()
}

function PredictionQuestion({
  label,
  prompt,
  selected,
  submitted,
  onSelect,
  disabled,
}: {
  label: string
  prompt: string
  selected: PredictionChoice | null
  submitted: PredictionChoice | null
  onSelect: (choice: PredictionChoice) => void
  disabled: boolean
}) {
  return (
    <div style={{ marginBottom: '1.5rem' }}>
      <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold' }}>{label}</label>
      <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)', marginBottom: '0.75rem' }}>{prompt}</p>
      <div style={{ marginBottom: '0.5rem' }}>
        {predictionChoices.map((choice) => (
          <button
            key={choice.value}
            onClick={() => onSelect(choice.value)}
            disabled={disabled}
            className={`toggle-button${selected === choice.value ? ' is-selected' : ''}`}
            style={{
              marginRight: '0.5rem',
              marginBottom: '0.5rem',
              padding: '0.5rem 1rem',
              cursor: disabled ? 'not-allowed' : 'pointer',
              fontSize: '0.875rem',
              opacity: disabled ? 0.6 : 1,
            }}
          >
            {choice.label}
          </button>
        ))}
      </div>
      <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
        {selected
          ? `Your prediction: ${labelFor(selected)}`
          : submitted
            ? `Your prediction: ${labelFor(submitted)}`
            : 'Choose an option to continue'}
      </p>
    </div>
  )
}

const SCENE_PATH_SAMPLE_COUNT = 30

// Both scenes call the same separationAt formula (see curvedSpacetimeExperiment.ts): flat
// separation never changes, sphere separation shrinks with distance traveled. The guide
// curves trace each traveler's full path (straight and parallel on the flat surface; bending
// together toward a single point — the "pole" — on the curved surface), so the curved
// surface reads as visually different from the flat one, not just numerically different, per
// the specification's "viewed from an angle that shows its curvature" requirement.
function Scene({
  label,
  result,
  scene,
  distanceMeters,
}: {
  label: string
  result: CurvedSpacetimeExperimentResult
  scene: CurvedSpacetimeScene
  distanceMeters: number
}) {
  const separation = separationAt(result, distanceMeters, scene)
  const centerY = SCENE_HEIGHT_PX / 2
  const plotWidth = SCENE_WIDTH_PX - DOT_SIZE_PX
  const xFor = (d: number) => (d / result.maxDistanceMeters) * plotWidth + DOT_SIZE_PX / 2
  const yFor = (s: number, side: -1 | 1) => centerY + (side * s * VERTICAL_PX_PER_METER) / 2
  const xPx = xFor(distanceMeters)

  const guidePathFor = (side: -1 | 1) =>
    Array.from({ length: SCENE_PATH_SAMPLE_COUNT + 1 }, (_, i) => {
      const d = (i / SCENE_PATH_SAMPLE_COUNT) * result.maxDistanceMeters
      return { x: xFor(d), y: yFor(separationAt(result, d, scene), side) }
    })
      .map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x.toFixed(1)} ${p.y.toFixed(1)}`)
      .join(' ')

  return (
    <div style={{ flex: '1 1 260px', textAlign: 'center' }}>
      <p style={{ fontWeight: 'bold', marginBottom: '0.5rem' }}>{label}</p>
      <div
        className="exp-card"
        style={{
          position: 'relative',
          height: `${SCENE_HEIGHT_PX}px`,
          width: `${SCENE_WIDTH_PX}px`,
          margin: '0 auto',
          overflow: 'hidden',
        }}
      >
        <svg
          viewBox={`0 0 ${SCENE_WIDTH_PX} ${SCENE_HEIGHT_PX}`}
          role="img"
          aria-label={
            scene === 'flat'
              ? "The two travelers' paths stay straight and parallel on the flat surface."
              : "The two travelers' paths curve toward each other on the curved surface, meeting at a single point (the \"pole\") by the end of the run."
          }
          style={{ position: 'absolute', inset: 0, width: '100%', height: '100%' }}
        >
          {scene === 'sphere' && (
            <ellipse
              cx={SCENE_WIDTH_PX / 2}
              cy={centerY}
              rx={SCENE_WIDTH_PX / 2 - 2}
              ry={SCENE_HEIGHT_PX / 2 - 6}
              fill="none"
              stroke="#ccc"
              strokeWidth={1}
            />
          )}
          <path d={guidePathFor(-1)} fill="none" stroke="#bbb" strokeWidth={1} strokeDasharray="4 3" />
          <path d={guidePathFor(1)} fill="none" stroke="#bbb" strokeWidth={1} strokeDasharray="4 3" />
          {scene === 'sphere' && (
            <text x={SCENE_WIDTH_PX - 4} y={centerY - 6} fontSize="9" fill="#888" textAnchor="end">
              the pole
            </text>
          )}
        </svg>
        {([-1, 1] as const).map((side) => (
          <div
            key={side}
            style={{
              position: 'absolute',
              left: `${xPx}px`,
              top: `${yFor(separation, side)}px`,
              transform: 'translate(-50%, -50%)',
              width: `${DOT_SIZE_PX}px`,
              height: `${DOT_SIZE_PX}px`,
              borderRadius: '50%',
              background: 'var(--gradient-primary)',
            }}
          />
        ))}
      </div>
      <p style={{ fontSize: '0.8rem', marginTop: '0.5rem' }}>
        Separation: <strong>{separation.toFixed(3)} m</strong>
      </p>
    </div>
  )
}

const GRAPH_WIDTH = 340
const GRAPH_HEIGHT = 190
const GRAPH_MARGIN = { top: 12, right: 16, bottom: 28, left: 40 }
const GRAPH_SAMPLE_COUNT = 24

// The flat surface's line stays flat while the curved surface's bends downward — both come
// from the same separationAt call, so the gap between the two lines is the point being shown.
function SeparationVsDistanceGraph({
  result,
  revealUpToMeters,
}: {
  result: CurvedSpacetimeExperimentResult
  revealUpToMeters: number
}) {
  const plotWidth = GRAPH_WIDTH - GRAPH_MARGIN.left - GRAPH_MARGIN.right
  const plotHeight = GRAPH_HEIGHT - GRAPH_MARGIN.top - GRAPH_MARGIN.bottom

  const revealedMeters = Math.min(Math.max(revealUpToMeters, 0), result.maxDistanceMeters)
  const revealedSampleCount = Math.max(1, Math.round(GRAPH_SAMPLE_COUNT * (revealedMeters / result.maxDistanceMeters)))

  const xFor = (d: number) => GRAPH_MARGIN.left + (d / result.maxDistanceMeters) * plotWidth
  const yFor = (separation: number) =>
    GRAPH_MARGIN.top + (1 - separation / result.initialSeparationMeters) * plotHeight

  const pathFor = (scene: CurvedSpacetimeScene) =>
    Array.from({ length: revealedSampleCount + 1 }, (_, i) => {
      const d = (i / revealedSampleCount) * revealedMeters
      return { d, separation: separationAt(result, d, scene) }
    })
      .map((p, i) => `${i === 0 ? 'M' : 'L'} ${xFor(p.d).toFixed(1)} ${yFor(p.separation).toFixed(1)}`)
      .join(' ')

  return (
    <div style={{ marginTop: '1.5rem' }}>
      <p style={{ fontWeight: 'bold', marginBottom: '0.5rem', textAlign: 'center' }}>
        Traveler separation over distance traveled
      </p>
      <svg
        viewBox={`0 0 ${GRAPH_WIDTH} ${GRAPH_HEIGHT}`}
        role="img"
        aria-label="Graph of traveler separation over distance traveled for the flat surface and the curved surface. The flat surface's line stays flat; the curved surface's line bends downward toward zero."
        style={{ width: '100%', maxWidth: `${GRAPH_WIDTH}px`, display: 'block', margin: '0 auto' }}
      >
        <line
          x1={GRAPH_MARGIN.left}
          y1={GRAPH_MARGIN.top}
          x2={GRAPH_MARGIN.left}
          y2={GRAPH_HEIGHT - GRAPH_MARGIN.bottom}
          stroke="#ccc"
          strokeWidth={1}
        />
        <line
          x1={GRAPH_MARGIN.left}
          y1={GRAPH_HEIGHT - GRAPH_MARGIN.bottom}
          x2={GRAPH_WIDTH - GRAPH_MARGIN.right}
          y2={GRAPH_HEIGHT - GRAPH_MARGIN.bottom}
          stroke="#ccc"
          strokeWidth={1}
        />
        <path d={pathFor('flat')} fill="none" stroke="#f59e0b" strokeWidth={2} strokeDasharray="6 4" strokeLinecap="round" />
        <path d={pathFor('sphere')} fill="none" stroke="#4f46e5" strokeWidth={3} strokeLinecap="round" />
        <text x={GRAPH_MARGIN.left} y={GRAPH_HEIGHT - 10} fontSize="10" fill="#888">
          0 m
        </text>
        <text x={GRAPH_WIDTH - GRAPH_MARGIN.right} y={GRAPH_HEIGHT - 10} fontSize="10" fill="#888" textAnchor="end">
          {result.maxDistanceMeters.toFixed(1)} m traveled
        </text>
        <text x={2} y={GRAPH_MARGIN.top + 8} fontSize="10" fill="#888">
          {result.initialSeparationMeters.toFixed(1)} m
        </text>
        <text x={2} y={GRAPH_HEIGHT - GRAPH_MARGIN.bottom} fontSize="10" fill="#888">
          0 m
        </text>
      </svg>
      <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textAlign: 'center', marginTop: '0.5rem' }}>
        Curved surface (solid) and flat surface (dashed) — only the curved surface's separation shrinks.
      </p>
    </div>
  )
}

export function CurvedSpacetimeExperiment({ onComplete, onTutorComplete }: CurvedSpacetimeExperimentProps) {
  const [strengthPreset, setStrengthPreset] = useState<StrengthPreset>(0.5)
  const [customStrength, setCustomStrength] = useState('')
  const [status, setStatus] = useState<ExperimentStatus>('idle')
  const [result, setResult] = useState<CurvedSpacetimeExperimentResult | null>(null)
  const [distanceMeters, setDistanceMeters] = useState(0)
  const [flatPrediction, setFlatPrediction] = useState<PredictionChoice | null>(null)
  const [spherePrediction, setSpherePrediction] = useState<PredictionChoice | null>(null)
  const [submittedFlatPrediction, setSubmittedFlatPrediction] = useState<PredictionChoice | null>(null)
  const [submittedSpherePrediction, setSubmittedSpherePrediction] = useState<PredictionChoice | null>(null)

  const selectedStrength = strengthPreset === 'other' ? parseFloat(customStrength) || 0 : strengthPreset
  const isRunning = status === 'running'
  const isComplete = status === 'complete'
  const isValidStrength = selectedStrength > 0 && selectedStrength < 1
  const hasBothPredictions = flatPrediction !== null && spherePrediction !== null
  const canRun = isValidStrength && hasBothPredictions

  const handleRun = () => {
    if (!canRun) return
    const experimentResult = runCurvedSpacetimeExperiment(INITIAL_SEPARATION_METERS, selectedStrength)
    setSubmittedFlatPrediction(flatPrediction)
    setSubmittedSpherePrediction(spherePrediction)
    setFlatPrediction(null)
    setSpherePrediction(null)
    setResult(experimentResult)
    setDistanceMeters(0)
    setStatus('running')
  }

  const handleRunAgain = () => {
    setStatus('idle')
    setResult(null)
    setDistanceMeters(0)
    setSubmittedFlatPrediction(null)
    setSubmittedSpherePrediction(null)
  }

  useEffect(() => {
    if (status !== 'running' || !result) return

    const startTime = performance.now()
    let frameId: number

    const animate = (currentTime: number) => {
      const progress = Math.min(Math.max((currentTime - startTime) / ANIMATION_DURATION_MS, 0), 1)
      setDistanceMeters(progress * result.maxDistanceMeters)

      if (progress >= 1) {
        setStatus('complete')
        onComplete?.()
        return
      }

      frameId = requestAnimationFrame(animate)
    }

    frameId = requestAnimationFrame(animate)

    return () => cancelAnimationFrame(frameId)
  }, [status, result])

  const previewResult = result ?? runCurvedSpacetimeExperiment(INITIAL_SEPARATION_METERS, 0.5)
  const shownDistance = result ? Math.min(distanceMeters, result.maxDistanceMeters) : 0

  return (
    <div style={{ padding: '2rem', maxWidth: '900px', margin: '0 auto' }}>
      <h2>Experiment 4 — Curved Spacetime</h2>

      <div className="exp-card" style={{ marginTop: '2rem', padding: '1.5rem' }}>
        <div style={{ marginBottom: '2rem', fontSize: '0.875rem', color: 'var(--text-muted)' }}>
          <p style={{ marginTop: 0, marginBottom: '0.75rem' }}>
            <strong>The question.</strong> Experiment 3 showed that two falling balls drift together
            on a real planet, but never in an accelerating rocket. What does that convergence actually
            mean?
          </p>
          <p style={{ marginTop: 0, marginBottom: '0.75rem' }}>
            <strong>Why even ask this.</strong> Experiment 3 found a real difference between a
            planet's gravity and a rocket's push, but only showed <em>that</em> they behave
            differently, not <em>why</em>. This experiment steps back from gravity and falling
            balls entirely, to ask a purely geometric question first: on a surface that isn't flat,
            does "walking as straight as you possibly can" even mean the same thing it does on a
            flat floor?
          </p>
          <p style={{ marginTop: 0, marginBottom: '0.75rem' }}>
            <strong>What happens.</strong> Picture two travelers standing side by side, a fixed
            small distance apart, both facing the same direction. Each one walks straight ahead —
            never turning, always at the same walking speed — and we watch how far apart they end
            up. We run this twice: once on a flat surface, and once on a curved surface (a sphere,
            like the Earth).
          </p>
          <p style={{ marginTop: 0, marginBottom: '0.75rem' }}>
            <strong>Your job.</strong> Watch both surfaces and compare whether the distance apart
            between the two travelers changes on each one.
          </p>
          <p style={{ marginTop: 0, marginBottom: '0.25rem' }}>
            <strong>What we assume.</strong>
          </p>
          <ul style={{ marginTop: 0, marginBottom: 0, paddingLeft: '1.25rem' }}>
            <li>
              Both travelers walk "as straight as possible" for their surface — a path called a{' '}
              <strong>geodesic</strong>.
            </li>
            <li>
              "Curvature strength" is an exaggerated stand-in for how sharply curved the sphere is, so
              the effect is easy to watch instead of needing a huge sphere.
            </li>
            <li>
              The sphere is an analogy for curved spacetime, not a literal picture of it — real
              spacetime curvature involves time as well as space, which this experiment doesn't model.
            </li>
            <li>
              This experiment doesn't use anything about light, moving clocks, or speeds close to
              light from earlier chapters — it's ordinary surface geometry.
            </li>
          </ul>
        </div>

        <div style={{ marginBottom: '2rem' }}>
          <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold' }}>
            Curvature strength
          </label>
          <div style={{ marginBottom: '1rem' }}>
            {[0.2, 0.5, 0.8].map((strength) => (
              <button
                key={strength}
                onClick={() => setStrengthPreset(strength as StrengthPreset)}
                disabled={isRunning}
                className={`toggle-button${strengthPreset === strength ? ' is-selected' : ''}`}
                style={{
                  marginRight: '0.5rem',
                  padding: '0.5rem 1rem',
                  cursor: isRunning ? 'not-allowed' : 'pointer',
                  fontSize: '0.875rem',
                  opacity: isRunning ? 0.6 : 1,
                }}
              >
                {strength}
              </button>
            ))}
            <button
              onClick={() => setStrengthPreset('other')}
              disabled={isRunning}
              className={`toggle-button${strengthPreset === 'other' ? ' is-selected' : ''}`}
              style={{
                padding: '0.5rem 1rem',
                cursor: isRunning ? 'not-allowed' : 'pointer',
                fontSize: '0.875rem',
                opacity: isRunning ? 0.6 : 1,
              }}
            >
              Other
            </button>
          </div>
          {strengthPreset === 'other' && (
            <input
              type="number"
              min="0.01"
              max="0.99"
              step="0.01"
              value={customStrength}
              onChange={(e) => setCustomStrength(e.target.value)}
              disabled={isRunning}
              placeholder="Enter strength (0.01-0.99)"
              className="field-input"
              style={{ padding: '0.5rem', fontSize: '0.875rem', width: '220px' }}
            />
          )}
        </div>

        <div style={{ marginBottom: '2rem' }}>
          <p style={{ fontWeight: 'bold', marginBottom: '0.25rem' }}>Make a prediction</p>
          <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)', marginBottom: '1rem' }}>
            Two travelers start the same fixed distance apart and both walk dead straight ahead. Do
            you think they'll drift closer together, drift farther apart, or stay exactly the same
            distance apart, on each surface?
          </p>
          <PredictionQuestion
            label="Flat surface"
            prompt="What will the two travelers do on the flat surface?"
            selected={flatPrediction}
            submitted={submittedFlatPrediction}
            onSelect={setFlatPrediction}
            disabled={isRunning}
          />
          <PredictionQuestion
            label="Curved surface (sphere)"
            prompt="What will the two travelers do on the curved surface?"
            selected={spherePrediction}
            submitted={submittedSpherePrediction}
            onSelect={setSpherePrediction}
            disabled={isRunning}
          />
        </div>

        <div
          style={{
            display: 'flex',
            gap: '2rem',
            justifyContent: 'center',
            flexWrap: 'wrap',
            marginBottom: '2rem',
          }}
        >
          <Scene label="Flat surface" result={previewResult} scene="flat" distanceMeters={shownDistance} />
          <Scene label="Curved surface (sphere)" result={previewResult} scene="sphere" distanceMeters={shownDistance} />
        </div>

        {result && (
          <div style={{ marginBottom: '2rem' }}>
            <SeparationVsDistanceGraph
              result={result}
              revealUpToMeters={isComplete ? result.maxDistanceMeters : distanceMeters}
            />
          </div>
        )}

        <button
          onClick={isComplete ? handleRunAgain : handleRun}
          disabled={isRunning || (!isComplete && !canRun)}
          className="action-button"
          style={{ padding: '0.75rem 2rem', fontSize: '1rem' }}
        >
          {isRunning ? 'Walking...' : isComplete ? 'Walk Again' : 'Send them walking'}
        </button>

        {isComplete && result && submittedFlatPrediction && submittedSpherePrediction && (
          <div className="exp-card" style={{ marginTop: '2rem', padding: '1.5rem' }}>
            <h2 className="app-title" style={{ marginTop: 0, marginBottom: '1rem', fontSize: '1.25rem' }}>
              Results
            </h2>

            <div style={{ marginBottom: '1rem' }}>
              <p style={{ margin: '0.5rem 0', fontSize: '0.875rem' }}>
                <strong>Curvature strength:</strong> {result.curvatureStrength}
              </p>
              <p style={{ margin: '0.5rem 0', fontSize: '0.875rem' }}>
                <strong>Final separation, flat surface:</strong>{' '}
                {separationAt(result, result.maxDistanceMeters, 'flat').toFixed(3)} m — unchanged.
              </p>
              <p style={{ margin: '0.5rem 0', fontSize: '0.875rem' }}>
                <strong>Final separation, curved surface:</strong>{' '}
                {separationAt(result, result.maxDistanceMeters, 'sphere').toFixed(3)} m (started at{' '}
                {result.initialSeparationMeters.toFixed(3)} m).
              </p>
            </div>

            <div style={{ marginBottom: '0', paddingTop: '1rem', borderTop: '1px solid var(--border)' }}>
              <p style={{ margin: '0.5rem 0', fontSize: '0.875rem' }}>
                <strong>You predicted, flat surface:</strong> {labelFor(submittedFlatPrediction)}.
              </p>
              <p style={{ margin: '0.5rem 0', fontSize: '0.875rem' }}>
                <strong>What actually happened:</strong> {labelFor(actualOutcomeFor('flat'))}.
              </p>
              <p style={{ margin: '0.5rem 0', fontSize: '0.875rem' }}>
                <strong>You predicted, curved surface:</strong> {labelFor(submittedSpherePrediction)}.
              </p>
              <p style={{ margin: '0.5rem 0', fontSize: '0.875rem' }}>
                <strong>What actually happened:</strong> {labelFor(actualOutcomeFor('sphere'))}.
              </p>
            </div>
          </div>
        )}

        {isComplete && result && submittedFlatPrediction && submittedSpherePrediction && (
          <CurvedSpacetimeTutor
            flatPrediction={submittedFlatPrediction}
            spherePrediction={submittedSpherePrediction}
            result={result}
            onExplained={onTutorComplete}
          />
        )}
      </div>
    </div>
  )
}
