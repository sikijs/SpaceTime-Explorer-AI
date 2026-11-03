# Gap report: Cosmic Horizons Experiment 5 (How early can galaxies form? JWST's earliest galaxies, MoM-z14)
Date: 2026-11-02 | Specification: `docs/experiments/cosmic-horizons/05-how-early-can-galaxies-form.md` | Components: `src/components/EarliestGalaxiesExperiment.tsx` (1355 lines), `EarliestGalaxiesTutor.tsx` | Physics module: `src/physics/earliestGalaxies.ts` (+ `.test.ts`, 34 cases) | Status: read-only, nothing changed

## Summary
Older-rule experiment: a stretched-wave illustration, two predictions, three pictures (Picture 1 the wavelength scale, Picture 2 timelines, Picture 3 the count against models), a "Look at another galaxy" control with an imaginary-galaxy slider, two tables (a step-by-step table and a list of the four record holders, with a note on the count), a bullet guide, a tutor and post-run links. Biggest gaps: no guess marks or source lines, no check-up or per-table notes, no predictions block in the results, look-for items are unlabelled one-liners (a little meaning, little significance). Size **Medium**.

## Predictions found (A0)
| # | Question | Answers | Where the answer lives on a picture |
|---|---|---|---|
| 1 | "how early?" what share of the present age had passed (`EarliestGalaxiesExperiment.tsx:554-565`) | about 1 / about 2 / about 10 percent (`:176-180`); state `agePrediction` | Picture 2, the orange sliver in the top bar (share of the present age); a white band on that bar |
| 2 | "how many?" bright galaxies versus the models (`:567-578`) | fewer / same / a few times / about a hundred times (`:181-186`); state `countPrediction` | Picture 3, the log scale where the models are at 1 and the survey's dot at 182 (`NUMBER_DENSITY_EXCESS`); a white marker on the scale |

## Rule A
| Item | Result | Evidence | Gap |
|---|---|---|---|
| A0 | Met | above | |
| A1 | Met (read) | pictures and tables read `redshift`, `result`, `record`; predictions only feed buttons and the tutor | |
| A2 | Not met | no white mark in the file | marks on Pictures 2 and 3 |
| A3 | Not met | both are categorical ranges; P1's three share bands (under 1.5, 1.5-4, over 4 percent, `earliestGalaxies.ts:61-62`) can be drawn as sized bands; P2's four are ratio bands | |
| A4 | Not met | stages: the Picture 2 bar at stage 2 and 3, Picture 3 at the "How many were expected?" stage | draw after each feature |
| A5 | Met | both quantities have a picture | |
| A6 | Not met | no source line; the first illustration says it is "not data" (`:372`) | measured (spectra: Naidu 2025 and others), calculated here (age from the expansion model), imagined (the "imaginary galaxy" slider) |
| A7 | Partly met | note at the control says what changes and "Your predictions stay as they are" (`:1107-1110`) | no white-mark wording |
| A8 | Not met | `ageShareRange`, `countRange`, `shareOfPresentAge`, `NUMBER_DENSITY_EXCESS` exist (`earliestGalaxies.ts:45,99,121,132`); missing: band edges and marker positions | add + tests |
| A9 | Partly met | explanation marks the predictions (`EarliestGalaxiesTutor.tsx:141-153`) | prompts naming marks |
| A10 | Met as current state | "recorded and not marked here" (`:627`); "Your predictions stay as they are" (`:1109`); "does not change ... your predictions" (`:1278`) | |

