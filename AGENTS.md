# Cosmic Horizons — Project Instructions

> All these concepts are complex. Use simple terms so that a user with just a basic knowledge of science should be able to understand. Make it as detailed as necessary to make the concept clear. Do not assume the user can understand these concepts easily. Explain with examples wherever possible.

## Project Purpose

Cosmic Horizons is an interactive educational laboratory for understanding
relativity, spacetime, gravity, astronomy, aerospace, and cosmology.

Relativity is the central subject. Other space and aerospace topics are used as
applications that help learners understand the underlying physics.

The project is educational, not a professional scientific simulation package.

## Development Philosophy

Build the project incrementally.

Do NOT attempt to build the complete application at once.

Each experiment or feature must be designed and scientifically specified before
it is implemented.

Work on one small, independently testable task at a time.

Do not implement future phases unless explicitly requested.

## Physics Authority

The physics engine is authoritative.

The AI tutor must interpret results produced by the physics engine rather than
inventing physical results.

Do not introduce physical assumptions, equations, approximations, or models
unless they are explicitly specified in the experiment design or approved
during development.

When an approximation is used, document it clearly.

## Separation of Responsibilities

Keep these concerns separate:

1. Physics

   * Physical laws
   * Calculations
   * Simulation state
   * Numerical methods

2. Simulation

   * Experiment setup
   * Parameters
   * Running experiments
   * Producing measurable results

3. Visualization

   * Graphs
   * Diagrams
   * Animations
   * 2-D and 3-D representations

4. AI Tutor

   * Explaining the experiment
   * Asking questions
   * Interpreting simulation results
   * Adjusting explanations to the learner's level

The AI must not replace the physics engine.

## Educational Philosophy

The primary learning cycle is:

Predict → Experiment → Observe → Explain

Whenever practical, learners should be encouraged to make a prediction
before running an experiment.

Explanations should begin conceptually and introduce mathematics gradually.

Avoid introducing mathematical formulas before the learner understands what
the physical quantities represent.

Provide multiple levels of explanation where appropriate:

* Conceptual
* Visualization
* Mathematics
* Advanced / Derivation

## Experiment Development

Every experiment should have a written specification before implementation.

Experiment specifications should define:

* Purpose
* Learning objective
* Physics
* Inputs
* Outputs
* Simulation rules
* Visualization
* User interaction
* Learner-facing introduction, including any new terms it must define
* Results reading guide (see "Results: A Reading Guide")
* Note that predictions do not change the results (see "Predictions Do Not Change the Results")
* AI tutor behavior
* Tests
* Explicit exclusions

Do not combine several experiments into one implementation task unless
specifically requested.

## Code Quality

Prefer simple, readable code over unnecessary abstraction.

Keep modules small and understandable.

Write tests for physics calculations.

Physics calculations should be deterministic whenever possible.

Do not hide important physical calculations inside UI code.

## Coding Agent Workflow

The project may be developed using different coding agents, including Claude Code
and OpenCode.

AGENTS.md is the shared, agent-independent source of project instructions.

The human decides what physics and educational behavior the application should
implement.

The coding agent implements the approved specification.

Before coding a significant feature:

1. Read the relevant documentation.
2. Confirm the requested scope.
3. Implement only that scope.
4. Write or update tests.
5. Verify the implementation.
6. Report what was changed.

Do not silently expand the scope of a task.

After completing a step, report the result and stop. Do not begin the next
step until the human authorizes it.

Do not implement an experiment until the human has approved its
specification. Do not change an approved specification without the human's
approval.

Learner-facing text (introductions, explanations, captions, tutor wording) is
part of the educational design. Draft it from the approved specification, add
no claims the specification does not contain, and let the human review it.

Define every specialized term in plain language before it is used.

Check user-interface changes in a browser, since tests do not cover
appearance, and report anything that was not verified.

## Results: A Reading Guide

Added by the owner on 2026-10-22. A table of numbers means little to a learner until someone explains it, like an
X-ray or a blood test. Every experiment's Results panel must come with a plain-language reading guide, written in
simple terms with the real numbers:

1. A "check-up" table setting what we would expect beside what was found, with a plain reading of each row. Use it
   only where a real reference exists, with no invented cut-offs and no "healthy" or "abnormal".
2. A note under each table: what the numbers are, what they mean with the real values, and why they matter.
3. Optional (since 2026-10-23): for a table that follows the learner's controls, only where a real reference exists and
   the comparison shows something the pictures do not; if the controls only move marks in the pictures, leave it out.
   Where used: a published-value column, a "how yours compares" column and an
   updating paragraph. Call the learner's settings "trial values" or "your own numbers", never "what-ifs".
4. The learner's predictions shown beside the results (the guess, the question, where its number is), with no
   "matched" or "right": the tutor gives that.

The numbers come from the tested physics module. The guide gives meaning and significance but leaves the full
mechanism and any verdict to the tutor, and never reveals a prediction's answer early. The wording stays the human's to
approve. Built so far: Experiment 12 of Frontier and Beyond. The earlier experiments do not have it yet.

## Predictions Do Not Change the Results

Added by the owner on 2026-10-23. A learner's predictions are their own guesses, made before they see anything. They
never change the pictures, the tables or any number: the results come from the physics. Every experiment with a
prediction must tell the learner so, in plain words, so that "nothing changed" is not mistaken for a fault:

1. In the introduction, where it says what the learner will do: the predictions are guesses, they do not change the
   pictures or tables, they are shown again beside the results, and say which controls (if any) do change them. It
   must not give the answers.
2. Beside any controls: the predictions do not change the pictures or tables but these settings do. If there is a
   comparison table for the settings, also say that while every setting is on its published value it says "the same",
   so change a setting to see it move.

The wording stays the human's to approve. Built so far: Experiment 12 of Frontier and Beyond. The earlier
experiments do not have it yet.

## Frontier and Beyond: Introductions and Captions

The "Frontier and Beyond" group (every experiment in it, all twenty-four and any added later) teaches recent discoveries
and findings of astronomers and scientists. The ideas are complex, so:

1. Each introduction must be up to date, clear and detailed, in simple terms for a learner with basic science
   knowledge. Real-life examples are welcome. Length is not a problem if it helps understanding. Links for further
   reading may be included.
2. The caption of every picture follows the same rule.
   In every experiment's caption, each "what to look for" item says what to look at, what it means and why it matters
   (owner's rule, 2026-10-21): not a bare list. An item is shown only once its feature is drawn. The full mechanism and
   any verdict between competing results are left to the tutor.
3. Every experiment page has a "Want to know more?" list of links (owner's rule, 2026-10-19): the original paper or
   official release for each result used, and an official plain-language page (for example NASA or ESA) for each
   background idea the introduction explains. Each link opens in a new tab and says what the learner will find.
4. Every Results panel has a reading guide (owner's rule, 2026-10-22): see "Results: A Reading Guide" above. It applies
   to every experiment, in simple terms with the real numbers.

Links go to the original paper or an official release (a mission, observatory or space agency page), and each is fetched and recorded in the experiment's source-status table.
Neither the introduction nor a caption may reveal what the learner is asked to predict. The wording stays the human's
to approve.

## Git

Make small, meaningful commits.

A commit should represent a coherent change that can be understood and,
if necessary, reverted independently.

Do not make large unrelated changes in a single commit.

Commit only when the human asks. Keep the human's own uncommitted changes in
separate commits from the agent's changes.

## Current Development Rule

Documentation and scientific design take priority over application code.
Each new experiment is specified and approved by the human before it is
implemented.

Build the architecture only as far as the approved experiments require.
