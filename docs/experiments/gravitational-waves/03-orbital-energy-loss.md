# Gravitational Waves — Experiment 3: Where the Energy Comes From

**Status: implemented (2026-09-30). Physics, physics tests, UI, prediction interaction, results panel, and tutor are built and wired into the guided journey; complete-flow tested in a browser; final review against this specification, `docs/PROJECT.md`, and `AGENTS.md` complete (see "Implementation Notes"). Owner's wording review is complete, done iteratively in conversation (2026-09-30) rather than as a single line-by-line pass (see "Implementation Notes").**

This specification was drafted per `CLAUDE.md` §23 Stage 3, following a proposal Claude Code made in conversation on 2026-09-30, in response to the milestone set after Gravitational Waves Experiment 2's wording approval. The owner considered several alternative directions (triangulation with two detectors, reading mass off a mystery signal, noise/detection) and a combined proposal, before choosing this one alone, to keep the experiment's scope to a single new idea (`CLAUDE.md` §16). The items under "Decisions Confirmed" below reflect that conversation; items still open are listed under "Decisions Needing Human Review."

---

## Overview

Experiment 2 showed that a bigger mass produces a faster-rising, louder chirp, and that as the pair spirals closer together it orbits faster — but it never explained *why* the orbit shrinks in the first place. The pair doesn't get closer "because the formula says so"; it gets closer because the gravitational wave itself is carrying energy away from the orbit.

This experiment makes that cause visible. It reuses Experiment 2's exact chirp physics unchanged — same mass control, same rising frequency and amplitude, same idealized cutoff — and adds one new, explicitly-labeled quantity alongside it: the orbital energy remaining in the pair, shown over the same run, decreasing as the chirp accelerates. The two curves, side by side, tell a cause-and-effect story: energy draining out is why the chirp speeds up, not a coincidence alongside it.

This is not invented behavior: LIGO's real GW150914 detection is understood, and reported, in exactly these terms — the two black holes converted roughly 3 solar masses' worth of energy into gravitational waves in about a fifth of a second, more power, briefly, than the combined light of every star in the observable universe.

---

## Learning Objective

After this experiment, the learner should understand:

