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

---

# Re-read, 2026-11-15 (against Rule E and the 2026-11-07 rules)
Status: read-only. Nothing in the app, the specification or the tests was changed. The numbers below were worked by hand with node (nothing left in the repo) and are not yet in a test.

## What the module returns (hand-checked)
Luminosity distance in Mpc and brightness compared with matter-only, at redshifts 0.2, 0.5, 0.8 and 1, and today's deceleration number q0:

| Dark energy share | z = 0.2 | z = 0.5 | z = 0.8 | z = 1 | q0 |
|---|---|---|---|---|---|
| 0 (matter only) | 896 / 1.000 | 2358 / 1.000 | 3926 / 1.000 | 5018 / 1.000 | +0.50 |
| 0.3 | 928 / 0.931 | 2522 / 0.874 | 4277 / 0.842 | 5512 / 0.829 | +0.05 |
| 0.5 | 953 / 0.884 | 2660 / 0.786 | 4591 / 0.731 | 5967 / 0.707 | -0.25 |
| 0.7 (best fit) | 980 / 0.835 | 2833 / 0.693 | 5018 / 0.612 | 6608 / 0.577 | -0.55 |
| 0.9 | 1011 / 0.785 | 3063 / 0.593 | 5665 / 0.480 | 7655 / 0.430 | -0.85 |

1. **The best fit makes a supernova at redshift 0.5 look 69 percent as bright as matter-only predicts** (0.693), which is 0.40 magnitudes dimmer. This matches the specification's table (0.83, 0.69, 0.61).
2. **The expansion switches from slowing to speeding up at a share of exactly 1/3** (q0 = 0.5 - 1.5 x share = 0 at 0.333). The page says "about one third"; the module gives exactly 1/3 for this model.
3. **The "within 5 percent at every redshift" test passes for shares from about 0.66 to 0.74**, not only at 0.70. The Results sentence "this universe would look like the one we observe" is true over that band. The 5 percent is a code value, not a published one.
4. **The line "Today the expansion is speeding up" stays true for every share above 1/3**, so it is true at the best fit that the page starts on.
5. **At redshift 0.01 the best fit and matter-only differ by 0.5 percent in distance** (1.0052), so "essentially the same" in the Results is right.

## Corrections to the 2026-11-02 report
- **A10 / Results verdicts:** the Results gives "so your prediction was right / off this time" for both guesses (`DarkEnergyExperiment.tsx:810-812, :821-823`), before the tutor. CLAUDE.md §14 leaves marking to the tutor.
- **C7 is Not met in more places than the report said.** Besides the caption (`:660-661` "If they look dimmer ... that is how we can tell the expansion has been speeding up", `:682-683` "A disk smaller than its ring means ... dimmer"), the **introduction** gives Prediction 2's answer before the guess: "A daily-life picture" ends "If they look dimmer than you expected, the car is farther away" (`:224-225`) and "Why even ask this" says a dimmer supernova is a test of the expansion (`:228-230`). Both lead straight to "dimmer".
- **Prediction 1 is also hinted.** The introduction calls dark energy "energy that would push space to expand faster **instead of slower**" (`:205-206`), which tells the learner that the normal behaviour is slowing. This is a §12 risk for Prediction 1 that the 2026-11-02 report did not list.
- **The amber line, the disks and the best-fit line are not hidden by the amount control, but the share defaults to "best fit" (`:88`) and the buttons are disabled until both guesses are made (`:355`).** The first Run therefore shows the best-fit result (disks inside their rings, amber on green). That is Part 1's real result and is fine after the guesses are made, but see question 1.
- **The dashed rings and legend appear only after the guesses are locked (`:480`, `:512`), and the graph only after that (`:534`).** The caption, however, is shown from the moment of locking, before Run, and already describes the amber line "when you run" and the disks. See Rule A4.

