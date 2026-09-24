# Experiment 11: The Rod's Own Axes

**Status: APPROVED by the project owner.** All items under "Decisions Needing Human Review" are resolved.

**Implementation: built and tested.** The physics model (`lorentzTransform`, `rodTimeAxisFor`, `rodSpaceAxisFor`, and the `timeDilationFactorFor` refactor of `movingClockExperiment.ts`), physics tests, interface, prediction, results panel, and AI tutor are all built (`src/physics/lorentzTransform.ts`, `src/physics/spacetimeDiagramView.ts`, `src/components/Experiment11.tsx`, `src/components/Experiment11Tutor.tsx`). It has had its complete-flow test in a browser (`CLAUDE.md` §21 Step 9) and its final review against this specification (§21 Step 10; no gaps found). The chapter's "What you learned" summary in `src/App.tsx` has the owner's approval; the introduction and tutor wording drafted below have not yet had the owner's line-by-line approval (`CLAUDE.md` §28.1).

## Overview

Experiment 7 told the learner, in numbers, that a flash released from the center of a moving rod reaches both ends at the same time in the rod's own frame, but not in the lab frame. Experiment 8 drew that whole situation as a spacetime diagram, in the lab frame only. Experiment 9 added one line to that diagram: the rod's own "same moment" line, showing geometrically that it's tilted, not flat.

Experiment 11 completes that picture. It draws the rod's own **two** axes — its own time direction and its own "now" direction — on the very same diagram, both tilted (by an amount that depends on speed). Then it uses the actual mathematical rule for converting between the lab's numbers and the rod's own numbers — the **Lorentz transformation** — to compute the real coordinates the rod's own frame would assign to the two flash-arrival events. The payoff: transforming both events gives the *same* time in the rod's frame, confirming by direct calculation exactly what Experiments 7 and 9 already showed by other means.

Unlike Experiments 7–10, this experiment introduces genuinely new physics: the Lorentz transformation itself. Everything else in it (the two new axis lines, the reused rod-and-flash scenario) is pure reuse or pure geometry, following the established pattern.

---

## Learning Objective

After this experiment, the learner should understand:

1. The rod's own frame has its own two axes on the same page as the lab's diagram — its own time direction and its own "now" direction — both tilted relative to the lab's, by an amount that depends on the rod's speed.
2. There is an actual mathematical rule — the Lorentz transformation — for converting an event's lab-frame position and time into the position and time the rod's own frame would assign to that same event.
3. Applying that rule to the two flash-arrival events gives the same time for both, in the rod's frame — confirming, by direct calculation, the same fact Experiment 7 gave in numbers and Experiment 9 gave as a picture.
4. Nothing physically new is happening here. It's the same two events, the same rod, the same flash — just measured using the rod's own ruler-and-clock convention instead of the lab's.
5. This ties together the entire sequence: Experiment 7 gave two numbers, Experiment 8 turned them into a picture, Experiment 9 added one line, and Experiment 11 supplies the actual mathematical bridge connecting the lab's numbers to the rod's own.

---

## Physical Situation

### Reused from Experiments 6, 7, 8, and 9

The same rod (rest length `L0 = 0.5` light-second) moving along its own length at a chosen speed `v`, with a flash released from its exact center — identical setup, no changes. `backEvent` and `frontEvent` are exactly the points already computed by `spacetimeDiagramFor` (`src/physics/spacetimeDiagramView.ts`).

### What is new

1. **Two new axis lines** (pure geometry, no new physics — see Physics Model): the rod's own time axis and its own space axis, both drawn through the origin (the flash-release event) on the existing diagram.
2. **The Lorentz transformation** (genuinely new physics): a function that converts any event's lab-frame `(position, time)` into the `(position, time)` the rod's own frame would assign to it.

### Simplifying assumptions (all must be stated to the learner, in plain language)

- Flat spacetime: no gravity, constant velocity only (same as Experiments 3–10).
- Everything is still the same rod-and-flash scenario from Experiments 6–9 — nothing about the setup changes.
- The two events being transformed are exactly the ones already computed in Experiment 7 — nothing about them is recalculated independently before the transformation is applied.

### Not introduced

