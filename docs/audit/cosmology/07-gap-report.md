# Gap report: Cosmology Experiment 7 (Gravitational Lensing)
Date: 2026-11-02 | Specification: docs/experiments/cosmology/07-gravitational-lensing.md | Components: src/components/GravitationalLensingExperiment.tsx, GravitationalLensingTutor.tsx | Physics module: src/physics/gravitationalLensingExperiment.ts (+ .test.ts, 12 tests) | Status: read-only, nothing changed

## Summary
Three pictures (a side view with two light rays, a sky view with three rings, a ring-radius-against-mass graph), a "cluster mass" control, two predictions, Results with a three-row table, a worked calculation for the real cluster (Abell 1689, 47 arcseconds) and a "What this model simplifies" box, a 3-prompt tutor. The captions are thorough and per picture. Gaps: no guess marks, no "Where the real picture comes from", no "What this table tells us", no three-part look-for items, verdicts in Results, and Picture 3's caption gives away Prediction 2's answer before the run. Size: **M**.

## Predictions found (A0)
| # | Question | Answers | Where the answer lives on a picture |
|---|---|---|---|
| 1 | If the cluster had more mass, would the ring be larger, the same, or smaller? (GravitationalLensingExperiment.tsx:286; state in :~100-110; ACTUAL = 'larger', :40) | larger / same / smaller (`ringSizeChoices`) | Picture 2, the gold ring against the blue and green rings (:516-582); Picture 3, the purple curve's slope (:585-668) |
| 2 | If the cluster had four times the mass, how wide would the ring be compared with before? (:304; ACTUAL = 'two', :41) | `fourTimesChoices` (two times is the real answer; the others include four times / etc.) | Picture 3: the purple curve at 4 x the chosen mass; Picture 2: a ring of twice the radius |

## Rule A
| Item | Result | Evidence | Gap and what would be needed |
|---|---|---|---|
| A0 | Met | above | |
| A1 | Met | `result = runGravitationalLensingExperiment(mass)` takes only the mass (module :79); predictions feed text only (:806-830) and tutor props (:899-903) | none |
| A2 | Not met | No guess element in the three SVGs (:444-668) | Prediction 2: a white "YOUR GUESS" ring in Picture 2 at the guessed radius (twice, four times...) and a white point on Picture 3 at 4 x mass; Prediction 1: a white arrow marker (ring grows / same / shrinks) on Picture 2 |
| A3 | Not met | | Prediction 2 has a size (a multiple of the current ring), so a ring can follow it; Prediction 1 is a marker; caption to say so |
| A4 | Not met | The gold ring grows on Run (caption :~718-721); blue and green are drawn from the start | Draw guess ring after the gold ring reaches its size |
| A5 | Met (pictures exist) | Picture 2 and 3 carry ring size | none |
| A6 | Not met | no "Where the real picture comes from" line | Needed: the 47 arcsecond ring measured for Abell 1689; distances 630, 1730 and 1480 Mpc fixed, rounded values (module :13-15); gold ring and purple curve calculated here; the visible-only 15% is an average for real clusters (module :19) |
| A7 | Not met | Intro (:205-262) and the controls (:~370-424) say nothing about guesses never changing the pictures or tables | Add sentences; a note by the mass control |
| A8 | Partly met | Ring sizes (including 4 x mass, `einsteinRingArcseconds(4*mass)`) are computed in the module; ACTUAL constants are in the component (:40-41); the "4 x mass is more than the slider allows" check is in the component (:~827) | Module functions for the guess ring and the multiple, with tests; `bendingAngleArcseconds` and `massInsideRingSolarMasses` already tested |
| A9 | Not met | Tutor observe prompt names "the three rings: gold, dashed blue, green" (GravitationalLensingTutor.tsx:77-78) which is a partial pointer to drawn items; the compare prompt (:79-80) restates the guess and names no mark; verdicts are in Results (Experiment.tsx:811, :827) | Prompts to name the guess marks; verdict placement is the owner's choice |
| A10 | Not found | no "predictions do not change the results" sentence in the experiment or tutor | Absent despite CLAUDE.md §14's description |

