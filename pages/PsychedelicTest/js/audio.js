const AUDIO = {
  // Shared AudioContext & nodes
  ctx: null,
  analyser: null,
  mixerGain: null,

  // Oscillator nodes
  osc: null, oscGain: null, lfo: null, lfoGain: null,
  oscStarted: false,
  oscUpdateInterval: null,

  // Mic nodes
  micSource: null, micGain: null, micStream: null,
  micStarted: false,

  // File playback nodes
  fileSource: null, fileGain: null,
  fileLoaded: false, filePlaying: false,
  fileName: '',

  // Frequency data arrays (reused each frame)
  _freqData: null,
  _timeData: null,

  // Visualizers (Panel canvas & On-screen HUD canvas)
  _canvases: [],

  // ─── AudioContext management ───

  ensureContext() {
    if (this.ctx && this.ctx.state !== 'closed') {
      if (this.ctx.state === 'suspended') this.ctx.resume();
      return;
    }
    this.ctx = new (window.AudioContext || window.webkitAudioContext)();

    // Shared analyser
    this.analyser = this.ctx.createAnalyser();
    this.analyser.fftSize = 2048;
    this.analyser.smoothingTimeConstant = 0.75;

    // Mixer gain → analyser → destination
    this.mixerGain = this.ctx.createGain();
    this.mixerGain.gain.value = 1.0;
    this.mixerGain.connect(this.analyser);
    this.analyser.connect(this.ctx.destination);

    // Pre-allocate typed arrays
    this._freqData = new Uint8Array(this.analyser.frequencyBinCount);
    this._timeData = new Uint8Array(this.analyser.frequencyBinCount);

    // Start analysis loop
    this._startAnalysisLoop();
  },

  // ─── Oscillator (synth) ───

  startOsc() {
    if (this.oscStarted) return;
    try {
      this.ensureContext();

      const freq = CFG.oscFreq || 55;
      const type = CFG.oscWaveform || 'sine';
      const lfoRate = CFG.lfoRate || 0.3;
      const vol = CFG.oscVolume || 0.15;

      this.osc = this.ctx.createOscillator();
      this.osc.type = type;
      this.osc.frequency.setValueAtTime(freq, this.ctx.currentTime);

      this.oscGain = this.ctx.createGain();
      this.oscGain.gain.setValueAtTime(vol, this.ctx.currentTime);

      this.lfo = this.ctx.createOscillator();
      this.lfo.type = 'sine';
      this.lfo.frequency.setValueAtTime(lfoRate, this.ctx.currentTime);
      this.lfoGain = this.ctx.createGain();
      this.lfoGain.gain.setValueAtTime(vol * 0.8, this.ctx.currentTime);

      this.lfo.connect(this.lfoGain);
      this.lfoGain.connect(this.oscGain.gain);

      this.osc.connect(this.oscGain);
      this.oscGain.connect(this.mixerGain);

      this.osc.start();
      this.lfo.start();
      this.oscStarted = true;

      this.oscUpdateInterval = setInterval(() => this.updateOsc(), 100);
    } catch (e) { console.warn('Audio oscillator failed:', e); }
  },

  updateOsc() {
    if (!this.oscStarted || !this.ctx || !this.osc || !this.lfo) return;

    const freq = CFG.oscFreq || 55;
    const type = CFG.oscWaveform || 'sine';
    const lfoRate = CFG.lfoRate || 0.3;
    const vol = CFG.oscVolume || 0.15;

    this.osc.type = type;
    this.osc.frequency.setTargetAtTime(freq, this.ctx.currentTime, 0.1);
    this.lfo.frequency.setTargetAtTime(lfoRate, this.ctx.currentTime, 0.1);
    if (this.oscGain) this.oscGain.gain.setTargetAtTime(vol, this.ctx.currentTime, 0.1);
    if (this.lfoGain) this.lfoGain.gain.setTargetAtTime(vol * 0.8, this.ctx.currentTime, 0.1);
  },

  stopOsc() {
    if (!this.oscStarted) return;
    if (this.oscUpdateInterval) {
      clearInterval(this.oscUpdateInterval);
      this.oscUpdateInterval = null;
    }
    try {
      if (this.osc) { this.osc.stop(); this.osc.disconnect(); }
      if (this.lfo) { this.lfo.stop(); this.lfo.disconnect(); }
      if (this.oscGain) this.oscGain.disconnect();
      if (this.lfoGain) this.lfoGain.disconnect();
    } catch (e) {}
    this.osc = null; this.lfo = null;
    this.oscGain = null; this.lfoGain = null;
    this.oscStarted = false;
  },

  // ─── Microphone ───

  async startMic() {
    if (this.micStarted) return;
    try {
      this.ensureContext();
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      this.micSource = this.ctx.createMediaStreamSource(stream);
      this.micGain = this.ctx.createGain();
      this.micGain.gain.value = 1.0;

      this.micSource.connect(this.micGain);
      this.micGain.connect(this.mixerGain);

      this.micStream = stream;
      this.micStarted = true;
    } catch (e) { console.warn('Mic access denied:', e); }
  },

  stopMic() {
    if (this.micStream) {
      this.micStream.getTracks().forEach(t => t.stop());
      this.micStream = null;
    }
    if (this.micSource) { try { this.micSource.disconnect(); } catch(e){} }
    if (this.micGain) { try { this.micGain.disconnect(); } catch(e){} }
    this.micSource = null;
    this.micGain = null;
    this.micStarted = false;
  },

  // ─── Audio File Loading & Playback ───

  loadFile(file) {
    if (!file) return;
    this.ensureContext();

    const audioEl = document.getElementById('audioPlayer');
    if (!audioEl) return;

    this.stopFile();

    const url = URL.createObjectURL(file);
    audioEl.src = url;
    audioEl.load();

    this.fileName = file.name;
    this.fileLoaded = true;

    // MediaElementSource can only be created ONCE per audio element
    if (!this.fileSource) {
      this.fileSource = this.ctx.createMediaElementSource(audioEl);
      this.fileGain = this.ctx.createGain();
      this.fileSource.connect(this.fileGain);
      this.fileGain.connect(this.mixerGain);
    }
    this.fileGain.gain.value = CFG.audioFileVolume;

    this._updateNowPlaying();
  },

  playFile() {
    const audioEl = document.getElementById('audioPlayer');
    if (!audioEl || !this.fileLoaded) return;
    this.ensureContext();
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
    if (this.fileGain) this.fileGain.gain.value = CFG.audioFileVolume;
    audioEl.play().catch(e => console.warn('Playback failed:', e));
    this.filePlaying = true;
    this._updateNowPlaying();
  },

  pauseFile() {
    const audioEl = document.getElementById('audioPlayer');
    if (!audioEl) return;
    audioEl.pause();
    this.filePlaying = false;
    this._updateNowPlaying();
  },

  stopFile() {
    const audioEl = document.getElementById('audioPlayer');
    if (!audioEl) return;
    audioEl.pause();
    audioEl.currentTime = 0;
    this.filePlaying = false;
    this._updateNowPlaying();
  },

  updateFileVolume() {
    if (this.fileGain && this.ctx) {
      this.fileGain.gain.setTargetAtTime(CFG.audioFileVolume, this.ctx.currentTime, 0.05);
    }
  },

  _updateNowPlaying() {
    const nameEl = document.getElementById('np-name');
    const timeEl = document.getElementById('np-time');
    const iconEl = document.getElementById('np-icon');
    const wrapEl = document.getElementById('now-playing');
    if (!nameEl) return;

    if (this.fileLoaded) {
      nameEl.textContent = this.fileName || 'Unknown';
      wrapEl?.classList.toggle('idle', !this.filePlaying);
      if (iconEl) iconEl.textContent = this.filePlaying ? '🎵' : '⏸️';
    } else {
      nameEl.textContent = 'No file loaded';
      if (timeEl) timeEl.textContent = '';
      wrapEl?.classList.add('idle');
      if (iconEl) iconEl.textContent = '🎶';
    }
  },

  // ─── Per-frame Spectral Analysis Loop ───

  _startAnalysisLoop() {
    const loop = () => {
      this._analysisRaf = requestAnimationFrame(loop);

      if (!this.analyser || !this._freqData) return;

      this.analyser.getByteFrequencyData(this._freqData);
      this.analyser.getByteTimeDomainData(this._timeData);

      Psy.audioFreqData = this._freqData;
      Psy.audioTimeData = this._timeData;

      const bins = this._freqData;
      const len = bins.length; // 1024

      // Bass: bins 0-10 (~0-215 Hz)
      let bassSum = 0;
      const bassEnd = Math.min(11, len);
      for (let i = 0; i < bassEnd; i++) bassSum += bins[i];
      const rawBass = bassSum / (bassEnd * 255);

      // Mids: bins 10-80 (~215-1720 Hz)
      let midSum = 0;
      const midStart = Math.min(10, len), midEnd = Math.min(80, len);
      for (let i = midStart; i < midEnd; i++) midSum += bins[i];
      const rawMid = midSum / ((midEnd - midStart) * 255);

      // High: bins 80-300 (~1720-6450 Hz)
      let highSum = 0;
      const highStart = Math.min(80, len), highEnd = Math.min(300, len);
      for (let i = highStart; i < highEnd; i++) highSum += bins[i];
      const rawHigh = highSum / ((highEnd - highStart) * 255);

      // Treble: bins 300+ (~6450+ Hz)
      let trebleSum = 0;
      const trebleStart = Math.min(300, len);
      for (let i = trebleStart; i < len; i++) trebleSum += bins[i];
      const rawTreble = (len > trebleStart) ? trebleSum / ((len - trebleStart) * 255) : 0;

      let totalSum = 0;
      for (let i = 0; i < len; i++) totalSum += bins[i];
      const rawLevel = totalSum / (len * 255);

      Psy.audioBass   = rawBass   * (CFG.audioBassGain   || 1);
      Psy.audioMid    = rawMid    * (CFG.audioMidGain    || 1);
      Psy.audioHigh   = rawHigh   * (CFG.audioHighGain   || 1);
      Psy.audioTreble = rawTreble * (CFG.audioTrebleGain || 1);
      Psy.audioLevel  = rawLevel;

      const audioEl = document.getElementById('audioPlayer');
      const timeEl = document.getElementById('np-time');
      if (audioEl && timeEl && this.filePlaying && !isNaN(audioEl.duration)) {
        const fmt = (s) => {
          const m = Math.floor(s / 60);
          const sec = Math.floor(s % 60);
          return m + ':' + (sec < 10 ? '0' : '') + sec;
        };
        timeEl.textContent = fmt(audioEl.currentTime) + ' / ' + fmt(audioEl.duration);
      }
    };
    loop();
  },

  // ─── Dual Visualizer Drawing (Panel + On-Screen HUD) ───

  addVisualizerCanvas(canvas) {
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    this._canvases.push({ canvas, ctx });
    this.resizeCanvases();
    this._startVizLoop();
  },

  resizeCanvases() {
    this._canvases.forEach(item => {
      const c = item.canvas;
      c.width = c.clientWidth * (window.devicePixelRatio > 1 ? 2 : 1);
      c.height = c.clientHeight * (window.devicePixelRatio > 1 ? 2 : 1);
    });
  },

  _startVizLoop() {
    if (this._vizLoopActive) return;
    this._vizLoopActive = true;

    window.addEventListener('resize', () => this.resizeCanvases());

    const draw = () => {
      this._vizRaf = requestAnimationFrame(draw);

      const onScreenWrap = document.getElementById('web-viz-container');
      if (onScreenWrap) {
        onScreenWrap.classList.toggle('hidden', !CFG.toggles.vizEnabled);
      }

      if (!CFG.toggles.vizEnabled) return;

      const vizType = CFG.vizType || 'bars';
      const time = Date.now() * 0.001;

      this._canvases.forEach(item => {
        const canvas = item.canvas;
        const ctx = item.ctx;
        if (!canvas || !ctx || canvas.width === 0) return;

        const w = canvas.width;
        const h = canvas.height;
        ctx.clearRect(0, 0, w, h);

        if (vizType === 'bars' || vizType === 'both') {
          this._drawBars(ctx, w, h, time);
        }
        if (vizType === 'waveform' || vizType === 'both') {
          this._drawWaveform(ctx, w, h, time);
        }
      });
    };
    draw();
  },

  _drawBars(ctx, w, h, time) {
    const bins = this._freqData;
    const barCount = 64;
    const barW = w / barCount;
    const gap = Math.max(1.5, barW * 0.15);

    // Active musical spectrum is bins 0..512
    const maxBinIndex = bins ? Math.min(512, bins.length) : 0;

    for (let i = 0; i < barCount; i++) {
      let val = 0;
      if (bins && (this.filePlaying || this.oscStarted || this.micStarted)) {
        // Curved bin mapping: low bars get dense bass, high bars get wider treble
        const startBin = Math.floor(Math.pow(i / barCount, 1.4) * maxBinIndex);
        const endBin = Math.min(maxBinIndex, Math.floor(Math.pow((i + 1) / barCount, 1.4) * maxBinIndex) + 1);
        let sum = 0, count = 0;
        for (let b = startBin; b < endBin; b++) { sum += bins[b]; count++; }
        val = count > 0 ? (sum / (count * 255)) : 0;
      } else {
        // Idle gentle breathing wave
        val = 0.05 + Math.sin(time * 3 + i * 0.2) * 0.03;
      }

      const barH = Math.max(3, val * h * 0.88);
      const hue = (i / barCount * 300 + time * 60) % 360;
      const sat = 85 + val * 15;
      const lum = 45 + val * 25;

      ctx.shadowBlur = val * 12;
      ctx.shadowColor = `hsla(${hue}, ${sat}%, ${lum}%, 0.8)`;

      const grad = ctx.createLinearGradient(0, h, 0, h - barH);
      grad.addColorStop(0, `hsla(${hue}, ${sat}%, ${lum * 0.4}%, 0.85)`);
      grad.addColorStop(0.5, `hsla(${hue}, ${sat}%, ${lum}%, 0.9)`);
      grad.addColorStop(1, `hsla(${(hue + 45) % 360}, 100%, ${lum + 20}%, 0.98)`);

      ctx.fillStyle = grad;
      ctx.fillRect(i * barW + gap / 2, h - barH, barW - gap, barH);
    }
    ctx.shadowBlur = 0;
  },

  _drawWaveform(ctx, w, h, time) {
    const data = this._timeData;
    const mid = h / 2;
    const isActive = this.filePlaying || this.oscStarted || this.micStarted;

    ctx.beginPath();
    ctx.lineWidth = 2.5;

    for (let x = 0; x < w; x++) {
      let val = 0;
      if (data && isActive) {
        // Exact 1-to-1 canvas width to sample array mapping
        const idx = Math.floor((x / w) * data.length);
        const sample = data[idx] !== undefined ? data[idx] : 128;
        val = (sample - 128) / 128.0; // -1 to 1
      } else {
        // Idle smooth wave
        val = Math.sin(x * 0.03 + time * 4) * 0.08;
      }

      const y = mid + val * mid * 0.85;

      if (x === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    }

    const hue = (time * 50) % 360;
    ctx.strokeStyle = `hsla(${hue}, 95%, 70%, 0.85)`;
    ctx.shadowBlur = 10;
    ctx.shadowColor = `hsla(${hue}, 100%, 60%, 0.7)`;
    ctx.stroke();
    ctx.shadowBlur = 0;
  }
};
