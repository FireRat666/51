function toggleFullscreen() {
  if (!document.fullscreenElement) document.documentElement.requestFullscreen().catch(() => {});
  else if (document.exitFullscreen) document.exitFullscreen();
}

const UI = {
  init() {
    this.buildPanel();
    this.bindEvents();
    this.initTooltipSystem();
    this.loadState();
    this.updateAll();
  },

  initTooltipSystem() {
    const tooltipEl = document.getElementById('custom-tooltip');
    if (!tooltipEl) return;

    let activeTarget = null;

    const getTooltipText = (el) => {
      if (!el || el === document.body) return null;
      let target = el.closest('[data-tooltip], [title]');
      if (!target || target.closest('#c') || target.closest('.css-wrap')) return null;
      
      if (target.hasAttribute('title')) {
        const text = target.getAttribute('title');
        if (text) {
          target.setAttribute('data-tooltip', text);
          target.removeAttribute('title');
        }
      }
      return { el: target, text: target.getAttribute('data-tooltip') };
    };

    document.addEventListener('mouseover', e => {
      const info = getTooltipText(e.target);
      if (info && info.text) {
        activeTarget = info.el;
        tooltipEl.textContent = info.text;
        tooltipEl.classList.add('visible');
      }
    });

    document.addEventListener('mousemove', e => {
      if (activeTarget && tooltipEl.classList.contains('visible')) {
        const x = Math.min(e.clientX + 15, window.innerWidth - 270);
        const y = Math.min(e.clientY + 15, window.innerHeight - 80);
        tooltipEl.style.left = x + 'px';
        tooltipEl.style.top = y + 'px';
      }
    });

    document.addEventListener('mouseout', e => {
      if (activeTarget && (!e.relatedTarget || !activeTarget.contains(e.relatedTarget))) {
        activeTarget = null;
        tooltipEl.classList.remove('visible');
      }
    });
  },

  modeParams: {
    0: ['modeArms', 'modeLayers', 'modeWarp'],
    1: ['modeRings', 'modeSegments', 'modeDistortion', 'modeDistSpeed'],
    2: ['modeBlobs', 'modeSwirls'],
    3: ['modeGeoLayers'],
    4: ['modePlasmaRes'],
    5: ['modeSpiralArms', 'modeSpiralTightness', 'modeSpiralStars'],
    6: ['modeSacredLayers', 'modeSacredSymmetry'],
    7: ['modeRainColumns', 'modeRainSpeed', 'modeRainDensity']
  },

  paramMeta: {
    modeArms:            ['Arms',        1, 20,  1,   '',   'Number of symmetry arms/petals in the mandala'],
    modeLayers:          ['Layers',      1, 20,  1,   '',   'Concentric depth layers of the mandala'],
    modeWarp:            ['Orbit Warp',  0, 1,   0.05,'',   'Rotational warp factor applied to mandala arms'],
    modeRings:           ['Rings',       1, 100, 1,   '',   'Total concentric wave rings in the tunnel'],
    modeSegments:        ['Segments',    1, 36,  1,   '',   'Number of geometric side segments per ring'],
    modeDistortion:      ['Distortion',  1, 80,  1,   'px', 'Amplitude of wave distortion applied to rings'],
    modeDistSpeed:       ['Wave Speed',  1, 12,  1,   '',   'Oscillation speed of ring distortion waves'],
    modeBlobs:           ['Blobs',       1, 50,  1,   '',   'Number of fluid cosmic metablobs floating around'],
    modeSwirls:          ['Swirls',      1, 24,  1,   '',   'Spiral swirl arms originating from fluid blobs'],
    modeGeoLayers:       ['Geo Layers',  1, 20,  1,   '',   'Number of nested rotating polygon layers'],
    modePlasmaRes:       ['Resolution',  1, 30,  1,   'px', 'Pixel size resolution for plasma grid evaluation'],
    modeSpiralArms:      ['Arms',        1, 12,  1,   '',   'Logarithmic spiral galaxy arms count'],
    modeSpiralTightness: ['Tightness',   1, 10,  1,   '',   'Tightness of the galaxy arm spiral curvature'],
    modeSpiralStars:     ['Stars',       10,500, 10,  '',   'Number of star particles rendered in galaxy arms'],
    modeSacredLayers:    ['Layers',      1, 12,  1,   '',   'Number of concentric Flower of Life geometry layers'],
    modeSacredSymmetry:  ['Symmetry',    1, 12,  1,   '',   'Symmetry order for Metatrons Cube connections'],
    modeRainColumns:     ['Columns',     1, 80,  1,   '',   'Number of vertical Matrix digital rain code columns'],
    modeRainSpeed:       ['Speed',       1, 10,  1,   '',   'Fall speed of digital rain characters'],
    modeRainDensity:     ['Density',     0.1, 1, 0.05,'',   'Density of falling code trails per column']
  },

  fmtVal(val, step, suffix) {
    suffix = suffix || '';
    const n = parseFloat(val);
    const d = step >= 1 ? 0 : step >= 0.1 ? 1 : 2;
    return n.toFixed(d) + suffix;
  },

  sliderHTML(id, label, min, max, step, val, suffix, tooltip) {
    suffix = suffix || '';
    tooltip = tooltip || label;
    return `<div class="ctrl-row" title="${tooltip}"><label>${label}</label><span class="val" id="val-${id}">${this.fmtVal(val, step, suffix)}</span></div><input type="range" id="sl-${id}" min="${min}" max="${max}" step="${step}" value="${val}" data-suffix="${suffix}" title="${tooltip}">`;
  },

  buildPanel() {
    const panel = document.getElementById('controls-panel');
    let html = `<div class="panel-header">
      <h2 title="Psychedelic Universe Controls Panel">Psychedelic Controls</h2>
      <div class="header-actions">
        <button class="icon-btn" id="btn-pause" title="Pause or Resume visual animation loop">⏸</button>
        <button class="icon-btn" id="btn-fullscreen" title="Toggle Fullscreen display mode">⛶</button>
        <button class="close-btn" title="Close control panel">&times;</button>
      </div>
    </div>`;

    // 1. Visual Mode Section
    html += `<div class="section" title="Select primary visual animation engine mode">
      <div class="ctrl-row"><label>Visual Mode</label>
      <label class="toggle-item" title="Turn off main visual mode rendering completely"><input type="checkbox" id="tog-modeOff"><span>Off</span></label></div>
      <div class="mode-grid">`;
    const modeTooltips = [
      'Fractal Mandala: Synchronized rotating geometric mandalas',
      'Wave Tunnel: Hypnotic tunnel of pulsating concentric wave rings',
      'Fluid Cosmos: Organic liquid metablobs and spiral energy swirls',
      'Geo Trippy: Nested rotating multi-sided polygons with shadow glows',
      'Plasma Field: Mathematical wave plasma interference grid',
      'Spiral Galaxy: Logarithmic spiral arms with star clusters & dust clouds',
      'Sacred Geometry: Metatron\'s Cube & Flower of Life sacred patterns',
      'Digital Rain: Matrix-style falling katakana code streams'
    ];
    CFG.modeNames.forEach((name, i) => {
      html += `<button class="mode-btn" data-mode="${i}" title="${modeTooltips[i]}">${name}</button>`;
    });
    html += `</div></div>`;

    // Mode params
    html += `<div class="section"><details id="mode-params-details" open><summary title="Fine-tune parameters specific to the selected active visual mode">Mode Parameters</summary><div id="mode-params"></div></details></div>`;

    // 2. MASTER TOGGLE MATRIX
    html += `<div class="section"><details open><summary title="Instantly toggle individual visual effects on or off">⚡ Master Effects Matrix (Individual On/Off)</summary>
      <div style="display:flex;gap:6px;margin-bottom:10px">
        <button class="action-btn secondary" id="btn-allOn" style="padding:6px;font-size:0.7rem" title="Turn ON all visual effects simultaneously">Turn ALL On</button>
        <button class="action-btn secondary" id="btn-allOff" style="padding:6px;font-size:0.7rem" title="Turn OFF all visual effects simultaneously">Turn ALL Off</button>
      </div>
      <div class="toggle-grid">`;
    const masterToggles = {
      particles:['Particles', 'Flowing canvas particles'],
      connections:['Particle Connect', 'Connecting web lines between nearby particles'],
      trails:['Particle Trails', 'Glowing motion trails left behind particles'],
      stars:['Stars', 'Twinkling background starfield'],
      warp:['Warp Tunnel', 'Canvas warp tunnel overlay'],
      grid:['Neon Grid', 'Scrolling perspective neon grid'],
      flicker:['Flicker Grid', 'Random flickering color grid cells'],
      vignette:['Vignette', 'Radial shadow border overlay'],
      chromatic:['Chromatic Split', 'RGB chromatic aberration color separation'],
      breathing:['Breathing Glow', 'Pulsating background aura circles'],
      orbs:['Floating Orbs', 'Drifting blurred ambient gradient color orbs'],
      rings:['Rot Rings', 'Spinning concentric CSS rings with color cycling'],
      beams:['Light Beams', 'Vertical flashing laser light beams'],
      cssShapes:['CSS Shapes', 'Floating geometric CSS polygons'],
      kaleidoscope:['Kaleidoscope', 'Conic gradient kaleidoscope circles'],
      cursorTrail:['Cursor Trail', 'Glow trail following mouse movements'],
      clickBurst:['Click Burst', 'Particle explosion burst on click'],
      ripples:['Ripples', 'Expanding water ripple ring on click'],
      screenFlash:['Screen Flash', 'White screen strobe flash on click'],
      screenShake:['Screen Shake', 'Glitch screen shake distortion'],
      glitchText:['Text Glitch', 'Cyberpunk glitch text overlay'],
      emoji:['Emoji Rain', 'Falling psychedelic emoji streams'],
      gridOverlay:['Grid Mesh', 'Fixed perspective grid mesh background overlay'],
      mandala:['CSS Mandala', 'Rainbow CSS mandala flower pattern'],
      webgl:['3D Shader Layer', 'Three.js 3D WebGL shader overlay layer'],
      audioReactive:['Audio Reactivity', 'Modulate visuals dynamically based on audio level']
    };
    Object.keys(masterToggles).forEach(key => {
      const item = masterToggles[key];
      html += `<label class="toggle-item" title="${item[1]}"><input type="checkbox" data-toggle="${key}" ${CFG.toggles[key]?'checked':''}><span>${item[0]}</span></label>`;
    });
    html += `</div></details></div>`;

    // 3. Global Speed & Motion
    html += `<div class="section"><h3>Speed &amp; Motion</h3>`;
    html += this.sliderHTML('speed', 'Global Speed', 0.1, 5, 0.1, CFG.speed, 'x', 'Global animation time multiplier');
    html += this.sliderHTML('colorSpeed', 'Color Cycle', 0.1, 5, 0.1, CFG.colorSpeed, 'x', 'Speed of continuous rainbow HSL color hue shifting');
    html += this.sliderHTML('bgFade', 'Trail Decay', 0.01, 0.6, 0.01, CFG.bgFade, '', 'Canvas background clearing opacity (lower = longer motion trails)');
    html += this.sliderHTML('chaos', 'Chaos Level', 0, 100, 1, CFG.chaos, '%', 'Randomness factor applied to positions, motion, and distortions');
    html += `</div>`;

    // 4. Colors & Atmosphere
    html += `<div class="section"><h3>Colors &amp; Atmosphere</h3>`;
    html += this.sliderHTML('intensity', 'Color Intensity', 0, 100, 1, CFG.intensity, '%', 'Color saturation and brightness multiplier');
    html += this.sliderHTML('glowIntensity', 'Glow Strength', 0, 100, 1, CFG.glowIntensity, '%', 'Shadow blur glow radius applied to visual elements');
    html += `<div class="ctrl-row" title="Select curated color palette scheme"><label>Color Scheme</label><select id="sel-colorScheme" title="Select color scheme">
      <option value="neon">Neon</option><option value="pastel">Pastel</option>
      <option value="fire">Fire</option><option value="ocean">Ocean</option>
      <option value="forest">Forest</option><option value="acid">Acid</option>
      <option value="rainbow">Rainbow</option><option value="synthwave">Synthwave</option>
      <option value="aurora">Aurora</option><option value="monochrome">Monochrome</option>
      <option value="sunset">Sunset</option></select></div></div>`;

    // 5. Particles & Flow
    html += `<div class="section"><h3>Particles &amp; Flow</h3>
      <div style="display:flex;gap:8px;margin-bottom:10px;flex-wrap:wrap">
        <label class="toggle-item" title="Toggle flowing particles"><input type="checkbox" data-toggle="particles" ${CFG.toggles.particles?'checked':''}><span>Particles</span></label>
        <label class="toggle-item" title="Toggle particle web connections"><input type="checkbox" data-toggle="connections" ${CFG.toggles.connections?'checked':''}><span>Connections</span></label>
        <label class="toggle-item" title="Toggle particle motion trails"><input type="checkbox" data-toggle="trails" ${CFG.toggles.trails?'checked':''}><span>Trails</span></label>
      </div>`;
    html += this.sliderHTML('particleCount', 'Particle Count', 1, 1000, 1, CFG.particleCount, '', 'Total active particle count in system');
    html += this.sliderHTML('trailLen', 'Particle Trail Length', 0.01, 1, 0.01, CFG.trailLen, '', 'Length of history trail retained for each particle');
    html += this.sliderHTML('connectionDist', 'Connect Distance', 10, 300, 5, CFG.connectionDist, 'px', 'Maximum distance threshold to draw connecting lines between particles');
    html += `<div class="ctrl-row" style="margin-top:8px" title="Select movement vector field for particles"><label>Particle Flow Style</label><select id="sel-particleStyle" title="Select particle flow style">
      <option value="normal">Normal Flow</option><option value="spiral">Spiral Dance</option>
      <option value="vortex">Vortex Pull</option><option value="rainbow">Rainbow Shift</option>
      <option value="burst">Burst Mode</option></select></div></div>`;

    // 6. Audio, File Playback & Visualizer
    html += `<div class="section"><h3>Audio, File &amp; Visualizer</h3>`;

    // File drop zone
    html += `<div class="audio-drop-zone" id="audioDropZone" title="Click to browse or drag and drop an audio file (MP3, WAV, OGG, FLAC)">
      <div class="drop-icon">🎵</div>
      <div class="drop-text">Drop audio file here or click to browse<br><span style="font-size:0.6rem;color:var(--text-muted)">MP3 · WAV · OGG · FLAC · AAC</span></div>
    </div>`;

    // Now playing
    html += `<div class="now-playing idle" id="now-playing">
      <span class="np-icon" id="np-icon">🎶</span>
      <div class="np-info">
        <div class="np-name" id="np-name">No file loaded</div>
        <div class="np-time" id="np-time"></div>
      </div>
    </div>`;

    // Transport
    html += `<div class="audio-transport">
      <button id="btn-filePlay" title="Play loaded audio file">▶ Play</button>
      <button id="btn-filePause" title="Pause playback">⏸ Pause</button>
      <button id="btn-fileStop" title="Stop and reset playback">⏹ Stop</button>
    </div>`;

    // File volume
    html += this.sliderHTML('audioFileVolume', 'File Volume', 0, 1, 0.01, CFG.audioFileVolume, '', 'Playback volume of loaded audio file');

    // Mini Visualizer Canvas
    html += `<div style="display:flex;align-items:center;gap:8px;margin:8px 0">
      <label class="toggle-item" title="Show or hide the mini frequency visualizer"><input type="checkbox" data-toggle="vizEnabled" ${CFG.toggles.vizEnabled?'checked':''}><span>Visualizer</span></label>
      <select id="sel-vizType" title="Select visualizer display mode" style="font-size:0.7rem;padding:3px 6px;border-radius:4px;background:rgba(255,255,255,0.08);border:1px solid rgba(255,255,255,0.1);color:var(--text-primary)">
        <option value="bars">Bars</option>
        <option value="waveform">Waveform</option>
        <option value="both">Both</option>
      </select>
    </div>
    <div class="viz-canvas-wrap" id="vizCanvasWrap">
      <canvas id="vizCanvas"></canvas>
    </div>`;

    // Synth & Mic controls
    html += `<div style="display:flex;gap:6px;margin-bottom:10px">
      <button class="action-btn secondary" id="btn-audioOsc" title="Toggle Web Audio ambient synthesizer oscillator">Start Synth</button>
      <button class="action-btn secondary" id="btn-audioMic" title="Toggle microphone audio input for real-time sound reactivity">Start Mic</button>
    </div>`;

    // Audio Reactive toggle
    html += `<div class="ctrl-row" style="margin-bottom:10px" title="Modulate visual effects dynamically based on audio frequency bands">
      <label class="toggle-item"><input type="checkbox" data-toggle="audioReactive" ${CFG.toggles.audioReactive?'checked':''}><span>Audio Reactive Visuals</span></label>
    </div>`;

    // Band Sensitivity Sliders
    html += `<details open><summary title="Control how strongly each frequency band affects visual effects">🎛️ Band Sensitivity</summary><div style="margin-top:8px">`;
    html += this.sliderHTML('audioBassGain', 'Bass Sensitivity', 0, 3, 0.1, CFG.audioBassGain, 'x', 'How strongly bass frequencies (kicks, bass drops) modulate screen shake, trail length, and background flash');
    html += this.sliderHTML('audioMidGain', 'Mid Sensitivity', 0, 3, 0.1, CFG.audioMidGain, 'x', 'How strongly mid frequencies (vocals, synths) modulate speed, hue shift, and glow intensity');
    html += this.sliderHTML('audioHighGain', 'High Sensitivity', 0, 3, 0.1, CFG.audioHighGain, 'x', 'How strongly high frequencies (hi-hats, cymbals) modulate chromatic aberration, particle size, and flicker');
    html += this.sliderHTML('audioTrebleGain', 'Treble Sensitivity', 0, 3, 0.1, CFG.audioTrebleGain, 'x', 'How strongly treble frequencies (sparkle, air) modulate star speed and shimmer effects');
    html += `</div></details>`;

    // Synth controls
    html += `<details><summary title="Synth oscillator and LFO parameters">🎹 Synth Controls</summary><div style="margin-top:8px">`;
    html += this.sliderHTML('oscVolume', 'Synth Volume', 0, 1, 0.01, CFG.oscVolume, '', 'Master volume level of synth oscillator');
    html += this.sliderHTML('oscFreq', 'Oscillator Frequency', 20, 2000, 1, CFG.oscFreq, 'Hz', 'Base frequency pitch of synth oscillator');
    html += this.sliderHTML('lfoRate', 'LFO Mod Rate', 0.05, 10, 0.05, CFG.lfoRate, 'Hz', 'Low frequency oscillator modulation rate');
    html += `<div class="ctrl-row" style="margin-top:8px" title="Oscillator sound waveform type"><label>Oscillator Waveform</label><select id="sel-oscWaveform" title="Select oscillator waveform">
      <option value="sine">Sine</option><option value="square">Square</option>
      <option value="sawtooth">Sawtooth</option><option value="triangle">Triangle</option>
    </select></div>`;
    html += `</div></details></div>`;

    // 7. Mouse Interaction
    html += `<div class="section"><h3>Mouse Interaction</h3>`;
    html += this.sliderHTML('mouseRadius', 'Interaction Radius', 10, 600, 5, CFG.mouseRadius, 'px', 'Distance radius around cursor that affects elements');
    html += `<div class="ctrl-row"><label>Interaction Targets</label><div style="display:flex;gap:8px;flex-wrap:wrap">
      <label class="toggle-item" title="Repel stars away from cursor"><input type="checkbox" id="tog-interactStars" ${CFG.interactStars?'checked':''}><span>Stars</span></label>
      <label class="toggle-item" title="Push and scale CSS shapes near cursor"><input type="checkbox" id="tog-interactCSS" ${CFG.interactCSS?'checked':''}><span>CSS Shapes</span></label>
    </div></div></div>`;

    // 8. Detailed Canvas Overlays Controls
    html += `<div class="section"><details open><summary title="Detailed controls for 2D Canvas overlays">Canvas Overlays Detailed Controls</summary><div style="display:flex;flex-direction:column;gap:12px;margin-top:8px">`;
    
    // Stars
    html += `<div style="background:rgba(255,255,255,0.03);padding:10px;border-radius:8px">
      <label class="toggle-item" title="Twinkling background starfield"><input type="checkbox" data-toggle="stars" ${CFG.toggles.stars?'checked':''}><strong>Background Stars</strong></label>
      ${this.sliderHTML('starCount', 'Star Count', 1, 300, 1, CFG.starCount, '', 'Total stars in starfield')}
      ${this.sliderHTML('starSpeed', 'Star Speed', 0.1, 5, 0.1, CFG.starSpeed, 'x', 'Twinkle animation speed')}
      ${this.sliderHTML('starSize', 'Star Base Size', 1, 10, 0.5, CFG.starSize, 'px', 'Base radius of star particles')}
    </div>`;

    // Warp Tunnel
    html += `<div style="background:rgba(255,255,255,0.03);padding:10px;border-radius:8px">
      <label class="toggle-item" title="Hypnotic warp tunnel overlay"><input type="checkbox" data-toggle="warp" ${CFG.toggles.warp?'checked':''}><strong>Warp Tunnel Overlay</strong></label>
      ${this.sliderHTML('warpCount', 'Warp Rings', 5, 50, 1, CFG.warpCount, '', 'Number of expanding tunnel particles')}
      ${this.sliderHTML('warpSpeed', 'Warp Speed', 0.1, 5, 0.1, CFG.warpSpeed, 'x', 'Tunnel expansion speed')}
      ${this.sliderHTML('warpScale', 'Warp Radius Scale', 0.1, 3, 0.1, CFG.warpScale, 'x', 'Overall tunnel radius scale factor')}
    </div>`;

    // Neon Grid
    html += `<div style="background:rgba(255,255,255,0.03);padding:10px;border-radius:8px">
      <label class="toggle-item" title="Scrolling perspective neon grid lines"><input type="checkbox" data-toggle="grid" ${CFG.toggles.grid?'checked':''}><strong>Neon Canvas Grid</strong></label>
      ${this.sliderHTML('gridSize', 'Grid Cell Size', 10, 100, 2, CFG.gridSize, 'px', 'Size of individual grid square cells')}
      ${this.sliderHTML('gridSpeed', 'Grid Scroll Speed', 0.1, 5, 0.1, CFG.gridSpeed, 'x', 'Scrolling animation speed of grid')}
      ${this.sliderHTML('gridOpacity', 'Grid Line Opacity', 0.01, 1, 0.01, CFG.gridOpacity, '', 'Line transparency opacity')}
    </div>`;

    // Flicker Grid
    html += `<div style="background:rgba(255,255,255,0.03);padding:10px;border-radius:8px">
      <label class="toggle-item" title="Random flashing color grid blocks"><input type="checkbox" data-toggle="flicker" ${CFG.toggles.flicker?'checked':''}><strong>Flicker Grid Cells</strong></label>
      ${this.sliderHTML('flickerSize', 'Cell Size', 10, 100, 2, CFG.flickerSize, 'px', 'Size of flickering square blocks')}
      ${this.sliderHTML('flickerRate', 'Flicker Frequency', 0.01, 0.2, 0.01, CFG.flickerRate, '', 'Probability of cell flickering per frame')}
      ${this.sliderHTML('flickerOpacity', 'Flicker Opacity', 0.1, 1, 0.05, CFG.flickerOpacity, '', 'Block color fill opacity')}
    </div>`;

    // Vignette
    html += `<div style="background:rgba(255,255,255,0.03);padding:10px;border-radius:8px">
      <label class="toggle-item" title="Radial darkening vignette shadow border"><input type="checkbox" data-toggle="vignette" ${CFG.toggles.vignette?'checked':''}><strong>Vignette Shadow Border</strong></label>
      ${this.sliderHTML('vignetteDarkness', 'Vignette Darkness', 0.1, 1, 0.05, CFG.vignetteDarkness, '', 'Darkness of outer shadow edges')}
      ${this.sliderHTML('vignetteRadius', 'Vignette Radius', 0.1, 1.5, 0.05, CFG.vignetteRadius, '', 'Radial size of shadow border')}
    </div>`;

    // Chromatic Aberration
    html += `<div style="background:rgba(255,255,255,0.03);padding:10px;border-radius:8px">
      <label class="toggle-item" title="RGB chromatic aberration color separation"><input type="checkbox" data-toggle="chromatic" ${CFG.toggles.chromatic?'checked':''}><strong>Chromatic Aberration Split</strong></label>
      ${this.sliderHTML('chromaticShift', 'RGB Shift Distance', 1, 30, 1, CFG.chromaticShift, 'px', 'Pixel offset between red and cyan color channels')}
    </div>`;

    // Canvas Breathing Glow
    html += `<div style="background:rgba(255,255,255,0.03);padding:10px;border-radius:8px">
      <label class="toggle-item" title="Pulsating radial glow circles"><input type="checkbox" data-toggle="breathing" ${CFG.toggles.breathing?'checked':''}><strong>Canvas Breathing Glow</strong></label>
      ${this.sliderHTML('breathCount', 'Pulse Orbs Count', 1, 20, 1, CFG.breathCount, '', 'Number of pulsating aura circles')}
      ${this.sliderHTML('breathSpeed', 'Pulse Speed', 0.1, 5, 0.1, CFG.breathSpeed, 'x', 'Pulsation expansion speed')}
      ${this.sliderHTML('breathSize', 'Base Glow Radius', 20, 200, 5, CFG.breathSize, 'px', 'Base radius of glowing circles')}
    </div>`;

    html += `</div></details></div>`;

    // 9. Detailed CSS Layer Effects Controls (With Movement & Mouse Reactivity!)
    html += `<div class="section"><details open><summary title="Detailed controls for CSS layer effects, animations, floating motion, and mouse reactivity">CSS Layer Effects Detailed Controls</summary><div style="display:flex;flex-direction:column;gap:12px;margin-top:8px">`;
    
    // Floating Orbs
    html += `<div style="background:rgba(255,255,255,0.03);padding:10px;border-radius:8px">
      <label class="toggle-item" title="Ambient gradient color orbs drifting in background"><input type="checkbox" data-toggle="orbs" ${CFG.toggles.orbs?'checked':''}><strong>Floating Blur Orbs</strong></label>
      ${this.sliderHTML('orbCount', 'Orb Count', 1, 20, 1, CFG.orbCount, '', 'Total floating orbs count')}
      ${this.sliderHTML('orbSize', 'Orb Size', 50, 400, 10, CFG.orbSize, 'px', 'Diameter of orb elements')}
      ${this.sliderHTML('orbBlur', 'Blur Amount', 10, 100, 5, CFG.orbBlur, 'px', 'CSS backdrop blur radius')}
    </div>`;

    // Rotating Rings (With Motion & Mouse Reactivity!)
    html += `<div style="background:rgba(255,255,255,0.03);padding:10px;border-radius:8px">
      <label class="toggle-item" title="Concentric spinning CSS rings with real-time color cycling"><input type="checkbox" data-toggle="rings" ${CFG.toggles.rings?'checked':''}><strong>Rotating CSS Rings</strong></label>
      <div style="display:flex;gap:8px;margin:8px 0;flex-wrap:wrap">
        <label class="toggle-item" title="Enable organic floating motion around the screen"><input type="checkbox" id="tog-ringsFloat" ${CFG.ringsFloat?'checked':''}><span>Organic Float Motion</span></label>
        <label class="toggle-item" title="Enable parallax mouse attraction and tracking"><input type="checkbox" id="tog-ringsMouseReact" ${CFG.ringsMouseReact?'checked':''}><span>Mouse Follow</span></label>
      </div>
      ${this.sliderHTML('ringCount', 'Ring Count', 1, 20, 1, CFG.ringCount, '', 'Number of concentric rings')}
      ${this.sliderHTML('ringSize', 'Outer Ring Diameter', 100, 1000, 20, CFG.ringSize, 'px', 'Diameter of outermost ring')}
      ${this.sliderHTML('ringSpeed', 'Spin Speed', 0.1, 5, 0.1, CFG.ringSpeed, 'x', 'Rotation speed of rings')}
      ${this.sliderHTML('ringsMoveSpeed', 'Float Drift Speed', 0.1, 5, 0.1, CFG.ringsMoveSpeed, 'x', 'Screen wandering speed')}
    </div>`;

    // Light Beams
    html += `<div style="background:rgba(255,255,255,0.03);padding:10px;border-radius:8px">
      <label class="toggle-item" title="Vertical flashing laser beams"><input type="checkbox" data-toggle="beams" ${CFG.toggles.beams?'checked':''}><strong>Vertical Light Beams</strong></label>
      ${this.sliderHTML('beamCount', 'Beam Count', 1, 20, 1, CFG.beamCount, '', 'Total laser beam count')}
      ${this.sliderHTML('beamWidth', 'Beam Thickness', 1, 20, 1, CFG.beamWidth, 'px', 'Width of light beams')}
      ${this.sliderHTML('beamSpeed', 'Flash Speed', 0.5, 5, 0.1, CFG.beamSpeed, 'x', 'Beam activation flash speed')}
    </div>`;

    // CSS Shapes
    html += `<div style="background:rgba(255,255,255,0.03);padding:10px;border-radius:8px">
      <label class="toggle-item" title="Floating geometric triangles, circles, and squares"><input type="checkbox" data-toggle="cssShapes" ${CFG.toggles.cssShapes?'checked':''}><strong>Floating CSS Shapes</strong></label>
      ${this.sliderHTML('shapeCount', 'Shape Count', 1, 30, 1, CFG.shapeCount, '', 'Number of floating geometric elements')}
      ${this.sliderHTML('shapeSize', 'Shape Size', 20, 150, 5, CFG.shapeSize, 'px', 'Base dimension size of shapes')}
      ${this.sliderHTML('shapeSpeed', 'Float Speed', 0.1, 5, 0.1, CFG.shapeSpeed, 'x', 'Animation float speed')}
    </div>`;

    // Kaleidoscope
    html += `<div style="background:rgba(255,255,255,0.03);padding:10px;border-radius:8px">
      <label class="toggle-item" title="Shifting conic gradient kaleidoscope circles"><input type="checkbox" data-toggle="kaleidoscope" ${CFG.toggles.kaleidoscope?'checked':''}><strong>Kaleidoscope Orbs</strong></label>
      ${this.sliderHTML('kaleidoCount', 'Orb Count', 1, 12, 1, CFG.kaleidoCount, '', 'Number of kaleidoscope orbs')}
      ${this.sliderHTML('kaleidoSize', 'Orb Size', 20, 200, 5, CFG.kaleidoSize, 'px', 'Diameter of kaleidoscope orbs')}
    </div>`;

    // Cursor Trail
    html += `<div style="background:rgba(255,255,255,0.03);padding:10px;border-radius:8px">
      <label class="toggle-item" title="Smooth fading glow dot trail following mouse cursor"><input type="checkbox" data-toggle="cursorTrail" ${CFG.toggles.cursorTrail?'checked':''}><strong>Cursor Glow Trail</strong></label>
      ${this.sliderHTML('cursorTrailLength', 'Max Trail Dots', 1, 50, 1, CFG.cursorTrailLength, '', 'Maximum active glow dots in cursor trail')}
      ${this.sliderHTML('cursorDotSize', 'Dot Size', 2, 30, 1, CFG.cursorDotSize, 'px', 'Base size of glow dots')}
    </div>`;

    // Burst & Ripples & Flash
    html += `<div style="background:rgba(255,255,255,0.03);padding:10px;border-radius:8px">
      <div style="display:flex;gap:8px;margin-bottom:8px;flex-wrap:wrap">
        <label class="toggle-item" title="Particle burst explosion on mouse click"><input type="checkbox" data-toggle="clickBurst" ${CFG.toggles.clickBurst?'checked':''}><span>Click Burst</span></label>
        <label class="toggle-item" title="Water ripple ring expansion on mouse click"><input type="checkbox" data-toggle="ripples" ${CFG.toggles.ripples?'checked':''}><span>Click Ripples</span></label>
        <label class="toggle-item" title="White screen flash strobe on mouse click"><input type="checkbox" data-toggle="screenFlash" ${CFG.toggles.screenFlash?'checked':''}><span>Screen Flash</span></label>
      </div>
      ${this.sliderHTML('burstCount', 'Burst Particles', 1, 50, 1, CFG.burstCount, '', 'Number of particles spawned per click burst')}
      ${this.sliderHTML('burstSpeed', 'Burst Velocity', 1, 10, 0.5, CFG.burstSpeed, '', 'Initial explosion velocity of burst particles')}
      ${this.sliderHTML('rippleScale', 'Ripple Expansion Scale', 5, 100, 5, CFG.rippleScale, '', 'Maximum radius expansion scale for click ripples')}
      ${this.sliderHTML('rippleSpeed', 'Ripple Speed', 0.2, 3, 0.1, CFG.rippleSpeed, 'x', 'Ripple expansion animation speed')}
    </div>`;

    // Glitch & Shake
    html += `<div style="background:rgba(255,255,255,0.03);padding:10px;border-radius:8px">
      <div style="display:flex;gap:8px;margin-bottom:8px">
        <label class="toggle-item" title="Distortion screen shake effect"><input type="checkbox" data-toggle="screenShake" ${CFG.toggles.screenShake?'checked':''}><span>Screen Shake</span></label>
        <label class="toggle-item" title="Cyberpunk text glitching overlay"><input type="checkbox" data-toggle="glitchText" ${CFG.toggles.glitchText?'checked':''}><span>Text Glitch</span></label>
      </div>
      ${this.sliderHTML('screenShakeIntensity', 'Shake Power', 1, 20, 1, CFG.screenShakeIntensity, '', 'Screen displacement pixel intensity')}
      ${this.sliderHTML('glitchInterval', 'Glitch Interval', 200, 5000, 100, CFG.glitchInterval, 'ms', 'Time interval between text glitch triggers')}
    </div>`;

    // Emoji Rain
    html += `<div style="background:rgba(255,255,255,0.03);padding:10px;border-radius:8px">
      <label class="toggle-item" title="Falling psychedelic emoji symbols"><input type="checkbox" data-toggle="emoji" ${CFG.toggles.emoji?'checked':''}><strong>Emoji Rain</strong></label>
      ${this.sliderHTML('emojiSize', 'Emoji Size', 8, 64, 2, CFG.emojiSize, 'px', 'Font size of emoji characters')}
      ${this.sliderHTML('emojiRate', 'Spawn Rate', 0.01, 1, 0.01, CFG.emojiRate, '', 'Spawn probability rate per frame')}
    </div>`;

    // Grid Mesh Overlay
    html += `<div style="background:rgba(255,255,255,0.03);padding:10px;border-radius:8px">
      <label class="toggle-item" title="Fixed perspective background grid mesh overlay"><input type="checkbox" data-toggle="gridOverlay" ${CFG.toggles.gridOverlay?'checked':''}><strong>Grid Mesh Overlay</strong></label>
      ${this.sliderHTML('meshSize', 'Mesh Grid Size', 20, 100, 5, CFG.meshSize, 'px', 'Cell dimensions of grid mesh background')}
      ${this.sliderHTML('meshOpacity', 'Mesh Opacity', 0.05, 0.5, 0.05, CFG.meshOpacity, '', 'Mesh line transparency')}
    </div>`;

    // CSS Mandala (With Motion & Mouse Reactivity!)
    html += `<div style="background:rgba(255,255,255,0.03);padding:10px;border-radius:8px">
      <label class="toggle-item" title="Rainbow CSS flower mandala pattern"><input type="checkbox" data-toggle="mandala" ${CFG.toggles.mandala?'checked':''}><strong>CSS Rainbow Mandala</strong></label>
      <div style="display:flex;gap:8px;margin:8px 0;flex-wrap:wrap">
        <label class="toggle-item" title="Enable organic wandering float motion across screen"><input type="checkbox" id="tog-mandalaFloat" ${CFG.mandalaFloat?'checked':''}><span>Organic Float Motion</span></label>
        <label class="toggle-item" title="Enable smooth mouse attraction and cursor tracking"><input type="checkbox" id="tog-mandalaMouseReact" ${CFG.mandalaMouseReact?'checked':''}><span>Mouse Follow</span></label>
      </div>
      ${this.sliderHTML('mandalaPetals', 'Petal Count', 12, 60, 4, CFG.mandalaPetals, '', 'Number of flower petals in mandala')}
      ${this.sliderHTML('mandalaSize', 'Mandala Diameter', 100, 800, 20, CFG.mandalaSize, 'px', 'Diameter of CSS mandala structure')}
      ${this.sliderHTML('mandalaMoveSpeed', 'Float Drift Speed', 0.1, 5, 0.1, CFG.mandalaMoveSpeed, 'x', 'Screen wandering drift speed')}
    </div>`;

    html += `</div></details></div>`;

    // 10. WebGL 3D Shader Layer
    html += `<div class="section"><h3>3D WebGL Overlay Shader</h3>
      <div class="ctrl-row" style="margin-bottom:8px" title="Three.js GPU 3D raymarched noise shader overlay">
        <label class="toggle-item" title="Enable 3D WebGL Shader Layer"><input type="checkbox" data-toggle="webgl" ${CFG.toggles.webgl?'checked':''}><span>Enable 3D Shader Layer</span></label>
      </div>`;
    html += this.sliderHTML('webglIntensity', 'Opacity', 0, 1, 0.05, CFG.webglIntensity, '', 'WebGL shader layer transparency');
    html += this.sliderHTML('webglSpeed', 'Speed', 0.05, 2, 0.05, CFG.webglSpeed, '', 'Shader animation time speed');
    html += this.sliderHTML('webglComplexity', 'Complexity', 1, 8, 1, CFG.webglComplexity, '', 'Raymarching octave noise complexity');
    html += `</div>`;

    // 11. Presets
    html += `<div class="section"><h3 title="Curated preset configurations combining visual modes, color palettes, and effects">Presets</h3><div class="preset-grid">`;
    const presetNames = {
      acid:['Acid Trip', 'High intensity vibrant acid colors with kaleidoscope & chromatic aberration'],
      neon:['Neon City', 'Cyberpunk neon grid and futuristic glow'],
      ocean:['Ocean Deep', 'Calming deep blue water waves and fluid cosmic blobs'],
      fire:['Fire Dance', 'High energy fiery red and gold light beams and click bursts'],
      rainbow:['Rainbow Flow', 'Continuous rainbow spectrum shift with mandala & rings'],
      calm:['Calm', 'Relaxing slow-paced pastels with gentle breathing glow'],
      chaos:['Chaos', 'Maxed out particle density, shake, flicker, and full effects'],
      minimal:['Minimal', 'Clean understated visuals with low particle count'],
      cyberpunk:['Cyberpunk', 'High contrast synth neon grid with text glitching'],
      nebula:['Nebula', 'Deep space galaxy stars and cosmic cloud swirls'],
      void:['Void Walker', 'Ultra minimal dark theme with subtle particle flow'],
      burst:['Burst Mode', 'Explosive click burst particle action'],
      fullpsychedelic:['Full Psychedelic', 'ALL visual effects enabled simultaneously'],
      synthwave:['Synthwave', 'Retrofuturistic 80s grid and spiral galaxy'],
      zen:['Zen Garden', 'Tranquil sacred geometry with slow breathing aura'],
      matrix:['Matrix', 'Green digital katakana code rain falling in columns'],
      deepspace:['Deep Space', 'Immersion starfield galaxy spiral with dust clouds']
    };
    Object.keys(presetNames).forEach(key => {
      const item = presetNames[key];
      html += `<button class="preset-btn" data-preset="${key}" title="${item[1]}">${item[0]}</button>`;
    });
    html += `</div></div>`;

    // 12. Actions
    html += `<div class="section">
      <button class="action-btn primary" id="btn-randomize" title="Randomize all visual parameters and toggles">Randomize</button>
      <button class="action-btn secondary" id="btn-reset" title="Reset all settings to default baseline state">Reset All</button>
      <div style="display:flex;gap:6px;margin-top:6px">
        <button class="action-btn secondary" id="btn-export" style="flex:1" title="Copy current configuration to clipboard as JSON">Export</button>
        <button class="action-btn secondary" id="btn-import" style="flex:1" title="Paste and apply JSON settings string">Import</button>
      </div>
    </div>`;

    // Keyboard legend
    html += `<div class="section kbd-legend" title="Keyboard shortcuts for quick access">
      <kbd>1</kbd>-<kbd>8</kbd> modes &nbsp; <kbd>0</kbd> toggle &nbsp; <kbd>Space</kbd> pause &nbsp; <kbd>F</kbd> fullscreen &nbsp; <kbd>R</kbd> random &nbsp; <kbd>A</kbd>/<kbd>D</kbd> hue
    </div>`;

    html += `<div class="spacer"></div>`;

    panel.innerHTML = html;
    document.getElementById('panel-toggle').addEventListener('click', () => this.togglePanel());
    panel.querySelector('.close-btn').addEventListener('click', () => this.closePanel());
  },

  renderModeParams() {
    const container = document.getElementById('mode-params');
    if (!container) return;
    if (CFG.modeOff) { container.innerHTML = '<p style="color:var(--text-muted);font-size:0.75rem;padding:4px 0">Mode is off</p>'; return; }
    const keys = this.modeParams[CFG.mode] || [];
    let html = '';
    keys.forEach(key => {
      const meta = this.paramMeta[key];
      if (meta) html += this.sliderHTML(key, meta[0], meta[1], meta[2], meta[3], CFG[key], meta[4], meta[5]);
    });
    container.innerHTML = html || '<p style="color:var(--text-muted);font-size:0.75rem;padding:4px 0">No parameters</p>';
    
    // Re-bind mode param sliders
    keys.forEach(key => {
      const sl = document.getElementById('sl-' + key);
      const val = document.getElementById('val-' + key);
      if (sl && val) {
        sl.addEventListener('input', () => {
          const v = parseFloat(sl.value);
          CFG[key] = (sl.step >= 1) ? Math.floor(v) : v;
          val.textContent = this.fmtVal(v, parseFloat(sl.step), sl.dataset.suffix);
        });
      }
    });
  },

  bindEvents() {
    const allSliders = [
      'speed','colorSpeed','bgFade','chaos','particleCount','trailLen','connectionDist',
      'mouseRadius','intensity','glowIntensity',
      'starCount','starSpeed','starSize',
      'warpCount','warpSpeed','warpScale',
      'gridSize','gridSpeed','gridOpacity',
      'flickerSize','flickerRate','flickerOpacity',
      'vignetteDarkness','vignetteRadius',
      'chromaticShift',
      'breathCount','breathSpeed','breathSize',
      'orbCount','orbSize','orbBlur',
      'ringCount','ringSpeed','ringSize','ringsMoveSpeed',
      'beamCount','beamWidth','beamSpeed',
      'shapeCount','shapeSize','shapeSpeed',
      'kaleidoCount','kaleidoSize',
      'cursorTrailLength','cursorDotSize',
      'burstCount','burstSpeed',
      'rippleScale','rippleSpeed',
      'screenShakeIntensity','glitchInterval',
      'emojiSize','emojiRate',
      'meshSize','meshOpacity',
      'mandalaPetals','mandalaSize','mandalaMoveSpeed',
      'webglIntensity','webglSpeed','webglComplexity',
      'oscFreq','lfoRate','oscVolume',
      'audioFileVolume',
      'audioBassGain','audioMidGain','audioHighGain','audioTrebleGain'
    ];

    allSliders.forEach(id => {
      const sl = document.getElementById('sl-' + id);
      const val = document.getElementById('val-' + id);
      if (!sl || !val) return;
      sl.addEventListener('input', () => {
        const v = parseFloat(sl.value);
        CFG[id] = (sl.step >= 1) ? Math.floor(v) : v;
        val.textContent = this.fmtVal(v, parseFloat(sl.step), sl.dataset.suffix);
        
        // Live element count & styling rebuilds
        if ([
          'starCount','orbCount','orbSize','orbBlur',
          'ringCount','ringSize','ringSpeed',
          'beamCount','beamWidth',
          'shapeCount','shapeSize','shapeSpeed',
          'breathCount',
          'kaleidoCount','kaleidoSize',
          'mandalaPetals','mandalaSize',
          'glitchInterval'
        ].includes(id)) {
          CSSFX.init();
        }
        // Live audio updates
        if (['oscFreq','lfoRate','oscVolume'].includes(id) && AUDIO.oscStarted) {
          AUDIO.updateOsc();
        }
        // Live file volume
        if (id === 'audioFileVolume') {
          AUDIO.updateFileVolume();
        }
      });
    });

    // Mode off toggle
    document.getElementById('tog-modeOff')?.addEventListener('change', e => {
      CFG.modeOff = e.target.checked;
      this.renderModeParams();
      document.querySelectorAll('.mode-btn').forEach(b => b.classList.toggle('active', !CFG.modeOff && parseInt(b.dataset.mode) === CFG.mode));
    });

    // Mode buttons
    document.querySelectorAll('.mode-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        CFG.mode = parseInt(btn.dataset.mode);
        CFG.modeOff = false;
        document.getElementById('tog-modeOff').checked = false;
        document.querySelectorAll('.mode-btn').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        this.renderModeParams();
      });
    });

    // ALL ON / ALL OFF buttons
    document.getElementById('btn-allOn')?.addEventListener('click', () => {
      Object.keys(CFG.toggles).forEach(k => CFG.toggles[k] = true);
      this.syncUI();
      this.updateAll();
    });
    document.getElementById('btn-allOff')?.addEventListener('click', () => {
      Object.keys(CFG.toggles).forEach(k => CFG.toggles[k] = false);
      this.syncUI();
      this.updateAll();
    });

    // Effect toggles (syncs all checkboxes sharing data-toggle)
    document.querySelectorAll('input[data-toggle]').forEach(cb => {
      cb.addEventListener('change', () => {
        const key = cb.getAttribute('data-toggle');
        if (!key) return;
        CFG.toggles[key] = cb.checked;
        document.querySelectorAll(`input[data-toggle="${key}"]`).forEach(el => el.checked = cb.checked);
        CSSFX.updateVisibility();
      });
    });

    // Mandala & Rings Motion & Mouse Toggles
    document.getElementById('tog-mandalaFloat')?.addEventListener('change', e => { CFG.mandalaFloat = e.target.checked; });
    document.getElementById('tog-mandalaMouseReact')?.addEventListener('change', e => { CFG.mandalaMouseReact = e.target.checked; });
    document.getElementById('tog-ringsFloat')?.addEventListener('change', e => { CFG.ringsFloat = e.target.checked; });
    document.getElementById('tog-ringsMouseReact')?.addEventListener('change', e => { CFG.ringsMouseReact = e.target.checked; });

    // Interaction Checkboxes
    ['interactStars','interactCSS'].forEach(key => {
      const cb = document.getElementById('tog-' + key);
      if (cb) {
        cb.addEventListener('change', () => {
          CFG[key] = cb.checked;
        });
      }
    });

    // Selects
    document.getElementById('sel-particleStyle')?.addEventListener('change', e => {
      CFG.particleStyle = e.target.value;
      particleList.forEach(p => p.style = e.target.value);
    });
    document.getElementById('sel-colorScheme')?.addEventListener('change', e => {
      CFG.colorScheme = e.target.value;
      this.updateHueShift();
    });
    document.getElementById('sel-oscWaveform')?.addEventListener('change', e => {
      CFG.oscWaveform = e.target.value;
      if (AUDIO.oscStarted) AUDIO.updateOsc();
    });
    document.getElementById('sel-vizType')?.addEventListener('change', e => {
      CFG.vizType = e.target.value;
    });

    // Audio buttons
    document.getElementById('btn-audioOsc')?.addEventListener('click', () => {
      if (!AUDIO.oscStarted) { AUDIO.startOsc(); document.getElementById('btn-audioOsc').textContent = 'Stop Synth'; }
      else { AUDIO.stopOsc(); document.getElementById('btn-audioOsc').textContent = 'Start Synth'; }
    });
    document.getElementById('btn-audioMic')?.addEventListener('click', () => {
      if (!AUDIO.micStarted) { AUDIO.startMic(); document.getElementById('btn-audioMic').textContent = 'Stop Mic'; }
      else { AUDIO.stopMic(); document.getElementById('btn-audioMic').textContent = 'Start Mic'; }
    });

    // File loading - drop zone click
    const dropZone = document.getElementById('audioDropZone');
    const fileInput = document.getElementById('audioFileInput');
    if (dropZone && fileInput) {
      dropZone.addEventListener('click', () => fileInput.click());

      // Drag and drop
      dropZone.addEventListener('dragover', e => {
        e.preventDefault();
        dropZone.classList.add('dragover');
      });
      dropZone.addEventListener('dragleave', () => {
        dropZone.classList.remove('dragover');
      });
      dropZone.addEventListener('drop', e => {
        e.preventDefault();
        dropZone.classList.remove('dragover');
        const file = e.dataTransfer.files[0];
        if (file && file.type.startsWith('audio/')) {
          AUDIO.loadFile(file);
        }
      });

      fileInput.addEventListener('change', () => {
        const file = fileInput.files[0];
        if (file) AUDIO.loadFile(file);
      });
    }

    // Transport buttons
    document.getElementById('btn-filePlay')?.addEventListener('click', () => {
      AUDIO.playFile();
      document.getElementById('btn-filePlay')?.classList.add('playing');
    });
    document.getElementById('btn-filePause')?.addEventListener('click', () => {
      AUDIO.pauseFile();
      document.getElementById('btn-filePlay')?.classList.remove('playing');
    });
    document.getElementById('btn-fileStop')?.addEventListener('click', () => {
      AUDIO.stopFile();
      document.getElementById('btn-filePlay')?.classList.remove('playing');
    });

    // Audio player ended event
    const audioEl = document.getElementById('audioPlayer');
    if (audioEl) {
      audioEl.addEventListener('ended', () => {
        AUDIO.filePlaying = false;
        AUDIO._updateNowPlaying();
        document.getElementById('btn-filePlay')?.classList.remove('playing');
      });
    }

    // Init panel mini visualizer canvas & main on-screen visualizer HUD canvas
    const vizCanvas = document.getElementById('vizCanvas');
    if (vizCanvas) AUDIO.addVisualizerCanvas(vizCanvas);

    const onScreenCanvas = document.getElementById('onScreenVizCanvas');
    if (onScreenCanvas) AUDIO.addVisualizerCanvas(onScreenCanvas);

    // Header buttons
    document.getElementById('btn-pause')?.addEventListener('click', () => {
      Psy.paused = !Psy.paused;
      document.getElementById('btn-pause').textContent = Psy.paused ? '▶' : '⏸';
    });
    document.getElementById('btn-fullscreen')?.addEventListener('click', () => toggleFullscreen());

    // Presets
    document.querySelectorAll('.preset-btn').forEach(btn => {
      btn.addEventListener('click', () => this.applyPreset(btn.dataset.preset));
    });

    // Randomize/Reset/Export/Import
    document.getElementById('btn-randomize')?.addEventListener('click', () => this.randomize());
    document.getElementById('btn-reset')?.addEventListener('click', () => this.resetAll());
    document.getElementById('btn-export')?.addEventListener('click', () => this.exportSettings());
    document.getElementById('btn-import')?.addEventListener('click', () => this.importSettings());

    // Keyboard shortcuts
    document.addEventListener('keydown', e => {
      if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA' || e.target.tagName === 'SELECT') return;
      switch (e.key) {
        case '1': case '2': case '3': case '4': case '5': case '6': case '7': case '8':
          CFG.mode = parseInt(e.key) - 1; CFG.modeOff = false;
          if (document.getElementById('tog-modeOff')) document.getElementById('tog-modeOff').checked = false;
          document.querySelectorAll('.mode-btn').forEach(b => b.classList.toggle('active', parseInt(b.dataset.mode) === CFG.mode));
          this.renderModeParams();
          break;
        case '0': CFG.modeOff = !CFG.modeOff; if (document.getElementById('tog-modeOff')) document.getElementById('tog-modeOff').checked = CFG.modeOff; this.renderModeParams(); break;
        case ' ': e.preventDefault(); Psy.paused = !Psy.paused; document.getElementById('btn-pause').textContent = Psy.paused ? '▶' : '⏸'; break;
        case 'f': case 'F': toggleFullscreen(); break;
        case 'r': case 'R': this.randomize(); break;
        case 'a': Psy.hueShift -= 30; break;
        case 'd': Psy.hueShift += 30; break;
      }
    });
  },

  applyPreset(name) {
    const preset = CFG.presets[name];
    if (!preset) return;
    CFG.toggles = JSON.parse(JSON.stringify(CFG_DEFAULTS.toggles));
    Object.keys(preset).forEach(k => {
      if (k === 'toggles') return;
      if (k !== 'presets' && k !== 'modeNames' && k !== 'colorSchemes') CFG[k] = preset[k];
    });
    if (preset.toggles) Object.assign(CFG.toggles, preset.toggles);
    CFG.modeOff = false;
    this.syncUI();
    this.updateAll();
    this.renderModeParams();
  },

  randomize() {
    CFG.mode = Math.floor(Math.random() * 8);
    CFG.modeOff = false;
    CFG.speed = +(Math.random() * 4.5 + 0.2).toFixed(1);
    CFG.colorSpeed = +(Math.random() * 4.5 + 0.2).toFixed(1);
    CFG.intensity = Math.floor(Math.random() * 80 + 20);
    CFG.chaos = Math.floor(Math.random() * 100);
    CFG.particleCount = Math.floor(Math.random() * 600 + 20);
    CFG.bgFade = +(Math.random() * 0.4 + 0.02).toFixed(2);
    CFG.mouseRadius = Math.floor(Math.random() * 400 + 30);
    CFG.glowIntensity = Math.floor(Math.random() * 100);
    CFG.connectionDist = Math.floor(Math.random() * 200 + 20);
    CFG.modeArms = 1 + Math.floor(Math.random() * 15);
    CFG.modeLayers = 1 + Math.floor(Math.random() * 15);
    CFG.modeRings = 1 + Math.floor(Math.random() * 80);
    CFG.modeSegments = 1 + Math.floor(Math.random() * 30);
    CFG.modeDistortion = 1 + Math.floor(Math.random() * 60);
    CFG.modeDistSpeed = 1 + Math.floor(Math.random() * 10);
    CFG.modeBlobs = 1 + Math.floor(Math.random() * 40);
    CFG.modeSwirls = 1 + Math.floor(Math.random() * 20);
    CFG.modeGeoLayers = 1 + Math.floor(Math.random() * 15);
    CFG.modePlasmaRes = 1 + Math.floor(Math.random() * 25);
    CFG.modeSpiralArms = 1 + Math.floor(Math.random() * 10);
    CFG.modeSpiralTightness = 1 + Math.floor(Math.random() * 9);
    CFG.modeSpiralStars = 10 + Math.floor(Math.random() * 49) * 10;
    CFG.modeSacredLayers = 1 + Math.floor(Math.random() * 10);
    CFG.modeSacredSymmetry = 1 + Math.floor(Math.random() * 10);
    CFG.modeRainColumns = 1 + Math.floor(Math.random() * 60);
    CFG.modeRainSpeed = 1 + Math.floor(Math.random() * 9);
    CFG.modeRainDensity = +(Math.random() * 0.9 + 0.1).toFixed(2);
    CFG.starCount = 1 + Math.floor(Math.random() * 150);
    CFG.orbCount = 1 + Math.floor(Math.random() * 15);
    CFG.ringCount = 1 + Math.floor(Math.random() * 15);
    CFG.beamCount = 1 + Math.floor(Math.random() * 15);
    CFG.shapeCount = 1 + Math.floor(Math.random() * 25);
    CFG.breathCount = 1 + Math.floor(Math.random() * 15);
    CFG.kaleidoCount = 1 + Math.floor(Math.random() * 10);
    CFG.burstCount = 1 + Math.floor(Math.random() * 40);
    CFG.particleStyle = ['normal','spiral','vortex','rainbow','burst'][Math.floor(Math.random() * 5)];
    CFG.colorScheme = Object.keys(CFG.colorSchemes)[Math.floor(Math.random() * Object.keys(CFG.colorSchemes).length)];
    Object.keys(CFG.toggles).forEach(k => { CFG.toggles[k] = Math.random() > 0.35; });
    CFG.toggles.particles = true;
    this.syncUI();
    this.updateAll();
    this.renderModeParams();
  },

  resetAll() {
    Object.keys(CFG_DEFAULTS).forEach(k => {
      if (k === 'toggles') {
        CFG.toggles = JSON.parse(JSON.stringify(CFG_DEFAULTS.toggles));
      } else {
        CFG[k] = CFG_DEFAULTS[k];
      }
    });
    CFG.particleStyle = 'normal';
    CFG.colorScheme = 'neon';
    this.syncUI();
    this.updateAll();
    this.renderModeParams();
  },

  syncUI() {
    const modeOff = document.getElementById('tog-modeOff');
    if (modeOff) modeOff.checked = CFG.modeOff;
    document.querySelectorAll('.mode-btn').forEach(b => b.classList.toggle('active', !CFG.modeOff && parseInt(b.dataset.mode) === CFG.mode));

    const allSliders = [
      'speed','colorSpeed','bgFade','chaos','particleCount','trailLen','connectionDist',
      'mouseRadius','intensity','glowIntensity',
      'starCount','starSpeed','starSize',
      'warpCount','warpSpeed','warpScale',
      'gridSize','gridSpeed','gridOpacity',
      'flickerSize','flickerRate','flickerOpacity',
      'vignetteDarkness','vignetteRadius',
      'chromaticShift',
      'breathCount','breathSpeed','breathSize',
      'orbCount','orbSize','orbBlur',
      'ringCount','ringSpeed','ringSize','ringsMoveSpeed',
      'beamCount','beamWidth','beamSpeed',
      'shapeCount','shapeSize','shapeSpeed',
      'kaleidoCount','kaleidoSize',
      'cursorTrailLength','cursorDotSize',
      'burstCount','burstSpeed',
      'rippleScale','rippleSpeed',
      'screenShakeIntensity','glitchInterval',
      'emojiSize','emojiRate',
      'meshSize','meshOpacity',
      'mandalaPetals','mandalaSize','mandalaMoveSpeed',
      'webglIntensity','webglSpeed','webglComplexity',
      'oscFreq','lfoRate','oscVolume',
      'audioFileVolume',
      'audioBassGain','audioMidGain','audioHighGain','audioTrebleGain'
    ];
    allSliders.forEach(id => {
      const sl = document.getElementById('sl-' + id);
      const val = document.getElementById('val-' + id);
      if (sl) {
        sl.value = CFG[id];
        if (val) val.textContent = this.fmtVal(CFG[id], parseFloat(sl.step), sl.dataset.suffix);
      }
    });

    Object.keys(CFG.toggles).forEach(key => {
      document.querySelectorAll(`input[data-toggle="${key}"]`).forEach(cb => {
        cb.checked = CFG.toggles[key];
      });
    });

    const mf = document.getElementById('tog-mandalaFloat'); if (mf) mf.checked = CFG.mandalaFloat;
    const mmr = document.getElementById('tog-mandalaMouseReact'); if (mmr) mmr.checked = CFG.mandalaMouseReact;
    const rf = document.getElementById('tog-ringsFloat'); if (rf) rf.checked = CFG.ringsFloat;
    const rmr = document.getElementById('tog-ringsMouseReact'); if (rmr) rmr.checked = CFG.ringsMouseReact;

    const glitchP = document.getElementById('text-overlay');
    if (glitchP && glitchP.dataset.dismissed === 'true') glitchP.style.display = CFG.toggles.glitchText ? 'flex' : 'none';

    ['interactStars','interactCSS'].forEach(key => {
      const cb = document.getElementById('tog-' + key);
      if (cb) cb.checked = CFG[key];
    });

    const ps = document.getElementById('sel-particleStyle');
    if (ps) ps.value = CFG.particleStyle;
    const cs = document.getElementById('sel-colorScheme');
    if (cs) cs.value = CFG.colorScheme;
    const ws = document.getElementById('sel-oscWaveform');
    if (ws) ws.value = CFG.oscWaveform;
    const vt = document.getElementById('sel-vizType');
    if (vt) vt.value = CFG.vizType;

    const pb = document.getElementById('btn-pause');
    if (pb) pb.textContent = Psy.paused ? '▶' : '⏸';
  },

  togglePanel() { document.getElementById('controls-panel').classList.toggle('open'); },
  closePanel() { document.getElementById('controls-panel').classList.remove('open'); },

  updateHueShift() {
    const schemeKeys = Object.keys(CFG.colorSchemes);
    const idx = schemeKeys.indexOf(CFG.colorScheme);
    Psy.hueShift = idx >= 0 ? idx * 32 : 0;
  },

  updateAll() {
    CSSFX.updateVisibility();
    this.updateHueShift();
    this.renderModeParams();
  },

  loadState() {
    try {
      const saved = localStorage.getItem('psychedelic-universe');
      if (saved) {
        const d = JSON.parse(saved);
        Object.keys(d).forEach(k => {
          if (k === 'toggles') Object.assign(CFG.toggles, d.toggles);
          else if (k !== 'presets' && k !== 'modeNames' && k !== 'colorSchemes') CFG[k] = d[k];
        });
      }
    } catch (e) {}
    this.syncUI();
  },

  saveState() {
    try {
      const state = {};
      const keys = [
        'mode','modeOff','speed','colorSpeed','intensity','chaos','bgFade','trailLen',
        'particleCount','particleStyle','mouseRadius','glowIntensity','colorScheme',
        'interactStars','interactCSS','connectionDist',
        'modeArms','modeLayers','modeRings','modeSegments','modeDistortion','modeDistSpeed',
        'modeBlobs','modeSwirls','modeGeoLayers','modePlasmaRes','modeWarp',
        'modeSpiralArms','modeSpiralTightness','modeSpiralStars',
        'modeSacredLayers','modeSacredSymmetry',
        'modeRainColumns','modeRainSpeed','modeRainDensity',
        'webglIntensity','webglSpeed','webglComplexity',
        'starCount','starSpeed','starSize',
        'warpCount','warpSpeed','warpScale',
        'gridSize','gridSpeed','gridOpacity',
        'flickerSize','flickerRate','flickerOpacity',
        'vignetteDarkness','vignetteRadius',
        'chromaticShift',
        'breathCount','breathSpeed','breathSize',
        'orbCount','orbSize','orbBlur',
        'ringCount','ringSpeed','ringSize','ringsFloat','ringsMouseReact','ringsMoveSpeed',
        'beamCount','beamWidth','beamSpeed',
        'shapeCount','shapeSize','shapeSpeed',
        'kaleidoCount','kaleidoSize',
        'cursorTrailLength','cursorDotSize',
        'burstCount','burstSpeed',
        'rippleScale','rippleSpeed',
        'screenShakeIntensity','glitchInterval',
        'emojiSize','emojiRate',
        'meshSize','meshOpacity',
        'mandalaPetals','mandalaSize','mandalaFloat','mandalaMouseReact','mandalaMoveSpeed',
        'oscFreq','oscWaveform','lfoRate','oscVolume',
        'audioFileVolume','vizType',
        'audioBassGain','audioMidGain','audioHighGain','audioTrebleGain'
      ];
      keys.forEach(k => { state[k] = CFG[k]; });
      state.toggles = JSON.parse(JSON.stringify(CFG.toggles));
      localStorage.setItem('psychedelic-universe', JSON.stringify(state));
    } catch (e) {}
  },

  exportSettings() {
    try {
      const json = JSON.stringify(CFG, (key, val) => {
        if (key === 'presets' || key === 'modeNames' || key === 'colorSchemes') return undefined;
        return val;
      }, 2);
      navigator.clipboard.writeText(json).then(() => {
        alert('Settings copied to clipboard!');
      });
    } catch (e) { alert('Export failed'); }
  },

  importSettings() {
    const input = prompt('Paste settings JSON:');
    if (!input) return;
    try {
      const d = JSON.parse(input);
      Object.keys(d).forEach(k => {
        if (k === 'toggles') Object.assign(CFG.toggles, d.toggles);
        else if (k !== 'presets' && k !== 'modeNames' && k !== 'colorSchemes') CFG[k] = d[k];
      });
      this.syncUI();
      this.updateAll();
      this.renderModeParams();
      alert('Settings imported!');
    } catch (e) { alert('Invalid JSON'); }
  }
};

setInterval(() => UI.saveState(), 5000);
