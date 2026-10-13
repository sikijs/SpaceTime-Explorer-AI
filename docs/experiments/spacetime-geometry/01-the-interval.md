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

> **What "time² − distance²" means.** Take the time between two events, in seconds. Take the distance between them, in light-seconds. Multiply each number by itself, then subtract the distance result from the time result. For example, if two events are 3 seconds apart in time and 2 light-seconds apart in space, then 3 × 3 = 9, 2 × 2 = 4, and 9 − 4 = 5. Each observer can work out this number for the same two events from their own measurements.
>
> If the clock is moving, the lab sees its two ticks farther apart in time and in space than the clock's own face shows. What do you expect the number "time² − distance²" to be for the lab, compared with the clock's own frame?
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

**Approved wording for "The question" and "What happens" (owner, 2026-10-13):**

> **The question.** Imagine you are on a train and drop a ball. You see it fall straight down, so for you it landed in the same spot it was dropped. Someone on the platform sees the train carry the ball forward as it falls, so for them it landed many meters from where it was dropped. You and the platform observer disagree about how far apart those two events were: the dropping and the landing. Earlier experiments showed that moving observers can also disagree about how much time passed between two events. So observers can differ on both the time and the distance. That raises the question this experiment explores: when two observers disagree on both numbers, is there still some way of combining their own two numbers that gives the same answer for everyone? Or is everything about two events up to each observer's point of view?
>
> **What happens.** A clock moves past the lab at a steady speed. It ticks once every second of its own face, as the moving clock did in Experiments 3 to 5. Two of its ticks are our two events: tick 0, and tick 1 one second later by the clock's own face. Three observers will each measure the same two events. The first is the lab, which sees the clock move. The second is the clock itself, for which the clock is simply at rest. The third is a passing observer who moves past the lab at a speed you choose. Each observer reports two numbers: the time between the two ticks and the distance between them. You will predict how a certain combination of those two numbers compares between the lab and the clock, then run the experiment and look at what all three observers find.

The train-and-ball example is the daily-life anchor for the idea that observers can disagree about distance (§15); it uses no relativity. The remaining introduction paragraphs ("Some words we will use", "Your job", "What we assume") are still draft wording.

### Display

An animated diagram, following §14 "Animated Diagrams":

1. **Labeled components on the canvas:** the lab ruler and clock, the moving clock with its two tick events ("tick 0" and "tick 1"), and the passing observer.
2. **A visible contrast** between the three observers' time and distance (three small bars or rulers side by side, drawn to scale), so the learner sees time and distance grow and shrink, while a fourth element, the interval, is drawn as one bar of constant length across all three.
3. **A "How to read this diagram" caption** beneath it, matching earlier experiments.

**Approved wording for the setup diagram's "How to read this diagram" caption (owner, 2026-10-13).** It describes the diagram as it is built so far (setup and playback); the contrast of the three observers' numbers (item 2) and the caption text for it come with the results (Step 6).

> **How to read this diagram.** The drawing is from the lab's point of view. Everything is placed using the lab's own ruler.
>
> - **The grey line** is the lab's ruler. Its numbers are distances in light-seconds, measured from the start of the ruler. If a mark says 2, it is 2 light-seconds, about 600,000 kilometers, from the start.
> - **Blue square (tick 0):** the first event. The moving clock ticks for the first time at the start of the ruler.
> - **Orange square (tick 1):** the second event. It sits where the lab finds the clock when the clock's own face shows that one second has passed since tick 0. The orange line along the ruler is the distance the clock has covered between the two events, as the lab measures it. For example, at 0.6c the orange square lands 0.75 light-seconds along the ruler. At 0c the clock does not move, so there is no orange line, and tick 1 is at the same spot as tick 0.
> - **Green square (the moving clock):** appears when you press Run. It travels along the ruler from tick 0 to tick 1. The line beneath the drawing shows the number on the clock's own face as it goes, counting up to one second.
> - **Purple square (the passing observer):** the third observer. The arrow shows which way they move relative to the lab, and no arrow means they are at rest in the lab. In this drawing they are only shown, not moved.
>
> **What to look for.** Change the clock's speed and watch where tick 1 lands: the faster the clock, the farther along the ruler it is. Change the passing observer's speed and watch the purple arrow change direction. The drawing only sets up the two events. The measurements each observer makes of them appear after you run the experiment.

The 0.75 light-seconds at 0.6c is 0.6 times the lab's 1.25 seconds, from Experiment 3's time dilation; it was checked by calculation. It states only a distance, so it does not reveal the interval (§12).

A table lists each observer's time between, distance between, and `time² − distance²`.

**Approved wording for the results drawing's "How to read this drawing" caption (owner, 2026-10-13).** The table and the drawing's other text are still draft.

