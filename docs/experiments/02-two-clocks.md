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

