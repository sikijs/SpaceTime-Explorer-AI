# Gravitational Waves — Experiment 6: Triangulation (Finding Where a Signal Came From)

**Status: implemented. Physics model, physics tests, interface, prediction interaction, results panel, and AI tutor are built and wired into the guided journey. It has had two complete-flow tests and two final reviews against this specification, `docs/PROJECT.md`, and `AGENTS.md` (`CLAUDE.md` §21 Step 10), the second following a caption fix and a GW170817-reference gap found and fixed in that second review — see "Implementation Notes" for details. The owner's full line-by-line wording approval (`CLAUDE.md` §28.1) is not yet done, except for the "How to read this diagram" wedge-overlap paragraph, approved as written (2026-10-05).**

This specification was drafted in direct response to a thread left open twice before: when Experiment 3 of this chapter was proposed, the owner considered and declined combining it with triangulation, to keep that experiment to one idea; and Experiment 4 introduced multi-messenger follow-up (GW170817) without explaining how a signal's sky position is actually found in the first place.

---

## Overview

Experiments 1–5 modeled a single detector only. None of them asked a question real gravitational-wave astronomy depends on: *where in the sky did this signal come from?*

This experiment introduces one new, self-contained idea: because a gravitational wave travels at the same finite, fixed speed already established as invariant (`c`, Relativity of Time and Motion, Experiment 5), and because real detectors sit far apart on Earth, the same wave reaches each detector at a very slightly different time. Comparing those tiny arrival-time differences across a network of detectors — the same reasoning a person uses to tell which direction a sound came from because it reaches one ear before the other — is how real gravitational-wave astronomy narrows down a signal's direction.

No chirp, strain, or energy-loss physics is touched. This experiment is entirely about *when* an already-arriving wave reaches each detector, not what the wave looks like when it does.

---

## Learning Objective

After this experiment, the learner should understand:

1. A detector only tells you a signal arrived — not where it came from.
2. Because the wave travels at a fixed, finite speed, and real detectors are far apart, the signal reaches the nearer detector first and the farther ones slightly later.
3. The pattern of arrival-time differences across three or more detectors narrows down the direction the wave came from — this is triangulation.
4. This is why real discoveries like GW170817 (already named in Experiment 4) could be followed up by telescopes: the detector network's timing pattern pointed astronomers toward the right patch of sky.

---

## Physical Situation

Three real gravitational-wave detectors — LIGO Hanford (H1), LIGO Livingston (L1), and Virgo (V1) — shown on a simple flat schematic diagram (not a real map; positions are illustrative, loosely preserving their real relative separations). A gravitational wave sweeps across them as a flat wavefront, arriving from one of a few preset directions chosen by the learner.

### Simplifying assumptions (must be stated to the learner, in plain language)

- The wave is treated as a flat front traveling in a straight line at exactly `c`, arriving from one fixed direction — not a real 3D geometry on a curved Earth.
- The three detectors are shown on a flat, schematic diagram at illustrative positions, not a real map or real 3D coordinates. Real approximate separations are used only to compute believable millisecond-scale delays (Hanford–Livingston ≈ 3,000 km; Hanford–Virgo ≈ 8,700 km; Livingston–Virgo ≈ 7,500 km).
- Only arrival *timing* is modeled — not signal strength, detector orientation sensitivity, or noise. A real detector's sensitivity to a wave also depends on direction and polarization; this experiment ignores that entirely.
- The sky-narrowing picture shown for each direction (two illustrative arcs) is a fixed diagram per preset, not a computed geometric intersection — it is included to build intuition for *why* three detectors narrow things down further than two, not to compute an exact sky position.

### Not introduced

Real 3D Earth geometry, detector antenna-pattern sensitivity, noise/false-alarm statistics, an exact computed sky-localization region, and any change to the chirp/strain/energy physics of Experiments 1–5 — all out of scope, consistent with keeping this experiment to one new idea (`CLAUDE.md` §16).

