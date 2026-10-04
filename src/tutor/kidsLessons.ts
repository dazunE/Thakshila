import { INK, type CheckIn, type DrawCommand, type Lesson, type Pt } from '../whiteboard/types';

/*
 * Hand-written demo lessons. Each one is exactly the JSON shape a real model
 * would return from the `teach_on_whiteboard` tool, so the player and board
 * don't know (or care) whether a human or an LLM authored it.
 */

// ---------- small authoring helpers ----------

function sunWithRays(center: Pt, r: number, idPrefix = 'sun'): DrawCommand[] {
  const rays: DrawCommand[] = Array.from({ length: 8 }, (_, i) => {
    const a = (i * Math.PI) / 4;
    return {
      op: 'line',
      from: [center[0] + Math.cos(a) * (r + 10), center[1] + Math.sin(a) * (r + 10)],
      to: [center[0] + Math.cos(a) * (r + 30), center[1] + Math.sin(a) * (r + 30)],
      color: INK.orange,
      duration: 90,
    };
  });
  return [{ op: 'circle', id: idPrefix, center, r, fill: INK.sun, color: INK.orange }, ...rays];
}

function wavyLine(x0: number, x1: number, y: number, amp = 14, step = 50): string {
  let d = `M${x0} ${y} Q${x0 + step / 2} ${y - amp} ${x0 + step} ${y}`;
  for (let x = x0 + 2 * step; x <= x1; x += step) d += ` T${x} ${y}`;
  return d;
}

// ---------- Maths: fractions ----------

const fractions: Lesson = {
  id: 'fractions',
  title: 'What is a fraction?',
  subject: 'Maths',
  steps: [
    {
      say: "Let's imagine a yummy pizza! Here is one whole pizza.",
      draw: [
        { op: 'clear' },
        { op: 'circle', id: 'pizza', center: [300, 320], r: 180, fill: INK.yellow, color: INK.brown, width: 6, duration: 900 },
        { op: 'circle', center: [240, 250], r: 18, fill: INK.salmon, color: INK.red, duration: 150 },
        { op: 'circle', center: [370, 260], r: 18, fill: INK.salmon, color: INK.red, duration: 150 },
        { op: 'circle', center: [230, 390], r: 18, fill: INK.salmon, color: INK.red, duration: 150 },
        { op: 'circle', center: [360, 400], r: 18, fill: INK.salmon, color: INK.red, duration: 150 },
        { op: 'text', at: [300, 560], text: '1 whole pizza', size: 34 },
      ],
    },
    {
      say: 'Now we want to share it fairly with 4 friends. So I cut it into 4 pieces that are exactly the same size.',
      draw: [
        { op: 'line', from: [300, 130], to: [300, 510], width: 5 },
        { op: 'line', from: [110, 320], to: [490, 320], width: 5 },
        { op: 'text', at: [300, 600], text: 'cut into 4 equal pieces', size: 28, color: INK.gray },
      ],
    },
    {
      say: 'Each friend gets one piece. Let me colour in one piece.',
      draw: [
        { op: 'wedge', id: 'slice', center: [300, 320], r: 180, fromDeg: -90, toDeg: 0, fill: INK.salmon, color: INK.red, opacity: 0.85 },
        { op: 'highlight', target: 'slice' },
      ],
    },
    {
      say: 'We can write that as a fraction. One on top, a line, and four underneath. We say: one quarter.',
      draw: [
        { op: 'text', id: 'top', at: [680, 230], text: '1', size: 90, color: INK.red },
        { op: 'line', from: [630, 290], to: [730, 290], width: 6 },
        { op: 'text', id: 'bottom', at: [680, 360], text: '4', size: 90, color: INK.blue },
        { op: 'text', at: [680, 450], text: '"one quarter"', size: 34, color: INK.gray },
      ],
    },
    {
      say: 'The bottom number tells us how many equal pieces the whole pizza was cut into. The top number tells us how many pieces we have.',
      draw: [
        { op: 'arrow', from: [850, 360], to: [740, 360], color: INK.blue },
        { op: 'text', at: [860, 330], text: 'pieces', size: 28, color: INK.blue, anchor: 'start' },
        { op: 'text', at: [860, 365], text: 'in all', size: 28, color: INK.blue, anchor: 'start' },
        { op: 'highlight', target: 'bottom' },
        { op: 'arrow', from: [850, 230], to: [740, 230], color: INK.red },
        { op: 'text', at: [860, 200], text: 'pieces', size: 28, color: INK.red, anchor: 'start' },
        { op: 'text', at: [860, 235], text: 'we have', size: 28, color: INK.red, anchor: 'start' },
        { op: 'highlight', target: 'top' },
      ],
    },
    {
      say: 'If we coloured one more piece, we would have two quarters. Look, that is exactly half the pizza!',
      draw: [
        { op: 'wedge', id: 'half', center: [300, 320], r: 180, fromDeg: 0, toDeg: 90, fill: INK.sky, color: INK.blue, opacity: 0.85 },
        { op: 'text', id: 'eq', at: [700, 560], text: '2/4 = 1/2', size: 56, color: INK.green },
        { op: 'highlight', target: 'eq' },
      ],
    },
  ],
  checkIn: {
    question: 'Your turn! How many quarters make one whole pizza?',
    choices: ['2', '3', '4'],
    answer: 2,
    praise: 'Yes! Four quarters make one whole pizza. You are a fraction star!',
    hint: 'Not quite. Count the slices on the pizza. How many pieces did we cut it into?',
  },
};

