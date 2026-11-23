# Draft wording: Spacetime Geometry Experiment 7, the cause of the change (tutor explanation, drawing, summary sentence)

**Status:** APPROVED by the owner on 2026-11-23 ("approved"); built in `262cf88`. Originally a draft for the owner's approval, written 2026-11-23 (CLAUDE.md §28.1). Requested by the owner on 2026-11-23: "where have you explained the cause ... more details need to be added", then "draft it with the drawing and the summary sentence". Nothing has been built; no code, test or specification has been changed; nothing is committed.

**Where it goes (§12, §14):** the cause (the mechanism) stays in Part 4, in the tutor's explanation, which appears only after the learner has predicted, watched and answered the tutor's three questions. It is not put in the introduction, the captions or the Results, which must not give the mechanism or the direction before the learner has observed it. The chapter summary gets one sentence (section 4), because it appears only after the explanation.

**Source of the numbers:** every number below is for the sideways star at the learner's speed, from `rayAsMeasuredByTraveler` and `runSky` in `src/physics/aberration.ts` (the energy-and-momentum route, already tested against the closed formula). Checked by hand on 2026-11-23 against the specification's table:

| Speed | D = √(1 − speed²) | Ray's energy for the traveler (1 ÷ D) | Push backward along the line (speed ÷ D) | Push across (unchanged) | Traveler's angle θ′ | Rain rule |
|---|---|---|---|---|---|---|
| 0.3c | 0.954 | 1.048 | 0.314 | 1 | 72.5° | 73.3° |
| 0.6c | 0.800 | 1.250 | 0.750 | 1 | 53.1° | 59.0° |
| 0.9c | 0.436 | 2.294 | 2.065 | 1 | 25.8° | 48.0° |
| 0.99c | 0.141 | 7.089 | 7.018 | 1 | 8.1° | 45.3° |

