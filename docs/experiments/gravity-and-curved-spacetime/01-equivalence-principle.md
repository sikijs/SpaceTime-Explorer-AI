# Gravity and Curved Spacetime — Experiment 1: The Equivalence Principle

**Status: APPROVED by the project owner.** This is the first experiment of Phase 2, "Gravity and Curved Spacetime." Numbering restarts within each phase, so this is Experiment 1 of this phase — not a continuation of Phase 1's Experiments 1–11 (see `docs/experiments/` for those, and `docs/experiments/gravity-and-curved-spacetime/` for this phase).

**Implementation: built, complete-flow tested, and reviewed against this specification (`CLAUDE.md` §21 Steps 9–10).** Physics model, tests, interface, prediction, results panel, and AI tutor are built and wired into the guided journey (`src/physics/equivalencePrincipleExperiment.ts`, `src/physics/equivalencePrincipleExperiment.test.ts`, `src/components/EquivalencePrincipleExperiment.tsx`, `src/components/EquivalencePrincipleTutor.tsx`, `src/App.tsx`). The tutor follows the predict → observe → explain pattern used throughout the app. See "Implementation Notes" below for what the review found and fixed. The owner's line-by-line wording approval (`CLAUDE.md` §28.1) and all six "Decisions Needing Human Review" items further down are now complete (2026-09-25).

## Implementation Notes

The final review against this specification (§21 Step 10) found and fixed three gaps:

1. **The cabins were labeled with which scene they were** (e.g. "On the ground (gravity)" under Cabin A), contradicting this specification's Prediction Activity section ("unlabeled interiors — just 'Cabin A' and 'Cabin B'"). Fixed: the cabins now show only their letter; which is which is explained once, in the introduction, not repeated as a running caption.
2. **The required height-vs-time graph was missing entirely.** This specification's Display and Results Display sections both call for "a shared graph of ball-height-above-floor vs. time with both scenes' curves overlaid," but the original implementation only showed the two cabin animations and final numbers. Fixed: added an SVG line chart (in the Results panel) plotting both cabins' curves — drawn as a solid line and a dashed line on top of it, so the learner can see directly that they coincide exactly, not just read a sentence saying so.
3. **The page's own heading repeated the group heading** already shown above it by `App.tsx` ("Gravity and Curved Spacetime — Experiment 1: ..." directly under a "Gravity and Curved Spacetime" heading). Fixed: shortened to "Experiment 1 — The Equivalence Principle," matching how other experiments' headings don't repeat their group name.

One naming note, not a behavior gap: this specification's Physics Model section illustrates the result type as `EquivalencePrincipleResult` with the curve "included" in it. The actual implementation names it `EquivalencePrincipleExperimentResult` and computes the curve on demand via a separate `ballHeightAboveFloorAt(experiment, elapsedSeconds)` function, rather than storing a samples array — the same pattern already established by Experiment 3's `movingClockStateAt`. This is a deliberate, precedent-following choice, not a gap; the code block below reflects it.

After that review, the owner asked for four further fixes, made in the same pass: the page's content container was narrower than every other experiment's (700px vs. the established 900px) — widened to match; the sidebar numbered this chapter "12" (continuing the global count) instead of "1" (its own position within "Gravity and Curved Spacetime") — `src/App.tsx` now numbers each group from its own start; opening one sidebar group's chapter list also force-opened every other group, because `src/App.tsx` tracked a single shared open/closed flag — it now tracks one per group; and the tutor's first explanation point was thin — expanded with a concrete number from the learner's own run (the tutor now takes the run `result` as a prop) and a plain-language analogy (a recipe that never mentions which kitchen it's cooked in).

A further owner request: the height-vs-time graph appeared only after the run finished, fully drawn, giving no sense of motion even though the cabin balls were (confirmed by direct DOM sampling) already animating smoothly. Fixed: the graph now draws progressively, in step with the falling ball, with a moving marker at the current point, and moved from the Results panel to the live display area (visible from the moment the ball is dropped, not just after landing) — closer to this specification's original Display section wording than the "Results panel only" choice made during the earlier review.

## Overview