// ---------- Science: the water cycle ----------

const waterCycle: Lesson = {
  id: 'water-cycle',
  title: 'The water cycle',
  subject: 'Science',
  steps: [
    {
      say: 'The water cycle is the journey water takes around our planet, again and again. It starts in the sea.',
      draw: [
        { op: 'clear' },
        { op: 'path', d: `${wavyLine(0, 550, 520)} L550 640 L0 640 Z`, fill: INK.sky, color: INK.blue, duration: 1000 },
        { op: 'path', d: 'M540 640 L540 520 L700 340 L770 420 L860 300 L1000 500 L1000 640 Z', fill: INK.leaf, color: INK.green, duration: 1000 },
        { op: 'text', at: [200, 590], text: 'sea', size: 34 },
      ],
    },
    {
      say: 'The sun warms up the sea. Some of the water turns into an invisible gas called water vapour and floats up into the sky. This is called evaporation.',
      draw: [
        ...sunWithRays([110, 100], 48),
        { op: 'arrow', id: 'evap1', from: [210, 500], to: [230, 330], curve: 0.15, color: INK.orange },
        { op: 'arrow', id: 'evap2', from: [330, 500], to: [350, 330], curve: 0.15, color: INK.orange },
        { op: 'text', id: 'evapLabel', at: [280, 300], text: 'evaporation', size: 32, color: INK.orange },
      ],
    },
    {
      say: 'High up in the sky it is cold. The vapour cools down and turns into tiny drops of water. Lots of tiny drops together make a cloud! That is condensation.',
      draw: [
        { op: 'arrow', from: [390, 280], to: [610, 160], curve: -0.15, color: INK.gray },
        {
          op: 'path',
          id: 'cloud',
          d: 'M620 180 A40 40 0 0 1 645 112 A55 55 0 0 1 745 95 A45 45 0 0 1 820 125 A35 35 0 0 1 825 180 Z',
          fill: INK.cloud,
          color: INK.gray,
          duration: 1000,
        },
        { op: 'text', id: 'condLabel', at: [720, 55], text: 'condensation', size: 32, color: INK.gray },
      ],
    },
    {
      say: 'When the cloud gets too heavy with water, the water falls back down as rain. Or as snow, if it is very cold! This is called precipitation.',
      draw: [
        ...[650, 690, 730, 770, 810].flatMap((x, i): DrawCommand[] => [
          { op: 'line', from: [x, 200], to: [x - 8, 235], color: INK.blue, width: 4, duration: 120 },
          { op: 'line', from: [x - 20 + (i % 2) * 10, 255], to: [x - 28 + (i % 2) * 10, 290], color: INK.blue, width: 4, duration: 120 },
        ]),
        { op: 'text', id: 'precLabel', at: [905, 245], text: 'precipitation', size: 28, color: INK.blue },
      ],
    },
    {
      say: 'The rain runs down the mountains into rivers, and the rivers carry the water back to the sea. That is collection. And then the whole journey starts all over again!',
      draw: [
        { op: 'path', id: 'river', d: 'M780 410 Q720 470 650 490 T530 530', color: INK.blue, width: 8, duration: 900 },
        { op: 'arrow', from: [620, 560], to: [470, 560], color: INK.blue },
        { op: 'text', id: 'collLabel', at: [760, 600], text: 'collection', size: 32 },
        { op: 'highlight', target: 'evapLabel' },
        { op: 'pause', ms: 400 },
        { op: 'highlight', target: 'condLabel' },
        { op: 'pause', ms: 400 },
        { op: 'highlight', target: 'precLabel' },
        { op: 'pause', ms: 400 },
        { op: 'highlight', target: 'collLabel' },
      ],
    },
  ],
  checkIn: {
    question: 'Quick quiz! A puddle dries up on a sunny day. Which part of the water cycle is that?',
    choices: ['Evaporation', 'Condensation', 'Precipitation'],
    answer: 0,
    praise: "That's right! The sun warms the puddle and the water floats up into the sky. Evaporation!",
    hint: 'Good try! Think about the sun warming the water. Does the water go up, or come down?',
  },
};

