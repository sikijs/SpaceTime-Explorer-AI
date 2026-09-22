# Experiment 7: At the Same Time... For Whom?

**Status: APPROVED by the project owner. The defaults proposed under "Decisions Needing Human Review" stand unless changed.**

**Implementation: built and complete-flow tested.** Physics model (`src/physics/relativityOfSimultaneityExperiment.ts`), interface (`src/components/Experiment7.tsx`), prediction, results panel, and tutor (`src/components/Experiment7Tutor.tsx`) are in place, following the design below. It has not yet had a final review against this specification (§21 Step 10) or the owner's line-by-line wording approval (§28.1).

The title is a working title.

## Overview

Experiments 3 through 6 compared measurements of the *same* clock made from two reference frames: the lab and the moving clock. Experiment 6 built a light clock with its mirrors in a line along the direction of motion, and showed that its length, seen from the lab, must be shorter than its own rest length for time dilation to hold with light fixed at `c`.

Experiment 7 uses that same moving rod, but asks a new question. Instead of one event (a full round trip), it looks at **two** events: a flash of light, released from the exact center of the rod, reaching the back end and reaching the front end. In the rod's own reference frame, by symmetry, both events happen at the same time — the flash has equally far to travel each way, at the same speed. Seen from the lab, the two events do **not** happen at the same time: the back of the rod moves toward the point where the flash was released, and the front moves away from it, so the light reaches the back first.

The lesson is that "at the same time" is not an absolute statement. It depends on which reference frame is asking.

This is a new experiment beyond the progression planned in `01-clock.md` §18, which ends at Experiment 5. It was chosen by the project owner as the direction for Experiment 7, from the candidates raised after Experiment 6 (relativity of simultaneity, spacetime diagrams).

---

## Learning Objective

After this experiment, the learner should understand:

1. Two events can happen at the same time in one reference frame and at different times in another.
2. This is not a trick of light delay or communication lag — it is a real disagreement about which events are simultaneous, once each frame's own reference clocks are used (Experiment 2's synchronized lab clocks).
3. The disagreement follows directly from two things already established: light travels at `c` in the lab regardless of the source's motion (Experiment 5), and a moving rod's length, seen from the lab, is shorter than its rest length (Experiment 6).
4. Only order/simultaneity of events **separated along the direction of motion** is affected this way; this experiment does not address events separated across the motion.

---

## Physical Situation

### One rod, two reference frames

Reuse the moving light clock's rod from Experiment 6, oriented along the direction of motion, with a rest length `L0 = 0.5` light-second (the same value as Experiments 4–6, so results stay comparable).

A flash of light is released at the exact center of the rod at one instant. It travels outward in both directions at `c` in the lab (Experiment 5's rule) and reaches the two ends of the rod. This defines two events:

- **Event B ("back"):** the flash reaches the back end of the rod.
- **Event F ("front"):** the flash reaches the front end of the rod.

The rod is shown at rest (`v = 0`, both events happen together, as a baseline) and in motion at a chosen speed `v` along its own length.

### Two reference frames again

As in Experiments 3–6, two reference frames are involved: the lab's and the moving rod's. The lab has synchronized clocks at rest (Experiment 2), so lab time can be assigned to events happening at different places. The rod also carries its own (imagined) synchronized clocks, at rest relative to the rod, one at each end.

### Simplifying assumptions (all must be stated to the learner)

- Flat spacetime: no gravity, no acceleration, constant velocity only.
- Light travels at the same speed `c` in the lab in both directions, as in Experiments 4–6.
- The rod's length, seen from the lab, is `L0 · √(1 − v²/c²)` (Experiment 6's length contraction), reused without re-deriving it.
- The flash is released from the exact center of the rod, as measured in the rod's own frame.
- Only motion along the rod's own length is considered; no sideways motion.

### Not introduced

Formal Lorentz transformations, spacetime diagrams (candidate for a later experiment), the general relativity-of-simultaneity formula `Δt' = -vΔx/c²` in symbolic form (the experiment demonstrates the effect numerically, from the two events' actual times, rather than presenting the formula), causality/light-cone arguments, and any real-world evidence (consistent with Experiment 6's approach; see Decision 6).

