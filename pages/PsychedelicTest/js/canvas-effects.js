function drawStars(ctx, t, spd, P) {
  const count = CFG.starCount || 50;
  const sSpd = (CFG.starSpeed !== undefined ? CFG.starSpeed : 1) * spd;
  const baseSize = CFG.starSize || 2;
  for (let i = 0; i < count; i++) {
    let sx = ((i * 137.5 + t * 10 * sSpd) % P.w);
    let sy = ((i * 293.7 + Math.sin(t * sSpd + i) * 5) % P.h);
    if (CFG.interactStars && P.mouseX >= 0) {
      const dx = P.mouseX - sx, dy = P.mouseY - sy;
      const dist = Math.sqrt(dx * dx + dy * dy);
      if (dist < CFG.mouseRadius) {
        const force = (CFG.mouseRadius - dist) / CFG.mouseRadius;
        sx -= dx * force * 0.5;
        sy -= dy * force * 0.5;
      }
    }
    const size = Math.max(0.5, (baseSize * 0.5) + Math.sin(t * 3 * sSpd + i) * (baseSize * 0.5));
    const alpha = 0.3 + Math.sin(t * 2 * sSpd + i * 0.5) * 0.3;
    ctx.fillStyle = `rgba(255,255,255,${alpha})`;
    ctx.beginPath(); ctx.arc(sx, sy, size, 0, Math.PI * 2); ctx.fill();
  }
}

function drawBreathing(ctx, t, spd, P) {
  const count = CFG.breathCount || 6;
  const bSpd = (CFG.breathSpeed !== undefined ? CFG.breathSpeed : 1) * spd;
  const bSize = CFG.breathSize || 60;
  for (let i = 0; i < count; i++) {
    const cx = ((i * 197.3 + t * 5 * bSpd) % P.w);
    const cy = ((i * 311.7 + Math.sin(t * bSpd + i) * 10) % P.h);
    const r = bSize + Math.sin(t * bSpd + i * 1.5) * (bSize * 0.4);
    const grad = ctx.createRadialGradient(cx, cy, 0, cx, cy, Math.max(1, r));
    grad.addColorStop(0, `hsla(${P.hue + i * 60}, 80%, 60%, 0.15)`);
    grad.addColorStop(1, 'transparent');
    ctx.fillStyle = grad;
    ctx.beginPath(); ctx.arc(cx, cy, Math.max(1, r), 0, Math.PI * 2); ctx.fill();
  }
}

function drawFractalMandala(ctx, t, spd, P) {
  const arms = Math.max(1, CFG.modeArms) + Math.floor(Math.sin(t * 0.1 * spd) * 2);
  const layers = Math.max(1, CFG.modeLayers);
  for (let layer = layers; layer >= 0; layer--) {
    const baseRadius = 50 + layer * 40 + Math.sin(t * 0.3 * spd + layer) * 20;
    for (let i = 0; i < arms; i++) {
      const angle = (Math.PI * 2 / arms) * i + t * CFG.modeWarp * spd + layer * 0.1;
      const r = baseRadius + Math.sin(t + i * 0.5) * 30;
      const x = P.cx + Math.cos(angle) * r;
      const y = P.cy + Math.sin(angle) * r;
      const size = 20 + Math.sin(t * 2 * spd + layer + i) * 15;
      ctx.save(); ctx.translate(x, y); ctx.rotate(angle + t * spd);
      const hue = t * 30 * spd + layer * 40 + i * 20;
      ctx.shadowBlur = 30; ctx.shadowColor = P.hsl(hue, 100, 50, 0.8);
      ctx.fillStyle = P.hsl(hue, 90, 60, 0.7);
      ctx.beginPath();
      // FIX: Calculate shape from time, allow drawing with any value >= 1
      const shape = Math.floor(Math.abs(Math.sin(t + layer) * 3) + 1);
      if (shape === 1) {
        // Single dot
        ctx.arc(0, 0, size * 0.3, 0, Math.PI * 2);
      } else if (shape === 2) {
        // Line segment
        ctx.moveTo(-size * 0.5, 0);
        ctx.lineTo(size * 0.5, 0);
        ctx.lineWidth = 3;
        ctx.strokeStyle = P.hsl(hue, 90, 60, 0.7);
        ctx.stroke();
        ctx.restore();
        continue;
      } else {
        // Polygon
        for (let j = 0; j <= shape; j++) {
          const a2 = (Math.PI * 2 / shape) * j;
          const pr = size * (0.5 + Math.sin(a2 * 3 + t) * 0.5);
          const px = Math.cos(a2) * pr, py = Math.sin(a2) * pr;
          j === 0 ? ctx.moveTo(px, py) : ctx.lineTo(px, py);
        }
      }
      ctx.closePath(); ctx.fill(); ctx.restore();
    }
  }
}

