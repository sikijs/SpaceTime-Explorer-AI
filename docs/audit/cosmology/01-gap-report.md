# Gap report: Cosmology Experiment 1 (Hubble's Law)
Date: 2026-11-02 | Specification: docs/experiments/cosmology/01-hubbles-law.md | Components: src/components/HubblesLawExperiment.tsx, HubblesLawTutor.tsx | Physics module: src/physics/hubblesLawExperiment.ts (+ .test.ts) | Status: read-only, nothing changed

## Summary
One picture (galaxy, Earth, a stretching wave), two predictions, a Results block of prose only (no tables), a 3-question tutor plus a five-point explanation. The Results block itself tells the learner "your prediction was right / off this time", which §14 reserves for the tutor. No guess marks, no check-up, no reading guide, no worked moment in the caption, caption has no Look at / Means / Matters items. The "what the guess is about" is hypothetical ("twice as far"), so a mark needs a small extra panel. Size: **M**.

## Predictions found (A0)
| # | Question | Answers | Where the answer lives on a picture |
|---|---|---|---|
| 1 | If Galaxy A is twice as far as Galaxy B, how does A's recession speed compare? (HubblesLawExperiment.tsx:276) | Twice as fast / The same / Half as fast; state `speedPrediction`, locked into `submittedSpeedPrediction` on Run (handleRun, :~150-165) | Recession speed is only a number in the readout (readout under Run, :~410); no picture shows it |
| 2 | Which galaxy's light looks more red, nearer or farther? | The nearer one / The farther one / No difference; `redshiftPrediction` / `submittedRedshiftPrediction` | The colour and wave spacing of the light and the ring round Earth in the single SVG (:426-480) |

## Rule A
| Item | Result | Evidence | Gap and what would be needed |
|---|---|---|---|
| A0 | Met (listed) | above | |
| A1 | Met | Real values come only from `runHubblesLawExperiment(distanceMpc)` (physics module :55-66); prediction state is read only for text and the Run lock | none |
| A2 | Not met | SVG (:426-480) contains no guess element | Needs a white "YOUR GUESS" box. Prediction 2: on the colour/ring of the arriving light. Prediction 1: a speed panel is needed |
| A3 | Not met | no marks | Both guesses are 3-way choices; markers would be needed (caption must say marker only) |
| A4 | Not met (no marks) | the picture builds up during the run (:~300-330 progress) | Mark only after the wave reaches Earth |
| A5 | Not met | recession speed has no picture | Add a small speed bar panel to the same picture, own scale and title (nearer vs. farther galaxy). Would also need a "twice as far" reference galaxy |
| A6 | Not met | no "Where the real picture comes from" line | Needed: z = H0 d / c is calculated here; H0 = 70 is illustrative; the 67 to 73 range is measured/published; colour is exaggerated for display (:35) |
| A7 | Not met | Introduction (:~190-270) does not mention that guesses never change the pictures or tables, white marks, or that galaxy choice changes the drawing | Add intro sentences and a note by the Galaxy controls |
| A8 | Not met | The "actual" answers are constants in the component: `ACTUAL_SPEED = 'twice'`, `ACTUAL_REDSHIFT = 'farther'` (:114-115). Module has no guess/expected functions | Add module functions (the guess's speed ratio, expected ratio) with tests |
| A9 | Partly met | Tutor "compare" step names the guess but not any mark (HubblesLawTutor.tsx:64); verdict "right/off" is NOT in the tutor, it is in Results (HubblesLawExperiment.tsx:~452-470) | Move or keep verdict decision for owner; prompts should point to marks by name |
| A10 | Not found | grep for "do not change / never change" in the experiment and tutor: no hit | Experiment 1 does not carry the older "predictions do not change the results" sentence (CLAUDE.md §14 says each does) |

## Rule B
- B0: Results = four prose paragraphs, a "Checking your first/second prediction" pair, a statement of cause, the H0 value and an amber "Hubble tension" box (:513-575). No tables.
- B1: Not met. A real reference exists (spec sources): the published H0 range 67 to 73 km/s/Mpc (already named at :~495). A check-up could set "70 used" beside "67 to 73 published" with a reading ("inside the published range"); the recession speed at 16.5 / 100 / 200 Mpc has no external reference (say "calculated").
- B2: Not met (no tables; the prose does not have the what/means/matters shape).
- B3: N/A / optional. The Galaxy control only moves marks and a number; a table needs a real reference, which does not exist beyond H0.
- B4: Partly met. Guesses are echoed in prose ("you guessed ... right / off") rather than a block with a tag on a table row. It gives a verdict, contrary to §14 ("guess only").
- B5: Not met. Values come from the module (met), but there are no comparison functions or tests for a check-up.

## Rule C
- C1: Met for the galaxy and Earth ("the galaxy", "Earth (detector)", :~440-450). Unlabelled: the wavy line, the leading dot, the dashed path and the Earth ring are described only in the caption. Not met in full.
- C2: Partly met. Distance changes the galaxy's x-position and the colour/spacing (:~295-310), but the display is exaggerated (VISUAL_REFERENCE_REDSHIFT 0.05 at :35); the caption says so.
- C3: Partly met. "How to read this diagram" exists (:483-486) but is shown only after predictions are submitted (`hasSubmittedPrediction`), not beneath the picture from the start.
- C4: Partly met. Names galaxy, Earth, wave, dot, exaggeration; does not describe the ring colour at Earth beyond one mention, does not define Mpc or z in the caption, and has two bullets, no stage-by-stage order.
- C5: Not met. No worked moment with numbers (e.g. 16.5 Mpc gives 1,155 km/s, z = 0.0039).
- C6: Not met. No Look at / What it means / Why it matters items.
- C7: Met. The caption does not give the answer to either prediction.
- C8: Partly met. "redshift", "Hubble constant", "cosmology" are defined in the introduction; "Mpc" is only glossed in the assumptions list (:~245-258: "per about 3.3 million light-years"), after buttons use it; "recession speed" is not defined plainly.

## Other findings
- O1: CLAUDE.md §14 says older experiments each say predictions do not change the results; Experiment 1 does not say it (A10). Results give a right/off verdict (CLAUDE.md §14 item 4 / §13 say the tutor does). Report only.
- O2: Intro says "Essentially every distant galaxy's light is redshifted" yet later "A small number of genuinely nearby galaxies ... moving toward us" (:262); consistent but worth a read. Results says "so your prediction was right" in the Results panel, so the verdict appears before the tutor. No links list ("Want to know more?"; §29 is Cosmic Horizons only, so not a fault). H0 = 70 is stated as "illustrative".

## What an update would touch, and its size
HubblesLawExperiment.tsx, HubblesLawTutor.tsx, src/physics/hubblesLawExperiment.ts and its test, the specification 01-hubbles-law.md. Size **M**: new module functions plus one guess mark and a small speed panel, a check-up row, caption rewrite.

## Not checked
Browser rendering, narrow widths, the actual visibility of the ring colour; whether the specification's "Decisions Confirmed" mention a guess display (only grepped).
