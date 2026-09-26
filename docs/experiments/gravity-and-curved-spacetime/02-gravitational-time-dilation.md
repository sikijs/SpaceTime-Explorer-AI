# Gravity and Curved Spacetime — Experiment 2: Does Gravity Change Time?

**Status: built, complete-flow tested, and reviewed against this specification (`CLAUDE.md` §21 Steps 9–10).** Physics model, tests, interface, prediction, results panel, and AI tutor are built and wired into the guided journey (`src/physics/gravitationalTimeDilationExperiment.ts`, `src/physics/gravitationalTimeDilationExperiment.test.ts`, `src/components/GravitationalTimeDilationExperiment.tsx`, `src/components/GravitationalTimeDilationTutor.tsx`, `src/App.tsx`). The tutor follows the predict → observe → explain pattern used throughout the app. See "Implementation Notes" below for what the review found and fixed. The owner's line-by-line wording approval (`CLAUDE.md` §28.1) is complete (2026-09-25); the only change made during that review was to the introduction's "What we assume" explanation of "strength," which the owner found unclear in its first draft — see the updated Introductory text below.

The five open questions from the Stage 2 proposal conversation were settled by the owner and are folded into this draft (see "Decisions Confirmed" below).

## Implementation Notes

The final review against this specification (§21 Step 10) found and fixed one gap:

1. **The required tick-count-vs-time graph was missing entirely.** This specification's Display section calls for "a graph of tick count vs. floor-clock time for both clocks overlaid, drawn progressively as the run plays," but the original implementation only showed the two clocks' live tick counts, no graph. Fixed: added an SVG line chart (in the live display area, alongside the clock cards, matching Experiment 1's placement) plotting both clocks' tick counts — a solid line for the floor clock and a dashed line for the ceiling clock, drawn progressively in step with the running animation.

Two further, smaller fixes made in the same pass, not counted as spec gaps: the floor and ceiling clock cards were restyled from two side-by-side cards into one bordered container (ceiling on top, floor on bottom, divided by a dashed line) to read more like "one cabin, two positions," matching the Display section's framing of a single rocket cabin rather than two independent boxes; and the introduction's "Your job" line was written as "Watch both clocks and compare how many ticks each one registers" rather than this specification's original "Before you watch, predict: will the two clocks tick at the same rate, or different rates?" — deliberately, following the same precedent set by Experiment 1's own implementation (its "Your job" line is observation-focused, since the prediction itself is asked for explicitly in the separate "Make a prediction" section below the introduction, not duplicated in the introduction's own text).

After wording approval, the owner asked for one further fix: the tutor's explanation used "redshifted" and "redshift" without ever defining the term in plain language, contrary to `CLAUDE.md`'s header instruction that every specialized term be defined before use. Fixed: the tutor's first explanation point now defines redshift in everyday terms (a wave arriving "stretched out," with the name's origin in visible light shifting toward red) before using the term, in `src/components/GravitationalTimeDilationTutor.tsx`.

The owner then asked for the tutor's explanation to go into more detail. Added: a "A worked example" paragraph, inserted between the existing redshift explanation and the equivalence-principle paragraph, walking through a concrete 1g, 10-meter-cabin case (the cabin's speed increasing by ~9.8 m/s between two ticks sent one second apart, so the second tick arrives about 1.09×10⁻¹⁵ seconds later than the first, relative to when they were sent). This reinforces, without contradicting, the existing point that the real effect is too small to notice directly. Approved by the owner and added to `src/components/GravitationalTimeDilationTutor.tsx`.