function drawWaveTunnel(ctx, t, spd, P) {
  const rings = Math.max(1, CFG.modeRings);
  for (let i = rings; i >= 0; i--) {
    const progress = (i + t * 2 * spd) % Math.max(1, rings) / Math.max(1, rings);
    const radius = progress * Math.max(P.w, P.h) * 0.8;
    const segments = Math.max(1, CFG.modeSegments + Math.floor(Math.sin(t * 0.5 * spd) * 3));
    const distortion = Math.sin(t * CFG.modeDistSpeed * spd + i * 0.5) * CFG.modeDistortion;
    for (let s = 0; s < segments; s++) {
      const angle = (Math.PI * 2 / segments) * s + t * spd + progress * Math.PI;
      const r2 = radius + Math.sin(angle * 6 + t * 4 * spd) * distortion + Math.cos(angle * 3 - t * 2 * spd) * 15;
      const x = P.cx + Math.cos(angle) * r2, y = P.cy + Math.sin(angle) * r2;
      const size = 5 + (1 - progress) * 30;
      const hue = t * 40 * spd + i * 10 + s * 15;
      ctx.shadowBlur = 20; ctx.shadowColor = P.hsl(hue, 100, 60);
      ctx.fillStyle = P.hsl(hue, 95, 55, 0.8 - progress * 0.5);
      ctx.beginPath(); ctx.arc(x, y, size, 0, Math.PI * 2); ctx.fill();
    }
  }
}

function drawFluidCosmos(ctx, t, spd, P) {
  const blobs = Math.max(1, CFG.modeBlobs);
  const swirls = Math.max(1, CFG.modeSwirls);
  for (let i = 0; i < blobs; i++) {
    const angle = (Math.PI * 2 / blobs) * i + t * 0.3 * spd;
    const orbitRadius = 100 + Math.sin(t * 0.5 * spd + i) * 80;
    const bx = P.cx + Math.cos(angle) * orbitRadius + Math.sin(t + i * 2) * 50;
    const by = P.cy + Math.sin(angle) * orbitRadius + Math.cos(t * 1.3 * spd + i) * 50;
    const radius = 80 + Math.sin(t * 2 * spd + i * 1.7) * 40;
    const grad = ctx.createRadialGradient(bx, by, 0, bx, by, radius);
    const hue = t * 25 * spd + i * 30;
    grad.addColorStop(0, P.hsl(hue, 100, 70, 0.4));
    grad.addColorStop(0.5, P.hsl(hue + 30, 90, 50, 0.2));
    grad.addColorStop(1, 'transparent');
    ctx.fillStyle = grad;
    ctx.fillRect(bx - radius, by - radius, radius * 2, radius * 2);
  }
  for (let s = 0; s < swirls; s++) {
    ctx.beginPath();
    const startAngle = (Math.PI * 2 / swirls) * s + t * 0.4 * spd;
    let sx = P.cx + Math.cos(startAngle) * 50, sy = P.cy + Math.sin(startAngle) * 50;
    ctx.moveTo(sx, sy);
    for (let step = 0; step < 100; step++) {
      const pr = step / 100;
      const sr = pr * Math.min(P.w, P.h) * 0.45;
      const sa = startAngle + pr * Math.PI * 4 + t * spd;
      const wave = Math.sin(pr * 20 + t * 3 * spd) * 20;
      const nx = P.cx + Math.cos(sa) * (sr + wave);
      const ny = P.cy + Math.sin(sa) * (sr + wave);
      ctx.lineTo(nx, ny);
    }
    const hue = t * 30 * spd + s * 45;
    ctx.strokeStyle = P.hsl(hue, 100, 60, 0.3);
    ctx.lineWidth = 3 + Math.sin(t + s) * 2;
    ctx.shadowBlur = 25; ctx.shadowColor = P.hsl(hue, 100, 50);
    ctx.stroke();
  }
}

