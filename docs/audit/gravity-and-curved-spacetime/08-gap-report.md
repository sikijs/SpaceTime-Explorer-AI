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

---

# Re-read, 2026-11-13: Rule E and the owner's rules of 2026-11-02 to 2026-11-07
Read-only. Re-read of `LightBendingExperiment.tsx` (463 lines), `LightBendingTutor.tsx` (148), `lightBendingExperiment.ts` (110, 10 tests) and the specification `08-light-bending.md`, following the Gravity 1 to 7 audits. Nothing in the app changed. Rules A to C above stand as written; this section adds what they did not cover. The owner's special brief for Gravity 7 (2026-11-13) was for that experiment only and is **not** applied here.

## What the module returns (I ran every slider step, 0.3 to 4.0, mass 1, speed of light 2)
| Aim distance | Outcome | Simulated angle | Ordinary-gravity formula | "Real" (twice the formula) |
|---|---|---|---|---|
| 0.3 to 0.7 | **falls in** (no angle) | n/a | 95° to 41° | 191° to 82° (never shown, since the run falls in) |
| 0.8 | deflects | 35.2° | 35.8° | 71.6° |
| 1.0 | deflects | 28.5° | 28.6° | 57.3° |
| 2.0 | deflects | 14.4° | 14.3° | 28.7° |
| 3.0 | deflects | 9.5° | 9.5° | 19.1° |
| 4.0 | deflects | 7.0° | 7.2° | 14.3° |

