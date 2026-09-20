"use client";
import { useRef, useEffect, useState } from 'react';
import Link from 'next/link';
import { LsPublicNav, LsFooter } from '../components/ls/Components';
import * as I from '../components/ls/Icons';

const STEPS = [
  {
    n: 1, color: 'green',
    icon: <I.Camera size={22} />,
    title: 'Point Your Camera',
    body: 'Position your hand in front of the webcam. LinguaSign captures the live video feed at up to 30 FPS.',
  },
  {
    n: 2, color: 'violet',
    icon: <I.Hand size={22} />,
    title: 'Landmark Extraction',
    body: 'MediaPipe Hands maps 21 joints — fingertips, knuckles, wrist — producing 42 x,y coordinates per frame.',
  },
  {
    n: 3, color: 'sky',
    icon: <I.Chart size={22} />,
    title: 'Feature Scaling',
    body: 'Coordinates are σ-normalised via StandardScaler so the model is position- and distance-independent.',
  },
  {
    n: 4, color: 'amber',
    icon: <I.Bolt size={22} />,
    title: 'Neural Network',
    body: 'A 3-layer MLP (256 → 128 → 37) classifies the 42 features into one of 37 Urdu letters at 98.6 % accuracy.',
  },
  {
    n: 5, color: 'coral',
    icon: <I.Sparkle size={22} />,
    title: 'Build Words',
    body: 'Accept detected letters one by one to form a word, then add words to compose a full Urdu sentence.',
  },
  {
    n: 6, color: 'green',
    icon: <I.Volume size={22} />,
    title: 'Speak It Aloud',
    body: 'Pre-recorded Urdu audio reads the recognised word or full sentence aloud — instantly.',
  },
];

const STATS = [
  ['98.6 %', 'Test Accuracy'],
  ['37',     'Urdu Letters'],
  ['42',     'Input Features'],
  ['< 100 ms','Inference Time'],
];