function drawGeoTrippy(ctx, t, spd, P) {
  const geoLayers = Math.max(1, CFG.modeGeoLayers);
  for (let l = geoLayers; l >= 0; l--) {
    const scale = l / Math.max(1, geoLayers);
    const rot = t * (0.5 + l * 0.1) * spd * (l % 2 === 0 ? 1 : -1);
    const baseSize = 30 + l * 35;
    const hue = t * 35 * spd + l * 30;
    ctx.save(); ctx.translate(P.cx, P.cy); ctx.rotate(rot);
    for (let side = 0; side < 4; side++) {
      const size = baseSize + Math.sin(t + l + side) * 15;
      const sides = side + 3;
      const ox = Math.sin(t * 0.7 * spd + side) * 40;
      const oy = Math.cos(t * 0.9 * spd + side) * 40;
      ctx.beginPath();
      for (let j = 0; j <= sides; j++) {
        const a = (Math.PI * 2 / sides) * j - Math.PI / 2 + t * 0.5 * spd;
        const wr = size + Math.sin(a * 3 + t * 2 * spd) * 10;
        const px = Math.cos(a) * wr + ox, py = Math.sin(a) * wr + oy;
        j === 0 ? ctx.moveTo(px, py) : ctx.lineTo(px, py);
      }
      ctx.closePath();
      ctx.strokeStyle = P.hsl(hue + side * 20, 95, 60, 0.8 - scale * 0.4);
      ctx.lineWidth = 2;
      ctx.shadowBlur = 20; ctx.shadowColor = P.hsl(hue + side * 20, 100, 50);
      ctx.stroke();
    }
    ctx.restore();
  }
}

function drawPlasmaField(ctx, t, spd, P) {
  // Clamp resolution to minimum 3px for performance even if slider goes to 1
  const res = Math.max(3, CFG.modePlasmaRes);
  for (let x = 0; x < P.w; x += res) {
    for (let y = 0; y < P.h; y += res) {
      const dx = (x - P.cx) / P.w, dy = (y - P.cy) / P.h;
      const dist = Math.sqrt(dx * dx + dy * dy);
      const angle = Math.atan2(dy, dx);
      let v1 = Math.sin(t * 2 * spd + dist * 20);
      let v2 = Math.sin(t * 1.5 * spd + angle * 3 + dist * 15);
      let v3 = Math.sin(t * 1.8 * spd + (x + y) * 0.01);
      const mdist = P.mouseX >= 0 ? Math.sqrt((x - P.mouseX) ** 2 + (y - P.mouseY) ** 2) : 9999;
      let v4 = Math.sin(t * 2.5 * spd + mdist * 0.02);
      const val = (v1 + v2 + v3 + v4) / 4;
      const hue = (val * 180 + t * 50 * spd + dist * 200) % 360;
      const sat = 80 + val * 20, lit = 40 + val * 30;
      ctx.fillStyle = P.hsl(hue, sat, lit, 0.5);
      ctx.fillRect(x, y, res, res);
    }
  }
}

// NEW: Spiral Galaxy (mode 5)
function drawSpiralGalaxy(ctx, t, spd, P) {
  const arms = Math.max(1, CFG.modeSpiralArms);
  const tightness = CFG.modeSpiralTightness * 0.3;
  const starCount = CFG.modeSpiralStars;

  // Mouse warp
  let mx = 0, my = 0;
  if (P.mouseX >= 0) {
    mx = (P.mouseX - P.cx) * 0.03;
    my = (P.mouseY - P.cy) * 0.03;
  }

  // Dust cloud center
  const centerGrad = ctx.createRadialGradient(P.cx, P.cy, 0, P.cx, P.cy, Math.min(P.w, P.h) * 0.15);
  centerGrad.addColorStop(0, P.hsl(t * 20, 80, 70, 0.25));
  centerGrad.addColorStop(1, 'transparent');
  ctx.fillStyle = centerGrad;
  ctx.beginPath(); ctx.arc(P.cx, P.cy, Math.min(P.w, P.h) * 0.15, 0, Math.PI * 2); ctx.fill();

  const timeRot = t * 0.15 * spd;

  for (let a = 0; a < arms; a++) {
    const armAngle = (Math.PI * 2 / arms) * a;
    for (let i = 0; i < starCount; i++) {
      const frac = i / starCount;
      const logR = Math.pow(frac, 0.7) * Math.min(P.w, P.h) * 0.45;
      const spiralAngle = armAngle + frac * tightness * Math.PI * 2 + timeRot;
      // Add scatter
      const scatter = (Math.sin(i * 137.508) * 0.5) * (logR * 0.15);
      const scatterY = (Math.cos(i * 97.3) * 0.5) * (logR * 0.15);
      const x = P.cx + Math.cos(spiralAngle) * logR + scatter + mx;
      const y = P.cy + Math.sin(spiralAngle) * logR + scatterY + my;

      const starSize = (1 - frac * 0.5) * 2 + Math.sin(t * 3 + i) * 0.5;
      const hue = t * 25 * spd + frac * 120 + a * (360 / arms);
      const alpha = (1 - frac * 0.6) * 0.8;

      ctx.beginPath(); ctx.arc(x, y, Math.max(0.5, starSize), 0, Math.PI * 2);
      ctx.fillStyle = P.hsl(hue, 90, 70, alpha);
      if (i % 15 === 0) {
        ctx.shadowBlur = 15; ctx.shadowColor = P.hsl(hue, 100, 60);
      } else {
        ctx.shadowBlur = 0;
      }
      ctx.fill();

      // Dust clouds every 40 stars
      if (i % 40 === 0 && logR > 30) {
        const dustGrad = ctx.createRadialGradient(x, y, 0, x, y, logR * 0.12);
        dustGrad.addColorStop(0, P.hsl(hue + 30, 60, 50, 0.08));
        dustGrad.addColorStop(1, 'transparent');
        ctx.fillStyle = dustGrad;
        ctx.beginPath(); ctx.arc(x, y, logR * 0.12, 0, Math.PI * 2); ctx.fill();
      }
    }
  }
  ctx.shadowBlur = 0;
}

