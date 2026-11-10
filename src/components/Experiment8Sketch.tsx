import { blockSketchFor, flashSketchFor } from '../physics/spacetimeDiagramView'
import { CaptionBox } from './Experiment6Pictures'
import { LookForList } from './WideBinariesExperiment'

// Relativity of Time and Motion, Experiment 8: the sketch in the introduction, "From a block to two leaning lines".
// A fixed illustration (not the real diagram, and not tied to the speed controls): the same block at one moment, and at four
// moments stacked, with the two ends joined into two leaning lines. Every position comes from blockSketchFor in
// src/physics/spacetimeDiagramView.ts (CLAUDE.md §9). The wording is the owner's, approved on 2026-11-10 (CLAUDE.md §28.1).

const SKETCH_SPEED = 0.5 // c
const PHOTO_COUNT = 4
const PHOTO_STEP = 0.2 // seconds

const BACK_COLOR = '#2563eb' // blue: the back end (same as the real diagram)
const FRONT_COLOR = '#7c3aed' // purple: the front end (same as the real diagram)
const INK = '#1e293b'

const VIEW_WIDTH = 720
const VIEW_HEIGHT = 300
const SCALE = 400 // pixels per light-second, the same in both panels
const BLOCK_HEIGHT = 24
const LEFT_CENTER_X = 135
const RIGHT_ORIGIN_X = 440 // the pixel position of light-second 0 in the right panel
const BOTTOM_Y = 250 // the centre of the earliest photo in the right panel
const ROW_SPACING = 56 // pixels between photos, 0.2 s apart
const LEFT_BLOCK_Y = 150

function BlockRect({ x1, x2, y }: { x1: number; x2: number; y: number }) {
  return (
    <g>
      <rect x={x1} y={y - BLOCK_HEIGHT / 2} width={x2 - x1} height={BLOCK_HEIGHT} fill="#ffffff" fillOpacity={0.6} />
      <line x1={x1} y1={y - BLOCK_HEIGHT / 2} x2={x1} y2={y + BLOCK_HEIGHT / 2} stroke={BACK_COLOR} strokeWidth={5} />
      <line x1={x2} y1={y - BLOCK_HEIGHT / 2} x2={x2} y2={y + BLOCK_HEIGHT / 2} stroke={FRONT_COLOR} strokeWidth={5} />
    </g>
  )
}

