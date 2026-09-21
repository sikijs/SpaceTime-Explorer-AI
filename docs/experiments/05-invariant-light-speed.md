# Experiment 5: Why Can't Light Go Faster?

**Status: APPROVED by the project owner. The defaults proposed under "Decisions Needing Human Review" stand unless changed.**

**Implementation: built and reviewed.** The implementation notes below record how the specification was realised. Items still awaiting the owner's decision are listed at the end of "Decisions Needing Human Review".

## Overview

Experiment 4 explained time dilation using one assumption, stated by the tutor afterwards: light travels at the same speed `c` in the lab, whatever the light source is doing. It was assumed, not examined.

Experiment 5 examines that assumption. It asks: *what if light did not behave that way?* The learner is shown the same moving light clock from Experiment 4 under two different rules for how light behaves, and compares them:

- **Everyday rule:** the light's speed adds to the speed of the thing that emits it, like a ball thrown from a moving train.
- **Light's actual rule:** light travels at `c` in the lab regardless of how its source moves.

Under the everyday rule the moving clock ticks at the same rate as the rest clock, so there is no time dilation, but the light in the lab then travels faster than `c`. Under light's actual rule the light never exceeds `c`, and the moving clock's tick is longer, as in Experiment 3 and 4.

This follows the planned progression in `01-clock.md` §18 (Experiment 5: "Why Can't Light Go Faster? — Explore the role of the invariant speed of light") and `04-light-clock.md` ("builds on the role of the invariant speed of light introduced here").

