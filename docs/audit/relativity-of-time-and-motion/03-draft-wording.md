# Draft wording: Relativity of Time and Motion Experiment 3 (Moving Clock)
Date: 2026-11-08 | Status: DRAFT for the owner's line-by-line approval (Step 2 of `docs/AUDIT-PLAN.md` §5, following Relativity 1 and 2, `01-` and `02-draft-wording.md`, whose approved answers are reused). Nothing has been built, changed or committed. The specification, components, tutor and module are untouched.

Gaps chosen (the owner, 2026-11-08, "all defaults" to the ten questions of the gap report): fix every gap; Part 1 fixed at 10 seconds and 0.5c, with the duration **and** the speed (and the 0c baseline) in Part 2; two time bars (Lab clock, Moving clock) under the track on one scale from 0 to twice the lab duration, one white mark and box on the moving clock's bar, an edge arrow for an off-scale guess; Part 2's Drawing A with the moving clock's bar in pink, no white mark, and "Runs so far"; the tutor marks the guess with no score, and its classification and its "Your numbers" arithmetic move into the module with tests, **with the half-the-effect margin kept unchanged until the owner confirms or changes it**; the "friends meet up for dinner" example replaced; no check-up or setting-following table, a guess tag and notes under the results; links searched, with no time-dilation link; shared `toggle-button` class; size Medium.

## Layout
- **Above Part 1 (no heading):** the introduction (its assumptions list stays), "Want to know more?" (one link and recorded gaps), a collapsed "Words and formulas" box.
- **Part 1 (amber), "Predict, then watch":** the guess, START (10 seconds, 0.5c), the track with the lab clock and the moving clock and the two clock readouts, and, once the run ends, the **two time bars** with the white YOUR GUESS mark, "Where the real picture comes from" and a caption.
- **Part 2 (pink), "Now try it yourself", after the first run finishes:** duration buttons (5, 10, 20, 30, or 1 to 120), speed buttons (0, 0.1, 0.3, 0.5, 0.8, or 0.01 to 0.99), "Run your settings", **Drawing A** (the track and bars for the learner's settings, the moving clock's bar in pink), "Runs so far", a caption.
- **Part 3 (teal), "The results":** the lines of the Part 1 run with the guess beside them, a tag on the moving clock's line, and "What these results tell us".
- **Part 4 (blue), "The tutor".**
- **Start over:** always visible, greyed out until there is a guess or a run and while a run plays. The page is already 900 px wide. Buttons use the shared `toggle-button` class.
- **Colours:** white is only the learner's guess; pink only the learner's own settings in Part 2; the lab clock stays blue and the moving clock amber, as drawn today.

---

## 1. Introduction

Paragraphs not listed ("The question", "How this differs from Experiment 4", "What we assume") stay as approved, except that "Experiment 2" and "Experiment 4" in them become the chapters' titles ("Two clocks at rest", "The light clock") and the assumptions list gains the definition of c (1e below).

**1a. "What's really being tested", the example** (old: "...if two friends split up, one driving across town while the other stays home, and meet up again for dinner, they assume their watches still agree."). New:
"In daily life we assume time is the same backdrop for everyone: if one friend rides a fast train while another waits on the platform, both assume that a minute passes for the train rider in exactly the time a minute passes for the friend on the platform. This experiment checks whether that everyday assumption survives once the speeds involved get extreme enough to matter."
(No clock returns, so the twin paradox of Experiment 10 is not brought in, §15.)

**1b. "What happens"** (old: "...You choose the speed and how long the lab clock runs. When that time is up, we read both clocks."). New:
"Two ordinary clocks start together, at the same place, both showing 00:00.0. One stays in the lab, which is the place where the experiment is set up. The other moves away in a straight line at a steady speed. In Part 1 the moving clock goes at 0.5c, which is half the speed of light, and the lab clock runs for 10 seconds. When the time is up, we read both clocks, and two bars appear that show how much time each clock counted. In Part 2 you choose any speed and any length of time and run that."

**1c. "Your job"** (old: "Before you press START, predict what the moving clock will show at the end. A wrong guess is fine. Guesses are not scored."). New:
"Before you press START, predict what the moving clock will show at the end. A wrong guess is fine. Guesses are not scored. Then watch both clocks, try other speeds and lengths in Part 2, and talk it over with the tutor."