## Rule B
B0: table 1 "For (galaxy), redshift z" with Quantity / Value / How worked out (`:1173-1210`); table 2 "The galaxies confirmed with a spectrum, and the count" plus "The count" paragraph (`:1215-1250`); a bullet guide (`:1252-1285`); links after the run (`:1287-1335`). Predictions not listed.
- B1 Partly met: references exist (the paper's age, 280 million years, against the model's figure; the published 182 times and the 100 times in ESA's announcement). The first table shows the paper's age for MoM-z14 beside the model's, with the gap (`:1196-1203`) and the count paragraph quotes both counts; there is no check-up table with plain readings.
- B2 Partly met: one bullet list (`:1255-1284`), explains rows, no "why it matters".
- B3 Partly met: the slider control exists; no published-value column.
- B4 Not met.
- B5 Met: `runEarliestGalaxies` (`earliestGalaxies.ts:154`) and `paperAgeGapPercent` (`:171`).

## Rule C
- C1 Partly checked: aria labels (`:100`, `:640`, `:817`, `:995`) and captions; not each SVG text.
- C2 Met: Picture 2 and the table follow the chosen galaxy; an imaginary galaxy is labelled wherever it appears (`:1285`).
- C3 Met: under the illustration and all three pictures (`:372`, `:737`, `:924`, `:1057`).
- C4 Met (read): terms redshift, Lyman-alpha, wavelength, nm defined.
- C5 Met: "A worked moment" in each (`:781`, `:959`, `:1082`).
- C6 Not met: "What to look for." is one sentence or two (`:794`, `:975`, `:1088`); only Picture 1's and 3's have "What it would mean" prose, no "Why it matters"; no separate Look at / What it means / Why it matters items.
- C7 Met (read): the comment says it does not give the age, share or count (`:550`). Note that Picture 3's caption says "the survey found far more bright galaxies than the models predicted" (`:1088-1090`), which gives Prediction 2's answer; it is shown at the "How many were expected?" stage, after the run starts, so acceptable.
- C8 Met (read): "Some new words" and the panel (`:424`).

## Rule D
- D1 Met (read): status line and plain intro.
- D2 Partly met: C6.
- D3 Met: NASA cosmological redshift, ESA/Webb spectroscopy and NIRSpec, NASA NIRCam from the start (`:512-542`); Zhang 2026 paper and an STScI 2019 release listed there (`:534`, `:539`); papers and announcements after the run (`:1287-1335`). The Lyman-alpha break has no plain official page (recorded as an open item in the specification, not as a 3(c) gap).
- D4 Partly met: see B.

## Other findings
- O1: none found against the specification. Specification status text says "Strong evidence ... Open".
- O2: the arXiv numbers cited in the intro and results include IDs such as `2609.28257`, `2610.12121` (`:534`, `:1306`) that cannot be verified from this audit; the page's own status says "October 2026". Not checked against sources.

## Rule E and re-read additions (2026-11-03)
- **E1 to E3 Not met.** No Parts. After the introduction the page runs on in one column: the stretched-wave illustration, the two predictions, Run, Pictures 1 to 3, then (after the run) "Look at another galaxy", the results card, the links and the tutor. No coloured lines, headings or leads.
- **The control already changes Part 1 pictures.** "Look at another galaxy" (`EarliestGalaxiesExperiment.tsx:1104-1160`) moves Picture 1's stretched Lyman-alpha marker, Picture 2's orange sliver and the zoomed bar's run marker (`:250-255`, `:700-1000`) and the first table. Picture 3 and the second table do not change. Under the rule a learner's own setting is pink. At the start value (MoM-z14) the marks show the real run, so the pink marks need a clear rule for what they show then.
- **The two predictions are about MoM-z14 only.** A guess mark must say so and must not move with the control (an imaginary galaxy has no published age or count to compare).
- **Imagined versus own setting.** The control offers real record holders (measured) and an imaginary galaxy (imagined). Imaginary stays labelled "imagined"; a chosen record holder is the learner's own setting (pink). Decision 1 asks how to colour each.
- **Prediction 1 is a sized band, Prediction 2 a ratio band.** P1: "about 1 / 2 / 10 percent" are ranges (under 1.5, 1.5-4, over 4 percent of the present age, `earliestGalaxies.ts:61-62`), drawn as a white band on Picture 2's bar. P2: "fewer / same / a few times / about a hundred times" are ratio bands against the models' 1, drawn on Picture 3's log scale where the survey's dot is at 182. The edges of the "a few times" and "about a hundred times" bands are not defined in the module (the module has `countRange`, `:99`); the owner needs to confirm them (Decision 3).
- **B1 reference.** A check-up can use the paper's age for MoM-z14 (about 280 million years) against the model's (`paperAgeGapPercent`, `:171`; the first table already shows the gap) and the published count (182 times) against ESA's "about 100 times". Readings "close", "the same", "more" or "less" only; no invented cut-off. The paper's figures come from the specification's source table.
- **B3.** Leave out a published-value column (decide per experiment, plan §7 item 1): no published reference exists for an imaginary galaxy.
- **C6 note.** "What to look for" is one or two sentences per picture; each becomes three-part items, shown only once its feature is drawn (Picture 2's look-for line mentions stage 4 features only when they are drawn, `:976-977`, which is already staged).
- **Naming.** Learner-facing text says "Look at another galaxy" and "imaginary galaxy"; the code uses `whatIf` internally only (not shown to the learner).

## Decisions needed from the owner (before wording is drafted)
1. **Colours for the moved marks.** Turn the marks that follow the control (Picture 1's stretched marker, Picture 2's sliver and run marker) pink and label them "your galaxy: X (it starts at MoM-z14)", while an imaginary galaxy keeps its own "imagined" label in another colour? Recommendation: yes: pink for a chosen record holder and for the slider's galaxy, with "imagined" added for the slider's.
2. **A Part 2 drawing.** A small chart in Part 2 of the chosen galaxy's redshift on a 0 to 30 scale, with the four record holders as grey ticks and a pink marker for the choice, and rows for its age and share of the present age. Recommendation: yes (small), or leave the control moving Part 1's pictures only.
3. **Prediction bands.** Confirm the edges for Prediction 2's four answers on Picture 3's scale (for example "same" = 1 times, "a few times" = 2 to 10, "about a hundred times" = 50 to 500; all are proposals), and that Prediction 1's white band uses the module's 1.5 and 4 percent edges.
4. **Check-up rows.** MoM-z14's age (paper, about 280 million years) against the model's, and the count (182 times published, about 100 times in the ESA announcement). Recommendation: yes.
5. **The unverified arXiv IDs (O2).** Check the cited IDs against the sources before the wording is approved. Recommendation: yes; fetch them in Step 2.

## What an update would touch, and its size (O3, O4)
`EarliestGalaxiesExperiment.tsx`, `EarliestGalaxiesTutor.tsx`, `src/physics/earliestGalaxies.ts` and test, the specification. Size **Medium**.

## Not checked
Rendering; narrow widths; all SVG label texts; tutor explanation body; test contents; the imaginary-slider edge behaviour.
