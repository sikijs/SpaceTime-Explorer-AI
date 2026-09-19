# Experiment 3 Proposal: Moving Clock

## Executive Summary

After learning that (1) a clock measures elapsed time along its own history, and (2) multiple clocks at rest in the same reference frame measure time identically, the learner should now investigate what happens when a clock moves relative to a stationary observer.

**Experiment 3** introduces the relationship between motion and time measurement, setting up the learner's understanding of time dilation — one of the most counterintuitive ideas in relativity.

---

## Learning Objective

After completing Experiment 3, the learner should understand:

1. When a clock moves relative to an observer, the observer and the clock measure elapsed time differently.
2. A moving clock measures less elapsed time than a stationary observer measures for the same event pair.
3. This effect is **not** a malfunction of the moving clock — it is a fundamental property of time itself in relativity.
4. The asymmetry (moving clock reads less) is real and measurable, not a measurement error or illusion.
5. The ratio of elapsed times depends on the speed of the moving clock.

---

## Physical Situation

### Reference Frame

There is one inertial reference frame (the lab frame) in which an observer is stationary.

A second clock is moving through the lab at a constant velocity.

### Initial State

- **Observer's Clock**: Located at a fixed position in the lab, initially reading 00:00:00
- **Moving Clock**: Located at some position, initially synchronized with the observer's clock at the start event (both read 00:00:00)
- **Moving Clock Speed**: A controllable parameter (the learner can adjust the speed)

### Events

**Start Event (t = 0)**:
- The moving clock and observer's clock are at the same location
- Both clocks read 00:00:00
- The moving clock begins moving at the selected velocity

**End Event**:
- A specified amount of **lab time** has elapsed (chosen by the learner)
- The moving clock has traveled some distance and is now at a different location
- Both clocks are read at this moment

### Key Assumption

This experiment introduces special relativity without curved spacetime or gravitational effects. We assume:

- Flat spacetime (no gravity)
- No acceleration (constant velocity motion)
- Einstein's postulates apply (constancy of light speed, equivalence of inertial frames)
- **Crucially**: Time is not universal; it depends on the reference frame and relative motion

---

## Physics Model

### Conceptual Picture

In the lab frame:
- The observer's clock advances at its normal rate: 1 second per second
- The moving clock advances **more slowly** due to time dilation

### Time Dilation Formula

If the moving clock travels at velocity *v* relative to the lab frame, and the observer measures a lab time interval Δt_lab, then the moving clock measures:

```
Δt_moving = Δt_lab × √(1 - v²/c²)
```

where c is the speed of light.

The factor √(1 - v²/c²) is the **time dilation factor** (it equals 1/γ, where γ is the Lorentz factor). We do not introduce γ in this experiment, to keep terminology simple.

### Computational Approach

To make the experiment educational:

1. The learner selects an observable lab time duration (5s, 10s, 20s, 30s, or custom)
2. The learner selects a velocity as a fraction of light speed (e.g., 0.1c, 0.3c, 0.5c, 0.8c, etc.)
3. The physics model calculates:
   - Lab time elapsed: Δt_lab (as selected)
   - Time dilation factor: √(1 - v²/c²)
   - Moving clock elapsed time: Δt_moving = Δt_lab × √(1 - v²/c²)
4. Both values are displayed so the learner can see the difference

### Result Structure

```typescript
interface MovingClockExperimentResult {
  labTimeDuration: number          // seconds (what observer measures)
  velocity: number                  // fraction of c (e.g., 0.5 for half light speed)
  speedOfLight: number             // for reference (299,792,458 m/s or we normalize to 1)
  
  // Observer's measurements
  observerElapsedTime: number      // same as labTimeDuration
  
  // Moving clock's reading
  movingClockElapsedTime: number   // less than labTimeDuration
  
  // The effect
  timeDilationFactor: number       // √(1 - v²/c²)
  timeDifferential: number         // how much less the moving clock measured
  distanceTravelled: number        // light-seconds, in the lab frame: velocity × lab time (added for the diagram)
}
```

---

## Learner Controls

### Lab Time Duration

The learner selects how long the experiment runs in the lab frame.

Presets:
- 5 seconds
- 10 seconds
- 20 seconds
- 30 seconds

Custom option: 1–120 seconds

### Moving Clock Velocity

The learner selects the speed of the moving clock as a percentage or fraction of light speed.

Presets:
- 0.1c (10% light speed)
- 0.3c (30% light speed)
- 0.5c (50% light speed)
- 0.8c (80% light speed)

Custom option: 0.01c to 0.99c

**Note**: We deliberately avoid v = c (light speed) because photons don't have a reference frame and the math breaks down. The learner cannot select v ≥ c.

