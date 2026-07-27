let particleList = [];

class Particle {
  constructor(x, y, opts = {}) {
    this.x = x != null ? x : Math.random() * Psy.w;
    this.y = y != null ? y : Math.random() * Psy.h;
    this.size = opts.size || Math.random() * 3 + 1;
    this.hue = opts.hue != null ? opts.hue : Psy.hue + Math.random() * 60;
    this.life = opts.life || 1;
    this.decay = opts.decay || Math.random() * 0.005 + 0.002;
    this.trail = [];
    this.maxTrail = CFG.trailLen * 50;
    this.style = CFG.particleStyle;
    this.sx = (Math.random() - 0.5) * 2 * CFG.speed;
    this.sy = (Math.random() - 0.5) * 2 * CFG.speed;
    if (this.style === 'spiral') { this.angle = Math.random() * 6.28; this.spd = 0.02; }
    if (this.style === 'vortex') { this.vs = 0.5; }
    if (this.style === 'rainbow') { this.roff = 0; }
    if (this.style === 'burst') { this.br = 0; this.angle = Math.random() * 6.28; }
  }

  update(spd, P) {
    const dt = spd;
    switch (this.style) {
      case 'spiral':
        this.angle += this.spd * dt;
        const d = Math.sin(this.angle * 5) * 50 * dt;
        this.x += Math.cos(this.angle) * d;
        this.y += Math.sin(this.angle) * d;
        break;
      case 'vortex':
        const a = Math.atan2(P.cy - this.y, P.cx - this.x);
        const f = Math.sin(a * 3) * this.vs * dt;
        this.x += Math.cos(a + 1.57) * f;
        this.y += Math.sin(a + 1.57) * f;
        break;
      case 'rainbow':
        this.roff += 2 * dt;
        this.x += Math.cos(this.roff) * 30 * dt;
        this.y += Math.sin(this.roff) * 30 * dt;
        break;
      case 'burst':
        this.br += 10 * dt;
        this.x += Math.cos(this.angle) * 10 * dt;
        this.y += Math.sin(this.angle) * 10 * dt;
        break;
      default:
        this.x += this.sx * dt;
        this.y += this.sy * dt;
    }
    if (this.sx != null) {
      if (this.x < 0 || this.x > P.w) this.sx *= -1;
      if (this.y < 0 || this.y > P.h) this.sy *= -1;
    } else {
      if (this.x < -50) this.x = P.w + 50;
      if (this.x > P.w + 50) this.x = -50;
      if (this.y < -50) this.y = P.h + 50;
      if (this.y > P.h + 50) this.y = -50;
    }
    const dx = P.mouseX - this.x, dy = P.mouseY - this.y;
    const dist = Math.sqrt(dx * dx + dy * dy);
    if (dist > 0 && dist < CFG.mouseRadius && P.mouseX >= 0) {
      const force = (CFG.mouseRadius - dist) / CFG.mouseRadius;
      this.x -= (dx / dist) * force * 3;
      this.y -= (dy / dist) * force * 3;
    }
    this.life -= this.decay * spd;
    this.trail.push({ x: this.x, y: this.y, a: 1 });
    if (this.trail.length > this.maxTrail) this.trail.shift();
    else this.trail.forEach(t => t.a -= 0.05 * spd);
  }
}

function updateParticles(t, spd, P) {
  const target = CFG.particleCount;
  while (particleList.length < target) particleList.push(new Particle());
  while (particleList.length > target) particleList.pop();
  particleList.forEach(p => {
    p.style = CFG.particleStyle;
    p.update(spd, P);
  });
}

function drawParticles(ctx, P) {
  particleList.forEach(p => {
    let hue = p.hue;
    if (p.style === 'rainbow') hue = (P.hue + p.roff) % 360;
    ctx.beginPath(); ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
    ctx.fillStyle = `hsl(${hue},100%,60%)`;
    if (CFG.glowIntensity > 20) {
      ctx.shadowBlur = CFG.glowIntensity * 0.3;
      ctx.shadowColor = `hsl(${hue},100%,50%)`;
    }
    ctx.fill();
    ctx.shadowBlur = 0;
  });
}

function drawConnections(ctx, P) {
  if (particleList.length > 150) return;
  const distThreshold = CFG.connectionDist !== undefined ? CFG.connectionDist : 80;
  for (let i = 0; i < particleList.length; i++) {
    for (let j = i + 1; j < particleList.length; j++) {
      const dx = particleList[i].x - particleList[j].x;
      const dy = particleList[i].y - particleList[j].y;
      const dist = Math.sqrt(dx * dx + dy * dy);
      if (dist < distThreshold) {
        const a = 1 - dist / distThreshold;
        ctx.beginPath();
        ctx.moveTo(particleList[i].x, particleList[i].y);
        ctx.lineTo(particleList[j].x, particleList[j].y);
        ctx.strokeStyle = `hsla(${(P.hue + i * 2) % 360},100%,50%,${a * 0.3})`;
        ctx.lineWidth = 0.5;
        ctx.stroke();
      }
    }
  }
}

function drawTrails(ctx, P) {
  particleList.forEach(p => {
    p.trail.forEach(pt => {
      ctx.beginPath();
      ctx.arc(pt.x, pt.y, p.size * 0.3, 0, Math.PI * 2);
      ctx.fillStyle = `hsla(${p.hue},100%,50%,${pt.a * 0.2})`;
      ctx.fill();
    });
  });
}

function burstParticles(x, y, P) {
  const count = CFG.burstCount !== undefined ? CFG.burstCount : 20;
  for (let i = 0; i < count; i++) {
    const angle = (i / count) * Math.PI * 2;
    const speed = Math.random() * 5 + 2;
    const p = new Particle(x, y, { life: 1, decay: 0.01 });
    p.angle = angle;
    p.sx = Math.cos(angle) * speed;
    p.sy = Math.sin(angle) * speed;
    particleList.push(p);
  }
}
