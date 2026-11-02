# Gap report: Cosmology Experiment 5 (Dark Energy: is the expansion speeding up?)
Date: 2026-11-02 | Specification: docs/experiments/cosmology/05-dark-energy.md | Components: src/components/DarkEnergyExperiment.tsx, DarkEnergyTutor.tsx (not EvolvingDarkEnergy*, which is Cosmic Horizons 2) | Physics module: src/physics/darkEnergyExperiment.ts (+ .test.ts, 9 tests) | Status: read-only, nothing changed

## Summary
Two pictures (three supernovae as dashed "expected" rings and glowing disks; a brightness-against-redshift graph with blue, amber and green lines), a "share of dark energy" control, two predictions, Results with a table (three redshifts), a worked example, a 3-prompt tutor. The caption is well structured but gives away Prediction 2's answer before the run. No guess marks, no "Where the real picture comes from", no check-up, no "What this table tells us", verdicts in Results. Size: **M**.

## Predictions found (A0)
| # | Question | Answers | Where the answer lives on a picture |
|---|---|---|---|
| 1 | If the universe held only matter, how would gravity affect the expansion? (DarkEnergyExperiment.tsx:~268-270; state :94, :96) | slow / speed up / no effect (`gravityEffectChoices`; ACTUAL = 'slow', :38) | No picture shows slowing vs speeding; only the one-line "expansion today is speeding up / slowing down" statement in Results (:~762) and the line above the pictures |
| 2 | If the expansion were speeding up, would a faraway supernova look brighter, the same, or dimmer? (:~296-299; state :95, :99) | brighter / same / dimmer (ACTUAL = 'dimmer', :39) | Both pictures: the disk-vs-ring sizes (:482-520) and the amber line below the blue line on the graph (:535-650) |

## Rule A
| Item | Result | Evidence | Gap and what would be needed |
|---|---|---|---|
| A0 | Met | above | |
| A1 | Met | `result = runDarkEnergyExperiment(share)` and `bestFit` depend on the share only (:~160-170); predictions only feed text (:805-823) and tutor props (:858+) | none |
| A2 | Not met | No guess element in either SVG (:436-650) | Prediction 2: a white guess disk or a guess point at redshift 0.5 on the graph with a "YOUR GUESS" box; Prediction 1: a panel (see A5) |
| A3 | Not met | | Three-way choices, so markers: a disk bigger / same / smaller than the ring; Prediction 1 a marker (accelerating or decelerating arrow); caption to say marker only |
| A4 | Not met | The dashed rings are already hidden until predictions are locked (:482, comment cites CLAUDE.md §12), the amber line and disks appear on Run | Draw marks after Run |
| A5 | Not met | Prediction 1 (slowing vs speeding) has no picture | Add a small panel to the graph's picture: the deceleration parameter (module `decelerationParameter`, :57) against dark energy share, own title and scale; marks the zero-crossing at about 1/3 the page already mentions (caption) |
| A6 | Not met | no "Where the real picture comes from" line | Needed: the 70% best fit (a rounded value astronomers fitted, not derived here), brightness lines calculated here, the supernovae "all exactly the same true brightness" assumed (a model, not measured); Hubble constant 70 illustrative |
| A7 | Not met | Intro (:193-262) has no statement about guesses; no note beside the share buttons (:350-415) | Add sentences; note beside the controls |
| A8 | Partly met | Distances and brightness are from the module; the "right" answers `ACTUAL_GRAVITY_EFFECT`, `ACTUAL_LOOKS` are component constants (:38-39); `shareVerdict` (the "within 5%" test) is computed in the component (:162-168) | Move verdict and guess positions into the module with tests; `decelerationParameter` is tested (test :81) |
| A9 | Not met | Tutor compare prompt restates the guess and names no mark (DarkEnergyTutor.tsx:65-66); verdicts are in Results (Experiment.tsx:811, :822) | Marks by name in prompts; where verdicts go is the owner's decision |
| A10 | Not found | no "do not change the results" sentence in the experiment or tutor | Absent despite CLAUDE.md §14's description |

