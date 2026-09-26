# Experiment 8: Drawing Spacetime

**Status: APPROVED by the project owner.** The defaults proposed under "Decisions Needing Human Review" stand. The title is a working title (see Decision 5).

**Implementation: complete.** Physics view layer (`src/physics/spacetimeDiagramView.ts`), interface (`src/components/Experiment8.tsx`), prediction, results panel, and tutor (`src/components/Experiment8Tutor.tsx`) are in place, following the design below. It has had its complete-flow test and its final review against this specification (§21 Step 10; two gaps found there — a missing assumption bullet and unlabeled diagram events — were fixed). The owner's line-by-line wording approval (§28.1) was explicitly skipped, not granted.

## Overview

Experiments 3, 6, and 7 each computed a relativistic effect as a set of numbers: a moving clock's tick duration (time dilation), a rod's contracted length (length contraction), and two event times that disagree between frames (relativity of simultaneity). Each experiment showed its own result on its own, separate display.

Experiment 8 does not introduce a new physical effect. It introduces a new **way of looking at** the results the learner already produced in Experiment 7: a **spacetime diagram**, with position on one axis and time on the other, where a still object is a vertical line, a moving object is a slanted line, and a flash of light is a line at a fixed slope. The learner sees the same rod, the same flash, and the same two events from Experiment 7 — this time drawn as a single picture instead of two numbers.

This was raised as a candidate direction after Experiment 6 (alongside length contraction and a "twin journey" idea; see `06-length-contraction.md` Overview) and reaffirmed as a candidate after Experiment 7 (`07-relativity-of-simultaneity.md`, "Relationship to Later Experiments"). The project owner has confirmed this experiment should stay in the **lab frame only**: it does not draw the rod's own reference frame as a second, tilted set of axes, and it introduces no Lorentz transformation. That remains a possible later experiment, not part of this one.

---

## Learning Objective

After this experiment, the learner should understand:

1. A spacetime diagram plots an event as a point: one axis for position, one axis for time.
2. An object that is not moving is a vertical line on the diagram (its position never changes). An object moving at a steady speed is a slanted line, called a **worldline**.
3. Because light always travels at `c` in the lab (Experiment 5), a flash of light is a worldline at a fixed slope on every diagram drawn this way — the same slope regardless of the rod's speed.
4. The two events from Experiment 7 (the flash reaching the back end, then the front end) are the points where the rod's worldlines cross the light's worldlines. The diagram makes it visible, without recomputing anything, why the back end is reached first: its worldline leans toward the flash, so it meets the light sooner.
5. This is the same result as Experiment 7, seen a different way — geometry and the numbers agree.

---

## Physical Situation

### Reused from Experiments 6 and 7

The same rod (rest length `L0 = 0.5` light-second), moving along its own length at a chosen speed `v`, with a flash released from its exact center. No new physical setup is introduced.

### What is new

Only the **display**: instead of two side-by-side panels showing values at a moment in time (Experiment 7's approach), Experiment 8 shows one static diagram with position on the horizontal axis and time on the vertical axis (time increasing upward, the standard convention — see Decision 2), covering the whole run from the flash to the later of the two events.

### Simplifying assumptions (all must be stated to the learner)

- Everything is drawn in the **lab's** reference frame only. The rod's own frame is not drawn as a separate set of axes in this experiment.
- Flat spacetime: no gravity, no acceleration, constant velocity only (same as Experiments 3–7).
- Light travels at the same speed `c` in the lab in both directions (Experiment 5), reused without re-derivation.
- The rod's length, seen from the lab, is `L0 · √(1 − v²/c²)` (Experiment 6's length contraction), reused without re-derivation.
- The flash is released from the exact center of the rod, as in Experiment 7.

### Not introduced

The Lorentz transformation, the rod's own frame as tilted axes, the invariant spacetime interval, light cones as a general concept (only the two specific light worldlines from this rod's flash are drawn), and any experiment beyond this rod-and-flash scenario (e.g., a diagram of the Experiment 3/4 moving clock is not part of this proposal — see Decision 4).

---

## Physics Model

No new physical calculation. This experiment adds a small, tested **view** layer that packages Experiment 7's already-computed results into plottable lines and points — it must not recompute or duplicate any physics, only reuse it.

Proposed structure (working name `src/physics/spacetimeDiagramView.ts`):

```typescript
interface WorldlinePoint {
  position: number // light-seconds
  time: number      // seconds
}

interface SpacetimeDiagramData {
  backWorldline: [WorldlinePoint, WorldlinePoint]   // from t = 0 to the run's end
  frontWorldline: [WorldlinePoint, WorldlinePoint]
  leftLightWorldline: [WorldlinePoint, WorldlinePoint]  // flash traveling toward the back end
  rightLightWorldline: [WorldlinePoint, WorldlinePoint] // flash traveling toward the front end
  backEvent: WorldlinePoint   // where leftLightWorldline meets backWorldline
  frontEvent: WorldlinePoint  // where rightLightWorldline meets frontWorldline
}

function spacetimeDiagramFor(result: SimultaneityResult): SpacetimeDiagramData
```

