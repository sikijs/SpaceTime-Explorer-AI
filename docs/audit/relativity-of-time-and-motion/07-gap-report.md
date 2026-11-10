# Gap report: Relativity of Time and Motion Experiment 7 (At the Same Time... For Whom?)
Date: 2026-11-02 | Specification: docs/experiments/relativity-of-time-and-motion/07-relativity-of-simultaneity.md | Components: src/components/Experiment7.tsx, Experiment7Tutor.tsx | Physics module: src/physics/relativityOfSimultaneityExperiment.ts (+ .test.ts, 13 tests) | Status: read-only, nothing changed

## Summary
Two-panel animation (rod's own view, lab's view) of a flash from a rod's centre, with two predictions, a plain results list and a 3-step tutor. It follows the older prediction rule. Biggest gaps: no guess marks, no reading guide or check-up, a one-paragraph caption with no worked moment or three-part "what to look for", and panels with no on-canvas labels. Size: **Medium** (marks on two panels need new module helpers; caption and results guide are wording work).

## Predictions found (A0)
| # | Question | Answers | Where the answer lives on a picture |
|---|---|---|---|
| 1 | Does the flash reach both ends of the moving rod at the same time in the lab, or which end first? (Experiment7.tsx:355-369) | same / back first / front first; state `predictionOrder` then `submittedOrder` (:144,:146) | Lab panel: the two end-events (back/front dots, "reached" times) |
| 2 | Does the rod's own view agree or disagree with the lab? (:370-386) | agree / disagree; `predictionAgreement` (:145) | No size or position; would be a yes/no marker between the two panels |

