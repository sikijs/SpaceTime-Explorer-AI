# Gap report: Gravity and Curved Spacetime Experiment 6 (Why do planets orbit instead of falling in?)
Date: 2026-11-02 | Specification: docs/experiments/gravity-and-curved-spacetime/06-orbits.md | Components: src/components/OrbitExperiment.tsx, OrbitTutor.tsx | Physics module: src/physics/orbitExperiment.ts (+ .test.ts, 8 cases) | Status: read-only, nothing changed

## Summary
Three predictions (weak push, strong push, "is there something in between?"), one slider (push strength, 0 to 200 percent of circular speed), one unlabelled top-down drawing and a Results block that states the general rules. Biggest gaps: the drawing has no labels or caption at all (mass, object, path, dashed trail are only explained by a one-line note for the escape case); the predictions are about ranges of push strength but the run shows one strength, so the "real result" for each guess has no picture; no guess marks; the Results panel gives the verdict on each prediction. Size: **L** (a picture of outcome against push strength would be new).

## Predictions found (A0)
| # | Question | Answers | Where the answer lives on a picture |
|---|---|---|---|
| 1 | If the starting push is very weak, what happens? (`OrbitExperiment.tsx:311-317`) | "Falls into the mass" / "Flies away and never returns" / "Curves around and comes back" (`:26-30`); `slowPrediction` then `submittedSlowPrediction` (`:163, :166, :180`) | A range of push strengths (low end of the slider, `:356-368`). No picture shows outcome across the range; the run shows only the one chosen strength. |
| 2 | Very strong push: same three options (`:318-324`) | same | High end of the same range. |
| 3 | Is there a push strength in between where something different happens? (`:325-331`) | Yes / No (`:24, :109-154`) | The middle of the range (around 100 percent, circular speed). |

## Rule A
| Item | Result | Evidence | Gap and what would be needed |
|---|---|---|---|
| A0 | Met | above | |
| A1 | Met | `:178-179` result from `speedFraction` only; predictions are not read by the physics | |
| A2 | Not met | the `<svg>` (`:385-419`) has no white mark | A strip "what happens at each push strength" (0 to 200 percent) coloured by outcome from the module, with white guess marks and YOUR GUESS boxes at the weak end, the strong end and the middle. |
| A3 | Not met | | Guesses are outcomes, not numbers: markers at the ends and middle of the strip, caption saying so. |
| A4 | Not met | | Draw once the strip's outcome bands are drawn. |
| A5 | Not met (needed) | the answer has no picture across strengths | New panel in the same picture area, on its own horizontal scale (push strength), own title. |
| A6 | Not met | no "Where the real picture comes from" | Calculated here by stepping ordinary gravity forward (module header `orbitExperiment.ts:1-16`), relative units (`:306`). |
| A7 | Not met | intro `:264-309` silent; the lock note `:334-339` talks about predictions but not the pictures | Add the three sentences; the slider changes the drawing, guesses do not. |
| A8 | Not met | Module exports `OrbitPoint`, `OrbitOutcome`, `OrbitExperimentResult`, `runOrbitExperiment` (`orbitExperiment.ts:17-72`); the circular speed is recomputed in the component (`:170`); outcome per-strength sweep and thresholds are missing | Add a sweep function, threshold values, guess-marker data and tests. |
| A9 | Partly met | Tutor "compare" step names the guesses and the rule (`OrbitTutor.tsx:67-68`) before the explanation | |
| A10 | Not met (no statement) | Results `:442-454` "Your prediction ... In fact ..." | The panel itself is the older text-beside-results. |

