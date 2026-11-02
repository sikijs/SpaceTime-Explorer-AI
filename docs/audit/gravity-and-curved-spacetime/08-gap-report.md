# Gap report: Gravity and Curved Spacetime Experiment 8 (Does gravity bend light?)
Date: 2026-11-02 | Specification: docs/experiments/gravity-and-curved-spacetime/08-light-bending.md | Components: src/components/LightBendingExperiment.tsx, LightBendingTutor.tsx | Physics module: src/physics/lightBendingExperiment.ts (+ .test.ts, 10 cases) | Status: read-only, nothing changed

## Summary
Three predictions (does it bend; does closer bend more; is the real bending more than ordinary gravity gives), one slider (aim distance), one unlabelled top-down drawing with a dashed reference line, and a Results block that gives the simulated and real angles and a verdict on each guess. Biggest gaps: the drawing has no labels or legend and no caption; the introduction already tells the learner that real light bends more than ordinary gravity predicts (Prediction 3); no guess marks; predictions 2 and 3 have no picture of their answer. Size: **L**.

## Predictions found (A0)
| # | Question | Answers | Where the answer lives on a picture |
|---|---|---|---|
| 1 | Does light passing near the mass (not at it) get bent at all? (`LightBendingExperiment.tsx:274-280`) | Yes / No (`:44-89`); `bentPrediction` then `submittedBentPrediction` (`:159, :162, :175`) | The drawing's path versus the dashed straight reference line (`:341-361`). Yes/no, so a marker. |
| 2 | Does aiming closer bend the light more, less or about the same? (`:281-290`) | More / Less / About the same (`:23, :91-150`); `closerPrediction` (`:160`) | A picture of bending angle against aim distance: none exists; the run shows one aim distance. |
| 3 | Does the real universe bend starlight more, less or exactly the same compared with ordinary gravity? (`:291-300`) | More / Less / Exactly the same (`:161`) | The two angles in Results (`:404-412`) are numbers only; a drawing of the real versus simulated bending angle does not exist. |

## Rule A
| Item | Result | Evidence | Gap and what would be needed |
|---|---|---|---|
| A0 | Met | above | |
| A1 | Met | `:179` uses `aimDistance` only | |
| A2 | Not met | `<svg>` `:335-361` has no white mark | Guess 1: marker at the bend. Guess 2: a new strip, bending angle against aim distance (from the module) with a white marker. Guess 3: draw the real (general-relativity) path or angle next to the simulated one as its own labelled element, with a white marker for the guess. |
| A3 | Not met | | Yes/no and more/less/same guesses: markers only; for guess 3 a marker on a ratio axis (1 = same). |
| A4 | Not met | | Draw once the path exists (`:351-359`); the real-angle element only after it is drawn. |
| A5 | Not met (needed) for 2 and 3 | | Panels for angle against distance and real versus simulated, own scales. |
| A6 | Not met | no source line | Calculated here: the path is stepped with ordinary gravity (relative units, `:265-268`); the "real" angle is the general relativity formula, double; the 1919 eclipse measurement is mentioned (`:246-253, :420-427`). |
| A7 | Not met | intro `:230-272` silent about predictions and pictures; no note beside the slider `:302-327` | Add both. |
| A8 | Not met | Module exports `LightBendingPoint`, `LightBendingOutcome`, `LightBendingResult`, `runLightBendingExperiment` (`lightBendingExperiment.ts:10-48`); result carries `simulatedDeflectionAngle`, `newtonianDeflectionAngle`, `generalRelativisticDeflectionAngle`. Degrees conversion is in the component (`:36-38`) | Sweep over aim distances, ratio and marker data, plus tests, are missing. |
| A9 | Partly met | Tutor compare step states each guess and "in fact, yes, it does bend" (`LightBendingTutor.tsx:71-72`) before the explanation; observe prompt gives the outcome in brackets (`:70`) | |
| A10 | Not met (no statement) | Results `:428-442` text verdicts | |

## Rule B
- B0. One Results block (`:382-444`): aim distance, either a falls-in note or the simulated, formula and real angles with "exactly double", a 1919 eclipse paragraph, three "Your prediction ... In fact ..." lines. No tables.
- B1. Partly met in text, not as a table. A real reference exists: the general relativity angle (module value, shown) and, in the specification, the 1919 eclipse bending of the Sun's light (the figure is not given on the page). The check "simulated vs formula: they agree" is a code check of the page's own formula (`:404-409`), not an observation.
- B2. Not met: no "What this table tells us" notes.
- B3. N/A.
- B4. Partly met: text only, with verdicts.
- B5. Partly met: angles are from the module; the conversion to degrees is in the component.

## Rule C
- C1. Not met: the drawing has no labels or legend. The mass (dot), the beam's path (line), the dashed straight line (the "aim") and the moving point are unexplained on the canvas; only the "Position: (x, y)" text appears below (`:363-380`).
- C2. Partly met: aim distance changes the starting height and the bend; the real (double) bending is not drawn at all.
- C3. Not met: no "How to read this diagram" caption.
- C4. Not met.
- C5. Not met (numbers only in Results).
- C6. Not met.
- C7. Not met: the intro says the 1919 measurement found light bent "by exactly the amount Einstein's 1915 theory predicted — not the smaller amount ordinary gravity alone would give" (`:246-250`) before Prediction 3 asks for that comparison (§12). The "Your job" line also tells the learner to see "how the amount of bending changes" with aim (`:242-244`), a hint for Prediction 2.
- C8. Partly met: "aim" defined (`:237-239`); "impact parameter" only in a code comment; "gravitational lensing" is named in the intro (`:251`) and used again after the run; "ordinary gravity", "general relativity" and "deflection" are used before they are defined.

## Other findings
- O1. None found against the specification (not compared line by line). Experiment 7's "falls into the mass" idea is reused (`:394-399`), with the page's own note that the cutoff is not the same.
- O2. (a) The 1919 eclipse claim "exactly the amount Einstein's 1915 theory predicted" (`:246-250`) and "measured ... the doubled amount" (`:421-424`) is strong; the real measurements had sizeable uncertainty. No source on the page; the specification's source status was not read. (b) The Results paragraph `:413-416` explains the doubling ("warps space itself") before the tutor and states a verdict on Prediction 3. (c) "the two agree, confirming the animation is following that formula" (`:407-408`) confirms the code against itself, not the physics. (d) Gravitational lensing is claimed as "routine" with no source (`:251-253, :424-426`). (e) "Experiment 7" and "Experiment 6" cross-references lack the chapter name. (f) The angles shown are in degrees of a made-up unit system and are said not to be real starlight angles (`:266-269`); a real number for the Sun (about 1.75 arcseconds) is not shown, an owner decision.

## What an update would touch, and its size (O3, O4)
LightBendingExperiment.tsx (labels and caption, new panels, guess marks, intro hint removal if the owner agrees, notes), LightBendingTutor.tsx, physics module + test, specification. **Size: L.**

## Not checked
No browser view; the tutor's explanation was read by headline only; specification not compared line by line; Rule D N/A.