**Scope note (see Decision 1).** This experiment shows what the constancy of the speed of light *does* and what would be different without it. It does not, and with the current model cannot, explain *why* nature has this rule beyond stating that it is the rule the project assumes (Einstein's postulate, as in Experiments 3 and 4).

---

## Learning Objective

After this experiment, the learner should understand:

1. Everyday intuition says speeds add: a ball thrown forward from a moving train is faster, in the ground's view, than the same throw from a train at rest.
2. If light behaved that way, the moving light clock's light would travel faster than `c` in the lab, and the moving clock would tick at the same rate as the rest clock. There would be no time dilation.
3. Light actually travels at `c` in the lab whether or not its source moves. This is what makes the moving clock's tick longer.
4. So time dilation (Experiments 3 and 4) is a consequence of the constancy of the speed of light. The two stand or fall together in this model.
5. The speed of light is therefore not just one speed among many: it is the fixed reference against which the clocks' behaviour is worked out.

---

## Physical Situation

The same two identical light clocks as Experiment 4: a rest clock, and a clock moving sideways through the lab at constant speed `v`, at right angles to the line joining its mirrors. Mirror separation `L = 0.5` light-second, so one rest tick is 1 second.

The moving clock is shown **twice**, under two rules, side by side with the rest clock (or as a switch; see Decision 4):

- **Everyday rule (Rule A):** light leaves the source with speed `c` relative to the clock. In the lab, the light's velocity is that motion combined with the clock's sideways velocity `v`.
- **Light's actual rule (Rule B):** light travels at speed `c` in the lab, whatever the clock's motion. This is the model already used in Experiment 4.

### Simplifying assumptions (all must be stated to the learner)

- Flat spacetime: no gravity, no acceleration, constant velocity only.
- Sideways motion at right angles to the mirrors (the transverse light clock), as in Experiment 4. The parallel orientation is not covered.
- Both clocks start together at one lab event, pulses emitted at the same moment.
- The lab has synchronized clocks at rest, so lab time can be assigned to events at different places (Experiments 2 to 4). Two reference frames are involved: the lab's and the moving clock's.
- **Rule A is a hypothetical.** It is presented as "what everyday intuition would predict", not as something that happens in nature. Rule B is presented as the rule the project assumes (Einstein's postulate), stated in the same way as in Experiment 4.
- In both rules, the moving clock's source and both mirrors move together sideways, as in Experiment 4.
- In both rules, light travels at `c` relative to the clock that emits it, and the moving clock's mirror separation is `L` (unchanged by the motion, since this experiment does not introduce length contraction).

### Not introduced

Velocity addition for objects other than light, any formula for combining relativistic speeds, acceleration, energy, momentum, mass, length contraction, relativity of simultaneity, experimental evidence for the constancy of the speed of light (unless approved; see Decision 6), formal terms such as "Lorentz factor" or "γ".

---

## Physics Model

Units: light-seconds, seconds, `c = 1`. Velocity `v` is a fraction of `c`, `0 ≤ v < 1`, as in Experiments 3 and 4.

### Rest clock (both rules)

```
path per tick       = 2L           = 1 light-second
tick duration (lab) = path / c     = 1 second
light speed (lab)   = c
```

### Moving clock, Rule B (light's actual rule)

Identical to `04-light-clock.md`. Reuse `runLightClockExperiment(v)` rather than recomputing.

```
tick duration (lab) = 2L / (c · √(1 − v²/c²))
path per tick       = c · tick duration
light speed (lab)   = c
```

### Moving clock, Rule A (everyday rule)

Light has speed `c` relative to the clock, going straight across the gap. The clock's frame is identical to the rest clock's, so one round trip takes the same time as at rest. The lab sees that motion plus the clock's sideways motion `v`:

```
tick duration (lab) = 2L / c                       = 1 second (same as rest)
sideways distance per tick = v · tick duration
path per tick (lab) = 2 · √( L² + (v · tick/2)² ) = √(1 + v²) light-seconds  (with L = 0.5, c = 1)
light speed (lab)   = path / tick = √(c² + v²) > c   for any v > 0
time dilation factor = rest tick / moving tick = 1   (no dilation)
```

Rule A gives a lab-frame light speed above `c`. That is the point of the experiment: the everyday rule lets light go faster than `c`, and it removes time dilation. Rule B keeps light at `c` and produces time dilation.

### Values at the preset speeds (rest tick = 1 s)

| Speed | Rule A: tick | Rule A: light speed in lab | Rule B: tick | Rule B: light speed in lab |
|-------|--------------|----------------------------|--------------|----------------------------|
| 0.1c  | 1.000 s      | 1.005 c                    | 1.005 s      | 1.000 c                    |
| 0.3c  | 1.000 s      | 1.044 c                    | 1.048 s      | 1.000 c                    |
| 0.5c  | 1.000 s      | 1.118 c                    | 1.155 s      | 1.000 c                    |
| 0.8c  | 1.000 s      | 1.281 c                    | 1.667 s      | 1.000 c                    |

### Result structure (proposed)

```typescript
interface InvariantLightSpeedResult {
  velocity: number                    // fraction of c
  mirrorSeparation: number            // L, light-seconds
  restTickDuration: number            // seconds (lab time)
  everydayRule: {
    movingTickDuration: number        // seconds (lab time)
    lightPath: number                 // light-seconds
    lightSpeedInLab: number           // in units of c; exceeds 1 for v > 0
    timeDilationFactor: number        // restTick / movingTick; 1
  }
  actualRule: {
    movingTickDuration: number        // seconds (lab time)
    lightPath: number                 // light-seconds
    lightSpeedInLab: number           // in units of c; exactly 1
    timeDilationFactor: number        // must equal Experiment 3's factor
  }
}
```

The physics lives in a new module, independent of React, like the other experiments (working name `src/physics/invariantLightSpeedExperiment.ts`).

### Implementation notes (physics)

- **Result structure.** In addition to the proposed fields, the result holds `restLightPath`, `lightSpeedRest` (in units of `c`), and `sidewaysDistancePerTick: { everydayRule, actualRule }`, which the drawings need.
- **Playback state.** `invariantLightSpeedStateAt(result, labTime)` in the same module returns each clock's own reading, pulse height, phase and sideways offset at a lab time. The rest clock keeps ticking; each moving clock is followed for its one tick and then held. The run lasts until the actual-rule clock finishes its tick, which is never shorter than the everyday-rule tick. It reuses `pulseHeightAtPhase`, which is now exported from `lightClockExperiment.ts`.
- **Tests.** Besides the required tests, a sweep checks every relationship at all 99 speeds the interface allows (0.01c to 0.99c in steps of 0.01c), and the playback state is checked against the Experiment 4 playback state.

---

## Learner Controls

- **Speed of the moving light clock**: presets 0.1c, 0.3c, 0.5c, 0.8c, or Other (0.01c to 0.99c), as in Experiments 3 and 4. The interface explains what `c` means, as before.
- No duration control: each run shows one tick of the moving clock under each rule.
- Animation playback speed is presentation only and must not change any result.

---

## Prediction Activity

Before running, the learner sees the scenario, with the two rules explained (see Introductory text):

> The moving clock moves sideways at [speed]. Under the everyday rule, light's speed adds to the clock's sideways motion. Under light's actual rule, light travels at `c` in the lab whatever the clock does. Which rule gives the longer tick for the moving clock, as measured in lab seconds?

Proposed form (see Decision 5): the learner first chooses one of *Everyday rule / Light's actual rule / Both the same*, then enters the tick durations, in seconds, they expect under each rule. START is disabled until the prediction is entered, as in Experiments 1 to 4.

Educational intent: many learners will expect the moving clock's tick to be the same under both rules (or affected by the speed in the obvious way). The comparison is designed to show that only one of the two rules produces time dilation.

---

## Experiment Behavior

### Introductory text

Before the learner predicts, the interface explains, in plain words:

- What the experiment is about and the learner's job (predict, then watch two versions of the moving clock).
- A reminder of how a light clock works and what a tick and a light-second are (Experiment 4).
- The **everyday rule**, defined with a familiar example before it is used: a ball thrown forward from a moving train travels faster, in the ground's view, than the same throw from a stopped train. The example must not bring in physics that a later experiment teaches.
- **Light's actual rule**, described only as the rule assumed by the project: in the lab, light always travels at `c`, whatever its source is doing. This is the same statement the tutor made in Experiment 4, now stated up front because the experiment compares it against the everyday rule.
- The simplifying assumptions listed above, including that the everyday rule is a "what if", not a claim about nature.

Exact wording is the owner's to approve (`CLAUDE.md` §28.1); it will be drafted from this specification and shown for review.

### Display

Three parts inside the experiment, in the same design language as Experiment 4:

1. **Rest clock** (as in Experiment 4).
2. **Moving clock, everyday rule** (seen from the lab): mirrors moving together, dashed "start" markers, light path traced, lab time and the clock's own readout.
3. **Moving clock, light's actual rule** (seen from the lab): as in Experiment 4.

Each moving clock shows its own tick counter. A light-speed readout (light's path ÷ tick, in units of `c`) is shown for each, revealed at the end, not during the run.

### Run

All pulses start together at one lab moment. Each moving clock completes exactly one round trip and the run ends when the last one returns. Both moving clocks run against the same lab time, so the different tick lengths are visible: under the everyday rule the pulse is back at exactly 1 s; under light's actual rule it is back later.

### Playback

Playback is slowed for viewing. The physical result is determined by the model, not by playback speed.

### Implementation notes (interface)

- **Layout.** The page shows the introduction, the speed controls, the prediction, START, and then the three clocks directly under START. When START is pressed, the page scrolls the clocks into view. The animation guard from Experiment 4 (progress kept between 0 and 1) is used.
- **Prediction.** START stays disabled until a speed, a choice (*Everyday rule*, *Light's actual rule* or *Both the same*) and both tick durations are entered. After START the inputs clear, the submitted prediction is kept for the results and tutor, and a new prediction is needed for the next run. Nothing checks that the choice agrees with the numbers.
- **Playback.** 2 real seconds per lab second, so a run at 0.99c lasts about 14.6 seconds. Playback speed never affects a result.
- **Clock readouts.** "Its own tick counter" was implemented as the own-time readout used in Experiment 4 (the moving clocks' own reading is lab time times the time dilation factor, so both read 1.0 second at the end of the run). This interpretation is awaiting the owner's confirmation.
- **Drawings.** All three panels share one scale so the light paths can be compared. The moving clocks show dashed "start" markers and the caption "Moving at [speed] (seen from the lab). Both mirrors move together. Dashed lines show where they started."
- **Introduction, in plain language.** At the owner's request the learner-facing text is written as if for a new student. In order it gives: the question; a reminder of the light clock, including that the mirrors are about 150,000 km apart (half a light-second, so one tick is exactly 1 second) and that this giant clock is used so the numbers are easy to read; the light source as "a small lamp"; a car-and-headlights picture that only asks the question; the two rules, with the everyday rule explained by a ball thrown from a moving train and labelled a "what if"; what the learner will see; the learner's job (guesses are not scored); and the assumptions, including the definitions of reference frame and lab time and the statement that, under both rules, someone riding along with the moving clock sees the light go straight up at speed `c`.
- **Chapter summary.** Experiment 5's "What you learned" is in the `chapters` list in `src/App.tsx`. Experiment 4's "What's next" line now leads into Experiment 5.

---

## Results Display

After the run, show the values only, neutrally (Predict → Experiment → Observe → Explain):

- Rest clock: light path (1.000 ls), tick (1.000 s), light speed (1.000 c)
- For each rule: light path, tick duration in lab seconds, light speed in the lab (path ÷ tick, in units of `c`), time dilation factor
- The learner's prediction versus the actual values

Explanation comes from the tutor, after the learner has observed and responded, not from the results panel. Values are shown to three decimal places, as in Experiments 3 and 4.

### Implementation notes (results)

- The results panel appears when the run ends and shows values only: the moving clock speed, a note that `c` is the speed of light and that a light-second is the distance light travels in one second, and the rest clock's and each rule's light path, tick duration on the lab's clocks, light speed seen from the lab, and (for the moving clocks) the time dilation factor, labelled "rest tick ÷ moving tick; 1 means no slowing". The light-speed readouts appear here, at the end of the run, not during it.
- The learner's prediction is shown as "you guessed … the real time was …" for each rule. The panel gives no verdict on which rule gave the longer tick; the tutor handles that comparison.
- The sideways distance per tick, shown in Experiment 4, is not shown here.

---

## Expected Observations

1. Under the everyday rule the moving clock's tick equals the rest tick, at every speed.
2. Under the everyday rule the light's speed in the lab is greater than `c` for any v > 0, and grows with `v`.
3. Under light's actual rule the light's speed in the lab is exactly `c` at every speed.
4. Under light's actual rule the moving clock's tick is longer than the rest tick, as in Experiment 4, with the same factor as Experiment 3.
5. At v = 0 the two rules give identical results.

---

## Expected Learner Understanding

The learner should be able to say: "If light's speed just added to the clock's speed, the moving clock would tick like the rest clock and there would be no time dilation, but light would go faster than `c`. Because light always goes at `c`, the moving clock has to tick more slowly instead."

---

## New Concepts Introduced

1. The everyday idea that speeds add, applied to light as a hypothetical.
2. The constancy of the speed of light as a rule with a consequence: it is what produces time dilation.
3. The comparison of two possible rules against the same clock.

New terms: none beyond "everyday rule" and "light's actual rule", which are working labels defined in the introduction (Decision 3).

---

## Relationship to Previous Experiments

- **Experiment 1:** a clock measures elapsed time along its own history.
- **Experiment 2:** synchronized clocks at rest agree; lab time can be assigned to distant events.
- **Experiment 3:** gave the size of time dilation.
- **Experiment 4:** gave the reason, assuming the constancy of `c`. Rule B here must equal the Experiment 4 result at every speed, and its factor must equal Experiment 3's.

## Relationship to Later Experiments

None approved. Per `PROJECT.md` §7, later experiments must not be invented merely to fill out a roadmap. Candidate next topics (relativity of simultaneity, spacetime diagrams, the twin problem) are for the owner to raise or approve separately.

---

## Required Physics Tests

1. At v = 0: both rules give tick 1 s, light speed 1 c, factor 1, and paths equal to the rest path.
2. Everyday rule: moving tick equals the rest tick for every tested v.
3. Everyday rule: lab light speed equals `√(1 + v²)` in units of `c` and exceeds 1 for every v > 0. Path equals `√(1 + v²)` light-seconds.
4. Actual rule: lab light speed equals 1 for every tested v (within floating-point tolerance).
5. Actual rule: matches `runLightClockExperiment(v)` at every tested speed (tick, path, factor).
6. Actual rule's factor equals `runMovingClockExperiment(…, v).timeDilationFactor`.
7. For every v > 0, actual-rule tick > everyday-rule tick, and the difference grows with v non-linearly.
8. The right-triangle relation holds under each rule with its own tick: `(path/2)² = L² + (v · tick/2)²`.
9. Velocity outside 0 ≤ v < c is rejected.
10. Deterministic across repeated runs and independent of any UI or animation.

---

## AI Tutor Behavior

Follows the project's cycle and the pattern of Experiments 3 and 4. It has no pre-run step, no talking during the run, and each step after the run needs a typed answer before continuing.

- **After the run:**
  1. Observation: "Look at the two moving clocks. What is different between them?"
  2. Prediction comparison: the learner's choice and numbers versus the actual results.
  3. Conceptual question: "Under the everyday rule, how fast is the light travelling in the lab? How does that compare with `c`?"
  4. Explanation: under the everyday rule the light's speed adds to the clock's motion, so the light gets a faster path, the tick stays the same, and light exceeds `c`; under light's actual rule light stays at `c`, so the longer diagonal path takes longer, which is time dilation. So the constancy of the speed of light is what makes moving clocks run slow, in this model.
- The tutor must say plainly that the everyday rule is a hypothetical, and that the constancy of the speed of light is the project's stated assumption, as in Experiment 4. It must not present it as derived here.
- The tutor must not add physics beyond this specification. It must not claim experimental evidence unless the owner approves it (Decision 6).
- The tutor must not answer the title question ("why can't light go faster?") with more than this specification supports (Decision 1).

### Implementation notes (tutor)

- The tutor appears after the run finishes and moves through the four steps above, each needing a typed answer before continuing. It has no pre-run step, matching Experiments 1 to 4, and it gives no reaction to the prediction, because the specification defines none.
- Question wording: (1) "Look at the two moving clocks. What is different between them?" with a hint to look at the light's path and the tick lengths; (2) the learner's choice and guesses beside the real times, then "What do you notice…?"; (3) "Under the everyday rule, how fast was the light going… faster than c, slower than c, or exactly c?"
- The explanation is a numbered walk-through using the run's real numbers: (1) what stayed the same, since both moving clocks show 1 second per tick on their own displays; (2) the everyday rule, with the light carried sideways and travelling faster than `c`, so the tick matches the rest tick and there is no time dilation; (3) light's actual rule, where the light stays at `c`, cannot make up the longer path by going faster, so the tick takes longer, with the factor shared with Experiments 3 and 4; (4) the big idea, that in this model time dilation follows from light always travelling at `c`; (5) two things to remember, that the everyday rule is only a "what if" and that constant light speed is the assumed rule, so the experiment shows what follows from it and does not explain why light behaves this way.

---

## Decisions Needing Human Review

1. **Does this answer the title question?** The title, "Why Can't Light Go Faster?", asks why light is limited to `c`. This draft shows what the *rule* does (it removes the everyday rule's faster-than-`c` light and produces time dilation), not why nature has it. Options: (a) keep the title and this framing; (b) rename to match the content (for example, "What If Light's Speed Just Added?"); (c) add a second part that shows a speed limit for objects, which needs relativistic velocity addition, which is new physics (see Decision 2).

   **Decision (owner): keep the title and this framing (option a).**
2. **Alternative directions.** (i) A speed-limit experiment that adds speeds relativistically: it needs the relativistic velocity-addition formula, not yet approved. (ii) Pushing an object faster and faster: it needs acceleration, energy and momentum, all currently excluded. This draft avoids both. Confirm that avoiding them is right.
3. **Working labels.** "Everyday rule" and "light's actual rule" are my labels. Alternatives: "speeds add" and "light stays at `c`". Owner to choose or replace.
4. **Layout.** Three clocks at once (rest, everyday, actual), or one moving clock with a rule switch and run once per rule? Three at once shows the contrast in a single run; a switch is simpler but asks the learner to remember the first result.
5. **Prediction form.** One choice plus two numbers, one choice only, or one number? The draft proposes a choice then numbers to make the learner commit to a reason first.
6. **Evidence.** Should the tutor or introduction mention that experiments support the constancy of the speed of light? The draft says no, to avoid claims the specification does not contain. Owner to decide.
7. **Physical realism of Rule A.** In the everyday rule, the light's velocity in the lab is the clock's velocity combined with `c` relative to the clock. This is a simple, explicit hypothetical. Confirm that presenting it as "what everyday intuition would predict" is acceptable, and that no historical claim (for example, a named earlier theory) is added.
8. **Mirror separation and single tick.** Reuse `L = 0.5` light-second and the one-tick run from Experiment 4. Confirm.
9. **Chapter summary.** Done: the "What's next" line for Experiment 4 in `src/App.tsx` now points to Experiment 5, and Experiment 5 has its own summary, which says these are all the experiments for now.

### Open items after implementation

- **Summary timing.** Resolved: at the owner's request, the chapter summary (for every chapter) now appears only after the learner reaches the tutor's explanation.
- **Title versus content.** Resolved: the owner decided to keep the title "Why Can't Light Go Faster?" (Decision 1). The tutor still says plainly that the experiment does not explain why light behaves this way.
- **Own-time readout.** Confirm the interpretation of "tick counter" (see the interface notes).
- **Layout at extremes.** In narrow windows the fixed sidebar leaves the experiment very narrow, and the shared drawing scale makes the clocks very small at high speeds such as 0.99c. Experiment 4 behaves the same way.

---

## Success Criteria

1. The physics model implements both rules and matches Experiments 3 and 4 for the actual rule.
2. Learner predicts before running; START requires a prediction.
3. The display makes both moving clocks' paths, ticks and lab light speeds clearly comparable.
4. Results are shown neutrally, then explained by the tutor after the learner responds.
5. The learner can say that, without the constancy of the speed of light, there would be no time dilation in this model, and light would exceed `c`.
6. The experiment states that the everyday rule is a hypothetical and that the constancy of the speed of light is an assumption, not something derived here.
