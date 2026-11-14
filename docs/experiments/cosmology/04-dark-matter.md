# Cosmology — Experiment 4: Dark Matter (Why Do Galaxies Spin Too Fast?)

**Status: approved (2026-10-06), per `CLAUDE.md` §23 Stages 1–4, proposed by Claude following the completion of Cosmology Experiment 3. The owner approved the specification as drafted; all six former "Decisions Needing Human Review" items are confirmed as proposed (see "Decisions Confirmed"). Implemented; the owner approved the wording as written (2026-10-06). See "Implementation Notes." Rebuilt to the newer rules on 2026-11-14 (see "Audit Update (2026-11-14)" at the end, which supersedes the interface described above).**

This is the fourth experiment of the "Cosmology" chapter.

---

## Overview

Every earlier experiment in this chapter looked at the universe as a whole: its expansion (Experiments 1–2) and its oldest light (Experiment 3). This experiment looks at a single galaxy and asks a different question: **is the matter we can see all the matter there is?**

The idea is a direct extension of Gravity and Curved Spacetime's Experiment 6 (Orbits). There, the speed needed to circle a mass depends on how much mass is inside the orbit: `v = sqrt(G × M / r)`. If most of a galaxy's mass is concentrated in its bright central region, stars far from the center should orbit more slowly than stars nearer in, exactly as Neptune orbits the Sun more slowly than Earth does. The measured speeds do not do this. Stars far from the center orbit about as fast as stars much closer in. The simplest explanation is extra mass that gives off no light, spread out well beyond the visible stars: **dark matter**.

The learner sees this as a contrast on one graph: the speed predicted from visible matter alone (falling with distance), the speed actually observed (roughly flat), and a **dark matter amount** control that adds invisible mass until the predicted curve rises to meet the observation.

This is Newtonian gravity, which is appropriate here: the speeds involved (about 220 km/s) are under 0.1% of the speed of light. The same Newtonian-approximation caveat used in Gravity and Curved Spacetime's Experiments 6–7 is stated.

---

## Learning Objective

After this experiment, the learner should understand:

1. How fast a star orbits depends on how much mass is **inside** its orbit (`v = sqrt(G × M / r)`, the relation from Experiment 6 of the Gravity chapter), so measuring orbital speeds at different distances is a way to **weigh** a galaxy.
2. If the visible matter (stars and gas) were all the mass, stars far from the center would orbit more slowly than stars near it.
3. Real measurements show far-out stars orbiting about as fast as nearer ones (a "flat rotation curve"), so there must be more mass than we can see, spread out around the galaxy.
4. That unseen mass is called **dark matter**: it exerts gravity but gives off no light we can detect. It is inferred from its gravitational effects; its true nature is still unknown.
5. Dark matter is the leading explanation, supported by several independent kinds of evidence, not a settled picture of what the material actually is.

---

## Physical Situation

A single, simplified, Milky Way-like galaxy viewed from above. Three marker stars orbit the center at different distances. The learner changes the amount of invisible (dark) matter surrounding the galaxy and sees how the predicted orbital speed at each distance responds, compared with a reference line for the typical speed actually observed.

### Simplifying assumptions (must be stated to the learner, in plain language)

- **Newtonian gravity only.** Orbital speeds here are tiny compared with light, so general relativity is not needed (consistent with Gravity chapter Experiments 6–7).
- **Circular orbits, spherically symmetric mass.** Each star is treated as moving in a circle, with gravity set only by the mass inside its orbit. Real galaxies are mostly flattened disks, so this is a simplification; it gives the right qualitative result.
- **The mass model is illustrative, not a fit to one real galaxy.** The visible-matter and dark-matter shapes are simple formulas whose constants were chosen so the numbers land near the Milky Way's real values (about 220 km/s). The visible-only curve is therefore a teaching model, not a measurement.
- **The "observed" speed is a given, real-world value, not derived here.** A flat reference line at about 220 km/s stands for what is typically measured (the Milky Way near the Sun, and many other galaxies). Real curves are not perfectly flat.
- **Only the outer galaxy is shown (5 to 30 kiloparsecs from the center).** The crowded inner region needs a more detailed model and is not covered.
- **No claim is made about what dark matter is.** The halo is only a shape that supplies the missing mass.

### Not introduced

