const CFG = {
  mode: 0, modeOff: false,
  speed: 1, colorSpeed: 0.5, intensity: 80, chaos: 50, trailLen: 0.15,
  particleCount: 300, particleStyle: 'normal',
  bgFade: 0.12,
  mouseRadius: 150, glowIntensity: 50, colorScheme: 'neon',
  interactStars: true, interactCSS: true,

  // Per-mode parameters
  modeArms: 6, modeLayers: 8, modeRings: 40, modeSegments: 12,
  modeBlobs: 15, modeSwirls: 8, modeGeoLayers: 10, modePlasmaRes: 10,
  modeDistortion: 20, modeDistSpeed: 3, modeWarp: 0.2,
  modeSpiralArms: 5, modeSpiralTightness: 3, modeSpiralStars: 200,
  modeSacredLayers: 6, modeSacredSymmetry: 6,
  modeRainColumns: 30, modeRainSpeed: 2, modeRainDensity: 0.4,

  // WebGL
  webglIntensity: 0.7, webglSpeed: 0.3, webglComplexity: 4,

  // Canvas Overlay Detailed Controls
  starCount: 50, starSpeed: 1, starSize: 2,
  warpSpeed: 1, warpCount: 10, warpScale: 1,
  gridSize: 40, gridSpeed: 1, gridOpacity: 0.15,
  flickerSize: 40, flickerRate: 0.01, flickerOpacity: 0.15,
  vignetteDarkness: 0.8, vignetteRadius: 0.7,
  chromaticShift: 5,
  breathCount: 6, breathSpeed: 1, breathSize: 60,

  // CSS Element Detailed Controls
  orbCount: 5, orbSize: 250, orbBlur: 40,
  ringCount: 7, ringSpeed: 1, ringSize: 400,
  beamCount: 8, beamWidth: 2, beamSpeed: 1,
  shapeCount: 12, shapeSize: 70, shapeSpeed: 1,
  kaleidoCount: 4, kaleidoSize: 80, kaleidoSpeed: 1,
  cursorTrailLength: 20, cursorDotSize: 10,
  burstCount: 20, burstSpeed: 5,
  rippleScale: 50, rippleSpeed: 1,
  screenShakeIntensity: 3,
  glitchInterval: 2500, glitchAmount: 20,
  emojiSize: 24, emojiRate: 0.15,
  meshSize: 50, meshOpacity: 0.15,
  mandalaPetals: 36, mandalaSize: 400,
  mandalaFloat: true, mandalaMouseReact: true, mandalaMoveSpeed: 1,
  ringsFloat: true, ringsMouseReact: true, ringsMoveSpeed: 1,

  // Audio & Synth
  oscFreq: 55, oscWaveform: 'sine', lfoRate: 0.3, oscVolume: 0.15,
  connectionDist: 80,

  // Audio Visualizer & File Playback
  audioFileVolume: 0.8,
  vizType: 'bars',           // 'bars' | 'waveform' | 'both'
  audioBassGain: 1.0,        // Band sensitivity multipliers
  audioMidGain: 1.0,
  audioHighGain: 1.0,
  audioTrebleGain: 1.0,

  modeNames: [
    'Fractal Mandala', 'Wave Tunnel', 'Fluid Cosmos', 'Geo Trippy',
    'Plasma Field', 'Spiral Galaxy', 'Sacred Geometry', 'Digital Rain'
  ],

  toggles: {
    particles: true, connections: true, trails: true,
    warp: true, grid: true, flicker: false, stars: true, vignette: true,
    emoji: true, chromatic: true, breathing: true,
    orbs: true, rings: true, gridOverlay: true, mandala: true,
    beams: true, cssShapes: true, kaleidoscope: true, screenShake: true,
    glitchText: true, cursorTrail: true, clickBurst: true, ripples: true,
    webgl: true, audioReactive: false, screenFlash: false,
    vizEnabled: true
  },

  colorSchemes: {
    neon: 300, pastel: 350, fire: 10, ocean: 200, forest: 120,
    acid: 300, rainbow: 0, synthwave: 270, aurora: 160,
    monochrome: 0, sunset: 30
  },

  presets: {
    acid: {
      speed: 2, colorSpeed: 1.5, intensity: 90, chaos: 80, bgFade: 0.05,
      particleCount: 400, colorScheme: 'acid', glowIntensity: 80,
      modeArms: 8, modeLayers: 10, modeRings: 50, modeDistSpeed: 5,
      toggles: { kaleidoscope: true, screenShake: true, chromatic: true }
    },
    neon: {
      speed: 1.5, colorSpeed: 0.8, intensity: 85, chaos: 60, bgFade: 0.1,
      particleCount: 300, colorScheme: 'neon', glowIntensity: 70,
      toggles: { grid: true, warp: true, glitchText: true }
    },
    ocean: {
      speed: 0.7, colorSpeed: 0.3, intensity: 65, chaos: 30, bgFade: 0.3,
      particleCount: 200, colorScheme: 'ocean', glowIntensity: 40,
      modeBlobs: 10, modeRings: 25,
      toggles: { breathing: true, ripples: true, connections: true, gridOverlay: true }
    },
    fire: {
      speed: 1.2, colorSpeed: 1, intensity: 95, chaos: 70, bgFade: 0.06,
      particleCount: 350, colorScheme: 'fire', glowIntensity: 90,
      toggles: { beams: true, screenShake: true, clickBurst: true, chromatic: true }
    },
    rainbow: {
      speed: 1, colorSpeed: 2, intensity: 80, chaos: 50, bgFade: 0.12,
      particleCount: 300, colorScheme: 'rainbow', glowIntensity: 50,
      toggles: { mandala: true, rings: true, kaleidoscope: true }
    },
    calm: {
      speed: 0.3, colorSpeed: 0.2, intensity: 50, chaos: 20, bgFade: 0.4,
      particleCount: 80, colorScheme: 'pastel', glowIntensity: 20,
      modeArms: 4, modeLayers: 5, modeRings: 15,
      toggles: {
        connections: false, emoji: false, kaleidoscope: false, screenShake: false,
        beams: false, warp: false, flicker: false, grid: false, glitchText: false,
        orbs: false, rings: false, cssShapes: false, mandala: false
      }
    },
    chaos: {
      speed: 2.5, colorSpeed: 1.5, intensity: 100, chaos: 100, bgFade: 0.03,
      particleCount: 500, colorScheme: 'acid', glowIntensity: 100,
      modeArms: 9, modeLayers: 12, modeRings: 60, modeDistSpeed: 6,
      toggles: {
        connections: true, screenShake: true, chromatic: true,
        kaleidoscope: true, emoji: true
      }
    },
    minimal: {
      speed: 0.4, colorSpeed: 0.3, intensity: 40, chaos: 10, bgFade: 0.5,
      particleCount: 60, colorScheme: 'pastel', glowIntensity: 15,
      toggles: {
        grid: false, warp: false, flicker: false, emoji: false, kaleidoscope: false,
        beams: false, screenShake: false, cssShapes: false, orbs: false, rings: false,
        chromatic: false, glitchText: false, mandala: false, gridOverlay: false
      }
    },
    cyberpunk: {
      speed: 2, colorSpeed: 1, intensity: 90, chaos: 70, bgFade: 0.08,
      particleCount: 250, colorScheme: 'neon', glowIntensity: 80,
      toggles: {
        grid: true, warp: true, glitchText: true,
        chromatic: true, kaleidoscope: true
      }
    },
    nebula: {
      speed: 0.5, colorSpeed: 0.4, intensity: 75, chaos: 40, bgFade: 0.2,
      particleCount: 400, colorScheme: 'ocean', glowIntensity: 60,
      modeBlobs: 20, modeSwirls: 12,
      toggles: { stars: true, breathing: true, connections: true, trails: true, emoji: true }
    },
    void: {
      speed: 0.2, colorSpeed: 0.1, intensity: 30, chaos: 5, bgFade: 0.5,
      particleCount: 100, colorScheme: 'pastel', glowIntensity: 10,
      toggles: {
        orbs: false, rings: false, grid: false, mandala: false, beams: false,
        cssShapes: false, kaleidoscope: false, screenShake: false, emoji: false,
        flicker: false, warp: false, gridOverlay: false, glitchText: false, chromatic: false
      }
    },
    burst: {
      speed: 1.8, colorSpeed: 1.2, intensity: 90, chaos: 60, bgFade: 0.04,
      particleCount: 200, colorScheme: 'fire', glowIntensity: 70,
      toggles: { clickBurst: true, screenShake: true, emoji: true, chromatic: true }
    },
    fullpsychedelic: {
      speed: 1.5, colorSpeed: 1.5, intensity: 100, chaos: 85, bgFade: 0.06,
      particleCount: 500, colorScheme: 'rainbow', glowIntensity: 90,
      modeArms: 9, modeLayers: 12, modeRings: 50, modeDistSpeed: 5, modeBlobs: 20,
      toggles: {
        particles: true, connections: true, trails: true, warp: true, grid: true,
        stars: true, vignette: true, emoji: true, chromatic: true,
        breathing: true, orbs: true, rings: true, gridOverlay: true, mandala: true,
        beams: true, cssShapes: true, kaleidoscope: true, screenShake: true,
        glitchText: true, cursorTrail: true, clickBurst: true, ripples: true
      }
    },
    synthwave: {
      mode: 5, speed: 1.2, colorSpeed: 0.6, intensity: 85, chaos: 45, bgFade: 0.1,
      particleCount: 250, colorScheme: 'synthwave', glowIntensity: 75,
      modeSpiralArms: 4, modeSpiralTightness: 4, modeSpiralStars: 300,
      toggles: {
        grid: true, warp: true, vignette: true, chromatic: true,
        gridOverlay: true, trails: true
      }
    },
    zen: {
      mode: 6, speed: 0.3, colorSpeed: 0.15, intensity: 55, chaos: 10, bgFade: 0.35,
      particleCount: 100, colorScheme: 'aurora', glowIntensity: 30,
      modeSacredLayers: 8, modeSacredSymmetry: 6,
      toggles: {
        breathing: true, mandala: true, vignette: true,
        screenShake: false, flicker: false, emoji: false, beams: false,
        chromatic: false, glitchText: false, warp: false, grid: false
      }
    },
    matrix: {
      mode: 7, speed: 1.5, colorSpeed: 0.3, intensity: 80, chaos: 40, bgFade: 0.08,
      particleCount: 150, colorScheme: 'forest', glowIntensity: 60,
      modeRainColumns: 40, modeRainSpeed: 3, modeRainDensity: 0.6,
      toggles: {
        grid: true, chromatic: true, vignette: true, glitchText: true,
        screenShake: false, mandala: false, rings: false, orbs: false
      }
    },
    deepspace: {
      mode: 5, speed: 0.4, colorSpeed: 0.3, intensity: 70, chaos: 25, bgFade: 0.25,
      particleCount: 500, colorScheme: 'ocean', glowIntensity: 50,
      modeSpiralArms: 6, modeSpiralTightness: 2, modeSpiralStars: 400,
      starCount: 80,
      toggles: {
        stars: true, breathing: true, connections: true, trails: true,
        vignette: true, warp: false, grid: false, flicker: false,
        emoji: false, screenShake: false, beams: false
      }
    }
  }
};

// Store defaults snapshot for proper reset
const CFG_DEFAULTS = JSON.parse(JSON.stringify(CFG));