---

## Physics Model

New, self-contained, and independent of every other experiment's physics (`CLAUDE.md` §9):

```typescript
// src/physics/gravitationalWaveTriangulationExperiment.ts

export interface DetectorPosition {
  name: string // 'Hanford' | 'Livingston' | 'Virgo'
  x: number // km, schematic flat-plane coordinates
  y: number // km
}

export const SPEED_OF_LIGHT_KM_PER_S = 299_792 // reuses the same real constant already
  // used in src/physics/blackHoleExperiment.ts and lightBendingExperiment.ts, restated
  // here in km/s to match this experiment's distance unit

export const DETECTORS: DetectorPosition[] // three fixed schematic positions, chosen so that
  // pairwise straight-line distances approximate the real separations stated above

export interface DirectionPreset {
  label: string
  directionDegrees: number // angle, schematic plane, the direction the wave travels FROM
}

export const DIRECTION_PRESETS: DirectionPreset[] // three presets, chosen so each produces
  // a different full arrival order across the three detectors

// Time at which the wavefront reaches a given detector, relative to the detector array's
// centroid (t = 0 at the centroid). A detector further toward the incoming direction is
// reached earlier (a negative delay); one further away is reached later (a positive delay).
export function arrivalTimeSeconds(
  detector: DetectorPosition,
  directionDegrees: number,
): number

// Convenience: arrival times for all three fixed detectors under one direction preset,
// sorted earliest to latest.
export function arrivalOrderFor(
  directionDegrees: number,
): Array<{ detector: DetectorPosition; arrivalTimeSeconds: number }>
```

`arrivalTimeSeconds` is the only physics formula introduced: the standard plane-wave arrival-time relationship, `-(detectorPosition · directionVector) / c`, where `directionVector` is the unit vector pointing from the array's centroid toward the incoming wave's origin. No existing experiment's physics is modified or recomputed.

Structured independently of the UI, per `CLAUDE.md` §9 — a pure function of detector position and direction, testable with no browser.

---

## Learner Controls

- **Direction**, a choice of three labeled presets (e.g. "Direction A," "Direction B," "Direction C," each shown as an arrow on the schematic diagram pointing toward where the wave is coming from). Not a continuous angle control, to keep the geometry legible, per the owner's confirmed decision to use a simple schematic.
- **Run**, plays the wavefront sweeping across the schematic from the chosen direction, arriving at each detector in turn with a visible, labeled pulse.
- No mass, chirp, or strain controls — this experiment reuses none of that physics.

---

## Prediction Activity

Before the control and results are shown, the learner is asked two questions in sequence, for their chosen direction:

1. "Which detector do you think the wave will reach first?" (Hanford / Livingston / Virgo)
2. "Do you think the three detectors will all register the wave at essentially the same instant, or at measurably different times?" (Essentially the same instant / Measurably different times)

Choices are not scored. The control is disabled until both predictions are entered, consistent with the rest of the project.

---

## Experiment Behavior

### Display

- The schematic diagram: three labeled detector points and an arrow showing the chosen incoming direction.
- "Run" animates the wavefront (a simple expanding or sweeping line) crossing the diagram, triggering a labeled pulse at each detector at its computed arrival time.
- A millisecond-scale timeline or readout listing each detector's arrival time relative to the first one to receive it (e.g., "Hanford: 0.0 ms (first) · Livingston: 6.4 ms later · Virgo: 11.2 ms later").

### Results

States the chosen direction, the actual arrival order and the measured time gaps, and compares both of the learner's predictions (first detector, and same-instant-vs-different) to what actually happened. Then shows the sky-narrowing illustration: two arcs (one per detector pair) consistent with the measured gaps, explicitly labeled as an illustrative diagram, not a computed position — stating in plain language that a real detector network uses exactly this kind of timing comparison, across three or more detectors, to narrow a real signal's sky position, which is how events like GW170817 (Experiment 4) could be matched to a location telescopes could point at.

