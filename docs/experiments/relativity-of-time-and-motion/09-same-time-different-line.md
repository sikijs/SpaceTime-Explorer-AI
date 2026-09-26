# Experiment 9: Same Time, Different Line

**Status: APPROVED by the project owner.** The defaults proposed under "Decisions Needing Human Review" stand unless changed. The title is a working title.

**Implementation: complete.** Physics view function (`sameMomentLineFor` in `src/physics/spacetimeDiagramView.ts`) and its tests, interface (`src/components/Experiment9.tsx`), prediction, full results panel, and tutor (`src/components/Experiment9Tutor.tsx`) are in place, following the design below, and wired into the guided journey (`src/App.tsx`, chapter 9). Complete-flow test done in a browser (prediction → reveal → results → all three tutor steps → chapter summary), re-verified after the wording changes below. The owner's line-by-line wording approval (§28.1) is done (car example, plus the "why" explanation added afterward). Final review against this specification (§21 Step 10) is done: one wording mismatch was found and fixed (the Physics Model section and Required Physics Test 1 described `sameMomentLineFor` as extending the line itself; the implementation instead returns the two points unextended and does the visual extension in the rendering component — the spec text above now reflects that). No other gaps found.

## Overview

Experiment 7 told the learner, in numbers, something surprising: a flash released from the center of a moving rod reaches both ends at the same time for someone riding along with the rod — but not for someone watching from the lab. Experiment 8 turned that whole situation into a single picture (a spacetime diagram) without changing any of the numbers.

Experiment 9 does not introduce a new physical effect, and it does not compute anything new. It adds **one line** to the picture the learner already drew in Experiment 8: a line passing through the same two events the learner already saw, showing what "the same moment" looks like for someone riding with the rod. The learner discovers that this line is tilted, not flat — which is the geometric picture of the exact fact Experiment 7 already gave them in numbers.

This was named as a candidate direction in Experiment 8's own specification (`08-spacetime-diagrams.md`, "Relationship to Later Experiments"): "a version of this diagram that also draws the rod's own frame as tilted axes... is a candidate for a later experiment." Experiment 9 takes the lightest possible version of that idea: no labeled axes, no coordinate letters, no new physics — just the one line, and what it means.

---

## Learning Objective

After this experiment, the learner should understand:

1. "The same moment" is not automatically the same for everyone. It depends on who is doing the watching.
2. On the Experiment 8 diagram, "the same moment for the lab" is any flat, level line (a line straight across the page).
3. "The same moment for someone riding with the rod" is a *different* line on that same page — tilted, not flat.
4. The two events from Experiment 7 (the flash reaching the back end, then the front end) sit on that tilted line. That is the picture of why the rod's own passenger calls them simultaneous, while the lab does not.
5. This is the same fact as Experiment 7, seen a third way: first as two numbers (Experiment 7), then as two points reached by light (Experiment 8), now as one line connecting them (Experiment 9).

---

## Physical Situation

### Reused from Experiments 6, 7, and 8

The same rod (rest length `L0 = 0.5` light-second) moving along its own length at a chosen speed `v`, with a flash released from its exact center — identical setup, no changes. The two events (`backEvent`, `frontEvent`) are exactly the points already computed and drawn by `spacetimeDiagramFor` in Experiment 8 (`src/physics/spacetimeDiagramView.ts`).

### What is new

Only the **display**: one additional line segment, drawn through `backEvent` and `frontEvent`, extended to the edges of the existing diagram.

### Simplifying assumptions (all must be stated to the learner, in plain language)

- Everything is still drawn from the lab's point of view, exactly as in Experiment 8. Only one new line is added; the rod's own frame is still not drawn as a separate set of axes.
- Flat spacetime: no gravity, no acceleration, constant velocity only (same as Experiments 3–8).
- The two events being connected are exactly the ones from Experiment 7 — nothing about them is recalculated.

### Not introduced

The Lorentz transformation, `γ`, numeric primed coordinates (`t′`, `x′`), a second labeled axis or coordinate grid, the term "reference frame axes," light cones as a general concept, and any scenario beyond this same rod-and-flash setup.

---

## Physics Model

No new relativistic calculation. This experiment adds one further, small **view** function that reuses values already computed by Experiment 7's physics and Experiment 8's view layer:

```typescript
function sameMomentLineFor(diagram: SpacetimeDiagramData): [WorldlinePoint, WorldlinePoint]
```

`sameMomentLineFor` takes the already-computed `backEvent` and `frontEvent` from `spacetimeDiagramFor` (`src/physics/spacetimeDiagramView.ts`, itself built from `runSimultaneityExperiment`'s `SimultaneityResult` in `src/physics/relativityOfSimultaneityExperiment.ts`) and returns them unchanged, as the two-point line through them. It performs no relativistic calculation of its own, and no extension either — only a pass-through of two already-known points, matching the pattern already established by `spacetimeDiagramFor` itself. Extending that line visually to the diagram's edges is a rendering concern, not a physics one (`AGENTS.md`, "Separation of Responsibilities"); it is done in `src/components/Experiment9.tsx`, using the slope implied by these same two points — no independent formula, no relativistic quantity computed there either.

This line is a line of *simultaneity*, not the path of a moving object, so its natural slope is time-over-position rather than the position-over-time slope used for a worldline. That time-over-position slope always equals the rod's velocity `v` (in units where `c = 1`) is not assumed; it follows algebraically from the already-approved Experiment 7 physics (`backEventLabTime = halfLength / (c + v)`, `frontEventLabTime = halfLength / (c − v)`), and is confirmed by a required test below, not introduced as a new physical rule.

---

## Learner Controls

- **Speed of the rod:** same presets and range as Experiments 6–8 — 0c (at rest), 0.1c, 0.3c, 0.5c, 0.8c, or Other from 0.01c to 0.9c.
- No other controls. Same as Experiment 8, the diagram is drawn complete; there is no separate playback speed for this new line (see Experiment 8 Decision 3, reused here).

---

## Prediction Activity

Before the new line is revealed, the learner is shown the plain, already-familiar Experiment 8 diagram for their chosen speed (the two rod worldlines, the two light lines, and the two dots), then asked:

> You already know, from the last chapter, that someone riding along with the rod would say both flashes arrived at exactly the same moment. If we draw a single straight line through those two dots, what do you expect: will that line come out flat, level across the page — or will it come out tilted?

Choices: "Flat, level across the page" / "Tilted". Not scored. START (or the equivalent reveal control) is disabled until a prediction is entered, matching Experiments 1–8.

(No second prediction part is needed — unlike Experiment 7's two-part prediction, there is only one new thing to predict here: the shape of one line.)

---

## Experiment Behavior

### Introductory text (approved by the project owner, `CLAUDE.md` §28.1 — car example, 2026)

Drafted at a true-layman reading level: short sentences, one idea per sentence, always anchored to something the learner has already directly seen in this app, no unexplained terms, and no formal notation. Uses a car analogy (two friends riding together vs. someone watching from the sidewalk) requested by the owner in place of the original, more abstract draft.

> **The question.** Imagine two friends riding together in a car — one sitting in the front seat, one in the back. Something happens at the front of the car. A little later (or maybe at the very same time — that's the question), something else happens at the back. The two friends, riding together, can compare notes and agree on whether those two things happened at the same moment.
>
> Now imagine someone standing still on the sidewalk, watching the car drive past. Would that person necessarily agree with the two friends about which things happened "at the same moment"? It seems like they should — after all, it's the same two events. But it turns out the answer is no, and you've already seen why.
>
> Here's why that can happen. You saw it, back in Experiment 7, with the rod: a flash of light was released from the rod's exact center. In the rod's own frame, the flash has equally far to travel in each direction, so it reaches both ends at the same moment. But the rod is moving — so, as seen from the lab, the back end moves toward the point where the flash started, while the front end moves away from it. That means the flash reaches the back end first, according to the lab's own clocks. Whenever two events happen in different places, and something has to travel between them to connect them, motion can shift how those events line up in time — differently, depending on who's watching.
>
> Someone riding along with the moving rod says the flash reached both ends at exactly the same moment — just like the two friends in the car, comparing notes. Someone standing still in the lab, watching the rod go by, does not agree. This chapter asks: can we actually see that disagreement on the diagram, instead of just being told about it in numbers?
>
> **A line for "the same moment."** Look at the diagram again — the one you built in the last chapter. Any flat, level line drawn straight across it, the kind that doesn't lean up or down at all, connects points that all happen at the same moment, according to the lab. That's what "the same moment" means on this page, for someone standing still and watching, like the person on the sidewalk.
>
> **But the rod is moving, like the car.** The rod isn't standing still — it's moving, just like the car with the two friends inside. Someone riding along with the rod has their own sense of "the same moment," the same way the two friends in the car do. The question this chapter asks is simple: on this same page, what does their "same moment" line actually look like?
>
> **What you're about to do.** We're going to draw one new line — a single straight line through the two dots you already saw. Before we do, make a prediction: will that line be flat, like the lab's "same moment" line? Or will it lean over?
>
> **What we assume.** Everything here is still seen from the lab's side, exactly like the last chapter — we are only adding one new line to a picture you've already seen, nothing else changes.

### Display

The Experiment 8 diagram, unchanged, plus:

- One additional straight line, in a visually distinct color/style (e.g. a solid line in a third color, to avoid confusion with the rod's worldlines or the light's dashed lines), passing through `backEvent` and `frontEvent`, extended to the diagram's edges.
- The line only appears after the learner's prediction is submitted and the diagram is revealed — matching the reveal timing already used for the rest of the diagram in Experiment 8.
- At the `v = 0` preset, this line is flat/horizontal, coinciding visually with "the lab's own same-moment line" — the same baseline check pattern used in Experiment 8.

### Run

Static, like Experiment 8: the full diagram, including the new line, appears at once after the reveal control is pressed. No animation is required for the new line specifically (see Experiment 8 Decision 3); if Experiment 8's existing growth animation is still in place by the time this is implemented, the new line may either appear once the animation completes or animate in the same style — an implementation detail, not a physics decision, to be settled during implementation rather than here.

---

## Results Display

Same values as Experiment 8 (rod length in the lab, both events' lab times), plus:

- The learner's prediction (flat / tilted), shown beside the actual result.
- No new numeric result is introduced — the line's existence is the "result" here, not a new number.

---

## Expected Observations

1. At `v = 0`, the new line is flat, exactly like the lab's own idea of "the same moment" — because at rest, there is no disagreement between the rod's and the lab's sense of "same moment."
2. At `v > 0`, the new line is tilted — never flat — and tilts more as speed increases.
3. The line always passes exactly through the two dots the learner already saw revealed in Experiment 8, at every tested speed.

---

## Expected Learner Understanding

The learner should be able to say: "A line straight across this page shows what the lab calls 'the same moment.' But the two events that are the same moment *for the rod* aren't on a flat line at all — they're on a tilted one. So 'the same moment' really does depend on who's watching. It's not a trick of measurement; it's a real, different line on the same page."

---

## New Concepts Introduced

1. That "the same moment," pictured as a line on a spacetime diagram, can point in a different direction depending on who is doing the watching — without introducing the formal idea of "an observer's own axes," "a reference frame's coordinates," or any named mathematical transformation.

No new vocabulary term is formally introduced in this experiment; the existing words **event**, **worldline**, and **spacetime diagram** (Experiment 8) are sufficient, plus the everyday phrase "the same moment."

---

## Relationship to Previous Experiments

- **Experiment 7:** established, in numbers, that the two events are simultaneous for the rod but not for the lab. This experiment shows that fact as a single line rather than a pair of numbers.
- **Experiment 8:** established the diagram, the two events as points on it, and the idea of a flat line as "the lab's same moment." This experiment adds one more line to that same picture, without changing anything already drawn.

## Relationship to Later Experiments

None approved. A fuller version that labels the rod's own axes formally (its own time direction and its own "same moment" direction as a genuine second coordinate grid, requiring the Lorentz transformation and numeric primed coordinates) remains a candidate for a still-later experiment, not part of this proposal.

---

## Required Physics Tests

1. `sameMomentLineFor` never recomputes a relativistic value; the two points it returns are exactly `backEvent` and `frontEvent` from the `SpacetimeDiagramData` it is given, unextended — no independent formula duplicated. (The visual extension to the diagram's edges happens separately, in the rendering component, not here — see Physics Model above.)
2. At `v = 0`: the line is horizontal (constant time), coinciding with `backEvent.time === frontEvent.time`.
3. For every tested `v > 0` (sweeping the allowed range in 0.01 steps, matching Experiments 6–8's test pattern): the line's time-over-position slope, computed from its two endpoints, equals `v` exactly (in units where `c = 1`).
4. Deterministic across repeated calls; independent of any UI or animation state.

---

## AI Tutor Behavior

Follows the pattern of Experiments 3–8: no pre-run step beyond helping with the prediction, silent during the (static) reveal, each step after needs a typed answer, plain language throughout.

- **After the line is revealed** (approved wording, `CLAUDE.md` §28.1 — car example, matching the introduction):
  1. Observation: "Look at the new purple line. Does it run flat and level, straight across the page — like the sidewalk-watcher's own idea of 'the same moment'? Or does it lean over?"
  2. Prediction comparison: the learner's predicted shape beside the actual one.
  3. Conceptual question: "Think back to the two friends in the car. They agreed their two events happened at the same moment; the person on the sidewalk did not. The rod's two events work the same way. Just from looking at the picture — not from redoing any arithmetic — why do you think the line through those two events isn't flat?"
  4. Explanation, tied to what's on screen and to the car example: (1) a flat line is the sidewalk-watcher's (the lab's) own idea of "the same moment"; (2) the rod, like the car, is moving, so it gets its own line — recapping Experiment 7's own reason why (the back end moves toward the point where the flash started, the front end moves away, so the flash reaches the back first in the lab), which is the same kind of effect that could make the two friends in the car and the sidewalk-watcher disagree — genuinely a different line, not a mistake or a trick of measurement; (3) this is the same fact Experiment 7 already gave as numbers, now just drawn as a line; (4) nothing new happened — the same two events were already there, just connected.
  - The "why" (the back-end/front-end light-travel reasoning) is given twice: once in the introduction, and again recapped in step 4 of the explanation. It is deliberately left out of the observation, prediction-comparison, and conceptual questions (steps 1–3), so the learner still reasons about *why* the line isn't flat before being reminded of the mechanism — preserving the Prediction → Experiment → Observation → Explanation sequence (`CLAUDE.md` §12).
  - The tutor must not introduce the Lorentz transformation, `γ`, primed coordinates, or the phrase "reference frame axes"; those are outside this specification.

---

## Decisions Needing Human Review

Resolved by the project owner during Stage 1/2 of this proposal (see `CLAUDE.md` §23):

1. **Title — resolved.** "Same Time, Different Line," a working title.
2. **Depth/scope — resolved.** Lightest-touch version only: one new line through the two already-known events, no labeled axes, no coordinate notation, no new vocabulary term. A fuller "two labeled axes" version was considered and explicitly declined for this experiment.
3. **Visual style of the new line — resolved.** The implemented solid purple/violet line, distinct from the rod's black worldlines and the light's gold dashed lines, was reviewed in a browser and approved as-is.
4. **Introductory text — resolved (approved).** The car-example draft above (two friends riding together vs. someone on the sidewalk) was requested by the owner in place of the original, more abstract draft, and is approved.
5. **Animation — resolved.** The new line does not animate on its own; it appears once Experiment 8's existing diagram-growth animation completes, matching the "static, like Experiment 8" behavior already in the spec. Confirmed as intentional: an animation of the line being drawn would not convey any additional information (it connects two already-fixed points), so it stays static rather than being decorative.
6. **Tutor dialogue wording — resolved (approved).** The tutor's questions and explanation, quoted under "AI Tutor Behavior" above, were rewritten in the same simpler, car-example style as the introduction and are approved.

---

## Success Criteria

1. The new line is computed entirely from Experiment 7/8's existing physics results (`backEvent`, `frontEvent`), with no independently recomputed relativistic value.
2. The learner predicts before seeing the new line; the reveal control requires a prediction.
3. The diagram makes visible, without any new calculation, that "the same moment" is a different line for the rod than for the lab.
4. Results are shown neutrally, then explained by the tutor after the learner responds.
5. The learner can describe, in their own words, why a flat line and a tilted line can both correctly mean "the same moment" — just for different observers.
6. No formal coordinate notation, no Lorentz transformation, and no new named term is introduced.
