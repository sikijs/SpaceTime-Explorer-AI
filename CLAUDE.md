# Claude Code Instructions — SpaceTime Explorer AI

> All these concepts are complex. Use simple terms so that a user with just a basic knowledge of science should be able to understand. Make it as detailed as necessary to make the concept clear. Do not assume the user can understand these concepts easily. Explain with examples wherever possible.

## 1. Read the Project Definition First

The overall vision and purpose of SpaceTime Explorer AI are defined in:

`docs/PROJECT.md`

Before doing substantial work on this project, read:

1. `docs/PROJECT.md`
2. `AGENTS.md`
3. The relevant experiment specification
4. The existing implementation related to the requested task

`PROJECT.md` defines **what the project is and what it is intended to achieve**.

This file defines **how Claude Code should work on the project**.

Individual experiment specification files define **what a particular experiment must do**.

Do not treat this file as a replacement for `PROJECT.md` or the experiment specifications.

---

# 2. Claude Code's Role

Claude Code is the implementation assistant for SpaceTime Explorer AI.

The human project owner defines:

* Physics
* Scientific assumptions
* Educational objectives
* Experiment behavior
* Project scope
* Priorities
* Major design decisions

Claude Code implements those decisions.

Claude Code may identify ambiguities, technical problems, or possible improvements and explain them to the human.

Claude Code must not silently turn its own suggestions into project requirements.

---

# 3. Source-of-Truth Hierarchy

When determining what the project should do, use the following hierarchy:

1. `AGENTS.md` — general agent instructions
2. `docs/PROJECT.md` — overall project vision and goals
3. Relevant experiment specification — detailed experiment requirements
4. This `CLAUDE.md` — development workflow and implementation rules
5. Existing source code — current implementation

If these sources appear to conflict, stop and identify the conflict rather than choosing an interpretation silently.

The human project owner makes the final decision.

---

# 4. Technology Stack

The current application uses:

* React
* TypeScript
* Vite
* Vitest

Keep the technology stack simple.

Do not introduce a new framework, library, service, or architectural dependency unless there is a clear technical reason.

If a new dependency appears useful, explain why it is needed before introducing it when the change is significant.

---

# 5. Core Development Principle

Build the project incrementally.

Do not attempt to implement an entire experiment or feature in one large change unless explicitly instructed to do so.

Prefer:

**one logical step → test → review → next step**

Each step should be small enough that the human can understand what changed and why.

---

# 6. One-Step-at-a-Time Rule

When working on an experiment or major feature:

1. Identify the next logical implementation step.
2. Explain briefly what that step will accomplish.
3. Implement only that step.
4. Run the appropriate tests.
5. Report what changed and whether the tests passed.
6. Stop.

Do not automatically continue to the next implementation step.

Wait for the human to explicitly authorize the next step.

For example, if an experiment requires:

1. Physics model
2. Physics tests
3. Basic UI
4. Prediction interaction
5. Simulation playback
6. Results
7. AI tutor
8. Complete-flow testing

Do not implement steps 1–8 together.

Implement Step 1, test it, report it, and wait.

---

# 7. Before Making Changes

Before beginning a significant implementation task:

1. Read `docs/PROJECT.md`.
2. Read `AGENTS.md`.
3. Read the relevant experiment specification.
4. Inspect the current implementation.
5. Check the current Git status.
6. Determine exactly what the requested step requires.
7. State the intended change briefly before implementing it.

Do not modify unrelated files simply because they could be improved.

---

# 8. Do Not Invent Physics

Scientific correctness is more important than implementation convenience.

Do not invent or assume:

* physical laws
* equations
* initial conditions
* experimental behavior
* relativistic effects
* scientific explanations
* educational conclusions

If the experiment specification does not define something important, identify the ambiguity and ask the human.

Do not fill gaps by guessing.

---

# 9. Keep Physics Independent of the UI

Physics calculations should be separated from React components and browser presentation whenever practical.

The preferred conceptual structure is:

**Physics Model → Simulation State → User Interface**

The physics layer should be testable without requiring the browser or React.

The UI should display the results of the physical model rather than independently calculating physical results.

This separation is especially important for future experiments involving increasingly sophisticated physics.

---

# 10. Test the Physics First

Whenever an experiment contains a physics model:

1. Implement the smallest useful physics model.
2. Write tests for the defined behavior.
3. Verify the tests pass.
4. Only then build more complicated UI behavior around it.

Tests should verify physical behavior rather than merely testing that functions exist.

For example, tests should verify relationships such as:

* initial conditions
* elapsed time
* final measurements
* event ordering
* repeated experiment behavior

Use the experiment specification as the authority for what must be tested.

---

# 11. Keep Simulation Time Separate from Wall-Clock Time

When an experiment uses simulated time, distinguish clearly between:

* physical/simulation time
* real-world elapsed time
* visual playback speed

Changing the speed at which an animation is displayed must not change the physical result of the experiment.

The simulation should determine the result.

The UI should determine how that result is presented to the learner.

---

# 12. Educational Interaction

The application is an educational environment, not merely a collection of simulations.

When an experiment specification requires learner interaction, preserve the intended learning sequence.

In particular, respect the distinction between:

**Prediction → Experiment → Observation → Explanation**

Do not remove prediction or observation steps simply because they make the implementation more complicated.

Do not provide the explanation prematurely when the experiment is designed to let the learner reason first.

---

# 13. AI Tutor Rules

The AI tutor must follow the physics and educational design defined by the project.

The tutor must not become an independent source of physics.

When the experiment specification defines a tutor sequence, implement that sequence faithfully.

The tutor should generally:

* encourage prediction
* ask the learner what they observe
* encourage reasoning
* help connect observations to physics
* provide explanations at the appropriate point

The tutor should not:

* invent physics
* change experiment results
* contradict the physics engine
* overwhelm the learner unnecessarily
* turn every interaction into a lecture

---

# 14. User Interface Principles

The interface should make the current state of the experiment obvious.

At any point, the learner should be able to understand:

* what the experiment is about
* what they are expected to do
* whether the experiment is running
* what they are observing
* what happened when it finished
* what they should do next

Keep interfaces simple and uncluttered.

Do not add decorative features that distract from the physical concept being taught.

## Animated Diagrams

Every experiment's animated diagram must, before its UI step is reported done — not retrofitted afterward from owner feedback:

1. Label every drawn component directly on the canvas (the source, each arm, each detector, etc.) — a learner should never have to guess what a shape represents.
2. Visually distinguish any two quantities the learner is meant to compare. A control that changes a number must never leave the animation looking identical — if the experiment's point is a contrast (true vs. detected, near vs. far, before vs. after), the diagram has to show that contrast, not just report it in text.
3. Include a "How to read this diagram" caption beneath it, explaining what's drawn and what to look for, matching the established pattern in this project's prior experiments.

This pattern emerged in earlier experiments only through repeated, after-the-fact owner feedback. Apply it proactively on every new experiment's first UI pass.

---

# 15. Accessibility and Clarity

The application should be usable by learners who may be encountering relativity for the first time.

Prefer:

* readable text
* clear labels
* obvious controls
* understandable feedback
* simple terminology
* consistent interaction patterns

When specialized physics terminology is necessary, introduce it at an appropriate point in the learning sequence.

Do not assume that the learner already understands advanced terminology.

Every specialized term must be defined in plain, everyday language before it is used, and at the point where the learner first needs it. For example, "reference frame" is defined in Experiment 2's introduction, before Experiment 3 depends on it.

Learners bring everyday assumptions, such as time being the same for everyone. Where a term or experiment challenges such an assumption, start from the everyday idea and use a familiar example. Do not let the example bring in physics that a later experiment is meant to teach.

The ideas in this project are inherently complex. Wherever a tutor explanation, introduction, or results panel states a mechanism (not just a result), prefer to support it with:

* **simple math** — a short, concrete calculation with real numbers (not just the abstract formula), worked through step by step, using only the quantities the experiment already defines; and/or
* **a daily-life example** — a familiar, non-technical situation (not itself relying on relativity or advanced physics) that shares the same underlying mechanism, to give the learner an intuition to anchor the abstract case to.

Not every explanation needs both, and some need neither — a single clear sentence can be enough. Use judgment: add simple math and/or a daily-life example where they would clarify a mechanism the learner might otherwise take on faith, not as a rote checklist item on every paragraph. As with other learner-facing wording, these additions are the owner's to approve (§28.1).

---

# 16. Scope Control

Do not expand the requested task without approval.

Do not:

* add unrequested experiments
* redesign unrelated screens
* refactor unrelated code
* introduce unnecessary dependencies
* change approved physics
* change an experiment's educational objective
* add features simply because they might be useful later

If you discover an improvement outside the current task, mention it separately rather than implementing it automatically.

---

# 17. Preserve Existing Work

Before modifying files:

* inspect their current contents
* understand existing changes
* avoid overwriting unrelated work
* preserve previously implemented behavior unless the requested change requires otherwise

If `git status` shows pre-existing uncommitted changes, do not assume they belong to the current task.

Do not discard, reset, or overwrite user changes without explicit authorization.

---

# 18. Git Discipline

Git is used to maintain clear development checkpoints.

Before significant work:

```bash
git status
```

After completing a step:

* run the relevant tests
* inspect the changed files
* review the diff
* report the changes

Do not create commits unless the human requests a commit or explicitly authorizes Claude to commit.

When a commit is requested, create a focused commit describing the completed logical step.

Avoid combining unrelated changes in one commit.

---

# 19. Testing

After making code changes, run the tests relevant to the change.

For significant changes, also run the project's broader test suite when practical.

When tests fail:

1. Determine whether the failure was caused by the current change.
2. Investigate the cause.
3. Fix the problem if it is within the approved scope.
4. Do not hide or bypass a failing test simply to make the build pass.

Report test results clearly.

---

# 20. Do Not Hide Problems

If something is ambiguous, broken, or technically uncertain, say so.

Do not:

* pretend a test passed when it did not
* claim an implementation is complete when it is not
* silently work around a scientific ambiguity
* hide warnings
* remove tests because they fail
* change requirements to match an implementation

A clear problem report is preferable to an incorrect implementation.

---

# 21. Experiment Development Workflow

For each experiment, use the following general progression unless its specification requires a different order:

### Step 1 — Understand the Specification

Read the complete experiment specification.

Identify:

* physical model
* learner objective
* controls
* expected behavior
* required results
* tutor behavior
* required tests

### Step 2 — Physics Model

Implement the smallest independent physics model required by the experiment.

### Step 3 — Physics Tests

Create tests covering the defined physical behavior.

### Step 4 — Basic UI

Build the minimum UI needed to interact with the experiment.

### Step 5 — Connect UI and Physics

Connect the UI to the tested physics model.

### Step 6 — Learner Interaction

Implement prediction, observation, and other educational interactions specified by the experiment.

### Step 7 — Results

Display the experimental results clearly.

### Step 8 — AI Tutor

Add the tutor interaction specified by the experiment.

### Step 9 — Complete-Flow Testing

Test the complete learner experience from beginning to end.

### Step 10 — Review

Compare the finished implementation against:

* `docs/PROJECT.md`
* `AGENTS.md`
* the experiment specification
* the intended educational experience

Do not assume every experiment must use exactly these steps. The experiment specification has priority.

---

# 22. Experiment 1

Experiment 1 is complete.

Its approved specification remains the authoritative source for Experiment 1 behavior.

At a high level, Experiment 1 teaches:

> A clock measures elapsed time along its own history.

Experiment 1 intentionally does not introduce:

* motion
* gravity
* acceleration
* time dilation
* reference-frame comparisons
* curved spacetime

Its implementation should remain simple.

Its physics model, interface, prediction, results and tutor are implemented. See §27 for the current state of all experiments.

---

# 23. Future Experiment Workflow

The project is intended to develop as a progressive sequence of experiments.

When an experiment has been completed, Claude Code should automatically look to the project definition and the completed work to determine what the next logical experiment should be.

Claude Code should not require the human to define every future experiment from scratch.

Claude may propose future experiments based on the project vision, but may not implement a future experiment until its specification has been reviewed and explicitly approved by the human.

For each new experiment, use the following process.

### Stage 1 — Identify the Next Experiment

After the current experiment has been completed, review:

* `docs/PROJECT.md`
* `AGENTS.md`
* `CLAUDE.md`
* the completed experiment specification
* the completed experiment implementation

Determine what the next experiment should teach and how it should build upon what the learner has already learned.

If the project documentation already identifies the next experiment, use that direction.

If the project documentation provides the overall learning progression but does not specify the exact details of the next experiment, Claude may propose those details.

### Stage 2 — Propose the Experiment

Before implementing anything, Claude should propose:

* Experiment title
* Learning objective
* Physical situation
* Physics model
* Initial conditions
* Learner controls
* Prediction activity
* Experiment behavior
* Expected observations
* Expected learner understanding
* New concepts being introduced
* Relationship to previous experiments
* Relationship to later experiments
* Required physics tests
* Learner-facing introduction, including any new terms it must define
* AI tutor behavior, where appropriate

Claude should use the existing project vision and scientific progression to develop the proposal.

Claude may make reasonable educational and technical proposals, but must clearly identify important assumptions or decisions that require human review.

### Stage 3 — Create the Specification

After developing the proposal, Claude should create a draft specification in:

`docs/experiments/`

The specification should contain enough detail that the experiment can subsequently be implemented without having to rediscover its requirements.

At this stage:

**Do not implement the experiment.**

### Stage 4 — Human Review and Approval

After creating the proposed specification, Claude must stop and ask the human to review it.

The human may:

* approve it
* request changes
* change the physics
* change the educational objective
* change the learner interaction
* reject the proposal

Claude must not begin implementation until the human explicitly approves the specification.

### Stage 5 — Implement the Approved Experiment

Once the human approves the specification, follow the standard experiment development workflow in §21.

Implement the experiment incrementally:

1. Physics model
2. Physics tests
3. Basic UI
4. Connect UI and physics
5. Learner interaction
6. Results
7. AI tutor
8. Complete-flow testing
9. Final review

Use the one-step-at-a-time rule in §6.

Complete one logical step, test it, report the result, and stop.

### Stage 6 — Completion and Transition

When the experiment is complete:

1. Verify it against its specification.
2. Run the appropriate tests.
3. Report completion.
4. Treat the next experiment as the next project milestone.

Claude may then begin Stage 1 for the next experiment by proposing the next logical learning experience.

It must not skip the specification-review stage.

---

## Important Principle

The human does not need to design every experiment in advance.

The intended collaboration is:

**Human defines the overall educational vision.**

**Claude develops proposed experiments that follow that vision.**

**Human reviews and approves each experiment specification.**

**Claude implements the approved specification.**

This allows the project to evolve naturally while keeping the human in control of the physics, scientific assumptions, educational goals, and scope.

