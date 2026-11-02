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