> **How to read this drawing.** Three observers each measured the same two ticks of the clock. Each observer gets one row, and the rows are in the same order as the table above. The drawing shows the same numbers as the table, as lengths.
>
> - **Blue bar (time):** how much time that observer found between the two ticks. The label at the end of the bar gives it in seconds ("s"). A longer bar means more time passed, according to that observer.
> - **Pink bar (distance):** how far apart that observer found the two ticks, as a number of light-seconds ("ls"). A pink bar with no length means the observer found both ticks at the same place. That is what an observer finds if the clock is at rest for them.
> - **The blue and pink bars share one scale.** A light-second and a second are the same kind of length here, because of how we measure distance. So you can compare a blue bar and a pink bar directly. The scale is set by the longest bar in the drawing, which is named at the bottom. Bars from different observers can be compared the same way. This means that a very long bar for one observer can make the others look short, but their labels still give the exact numbers.
> - **Green block (time² − distance²):** the number you predicted about. It is worked out for each observer from their own two numbers: multiply the time by itself, multiply the distance by itself, and subtract. For example, a row with time 3.00 s and distance 2.00 ls would give 3 × 3 − 2 × 2 = 9 − 4 = 5.00. The block is drawn at the same length in every row on purpose, so its length does not stand for the size of the number. Read the number written inside it.
>
> **What to look for.** Compare how the blue and pink bars change from one row to the next. Then compare the numbers inside the green blocks. Next, change the clock's speed or the passing observer's speed, run again, and see whether what you noticed still holds. A good test is to try the passing observer at rest in the lab (0c), then at −0.8c.

