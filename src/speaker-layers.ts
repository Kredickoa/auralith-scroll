type Rect = readonly [number, number, number, number];
type Part = { source: Rect; closedX: number; spreadX: number; y: number; depth?: number; widthScale?: number };

// Regions refer to the unchanged transparent photographic atlas, in source pixels.
// Closed and open poses use these same pixels; there is no frame interpolation.
const BODIES: Rect[] = [[671, 14, 332, 260], [671, 274, 332, 254], [671, 528, 332, 238]];
const BASES: Rect[] = [[606, 858, 465, 65], [611, 817, 451, 41], [622, 768, 428, 49]];
const PANELS: Part[] = [
  { source: [582, 27, 65, 244], closedX: 666, spreadX: -100, y: 27 },
  { source: [1020, 27, 74, 244], closedX: 936, spreadX: 100, y: 27, widthScale: .88 },
  { source: [532, 291, 126, 235], closedX: 676, spreadX: -140, y: 291, depth: -1, widthScale: .62 },
  { source: [1008, 291, 127, 235], closedX: 925, spreadX: 140, y: 291, depth: -1, widthScale: .62 },
  { source: [441, 291, 75, 235], closedX: 665, spreadX: -215, y: 291, widthScale: .88 },
  { source: [1160, 291, 75, 235], closedX: 938, spreadX: 215, y: 291, widthScale: .88 },
  { source: [582, 530, 82, 234], closedX: 676, spreadX: -80, y: 530, depth: -1, widthScale: .72 },
  { source: [1005, 530, 78, 234], closedX: 925, spreadX: 80, y: 530, depth: -1, widthScale: .72 },
  { source: [565, 556, 67, 190], closedX: 665, spreadX: -140, y: 556, widthScale: .98 },
  { source: [1041, 556, 65, 190], closedX: 937, spreadX: 140, y: 556 },
];
const RINGS = [
  { x: 747, y: 96, size: 176, shift: -115 },
  { x: 723, y: 299, size: 224, shift: -140 },
  { x: 723, y: 541, size: 224, shift: -140 },
];
const clamp = (value: number) => Math.min(1, Math.max(0, value));
const smooth = (start: number, end: number, value: number) => {
  const t = clamp((value - start) / (end - start));
  return t * t * (3 - 2 * t);
};

/** Renders fixed photographic parts along reversible, deterministic scroll paths. */
export class SpeakerLayerScene {
  private context: CanvasRenderingContext2D;
  private atlas = new Image();
  private ring = new Image();
  private observer: ResizeObserver;
  private ready = false;
  private disposed = false;
  private frame = 0;
  private target = 0;
  private progress = 0;
  private previousTime = 0;
  private reducedMotion = matchMedia('(prefers-reduced-motion: reduce)').matches;
  private visibilityHandler = () => {
    if (document.hidden) { cancelAnimationFrame(this.frame); this.frame = 0; }
    else this.schedule();
  };

  constructor(private canvas: HTMLCanvasElement) {
    const context = canvas.getContext('2d', { alpha: true });
    if (!context) throw new Error('The speaker view needs Canvas 2D.');
    this.context = context;
    this.observer = new ResizeObserver(() => this.schedule());
    this.observer.observe(canvas);
    document.addEventListener('visibilitychange', this.visibilityHandler);
    const load = (image: HTMLImageElement, src: string) => new Promise<void>((resolve, reject) => {
      image.onload = () => resolve();
      image.onerror = () => reject(new Error(`Speaker image unavailable: ${src}`));
      image.src = src;
    });
    const base = new URL('./', document.baseURI).href;
    Promise.all([load(this.atlas, `${base}speaker/parts.png`), load(this.ring, `${base}speaker/trim-ring.png`)])
      .then(() => {
        if (this.disposed) return;
        this.ready = true;
        canvas.dataset.ready = 'true';
        this.schedule();
      })
      .catch(error => {
        if (this.disposed) return;
        console.error(error);
        canvas.dataset.failed = 'true';
      });
  }

  /** Maps scroll to one stable pose; the same value always yields the same arrangement. */
  setProgress(value: number) {
    const next = clamp(Number.isFinite(value) ? value : 0);
    if (next === this.target) return;
    this.target = next;
    this.schedule();
  }