### Animation Speed

The visual playback can be accelerated, but **the physical result must not change**.

If the learner adjusts animation speed, the lab time and moving clock readings remain the same; only the visual playback rate changes.

---

## Prediction Activity

### Before the Experiment

The learner sees the scenario:

> You have a moving clock traveling at [velocity] relative to the lab. The observer measures [lab duration] seconds elapsing. How much time do you think the moving clock will read?

The learner makes a **numerical prediction** of the moving clock's elapsed time (in seconds).

### Educational Intent

Most learners will intuitively predict that both clocks measure the same time (based on Exp 1 & 2). This incorrect prediction is valuable because it creates cognitive dissonance when the result shows the moving clock measured less time. The learner's surprise is a teaching opportunity.

---

## Experiment Behavior

### Visual Display

The screen displays:

```
┌─────────────────────────────────────────────────────┐
│ Experiment 3 — Moving Clock                         │
├─────────────────────────────────────────────────────┤
│                                                     │
│  Lab Time Elapsed:     00:00:10                    │
│  Moving Clock Reading: 00:00:08                    │
│  Moving Clock Speed:   0.6c                        │
│                                                     │
│  [Diagram showing observer at fixed location,      │
│   moving clock passing by at high speed]           │
│                                                     │
│  Prediction: 10 seconds                            │
│  Actual:     8 seconds                             │
│  Difference: -2 seconds (moving clock measured     │
│              2 seconds less)                        │
│                                                     │
└─────────────────────────────────────────────────────┘
```

### Animation

During the experiment:
1. A diagram shows the lab observer and the moving clock
2. The moving clock animates across the screen at the selected velocity
3. Both clock readings animate upward (but at different rates)
4. The lab clock advances normally
5. The moving clock advances more slowly

The visual ratio of advancing should match the calculated time dilation factor.

### Implementation notes (display and controls)

- **Diagram:** a horizontal track shows the lab clock fixed at the start and the moving clock sliding away from it. The moving clock's position and the distance label (in light-seconds) come from the physics model at each lab time. The track is scaled to each run so the moving clock reaches the far end when the run finishes, because distances range from a fraction of a light-second to over a hundred.
- **Introductory text:** before the learner predicts, the interface explains what the experiment is about and states the assumptions: no gravity and constant speed, both clocks starting together at the same place, synchronized lab clocks (with lab time defined), and what a light-second is. Einstein's postulates are not stated here: Experiment 4 is where the constancy of the speed of light is introduced.
- **Zero-speed baseline:** a `0c` preset is offered so the learner can see that with no motion the two clocks agree (Expected Observation 5). A custom speed must still be between 0.01c and 0.99c.
- **Custom duration:** 1 to 120 seconds, as specified under Learner Controls.
- **Clock readings** are shown as `MM:SS.s` rather than `HH:MM:SS`, so that both clocks fit side by side and small differences remain visible.
- **Emphasising the asymmetry** (Success Criterion 5) is done by the tutor's explanation, not the neutral results panel.

### Key Insight Display

When the experiment completes, emphasize:

> **The moving clock measured less time than the observer measured for the same event pair.**
>
> This is not a malfunction. It is a fundamental property of relativity: the measurement of elapsed time depends on the observer's reference frame and motion relative to the events being measured.

---

## Results Display

### Structured Results

```
Duration (Lab Frame):        10 seconds
Moving Clock Speed:          0.6c (60% of light speed)

Lab Observer's Measurement:  10.0 seconds
Moving Clock's Reading:      8.0 seconds

Time Dilation Factor:        0.80
                             (√(1 - 0.6²) = √(0.64) = 0.80)

Difference:                  -2.0 seconds
                             (The moving clock measured 2 seconds less)
```

### Prediction Comparison

```
Your Prediction:             [Learner's prediction]
Actual Moving Clock Reading: 8.0 seconds

Were you surprised?
```

### Implementation notes (results panel)

- The results panel shows the values only, so it stays neutral in the Predict → Experiment → Observe → Explain cycle. The "Were you surprised?" question and the emphasised key-insight statement belong to the AI tutor step, after the learner has observed and responded.
- Values are shown to three decimal places (for example 8.660 seconds) so that small effects at low speeds remain visible.
- The time dilation factor is shown with the speed substituted into the expression, `√(1 − v²)` with speeds in units of c. The intermediate arithmetic step from the example above is not shown, because the interface displays results from the physics model rather than calculating them.
- The "Difference" is shown as the moving clock minus the lab clock, and reads `0.000` when the effect is below the displayed precision.
- The distance the moving clock travelled (in light-seconds) is also shown, matching the diagram.