## Rule A
| Item | Result | Evidence | Gap and what would be needed |
|---|---|---|---|
| A0 | Met (listed) | above | |
| A1 | Met | Real values come only from `runSimultaneityExperiment(selectedVelocity)` (:165,:175); prediction state is read only in the text and tutor (:388-392,:490-498) | none |
| A2 | Not met | No white mark or "YOUR GUESS" box anywhere in `SimultaneityPanel` (:82-134) | Mark 1: white marker on the lab panel at the guessed end (or across both ends for "same time"). Mark 2: yes/no marker. |
| A3 | Not met | n/a, no mark | Mark 1 follows the guess; Mark 2 is a marker, caption must say so |
| A4 | Not met | n/a | Marks must appear only after the run reaches the end-events |
| A5 | N/A | Both answers have a picture (lab panel; Mark 2 a marker only) | |
| A6 | Not met | No "Where the real picture comes from" line; caption at :435-439 only describes the dashes and dots | Add a line: calculated here from Experiment 5's light speed and Experiment 6's contracted length; nothing measured |
| A7 | Not met | Intro (:258-263) says only "Guesses are not scored." No statement about white marks or results; no controls note for the speed buttons (:287-342) | New intro sentence and a note beside the speed control |
| A8 | Not met | Module has event times and view states only. Missing: a function turning a guess into a mark position (guessed end's event time or marker x), with tests | Add to module + tests |
| A9 | Partly met | Tutor compare step names the guess and states the actual result (Experiment7Tutor.tsx:72-73) before the explanation, so the guess is marked before the explanation step; no mention of marks | Under the new rule the marking belongs in the explanation only; prompts should point to the marks |
| A10 | Met (older rule) | "Guesses are not scored." (Experiment7.tsx:262). It does NOT say that predictions never change the pictures or tables | Older rule's required sentence ("predictions do not change the pictures or tables") is not worded; only "not scored" |

## Rule B
- B0: Results block (:448-502): rod speed, lab length vs rest length, "In the lab's frame" (two event times, gap), "In the rod's own frame" (one time), "Your prediction" (guess then actual order and gap).
- B1: Not met. A real reference: the event times follow (L/2)/(c±v) (spec Physics Model; test at relativityOfSimultaneityExperiment.test.ts:27) and the rod-frame time equals Experiment 11's Lorentz result (lorentzTransform.test.ts:35). No external published value exists (a thought experiment); owner decides whether a check-up applies.
- B2: Not met. No "What this table tells us" notes.
- B3: N/A (picture shows the speed effect directly; no reference table).
- B4: Partly met. Guess shown as text beside the actual result (:488-499), with the actual result next to it, and no tag on a table row.
- B5: Not met. No comparison functions in the module.

## Rule C
- C1: Not met. Panels (:97-133) have a text title and coloured "Back end / Front end" text beside the canvas but nothing drawn on the canvas is labelled (mirror lines, amber/green pulse dots, dashed centre line).
- C2: Met. Back (blue) and front (purple) mirrors are different colours (:70-71) and the speed changes the drawing.
- C3: Partly met. One short paragraph under both panels (:435-439); no "How to read this diagram" heading.
- C4: Not met. Does not name the two pictures, explain the amber vs green dot, the coloured bars, or what a change in speed does; not bulleted.
- C5: Not met. No worked moment with numbers.
- C6: Not met. No "what to look for" list.
- C7: Met. Caption says nothing about the answer.
- C8: Partly met. "Light-second" is used (:349, results :465) but defined only in Experiments 4 to 6 (Experiment4.tsx:493, 5:595, 6:367), not here; "reference frame" is used in the assumptions (:281) and defined earlier (Experiment 2). "Simultaneity" is defined (:265).

## Other findings
- O1: Specification and CLAUDE.md agree (complete, wording approved). The spec's Success Criterion 6 and "not introduced" list hold.
- O2: One counter "Time: x s" (:416) drives both panels, although they are two frames' clocks (lab seconds vs rod seconds); labels do not say which time it is. Light-second not redefined here (see C8).

## What an update would touch, and its size (O3, O4)
Experiment7.tsx, Experiment7Tutor.tsx, relativityOfSimultaneityExperiment.ts and .test.ts (mark and comparison functions), the specification. Size: **Medium**.

## Not checked
Browser rendering, narrow widths, the animation itself (code read only); external sources for the physics (it is a standard textbook result; spec makes no source claims); whether the tutor's wording was approved line by line (taken from CLAUDE.md).

---

# Re-read, 2026-11-10: Rule E and the owner's rules of 2026-11-02 to 2026-11-09
Read-only. Re-read of `Experiment7.tsx` (515 lines), `Experiment7Tutor.tsx` (161 lines), `relativityOfSimultaneityExperiment.ts` (101 lines, 14 tests) and the specification `07-relativity-of-simultaneity.md`. Nothing changed. Rules A to C above stand; this section adds Rule E and the rules set while Relativity 1 to 6 were audited, so the owner's earlier answers carry over (`03-` to `06-draft-wording.md`). Relativity 7 differs from Relativity 6 in these ways: **both guesses are choices** (an order, and agree or disagree), so neither has a size and both get a **marker only**; the answer to the order guess does not change with the speed (back end first for every speed above 0), but **0c is one of the speed buttons and flips it**; and the **introduction already gives both answers away** (see "A reveal before the guess").

## Rule E: the page in four Parts
| Item | Result | Evidence | Gap and what would be needed |
|---|---|---|---|
| E1 | Not met | One grey card, one column: introduction, speed buttons, the two guesses, START, the two panels, then Results and the tutor after the run (`Experiment7.tsx:216-512`) | Part 1 (the two guesses, START, the two panels, a new strip of event times), Part 2 (the speed, with 0c as the baseline, and Drawing A), Part 3 (results), Part 4 (tutor) |
| E2, E4 | Not met | No Part headings or leads | Four leads in the shared colours. Part 1's lead must not say which end is reached first or whether the views agree |
| E3 | Partly met | Introduction and assumptions sit above the controls (`:229-285`); no links list, no words box | See "Links" and "Words" below |

## Parts 2 to 4 appear after the first Run (2026-11-07 rule)
Results and tutor already render only when `status === 'complete'` (`:448`, `:504`). **Not met for the control:** the speed buttons (`:287-342`) sit above the guesses all the time. Moving them into Part 2 means Part 2 appears after the first Run with a "Not run yet" note. One run is enough here (both panels in one run), so no "run both to compare" note is needed. The 0c baseline is a Part 2 run.

## The speed has to leave the prediction
The guess text is built from the selected speed (`:351`, "Now the rod moves at {speedLabel}") and the answer to the order guess depends on it in one case: at **0c** both ends are reached together (`actualOrderFor`, `Experiment7Tutor.tsx:16-18`). Today the learner can choose 0c, guess, run, then choose another speed and guess again, so a changed guess can sit beside results from another speed. **Recommend, as in Relativity 3 to 6:** Part 1 fixed at 0.5c (the specification's worked example), the speeds (0c baseline, 0.1c, 0.3c, 0.5c, 0.8c, "Other" 0.01c to 0.9c) in Part 2 opening at 0.8c, and the guess text written for 0.5c. **Needs the owner's decision** (the specification's Learner Controls line lists the speed on the page).

## A bug found: the tutor says something false at 0c
`Experiment7Tutor.tsx` says in its conceptual step "The lab's clocks say it arrived at the back end first" (`:75`) and in its explanation "the flash reaches the back end sooner" (`:126-130`) for **every** run, including the 0c baseline, where both ends are reached at the same moment (gap 0.000 s). Only the compare step is correct there (it uses `actualOrderFor`). Fixed by the Part 1 change above (the tutor then only ever sees 0.5c), and the tutor's conceptual and explanation wording would also be tested at 0c in the module. **Not a physics error:** the numbers come from the module and are right at 0c.

## A reveal before the guess (§12)
The introduction says "Someone riding along with the rod sees the flash reach both ends together. The lab sees something different." (`:245-247`). That states the answer to the second guess (the views disagree) and half of the first (the lab does not see "at the same time") before the learner has guessed. **Recommend** replacing it with a neutral line that says what will be asked ("We ask two things: when the lab's clocks say the flash reached each end, and whether someone riding with the rod would agree"). The wording was approved earlier, so **this needs the owner's decision.** The daily-life paragraph (the platform and the train, `:234-241`) poses a question and does not answer it; it can stay. The expected-observation sentences in the specification stay with the tutor.

## Links and Words (2026-11-07 rule)
- **"Want to know more?": Not met.** None exists. Background ideas the introduction explains: simultaneity and relativity of simultaneity, the reference frame and the lab's clocks (Relativity 2), the speed of light and the "c" note, a flash of light and a rod's centre, and the moving train and platform picture. **Not searched or read yet** (the search and fetch belong to the draft step). Carried over from earlier drafts, to be fetched again before approval: NASA Science, "How Big is Space?" (speed of light) and the NASA reference-frame page.
- **A difference from Experiments 3 to 6: the plain pages are the answer.** A plain page on the relativity of simultaneity says that two events can be simultaneous in one frame and not in another, which is exactly the two guesses. **Any such page is held back until after the tutor's explanation**, as the length-contraction pages were in Relativity 6. Pages on the speed of light and on reference frames are safe from the start.
- **Real results.** The page uses none (a thought experiment; every number comes from the geometry in the specification), so there is no paper for a result, and real-world evidence is out of scope (specification, Decision 6). **Needs the owner's decision:** link Einstein's 1905 paper (where the idea of simultaneity is set out) after the explanation, with no claim of evidence, or record a gap under §29 rule 3(c). Default: record a gap, as for Relativity 6.
- **"Words and formulas": Not met.** None exists. Terms: simultaneity, relativity of simultaneity, event, flash, rod, centre of the rod, back end, front end, light-second, c, lab, lab clocks, rod's own clocks, reference frame, point of view, lab time, the rod's own time, at rest, moving, along its own length, "length seen from the lab", rest length, "as measured by the lab's clocks". **Formula on the page:** each arrival time is "distance ÷ speed". **Withhold** the arrival-time formulas (half the length ÷ (c + v) and ÷ (c − v)) until after the run, because they give the order guess away. **Recommend** one entry, "Formula, time = distance ÷ speed", with an example that does not involve the moving rod (light covers 0.25 light-second in 0.25 s). **Needs the owner's decision.**

## Start over, not Change prediction (2026-11-07 rule)
**Not met.** There is no "Start over" and no "Change prediction". `handleStart` clears the two guesses (`:172-173`), so the learner can pick another speed and guess again. Needed: an always-visible "Start over", greyed until there is a guess or a run and while a run plays; a line saying the guesses are locked after START; the first START in Part 1, later runs in Part 2 ("Run your speed", no new guess).

## Rule A to C: what the re-read sharpens
- **Two guesses, two markers, no white size mark.** Neither guess has a size. Both get a **white marker with a YOUR GUESS box joined by a line**, and the caption says each is only a marker. The order guess has three values (at the same time, back end first, front end first); the agreement guess has two.
- **Where the order guess lives (A5).** The order of the two arrivals has no readable picture today: the panels show moving dots and "Back end reached: 0.144 s" text beside the canvas (`:101-108`), so the **two times are not drawn side by side anywhere.** **Recommend, as in Relativity 5 and 6:** a strip under the two panels, on a dark background (the page is white and white marks need a dark ground), that draws **when each end was reached on one time axis**: a "Lab" row (back end at 0.144 s, front end at 0.433 s at 0.5c) and a "Rod's own view" row (both ends at 0.250 s), appearing when the run ends. The order marker sits on the lab row (a white tag at the earlier end, at the later end, or a white bracket joining both ends for "at the same time"), and the agreement marker sits between the two rows, joined to both. **Needs the owner's decision** (the alternative is white marks on the two panels' end dots, which avoids a new strip but spreads two marks over two small pictures).
- **C1, labels on the canvas.** Nothing drawn is labelled: the back and front mirrors (blue, purple), the dashed release line, the two flash dots (amber, then green) and each panel's title are HTML beside the canvas or missing (`:97-134`). Needed: "Back end", "Front end", "Flash released here", "Flash", "Reached", and each panel's title inside the picture. The pictures are 720 × 92 and shrink on narrow screens, so labels must fit.
- **C3 to C6, captions.** One full caption for the two panels and one for the strip, each with sections; units (light-seconds, seconds, c); what appears when; a worked moment from the module (at 0.5c: lab length 0.433, half 0.2165; back end 0.2165 ÷ 1.5 = 0.144 s, front end 0.2165 ÷ 0.5 = 0.433 s; gap 0.289 s; rod's own view 0.25 ÷ 1 = 0.250 s); and three-part look-fors. The current single paragraph (`:435-439`) becomes part of the first. **Wording point:** the captions must not say that the views "disagree" or that one end is reached "first" before the learner has seen it (§12). They say what is drawn and what to read off.
- **The playback counter mixes two frames.** One "Time: x s" (`:416`) drives both panels, though the lab panel runs in lab seconds and the rod panel in the rod's own seconds, and the two are not the same time except at the flash. At 0.5c the rod panel finishes at 0.250 s and the lab panel's back end at 0.144 s on the same counter, which could be read as "the rod's arrival came later". **Recommend** keeping the single counter, **renaming it "Playback time"** and saying in the caption that each panel's own times are in its readouts (the real times) and that the counter only runs the pictures. **Needs the owner's decision;** the other option is a separate counter under each picture.
- **C8, a term used and not defined here.** "Light-second" appears (`:349`, results `:465`) and is defined only in Relativity 4 to 6. Define it here, at first use (CLAUDE.md §15).
- **A6, "Where the real picture comes from".** Needs: calculated here from the flash's speed c (Relativity 5) and the rod's length (Relativity 6); nothing measured; nothing imagined (no imagined clock here, unlike Relativity 5 and 6).
- **A8, the module.** It has no function for the guesses: the order marker's place on the strip (by guess), the agreement marker, the distance in time between the two events as strip positions, the tutor's marking, and `actualOrderFor` (now in the tutor file) belongs in the module. Added with tests (§9). The tutor's numbers already come from the module.
- **A9, the tutor.** The compare step (`Experiment7Tutor.tsx:73`) states the guess and the real result before the explanation, as in Relativity 6. The tutor would name the white markers; the explanation would say which choice the learner made and what the run showed for each, **without "right" or "wrong" or a score** (§12, §13). The "A familiar version of this" train-car paragraph stays. **Needs the owner's confirmation.**
- **Old chapter numbers in wording.** The introduction says "Experiment 6" (`:243`), "Experiment 5" (`:274`), "Experiment 6" (`:277`), "Experiments 3 to 6" (`:281`), the results say "Experiment 6" (`:464`) and the tutor says "Experiment 3" and "Experiment 6" (`Experiment7Tutor.tsx:153-154`). **Recommend** the chapters' titles ("A moving clock", "Why can't light go faster?", "Does motion change length?").
- **A10, the introduction's statement.** "Guesses are not scored." (`:262`) stays. Add: the predictions never change the pictures or tables, the guesses are drawn on the strip in white and shown again beside the results, and the speed (Part 2) changes the drawings.
- **B1 to B3.** Every number comes from the same geometry a check would use, so a check-up would be circular, and the control only moves marks and numbers. The rod-frame time does equal the Lorentz result of Relativity 11, but that chapter comes later and cannot be used here. **Recommend no check-up and no setting-following table.** Keep the results lines, add guess tags (B4, guess only) on the order and gap lines, and add a short note under each results block (the lab's two times and the gap; the rod's own time: what each is, what it means with the real numbers, why it matters), without the mechanism (the tutor's). **Needs the owner's decision.**
- **The run's animation guard.** Present already (`Math.max(..., 0)`, `:190`), so the blank-page bug found in Relativity 3 does not apply.
- **Page width and buttons.** The outer width is already 900 px. The page uses inline colours (`#f9f9f9` card, `#28a745` START, `optionButtonStyle`) instead of the shared `exp-card`, `toggle-button` and `action-button` classes. **Recommend** the shared classes, as for Relativity 3 to 6.
- **Speed cap.** The page caps the custom speed at 0.9c (`MAX_SPEED`, specification Decision 7, "to match Experiment 6"). **Recommend keeping the cap** and saying why in Part 2's note.
- **Out of scope here, but noticed.** The summary in `src/App.tsx` (`:552`) states the answer ("The lab sees the back end reached first") and is shown only after the tutor, so it is fine under §12; it may carry old numbering. Reported only; not changed.

## Updated size
**Medium → Large** (was Medium): the Parts layout; labels on the canvas for two panels; a dark event-time strip with two rows and two white markers; "Where the real picture comes from"; Drawing A for Part 2 with "Runs so far"; two captions; words box; links (search and fetch, with the simultaneity pages held back); Start over; the tutor's marking and the 0c fix; the specification update; and tested module functions. Files: `Experiment7.tsx`, `Experiment7Tutor.tsx`, `relativityOfSimultaneityExperiment.ts` and its test, the specification, a new draft-wording file and a new pictures file.

## Questions for the owner before drafting (suggested defaults follow the answers given for Relativity 1 to 6)
1. **Gaps:** fix all of the above? Default: yes, all.
2. **Settings:** Part 1 fixed at 0.5c; the speed (0c baseline, 0.1c, 0.3c, 0.5c, 0.8c, "Other" 0.01c to 0.9c) moves to Part 2, which opens at 0.8c? Default: yes.
3. **The early reveal:** replace "Someone riding along with the rod sees the flash reach both ends together. The lab sees something different." with a neutral line saying what will be asked? Default: yes.
4. **Where the order guess is drawn:** a dark strip of event times under the two panels (a "Lab" row and a "Rod's own view" row on one time axis), appearing when the run ends? Default: yes. (Alternative: white marks on the two panels' end dots.)
5. **The two markers:** the order marker on the lab row (a tag at the guessed end, or a bracket for "at the same time") and the agreement marker between the rows, each with a YOUR GUESS box, and the caption says each is only a marker? Default: yes.
6. **Playback counter:** one counter renamed "Playback time", with the caption saying that each panel's own times are in its readouts? Default: yes.
7. **Part 2 drawing:** the two panels and strip for the learner's speed, no white marks, the speed in pink, "Runs so far"? Default: yes.
8. **Tutor:** marks each guess with no score (which choice, what the run showed, no "right" or "wrong"), and the 0c wording problem goes away with question 2? Default: yes.
9. **Introduction:** keep the specification's order; use the chapters' titles; define "light-second" here; add the statement about predictions and the controls; simplify it as was done for Relativity 5 and 6? Default: yes.
10. **Reading guide:** no check-up or setting-following table; guess tags on the order and gap lines and a note under each results block? Default: yes.
11. **Links:** search for plain official pages on the speed of light and reference frames (reuse the NASA pages), hold back any relativity-of-simultaneity page until after the tutor, and **for the 1905 paper, link it after the explanation or record a gap?** Default: record a gap.
12. **Words box:** the terms above and one formula entry ("time = distance ÷ speed", light covering 0.25 light-second in 0.25 s), with the arrival-time formulas withheld? Default: yes.
13. **Buttons and card:** switch to the shared classes? Default: yes.
14. **Size:** accept Medium → Large? Default: yes.

## Not checked (re-read)
The page was not run in a browser; narrow widths were not looked at; no source page was searched or fetched for the links list. The numbers quoted (0.433 light-seconds, 0.144 s, 0.433 s, 0.289 s, 0.250 s at 0.5c) come from the module's formulas by hand, not from running the page. The 0c bug was found by reading the tutor's text against `actualOrderFor`; it was not reproduced in the browser.
