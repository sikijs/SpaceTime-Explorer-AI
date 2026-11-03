# Gap report: Cosmic Horizons Experiment 4 (Can the universe weigh a neutrino? DESI's limit)
Date: 2026-11-02 | Specification: `docs/experiments/cosmic-horizons/04-can-the-universe-weigh-a-neutrino.md` | Components: `src/components/NeutrinoMassExperiment.tsx` (1320 lines), `NeutrinoMassTutor.tsx` | Physics module: `src/physics/neutrinoMass.ts` (+ `.test.ts`, 32 cases) | Status: read-only, nothing changed

## Summary
Older-rule experiment: relic-neutrino illustration, two predictions, Picture 1 (timeline by redshift), Picture 2 (neutrinos' share bar and smoothing line), Picture 3 (floors and ceilings number line), a "Try a different total mass" control, two tables (a step-by-step arithmetic table, and a floors/ceilings table with "Against the normal / inverted floor" columns), a bullet guide, a tutor and post-run links. Biggest gaps: no guess marks and source lines, no check-up or per-table notes, no prediction block in results, one-line "What to look for" items with no meaning or significance. Also a design wrinkle: the predictions assume a fixed 0.06 eV total but the real marker moves with the control. Size **Medium**.

## Predictions found (A0)
| # | Question | Answers | Where the answer lives on a picture |
|---|---|---|---|
| 1 | "when do the neutrinos turn heavy?" for a total of 0.06 eV (`NeutrinoMassExperiment.tsx:575-587`) | before / after the microwave background was released (`:161-164`); state `timingPrediction` (`:199`) | Picture 1 (timeline): the violet marker versus the sky-blue release marker; a marker to the left or right of the release |
| 2 | "how much room is there?" between the floor and DESI's maximum (`:590-601`) | plenty / very little / none (`:165-169`); state `roomPrediction` (`:200`) | Picture 3 (number line): the gap between the first green floor line and DESI's orange bar end; a white band showing the guessed gap |

## Rule A
| Item | Result | Evidence | Gap |
|---|---|---|---|
| A0 | Met | above | |
| A1 | Met (read) | pictures and tables read `result`, `totalMass` and `BOUNDS`; predictions only for buttons and tutor | |
| A2 | Not met | no white mark in the file | marks on Pictures 1 and 3 |
| A3 | Not met | both are categorical; P2's three bands are sized (ratio 2, 1.2), so a band is possible; P1 would be a marker with a "marker only" caption | |
| A4 | Not met | Picture 1 stage 2 draws the violet marker (`:805`); Picture 3 later | draw each mark after its feature |
| A5 | Met | both quantities already have a picture | |
| A6 | Not met | no source line under pictures; the illustration is labelled "not data" (`:398`) | measured (oscillation experiments, DESI, KATRIN), calculated here (heavy redshift, share, smoothing), imagined (the relic neutrino illustration; the chosen total mass) |
| A7 | Partly met | note at the control says what changes and "Your predictions stay as they are" (`:1123-1127`); no white-mark wording | wording |
| A8 | Not met | `heavyBeforeRelease`, `roomRange`, `roomUnder`, `heavyRedshift` exist (`neutrinoMass.ts:96-154`); missing: positions for the marks and band edges | add + tests |
| A9 | Partly met | explanation marks the predictions (`NeutrinoMassTutor.tsx:148-159`) | prompts naming marks |
| A10 | Met as current state | "recorded and not marked here" (`:651`); "Your predictions stay as they are" (`:1127`); "does not change ... your predictions" (`:1251`) | |

## Rule B
B0: table 1 "For a total of X eV" with Quantity / Value / How worked out (`:1151-1181`); table 2 "Every floor, ceiling and limit" (`:1185-1217`); a bullet guide (`:1219-1255`); links after the run (`:1257-1300`). Predictions not listed.
- B1 Partly met. A reference exists (published floors from the oscillation gaps and the ceilings); the second table already compares each ceiling with the two floors ("Against the normal floor", `:1190-1191`), which is the check-up in spirit, but there is no plain-word reading row ("very little room") near the top.
- B2 Partly met: one bullet list explaining rows and columns (`:1222-1254`), good numbers, no "why it matters" per table.
- B3 Partly met: "Try a different total mass" exists; no published-value column (none exists).
- B4 Not met.
- B5 Met: `runNeutrinoMass` (`neutrinoMass.ts:183`) and `roomUnder`; no check-up functions.

## Rule C
- C1 Partly checked: aria labels and keys (`:101`, `:684`, `:833`, `:983`) and caption lists; not each SVG text.
- C2 Met: violet marker (this total) versus sky-blue release; a control changes it. The grey circle for "one neutrino carries all" (`:1233`).
- C3 Met: under the illustration and Pictures 1 to 3 (`:398`, `:766`, `:928`, `:1072`).
- C4 Met (read): bullets define z, eV, floor, ceiling.
- C5 Met: "A worked moment" in Pictures 1 to 3 (`:810`, `:957`, `:1103`), with live numbers.
- C6 Not met: "What to look for" is a single sentence per picture listing what to look at only (`:819`, `:967`, `:1113`); no meaning, no significance.
- C7 Met (read): the comment says it does not reveal what was predicted (`:760-762`). The run total is DESI's limit and the stage 2 worked moment gives its heavy redshift - shown after the run, so acceptable.
- C8 Met (read): "Some new words" and the panel (`:484`).

## Rule D
- D1 Met (read).
- D2 Partly met: C6.
- D3 Met: Fermilab (three pages), CERN, ESA/Planck, ESA/Euclid BAO, NASA quasars, DESI and KATRIN pages from the start (`:521-565`); papers after the run (`:1257-1300`).
- D4 Partly met: see B.

## Other findings
- O1: none found.
- O2 (design wrinkle, report only): the predictions use a fixed 0.06 eV total (`neutrinoMass.ts:74`, "Prediction 1 states it") while the run's real total is DESI's limit (`NeutrinoMassExperiment.tsx:150`) and the control changes Picture 1's marker; a guess mark for Prediction 1 would need to say which total it refers to. Also Picture 1's "What to look for after Run" sentence (`:819`) is shown at the picture, before the marker exists, in the idle state (shown with the explanation; not verified).

## Rule E and re-read additions (2026-11-03)
- **E1 to E3 Not met.** No Parts. After the introduction the page runs on in one column: the relic-sea illustration, the two predictions, Run, three pictures, then (after the run) "Try a different total mass", the results card, the links and the tutor. No coloured lines, headings or leads.
- **The control already changes Part 1 pictures.** "Try a different total mass" (`NeutrinoMassExperiment.tsx:1121-1150`) moves Picture 1's violet turning-point marker and shaded stretches (`:700-760`), Picture 2's share bar and yellow dot (`:850-920`) and the first table. Picture 3 does not change (its axis stops at 0.2 eV, while the control offers up to 0.5). The moved marks are violet today. Under the rule a learner's own setting is pink; at the control's start value they show the real run (DESI's July 2026 limit, 0.0592 eV).
- **The two predictions use a fixed total of 0.06 eV** (`PREDICTION_TOTAL_MASS_EV`), not the control's total. A mark for Prediction 1 must say it is about 0.06 eV and must not move with the control.
- **O1 (conflict between the buttons and the module).** The button for Prediction 2 says "Plenty of room (the maximum is more than twice the minimum)" (`:167`) and the specification's Decision 6 default says the same ("plenty" is a ceiling more than twice the floor). The module's `roomRange` returns "plenty" for any ratio above 1.2 (`neutrinoMass.ts:~134`; specification line 142: "plenty otherwise"). A ceiling between 1.2 and 2 times the floor would be called "plenty" by the module but fit no button's words. The real answer (1.008) does not depend on it, but a guess band for "plenty" has to pick one of the two. Report only; the owner decides.
- **B1 reference.** The second table already sets each ceiling beside the two floors. A check-up can use the published floors (computed from the oscillation gaps, NuFIT 6.0) and ceilings: the DESI limit against the normal floor (1.008 times), against the inverted floor (below it), and the 2025 limit (1.09 times). Readings would be "more", "less" or "the same" only, with "below the floor" as a plain statement of fact. No cut-off invented. The gaps' numbers were taken from a search result and not read at the paper's table (a source gap recorded in the specification), which the page should keep saying.
- **B3.** Leave out a published-value column (decide per experiment, plan §7 item 1): no published reference exists for a trial total mass.
- **C6 note.** "What to look for" is one sentence per picture; each becomes three-part items, shown only once its feature is drawn (Picture 1's sentence currently sits before its marker exists).

## Decisions needed from the owner (before wording is drafted)
1. **Pink for the moved marks.** Turn Picture 1's violet turning-point marker and Picture 2's share bar and yellow dot (the marks that follow the control) pink, labelled "your total: X eV (it starts at DESI's limit)". Recommendation: yes, so pink always means the learner's setting.
2. **A Part 2 drawing.** A small chart on its own eV scale (0 to 0.5), with the two floors (green) and the main ceilings (orange) as in Picture 3, and a pink marker for the chosen total; under it three short rows (the redshift where the neutrinos turn heavy, their share of the matter, the smoothing of small clumps) with the DESI-limit value as a grey tick and the chosen total as a pink dot. Recommendation: yes.
3. **Prediction 1's marker.** A white marker beside the release marker on Picture 1, to its left for "before" and to its right for "after", with a YOUR GUESS box saying "for a total of 0.06 eV". It is only a marker, and it does not move with the control. Recommendation: yes.
4. **Prediction 2's band and the O1 conflict.** A white band on Picture 3 along the eV line for the ceiling you guessed ("no room": below the normal floor; "very little": from the floor to 1.2 times it; "plenty": above). Which threshold for "plenty"? (a) Change the button to "Plenty of room (more than 20 percent above the minimum)" to match the module and the specification's overall rule; (b) keep "more than twice" and change the module so that a ratio between 1.2 and 2 is a separate unnamed gap (not recommended: it leaves a ratio with no button). Recommendation: (a). It changes approved button wording, so it needs your approval line by line.
5. **Check-up rows.** The DESI July 2026 limit against the normal floor ("more", 1.008 times) and the inverted floor ("less", below it), the 2025 limit against the normal floor ("more", 1.09 times), and Planck 2018 + BAO against it ("more", about 2 times). Recommendation: yes.

## What an update would touch, and its size (O3, O4)
`NeutrinoMassExperiment.tsx`, `NeutrinoMassTutor.tsx`, `src/physics/neutrinoMass.ts` and test, the specification. Size **Medium** (Medium to Large with the Part 2 drawing and the new marks).

## Not checked
Rendering; narrow widths; all SVG label texts; tutor explanation body; test contents; formula sources.
