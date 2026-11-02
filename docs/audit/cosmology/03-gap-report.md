# Gap report: Cosmology Experiment 3 (The Cosmic Microwave Background)
Date: 2026-11-02 | Specification: docs/experiments/cosmology/03-cosmic-microwave-background.md | Components: src/components/CosmicMicrowaveBackgroundExperiment.tsx, CosmicMicrowaveBackgroundTutor.tsx | Physics module: src/physics/cosmicMicrowaveBackgroundExperiment.ts (30 lines, 5 tests in .test.ts) | Status: read-only, nothing changed

## Summary
One SVG with two panels (a hot-to-cold bar with a "chosen moment" marker; a lower "sky in every direction" panel of illustrative circles), two predictions, prose Results (no tables), a 3-prompt tutor. Verdicts are in Results. No guess marks, no check-up, no reading guide, no worked moment in the caption. Two §12 hints appear before or at the run (the assumptions list and the caption), and the sky panel's colours are display data inside the component, not module output. Size: **M**.

## Predictions found (A0)
| # | Question | Answers | Where the answer lives on a picture |
|---|---|---|---|
| 1 | Going back toward recombination, was the background temperature higher, lower, same as today? (CosmicMicrowaveBackgroundExperiment.tsx:276; state :108, :110) | Higher / Lower / The same (`temperatureChoices`) | The top bar (:432-490): its recombination end (z ≈ 1089.8) vs today end; real value 2.725 x (1 + z) |
| 2 | Is the temperature about the same in every direction or does it vary a lot? (:294; state :109, :112) | Uniform / varies (`skyChoices`) | The lower sky panel (:495-520), 'illustrative' circles |

## Rule A
| Item | Result | Evidence | Gap and what would be needed |
|---|---|---|---|
| A0 | Met | above | |
| A1 | Met | `result` comes from the chosen moment's z via `runCmbExperiment` (module :28); predictions appear only in text (:572-592) and tutor props (:611-613) | none |
| A2 | Not met | No guess element in the SVG (:432-524) | Prediction 1: a white mark on the bar at the guess (e.g. "hotter" side) with a "YOUR GUESS" box. Prediction 2: a marker on the sky panel |
| A3 | Not met | | Both are 3-way (or similar) choices: markers; caption must say so |
| A4 | Not met | The bar draws at once; the sky panel only after `hasSubmittedPrediction` (:495) | Draw marks after the run reaches the relevant feature |
| A5 | Partly | Predicted quantity (temperature) has the bar; temperature has no scale (only colour) | A temperature scale panel (K) on the bar's picture, own title, so a guess and 3,000 K / 2.725 K can be compared |
| A6 | Not met | no "Where the real picture comes from" line | Needed: 2.725 K and z = 1089.8 measured (COBE/WMAP/Planck, per :257-258, :599-600); temperature at each moment calculated here; sky circles illustrative (SKY_DIRECTIONS, :73) |
| A7 | Not met | Intro (:188-270) says nothing about guesses never changing the pictures, white marks or the controls | Add intro text; a note by the moment controls (:350-415) |
| A8 | Not met | `ACTUAL_TEMPERATURE = 'higher'`, `ACTUAL_SKY = 'uniform'` live in the component (:47-48); the sky circle colours are a constant in the component (:73), not from the module | Module functions (guess's temperature, sky spread) and tests |
| A9 | Not met | Tutor compare prompt restates the guess, names no mark (Tutor.tsx:73-74); verdict is in Results (Experiment.tsx:582-592) | Prompts to name marks; the owner to say where verdicts go |
| A10 | Not found | No "predictions do not change the results" sentence in the experiment or tutor | Absent despite CLAUDE.md §14's description |

## Rule B
- B0: Results (:563-600): temperature at the chosen moment with the worked rule 2.725 x (1 + z); two "Checking your ... prediction" paragraphs with right/off; an explanation of (1 + z); a "Values used" paragraph. No tables.
- B1: Not met. Real references exist: 2.725 K today and about 3,000 K at recombination (module test cosmicMicrowaveBackgroundExperiment.test.ts:14 uses 3,000 K within 5%); 1 part in 100,000 variation (:265). A check-up: "calculated at recombination 2.725 x 1090.8 = about 2,972 K vs the accepted ~3,000 K: the same to within their rounding" (no invented cut-off) and "sky variation: about 1 part in 100,000 (measured)".
- B2: Not met; the worked rule is a good start but is not under a table.
- B3: N/A: the moment control only moves a marker; no real reference changes.
- B4: Partly met (guesses echoed with verdicts in prose; no row tag).
- B5: Not met (no comparison functions).

## Rule C
- C1: Partly met. Labelled: "Recombination", "Today (Earth)" with z (:465-474), "chosen moment" (:488), the panel title (:452), "each circle = one direction" (:519). Unlabelled: the colour bar's gradient has no colour key / temperature scale.
- C2: Partly met. The marker colour changes with the moment (:480-490). The sky circles do not change with any control (caption :547-548 says so).
- C3: Partly met. "How to read this diagram" (:535) shown beneath the picture only after predictions are locked (:530).
- C4: Partly met. Names both panels, marker, bar (:535-552). Does not define "kelvin" or "z" in the caption (they are defined in the intro :222-232), and does not list the circles' colour meaning beyond "colored by temperature".
- C5: Not met in the caption. The Results paragraph has a worked sum (:565-570, :577-581), but not the caption.
- C6: Not met. Two bullets, not Look at / Means / Matters, although the sky bullet has a "Why it matters" phrase (:549-551).
- C7: Not met. The caption states "Recombination (hot white-orange) with Today (cold deep violet)" (:542), which answers Prediction 1 before the run. The assumptions list says the real sky has "tiny variations (about 1 part in 100,000)" (:265), which points to Prediction 2's answer (nearly uniform) before it is made. The caption's reference to "the horizon problem" (:550) also hints at the sky answer.
- C8: Partly met. Kelvin, redshift z, recombination, microwave defined in the intro; "illustrative" and "temperature of the glow" are explained; "horizon problem" is used in the caption by reference to Experiment 2.

## Other findings
- O1: None found against the specification in what was read.
- O2: Unsourced in the intro: "roughly 400 of these ancient light particles are passing through every cubic centimetre" (:211), the old TV static claim (:216), the 380,000-year recombination (a constant, module :11) and the stove-colour comparison. "Cold deep violet" for 2.725 K (:542) is a display colour, not a real colour. The sky circles' colours are made up in the component (:73-100), "illustrative" is stated. No links list (not required outside Cosmic Horizons).
- O2 (more): the seven sky circles differ by one RGB step only (CosmicMicrowaveBackgroundExperiment.tsx:73-90), so they look identical; a guess of "varies a lot" has no drawn contrast.

## What an update would touch, and its size
CosmicMicrowaveBackgroundExperiment.tsx, CosmicMicrowaveBackgroundTutor.tsx, src/physics/cosmicMicrowaveBackgroundExperiment.ts and test, specification 03. Size **M** (marks on one picture plus a temperature scale panel; check-up of two rows; caption rewrite incl. removal of two early hints).

## Not checked
Browser rendering; SKY_DIRECTIONS colours (only the declaration was glanced at); the tutor's explanation text after its first lines; the specification's decisions table.
