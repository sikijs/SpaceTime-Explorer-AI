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

---

# Re-read, 2026-11-14: Rule E and the owner's rules of 2026-11-02 to 2026-11-07
Read-only. Re-read of `CosmicMicrowaveBackgroundExperiment.tsx` (620 lines, read in full, so the line numbers below are exact), `CosmicMicrowaveBackgroundTutor.tsx` (154), `cosmicMicrowaveBackgroundExperiment.ts` (30, 5 tests) and the specification `03-cosmic-microwave-background.md`, following the Cosmology 1 and 2 audits. Nothing in the app changed. Rules A to C above stand as written **except the corrections below**; this section adds what they did not cover.

## What the module gives (T0 = 2.725 K, z = 1089.8; hand-checked with node, not yet in a test)
| Quantity | Value |
|---|---|
| Temperature at recombination, 2.725 × (1 + 1089.8) | 2,972.43 K |
| Against the "about 3,000 K" the page quotes | 27.6 K less, 0.92 percent less (the test accepts 5 percent, a code threshold) |
| Today's temperature as a share of recombination's | 1 / 1090.8 = 0.092 percent: on a straight 330-pixel scale, today's bar is **0.3 of a pixel wide** |
| Same two values on a tenfold ("log") scale from 1 K to 10,000 K | today at 11 percent of the width, recombination at 87 percent |
| Temperature at z = 1, 10, 100, 1,000 | 5.45 K, 29.98 K, 275.2 K, 2,727.7 K |
| Photons per cubic centimetre at 2.725 K (blackbody formula, **outside the module**) | 410.5 (the page says "roughly 400") |
| 1 part in 100,000 of 2.725 K | about 27 millionths of a kelvin (the page's 1-in-100,000 figure is **not sourced**) |
| The Sun-motion "dipole" (Evidence and Imagination 7's specification, from NASA's LAMBDA table, read there) | 3,362 millionths of a kelvin, about 1 part in 810: **much larger than 1 in 100,000** |

1. **Guess 1 has one answer, and a straight scale cannot show it.** Recombination is 1,091 times hotter than today. If the temperature gets its own panel (A5), a straight scale makes today's end invisible, so the choice of scale is a question for the owner (question 2).
2. **Guess 2's answer is a size, not a colour.** The seven circles differ from each other by one step in one colour channel (`:80-87`), which is colour noise with no temperature meaning; the real spread is about 27 millionths of a kelvin, which no colour shows. "Varies a lot" has no size in the specification. The picture needs a spread scale or marker-only guesses (question 3).
3. **The page's own sky is truthful, but the real sky has a bigger difference it does not mention.** The 1-in-100,000 ripples are what is left after the Sun's motion is removed. The raw sky has a warm side and a cool side about 1 in 810 apart, which Evidence and Imagination 7 teaches. "About the same in every direction" is still the right answer to guess 2; the owner decides whether this page says anything (question 8). The 1-in-100,000 and 1-in-810 figures were **not read from a source for this page**.

## Corrections to the 2026-11-02 report
- **C7 is worse than reported.** (a) The old report said the top bar "draws at once" but missed what that means: the **top panel (`:432-490`) is on screen before the learner has made any guess**, with the bar labels "z ≈ 1089.8, hot" (`:469`) and "z = 0, cold" (`:475`) and a hot white-orange to cold violet gradient (`:447-448`). That is the answer to guess 1 on the first screen. (b) The introduction (`:198-201`) says the light "has been stretched by the expanding universe for so long that it is no longer visible light but microwaves"; with the stove paragraph (`:226-228`, "dull red, then orange, then white-hot as it heats up") a learner can reach guess 1 before guessing. (c) The caption (`:542`) and the assumptions bullet on the 1-in-100,000 variations (`:264-266`) are the two hints the old report found for guess 2; the introduction's "from every direction" (`:199`, `:212`) also leans that way. All are §12 problems.
- **A10 stands (no older-rule sentence), but the Results gives the verdicts "so your prediction was right / off this time" for both guesses before the tutor** (`:581-583`, `:590-592`), which §14 reserves for the tutor.
- **A4 and the sky panel:** the sky panel and caption appear the moment Run is pressed (`hasSubmittedPrediction` is set at the click, `:128-131`), i.e. while the first run is still playing, not after it ends.
- **A6, the source of 2.725 K:** the module and the page say "Planck satellite" (`module :1`, `:254-256`, `:601-602`). Evidence and Imagination 7's specification reads T0 = 2.72548 K from a Colloquium paper (not Planck's own paper). **Which mission measured the temperature today is not verified here** (my recollection is that the best absolute value is from COBE's FIRAS instrument; **not read**). Owner to see the answer before the wording is approved.

## Rule E: the page in four Parts
| Item | Result | Evidence | Gap and what would be needed |
|---|---|---|---|
| E1 | Not met | One card (`:180-608`) holds the introduction, both guesses, the moment buttons and slider, Run, the readout, the SVG, the caption and Results; the tutor is a second block (`:610-617`) | Part 1 (guesses, Run, the pictures), Part 2 (the moment control), Part 3 (results), Part 4 (tutor) |
| E2, E4 | Not met | No Part headings or leads | Four leads, drafted for approval; Part 1's lead gives no answer (§12) |
| E3 | Not met | No links list, no words box above Part 1 | See "Links and Words" |

## Parts 2 to 4 appear after the first Run
**Partly met, with the same defect as Cosmology 1 and 2.** Results and tutor appear once the first run has finished (`:555`, `:610`). **But choosing another moment (`:121-124`) or moving the slider (`:392-395`) sets the status back to idle, which hides the Results and unmounts the tutor, and Run again remounts the tutor from its first question (`key={runCount}`, `:612`).** Also, **the first Run can be "Today" (z = 0)**: then nothing on screen carries guess 1's answer (the page checks guess 1 against recombination regardless, `:577`, and the specification's note says so). Suggested fix: the first Run is always the journey from today back to recombination; the moment control moves to Part 2 and changes only the Part 2 drawing; the tutor is not remounted (question 1).

