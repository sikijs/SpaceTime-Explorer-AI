# Gap report: Cosmic Horizons Experiment 8 (Does antimatter fall down?)
Date: 2026-11-02 | Specification: docs/experiments/cosmic-horizons/08-does-antimatter-fall-down.md | Components: src/components/AntimatterGravityExperiment.tsx, AntimatterGravityTutor.tsx | Physics module: src/physics/antimatterGravity.ts (+ .test.ts, 24 `it`s) | Status: read-only, nothing changed

## Summary
Complete experiment of the older pattern: introduction, 2 predictions, 5-stage run, 3 pictures plus the trap drawing, 3 controls, 4 tables, tutor, Words panel, links. Biggest gaps: no guess mark on any picture (Rule A), no check-up or "What this table tells us" notes (Rule B), no "Where the real picture comes from" lines, and the introduction never says predictions do not change the results. White is already used for real data and for the learner's controls. Size: **L** if Rule B is applied (Rule A + C alone: M).

## Predictions found (A0)
| # | Question | Answers | Where the answer lives on a picture |
|---|---|---|---|
| 1 | Is 0.75 ± ~0.2 compatible with antimatter falling up? (AntimatterGravityExperiment.tsx:933) | compatible / borderline / ruled out (:253-257), state `fallsUpPrediction` (:652) | Picture 2, the marker for ratio -1 and its verdict (stage 3). A category, so a marker only |
| 2 | Does 0.75 ± ~0.2 show antimatter falls more slowly? (:946) | slower / cannot tell / exactly like matter (:258-262), state `readingPrediction` (:653) | Picture 2, the marker for ratio 1 and its verdict. A category, so a marker only |

## Rule A
| Item | Result | Evidence | Gap and what would be needed |
|---|---|---|---|
| A1 | Met (not exhaustively traced) | PictureOne/PictureTwo take only `userRatio`/`yours` from the *controls* (:265, :474); prediction state is read only by the tutor (:290) and the button text | None found. |
| A2 | Not met | no "YOUR GUESS" text in the file | White YOUR GUESS box with a line, on Picture 2 beside the -1 and 1 markers. |
| A3 | Not met | | Two category markers; caption must say "only a marker". |
| A4 | Not met (nothing drawn) | Picture 2's possibilities appear at stage 3 (:1136, status text :~985) | Marks only from stage 3. |
| A5 | N/A | both answers live on Picture 2 | none |
| A6 | Not met | no "Where the real picture comes from" line | Add under Pictures 1 to 3: measured by ALPHA (CERN, 2023); calculated here (falls, combined sigma); imagined (pretend small error bar, stage 4; ratios -1, 0 and 1 as possibilities). |
| A7 | Not met | "What you will do" (:894-895) says only "Nothing here is graded." The controls note (:~1273) says "The three controls below change the pictures and tables. The measured value stays fixed." | Add: predictions never change pictures/tables; guesses drawn in white and shown beside results; which controls change which drawings. |
| A8 | Partly met | `fallsUpAnswer`, `readingAnswer`, `compatibility`, `sigmasFrom`, `combinedUncertainty` exist and are tested (antimatterGravity.ts:51,77,103,109) | Missing: a function giving each *guess's* sigma/verdict position (e.g. which verdict a guess implies) for the mark; tests for it. |
| A9 | Not met | Tutor observe prompt points to "Table 2 and Picture 2" but not to marks (AntimatterGravityTutor.tsx:103-105); predictions marked in explanation only (:149-163) | Meets "explanation only"; prompts need to name the YOUR GUESS marks. |
| A10 | Older rule, partly said | "Your predictions are recorded and not marked here." (:~985); results note "Your predictions are not marked here." (:~1137 area) | Never says predictions do not change the pictures. |

## Rule B
B0 tables: Table 1 how far each ratio falls; Table 2 measurement vs three possibilities; Table 3 published results and plans; Table 4 how small an error bar a test needs (all via ResultsTable, :~1395-1525).
| Item | Result | Gap |
|---|---|---|
| B1 | Not met | No check-up. A reference exists: ratio 1 (ordinary matter) vs ALPHA 0.75 ± 0.21 in sigma (already computed, Table 2), the 2024 repeat, and the plans (spec source table :238). |
| B2 | Not met | Tables have no notes under them (only Table 3 has a caveat on the 20 vs 25 percent precision, :~1507). |
| B3 | Partly | Table 4 follows the controls; check whether it adds anything the pictures do not (owner decides). |
| B4 | Not met | Predictions appear only in the tutor. Need a block beside the results with a tag on Table 2's -1 and 1 rows. |
| B5 | Partly | `compatibility`, `sigmaNeeded` tested; no function for a check-up reading. |