## Rule B
- B0. One Results block (`:426-456`): launch speed and escape speed percentages, outcome sentence, three "Your prediction ... In fact ..." lines. No tables.
- B1. Not met. A real reference exists inside the physics: circular speed 100 percent and escape speed about 141 percent of it (`:430-432` prints the latter). A check-up row "your push vs circular speed vs escape speed" could give "below / near / above". No published value is needed (ordinary gravity).
- B2. Not met.
- B3. N/A: the slider changes the run itself; a settings table would not add to the drawing.
- B4. Partly met: text lines (`:443-454`) that also state the verdict ("In fact, yes"), a tutor job under the newer rule.
- B5. Partly met: `escapeSpeed` is from the module; the percentage arithmetic is in the component (`:432`).

## Rule C
- C1. Not met: the drawing (`:385-419`) labels nothing. The central mass, the moving object, the path, the starting point, the push direction and the dashed escape trail are unlabelled (only the dashed trail has a note under the picture, `:420-424`, when it appears).
- C2. Partly met: different strengths give visibly different paths; the first and second runs are not shown together, so contrasts across strengths are not visible at once.
- C3. Not met: no "How to read this diagram" caption.
- C4. Not met.
- C5. Not met (a cliff-throw comparison is in the tutor's explanation, `OrbitTutor.tsx:123-129`, not in a caption).
- C6. Not met.
- C7. Partly met: intro "Why even ask this" asks whether an orbit is "a particular kind of falling" (`:272-274`), close to the tutor's conclusion (hint, §12); the "Your job" line `:285-286` is neutral.
- C8. Partly met: "circular-orbit speed" and "escape speed" appear in the slider label and Results (`:357, :430-432`) with a brief parenthesis only in the Results (after the run), not before the learner uses the slider; "gravity", "orbit" are everyday words.

## Other findings
- O1. Possible inconsistency inside the experiment: the intro says it uses ordinary gravity and not general relativity (`:292-295`), while the tutor's point 4 says the path is "as straight as spacetime allows ... because spacetime near the mass is curved" (`OrbitTutor.tsx:132-135`). Owner to decide whether that is acceptable; reported only.
- O2. (a) Results `:443-453` states each guess's "In fact ..." verdict immediately after the run (§12 timing vs the tutor). (b) The Results rules ("always falls in", "always flies away") are stated for the extremes while the learner's run may be at any strength; the first prediction has no real run unless the learner happens to choose a low value (the page does not require it). (c) The tutor's first observe prompt gives the outcome in brackets (`:66`), which can be read as the answer before "observe". (d) The classification "falls in" depends on a collision radius of 0.1 × the start distance (`orbitExperiment.ts` constant `COLLISION_RADIUS_FACTOR = 0.1`), a chosen value, not mentioned to the learner. (e) The page says the "Change predictions" button lets the learner start over (`:334-352`), a behaviour not mentioned in the specification summary read. (f) Cross-references to "Experiment 4/5" lack the chapter name.

## What an update would touch, and its size (O3, O4)
OrbitExperiment.tsx (new strength strip, labels on the drawing, caption, intro, notes, results), OrbitTutor.tsx, physics module + test (sweep, thresholds, markers), specification. **Size: L.**

## Not checked
No browser view; the tutor was read from its explanation step and a keyword view of the compare step; the module's internals beyond its header and constants were skimmed; specification not compared; Rule D N/A.

---

# Re-read, 2026-11-12: Rule E and the owner's rules of 2026-11-02 to 2026-11-07
Read-only. Re-read of `OrbitExperiment.tsx` (471 lines), `OrbitTutor.tsx` (145), `orbitExperiment.ts` (142, 8 tests) and the specification `06-orbits.md`, following the Gravity 1 to 5 audits as approved. Nothing in the app changed. Rules A to C above stand as written; this section adds what they did not cover, and **corrects the first report on one important point**.

## The most important finding: the page's "always falls in" is false for most weak pushes
I ran the module (`runOrbitExperiment`, mass 1, distance 1, the page's own settings) at every slider step, 0 to 200 percent of circular speed, and at finer steps near the two edges:

| Push (percent of circular speed) | Outcome from the module | Notes |
|---|---|---|
| 0 to 40 | **falls in** | takes about 1.1 to 1.3 time units |
| 45 to 100 | **orbits** | a closed ellipse, a perfect circle at exactly 100 |
| 105 to 140 | **orbits** | a longer and longer ellipse: its farthest point is 1.2 times the start distance at 105, 2.6 times at 120, 10 times at 135 and **49 times at 140** (the sweep printed 19 for 140 because the page's run stops after eight laps' worth of time, before the object gets that far; corrected 2026-11-12 from the closed-form farthest point f² ÷ (2 − f²)) |
| 145 to 200 | **escapes** | |
| Finer steps | 42 falls in, 43 orbits; 141 orbits, 142 escapes | the two edges are about **42.6 percent** and **141.4 percent** (the escape edge is the square root of 2, from the formula) |

Two things follow.
1. The Results text and the tutor's compare step say "**a push well below circular speed always falls in**" (`OrbitExperiment.tsx:445-446`, `OrbitTutor.tsx:67`). That is true only below about 43 percent. A learner who runs 60 percent sees the object **orbit**, with that sentence printed beside their "weak push" guess. The same sentence says "well above escape speed always flies away", which is true but leaves the 105 to 140 percent band (bound, orbiting) unexplained.
2. **The orbit is not one "just right" strength.** Tutor point 3 ("just the right strength, and it keeps 'missing' the mass forever") suggests a single value. In fact everything from about 43 to 141 percent orbits; only 100 percent is a circle. The page never shows this, so the "in between" question, whose answer is "yes", has no picture of how wide the in-between is.

Also: the 43 percent edge is **not physics**. It comes from the page's chosen collision radius (0.1 of the start distance, `COLLISION_RADIUS_FACTOR`); a real planet and star have a real size, and a point mass would be "hit" by any push below 100 percent. With a collision radius of 0.1 the edge is the square root of (0.2 ÷ 1.1) = 0.426 (the closest approach of an object launched at fraction f is f² ÷ (2 − f²) of the start distance). The 141.4 percent edge is real physics (the escape speed formula). The learner is not told this.

Last, the slider steps straddle both edges exactly (40 then 45, 140 then 145), so a learner can bracket them. That is good, and worth keeping.

## Rule E: the page in four Parts
| Item | Result | Evidence | Gap and what would be needed |
|---|---|---|---|
| E1 | Not met | One card holds the introduction, three predictions, the slider, Run, the drawing, Results (`:215-448`); the tutor is a second card | Part 1 (predictions, Run, the drawing and a new outcome graph), Part 2 (the slider and a pink drawing), Part 3 (results), Part 4 (tutor). |
| E2, E4 | Not met | No Part headings or leads | Four leads, drafted for approval; Part 1's lead gives no answer (§12). |
| E3 | Not met | No links, no words box | See "Links and Words". |

## Parts 2 to 4 appear after the first Run
**Partly met as built:** the Results and tutor appear after the first Run, but the slider is on the page from the start and Run needs all three predictions. Under the Parts layout the slider moves to Part 2. **The same Part 1 question as Gravity 5:** the three guesses are about three different pushes (weak, strong, in between), but today one Run plays one push, so at most one guess ever meets its real run (question 1).

## Predictions and where their answers live (A5, sharpened)
The three guesses are outcomes (falls in, escapes, orbits), asked about **ranges of push strength**. The natural picture is an **outcome graph**: push strength across (0 to 200 percent), three rows up the side (falls in, orbits, flies away), and the real result drawn as a step line computed by the module (low rows at the left, high at the right, edges at 43 and 141). The weak-push and strong-push guesses are white marks on the row the learner chose, at the weak and strong ends; the in-between guess (yes or no) is only a marker in the middle (A3, said in the caption). This puts the guesses and the real result on one picture (A5).

## Links and Words
- **"Want to know more?": Not met. Not searched or read yet.** The page uses no measured result, so there is no paper for it. Background ideas: what an orbit is, escape speed, and "falling while missing" (Newton's cannonball, already in the tutor). I have not searched for plain official pages (NASA or ESA education pages are the likely sources) and link nothing until it is read (§29 rule 3(c)). Any page that explains orbits as falling will give away the answer to the in-between question, so it would be **held back until after the tutor**; a neutral page (for example what a satellite or planet is) could go in the introduction.
- **"Words and formulas" box: Not met.** Terms: orbit, push strength, circular-orbit speed, escape speed, falls in (and the collision radius), flies away, relative units, top-down view, trail. Formulas, with the page's numbers (mass 1, distance 1): circular speed = square root of (mass ÷ distance) = 1; escape speed = square root of 2 × that = 1.414, so 141 percent; closest approach = f² ÷ (2 − f²). **Held back until after the Part 1 runs:** circular speed means 100 percent is special (hint to the in-between answer), and escape speed gives the 141 percent edge.

## Start over, not Change prediction
**Not met.** "Change predictions" (`:197-208`) is shown only after the first run and keeps the slider. Needed: an always-visible "Start over", greyed until a guess or run exists and while running, which clears the guesses, the runs, the results and the tutor; a line saying the guesses are locked after Run.

## Items the re-read changes or sharpens
- **The slider's label gives a hint (C8).** "% of circular-orbit speed" uses a term not yet explained and implies 100 percent is special. Suggested: Part 1 uses plain names ("a very weak push", "a very strong push", "a push in between") with the number small beside it; the term is explained in Part 2, after the runs.
- **The tutor's first prompt states the outcome (§12).** `OrbitTutor.tsx:66` prints "(It falls into the mass.)" before the learner has said what they saw. Suggested: drop the bracket; the observe step points to the white marks.
- **The tutor's compare step states the verdict (§12, B4).** `:67-68` prints each guess beside "in fact ... always falls in". Suggested, as in Gravity 3 to 5: compare asks without stating, the explanation marks all three guesses.
- **Results states the verdict (B4).** `:443-454` prints three "Your prediction ... In fact ..." lines. Suggested: Results keeps the strength, the outcome and the two reference speeds, with a "your guess" tag on the row where each guess lives; no "In fact".
- **Tutor point 4 vs the introduction (O1, still open).** The introduction says this is ordinary gravity "not the exact general relativity from Experiment 4's curved-spacetime picture"; point 4 says "the path is as straight as spacetime allows, and it curves because spacetime near the mass is curved". Both were approved on 2026-09-27. Your decision, reported only.
- **Intro "Why even ask this".** It asks whether an orbit "might just be a particular kind of falling" (`:272-274`), which is the tutor's conclusion. You approved it on 2026-09-29. A hint rather than the answer; kept unless you choose.
- **What the controls change (§14 rule 2).** The slider changes the path, so the drawing does move, but nothing shows **which outcome band** the pushes fall in. Suggested for Part 2: a pink dot on the outcome graph at the chosen strength, and the learner's path in pink with Part 1's paths in grey for contrast.
- **Labels (C1).** The drawing needs labels on the canvas: the mass, the object at its start, an arrow for the push (its length following the strength), the path, the dashed "continues off the picture" line. Suggested labels: "Fixed mass", "Object (start)", "Push (straight up)", "Path so far".
- **A view that fits.** The drawing zooms out to fit each path (up to 49 times the start distance at 140 percent, which makes the orbit near the mass a tiny dot). Suggested: keep a fixed view (the start distance and four times it, as now) and mark any path leaving it with "continues beyond the picture", so two runs can be compared at one scale.
- **Captions (C3 to C6).** Two captions: Part 1's drawing and outcome graph, and Part 2's pink dot and path, each with three-part "what to look for" items and worked numbers (for example 20 percent: falls in after about 1.1 time units; 100 percent: a circle; 200 percent: leaves).
- **Cross-references.** "Experiment 1", "Experiment 4", "Experiment 5" lack the chapter name throughout (suggest "Experiment 4, curved spacetime").
- **Honesty line (§8).** All pictures are calculated here by stepping ordinary gravity forward; nothing is measured; "falls in" uses a chosen collision radius of 0.1; mass and distance are relative. No real value is quoted.
- **Claims with no source.** Only the tutor's cliff-throw comparison (Newton's cannonball) and "the same rule used to predict real satellites and planets"; both are standard and reported, kept as approved.

## B1 to B3, recommendation
A real reference exists here that is independent of the page's own constants: the closed-form escape speed (141.4 percent, the square root of 2) against what the stepping found (between 141 and 142 percent), and the circular-orbit check (100 percent stays at the start distance). A **small check-up table** ("what the formula says / what the stepping found / reading", two or three rows, for example "same", "the same within one percent") is possible and uses a tested module function, so I recommend it, but it is **your decision** (question 8). **No setting-following table:** the pink dot on the graph already shows the settings.

## Updated size
**Large.** One new picture (the outcome graph with three guess marks), a rebuilt page around Parts, a changed prediction flow (three Part 1 runs), a fixed view, a module (sweep, edges, outcome rows, guess markers, tutor marking, worked numbers) and its tests, the tutor, the specification. **No change to approved physics**: the numbers above are what the module already returns.

## Questions for the owner before drafting
1. **What does Part 1 show?** Suggested default: three choice buttons (a very weak push 20 percent, a very strong push 200 percent, a push in between 100 percent) and one Run that selects the next unrun choice; each run draws its path in the drawing and a dot on the outcome graph. Parts 2, 3 and 4 appear after the first run, with a note "run the other two pushes to complete the graph". The full step line on the graph is drawn only after all three Part 1 runs (§12), with the white guesses.
2. **The wrong sentence (the table above).** Suggested default: Results, tutor and caption say "a push below about 43 percent falls in; from about 43 to about 141 percent it orbits; above about 141 percent it flies away", with the 43 percent edge explained as "set by the size we gave the mass". Alternative: change the collision radius (changes an approved constant). Not recommended.
3. **The outcome graph and marks:** push across, three rows up the side, white rings on the chosen row at the weak end and the strong end, a white yes or no marker in the middle (only a marker, said in the caption), each with a YOUR GUESS box? Suggested default: yes.
4. **Fixed view for the drawing**, "continues beyond the picture" for any path that leaves it? Suggested default: yes.
5. **The slider in Part 2**, labelled in plain words with the term "circular-orbit speed" explained only there, with a pink dot on the graph and Part 1's paths in grey? Suggested default: yes.
6. **Introduction and tutor:** add the Parts paragraph and guess paragraph, replace "Your job", drop the tutor's bracketed outcome, make compare ask without stating, change point 3 from "just the right strength" to the band of strengths, add the "Some new words" line? Suggested default: yes. **Point 4's spacetime wording (O1) and the "Why even ask this" paragraph:** keep as approved? Suggested default: keep.
7. **Results:** keep the push, the outcome and the two reference speeds with guess tags; drop the "In fact" lines? Suggested default: yes.
8. **Check-up table** (formula against stepping, two or three rows)? Suggested default: yes, small; otherwise none.
9. **Links:** search for a neutral page for the start (what an orbit is), hold the "orbit as falling" pages until after the tutor, and link only what is read? Suggested default: yes.
10. **Honesty line:** "calculated here by stepping ordinary gravity forward; relative units, not measured; 'falls in' means coming within 0.1 of the start distance of the mass, a size we chose"? Suggested default: yes.

## Not checked (re-read)
Not run in a browser; dark mode and narrow widths not looked at; no source page searched or fetched; the table above was made by running the module through a temporary test file (removed afterwards, nothing left in the repo) and is not yet in a test; the closest-approach formula f² ÷ (2 − f²) is my own derivation (energy and angular momentum at the launch point), and agrees with the sweep (edge between 42 and 43 percent), but is not yet checked in a test or against a source; the specification was compared for the wording and behaviour cited, not line by line.
