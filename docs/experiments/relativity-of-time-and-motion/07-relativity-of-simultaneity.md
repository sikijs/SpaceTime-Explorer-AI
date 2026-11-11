# Experiment 7: At the Same Time... For Whom?

**Status: APPROVED by the project owner. The defaults proposed under "Decisions Needing Human Review" stand unless changed.**

**Implementation: complete.** Physics model (`src/physics/relativityOfSimultaneityExperiment.ts`), interface (`src/components/Experiment7.tsx`), prediction, results panel, and tutor (`src/components/Experiment7Tutor.tsx`) are in place, following the design below. It has had its complete-flow test, its final review against this specification (§21 Step 10), and the owner's line-by-line wording approval (§28.1), including the "point of view" clarification added to the introduction after that review. **The page was rebuilt in the audit of 2026-11-10 (commits `fe2fee0`, with the earlier `66c2d02` and `aea9b31` for "block" instead of "rod"): see "Audit Update (2026-11-10)" at the end, which wins where it differs from the text above. In particular the one-column page, the speed buttons above the guesses, the introduction's early reveal and the tutor's "the lab's clocks say it arrived at the back end first" for every speed are superseded.**

The title is a working title.

## Overview

Experiments 3 through 6 compared measurements of the *same* clock made from two reference frames: the lab and the moving clock. Experiment 6 built a light clock with its mirrors in a line along the direction of motion, and showed that its length, seen from the lab, must be shorter than its own rest length for time dilation to hold with light fixed at `c`.

Experiment 7 uses that same moving block, but asks a new question. Instead of one event (a full round trip), it looks at **two** events: a flash of light, released from the exact center of the block, reaching the back end and reaching the front end. In the block's own reference frame, by symmetry, both events happen at the same time — the flash has equally far to travel each way, at the same speed. Seen from the lab, the two events do **not** happen at the same time: the back of the block moves toward the point where the flash was released, and the front moves away from it, so the light reaches the back first.

The lesson is that "at the same time" is not an absolute statement. It depends on which reference frame is asking.

This is a new experiment beyond the progression planned in `01-clock.md` §18, which ends at Experiment 5. It was chosen by the project owner as the direction for Experiment 7, from the candidates raised after Experiment 6 (relativity of simultaneity, spacetime diagrams).

---

## Learning Objective

After this experiment, the learner should understand:

1. Two events can happen at the same time in one reference frame and at different times in another.
2. This is not a trick of light delay or communication lag — it is a real disagreement about which events are simultaneous, once each frame's own reference clocks are used (Experiment 2's synchronized lab clocks).
3. The disagreement follows directly from two things already established: light travels at `c` in the lab regardless of the source's motion (Experiment 5), and a moving block's length, seen from the lab, is shorter than its rest length (Experiment 6).
4. Only order/simultaneity of events **separated along the direction of motion** is affected this way; this experiment does not address events separated across the motion.

---

## Physical Situation

### One block, two reference frames

Reuse the moving light clock's block from Experiment 6, oriented along the direction of motion, with a rest length `L0 = 0.5` light-second (the same value as Experiments 4–6, so results stay comparable).

A flash of light is released at the exact center of the block at one instant. It travels outward in both directions at `c` in the lab (Experiment 5's rule) and reaches the two ends of the block. This defines two events:

- **Event B ("back"):** the flash reaches the back end of the block.
- **Event F ("front"):** the flash reaches the front end of the block.

The block is shown at rest (`v = 0`, both events happen together, as a baseline) and in motion at a chosen speed `v` along its own length.

### Two reference frames again

As in Experiments 3–6, two reference frames are involved: the lab's and the moving block's. The lab has synchronized clocks at rest (Experiment 2), so lab time can be assigned to events happening at different places. The block also carries its own (imagined) synchronized clocks, at rest relative to the block, one at each end.

### Simplifying assumptions (all must be stated to the learner)

- Flat spacetime: no gravity, no acceleration, constant velocity only.
- Light travels at the same speed `c` in the lab in both directions, as in Experiments 4–6.
- The block's length, seen from the lab, is `L0 · √(1 − v²/c²)` (Experiment 6's length contraction), reused without re-deriving it.
- The flash is released from the exact center of the block, as measured in the block's own frame.
- Only motion along the block's own length is considered; no sideways motion.

