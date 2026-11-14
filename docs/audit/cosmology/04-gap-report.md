# Gap report: Cosmology Experiment 4 (Dark Matter: why do galaxies spin too fast?)
Date: 2026-11-02 | Specification: docs/experiments/cosmology/04-dark-matter.md | Components: src/components/DarkMatterExperiment.tsx, DarkMatterTutor.tsx (not DarkMatterSearches*, which is Cosmic Horizons) | Physics module: src/physics/darkMatterExperiment.ts (+ .test.ts, 10 tests) | Status: read-only, nothing changed

## Summary
Two pictures in one frame (a face-on galaxy with orbiting stars and a purple "dark matter" glow; a speed-against-distance graph with three lines), a "how much dark matter" control (none / matches / custom), two predictions, Results with one table (speeds at three distances), a worked example, a 3-prompt tutor. This is the richest of the older Cosmology experiments, and both predictions have a natural home on the graph (the blue visible-only line and the green measured line). Missing: guess marks, "Where the real picture comes from", a check-up, "What this table tells us", a three-part look-for list, tags on rows. Verdicts are in Results. Size: **M**.

## Predictions found (A0)
| # | Question | Answers | Where the answer lives on a picture |
|---|---|---|---|
| 1 | If visible matter were all the mass, how does a far star's speed compare with a nearer star's? (DarkMatterExperiment.tsx:298-300; state :90, :92) | Faster / the same / Slower (`speedComparisonChoices`) | The blue "predicted from visible matter only" line on the graph (:569-700): its slope from 5 to 30 kpc |
| 2 | Will the measured speeds match what visible matter predicts? (:~316-320; state :91, :93) | match / faster / slower (`measuredChoices`) | The green dashed "observed speed (about 220 km/s)" line against the blue line (:691-699) |

## Rule A
| Item | Result | Evidence | Gap and what would be needed |
|---|---|---|---|
| A0 | Met | above | |
| A1 | Met | `runDarkMatterExperiment(amount)` depends only on the dark matter amount (module :85); predictions used only in text (:790-809) and tutor props (:835-838) | none |
| A2 | Not met | No guess element in the SVGs (:454-700) | White "YOUR GUESS" box on the graph: Prediction 1 a straight guess line (down / flat / up); Prediction 2 a mark beside the green line |
| A3 | Not met | | Predictions are 3-way: a drawn tendency line is possible for Prediction 1; Prediction 2 a marker; caption must say which |
| A4 | Not met | The graph's purple line appears at Run (:~705); blue and green are drawn from the start | Draw guess marks after the run finishes |
| A5 | Met (picture exists) | graph has both quantities | none: the predicted quantity (speed vs distance) already has a graph |
| A6 | Not met | no "Where the real picture comes from" line | Needed: 220 km/s (measured, given, rounded; module :25); the blue and purple lines calculated here from an illustrative mass model (module :9-22: "tuned for this teaching model, not taken from a published fit"); the glow imagined |
| A7 | Not met | Intro (:207-296) never says guesses do not change the pictures, nor that white marks are drawn; no note beside the amount buttons (:372-436) | Add sentences and a note |
| A8 | Not met | `ACTUAL_SPEED = 'slower'`, `ACTUAL_MEASURED = 'faster'` constants in the component (:39-40); `amountVerdict` is derived in the component (:185) rather than in the module | Module functions for the guess lines and for the "matches within 5%" verdict (the 5% threshold is tested in darkMatterExperiment.test.ts:32 but the verdict itself is not) |
| A9 | Not met | Tutor compare prompt (DarkMatterTutor.tsx:73-74) restates the guess; names no mark; the right/off verdicts are in Results (Experiment.tsx:797, :808) | Marks named in prompts; owner decides where verdicts go |
| A10 | Not found | No "predictions do not change" sentence in the experiment or tutor | Absent despite CLAUDE.md §14's description |

## Rule B
- B0: Results (:744-830): a table "Distance / Visible matter only / With your dark matter / Measured (about)" for 3 radii (:760-785); a verdict sentence on the chosen amount (:787-793); two "Checking your ... prediction" paragraphs; a worked example with v = sqrt(G x M / r); a Vera Rubin and Kent Ford note; a "Remember" note.
- B1: Not met as a check-up. A real reference exists: 220 km/s (the Milky Way near the Sun, given). The table already sets the measured column beside the model; a "reading" column ("less", "about the same", "more") is missing, and a 5% cut-off is a code value (test :32), not a published one, so should not be called "close enough".
- B2: Not met. No "What this table tells us" under the table; the worked example and verdict sentence partly cover it.
- B3: Partly. The table does follow the control ("With your dark matter"), and a published reference (220 km/s) exists. It lacks the "Published value / How yours compares" wording and the "trial values" closing line.
- B4: Partly met (guess in prose with verdict; no row tag).
- B5: Partly met: speeds come from the module; the comparison sentence is component logic.