The owner then asked whether the tutor should distinguish this effect from Experiment 4's (motion-based) time dilation, to prevent learners from conflating the two. Added: "A note on 'time dilation'" (two paragraphs), inserted between the equivalence-principle paragraph and "3. This is real," contrasting Experiment 4's effect (symmetric, from relative motion — each clock looks slow from the other's point of view) with gravitational time dilation (one-way, from position in a field that has a shared "up"/"down" direction — the floor clock genuinely runs slower for every observer). Approved by the owner and added to `src/components/GravitationalTimeDilationTutor.tsx`.

The owner then asked, after reading the explanation, why the redshift happens at all given that both clocks share the same acceleration, and asked for the answer with simple math and a daily-life example. Added: two further blocks, inserted between the existing redshift explanation and "A worked example" — "Why does the acceleration cause this stretching?" (a five-step numbered derivation of the fractional shift `a × h / c²` from light's transit time `h/c` and the speed the cabin gains during that transit, since light's speed doesn't depend on the emitter's speed) and "A daily-life picture" (a horn honked at an accelerating drone, where sound must keep catching up to a target that keeps getting faster). Approved by the owner and added to `src/components/GravitationalTimeDilationTutor.tsx`. The owner then asked for the five-step derivation verbatim as first drafted in conversation, rather than the condensed paragraph originally implemented; the paragraph was replaced with an ordered list using that exact wording.

## Overview

Experiment 1 of this phase ("The Equivalence Principle") showed the learner that a ball dropped in a cabin at rest under gravity, and a ball dropped in a cabin accelerating through deep space, move identically — so a sealed observer can't tell the two situations apart.

This experiment applies that same discovery to clocks instead of a falling ball. It reuses the Experiment 1 rocket cabin, now with one clock at the floor and one at the ceiling, and shows that the ceiling clock runs faster than the floor clock purely because the cabin is accelerating. By the equivalence principle the learner already found, the same must then be true for two clocks at different heights in a real gravitational field, with no motion or acceleration involved at all — a clock closer to a planet's surface runs slower than a clock higher up. This is **gravitational time dilation**.

This experiment uses a first-order approximation (see "Simplifying Assumptions"), not the full general-relativistic treatment, and says so explicitly to the learner.

---

## Learning Objective

After this experiment, the learner should understand:

1. Two identical clocks in the same accelerating rocket cabin, one at the floor and one at the ceiling, do not tick at the same rate — the ceiling clock runs faster.
2. This happens because a signal (light) sent from the floor to the ceiling takes time to arrive, and during that time the cabin keeps speeding up — so by the time the signal reaches the ceiling, the ceiling is moving away from where the floor was when the signal was sent. This stretches the signal to a lower frequency: a **redshift**.
3. By the equivalence principle (Experiment 1), the same effect must happen for two clocks at different heights sitting still in a real gravitational field: the lower clock runs slower, the higher clock runs faster. This is called **gravitational time dilation**.
4. This is a real, measured effect — GPS satellites have to correct for it to stay accurate.
5. This experiment only shows the first-order size of the effect, using an exaggerated abstract control, not the exact general-relativistic formula.

---

## Physical Situation

The same sealed, windowless rocket cabin from Experiment 1, in deep space with no gravity, accelerating at a constant rate. This time the cabin holds two identical clocks, fixed in place: one at the floor, one at the ceiling, separated by height `h` along the direction the rocket is accelerating.

At simulated time `t = 0`, the floor clock sends a light pulse "tick" upward to the ceiling clock, and both clocks otherwise run continuously. Because the cabin is accelerating the whole time each pulse is in transit, each pulse arrives at the ceiling more redshifted (stretched to a lower frequency) than the last — so, counted over the run, the ceiling clock registers more ticks than the floor clock in the same span of the floor clock's own time.

### Simplifying assumptions (must be stated to the learner, in plain language)

- This experiment uses only the **first-order approximation** for the effect (see Physics Model below), not the exact general-relativistic (Rindler-coordinate) treatment, which is more subtle — the exact treatment gives different proper accelerations to different points of a single "rigid" accelerating body, which is itself a non-obvious complication this experiment avoids.
- The acceleration is constant over the whole run, as in Experiment 1.
- The control the learner adjusts is an abstract, exaggerated stand-in for the real `acceleration × height / c²` combination (see "Learner Controls"), not a realistic value — with real numbers (Earth gravity, a few meters of height) the effect is far too small to show (around 1 part in 10 quadrillion).
- This experiment is non-relativistic in the sense that nothing here moves close to `c`; the effect comes from acceleration and light-signal timing, not from Experiments 1–11's velocity-based time dilation.

### Not introduced

The exact (Rindler-coordinate) formula for accelerating frames, gravitational redshift's exact general-relativistic formula, curved spacetime or geodesics, black holes, the Pound–Rebka experiment by name, or how GPS's correction is actually computed. These are candidates for later experiments in this phase, not this one.

---

## Physics Model

A single shared calculation applied to the light signal sent from floor to ceiling, using the standard first-order ("Einstein's elevator") argument: a pulse sent from the floor arrives at the ceiling redshifted because the cabin has sped up during the pulse's transit time.

```typescript
// src/physics/gravitationalTimeDilationExperiment.ts
export function runGravitationalTimeDilationExperiment(
  strength: number   // dimensionless a*h/c^2, the exaggerated learner-facing control; 0 < strength < 1
): GravitationalTimeDilationExperimentResult

export function tickCountAt(
  experiment: GravitationalTimeDilationExperimentResult,
  elapsedFloorSeconds: number,   // elapsed time as measured by the floor clock; must be >= 0
  clock: 'floor' | 'ceiling'
): number
```

```
frequencyRatio (ceiling received / floor emitted) = 1 - strength      // strength stands in for a*h/c^2
tickCount('floor', t)   = t                                            // floor clock is the reference
tickCount('ceiling', t) = t / frequencyRatio                           // ceiling ticks faster
```

`strength` is the single dimensionless input; there is exactly one formula, applied to derive both clocks' tick counts, the same "one shared formula" pattern established by Experiment 1 — the point again being that nothing here treats the ceiling clock differently in kind, only in position. `GravitationalTimeDilationExperimentResult` holds `strength` and `frequencyRatio`; tick counts are computed on demand via `tickCountAt`, following the pattern established by Experiment 3's `movingClockStateAt` and Experiment 1's `ballHeightAboveFloorAt`. Structured independently of any UI, per `CLAUDE.md` §9.

---

## Learner Controls

- **Strength**, an abstract dimensionless stand-in for `acceleration × height / c²`, presented as presets **0.1**, **0.3**, **0.6**, or **Other** (a custom value from 0.05 to 0.9). Framed to the learner as "how strong the effect is," not as a real acceleration or height — the introduction must say plainly that this is exaggerated far beyond anything a real building or rocket would produce, so the effect can be seen at all.

---

## Prediction Activity

Before the cabin runs, the learner is shown the same sealed cabin as Experiment 1, now with a clock marked at the floor and a clock marked at the ceiling, and asked:

> Two identical clocks sit in the same accelerating rocket — one at the floor, one at the ceiling. Do you think they'll tick at the same rate, or at different rates?

Choices: "The same rate" / "Different rates." Not scored. The run control is disabled until a prediction is entered, matching Experiments 1–11.

---

## Experiment Behavior

### Introductory text (as approved by the owner, `CLAUDE.md` §28.1)

> **The question.** In Experiment 1 you saw that a ball falls the same way whether you're sitting still under gravity or accelerating through empty space. Now let's ask about clocks instead of balls: if two clocks sit at different heights in that same accelerating rocket, do they tick at the same rate?
>
> **What happens.** The same rocket cabin from before, this time with one clock fixed to the floor and one fixed to the ceiling. As the rocket accelerates, we'll count how many ticks each clock registers.
>
> **Your job.** Watch both clocks and compare how many ticks each one registers.
>
> **What we assume.** "Strength" stands in for two real things combined: how hard the rocket accelerates, and how far apart the floor and ceiling clocks are. The bigger the strength, the bigger the difference between the two clocks. A real rocket or building would need a strength far too small to see, so here it's exaggerated so you can actually watch it happen. This experiment uses a simplified, first-order version of the real physics, not the full exact treatment.

### Display

The rocket cabin from Experiment 1, now showing a floor clock and a ceiling clock with running tick counters, plus a graph of tick count vs. floor-clock time for both clocks overlaid, drawn progressively as the run plays (same presentation pattern as Experiment 1's height-vs-time graph).

### Run

Both clocks animate simultaneously, using the same simulated-time-to-real-time playback approach as Experiments 1–11 (playback speed must not change the physical result, per `CLAUDE.md` §11).

---

## Results Display

- The chosen strength value and the resulting frequency ratio.
- Floor and ceiling tick counts at the end of the run (ceiling ahead).
- The learner's prediction, shown beside the actual result.
- A plain-language statement connecting the result back to the equivalence principle: since acceleration and gravity are locally indistinguishable (Experiment 1), a clock lower in a gravitational field must likewise run slower than one higher up — gravitational time dilation.
- One sentence noting this is a real, measured effect: GPS satellites correct for it to stay accurate.

---

## Expected Observations

1. For every tested strength, the ceiling clock registers more ticks than the floor clock over the same run.
2. Increasing strength increases the gap between the two clocks' tick counts.
3. At the lowest available strength, the two clocks are close but still visibly different — there is no "off" setting where they match exactly.

---

## Expected Learner Understanding

The learner should be able to say: "In an accelerating rocket, a clock at the ceiling ticks faster than a clock at the floor, because a light signal sent upward arrives redshifted — stretched to a lower frequency — since the cabin keeps speeding up while the signal is in transit. Because gravity and acceleration are locally indistinguishable, the same thing must happen in a real gravitational field: a clock closer to the ground runs slower than a clock higher up. This is gravitational time dilation, and it's real — GPS satellites have to correct for it."

---

## New Concepts Introduced

1. **Gravitational time dilation**, named and defined in plain language: clocks at different heights in a gravitational field tick at different rates, purely from gravity, with no motion involved.
2. **Redshift**, defined in plain language: a signal arriving stretched to a lower frequency than it was sent at — here, because the receiver is moving away from where the sender was at the moment of sending.

---

## Relationship to Previous Experiments

- Directly extends Experiment 1: reuses its cabin and its central conclusion (gravity and acceleration are locally indistinguishable) as the reasoning step that turns "clocks in an accelerating rocket differ" into "clocks in a gravitational field differ."
- Echoes Experiments 3–4's "compare two clocks, look at the tick-count ratio" structure, but the cause here is acceleration/gravity, not relative velocity — a different mechanism producing a similarly-shaped effect, which the tutor should distinguish explicitly so the two are not confused.
- Reuses the "abstracted, exaggerated control" pattern from Experiments 3–6 (speed as a direct fraction of `c`) rather than realistic units, for the same reason: the real effect is unobservably small at human scales.

## Relationship to Later Experiments

None approved. This experiment is expected to motivate a later experiment on curved spacetime itself (e.g., why gravitational time dilation implies spacetime is curved, not just that clocks disagree) and possibly a dedicated GPS or black-hole application experiment. Not proposed or approved yet.

---

## Required Physics Tests

1. `frequencyRatio` equals `1 - strength` exactly, for a range of `strength` values.
2. `tickCountAt(experiment, t, 'floor')` equals `t` exactly.
3. `tickCountAt(experiment, t, 'ceiling')` is greater than `tickCountAt(experiment, t, 'floor')` for every `t > 0` and every valid `strength`.
4. Increasing `strength` increases the gap between `tickCountAt(..., 'ceiling')` and `tickCountAt(..., 'floor')` at a fixed `t`.
5. `strength <= 0` or `strength >= 1` is rejected or otherwise defined as an explicit edge case — exact behavior decided during implementation and documented in the test.
6. Deterministic across repeated calls; independent of any UI or animation state.

---

## AI Tutor Behavior

Follows the predict → observe → explain pattern of Experiments 1–11:

- **Before the run:** helps the learner form a prediction; does not reveal the answer.
- **During the run:** silent.
- **After the run:**
  1. Observation: "Look at the two tick counts. Are they the same, or different?"
  2. Prediction comparison: the learner's predicted outcome beside the actual one.
  3. Conceptual question: "Why do you think the ceiling clock ran faster than the floor clock, if both clocks are identical and experience the same acceleration?"
  4. Explanation: (1) a light signal sent from the floor takes time to reach the ceiling, and the cabin keeps speeding up during that time, so each signal arrives redshifted — stretched to a lower frequency — which is why the ceiling counts more ticks; (2) by the equivalence principle from Experiment 1, the same must be true for two clocks at different heights in a real gravitational field with no acceleration at all — this is gravitational time dilation; (3) this is a real, measured effect that GPS satellites correct for.
  - The tutor must not explain the exact (Rindler-coordinate) formula, curved spacetime, geodesics, or how GPS's correction is actually computed — out of scope for this experiment.

---

## Decisions Confirmed

The following were raised at proposal stage and confirmed by the owner (2026-09-25):

1. **Physics scope** — use only the first-order weak-field approximation, stated plainly to the learner as an approximation, rather than the exact Rindler-coordinate treatment. Confirmed (Claude's recommendation, accepted).
2. **Control units** — an abstracted dimensionless `strength` control (standing in for `a·h/c²`) rather than realistic units, matching Experiments 3–6's precedent. Confirmed (Claude's recommendation, accepted).
3. **Real-world hook** — keep a single sentence noting GPS satellites correct for this effect; no further detail (no Pound–Rebka, no explanation of how the correction works). Confirmed (Claude's recommendation, accepted).
4. **Title** — "Does Gravity Change Time?", replacing the working title "Higher or Lower: Does Gravity Change Time?" which the owner found unclear. Confirmed.
5. **Terminology** — introduce "redshift" as a named, defined term. Confirmed.

---

## Success Criteria

1. The physics model uses one shared formula for both clocks, with no independent "floor version" and "ceiling version" of the calculation.
2. The learner predicts before the run; the run control requires a prediction.
3. The results make visible, numerically and visually, that the ceiling clock runs faster than the floor clock, and that the gap grows with `strength`.
4. The learner can state gravitational time dilation in their own words after the tutor conversation, connecting it back to the equivalence principle from Experiment 1.
5. The introduction and tutor state plainly that this uses an exaggerated control and a first-order approximation, not the exact theory.
6. No curved spacetime, geodesics, black holes, or general relativity's field equations appear — this experiment only extends the equivalence principle to clocks.
