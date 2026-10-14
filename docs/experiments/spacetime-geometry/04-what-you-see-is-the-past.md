# Experiment 4 (Spacetime Geometry): What You See Is the Past, Where a Moving Object Is Versus Where It Looks to Be

**Status: APPROVED by the owner on 2026-10-14, with all ten "Decisions Needing Human Review" taken on their defaults.** Proposed by Claude per `CLAUDE.md` §23 Stages 1 to 3 on 2026-10-14. Nothing is implemented yet. All learner-facing wording below is draft wording for the owner's line-by-line approval (§28.1).

**Group:** "Spacetime Geometry: What Is Real, What Is Seen". Specifications for this group live in `docs/experiments/spacetime-geometry/`. This is the fourth item of the roadmap in `01-the-interval.md`, which is approved as a direction only ("What you see is the past. What a fast object looks like versus where it is measured to be, using the light cone.").

---

## Overview

The first three experiments of this group were about what is **measured**: the times, distances and order of events as an observer works them out from their own ruler and synchronized clocks, after allowing for the time light takes to travel. Experiment 3 said so plainly in its last paragraph: "That is not what they would see with their own eyes, because light takes time to arrive: a later experiment returns to that." This is that experiment.

The new idea is one thing: **what you see is the light that reaches you now, and that light left the object earlier. So a moving object is not where it looks to be, and its image can seem to move at a different speed from the object itself.**

The situation is a spaceship flying straight toward the lab, or straight away from it, at a steady speed. An observer in the lab has a telescope. The lab can work out where the ship really is at every moment, using its ruler and its synchronized clocks. The telescope shows where the ship *looks* to be at every moment. The two are different, and the difference is not small:

- A ship coming **toward** the lab looks like it is moving **faster** than it really is. At 0.6 of the speed of light it looks like it is moving at 1.5 times the speed of light.
- A ship going **away** looks like it is moving **slower** than it really is. At 0.6 of the speed of light it looks like it is moving at 0.375 of the speed of light.

The learner picks a direction and a speed, predicts whether the ship's image will look faster, slower or the same, and runs the experiment. A spacetime diagram (the kind from Experiment 3, with time upward and position sideways) shows the ship's path. At each moment of the run, the light cone of the lab's "looking" event is drawn going **down** into the past, and the place where it crosses the ship's path is the ship's **seen** position. A second picture plots **where the ship is** and **where it looks to be**, against the lab's clock, so the two slopes can be compared directly.

An honest limit, stated to the learner and not hidden: **this effect comes only from light taking time to travel. It would be the same in a world with no relativity at all.** It is here because "seen versus measured" is the idea the group's later experiments (aberration, the Doppler effect, a fast object looking rotated) all depend on, and because it uses the light cone the learner already knows, now pointing into the past.

---

## Learning Objective

After this experiment, the learner should understand:

1. What an observer sees at one moment is the light that reaches them at that moment, and that light left the object **earlier**. What an observer *sees* is not what is happening to the object *now*.
2. The set of events whose light reaches an observer at one moment is the observer's **past light cone**: the same cone as in Experiment 2, but pointing back in time. The place where the past cone crosses the object's path is where the object looks to be.
3. For a ship coming toward the lab, light from later positions has a shorter trip, so it arrives closer together in time, and the ship's image looks faster than the ship. For a ship going away, the opposite: the image looks slower.
4. An image that looks faster than light does **not** break the speed limit. The ship's real speed, as measured by the lab, is below the speed of light. The "speed of the image" is how fast the place where the ship *looks* to be is changing, and nothing and no signal travels along it.
5. (A short remark, not a demonstration.) This difference between seen and measured is not the Lorentz transformation. It comes only from the travel time of light. Later experiments add effects that really are relativistic.

---

## Physical Situation

### Reused

- Flat spacetime, no gravity, constant velocities (as in the earlier experiments).
- Units: `c = 1`, time in seconds, distance in light-seconds.
- The lab, with an observer at position 0 (the "eye"), and its ruler and synchronized clocks. "Measured" means what the lab works out, as in Experiment 3.
- The spacetime diagram of Experiment 3: position sideways, time upward, the lab's clock line, event positions drawn as squares.
- The light cone from Experiment 2, now also drawn pointing down. The two edges of the cone are paths of light, at 45 degrees (1 light-second per second).
- `classifyEventPair` from `src/physics/lightCones.ts`, to check that a seen event and the looking event are linked by light (interval zero).

