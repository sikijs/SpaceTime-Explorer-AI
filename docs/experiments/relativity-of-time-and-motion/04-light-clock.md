# Experiment 4: The Light Clock

**Status: APPROVED by the project owner. The defaults proposed under "Decisions Needing Human Review" stand unless changed.**

## Overview

Experiment 3 showed that a moving clock measures less elapsed time than the lab observer: the moving clock reads `lab time × √(1 − v²/c²)`. It did not explain *why*.

Experiment 4 explains why, using the simplest clock that makes the reason visible: a **light clock**. A light clock ticks each time a pulse of light travels from one mirror to another and back. When the light clock is moving, the lab observer sees the light travel a longer, diagonal path. If light travels at the same speed `c` in the lab, the longer path must take longer. That extra lab time per tick is time dilation.

This follows the progression already planned in `01-clock.md` §18 (Experiment 4: "The Light Clock — explore why the speed of light leads to time dilation").

---

## Learning Objective

After this experiment, the learner should understand:

1. A light clock measures time by counting round trips of a light pulse between two mirrors.
2. When the light clock moves sideways, the lab observer sees the pulse travel a longer, diagonal path per tick.
3. Light travels at the same speed `c` for both clocks, so the longer path takes more lab time.
4. Therefore the moving clock's ticks are further apart in lab time, which is the time dilation seen in Experiment 3.
5. The size of the effect depends on the speed, and the geometry (a right triangle) gives the same factor as Experiment 3.

---

## Physical Situation

### Two identical light clocks

- **Rest clock**: at rest in the lab.
- **Moving clock**: identical in construction, moving at constant speed `v` through the lab, perpendicular to the line joining its mirrors.

Each clock has two mirrors separated by a distance `L`. A light pulse starts at the bottom mirror, travels to the top mirror, and returns. One round trip is one **tick**.

### Simplifying assumptions (all must be stated to the learner)

