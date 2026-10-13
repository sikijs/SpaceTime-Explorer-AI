# Experiment 2 (Spacetime Geometry): Light Cones, Which Events Can Affect Which

**Status: APPROVED by the owner on 2026-10-13, with all ten "Decisions Needing Human Review" taken on their defaults. Built, tested, complete-flow tested and finally reviewed 2026-10-13; the learner-facing wording ("wording approved", 2026-10-13) and all eight differences from this specification (see "Implementation Notes") were approved by the owner on 2026-10-13.** Proposed by Claude per `CLAUDE.md` §23 Stages 1 to 3 on 2026-10-13. The learner-facing wording in the built interface was approved by the owner on 2026-10-13 (§28.1); the draft wording quoted in this specification is the starting point and may differ from the final text, which is in the code.

**Group:** "Spacetime Geometry: What Is Real, What Is Seen". Specifications for this group live in `docs/experiments/spacetime-geometry/`. This is the second item of the roadmap in `01-the-interval.md`, which is approved as a direction only.

---

## Overview

Experiment 1 found one number that every observer agrees on: the interval, `time² − distance²`. It was positive in that experiment, because the two events were two ticks of one clock.

This experiment asks: **what if the number is zero, or negative?** What would that mean?

It means something very practical. Pick two events, "here, now" and some other event. Either something could travel from the first to the second without going faster than light, or nothing could. The sign of the interval decides which, and because every observer agrees on the interval, every observer agrees on the answer.

The tool for seeing this is the **light cone**: the set of all events that a flash of light from "here, now" could reach. Events inside the cone could be affected by what happens at the start. Events outside it could not, however hard anyone tried.

The learner picks one event from a small list, predicts whether anything could get from "here, now" to it, then watches a flash of light spread out from "here, now" and see whether it arrives before, exactly when, or after that event happens. A second observer then measures the same two events, and the learner sees that their times and distances differ but the answer to the question does not.

---

## Learning Objective

After this experiment, the learner should understand:

1. Whether one event can affect another depends on whether a signal could cover the distance between them in the time available. Light is the fastest signal.
2. For two events, a time `t` apart and a distance `x` apart, there are three cases: `t` is more than `x` (light, and anything slower, could make it), `t` equals `x` (only light could make it), or `t` is less than `x` (nothing could make it).
3. These three cases match the three signs of the interval: positive, zero, negative. So the sign of `time² − distance²` is the test.
4. Different observers measure different times and distances, but they all get the same sign, so they all agree on which case it is. "Could this event have affected that one?" does not depend on who is asking.
5. The picture of all the "reachable" events is the light cone.

---

## Physical Situation

### Reused

- Flat spacetime, no gravity, constant velocities (as in Experiments 3 to 11 of the first chapter).
- Units: `c = 1`, time in seconds, distance in light-seconds.
- `lorentzTransform` (`src/physics/lorentzTransform.ts`), already tested for interval invariance.
- `intervalSquared` (`src/physics/spacetimeInterval.ts`), from Experiment 1 of this group.
- The spacetime diagram idea (position across, time up, light drawn at 45 degrees) from the first chapter's Experiments 8 and 9.

### What is new

- **Event O** is "here, now": position 0, time 0, in the lab.
- **Event B** is a second event chosen by the learner from a short list, at position `x` (light-seconds, positive to the right, negative to the left) and time `t` (seconds, after O).
- A **flash of light** is sent out from O in both directions at the same moment as O. It is a picture of "the fastest possible signal".
- **A passing observer** moves past the lab at speed `u` (as in Experiment 1) and measures O and B with their own ruler and clock.

### Not introduced

Why the order of some pairs of events can differ between observers and what that means for cause and effect (the next roadmap experiment), what a fast object looks like, aberration, Doppler shifts, curved spacetime, and any number of space dimensions beyond one in the calculations. The words "timelike", "spacelike" and "lightlike" are used only as labels for the three cases, and are defined in the introduction (see Decision 3).

---

## Physics Model

All of it is flat-spacetime special relativity, using what the app already has.

### New: a small independent physics module