### Introductory text

To be drafted during implementation, covering: the question (can one detector alone tell you where a signal came from?), what happens, the learner's job (both predictions), what to look for, and the assumptions above — subject to the owner's line-by-line wording review per `CLAUDE.md` §28.1.

---

## AI Tutor Behavior

Follows the predict → observe → explain pattern of the prior experiments:

- **Before results:** helps the learner form both predictions; does not reveal the answer.
- **After "Run" completes:**
  1. Observation: "What did you notice about the order and timing of the three pulses?"
  2. Prediction comparison: the learner's two predicted answers beside what actually happened.
  3. Conceptual question: "If you only had one detector, could you have known which direction the wave came from? What does having three give you that one doesn't?"
  4. Explanation: (1) a single detector can tell you a wave arrived, but not which direction it came from; (2) because the wave travels at a fixed, finite speed (`c`, already established in the Relativity chapter) and the detectors are far apart, the arrival-time differences carry directional information, the same way arrival-time differences between your two ears tell you which direction a sound came from; (3) comparing the gaps across pairs of detectors narrows the possible sky region, and a third detector narrows it further than two alone could; (4) this is how real discoveries like GW170817 were matched to a specific patch of sky that telescopes could then point at and observe the matching light (Experiment 4).

---

## Required Physics Tests

1. `arrivalTimeSeconds` returns `0` for a detector placed exactly at the array's centroid, for any direction (sanity check on the reference point).
2. For a direction aligned exactly along the line between two detectors, the arrival-time difference between that pair equals their straight-line separation divided by `c`, to within floating-point tolerance (the maximum-delay case).
3. For a direction perpendicular to the line between two detectors, their arrival-time difference is `0` (the simultaneous case for that pair).
4. `arrivalOrderFor` returns a different full ordering of the three detectors for each of the three `DIRECTION_PRESETS` (confirms the presets were chosen to be genuinely distinguishable, the premise the prediction activity depends on).
5. No arrival-time gap between any two detectors ever exceeds their straight-line separation divided by `c` (a wave cannot arrive at one detector before it could physically have traveled from the other, for any direction).

---

## Decisions Confirmed

Confirmed by the owner in conversation on 2026-10-04:

1. **Three detectors** (Hanford, Livingston, Virgo), not two — closer to the real GW170817 case already named in Experiment 4, and needed to show the sky-narrowing payoff of a third detector.
2. **A simple schematic diagram**, not a real Earth map, consistent with every prior experiment's abstracted visual style.
3. **The sky-narrowing illustration is included** (two illustrative arcs per direction), not omitted, as the payoff of using three detectors instead of two.
4. **Title accepted as proposed:** "Triangulation: Finding Where a Signal Came From."

---

## Decisions Needing Human Review

None open. All four items were confirmed in conversation on 2026-10-04, and the specification as a whole was then approved as written. Exact numeric constants not called out above (the three direction-preset angles, the schematic detector coordinates, the animation's playback timing) are left to implementation judgment, following this project's existing conventions for similar presentational constants in prior experiments.

---

## Success Criteria

1. No existing experiment's physics (chirp, strain, energy loss, Doppler, or `c`'s value itself) is modified or recomputed; this experiment's only new formula is the arrival-time relationship above.
2. The learner makes both predictions before the control and results are shown.
3. The three direction presets produce visibly different, clearly labeled arrival orders and gaps when run.
4. The Results panel compares both of the learner's predictions to what actually happened.
5. The sky-narrowing illustration is clearly labeled as illustrative, not a precisely computed position, consistent with `CLAUDE.md` §9 (a visualization must never imply a physical effect, or a precision, that is not actually part of the underlying model).
6. The learner can, after the tutor conversation, state in their own words why a single detector cannot reveal a signal's direction, and why comparing arrival times across several detectors can.
7. The introduction and results panel both tie this experiment back to Experiment 4's GW170817 multi-messenger example, without restating or recomputing that experiment's own physics.

