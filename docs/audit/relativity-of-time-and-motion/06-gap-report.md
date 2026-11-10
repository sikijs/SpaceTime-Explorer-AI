# Gap report: Relativity of Time and Motion Experiment 6 (Does Motion Change Length?)
Date: 2026-11-02 | Specification: docs/experiments/relativity-of-time-and-motion/06-length-contraction.md | Components: src/components/Experiment6.tsx, Experiment6Tutor.tsx | Physics module: src/physics/lengthContractionExperiment.ts (+ test, about 25 cases; reuses lightClockExperiment.ts) | Status: read-only, nothing changed

## Summary
Three light-clock panels along the direction of motion: a rest clock, a moving clock with its mirrors "as far apart as at rest" (a hypothetical) and a moving clock with the mirrors "closer together". The prediction has two parts (a choice and a distance in light-seconds), and the distance is a natural thing to draw as a white pair of mirror marks. This is the one experiment of the six with a real multi-sentence caption (`clocksCaption`, :335, shown :590-592), but it is a single paragraph with no look-for items and no worked moment. Older rule: no guess marks, no "Where the real picture comes from", no reading guide. Size: **L**.

## Predictions found (A0)
| # | Question | Answers | Where the answer lives on a picture |
|---|---|---|---|
| 1a | Must the mirrors be as far apart, closer or farther (Experiment6.tsx:490-505) | Three buttons; `predictionChoice` (:267) | The mirror spacing in the two moving panels. A choice with no size of its own: marker only |
| 1b | How far apart, in light-seconds (:506-521) | Number; `predictionInput` (:268) | The gap between the back and front mirrors in a moving panel; it can be drawn to scale (mirror positions are on the panels' light-second scale, :123) |

## Rule A
| Item | Result | Evidence | Gap and what would be needed |
|---|---|---|---|
| A1 | Met | `runLengthContractionExperiment(selectedVelocity)` (:288, :299); prediction not read | None |
| A2 | Not met | Guess is text only (:640-646: "You guessed that the two mirrors must be ...") | White "YOUR GUESS" mirror pair at the guessed gap, with a box and a line |
| A3 | Not met | None | Number gives a gap; the choice is a marker only (caption would say so) |
| A4 | N/A | No mark. Note: the panels draw the geometry before START (:288, :555-593) | The mark would be drawn once the mirrors' real positions are drawn |
| A5 | Met in principle | The mirror gap is already on the panels (scale shared, :94-96) | Mark can go on the existing panels |
| A6 | Not met | No line | Needs: calculated here; the "as far apart as at rest" clock is imagined and is not what happens (the tutor says so, Experiment6Tutor.tsx:181-182) |
| A7 | Not met | Intro (:350-426) has no statement; speed note (:432-436) explains units and the 0.9c cap | Add intro sentence and note |
| A8 | Not met | Module exports REST_LENGTH, run and state functions (lengthContractionExperiment.ts:12-125) | Tested function for the guess mark's position and the gap to the real length |
| A9 | Partly met | Compare prompt gives the guess and both real lengths (Experiment6Tutor.tsx:80); the explanation (:122-186) does not mark the guess | Prompts would name the mark |
| A10 | Not met as such | "A wrong guess is fine. Guesses are not scored." (:400-401) | Current state |

## Rule B
| Item | Result | Evidence | Gap |
|---|---|---|---|
| B0 | | Results lists: speed, time-dilation tick, rest clock, two version blocks, the guess (:611-660). No tables | |
| B1 | Partly met | Same-physics reference: "Difference from the tick that time dilation gives" row already exists (:251-254) for each version; a "found equals expected" reading could be added. No measured value in the spec | Owner decides |
| B2 | Not met | No notes (values only by design, :229) | Notes on the difference row and the ratio row |
| B3 | Optional | Speed control | Owner's choice |
| B4 | Partly met | Guess lines beside real lengths, no tags | Tags |
| B5 | Partly met | Numbers from module | Covered by A8 |

## Rule C
| Item | Result | Evidence | Gap |
|---|---|---|---|
| C1 | Partly met | On the canvas: "start" (:176-187) and "front mirror when the pulse hit it" (:200). Back and front mirrors, the pulse, its path and the two heights of the legs are unlabelled; titles are HTML (:154, :569, :580) | Label on the canvas |
| C2 | Met | The two moving panels differ in mirror spacing at a shared scale (:94-96, :568-589) | Both moving panels use the same colours, and the hypothetical one is not marked "imagined" |
| C3 | Partly met | A paragraph caption under all three panels (:335, :590-592) | Detailed caption incomplete |
| C4 | Partly met | The caption names the rest and moving clocks, dashed lines, the faint turn mark and the offset legs; it does not define lab seconds, light-seconds, "c" or say what the yellow dot, the line and the black bars are, and is one dense paragraph | Short sections, bullets |
| C5 | Not met | No worked moment | Needed (for example 0.6c: gap 0.4 light-seconds) |
| C6 | Not met | No look-for items | Three-part items needed |
| C7 | Partly met | Before START the learner already sees the "closer together" panel's mirrors drawn nearer than the rest clock's (preview at :288, :555-593; the spec records the label hint as kept by the owner, 06-length-contraction.md:329-331) | Report only: part of Prediction 1 is visible before the guess; the owner decides |
| C8 | Met | Tick, light-second, lab time, time dilation defined or recalled before use (:365-387, :410-413) | |

## Rule D
Not applicable.

## Other findings
- O1: The spec records that wording approval was "blanket approval, no fresh read-through" (06-length-contraction.md:333). Not a conflict; noted because §28.1 says line-by-line.
- O2: The speed range is capped at 0.9c here while Experiments 3 to 5 allow 0.99c (:19-22), explained in a comment and the spec. At 0.01c the two ticks agree to three decimals (spec :331). Hardcoded button colours as in Experiments 3 to 5. The "front mirror when the pulse hit it" mark is a good example of labelling an element on the canvas.

## What an update would touch, and its size (O3, O4)
Experiment6.tsx (white mirror-pair mark, labels, caption rewrite, imagined colouring, intro, notes), Experiment6Tutor.tsx, lengthContractionExperiment.ts and test, the specification. Size: **Large**.

## Not checked
Browser appearance, narrow widths (the spec notes drawings shrink to about 213 by 33 px), dark mode. Code and text read only.

---

# Re-read, 2026-11-09: Rule E and the owner's rules of 2026-11-02 to 2026-11-09
Read-only. Re-read of `Experiment6.tsx` (674 lines), `Experiment6Tutor.tsx` (190 lines), `lengthContractionExperiment.ts` (about 160 lines, 25 tests) and the specification `06-length-contraction.md`. Nothing changed. Rules A to C above stand; this section adds Rule E and the rules set while Relativity 1 to 5 were audited, so the owner's earlier answers carry over (`03-`, `04-` and `05-draft-wording.md`). Experiment 6 differs from Experiment 5 in these ways: the **answer to the number guess changes with the speed** (so Part 1 must fix the speed, as Relativity 3 to 5 did), the guesses are about a **distance** (the gap between the mirrors), not a time, and the **"same length" clock is the one that is wrong** (a "what if", like Experiment 5's everyday rule), while the "closer together" clock is the one time dilation requires.

