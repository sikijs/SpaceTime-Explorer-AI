# Gravity and Curved Spacetime — Experiment 3: Why Gravity Isn't Just Acceleration

**Status: built, complete-flow tested in a browser, and reviewed against this specification (`CLAUDE.md` §21 Steps 9–10).** Physics model, tests, interface, prediction, results panel, and AI tutor are built and wired into the guided journey (`src/physics/tidalEffectExperiment.ts`, `src/physics/tidalEffectExperiment.test.ts`, `src/components/TidalEffectExperiment.tsx`, `src/components/TidalEffectTutor.tsx`, `src/App.tsx`). See "Implementation Notes" below for what the review found and fixed. The owner's line-by-line wording approval (`CLAUDE.md` §28.1) is complete (2026-09-26), approved as written with no changes requested.

The direction (tidal effects, as the next step after gravitational time dilation) and the terminology decision (hold back "curvature"/"curved spacetime," name only "tidal effect" here) were confirmed by the owner during the Stage 1/2 proposal conversation on 2026-09-26, and the full draft specification was approved as-is on the same day.

## Implementation Notes

The final review against this specification (§21 Step 10) found and fixed three gaps:

1. **The introduction was missing a "Your job" paragraph.** This specification's own approved Introductory text (below) includes one, and `CLAUDE.md` §28.3 requires every experiment's introduction to state the learner's job. The original implementation jumped from "What happens" straight to "What we assume." Fixed: added "Watch both cabins and compare whether the two balls' distance changes in each one" — observation-focused rather than duplicating the prediction question, following the precedent set by Experiment 1's and Experiment 2's own "Your job" lines (the prediction itself is asked for explicitly in the separate "Make a prediction" section below).
2. **The introduction's "What we assume" list stated only two of this specification's four required assumptions** (Physical Situation section): idealization and the exaggerated control were present, but the first-order (tidal) approximation and the non-relativistic assumption were both missing, unlike Experiments 1 and 2's own introductions, which state their equivalent assumptions explicitly. Fixed: added "The convergence you'll see uses a simplified, first-order approximation, not the exact calculation" and "This experiment doesn't use anything about light, moving clocks, or speeds close to light from earlier chapters — it's about ordinary gravity and acceleration, like Experiment 1." The exaggerated-control bullet was also reworded to name "Convergence strength" directly, matching how Experiment 2's introduction names "strength" directly rather than describing the control only in general terms.
3. **The tutor's final explanation mentioned ocean tides twice, the second time with an added mechanism ("where the Moon's gravity pulls slightly differently on the near side and far side of the Earth"), exceeding Decision 7's "no mention of ocean tides beyond the single naming sentence."** Fixed: trimmed the tutor's point 4 to the bare naming sentence, matching the Results panel's own single mention.

The introduction and tutor text below reflect these fixes and are what is currently implemented. The owner reviewed this wording line by line and approved it as written (2026-09-26), with no changes requested.

A later, project-wide request (2026-09-29): a "Why even ask this" paragraph was added to the introduction, above, framing the question as testing the limits of Experiment 1's idealization. Approved by the owner as written (`CLAUDE.md` §28.1, 2026-09-29).

## Overview

Experiment 1 of this phase showed that a ball dropped in a cabin at rest on a planet, and a ball dropped in a cabin accelerating through deep space, move identically — the equivalence principle. Experiment 2 extended that same idea to clocks, showing gravitational time dilation.

Both of those experiments used a *small* sealed cabin, where the equivalence principle holds exactly. This experiment asks what happens if the cabin is wide enough that the difference between "gravity" and "acceleration" starts to show up even from inside the sealed box — without opening a window or leaving the cabin.

Two balls are dropped side by side, some distance apart, in each of the two Experiment 1 cabins. On the planet, the two balls drift slightly toward each other as they fall, because real gravity points toward the planet's center, and "toward the center" is a slightly different direction from each ball's own position. In the accelerating rocket, the two balls stay exactly the same distance apart, because the rocket's push is the same direction everywhere in the cabin. This convergence — called a **tidal effect** — is something a real gravitational field does that uniform acceleration cannot reproduce, no matter how the rocket accelerates. It is the first crack in the equivalence principle: proof that gravity is not *simply* acceleration in disguise, over a large enough region. This experiment does not yet say what gravity actually is; it only shows that something more than "acceleration" must be going on, which a later experiment will take up.