## Rule B
- B0: Results (:779-890): a 3-row table (ring for your mass; ring that visible matter alone would make; observed ring, "a given value"); two "Checking your ... prediction" paragraphs with right/off and the numbers for 1x and 4x mass; "A simple calculation" (the 47-arcsecond ring needs about 2.0e14 solar masses; visible 15% gives a ring about 2.6 times smaller, sqrt of the mass ratio); an "In the real world" note; "A second line of evidence for dark matter"; a "What this model simplifies" box.
- B1: Partly met. The table sets your ring beside the visible-only ring and the observed ring; a real reference exists (the observed 47 arcseconds, test :95 gives about 2.0e14 solar masses). No "reading" column ("less", "the same", "more").
- B2: Not met. No "What this table tells us"; the paragraphs after it carry the content in prose.
- B3: Partly met: the table follows the mass control and has a reference, but no "Published value / How yours compares" columns nor a "trial values" closing line.
- B4: Partly met (guess in prose with verdict; no row tag).
- B5: Partly met (numbers from the module; the relation of 4 x mass to twice the ring is in the module and test :52 "grows as the square root of the mass").

## Rule C
- C1: Mostly met. Picture 1 labels "Earth", "Galaxy cluster (the lens)", "Distant galaxy (the source)", "light rays", "light bends toward it here" (:484-512); Picture 2 labels "Cluster", "Observed ring", "Visible matter only", a ring label for the chosen ring and a scale bar "20 arcseconds" (:549-581); Picture 3 title and axes, "Your chosen mass" (:600-668). Not confirmed: the two yellow dots (described only in the caption).
- C2: Met. The gold ring and gold dot move with the mass; the bend in Picture 1 grows with mass (:~700).
- C3: Met in form. "How to read these diagrams" (:676) sits beneath all three pictures; the pictures and caption appear only after predictions are submitted (:441).
- C4: Mostly met. Per-picture sections, each element and colour named, the arcsecond defined in the intro (:~214-220) and again in Picture 3's bullet (:~751-753), the exaggerated bend admitted, what is not to scale. Short bullets. Playback order is described ("light travels first, then the ring").
- C5: Partly met. Real numbers in the caption: the real bend "about N arcseconds" (:~706) and the 20 arcsecond scale bar; the worked calculation is in Results, not the caption.
- C6: Not met. Items are "Compare" / "To read ..." sentences, not Look at / What it means / Why it matters.
- C7: Not met. Picture 3's first bullet states "four times the mass makes a ring only twice as wide" (:~747-749) and "rises quickly and then flattens", which is the answer to Prediction 2, and Picture 1's last bullet says "a heavier cluster visibly bends the rays more" (:~708-711), leaning toward Prediction 1's answer, both before the run.
- C8: Mostly met. Galaxy cluster, lensing, lens, source, Einstein ring, arcsecond, solar mass defined before use (:208-220); "Mpc" is used in the Results box without a definition (assumed from Experiment 1); "visible matter / dark matter" reused from Experiment 4.

## Other findings
- O1: None found against the specification in what was read (the spec confirms 47 arcseconds and the distances).
- O2: Unsourced in the text: the coin-at-2-km comparison (:~218-220; an arcsecond figure that can be checked), the wine-glass comparison, "hundreds or thousands of galaxies" and the "15% average for real clusters" (flagged as approximate in Results). The statement that the measured ring is "for a real cluster (Abell 1689)" rests on the specification. No links list.

## What an update would touch, and its size
GravitationalLensingExperiment.tsx, GravitationalLensingTutor.tsx, src/physics/gravitationalLensingExperiment.ts and test, specification 07-gravitational-lensing.md. Size **M**: guess ring and point on two pictures, module functions for them, reading column and "What this table tells us", caption rewrite (remove reveals, add three-part items).

## Not checked
Browser rendering; control block and prediction state line numbers (approximate); the tutor's explanation text; how the ring labels collide at small sizes; the specification's decisions table.