// ── Neural Network Canvas Visualizer ─────────────────────────────────────────
function NeuralNetViz() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctxOrNull = canvas.getContext('2d');
    if (!ctxOrNull) return;
    const ctx: CanvasRenderingContext2D = ctxOrNull;

    const W = canvas.width;
    const H = canvas.height;

    const INPUT_ZONE = 195;
    const OUTPUT_ZONE = 210;
    const PAD = 65;
    const LABEL_H = 36;
    const DROPOUT_P = 0.3;

    const NN_LAYERS = [
      { n: 14, color: '#34d399' }, // logo green  — INPUT
      { n: 12, color: '#a78bfa' }, // violet      — HIDDEN 1
      { n: 10, color: '#fbbf24' }, // amber       — HIDDEN 2
      { n: 8,  color: '#38bdf8' }, // sky         — OUTPUT
    ];

    const LAYER_META = [
      ['INPUT',    '42 σ-normalised'],
      ['HIDDEN 1', 'Dense + ReLU'],
      ['HIDDEN 2', 'Dense + ReLU'],
      ['OUTPUT',   'Softmax (37)'],
    ];

    const NET_W = W - PAD * 2 - INPUT_ZONE - OUTPUT_ZONE;
    const NET_H = H - PAD * 2 - LABEL_H;
    const lx = (i: number) => INPUT_ZONE + PAD + (i / (NN_LAYERS.length - 1)) * NET_W;

    type Node     = { x: number; y: number };
    type Edge     = { a: Node; b: Node; li: number; i: number; j: number };
    type Particle = { x: number; y: number; tx: number; ty: number; speed: number; color: string };

    // Input landmark box geometry (stable across frames)
    const bx = 18, by = H / 2 - 96, bw = INPUT_ZONE - 36, bh = 192;
    const DOT_X = Array.from({ length: 21 }, (_, i) => bx + 16 + ((i * 47 + 11) % (bw - 32)));
    const DOT_Y = Array.from({ length: 21 }, (_, i) => by + 16 + ((i * 31 + 7)  % (bh - 32)));

    let currentImg: HTMLImageElement | null = null;
    let currentLabel = '—';
    let currentEnglish = '';

    const ALPHA_SIGNS = [
      { label: 'ء', english: 'Hamza'       },
      { label: 'ا', english: 'Alif'        },
      { label: 'ب', english: 'Ba'          },
      { label: 'ت', english: 'Ta'          },
      { label: 'ث', english: 'Tha'         },
      { label: 'ج', english: 'Jeem'        },
      { label: 'ح', english: 'Ha'          },
      { label: 'خ', english: 'Kha'         },
      { label: 'د', english: 'Dal'         },
      { label: 'ذ', english: 'Zal'         },
      { label: 'ر', english: 'Ra'          },
      { label: 'ز', english: 'Zay'         },
      { label: 'س', english: 'Seen'        },
      { label: 'ش', english: 'Sheen'       },
      { label: 'ص', english: 'Sad'         },
      { label: 'ض', english: 'Dad'         },
      { label: 'ط', english: 'Tah'         },
      { label: 'ظ', english: 'Zah'         },
      { label: 'ع', english: 'Ayn'         },
      { label: 'غ', english: 'Ghayn'       },
      { label: 'ف', english: 'Fa'          },
      { label: 'ق', english: 'Qaf'         },
      { label: 'ل', english: 'Lam'         },
      { label: 'م', english: 'Meem'        },
      { label: 'ن', english: 'Noon'        },
      { label: 'و', english: 'Waw'         },
      { label: 'ٹ', english: 'Tay'         },
      { label: 'پ', english: 'Pay'         },
      { label: 'چ', english: 'Chay'        },
      { label: 'ڈ', english: 'Ddal'        },
      { label: 'ژ', english: 'Zhay'        },
      { label: 'ک', english: 'Kaf'         },
      { label: 'گ', english: 'Gay'         },
      { label: 'ں', english: 'Noon Ghunna' },
      { label: 'ھ', english: 'He'          },
      { label: 'ی', english: 'Ya'          },
      { label: 'ے', english: 'Bari Ye'     },
    ];

    const WORD_SIGNS = [
      { urdu: 'السلام علیکم', english: 'Hello / Peace' },
      { urdu: 'اللہ حافظ',   english: 'Goodbye'       },
      { urdu: 'باپ',          english: 'Father'        },
      { urdu: 'ماں',          english: 'Mother'        },
      { urdu: 'میں',          english: 'I / Me'        },
    ];

    function loadRandomSign() {
      const isWord = Math.random() < 0.3;
      const img = new Image();
      if (isWord) {
        const idx = Math.floor(Math.random() * WORD_SIGNS.length);
        img.src = `/images/words/${idx + 1}.png`;
        currentLabel   = WORD_SIGNS[idx].urdu;
        currentEnglish = WORD_SIGNS[idx].english;
      } else {
        const idx = Math.floor(Math.random() * ALPHA_SIGNS.length);
        img.src = `/images/alphabet/${idx + 1}.png`;
        currentLabel   = ALPHA_SIGNS[idx].label;
        currentEnglish = ALPHA_SIGNS[idx].english;
      }
      img.onload = () => { currentImg = img; };
    }

    let nodes: Node[][] = [];
    let edges: Edge[]   = [];
    let particles: Particle[] = [];
    let active:      number[][] = [];
    let dropoutMask: number[][] = [];
    let layerIndex = 0;
    let predicted  = '—';
    let inputFlash = 0;
    let outputReady = false;

    function build() {
      nodes = NN_LAYERS.map((l, li) => {
        const x = lx(li);
        return Array.from({ length: l.n }, (_, i) => ({
          x,
          y: PAD + ((i + 0.5) / l.n) * NET_H,
        }));
      });
      active      = nodes.map(l => l.map(() => 0));
      dropoutMask = nodes.map(l => l.map(() => 1));
    }

    function buildEdges() {
      edges = [];
      for (let li = 0; li < NN_LAYERS.length - 1; li++)
        for (let i = 0; i < nodes[li].length; i++)
          for (let j = 0; j < nodes[li + 1].length; j++)
            if ((i + j) % 4 === 0)
              edges.push({ a: nodes[li][i], b: nodes[li + 1][j], li, i, j });
    }

    function step() {
      inputFlash = 1;

      // New cycle: reset everything
      if (layerIndex >= NN_LAYERS.length) {
        layerIndex  = 0;
        particles   = [];
        active      = nodes.map(l => l.map(() => 0));
        outputReady = false;
        predicted   = '—';
        loadRandomSign();
      }

      dropoutMask = nodes.map((layer, li) =>
        layer.map(() => (li === 1 || li === 2) ? (Math.random() > DROPOUT_P ? 1 : 0) : 1)
      );

      if (layerIndex < NN_LAYERS.length - 1) {
        // Steps 0-2: fire edges between layers (green → violet → amber)
        const from = layerIndex;
        edges.forEach(e => {
          if (e.li !== from || Math.random() > 0.75) return;
          particles.push({ x: e.a.x, y: e.a.y, tx: e.b.x, ty: e.b.y, speed: 0.012, color: NN_LAYERS[from].color });
          active[from][e.i]     = 1;
          active[from + 1][e.j] = 1;
        });
      } else {
        // Step 3: OUTPUT fires blue particles into the prediction box
        outputReady = true;
        predicted   = currentLabel;
        nodes[nodes.length - 1].forEach(n => {
          if (Math.random() > 0.6) return;
          particles.push({ x: n.x, y: n.y, tx: W - OUTPUT_ZONE + 20, ty: H / 2, speed: 0.014, color: NN_LAYERS[NN_LAYERS.length - 1].color });
        });
      }

      layerIndex++;
    }

    function update() {
      inputFlash *= 0.93;
      particles.forEach(p => {
        p.x += (p.tx - p.x) * p.speed;
        p.y += (p.ty - p.y) * p.speed;
      });
      particles = particles.filter(p => Math.abs(p.x - p.tx) > 0.5);
    }

    const rr = (x: number, y: number, w: number, h: number, r: number) => {
      ctx.beginPath();
      if (typeof ctx.roundRect === 'function') ctx.roundRect(x, y, w, h, r);
      else ctx.rect(x, y, w, h);
    };

    function draw() {
      ctx.clearRect(0, 0, W, H);

      // Background
      ctx.fillStyle = '#0c111a';
      rr(0, 0, W, H, 14); ctx.fill();

      // Input landmark box
      ctx.strokeStyle = `rgba(52,211,153,${0.25 + inputFlash * 0.75})`;
      ctx.lineWidth = 1.5;
      rr(bx, by, bw, bh, 8); ctx.stroke();

      ctx.fillStyle = `rgba(52,211,153,${0.6 + inputFlash * 0.4})`;
      ctx.font = '600 10px system-ui';
      ctx.textAlign = 'center';
      ctx.fillText('HAND LANDMARKS', bx + bw / 2, by - 8);

      if (currentImg) {
        ctx.save();
        rr(bx + 3, by + 3, bw - 6, bh - 6, 5);
        ctx.clip();
        ctx.drawImage(currentImg, bx + 3, by + 3, bw - 6, bh - 6);
        ctx.restore();
      }
      ctx.shadowColor = '#34d399';
      ctx.shadowBlur  = 6;
      for (let i = 0; i < 21; i++) {
        ctx.fillStyle = `rgba(52,211,153,${0.55 + inputFlash * 0.45})`;
        ctx.beginPath();
        ctx.arc(DOT_X[i], DOT_Y[i], 3, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.shadowBlur = 0;
      ctx.textAlign = 'center';
      ctx.font = `bold ${currentLabel.length > 2 ? 14 : 22}px "Noto Nastaliq Urdu", serif`;
      ctx.fillStyle = `rgba(52,211,153,${0.8 + inputFlash * 0.2})`;
      ctx.fillText(currentLabel, bx + bw / 2, by + bh + 22);
      ctx.font = '9px system-ui';
      ctx.fillStyle = 'rgba(200,210,235,0.5)';
      ctx.fillText(currentEnglish, bx + bw / 2, by + bh + 34);

      // Input → layer-0 fan lines
      nodes[0].forEach(n => {
        ctx.beginPath();
        ctx.moveTo(INPUT_ZONE - 10, H / 2);
        ctx.lineTo(n.x, n.y);
        ctx.strokeStyle = 'rgba(52,211,153,0.12)';
        ctx.lineWidth = 1;
        ctx.stroke();
      });

      // Edges
      edges.forEach(e => {
        ctx.beginPath();
        ctx.moveTo(e.a.x, e.a.y);
        ctx.lineTo(e.b.x, e.b.y);
        ctx.strokeStyle = 'rgba(200,215,255,0.14)';
        ctx.lineWidth = 1;
        ctx.stroke();
      });

      // Output → prediction fan lines (connect to box left edge)
      const fanX = W - OUTPUT_ZONE + 20;
      nodes[nodes.length - 1].forEach(n => {
        ctx.beginPath();
        ctx.moveTo(n.x, n.y);
        ctx.lineTo(fanX, H / 2);
        ctx.strokeStyle = `rgba(56,189,248,${outputReady ? 0.32 : 0.1})`;
        ctx.lineWidth = 1;
        ctx.stroke();
      });

      // Particles
      particles.forEach(p => {
        ctx.beginPath();
        ctx.arc(p.x, p.y, 2.5, 0, Math.PI * 2);
        ctx.fillStyle = p.color;
        ctx.fill();
      });

      // Neurons
      nodes.forEach((layer, li) => {
        layer.forEach((n, i) => {
          const g     = active[li][i];
          const alive = dropoutMask?.[li]?.[i] ?? 1;

          if (alive === 0) {
            ctx.beginPath();
            ctx.arc(n.x, n.y, 3, 0, Math.PI * 2);
            ctx.fillStyle = 'rgba(255,255,255,0.05)';
            ctx.fill();
            return;
          }

          ctx.beginPath();
          ctx.arc(n.x, n.y, 5 + g * 2, 0, Math.PI * 2);
          ctx.fillStyle    = NN_LAYERS[li].color;
          ctx.shadowColor  = NN_LAYERS[li].color;
          ctx.shadowBlur   = 5 + g * 18;
          ctx.fill();
          ctx.shadowBlur   = 0;
        });
      });

      // Layer labels
      ctx.textAlign = 'center';
      NN_LAYERS.forEach((_, li) => {
        const x = lx(li);
        const y = H - 20;
        ctx.fillStyle = 'rgba(220,224,240,0.65)';
        ctx.font = '600 11px system-ui';
        ctx.fillText(LAYER_META[li][0], x, y);
        ctx.font = '10px system-ui';
        ctx.fillStyle = 'rgba(200,210,235,0.38)';
        ctx.fillText(LAYER_META[li][1], x, y + 13);
      });

      // Output prediction box
      const pbx = W - OUTPUT_ZONE + 20;
      const pby = H / 2 - 90;
      const pbw = OUTPUT_ZONE - 32;
      const pbh = 180;
      const pcx = pbx + pbw / 2;

      ctx.strokeStyle = `rgba(56,189,248,${outputReady ? 0.55 : 0.22})`;
      ctx.lineWidth = 1.5;
      rr(pbx, pby, pbw, pbh, 8); ctx.stroke();

      ctx.fillStyle = `rgba(52,211,153,${outputReady ? 0.9 : 0.6})`;
      ctx.font = '700 10px system-ui';
      ctx.textAlign = 'center';
      ctx.fillText('PREDICTION', pcx, pby + 18);

      if (outputReady) {
        const predFontSize = predicted.length > 5 ? 20 : predicted.length > 2 ? 30 : 54;
        ctx.font = `bold ${predFontSize}px "Noto Nastaliq Urdu", serif`;
        ctx.fillStyle   = '#34d399';
        ctx.shadowColor = '#34d399';
        ctx.shadowBlur  = 22;
        ctx.textAlign   = 'center';
        ctx.fillText(predicted, pcx, pby + pbh / 2 + predFontSize / 3);
        ctx.shadowBlur  = 0;
      } else {
        ctx.font = 'bold 26px system-ui';
        ctx.fillStyle = 'rgba(56,189,248,0.28)';
        ctx.textAlign = 'center';
        ctx.fillText('—', pcx, pby + pbh / 2 + 10);
      }

      ctx.font = '10px system-ui';
      ctx.fillStyle = 'rgba(200,210,235,0.38)';
      ctx.textAlign = 'center';
      const predDesc = predicted.length > 2 ? 'word recognised' : 'letter recognised';
      ctx.fillText(outputReady ? predDesc : 'processing…', pcx, pby + pbh - 14);
    }

    build();
    buildEdges();
    loadRandomSign();
    step();

    let stepInterval: ReturnType<typeof setInterval> | null = setInterval(step, 1500);
    let isHovered = false;

    function startAuto() { stepInterval = setInterval(step, 1500); }
    function stopAuto()  { if (stepInterval) { clearInterval(stepInterval); stepInterval = null; } }

    function onEnter() { isHovered = true;  stopAuto(); }
    function onLeave() { isHovered = false; startAuto(); }
    function onKey(e: KeyboardEvent) {
      if (isHovered && e.code === 'Space') { e.preventDefault(); step(); }
    }

    canvas.addEventListener('mouseenter', onEnter);
    canvas.addEventListener('mouseleave', onLeave);
    window.addEventListener('keydown', onKey);

    let rafId: number;
    function loop() { update(); draw(); rafId = requestAnimationFrame(loop); }
    loop();

    return () => {
      stopAuto();
      canvas.removeEventListener('mouseenter', onEnter);
      canvas.removeEventListener('mouseleave', onLeave);
      window.removeEventListener('keydown', onKey);
      cancelAnimationFrame(rafId);
    };
  }, []);

  return (
    <div style={{ position: 'relative' }}>
      <canvas
        ref={canvasRef}
        width={980}
        height={400}
        style={{ width: '100%', height: 'auto', display: 'block', cursor: 'crosshair' }}
      />
      <div style={{
        position: 'absolute', bottom: 14, right: 18,
        fontSize: 11, fontWeight: 600, color: 'rgba(200,210,235,0.38)',
        pointerEvents: 'none', letterSpacing: '0.04em',
      }}>
        hover + <kbd style={{ background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.15)', borderRadius: 4, padding: '1px 5px' }}>Space</kbd> to step
      </div>
    </div>
  );
}

