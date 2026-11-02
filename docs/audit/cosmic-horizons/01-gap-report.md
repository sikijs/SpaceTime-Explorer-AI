# Gap report: Cosmic Horizons Experiment 1 (Two measurements of the expansion rate: the Hubble tension)
Date: 2026-11-02 | Specification: `docs/experiments/cosmic-horizons/01-hubble-tension.md` | Components: `src/components/HubbleTensionExperiment.tsx` (1092 lines), `HubbleTensionTutor.tsx` | Physics module: `src/physics/hubbleTension.ts` (+ `hubbleTension.test.ts`) | Status: read-only, nothing changed

## Summary
Older-rule experiment. It has two predictions, three real pictures, a Results panel of three tables (one with a "What if the error bars were bigger?" control), a "How to read these results" bullet guide, a tutor and a links list (papers plus NASA and ESA pages). Biggest gaps: no guess marks on any picture, no check-up table, no per-table "What this table tells us" notes, no tag on result rows for the predictions, and no three-part "Look at / What it means / Why it matters" items. Size: **Medium** (marks on Pictures 2 and 3-style panels plus a check-up and notes).

## Predictions found (A0)
| # | Question | Answers | Where the answer lives on a picture |
|---|---|---|---|
| 1 | "how many sigma apart?" (`HubbleTensionExperiment.tsx:513-522`) | 4 range buttons: under 2, 2-4, 4-6, over 6 (`:51-56`); state `sigmaPrediction` (`:161`) | Picture 2, the numbered ticks along the gap (a sigma count); no mark exists |
| 2 | "what did the Webb telescope change?" (`:523-536`) | lower / about the same / higher (`:59-63`); state `webbPrediction` (`:162`) | No picture carries the Webb result (it appears only as `WEBB_CEPHEID_RESULT` text in the tutor) |

## Rule A
| Item | Result | Evidence | Gap and what would be needed |
|---|---|---|---|
| A0 | Met (listed) | above | |
| A1 | Met | Pictures and tables read `late`, `shown`, `stretch` only (`:600-940`, `:953-1075`); the predictions are read only at `:1027-1034` and by the tutor | none |
| A2 | Not met | no white mark or "YOUR GUESS" box in any SVG (`grep` found none) | P1: a band on Picture 2's sigma ticks. P2: needs a place (see A5) |
| A3 | Not met | no mark. P1 is a range, so a band would follow the guess; P2 is categorical, so a marker is needed with a caption saying it is only a marker | |
| A4 | Not met (N/A until marks exist) | stage logic exists (`stage >= n`), Picture 2 appears at stages 4 and 5 (`:797`) | the P1 band would wait until the ticks (stage 5) are drawn |
| A5 | Not met | P2's quantity (the Webb shift of the Cepheid values) has no picture | add a small panel to Picture 1 or 3 (nearest: Picture 1, number line) with the Hubble and Webb Cepheid result on its own scale, showing -0.01 ± 0.03 mag from `WEBB_CEPHEID_RESULT` (`hubbleTension.ts:130`) |
| A6 | Not met | no "Where the real picture comes from" line under any picture (the captions describe sources only in passing, e.g. `:650`) | one line per marked picture: measured (Planck, SH0ES etc.), calculated here (gap, sigma, Hubble time), imagined (none) |
| A7 | Partly met | Intro says "You are not graded while you predict. The tutor will compare your predictions" (`:403-406`); the control note says the pictures stay as they were (`:1075-1080`); nothing says guesses are drawn in white or that predictions never change the real pictures | wording to add |
| A8 | Not met | module has `sigmaRange`, `webbEffect`, `tensionSigma`, `hubbleTimeBillionYears` (`hubbleTension.ts:51-141`). Missing: a function turning a range choice into a sigma band (lo, hi) and an x position, and one for the Webb marker | add functions and tests (tests: 39 cases in `hubbleTension.test.ts`) |
| A9 | Partly met | Tutor "compare" restates the guesses (`HubbleTensionTutor.tsx:95-96`) and marks them only in the explanation (`:138-147`, comment `:140`); prompts do not point to marks (none exist) | prompts to name "YOUR GUESS" marks |
| A10 | Met as current state | "Your predictions are recorded and not marked here" (`HubbleTensionExperiment.tsx:594`, `:1027`); "The three pictures stay as they were, drawn with the published error bars" (`:1075-1080`). No sentence that guesses never change results | current older-rule wording |