---

## Expected Observations

The learner should observe:

1. For any velocity > 0, the moving clock measures less time than the lab observer
2. As velocity increases (approaches light speed), the effect increases dramatically
3. At very low speeds, the difference is tiny (hard to notice)
4. At high speeds (0.8c+), the moving clock measures only a fraction of the lab time
5. At v = 0 (no motion), both measure the same time (consistent with Exp 2)
6. The relationship between velocity and time dilation is non-linear (not simply proportional)

---

## Expected Learner Understanding

After this experiment, the learner should be able to:

1. Explain that moving clocks and stationary observers measure different elapsed times
2. Predict (qualitatively) that a faster-moving clock will show a larger time difference
3. Recognize that this effect grows dramatically at high speeds
4. Begin to grasp that "elapsed time" is not absolute — it depends on reference frame and motion
5. See why Einstein's postulates (constancy of light speed) lead to time dilation

---

## New Concepts Introduced

1. **Motion and Time**: The relationship between an object's velocity and how it measures time
2. **Time Dilation**: Moving clocks run slower (measure less time) relative to stationary observers
3. **Reference Frame Dependence**: The measurement of elapsed time is frame-dependent, not universal
4. **Speed of Light as Limit**: Why velocities are expressed as fractions of c; why c is special
5. **Non-Linearity of Relativistic Effects**: Why doubling velocity doesn't double the time dilation effect

---

## Connection to Previous Experiments

**Experiment 1** taught:
> A clock measures elapsed time along its own history.

**Experiment 2** extended this:
> Multiple clocks at rest in the same reference frame measure time identically.

**Experiment 3** complicates it:
> When a clock moves relative to an observer, they measure time differently. The moving clock measures less time — not because it's broken, but because time itself is relative to reference frame and motion.

---

## Relationship to Future Experiments

This experiment establishes the foundation for:

1. **Time Dilation Revisited** (future): Exploring time dilation at different speeds, and understanding why it happens
2. **Relativity of Simultaneity** (future): Showing that events simultaneous in one frame are not simultaneous in another
3. **Light Clocks and Proper Time** (future): Understanding why time dilation occurs through the light-speed constraint
4. **Spacetime Diagrams** (future): Visualizing the geometry of spacetime and how it explains relativistic effects
5. **The Twin Paradox** (future): A famous thought experiment that relies on understanding time dilation

---

## Required Physics Tests

The physics model should be tested to verify:

1. At v = 0 (stationary clock), elapsed time equals lab time (consistent with Exp 2)
2. For v > 0, moving clock elapsed time < lab elapsed time
3. For v approaching c, moving clock elapsed time approaches 0
4. Time dilation factor √(1 - v²/c²) is correctly computed
5. For a given v and lab time, the result is deterministic and repeatable
6. Velocity constraints are enforced (0 ≤ v < c)
7. Different lab durations and velocities produce physically correct results

**Example tests:**

```typescript
it("stationary clock measures same time as observer", () => {
  const result = runMovingClockExperiment(10, 0);  // 10s, v=0
  expect(result.movingClockElapsedTime).toBe(result.observerElapsedTime);
});

it("moving clock at 0.6c measures 0.8 of lab time", () => {
  const result = runMovingClockExperiment(10, 0.6);
  expect(result.movingClockElapsedTime).toBeCloseTo(8, 1);  // 10 * 0.8 = 8
});

it("faster velocity produces greater time dilation", () => {
  const slow = runMovingClockExperiment(10, 0.3);
  const fast = runMovingClockExperiment(10, 0.7);
  expect(fast.movingClockElapsedTime).toBeLessThan(slow.movingClockElapsedTime);
});

it("time dilation approaches zero as velocity approaches c", () => {
  // 10 s × √(1 − 0.99²) ≈ 1.41 s, so the bound is 1.5 (an earlier draft wrongly said 1).
  const nearLight = runMovingClockExperiment(10, 0.99);
  expect(nearLight.movingClockElapsedTime).toBeLessThan(1.5);
});
```

---

## AI Tutor Behavior

### Before the Experiment

The tutor prepares the learner:

> "So far, you've learned that a clock measures elapsed time along its own history, and that multiple clocks at rest measure time the same way. Now let's ask a new question: What if one of the clocks is moving?"
>
> "I want you to predict: if this clock is moving at [velocity], and the lab observer measures [duration] seconds, how many seconds will the moving clock read?"

The tutor listens to the learner's reasoning and may ask:

> "What makes you think the moving clock will read [their answer]?"

### During the Experiment

The tutor remains silent while the experiment runs.