### Not introduced

Formal Lorentz transformations, spacetime diagrams (candidate for a later experiment), the general relativity-of-simultaneity formula `Δt' = -vΔx/c²` in symbolic form (the experiment demonstrates the effect numerically, from the two events' actual times, rather than presenting the formula), causality/light-cone arguments, and any real-world evidence (consistent with Experiment 6's approach; see Decision 6).

---

## Physics Model

Units: light-seconds, seconds, `c = 1` (consistent with Experiments 3–6). Velocity `v` is a fraction of `c`, `0 <= v < c`.

### Block length in the lab

Reuse `REST_LENGTH` and length contraction from `src/physics/lengthContractionExperiment.ts`:

```
L(v) = L0 · √(1 − v²/c²)          (L0 = 0.5 light-second, from lengthContractionExperiment.REST_LENGTH)
```

### Event times, lab frame

At the instant of the flash (`t = 0` in the lab), the block's center is at lab position `0`, the back end at `-L(v)/2`, and the front end at `+L(v)/2`. Both ends move forward at `v`.

```
t_back(v)  = (L(v)/2) / (c + v)       back end moves toward the flash
t_front(v) = (L(v)/2) / (c − v)       front end moves away from the flash
```

For `v > 0`: `t_back < t_front` — the back event happens first, in the lab frame.

### Event times, block's own frame

By symmetry (the flash is released at the exact center, and light travels at `c` in both directions in every frame per Experiment 5):

```
t_back' = t_front' = (L0/2) / c
```

Both events are simultaneous in the block's own frame, for every `v`, including `v = 0`.

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

