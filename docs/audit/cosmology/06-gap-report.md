# Gap report: Cosmology Experiment 6 (How old is the universe?)
Date: 2026-11-02 | Specification: docs/experiments/cosmology/06-age-of-the-universe.md | Components: src/components/UniverseAgeExperiment.tsx, UniverseAgeTutor.tsx | Physics module: src/physics/universeAgeExperiment.ts (+ .test.ts, 14 tests) | Status: read-only, nothing changed

## Summary
One graph (relative size against time, with purple constant-speed, blue matter-only and gold chosen-share lines, end dots labelled with their ages, and a grey dotted "oldest star clusters" line), a "share of dark energy" control, two predictions, Results with a four-row table, a worked "two thirds" calculation, a "Why not exactly 13.8?" box, a 3-prompt tutor. The Results already put "your age" beside a real measured age (13.8 billion years) and the caption is long and structured. Gaps: no guess marks, no "Where the real picture comes from", no "What this table tells us", no three-part look-for items, verdicts in Results, and the caption gives away both predictions' direction before the run. Size: **M**.

## Predictions found (A0)
| # | Question | Answers | Where the answer lives on a picture |
|---|---|---|---|
| 1 | If the universe held only matter, would its age be longer than, shorter than or the same as Experiment 2's constant-speed estimate (about 14 billion years)? (UniverseAgeExperiment.tsx:257-259; state :79, :81; ACTUAL = 'shorter', :41) | Longer / Shorter / The same (`matterOnlyAgeChoices`) | The graph (:417-534): the blue line's end dot (age) against the purple dot |
| 2 | Would adding dark energy make the universe older, younger or the same age? (:276-277; state :80, :83; ACTUAL = 'older', :42) | Older / Younger / The same (`darkEnergyAgeChoices`) | The gold dot against the blue dot on the same graph |

## Rule A
| Item | Result | Evidence | Gap and what would be needed |
|---|---|---|---|
| A0 | Met | above | |
| A1 | Met | `result = runUniverseAgeExperiment(share)` is driven only by the share (module :84-104); predictions appear only in text (:685-708) and tutor props (:793-797) | none |
| A2 | Not met | No guess element in the SVG (:417-534) | Prediction 1: a white "YOUR GUESS" marker on the time axis before / at / after the purple dot (relative to the Hubble-time dot); Prediction 2: the same relative to the blue dot |
| A3 | Not met | | Three-way choices: markers on the axis (earlier / same / later), caption to say marker only |
| A4 | Not met | Lines are drawn on Run; the dots appear at the line ends | Draw marks after the lines have reached their dots |
| A5 | Met (picture exists) | the graph already carries both ages | none; no new picture needed |
| A6 | Not met | no "Where the real picture comes from" line | Needed: ages calculated here from the Experiment 5 model (H0 = 70, flat, matter plus constant dark energy); 13.8 billion years measured (given, not derived); 12.5 billion years a rounded value for the oldest clusters; purple line a simplified model |
| A7 | Not met | Intro (:177-262) and the controls (:330-397) say nothing about guesses never changing the pictures or tables or about white marks | Add sentences and a note by the share buttons |
| A8 | Partly met | Ages come from the module; ACTUAL constants are in the component (:41-42); the "shorter / longer" and "older" tests are done in the component (:688-693) although the module has a test (universeAgeExperiment.test.ts:118) | Module functions for the guess marks' positions and the matter-only-vs-Hubble comparison, with tests |
| A9 | Not met | Tutor compare prompt (UniverseAgeTutor.tsx:67-68) restates the guess and names no mark; right/off verdicts in Results (Experiment.tsx:692, :707) | Marks named in prompts; verdict placement is the owner's choice |
| A10 | Not found | no "predictions do not change the results" sentence in the experiment or tutor | Absent despite CLAUDE.md §14's description |

