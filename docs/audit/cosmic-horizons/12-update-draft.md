# Update draft: Cosmic Horizons Experiment 12 (Betelgeuse and its companion)

Date: 2026-11-02 | Status: APPROVED by the owner and BUILT (§1 to §7 in three steps, and §8, Drawing A, with placement (a)); commits `c0e2776`, `45e0edc`, `f0149c2`. Scope chosen by the owner: all Rule A gaps in `12-gap-report.md`, and the white clash resolved by recolouring both clashing marks.

## 1. Colours (decision: recolour both)

White will mean only the learner's guess. Today it also marks the learner's own trial settings and, nearly, the 5-sigma marker (the 5-sigma line uses the near-white text colour `#e2e8f0`).

| What | Today | Proposed |
|---|---|---|
| The learner's own trial settings (Picture 1 circle and label, Picture 2 circle, Picture 3 marker and label) | white `#ffffff` | pink `#f472b6` |
| The real 5-sigma marker on Picture 3 | near-white `#e2e8f0` | lime `#a3e635` |
| The learner's guess (new) | none | white `#ffffff` |

Both new colours are unused elsewhere on these pictures. Every sentence that says "white marks" for the settings changes to "pink marks" (listed in §5).

## 2. Physics module additions (`src/physics/betelgeuseCompanion.ts`), with tests first

1. `reachRangeAU(reach)`: the range of radius a Reach answer covers, from the planets' orbits already in the module. Inside Earth: 0 to 1.0 AU. Past Earth: 1.0 to 1.524. Past Mars: 1.524 to 5.203. Past Jupiter: 5.203 and out (no upper limit). It matches `reachOf`'s own boundaries, so a test checks that every radius in a range gives back that Reach.
2. `sigmaForChance(oneIn)`: the size of spot, in sigma, whose one-direction tail chance is 1 time in `oneIn` (the inverse of `chanceOfSigma`), and `guessSigma(answer)` using the three answers' `oneIn` values. Tests: round trip with `oneInChance`; 1 time in 2 gives 0 sigma; 1 time in 15 gives about 1.50; 1 time in 3.5 million gives about 5.0; invalid input throws.

No existing function or result changes.

## 3. The guess marks

**Picture 1 (Betelgeuse next to the Solar System).** Drawn from stage 1, when Betelgeuse's real disc appears. The guess is a range, so it is drawn as a white dashed zone between the circles that bound the range (not as one circle). A white box labelled "YOUR GUESS" with the answer, joined to the zone by a line. For "Past Jupiter's orbit" the zone runs from Jupiter's orbit to the edge of the picture. Only the learner's own answer is drawn; nothing says right or wrong.

**Picture 3 (the noise curve).** Drawn from stage 4, when the reported spot and its tail appear (the same stage the settings marker already uses). A guess about how often has no place on the picture by itself, so it is drawn as a white marker at the size of spot whose tail would be that often: 0 sigma for 1 time in 2, about 1.5 sigma for 1 time in 15, about 5 sigma for 1 time in 3.5 million. A white "YOUR GUESS" box joined to the marker by a line. Note for the owner: the guess "1 time in 15" lands almost exactly on the yellow reported-spot marker at 1.5 sigma, so its box will sit at a different height and be joined by a line to keep both readable.

## 4. New wording (for approval, line by line)

**Introduction, "What you will do" (replaces the sentences from "Your predictions are your own guesses" to the end):**

> Your predictions are your own guesses, made before you see anything: they do not change the pictures or the tables, which come from the physics and the published numbers. Each guess is drawn on the picture it is about, as a white mark in a box labelled “YOUR GUESS”, so you can compare it with the real picture, and it is shown again beside the results. What does change the pictures and Table 4 is the “Now try it yourself” controls, which appear after the run finishes. Their marks are pink, never white.

**"Now try it yourself" note (one change, "white" to "pink"):**

> … These settings do: change one and watch the pink marks in the three pictures above, and Table 4 below, follow it. …

