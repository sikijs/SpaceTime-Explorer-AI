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

   The caption must be detailed, in simple words, and explanatory, so that a learner with only basic science knowledge can read the diagram without guessing. Write it this way the first time; do not wait for the owner to ask for it. In particular:

   * Name every picture and say what each one shows (for example, whose view it is, and when it appears during a run).
   * List every drawn element and say what it means: each shape, arrow, line, row, colour, fill pattern, marker, and bar, including what a longer arrow or a missing arrow means.
   * Define any unit or term used in the drawing's labels (for example, "0.5c is half the speed of light").
   * Describe what appears when, if the diagram changes during a run, in the order the learner sees it.
   * Use short sections or bullet lists, not one dense paragraph.
   * Include a worked moment with real numbers and a "what to look for" list, as in earlier experiments.
   * Do not reveal what the experiment shows before the learner has predicted and observed it (§12).

   As with other learner-facing wording, the caption is the owner's to approve (§28.1).

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

Every experiment below has an approved specification, a tested physics model, an interface, a prediction, a results panel and a tutor, all wired into `src/App.tsx`. Later experiments also record a complete-flow test and final review (§21 Steps 9 and 10). The full per-experiment history (what was found and fixed in each review, owner feedback rounds, commit hashes, verification notes and open items) is in `docs/STATUS.md`, which is not loaded automatically; read it when you need an experiment's history. Each specification's "Implementation Notes" remain authoritative for that experiment.

"Wording approved" means the owner's line-by-line wording approval (§28.1) is complete.

**Relativity of Time and Motion** (`docs/experiments/relativity-of-time-and-motion/`)

| # | Title | Specification | Status |
|---|---|---|---|
| 1 | One clock | `01-clock.md` | Complete |
| 2 | Two clocks at rest | `02-two-clocks.md` | Implemented |
| 3 | Moving clock | `03-moving-clock.md` | Complete; review items addressed |
| 4 | The light clock: why time dilation happens | `04-light-clock.md` | Complete |
| 5 | Why can't light go faster? | `05-invariant-light-speed.md` | Complete; has open items in its spec |
| 6 | Does motion change length? | `06-length-contraction.md` | Complete; has open items in its spec |
| 7 | Relativity of simultaneity | `07-relativity-of-simultaneity.md` | Complete (wording approved) |
| 8 | Drawing spacetime | `08-spacetime-diagrams.md` | Complete (wording approved 2026-10-13, after being skipped earlier) |
| 9 | Same time, different line | `09-same-time-different-line.md` | Complete (wording approved) |
| 10 | The twin paradox | `10-twin-paradox.md` | Complete (wording approved 2026-10-13) |
| 11 | The rod's own axes | `11-rods-own-axes.md` | Complete (wording approved); closes this chapter |

**Gravity and Curved Spacetime** (`docs/experiments/gravity-and-curved-spacetime/`)

| # | Title | Specification | Status |
|---|---|---|---|
| 1 | The equivalence principle | `01-equivalence-principle.md` | Complete (wording approved) |
| 2 | Does gravity change time? | `02-gravitational-time-dilation.md` | Complete (wording approved) |
| 3 | Why gravity isn't just acceleration (tidal effects) | `03-tidal-effects.md` | Complete (wording approved) |
| 4 | Curved spacetime: why parallel paths don't stay parallel | `04-curved-spacetime-geodesics.md` | Complete (wording approved) |
| 5 | What curves spacetime? Mass and distance | `05-what-curves-spacetime.md` | Complete (wording approved) |
| 6 | Why do planets orbit instead of falling in? | `06-orbits.md` | Complete (wording approved) |
| 7 | What is a black hole? | `07-black-holes.md` | Complete (wording approved) |
| 8 | Does gravity bend light? | `08-light-bending.md` | Complete (wording approved) |
| 9 | Real clocks in orbit: GPS, with a closing synthesis | `09-gps-time-dilation.md` | Complete (wording approved); the closing synthesis names special and general relativity's postulates |