## Rule B
- B0: Results (:652-790): a 4-row table (Matter only; Experiment 2's constant-speed estimate; Your universe; The real measured age) (:~660-675); "A simple calculation" (2/3 x Hubble time); two "Checking your ... prediction" paragraphs; "The oldest star clusters" paragraph (with 1990s history and Hipparcos); "Why Experiment 2's estimate came out close" paragraph; a "Why not exactly 13.8?" box with three rows (70 and 70%; only H0 67.4; both 67.4 and 68.5%); a "Remember" note.
- B1: Partly met. A table with a real reference exists (the real measured age, 13.8 billion years), but no "reading" column; the "Why not exactly 13.8?" box (:~740-775) is in effect a check-up, and the oldest-clusters sentence gives a pass/fail ("older" or "younger") without a published cut-off other than a rounded 12.5 billion years.
- B2: Not met. No "What this table tells us" note; the paragraphs after the table carry what / meaning / why in prose.
- B3: Partly met. The table follows the control ("Your universe") and has a published reference (13.8), but no "Published value / How yours compares" columns and no "trial values" closing line.
- B4: Partly met (guess in prose with verdicts; no row tag).
- B5: Partly met (ages from the module with tests; the older/younger comparison text in the component).

## Rule C
- C1: Mostly met. Axis titles, tick labels, a "today's size" dashed line label (:431-468), line legend (:528-532), age labels on each dot (:518), the grey line (:492 label). Unlabelled on canvas: nothing found, though the labels' staggered heights are explained only in the caption.
- C2: Met. The gold line and its dot move with the share (caption "Things to try").
- C3: Partly met. "How to read this diagram" (:540) beneath the graph, but only after predictions are locked (:536).
- C4: Mostly met. Names both axes, every line, the dots and labels, the grey line, with short sections and bullets (:540-640). Does not define "billion years" or "relative size" in the caption (relative size is defined in the intro :190-196).
- C5: Partly met. The caption has a boiling-pot comparison and the 0.5 example; the worked numbers (2/3 x Hubble time) are in Results, not the caption.
- C6: Not met. "Things to try" are Notice / Compare sentences, not Look at / Means / Matters.
- C7: Not met. The caption says the blue line "rises steeply at first and then flattens" because "gravity slows its expansion" (:~575) and "the gold dot moves far to the right of the blue dot" for the best fit (:~620-623); the grey-line item says the matter-only clash with the oldest stars "was one of the clues that pointed toward dark energy" (:~606-610). These show the answers to both predictions (matter-only age is shorter; dark energy makes it older) before the run.
- C8: Mostly met. Hubble time, Big Bang, dark energy, relative size defined before use (:179-196); "flat" and "Hubble tension" appear in assumptions (:224-231) by reference to earlier experiments.

## Other findings
- O1: None found against the specification in what was read.
- O2: Intro says "Experiment 5 showed it has slowed down and later sped up" (:~181), which depends on the learner having run Experiment 5 (chapters are freely reachable). The 1990s history (16 to 20 billion years, Hipparcos 1995) and "12 to 13 billion" appear in caption and Results without a source in the text; the 12.5 value is labelled "a rounded value". The bathtub and pot comparisons are unsourced. No links list.

## What an update would touch, and its size
UniverseAgeExperiment.tsx, UniverseAgeTutor.tsx, src/physics/universeAgeExperiment.ts and test, specification 06-age-of-the-universe.md. Size **M**: guess markers on one graph, a module function or two, a reading column and "What this table tells us", a caption rewrite that removes two reveals.

## Not checked
Browser rendering; the tutor's explanation text; table markup line numbers (approximate); the specification's decisions table.

---

# Re-read, 2026-11-15 (against Rule E and the 2026-11-07 rules)
Status: read-only. Nothing in the app, the specification or the tests was changed. The numbers below were worked by hand with node from the module's closed forms (the script was left in the scratchpad, not in the repo) and are not yet in a test.

## What the module returns (hand-checked, H0 = 70)
Age in billions of years, and the ratio to the Hubble time (13.97):

| Dark energy share | Age | Age / Hubble time |
|---|---|---|
| 0 (matter only) | 9.31 | 0.667 |
| 0.30 | 10.46 | 0.749 |
| 0.50 | 11.61 | 0.831 |
| 0.60 | 12.40 | 0.888 |
| 0.685 | 13.28 | 0.951 |
| 0.70 (best fit) | 13.47 | 0.964 |
| 0.80 | 15.03 | 1.076 |
| 0.90 | 17.85 | 1.278 |

1. **The age passes the "oldest star clusters" line (12.5 billion years) from a share of about 0.61 upward.** Below that the page says "younger ... cannot be the real one". The 12.5 is a rounded code value (`OLDEST_STARS_AGE_YEARS`), not a published cut-off.
2. **The age equals the Hubble time at a share of about 0.737, and equals the real 13.8 at about 0.725.** So at H0 = 70 the best fit (0.70) sits below both: 13.47 is 0.5 younger than 13.97 and 0.33 younger than 13.8.
3. **The Planck-like pair (H0 67.4, 68.5 percent) gives 13.796; 67.4 with 70 percent gives 13.986; 67.4 with no dark energy gives 9.67.** The page's three-row "Why not exactly 13.8?" box is right.
4. **Size at 4 billion years (best seen as the "early" picture):** matter only 0.569, 70 percent dark energy 0.387, constant speed 0.286. So at a fixed early time the matter-only universe is already the biggest, which is why it reaches today's size first. Not used on the page today.
5. **The age rises with the share at every step** (the module test covers 0.05 steps), so "any dark energy makes it older than matter only" is true for this model at the same H0.

## Corrections to the 2026-11-02 report
- **C7 / §12 is Not met in more places than the report said.** Besides the caption (`UniverseAgeExperiment.tsx:572`, blue line "rises steeply at first and then flattens", `:630` "gold dot moves far to the right of the blue dot", `:609-612` the matter-only clash with the oldest stars):
  - **The introduction** says "Experiment 5 showed it has slowed down and later sped up" (`:184-185`), which gives guess 2's direction and hints at guess 1, before either guess.
  - **Both guess questions carry their own hint:** question 1 says "so gravity has been slowing the expansion all along" (`:257`) and question 2 says "Dark energy speeds the expansion up in recent times" (`:276`). The first leads to "shorter", the second to "older". See question 3.
  - **The tutor's conceptual question is answered by Results first.** Tutor step 3 asks "Why might it have turned out so close?" (`UniverseAgeTutor.tsx:70`), but the Results paragraph "Why Experiment 2's estimate came out close" (`UniverseAgeExperiment.tsx:729-735`) already says the early slowdown and later speed-up "roughly cancel". The learner reads the answer before being asked.
- **A9 / verdicts:** Results says "so your prediction was right / off this time" for both guesses (`:691-693`, `:706-708`), before the tutor. Also the three-way test `isOlderThanOldestStars` drives "That is a problem ... cannot be the real one" in Results (`:717-719`).
- **A10 and the older rule:** confirmed again, no sentence says predictions do not change the results.
- **The graph, its legend, "today's size" line and the grey oldest-stars line are on screen from the moment the guesses are locked, before Run (`:416`), and so is the whole caption (`:537`).** The lines and dots appear on Run, but the legend and grey line are visible earlier. The caption's "Things to try" and the best-fit sentence give away the result.
- **A8 refined:** the module already has `isOlderThanOldestStars`, but `ACTUAL_MATTER_ONLY_AGE` and `ACTUAL_DARK_ENERGY_AGE` are component constants (`:41-42`) and the "shorter / longer" test is done in the component (`:690`). The module has no guess marker function, no marking function, no check-up and no worked-example function.
- **New finding: there is no render test for this experiment.** `src/components` has `UniverseAgeExperiment.tsx` and `UniverseAgeTutor.tsx` but no `UniverseAgeExperiment.test.tsx` (Cosmology 1 to 5 each have one). The 14 module tests exist; the interface has no test at all.

## Rule E: the page in four Parts
| Item | Result | Evidence | Gap and what would be needed |
|---|---|---|---|
| E1 | Not met | One card holds the introduction, both guesses, the share buttons, Run, the readout, the graph, the caption and Results (`:174-790`); the tutor is a second card (`:792-799`) | Part 1 (guesses, Run, pictures), Part 2 (the share control and the drawing that follows it), Part 3 (results), Part 4 (tutor) |
| E2, E4 | Not met | No Part headings or leads | Four leads, drafted for approval; Part 1's lead gives no answers (§12) |
| E3 | Not met | No links list, no words box | See "Links and Words" |

## Parts 2 to 4 appear after the first Run
**Partly met, with the same defect as Cosmology 1, 2, 4 and 5.** Results and tutor show only while the status is `complete` (`:644`, `:792`). **Choosing a different share after a run calls `setStatus('idle')` (`:96`, `:377`), which hides the Results and unmounts the tutor, and Run remounts the tutor from its first question (`key={runCount}`, `:794`).** Suggested fix: after the first Run, Parts 2 to 4 stay; a changed share changes only Part 2's drawing and "your universe" rows until its own Run; the tutor is not remounted.

## "Start over, not Change prediction" (2026-11-07 rule)
**Not met.** "Change predictions" appears only after the guesses are locked (`:308-328`) and reopens both questions without clearing the share or the results (`handleChangePrediction`, `:112`). It becomes an always-visible "Start over", greyed out until a guess is chosen or a run exists and while a run plays, which clears the guesses, runs, results and tutor progress. Replaced, and said so in the specification.

## Predictions and where their answers live (A5, sharpened)
Both answers live on the one graph, so **no new picture or panel is needed** (A5 met). Both guesses compare two dots on the "today's size" line.
- **Guess 1 (matter-only age against Experiment 2's constant-speed estimate: longer, shorter or the same):** the real answer is the blue dot (9.31) against the purple dot (13.97). Suggested: a white **marker** on the "today's size" line, joined by a line to the purple dot: to its left for "shorter", at the dot for "the same", to its right for "longer", in a YOUR GUESS box. **Marker only** (the three answers carry no size); the caption says so. Drawn after the blue and purple dots are drawn.
- **Guess 2 (adding dark energy: older, younger or the same age as matter only):** the real answer is the gold dot (13.47 at the best fit) against the blue dot (9.31). Suggested: the same kind of white marker, joined to the blue dot, left, at or right. **Marker only.** Drawn after the gold dot is drawn.
- **Where the real picture comes from.** *Calculated here:* all three lines and every age (a flat model of matter plus a constant dark energy; H0 = 70 is the project's illustrative value). *Measured:* the real age 13.8 billion years (a given value, source to be read) and the oldest clusters at about 12.5 (a rounded value, source to be read). *Imagined for the question:* the matter-only universe, the constant-speed line (Experiment 2's simplified picture) and the share chosen in Part 2.

## Links and Words (2026-11-07 rules)
- **Words and formulas box (new).** Entries: age of the universe, Hubble time, Hubble constant, Hubble tension, relative size, expansion history, Big Bang, dark energy, matter, flat universe, radiation, inflation, star cluster, billion years, and redshift only if the page really uses it (see "Wording and claims"). Formulas with worked examples from the page's own numbers: matter-only age = (2/3) × Hubble time = (2/3) × 13.97 = 9.31 billion years; the dark-energy age formula with its worked case at 70 percent (13.47). **Held back until after the Run (§12):** the "two thirds" fact and the formula's result, because they give guess 1's answer away; the box would carry the definition of the Hubble time only.
- **"Want to know more?" links (new).** None exists. Candidates to search and read (none read here): a plain NASA or ESA page on the age of the universe or the cosmic expansion history; the Planck 2018 results paper (arXiv 1807.06209) for 13.8 billion years and 67.4; a current paper on the ages of the oldest star clusters; a plain page on the Hubble tension (already used by earlier experiments); and Riess 1998 and Perlmutter 1999 (read for Cosmology 5). Per §29 rule 3(c), link only what is read and record any gap.

## Wording and claims to check (new and restated)
- **The oldest star clusters, "about 12.5 billion years (a rounded value)"** (`:601`, `:716`, module `:11`). The specification's check of 2026-10-07 used Wikipedia and arXiv papers from 1997 and 1999, not an official page, and the module comment says "Not checked against a source". Needs a current source. A new constant would change `OLDEST_STARS_AGE_YEARS`, the pass band and the tests, which is a physics decision (question 7).
- **The 1990s history** (16 to 20 billion years early in the 1990s, the Hipparcos satellite of 1995) (`:611-613`, `:722-727`). Sourced only to Wikipedia and 1997 to 1999 papers, per the specification's note. Keep only if read in a source from an official or primary page; otherwise soften or drop (question 8).
- **"The real measured age (a given value)" 13.8 billion years** (`:665`). It has no source on the page. Needed for the check-up's reference. Planck 2018 is the likely source but is **not read**.
- **"Published values range from about 67 to 73, the Hubble tension"** (`:235`). Unsourced here (earlier experiments cover it). It needs "as of November 2026" and a pointer to Cosmic Horizons' Hubble tension experiment, if the owner agrees.
- **Dark energy "constant"** is an assumption (`:229`). Recent DESI results (read for Cosmology 5) suggest it may change with time; a pointer to Cosmic Horizons' dark-energy experiment would be the same as in Cosmology 5.
- **"We reuse ... redshift"** (`:219-221`). The experiment does not use redshift (the specification's own implementation note says so). Default: drop it from the line.
- **Heading and title mismatch:** the page heading is "Experiment 6 — How Old Is the Universe?" (`:172`), the sidebar title is "The Age of the Universe" (`src/App.tsx:756`) and the specification's title is "How Old Is the Universe?". It would read **Cosmology 6: ...** (the pattern of Cosmology 1 to 5); which of the two names is the owner's call (question 11).
- **Cross-references say "Experiment 2", "Experiment 5", "Experiment 1"** (`:178`, `:184`, `:228`, `:234`, tutor). They would be checked against the sidebar names and the group name added.
- **"Experiment 5 showed it has slowed down and later sped up"** depends on the learner having run Experiment 5 (chapters are freely reachable), and gives answers (see C7).
- **The bathtub picture** (`:207-212`) is neutral and matches the specification (decision 7); it is unsourced but it is a daily-life picture, not a fact.
- `onComplete` fires on every Run; not harmful.

## B1 to B3, recommendation
Real references exist for several rows. Suggested **check-up table**:
- (a) **Your universe's age against the measured age**, 13.47 (at the best fit) against 13.8. Reading: "less, by 0.33". Needs a read source for 13.8; no "close enough" cut-off.
- (b) **The Planck-like pair against the measured age:** 13.80 against 13.8. Reading: "the same, to the digits shown" (a source for 67.4 and 68.5 percent to be read first).
- (c) **Matter only against the oldest clusters:** 9.31 against about 12.5. Reading: "less". Needs a read source for the clusters' age, and the page must say the 12.5 is rounded.
- (d) **The constant-speed estimate against the measured age:** 13.97 against 13.8. Reading: "more, by 0.17".
- (e) **Matter-only age against the Hubble time:** 9.31 against 13.97, ratio 0.667. Reading: "less (two thirds)". This is calculated here, not measured, so it is shown as "calculated here only".
"What this table tells us" under each, with the bathtub and car trip as the daily-life anchors (the car trip is already in the tutor, after the run).
**Setting-following table (item 3):** the existing four-row "ages" table already follows the control ("Your universe") and a real reference exists (13.8). Suggested: add "Published value" and "How yours compares" columns and a "What your numbers show" paragraph using "trial values", **because** the 13.8 marker does not appear on the graph, so the table tells the learner something the picture does not. The alternative is to leave the table as it is (question 6).
**The learner's guesses** shown beside the results with a tag on the row where the number appears (guess 1 at the matter-only row, guess 2 at the your-universe row), guess only. All need module functions and tests.

## Updated size
**Medium to Large** (was Medium). Two white marks on one graph, the page rebuilt around four Parts with a second drawing in Part 2, a check-up and notes, a words box, links to be searched and read, a rewritten introduction and caption with the §12 fixes, results text moved to the tutor, a tutor that marks both guesses, and a new render test file. The module needs guess-marker positions, tutor marking, the 0.61 and 0.737 bands if used, check-up rows and worked examples, with tests. **No change to approved physics.**

## Questions for the owner before drafting
1. **What does Part 1 show, and what does Part 2 change?** Suggested default: Part 1 is fixed at the best fit (70 percent): the graph with the purple, blue and gold (best-fit) lines, one Run, no share control. Part 2 holds the share control (none, best fit, custom 0 to 90 percent), its own graph and the readout for the learner's own share. Parts 2 to 4 appear after the first Run.
2. **Guess marks.** Suggested default: one white marker for each guess on the "today's size" line, joined to the dot it is compared with (the purple dot for guess 1, the blue dot for guess 2), each in a YOUR GUESS box, drawn only after the dots they sit beside; the caption says they are markers only.
3. **The two guess questions and the introduction.** Suggested default: reword neutrally. Question 1: "If the universe held only matter and no dark energy, would its age be longer than, shorter than or the same as Experiment 2's constant-speed estimate?" Question 2: "Compared with a matter-only universe that has the same expansion rate today, would adding dark energy make the universe older, younger or the same age?" Remove "Experiment 5 showed it has slowed down and later sped up" from above Part 1; the tutor says it afterwards.
4. **Results and tutor.** Suggested default: move "so your prediction was right / off" and the oldest-clusters "That is a problem ..." verdict to the tutor; move "Why Experiment 2's estimate came out close" out of Results (the tutor asks it as step 3 and explains it); keep the table and the "A simple calculation" paragraph; show both guesses beside the results with a tag on the row.
5. **Check-up table.** Suggested default: rows (a) to (e) above, each only if its source is read; readings "less", "more", "the same"; no "close enough".
6. **A setting-following table.** Suggested default: add "Published value" and "How yours compares" columns and the "What your numbers show" paragraph (trial values), keeping the four rows.
7. **The 12.5-billion-year clusters line.** Suggested default: search and read a current source; keep 12.5 as a rounded value if it fits; if a different figure is better, bring it to you first, because changing the constant is a physics decision.
8. **The 1990s history and the Hipparcos claim.** Suggested default: re-source from a read page; keep only what is read, soften or drop the rest (as in Cosmology 2, 4 and 5).
9. **Links and words.** Suggested default: search and read a plain NASA or ESA age or expansion-history page, Planck 2018, an oldest-clusters paper and the Hubble tension page; link only what is read and record any gap. The "two thirds" fact is held back until after the Run.
10. **"Change predictions" replaced** by an always-visible "Start over" (the standing rule). Listed so you can see it. Suggested default: yes.
11. **Heading and name:** "Cosmology 6: ..." with which title (the sidebar's "The Age of the Universe" or the specification's "How Old Is the Universe?"), and the sidebar's names for the cross-referenced experiments. Suggested default: the sidebar's title.
12. **Dark energy "constant" and the Hubble tension.** Suggested default: add "as of November 2026" lines and pointers to the Cosmic Horizons dark-energy and Hubble tension experiments, and drop "redshift" from the "we reuse" line.

## Not checked (re-read)
Not run in a browser; narrow widths and dark mode not looked at; no source page searched or fetched, so 13.8, 67.4 and 68.5, the 12.5 and the 1990s cluster-age history are **not verified**; the specification was read in full but not compared line by line with the page; the tutor was read in full; the module's 14 tests were counted and not re-run; line numbers are from the files as read today; the numbers above were made by hand with node and are not yet in a test.