`spacetimeDiagramFor` derives every value directly from `runSimultaneityExperiment`'s existing `SimultaneityResult` (`src/physics/relativityOfSimultaneityExperiment.ts`) — it takes no independent inputs and performs no relativistic calculation of its own, only geometry (straight-line endpoints from already-known positions, times, and velocity).

---

## Learner Controls

- **Speed of the rod:** same presets and range as Experiments 6–7 — 0c (at rest), 0.1c, 0.3c, 0.5c, 0.8c, or Other from 0.01c to 0.9c.
- No duration or length control: the diagram always covers from the flash (`t = 0`) to the later of the two events, as in Experiment 7.
- Unlike Experiments 1–7, there is no playback/animation — the diagram is drawn complete, since the point of this experiment is to see the whole history as one picture rather than watch it unfold. (Flagged for confirmation — see Decision 3.)

---

## Prediction Activity

Before seeing the diagram, the learner sees the same scenario as Experiment 7 (reusing its wording) and this question:

> Here is a spacetime diagram: position goes across, time goes up. A line that leans over means something moving. A flash of light is released from the middle of the rod and travels outward in both directions. **On the diagram, which worldline will the light cross first: the rod's back end, or its front end — or will it cross both at the same time?**

Choices: "The back end's worldline" / "The front end's worldline" / "Both at the same time". Not scored. START is disabled until a prediction is entered, as in Experiments 1–7.