1. A gravitational wave is not a free side-effect of two objects orbiting each other — producing it costs the orbit real energy.
2. That energy loss is *why* the pair spirals closer together and orbits faster (the chirp Experiment 2 showed as an observed fact now has a cause): losing orbital energy is what shrinks the orbit.
3. A bigger mass pair has more total orbital energy to lose, which is part of why it produces a louder wave (reusing Experiment 2's existing mass-to-loudness relationship, now connected to a cause).
4. A real detection (GW150914) is understood by scientists in exactly these energy terms — a measurable amount of mass converted directly into radiated energy.

---

## Physical Situation

The same inspiraling pair and L-shaped detector arms as Experiment 2, over the same run (`time = 0` to `cutoffTime`). Alongside the existing frequency/amplitude/strain display, a new quantity — the orbital energy remaining in the pair — is shown decreasing over the identical run.

### Simplifying assumptions (must be stated to the learner, in plain language)

- Everything Experiment 1 and Experiment 2 already state still applies here: the effect is hugely exaggerated, only one wave pattern is shown, no real detection hardware is modeled, the merger itself is not modeled, and the mass-to-chirp relationship is a toy formula, not the real post-Newtonian equations.
- **The energy-loss relationship is a new, separate, explicitly-labeled toy formula** (see "Physics Model"), chosen only to be qualitatively correct in direction — energy decreases smoothly to a small remaining fraction as the run approaches cutoff — not the real post-Newtonian energy-flux equations that actually govern this.
- **Energy is shown in arbitrary, dimensionless units for this experiment's display**, not real joules or solar masses of energy, except in the tutor's real-world grounding (GW150914's figure), which is stated as a separate, independently-verified fact, not computed by this experiment's formula.
- The mass control reuses the Black Hole experiment's same dimensionless mass scale and range, not real solar masses (same assumption already stated in Experiment 2).

### Not introduced

The real post-Newtonian energy-flux equations, real units of energy, how the radiated energy relates quantitatively to the wave's real amplitude (the toy formulas for chirp and energy are deliberately independent, not derived from each other), and anything about detecting or locating a real signal (triangulation, multiple detectors — remains a candidate for a possible later experiment, not this one).

---

## Physics Model

Reuses Experiment 2's exact `chirpRunFor` and the same `s(time, mass) = time / mergerTime(mass)` progress fraction it computes internally, imported rather than recomputed. The only new physics is a simple, explicitly-labeled toy formula for orbital energy as a function of that same `s`.

```typescript
// src/physics/gravitationalWaveEnergyExperiment.ts

// Reuses gravitationalWaveChirpExperiment.ts's chirpRunFor (mergerTime, cutoffTime) unchanged.
// Adds one new, self-contained, explicitly-labeled toy quantity: orbital energy over the same run.

const BASE_ORBITAL_ENERGY = /* constant, dimensionless, open — see "Decisions Needing Human Review" */
const REFERENCE_MASS = 1  // matches gravitationalWaveChirpExperiment.ts's own REFERENCE_MASS

export interface OrbitalEnergyState {
  time: number
  totalOrbitalEnergy: number      // constant for a given mass; the pair's starting energy budget
  remainingOrbitalEnergy: number  // decreases over the run
  radiatedEnergy: number          // totalOrbitalEnergy - remainingOrbitalEnergy; increases over the run
}

export function orbitalEnergyStateAt(
  time: number,   // >= 0, must be <= this mass's cutoffTime (reuses chirpRunFor's validation)
  mass: number    // > 0, reuses the same mass scale as Experiment 2 / Black Hole experiment
): OrbitalEnergyState
```

```
totalOrbitalEnergy(mass)          = BASE_ORBITAL_ENERGY * (mass / REFERENCE_MASS)
                                     // bigger mass → more total energy to radiate

s(time, mass)                     = time / mergerTime(mass)     // from chirpRunFor, reused unchanged

remainingOrbitalEnergy(time,mass) = totalOrbitalEnergy(mass) * (1 - s(time, mass))
radiatedEnergy(time, mass)        = totalOrbitalEnergy(mass) * s(time, mass)
```

This is a deliberately simple, linear-in-`s` toy relationship — not derived from the real post-Newtonian energy flux — chosen only so that: energy starts at a fixed budget, decreases smoothly and monotonically to a small remaining fraction by `cutoffTime` (since `cutoffTime = 0.9 * mergerTime`, `s = 0.9` at cutoff, leaving 10% of the budget unradiated — consistent with the merger itself, where the rest would be radiated, being unmodeled), and scales with mass the same way Experiment 2's amplitude already does.

Structured independently of any UI, per `CLAUDE.md` §9, in its own file separate from `gravitationalWaveChirpExperiment.ts` (imports from it rather than modifying it). `CLAUDE.md` §11 applies exactly as in Experiments 1 and 2.

---

## Learner Controls

- **Mass**, the same slider, range, and label as Experiment 2 — no new control, keeping this experiment's one new idea (energy loss driving the chirp) the sole focus, per `CLAUDE.md` §16.
- **Run**, identical to Experiment 2: plays forward from `time = 0` to `cutoffTime`, driving both the existing chirp display and the new energy display from the same clock.

The mass control is disabled until the prediction is entered, matching the rest of the project.

---

## Prediction Activity

Before the control and results are shown, the learner is asked one question (a single new idea gets a single prediction, unlike Experiment 2's three):

1. "As the wave's pitch and loudness rise during the run, what do you think happens to the orbital energy of the two objects — does it increase, decrease, or stay the same?" (Increases / Decreases / Stays the same)

This is chosen to surface a likely-incorrect intuition: a learner might reason "the wave gets stronger, so the system must be gaining energy," when the opposite is true — the system is losing the energy that becomes the wave.

Choices are not scored. The control is disabled until the prediction is entered.

---

## Experiment Behavior

### Display

- The same live readout and L-shaped arm diagram as Experiment 2, unchanged.
- A new live readout of remaining orbital energy (and/or radiated energy — see "Decisions Needing Human Review"), updating over the same run.
- A new live-updating graph of remaining orbital energy against simulated time, shown alongside (not replacing) Experiment 2's existing arm-length graph, so the learner can see both curves over the identical timeline: arm lengths oscillating faster and wider, energy draining smoothly downward.

### Results

States the run's mass, the starting and final (at cutoff) orbital energy and how much was radiated, then compares the learner's prediction to what actually happened.

### Introductory text

Not yet drafted — per `CLAUDE.md` §28.1, learner-facing wording is drafted only after this specification itself is approved, then shown to the owner for line-by-line review before being considered final.

---

## AI Tutor Behavior

Follows the predict → observe → explain pattern of the prior experiments:

- **Before results:** helps the learner form their prediction; does not reveal the answer.
- **After "Run" completes:**
  1. Observation: "What did you notice about the orbital energy as the wave got faster and louder?"
  2. Prediction comparison: the learner's predicted answer beside what actually happened (energy decreases).
  3. Conceptual question: "If the wave is carrying energy away, where does that energy come from?" — intended to lead the learner to connect the radiated wave directly to the shrinking orbit, rather than treating them as two separate facts.
  4. Explanation: (1) the gravitational wave carries real energy away from the orbiting pair; (2) losing that energy is what causes the orbit to shrink, which is why the pair orbits faster and the wave chirps — the cause of the effect Experiment 2 already showed; (3) a bigger mass pair has more energy to lose, which is part of why it produces a louder wave; (4) the energy scale shown here is a simplified stand-in, not the real post-Newtonian energy-flux equations; (5) real-world grounding: LIGO's GW150914 detection converted roughly 3 solar masses' worth of energy into gravitational waves in about two-tenths of a second — for that brief instant, releasing more power than the combined light of every star in the observable universe.

---

## Required Physics Tests

1. `remainingOrbitalEnergy` strictly decreases as `time` increases over `[0, cutoffTime]`, for any valid `mass`.
2. `radiatedEnergy` strictly increases as `time` increases over the same interval, and `radiatedEnergy + remainingOrbitalEnergy === totalOrbitalEnergy` at every `time`, within floating-point tolerance.
3. At `time = 0`, `remainingOrbitalEnergy === totalOrbitalEnergy` and `radiatedEnergy === 0`, for any valid `mass`.
4. A larger `mass` produces a strictly larger `totalOrbitalEnergy` than a smaller `mass`.
5. At the same fraction `s` of two different-mass runs, the fraction of energy radiated (`radiatedEnergy / totalOrbitalEnergy`) is identical regardless of mass (confirms the toy formula's mass-dependence is isolated to the total budget, not the shape of the loss curve — the same pattern Experiment 2's own test 10 already established for frequency/amplitude).
6. `mass <= 0` or `time < 0` throws, matching the project's existing validation pattern.
7. `time` greater than the run's own `cutoffTime` throws, matching Experiment 2's own test 8.
8. The function is deterministic across repeated calls for the same inputs.

---

## Decisions Confirmed

All items were confirmed by the owner in conversation on 2026-09-30.

1. **This is the next experiment to build**, chosen from several alternatives (triangulation, reading mass off a mystery signal, a combined energy+triangulation proposal) specifically because it stays to a single new idea, consistent with `CLAUDE.md` §16.
2. **Scope is energy loss alone.** No detector-location concepts (triangulation, multiple detectors) are introduced here; that remains open as a possible future direction, as already noted in Experiment 2's own "Decisions Confirmed" item 9.
3. **The energy-loss relationship is a new, separate, explicitly-labeled toy formula**, not derived from or blended into Experiment 2's existing chirp formula, and not the real post-Newtonian energy-flux equations.
4. **Title working name:** "Where the Energy Comes From." Open to the owner's preference (see "Decisions Needing Human Review").

---

## Decisions Needing Human Review

1. **Exact value of `BASE_ORBITAL_ENERGY`, and its display units/label.** The specification leaves this as an open constant (a visual/scale judgment call, not a physics one, matching how Experiment 2 left `BASE_FREQUENCY`/`BASE_AMPLITUDE` open). A candidate default is a round number (e.g. `1`) with a label like "energy units" or "orbital energy (arbitrary units)" — the owner's preference welcome.
2. **Whether to display remaining energy, radiated energy, or both.** The specification above shows both are computed, but only one number may be clearer to show live, with the other reserved for the results panel.
3. **The linear-in-`s` shape of the energy-loss formula** (`remainingOrbitalEnergy = totalOrbitalEnergy * (1 - s)`) was chosen only for simplicity — a straight line is the simplest monotonic decrease that starts at the full budget and lands near-empty at cutoff. An alternative (e.g. decreasing faster near the end, echoing how the real post-Newtonian energy flux actually accelerates near merger) is possible but adds complexity for a toy formula already labeled as not-the-real-equations. Confirm the straight-line choice is acceptable, or prefer a curve.
4. **Whether the new energy graph should be a separate graph beside the existing arm-length graph, or overlaid/combined in some way.** The specification above assumes a separate graph, side by side, to avoid crowding two different units onto one axis.
5. **Title confirmed or to be revised** (see "Decisions Confirmed" item 4).

---

## Success Criteria

1. The physics model reuses Experiment 2's exact `chirpRunFor`/`s` calculation unchanged (imported, not recomputed), adding only a new, self-contained, explicitly-documented orbital-energy formula (per "Physics Model" above).
2. The learner predicts the single question before the control and results are shown.
3. The results and live display visibly show orbital energy decreasing smoothly over the run, ending near-empty (not zero) at cutoff — consistent with the merger itself being unmodeled.
4. The learner can, after the tutor conversation, state in their own words why the orbit shrinks (because the wave carries energy away from it), connecting this experiment's cause to Experiment 2's already-observed effect.
5. The introduction, results panel, and tutor each state plainly that the energy-loss relationship is a simplified toy formula, separate from and not derived from Experiment 2's chirp formula, and not the real post-Newtonian equations.
6. Real-world grounding is limited to the named, independently-verified GW150914 energy figure — never invented or unverified numbers presented as real.
7. `CLAUDE.md` §11 holds: playback speed does not change `mass`, `BASE_ORBITAL_ENERGY`, or any computed value.

---

## Implementation Notes

Implemented per §21/§23 Stage 5 and §6 (one-step-at-a-time): physics model and physics tests (`src/physics/gravitationalWaveEnergyExperiment.ts`, `src/physics/gravitationalWaveEnergyExperiment.test.ts`), basic UI, UI+physics wiring, learner prediction interaction, results panel, and AI tutor (`src/components/GravitationalWaveEnergyExperiment.tsx`, `src/components/GravitationalWaveEnergyTutor.tsx`), wired into the guided journey in `src/App.tsx`.

The open items under "Decisions Needing Human Review" were resolved by judgment call, per the owner's instruction to proceed and decide: `BASE_ORBITAL_ENERGY = 1`, labeled "energy units" (not real joules) in the display; both remaining and radiated energy are shown live and in the results panel; the energy-loss curve is the straight-line `remainingOrbitalEnergy = totalOrbitalEnergy * (1 - s)`; the title "Where the Energy Comes From" was kept as proposed. All are visual/scale or presentation judgment calls, not physics ones, and remain open to the owner's revision.

It has had its complete-flow test in a browser (introduction → prediction → mass slider → Run at mass 1.0 and again at mass 5.1 → live readout, arm diagram, and both graphs animating → Results panel → all three tutor steps → final explanation → "What you learned" summary and sidebar checkmark; Previous/Next navigation; no console errors) and its final review against this specification, `docs/PROJECT.md`, and `AGENTS.md` (§21 Step 10, 2026-09-30). One gap was found in that review and fixed: the Display section requires the new energy graph to be shown "alongside (not replacing) Experiment 2's existing arm-length graph," but the initial implementation only included the new energy graph and the static L-shaped arm diagram, omitting the arm-length-vs-time graph entirely — fixed by adding it back (`armHistory` state, `armGraphPoint`), reusing Experiment 2's own graph exactly (same axis scale, same two colors), placed directly above the new energy graph. All required physics tests pass (8/8), the full project test suite passes (278/278), and `tsc --noEmit` is clean.

After that review, several rounds of owner feedback in conversation refined the introduction and results text: a new "What is energy?" and "How does a wave transmit energy?" pair of paragraphs was added at the top of the introduction (using a pond-ripple analogy to explain the transmission mechanism, per the owner's specific request, since the original draft explained only that energy moves, not how a wave carries it); a real bug was found and fixed where moving the mass slider after a completed run left that run's stale readout and Results panel on screen until "Run" was clicked again (fixed via a new `handleMassChange` that resets to idle on any post-run mass change); the energy graph's Y-axis, originally fixed to the full 0.2–6 mass range, made the line nearly invisible for most masses since a single run only ever spans a small fraction of that range — fixed by scaling the axis to that run's own starting energy (`runTotalOrbitalEnergy`); the graph line color was darkened from `#d97706` to `#92400e` and thickened for visibility; the graph's caption originally read "notice it draining away as the chirp above builds," which assumed the reader could interpret the graph's own axes from context — rewritten to explain the line directly (starts full at top-left, falls to near-empty at bottom-right); and the results/caption text originally claimed the learner was "watching the gravitational wave," which overclaims what's on screen (as in Experiments 1–2, only the wave's effect — the arms stretching and squeezing — is shown, never the wave itself as a drawn shape) — corrected in both places.

The owner's wording review is complete, done iteratively in conversation (2026-09-30) covering the introduction, results panel, and graph captions, rather than as a single line-by-line pass; no further changes were requested after the last round. Committed to git.