// ---------- Science: photosynthesis ----------

const photosynthesis: Lesson = {
  id: 'photosynthesis',
  title: 'How do plants make food?',
  subject: 'Science',
  steps: [
    {
      say: "Plants can't go to the shop to buy food. They make their own! Let me draw a plant.",
      draw: [
        { op: 'clear' },
        { op: 'line', from: [80, 480], to: [920, 480], color: INK.brown, width: 5 },
        { op: 'path', d: 'M500 480 C495 400 505 330 500 220', color: INK.green, width: 7 },
        { op: 'path', id: 'leafL', d: 'M500 380 Q430 310 370 350 Q440 410 500 380 Z', fill: INK.leaf, color: INK.green },
        { op: 'path', id: 'leafR', d: 'M500 300 Q570 230 630 270 Q570 330 500 300 Z', fill: INK.leaf, color: INK.green },
        { op: 'circle', center: [500, 205], r: 24, fill: INK.pink, color: INK.purple },
      ],
    },
    {
      say: 'First, the roots drink up water from the soil, and it travels up the stem.',
      draw: [
        { op: 'path', d: 'M500 480 Q480 530 440 575', color: INK.brown, width: 4, duration: 300 },
        { op: 'path', d: 'M500 480 L500 600', color: INK.brown, width: 4, duration: 300 },
        { op: 'path', d: 'M500 480 Q525 535 565 575', color: INK.brown, width: 4, duration: 300 },
        { op: 'emoji', at: [400, 600], char: '💧', size: 34 },
        { op: 'emoji', at: [610, 600], char: '💧', size: 34 },
        { op: 'arrow', id: 'water', from: [545, 580], to: [545, 400], color: INK.blue },
        { op: 'text', at: [570, 540], text: 'water', size: 30, color: INK.blue, anchor: 'start' },
      ],
    },
    {
      say: 'Next, the leaves soak up sunlight, like tiny solar panels.',
      draw: [
        ...sunWithRays([140, 120], 52),
        { op: 'arrow', from: [210, 165], to: [390, 330], color: INK.orange, curve: 0.05 },
        { op: 'arrow', from: [225, 130], to: [530, 270], color: INK.orange, curve: 0.05 },
        { op: 'text', at: [150, 240], text: 'sunlight', size: 30, color: INK.orange },
      ],
    },
    {
      say: 'The leaves also breathe in a gas from the air called carbon dioxide.',
      draw: [
        { op: 'arrow', from: [830, 200], to: [640, 270], color: INK.gray, curve: -0.1 },
        { op: 'text', at: [830, 170], text: 'carbon dioxide', size: 30, color: INK.gray },
      ],
    },
    {
      say: 'Inside the leaf, the plant mixes water, sunlight and carbon dioxide to make sugar. That sugar is its food! This clever trick is called photosynthesis.',
      draw: [
        { op: 'highlight', target: 'leafL' },
        { op: 'highlight', target: 'leafR' },
        { op: 'text', at: [580, 50], text: 'water + sunlight + CO₂  →  sugar!', size: 32, color: INK.green },
        { op: 'text', id: 'word', at: [790, 420], text: 'Photosynthesis', size: 40, color: INK.purple },
        { op: 'highlight', target: 'word' },
      ],
    },
    {
      say: 'And here is a bonus: the plant breathes out oxygen. That is the air we need to breathe! So plants feed themselves and help us too.',
      draw: [
        { op: 'arrow', from: [370, 360], to: [200, 410], color: INK.blue, curve: 0.1 },
        { op: 'text', at: [170, 440], text: 'oxygen for us!', size: 30, color: INK.blue },
        { op: 'emoji', at: [170, 360], char: '😊', size: 44 },
      ],
    },
  ],
  checkIn: {
    question: 'Which of these does a plant need to make its food?',
    choices: ['Sunlight', 'Chocolate', 'Television'],
    answer: 0,
    praise: 'Yes! Plants need sunlight to make their food. No chocolate for plants!',
    hint: 'Ha ha, plants would love that! But look at the board. What shines on the leaves?',
  },
};

// ---------- Geography / Science: day and night ----------