### What is new

- **A ship** moving at a steady speed `v` toward the lab or away from it, along one line.
- **A looking event** `(time T, position 0)`: the lab observer looks through the telescope at time `T` on the lab's clock.
- The **past light cone** of the looking event, and where it crosses the ship's path: the **seen** position, which is the position the ship had at the **earlier** time when it sent the light now arriving.
- The ship's **measured** position at time `T`: where the lab works out the ship is at that same moment (from the ship's steady motion and the lab's synchronized clocks).
- The **image's speed**: how fast the seen position changes as the looking time `T` goes on, which differs from `v`.

### Simplifying assumptions (all stated to the learner in plain language)

- One line: the ship flies straight toward the lab observer or straight away, so the eye looks along its path.
- Constant speed, no gravity, no acceleration.
- The telescope shows only **where** the ship looks to be. It shows nothing about brightness or color (a later experiment).
- Positions are measured by the lab's clocks and ruler, as in Experiment 3. The measured motion is not affected by what is seen.

### Not introduced

Brightness, color and the Doppler shift (a later experiment), aberration (the sky bunching up ahead of a fast traveler, a later experiment), motion across the line of sight (where the effect can look even stranger and the picture needs two dimensions), a fast object looking rotated, the ship's own clock or time dilation (the ship's own time is not used), the observer's own motion, and any claim that something travels faster than light.

---

## Physics Model

All of it is the straight-line motion of an object and the travel time of light. No new relativistic formula and no new physical assumption.

### The setup, in numbers

The ship's lab-frame path is `x(t) = x₀ + s × v × t`, where `s = −1` for approaching and `+1` for receding, and `v` is the speed (a fraction of `c`, `0 < v < 1`). The lab's eye is at position 0. Light from the ship at `(t, x(t))` reaches the eye at the **looking time**

`T(t) = t + |x(t)|`

(the time the light left, plus the distance it travelled in light-seconds, at 1 light-second per second).

Two runs are fixed (Decision 4): the ship covers 4 light-seconds of measured distance.

- **Approaching:** from `x = 5` at lab time 0 to `x = 1` at lab time `4 ÷ v`. Then `T` runs from 5 to `4 ÷ v + 1`, so the image's movement is spread over `4 ÷ v − 4` looking-seconds, and the image's speed is `4 ÷ (4 ÷ v − 4) = v ÷ (1 − v)`.
- **Receding:** from `x = 1` at lab time 0 to `x = 5` at lab time `4 ÷ v`. Then `T` runs from 1 to `4 ÷ v + 5`, so the image's movement is spread over `4 ÷ v + 4` looking-seconds, and the image's speed is `v ÷ (1 + v)`.

The image's speed (a fraction of `c`) for the four proposed speeds (computed by hand from the formulas above; a script should check them before approval):

| Measured speed `v` | Approaching: image speed `v ÷ (1 − v)` | Receding: image speed `v ÷ (1 + v)` |
|---|---|---|
| 0.3c | 0.43c | 0.23c |
| 0.5c | 1.00c | 0.33c |
| 0.6c | 1.50c | 0.38c |
| 0.9c | 9.00c | 0.47c |

Three things are visible in the table:

- Approaching is always faster than the ship, and receding is always slower. The image's speed is never equal to `v` for `v > 0`.
- An approaching ship at exactly 0.5c has an image at exactly `c`. Above 0.5c the image is faster than light. The ship's measured speed is below `c` in every row.
- A receding ship's image never reaches `c`, and never passes 0.5c (as `v` approaches 1, `v ÷ (1 + v)` approaches 0.5).

### Worked example (for the tutor, with real numbers)

Approaching at `v = 0.6`. The ship goes from 5 to 1 light-seconds, a distance of 4 light-seconds. By the lab's clocks, that takes `4 ÷ 0.6 = 6.67` seconds. Light from the starting point (5 light-seconds away) takes 5 seconds to reach the eye, so that image arrives at time `0 + 5 = 5.00`. Light from the end point (1 light-second away) takes 1 second, so that image arrives at time `6.67 + 1 = 7.67`. So the image moves its 4 light-seconds in `7.67 − 5.00 = 2.67` seconds, and `4 ÷ 2.67 = 1.50`. The image moved at 1.5 times the speed of light, while the ship moved at 0.6.