**Gravitational Waves** (`docs/experiments/gravitational-waves/`). This chapter is closed at Experiment 7 (2026-10-05, at the owner's direction); no further experiment is planned.

| # | Title | Specification | Status |
|---|---|---|---|
| 1 | Ripples in spacetime | `01-gravitational-waves.md` | Complete (wording approved) |
| 2 | The chirp: a wave that builds | `02-the-chirp.md` | Complete (wording approved) |
| 3 | Where the energy comes from | `03-orbital-energy-loss.md` | Complete (wording approved 2026-10-13, after review in conversation) |
| 4 | Comparing two real events | `04-comparing-real-events.md` | Complete (wording approved) |
| 5 | Stretched by motion: redshift of a receding source | `05-redshift-of-a-receding-source.md` | Complete (wording approved) |
| 6 | Triangulation: finding where a signal came from | `06-triangulation.md` | Complete (wording approved 2026-10-13, after being skipped earlier) |
| 7 | Standard sirens: how far, how fast | `07-standard-sirens.md` | Complete (wording approved 2026-10-13, after being skipped earlier) |

**Cosmology** (`docs/experiments/cosmology/`). This chapter is complete.

| # | Title | Specification | Status |
|---|---|---|---|
| 1 | Hubble's Law: the farther, the faster | `01-hubbles-law.md` | Complete (wording approved) |
| 2 | The Big Bang: running expansion backward in time | `02-the-big-bang.md` | Complete (wording approved) |
| 3 | The Cosmic Microwave Background | `03-cosmic-microwave-background.md` | Complete (wording approved) |
| 4 | Dark matter: why do galaxies spin too fast? | `04-dark-matter.md` | Complete (wording approved) |
| 5 | Dark energy: is the expansion speeding up? | `05-dark-energy.md` | Complete (wording approved) |
| 6 | How old is the universe? | `06-age-of-the-universe.md` | Complete (wording approved) |
| 7 | Gravitational lensing | `07-gravitational-lensing.md` | Complete (wording approved) |
| 8 | How far can we see? The observable universe | `08-observable-universe.md` | Complete (wording approved) |
| 9 | How did galaxies form? Structure formation | `09-structure-formation.md` | Complete (wording approved) |
| 10 | The fate of the universe | `10-fate-of-the-universe.md` | Complete (wording approved, including the chapter summary text, approved 2026-10-12) |
| - | Closing synthesis ("Putting It All Together"), a section on Experiment 10's page, not an experiment | `closing-synthesis.md` | Complete (wording approved) |

**Black Holes and Strong Gravity** (`docs/experiments/black-holes-and-strong-gravity/`). Planned as five experiments, with a sixth added on 2026-10-11, a seventh on 2026-10-12 and an eighth (spinning black holes), a ninth (how a black hole forms) and a tenth (Hawking radiation) approved on 2026-10-12; Experiments 1 to 10 are built. No further experiment is planned.

| # | Title | Specification | Status |
|---|---|---|---|
| 1 | How small must something be to become a black hole? | `01-how-small-a-black-hole.md` | Complete (wording approved), with an optional "guide to black holes" |
| 2 | Time near a black hole: does a clock ever stop? | `02-time-near-a-black-hole.md` | Complete (wording approved) |
| 3 | Orbits near a black hole | `03-orbits-near-a-black-hole.md` | Complete (wording approved 2026-10-12, as is, without a fresh read-through; the captions had been approved on 2026-10-10) |
| 4 | Light near a black hole: can light be trapped? | `04-light-near-a-black-hole.md` | Complete (wording approved) |
| 5 | Falling in: what does the traveler experience? | `05-falling-in.md` | Complete (wording approved) |
| 6 | Seeing the fall from far away: does anyone see the traveler cross? | `06-seeing-the-fall.md` | Complete (wording approved); differences from the spec approved 2026-10-12 |
| 7 | The color of the fall: what color does the falling traveler's light have? | `07-color-of-the-fall.md` | Specification approved 2026-10-12; Complete (wording approved); differences from the spec approved 2026-10-12 |
| 8 | Spinning black holes: does spin change where orbits are safe? (with the energy released as a second idea) | `08-spinning-black-holes.md` | Specification approved 2026-10-12; Complete (wording approved 2026-10-12); final review done 2026-10-12 |
| 9 | How a black hole forms: what can hold up a dead star's core? | `09-how-a-black-hole-forms.md` | Complete (built, tested, final review done 2026-10-12; wording approved 2026-10-12); the white dwarf formula's coefficient, 0.0131, is Claude's own fit to a numerical integration, approved |
| 10 | Hawking radiation: does a black hole slowly disappear? | `10-hawking-radiation.md` | Specification approved 2026-10-12 (all nine decisions on their defaults); Complete (built, tested, complete-flow tested, final review done 2026-10-12; wording approved 2026-10-12); the formulas were checked only against secondary sources |

**Spacetime Geometry: What Is Real, What Is Seen** (`docs/experiments/spacetime-geometry/`). A new group, named by the owner on 2026-10-13 by merging two candidate groups. Experiments 1 to 10 are approved and built (Experiment 10 on 2026-10-16; Experiment 6's specification was approved 2026-10-15, and Experiments 6 to 9 were built, tested and finally reviewed on 2026-10-16, with their wording approved the same day); the first specification's seven-experiment roadmap is approved as a direction only, so no experiment beyond Experiment 10 is approved. The owner's closing "putting it all together" recap of the whole group, a section on Experiment 10's page and not an experiment, is built and its wording approved (2026-10-16), so this group is complete.

| # | Title | Specification | Status |
|---|---|---|---|
| 1 | The interval: one number everyone agrees on | `01-the-interval.md` | Specification approved 2026-10-13 (all ten decisions on their defaults); built, tested, complete-flow tested and finally reviewed 2026-10-13; wording approved ("wording approved", 2026-10-13, read as covering all learner-facing wording); differences from the spec approved 2026-10-13 |
| 2 | Light cones: which events can affect which | `02-light-cones.md` | Specification approved 2026-10-13 (all ten decisions on their defaults); built, tested, complete-flow tested and finally reviewed 2026-10-13; wording approved (2026-10-13); all eight differences from the spec approved 2026-10-13; committed |
| 3 | Cause before effect: can the order of events change? | `03-cause-before-effect.md` | Specification approved 2026-10-13 (all ten decisions on their defaults); built, tested, complete-flow tested and finally reviewed 2026-10-14; wording approved (2026-10-14, covering the introduction, caption, results, tutor and chapter summary); committed; the owner has not yet approved its differences from the spec, and the tutor's faster-than-light remark has no source check |
| 4 | What you see is the past: where is the spaceship, and where does it look to be? | `04-what-you-see-is-the-past.md` | Specification approved 2026-10-14 (all ten decisions on their defaults); built, tested, complete-flow tested and finally reviewed 2026-10-14; committed; the owner approved its differences from the spec on 2026-10-14 ("spaceship" replaced "ship" throughout at the owner's request); wording approved (2026-10-14, covering the introduction, both captions, prediction, results, tutor and chapter summary); the tutor's "nothing travels along the image" sentence has no source check |
| 5 | Energy, momentum and mass: what do all observers agree on? | `05-energy-momentum-and-mass.md` | Specification approved 2026-10-14 (all eighteen decisions on their defaults); three parts (the invariant, a collision, reactions including nuclear binding and particle creation and destruction), three tutors and a three-stage introduction; built, tested, complete-flow tested and finally reviewed 2026-10-15; wording approved (2026-10-15); committed; all eight differences from the spec approved 2026-10-15 |
| 6 | Making new particles: how much energy does it take? (with decay) | `06-making-new-particles.md` | Specification approved 2026-10-15 (all seventeen decisions on their defaults); two parts (a stationary target against head-on beams, and decay) with two tutors and a two-stage introduction; built (physics model and tests, interface, prediction, results, two tutors, draft chapter summary), complete-flow tested in Chrome and finally reviewed 2026-10-16; wording approved (2026-10-16); committed |
| 7 | Aberration: why the sky bunches up ahead of a fast traveler | `07-aberration.md` | Specification approved 2026-10-16 (all thirteen decisions on their defaults); built (physics model and tests, interface, prediction, run, results, tutor, chapter summary), complete-flow tested in Chrome (all four speeds and three predictions) and finally reviewed 2026-10-16; wording approved (2026-10-16); committed; all eight differences from the spec approved 2026-10-16; Earth's orbital speed has no source check |
| 8 | The Doppler effect: why a fast traveler sees the colors of the sky shift | `08-doppler-shift.md` | Specification approved 2026-10-16 (all twelve decisions on their defaults, including the one-line edit of Experiment 7's "What's next" to drop "and brightness", now made); built (physics model and 24 test cases in `src/physics/dopplerShift.ts` and `dopplerShift.test.ts`; interface, two predictions, run, results, tutor and chapter summary in `DopplerShiftExperiment.tsx` and `DopplerShiftTutor.tsx`), complete-flow tested in Chrome (all four speeds and all nine prediction pairs, 36 runs) and finally reviewed 2026-10-16; the tutor marks each prediction as matched or not matched in its explanation only (the owner's choice); wording approved (2026-10-16); committed; all nine differences from the spec approved 2026-10-16; the visible range (400 to 700 nm), 550 nm as yellow-green, `E = h f`, the siren statement and the formula itself have no source check (the cosmic microwave background example was left out for that reason) |
| 9 | The traveler's whole sky: direction, color and brightness together | `09-the-travelers-whole-sky.md` | Specification approved 2026-10-16 (all twelve decisions on their defaults, including the one-line edit of Experiment 8's "What's next", now made); built (physics model and 16 test cases in `src/physics/travelerSky.ts` and `travelerSky.test.ts`, checked by eight deliberate breaks; interface, two predictions, a three-layer run, results, tutor and chapter summary in `TravelerSkyExperiment.tsx` and `TravelerSkyTutor.tsx`), complete-flow tested in Chrome (all four speeds and all nine prediction pairs, 36 runs) and finally reviewed 2026-10-16; the brightness factor is the square of Experiment 8's color factor, so a star is brighter exactly when it is bluer; the tutor marks each prediction as matched or not matched in its explanation only; wording approved (2026-10-16); committed; all nine differences from the spec approved 2026-10-16; the brightness formula was checked only against two secondary sources (Oikofuge and the Baez Physics FAQ), the tutor's "1 ÷ D" counting argument and rain remark have no source check, and it has not been checked at narrow widths, in other browsers or with a real learner |
| 10 | A fast object looks rotated, not squashed | `10-rotated-not-squashed.md` | Specification approved 2026-10-16 (all thirteen decisions on their defaults); built (physics model and 13 test cases in `src/physics/rotatedObject.ts` and `rotatedObject.test.ts`, checked by nine deliberate breaks; interface, two predictions, a five-stage run, three pictures with a guide under each, results, tutor and chapter summary in `RotatedObjectExperiment.tsx` and `RotatedObjectTutor.tsx`), complete-flow tested in Chrome (all four speeds and all twelve prediction pairs, 48 runs, twice) and finally reviewed 2026-10-16; the cube at rest turned by θ is drawn as a rotated square seen from above, added at the owner's request; wording approved (2026-10-16); committed; all twelve differences from the spec approved 2026-10-16 (listed in `10-rotated-not-squashed.md`), including the title, which gives away Prediction 1's answer (as the spec's title does) and is kept as it stands; the tutor's remark that a near camera, a camera looking along the path and an eye would show different distortions has no source check, the Terrell and Penrose statements were checked only against secondary sources, and it has not been checked at narrow widths, in other browsers or with a real learner; the closing recap of the group is not built |
| - | Closing recap ("Putting It All Together: What Do Observers Agree On, and What Do They Only See?"), a section on Experiment 10's page, not an experiment | `closing-synthesis.md` | Specification approved 2026-10-16 (all ten decisions on their defaults); built (`src/physics/synthesisFigures.ts` with 10 test cases in `synthesisFigures.test.ts`, checked by three deliberate breaks, and `src/components/SpacetimeGeometrySynthesis.tsx`, shown below Experiment 10's tutor once its explanation is reached), with the pointer paragraph in Experiment 10's introduction and the changed "What's next"; every figure is read from the earlier experiments' own functions; wording approved (2026-10-16); committed; it has not been checked at other speeds (it uses fixed examples), at narrow widths, in other browsers or with a real learner |

**Recurring open items** (details in `docs/STATUS.md`): most general-knowledge statements in Cosmology and Black Holes learner-facing text were checked against sources on 2026-10-13 (see STATUS.md); the 2011 Nobel Prize claim, the original papers behind several formulas, and a few hand-derived formulas remain unchecked, and each experiment's specification lists them.

## Guided-Journey Work

* **Done:** the chapter shell (sidebar, Previous/Next), saved progress with completion check marks, introductions for Experiments 1 and 2, and the reference frame wording in Experiments 2, 3 and 4.
* **Done:** a "What you learned / What's next" summary below each experiment, shown only after the learner has run that experiment and reached the tutor's explanation, so nothing is explained early and the summary never comes before the tutor's own explanation. Until then, a short hint line says that a summary will appear there. A learner who skips the tutor's questions does not see the summary. The summaries live in the `chapters` list in `src/App.tsx`, grouped under phase headings (see below). Experiment 11's summary now points forward to the Gravity and Curved Spacetime chapter; that chapter's own Experiment 3 summary points to no further experiment, because none beyond it is approved yet.
* **Decided against:** a side-by-side compare view of Experiments 3 and 4.
* **Done:** the chapter layout is responsive. Below 850px wide the sidebar becomes a row of chapter buttons above the experiment (CSS classes in `src/index.css`), and the clocks in Experiments 2, 4 and 5 wrap instead of overflowing. In Experiments 4 and 5, when the moving clock travels more than 2.5 light-seconds in one tick (about 0.93c and above), the clock panels stack and are drawn in a wider box so the mirrors stay readable. In a very narrow window at such speeds the drawing is still small, because it has to fit the window width.
* **Done:** the sidebar groups chapters under named phase headings (`groupOrder` in `src/App.tsx`). A phase with no chapters yet still shows its heading, with a "coming after..." placeholder instead of a chapter list, so the learner can see what's ahead. Currently: "Relativity of Time and Motion" (Experiments 1–11), "Gravity and Curved Spacetime" (Experiments 1–9), and "Gravitational Waves" (its own Experiment 1, ripples in spacetime). Later groups added: "Cosmology" and "Black Holes and Strong Gravity" (Experiments 1 to 10 are built). Newest group: "Spacetime Geometry: What Is Real, What Is Seen" (Experiments 1 to 5 are built).
* **Done (2026-10-12; committed with the owner's go-ahead; its wording was approved on 2026-10-12, as written, with Experiment 9's):** a group can have a one-sentence overview, shown under its title on every chapter page of that group (`groupOverviews` in `src/App.tsx`, style `.experiment-group-overview` in `src/index.css`). Only the Black Holes and Strong Gravity group has one, chosen by the owner when Experiment 9 (how a black hole forms) was kept as the ninth, not the first, experiment. A final clause, "and how one might end", was added on 2026-10-12 after Experiment 10 (Hawking radiation) was built, at the owner's request; the owner approved that wording on 2026-10-12, so the whole sentence is approved.
* **Done:** the shared `.toggle-button` style (`src/index.css`, used by every experiment's prediction/choice buttons) was too faint against the page's white card background. Fixed in two passes at the owner's request: background changed from pure white to a light-lavender tint (`#e4e8f5`, `#c9cee0` border), and `cursor: pointer`/`cursor: not-allowed` added (native `<button>` defaults to an arrow cursor otherwise). Applies globally, across every experiment.

## What Remains

Black Holes Experiment 7 (the color of the fall) is built, tested and reviewed, and its wording is approved. Black Holes Experiment 8 (spinning black holes) has an approved specification (2026-10-12) and is complete (built, tested, reviewed), and its wording is approved. Black Holes Experiment 9 (how a black hole forms) has an approved specification (2026-10-12) and is complete (built, tested, reviewed), and its wording is approved. Black Holes Experiment 10 (Hawking radiation) has an approved specification (2026-10-12) and is complete (built, tested, complete-flow tested, reviewed, committed), and its wording is approved. Otherwise nothing is in progress. The overall project vision, the four completed chapters (Relativity of Time and Motion, Gravity and Curved Spacetime, Gravitational Waves, Cosmology) and the ten built experiments of the Black Holes and Strong Gravity group. For Cosmology, the specification of Experiment 10 names a recollapsing universe, dark energy that changes with time, the cosmic event horizon, and the far future of stars and black holes as natural candidates, but none is proposed. Any next experiment needs a proposal and an approved specification first (§23 Stages 1-4).

Spacetime Geometry Experiment 1 (the interval) is complete: specification approved, physics model and tests, interface, prediction, run, results, tutor and chapter summary built and committed, complete-flow tested in headless Chrome and finally reviewed (2026-10-13). The owner approved its differences from the specification on 2026-10-13; its open items are a check with a real learner and in a browser other than headless Chrome. No second experiment of this group has a specification; the roadmap in the first one's specification is a proposal only (§23 Stages 1-4 apply).

Spacetime Geometry Experiment 2 (light cones) is built (physics model and tests, interface, prediction, run, results, tutor and a draft chapter summary), complete-flow tested in headless Chrome and finally reviewed (2026-10-13). The owner approved its wording (§28.1) and all eight differences from its specification (listed under "Implementation Notes" in `02-light-cones.md`) on 2026-10-13. The specification's Learning Objective 3 says "the sign of the interval" where the sign belongs to the interval squared; the owner has not yet decided whether to edit it. Its changes are committed.

Spacetime Geometry Experiment 3 (cause before effect) is built (physics model and tests, interface, prediction, run, results, tutor and chapter summary), complete-flow tested in headless Chrome and finally reviewed (2026-10-14), and committed. The owner approved all its learner-facing wording (§28.1) on 2026-10-14, including the introduction, caption, results, tutor and chapter summary. The review found one gap, "light-second" used before it was defined, which was fixed at the owner's request. Open items: the owner has not yet approved its differences from the specification (listed under "Implementation Notes" in `03-cause-before-effect.md`), the tutor's faster-than-light remark has not been checked against a source, and it has not been checked with a real learner or in a browser other than headless Chrome. Spacetime Geometry Experiment 4 (what you see is the past) has an approved specification (2026-10-14, all ten decisions on their defaults), proposed by Claude per §23 Stages 1 to 3. It is built (physics model and tests, interface, prediction, run, results, tutor and a draft chapter summary), complete-flow tested in headless Chrome (156 checks at all eight presets) and finally reviewed (2026-10-14), and committed (`4059763`). It is about what a telescope shows versus what the lab measures: an approaching spaceship's image looks faster than the spaceship and a receding spaceship's slower, from the travel time of light alone. The owner approved its differences from the specification (listed under "Implementation Notes" in `04-what-you-see-is-the-past.md`) on 2026-10-14, and asked for "spaceship" instead of "ship" throughout. The owner approved all its learner-facing wording (§28.1) on 2026-10-14. Open items: a source check of the tutor's sentence that nothing travels along an image faster than light (a search supports the general light-travel-time explanation of apparent faster-than-light motion, about jets seen at an angle); and a check with a real learner and in a browser other than headless Chrome. Spacetime Geometry Experiment 5 (energy, momentum and mass) was proposed by Claude per §23 Stages 1 to 3 on 2026-10-14, at the owner's request for a comprehensive experiment, and its specification is approved (2026-10-14, all eighteen decisions on their defaults; the owner delegated the number of tutors to Claude, who chose three). It has three parts (the invariant `E² − (pc)²`, a collision, and reactions including nuclear binding and the creation and destruction of particles), three tutors, a three-stage introduction and a "Words and formulas" quick-reference panel. It is built (physics model and 23 test cases in `src/physics/energyMomentum.ts` and `energyMomentum.test.ts`; the interface, prediction, run, results and tutor of all three parts in `EnergyMomentumExperiment.tsx`, `EnergyMomentumCollision.tsx`, `EnergyMomentumReactions.tsx` and the three tutor files; a chapter summary and the progress marks), complete-flow tested in Chrome (97 runs and 1,826 checks across every preset, 2026-10-15) and finally reviewed (2026-10-15), and committed (`b3b647a` to `3fed9b5`). The review's five fixes, made at the owner's request, were: the Part 3 introduction's "turned into energy" wording, Part 3's prediction now clearing when the process or setting changes, a worked moment in the Part 2 and Part 3 captions, a closing "Try the other two processes" paragraph in Part 3's tutor, and Experiment 4's "What's next" now pointing to this experiment. The owner approved all its learner-facing wording (§28.1) on 2026-10-15 ("wordings approved"). The owner approved all eight differences from the specification (listed under "Implementation Notes" in `05-energy-momentum-and-mass.md`) on 2026-10-15. Open items: some tutor claims have no source check (that the formulas were tested in accelerators, that the effect on a lump of clay or a cup of tea is too small to weigh, the 600 million tonnes of hydrogen per second, and the DESY and Okun statements on "relativistic mass"); it has not been checked at narrow widths, in a browser other than Chrome, or with a real learner; and `npm run build` fails on 23 existing TypeScript errors in other experiments' files (none in this experiment). The neutron and helium-4 nucleus masses were confirmed against CODATA 2022 on 2026-10-15 (via search results). Spacetime Geometry Experiment 6 (making new particles, with decay) was proposed by Claude per §23 Stages 1 to 3 on 2026-10-15, at the owner's request (option E, "develop option E into a proposal with decay"), and its specification is approved (2026-10-15, all seventeen decisions on their defaults). It has two parts: Part 1 compares a beam hitting a stationary target with two head-on beams for the same energy of motion (the usable and locked-in energy, and the threshold for making a new particle), and Part 2 is decay (a particle at rest splitting into two equal pieces or two light pulses). It has two tutors and a two-stage introduction. Its physics model (`src/physics/makingNewParticles.ts`) and tests (`src/physics/makingNewParticles.test.ts`, 30 test cases covering the 16 required tests, checked by eight deliberate breaks of the module) are built, and so are the interface, prediction, run, results and tutor of both parts and a draft chapter summary shown after Part 2's tutor explanation. It was complete-flow tested in Chrome (all 20 Part 1 and 24 Part 2 combinations, 2026-10-16) and finally reviewed (2026-10-16). The review's fixes, made at the owner's request, were: "became" and "turned into" for mass and energy changed to "changed form" (criterion 8), the Part 2 introduction no longer says "lighter" or "mass that goes missing" before the prediction (§12), and Experiment 5's "What's next" now points to this experiment. The owner approved all its learner-facing wording (§28.1) on 2026-10-16, including the review's rewording. Open items: the owner's approval of any differences from the specification, source checks of some tutor claims, and checks at narrow widths, in other browsers and with a real learner. No seventh experiment of this group has a specification (§23 Stages 1-4 apply).

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

---

# 29. Frontier and Beyond: Introductions and Captions

Set by the owner on 2026-10-17. The group "Frontier and Beyond" (`docs/experiments/frontier-and-beyond/`) teaches recent discoveries and findings of astronomers and scientists. Its concepts are complex and hard to grasp easily. Two rules apply to **every experiment in the group, all nineteen and any added later**, in its specification and in its interface:

1. **The introduction must be up to date, clear, detailed and in simple terms**, so that a learner with only a basic knowledge of science can understand it. Use real-life examples where they help. Its length is not a problem as long as the extra length helps the learner understand better. It may include links for a learner who wants to know more.
2. **The caption of every picture follows the same rule** (up to date, clear, detailed, simple terms, real-life examples where they help, no length limit that would cost clarity). This builds on the "How to read this diagram" standard of §14.

How to apply them:

* Draft the introduction and every caption to this standard the first time, not after owner feedback (§14).
* Links go to the original paper or an official release (a mission, observatory or collaboration page), not to news summaries. Check each link, and record it in the specification's source-status table with the date checked (§20, "Say what was not checked" in §28.6).
* "Up to date" means stating the status as of the date shown to the learner ("as of October 2026"). A fact that may change goes in the specification's "facts that may change" table.
* These rules do not override §12 or §28.1: neither an introduction nor a caption may reveal what the learner is asked to predict, and the wording is still the owner's to approve line by line.