The worked example uses 3 and 2, the same numbers as the prediction's explanation and not the experiment's, so it does not reveal the result (§12).

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
3. **Conceptual question.** "The time and the distance can differ from one observer to the next. Why might one combination of them stay the same?"
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
- **Step 2, basic interface (2026-10-13):** `src/components/SpacetimeIntervalExperiment.tsx`, wired into `src/App.tsx` as the first chapter of the new group (heading added to `groupOrder`; its `learned` and `next` strings are empty placeholders, never shown until the tutor exists). It has the introduction (draft wording, awaiting the owner's approval, §28.1), the two sets of speed presets (Decision 5), and a labeled setup diagram with its "How to read this diagram" caption, drawn from `runIntervalExperiment`. The diagram uses the dark canvas (`#0b1020`, light text) of the newer experiments, after the owner pointed out the first version used the lighter style of Experiments 3 and 11. Checked in headless Chrome at 1100 and 390 pixels; two label overlaps found and fixed. Differences from this specification, for the owner to approve: (1) the introduction leaves out the worked 0.6c example and the stick-on-a-table anchor, which the "Introductory text" section asked for, because both show that the interval is the same for everyone and §12 says not to explain before the learner has observed; both are kept for the tutor. (2) The diagram shows only the setup, not the three observers' time, distance and interval side by side, which would reveal the answer before the prediction; that contrast is added with the run and results (Steps 5 to 7), and the diagram is not "done" under `CLAUDE.md` §14 until then. Not built: the prediction, the run, the results, the tutor.
- **Step 3, prediction (2026-10-13):** added to `src/components/SpacetimeIntervalExperiment.tsx`, below the setup diagram and its caption. It is the question and three answers of "Prediction Activity", not scored, changeable, with a "Your prediction: ..." line; the answer is kept in state for the results and tutor. Two differences from this specification, the first approved by the owner on 2026-10-13: (1) a short explanation of "time² − distance²" (a recipe and a worked example with the numbers 3 and 2, not the experiment's own) sits above the question, because the question uses the expression before the learner has seen it defined; its wording is now in "Prediction Activity", and the owner chose the longer four-sentence version. (2) There is no START button yet, so the gate "START stays disabled until a speed and an answer are chosen" is not built; it arrives with the run (Step 5), because a button that does nothing would mislead. Not checked in a browser. Wording still awaits the owner's line-by-line approval (§28.1). Not built: the run, the results, the tutor.
- **Step 4, run gate and run state (2026-10-13):** the START gate from "Prediction Activity" is built in `src/components/SpacetimeIntervalExperiment.tsx` as a "Run" button (the label used by the other experiments), disabled until a prediction is chosen (the speeds always have a value, so the prediction is the only gate). Clicking it sets the run state; the physics result comes from `runIntervalExperiment` through `useMemo`. Changing either speed or the prediction returns to the idle state, as in the other experiments, so a result is never shown for different settings. The only thing shown after a run is a neutral line naming the two speeds, a placeholder for the playback (Step 5) and results (Step 6); the result's numbers are not shown. No new physics, so no new tests (full Vitest run: 695 passed). Not checked in a browser. Not built: the playback, the results, the tutor.
- **Step 5, playback (2026-10-13):** `src/components/SpacetimeIntervalExperiment.tsx` now plays the run. Pressing Run (disabled while running) moves a green square, the moving clock, along the lab's ruler from tick 0 to tick 1 over 6 seconds of real time while a line under the diagram shows the clock's own face counting from 0 to 1 second. The tick 1 square, its label and its distance are hidden until the clock arrives, so the "two events are marked" in turn; while idle, the setup diagram shows both as before. The duration only sets presentation speed; the end position comes from `runIntervalExperiment` (§11). At 0c the clock stays at tick 0 while its face counts. The playback ends in a "complete" state and calls the new optional `onComplete` prop, so `App` now puts a check mark on the chapter once a run reaches the end, as for the other experiments; the other changes are the "Run" caption sentence in "How to read this diagram" and a taller drawing (290 units, to fit the readout line). The "Run with ..." placeholder line of Step 4 is removed. Differences from this specification, for the owner to approve: (1) the playback does not yet show "each observer's numbers appear in turn"; that, the three-bar contrast and the table are Step 6, so the diagram is still not "done" under `CLAUDE.md` §14. (2) The passing observer stays still and drawn as in the setup; it is not animated moving at its speed. No new physics, so no new tests (full Vitest run: 695 passed). NOT viewed in a browser: the Chrome extension was not connected, so the animation, the label positions and the narrow-window layout are unchecked. Not built: the results, the tutor.
- **Layout change after Step 5 (2026-10-13, owner's request):** the prediction and the Run button now sit above the diagram (controls, then prediction, then Run, then diagram and its caption), instead of below it. Not viewed in a browser by Claude; the owner can check it at the local address.
- **Introduction, "The question" and "What happens" (2026-10-13, owner's request and approval):** both paragraphs in `src/components/SpacetimeIntervalExperiment.tsx` were rewritten in more detail and the approved wording is recorded under "Introductory text". "The question" now opens with a train-and-ball example of observers disagreeing about distance, and asks whether any combination of the two numbers is agreed on, without saying it is. "What happens" now says what each of the three observers reports and that the learner predicts how a combination compares. Not viewed in a browser by Claude.
- **Setup diagram caption (2026-10-13, owner's request and approval):** the "How to read this diagram" caption in `src/components/SpacetimeIntervalExperiment.tsx` was rewritten as an opening line, one bullet per shape (ruler, blue, orange, green, purple), and a "What to look for" paragraph; the approved wording is recorded under "Display". The caption's `<p>` became a `<div>` with a list. It says plainly that the passing observer is not animated. Not viewed in a browser by Claude.
- **Step 6, results (2026-10-13):** `src/components/SpacetimeIntervalExperiment.tsx` shows a "Results" section below the diagram when the playback has ended. It has (1) a line naming the two speeds and the learner's prediction (a record only; it does not say whether it was right, §12); (2) a table of the three observers (the lab, the moving clock itself, the passing observer) with the time between the ticks, the distance between them and `time² − distance²`, all from `runIntervalExperiment`, to two decimals; (3) a dark-canvas drawing with one row per observer: a blue time bar and a pink distance bar on one shared scale, with a green block for `time² − distance²` drawn at the same fixed length for every observer, so the contrast the specification asks for (Display item 2) is visible; and (4) a "How to read this drawing" caption with one bullet per bar and a "What to look for" paragraph. Distances are shown without a sign. The tutor's explanation is not given. Differences from this specification, for the owner to approve: (1) all three rows appear together when the playback ends; the "Run" section says each observer's numbers "appear in turn". (2) The "Results Display" line "the interval, as the clock's own elapsed time (1 second)" is not shown as its own line, because the clock's own frame row already gives that 1.00 and a separate line would point at the explanation before the tutor (§12). (3) The three "bars side by side" are three rows, not three columns. (4) The green block is a fixed length, so its length is not a scale for the number; the caption says to compare the numbers. All Step 6 wording (the heading, the column names, the caption) is draft and awaits the owner's approval (§28.1). No new physics, so no new tests (full Vitest run: 695 passed). NOT viewed in a browser (the Chrome extension was not connected), so the layout and the bar drawing are unchecked. Not built: the tutor.
- **Results drawing caption (2026-10-13, owner's request and approval):** the "How to read this drawing" caption under the results drawing in `src/components/SpacetimeIntervalExperiment.tsx` was elaborated: it now explains the labels and units ("s", "ls"), what a missing pink bar means, the shared scale and why one long bar can make others look short, how the green number is worked out (with a 3 and 2 example), and why the green block is a fixed length. The approved wording is under "Run". Not viewed in a browser by Claude.
- **Step 7, AI tutor (2026-10-13):** `src/components/SpacetimeIntervalTutor.tsx`, shown below the experiment card once the results are, and started again after each run (keyed by the run count). It follows "AI Tutor Behavior": (1) observe, the specification's question about the lab's time and distance; (2) compare with the prediction, neutral, giving the learner's choice and the three numbers from the table, with no right or wrong verdict; (3) the conceptual question from the specification; (4) the explanation, in five numbered points: the numbers for the three observers, named "interval squared" and "interval" only now (Decision 3); the stick on a table as the daily-life example, with a worked 3-4-5 calculation (§15); where the analogy stops (the minus sign, not explained); for a clock, the interval is its own elapsed time, tied to Experiment 1 of the first chapter; and what was and was not shown (§5, "Limits"). Every number in the explanation comes from `runIntervalExperiment`. `onTutorComplete` is wired through the experiment so `App` records the chapter as explained. All tutor wording is draft and awaits the owner's approval (§28.1). One change outside this experiment, in `src/App.tsx`: the chapter summary card and the hint line above it are hidden while a chapter's "learned" text is empty, because this experiment's summary wording (its `learned` and `next` strings) is not written yet; without the guard an empty "What you learned" card would appear once the tutor finished. The summary wording is a later step for the owner to approve. Differences from this specification, for the owner to approve: (1) the stick example gives numbers (a 5 cm stick, 3 and 4 cm parts) that the specification did not. (2) Point 1 says what the interval and the interval squared are called, which the specification left to the tutor. No new physics, so no new tests (full Vitest run: 695 passed). NOT viewed in a browser (the Chrome extension was not connected). Not built: the chapter summary wording, the complete-flow test, the final review.
- **Wording approval (2026-10-13):** after Step 7 the owner said "wording approved". Claude took this to cover the learner-facing wording drafted for Steps 2 to 7 (introduction, prediction, results text, tutor), but the owner should confirm that reading. The differences from this specification listed in the notes above (Steps 2, 5, 6 and 7) were not separately approved.
- **Complete-flow test and final review (2026-10-13):** run by a scripted headless Chrome against the dev server, not by hand and not by the Chrome extension (which was not connected); the script is not in the repository. Flows run: (A) 0.6c, passing observer +0.5c, prediction "the same": Run is disabled until a prediction is chosen; during the run the clock readout counts up, tick 1 is hidden until arrival, the button reads "Running...", and no results show; after the run the table reads lab 1.25 s / 0.75 ls / 1.00, clock 1.00 / 0.00 / 1.00, passing 1.01 / 0.14 / 1.00; the chapter is marked complete; the tutor's three questions appear in order, the compare step shows the choice and the three numbers, the explanation appears after the third answer, and the chapter is then saved as explained. Changing a speed afterwards returns to idle and removes the results and the tutor. (B) 0c and 0c: all three rows read 1.00 / 0.00 / 1.00. (C) 0.99c and −0.8c: lab 7.09 / 7.02, passing 21.17 / 21.15, all 1.00; the bars stay readable. At a 390-pixel width there was no sideways scrolling, and the setup and results drawings were inspected for case C. The browser console showed no errors or warnings. Full Vitest run: 695 passed. Against the Success Criteria: 1 to 4 and 6 met as built; 5 and 7 are about what the learner understands and consistency with Experiments 1 to 11 and were not tested with a learner. Findings for the owner: (1) the prediction question says the lab sees the ticks "farther apart in time and in space", and the tutor's conceptual question and explanation point 1 say the time and distance "changed" for the lab, but at a clock speed of 0c (a preset) the lab's time and distance equal the clock's own (1.00 s, 0.00 ls), so those sentences are untrue for that preset; the wording needs a decision (for example, remove the 0c clock preset, or word the sentences so they hold at 0c). (2) The summary strings `learned` and `next` for this chapter in `src/App.tsx` are still empty, so no "What you learned" card shows after the tutor; they are for the owner to approve. (3) `CLAUDE.md` section 27 and `docs/STATUS.md` do not yet mention the Spacetime Geometry group. (4) Not checked: other browsers, keyboard use and screen readers, the other presets one by one, a real learner.
- **Finding 1 of the final review resolved (2026-10-13, owner's instruction to handle it as required):** the 0c clock preset is kept (the specification's "Expected Observations" relies on it) and the sentences that did not hold at 0c were reworded so that they do. The prediction question now begins "If the clock is moving, the lab sees its two ticks farther apart in time and in space than the clock's own face shows." The tutor's conceptual question now reads "The time and the distance can differ from one observer to the next. Why might one combination of them stay the same?", its explanation point 1 now says the time and distance "can change from observer to observer", and point 2 says "they can change". The specification's "Prediction Activity" and "AI Tutor Behavior" sections were updated to match. Not re-run in a browser; the type check and Vitest were re-run. The owner has not yet seen this exact wording.
