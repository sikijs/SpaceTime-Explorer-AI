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

---

# Re-read, 2026-11-14: Rule E and the owner's rules of 2026-11-02 to 2026-11-07
Read-only. Re-read of `HubblesLawExperiment.tsx` (586 lines), `HubblesLawTutor.tsx` (138), `hubblesLawExperiment.ts` (66) and the specification `01-hubbles-law.md`, following the Gravity 1 to 9 audits. Nothing in the app changed. Rules A to C above stand as written **except two corrections (see "Corrections to the 2026-11-02 report")**; this section adds what they did not cover.

## What the module returns (H0 = 70 km/s/Mpc, c = 299,792.458 km/s; checked by hand with node, not yet in a test)
| Distance (Mpc) | Recession speed (km/s) | z | Stretch factor (1 + z) |
|---|---|---|---|
| 16.5 (Virgo preset) | 1,155 | 0.00385 | 1.00385 |
| 33 (twice Virgo) | 2,310 | 0.00771 | 1.00771 |
| 100 (Coma preset) | 7,000 | 0.02335 | 1.02335 |
| 200 (slider maximum, "very distant" preset) | 14,000 | 0.04670 | 1.04670 |

1. **Both guesses have one clear answer for any pair of distances.** Speed and z are exactly proportional to distance, so a galaxy twice as far has exactly twice the speed (2,310 against 1,155 km/s) and twice the z.
2. **The page only ever shows one galaxy at a time**, yet both guesses compare two galaxies ("Galaxy A twice as far as Galaxy B", "the nearer or the farther"). The learner has to run two galaxies and compare them from memory. Nothing on the page shows the pair.
3. **The picture's colour and wave are exaggerated** (`:35`, `:62`): z of 0.05 is drawn as full red and a wave three times as wide; the real z at 200 Mpc is 0.047, so the farthest galaxy looks almost fully red while the real stretch is under 5 percent. The caption says so, but only after the guesses are locked.

## Corrections to the 2026-11-02 report
- **C7 was marked "Met" and is not.** The caption's second bullet (`:495-501`) says "A farther galaxy's light visibly reaches a deeper red, and a wider spacing between its peaks, by the time it arrives than a nearer galaxy's does". That is the answer to guess 2, in the caption, shown as soon as the guesses are locked and before the first Run (§12). **Not met.**
- **The introduction also gives guess 2's answer** (`:~190`): "The farther away a galaxy is, the more its light is stretched." It also says the Hubble constant is "the rate things stretch with distance", which answers guess 1 in effect. Its "What to look for" ("compare how much the color shifts") points at the answer. The report did not check the introduction against §12. **Not met.**

## Rule E: the page in four Parts
| Item | Result | Evidence | Gap and what would be needed |
|---|---|---|---|
| E1 | Not met | One card holds the introduction, both predictions, the galaxy buttons, Run, the readout, the picture and Results (`:177-575`); the tutor is a second card | Part 1 (predictions, Run, the pictures), Part 2 (the galaxy control), Part 3 (results), Part 4 (tutor). |
| E2, E4 | Not met | No Part headings or leads | Four leads, drafted for approval; Part 1's lead gives no answer (§12). |
| E3 | Not met | No links list, no words box | See "Links and Words". |

## Parts 2 to 4 appear after the first Run
**Partly met, with a defect.** The Results and the tutor appear after the first Run completes (`:~335`, `:~575`), and the galaxy buttons are visible from the start but disabled until both guesses are made (`:~245`). **But changing the galaxy, or moving the custom slider, sets the status back to idle (`:~141`, `:~330`), which hides the Results and unmounts the tutor, and pressing Run again remounts the tutor from its first question** (`key={runCount}`, `:~580`). A learner who tries a second galaxy loses the results and the tutor progress. This is the opposite of the 2026-11-07 rule. Suggested fix: once the first Run has finished, Parts 2 to 4 stay; changing a setting changes only the Part 2 drawing until the next Run; the tutor is not remounted.

## "Start over, not Change prediction" (2026-11-07 rule)
**Not met.** The page has a "Change predictions" button (`:~236`) that appears only after the first Run. It must be replaced by an always-visible "Start over", greyed out until a guess is chosen or a run exists and while a run plays, which clears the guesses, runs, results and tutor progress; the page also says the guesses are locked after Run. Replaced, and said so in the specification (no need to ask the owner).

