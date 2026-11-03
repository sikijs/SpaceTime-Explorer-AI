# Audit draft: Cosmic Horizons Experiment 1 (Hubble tension)
Date: 2026-11-03 | Status: wording approved by the owner 2026-11-03; built and checked in Chrome. Physics module extended, existing results unchanged. Added at the owner's request after the draft: Drawing A in Part 2, a note under the check-up, and the "Your own error bars are on" line.

Owner decisions of 2026-11-03: Webb option (b), Webb panel at the last stage, and the three check-up rows all agreed.

Decisions taken (owner: "take the recommendations", 2026-11-03): Rule B decided per experiment (below); marker panel where a guess has no picture; tutor wording may change with approval; specification and status updated as each experiment finishes; one experiment at a time.

## Gaps chosen
| Rule | Fix |
|---|---|
| A (guess marks) | P1 band on Picture 2's sigma ticks; P2 marker on a new "Webb's second look" panel added to Picture 1 |
| A6, A7, A10 | "Where the real picture comes from" under Pictures 1 and 2; intro and control note say the guesses never change the pictures or tables |
| B1, B2, B4 | Check-up table, "What this table tells us" under each table, guesses listed with question and row tag. **B3 (published-value column for the stretch control): left out**, because the control only moves marks in the pictures and the check-up already holds the published numbers |
| B3 wording | "What if the error bars were bigger?" becomes "Try your own error bars" (trial values) |
| C5, C6 | Worked moment with the chosen measurement's real numbers; every "what to look for" item in Look at / What it means / Why it matters |
| A9 | Tutor observe and compare prompts name the YOUR GUESS marks |
| E | Four Parts, with leads (below) |

## Questions that need your decision (I will not guess, §8)
1. **Webb sign.** Prediction 2 is about the nearby H0 going lower/same/higher, but the published result is a Cepheid brightness difference of -0.01 ± 0.03 mag. The module has no rule linking the sign of that difference to the direction of H0. Options: (a) you give me the rule and I add it, tested; (b) the panel shows only the real result (-0.01 ± 0.03 mag, "no more than its own uncertainty") and the guess as three labelled marker slots, "lower / about the same / higher", with a caption saying the marker is only a marker and sits on no magnitude scale. I recommend (b), which invents no physics.
2. **When the Webb panel appears.** The run has seven stages and none shows Webb. The panel would be new content, and it gives away Prediction 2's answer, so I would show it only at the last stage, after the guess is made. Say if you prefer another stage.
3. **Check-up rows** (all have a published reference): sigma here vs the 5 sigma that SH0ES and Planck quote (for SH0ES only; the page already warns they can differ); Planck and SH0ES values vs the specification's sources; Webb difference vs its own uncertainty. Rows for other measurements say "the same / more / less" only. Confirm these three.

## Drafted wording

### Introduction, "Your job" (replaces the last two sentences)
"Choose a nearby-universe measurement. Predict how many sigma apart it is from the early-universe value, and what happened when the Webb telescope re-measured the same Cepheid stars. Press Run. Your predictions never change the real pictures or tables. They are drawn on the pictures in white, in a box marked YOUR GUESS, so you can compare them with what was measured, and they are listed again beside the results. In Part 2 you can try your own error bars; those do change some of the drawings, and your guesses do not."

### Part leads
- **Part 1, Predict, then watch** (amber): "We are about to make two predictions, then watch the measurements appear on a line, one stage at a time. Nothing here tells you the answers."
- **Part 2, Now try it yourself** (pink): "We are about to make every error bar bigger, to see how much smaller the sigma becomes. These are trial values. They change the numbers in the tables, never the three pictures and never the published measurements."
- **Part 3, The results** (teal): "We are about to read the numbers: first a check-up against the published values, then the tables. A guess never changes them. The trial values from Part 2 change the sigma and give-or-take rows, and the page says when they are on."
- **Part 4, The tutor** (blue): "We are about to talk through your two predictions with the tutor, who will compare them with the results."

### Guess marks
- **Prediction 1 (Picture 2, the numbered ticks):** a white band under the ticks covering the chosen range ("Less than 2" = 0 to 2, "Between 2 and 4" = 2 to 4, "Between 4 and 6" = 4 to 6, "More than 6" = 6 onward, ending in an arrow), joined by a line to a white box "YOUR GUESS: between 2 and 4 sigma". It appears with the ticks (stage 5). Caption line: "The white band is your guess, drawn on the same ticks that count the real sigma. It is only where you guessed; it is not a result."
- **Prediction 2 (new panel "Webb's second look", below Picture 1):** the real Webb result on its own scale (title: "Webb minus Hubble, Cepheid brightness, in magnitudes"): a dot at -0.01 with a bar of ± 0.03. Three white marker slots "lower / about the same / higher"; the chosen one gets a white box "YOUR GUESS: about the same". Caption: "The white marker is only a marker. It says which of the three you chose; it is not placed on the magnitude scale."