## Rule C
- C1: Mostly met. Graph legend labels the three lines (:691-699); picture title (:478); "visible matter" and rings; stars and the glow are named in the caption (:710-716) and one centre label (:527). Not confirmed as labelled on canvas: the three small orbiting stars and the dashed rings (named only in the caption).
- C2: Met. Different dark matter amount changes the purple line, glow and star speed (caption :731-735).
- C3: Partly met. "How to read this diagram" (:710) shown only after predictions are locked (:707).
- C4: Mostly met. Names both pictures, colours, lines, what the glow means (:710-735). It does not define "kpc" or "km/s" (kpc, rotation curve and solar masses are defined in the intro "New terms" :246-253).
- C5: Partly met. A worked example exists in Results (:826-835 region, v = sqrt(4.3x10^-6 x M / 8)), not in the caption.
- C6: Not met. Items are "Compare ..." sentences, not Look at / Means / Matters.
- C7: Partly met. The caption describes the lines without stating which is right. But the intro already links "more mass inside the orbit means a faster orbit is needed" (:215-216) and the Results shows measured "about 220 km/s". The caption item "the stars orbit at the speed of the purple line" is mechanism, fine. Caption does not give the answer.
- C8: Mostly met: dark matter, rotation curve, kpc, solar mass defined before use (:221-253); "Newtonian gravity" and "pseudo-isothermal" are not defined for the learner (the latter is only in the module comment).

## Other findings
- O1: None found against the specification in what was read.
- O2: The mass model's constants are "tuned for this teaching model" (module :19-20) and the intro says "chosen so the results land near the Milky Way's real values" (:276-277): consistent. Unsourced: Neptune "about 5.4 km/s" and Earth "about 30 km/s" (Results), the Rubin and Ford 1970s note. The intro's closing of the "sealed box" and ball-on-string comparisons are unsourced. No links list.

## What an update would touch, and its size
DarkMatterExperiment.tsx, DarkMatterTutor.tsx, src/physics/darkMatterExperiment.ts and test, specification 04-dark-matter.md. Size **M**: marks on one graph, a verdict moved into the module, a check-up reading column and a "What this table tells us" note, caption rewrite.

## Not checked
Browser rendering; the purple-line draw timing (:~705 is from a quick read); the tutor explanation text; the specification's decisions table.

---

# Re-read, 2026-11-14 (against Rule E and the 2026-11-07 rules)
Status: read-only. Nothing in the app, the specification or the tests was changed. The numbers below were worked by hand with node (nothing left in the repo) and are not yet in a test.

## What the module returns (hand-checked)
Speeds in km/s at 5, 8, 16 and 30 kpc:

| Dark matter amount | 5 kpc | 8 kpc | 16 kpc | 30 kpc |
|---|---|---|---|---|
| 0 (visible matter only) | 195.5 | 169.3 | 131.2 | 100.6 |
| 0.5 | 209.2 | 195.3 | 181.1 | 172.9 |
| 1 (the matching amount) | 222.0 | 218.3 | 219.9 | 222.8 |
| 1.5 | 234.2 | 239.0 | 252.9 | 263.4 |
| 2 | 245.7 | 258.1 | 282.0 | 298.6 |

1. **Visible-only speed falls by 49 percent from 5 to 30 kpc** (195.5 to 100.6). At 30 kpc it is 46 percent of the measured 220; at 8 kpc, 77 percent.
2. **Dark matter is about 40 percent of the mass inside 8 kpc and about 80 percent inside 30 kpc** at amount 1 (visible 5.3 x 10^10 solar masses at 8 kpc, 34.6 x 10^10 in total at 30 kpc). The 40 percent matches the specification; the 80 percent at 30 kpc is new, from the module, and not sourced.
3. **The "within 5 percent at every distance" test passes for amounts from about 0.86 to 1.09**, not only at exactly 1. The Results sentence "this amount matches" is therefore true over a band. The 5 percent is a code threshold, not a published one.
4. **The page's own graph shows no spread in the measured line.** Real rotation curves are not flat (the specification says so). The green line is a given reference, not data.