## Rule B
B0 tables: (1) a seven-row facts table (early, chosen late, gap, combined give-or-take, sigma, two Hubble times, `:957-975`); (2) "Every nearby-universe measurement" table (`:980-1010`); (3) "What if the error bars were bigger?" control (`:1015-1025`); a "Your predictions" list (`:1027-1034`); a "How to read these results" bullet list (`:1037-1073`).
| Item | Result | Evidence | Gap |
|---|---|---|---|
| B1 | Not met | no check-up | A real reference exists: the specification's sources (Planck 67.4 ± 0.5, SH0ES 73.04 ± 1.04, the 5-sigma convention, Webb -0.01 ± 0.03 mag). A check-up could set "published sigma (5 for SH0ES)" beside this page's calculated sigma, since the page itself warns the two can differ (`:1060`) |
| B2 | Partly met | one shared bullet list explaining each row (`:1037-1073`), good plain wording and numbers, but not headed "What this table tells us", not under each table, and no "why it matters" per item | split into per-table notes |
| B3 | Partly met | the ×1.5 to ×5 control exists (`:1015`) but is worded "What if" (`:1015`, `:1069`), which CLAUDE.md §14 says the owner found confusing; it has no published-value column or "What your numbers show" paragraph | reword to "trial values"; decide whether the comparison column is wanted (optional) |
| B4 | Partly met | guesses listed (`:1027-1034`) without the question text or table row tag | add question, row tag |
| B5 | Met | all numbers from `runTensionExperiment` (`hubbleTension.ts:95`) | comparison/check-up functions would be new |

## Rule C
| Item | Result | Evidence | Gap |
|---|---|---|---|
| C1 | Met (read) | Picture 1 labels each dot (`DotAndBar`, `:624`), gap label (`:615`); Picture 2 labels both hills, gap, doubt, ticks (`:735-790`); Picture 3 labels bars, real-age line, axis (`:858-898`) | |
| C2 | Met | blue = early, orange = late throughout; the learner's choice changes the drawing | |
| C3 | Met | "How to read this diagram" under all three (`:650`, `:797`, `:903`) | |
| C4 | Met | every element listed with a meaning, units (km/s/Mpc) defined, stages stated ("appears in the fourth and fifth stages", `:799`), bullets used | |
| C5 | Partly met | Picture 1 uses an invented 120.0 / 121.0 example (`:662`, `:690`), not the live numbers; Picture 3 uses 70 and 73 (`:920`); Picture 2 the same invented example (`:830`) | a worked moment with the real numbers of the chosen measurement |
| C6 | Not met | items are "what it looks like" with meaning, but there is no "Why it matters" part (zero hits for "why it matters"); they are headed "What to look for, and what it would mean" (`:693`, `:835`, `:930`); the Picture 1 list is shown only once all measurements are drawn (`:694`) | rewrite each item into three parts |
| C7 | Met (read) | the captions avoid saying the sigma or the Webb result (comment `:236-237`) | |
| C8 | Met (read) | sigma, Mpc, error bar, bell curve defined in the intro and panel (`:243-440`, `ReferencePanel` `:464`) | |

## Rule D
- D1 Met (read): status line "as of October 2026: Contested" (`:229`); long plain-language introduction with a speedometer comparison (`:245-262`).
- D2 Partly met: same as C4 to C6 (no three-part items).
- D3 Met: "Want to know more?" with five arXiv papers (`:415-440`) and NASA and ESA plain pages (`:447-457`), visible from the start. The ESA page is a 2013 release (the page says so, `:455`).
- D4 Partly met: reading guide exists but lacks check-up, per-table notes and prediction tags (Rule B).

## Other findings
- O1: none found against the specification. The specification (`01-hubble-tension.md:128`) defines the two predictions as built.
- O2: Prediction 1 changes with the chosen measurement and the page clears both predictions on change (`:199`, `:482`); the title "Why Don't They Agree?" hints at Prediction 1's answer (§12), already approved by the owner. The Results intro says the numbers "do not say why" (`:957`) - fine. The "What if" wording (`:1015`) conflicts with the owner's later preference.

## What an update would touch, and its size (O3, O4)
`HubbleTensionExperiment.tsx`, `HubbleTensionTutor.tsx` (prompts), `src/physics/hubbleTension.ts` and `.test.ts` (band, Webb marker, check-up rows), the specification, and any caption wording. Size **Medium**.

## Not checked
Browser rendering, narrow widths, keyboard use; the three tables' exact numeric correctness; tutor explanation text beyond line 150; physics test contents were counted, not read.