// ── Technology Pipeline Canvas ───────────────────────────────────────────────
const PIPE_LM: Record<number, [number, number]> = {
  0:[100,225],1:[72,202],2:[52,182],3:[40,162],4:[32,144],
  5:[82,150],6:[76,114],7:[72,90],8:[69,70],
  9:[101,145],10:[100,106],11:[99,80],12:[98,58],
  13:[120,150],14:[124,112],15:[127,88],16:[129,68],
  17:[140,158],18:[148,128],19:[153,108],20:[157,90],
};
const PIPE_BONES = [[0,1],[1,2],[2,3],[3,4],[0,5],[5,6],[6,7],[7,8],[5,9],[9,10],[10,11],[11,12],[9,13],[13,14],[14,15],[15,16],[13,17],[17,18],[18,19],[19,20],[0,17]];
const PIPE_TIPS  = [4,8,12,16,20];

function TechPipelineViz({ onTFClick, onSCClick, onMPClick }: { onTFClick?: () => void; onSCClick?: () => void; onMPClick?: () => void }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const onTFClickRef = useRef(onTFClick);
  const onSCClickRef = useRef(onSCClick);
  const onMPClickRef = useRef(onMPClick);
  useEffect(() => { onTFClickRef.current = onTFClick; }, [onTFClick]);
  useEffect(() => { onSCClickRef.current = onSCClick; }, [onSCClick]);
  useEffect(() => { onMPClickRef.current = onMPClick; }, [onMPClick]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctxOrNull = canvas.getContext('2d');
    if (!ctxOrNull) return;
    const ctx: CanvasRenderingContext2D = ctxOrNull;
    const canvasEl: HTMLCanvasElement = canvas;

    const W = canvas.width;
    const H = canvas.height;

    // Box regions
    const B = {
      cam:  { x: 20,  y: 100, w: 160, h: 280 },
      mp:   { x: 220, y: 50,  w: 235, h: 380 },
      sc:   { x: 495, y: 140, w: 130, h: 200 },
      tf:   { x: 665, y: 50,  w: 295, h: 380 },
      pred: { x: 1005,y: 140, w: 155, h: 200 },
    };
    // Connection midpoints (all at y = H/2)
    const CY = H / 2;
    const CX = [
      { fx: 180, tx: 220 },
      { fx: 455, tx: 495 },
      { fx: 625, tx: 665 },
      { fx: 960, tx: 1005 },
    ];
    const COLORS = ['#38bdf8','#34d399','#34d399','#a78bfa'];

    type Particle = { x: number; y: number; tx: number; ty: number; color: string };
    let particles: Particle[] = [];
    let stage = 0;
    let prediction = '—';
    let tfHov = false;
    let scHov = false;
    let mpHov = false;

    const rr = (x: number, y: number, w: number, h: number, r: number) => {
      ctx.beginPath();
      if (typeof ctx.roundRect === 'function') ctx.roundRect(x, y, w, h, r);
      else ctx.rect(x, y, w, h);
    };

    // Video setup with offscreen canvas for chroma key
    const vid = document.createElement('video');
    vid.src = '/signing.mp4';
    vid.loop = true;
    vid.muted = true;
    vid.playsInline = true;
    vid.crossOrigin = 'anonymous';
    vid.play().catch(() => {});

    const offscreen = document.createElement('canvas');
    const offCtx = offscreen.getContext('2d', { willReadFrequently: true });
    offscreen.width  = B.cam.w - 16;
    offscreen.height = B.cam.h - 16;

    function drawBoxOutline(b: { x:number; y:number; w:number; h:number }, title: string, active: boolean) {
      ctx.strokeStyle = active ? 'rgba(200,215,240,0.32)' : 'rgba(200,215,240,0.08)';
      ctx.lineWidth = 1.5;
      rr(b.x, b.y, b.w, b.h, 10); ctx.stroke();
      ctx.fillStyle = active ? 'rgba(200,215,240,0.65)' : 'rgba(200,215,240,0.18)';
      ctx.font = '700 9.5px system-ui';
      ctx.textAlign = 'center';
      ctx.fillText(title, b.x + b.w / 2, b.y - 10);
    }

    function drawCamera() {
      const { x, y, w, h } = B.cam;
      const bx = x + 8, by = y + 8, bw = w - 16, bh = h - 16;

      // Clip to inner box
      ctx.save();
      rr(bx, by, bw, bh, 7); ctx.clip();

      if (offCtx && vid.readyState >= 2) {
        // Cover-fit: scale to fill box, crop sides
        const vw = vid.videoWidth, vh = vid.videoHeight;
        if (vw > 0 && vh > 0) {
          const scale = Math.max(bw / vw, bh / vh);
          const srcW  = bw / scale;
          const srcH  = bh / scale;
          const srcX  = (vw - srcW) / 2;
          const srcY  = (vh - srcH) / 2;
          offCtx.clearRect(0, 0, bw, bh);
          offCtx.drawImage(vid, srcX, srcY, srcW, srcH, 0, 0, bw, bh);
        } else {
          offCtx.drawImage(vid, 0, 0, bw, bh);
        }
        const img = offCtx.getImageData(0, 0, bw, bh);
        const d = img.data;
        for (let i = 0; i < d.length; i += 4) {
          const r2 = d[i], g2 = d[i+1], b2 = d[i+2];
          if (g2 > 80 && g2 > r2 * 1.35 && g2 > b2 * 1.35) d[i+3] = 0;
        }
        offCtx.putImageData(img, 0, 0);
        ctx.drawImage(offscreen, bx, by);
      } else {
        ctx.fillStyle = 'rgba(56,189,248,0.05)';
        ctx.fillRect(bx, by, bw, bh);
      }

      ctx.restore();

      // Blue circles overlay (on top of video)
      ctx.beginPath(); ctx.arc(x+w/2, y+h/2-10, 40, 0, Math.PI*2);
      ctx.strokeStyle = 'rgba(56,189,248,0.45)'; ctx.lineWidth = 2; ctx.stroke();
      ctx.beginPath(); ctx.arc(x+w/2, y+h/2-10, 23, 0, Math.PI*2);
      ctx.strokeStyle = 'rgba(56,189,248,0.75)'; ctx.lineWidth = 2; ctx.stroke();

      ctx.fillStyle = 'rgba(56,189,248,0.7)'; ctx.font = '700 10px system-ui'; ctx.textAlign = 'center';
      ctx.fillText('OpenCV', x+w/2, y+h-14);
    }

    function drawHand() {
      const { x, y, w, h } = B.mp;
      ctx.fillStyle = 'rgba(52,211,153,0.04)';
      rr(x+8, y+8, w-16, h-16, 7); ctx.fill();

      const xs = Object.values(PIPE_LM).map(([px]) => px);
      const ys = Object.values(PIPE_LM).map(([,py]) => py);
      const minX = Math.min(...xs), maxX = Math.max(...xs);
      const minY = Math.min(...ys), maxY = Math.max(...ys);
      const pad = 30;
      const sc = Math.min((w - pad*2) / (maxX - minX), (h - pad*2 - 22) / (maxY - minY));
      const ox = x + (w - (maxX-minX)*sc) / 2 - minX*sc;
      const oy = y + pad + (h - pad*2 - 22 - (maxY-minY)*sc) / 2 - minY*sc;

      PIPE_BONES.forEach(([a, b]) => {
        const [ax, ay] = PIPE_LM[a], [bx2, by2] = PIPE_LM[b];
        ctx.beginPath();
        ctx.moveTo(ox+ax*sc, oy+ay*sc); ctx.lineTo(ox+bx2*sc, oy+by2*sc);
        ctx.strokeStyle = 'rgba(255,255,255,0.72)'; ctx.lineWidth = 2.5; ctx.stroke();
      });

      Object.entries(PIPE_LM).forEach(([k, [px, py]]) => {
        const tip = PIPE_TIPS.includes(+k);
        ctx.beginPath(); ctx.arc(ox+px*sc, oy+py*sc, tip ? 5.5 : 3.5, 0, Math.PI*2);
        ctx.fillStyle = tip ? '#34d399' : 'white';
        ctx.shadowColor = tip ? '#34d399' : 'transparent';
        ctx.shadowBlur  = tip ? 8 : 0;
        ctx.fill(); ctx.shadowBlur = 0;
      });

      ctx.fillStyle = 'rgba(52,211,153,0.7)'; ctx.font = '700 10px system-ui'; ctx.textAlign = 'center';
      ctx.fillText('21 Landmarks (x,y)', x+w/2, y+h-12);
      if (mpHov) {
        ctx.strokeStyle = 'rgba(0,255,255,0.65)';
        ctx.lineWidth = 2;
        ctx.strokeRect(x, y, w, h);
        ctx.fillStyle = 'rgba(0,255,255,0.8)';
        ctx.font = '700 9px system-ui'; ctx.textAlign = 'center';
        ctx.fillText('↗ click to explore', x + w / 2, y - 12);
      }
    }

    function drawScaler() {
      const { x, y, w, h } = B.sc;
      ctx.fillStyle = 'rgba(52,211,153,0.05)';
      rr(x+8, y+8, w-16, h-16, 7); ctx.fill();
      for (let i = 0; i < 10; i++) {
        const bw = 28 + ((i * 37 + 13) % 50);
        ctx.fillStyle = `rgba(52,211,153,${0.18 + (i % 5) * 0.1})`;
        ctx.fillRect(x+18, y+28+i*13, bw, 7);
      }
      ctx.fillStyle = 'rgba(52,211,153,0.7)'; ctx.font = '700 10px system-ui'; ctx.textAlign = 'center';
      ctx.fillText('σ-normalised', x+w/2, y+h-12);
      if (scHov) {
        ctx.strokeStyle = 'rgba(52,211,153,0.65)';
        ctx.lineWidth = 2;
        ctx.strokeRect(x, y, w, h);
        ctx.fillStyle = 'rgba(52,211,153,0.8)';
        ctx.font = '700 9px system-ui'; ctx.textAlign = 'center';
        ctx.fillText('↗ click to explore', x + w / 2, y - 12);
      }
    }

    const TF_L = [
      { n: 7, color: '#34d399' }, { n: 6, color: '#a78bfa' },
      { n: 5, color: '#fbbf24' }, { n: 4, color: '#38bdf8' },
    ];
    const TF_META = ['Input (42)', 'Dense 256', 'Dense 128', 'Out (37)'];

    function drawTF() {
      const { x, y, w, h } = B.tf;
      ctx.fillStyle = 'rgba(167,139,250,0.04)';
      rr(x+8, y+8, w-16, h-16, 7); ctx.fill();
      const lx = (i: number) => x + 36 + i * (w - 72) / (TF_L.length - 1);
      TF_L.forEach((_, li) => {
        if (li === 0) return;
        for (let i = 0; i < TF_L[li].n; i++)
          for (let j = 0; j < TF_L[li-1].n; j++) {
            if ((i+j) % 3 !== 0) continue;
            const y1 = y+28+(j+0.5)*(h-56)/TF_L[li-1].n;
            const y2 = y+28+(i+0.5)*(h-56)/TF_L[li].n;
            ctx.beginPath(); ctx.moveTo(lx(li-1), y1); ctx.lineTo(lx(li), y2);
            ctx.strokeStyle = 'rgba(200,210,255,0.12)'; ctx.lineWidth = 1; ctx.stroke();
          }
      });
      TF_L.forEach((layer, li) => {
        for (let i = 0; i < layer.n; i++) {
          const ny = y+28+(i+0.5)*(h-56)/layer.n;
          ctx.beginPath(); ctx.arc(lx(li), ny, 5, 0, Math.PI*2);
          ctx.fillStyle = layer.color; ctx.shadowColor = layer.color; ctx.shadowBlur = 7;
          ctx.fill(); ctx.shadowBlur = 0;
        }
        ctx.fillStyle = 'rgba(200,210,235,0.45)'; ctx.font = '9px system-ui'; ctx.textAlign = 'center';
        ctx.fillText(TF_META[li], lx(li), y+h-10);
      });
      // Hover highlight + click hint
      if (tfHov) {
        ctx.strokeStyle = 'rgba(167,139,250,0.65)';
        ctx.lineWidth = 2;
        rr(x, y, w, h, 10); ctx.stroke();
        ctx.fillStyle = 'rgba(167,139,250,0.8)';
        ctx.font = '700 9px system-ui'; ctx.textAlign = 'center';
        ctx.fillText('↗ click to explore', x + w / 2, y - 12);
      }
    }

    function drawPred() {
      const { x, y, w, h } = B.pred;
      const isWord = prediction !== '—' && prediction.length > 2;
      if (prediction !== '—') {
        ctx.fillStyle = '#34d399'; ctx.shadowColor = '#34d399'; ctx.shadowBlur = 20;
      } else {
        ctx.fillStyle = 'rgba(56,189,248,0.28)'; ctx.shadowBlur = 0;
      }
      ctx.font = `bold ${isWord ? 22 : 52}px "Noto Nastaliq Urdu", serif`;
      ctx.textAlign = 'center';
      ctx.fillText(prediction, x+w/2, y+h/2+(isWord ? 10 : 20));
      ctx.shadowBlur = 0;
      ctx.fillStyle = 'rgba(200,210,235,0.4)'; ctx.font = '9px system-ui'; ctx.textAlign = 'center';
      ctx.fillText(prediction !== '—' ? 'recognised' : 'processing…', x+w/2, y+h-12);
    }

    function spawn(fx: number, fy: number, tx: number, ty: number, color: string) {
      for (let i = 0; i < 14; i++) particles.push({ x: fx, y: fy, tx, ty, color });
    }

    function draw() {
      ctx.clearRect(0, 0, W, H);
      ctx.fillStyle = '#0c111a'; rr(0, 0, W, H, 14); ctx.fill();

      drawBoxOutline(B.cam,  'CAMERA',             true);
      drawBoxOutline(B.mp,   'MEDIAPIPE HANDS',    stage >= 1);
      drawBoxOutline(B.sc,   'STANDARD SCALER',    stage >= 2);
      drawBoxOutline(B.tf,   'TENSORFLOW / KERAS', stage >= 3);
      drawBoxOutline(B.pred, 'PREDICTION',         true);

      // Connection lines
      for (let i = 0; i < Math.min(stage, CX.length); i++) {
        ctx.beginPath(); ctx.moveTo(CX[i].fx, CY); ctx.lineTo(CX[i].tx, CY);
        ctx.strokeStyle = 'rgba(200,215,240,0.22)'; ctx.lineWidth = 1.5; ctx.stroke();
        ctx.fillStyle = 'rgba(200,215,240,0.35)'; ctx.beginPath();
        ctx.moveTo(CX[i].tx+6, CY); ctx.lineTo(CX[i].tx-2, CY-5); ctx.lineTo(CX[i].tx-2, CY+5);
        ctx.fill();
      }

      drawCamera();
      if (stage >= 1) drawHand();
      if (stage >= 2) drawScaler();
      if (stage >= 3) drawTF();
      drawPred();

      particles.forEach(p => {
        ctx.beginPath(); ctx.arc(p.x, p.y, 3, 0, Math.PI*2);
        ctx.fillStyle = p.color; ctx.shadowColor = p.color; ctx.shadowBlur = 8;
        ctx.fill(); ctx.shadowBlur = 0;
      });
    }

    function update() {
      particles.forEach(p => { p.x += (p.tx-p.x)*0.09; p.y += (p.ty-p.y)*0.09; });
      particles = particles.filter(p => Math.abs(p.tx-p.x) > 0.5);
    }

    function trigger() {
      stage++;
      if (stage <= 4) spawn(CX[stage-1].fx, CY, CX[stage-1].tx, CY, COLORS[stage-1]);
      if (stage === 4) prediction = 'لَفْظ';
      if (stage > 4)  { stage = 0; prediction = '—'; particles = []; }
    }

    let isHovered = false;
    let autoInt: ReturnType<typeof setInterval> | null = setInterval(trigger, 1800);
    const startAuto = () => { autoInt = setInterval(trigger, 1800); };
    const stopAuto  = () => { if (autoInt) { clearInterval(autoInt); autoInt = null; } };
    const onEnter   = () => { isHovered = true;  stopAuto(); };
    const onLeave   = () => { isHovered = false; startAuto(); };
    const onKey     = (e: KeyboardEvent) => {
      if (isHovered && e.code === 'Space') { e.preventDefault(); trigger(); }
    };

    function onMouseMove(e: MouseEvent) {
      const rect = canvasEl.getBoundingClientRect();
      const scaleX = W / rect.width;
      const scaleY = H / rect.height;
      const mx = (e.clientX - rect.left) * scaleX;
      const my = (e.clientY - rect.top)  * scaleY;
      tfHov = mx >= B.tf.x && mx <= B.tf.x + B.tf.w && my >= B.tf.y && my <= B.tf.y + B.tf.h;
      scHov = mx >= B.sc.x && mx <= B.sc.x + B.sc.w && my >= B.sc.y && my <= B.sc.y + B.sc.h;
      mpHov = mx >= B.mp.x && mx <= B.mp.x + B.mp.w && my >= B.mp.y && my <= B.mp.y + B.mp.h;
      canvasEl.style.cursor = (tfHov || scHov || mpHov) ? 'pointer' : 'crosshair';
    }

    function onClick(e: MouseEvent) {
      const rect = canvasEl.getBoundingClientRect();
      const scaleX = W / rect.width;
      const scaleY = H / rect.height;
      const mx = (e.clientX - rect.left) * scaleX;
      const my = (e.clientY - rect.top)  * scaleY;
      if (mx >= B.tf.x && mx <= B.tf.x + B.tf.w && my >= B.tf.y && my <= B.tf.y + B.tf.h)
        onTFClickRef.current?.();
      if (mx >= B.sc.x && mx <= B.sc.x + B.sc.w && my >= B.sc.y && my <= B.sc.y + B.sc.h)
        onSCClickRef.current?.();
      if (mx >= B.mp.x && mx <= B.mp.x + B.mp.w && my >= B.mp.y && my <= B.mp.y + B.mp.h)
        onMPClickRef.current?.();
    }

    canvas.addEventListener('mouseenter', onEnter);
    canvas.addEventListener('mouseleave', onLeave);
    canvas.addEventListener('mousemove', onMouseMove);
    canvas.addEventListener('click', onClick);
    window.addEventListener('keydown', onKey);

    let rafId: number;
    function loop() { update(); draw(); rafId = requestAnimationFrame(loop); }
    loop();

    return () => {
      stopAuto();
      vid.pause();
      canvas.removeEventListener('mouseenter', onEnter);
      canvas.removeEventListener('mouseleave', onLeave);
      canvas.removeEventListener('mousemove', onMouseMove);
      canvas.removeEventListener('click', onClick);
      window.removeEventListener('keydown', onKey);
      cancelAnimationFrame(rafId);
    };
  }, []);

  return (
    <div style={{ position: 'relative' }}>
      <canvas ref={canvasRef} width={1200} height={480}
        style={{ width: '100%', height: 'auto', display: 'block', cursor: 'crosshair' }} />
      <div style={{
        position: 'absolute', bottom: 14, right: 18, fontSize: 11, fontWeight: 600,
        color: 'rgba(200,210,235,0.38)', pointerEvents: 'none', letterSpacing: '0.04em',
      }}>
        hover + <kbd style={{ background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.15)', borderRadius: 4, padding: '1px 5px' }}>Space</kbd> to step
      </div>
    </div>
  );
}