### "Where the real picture comes from"
- **Picture 1:** "Measured: the early-universe value by the Planck satellite team; the nearby-universe values by the teams named in the table. Calculated here: the gap. Imagined for the question: nothing."
- **Picture 2:** "Measured: the two best values and their give-or-takes. Calculated here: the bell-curve shapes, the combined give-or-take, the tick spacing and sigma. Imagined for the question: nothing. The bell curves are a simple drawing of each give-or-take, not the scientists' full statistics."
- **Webb panel:** "Measured: Riess and colleagues, 2024 (arXiv:2401.04773). Calculated here: nothing. Imagined for the question: nothing."

### Control note (beside the stretch control)
"Your guesses do not change the drawings or tables. These settings do. They are trial values, not measurements, and the real measurements are not like that."
Control heading: "Try your own error bars" (was "What if the error bars were bigger?").

### Results: check-up (near the top)
| What we check | Expected | Found | Reading |
|---|---|---|---|
| Sigma, SH0ES vs Planck | 5 (as quoted in the papers) | from module | "close" / "differs" as computed, no cut-off invented |
| Webb minus Hubble | 0 (no change) | -0.01 ± 0.03 mag | "smaller than its own uncertainty" |
Wording of readings to be finalised once you confirm question 3.

### Results: "What this table tells us" (each item: what it is, what it means with the numbers, why it matters)
Drafted from the existing bullet guide (`HubbleTensionExperiment.tsx:1037-1073`), split under each table, each with a "Why it matters" line. To avoid a long unreviewed block, I will draft these after you approve the structure above.

### Predictions beside the results
"Your guesses. Prediction 1, how many sigma apart: *your choice*. See the sigma row of Table 1 [tag: your guess]. Prediction 2, what Webb changed: *your choice*. See the Webb row of the check-up [tag: your guess]." Guess only; no "right" or "matched".

### Tutor
Observe prompt adds: "Look for the white YOUR GUESS band under the numbered ticks in Picture 2, and the white marker in the Webb panel." Compare prompt names the same marks.

## Physics to add (tests first, §9, §10)
`sigmaGuessBand(range)` returns `{ lo, hi }` in sigma (hi is null for "over6"); `sigmaBandOnLine(range, combinedUncertainty)` gives the band's span in km/s/Mpc; a Webb-panel function returning the real point and bar from `WEBB_CEPHEID_RESULT`; check-up rows. Existing functions unchanged.