## Rule E: the page in four Parts
| Item | Result | Evidence | Gap and what would be needed |
|---|---|---|---|
| E1 | Not met | One grey card, one column: introduction, speed buttons, the prediction (a choice and a number), START, the three clocks (under START), then Results and the tutor after the run (`Experiment6.tsx:341-670`) | Part 1 (the guesses, START, the three clocks, a new strip of mirror gaps), Part 2 (the speed and Drawing A), Part 3 (results), Part 4 (tutor) |
| E2, E4 | Not met | No Part headings or leads | Four leads in the shared colours. Part 1's lead must not say which clock is right |
| E3 | Partly met | The introduction and its assumptions sit above the controls; no links list, no words box | See "Links" and "Words" below |

## Parts 2 to 4 appear after the first Run (2026-11-07 rule)
Results and tutor already render only when `status === 'complete'` (`:601`, `:658`). **Not met for the control:** the speed buttons (`:428-477`) sit above START all the time. Moving them into Part 2 means Part 2 appears after the first Run with a "Not run yet" note. One run is enough here (all three clocks in one run), so no "run both to compare" note is needed.

## The speed has to leave the prediction (the new problem here)
The prediction text quotes the tick that time dilation gives for the **selected** speed (`:483-489`), and the right answer to the number guess depends on that speed (0.433 light-seconds at 0.5c, 0.300 at 0.8c). Today the learner can choose a speed, guess, run, then choose another speed and guess again, so a changed guess can sit beside results from another speed. **Recommend, as in Relativity 3 to 5:** Part 1 fixed at 0.5c (the page's current default), the speed (0.1c, 0.3c, 0.5c, 0.8c, "Other") in Part 2 opening at 0.8c, the prediction text written for 0.5c (time dilation tick 1.155 s). **Needs the owner's decision** (the specification's Learner Controls line lists the speed on the page).

## Links and Words (2026-11-07 rule)
- **"Want to know more?": Not met.** None exists. Background ideas the introduction explains: a light clock and its tick, the light-second, the speed of light and the "c" note, time dilation (stated as the rule we keep), reference frame and lab time, and a car measured while moving and parked. **Not searched or read yet** (the search and fetch belong to the draft step). Carried over from Relativity 3 to 5, to be fetched again before approval: NASA Science, "How Big is Space?" (speed of light) and the NASA reference-frame page.
- **A difference from Experiments 3 to 5: the answer is a page about length contraction.** The introduction does not use the term "length contraction" before the observation (specification, Introductory text). A plain page that says moving objects get shorter would give away the guess, so **any such page is held back until after the tutor's explanation**, as in Relativity 5. Plain pages on time dilation are safe from the start.
- **Real results.** The page uses none (every number comes from the geometry in the specification), so there is no paper for a result. **Real-world evidence is out of scope** (specification, Decision 10, "unless approved"). **Needs the owner's decision:** link the 1905 paper as the origin of length contraction (no claim of evidence) after the explanation, or record a gap under §29 rule 3(c). Default: record a gap.
- **"Words and formulas": Not met.** None exists. Terms: light clock, tick, mirror, pulse, light-second, c, lab, reference frame, lab seconds, lab time, at rest and moving, along its own length, "length seen from the lab", time dilation, time dilation factor, own clock reading, "front mirror when the pulse hit it". **Formula on the page:** each leg takes "distance ÷ speed" (the tutor's worked numbers use it, `Experiment6Tutor.tsx:127-168`). **Withhold** the length formula (rest length × √(1 − v²/c²)) and the leg formulas L ÷ (c − v) and L ÷ (c + v) until after the run, because they give the guess away. **Recommend** one entry, "Formula, distance = speed × time" (or time = distance ÷ speed), with an example from the page's own numbers (light covers 0.5 light-second in 0.5 s), and no square-root formula. **Needs the owner's decision.**

## Start over, not Change prediction (2026-11-07 rule)
**Not met.** There is no "Start over" and no "Change prediction". `handleStart` clears the two guess inputs (`:296-297`) so the learner can pick another speed and guess again. Needed: an always-visible "Start over", greyed until there is a guess or a run and while a run plays; a line saying the guess is locked after START; the first START in Part 1, later runs in Part 2 ("Run your speed", no new guess).

## Rule A to C: what the re-read sharpens
- **Two guesses, two kinds of mark.** The number (the gap in light-seconds) is a size, so it gets a **white mark with a YOUR GUESS box**. The choice (as far apart, closer together or farther apart) has no size, so it gets **a white marker only**, and the caption says so.
- **Where the number lives (A5).** The panels already draw the mirrors to scale, but the quantity guessed, the gap between the two mirrors, has no readable scale or bar of its own, and the real "closer together" gap (0.433) is already visible before the guess (C7). **Recommend, as in Relativity 5:** a strip of **three mirror-gap bars on one scale** under the three clocks (0 to 1 light-second): "Rest clock, mirrors apart" (0.500), "IMAGINED: mirrors as far apart as at rest" (0.500) and "Mirrors closer together" (0.433 at 0.5c), with the white mark on the guessed gap, an edge arrow for a guess beyond the scale, and the choice marker beside the two moving bars. The strip appears when the run ends. **Needs the owner's decision** (the alternative is white mirror marks on the start line of the two moving panels, which avoids a new strip but shows three marks on three separate pictures).
- **The "imagined" clock needs its own colour and name** (CLAUDE.md §14). The "as far apart as at rest" clock is the what-if (the tutor says it cannot be right, `Experiment6Tutor.tsx:143-154`), but today both moving panels use the same colours and the same caption (`:568-589`). Needed: a different colour for it (violet, as in Relativity 5), "imagined" in its title and on its bar, and a "Where the real picture comes from" line: the three clocks are calculated here from the geometry, and the clock with mirrors as far apart as at rest is imagined for the question. The owner kept the panel names (spec Decision 3, 2026-10-13); the names stay, with "imagined" added.
- **The two moving clocks end at different times.** The run lasts until the slower clock has finished (`:308-309`): at 0.5c the imagined clock takes 1.333 s and the other 1.155 s. The bars of tick length are not asked for here (the guess is a distance), but the caption must say that the imagined clock keeps going after the other has stopped.
- **C1, labels on the canvas.** Only "start" (`:176-187`) and "front mirror when the pulse hit it" (`:200`) are drawn on the canvas. Needed: "Back mirror", "Front mirror", "Light pulse", "Path of the light, forward leg / return leg", "Where the mirrors started", and each clock's title and rule inside the picture. The drawings shrink at narrow widths (about 213 by 33 px, specification), so labels must still fit.
- **C3 to C6, captions.** One full caption for the three clocks and one for the mirror-gap strip, each with sections, the units explained (light-seconds, lab seconds, c), what appears when, a worked moment from the module (at 0.5c: forward leg 0.500 ÷ 0.5 = 1.000 s and return leg 0.500 ÷ 1.5 = 0.333 s, 1.333 s in all, against the 1.155 s time dilation gives) and three-part look-fors. The current single paragraph (`:335`) becomes part of the first. **Wording point:** the captions must not say that the mirrors "contract"; the observation comes first (§12).
- **C7, the answer is partly visible before the guess.** Report only, unchanged: with the panel names the owner kept, the "closer together" panel's mirrors are already drawn nearer than the rest clock's before START. **No action unless the owner decides otherwise.**
- **A8, the module.** It has no function for the guess: its position on the strip, its distance from the real gap, the choice marker and the tutor's marking. These are added with tests (§9). The tutor's numbers (`:127-168`) already come from the module; the "1 second" at `:151` is the rest tick and should come from the module too.
- **A9, the tutor.** The compare prompt quotes the choice and the number beside the two real gaps (`Experiment6Tutor.tsx:80`) but not the marks; the explanation never says how the guess compared. The tutor would name the white marks and say where the guess lies compared with the real gap (more, less or the same, no score, as in Relativity 4 and 5); for the choice, which it was and what the learner chose, **without "right" or "wrong"** (§12, §13). **Needs the owner's confirmation.**
- **Old chapter numbers in wording.** The introduction says "Experiment 4" (`:352`), "Experiments 3 and 4" (`:381`), "Experiments 4 and 5" (`:385`) and "Experiment 2" (`:411`); the results and tutor say "Experiments 3 and 4" (`:621`, `Experiment6Tutor.tsx:169`) and "Experiments 4 and 5" (`:177`). **Recommend** the chapters' titles ("A moving clock", "Why time dilation happens", "Why can't light go faster?", "Two clocks at rest").
- **A10, the introduction's statement.** "A wrong guess is fine. Guesses are not scored." (`:400-401`) stays. Add: the predictions never change the pictures or tables, the guesses are drawn on the strip in white and shown again beside the results, and the speed (Part 2) changes the drawings.
- **B1 to B3.** The page computes everything from the same geometry a check would use, so a check-up would be circular, and the control only moves marks and numbers. **Recommend no check-up and no setting-following table.** Keep the results lines, add guess tags (B4, guess only) on the gap lines, and add a short note under each results block (the gap, the two legs, the tick: what each is, what it means with the real numbers, why it matters), without the mechanism (the tutor's). **Needs the owner's decision.** One reference does exist, "the tick that time dilation gives", and the page already shows each clock's difference from it (`:251-254`); a plain "the same" or "longer" reading on that row is allowed if the owner wants it.
- **The run's animation guard.** Present already (`progress` clamped at 0, `:317`), so the blank-page bug found in Relativity 3 does not apply.
- **Page width and buttons.** The outer width is already 900 px. The page uses inline colours (`#f9f9f9` card, `#28a745` START, `optionButtonStyle`) instead of the shared `exp-card`, `toggle-button` and `action-button` classes. **Recommend** the shared classes, as for Relativity 3 to 5.
- **Speed cap.** The page caps the custom speed at 0.9c (`MAX_SPEED`), where Relativity 3 to 5 allow 0.99c, because the imagined clock's tick grows as 1 ÷ (1 − v²) (about 50 s at 0.99c; specification, Decision 5). **Recommend keeping the cap** and saying why in Part 2's note.
- **Out of scope here, but noticed.** `src/App.tsx` summaries may carry old numbers ("Experiment 4"); the specification's chapter-summary note may be out of date. Reported only; not changed.

## Updated size
**Large** (unchanged): the Parts layout; labels on the canvas for three clocks; a mirror-gap strip with a white mark, an edge arrow and a choice marker; the imagined colour and "Where the real picture comes from"; Drawing A for Part 2 with "Runs so far"; two captions; words box; links (search and fetch, with the length-contraction pages held back); Start over; the tutor's marking; the specification update; and tested module functions. Files: `Experiment6.tsx`, `Experiment6Tutor.tsx`, `lengthContractionExperiment.ts` and its test, the specification, a new draft-wording file and a new pictures file.

## Questions for the owner before drafting (suggested defaults follow the answers given for Relativity 1 to 5)
1. **Gaps:** fix all of the above? Default: yes, all.
2. **Settings:** Part 1 fixed at 0.5c; the speed (0.1c, 0.3c, 0.5c, 0.8c, "Other" 0.01c to 0.9c) moves to Part 2, which opens at 0.8c? Default: yes.
3. **Where the number guess is drawn:** a strip of three mirror-gap bars (0 to 1 light-second) under the three clocks, with the white mark and an edge arrow, appearing when the run ends? Default: yes. (Alternative: white mirror marks on the two moving panels.)
4. **The choice marker:** a white marker tag beside the two moving bars, joined by a line to the bar it names (for "farther apart", an arrow past the end of the rest bar), and the caption says it is only a marker? Default: yes.
5. **Imagined clock:** the "mirrors as far apart as at rest" clock and bar in violet, labelled "imagined" on the canvas, names kept, with a "Where the real picture comes from" line? Default: yes.
6. **Part 2 drawing:** the three clocks and gap bars for the learner's speed, no white marks, the speed in pink, "Runs so far"? Default: yes.
7. **Tutor marking:** the explanation marks each guess with no score (more, less or the same as the real gap; for the choice, which it was and what the learner chose, no "right" or "wrong"), and the rest tick moves into the module? Default: yes.
8. **Introduction:** keep the specification's order and the statement of the time dilation rule before the prediction; use the chapters' titles; add the statement about predictions and the controls; and simplify it as was done for Relativity 5? Default: yes.
9. **Reading guide:** no check-up or setting-following table; guess tags on the gap lines and a note under each results block? Default: yes.
10. **Links:** search for plain official pages on time dilation, the speed of light and reference frames (reuse the NASA pages), hold back any length-contraction page until after the tutor, and **for the 1905 paper, link it after the explanation or record a gap?** Default: record a gap.
11. **Words box:** the terms above and one formula entry ("distance = speed × time", worked from the page's numbers), with the length and leg formulas withheld? Default: yes.
12. **Buttons and card:** switch to the shared classes? Default: yes.
13. **Size:** accept Large? Default: yes.

## Not checked (re-read)
The page was not run in a browser; narrow widths and the stacked wide layout were not looked at; no source page was searched or fetched for the links list. The numbers quoted (0.433 and 0.300 light-seconds, 1.333 s and 1.155 s at 0.5c) come from the module's formulas by hand, not from running the page.