Receding at `v = 0.6`. The ship goes from 1 to 5 light-seconds, again 4 light-seconds in 6.67 seconds. The first image arrives at `0 + 1 = 1.00`, and the last at `6.67 + 5 = 11.67`. So the image moves 4 light-seconds in `10.67` seconds: `4 ÷ 10.67 = 0.375`.

### New: a small independent physics module

```typescript
// src/physics/seeingThePast.ts (proposed)
export type Direction = 'approaching' | 'receding'

export interface ShipSample {
  lookingTime: number         // T, on the lab's clock
  measuredPosition: number    // where the lab works out the ship is at lab time T
  seenPosition: number        // where the ship looks to be at looking time T
  emissionTime: number        // the earlier lab time at which the light now arriving left the ship
}

export function seenAt(direction: Direction, speed: number, lookingTime: number): ShipSample
// solves  t + |x(t)| = T  for the emission time t (a linear equation), then reads off x(t)

export function runSeeingExperiment(direction: Direction, speed: number):
  { measuredSpeed: number; imageSpeed: number; firstLooking: number; lastLooking: number; samples: ShipSample[] }
```

`imageSpeed` is `distance ÷ (lastLooking − firstLooking)`, computed from the samples, not from the closed form, so that the closed form can be a separate check in the tests (test 4). `seenAt` uses no relativistic quantity. Out-of-range inputs throw `RangeError` (`speed ≤ 0` or `speed ≥ c`; `lookingTime` outside the run).

### Sign convention and limits

- Positions: right is positive, as in Experiment 3. The ship is on the right of the lab in both runs.
- "Approaching" means the ship's position decreases with time, "receding" means it increases.
- A run never crosses the eye, so the absolute value `|x|` in `T(t)` needs no special case. This is why the runs stop at 1 light-second from the lab (Decision 4).

---

## Learner Controls

1. **Direction:** two presets, "toward the lab" and "away from the lab".
2. **The ship's speed:** four presets, 0.3c, 0.5c, 0.6c and 0.9c (Decision 3).
3. **Run:** gated on the prediction, as in the earlier experiments.

---

## Prediction Activity

Before running, the learner chooses a direction and a speed and answers one question. Draft wording:

> **The question.** A ship flies **{toward the lab / away from the lab}** at **{v}c**. This is its real speed, worked out with the lab's ruler and synchronized clocks. An observer in the lab watches it through a telescope. The picture the observer sees is made of light that reaches the telescope now, and that light left the ship earlier. Compared with the ship's real speed, how fast does its *image* seem to move across the observer's view?
>
> (a) Slower than the ship's real speed. (b) The same as the ship's real speed. (c) Faster than the ship's real speed.

Not scored. The Run button stays disabled until an answer is chosen. The learner is not told which answer is right before running (§12).

Answer (c) is right for approaching ships, and (a) is right for receding ships, at every speed offered. Answer (b) is never right. It is included because it is the natural guess: it is what the learner would say if they thought a telescope shows what is happening now.

---

## Experiment Behavior

### Introductory text (draft; the owner approves the wording, §28.1)

