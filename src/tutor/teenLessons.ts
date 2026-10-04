import { INK, type DrawCommand, type Lesson, type Pt } from '../whiteboard/types';

/*
 * High-school demo lessons. Same say+draw format as the kids' lessons, but
 * denser: worked algebra, labelled diagrams, real units. The board theme is
 * picked from `subject` (Maths → graph paper, Physics → blueprint, ...).
 */

// ---------- Maths: solving a quadratic (graph paper) ----------

function quadratic(): Lesson {
  // graph window on the right half of the board
  const X = (x: number) => 560 + (x + 0.5) * 66;
  const Y = (y: number) => 590 - (y + 1) * 62;
  const f = (x: number) => x * x - 5 * x + 6;
  const pts: string[] = [];
  for (let x = -0.3; x <= 5.31; x += 0.1) pts.push(`${X(x).toFixed(1)} ${Y(f(x)).toFixed(1)}`);
  const curve = `M${pts.join(' L')}`;
  const ticks: DrawCommand[] = [1, 2, 3, 4, 5].flatMap((n): DrawCommand[] => [
    { op: 'line', from: [X(n), Y(0) - 6], to: [X(n), Y(0) + 6], width: 2, duration: 60 },
    { op: 'text', at: [X(n), Y(0) + 24], text: String(n), size: 20, color: INK.gray, duration: 60 },
  ]);

  return {
    id: 'quadratic',
    title: 'Solving x² − 5x + 6 = 0',
    subject: 'Maths',
    steps: [
      {
        say: 'We want the values of x that make x squared minus 5x plus 6 equal to zero. These are called the roots.',
        draw: [{ op: 'clear' }, { op: 'text', at: [250, 60], text: 'x² − 5x + 6 = 0', size: 42 }],
      },
      {
        say: 'Try factorising. We need two numbers that multiply to give plus 6 and add to give minus 5. Minus 2 and minus 3 work.',
        draw: [
          { op: 'text', at: [250, 130], text: 'p × q = 6,   p + q = −5', size: 28, color: INK.gray },
          { op: 'text', id: 'pq', at: [250, 180], text: 'p = −2,  q = −3', size: 32, color: INK.blue },
          { op: 'highlight', target: 'pq' },
        ],
      },
      {
        say: 'So the quadratic factorises as x minus 2, times x minus 3, equals zero.',
        draw: [{ op: 'text', id: 'fact', at: [250, 255], text: '(x − 2)(x − 3) = 0', size: 40 }],
      },
      {
        say: 'If two things multiply to make zero, at least one of them must be zero. So x equals 2, or x equals 3.',
        draw: [
          { op: 'text', at: [250, 330], text: 'x − 2 = 0   or   x − 3 = 0', size: 28, color: INK.gray },
          { op: 'text', id: 'roots', at: [250, 400], text: 'x = 2   or   x = 3', size: 44, color: INK.green },
          { op: 'rect', at: [95, 368], size: [310, 66], radius: 10, color: INK.green, width: 3 },
        ],
      },
      {
        say: 'Now let’s check with a graph. y equals x squared minus 5x plus 6 is a U-shaped curve called a parabola.',
        draw: [
          { op: 'arrow', from: [X(-0.5), Y(0)], to: [975, Y(0)], width: 2, duration: 400 },
          { op: 'arrow', from: [X(0), 600], to: [X(0), 60], width: 2, duration: 400 },
          { op: 'text', at: [975, Y(0) - 22], text: 'x', size: 24, color: INK.gray },
          { op: 'text', at: [X(0) + 22, 68], text: 'y', size: 24, color: INK.gray },
          ...ticks,
          { op: 'path', id: 'curve', d: curve, color: INK.blue, width: 5, duration: 1600 },
          { op: 'text', at: [X(4.6), Y(5.6)], text: 'y = x² − 5x + 6', size: 24, color: INK.blue },
        ],
      },
      {
        say: 'The roots are exactly where the curve crosses the x-axis: at 2 and at 3. The graph agrees with our algebra.',
        draw: [
          { op: 'circle', id: 'r1', center: [X(2), Y(0)], r: 9, fill: INK.red, color: INK.red, duration: 200 },
          { op: 'circle', id: 'r2', center: [X(3), Y(0)], r: 9, fill: INK.red, color: INK.red, duration: 200 },
          { op: 'arrow', from: [X(1.2), Y(2.4)], to: [X(1.9), Y(0.35)], color: INK.red, width: 3 },
          { op: 'text', at: [X(1.1), Y(2.8)], text: 'roots', size: 26, color: INK.red },
          { op: 'highlight', target: 'r1' },
          { op: 'highlight', target: 'r2' },
          { op: 'highlight', target: 'roots' },
        ],
      },
    ],
    checkIn: {
      question: 'Try one: what are the roots of x² − 7x + 12 = 0?',
      choices: ['x = 3 and x = 4', 'x = −3 and x = −4', 'x = 2 and x = 6'],
      answer: 0,
      praise: 'Correct. 3 times 4 is 12 and 3 plus 4 is 7, so it factorises as x minus 3, times x minus 4.',
      hint: 'Check the signs. You need two numbers that multiply to plus 12 and add to minus 7.',
    },
  };
}

