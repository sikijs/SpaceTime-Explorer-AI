# Gap report: Cosmic Horizons Experiment 3 (How lumpy is the universe? S8: KiDS, DES)
Date: 2026-11-02 | Specification: `docs/experiments/cosmic-horizons/03-how-lumpy-is-the-universe.md` | Components: `src/components/LumpinessExperiment.tsx` (1350 lines), `LumpinessTutor.tsx` | Physics module: `src/physics/lumpiness.ts` (+ `.test.ts`, 25 cases) | Status: read-only, nothing changed

## Summary
Older-rule experiment: an illustration (three-panel weak lensing), two predictions, Picture 1 (S8 number line), Picture 2 (curves of equal S8), Picture 3 (S8 against year), a "Look closer at" survey control, two tables (the first already shows "Sigma, worked out here" beside "The paper's own comparison (sigma)"), a bullet reading guide, a tutor and post-run links. Biggest gaps: no guess marks and no source lines, no per-table "What this table tells us" notes, no prediction block in the results, no three-part look-for items. Size **Medium**.

## Predictions found (A0)
| # | Question | Answers | Where the answer lives on a picture |
|---|---|---|---|
| 1 | "what did the better calibration do?" to KiDS's S8 (`LumpinessExperiment.tsx:951-962`) | lower / about the same / higher (`:45-49`); state `shiftPrediction` (`:676`) | Picture 3 (S8 against year): KiDS-1000 to KiDS-Legacy arrow; a marker on the later dot's side |
| 2 | "do the other surveys now agree?" DES versus the microwave value in sigma (`:965-974`) | within 1 / 1 to 2.5 / over 2.5 sigma (`:50-54`); state `rangePrediction` (`:677`) | Picture 1 (number line): a band either side of the sky-blue value, widths of 1 and 2.5 combined give-or-takes, beside DES's dot |

## Rule A
| Item | Result | Evidence | Gap |
|---|---|---|---|
| A0 | Met | above | |
| A1 | Met (read) | pictures and tables read `result`, `focusNames`, `results` (`:1195-1262`); predictions only feed the buttons and tutor | |
| A2 | Not met | no white mark or "YOUR GUESS" box in the file | marks on Picture 3 and Picture 1 |
| A3 | Not met | P1 is categorical (marker, say so); P2 is a range (a band follows the guess) | |
| A4 | Not met | Picture 1 stages, Picture 2 at stage 4 (`:1160`), Picture 3 at stage 5 (`:1163`) | draw P2's band only when DES's dot is drawn; P1's marker at stage 5 |
| A5 | Met | both quantities already have pictures | |
| A6 | Not met | no "Where the real picture comes from" line; the weak-lensing drawing says it is "an illustration of the idea, not real data" (`:327`) | measured (KiDS, DES, Planck), calculated here (sigma, the curves), imagined (the lensing illustration) |
| A7 | Partly met | "Your predictions stay as they are" at the control (`:1172`); the intro line "Results... only report" (`:1189`); nothing about white marks | wording |
| A8 | Not met | `tensionRange`, `kidsShift`, `tensionSigma`, `shift` exist (`lumpiness.ts:67-96`); missing: the band edges in S8 for each range and the marker positions | add + tests |
| A9 | Partly met | marked only in the explanation (`LumpinessTutor.tsx:130-138`); prompts cannot name marks | |
| A10 | Met as current state | "Your predictions are recorded and not marked here" (`:1024`); "Your predictions stay as they are" (`:1172`); "does not change the pictures' numbers or your predictions" (`:1291`) | |

## Rule B
B0: first table, the chosen survey in a column per survey with eight rows (`:1195-1230`); "Every measurement" table (`:1236-1262`); a one-line change in KiDS's S8 (`:1264`); bullet guide (`:1267-1295`); links after the run (`:1297-1330`). Predictions are not listed.
- B1 Partly met. A reference exists and is already used: the paper's own sigma is placed beside the worked-out sigma (`:1228`, `:1248`), with the guide explaining why they differ (`:1280-1285`). Missing: no plain reading column ("close", "not the same") and it sits in the middle, not at the top.
- B2 Partly met: one shared bullet list; not per table; no "why it matters".
- B3 Partly met: "Look closer at" (`:1166`) follows the learner and has the published sigma column in the same table; no "What your numbers show" paragraph. Optional; leave as is unless the owner wants it.
- B4 Not met: no predictions block in the results.
- B5 Met (numbers from `runLumpiness`, `lumpiness.ts:134`); no check-up functions.

## Rule C
- C1 Partly checked: aria labels list the elements (`:257`, `:396`, `:551`, `:1037`); I did not verify each SVG text.
- C2 Met (read): sky blue = microwave background, orange = surveys.
- C3 Met: "How to read this drawing/diagram" under the illustration and Pictures 1 to 3 (`:327`, `:471`, `:620`, `:1101`).
- C4 Met (read): elements, units (S8, sigma) explained.
- C5 Met: "A worked moment, with real numbers" in Pictures 1 to 3 (`:497`, `:644`, `:1136`); Picture 1's moment gives KiDS-1000's sigma (about 3), which Prediction 1's text already states (`:954`).
- C6 Not met: "What to look for, and what it would mean:" with two-part items (`:350`, `:502`, `:648`, `:1143`); no "Why it matters" (0 hits).
- C7 Met (read) with one note: Picture 3 and the "How the values changed" stage name might let a learner see Prediction 1's answer once drawn; that is by design (after the run).
- C8 Met (read): "Words and formulas" panel (`:65-70`).

## Rule D
- D1 Met (read): status "Contested", plain intro. 
- D2 Partly met: C6.
- D3 Met: ESA weak lensing page from the start (`:917`); papers and survey pages "kept back until results" (`:908`, `:1297-1330`) because their summaries state the answers (a §12 reason, recorded). Note: only one plain official page (ESA) appears before the run; no plain page for S8 or cosmic structure; no recorded 3(c) gap.
- D4 Partly met: see B.

## Other findings
- O1: none found; the "kept back" links list is a deliberate §12 choice (`:908`).
- O2: Experiment 3's intro/Prediction 1 states KiDS-1000 was "about 3 sigma below" (`:954`) - consistent with the module; not verified against the module here. The review notes in `CLAUDE.md` mention the title still hints at Prediction 1.

## What an update would touch, and its size (O3, O4)
`LumpinessExperiment.tsx`, `LumpinessTutor.tsx`, `src/physics/lumpiness.ts` and test, the specification. Size **Medium**.

## Not checked
Rendering, narrow widths; all SVG label texts; the tutor's explanation body; test contents; whether the 3-panel illustration's labels are complete.