## "Start over, not Change prediction" (2026-11-07 rule)
**Not met.** A "Change predictions" button appears only after the first Run (`:322-348`, handler `:139-143`). It must become an always-visible "Start over" (greyed out until a guess is chosen or a run exists, and while a run plays), clearing the guesses, runs, results and tutor progress; the page says the guesses are locked after Run. Replaced, and said so in the specification (no need to ask the owner).

## Predictions and where their answers live (A5, sharpened)
- **Guess 1 (the temperature at recombination against today's: higher, lower or the same):** the answer is the two ends of the existing bar, which carry colours but no numbers. Suggested: a **temperature panel in the same picture** (own title, own scale in kelvin) with a bar for each end, 2,972 K and 2.725 K, and a **white marker** for the guess beside the recombination end: at today's level for "the same", above it for "higher", below it for "lower". **Marker only** (the three answers carry no size); the caption says so. Drawn only after the run reaches recombination (A4).
- **Guess 2 (every direction about the same, or varying a lot):** the answer is how far apart directions are. Suggested: replace the made-up colour noise with an honest **"how much directions differ" strip** on its own scale: the measured spread (about 1 part in 100,000, **source to be read**) as a labelled element, the guess as a white marker (marker only, since "a lot" has no size). Whether "a lot" is also drawn as an imagined example in another colour is the owner's call (question 3). The seven circles stay as the illustrative "sky in every direction" view, now labelled with the number each one stands for.
- **One Run** shows both, so Parts 2 to 4 can appear after it. Part 2's pink marker shows the learner's own moment on the same bar and the temperature panel.
- **"Where the real picture comes from":** *calculated here* (every temperature from T0 × (1 + z), the colours, the circles' arrangement); *measured*: T0 (**attribution to be read**), z = 1089.8 (Planck 2018, **abstract not read for this**), the "about 3,000 K", the 380,000 years, the 1-in-100,000 spread; *imagined for the question*: the colour scale, the circles' positions, and any "a lot" example.

## Links and Words (2026-11-07 rules)
- **Words and formulas box (new).** Entries: Cosmic Microwave Background, recombination, redshift (as in Cosmology 1), z, kelvin, wavelength, microwave, blackbody or "temperature of light", expansion, the horizon problem and inflation (named only, as the page does now), photon ("light particle"). Formula and worked example from the page's own numbers (checked above): T = T0 × (1 + z) = 2.725 × (1 + 1089.8) = 2,972 K. **Held back until after the Run (§12):** that the temperature is higher further back, and that the sky is nearly uniform.
- **"Want to know more?" links (new).** None exists. Candidates, all **already fetched for Evidence and Imagination 7 on 2026-11-02 (HTTP 200)** but **to be re-read for this page before any is linked** (that spec warns the ESA Planck page's "almost uniform" would hint at guess 2, so it belongs after the Run or not at all): ESA "Planck and the cosmic microwave background", NASA WMAP overview, NASA COBE mission page, ESA Planck gallery, NASA LAMBDA education index. Papers to read for the figures: Planck 2018 results VI (z = 1089.8; the abstract only); Penzias and Wilson 1965 (the discovery); the source of T0 (the Colloquium paper used by Evidence and Imagination 7, or COBE FIRAS). Per §29 rule 3(c), link only what is read and record any gap. The **380,000 years** and **about 3,000 K** figures have no source read.

## Wording and claims to check (new and restated)
- **"Recombination" and 1089.8 (my recollection, not read):** astronomers separate recombination (atoms forming, at a redshift higher than 1,089.8) from last scattering (the moment light last bounced, about z = 1,090). The page uses one word and one number (z = 1089.8, 380,000 years) for both. **Owner to see what a plain source says before the wording is approved** (question 6).
- **"About 400 light particles in every cubic centimetre" (`:211`)** is unsourced; the blackbody formula gives about 410 (hand-checked, not in the module). Source it, or add the formula to the module with a test (question 7).
- **The old TV static claim (`:216-217`)** is unsourced. Whether to keep it, source it or drop it is the owner's call.
- **"Experiment 1" (`:232`, `:251`, `:595`, `:597`), "Experiment 2" (`:549`; tutor `:126`, `:131`, `:136`)** have no group name. The heading "Experiment 3 — The Cosmic Microwave Background" (`:178`) would read **Cosmology 3: The Cosmic Microwave Background**, with "Cosmology 1" and "Cosmology 2" in place of the bare numbers. `App.tsx` carries this chapter's summary (`:729-736`) and Cosmic Horizons chapters refer to the microwave background; their cross-references are to be rechecked, not changed unasked.
- **The horizon problem and inflation** are named in the caption (`:548-550`) and tutor point 3. Cosmology 2's audit (owner's default) moved the horizon-problem material out of the introduction; here it is only a reference. Owner to say whether point 3 keeps the sentence "the reason cosmic inflation was proposed" (unsourced, and the word "inflation" is not defined here).
- **The daily-life pictures** (fog lifting, the stove glow) are unsourced pictures; §15 says they need the owner's approval.
- `onComplete` fires on every Run (`:157`); not harmful but noted.

## B1 to B3, recommendation
Real references exist **if sources are read**: T0 (2.72548 K in the Colloquium paper, read for Evidence and Imagination 7), z = 1089.8 (Planck 2018), "about 3,000 K". Suggested **check-up table** (calculated beside published, no invented cut-off): (a) today's temperature, the page's 2.725 K against the published 2.72548 K (the same, to the page's rounding); (b) recombination, 2,972 K calculated against "about 3,000 K" (0.9 percent less; the 3,000 is itself "about", so no verdict); (c) the spread between directions, the measured 1 in 100,000 (about 27 millionths of a kelvin), which the page does not calculate (quoted, not checked); (d) the 380,000 years and z = 1089.8, **given, not an independent check** (the project does not model the expansion history). A second small table, **"Temperature at some moments"** (z = 0, 1, 10, 100, 1,000, 1,089.8, with the temperature and how many times today's), calculated here, to show the rule with real numbers. "What this table tells us" under each, with the 3,000-versus-2.7 comparison and a worked sum. **No setting-following table** (B3): the moment control only moves a mark along the same rule; there is no real reference that moves with it. **The learner's guesses** beside the results with a tag on the row where the number appears, guess only. All need module functions and tests.

## Updated size
**Medium to Large.** A new temperature panel and a spread strip in the existing picture, two white marker sets, labels, a new caption, a page rebuilt around Parts, a module (marker positions, scale positions, the table's rows, tutor marking, check-up rows, worked example) and tests, a rewritten introduction, Results and tutor, a words box, links, the specification. **No change to approved physics** (`cmbTemperatureKelvin` stays as it is).

## Questions for the owner before drafting
1. **What does Part 1 show, and what moves to Part 2?** Suggested default: Run is always the journey from today back to recombination (all three pictures fill in as it goes); the moment control (today, recombination, a custom z slider) moves to Part 2 as a pink marker on the bar and the temperature panel; Parts 2 to 4 appear after the first Run and stay.
2. **Scale of the temperature panel.** Suggested default: a tenfold ("log") scale, 1 K to 10,000 K, with each step explained in the caption ("each tick is ten times the one before; on a straight scale today's bar would be 0.3 of a pixel wide"). Alternative: a straight scale with today's end drawn as a labelled sliver, honest about being too thin to see.
3. **Guess 2's picture.** Suggested default: the "how much directions differ" strip with the measured spread and the white guess marker (marker only; "about the same" near the measured value, "varies a lot" at the far end of the scale), plus the seven circles labelled with their number. Not drawing an imagined "a lot" example (there is no accepted size for it). Your call.
4. **Hold the early hints:** keep the bar neutral (names only, no "hot" or "cold", no gradient) until the run reaches recombination; hold the stove paragraph, the 1-in-100,000 assumption and the caption's hot-versus-cold line until after Run; leave the introduction's definition that the light was "stretched into microwaves" (it is what the CMB is). Suggested default: yes. Say if you want that last sentence held too.
5. **Verdicts move to the tutor:** remove "right / off this time" from Results; the tutor's explanation marks both guesses by name. Suggested default: yes.
6. **"Recombination" versus last scattering** (my recollection, not read): search a plain source; keep the page's wording unless the source contradicts it, then bring you the wording. Suggested default: yes.
7. **"Roughly 400 per cubic centimetre":** source it, or compute it in the module (about 410, with the constants listed and a test). Suggested default: source it; if none is found, keep "roughly 400" and record the gap.
8. **The Sun-motion dipole:** a one-line mention in the tutor's "not covered here" point, pointing to Evidence and Imagination 7 (1 part in 810 from our own motion, so "about the same" is not "exactly the same"). Suggested default: yes, tutor only, nothing in the introduction.
9. **Check-up and a "Temperature at some moments" table** as in B1 to B3, only rows whose sources are read, no setting-following table. Suggested default: yes, small.
10. **Links and words box:** search and read the pages and papers above (re-reading the pages fetched for Evidence and Imagination 7), link only what is read, record any gap. Suggested default: yes.
11. **"Change predictions" replaced** by an always-visible "Start over" (the standing rule), the heading and cross-references changed to "Cosmology 3" and "Cosmology 1 / 2", and the specification's status lines brought up to date in an Audit Update. Suggested default: yes.

## Not checked (re-read)
Not run in a browser; narrow widths and dark mode not looked at; **no source page searched or fetched for this page**, so 2.725 K and its mission, z = 1089.8, 380,000 years, about 3,000 K, the 1-in-100,000 spread, the 400 per cubic centimetre, the TV static claim and the recombination-versus-last-scattering point are **not verified**; the 1-in-810 dipole figure is quoted from Evidence and Imagination 7's specification, not re-read from its source; the table of numbers was made by hand with node (nothing left in the repo) and is not yet in a test; the specification was compared for the wording and behaviour cited, not line by line.