```typescript
// src/physics/lightCones.ts (proposed)
export type EventRelation = 'reachable' | 'light-only' | 'unreachable'   // names are Decision 3

export function classifyEventPair(a: WorldlinePoint, b: WorldlinePoint): EventRelation
// uses the sign of intervalSquared(a, b), with a stated tolerance around zero

export function speedNeeded(a: WorldlinePoint, b: WorldlinePoint): number
// |Δposition| ÷ |Δtime|, in fractions of c; Infinity if Δtime is 0 and Δposition is not

export interface PairReading {
  timeBetween: number
  distanceBetween: number
  intervalSquared: number
  relation: EventRelation
  speedNeeded: number
}

export function runLightConeExperiment(event: { time: number; position: number }, passingObserverSpeed: number):
  { lab: PairReading; passing: PairReading; lightFrontPositionAtEventTime: number }
```

`runLightConeExperiment` does not compute any relativistic quantity itself except through `lorentzTransform` and `intervalSquared`. `lightFrontPositionAtEventTime` is how far the flash from O has spread by the time of B, in the lab (`+t` and `−t` for the two directions), used by the picture to show whether B is inside, on, or outside the spreading flash.

### The setup, in numbers

The learner chooses B from five presets (Decision 4). With O at `(0, 0)`:

| B (time `t`, position `x`) | `t² − x²` | Relation | Speed needed |
|---|---|---|---|
| `t = 5 s`, `x = 3 ls` | `25 − 9 = 16` | reachable | `3 ÷ 5 = 0.6c` |
| `t = 5 s`, `x = −4 ls` | `25 − 16 = 9` | reachable | `4 ÷ 5 = 0.8c` |
| `t = 3 s`, `x = 3 ls` | `9 − 9 = 0` | light only | `1.0c` |
| `t = 3 s`, `x = 5 ls` | `9 − 25 = −16` | unreachable | `5 ÷ 3 ≈ 1.67c` |
| `t = 4 s`, `x = −5 ls` | `16 − 25 = −9` | unreachable | `5 ÷ 4 = 1.25c` |

The numbers are chosen so that every square is a whole number. They do not reuse Experiment 1's `v = 0.6c` clock.

### The passing observer

Both events are passed through `lorentzTransform` with the passing observer's speed `u`. The observer's own time and distance between them come out different. The sign of `time² − distance²` does not change, and so the relation does not change.

### Sign convention and limits

- Interval squared is reported as `time² − distance²`, as in Experiment 1. Positive means reachable, zero means light only, negative means unreachable.
- Event B is always later than O in the lab (`t > 0`). Events earlier than O (the "past" half of the cone) are drawn in the diagram but not chosen by the learner (Decision 5).
- `−c < u < c`. Out-of-range values throw `RangeError`, as in the other experiments.
- A "zero" interval is a floating-point comparison. The model uses a stated tolerance (proposed: `1e-9`) so that a transformed light-only pair still reads as light-only.

---

## Learner Controls

1. **Event B**: five presets, as in the table above.
2. **Passing observer speed `u`**: presets (proposed: −0.5, −0.3, 0, 0.3, 0.5 of `c`). The limit to 0.5c is explained in Decision 6.
3. **Run:** gated on the prediction, as in earlier experiments.

---

## Prediction Activity

Before running, the learner chooses event B and answers one question. Draft wording:

> **The question.** Event O is "here, now". Event B happens `t` seconds later, `x` light-seconds away. Could something that starts at O, and never goes faster than light, arrive at B in time to be there when B happens?
>
> (a) Yes, and it could be slower than light, (b) Yes, but only light itself could do it, (c) No, not even light could.

Not scored. The Run button stays disabled until an answer is chosen. The answer is kept for the results and the tutor. The learner is not told which answer is right before running (§12).

The learner can reason from what they already know: light covers 1 light-second in 1 second, and Experiment 5 showed that light's speed is the limit. They do not need the interval to answer. The interval is how the experiment will connect the answer to Experiment 1.

---

## Experiment Behavior

### Introductory text (to be drafted in full once the owner approves the direction)