Phase 1, "Relativity of Time and Motion" (Experiments 1–11), built up special relativity — proper time, reference frames, time dilation, the invariant speed of light, length contraction, relativity of simultaneity, spacetime diagrams, and the Lorentz transformation — entirely without gravity or acceleration.

This experiment opens Phase 2 with Einstein's own starting point for general relativity: the **equivalence principle**. A person sealed inside a windowless cabin drops a ball. In one scene, the cabin sits on Earth's surface, and real gravity pulls the ball down. In the other, the cabin is in deep space, far from any planet, being pushed by a rocket engine so that it accelerates at the same rate. Watching only the ball, the person inside cannot tell which situation they're in — the two scenes produce identical local motion.

This experiment deliberately uses only plain Newtonian kinematics — no relativity, no light, no curved spacetime. Its job is to let the learner discover, first-hand, that gravity and acceleration are locally indistinguishable, which motivates (but does not yet explain) later experiments connecting gravity to the geometry of spacetime.

---

## Learning Objective

After this experiment, the learner should understand:

1. A ball dropped in a cabin at rest on the ground, and a ball dropped in a cabin accelerating through empty space at the same rate, move relative to their cabin's floor in exactly the same way.
2. This means that, using only a local experiment (one confined inside a sealed box, with no window to the outside), there is no way to tell whether you are sitting still in a gravitational field or accelerating through space with no gravity at all.
3. This is called the equivalence principle, and it is the idea that started Einstein toward general relativity: if gravity and acceleration are locally indistinguishable, gravity might not be a force in the usual sense at all.
4. This experiment does not yet explain what gravity actually is — it only establishes the puzzle that later experiments will address.

---

## Physical Situation

Two sealed, windowless cabins, each containing a person who releases a ball from rest at height `y0` above the cabin floor, at simulated time `t = 0`.

**Scene A — Gravity:** the cabin sits at rest on the surface of a planet with gravitational acceleration `g`. The ball is pulled toward the floor by gravity.

**Scene B — Acceleration:** the cabin is in deep space, far from any mass, with no gravity acting on it. A rocket engine accelerates the cabin (and its floor) "upward," toward the ball, at the same rate `a = g`. The ball itself feels no force and does not accelerate in the inertial frame outside the cabin; the floor accelerates up to meet it.

In both scenes, the learner watches the ball's height **above the cabin floor** — that is, its position relative to the cabin, which is what the person inside would actually observe.

### Simplifying assumptions (must be stated to the learner, in plain language)

- Both scenes are idealized: no air resistance, no friction, a single point-like ball.
- Scene A's gravity is uniform (does not change with height) — a valid approximation for a small cabin near a planet's surface, not full general relativity.
- Scene B's acceleration is constant over the whole run.
- The ball starts at rest relative to its own cabin in both scenes.
- This experiment is entirely non-relativistic: no speeds approach `c`, and nothing here uses the Lorentz transformation, time dilation, or any result from Experiments 1–11.

### Not introduced