---

## Physics Model

Units: light-seconds, seconds, `c = 1` (consistent with Experiments 3–6). Velocity `v` is a fraction of `c`, `0 <= v < c`.

### Rod length in the lab

Reuse `REST_LENGTH` and length contraction from `src/physics/lengthContractionExperiment.ts`:

```
L(v) = L0 · √(1 − v²/c²)          (L0 = 0.5 light-second, from lengthContractionExperiment.REST_LENGTH)
```

### Event times, lab frame

At the instant of the flash (`t = 0` in the lab), the rod's center is at lab position `0`, the back end at `-L(v)/2`, and the front end at `+L(v)/2`. Both ends move forward at `v`.

```
t_back(v)  = (L(v)/2) / (c + v)       back end moves toward the flash
t_front(v) = (L(v)/2) / (c − v)       front end moves away from the flash
```

For `v > 0`: `t_back < t_front` — the back event happens first, in the lab frame.

### Event times, rod's own frame

By symmetry (the flash is released at the exact center, and light travels at `c` in both directions in every frame per Experiment 5):

```
t_back' = t_front' = (L0/2) / c
```

Both events are simultaneous in the rod's own frame, for every `v`, including `v = 0`.

### Time gap between the two lab-frame events

```
Δt_lab(v) = t_front(v) − t_back(v)
```

`Δt_lab(0) = 0` (baseline: at rest, both events are simultaneous in both frames). `Δt_lab(v)` grows with `v`.

### Values at the preset speeds (`L0 = 0.5` light-second)

| Speed | L(v) (lab length) | t_back  | t_front | Δt_lab  |
|-------|--------------------|---------|---------|---------|
| 0c    | 0.500 ls           | 0.250 s | 0.250 s | 0.000 s |
| 0.1c  | 0.497 ls           | 0.226 s | 0.276 s | 0.050 s |
| 0.3c  | 0.477 ls           | 0.183 s | 0.341 s | 0.157 s |
| 0.5c  | 0.433 ls           | 0.144 s | 0.433 s | 0.289 s |
| 0.8c  | 0.300 ls           | 0.083 s | 0.750 s | 0.667 s |
| 0.9c  | 0.218 ls           | 0.057 s | 1.090 s | 1.032 s |

Confirmed in `src/physics/relativityOfSimultaneityExperiment.test.ts`, which checks these values to five decimal places.

### Result structure (proposed)

```typescript
interface SimultaneityResult {
  velocity: number                 // fraction of c
  restLength: number                // L0, light-seconds, reused from lengthContractionExperiment
  labLength: number                 // L(v), light-seconds, reused from lengthContractionExperiment
  backEventLabTime: number          // t_back(v), seconds
  frontEventLabTime: number         // t_front(v), seconds
  labTimeGap: number                 // Δt_lab(v), seconds
  rodFrameEventTime: number         // t_back' = t_front', seconds, same for both events
}
```

The physics lives in a new module independent of React (working name `src/physics/relativityOfSimultaneityExperiment.ts`), reusing `REST_LENGTH` and the length-contraction calculation from `src/physics/lengthContractionExperiment.ts` rather than recomputing it, plus a playback-state function following the pattern of Experiments 4–6.

---

## Learner Controls