## Rule E: the page in four Parts
| Item | Result | Evidence | Gap and what would be needed |
|---|---|---|---|
| E1 | Not met | One card holds the introduction, both guesses, the share buttons, Run, the readout, both pictures, the caption and Results (`:190-855`); the tutor is a second card | Part 1 (guesses, Run, pictures), Part 2 (the share control and the drawing that follows it), Part 3 (results), Part 4 (tutor) |
| E2, E4 | Not met | No Part headings or leads | Four leads, drafted for approval; Part 1's lead gives no answers (§12) |
| E3 | Not met | No links list, no words box | See "Links and Words" |

## Parts 2 to 4 appear after the first Run
**Partly met, with the same defect as Cosmology 1, 2 and 4.** Results and tutor appear when the status is `complete` (`:750`, `:857`). **Changing the share after a run calls `setStatus('idle')` (`:111`, `:395`), which hides the Results and unmounts the tutor, and Run remounts the tutor from its first question (`key={runCount}`, `:859`).** Suggested fix: after the first Run, Parts 2 to 4 stay; a changed share changes only Part 2's drawing and the "your universe" column until its own Run; the tutor is not remounted.

## "Start over, not Change prediction" (2026-11-07 rule)
**Not met.** "Change predictions" appears only after the guesses are locked (`:327-347`) and re-opens both questions without clearing the share or the results (`handleChangePrediction`, `:127`). It becomes an always-visible "Start over", greyed out until a guess is chosen or a run exists and while a run plays, which clears the guesses, runs, results and tutor progress. Replaced, and said so in the specification.

