# Cosmology — Experiment 9: How Did Galaxies Form? Growing Structure from Tiny Ripples

**Status: APPROVED by the owner on 2026-10-09 (proposed by Claude per `CLAUDE.md` §23 Stages 1–3 on 2026-10-09, following the completion of Cosmology Experiment 8. The owner chose this topic, and chose to place it before "The Fate of the Universe", which becomes Experiment 10 and the chapter's closing experiment). Nothing is built. Decision 1 (the starting size of the ripple) was settled in conversation on 2026-10-09: options (a) and (c) are combined, and option (b) is left out. The specification was updated accordingly; the owner has not yet reviewed the full updated text.**

This is the ninth experiment of the "Cosmology" chapter.

---

## Overview

Experiment 3 showed that the oldest light is almost perfectly uniform: the sky's temperature differs by only about 1 part in 100,000 from place to place. Yet today the universe is full of galaxies, with empty space between them. This experiment asks how a nearly smooth universe turned into a lumpy one.

The idea is simple. Imagine a region that starts very slightly denser than average. Its extra gravity pulls in a little more matter, which makes it denser still, which pulls in more. Meanwhile the expansion of space (Experiments 1 and 2) keeps spreading everything out. The experiment shows how fast a small excess density grows under that tug-of-war, and when (if ever) it becomes dense enough to form a galaxy.

The new idea is one thing: **in an expanding universe, a small excess of density grows in proportion to the universe's size (while matter dominates), and dark energy later slows that growth.** The earlier experiments supply everything else.

The experiment's **headline result is the growth factor**: how many times a ripple grows between its start and today. It is exact in this model and needs no measured data. From it the experiment also computes **the starting ripple size needed to become a clump by today** (one divided by the growth factor). The learner can then also choose a starting size and see whether that ripple becomes a clump. The experiment never claims which starting size is the real one (see Decision 1).

---

## Learning Objective

After this experiment, the learner should understand:

1. Galaxies grew from tiny early ripples in density, which gravity amplified over billions of years. Gravity does not need a big head start, only time.
2. The growth is slow: while matter dominates, a ripple grows only as fast as the universe's size does (the universe doubling in size doubles the ripple). From the oldest light until today, the universe grew about 1,090 times in size, so an unaided ripple grows by at most about that factor.
3. Dark matter helps because it starts clumping earlier than ordinary matter. Ordinary matter was held smooth by light until the oldest light was released (Experiment 3); dark matter (Experiment 4) does not interact with light and could start gathering sooner.
4. Dark energy (Experiment 5) slows the growth in the late universe, so the growth stops as the expansion speeds up. This is stated and shown, but its consequences are left to Experiment 10.
5. How big a ripple must start for gravity alone to turn it into a clump: about 1 part in 850 with ordinary matter, and about 1 part in 2,650 with the dark matter head start. These are results of the model, not measurements, and the learner is shown how they compare with the oldest light's 1 part in 100,000 temperature ripples without the experiment drawing a conclusion the model cannot support.
6. What the model does not say: it is a simplified, first-order picture of a region while it is still only slightly denser than average. It does not simulate galaxies forming.

---

## Physical Situation

A single region of the universe whose density starts a small fraction above the cosmic average. The quantity followed is the **density excess** `δ` (the fraction by which the region's density exceeds the average; `δ = 0.001` means 0.1% denser than average).

While `δ` is small (well below 1), the region's growth is given exactly by linear perturbation theory in a flat universe with matter and a constant dark energy, the same universe as Experiments 5, 6 and 8. The growth factor `D(a)` (how much a small excess has grown by the time the universe has relative size `a`, where today is `a = 1`) is:

`D(a) ∝ E(a) × ∫ from 0 to a of da' / (a' × E(a'))³`

where `E(a) = sqrt(matter share / a³ + dark energy share)` is Experiment 5's expansion-rate ratio. Two checks make this trustworthy and testable: with no dark energy, `D(a) = a` exactly (growth in step with the universe's size), and at early times, when dark energy does not matter, `D(a) ≈ a` even with dark energy.

Once `δ` reaches about 1 the linear picture stops being valid: the region is turning into a bound clump (a galaxy or cluster). The experiment marks `δ = 1` as "the ripple has become a clump" and does not follow it further (see "Not introduced").

### What the numbers look like (worked out for this specification: Hubble constant 70, 70% dark energy)

| Growth from → to today | Size ratio `1 + z` | Actual growth of a ripple, `D(1) / D(a)` |
|---|---|---|
| redshift 0.5 | 1.5 | 1.3 |
| redshift 2 | 3 | 2.4 |
| redshift 10 | 11 | 8.6 |
| redshift 1089.8 (the oldest light, Experiment 3) | 1090.8 | about 850 |
| redshift about 3,400 (when matter began to outweigh radiation) | about 3,400 | about 2,650 |

So with dark energy, a ripple grows about 850 times since the oldest light, not the full 1,090: dark energy has taken away about a fifth of it. Dark matter, which can start growing around redshift 3,400, gains about a factor of 3 over ordinary matter, which can start only at redshift 1,090.

### Simplifying assumptions (must be stated to the learner, in plain language)

- **Same simplified universe as Experiments 5, 6 and 8:** flat, matter plus constant dark energy, Hubble constant 70, dark energy share 70%. Radiation (light and other very fast particles) is left out, so the model cannot describe the era before matter dominated. The redshift where matter began to outweigh radiation (about 3,400) is a given real value, not computed.
- **Only the first, simple stage of growth is modelled** (a region still only slightly denser than average). Real structure formation also involves pressure, gas cooling, star formation, and mergers, none of which are modelled.
- **The starting size of the ripple is a learner-chosen illustrative value,** not a measurement. The oldest light's 1 part in 100,000 is a *temperature* difference, which is not the same as the density excess of a region of matter, and the relationship between them depends on the size of the region; the model does not capture that (see Decision 1).
- **A single region, treated alone.** Real galaxies form where many ripples of many sizes overlap; the experiment follows one.
- **Dark matter is assumed to start growing at a given earlier time** (the "head start"), and what it is made of is not specified (as in Experiment 4).
- **The model says when a ripple would become a clump, not what the clump looks like.**

### Not introduced

The shape and size of real density ripples (the power spectrum), acoustic oscillations in the early plasma, the nonlinear collapse of a clump into a galaxy, hierarchical merging, star formation, gas physics, the first stars, N-body simulation, and the cosmic web. All explicitly out of scope, consistent with a single new idea (`CLAUDE.md` §16).

---

## Physics Model

One new, self-contained module. It deliberately **reuses** earlier experiments' code unchanged (imported, not redefined):

- `expansionRateRatio` and `BEST_FIT_DARK_ENERGY_FRACTION` from Experiment 5 (`darkEnergyExperiment.ts`),
- `relativeSizeAtTime` and `universeAgeYears` from Experiment 6 (`universeAgeExperiment.ts`), for a time axis,
- `timeAfterBigBangYears` from Experiment 8 (`observableUniverseExperiment.ts`), to turn a redshift into a time.

The one new calculation is the growth factor `D(a)` above, evaluated numerically (Simpson's rule, as in Experiment 5) with the early-time limit handled analytically, so it needs no new method.

```typescript
// src/physics/structureFormationExperiment.ts

// Given, rounded real-world values used as reference (see Decision 5)
export const RECOMBINATION_REDSHIFT = 1089.8          // restated, tested equal to Experiment 3's own
export const MATTER_RADIATION_EQUALITY_REDSHIFT = 3400 // given, not computed
export const CLUMP_THRESHOLD = 1                       // delta at which the linear model stops

// Growth factor D(a), normalised so D(a) = a at early times.
export function growthFactor(relativeSize: number, darkEnergyFraction: number): number

// The smallest starting density excess that reaches CLUMP_THRESHOLD by today: 1 / growth since the start.
export function requiredStartDelta(startRedshift: number, darkEnergyFraction: number): number

// How many times a ripple has grown between two sizes.
export function growthBetween(startRedshift: number, endRedshift: number, darkEnergyFraction: number): number

// The ripple's size over time for a given start (delta = startDelta * growth so far).
export function densityExcessAt(redshift: number, startRedshift: number, startDelta: number, darkEnergyFraction: number): number

export interface StructureFormationResult {
  kindOfMatter: 'ordinary' | 'ordinary-plus-dark'
  startRedshift: number
  startDelta: number
  growthSinceStart: number            // D(today) / D(start)
  growthWithoutDarkEnergy: number     // the same, with dark energy share 0 (= 1 + start redshift)
  requiredStartDelta: number          // the starting excess needed to become a clump by today
  requiredStartDeltaOtherMatter: number // the same for the other kind of matter, for comparison
  densityExcessToday: number
  becameClump: boolean                // delta reached CLUMP_THRESHOLD at some point
  redshiftOfClump: number | null      // when it did
  curve: Array<{ redshift: number; yearsAfterBigBang: number; densityExcess: number }>
}

export function runStructureFormationExperiment(kindOfMatter, startDelta): StructureFormationResult
```

Structured independently of the UI, per `CLAUDE.md` §9: pure functions, testable with no browser.

---

## Learner Controls

- **What matter is gathering:** "Ordinary matter only" (the ripple can start growing at the oldest light, redshift 1,089.8) or "Ordinary plus dark matter" (it can start growing at redshift about 3,400).
- **How big the early ripple is (a second, optional layer):** presets "1 part in 100,000", "1 part in 10,000", "1 part in 1,000" and "1 part in 500", plus a custom logarithmic slider from 1 part in 100,000 to 1 part in 500. The top end is chosen so that the contrast is visible: with the model's growth factors, 1 part in 500 becomes a clump with ordinary matter (about 1.7 by today), 1 part in 1,000 becomes a clump only with the dark matter head start (about 0.85 against about 2.65), and the two smaller presets become clumps with neither. The growth factor and the required starting size are shown whatever the learner picks here; this control only adds the "does this ripple become a clump?" outcome (see Decision 1).
- **Run**, which plays the ripple's growth from its start to today over a fixed duration, independent of the physics result (`CLAUDE.md` §11).

---

## Prediction Activity

Before the controls and results are shown, the learner answers two questions in sequence (not scored):

1. "Gravity pulls extra matter into a slightly denser region. Starting when the oldest light was released and acting until today, about how many times denser than average (relative to its start) will that region become?" (About 10 times / About 1,000 times / About a million times)
2. "What do you think a head start would do?" Wording: "Suppose the region could start gathering matter earlier, before the oldest light was released. Would that change the answer?" (No difference / A small difference / It would decide the outcome)

The controls are disabled until both predictions are entered. The first Run locks them in; "Change predictions" reopens them without resetting the choices. The graph and caption appear only after predictions are locked in (`CLAUDE.md` §12).

---

## Experiment Behavior

### Display

- **A "growing ripple" picture (labeled):** a strip of space with a slightly denser region at its center, drawn so that its density excess is visible (a brighter, more crowded patch), growing over the run as particles drift inward, with the surrounding space shown stretching. Ordinary and dark matter are drawn in two distinct colors (`CLAUDE.md` §14).
- **A growth-versus-time graph (labeled), the headline picture:** how many times the ripple has grown (the growth factor) against time since the Big Bang, on a logarithmic vertical axis, for ordinary matter and for ordinary plus dark matter, with the same curve without dark energy as a thin reference so the late flattening is visible. It needs no starting size, so it never claims one.
- **A "needed starting size" display:** the required starting ripple (about 1 part in 850 for ordinary matter, about 1 part in 2,650 with the head start), drawn beside the oldest light's 1 part in 100,000 temperature ripple, labeled as a temperature difference, not a density excess, with no conclusion drawn between them (see Decision 1).
- **A schematic "galaxy would grow here" marker, shown only when the learner's ripple becomes a clump:** at the moment `δ` reaches 1, the patch gets a soft glow and a label such as "A clump has formed. In the real universe, a galaxy would grow here (the glow is schematic; the model does not compute it)." It appears only if `becameClump` is true, is a fixed, simple shape with no stars or arms, and the caption states it is a drawn illustration, not a result (`docs/PROJECT.md` §9: an animation must not imply an effect that is not in the model). If the ripple does not reach a clump, nothing is drawn and the readout says how close it came.
- **The optional ripple line:** when the learner has chosen a starting size, their ripple's density excess is drawn as a second graph against time, with a clear line at `δ = 1` ("becomes a clump").
- **Live readout:** the time, the redshift, how many times the ripple has grown and, if a starting size was chosen, the density excess.
- A **"How to read this diagram"** caption (`CLAUDE.md` §14), shown after predictions are submitted, in the same step-by-step style as Experiments 5 to 8.

### Results

States the growth factor and the required starting size for both kinds of matter, and, for the learner's chosen start, the density excess today and whether (and when) it became a clump; compares both predictions with what the model gave; includes simple math per `CLAUDE.md` §15, for example, "1 part in 100,000 × about 850 = about 1 part in 120" and "the universe grew about 1,090 times in size, so a ripple can grow by at most about that factor", and a daily-life comparison (a pile of sand on a slightly tilted board, or a bank balance with a small interest rate growing slowly but steadily); states the model's limits and caveats in a prominent bordered box (`CLAUDE.md` §28.1 pattern).

### Introductory text

To be drafted during implementation, covering the question (the oldest light is almost perfectly smooth, so how did galaxies form?), what happens, the learner's job, what to look for, new terms defined in plain language before use (**density excess**, **growth**), reuse of Experiments 3, 4 and 5, a "Why even ask this" paragraph, and the assumptions above. Any daily-life picture that gives away the answer to the predictions is kept out of the introduction (§12). Subject to the owner's line-by-line wording review per `CLAUDE.md` §28.1.

---

## AI Tutor Behavior

Follows the predict → observe → explain pattern of the prior experiments:

- **Before results:** helps the learner form both predictions; does not reveal the answer.
- **After "Run" completes:**
  1. Observation: "How many times did the ripple grow? Did your chosen starting size become a clump?"
  2. Prediction comparison: the learner's two predicted answers beside what the model gave.
  3. Conceptual question: "Gravity pulls extra matter in, so why does the ripple not grow explosively?" — intended to let the learner reach "the expansion keeps spreading things out".
  4. Explanation: (1) a small excess pulls in more matter and grows; (2) the expansion works against it, so the net growth is only in step with the universe's size while matter dominates; (3) so the total growth since the oldest light is limited to about 1,090 times, and about 850 with dark energy; (4) dark matter starts clumping earlier because it does not interact with light, giving a head start of about a factor of 3 in this simple model; (5) dark energy slows the late growth, a thread picked up in the next experiment; (6) the needed starting size is about 1 part in 850 (ordinary matter) or 1 in 2,650 (with the head start), which is far larger than the oldest light's 1 part in 100,000, but the oldest light's ripple is a temperature difference and not the density excess of a region of matter, so this model cannot say whether the real universe had enough; wording to be reviewed line by line by the owner so that it neither says nor implies that dark matter fails to solve the puzzle; (7) honest limits: the model is first-order, the starting size is the learner's illustrative choice, and the real story (the real shape of the ripples, and nonlinear growth) needs physics this experiment does not model; (8) not covered: the real power spectrum, galaxy collapse, and the cosmic web.

---

## Required Physics Tests

1. With dark energy share 0, `growthFactor(a)` equals `a` (checked at several sizes, to within numerical tolerance).
2. At early times (for example `a = 0.001`), `growthFactor(a)` is within 0.1% of `a` for the default dark energy share.
3. `growthBetween(1089.8, 0, 0.7)` is within 1% of the value in the table (about 850) and always below the full size ratio `1 + z` for a dark energy share above 0.
4. `growthBetween` increases with the size ratio and decreases (for the same start) as the dark energy share increases.
5. The numerical integral matches the closed-form growth factor for a pure-dark-energy-free case and for a fine integration in the default case, to within 0.1% (as in Experiment 5's own accuracy test).
6. Starting earlier (the dark matter head start) always gives a larger final `δ` than starting later, by the ratio of the two growth factors (about 3.1).
7. `densityExcessAt(startRedshift, ...)` returns the start `δ` exactly; the result scales linearly with the start `δ`.
8. `becameClump` is true if and only if `δ` reaches `CLUMP_THRESHOLD` at some point on the curve, and `redshiftOfClump` is the first redshift where it does.
9. `RECOMBINATION_REDSHIFT` equals Experiment 3's own constant.
10. `requiredStartDelta` equals one divided by the growth since the start, and a starting ripple becomes a clump if and only if it is at least that size (checked just below, at, and just above the threshold, for both kinds of matter).
11. The module imports its functions from `darkEnergyExperiment`, `universeAgeExperiment` and `observableUniverseExperiment` rather than redefining them, and does not import from `cosmicMicrowaveBackgroundExperiment` — a regression check (`CLAUDE.md` §8).

---

## Decisions Needing Human Review

1. **RESOLVED in conversation (2026-10-09): options (a) and (c) combined; (b) left out.** The oldest light's temperature ripples are about 1 part in 100,000, but that is a *temperature* difference, not the density excess of a region of matter, and the relationship depends on the size of the region. Using it as the starting `δ` would be a simplification with real consequences: a ripple starting at 1 part in 100,000 would grow by about 850 (ordinary matter) to only about 1 part in 120, and to about 1 part in 40 with the dark matter head start; neither becomes a clump. I have not verified the real relationship between the temperature ripples and the matter ripples on galaxy scales; my web search (2026-10-09) confirmed only the qualitative story (baryons were held smooth until recombination and fell into dark matter's earlier-formed wells), not the numbers. Resolution:
   - **(c) The headline result is the growth factor,** which is exact in the model and needs no measured data.
   - **(a) The learner may also choose a starting size,** and the experiment computes the *required* starting size for a clump (about 1 part in 850 for ordinary matter and about 1 part in 2,650 with the head start), never claiming which value is real.
   - **(b) is left out:** a real density amplitude depends on the region's size (the power spectrum), a second new idea. It could be its own later experiment.
   - **Remaining risk, for the owner's line-by-line wording review (`CLAUDE.md` §28.1):** the required sizes are far larger than 1 in 100,000, so a learner could conclude that dark matter does not solve the puzzle. The tutor's explanation point 6 must say that a temperature ripple is not a matter ripple, and that the real, more detailed story is outside this model, without saying or implying either that the puzzle is solved or that it is not.
2. **Title and placement.** Proposed: "How Did Galaxies Form? Growing Structure from Tiny Ripples" as Cosmology Experiment 9, before "The Fate of the Universe" (Experiment 10, the chapter's closer), per the owner's decision.
3. **Include dark energy in the growth.** Proposed: yes, since it is exact and needs no new method, and it shows the late flattening that sets up Experiment 10. The alternative is a matter-only model (`D = a`), which is simpler but contradicts the universe the rest of the chapter uses.
4. **The dark matter head start is a given, not derived.** Proposed: start dark matter's growth at redshift about 3,400 (matter-radiation equality), stated as a real, given value. Deriving it would need radiation, which this chapter leaves out. The model also ignores that growth before that time is only logarithmic, not proportional to size, which is why the real head start is smaller than the simple factor suggests. I have not checked the 3,400 figure against a primary source.
5. **Reference values.** The values 1,089.8 (Experiment 3) and about 3,400 are given; the 850 and 2,650 growth factors are computed from the model (a quick script, 2026-10-09), not from a source.
6a. **The clump marker and the extra preset (added 2026-10-09, at the owner's request).** A fourth preset, 1 part in 500, and a wider slider, so the dark-matter contrast is visible; and a schematic, clearly labeled "galaxy would grow here" glow at the clump moment. The glow is the one place the picture goes beyond the model, so it is labeled as not computed, and the owner should review it in the browser.
6. **The picture.** Proposed: a one-dimensional strip with a density patch, not a 2D or 3D simulation of many particles. A particle simulation would be a second model and a heavier build.
7. **The daily-life comparison.** Proposed: compound growth (a small rate acting for a long time), kept out of the introduction so it does not reveal the answer.
8. **One region, not many.** Proposed: yes. The cosmic web and merging are named as not covered.

---

## Relationship to Previous Experiments

- **Cosmology Experiment 3 (the cosmic microwave background):** its tiny ripples are where the story starts. It said ripples and structure were a later topic; this is that topic.
- **Cosmology Experiment 4 (dark matter):** dark matter's role moves from "why galaxies spin fast" to "why structure could form in time".
- **Cosmology Experiments 5, 6 and 8 (dark energy, age, the observable universe):** the same flat matter-plus-dark-energy model; this reuses its expansion rate and its time formulas.
- **Cosmology Experiments 1 and 2 (Hubble's Law, the Big Bang):** the expansion that works against the clumping.

## Relationship to Later Experiments

**Experiment 10 (the fate of the universe)** is planned as the chapter's closing experiment: it picks up the late flattening shown here and follows the expansion into the future. It needs its own Stage 1–2 proposal and an approved specification.

---

## Success Criteria

1. The learner makes both predictions before the graph and caption are shown.
2. Choosing ordinary versus ordinary-plus-dark matter, or a different starting ripple, visibly changes the picture and the curve, not just a number.
3. The growth graph shows both kinds of matter and the without-dark-energy reference; the optional ripple graph shows the learner's curve and the `δ = 1` clump line; all with labeled axes and units.
3a. At least one preset becomes a clump with ordinary matter, one only with the dark matter head start, and one with neither, so the animation shows a visible contrast; the clump marker appears only when the model says a clump formed and is labeled schematic.
4a. The required starting size is shown for both kinds of matter beside the oldest light's temperature ripple, labeled as a temperature difference, with no conclusion the model cannot support.
4. The Results panel correctly compares both predictions with what the model gives, with the worked numbers.
5. The experiment states plainly that gravity alone grows a ripple only in step with the universe's size, and that dark energy later slows it.
6. The model's limits (first-order picture, illustrative start, one region, a given head start, no radiation) are stated in the introduction, Results and tutor, and the experiment does not claim to say how real galaxies form in detail.
7. "Density excess" and "growth" are defined in plain language at first use (`CLAUDE.md` §15).
8. No existing experiment's physics is modified or recomputed.

---

## Implementation Notes

Built one step at a time per `CLAUDE.md` §6: physics model and tests (`src/physics/structureFormationExperiment.ts`, `.test.ts`, 17 tests), basic interface, prediction interaction, introduction, results panel, and tutor (`src/components/StructureFormationExperiment.tsx`, `StructureFormationTutor.tsx`), wired into `src/App.tsx`. Nothing from an earlier experiment was modified (only this experiment's files and `App.tsx` changed; Experiment 8's chapter "next" line now points here).

**Complete-flow test (2026-10-09, §21 Step 9) and final review (§21 Step 10), in a headless browser from a cleared `localStorage`.** Checked all eight combinations of kind of matter and preset starting size against the model (the table in "Learner Controls" holds), both ends of the Custom slider, the mid-run readout and glow timing, right and wrong predictions, the Results panel, the tutor, saved progress, changing predictions, and a 390-pixel window. Every Success Criterion and every Required Physics Test is covered. Gaps found and fixed:

- The tutor's point 7 used "first-order" without a plain-language definition (`CLAUDE.md` §15). Reworded.
- The introduction used "bound lump of matter". Reworded to "a lump held together by its own gravity".

**Differences from the text above, and decisions made in the build**

- The specification says the early-time end of the growth integral is "handled analytically". It needs no special handling (the integrand goes to zero there), so the code uses the same Simpson's rule as Experiment 5.
- The specification lists `universeAgeExperiment` among the imports. The module does not need it (Experiment 8's `timeAfterBigBangYears` gives the time axis); the tests use `universeAgeYears` only to check that the curve ends at today's age. Test 11 checks the imports the module does use.
- The 1-part-in-500 preset is stored as 0.002, which is also the slider's top end.
- "The surrounding space shown stretching" is shown as a live "stretched N times" label and readout, not as drawing: the strip follows one fixed patch of matter.
- In "ordinary plus dark matter" mode, alternate dots are violet (dark matter) and amber (ordinary). Both follow the same model density excess, and the split is not to scale with the real proportions.
- The second prediction is not marked right or wrong for "small" or "decides" (both get "partly right"): the head start is only a factor of about 3.1, but at a start of 1 part in 1,000 it decides whether a clump forms. Only "No difference" is marked off. This needs the owner's confirmation.
- The Results panel's daily-life comparison is a savings account with a small interest rate (one of the two options in "Results"), with a note that it is not exact.

**Wording drafted by Claude that the specification does not contain** (for the owner's line-by-line review, `CLAUDE.md` §28.1): the "Why even ask this" paragraph's claims, the grains-of-matter example, the whole Results panel text, the tutor's worked examples in points 3 and 4, and the caption's step-by-step explanations of each picture.

**Not changed or not checked**

- At a 390-pixel-wide window the four pictures shrink to about 174 pixels and their labels become very small (the same app-wide layout matter as in Experiments 4, 7 and 8). Left for the owner.
- With ordinary matter, the dashed no-dark-energy line sits almost on top of the solid line, because the two differ by about a fifth on a logarithmic axis; its end label gives the number.
- The chapter summary in `src/App.tsx` is still a draft, and its "next" line says this is the last experiment.
- Not checked: console warnings (only errors were captured), Custom slider positions between its two ends, keyboard use, and any browser other than headless Chrome.
- The matter-radiation equality redshift (about 3,400) is a given value that has not been checked against a primary source.