  private schedule() {
    if (this.frame || this.disposed || document.hidden || !this.ready) return;
    this.previousTime = performance.now();
    this.frame = requestAnimationFrame(this.tick);
  }

  private tick = (time: number) => {
    this.frame = 0;
    if (this.disposed || document.hidden) return;
    const dt = Math.min(.05, Math.max(0, (time - this.previousTime) / 1000));
    this.previousTime = time;
    this.progress = this.reducedMotion ? this.target : this.progress + (this.target - this.progress) * (1 - Math.exp(-dt * 14));
    if (Math.abs(this.progress - this.target) < .0002) this.progress = this.target;
    this.draw();
    if (this.progress !== this.target) this.frame = requestAnimationFrame(this.tick);
  };

  private draw() {
    const { width, height } = this.canvas.getBoundingClientRect();
    if (!width || !height) return;
    const dpr = Math.min(devicePixelRatio || 1, 1.7);
    const pixelWidth = Math.round(width * dpr), pixelHeight = Math.round(height * dpr);
    if (this.canvas.width !== pixelWidth || this.canvas.height !== pixelHeight) {
      this.canvas.width = pixelWidth;
      this.canvas.height = pixelHeight;
    }
    const context = this.context;
    context.setTransform(dpr, 0, 0, dpr, 0, 0);
    context.clearRect(0, 0, width, height);
    context.imageSmoothingEnabled = true;
    context.imageSmoothingQuality = 'high';
    const opening = smooth(.10, .88, this.progress);
    const covers = smooth(0, .68, opening);
    const rings = smooth(.22, .92, opening);
    const plinth = smooth(.12, 1, opening);
    const lift = 60 * (1 - plinth);
    const scale = Math.min((height - 170) / 965, width * .51 / 790);
    const centerX = width * .735;
    const floor = Math.min(height * .91, height - 40);
    const originX = centerX - 835 * scale, originY = floor - 923 * scale;
    context.save();
    context.translate(originX, originY);
    context.scale(scale, scale);
    const shadow = context.createRadialGradient(835, 919, 5, 835, 919, 230);
    shadow.addColorStop(0, '#00000024'); shadow.addColorStop(1, '#00000000');
    context.save(); context.translate(0, 919); context.scale(1, .13); context.translate(0, -919);
    context.fillStyle = shadow; context.fillRect(590, 680, 490, 480); context.restore();

    const part = (rect: Rect, x: number, y: number, sx = 1) => {
      context.drawImage(this.atlas, ...rect, x, y, rect[2] * sx, rect[3]);
    };
    // Bottom plate is the fixed floor anchor. Other plates retract into the assembly.
    BASES.forEach((rect, i) => part(rect, rect[0], rect[1] + i * 25 * (1 - plinth)));
    const panel = (item: Part) => {
      const rowShift = item.y < 274 ? -30 * opening : item.y < 528 ? -12 * opening : 0;
      part(item.source, item.closedX + item.spreadX * covers, item.y + lift + rowShift, item.widthScale);
    };
    PANELS.filter(item => item.depth === -1).forEach(panel);
    BODIES.forEach((rect, i) => part(rect, rect[0], rect[1] + lift - (2 - i) * 15 * opening));
    PANELS.filter(item => item.depth !== -1).forEach(panel);
    RINGS.forEach((ring, i) => {
      const size = ring.size * (1 + rings * .06);
      const y = ring.y + lift - (2 - i) * 15 * opening + rings * 18;
      // Crop only the atlas padding at render time; the photographic PNG is unchanged.
      context.globalAlpha = smooth(0, .12, rings);
      context.drawImage(this.ring, 62, 62, 1130, 1130, ring.x + ring.shift * rings, y, size, size);
    });
    context.globalAlpha = 1;
    context.restore();
    this.canvas.dataset.pose = opening > .999 ? 'exploded' : opening < .001 ? 'assembled' : 'moving';
  }

  /** Releases observers and the animation request when the React scene unmounts. */
  dispose() {
    this.disposed = true;
    cancelAnimationFrame(this.frame);
    this.observer.disconnect();
    document.removeEventListener('visibilitychange', this.visibilityHandler);
    this.atlas.onload = this.atlas.onerror = this.ring.onload = this.ring.onerror = null;
  }
}