Following the structure of existing introductions (the question, what happens, the learner's job, new terms, assumptions). It must:

- Start from an everyday idea, with no relativity: postcards. A friend travels toward you and mails you one postcard at the end of every day. The cards arrive closer together than a day apart, because each later card has a shorter trip. A friend travelling away from you does the opposite: the cards arrive further apart. (Used also as the tutor's daily-life example.)
- Remind the learner that the earlier experiments of this group were about what is *measured*, and that Experiment 3 ended by saying that this is not what an observer sees. Say that this experiment is about what is seen.
- Define the terms it needs, each in plain language before use: **measured position** (where the lab works out the ship is, from its ruler and synchronized clocks, as before), **seen position** or **where it looks to be** (the position the ship had when it sent the light that is reaching the telescope right now), **looking time** (the lab's clock reading when the observer looks), and the **past light cone** (the set of events whose light reaches the observer at one moment, the cone of Experiment 2 turned to point back in time). Define "image" as "where the ship looks to be".
- Say that the whole experiment uses one line: the ship flies straight toward or straight away from the lab.
- Give a worked calculation with real numbers (§15), using numbers that are **not** among the presets and that do not show an image faster than light (§12): for example, a ship coming toward the lab at 0.4c, going from 5 light-seconds away to 1 light-second away; by the lab's clock this takes `4 ÷ 0.4 = 10` seconds; the first light takes 5 seconds to arrive (at time 5) and the last takes 1 second (arrives at time `10 + 1 = 11`); so the image moves 4 light-seconds in `11 − 5 = 6` seconds, `4 ÷ 6 = 0.67`, which is faster than the ship's 0.4. (This does show "faster" for approaching. If the owner prefers that even "faster" is not shown before the run, the example can use a ship at rest and a flash instead; see Decision 7.)
- State the assumption that nothing travels faster than light, as before, and say that this experiment will test it only for the ship and not for the image.

### Display

An animated spacetime diagram plus a second plot, following §14 "Animated Diagrams":

1. **Labeled components on the canvas:** the lab's position and time axes, the lab's eye (a labeled mark at position 0), the ship's path (a labeled line), the looking event (a mark on the lab's clock line that moves up as the run plays), the past light cone of the looking event (two labeled lines going down and out), **the seen ship** (a hollow square on the ship's path, where the cone crosses it, labeled "where the ship looks to be"), and **the real ship** (a solid square on the ship's path at the same lab time as the looking event, labeled "where the ship really is now").
2. **A visible contrast.** The two squares are drawn at different heights on the ship's path, with a label naming each, so the learner sees that the image is the ship at an *earlier* time. This is shown by the picture and by labels, not by colour alone.
3. **A second plot, "Where the ship is and where it looks to be":** position (vertical) against the lab's clock (horizontal), with two lines, the real position and the seen position. They start at different heights and have different slopes. The slopes are labeled with the two speeds in plain words, and the difference is the result.
4. **A "How to read this diagram" caption** beneath it, matching earlier experiments. To be drafted after the direction is approved.

### Run

A short playback (proposed about 10 seconds in total; the length only sets how fast the result is shown):

1. The looking event moves up the lab's clock line from the first looking time to the last.
2. At each moment, the past cone from the looking event, the seen ship and the real ship are drawn.
3. The second plot fills in as the run plays.
4. When the run ends, both lines in the second plot are complete and labeled.

Playback speed does not change the result (§11). The result is a pure function of the direction and speed.

---

## Results Display

Shown only when the run ends. Values only, with plain labels (neutral; the explanation comes from the tutor, §12):

- the chosen direction and speed;
- a table with one row for the ship's **real motion** and one for the **image**: the distance covered (4 light-seconds in both), the time it took on the lab's clock, and the speed (a fraction of `c`);
- the learner's prediction, as a record (not marked right or wrong).

A drawing in the style of earlier experiments shows the two speeds as bars on one scale, with a line at 1 (the speed of light), so that an image faster than light is a bar that crosses it, and the ship's own bar never does.

---

## Expected Observations

- For each preset, the ship's real speed is the chosen `v`, and its bar is always below the line at 1.
- For an approaching ship, the image is always faster than the ship (0.43c, 1.00c, 1.50c, 9.00c at 0.3c, 0.5c, 0.6c, 0.9c). For a receding ship, it is always slower (0.23c, 0.33c, 0.38c, 0.47c).
- At 0.5c approaching, the image is exactly at the speed of light, and at 0.6c and 0.9c approaching it is faster than light.
- In the diagram, the seen ship is always lower on the ship's path than the real ship (earlier), and the gap is larger the farther away the ship is.

---

## Expected Learner Understanding

The learner should be able to say that what an observer sees is light that left the object earlier, so a moving object is not where it looks to be; that an object coming toward the observer looks faster than it is and one going away looks slower; and that an image that looks faster than light is not a speed-limit violation. They need not yet be able to say how the sky looks in two or three dimensions.

---

## New Concepts Introduced

**Measured position versus seen position**, **looking time**, and **the past light cone** (the Experiment 2 cone pointing back in time). The image's speed is introduced as a rate of change of where the ship looks to be, not as the speed of anything.

---

## Relationship to Previous Experiments

- This group's Experiment 2: the light cone, now pointing into the past. The same 45-degree edges, the same "light only" meaning.
- This group's Experiment 3: ends by saying that the order of events found by an observer is measured, not seen, and that a later experiment looks at the difference. This is that experiment.
- The first chapter's Experiment 8 (drawing spacetime) and this group's Experiments 2 and 3: the same drawing of space and time, used in the same way.
- Gravitational Waves Experiment 5 and Black Holes Experiment 6: both already used the idea that a source moving away stretches the gaps between arriving pulses. This experiment is the flat-space version with the ship's measured positions, and the approaching case, which the earlier experiments did not cover.
- The first chapter's Experiment 5: the speed of light being a limit is the assumption here.

---

## Relationship to Later Experiments

The next roadmap experiments, aberration and the Doppler effect, add effects that are specifically relativistic: the way a moving observer's view of the sky bunches up ahead, and the way the ship's own clock and motion shift the color of its light. They depend on the learner already separating what is measured from what is seen, which this experiment sets up.

---

## Required Physics Tests

Tests verify the physics, not just that functions exist (§10). All are for `src/physics/seeingThePast.ts`.

1. `seenAt` returns hand-calculated results for the worked examples: approaching at 0.6c and receding at 0.6c, including the looking times 5.00, 7.67 (approaching) and 1.00, 11.67 (receding).
2. For every sample, the seen event `(emissionTime, seenPosition)` and the looking event `(lookingTime, 0)` are linked by light: `classifyEventPair` returns `light-only`, and the emission time is earlier than the looking time.
3. The measured speed of the ship, found from its samples' measured positions against lab time, is the chosen speed, for both directions and a spread of speeds (0.01c to 0.99c).
4. The image's speed, found from the samples, equals `v ÷ (1 − v)` for approaching and `v ÷ (1 + v)` for receding (the closed forms are in the test, not in the module), to a stated numerical tolerance.
5. For every speed in a spread, an approaching ship's image is faster than the ship and a receding ship's image is slower, so the test would fail if the module returned the same speed for both.
6. The image's speed is above 1 exactly when `v > 0.5` for approaching ships, and below 1 for every speed for receding ships (and below 0.5, approaching 0.5 as `v` approaches 1).
7. The seen position is never closer to the lab than the measured position at the same looking time for a ship approaching (and never farther for one receding), so the seen ship is always the earlier ship.
8. The looking times are in order: a later emission time always gives a later looking time.
9. At `v → 0` the image's speed approaches the ship's speed (the difference shrinks as `v` shrinks).
10. Out-of-range inputs throw `RangeError` (`v ≤ 0`, `v ≥ c`, looking time outside the run).
11. The result is a pure function of `(direction, speed)`, so playback speed cannot change it (§11).

---

## AI Tutor Behavior

Following the established sequence (observe, compare with the prediction, a conceptual question, then the explanation). Draft only; the owner approves the wording (§28.1).

1. **Observe.** "Look at the second plot. How fast did the ship really move, and how fast did its image seem to move?"
2. **Compare with the prediction.** Neutral: the learner's choice versus what the table and the plots show.
3. **Conceptual question.** "At the moment you look, you see light that left the ship earlier. For a ship coming toward you, is the trip for the later light longer or shorter than for the earlier light? What would that do to the gaps between the times the pictures arrive?" (For a receding ship: the same question with the answer reversed.)
4. **Explanation**, kept short and concrete:
   - **What the plots show,** in the learner's own numbers (for example, approaching at 0.6c: the ship covers 4 light-seconds in 6.67 s; the first image arrives at time 5.00 and the last at 7.67; so the image covers 4 light-seconds in 2.67 s, which is 1.50c).
   - **A daily-life example** (no relativity): postcards. A friend travelling toward you mails one card at the end of each day. Each later card is mailed from closer to you, so its trip is shorter, and the cards arrive closer together than a day apart. If the friend is travelling away, each trip is longer and the cards arrive further apart. The ship's light is the postcards.
   - **The cone, pointing back.** The light that reaches the eye at one moment lies on the eye's past light cone. Where that cone crosses the ship's path is where the ship looks to be, and it is always lower (earlier) than where the ship is at the moment you look. As the looking time goes up, the cone's crossing point moves along the path at a different rate from the ship.
   - **Why this is not a contradiction.** The ship's real speed, measured with the lab's ruler and clocks, is below the speed of light in every run. The image's speed is how fast the place where the ship *looks* to be is changing. No object and no signal moves along the image at that speed.
   - **What this effect is not.** It comes only from the travel time of light. It would be there in a world with no relativity. Later experiments add the effects that are specifically relativistic.
5. **Limits.** The tutor says what was and was not shown: one ship, four speeds, one direction at a time, one line. It showed where the ship looks to be, not its brightness or color. It did not show motion across the line of sight, where the picture is different.

The tutor must not invent physics, change results, or contradict the engine (§13).

---

## Decisions Needing Human Review

1. **Is this the right next experiment?** Default: "what you see is the past", the next item of the approved roadmap direction, and the one Experiment 3's summary and tutor already point to. Alternatives: go to the Doppler effect first (the roadmap's sixth), which connects directly to Gravitational Waves 5 but needs the ship's own clock; or stop the group at Experiment 3.
2. **One line only.** Default: the ship moves straight toward or away from the eye. This gives exact, simple formulas. Alternative: add a second picture for motion across the line of sight, where an object can appear to move even faster than here (the image seen in some astronomical jets). It needs two dimensions and is saved for a later experiment.
3. **The ship's speeds.** Default: four presets, 0.3c, 0.5c, 0.6c and 0.9c, so that the learner sees an image slower than light, exactly at light, and faster than light (at 0.9c, 9 times). Alternative: leave out 0.9c, to avoid a result that looks alarming (9c). The tutor's "not a contradiction" paragraph is built for this.
4. **The fixed runs.** Default: the ship always covers 4 light-seconds, from 5 to 1 (approaching) or from 1 to 5 (receding), so the run never crosses the eye. Alternative: a free starting distance.
5. **The picture.** Default: a spacetime diagram with the cone pointing down, and a second plot of the two positions against the lab's clock. Alternative: only the diagram, which shows the seen ship but makes the speeds harder to compare.
6. **Say plainly that this is not specifically relativistic.** Default: yes, in the overview, the tutor and the limits, because the effect comes only from the travel time of light and the learner should not credit it to relativity. Alternative: leave the remark out.
7. **The introduction's worked example.** Default: approaching at 0.4c, which shows "faster" before the run. Alternative: a ship at rest with a flash (no image speed at all), so that nothing about the answer is shown. This is a judgment about §12: the worked example shows how to work the numbers out, but also hints at the answer for approaching ships.
8. **The prediction.** Default: three answers (slower, same, faster), including (b), which is never right. Alternative: two answers, simpler but giving away that the answer is one of two.
9. **Name of the experiment.** Default: "What You See Is the Past: Where Is the Ship, and Where Does It Look to Be?" as the learner-facing title (the long title in this file is for the specification). Owner may prefer another.
10. **What would be left for a primary-source check.** The image-speed formulas `v ÷ (1 − v)` and `v ÷ (1 + v)` for motion along the line of sight are standard and follow from `T = t + |x|`; the tests derive them independently. The tutor's statement that an image faster than light breaks no rule, because nothing travels along it, is a standard resolution, but is a claim about what physicists conclude, and should be checked against a source before the wording is approved.

---

## Success Criteria

1. The physics model gives, for each preset, the ship's real speed, the image's speed, and the seen position at each looking time, and the numbers agree with the table in "Physics Model" (to a stated tolerance).
2. The learner predicts before running; Run requires a prediction.
3. The diagram shows the real ship and the seen ship as two different marks on the ship's path, each labeled, in a way that does not rely on colour alone, and the cone is drawn pointing into the past.
4. Results are shown neutrally, then explained by the tutor after the learner has responded.
5. The learner can say that what is seen is light that left earlier, that an approaching object looks faster and a receding one slower, and that an image faster than light is not a speed-limit violation.
6. The experiment does not claim the effect is relativistic, does not show brightness, color or motion across the line of sight, and does not show anything travelling faster than light.
7. Nothing in it contradicts the first chapter's Experiments 1 to 11, or Experiments 1 to 3 of this group.

---

## Implementation Notes

None yet. Nothing has been implemented. The specification was approved on 2026-10-14 (§23 Stage 4); implementation follows §21 and the one-step-at-a-time rule (§6).
