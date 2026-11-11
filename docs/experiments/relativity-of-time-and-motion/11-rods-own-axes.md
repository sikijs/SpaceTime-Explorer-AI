# Experiment 11: The Block's Own Axes

*Naming note (owner's decision, 2026-11-10): the object was renamed from "rod" to "block" in Experiments 7 to 11, and this experiment's title from "The Rod's Own Axes" to "The Block's Own Axes". The file name `11-rods-own-axes.md` and the code names `rodTimeAxisFor`, `rodSpaceAxisFor` and similar are kept so that existing links and code do not change.*

**Audit update, 2026-11-11 (built; owner approved the draft wording).** The page was rebuilt (commits `cabcbc4`, `8931d56`, `8c693f3`). The section "Audit Update (2026-11-11)" at the end lists every change. Where it differs from the older text below (the "Display", "Run", "Results Display", "Required Physics Tests" and "AI Tutor Behavior" sections, the hard-coded `actualTimeOutcome`, the CALCULATE/reveal button, the single page without Parts, and the statement that the introduction and tutor wording had not yet been approved), **the Audit Update wins**. The "Implementation notes" below record the build as of 2026-09 and are superseded where that section says so.

**Status: APPROVED by the project owner.** All items under "Decisions Needing Human Review" are resolved.

**Implementation: built and tested.** The physics model (`lorentzTransform`, `rodTimeAxisFor`, `rodSpaceAxisFor`, and the `timeDilationFactorFor` refactor of `movingClockExperiment.ts`), physics tests, interface, prediction, results panel, and AI tutor are all built (`src/physics/lorentzTransform.ts`, `src/physics/spacetimeDiagramView.ts`, `src/components/Experiment11.tsx`, `src/components/Experiment11Tutor.tsx`). It has had its complete-flow test in a browser (`CLAUDE.md` §21 Step 9) and its final review against this specification (§21 Step 10; no gaps found). The chapter's "What you learned" summary in `src/App.tsx` has the owner's approval; the introduction and tutor wording drafted below have not yet had the owner's line-by-line approval (`CLAUDE.md` §28.1).

## Overview

Experiment 7 told the learner, in numbers, that a flash released from the center of a moving block reaches both ends at the same time in the block's own frame, but not in the lab frame. Experiment 8 drew that whole situation as a spacetime diagram, in the lab frame only. Experiment 9 added one line to that diagram: the block's own "same moment" line, showing geometrically that it's tilted, not flat.

Experiment 11 completes that picture. It draws the block's own **two** axes — its own time direction and its own "now" direction — on the very same diagram, both tilted (by an amount that depends on speed). Then it uses the actual mathematical rule for converting between the lab's numbers and the block's own numbers — the **Lorentz transformation** — to compute the real coordinates the block's own frame would assign to the two flash-arrival events. The payoff: transforming both events gives the *same* time in the block's frame, confirming by direct calculation exactly what Experiments 7 and 9 already showed by other means.

Unlike Experiments 7–10, this experiment introduces genuinely new physics: the Lorentz transformation itself. Everything else in it (the two new axis lines, the reused block-and-flash scenario) is pure reuse or pure geometry, following the established pattern.

---

## Learning Objective

After this experiment, the learner should understand:

1. The block's own frame has its own two axes on the same page as the lab's diagram — its own time direction and its own "now" direction — both tilted relative to the lab's, by an amount that depends on the block's speed.
2. There is an actual mathematical rule — the Lorentz transformation — for converting an event's lab-frame position and time into the position and time the block's own frame would assign to that same event.
3. Applying that rule to the two flash-arrival events gives the same time for both, in the block's frame — confirming, by direct calculation, the same fact Experiment 7 gave in numbers and Experiment 9 gave as a picture.
4. Nothing physically new is happening here. It's the same two events, the same block, the same flash — just measured using the block's own ruler-and-clock convention instead of the lab's.
5. This ties together the entire sequence: Experiment 7 gave two numbers, Experiment 8 turned them into a picture, Experiment 9 added one line, and Experiment 11 supplies the actual mathematical bridge connecting the lab's numbers to the block's own.

---

## Physical Situation

### Reused from Experiments 6, 7, 8, and 9

The same block (rest length `L0 = 0.5` light-second) moving along its own length at a chosen speed `v`, with a flash released from its exact center — identical setup, no changes. `backEvent` and `frontEvent` are exactly the points already computed by `spacetimeDiagramFor` (`src/physics/spacetimeDiagramView.ts`).

### What is new

1. **Two new axis lines** (pure geometry, no new physics — see Physics Model): the block's own time axis and its own space axis, both drawn through the origin (the flash-release event) on the existing diagram.
2. **The Lorentz transformation** (genuinely new physics): a function that converts any event's lab-frame `(position, time)` into the `(position, time)` the block's own frame would assign to it.

### Simplifying assumptions (all must be stated to the learner, in plain language)

- Flat spacetime: no gravity, constant velocity only (same as Experiments 3–10).
- Everything is still the same block-and-flash scenario from Experiments 6–9 — nothing about the setup changes.
- The two events being transformed are exactly the ones already computed in Experiment 7 — nothing about them is recalculated independently before the transformation is applied.

### Not introduced

γ as a formally named quantity (the owner chose to keep using Experiment 3's already-familiar "time dilation factor," reused by division, instead of introducing a new symbol — see Decisions Needing Human Review), a fully calibrated tick-marked coordinate grid along the new axes (the owner chose the lighter two-plain-lines version — see Decisions Needing Human Review), numeric primed coordinates for anything beyond the two already-known events, general relativity, curved spacetime, and any scenario beyond this same block-and-flash setup.

---

## Physics Model

### New: the Lorentz transformation

```typescript
// src/physics/lorentzTransform.ts
export function lorentzTransform(event: WorldlinePoint, velocity: number): WorldlinePoint
```

```
timeDilationFactor = (Experiment 3's own factor, reused — see implementation note below)
gammaFactor = 1 / timeDilationFactor
time'     = gammaFactor * (time - velocity * position)
position' = gammaFactor * (position - velocity * time)
```

This is the first experiment to introduce a new relativistic formula rather than only reusing existing results. It must be tested rigorously on its own terms (see Required Physics Tests), including a direct cross-check against Experiment 7's already-established, human-approved result — not just internal self-consistency.

**Implementation note:** to avoid duplicating the `√(1 − v²)` formula that already lives in `src/physics/movingClockExperiment.ts` (Experiment 3), the plan is to extract it into a small, additional exported helper there (e.g. `timeDilationFactorFor(velocity)`), used by both the existing `runMovingClockExperiment` and this new function. This is a non-behavior-changing refactor of previously-approved code — Experiment 3's own function, tests, and results are unaffected — but it does touch an already-reviewed file, so it's called out here explicitly rather than done silently.

### New: two axis lines (pure geometry, no new physics)

Added to `src/physics/spacetimeDiagramView.ts`, alongside Experiment 9's `sameMomentLineFor`:

```typescript
export function rodTimeAxisFor(diagram: SpacetimeDiagramData): [WorldlinePoint, WorldlinePoint]
export function rodSpaceAxisFor(diagram: SpacetimeDiagramData): [WorldlinePoint, WorldlinePoint]
```

- `rodTimeAxisFor`: the worldline of the block's own spatial origin (its center) — parallel to the block's already-drawn back/front worldlines (same velocity), but passing through the origin `(position 0, time 0)`, the flash-release event.
- `rodSpaceAxisFor`: the block's own line of "now" through the origin — same slope (`v`, time-over-position) as Experiment 9's `sameMomentLineFor`, but anchored at the origin instead of at `backEvent`/`frontEvent`.

Both derive their slope from data `spacetimeDiagramFor` already computed (the existing worldlines' own slope) — no velocity is passed in separately, and no independent formula is introduced, matching the pattern already established by `sameMomentLineFor`.

---

## Learner Controls

- **Speed of the block:** same presets and range as Experiments 6–9 — 0c (at rest), 0.1c, 0.3c, 0.5c, 0.8c, or Other from 0.01c to 0.9c. Unlike Experiment 10, `v = 0` is meaningful and useful here (the Lorentz transformation reduces to the identity, a clean baseline check).
- No other controls.

---

## Prediction Activity

Before the transformed coordinates are revealed, the learner is shown the plain Experiment 8/9 diagram for their chosen speed, then asked:

> Experiment 7 told you the flash reaches the back end and the front end at different times, according to the lab. If we calculate the actual time each event happens *in the block's own frame*, using the real math for converting between frames, what do you expect: will the two events come out at the same time, or at different times?

Choices: "Same time" / "Different times". Not scored. The reveal control is disabled until a prediction is entered, matching Experiments 1–10.

---

## Experiment Behavior

### Introductory text (plain-language draft — for the owner's approval, `CLAUDE.md` §28.1)

> **The question.** Experiment 9 showed you a tilted line — the block's own idea of "the same moment" — but that line, by itself, doesn't tell you the actual numbers. Is there a real mathematical rule for converting the lab's numbers into the block's own numbers, for any event?
>
> **There is: it's called the Lorentz transformation.** It's a rule that takes an event's position and time, as measured in the lab, and calculates the position and time that someone moving along with the block would measure for that exact same event. It doesn't change what happened — it just translates the description from one point of view into the other, the way converting kilometers to miles doesn't change a distance, only how it's written down.
>
> **What you're about to do.** We're going to draw two new lines on the diagram — the block's own time direction and its own "now" direction, both tilted — and then use the Lorentz transformation to calculate the block's own numbers for the two events from Experiment 7. Before we do, make a prediction: using this real calculation, will the two events come out at the same time in the block's frame, or different times?
>
> **What we assume.** Everything here is still the same block-and-flash scenario from Experiments 6 through 9 — nothing about the setup changes. We're only adding two new lines to the picture and calculating two new numbers.

### Display

The Experiment 8/9 diagram, unchanged, plus:

- The block's own time axis and space axis, each in a color visually distinct from the block's black worldlines, the light's gold dashed lines, and Experiment 9's purple same-moment line.
- The two new axes appear only after the learner's prediction is submitted and the diagram is revealed, matching Experiment 9's reveal timing.
- At `v = 0`, both new axes coincide with the lab's own axes (vertical and horizontal), the same baseline-check pattern used throughout Experiments 6–9.

### Run

Static, like Experiments 8–10: the full diagram and the transformed numbers appear at once after the reveal control is pressed. No animation.

---

## Results Display

- Block speed.
- `backEvent` and `frontEvent`'s lab-frame position and time (already shown in Experiment 8/9's style).
- `backEvent` and `frontEvent`'s **block-frame** position and time, from the Lorentz transformation.
- A plain-language confirmation line: both events happen at the same time in the block's frame — matching the value Experiment 7 already gave (`rodFrameEventTime`).
- The learner's prediction, shown beside the actual result.

---

## Expected Observations

1. At every tested speed, the two events' transformed times are equal to each other, and equal to Experiment 7's own `rodFrameEventTime` value.
2. At `v = 0`, the transformation changes nothing: the block-frame numbers equal the lab-frame numbers, and both new axes are vertical/horizontal, matching the lab's own.
3. At `v > 0`, both new axes are visibly tilted, and the block's own space axis (through the origin) is parallel to Experiment 9's purple same-moment line (through the two events) — they share the same slope, just at different positions.

---

## Expected Learner Understanding

The learner should be able to say: "The block has its own two axes on the same diagram as the lab's, both tilted. There's an actual mathematical rule — the Lorentz transformation — for converting the lab's numbers for an event into the block's own numbers. When I use it on the two flash-arrival events, I get the same time for both, in the block's frame — confirming, by direct calculation, what Experiment 7 and Experiment 9 already showed. Nothing physically changed; it's just a different, equally valid way of describing the same two events."

---

## New Concepts Introduced

1. **The Lorentz transformation**, named and defined in plain language: a rule for converting an event's position and time, as measured in the lab, into the position and time someone in a different, moving frame would measure for that very same event.
2. That each reference frame has its own pair of axes on the same diagram — informally, its own point of view drawn right on the lab's own picture — tilted relative to the lab's, depending on how fast it's moving.

---

## Relationship to Previous Experiments

- **Experiment 3 (moving clock):** its time dilation factor is reused, by division, inside the Lorentz transformation — no new symbol, no duplicated formula.
- **Experiment 6 (length contraction):** the block's rest length (`REST_LENGTH`) is what the transformed `backEvent`/`frontEvent` positions should reduce to (±half of it) when checked against the block's own worldlines — see Required Physics Tests.
- **Experiment 7 (relativity of simultaneity):** its `rodFrameEventTime` is the exact value the new transformation must reproduce for both events — the central cross-check of this experiment's new physics.
- **Experiment 8 (drawing spacetime) and Experiment 9 (same time, different line):** their diagram and its purple same-moment line are reused unchanged; this experiment adds two more lines to the same picture.

## Relationship to Later Experiments

None approved. A fully calibrated, tick-marked coordinate grid along the new axes (a genuine "read the block's own coordinates directly off the diagram" experience) remains a candidate for a still-later experiment, as does applying a similar treatment to the Experiment 3/4 moving-clock diagram (per Experiment 8's own Decision 4). After this experiment, "Relativity of Time and Motion" is complete, and the project moves to "Gravity and Curved Spacetime."

---

## Required Physics Tests

### `lorentzTransform` (new physics — tested rigorously)

1. At `v = 0`: the transformation is the identity, for arbitrary test events.
2. **Interval invariance**, for arbitrary test events and speeds: `time'² − position'²` equals `time² − position²` — the fundamental correctness check of any valid Lorentz transformation.
3. **Cross-check against Experiment 7**: transforming `backEvent` and `frontEvent` (from `spacetimeDiagramFor(runSimultaneityExperiment(v))`) gives equal transformed times for both, and that time equals Experiment 7's own `rodFrameEventTime` exactly, for every tested speed.
4. **Cross-check against Experiment 6**: transforming the block's own back and front worldline endpoints gives a constant transformed position at each end (the block doesn't move in its own frame), equal to `∓REST_LENGTH / 2`.
5. Deterministic across repeated calls.

### `rodTimeAxisFor` / `rodSpaceAxisFor` (pure geometry)

6. Both pass through the origin, for every tested speed including `v = 0`.
7. `rodTimeAxisFor`'s slope (position-over-time) equals the block's own worldline slope (`v`) exactly.
8. `rodSpaceAxisFor`'s slope (time-over-position) equals `v` exactly — the same slope as Experiment 9's `sameMomentLineFor`, confirmed by direct comparison.
9. Deterministic across repeated calls; independent of any UI or animation state.

---

## AI Tutor Behavior

Follows the pattern of Experiments 3–10: no pre-run step beyond helping with the prediction, each step after the reveal needs a typed answer, plain language throughout.

- **After the transformed numbers are revealed:**
  1. Observation: "Look at the two calculated times in the block's frame. Are they the same, or different?"
  2. Prediction comparison: the learner's predicted outcome beside the actual one.
  3. Conceptual question: "Why do you think the calculation gives the same time for both events in the block's frame, even though the lab clock said they happened at different times?"
  4. Explanation, tied to what's on screen: (1) the calculation confirms exactly what Experiments 7 and 9 already showed — not a new physical fact, but a new, more precise way of confirming it; (2) the two new tilted lines are the block's own version of "straight up" (time) and "straight across" (space) — its own natural axes, the same way the lab's vertical and horizontal lines are the lab's; (3) nothing physical changed — same two events, same block, just described using the block's own ruler-and-clock convention instead of the lab's; (4) this ties the whole sequence together: Experiment 7 gave numbers, Experiment 8 made a picture, Experiment 9 added one line, and this calculation is the actual bridge connecting the lab's numbers to the block's own.
  - The tutor must not introduce γ by name, a calibrated coordinate grid, or general relativity; those are outside this specification.

---

## Decisions Needing Human Review

Resolved by the project owner during Stage 1/2 of this proposal (see `CLAUDE.md` §23):

1. **Visual/mathematical depth — resolved.** Two plain tilted axis lines through the origin, plus a results table with the two events' numeric block-frame coordinates. No calibrated tick-marked grid (deferred as a later candidate).
2. **γ vs. reused time dilation factor — resolved.** No new symbol introduced; the transformation reuses Experiment 3's existing time dilation factor by division.
3. **Title — resolved.** "The Block's Own Axes."

4. **Keep Experiment 9's purple same-moment line — resolved.** It stays on screen alongside the two new axes, showing for free that it is parallel to the new block-space-axis (same slope `v`, different position — both represent "the block's now," at different moments).
5. **The `movingClockExperiment.ts` refactor — resolved.** Extracting the `√(1 − v²)` formula into a small, additional exported helper (reused by both the existing `runMovingClockExperiment` and the new Lorentz transform) is approved. Experiment 3's own behavior, results, and tests remain unaffected.

### Implementation notes (tutor)

- **Simple math (added 2026-09-26, at the owner's request, per `CLAUDE.md` §15).** A "Working the numbers" paragraph was inserted into step 1, after the sentence stating this is a third, independent confirmation. It shows the Lorentz transformation's time formula in plain notation (`time' = (1 ÷ time dilation factor) × (time − v × position)`, reusing "time dilation factor" rather than naming γ, per Decision 2 above), then substitutes the learner's own run's numbers for both `backEvent` and `frontEvent`, showing both arrive at the same transformed time. No daily-life example was added, since there is no everyday analogue for converting an event's coordinates between frames with this specific formula. `velocity`, `timeDilationFactor` (via the existing `timeDilationFactorFor` helper), and the lab-frame `backEvent`/`frontEvent` were added to `Experiment11Tutor`'s props to support this.

---

## Success Criteria

1. The Lorentz transformation is tested rigorously on its own terms (interval invariance) and cross-checked directly against Experiments 6 and 7's already-established, approved results — not merely internally self-consistent.
2. The two new axis lines are pure geometry, derived from data `spacetimeDiagramFor` already computes, with no independently duplicated formula.
3. The learner predicts before seeing the transformed result; the reveal control requires a prediction.
4. The results make visible, via direct calculation, that the two events are simultaneous in the block's frame — the same fact Experiments 7 and 9 already established by other means.
5. The learner can describe, in their own words, what the Lorentz transformation does and why applying it here confirms rather than changes what was already known.
6. No γ by name, no calibrated coordinate grid, and no general relativity is introduced.

## Audit Update (2026-11-11)

Built to `docs/audit/relativity-of-time-and-motion/11-draft-wording.md` (approved by the owner on 2026-11-11, "all defaults" to the eighteen questions in `11-gap-report.md`, with the owner's reworded "A frame's own axes" paragraph and prediction question, and the added links recorded in the draft). This section records what the page now does; where it differs from the text above, this section wins. The physics (the Lorentz transformation, the two axis lines, the 0.9c cap) is unchanged.

**What the page now does**
- **The page in four Parts.** Part 1 (amber): one guess ("Same time" or "Different times"), **Run** (replacing CALCULATE), and the spacetime diagram, fixed at 0.5c. Part 2 (pink): the speed (0.1c, 0.3c, 0.5c, 0.8c, the 0c baseline and "Other" from 0.01c to 0.9c) and a diagram that follows it, with "Runs so far". Part 3 (teal): the results. Part 4 (blue): the tutor. The introduction, the "Want to know more?" list and a collapsed "Words and formulas" box sit above Part 1. Parts 2 to 4 appear when the Part 1 drawing has finished, and `onComplete` fires then.
- **Run with a drawing.** The diagram of "Same time, different line" draws itself on a dark ground with ticks and labels. When it ends, the green same-moment line and **the block's own two axes in orange** (a solid time axis and a dashed space axis, no ticks, lighter orange) appear; the lab's level line is not drawn here.
- **New panel "The two events on two sets of clocks".** Two rows on one time scale: the lab's clocks and the block's own clocks (from the Lorentz transformation). The guess is a **white marker of two ticks** in a YOUR GUESS box, level for "same time" or apart at an example gap for "different times". The caption says the gap is only an example and that the marker moves no real value. It appears with the orange axes, never earlier.
- **A new introduction sketch** ("What a frame's own axes are", `Experiment11Sketch.tsx`), with an example 0.25c frame, plus a paragraph explaining event, position, time, axis and frame, and chapter titles in place of numbers.
- **Results.** The two events on the lab's clocks and on the block's own clocks, a note under each block, a **check-up table** that sets the transformation's results beside numbers worked out earlier ("At the same time... for whom?" and "Does motion change length?"), each reading "the same", "more" or "less". No "It is actually..." line. The guess is shown as a tag.
- **Start over, not Change prediction.** "Start over" is always visible and greyed until there is something to clear and while a drawing plays; the guess is locked after Run.
- **Tutor.** The four steps (observe, compare, conceptual, explanation) are kept. Observe and compare name the white marker and the two rows; the explanation marks the guess with no score, and step 1 now says the learner already knew the result. The "working the numbers" paragraph is kept, with its numbers from the module.
- **Words and formulas** (collapsed): event, position, time, axis, time axis, space axis, frame, origin, light-second, c, time dilation factor, simultaneous, and the Lorentz transformation's time and position formulas with a worked example at 0.6c on an event that is not one of the flash events, so the 0.5c answer is withheld until after the run.
- **Where the real picture comes from** is written under the diagram and panel: nothing measured; every number calculated here; nothing imagined except the example tick gap.
- **Physics module** (tested): in `src/physics/lorentzTransform.ts`, added `blockFrameEventsFor` (replaces the component's fixed `actualTimeOutcome`), `clockRowsFor` (with `PART1_CLOCKS_SCALE_END`, `PART2_CLOCKS_SCALE_END`), `timeGuessMarkerFor`, `markTimeGuess`, `lorentzWorkedNumbers`, `checkUpRowsFor` and `axesSketchFor`; in `src/physics/spacetimeDiagramView.ts`, added `rodSpaceAxisExtended`. `lorentzTransform` itself is unchanged. `lorentzTransform.test.ts` has 18 tests (3 original plus 15 new). `Experiment11.test.tsx` has 15 render tests. The full suite was reported at 2738 tests, with `tsc` and the build passing (`docs/audit/PROGRESS.md`; not re-run when this section was written). Components: `Experiment11.tsx`, `Experiment11Pictures.tsx`, `Experiment11Sketch.tsx`, `Experiment11Tutor.tsx`; the diagram in `Experiment8Pictures.tsx` gained a `blockAxes` option.
- **Naming.** Commit `f57a24c` replaced "rod" with "block" on the page, tutor, summary, sidebar title and specification (see the naming note at the top). The file and code names `11-rods-own-axes.md`, `rodTimeAxisFor` and similar are kept.

**Links** (checked 2026-11-11 through helper agents, who read the text but not the pictures; the owner was asked to open the pages once). All seven are shown from the start, none gives away the 0.5c result: Einstein Online, "Lorentz transformation" (glossary), "Elementary Tour, part 5: Spacetime", "The definition of 'now'" (fetched 2026-11-10), "From light clocks to time dilation" and "Elementary Tour, part 3: The relativity of space and time" (Max Planck Institute for Gravitational Physics); and two John Norton pages (University of Pittsburgh, "Einstein for Everyone"), which are course chapters, not official outreach pages. Short link blocks are repeated at the bottom of Parts 2, 3 and 4 (an approved departure from "all links above Part 1"); Part 1 has none. **Gaps recorded (§29 rule 3(c)):** no plain official page found for a spacetime diagram's tilted axes or the Lorentz transformation from NASA, ESA, CERN, Fermilab, NIST or LIGO (a Perimeter Institute page and the arXiv paper "Relativity on Rotated Graph Paper" were seen only as titles and not fetched); none for the light-second; none for a table of the time dilation factor against speed (a UNSW module was not linked); **Einstein's 1905 paper and Lorentz's 1904 paper are not linked, a gap recorded by the owner's "all defaults"**; the experiment has no real result of its own. **Owner action:** open the Einstein Online "Elementary Tour, part 5: Spacetime" page once (https://www.einstein-online.info/en/spacetime/).

**Facts that may change.** The link addresses and the pages' contents (Einstein Online and the Pittsburgh course pages have no fixed edition); the pages' dates were not all shown. No physical figure on this page is a measured result that could change; every number comes from the specification's formulas.

**Open / not checked**
- The results, the check-up table and the tutor were not viewed in a browser; only the sketch, the Part 1 diagram and panel, and the Part 2 panel were viewed in Chrome (label and tick fixes were made after viewing).
- Narrow widths, other browsers, keyboard use and a real learner were not checked.
- The helpers' summaries of the Einstein Online and Norton pages were not compared with the pages; the owner has not yet opened them.
- Einstein 1905 and Lorentz 1904 remain unlinked gaps.
