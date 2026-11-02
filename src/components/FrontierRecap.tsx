// The Cosmic Horizons group's closing recap ("The Frontier recap"). It adds no physics and no controls: it sorts the group's twenty-four
// results by the four status labels each experiment already carries. Every figure comes from `frontierClaims`, which reads it from the
// earlier experiment's own module, so it cannot drift from what the learner saw. See docs/experiments/cosmic-horizons/closing-recap.md
// (approved with defaults on 2026-11-02). The wording is draft for the owner's line-by-line approval (CLAUDE.md §28.1).
import { STATUS_LABELS, claimsWithLabel, displayNumber, frontierClaims, labelCounts } from '../physics/frontierRecap'
import type { Claim, StatusLabel } from '../physics/frontierRecap'

const textStyle = { fontSize: '0.9375rem', lineHeight: 1.6 } as const

const group = (n: number, decimals: number) => n.toLocaleString('en-US', { minimumFractionDigits: decimals, maximumFractionDigits: decimals })

function figureText(claim: Claim): string {
  const f = claim.figure
  if (!f) return ''
  const unit = f.unit ? ` ${f.unit}` : ''
  const value = f.high !== undefined ? `${group(f.value, f.decimals)} to ${group(f.high, f.decimals)}` : group(f.value, f.decimals)
  return ` (${f.what}: ${value}${unit})`
}

const LABEL_MEANINGS: Record<StatusLabel, { meaning: string; example: string }> = {
  Settled: {
    meaning: 'many independent measurements, made in different ways, agree.',
    example: 'a clock higher up ticks faster (Experiment 9).',
  },
  'Strong evidence': {
    meaning: 'one clear result that experts widely accept, but not yet confirmed many different ways.',
    example: 'the black hole after a merger ended with a larger total surface area than the two before (Experiment ' + displayNumber(18) + ').',
  },
  Contested: {
    meaning: 'the data are real, but experts disagree about what they mean.',
    example: 'two ways of measuring how fast the universe expands disagree (Experiment 1).',
  },
  Open: {
    meaning: 'we do not know yet.',
    example: 'what the little red dots are (Experiment ' + displayNumber(23) + ').',
  },
}

export function FrontierRecap() {
  const counts = labelCounts()
  const total = frontierClaims().length

  return (
    <div className="exp-card" style={{ marginTop: '2rem', padding: '1.5rem', ...textStyle }}>
      <h2 style={{ marginTop: 0 }}>Putting It All Together: What Is Settled, What Is Contested, What Is Open?</h2>
      <p>
        You have now run twenty-four experiments about results from the last few years. Each one carried a label saying how settled it is.
        This section puts them side by side. It adds nothing new: every number below is one you have already seen, and everything is “as of
        November 2026”.
      </p>

      <h3>1. The four labels, in plain words</h3>
      <ul>
        {STATUS_LABELS.map((label) => (
          <li key={label}>
            <strong>{label}</strong> means {LABEL_MEANINGS[label].meaning} Example: {LABEL_MEANINGS[label].example}
          </li>
        ))}
      </ul>
      <p>
        One experiment can hold more than one label. A result can be strong while what it means is still open. Experiment {displayNumber(17)} is an example:
        the star’s fading is strong evidence, what it became is contested, and how often stars do this is open.
      </p>

      <h3>2. What the group found, by label</h3>
      <p>
        The twenty-four experiments hold {total} separate findings between them.{' '}
        {counts.map((c, i) => `${c.claims} ${c.claims === 1 ? 'is' : 'are'} ${c.label.toLowerCase()}, in ${c.experiments} experiments${i < counts.length - 1 ? '; ' : '.'}`).join('')}{' '}
        This is a count of findings, not a ranking of experiments.
      </p>
      {STATUS_LABELS.map((label) => (
        <div key={label}>
          <h4 style={{ marginBottom: '0.25rem' }}>{label}</h4>
          <ul style={{ marginTop: 0 }}>
            {claimsWithLabel(label).map((c) => (
              <li key={`${c.experiment}-${c.claim}`}>
                <strong>Experiment {displayNumber(c.experiment)}.</strong> {c.claim}
                {figureText(c)}
              </li>
            ))}
          </ul>
        </div>
      ))}

      <h3>3. What moves a result from one label to another</h3>
      <ul>
        <li>
          <strong>A second independent method.</strong> A clock higher up ticking faster is settled because it was seen across a millimetre, a
          centimetre and, in field tests, hundreds of metres (Experiment 9).
        </li>
        <li>
          <strong>A bigger “sigma”.</strong> A hint at about 3 sigma can fade or grow. DESI’s hint about dark energy sits at 2.7 to 3.2 sigma
          (Experiment 2), and the pulsar-timing hum at about 3 to 4 sigma, not yet 5 (Experiment {displayNumber(22)}).
        </li>
        <li>
          <strong>A tension that goes away.</strong> KiDS’s lumpiness tension went away with a larger survey; the Dark Energy Survey’s has not
          (Experiment 3).
        </li>
        <li>
          <strong>A better measurement of the same thing.</strong> ALPHA-g’s 0.75 ± 0.21 of g could be narrowed by a later, more precise
          campaign (Experiment 8).
        </li>
      </ul>

      <h3>4. This page is a snapshot</h3>
      <p style={{ marginBottom: 0 }}>
        Everything here is “as of November 2026”. Each experiment’s own page says “as of October 2026”, the date it was written. Some findings
        may have moved since, and the “Want to know more?” list on each experiment’s page links to the papers and the official pages, so you
        can check for yourself. This page did not check that no newer result exists for every experiment: each experiment’s own page says what
        was and was not checked.
      </p>
    </div>
  )
}
