# Gravitational Waves — Experiment 2: The Chirp (A Wave That Builds)

**Status: implemented (2026-09-30). Physics, physics tests, UI, prediction interaction, results panel, and tutor are built and wired into the guided journey; complete-flow tested in a browser; final review against this specification, `docs/PROJECT.md`, and `AGENTS.md` complete (see "Implementation Notes"); owner's line-by-line wording approval (§28.1) complete (2026-09-30). Not yet committed to git.**

This specification was drafted per `CLAUDE.md` §23 Stage 3, following the proposal Claude Code made in conversation on 2026-09-29, in response to the milestone set after Gravitational Waves Experiment 1's wording approval. All items under "Decisions Confirmed" below were settled with the owner in that conversation, before implementation begins.

---

## Overview

Experiment 1 modeled a gravitational wave arriving at one constant frequency and amplitude — and its own specification flagged this as a deliberate simplification: "real events (like two black holes spiraling together) actually build up in both strength and speed right until the moment of collision," calling this a "chirp," not modeled there.

This experiment models that chirp directly. It reuses Experiment 1's detector arms and its exact stretch/squeeze formula unchanged, but now drives it with a frequency and amplitude that both increase over the run, as two massive objects (reusing the Black Hole experiment's "mass" idea) spiral closer together and orbit faster right up to an idealized final moment. The wave's pitch rises, its loudness rises, and then the run stops — the same "idealized instantaneous event" treatment this project already gives the Twin Paradox's turnaround.