# 24. Architecture Should Evolve Carefully

The application will eventually contain more sophisticated experiments.

Therefore, code should be organized so that future experiments can be added without unnecessarily rewriting existing experiments.

However, do not build elaborate abstractions merely because they might be useful someday.

Use the simplest architecture that supports the current approved requirements.

Refactor when a real need appears.

---

# 25. Completion Criteria for a Step

A development step is complete only when:

* the requested functionality has been implemented
* the implementation stays within scope
* relevant tests pass
* existing behavior has not been unnecessarily broken
* the changed files have been reviewed
* any important limitations or unresolved questions have been reported

Completion of one step does not imply authorization to begin the next step.

---

# 26. Completion Report

After completing a development step, report briefly:

### Completed

What was implemented.

### Files Changed

Which files were added or modified.

### Tests

Which tests were run and whether they passed.

### Notes

Any important implementation decisions, limitations, or questions.

Then stop and wait for the next instruction.

---

# 27. Current Development State

The overall project vision is defined in:

`docs/PROJECT.md`

The general project rules are defined in:

`AGENTS.md`

The detailed requirements for each experiment are defined in its specification in `docs/experiments/`.

The current technology foundation is:

* React
* TypeScript
* Vite
* Vitest

## Current UI Layout

The application is a guided journey, a format chosen by the project owner. `src/App.tsx` shows one experiment at a time, as a chapter, in order: Experiments 1 to 6. A sidebar lists the chapters and highlights the current one, and Previous and Next buttons move between them. Chapters are freely reachable; none is locked.

Each experiment maintains fully independent physics models, UI components, prediction state, and AI tutor behavior. `App` only sequences them; the underlying architecture remains that of separate, independent experiments. Switching chapters remounts the experiment, so its prediction and results reset.

Progress: each experiment takes an optional `onComplete` prop, called when its animation reaches the end. `App` then shows a check mark beside that chapter and saves the completed chapters and the current chapter in `localStorage` under `spacetime-explorer-progress`. Completion means the experiment ran to the end; the tutor conversation is optional for the check mark. Each experiment also takes an optional `onTutorComplete` prop, called when the learner reaches the tutor's explanation (its last step); `App` saves those chapters as `explained` in the same `localStorage` entry.