const dayNight: Lesson = {
  id: 'day-night',
  title: 'Why do we have day and night?',
  subject: 'Geography',
  steps: [
    {
      say: 'Here is our Sun. It is always shining, like a giant lamp in space.',
      draw: [{ op: 'clear' }, ...sunWithRays([150, 320], 80), { op: 'text', at: [150, 470], text: 'Sun', size: 34, color: INK.orange }],
    },
    {
      say: 'And here is our Earth. Earth is like a big ball, and it is always spinning, like a spinning top.',
      draw: [
        { op: 'circle', id: 'earth', center: [650, 320], r: 150, fill: INK.sky, color: INK.blue, duration: 900 },
        { op: 'path', d: 'M580 230 Q620 200 660 240 Q640 290 590 280 Z', fill: INK.leaf, color: INK.green, duration: 400 },
        { op: 'path', d: 'M670 340 Q730 320 740 380 Q700 430 660 400 Z', fill: INK.leaf, color: INK.green, duration: 400 },
        { op: 'arrow', id: 'spin', from: [560, 140], to: [750, 140], curve: 0.25, color: INK.purple },
        { op: 'text', at: [655, 75], text: 'spins', size: 30, color: INK.purple },
      ],
    },
    {
      say: 'The side of Earth that is facing the Sun gets lots of light. For people on that side, it is daytime!',
      draw: [
        { op: 'arrow', from: [260, 270], to: [490, 280], color: INK.orange },
        { op: 'arrow', from: [260, 370], to: [490, 360], color: INK.orange },
        { op: 'text', id: 'day', at: [560, 320], text: 'DAY', size: 34, color: INK.orange },
      ],
    },
    {
      say: 'The side facing away from the Sun is dark. For people there, it is night-time.',
      draw: [
        { op: 'wedge', center: [650, 320], r: 150, fromDeg: -90, toDeg: 90, fill: INK.night, color: INK.night, opacity: 0.8, duration: 800 },
        { op: 'text', id: 'night', at: [730, 320], text: 'NIGHT', size: 34, color: INK.onNight },
        { op: 'emoji', at: [740, 240], char: '✨', size: 30 },
        { op: 'emoji', at: [700, 410], char: '⭐', size: 26 },
      ],
    },
    {
      say: 'Earth takes about 24 hours to spin all the way round once. So every place gets a turn at day, and a turn at night!',
      draw: [
        { op: 'highlight', target: 'spin' },
        { op: 'text', id: 'rule', at: [500, 560], text: '1 full spin = 24 hours = 1 day', size: 38, color: INK.green },
        { op: 'highlight', target: 'rule' },
      ],
    },
  ],
  checkIn: {
    question: "When it's daytime for you, what time is it on the other side of the Earth?",
    choices: ['Daytime', 'Night-time'],
    answer: 1,
    praise: "Exactly! The other side is facing away from the Sun, so it's night-time there.",
    hint: 'Look at the board again. Is the other side of the Earth facing the Sun?',
  },
};

// ---------- Maths: multiplication (generated from the question) ----------

export function multiplicationLesson(a: number, b: number): Lesson {
  const p = a * b;
  const sx = Math.min(70, 560 / Math.max(1, b - 1));
  const sy = Math.min(70, 340 / Math.max(1, a - 1));
  const dotR = Math.max(6, Math.min(20, Math.min(sx, sy) / 3));
  const gridW = (b - 1) * sx;
  const x0 = 430 - gridW / 2;
  const y0 = 150;
  const perDot = Math.max(30, Math.floor(1800 / p));

  const row = (r: number): DrawCommand[] =>
    Array.from({ length: b }, (_, c) => ({
      op: 'circle' as const,
      center: [x0 + c * sx, y0 + r * sy] as Pt,
      r: dotR,
      fill: INK.salmon,
      color: INK.red,
      width: 3,
      duration: perDot,
    }));
  const rowLabel = (r: number): DrawCommand => ({
    op: 'text',
    at: [x0 + gridW + 60, y0 + r * sy],
    text: String(b),
    size: Math.min(34, sy * 0.8),
    color: INK.blue,
    duration: 150,
  });
  const sum = Array.from({ length: a }, () => b).join(' + ');

  return {
    id: `times-${a}-${b}`,
    title: `${a} × ${b}`,
    subject: 'Maths',
    steps: [
      {
        say: `Multiplication is a speedy way to add equal groups. Let's work out ${a} times ${b} by making rows of dots.`,
        draw: [{ op: 'clear' }, { op: 'text', id: 'q', at: [500, 60], text: `${a} × ${b} = ?`, size: 52 }],
      },
      {
        say: `Here is one row with ${b} dot${b === 1 ? '' : 's'} in it.`,
        draw: [...row(0), rowLabel(0)],
      },
      {
        say: a > 1 ? `Now I'll keep adding rows of ${b} until we have ${a} rows.` : 'We only need one row!',
        draw: Array.from({ length: a - 1 }, (_, i) => [...row(i + 1), rowLabel(i + 1)]).flat(),
      },
      {
        say: a > 1 ? `To count them all, we can add the rows together: ${sum}. That makes ${p}.` : `So we have ${p}.`,
        draw: [{ op: 'text', id: 'sum', at: [500, 560], text: `${sum} = ${p}`, size: a > 6 ? 26 : 34, color: INK.blue }],
      },
      {
        say: `So ${a} times ${b} equals ${p}! ${a} rows of ${b} is the same as ${p}.`,
        draw: [
          { op: 'erase', target: 'q' },
          { op: 'text', id: 'ans', at: [500, 60], text: `${a} × ${b} = ${p}`, size: 52, color: INK.green },
          { op: 'highlight', target: 'ans' },
        ],
      },
      ...(a !== b
        ? [
            {
              say: `Here's a cool trick. If you turn the picture on its side, you get ${b} rows of ${a}. It's still ${p} dots! So ${b} times ${a} is also ${p}.`,
              draw: [{ op: 'text', at: [500, 610], text: `${b} × ${a} = ${p} too!`, size: 32, color: INK.purple } as DrawCommand],
            },
          ]
        : []),
    ],
    checkIn: timesCheckIn(a, b),
  };
}