// ---------- Physics: projectile motion (blueprint) ----------

function projectile(): Lesson {
  // trajectory is the quadratic Bézier M100 560 Q480 -160 860 560 (a true parabola)
  const at = (t: number): Pt => [100 + 760 * t, (1 - t) ** 2 * 560 + 2 * t * (1 - t) * -160 + t * t * 560];
  const [p1, p2, p3] = [at(0.25), at(0.5), at(0.75)];

  return {
    id: 'projectile',
    title: 'Projectile motion',
    subject: 'Physics',
    steps: [
      {
        say: 'A projectile is any object that is launched and then moves under gravity alone, like a ball kicked at an angle. Here is its path.',
        draw: [
          { op: 'clear' },
          { op: 'line', from: [40, 560], to: [960, 560], width: 3 },
          ...[80, 160, 240, 320, 400, 480, 560, 640, 720, 800, 880].map((x): DrawCommand => ({
            op: 'line', from: [x, 560], to: [x - 18, 580], width: 2, color: INK.gray, duration: 40,
          })),
          { op: 'circle', center: [100, 548], r: 12, fill: INK.yellow, color: INK.dark, duration: 200 },
          { op: 'path', id: 'path', d: 'M100 560 Q480 -160 860 560', color: INK.blue, width: 4, duration: 1600 },
        ],
      },
      {
        say: 'Split the launch velocity v-nought into two components: v x horizontally and v y vertically, using the launch angle theta.',
        draw: [
          { op: 'arrow', id: 'v0', from: [100, 560], to: [225, 435], color: INK.orange, width: 4 },
          { op: 'text', at: [245, 420], text: 'v₀', size: 30, color: INK.orange },
          { op: 'arrow', from: [100, 560], to: [225, 560], color: INK.green, width: 4 },
          { op: 'text', at: [165, 600], text: 'vₓ = v₀ cos θ', size: 22, color: INK.green },
          { op: 'arrow', from: [100, 560], to: [100, 435], color: INK.red, width: 4 },
          { op: 'text', at: [60, 420], text: 'v_y = v₀ sin θ', size: 22, color: INK.red, anchor: 'start' },
          { op: 'path', d: 'M150 560 A50 50 0 0 0 135.4 524.6', color: INK.dark, width: 2, duration: 300 },
          { op: 'text', at: [165, 535], text: 'θ', size: 24 },
        ],
      },
      {
        say: 'Horizontally there is no force, if we ignore air resistance. So v x stays the same the whole way and the ball covers equal distances in equal times.',
        draw: [p1, p2, p3].flatMap((p): DrawCommand[] => [
          { op: 'circle', center: p, r: 6, fill: INK.dark, color: INK.dark, duration: 100 },
          { op: 'arrow', from: p, to: [p[0] + 85, p[1]], color: INK.green, width: 3, duration: 300 },
        ]),
      },
      {
        say: 'Vertically, gravity pulls down at 9.8 metres per second squared. So v y shrinks on the way up, is zero at the very top, and grows on the way down.',
        draw: [
          { op: 'arrow', from: p1, to: [p1[0], p1[1] - 70], color: INK.red, width: 3, duration: 300 },
          { op: 'text', id: 'top', at: [p2[0], p2[1] - 30], text: 'v_y = 0', size: 24, color: INK.red },
          { op: 'arrow', from: p3, to: [p3[0], p3[1] + 70], color: INK.red, width: 3, duration: 300 },
          { op: 'arrow', from: [920, 150], to: [920, 270], color: INK.purple, width: 4 },
          { op: 'text', at: [920, 120], text: 'g = 9.8 m/s²', size: 24, color: INK.purple },
          { op: 'highlight', target: 'top' },
        ],
      },
      {
        say: 'Constant speed sideways plus steady acceleration downwards gives a parabola. These are the two equations you use to solve any projectile problem.',
        draw: [
          { op: 'text', at: [40, 60], text: 'x = vₓ t', size: 30, anchor: 'start' },
          { op: 'text', at: [40, 105], text: 'y = v_y t − ½ g t²', size: 30, anchor: 'start' },
          { op: 'rect', at: [25, 30], size: [285, 105], radius: 8, color: INK.blue, width: 2 },
          { op: 'arrow', from: [480, 610], to: [860, 610], color: INK.gray, width: 2, duration: 300 },
          { op: 'arrow', from: [480, 610], to: [100, 610], color: INK.gray, width: 2, duration: 300 },
          { op: 'text', at: [480, 632], text: 'range R', size: 20, color: INK.gray },
          { op: 'highlight', target: 'path' },
        ],
      },
    ],
    checkIn: {
      question: 'At the very top of its path, what is the ball’s vertical velocity?',
      choices: ['Zero', 'At its maximum', 'Equal to vₓ'],
      answer: 0,
      praise: 'Exactly. At the top v y is zero, but v x is still there, so the ball keeps moving sideways.',
      hint: 'Think about the moment it stops rising and starts falling. What is v y at that instant?',
    },
  };
}