(This mirrors Experiment 7's Part 1 prediction, reframed geometrically. Experiment 7's Part 2, about the rod's own point of view, does not apply here since that frame is not drawn — see Decision 1.)

---

## Experiment Behavior

### Introductory text

Before the learner predicts, plain-language text explains (wording to be drafted for the owner's approval, `CLAUDE.md` §28.1):

- The question: is there a way to see everything from Experiment 7 in one picture, instead of two numbers?
- What a spacetime diagram is: position across, time up; a point is an **event** (the same word introduced in Experiment 1, now given a place as well as a moment); a straight line is a **worldline**, the history of something moving at a steady speed.
- That light's worldline always has the same slope, because light always travels at `c` in the lab (Experiment 5) — so every flash in this experiment looks the same on the diagram, no matter the rod's speed.
- What is being done: the same rod and flash as Experiment 7, drawn instead of computed.
- The learner's job and the assumptions, including that only the lab's frame is drawn here.

### Display

One diagram: position on the horizontal axis, time on the vertical axis. Drawn on it:

- The rod's back-end and front-end worldlines, from `t = 0` to the end of the run.
- The two light worldlines from the flash, drawn as straight lines at a fixed slope (the same visual slope at every rod speed, since `c` is constant).
- The two events, marked where light meets each worldline, labeled with their lab times (matching Experiment 7's values exactly).
- A `v = 0` baseline (reachable via the 0c preset) where both worldlines are vertical and both events sit at the same height (same time).

### Run

Static: the whole diagram for the chosen speed appears at once after START. No animation or playback (see Decision 3).

---

## Results Display

After the diagram appears, show values only, neutrally (Predict → Experiment → Observe → Explain), matching Experiment 7's numbers exactly since no new calculation is introduced:

- The rod's length in the lab at this speed (reused from Experiment 6).
- Both events' lab times (reused from Experiment 7).
- The learner's prediction, shown beside which worldline the diagram shows crossing first.

---

## Expected Observations

1. At `v = 0`, both worldlines are vertical and both events line up at the same height.
2. At `v > 0`, the back end's worldline leans toward the incoming light and crosses it lower on the diagram (earlier); the front end's worldline leans away and crosses higher (later).
3. Both light worldlines keep the same slope regardless of the rod's speed.
4. The event times read off the diagram match the numbers already seen in Experiment 7.

---

## Expected Learner Understanding

The learner should be able to say: "A spacetime diagram shows position and time together. Something moving is a slanted line; light is always the same slant. I can see on the diagram why the back end lights up first when the rod moves — its line leans toward the flash — without needing to recompute anything. It's the same answer as Experiment 7, just drawn."

---

## New Concepts Introduced

1. **Spacetime diagram**: a plot with position on one axis and time on the other.
2. **Worldline**: the path an object traces on a spacetime diagram as time passes; a straight worldline means steady motion.
3. The geometric meaning of light's constant speed: always the same slope on the diagram, whatever the rod's speed — a visual restatement of Experiment 5.
4. **Event**, extended: Experiment 1 introduced an event as a moment in time; here an event is also a place — a single point on the diagram.

---

## Relationship to Previous Experiments

- **Experiment 1:** introduced the word "event" for a moment in time; this experiment extends it to a point in space and time.
- **Experiment 5:** established that light travels at `c` in the lab regardless of source motion — shown here as a fixed slope.
- **Experiment 6:** established length contraction, reused without re-derivation for the rod's worldline positions.
- **Experiment 7:** established the two events and their lab-frame times; this experiment draws them rather than recomputing them.

## Relationship to Later Experiments

None approved. A version of this diagram that also draws the rod's own frame as tilted axes (requiring the Lorentz transformation) is a candidate for a later experiment, not part of this proposal. A similar diagram for the Experiment 3/4 moving clock (showing time dilation geometrically) is also a candidate, not part of this proposal (see Decision 4).

---

## Required Physics Tests

1. `spacetimeDiagramFor` never recomputes a relativistic value; every position, time, and slope it returns is traceable to `runSimultaneityExperiment`'s result or to the rod's velocity, with no independent formula duplicated.
2. At `v = 0`: both worldlines are vertical (constant position over time) and both events occur at equal height (equal time).
3. For every tested `v > 0`: the back worldline's slope equals `v`, the front worldline's slope equals `v`, and both light worldlines have slope exactly `1` (in units where `c = 1`) in their respective directions.
4. The two marked events match `backEventLabTime`/`frontEventLabTime` and their corresponding positions from `runSimultaneityExperiment`, at every tested speed.
5. Deterministic across repeated calls; independent of any UI or animation state; sweep over every allowed speed in 0.01 steps, matching Experiments 6–7's test coverage pattern.

---

## AI Tutor Behavior

Follows the pattern of Experiments 3–7. No pre-run step, silent during the run (there being no animation, this means silent until the diagram is shown), each step after needs a typed answer.

- **After the diagram appears:**
  1. Observation: "Look at the diagram. Which worldline does the light reach first?"
  2. Prediction comparison: the learner's predicted worldline beside the actual one, with the two event times from the diagram.
  3. Conceptual question: "Why does the back end's worldline meet the light sooner, just from looking at the picture — without recalculating anything?"
  4. Explanation, using the diagram's own numbers: (1) a worldline that leans toward the flash covers less distance to the meeting point; (2) light's worldline always has the same slope, so a leaning worldline reaches it sooner; (3) this is the same result as Experiment 7 — relativity of simultaneity — now seen as a fact about the geometry, not just a calculation; (4) this way of drawing events and motion together is called a **spacetime diagram**.
  - The tutor must not introduce the Lorentz transformation, the rod's own frame's axes, or the invariant interval; those are outside this specification.

---

## Decisions Needing Human Review

All resolved by the project owner; the implementation should follow the defaults proposed above unless noted otherwise.

1. **Scope: lab frame only — resolved.** This experiment does not draw the rod's own frame as tilted axes, and introduces no Lorentz transformation.
2. **Axis convention — resolved.** Position horizontal, time vertical (increasing upward), the standard convention for these diagrams.
3. **No animation/playback — resolved.** The diagram is drawn complete rather than animated.
4. **Single diagram only — resolved.** This experiment covers only the Experiment 6/7 rod-and-flash scenario. A diagram for the Experiment 3/4 moving clock is not included here and would be a separate, later experiment if wanted.
5. **Title — resolved.** Kept as the working title, "Drawing Spacetime."
6. **Prediction form — resolved.** A single three-way choice (back end / front end / same time), dropping Experiment 7's second prediction part (frame agreement), since the rod's own frame isn't shown here.

### Implementation notes (tutor)

- **Daily-life example (added 2026-09-26, at the owner's request, per `CLAUDE.md` §15).** A "A familiar version of this" paragraph was inserted before step 1, comparing the spacetime diagram to an ordinary distance-vs-time graph (e.g., two cars leaving the same spot at different speeds, where a steeper line means faster and where two lines cross tells you when and where they meet). It names the general graph-reading skill the learner is already using — steeper line, meeting point — before applying it to the rod-and-flash case, without touching relativity itself.

---

## Success Criteria

1. The view layer computes worldlines, light lines, and events entirely from Experiment 7's existing physics results, with no independently recomputed relativistic value.
2. The learner predicts before seeing the diagram; START requires a prediction.
3. The diagram makes visible, without new calculation, why the back event happens first when the rod moves.
4. Results are shown neutrally, then explained by the tutor after the learner responds.
5. The learner can describe a spacetime diagram, a worldline, and why light is always the same slope on one.
6. The experiment introduces no Lorentz transformation, no tilted axes for the rod's frame, and no invariant-interval formula.