This experiment reuses Experiment 1's plain Newtonian kinematics — no relativity, no light, no clocks — and only adds one new idea: gravity's pull converges toward a center, while uniform acceleration does not.

---

## Learning Objective

After this experiment, the learner should understand:

1. Two balls dropped side by side in a cabin at rest on a planet slowly move toward each other as they fall, because gravity pulls each ball toward the planet's center, and the direction "toward the center" is not quite the same from two different horizontal positions.
2. Two balls dropped side by side in a cabin accelerating through deep space stay exactly the same distance apart, because the rocket pushes every part of the cabin in the same direction, with no "center" for it to point toward.
3. This means the equivalence principle from Experiment 1 only holds exactly for a cabin small enough (or a time short enough) that this convergence is too small to notice. A big enough cabin, or a long enough fall, can tell gravity and acceleration apart after all.
4. This convergence is called a **tidal effect** — the same kind of effect that raises ocean tides, caused by gravity pulling different parts of an object very slightly differently.
5. This experiment shows that something more than plain acceleration must be going on with real gravity, but it does not yet say what that something is — that is for a later experiment.

---

## Physical Situation

The two sealed, windowless cabins from Experiment 1, widened. Each cabin holds two identical balls, released from rest at the same height `y0` above the cabin floor, at simulated time `t = 0`, separated by a fixed horizontal distance `Δx` (one at `-Δx/2`, one at `+Δx/2` from the cabin's center line).

**Scene A — Gravity:** the cabin sits at rest on the surface of a planet. The planet's center is directly below the cabin, far enough away that the field is very nearly uniform — but not perfectly uniform. Each ball is pulled toward the planet's center, not straight "down" in one shared direction, so the two balls' fall lines converge very slightly as they drop.

**Scene B — Acceleration:** the cabin is in deep space, accelerated by a rocket engine at the same rate as Scene A's gravity. The push is exactly the same direction at every point in the cabin, so the two balls fall exactly parallel, staying `Δx` apart the whole time.

In both scenes, the learner watches the two balls' horizontal separation and their shared height above the floor.

### Simplifying assumptions (must be stated to the learner, in plain language)

- Both scenes are idealized: no air resistance, no friction, point-like balls, exactly as in Experiment 1.
- The convergence in Scene A is treated as a **first-order (tidal) approximation**: each ball's inward pull is computed once, from its starting position, and held constant over the short fall — not recomputed continuously as the ball's position changes. This mirrors the first-order approximation already used for gravitational time dilation in Experiment 2.
- The control the learner adjusts (see "Learner Controls") is an abstract, exaggerated stand-in for how large the cabin is compared to the planet's size, not a realistic ratio — with a real planet the size of Earth and a room-sized cabin, this convergence is far too small to see.
- This experiment is entirely non-relativistic, exactly like Experiment 1: no speeds approach `c`, and nothing here uses light, clocks, or any result from Experiments 1–11 of "Relativity of Time and Motion."

### Not introduced

The word "curvature" or "curved spacetime," geodesics, the exact (non-first-order) tidal formula, general relativity's field equations, or any connection to gravitational time dilation (Experiment 2) beyond both being consequences of real gravity. These are candidates for later experiments in this phase, not this one.

---

## Physics Model

Both scenes reuse Experiment 1's exact vertical fall formula for height above the floor (same `g`, same `y0`, identical in both scenes, for the same reason as Experiment 1 — nothing distinguishes the two scenes' vertical motion). The only new calculation is each ball's horizontal position, which is unchanged from its start in Scene B and drifts inward in Scene A.

