# Spacetime Geometry — Closing Recap: "Putting It All Together: What Do Observers Agree On, and What Do They Only See?"

**Status: PROPOSED by Claude on 2026-10-16 per `CLAUDE.md` §23 Stages 1 to 3, at the owner's direction (the owner's plan of 2026-10-16: Experiment 10, then a closing "putting it all together" recap of the whole group, a section on Experiment 10's page and not an experiment, with no predictions, no new physics, and at most a sentence or two on why pushing harder gives less speed). **APPROVED by the owner on 2026-10-16 ("approve the specification with defaults": all ten decisions on their defaults, including the two edits to Experiment 10's introduction and chapter summary, the "why pushing harder gives less speed" passage, and the closing "habit to keep" sentence; Claude should say so if the owner meant otherwise). The learner-facing wording was approved by the owner on 2026-10-16 ("wording approved", after the section was built and viewed; read as covering the section, the pointer sentence in Experiment 10's introduction and the changed "What's next"; `CLAUDE.md` §28.1).** Built (see "Implementation Notes"). Every learner-facing sentence below is draft wording for the owner's line-by-line approval (`CLAUDE.md` §28.1). Every number marked "figure" is one the learner has already seen in an earlier experiment of this group, and must be computed from that experiment's own code, never typed in again.**

This is a closing section for the "Spacetime Geometry: What Is Real, What Is Seen" group, not an eleventh experiment. It follows the precedents of the Gravity chapter's and the Cosmology chapter's closing sections (`docs/experiments/gravity-and-curved-spacetime/09-gps-time-dilation.md` and `docs/experiments/cosmology/closing-synthesis.md`).

---

## Overview

Experiment 10 (a fast object looks rotated, not squashed) is the last experiment of the group. This section sits at the bottom of its page and appears only after the learner reaches that experiment's tutor explanation. It steps back from the ten experiments and does three things:

1. It sorts what the group showed into **three kinds of answer**: what **every observer agrees on**, what **each observer measures differently**, and what **each observer sees** because light takes time to arrive. This is the group's title, "What Is Real, What Is Seen", made concrete.
2. It ties each statement back to the experiment that showed it, with a number from that experiment.
3. It adds the owner's one extra passage: **why pushing harder gives less speed** (Experiment 5, in two or three sentences).

It carries **no prediction, no controls, no measurement and no new physics.** It is a statement to read, not another round of predict, experiment, observe, explain. It introduces **no new concept and no new term** (Decision 4).

---

## Learning Objective

After this section, the learner should be able to:

1. Name things every observer agrees on (the interval, which kind of pair two events are, the order of events that could be cause and effect, mass, the speed of light), and things that depend on the observer (times, distances, the order of events that could not be cause and effect, energy and momentum).
2. Say that **what an observer measures** (with rulers and clocks, after allowing for the time light takes to travel) and **what an observer sees** (the light that reaches them now) are different questions, and give two examples from the group (a spaceship's image, a cube's photograph).
3. Say that the stars' direction, color and brightness for a traveler differ from the lab's because each observer measures the light that reaches them, and that the stars themselves have not changed.
4. Say why giving a fast particle more energy raises its speed by less and less.
5. Say what the group left out (acceleration, gravity, forces, quantum effects; steady motion in a flat slice).

---

## Placement and Display

- **Where:** at the bottom of Experiment 10's page (`RotatedObjectExperiment`), below the tutor, shown only once the tutor's explanation step is reached (the same `onTutorComplete` marker). It is not a separate sidebar page, so a learner cannot read it before running anything (Decision 1).
- **A pointer in Experiment 10's introduction and chapter summary:** one sentence at the end of Experiment 10's introduction, and a changed "What's next", so the learner knows the recap is there (Decision 2). Both are edits to wording the owner has already approved, so they need the owner's approval before they are made. The proposed sentences are below.
- **Style:** plain text with a heading, three sub-headings and short bullet lists, styled distinctly from the tutor's conversation panel (no text box, no "Continue" button), as in the Cosmology section. No completion callback.
- **Text only (Decision 6).** No new diagram, so the `CLAUDE.md` §14 diagram rules do not apply.
- **Where the code lives:** a small component of its own (proposed name `SpacetimeGeometrySynthesis.tsx`) rendered by Experiment 10's page, so Experiment 10's component stays as it is. Its figures come from a small pure function (proposed name `synthesisFigures`) that imports the earlier experiments' modules, so the figures can be tested without the browser (`CLAUDE.md` §9).

### Figures (each from an earlier experiment's own module)

| Figure in the text | Source |
|---|---|
| An event 3 seconds after O and 5 light-seconds away: the lab finds it 3.00 seconds after O, an observer passing at 0.9c finds it 3.44 seconds before O | `causeBeforeEffect.ts` (Experiment 3) |
| A spaceship flying toward the lab at 0.6c: its image seems to cover the distance at 1.50c | `seeingThePast.ts` (Experiment 4) |
| Two lumps of mass m meeting at 0.6c each make one lump of mass 2.5 m, not 2 m | `energyMomentum.ts` (Experiment 5) |
| Energies of 2, 5 and 10 rest energies give speeds of 0.866c, 0.980c and 0.995c | `speedFromEnergy` in `energyMomentum.ts` (Experiment 5) |
| At 0.6c, the star the lab sees sideways is seen at 53.1 degrees | `aberration.ts` (Experiment 7) |
| At 0.6c, light is 2.00 times the frequency straight ahead and 0.50 times straight behind | `dopplerShift.ts` (Experiment 8) |
| At 0.6c, a star is 4.00 times as bright straight ahead and 0.25 times straight behind | `travelerSky.ts` (Experiment 9) |
| A cube at 0.6c: the ruler finds the front face 0.80 wide; the photograph is 0.80 + 0.60 = 1.40 wide and looks like a cube turned 36.9 degrees | `rotatedObject.ts` (Experiment 10) |

---

## Wording (DRAFT, for the owner's line-by-line review, `CLAUDE.md` §28.1)

### The pointer sentence at the end of Experiment 10's introduction

> **One more thing.** This is the last experiment in this group. Once you have run it, scroll down to "Putting It All Together" below. It steps back and sorts what all ten experiments showed into what everyone agrees on and what depends on who is looking.

### Experiment 10's chapter summary, "What's next" (replacing "This is the last experiment of this group.")

> This is the last experiment of this group. "Putting It All Together", below on this page, steps back and shows how the ten experiments fit together.

### The section

> ## Putting It All Together: What Do Observers Agree On, and What Do They Only See?
>
> You have now run all ten experiments in this group. They asked different questions, but they had one thing in common: two observers who move differently, looking at the same events. This section sorts what they showed into three kinds of answer. It adds nothing new: every number below is one you have already seen.
>
> ### 1. What every observer agrees on
>
> - **The interval** (Experiment 1). Two observers can measure different times and distances between the same two events, but squaring the time, squaring the distance and subtracting gives the same answer for all of them.
> - **Which kind of pair two events are** (Experiment 2). Whether a signal slower than light could make the trip, only light could, or nothing could (timelike, lightlike or spacelike). Every observer gets the same answer.
> - **The order of cause and effect** (Experiment 3). If one event is inside or on the edge of another's light cone, every observer finds the same one first. No observer ever finds a cause after its effect.
> - **Mass** (Experiment 5). Energy and momentum differ between observers, but E² − (pc)² is the same for all, and it is the square of the mass. For example, two lumps of mass m that meet at 0.6c make one lump of mass 2.5 m, not 2 m, because their energy of motion becomes internal energy, and every observer agrees on that 2.5 m.
> - **The speed of light** (earlier chapters). Every observer measures the same speed for light.
>
> ### 2. What each observer measures differently
>
> - **Times and distances** between the same two events (Experiment 1, and the time dilation and length contraction of the first chapter).
> - **The order of two events that could not be cause and effect** (Experiment 3). For an event 3 seconds after O and 5 light-seconds away, the lab finds it 3.00 seconds after O, and an observer passing at 0.9c finds it 3.44 seconds before O.
> - **Energy and momentum** (Experiment 5).
> - **The direction, color and brightness of starlight** (Experiments 7, 8 and 9). At 0.6c, a traveler sees the star the lab sees sideways at 53.1 degrees; sees light at 2.00 times the frequency straight ahead and 0.50 times straight behind; and sees a star 4.00 times as bright straight ahead and 0.25 times straight behind. The stars have not changed. Each observer measures the light that reaches them.
>
> ### 3. What an observer sees is a different question again
>
> "Measured" means what an observer works out with rulers and clocks, after allowing for the time light takes to travel. "Seen" means the light that reaches them now, which left its source earlier. They are different questions, and both answers are right.
>
> - **A spaceship's image** (Experiment 4). A spaceship flying toward the lab at 0.6c has an image that seems to cover the distance at 1.50c. That breaks no rule, because the spaceship itself is below the speed of light and nothing travels along the image.
> - **A cube's photograph** (Experiment 10). At 0.6c the lab's ruler finds the cube's front face 0.80 as wide as at rest. But a photograph also shows the trailing face, because light from the far side left earlier, when the cube was farther back. The photograph is 0.80 + 0.60 = 1.40 wide and looks like a cube turned by 36.9 degrees. The cube has not turned, and it is still measured as shorter.
>
> ### 4. Why pushing harder gives less speed
>
> A moving particle's energy is its rest energy divided by the time dilation factor D (Experiment 5), and it grows without limit as the speed nears the speed of light. A speed cannot pass the speed of light, but energy has no such limit. So the more energy you give a particle, the less speed each extra bit of energy adds. Energies of 2, 5 and 10 rest energies give speeds of 0.866c, 0.980c and 0.995c. The extra energy is still there: it shows up as energy, not as much more speed.
>
> ### What this group did not cover
>
> Everything here was steady motion in a straight line, in flat spacetime, shown on one line or a flat slice. We did not look at acceleration, at forces, at electric charge or at quantum effects. Gravity is the subject of the Gravity and Curved Spacetime chapter. The formulas were used, not derived, and the comparison of the interval with a stick's length in Experiment 1 was not exact.
>
> **A habit to keep.** When two observers disagree, ask two questions. What does each one measure? And what does each one see? Much of the confusion about relativity comes from mixing them up.

---

## Source Status of the Statements

Every statement above is a statement from an earlier experiment of this group and carries that experiment's own source status (see their specifications and `docs/STATUS.md`). The two sentences that are new to the recap, and so have no earlier source check, are:

| Statement | Status |
|---|---|
| "A speed cannot pass the speed of light, but energy has no such limit; so the more energy you give a particle, the less speed each extra bit adds" | Follows from Experiment 5's `E = (1 ÷ D) mc²` and its speed limit; no new source needed |
| "Much of the confusion about relativity comes from mixing up measured and seen" | A teaching remark, not a physical claim; the owner may delete it (Decision 8) |

---

## Decisions Needing Human Review

Each has a default; the owner may change any of them.

1. **Placement.** Default: a section at the bottom of Experiment 10's page, shown after the tutor's explanation (the Cosmology and Gravity precedent). Alternative: a separate sidebar page.
2. **A pointer in Experiment 10.** Default: one sentence at the end of its introduction, and the changed "What's next". Both edit wording the owner has approved. Alternative: no pointer.
3. **The "why pushing harder gives less speed" passage.** Default: included, in three sentences, with the figures 0.866c, 0.980c and 0.995c from Experiment 5's function. Alternative: leave it out, or give it a worked example.
4. **New terms.** Default: none. (Timelike, lightlike and spacelike were named in Experiment 2.) Alternative: add "invariant" as a term for "what everyone agrees on".
5. **Three kinds of answer.** Default: the three sub-headings above (agrees, measured differently, seen). Alternative: a single table of every quantity in the group, with a column "agree / differ / seen".
6. **Text only.** Default: no diagram. Alternative: one small picture of the three kinds of answer.
7. **Figures.** Default: each computed from the earlier experiments' own code through `synthesisFigures`, with a test. Alternative: typed in (not recommended, because they could then drift from the experiments).
8. **The closing "habit to keep" sentence.** Default: included. Alternative: delete it, because it is a teaching remark.
9. **Ties to earlier chapters.** Default: only the ones already in this group's experiments (time dilation, length contraction, the speed of light). Alternative: add one sentence on simultaneity or the twin paradox.
10. **Length.** Default: about 600 words, as above. Alternative: shorter (only the three kinds of answer) or longer (a worked example for each).

---

## Success Criteria

1. The section appears only after Experiment 10's tutor explanation, and not before the learner has run anything.
2. It has no prediction, control or input, and adds no new physics or new term.
3. Every number in it is computed by `synthesisFigures` from the earlier experiments' modules, and a test checks the figures against the values above.
4. It says plainly that measured and seen are different questions, and that the stars and the cube have not changed.
5. It names what every observer agrees on and what depends on the observer, and each statement agrees with the experiment it points to.
6. It contains no claim that an earlier experiment did not show (the only extra passage, "why pushing harder gives less speed", follows from Experiment 5's own formula).
7. Nothing in it contradicts Experiments 1 to 10 of this group or the earlier chapters.

---

## Required Tests

(For the figures function, in a file such as `src/physics/synthesisFigures.test.ts`.)

1. Each figure equals the value in the table above, to the number of decimals shown (3.00 and 3.44 seconds; 1.50c; 2.5 m; 0.866c, 0.980c and 0.995c; 53.1 degrees; 2.00 and 0.50; 4.00 and 0.25; 0.80, 1.40 and 36.9 degrees).
2. Each figure is read from the earlier experiment's own function, not recomputed (checked by calling that function in the test and comparing).
3. The speeds for 2, 5 and 10 rest energies rise with the energy and stay below 1, and each extra rest energy adds less speed than the one before.

---

## Implementation Notes

**Built (2026-10-16), step 1 only:** the figures function `synthesisFigures` (`src/physics/synthesisFigures.ts`) and its tests (`src/physics/synthesisFigures.test.ts`: 10 test cases covering the three required tests, with the specification's values written out by hand). It reads each figure from the earlier experiment's own function. Three deliberate breaks (the example speed, the collision field read, and one push energy) were each caught by at least one test. **Built (2026-10-16), step 2:** the section's component and wording (`src/components/SpacetimeGeometrySynthesis.tsx`, the draft wording of this specification with every figure from `synthesisFigures`), rendered by `RotatedObjectExperiment.tsx` below the tutor once the tutor's explanation is reached. It hides again when the learner presses Run, and shows again after the new run's explanation. Checked in Chrome at one setting (0.6c): hidden before the run, after the run and after two tutor answers; shown after the explanation; all twelve quoted figures present; hidden after pressing Run again. **Built (2026-10-16), step 3:** the two edits to Experiment 10, as Decision 2 approved: the "One more thing" paragraph at the end of its introduction (`RotatedObjectExperiment.tsx`) and the changed "What's next" (`App.tsx`), both with this specification's draft wording. **Not checked:** other speeds, narrow widths, other browsers, and a real learner.