**1d. New paragraph, "Your guess and the real pictures."**
"Your guess never changes the real pictures, the clocks or the numbers: they come from a calculation that knows nothing about what you guessed. Your guess is drawn on the bars in white, in a box labelled YOUR GUESS, and it is shown again beside the results. In Part 2 the speed and the length you choose do change the clocks and the drawing, and the marks they move are pink."

**1e. Added to "What we assume"** (after the light-second line):
"**c** is the speed of light, about 300,000 km every second. A speed written as 0.5c is half of that."
(The existing note beside the speed buttons, "Speeds are given as a fraction of c...", moves to Part 2 with the buttons. Part 1's fixed 0.5c is explained here, before the learner predicts.)

**1f. New line, "Some new words."**
"The "Words and formulas" box below has each one, with a short plain meaning: clock reading, elapsed time, lab, lab time, reference frame, at rest, moving, speed, c, light-second, duration. After you have run the experiment it also shows the name of what you found and its formula."

---

## 2. "Want to know more?" (opens in a new tab)

1. **NASA Science: "Our Milky Way Galaxy: How Big is Space?"** (NASA Science, Exoplanet Exploration Program; published April 2019, updated April 2024; fetched and read 2026-11-08 through a helper). "A short, friendly article on how fast light travels, 186,000 miles (300,000 kilometers) every second, and how far it goes in a minute, a year and more."

**No plain official page found for "light-second" (§29 rule 3(c)).** Searched 2026-11-08 (NASA, ESA and NIST, by name and by "light travels in one second"). The NASA article above explains the light-year and the speed of light, but not the light-second. NASA Glenn's "How 'Fast' is the Speed of Light?" was fetched and read: one paragraph, undated, no light-second, no kilometres, so it is **not linked**. The introduction defines the light-second in its own words, as before.

**No plain official page found for "reference frame" (§29 rule 3(c)).** The gap recorded for Relativity 2 (NASA Goddard's lesson plan, archived, teacher-level, and its last section says time does not flow at the same rate in two frames) still stands; no new search was run for it today beyond that. The introduction defines the term in its own words.

**Considered and not linked: NIST, "Meter"** (fetched and read 2026-11-08 through a helper). It gives the exact value 299,792,458 metres per second and calls light "the fastest speed in the universe", but it is a 2,500-word history of measurement, harder than a first-time learner's page. The owner may still choose to link it (question 3).

**Held back on purpose:** no page on time dilation or moving clocks is linked from the introduction, because it would answer what the learner is about to predict (§12). The tutor's explanation names the effect after the run.

**Flag on the linked NASA page:** its last line jokes, "Did you know time slows down in the presence of gravity?" It is about gravity, not about moving clocks, so it does not give away this experiment's result, but the owner should know it is there.

**No real result, so no paper:** the numbers come from the formula the specification gives, not from a measurement. Real tests of time dilation exist (not used on this page; not proposed here).

---

## 3. "Words and formulas" (collapsed box)

- **Clock reading:** the numbers a clock shows at one moment, written minutes:seconds.tenths. 00:08.7 means 0 minutes and 8.7 seconds.
- **Elapsed time:** how much time passed between two events, according to a clock.
- **Lab:** the place where the experiment is set up, with its clocks standing still.
- **Lab time:** the time shown on the lab's clocks.
- **Reference frame:** a group of people and clocks that are all standing still relative to one another, so that none moves compared with the others.
- **At rest / moving:** standing still, or not standing still, compared with the lab.
- **Speed:** how far something goes in a given time. Here, in light-seconds every second.
- **c:** the speed of light, about 300,000 km every second. 0.5c is half of that.
- **Light-second:** the distance light travels in one second, about 300,000 km.
- **Duration:** how long the lab clock runs, in seconds.
- **Shown only after the Part 1 run (they would give away the answer, §12):**
  - **Time dilation:** the name for a moving clock counting less time than the lab's clock between the same two events.
  - **Time dilation factor:** the moving clock's time divided by the lab clock's time.
  - **Formula:** moving clock's time = lab time × √(1 − v²), with v the speed written as a fraction of c. Worked example from this page: v = 0.5, so v² = 0.25, 1 − v² = 0.75, √0.75 = 0.866, and 10 × 0.866 = 8.660 seconds. The factor is 0.866 and the difference is 10 − 8.660 = 1.340 seconds.

---

## 4. Leads of the four Parts

**Part 1, "Predict, then watch"** (amber): "What we are about to do. First you guess what the moving clock will show when the experiment ends. Then you press START and watch both clocks for 10 seconds, with the moving clock going at 0.5c. When the run finishes, two bars appear that show how much time each clock counted, with your guess drawn on them in white."

**Part 2, "Now try it yourself"** (pink): "What we are about to do. Now you choose a speed and a length of time and run them. What you choose changes the clocks and the drawing in this Part, marked in pink. It does not change Part 1's pictures, the results in Part 3, or your guess."
*Note beside the speed and duration buttons:* "Your guess does not change these drawings, but the speed and the length you choose do."
*Before any Part 2 run:* "Not run yet. Choose a speed and a length and press Run your settings; the drawing for them will appear here."

**Part 3, "The results"** (teal): "What we are about to do. Here are the numbers from the Part 1 run, with your guess listed beside them. Nothing in this Part changes with your guess or with the settings you choose in Part 2."

**Part 4, "The tutor"** (blue): "What we are about to do. Talk through what you saw. The tutor points to your white guess mark, then explains."

---

## 5. The prediction

**Question** (old text had the chosen speed and duration): "The moving clock will go at 0.5c, measured from the lab, and the lab clock will run for 10 seconds. When the experiment ends, what will the moving clock show? Type your guess in seconds." One box, "Your guess for the moving clock (seconds)". Line under it: "Your prediction: N seconds" or "Enter a prediction to continue".
After START: "Your prediction is locked while you try other settings. To change it, press Start over." START stays disabled until a guess is typed. **Start over** is always visible, greyed out until a guess is typed or a run has started, and while a run plays. After the first run, START is replaced by "Run your settings" in Part 2.

---

## 6. Part 1's pictures: the track, the clocks and the two time bars

**The track, relabelled (C1):** "Lab clock" under the blue box at the start; "Moving clock" over the amber box, with its distance ("N light-seconds from the lab clock"); "Track (the moving clock's path)" along the grey line; "Distance travelled so far" on the amber line; "End of run" at the far end. The note stays: "The track is drawn to fit this run: the moving clock reaches the far end when the run finishes."

**The two time bars (new), shown when the run ends:** one scale in seconds from 0 to 20 (twice the lab duration), with ticks and numbers at 0, 10 and 20 s. Two bars, "Lab clock" (blue) on top and "Moving clock" (amber) below, each starting at 0 and ending at that clock's elapsed time, with the number at the end of each bar ("10.000 s" and "8.660 s"). A thin dashed line joins the two bars' starting end ("both started together at 00:00.0"). **The white mark:** a white dot on the moving clock's bar at the guessed number of seconds, joined by a line to a white box "YOUR GUESS: N seconds". A guess beyond the scale (or below 0) is a white arrow at the edge, and the box still says the number and "(off the scale)". The mark appears only when the bars appear (§12).

**"Where the real picture comes from":** "Calculated here, not measured: the distance comes from the speed and the lab time, and each clock's time comes from the formula in the Words box. No instrument measured them and nothing here is imagined. The white mark is only your guess, placed on the same scale."
(One wording note: the Words box shows the formula only after the run, so this line is shown only with the bars too.)

**Caption, "How to read the track and the bars":**
*What you see.*
- **The track** is the moving clock's path. The blue box is the **lab clock**, standing at the start. The amber box is the **moving clock**, sliding away from it. The amber line is the distance it has travelled so far, in light-seconds (one light-second is about 300,000 km). The track is drawn to fit each run, so the moving clock always ends at the far end; read the number, not the length, to know how far it went.
- **The two clocks** above show each clock's reading as minutes:seconds.tenths (00:08.7 is 8.7 seconds). Both count up while the run lasts and stay at their last reading when it ends.
- **The bars** appear when the run ends. They are a time scale: the further right, the more seconds. 0 s is the start, 10 s the length of the run, and 20 s twice that, so there is room to the right of the lab clock's bar. The top bar is how much time the lab clock counted; the bottom bar is how much time the moving clock counted. The dashed line shows that both started together.
- **The white mark and the YOUR GUESS box** are your guess, placed on the same scale. A white arrow at the edge means your guess is beyond the end of the scale. The mark is only your guess; it never moves a bar.

*A worked moment.* At 0.5c for 10 seconds, the moving clock goes 0.5 × 10 = 5 light-seconds. The lab clock's bar ends at 10.000 s. The moving clock's bar ends at 8.660 s, because 10 × 0.866 = 8.660 (the Words box shows where 0.866 comes from). If you had guessed 9, your white mark would sit at 9 s, 0.340 seconds to the right of the end of the moving clock's bar.

*What to look for.* (Each item appears only once what it refers to is drawn.)
1. **Look at** the ends of the two bars. **What it means:** each clock's own count of time between the same two events, the start and the end of the run: 10.000 s for the lab clock and 8.660 s for the moving clock. **Why it matters:** the question of this experiment is whether a clock that moves counts the same time as a clock that stands still.
2. **Look at** the gap between the end of the lab clock's bar and the end of the moving clock's bar. **What it means:** how much more time the lab clock counted: 10.000 − 8.660 = 1.340 seconds. **Why it matters:** it makes the difference visible as a length, not only as a number.
3. **Look at** the white YOUR GUESS mark and the end of the moving clock's bar. **What it means:** the gap between them (if any) is how far your guess was from what the moving clock counted, in seconds. **Why it matters:** it puts what you expected beside what the clock showed.

---

## 7. Part 2's picture: Drawing A

**Drawn:** the track and the two clock readouts for the learner's speed and duration, and the same two bars on a scale from 0 to twice the chosen duration, with **the moving clock's bar and its end number in pink** (the lab clock's bar stays blue). The white guess is **not** redrawn (it was a guess for the 10-second, 0.5c run). A speed of 0c is drawn as two bars of the same length with the moving clock's box staying at the lab clock. Below it, "Runs so far": one line per run, such as "0.8c, 10 s: lab clock 10.000 s, moving clock 6.000 s" and "0c, 10 s: both 10.000 s".

**"Where the real picture comes from":** as in Part 1, with "the speed and length you chose".

**Caption, "How to read Drawing A":** the track, clocks and bars work as in Part 1, for the settings you chose; the scale changes with the length (a 20-second run has a scale to 40 s); pink marks your own settings; "Runs so far" lists every run in this Part. *Worked moment:* 0.8c for 10 seconds: the moving clock goes 8 light-seconds, and counts 10 × 0.6 = 6.000 seconds (the Words box shows √(1 − 0.64) = 0.6), so its pink bar ends at 6 s on a scale to 20 s while the lab bar ends at 10 s. **Look at** the pink bar's end in each run in "Runs so far". **What it means:** how much time the moving clock counted for the speed and length you chose; at 0c it equals the lab clock's, and at higher speeds it is shorter. **Why it matters:** it shows how the difference you saw in Part 1 depends on the speed and on the length of the run. (It names no explanation; the tutor gives that, §12.)

---

## 8. Results (Part 3)

Lines as today (the duration, the speed, the distance travelled, what the lab clock measured, what the moving clock measured, the difference, the time dilation factor, "You guessed" beside "The real time the moving clock measured"), with:
- A small "your guess" tag on the "What the moving clock measured" line and the line "Your guess is drawn on Part 1's bars as the white mark."
- Under the lines, **"What these results tell us"** (what it is, what it means with the real numbers, why it matters; no mechanism):
  - **The two clock lines.** "These are what each clock counted between the start and the end of the run: 10.000 s and 8.660 s. Why it matters: both clocks are ordinary and started together, so the comparison is fair."
  - **The difference line.** "−1.340 seconds means the moving clock counted 1.340 seconds less than the lab clock. Why it matters: this is the size of the effect for this speed and this length; Part 2 lets you see how it changes."
  - **The time dilation factor.** "0.866 means the moving clock counted 0.866 of every lab second: 10 × 0.866 = 8.660. Why it matters: it depends only on the speed (try the same speed with another length in Part 2: the factor does not change). It comes from √(1 − v²), worked in the Words box."
- **"Where this comes from:** calculated here from the speed and the length of the run (see the caption under the bars). Nothing here changes with your guess or with the settings you choose in Part 2."
- "Run Again" is not needed (START moves to Part 2; Start over covers resetting).

No check-up and no setting-following table (the owner's default). Reason, recorded in the specification: the page computes the real value from the same formula a check would use, so a check-up would be circular.

---

## 9. Tutor (Part 4)

Three questions, then the explanation. Changes:
- **Observe:** "Look at the two clocks and at the two bars. What did you notice? Did the moving clock show the same time as the lab clock?"
- **Compare:** "You guessed that the moving clock would read [N] seconds. That is the white mark on the bars. It really read [X] seconds, while the lab clock read [Y] seconds. Were you surprised?"
- **Conceptual:** unchanged ("Why do you think the moving clock measured a different amount of time? What could be different between a clock that is moving and a clock that stands still?"; at 0c: "...Why do you think the two clocks agree? Think back to "Two clocks at rest".").
- **Explanation:** the specification's paragraphs stay as today (the reaction line for a close guess or a guess near the lab clock's reading, the name time dilation, "At 0.5c...", "About the formula", the shrinking-factor "dial", "Your numbers", and the closing paragraph). Then:
  - **Your guess, marked** (no score): "Your guess, [N] seconds, is the same as the moving clock's [X] seconds" or "was [D] seconds more / less than the [X] seconds the moving clock showed, and [E] seconds more / less than the lab clock's [Y]."
  - **1. Why your guess did not change the clocks.** "Whatever you guessed, the moving clock counted its own [X] seconds. Think of two kitchen timers: guessing that one of them will ring early does not make it ring early. A different guess only changes the gap between your white mark and the end of the bar."
  - **2. What the bars show.** "The two bars start together and end at the two clocks' counts, [Y] and [X] seconds. The gap between their ends is the difference you saw in the results. It is not a fault of the moving clock: both clocks counted correctly along their own paths."
  - **3. Try it in Part 2.** "Try the same length at 0c and at 0.8c. At 0c the two bars end together; at 0.8c the gap is larger. Try 20 seconds at 0.5c: the gap doubles, but the factor stays at 0.866."
  - **4. What comes next.** "This experiment measured how big the difference is. It did not say why. In the next chapter, "The light clock", you look inside a clock to find the reason."
  (The specification's sentence "This is a basic fact of relativity: the time that passes between two events depends on who is measuring..." stays as written.)
- **The reaction lines.** Unchanged in wording. The classification (close to the moving clock's reading, close to the lab clock's, or neither; margin: half the size of the effect) moves into the module with tests. **The margin is still flagged in the specification as needing the owner's confirmation; it is not changed here** (question 5). Where the guess is near neither, no reaction line is shown, as today.

---

## 10. Physics module (new, with tests; the approved model is unchanged)

In `movingClockExperiment.ts`:
- `movingClockStripScaleEnd(experiment)` returns twice the lab duration.
- `guessPositionOnBars(experiment, guess)` returns the scale's end, the guess's position as a fraction 0 to 1 (clamped), which edge it is off (`'left'`, `'right'` or none), the guess minus the moving clock's real elapsed time, and the guess minus the lab clock's. It refuses a guess that is not finite.
- `classifyMovingClockGuess(experiment, guess)` returns `'close-to-actual'`, `'close-to-lab'` or `'other'`, using the half-the-effect margin exactly as the tutor does now.
- `timeDilationWorkedNumbers(velocity)` returns `v²`, `1 − v²` and the factor (the square root), the numbers the tutor's "Your numbers" paragraph shows.

Tests (in `movingClockExperiment.test.ts`):
1. The scale ends at twice the lab duration, for 5, 10, 20, 30 and 120 seconds.
2. A guess equal to the lab duration sits at 0.5, 0 at 0, twice the duration at 1.
3. A guess beyond the scale is clamped to 1 and flagged `'right'`; a negative guess is clamped to 0 and flagged `'left'`.
4. The differences are exact: for 10 s at 0.5c, a guess of 9 gives +0.340 from the moving clock's reading and −1 from the lab clock's.
5. The real result is the same for any guess (the function does not alter the experiment).
6. A non-finite guess is refused.
7. Classification matches today's tutor for: a guess equal to the moving reading, a guess equal to the lab reading, a guess far from both, and at 0c (margin 0: a guess of exactly 10 is `'close-to-actual'`).
8. `timeDilationWorkedNumbers(0.5)` gives 0.25, 0.75 and 0.866 (to 3 places); at 0 it gives 0, 1, 1; at 0.8 it gives 0.64, 0.36, 0.6.

---

## 11. Specification changes (only after approval, §28.2)

`03-moving-clock.md`: Learner Controls (Part 1 fixed at 10 s and 0.5c; speed and duration, with the 0c baseline, move to Part 2), Visual Display and Results Display (the relabelled track, the two bars, the guess mark, tags, "What these results tell us"), the Tutor sections (marks the guess, points 1 to 4, classification in the module), the layout (four Parts, Start over, the shared button class), a new "Audit update" section, a source table (one NASA Science page read 2026-11-08; "no plain official page found" for light-second and for reference frame; the NIST "Meter" page considered and not linked; "no real result, no paper"), and the open items (the margin still awaiting the owner; the light-second gap).

---

## 12. Questions for the owner (suggested answers in brackets)

1. **Introduction:** 1a to 1f (the replacement example, what happens, your job, your guess and the real pictures, the definition of c, new words)? [yes]
2. **Link and gaps:** the one NASA Science page and its description, with its closing gravity joke noted; no plain official page found for "light-second" and for "reference frame" (recorded under §29 rule 3(c)); no time-dilation page linked? [yes]
3. **NIST "Meter":** leave it unlinked (harder than a first-time learner's page)? [yes, unlinked]
4. **Words box:** the entries, with the time dilation entries and the formula shown only after the run? [yes]
5. **Tutor margin:** keep the half-the-effect margin unchanged, still flagged as awaiting your confirmation? Or give me a different rule (for example, a fixed margin in seconds)? [keep]
6. **Leads, the note beside the buttons, and the prediction wording:** approve? [yes]
7. **Bars and captions:** two bars on one scale from 0 to twice the lab duration with a dashed line at their start, a white mark on the moving clock's bar with an edge arrow, a pink moving bar in Drawing A without the white mark, "Runs so far", and the captions as drafted? [yes]
8. **Results:** the tag, the "What these results tell us" notes and the "Where this comes from" line, no table? [yes]
9. **Tutor wording:** the new prompts and points 1 to 4 (point 3 suggests trying 0c, 0.8c and 20 seconds)? [yes]
10. **Source reading:** the NASA and NIST pages were read through a helper that reported their content; the agent did not read them itself. Accept? [accept; flagged in the specification]

---

## Addendum, 2026-11-08 (after the build): "What is a light clock?"
The owner asked for the introduction to say what a light clock is ("what is a 'light clock'. explain") and approved the drafted paragraph with "all defaults". Added to the introduction before "How this differs from 'The light clock'", which was reworded to say "using ordinary clocks" and "you build one of these clocks, set it moving, and follow the light inside it to find the reason". The Words box gains "Light clock" and "Tick" (shown from the start; neither gives away the result), and "Some new words" names them. The 15 cm example (15 + 15 = 30 cm per tick; light covers 30 cm in about a billionth of a second) is Claude's own arithmetic, not in Experiment 4's specification. Still to do when the specification is updated (§28.2): record this paragraph.

## Addendum 2, 2026-11-08: "What's really being tested" and "What happens" expanded
The owner asked for both paragraphs to be more explanatory and approved the drafts with "all defaults" (so the last sentence of the first, "Neither clock is broken or built differently, so if the two counts differ, the clocks cannot be the reason", stays). "What's really being tested" is now four short paragraphs: the question, what an event and elapsed time are, the everyday assumption with the train example, and the "neither clock is broken" line. "What happens" now has a steady-speed comparison (a car with its speed held constant), four numbered steps (Start, Run, End, Compare) and the size of 0.5c. The Words box gains "Event" ("one moment at one place"). The everyday numbers are Claude's own arithmetic, not in the specification: 0.5c = 0.5 × 300,000 = 150,000 km/s; an airliner at about 900 km/h is 0.25 km/s; 150,000 ÷ 0.25 = 600,000. To record in the specification when it is updated (§28.2).