```typescript
// src/physics/tidalEffectExperiment.ts
export function runTidalEffectExperiment(
  accelerationMetersPerSecondSquared: number,   // magnitude of g (Scene A) and a (Scene B); must be > 0
  initialHeightMeters: number,                  // y0, shared with Experiment 1's fixed value
  initialSeparationMeters: number,              // Δx, fixed cabin-width value, not a learner control
  convergenceStrength: number                   // dimensionless, exaggerated stand-in for Δx/(2·planetDistance); 0 < convergenceStrength < 1
): TidalEffectExperimentResult

export function ballPositionsAt(
  experiment: TidalEffectExperimentResult,
  elapsedSeconds: number,   // 0 <= elapsedSeconds <= experiment.timeToFloorSeconds
  scene: 'planet' | 'rocket'
): { heightAboveFloor: number; leftBallOffset: number; rightBallOffset: number }
```

```
heightAboveFloor(t)     = initialHeight - 0.5 * acceleration * t^2      (identical in both scenes; same formula as Experiment 1)
timeToFloor              = sqrt(2 * initialHeight / acceleration)        (identical to Experiment 1)

separation('rocket', t)  = initialSeparation                                                    (constant — no convergence)
separation('planet', t)  = initialSeparation * (1 - convergenceStrength * (t / timeToFloor)^2)  (shrinks toward 0)

leftBallOffset(scene, t)  = -separation(scene, t) / 2
rightBallOffset(scene, t) = +separation(scene, t) / 2
```

