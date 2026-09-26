# Project Notes

Personal reference notes on concepts and conventions used in this project, kept for the owner's own future reference. Not read by Claude Code as an instruction file (see `CLAUDE.md` and `AGENTS.md` for those).

---

## What is a "physics model"?

A "physics model" in this project is a plain TypeScript file with **no React, no UI, no browser code at all** — only functions and numbers. It answers one question: *given some inputs, what does the physics actually predict?*

For example, `src/physics/tidalEffectExperiment.ts` (Experiment 3's physics model) is shaped like this, stripped down:

```typescript
export function runTidalEffectExperiment(
  accelerationMetersPerSecondSquared: number,
  initialHeightMeters: number,
  initialSeparationMeters: number,
  convergenceStrength: number
): TidalEffectExperimentResult {
  // ... validates inputs, does some arithmetic ...
  return { timeToFloorSeconds, initialSeparationMeters, convergenceStrength, ... }
}

export function ballPositionsAt(
  experiment: TidalEffectExperimentResult,
  elapsedSeconds: number,
  scene: 'planet' | 'rocket'
): { heightAboveFloor: number; leftBallOffset: number; rightBallOffset: number } {
  // ... plugs elapsedSeconds into the formulas ...
}
```

That's it. No `<div>`, no colors, no animation — just: set up the experiment once, then ask "where are the balls at time t?" as many times as you like.

### Why we separate it out

This is a deliberate rule in this project (`CLAUDE.md` §9, and `docs/PROJECT.md` §10): **Physics Model → Simulation State → User Interface**, each layer only depending on the one before it.

1. **You can test physics without a browser.** `tidalEffectExperiment.test.ts` calls `runTidalEffectExperiment` and `ballPositionsAt` directly and checks the numbers — no rendering, no clicking buttons, runs in milliseconds. If the physics model has 16 tests, we've verified the *physics* is right independent of whether any UI component is even wired up yet.

2. **The UI can't quietly get the physics wrong.** If height-over-time math lived scattered inside a React component, it would be easy for a later edit to a slider or an animation tweak to accidentally change the *actual result*, not just how it's displayed. Since the component only ever calls `ballPositionsAt(...)`, it's structurally impossible for a cosmetic UI change to alter the physics — there's nowhere in the component for a stray formula to hide.

3. **Playback speed vs. real time stay honestly separate.** `ballPositionsAt` takes `elapsedSeconds` — a *simulated* time, not a wall-clock time. The component's animation loop decides how fast to advance that simulated clock for the learner's eyes (2 real seconds, regardless of whether the physical fall takes 0.4s or 2s), but the physics model has no idea and doesn't care. This is `CLAUDE.md` §11's rule: changing how fast an animation *looks* must never change what it *computes*.

4. **Later experiments can reuse earlier ones' math without copy-pasting.** The tidal-effect model reuses Experiment 1's exact fall formula (`heightAboveFloor = y0 - 0.5·g·t²`) by literally calling the same style of function, not by re-deriving it. That's only possible because the formula lives in an isolated, importable module in the first place.

### The two-function pattern you keep seeing

Almost every physics model in this codebase has the same shape: one `run...Experiment(...)` function that takes the learner's chosen inputs and returns a small result object (things that don't change over the course of the run — like `timeToFloorSeconds`), and one `...At(...)` function that takes that result plus an elapsed time and computes the state *at that instant*, computed fresh each call rather than pre-baked into a big array of samples. That's a deliberate, repeated choice — it keeps the model a pure function of time, so the UI can ask for any instant, scrub backward, or resample at a different animation frame rate, and always get a mathematically consistent answer.

### Where it fits in the bigger picture

When the tidal-effect experiment runs in the browser: the React component reads the learner's chosen g and convergence strength, calls `runTidalEffectExperiment(...)` once, then on every animation frame calls `ballPositionsAt(...)` with the current simulated time and draws a ball at whatever pixel position that returned. The component never once decides *where the ball should be* — it only ever asks the physics model and draws the answer. That's the whole point: the physics is authoritative (per `AGENTS.md`'s "Physics Authority" section), and the UI is just a window onto it.