// ── MediaPipe Hand Visualizer ─────────────────────────────────────────────────
const MP_SHAPES: Record<number,[number,number]>[] = [
  /* 0 Open   */{0:[100,225],1:[72,202],2:[52,182],3:[40,162],4:[32,144],5:[82,150],6:[76,114],7:[72,90],8:[69,70],9:[101,145],10:[100,106],11:[99,80],12:[98,58],13:[120,150],14:[124,112],15:[127,88],16:[129,68],17:[140,158],18:[148,128],19:[153,108],20:[157,90]},
  /* 1 Fist   */{0:[100,225],1:[78,210],2:[72,200],3:[70,195],4:[75,190],5:[85,158],6:[90,172],7:[93,183],8:[92,192],9:[102,153],10:[104,166],11:[105,177],12:[104,186],13:[118,155],14:[122,168],15:[124,178],16:[123,187],17:[133,162],18:[138,172],19:[140,180],20:[138,188]},
  /* 2 Peace  */{0:[100,225],1:[78,210],2:[72,200],3:[70,195],4:[75,190],5:[82,150],6:[76,114],7:[72,90],8:[69,70],9:[101,145],10:[100,106],11:[99,80],12:[98,58],13:[118,155],14:[122,168],15:[124,178],16:[123,187],17:[133,162],18:[138,172],19:[140,180],20:[138,188]},
  /* 3 Thumb  */{0:[100,225],1:[82,207],2:[70,183],3:[58,160],4:[48,138],5:[90,162],6:[95,175],7:[96,185],8:[93,192],9:[104,158],10:[106,170],11:[107,180],12:[106,188],13:[118,162],14:[122,173],15:[124,182],16:[122,189],17:[133,168],18:[138,177],19:[140,184],20:[138,190]},
  /* 4 L-shape*/{0:[100,225],1:[85,220],2:[68,218],3:[52,215],4:[37,212],5:[82,150],6:[76,114],7:[72,90],8:[69,70],9:[102,153],10:[104,166],11:[105,177],12:[104,186],13:[118,155],14:[122,168],15:[124,178],16:[123,187],17:[133,162],18:[138,172],19:[140,180],20:[138,188]},
];