Following the structure of existing introductions (the question, what happens, the learner's job, new terms, assumptions). It must:

- Start from the everyday idea that "something that happens here can only affect something somewhere else if the news or the push can get there in time", and give a daily-life anchor with no relativity (§15). Proposed anchor: a shout across a field. Sound travels about 340 meters per second. If you shout at time 0, and at 2 seconds a friend 1000 meters away hears nothing, your shout could not have affected anything that friend did at that moment, because the sound has not arrived yet. (The anchor is clear and uses no relativity. The tutor says where it fails: a fast jet can overtake sound, but nothing can overtake light, and different observers do not all agree on how fast sound moves, but they do all agree on how fast light moves. Whether that last point is needed is Decision 8.)
- Define **event**, **signal**, **light cone**, and the three labels (Decision 3), each before its first use.
- State the assumption plainly: nothing can travel faster than light, as in all the earlier experiments (Decision 7).
- Say that this experiment shows the answer is the same for every observer, and that the tutor will explain why afterward.
- Say that real space has three dimensions, so the "cone" would really be an expanding ball of light, and that the drawing shows only one dimension so that it fits on a page.
- Give a worked calculation with real numbers (§15), using numbers that are **not** among the presets, so as not to reveal results (§12). For example: an event 2 seconds later and 1 light-second away. Light covers 2 light-seconds in 2 seconds, so it gets there with time to spare; the speed needed is 1 ÷ 2 = 0.5 of the speed of light.

### Display

An animated spacetime diagram, following §14 "Animated Diagrams":

1. **Labeled components on the canvas:** the lab's position axis and time axis, event O ("here, now"), event B, the two edges of the light flash from O, the shaded region inside the cone, the shaded regions outside it, the passing observer (a labeled arrow showing their direction), and the "past" half of the cone, dimmed.
2. **A visible contrast.** Three clearly different regions: *inside the cone* (something slower than light could get there), *on its edge* (only light), and *outside* (nothing could). Event B is a dot in one of them. The regions are distinguished by fill and by label, not by color alone.
3. **A "How to read this diagram" caption** beneath it, matching earlier experiments. To be drafted after the direction is approved.

### Run

A short playback, with the lab's time counting up from 0:

1. The flash spreads out from O at the speed of light, in both directions. Its two fronts trace the edges of the cone.
2. At time `t`, event B happens (B appears on the diagram and a label says "B happens now").
3. The picture then shows the flash's front, in the same direction as B: has it already passed B's position (reachable), is it exactly there (light only), or has it not yet arrived (unreachable)?

Playback speed does not change the result (§11).

---

## Results Display

Shown only when the run ends. Values only, with plain labels (neutral; the explanation comes from the tutor, §12):

- the chosen event B and the passing speed `u`;
- a table with one row for the lab and one for the passing observer: time between O and B, distance between them, `time² − distance²`, and speed needed (as a fraction of `c`);
- the learner's prediction, as a record (not marked right or wrong).

The relation names ("reachable" and so on) appear after the tutor's explanation, or in the results table as a plain word, depending on Decision 3.

---

## Expected Observations

- For each preset, the lab's numbers match the table in "Physics Model".
- The passing observer's time and distance differ from the lab's, and change as `u` changes.
- The sign of `time² − distance²` is the same for the lab and the passing observer, for every preset and every `u` offered.
- The speed needed is below 1 for the reachable events and above 1 for the unreachable ones, for both observers. (It is not the same number for the two observers. It sits on the same side of 1.)
- The light-only event is exactly 1 for both.

---

## Expected Learner Understanding

The learner should be able to say that whether something could get from one event to another depends on whether the time between them is more than, equal to, or less than the distance between them (in light-seconds), that the sign of `time² − distance²` tells the same thing, and that all observers agree on it. They need not yet understand the consequences for cause and effect.

---

## New Concepts Introduced

**Signal**, **light cone**, and three labels for the three cases (Decision 3).

---

## Relationship to Previous Experiments

- This group's Experiment 1: the interval is the same for all observers. Here its sign is what is the same, and it has a practical meaning.
- First chapter's Experiment 5: light's speed is the same for every observer and cannot be exceeded. This experiment uses that as its limit.
- First chapter's Experiments 8 and 9: the spacetime diagram, with light at 45 degrees. Here the whole cone is drawn, which those experiments left out on purpose.
- First chapter's Experiment 7: observers can disagree on the order of events. This experiment does not discuss order; that is for the next one.

---

## Relationship to Later Experiments

The next roadmap experiment, cause before effect, depends on this one: the order of two events can differ between observers only when the events are outside each other's light cone, which is exactly the "unreachable" case here. The "seen" half of the group depends on the *past* light cone: what an observer sees now is light that left events on their past cone.

---

## Required Physics Tests

Tests verify the physics, not just that functions exist (§10). All are for `src/physics/lightCones.ts`.

1. `classifyEventPair` returns reachable, light-only and unreachable for the five preset events (hand-calculated in the table above).
2. `speedNeeded` equals `|x| ÷ t` for each preset, and is `Infinity` when `Δtime` is 0 and `Δposition` is not.
3. For every preset and every `u` in a spread across `−0.99` to `0.99` (including `u = 0`), the passing observer's `intervalSquared` equals the lab's, to a stated tolerance.
4. For every preset and every such `u`, the passing observer's relation equals the lab's relation, so the test would fail if the module classified by Δtime and Δposition separately without the interval.
5. A light-only pair stays light-only for every `u`, to the stated tolerance (the transformed time and distance are equal).
6. For reachable pairs, `speedNeeded` is below 1 for the lab and for every passing observer; for unreachable pairs it is above 1 for both.
7. The passing observer's time and distance between the events differ from the lab's when `u ≠ 0` (so the test would fail if the module returned the lab's numbers for both).
8. For reachable and light-only pairs, the sign of the time between the events is the same for the lab and every passing observer. For at least one unreachable preset, a speed exists at which the sign differs (this documents what the next experiment needs, and is not shown to the learner here).
9. `lightFrontPositionAtEventTime` equals `t` for each preset, in the direction of B, and the three relations match the front being past, at, or short of B.
10. Out-of-range inputs throw `RangeError` (`|u| ≥ c`, `t ≤ 0`).
11. The result is a pure function of `(event, u)`, so playback speed cannot change it (§11).

---

## AI Tutor Behavior

Following the established sequence (observe, compare with the prediction, a conceptual question, then the explanation). Draft only; the owner approves the wording (§28.1).

1. **Observe.** "In the lab, did the flash from O get to B's position before B happened, exactly when it happened, or after?"
2. **Compare with the prediction.** Neutral: the learner's choice versus what the picture and table show.
3. **Conceptual question.** "The passing observer measured a different time and a different distance. Why might they still agree on whether the flash could have reached B?"
4. **Explanation**, kept short and concrete:
   - **Daily-life example** (no relativity): the shout across a field, as in the introduction. The learner can see the three cases in everyday terms: the sound has long since arrived, is arriving right now, or has not arrived yet.
   - **Simple math with real numbers**, using the learner's own preset: for example, for `t = 5`, `x = 3`: light covers 5 light-seconds in 5 seconds and the event is only 3 light-seconds away, so it could be reached, and `25 − 9 = 16` is positive. For an unreachable preset: `t = 3`, `x = 5`: `9 − 25 = −16` is negative. The sign of the interval is exactly the test of "more, equal or less".
   - **Why every observer agrees:** from Experiment 1, the interval is the same for every observer, so its sign is the same too. A positive number cannot become negative for someone who is moving. So the three cases hold for everyone: that is what makes the light cone a real feature of spacetime and not a matter of opinion.
   - **Where the analogy fails:** with sound, a jet can overtake the sound, and moving through the air changes how fast sound seems to go. Light's speed is the same for everyone (Experiment 5 of the first chapter), which is why the cone is the same for everyone.
   - **A negative interval:** state plainly that no clock could travel between two events whose interval is negative, because it would have to go faster than light, so the interval is not a clock's time in that case. The experiment does not give it a different meaning.
5. **Limits.** The tutor says what was and was not shown: five events, one passing observer at a time, one dimension. It did not show what the cone means for the order of events or for cause and effect (the next experiment returns to it), and it did not show the cone in three dimensions.

The tutor must not invent physics, change results, or contradict the engine (§13).

---

## Decisions Needing Human Review

1. **Is this the right next experiment?** Default: Light cones, the next item of the approved roadmap direction. Alternatives: go straight to "What you see is the past" (which uses the past cone and would need a short definition of it), or stop the group at Experiment 1.
2. **What the learner chooses.** Default: one event B from five presets, plus the passing speed. Alternative: let the learner place B anywhere on the diagram by clicking, which is more open-ended but makes the prediction less controlled and makes the lightlike case almost impossible to hit exactly.
3. **Names for the three cases.** Default for the learner-facing wording: plain names ("reachable", "light only", "unreachable") in the table, with the standard terms (**timelike**, **lightlike**, **spacelike**) each introduced once, in the tutor's explanation after the learner has seen the three cases, as the names physicists use. Alternative: use only the standard terms from the start, or only the plain names and never the standard terms. The plain names are friendlier; the standard terms are what the learner will meet elsewhere.
4. **The five preset events.** Default: the table in "Physics Model", chosen so that every square is a whole number and the sides of the cone are crossed in both directions (one reachable event to the right, one to the left, and so on). Alternative: fewer presets (three, one of each case), simpler but with less to compare.
5. **The past half of the cone.** Default: draw it, dimmed and labeled "past", with one sentence in the introduction, because a cone drawn with only a future half looks incomplete and the "seen" experiments later need the past half. Alternative: draw only the future half and introduce the past half in the later experiment that needs it.
6. **Passing observer's speed range.** Default: presets from −0.5c to 0.5c. At higher speeds, some passing observers find the unreachable events in the opposite order (B before O), which brings in the next roadmap experiment (cause before effect) before the learner is ready. At speeds up to 0.5c this does not happen for any preset event; a test confirms it for the presets (Required Physics Test 8 documents the speeds at which it does). Alternative: allow higher speeds and let the tutor mention in one sentence that the order can change, saving the details for the next experiment. This choice should be the owner's, because it decides what the learner may see early.
7. **"Nothing travels faster than light" as an assumption.** Default: state it as a plain assumption in the introduction, with the pointer that Experiment 5 of the first chapter showed that light's speed is a limit the experiments never break. A note on checking: the first chapter's specifications show light's speed being the same for everyone and limit every clock to speeds below `c`, but I did not find a specification that states "nothing can travel faster than light" in so many words. The owner may want to decide whether that sentence is stated as an assumption, or whether the experiment should say where it comes from.
8. **The sound analogy.** Default: use the shout across a field in the introduction, and name where it fails (below) in the tutor's explanation. Alternative: a different anchor, such as a rumor spreading through a town at walking pace or a ripple spreading on a pond. The shout is the simplest one with a clear, familiar speed.
9. **The number of observers.** Default: the lab and one passing observer (two rows). Alternative: add the observer "who would see O and B happen at the same place" for the reachable cases, which ties back to Experiment 1's clock-frame row but is only possible for reachable pairs and so adds a case-by-case explanation.
10. **What would be left for a primary-source check.** The light cone and the three cases are standard special relativity, and the invariance is already tested in the first chapter (Experiment 11) and in this group's Experiment 1. If real-world claims are added to the tutor, they should be checked before approval. None are drafted here. The speed of sound used in the analogy (about 340 meters per second in air at ordinary temperatures) is a general-knowledge figure and is not checked.

---

## Success Criteria

1. The physics model classifies each preset event correctly, and the passing observer's relation, and the side of 1 that the speed needed falls on, are the same as the lab's for every tested `u`.
2. The learner predicts before running; Run requires a prediction.
3. The diagram makes the three regions (inside, on the edge of, outside the cone) visibly different, and shows where B lies.
4. Results are shown neutrally, then explained by the tutor after the learner has responded.
5. The learner can say that whether one event can affect another depends on whether the time is more than the distance, and that all observers agree on this.
6. The experiment does not discuss cause and effect or the order of events, does not claim to explain why the interval is the same for everyone (Experiment 1 shows it, it does not derive it), and does not show more than one dimension of space.
7. Nothing in it contradicts the first chapter's Experiments 1 to 11, or Experiment 1 of this group.

---

## Implementation Notes

All dates 2026-10-13. Built one step at a time, each reported before the next was authorized. Full Vitest run after the last change: 708 passed. `tsc -b` reports no errors in these files (it reports older errors elsewhere).

- **Step 1, physics model and tests:** `src/physics/lightCones.ts` (`classifyEventPair`, `speedNeeded`, `runLightConeExperiment`, the five preset events, `INTERVAL_ZERO_TOLERANCE = 1e-9`) and `src/physics/lightCones.test.ts` (13 tests covering the 11 in "Required Physics Tests"; two of them are split in two). The module computes no relativistic quantity itself: the passing observer's numbers come from `lorentzTransform` and `intervalSquared`.
- **Step 2, basic interface:** `src/components/LightConesExperiment.tsx`, wired into `src/App.tsx` as the second chapter of the Spacetime Geometry group. Introduction, five event buttons, five passing-speed buttons (-0.5c to +0.5c, Decision 6), the setup diagram and its "How to read this diagram" caption. Draft wording.
- **Step 3, prediction:** the three-way question names the chosen event. Not scored, changeable, with a "Your prediction" line.
- **Step 4, run gate:** Run is disabled until a prediction is chosen. Changing the event, the speed or the prediction returns to idle.
- **Step 5, playback:** 9 seconds of real time. The lab clock counts from 0 to 6 s, the flash spreads at one light-second per second, and B appears at its time with a short "B happens now" note. When the run ends, the cone, its three regions (as fills), a key and the dimmed past half are drawn. `onComplete` is called at the end of the playback.
- **Step 6, results:** a record line (the prediction is not marked), a table (time, distance, `time² - distance²`, speed needed, "Which case") for the lab and the passing observer, and a drawing of the two observers' time and distance bars on one scale beside a block of the same size in each row, coloured by sign and labelled with the case. Draft captions.
- **Step 7, AI tutor:** `src/components/LightConesTutor.tsx`, shown below the card once the results are, and started again after each run. Observe, compare, one conceptual question, then a seven-paragraph explanation (what happened in the lab; the shout across a field; the same test with the learner's numbers, where "timelike", "lightlike" and "spacelike" are first named; why everyone agrees; where the shout example fails; a negative interval squared; what was and was not shown). Every number comes from the model. The chapter summary ("What you learned" and "What's next") is in `src/App.tsx`. All of it is draft wording.
- **Complete-flow test (Step 8):** run by a scripted headless Chrome against the dev server, not by hand and not by the Chrome extension (which was not connected). The script is not in the repository. 47 checks passed with no console errors: reaching the chapter through the sidebar, the prediction and run gates, a change during the playback, a full run, the check mark and the saved "explained" state, each tutor step including the empty-reply gate, a second run restarting the tutor, Previous and Next, a page reload, all five events at five speeds (same case and same `time² - distance²` for both observers, cone drawn after the run), and a 390 px window (no sideways page scroll).
- **Final review (Step 9):** one gap found and fixed. The tutor's paragraph 4 said "the interval is the same for every observer. So its sign is the same", but the sign belongs to the interval *squared*. Paragraphs 4 and 6 now say "interval squared". This specification's Learning Objective 3 has the same loose wording ("the sign of the interval") and was **not** edited; the owner should decide (§28.2).

**Differences from this specification, all eight approved by the owner on 2026-10-13:**

1. The setup drawing shows no cone or regions. They are drawn only when the run ends, because where B sits relative to the cone is the answer to the prediction (§12).
2. The regions are named in a four-row key at the top of the finished drawing, not by text inside each region, because B's labels collided with text inside the regions.
3. Choosing a different event B clears the prediction, because the question is about that event. Changing only the passing speed keeps it.
4. A results drawing (bars and sign-coloured blocks) was added. The specification lists only the table. It was added to meet the visible-contrast rule of `CLAUDE.md` §14.
5. The table's last column, "Which case", uses the plain names "reachable", "light only" and "unreachable" (Decision 3's default).
6. The tutor's explanation adds a "what happened in the lab" paragraph and a comparison of the two observers' "speed needed" (for example 1.67c for the lab and 2.73c for the passing observer, both above 1, for the unreachable event (3 s, 5 ls)).
7. The playback lasts 9 seconds, and a "B happens now" note shows briefly.
8. The chapter summary's "What's next" points to the cause-and-effect experiment, which is a roadmap direction only and not an approved experiment.

**Not checked:** browsers other than headless Chrome, keyboard use and screen readers, a real learner, tablet widths between 390 and 850 px, and whether the 9-second playback feels right. At 390 px the diagram text is about 7 px, because the drawing scales to the window (the same limit as earlier diagrams). The speed of sound (about 340 m/s) and the statement that observers can disagree about how fast sound goes are general knowledge, not checked against a source. **Wording approval (2026-10-13):** the owner said "wording approved, all differences approved" after Step 9. The owner did not say whether to edit Learning Objective 3 ("the sign of the interval"), so it is unchanged and still open.

