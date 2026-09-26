# Experiment 6: Does Motion Change Length?

**Status: APPROVED by the project owner. The defaults proposed under "Decisions Needing Human Review" stand unless changed.** The title is a working title (see Decision 7).

**Implementation: built and reviewed.** The implementation notes below record how the specification was realised. Items still awaiting the owner's decision are listed under "Open items after implementation" in "Decisions Needing Human Review".

## Overview

Experiment 4 built a light clock with its mirrors **across** the direction of motion and showed why a moving clock ticks more slowly (time dilation). It left out, on purpose, the light clock with its mirrors **along** the direction of motion (`04-light-clock.md`, "Transverse orientation only"). Experiment 5 kept the mirror separation unchanged for the same reason: length contraction had not been introduced.

Experiment 6 builds that missing clock. Its mirrors are in a line along the motion, so, seen from the lab, the pulse has to chase the moving front mirror and then meet the moving back mirror on the way back. Time dilation (Experiments 3 and 4) says this clock must also tick slowly, by the same factor as any other moving clock. With light fixed at `c` in the lab, that is only possible if the clock's length, seen from the lab, is **shorter** than its length at rest. The experiment lets the learner see this: with an unchanged length the tick comes out too long, and with a shorter length it matches.

The effect is named **length contraction** only after the learner has observed it, as was done for time dilation in Experiment 3.

This is a new experiment beyond the progression planned in `01-clock.md` §18, which ends at Experiment 5. It was chosen by the project owner from four proposed directions (simultaneity, length contraction, spacetime diagram, twin journey).

---

## Learning Objective

After this experiment, the learner should understand:

1. A light clock can also be built with its mirrors in a line along the direction of motion.
2. Seen from the lab, the pulse in that clock has a longer trip forward (chasing the moving front mirror) and a shorter trip back (meeting the moving back mirror).
3. If the moving clock kept its rest length, its tick would take longer than time dilation allows.
4. Because time dilation applies to every moving clock and light stays at `c`, the clock must be shorter, seen from the lab, by the same factor as the time dilation factor from Experiments 3 and 4.
5. Only the length **along** the motion changes. The distance **across** the motion, as in Experiments 4 and 5, does not.

---

## Physical Situation

### Two identical light clocks

- **Rest clock:** at rest in the lab. Its mirrors are a distance `L0` apart, in a line. A pulse goes from the back mirror to the front mirror and back. One round trip is one **tick**.
- **Moving clock:** built the same way, so its length in its own reference frame is also `L0`. It moves through the lab at constant speed `v` **along the line of its mirrors**, front mirror first.

`L0 = 0.5` light-second, so one rest tick is exactly 1 second, as in Experiments 4 and 5.

### Two versions of the moving clock, seen from the lab

Both versions are shown next to the rest clock. They differ only in the length of the moving clock **seen from the lab**:

- **Same length:** the length seen from the lab is `L0`, unchanged.
- **Shorter length:** the length seen from the lab is `L0 · √(1 − v²/c²)`.

"Length seen from the lab" means the distance between the two mirrors as the lab observers measure it. Both mirrors move together at the same speed, so this distance stays constant during the run. (This deliberately avoids introducing simultaneity; see Decision 9.)

### Simplifying assumptions (all must be stated to the learner)

- Flat spacetime: no gravity, no acceleration, constant velocity only.
- The clock moves along the line joining its mirrors. Its width across the motion is not involved.
- Light travels at the same speed `c` in the lab, in both directions, as assumed in Experiments 4 and 5.
- **Time dilation applies to every moving clock, however it is built and however it is turned.** In particular, one tick of the moving clock takes `restTick / √(1 − v²/c²)` on the lab's clocks, the same as in Experiments 3 and 4. This is an assumption of this experiment, stated plainly to the learner, not something it proves (see Decision 1).
- Both clocks start together at one lab event: same place, back-mirror pulses emitted at the same moment.
- The lab has synchronized clocks at rest, so lab time can be assigned to events at different places (Experiment 2). Two reference frames are involved: the lab's and the moving clock's.
- The moving clock's source and both mirrors are parts of the moving clock. Seen from the lab, they always move together, at the same speed.
- Someone riding along with the moving clock sees the pulse leave at speed `c`, travel the length `L0` to the front mirror and back, so one tick takes 1 second on the clock's own display. (Same statement as in Experiment 5.)

### Not introduced

