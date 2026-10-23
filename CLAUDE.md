# Claude Code Instructions — Cosmic Horizons

> All these concepts are complex. Use simple terms so that a user with just a basic knowledge of science should be able to understand. Make it as detailed as necessary to make the concept clear. Do not assume the user can understand these concepts easily. Explain with examples wherever possible.

## 1. Read the Project Definition First

The overall vision and purpose of Cosmic Horizons are defined in:

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

Claude Code is the implementation assistant for Cosmic Horizons.

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
   * Write every "what to look for" item in three parts (owner's rule, 2026-10-21): **Look at** (the thing to look at, named as it is drawn), **What it means** (what that feature tells the learner, in plain words and with the real numbers), and **Why it matters** (its significance for the question the experiment asks). A bare list of things to look at is not enough. Show an item only once its feature is drawn, so that a picture that builds up over stages does not explain a feature before the learner can see it. Give the meaning and the significance, but leave the full mechanism (the "why" behind a relationship) and any verdict between competing results to the tutor (§12, §13).
   * Do not reveal what the experiment shows before the learner has predicted and observed it (§12).

   As with other learner-facing wording, the caption is the owner's to approve (§28.1).

This pattern emerged in earlier experiments only through repeated, after-the-fact owner feedback. Apply it proactively on every new experiment's first UI pass.

## Reading the Results

Set by the owner on 2026-10-22, from Experiment 12. A table of scientific numbers is like an X-ray or a blood test: the learner cannot read it until someone explains it. So **every experiment's Results panel must come with a plain-language reading guide**, drafted the first time and not retrofitted from owner feedback. The guide uses simple terms and gives the real numbers; its length is not limited if it helps. It has these parts, as the experiment's results allow:

1. **A "check-up" table**, near the top of the Results, that sets what we would expect beside what was found, with a plain reading of each row (for example "close", "weak on its own", "not settled"). Use it only where a real reference exists, such as a value the same physics predicts, a published value, or a range the sources give. Do not invent cut-offs such as "close enough", and do not use "healthy", "normal" or "abnormal" for a result that has no accepted range. Say "the same", "more" or "less" when there is no range.
2. **A note under each table**, headed "What this table tells us". Each item says **what it is**, **what it means with the real numbers**, and **why it matters**, in plain words, with a daily-life comparison or a short worked calculation where it clears up a mechanism (§15). Say how sure the number is when that is the weak link.
3. **For a table that follows the learner's controls:** a "Published value" column and a "How yours compares" column beside "Your value", and a short paragraph ("What your numbers show") that updates with the settings and says what changed, whether each earlier check still holds, and why. Call the learner's settings "trial values" or "your own numbers", never "what-ifs" (the owner found "what if" confusing). End with a line saying they are trial values and do not say the real system is like that.
4. **The learner's predictions, shown beside the results**: a short block giving each prediction's guess, the question it was about, and the table row where its number appears, with a small tag on that row. It shows the guess only, never "matched" or "right" (that is the tutor's job, §12, §13), unless the owner decides otherwise for an experiment.

How to apply them:

* Every number in the guide and every comparison comes from the physics module, tested, and the interface only displays it (§9). Add the comparison functions and their tests to the module.
* The guide may name what each number means and why it matters, but it must not give the full mechanism or a verdict between competing explanations. Those stay with the tutor (§12, §13), and it must not reveal what the learner is asked to predict before they have predicted (§12).
* The wording is the owner's to approve line by line (§28.1). Draft it, show it, then build it, and check the page in a browser (§28.4).
* The specification records the guide (§28.2).
* Built so far: Experiment 12 of Frontier and Beyond (committed `b708678`). Experiments 1 to 11 and the other groups do not have it yet. Whether to add it to them is the owner's decision, one experiment at a time, and is not started.

## Predictions Do Not Change the Results

Set by the owner on 2026-10-23, from Experiment 12, where a learner changed their predictions, pressed Run, and saw no change in the pictures or the tables. A learner's predictions are their own guesses, made before they see anything. They never change the pictures, the tables or any number, because the results come from the physics (§9) and not from the guesses. The learner must be told this on the page, so that "nothing changed" is not mistaken for a fault. **Every experiment with a prediction must say, in plain words:**

1. **In the introduction** (in the part that says what the learner will do): that the predictions are the learner's own guesses and do not change the pictures or tables, that they are shown again beside the results so the learner can compare, and which controls, if any, do change the pictures and tables. It must not say what the answers are (§12).
2. **Beside the controls** (if the experiment has controls that follow the learner's settings, such as "Now try it yourself"): that the predictions do not change the pictures or tables, but these settings do, and that while every setting is on its published value the comparison table says "the same" in every row, so the learner should change a setting to see it move.
3. An experiment with a prediction and no controls says only the first point.

How to apply it: draft the wording the first time (§14), show it for the owner's approval (§28.1), record it in the specification (§28.2), and check the page in a browser (§28.4). Built so far: Experiment 12 of Frontier and Beyond. Experiments 1 to 11 and the other groups do not have it yet. Whether to add it to them is the owner's decision, one experiment at a time, and is not started.

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

Implement prediction, observation, and other educational interactions specified by the experiment. Tell the learner that their predictions do not change the pictures or tables (§14, "Predictions Do Not Change the Results").

### Step 7 — Results

Display the experimental results clearly, with the reading guide described in §14 ("Reading the Results"): a check-up, a note under each table, a comparison for tables the learner controls, and the learner's predictions beside the results.

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

**Frontier and Beyond** (`docs/experiments/frontier-and-beyond/`). The project's last group, set out by the owner on 2026-10-16: twenty-four experiments (nineteen approved on 2026-10-16, five on stars added on 2026-10-22) on results of 2022 to 2026, each labelled with how settled its result is (Settled, Strong evidence, Contested or Open) and dated "as of October 2026". The list of twenty-four is approved (`00-group-proposal.md`; on 2026-10-22 the owner approved a new Part C of stars, Experiments 12 to 17: Betelgeuse, SN 2023ixf, a white dwarf, a neutron star, the origin of gold and a star that vanished, with the old Experiments 12 to 19 renumbered 18 to 24) and each experiment is built one at a time, with its own specification and approval (§23 Stages 3 and 4). Experiments 1 to 13 are built; Experiments 14 to 24 have no specification. The group's own rules are in §29 (fuller introductions and captions, and a "Want to know more?" list of links on every experiment page).

| # | Title | Specification | Status |
|---|---|---|---|
| 1 | Two measurements of the expansion rate: why don't they agree? (the Hubble tension) | `01-hubble-tension.md` | Specification approved 2026-10-17 (all ten decisions on their defaults); built (physics model and 28 tests in `src/physics/hubbleTension.ts`; interface, two predictions, a seven-stage run, three pictures, results, a "What if the error bars were bigger?" control, a "Words and formulas" panel, tutor and chapter summary in `HubbleTensionExperiment.tsx` and `HubbleTensionTutor.tsx`), complete-flow tested in Chrome (all 36 combinations) and finally reviewed 2026-10-17; wording approved (2026-10-17, and the panel entries for "gap", "combined give-or-take" and "bell curve", the group overview sentence and the NASA and ESA links approved 2026-10-19); all differences from the spec and the review's five fixes approved 2026-10-19; committed; status label Contested. Open: some general statements have no source check (that Cepheids, supernovae and parallax give distances as written, "5 sigma is the usual bar" beyond particle physics, a cosmology example of a tension that disappeared, the megaparsec conversion), and it has not been checked in other browsers or with a real learner |
| 2 | Does dark energy change? (DESI) | `02-does-dark-energy-change.md` | Specification approved 2026-10-19 (all ten decisions on their defaults); built (physics model and 32 tests in `src/physics/evolvingDarkEnergy.ts`, checked by nineteen deliberate breaks; interface, two predictions, a six-stage run, three pictures, results, a "How far back?" control, a "Words and formulas" panel, tutor and chapter summary in `EvolvingDarkEnergyExperiment.tsx` and `EvolvingDarkEnergyTutor.tsx`), complete-flow tested in Chrome (all 36 combinations, with the stage timer shortened for speed) and finally reviewed 2026-10-19; wording and differences approved at each step on 2026-10-19, including a long introduction with a section on supernovae and on electron degeneracy pressure, a rewritten Picture 2 caption, and five added definitions (matter fraction, CMB, quasar, the Lyman-alpha forest, calibration); committed; status label Contested. The specification was brought in line with the built experiment on 2026-10-19 (the owner approved eleven edits). Decision 10 settled 2026-10-19 (DESI's 2.7 sigma is drawn as a sixth bar; its 3.2 stays a table row); open: some tutor and introduction claims have no source check (the Lyman-alpha forest, quasar and kitchen-scale descriptions, CERN's statement about 3 and 4 sigma hints, "about 500 million light-years", "about the size of the Earth"); and it has not been checked in other browsers, with a keyboard or with a real learner |
| 3 | How lumpy is the universe? A tension that went away, in one survey (S₈: KiDS, DES) | `03-how-lumpy-is-the-universe.md` | Specification approved 2026-10-19 (all thirteen decisions on their defaults, including the label Contested, because the Dark Energy Survey's 2026 result is still below the microwave-background value while KiDS's tension went away); built (physics model and 25 tests in `src/physics/lumpiness.ts`, checked by thirteen deliberate breaks; interface, two predictions, a five-stage run, three pictures, a three-panel weak-lensing drawing, results, a "Look closer at" control, a "Words and formulas" panel, tutor and chapter summary in `LumpinessExperiment.tsx` and `LumpinessTutor.tsx`), complete-flow tested in Chrome (all nine prediction pairs, with the stage timer shortened for speed) and finally reviewed 2026-10-19; wording and differences approved at each step, and the review's five fixes approved and built 2026-10-19 (the links that reveal the predictions' answers moved to after the run, a factual correction about KiDS-Legacy using more sky, defined names, the spec brought in line, this entry); committed; status label Contested. Open: some introduction and tutor claims have no source check (galaxies are not round to begin with, distances come from colours, σ₈ as ripples in regions of one standard size, ESA's page read only in summary); three possibly relevant newer results (an HSC Year 3 recalibration, a note that analysis choices shift S₈ by 0.03 to 0.05, a KiDS-Legacy third-order follow-up) were seen in search summaries only and are not on the page; the title still hints at Prediction 1; and it has not been checked in other browsers, with a keyboard or with a real learner |
| 4 | Can the universe weigh a neutrino? (DESI's limit on the neutrino mass: the floors from oscillation experiments and the ceilings from the sky) | `04-can-the-universe-weigh-a-neutrino.md` | Specification approved 2026-10-19 (all fourteen decisions on their defaults, including the label Contested and a model of three simple effects, not DESI's full analysis); built (physics model and 32 tests in `src/physics/neutrinoMass.ts`, checked by nineteen deliberate breaks; interface, two predictions, a five-stage run, three pictures, a "Try a different total mass" control, results, a "Words and formulas" panel, tutor and chapter summary in `NeutrinoMassExperiment.tsx` and `NeutrinoMassTutor.tsx`), complete-flow tested in Chrome (all six prediction combinations and all five totals) and finally reviewed 2026-10-19; committed; the review's nine findings were fixed at the owner's request on 2026-10-19; status label Contested. wording approved (2026-10-19, covering Steps 2 to 5, the two sections added at the owner's request, "Why weigh a neutrino?" and "What is DESI?", the review's fixes and the new Experiment 3 "What's next" sentence); all the differences from the specification approved (2026-10-19; listed under "Implementation Notes" in `04-can-the-universe-weigh-a-neutrino.md`); Open: the mass-squared gaps behind the floors are NuFIT 6.0's numbers taken from a search result, not read at the paper's table; the textbook relations (93.14 eV, 8 × share, 3.151 k T), the free-streaming explanation and the claim that surveys measure clump sizes to a few percent have no primary source read; the neutrino sea and the electron-volt have no plain official link; four newer results (a full-data KATRIN result, tighter combined limits, a 2.7 sigma preference for a positive mass, neutrino decays) were seen in search summaries only and are not on the page; and it has not been checked in other browsers, with a keyboard or with a real learner |
| 5 | How early can galaxies form? (JWST's earliest galaxies: MoM-z14, redshift 14.44) | `05-how-early-can-galaxies-form.md` | Specification approved 2026-10-20 (all thirteen decisions on their defaults); built (physics model and 34 tests in `src/physics/earliestGalaxies.ts`, checked by nineteen deliberate breaks; interface, two predictions, a five-stage run, three pictures, two results tables, a "Look at another galaxy" control with an imaginary-galaxy slider, a "Words and formulas" panel, tutor and chapter summary in `EarliestGalaxiesExperiment.tsx` and `EarliestGalaxiesTutor.tsx`), complete-flow tested in Chrome (all 12 prediction combinations, each with 8 to 11 control settings checked against a separate numerical integration, 2026-10-20) and finally reviewed 2026-10-20, with the review's findings fixed at the owner's request the same day; committed; status label "Strong evidence that these galaxies exist; Open: what built them so fast". **wording approved (2026-10-20, covering the introduction, captions, predictions, results, panel, links, tutor and chapter summary, and Experiment 4's changed "What's next"); the owner has not yet approved its differences from the specification** (listed in `05-how-early-can-galaxies-form.md`). Open: some introduction and tutor claims have no source check (less dust and a different mix of star sizes as proposed explanations, ALMA's description, the Lyman-alpha break explanation, that the age and distances do not depend on how galaxies form); no plain official page was found for the Lyman-alpha break; three 2026 papers (Heintz, Zhang, an October 2026 review) and the Naidu paper's discussion were read only in part or in abstract; and it has not been checked in other browsers, with a keyboard or with a real learner |
| 6 | Where is the dark matter? What a search that finds nothing teaches (LZ's 2025 limits and its September 2026 event) | `06-where-is-the-dark-matter.md` | Specification approved 2026-10-20 (all fourteen decisions on their defaults); built (physics model and 28 tests in `src/physics/darkMatterSearches.ts`, checked by sixteen deliberate breaks; interface, two predictions, a five-stage run, three pictures, "Try your own search" and "How many places did you look?" controls, two results tables, a "Words and formulas" panel, tutor and chapter summary in `DarkMatterSearchesExperiment.tsx` and `DarkMatterSearchesTutor.tsx`), complete-flow tested in Chrome (all nine prediction pairs, with the controls checked against a separate calculation, 2026-10-20) and finally reviewed 2026-10-20, with the review's findings fixed the same day; wording approved (2026-10-20, step by step, and the final fixes: sourced descriptions in the introduction, renamed Picture 3 bars, a stage 1 highlight); all differences from the specification approved 2026-10-20 (listed in `06-where-is-the-dark-matter.md`); committed; status label "Strong evidence about what dark matter is not; Open: what it is, and what one unexplained event means". Open: the LZ December 2025 paper was not found; the three September 2026 abstracts were read directly, but no full paper was; some tutor claims have no primary source (that the Sun's neutrinos are a background for the search is from the Imperial page only); the XENONnT and PandaX-4T boron-8 results have no year in Table 2; Experiment 5's "What's next" does not yet point to this experiment; and it has not been checked at narrow widths, in other browsers, with a keyboard or with a real learner |
| 7 | Do we need dark matter, or does gravity change? (wide binary stars; MOND, hidden companions) | `07-wide-binary-stars.md` | Specification approved 2026-10-20 (all fourteen decisions on their defaults, including the label Contested and a boost of γ = 1.4 taken from the papers, not derived); built (physics model and 25 tests in `src/physics/wideBinaries.ts`, checked by fifteen deliberate breaks; interface, two predictions, a five-stage run, three pictures, two controls ("Choose a pair" and "How many pairs are really triples?"), results tables, a "Words and formulas" panel, tutor and chapter summary in `WideBinariesExperiment.tsx` and `WideBinariesTutor.tsx`), complete-flow tested in Chrome (all 12 prediction pairs and 75 control settings checked against a separate calculation, 2026-10-21) and finally reviewed 2026-10-21, with the review's four wording fixes made at the owner's request (the introduction no longer gives Prediction 1's size, an unsourced "3 sigma" is replaced by γ = 1.60 (+0.24, −0.14), the 2,463-binary paper is "2024" throughout, a number format); a dark matter versus dark energy paragraph was added to the introduction at the owner's request; committed; status label Contested. **Wording approved (2026-10-21, covering the introduction, captions, predictions, results, panel, links, tutor and chapter summary); all differences from the specification approved (2026-10-21; listed in `07-wide-binary-stars.md`).** Open: MOND, the external field effect and orbital speed have no plain official link; the dark-matter density, a₀, the constants and the car-on-a-bend comparison have no source read; the Chae 2024 publication year was not read; Experiment 6's "What's next" does not point to this experiment; and it has not been checked at narrow widths, in other browsers, with a keyboard or with a real learner |
| 8 | Does antimatter fall down? (ALPHA-g: a ratio of 0.75 ± 0.21 to g, and what a measurement with a give or take can and cannot tell) | `08-does-antimatter-fall-down.md` | Specification approved 2026-10-21 (all thirteen decisions on their defaults); built (physics model and 24 tests in `src/physics/antimatterGravity.ts`, checked by twenty-three deliberate breaks; interface, two predictions, a five-stage run, three pictures, three controls, four tables, a "Words and formulas" panel, tutor and chapter summary in `AntimatterGravityExperiment.tsx` and `AntimatterGravityTutor.tsx`), complete-flow tested in Chrome (all nine prediction pairs, 105 control settings and 18 table checks against a separate calculation) and finally reviewed 2026-10-21; wording and all differences approved 2026-10-21, including the review's fixes (terms defined, a simpler dart comparison, "gap" in the panel, Experiment 7's "What's next" now pointing here) and a note that two reviews give the precision as about 20 and about 25 percent; the specification was brought in line with the built experiment on 2026-10-21; status label "Strong evidence that antihydrogen is attracted to the Earth; Open: whether it falls exactly as ordinary matter does". The Step 2 drawing, which had the detectors at the ends of the trap, was corrected after the owner's question (they surround it). Open: the plans and the 2024 repeat come from reviews of March and December 2025 and the page says no newer result was found, although the search was limited; the December review was read through summaries; the outline of atomic and Moiré interferometry is unsourced; "the walls of the apparatus" is the paper's own phrase and the paper does not say which walls; Experiment 5's and Experiment 6's "What's next" do not point forward; and it has not been checked at narrow widths, in other browsers, by keyboard or with a real learner |
| 9 | Can a clock tell how high it is? (optical lattice clocks: a higher clock ticks faster by g × h ÷ c², and how small a height the best clocks can notice) | `09-can-a-clock-tell-its-height.md` | Specification approved 2026-10-21 (all thirteen decisions on their defaults); built (physics model and 22 tests in `src/physics/clockHeight.ts`, checked by twenty-two deliberate breaks; interface, two predictions, a five-stage run, three pictures, three controls, four tables, a "Words and formulas" panel, tutor and chapter summary in `ClockHeightExperiment.tsx` and `ClockHeightTutor.tsx`), complete-flow tested in Chrome (all nine prediction pairs, 51 control settings and 9 table checks against a separate calculation) and finally reviewed 2026-10-21; wording and the review's fixes approved 2026-10-21 (the review found that using clocks to measure heights had already been demonstrated in field tests, in 2018 across about 1,000 m and in 2020 across 450 m, so the status label now says "Demonstrated in principle, not yet routine"; "accuracy and precision" got a panel entry; NIST's 2010 release was added as a plain account, shown after the run; Experiment 8's "What's next" now points here); the specification was brought in line with the built experiment on 2026-10-21; status label "Settled: a higher clock ticks faster, seen across about a millimetre, a centimetre and, in field tests, hundreds of metres to a kilometre; Demonstrated in principle, not yet routine: measuring heights with clocks; Planned: redefining the second". Open: the JILA, Wisconsin, 2018 (Grotti) and 2020 (Takamoto) papers were read only through abstracts, releases or summaries (the JILA gradient itself is unread); the 28th CGPM's Resolution 4 and the two field-test releases were read through summaries; the outline of how an optical clock works and "atoms absorb light at a predictable frequency" have only NIST's wording behind them; a 2025 mountain-top campaign (4,300 m) was seen only in a search summary and is not on the page; Experiment 5's and Experiment 6's "What's next" do not point forward; and it has not been checked at narrow widths, in other browsers, by keyboard or with a real learner |
| 10 | Does time tick faster on the Moon? (lunar clocks: gravity and motion slow a clock, and the Moon's clock is slowed less than the Earth's) | `10-does-time-tick-faster-on-the-moon.md` | Specification approved 2026-10-21 (all thirteen decisions on their defaults, with decisions 7, 8 and 10 refined by the source check); built (physics model and 21 tests in `src/physics/lunarClocks.ts`, checked by twenty deliberate breaks; interface, two predictions, a five-stage run, three pictures, controls, four tables, a "Words and formulas" panel, tutor and chapter summary in `LunarClocksExperiment.tsx` and `LunarClocksTutor.tsx`), complete-flow tested in Chrome (all nine prediction pairs, 72 control settings and the fixed tables against a separate calculation) and finally reviewed 2026-10-21; wording and the review's fixes approved 2026-10-21 (coordinate time, TCL, TT, CIPM and geostationary orbit defined; the NIST abstract's selenoid and geoid wording noted; "in more than 50 years" instead of "since 1972"; Experiment 9's "What's next" now pointing here); the specification was brought in line with the built experiment on 2026-10-21; status label "Strong evidence (a calculation from relativity tested on Earth, in orbit and across heights) that a lunar clock gains about 56 microseconds a day; Open: no clock on the Moon has yet measured it". Open: NIST's paper was read only in its abstract, the IAU's resolution text and the White House memorandum were not read, the figures 56 and 58.7 are explained from the "Lunar Time" paper's 56 and 2.7 (the identification of 58.7 as their sum is not stated by the paper); the 17 km navigation example and the blink duration are unsourced; ESA's NovaMoon beacon, no lunar-clock measurement and no ACES result were seen only in search summaries and are not on the page; Experiment 5's and Experiment 6's "What's next" do not point forward; and it has not been checked at narrow widths, in other browsers, by keyboard or with a real learner |
| 11 | The fastest spacecraft: how much does its clock lag? (Parker Solar Probe: near the Sun gravity and motion both slow a clock, almost equally, and the lag changes round the orbit) | `11-the-fastest-spacecraft.md` | Specification approved 2026-10-22 (all ten decisions on their defaults); built (physics model and 28 tests in `src/physics/fastestSpacecraft.ts`, checked by seventeen deliberate breaks; interface, two predictions, a five-stage run, three pictures, two controls (a point on the orbit, and a time), four tables, a "Words and formulas" panel, tutor and chapter summary in `FastestSpacecraftExperiment.tsx` and `FastestSpacecraftTutor.tsx`), complete-flow tested in Chrome (all nine prediction pairs and 27 control settings against a separate calculation) and finally reviewed 2026-10-22; wording of each step, the review's fixes (abbreviations defined, `speedAt` moved into the physics module, the specification brought in line, two links added, picture descriptions made to follow the controls) and all differences from the first proposal approved 2026-10-22 (listed under "Implementation Notes" in `11-the-fastest-spacecraft.md`; they include dropping the Moon bar from Picture 1 and a finding the plan did not have, that in this model the probe's clock is very slightly ahead of the Earth's beyond 0.70 AU); committed; status label "Settled (the probe's distance and speed, and the physics); a calculation, not a measurement by this mission (the lag)". Open: the 88-day period, the Sun's radius, the Earth's orbital speed and Venus at 0.72 AU have no source read for the page; the Fox and others publisher page and the APL mission page were not read (the abstract was read on Princeton's record); "no measurement by the mission was reported" is limited to the sources read; the 0.10 ms "ahead" figure rests on the oval model; Experiment 5's and Experiment 6's "What's next" do not point forward; and it has not been checked in other browsers, by keyboard or with a real learner (its drawings become small at narrow widths, as in the group's other experiments) |
| 12 | A star near the end of its life: what is Betelgeuse, and does it have a companion? (the first of the stars added on 2026-10-22: Betelgeuse's size from an angle and a distance, a 6-year orbit inside a supergiant, and a 1.5 sigma hint from 2025 that other teams' 2026 evidence supports) | `12-betelgeuse-and-its-companion.md` | Specification approved 2026-10-22 (all twelve decisions on their defaults, including a status label that changed the proposal's "Open" for the companion to "Strong evidence", and a size model from angular diameter and distance); built (physics model and 44 tests in `src/physics/betelgeuseCompanion.ts`, checked by deliberate breaks; interface, two predictions, a five-stage run, three pictures, three controls, four tables, a "Words and formulas" panel, tutor and chapter summary in `BetelgeuseCompanionExperiment.tsx` and `BetelgeuseCompanionTutor.tsx`), complete-flow tested in Chrome (all nine prediction pairs and 298 control checks against a separate calculation) and finally reviewed 2026-10-22; wording of each step and all nine of the review's fixes approved 2026-10-22 (a wrong "mean" and two over-strong claims corrected, three links added, arithmetic moved into the module, the title changed from "may be about to explode" to the present one, `AGENTS.md` and `PROJECT.md` updated to twenty-four, the specification brought in line); status label "Settled (red supergiant); Strong evidence (a companion exists, no clear direct image yet); Open (its mass and exact nature)". Open: no paper was read in full; the ± on Goldberg's 1.17 solar masses is ± 0.7 in the abstract and ± 0.07 elsewhere; the quoted elongation dates imply a 5.9-year period, not the model's 5.77; the ESO and NOIRLab releases were not read; no plain official page for angular size; the planets' distances, "orange-red" and the fusion wording beyond NASA StarChild have no source read; Experiment 11's "What's next" names no experiment; and it has not been checked in other browsers, by keyboard or with a real learner (its pictures become small at narrow widths, as in the group's other experiments) |
| 13 | Catching a supernova in the act: what exploded, and where did the energy go? (SN 2023ixf: a core-collapse supernova in M101 whose star was photographed before it exploded; the energy of the collapse, how little of it is light, how long ago the light left, and why the star's mass is contested) | `13-catching-a-supernova.md` | Specification approved 2026-10-23 (all twelve decisions on their defaults); built (physics model and 49 tests in `src/physics/catchingASupernova.ts`, checked by deliberate breaks; interface, two predictions, a five-stage run, three pictures, two controls (the collapsing core, and the speed of the gas; a distance control was dropped at the owner's request on 2026-10-23), four tables, a "Words and formulas" panel, tutor and chapter summary in `CatchingASupernovaExperiment.tsx` and `CatchingASupernovaTutor.tsx`), complete-flow tested in Chrome (all 12 prediction pairs and all 27 control settings against a separate calculation) and finally reviewed 2026-10-23, with the review's six findings fixed the same day (display arithmetic moved into the physics module, a "Solar mass" Words entry, a test for `nearestLog`, the specification brought in line on the mass range, the iron-core sources recorded, this entry); committed. **Wording approved (2026-10-23, "wording is all approved", covering all learner-facing wording: the introduction, captions, predictions, results, panel, links, tutor, chapter summary, the "Solar mass" entry and Experiment 12's changed "What's next"); the differences from the specification (listed in `13-catching-a-supernova.md`) were approved the same day.** Status label: Strong evidence that a red supergiant exploded; Strong evidence from theory and from SN 1987A that almost all the energy leaves as neutrinos (none were reported from SN 2023ixf); Contested (the star's mass, from about 8 to 24 solar masses); Open (why it shed so much gas). Open: the radiated energy of SN 2023ixf itself, the Sun's whole-life energy, the Riess distance and four of the mass values have no source read; the stalled shock and neutrino heating rest on one research review read through an HTML copy (Burrows and Vartanyan 2021) and the abstract of another, not on a NASA page; Chandra's massive-star page says "radiation pressure" for the iron core, which the page does not follow; Experiment 5's and Experiment 6's "What's next" do not point forward; and it has not been checked in other browsers, at narrow widths, by keyboard or with a real learner |

**Recurring open items** (details in `docs/STATUS.md`): most general-knowledge statements in Cosmology and Black Holes learner-facing text were checked against sources on 2026-10-13 (see STATUS.md); the 2011 Nobel Prize claim, the original papers behind several formulas, and a few hand-derived formulas remain unchecked, and each experiment's specification lists them.

## Guided-Journey Work

* **Done:** the chapter shell (sidebar, Previous/Next), saved progress with completion check marks, introductions for Experiments 1 and 2, and the reference frame wording in Experiments 2, 3 and 4.
* **Done:** a "What you learned / What's next" summary below each experiment, shown only after the learner has run that experiment and reached the tutor's explanation, so nothing is explained early and the summary never comes before the tutor's own explanation. Until then, a short hint line says that a summary will appear there. A learner who skips the tutor's questions does not see the summary. The summaries live in the `chapters` list in `src/App.tsx`, grouped under phase headings (see below). Experiment 11's summary now points forward to the Gravity and Curved Spacetime chapter; that chapter's own Experiment 3 summary points to no further experiment, because none beyond it is approved yet.
* **Decided against:** a side-by-side compare view of Experiments 3 and 4.
* **Done:** the chapter layout is responsive. Below 850px wide the sidebar becomes a row of chapter buttons above the experiment (CSS classes in `src/index.css`), and the clocks in Experiments 2, 4 and 5 wrap instead of overflowing. In Experiments 4 and 5, when the moving clock travels more than 2.5 light-seconds in one tick (about 0.93c and above), the clock panels stack and are drawn in a wider box so the mirrors stay readable. In a very narrow window at such speeds the drawing is still small, because it has to fit the window width.
* **Done:** the sidebar groups chapters under named phase headings (`groupOrder` in `src/App.tsx`). A phase with no chapters yet still shows its heading, with a "coming after..." placeholder instead of a chapter list, so the learner can see what's ahead. Currently: "Relativity of Time and Motion" (Experiments 1–11), "Gravity and Curved Spacetime" (Experiments 1–9), and "Gravitational Waves" (its own Experiment 1, ripples in spacetime). Later groups added: "Cosmology" and "Black Holes and Strong Gravity" (Experiments 1 to 10 are built). Later: "Spacetime Geometry: What Is Real, What Is Seen" (Experiments 1 to 10 are built). Newest group: "Frontier and Beyond" (Experiments 1 to 13 are built).
* **Done (2026-10-12; committed with the owner's go-ahead; its wording was approved on 2026-10-12, as written, with Experiment 9's):** a group can have a one-sentence overview, shown under its title on every chapter page of that group (`groupOverviews` in `src/App.tsx`, style `.experiment-group-overview` in `src/index.css`). Two groups have one: Black Holes and Strong Gravity, chosen by the owner when Experiment 9 (how a black hole forms) was kept as the ninth, not the first, experiment. A final clause, "and how one might end", was added on 2026-10-12 after Experiment 10 (Hawking radiation) was built, at the owner's request; the owner approved that wording on 2026-10-12, so the whole sentence is approved. Frontier and Beyond has one too ("This group follows recent results that are still being tested..."), approved by the owner on 2026-10-19 with Experiment 1's wording.
* **Done:** the shared `.toggle-button` style (`src/index.css`, used by every experiment's prediction/choice buttons) was too faint against the page's white card background. Fixed in two passes at the owner's request: background changed from pure white to a light-lavender tint (`#e4e8f5`, `#c9cee0` border), and `cursor: pointer`/`cursor: not-allowed` added (native `<button>` defaults to an arrow cursor otherwise). Applies globally, across every experiment.

## What Remains

Black Holes Experiment 7 (the color of the fall) is built, tested and reviewed, and its wording is approved. Black Holes Experiment 8 (spinning black holes) has an approved specification (2026-10-12) and is complete (built, tested, reviewed), and its wording is approved. Black Holes Experiment 9 (how a black hole forms) has an approved specification (2026-10-12) and is complete (built, tested, reviewed), and its wording is approved. Black Holes Experiment 10 (Hawking radiation) has an approved specification (2026-10-12) and is complete (built, tested, complete-flow tested, reviewed, committed), and its wording is approved. Otherwise nothing is in progress. The overall project vision, the four completed chapters (Relativity of Time and Motion, Gravity and Curved Spacetime, Gravitational Waves, Cosmology) and the ten built experiments of the Black Holes and Strong Gravity group. For Cosmology, the specification of Experiment 10 names a recollapsing universe, dark energy that changes with time, the cosmic event horizon, and the far future of stars and black holes as natural candidates, but none is proposed. Any next experiment needs a proposal and an approved specification first (§23 Stages 1-4).

Spacetime Geometry Experiment 1 (the interval) is complete: specification approved, physics model and tests, interface, prediction, run, results, tutor and chapter summary built and committed, complete-flow tested in headless Chrome and finally reviewed (2026-10-13). The owner approved its differences from the specification on 2026-10-13; its open items are a check with a real learner and in a browser other than headless Chrome. No second experiment of this group has a specification; the roadmap in the first one's specification is a proposal only (§23 Stages 1-4 apply).

Spacetime Geometry Experiment 2 (light cones) is built (physics model and tests, interface, prediction, run, results, tutor and a draft chapter summary), complete-flow tested in headless Chrome and finally reviewed (2026-10-13). The owner approved its wording (§28.1) and all eight differences from its specification (listed under "Implementation Notes" in `02-light-cones.md`) on 2026-10-13. The specification's Learning Objective 3 says "the sign of the interval" where the sign belongs to the interval squared; the owner has not yet decided whether to edit it. Its changes are committed.

Spacetime Geometry Experiment 3 (cause before effect) is built (physics model and tests, interface, prediction, run, results, tutor and chapter summary), complete-flow tested in headless Chrome and finally reviewed (2026-10-14), and committed. The owner approved all its learner-facing wording (§28.1) on 2026-10-14, including the introduction, caption, results, tutor and chapter summary. The review found one gap, "light-second" used before it was defined, which was fixed at the owner's request. Open items: the owner has not yet approved its differences from the specification (listed under "Implementation Notes" in `03-cause-before-effect.md`), the tutor's faster-than-light remark has not been checked against a source, and it has not been checked with a real learner or in a browser other than headless Chrome. Spacetime Geometry Experiment 4 (what you see is the past) has an approved specification (2026-10-14, all ten decisions on their defaults), proposed by Claude per §23 Stages 1 to 3. It is built (physics model and tests, interface, prediction, run, results, tutor and a draft chapter summary), complete-flow tested in headless Chrome (156 checks at all eight presets) and finally reviewed (2026-10-14), and committed (`4059763`). It is about what a telescope shows versus what the lab measures: an approaching spaceship's image looks faster than the spaceship and a receding spaceship's slower, from the travel time of light alone. The owner approved its differences from the specification (listed under "Implementation Notes" in `04-what-you-see-is-the-past.md`) on 2026-10-14, and asked for "spaceship" instead of "ship" throughout. The owner approved all its learner-facing wording (§28.1) on 2026-10-14. Open items: a source check of the tutor's sentence that nothing travels along an image faster than light (a search supports the general light-travel-time explanation of apparent faster-than-light motion, about jets seen at an angle); and a check with a real learner and in a browser other than headless Chrome. Spacetime Geometry Experiment 5 (energy, momentum and mass) was proposed by Claude per §23 Stages 1 to 3 on 2026-10-14, at the owner's request for a comprehensive experiment, and its specification is approved (2026-10-14, all eighteen decisions on their defaults; the owner delegated the number of tutors to Claude, who chose three). It has three parts (the invariant `E² − (pc)²`, a collision, and reactions including nuclear binding and the creation and destruction of particles), three tutors, a three-stage introduction and a "Words and formulas" quick-reference panel. It is built (physics model and 23 test cases in `src/physics/energyMomentum.ts` and `energyMomentum.test.ts`; the interface, prediction, run, results and tutor of all three parts in `EnergyMomentumExperiment.tsx`, `EnergyMomentumCollision.tsx`, `EnergyMomentumReactions.tsx` and the three tutor files; a chapter summary and the progress marks), complete-flow tested in Chrome (97 runs and 1,826 checks across every preset, 2026-10-15) and finally reviewed (2026-10-15), and committed (`b3b647a` to `3fed9b5`). The review's five fixes, made at the owner's request, were: the Part 3 introduction's "turned into energy" wording, Part 3's prediction now clearing when the process or setting changes, a worked moment in the Part 2 and Part 3 captions, a closing "Try the other two processes" paragraph in Part 3's tutor, and Experiment 4's "What's next" now pointing to this experiment. The owner approved all its learner-facing wording (§28.1) on 2026-10-15 ("wordings approved"). The owner approved all eight differences from the specification (listed under "Implementation Notes" in `05-energy-momentum-and-mass.md`) on 2026-10-15. Open items: some tutor claims have no source check (that the formulas were tested in accelerators, that the effect on a lump of clay or a cup of tea is too small to weigh, the 600 million tonnes of hydrogen per second, and the DESY and Okun statements on "relativistic mass"); it has not been checked at narrow widths, in a browser other than Chrome, or with a real learner; and `npm run build` failed on 23 TypeScript errors in other experiments' files when this was written (none in this experiment; all fixed on 2026-10-19, see §27 What Remains). The neutron and helium-4 nucleus masses were confirmed against CODATA 2022 on 2026-10-15 (via search results). Spacetime Geometry Experiment 6 (making new particles, with decay) was proposed by Claude per §23 Stages 1 to 3 on 2026-10-15, at the owner's request (option E, "develop option E into a proposal with decay"), and its specification is approved (2026-10-15, all seventeen decisions on their defaults). It has two parts: Part 1 compares a beam hitting a stationary target with two head-on beams for the same energy of motion (the usable and locked-in energy, and the threshold for making a new particle), and Part 2 is decay (a particle at rest splitting into two equal pieces or two light pulses). It has two tutors and a two-stage introduction. Its physics model (`src/physics/makingNewParticles.ts`) and tests (`src/physics/makingNewParticles.test.ts`, 30 test cases covering the 16 required tests, checked by eight deliberate breaks of the module) are built, and so are the interface, prediction, run, results and tutor of both parts and a draft chapter summary shown after Part 2's tutor explanation. It was complete-flow tested in Chrome (all 20 Part 1 and 24 Part 2 combinations, 2026-10-16) and finally reviewed (2026-10-16). The review's fixes, made at the owner's request, were: "became" and "turned into" for mass and energy changed to "changed form" (criterion 8), the Part 2 introduction no longer says "lighter" or "mass that goes missing" before the prediction (§12), and Experiment 5's "What's next" now points to this experiment. The owner approved all its learner-facing wording (§28.1) on 2026-10-16, including the review's rewording. Open items: the owner's approval of any differences from the specification, source checks of some tutor claims, and checks at narrow widths, in other browsers and with a real learner. No seventh experiment of this group has a specification (§23 Stages 1-4 apply).

Frontier and Beyond Experiments 1 to 13 are built (see the table above). Experiment 13 ("Catching a supernova in the act: what exploded, and where did the energy go? (SN 2023ixf)") is built, tested, complete-flow tested in Chrome and finally reviewed (2026-10-23); the review's six findings were fixed the same day, and its specification was brought in line with the built experiment (its learner-facing wording was all approved by the owner on 2026-10-23). The next milestone after it is Experiment 14 of the group, the fourteenth of the twenty-four, the third of the stars added on 2026-10-22 ("What makes a white dwarf explode? (the double-detonation remnant)", per `00-group-proposal.md`); its specification was approved on 2026-10-23 (`14-what-makes-a-white-dwarf-explode.md`, all twelve decisions on their defaults) and its physics model and tests (`src/physics/whiteDwarfExplosion.ts`, 32 tests) are built; the interface and everything after it are not. Every experiment of the group follows §29, including its links rule. The check that covers the source is `tsc --noEmit -p tsconfig.app.json` (not `tsc --noEmit -p .`, which checks nothing because `tsconfig.json` only lists references); `npm run build` and all 1,275 tests pass.

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

Set by the owner on 2026-10-17. The group "Frontier and Beyond" (`docs/experiments/frontier-and-beyond/`) teaches recent discoveries and findings of astronomers and scientists. Its concepts are complex and hard to grasp easily. Four rules apply to **every experiment in the group, all twenty-four and any added later**, in its specification and in its interface:

1. **The introduction must be up to date, clear, detailed and in simple terms**, so that a learner with only a basic knowledge of science can understand it. Use real-life examples where they help. Its length is not a problem as long as the extra length helps the learner understand better. It may include links for a learner who wants to know more.
2. **The caption of every picture follows the same rule** (up to date, clear, detailed, simple terms, real-life examples where they help, no length limit that would cost clarity). This builds on the "How to read this diagram" standard of §14. Its "what to look for" items each say what to look at, what it means and why it matters (§14).
3. **Every experiment page has a "Want to know more?" list of links** (added by the owner on 2026-10-19), so a learner who wants more can click through. The list is part of the introduction's page, visible from the start, and it includes: (a) the original paper or official release behind each result the experiment uses; and (b) for each background idea the introduction explains (for example, what a supernova is), at least one plain-language page from an official source, such as NASA or ESA or the mission's or observatory's own education pages. Each link opens in a new tab and says in a few plain words what the learner will find there.
4. **Every Results panel has a reading guide** (added by the owner on 2026-10-22): see §14, "Reading the Results". It applies to every experiment, and its wording is drafted to this group's standard of simple terms and real numbers.

How to apply them:

* Draft the introduction and every caption to this standard the first time, not after owner feedback (§14).
* Links go to the original paper or an official release (a mission, observatory, space-agency or collaboration page), not to news summaries. Rule 3 applies to every experiment page, not only where the introduction happens to mention a link. Fetch each link before the wording is approved, and record it in the specification's source-status table with the date checked (§20, "Say what was not checked" in §28.6).
* "Up to date" means stating the status as of the date shown to the learner ("as of October 2026"). A fact that may change goes in the specification's "facts that may change" table.
* These rules do not override §12 or §28.1: neither an introduction nor a caption may reveal what the learner is asked to predict, and the wording is still the owner's to approve line by line.
