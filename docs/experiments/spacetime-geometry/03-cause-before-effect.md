# Experiment 3 (Spacetime Geometry): Cause Before Effect, Why Order Can Flip but a Cause Never Comes After Its Effect

**Status: APPROVED by the owner on 2026-10-13, with all ten "Decisions Needing Human Review" taken on their defaults.** Proposed by Claude per `CLAUDE.md` §23 Stages 1 to 3 on 2026-10-13. All learner-facing wording below is draft wording for the owner's line-by-line approval (§28.1).

**Group:** "Spacetime Geometry: What Is Real, What Is Seen". Specifications for this group live in `docs/experiments/spacetime-geometry/`. This is the third item of the roadmap in `01-the-interval.md`, which is approved as a direction only.

---

## Overview

Experiment 2 drew a light cone around "here, now" and showed that every observer agrees on which events are inside it, on its edge, or outside it. It deliberately left one thing alone: **the order of events.** Its passing speeds were kept to ±0.5c so that no observer ever found the two events in a different order.

This experiment lifts that limit and asks the question it avoided: **can the order of two events depend on who is measuring? And if it can, what stops a cause from ever coming after its effect?**

The first chapter's Experiment 7 already showed that "at the same time" is not the same for everyone. This experiment goes one step further. For some pairs of events, a fast enough observer finds them in the *opposite order*. For other pairs, no observer ever does. The light cone from Experiment 2 is exactly what separates the two kinds:

- If B is **inside or on** O's light cone, something could have travelled from O to B (Experiment 2). Every observer, whatever their speed, finds O first. O can be the cause of B.
- If B is **outside** O's light cone, nothing could have travelled from O to B. Some observers find B first. This is allowed, because O could not have caused B anyway.

So relativity lets the order of events change exactly where it cannot do any harm to cause and effect. That is the point of the experiment.

The learner chooses one of the five events from Experiment 2 and a passing observer's speed (now up to ±0.9c), predicts whether any observer could find B before O, and runs the experiment. The picture is the "same-moment line" from the first chapter's Experiment 9: for each observer, a line through O showing which events they say happen at the same moment as O. Events above the line are later than O for that observer, and events below it are earlier.

---

## Learning Objective

After this experiment, the learner should understand:

1. Two observers can disagree about which of two events happened first.
2. This happens only when the two events are outside each other's light cone, so that nothing could travel from one to the other.
3. When one event is inside or on the other's light cone, every observer agrees on the order. So if one event could cause the other, every observer agrees the cause came first.
4. The disagreement about order is therefore not a contradiction. It only affects pairs of events that cannot be cause and effect.
5. (A short remark, not a demonstration.) If something could travel faster than light, it could connect two outside-the-cone events, and a fast enough observer would find it arriving before it left. Relativity's speed limit is what keeps cause before effect for everyone.

---

## Physical Situation

### Reused

- Flat spacetime, no gravity, constant velocities (as in the earlier experiments).
- Units: `c = 1`, time in seconds, distance in light-seconds.
- Event O "here, now" at position 0, time 0 in the lab, and the five preset events B from Experiment 2 (`PRESET_EVENTS` in `src/physics/lightCones.ts`).
- `lorentzTransform`, `intervalSquared` and `classifyEventPair`, from the earlier experiments of this group.
- The light cone from Experiment 2, and the tilted "same-moment line" from the first chapter's Experiment 9 (`sameMomentLineFor` in `src/physics/spacetimeDiagramView.ts` is the model for it; see Decision 4).

### What is new

- A **passing observer** now moves at a speed up to ±0.9c. In Experiment 2 the limit was ±0.5c.
- The **order** of O and B for each observer: O first, the same moment, or B first. The order is found from the sign of the time between the events.
- The idea of a **cause** and an **effect**: O is the cause if its effect is B, that is, if something starting at O and never going faster than light could reach B.

### Not introduced

Quantum mechanics and anything else about what "causes" something in general (the experiment only uses "could something travel from one event to the other"), what a fast object looks like, aberration, Doppler shifts, curved spacetime, more than one dimension of space, the past half of the cone as a separate idea (events earlier than O are not chosen), and any demonstration of faster-than-light signals (Decision 5).

