# Gap report: Cosmic Horizons Experiment 7 (Do we need dark matter, or does gravity change? Wide binary stars)
Date: 2026-11-02 | Specification: `docs/experiments/cosmic-horizons/07-wide-binary-stars.md` | Components: `src/components/WideBinariesExperiment.tsx` (1486 lines), `WideBinariesTutor.tsx` | Physics module: `src/physics/wideBinaries.ts` (+ `.test.ts`, 25 cases) | Status: read-only, nothing changed

## Summary
Older-rule experiment and the nearest of the seven to the newer standard on captions: its look-for items already use "Look at / What it means / Why it matters" (`WideBinariesExperiment.tsx:631-651`). It has an illustration, two predictions, Picture 1 (orbital speed against separation, with a blue dot for the pair of Prediction 1), Picture 2 (a toy model of hidden triples, with a purple dot starting at the example of Prediction 2), Picture 3 (published boost factors), controls ("Choose a pair", "How many pairs are really triples?"), Tables 1a, 1b and 2, a tutor and post-run links. Gaps: no guess marks or source lines; **no reading guide for the results** (only a one-line "These tables only report numbers", `:1384`); no check-up, per-table notes or prediction block. Size **Large** (reading guide for three tables plus marks on two pictures).

## Predictions found (A0)
| # | Question | Answers | Where the answer lives on a picture |
|---|---|---|---|
| 1 | "how much faster?" for a pair at 10,000 AU with a 1.4 times stronger pull (`WideBinariesExperiment.tsx:1008-1018`) | none / about 20 / about 40 / about twice as fast (`:79-84`); state `boostPrediction` (`:656`) | Picture 1: the blue dot marks the pair of Prediction 1 (`:1127`); a white band on the speed axis |
| 2 | "how much can hidden stars fake?" 1 in 5 triples moving twice as fast (`:1021-1031`) | about 2 / about 20 / about 100 percent (`:85-89`); state `contaminationPrediction` (`:657`) | Picture 2: the purple dot at (20 percent, 2 times) and its "fake boost" line; a white marker on the percent scale |

## Rule A
| Item | Result | Evidence | Gap |
|---|---|---|---|
| A0 | Met | above | |
| A1 | Met (read) | pictures and tables read `mass`, `separationLog`, `fractionPercent`, `factor`; predictions only feed buttons and tutor | |
| A2 | Not met | no white mark found | marks on Pictures 1 and 2 |
| A3 | Not met | both categorical ranges (`boostRange`, `contaminationRange`), so sized bands are possible | |
| A4 | Not met | Picture 2 appears at stage 4 (`:1163`) | draw each mark with its picture |
| A5 | Met | both have a picture | |
| A6 | Not met | no source line; the pictures say "not real data" for Picture 2 (`:1172-1175`) and "not a model" for Picture 3 (`:1254`); Picture 1's mass is "this experiment's own choice, not a measured pair" (`:298`) | measured (Gaia, Chae, Saad and Ting etc. in Picture 3), calculated here (Picture 1 speeds), imagined (the toy hidden-triple model, the chosen pair) |
| A7 | Partly met | note: "Your predictions stay as they are" (`:1332`); "Your predictions are not marked here" (`:1385`) | no white-mark wording |
| A8 | Not met | `boostRange`, `contaminationRange`, `speedBoostPercent`, `fakeBoostPercent`, `runWideBinaries` exist (`wideBinaries.ts:204-276`); missing: band edges and marker positions | add + tests |
| A9 | Partly met | explanation marks predictions (`WideBinariesTutor.tsx:164-178`) | prompts naming marks |
| A10 | Met as current state | "recorded and not marked here" (`:1082`); "Your predictions stay as they are" (`:1332`); "Your predictions are not marked here" (`:1385`) | |

## Rule B
B0: Table 1a "your pair" (`:1388`); Table 1b "hidden triples (your choice)" (`:1408`); Table 2 "the published results", six columns (`:1432-1450`) with a 12px note that the figures "are not always directly comparable"; links after the run (`:1454-1480`). **No reading guide**, predictions not listed.
- B1 Not met. A reference exists in Table 2 itself (published γ values against the 1.4 line and Newton's 1; `GAMMA_MOND_WIDE_BINARY` `:18`); a check-up could put "1.4 expected" beside the published values with a plain reading. Table 2 warns the rows are not comparable, so the reading would need care (the owner's rule: no invented cut-offs).
- B2 Not met: no "What this table tells us" notes; Picture 3's caption has an everyday comparison and worked moment (`:1301-1312`) but the tables do not.
- B3 Partly met: Tables 1a and 1b follow the controls; the first control note says what changes (`:1331`, `:1363`). Optional.
- B4 Not met.
- B5 Met: `runWideBinaries`, `speedBoostPercent`, `fakeBoostPercent` (`wideBinaries.ts`).

