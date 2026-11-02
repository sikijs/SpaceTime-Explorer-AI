# Gap report: Gravity and Curved Spacetime Experiment 7 (What is a black hole?)
Date: 2026-11-02 | Specification: docs/experiments/gravity-and-curved-spacetime/07-black-holes.md | Components: src/components/BlackHoleExperiment.tsx, BlackHoleTutor.tsx | Physics module: src/physics/blackHoleExperiment.ts (+ .test.ts, 12 cases) | Status: read-only, nothing changed

## Summary
Three predictions (small mass, large mass, "is there a mass in between?"), one mass slider (0.2 to 6), one top-down drawing with a legend (central mass, event horizon, launch point, probe), a Results block that gives each guess's verdict and a long tutor. Biggest gaps: no guess marks; the guesses are about ranges of mass but the run shows one mass, so no picture carries the answer across masses; no "How to read" caption (a legend exists); the intro's question and the third answer button reveal the idea; "event horizon" is in the legend before it is defined. Size: **L** (a new panel of escape speed against mass is needed, A5).

## Predictions found (A0)
| # | Question | Answers | Where the answer lives on a picture |
|---|---|---|---|
| 1 | If the mass is very small, what is the escape speed compared with light? (`BlackHoleExperiment.tsx:258-264`) | "Much slower than light" / "Faster than light" / "Nothing can escape at all" (`:11-18`); `smallMassPrediction` then `submittedSmallMassPrediction` (`:147, :150, :164`) | Low end of the mass slider (`:280-292`); no picture of escape speed against mass. |
| 2 | If the mass is very large: same three options (`:265-271`) | same | High end of the slider. |
| 3 | Is there a mass in between where something special happens? (`:272-278`) | Yes / No (`:71-116`) | The mass where escape speed equals light speed, i.e. where the horizon reaches the launch point (`evaluateBlackHole`, `blackHoleExperiment.ts:22`). |

## Rule A
| Item | Result | Evidence | Gap and what would be needed |
|---|---|---|---|
| A0 | Met | above | |
| A1 | Met | `:159, :168` use `mass` only; predictions are submitted but never read by the physics | |
| A2 | Not met | `<svg>` `:309-329` has no white mark | A new strip: escape speed as a fraction of light speed against mass (the module already returns `escapeSpeedFractionOfC`, `:383-385` of the component uses it), with the 100 percent line, and white guess marks at the low end, high end and the "in-between" mass. |
| A3 | Not met | | Outcome guesses: markers; for the in-between guess "yes" a marker on the strip's 100 percent crossing, "no" a marker with a caption saying it is only a marker. |
| A4 | Not met | | Draw after the strip's curve is drawn. |
| A5 | Not met (needed) | | New panel, own scale, own title, in the same picture area. |
| A6 | Not met | no "where it comes from" line | Calculated here from ordinary gravity with relative units (`:249`); the real horizon needs general relativity (`:428-431`); real measurements (the EHT images) are mentioned only in the intro (`:234-239`), not used. |
| A7 | Not met | intro `:215-256` and slider `:280-292` have no such sentences | Add both. |
| A8 | Not met | Module exports `SPEED_OF_LIGHT = 2`, `evaluateBlackHole`, `runRadialLightSpeedLaunch`, types (`blackHoleExperiment.ts:6-72`). Percent arithmetic in the component (`:384`); no sweep or marker function | Add sweep, in-between mass value, marker data, tests. |
| A9 | Partly met | Tutor compare step names the guesses and the rule before the explanation (`BlackHoleTutor.tsx:71-72`); observe prompt gives the outcome in brackets (`:70`) | |
| A10 | Not met (no statement) | Results `:432-448` verdict lines | |

## Rule B
- B0. One Results block (`:375-450`): mass, escape speed percentage, horizon size, inside/outside, a long inside-horizon explanation (conditional, `:392-419`), outcome, a note on the real definition, and three "Your prediction ... In fact ..." lines. No tables.
- B1. Not met. A real reference: none measured by this page (relative units); the module's own rule (horizon where escape speed = light speed) could give "expected: 100 percent at the horizon; found: X percent at the launch point". The intro's EHT images (2019, 2022) could be a real-world anchor but they are not tied to numbers here (not checked in the spec).
- B2. Not met.
- B3. N/A (the slider is the run's input).
- B4. Partly met: guesses shown as text, with verdicts (`:432-448`).
- B5. Partly met: escape speed fraction and horizon size are from the module; rounding in the component.

## Rule C
- C1. Met for the drawing: a legend names central mass, event horizon, launch point (fixed) and probe (`:341-364`). Not labelled on the canvas itself (legend only); the starting direction and the "moving away / falling" status appear in a text line (`:367-373`).
- C2. Met: the horizon circle grows with the slider (`:315-323`), so a mass change changes the drawing.
- C3. Not met: a legend, but no "How to read this diagram" caption.
- C4. Not met: legend lines only; no description of what happens in order or what the dashed circle means in the learner's words.
- C5. Not met in a caption; Results gives numbers after the run.
- C6. Not met.
- C7. Not met: the intro question ends "...that nothing, not even light, could escape it?" (`:217-219`) and one answer button is "Nothing can escape at all" (`:17`); the intro also says "a probe ... at the fastest speed anything can ever travel" (`:226-227`). These hint at what the learner is asked to predict (§12).
- C8. Partly met: "concentrated" defined (`:219-221`); "escape speed" and "event horizon" are used in the prediction text and legend (`:259, :351`) but defined only in the Results (`:428-430`) and tutor, after the run (§15).

## Other findings
- O1. None found against the specification (not compared line by line). Possible tension with `docs/PROJECT.md`/other experiments: the page uses ordinary gravity with a made-up speed of light (`SPEED_OF_LIGHT = 2`, module `:6`) and says so (`:246-249`).
- O2. (a) The "water draining from a sink" explanation `:402-417` is shown inside the Results panel before the tutor, and says the probe's horizon "works differently" from a real one; fine, but it is an explanation before the tutor (§12 timing). (b) Results `:439-441` "escape speed would need to exceed the speed of light — which is impossible" is a verdict on prediction 2. (c) The Results text `:392` appears only when the launch point is inside the horizon and the outcome is "falls back"; a learner who runs only small masses never sees it. (d) Intro EHT paragraph `:234-239` has no source link on the page (Rule D is for Cosmic Horizons only, so only a note). (e) The tutor's historical note and the Hawking radiation line (`Tutor` points 5 and 8) have no source read here. (f) "Experiments 2, 3, 5, and 6" cross-references lack the chapter name.

## What an update would touch, and its size (O3, O4)
BlackHoleExperiment.tsx (new strip, caption, intro hints, notes, results), BlackHoleTutor.tsx, physics module + test, specification. Black Holes group experiments re-use the vocabulary, so only wording consistency matters. **Size: L.**

## Not checked
No browser view; tutor explanation points 1 to 8 were read by headline only; specification not compared; Rule D N/A.
