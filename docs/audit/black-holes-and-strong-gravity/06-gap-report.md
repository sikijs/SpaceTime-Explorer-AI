# Gap report: Black Holes and Strong Gravity Experiment 6 (Seeing the fall from far away)
Date: 2026-11-02 | Specification: docs/experiments/black-holes-and-strong-gravity/06-seeing-the-fall.md | Components: src/components/SeeingTheFallExperiment.tsx, SeeingTheFallTutor.tsx | Physics module: src/physics/seeingTheFallExperiment.ts (+ .test.ts) | Status: read-only, nothing changed

## Summary
Three predictions, three pictures (the flash rows, the stretch-factor graph, the observer-clock graph), two tables and a worked calculation in Results, and a four-step tutor. It follows the older rule: guesses are text only, and the Results panel itself marks each guess "right" or "off". Biggest gaps: no guess marks on any picture, no reading-guide notes under the tables, no three-part "what to look for", and the verdicts are computed in the component, not the module. Size: **M**.

## Predictions found (A0)
| # | Question | Answers | Where the answer lives on a picture |
|---|---|---|---|
| 1 | How do the flashes arrive as the traveler nears the horizon? (SeeingTheFallExperiment.tsx:39-44, state 550) | same / closer / further apart | Picture 1 bottom row (gaps as received) or Picture 2 (stretch factor against 1) |
| 2 | Does the observer ever receive the horizon flash? (:46-51, state 551) | soon / long wait / never | Picture 3 (the clock curve against the horizon line), Picture 1 (flash 20) |
| 3 | Which effect changes the spacing? (:53-58, state 552) | gravity / motion / both | Picture 2 curves (violet, green, amber) |
Answers are held in `submitted*` state (:553-555) and used only in Results (:1106-1144) and the tutor props (:1243-1248).

## Rule A
| Item | Result | Evidence | Gap and what would be needed |
|---|---|---|---|
| A1 | Met | Pictures and tables read only `result`, `start`, `presetId` (:560, :624-631); prediction state is read only in the verdict text and tutor props | none |
| A2 | Not met | No white mark or "YOUR GUESS" box in `FlashRows` (:144), `StretchGraph` (:318), `ClockGraph` (:444) | P1: white guess row/line on Picture 1 or on the "1" line of Picture 2; P2: white marker for flash 20; P3: boxed pointer to a curve |
| A3 | Not met | No marks | All three answers are categories, so markers only, with a caption line saying so |
| A4 | Not met | Pictures draw features in stages (`q(k)`, :154), but no guess mark | Mark only once its feature is drawn (flash 20 only after the last slice) |
| A5 | Met (not needed) | Every answer has a picture | none |
| A6 | Not met | No "Where the real picture comes from" line under any picture (:901-1043) | Add a line to each picture: calculated here from the given formulas; nothing measured |
| A7 | Not met | Introduction (:644-739) and the pre-run text say nothing about guesses never changing the pictures or being drawn in white | Add the wording (owner to approve) |
| A8 | Not met | Module exports `gravityPart`, `motionPart`, `stretchFactor`, `stretchFactorSteps`, `travelerWatch`, `arrivalTime`, `runSeeingTheFallExperiment` (seeingTheFallExperiment.ts:47-191), all for real values. Nothing for a guess's position. The "right" test is in the component (:1112-1143) | Add guess-mark functions and tests; move verdict logic into the module |
| A9 | Partly met | Observe prompt points to "the two rows" (Tutor:~108); compare step lists the guesses without marking (:110); the tutor's explanation (:~140-205) never marks them. The Results panel marks them first (:1112-1143) | Prompts would name the marks; the verdict wording would move from Results to the tutor (owner's decision) |
| A10 | Not met | No sentence in the introduction, controls or Results says predictions do not change the results (searched and read :644-739, :741-900, :1045-1237) | See O1 |

## Rule B
- B0: Results has one 9-row table (:1063-1104), a worked calculation (:1146-1168), a near-horizon table of three gaps (:1173-1198), a daily-life comparison (:1204-1211) and a limits box (:1213-1234).
- B1 Not met / probably N/A: no measured reference. The spec says the arrival-time and stretch formulas were not checked against a primary source (06-seeing-the-fall.md:240). Only internal comparisons exist (as sent vs as received).
- B2 Not met: no "What this table tells us" under either table. Only one-line follow-ups ("Each row has a gap ten times smaller...", :1199-1202).
- B3 N/A: the two controls (black hole, release distance) only move marks in the pictures and there is no outside reference.
- B4 Partly met: guesses appear in Results (:1106-1144) as "Checking your Nth prediction", but they carry a verdict ("So your prediction was right/off") and no tag sits on a table row.
- B5 Partly met: table values come from the module (`stretchFactor`, `arrivalTime`, `nearHorizon`, :629); the verdicts are decided in the component.

## Rule C
- C1 Met: row titles, numbered flashes, legend (:160-185, :290-297); curve labels and legend on Picture 2 (:397-438); axis, dashed-line and horizon labels on Picture 3 (:511-538).
- C2 Met: sent (cyan) and received (orange) rows; gravity, motion and total curves differ in colour (:27-33).
- C3 Met: "How to read this picture/graph" under each (:903, :961, :1010).
- C4 Mostly met: pictures, rows, dots, lines, curves and units are named and the terms "horizon light-time", "stretch factor", "gap above the horizon" are defined. Gaps: the order in which the rows build up during the run is only implied.
- C5 Partly met: Picture 2 caption has numbers (2 x 3 = 6, "about 3.2 and about 10", :988-999); Picture 1 and Picture 3 captions have no worked moment with numbers.
- C6 Not met: "What to watch" is one sentence (:947-949). No Look at / What it means / Why it matters.
- C7 Partly met: the captions' "What is really happening" paragraphs (:932-937, :988-993, :1024-1029) give the full two-cause mechanism and the "no limit" conclusion before the tutor. The learner has already predicted, so §12 is not broken, but §14 leaves the mechanism to the tutor.
- C8 Met: terms are defined in the introduction (:689-699) before use.

## Rule D
N/A (not a Cosmic Horizons experiment). No external links exist on the page.

## Other findings
- O1: CLAUDE.md §14 says the older experiments "say that predictions do not change the pictures or tables". This experiment does not say it anywhere (A10). The Results panel marks each guess right or off, which the new rule gives to the tutor.
- O2: The tutor's conceptual question (Tutor:~112, "How can both be true?") follows a Results panel that already states the answer ("Never arrives"). White is already used on Picture 2 for "the flashes sent so far" (StretchGraph :416, caption :984), so a white guess mark would clash with it.

## What an update would touch, and its size
Components: SeeingTheFallExperiment.tsx, SeeingTheFallTutor.tsx; module seeingTheFallExperiment.ts and its test file; the specification (§28.2); possibly App.tsx "What's next" (not reviewed). Size: **M** (marker-only marks on three pictures, new module functions with tests, the A6/A7 wording, notes under two tables).

## Not checked
Not run in a browser; tests not run; the tutor's explanation (:140-205) read only in part for A9; spec sources not read beyond the headings; "What's next" text in App.tsx not read.