(Check at 0.6c: 1.25² = 1.5625 and 0.75² + 1² = 1.5625, so the ray's energy equals the size of its push, as it must for light.)

---

## 1. The tutor's explanation: new items 2 to 5 (replacing the old items 2, 3 and 4; the old items 1, 5, 6, 7 and 8 stay, renumbered)

Items to keep as approved: **0. Your guess, marked**, **1. What the results show**. The old item 3 (rain) and item 4 (the formula) are folded into the new sequence below so that nothing is said twice. New numbering: 0, 1, 2 to 5 (new), 6 (old 5, why two stars do not move), 7 (old 6, the light clock), 8 (old 7, a real example), 9 (old 8, what was shown and what was not).

> **2. What each observer measures: the direction the light comes from.** A ray of starlight carries a *push*: it hits what it lands on a little, in the direction it is travelling. (Physicists call this push *momentum*. You met it in Experiment 5: a pulse of light has both energy and momentum.) You see a star in the direction the light came *from*, which is the direction opposite to its push. So to find the direction an observer sees, find the direction of the ray’s push and turn it round.
>
> **3. The lab’s numbers.** Take the star the lab sees exactly sideways, the one with the yellow ring. Its ray reaches the lab travelling straight across the line of travel, so its push is straight across. Say the push across is 1 (a unit we choose) and the push along the line of travel is 0. The ray’s energy is also 1, because for light the energy always equals the size of the push. The lab turns the push round and sees the star straight sideways, at 90°.
>
> **4. What the traveler’s motion does.** Think of rain on a car. When the car is parked, rain falling straight down pushes straight down on the windscreen. Drive along the road and you meet the rain from in front as well: there is now a push on the windscreen toward the back of the car, because you are driving into the rain, and the rain’s straight-down push is the same as before. The rule is this: *the push along your direction of travel changes when you move, and the push across it does not.* The ray of starlight follows the same rule, but with a difference that comes from relativity. Experiment 5 showed how energy and momentum along the motion change for a moving observer, using the factor D of Experiment 3 (D = √(1 − speed²)). Applying it here, at {speed}c, where D = {D}:
> - **The push across the line of travel:** unchanged, {1}.
> - **The push along the line of travel:** the traveler finds a push toward the back of {speed} ÷ {D} = {along}. (For the lab it was 0.)
> - **The ray’s energy:** the traveler finds {1} ÷ {D} = {energy}. (This change in energy is a change in the light’s colour: the subject of the next experiment.)
> - **A check:** for light, the energy should equal the size of the push. The size is √({along}² + {1}²) = {size}, and the energy is {energy}. They agree.
>
> **5. Turning the push round.** The traveler turns the push round to find the direction of the star. The push is {1} across and {along} toward the back, so the star lies {1} across and {along} toward the *front*. That is an angle from straight ahead of arctan({1} ÷ {along}) = {θ′}°. The traveler sees the star at {θ′}°, not 90°. The star has not moved. The traveler’s own motion added a push toward the back, and turned round, that puts the star toward the front.
>
> **Why the rain rule is close but not right.** If starlight were rain, the push toward the back would be just the traveler’s speed, {speed} (the rain rule), and the angle would be {rain}°. For light the push toward the back is {speed} ÷ {D} = {along}, bigger than {speed}, because D is smaller than 1. At low speeds D is almost 1, so the two agree: at 0.3c the push is 0.314 against 0.3, and the angles are 72.5° and 73.3°. At 0.9c D is 0.436, the push is 2.065 against 0.9, and the angles are 25.8° and 48.0°. That is why the rain picture works for slow travelers and fails for fast ones: it leaves out D.

*(In the built version the {…} are filled from the module for the learner's speed. Part 1 is fixed at 0.6c, so on the page they read: D = 0.800; along = 0.750; energy = 1.250; size = √(0.750² + 1²) = 1.250; θ′ = 53.1°; rain rule 59.0°. "Rain" and "rain rule" are not introduced before this item, so the old item 3's rain paragraph is replaced by item 4's car-and-rain example plus the closing paragraph above. The old item 4's "cos θ′ = (cos θ + β) ÷ (1 + β cos θ)" is kept, shortened, as item 5's last line: "In one line, for any star: cos θ′ = (cos θ + {speed}) ÷ (1 + {speed} cos θ). For the sideways star, cos 90° = 0, so cos θ′ = {speed}, and the angle is {θ′}°. It gives the same {θ′}°.")*

---

## 2. The drawing, inside item 5 (shown only in the explanation, so §12 is respected)

**Title:** "The same ray of starlight, as the lab and as the traveler measure its push" (a picture of the **real** numbers of item 3 to 5, built in the page).

Two panels side by side, drawn on the same scale (one unit of push = the same length in both), each a small flat diagram with the line of travel running left to right:

- **Left panel, "The lab’s measurement" (sky blue).** One arrow from the centre straight down, labelled "the ray’s push: 1 across, 0 along". A dashed arrow in the opposite direction (straight up) with a yellow ring at its end, labelled "toward the star: 90°, straight sideways".
- **Right panel, "The traveler’s measurement at {speed}c" (purple).** The ray’s push drawn as an arrow made of two parts: a down part of length 1 labelled "across: 1 (unchanged)", and a part pointing toward the back (left) of length {along} labelled "along: {along} toward the back (new)". The total push is the diagonal arrow, labelled "the ray’s push as the traveler measures it". A dashed arrow in the opposite direction ends at the yellow ring, labelled "toward the star: {θ′}° from straight ahead", with the angle drawn as an arc from the line of travel (labelled "direction of travel").
- A thin white box is **not** used (this is not a guess mark).

**Caption "How to read this drawing"** (plain words; every element named; look-for items in the three-part form):

> **What is drawn.** Each panel shows one ray of starlight, the ray from the star we follow, as one observer measures it. The solid arrow is the ray’s push: it points the way the light is travelling. The dashed arrow points the opposite way, which is the direction in which that observer sees the star, and the yellow ring is the star. The horizontal line is the line of travel, with “direction of travel” pointing right. Both panels use the same scale, so a longer arrow means a bigger push. The numbers are in units where the push across, for the lab, is 1.
> - **Look at** the downward part of the arrow in both panels. **What it means:** its length is 1 in both: the push across the line of travel does not change. **Why it matters:** only the other part of the push changes, so only one thing needs explaining.
> - **Look at** the part pointing toward the back in the traveler’s panel (length {along} at {speed}c). **What it means:** the lab found no push along the line of travel. The traveler finds one, because the traveler is flying into the light. **Why it matters:** this new push is what tilts the direction of the star toward the front.
> - **Look at** the angle between the dashed arrow and the line of travel in each panel. **What it means:** 90° for the lab, {θ′}° for the traveler. **Why it matters:** it is the number from the table “The angles”, the row for 90°, so the drawing and the table agree.
>
> **Where the real picture comes from.** *Calculated here:* the numbers (the push across, the push along, the energy) come from the energy-and-momentum rule of Experiment 5 and the page’s physics, and the angles are the page’s own. *Measured:* nothing. *Imagined for the question:* the ray from a star seen exactly sideways by the lab, and a traveler at exactly {speed}c.

(Design notes for the owner: the picture uses the same colours as the sky pictures: lab sky blue, traveler purple, the followed star yellow. It uses no white, because white always means the learner's guess. The two panels are drawn by the page from the module's numbers (`rayAsMeasuredByTraveler`), not typed in.)

---

## 3. The words box: one new entry, added after the run (with the formula and the rain rule)

- **Push of a ray of light (its momentum):** how hard, and in which direction, a ray of light pushes what it lands on. A ray travelling in one direction pushes in that direction, and for light the size of the push equals its energy. You see a star in the direction opposite to the push. Example: a ray with a push of 1 straight down comes from a star straight up.

(Also changed: the "rain rule" entry now ends "…because it leaves out the factor D, which the tutor explains.")

---

## 4. The chapter summary ("What you learned")

Current text, with the one added sentence in bold (inserted after the sentence that gives the speeds and before "The two stars straight ahead…"):

> Two observers who move relative to each other measure different directions for the same ray of light, so a traveler sees the stars crowded toward the direction of travel and thinned out behind, and the faster the traveler, the stronger the crowding: for the star the lab sees sideways, the traveler sees it at 72.5 degrees at 0.3c, 53.1 degrees at 0.6c and 25.8 degrees at 0.9c. **The cause is that a moving observer finds a different push from the light along the line of travel, while the push across it stays the same, and that changes the direction the light seems to come from.** The two stars straight ahead and straight behind do not move. The stars themselves have not moved; it is the direction of the light, as each observer measures it, that differs.

(Text in `src/App.tsx`, the `learned` of "Where is the star?". It appears only after the tutor's explanation. "What's next" is unchanged.)

---

## 5. Tests and checks the build would add

1. **Module:** a function `rayPushFor(speed)` (or the existing `rayAsMeasuredByTraveler(90, speed)`, whichever is used) gives, for 0.3, 0.6, 0.9 and 0.99: the push across (1), the push along (speed ÷ D), the energy (1 ÷ D), and the star's angle (72.5, 53.1, 25.8, 8.1). A test checks that the energy equals the size of the push and that atan2(across, along) matches `travelerAngleOf(90, speed)`. A small function for the rain-rule's push (the speed itself) is added with a test. No existing function changes.
2. **Render:** the explanation shows items 2 to 5, the drawing with both panels and the three look-for items, the numbers for 0.6c (0.750, 1.250, 53.1°, 59.0°), the "Where the real picture comes from" line, and no white in the drawing; the drawing and items 2 to 5 appear only in the explanation step, never in the first three tutor steps; the words box entry appears only after the run; the summary contains the new sentence.
3. **Browser:** read the explanation at a normal width; check the drawing's labels do not overlap; check at a narrow width.

## 6. Open points for the owner

1. **Wording of item 4** uses a car and rain, which is a daily-life example that does not rely on relativity (§15), and then says "with a difference that comes from relativity". The old item 3 used the same rain idea, so the learner meets rain once, not twice.
2. **"Push" for momentum.** Item 2 introduces "push" and names "momentum" in brackets, with a link to Experiment 5. If you prefer "momentum" first, it is a swap.
3. **The energy sentence in item 4** ("This change in energy is a change in the light's colour: the subject of the next experiment") is a forward pointer; it can go if you prefer nothing about colour here.
4. **The old item 4's cos formula** is kept as a one-line check at the end of item 5. The older "(The formula follows from how energy and momentum change… as in Experiment 5.)" bracket is replaced by items 3 to 5, which show it.
5. **The drawing is optional** if you decide it adds too much; items 2 to 5 stand without it, but it is the only picture of the mechanism.
6. **Not checked:** no code or page was changed or viewed; the wording is not yet read in the browser. The statement that "for light the energy always equals the size of the push" is standard and is checked numerically in the module's tests (cos² + sin² = 1 and E′ positive), but no external source was read for it.