Relativity of simultaneity, how the lab looks from the moving clock's point of view (that belongs to later work, as in Experiment 3), rods or rulers as objects in general, contraction across the motion, acceleration, formal terms such as "proper length", "Lorentz factor" or "γ", and any real-world evidence (unless approved; see Decision 10).

---

## Physics Model

Units: light-seconds, seconds, `c = 1`. Velocity `v` is a fraction of `c`, `0 <= v < 1`, as in Experiments 3 to 5.

### Rest clock

```
length              = L0 = 0.5 light-second
tick duration (lab) = 2·L0 / c = 1 second
light speed (lab)   = c
```

### Moving clock, lab length L (either version)

The back mirror starts at position 0 and the front mirror at `L`, both moving forward at `v`. The pulse leaves the back mirror at `t = 0` and travels at `c`.

```
forward leg  = L / (c − v)                     (pulse chases the front mirror)
return leg   = L / (c + v)                     (pulse meets the back mirror head on)
tick (lab)   = forward + return = 2·L / (c·(1 − v²/c²))
```

Path lengths in the lab are `c` times each leg, so the light speed is `c` on both legs.

### The two versions

```
Same length:      L = L0                        tick = (rest tick) / (1 − v²/c²)     (γ² × rest tick)
Shorter length:   L = L0·√(1 − v²/c²)           tick = (rest tick) / √(1 − v²/c²)    (γ × rest tick)
```

### What time dilation says

```
time dilation tick = (rest tick) / √(1 − v²/c²)      reuse runLightClockExperiment(v).movingTickDuration
```

Only the shorter length agrees with it. The shorter length divided by `L0` is `√(1 − v²/c²)`, which is exactly the `timeDilationFactor` of Experiment 3.

### Values at the preset speeds (rest tick = 1 s, `L0` = 0.5 light-second)

| Speed | Time dilation tick | Same length: tick | Shorter length: length | Shorter length: tick |
|-------|--------------------|-------------------|------------------------|----------------------|
| 0.1c  | 1.005 s            | 1.010 s           | 0.497 ls               | 1.005 s              |
| 0.3c  | 1.048 s            | 1.099 s           | 0.477 ls               | 1.048 s              |
| 0.5c  | 1.155 s            | 1.333 s           | 0.433 ls               | 1.155 s              |
| 0.6c  | 1.250 s            | 1.563 s           | 0.400 ls               | 1.250 s              |
| 0.8c  | 1.667 s            | 2.778 s           | 0.300 ls               | 1.667 s              |
| 0.9c  | 2.294 s            | 5.263 s           | 0.218 ls               | 2.294 s              |

Worked check at 0.6c: same length, forward `0.5 / 0.4 = 1.25 s`, return `0.5 / 1.6 = 0.3125 s`, total 1.5625 s. Shorter length `0.4`: forward `1.0 s`, return `0.25 s`, total 1.25 s.

### Result structure (proposed)

```typescript
interface ClockVersionResult {
  lengthInLab: number               // light-seconds
  lengthRatio: number               // lengthInLab / restLength
  forwardLegDuration: number        // seconds (lab time)
  returnLegDuration: number         // seconds (lab time)
  tickDuration: number              // seconds (lab time)
  forwardLegPath: number            // light-seconds
  returnLegPath: number             // light-seconds
  lightSpeedForward: number         // in units of c; exactly 1
  lightSpeedReturn: number          // in units of c; exactly 1
  sidewaysDistancePerTick: number   // how far the clock moves during one tick, light-seconds
  differenceFromTimeDilationTick: number // tickDuration − timeDilationTick
}

interface LengthContractionResult {
  velocity: number                  // fraction of c
  restLength: number                // L0, light-seconds
  restTickDuration: number          // seconds (lab time)
  timeDilationTick: number          // what time dilation says, from runLightClockExperiment
  sameLength: ClockVersionResult
  shorterLength: ClockVersionResult
}
```

The physics lives in a new module independent of React (working name `src/physics/lengthContractionExperiment.ts`), plus a playback-state function in the same module, following Experiments 4 and 5.

### Implementation notes (physics)

