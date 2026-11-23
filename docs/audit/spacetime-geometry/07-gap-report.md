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

---

## Re-read on 2026-11-23 (against every rule now in CLAUDE.md §14 and §29, not only Rules A to C)

The component, the tutor and the physics module have not changed since the owner's approval of 2026-10-16 (last code commit `cea7346`; `git status` is clean for them). The 26 physics tests pass (re-run today). Experiments 8 and 9 import functions from `src/physics/aberration.ts`, so any new function must be added beside the existing ones and none may change. The first report was written before the owner's later rules, so they were checked now by reading the code.

| Rule | Result | Evidence |
|---|---|---|
| **E. The page in four Parts** (2026-11-02) | Not met | One card, no Part headings, coloured lines or "What we are about to do" leads (`AberrationExperiment.tsx:392-739`). The tutor sits outside the card (`:741`). |
| **Parts 2, 3 and 4 appear after the first Run** (2026-11-07) | Met for Results and tutor, not met for the controls | Results and tutor appear when the first run ends (`:652`, `:741`). There is no Part 2: the speed control sits before the guess. |
| **Controls come after the first Run** (Exp. 3 to 6 pattern) | Not met | The learner picks the speed (0.3c, 0.6c, 0.9c, 0.99c) first (`:450-472`); picking another speed clears the guess (`:462`). |
| **Links ("Want to know more?")** | Not met | No `href` in the component or the tutor. |
| **"Words and formulas" box** | Partly met | The box exists and "Some new words" names four terms (`:17-30`, `:448`). The formula entry is added after the run (right, §12). Terms the page uses but does not list: ray of starlight, the star we follow, wedge, arcsecond, the number D, the rain rule. |
| **Start over, not Change prediction** | Not met | No Start over button. Clicking another answer at any time, even after a run, returns the page to idle (`:486-489`). The guess is never locked, and the page does not say that guesses never change the pictures. |
| **Run button** | Met | One Run, disabled until a guess is chosen and while running (`:504-516`). |
| **Completion marks** | Note | `onComplete` when the run ends (`:354`), `onTutorComplete` when the tutor reaches its explanation (`:742`). Keep both. |

### New findings (not in the first report)