What dark matter is made of, direct-detection experiments, gravitational lensing and galaxy-cluster evidence (named only in a single flagged sentence, not shown), the CMB's tiny ripples (a later topic named in Experiment 3), dark energy (a different, unrelated idea, named only to say it is not this), and how galaxies form. All out of scope, consistent with a single new idea (`CLAUDE.md` §16).

---

## Physics Model

One new self-contained module. It reuses the **relation** `v = sqrt(G × M / r)` already established in Gravity chapter Experiment 6 (`src/physics/orbitExperiment.ts`), but does not import it, because that module works in dimensionless units and this experiment needs real units (kiloparsecs, km/s, solar masses). See "Decisions Needing Human Review" item 4.

```typescript
// src/physics/darkMatterExperiment.ts

// Real, standard value of Newton's constant in galactic units:
// kiloparsecs x (km/s)^2 per solar mass.
export const GRAVITATIONAL_CONSTANT_KPC_KMS2_PER_SOLAR_MASS = 4.30091e-6

// Illustrative visible-matter model: the enclosed visible mass rises with radius and levels off,
// M_visible(r) = VISIBLE_MASS * r / (r + VISIBLE_SCALE_RADIUS), so almost all of it lies within a few
// scale radii of the center, like the bright part of a real galaxy.
export const VISIBLE_MASS_SOLAR_MASSES = 8e10
export const VISIBLE_SCALE_RADIUS_KPC = 4

// Illustrative dark-matter halo (a "pseudo-isothermal" shape, a standard simple choice):
// M_halo(r) = amount * HALO_MASS_PER_KPC * (r - HALO_CORE_RADIUS * atan(r / HALO_CORE_RADIUS)),
// whose enclosed mass keeps growing roughly in proportion to r, so it dominates far from the center.
// `amount` is the learner's control: 0 = no dark matter, 1 = the amount that matches the observed
// speed, 2 = twice that amount.
export const HALO_MASS_PER_KPC_SOLAR_MASSES = 1.2e10
export const HALO_CORE_RADIUS_KPC = 5

// A real, given, rounded value (Milky Way near the Sun) used only as a comparison line.
export const OBSERVED_SPEED_KM_PER_S = 220

export const MIN_RADIUS_KPC = 5
export const MAX_RADIUS_KPC = 30
export const MAX_DARK_MATTER_AMOUNT = 2

export function visibleEnclosedMass(radiusKpc: number): number
export function haloEnclosedMass(radiusKpc: number, amount: number): number
// v = sqrt(G * M_enclosed / r): the Experiment 6 relation, in real units.
export function circularSpeedKmPerS(radiusKpc: number, enclosedMassSolarMasses: number): number

export interface RotationCurvePoint {
  radiusKpc: number
  visibleOnlySpeedKmPerS: number
  withDarkMatterSpeedKmPerS: number
}
export function rotationCurve(amount: number, radiiKpc: number[]): RotationCurvePoint[]

// Time for one lap, in years (2 * pi * r / v, converting kpc to km).
export function orbitalPeriodYears(radiusKpc: number, speedKmPerS: number): number

export interface DarkMatterResult {
  amount: number
  curve: RotationCurvePoint[]
}
export function runDarkMatterExperiment(amount: number): DarkMatterResult
```

Values worked out from these constants, for the specification and the tests (visible only / with dark matter at amount = 1, km/s):

| Radius (kpc) | Visible only | Amount = 1 |
|---|---|---|
| 5 | 196 | 222 |
| 8 | 169 | 218 |
| 12 | 147 | 219 |
| 20 | 120 | 221 |
| 30 | 101 | 223 |