## Rule C
- C1 Partly checked: aria labels (`:108`, `:212`, `:340`, `:448`) and the captions; not each SVG text.
- C2 Met (read): Newton's line versus stronger pull; purple dot follows the controls (`:1208`).
- C3 Met: under the illustration and Pictures 1 to 3 (`:880`, `:1109`, `:1172`, `:1254`).
- C4 Met (read): AU, separation, MOND terms defined (`:871`, `:525-539`).
- C5 Met: "A worked moment" in Pictures 1 to 3 (`:1147`, `:1222`, `:1301`).
- C6 Met in form: every item is Look at / What it means / Why it matters (`:643-648`; lists `lookForPicture1`, `lookForPicture3`). Not checked: whether each item appears only after its feature is drawn. Picture 2 uses a paragraph rather than the three-part list at `:1239`: partly not read.
- C7 Met (read): the comment says the guide does not give the square-root rule or the signal size (`:1004`). Look-for item `:762` says "the effect ... is small: about a fifth of the speed", which is close to Prediction 1's answer (a 1.4 times stronger pull gives about 18 percent faster, from `speedBoostPercent`); it sits in the meaning part, shown after the run per the comment at `:632`.
- C8 Met (read): "Some new words" (`:940`), panel.

## Rule D
- D1 Met (read): status line, plain intro, dark matter versus dark energy paragraph (added at the owner's request per `CLAUDE.md`).
- D2 Mostly met: C6 satisfied; check C6 timing.
- D3 Met: NASA multiple star systems, ESA Gaia and CERN dark matter from the start (`:987-998`); the four papers and others after the run (`:626-630`, `:1454-1480`). No plain official page on MOND (recorded in `CLAUDE.md`'s open items).
- D4 **Not met**: no reading guide for the Results.

## Other findings
- O1: none against the specification found beyond the reading guide, which the spec predates.
- O2: Picture 2 is described as a "what if" (`:1172`), the wording the owner later asked to avoid for controls (§14); this is a picture description, not a control, so report only. Also the Picture 1 blue dot already "marks the pair described under the picture" (`:1127`), so a learner might read it as a guess mark; a white "YOUR GUESS" mark must be clearly distinct. Table 2's note that results "are not always directly comparable" matters for any check-up design.

## Rule E and re-read additions (2026-11-03)
- **E1 to E3 Not met.** No Parts: after the introduction the page runs on in one column. No coloured lines, headings or leads.
- **The controls already change Part 1 pictures.** "Choose a pair" moves Picture 1's dots and Table 1a; "How many pairs are really triples?" moves Picture 2's line and dot and Table 1b. Under the rule a learner's own setting is pink.
- **Colour clashes found.** The stronger-pull colour (rose) is too close to pink; Picture 2's toy line and dot were purple (the imagined sample); Picture 2's ring was white, and white now means only a guess. Fixed by recolouring (orange, pink, yellow) and rewording the captions.
- **Both predictions are about fixed cases** (1.5 Suns at 10,000 AU; 1 pair in 5 at twice as fast), so their marks must not move with the controls: each case is drawn as a violet imagined mark and the guess as a white diamond.
- **B1 reference.** The published boost factors set beside the two lines they are read against (1 and 1.4) give the check-up; the owner's rule on comparability means the reading says only which line each published range includes. No published-value column.
- **Defaults used.** The owner approved all default recommendations and wording in advance (2026-11-03).

## What an update would touch, and its size (O3, O4)
`WideBinariesExperiment.tsx`, `WideBinariesTutor.tsx`, `src/physics/wideBinaries.ts` and test, the specification. Size **Large** (reading guide for three tables, marks on two pictures).

## Not checked
Rendering; narrow widths; all SVG label texts; whether look-for items are gated to drawn features; the Picture 2 look-for items; tutor explanation body; test contents.
