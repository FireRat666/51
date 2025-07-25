// This new file will manage all FireScreen instances.

import { FireScreen } from './FireScreenInstance.js';

export class FireScreenManager {
  constructor() {
    // Robust singleton pattern
    if (FireScreenManager.instance) {
      return FireScreenManager.instance;
    }

    this.instances = {};
    this.fireScriptName = `https://51.firer.at/scripts/firescreenv2.js`; // Centralize config
    this.scene = BS.BanterScene.GetInstance();
    this.globalSetupComplete = false;
    this.spaceStateLogged = false;
    this.announcerScriptLoaded = false;

    // Global state variables that were previously on the window object
    this.firstRunHandControls = true;
    this.notAlreadyJoined = true;
    this.playersUserId = null;

    this._initializeGlobalListeners();

    FireScreenManager.instance = this;
  }

  _initializeGlobalListeners() {
    if (this.globalSetupComplete) return;
    this.globalSetupComplete = true;

    console.log("FIRESCREEN_MANAGER: Initializing global listeners...");

    // This is a clever workaround for an SDK bug where 'user-joined' doesn't fire for the local user on world load.
    const originalWarn = console.warn;
    console.warn = (...args) => {
        if (typeof args[0] === "string" && args[0].includes("got user-joined event for user that already joined")) {
            this.scene.dispatchEvent(new CustomEvent("user-already-joined", { detail: args[1] }));
        }
        originalWarn.apply(console, args);
    };

    const onUserJoined = e => {
        if (e.detail.isLocal && this.firstRunHandControls) {
            console.log("FIRESCREEN_MANAGER: Local user joined, enabling hand controls for instances.");
            this.firstRunHandControls = false;
            this.playersUserId = e.detail.uid;
            this._setupHandControlsForAllInstances(this.playersUserId);
        }
    };

    const onUserAlreadyJoined = e => {
        if (e.detail.isLocal && this.notAlreadyJoined) {
            console.log("FIRESCREEN_MANAGER: Local user already-joined, enabling hand controls for instances.");
            this.notAlreadyJoined = false;
            this.firstRunHandControls = false;
            this.playersUserId = e.detail.uid;
            setTimeout(() => {
                this._setupHandControlsForAllInstances(this.playersUserId);
                this.notAlreadyJoined = true;
            }, 3000);
        }
    };

    const onUserLeft = e => {
        if (e.detail.isLocal) {
            console.log("FIRESCREEN_MANAGER: Local user left, resetting hand controls flag.");
            this.firstRunHandControls = true;
            // Clean up existing hand controls so they can be re-created on rejoin
            this._cleanupHandControlsForAllInstances();
        }
    };

    this.scene.On("user-joined", onUserJoined);
    this.scene.On("user-left", onUserLeft);
    this.scene.addEventListener("user-already-joined", onUserAlreadyJoined);
    this.scene.On("one-shot", e => this._onOneShot(e));
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
    console.log("FIRESCREEN_MANAGER: Starting setup...");
    const scripts = document.querySelectorAll(`script[src^='${this.fireScriptName}']`);

    for (const script of scripts) {
      if (script.dataset.processed) continue;
      script.dataset.processed = 'true';

      const id = this._getNextId();
      const params = this._parseParams(script, id);

      // Create and initialize a new FireScreen instance, passing the manager to it
      const instance = new FireScreen(params, this);
      await instance.initialize();
      this.instances[id] = instance;

      // If the user is already present when this screen is created, set up its hand controls immediately.
      if (this.playersUserId && params['hand-controls'] === 'true') {
        console.log(`FIRESCREEN_MANAGER: User already present, setting up hand controls for new instance ${id}.`);
        instance._setupHandControls(this.playersUserId);
      }

      // Check if we need to load the announcer script
      if ((params.announce === 'true' || params['announce-events'] === 'true' || params['announce-420'] === 'true') && this.announcerScriptLoaded === false) {
        this._loadAnnouncerScript(params);
      }
    }

    console.log("FIRESCREEN_MANAGER: Setup finished.");
  }

  _cleanupHandControlsForAllInstances() {
    for (const instanceId in this.instances) {
      const instance = this.instances[instanceId];
      if (instance.params['hand-controls'] === "true") {
        instance._cleanupHandControls();
      }
    }
  }

  _setupHandControlsForAllInstances(userId) {
    for (const instanceId in this.instances) {
      const instance = this.instances[instanceId];
      if (instance.params['hand-controls'] === "true") {
        instance._setupHandControls(userId);
      }
    }
  }

  _loadAnnouncerScript(params) {
    this.announcerScriptLoaded = true; // Set flag to prevent multiple loads
    const announcerScriptUrl = `https://51.firer.at/scripts/announcer.js`;

    // Check if a script with this source already exists
    if (document.querySelector(`script[src^='${announcerScriptUrl}']`)) {
        console.log("FIRESCREEN_MANAGER: Announcer script already present, not loading again.");
        return;
    }

    console.log("FIRESCREEN_MANAGER: Announcer requested, loading script...");
    const script = document.createElement("script");
    script.id = "fires-announcer";
    script.setAttribute("src", announcerScriptUrl);
    script.setAttribute("announce", params.announce);
    script.setAttribute("announce-420", params['announce-420']);
    script.setAttribute("announce-events", params['announce-events'] === "undefined" ? (params.announce === "true" ? "true" : "false") : params['announce-events']);
    document.body.appendChild(script);
  }

  _onOneShot(e) {
    const data = JSON.parse(e.detail.data);
    const isAdmin = e.detail.fromAdmin;
    // Example authorization, adjust as needed
    const isAuthorized = isAdmin || e.detail.fromId === "f67ed8a5ca07764685a64c7fef073ab9";

    if (!isAuthorized) return;

    if (data.target !== undefined) {
      // Command is for a specific instance
      const instance = this.instances[data.target];
      if (instance) {
        instance.handleCommand(data);
      }
    } else {
      // Command is for all instances (broadcast)
      this._handleBroadcastCommand(data);
    }
  }

  _handleBroadcastCommand(data) {
    const broadcastCommands = {
      firevolumeup: () => this._adjustAllInstances("adjustVolume", 1),
      firevolumedown: () => this._adjustAllInstances("adjustVolume", -1),
      firemutetoggle: () => this._adjustAllInstances("toggleMute")
    };

    for (const command in broadcastCommands) {
      if (data[command] !== undefined) {
        broadcastCommands[command](data[command]);
      }
    }
  }

  // This method is called directly by local UI, like hand controls.
  // It is NOT for networked 'one-shot' events.
  handleLocalCommand(action, change) {
    const localCommands = {
      adjustVolume: () => this._adjustAllInstances("adjustVolume", change),
      toggleMute: () => this._adjustAllInstances("toggleMute"),
      goHome: () => this._adjustAllInstances("gohome")
    };

    if (localCommands[action]) {
      localCommands[action]();
    }
  }

  _adjustAllInstances(action, change) {
    for (const instanceId in this.instances) {
      const instance = this.instances[instanceId];
      if (instance) {
        instance.handleCommand({ [action]: change });
      }
    }
  }

  async cleanup(instanceId) {
    const instance = this.instances[instanceId];
    if (instance) {
      // Call the destroy method on the instance to clean up its resources
      await instance.destroy();
      delete this.instances[instanceId];
    }
  }
}