## Predictions and where their answers live (A5, sharpened)
- **Prediction 1 (in a matter-only universe, does gravity slow, speed up or not change the expansion):** there is no picture of this. The module has `decelerationParameter` (q0). Suggested: add a **second panel to the graph's picture**, on its own scale, titled "Is the expansion slowing or speeding up today?", plotting q0 against the dark energy share (0 to 0.9). It crosses zero at 1/3. A white **marker** at share 0: an up arrow for "slow it down" (q0 above zero), a down arrow for "speed it up" (below zero), a dot on the zero line for "not change it". **Marker only** (three answers carry no size); the caption says so. Drawn after Run.
- **Prediction 2 (would a faraway supernova look brighter, the same or dimmer):** the answer lives in both pictures: the disk against its ring at redshift 0.5, and the amber line against the blue line at 0.5 on the graph. Suggested: a white guess ring around the redshift-0.5 supernova (larger than the dashed ring for "brighter", the same size for "the same", smaller for "dimmer") and a matching white marker on the graph at 0.5 (above, on or below the blue line), each with a YOUR GUESS box. **Marker only** (the sizes are fixed, not the learner's number); the caption says so.
- **Where the real picture comes from.** *Measured:* the best-fit share of about 70 percent is a rounded value astronomers fitted to real supernova data (source not read here). *Calculated here:* the distances and brightnesses, the q0 curve, the blue, amber and green lines (the green line is the module's curve at 70 percent, not data points). *Imagined for the question:* the "all supernovae exactly equally bright" assumption, the three supernova positions and the share chosen in Part 2. The Hubble constant 70 is the project's illustrative value.

## Links and Words (2026-11-07 rules)
- **Words and formulas box (new).** Entries: supernova, Type Ia supernova, white dwarf, standard candle, brightness, redshift, Mpc, light-year, expansion, matter, dark energy, flat universe, Hubble constant, deceleration (q0), luminosity distance, magnitude (if used). Formulas with worked examples from the page's own numbers: brightness falls as 1 / distance squared (a supernova at 2358 Mpc matter-only and 2833 Mpc at 70 percent: (2358 / 2833)^2 = 0.693); q0 = 0.5 - 1.5 x share (at 70 percent: 0.5 - 1.05 = -0.55). **Held back until after the Run (§12):** that distant supernovae are dimmer in the best fit and that matter slows the expansion.
- **"Want to know more?" links (new).** None exists. Candidates to search and read (none read): a plain NASA or ESA page on dark energy; a plain page on Type Ia supernovae and standard candles; Riess et al. 1998 (Astronomical Journal 116, 1009) and Perlmutter et al. 1999 (Astrophysical Journal 517, 565); the 2011 Nobel Prize page; a source for "about 70, 25 and 5 percent"; the Planck 2018 or DESI value for the dark energy share; Hubble tension page (already used by earlier experiments). Per §29 rule 3(c), link only what is read and record any gap.

## Wording and claims to check (new and restated)
- **Unsourced and unchanged since the first build:** "shines as brightly as billions of Suns" and the white dwarf description (`:209-216`); "1998 and 1999 two independent teams, 2011 Nobel Prize" (`:842-844`, tutor point 3); "about 70% dark energy, dark matter about 25%, ordinary matter about 5%" (tutor point 4); "a slightly brighter one tends to fade more slowly" (`:217-219`).
- **"Best fit ... about 70%" (rounded)** (`:271`, `:368`). A published value (Planck 2018 gives about 68.5 percent) is **not read**, so the page cannot say how the rounded 70 compares with a published number. Owner to rule (question 7).
- **"Hypothetical energy"** (`:205`) against "Astronomers estimate it makes up about 70%" (tutor): the page calls dark energy hypothetical and then gives its share. Current status (§29 rule 1, "up to date") needs a date and, for "constant", a pointer to Cosmic Horizons' dark-energy experiment (recent DESI results hint it may change with time). Owner to rule (question 8).
- **Heading "Experiment 5 — Dark Energy"** (`:188`) has no group name; it would read **Cosmology 5: Dark Energy** (the pattern of Cosmology 1 to 4).
- **Cross-references say "Hubble's Law (Experiment 1)", "the Big Bang experiment (Experiment 2)", "Gravity and Curved Spacetime Experiment 4", "dark matter (Experiment 4)"** (`:197-198`, `:249`, tutor point 5). They would be checked against the sidebar names.
- **"Dimmer" is stated three times as the finding in the tutor's explanation** (points 1 and 3) after the learner has seen it; fine there (tutor, after the run).
- **A mismatch to resolve:** the tutor's point 1 says "a supernova that looks one quarter as bright is twice as far away"; the page's own example (0.693) uses a ratio of 1.2. Both are right; the first is the rule, the second is the case.
- `onComplete` fires on every Run; not harmful.

## B1 to B3, recommendation
Real references exist for few rows, and all the sources are unread. Suggested **check-up table** (amount-independent rows only):
- (a) **Expansion today, matter only against the best fit:** q0 +0.50 (slowing down) and -0.55 (speeding up). The reference is the observed result that the expansion is speeding up (1998, 1999). Reading: "the best fit speeds up, as observed; matter only does not", with no cut-off.
- (b) **Brightness at redshift 0.5, best fit against matter only:** 0.693 against 1.000, which is 0.40 magnitudes dimmer. Reading: "less". A published figure for this size of dimming needs reading before it is shown as a reference.
- (c) **The share at which the speed-up begins:** exactly 1/3 in this model (calculated here, not a measurement), against the best fit at about 70 percent. Reading: "the best fit is well above it".
- (d) **How close the 70 percent is to a published share** (about 68.5 percent from Planck 2018, **not read**): shown only if read; otherwise "calculated here, no published value read".
"What this table tells us" under each, with the car-headlight picture as the daily-life anchor.
**Setting-following table (item 3):** the "your universe" columns already follow the share control. Suggested: keep the existing speeds-and-brightness table with a "Published value / How yours compares" column **only if** a source is read; otherwise drop it as Experiment 14 dropped its Table 4, because the amber line and the disks already show the control. Owner to rule (question 6).
**The learner's guesses** shown beside the results, with a tag on the row where the number appears (guess 1 at the q0 row, guess 2 at the redshift-0.5 row), guess only. All need module functions and tests.

## Updated size
**Medium to Large** (was Medium). Two guess marks on the supernova picture and the graph and a new q0 panel are the new drawing. The page rebuilt around four Parts, the share control and its drawing moved to Part 2, a check-up with a reading column, the Part 3 notes, a words box, links to be searched and read, a rewritten introduction and caption with the §12 fixes, and a tutor that marks both guesses make up the bulk. The module needs guess-marker positions, the q0 curve, the 5 percent verdict (moved out of the component), tutor marking, check-up rows and worked examples, with tests. **No change to approved physics.**

## Questions for the owner before drafting
1. **What does Part 1 show, and what does Part 2 change?** Suggested default: Part 1 is fixed at the best fit (70 percent): the supernova picture, the brightness graph (blue, amber and green) and the q0 panel, one Run, no share control. Part 2 holds the share control (none, best fit, custom 0 to 90 percent) and the amber line, the disks and the q0 marker for the learner's own share. Parts 2 to 4 appear after the first Run.
2. **Guess marks.** Suggested default: Prediction 1 as a white marker (up arrow, down arrow or dot) on the new q0 panel at share 0; Prediction 2 as a white ring on the redshift-0.5 supernova and a white marker at 0.5 on the graph; each with a YOUR GUESS box; drawn after Run; the caption says they are markers only.
3. **Introduction.** Suggested default: shorter and neutral. Remove "instead of slower" and the "dimmer means farther" ending of the car-headlight picture and "Why even ask this" from above Part 1 (they hint at both answers); hold them for the caption after Run and the tutor. Keep the question, the standard candle and the terms. Add the Parts paragraph, the guess paragraph (the guesses never change the pictures or tables; they are drawn in white and shown again beside the results; the share control does change the amber line, the disks and the q0 marker) and "Some new words".
4. **Results.** Suggested default: move "so your prediction was right / off" to the tutor; keep the worked example; show both guesses beside the results with a tag on the row.
5. **Check-up table.** Suggested default: rows (a), (b) and (c); (d) only if a published share is read; "less", "the same" and "calculated here only" as the readings; no "close enough".
6. **A setting-following table.** Suggested default: **drop it** (the amber line and the disks already show the control), keeping "Distance, your universe" in the speeds table as it is.
7. **The rounded 70 percent.** Suggested default: read Planck 2018 (or NASA's page), say the page's 70 is a rounded value close to the published fit, and show the published number only if read.
8. **Dark energy's status.** Suggested default: reword "hypothetical energy" to "the name for whatever makes the expansion speed up", add "as of November 2026", and point to the Cosmic Horizons dark-energy experiment for the question whether it changes with time.
9. **Links and words.** Suggested default: search and read a plain NASA or ESA dark-energy page, a Type Ia supernova page, Riess 1998, Perlmutter 1999 and the 2011 Nobel page; link only what is read and record any gap.
10. **"Change predictions" replaced** by an always-visible "Start over" (the standing rule). Listed so you can see it. Suggested default: yes.
11. **Heading and cross-references:** "Cosmology 5: Dark Energy" and the sidebar's names for the other experiments. Suggested default: yes.
12. **The unsourced facts** (billions of Suns, 1998 and 1999 teams, 2011 Nobel, 70 / 25 / 5 percent, brighter supernovae fade more slowly). Suggested default: search and read sources before drafting; keep a fact only if it is read, and soften or drop the rest, as in Cosmology 2 and 4.

## Not checked (re-read)
Not run in a browser; narrow widths and dark mode not looked at; no source page searched or fetched, so the 70 percent, the 1998 and 1999 papers, the 2011 Nobel claim, the 70 / 25 / 5 split, and the "billions of Suns" and fade-rate statements are **not verified**; the tutor's wording was read in full and the specification's table of numbers matched, but the specification was not compared line by line; the module's tests were counted (9 cases) and not re-run; line numbers are from the files as read today; the numbers above were made by hand with node and are not yet in a test.
