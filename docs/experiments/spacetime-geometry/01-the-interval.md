# Experiment 1 (Spacetime Geometry): The Interval, One Number Everyone Agrees On

**Status: APPROVED by the owner on 2026-10-13, with all ten "Decisions Needing Human Review" taken on their defaults.** Proposed by Claude per `CLAUDE.md` §23 Stages 1 to 3 on 2026-10-13. The owner chose this group on 2026-10-13 by merging two candidate groups ("Spacetime Geometry" and "Seeing Relativity") into one. The introduction, prediction, caption and tutor wording drafted here is still subject to the owner's line-by-line approval (§28.1). The roadmap is approved as a direction only (Decision 9).

**Group:** "Spacetime Geometry: What Is Real, What Is Seen" (working name, Decision 1). Specifications for this group live in `docs/experiments/spacetime-geometry/`.

---

## Overview

The first chapter taught that time and distance are not the same for everyone. Two observers can disagree about how much time passed between two events, and about how far apart they happened. Experiments 3, 6, 7 and 11 each showed one such disagreement.

This experiment asks the opposite question: **is there anything the observers do agree on?**

There is, and it is a single number built from the time and the distance between two events, called the **spacetime interval** (or just the **interval**). Two observers moving at different speeds will measure different times and different distances, but when each one combines their own two numbers the same way, they get the same result.

The experiment uses a situation the learner already knows: a moving clock ticking (Experiments 3 to 5). The learner chooses the clock's speed and a second observer's speed, and sees three observers' numbers side by side. The time and the distance change from observer to observer. The interval does not.

This is the first experiment of a group about **what is real and what is seen**. The interval is what is the same for everyone. Later experiments in the group ask what each observer actually *sees*, which depends on the light that reaches them (see "Proposed group roadmap").

---

## Learning Objective

After this experiment, the learner should understand:

1. Two events can have different times between them and different distances between them for different observers.
2. Combining the time and the distance in one specific way, `time² − distance²` (distance in light-seconds, so both are in the same units), gives a number that is the same for every observer.
3. For two ticks of one clock, that number is simply the time on the clock's own face between the ticks, squared. So the interval is what a clock traveling from the first event to the second would read.
4. This ties the whole project together: Experiment 1 said a clock measures elapsed time along its own history. The interval is that same idea, now stated for any two events.
5. Space and time are not separate things that happen to disagree. Motion trades some of one for some of the other, and the interval is what stays fixed in the trade.

---

## Physical Situation

### Reused

- A clock moving at a constant speed `v` (a fraction of `c`) in the lab, ticking once per second of its own time. This is the moving clock of Experiments 3 to 5.
- Flat spacetime, constant velocity, no gravity (as in Experiments 3 to 11).
- Units: `c = 1`, time in seconds, distance in light-seconds (as everywhere else in the app).

### What is new