function MediaPipeViz() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctxOrNull = canvas.getContext('2d');
    if (!ctxOrNull) return;
    const ctx: CanvasRenderingContext2D = ctxOrNull;

    const W = canvas.width;
    const H = canvas.height;

    const BONES = [[0,1],[1,2],[2,3],[3,4],[0,5],[5,6],[6,7],[7,8],[5,9],[9,10],[10,11],[11,12],[9,13],[13,14],[14,15],[15,16],[13,17],[17,18],[18,19],[19,20],[0,17]];
    const TIPS  = [4,8,12,16,20];
    const SCALE = 2.4;
    const HAND_CX = W * 0.5;
    const HAND_CY = H * 0.8;

    // 5 visually distinct poses
    const POSES = [MP_SHAPES[0], MP_SHAPES[1], MP_SHAPES[2], MP_SHAPES[3], MP_SHAPES[4]];

    function toCanvas(lm: Record<number,[number,number]>): [number,number][] {
      const [wx,wy] = lm[0];
      return Array.from({length:21}, (_,i) => {
        const [x,y] = lm[i];
        return [HAND_CX+(x-wx)*SCALE, HAND_CY+(y-wy)*SCALE] as [number,number];
      });
    }

    type Signal = {boneIdx:number; t:number};
    let signals: Signal[] = [];
    let poseIdx    = 0;
    let currentPts = toCanvas(POSES[0]);
    let sourcePts  = currentPts.map(p => [...p] as [number,number]);
    let targetPts  = currentPts.map(p => [...p] as [number,number]);
    let transT     = 1;
    const TRANS_DUR = 55;

    function easeIO(t:number){ return t<0.5?2*t*t:-1+(4-2*t)*t; }

    function goPose(dir: 1|-1) {
      poseIdx   = (poseIdx + dir + POSES.length) % POSES.length;
      sourcePts = currentPts.map(p => [...p] as [number,number]);
      targetPts = toCanvas(POSES[poseIdx]);
      transT    = 0;
    }

    const onArrow = (e: KeyboardEvent) => {
      if (e.key === 'ArrowRight') { e.preventDefault(); goPose(1); }
      if (e.key === 'ArrowLeft')  { e.preventDefault(); goPose(-1); }
    };
    window.addEventListener('keydown', onArrow);

    const signalInt = setInterval(() => {
      signals.push({boneIdx:Math.floor(Math.random()*BONES.length),t:0});
    }, 80);

    let rafId: number;

    function animate() {
      ctx.clearRect(0,0,W,H);
      ctx.fillStyle='rgba(7,16,28,0.97)'; ctx.fillRect(0,0,W,H);

      // Grid
      ctx.strokeStyle='rgba(0,255,255,0.035)'; ctx.lineWidth=1;
      for(let x=0;x<W;x+=50){ctx.beginPath();ctx.moveTo(x,0);ctx.lineTo(x,H);ctx.stroke();}
      for(let y=0;y<H;y+=50){ctx.beginPath();ctx.moveTo(0,y);ctx.lineTo(W,y);ctx.stroke();}

      // Interpolate pose
      if (transT < 1) {
        transT = Math.min(1, transT + 1/TRANS_DUR);
        const e = easeIO(transT);
        currentPts = sourcePts.map((s,i) => [
          s[0]+(targetPts[i][0]-s[0])*e,
          s[1]+(targetPts[i][1]-s[1])*e,
        ] as [number,number]);
      }

      signals.forEach(s => { s.t += 0.04; });
      signals = signals.filter(s => s.t <= 1);

      // Bones
      BONES.forEach(([a,b]) => {
        ctx.beginPath();
        ctx.moveTo(currentPts[a][0],currentPts[a][1]);
        ctx.lineTo(currentPts[b][0],currentPts[b][1]);
        ctx.strokeStyle='rgba(0,255,255,0.38)'; ctx.lineWidth=2;
        ctx.shadowBlur=8; ctx.shadowColor='#00ffff'; ctx.stroke(); ctx.shadowBlur=0;
      });

      // Signals
      signals.forEach(s => {
        const [a,b] = BONES[s.boneIdx];
        const x = currentPts[a][0]+(currentPts[b][0]-currentPts[a][0])*s.t;
        const y = currentPts[a][1]+(currentPts[b][1]-currentPts[a][1])*s.t;
        ctx.beginPath(); ctx.arc(x,y,4,0,Math.PI*2);
        ctx.fillStyle='#00ffff'; ctx.shadowBlur=18; ctx.shadowColor='#00ffff';
        ctx.fill(); ctx.shadowBlur=0;
      });

      // Points + coordinates
      currentPts.forEach((p,i) => {
        const tip = TIPS.includes(i);
        ctx.beginPath(); ctx.arc(p[0],p[1],tip?6:4,0,Math.PI*2);
        ctx.fillStyle=`hsl(${180+i*8},100%,60%)`;
        ctx.shadowBlur=12; ctx.shadowColor=ctx.fillStyle; ctx.fill(); ctx.shadowBlur=0;
        ctx.fillStyle='rgba(255,255,255,0.55)'; ctx.font='9px system-ui'; ctx.textAlign='left';
        ctx.fillText(`(${Math.round(p[0])},${Math.round(p[1])})`, p[0]+7, p[1]-4);
      });

      // 5 dot indicators
      POSES.forEach((_,i) => {
        ctx.beginPath();
        ctx.arc(W/2 - (POSES.length-1)*14 + i*28, H-10, i===poseIdx?5:3, 0, Math.PI*2);
        ctx.fillStyle = i===poseIdx ? '#00ffff' : 'rgba(0,255,255,0.25)'; ctx.fill();
      });

      rafId = requestAnimationFrame(animate);
    }

    animate();

    return () => { clearInterval(signalInt); cancelAnimationFrame(rafId); window.removeEventListener('keydown', onArrow); };
  }, []);

  return (
    <canvas ref={canvasRef} width={1100} height={520}
      style={{ width:'100%', height:'auto', display:'block' }} />
  );
}

