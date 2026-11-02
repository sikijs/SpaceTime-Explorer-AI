# Gap report: Spacetime Geometry Experiment 7 (Aberration: why the sky bunches up ahead of a fast traveler)
Date: 2026-11-02 | Specification: docs/experiments/spacetime-geometry/07-aberration.md | Components: src/components/AberrationExperiment.tsx, AberrationTutor.tsx | Physics module: src/physics/aberration.ts (+ aberration.test.ts, 26 cases) | Status: read-only, nothing changed

## Summary
One prediction (where the traveler sees the star that the lab sees at 90 degrees), one speed control, two sky pictures (lab, traveler) built in stages, a Results panel with two tables and a count bar picture, and a tutor. Older rule: the guess is text only. Biggest gaps: no guess mark on the traveler's sky (Rule A); no check-up or "What this table tells us" for the two tables (Rule B); "What to look for" items are bare questions (C6); the intro does not say predictions never change the pictures. Size: **M**.

## Predictions found (A0)
| # | Question | Answers | Where the answer lives on a picture |
|---|---|---|---|
| 1 | Where does the traveler see the star the lab sees exactly sideways? (AberrationExperiment.tsx:475-480) | Same (sideways) / ahead of sideways / behind sideways (:47-51); state `prediction` :333; clears on speed change :462 | "The traveler's sky" picture: the yellow-ring "star we follow" at angle followTravelerAngle (:547). Exists, drawn during the run. |

## Rule A
| Item | Result | Evidence | Gap and what would be needed |
|---|---|---|---|
| A0 | Met | above | |
| A1 | Met | sky = runSky(speed) from the module; prediction only passed to text :657 and tutor :742 | |
| A2 | Not met | no "YOUR GUESS" in the file | White mark and box on the traveler's sky near the followed star, at 90 degrees (same) or on the ahead/behind side. |
| A3 | Not met | no mark | The answer has a direction only, no size: use a marker and say so in the caption. |
| A4 | Not met | | Draw once the followed star is drawn in the traveler's sky (stage 2). |
| A5 | Met | the answer has a picture | |
| A6 | Not met | no "Where the real picture comes from" | Add: calculated here by the aberration formula; the stars are imagined (24 evenly spaced). |
| A7 | Not met | "You are not graded" :439 only | Add the new-rule sentence; add a note beside the speed control (:450-472). |
| A8 | Not met | module exports travelerAngleOf, runSky, rainRuleSidewaysAngle (aberration.ts:54-152); no guess-mark function | Add a function giving the mark angle for each answer, with tests. |
| A9 | Partly met | compare step quotes the guess and module numbers (AberrationTutor.tsx:72); "observe" prompt says "the two pictures and the tables" and does not name a mark; no matched/not matched in the explanation (not found) | Point to the white mark by name; mark the prediction in the explanation (owner's choice). |
| A10 | Met (older rule) | "It is only recorded here, not marked right or wrong." :658-659; "You are not graded" :439, :478-479 | Not a fault; does not say the pictures never change with a guess. |

## Rule B
- B0. Results (:652-737): "The star we follow" line; Table "The angles" (seven stars, lab angle, traveler's angle, change); Table "The counts" (COUNT_ROWS lab vs traveler); CountBars picture with "How to read these bars"; "The number D" line.
- B1. Not met. Real reference: the module's own formula (aberration.ts) and, in the tutor, Earth's orbital speed with Bradley's aberration (AberrationTutor.tsx:155, no source check per the module comment :23). A check-up could set the formula's value against the drawn rays; there is no published range to compare with, so use "the same / more / less".
- B2. Not met. Each table has only a one-line lead (:665-668, :695-697).
- B3. N/A (optional): the speed control only moves marks in the pictures.
- B4. Partly met: guess text only (:657-658); no block and no row tag. The relevant row is "The star we follow" / the 90 degree row of the angles table.
- B5. Partly met: the table numbers come from travelerAngleOf and runSky; no comparison functions.

## Rule C
- C1. Met for what was read: "direction of travel" arrow, four labelled stars, yellow "star we follow", ship, wedge counts, picture titles (:171-259). Not every SVG text was read.
- C2. Met: lab and traveler skies are visibly different colours (sky blue/purple) and the stars move with the speed.
- C3. Met: "How to read this diagram" :559; "How to read these bars" :724.
- C4. Met: both pictures named, each element listed, wedge patterns, terms (degree, θ, c) defined (:626-631), run order (:612-619).
- C5. Partly met: a worked moment exists (:636-639) but is about reading an angle (45 degrees), not an aberration number with real values (intentionally, to avoid revealing the answer, §12). The Results have no worked moment.
- C6. Not met: "What to look for" are four bare questions (:645-648).
- C7. Met: the caption and introduction deliberately leave out which way stars shift (:393-395, :555-556).
- C8. Met for what was read: direction of travel, θ, 0.6c, aberration defined before use (:410-427); D is introduced in the results line :730 ("the same factor the moving clock of Experiment 3 used").

## Other findings
- O1. None found; not checked against PROJECT.md/AGENTS.md.
- O2. (a) The tutor's Earth example (about 30 km/s, Bradley) has no source check (AberrationTutor.tsx:23, :155; spec lists it). (b) "rain rule" is in the module but not on the learner's page except via tutor; not read in detail. (c) Results are shown only "once the run is complete" (:652) while the caption says "once the traveler's sky is drawn", consistent. (d) The "Words and formulas" formula entries appear only after the run (:448), good for §12.

## What an update would touch, and its size
Files: AberrationExperiment.tsx (SkyPicture marks, results), AberrationTutor.tsx, src/physics/aberration.ts and .test.ts, the specification, wording. Size: **Medium** (one prediction, one mark on one picture, a reading guide for two tables).

## Not checked
Tutor explanation paragraphs after line 110, REFERENCE_ENTRIES wording, SkyPicture SVG in full, narrow widths, no browser run, tests not re-run.
