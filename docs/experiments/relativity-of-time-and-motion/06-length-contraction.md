# Experiment 6: Does Motion Change Length?

**Status: APPROVED by the project owner. The defaults proposed under "Decisions Needing Human Review" stand unless changed.** The title is a working title (see Decision 7).

**Audit update, 2026-11-09 (wording approved by the owner as "all defaults"; built in commit `e27b4a6`, 2026-11-10; not yet signed off in `docs/audit/PROGRESS.md`).** The page was rewritten so that its focus is only on **length**. The physics, the numbers and the tested model do not change. The full approved learner-facing wording is in `docs/audit/relativity-of-time-and-motion/06-length-focus-draft-wording.md`, which builds on `06-draft-wording.md` (page layout, picture marks, links, words box). Where those files and the older text below differ, **they win** (the draft files still call the module functions "gap" names; the code uses the "length" names listed below); the section "Length-focus rewrite and audit update (2026-11-09)" at the end lists every change. The "Implementation notes" below record the build as of 2026-10-13 and are superseded where that section says so.

**Implementation: built and reviewed.** The implementation notes below record how the specification was realised. Items still awaiting the owner's decision are listed under "Open items after implementation" in "Decisions Needing Human Review".

## Overview

Experiment 4 built a light clock with its mirrors **across** the direction of motion and showed why a moving clock ticks more slowly (time dilation). It left out, on purpose, the light clock with its mirrors **along** the direction of motion (`04-light-clock.md`, "Transverse orientation only"). Experiment 5 kept the mirror separation unchanged for the same reason: length contraction had not been introduced.

Experiment 6 builds that missing clock. Its mirrors are in a line along the motion, so, seen from the lab, the pulse has to chase the moving front mirror and then meet the moving back mirror on the way back. Time dilation (Experiments 3 and 4) says this clock must also tick slowly, by the same factor as any other moving clock. With light fixed at `c` in the lab, that is only possible if the clock's length, seen from the lab, is **shorter** than its length at rest. The experiment lets the learner see this: with an unchanged length the tick comes out too long, and with a shorter length it matches.

The effect is named **length contraction** only after the learner has observed it, as was done for time dilation in Experiment 3.

**Focus (owner, 2026-11-09).** The question of this experiment is only: *as seen from the lab, how long is the moving clock compared with the same clock standing still?* The length of the clock is the distance between its mirrors. Time is not the subject; a tick is only the **tool** used to find the length, and the page says so plainly. The tool is explained to the learner: because light goes at `c` in the lab, **the time the pulse takes tells us a length** (distance = speed × time), as an echo tells us how far a cliff is. At this point in the course a moving length cannot be measured directly, because that needs relativity of simultaneity (Experiment 7), so the tick is the only route.

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

- **Part 1 has no speed control:** the run is fixed at **0.5c**.
- **Part 2 (after the first run finishes):** the speed of the moving clock, presets 0.1c, 0.3c, 0.5c, 0.8c, or Other from **0.01c to 0.9c**, and "Run your speed". The cap is 0.9c because the same-length tick grows as `1 / (1 − v²)`, about 50 seconds at 0.99c (Decision 5). The speed changes the clocks and Drawing A (marked in pink); it never changes Part 1's pictures, Part 3 or the guesses.
- No duration or length control: each run shows one tick of each clock.
- Animation playback speed is a presentation choice only and must not change any result.

---

## Prediction Activity

Two guesses, both about the **length of the moving clock**, both required. START is disabled until both are entered. The prediction is not scored. It never changes the real pictures, tables or numbers, which come from the physics. The guesses are drawn on Part 1's length strip in white and shown again beside the results (`CLAUDE.md` §14, "Predictions and the Real Results", applied to this experiment in its audit of 2026-11-09).

> The clock standing still is 0.5 light-seconds long, and one tick takes 1 second. Another identical clock moves along its own length at 0.5c. Time dilation says one tick of the moving clock takes [1.155] seconds on the lab's clocks. Light always goes at c in the lab. **Guess 1:** for its tick to take that long, the length of the moving clock, as seen from the lab, must be: *the same length as at rest / shorter than at rest / longer than at rest.* **Guess 2:** how long must it be, in light-seconds? Type a number.

