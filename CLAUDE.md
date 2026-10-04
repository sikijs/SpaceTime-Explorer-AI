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

**What remains:** per §23 Stage 6, the next decision is the owner's — propose a further experiment, or leave the project at its current state.

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