---

## Physics Model

All of it is flat-spacetime special relativity, using what the app already has.

### New: a small independent physics module

```typescript
// src/physics/causeBeforeEffect.ts (proposed)
export type EventOrder = 'o-first' | 'same-moment' | 'b-first'

export function eventOrder(a: WorldlinePoint, b: WorldlinePoint): EventOrder
// from the sign of b.time − a.time, with a stated tolerance around zero

export interface OrderReading {
  timeBetween: number        // signed: positive means B is later than O
  distanceBetween: number
  intervalSquared: number
  relation: EventRelation    // from Experiment 2's classifyEventPair
  order: EventOrder
}

export function simultaneitySpeed(event: WorldlinePoint): number | null
// the passing speed at which O and B are at the same moment: t ÷ x, or null if |t ÷ x| >= 1 (reachable or light-only pairs)

export function runCauseBeforeEffectExperiment(event: WorldlinePoint, passingObserverSpeed: number):
  { lab: OrderReading; passing: OrderReading; simultaneitySpeed: number | null; sameMomentLineSlope: number }
```

`runCauseBeforeEffectExperiment` computes no relativistic quantity itself except through `lorentzTransform`, `intervalSquared` and `classifyEventPair`. `sameMomentLineSlope` is the passing observer's same-moment line through O, drawn on the lab's diagram: time over position, equal to `u` (as in the first chapter's Experiment 9).

### The setup, in numbers

The time between O and B, as the passing observer finds it, is `γ × (t − u × x)`, where `γ = 1 ÷ √(1 − u²)` (this is the `lorentzTransform`, not a new formula). For the five presets and seven proposed passing speeds, the passing observer's time between O and B in seconds (the lab's time is the `u = 0` column):

| Event B (`t`, `x`) | −0.9c | −0.6c | −0.3c | 0 | +0.3c | +0.6c | +0.9c |
|---|---|---|---|---|---|---|---|
| 5 s, 3 ls (reachable) | 17.67 | 8.50 | 6.18 | 5.00 | 4.30 | 4.00 | 5.28 |
| 5 s, −4 ls (reachable) | 3.21 | 3.25 | 3.98 | 5.00 | 6.50 | 9.25 | 19.73 |
| 3 s, 3 ls (light only) | 13.08 | 6.00 | 4.09 | 3.00 | 2.20 | 1.50 | 0.69 |
| 3 s, 5 ls (unreachable) | 17.21 | 7.50 | 4.72 | 3.00 | 1.57 | **0.00** | **−3.44** |
| 4 s, −5 ls (unreachable) | **−1.15** | 1.25 | 2.62 | 4.00 | 5.77 | 8.75 | 19.50 |

(Computed by hand from the formula above and checked by a script, to two decimals.) Three things are visible in the table:

- The reachable and light-only events keep a positive time at every speed offered. The light-only event's time shrinks toward zero as the observer's speed approaches the speed of light, but does not reach it for any speed below it.
- The unreachable event `(3 s, 5 ls)` is at exactly the same moment for an observer at +0.6c (`t ÷ x = 3 ÷ 5 = 0.6`), and in the opposite order for an observer at +0.9c.
- The unreachable event `(4 s, −5 ls)` is in the opposite order for an observer at −0.9c, and would be at the same moment at −0.8c (`4 ÷ −5`, not one of the proposed presets).

### Worked example (for the tutor, with real numbers)

For `(3 s, 5 ls)` and a passing observer at +0.9c: `γ = 1 ÷ √(1 − 0.81) = 2.294`. The time between O and B is `2.294 × (3 − 0.9 × 5) = 2.294 × (−1.5) = −3.44` seconds, so B is *before* O. The distance is `2.294 × (5 − 0.9 × 3) = 2.294 × 2.3 = 5.28` light-seconds. Check: `3.44² − 5.28² = 11.8 − 27.9 ≈ −16`, the same interval squared as the lab's `3² − 5² = −16`.

### Sign convention and limits