// NEW: Sacred Geometry (mode 6)
function drawSacredGeometry(ctx, t, spd, P) {
  const layers = Math.max(1, CFG.modeSacredLayers);
  const sym = Math.max(1, CFG.modeSacredSymmetry);
  const baseR = 50;
  const rot = t * 0.1 * spd;

  ctx.save();
  ctx.translate(P.cx, P.cy);
  ctx.rotate(rot);

  // Flower of Life: concentric layers of circles
  for (let l = 0; l < layers; l++) {
    const layerR = baseR * (l + 1);
    const pulse = Math.sin(t * 1.5 * spd + l * 0.7) * 8;

    // Central circle
    ctx.beginPath();
    ctx.arc(0, 0, layerR + pulse, 0, Math.PI * 2);
    ctx.strokeStyle = P.hsl(t * 20 * spd + l * 30, 80, 60, 0.3);
    ctx.lineWidth = 1.5;
    ctx.stroke();

    // Petal circles at vertices
    for (let s = 0; s < sym; s++) {
      const angle = (Math.PI * 2 / sym) * s + l * 0.1;
      const cx = Math.cos(angle) * layerR;
      const cy = Math.sin(angle) * layerR;

      // Flower petal circle
      ctx.beginPath();
      ctx.arc(cx, cy, baseR + pulse * 0.5, 0, Math.PI * 2);
      ctx.strokeStyle = P.hsl(t * 15 * spd + s * (360 / sym) + l * 20, 85, 55, 0.4);
      ctx.lineWidth = 1;
      ctx.stroke();

      // Metatron's Cube: connect all vertices to each other
      for (let s2 = s + 1; s2 < sym; s2++) {
        const angle2 = (Math.PI * 2 / sym) * s2 + l * 0.1;
        const cx2 = Math.cos(angle2) * layerR;
        const cy2 = Math.sin(angle2) * layerR;
        ctx.beginPath();
        ctx.moveTo(cx, cy);
        ctx.lineTo(cx2, cy2);
        ctx.strokeStyle = P.hsl(t * 10 * spd + (s + s2) * 20, 60, 50, 0.15);
        ctx.lineWidth = 0.5;
        ctx.stroke();
      }

      // Connect to center
      ctx.beginPath();
      ctx.moveTo(0, 0);
      ctx.lineTo(cx, cy);
      ctx.strokeStyle = P.hsl(t * 12 * spd + s * 40, 50, 50, 0.2);
      ctx.lineWidth = 0.5;
      ctx.stroke();

      // Glowing intersection points
      const glowSize = 3 + Math.sin(t * 3 * spd + s + l) * 2;
      ctx.beginPath();
      ctx.arc(cx, cy, glowSize, 0, Math.PI * 2);
      ctx.fillStyle = P.hsl(t * 30 * spd + s * 60, 100, 75, 0.8);
      ctx.shadowBlur = 12;
      ctx.shadowColor = P.hsl(t * 30 * spd + s * 60, 100, 60);
      ctx.fill();
    }
  }
  ctx.shadowBlur = 0;
  ctx.restore();
}

