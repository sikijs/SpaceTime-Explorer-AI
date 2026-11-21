import { useMemo, useState } from 'react'
import {
  BRIGHTNESS_CHOICES_SOLAR,
  FUEL_CHOICES,
  PART_ONE_LUMINOSITY_SOLAR,
  PART_ONE_SPIN,
  RATIO_CHOICES,
  SPIN_CHOICES,
  WIDTH_CHOICES,
  markGuesses,
  runQuasarExperiment,
} from '../physics/quasarBrightness'
import type { FuelChoiceId, QuasarResult, RatioChoiceId, WidthChoiceId } from '../physics/quasarBrightness'
import { formatNumber, formatPercent, formatSuns, fuelLabel, ratioLabel, widthLabel } from './QuasarBrightnessFormat'
import { ReferencePanel } from './EnergyMomentumExperiment'
import { PartHeader } from './GravitationalWaveExperiment'
import { Block, smallNote } from './TidalEffectExperiment'
import { QuasarBrightnessResults } from './QuasarBrightnessResults'
import { QuasarBrightnessTutor } from './QuasarBrightnessTutor'
import {
  QuasarBrightnessHeldBack,
  QuasarBrightnessHeldBackLinks,
  QuasarBrightnessIntro,
  QuasarBrightnessLinks,
  quasarBrightnessWordsEntries,
} from './QuasarBrightnessIntro'
import { BrightnessCaption, BrightnessPicture, FuelCaption, FuelPicture, SizeCaption, SizePicture } from './QuasarBrightnessPictures'

// Kept exported from here so the earlier tests and imports still work.
export { formatNumber, formatPercent, formatSuns }

// Black Holes and Strong Gravity, Experiment 11 (docs/experiments/black-holes-and-strong-gravity/11-why-do-quasars-outshine-galaxies.md).
// The whole page: the introduction, the links and the words box; Part 1 (three predictions, the Run button, the three pictures with white guess marks);
// Part 2 (brightness and spin buttons, Picture C and a table); Part 3 (the results and reading guide); Part 4 (the tutor); and Start over. Parts 2 to 4
// appear after the first Run. Every number shown is computed by src/physics/quasarBrightness.ts and only displayed here (CLAUDE.md §9).

interface QuasarBrightnessExperimentProps {
  onComplete?: () => void
  onTutorComplete?: () => void
}

const BRIGHTNESS_LABELS: Record<number, string> = {
  1e10: '10 billion Suns',
  1e11: '100 billion Suns',
  1e12: '1 trillion Suns',
  1e13: '10 trillion Suns',
}

export function QuasarResultTable({ result }: { result: QuasarResult }) {
  const rows: Array<[string, string]> = [
    ['The quasar’s light output', formatSuns(result.luminositySolar)],
    ['Share of mass turned to light, falling into the black hole (spin ' + result.spin + ')', formatPercent(result.infallEfficiency)],
    ['Share of mass turned to light, hydrogen fusion in a star', formatPercent(result.fusionEfficiency)],
    ['How many times more light per kilogram, falling in than fusion', formatNumber(result.lightPerKilogramRatio) + ' times'],
    ['Mass that must fall in each year', formatNumber(result.infallSolarMassesPerYear) + ' Suns a year'],
    ['Hydrogen that fusion would have to burn each year', formatNumber(result.fusionSolarMassesPerYear) + ' Suns a year'],
    [
      'How many times brighter than the Milky Way',
      `about ${formatNumber(result.ratioToMilkyWay)} times (${formatNumber(result.ratioToMilkyWayRange.low)} to ${formatNumber(result.ratioToMilkyWayRange.high)} over the published range)`,
    ],
    ['If the light flickers over', `${result.flickerDays} days`],
    ['The source can be no wider than', `${formatNumber(result.sizeLimitAU)} AU (${result.sizeLimitLightDays} light-days)`],
    ['The Milky Way is wider than that by', `${formatNumber(result.galaxyToSourceWidthRatio)} times`],
  ]
  return (
    <table style={{ borderCollapse: 'collapse', marginTop: '1rem', width: '100%' }}>
      <tbody>
        {rows.map(([label, value]) => (
          <tr key={label}>
            <td style={{ padding: '0.4rem 0.75rem 0.4rem 0', verticalAlign: 'top', borderBottom: '1px solid var(--border-color, #ccc)' }}>{label}</td>
            <td style={{ padding: '0.4rem 0', verticalAlign: 'top', fontWeight: 'bold', borderBottom: '1px solid var(--border-color, #ccc)' }}>{value}</td>
          </tr>
        ))}
      </tbody>
    </table>
  )
}

