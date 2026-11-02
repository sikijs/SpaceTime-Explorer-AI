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