γ as a formally named quantity (the owner chose to keep using Experiment 3's already-familiar "time dilation factor," reused by division, instead of introducing a new symbol — see Decisions Needing Human Review), a fully calibrated tick-marked coordinate grid along the new axes (the owner chose the lighter two-plain-lines version — see Decisions Needing Human Review), numeric primed coordinates for anything beyond the two already-known events, general relativity, curved spacetime, and any scenario beyond this same rod-and-flash setup.

---

## Physics Model

### New: the Lorentz transformation

```typescript
// src/physics/lorentzTransform.ts
export function lorentzTransform(event: WorldlinePoint, velocity: number): WorldlinePoint
```

```
timeDilationFactor = (Experiment 3's own factor, reused — see implementation note below)
gammaFactor = 1 / timeDilationFactor
time'     = gammaFactor * (time - velocity * position)
position' = gammaFactor * (position - velocity * time)
```

This is the first experiment to introduce a new relativistic formula rather than only reusing existing results. It must be tested rigorously on its own terms (see Required Physics Tests), including a direct cross-check against Experiment 7's already-established, human-approved result — not just internal self-consistency.

**Implementation note:** to avoid duplicating the `√(1 − v²)` formula that already lives in `src/physics/movingClockExperiment.ts` (Experiment 3), the plan is to extract it into a small, additional exported helper there (e.g. `timeDilationFactorFor(velocity)`), used by both the existing `runMovingClockExperiment` and this new function. This is a non-behavior-changing refactor of previously-approved code — Experiment 3's own function, tests, and results are unaffected — but it does touch an already-reviewed file, so it's called out here explicitly rather than done silently.

### New: two axis lines (pure geometry, no new physics)

Added to `src/physics/spacetimeDiagramView.ts`, alongside Experiment 9's `sameMomentLineFor`:

```typescript
export function rodTimeAxisFor(diagram: SpacetimeDiagramData): [WorldlinePoint, WorldlinePoint]
export function rodSpaceAxisFor(diagram: SpacetimeDiagramData): [WorldlinePoint, WorldlinePoint]
```

- `rodTimeAxisFor`: the worldline of the rod's own spatial origin (its center) — parallel to the rod's already-drawn back/front worldlines (same velocity), but passing through the origin `(position 0, time 0)`, the flash-release event.
- `rodSpaceAxisFor`: the rod's own line of "now" through the origin — same slope (`v`, time-over-position) as Experiment 9's `sameMomentLineFor`, but anchored at the origin instead of at `backEvent`/`frontEvent`.

Both derive their slope from data `spacetimeDiagramFor` already computed (the existing worldlines' own slope) — no velocity is passed in separately, and no independent formula is introduced, matching the pattern already established by `sameMomentLineFor`.

---

## Learner Controls

- **Speed of the rod:** same presets and range as Experiments 6–9 — 0c (at rest), 0.1c, 0.3c, 0.5c, 0.8c, or Other from 0.01c to 0.9c. Unlike Experiment 10, `v = 0` is meaningful and useful here (the Lorentz transformation reduces to the identity, a clean baseline check).
- No other controls.

---

## Prediction Activity

Before the transformed coordinates are revealed, the learner is shown the plain Experiment 8/9 diagram for their chosen speed, then asked:

> Experiment 7 told you the flash reaches the back end and the front end at different times, according to the lab. If we calculate the actual time each event happens *in the rod's own frame*, using the real math for converting between frames, what do you expect: will the two events come out at the same time, or at different times?

Choices: "Same time" / "Different times". Not scored. The reveal control is disabled until a prediction is entered, matching Experiments 1–10.

---

## Experiment Behavior

### Introductory text (plain-language draft — for the owner's approval, `CLAUDE.md` §28.1)

> **The question.** Experiment 9 showed you a tilted line — the rod's own idea of "the same moment" — but that line, by itself, doesn't tell you the actual numbers. Is there a real mathematical rule for converting the lab's numbers into the rod's own numbers, for any event?
>
> **There is: it's called the Lorentz transformation.** It's a rule that takes an event's position and time, as measured in the lab, and calculates the position and time that someone moving along with the rod would measure for that exact same event. It doesn't change what happened — it just translates the description from one point of view into the other, the way converting kilometers to miles doesn't change a distance, only how it's written down.
>
> **What you're about to do.** We're going to draw two new lines on the diagram — the rod's own time direction and its own "now" direction, both tilted — and then use the Lorentz transformation to calculate the rod's own numbers for the two events from Experiment 7. Before we do, make a prediction: using this real calculation, will the two events come out at the same time in the rod's frame, or different times?
>
> **What we assume.** Everything here is still the same rod-and-flash scenario from Experiments 6 through 9 — nothing about the setup changes. We're only adding two new lines to the picture and calculating two new numbers.

### Display

The Experiment 8/9 diagram, unchanged, plus:

- The rod's own time axis and space axis, each in a color visually distinct from the rod's black worldlines, the light's gold dashed lines, and Experiment 9's purple same-moment line.
- The two new axes appear only after the learner's prediction is submitted and the diagram is revealed, matching Experiment 9's reveal timing.
- At `v = 0`, both new axes coincide with the lab's own axes (vertical and horizontal), the same baseline-check pattern used throughout Experiments 6–9.

### Run

Static, like Experiments 8–10: the full diagram and the transformed numbers appear at once after the reveal control is pressed. No animation.

---

## Results Display

- Rod speed.
- `backEvent` and `frontEvent`'s lab-frame position and time (already shown in Experiment 8/9's style).
- `backEvent` and `frontEvent`'s **rod-frame** position and time, from the Lorentz transformation.
- A plain-language confirmation line: both events happen at the same time in the rod's frame — matching the value Experiment 7 already gave (`rodFrameEventTime`).
- The learner's prediction, shown beside the actual result.

---

## Expected Observations

1. At every tested speed, the two events' transformed times are equal to each other, and equal to Experiment 7's own `rodFrameEventTime` value.
2. At `v = 0`, the transformation changes nothing: the rod-frame numbers equal the lab-frame numbers, and both new axes are vertical/horizontal, matching the lab's own.
3. At `v > 0`, both new axes are visibly tilted, and the rod's own space axis (through the origin) is parallel to Experiment 9's purple same-moment line (through the two events) — they share the same slope, just at different positions.

---

## Expected Learner Understanding

The learner should be able to say: "The rod has its own two axes on the same diagram as the lab's, both tilted. There's an actual mathematical rule — the Lorentz transformation — for converting the lab's numbers for an event into the rod's own numbers. When I use it on the two flash-arrival events, I get the same time for both, in the rod's frame — confirming, by direct calculation, what Experiment 7 and Experiment 9 already showed. Nothing physically changed; it's just a different, equally valid way of describing the same two events."

---

## New Concepts Introduced

1. **The Lorentz transformation**, named and defined in plain language: a rule for converting an event's position and time, as measured in the lab, into the position and time someone in a different, moving frame would measure for that very same event.
2. That each reference frame has its own pair of axes on the same diagram — informally, its own point of view drawn right on the lab's own picture — tilted relative to the lab's, depending on how fast it's moving.

---

## Relationship to Previous Experiments

- **Experiment 3 (moving clock):** its time dilation factor is reused, by division, inside the Lorentz transformation — no new symbol, no duplicated formula.
- **Experiment 6 (length contraction):** the rod's rest length (`REST_LENGTH`) is what the transformed `backEvent`/`frontEvent` positions should reduce to (±half of it) when checked against the rod's own worldlines — see Required Physics Tests.
- **Experiment 7 (relativity of simultaneity):** its `rodFrameEventTime` is the exact value the new transformation must reproduce for both events — the central cross-check of this experiment's new physics.
- **Experiment 8 (drawing spacetime) and Experiment 9 (same time, different line):** their diagram and its purple same-moment line are reused unchanged; this experiment adds two more lines to the same picture.

## Relationship to Later Experiments

None approved. A fully calibrated, tick-marked coordinate grid along the new axes (a genuine "read the rod's own coordinates directly off the diagram" experience) remains a candidate for a still-later experiment, as does applying a similar treatment to the Experiment 3/4 moving-clock diagram (per Experiment 8's own Decision 4). After this experiment, "Relativity of Time and Motion" is complete, and the project moves to "Gravity and Curved Spacetime."

---

## Required Physics Tests

### `lorentzTransform` (new physics — tested rigorously)

1. At `v = 0`: the transformation is the identity, for arbitrary test events.
2. **Interval invariance**, for arbitrary test events and speeds: `time'² − position'²` equals `time² − position²` — the fundamental correctness check of any valid Lorentz transformation.
3. **Cross-check against Experiment 7**: transforming `backEvent` and `frontEvent` (from `spacetimeDiagramFor(runSimultaneityExperiment(v))`) gives equal transformed times for both, and that time equals Experiment 7's own `rodFrameEventTime` exactly, for every tested speed.
4. **Cross-check against Experiment 6**: transforming the rod's own back and front worldline endpoints gives a constant transformed position at each end (the rod doesn't move in its own frame), equal to `∓REST_LENGTH / 2`.
5. Deterministic across repeated calls.

### `rodTimeAxisFor` / `rodSpaceAxisFor` (pure geometry)

6. Both pass through the origin, for every tested speed including `v = 0`.
7. `rodTimeAxisFor`'s slope (position-over-time) equals the rod's own worldline slope (`v`) exactly.
8. `rodSpaceAxisFor`'s slope (time-over-position) equals `v` exactly — the same slope as Experiment 9's `sameMomentLineFor`, confirmed by direct comparison.
9. Deterministic across repeated calls; independent of any UI or animation state.

---

## AI Tutor Behavior

Follows the pattern of Experiments 3–10: no pre-run step beyond helping with the prediction, each step after the reveal needs a typed answer, plain language throughout.

- **After the transformed numbers are revealed:**
  1. Observation: "Look at the two calculated times in the rod's frame. Are they the same, or different?"
  2. Prediction comparison: the learner's predicted outcome beside the actual one.
  3. Conceptual question: "Why do you think the calculation gives the same time for both events in the rod's frame, even though the lab clock said they happened at different times?"
  4. Explanation, tied to what's on screen: (1) the calculation confirms exactly what Experiments 7 and 9 already showed — not a new physical fact, but a new, more precise way of confirming it; (2) the two new tilted lines are the rod's own version of "straight up" (time) and "straight across" (space) — its own natural axes, the same way the lab's vertical and horizontal lines are the lab's; (3) nothing physical changed — same two events, same rod, just described using the rod's own ruler-and-clock convention instead of the lab's; (4) this ties the whole sequence together: Experiment 7 gave numbers, Experiment 8 made a picture, Experiment 9 added one line, and this calculation is the actual bridge connecting the lab's numbers to the rod's own.
  - The tutor must not introduce γ by name, a calibrated coordinate grid, or general relativity; those are outside this specification.

---

## Decisions Needing Human Review

Resolved by the project owner during Stage 1/2 of this proposal (see `CLAUDE.md` §23):

1. **Visual/mathematical depth — resolved.** Two plain tilted axis lines through the origin, plus a results table with the two events' numeric rod-frame coordinates. No calibrated tick-marked grid (deferred as a later candidate).
2. **γ vs. reused time dilation factor — resolved.** No new symbol introduced; the transformation reuses Experiment 3's existing time dilation factor by division.
3. **Title — resolved.** "The Rod's Own Axes."

4. **Keep Experiment 9's purple same-moment line — resolved.** It stays on screen alongside the two new axes, showing for free that it is parallel to the new rod-space-axis (same slope `v`, different position — both represent "the rod's now," at different moments).
5. **The `movingClockExperiment.ts` refactor — resolved.** Extracting the `√(1 − v²)` formula into a small, additional exported helper (reused by both the existing `runMovingClockExperiment` and the new Lorentz transform) is approved. Experiment 3's own behavior, results, and tests remain unaffected.

---

## Success Criteria

1. The Lorentz transformation is tested rigorously on its own terms (interval invariance) and cross-checked directly against Experiments 6 and 7's already-established, approved results — not merely internally self-consistent.
2. The two new axis lines are pure geometry, derived from data `spacetimeDiagramFor` already computes, with no independently duplicated formula.
3. The learner predicts before seeing the transformed result; the reveal control requires a prediction.
4. The results make visible, via direct calculation, that the two events are simultaneous in the rod's frame — the same fact Experiments 7 and 9 already established by other means.
5. The learner can describe, in their own words, what the Lorentz transformation does and why applying it here confirms rather than changes what was already known.
6. No γ by name, no calibrated coordinate grid, and no general relativity is introduced.