## Corrections to the 2026-11-02 report
- **A10 / Results verdicts:** the Results gives "so your prediction was right / off this time" for both guesses (`DarkMatterExperiment.tsx:796-809`), before the tutor. §14 leaves marking to the tutor.
- **C7 is Not met for Prediction 1, not "Partly met".** The introduction says "more mass inside the orbit means a faster orbit is needed" and then, in "What to look for", names the blue line as the speed "predicted from visible matter only". That is true and not a hint by itself. But the introduction's "daily-life picture" (ball on a string) and the "sealed box" paragraph both lead to "the scale reads more than what you see", which points at Prediction 2's answer before the guess. I mark the sealed-box paragraph as a §12 risk for the owner to rule on (question 4).
- **The graph is hidden until the guesses are locked (`:568`) but the halo and stars are shown from the start.** The galaxy picture with a purple halo already on screen at the default "matches observations" amount (`mode` starts as `'match'`, `:84`) shows dark matter being present before the learner has predicted whether any is needed. This is a §12 problem for Prediction 2 and was not in the 2026-11-02 report. Suggested fix: Part 1 draws the galaxy with no halo; the halo appears in Part 2.
- **The amount control is shown from the start** (disabled until both guesses are made, `:377`) and the default amount is "matches", so the first Run shows the answer line (purple on top of green) as Part 1's result. See question 1.

## Rule E: the page in four Parts
| Item | Result | Evidence | Gap and what would be needed |
|---|---|---|---|
| E1 | Not met | One card holds the introduction, both guesses, the amount buttons, Run, the readout, both pictures, the caption and Results (`:204-832`); the tutor is a second card | Part 1 (guesses, Run, pictures), Part 2 (the amount control and its drawing), Part 3 (results), Part 4 (tutor) |
| E2, E4 | Not met | No Part headings or leads | Four leads, drafted for approval; Part 1's lead gives no answer (§12) |
| E3 | Not met | No links list, no words box | See "Links and Words" |

## Parts 2 to 4 appear after the first Run
**Partly met, with the same defect as Cosmology 1 and 2.** The Results and tutor appear when the status is `complete` (`:736`, `:834`). **Changing the amount after a run calls `setStatus('idle')` (`:104`, `:416`), which hides the Results and unmounts the tutor, and Run remounts the tutor from its first question (`key={runCount}`, `:836`).** The amount buttons are also disabled until both guesses are made (`:377`). Suggested fix: after the first Run, Parts 2 to 4 stay; a changed amount changes only the Part 2 drawing until its own Run; the tutor is not remounted.

## "Start over, not Change prediction" (2026-11-07 rule)
**Not met.** "Change predictions" appears only after the first Run (`:351-371`) and re-opens the guesses without clearing the results (`handleChangePrediction`, `:120`). It becomes an always-visible "Start over", greyed out until a guess is chosen or a run exists and while a run plays, which clears the guesses, runs, results and tutor progress. Replaced, and said so in the specification (no need to ask).

## Predictions and where their answers live (A5, sharpened)
- **Prediction 1 (a far star's speed against a near star's, visible matter only: faster, slower, about the same):** the answer is the slope of the blue line from 5 to 30 kpc. Suggested: a white **guess line** drawn on the graph from the blue line's 5 kpc point, going **up**, **flat** or **down** by a fixed illustrative amount, labelled YOUR GUESS (a tendency, not a number; the caption says it has no size of its own). Drawn once the blue line is drawn.
- **Prediction 2 (will the measured speeds match the visible-matter prediction: match, faster, slower):** the answer lives at the gap between the green dashed line and the blue line, best read at 30 kpc (220 against 101). Suggested: a **white marker beside the green line at 30 kpc**: a bracket joining the two lines for "match", an arrow above the blue line pointing up for "faster", an arrow pointing down for "slower", with a YOUR GUESS box. **Marker only** (three answers carry no size); the caption says so.
- **Both guesses sit on the existing graph; no new panel is needed.** Both are drawn after Run, once the blue and green lines exist, and neither depends on the amount control.
- **"Where the real picture comes from":** *measured*: the 220 km/s (the Milky Way near the Sun; given, rounded; **source not read**); *calculated here*: the blue and purple lines, from an illustrative mass model (constants tuned by Claude, not a published fit), and the orbit periods; *imagined for the question*: the purple glow, the dark matter amount, and the three marker stars' positions. Distinguishing these three is the main point of this section, because the blue line is not a measurement.