// ---------- Chemistry: balancing an equation (lab notebook) ----------

function atom(center: Pt, el: 'H' | 'O', id?: string): DrawCommand[] {
  const r = el === 'H' ? 20 : 30;
  return [
    { op: 'circle', id, center, r, fill: el === 'H' ? INK.sky : INK.salmon, color: el === 'H' ? INK.blue : INK.red, width: 3, duration: 160 },
    { op: 'text', at: center, text: el, size: el === 'H' ? 20 : 26, duration: 80 },
  ];
}
const h2 = (x: number, y: number) => [...atom([x, y], 'H'), ...atom([x + 38, y], 'H')];
const o2 = (x: number, y: number) => [...atom([x, y], 'O'), ...atom([x + 54, y], 'O')];
const water = (x: number, y: number) => [...atom([x - 34, y + 30], 'H'), ...atom([x + 34, y + 30], 'H'), ...atom([x, y], 'O')];

function balancing(): Lesson {
  return {
    id: 'balancing',
    title: 'Balancing equations',
    subject: 'Chemistry',
    steps: [
      {
        say: 'Hydrogen reacts with oxygen to make water. First we write the unbalanced equation.',
        draw: [{ op: 'clear' }, { op: 'text', id: 'eq', at: [500, 60], text: 'H₂ + O₂ → H₂O', size: 46 }],
      },
      {
        say: 'Let’s draw the particles. Hydrogen and oxygen gas are both made of pairs of atoms. A water molecule is one oxygen atom bonded to two hydrogens.',
        draw: [
          ...h2(130, 200),
          { op: 'text', at: [245, 200], text: '+', size: 40 },
          ...o2(320, 200),
          { op: 'arrow', from: [440, 200], to: [540, 200], width: 3 },
          ...water(650, 185),
        ],
      },
      {
        say: 'Now count the atoms on each side. There are 2 oxygen atoms on the left but only 1 on the right. Atoms can’t be created or destroyed, so this isn’t balanced.',
        draw: [{ op: 'text', id: 'o1', at: [500, 360], text: 'O:   2  →  1   ✗', size: 32, color: INK.red }, { op: 'highlight', target: 'o1' }],
      },
      {
        say: 'Put a 2 in front of the water. Now there are 2 oxygens on each side. But that gives 4 hydrogens on the right, and still only 2 on the left.',
        draw: [
          { op: 'erase', target: 'eq' },
          { op: 'text', id: 'eq', at: [500, 60], text: 'H₂ + O₂ → 2H₂O', size: 46 },
          ...water(820, 185),
          { op: 'text', id: 'h1', at: [500, 410], text: 'H:   2  →  4   ✗', size: 32, color: INK.red },
          { op: 'highlight', target: 'h1' },
        ],
      },
      {
        say: 'So put a 2 in front of the hydrogen as well. Now it’s 4 hydrogens and 2 oxygens on both sides. Balanced!',
        draw: [
          { op: 'erase', target: 'eq' },
          { op: 'text', id: 'eq', at: [500, 60], text: '2H₂ + O₂ → 2H₂O', size: 46, color: INK.green },
          ...h2(130, 280),
          { op: 'text', id: 'ok', at: [500, 480], text: 'H: 4 → 4 ✓     O: 2 → 2 ✓', size: 32, color: INK.green },
          { op: 'highlight', target: 'eq' },
          { op: 'highlight', target: 'ok' },
        ],
      },
      {
        say: 'One rule to remember: only change the big numbers in front. Never change the small subscripts, because that would turn it into a different substance.',
        draw: [{ op: 'text', at: [500, 570], text: 'change coefficients, never subscripts', size: 30, color: INK.purple }],
      },
    ],
    checkIn: {
      question: 'Balance N₂ + H₂ → NH₃. What number goes in front of H₂?',
      choices: ['1', '2', '3'],
      answer: 2,
      praise: 'Yes. N2 plus 3 H2 gives 2 N H 3: two nitrogens and six hydrogens on each side.',
      hint: 'Balance nitrogen first: you need 2 NH₃. Now count the hydrogens on the right.',
    },
  };
}