## Draft 2 (2026-11-03): captions (C5, C6) and "What this table tells us"
The existing bullets that define each drawn element stay as approved. Only the worked moments and the "what to look for" lists change. Numbers in angle brackets are filled from the module for the chosen measurement; the example shows SH0ES 2022 (gap 5.64, combined give-or-take 1.15, sigma 4.89, from the module's formulas).

### Picture 1 (shown with the other measurements; no sigma yet, §12)
**A worked moment.** "Take <SH0ES 2022>: 73.04 ± 1.04. Its dot sits at 73.04 and its bar runs from 72.00 to 74.08. Planck's dot sits at 67.4, with a bar from 66.9 to 67.9. The gap bracket measures 73.04 − 67.4 = 5.64 km/s/Mpc. The two bars do not touch: there is empty line between 67.9 and 72.00."
**What to look for** (each: Look at / What it means / Why it matters)
1. *Look at* where each orange dot sits against the dashed blue line. *What it means* a dot to the right found a faster expansion; <SH0ES 2022> is 5.64 to the right. *Why it matters* the distance is the size of the disagreement, but it cannot say alone whether it is big or small.
2. *Look at* whether an orange bar and the blue bar touch. *What it means* for <SH0ES 2022> there is empty line between them (67.9 to 72.00). *Why it matters* touching bars share plausible values, so a gap could be chance; an empty space is what sigma turns into a number.
3. *Look at* which bars are long and which short. *What it means* Planck's bar is 1.0 long and <SH0ES 2022>'s is 2.08 long, so Planck is the more precise. *Why it matters* the same distance from the line is a bigger puzzle for a short bar than for a long one.

### Picture 2 (with the ticks, stage 5; the sigma is now drawn, so it can be used)
**A worked moment.** "The combined give-or-take is the square root of 1.04² + 0.5² = 1.0816 + 0.25 = 1.33, which is 1.15. The gap, 5.64, divided by 1.15 gives 4.89. So four full ticks fit along the gap, and most of a fifth: 4.89 sigma."
**What to look for**
1. *Look at* how wide each hill is. *What it means* Planck's hill is narrow (give-or-take 0.5), <SH0ES 2022>'s wider (1.04). *Why it matters* two narrow hills far apart are a stronger disagreement than two wide hills the same distance apart.
2. *Look at* how much purple there is. *What it means* for <SH0ES 2022> the hills overlap only in their thin tails [wording follows the drawing; to be checked in the browser]. *Why it matters* purple is the values both accept, so little purple means they are hard to reconcile.
3. *Look at* how many ticks fit along the gap. *What it means* <4.89> ticks fit. *Why it matters* the more ticks, the less chance explains the gap; this count is the sigma the Results use. The white band, if drawn, shows where you guessed.

### Picture 3 (stage 6)
**A worked moment** (live numbers): "1 ÷ 67.4 gives 14.51 billion years; 1 ÷ 73.04 gives 13.39. The difference is 1.12 billion years." (Existing 70 and 73 example replaced; the module's `hubbleTimeBillionYears` gives the numbers.)
**What to look for**
1. *Look at* how much longer the blue bar is than the orange bar. *What it means* <1.12> billion years. *Why it matters* the disagreement changes the rough age of the universe, not only one number.
2. *Look at* where each bar ends against the yellow "real age, about 13.8" line. *What it means* blue ends to its right (older) and orange to its left (younger) for <SH0ES 2022>. *Why it matters* the bars are rough, so what counts is the difference between them, not whether either lands on the line.

### Results: "What this table tells us"
**Under Table 1 (the facts for your measurement)**
- *Gap.* The bigger best value minus the smaller: <5.64> km/s/Mpc. It is the size of the disagreement before doubt is counted. It matters because on its own it cannot tell a real disagreement from chance.
- *Combined give-or-take.* The doubt about the gap: <1.15>, from the square root of the two uncertainties squared and added. Like two wobbly rulers: their wobbles add, but not fully, because they are unlikely to wobble the same way. It matters because it is the yardstick the gap is measured against.
- *Sigma.* The gap divided by the combined give-or-take: <4.89>. About 1 is an ordinary difference and 5 or more is the usual bar for calling a difference real. It matters because it turns "far apart" into a number that does not depend on the units. The papers use more careful statistics, so theirs can differ a little (the check-up shows this).
- *Hubble time.* 1 ÷ H0 in billions of years, <14.51> and <13.39>. A rough age, not the real one. It matters because it shows the disagreement changes a number people care about.

**Under Table 2 (every nearby measurement)**
- *Sigma column.* The same calculation for every nearby-universe measurement against Planck: <1.50, 4.89, 6.41> (CCHP 2024, SH0ES 2022, H0DN 2026). It matters because the nearby measurements do not all disagree by the same amount: the sigma depends on the measurement's own give-or-take as well as its distance from Planck. We report only the numbers; the page does not say which, if any, is wrong.

**Under "Try your own error bars"** (trial values)
- *What it is.* Every give-or-take in the tables multiplied by 1.5, 2, 3 or 5. *What it means* the gaps stay put but the combined give-or-take grows, so every sigma is divided by the same number: 4.89 at ×2 is 2.45. *Why it matters* it shows how much sigma depends on how large the uncertainties are. These are trial values, not measurements, and the real measurements are not like that.

### Check-up table (final wording of the readings, computed in the module)
| What we check | Expected | Found here | Reading |
|---|---|---|---|
| SH0ES 2022 vs Planck, sigma | about 5 (as quoted in the papers) | 4.89 | "close" (shown only when SH0ES is the chosen one, or in its own row) |
| Webb minus Hubble, Cepheid brightness | 0 mag (no change) | -0.01 ± 0.03 mag | "smaller than its own uncertainty" |
| Planck and SH0ES values | the published values | the same | "the same" |
Rows for H0DN 2026 and CCHP 2024 say only "more" or "less" than SH0ES, since I have no published sigma for them (§14: no invented cut-offs). If you know of one, tell me.