Each experiment opens with a short introduction (the question, what happens, the learner's job, and the assumptions). The Experiment 2 introduction also explains the term "reference frame", which Experiment 3 relies on. The Experiment 3, 4, 5 and 6 introductions say that two reference frames are involved: the lab's and the moving clock's.

Text is set larger and at a medium weight, using a system sans-serif font, through `src/index.css` (the base size scales all `rem` sizes). This was chosen by the project owner for readability; do not reduce it without asking.

## Experiment Status

* **Experiment 1 (one clock):** complete. Its introduction gained a "What a clock actually does" paragraph and a stopwatch-at-a-race daily-life picture, approved by the owner as written (2026-09-29), part of a project-wide addition of deeper-theory/daily-life material to every experiment's introduction (see the Gravitational Waves Experiment 1 specification's "Implementation Notes" for the full list).
* **Experiment 2 (two clocks at rest):** implemented. Its introduction gained a "Why even ask this" paragraph, approved by the owner as written (2026-09-29), part of the same project-wide addition.
* **Experiment 3 (moving clock):** approved specification (`docs/experiments/relativity-of-time-and-motion/03-moving-clock.md`), tested physics model, interface, prediction, results panel, and tutor are built, and it has had its complete-flow test and final review. The review's items (the lab-observer diagram, the custom duration range, introductory text, and a zero-speed baseline) have been addressed; see the implementation notes in its specification. Its introduction gained a "What's really being tested" paragraph and a daily-life picture (friends splitting up and meeting for dinner), approved by the owner as written (2026-09-29), part of the same project-wide addition.
* **Experiment 4 (light clock):** approved specification (`docs/experiments/relativity-of-time-and-motion/04-light-clock.md`), tested physics model, interface, prediction, results, and tutor are built, and it has had its complete-flow test and final review. Its tutor refers to the time dilation factor, which Experiment 3's results panel now displays. The term "time dilation" is introduced in Experiment 3, after the learner has observed the effect (its tutor explanation and summary), and Experiment 4 is titled "The Light Clock: Why Time Dilation Happens". Its introduction gained a daily-life framing paragraph (any repeating process can be a clock), deliberately without revealing the light-path geometry the prediction is meant to uncover; approved by the owner as written (2026-09-29), part of the same project-wide addition.
* **Experiment 5 (why can't light go faster?):** approved specification (`docs/experiments/relativity-of-time-and-motion/05-invariant-light-speed.md`), tested physics model (`src/physics/invariantLightSpeedExperiment.ts`), interface, prediction, results panel, and tutor are built, and it has had its complete-flow test and final review. It shows the Experiment 4 moving light clock under two rules for light, the everyday rule (speeds add) and light's actual rule (light travels at c in the lab). Its learner-facing text was rewritten in plain language at the owner's request. See the implementation notes and the open items in its specification.
* **Experiment 6 (does motion change length?):** approved specification (`docs/experiments/relativity-of-time-and-motion/06-length-contraction.md`), tested physics model (`src/physics/lengthContractionExperiment.ts`), interface, prediction, results panel, and tutor are built, and it has had its complete-flow test and final review. It builds the light clock with its mirrors along the direction of motion and shows it with the rest length and with the shorter length, so that the learner sees that time dilation with light at c requires the clock to be shorter as seen from the lab. The effect is named length contraction only after the observation, and the speed is limited to 0.9c. See the implementation notes and the open items in its specification. Its introduction gained a daily-life picture (measuring a speeding car's length vs. parked), approved by the owner as written (2026-09-29), part of the same project-wide addition.
* **Experiment 7 (relativity of simultaneity):** approved specification (`docs/experiments/relativity-of-time-and-motion/07-relativity-of-simultaneity.md`), tested physics model (`src/physics/relativityOfSimultaneityExperiment.ts`), interface, prediction, results panel, and tutor are built, and it has had its complete-flow test in a browser, its final review against its specification (§21 Step 10), and the owner's line-by-line wording approval (§28.1). It reuses the Experiment 6 rod and shows that a flash released from its center reaches both ends at the same time in the rod's own frame but not in the lab frame, reusing Experiment 5's invariant `c` and Experiment 6's length contraction without re-deriving them. Its introduction gained a daily-life picture (two lightning bolts on a train platform, the classic simultaneity thought experiment), approved by the owner as written (2026-09-29), part of the same project-wide addition.
* **Experiment 8 (drawing spacetime):** approved specification (`docs/experiments/relativity-of-time-and-motion/08-spacetime-diagrams.md`), physics view layer (`src/physics/spacetimeDiagramView.ts`), interface, prediction, results panel, and tutor are built, and it has had its complete-flow test in a browser and its final review against its specification (§21 Step 10; two gaps found and fixed there — a missing assumption bullet, and diagram events that weren't labeled with their lab times). The owner's line-by-line wording approval (§28.1) was explicitly skipped, not granted. It draws the Experiment 6/7 rod and flash as a spacetime diagram, in the lab frame only, reusing Experiment 7's results without recomputation.
* **Experiment 9 (same time, different line):** approved specification (`docs/experiments/relativity-of-time-and-motion/09-same-time-different-line.md`), physics view function (`sameMomentLineFor` in `src/physics/spacetimeDiagramView.ts`), interface, prediction, results panel, and tutor are built, and it has had its complete-flow test in a browser, its final review against its specification (§21 Step 10; one wording mismatch found and fixed there — the spec described the same-moment line as extended inside the physics view function, when the implementation instead returns it unextended and extends it only for display, in the rendering component), and the owner's line-by-line wording approval (§28.1). Its introduction and tutor use a car example (two friends riding together vs. someone watching from the sidewalk), including an explanation of why the sidewalk-watcher disagrees, reusing Experiment 7's own reasoning (the rod's back end moves toward the flash, the front end moves away) without recomputation. It adds one line to the Experiment 8 diagram — the rod's own "same moment" line — through the same two events Experiment 7 and 8 already established, with no new physics.
* **Experiment 10 (the twin paradox):** approved specification (`docs/experiments/relativity-of-time-and-motion/10-twin-paradox.md`), simulation function (`runTwinParadoxExperiment` in `src/physics/twinParadoxExperiment.ts`), interface, prediction, results panel, and tutor are built, and it has had its complete-flow test in a browser and its final review against its specification (§21 Step 10; no gaps found). It applies Experiment 3's exact time-dilation function to a round-trip journey, resolving the classic "twin paradox" by showing that only the traveling twin turns around, breaking the symmetry between the two twins. The turnaround is treated as an idealized, instantaneous, unmodeled event — a deliberate, explicitly-stated simplification, since every prior experiment excludes acceleration. The owner's line-by-line wording approval (§28.1) has not yet been done, except for a new "A daily-life picture" paragraph (the felt push of a car braking/accelerating, as the physical marker of the turnaround), added to its introduction and approved by the owner as written (2026-09-29), part of the same project-wide addition.
* **Experiment 11 (the rod's own axes):** approved specification (`docs/experiments/relativity-of-time-and-motion/11-rods-own-axes.md`), physics model (`lorentzTransform` in `src/physics/lorentzTransform.ts`, plus `rodTimeAxisFor`/`rodSpaceAxisFor` in `src/physics/spacetimeDiagramView.ts`), interface, prediction, results panel, and tutor are built, and it has had its complete-flow test in a browser, its final review against its specification (§21 Step 10; no gaps found), and the owner's line-by-line wording approval (§28.1). It introduces the Lorentz transformation, reusing Experiment 3's time dilation factor by division (via the new `timeDilationFactorFor` helper) rather than a new symbol, and draws the rod's own two axes on the Experiment 8/9 diagram. Applying the transformation to Experiment 7's two events confirms, by direct calculation, that they are simultaneous in the rod's frame. Per its specification, this completes "Relativity of Time and Motion."
* **Gravity and Curved Spacetime, Experiment 1 (the equivalence principle):** approved specification (`docs/experiments/gravity-and-curved-spacetime/01-equivalence-principle.md`; numbering restarts within this phase), tested physics model (`src/physics/equivalencePrincipleExperiment.ts`), interface, prediction, results panel, and tutor are built and wired into the guided journey (`src/components/EquivalencePrincipleExperiment.tsx`, `src/components/EquivalencePrincipleTutor.tsx`). It shows a sealed cabin under gravity and an identical sealed cabin under rocket acceleration in deep space, both driven by the same shared formula, so the learner discovers that a ball dropped in either cabin moves identically — the equivalence principle. It has had its complete-flow test in a browser and its final review against its specification (§21 Step 10; three gaps found and fixed there — the cabins had been labeled with which scene they were, contradicting the spec's "unlabeled interiors" requirement; the required height-vs-time graph was missing entirely; and the page heading duplicated the group heading already shown above it). The owner's line-by-line wording approval (§28.1) and all six of the specification's "Decisions Needing Human Review" items (title, cabin/rocket framing, fixed initial height, g-multiple units, scope, and sequencing as this phase's Experiment 1) are complete (2026-09-25). The rocket framing was confirmed over an elevator alternative because it makes "no gravity acting at all" visually and narratively unambiguous. Its introduction gained a "A daily-life picture" paragraph (the felt push of a car accelerating), approved by the owner as written (2026-09-29), part of a project-wide addition of deeper-theory/daily-life material to every experiment's introduction (see the Gravitational Waves Experiment 1 specification's "Implementation Notes" for the full list).
* **Gravity and Curved Spacetime, Experiment 2 (does gravity change time?):** approved specification (`docs/experiments/gravity-and-curved-spacetime/02-gravitational-time-dilation.md`, approved 2026-09-25), tested physics model (`src/physics/gravitationalTimeDilationExperiment.ts`), interface, prediction, results panel, and tutor are built and wired into the guided journey (`src/components/GravitationalTimeDilationExperiment.tsx`, `src/components/GravitationalTimeDilationTutor.tsx`). It reuses the Experiment 1 rocket cabin, now with a floor clock and a ceiling clock, and shows via a first-order light-transit/redshift argument that the ceiling clock ticks faster — then applies Experiment 1's equivalence principle to conclude the same must be true for real clocks at different heights in a gravitational field (gravitational time dilation). Uses an abstracted dimensionless `strength` control (standing in for `a·h/c²`) since the real effect is unobservably small at human scales, and states this explicitly as a first-order approximation, not the exact theory. It has had its complete-flow test in a browser and its final review against its specification (§21 Step 10; one gap found and fixed there — the required tick-count-vs-time graph was missing; see the specification's "Implementation Notes"). The owner's line-by-line wording approval (§28.1) is complete (2026-09-25); it revised the introduction's explanation of "strength," which was originally circular ("a stand-in for how strong the effect is") and now explains it as standing in for acceleration and clock separation combined. After that approval, the owner asked for two further additions to the tutor's explanation, both approved and added: a "A worked example" paragraph giving a concrete 1g, 10-meter-cabin numeric walkthrough of the redshift argument, and a "A note on 'time dilation'" paragraph pair contrasting this effect with Experiment 4's motion-based time dilation (symmetric, from relative motion) versus this one (one-way, from position in a field with a shared "up"/"down" direction). Both are recorded in the specification's "Implementation Notes." Its introduction later gained a "Why even ask this" paragraph, approved by the owner as written (2026-09-29), part of the same project-wide addition.
* **Gravity and Curved Spacetime, Experiment 3 (why gravity isn't just acceleration):** approved specification (`docs/experiments/gravity-and-curved-spacetime/03-tidal-effects.md`, approved 2026-09-26), tested physics model (`src/physics/tidalEffectExperiment.ts`), interface, prediction, results panel, and tutor are built and wired into the guided journey (`src/components/TidalEffectExperiment.tsx`, `src/components/TidalEffectTutor.tsx`). It reuses the Experiment 1 cabins, widened to drop two balls side by side: on the planet the balls drift together because gravity points toward a center (a first-order tidal approximation, via the abstracted `convergenceStrength` control), while in the rocket the balls stay exactly apart because uniform acceleration has no center to point toward — showing that Experiment 1's equivalence principle only holds locally, for a small enough cabin. Named "tidal effect," but deliberately holds back "curvature"/"curved spacetime" for a later experiment. It has had its complete-flow test in a browser and its final review against its specification (§21 Step 10; three gaps found and fixed there — the introduction was missing its required "Your job" paragraph; the introduction stated only two of the four required assumptions, omitting the first-order approximation and the non-relativistic assumption; and the tutor's ocean-tides mention exceeded the specification's "single naming sentence" limit — see the specification's "Implementation Notes"). The owner's line-by-line wording approval (§28.1) is complete (2026-09-26), approved as written with no changes requested. Its introduction later gained a "Why even ask this" paragraph, approved by the owner as written (2026-09-29), part of the same project-wide addition.
* **Gravity and Curved Spacetime, Experiment 4 (curved spacetime: why parallel paths don't stay parallel):** approved specification (`docs/experiments/gravity-and-curved-spacetime/04-curved-spacetime-geodesics.md`, approved 2026-09-26), tested physics model (`src/physics/curvedSpacetimeExperiment.ts`), interface, prediction, results panel, and tutor are built and wired into the guided journey (`src/components/CurvedSpacetimeExperiment.tsx`, `src/components/CurvedSpacetimeTutor.tsx`). It shows two travelers walking "as straight as possible" (a **geodesic**) starting a fixed distance apart: on a flat surface they stay exactly parallel, while on a sphere they converge and meet at "the pole" — reusing Experiment 3's tidal-convergence result by direct reference (no recomputation) to conclude that this convergence is what "curved spacetime" means, and why a rocket's flat spacetime can never reproduce it. It has had its complete-flow test in a browser and its final review against its specification (§21 Step 10; one gap found and fixed there — the curved scene did not visually show curvature, contradicting the spec's "viewed from an angle that shows its curvature" requirement; fixed by drawing each traveler's path as a curve converging toward a labeled "pole" inside an ellipse suggestive of a globe; see the specification's "Implementation Notes"). All eight of the specification's "Decisions Needing Human Review" items are confirmed (2026-09-26). The owner's line-by-line wording approval (§28.1) is complete (2026-09-26); the "What happens" and "Your job" introduction lines were revised for clarity, recorded in the specification's "Implementation Notes". Its introduction later gained a "Why even ask this" paragraph, deliberately framed to avoid revealing the sphere-convergence result, approved by the owner as written (2026-09-29), part of the same project-wide addition.
* **Gravity and Curved Spacetime, Experiment 5 (what curves spacetime? mass and distance):** approved specification (`docs/experiments/gravity-and-curved-spacetime/05-what-curves-spacetime.md`, proposed by Claude and refined in conversation on 2026-09-27 per §23 Stages 1–2, with its "Decisions Needing Human Review" items confirmed 2026-09-27), tested physics model (`src/physics/spacetimeCurvatureSourceExperiment.ts`), interface, prediction, results panel, and tutor are built and wired into the guided journey (`src/components/SpacetimeCurvatureSourceExperiment.tsx`, `src/components/SpacetimeCurvatureSourceTutor.tsx`). It reuses Experiment 2's and Experiment 3's own unmodified physics and rendering, deriving their `strength`/`convergenceStrength` controls from learner-facing mass and distance presets, so the learner sees both effects respond together and at different rates. It has had its complete-flow test in a browser and its final review against its specification (§21 Step 10; five gaps found and fixed there — a prediction-prompt duplication bug that kept a wording fix from ever reaching the learner, the two panels not actually rendering side by side, a missing assumption bullet, "Run" never animating either panel, and a stale-object-identity bug in the animation effect discovered while fixing that — see the specification's "Implementation Notes"). The owner's line-by-line wording approval (§28.1) is complete (2026-09-27); the introduction, the "bigger mass" tidal prediction question, and the tutor's explanation were each given a small reminder of what "tidal effect" means (Experiment 3's two balls drifting together), at the owner's request. Its introduction later gained a "A daily-life picture" paragraph (a trampoline and bowling ball), approved by the owner as written (2026-09-29), part of the same project-wide addition.
* **Gravity and Curved Spacetime, Experiment 6 (why do planets orbit instead of falling in?):** approved specification (`docs/experiments/gravity-and-curved-spacetime/06-orbits.md`, proposed by Claude per §23 Stages 1–2 on 2026-09-27 in response to the milestone after Experiment 5, with its "Decisions Needing Human Review" items confirmed 2026-09-27), tested physics model (`src/physics/orbitExperiment.ts`), interface, prediction, results panel, and tutor are built and wired into the guided journey (`src/components/OrbitExperiment.tsx`, `src/components/OrbitTutor.tsx`). It launches a small object near a fixed central mass at a learner-chosen sideways speed and numerically integrates ordinary Newtonian gravity in two dimensions — the project's first genuinely 2D physics model — so falling in, escaping, and orbiting all fall out of one calculation rather than being special-cased, classified using the body's conserved specific orbital energy rather than a naive distance threshold (a correctness refinement found during implementation; see the specification's "Implementation Notes"). It has had its complete-flow test in a browser and its final review against its specification (§21 Step 10; two gaps found and fixed there — the introduction stated only 3 of the 5 required assumptions, and the tutor's explanation never stated the Newtonian-approximation caveat that Success Criterion 4 requires — see the specification's "Implementation Notes"). The owner's line-by-line wording approval (§28.1) is complete (2026-09-27); the tutor's explanation of too-little/too-much/just-right sideways motion was given a daily-life Newton's-cannonball analogy, at the owner's request. Per its specification, this is the last approved experiment in this chapter before Experiment 7; light bending remains a candidate future direction, not approved. Its introduction later gained a "Why even ask this" paragraph, deliberately without the tutor's own Newton's-cannonball analogy, to avoid spoiling the push-strength predictions; approved by the owner as written (2026-09-29), part of the same project-wide addition.
* **Gravity and Curved Spacetime, Experiment 7 (what is a black hole?):** approved specification (`docs/experiments/gravity-and-curved-spacetime/07-black-holes.md`, approved 2026-09-27, with all "Decisions Needing Human Review" items confirmed), tested physics model (`src/physics/blackHoleExperiment.ts`), interface, prediction, results panel, and tutor are built and wired into the guided journey (`src/components/BlackHoleExperiment.tsx`, `src/components/BlackHoleTutor.tsx`). It reuses Experiment 6's escape-speed formula unchanged and adds a new purely-radial trajectory calculation (a probe launched straight outward at exactly the fixed `SPEED_OF_LIGHT` constant), so the learner sees that past a specific mass the light-speed launch can no longer escape — the event horizon. It has had its complete-flow test in a browser (both the escapes and falls-back cases) and its final review against its specification (§21 Step 10; one gap found and fixed there — the tutor's explanation never stated the Newtonian-approximation caveat that Success Criterion 5 requires, matching the same gap found in Experiment 6's review — see the specification's "Implementation Notes"). The owner's line-by-line wording approval (§28.1) is complete (2026-09-27): two introduction lines were revised for clarity (defining "concentrated" and explaining the fixed launch point), and the owner then asked for real-world grounding to be added throughout — a scope change from the specification's original exclusions, now revised there (see its "Not introduced" and "Implementation Notes" sections). Added: a "Real black holes" introduction paragraph, a real-world-grounding sentence in the results panel, two further tutor explanation points (the Event Horizon Telescope's images, and a light-touch, clearly-flagged mention of singularities and Hawking radiation), a labeled legend plus a live distance/direction readout under the animation replacing the original on-canvas label approach, and a matching sentence in the chapter summary. Re-verified in a browser; the rest of the review was then approved as written. Committed to git (`b2d0b9d`, with a follow-up wording/styling fix in `50cc6de`).
* **Gravity and Curved Spacetime, Experiment 8 (does gravity bend light?):** approved specification (`docs/experiments/gravity-and-curved-spacetime/08-light-bending.md`, approved 2026-09-28, with all "Decisions Needing Human Review" items confirmed), tested physics model (`src/physics/lightBendingExperiment.ts`), interface, prediction, results panel, and tutor are built and wired into the guided journey (`src/components/LightBendingExperiment.tsx`, `src/components/LightBendingTutor.tsx`). It reuses Experiment 6's trajectory-integration approach and Experiment 7's `SPEED_OF_LIGHT` constant, launching a light probe on a straight-line-with-offset path near a fixed mass so the learner sees light bend even when not aimed directly at the mass, then explicitly computes and displays the real general-relativistic deflection angle as exactly double the simulated (ordinary-gravity) one — a deliberate exception to this chapter's usual "state the real theory only as a caveat" pattern, grounded in the 1919 Eddington eclipse expedition and modern gravitational lensing. It has had its complete-flow test in a browser and its final review against its specification (§21 Step 10; three gaps found and fixed there — the falls-in/deflects boundary was described as coinciding exactly with Experiment 7's event horizon when gravitational focusing actually pulls it farther out, the live readout was missing the measured bending angle, and the learner-facing aim-distance range was narrowed from 0.3–8 to 0.3–4 to keep the simulated and Newtonian-formula angles in agreement — see the specification's "Implementation Notes"). Committed to git (`ac89fba`). The owner's line-by-line wording approval (§28.1) is complete (2026-09-28), approved as written with no changes requested. Per its specification, this is a plausible closing point for this chapter, same as Experiment 7 was; no further experiment is yet approved.
* **Gravity and Curved Spacetime, Experiment 9 (real clocks in orbit — GPS and the balance of two effects):** approved specification (`docs/experiments/gravity-and-curved-spacetime/09-gps-time-dilation.md`, proposed by Claude per §23 Stages 1–2 on 2026-09-28 following the milestone after Experiment 8, with all "Decisions Needing Human Review" items confirmed), tested physics model (`src/physics/gpsTimeDilationExperiment.ts`), interface, prediction, results panel, tutor, and a closing synthesis section are built and wired into the guided journey (`src/components/GpsTimeDilationExperiment.tsx`, `src/components/GpsTimeDilationTutor.tsx`). It reuses Experiment 6's circular-orbit speed relation and Experiment 3's exact `timeDilationFactorFor` directly, combined for the first time with a new real-unit gravitational-potential formula, so the learner sees a satellite clock's motion-based slowing (Experiment 3/4's effect) and altitude-based speeding (Experiment 2's effect) compete — this is the first experiment in the project to use real Earth numbers rather than an abstracted or exaggerated control, a deliberate, owner-confirmed exception. It shows the crossover altitude (≈3,186 km, exactly 1.5× Earth's radius) and the real GPS altitude, where the net effect matches the real, published ≈+38 microseconds/day correction. It has had its complete-flow test in a browser and its final review against its specification (§21 Step 10; one gap found and fixed there — the third prediction question reused a component whose internal choice values didn't match the stored prediction values, crashing the page; fixed by aligning the stored type and converting only at display time — see the specification's "Implementation Notes"). Confirmed by the owner (2026-09-28) as the closing experiment of this chapter and of the project's current two-chapter arc as a whole. Ends with a "Closing Synthesis: Putting It All Together" section (shown after the tutor's explanation) that names special relativity's two postulates and general relativity's two core ideas for the first time in the project, tying each to the specific experiment that already demonstrated it — proposed by the owner, drafted by Claude. The owner's line-by-line wording approval (§28.1) is complete (2026-09-28), approved as written with no changes requested, in two passes (the closing synthesis first, then the rest of the experiment's wording). Its final review against `docs/PROJECT.md`, `AGENTS.md`, and its specification (§21 Step 10) is complete (2026-09-29): no gaps found. Its introduction later gained a "A daily-life picture" paragraph (a swimmer caught between a current and a headwind), approved by the owner as written (2026-09-29), part of a project-wide addition of deeper-theory/daily-life material to every experiment's introduction (see the Gravitational Waves Experiment 1 specification's "Implementation Notes" for the full list); not yet committed. Earlier state committed to git (`265488d`, `438b71a`).
* **Gravitational Waves, Experiment 1 (ripples in spacetime):** approved specification (`docs/experiments/gravitational-waves/01-gravitational-waves.md`, proposed by Claude per §23 Stages 1–2 on 2026-09-29 following the milestone after Gravity and Curved Spacetime's Experiment 9, with all "Decisions Needing Human Review" items confirmed and approved as written), tested physics model (`src/physics/gravitationalWaveExperiment.ts`), interface, prediction, results panel, and tutor are built and wired into the guided journey as a new "Gravitational Waves" phase (`src/components/GravitationalWaveExperiment.tsx`, `src/components/GravitationalWaveTutor.tsx`). It shows an L-shaped pair of free-floating detector arms whose lengths oscillate equally and oppositely as an abstracted, exaggerated gravitational wave passes, reusing Experiment 4's geodesic-deviation idea (a changing separation between free-floating objects caused by curvature, not a force) applied to a moving rather than static curvature — the project's first experiment to model an oscillating process over simulated time in this phase. Real-world grounding names LIGO's real ~4 km arm length, the real strain magnitude, and both GW150914 (2015) and GW170817 (2017). It has had its complete-flow test in a browser and its final review against its specification, `docs/PROJECT.md`, and `AGENTS.md` (§21 Step 10; two gaps found and fixed there — a required arm-length-vs-time graph was missing entirely, and two of the specification's four simplifying assumptions were missing from the introduction — see the specification's "Implementation Notes", which also flags a wording inconsistency found in the specification's own "Required Physics Tests" item 6). The owner's line-by-line wording approval (§28.1) is complete (2026-09-29), approved as written with no changes requested, covering its introduction, prediction prompts, results panel, tutor, and chapter-summary line. Its physics, UI, and tutor were already committed to git (`e7b2815`, `2557499`, `4858836`, `79f2ba6`).
* **Gravitational Waves, Experiment 2 (the chirp: a wave that builds):** approved specification (`docs/experiments/gravitational-waves/02-the-chirp.md`, approved by the owner in conversation on 2026-09-29, following the milestone after Experiment 1), tested physics model (`src/physics/gravitationalWaveChirpExperiment.ts`), interface, prediction, results panel, and tutor are built and wired into the guided journey (`src/components/GravitationalWaveChirpExperiment.tsx`, `src/components/GravitationalWaveChirpTutor.tsx`). It reuses Experiment 1's exact strain/arm-length formula unchanged and the Black Hole experiment's mass scale and range, adding a new, self-contained, explicitly-labeled toy formula (`growthFactor = 1/sqrt(1-s)`) so frequency and amplitude both build as an inspiraling pair approaches an idealized final moment (a cutoff at 90% of the toy formula's divergence point), rather than Experiment 1's constant tone — the same "idealized instantaneous event" treatment this project already gives the Twin Paradox's turnaround. It has had its complete-flow test in a browser and its final review against its specification, `docs/PROJECT.md`, and `AGENTS.md` (§21 Step 10, 2026-09-30; four gaps found and fixed there — a page heading that duplicated the group heading above it, a missing fourth simplifying-assumption bullet (the mass control's scale reused from the Black Hole experiment), the term "chirp" used in the title before being defined in the introduction, and Success Criterion 5's toy-formula caveat missing from the results panel and tutor — see the specification's "Implementation Notes"). After that review, the introduction gained a "A daily-life picture" paragraph (a coin spun flat on a table, wobbling faster and louder right up until it stops) and a fourth "what we assume" bullet became five total with the mass-scale one already counted; the Results panel gained a plain-language definition of "strain," a loudness multiplier ("about 3.2× louder than it started"), and — once the learner has tried two different masses — a "Comparing your two runs" callout noting that multiplier is the same regardless of mass; and the live one-line readout below the Run button was changed to stay hidden until a run has actually started, matching the Black Hole experiment's own precedent, rather than showing idle rest-state numbers before the learner does anything. A "Change predictions" control (matching the one added to the Orbit experiment) was also added, letting the learner revisit their three predictions after submitting without losing their chosen mass. The owner's line-by-line wording approval (§28.1) is complete (2026-09-30), approved as written with no changes requested. The graph's live animation (arm lengths vs. simulated time) could not be visually confirmed in the automated browser session used for testing, since its backgrounded tab throttles `requestAnimationFrame`; the numeric readout and final-frame values were confirmed correct instead, and the graph code is a direct reuse of Experiment 1's already-shipped implementation. Committed to git (`fd4b56c`).
* **Gravitational Waves, Experiment 3 (where the energy comes from):** approved specification (`docs/experiments/gravitational-waves/03-orbital-energy-loss.md`, proposed by Claude per §23 Stages 1–2 on 2026-09-30 following the milestone after Experiment 2; the owner considered and declined two alternative directions — triangulation with two detectors, and a combined energy+triangulation proposal — choosing this one alone to keep to a single new idea per §16), tested physics model (`src/physics/gravitationalWaveEnergyExperiment.ts`), interface, prediction, results panel, and tutor are built and wired into the guided journey (`src/components/GravitationalWaveEnergyExperiment.tsx`, `src/components/GravitationalWaveEnergyTutor.tsx`). It reuses Experiment 2's exact `chirpRunFor`/progress-fraction calculation unchanged and adds one new, self-contained, explicitly-labeled toy formula (`remainingOrbitalEnergy = totalOrbitalEnergy * (1 - s)`) so the learner sees the orbital energy draining away over the same run as Experiment 2's chirp — the cause behind that already-observed effect. It has had its complete-flow test in a browser and its final review against its specification, `docs/PROJECT.md`, and `AGENTS.md` (§21 Step 10, 2026-09-30; one gap found and fixed there — the specification requires the new energy graph to be shown alongside, not instead of, Experiment 2's own arm-length-vs-time graph, which the initial implementation had omitted entirely — see the specification's "Implementation Notes"). Several presentation judgment calls left open by the specification (the `BASE_ORBITAL_ENERGY` constant and its display units, showing both remaining and radiated energy, the straight-line energy-loss curve) were resolved by Claude's own judgment at the owner's explicit instruction. After that review, several rounds of owner feedback in conversation added a "What is energy?"/"How does a wave transmit energy?" pair of paragraphs to the introduction (using a pond-ripple analogy for the transmission mechanism), fixed a real bug where changing mass after a completed run left stale results on screen, rescaled and darkened the energy graph's line (it was nearly invisible at the fixed 0–6 axis for most masses), and corrected wording that overclaimed the learner was "watching the gravitational wave" (as in Experiments 1–2, only the wave's effect — the arms stretching and squeezing — is ever shown). The owner's wording review is complete (2026-09-30), done iteratively in conversation rather than as a single line-by-line pass. Committed to git.
* **Gravitational Waves, Experiment 4 (comparing two real events):** approved specification (`docs/experiments/gravitational-waves/04-comparing-real-events.md`, approved 2026-10-03, with a free mass slider added alongside the two presets per that approval), tested physics model (`src/physics/gravitationalWaveRealEventsExperiment.ts`), interface, prediction interaction, results panel, and AI tutor are built and wired into the guided journey (`src/components/GravitationalWaveRealEventsExperiment.tsx`, `src/components/GravitationalWaveRealEventsTutor.tsx`). It reuses Experiments 2 and 3's chirp/energy-loss model exactly, adding only a small preset mapping from two real, named detections (GW150914, GW170817) onto the existing toy mass scale, so the learner sees the same model applied to real events and is introduced to "multi-messenger astronomy" (GW170817's light counterpart). Its detector-arm animation was refined over several rounds of owner feedback: the two arms' wavy strain overlay gained direct on-canvas labels, then a real bug was found and fixed where both arms shared one unsigned wave amplitude (making them look identical regardless of mass, contradicting the underlying physics' opposite-sign `armXLength`/`armYLength`); the caption below the animation went through two simplification passes after feedback that it was too cluttered/dense, settling on a short intro sentence plus three bullet points naming the arms, strain, the source, and the idealized merger. It has had its complete-flow test in a browser and its final review against its specification, `docs/PROJECT.md`, and `AGENTS.md` (§21 Step 10, 2026-10-04; one gap found and fixed there — the Results panel's light-counterpart sentence was hardcoded by preset id instead of reading the `hadLightCounterpart` field `REAL_EVENT_PRESETS` already defines for that purpose — see the specification's "Implementation Notes"). The owner's wording review is complete (2026-10-04), approved as-is with no changes requested. Committed to git.
* **Gravitational Waves, Experiment 5 (stretched by motion: redshift of a receding source):** approved specification (`docs/experiments/gravitational-waves/05-redshift-of-a-receding-source.md`, proposed by Claude per §23 Stages 1–2 on 2026-10-04 — already named as the planned next step in Experiment 4's own specification — approved 2026-10-04), tested physics model (`src/physics/gravitationalWaveRedshiftExperiment.ts`), interface, prediction interaction, results panel, and AI tutor are built and wired into the guided journey (`src/components/GravitationalWaveRedshiftExperiment.tsx`, `src/components/GravitationalWaveRedshiftTutor.tsx`). It reuses Experiment 2's exact chirp model and the Relativity of Time and Motion chapter's exact `timeDilationFactorFor` unchanged, adding only a small new classical-Doppler-factor function; the two combine into the exact relativistic Doppler formula, built from pieces the learner already has. The detector's arms are driven by reparametrizing the time fed into `chirpStateAt` (scaled by the Doppler factor) rather than any new chirp physics, so a receding source's arms visibly pulse at the slower, stretched "detected" rate in real time — matching the two-postulate combination pattern GPS (Gravity chapter Experiment 9) already established. Its animation went through several rounds of owner feedback: two pulsing "Emitted"/"Detected" beacons were added, then enlarged, then a "cycles behind" running counter was added (exposing a `phase` field from `gravitationalWaveChirpExperiment.ts`'s `ChirpState` — a purely additive change, confirmed not to break any existing test), then the counter was rebuilt as a prominent bordered badge after the owner reported the first version was too small and low-contrast to see, then a wave-trace strip was added under each beacon so the stretching also shows as a shape (a visibly longer wavelength under "Detected"), then a real bug was found and fixed where the traces' traveling-wave phase advanced too little over the observer window to visibly scroll in 7 seconds of real playback (fixed with a visual-only scroll-speed multiplier applied equally to both traces, preserving their relative comparison exactly). It has had its complete-flow test in a browser (run twice — once before and once after the animation work, no gaps either time) and its final review against its specification, `docs/PROJECT.md`, and `AGENTS.md` (§21 Step 10, 2026-10-04; no gaps found — see the specification's "Implementation Notes"). The owner's wording review is complete (2026-10-04), approved as written with no changes requested.
* **Gravitational Waves, Experiment 6 (triangulation: finding where a signal came from):** approved specification (`docs/experiments/gravitational-waves/06-triangulation.md`, approved 2026-10-04), tested physics model (`src/physics/gravitationalWaveTriangulationExperiment.ts`), interface, prediction interaction, results panel, and AI tutor are built and wired into the guided journey (`src/components/GravitationalWaveTriangulationExperiment.tsx`, `src/components/GravitationalWaveTriangulationTutor.tsx`). It introduces one new, self-contained idea — a plane-wave arrival-time formula over the three real detector positions (Hanford, Livingston, Virgo), reusing only the invariant `c` already established in the Relativity of Time and Motion chapter — and shows that comparing arrival-time gaps across a detector network (the same reasoning behind telling a sound's direction from a gap between your two ears) narrows down a signal's direction, tying back to GW170817's real multi-messenger follow-up (Experiment 4). No chirp, strain, Doppler, or energy-loss physics from Experiments 1–5 is touched. It has had two complete-flow tests and two final reviews against its specification, `docs/PROJECT.md`, and `AGENTS.md` (§21 Step 10): the first (2026-10-04, in a prior session) found no gaps; the second (2026-10-05, this session) followed a caption fix — the "How to read this diagram" caption originally implied the two illustrative wedges' overlap pinned down one exact direction, when the overlap (itself hand-drawn, not computed) still spans a range; fixed by stating plainly that the overlap narrows to a *smaller* range, not one exact direction, matching how real detector networks narrow a source to a patch of sky, not a point — and found one further gap against Success Criterion 7 (the introduction never tied back to GW170817, though the Results panel and tutor already did; fixed with one added sentence). Full suite (294/294) and `tsc --noEmit` clean; no console errors. See the specification's "Implementation Notes" for full detail. The owner's line-by-line wording approval (§28.1) for the experiment as a whole was explicitly skipped, not granted, at the owner's direction (2026-10-05), when closing out this chapter — only the wedge-overlap caption paragraph was approved, as written. Committed to git (`ca04757`).
* **Cosmology, Experiment 1 (Hubble's Law: the farther, the faster):** approved specification (`docs/experiments/cosmology/01-hubbles-law.md`, proposed by Claude per §23 Stages 1–2 on 2026-10-05 following the closure of the "Gravitational Waves" chapter, with all five "Decisions Confirmed" items resolved, one of them after the owner rejected Claude's first proposal — see below). Opens a new "Cosmology" chapter/group. It reuses Gravitational Waves Experiment 7's "Mpc" unit unchanged and introduces one new, self-contained formula — the real low-redshift relationship `z ≈ H0 × d / c`, combined with Hubble's Law (`v = H0 × d`) — so the learner sees a galaxy's light redshift grow with its distance, using an illustrative real Hubble constant (70 km/s/Mpc) and explicitly flagging the real "Hubble tension" (67–73 km/s/Mpc) as a caveat. Claude's first draft proposed reusing Gravitational Waves Experiment 5's velocity-based `dopplerFactorFor`, caveated as a simplification; the owner rejected this as the easy choice rather than the best one, since that formula models a source moving *through* space, which is not what causes cosmological redshift (space itself expanding), a difference in mechanism that both Experiment 5 and Experiment 7 had already flagged as a separate, to-be-addressed-later idea — reusing it anyway, even caveated, would have taught the actual misconception. The specification was revised accordingly to use the new, correctly-framed formula instead, which is also simpler to implement. Its physics model and physics tests are now built (`src/physics/hubblesLawExperiment.ts`, `src/physics/hubblesLawExperiment.test.ts`): `recessionSpeedKmPerS`, `cosmologicalRedshift` (the new `z = H0 × d / c` formula), `wavelengthStretchFactor`, `GALAXY_PRESETS` (Virgo Cluster 16.5 Mpc, Coma Cluster 100 Mpc, a schematic "A very distant galaxy" at 200 Mpc), and `runHubblesLawExperiment`. The custom-slider ceiling (`MAX_CUSTOM_DISTANCE_MPC = 200`) was chosen to keep `z` under 5% at every distance the UI will offer, per "Decisions Confirmed" item 4. All 6 of "Required Physics Tests" are covered, including a regression check confirming the module's `import` statements never reference `gravitationalWaveRedshiftExperiment`/`dopplerFactorFor` (explanatory comments do mention those names deliberately; the check only scans import lines). New suite: 8/8 passing. Full project suite: 309/309 passing. `tsc --noEmit` clean.

Basic UI is also built (`src/components/HubblesLawExperiment.tsx`): a Galaxy control (Virgo Cluster, Coma Cluster, a schematic "A very distant galaxy," and a custom 1–200 Mpc slider), Run, a live readout (distance, recession speed, redshift `z`, wavelength stretch factor), and a labeled diagram (the galaxy, Earth as the detector) showing a light pulse travel from galaxy to Earth, its color shifting gradually toward red during the trip rather than already red at emission — matching the specification's "space expands during transit" framing. The color mapping is exaggerated for visibility (`VISUAL_REFERENCE_REDSHIFT = 0.05`, display-only per `CLAUDE.md` §11) since the real stretching at this experiment's distances is too small to see as a color change otherwise; the live readout always shows the exact, un-exaggerated numbers. Wired into the guided journey (`src/App.tsx`, as "Hubble's Law" under a new "Cosmology" group added to `groupOrder`; the Standard Sirens chapter's "next" text now points to it). This step deliberately has no prediction gating, results panel, or tutor yet; introductory text is also not yet drafted.

Verified in a browser (`http://localhost:5173/`): Virgo Cluster (16.5 Mpc) correctly showed recession speed 1155 km/s, z = 0.0039, stretch factor 1.0039×, and a barely-tinted (near-white) arriving pulse; "A very distant galaxy" (200 Mpc) correctly showed 14000 km/s, z = 0.0467, stretch factor 1.0467×, and a clearly, visibly red pulse and detector glow — confirming farther galaxies are clearly visually distinguishable from nearer ones (`CLAUDE.md` §14), not just numerically different. The Custom control correctly revealed a slider (defaulting to 50 Mpc). No console errors. Full suite (309/309) and `tsc --noEmit` remain clean.

Introductory text and the learner prediction interaction are also now built. The introduction covers the question, what happens, the learner's job, what to look for, the new terms ("Hubble's Law," "Hubble constant," "cosmology") defined in plain language, and all four assumptions from the specification (the expansion-not-motion caveat, the low-redshift approximation's limits, the Hubble constant's illustrative value and tension range, and the excluded blueshifted-nearby-galaxy case). Both required prediction questions gate the Galaxy control and Run until answered, matching the project's established pattern — predictions lock in on first "Run" and a "Change predictions" control reopens both without resetting the chosen galaxy. A "How to read this diagram" caption (per `CLAUDE.md` §14) was also added, shown once predictions are submitted.

Verified in a browser (`http://localhost:5173/`): both prediction questions correctly gate the Galaxy control and Run button; answering both ("Twice as fast" / "The farther one") unlocks them and shows "Your predictions: Twice as fast, The farther one"; running locks both predictions in and shows the "Change predictions" control; clicking it correctly reopens both questions (with prior choices still highlighted) while preserving the chosen galaxy. The diagram, live readout, and caption all render correctly after a run. No console errors. Full suite (309/309) and `tsc --noEmit` remain clean.

The Results panel is also built, per the specification's "Results" section: states the chosen distance, recession speed, redshift (`z`), and wavelength stretch factor, compares both of the learner's predictions to the guaranteed outcome (speed and redshift are both exactly proportional to distance, independent of which galaxy was chosen), states the Hubble constant value used, and shows a visually prominent, bordered amber caveat box stating the real Hubble-tension range (67–73 km/s/Mpc), matching Gravitational Waves Experiment 7's precedent for a real-value uncertainty caveat (`CLAUDE.md` §28.1 pattern).

Verified in a browser (`http://localhost:5173/`) with deliberately wrong predictions ("Half as fast" / "The nearer one") on the 200 Mpc preset: the Results panel correctly showed 14000 km/s, z = 0.0467, stretch factor 1.0467×, correctly flagged both predictions as "off this time," and displayed the prominent Hubble-tension caveat box. No console errors. Full suite (309/309) and `tsc --noEmit` remain clean.

The AI tutor is also now built (`src/components/HubblesLawTutor.tsx`), following the predict → observe → explain pattern: an observation question about the color/distance relationship, a comparison against the learner's own two predictions, a conceptual question nudging toward "what does this suggest about the universe as a whole" without stating it outright, then a five-point explanation (Hubble's Law's proportionality, expansion-not-motion as the cause, why the Hubble constant matters, the real Hubble-tension caveat, and the low-redshift-only caveat) — matching its specification's "AI Tutor Behavior" section exactly. Wired into `src/App.tsx`'s chapter summary via `onComplete`/`onTutorComplete`.

A complete-flow test was run in a browser (`http://localhost:5175/`): both prediction questions, the "A very distant galaxy (200 Mpc)" preset, Run, the diagram and live readout, the Results panel, and all three tutor reflection steps through to the final explanation all worked correctly; `localStorage`'s `spacetime-explorer-progress` confirmed both `completed` and `explained` were recorded for this chapter. No console errors (aside from an unrelated Grammarly browser extension). Full suite (309/309) and `tsc --noEmit` remain clean.

While testing, the chapter-summary "What's next" line was found to still read "This is currently the last experiment in the project," missing the Big Bang forward-hint approved in "Decisions Confirmed" item 5; fixed in `src/App.tsx` to read: "Running this relationship backward in time suggests everything was once much closer together — a possible next experiment on the Big Bang, not yet built."

Its final review against the specification, `docs/PROJECT.md`, and `AGENTS.md` (§21 Step 10) is complete (2026-10-05): three gaps found and fixed there. (1) Success Criterion 6 requires the space-expansion-not-motion cause and the nearby-galaxies-only approximation caveat to be stated in the introduction, Results panel, *and* tutor — the Results panel was missing both; fixed by adding a paragraph stating them explicitly. (2) The introduction's "What we assume" list was missing the specification's fifth simplifying assumption (the galaxies are not physically simulated — no orbits, structure, or individual physics); added as a fifth bullet. (3) Success Criterion 8 requires "Doppler effect" to be explicitly named as the contrasting mechanism (Gravitational Waves Experiment 5's effect), not just described; it was never named anywhere. Fixed by adding it, parenthetically, to the introduction's first assumption bullet, the Results panel's new paragraph, and the tutor's explanation point 2. Also fixed during this session (before the final review, from owner feedback in a browser): the diagram's traveling dot was replaced with an actual traveling wave whose wavelength visibly widens as it nears Earth (not just its color), and the page heading was corrected to drop a duplicated "Cosmology," prefix (matching every other experiment's "Experiment N — Title" pattern, since the group name is already shown above by `App.tsx`). Full suite (309/309) and `tsc --noEmit` remain clean; verified in a browser with no console errors.

The owner's line-by-line wording approval (§28.1) is complete (2026-10-05), approved as written with no changes requested, covering the introduction, prediction prompts, diagram caption, Results panel, and tutor, including the three final-review fixes above.

Per its specification's "Relationship to Later Experiments" section, a future Big Bang experiment (running Hubble's Law backward in time) is recommended as the next logical step once this one is complete, confirmed by the owner, to be proposed formally at that time rather than pre-approved now. This completes Cosmology Experiment 1; per §23 Stage 6, Claude may now propose the next experiment.
* **Cosmology, Experiment 2 (the Big Bang: running expansion backward in time):** approved specification (`docs/experiments/cosmology/02-the-big-bang.md`, proposed by Claude per §23 Stages 1–3 on 2026-10-05 following the completion of Cosmology Experiment 1, with all five "Decisions Confirmed" items resolved after the owner answered two open design questions in conversation — see below — and approved 2026-10-05). It reuses Experiment 1's own `recessionSpeedKmPerS` and `HUBBLE_CONSTANT_KM_PER_S_PER_MPC` unchanged (imported, not redefined) and introduces one new, self-contained idea — running `v = H0 × d` backward in time, so that the time for any galaxy to reach zero distance from Earth (at its own constant recession speed) works out to `1 / H0`, the "Hubble time," independent of distance. The learner sees all three Experiment 1 galaxy presets converge together on one diagram at the same moment, and the computed Hubble time (≈13.97 billion years at the illustrative `H0 = 70 km/s/Mpc`) is compared, in a prominent bordered caveat box, to the real, independently measured age of the universe (≈13.8 billion years) — stated explicitly as a genuinely informative but non-rigorous closeness, not proof that this simplified constant-speed method is the real one astronomers use, since the real expansion rate has changed across cosmic history. A further scientific-integrity point is built into the specification itself: the experiment must state plainly that this is not "everything rushing away from Earth/us" — an observer on any other galaxy would see the identical pattern pointing back to the same shared moment. The owner confirmed, in conversation, two of the specification's five "Decisions Confirmed" items that were left open in the initial proposal (the other three — diagram approach and caveat prominence — had already been settled via an `AskUserQuestion` exchange before the draft was written): the title ("The Big Bang: Running Expansion Backward in Time") and the custom-slider range (reused unchanged from Experiment 1, `MAX_CUSTOM_DISTANCE_MPC = 200`, since the Hubble time does not depend on distance at all) were both accepted as proposed, and "Custom" is confirmed as a fourth marker on the multi-galaxy convergence diagram when selected. It was then built one step at a time through to completion (2026-10-05): tested physics model (`src/physics/bigBangExperiment.ts`), interface, prediction, results panel, and tutor (`src/components/BigBangExperiment.tsx`, `src/components/BigBangTutor.tsx`), with a final review against its specification (§21 Step 10) and the owner's line-by-line wording approval (§28.1). Later additions, at the owner's request, included a time-scale ruler, a pulsing and trailing highlight for the selected galaxy, a "Play forward" control that replays the same computed trajectory outward from the singularity, and the horizon-problem and cosmic-inflation discussion in its introduction and tutor. Committed to git (`3e3b9d7`).
* **Cosmology, Experiment 3 (the Cosmic Microwave Background: the afterglow of the Big Bang):** approved specification (`docs/experiments/cosmology/03-cosmic-microwave-background.md`, approved 2026-10-06 with all four "Decisions Confirmed" items resolved), tested physics model (`src/physics/cosmicMicrowaveBackgroundExperiment.ts`), interface, prediction, results panel, and tutor are built and wired into the guided journey (`src/components/CosmicMicrowaveBackgroundExperiment.tsx`, `src/components/CosmicMicrowaveBackgroundTutor.tsx`). It introduces one new, exact formula, `T = T0 × (1 + z)`, applied at the real recombination redshift (≈1089.8), so the learner sees the oldest light cool from about 3,000 K to 2.725 K as space expands, plus an illustrative sky panel showing the near-uniform temperature behind Experiment 2's horizon problem. It deliberately does not reuse Experiment 1's low-redshift functions (a regression test checks this). The sky panel and caption are hidden until predictions are locked in, so they do not reveal the second prediction's answer (§12). It has had its complete-flow test in a headless browser and its final review against its specification, `docs/PROJECT.md`, and `AGENTS.md` (§21 Step 10, 2026-10-06; one gap found and fixed — the unit kelvin and the symbol z were used without being defined). A first-build crash (a missing `onTutorComplete` prop, causing a blank page when the animation ended) and a diagram label overlap were also found and fixed in testing. Note for future work: `tsc --noEmit` does not type-check this project (it uses project references); use `tsc -b` (as `npm run build` does), which also reports some older errors unrelated to this experiment. At the owner's request, the introduction gained "Where this shows up in everyday life" and "Why it matters" paragraphs. The owner's line-by-line wording approval (§28.1) is complete (2026-10-06), approved as written. Committed to git (`bcab6f0`, `b9bdd9b`, `4c69d93`). See the specification's "Implementation Notes."
* **Cosmology, Experiment 4 (dark matter: why do galaxies spin too fast?):** approved specification (`docs/experiments/cosmology/04-dark-matter.md`, proposed by Claude per §23 Stages 1–3 on 2026-10-06 and approved the same day; three design questions were settled with the owner beforehand and six further items were confirmed as proposed), tested physics model (`src/physics/darkMatterExperiment.ts`), interface, prediction, results panel, and tutor are built and wired into the guided journey (`src/components/DarkMatterExperiment.tsx`, `src/components/DarkMatterTutor.tsx`). It applies the circular-orbit relation `v = sqrt(G × M / r)` (the idea behind Gravity chapter Experiment 6's "just right" speed, restated in real units) to a simplified, Milky Way-like galaxy: the learner adds an invisible "dark matter" halo and watches the predicted rotation curve rise from falling (visible matter only) to flat, matching a given ≈220 km/s observed line. The visible-matter and halo mass shapes are illustrative, with constants tuned by Claude (not a published fit) and labeled as such to the learner. The graph and caption are hidden until predictions are locked in, so the graph does not reveal the first prediction's answer (§12). It has had its complete-flow test in a headless browser (including mid-animation and phone-width checks) and its final review against its specification, `docs/PROJECT.md`, and `AGENTS.md` (§21 Step 10, 2026-10-06; two gaps found and fixed — the introduction claimed the learner had "seen" in the Orbits experiment that orbit speed depends on mass, which that experiment never showed, and the orbiting stars were not labeled on the canvas). The halo glow was strengthened after owner feedback that it was invisible, a Results-table overflow on phones was fixed, and three paragraphs were added to the introduction at the owner's request. The owner's line-by-line wording approval (§28.1) is complete (2026-10-06), approved as written. Several facts in the learner-facing text were written from general knowledge and not checked against a source (see the specification's "Implementation Notes"). Committed to git (`5471414`, `b6583e0`, `ba76a74`). See the specification's "Implementation Notes."
* **Cosmology, Experiment 5 (dark energy: is the expansion speeding up?):** approved specification (`docs/experiments/cosmology/05-dark-energy.md`, proposed by Claude per §23 Stages 1–3 on 2026-10-06 after the owner chose the topic from three options, and approved the same day with all eight "Decisions Needing Human Review" items confirmed as proposed), tested physics model (`src/physics/darkEnergyExperiment.ts`), interface, prediction, results panel, and tutor are built and wired into the guided journey (`src/components/DarkEnergyExperiment.tsx`, `src/components/DarkEnergyTutor.tsx`). It uses Type Ia supernovae as standard candles: for a flat universe with matter and a constant dark energy, it computes the luminosity distance numerically (Simpson's rule, checked against the two closed-form cases) and shows that distant supernovae look dimmer than a matter-only universe predicts, so the expansion has been speeding up. It reuses Experiment 1's Hubble constant and speed of light unchanged and shows that nearby objects agree in every universe, closing the low-redshift caveat Experiment 1 left open. The "observed" reference line is the best-fit model astronomers found, not raw data, and is labeled as such. The graph, matter-only rings, and caption are hidden until predictions are locked in (§12). It has had its complete-flow test in a headless browser (including mid-animation and phone-width checks) and its final review against its specification, `docs/PROJECT.md`, and `AGENTS.md` (§21 Step 10, 2026-10-06; two gaps found and fixed — the term "flat" was undefined, and the Type Ia paragraph overstated a supernova's brightness as exceeding a whole galaxy). A specification table digit was corrected with the owner's approval (brightness at redshift 0.2: 0.84 to 0.83). At the owner's request the caption was rewritten into a longer step-by-step explanation and the introduction gained a "More about Type Ia supernovae" paragraph. The owner's line-by-line wording approval (§28.1) is complete (2026-10-06), approved as written. Several facts in the learner-facing text were written from general knowledge and not checked against a source (see the specification's "Implementation Notes"). Committed to git (`eced73f`, `f534da5`, `98bfe56`). See the specification's "Implementation Notes."
* **Cosmology, Experiment 6 (how old is the universe?):** approved specification (`docs/experiments/cosmology/06-age-of-the-universe.md`, proposed by Claude per §23 Stages 1–3 on 2026-10-06 and approved 2026-10-07 with all eight "Decisions Needing Human Review" items confirmed, item 5 reworded), tested physics model (`src/physics/universeAgeExperiment.ts`), interface, prediction, results panel, and tutor are built and wired into the guided journey (`src/components/UniverseAgeExperiment.tsx`, `src/components/UniverseAgeTutor.tsx`). It combines Experiment 2's constant-speed Hubble time with Experiment 5's matter-plus-dark-energy model using the exact closed forms for a flat universe's age and size, so the learner sees three lines (constant speed, matter only, chosen dark energy) reach today's size at different moments: matter only is too young (about 9.3 billion years, two thirds of the Hubble time), about 70% gives about 13.5, and the real fit's lower Hubble constant and dark energy share together give 13.8. The Hubble-tension gap is shown with computed numbers rather than only stated. It reuses earlier experiments' constants and functions unchanged (a regression test checks the imports). It has had its complete-flow test in a headless browser and its final review against its specification, `docs/PROJECT.md`, and `AGENTS.md` (§21 Step 10, 2026-10-07; two presentation gaps found and fixed — see the specification's "Implementation Notes"). After owner feedback, the introduction gained a paragraph defining what "older" and "younger" mean here (comparing possible universes with the same expansion rate today), tutor points 2 and 3 were rewritten in detail with car-trip examples, the animation was slowed to 9 seconds, and the caption and oldest-star label were clarified. The owner's line-by-line wording approval (§28.1) is complete (2026-10-07), approved as written. The 12.5 billion year oldest-star-cluster figure and the 1990s age puzzle (early-1990s cluster ages of about 16 to 20 billion years, revised down to about 12 to 13 by Hipparcos in 1995) were checked against web sources on 2026-10-07 (see the specification's "Implementation Notes"). Committed to git.
* **Cosmology, Experiment 7 (gravitational lensing):** approved specification (`docs/experiments/cosmology/07-gravitational-lensing.md`, proposed by Claude per §23 Stages 1–3 on 2026-10-07 after the owner chose the topic from three candidates, and approved 2026-10-07 with all eight "Decisions Needing Human Review" items confirmed; the owner shortened the title to "Gravitational Lensing"), tested physics model (`src/physics/gravitationalLensingExperiment.ts`), interface, prediction, results panel, and tutor are built and wired into the guided journey (`src/components/GravitationalLensingExperiment.tsx`, `src/components/GravitationalLensingTutor.tsx`). It applies the standard Einstein-ring formula, `θ = sqrt(4GM/c² × D_ls / (D_l × D_s))`, in real units for one fixed, rounded, Abell 1689-like situation, so the learner sees a cluster's gravity bend a distant galaxy's light into a ring whose width grows as the square root of the mass. Comparing the ring for the learner's chosen mass with the ring visible matter alone would make (about 18.2 arcseconds) and the real observed ring (about 47) shows the cluster needs about 6.7 times its visible mass: a second, independent line of evidence for dark matter after Experiment 4, found without measuring any star's speed. It reuses earlier experiments' constants unchanged (a regression test checks the imports) and modifies no earlier experiment. The pictures (side view, sky view with three rings, and a ring-versus-mass graph) and caption are hidden until predictions are locked in (§12). It has had its complete-flow test in a headless browser and its final review against its specification, `docs/PROJECT.md`, and `AGENTS.md` (§21 Step 10, 2026-10-08; one gap found and fixed — the unit Mpc was never defined). After owner feedback, the playback was shortened from 16 to 8 seconds and the sky view's "Cluster" label was moved clear of the rings. At a 390-pixel window the whole app's content column is only about 230 pixels wide (the same in Experiment 4), so the pictures' labels are very small; this is an app-wide layout matter, not changed, and left for the owner. The owner's line-by-line wording approval (§28.1) is complete (2026-10-08), approved as written, including Claude's added square-garden and shelf-sag comparisons. Committed to git. See the specification's "Implementation Notes."
* **Cosmology, Experiment 8 (how far can we see? the observable universe):** approved specification (`docs/experiments/cosmology/08-observable-universe.md`, proposed by Claude per §23 Stages 1–3 on 2026-10-08 after the owner chose it from three candidates, and approved the same day; the owner answered the three open items: radiation left out is ok, the faster-than-light statement is included in the tutor, and the custom slider is kept), tested physics model (`src/physics/observableUniverseExperiment.ts`), interface, prediction, results panel, and tutor are built and wired into the guided journey (`src/components/ObservableUniverseExperiment.tsx`, `src/components/ObservableUniverseTutor.tsx`). It shows three distances for one source of light, chosen by redshift: how far the light travelled, how far away the source is today, and how far away it was when the light left. For the oldest light (Experiment 3) these are about 13.5 billion, 44.6 billion and 41 million light-years, so the learner discovers why the observable universe is far larger than the universe's age times the speed of light: space stretched while the light travelled. It reuses Experiment 5's comoving distance function and Experiment 6's age formulas unchanged, and adds one new exact closed-form function (the time after the Big Bang at a given size, the inverse of Experiment 6's `relativeSizeAtTime`). Radiation is left out, as in Experiments 5 and 6, so the model's distance to the oldest light's source is about 2.4% below the real value (about 45.7 billion light-years); this is stated in the introduction and shown with computed numbers in the Results panel. The tutor states that the source's recession speed today is about 3.2 times the speed of light without breaking relativity, because it is the stretching of space and not motion through it. The pictures (a three-bar distance diagram drawn to a true scale, and a distance-versus-redshift graph) and caption are hidden until predictions are locked in (§12). It has had its complete-flow test and its final review against its specification, `docs/PROJECT.md`, and `AGENTS.md` (§21 Steps 9 and 10, 2026-10-08, in a headless browser; five gaps found and fixed — see the specification's "Implementation Notes"). The owner's line-by-line wording approval (§28.1) is complete (2026-10-08), approved as written. Two open items: the specification says the model is "about 2.5%" below the real distance where the computed figure is 2.4%, which needs the owner's approval to correct, and at a 390-pixel window the whole app's content column is only about 230 pixels wide (the same in Experiments 4 and 7), so the pictures' labels are very small; this is an app-wide layout matter, not changed. Committed to git. See the specification's "Implementation Notes."
* **Cosmology, Experiment 9 (how did galaxies form? structure formation):** approved specification (`docs/experiments/cosmology/09-structure-formation.md`, proposed by Claude per §23 Stages 1–3 on 2026-10-09 after the owner chose the topic and placed it before "The Fate of the Universe", which is planned as Experiment 10 and the chapter's closer; approved 2026-10-09). Two decisions were settled with the owner in conversation: the starting size of the ripple is a learner control, and the headline result is the growth factor (options (a) and (c) combined, since the oldest light's 1 part in 100,000 is a temperature difference, not a density excess, and the real relationship depends on the region's size, a second new idea left out); and the picture shows a clearly labeled, schematic "a galaxy would grow here" glow when a ripple becomes a clump. Tested physics model (`src/physics/structureFormationExperiment.ts`, 17 tests), interface, prediction, results panel, and tutor are built and wired into the guided journey (`src/components/StructureFormationExperiment.tsx`, `src/components/StructureFormationTutor.tsx`). It computes the exact growth factor of a small density excess in the same flat matter-plus-dark-energy universe as Experiments 5, 6 and 8 (reusing `expansionRateRatio` and `timeAfterBigBangYears` unchanged): about 850 times since the oldest light for ordinary matter (against the full size ratio of 1,091, since dark energy takes about a fifth away), and about 2,649 times with the dark matter head start (a given start at redshift about 3,400, a factor of about 3.1). From this it also computes the starting ripple needed to become a clump by today (about 1 part in 850, or 1 in 2,650 with the head start), and shows it beside the oldest light's temperature ripple without drawing a conclusion the model cannot support. Four presets (1 part in 100,000 to 1 part in 500) were chosen so that the outcomes differ: 1 in 500 clumps with either kind of matter, 1 in 1,000 only with the dark matter head start, and the two smaller ones with neither. The graphs and caption are hidden until predictions are locked in (§12). It has had its complete-flow test and its final review against its specification, `docs/PROJECT.md`, and `AGENTS.md` (§21 Steps 9 and 10, 2026-10-09, in a headless browser; two wording gaps found and fixed — "first-order" and "bound lump" used without plain-language definitions — see the specification's "Implementation Notes"). The owner's line-by-line wording approval (§28.1) is complete (2026-10-09), approved as written with no changes requested, including the second prediction's marking ("small difference" and "decides the outcome" both get "partly right"; only "no difference" is marked off) and the chapter summary text. Open items: the chapter summary's "next" line in `src/App.tsx` still says this is the last experiment; and at a 390-pixel window the four pictures shrink to about 174 pixels (the same app-wide layout matter as in Experiments 4, 7 and 8). The matter-radiation equality redshift (about 3,400) was not checked against a primary source. Committed to git (`f799615`, `fc070bf`, `568bd59`, `838e072`, `723b5ac`, `abad0e1`, `267f415`, `121359f`).
* **Gravitational Waves, Experiment 7 (standard sirens: how far, how fast):** approved specification (`docs/experiments/gravitational-waves/07-standard-sirens.md`, proposed by Claude per §23 Stages 1–2 on 2026-10-05 following the milestone after Experiment 6, with all five "Decisions Needing Human Review" items confirmed and the specification then approved), tested physics model (`src/physics/standardSirenExperiment.ts`), interface, prediction interaction, results panel, and AI tutor are built and wired into the guided journey (`src/components/GravitationalWaveStandardSirenExperiment.tsx`, `src/components/GravitationalWaveStandardSirenTutor.tsx`). It introduces one new, self-contained idea — a toy inverse-distance amplitude falloff — reusing Experiment 2's chirp amplitude output and Experiment 4's two real event presets unchanged: comparing a wave's distance-independent true amplitude (from the chirp's own shape) to its weaker detected amplitude recovers the distance to the source (a "standard siren"), which combined with a given, real, separately-measured recession velocity gives an estimated Hubble constant, exactly as done for the real GW170817 event in 2017. Per the owner's explicit decisions, the distance control offers all three of real/schematic/custom approaches, the recession-velocity data source is stated explicitly (the host galaxy's light, not the gravitational wave), and GW150914 — which had no light counterpart (Experiment 4) — correctly shows no Hubble-constant estimate at all, a real limitation rather than a simplification. It has had two complete-flow tests and two final reviews against its specification, `docs/PROJECT.md`, and `AGENTS.md` (§21 Step 10, 2026-10-05): the first found and fixed one gap ("Mpc" was used throughout without ever being defined in plain language, violating §15; fixed with a new "A note on units" introduction paragraph). After that review, the owner reported the diagram itself was a real gap — only two bare, unlabeled lines, with no visual difference between "Nearby" and "Far" despite the underlying numbers differing by orders of magnitude, and no caption — which led to a new `CLAUDE.md` §14 "Animated Diagrams" requirement (every experiment's diagram must label its components, visually distinguish compared quantities, and include a "How to read this diagram" caption, from its first UI pass going forward) and a fix here: a labeled source and arms, a caption, and the arms recalibrated to be driven by the DETECTED (distance-attenuated) strain rather than the true strain, using a square-root compression of the real physical ratio (tuned so every distance this experiment offers produces a clearly visible, correctly-ordered pulse, not just one calibration point) plus a glow effect matching Experiment 4's own. A follow-up readout font-size fix was also made. The second final review (2026-10-05) found no further gaps, confirmed numerically in a browser (arm deviation ≈36px "Nearby" vs. ≈3.5px "Far", both clearly visible) rather than by screenshot alone. Full suite (301/301) and `tsc --noEmit` clean; no console errors. The owner's line-by-line wording approval (§28.1) was explicitly skipped, not granted, at the owner's direction (2026-10-05), when closing out this chapter. Committed to git (`eb1ef98`).

**The "Gravitational Waves" chapter is now closed** (2026-10-05, at the owner's direction), ending at Experiment 7. No further experiment in this chapter is planned.

## Guided-Journey Work

* **Done:** the chapter shell (sidebar, Previous/Next), saved progress with completion check marks, introductions for Experiments 1 and 2, and the reference frame wording in Experiments 2, 3 and 4.
* **Done:** a "What you learned / What's next" summary below each experiment, shown only after the learner has run that experiment and reached the tutor's explanation, so nothing is explained early and the summary never comes before the tutor's own explanation. Until then, a short hint line says that a summary will appear there. A learner who skips the tutor's questions does not see the summary. The summaries live in the `chapters` list in `src/App.tsx`, grouped under phase headings (see below). Experiment 11's summary now points forward to the Gravity and Curved Spacetime chapter; that chapter's own Experiment 3 summary points to no further experiment, because none beyond it is approved yet.
* **Decided against:** a side-by-side compare view of Experiments 3 and 4.
* **Done:** the chapter layout is responsive. Below 850px wide the sidebar becomes a row of chapter buttons above the experiment (CSS classes in `src/index.css`), and the clocks in Experiments 2, 4 and 5 wrap instead of overflowing. In Experiments 4 and 5, when the moving clock travels more than 2.5 light-seconds in one tick (about 0.93c and above), the clock panels stack and are drawn in a wider box so the mirrors stay readable. In a very narrow window at such speeds the drawing is still small, because it has to fit the window width.
* **Done:** the sidebar groups chapters under named phase headings (`groupOrder` in `src/App.tsx`). A phase with no chapters yet still shows its heading, with a "coming after..." placeholder instead of a chapter list, so the learner can see what's ahead. Currently: "Relativity of Time and Motion" (Experiments 1–11), "Gravity and Curved Spacetime" (Experiments 1–9), and "Gravitational Waves" (its own Experiment 1, ripples in spacetime).
* **Done:** the shared `.toggle-button` style (`src/index.css`, used by every experiment's prediction/choice buttons) was too faint against the page's white card background. Fixed in two passes at the owner's request: background changed from pure white to a light-lavender tint (`#e4e8f5`, `#c9cee0` border), and `cursor: pointer`/`cursor: not-allowed` added (native `<button>` defaults to an arrow cursor otherwise). Applies globally, across every experiment.

## Next Milestone

Gravity and Curved Spacetime's Experiment 9 ("Real Clocks in Orbit (GPS and the Balance of Two Effects)") is now fully built, complete-flow tested in a browser, finally reviewed against its specification (§21 Step 10; one gap found and fixed — see the specification's "Implementation Notes"), and has the owner's complete line-by-line wording approval (§28.1, 2026-09-28), including its "Closing Synthesis: Putting It All Together" section naming special and general relativity's postulates for the first time in the project.

This is the confirmed closing experiment of the "Gravity and Curved Spacetime" chapter and of the project's current two-chapter arc as a whole. Per §23 Stage 6, Experiment 9's final review against `docs/PROJECT.md`, `AGENTS.md`, and its own specification (§21 Step 10) is complete (2026-09-29): no gaps found. All of Experiment 9's spec, physics, UI, tutor, and App.tsx wiring were already committed to git (`265488d`, `438b71a`). A housekeeping pass also removed stale "draft placeholder, not yet approved" comments left over in `src/App.tsx`'s chapter-summary list on several already-approved experiments (4 through 9 of this chapter).

Per §23 Stage 6, Claude proposed a further chapter (2026-09-29): a new "Gravitational Waves" phase, its Experiment 1 ("Ripples in Spacetime: Gravitational Waves"). Its "Decisions Needing Human Review" items were confirmed with the owner in conversation, and a specification was then written and approved per §23 Stages 3–4 (2026-09-29): `docs/experiments/gravitational-waves/01-gravitational-waves.md`. Per §21/§23 Stage 5 and §6 (one-step-at-a-time), it was then built incrementally — physics model, physics tests, basic UI, UI+physics wiring, learner prediction interaction, results panel, AI tutor — complete-flow tested in a browser, and given its final review against the specification, `docs/PROJECT.md`, and `AGENTS.md` (§21 Step 10, 2026-09-29; two gaps found and fixed — see the specification's "Implementation Notes").

The owner's line-by-line wording approval (§28.1) for this experiment's introduction, prediction prompts, results panel, tutor, and chapter-summary line is now complete (2026-09-29), approved as written with no changes requested. Its physics, UI, and tutor were already committed to git (`e7b2815`, `2557499`, `4858836`, `79f2ba6`). Separately, a project-wide pass added deeper-theory/daily-life material to every experiment's introduction (`7fc354c`), and a color-coding pilot first added to Experiment 8 (`977abc7`) was extended to other animations that share the same "two things to distinguish" pattern — Experiments 7, 9, 11, Gravitational Time Dilation, Tidal Effect, and Curved Spacetime (`895db36`).

Following that experiment's own milestone, its already-approved specification for Gravitational Waves Experiment 2 ("The Chirp: A Wave That Builds", `docs/experiments/gravitational-waves/02-the-chirp.md`, approved by the owner in conversation on 2026-09-29) was then built incrementally per §21/§23 Stage 5 and §6 — physics model and physics tests (`src/physics/gravitationalWaveChirpExperiment.ts`, `src/physics/gravitationalWaveChirpExperiment.test.ts`), basic UI, UI+physics wiring, learner prediction interaction, results panel, and AI tutor (`src/components/GravitationalWaveChirpExperiment.tsx`, `src/components/GravitationalWaveChirpTutor.tsx`), wired into `src/App.tsx`. It reuses Experiment 1's exact strain/arm-length formula unchanged and the Black Hole experiment's mass scale, adding only a new, self-contained, explicitly-labeled toy formula for how frequency and amplitude build as an inspiraling pair approaches an idealized final moment, so the learner sees a real gravitational wave's rising "chirp" shape instead of Experiment 1's steady tone. It has had its complete-flow test in a browser and its final review against its specification, `docs/PROJECT.md`, and `AGENTS.md` (§21 Step 10, 2026-09-30; four gaps found and fixed there — a duplicated page heading, a missing simplifying-assumption bullet, the term "chirp" used before being defined, and the toy-formula caveat missing from the results panel and tutor — see the specification's "Implementation Notes"). Following that review, several rounds of owner feedback refined the learner-facing wording and a couple of UI behaviors: a daily-life coin-spinning analogy was added to the introduction; the Results panel gained a plain-language definition of "strain," a loudness multiplier figure, and (after two different-mass runs) a callout noting that multiplier is mass-independent; a "Change predictions" control (matching the Orbit experiment's own) was added; and the live one-line readout below the Run button was fixed to stay hidden until a run starts, instead of showing idle rest-state numbers prematurely. The owner's line-by-line wording approval (§28.1) is now complete (2026-09-30), approved as written with no changes requested. Committed to git (`fd4b56c`).

Following that experiment's milestone, the owner confirmed its graph animation manually in a browser (2026-09-30) and asked Claude to propose the next experiment. Claude proposed several options (triangulation with two detectors, energy loss, a mystery-signal mass-reading exercise, detector noise/detection, a combined energy+triangulation proposal); the owner chose energy loss alone, to keep the experiment to a single new idea. A specification was then written and approved per §23 Stages 3–4 (2026-09-30): `docs/experiments/gravitational-waves/03-orbital-energy-loss.md`. Per §21/§23 Stage 5 and §6, it was then built incrementally — physics model and physics tests (`src/physics/gravitationalWaveEnergyExperiment.ts`, `src/physics/gravitationalWaveEnergyExperiment.test.ts`), basic UI, UI+physics wiring, learner prediction interaction, results panel, and AI tutor (`src/components/GravitationalWaveEnergyExperiment.tsx`, `src/components/GravitationalWaveEnergyTutor.tsx`), wired into `src/App.tsx`. It reuses Experiment 2's exact chirp calculation unchanged, adding only a new, self-contained, explicitly-labeled toy formula for orbital energy draining away over the same run — showing the cause behind Experiment 2's already-observed chirp. Its complete-flow test and final review against its specification, `docs/PROJECT.md`, and `AGENTS.md` (§21 Step 10, 2026-09-30) found one gap (the required arm-length-vs-time graph was missing from the display; fixed) — see the specification's "Implementation Notes."

After that review, the owner tried the experiment in a browser and gave several rounds of feedback, all addressed: the energy explanation needed to cover *how* a wave transmits energy, not just that energy moves (added a pond-ripple analogy); the live readout and Results panel stayed visible with stale numbers after changing mass post-run without clicking "Run" again (a real bug, fixed); the energy graph's line was nearly invisible because its axis was fixed to the full mass range rather than scaled to each run (fixed, and darkened for contrast); its caption assumed the reader could interpret the graph from an unrelated visual cue rather than explaining the axes directly (rewritten); and the wording claimed the learner was "watching the gravitational wave," which overclaims — as in Experiments 1 and 2, only the wave's effect (the arms stretching and squeezing) is ever shown, never the wave itself as a drawn shape (corrected in the graph caption and Results panel). The owner's wording review is complete (2026-09-30), done iteratively in conversation rather than as a single line-by-line pass.

Following that experiment's milestone, Gravitational Waves Experiment 4 ("Comparing Two Real Events") was proposed by Claude per §23 Stages 1–2 (2026-10-03), with a specification then written and approved per §23 Stages 3–4 (`docs/experiments/gravitational-waves/04-comparing-real-events.md`, approved 2026-10-03, with a free mass slider added alongside the two presets). Per §21/§23 Stage 5 and §6 it was then built incrementally — physics model and physics tests, basic UI, UI+physics wiring, learner prediction interaction, results panel, and AI tutor — wired into `src/App.tsx`. Its detector-arm animation then went through several rounds of owner feedback in conversation: on-canvas arm labels were added, then a wavy strain-pattern overlay, then the playback speed was slowed; a real bug was found and fixed where both arms' wave patterns shared one unsigned amplitude, making them look identical regardless of mass, contradicting the underlying physics' opposite-sign `armXLength`/`armYLength`; and the caption below the animation went through two simplification passes after feedback that it was too cluttered and too dense, settling on a short intro sentence plus three bullet points. Its complete-flow test and final review against its specification, `docs/PROJECT.md`, and `AGENTS.md` (§21 Step 10, 2026-10-04) found one gap (the Results panel's light-counterpart sentence was hardcoded by preset id instead of reading the `hadLightCounterpart` field `REAL_EVENT_PRESETS` already defines for that purpose; fixed) — see the specification's "Implementation Notes." The owner's wording review is complete (2026-10-04), approved as-is with no changes requested.

Following that experiment's milestone, Gravitational Waves Experiment 5 ("Stretched by Motion: Redshift of a Receding Source") — already named as the planned next step in Experiment 4's own specification — was proposed by Claude per §23 Stages 1–2 (2026-10-04), with a specification then written and approved per §23 Stages 3–4 (`docs/experiments/gravitational-waves/05-redshift-of-a-receding-source.md`, approved 2026-10-04). Per §21/§23 Stage 5 and §6 it was then built incrementally — physics model and physics tests, basic UI, learner prediction interaction, results panel, AI tutor, and introductory text — wired into `src/App.tsx`. It reuses Experiment 2's chirp model and the Relativity chapter's `timeDilationFactorFor` unchanged, combining them with one new classical-Doppler-factor function into the exact relativistic Doppler formula; the detector's arms visibly pulse at the slower, stretched "detected" rate by reparametrizing the time fed into the already-tested `chirpStateAt`, not through any new chirp physics. After the basic build, the owner asked for several rounds of visual refinement to make the stretching easier to see: two pulsing "Emitted"/"Detected" beacons, enlarged after feedback; a "cycles behind" running counter (requiring a purely additive `phase` field added to `gravitationalWaveChirpExperiment.ts`'s `ChirpState`), rebuilt as a prominent bordered badge after the first version proved too small and low-contrast to notice; and a wave-trace strip under each beacon showing the stretching as a shape, where a real bug was found and fixed — the traces' traveling-wave phase advanced too little over the observer window to visibly scroll in real playback, fixed with a visual-only scroll-speed multiplier that preserves the two traces' relative comparison exactly. The complete-flow test was run twice (before and after the animation work) with no gaps either time, and the final review against its specification, `docs/PROJECT.md`, and `AGENTS.md` (§21 Step 10, 2026-10-04) found no gaps, including a numeric spot-check outside the browser confirming the Doppler factor stays strictly below the classical-alone factor across the full 0–0.9c speed range. The owner's wording review is complete (2026-10-04), approved as written with no changes requested. Per Experiment 5's own specification, "Decisions Confirmed" item 2, this closes out the direction already planned after Experiment 4; no further experiment is yet approved.

Despite that, Gravitational Waves Experiment 6 ("Triangulation: Finding Where a Signal Came From") was proposed, specified, approved (`docs/experiments/gravitational-waves/06-triangulation.md`, approved 2026-10-04), and built per §21/§23 Stage 5 and §6 in a prior session — physics model and physics tests (`src/physics/gravitationalWaveTriangulationExperiment.ts`, `src/physics/gravitationalWaveTriangulationExperiment.test.ts`), UI, learner prediction interaction, results panel, and AI tutor (`src/components/GravitationalWaveTriangulationExperiment.tsx`, `src/components/GravitationalWaveTriangulationTutor.tsx`), wired into `src/App.tsx`. It introduces one new, self-contained idea — a plane-wave arrival-time formula over the three real LIGO/Virgo detector positions — reusing only the invariant `c` already established in the Relativity of Time and Motion chapter; no chirp, strain, Doppler, or energy-loss physics from Experiments 1–5 is touched. It was committed to git (`ca04757`) in this session.

In this session, the owner asked why the two illustrative "possible directions" wedges' overlap tells the learner the true direction, since the overlap itself still spans a range of directions. This was a real gap in the "How to read this diagram" caption, which read as though the overlap pinned down one exact direction. Fixed, at the owner's direction, by adding a paragraph stating plainly that the overlap is a *smaller* range, not one exact direction, and that real detector networks usually only narrow a source to a patch of sky. Committed to git. A subsequent complete-flow test and final review against the specification, `docs/PROJECT.md`, and `AGENTS.md` (§21 Step 10, 2026-10-05) found one further gap against the specification's Success Criterion 7: the introduction never tied back to Experiment 4's GW170817 event, though the Results panel and tutor already did. Fixed with one added sentence in the introduction's opening paragraph. Full suite (294/294) and `tsc --noEmit` remain clean; no console errors. No further gaps found. See the specification's "Implementation Notes" for the full detail. The owner's line-by-line wording approval (§28.1) for the experiment as a whole is not yet done — only the wedge-overlap caption paragraph has been explicitly approved, as written (2026-10-05).

Following that experiment's milestone, the owner asked for Claude's view on further experiments for this chapter. Claude recommended "standard sirens" (measuring distance, and the Hubble constant, from a gravitational wave's amplitude) over a black-hole-ringdown idea also considered and explicitly declined (a narrative bow rather than a new mechanism). Gravitational Waves Experiment 7 ("Standard Sirens: How Far, How Fast") was then proposed per §23 Stages 1–2 (2026-10-05), with five "Decisions Needing Human Review" items confirmed in conversation (all three distance approaches included; the recession-velocity data source stated explicitly; no ringdown experiment for now; the existing chirp/detector-arm animation style reused; the real-value uncertainty caveat made much more visually prominent than this project's usual inline caveat), and a specification then written and approved per §23 Stages 3–4: `docs/experiments/gravitational-waves/07-standard-sirens.md`. Per §21/§23 Stage 5 and §6 (one step at a time), it was then built incrementally — physics model and physics tests, basic UI, learner prediction interaction, results panel, and AI tutor — wired into `src/App.tsx`. It reuses Experiment 2's chirp amplitude output and Experiment 4's two real event presets unchanged, adding only a new, self-contained, explicitly-labeled toy inverse-distance formula; a real detail surfaced during implementation (GW150914 has no real recession velocity, since it had no light counterpart) was built in directly, reusing Experiment 4's existing `hadLightCounterpart` field rather than inventing new data. Its complete-flow test and final review against its specification, `docs/PROJECT.md`, and `AGENTS.md` (§21 Step 10, 2026-10-05) found one gap (the unit "Mpc" was never defined in plain language; fixed with a new introduction paragraph) — see the specification's "Implementation Notes."

The owner closed the "Gravitational Waves" chapter at Experiment 7 (2026-10-05), explicitly skipping the remaining wording approvals for Experiments 6 and 7 rather than completing them.

A new **"Cosmology"** chapter was then proposed by Claude per §23 Stages 1–2 (2026-10-05) and approved: `docs/experiments/cosmology/01-hubbles-law.md` — "Hubble's Law: The Farther, The Faster." It reuses Gravitational Waves Experiment 7's "Mpc" unit and introduces a new, self-contained low-redshift formula (`z ≈ H0 × d / c`, combined with Hubble's Law `v = H0 × d`) so the learner sees a galaxy's redshift grow with its distance. Claude's first proposal reused Gravitational Waves Experiment 5's velocity-based Doppler formula, caveated as a simplification; the owner rejected this as the easy path rather than the best one, since motion-through-space is not the real cause of cosmological redshift (space itself expanding is) — a difference in mechanism, not just precision, that Experiments 5 and 7 had already flagged as separate. The specification was revised to use the correctly-framed formula instead. Per §21/§23 Stage 5 and §6, it was then built incrementally through to completion — physics model and tests, basic UI, prediction interaction, results panel, AI tutor, complete-flow testing, and final review (§21 Step 10, 2026-10-05; three gaps found and fixed there — see the specification's section above for detail). Along the way, owner feedback in a browser replaced the diagram's color-changing dot with an actual traveling wave whose wavelength visibly widens as it nears Earth, and fixed a duplicated "Cosmology," prefix in the page heading. The owner's line-by-line wording approval (§28.1) is complete (2026-10-05), approved as written with no changes requested. Cosmology Experiment 1 is now fully complete. Not yet committed to git.

Following that milestone, Cosmology Experiment 2 ("The Big Bang: Running Expansion Backward in Time") was proposed by Claude per §23 Stages 1–3 (2026-10-05), as recommended in Experiment 1's own "Relationship to Later Experiments" section. Two open design questions (diagram approach, and caveat prominence) were resolved via an `AskUserQuestion` exchange before the draft was written; three further "Decisions Confirmed" items (title, custom-slider range, and including "Custom" as a fourth diagram marker) were then confirmed by the owner in conversation, and the specification was approved: `docs/experiments/cosmology/02-the-big-bang.md`. It reuses Experiment 1's own `recessionSpeedKmPerS` and `HUBBLE_CONSTANT_KM_PER_S_PER_MPC` unchanged and introduces one new idea — running Hubble's Law backward in time so every galaxy's distance from Earth implies the same "Hubble time" moment in the past, regardless of distance — compared, with an explicit non-rigor caveat, to the real measured age of the universe.

Its physics model and physics tests are now built (`src/physics/bigBangExperiment.ts`, `src/physics/bigBangExperiment.test.ts`): `hubbleTimeYears` (reuses `HUBBLE_CONSTANT_KM_PER_S_PER_MPC` from `hubblesLawExperiment.ts` unchanged, imported not redefined), `distanceAtPastTimeMpc`, and `runBigBangExperiment`. All 7 of "Required Physics Tests" are covered. Computed Hubble time at `H0 = 70 km/s/Mpc` is ≈13.97 billion years, within ≈1.2% of the real measured age (≈13.8 billion years). New suite: 8/8 passing. Full project suite: 317/317 passing. `tsc --noEmit` clean.

Basic UI is also built (`src/components/BigBangExperiment.tsx`): the same Galaxy control pattern as Experiment 1 (reusing its `GALAXY_PRESETS`/`MAX_CUSTOM_DISTANCE_MPC`), Run, a live readout (years ago, and the Hubble time once complete), and a labeled diagram showing Earth plus all three galaxy presets (and a fourth "Custom" marker when selected) at once, converging together toward Earth as the backward-time animation plays — directly visualizing "every galaxy points to the same moment," per the specification's Decisions Confirmed item 1. The selected galaxy is visually distinguished (gold) from the others (pale), and a "How to read this diagram" caption is included (`CLAUDE.md` §14). Wired into the guided journey (`src/App.tsx`, as "The Big Bang" under the "Cosmology" group; the Hubble's Law chapter's "next" text now points to it). This step deliberately has no prediction gating, results panel, or tutor yet; introductory text is also not yet drafted.

Verified in a browser (`http://localhost:5173/`): the three presets render at distinct, correctly-ordered starting positions; selecting "Custom" adds a fourth gold-highlighted marker at its slider position with its own label (no overlap); running with "A very distant galaxy" (200 Mpc) correctly showed all markers converging onto Earth's position with "Years ago: 13.97 billion | Hubble time (same for every galaxy): 13.97 billion years"; running with "Custom" selected converged identically. No console errors. Full suite (317/317) and `tsc --noEmit` remain clean.

The learner prediction interaction is also now built: the two prediction questions from the specification's "Prediction Activity" (how the implied time compares for a farther galaxy; how the result compares to the real universe age) gate the Galaxy control and Run until answered, matching the project's established pattern — predictions lock in on first "Run" and a "Change predictions" control reopens both without resetting the chosen galaxy.

Verified in a browser (`http://localhost:5173/`): both prediction questions correctly gate the Galaxy control and Run button; answering both ("The same" / "Close, but not exact") unlocks them and shows "Your predictions: The same, Close, but not exact"; running locks both predictions in and shows the "Change predictions" control. No console errors. Full suite (317/317) and `tsc --noEmit` remain clean.

The introductory text, Results panel, and AI tutor were then built together, at the owner's request. The introduction covers the question, what happens, the learner's job, what to look for, the new terms ("the Big Bang," "the Hubble time") defined in plain language, and all four assumptions from the specification (the constant-speed simplification, the Earth-is-not-special/not-central clarification, the real age stated as an independent comparison, and the no-individual-physics-modeled caveat). The Results panel (`src/components/BigBangExperiment.tsx`) states the computed Hubble time, checks both predictions, explicitly states the Earth-not-special point, and shows the real-universe-age comparison in a prominent bordered caveat box matching Experiment 1's own precedent. The AI tutor (`src/components/BigBangTutor.tsx`) follows the same predict → observe → explain pattern as Experiment 1's tutor, matching its specification's "AI Tutor Behavior" section exactly (observation question, prediction comparison, a conceptual question nudging toward "a single starting moment" without stating it outright, then the four-point explanation). Wired into `src/App.tsx`'s chapter summary via `onComplete`/`onTutorComplete`.

Verified in a browser (`http://localhost:5173/`): the introduction renders correctly; answering both predictions ("The same" / "Close, but not exact") and running correctly produced "13.97 billion years" regardless of which galaxy was selected, with both predictions confirmed "right" in the Results panel; the prominent caveat box and the Earth-not-special statement both render; the tutor's three reflection steps and final four-point explanation all worked correctly; `localStorage`'s `spacetime-explorer-progress` confirmed both `completed` and `explained` were recorded for this chapter; the chapter summary's "What you learned" text also renders correctly. No console errors (the animation itself could not be visually confirmed frame-by-frame in this automated browser session, since its backgrounded tab throttles `requestAnimationFrame` — the same known limitation noted for Gravitational Waves Experiment 2's graph; the final-frame convergence and all computed numbers were confirmed correct instead). Full suite (317/317) and `tsc --noEmit` remain clean.

After the owner asked for a little more intro context and caption, a real gap was found while making that change: the introduction's original "What happens" paragraph stated outright that every galaxy's distance reaches zero "at the very same moment... no matter how far away it is today" — directly revealing the answer to the first prediction question before the learner had made it, contradicting `CLAUDE.md` §12 and the project's core predict-before-observe philosophy. Fixed by rephrasing it to describe only the general backward calculation, leaving the "same regardless of distance" result to the prediction and the animation itself. Added, per `CLAUDE.md` §15: a "A daily-life picture" paragraph (a candle burning down at a steady rate, asked backward - deliberately generic, not hinting at the distance-independence result) and a "A simple example" paragraph (a single-galaxy worked d/v calculation, not comparing two galaxies, so it doesn't give away the answer either). The diagram caption also gained two additions: a note that marker spacing is illustrative, not to true cosmic scale, and a clarification of what a marker reaching Earth means in this simplified model (not a literal collision) - these are shown only after predictions are already locked in, so they don't risk spoiling anything.

Verified in a browser: the revised introduction no longer states the distance-independence result; both new paragraphs render correctly; the caption's two new points render correctly once predictions are submitted. No console errors. Full suite (317/317) and `tsc --noEmit` remain clean.

At the owner's request, a time scale was added above the main diagram: a horizontal axis spanning the same x-range as the galaxy markers below it, labeled with the Hubble time at one end and "0 — the singularity" at the other, with a gold pointer that moves in lockstep with the galaxies' own convergence (driven by the same `displayedProgress` value) and a live countdown label, reaching exactly "0.00 billion years" at the same moment the galaxies reach Earth. The term "singularity" is defined in plain language in the introduction (a light-touch, clearly-flagged real-world term, matching the Black Hole experiment's own precedent for a similarly out-of-scope concept) — not a place that could be traveled to or examined, but the point where this simplified model's distances and timeline both reach zero, with what actually happens there explicitly stated as requiring physics (quantum gravity) this experiment does not model. The diagram caption also gained a line pointing out the new scale and its pointer.

Verified in a browser: the scale renders correctly before running (showing the full Hubble time and the pointer at the start) and after running (pointer at the singularity end, "0.00 billion years," synchronized with the galaxies reaching Earth). No console errors. Full suite (317/317) and `tsc --noEmit` remain clean.

After the owner tried it, the scale was redrawn as a marked ruler (ten evenly spaced tick marks, with taller major ticks every fifth) with a vertical-line pointer sweeping across it, replacing the original single moving dot; the animation's fixed playback duration was also lengthened from 3000ms to 4500ms at the owner's request for a slightly slower pace (`CLAUDE.md` §11 - a presentation-only change, the underlying physics is unaffected). The ruler's baseline was then further changed from a single continuous line into ten alternating-shade segments (one per tick interval), at the owner's request for a more visibly divided ruler look, rather than one straight bar with ticks poking out of it. Verified again in a browser: the ruler's alternating segments, tick marks, and vertical pointer render correctly at rest and sweep smoothly to the singularity end on completion. No console errors; full suite and `tsc --noEmit` remain clean.

The owner then asked why the animation looks identical regardless of which galaxy is chosen — not a bug: the diagram always draws all three presets, and all three always converge at exactly the same moment (the Hubble time, which does not depend on distance - the experiment's whole point), so switching between the three presets only changes which marker is highlighted and which name the readout/Results text refer to, never the timing. At the owner's request (an `AskUserQuestion` offered leaving it as-is, adding visual emphasis, or adding an explanatory note; the owner chose visual emphasis), the selected galaxy's marker now pulses (an animated radius plus an expanding, fading ring, both via native SVG `<animate>`) and leaves a faint trailing line from its starting position back to its current one as it travels - purely a "watch this one" visual aid, confirmed via the DOM (3 `<animate>` elements and the trail line both present during a run) since this automated browser session's backgrounded-tab `requestAnimationFrame` throttling still prevents reliably screenshotting a true mid-animation frame. The diagram caption was updated to explain the pulse/trail are only a visual aid, not a change in what's actually happening. Full suite (317/317) and `tsc --noEmit` remain clean.

Its complete-flow test is now done (2026-10-05, from a cleared `localStorage`, simulating a first-time learner): the introduction, all four assumption bullets, and both prediction questions render correctly; both predictions correctly gate the Galaxy control and Run; running with "Coma Cluster" selected correctly produced 13.97 billion years, named "Coma Cluster" throughout the Results panel, confirmed both predictions right, and showed the Earth-not-special statement and the prominent real-age caveat box; the tutor's three reflection steps and four-point final explanation all worked; `localStorage` confirmed both `completed` and `explained` were recorded, and the chapter summary renders correctly. "Change predictions" correctly reopened both questions while preserving the chosen galaxy. A second run with the Custom slider and a deliberately wrong first prediction ("Longer") correctly showed "so your prediction was off this time" — confirming the Results panel handles an incorrect prediction honestly, not just the right-answer path. No console errors (aside from an unrelated Chrome-extension messaging artifact). Full suite (317/317) and `tsc --noEmit` remain clean.

The owner's line-by-line wording approval (§28.1) is complete (2026-10-05), approved as written with no changes requested, covering the introduction, prediction prompts, diagram caption, Results panel, and tutor, including every fix and addition made during this experiment's build (the final-review fixes, the wave/ruler/pulse diagram iterations, and the singularity explanation).

Its final review against the specification, `docs/PROJECT.md`, and `AGENTS.md` (§21 Step 10) is complete (2026-10-05): one gap found and fixed there. The specification's "Experiment Behavior" > "Display" section requires the live readout to show "the chosen galaxy's distance, its current recession speed (from Experiment 1's own formula), and the Hubble time once the experiment has run" - the implementation showed only "years ago" and the Hubble time, omitting distance and recession speed entirely. Fixed by adding a "Distance: X Mpc | Recession speed: Y km/s" line, reusing Experiment 1's own `recessionSpeedKmPerS` unchanged (imported, not redefined - consistent with this experiment's whole reuse pattern). Verified in a browser: for Virgo Cluster (16.5 Mpc), the readout correctly showed "Distance: 16.5 Mpc | Recession speed: 1155 km/s" (70 × 16.5 = 1155, exact). No further gaps found against the specification's eight Success Criteria or its Required Physics Tests. No console errors; full suite (317/317) and `tsc --noEmit` remain clean.

**Cosmology Experiment 2 (The Big Bang) is now fully complete**: physics, tests, UI, prediction/results flow, tutor, diagram (wave→ruler→pulse iterations), complete-flow test, final review, and the owner's wording approval are all done.

After that, the owner asked whether the animation should also show the reverse: starting from the singularity and the universe expanding outward, since that is literally what "the Big Bang" means. Claude recommended against literally reversing the backward-extrapolation's own assumption (constant-rate expansion) as if it were a forward simulation, since that risks implying the simplified model is the real expansion history - but proposed, and the owner approved, a "Play forward" control that replays the exact same already-computed trajectory the other way (singularity → today), captioned to make clear it is the same simplified model shown in reverse, not a new calculation or a simulation of real cosmic history. Implemented in `src/components/BigBangExperiment.tsx`: a `forwardStatus`/`forwardProgress` state pair drives a second, symmetric animation effect; the "Play forward (from the Big Bang)" button appears only once the backward run reaches the singularity; the diagram, time-scale pointer and label, and live readout all switch to forward-phase values (counting up "since the Big Bang" instead of counting down "years ago"); the selected galaxy's trailing line was fixed to anchor at Earth during forward playback instead of its present-day position, so the trail correctly grows behind it as it expands outward rather than shrinking. The caption, "What to look for," and button labels all explicitly state the starting point is the singularity and the universe expands outward from there. Changing galaxy or prediction resets the forward phase alongside the existing backward-phase resets. Verified in a browser: the button appears only after backward completion; running it forward correctly ends with each galaxy back at its exact present-day position (confirmed numerically - Virgo at 16.5 Mpc, Coma at 100 Mpc, the far preset at 200 Mpc, matching `positionXForDistance` exactly); the readout and scale labels switch correctly; "Play forward again" allows repeat viewing. No console errors. Full suite (317/317) and `tsc --noEmit` remain clean. This adds UI-only presentation logic; no physics formulas changed and no new ones were introduced (the forward phase reuses `distanceAtPastTimeMpc` unchanged, just reparameterized by elapsed-since-singularity instead of years-ago). At the owner's request, a further caption bullet was added noting that the farther galaxy visibly moves outward faster during the forward playback, covering more distance in the same time, because Hubble's Law (Experiment 1) makes recession speed proportional to distance - an observation already implied by the existing math (each galaxy's on-screen speed is proportional to its own distanceMpc under the shared linear model), not a new effect. Verified in a browser that it renders correctly; no console errors; full suite and `tsc --noEmit` remain clean.

Per `CLAUDE.md` §23 Stage 6, Claude may now propose a next experiment, though none is currently approved; the "Cosmology" chapter's own next step (per Experiment 1's "Relationship to Later Experiments") would need a new proposal, since the only explicitly-recommended follow-on (running Hubble's Law backward) is this experiment itself.

Following that milestone, Cosmology Experiment 3 ("The Cosmic Microwave Background: The Afterglow of the Big Bang") was proposed per §23 Stages 1–2, specified, approved, and built one step at a time through to completion on 2026-10-06 (see its bullet above and its specification's "Implementation Notes"). Cosmology Experiment 4 ("Dark Matter: Why Do Galaxies Spin Too Fast?") was then proposed, specified, approved, and built one step at a time through to completion on 2026-10-06 (see its bullet above and its specification's "Implementation Notes"). Cosmology Experiment 5 ("Dark Energy: Is the Expansion Speeding Up?") followed the same way, also on 2026-10-06. No further experiment is approved.

**What remains:** nothing is in progress. Cosmology Experiment 9 (structure formation) is built and committed; its wording is approved, and the open items in its bullet above remain. "The Fate of the Universe" is planned as Experiment 10 and the closer of this chapter, but it has not been proposed or specified, so it is not approved. A next experiment needs a proposal and an approved specification first (§23 Stages 1–4).

Do not proceed beyond that milestone without explicit authorization.

---

# 28. Working with the Project Owner

These are the working agreements that have been established in practice.

1. **Learner-facing wording is the owner's to approve.** Introductions, explanations, captions, and tutor wording are part of the educational design. Draft them from the approved specification, add no claims the specification does not contain, and do not reveal what an experiment shows before the learner has observed it (§12). Show the draft for review, then revise it.
2. **Keep the specification and the interface in sync.** When approved wording or behavior changes, update the specification to match, but only with the owner's approval. If the two disagree, say so; do not quietly change either.
3. **Every experiment opens with an introduction:** the question, what happens, the learner's job, any new term, and the assumptions. Follow the structure of the existing introductions.
4. **Check user-interface changes in a browser.** Type checks and tests do not cover appearance. Tell the owner the local address where the change can be seen, and wait for their review before committing.
5. **Commit only when asked.** Keep the owner's pre-existing uncommitted changes in separate commits from the agent's changes (stage by hunk when they share a file), and keep each commit focused.
6. **Say what was not checked.** Report anything that was not run, not viewed, or not verified.