After START the guess is locked ("Your prediction is locked while you try other speeds. To change it, press Start over."). **Start over** is always visible, greyed out until there is a guess or a run and while a run plays; there is no "Change prediction" button. It clears the guess, the runs, the results and the tutor's progress.

Many learners will predict 0.5, the rest length, which sets up the observation.

---

## Experiment Behavior

### Introductory text

Above Part 1, with no Part heading: the introduction, "Want to know more?" and a collapsed "Words and formulas" box. The full approved wording is in `06-length-focus-draft-wording.md` section 2. In order:

1. **The question and the car picture:** does a moving thing change length? One light clock, as seen from the lab.
2. **Step 1, our ruler, a light clock.** The **length of the clock is the distance from the back mirror to the front mirror**; one trip of the pulse back and forth is a tick, used later only as a tool.
3. **Step 2, the length of the clock standing still:** the light-second, half a light-second (about 150,000 km), a tick of exactly 1 second; real light clocks are much smaller.
4. **Step 3, how the travel of light measures a length** (added 2026-11-09). Distance = speed × time, with three everyday pictures (an echo off a cliff, a ten-minute walk, a corridor crossed at a steady pace). Light goes at `c` in the lab, so the pulse's crossing time gives the length: 0.5 s across means 0.5 light-seconds, and a light-second is a length measured by light's travel. For the moving clock each possible length gives its own round trip (a table of two possible lengths at 0.5c, 0.500 giving 1.33 s and 0.400 giving 1.07 s, which names no answer). **Reworded 2026-11-10 (owner-approved):** the example is introduced as "Now the moving clock" with the key point that every length gives its own round-trip time; "forward" and "back" are defined; a paragraph explains why forward takes 1.00 s for a 0.500 clock at 0.5c (the pulse gains on the running-away front mirror at only c − 0.5c); it ends with a "What to notice" line.
5. **Step 4, what moves.** Both mirrors move together, so the length does not change during the run. The pulse is **not carried along by the clock**: it keeps going at `c` in the lab and the clock's motion adds nothing to that speed. So what matters is the distance between the pulse and the mirror it is heading for. Forward trip (the bus pulling away), return trip (the friend walking toward you), the walkway ball picture, and a worked example reframed as *trying one possible length* (0.5c, the same length as at rest: 1 s forward, about 0.33 s back, about 1.33 s in all), stated to be only what that one possible length gives.
6. **Step 5, the rule we keep:** time dilation applies to every moving clock, however turned, so one tick of the moving clock takes the time that time dilation gives; light always goes at `c` in the lab in both directions.
7. **Step 6, how we find the length:** we cannot lay a ruler along a clock speeding past, and measuring a moving length directly needs an idea from a later chapter; so we find the length with light, as in Step 3: *what length must the moving clock have, as seen from the lab, for its tick to take exactly the time dilation tick?* Compared with the standing-still length. **Added 2026-11-10 (owner-approved), after Step 6:** "A trap to avoid: the clocks are not built shorter" (the tick is known from Step 5 and the length is the unknown, so the tie shorter-clock-shorter-tick is used backwards, like an echo that gives the cliff's distance; the drawn clocks are trial lengths) and "A small worked example with invented numbers" (an invented tick of 2.0 s at 0.5c: 0.500 gives 1.33 s, not it; 0.750 gives 1.50 + 0.50 = 2.00 s, it; numbers from `lengthForTick`). Neither names the real tick or length.
8. **What you will see (third clock: "a different trial length (amber)", not "shorter"), your job, the statement about predictions and the controls, "Some new words"** (as in `06-draft-wording.md` 1g to 1j, with length words), and **What we assume** (no gravity, constant speed, clocks start together, the lab as a reference frame).

The introduction does **not** say which length fits, that it is shorter, the factor, or the words "length contraction". Those stay with the tutor (§12).

### Display

The page is in **four Parts** below the introduction (`CLAUDE.md` §14): **Part 1** (amber, "Predict, then watch"), **Part 2** (pink, "Now try it yourself", appears when the first run finishes), **Part 3** (teal, "The results", appears when the first run finishes) and **Part 4** (blue, "The tutor", appears when the first run finishes). Each starts with a "What we are about to do" lead, given in `06-length-focus-draft-wording.md` section 4.

**Names (length-first, 2026-11-09):** *Rest clock* (blue, length 0.500 light-seconds); *Moving clock, same length as at rest* (violet, labelled **IMAGINED**); *Moving clock, shorter* (amber). The prediction choices are *the same length as at rest / shorter than at rest / longer than at rest*. The names replace "mirrors as far apart as at rest" and "mirrors closer together".

**Part 1** shows the three clock panels in the Experiment 4 and 5 design language, with the mirrors on a horizontal line and:

- every component labelled on the canvas (panel titles, "Back mirror", "Front mirror", "Light pulse", "Path of the light", "Where the mirrors started", "front mirror when the pulse hit it");
- a **double-headed arrow between the two mirrors, labelled "length"**, on each panel (the number appears when the run ends);
- the clock readouts and "Lab time";
- when the run ends, the **length strip**, titled "Length of each clock, seen from the lab": three bars on one scale, 0 to 1 light-second (twice the rest length), blue 0.500, violet 0.500 (imagined) and amber 0.433 at 0.5c, with each bar's number and, **under it, the pulse's trip times** (for example "pulse: 0.866 s forward, 0.289 s back, tick 1.155 s"; the rest clock "0.5 s across, tick 1.000 s");
- the **white guess marks**: a white dashed line across the two moving bars at the guessed length, a white dot on the amber bar and a prominent box "YOUR GUESS: N light-seconds long" joined to it by a line (an arrow at the edge and "(off the scale)" for a guess beyond the scale), and a white tag for the choice, joined to the bar it names (for "longer", an arrow past the end of the rest bar), the caption saying it is **only a marker**. The marks appear only when the strip appears (§12);
- a "Where the real picture comes from" line under the panels and under the strip, separating **measured** (nothing), **calculated here** and **imagined for the question**;
- two captions, "How to read the three light clocks" (from the start) and "How to read the length bars" (with the strip), written as in section 6 of the draft wording, with every "what to look for" item in three parts (**Look at / What it means / Why it matters**) and a bullet "How each bar's length was found" that connects the pulse's trip times to the lengths.

The forward and return legs are drawn at slightly different heights, only so both can be seen; the caption says the offset has no physical meaning (Decision 8). All panels share one scale.

**Part 2** shows the controls, a live set of three panels for the chosen speed and **Drawing A**, "Length of the moving clock at your speed": the same length strip on the same 0 to 1 scale at every speed, the speed written in pink, no white marks, and "Runs so far", one line per run, led by the lengths. Before any run: "Not run yet. Choose a speed and press Run your speed; the drawing for it will appear here." The note beside the controls says the guesses do not change the drawings but the speed does.

The colour code: white only for the learner's guess; pink only for the learner's own speed; violet for the imagined clock.

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

**Part 3**, length first, values shown neutrally (Predict, Experiment, Observe, Explain). Directly under the lead, "Where these numbers come from": **Measured:** nothing on this page. **Calculated here:** the lengths, tick times and light speeds, from the speed you ran. **Imagined for the question:** the violet clock. Then:

- The moving clock speed (0.5c) with the note on `c` and the light-second.
- **The length we are trying to find:** the rest clock's length, and each moving clock's length seen from the lab, in light-seconds and as a fraction of the rest length.
- **How we found it: light's travel time** (distance = speed × time; 0.500 s across is 0.500 light-seconds; each possible length gives its own trips and tick; we look for the length whose tick is the time dilation tick).
- The tick that time dilation gives, from Experiments 3 and 4.
- One item per clock, headline "Length: …", then the pulse's trips and one tick, the light speed on each leg and the difference from the time dilation tick, each with "What it is / What it means with the real numbers / Why it matters" and one sentence "The pulse's trips took X s forward and Y s back, so this length gives a tick of Z s."
- A "your guess" tag on each moving clock's length line and the line "Your guesses are drawn on Part 1's strip as a white mark and a white marker."
- **Light's speed, seen from the lab**, with "Why it matters".

No check-up and no setting-following table: the page computes each tick from the same geometry a check would use, so a check-up would be circular, and the control only moves marks and numbers (owner's default, 2026-11-09). Values to three decimal places. The interpretation comes from the tutor.

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

- **After the run** (wording in `06-length-focus-draft-wording.md` section 9; no pre-run step, silent during the run, each step after the run needs a typed answer):
  1. **Observe:** look at the three clocks and the length strip; what is different between the two moving clocks, how long each pulse's trips took, and what a trip time tells us about a length.
  2. **Compare:** the learner's choice (the white marker) and number (the white mark) beside the imagined and the shorter clock's length. No verdict, no score.
  3. **Conceptual:** time dilation says the tick should take [1.155] seconds; light goes at `c` in both clocks; what would have to change about the *length* of the clock to fix its tick?
  4. **Explanation**, length first, with the run's numbers: (1) what we found, the moving clock is shorter as seen from the lab (0.433 against 0.500 at 0.5c); (2) **how we found it, light as a tape measure** (distance = speed × time, the echo and the corridor, the two trips with the bus and friend picture, 0.500 giving 1.333 s and 0.433 giving 1.155 s); (3) **what fits**, only 0.433 gives the 1.155 s time dilation needs; (4) by how much, rest length × time dilation factor (0.500 × 0.866 = 0.433); (5) the name **length contraction**, with the note that someone riding along still measures the rest length; (6) only along the motion; (7) two things to remember (the assumption, and that only the length along the motion changes). Then **Your guesses, marked** (no score, no "right" or "wrong": the choice, and the number as more than, less than or the same as the length that fits), and **Try it in Part 2** (0.1c, 0.8c, 0.9c lengths from the module).
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

### Decisions revisited on 2026-11-09

- **Decision 3 (hint in the labels):** the names are now length-based ("same length as at rest (imagined)", "shorter"); the owner approved them and that "shorter" is a candidate the learner may choose from, not a verdict.
- **Decision 4 (prediction form):** the two-part prediction stays, now worded as lengths: *same / shorter / longer* and a number.
- **Decision 7 (title):** "Does Motion Change Length?" is kept; the page now answers to it.
- **Decision 9 (plain definition of length):** the length of the clock is the distance from the back mirror to the front mirror; the mirrors move together, so it does not change during the run. Step 6 states that a moving length cannot be measured directly yet and that we find it with light.

### Open items after implementation

- **The own-time readouts.** Resolved: the tutor's step 2 now explains that the same-length clock's own display shows more than 1 second after one tick, so this version cannot be right (Decision 6).
- **Length of the introduction.** Trimmed at the owner's request. Resolved (2026-10-13, owner delegated the choice to Claude): keep it as trimmed.
- **Wording approval.** Approved 2026-10-13 (blanket approval, no fresh read-through). The learner-facing text, including the tutor's step 3 ("light cannot go faster or slower than c to fix this… the only thing left that can change is the distance between the mirrors") and the chapter summary, was drafted from this specification and has not had the owner's line-by-line approval.
- **Label hint (Decision 3).** The panel names "mirrors as far apart as at rest" and "mirrors closer together" still hint at the answer. The owner chose these names; kept as chosen (2026-10-13, owner delegated the choice to Claude), since the neutral alternatives in Decision 3 would make the diagram harder to read.
- **Visual limits.** In narrow windows the drawings shrink to about 213×33 pixels; at high speeds the two "start" labels of the shorter clock nearly touch; at 0.01c the difference between the ticks is too small to show at three decimals.
- **Zero or negative predictions** are accepted, as in earlier experiments.

---

## Length-focus rewrite and audit update (2026-11-09)

Owner decisions: **Option A**, keep the physics and rewrite the wording so that the focus is only on length; the connection between light's travel and length is explained (Step 3, "how the travel of light measures a length", with three everyday pictures: echo, walk, corridor), then carried through the Part 1 caption (a bullet and a "Look at the trip times" item), the results (a first item, "How we found it: light's travel time") and the tutor (explanation point 2, "light as a tape measure", and point 3, "what fits").

**What was built (commit `e27b4a6`, checked against the source on 2026-11-11).** Files: `Experiment6.tsx`, `Experiment6Pictures.tsx`, `Experiment6Tutor.tsx`, `lengthContractionExperiment.ts` and their two test files. In the interface: the page in four Parts (`PartHeader` for Part 1 amber, Part 2 pink, Part 3 teal, Part 4 blue), the three light clocks, the three mirror-gap (length) bars with a white guess mark and a choice marker, "Where the real picture comes from" lines, a Start over button, a locked-prediction note, the "Want to know more?" links (checked 9 November 2026), the "Words and formulas" box and the tutor. **No change to the physics model or its numbers.** Choice names `'closer'` and `'farther'` became `'shorter'` and `'longer'` (with `'same'`; type `LengthChoice`). New module functions, named with "length", not "gap": `lengthBarsScaleEnd`, `guessPositionOnLengthBars`, `choiceMarker`, `markGuess` and `lengthBarRows`; also `roundTripForLength` and `lengthForTick` support the Step 6 worked example. Tests: `npx vitest run src/components/Experiment6.test.tsx src/physics/lengthContractionExperiment.test.ts` gives 96 passed (52 interface, 44 physics). The planned test that the strip's numbers equal `restLength`, `sameLength.lengthInLab` and `shorterLength.lengthInLab` was not looked for by name in this check.

**Not verified in this update:** the page was not opened in a browser (appearance, dark mode, narrow widths); the link pages were not re-fetched; the owner approved the wording of the built page on 2026-11-11 ("wordings approved", a blanket approval in chat); the full build and type check were not run.

**Links (searched and fetched 2026-11-09; re-checked for the length focus).** Linked from the start (four): NASA Science "How Big is Space?"; NASA Glenn "How 'Fast' is the Speed of Light?"; NASA Space Place "Is Time Travel Possible?"; NASA ISTP "Frames of Reference: The Basics". **Held back until after the tutor** (it says moving things are measured shorter): Einstein Online, "Elementary Tour, part 3: The relativity of space and time".

| Idea | Source | Status |
|---|---|---|
| Speed of light, light-second | NASA Science; NASA Glenn | Linked; neither gives the term "light-second" |
| Time dilation (the rule kept) | NASA Space Place | Linked; about time travel, not clocks and mirrors |
| Reference frame | NASA ISTP | Linked; old (2004) |
| Length contraction | Einstein Online | Held back until after the tutor |
| Length contraction, NASA, ESA or CERN | none found and fetched | **Gap (§29 rule 3(c))**. Not linked: Physics Classroom (HTTP 403, not official), OpenStax 5.4 (college text with a muon example), Wikipedia mirrors and revision sites |
| A NASA space-station crew letter on shrinking along the motion | `spaceflight.nasa.gov/station/crew/exp7/luletters/lu_letter13.html` | **Not read: HTTP 403, no text came back. Not linked.** If the owner wants it, it must be read another way first; it would be held back like Einstein Online |
| Einstein's 1905 paper | none | Not linked (the owner's answer); the Wiley page returned HTTP 403 and an archival copy was not found |
| Real results | none | The length found is calculated, not measured, so there is no paper to link |

**Facts that may change:** none; every number comes from the geometry above. The link pages are as seen on 2026-11-09 and were read through a helper that returned summaries, not raw text, so the quotes should be spot-checked in a browser before the wording is final (owner accepted, flagged here).

**Open (re-checked 2026-11-11):** (1) the length strip's trip-time text at narrow widths is still unchecked in a browser; (2) Experiments 4 and 5 still have their older source note at the bottom of Part 3 (the owner has not decided; not changed here); (3) Experiment 5's "When the run ends" list, rewritten on 2026-11-09, is still described in the older way in `05-*.md` (line 214), so it is not yet in its specification; (4) the Einstein Online link is held back until after the tutor, and the length-contraction NASA/ESA/CERN and NASA crew-letter gaps stand (§29 rule 3(c)).

---

## Success Criteria

1. The physics model implements the parallel light clock in both versions and matches Experiments 3 and 4 for the shorter length.
2. The learner predicts before running; START requires a prediction.
3. The display makes the unequal legs and the difference between the two versions clearly visible.
4. Results are shown neutrally, then explained by the tutor after the learner responds.
5. The learner can say that a clock moving along its length must be shorter, seen from the lab, for time dilation to hold with light at `c`.
6. The experiment states that the argument rests on the assumption that time dilation applies to every clock, and that only the length along the motion changes.