1. **Two events** are marked: the clock's tick 0 (at the lab's origin, at time zero) and its tick 1 (one second later by the clock's own face).
2. **Three observers** each report the time between the two events and the distance between them:
   - the **lab**, in which the clock moves at `v`;
   - the **clock's own frame**, in which the clock is at rest;
   - a **passing observer**, moving at a speed `u` the learner chooses, relative to the lab.
3. **The interval**, `time² − distance²`, computed by each observer from their own two numbers.

### Simplifying assumptions (all stated to the learner in plain language)

- Flat spacetime, constant velocities, no gravity (as in Experiments 3 to 11).
- Everything moves along one line (the same line for the clock, the lab and the passing observer).
- Distances are measured in light-seconds, so time and distance can be combined in the same units. (This is why `c = 1` is explained in the introduction, if it is not already known from earlier experiments.)

### Not introduced

Light cones, the words "timelike" and "spacelike", the Lorentz transformation as a formula shown to the learner, `γ` as a named symbol (the project keeps Experiment 3's "time dilation factor"), two events that are not ticks of one clock (the rod's length case is a candidate for a later experiment, see the roadmap), and anything about gravity or curved spacetime.

---

## Physics Model

All of it is flat-spacetime special relativity, using what the app already has.

### Reused, unchanged

- `timeDilationFactorFor(velocity)` in `src/physics/movingClockExperiment.ts`: `√(1 − v²)`. Between two ticks of the moving clock, lab time = clock time ÷ this factor.
- `lorentzTransform(event, velocity)` in `src/physics/lorentzTransform.ts`: converts an event's lab `(position, time)` into the `(position, time)` a frame moving at `velocity` would assign to it. It already has interval-invariance tests (Experiment 11).

### New: a small independent physics module

```typescript
// src/physics/spacetimeInterval.ts (proposed)
export function intervalSquared(a: WorldlinePoint, b: WorldlinePoint): number
// (b.time − a.time)² − (b.position − a.position)²   [seconds², with c = 1]

export interface ObserverReading { timeBetween: number; distanceBetween: number; intervalSquared: number }
export function runIntervalExperiment(clockSpeed: number, passingObserverSpeed: number):
  { lab: ObserverReading; clockFrame: ObserverReading; passing: ObserverReading }
```

### The setup, in numbers

Event A is `(position 0, time 0)`. Event B is the clock's tick 1:

- lab time between the events = `1 ÷ timeDilationFactorFor(v)` seconds;
- distance between them in the lab = `v ×` that time.

The clock's own frame and the passing observer's frame are found by passing both events through `lorentzTransform` (with `v` and `u` respectively). `runIntervalExperiment` does not compute any relativistic quantity itself except through those two functions.

### Worked example (for the introduction and tutor, with real numbers)

At `v = 0.6c`: the time-dilation factor is `√(1 − 0.36) = 0.8`, so lab time between ticks = `1 ÷ 0.8 = 1.25 s`, and the distance is `0.6 × 1.25 = 0.75` light-seconds.

- Lab: `1.25² − 0.75² = 1.5625 − 0.5625 = 1.0`.
- Clock's own frame: time `1 s`, distance `0`, so `1² − 0² = 1.0`.
- Passing observer (any speed): different time and distance, same `1.0`.

### Sign convention and limits

- The interval is reported as `time² − distance²`. For two ticks of one clock it is positive and equals `(the clock's own time)²`. Any other sign is not needed in this experiment (see "Not introduced").
- `0 ≤ v < c` for the clock. The passing observer's speed `u` satisfies `−c < u < c` (negative means moving the other way). Out-of-range values throw `RangeError`, as in the other experiments.

---

## Learner Controls

1. **Clock speed `v`**: presets (for example 0, 0.3, 0.6, 0.9, 0.99 of `c`) plus an optional free value. Preset list is Decision 5.
2. **Passing observer speed `u`**: presets (for example −0.8, −0.5, 0, 0.5, 0.8 of `c`; for example: moving the same way as the clock, the opposite way, or at rest in the lab).
3. **START / Run:** gated on the prediction (see below), as in earlier experiments.

---

## Prediction Activity

Before running, the learner chooses a clock speed and answers one question. Wording is a draft for the owner (§28.1):

> The lab sees the clock's two ticks farther apart in time and in space than the clock's own face shows. What do you expect the number "time² − distance²" to be for the lab, compared with the clock's own frame?
>
> (a) Bigger in the lab, (b) The same in both, (c) Smaller in the lab.

Not scored. START stays disabled until a speed and an answer are chosen. The submitted answer is kept for the results and the tutor. The learner is not told which answer is right before running (§12).

---

## Experiment Behavior

### Introductory text (plain-language draft, for the owner's approval, §28.1)

Following the structure of existing introductions (the question, what happens, the learner's job, new terms, assumptions). To be drafted in full once the owner approves the direction. It must:

- Start from the everyday idea that "two events have one time between them and one distance between them", and note that earlier experiments showed this isn't true for everyone.
- Define **event** (a place and a moment), **interval** (defined only after the learner has seen the numbers), and why distance is measured in light-seconds.
- Say plainly that this experiment does not explain *why* the interval is the same, only shows that it is, and that the tutor will help with the why afterward.
- Offer one daily-life anchor and one worked calculation (the `v = 0.6c` example above), per §15.

### Display

An animated diagram, following §14 "Animated Diagrams":

1. **Labeled components on the canvas:** the lab ruler and clock, the moving clock with its two tick events ("tick 0" and "tick 1"), and the passing observer.
2. **A visible contrast** between the three observers' time and distance (three small bars or rulers side by side, drawn to scale), so the learner sees time and distance grow and shrink, while a fourth element, the interval, is drawn as one bar of constant length across all three.
3. **A "How to read this diagram" caption** beneath it, matching earlier experiments.

A table lists each observer's time between, distance between, and `time² − distance²`.

### Run

A short playback: the clock ticks, the two events are marked, then each observer's numbers appear in turn. Playback speed does not change the result (§11).

---

## Results Display

Shown only when the run ends. Values only, with plain labels:

- the clock's speed and the passing observer's speed;
- for each of the three observers: time between, distance between, `time² − distance²`;
- the interval, as the clock's own elapsed time (1 second).

Results are neutral. The explanation comes from the tutor, after the learner has responded (§12).

---

## Expected Observations

- The lab's time between the ticks is longer than the clock's own 1 second, and the lab sees a distance (as in Experiment 3).
- The passing observer's time and distance are different again, and change as `u` changes.
- All three observers get `time² − distance² = 1.0`.
- At `v = 0`, the lab and the clock's own frame agree on everything, and the passing observer is the only one who disagrees on time and distance.

---

## Expected Learner Understanding

The learner should be able to say that two observers can disagree about time and distance but agree about the interval, and that the interval is the clock's own elapsed time for two ticks of one clock. They need not yet understand why it works, nor have the formula for a general pair of events.

---

## New Concepts Introduced

**Event**, **spacetime interval**. (Light-seconds as a unit of distance is assumed from earlier experiments.)

---

## Relationship to Previous Experiments

- Experiment 1 (one clock): a clock measures time along its own history. The interval is that, for any two events.
- Experiment 3: time dilation. Here the same lab-time-versus-clock-time difference is shown to be one half of a pair.
- Experiments 6, 7: length contraction and simultaneity, each a case where observers disagree.
- Experiment 11: the Lorentz transformation, already tested for interval invariance. This experiment is the first time the learner sees the invariance itself.

---

## Relationship to Later Experiments

Light cones, and the idea that some pairs of events can influence each other and some cannot, depend on the sign of the interval. The "seen" half of the group (aberration, Doppler shift, the rotated look of a fast object) depends on light from the learner's past light cone reaching them.

---

## Proposed group roadmap (not approved; each experiment needs its own specification)

1. **The interval.** One number everyone agrees on (this specification).
2. **Light cones.** Which events can influence which, and the third sign of the interval.
3. **Cause before effect.** Why the order of some pairs of events can flip but a cause never comes after its effect.
4. **What you see is the past.** What a fast object looks like versus where it is measured to be, using the light cone.
5. **Aberration.** Why the sky bunches up ahead of a fast traveler.
6. **Relativistic Doppler effect.** Color shifts in both directions, connecting to the redshift in Gravitational Waves 5.
7. **A fast object looks rotated, not squashed.** The group's closing synthesis, if the owner wants it.

The roadmap is a proposal only (`docs/PROJECT.md`: "Future experiments must not be invented merely to fill out a roadmap"). The owner may cut, reorder or replace any of them.

---

## Required Physics Tests

Tests verify the physics, not just that functions exist (§10). All are for `src/physics/spacetimeInterval.ts`.

1. `intervalSquared` of two events equals `(Δtime)² − (Δposition)²`, for hand-calculated cases (including the `v = 0.6c` example: 1.5625 − 0.5625 = 1).
2. For `v = 0`, the lab's reading equals the clock frame's reading, and `intervalSquared = 1`.
3. For every speed in a spread (including 0.01c, 0.5c, 0.9c, 0.999c), the lab's, the clock frame's and the passing observer's `intervalSquared` are all `1`, to a stated numerical tolerance.
4. Invariance for passing speeds across `−0.99c` to `0.99c`, including `u = v` (the passing observer is the clock's frame), where the two readings must be identical.
5. The lab's time between the ticks equals `1 ÷ timeDilationFactorFor(v)`, and the distance equals `v` times that, so the experiment's lab numbers agree with Experiment 3.
6. The clock frame's reading is `(time 1, distance 0)`, to tolerance.
7. Time between and distance between each differ from observer to observer where speeds differ (so the test would fail if the module returned the same numbers for every observer).
8. Out-of-range inputs throw `RangeError` (`v < 0`, `v ≥ c`, `|u| ≥ c`).
9. Playback speed does not change the result (§11), tested at the physics level by the result being a pure function of `(v, u)`.

---

## AI Tutor Behavior

Following the established sequence (observe, compare with the prediction, a conceptual question, then the explanation). Draft only; the owner approves the wording (§28.1).

1. **Observe.** "What happened to the time between the ticks as seen from the lab? What happened to the distance?"
2. **Compare with the prediction.** Neutral: the learner's choice versus what the table shows.
3. **Conceptual question.** "The time and the distance both changed for the lab, and again for the passing observer. Why might one combination of them stay the same?"
4. **Explanation**, kept short and concrete:
   - **Daily-life example** (no relativity): a stick lying on a table. Look at it from different angles and its east-west extent and north-south extent change, but its length does not. Distance is the same kind of quantity: the parts change, the whole stays.
   - Motion plays a similar role for time and space: it moves some of one into the other, and the interval is what stays put. State plainly that the analogy is not exact, because the interval subtracts (`time² − distance²`) where a stick's length adds (`east² + north²`), and that this minus sign is what makes spacetime different from ordinary space. The experiment does not explain why there is a minus sign.
   - **Tie to Experiment 1:** for the clock, the interval is its own elapsed time. Everyone agrees on what the clock reads, whatever they think about the time and distance.
5. **Limits.** The tutor says what was and was not shown: it showed the interval is the same for these three observers and this pair of events (two ticks of one clock). It did not show that this holds for any pair of events (the next experiments return to that), and it did not derive the minus sign.

The tutor must not invent physics, change results, or contradict the engine (§13).

---

## Decisions Needing Human Review

**All ten were taken on their defaults when the owner approved the specification (2026-10-13).**

The group name (Decision 1) was confirmed on 2026-10-13 as "Spacetime Geometry: What Is Real, What Is Seen".

1. **Group name.** "Spacetime Geometry: What Is Real, What Is Seen" is a working name. Alternatives: "Spacetime Geometry and Appearance", "Real Versus Seen". Owner to choose.
2. **Which pair of events to start with.** Default: two ticks of one clock, because the interval then equals the clock's own time, tying it to Experiment 1, and it reuses Experiments 3 to 5. Alternative: start with the rod's two flash-arrival events (Experiment 7), where the interval equals the rod's own length. That case needs the "spacelike" idea and is better as a later experiment.
3. **The word "interval" and its squared form.** Default: show `time² − distance²` and call it "the interval squared", and call its square root "the interval" once the learner has seen the number, so no square roots are needed to see the invariance. Alternative: show the square root directly (`√(time² − distance²)`), which for ticks is just "1 second" and is easier to read but hides the minus sign. Owner to choose.
4. **Number of observers.** Default: three (lab, the clock's own frame, one passing observer), so the learner sees the interval is the same for a third, unrelated observer too. Alternative: two (lab and clock only), which is simpler but lets the learner think it is a special feature of the clock's own frame.
5. **Control presets.** Default: five clock speeds (0, 0.3, 0.6, 0.9, 0.99 of `c`) and five passing speeds (−0.8, −0.5, 0, 0.5, 0.8 of `c`). Alternative: free sliders.
6. **A single choice versus a two-part prediction.** Default: one three-way choice, as drafted. Earlier experiments sometimes also asked for a number; a number would need a unit convention (seconds squared) that is not natural for a first-time learner.
7. **Minus-sign analogy.** Default: use the stick-on-a-table analogy and say plainly where it fails (the minus sign). Alternative: leave the analogy out and show only the numbers. The owner may prefer fewer words.
8. **Distance in light-seconds.** Default: continue the app's convention (`c = 1`), and explain it in the introduction. Alternative: convert the distance to a "time-equivalent" ("how long light would take to cover it"), a plainer way to say the same thing; might be a better first explanation for a learner new to light-seconds.
9. **The roadmap.** Default: approve the seven-experiment sketch as a direction, not a commitment. Alternative: approve this experiment alone and decide the rest after it is built.
10. **What would be left for a primary-source check.** The interval and its invariance are standard special relativity, already tested in Experiment 11. If real-world claims are added to the tutor, they should be checked before approval. None are drafted here.

---

## Success Criteria

1. The physics model returns the lab's, the clock frame's and the passing observer's readings, and the interval squared is 1 for all three at every tested speed, to a stated tolerance.
2. The learner predicts before running; START requires a prediction.
3. The display makes it clear that time and distance differ between observers while the interval does not.
4. Results are shown neutrally, then explained by the tutor after the learner responds.
5. The learner can say that observers disagree on time and distance but agree on the interval, and that for a clock's two ticks the interval is the clock's own time.
6. The experiment does not claim to explain why the interval is invariant, or why it has a minus sign.
7. Nothing in it contradicts Experiments 1 to 11.

---

## Implementation Notes

- **Step 1, physics model and tests (2026-10-13):** `src/physics/spacetimeInterval.ts` (`intervalSquared`, `runIntervalExperiment`) and `src/physics/spacetimeInterval.test.ts` (10 tests covering the nine in "Required Physics Tests"; the experiment 3 agreement test also cross-checks `runMovingClockExperiment`). The module computes no relativistic quantity itself: the lab's numbers come from `timeDilationFactorFor` and the other two observers' from `lorentzTransform`. Full Vitest run: 695 passed. Not started: interface, prediction, results, tutor.