- **Speed of the block:** presets and custom range to match Experiment 6 — 0.1c, 0.3c, 0.5c, 0.8c, or Other from 0.01c to 0.9c. A `v = 0` baseline run (or a static baseline display) shows both events coinciding in both frames.
- No duration or length control: each run shows one flash and its two arrival events.
- Animation playback speed is a presentation choice only and must not change any result (Experiment 1's rule, still in force).

---

## Prediction Activity

Before running, the learner sees the scenario and the assumption:

> A block is 0.5 light-seconds long. A flash of light is released from its exact center. If the block is standing still, the flash reaches both ends at the same time. Now the block moves at [speed] along its own length. Light still travels at c in the lab, in both directions. **Will the flash reach the two ends of the moving block at the same time, as measured by the lab's clocks? If not, which end does it reach first?**

Proposed prediction form (see Decision 4): a choice among *same time*, *back end first*, *front end first*, plus a follow-up choice for whether the block's own point of view agrees or disagrees with the lab. Not scored. START is disabled until both parts are entered, as in Experiments 1–6.

---

## Experiment Behavior

### Introductory text

Before the learner predicts, the interface explains in plain words (wording to be drafted for the owner's approval, `CLAUDE.md` §28.1):

- The question: if two things happen "at the same time," is that a fact everyone agrees on?
- A reminder of the moving block from Experiment 6 and its length as seen from the lab.
- What is being done: a flash released from the exact middle of the block, reaching both ends.
- What "point of view" means here: it grounds the phrase in the reference frame concept already defined in Experiment 2, spelling out concretely what it means to measure the flash's arrival from the block's own frame versus from the lab's frame, added after a learner found the two panel titles unclear without it.
- What the learner will see and their job (guesses are not scored), then the simplifying assumptions, with "reference frame" and "lab time" already familiar from Experiments 2–6.
- The term **simultaneity** / **relativity of simultaneity** is defined in plain language at first use here (e.g., "happening at the same time" and "different observers can disagree about which events happen at the same time").

### Display

Two panels, following the visual language of Experiments 4–6:

1. **The block's own point of view:** the flash reaches both ends together.
2. **The lab's point of view:** the flash reaches the back end first, then the front end, with a visible time gap.

Each panel shows the block, the flash traveling outward from the center, and markers for the two events with their times. A `v = 0` baseline (or a toggle) lets the learner compare against the case where both frames agree.

Owner's decisions of 2026-11-10 (from reviewing the page):

- **"Block", not "rod".** The object is called a block everywhere, because "rod" suggested an upright pole with a top and bottom. It is drawn as a pale, flat rectangle labelled BLOCK, with the back end (blue line) and front end (purple line) as its two ends, and is described as like a train car or a long box lying on the ground.
- **The block's centre.** A small dark triangle under the block, labelled "block's centre", moves with the block. The dashed line is where the flash was released ("Flash released here (at the block's centre at the start)"). They coincide at the start; in the lab picture the triangle leaves the dashed line as the block moves on. The flash dots are drawn larger.
- **One scale.** Both panels use the same scale (pixels per light-second), so a shorter block in the lab picture is the real length contraction, not a difference in zoom. Part 1's scale is set by its own run; Part 2's scale is fixed by its fastest run (0.9c), so it does not change with the speed chosen. The contraction stays drawn (the owner chose this over drawing equal sizes).

### Run

The flash starts at the center. The run ends when the later of the two events (front, in the lab panel) occurs. The own-frame panel finishes when both (simultaneous) events occur.

### Playback

Playback slowed for viewing, chosen so no run lasts more than about 15 real seconds, consistent with Experiment 6's approach. The physical result is determined by the model, not the playback speed.

---

## Results Display

After the run, show values only, neutrally (Predict → Experiment → Observe → Explain):

- The block's length in the lab at this speed (reused from Experiment 6).
- Both events' times in the lab frame, and the time gap between them.
- Both events' times in the block's own frame (equal).
- The learner's prediction, shown beside the actual order and gap.

Neutral presentation first; interpretation comes from the tutor after the learner responds. Values to three decimal places, consistent with prior experiments.

---

## Expected Observations

1. At `v = 0`, both events happen at the same lab time and the same block-frame time.
2. At `v > 0`, the back event happens before the front event in the lab frame, while the two events remain simultaneous in the block's own frame.
3. The lab-frame time gap between the two events grows with speed.
4. Light still travels at `c` in the lab on each leg (consistent with Experiment 5).

---

## Expected Learner Understanding

The learner should be able to say: "Whether two events happen 'at the same time' depends on who is asking. The block's own clocks say the flash reached both ends together. The lab's clocks say it reached the back end first. Both are correct, in their own reference frame."

---

## New Concepts Introduced

1. **Relativity of simultaneity**: events simultaneous in one reference frame need not be simultaneous in another.
2. That "at the same time" is a frame-dependent statement, not an absolute one — extending the pattern already seen for elapsed time (Experiment 3) and length (Experiment 6) to a third quantity: order/simultaneity of separated events.

---

## Relationship to Previous Experiments

- **Experiment 2:** established synchronized lab clocks, letting lab time be assigned to events at different places — reused directly here.
- **Experiment 5:** established that light travels at `c` in the lab regardless of source motion — used for both event-time calculations.
- **Experiment 6:** established length contraction, reused without re-derivation for the block's lab-frame length.

## Relationship to Later Experiments

None approved. Spacetime diagrams remain a candidate follow-up, now with genuine content to depict (two frames disagreeing about which events are simultaneous). Per `PROJECT.md` §7, later experiments must not be invented merely to fill out a roadmap.

---

## Required Physics Tests

1. At `v = 0`: both events occur at the same lab time and the same block-frame time (both equal `L0/(2c)`).
2. `t_back(v) < t_front(v)` for every tested `v > 0`.
3. `t_back(v)` and `t_front(v)` formulas match the worked values in the preset table.
4. Block-frame event time is independent of `v` and equal for both events, at every tested speed.
5. `labTimeGap(v)` is strictly increasing in `v` over the tested range.
6. `labLength(v)` matches `lengthContractionExperiment`'s length-contraction result at every tested speed (no independent recomputation drifting from Experiment 6).
7. Deterministic across repeated runs; independent of any UI or animation; sweep over every allowed speed in 0.01 steps, matching Experiment 6's test coverage pattern.
8. Velocity outside `0 <= v < c` (and above the interface's cap, if adopted) is rejected or capped as specified.

---

## AI Tutor Behavior

Follows the pattern of Experiments 3–6. No pre-run step, silent during the run, each step after the run needs a typed answer.

- **After the run:**
  1. Observation: "Look at the two panels. In the block's own view, did the flash reach both ends together? In the lab's view?"
  2. Prediction comparison: the learner's predicted order beside the actual order and the two times, in both frames. No verdict.
  3. Conceptual question: "The block's own clocks say the flash arrived at both ends at the same moment. The lab's clocks say it arrived at the back first. Both used a working light clock and light traveling at c. How can both be right?"
  4. Explanation, a numbered walk-through using the run's numbers: (1) in the block's own frame, the flash has equal distance to travel each way, at the same speed, so the two arrivals are simultaneous there; (2) in the lab frame, the back end moves toward the point of the flash and the front end moves away, so light reaches the back first; (3) this is not a delay or a communication lag — both frames use their own working clocks and light at `c`; (4) this effect is called **relativity of simultaneity**; (5) it extends what Experiments 3 and 6 already showed for elapsed time and length: many quantities that feel absolute in everyday life are frame-dependent in relativity.
- The tutor must not introduce spacetime diagrams, the Lorentz transformation, or causality/light-cone reasoning; those are outside this specification.

---

## Decisions Needing Human Review

All resolved by the project owner; the built implementation reflects the defaults proposed above unless noted otherwise.

1. **Physical setup — resolved.** The flash-from-center thought experiment was confirmed as proposed; no alternative setup was requested.
2. **Reuse of Experiment 6's length contraction — resolved.** Confirmed acceptable; `runSimultaneityExperiment` calls `runLengthContractionExperiment` directly rather than recomputing the contracted length (see `src/physics/relativityOfSimultaneityExperiment.ts`).
3. **Prediction form — resolved.** The proposed order choice plus frame-agreement follow-up was adopted, unchanged (`Experiment7.tsx`, "Make a prediction").
4. **Panel design — resolved.** The proposed two-panel layout (block's own view, lab's view) with a `v = 0` baseline reachable via preset was adopted; no single-panel toggle was requested.
5. **Title — resolved.** Kept as "At the Same Time... For Whom?" (styled "At the same time... for whom?" in the chapter sidebar, matching the lowercase style of the other chapter titles).
6. **Evidence and scope — resolved.** Confirmed out of scope, consistent with Experiment 6; the implementation makes no claims about experimental evidence.
7. **Speed range — resolved.** Confirmed to match Experiment 6: presets 0.1c/0.3c/0.5c/0.8c, custom range 0.01c–0.9c.

### Implementation notes (tutor)

- **Daily-life example (added 2026-09-26, at the owner's request, per `CLAUDE.md` §15).** A "A familiar version of this" paragraph was inserted into step 2 (the lab's view), after the sentence stating the lab-frame gap. It compares the back/front asymmetry to two friends running at equal speed from the middle of a moving train car toward its two ends — the one running toward the back arrives sooner because the back wall approaches them, the one running toward the front arrives later because the front wall recedes. This matches the mechanism already stated in step 2 (the back end moves toward the flash's release point, the front end moves away) and introduces no physics beyond this specification. The tutor already substituted real numbers throughout its explanation, so no further math addition was needed.

---

## Success Criteria

1. The physics model computes both events' lab-frame times and block-frame times, correctly reusing Experiment 6's length contraction.
2. The learner predicts before running; START requires a prediction.
3. The display makes the disagreement between the two frames about event order clearly visible.
4. Results are shown neutrally, then explained by the tutor after the learner responds.
5. The learner can say that simultaneity is frame-dependent, and explain why, using the run's own numbers.
6. The experiment does not introduce spacetime diagrams, the Lorentz transformation, or causality arguments.

---

## Audit Update (2026-11-10)

Built to `docs/audit/relativity-of-time-and-motion/07-draft-wording.md` (approved by the owner on 2026-11-10, "all defaults" to the fourteen questions in `07-gap-report.md`; the 1905 paper stays a gap). This section records what the page now does; where it differs from the text above, this section wins.

**What the page now does**
- **The page in four Parts.** Part 1 (amber): the two guesses, **START**, and the two panels ("The block's own point of view", "The lab's point of view"), fixed at **0.5c** (`PART1_VELOCITY`). Part 2 (pink): the speed (0c baseline, 0.1c, 0.3c, 0.5c, 0.8c, "Other" 0.01c to 0.9c, opening at 0.8c; the 0.9c cap is kept and explained) with a drawing that follows it and "Runs so far". Part 3 (teal): the results. Part 4 (blue): the tutor. The introduction, a collapsed "Words and formulas" box and the "Want to know more?" list sit above Part 1.
- **Parts 2, 3 and 4 appear when the first Part 1 run has finished**, and `onComplete` fires then. Part 2 shows "Not run yet" until the learner runs a speed.
- **Labels on the canvas.** Each picture now names its title, the block (BLOCK, between its back and front ends), the block's centre marker, the dashed "Flash released here" line, the flash and the "reached" readouts. Both panels use one scale, so the shorter lab block is the real contraction (owner's decisions of 2026-11-10, above).
- **The strip of event times (new; the specification above had no such picture).** A dark strip titled "When was each end reached?", shown when the run ends, on a 0 to 0.5 s scale in Part 1 and 0 to 1.2 s in Part 2 (`PART1_STRIP_SCALE_END`, `PART2_STRIP_SCALE_END`). Two rows: the lab's clocks (back end, front end, a gap arrow) and the block's own clocks (both ends on one dot). Part 2's strip shows the speed in pink and has no white marker.
- **The guesses (Predictions and the Real Results).** Neither guess has a size, so each is **one white marker** in a YOUR GUESS box joined by a line: the order guess at the guessed end's dot on the lab row (a bracket over both dots for "at the same time"), the agreement guess between the two rows. The caption says each is only a marker. They appear when the run ends and never move a dot. The guesses are shown again beside the results as tags.
- **Playback time.** The counter is renamed "Playback time"; the caption says each panel's own times are in its readouts. Playback speed never changes a result.
- **The early reveal is removed.** The introduction no longer says that the block's view sees both ends together and that the lab sees something different. It says what will be asked, in three steps (a block and a flash; two events; who is asking, with which clocks), and uses the chapters' titles ("A moving clock", "Why can't light go faster?", "Does motion change length?") instead of experiment numbers. "Light-second" is defined here.
- **Part 2 at the 0c baseline.** The speed left the prediction, so a guess can no longer sit beside results from another speed. The 0c run puts both rows on top of each other with a gap of 0.000 s.
- **Start over, not Change prediction.** "Start over" is always visible, greyed until there is a guess or a run and while a run plays; after START the guesses are locked and the page says so.
- **Results.** Values come from the module, with a note under each block and a guess tag. The old "Actual result, in the lab's frame" line was removed (the table gives it). No check-up and no setting-following table (every number comes from the same geometry a check would use, and the speed only moves marks).
- **Captions.** Three "How to read" captions (the panels, the strip, Part 2's drawing), each with sections, a worked moment at 0.5c from the module and three-part look-fors, and a "Where the real picture comes from" line (calculated here; nothing measured; nothing imagined).
- **Tutor** (`Experiment7Tutor.tsx`, `Experiment7Explanation`). Observe, compare (names the white markers on the strip), conceptual, then the explanation: 1 the block's own view, 2 the lab's view, the train-car comparison, 3 not a delay, 4 a name (relativity of simultaneity), 5 familiar territory, 6 your guesses, marked (which choice, what the run showed, no score, no "right" or "wrong"), 7 try it in Part 2 (0c, 0.1c, 0.8c, 0.9c, numbers from the module). **The 0c fault is gone:** the old text said the back end was reached first for every run, including the baseline.
- **Words and formulas** (collapsed): block, rest length, length seen from the lab, back end and front end, flash, light-second, c, event, simultaneity, relativity of simultaneity, lab and lab clocks, and one formula (time = distance ÷ speed). The lab's arrival-time formulas are withheld, because they would give away the guess.
- **Links** (checked 2026-11-10 by helper agents, who returned summaries of the pages, not their full text). From the start: NASA Science "Our Milky Way Galaxy: How Big is Space?" (speed of light), NASA Glenn "How 'Fast' is the Speed of Light?", and NASA ISTP Stargazers "Frames of Reference: The Basics" (2004, archival). **Held back until after the tutor's explanation** because they say simultaneity is relative: Einstein Online "The definition of 'now'" and "Elementary Tour, part 3: The relativity of space and time" (Max Planck Institute for Gravitational Physics). **Gaps recorded (§29 rule 3(c)):** Einstein's 1905 paper, "On the Electrodynamics of Moving Bodies", is **not linked**; a free full text (Fourmilab, a private site, 1923 translation) was fetched and left to the owner, who kept the gap; no plain official page on the relativity of simultaneity from NASA, ESA, CERN or Fermilab was found (Fermilab Today returned HTTP 403 and was not read); no plain official page found for the light-second (the three NASA pages never use the term); the only reference-frame page from NASA is the 2004 archival one. The experiment has no real result of its own, so no paper is linked for a result.
- **Shared classes.** The card, toggle buttons and action button use `exp-card`, `toggle-button` and `action-button`.
- **Physics module** (`src/physics/relativityOfSimultaneityExperiment.ts`, tested): the model is unchanged. Added `actualOrderFor` (moved in from the tutor file, returns "same" at 0c), `eventStripPositions`, `orderMarkerTarget`, `agreementMarkerTarget`, `markGuesses` and the two strip scales. The test file has 23 tests (14 before, 9 new). Components: `Experiment7.tsx`, `Experiment7Pictures.tsx` (the panels, the strip and the captions), `Experiment7Tutor.tsx`; `Experiment7.test.tsx` has 18 render tests.
- **"Block" for "rod"** (`66c2d02`, `aea9b31`): the wording on the page, in the tutor, in the chapter summary and in this specification says block. The introduction also has two sketches from the Spacetime Diagrams commit (`aea9b31`), "From a block to two leaning lines" and "From a flash to two leaning lines"; their positions come from the module.

**Where the approved wording lives.** `docs/audit/relativity-of-time-and-motion/07-draft-wording.md` (approved on 2026-11-10 as above). The page's text, `07-gap-report.md` and `docs/audit/PROGRESS.md` (row "Relativity 7") agree with it.

**Facts that may change.** The NASA and Einstein Online addresses and dates above (the NASA Science address already changed once and the old one gives a 404); the "as of 10 November 2026" date shown on the links list.

**Open / not checked**
- Narrow widths (below 850 px), other browsers, keyboard use and a real learner were not checked; the page was viewed in Chrome at wide width only (Part 1, the strip with both markers, Part 2 at 0c, the tutor to the explanation).
- The helpers' summaries of the Einstein Online pages were not compared with the pages by the agent; the "Elementary Tour, part 3" page was seen only as a quote and a summary, and the owner was asked to open it once (no reply is recorded here).
- The 1905 paper and the plain official simultaneity, light-second and reference-frame pages stay recorded gaps.
- The stale line in the header, "Success Criteria" and "Display" text above (for example "Two panels" with no strip, "a `v = 0` baseline (or a toggle)", "wording to be drafted") is left as written until the owner says to change it.
- The chapter summary in `src/App.tsx` was not re-read for this section beyond the "block" wording.