// NEW: Digital Rain (mode 7)
const _rainChars = 'アイウエオカキクケコサシスセソタチツテトナニヌネノハヒフヘホマミムメモヤユヨラリルレロワヲン0123456789ABCDEF@#$%&';
let _rainDrops = null;

function drawDigitalRain(ctx, t, spd, P) {
  const cols = Math.max(1, CFG.modeRainColumns);
  const speed = CFG.modeRainSpeed;
  const density = CFG.modeRainDensity;
  const colW = P.w / cols;
  const fontSize = Math.max(8, Math.min(colW * 0.8, 20));
  const rows = Math.ceil(P.h / fontSize);

  // Initialize or resize drops
  if (!_rainDrops || _rainDrops.length !== cols) {
    _rainDrops = [];
    for (let c = 0; c < cols; c++) {
      _rainDrops.push({
        y: Math.random() * rows,
        speed: 0.3 + Math.random() * 0.7,
        chars: []
      });
      // Pre-fill chars
      for (let r = 0; r < rows; r++) {
        _rainDrops[c].chars.push(_rainChars[Math.floor(Math.random() * _rainChars.length)]);
      }
    }
  }

  ctx.font = `${fontSize}px monospace`;
  ctx.textAlign = 'center';

  for (let c = 0; c < cols; c++) {
    if (c >= _rainDrops.length) break;
    const drop = _rainDrops[c];

    // Update drop position
    drop.y += speed * 0.05 * spd * drop.speed;
    if (drop.y > rows + 15) {
      drop.y = -5;
      drop.speed = 0.3 + Math.random() * 0.7;
    }

    // Random char changes
    if (Math.random() < density * 0.1) {
      const ri = Math.floor(Math.random() * rows);
      if (ri < drop.chars.length) {
        drop.chars[ri] = _rainChars[Math.floor(Math.random() * _rainChars.length)];
      }
    }

    const x = c * colW + colW * 0.5;
    const headY = Math.floor(drop.y);

    // Mouse interaction
    let mx = 0;
    if (P.mouseX >= 0) {
      const dx = x - P.mouseX;
      const dist = Math.abs(dx);
      if (dist < CFG.mouseRadius) {
        mx = (dx / Math.max(1, dist)) * (CFG.mouseRadius - dist) * 0.1;
      }
    }

    // Draw trail of characters
    const trailLen = 15 + Math.floor(density * 10);
    for (let i = 0; i < trailLen; i++) {
      const row = headY - i;
      if (row < 0 || row >= rows) continue;
      const ry = row * fontSize;
      const char = drop.chars[row % drop.chars.length];

      if (i === 0) {
        // Leading character: bright white
        ctx.fillStyle = '#ffffff';
        ctx.shadowBlur = 10;
        ctx.shadowColor = P.hsl(P.hue + c * 3, 100, 80);
      } else if (i < 3) {
        ctx.fillStyle = P.hsl(P.hue + c * 3, 100, 75, 0.9);
        ctx.shadowBlur = 5;
        ctx.shadowColor = P.hsl(P.hue + c * 3, 100, 60);
      } else {
        const alpha = (1 - i / trailLen) * 0.7;
        ctx.fillStyle = P.hsl(P.hue + c * 3, 80, 50, alpha);
        ctx.shadowBlur = 0;
      }

      ctx.fillText(char, x + mx, ry);
    }
  }
  ctx.shadowBlur = 0;
}

function drawWarpTunnel(ctx, t, spd, P) {
  const count = CFG.warpCount || 30;
  const wSpd = (CFG.warpSpeed !== undefined ? CFG.warpSpeed : 1) * spd;
  const scaleMult = CFG.warpScale || 1;
  for (let i = 0; i < count; i++) {
    const angle = (i / count) * Math.PI * 2 + t * wSpd;
    const radius = (100 + Math.sin(t * 2 * wSpd + i) * 50) * scaleMult;
    const wf = 1 + Math.sin(t * 3 * wSpd + i * 0.5) * 0.3;
    const x = P.cx + Math.cos(angle) * radius * wf;
    const y = P.cy + Math.sin(angle) * radius * wf;
    const size = (radius % 20) + 2;
    const hueOff = (i / count) * 360 + P.hue;
    ctx.beginPath(); ctx.arc(x, y, size, 0, Math.PI * 2);
    ctx.fillStyle = `hsla(${hueOff},100%,60%,0.6)`;
    ctx.shadowBlur = 12; ctx.shadowColor = `hsla(${hueOff},100%,50%,0.6)`;
    ctx.fill(); ctx.shadowBlur = 0;
  }
}