1. **The slider's first five steps (0.3 to 0.7) all fall into the mass**, so a learner who tries "closer" first sees no bending at all and the Results say so. The edge sits between 0.7 and 0.8.
2. **Closer bends more is true across the deflecting range** (35° at 0.8, 7° at 4.0), so guess 2 has a real answer, but nothing shows the whole range at once: one run shows one aim distance.
3. **"The two agree" is close, not exact.** The simulated angle is within 0.4 percent of the formula at 0.8 and 2 percent short at 4.0, because the run stops at x = 15 and the far-field angle is not fully reached. The Results say "the two agree, confirming the animation is following that formula" (`:405-408`), which confirms the code against its own formula, not the physics (O2c above).
4. **The "real" doubled angle is shown at large angles.** Every real-universe angle on the page is the small-angle formula doubled (4 × mass ÷ (speed of light squared × aim distance)), and the page prints it at 14° to 72°. That formula is a small-angle result (the real bending of the Sun's edge is quoted as about 1.75 arcseconds, roughly five ten-thousandths of a degree, not tens of degrees; the figure is from memory and unsourced). The specification already says the formulas "are not meaningful once the aim distance approaches the event-horizon scale" (spec line 80) and the aim range was chosen "so the weak-field approximation stays valid" (Decision 4), but at 0.8 to 1.5 the angles are 19° to 72°, not small. The page states, in its assumptions, that the angles "are not the real bending angle of real starlight". **Owner to decide** (question 2): say this plainly beside the doubled angle, or limit the slider to larger aim distances where the angle is smaller.

## Rule E: the page in four Parts
| Item | Result | Evidence | Gap and what would be needed |
|---|---|---|---|
| E1 | Not met | One card holds the introduction, three predictions, the slider, Launch, the drawing and Results (`:215-444`); the tutor is a second card | Part 1 (predictions, Run, pictures), Part 2 (the aim slider and a pink flyby), Part 3 (results), Part 4 (tutor). |
| E2, E4 | Not met | No Part headings or leads | Four leads, drafted for approval; Part 1's lead gives no answer (§12). |
| E3 | Not met | No links, no words box | See "Links and Words". |

## Parts 2 to 4 appear after the first Run
**Partly met as built.** The Results and the tutor appear after the first launch, but the slider is hidden until all three guesses are made and one run shows one aim distance, so guess 2 (closer bends more) can never meet its answer from the first run. **The same Part 1 question as Gravity 5, 6 and 7:** the owner's rule is that Parts 2 to 4 appear after the first Run. Suggested: Part 1 has choice buttons (a far pass, a close pass, and a slow sweep through the aim distances) and one Run that selects the next unrun choice, as in Gravity 7 (question 1).

## Predictions and where their answers live (A5, sharpened)
- **Guess 1 (does it bend, yes or no):** the answer lives on the drawing, the path against the dashed straight reference line. A yes or no, so only a marker (A3), placed at the bend, and drawn once the path is drawn.
- **Guess 2 (closer: more, less or about the same):** the answer is the curve of bending angle against aim distance. **No such picture exists.** Suggested: a graph beside the drawing (aim distance across, bending angle up) from a sweep computed by the module, with a white marker for the guess (a direction, not a number).
- **Guess 3 (the real universe against ordinary gravity: more, less or exactly the same):** the answer is the ratio of the two curves. Suggested: draw **two curves on the same graph, each its own labelled element**: the simulated angle (amber, "calculated here by stepping ordinary gravity") and the real general relativity angle (a different colour, "calculated from the general relativity formula, twice the ordinary value"), so the learner sees the gap, with a white marker for the guess. A real path is not drawn, because the module has no real-path simulation; I would not add one (§8).
- **A guess has no result-changing power:** the module's result depends only on the aim distance (A1 met, `:179`).

## Links and Words
- **"Want to know more?": Not met. Not searched or read yet.** The introduction uses the 1919 eclipse and gravitational lensing. Candidate sources, none fetched: the original 1919 report (Dyson, Eddington and Davidson, 1920, Philosophical Transactions of the Royal Society), and plain pages from NASA, ESA or Hubble on gravitational lensing and on the 1919 eclipse. Per §29 rule 3(c) nothing is linked until it is fetched and read. Pages that explain the doubling would give away guess 3, so they are **held back until after the tutor**; a neutral page on what gravitational lensing is can sit in the introduction.
- **"Words and formulas" box: Not met.** Terms: aim distance (impact parameter), bend (deflection), ordinary gravity, general relativity, gravitational lensing, relative units, reference line. Formulas, with the page's numbers: ordinary-gravity bending = 2 × mass ÷ (speed of light squared × aim distance) = 2 × 1 ÷ (4 × 2) = 0.25 radian = 14.3° at aim 2; real = twice that = 28.7°. **Held back until after the Part 1 runs:** the doubling (it gives away guess 3).

## Start over, not Change prediction
**Not met.** The three guesses lock on the first launch and there is no way to clear them or the results (no button at all). Needed: an always-visible "Start over", greyed until a guess or run exists and while a run plays, which clears the guesses, the runs, the results and the tutor; a line saying the guesses are locked after Run.

## What the introduction and tutor give away (§12), re-read
- **Intro "Real light bending" (`:245-254`)** says light was measured "bent by exactly the amount Einstein's 1915 theory predicted, not the smaller amount ordinary gravity alone would give", which **is the answer to guess 3**, before the learner guesses. Suggested: keep the 1919 story and lensing after the tutor (as a link or in the explanation), and make the introduction neutral.
- **"Your job" (`:242-244`)** says "see how the amount of bending changes" with the aim, a hint for guess 2. Suggested: neutral wording.
- **Results (`:413-416`)** explains the doubling ("warps space itself") and prints the 1919 paragraph and three "In fact" lines (`:420-442`) right after the run, before the tutor. Suggested: Results keep the aim, the two angles and a check-up; the verdicts and the doubling move to the tutor's explanation.
- **Tutor observe (`LightBendingTutor.tsx:70`)** prints the outcome in brackets; **compare (`:71-72`)** states each guess against the verdict ("in fact, aiming closer always bends it more"; "in fact, the real universe bends it more, by exactly double"). Suggested: observe and compare point to the white marks without a verdict; the explanation opens "Your guesses, marked." for all three.
- **"always bends it more"** is not true at the close end (0.3 to 0.7 falls in with no angle). Suggested: "closer bends more, until it falls in".

## Labels, captions, and what the controls change (C1 to C6, sharpened)
- **The drawing has no labels** (`:335-361`): the mass, the beam's path, the dashed reference line and the moving point are unexplained; only "Position: (x, y)" appears below. Needed on the canvas: "Fixed mass", "Light beam (start)", "Where it would go with no gravity (dashed)", "Path with gravity", and the aim distance marked as a distance from the mass to the dashed line.
- **The slider changes the drawing** (start height and bend), but nothing draws **which** curve value it sits on. Suggested for Part 2: a pink dot at the learner's aim on the graph and the pink flyby against Part 1's grey flybys.
- **Captions (C3 to C6):** one under the drawing and one under the graph, each detailed, with worked numbers (aim 2: ordinary angle 0.25 radian = 14.3°, doubled 28.7°; aim 4: 7.2° and 14.3°) and three-part "what to look for" items, as in Gravity 7.
- **Cross-references.** "Experiment 4", "Experiment 6", "Experiment 7" lack the chapter name throughout (suggest "Experiment 7, what is a black hole?").
- **Honesty line (§8).** All pictures are calculated here: the path by stepping ordinary gravity, the "real" curve from a formula; nothing is measured on this page; the mass, distance and speed of light are relative units; "falls in" means coming within a distance we chose (the event horizon scale, 0.5), and the page's angles are not the real angle of real starlight. **Measured:** only the 1919 and later results, which the page names but does not draw, so the "Where the real picture comes from" line says so.
- **Claims with no source (O2a, d, restated).** "Exactly the amount Einstein's 1915 theory predicted" and "routine" lensing have no source on the page or in the specification's source table (the specification has none). The real 1919 measurements had sizeable uncertainties; the exact figures are **not** quoted on the page, and I would not add one until read (§29 rule 3(c)).

## B1 to B3, recommendation
A real reference exists that is independent of the page's own code: the general relativity angle for the Sun's edge (about 1.75 arcseconds) against the ordinary-gravity value (about 0.87), **if** a plain official page gives them (not yet read). The page's own check, the stepping against its formula, is real but only agrees with itself. Suggested: a **small check-up table** with two rows (the stepping against the ordinary-gravity formula, "the same within about 2 percent"; and, only if a source is read, the Sun's bending as the page's formulas would give it against the published value), with "What this table tells us"; **your decision** (question 7). **No setting-following table:** the pink dot on the graph already shows the aim.

## Updated size
**Large.** A new graph with two curves and three guess marks, labels and captions for both pictures, three Part 1 runs, a page rebuilt around Parts, a module (aim sweep, ratio, guess markers, tutor marking, worked numbers) and tests, a changed introduction, Results and tutor, the specification. **No change to approved physics.**

## Questions for the owner before drafting
1. **What does Part 1 show?** Suggested default: three choice buttons (a far pass, aim 3.0; a close pass, aim 1.0; a slow sweep from 4.0 down to 0.8) and one Run that selects the next unrun choice; each run draws its flyby in the drawing and a dot on the graph; Parts 2, 3 and 4 appear after the first run with a note "run the other two to complete the graph". The curves are drawn only after the sweep, with the white guesses.
2. **The doubled angle at large angles.** Suggested default: keep the slider range, and say plainly in the caption and the Results that the formulas are for small angles, so the page's tens of degrees are a made-up scale and the doubling is the ratio that matters (the real Sun's bend is about 1.75 arcseconds; the figure to be read from a source before it is printed). Alternative: limit the slider to 1.5 and above (angles of 19° and under). Which?
3. **The graph and marks:** aim distance across, bending angle up, an amber curve for the simulated angle, a differently coloured curve for the real general relativity angle (labelled "calculated from the general relativity formula"), white markers with YOUR GUESS boxes for guess 2 (a direction marker) and guess 3 (a marker at the gap), and a marker on the drawing for guess 1? Suggested default: yes.
4. **Labels on the drawing** as listed above, with the aim distance drawn? Suggested default: yes.
5. **Introduction and tutor:** make the introduction neutral (move the 1919 and lensing paragraph after the tutor), drop the tutor's bracketed outcome, make compare ask without stating, replace "always bends it more" with "more, until it falls in", add the Parts paragraph and the guess paragraph, a "Some new words" line? Suggested default: yes.
6. **Results:** keep the aim, the two angles and their ratio with guess tags; drop the doubling paragraph and the "In fact" lines (they move to the tutor)? Suggested default: yes.
7. **Check-up table** (stepping against formula, and the Sun's value only if read from a source)? Suggested default: yes, small.
8. **Links:** search for a neutral lensing page for the start, hold the 1919 and "doubling" pages until after the tutor, and link only what is read? Suggested default: yes.
9. **Honesty line** as drafted above? Suggested default: yes.
10. **Slider range and the falls-in end:** keep 0.3 to 4 with a note that 0.3 to 0.7 falls in (the Part 2 note and caption), or start the slider at 0.8? Suggested default: keep 0.3 to 4 with the note, as the falls-in end echoes Experiment 7.

## Not checked (re-read)
Not run in a browser; dark mode and narrow widths not looked at; no source page searched or fetched; the table above was made by running the module through a temporary test file (removed afterwards, nothing left in the repo) and is not yet in a test; the "about 1.75 arcseconds" and "about 0.87" figures are my recollection of textbook values and are **not sourced**, so they must be read from a page before use; the specification was compared for the wording and behaviour cited, not line by line.
