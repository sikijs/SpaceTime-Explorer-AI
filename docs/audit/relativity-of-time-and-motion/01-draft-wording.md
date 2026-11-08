# Draft wording: Relativity of Time and Motion Experiment 1 (What Does a Clock Measure?)
Date: 2026-11-08 | Status: DRAFT for the owner's line-by-line approval (Step 2 of `docs/AUDIT-PLAN.md` §5, following the Gravitational Waves audits). Nothing has been built, changed or committed. The specification, component, tutor and module are untouched.

Gaps chosen (the owner, 2026-11-08, "all defaults" to the six questions of the gap report): fix every gap; Part 1 fixed at 10 seconds and the duration choice moves to Part 2; the strip runs from 0 to twice the duration, with an edge arrow for a guess beyond it; the tutor marks the guess in its explanation with no score; no check-up or setting-following table, only the guess tag on the real elapsed-time row; the page widens from 600 to 900 px.

## Layout
- **Above Part 1 (no heading):** the introduction, "Want to know more?" (three links), a collapsed "Words and formulas" box.
- **Part 1 (amber), "Predict, then watch":** the guess, START (10 seconds, the specification's default), the clock readout, and the **Event Interval strip** once the run ends, with the white YOUR GUESS mark, its "Where the real picture comes from" line and its caption.
- **Part 2 (pink), "Now try it yourself", shown after the first run finishes:** duration buttons (5, 10, 20, 30, or your own 1 to 60), "Run your duration", a clock readout and **Drawing A** (the same strip for the learner's duration, with a pink marker), a short list of the runs so far, a caption.
- **Part 3 (teal), "The results":** the lines of the Part 1 run as today, with the guess beside them and a tag on the elapsed-time row; where the numbers come from.
- **Part 4 (blue), "The tutor":** the tutor.
- **Start over:** always visible from the first screen, below the page's introduction, greyed out until there is a guess or a run and while a run plays. It replaces "Run Again" (which appeared only inside the Results card).
- **Width:** 900 px.
- **Colours:** white is only ever the learner's guess; pink is only ever the learner's own duration in Part 2; amber is the real Event A and Event B.

---

## 1. Introduction

Paragraphs not listed below ("The question", "What a clock actually does", "A daily-life picture") stay as approved. **Question 9 asks whether to keep them exactly (the "00:00:07 means exactly seven ticks" example makes the answer easy to work out, which the specification intends).**

**1a. New paragraph after "A daily-life picture": "How real clocks count."**
"Real clocks count in just this way, only much faster. A quartz watch has a tiny crystal inside that vibrates 32,768 times every second. The watch counts the vibrations and moves on its seconds hand once for every 32,768 of them: 32,768 ÷ 32,768 = 1 tick. An atomic clock counts the vibrations of a cesium atom instead. Since 1967 the official length of one second has been exactly 9,192,631,770 of those vibrations. In every case a clock is a counter of regular repeats."

(Sources, fetched and read 2026-11-08: NIST "Timekeeping and clocks FAQs", for "Clocks work by counting a periodic event with a known frequency" and the 32,768 Hz crystal "divided down" to one-second ticks; NIST "How Do You Measure a Second?" and "SI Units – Time", for 9,192,631,770 cycles and the 1967 definition.)

**1b. "What happens"** (old: "You choose how long the experiment lasts. When you press START...") New:
"There is one clock, and it stands still. It starts by showing 00:00:00. In Part 1 the experiment lasts 10 seconds. When you press START, the clock begins to tick, and the experiment ends when the 10 seconds are up. Two moments matter here: the moment the experiment starts and the moment it ends. We call each of these moments an **event**. When the run ends, a strip appears that shows the two events and the clock's reading at each. In Part 2 you choose any length from 1 to 60 seconds and run that."

**1c. "Your job"** (old: "Before you press START, predict... A wrong guess is fine. Guesses are not scored. Guessing first gives you a chance to think before you look.") New:
"Before you press START, predict what the clock will show when the experiment ends. A wrong guess is fine. Guesses are not scored. Guessing first gives you a chance to think before you look. Then watch the run, try other lengths in Part 2, and talk it over with the tutor."

**1d. New paragraph: "Your guess and the real pictures."**
"Your guess never changes the real pictures, the clock or the numbers: they come from a calculation that knows nothing about what you guessed. Your guess is drawn on the strip in white, in a box labelled YOUR GUESS, and it is shown again beside the results. In Part 2 the length you choose does change the clock and the strip, and the marks it moves are pink."

**1e. New line: "Some new words."**
"The "Words and formulas" box below has each one, with a short plain meaning: clock, tick, vibration, event, clock reading, elapsed time, duration, hertz."

**1f. "What we assume"** (unchanged: one clock, in one place, no motion, no gravity; the animation may play faster than real life, which does not change the result.)

---

## 2. "Want to know more?" (opens in a new tab; fetched and read 2026-11-08)

1. **NIST: How Do You Measure a Second?** (National Institute of Standards and Technology; page updated May 2026). "A plain explanation of how an atomic clock counts the vibrations of cesium atoms to define one second."
2. **NIST: Timekeeping and clocks FAQs** (NIST Time and Frequency Division; updated October 2024). "How clocks of every kind work by counting a regular repeat, from a swinging pendulum to a quartz watch to an atomic clock."
3. **NIST: SI Units, Time** (NIST Office of Weights and Measures; updated January 2026). "The official definition of the second, and of the hertz, one repeat per second."

There is no real experimental result on this page, so there is no paper to link (§29 rule 3(a) has nothing to cite). Recorded in the specification's source table.

---

## 3. "Words and formulas" (collapsed box)

- **Clock:** anything that repeats in a very regular way and keeps count of the repeats.
- **Tick:** one count of the clock. In this page, one tick is one second.
- **Vibration (or cycle):** one back-and-forth of something that repeats, such as one swing of a pendulum or one vibration of a crystal.
- **Hertz (Hz):** the unit for how many repeats happen in one second. 1 Hz is one repeat per second; 32,768 Hz is 32,768 repeats per second.
- **Event:** one moment that something happens: here, the start of the experiment and its end.
- **Clock reading:** the numbers the clock shows at an event, written hours:minutes:seconds. 00:00:10 means 0 hours, 0 minutes, 10 seconds.
- **Duration:** how long the experiment is set to last, in seconds.
- **Elapsed time:** how much time passed between two events, according to the clock.
- **Formula:** elapsed time = clock reading at the end − clock reading at the start. **Worked example from this page:** 00:00:10 − 00:00:00 = 10 seconds.

---

## 4. Leads of the four Parts

**Part 1, "Predict, then watch"** (amber): "What we are about to do. First you guess what the clock will show when the experiment ends. Then you press START and watch the clock count for 10 seconds. When the run finishes, a strip appears that shows the two events, with your guess drawn on it in white."

**Part 2, "Now try it yourself"** (pink): "What we are about to do. Now you choose how long the experiment lasts, from 1 to 60 seconds, and run it. The length you choose changes the clock and the strip in this Part, marked in pink. It does not change Part 1's picture, the results in Part 3, or your guess."
*Note beside the duration buttons:* "Your guess does not change these drawings, but the length you choose does."
*Before any Part 2 run:* "Not run yet. Choose a length and press Run your duration."

**Part 3, "The results"** (teal): "What we are about to do. Here are the numbers from the Part 1 run, with your guess listed beside them. Nothing in this Part changes with your guess or with the length you choose in Part 2."

**Part 4, "The tutor"** (blue): "What we are about to do. Talk through what you saw. The tutor points to your white guess mark, then explains."

---

## 5. The prediction

**Question** (unchanged but for the fixed length): "The experiment will last 10 seconds. When it ends, what will the clock show? Type your guess in seconds."
Line under the box (unchanged): "Your prediction: [N] seconds" or "Enter a prediction to continue".
After START: "Your prediction is locked while you try other lengths. To change it, press Start over."
**Start over** button: always visible, greyed until a guess is typed or a run has started, and while a run plays. It clears the guess, the runs, the results and the tutor's progress.

---

## 6. Part 1's picture: the clock and the Event Interval strip

**Drawn:** the clock readout (as today). When the run ends, the strip: a line from 0 to 20 seconds (twice the 10-second duration) with tick marks and numbers at 0, 10 and 20 s; the amber dot **Event A, START** at 0 with its reading 00:00:00 under it; the amber dot **Event B, END** at 10 with its reading 00:00:10; a bracket between them labelled "elapsed time: 10 seconds". **The white mark:** a white dot on the same line at the guessed number of seconds, joined by a line to a white box "YOUR GUESS: N seconds". A guess beyond 20 s (or below 0) is drawn as a white arrow at the right (or left) edge, and its box still says the number; the caption says so. The mark appears only when the strip appears, so it shows nothing early (§12).

**"Where the real picture comes from":** "Calculated here, not measured: the readings come from the length of the experiment, one second of clock time for each second that passes. No instrument measured them and nothing here is imagined. The white mark is only your guess, placed on the same scale."

**Caption, "How to read this diagram":**
*What you see.*
- **The clock** above shows the clock's reading as hours:minutes:seconds. It counts up while the experiment runs.
- **The Event Interval strip** appears when the run ends. It is a time line: the further right, the later the moment.
- **The scale** under the line is in seconds. "0 s" is the start, "10 s" the length of the experiment, "20 s" twice that, so there is room to the right of the end.
- **Event A, START** (amber dot) is the moment the experiment began, and **Event B, END** is the moment it ended. The number under each is the clock's reading at that moment.
- **The bracket "elapsed time"** joins the two events. It is the time that passed between them.
- **The white mark and the YOUR GUESS box** are your guess, placed on the same scale. A white arrow at the edge means your guess is beyond the end of the scale. The mark is only your guess; it never moves the events.

*A worked moment.* In this run the experiment lasts 10 seconds. Event A is at 0 s and reads 00:00:00. Event B is at 10 s, halfway along the scale, and reads 00:00:10. The elapsed time is 00:00:10 − 00:00:00 = 10 seconds. If you had guessed 7, the white mark would sit at 7 s, 3 seconds to the left of Event B.

*What to look for.* (Each item appears only once what it refers to is drawn.)
1. **Look at** the number under Event A and the number under Event B. **What it means:** the clock has a reading at each event, 00:00:00 at the start and 00:00:10 at the end. **Why it matters:** a clock's reading belongs to an event, so what the clock tells us is found by comparing its readings at two events.
2. **Look at** the "elapsed time" bracket and the scale. **What it means:** the bracket is 10 seconds long, the same as the difference between the two readings. **Why it matters:** elapsed time is the number a clock measures between two events.
3. **Look at** the white YOUR GUESS mark and Event B on the same scale. **What it means:** the gap between them (if any) is how far your guess was from the clock's end reading, in seconds. **Why it matters:** it lets you compare what you expected with what the clock counted, which is the point of guessing first.

---

## 7. Part 2's picture: Drawing A

**Drawn:** a second clock readout and the same strip for the chosen length (scale 0 to twice the chosen length), but with the **Event B dot and bracket in pink**, labelled "Event B, END (your length)", so a learner can see at a glance that this is their own length. The white guess is **not** redrawn here: it was a guess for the 10-second run. Below it, "Runs so far": one line per Part 2 run, such as "5 s: ends at 00:00:05, elapsed 5 seconds".

**"Where the real picture comes from":** same as Part 1, with "your chosen length" for "the length of the experiment".

**Caption, "How to read Drawing A":**
- **The clock and strip** work as in Part 1, for the length you chose. If you choose a different length the scale changes too: 20 s gives a scale to 40 s.
- **Pink** marks your own length, so you can tell this Drawing from Part 1's.
- **"Runs so far"** lists every run in this Part, one line each.
- *Worked moment:* a 20-second run ends at 00:00:20, halfway along a scale to 40 s, and its elapsed time is 00:00:20 − 00:00:00 = 20 seconds.
- **Look at** the Event B reading in each run, and the line "Runs so far". **What it means:** each reading equals the length you chose (5 s ends at 00:00:05, 20 s at 00:00:20). **Why it matters:** it shows how the clock's final reading and the elapsed time follow the length of the experiment.

---

## 8. Results (Part 3)

Lines as today (start and end events; readings at the start and end; elapsed time; "You guessed"; "The real elapsed time"), with these changes:
- A small tag on the "Elapsed time" line: "Your guess is drawn on Part 1's strip as the white mark."
- The "Run Again" button and its divider are removed (replaced by Start over).
- Under the lines: **"Where this comes from:** calculated here from the length of the experiment (see the caption). Nothing here changes with your guess or with the length you choose in Part 2."

No check-up and no setting-following table (the owner's default). Reason, recorded in the specification: elapsed time equals the chosen length by construction, so there is no outside reference.

---

## 9. Tutor (Part 4)

Three questions then the explanation, as today. Changes:
- **Observe:** "What did you notice while the clock was running, and when it stopped? Look at the clock and at the strip." (adds the pointer)
- **Compare:** "You guessed [N] seconds, and the clock really showed [M] seconds. Your guess is the white mark on the strip, and the clock's end reading is Event B. What do you notice when you compare them? What if they had been different?" (names the white mark)
- **Conceptual:** unchanged.
- **Explanation** (the two paragraphs stay) with a closing paragraph that marks the guess, no score:
  - If equal: "Your guess of [N] seconds is the same as the clock's [M] seconds. The clock counted exactly that many ticks between the start and the end."
  - If different: "Your guess of [N] seconds was [D] seconds [more / less] than the [M] seconds the clock showed. The clock counted [M] ticks between the start and the end, so its end reading is [M] seconds after its start reading."
  - Then, for every guess: "Try other lengths in Part 2 to see the same thing: the reading at the end is always the reading at the start plus the ticks the clock counted."

---

## 10. Physics module (new, with tests; the approved model is unchanged)

`guessPositionOnStrip(durationSeconds, guessSeconds)` in `clockExperiment.ts`, returning: the scale's end (`2 × duration`), the guess's position as a fraction 0 to 1 along the scale (clamped), which edge it is off (`'left'`, `'right'` or none), and the guess minus the real elapsed time (a number the tutor and the guess tag use). Tests (in `clockExperiment.test.ts`):
1. The scale ends at twice the duration (5 → 10, 10 → 20, 30 → 60).
2. A guess equal to the duration sits at 0.5; a guess of 0 at 0; a guess of twice the duration at 1.
3. A guess beyond the scale is clamped to 1 and flagged `'right'`; a negative guess is clamped to 0 and flagged `'left'`.
4. The difference is the guess minus the elapsed time (7 against 10 gives −3).
5. The real result does not depend on the guess (`runClockExperiment` gives the same values whatever guess is passed to the new function).
6. A non-finite guess is refused.

---

## 11. Specification changes (only after approval, §28.2)

`01-clock.md`: §5 (the duration control moves from the setup to Part 2; Part 1 uses 10 seconds), §6 (prediction wording unchanged), §8 and §11 (the tutor marks the guess in its explanation, with no score), §10 (the strip gets a scale and the guess mark), §13 (multiple runs are done in Part 2), a new "Audit update" section, source table (three NIST pages, read 2026-11-08; "no real result, no paper" row), and the layout (four Parts, Start over, 900 px).

---

## 12. Questions for the owner (suggested answers in brackets)

1. **Introduction 1a** (how real clocks count, with the quartz and cesium numbers): approve as written? [yes]
2. **Introduction 1b to 1e:** approve? [yes]
3. **Links:** the three NIST pages and their one-line descriptions? [yes]
4. **Words box:** the nine entries and the worked example? [yes]
5. **Part leads and the note beside the duration buttons:** approve? [yes]
6. **Edge arrow:** a guess beyond the scale is drawn as an arrow at the edge with its number in the box? [yes]
7. **Part 2's Drawing A does not redraw the white guess**, because it was a guess for the 10-second run? [yes]
8. **Tutor wording** (the two prompts and the closing paragraph that marks the guess, no score)? [yes]
9. **Keep the "What a clock actually does" and "A daily-life picture" paragraphs exactly**, even though they make the answer easy to work out (the specification says the guess is meant to be easy)? [yes, keep]
10. **Results:** the tag on the elapsed-time row and the "Where this comes from" line, no table? [yes]
11. **Source reading:** the three pages were read through a helper that reported their content; the agent did not read the pages itself. Accept, or have the owner open them first? [accept; flagged in the specification]

---

# Addendum, 2026-11-08: a fuller tutor explanation (Part 4) — DRAFT for the owner's line-by-line approval
Asked for by the owner after the page was built ("should we add some more content to 'Let's reflect'", then "go ahead and draft items 1 to 5"). Nothing in the tutor has been changed yet. The three questions are unchanged. Only the explanation grows. It uses only ideas the page already has and brings in no later physics (spec §12: no "proper time"; spec §22: keep it simple).

## Where it goes
The explanation today has: (a) the two short paragraphs ("A clock is a way to measure...", "When the experiment started..."), (b) "Your guess, marked.", (c) "Try other lengths in Part 2...". The new points go **between (b) and (c)**, and (c) is replaced by point 5. Points are numbered 1 to 5 so the learner can see how many there are (as the Gravitational Waves tutors do). Every number comes from the physics module (§9).

## The wording

**1. Why your guess did not change the clock.**
"Whatever you guessed, the clock counted the same [M] ticks. Your guess was about the clock; it was never part of it. Think of a kitchen timer: if you guess the cake needs 20 minutes and it really needs 25, the timer still counts the same 25 minutes. A different guess would only have meant a different gap between your guess and the clock's reading, never a different reading."
([M] = the real elapsed time, 10 seconds in Part 1. This answers the tutor's own question "What if they had been different?" and matches the introduction's "Your guess never changes the real pictures".)

**2. Elapsed time is a difference.**
"Elapsed time is not the end reading on its own. It is the end reading minus the start reading. In this run the start reading was 00:00:00, so the two happened to be the same: 00:00:10 − 00:00:00 = 10 seconds. Now imagine, as an example only, a clock that started at 00:00:30 and ended at 00:00:40. Its end reading is not 10, but the time that passed is still 00:00:40 − 00:00:30 = 10 seconds. The same number of ticks went by."
(The page's own clock always starts at 00:00:00, so the second clock is imagined and labelled "as an example only".)

**3. A reading belongs to an event.**
"The 00:00:10 is the clock's reading at Event B. It is not "the time" in general. Think of a bus ticket stamped 14:05 when you board: by itself it only says what the machine's clock read at that moment. It tells you nothing about how long the trip took until you have a second stamp at the end. A reading is attached to an event, and it takes two events to say how much time passed."

**4. According to this clock.**
"That is why the explanation says "according to that clock". Elapsed time is always a measurement made by some particular clock. In this experiment there is only one clock, so "10 seconds" simply means 10 seconds on this clock, and nothing else exists that could disagree with it. The next chapter, "Two clocks at rest", puts a second clock beside it."
(No hint that two clocks might disagree; that is for Experiment 2.)

**5. Try Part 2.**
"In Part 2 you can run other lengths and see the same thing. A 5-second run ends at 00:00:05 and a 20-second run ends at 00:00:20. If you have run some, "Runs so far" lists them. The end reading is always the start reading plus the ticks the clock counted."
(5 and 20 come from `runClockExperiment`. This replaces the current closing line "Try other lengths in Part 2...".)

## Tests to add (render tests, in `Experiment1.test.tsx`)
The explanation shows points 1 to 5 once, in order, and only at the last step. It contains "00:00:40 − 00:00:30 = 10 seconds" and the real [M] for a guess of 7 and of 10. It contains no "proper time" and no "disagree" (guarding spec §12 and the Experiment 2 hand-off).

## Questions for the owner (suggested answers in brackets)
1. **Order:** the five points come after "Your guess, marked." and replace the closing Part 2 line? [yes]
2. **Examples:** the kitchen timer (point 1) and the bus ticket (point 3), both daily-life and neither relying on relativity (§15)? [yes]
3. **Point 2's imagined clock** (starts at 00:00:30), labelled "as an example only"? [yes]
4. **Point 4's hand-off sentence**, naming the next chapter "Two clocks at rest" and saying nothing about disagreement? [yes]
5. **Length:** about 250 words added to the explanation, still one screen; fine, or should any point be dropped? [fine]
6. **Specification:** add the five points to `01-clock.md` §11 and §12 in the "Audit update", only after approval (§28.2)? [yes]
