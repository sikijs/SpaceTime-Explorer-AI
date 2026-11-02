# Gap report: Black Holes and Strong Gravity Experiment 10 (Hawking radiation)
Date: 2026-11-02 | Specification: docs/experiments/black-holes-and-strong-gravity/10-hawking-radiation.md | Components: src/components/HawkingRadiationExperiment.tsx, HawkingRadiationTutor.tsx | Physics module: src/physics/hawkingRadiationExperiment.ts (+ .test.ts) | Status: read-only, nothing changed

## Summary
Three predictions, three pictures (thermometer, heat-flow arrows with a time-lapse disk, lifetime graph), a 7-row table, two worked calculations and a six-black-hole table, and a four-step tutor. Older rule: guesses are text only; Results and the tutor's compare step mark them. Biggest gaps: no guess marks, no table notes, no three-part look-for items, the mechanism and the answer to Prediction 2 appear in the picture, caption and Results before the tutor, and the verdict logic is in the component. Size: **M**.

## Predictions found (A0)
| # | Question | Answers | Where the answer lives on a picture |
|---|---|---|---|
| 1 | Which is hotter, a big or a small black hole? (HawkingRadiationExperiment.tsx:35-40, :634) | the big / the small / the same | Thermometer: the 1-Sun and 10-Sun dots against each other |
| 2 | Is a 10-Sun black hole losing, gaining or keeping its mass? (:42-47, :654) | losing / gaining / same | Heat-flow picture: which arrow is thick, and the disk |
| 3 | How much longer would a black hole of ten times the mass take to evaporate? (:49-54, :672) | 10 / 100 / 1,000 times | Lifetime graph: the 10-Sun dot against the 1-Sun dot (`TIMES_LONGER` is a component constant, used at :467) |
Stored in `submitted*` state; used in Results (:965-1000) and the tutor props.

## Rule A
| Item | Result | Evidence | Gap and what would be needed |
|---|---|---|---|
| A1 | Met | `Thermometer` (:171), `Flow` (:260), `LifetimeGraph` (:333) take only `result`/`progress`; model answers come from the module (:460-467) | none |
| A2 | Not met | No white guess mark or "YOUR GUESS" box in the three SVGs | Marks on thermometer, arrows and graph |
| A3 | Not met | P3 has a numeric position (10, 100 or 1,000 times the 1-Sun lifetime); P1 and P2 are categories | Position for P3; markers for P1 and P2, with a caption line saying so |
| A4 | Not met | The Flow picture builds over the time-lapse (:260); no guess mark | Mark only once the arrows/disk are drawn |
| A5 | Met (not needed) | Each has a picture | none |
| A6 | Not met | No source line (:769-935). Real data is the formula for temperature and lifetime, which the spec says were checked only against search results and not at the original papers (10-hawking-radiation.md:42); the radiation has never been seen from a real black hole | Add: calculated here; nothing measured; the 2.725 K background is from Cosmology Experiment 3 |
| A7 | Not met | Introduction (:527-620) says nothing about guesses or white marks | Add (owner to approve) |
| A8 | Not met | Module exports `hawkingTemperatureKelvin`, `lifetimeYears`, `massForLifetimeKg`, `balanceMassKg`, `massDirection`, `hawkingSteps`, `HAWKING_PRESETS`, `runHawkingRadiationExperiment` (hawkingRadiationExperiment.ts:43-161). `hotModel`, `directionModel`, `longerModel` and `TIMES_LONGER` are in the component (:460-467) | Move into the module; add guess-mark functions and tests |
| A9 | Partly met | Observe prompt names "the thermometer and the arrows" (Tutor:119-120); compare recites guesses with verdicts (:121-122). Results marks them earlier | Prompts would name marks; verdict only in the tutor (owner's decision) |
| A10 | Not met | No sentence says predictions do not change the results | See O1 |

## Rule B
- B0: Results has a 7-row table (:~946-962), three "Checking your Nth prediction" paragraphs (:965-994), a temperature calculation (:~1000-1030), a time-to-evaporate calculation, a six-black-hole table, a coffee/cube comparison and a limits box (to :1142).
- B1 Partly possible: real references exist only as the page's own published-style figures (Hawking temperature of 1 Sun about 6.17 x 10^-8 K; background 2.725 K). The spec says they were not checked against the original papers, and no one has measured Hawking radiation, so a "check-up" row with a measured value is not available; a row comparing the page's balance mass with the 10-Sun hole is an internal comparison only.
- B2 Not met: no "What this table tells us" notes.
- B3 N/A: the control (which black hole) only moves marks.
- B4 Partly met: guesses are in Results with a verdict; no tag on a table row.
- B5 Partly met: values from the module; verdicts in the component.

## Rule C
- C1 Met: thermometer dots are named, background line labelled, your black hole ringed and labelled (:171-250); arrows, black hole and horizon ring labelled (:273-325); graph dots and age-of-universe line labelled (:348-430).
- C2 Met: orange (out) against blue (in); the winning arrow is thick; hotter and colder zones are shaded (`HOTTER_FILL`, `COLDER_FILL`, :58-59).
- C3 Met: captions at :770, :826, :878.
- C4 Mostly met: every element, the kelvin and log scales are explained, with bullets. The time-lapse order is covered in the introduction (:~548-552) and "A limit" (:~866-868).
- C5 Partly met: "Try this" examples with numbers (1 Sun to 10 Suns, tenth of the temperature, 1,000 times as long, :~807, :~917) and an "In this run" line; no fixed worked moment.
- C6 Not met: "Try this" bullets do not use Look at / What it means / Why it matters.
- C7 Partly met: the thermometer caption's "What is really happening" (:~793-798) states the full mechanism ("heat flows from hotter to colder, so... gains mass") and the Flow SVG prints the result inside the picture ("So the black hole's mass goes up", Flow text), and the Results states it for the 10-Sun hole (:~977-983). All after the learner's prediction (so §12 holds), but before the tutor, whose conceptual question (Tutor:123-124) asks the learner to work out the same thing.
- C8 Met: temperature, kelvin, cosmic microwave background, evaporate, powers of ten, "balance mass" are defined (:~574-592).

## Rule D
N/A.

## Other findings
- O1: CLAUDE.md §14 says older experiments state that predictions do not change the pictures; this one does not (A10).
- O2: White is already used for the background line and for the ring marking "your black hole" (`LINE_COLOR` #ffffff, :60; caption :~784-786) and for the horizon ring in the Flow picture, so a white guess mark would clash. The lifetime formula ignores greybody factors (spec says good to a few times); the page says so. "Mountain-sized ... some scientists have suggested" is the page's own wording, sourced in the spec only as Decision 8.

## What an update would touch, and its size
HawkingRadiationExperiment.tsx, HawkingRadiationTutor.tsx, the module and its tests, the specification. Size: **M** (marks on three pictures, module functions and tests, A6/A7 wording, notes under two tables, a recolour decision).

## Not checked
Not run in a browser; tests not run; SVG bodies and the tutor's explanation step read only in part; line numbers marked "~" are approximate; "What's next" not read.