**Under Picture 1, a new line (before "What to look for"):**

> **Your guess.** The white dashed zone is your guess from before the run. You guessed a range (inside Earth’s orbit, past Mars but not as far as Jupiter, or past Jupiter’s orbit), so it is drawn as a zone between orbits, not as one circle. It only marks where you guessed. It does not change the star, which comes from the measurements.

**Under Picture 1, "Where the real picture comes from":**

> **Where the real picture comes from.** *Measured:* the star’s angle across, 41 milliarcseconds (Howell and others 2025), and its distance, 168 parsecs (Joyce and others 2020); the paler band comes from the ranges of angle and distance the papers give. *Calculated here:* the radius, half the angle times the distance (Table 1), and the five orbits as circles at the planets’ standard distances (standard values, not taken from a paper). *Imagined for the question:* Betelgeuse in the Sun’s place. It is not there; the question asks what it would cover if it were. *Your guess:* the white zone, drawn from your answer only.

**Under Picture 3, a new line (before "What to look for"):**

> **Your guess.** The white marker is your guess from before the run. A guess about “how often” has no place on this picture by itself, so it is drawn where on the curve a spot that often would sit: 0 sigma for 1 time in 2, about 1.5 sigma for 1 time in 15, about 5 sigma for 1 time in 3.5 million. It is only a marker for your guess. It does not change the curve.

**Under Picture 3, "Where the real picture comes from":**

> **Where the real picture comes from.** *Measured:* the size of the reported spot, 1.5 sigma (Howell and others 2025). *Calculated here:* the bell curve, the shaded tail (the chance that noise alone makes a spot at least that strong, counting one direction only) and the chance at 5 sigma. *Imagined for the question:* “noise alone”: the curve asks what spots would look like if nothing were there. *Your guess:* the white marker, drawn from your answer only.

**Labels drawn on the pictures:**

- Picture 1 box: `YOUR GUESS: inside Earth’s orbit` / `YOUR GUESS: past Mars but not as far as Jupiter` / `YOUR GUESS: past Jupiter’s orbit`
- Picture 3 box: `YOUR GUESS: about 1 time in 2` / `… 1 time in 15` / `… 1 time in 3.5 million`
- Settings labels: "your setting (the white marker)" becomes "your setting (the pink marker)" in Picture 3; Picture 1's "your distance: … parsecs, radius … AU" keeps its words in pink.

**Tutor prompts (the explanation step already marks each prediction and is unchanged):**

- Observe, current: "Look at Picture 1. Next to the orbits of the planets, how big is Betelgeuse? Which orbits lie inside it, and which outside? And in Picture 2, how does the companion’s orbit compare with the star itself?"
  Proposed addition at the end: "Your white YOUR GUESS zone is on Picture 1 too: where does it sit next to the orange disc?"
- Compare, current: "… Now look at Tables 1 to 3 and at Pictures 1, 2 and 3. Do the numbers look the way you expected? What surprised you, if anything?"
  Proposed: "… Now look at Tables 1 to 3 and at Pictures 1, 2 and 3, including your white YOUR GUESS marks on Pictures 1 and 3. Do the numbers look the way you expected? What surprised you, if anything?"

**Words and aria-labels:** the three pictures' `aria-label` texts will mention the guess mark ("a white zone, your guess, …") so the description matches the drawing.

## 5. What gets changed, and what does not