## Rule B
- B0: Results (:758-860): a table "Redshift / Distance, matter only (Mpc) / Distance, your universe (Mpc) / Brightness" for 0.2, 0.5, 0.8 (:~770-795); a sentence saying whether the chosen share matches the best fit within 5%; two "Checking your ... prediction" paragraphs; a worked example (distance ratio squared); a "Nearby objects agree" paragraph; a 1998/1999 Nobel note; a "Remember" note.
- B1: Not met as a check-up. A real reference exists: the best-fit share of about 70% (`BEST_FIT_DARK_ENERGY_FRACTION = 0.7`, module :8) and the 5% rule; but 70% is "a rounded value" the page calls a model, not a measurement. Check-up rows could be: expansion today (matter only: slowing; best fit: speeding up) and brightness at redshift 0.5 (the page's 69% from the test :71, "about 0.69").
- B2: Not met under the table; the worked example and "Nearby objects agree" paragraph carry some of the meaning.
- B3: Partly met. The table follows the control ("your universe") and has a published reference (the best fit and Nobel result), but no "Published value / How yours compares" columns and no "trial values" closing line.
- B4: Partly met (guess in prose with verdicts, no row tag; the guess 2 number 69% appears in the paragraph, not in a row).
- B5: Partly met (numbers from the module; the "within 5%" comparison is in the component).

## Rule C
- C1: Mostly met. "Earth" (:462), "redshift 0.2/0.5/0.8" (:502), % brightness under each (:505), legend entries (:523, :527), graph axes (:565-593) and legend (:624-640). Not labelled on canvas: nothing obviously missing, but the disk glow gradient is named only in the legend.
- C2: Met. The disk shrinks inside its ring and the amber line leaves the blue line as the share changes (caption :688-718 "Things to try").
- C3: Partly met. "How to read this diagram" (:658) is beneath the pictures but appears only after predictions are locked (:648).
- C4: Mostly met. Names both pictures, every element and colour, axes, what 1.0 and 0.7 mean, what a smaller disk means; short sections and bullets. Does not define "Mpc" (the "What to look for" intro paragraph says it is reused, :241).
- C5: Partly met. The caption has a car-headlight example (:688-692); the worked numbers (distance ratio squared, 0.69) are in Results, not the caption.
- C6: Not met. "Things to try" and bullets are not Look at / Means / Matters.
- C7: Not met. The caption's first paragraph says "If they look dimmer than that, they are farther away than that universe says, and that is how we can tell the expansion has been speeding up" (:659-662) and "A disk smaller than its ring means the star looks dimmer than expected" (:~679-683); these state Prediction 2's answer (dimmer) before Run. The "Things to try" item says the disks shrink for the best fit (:~725). The tutor/Results are after the run.
- C8: Mostly met. Type Ia supernova, standard candle, white dwarf, dark energy, redshift, Mpc (by reference) and "flat" are defined before use (:197-262).

## Other findings
- O1: None found against the specification in what was read.
- O2: Unsourced or unchecked in the learner-facing text: "shines as brightly as billions of Suns" and the white dwarf description (:209-216), the 1998/1999 teams and 2011 Nobel claim (Results; the specification text read does not flag a source check), the "one third" threshold (module test :81 supports it for this model). The page says the best-fit "stands for what is measured" (:~262) while Results says it is a model curve; both are in the page. No links list.

## What an update would touch, and its size
DarkEnergyExperiment.tsx, DarkEnergyTutor.tsx, src/physics/darkEnergyExperiment.ts and test, specification 05-dark-energy.md. Size **M**: guess marks on the graph and the supernova picture, a small panel for the slowing/speeding guess, verdict moved to the module, check-up and "What this table tells us", caption reworded to stop revealing Prediction 2.

## Not checked
Browser rendering; the tutor's explanation text; the table's exact markup; whether the amber line appears only on Run (read from the caption, not the code).