// ---------- Biology: the animal cell (sketchbook) ----------

function cell(): Lesson {
  const label = (from: Pt, to: Pt, text: string, at: Pt, anchor: 'start' | 'middle' | 'end' = 'middle'): DrawCommand[] => [
    { op: 'line', from, to, width: 2, color: INK.gray, duration: 300 },
    { op: 'text', at, text, size: 30, anchor },
  ];
  const ribosomes: Pt[] = [[585, 270], [592, 305], [585, 345], [592, 380], [300, 300], [360, 410], [640, 440], [420, 180], [700, 380]];

  return {
    id: 'cell',
    title: 'Inside an animal cell',
    subject: 'Biology',
    steps: [
      {
        say: 'Every living thing is built from cells. This is an animal cell. Its outer boundary is the cell membrane, which controls what goes in and out.',
        draw: [
          { op: 'clear' },
          {
            op: 'path',
            id: 'membrane',
            d: 'M190 330 C185 165 365 100 520 104 C700 108 835 185 828 330 C820 480 680 556 500 556 C320 556 195 495 190 330 Z',
            fill: INK.pink,
            color: INK.red,
            width: 4,
            duration: 1400,
          },
          ...label([215, 450], [120, 560], 'cell membrane', [120, 590]),
        ],
      },
      {
        say: 'The jelly-like fluid inside is the cytoplasm. This is where most of the cell’s chemical reactions happen.',
        draw: [{ op: 'text', id: 'cyto', at: [330, 200], text: 'cytoplasm', size: 28, color: INK.gray }],
      },
      {
        say: 'The nucleus is the control centre. It holds the DNA: the instructions for building and running the cell.',
        draw: [
          { op: 'circle', id: 'nucleus', center: [460, 320], r: 82, fill: INK.purple, color: INK.purple, width: 4, opacity: 0.9 },
          { op: 'circle', center: [478, 332], r: 24, fill: INK.purple, color: INK.purple, width: 3 },
          { op: 'path', d: 'M420 290 q10 -14 20 0 t20 0 t20 0', color: INK.dark, width: 2, duration: 300 },
          { op: 'path', d: 'M410 360 q10 -14 20 0 t20 0', color: INK.dark, width: 2, duration: 300 },
          ...label([460, 238], [460, 60], 'nucleus (DNA)', [460, 40]),
        ],
      },
      {
        say: 'Mitochondria are where aerobic respiration happens. They release energy from glucose, so they’re often called the cell’s power stations.',
        draw: [
          { op: 'path', id: 'mito1', d: 'M640 220 Q690 192 740 220 Q762 248 740 272 Q690 298 640 272 Q618 246 640 220 Z', fill: INK.orange, color: INK.orange, width: 3 },
          { op: 'path', d: 'M652 246 L664 230 L676 262 L690 230 L704 262 L718 230 L730 250', color: INK.orange, width: 2, duration: 300 },
          { op: 'path', id: 'mito2', d: 'M300 430 Q345 405 390 430 Q408 452 390 474 Q345 498 300 474 Q282 452 300 430 Z', fill: INK.orange, color: INK.orange, width: 3 },
          { op: 'path', d: 'M310 452 L322 438 L334 466 L346 438 L358 466 L370 438 L382 455', color: INK.orange, width: 2, duration: 300 },
          ...label([742, 222], [850, 140], 'mitochondria', [870, 118]),
        ],
      },
      {
        say: 'Ribosomes are tiny structures where proteins are made. Many of them sit on a folded membrane called the rough endoplasmic reticulum.',
        draw: [
          { op: 'path', d: 'M570 250 Q600 270 570 290 Q540 310 570 330 Q600 350 570 370 Q540 390 570 410', color: INK.blue, width: 4, duration: 600 },
          ...ribosomes.map((c): DrawCommand => ({ op: 'circle', center: c, r: 5, fill: INK.dark, color: INK.dark, width: 1, duration: 60 })),
          ...label([600, 385], [820, 450], 'ribosomes, rough ER', [840, 478]),
        ],
      },
      {
        say: 'Plant cells have all of these too, plus three extras: a cell wall, chloroplasts for photosynthesis, and a large permanent vacuole.',
        draw: [
          { op: 'text', id: 'plant', at: [600, 610], text: 'plant cells add: cell wall · chloroplasts · vacuole', size: 26, color: INK.green },
          { op: 'highlight', target: 'plant' },
        ],
      },
    ],
    checkIn: {
      question: 'Which organelle releases energy through aerobic respiration?',
      choices: ['Nucleus', 'Mitochondria', 'Ribosome'],
      answer: 1,
      praise: 'Right. Mitochondria release energy from glucose during aerobic respiration.',
      hint: 'Not that one. Look for the organelle we called the power station.',
    },
  };
}

