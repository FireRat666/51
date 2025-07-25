// This new file will manage all FireScreen instances.

import { FireScreen } from './FireScreenInstance.js';

class FireScreenManager {
  constructor() {
    if (window.fireScreenManagerInstance) {
      return window.fireScreenManagerInstance;
    }

    this.instances = {};
    this.setupRunning = false;
    this.fireScriptName = `https://51.firer.at/scripts/firescreenv2.js`; // Centralize config

    window.fireScreenManagerInstance = this;
  }

  _getNextId() {
    let id = 1;
    while (this.instances[id]) {
      id++;
    }
    return id;
  }

  _getV3FromStr(strVector3) {
    const [x, y, z] = strVector3.split(" ").map(Number);
    return new BS.Vector3(x, y, z);
  }

  _getV4FromStr(strVector4) {
    if (strVector4 === "false") return false;
    const [x, y, z, w] = strVector4.split(" ").map(Number);
    return new BS.Vector4(x, y, z, w);
  }

  _parseParams(script, id) {
    const defaultParams = {
      position: "0 2 0", rotation: "0 0 0", scale: "1 1 1", castmode: "false", "lock-position": "false",
      "screen-position": "0 0 -0.02", "screen-rotation": "0 0 0", "screen-scale": "1 1 1", volumelevel: "0.25",
      website: "https://firer.at/pages/games.html", mipmaps: "1", pixelsperunit: "1200", width: "1024", height: "576",
      backdrop: "true", "hand-controls": "false", "disable-interaction": "false", "disable-rotation": false, announce: "false",
      "announce-420": "false", "announce-events": "undefined", "button-color": "0 1 0 1", "backdrop-color": "0 0 0 0.9",
      "volup-color": "0 1 0 1", "voldown-color": "1 1 0 1", "mute-color": "1 1 1 1", "space-sync": "false",
      "icon-mute-url": "https://firer.at/files/VolumeMute.png", "icon-volup-url": "https://firer.at/files/VolumeHigh.png",
      "icon-voldown-url": "https://firer.at/files/VolumeLow.png", "icon-direction-url": "https://firer.at/files/Arrow.png",
      "custom-button01-url": "false", "custom-button01-text": "Custom Button 01",
      "custom-button02-url": "false", "custom-button02-text": "Custom Button 02",
      "custom-button03-url": "false", "custom-button03-text": "Custom Button 03",
      "custom-button04-url": "false", "custom-button04-text": "Custom Button 04",
      "custom-button05-url": "false", "custom-button05-text": "Custom Button 05"
    };

    const numberAttributes = {
        position: this._getV3FromStr, rotation: this._getV3FromStr, scale: this._getV3FromStr,
        "screen-position": this._getV3FromStr, "screen-rotation": this._getV3FromStr, "screen-scale": this._getV3FromStr,
        "button-color": this._getV4FromStr, "backdrop-color": this._getV4FromStr, "volup-color": this._getV4FromStr,
        "voldown-color": this._getV4FromStr, "mute-color": this._getV4FromStr
    };

    const getParam = (key) => {
      const attr = script.getAttribute(key);
      const value = attr !== null ? attr : defaultParams[key];
      return numberAttributes[key] ? numberAttributes[key](value) : value;
    };

    const params = {};
    Object.keys(defaultParams).forEach(key => { params[key] = getParam(key); });

    params.thisBrowserNumber = id;
    params.scriptElement = script;

    return params;
  }

  async setupScreens() {
    if (this.setupRunning) return;
    this.setupRunning = true;

    console.log("FIRESCREEN_MANAGER: Starting setup...");
    const scripts = document.querySelectorAll(`script[src^='${this.fireScriptName}']`);

    for (const script of scripts) {
      if (script.dataset.processed) continue;
      script.dataset.processed = 'true';

      const id = this._getNextId();
      const params = this._parseParams(script, id);

      // Create and initialize a new FireScreen instance using our class
      const instance = new FireScreen(params);
      await instance.initialize();
      this.instances[id] = instance;
    }

    this.setupRunning = false;
    console.log("FIRESCREEN_MANAGER: Setup finished.");
  }

  cleanup(instanceId) {
    const instance = this.instances[instanceId];
    if (instance) {
      // Call the destroy method on the instance to clean up its resources
      instance.destroy();
      delete this.instances[instanceId];
    }
  }
}

// Initialize the manager once.
if (typeof window.fireScreenManager === 'undefined') {
    window.fireScreenManager = new FireScreenManager();
}

// This would be called by your main script loader.