This is not invented behavior: the September 2015 LIGO detection (Experiment 1's own real-world grounding) was recognizable as a "chirp" for exactly this reason — its pitch and loudness both rose over about two-tenths of a second, right up to the moment the two black holes merged.

---

## Learning Objective

After this experiment, the learner should understand:

1. A real gravitational wave from an inspiraling pair doesn't arrive at one steady note — it **chirps**: rising in both pitch (frequency) and loudness (amplitude) as the two objects spiral closer together, right up to the final moment.
2. This happens because the two objects orbit faster as they get closer together (the same "closer and faster" relationship already seen in the Orbit experiment), and a faster orbit produces a faster-oscillating, stronger wave.
3. A bigger mass pair produces a louder wave and reaches its final moment sooner than a smaller mass pair — reusing the same abstracted "mass" idea as the Black Hole experiment.
4. The instant of merger itself is not modeled here — the run stops at an idealized cutoff, the same simplification already used for the Twin Paradox's turnaround, because modeling the collision itself is out of scope.
5. LIGO's real 2015 detection was recognized specifically because of this chirp shape — the observed signal's rising pitch and loudness let scientists work out how massive and how far away the source was.

---

## Physical Situation

The same L-shaped free-floating detector arms as Experiment 1. Rather than a wave of fixed frequency and amplitude, the arms now respond to a wave whose frequency and amplitude both increase over the run, modeling the final stretch of an inspiraling pair (such as two black holes) before an idealized "merger" cutoff.

### Simplifying assumptions (must be stated to the learner, in plain language)

- Everything Experiment 1 already states still applies here: the effect is hugely exaggerated, only one wave pattern ("plus polarization") is shown, and no real detection hardware is modeled.
- **The exact moment of merger, and everything after it (the "ringdown"), is not modeled.** The run stops at an idealized cutoff shortly before the point where the toy formula below would otherwise blow up — the same treatment this project already gives the Twin Paradox's turnaround (an unmodeled instantaneous event, looked at only from before and after).
- **The relationship between mass, chirp speed, and loudness is a simple, explicitly-labeled toy formula** (see "Physics Model"), not the real post-Newtonian inspiral equations that actually govern this. It is chosen to be qualitatively correct in direction (bigger mass → shorter time to the final moment, and a stronger wave) without claiming to be the real formula.
- The mass control reuses the Black Hole experiment's same dimensionless mass scale and range, not real solar masses.

### Not introduced

The real post-Newtonian phase/frequency evolution equations, the merger and ringdown waveform itself, the second ("cross") polarization, real units or real astrophysical masses, and how LIGO actually extracts mass and distance from a real chirp's exact shape (candidates for a possible later experiment, not this one).

---

## Physics Model

Reuses Experiment 1's exact strain/arm-length relationship unchanged. The only new physics is making `frequency` and `amplitude` themselves increase over time, and accumulating oscillation phase numerically (the same step-based numerical style already used by `orbitExperiment.ts` and `blackHoleExperiment.ts`) rather than a closed-form phase formula, since frequency is no longer constant.

```typescript
// src/physics/gravitationalWaveChirpExperiment.ts

// Reuses gravitationalWaveExperiment.ts's BASE_ARM_LENGTH.
// Reuses blackHoleExperiment.ts's mass scale and range (0.2–6, dimensionless).

export interface ChirpState {
  time: number
  frequency: number   // current instantaneous oscillation rate, increasing over the run
  amplitude: number   // current strain amplitude, increasing over the run
  strain: number
  armXLength: number
  armYLength: number
}

export interface ChirpRun {
  mergerTime: number   // the time at which the toy formula's growth factor would diverge
  cutoffTime: number   // < mergerTime; the run stops here (the idealized "final moment")
}

export function chirpRunFor(
  mass: number,           // > 0, reuses Black Hole experiment's mass scale
  baseFrequency: number,  // > 0, frequency at time = 0
  baseAmplitude: number   // > 0, amplitude at time = 0
): ChirpRun

export function chirpStateAt(
  time: number,           // >= 0, must be <= cutoffTime for the given run
  mass: number,
  baseFrequency: number,
  baseAmplitude: number
): ChirpState
```

```
mergerTime(mass)     = MERGER_TIME_CONSTANT / mass        // bigger mass → shorter time to merger
cutoffTime(mass)     = CUTOFF_FRACTION * mergerTime(mass)  // e.g. CUTOFF_FRACTION = 0.9, stops short of the divergence

s(time, mass)        = time / mergerTime(mass)             // 0 at start, → 1 at the (unreached) merger
growthFactor(s)      = 1 / sqrt(1 - s)                     // 1 at start, grows without bound as s → 1

frequency(time)      = baseFrequency * growthFactor(s)
amplitude(time)      = baseAmplitude * growthFactor(s) * (mass / REFERENCE_MASS)  // bigger mass → louder, at any given s

phase(time)          = 2π * (numerically accumulated integral of frequency(τ) from 0 to time,
                         one simulation step at a time — same style as the existing orbit/black-hole integrators)

strain(time)         = amplitude(time) * sin(phase(time))
armXLength(time)     = BASE_ARM_LENGTH * (1 + strain(time) / 2)   // identical to Experiment 1
armYLength(time)     = BASE_ARM_LENGTH * (1 - strain(time) / 2)   // identical to Experiment 1
```

`REFERENCE_MASS` is a constant (candidate: `1`, the low end of a "typical" black hole in this project's existing mass scale — open to the owner's judgment, see "Decisions Needing Human Review").

Structured independently of any UI, per `CLAUDE.md` §9. `CLAUDE.md` §11 (simulation time separate from playback speed) applies exactly as it does in Experiment 1.

---

## Learner Controls

- **Mass**, reusing the exact same slider, range (0.2–6), and label as the Black Hole experiment, for direct continuity — a bigger mass produces a louder, faster-arriving chirp.
- **Run**, which plays the chirp forward from `time = 0` to `cutoffTime` and then stops — no fixed cycle count this time, since the run's natural endpoint is the idealized "final moment," not a fixed number of oscillations.

`baseFrequency` and `baseAmplitude` are fixed constants, not learner-facing controls, to keep this experiment's one new idea (mass driving the chirp) the sole focus rather than compounding several sliders (see "Decisions Needing Human Review" — an open question on whether this simplicity is right).

The mass control is disabled until both predictions are entered, matching the rest of the project.

---

## Prediction Activity

Before the controls and results are shown, the learner is asked three questions, in order:

1. "As the two objects spiral closer together, do you think the wave's pitch (how fast it oscillates) speeds up, slows down, or stays the same?" (Speeds up / Slows down / Stays the same)
2. "Do you think the wave also gets stronger (louder) as it approaches the final moment, gets weaker, or stays the same strength?" (Stronger / Weaker / Stays the same)
3. "If you compare a small-mass pair to a large-mass pair, which one reaches its final moment sooner?" (The small-mass pair / The large-mass pair / They take the same time)

Choices are not scored. The control is disabled until all three predictions are entered.

---

## Experiment Behavior

### Display

- A live readout of the current frequency, amplitude, and strain, and the two arm lengths (matching Experiment 1's live readout).
- The same L-shaped arm diagram as Experiment 1, now visibly speeding up and growing more extreme as the run approaches its cutoff.
- A live-updating graph of both arm lengths against simulated time (matching Experiment 1's graph), which will visibly show the oscillation's period shrinking and its amplitude growing as the run proceeds — a distinctly different-looking graph from Experiment 1's steady, even sine wave, and the clearest single "aha" moment of this experiment.
- The run stops cleanly at `cutoffTime`; nothing marks a "merger" event on screen beyond the animation simply ending (consistent with treating it as unmodeled, per the Twin Paradox's turnaround precedent).

### Results

States the run's mass, the starting and final (at cutoff) frequency and amplitude, and how much shorter the run was for a larger mass compared to a smaller one (if the learner tries both) — then compares all three predictions to what actually happened.

### Introductory text

Not yet drafted — per `CLAUDE.md` §28.1, learner-facing wording is drafted only after this specification itself is approved, then shown to the owner for line-by-line review before being considered final.

---

## AI Tutor Behavior

Follows the predict → observe → explain pattern of Experiment 1:

- **Before results:** helps the learner form all three predictions; does not reveal the answer.
- **After "Run" completes:**
  1. Observation: "What did you notice about the wave's pitch and loudness as the run went on?"
  2. Prediction comparison: the learner's three predicted answers beside what actually happened (pitch rises, loudness rises, bigger mass reaches the final moment sooner).
  3. Conceptual question: "Why would two objects spiraling closer and closer together make the wave both faster and stronger, right up until they meet?" — intended to draw on the Orbit experiment's already-established "closer orbits are faster" idea, without restating its physics.
  4. Explanation: (1) names "chirp"; (2) as the pair spirals inward they orbit faster, and a faster orbit produces a faster-oscillating, stronger wave; (3) a bigger mass pair follows this pattern on a shorter timescale, which is why it reaches its final moment sooner; (4) the exact final moment (merger) and what follows it are not modeled here — an idealized cutoff, the same treatment already given to the Twin Paradox's turnaround; (5) a real chirp's rising shape is exactly how LIGO scientists work out how massive and how far away a real source was — GW150914's real signal rose in frequency from roughly 35 Hz to roughly 250 Hz over about two-tenths of a second before merging, the same kind of rising "whoop" this experiment models in miniature.

---

## Required Physics Tests

1. At `time = 0`, `frequency === baseFrequency` and `amplitude === baseAmplitude`, for any valid `mass`.
2. `frequency` and `amplitude` are both strictly increasing functions of `time` over `[0, cutoffTime]`, for any valid inputs.
3. `armXLength - BASE_ARM_LENGTH === -(armYLength - BASE_ARM_LENGTH)` at every `time` (the same opposite-and-equal invariant as Experiment 1), within floating-point tolerance.
4. A larger `mass` (with the same `baseFrequency`/`baseAmplitude`) produces a strictly shorter `cutoffTime` than a smaller `mass`.
5. A larger `mass` (with the same `baseFrequency`/`baseAmplitude`) produces a strictly larger `amplitude` than a smaller `mass`, at the same fraction of its own run (same `s`).
6. `cutoffTime < mergerTime` strictly, for any valid `mass` (confirms the run never reaches the formula's divergence).
7. `mass <= 0`, `baseFrequency <= 0`, `baseAmplitude <= 0`, or `time < 0` throws, matching the project's existing validation pattern.
8. `time` greater than the run's own `cutoffTime` throws (the physics model must not silently extrapolate past the point it's valid for).
9. The function is deterministic across repeated calls for the same inputs.
10. Scaling `baseFrequency` or `baseAmplitude` alone (holding `mass` fixed) scales `frequency(time)`/`amplitude(time)` proportionally at every `time`, without changing `mergerTime` or `cutoffTime` (confirms the toy formula's mass-dependence is isolated to timing and loudness, not baseline scale).

---

## Decisions Confirmed

All items were confirmed by the owner in conversation on 2026-09-29.

1. **This is the next experiment to build**, following directly from Experiment 1's own flagged simplification (the constant-frequency/amplitude wave).
2. **The merger itself is not modeled.** The run stops cleanly at an idealized cutoff, matching the Twin Paradox's treatment of its own unmodeled turnaround — no ringdown, no merger waveform.
3. **The mass control reuses the Black Hole experiment's existing mass slider and range**, rather than a new, unconnected "inspiral rate" control — giving a direct cross-experiment callback.
4. **The mass-to-chirp relationship uses a simple, explicitly-labeled toy formula** (not the real post-Newtonian inspiral equations), chosen only to be qualitatively correct in direction: bigger mass → shorter time-to-merger and a louder wave.
5. **Title confirmed as written:** "The Chirp: A Wave That Builds."
6. **The toy formula's exact shape and constants are confirmed as drafted** (`growthFactor = 1/sqrt(1-s)`, mass scaling amplitude linearly against `REFERENCE_MASS`), as a qualitatively-correct, explicitly-labeled stand-in for the real post-Newtonian equations.
7. **Only one new learner control (mass), with `baseFrequency`/`baseAmplitude` fixed constants.** Confirmed as the simplest option: keeps this experiment's one new idea (mass driving the chirp) as the sole focus, consistent with `CLAUDE.md` §16's scope-control principle, rather than compounding several sliders at once.
8. **The real-world figure for the tutor's final explanation point** — GW150914's signal rising from roughly 35 Hz to roughly 250 Hz over about two-tenths of a second — is included as stated, a widely-cited public figure from the 2016 LIGO discovery announcement, phrased with "roughly"/"about" hedging consistent with how this project already states other real figures (e.g. Experiment 7's "1.3 billion light-years").
9. **This does not close the chapter.** A further Gravitational Waves experiment (e.g., how LIGO actually reads mass and distance off a real chirp) remains an open, welcome direction to propose once this one is built.

---

## Success Criteria

1. The physics model reuses Experiment 1's strain/arm-length formula exactly, adding only a new, self-contained, explicitly-documented time-varying frequency/amplitude model (per "Physics Model" above).
2. The learner predicts all three questions before the control and results are shown.
3. The results and live display visibly show both frequency and amplitude increasing over the run, then stopping cleanly — no merger or ringdown is shown or implied.
4. A larger mass produces both a shorter run and a louder final signal than a smaller mass, and the learner can, after the tutor conversation, state why (faster orbits as the pair spirals inward) in their own words.
5. The introduction, results panel, and tutor state plainly that the merger itself is unmodeled (an idealized cutoff), and that the mass-to-chirp relationship is a simplified stand-in for the real physics, not the real equations.
6. Real-world grounding is limited to named, independently-verified facts about GW150914's chirp — never invented or unverified numbers presented as real (see "Decisions Needing Human Review" item 4).
7. `CLAUDE.md` §11 holds: playback speed does not change `mass`, `baseFrequency`, `baseAmplitude`, or any computed value.

---

## Implementation Notes

Implemented per §21/§23 Stage 5 and §6 (one-step-at-a-time): physics model and physics tests (`src/physics/gravitationalWaveChirpExperiment.ts`, `src/physics/gravitationalWaveChirpExperiment.test.ts`), basic UI, UI+physics wiring, learner prediction interaction, results panel, and AI tutor (`src/components/GravitationalWaveChirpExperiment.tsx`, `src/components/GravitationalWaveChirpTutor.tsx`), wired into the guided journey in `src/App.tsx`. `BASE_FREQUENCY` (1) and `BASE_AMPLITUDE` (0.03) were chosen as the fixed constants the specification leaves open, as a visual/scale judgment call rather than a physics one; at the high end of the mass slider (6) the strain reaches roughly 0.57, well past Experiment 1's 0.05–0.4 range, which the owner may want to revisit.

It has had its complete-flow test in a browser (predictions → run at a small mass → results → tutor; a second run at a large mass to confirm the cross-run comparison sentence; Previous/Next navigation and remount-on-switch behavior; no console errors) and its final review against this specification, `docs/PROJECT.md`, and `AGENTS.md` (§21 Step 10). Four gaps were found and fixed there:

1. The page heading duplicated the group heading already shown above it ("Gravitational Waves, Experiment 2 — ..." instead of "Experiment 2 — ...", inconsistent with Experiment 1's own heading).
2. The introduction's four required simplifying assumptions were stated as only three — the fourth ("The mass control reuses the Black Hole experiment's same made-up mass scale, not real solar masses") was missing.
3. The term "chirp" was used in the chapter title but never defined in the introduction before the tutor's explanation; added a defining clause to the "What happens" paragraph.
4. Success Criterion 5 requires the introduction, results panel, and tutor to each state that the mass-to-chirp relationship is a simplified stand-in for the real physics — only the introduction did; added a matching sentence to both the results panel and the tutor's final explanation.

After that review, the owner asked for several further refinements, all made and then approved: a "A daily-life picture" paragraph was added to the introduction (a coin spun flat on a table, its clatter speeding up and getting louder right until it stops); the Results panel gained a plain-language definition of "strain," a loudness multiplier ("about 3.2× louder than it started"), and a "Comparing your two runs" callout (shown once the learner has tried two different masses) noting that multiplier is the same regardless of mass; a "Change predictions" control was added, matching the one already added to the Orbit experiment, letting the learner revisit their three predictions after submitting without losing their chosen mass; and the live one-line readout below the Run button was changed to stay hidden until a run has actually started (matching the Black Hole experiment's precedent), since it had been showing idle rest-state numbers before the learner did anything.

The owner's line-by-line wording approval (§28.1) is complete (2026-09-30), approved as written with no changes requested. The graph's live animation (arm lengths vs. simulated time) could not be visually confirmed in the automated browser session used for testing here, since its backgrounded tab throttles `requestAnimationFrame`; the numeric readout and final-frame values were confirmed correct, and the graph code is a direct reuse of Experiment 1's already-shipped, working implementation (with a wider Y-axis range to cover the full mass slider) — worth a quick manual glance in a normal browser tab. Not yet committed to git.