- Times between events are signed: positive means B is later than O, negative means B is earlier. The learner-facing wording says this plainly.
- `−c < u < c`. Out-of-range values throw `RangeError`. `t > 0` for the event (as in Experiment 2).
- "The same moment" is a floating-point comparison with a stated tolerance (proposed `1e-9`, as in Experiment 2).

---

## Learner Controls

1. **Event B**: the five presets from Experiment 2.
2. **Passing observer's speed**: seven presets (proposed: −0.9, −0.6, −0.3, 0, 0.3, 0.6, 0.9 of `c`; see Decision 3).
3. **Run:** gated on the prediction, as in the earlier experiments.

---

## Prediction Activity

Before running, the learner chooses event B and answers one question. Draft wording:

> **The question.** In the lab, event O happens first, and event B happens `t` seconds later, `x` light-seconds away. Observers who move at different speeds measure different times and distances. Could some observer, moving at some speed below the speed of light, find that B happened *before* O?
>
> (a) Yes, a fast enough observer could find B first. (b) An observer could find them at exactly the same moment, but none could find B first. (c) No, every observer finds O first.

Not scored. The Run button stays disabled until an answer is chosen. The learner is not told which answer is right before running (§12).

Answer (a) is right for the two unreachable events and (c) is right for the other three. Answer (b) is never right: wherever an observer can find the events at the same moment, a slightly faster one finds them in the opposite order. It is included because it is a natural thing to guess.

---

## Experiment Behavior

### Introductory text (wording approved by the owner on 2026-10-14; the verbatim wording is in `src/components/CauseBeforeEffectExperiment.tsx`)

