# Experiment 1 — What Does a Clock Measure?

## 1. Purpose

This is the first experiment in SpaceTime Explorer AI.

Its purpose is to establish the fundamental concept of **elapsed time** and what a clock records, before introducing relativity, relative motion, or multiple observers.

The experiment should be simple enough that a learner with no prior knowledge of relativity can understand it.

The learner should discover the concept through observation and experimentation rather than simply being given an explanation.

---

## 2. Central Question

The experiment asks:

> **What does a clock measure?**

The initial intuitive answer, "time," should lead to a more precise understanding:

> **A clock records the elapsed time between events along its own history.**

The phrase "along its own history" should be introduced gently and without mathematical formalism.

---

## 3. Learning Objectives

By the end of the experiment, the learner should understand:

1. A clock provides a numerical reading that changes as time passes.
2. An experiment can have a beginning event and an ending event.
3. The difference between the clock's readings at those two events is elapsed time.
4. A clock's reading is associated with events.
5. The amount of elapsed time is always understood as a measurement made by a particular clock.

The learner does NOT need to understand relativity at the end of this experiment.

---

## 4. Scientific Scope

The experiment uses the simplest possible physical situation.

There is:

* one clock
* one location
* no spatial motion
* no gravitational effects
* no acceleration
* no relativistic effects

The clock measures elapsed time in a simple reference situation.

For the initial implementation, one simulation time unit corresponds to one second of clock time.

The simulation should use a deterministic relationship between experiment duration and clock reading.

---

## 5. Experiment Setup

When the experiment opens, the learner sees:

* A title: "Experiment 1 — What Does a Clock Measure?"
* A visible clock
* The current clock reading
* A control for selecting experiment duration
* A START button
* A clear indication that the clock and experiment are initially at rest

The initial clock reading is:

`00:00:00`

The duration control offers preset choices:

* 5 seconds
* 10 seconds
* 20 seconds
* 30 seconds

The default experiment duration is:

`10 seconds`

Unless the learner changes the duration control, the experiment uses this default duration of 10 seconds.

An "Other" option allows the learner to enter any duration from `1 second` through `60 seconds`.

The learner should be able to change the duration before starting the experiment.

---

## 6. Prediction

Before starting the experiment, the learner should be asked to make a prediction.

Example:

> "The experiment will run for 10 seconds. What do you predict the clock will read when the experiment ends?"

The learner enters a numeric prediction in seconds.

Example: `[10]` seconds.

The learner must submit a prediction before the experiment can be started.

The prediction does not need to be mathematically sophisticated.

The purpose is to establish the learning cycle:

**Predict → Experiment → Observe → Explain**

The experiment can still be run regardless of whether the prediction is correct.

---

## 7. Experiment Execution

When the learner presses START:

1. The experiment begins.
2. The start event is recorded.
3. The clock begins advancing.
4. The clock reading increases with simulation time.
5. The experiment ends when the selected duration is reached.
6. The end event is recorded.
7. The final clock reading is displayed.

The experiment should not depend on the actual amount of real-world time required to run the simulation.

The simulation must remain deterministic.

During the experiment, the visible clock ticks upward so the learner can watch elapsed time accumulate.

The visual playback of the clock may be accelerated so the learner does not have to wait for the full real-world duration.

The animation is a presentation detail only. It must not determine the physics result. The physics result remains deterministic and is based on the simulation duration, not on playback speed or real-world elapsed time.

While the experiment is running, the duration controls and the START button are disabled.

When the experiment completes, a "Run Again" control becomes available. Each run is a separate experiment with its own start and end events.

---

## 8. Experiment Results

After the experiment finishes, display:

* Start event
* End event
* Initial clock reading
* Final clock reading
* Elapsed time
* The learner's prediction

The visible clock uses `HH:MM:SS` format, such as `00:00:10`.

Results display elapsed time in plain language, such as "10 seconds."

Example:

```text
Start event:       00:00:00
End event:         00:00:10

Initial reading:   00:00:00
Final reading:     00:00:10

Elapsed time:      10 seconds

Your prediction:   10 seconds
Actual result:     10 seconds
```

The learner is not scored on the accuracy of their prediction. The prediction and the actual result are shown side by side, and the AI tutor encourages the learner to compare the two and reflect on what they observed (see Section 11).

The learner should be able to repeat the experiment with a different duration using the "Run Again" control.

---

## 9. Events

The experiment introduces the concept of an event without yet introducing spacetime.

Define two events:

### Event A — Start

The experiment begins.

The clock has its initial reading.

### Event B — End

The experiment ends.

The clock has its final reading.

The elapsed time is the difference between the clock readings at Event A and Event B.

This concept will become important in later experiments involving multiple clocks and observers.

---

## 10. Visualization

The visualization should be simple.

A useful representation is:

```text
Event A                         Event B
START                            END
  ●───────────────────────────────●
  │                               │
00:00:00                       00:00:10

          elapsed time
             10 seconds
```

The visualization should emphasize that elapsed time is associated with the interval between two events.

Do not introduce spacetime diagrams in this experiment.

---

## 11. AI Tutor Behavior

The AI tutor acts as a laboratory instructor rather than giving a continuous lecture.

The preferred interaction sequence is:

### Before the experiment

Ask the learner to predict the result.

### During the experiment

Allow the learner to observe the clock.

Do not unnecessarily interrupt the experiment with explanations.

### After the experiment

Ask:

> "What did you observe?"

Encourage the learner to compare their prediction with the actual result, without scoring it as correct or incorrect. For example:

> "You predicted 10 seconds, and the clock read 10 seconds. What does that tell you? What if they had been different?"

Then ask a conceptual question such as:

> "What does the clock's final reading tell us about what happened between the start and end events?"

The tutor should encourage the learner to reason from the experiment.

Only after the learner has had an opportunity to respond should the tutor provide an explanation.

---

## 12. Core Explanation

The AI tutor should eventually establish the following idea in simple language:

> A clock gives us a way to measure how much time has elapsed between events.

The tutor may explain:

> When the experiment started, the clock had one reading. When the experiment ended, it had another reading. The difference between those readings tells us how much time elapsed according to that clock.

Avoid introducing the term "proper time" at this stage.

---

## 13. Multiple Runs

The learner should be able to repeat the experiment.

Suggested examples:

* 5 seconds
* 10 seconds
* 20 seconds
* 30 seconds

The learner should be able to observe that changing the experiment duration changes the final clock reading correspondingly.

The purpose is to reinforce the relationship between:

**duration of the experiment → clock reading → elapsed time**

---

## 14. Physics Engine Requirements

The physics implementation should be separate from the user interface.

The physics engine should provide a simple experiment model capable of:

* starting an experiment
* advancing simulation time
* maintaining the clock reading
* recording the start event
* recording the end event
* calculating elapsed time
* returning structured results

The physics engine should not contain UI code.

The UI should not independently calculate the physical result.

---

## 15. Structured Result

The experiment should produce a structured result conceptually equivalent to:

```text
experiment_duration
initial_clock_reading
final_clock_reading
elapsed_time
start_event
end_event
```

The exact programming representation will be determined during implementation.

---

## 16. Testing Requirements

The physics implementation must include automated tests.

At minimum, tests should verify:

1. A zero elapsed duration produces zero elapsed clock time.
2. A 5-second experiment produces 5 seconds of elapsed clock time.
3. A 10-second experiment produces 10 seconds of elapsed clock time.
4. A 30-second experiment produces 30 seconds of elapsed clock time.
5. The initial clock reading is zero for a new experiment.
6. The final clock reading equals the initial reading plus elapsed time.
7. Repeated experiments begin with a fresh clock state.

Tests should test the physics model independently of the UI.

---

## 17. What This Experiment Does NOT Implement

The following are explicitly excluded:

* time dilation
* special relativity
* general relativity
* relative motion
* two observers
* two clocks
* length contraction
* relativity of simultaneity
* speed of light
* light clocks
* Lorentz transformations
* spacetime curvature
* gravitational time dilation
* proper-time calculations
* spacetime diagrams
* orbital mechanics
* spacecraft
* AI-generated physics calculations

These subjects belong to later experiments.

---

## 18. Educational Progression

Experiment 1 establishes the foundation for the next experiments.

The planned progression is:

### Experiment 1

**What Does a Clock Measure?**

One clock and elapsed time.

### Experiment 2

**Two Clocks**

Compare measurements made by two clocks.

### Experiment 3

**The Moving Clock**

Introduce relative motion and the first direct relativistic effect.

### Experiment 4

**The Light Clock**

Explore why the speed of light leads to time dilation.

### Experiment 5

**Why Can't Light Go Faster?**

Explore the role of the invariant speed of light.

Each experiment should build on concepts introduced previously.

---

## 19. Implementation Rule

This document is the scientific and educational specification for Experiment 1.

Claude Code should implement only what is specified here.

If an implementation decision requires a physics assumption that is not specified here, Claude Code should stop and request clarification rather than inventing the assumption.

Do not implement Experiment 2 or later experiments as part of this task.

---

## 20. Audit update (2026-11-08)