---

## Implementation Notes

Per `CLAUDE.md` §21/§23 Stage 5 and §6 (one step at a time), the physics model has been implemented (`src/physics/gravitationalWaveTriangulationExperiment.ts`): `DetectorPosition`, `DETECTORS` (three schematic positions whose pairwise straight-line separations approximate the real ones — Hanford-Livingston ≈3,002 km, Hanford-Virgo ≈8,700 km, Livingston-Virgo ≈7,500 km), `DirectionPreset`, `DIRECTION_PRESETS` (three presets at 0°, 250°, 280°), `arrivalTimeSeconds`, and `arrivalOrderFor`. The real speed of light is named `REAL_SPEED_OF_LIGHT_KM_PER_S` (the draft's `SPEED_OF_LIGHT_KM_PER_S` was renamed to match this project's existing `REAL_SPEED_OF_LIGHT` naming convention from `gpsTimeDilationExperiment.ts`, an implementation-judgment naming choice, not a physics change).

`tsc --noEmit` is clean. The three direction presets were spot-checked outside the test suite: they produce three distinct full arrival orders, each with a different detector reached first (Virgo/Livingston/Hanford at 0°; Hanford/Livingston/Virgo at 250°; Livingston/Hanford/Virgo at 280°), with delays in the realistic millisecond range (max ≈28 ms, consistent with the Hanford-Virgo separation) — confirming the premise the prediction activity depends on (Required Physics Test 4). Physics tests are now written and passing (`src/physics/gravitationalWaveTriangulationExperiment.test.ts`), covering all 5 items from "Required Physics Tests": arrival time is 0 at the array centroid for any direction; a detector pair aligned exactly with the chosen direction has an arrival-time gap of exactly its separation / c (checked for Hanford-Livingston at 0°); a perpendicular pair has a gap of exactly 0 (checked for the same pair at 90°); the three `DIRECTION_PRESETS` give three distinct full arrival orders; and no pair's arrival-time gap, sampled across 24 directions spanning the full circle, ever exceeds its separation / c. Full suite (294/294) and `tsc --noEmit` are clean.