At 8 kpc (about the Sun's distance) the model gives a period of about 225 million years at amount = 1, close to the Sun's real lap of roughly 230 million years. At that radius the model's dark matter is about 40% of the mass inside the orbit, in the range astronomers estimate near the Sun, though not claimed as a precise value.

Structured independently of the UI, per `CLAUDE.md` §9: pure functions, testable with no browser.

---

## Learner Controls

- **Dark matter amount**, a slider from `0` ("none, visible matter only") to `MAX_DARK_MATTER_AMOUNT` (2), with two one-click presets, "None" and "The amount that matches observations" (matching this chapter's presets-plus-continuous-control pattern). Labeled in plain language, with the value shown as a multiple of the matching amount.
- **Run**, which plays the star animation and draws the curves (fixed real-world duration, independent of the physics result, per `CLAUDE.md` §11).

---

## Prediction Activity

Before the control and results are shown, the learner answers two questions in sequence (not scored):

1. "If the stars and gas we can see were all the mass in the galaxy, how would the orbital speed of a star far from the center compare with a star nearer the center?" (Faster / Slower / About the same)
2. "Astronomers measure the real speed of far-out stars. Do you think the measured speeds will match what the visible matter predicts?" (Match / Faster than predicted / Slower than predicted)

The control is disabled until both predictions are entered, consistent with the rest of the project. The first Run locks them in; "Change predictions" reopens them without resetting the chosen amount.

---

## Experiment Behavior

### Display

- **Galaxy view (labeled):** the visible disk drawn as bright stars at the center, three marker stars (at 8, 16 and 30 kpc) orbiting, and a faint translucent halo whose strength follows the chosen dark matter amount, so the control visibly changes the picture. Each marker star's orbit speed follows the currently chosen model. A live readout lists each star's radius and speed.
- **Speed-versus-distance graph (labeled):** speed on the vertical axis, distance from the center on the horizontal axis. Three visually distinct lines: the **predicted speed from visible matter only** (falls with distance), the **predicted speed with the chosen dark matter** (moves with the control), and the **observed speed** (flat reference line at about 220 km/s). Axis labels with units; a legend.
- A **"How to read this diagram"** caption (`CLAUDE.md` §14), shown after predictions are submitted, explaining the galaxy view, the three lines, and what to look for.
- The graph and caption appear only after predictions are locked in, so the graph does not give away prediction 1 (`CLAUDE.md` §12).

### Results

States the chosen amount; the speed predicted at several radii with and without dark matter; whether the chosen amount makes the curve match the observed line (within a stated tolerance, e.g. 5%), and what too little or too much does; and compares both predictions to what happens (visible-only speed falls with distance; measured speed is much higher than the visible-only prediction). Includes real-world grounding (Vera Rubin and Kent Ford's 1970s measurements of stars orbiting in galaxies, including the Andromeda galaxy) and restates the illustrative-model caveat. Includes simple math, per `CLAUDE.md` §15: for example, at 8 kpc, `v = sqrt(4.3×10⁻⁶ × 5.3×10¹⁰ / 8) ≈ 169 km/s` from the visible mass alone.

### Introductory text

To be drafted during implementation, covering: the question (is the matter we can see all the matter there is?), what happens, the learner's job (both predictions), what to look for, new terms defined in plain language before use (**kiloparsec**, **solar mass**, **rotation curve**, **dark matter**), reuse of the circular-orbit idea from the Orbits experiment without re-deriving it, and the assumptions above. A daily-life picture is to be chosen with care: the solar-system comparison (Earth moves about 30 km/s, Neptune about 5.4 km/s) is the natural one, but it reveals the answer to prediction 1, so it belongs in the Results and tutor, not the introduction. Subject to the owner's line-by-line wording review per `CLAUDE.md` §28.1.

---

## AI Tutor Behavior

Follows the predict → observe → explain pattern of the prior experiments:

- **Before results:** helps the learner form both predictions; does not reveal the answer.
- **After "Run" completes:**
  1. Observation: "Compare the line for visible matter only with the observed line. What do you notice, especially far from the center?"
  2. Prediction comparison: the learner's two predicted answers beside what actually happened.
  3. Conceptual question: "If the stars far from the center move faster than the matter we can see can explain, what might be going on?" — intended to let the learner reason toward unseen mass without the tutor stating it outright.
  4. Explanation: (1) orbit speed depends on the mass inside the orbit, `v = sqrt(G × M / r)`; (2) with visible mass only, outer stars should be slower, like Neptune compared with Earth; (3) real galaxies show roughly flat curves; (4) the simplest explanation is unseen mass: **dark matter**, which exerts gravity but gives off no light, and which astronomers estimate is about five times as much as ordinary matter; (5) one flagged sentence on alternatives: dark matter is the leading explanation, supported by several independent kinds of evidence, but its nature is unknown and it has never been directly detected; modified-gravity ideas such as MOND exist and fit galaxy rotation curves well, but have a harder time with other observations such as galaxy clusters and the CMB; (6) not covered: what dark matter is made of, lensing, and the CMB's ripples (a later topic); and that **dark energy**, mentioned in Experiment 2, is a different idea.

---

## Required Physics Tests

1. With `amount = 0`, `withDarkMatterSpeedKmPerS` equals `visibleOnlySpeedKmPerS` at every radius.
2. The visible-only speed is strictly decreasing with radius across `MIN_RADIUS_KPC` to `MAX_RADIUS_KPC` (the premise of prediction 1).
3. At `amount = 1`, the speed is within 5% of `OBSERVED_SPEED_KM_PER_S` at every radius in range (the "matching" claim shown to the learner).
4. At each radius, a larger `amount` gives a strictly higher speed.
5. Consistency check: `speed² × radius / G` equals the enclosed mass used (confirms the relation is applied correctly in real units).
6. `haloEnclosedMass` is 0 at `amount = 0`, grows with radius, and is never negative.
7. `orbitalPeriodYears(8, speed at amount 1)` is within 10% of 230 million years (the sanity check on the real-world comparison stated to the learner).
8. The visible-only speed at 8 kpc is below the observed 220 km/s by a margin large enough to be clearly visible in the display (the premise of prediction 2).
9. The module does not import from `hubblesLawExperiment`, `bigBangExperiment`, or `cosmicMicrowaveBackgroundExperiment` — a regression check that this experiment's galactic-scale physics stays independent of the expansion physics (`CLAUDE.md` §8).

---

## Decisions Confirmed

Confirmed by the owner via question on 2026-10-06, before this draft:

1. **Learner control:** a dark-matter-amount slider, watching the predicted curve rise to meet the observed one (over a two-fixed-views or choose-a-galaxy design).
2. **Units:** real-flavored, Milky Way-like (kpc, km/s, solar masses), clearly labeled as illustrative, consistent with the Hubble's Law and GPS experiments (over dimensionless units).
3. **Alternative explanations:** one honest, flagged sentence in the tutor (over omitting it or a full section), as inflation was treated in Experiment 2.

---

## Further Decisions Confirmed

Confirmed by the owner on 2026-10-06, approving the specification as drafted. Each item below is confirmed as proposed.

1. **Title and placement.** Proposed: "Dark Matter: Why Do Galaxies Spin Too Fast?" as Cosmology Experiment 4. "Spin too fast" is plain-language shorthand; an alternative is "Dark Matter: The Missing Mass."
2. **Mass-model constants were chosen by Claude.** I tuned `VISIBLE_MASS`, `VISIBLE_SCALE_RADIUS`, `HALO_MASS_PER_KPC` and `HALO_CORE_RADIUS` numerically so the matching curve is flat to within about 2% and the visible-only speed at the Sun's distance is plausible. They are not taken from a published fit. I propose labeling them illustrative (as drafted); the alternative is to adopt a published Milky Way mass model, which would be more defensible but more complex.
3. **Slider range and labeling.** Proposed: 0 to 2 times "the amount that matches observations", with a preset at the matching amount. The preset reveals the answer to the control, but not to the predictions. The alternative is an unlabeled amount in solar masses, which is harder for a first-time learner.
4. **Reusing Experiment 6's relation without importing it.** Proposed: re-state `v = sqrt(G M / r)` in real units in the new module, because the Orbits module is dimensionless. The alternative is extracting a shared helper, which touches an existing, approved experiment.
5. **The "observed" line is a flat 220 km/s.** The Milky Way's real curve is not perfectly flat, and recent measurements suggest a slight decline at large radius. I propose the flat line as a clearly stated simplification. The alternative is drawing a few illustrative data points with scatter.
6. **Real-world grounding scope.** Proposed: Rubin and Ford's 1970s measurements in the results panel, and the "about five times as much as ordinary matter" figure in the tutor. Zwicky's 1933 galaxy-cluster observation is not mentioned. Please confirm, or ask for it to be included.

---

## Relationship to Previous Experiments

- **Gravity chapter, Experiment 6 (Orbits):** the speed-versus-enclosed-mass idea is applied to a whole galaxy.
- **Cosmology Experiments 1–3:** these were about the whole universe; this one turns to a single galaxy, and the tutor's closing line previews that dark matter also shapes the early universe (the CMB's ripples, a later topic).
- **Cosmology Experiment 2 (Big Bang):** its tutor already mentions "dark energy" in passing; this experiment states dark matter is a different thing.

## Relationship to Later Experiments

Possible further directions (none proposed here; each needs its own Stage 1–2 proposal): gravitational lensing as a second, independent line of evidence for dark matter, the CMB's tiny ripples and structure formation, or dark energy and the accelerating expansion.

---

## Success Criteria

1. The learner makes both predictions before the graph and control are shown.
2. Moving the dark matter amount visibly changes both the graph (the predicted curve moves) and the galaxy view (the halo strength), not just a number.
3. With no dark matter, the predicted speed visibly falls with distance; with the matching amount, it is visibly flat and close to the observed line.
4. All three lines on the graph are visually distinct, labeled, and explained in the caption.
5. The Results panel correctly compares both of the learner's predictions to what happens.
6. The Newtonian-approximation caveat and the illustrative-model caveat are stated in the introduction, the Results panel, and the tutor.
7. The experiment states plainly that dark matter is inferred from its gravity, that its nature is unknown, and that alternatives exist, in the single flagged tutor sentence (no more than one).
8. "Kiloparsec," "solar mass," "rotation curve," and "dark matter" are each defined in plain language at first use (`CLAUDE.md` §15).
9. No existing experiment's physics is modified or recomputed.

---

## Implementation Notes

Implemented one step at a time per `CLAUDE.md` §6, then complete-flow tested in a headless browser and finally reviewed against this specification, `docs/PROJECT.md`, and `AGENTS.md` (§21 Step 10, 2026-10-06). Committed to git (`b6583e0` physics and tests, `ba76a74` interface, predictions, results, tutor).

- **Physics:** `src/physics/darkMatterExperiment.ts` exactly as specified, with all nine "Required Physics Tests" covered by 10 tests. The gravitational constant was also checked independently by converting from SI units (4.3010×10⁻⁶ kpc (km/s)² per solar mass).
- **Interface:** `src/components/DarkMatterExperiment.tsx` and `DarkMatterTutor.tsx`, wired into `src/App.tsx` under "Cosmology". Three marker stars orbit at the chosen model's speed for a fixed 1 billion years of simulated time, played back in 6 seconds, so playback speed never changes the result (§11). The tutor quotes its visible-only speeds from the physics module, not typed-in numbers.
- **Graph and caption hidden until predictions are locked in,** so the graph does not reveal the answer to the first prediction (§12). "Change predictions" hides them again and keeps the chosen amount.
- **The halo glow was made much stronger after owner feedback.** The first version (opacity about 27% at the matching amount, fading toward the edge) was too faint to see on the dark background. Any amount above zero is now clearly visible (opacity 45% rising to 100% at 2×), with a purple outline at the halo's edge. At zero the halo is drawn at opacity 0.
- **Added at the owner's request, approved as written:** three introduction paragraphs ("Why even ask this", "A sealed-box picture", "How are the speeds measured?"). They deliberately avoid hinting at either prediction's answer. The Uranus and Neptune story (1846) and the "roughly five times as much as ordinary matter" figure were held back for the tutor, to avoid the same hint.
- **Final review found two gaps, fixed:** (1) the introduction said the learner had "seen" in the Orbits experiment that orbit speed depends on mass, but that experiment held the mass fixed, so it never showed that; it now says what was actually found there (one "just right" speed for a given mass and distance) and states the mass dependence as a fact (§8/§20); (2) the orbiting stars were not labeled on the canvas, so a legend line was added (§14).
- **Found during the complete-flow test, fixed:** the Results table was wider than a phone screen and pushed the page sideways by 72px; it is now in a horizontally scrolling box.
- **Beyond the specification text, flagged and approved:** the tutor's Uranus and Neptune example (the specification's tutor outline did include the "about five times as much" figure).
- **Facts written from general knowledge and not checked against a source:** Rubin and Ford's 1970s measurements (including Andromeda), the 1846 Uranus and Neptune story, Earth about 30 km/s and Neptune about 5.4 km/s, the MOND characterization, "roughly five times as much", and the Doppler measurement of orbit speeds. The owner approved the wording as written.
- **Not verified:** a full-page phone-width layout as an image (only the overflow was measured), and the desktop look of the Results table on screen.
- **Owner's line-by-line wording approval (§28.1): complete (2026-10-06),** approved as written, covering the introduction, prediction prompts, caption, Results, tutor, and chapter summary.

---

## Audit Update (2026-11-14)

Built to `docs/audit/cosmology/04-draft-wording.md` ("defaults" from the owner on 2026-11-14 to the eleven questions of `docs/audit/cosmology/04-gap-report.md`; "go ahead with the draft" with the owner's request to keep, improve and add the "what happens" content of the old page; the fuller "What happens" and its steps 5 to 7 approved ("approved, build it into the page"); "show caption for each picture separately"; "update the specification and commit" for this entry). Commits: `65dc111` (physics) and `ba32a8c` (interface), with the documents in the commit that follows them. The approved physics (`visibleEnclosedMass`, `haloEnclosedMass`, `circularSpeedKmPerS`, `rotationCurve`, `orbitalPeriodYears`, `runDarkMatterExperiment` and the existing constants) does not change; **this Audit Update supersedes the interface described in "Learner Controls", "Prediction Activity", "Experiment Behavior", "AI Tutor Behavior" and "Implementation Notes" above.**

**What changed.**
- **Layout.** A long introduction, a collapsed "Words and formulas" box and a "Want to know more?" list, all above Part 1 with no Part heading; then Part 1 "Predict, then watch" (amber), Part 2 "Now try it yourself" (pink), Part 3 "The results" (teal), Part 4 "The tutor" (blue). Parts 2 to 4 appear after the first Run and stay: changing the amount no longer sets the page back to idle, hides the Results or restarts the tutor (the earlier page did all three).
- **Introduction.** "What happens" is now eight numbered steps, at the owner's request ("explained in more detailed", then "explain 5, 6 and 7 in more detail"): (1) stars go round a galaxy as planets go round the Sun; (2) one "just right" speed, with the ball on a string; (3) more pull needs a faster orbit, with a worked rule (four times the mass inside, twice the speed); (4) speed lets us weigh a galaxy; (5) how the speeds are measured (why light, the siren and the Doppler effect, the red hydrogen line of 656.3 nm, a made-up 220 km/s worked example giving a shift of about 0.48 nm, 0.07 percent of the speed of light and about 120 times smaller than a siren's, and the two sides of a turning galaxy); (6) two ways to count the mass (from light, the stadium comparison; from gravity, M = v² × r ÷ G with a made-up 100 km/s at 10 kpc giving 2.3 × 10¹⁰ solar masses; why the counts are independent; what "visible" covers); (7) do the two counts agree (three possibilities, what "dark" does and does not mean, the name, what the experiment does and does not say, the bag comparison); (8) what you do. The ball-on-a-string worked sum (4 and 16 newtons) and the sealed-box picture stay as separate paragraphs, **restored in full at the owner's instruction** although they and the closing sentences of step 7 lean toward guess 2's answer. Followed by "New terms", a "What you will do" paragraph naming the four Parts, "Your guesses and the real pictures", "What we assume" and "Some new words".
- **Part 1.** Guess 1: a far star's speed against a near star's if the visible matter were all the mass (faster, slower, about the same). Guess 2: whether the measured speeds will match the visible-matter prediction (match, faster, slower). An always-visible **Start over** replaces "Change predictions" (greyed out until a guess or a run exists, and while a run plays). **One Run** of six seconds.
- **The pictures.** Picture 1, the galaxy with **no halo**: the stars move at the visible-matter-only speeds, and each star's speed is written beside it **only once the run has started** (found in the browser check to give guess 1 away before the guesses). Picture 2, the graph (axes only before the run; the blue line draws left to right and the green dashed line appears when the run starts; the legend waits for the run, found by a test to name the 220 km/s line before the guesses). **White marks, drawn only when the run has ended, each with a large YOUR GUESS box:** guess 1 as a dotted line from the blue line's start at 5 kpc, rising, level or falling by a fixed illustrative 60 km/s (a direction only); guess 2 as a marker at 30 kpc (an equals sign between the lines, an arrow up or an arrow down; a marker only). Part 2's Picture 3 (the galaxy with the learner's purple halo and stars at the speeds with that amount) and Picture 4 (the graph with the purple line).
- **Captions, one under each picture** (four in all, at the owner's request: "show caption for each picture separately"), each with its own "How to read", worked moment and "What to look for" in the three parts (Look at, What it means, Why it matters); sections appear only once their feature is drawn. Under the graph the "Where the real picture comes from" line (after the run) separates *measured* (the 220 km/s, with the published 229 and 240 km/s), *calculated here* and *imagined for the question*.
- **Part 2.** The amount control (none, the matching amount, a custom 0 to 2 times it) with a separate Run for the stars, a note that the guesses do not change the drawings or tables but the amount does, that the amounts are "trial values", and a sentence on whether the amount reproduces the reference within 5 percent (this page's own rule; the band is about 0.86 to 1.09 times the matching amount).
- **Part 3.** **Table 1, a check-up**: (a) visible matter only at 8 kpc, 169 km/s, 23 percent less than the 220 reference; (b) at 30 kpc, 101 km/s, 54 percent less (guess 2 tagged); (c) the matching amount, 218 and 223 km/s, the same within 1.3 percent at every distance, **not an independent test** because the amount was chosen to do this; (d) one lap at 8 kpc at the matching amount, about 225 million years, about 2 percent less than NASA Starchild's "about 230 million years" (written in 2000); (e) the 220 reference against the published 229.0 (Eilers and others 2018) and 240 (Reid and others 2014): less than both. A "What this table tells us" note in three parts. **Table 2, the speeds at 8, 16 and 30 kpc**, with a "With your dark matter" column that follows Part 2's amount and guess 1 tagged on the 8 and 30 kpc cells of the visible-only column; no comparison table for the control (as Experiment 14 dropped its Table 4). A "Your guesses" block (guess only, no verdict), the worked example (v = √(4.3×10⁻⁶ × 5.3×10¹⁰ ÷ 8) = 169 km/s) and the "Remember" note. **Removed:** both "Checking your ... prediction" paragraphs with their "your prediction was right" lines, the Rubin and Ford paragraph (moved to the tutor) and the sentence "so more mass than the visible matter must be pulling inward".
- **Part 4.** Three questions (the observe prompt asks about the blue and green lines; the compare prompt names the learner's white line and marker; the conceptual question is unchanged), then a six-point explanation that marks each guess from the module's numbers (the tutor is the only place that says "That matches" or "That is not what"), with the Neptune and Earth speeds (5.4 and 29.8 km/s, NASA), Rubin's outer-star finding (NASA), "mostly know it is there from its gravitational pull" (NASA Space Place), 5 and 27 percent of the universe, about five times as much, **for the whole universe and not for the inside of 30 kpc** (NASA), Uranus and Neptune in 1846 (NASA), "mysterious substance" and "as of November 2026", and a return to the sealed box. **Removed:** the MOND sentence (no source).
- **Words box and links.** A box of 19 entries before the run (with a line saying the formula follows) and 20 after it (the formula with its 169 km/s worked example is held because it gives the blue line's value away). Links: three above Part 1 (NASA's Doppler page, NASA Imagine's Milky Way page and NASA Starchild's lap time) and nine that appear after the first Run (NASA's Dark Matter pages, NASA Space Place, ESA Euclid, Physics Today, Eilers 2018, Reid 2014, the NASA Planetary Fact Sheet and NASA's Neptune facts).

**Deviations from the approved draft** (found by tests and the browser check; the wording is otherwise as approved): the star speeds and the graph legend wait for the run; the draft's "look-for item 5" said the stars were at 5 kpc (they are at 8, 16 and 30) and was corrected; the "match" marker was made larger and its connector now reaches it; star speed labels are staggered so they do not overlap; "What to look for" printed twice and now once; the page's heading is "Cosmology 4: Dark Matter"; the sealed-box and "why even ask" content was restored in full, reversing the draft's plan to move it to the tutor.

**Working defaults taken** after "defaults" and "go ahead", each open to the owner: the 220 km/s is kept and disclosed against 229 and 240 (the module constant is unchanged); MOND is left out; the dark-matter share (about 40 percent at 8 kpc, about 80 percent at 30 kpc) is not shown (no published range read); the Doppler wording is extended from a star to "stars and gas on a galaxy's two sides"; the guess 1 line's 60 km/s step has no meaning in itself; Physics Today is linked although its author and date were not captured.

**Physics module (new, with tests; `darkMatterExperiment.ts`).** 18 functions: `guessLineEndpoints`, `guessMarker`, `actualSpeedComparison`, `actualMeasuredComparison`, `speedGuessMatches`, `measuredGuessMatches`, `amountVerdict`, `matchingAmountBand`, `percentDifference`, `readingFor`, `lapsInSimulatedSpan`, `darkMatterShare`, `checkUp`, `fractionOfLightSpeed`, `dopplerShiftNanometres`, `sirenShiftPercent`, `enclosedMassFromSpeed`, `speedRatioForMassRatio`; and constants for the match tolerance, the marker stars' radii, the simulated span, the published speeds and lap, the speed of light, the hydrogen line and the speed of sound. The existing functions are unchanged. 35 tests in the module file (10 old, 25 new).

**Sources (read 2026-11-14 through helper agents whose fetch tool returns short quotes and summaries, so each quotation and figure should be checked against the live page).**
| Item | Source | Status |
|---|---|---|
| Dark matter gives off no light; Rubin and outer stars of spirals; 5 and 27 percent | NASA Science, "Dark Matter" (12 Aug 2026) | Read |
| "Five times as much dark matter as ordinary matter" | NASA Science, "Dark Matter 101" | Read |
| "Mostly know it is there because of its gravitational pull" | NASA Space Place, "What Is Dark Matter?" (2024) | Read |
| "Around five to one" | ESA Euclid, "What is dark matter?" (8 Sep 2020) | Read |
| The 1970 Andromeda measurement | Physics Today (AIP), "Seeing dark matter in the Andromeda galaxy" | Read; **author and date not captured** |
| 229.0 ± 0.2 km/s; the curve "gently but significantly declining" | Eilers and others (2018), arXiv:1810.09466 | Abstract read |
| 240 ± 8 km/s; 8.34 ± 0.16 kpc | Reid and others (2014), arXiv:1401.5377 | Abstract read |
| "About 230 million years" for the Sun's lap | NASA Starchild, Question of the Month (written 2000) | Read; **dated 2000** |
| Earth 29.8 km/s, Neptune 5.4 km/s | NASA Planetary Fact Sheet (13 Nov 2026) | Read; a table row |
| Uranus and the 1846 discovery of Neptune | NASA, "Neptune: Facts" (15 Oct 2026) | Read |
| Blueshift and redshift; Doppler shift gives speed | NASA Webb, "Doppler Shift of a Star's Spectrum" | Read; about a star, not a galaxy |
| 1 parsec = 3.26 light-years; the Sun about 8 kpc out; the Milky Way about 100,000 light-years (30 kpc) across | NASA Imagine the Universe, "The Milky Way" (15 May 2025) | Read; **this host was reported dead on 2026-10-25 and loaded on 2026-11-14** |
| Rubin and Ford 1970; Rubin, Ford and Thonnard 1980 | ADS (HTTP 405) | **Not fetched**; abstracts known from search summaries only; not linked |
| Plain official page on MOND | none found | Gap (§29 rule 3(c)); the page leaves MOND out |
| A published range for the dark-matter share inside 8 kpc | none read | Gap; no row for it in the check-up |
| Plain official page defining "rotation curve" | none found | Gap; defined in the page's own words |
| The red hydrogen line, 656.3 nm; the speed of sound, about 340 m/s | general knowledge | **No source read** |

**Open.**
- Quotations and figures come from helper summaries and need checking against the live pages.
- The 220 km/s reference is lower than both published values read (229 and 240); the module constant was not changed. Whether to change it is the owner's decision.
- The model's 30 kpc ring lies beyond most of the visible disk (NASA gives the whole Milky Way as about 30 kpc **across**); the page does not say so.
- The introduction's sealed-box paragraph and the closing sentences of step 7 sit above Part 1 and lean toward guess 2's answer (§12); they were restored at the owner's instruction.
- Unsourced: the siren comparison, the hydrogen line, "two sides of a galaxy", "a brighter star has more mass", the stadium and bag comparisons, and the sentence that dim ordinary matter such as dust can be spotted.
- The chapter summary in `src/App.tsx` for this chapter was not changed and has not been re-read against the new page; the Cosmology synthesis (`CosmologySynthesis.tsx`) imports numbers from this module's older functions, which are unchanged, and was not otherwise rechecked.
- **Not checked:** narrow widths by eye (only the page's width was measured at 480 px, with no horizontal overflow); dark mode; other browsers; keyboard use; a real learner; of the nine guess combinations only three were viewed in a browser (Slower with They will match, Faster with Faster than predicted, Slower with Faster than predicted), so the "About the same" line and the "slower" arrow were not seen by eye; Pictures 3 and 4 with their final captions and step 7's bag picture were not viewed after the last change.
