# Gap report: Cosmic Horizons Experiment 2 (Does dark energy change? DESI)
Date: 2026-11-02 | Specification: `docs/experiments/cosmic-horizons/02-does-dark-energy-change.md` | Components: `src/components/EvolvingDarkEnergyExperiment.tsx` (1275 lines), `EvolvingDarkEnergyTutor.tsx` | Physics module: `src/physics/evolvingDarkEnergy.ts` (+ `.test.ts`, 32 cases) | Status: read-only, nothing changed

## Summary
Older-rule experiment with two predictions, three pictures (the dark-energy strength line, a two-chart distance and brightness picture, and a sigma bar chart), a "How far back?" control, three tables, a "How to read these results" bullet list, a tutor and a long introduction (with supernova section). Biggest gaps: no guess marks, no "Where the real picture comes from" lines, no check-up or per-table "What this table tells us" notes, no prediction tags in the results (the predictions are not even listed in the results block), look-for items are not three-part. Size **Medium**.

## Predictions found (A0)
| # | Question | Answers | Where the answer lives on a picture |
|---|---|---|---|
| 1 | "how different would the distance look?" at z = 0.5 (`EvolvingDarkEnergyExperiment.tsx:484-495`) | under 0.5 / 0.5-2 / 2-5 / over 5 percent (`:96-101`); state `distancePrediction` (`:171`) | Picture 2 left chart, the dot at z = 0.5 (`:872`); a band on its percent scale |
| 2 | "what did the recalibration do?" (`:497-509`) | weaker / about the same / stronger (`:104-108`); state `recalibrationPrediction` (`:172`) | Picture 3: the DES Y5 bar (4.2 sigma) and its recalibrated row; a marker beside it (categorical) |

## Rule A
| Item | Result | Evidence | Gap |
|---|---|---|---|
| A0 | Met | above | |
| A1 | Met (read) | the pictures and tables read `fit`, `lookback`, `result` (`:1116-1135`); predictions are read only for the buttons and the tutor | |
| A2 | Not met | no white mark or "YOUR GUESS" box found in the file | P1 band on Picture 2 (left); P2 marker on Picture 3 |
| A3 | Not met | P1 is a range (a band follows); P2 categorical (marker, say so in the caption) | |
| A4 | Not met | stages exist: left chart at stage 3, Picture 3 at stage 5, last row at stage 6 (`:699`, `:954`) | draw P1's band at stage 3, P2's marker at stage 6 |
| A5 | Met for both | both quantities already have a picture | |
| A6 | Not met | no source line under Pictures 2 and 3 | measured (DESI, DES teams), calculated here (the distance and brightness curves from `comovingDistanceMpc`), imagined (the grey constant-dark-energy universe) |
| A7 | Partly met | note at the control: "Your predictions stay as they are" (`:1093`); the Results text says it only reports (`:1111`); no mention of white marks or that guesses never change the pictures | wording |
| A8 | Not met | `distanceRange`, `recalibrationEffect`, `DES_RECALIBRATION`, `distanceDifferencePercent` exist (`evolvingDarkEnergy.ts:132,239-258`); missing: band edges per range and a function for the marker positions | add + tests |
| A9 | Partly met | tutor marks predictions only in the explanation (`EvolvingDarkEnergyTutor.tsx:137-148`), but its prompts cannot name marks | |
| A10 | Met as current state | "Your predictions are recorded and not marked here" (`:558`); "Your predictions stay as they are" (`:1093`); "does not change ... your predictions" (`:1229`) | |

## Rule B
B0: a "Your collection, and the time you chose" table (9 rows, `:1115-1135`); "The same numbers at four times in the past" (`:1139`); "The published preferences for a changing dark energy" (`:1179`); a bullet guide (`:1207-1235`); more links after the run (`:1236`). The learner's predictions are **not** listed in the results.
- B1 Not met. A real reference exists: published sigma values (DES Y5 4.2 then the 2025 recalibrated figure, DESI figures, `PUBLISHED_SIGMAS` `:42`). A check-up could set each model quantity (the "3 and 5 sigma" lines) beside what was published; the distance difference has no published reference (calculated), so it would be "not applicable".
- B2 Partly met: one shared bullet list (`:1207-1235`), not per table, no "why it matters".
- B3 Partly met: the "How far back?" control (`:1090-1105`) follows the learner; there is no published-value column (none exists for distances; it would add little). Per CLAUDE.md §14 this may stay out.
- B4 Not met: no predictions block in results (grep found none after `:1093`).
- B5 Met for current numbers (`runEvolvingDarkEnergy`, `:221`); no check-up functions.

## Rule C
- C1 Partly checked: stage names and captions list the grey and orange lines, chart titles and the dot (`:565`, `:711`, `:966`); I did not verify every SVG label.
- C2 Met: grey (constant) versus orange (fit) throughout (`:86-87`).
- C3 Met: "How to read this diagram" under Pictures 1, 2, 3 (`:639`, `:830-833`, `:1027`).
- C4 Met (read): elements and units described, stages named.
- C5 Met: "A worked moment, with your numbers" for each (`:670`, `:912`, `:1060`).
- C6 Not met: items headed "What to look for, and what it would mean" (`:678`, `:924`, `:1065`), two-part with no "Why it matters" (zero hits). Some items are shown with the picture before later features exist (Picture 1 list on all stages).
- C7 Met (read): the comment at `:239` says the guide avoids revealing; Picture 2's caption says at z = 0.5 "this is the galaxy that Prediction 1 asked about" (`:872`) but not its value.
- C8 Met (read): "Words and formulas" panel and intro definitions (`:136-146`, `:329`).

## Rule D
- D1 Met (read): "Where this stands" status, long introduction with thermostat comparison (`:250`) and a supernova section (`:281-329`).
- D2 Partly met: see C6.
- D3 Met: papers plus NASA dark energy page, NASA and ESA/Hubble supernova pages from the start (`:387-420`), more after the run (`:1236-1255`).
- D4 Partly met: see B.

## Other findings
- O1: none against the specification found.
- O2: the intro/caption "Try the other two collections (the predictions will be cleared)" (`:934`) works because Prediction 1 names the collection. The "w" explanation in the panel (`:142`) was not checked against a source. The Results text tells the learner nothing about the 3-versus-5-sigma reading beyond the guide.

## What an update would touch, and its size (O3, O4)
`EvolvingDarkEnergyExperiment.tsx`, `EvolvingDarkEnergyTutor.tsx`, `src/physics/evolvingDarkEnergy.ts` and test, the specification. Size **Medium**.

## Not checked
Rendering; narrow widths; all SVG label texts; the tutor's explanation text; contents of the 32 tests; the Picture 2 source of numbers.
