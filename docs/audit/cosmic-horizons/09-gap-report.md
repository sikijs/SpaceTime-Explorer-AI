# Gap report: Cosmic Horizons Experiment 9 (Can a clock tell how high it is?)
Date: 2026-11-02 | Specification: docs/experiments/cosmic-horizons/09-can-a-clock-tell-its-height.md | Components: src/components/ClockHeightExperiment.tsx, ClockHeightTutor.tsx | Physics module: src/physics/clockHeight.ts (+ .test.ts, 22 `it`s) | Status: read-only, nothing changed

## Summary
Older-pattern experiment: 2 predictions, 3 pictures + drawing, 3 controls, 4 tables, tutor, Words panel. Biggest gaps: no guess marks; no check-up/notes/predictions block in Results; no "Where the real picture comes from"; the introduction never says predictions do not change results; white means the learner's own controls. Both predictions are numbers on log scales, so the marks have natural positions. Size **L** with Rule B (Rule A + C: M).

## Predictions found (A0)
| # | Question | Answers | Where the answer lives |
|---|---|---|---|
| 1 | Two clocks 1 m apart: gap after a year? (ClockHeightExperiment.tsx:848) | ~3 us / ~3 ns / ~3 ps (:590-594) | Picture 2 (gap after a year vs height), the 1 m row |
| 2 | Height that goes with a rate difference of 1 part in 10^19? (:860) | ~1 m / 1 cm / 1 mm (:595-599) | Picture 3 (smallest height vs clock precision), the 10^-19 row |

## Rule A
| Item | Result | Evidence | Gap |
|---|---|---|---|
| A1 | Met (not exhaustively traced) | PictureOne/Two/Three take `yourHeight`, `yours`, `yourPrecision` from controls (:273,:378,:470); predictions go only to the tutor (:1394) | none |
| A2 | Not met | no YOUR GUESS | White box + line on Picture 2 (1 m row) and Picture 3 (1e-19 row) |
| A3 | Not met | | Guess is a scale (3 us/ns/ps; 1 m/cm/mm): mark can follow it |
| A4 | Not met | Picture 2 and 3 appear at later stages | draw guess only when row exists |
| A5 | N/A | both have a picture | |
| A6 | Not met | no source line | measured (Wisconsin, JILA gradient), calculated here (g h / c^2), imagined (none; controls are trial values) |
| A7 | Not met | "What you will do... Nothing here is graded." (:804-805); controls note "add a white mark to each picture and fill in Table 4" (:1178) | add the three points of the rule |
| A8 | Partly met | `gapAnswer`, `heightAnswer`, `timeGap`, `smallestHeight` tested (clockHeight.ts:50,56,110,113); answers return only a TimeScale/LengthScale name | add numeric value of each answer button (3e-6 s etc.) with tests |
| A9 | Not met | observe prompt "Look at Picture 2..." names pictures, not marks (ClockHeightTutor.tsx:108-110); predictions marked in explanation only (:156-165) | name the marks |
| A10 | Older rule, partly | "Your predictions are recorded and not marked here." (:920); "Your predictions are not marked here." (:1273) | never says they do not change the pictures |

## Rule B
B0: Table 1 rate difference and gap after a year (:1276); Table 2 smallest height a clock can notice (:1296, the 1e-19 row is flagged for Prediction 2 at :1308); Table 3 published results and plans (:1311); Table 4 your own numbers (:1358).
| Item | Result | Gap |
|---|---|---|
| B1 | Not met | Real reference exists: Wisconsin 2023 measured -12.4 +- 0.7 +- 2.5 vs expected -10.9 (x10^-19 per cm) (spec :240), `sigmasFromExpected` already in module (tested, 7 refs) |
| B2 | Not met | no notes under tables |
| B3 | Partly | Table 4 exists; owner decides whether it adds anything |
| B4 | Not met | no predictions block |
| B5 | Partly | `sigmasFromExpected` tested; no check-up reading function |

## Rule C
- C1: Not checked visually (39 SVG texts, 4 aria-labels).
- C2: Met in code (white ring/row marks for own height, time, precision :339, :970, :1048, :1117).
- C3: Met: drawing :727, Pictures :947, :1030, :1098.
- C4: Mostly met (element lists; units for powers of ten defined in intro :~766).
- C5: Met: worked moments :983, :1055, :1136.
- C6: Met (structure): 9 look/means/matters triples; stage gating of each list not read line by line.
- C7: Met so far as read: intro says the numbers are shown after the run (:764); papers withheld (:817-818, :1378).
- C8: Partly checked; many terms (frequency, optical lattice, geodesy, BIPM/CGPM) defined in intro/Words.

## Rule D
- D1: Met in structure: dated, detailed ("What an atomic clock is", "Where the question stands (October 2026)").
- D2: As C.
- D3: Partly. Pre-run: NIST x2, BIPM FAQ, BIPM Resolution 4 (:823-837); papers after the run (:1384). No official page for "geodesy" or "optical lattice" beyond the NIST page; no 3(c) rows in the spec (grep found none for 09).
- D4: Not met (= Rule B).

## Other findings
- O1: white = learner's controls (`YOURS_COLOR` :46); would clash with white = guess.
- O2: none found. CLAUDE.md status notes the 2025 mountain campaign is unsourced (spec's open item).

## Rule E and re-read additions (2026-11-03)
- **E1 to E3 Not met.** No Parts: after the introduction the page runs on in one column. No coloured lines, headings or leads.
- **The controls already change Part 1 pictures.** Controls 1 and 2 add a white ring to Picture 1 and to Picture 2's last row; control 3 adds one to Picture 3's last row; all three fill in Table 4. Under the rule a learner's own setting is pink.
- **Colour clashes found.** White was the learner's own choice; the Wisconsin line was pink; the laser layers were rose (close to pink). Fixed by recolouring (own choices pink, Wisconsin lime, laser red).
- **Prediction 2's answer had no picture row.** The 10⁻¹⁹ clock appears only in Table 2 (O1 correction: the gap report said "the 10⁻¹⁹ row of Picture 3", which does not exist). Under the rule it is added to Picture 3 as its own imagined (violet) row, and the guess is drawn against it.
- **B1 reference.** Three published numbers beside what the same rule gives (Wisconsin's expected gradient, JILA's precision, NIST 2010's 79-year effect). No published-value column.
- **Defaults used.** The owner approved all default recommendations and wording in advance (2026-11-03).

## What an update would touch
ClockHeightExperiment.tsx (Pictures 2 and 3, intro, Results), ClockHeightTutor.tsx, clockHeight.ts/.test.ts, spec, DEVELOPMENT-STATE.md. Size **M** (Rule A + C) / **L** with Rule B.

## Not checked
Browser rendering; label overlap; per-stage gating of Pictures 2/3 lists; Words panel; all term definitions.