Following the structure of existing introductions (the question, what happens, the learner's job, new terms, assumptions). It must:

- Start from an everyday idea, with no relativity: a flash of light is sent out, and when it reaches a light-sensitive switch, a firecracker goes off. Could anyone, anywhere, find that the firecracker went off before the flash was sent? Everyday experience says no.
- Say that earlier experiments showed that "at the same time" can depend on the observer, which raises the question: can the *order* of events depend on the observer too, and what would that do to cause and effect?
- Define **cause** and **effect** for this experiment's purposes: one event is the cause of another only if something starting at the first could reach the second (Experiment 2). Define what "an observer finds" means: from their own ruler and synchronized clocks, after allowing for the time light takes to reach them, not what they first see.
- Remind the learner of the light cone (Experiment 2) and of the same-moment line (the first chapter's Experiment 9), which it uses.
- State the assumption that nothing travels faster than light, as in Experiment 2.
- Give a worked calculation with real numbers (§15), using numbers that are **not** among the presets and that do not show an order reversal (§12). The worked example above is for the tutor, after the learner has run.

### Display

An animated spacetime diagram, following §14 "Animated Diagrams":

1. **Labeled components on the canvas:** the lab's position and time axes, event O, event B, the light cone (drawn when the run ends, as in Experiment 2), the lab's same-moment line (horizontal) and the passing observer's same-moment line (tilted), and the passing observer (an arrow showing their direction).
2. **A visible contrast.** Two lines through O in two colours, labeled "the lab's same-moment line" and "the passing observer's same-moment line". For each line, B is above it (later than O for that observer) or below it (earlier). Which side of each line B is on is the whole result, so it is shown by the picture and by a label, not by colour alone.
3. **A "How to read this diagram" caption** beneath it, matching earlier experiments. Wording approved by the owner on 2026-10-14; see Implementation Notes for its structure.

### Run

A short playback (proposed about 9 seconds in total, as in Experiment 2; the length only sets how fast the result is shown):

1. **The lab's view.** The lab's horizontal same-moment line sweeps upward from below O. It meets O first, and then B. The events are marked as it meets them ("met first", "met second").
2. **The passing observer's view.** The passing observer's tilted line sweeps upward in the same way, and the events are marked as it meets them. If B is below the tilted line through O, it meets B first.
3. When the run ends, the cone and its regions are drawn (as in Experiment 2) so that the learner can see which region B is in.

Playback speed does not change the result (§11).

---

## Results Display

Shown only when the run ends. Values only, with plain labels (neutral; the explanation comes from the tutor, §12):

- the chosen event B and the passing speed `u`;
- a table with one row for the lab and one for the passing observer: time from O to B (signed, with a note that negative means B was earlier), distance, `time² − distance²`, "Which case" (reachable, light only, unreachable, as in Experiment 2), and "Which happened first" ("O first", "the same moment", "B first");
- the learner's prediction, as a record (not marked right or wrong).

A drawing in the style of Experiment 2's results shows the two observers' times as bars on one scale (a bar to the right for later, to the left for earlier), so that a "B first" result is a bar pointing the other way.

---

## Expected Observations

- For each preset, the lab's numbers match the table in "Physics Model". O is first in the lab.
- For the three reachable and light-only events, every passing speed offered gives "O first". The case is the same for every observer.
- For the two unreachable events, some passing speeds give "O first", one gives "the same moment" (`(3 s, 5 ls)` at +0.6c), and some give "B first" (`(3 s, 5 ls)` at +0.9c, `(4 s, −5 ls)` at −0.9c). The case is still "unreachable" for every observer.
- The sign of `time² − distance²` is the same for both observers in every case (as in Experiment 2).

---

## Expected Learner Understanding

The learner should be able to say that the order of two events can differ between observers only if the events are outside each other's light cone, that for events inside or on the cone every observer agrees on the order, and that this means a cause is never found after its effect by any observer. They need not yet be able to say why the order flips.

---

## New Concepts Introduced

**Cause and effect** (as used in this experiment: could something starting at one event reach the other). The same-moment line and the light cone are reused. The standard word for "the order of events that cannot be cause and effect" is not needed.

---

## Relationship to Previous Experiments

- This group's Experiment 1: the interval is the same for every observer. Here it still is, and the learner sees the times and distances change while the case does not.
- This group's Experiment 2: the light cone, and the three cases. Here its edges decide whether order can flip. Its limit of ±0.5c was chosen in its Decision 6 to avoid this experiment.
- The first chapter's Experiment 7: the order and simultaneity of events can depend on the observer (the rod). This experiment shows exactly which pairs of events can have the order change.
- The first chapter's Experiment 9: the tilted same-moment line, reused here.
- The first chapter's Experiment 5: light's speed is a limit, used as the assumption.

---

## Relationship to Later Experiments

The next roadmap experiments, "what you see is the past", aberration and Doppler shifts, use the cone's *past* half: what an observer sees now left an event earlier, on their past cone. The order of events found here is what is *measured*, not what is *seen*, and the later experiments rely on the learner keeping those two apart.

---

## Required Physics Tests

Tests verify the physics, not just that functions exist (§10). All are for `src/physics/causeBeforeEffect.ts`.

1. `eventOrder` is `o-first`, `same-moment` and `b-first` for hand-calculated cases, including the two cells of the table (`(3 s, 5 ls)` at +0.6c and +0.9c) and the worked example.
2. For the three reachable and light-only presets, at every passing speed in a spread across `−0.999` to `0.999`, the passing observer's order is `o-first` (the time between is positive).
3. For the two unreachable presets, the passing observer's order is `b-first` when the speed is beyond `simultaneitySpeed` (above `+0.6` for `(3 s, 5 ls)`, below `−0.8` for `(4 s, −5 ls)`), `same-moment` at it, and `o-first` on the other side.
4. `simultaneitySpeed` equals `t ÷ x` for the unreachable presets, and is `null` for the reachable and light-only ones.
5. A property test over a grid of events and passing speeds: whenever the passing observer's order differs from the lab's order, the pair is unreachable (so the test would fail if order could flip for an event inside or on the cone).
6. The passing observer's `intervalSquared` and `relation` equal the lab's for every preset and every speed (as in Experiment 2).
7. The passing observer's time between the events equals `γ × (t − u × x)`, computed independently of `lorentzTransform` for a few cells of the table, so the module's use of the transformation is checked.
8. `sameMomentLineSlope` equals `u`, and an event lies above the line (`t > u × x`) exactly when the passing observer's order is `o-first`.
9. Out-of-range inputs throw `RangeError` (`|u| ≥ c`, `t ≤ 0`).
10. The result is a pure function of `(event, u)`, so playback speed cannot change it (§11).

---

## AI Tutor Behavior

Following the established sequence (observe, compare with the prediction, a conceptual question, then the explanation). Draft only; the owner approves the wording (§28.1).

1. **Observe.** "In the lab, which event happened first? And which did the passing observer find first?"
2. **Compare with the prediction.** Neutral: the learner's choice versus what the table and the drawing show.
3. **Conceptual question.** "Think about how the cone from the last experiment sorts the five events. What do the events whose order never flips have in common?"
4. **Explanation**, kept short and concrete:
   - **What the table shows,** in the learner's own numbers (for example `(3 s, 5 ls)`: the lab finds B 3.00 s after O; the observer at +0.9c finds B 3.44 s *before* O).
   - **A line that tilts but never reaches the cone's edge.** Every observer's same-moment line through O is tilted by their speed, and a speed below the speed of light means it is never steeper than 45 degrees, so never as steep as the cone's edges. So the line stays *outside* the cone. An event inside or on the cone is always on the same side of every such line as in the lab, so it always comes after O. An event outside the cone can be on the other side of a tilted line, so its order can flip.
   - **Daily-life example** (no relativity): a flash of light sent from O and a firecracker going off at B. For the flash to set off the firecracker, it must travel from O to the firecracker's place. That is just the shout across the field from Experiment 2: a signal has to make the trip. If it can, the flash comes first for everyone who measures carefully.
   - **Why we never notice.** For an observer moving at 30 meters per second, a typical car speed, which is 0.0000001 of the speed of light, two events 1 second apart could be found in the opposite order only if they were more than 10,000,000 light-seconds apart, about a third of a light-year. At everyday speeds and distances, no reversal happens.
   - **Why this is not a contradiction.** Two events outside each other's cone cannot be cause and effect, so no cause is ever found after its effect.
   - **What the speed limit does.** If something could go faster than light, it could connect two events outside each other's cone. For the observer at +0.9c in the example, an effect would be found *before* its cause. Relativity's rule that nothing outruns light is what keeps a cause before its effect for everyone. (Decision 5: a remark, with no extra control.)
5. **Limits.** The tutor says what was and was not shown: five events, one passing observer at a time, one dimension. It showed the order of events measured by each observer, not what they see with their eyes (a later experiment). It did not show anything about faster-than-light signals, only what would follow if there were any.

The tutor must not invent physics, change results, or contradict the engine (§13).

---

## Decisions Needing Human Review

1. **Is this the right next experiment?** Default: cause before effect, the next item of the approved roadmap direction, and the one Experiment 2's Decision 6 was built to lead to. Alternative: move straight to "what you see is the past", or stop the group at Experiment 2.
2. **Which events.** Default: reuse the five from Experiment 2, so the learner already knows which are reachable and which are not. Alternative: new events, with more unreachable cases at different angles.
3. **Passing speeds.** Default: seven presets from −0.9c to +0.9c in steps of 0.3, so that `(3 s, 5 ls)` at +0.6c shows the same-moment case exactly, and +0.9c and −0.9c show a reversal. Alternative: fewer presets, or a free slider (which makes the exact same-moment speed hard to hit).
4. **The picture.** Default: reuse the first chapter's same-moment line (Experiment 9), one line per observer through O, with B above or below each. Alternative: draw the passing observer's own diagram (their own axes) beside the lab's, which shows the order directly but loses the "tilted line never reaches the cone's edge" picture that explains why.
5. **Faster-than-light remark.** Default: a short remark in the tutor with the learner's own numbers, no extra control and no demonstration, so the app does not simulate physics it says is impossible. Alternative: a toggle that draws a hypothetical faster-than-light signal from O to B, which shows the reversal for the effect directly but invites the question "can I do that?". Alternative: leave the remark out.
6. **The prediction.** Default: three answers as drafted, including (b), which is never right. Alternative: two answers (yes/no), simpler but giving away that the answer is one of two.
7. **What the table shows.** Default: time (signed), distance, `time² − distance²`, which case, and which happened first. Alternative: leave out the distance and the interval, to keep the table short.
8. **The "why we never notice" example.** Default: include it, with the 30 meters per second, 10,000,000 light-seconds figures (computed from `t ÷ u`, in the tutor). Alternative: leave it out, since it is an aside from the main point.
9. **Name of the experiment.** Default: "Cause Before Effect: Can the Order of Events Change?" as the learner-facing title (the long title in this file is for the specification). Owner may prefer another.
10. **What would be left for a primary-source check.** The result (the order of events can change only for events outside each other's cone, and relativity's speed limit keeps cause before effect) is standard special relativity, and the transformation is already tested in the first chapter (Experiment 11). The tutor's remark that a faster-than-light signal would allow an effect before its cause is a standard argument, but it is a claim about what physicists conclude, and should be checked against a source before the wording is approved. The "30 meters per second" and "a third of a light-year" figures are arithmetic from the model (`1 ÷ 10⁻⁷ = 10⁷` light-seconds, about 0.32 light-years); the car's speed is a general-knowledge figure.

---

## Success Criteria

1. The physics model gives the order for each observer, and the order never differs between observers for the reachable and light-only events, at any tested speed, while for the unreachable events it does at the speeds in the table.
2. The learner predicts before running; Run requires a prediction.
3. The diagram shows each observer's same-moment line, and where B is relative to each line, in a way that does not rely on colour alone.
4. Results are shown neutrally, then explained by the tutor after the learner has responded.
5. The learner can say that the order of events can differ between observers only for events outside each other's light cone, and that this never changes whether a cause comes before its effect.
6. The experiment does not claim to explain *why* the order flips beyond the picture of the tilted line, does not show what observers *see*, and does not demonstrate faster-than-light signals.
7. Nothing in it contradicts the first chapter's Experiments 1 to 11, or Experiments 1 and 2 of this group.

---

## Implementation Notes

**Built (2026-10-14):** the physics model (`src/physics/causeBeforeEffect.ts`) and its tests (all ten required tests, plus two extra: every same-moment line stays outside the cone, and at u = 0 the passing observer agrees with the lab), and the interface: the introduction, the controls, the prediction, the animated diagram with its caption, the results panel, the tutor (`src/components/CauseBeforeEffectTutor.tsx`) and the chapter summary (`learned` and `next` in `src/App.tsx`). It is wired into the guided journey as the third chapter of the Spacetime Geometry group.

**Approved wording (owner, 2026-10-14):** the introduction, the "How to read this diagram" caption, the results panel, the tutor and the chapter summary, as they stand in `src/components/CauseBeforeEffectExperiment.tsx`. The component holds the verbatim text; this note records its structure.

*Introduction*, in this order:
1. **The question:** the flash and firecracker; "cause" and "effect" defined; the question of whether observers can disagree about which of two events came first, and whether that would break cause and effect.
2. **Some words we will use**, as a list: event, light cone (with a pond-ripple comparison), cause (the light-cone test, and why an event outside the cone cannot be caused by O), what it means for an observer to "find" the order (with a 3 light-second example), and same-moment line.
3. **What happens:** the two events, the two observers (the lab at rest and a passing observer), the predict-run-compare sequence, and the sweeping lines.
4. **Working out a possible cause:** one test (could something starting at O reach B without going faster than light?), a walking example, and the light example of an event 4 seconds after O and 1 light-second away, in three steps.
5. **Your job:** three steps, the prediction is not graded, and Run stays off until a prediction is chosen.
6. **What we assume:** four simplifications (no gravity, steady speeds, one straight line, nothing faster than light), and what "0.6c" means.

*Caption*, in this order:
1. **How to read this diagram:** place sideways, time upward, with a timetable comparison.
2. **What is really happening in the animation:** each sweeping line is an observer's "now-line", with a scanner-bar comparison, and what touching an event first or second means.
3. **Why two lines:** the lab's line is level, a mover's is tilted (right-moving rises to the right), and a mountain-range comparison.
4. **A worked example** with numbers that are not among the choices (B 6 seconds after O and 2 light-seconds right, observer at +0.5c; the tilted line is at 0.5 × 2 = 1 second at B's place, B is above it, so both find O first), in four steps.
5. **A list of what each part of the drawing is:** the ruler, the lab's clock line, O, B, the passing observer, the lab's line, the passing observer's line, the colored regions and the yellow lines.
6. **What to look for:** four steps (before, while, when it ends, then try again). It ends by saying each observer's numbers appear in the results, below the drawing.

*Results panel* (shown only when the run ends and a prediction was made; values only, no explanation, §12):
1. **What you ran:** the chosen event B and passing speed, and the learner's prediction, recorded and not marked right or wrong.
2. **A table** with one row for the lab and one for the passing observer: time from O to B (signed, minus means B was earlier), distance between O and B, time² − distance², "Could O cause B?" (reachable, light only or unreachable), and "Which event came first" (O first, the same moment or B first).
3. **"What each column means":** a list with examples, including the time² − distance² calculation (3 × 3 − 2 × 2 = 5) and its link to the light cone from Experiment 2.
4. **A bars drawing** of the signed time from O to B for each observer, on one scale around a zero line (right: B later than O; left: B earlier; a dot: the same moment), with the time and the order written beside each bar, and a "How to read this drawing" caption and "What to look for" paragraph.

*Tutor* (observe, compare with the prediction, one conceptual question, then the explanation):
1. **Observe:** which event came first in the lab, and which the passing observer found first.
2. **Compare:** the learner's prediction against this run's two findings, noting that the prediction was about any observer and the run showed one.
3. **Conceptual question:** the specification's question about what the events whose order never changes have in common.
4. **Explanation**, seven short paragraphs: the learner's own numbers plus the (3 s, 5 ls) event at +0.9c, where the order flips; why a tilted line that never reaches the cone's edge lets some events change order and not others (with the learner's own line height at B's place); the flash-and-firecracker example; why we never notice (30 meters per second, about 10,000,000 light-seconds, about 0.32 of a light-year, computed in the tutor); why this is not a contradiction; what the speed limit does (the faster-than-light remark, using the +0.9c example); and what was and was not shown.

*Chapter summary:* "What you learned" (the order changes only for events outside the cone, with the 3.00 s and 3.44 s example, the tilted-line reason and the faster-than-light remark) and "What's next" (the order found is measured, not seen, and a later experiment looks at that difference; it names no experiment, because none is approved).

**Complete-flow test (2026-10-14, headless Chrome, 500 px and 1200 px wide):** passed. The introduction shows; Run needs a prediction; results and tutor are hidden before and during the run; the results table, bars, badges and tutor step through correctly for the (3 s, 5 ls) event at +0.9c; the summary appears only after the explanation; changing the event clears the results and tutor; a second run restarts the tutor; no console errors and no horizontal overflow. Not checked: other browsers, a real learner, the check mark and "explained" saving in `localStorage`, and mid-animation visuals at other settings.

**Final review (2026-10-14) against this specification, `docs/PROJECT.md` and `AGENTS.md`:** all required tests, learner controls, the prediction gate, neutral results before the tutor's explanation, and the tutor sequence match the specification. Findings reported to the owner, not changed:
- "Light-second" was used in the "Some words we will use" list before the "Working out a possible cause" paragraph defined it. Fixed on 2026-10-14 at the owner's request: it is now defined in that list item (the distance light travels in one second, about 300,000 kilometers), and the later paragraph only reminds the learner.
- The diagram does not write "above" or "below" for B next to each line. The side is shown by B's position and by the order badges, and the caption explains it. Success Criterion 3 asks for a way that does not rely on colour alone, which the labels, dashing and badges meet.
- The tutor's faster-than-light remark is a standard argument but has not been checked against a source (Decision 10).

**Differences from the specification as written:** none have been approved yet. The results panel's column "Could O cause B?" is Claude's plain-language name for the "Which case" column the specification describes, and the results show the order as a bar drawing of signed times only (the specification's "bars" description). Other items to report to the owner for approval: the tutor's use of the (3 s, 5 ls) event at +0.9c as a fixed example in paragraphs 1 and 6, the tutor's "line height at B's place" sentence, the drafted chapter summary, the pond-ripple, walking, scanner-bar, timetable and mountain-range comparisons, the "try again" step in "Your job" and "What to look for", and the worked example's closing line "Both observers agree on the order here", are Claude's additions to the draft wording.