function drawNeonGrid(ctx, t, spd, P) {
  const gridSize = CFG.gridSize || 40;
  const gSpd = (CFG.gridSpeed !== undefined ? CFG.gridSpeed : 1) * spd;
  const op = CFG.gridOpacity !== undefined ? CFG.gridOpacity : 0.15;
  ctx.strokeStyle = `hsla(${P.hue + 180},100%,50%,${op})`;
  ctx.lineWidth = 1;
  for (let x = 0; x <= P.w; x += gridSize) {
    ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, P.h); ctx.stroke();
  }
  const offset = (t * 100 * gSpd) % gridSize;
  for (let y = offset; y <= P.h; y += gridSize) {
    ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(P.w, y); ctx.stroke();
  }
}

function drawFlickerGrid(ctx, t, spd, P) {
  const gridSize = CFG.flickerSize || 30;
  const fRate = CFG.flickerRate || 0.05;
  const fOp = CFG.flickerOpacity !== undefined ? CFG.flickerOpacity : 0.8;
  for (let x = 0; x < P.w; x += gridSize) {
    for (let y = 0; y < P.h; y += gridSize) {
      if (Math.random() < fRate) {
        ctx.fillStyle = P.hsl(P.hue + Math.random() * 60, 100, 70, fOp);
        ctx.fillRect(x, y, gridSize, gridSize);
      }
    }
  }
}

function drawChromaticAberration(ctx, t, P) {
  const shift = CFG.chromaticShift !== undefined ? CFG.chromaticShift : 5;
  particleList.forEach(p => {
    ctx.save();
    ctx.globalCompositeOperation = 'screen';
    ctx.beginPath(); ctx.arc(p.x + shift, p.y, p.size * 0.5, 0, Math.PI * 2);
    ctx.fillStyle = 'rgba(255,0,50,0.5)'; ctx.fill();
    ctx.beginPath(); ctx.arc(p.x - shift, p.y, p.size * 0.5, 0, Math.PI * 2);
    ctx.fillStyle = 'rgba(0,200,255,0.5)'; ctx.fill();
    ctx.restore();
  });
  ctx.filter = 'none';
}

function drawVignette(ctx, P) {
  const darkness = CFG.vignetteDarkness !== undefined ? CFG.vignetteDarkness : 0.8;
  const vRad = CFG.vignetteRadius !== undefined ? CFG.vignetteRadius : 0.7;
  const grad = ctx.createRadialGradient(P.cx, P.cy, Math.min(P.w, P.h) * 0.3 * vRad, P.cx, P.cy, Math.max(P.w, P.h) * vRad);
  grad.addColorStop(0, 'transparent');
  grad.addColorStop(1, `rgba(0,0,0,${darkness})`);
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, P.w, P.h);
}

function drawEmojiRain(ctx, t, spd, P) {
  if (!window._emojiRain) {
    window._emojiRain = [];
    window._emojiChars = ['🌀','✨','💫','🌈','🔮','👁️','🦋','🌺','🍄','⚡'];
  }
  const rain = window._emojiRain;
  const eRate = CFG.emojiRate || 0.15;
  const eSize = CFG.emojiSize || 24;
  if (Math.random() < eRate * spd) {
    rain.push({ x: Math.random() * P.w, y: -30, e: window._emojiChars[Math.floor(Math.random() * window._emojiChars.length)], s: Math.random() * 2 + 1, r: Math.random() * 6 });
  }
  ctx.save(); ctx.globalCompositeOperation = 'source-over';
  for (let i = rain.length - 1; i >= 0; i--) {
    const e = rain[i]; e.y += e.s * spd; e.r += 0.05 * spd;
    if (e.y > P.h + 30) { rain.splice(i, 1); continue; }
    ctx.save(); ctx.translate(e.x, e.y); ctx.rotate(e.r);
    ctx.globalAlpha = Math.max(0, 1 - (e.y / P.h));
    ctx.font = eSize + 'px Arial'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
    ctx.fillText(e.e, 0, 0); ctx.restore();
  }
  ctx.restore();
}
