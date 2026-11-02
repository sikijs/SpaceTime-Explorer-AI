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