export function BlockToLinesSketch() {
  const photos = blockSketchFor(SKETCH_SPEED, PHOTO_COUNT, PHOTO_STEP)
  const photoY = (i: number) => BOTTOM_Y - i * ROW_SPACING
  const rightX = (position: number) => RIGHT_ORIGIN_X + position * SCALE
  const leftX = (position: number) => LEFT_CENTER_X + position * SCALE
  const first = photos[0]
  const last = photos[photos.length - 1]
  const timeLabel = (t: number) => `${Number(t.toFixed(1))} s`
  return (
    <div style={{ margin: '0.75rem 0 1rem' }}>
      <p style={{ margin: '0 0 0.5rem', fontWeight: 'bold' }}>From a block to two leaning lines (a sketch, not the real diagram)</p>
      <div style={{ backgroundColor: '#d9ecff', borderRadius: '6px', padding: '0.25rem 0.5rem' }}>
        <svg
          viewBox={`0 0 ${VIEW_WIDTH} ${VIEW_HEIGHT}`}
          role="img"
          aria-label="A sketch. On the left, a flat block at one moment, with a blue back end and a purple front end. On the right, the same block drawn at four moments, one above the other and a little further right each time, with a blue line joining the back ends and a purple line joining the front ends."
          style={{ width: '100%', height: 'auto' }}
        >
          {/* left panel: one moment */}
          <text x={LEFT_CENTER_X} y={20} fill={INK} fontSize="13" fontWeight="bold" textAnchor="middle">
            ONE MOMENT
          </text>
          <BlockRect x1={leftX(first.backPosition)} x2={leftX(first.frontPosition)} y={LEFT_BLOCK_Y} />
          <text x={leftX(first.backPosition)} y={LEFT_BLOCK_Y - BLOCK_HEIGHT / 2 - 8} fill={BACK_COLOR} fontSize="12" fontWeight="bold" textAnchor="middle">
            Back end
          </text>
          <text x={leftX(first.frontPosition)} y={LEFT_BLOCK_Y - BLOCK_HEIGHT / 2 - 8} fill={FRONT_COLOR} fontSize="12" fontWeight="bold" textAnchor="middle">
            Front end
          </text>
          <text x={LEFT_CENTER_X} y={LEFT_BLOCK_Y + 4} fill={INK} fontSize="12" fontWeight="bold" textAnchor="middle">
            BLOCK
          </text>
          <text x={LEFT_CENTER_X} y={LEFT_BLOCK_Y + BLOCK_HEIGHT / 2 + 22} fill="#475569" fontSize="11" textAnchor="middle">
            a photo of the block at one moment
          </text>

          {/* right panel: many moments, stacked */}
          <text x={(RIGHT_ORIGIN_X + 20)} y={20} fill={INK} fontSize="13" fontWeight="bold" textAnchor="middle">
            MANY MOMENTS, STACKED
          </text>
          {/* the two leaning lines, drawn first so the photos sit on top */}
          <line x1={rightX(first.backPosition)} y1={photoY(0)} x2={rightX(last.backPosition)} y2={photoY(photos.length - 1)} stroke={BACK_COLOR} strokeWidth={2.5} />
          <line x1={rightX(first.frontPosition)} y1={photoY(0)} x2={rightX(last.frontPosition)} y2={photoY(photos.length - 1)} stroke={FRONT_COLOR} strokeWidth={2.5} />
          {photos.map((p, i) => (
            <g key={i}>
              <BlockRect x1={rightX(p.backPosition)} x2={rightX(p.frontPosition)} y={photoY(i)} />
              <text x={rightX(first.backPosition) - 30} y={photoY(i) + 4} fill={INK} fontSize="11" textAnchor="end">
                {timeLabel(p.time)}
              </text>
            </g>
          ))}
          {/* the arrow marked "time" */}
          <line x1={rightX(first.backPosition) - 20} y1={BOTTOM_Y + 24} x2={rightX(first.backPosition) - 20} y2={photoY(photos.length - 1) - 24} stroke={INK} strokeWidth={1.5} />
          <polygon
            points={`${rightX(first.backPosition) - 25},${photoY(photos.length - 1) - 22} ${rightX(first.backPosition) - 15},${photoY(photos.length - 1) - 22} ${rightX(first.backPosition) - 20},${photoY(photos.length - 1) - 32}`}
            fill={INK}
          />
          <text x={rightX(first.backPosition) - 20} y={photoY(photos.length - 1) - 38} fill={INK} fontSize="11" fontWeight="bold" textAnchor="middle">
            time
          </text>
          {/* the arrow marked "position" */}
          <line x1={rightX(first.backPosition)} y1={VIEW_HEIGHT - 12} x2={rightX(last.frontPosition)} y2={VIEW_HEIGHT - 12} stroke={INK} strokeWidth={1.5} />
          <polygon
            points={`${rightX(last.frontPosition)},${VIEW_HEIGHT - 17} ${rightX(last.frontPosition)},${VIEW_HEIGHT - 7} ${rightX(last.frontPosition) + 10},${VIEW_HEIGHT - 12}`}
            fill={INK}
          />
          <text x={rightX(last.frontPosition) + 16} y={VIEW_HEIGHT - 8} fill={INK} fontSize="11" fontWeight="bold">
            position
          </text>
        </svg>
      </div>
      <CaptionBox>
        <p style={{ marginTop: 0, marginBottom: '0.5rem' }}>
          <strong>How to read this sketch.</strong> A small picture to help you read the real diagram further down this page. It shows how a
          block with two ends turns into two leaning lines. It has no flash in it and does not show any result of the experiment.
        </p>
        <p style={{ margin: '0 0 0.25rem' }}>
          <strong>Left picture: one moment</strong>
        </p>
        <ul style={{ margin: '0 0 0.75rem', paddingLeft: '1.25rem' }}>
          <li>
            <strong>The pale rectangle labelled BLOCK</strong> is the block at one single moment, like a photo. It lies flat, like a train
            car.
          </li>
          <li>
            <strong>The blue line</strong> is its back end, the end it moves away from. <strong>The purple line</strong> is its front end,
            the end it moves towards. These are the two ends of one block, not two separate objects.
          </li>
        </ul>
        <p style={{ margin: '0 0 0.25rem' }}>
          <strong>Right picture: many moments, stacked</strong>
        </p>
        <ul style={{ margin: '0 0 0.75rem', paddingLeft: '1.25rem' }}>
          <li>
            <strong>The four pale rectangles</strong> are the same block at four moments, drawn one above the other. The lowest is the
            earliest. Each is a photo taken a little later than the one below it.
          </li>
          <li>
            <strong>Each rectangle sits a little to the right of the one below.</strong> The block is moving right, so it is further along
            at each later moment. In this sketch the block moves at 0.5c, half the speed of light, and the photos are 0.2 seconds apart. A
            light-second is the distance light travels in one second, about 300,000 km. At 0.5c the block moves 0.1 light-second between
            photos, about 30,000 km, so each rectangle is that far to the right of the one below.
          </li>
          <li>
            <strong>The leaning blue line</strong> joins the blue back ends of all four photos. <strong>The leaning purple line</strong> joins
            the purple front ends. Each line is the path of one end through time, and a path like that is called a{' '}
            <strong>worldline</strong>.
          </li>
          <li>
            <strong>The arrow marked &ldquo;time&rdquo;</strong> points up. Later moments are higher. <strong>The arrow marked
            &ldquo;position&rdquo;</strong> points right. Positions further along are further right.
          </li>
        </ul>
        <p style={{ margin: '0 0 0.75rem' }}>
          <strong>A worked moment.</strong> Take the lowest photo, at 0 s, and the next one up, at 0.2 s. The back end moved 0.1
          light-second to the right between them, so the blue line leans 0.1 light-second to the right for every 0.2 s it rises. The front
          end moved the same distance, so the purple line leans by the same amount. That is why the two lines are parallel.
        </p>
        <p style={{ margin: '0 0 0.25rem' }}>
          <strong>What to look for</strong>
        </p>
        <LookForList
          items={[
            {
              look: 'the left rectangle and the right stack of rectangles together.',
              means: 'the right stack is the left rectangle photographed again and again as time passes. Nothing about the block itself changes.',
              matters: 'it shows that a spacetime diagram is made of ordinary moments stacked up, so there is nothing new to fear in it.',
            },
            {
              look: 'the blue line and the purple line.',
              means: 'each end of the block leaves its own line. They lean the same way and by the same amount, 0.1 light-second right for every 0.2 s up.',
              matters: 'this is why the real diagram shows two leaning lines for one block, and not one.',
            },
            {
              look: 'the gap between the blue and purple lines at any height.',
              means: 'it is the block’s length in the lab at that moment. It stays the same all the way up.',
              matters: 'it shows that the lean is the block’s motion through time, and the block does not bend or stretch.',
            },
          ]}
        />
        <p style={{ margin: '0.75rem 0 0', fontSize: '0.8125rem' }}>
          <strong>Where this picture comes from.</strong> <em>Imagined for illustration:</em> the block, its speed (0.5c) and its photo times.{' '}
          <em>Measured:</em> nothing. <em>Calculated here:</em> only the positions of the four photos, from the speed and the time between
          them. The real diagram below is calculated from the experiment&rsquo;s own physics, for the speed you choose.
        </p>
      </CaptionBox>
    </div>
  )
}