## Links and Words (2026-11-07 rules)
- **Words and formulas box (new).** Entries: galaxy, orbit, gravity, mass, solar mass, kiloparsec (kpc), light-year, km/s, rotation curve, visible matter, dark matter, Doppler effect, Newtonian gravity, circular orbit, halo, "inferred", MOND. Formula and worked example, from the page's own numbers (checked above): v = sqrt(G x M / r), G = 4.3 x 10^-6; at 8 kpc, M = 5.3 x 10^10: v = sqrt(4.3 x 10^-6 x 5.3 x 10^10 / 8) = sqrt(28,500) = 169 km/s. Also one lap = 2 x pi x r / v. **Held back until after the Run (§12):** that measured speeds stay high far out, and that the blue line falls.
- **"Want to know more?" links (new).** None exists. Candidates to search and read (none read): a plain NASA, ESA or observatory page on dark matter and rotation curves; Rubin and Ford 1970 (Astrophysical Journal 159, 379) and Rubin, Ford and Thonnard 1980; a plain official page on the Doppler effect for starlight; the source of "roughly five times as much dark matter as ordinary matter" (Planck 2018 or NASA); a plain page on Neptune and the 1846 discovery (a background idea in the tutor); a plain page for MOND, if one can be found. Per §29 rule 3(c), link only what is read and record any gap.

## Wording and claims to check (new and restated)
- **Unsourced and unchanged since 2026-10-06 (the specification records them as "from general knowledge"):** Rubin and Ford's 1970s measurements including Andromeda; the 1846 Uranus and Neptune story; Earth about 30 km/s and Neptune about 5.4 km/s; "roughly five times as much" dark matter as ordinary matter; the MOND characterisation; the Doppler method.
- **"About 220 km/s ... many other galaxies"** (introduction, `:284-286`): the page says the measured speed is "about 220 km/s (the Milky Way near the Sun, and many other galaxies)". As one line it implies every galaxy has the same speed. Real values differ between galaxies. Owner to rule (question 7).
- **"Experiment 4" in the heading** (`:202`) has no group name; the sidebar says "Dark matter" under Cosmology. It would read **Cosmology 4: Dark Matter** (matches the Cosmology 1 to 3 pattern).
- **Cross-references say "Orbits experiment (Gravity and Curved Spacetime, Experiment 6)", "Experiment 1 of this chapter" and "Gravitational Waves Experiment 5"** (`:211, :243`). The learner's names are in the sidebar; they would be checked against it.
- **"Newtonian" and "pseudo-isothermal"** are not defined for the learner (the second appears only in a module comment). Newtonian goes in the words box.
- **The page's blue line is a teaching model whose constants were chosen to land near the Milky Way**, and the intro says so. The Part 3 check-up would repeat it: the blue line is not data.
- **"Dark matter ... has never been seen directly"** (tutor point 4) and **"modified-gravity ideas such as MOND ... have a harder time with other observations"** are current-status statements (§29 rule 1: "up to date"). They have no read source and would need the date.
- `onComplete` fires on every Run; not harmful.

## B1 to B3, recommendation
A real reference exists for one row only: the measured speed near the Sun, about 220 km/s (to be read). Suggested **check-up table** (distances 5, 8, 16, 30 kpc, amount-independent rows only):
- (a) **Visible matter only against the measured 220**, at 8 kpc (169 against 220: "less", by 23 percent) and at 30 kpc (101 against 220: "less", by 54 percent). The module computes both; no accepted cut-off exists, so the reading is "less", not "far off".
- (b) **The matching amount against the measured 220**, at the same distances: "the same": 218 at 8 kpc and 223 at 30 kpc, within 1.3 percent of 220 at every distance. Calculated here only; the amount was tuned to do this, so the note says it is **not an independent test**.
- (c) **The share of the mass inside the orbit that is dark matter, at the matching amount:** 40 percent at 8 kpc, 80 percent at 30 kpc. The specification says the 40 percent is in the range astronomers estimate near the Sun, not claimed as precise; a published range must be read before it is shown as a reference. If none is read, the row shows "calculated here, no published value read".
- (d) **Period at 8 kpc at the matching amount against the Sun's real lap of about 230 million years** (the model gives about 225). The specification's test uses 230 million years; the source is **not read**.
"What this table tells us" under each, with the ball-on-a-string or sealed-box comparison already in the introduction as the daily-life anchor.
**Setting-following table (item 3):** the amount buttons change the purple line, and the "With your dark matter" column is already a table that follows the control. A real reference exists (220), so it would be kept with "Published value / How yours compares" columns and the "trial values" line, **or** dropped, as Experiment 14 dropped its Table 4, because the purple line on the graph already shows it. Owner to rule (question 6).
**The learner's guesses** shown beside the results, with a tag on the table row, guess only.
All need module functions and tests.