- Flat spacetime: no gravity, no acceleration, constant velocity only.
- Mirrors are perpendicular to the direction of motion (the "transverse" light clock). The parallel orientation is not covered.
- **Light travels at the same speed `c` in the lab frame for both clocks.** This is presented as an established physical fact (Einstein's postulate), not derived here. It is the key assumption of the experiment.
- Both clocks start together at one lab event: same place, pulses emitted at the same moment.
- The lab has synchronized clocks at rest (as established in Experiment 2), so lab time can be assigned to events at different places. The lab is a reference frame: its clocks and observers are all at rest relative to one another.
- The moving clock is not at rest relative to the lab clocks, so it is not part of the lab's reference frame. It has a reference frame of its own, in which it is at rest, and that frame moves relative to the lab. Two reference frames are involved: the lab's and the moving clock's.
- The moving clock's light source and both of its mirrors are part of the moving clock. Seen from the lab, they always move together, sideways, at the same speed. None of them moves before or after the others.

### Not introduced

Length contraction, relativity of simultaneity, the parallel light clock, gravity, acceleration, formal terms such as "Lorentz factor" or "γ".

---

## Physics Model

### Units

Distances in light-seconds, times in seconds, `c = 1`. Velocity is a fraction of `c`, as in Experiment 3.

Mirror separation `L = 0.5` light-second, so that one round trip at rest takes exactly 1 second. This is an idealised, deliberately large clock chosen so the numbers are easy to read.

### Rest clock

```
path per tick         = 2L                    = 1 light-second
tick duration (lab)   = path / c              = 1 second
```

### Moving clock, as seen in the lab

During one tick (lab duration `Δt`) the clock moves sideways by `v·Δt`. The pulse goes up half of the tick and down the other half, so each leg has horizontal displacement `v·Δt/2` and vertical displacement `L`:

```
path per tick = 2 · √( L² + (v·Δt/2)² )
```

Light travels at `c` in the lab, so `path = c · Δt`. Solving:

```
Δt = 2L / (c · √(1 − v²/c²))  =  (rest tick duration) / √(1 − v²/c²)
```

So the lab-frame duration of one moving-clock tick is longer than one rest tick by the factor `1 / √(1 − v²/c²)`. Equivalently, the ratio `rest tick / moving tick = √(1 − v²/c²)` is exactly the time dilation factor from Experiment 3.

### Values at the preset speeds (rest tick = 1 s)

| Speed | Moving-clock tick, lab time | Light path per tick | Sideways distance per tick |
|-------|-----------------------------|---------------------|-----------------------------|
| 0.1c  | 1.005 s                     | 1.005 ls            | 0.101 ls                    |
| 0.3c  | 1.048 s                     | 1.048 ls            | 0.314 ls                    |
| 0.5c  | 1.155 s                     | 1.155 ls            | 0.577 ls                    |
| 0.8c  | 1.667 s                     | 1.667 ls            | 1.333 ls                    |

### Result structure (proposed)

```typescript
interface LightClockExperimentResult {
  velocity: number                  // fraction of c
  mirrorSeparation: number          // L, light-seconds
  restTickDuration: number          // seconds (lab time)
  movingTickDuration: number        // seconds (lab time)
  restLightPath: number             // light-seconds
  movingLightPath: number           // light-seconds
  sidewaysDistancePerTick: number   // light-seconds
  lightSpeedRest: number            // restLightPath / restTickDuration
  lightSpeedMoving: number          // movingLightPath / movingTickDuration
  timeDilationFactor: number        // restTickDuration / movingTickDuration
}
```

---

## Learner Controls

- **Speed of the moving light clock**: presets 0.1c, 0.3c, 0.5c, 0.8c, or Other (0.01c to 0.99c), the same as Experiment 3. The interface must explain what `c` means, as in Experiment 3.
- No duration control: each run shows exactly one tick of each clock.
- Animation playback speed is a presentation choice only and must not change any result.

---

## Prediction Activity

Before running, the learner sees the scenario:

> Two identical light clocks. The rest clock ticks once every 1 second. The other clock moves sideways at [speed]. The lab observer watches the light pulse in each clock. How long, in lab seconds, will one tick of the moving clock take?

The learner enters a number of seconds. START is disabled until a prediction is entered, as in Experiments 1–3.

Many learners will predict 1 second (same as the rest clock). That is a valuable prediction because it sets up the observation.

---

## Experiment Behavior

### Display

Two panels side by side inside the experiment: **Rest clock** and **Moving clock (seen from the lab)**. Each shows two mirrors and a light pulse.

- Rest clock: the pulse travels straight up and down, and repeats every tick.
- Moving clock: the clock slides sideways while the pulse follows a diagonal path up and then down (a "V" shape when tracing the path).
- The path of each pulse is traced on screen so the learner can compare path lengths.
- A lab time readout is shown.
- Each clock has a digital readout in the same style as Experiment 3, showing that clock's own elapsed time: the rest clock's equals lab time, and the moving clock's equals lab time × the time dilation factor.

### Introductory text

Before the learner predicts, the interface explains, in plain words:

- How a light clock works, that one round trip is one **tick**, what a **light-second** is, and the mirror separation.
- The simplifying assumptions: no gravity and constant speed, sideways motion at right angles to the mirrors, both clocks starting together, and synchronized lab clocks (with **lab time** defined).

The constancy of the speed of light is deliberately *not* stated before the run, because the tutor's conceptual question depends on the learner reasoning about it. The tutor states it explicitly afterwards, as this specification requires.

### Run

Both pulses start at the same lab moment. The rest pulse keeps ticking (finishing its first round trip first). The moving pulse completes exactly one round trip, and when it returns the run ends. At that moment the rest clock reads the lab time and the moving clock reads exactly one rest tick (1 s).

### Playback

Playback is slowed for viewing. The physical result is determined by the model, not by the playback speed.

### Implementation notes (display and layout)

- **Title and term.** The experiment is displayed as "Experiment 4 — The Light Clock: Why Time Dilation Happens", with the sidebar title "Why time dilation happens". The introduction question names the effect from Experiment 3 ("This effect is called time dilation"), and the tutor's explanation calls the factor time dilation.

- **Placement:** the two clocks are placed directly under the START button, below the speed and prediction controls, so the run is on screen the moment it begins. When START is pressed, the page scrolls the clocks into view, so this also holds on small windows.
- **Moving-clock drawing:** both mirrors are drawn moving together with the clock. Dashed lines mark where the two mirrors were at the start, each labelled "start". The moving clock's caption reads: "Moving at [speed]c (seen from the lab). Both mirrors move together. Dashed lines show where they started." This clears up that the light's path begins at the starting position of the bottom mirror, not at a mirror that stayed still.
- **Animation guard:** progress through the run is kept between 0 and 1, because the frame timestamp of the browser can fall slightly before the recorded start time, which would otherwise give a negative lab time and stop the page.

---

## Results Display

After the run, show:

- Rest clock: light path (1.000 ls), tick duration (1.000 s)
- Moving clock: light path, tick duration, sideways distance per tick
- Light speed for each clock (path ÷ duration), showing both equal `c`
- The learner's prediction versus the actual moving-tick duration
- Neutral presentation first: values only, no explanation, per the project's Predict → Experiment → Observe → Explain cycle

The explanation is given by the tutor after the learner has observed and responded, not in the results panel. It uses the right-triangle geometry and states the resulting time dilation factor for the chosen speed. The algebraic formula itself is not shown in this experiment, in keeping with introducing mathematics gradually.

---

## Expected Observations

1. The moving pulse follows a longer path than the rest pulse.
2. Both pulses move at the same speed, `c`.
3. The moving clock's tick takes more lab time than the rest clock's tick.
4. Faster clock: longer diagonal path and longer tick. The effect is tiny at 0.1c and large at 0.8c.

---

## Expected Learner Understanding

The learner should be able to say: "The moving clock's light has farther to go, light can't go faster, so each tick takes longer. That is why the moving clock runs slow."

---

## New Concepts Introduced

1. Light clock as a way to measure time.
2. Light path geometry in different frames (right triangle).
3. The constancy of the speed of light in the lab frame, as the cause of time dilation.
4. Connecting a formula to a picture: the Experiment 3 factor `√(1 − v²/c²)` comes from the triangle.

---

## Relationship to Previous Experiments

- **Experiment 1**: a clock measures time along its own history. A light clock is one concrete kind of clock.
- **Experiment 2**: synchronized clocks at rest agree. The lab's synchronized clocks are what allow lab time to be assigned to the moving clock's events.
- **Experiment 3**: gave the size of the effect. Experiment 4 gives the reason. The timing ratio here must equal the factor in Experiment 3 for the same speed.

## Relationship to Later Experiments

- **Experiment 5** ("Why Can't Light Go Faster?", per `01-clock.md` §18) builds on the role of the invariant speed of light introduced here.

---

## Required Physics Tests

1. At v = 0: moving tick equals rest tick (1 s) and paths are equal.
2. At 0.6c: moving tick = 1.25 s. At 0.8c: 5/3 s. At 0.5c: 1/√0.75 s.
3. Moving light path is longer than rest light path for any v > 0.
4. Light speed (path ÷ duration) equals `c` for both clocks at every tested speed.
5. The right-triangle relation holds: `(c·Δt/2)² = L² + (v·Δt/2)²`.
6. Consistency with Experiment 3: `restTick / movingTick` equals `runMovingClockExperiment(…, v).timeDilationFactor`.
7. Larger v gives a longer moving tick; the increase is non-linear in v.
8. Velocity outside 0 ≤ v < c is rejected.
9. Deterministic across repeated runs; independent of any UI or animation.

---

## AI Tutor Behavior

- **Before**: encourage a prediction. Ask what makes the learner think the tick will be the same or different.
- **During**: silent.
- **After**:
  1. Observation: "What did you notice about the two light paths?"
  2. Prediction comparison: learner's prediction versus actual.
  3. Conceptual question: "Both pulses travel at the same speed. One has farther to go. What does that mean for the time it takes?"
  4. Explanation: the diagonal path is the hypotenuse of a right triangle; because light's speed is the same, the longer path means a longer tick; this is the same factor as in Experiment 3.
- The tutor must state that constancy of light speed is the assumption on which this experiment rests, and must not present the result as derived without it.
- The tutor must not add physics beyond this specification.

### Implementation notes (tutor)

The explanation (step 4) is shown in this order, in plain words, so the learner sees the view they watched before the contrasting view:

1. **The clock itself:** the source and both mirrors are part of the same moving clock, so, seen from the lab, they always move together, side by side, at the same speed.
2. **The lab's reference frame** (the view the learner just watched): the whole moving clock slides sideways. One tick is followed in steps: the pulse leaves the source; crossing the gap takes time, during which the source and the top mirror both keep moving sideways; so when the pulse reaches the top mirror, that mirror has moved and is no longer above the spot where the pulse started; the pulse must travel on a slant to reach it, which is why its path is diagonal; the same happens on the way back down.
3. **The moving clock's own reference frame** (the view of someone riding along with the clock): the source and both mirrors are at rest next to that observer, so nothing slides sideways, and the pulse goes straight up and straight back down, like the rest clock.
4. **Summary:** one pulse, one clock, two views, and both are correct. The lab's diagonal path is the long side of a right triangle, longer than the rest clock's straight path.
5. The constancy-of-light-speed statement and the time dilation factor for the chosen speed follow, as specified above.
6. **What this means for a traveller:** a spaceship coasting at a steady speed close to the speed of light has, as measured in the lab, a slow clock, and so does everything else on board, including the traveller's own aging. The closer the speed is to c, the bigger the gap, so a traveller who ages one year on the ship could find that many years have gone by on the lab's clocks. This deliberately does not describe a return trip: turning around involves acceleration, which this experiment excludes. The step from a slow light clock to slow aging goes beyond the clock-only physics above, and was approved by the project owner.
7. **Daily-life example and simple math (added 2026-09-26, at the owner's request, per `CLAUDE.md` §15).** Before the "In the lab's reference frame..." paragraph, a short analogy ("A familiar version of this") compares the two views to tossing a ball straight up while riding a train: straight up and down to the rider, a diagonal path to a platform observer, both correct. After the "So: one pulse, one clock, two views..." paragraph, a "Working out the diagonal, with real numbers" paragraph walks through the actual arithmetic for the learner's chosen speed — the mirror separation, the sideways distance per half-tick, and the resulting diagonal and round-trip path lengths — using only concrete numbers, never algebraic notation, so it does not show "the algebraic formula itself" that this specification's Results Display section reserves against. `mirrorSeparation`, `sidewaysDistancePerTick`, and `movingLightPath` were added to `Experiment4Tutor`'s props (already present on `LightClockExperimentResult`) to support this.

---

## Decisions Needing Human Review

1. **Constancy of `c` as a stated postulate.** The experiment assumes it rather than testing it. Is this the right framing for a first-time learner, given Experiment 5 will explore it further?
2. **Mirror separation `L = 0.5` light-second** so a rest tick is 1 s. Idealised and physically enormous. Alternative: dimensionless units with no stated size.
3. **Single-tick run.** No duration control; one tick of each clock. Alternative: run a fixed lab duration and count ticks, which ties more directly to Experiment 3 but is harder to animate.
4. **Prediction is one number** (moving tick duration in lab seconds). Alternative: a qualitative choice (same / longer / shorter) first, then the number.
5. **Terminology.** This spec avoids "proper time" and "γ". Introduce either here or defer?
6. **Layout.** Because Experiment 4 explains Experiment 3 and uses the same speed controls, placing 3 and 4 side by side on the page is appropriate. Should they stay independent (separate speed selections) or share one speed control?
7. **Transverse orientation only.** Confirm the parallel light clock is out of scope.

---

## Success Criteria

1. The physics model implements the light-clock geometry and matches Experiment 3's factor.
2. Learner predicts before running; START requires a prediction.
3. The display makes the longer diagonal path clearly visible.
4. Results are shown neutrally, then explained by the tutor after the learner responds.
5. All physics tests pass.