Changed: `BetelgeuseCompanionExperiment.tsx` (colours, Pictures 1 and 3, the introduction line, the controls note, two source lines, two guess captions, aria-labels), `BetelgeuseCompanionTutor.tsx` (two prompts), `betelgeuseCompanion.ts` and `.test.ts` (the two additions), the specification and `docs/DEVELOPMENT-STATE.md` (only with the owner's approval, §28.2).

Not changed: the real pictures, tables and numbers (they never read a guess), Tables 1 to 4, the check-up, the predictions block, the tutor's explanation step, Experiment 12's status label, any other experiment.

## 6. Steps after approval (one at a time, §6)

1. Physics and tests (§2); stop.
2. Colours and guess marks on Pictures 1 and 3, with the captions and source lines; run tests, `tsc`, build; check in a browser; stop.
3. Introduction, controls note and tutor prompts; stop.
4. Specification and `DEVELOPMENT-STATE.md` updated if approved; commit only when asked.

## 7. Not decided here

- Whether the 5-sigma marker's new colour should be lime or another unused colour.
- Whether the 1-in-15 guess landing on the reported spot needs a different treatment than a separate box and line.
- Not checked: how the zone and boxes look in a browser at narrow widths (the page's pictures already shrink at narrow widths, as in the group's other experiments).

---

## 8. Added at the owner's request (2026-11-02, "option 2, add a small drawing inside the panel"): Drawing A in "Now try it yourself"

**Status: approved (placement (a), wording as written) and built.** It adds one drawing to the "Now try it yourself" panel, so the learner sees the effect of a control next to the control. Today the controls only move the pink marks in the three pictures above the panel. Nothing in Pictures 1 to 3, the tables or Table 4 changes.

### 8.1 What it shows

Three strips, each a plain number line with its own scale and title. Every number comes from the physics module (the radius, orbit time and sigma already in `yoursFor` and `runBetelgeuseCompanion()`, `reachRangeAU`, `guessSigma`); only the pixel scale is drawn in the component, as in Picture 1.

| Strip | Scale | Driven by | Marks |
|---|---|---|---|
| 1. How big is the star? (radius, in AU) | 0 to 6 AU | the distance control | five ticks for the planets' orbits (Mercury 0.387 to Jupiter 5.203); the real radius (orange, 3.44 AU) hangs below the line; your trial radius (pink) stands above it; your guess from Prediction 1 as a white band on the line with a white "YOUR GUESS" box |
| 2. The companion's orbit time (years) | 5.0 to 6.5 years (the line does not start at 0; the title says so) | the two mass controls | a pale band for the observed long cycle (2,000 to 2,170 days, 5.48 to 5.94 years); the published-values orbit time (cyan, 5.77 years) below the line; your trial orbit time (pink) above it |
| 3. How strong is the hint? (sigma) | 0 to 5.5 sigma | the signal-strength control | the reported spot (yellow, 1.5 sigma) below the line; the 5 sigma bar (lime); your trial strength (pink) above the line; your guess from Prediction 2 as a white ring with a white "YOUR GUESS" box |

When every setting is on its published value, each pink mark sits directly above its real mark (the real mark hangs below, the pink one stands above, so neither hides the other). Changing a setting moves only the pink mark. Strip 2 has no guess because no prediction is about the orbit time.

### 8.2 Where it goes (owner to choose)

- **(a) Three strips, each directly under the control that moves it** (recommended): strip 1 under "How far away is Betelgeuse?", strip 2 under the two mass controls, strip 3 under the signal-strength control. No scrolling between a button and its effect. It is one drawing shown in three parts, each with its own caption line.
- **(b) One drawing at the top of the panel**, under the introductory note, with the controls below it. Simpler, but the drawing leaves the screen while the learner uses the lower controls.
- **(c) One drawing at the end of the panel.** Not recommended, for the same reason.

### 8.3 New wording (for approval, line by line)

**Panel note, one sentence added after "…does not say that the real star or signal is like that.":**

> Drawing A, in this panel, shows each setting next to the real value, so you can see what a change does without scrolling up.

**Drawing A title:** `Drawing A: your trial values beside the real ones`

**Strip titles and labels on the drawing:**

- Strip 1: `The star’s radius, in AU (1 AU = the Earth’s distance from the Sun)`; marks: `real: 3.44 AU`, `yours: X AU`, `YOUR GUESS: <answer>`; the five ticks are labelled with the planets' names.
- Strip 2: `The companion’s orbit time, in years (this line starts at 5, not 0)`; marks: `published values: 5.77 years`, `yours: X years`, `observed long cycle: 2,000 to 2,170 days`.
- Strip 3: `How strong the hint is, in sigma`; marks: `reported: 1.5 sigma`, `yours: X sigma`, `5 sigma: the usual bar for a discovery`, `YOUR GUESS: <answer>`.

**Caption, "How to read Drawing A":**

> **What it shows.** Three short lines, one for each thing you can change above. On each line, the real value hangs below the line and your trial value stands above it, in pink. While every setting is on its published value, each pink mark sits straight above its real mark. Change a setting and only the pink mark moves.
>
> **The three lines.**
> - *Radius, in AU.* How far out the star’s surface reaches. The five small ticks are the planets’ orbits, so you can see which orbits fall inside the star. It follows “How far away is Betelgeuse?”.
> - *Orbit time, in years.* How long the companion would take to go round once. The pale band is the long cycle seen in Betelgeuse’s light, 2,000 to 2,170 days (about 5.5 to 5.9 years). It follows the two mass controls. This line starts at 5 years, not 0, so that small differences can be seen.
> - *Sigma.* How strong the faint spot is, measured in give-or-takes above the noise. It follows “How strong is the signal?”. The lime tick at 5 sigma is the usual bar for a discovery.
>
> **Your guesses.** Your two guesses from before the run are drawn in white: Prediction 1 as a band on the radius line, Prediction 2 as a ring on the sigma line, as on Pictures 1 and 3. They do not move when you change a setting, because a guess is not a setting.
>
> **A worked moment.** At 195 parsecs the star’s radius is half the angle times the distance: ½ × 41 × 195 × 0.001 = 4.00 AU. On the radius line the pink mark moves from 3.44 AU to 4.00 AU, while the orange mark stays at 3.44 AU.
>
> **What to look for.**
> 1. **Look at:** the pink mark on the radius line, against the planets’ ticks. **What it means:** how far out the star would reach at the distance you chose, and which orbits it would cover. **Why it matters:** the star’s size depends on how far away it is, so a size is only as good as the distance behind it.
> 2. **Look at:** the pink mark against the pale band on the orbit-time line. **What it means:** whether the orbit time for the masses you chose falls inside the cycle seen in the star’s light. **Why it matters:** a companion is a reason to take the idea seriously only if its orbit matches that cycle.
> 3. **Look at:** the pink mark against the lime tick on the sigma line. **What it means:** how far your chosen strength is from the usual bar for a discovery. **Why it matters:** the same faint spot is a hint at 1.5 sigma and would count as a discovery at 5 sigma.
>
> These are trial values. They show what would happen with that number. They do not say that the real star or signal is like that.

**"Where the real picture comes from" (under Drawing A):**

> **Where the real picture comes from.** *Measured:* the star’s angle across, 41 milliarcseconds (Howell and others 2025), its distance, 168 parsecs (Joyce and others 2020), the reported spot, 1.5 sigma, and the long cycle, 2,000 to 2,170 days (Dupree and others 2026; Goldberg and others 2024). *Calculated here:* the radius, the orbit time (from the model separation and the two masses) and the chance for each sigma. *Imagined for the question:* your trial values, and the star in the Sun’s place. *Your guess:* the white marks, drawn from your answers only.

### 8.4 What it would touch, and what it would not

Touch: `BetelgeuseCompanionExperiment.tsx` (a new `DrawingA` component and its placement), the specification and `DEVELOPMENT-STATE.md` (with approval). No new physics-module function is needed: every mark uses a value the module already returns. Not touched: Pictures 1 to 3, the tables, Table 4, the tutor.

### 8.5 Not decided

- Which placement, (a), (b) or (c).
- Whether strip 2's non-zero start is acceptable, or whether it should start at 0 (the 0.05-year differences between settings would then be about 3 pixels wide).
- Not checked: the narrow-width appearance of the drawing; the unit "AU" and "give-or-takes" are already defined in Pictures 1 and 3.