Basic UI is also built (`src/components/GravitationalWaveTriangulationExperiment.tsx`): the three direction presets as toggle buttons, an SVG schematic drawing the three detectors and an arrow for the chosen incoming direction, "Run" (animates each detector flashing at its computed arrival time, visually exaggerated per the specification's assumptions, driven directly by `arrivalOrderFor`), and an "Arrival order" readout listing each detector's real arrival-time gap in milliseconds. Wired into the guided journey (`src/App.tsx`, as "Triangulation" under the "Gravitational Waves" group, with the prior experiment's "next" text updated to point to it); a draft introduction (question, what happens, what to look for, assumptions) is included, not yet given the owner's line-by-line review per `CLAUDE.md` §28.1. This step deliberately has no prediction gating, results panel, or tutor yet.

Verified in a browser (`npx vite`, `http://localhost:5183/`): Direction A correctly flashes Virgo first (0.00 ms), then Livingston (5.80 ms), then Hanford (15.81 ms); Direction B correctly flashes Hanford first (0.00 ms), then Livingston (3.42 ms), then Virgo (28.27 ms) — both match the physics tests' hand-verified orderings, and the arrow and readout update correctly when switching presets. `onComplete` fires correctly (the sidebar shows a checkmark on "6. Triangulation" after one run). No console errors. Full suite (294/294) and `tsc --noEmit` remain clean.

The learner prediction interaction is also built: both required questions (per "Prediction Activity") gate the direction presets and Run button until answered, matching the project's established pattern — predictions lock in on first "Run" and a "Change predictions" control reopens both without resetting the chosen direction. Verified in a browser: direction presets and Run are disabled before both questions are answered (clicking a disabled preset has no effect); answering both unlocks them; running locks both predictions in and shows "Your predictions are locked in above..."; "Change predictions" correctly reopens both questions, resets the diagram's flashed state, and preserves the chosen direction (Direction A before and after). No console errors. Full suite (294/294) and `tsc --noEmit` clean.

The Results panel is also built, per the specification's "Results" section: states the chosen direction, the actual arrival order with each gap in milliseconds, compares both submitted predictions (first detector; same-instant vs. measurably-different) to the actual outcome, and closes with the required real-world-grounding paragraph tying the comparison back to GW170817 (Experiment 4). The two "sky-narrowing" arcs are drawn on the diagram only once the run completes, each centered near the chosen direction but deliberately offset from it and from each other (not derived from the actual timing geometry), and the paragraph beneath them explicitly calls them "an illustration, not a computed position" per `CLAUDE.md` §9. Verified in a browser with a deliberately wrong pair of predictions (predicted "Hanford" first and "essentially the same instant" for Direction C): the Results panel correctly showed Livingston arriving first (0.00 ms), then Hanford (1.74 ms), then Virgo (22.96 ms), correctly flagged the first-detector prediction as "off this time," and correctly flagged the timing prediction as "not what you predicted" against the measured 22.96 ms spread. Both arcs rendered on the diagram. No console errors. Full suite (294/294) and `tsc --noEmit` clean.

The AI tutor is also built (`src/components/GravitationalWaveTriangulationTutor.tsx`), following the predict → observe → explain pattern of the prior experiments exactly as specified: an observation question, a prediction-comparison step (restating both submitted predictions against the actual first detector and measured max gap), a conceptual question, then the four-point explanation from "AI Tutor Behavior" (a single detector carries no directional information; the arrival-time differences carry directional information via the invariant `c`, with the two-ears-and-a-sound analogy; comparing gaps across pairs narrows the sky region, referencing the diagram's own illustrative arcs; and the GW170817/Experiment 4 real-world tie-in). Wired with `onExplained`/`onTutorComplete` and a `key={runCount}` reset exactly as the Redshift experiment's tutor is. Verified in a browser: completed all three reflection steps after a Direction A run with both predictions correct (Virgo first, measurably different times); each step showed the correct, prediction-specific text; the four-point explanation displayed correctly; and the App-level "What you learned"/"What's next" chapter summary appeared immediately after, confirming `onTutorComplete` fires correctly. No console errors. Full suite (294/294) and `tsc --noEmit` clean.

After the AI tutor was built, the owner tried the experiment in a browser and reported the diagram was hard to understand: no labels on the two arcs, no explanation of what they represented, and confusion about why only two arcs appear when there are three detectors (and so three possible pairs); the owner also asked whether the animation could be slowed down so the flashes and arcs could be watched developing rather than appearing instantly. Addressed: `VISUAL_DURATION_MS` (the pulse-flash playback length) was increased from 2400ms to 5000ms; the two arcs now sweep into view over a new 1800ms reveal animation (`ARC_REVEAL_DURATION_MS`, a second `requestAnimationFrame` loop keyed on `runCount` so it replays on every run) instead of appearing all at once, with on-canvas labels ("pair 1 (illustrative)", "pair 2 (illustrative)") shown once the sweep finishes; and a persistent "How to read this diagram" caption was added below the diagram (visible even before the first run) explaining the detector dots, the arrow, and explicitly naming why only two of the three possible pairs (Hanford–Livingston, Hanford–Virgo, Livingston–Virgo) are drawn — to keep the picture simple, noting a real localization effort would use all three. A real wording bug was also found and fixed while addressing this: the introduction's assumption bullet said the animation "is sped up," which was backwards (a millisecond-scale real event is being slowed down, not sped up, to become watchable); corrected to "slowed way down." The Results panel's own arc-explanation paragraph was trimmed since the persistent caption now covers it, avoiding duplication. Verified in a browser: the caption renders before any run; after running, both arcs sweep in visibly over the diagram and are correctly labeled; the Results panel reads correctly with no duplicated explanation. No console errors. Full suite (294/294) and `tsc --noEmit` clean.

The owner then reported still not understanding the two dashed curves even after the labels and caption above, asking for a simpler, more detailed explanation and "what are these lines, by the way." Re-examining the design: thin dashed-curve fragments, labeled only "pair 1"/"pair 2," don't visually read as "a range of possible directions," which is the actual idea being illustrated (comparing two detectors' timing narrows the source to a range of directions, not one exact direction — the same idea as a timing gap between your two ears only narrowing a sound to "somewhere on your right," not an exact spot). Redesigned: the two thin arcs became two filled, semi-transparent wedges (pie-slice sectors fanning out from the detector array's center, using the same sweep-reveal animation and angular spans as before, just filled rather than outlined), relabeled "possible directions (A)" and "possible directions (B)" instead of the more jargon-y "pair 1"/"pair 2," and the caption was rewritten from one dense paragraph into three short, concrete paragraphs: what the dots and arrow are; what the two wedges mean, anchored in the same ears/sound analogy now given here as well as in the tutor; and why only two of the three possible pairs are shown. A real display bug was found and fixed while verifying this: at some direction angles a wedge's label point landed at or past the SVG view box's edge and was clipped; fixed by giving labels their own fixed, smaller radius (not the wedge's own radius) and clamping the result inside the view box with margin (`clampToViewBox`). Verified in a browser at two different directions (A and C): both wedges render as clearly visible shaded triangles fanning from the center, both labels stay fully inside the diagram and legible, and the Results panel and arrival order remained correct in both cases. No console errors. Full suite (294/294) and `tsc --noEmit` clean.

The owner then reported still not understanding, this time across the board: the underlying principle, the diagram's caption, and the Results panel wording. Asked to narrow it down, the owner confirmed the wedges specifically were not the problem, but three other things were: why timing reveals direction at all, the Results panel's wording, and what the animation itself was showing. This indicated the introduction had never actually grounded the mechanism before asking the learner to use it. Rewritten from the ground up: the introduction now opens with a new "everyday version of this idea" paragraph (three friends in a field, a shout, working out direction from who-heard-it-when-and-by-how-much) before any mention of detectors, then a "What happens here" paragraph mapping detectors onto that analogy, then a new "A quick worked example" paragraph with real numbers (Hanford-Livingston's ~3,000 km separation, light's ~300,000 km/s speed, and the resulting 10 ms maximum gap) per `CLAUDE.md` §15's simple-math/daily-life guidance — addressing "why timing reveals direction" directly, with a concrete calculation rather than an assertion. "What to look for" was rewritten to explicitly tie the flashing order and gaps back to the shout analogy, addressing "what the animation shows." The Results panel was substantially rewritten: it now states what each number *means* ("Hanford registered the wave before the other two... tells us the wave came from somewhat closer to Hanford's side"), explicitly calls out the last-arriving detector as the one farthest from the source's direction (mirroring the friend who heard the shout last), and restructures the two prediction checks as explicit "Checking your first/second prediction" paragraphs instead of terse one-liners. The two previously separate analogies (the shout, and an ears-and-sound comparison in the "How to read this diagram" caption and the tutor's explanation) were unified into the single shout/field analogy throughout the diagram caption and the tutor, so the learner encounters one consistent mental model across the introduction, the diagram, the Results panel, and the tutor, rather than two different analogies for the same idea. Verified in a browser: the new introduction renders correctly; running Direction B with "Hanford" and "measurably different times" produced a Results panel that states the actual arrival order, explains what it means in plain language tied to the shout analogy, and clearly checks both predictions. No console errors. Full suite (294/294) and `tsc --noEmit` clean.

Its complete-flow test (2026-10-04) covered the full learner path in a fresh browser profile (a new origin, so `localStorage` started empty — confirmed no sidebar checkmarks anywhere beforehand): sidebar navigation into the chapter (`Gravitational Waves` expanded, then "6. Triangulation" selected) reached the experiment from a cold start; the full introduction rendered (question, what happens, your job, what to look for, all three assumptions); the direction presets and Run were confirmed disabled before any prediction was entered; answering both predictions (Livingston / measurably different times) correctly unlocked them; selecting Direction B and running produced the correct arrival order (Hanford 0.00 ms, Livingston 3.42 ms, Virgo 28.27 ms) and a Results panel that correctly flagged the first-detector prediction as wrong and the timing prediction as matching; all three tutor reflection steps displayed correctly, the four-point explanation appeared, and the App-level chapter summary and sidebar checkmark appeared immediately after. "Change predictions" was then exercised: it correctly cleared the Results panel and tutor while leaving the already-completed chapter's "What you learned" summary in place (confirming completion persists independently of trying further directions), and re-answering with new predictions (Virgo / essentially the same instant) and running Direction C produced the correct new Results (Livingston first, 22.96 ms max gap, both predictions correctly flagged as wrong) with no stale data from the first run. The tutor's observe and compare steps were confirmed to use the new run's own data (not the prior run's), driven by the `key={runCount}` reset. A further round of interaction (a third run, triggered while re-verifying the tutor's step transitions) exercised selecting a new direction and prediction mid-session, running again, and completing the tutor a third time — this is allowed by design (`CLAUDE.md` precedent: a learner may try as many directions as they like after their first submitted prediction) and completed correctly with internally consistent results (Direction A, Virgo prediction correct) and no console errors or exceptions at any point across all three runs. Full suite (294/294) and `tsc --noEmit` remain clean. No gaps found.

After this, in a separate conversation, the owner questioned the "How to read this diagram" caption directly: if the two wedges' overlap is still a shaded area with angular extent, how does the learner know the one true direction from it? This was a real gap, not just a wording-clarity issue — the caption said the overlap was "roughly where the true direction must be," which reads as if the overlap pins down the direction, when in fact the overlap itself still spans a range of directions (the wedges are illustrative, hand-offset around the known answer, not a computed intersection — see "Simplifying assumptions" above). Fixed, at the owner's explicit direction, by splitting that paragraph and adding a new one stating plainly that the overlap is a *smaller* range, not one exact direction, and that even real detector networks usually only narrow a source to a patch of sky, not a single point.

A second complete-flow test and final review against this specification, `docs/PROJECT.md`, and `AGENTS.md` (`CLAUDE.md` §21 Step 10, 2026-10-05) was then run to confirm the experiment still holds up end to end with that change in place, in a fresh browser profile with `localStorage` cleared: the full flow (cold start → sidebar navigation → introduction → prediction gating → Direction A run → Results panel → all three tutor steps → four-point explanation → chapter summary → sidebar checkmark) was re-verified, with a deliberately mixed prediction (Virgo correct, "essentially the same instant" incorrect against the actual 15.81 ms spread) to re-confirm the Results panel and tutor both report partial-match predictions correctly. `localStorage` confirmed `{"completed":[25],"explained":[25]}` after the run. No console errors (the three `[EXCEPTION]` messages observed were a Chrome-extension messaging artifact unrelated to the app, not app code). One real gap was found against this specification's Success Criterion 7 ("The introduction and results panel both tie this experiment back to Experiment 4's GW170817 multi-messenger example"): the Results panel and the tutor's explanation both already named GW170817, but the introduction never did. Fixed by adding one sentence to the introduction's opening "The question" paragraph, tying the motivating question directly to GW170817 without restating or recomputing Experiment 4's own physics. Re-verified in a browser: renders correctly. Full suite (294/294) and `tsc --noEmit` remain clean. No further gaps found.

The owner's line-by-line wording approval (`CLAUDE.md` §28.1) for this experiment as a whole has not yet been done — only the "How to read this diagram" wedge-overlap paragraph has been explicitly approved, as written, by the owner (2026-10-05).
