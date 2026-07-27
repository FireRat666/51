const Psy = {
  canvas: null, ctx: null, w: 0, h: 0, cx: 0, cy: 0,
  time: 0, hueShift: 0, hue: 0, paused: false,
  mouseX: -1, mouseY: -1, touchPoints: [],
  audioLevel: 0, _trailDots: [],
  // Per-band audio scalars (written by AUDIO._startAnalysisLoop)
  audioBass: 0, audioMid: 0, audioHigh: 0, audioTreble: 0,
  audioFreqData: null, audioTimeData: null,
  // Smoothed values for visual modulation (to avoid jitter)
  _sBass: 0, _sMid: 0, _sHigh: 0, _sTreble: 0,

  init() {
    this.canvas = document.getElementById('c');
    this.ctx = this.canvas.getContext('2d');
    this.resize();
    window.addEventListener('resize', () => this.resize());
    document.addEventListener('mousemove', e => { this.mouseX = e.clientX; this.mouseY = e.clientY; });
    document.addEventListener('touchstart', e => this.handleTouch(e), { passive: false });
    document.addEventListener('touchmove', e => this.handleTouch(e), { passive: false });
    document.addEventListener('touchend', () => { this.touchPoints = []; });
    requestAnimationFrame(t => this.animate(t));
  },

  resize() {
    this.w = this.canvas.width = window.innerWidth;
    this.h = this.canvas.height = window.innerHeight;
    this.cx = this.w / 2; this.cy = this.h / 2;
  },

  handleTouch(e) {
    e.preventDefault();
    this.touchPoints = [];
    for (let i = 0; i < e.touches.length; i++)
      this.touchPoints.push({ x: e.touches[i].clientX, y: e.touches[i].clientY });
    if (this.touchPoints.length > 0) {
      this.mouseX = this.touchPoints[0].x;
      this.mouseY = this.touchPoints[0].y;
    }
  },

  hsl(h, s, l, a = 1) {
    return `hsla(${(h + this.hueShift) % 360}, ${s}%, ${l}%, ${a})`;
  },

  animate(ts) {
    if (this.paused) { requestAnimationFrame(t => this.animate(t)); return; }
    const t = this.time;
    let spd = CFG.speed;
    let colorSpd = CFG.colorSpeed;
    const ctx = this.ctx;

    // ─── Rich per-band audio reactivity ───
    if (CFG.toggles.audioReactive) {
      // Smooth band values (exponential moving average, prevents jitter)
      const sm = 0.3; // smoothing factor (0=instant, 1=no change)
      this._sBass   = this._sBass   * sm + this.audioBass   * (1 - sm);
      this._sMid    = this._sMid    * sm + this.audioMid    * (1 - sm);
      this._sHigh   = this._sHigh   * sm + this.audioHigh   * (1 - sm);
      this._sTreble = this._sTreble * sm + this.audioTreble * (1 - sm);

      const bass   = this._sBass;
      const mid    = this._sMid;
      const high   = this._sHigh;
      const treble = this._sTreble;

      // BASS → screen shake intensity, background trail reduction (longer trails on hits)
      if (bass > 0.01) {
        CFG._audioBgFadeMod = Math.max(0.01, CFG.bgFade - bass * 0.08);
        if (CFG.toggles.screenShake) {
          const shakeAmt = bass * CFG.screenShakeIntensity * 1.5;
          document.body.style.transform = `translate(${(Math.random()-0.5)*shakeAmt}px, ${(Math.random()-0.5)*shakeAmt}px)`;
        }
      } else {
        CFG._audioBgFadeMod = CFG.bgFade;
        if (CFG.toggles.screenShake && bass < 0.005) {
          document.body.style.transform = '';
        }
      }

      // LOW-MIDS → speed boost, hue shift acceleration, mode warp
      spd *= (1 + mid * 3.0);
      colorSpd *= (1 + mid * 4.0);
      this.hueShift += mid * 8;

      // MIDS → glow intensity modulation
      // (temporary boost, doesn't permanently modify CFG)
      this._audioGlowBoost = mid * 40;

      // HIGHS → chromatic aberration boost, particle size pulse, flicker rate boost
      this._audioChromBoost = high * 15;
      this._audioParticleSizeBoost = high * 5;
      this._audioFlickerBoost = high * 0.1;

      // TREBLE → star twinkle speed, additional sparkle
      this._audioStarSpeedBoost = treble * 3;
    } else {
      // No audio modulation — clear transient values
      CFG._audioBgFadeMod = CFG.bgFade;
      this._audioGlowBoost = 0;
      this._audioChromBoost = 0;
      this._audioParticleSizeBoost = 0;
      this._audioFlickerBoost = 0;
      this._audioStarSpeedBoost = 0;
    }

    ctx.globalCompositeOperation = 'source-over';
    ctx.shadowBlur = 0;
    ctx.fillStyle = `rgba(0,0,0,${CFG._audioBgFadeMod || CFG.bgFade})`;
    ctx.fillRect(0, 0, this.w, this.h);

    ctx.globalCompositeOperation = 'lighter';
    this.hue += colorSpd * spd;

    if (CFG.toggles.stars) drawStars(ctx, t, spd, this);
    if (CFG.toggles.breathing) drawBreathing(ctx, t, spd, this);

    if (!CFG.modeOff) {
      switch (CFG.mode) {
        case 0: drawFractalMandala(ctx, t, spd, this); break;
        case 1: drawWaveTunnel(ctx, t, spd, this); break;
        case 2: drawFluidCosmos(ctx, t, spd, this); break;
        case 3: drawGeoTrippy(ctx, t, spd, this); break;
        case 4: drawPlasmaField(ctx, t, spd, this); break;
        case 5: drawSpiralGalaxy(ctx, t, spd, this); break;
        case 6: drawSacredGeometry(ctx, t, spd, this); break;
        case 7: drawDigitalRain(ctx, t, spd, this); break;
      }
    }

    if (CFG.toggles.warp) drawWarpTunnel(ctx, t, spd, this);
    if (CFG.toggles.grid) drawNeonGrid(ctx, t, spd, this);
    if (CFG.toggles.flicker) drawFlickerGrid(ctx, t, spd, this);
    if (CFG.toggles.chromatic && CFG.toggles.particles) drawChromaticAberration(ctx, t, this);

    if (CFG.toggles.particles) {
      updateParticles(t, spd, this);
      drawParticles(ctx, this);
      if (CFG.toggles.connections) drawConnections(ctx, this);
      if (CFG.toggles.trails) drawTrails(ctx, this);
    }
    if (CFG.toggles.emoji) drawEmojiRain(ctx, t, spd, this);

    ctx.globalCompositeOperation = 'source-over';
    if (CFG.toggles.vignette) drawVignette(ctx, this);

    this.time += 0.016 * spd;
    requestAnimationFrame(t2 => this.animate(t2));
  }
};
