# Gap report: Cosmic Horizons Experiment 6 (Where is the dark matter? What a search that finds nothing teaches: LZ)
Date: 2026-11-02 | Specification: `docs/experiments/cosmic-horizons/06-where-is-the-dark-matter.md` | Components: `src/components/DarkMatterSearchesExperiment.tsx` (1142 lines), `DarkMatterSearchesTutor.tsx` (not Cosmology Experiment 4's `DarkMatter*`) | Physics module: `src/physics/darkMatterSearches.ts` (+ `.test.ts`, 28 cases) | Status: read-only, nothing changed

## Summary
Older-rule experiment: a detector illustration, two predictions, Picture 1 (chance of seeing nothing against events expected), Picture 2 (limit against live days), Picture 3 (sigma bars), controls (strength, exposure and background sliders, and "How many places did you look?"), Table 1 (your own search) and Table 2 (published results) and a tutor. **There is no "How to read these results" guide and no check-up at all**: the only explanation is Table 1's "How it is worked out" column. Other gaps: no guess marks or source lines, no predictions block in results, one-line look-for items. Size **Medium to Large** (a new reading guide is needed in addition to marks); I rate **Large**.

## Predictions found (A0)
| # | Question | Answers | Where the answer lives on a picture |
|---|---|---|---|
| 1 | "how many events?" for a strength ten times below the limit and ten times the exposure, no background (`DarkMatterSearchesExperiment.tsx:538-549`) | about 0.23 / about 2.3 / about 23 (`:67-71`); state `countPrediction` (`:272`) | Picture 1 (curve of the chance of no events against expected events): a marker on the horizontal axis at the guessed count |
| 2 | "how sure?" the global significance versus 3.4 sigma (`:552-562`) | lower / the same / higher than 3.4 (`:72-76`); state `effectPrediction` (`:273`) | Picture 3: the last yellow bar (global) against the other yellow bar (3.4 local); a white marker beside it (categorical) |

## Rule A
| Item | Result | Evidence | Gap |
|---|---|---|---|
| A0 | Met | above | |
| A1 | Met (read) | pictures and tables read `strength`, `exposure`, `tries`, `mine`; predictions only feed buttons and the tutor (`:1128-1138`) | |
| A2 | Not met | no white mark in the file | marks on Pictures 1 and 3 |
| A3 | Not met | both categorical; P1's three values can be placed exactly (0.23, 2.3, 23 on the axis); P2 would be a marker | |
| A4 | Not met | Picture 3's yellow bars appear in stage 5 (`:940`) | draw P2's marker at stage 5 |
| A5 | Met | both have a picture | |
| A6 | Not met | no source line; the illustration is "not a plan of the real detector" (`:399`) | measured (LZ, XENONnT, PandaX), calculated here (the Poisson chance, the global sigma illustration), imagined (strength and exposure sliders, the "grows" background) |
| A7 | Partly met | note at the controls: "Your predictions stay as they are" (`:970`) | no white-mark wording |
| A8 | Not met | `countRange`, `globalEffect`, `expectedEvents`, `globalSigma`, `LZ230616` exist (`darkMatterSearches.ts:62,120,150-187`); missing: marker positions | add + tests |
| A9 | Partly met | explanation marks predictions (`DarkMatterSearchesTutor.tsx:149-162`) | prompts naming marks |
| A10 | Met as current state | "recorded and not marked here" (`:610`); "Your predictions stay as they are" (`:970`) | |

## Rule B
B0: "Table 1: your own search" (7 rows with a "How it is worked out" column, `:1016-1052`); "Table 2: the published results" (7 rows plus one that follows the learner's places-looked setting, `:1055-1098`); links after the run (`:1098-1120`). **No reading guide**; predictions not listed.
- B1 Not met. A real reference exists: published sigmas (LZ 4.5 boron-8, XENONnT 2.73, PandaX-4T 2.64 and the event's 3.4 local and 2.6 global, `:37,43`); Table 2 lists them but without an "expected versus found" reading, and the table's learner row (`:1085-1094`) compares with `TRIES_FOR_LZ_GLOBAL`.
- B2 Not met: no note under either table; only a 12px footnote about the background rows (`:1050`).
- B3 Partly met: Table 1 follows the controls; "Table 2" has a row that follows "Places looked", and the text says "about N places give the published number" (`:1008`), which is a reference of sorts.
- B4 Not met.
- B5 Met: values from `runDarkMatterSearches` (`:187`).

## Rule C
- C1 Partly checked: aria labels (`:97`, `:635`, `:756`, `:885`) and captions; not each SVG text.
- C2 Met (read): green ring and marker follow the sliders.
- C3 Met: "How to read this drawing" and "How to read Picture 1/2/3" (`:399`, `:711`, `:832`, `:934`).
- C4 Met (read): terms limit, sigma, live days, tonne-years explained.
- C5 Met: "A worked moment" (`:737`, `:864`, `:951`).
- C6 Not met: "What to look for." is one sentence listing things, without meaning or significance (`:743`, `:872`, `:956`).
- C7 Met (read): the comment says the guide does not give the sigma values (`:30`, `:534`). Picture 3's caption says boron-8 sigma 4.5 in a worked moment (`:951`), which is not Prediction 2's answer.
- C8 Met (read): "Some new words" and panel (`:452`).

## Rule D
- D1 Met (read).
- D2 Partly met: C6.
- D3 Met: CERN and NASA dark matter pages, the LZ site, SLAC and Imperial releases from the start (`:505-526`); papers after the run (`:1098-1120`).
- D4 **Not met**: no reading guide for the Results (B1 and B2 are missing).

## Other findings
- O1: none found against the specification beyond the missing reading guide, which the spec predates (`CLAUDE.md` §14 "Reading the Results" was set 2026-10-22; Experiments 1 to 11 were not given it).
- O2: Prediction 1 is about a fixed case (0.1 times the limit, 10 times the exposure) while "Try your own search" moves the real green ring, so a P1 mark and the control would need to say they are about different cases. The page states the strength in "units of today's limit" (`:967`).

## What an update would touch, and its size (O3, O4)
`DarkMatterSearchesExperiment.tsx`, `DarkMatterSearchesTutor.tsx`, `src/physics/darkMatterSearches.ts` and test, the specification. Size **Large** (marks on two pictures plus a new reading guide: check-up, notes under two tables, prediction block).

## Not checked
Rendering; narrow widths; SVG label texts; tutor explanation body; test contents; the sigma-ladder function.