The planet scene's convergence is a first-order (tidal) approximation: `convergenceStrength` plays the role of the real, physical ratio `Δx / (2 · distance to planet's center)`, exaggerated to a visible size exactly as Experiment 2 exaggerated its `strength` control — the point again being honesty about the approximation, not a realistic ratio. `TidalEffectExperimentResult` holds `timeToFloorSeconds`, `initialSeparationMeters`, and `convergenceStrength`; positions are computed on demand via `ballPositionsAt`, following the pattern established by Experiment 1's `ballHeightAboveFloorAt` and Experiment 2's `tickCountAt`. Structured independently of any UI, per `CLAUDE.md` §9.

---

## Learner Controls

- **Acceleration**, in multiples of `g`, reusing Experiment 1's presets: **0.5g**, **1g**, **2g**, or **Other** (0.1g to 5g). Applies identically to both scenes' vertical fall, as in Experiment 1.
- **Convergence strength**, a new dimensionless control (same presentation pattern as Experiment 2's `strength`): presets **0.1**, **0.3**, **0.6**, or **Other** (0.02 to 0.9). Framed to the learner as "how much the planet's pull curves inward across the cabin," not as a real physical ratio — the introduction must say plainly this is exaggerated far beyond any real planet and cabin, so the effect can be seen at all.
- Initial height `y0` and initial separation `Δx` are fixed (proposed: 2 meters and 1 meter respectively, matching Experiment 1's fixed height), not learner controls, to keep the two new ideas (comparing scenes, and varying convergence strength) from being crowded by a third control — open for the owner's review below.

---

## Prediction Activity

Before the cabins run, the learner is shown both sealed cabins, each now containing two balls held apart at the same height, and asked:

> Two balls are dropped side by side in each cabin, the same distance apart. As they fall, do you think the two balls in either cabin will drift closer together, drift farther apart, or stay exactly the same distance apart?

Choices: "They'll drift together" / "They'll stay the same distance apart" / "They'll drift apart," asked once per cabin (or once for "the planet cabin" and once for "the rocket cabin" — see Decisions below). Not scored. The run control is disabled until both predictions are entered, matching Experiments 1–11.

---

## Experiment Behavior

### Introductory text (as implemented; not yet owner-approved line by line, `CLAUDE.md` §28.1)

> **The question.** In Experiment 1, you saw that a ball falls the same way whether your cabin sits still under gravity or accelerates through space. Does that stay true no matter how big the cabin is?
>
> **Why even ask this.** It's tempting to assume Experiment 1's result — that gravity and acceleration are indistinguishable — must hold no matter how big your sealed cabin is. But "idealized and small" was quietly doing a lot of work in that experiment. This experiment puts that assumption under more strain: two balls, dropped side by side instead of just one, watched closely for any change in how far apart they are.
>
> **What happens.** The same two cabins as before — one on the ground, one in deep space with a rocket — but now each cabin drops two balls side by side, the same distance apart, at the same time. We'll watch whether that distance changes as they fall.
>
> **Your job.** Watch both cabins and compare whether the two balls' distance changes in each one.
>
> **What we assume.**
> - Both cabins are idealized, just like Experiment 1.
> - The convergence you'll see uses a simplified, first-order approximation, not the exact calculation.
> - "Convergence strength" is an exaggerated stand-in for how big the cabin is compared to the planet — a real planet is so much bigger than any cabin that this effect is normally far too small to see, so here it's exaggerated so you can actually watch it happen.
> - This experiment doesn't use anything about light, moving clocks, or speeds close to light from earlier chapters — it's about ordinary gravity and acceleration, like Experiment 1.

### Display

Two cabins side by side, each showing two balls falling toward the floor with their horizontal separation visible, plus a shared graph of ball separation vs. time with both scenes' curves overlaid, drawn progressively as the run plays (same presentation pattern as Experiment 1's height-vs-time graph and Experiment 2's tick-count graph).

### Run

Both scenes animate simultaneously, using the same simulated-time-to-real-time playback approach as Experiments 1–11 (playback speed must not change the physical result, per `CLAUDE.md` §11).

---

## Results Display

- The chosen acceleration and convergence strength.
- Final separation in each scene (planet: shrunk; rocket: unchanged).
- The separation-vs-time graph for both scenes, confirming the planet's curve bends inward while the rocket's stays flat.
- The learner's predictions, shown beside the actual results, for both cabins.
- A plain-language statement: unlike Experiment 1's single ball, two balls spread apart reveal a difference between the two cabins after all — a real gravitational field pulls slightly differently from different places, something uniform acceleration cannot do.
- One sentence naming the effect: this convergence is called a tidal effect, the same kind of effect responsible for ocean tides.

---

## Expected Observations

1. In the rocket scene, the two balls' separation never changes, for every tested acceleration and convergence strength.
2. In the planet scene, the two balls' separation shrinks over the fall, for every convergence strength greater than 0.
3. Increasing convergence strength increases how much the planet scene's balls converge by the time they land.
4. The two scenes' height-above-floor curves remain identical throughout, exactly as in Experiment 1 — only the horizontal separation differs.

---

## Expected Learner Understanding

The learner should be able to say: "Two balls dropped side by side in a cabin resting on a planet drift slightly toward each other, because gravity pulls each one toward the planet's center, and that's a slightly different direction from two different spots. The same two balls dropped in an accelerating rocket stay exactly the same distance apart, because the rocket pushes every part of the cabin the same way. So a big enough cabin, or two balls far enough apart, actually can tell gravity and acceleration apart — the equivalence principle only holds exactly for a small enough cabin. This convergence is called a tidal effect, and it means something more than plain acceleration is going on with real gravity."

---

## New Concepts Introduced

1. **Tidal effect**, named and defined in plain language: gravity pulling slightly differently on different parts of an object because it points toward a center, not in one shared direction — the same effect behind ocean tides.
2. A refinement of the equivalence principle from Experiment 1: it holds only locally (a small enough cabin, or a short enough time), not for an arbitrarily large region.

---

## Relationship to Previous Experiments

- Directly extends Experiment 1: reuses its two cabins and its exact vertical-fall formula unchanged, adding only a horizontal-separation calculation.
- Revisits Experiment 1's central claim (gravity and acceleration are locally indistinguishable) and sharpens it: "locally" is now shown to be doing real work, not a throwaway qualifier.
- Reuses the "abstracted, exaggerated control" pattern from Experiment 2's `strength` (and Experiments 3–6's velocity controls) for `convergenceStrength`, for the same stated reason: the real effect is unobservably small at human scales.
- Does not build on Experiment 2 (gravitational time dilation) directly — this experiment's tidal effect and Experiment 2's redshift are two separate consequences of real gravity, not one derived from the other. The tutor should not imply a dependency that isn't there.

## Relationship to Later Experiments

None approved. This experiment is expected to motivate a later experiment that names and explains **curved spacetime** itself — the idea that this tidal "pulling apart/together" is what it means for spacetime to be curved, and that a uniformly accelerating (flat-spacetime) frame can never fully reproduce it. Not proposed or approved yet.

---

## Required Physics Tests

1. `separation('rocket', t)` equals `initialSeparation` exactly, for every `t` and every `convergenceStrength`.
2. `separation('planet', t)` is strictly less than `initialSeparation` for every `t > 0` and every `convergenceStrength > 0`.
3. `separation('planet', experiment.timeToFloorSeconds)` decreases (converges more) as `convergenceStrength` increases, for a fixed `t`.
4. `heightAboveFloor(t)` is identical between `'planet'` and `'rocket'` for every `t`, matching Experiment 1's formula exactly.
5. `convergenceStrength <= 0` or `convergenceStrength >= 1` is rejected or otherwise defined as an explicit edge case — exact behavior decided during implementation and documented in the test.
6. Deterministic across repeated calls; independent of any UI or animation state.

---

## AI Tutor Behavior

Follows the predict → observe → explain pattern of Experiments 1–11:

- **Before the run:** helps the learner form both predictions; does not reveal the answer.
- **During the run:** silent.
- **After the run:**
  1. Observation: "Look at the two separation graphs. In which cabin did the balls' distance change?"
  2. Prediction comparison: the learner's predicted outcomes beside the actual ones, for both cabins.
  3. Conceptual question: "The rocket pushes every part of the cabin the same way. Why might a real planet not do that?"
  4. Explanation: (1) a real planet's gravity points toward its center, so two separated balls are pulled in very slightly different directions, and drift together as they fall; (2) a rocket's push has no center to point toward, so it can never do this, no matter how it accelerates; (3) this means the equivalence principle from Experiment 1 only holds exactly for a small enough cabin — a big enough one reveals the difference; (4) this convergence is called a tidal effect — the same kind of effect responsible for ocean tides (a bare naming sentence only, per Decision 7 — no further mechanism explanation).
  - The tutor must not use the words "curvature" or "curved spacetime," or connect this effect to Experiment 2's gravitational time dilation — out of scope for this experiment.

---

## Decisions Needing Human Review

All eight items below have been confirmed by the owner (2026-09-26).

1. **Direction** — tidal effects (two balls converging vs. staying parallel) as the mechanism for showing the equivalence principle's limits. Confirmed.
2. **Terminology** — hold back "curvature"/"curved spacetime," name only "tidal effect" here. Confirmed.
3. **Title** — "Why Gravity Isn't Just Acceleration" (working title). Confirmed as-is.
4. **Physics model** — the first-order (fixed-at-start-position) tidal approximation, with `convergenceStrength` as a single abstracted dimensionless control standing in for `Δx / (2 · planetDistance)`, rather than a full continuously-recomputed radial-gravity simulation. Confirmed.
5. **Fixed initial height and separation** — 2 meters and 1 meter, neither a learner control. Confirmed.
6. **Prediction structure** — one prediction per cabin (two total), rather than a single combined "which cabin, if any, changes" question. Confirmed.
7. **Scope** — no connection drawn to Experiment 2's gravitational time dilation, and no mention of ocean tides beyond the single naming sentence. Confirmed.
8. **Sequencing** — Experiment 3 of "Gravity and Curved Spacetime," following gravitational time dilation. Confirmed.

---

## Success Criteria

1. The physics model reuses Experiment 1's vertical-fall formula unchanged in both scenes, with exactly one new calculation (horizontal separation) distinguishing them.
2. The learner predicts before the run, for both cabins; the run control requires both predictions.
3. The results make visible, numerically and visually, that the rocket scene's separation never changes while the planet scene's does.
4. The learner can state, in their own words, that the equivalence principle only holds for a small enough cabin, and name the tidal effect as the reason.
5. The introduction and tutor state plainly that `convergenceStrength` is an exaggerated stand-in, not a realistic ratio.
6. No mention of "curvature," "curved spacetime," geodesics, or general relativity's field equations — this experiment only shows the equivalence principle's limit.