const RATIO_QUESTION = 'Question 1. The Milky Way’s stars together give out about 25 billion Suns of light, and 3C 273 about 4 trillion Suns. About how many times brighter than the whole Milky Way is 3C 273?'
const WIDTH_QUESTION = 'Question 2. Suppose a quasar’s light brightens and fades as a whole over about a week. How wide can the region that makes the light be, compared with the width of the Milky Way?'
const FUEL_QUESTION = 'Question 3. 3C 273’s light is made by gas falling into a black hole that is not spinning. About how much mass, counted in Suns, must fall in each year to make that light?'

const PICTURE_TITLE = { fontWeight: 'bold', marginTop: '1.25rem', marginBottom: 0 } as const

export function QuasarBrightnessExperiment({ onComplete, onTutorComplete }: QuasarBrightnessExperimentProps) {
  // ---- Part 1: the three guesses and the one fixed run (3C 273, no spin) ----
  const [ratioGuess, setRatioGuess] = useState<RatioChoiceId | null>(null)
  const [widthGuess, setWidthGuess] = useState<WidthChoiceId | null>(null)
  const [fuelGuess, setFuelGuess] = useState<FuelChoiceId | null>(null)
  const [locked, setLocked] = useState(false)
  const hasAllGuesses = ratioGuess !== null && widthGuess !== null && fuelGuess !== null
  const hasAnyGuess = ratioGuess !== null || widthGuess !== null || fuelGuess !== null
  const partOne = useMemo(() => runQuasarExperiment(PART_ONE_LUMINOSITY_SOLAR, PART_ONE_SPIN), [])
  // True from the first Run on. What the page held back (the latest results, the extra links, the formulas, Parts 2 to 4) appears then.
  const hasRun = locked

  // ---- Part 2: the learner's own settings ----
  const [luminosity, setLuminosity] = useState<number>(PART_ONE_LUMINOSITY_SOLAR)
  const [spin, setSpin] = useState<number>(PART_ONE_SPIN)
  const [ownResult, setOwnResult] = useState<QuasarResult | null>(null)
  const [ownHasRun, setOwnHasRun] = useState(false)
  const [tutorKey, setTutorKey] = useState(0)

  // A new setting clears the result, so a table never sits beside settings it was not made for.
  const chooseLuminosity = (value: number) => {
    setLuminosity(value)
    setOwnResult(null)
  }
  const chooseSpin = (value: number) => {
    setSpin(value)
    setOwnResult(null)
  }
  const handleRun = () => {
    if (!hasAllGuesses || locked) return
    setLocked(true)
    onComplete?.()
  }
  const handleRunOwn = () => {
    setOwnResult(runQuasarExperiment(luminosity, spin))
    setOwnHasRun(true)
  }

  // Start over: clears the guesses, the runs and the results, and returns the page to its first state.
  const handleStartOver = () => {
    setRatioGuess(null)
    setWidthGuess(null)
    setFuelGuess(null)
    setLocked(false)
    setLuminosity(PART_ONE_LUMINOSITY_SOLAR)
    setSpin(PART_ONE_SPIN)
    setOwnResult(null)
    setOwnHasRun(false)
    setTutorKey((k) => k + 1)
  }
  const startOverDisabled = !hasAnyGuess && !locked

  const guessButtons = <T extends string>(choices: Array<{ value: T; label: string }>, selected: T | null, onSelect: (value: T) => void) => (
    <div style={{ marginBottom: '0.75rem' }}>
      {choices.map((choice) => (
        <button
          key={choice.value}
          type="button"
          onClick={() => onSelect(choice.value)}
          disabled={locked}
          className={`toggle-button${selected === choice.value ? ' is-selected' : ''}`}
          style={{ marginRight: '0.5rem', marginBottom: '0.5rem' }}
        >
          {choice.label}
        </button>
      ))}
    </div>
  )

  return (
    <div style={{ padding: '2rem', maxWidth: '900px', margin: '0 auto' }}>
      <h2>Black Holes 11: Why Do Quasars Outshine Galaxies?</h2>

      <div className="exp-card" style={{ marginTop: '2rem', padding: '1.5rem' }}>

        {/* ===== Above Part 1: the introduction, the links and the words ===== */}
        <QuasarBrightnessIntro />
        <ReferencePanel entries={quasarBrightnessWordsEntries(hasRun)} />
        <QuasarBrightnessLinks />

        {/* ===== Part 1 ===== */}
        <PartHeader color="#d97706" title="Part 1: Predict, then watch">
          Here you make three guesses, then press Run to see three real pictures for 3C 273 and a black hole that is not spinning: how bright it is next to our galaxy, how wide the source of its light can be, and how much matter must fall in each year. The real pictures and tables never change with your guesses. Your guesses are drawn on them in white once you press Run, and they appear again beside the results.
        </PartHeader>

        <div style={{ marginBottom: '1rem' }}>
          <p style={{ fontWeight: 'bold', marginBottom: '0.5rem' }}>Make your guesses</p>
          <p style={{ ...smallNote, marginTop: 0, marginBottom: '0.75rem' }}>
            There are three questions. Choose one answer to each. Once you press Run, your three guesses are locked, they are drawn on the real pictures in white, and they appear again beside the results.
          </p>
          <p style={{ fontSize: '0.875rem', marginBottom: '0.5rem' }}>{RATIO_QUESTION}</p>
          <p style={{ ...smallNote, marginTop: 0 }}>Your guess is drawn on Picture A, the ruler of brightness, in white.</p>
          {guessButtons(RATIO_CHOICES.map((c) => ({ value: c.id, label: ratioLabel(c.id) })), ratioGuess, setRatioGuess)}

          <p style={{ fontSize: '0.875rem', marginBottom: '0.5rem' }}>{WIDTH_QUESTION}</p>
          <p style={{ ...smallNote, marginTop: 0 }}>Your guess is drawn on Picture B, the ruler of widths, in white.</p>
          {guessButtons(WIDTH_CHOICES.map((c) => ({ value: c.id, label: widthLabel(c.id) })), widthGuess, setWidthGuess)}

          <p style={{ fontSize: '0.875rem', marginBottom: '0.5rem' }}>{FUEL_QUESTION}</p>
          <p style={{ ...smallNote, marginTop: 0 }}>Your guess is drawn on Picture C, the ruler of mass each year, in white.</p>
          {guessButtons(FUEL_CHOICES.map((c) => ({ value: c.id, label: fuelLabel(c.id) })), fuelGuess, setFuelGuess)}

          <p style={smallNote}>
            {hasAllGuesses
              ? `Your guesses: ${ratioLabel(ratioGuess!)}; ${widthLabel(widthGuess!)} as the Milky Way; ${fuelLabel(fuelGuess!)}.`
              : 'Answer all three questions to run.'}
          </p>
          {locked && <p style={smallNote}>Your prediction is locked while you try other settings. To change it, press Start over.</p>}
        </div>

        <button type="button" className="action-button" onClick={handleRun} disabled={!hasAllGuesses || locked} style={{ padding: '0.75rem 2rem', fontSize: '1rem' }}>
          {locked ? 'Run (done)' : 'Run'}
        </button>
        <button
          type="button"
          onClick={handleStartOver}
          disabled={startOverDisabled}
          className="secondary-button"
          style={{
            marginLeft: '0.75rem',
            padding: '0.5rem 1.25rem',
            fontSize: '0.875rem',
            cursor: startOverDisabled ? 'not-allowed' : 'pointer',
            opacity: startOverDisabled ? 0.5 : 1,
          }}
        >
          Start over
        </button>

        <Block>
          {!locked ? (
            <p style={{ ...smallNote, fontWeight: 'bold' }}>
              Pictures A, B and C appear here when you press Run: the ruler of brightness, the ruler of widths and the ruler of mass each year. Each has its own caption.
            </p>
          ) : (
            <>
              <p style={{ ...smallNote, ...PICTURE_TITLE, marginTop: 0 }}>Picture A: how bright?</p>
              <BrightnessPicture guess={ratioGuess} />
              <BrightnessCaption withGuess />

              <p style={{ ...smallNote, ...PICTURE_TITLE }}>Picture B: how wide?</p>
              <SizePicture guess={widthGuess} />
              <SizeCaption withGuess />

              <p style={{ ...smallNote, ...PICTURE_TITLE }}>Picture C: how much matter each year?</p>
              <FuelPicture result={partOne} guess={fuelGuess} />
              <FuelCaption result={partOne} withGuess />
            </>
          )}
        </Block>

        {/* ===== Parts 2 to 4 appear after the first Run ===== */}
        {!locked && (
          <p style={{ ...smallNote, marginTop: '2rem', fontWeight: 'bold' }}>
            Make all three guesses and press Run. Part 2 (your own settings), Part 3 (the results), Part 4 (the tutor), a section on the latest results and more links appear after your first run.
          </p>
        )}

        {locked && (
          <>
            {/* ===== Part 2 ===== */}
            <PartHeader color="#be185d" title="Part 2: Now try it yourself">
              Now you choose how bright the quasar is and how fast the black hole spins, and run it as often as you like. The guesses you made stay as they were. They do not change any picture or table; these settings do. They are trial values, and they do not say that a real quasar is like that.
            </PartHeader>

            <h3 style={{ marginTop: 0 }}>How bright is the quasar?</h3>
            <div style={{ marginBottom: '0.5rem' }}>
              {[PART_ONE_LUMINOSITY_SOLAR, ...BRIGHTNESS_CHOICES_SOLAR].map((value) => (
                <button
                  key={value}
                  type="button"
                  onClick={() => chooseLuminosity(value)}
                  className={`toggle-button${luminosity === value ? ' is-selected' : ''}`}
                  style={{ marginRight: '0.5rem', marginBottom: '0.5rem' }}
                >
                  {value === PART_ONE_LUMINOSITY_SOLAR ? '3C 273: about 4 trillion Suns' : BRIGHTNESS_LABELS[value]}
                </button>
              ))}
            </div>

            <h3>How fast does the black hole spin?</h3>
            <div style={{ marginBottom: '0.5rem' }}>
              {SPIN_CHOICES.map((value) => (
                <button
                  key={value}
                  type="button"
                  onClick={() => chooseSpin(value)}
                  className={`toggle-button${spin === value ? ' is-selected' : ''}`}
                  style={{ marginRight: '0.5rem', marginBottom: '0.5rem' }}
                >
                  {value === 0 ? 'No spin (0)' : `Spin ${value}`}
                </button>
              ))}
            </div>

            <button type="button" onClick={handleRunOwn} className="action-button" style={{ marginTop: '0.5rem', padding: '0.75rem 2rem', fontSize: '1rem' }}>
              Run these settings
            </button>
            <p style={smallNote}>
              Only Picture C and the table below follow these settings. Pictures A and B above stay as they are, because the brightness of 3C 273 and the one-week flicker do not depend on them.
            </p>

            {ownResult ? (
              <>
                <p style={{ ...smallNote, ...PICTURE_TITLE }}>Picture C for your own settings</p>
                <FuelPicture result={ownResult} />
                <FuelCaption result={ownResult} />
                <p style={{ ...smallNote, fontWeight: 'bold', marginTop: '1.25rem', marginBottom: 0 }}>Numbers for your own settings</p>
                <QuasarResultTable result={ownResult} />
              </>
            ) : (
              <p style={{ marginBottom: 0, color: 'var(--text-muted)' }}>
                {ownHasRun
                  ? 'You changed a setting. Press Run these settings to see the picture and the numbers for the new settings.'
                  : 'Choose a brightness and a spin, then press Run these settings. Picture C and a table of numbers for your settings appear here.'}
              </p>
            )}

            {/* ===== Part 3 ===== */}
            <PartHeader color="#0f766e" title="Part 3: The results">
              Here are the numbers behind the pictures, and a check-up of this page against published values. Under each table a short note says what it is, what it means with the real numbers and why it matters. Your guesses are shown beside the results, and both tables stay the same however you guess and however you set Part 2.
            </PartHeader>
            <QuasarBrightnessResults ratioGuess={ratioGuess!} widthGuess={widthGuess!} fuelGuess={fuelGuess!} />

            <QuasarBrightnessHeldBack />
            <QuasarBrightnessHeldBackLinks />

            {/* ===== Part 4 ===== */}
            <PartHeader color="#0066cc" title="Part 4: The tutor">
              The tutor asks three questions, one at a time: what you saw, how your three guesses compare with the pictures, and one question about why falling toward a black hole makes so much more light from each kilogram than fusion does. Then it goes through your three guesses and explains. The tutor’s questions are not marked.
            </PartHeader>
            <QuasarBrightnessTutor
              key={tutorKey}
              ratioGuess={ratioGuess!}
              widthGuess={widthGuess!}
              fuelGuess={fuelGuess!}
              matches={markGuesses({ ratio: ratioGuess!, width: widthGuess!, fuel: fuelGuess! })}
              onExplained={() => onTutorComplete?.()}
            />
          </>
        )}
      </div>
    </div>
  )
}