## Predictions and where their answers live (A5, sharpened)
- **Guess 1 (speed of A against B: twice, the same, half):** the answer is two recession speeds. **No picture shows a speed.** Suggested: a second panel in the same picture (the owner's rule: no separate picture), "Recession speed", with a horizontal bar for each galaxy on its own scale in km/s, and a white bar for the guess (A's speed if the guess is right for B's: twice B's bar, the same length, or half), joined to a YOUR GUESS box. A real bar shows the real number (1,155 and 2,310 km/s in the default pair).
- **Guess 2 (nearer, farther, or no difference looks redder):** the answer is the colour and wave spacing of the light as it arrives, and the ring round Earth. Suggested: both galaxies drawn in the one picture as two rows (B and A), each with its own light wave and its own ring at Earth. A white marker (a marker only, A3) on the row, or between the rows for "no difference", with a YOUR GUESS box. Drawn only when the waves have reached Earth (A4).
- **One Run shows both galaxies** (a pair at distances B and 2B), so both guesses can be met from the first Run, and Parts 2 to 4 can appear after it. Without this, each guess needs two runs, which breaks the 2026-11-07 rule. This is **question 1**.
- **"Where the real picture comes from":** *calculated here* (z = H0 × d ÷ c, with H0 = 70 chosen as a round value; the speeds, the stretch factors); *measured*: the distance of the Virgo Cluster and the Coma Cluster (the page's 16.5 and 100 Mpc are not sourced on the page), and the published range 67 to 73 for the Hubble constant (not shown on the picture, named beside it); *imagined for the question*: the colour and the wave width are drawn far stronger than the real stretch, and the "twice as far" galaxy is a schematic, not a real galaxy.

## Links and Words (2026-11-07 rules)
- **Words and formulas box (new).** Entries: redshift, wavelength, megaparsec (Mpc), recession speed, Hubble's Law, Hubble constant, cosmology, Doppler effect, Hubble tension, km/s, z. Formulas, with a worked example from the page's own numbers (checked against the module): v = H0 × d = 70 × 16.5 = 1,155 km/s; z = v ÷ c = 1,155 ÷ 299,792.458 = 0.00385; stretch factor = 1 + z = 1.00385. **Held back until after the Run** (§12): that speed and z are proportional to distance, since that answers both guesses.
- **"Want to know more?" links (new).** None exists. Candidates to search (none read): the original paper (Hubble 1929, *PNAS*, "A relation between distance and radial velocity among extra-galactic nebulae"); a plain NASA or ESA/Hubble page on the expanding universe and Hubble's Law; the Hubble tension (the Cosmic Horizons 1 links, already approved, may serve; to be re-read before reuse). Per §29 rule 3(c), link only what is read and record any gap. The Virgo and Coma distances and the 67 to 73 range need a source too.

## Wording and claims to check (new and restated)
- **The introduction answers guess 2 and hints at guess 1** (see Corrections). It would be rewritten neutral: say what a galaxy's light does (it arrives redder than it left) without saying how that depends on distance.
- **Results (`:513-575`) gives "so your prediction was right / off this time" for both guesses** and states the proportionality, before the tutor. They would move to the tutor's explanation (A9, A10).
- **Tutor's compare step** (`HubblesLawTutor.tsx:64`) restates the guesses without marking, which is acceptable, but says "what actually happened" without naming the marks; it would point to the white marks by name. The explanation's point 1 is where the guesses would be marked.
- **Unsourced claims:** the 16.5 and 100 Mpc distances (`:GALAXY_PRESETS`); "published values range from about 67 to 73" (also in the tutor's point 4); "a small number of genuinely nearby galaxies are actually moving toward us"; the claim in the tutor's point 2 that Doppler and expansion "can look similar in the numbers for nearby galaxies". None has been read for this report.
- **"Mpc" is glossed only in the assumptions list**, after the buttons use it, and "recession speed" and "z" are not defined in plain words before use (C8, §15).
- `onComplete` fires on every Run (`:~158`); not harmful but noted.
- **The specification's status line still says "Not yet implemented"** (`01-hubbles-law.md:3` and the Implementation Notes). Report only (O1).

## B1 to B3, recommendation
A real reference independent of the page's own code may exist: (a) the published Hubble constant range, 67 to 73 km/s/Mpc, against the page's 70 ("inside the published range", **if** a source is read); (b) the measured redshift of the Coma Cluster against the page's z = 0.0233 at 100 Mpc. I recall a measured value near 0.023 but have **not read a source**, so it is not a reference yet. The Virgo Cluster has no clean row (its own motion is large next to its distance-based speed). Suggested: a **small check-up table** with only the rows whose sources are read; "What this table tells us" under it, with a daily-life comparison (a car at 70 km/h covers 70 km in an hour; 70 km/s for every megaparsec is the same kind of rate, per distance). **No setting-following table:** the Part 2 drawing shows what the distance changes. **The learner's predictions** are shown beside the results as a block with a small tag on the table row where each number appears, guess only. These all need the comparison functions and tests in the module.

## Updated size
**Medium to Large.** A pair of galaxies in one picture with a speed panel and two white guess marks, labels and a new caption (with a worked moment and Look at / What it means / Why it matters items), one Run for the pair, a page rebuilt around Parts, a module (the pair, guess bar lengths, guess markers, tutor marking, worked numbers, check-up rows) and tests, a rewritten introduction, Results and tutor, a words box, links, the specification. **No change to approved physics.**

## Questions for the owner before drafting
1. **What does Part 1 show?** Suggested default: one Run draws a pair, Galaxy B at 16.5 Mpc (the Virgo Cluster) and Galaxy A at 33 Mpc (a schematic "twice as far"), as two rows, so both guesses are met from the first Run and Parts 2 to 4 appear after it.
2. **What does Part 2 change?** Suggested default: B's distance (Virgo 16.5, Coma 100, or a custom slider from 1 to 100 Mpc) with A always exactly twice B; the 200 Mpc "very distant" preset goes, since A at 200 needs B at 100. The Part 2 drawing is the same pair at the chosen distances, with a pink marker. The old single-galaxy choice goes.
3. **Marks:** guess 1 as a white bar on a new "Recession speed" panel in the same picture; guess 2 as a white marker on the row (or between the rows) with a YOUR GUESS box; both only after the waves reach Earth (A4). Suggested default: yes.
4. **Introduction, caption and Results neutral:** remove "the farther … the more stretched" and the Hubble constant's "rate things stretch with distance" from the introduction; remove the caption's "a farther galaxy … deeper red"; move the "right / off" lines and the proportionality sentence to the tutor's explanation; add a Parts paragraph, a guess paragraph and a "Some new words" line; define Mpc, recession speed and z before use. Suggested default: yes.
5. **Parts stay after the first Run:** changing a setting does not hide the Results or reset the tutor. Suggested default: yes.
6. **Labels on the picture:** on-canvas labels for the galaxy rows, the light wave, the leading dot, the path and the Earth ring, and a note "colour and width of the wave are drawn much stronger than the real stretch". Suggested default: yes.
7. **Check-up table:** only rows whose sources are read (the 67 to 73 range; the Coma Cluster's measured redshift if a source is found), no Virgo row, no setting-following table. Suggested default: yes, small.
8. **Links and words box:** search and read the Hubble 1929 paper, a plain NASA or ESA/Hubble page, and a Hubble-tension page (reusing Cosmic Horizons 1's if re-read); source the Virgo and Coma distances; link only what is read and record any gap. Suggested default: yes.
9. **"Change predictions" replaced** by an always-visible "Start over" (the standing rule). Suggested default: yes, no question needed; listed so you can see it.
10. **The specification's stale "Not yet implemented" status line** to be corrected in the Audit Update. Suggested default: yes, with your approval of the update.

## Not checked (re-read)
Not run in a browser; dark mode and narrow widths not looked at; no source page searched or fetched, so the published range, the Virgo and Coma distances, the Coma redshift and the claim about approaching galaxies are **not verified**; the table above was made by hand with node (one-line script, nothing left in the repo) and is not yet in a test; the specification was compared for the wording and behaviour cited, not line by line; line numbers marked `~` are approximate, read from the component's source order.