## Rule C
| Item | Result | Evidence |
|---|---|---|
| C1 | Not checked visually | 41 SVG text elements (grep); trap drawing and three pictures have aria-labels (4). Not viewed in a browser. |
| C2 | Met in code | learner's own ratio, error bar and difference draw white curve/bar/marker (:48, :363, :503-552). |
| C3 | Met | "How to read this drawing" :813, Picture 1 :1033, Picture 2 :1121, Picture 3 :1223. |
| C4 | Mostly met | each caption lists elements by name/colour (:818-836, :1041-1071, :1127-1157, :1229-1238) and units. |
| C5 | Met | worked moments :1079, :1164, :1243. |
| C6 | Met (structure) | 11 `look`/`means`/`matters` triples; Picture 1 list gated by `stage >= 1` (:1086). Gating of Pictures 2/3 lists not read line by line. |
| C7 | Met so far as read | pre-run captions describe drawn items only; papers kept until after the run (:906-907, :1529). |
| C8 | Partly checked | terms (ratio, sigma, give or take) defined in intro (:846-888); not every term traced. |

## Rule D
- D1: Met in structure: dated "(October 2026)" (:861); question, what antimatter is, how the measurement works, assumptions (:758-899). Not judged for every claim.
- D2: As C.
- D3: Partly met. Pre-run list: CERN antimatter, NASA Apollo 15 feather drop, CERN schedule (:912-920); papers and CERN news after the run (:1529-1535), reasoned as §12. No page for "uncertainty/sigma" or the equivalence principle beyond the feather drop; the spec has no "no plain official page found" rows (grep for 3(c) found none for 08), so any missing background page is unrecorded.
- D4: Not met (= Rule B).

## Other findings
- O1: White (#ffffff, `YOURS_COLOR` :48) means the learner's own *controls*, but also real data: the combined-error bar in Picture 2 is white (:503) and the flash stars in the drawing are white (:828). Under the new rule white must mean only the guess; the colours would have to change first.
- O2: Prediction 1/2 text already quotes "0.75, give or take about 0.2" (:936,:949); that is by design, not a fault.
- Spec's own open items (secondary sources, "20 vs 25 percent") unchanged.

## Rule E and re-read additions (2026-11-03)
- **E1 to E3 Not met.** No Parts: after the introduction the page runs on in one column. No coloured lines, headings or leads.
- **The controls already change Part 1 pictures.** Control 1 moves Picture 1's own curve, control 2 Picture 2's third line, control 3 Picture 3's bar (all white, dashed or solid), and the last rows of Tables 1 and 2 and Table 4. Under the rule a learner's own setting is pink.
- **Colour clashes found (O1 confirmed and widened).** White was used for the learner's controls and for real things (the combined error bar, the pretend bar, the flash stars); pink was used for "no gravity"; rose (the coils, the "ruled out" verdict) is too close to pink. Fixed by recolouring: own choices pink, computed bars light grey, no gravity violet, coils and ruled out red, flashes pale yellow.
- **Both predictions are categories** about the possibilities −1 and 1, so each is a marker only, under that possibility's own marker.
- **B1 reference.** The measured value against each of the three possibilities (the same physics predicts each), and the bell-curve chance against the paper's own for "no gravity". No published-value column.
- **Defaults used.** The owner approved all default recommendations and wording in advance (2026-11-03).

## What an update would touch (O3, O4)
AntimatterGravityExperiment.tsx (PictureTwo, intro, controls note, Results), AntimatterGravityTutor.tsx (prompts), antimatterGravity.ts and .test.ts (guess-to-mark functions, check-up readings), the specification, DEVELOPMENT-STATE.md. Size: **M** for Rule A and C; **L** with a full Rule B reading guide for four tables.

## Not checked
Browser appearance, narrow widths, label overlap; stage gating of the Picture 2/3 look-for lists; every term definition; the Words panel entries.