- **Speed of the rod:** presets and custom range to match Experiment 6 — 0.1c, 0.3c, 0.5c, 0.8c, or Other from 0.01c to 0.9c. A `v = 0` baseline run (or a static baseline display) shows both events coinciding in both frames.
- No duration or length control: each run shows one flash and its two arrival events.
- Animation playback speed is a presentation choice only and must not change any result (Experiment 1's rule, still in force).

---

## Prediction Activity

Before running, the learner sees the scenario and the assumption:

> A rod is 0.5 light-seconds long. A flash of light is released from its exact center. If the rod is standing still, the flash reaches both ends at the same time. Now the rod moves at [speed] along its own length. Light still travels at c in the lab, in both directions. **Will the flash reach the two ends of the moving rod at the same time, as measured by the lab's clocks? If not, which end does it reach first?**

Proposed prediction form (see Decision 4): a choice among *same time*, *back end first*, *front end first*, plus a follow-up choice for whether the rod's own point of view agrees or disagrees with the lab. Not scored. START is disabled until both parts are entered, as in Experiments 1–6.

---

## Experiment Behavior

### Introductory text

Before the learner predicts, the interface explains in plain words (wording to be drafted for the owner's approval, `CLAUDE.md` §28.1):

- The question: if two things happen "at the same time," is that a fact everyone agrees on?
- A reminder of the moving rod from Experiment 6 and its length as seen from the lab.
- What is being done: a flash released from the exact middle of the rod, reaching both ends.
- What the learner will see and their job (guesses are not scored), then the simplifying assumptions, with "reference frame" and "lab time" already familiar from Experiments 2–6.
- The term **simultaneity** / **relativity of simultaneity** is defined in plain language at first use here (e.g., "happening at the same time" and "different observers can disagree about which events happen at the same time").

### Display

Two panels, following the visual language of Experiments 4–6:

1. **The rod's own point of view:** the flash reaches both ends together.
2. **The lab's point of view:** the flash reaches the back end first, then the front end, with a visible time gap.

Each panel shows the rod, the flash traveling outward from the center, and markers for the two events with their times. A `v = 0` baseline (or a toggle) lets the learner compare against the case where both frames agree.

### Run

The flash starts at the center. The run ends when the later of the two events (front, in the lab panel) occurs. The own-frame panel finishes when both (simultaneous) events occur.

### Playback

Playback slowed for viewing, chosen so no run lasts more than about 15 real seconds, consistent with Experiment 6's approach. The physical result is determined by the model, not the playback speed.

---

## Results Display

After the run, show values only, neutrally (Predict → Experiment → Observe → Explain):

- The rod's length in the lab at this speed (reused from Experiment 6).
- Both events' times in the lab frame, and the time gap between them.
- Both events' times in the rod's own frame (equal).
- The learner's prediction, shown beside the actual order and gap.

Neutral presentation first; interpretation comes from the tutor after the learner responds. Values to three decimal places, consistent with prior experiments.

---

## Expected Observations

1. At `v = 0`, both events happen at the same lab time and the same rod-frame time.
2. At `v > 0`, the back event happens before the front event in the lab frame, while the two events remain simultaneous in the rod's own frame.
3. The lab-frame time gap between the two events grows with speed.
4. Light still travels at `c` in the lab on each leg (consistent with Experiment 5).

---

## Expected Learner Understanding

The learner should be able to say: "Whether two events happen 'at the same time' depends on who is asking. The rod's own clocks say the flash reached both ends together. The lab's clocks say it reached the back end first. Both are correct, in their own reference frame."

---

## New Concepts Introduced

1. **Relativity of simultaneity**: events simultaneous in one reference frame need not be simultaneous in another.
2. That "at the same time" is a frame-dependent statement, not an absolute one — extending the pattern already seen for elapsed time (Experiment 3) and length (Experiment 6) to a third quantity: order/simultaneity of separated events.

---

## Relationship to Previous Experiments

- **Experiment 2:** established synchronized lab clocks, letting lab time be assigned to events at different places — reused directly here.
- **Experiment 5:** established that light travels at `c` in the lab regardless of source motion — used for both event-time calculations.
- **Experiment 6:** established length contraction, reused without re-derivation for the rod's lab-frame length.

## Relationship to Later Experiments

None approved. Spacetime diagrams remain a candidate follow-up, now with genuine content to depict (two frames disagreeing about which events are simultaneous). Per `PROJECT.md` §7, later experiments must not be invented merely to fill out a roadmap.

---

## Required Physics Tests

1. At `v = 0`: both events occur at the same lab time and the same rod-frame time (both equal `L0/(2c)`).
2. `t_back(v) < t_front(v)` for every tested `v > 0`.
3. `t_back(v)` and `t_front(v)` formulas match the worked values in the preset table.
4. Rod-frame event time is independent of `v` and equal for both events, at every tested speed.
5. `labTimeGap(v)` is strictly increasing in `v` over the tested range.
6. `labLength(v)` matches `lengthContractionExperiment`'s length-contraction result at every tested speed (no independent recomputation drifting from Experiment 6).
7. Deterministic across repeated runs; independent of any UI or animation; sweep over every allowed speed in 0.01 steps, matching Experiment 6's test coverage pattern.
8. Velocity outside `0 <= v < c` (and above the interface's cap, if adopted) is rejected or capped as specified.

---

## AI Tutor Behavior

Follows the pattern of Experiments 3–6. No pre-run step, silent during the run, each step after the run needs a typed answer.

- **After the run:**
  1. Observation: "Look at the two panels. In the rod's own view, did the flash reach both ends together? In the lab's view?"
  2. Prediction comparison: the learner's predicted order beside the actual order and the two times, in both frames. No verdict.
  3. Conceptual question: "The rod's own clocks say the flash arrived at both ends at the same moment. The lab's clocks say it arrived at the back first. Both used a working light clock and light traveling at c. How can both be right?"
  4. Explanation, a numbered walk-through using the run's numbers: (1) in the rod's own frame, the flash has equal distance to travel each way, at the same speed, so the two arrivals are simultaneous there; (2) in the lab frame, the back end moves toward the point of the flash and the front end moves away, so light reaches the back first; (3) this is not a delay or a communication lag — both frames use their own working clocks and light at `c`; (4) this effect is called **relativity of simultaneity**; (5) it extends what Experiments 3 and 6 already showed for elapsed time and length: many quantities that feel absolute in everyday life are frame-dependent in relativity.
- The tutor must not introduce spacetime diagrams, the Lorentz transformation, or causality/light-cone reasoning; those are outside this specification.

---

## Decisions Needing Human Review

1. **Confirm the physical setup.** A flash from the rod's exact center, reaching both ends, is the classic (Einstein's train) thought experiment. Confirm this is the intended situation, or propose an alternative (e.g., two independent light sources at the ends, or lit lamps at each end compared by an observer at the midpoint).
2. **Confirm reuse of Experiment 6's length contraction.** The lab-frame event times depend on the rod's contracted length. This ties Experiment 7's correctness to Experiment 6 rather than deriving the rod's lab length independently. Confirm this dependency is acceptable, consistent with how Experiment 6 reused Experiment 3/4's time dilation.
3. **Prediction form.** Proposed: an order choice (same time / back first / front first) plus a frame-agreement follow-up. Alternatives: a numeric time-gap guess (harder, given the learner hasn't seen the formula yet), or a single order choice without the frame-agreement follow-up.
4. **Panel design.** Proposed: two panels (rod's own view, lab's view), plus a `v = 0` baseline. Confirm, or propose a single panel with a frame toggle instead.
5. **Title.** Working title "At the Same Time... For Whom?" — confirm, or propose an alternative (e.g., "Relativity of Simultaneity" directly, though Experiment 6's pattern was to not name the effect until it is observed).
6. **Evidence and scope.** As in Experiment 6, this draft says nothing about experimental evidence. Confirm this stays out of scope, consistent with Experiment 6.
7. **Speed range.** Proposed to match Experiment 6 (0.01c–0.9c custom range, same presets). Confirm, or choose a different range appropriate to this experiment's own playback-time behavior.

---

## Success Criteria

1. The physics model computes both events' lab-frame times and rod-frame times, correctly reusing Experiment 6's length contraction.
2. The learner predicts before running; START requires a prediction.
3. The display makes the disagreement between the two frames about event order clearly visible.
4. Results are shown neutrally, then explained by the tutor after the learner responds.
5. The learner can say that simultaneity is frame-dependent, and explain why, using the run's own numbers.
6. The experiment does not introduce spacetime diagrams, the Lorentz transformation, or causality arguments.