## Updated size
**Medium to Large** (was Medium). The two guess marks on one graph are the easy part. The page rebuilt around four Parts, the halo and amount moved to Part 2, a check-up with a reading column, the Part 3 notes, a words box, links to be searched and read, a rewritten introduction with the §12 fixes, and a tutor that marks both guesses make up the bulk. A module (guess-line and marker numbers, tutor marking, the 5 percent verdict moved out of the component, the check-up rows, the dark-matter share, worked examples) and tests are needed. **No change to approved physics.**

## Questions for the owner before drafting
1. **What does Part 1 show, and what does Part 2 change?** Suggested default: Part 1 draws the galaxy with **no halo** (visible matter only, the three stars at their visible-only speeds), the blue and green lines on the graph and one Run; Part 2 holds the amount control (none, matching, custom 0 to 2) with the purple line, the halo and the faster stars. Part 1's Run no longer shows the purple line. Parts 2 to 4 appear after the first Run. This removes the §12 problem in the corrections above.
2. **Guess marks.** Suggested default: Prediction 1 as a white guess line from the blue line's start (up, flat or down; a tendency with no size of its own); Prediction 2 as a white marker beside the green line at 30 kpc (bracket, up arrow, down arrow; marker only); each with a YOUR GUESS box; drawn after Run; the caption says what is only a marker.
3. **Introduction.** Suggested default: shorter and neutral. Keep the question, the weighing-by-orbit idea, the Doppler line and the terms. **Hold back until after Run** the sealed-box paragraph's "scale reads more than the window shows" (it points at Prediction 2) and keep the ball-on-a-string picture. Add the Parts paragraph, the guess paragraph (the guesses never change the pictures or tables; they are drawn in white and shown again beside the results; the amount control does change the purple line and the halo) and "Some new words". Owner to confirm which of the sealed-box and ball-on-string paragraphs stay above Part 1.
4. **Results.** Suggested default: move "so your prediction was right / off" to the tutor; keep the worked example; show both guesses beside the results with a tag on the row.
5. **Check-up table.** Suggested default: rows (a), (b) and (d) from the list above, with (c) only if a published range is read; "less", "the same" and "calculated here only" as the readings; no "close enough".
6. **A setting-following table.** Suggested default: **drop it** (the purple line on the graph already shows the control), as Experiment 14 dropped its Table 4. Keep the "With your dark matter" column in the speeds table as it is, if you prefer.
7. **The "about 220 km/s ... many other galaxies" line.** Suggested default: reword to say the 220 is a rounded value near the Sun, and that other galaxies have their own values, with no claim that they share it.
8. **Links and words.** Suggested default: search and read a plain NASA or ESA dark-matter page, Rubin and Ford 1970 (and the 1980 paper), a plain Doppler page and a source for the "five times" figure; link only what is read and record any gap (Neptune and MOND are likely gaps). Reuse Cosmology 1's Doppler wording only after re-reading it.
9. **"Change predictions" replaced** by an always-visible "Start over" (the standing rule). Listed so you can see it. Suggested default: yes.
10. **Heading and cross-references:** "Cosmology 4: Dark Matter", the sidebar's names for the other experiments, and the specification's status lines in the Audit Update. Suggested default: yes.
11. **The unsourced tutor and Results facts** (Rubin and Ford, Uranus and Neptune, 30 and 5.4 km/s, "five times", MOND, "never seen directly"). Suggested default: search and read sources before drafting; keep a fact only if it is read, and soften or drop the rest, as in Cosmology 2. Your call on any you want kept as it is.

## Not checked (re-read)
Not run in a browser; narrow widths and dark mode not looked at; no source page searched or fetched, so 220 km/s, the 230-million-year lap, "five times as much", Rubin and Ford, the 1846 story and MOND are **not verified**; the tutor's wording was read in full and the specification compared for the wording and behaviour cited, not line by line; the module's tests were listed (10 cases) and not re-run; line numbers are from the files as read today; the table of numbers was made by hand with node and is not yet in a test.