// ── Standard Scaler Canvas Visualizer ────────────────────────────────────────
function StandardScalerViz() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctxOrNull = canvas.getContext('2d');
    if (!ctxOrNull) return;
    const ctx: CanvasRenderingContext2D = ctxOrNull;

    const W = canvas.width;
    const H = canvas.height;

    const bgDots = Array.from({ length: 80 }, () => ({
      x: Math.random() * W,
      y: Math.random() * H,
      s: 1 + Math.random() * 3,
    }));

    type ScParticle = { x: number; y: number; stage: number };
    let particles: ScParticle[] = [];
    let pulse = 0;

    function drawBackground() {
      bgDots.forEach(p => {
        p.y -= 0.25;
        if (p.y < 0) p.y = H;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.s, 0, Math.PI * 2);
        ctx.fillStyle = 'rgba(255,255,255,0.12)';
        ctx.fill();
      });
    }

    function drawBox(x: number, y: number, w: number, h: number, title: string) {
      ctx.strokeStyle = 'rgba(255,255,255,0.15)';
      ctx.lineWidth = 2;
      ctx.strokeRect(x, y, w, h);
      ctx.fillStyle = '#e0e0e0';
      ctx.font = '16px system-ui';
      ctx.textAlign = 'center';
      ctx.fillText(title, x + w / 2, y - 12);
    }

    function drawRawFeatures() {
      drawBox(80, 140, 250, 320, 'RAW FEATURES');
      for (let i = 0; i < 9; i++) {
        const value = 0.2 + Math.abs(Math.sin(Date.now() / 800 + i));
        ctx.fillStyle = '#4fc3f7';
        ctx.fillRect(120, 180 + i * 28, value * 120, 16);
        ctx.fillStyle = '#fff';
        ctx.font = '13px system-ui';
        ctx.textAlign = 'center';
        ctx.fillText(value.toFixed(2), 100, 193 + i * 28);
      }
    }

    function drawScaler() {
      pulse += 0.03;
      const glow = 15 + Math.sin(pulse) * 10;
      ctx.shadowBlur  = glow;
      ctx.shadowColor = '#2ecc71';
      drawBox(470, 140, 260, 320, 'STANDARD SCALER');
      ctx.shadowBlur = 0;

      const offset = Math.sin(pulse * 2) * 5;
      ctx.fillStyle  = '#2ecc71';
      ctx.font       = '32px serif';
      ctx.textAlign  = 'center';
      ctx.fillText('x - μ', 600, 250 + offset);

      ctx.beginPath();
      ctx.moveTo(550, 270); ctx.lineTo(650, 270);
      ctx.strokeStyle = '#fff'; ctx.lineWidth = 1.5; ctx.stroke();

      ctx.fillStyle = '#2ecc71';
      ctx.fillText('σ', 600, 310 - offset);

      ctx.fillStyle = '#aaa'; ctx.font = '14px system-ui';
      ctx.fillText('Normalising data…', 600, 400);

      // Spinning progress ring
      ctx.beginPath();
      ctx.arc(600, 160, 28, -Math.PI / 2, -Math.PI / 2 + (Date.now() / 600) % (Math.PI * 2));
      ctx.strokeStyle = '#2ecc71'; ctx.lineWidth = 4; ctx.stroke();
    }

    function drawScaledFeatures() {
      drawBox(870, 140, 250, 320, 'SCALED FEATURES');
      for (let i = 0; i < 9; i++) {
        const value = Math.sin(Date.now() / 900 + i) * 2;
        ctx.fillStyle = value >= 0 ? '#2ecc71' : '#e74c3c';
        ctx.fillRect(960, 180 + i * 28, Math.abs(value) * 60, 16);
        ctx.fillStyle = '#fff'; ctx.font = '13px system-ui'; ctx.textAlign = 'center';
        ctx.fillText(value.toFixed(2), 930, 193 + i * 28);
      }
    }

    function drawArrows() {
      ctx.strokeStyle = '#888'; ctx.lineWidth = 3;
      ctx.beginPath(); ctx.moveTo(340, 300); ctx.lineTo(460, 300); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(740, 300); ctx.lineTo(860, 300); ctx.stroke();
      ctx.fillStyle = '#888'; ctx.font = '22px Arial'; ctx.textAlign = 'center';
      ctx.fillText('➜', 400, 308);
      ctx.fillText('➜', 800, 308);
    }

    function spawnParticles() {
      for (let i = 0; i < 10; i++) particles.push({ x: 330, y: 300, stage: 0 });
    }

    const spawnInt = setInterval(spawnParticles, 1200);

    function updateParticles() {
      particles.forEach(p => {
        if (p.stage === 0) {
          p.x += (470 - p.x) * 0.05;
          if (Math.abs(p.x - 470) < 5) p.stage = 1;
        } else {
          p.x += (870 - p.x) * 0.05;
        }
      });
      particles = particles.filter(p => p.x < 1120);
    }

    function drawParticles() {
      particles.forEach(p => {
        const t = Math.max(0, Math.min(1, (p.x - 330) / (870 - 330)));
        const r = Math.floor(255 * (1 - t));
        const g = Math.floor(255 * t);
        ctx.beginPath();
        ctx.arc(p.x, p.y, 4 + Math.sin(t * 10) * 2, 0, Math.PI * 2);
        ctx.fillStyle = `rgb(${r},${g},255)`;
        ctx.shadowColor = `rgb(${r},${g},255)`;
        ctx.shadowBlur  = 8;
        ctx.fill();
        ctx.shadowBlur = 0;
      });
    }

    let rafId: number;

    function animate() {
      ctx.clearRect(0, 0, W, H);
      ctx.fillStyle = '#0d1524';
      ctx.fillRect(0, 0, W, H);

      drawBackground();
      drawRawFeatures();
      drawScaler();
      drawScaledFeatures();
      drawArrows();
      updateParticles();
      drawParticles();

      ctx.fillStyle = 'rgba(200,210,235,0.55)';
      ctx.font = '700 13px system-ui';
      ctx.textAlign = 'center';
      ctx.fillText('StandardScaler — σ-Normalisation Workflow', W / 2, 58);

      rafId = requestAnimationFrame(animate);
    }

    animate();

    return () => {
      clearInterval(spawnInt);
      cancelAnimationFrame(rafId);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      width={1200}
      height={500}
      style={{ width: '100%', height: 'auto', display: 'block' }}
    />
  );
}