1. **Rule A: where the guess goes.** The guess is a direction only (same, ahead of sideways, behind sideways), so the mark is a marker with no size, and the caption must say so. The natural place is "The traveler's sky", beside the yellow ring that follows the sideways star. A white box "YOUR GUESS" would be joined by a line to a white arrow that starts at the sideways (90°) position and points ahead, points behind, or is absent for "same". The mark must not show an angle, since the guess has none. It would be drawn only once the traveler's sky is drawn.
2. **The guess does not depend on the speed.** At every speed offered the real answer is "ahead of sideways" (specification, Prediction Activity). So Part 1 can be fixed on one speed without changing what is asked.
3. **No guess is attached to the second picture, the counts.** The bars picture (in the Results) has no guess. By the owner's pattern in Experiments 5 and 6, a second prediction could be added there; the specification has one prediction only (§16: a decision for the owner).
4. **Rule C6.** "What to look for" is four bare questions (`:645-648`), not Look at / What it means / Why it matters. The bars caption (`:723-728`) has no look-for items and no worked moment. The results have no worked moment, and the formula's worked example (0.6c gives 53.1°) lives only in the "Words and formulas" entry and the tutor's item 4.
5. **Rule B, Results.** Two tables ("The angles", seven rows; "The counts", three rows) and a bars picture, each with a one-line lead only (`:665-668`, `:695-697`). No check-up and no "What this table tells us". Possible check-up rows with a real reference: (a) the formula's two routes agree (`travelerAngleOf` against the energy-and-momentum route `rayAsMeasuredByTraveler`, which the module already computes and tests); (b) the stars straight ahead and straight behind do not change (0° and 180° rows); (c) the number of stars is 24 for both observers and their order around the ring does not change (spec test 4); (d) Earth's orbital speed gives about 20.5 arcseconds, against the published constant of aberration, 20.49551 arcseconds (spec table: "confirmed by search" for the constant, Earth's speed "not confirmed", so the row needs a read source first). No "published range" is used for anything else, so the readings would be "the same", "more", "less".
6. **Rule B3 (optional).** The speed control only moves marks in the pictures; recommend leaving out a comparison table, as Experiment 14 did.
7. **The tutor.** Observe says "the two pictures and the tables" and names no mark; compare quotes the guess and the module's angle (`AberrationTutor.tsx:69-72`); the explanation never says whether the guess matched. Item 7 (Earth, Bradley, 1727, about 30 km/s, about 20 arcseconds) has no source read (`:155-158`; module comment `:23`). Item 3's rain comparison and item 2's "running into the starlight" sentence are as the owner approved (Decision 8, Decision 13).
8. **§12 re-check of the introduction and caption.** Neither says which way the stars shift: the introduction asks "which way" (`:401-402`), the caption's worked moment reads an angle (45°), and the formula appears only after the run. Met. One thing to watch when the guess mark is added: the white arrow must not be drawn before the learner has chosen, and a "same" guess must not look like a "right" or "wrong" marker.
9. **Cross-experiment.** `ReferencePanel` is imported from `EnergyMomentumExperiment.tsx` (`:5`), as in Experiment 6; Experiment 5's audit did not change it, so nothing breaks, but the dependency is fragile. Experiments 8 and 9 use this experiment's physics functions.
10. **No component tests.** The module has 26 cases; nothing renders the component, so the staged run, the captions, the marks and the tutor have no test (Experiments 5 and 6 each got render tests).
11. **Cross-references.** Experiment 6's `next` line and Experiment 7's own `learned` and `next` lines (`App.tsx:~940-958`) name this experiment; they need rechecking only if the structure or the quoted numbers (72.5°, 53.1°, 25.8°) change.

### Questions for the owner (recommended default first; "all defaults" is a valid answer)

1. **Layout.** Default: the four Parts, with the Part 2 lead and the other leads drafted for your approval, and the introduction, links and "Words and formulas" box above Part 1 (words box above the links, as in Experiment 6).
2. **Part 1's fixed case.** Default: **0.6c** (the specification's worked case: 53.1°), the question naming the speed. Part 2 then holds the speed buttons (0.3c, 0.6c, 0.9c, 0.99c) with a "Run these settings" button, as in Experiments 3 to 6. Alternative: fix another speed.
3. **The guess mark (Rule A).** Default: a white arrow and a "YOUR GUESS" box on The traveler's sky, starting at the sideways position and pointing ahead or behind, with nothing drawn for "same" except the box joined to the sideways (90°) line; the caption says it shows a direction only, not an angle. Alternative: a white dot at an illustrative angle (not recommended, it would read as a guess of size).
4. **A second prediction.** Default: none; keep the one prediction the specification approved. Alternative: ask about the counts (for example, "will the traveler count more, the same or fewer stars in the striped wedge than the lab?") with a white tick on the bars picture, shown beside the results and marked by the tutor.
5. **Reading guide (Rule B).** Default: a check-up of rows (a) to (c) of finding 5, from functions added to the module with tests; row (d) only if Earth's speed and the constant of aberration are read from a source first. A "What this table tells us" note under each of the two tables and the bars; the guess shown beside the results with a tag on "The star we follow"; no table for the controls.
6. **Captions.** Default: a caption under each picture; every look-for item rewritten as Look at / What it means / Why it matters and shown only once its feature is drawn; a "Where the real picture comes from" line (calculated here by the aberration formula, checked by the energy-and-momentum route; imagined: the 24 stars, very far away, evenly spaced, and the traveler at the speed chosen; nothing measured); a worked moment in the Results (0.6c: cos θ′ = 0.6, θ′ = 53.1°).
7. **Links and words.** Default: search for the original sources (Bradley's 1727 paper; Einstein's 1905 paper, which gives the aberration formula) and for plain pages from NASA, ESA or an observatory on stellar aberration; read each before approving; record a §29 rule 3(c) gap where none is found. Add to the box: ray of starlight, the star we follow, wedge, arcsecond, the number D, the rain rule.
8. **Tutor.** Default: observe and compare name the white mark; the explanation marks the guess ("right / not this time", as in Experiments 5 and 6); item 7 follows whatever the sources support (Earth's speed and the constant of aberration read from a source, or reworded).
9. **Start over and locking.** Default: an always-visible Start over, greyed out until there is something to clear and while a run plays; the guess is locked after Run with the approved note.
10. **Tests.** Default: add the module's guess-mark and check-up functions with tests first, then render tests for the component, as for Experiments 5 and 6.
11. **Pace.** Smaller than Experiment 6: one section, one prediction, two tables and a bars picture, no new physics. Default: one section, with a stop for your approval after the draft wording and again after the build.

**Size:** Medium (M), as first reported.

### Not checked in this re-read
The `SkyPicture` SVG beyond its text labels and pattern fills; the "Words and formulas" entries line by line; the specification's source table beyond the rows above; whether the chapter summary needs change; links (none searched or fetched); the browser, narrow widths and keyboard. Nothing was run except the 26 physics tests (they pass); no code, test, specification or wording was changed.

---

## Progress log (2026-11-23)

The owner chose the title "Does Your Motion Change Where a Star Appears?" and answered "all defaults" to the eleven questions above on 2026-11-23, then approved the draft wording (`07-draft-wording.md`) and, after asking where the cause is explained, the second draft on the cause (`07-draft-wording-cause.md`). The page was built the same day (code `262cf88`). Findings 1 to 11 and every row of the Rule E table are addressed, except:

* **Finding 5 (check-up row d, Earth's speed against the published constant):** not built; the constant's source (the IAU resolution) was not found or read. The tutor's Earth example says its 20.5 arcseconds is computed on the page.
* **Question 7 (links):** NASA Goddard, ESA Gaia and NASA's Earth Fact Sheet were read and linked; Bradley's 1728 paper (403) and Einstein's 1905 section 7 (truncated copies) were not read and are recorded as gaps.
* **Finding 11 (cross-references):** not rechecked against the new title.
* **Added at the owner's request on 2026-11-23:** a longer "The question" and "What happens", with "Some new words" after them; the lab observer drawn at rest in the lab's picture (option 2); a step-by-step explanation of the cause in the tutor with a two-panel drawing, and a cause sentence in the chapter summary.
* **Not done or not checked:** see "Open" in the specification's "Audit Update". The owner has not read the finished page line by line.

