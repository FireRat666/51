const GLITCH = {
  init() {
    this.initScreenShake();
  },

  initScreenShake() {
    this._shakeInt = setInterval(() => {
      if (!CFG.toggles.screenShake) return;
      if (Math.random() > CFG.chaos / 100) return;
      
      const baseIntensity = CFG.screenShakeIntensity !== undefined ? CFG.screenShakeIntensity : 3;
      const intensity = (CFG.chaos / 100) * baseIntensity;
      
      document.body.style.transform = `translate(${Math.random()*intensity*2-intensity}px, ${Math.random()*intensity*2-intensity}px)`;
      setTimeout(() => { document.body.style.transform = ''; }, 50 + Math.random() * 100);
    }, 1500);
  },

  clear() {
    document.body.style.transform = '';
  },

  triggerTextGlitch() {
    const el = document.querySelector('.glitch-text');
    if (!el) return;
    const offset = Math.floor(Math.random() * 40) - 20;
    el.style.transform = `translate(${offset}px, ${Math.sin(Date.now()/50)*5}px)`;
    el.style.textShadow = `${offset}px ${offset}px 0px hsl(${Date.now()%360},100%,50%), ${-offset}px ${-offset}px 0px hsl(${(Date.now()+180)%360},100%,50%)`;
    setTimeout(() => { el.style.transform = ''; el.style.textShadow = ''; }, 100 + Math.random() * 200);
  }
};