Curved spacetime, geodesics, gravitational time dilation, gravitational redshift, tidal effects (the difference between a truly uniform field and a real planet's field, which varies with position), general relativity's field equations, or any numerical value of `c`. These are candidates for later experiments in this phase, not this one.

---

## Physics Model

A single shared kinematic calculation, applied identically to both scenes (the point being that the *same* formula governs both, for different physical reasons):

```typescript
// src/physics/equivalencePrincipleExperiment.ts
export function runEquivalencePrincipleExperiment(
  accelerationMetersPerSecondSquared: number,   // magnitude of g (Scene A) and a (Scene B); must be > 0
  initialHeightMeters: number                   // y0, ball's starting height above the floor; must be > 0
): EquivalencePrincipleExperimentResult

export function ballHeightAboveFloorAt(
  experiment: EquivalencePrincipleExperimentResult,
  elapsedSeconds: number   // 0 <= elapsedSeconds <= experiment.timeToFloorSeconds
): number
```

```
heightAboveFloor(t) = initialHeight - 0.5 * acceleration * t^2   (until it reaches 0)
timeToFloor         = sqrt(2 * initialHeight / acceleration)
```

The same functions compute the ball-above-floor curve for both scenes, called with the same `EquivalencePrincipleExperimentResult` — there is exactly one formula, not two, which is itself the point being demonstrated: nothing in the mathematics distinguishes "gravity" from "acceleration." The narrative difference (a force pulling the ball vs. no force on the ball but an accelerating floor) is explanatory framing for the tutor, not a second calculation.

`EquivalencePrincipleExperimentResult` holds `timeToFloorSeconds` and the acceleration (in both m/s² and g-multiples); the height-vs-time curve is computed on demand via `ballHeightAboveFloorAt` rather than stored as samples, following the pattern already established by Experiment 3's `movingClockStateAt`. Both are structured independently of any UI, per `CLAUDE.md` §9.

---

## Learner Controls

- **Acceleration**, presented in multiples of Earth's gravity `g` (≈ 9.8 m/s²) for intuitive units: presets **0.5g**, **1g**, **2g**, or **Other** (a custom value from 0.1g to 5g). The same value is used for both Scene A's gravity and Scene B's rocket acceleration.
- Initial ball height is fixed (proposed: 2 meters) and not a learner control, to keep the first experiment of this phase simple — open for the owner's review below.

---

## Prediction Activity

Before the cabins run, the learner is shown both sealed cabins (unlabeled interiors — just "Cabin A" and "Cabin B," with their difference described in the introduction, not visually revealed yet) and asked:

> If you were sealed inside each cabin and dropped a ball, do you think the ball would move differently in the two cabins, or exactly the same way?

Choices: "Differently" / "The same way." Not scored. The run control is disabled until a prediction is entered, matching Experiments 1–11.

---

## Experiment Behavior

### Introductory text (plain-language draft — for the owner's approval, `CLAUDE.md` §28.1)

> **The question.** Imagine you're sealed inside a windowless cabin — no windows, no way to look outside. You drop a ball. Could you tell, just from watching the ball fall, whether your cabin is sitting still on a planet, or racing through empty space with a rocket pushing it?
>
> **What happens.** We'll show you two cabins side by side. Cabin A sits on the ground, where gravity pulls the ball down. Cabin B is in deep space, far from any planet — nothing is pulling on it — but a rocket engine is pushing the cabin (and its floor) forward at a steady rate. In both cabins, someone drops a ball and we watch how it moves relative to the floor.
>
> **Your job.** Before you watch, predict: will the ball behave differently in the two cabins, or the same way?
>
> **What we assume.** Both cabins are idealized — no air, a single small ball, and a steady push or pull the whole time. This experiment doesn't use anything about light or moving clocks from earlier chapters; it's about gravity and acceleration, a fresh starting point.

### Display

Two cabins side by side, each showing the ball falling toward the floor, plus a shared graph of ball-height-above-floor vs. time with both scenes' curves overlaid. The graph draws progressively as the run plays, in step with the falling ball, with a marker at the current point; it stays on screen, fully drawn, after the run completes.

### Run

Both scenes animate simultaneously, using the same simulated-time-to-real-time playback approach as Experiments 1–11 (playback speed must not change the physical result, per `CLAUDE.md` §11).

---

## Results Display

- The chosen acceleration (shown in both `g`-multiples and m/s²).
- Time for the ball to reach the floor (identical in both scenes).
- The two height-vs-time curves, confirmed numerically identical.
- The learner's prediction, shown beside the actual result.
- A plain-language statement: from inside either cabin, watching only the ball, there is no experiment that tells you which cabin you're in.

---

## Expected Observations

1. For every tested acceleration, both scenes produce the same height-above-floor curve and the same time-to-floor.
2. Changing the acceleration changes both scenes' results identically and simultaneously.

---

## Expected Learner Understanding

The learner should be able to say: "A ball dropped in a cabin at rest under gravity, and a ball dropped in a cabin accelerating through space at the same rate, move in exactly the same way relative to their own cabin. Sealed inside, I couldn't tell the two situations apart using this experiment. This is the equivalence principle — it's the idea that first led Einstein to think gravity might not be an ordinary force, but something about the geometry of space and time itself."

---

## New Concepts Introduced

1. **The equivalence principle**, named and defined in plain language: being at rest in a gravitational field and accelerating with no gravity at all produce the same local effects, so a local experiment can't distinguish them.
2. **Local experiment**, defined in plain language: an experiment confined entirely inside the box, with no way to look outside and check directly.
3. **`g`**, Earth's gravitational acceleration, as a familiar unit for describing acceleration.

---

## Relationship to Previous Experiments

- Reuses the established predict → observe → explain structure and the "two scenarios shown side by side" presentation pattern from Experiments 3–11, now comparing gravity vs. acceleration instead of rest vs. motion.
- Deliberately introduces **no** special-relativity machinery (no `c`, no time dilation, no Lorentz transformation) — it is a fresh foundation for Phase 2, playing the same role for this phase that Experiment 1 played for "Relativity of Time and Motion."

## Relationship to Later Experiments

None approved. This experiment is expected to motivate a future experiment on gravitational time dilation (plausibly reusing this cabin setup with an Experiment-4-style light clock inside an accelerating cabin) and, eventually, curved spacetime. Those are not proposed or approved yet.

---

## Required Physics Tests

1. For a given `acceleration`, both scenes' `heightAboveFloor(t)` curves are identical at every sampled time (since both come from the same formula call).
2. `timeToFloor` matches `sqrt(2 * initialHeight / acceleration)` exactly.
3. Increasing `acceleration` decreases `timeToFloor`, and does so identically regardless of which "scene" the result is framed as.
4. `acceleration <= 0` is rejected or otherwise defined as an explicit edge case (the ball never reaches the floor) — the exact behavior should be decided during implementation and documented in the test.
5. Deterministic across repeated calls; independent of any UI or animation state.

---

## AI Tutor Behavior

Follows the predict → observe → explain pattern of Experiments 1–11:

- **Before the run:** helps the learner form a prediction; does not reveal the answer.
- **During the run:** silent.
- **After the run:**
  1. Observation: "Look at the two graphs. Are they the same, or different?"
  2. Prediction comparison: the learner's predicted outcome beside the actual one.
  3. Conceptual question: "If you were sealed inside one of these cabins with no windows, could you have figured out which one you were in, just from the ball?"
  4. Explanation: (1) the two scenes use the exact same formula — nothing in the math distinguishes gravity from acceleration; (2) this is the equivalence principle; (3) it is the observation that first led Einstein to suspect gravity is not an ordinary force but something about the shape of space and time — a question later experiments in this phase will take up.
  - The tutor must not explain *why* gravity and acceleration are equivalent in relativistic terms (curved spacetime, geodesics) — that is out of scope for this experiment and belongs to a later one.

---

## Decisions Needing Human Review

All six items below have been confirmed by the owner (2026-09-25).

1. **Title** — "The Equivalence Principle." Confirmed.
2. **Framing** — a sealed cabin with a rocket, following Einstein's classic thought experiment. Confirmed over the elevator alternative: the rocket-in-deep-space framing makes "no gravity acting at all" unambiguous, which is the exact contrast the experiment needs to isolate.
3. **Initial ball height** — fixed at 2 meters, not a learner control. Confirmed.
4. **Acceleration units** — multiples of `g` (0.5g/1g/2g/Other) rather than raw m/s². Confirmed.
5. **Scope** — stays strictly to the ball-drop comparison; no mention of orbit, weightlessness, or free fall as a separate idea. Confirmed.
6. **Sequencing** — Experiment 1 of "Gravity and Curved Spacetime," the opening experiment of that phase. Confirmed.

---

## Success Criteria

1. The physics model uses one shared formula for both scenes, with no independent "gravity version" and "acceleration version" of the calculation.
2. The learner predicts before the run; the run control requires a prediction.
3. The results make visible, numerically and visually, that both scenes produce identical motion.
4. The learner can state the equivalence principle in their own words after the tutor conversation.
5. No curved spacetime, geodesics, gravitational time dilation, or general relativity content appears — this experiment only establishes the puzzle.