Brought to the newer rules of CLAUDE.md §14, §15 and §28 (`docs/AUDIT-PLAN.md`, Rule E and the owner's rules of 2026-11-07), with the owner's choices of 2026-11-08: fix every gap of `docs/audit/relativity-of-time-and-motion/01-gap-report.md`, Part 1 fixed at 10 seconds with the duration choice in Part 2, a strip scale from 0 to twice the duration with an edge arrow, the tutor marks the guess in its explanation, no check-up or setting-following table, and a page 900 px wide. Wording was drafted in `docs/audit/relativity-of-time-and-motion/01-draft-wording.md` and approved by the owner on 2026-11-08 ("approve with defaults", with the draft's eleven questions, and again for the tutor's five added points). The earlier text of this specification stands except where this note says otherwise; where it conflicts, this section wins.

1. **The page in four Parts** (replaces the single column of §5 and §10). Above Part 1, with no heading: the introduction, a "Want to know more?" list and a collapsed "Words and formulas" box. Part 1 "Predict, then watch" (the prediction, START, the clock, the Event Interval strip), Part 2 "Now try it yourself" (the duration choice and Drawing A), Part 3 "The results" and Part 4 "The tutor", each with a lead. Parts 2 to 4 appear when the first run finishes. The page is 900 px wide.
2. **The duration moves to Part 2** (changes §5). Part 1 always uses 10 seconds, the default of §5. Part 2 offers 5, 10, 20 and 30 seconds and "Other" (a whole number from 1 to 60), default 20, with "Run your duration"; this is where §13 "Multiple Runs" is met. A "Runs so far" list shows each Part 2 run.
3. **The prediction** (§6) is unchanged except that it is about the 10-second run. START stays disabled until a number is typed. After START the guess is locked; there is no "Run Again" and no "Change prediction". An always-visible **Start over** (greyed out until there is a guess or a run, and while a run plays) clears the guess, the runs, the results and the tutor's progress.
4. **The Event Interval strip** (changes §10). It appears when the run ends, has a time scale from 0 to twice the duration (ticks at 0, the duration and twice the duration), amber dots for Event A and Event B with their readings, an "elapsed time" bracket, and a **white YOUR GUESS mark** at the guessed number of seconds in a box joined to it by a line. A guess outside the scale is drawn as a white arrow at the edge, and the box still says the number. The mark shows the guess only and never moves the events. Part 2's **Drawing A** is the same strip for the learner's length, with Event B and the bracket in pink (the guess is not redrawn there, because it was a guess for the 10-second run). Under each picture: "Where the real picture comes from" (calculated here; nothing measured or imagined) and a "How to read" caption with a worked moment and "What to look for" in three parts (Look at / What it means / Why it matters).
5. **Introduction.** Kept: the question, what a clock does, the stopwatch picture, the assumptions. Added: "How real clocks count" (a quartz watch's 32,768 vibrations per tick; the second as 9,192,631,770 cesium vibrations since 1967), a rewritten "What happens" and "Your job", "Your guess and the real pictures" and "Some new words". The introduction still lets a learner work out the answer ("exactly seven ticks"); the owner kept it, since §6 says the guess is meant to be easy.
6. **Words and links.** A "Words and formulas" box (clock, tick, vibration, hertz, event, clock reading, duration, elapsed time; the formula entry, with the worked example 00:00:10 − 00:00:00 = 10 seconds, appears only after the Part 1 run, because it shows the answer, §12). A "Want to know more?" list of three NIST pages, below.
7. **Results** (§8). The same lines, with a "your guess" tag on the elapsed-time line, "You guessed" beside "The real elapsed time", and a "Where this comes from" line. No table: elapsed time equals the chosen length by construction, so no outside reference exists (CLAUDE.md §14 "Reading the Results" applies only where a real reference exists).
8. **Tutor** (changes §11 and §12). The prompts point to the clock, the strip and the white mark and give no verdict. The explanation keeps its two paragraphs, then "Your guess, marked" (the same as, or N seconds more or less than, the clock's reading; no score), then five points: (1) why the guess did not change the clock (a kitchen timer), (2) elapsed time is a difference (an imagined clock from 00:00:30 to 00:00:40, "as an example only"), (3) a reading belongs to an event (a bus ticket stamped 14:05), (4) "according to this clock" (one clock only; the next chapter, "Two clocks at rest", adds a second; nothing about disagreement), (5) try Part 2 (the 5- and 20-second runs). "Proper time" is still not used (§12).
9. **Physics module.** The model is unchanged. Added and tested: `stripScaleEnd` and `guessPositionOnStrip` (the scale's end, the guess's position as a fraction 0 to 1, which edge it is off, and the guess minus the real elapsed time), with 6 new physics tests and 11 render tests (`src/components/Experiment1.test.tsx`). `formatClockReading` moved to `src/components/clockFormat.ts`. Tests 2,416 pass; the type check and build pass.
10. **Sources (fetched and read 8 November 2026, through a helper that reported their content; the agent did not read the pages itself).**

    | Idea | Source | Checked |
    |---|---|---|
    | How a second is defined; a clock counts cycles | NIST, "How Do You Measure a Second?" (updated May 2026) | 2026-11-08 |
    | Clocks work by counting a periodic event; the 32,768 Hz quartz crystal divided down to one-second ticks | NIST Time and Frequency Division, "Timekeeping and clocks FAQs" (updated October 2024) | 2026-11-08 |
    | The official definition of the second (9,192,631,770) and of the hertz | NIST Office of Weights and Measures, "SI Units – Time" (updated January 2026) | 2026-11-08 |
    | A real experimental result to cite | None: this experiment uses no real result, so there is no paper to link (§29 rule 3(a) has nothing to cite) | 2026-11-08 |

11. **Browser check (agent, 2026-11-08).** Covered the guess 7 (Part 1's strip, the white box, Event A and Event B, the bracket), a Part 2 run at 20 seconds (pink Event B, scale to 40 s), the tutor's three questions, the explanation with the guesses 7 and 12 (the guess marking and points 1 to 4 read on the page), and Start over (clears the page and greys out again). One fix after the first look: the footnote under the strip touched the elapsed-time label, so the strip was made taller.
12. **Not done, and open.** The owner has not reviewed the finished page. Not checked: the edge arrow by eye (render tests only), point 5 of the explanation by eye, other durations and the "Other" box, the words box and links by eye, the captions in full, dark mode (the tutor box keeps its fixed light colours), narrow widths, other browsers, keyboard use, a real learner. Differences from the approved draft: Part 2 defaults to 20 seconds (so its first run differs from Part 1), Part 1's START stays disabled after the run (Start over is the way back), and the words box's formula entry appears only after the Part 1 run.