### After the Experiment

The tutor follows the observe-predict-compare-explain cycle:

1. **Observation**: "What did you observe? Look at the two clock readings. Did the moving clock measure the same time as the observer?"

2. **Prediction Comparison**: "You predicted the moving clock would read [prediction]. It actually read [actual]. Were you surprised?"

3. **Conceptual Question**: "Why do you think the moving clock measured a different amount of time? What could be different between a clock that's moving and a clock that's stationary?"

4. **Gentle Explanation** (if learner struggles): "This is one of the most counterintuitive ideas in relativity. A moving clock — a perfectly good clock — actually measures less time than a stationary observer measures for the same event pair. It's not broken. It's how time works when things move fast relative to each other."

### Tutor Adjustments

**If prediction was accurate**: "Great! You intuited that motion and time are connected. Let's explore why that happens."

**If prediction was very wrong**: "That's really interesting. Most people intuitively think both clocks measure the same time — you're not alone. But this experiment suggests something surprising about the nature of time itself."

### Implementation notes (tutor)

- The tutor appears after the run finishes and moves through the four steps above, each needing a typed answer before continuing. It has no pre-run step, matching Experiments 1, 2 and 4.
- The spec does not define "accurate" or "very wrong". The implementation uses the size of the effect as the margin: if the prediction is within half the difference between the lab clock and the moving clock of the moving clock's actual reading, the "Great!" reaction is shown; if it is within that margin of the lab clock's reading (the learner expected no difference), the "you're not alone" reaction is shown; otherwise no reaction line is shown. This rule needs the project owner's confirmation.
- The explanation is always shown at the end. The tutor cannot tell whether the learner "struggled".
- The phrase "the same event pair" is worded as "between the same two events: the start and the end of the run", because the lab clock is not at the location of the run's end event; lab time at that event is read from synchronized lab clocks.
- The explanation also states the key insight (elapsed time between events depends on the observer's reference frame and motion) and points to Experiment 4.
- At the `0c` baseline there is no effect to explain, so the tutor does not say the moving clock reads less. It says the clocks agree, as in Experiment 2, and invites the learner to try a speed above 0c.

---

## Key Design Decisions

### Why Start with Moving Clock Before Light Clocks

A traditional relativity course often uses "light clocks" to derive time dilation (showing photons bouncing inside a moving box). While elegant, light clocks are abstract and hard to visualize.

This experiment uses a simpler conceptual model: a moving clock in the lab frame, without explaining *why* it runs slow yet. The explanation comes in a future experiment.

### Why We Don't Show Spatial Separation Initially

Relativity of simultaneity (events simultaneous in one frame but not another) is a separate, equally mind-bending concept. Mixing both time dilation *and* relativity of simultaneity in one experiment would overload the learner.

Experiment 3 focuses on time dilation. Relativity of simultaneity deserves its own experiment.

### Why Velocity is Expressed as Fraction of c

Using c (light speed) as a reference makes it clear that light speed is special. Later, the learner will learn *why* c is special (it's the same in all reference frames).

Expressing velocity as 0.6c is more intuitive than saying "180,000 km/s" and invites questions like "Why is light speed the limit?"

---

## Success Criteria

Experiment 3 is successful when:

1. ✅ The physics model correctly implements time dilation: Δt_moving = Δt_lab √(1 - v²/c²)
2. ✅ The moving clock elapsed time is always ≤ lab time (equality only at v = 0)
3. ✅ The UI clearly displays both the lab observer's measurement and the moving clock's reading
4. ✅ The learner can adjust both duration and velocity before the experiment
5. ✅ The results clearly show the time difference and emphasize the asymmetry
6. ✅ The AI tutor guides the learner through observation → prediction comparison → conceptual reasoning
7. ✅ The learner can articulate (in tutor conversation) that moving clocks measure less time
8. ✅ All physics tests pass, including edge cases (v=0, high velocity, various durations)
9. ✅ The experiment integrates visually with Experiments 1 & 2 (same design language, layout, styling)

---

## Notes for Implementation

1. **Physics First**: Implement and test the time dilation calculation independently before building the UI
2. **No Magic Numbers**: The speed of light c should be defined as a constant; velocity inputs should be validated
3. **Careful Animation Syncing**: The moving clock visual animation must display a time dilation factor that matches the calculated result
4. **Edge Cases**: Test v = 0 (should equal Exp 2), v → c (should approach 0), and intermediate speeds
5. **Educational Tone**: Emphasize in results that this is a *feature* of relativity, not a bug in the clock
6. **Avoid Confusion**: Make clear that "the observer measures" and "the moving clock reads" are different things
