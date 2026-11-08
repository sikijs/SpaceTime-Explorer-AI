# Experiment 2: Two Clocks at Rest

## Overview

In Experiment 1, the learner discovered that a single clock measures elapsed time along its own history.

Experiment 2 extends this understanding by introducing a second clock. Both clocks are at rest in the same reference frame. The learner will observe that two independent clocks, when synchronized at the start, measure the same elapsed time for the same event interval.

This establishes a crucial insight: **time measurement is a property of the reference frame**, not just of individual clocks. Multiple observers at rest relative to each other will agree on elapsed time.

---

## Learning Objective

After completing Experiment 2, the learner should understand:

1. Multiple clocks can measure time independently in the same reference frame.
2. If two clocks are synchronized at one event, they remain synchronized as long as they remain at rest relative to each other.
3. Two observers at rest relative to each other will measure the same elapsed time for the same pair of events.
4. The concept of a "reference frame" as a collection of observers who are all at rest relative to one another.

---

## Physical Situation

### Reference Frame

Both clocks are at rest in a common inertial reference frame. They are spatially separated but stationary relative to each other.

### Initial State

- **Clock A**: Located at position x = 0. Initial reading: 00:00:00
- **Clock B**: Located at position x = L (some distance). Initial reading: 00:00:00

Both clocks are synchronized at the start event (t = 0).

### No Motion

Neither clock moves. There is no acceleration. Both clocks tick at the same rate.

### Simplifying Assumptions

This experiment intentionally does NOT introduce:

- Motion or relative velocity between the clocks
- Synchronization challenges (clocks start synchronized)
- Relativity of simultaneity (events at different locations)
- Time dilation effects
- Gravitational effects

---

## Physics Model

### Clock Behavior

Both clocks advance at the same rate:

```
time_A(t) = t
time_B(t) = t
```

Where `t` is the elapsed simulation time in seconds.

### Start Event

Occurs at simulation time `t = 0`:
- Clock A reads: 00:00:00
- Clock B reads: 00:00:00

### End Event

Occurs at simulation time `t = duration` (chosen by the learner):
- Clock A reads: `duration` seconds
- Clock B reads: `duration` seconds

### Elapsed Time

For both clocks:

```
elapsed_time_A = final_reading_A - initial_reading_A = duration
elapsed_time_B = final_reading_B - initial_reading_B = duration
```

Both clocks measure the same elapsed time.

### Difference Between Clocks

```
difference = |elapsed_time_A - elapsed_time_B| = 0
```

The difference is always zero (or negligibly close due to rounding).

---

## Learner Controls

### Experiment Duration

The learner selects the duration for which the experiment runs.

Preset options: 5s, 10s, 20s, 30s

The learner may also select **Other** and enter a duration from 1 to 60 seconds.

---

## Prediction Activity

### Before the Experiment

The learner is presented with the scenario:

> You have two independent clocks, both at rest next to each other. They both start at 00:00:00. You let them run for [duration] seconds. What do you predict Clock A will read? What do you predict Clock B will read? Will they read the same thing?

The learner enters TWO predictions:

1. What will Clock A read?
2. What will Clock B read?

Alternatively, the learner could be asked:

> You let them run for [duration] seconds. What do you predict the difference between the two clock readings will be?

**Design Decision**: The experiment should encourage the learner to think about whether two independent clocks can stay synchronized.

---

## Experiment Behavior

### Visual Display

The screen should display both clocks side by side:

```
Clock A              Clock B
--------             --------
HH:MM:SS            HH:MM:SS

Status: Running
```

As the experiment runs, both clocks animate forward at the same rate.

### Animation Speed

