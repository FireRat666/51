const CSSFX = {
  _trailDots: [],

  clearCSSWrap() {
    const wrap = document.querySelector('.css-wrap');
    if (wrap) wrap.innerHTML = '';
    window._orbs = null;
    window._rings = null;
    window._mandala = null;
    window._beams = null;
    window._shapes = null;
    window._breathCont = null;
    window._kaleidoscope = [];
  },

  init() {
    this.clearCSSWrap();
    this.createOrbs();
    this.createRings();
    this.createMandala();
    this.createBeams();
    this.createShapes();
    this.createBreathingCircles();
    this.createKaleidoscope();
    if (!this._trailInitialized) {
      this.initCursorTrail();
      this.bindClickBurst();
      this.bindRipples();
      this.bindScreenFlash();
      this.startShapeInteraction();
      this.startGlitchInterval();
      this._startMotionLoop();
      this._trailInitialized = true;
    }
  },

  createOrbs() {
    const wrap = document.querySelector('.css-wrap');
    const colors = ['#ff00de','#00ffde','#ffae00','#de00ff','#00ff66'];
    const pos = [{t:10,l:10},{b:20,r:15},{t:40,l:40},{b:10,l:20},{t:30,r:30}];
    const count = CFG.orbCount !== undefined ? CFG.orbCount : 5;
    const baseSz = CFG.orbSize || 250;
    const blurPx = CFG.orbBlur !== undefined ? CFG.orbBlur : 40;
    for (let i = 0; i < count; i++) {
      const el = document.createElement('div');
      el.className = 'orb';
      const c = colors[i % colors.length];
      const sz = baseSz * (0.8 + (i % 5) * 0.15);
      const p = pos[i % pos.length];
      el.style.cssText = `width:${sz}px;height:${sz}px;filter:blur(${blurPx}px);background:radial-gradient(circle,${c},transparent);`;
      if (p.t != null) el.style.top = p.t + '%';
      else el.style.bottom = p.b + '%';
      if (p.l != null) el.style.left = p.l + '%';
      else el.style.right = p.r + '%';
      el.style.animationDelay = (i * 2) + 's';
      wrap.appendChild(el);
    }
    window._orbs = wrap.querySelectorAll('.orb');
  },

  createRings() {
    const wrap = document.querySelector('.css-wrap');
    const cont = document.createElement('div');
    cont.className = 'rings-container';
    const baseSz = CFG.ringSize || 400;
    const rSpd = CFG.ringSpeed || 1;
    const count = CFG.ringCount !== undefined ? CFG.ringCount : 7;
    for (let i = 0; i < count; i++) {
      const el = document.createElement('div');
      el.className = 'ring';
      const sz = (baseSz * 0.4) + (i * (baseSz * 0.12));
      const dur = Math.max(1, (10 + i * 4) / rSpd);
      el.style.cssText = `width:${sz}px;height:${sz}px;border-top-color:hsl(${i*50},100%,60%);border-bottom-color:hsl(${i*50+180},100%,60%);animation-duration:${dur}s;`;
      el.dataset.idx = i;
      cont.appendChild(el);
    }
    wrap.appendChild(cont);
    window._rings = cont;
    this._startRingHueCycle();
  },

  _startRingHueCycle() {
    if (this._ringInterval) clearInterval(this._ringInterval);
    this._ringInterval = setInterval(() => {
      if (!CFG.toggles.rings || !window._rings) return;
      const rings = window._rings.querySelectorAll('.ring');
      rings.forEach((el, i) => {
        const hue1 = (Date.now() * 0.05 + i * 50) % 360;
        const hue2 = (hue1 + 180) % 360;
        el.style.borderTopColor = `hsl(${hue1},100%,60%)`;
        el.style.borderBottomColor = `hsl(${hue2},100%,60%)`;
        el.style.color = `hsl(${hue1},100%,50%)`;
      });
    }, 100);
  },

  createMandala() {
    const wrap = document.querySelector('.css-wrap');
    const mandala = document.createElement('div');
    mandala.className = 'mandala';
    const count = CFG.mandalaPetals || 36;
    const size = CFG.mandalaSize || 400;
    const angleStep = 360 / count;
    for (let i = 0; i < count; i++) {
      const outer = document.createElement('div');
      outer.className = 'petal-outer';
      outer.style.transform = `rotate(${i * angleStep}deg)`;
      const inner = document.createElement('div');
      inner.className = 'petal';
      inner.style.height = (size * 0.2) + 'px';
      inner.style.setProperty('--angle', (i * angleStep) + 'deg');
      outer.appendChild(inner);
      mandala.appendChild(outer);
    }
    wrap.appendChild(mandala);
    window._mandala = mandala;
  },

  createBeams() {
    const wrap = document.querySelector('.css-wrap');
    const cont = document.createElement('div');
    cont.style.cssText = 'position:fixed;inset:0;pointer-events:none;';
    const count = CFG.beamCount !== undefined ? CFG.beamCount : 8;
    const bWidth = CFG.beamWidth || 2;
    for (let i = 0; i < count; i++) {
      const el = document.createElement('div');
      el.className = 'beam';
      el.style.width = bWidth + 'px';
      el.style.left = Math.random() * window.innerWidth + 'px';
      el.style.background = `linear-gradient(to bottom, transparent, hsl(${Math.random()*360},100%,70%), transparent)`;
      cont.appendChild(el);
    }
    wrap.appendChild(cont);
    window._beams = cont;
    if (this._beamInterval) clearInterval(this._beamInterval);
    const bSpd = CFG.beamSpeed || 1;
    this._beamInterval = setInterval(() => {
      if (!CFG.toggles.beams) return;
      const beams = cont.querySelectorAll('.beam');
      if (beams.length === 0) return;
      const numActive = Math.min(beams.length, 3);
      const idxs = [...Array(beams.length).keys()].sort(() => Math.random() - 0.5).slice(0, numActive);
      idxs.forEach(i => {
        beams[i].classList.add('active');
        setTimeout(() => beams[i].classList.remove('active'), (1000 + Math.random() * 500) / bSpd);
      });
    }, Math.max(200, 2000 / bSpd));
  },

  createShapes() {
    const wrap = document.querySelector('.css-wrap');
    const cont = document.createElement('div');
    cont.id = 'css-shapes-cont';
    cont.style.cssText = 'position:fixed;inset:0;pointer-events:none;';
    const types = ['tri','circ','sq'];
    const count = CFG.shapeCount !== undefined ? CFG.shapeCount : 12;
    const szBase = CFG.shapeSize || 70;
    const sSpd = CFG.shapeSpeed || 1;
    for (let i = 0; i < count; i++) {
      const el = document.createElement('div');
      const t = types[i % 3];
      el.className = 'shape ' + t;
      if (t === 'circ') { el.style.width = szBase + 'px'; el.style.height = szBase + 'px'; }
      else if (t === 'sq') { el.style.width = (szBase * 0.9) + 'px'; el.style.height = (szBase * 0.9) + 'px'; }
      else if (t === 'tri') { el.style.borderLeftWidth = (szBase * 0.5) + 'px'; el.style.borderRightWidth = (szBase * 0.5) + 'px'; el.style.borderBottomWidth = szBase + 'px'; }
      el.dataset.index = i;
      el.style.left = (Math.random() * 90) + '%';
      el.style.top = (Math.random() * 90) + '%';
      const tx = (Math.random() * 40 - 20).toFixed(1);
      const ty = (Math.random() * 40 - 20).toFixed(1);
      const rot = (Math.random() * 360).toFixed(1);
      el.dataset.tx = tx; el.dataset.ty = ty; el.dataset.rot = rot;
      const dur = Math.max(1, (6 + Math.random() * 6) / sSpd);
      el.style.animation = `shapeFloat${i} ${dur}s ease-in-out infinite alternate`;
      cont.appendChild(el);
      const style = document.createElement('style');
      style.textContent = `@keyframes shapeFloat${i} { 0% { transform: translate(0,0) rotate(0deg) scale(0.8); } 100% { transform: translate(${tx}%,${ty}%) rotate(${rot}deg) scale(1.2); } }`;
      document.head.appendChild(style);
    }
    wrap.appendChild(cont);
    window._shapes = cont;
  },

  startShapeInteraction() {
    setInterval(() => {
      if (!CFG.interactCSS || Psy.mouseX < 0 || !CFG.toggles.cssShapes) return;
      const shapes = document.querySelectorAll('#css-shapes-cont .shape');
      shapes.forEach(el => {
        const rect = el.getBoundingClientRect();
        const cx = rect.left + rect.width / 2;
        const cy = rect.top + rect.height / 2;
        const dx = Psy.mouseX - cx, dy = Psy.mouseY - cy;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < CFG.mouseRadius * 1.5) {
          const force = (CFG.mouseRadius * 1.5 - dist) / (CFG.mouseRadius * 1.5);
          const angle = Math.atan2(dy, dx);
          el.style.animationPlayState = 'paused';
          el.style.transform = `translate(${-Math.cos(angle) * force * 30}px, ${-Math.sin(angle) * force * 30}px) scale(${1 + force * 0.3})`;
        } else {
          el.style.animationPlayState = 'running';
          el.style.transform = '';
        }
      });
    }, 50);
  },

  createBreathingCircles() {
    const wrap = document.querySelector('.css-wrap');
    const cont = document.createElement('div');
    cont.id = 'breath-cont';
    cont.style.cssText = 'position:fixed;inset:0;pointer-events:none;filter:blur(20px) opacity(0.3);';
    const count = CFG.breathCount !== undefined ? CFG.breathCount : 8;
    for (let i = 0; i < count; i++) {
      const el = document.createElement('div');
      el.className = 'breath-circle';
      const s = Math.random() * 300 + 100;
      el.style.cssText = `width:${s}px;height:${s}px;left:${Math.random()*90}%;top:${Math.random()*90}%;animation-delay:${Math.random()*8}s;`;
      cont.appendChild(el);
    }
    wrap.appendChild(cont);
    window._breathCont = cont;
  },

  createKaleidoscope() {
    const wrap = document.querySelector('.css-wrap');
    const cont = document.createElement('div');
    cont.id = 'kaleidoscope-wrap';
    cont.style.cssText = 'position:fixed;inset:0;pointer-events:none;';
    wrap.appendChild(cont);
    window._kaleidoscope = [];
    this.spawnKaleidoscope();
    setInterval(() => this.updateKaleidoscope(), 100);
  },

  spawnKaleidoscope() {
    const cont = document.getElementById('kaleidoscope-wrap');
    if (!cont) return;
    const count = CFG.kaleidoCount !== undefined ? CFG.kaleidoCount : (2 + Math.floor(CFG.chaos / 30));
    const kSize = CFG.kaleidoSize || 80;
    for (let i = 0; i < count; i++) {
      const outer = document.createElement('div');
      outer.className = 'kaleidoscope';
      const x = Math.random() * window.innerWidth;
      const y = Math.random() * window.innerHeight;
      const s = kSize * (0.7 + Math.random() * 0.6);
      outer.style.cssText = `left:${x}px;top:${y}px;width:${s}px;height:${s}px;opacity:${CFG.intensity/100 * 0.35};`;
      const inner = document.createElement('div');
      inner.className = 'kaleidoscope-inner';
      outer.appendChild(inner);
      cont.appendChild(outer);
      window._kaleidoscope.push(outer);
    }
  },

  updateKaleidoscope() {
    if (!CFG.toggles.kaleidoscope) {
      window._kaleidoscope.forEach(el => { if (el) el.style.display = 'none'; });
      return;
    }
    const hue = Psy.hue || 0;
    window._kaleidoscope.forEach((el, i) => {
      if (!el) return;
      el.style.display = '';
      const h1 = (hue + i * 90) % 360;
      const h2 = (h1 + 120) % 360;
      const h3 = (h1 + 240) % 360;
      el.style.background = `conic-gradient(hsl(${h1},100%,60%), hsl(${h2},100%,50%), hsl(${h3},100%,60%), hsl(${h1},100%,50%))`;
      const inner = el.querySelector('.kaleidoscope-inner');
      if (inner) {
        inner.style.background = `conic-gradient(hsl(${h2},100%,50%), hsl(${h3},100%,60%), hsl(${h1},100%,50%), hsl(${h2},100%,60%))`;
      }
      el.style.boxShadow = `0 0 ${20 + Math.sin(Date.now() * 0.003 + i) * 10}px hsl(${h1},100%,50%)`;
    });
    if (Math.random() < 0.02 * (CFG.intensity / 100) && window._kaleidoscope.length < (CFG.kaleidoCount !== undefined ? CFG.kaleidoCount * 2 : 8)) this.spawnKaleidoscope();
    
    const maxKaleido = CFG.kaleidoCount !== undefined ? CFG.kaleidoCount * 1.5 : (6 + Math.floor(CFG.chaos / 20));
    if (window._kaleidoscope.length > maxKaleido) {
      const excess = window._kaleidoscope.splice(0, 2);
      excess.forEach(el => el.remove());
    }
  },

  initCursorTrail() {
    this._trailDots = [];
    document.addEventListener('mousemove', e => {
      if (!CFG.toggles.cursorTrail) return;
      const dot = document.createElement('div');
      dot.className = 'cursor-dot';
      const baseDotSz = CFG.cursorDotSize || 10;
      const sz = Math.random() * (baseDotSz * 0.8) + (baseDotSz * 0.5);
      const hue = (Date.now() * 0.2 + this._trailDots.length * 15) % 360;
      dot.style.cssText = `left:${e.clientX}px;top:${e.clientY}px;width:${sz}px;height:${sz}px;background:hsl(${hue},100%,60%);box-shadow:0 0 ${sz * 2}px hsl(${hue},100%,50%);transition:transform 0.4s ease-out, opacity 0.4s ease-out;`;
      document.body.appendChild(dot);
      this._trailDots.push(dot);
      
      const maxLen = Math.max(1, CFG.cursorTrailLength || 20);
      while (this._trailDots.length > maxLen) {
        const old = this._trailDots.shift();
        if (old && old.parentNode) old.remove();
      }

      // Auto fade dot after short time
      setTimeout(() => {
        if (dot && dot.parentNode) {
          dot.style.opacity = '0';
          dot.style.transform = 'scale(0.2)';
          setTimeout(() => { if (dot.parentNode) dot.remove(); }, 400);
        }
      }, maxLen * 25);
    });
    setInterval(() => {
      const maxLen = Math.max(1, CFG.cursorTrailLength || 20);
      while (this._trailDots.length > maxLen) {
        const old = this._trailDots.shift();
        if (old && old.parentNode) old.remove();
      }
      if (!CFG.toggles.cursorTrail && this._trailDots.length > 0) {
        this._trailDots.forEach(d => { if (d.parentNode) d.remove(); });
        this._trailDots = [];
      }
    }, 100);
  },

  bindClickBurst() {
    document.addEventListener('click', e => {
      if (!CFG.toggles.clickBurst) return;
      if (e.target.closest('#controls-panel') || e.target.closest('#panel-toggle')) return;
      burstParticles(e.clientX, e.clientY, Psy);
      for (let i = 0; i < 12; i++) {
        const p = document.createElement('div');
        const sz = Math.random() * 10 + 5;
        p.style.cssText = `position:fixed;left:${e.clientX}px;top:${e.clientY}px;width:${sz}px;height:${sz}px;border-radius:50%;background:hsl(${Math.random()*360},100%,50%);z-index:9999;pointer-events:none;`;
        document.body.appendChild(p);
        const angle = (i / 12) * Math.PI * 2;
        const bSpd = CFG.burstSpeed || 5;
        let vx = Math.cos(angle) * (Math.random() * bSpd + 2);
        let vy = Math.sin(angle) * (Math.random() * bSpd + 2);
        let op = 1;
        (function anim() {
          vx *= 0.98; vy *= 0.98;
          p.style.left = (parseFloat(p.style.left) + vx) + 'px';
          p.style.top = (parseFloat(p.style.top) + vy) + 'px';
          op -= 0.025; p.style.opacity = op; p.style.transform = `scale(${op})`;
          if (op > 0) requestAnimationFrame(anim); else p.remove();
        })();
      }
    });
  },

  bindRipples() {
    document.addEventListener('click', e => {
      if (!CFG.toggles.ripples) return;
      if (e.target.closest('#controls-panel') || e.target.closest('#panel-toggle')) return;
      const ripple = document.createElement('div');
      const hue = Math.random() * 360;
      const rSpd = Math.max(0.2, CFG.rippleSpeed || 1);
      ripple.style.cssText = `position:fixed;left:${e.clientX-15}px;top:${e.clientY-15}px;width:30px;height:30px;border-radius:50%;background:radial-gradient(circle, hsla(${hue},100%,70%,0.3), transparent 70%);border:3px solid hsla(${hue},100%,60%,0.8);pointer-events:none;z-index:9998;transform:scale(0.5);opacity:1;transition:all ${1/rSpd}s ease-out;box-shadow:0 0 30px hsla(${hue},100%,60%,0.3);`;
      document.body.appendChild(ripple);
      const rScale = CFG.rippleScale !== undefined ? CFG.rippleScale : 50;
      requestAnimationFrame(() => { ripple.style.transform = `scale(${rScale})`; ripple.style.opacity = '0'; });
      setTimeout(() => ripple.remove(), (1200 / rSpd));
    });
  },

  bindScreenFlash() {
    document.addEventListener('click', e => {
      if (!CFG.toggles.screenFlash) return;
      if (e.target.closest('#controls-panel') || e.target.closest('#panel-toggle')) return;
      
      const flash = document.createElement('div');
      flash.style.cssText = 'position:fixed;inset:0;background:white;z-index:99999;pointer-events:none;opacity:1;transition:opacity 0.2s ease-out;';
      document.body.appendChild(flash);
      
      requestAnimationFrame(() => {
        flash.style.opacity = '0';
      });
      
      setTimeout(() => {
        if (flash.parentNode) flash.remove();
      }, 200);
    });
  },

  updateVisibility() {
    if (window._orbs) window._orbs.forEach(el => { el.style.display = CFG.toggles.orbs ? '' : 'none'; });
    if (window._rings) window._rings.style.display = CFG.toggles.rings ? '' : 'none';
    const gridOv = document.querySelector('.grid-overlay');
    if (gridOv) {
      gridOv.style.display = CFG.toggles.gridOverlay ? '' : 'none';
      if (CFG.meshSize) gridOv.style.backgroundSize = `${CFG.meshSize}px ${CFG.meshSize}px`;
      if (CFG.meshOpacity) gridOv.style.opacity = CFG.meshOpacity;
    }
    if (window._mandala) window._mandala.style.display = CFG.toggles.mandala ? '' : 'none';
    if (window._beams) window._beams.style.display = CFG.toggles.beams ? '' : 'none';
    if (window._shapes) window._shapes.style.display = CFG.toggles.cssShapes ? '' : 'none';
    if (window._breathCont) window._breathCont.style.display = CFG.toggles.breathing ? '' : 'none';
    if (window._kaleidoscope) window._kaleidoscope.forEach(el => { if (el) el.style.display = CFG.toggles.kaleidoscope ? '' : 'none'; });

    if (!CFG.toggles.screenShake && typeof GLITCH !== 'undefined') GLITCH.clear();

    const webglWrap = document.getElementById('webgl-wrap');
    if (webglWrap) webglWrap.style.display = CFG.toggles.webgl ? 'block' : 'none';

    const textOverlay = document.getElementById('text-overlay');
    if (textOverlay && textOverlay.dataset.dismissed === 'true') {
      textOverlay.style.display = CFG.toggles.glitchText ? 'flex' : 'none';
    }

    if (!CFG.toggles.cursorTrail && this._trailDots.length > 0) {
      this._trailDots.forEach(d => { if (d.parentNode) d.remove(); });
      this._trailDots = [];
    }
  },

  startGlitchInterval() {
    if (this._glitchInt) clearInterval(this._glitchInt);
    const interval = Math.max(200, CFG.glitchInterval || 2500);
    this._glitchInt = setInterval(() => {
      if (CFG.toggles.glitchText) GLITCH.triggerTextGlitch();
    }, interval);
  },

  _startMotionLoop() {
    if (this._motionLoopActive) return;
    this._motionLoopActive = true;
    const animateMotion = () => {
      const t = Date.now() * 0.001;

      // 1. Mandala Motion & Mouse Reactivity
      if (window._mandala && CFG.toggles.mandala) {
        let mx = 0, my = 0;
        if (CFG.mandalaMouseReact && Psy.mouseX >= 0) {
          const dx = Psy.mouseX - (window.innerWidth / 2);
          const dy = Psy.mouseY - (window.innerHeight / 2);
          mx = dx * 0.25;
          my = dy * 0.25;
        }
        let fx = 0, fy = 0;
        if (CFG.mandalaFloat) {
          const mSpd = CFG.mandalaMoveSpeed || 1;
          fx = Math.sin(t * 0.8 * mSpd) * (window.innerWidth * 0.2) + Math.cos(t * 1.3 * mSpd) * 40;
          fy = Math.cos(t * 0.6 * mSpd) * (window.innerHeight * 0.15) + Math.sin(t * 1.1 * mSpd) * 40;
        }
        window._mandala.style.transform = `translate(calc(-50% + ${fx + mx}px), calc(-50% + ${fy + my}px))`;
      }

      // 2. Rings Motion & Mouse Reactivity
      if (window._rings && CFG.toggles.rings) {
        let mx = 0, my = 0;
        if (CFG.ringsMouseReact && Psy.mouseX >= 0) {
          const dx = Psy.mouseX - (window.innerWidth / 2);
          const dy = Psy.mouseY - (window.innerHeight / 2);
          mx = dx * 0.3;
          my = dy * 0.3;
        }
        let fx = 0, fy = 0;
        if (CFG.ringsFloat) {
          const rSpd = CFG.ringsMoveSpeed || 1;
          fx = Math.cos(t * 0.7 * rSpd) * (window.innerWidth * 0.22) + Math.sin(t * 1.2 * rSpd) * 50;
          fy = Math.sin(t * 0.5 * rSpd) * (window.innerHeight * 0.18) + Math.cos(t * 0.9 * rSpd) * 50;
        }
        window._rings.style.transform = `translate(calc(-50% + ${fx + mx}px), calc(-50% + ${fy + my}px))`;
      }

      requestAnimationFrame(animateMotion);
    };
    requestAnimationFrame(animateMotion);
  }
};