function timesCheckIn(a: number, b: number): CheckIn {
  const right = a * (b + 1);
  // two believable wrong answers, never equal to the right one
  const wrong = [a * b, right + a].filter((n) => n !== right);
  const choices = [right, ...wrong].sort((x, y) => x - y);
  return {
    question: `Your turn! What is ${a} × ${b + 1}? (Add one more dot to each row.)`,
    choices: choices.map(String),
    answer: choices.indexOf(right),
    praise: `Brilliant! ${a} × ${b + 1} = ${right}. One more dot in each row adds ${a} more.`,
    hint: `Nearly! Start from ${a * b} and add one more dot to each of the ${a} rows.`,
  };
}

// ---------- conversational replies ----------

export const greeting: Lesson = {
  id: 'hello',
  title: 'Hello!',
  subject: 'Chat',
  steps: [
    {
      say: "Hi! I'm Chalky. I'm a piece of chalk, and drawing is my favourite thing! Ask me anything, and I'll draw you the answer.",
      draw: [
        { op: 'clear' },
        { op: 'circle', center: [500, 280], r: 130, fill: INK.yellow, color: INK.orange, width: 6 },
        { op: 'circle', center: [455, 240], r: 14, fill: INK.dark, duration: 150 },
        { op: 'circle', center: [545, 240], r: 14, fill: INK.dark, duration: 150 },
        { op: 'path', d: 'M430 310 Q500 380 570 310', color: INK.dark, width: 6 },
        { op: 'emoji', at: [680, 180], char: '👋', size: 70 },
        { op: 'text', at: [500, 480], text: 'Hello, class!', size: 60, color: INK.yellow },
        { op: 'text', at: [500, 555], text: 'Tap the microphone and ask me anything', size: 32, color: INK.gray },
      ],
    },
  ],
};

export function fallback(question: string): Lesson {
  return {
    id: 'unknown',
    title: 'Hmm…',
    subject: 'Chat',
    steps: [
      {
        say: `Ooh, what a great question! I'm still learning that one. Tap a picture to try one of my lessons: fractions, times tables, rain, plants, or day and night.`,
        draw: [
          { op: 'clear' },
          { op: 'text', at: [500, 90], text: `"${question.length > 40 ? question.slice(0, 40) + '…' : question}"`, size: 30, color: INK.gray },
          { op: 'circle', center: [500, 300], r: 110, fill: INK.yellow, color: INK.orange, width: 6 },
          { op: 'circle', center: [460, 270], r: 12, fill: INK.dark, duration: 120 },
          { op: 'circle', center: [540, 270], r: 12, fill: INK.dark, duration: 120 },
          { op: 'path', d: 'M460 345 Q500 330 540 350', color: INK.dark, width: 5 },
          { op: 'text', at: [670, 200], text: '?', size: 110, color: INK.purple },
          { op: 'text', at: [500, 500], text: 'fractions · times tables · water cycle', size: 30, color: INK.blue },
          { op: 'text', at: [500, 550], text: 'plants · day and night', size: 30, color: INK.blue },
        ],
      },
    ],
  };
}

export const lessons = { fractions, waterCycle, photosynthesis, dayNight };