The clocks animate visually over approximately 2 seconds (matching Experiment 1's 2-second animation).

Changing the animation speed does NOT change the physical result.

### End of Experiment

When the experiment completes, the clocks stop updating. Their final readings are displayed clearly.

---

## Results Display

After the experiment completes, the learner sees:

### Measurement Summary

```
Duration: [selected duration] seconds

Clock A:
  Initial reading: 00:00:00
  Final reading: HH:MM:SS
  Elapsed time: [duration] seconds

Clock B:
  Initial reading: 00:00:00
  Final reading: HH:MM:SS
  Elapsed time: [duration] seconds

Difference in elapsed time: 0 seconds
```

### Prediction Comparison

```
Your Prediction A: [learner's prediction for Clock A]
Actual Clock A: [actual final reading]

Your Prediction B: [learner's prediction for Clock B]
Actual Clock B: [actual final reading]
```

### Key Insight

Display a statement emphasizing the key finding:

> **Both clocks measured the same elapsed time.** When two clocks are at rest relative to each other and synchronized at the start, they remain synchronized. They measure time the same way.

---

## Expected Observations

The learner should observe:

1. Both clocks start at 00:00:00.
2. Both clocks advance at exactly the same rate during the experiment.
3. Both clocks end with the same reading.
4. The elapsed time measured by Clock A equals the elapsed time measured by Clock B.

This establishes that time measurement is **not unique to a single clock**. It is a property shared by all observers at rest in the same reference frame.

---

## Expected Learner Understanding

After this experiment, the learner should be able to:

1. Explain that multiple clocks at rest can measure time independently.
2. Understand that synchronized clocks remain synchronized if they stay at rest relative to each other.
3. Recognize that observers at rest relative to each other agree on elapsed time for the same event pair.
4. Begin to develop intuition about what a "reference frame" means—a collection of observers at rest relative to one another.

---

## New Concepts Introduced

1. **Spatial Separation**: Events and observers can be at different locations but still in the same reference frame.
2. **Reference Frame**: A collection of observers (or clocks) that are all at rest relative to one another.
3. **Synchronization**: The idea that clocks can be set to the same initial value.
4. **Consistency of Time Measurement**: All observers at rest in a frame measure the same elapsed time.

---

## Connection to Experiment 1

Experiment 1 established:
> A clock measures elapsed time along its own history.

Experiment 2 extends this to:
> Multiple clocks at rest in the same reference frame all measure elapsed time the same way.

Experiment 1 used a single clock. Experiment 2 uses two clocks to show that the principle generalizes.

---

## Relationship to Later Experiments

This experiment prepares the learner for:

1. **Experiment 3 (Proposed)**: Comparing clocks in different reference frames—introducing the idea that observers in relative motion might not agree on elapsed time.
2. **Time Dilation**: Once the learner understands that clocks at rest measure time consistently, we can introduce what happens when a clock is moving relative to the observer.
3. **Relativity of Simultaneity**: Later, we may explore how observers in different frames disagree on which events happen at the "same time."

---

## Required Physics Tests

The physics model should be tested to verify:

1. Both clocks advance at the same rate.
2. If synchronized at t=0, both clocks show the same reading at any later time t.
3. Elapsed time for Clock A equals elapsed time for Clock B.
4. The difference between clock readings is always zero.
5. The physics model produces consistent results across multiple runs.
6. The physics model is independent of the animation or UI behavior.

Example test:

```typescript
it("two synchronized clocks at rest measure the same elapsed time", () => {
  const duration = 10;
  const result = runTwoClockExperiment(duration);
  
  expect(result.elapsedTimeClockA).toBe(duration);
  expect(result.elapsedTimeClockB).toBe(duration);
  expect(result.elapsedTimeClockA).toBe(result.elapsedTimeClockB);
  expect(result.difference).toBe(0);
});
```

---

## AI Tutor Behavior

### Before the Experiment

The tutor encourages prediction:

> Before we run the experiment, I'd like you to think about what will happen. We have two independent clocks. They both start at the same time. After [duration] seconds, what do you think they will read?

The tutor listens to the learner's reasoning and asks follow-up questions:

> What makes you think they will read the same / different?

### During the Experiment

The tutor remains silent while the experiment runs.

### After the Experiment

The tutor follows the observation cycle:

1. **Observation**: "What did you observe? Did the clocks read the same thing?"
2. **Prediction Comparison**: "You predicted that Clock A would read [X] and Clock B would read [Y]. The actual readings were [A] and [B]. Were your predictions correct?"
3. **Conceptual Question**: "If two clocks are at rest next to each other and we start them at the same time, why do you think they measure the same elapsed time?"
4. **Explanation**: The tutor explains that observers at rest in the same reference frame all measure time the same way. This is a property of their shared reference frame, not of individual clocks.

### Tutor Adjustments

If the learner predicted the clocks would read differently:

> That's an interesting prediction! Let's see what actually happened. The clocks both measured the same elapsed time. Does that match what you expected? What changed your thinking?

If the learner correctly predicted they would read the same:

> Great prediction! You understood that two clocks at rest measure time the same way. That's an important insight.

---

## Clarifications and Exclusions

This experiment intentionally does NOT explore:

- **Motion**: Both clocks are stationary. There is no relative velocity.
- **Time Dilation**: We are not yet asking how a moving clock would behave.
- **Simultaneity**: We are not asking whether distant events are simultaneous.
- **Relativity of Simultaneity**: We assume that both clocks start at the same moment.
- **Acceleration**: Neither clock accelerates.
- **Gravity**: There are no gravitational effects.

These topics will be introduced in later experiments.

---

## Success Criteria

Experiment 2 is successful when:

1. The physics model correctly simulates two clocks at rest measuring time.
2. Both clocks consistently measure the same elapsed time.
3. The UI clearly displays both clocks and their readings.
4. The learner can make a prediction before the experiment.
5. The results are clearly presented.
6. The AI tutor guides the learner through the observation and reasoning cycle.
7. The learner can articulate that observers at rest in the same frame measure time consistently.
8. All physics tests pass.

---

## Notes for Implementation

1. **Physics First**: Implement the physics model independently before building the UI.
2. **Synchronization**: The clocks start synchronized. The physics model should ensure they remain synchronized.
3. **Spatial Separation**: The clocks are at different locations, but this should not affect their time measurements (no gravitational time dilation or other effects).
4. **Visual Clarity**: Display both clocks clearly and symmetrically so the learner can easily compare them.
5. **Animation**: Both clocks should animate at the same speed. Their animations should be synchronized visually.
6. **No Decoys**: Do not introduce elements that might confuse the learner (e.g., do not show the clocks ticking at different rates unless that is the intended physics).


---

## Audit update (2026-11-08)

Brought to the newer rules of CLAUDE.md §14, §15 and §28 (`docs/AUDIT-PLAN.md`, Rule E and the owner's rules of 2026-11-07), with the owner's choices of 2026-11-08 ("all defaults" to the eight questions of `docs/audit/relativity-of-time-and-motion/02-gap-report.md`): fix every gap, Part 1 fixed at 10 seconds with the duration choice in Part 2, a two-row strip on one scale from 0 to twice the duration, the tutor marks each guess with no score, each clock's reading read separately from the module, no check-up or setting-following table, and a source search with a recorded gap for "reference frame". Wording was drafted in `docs/audit/relativity-of-time-and-motion/02-draft-wording.md` and approved by the owner on 2026-11-08 ("approve with defaults", with the draft's ten questions). It follows the pattern of Experiment 1's audit update (`01-clock.md`, "Audit update"). The earlier text of this specification stands except where this note says otherwise; where it conflicts, this section wins.

1. **The page in four Parts** (replaces the single column of "Experiment Behavior"). Above Part 1, with no heading: the introduction (its blue "reference frame" box stays), a "Want to know more?" list and a collapsed "Words and formulas" box. Part 1 "Predict, then watch" (the two guesses, START, the two clocks, the Event Interval strip), Part 2 "Now try it yourself" (the duration choice and Drawing A), Part 3 "The results" and Part 4 "The tutor", each with a lead. Parts 2 to 4 appear when the first run finishes. The page was already 900 px wide.
2. **The duration moves to Part 2** (changes "Experiment Setup"). Part 1 always uses 10 seconds, the default. Part 2 offers 5, 10, 20 and 30 seconds and "Other" (a whole number from 1 to 60), default 20, with "Run your duration", and a "Runs so far" list. This is where the learner repeats the experiment with another length.
3. **The predictions** ("Prediction Activity") are unchanged, except that they are about the 10-second run. START stays disabled until both numbers are typed. After START the guesses are locked; there is no "Run Again" and no "Change prediction". An always-visible **Start over** (greyed out until there is a guess or a run, and while a run plays) clears the guesses, the runs, the results and the tutor's progress.
4. **The Event Interval strip** (changes "Visualization"). It appears when the run ends and has two rows, Clock A and Clock B, on one time scale from 0 to twice the duration (ticks at 0, the duration and twice the duration). Each row has amber dots for Event A (START) and Event B (END) with that clock's readings and its "elapsed" label; dashed lines join the two rows at each event, so both clocks are read at the same two moments. Each clock's guess is a **white mark** at the guessed number of seconds, in a box "YOUR GUESS for Clock A: N seconds" (or Clock B) joined to it by a line; a guess beyond the scale is a white arrow at the edge and the box says "(off the scale)". The marks show the guesses only and never move the events. Part 2's **Drawing A** is the same strip for the learner's length with Event B, its dashed line and the elapsed labels in pink (the guesses are not redrawn there, because they were guesses for the 10-second run). Under each picture: "Where the real picture comes from" (calculated here; nothing measured or imagined) and a "How to read" caption with a worked moment and "What to look for" in three parts (Look at / What it means / Why it matters).
5. **Introduction.** Kept: the question, "Why even ask this", the reference-frame box and the assumptions. Added: "How real clocks in different places are checked" (about 450 atomic clocks in about 90 laboratories compared all the time, with a monthly correction from an international bureau, and the page's clocks as an idealized version), a rewritten "What happens" and "Your job", "Your guesses and the real pictures" and "Some new words". "In Experiment 1" became "In "One clock"".
6. **Words and links.** A "Words and formulas" box (clock, event, clock reading, elapsed time, duration, at rest, synchronized, reference frame; the formulas, with the worked example Clock A 00:00:10 − 00:00:00 = 10 seconds and the difference 0, appear only after the Part 1 run, because they use the answer, §12). A "Want to know more?" list of one NIST page.
7. **Results** ("Results Display"). The same lines, with a "your guess" tag and a pointer to the white mark on each clock's elapsed-time line, "You guessed" beside "The real elapsed time" for each clock, the difference of the two elapsed times, and a "Where this comes from" line. No table: the two readings agree by construction, so no outside reference exists (CLAUDE.md §14 "Reading the Results" applies only where a real reference exists).
8. **Tutor** (changes "AI Tutor Behavior"). The prompts point to the two clocks, both rows of the strip and the two white marks and give no verdict. The explanation keeps its two paragraphs (including the sentence "This is a basic property of a reference frame: everyone standing still in that frame agrees about time"), then "Your guesses, marked" (each the same as, or N seconds more or less than, the clock's reading; no score), then four points: (1) why the guesses did not change the clocks (two kitchen timers), (2) what "agree" means (the same reading at the same moment; the dashed lines mark the moments; the difference is 0 seconds), (3) real clocks have to be kept in agreement (about 450 clocks in about 90 laboratories, monthly corrections, NIST and the US Naval Observatory rarely drifting more than a few nanoseconds apart), (4) what comes next (in "A moving clock" one of them moves).
9. **Physics module.** The model is unchanged. Added and tested: `clockReadingsAt` (each clock's reading at a simulation time, read separately), `twoClockStripScaleEnd` and `guessPositionsOnStrip` (for each clock, the guess's position as a fraction 0 to 1, which edge it is off, and the guess minus that clock's real elapsed time), with 11 new physics tests and 9 render tests (`src/components/Experiment2.test.tsx`). `formatClockReading` is shared with Experiment 1 (`src/components/clockFormat.ts`). Tests 2,434 pass; the type check and build pass.
10. **Sources (fetched and read 8 November 2026, through a helper that reported their content; the agent did not read the pages itself).**

    | Idea | Source | Checked |
    |---|---|---|
    | Many clocks in different laboratories are compared and corrected to one shared time (about 450 clocks, about 90 laboratories, monthly corrections, NIST and the US Naval Observatory within 20 nanoseconds and rarely more than a few nanoseconds apart) | NIST, "How Do We Know What Time It Is?" (created August 2024, updated May 2025) | 2026-11-08 |
    | What a reference frame is, in a plain official page | **No plain official page found** (§29 rule 3(c)). Searched 2026-11-08 (NASA, ESA, Fermilab). One candidate was fetched and read: NASA Goddard, "Lesson 23, Frames of Reference: The Basics" (a high-school teacher's lesson plan, last updated 2004, archived and no longer updated). It defines a frame as "a set of reference points with respect to which motion is measured". **Not linked:** it is harder than a first-time learner's page, it is archived, and its last section says that time does not flow at the same rate in two frames, which the next chapters are meant to let the learner discover (§12). The introduction defines the term in its own words | 2026-11-08 |
    | A real experimental result to cite | None: this experiment uses no real result, so there is no paper to link | 2026-11-08 |

11. **Browser check (agent, 2026-11-08).** Covered the guesses 7 (Clock A) and 12 (Clock B): the two clocks, Part 1's two-row strip with both white boxes, a Part 2 run at 20 seconds (pink Event B on both rows, scale to 40 s), the tutor's three questions, the explanation (the guesses marked as 3 seconds less and 2 seconds more, points 1 to 4) and Start over. One fix after the first look: the dashed event line crossed the reading text on the strip (the text now has a dark outline).
12. **Not done, and open.**
    - The owner has not reviewed the finished page.
    - **The sentence "This is a basic property of a reference frame: everyone standing still in that frame agrees about time" has no source on the page** (it follows the earlier text of this specification, kept by the owner).
    - **No plain official page found for "reference frame"** (see the source table; §29 rule 3(c)). The owner may still choose to link the NASA Goddard lesson plan.
    - Not checked: the edge arrow by eye (render tests only), other guess answers, other durations and the "Other" box, the words box and link by eye, the captions in full, dark mode (the tutor box keeps its fixed light colours), narrow widths, other browsers, keyboard use, a real learner.
    - Differences from the approved draft: Part 2 defaults to 20 seconds, START stays disabled after the Part 1 run (Start over is the way back), and the words box's formula entry appears only after the run.