// ---------- conversational replies ----------

export const teenGreeting: Lesson = {
  id: 'hello-teen',
  title: 'Welcome',
  subject: 'Chat',
  steps: [
    {
      say: "Hi, I'm Atlas. Ask me about anything you're studying and I'll work through it on the board, step by step.",
      draw: [
        { op: 'clear' },
        { op: 'text', at: [500, 230], text: 'Ask me anything', size: 64 },
        { op: 'line', from: [300, 280], to: [700, 280], color: INK.blue, width: 4 },
        { op: 'text', at: [500, 360], text: 'maths · physics · chemistry · biology', size: 30, color: INK.gray },
        { op: 'text', at: [500, 420], text: 'the board changes to suit the subject', size: 26, color: INK.gray },
      ],
    },
  ],
};

export function teenFallback(question: string): Lesson {
  const q = question.length > 46 ? question.slice(0, 46) + '…' : question;
  return {
    id: 'unknown-teen',
    title: 'Not in this demo yet',
    subject: 'Chat',
    steps: [
      {
        say: "Good question. This demo only has a few worked lessons so far. Try a quadratic equation, projectile motion, balancing chemical equations, or the parts of a cell.",
        draw: [
          { op: 'clear' },
          { op: 'text', at: [500, 160], text: `“${q}”`, size: 32, color: INK.gray },
          { op: 'text', at: [500, 300], text: 'Try one of these:', size: 40 },
          { op: 'text', at: [500, 380], text: 'x² − 5x + 6 = 0  ·  projectile motion', size: 30, color: INK.blue },
          { op: 'text', at: [500, 430], text: 'balancing equations  ·  animal cells', size: 30, color: INK.blue },
        ],
      },
    ],
  };
}

export const teenLessons = { quadratic: quadratic(), projectile: projectile(), balancing: balancing(), cell: cell() };