// ---- The second sketch: "From a flash to two leaning lines" ----
const FLASH_CENTER_X = 360
const FLASH_AXIS_X = 100 // the arrow marked "time"

export function FlashToLinesSketch() {
  const photos = flashSketchFor(PHOTO_COUNT, PHOTO_STEP)
  const photoY = (i: number) => BOTTOM_Y - i * ROW_SPACING
  const x = (position: number) => FLASH_CENTER_X + position * SCALE
  const last = photos[photos.length - 1]
  const lastY = photoY(photos.length - 1)
  const timeLabel = (t: number) => `${Number(t.toFixed(1))} s`
  return (
    <div style={{ margin: '0.75rem 0 1rem' }}>
      <p style={{ margin: '0 0 0.5rem', fontWeight: 'bold' }}>From a flash to two leaning lines (a sketch, not the real diagram)</p>
      <div style={{ backgroundColor: '#d9ecff', borderRadius: '6px', padding: '0.25rem 0.5rem' }}>
        <svg
          viewBox={`0 0 ${VIEW_WIDTH} ${VIEW_HEIGHT}`}
          role="img"
          aria-label="A sketch. An amber dot at the bottom marks where a flash of light is released. Above it, at 0.2, 0.4 and 0.6 seconds, two dots for each time, one further left and one further right. A blue dashed line joins the dots on the left and a purple dashed line joins the dots on the right, like the two sides of the letter V."
          style={{ width: '100%', height: 'auto' }}
        >
          <text x={FLASH_CENTER_X} y={20} fill={INK} fontSize="13" fontWeight="bold" textAnchor="middle">
            FLASH OF LIGHT, AT FOUR MOMENTS
          </text>
          <line x1={x(0)} y1={photoY(0)} x2={x(last.leftPosition)} y2={lastY} stroke={BACK_COLOR} strokeWidth={2.5} strokeDasharray="5 4" />
          <line x1={x(0)} y1={photoY(0)} x2={x(last.rightPosition)} y2={lastY} stroke={FRONT_COLOR} strokeWidth={2.5} strokeDasharray="5 4" />
          {photos.map((p, i) =>
            i === 0 ? null : (
              <g key={i}>
                <circle cx={x(p.leftPosition)} cy={photoY(i)} r={6} fill={BACK_COLOR} />
                <circle cx={x(p.rightPosition)} cy={photoY(i)} r={6} fill={FRONT_COLOR} />
              </g>
            ),
          )}
          {photos.map((p, i) => (
            <text key={`t${i}`} x={FLASH_AXIS_X - 8} y={photoY(i) + 4} fill={INK} fontSize="11" textAnchor="end">
              {timeLabel(p.time)}
            </text>
          ))}
          <circle cx={x(0)} cy={photoY(0)} r={7} fill="#e6a700" stroke={INK} strokeWidth={1.5} />
          <text x={x(0) + 14} y={photoY(0) + 4} fill={INK} fontSize="11" fontWeight="bold">
            flash released here
          </text>
          {/* the arrow marked "time" */}
          <line x1={FLASH_AXIS_X} y1={BOTTOM_Y + 24} x2={FLASH_AXIS_X} y2={lastY - 24} stroke={INK} strokeWidth={1.5} />
          <polygon points={`${FLASH_AXIS_X - 5},${lastY - 22} ${FLASH_AXIS_X + 5},${lastY - 22} ${FLASH_AXIS_X},${lastY - 32}`} fill={INK} />
          <text x={FLASH_AXIS_X} y={lastY - 38} fill={INK} fontSize="11" fontWeight="bold" textAnchor="middle">
            time
          </text>
          {/* the arrow marked "position" */}
          <line x1={x(last.leftPosition)} y1={VIEW_HEIGHT - 12} x2={x(last.rightPosition)} y2={VIEW_HEIGHT - 12} stroke={INK} strokeWidth={1.5} />
          <polygon points={`${x(last.rightPosition)},${VIEW_HEIGHT - 17} ${x(last.rightPosition)},${VIEW_HEIGHT - 7} ${x(last.rightPosition) + 10},${VIEW_HEIGHT - 12}`} fill={INK} />
          <text x={x(last.rightPosition) + 16} y={VIEW_HEIGHT - 8} fill={INK} fontSize="11" fontWeight="bold">
            position
          </text>
        </svg>
      </div>
      <CaptionBox>
        <p style={{ marginTop: 0, marginBottom: '0.5rem' }}>
          <strong>How to read this sketch.</strong> A small picture to help you read the real diagram further down this page. It shows only
          the flash of light. It has no block in it, so it does not show which end the light reaches first or any other result of the
          experiment.
        </p>
        <p style={{ margin: '0 0 0.25rem' }}>
          <strong>What is drawn</strong>
        </p>
        <ul style={{ margin: '0 0 0.75rem', paddingLeft: '1.25rem' }}>
          <li>
            <strong>The amber dot at the bottom</strong> marks the place and moment where the flash is released. This is time 0.
          </li>
          <li>
            <strong>The dots higher up</strong> show where the flash is at 0.2 s, 0.4 s and 0.6 s after it was released. Each time has{' '}
            <strong>two dots</strong>, because the flash spreads in both directions at once. One dot has moved to the left and the other to
            the right.
          </li>
          <li>
            <strong>The two dashed lines</strong> join the dots. They start at the amber dot and lean away from each other, one to the left
            and one to the right, like the two sides of a letter V. Each dashed line is the path of one part of the flash through time, so
            each one is a <strong>worldline</strong>.
          </li>
          <li>
            <strong>The blue dashed line</strong> is the part of the flash going left, which in the real diagram is the side of the
            block&rsquo;s back end. <strong>The purple dashed line</strong> is the part going right, the side of the block&rsquo;s front
            end. These are the same colours as in the real diagram. There is no block in this sketch.
          </li>
          <li>
            <strong>The arrow marked &ldquo;time&rdquo;</strong> points up. Later moments are higher. <strong>The arrow marked
            &ldquo;position&rdquo;</strong> points right. Positions further along are further right.
          </li>
          <li>
            <strong>The labels 0.2 s, 0.4 s and 0.6 s</strong> at the left give the time of each row of dots.
          </li>
        </ul>
        <p style={{ margin: '0 0 0.75rem' }}>
          <strong>How far the light goes.</strong> Light travels at c, the speed of light. That is 1 light-second every second. A
          light-second is the distance light travels in one second, about 300,000 km. In 0.2 s, light goes 0.2 light-second, about 60,000
          km. So at each 0.2 s step each dot is 0.2 light-second further from the amber dot than before.
        </p>
        <p style={{ margin: '0 0 0.75rem' }}>
          <strong>A worked moment.</strong> Take the dots at 0.4 s. Light has had 0.4 s, so each dot is 0.4 &times; 1 = 0.4 light-second
          from the amber dot: one dot 0.4 light-second to the left and the other 0.4 light-second to the right. At 0.6 s each is 0.6
          light-second away. Each line leans 0.2 light-second sideways for every 0.2 s it rises, so it is a straight line.
        </p>
        <p style={{ margin: '0 0 0.25rem' }}>
          <strong>What to look for</strong>
        </p>
        <LookForList
          items={[
            {
              look: 'the two dashed lines together, starting at the one amber dot.',
              means:
                'there are two separate lines, each going outwards from the same point. Neither one turns round or comes back. Light has gone in both directions at once.',
              matters:
                'it shows what “two worldlines from one starting point” means in the real diagram. It is a V opening upward and not a line that dips down and comes back up.',
            },
            {
              look:
                'how steeply each dashed line leans compared with the leaning lines of the block sketch above (0.2 light-second per 0.2 s, against 0.1).',
              means:
                'light leans twice as much as a block moving at 0.5c, because light goes 1 light-second every second and the block goes only 0.5.',
              matters:
                'light is always the fastest thing on the diagram, so it is always the flattest line, which is the most it can lean.',
            },
            {
              look: 'whether the sketch would change for a block moving faster or slower.',
              means:
                'it would not. Nothing in the sketch depends on the block. In the real diagram the block’s two solid lines get steeper or shallower with its speed, but the light’s two dashed lines stay exactly as drawn here.',
              matters:
                'this is the key fact about light in this experiment. It always travels at c, so its lines have the same lean whatever the block does.',
            },
          ]}
        />
        <p style={{ margin: '0.75rem 0 0', fontSize: '0.8125rem' }}>
          <strong>Where this picture comes from.</strong> <em>Imagined for illustration:</em> the flash and its times. <em>Measured:</em>{' '}
          nothing. <em>Calculated here:</em> only the positions of the dots, from the speed of light and the time since the flash. The real
          diagram below is calculated from the experiment&rsquo;s own physics, for the speed you choose.
        </p>
      </CaptionBox>
    </div>
  )
}
