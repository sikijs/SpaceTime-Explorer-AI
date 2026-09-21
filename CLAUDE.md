# Claude Code Instructions — SpaceTime Explorer AI

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

The application is a guided journey, a format chosen by the project owner. `src/App.tsx` shows one experiment at a time, as a chapter, in order: Experiments 1 to 5. A sidebar lists the chapters and highlights the current one, and Previous and Next buttons move between them. Chapters are freely reachable; none is locked.

Each experiment maintains fully independent physics models, UI components, prediction state, and AI tutor behavior. `App` only sequences them; the underlying architecture remains that of separate, independent experiments. Switching chapters remounts the experiment, so its prediction and results reset.

Progress: each experiment takes an optional `onComplete` prop, called when its animation reaches the end. `App` then shows a check mark beside that chapter and saves the completed chapters and the current chapter in `localStorage` under `spacetime-explorer-progress`. Completion means the experiment ran to the end; the tutor conversation is optional for the check mark. Each experiment also takes an optional `onTutorComplete` prop, called when the learner reaches the tutor's explanation (its last step); `App` saves those chapters as `explained` in the same `localStorage` entry.

Each experiment opens with a short introduction (the question, what happens, the learner's job, and the assumptions). The Experiment 2 introduction also explains the term "reference frame", which Experiment 3 relies on. The Experiment 3, 4 and 5 introductions say that two reference frames are involved: the lab's and the moving clock's.

Text is set larger and at a medium weight, using a system sans-serif font, through `src/index.css` (the base size scales all `rem` sizes). This was chosen by the project owner for readability; do not reduce it without asking.

## Experiment Status

* **Experiment 1 (one clock):** complete.
* **Experiment 2 (two clocks at rest):** implemented.
* **Experiment 3 (moving clock):** approved specification (`03-moving-clock.md`), tested physics model, interface, prediction, results panel, and tutor are built, and it has had its complete-flow test and final review. The review's items (the lab-observer diagram, the custom duration range, introductory text, and a zero-speed baseline) have been addressed; see the implementation notes in its specification.
* **Experiment 4 (light clock):** approved specification (`04-light-clock.md`), tested physics model, interface, prediction, results, and tutor are built, and it has had its complete-flow test and final review. Its tutor refers to the time dilation factor, which Experiment 3's results panel now displays. The term "time dilation" is introduced in Experiment 3, after the learner has observed the effect (its tutor explanation and summary), and Experiment 4 is titled "The Light Clock: Why Time Dilation Happens".
* **Experiment 5 (why can't light go faster?):** approved specification (`05-invariant-light-speed.md`), tested physics model (`src/physics/invariantLightSpeedExperiment.ts`), interface, prediction, results panel, and tutor are built, and it has had its complete-flow test and final review. It shows the Experiment 4 moving light clock under two rules for light, the everyday rule (speeds add) and light's actual rule (light travels at c in the lab). Its learner-facing text was rewritten in plain language at the owner's request. See the implementation notes and the open items in its specification.

## Guided-Journey Work

* **Done:** the chapter shell (sidebar, Previous/Next), saved progress with completion check marks, introductions for Experiments 1 and 2, and the reference frame wording in Experiments 2, 3 and 4.
* **Done:** a "What you learned / What's next" summary below each experiment, shown only after the learner has run that experiment and reached the tutor's explanation, so nothing is explained early and the summary never comes before the tutor's own explanation. Until then, a short hint line says that a summary will appear there. A learner who skips the tutor's questions does not see the summary. The summaries live in the `chapters` list in `src/App.tsx`. Experiment 5's summary points to no further experiment, because none is approved yet.
* **Decided against:** a side-by-side compare view of Experiments 3 and 4.
* **Done:** the chapter layout is responsive. Below 850px wide the sidebar becomes a row of chapter buttons above the experiment (CSS classes in `src/index.css`), and the clocks in Experiments 2, 4 and 5 wrap instead of overflowing. In Experiments 4 and 5, when the moving clock travels more than 2.5 light-seconds in one tick (about 0.93c and above), the clock panels stack and are drawn in a wider box so the mirrors stay readable. In a very narrow window at such speeds the drawing is still small, because it has to fit the window width.

## Next Milestone

The next approved implementation milestone is:

**Propose the specification for the next experiment (per §23), then stop for the project owner's review. The planned progression in `docs/experiments/01-clock.md` §18 ends at Experiment 5, so the direction of the next experiment needs the owner's input first.**

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