- **Module.** `src/physics/lengthContractionExperiment.ts` provides `runLengthContractionExperiment(v)` and `lengthContractionStateAt(result, labTime)`. The time dilation tick is reused from `runLightClockExperiment(v)`, so the shorter length cannot drift away from Experiment 4.
- **Result structure.** In addition to the proposed fields, the result holds `timeDilationFactor` (used for the own-time readouts) and, for each version, `ownClockReadingAtEnd` (what that moving clock's own display shows after its one tick, so the tutor can point it out without calculating).
- **Range.** The physics accepts `0 <= v < c`, like Experiments 3 to 5. The 0.9c cap (Decision 5) is applied by the interface only.
- **Playback state.** For each clock: own reading, which leg the pulse is on (`forward`, `return` or `finished`), tick progress, and the positions of the back mirror, front mirror and pulse in the lab. The rest clock keeps ticking; each moving clock is followed for its tick and then held.
- **Tests.** The required tests, plus sweeps over every speed from 0.01c to 0.99c (physics) and from 0.01c to 0.9c (playback and playback limit).

---

## Learner Controls

- **Speed of the moving clock:** presets 0.1c, 0.3c, 0.5c, 0.8c, or Other. Proposed custom range **0.01c to 0.9c** (Experiments 3 to 5 allow up to 0.99c), because the same-length tick grows as `1 / (1 − v²)`, about 50 seconds at 0.99c (see Decision 5). The interface explains what `c` means, as before.
- No duration or length control: each run shows one tick of each clock.
- Animation playback speed is a presentation choice only and must not change any result.

---

## Prediction Activity

Before running, the learner sees the scenario and the assumption:

> The clock standing still has its mirrors 0.5 light-seconds apart, and one tick takes 1 second. Another identical clock moves along its own length at [speed]. Time dilation (Experiments 3 and 4) says one tick of the moving clock takes [time dilation tick] seconds on the lab's clocks. Light always goes at c in the lab. **How far apart, in light-seconds, must the two mirrors of the moving clock be, as seen from the lab, for its tick to take that long?**

The prediction has two parts, both required (owner's decision after implementation, combining the alternatives in Decision 4): **Part 1**, a choice of *as far apart as at rest*, *closer together* or *farther apart*; **Part 2**, a number of light-seconds. START is disabled until both are entered, as in Experiments 1 to 5. The prediction is not scored.

Many learners will predict 0.5, the rest length, which sets up the observation. (See Decision 4 for alternatives.)

---

## Experiment Behavior

### Introductory text

Before the learner predicts, the interface explains in plain words (wording to be drafted for the owner's approval, `CLAUDE.md` §28.1):

- The question: in Experiment 4 the mirrors were across the motion; what if they are in a line along the motion?
- A reminder of the light clock, a tick, and the mirror distance in km and light-seconds, with the same plain wording as Experiments 4 and 5.
- What "the length of the moving clock, seen from the lab" means, in everyday words, and that the two mirrors move together so this length stays the same during the run.
- The assumption that time dilation applies to every moving clock, and the time dilation tick for the chosen speed.
- Why the pulse's trip is different in the lab: it chases the moving front mirror and meets the moving back mirror. This is told as a setup, not as the answer to the prediction.
- What the learner will see and their job (guesses are not scored), then the simplifying assumptions with the terms reference frame and lab time defined as before.
- The term **length contraction** is **not** used here. It is named after the observation.

### Display

Three panels in the same design language as Experiments 4 and 5, with the mirrors drawn along a horizontal line:

1. **Rest clock.**
2. **Moving clock: mirrors as far apart as at rest** (the "same length" version).
3. **Moving clock: mirrors closer together** (the "shorter length" version).

The panel names were changed after implementation, at the owner's request, to describe the mirror distance in plain words rather than "length". The words "same length" and "shorter length" remain only in this specification and the code's variable names.

Each panel shows the two mirrors, the pulse moving forward and back, the path of the pulse, and the clock's own-time readout in the Experiment 3 to 5 style. The moving clocks also show dashed "start" markers for where the mirrors started, as in Experiments 4 and 5. The forward and return legs are drawn on slightly different heights, only so both legs can be seen; the offset has no physical meaning and the caption must say so (see Decision 8). All panels share one scale so lengths can be compared by eye.

### Run

All pulses start together. Each moving clock completes one round trip; the run ends when the slower of the two returns. The rest clock keeps ticking. After the run, each moving clock is held.

### Playback

Playback is slowed for viewing and is chosen so that no run lasts more than about 15 real seconds (Decision 5). The physical result is determined by the model, not by the playback speed.

### Implementation notes (interface)

- **Layout.** Introduction, speed controls, prediction, START, then the three clocks directly under START, stacked at full width because the clocks are drawn along a horizontal line. The animation guard from Experiments 4 and 5 (progress kept between 0 and 1) is used.
- **Speeds.** Presets 0.1c, 0.3c, 0.5c, 0.8c, and Other from 0.01c to 0.9c, as proposed.
- **Prediction.** Two parts, not scored: a choice (as far apart as at rest / closer together / farther apart) and a number (light-seconds). START stays disabled until a speed, a choice and a number are entered; both inputs then clear and the submitted prediction is kept for the results and the tutor. The two parts are not checked against each other. Any finite number is accepted, as in Experiments 1 to 5, including zero and negative values.
- **Playback.** 2 real seconds per lab second, limited so no run exceeds about 15 real seconds (the longest run, at 0.9c, takes about 11 seconds).
- **Drawing.** All three panels share one scale. The forward and return legs are drawn at slightly different heights and the moving-clock caption says this is only so both legs can be seen (Decision 8). Dashed "start" markers show where the mirrors started. After the pulse has turned round, each moving clock also shows a faint mirror mark, labelled "front mirror when the pulse hit it", at the turning point, because the mirror itself has moved on by then (added at the owner's request; the trail otherwise looked as if it turned in empty space).
- **Own-time readouts.** Both moving clocks show "own time = lab time × time dilation factor", the Decision 6 default. After one tick the shorter-length clock shows 1.0 second and the same-length clock shows more (for example 1.7 seconds at 0.8c). The tutor's explanation (step 2) points out that the same-length clock's own display shows more than 1 second after one tick, which a clock built like the one standing still should not, and that the shorter-length clock shows exactly 1 second. The sentence is left out when the two displays agree to the shown precision (very low speeds).
- **Introduction, in plain language.** Shortened at the owner's request (from about 780 words). In order: the question; a reminder of the light clock, including the light-second and how far apart the mirrors are (about 150,000 km, half a light-second, so a tick is exactly 1 second); what is different when it moves (the pulse chases the moving front mirror and meets the moving back mirror); the assumed rule (time dilation applies to every clock, and light goes at `c` in both directions); what the learner will see (the same moving clock drawn twice, differing only in the distance between the mirrors as the lab observers measure it, which stays constant during a run, Decision 9); the learner's two-part job (guesses are not scored); and five assumptions. The term "length contraction" is not used before the observation.
- **Chapter summary.** Experiment 6's "What you learned" is in the `chapters` list in `src/App.tsx`, and Experiment 5's "What's next" now leads into Experiment 6. As in the other chapters, the summary appears after the tutor's explanation.

---

## Results Display

After the run, show values only, neutrally (Predict → Experiment → Observe → Explain):

- Rest clock: length, tick duration, light speed.
- For each moving clock: length seen from the lab (light-seconds and as a fraction of the rest length), forward leg time, return leg time, tick duration on the lab's clocks, light speed on each leg, and the difference between its tick and the time dilation tick.
- The time dilation tick for this speed, from Experiment 3 and 4.
- The learner's prediction of the length, next to the two lengths shown.

Neutral presentation first; the interpretation comes from the tutor after the learner has responded. Values to three decimal places, as before.

### Implementation notes (results)

- The results panel appears when the run ends and shows values only, with the plain labels used in Experiments 4 and 5: the moving clock speed, a note on `c` and the light-second, the tick that time dilation gives, the rest clock's length, tick and light speed, and for each moving clock the length seen from the lab (in light-seconds and as a fraction of the rest length), the time for the pulse's trip forward and trip back, the tick on the lab's clocks, the light speed on each leg, and the difference from the time dilation tick.
- A difference below the shown precision reads 0.000 s. The learner's predicted choice and length are shown beside the two mirror distances, and the tutor's comparison step (step 2) quotes both. The panel gives no verdict.

---

## Expected Observations

1. In both versions the light travels at `c` on both legs.
2. The forward leg takes much longer than the return leg, and the imbalance grows with speed.
3. With the same length, the tick is longer than the time dilation tick for any `v > 0`, and the gap grows quickly with speed.
4. With the shorter length, the tick equals the time dilation tick at every speed.
5. The shorter length divided by the rest length equals the time dilation factor from Experiment 3.

---

## Expected Learner Understanding

The learner should be able to say: "A moving clock has to tick slowly, and light can't go faster, so a clock moving along its own length has to be shorter, seen from the lab, or its tick would take too long. That is length contraction."

---

## New Concepts Introduced

1. **Length contraction**, named after it is observed: a moving object is shorter, along its motion, as seen from the lab.
2. The light clock along the motion (parallel light clock).
3. Motion changes lengths along the motion but not across it.

---

## Relationship to Previous Experiments

- **Experiment 3:** gave the time dilation factor. The length ratio here equals it.
- **Experiment 4:** built the clock across the motion and left out the one along it. This experiment adds it. Its tick must agree with the Experiment 4 tick, and the test checks that.
- **Experiment 5:** established that light stays at `c` in the lab and that time dilation follows from it. Experiment 6 uses that as a fixed rule again. The mirror separation across the motion in Experiments 4 and 5 stays unchanged, consistent with contraction only along the motion.

## Relationship to Later Experiments

None approved. A natural follow-up, for the owner to decide, is **relativity of simultaneity**, which explains why the lab and the moving clock's point of view can disagree about lengths. Spacetime diagrams are another candidate. Per `PROJECT.md` §7, later experiments must not be invented merely to fill out a roadmap.

---

## Required Physics Tests

1. At v = 0: both versions equal the rest clock (length, legs 0.5 s each, tick 1 s, difference 0).
2. Leg formulas: forward = `L / (1 − v)`, return = `L / (1 + v)`, and they add up to the tick; forward exceeds return for `v > 0`.
3. Light speed on each leg equals `c` for both versions at every tested speed.
4. Same length: tick equals `1 / (1 − v²)` and exceeds the time dilation tick for every `v > 0`.
5. Shorter length: length equals `L0 · √(1 − v²)`, and tick equals `runLightClockExperiment(v).movingTickDuration` at every tested speed.
6. Shorter length ratio equals `runMovingClockExperiment(…, v).timeDilationFactor`.
7. Matches the preset table at 0.1c, 0.3c, 0.5c, 0.6c, 0.8c and 0.9c.
8. Same-length tick grows faster than linearly in `v`; the gap to the time dilation tick grows with `v`.
9. The playback state matches the model: pulse at the back mirror at the start, at the front mirror at the end of the forward leg, back at the back mirror at the end of the tick; mirrors move at `v`; each moving clock is held after its tick.
10. Velocity outside `0 <= v < c` (and above the interface's cap, if adopted) is rejected or capped as specified.
11. Deterministic across repeated runs; independent of any UI or animation; sweep over every allowed speed in 0.01 steps.

---

## AI Tutor Behavior

Follows the pattern of Experiments 3 to 5 and the plain-language style of all chapters. No pre-run step, silent during the run, each step after the run needs a typed answer.

- **After the run:**
  1. Observation: "Look at the two moving clocks. What is different between them? Think about how long each pulse's trip forward and back took."
  2. Prediction comparison: the learner's predicted length beside the two lengths shown, and the two ticks beside the time dilation tick. No verdict.
  3. Conceptual question: "Time dilation says the tick should take [time dilation tick] seconds. Light goes at c in both clocks. What would have to change about the clock to fix the tick?"
  4. Explanation, a numbered walk-through using the run's numbers: (1) the trip forward is long because the front mirror moves away, the trip back is short because the back mirror moves toward the pulse; (2) with the rest length, the two legs add up to more than time dilation allows; (3) light cannot speed up and the tick must match time dilation, so the distance between the mirrors, seen from the lab, must be shorter, by the factor `√(1 − v²/c²)`, the same number as in Experiment 3; (4) this effect is called **length contraction**; (5) it is only the length along the motion (across it, as in Experiments 4 and 5, nothing changes); (6) two things to remember: the "same length" clock is a "what if", and the argument rests on the assumption that time dilation applies to every clock.
- The tutor must state that the argument depends on that assumption and must not present the result as derived without it.
- The tutor must not describe how the lab looks to the moving clock, and must not add physics beyond this specification.

### Implementation notes (tutor)

- The tutor appears after the run and moves through the four steps above, each needing a typed answer. It has no pre-run step and no reaction to the prediction, because the specification defines none.
- Questions: (1) look at the two moving clocks and how long each pulse's trips took; (2) the learner's predicted length beside the two lengths, and the two ticks beside the time dilation tick, then "What do you notice…?"; (3) "Time dilation says the tick should take X seconds. Light goes at c in both clocks. What would have to change about the clock to fix its tick?"
- The explanation is a numbered walk-through using the run's numbers: (1) the two trips; (2) a tick that is too long with the rest length; (3) what has to change: light cannot fix it and time dilation has already fixed the tick, so the distance between the mirrors seen from the lab must be shorter, by the time dilation factor; (4) the name **length contraction**, with the note that someone riding along still measures the rest length; (5) only along the motion; (6) two things to remember: the same-length clock is a "what if", and the argument rests on the assumption that time dilation works for every clock.
- **Daily-life example (added 2026-09-26, at the owner's request, per `CLAUDE.md` §15).** A short paragraph was inserted after step 1's numbers, before step 2, comparing the pulse's forward (chasing) and return (meeting) trips to chasing a bus that just pulled away versus meeting a friend walking toward you on a platform. It illustrates only the forward/return asymmetry already stated in step 1, not length contraction itself, and does not describe the moving clock's own point of view. This experiment's tutor already substituted real numbers throughout (leg durations, tick durations, and the length ratio matching the time dilation factor), so no further math addition was needed.

---

## Decisions Needing Human Review

1. **The extra assumption.** The argument needs "time dilation applies to every clock, whatever its orientation". Is it acceptable to state this plainly as an assumption of the experiment, as Experiment 4 stated the constancy of `c`? The alternative is a different route to length contraction, which needs relativity of simultaneity.
2. **Design of the versions.** This draft shows two fixed versions (same length, shorter length), matching Experiment 5. Alternative: run only the length the learner predicted, beside the rest clock, and reveal the correct length in the tutor. That is more discovery-based but gives the learner one clock and a mismatch they may not know how to fix.
3. **A hint in the labels.** Naming a version "Shorter length" hints at the answer. Alternatives: neutral labels ("Length 1" and "Length 2"), or a third version "Longer length" so the learner must choose among three.
4. **Prediction form.** Proposed: one number (the length that makes the tick match). Alternatives: a choice among same / shorter / longer first; or predict the two ticks.
5. **Speed range and playback.** The same-length tick grows as `1 / (1 − v²)` (50 seconds at 0.99c). Proposed: cap the custom range at 0.9c for this experiment, and choose playback per run so no run lasts more than about 15 real seconds. Confirm, or choose a different cap.
6. **Own-time readouts.** Applying "own time = lab time × time dilation factor" to the same-length clock makes its own display read `γ` seconds (e.g. 1.25 s at 0.6c) instead of 1 s after one tick, which contradicts its own view. This is instructive but subtle. Show the readouts on both clocks, or only lab time?
7. **Title and naming.** Working title "Does Motion Change Length?" keeps the effect unnamed until observed. Following Experiment 4's pattern, it could later be shown as "…: Why Moving Things Are Shorter" or "Length Contraction". Owner to choose.
8. **Visual offset of the two legs.** Drawing the forward and return legs at slightly different heights avoids overlap but must not imply a physical effect. Confirm the caption approach, or choose another drawing.
9. **Plain definition of "length seen from the lab".** Draft: "the distance between the two mirrors as the lab observers measure it; because the mirrors move together, it does not change". Confirm that this is enough without introducing simultaneity.
10. **Evidence and the reverse view.** This draft says nothing about experimental evidence (as in Experiment 5) and does not describe how the lab looks from the moving clock. Confirm.
11. **Chapter summary and Experiment 5's "What's next".** Done: Experiment 5's "What's next" now leads into Experiment 6, and Experiment 6 has its own summary, which says these are all the experiments for now.

### Open items after implementation

- **The own-time readouts.** Resolved: the tutor's step 2 now explains that the same-length clock's own display shows more than 1 second after one tick, so this version cannot be right (Decision 6).
- **Length of the introduction.** Trimmed at the owner's request. Owner to say whether it is now short enough.
- **Wording approval.** The learner-facing text, including the tutor's step 3 ("light cannot go faster or slower than c to fix this… the only thing left that can change is the distance between the mirrors") and the chapter summary, was drafted from this specification and has not had the owner's line-by-line approval.
- **Label hint (Decision 3).** The panel names "mirrors as far apart as at rest" and "mirrors closer together" still hint at the answer. The owner chose these names.
- **Visual limits.** In narrow windows the drawings shrink to about 213×33 pixels; at high speeds the two "start" labels of the shorter clock nearly touch; at 0.01c the difference between the ticks is too small to show at three decimals.
- **Zero or negative predictions** are accepted, as in earlier experiments.

---

## Success Criteria

1. The physics model implements the parallel light clock in both versions and matches Experiments 3 and 4 for the shorter length.
2. The learner predicts before running; START requires a prediction.
3. The display makes the unequal legs and the difference between the two versions clearly visible.
4. Results are shown neutrally, then explained by the tutor after the learner responds.
5. The learner can say that a clock moving along its length must be shorter, seen from the lab, for time dilation to hold with light at `c`.
6. The experiment states that the argument rests on the assumption that time dilation applies to every clock, and that only the length along the motion changes.