// ── Page ─────────────────────────────────────────────────────────────────────
export default function HowItWorksPage() {
  const [nnOpen, setNnOpen] = useState(false);
  const [scOpen, setScOpen] = useState(false);
  const [mpOpen, setMpOpen] = useState(false);

  useEffect(() => {
    if (!nnOpen && !scOpen && !mpOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') { setNnOpen(false); setScOpen(false); setMpOpen(false); }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [nnOpen, scOpen, mpOpen]);

  return (
    <div className="ls-scope ls-pub-page">
      <LsPublicNav active="/how-it-works" />

      {/* Hero */}
      <div style={{ padding: 'clamp(48px,6vw,88px) clamp(20px,5vw,96px) 0', maxWidth: 820 }}>
        <span style={{ fontSize: 12, fontWeight: 700, color: 'var(--primary)', letterSpacing: '0.1em', textTransform: 'uppercase' }}>
          Under the Hood
        </span>
        <h1 style={{ fontSize: 'clamp(28px,3.8vw,54px)', margin: '16px 0 20px', lineHeight: 1.1 }}>
          From hand gesture to{' '}
          <span style={{ color: 'var(--ink-faint)' }}>spoken word</span>
        </h1>
        <p style={{ fontSize: 16, color: 'var(--ink-soft)', lineHeight: 1.8, marginBottom: 36, maxWidth: 540 }}>
          Six stages — camera to speech — each happening in under 100 milliseconds.
        </p>
        <Link href="/sign" className="btn btn-primary" style={{ display: 'inline-flex', alignItems: 'center', gap: 8 }}>
          <I.Camera size={18} /> Try it live
        </Link>
      </div>

      {/* Steps */}
      <div style={{ padding: 'clamp(48px,6vw,80px) clamp(20px,5vw,96px)' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(290px,1fr))', gap: 20 }}>
          {STEPS.map(({ n, color, icon, title, body }) => (
            <div key={n} className="card" style={{ padding: 26, display: 'flex', gap: 18, alignItems: 'flex-start' }}>
              <div style={{ width: 44, height: 44, borderRadius: 14, background: `var(--${color}-soft)`, color: `var(--${color})`, display: 'grid', placeItems: 'center', flexShrink: 0 }}>
                {icon}
              </div>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 7 }}>
                  <span style={{ fontSize: 11, fontWeight: 700, color: `var(--${color})`, background: `var(--${color}-soft)`, padding: '2px 8px', borderRadius: 999 }}>
                    Step {n}
                  </span>
                  <h3 style={{ fontSize: 15.5, margin: 0, fontWeight: 700 }}>{title}</h3>
                </div>
                <p style={{ fontSize: 14, color: 'var(--ink-soft)', lineHeight: 1.7, margin: 0 }}>{body}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Stats */}
      <div style={{ padding: '0 clamp(20px,5vw,96px) clamp(56px,6vw,80px)' }}>
        <div className="ls-4col">
          {STATS.map(([val, label]) => (
            <div key={label} className="card" style={{ padding: '24px 20px', textAlign: 'center' }}>
              <div style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 32, color: 'var(--primary)', lineHeight: 1 }}>{val}</div>
              <div style={{ fontSize: 13, color: 'var(--ink-faint)', marginTop: 8 }}>{label}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Technology Pipeline */}
      <div style={{ padding: '0 clamp(20px,5vw,96px) clamp(48px,5vw,72px)' }}>
        <div style={{ borderRadius: 20, overflow: 'hidden', border: '1px solid var(--line)', boxShadow: 'var(--shadow)' }}>
          <div style={{ padding: '26px 30px 18px', background: 'var(--surface)', borderBottom: '1px solid var(--line)' }}>
            <span style={{ fontSize: 11.5, fontWeight: 700, color: 'var(--primary)', letterSpacing: '0.09em', textTransform: 'uppercase' }}>
              Technology Stack
            </span>
            <h2 style={{ fontSize: 'clamp(18px,2.2vw,26px)', margin: '8px 0 6px' }}>The Full Processing Pipeline</h2>
            <p style={{ fontSize: 14, color: 'var(--ink-soft)', margin: 0 }}>
              Camera frame to recognised sign — four technologies in sequence. Press <kbd style={{ fontFamily: 'var(--font-display)', fontSize: 12, padding: '1px 6px', borderRadius: 4, background: 'var(--surface-2)', border: '1px solid var(--line)' }}>Space</kbd> while hovering to step through manually.
            </p>
          </div>
          <div style={{ background: '#0c111a', padding: '16px 20px' }}>
            <TechPipelineViz onTFClick={() => setNnOpen(true)} onSCClick={() => setScOpen(true)} onMPClick={() => setMpOpen(true)} />
          </div>
        </div>
      </div>

      <LsFooter />

      {/* Neural Network modal */}
      {nnOpen && (
        <div
          onClick={() => setNnOpen(false)}
          style={{
            position: 'fixed', inset: 0, zIndex: 200,
            background: 'rgba(0,0,0,0.82)',
            backdropFilter: 'blur(10px)', WebkitBackdropFilter: 'blur(10px)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            padding: 'clamp(12px,3vw,40px)',
          }}
        >
          <div
            onClick={e => e.stopPropagation()}
            style={{
              width: '100%', maxWidth: 1040,
              background: '#0c111a',
              borderRadius: 20,
              border: '1px solid rgba(255,255,255,0.1)',
              boxShadow: '0 40px 80px rgba(0,0,0,0.6)',
              overflow: 'hidden',
            }}
          >
            {/* Modal header */}
            <div style={{
              padding: '18px 24px',
              borderBottom: '1px solid rgba(255,255,255,0.08)',
              display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            }}>
              <div>
                <span style={{ fontSize: 11, fontWeight: 700, color: 'var(--primary)', letterSpacing: '0.09em', textTransform: 'uppercase' }}>
                  Live Visualisation
                </span>
                <h2 style={{ fontSize: 'clamp(16px,2vw,22px)', margin: '6px 0 0', color: 'white' }}>
                  Inside the Neural Network
                </h2>
              </div>
              <button
                onClick={() => setNnOpen(false)}
                style={{
                  background: 'rgba(255,255,255,0.07)', border: '1px solid rgba(255,255,255,0.12)',
                  borderRadius: 10, color: 'white', width: 38, height: 38,
                  cursor: 'pointer', fontSize: 20, lineHeight: 1, flexShrink: 0,
                  display: 'grid', placeItems: 'center',
                }}
              >×</button>
            </div>

            {/* Canvas */}
            <div style={{ padding: '20px 20px 8px' }}>
              <NeuralNetViz />
            </div>

            <div style={{ textAlign: 'center', fontSize: 11, color: 'rgba(255,255,255,0.25)', padding: '8px 0 16px' }}>
              hover + <kbd style={{ background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.15)', borderRadius: 4, padding: '1px 5px' }}>Space</kbd> to step &nbsp;·&nbsp; <kbd style={{ background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.15)', borderRadius: 4, padding: '1px 5px' }}>Esc</kbd> to close
            </div>
          </div>
        </div>
      )}

      {/* MediaPipe modal */}
      {mpOpen && (
        <div
          onClick={() => setMpOpen(false)}
          style={{
            position: 'fixed', inset: 0, zIndex: 200,
            background: 'rgba(0,0,0,0.82)',
            backdropFilter: 'blur(10px)', WebkitBackdropFilter: 'blur(10px)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            padding: 'clamp(12px,3vw,40px)',
          }}
        >
          <div
            onClick={e => e.stopPropagation()}
            style={{
              width: '100%', maxWidth: 1060,
              background: '#07101c',
              borderRadius: 20,
              border: '1px solid rgba(0,255,255,0.18)',
              boxShadow: '0 40px 80px rgba(0,0,0,0.6), 0 0 60px rgba(0,255,255,0.06)',
              overflow: 'hidden',
            }}
          >
            <div style={{
              padding: '18px 24px',
              borderBottom: '1px solid rgba(0,255,255,0.1)',
              display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            }}>
              <div>
                <span style={{ fontSize: 11, fontWeight: 700, color: '#00ffff', letterSpacing: '0.09em', textTransform: 'uppercase' }}>
                  Landmark Extraction
                </span>
                <h2 style={{ fontSize: 'clamp(16px,2vw,22px)', margin: '6px 0 0', color: 'white' }}>
                  MediaPipe Hands — 21-Point Skeleton
                </h2>
              </div>
              <button
                onClick={() => setMpOpen(false)}
                style={{
                  background: 'rgba(255,255,255,0.07)', border: '1px solid rgba(255,255,255,0.12)',
                  borderRadius: 10, color: 'white', width: 38, height: 38,
                  cursor: 'pointer', fontSize: 20, lineHeight: 1, flexShrink: 0,
                  display: 'grid', placeItems: 'center',
                }}
              >×</button>
            </div>
            <div style={{ padding: '16px 20px 8px' }}>
              <MediaPipeViz />
            </div>
            <div style={{ textAlign: 'center', fontSize: 11, color: 'rgba(255,255,255,0.25)', padding: '8px 0 16px' }}>
              <kbd style={{ background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.15)', borderRadius: 4, padding: '1px 5px' }}>←</kbd> <kbd style={{ background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.15)', borderRadius: 4, padding: '1px 5px' }}>→</kbd> to navigate &nbsp;·&nbsp; auto-advances between poses &nbsp;·&nbsp; <kbd style={{ background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.15)', borderRadius: 4, padding: '1px 5px' }}>Esc</kbd> to close
            </div>
          </div>
        </div>
      )}

      {/* Standard Scaler modal */}
      {scOpen && (
        <div
          onClick={() => setScOpen(false)}
          style={{
            position: 'fixed', inset: 0, zIndex: 200,
            background: 'rgba(0,0,0,0.82)',
            backdropFilter: 'blur(10px)', WebkitBackdropFilter: 'blur(10px)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            padding: 'clamp(12px,3vw,40px)',
          }}
        >
          <div
            onClick={e => e.stopPropagation()}
            style={{
              width: '100%', maxWidth: 1040,
              background: '#0d1524',
              borderRadius: 20,
              border: '1px solid rgba(46,204,113,0.2)',
              boxShadow: '0 40px 80px rgba(0,0,0,0.6)',
              overflow: 'hidden',
            }}
          >
            <div style={{
              padding: '18px 24px',
              borderBottom: '1px solid rgba(255,255,255,0.08)',
              display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            }}>
              <div>
                <span style={{ fontSize: 11, fontWeight: 700, color: '#2ecc71', letterSpacing: '0.09em', textTransform: 'uppercase' }}>
                  Feature Scaling
                </span>
                <h2 style={{ fontSize: 'clamp(16px,2vw,22px)', margin: '6px 0 0', color: 'white' }}>
                  StandardScaler — σ-Normalisation
                </h2>
              </div>
              <button
                onClick={() => setScOpen(false)}
                style={{
                  background: 'rgba(255,255,255,0.07)', border: '1px solid rgba(255,255,255,0.12)',
                  borderRadius: 10, color: 'white', width: 38, height: 38,
                  cursor: 'pointer', fontSize: 20, lineHeight: 1, flexShrink: 0,
                  display: 'grid', placeItems: 'center',
                }}
              >×</button>
            </div>
            <div style={{ padding: '16px 20px 8px' }}>
              <StandardScalerViz />
            </div>
            <div style={{ textAlign: 'center', fontSize: 11, color: 'rgba(255,255,255,0.25)', padding: '8px 0 16px' }}>
              <kbd style={{ background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.15)', borderRadius: 4, padding: '1px 5px' }}>Esc</kbd> or click outside to close
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
