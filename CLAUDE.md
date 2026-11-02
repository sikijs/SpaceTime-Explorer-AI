# Claude Code Instructions — Frontier and Beyond

> All these concepts are complex. Use simple terms so that a user with just a basic knowledge of science should be able to understand. Make it as detailed as necessary to make the concept clear. Do not assume the user can understand these concepts easily. Explain with examples wherever possible.

## 1. Read the Project Definition First

The overall vision and purpose of Frontier and Beyond are defined in:

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

Claude Code is the implementation assistant for Frontier and Beyond.

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
3. **Optional (made optional by the owner on 2026-10-23, after Experiment 14): for a table that follows the learner's controls**, add it only where a real reference exists and the comparison tells the learner something the pictures do not already show. If the controls only move marks in the pictures, leave the table out (Experiment 14 removed its Table 4 for this reason). Where it is used: a "Published value" column and a "How yours compares" column beside "Your value", and a short paragraph ("What your numbers show") that updates with the settings and says what changed, whether each earlier check still holds, and why. Call the learner's settings "trial values" or "your own numbers", never "what-ifs" (the owner found "what if" confusing). End with a line saying they are trial values and do not say the real system is like that.
4. **The learner's predictions, shown beside the results**: a short block giving each prediction's guess, the question it was about, and the table row where its number appears, with a small tag on that row. It shows the guess only, never "matched" or "right" (that is the tutor's job, §12, §13), unless the owner decides otherwise for an experiment.

How to apply them:

* Every number in the guide and every comparison comes from the physics module, tested, and the interface only displays it (§9). Add the comparison functions and their tests to the module.
* The guide may name what each number means and why it matters, but it must not give the full mechanism or a verdict between competing explanations. Those stay with the tutor (§12, §13), and it must not reveal what the learner is asked to predict before they have predicted (§12).
* The wording is the owner's to approve line by line (§28.1). Draft it, show it, then build it, and check the page in a browser (§28.4).
* The specification records the guide (§28.2).
* Built so far: Experiment 12 of Cosmic Horizons (committed `b708678`). Experiments 1 to 11 and the other groups do not have it yet. Whether to add it to them is the owner's decision, one experiment at a time, and is not started.

## Predictions and the Real Results

Set by the owner on 2026-10-24, from the pilot on Experiment 15, and replacing the owner's rule of 2026-10-23 ("Predictions Do Not Change the Results"). One lesson of that rule stays: the real results come from the physics (§9) and never change with a guess, and the learner must be told so, because on Experiment 12 a learner changed their predictions, pressed Run, saw nothing change and took it for a fault. What is new: the learner's guess is no longer only a line of text beside the results. It is **drawn on the real picture, beside the real result**, so that it is easy to compare. **Every experiment with a prediction must:**

1. **Keep the real pictures, tables and numbers fixed.** A guess never changes them.
2. **Draw the guess on the real picture where its answer lives, as a separate, clearly labelled mark in white**, with a prominent box labelled "YOUR GUESS" joined to the mark by a line (a thin mark was invisible to the owner). White always means the learner's guess. Anything imagined for the question (for example a star squeezed to 6 km) is drawn as its own labelled element in another colour and called "imagined". The mark shows the guess only: no "right", "wrong" or "matched" (§12, §13). The tutor marks each prediction in its explanation, and nowhere earlier.
3. **Make the mark follow the guess.** A different guess gives a visibly different mark. Where a guess has no size or position of its own (for example yes or no), draw a marker for it and say in the caption that it is only a marker.
4. **Draw the mark only once the feature beside it is drawn**, so a picture that builds up in stages explains nothing early (§12).
5. **Put it in the same picture as the real result.** If the predicted quantity has no picture, add it to the nearest existing picture as its own half or panel, on its own scale, with its own title, so the two can be compared at a glance. Do not add a separate picture for it.
6. **Say where the real picture comes from.** Under every picture that carries a guess mark, a "Where the real picture comes from" line separates what was **measured** (and by whom), what was **calculated here** and what was **imagined for the question**, so a learner never mistakes a calculation or a what-if for an observation.
7. **Tell the learner in plain words.** The introduction (where it says what the learner will do) says that the predictions never change the real pictures or tables, that the guesses are drawn on them in white and shown again beside the results, and which controls, if any, change which drawings. Beside any controls, a note says that the guesses do not change the drawings or tables but these settings do (and, if there is a comparison table for the settings, that while every setting is on its published value it says "the same", so the learner should change a setting to see it move). An experiment with a prediction and no controls says only the first point. The tutor's observe and compare prompts point to the marks by name.
8. **Take every number for the marks from the physics module** (the guess's size or position and the real value), with tests (§9, §10), and name nothing in the interface that the module has not computed.

How to apply it: draft the wording the first time (§14), show it for the owner's approval (§28.1), record it in the specification (§28.2), and check the page in a browser (§28.4). The first experiment built this way is Experiment 15 of Cosmic Horizons (commits `9ac8311` to `72c84d7`); copy its pattern.

**Where it applies.** It applies to every new experiment, from Experiment 17 of Cosmic Horizons onward (Experiment 16 was dropped on 2026-10-25). Experiments 1 to 14 and the other groups still follow the owner's earlier rule: their guesses are shown only as text beside the results, and each says that predictions do not change the pictures or tables. **The owner decided on 2026-10-24 to audit and update them later, one experiment at a time, after the project is complete.** Until then, do not add guess marks to them and do not change that wording, unless the owner asks.

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

Implement prediction, observation, and other educational interactions specified by the experiment. Draw the learner's guess on the real picture beside the real result, and tell the learner that their predictions never change the real pictures or tables (§14, "Predictions and the Real Results").

### Step 7 — Results

Display the experimental results clearly, with the reading guide described in §14 ("Reading the Results"): a check-up, a note under each table, a comparison for tables the learner controls (optional, where it applies), and the learner's predictions beside the results.

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

The application is a guided journey (the owner's format): `src/App.tsx` shows one experiment at a time as a chapter, with a sidebar, Previous/Next buttons, a Welcome page at the top and a Conclusion page at the bottom. Chapters are freely reachable. Each experiment keeps fully independent physics models, UI, prediction state and tutor; `App` only sequences them. Progress (`onComplete`, `onTutorComplete`) is saved in `localStorage` under `spacetime-explorer-progress`. Text is set larger at medium weight through `src/index.css`; do not reduce it without asking. The full description is in `docs/DEVELOPMENT-STATE.md`.

## Experiment Status

Every experiment has an approved specification, a tested physics model, an interface, a prediction, a results panel and a tutor, all wired into `src/App.tsx`. All experiments in all groups are built, and their wording is approved. The groups, in sidebar order, are: Relativity of Time and Motion (11), Gravity and Curved Spacetime (9), Gravitational Waves (7), Cosmology (10), Black Holes and Strong Gravity (10), Spacetime Geometry (10), Evidence and Imagination (7) and Cosmic Horizons (24, numbered 1 to 15 and 17 to 25 in the specifications; the learner sees 1 to 24, see below). Each group has a closing recap or synthesis where noted in `docs/DEVELOPMENT-STATE.md`. The Welcome and Conclusion pages stand outside the numbered chapters.

**The full status tables, the guided-journey work log and "What Remains" are in `docs/DEVELOPMENT-STATE.md`, which is not loaded automatically. Read it when you need an experiment's status, commits or open items.** Older per-experiment history is in `docs/STATUS.md`. Each specification's "Implementation Notes" remain authoritative.

Rules that stay in force:

* **Cosmic Horizons numbering (owner's decision of 2026-11-02):** the learner sees chapters 1 to 24 in a row (the sidebar's numbers). Experiment 16 was dropped, so the learner's 16 to 24 are the specification numbers 17 to 25. All learner-facing text (page headings, "What's next" lines, cross-references) uses the learner's numbers; specifications, file names, code comments and the status tables keep the specification numbers (`displayNumber` in `src/physics/frontierRecap.ts`).
* **Verification:** the type check that covers the source is `tsc --noEmit -p tsconfig.app.json` (not `-p .`, which checks nothing because `tsconfig.json` only lists references). `npm run build` and the full test suite should pass.
* **Responsive layout:** below 850px wide the sidebar becomes a row of chapter buttons above the experiment (classes in `src/index.css`). Do not reduce the base font size or the `.toggle-button` styling without asking the owner.
* **Summaries:** a "What you learned / What's next" summary appears below each experiment only after the learner reaches the tutor's explanation. The summaries live in the `chapters` list in `src/App.tsx`; sidebar phase headings are in `groupOrder` and group overviews in `groupOverviews`.
* **Do not proceed beyond the current milestone without explicit authorization.** Any new experiment needs a proposal and an approved specification first (§23 Stages 1 to 4).

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

# 29. Cosmic Horizons: Introductions and Captions

Set by the owner on 2026-10-17. The group "Cosmic Horizons" (`docs/experiments/cosmic-horizons/`) teaches recent discoveries and findings of astronomers and scientists. Its concepts are complex and hard to grasp easily. Four rules apply to **every experiment in the group, all twenty-four and any added later**, in its specification and in its interface:

1. **The introduction must be up to date, clear, detailed and in simple terms**, so that a learner with only a basic knowledge of science can understand it. Use real-life examples where they help. Its length is not a problem as long as the extra length helps the learner understand better. It may include links for a learner who wants to know more.
2. **The caption of every picture follows the same rule** (up to date, clear, detailed, simple terms, real-life examples where they help, no length limit that would cost clarity). This builds on the "How to read this diagram" standard of §14. Its "what to look for" items each say what to look at, what it means and why it matters (§14).
3. **Every experiment page has a "Want to know more?" list of links** (added by the owner on 2026-10-19), so a learner who wants more can click through. The list is part of the introduction's page, visible from the start, and it includes: (a) the original paper or official release behind each result the experiment uses; and (b) for each background idea the introduction explains (for example, what a supernova is), at least one plain-language page from an official source, such as NASA or ESA or the mission's or observatory's own education pages. Each link opens in a new tab and says in a few plain words what the learner will find there.

   **3(c). When no plain official page exists** (set by the owner on 2026-10-29). If, after a search, no plain-language page from an official source can be found and fetched for a background idea that the introduction explains, the experiment does not link a page it has not read. Instead:

   * the introduction defines the idea in plain words, at the point where the learner first needs it (§15);
   * the specification's source table has a row for the idea saying "no plain official page found". It gives the date searched and what was tried, and names any candidate that was found but could not be fetched, and why;
   * the status entry lists the gap under "Open";
   * the page never suggests a source it does not have.

   A candidate that was found but not fetched may be added later, once it has been fetched and read and the owner has approved the link. This is an exception for a missing source, not for skipping the search: the search is run before the wording is approved, and repeated if the gap is still open when a later experiment needs the same idea.
4. **Every Results panel has a reading guide** (added by the owner on 2026-10-22): see §14, "Reading the Results". It applies to every experiment, and its wording is drafted to this group's standard of simple terms and real numbers.

How to apply them:

* Draft the introduction and every caption to this standard the first time, not after owner feedback (§14).
* Links go to the original paper or an official release (a mission, observatory, space-agency or collaboration page), not to news summaries. Rule 3 applies to every experiment page, not only where the introduction happens to mention a link. Fetch each link before the wording is approved, and record it in the specification's source-status table with the date checked (§20, "Say what was not checked" in §28.6).
* "Up to date" means stating the status as of the date shown to the learner ("as of October 2026"). A fact that may change goes in the specification's "facts that may change" table.
* These rules do not override §12 or §28.1: neither an introduction nor a caption may reveal what the learner is asked to predict, and the wording is still the owner's to approve line by line.
