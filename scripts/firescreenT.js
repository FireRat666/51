const CONFIG = {
  defaultShader: 'Unlit/DiffuseTransparent',
  fireScreenUrl: "https://51.firer.at/scripts/firescreenT.js",
  announcerScriptUrl: "https://51.firer.at/scripts/announcer.js",
  defaultButtonColor: new BS.Vector4(1,1,0,1),
  defaultBackdropColor: new BS.Vector4(0,0,0,0.9),
};

var firescenev2 = BS.BanterScene.GetInstance();
var firescreenurlv2 = "https://51.firer.at/scripts/firescreenT.js"; // "https://51.firer.at/scripts/firescreenv2.js";
var announcerscripturlv2 = "https://51.firer.at/scripts/announcer.js";
var fireScreen2On = false;
var firstrunhandcontrolsv2 = true;
var firevolume = 1;
var playersuseridv2 = null;

var the_announce = null;
var the_announcer = null;
var the_announce420 = null;
var the_announceevents = null;
var defaulTransparent = 'Unlit/DiffuseTransparent';
var customButShader = 'Unlit/Diffuse';
var thebuttonscolor;
let customButtonObjects = [];
var clickedColour = new BS.Vector4(1,1,1,0.7);
var whiteColour = new BS.Vector4(1,1,1,1);
var theNumberofBrowsers = 0;
var announcerfirstrunv2 = true;

// This Function adds geometry to the given game Object
async function createGeometry(thingy1, geomtype, options = {}) {
  const defaultOptions = {
    thewidth: 1, theheight: 1, depth: 1, widthSegments: 1, heightSegments: 1, depthSegments: 1, radius: 1, segments: 24, thetaStart: 0, thetaLength: Math.PI * 2, phiStart: 0, phiLength: Math.PI * 2, radialSegments: 8, openEnded: false, radiusTop: 1, radiusBottom: 1, innerRadius: 0.3, outerRadius: 1, thetaSegments: 24, phiSegments: 8, tube: 0.4, tubularSegments: 16, arc: Math.PI * 2, p: 2, q: 3, stacks: 5, slices: 5, detail: 0, parametricPoints: ""
  };
  const config = { ...defaultOptions, ...options };
  const geometry = await thingy1.AddComponent(new BS.BanterGeometry( 
    geomtype, null, config.thewidth, config.theheight, config.depth, config.widthSegments, config.heightSegments, config.depthSegments, config.radius, config.segments, config.thetaStart, config.thetaLength, config.phiStart, config.phiLength, config.radialSegments, config.openEnded, config.radiusTop, config.radiusBottom, config.innerRadius, config.outerRadius, config.thetaSegments, config.phiSegments, config.tube, config.tubularSegments, config.arc, config.p, config.q, config.stacks, config.slices, config.detail, config.parametricPoints
  ));
  return geometry;
};

async function createMaterial(objectThing, options = {}) {
  const shaderName = options.shaderName || 'Sprites/Diffuse';
  const texture = options.texture || null;
  const color = options.color || whiteColour;
  const side = options.side || 0;
  const generateMipMaps = options.generateMipMaps || true;
  return objectThing.AddComponent(new BS.BanterMaterial(shaderName, texture, color, side, generateMipMaps));
};

function updateButtonColor(buttonObject, revertColour) {
  let material = buttonObject.GetComponent(BS.ComponentType.BanterMaterial);
  material.color = clickedColour; setTimeout(() => { material.color = revertColour; }, 100);
};
  
function adjustScale(geometrytransform, direction) {
  let scaleX = Number(parseFloat(geometrytransform.localScale.x).toFixed(3));
  let scaleY = Number(parseFloat(geometrytransform.localScale.y).toFixed(3));
  let adjustment;
  if (scaleX < 0.5) { adjustment = 0.025;
  } else if (scaleX < 2) { adjustment = 0.05;
  } else if (scaleX < 5) { adjustment = 0.1;
  } else { adjustment = 0.5; }
  if (direction === "shrink") { adjustment = -adjustment;
    if (scaleX + adjustment <= 0) { scaleX = 0.025; scaleY = 0.025; } }
  scaleX += adjustment; scaleY += adjustment; geometrytransform.localScale = new BS.Vector3(scaleX, scaleY, 1);
  return adjustment;
};

async function createCustomButton(name, color, position, scale, text, textPosition, url, clickHandler) {
  const buttonObject = await createUIButton(name, null, position, color, screenObject, "false", 1, 1, CONFIG.defaultShader, scale);
  customButtonObjects.push(buttonObject);
  if (text) {
    const textObject = await createTextObject(`${name}Text`, text, textPosition);
    customButtonObjects.push(textObject); }
  if (url) {
    buttonObject.On('click', () => {
      console.log(`CLICKED: ${name}`); firebrowser.url = url;
      updateButtonColor(buttonObject, new BS.Vector4(0.3, 0.3, 0.3, 1), color);
      if (clickHandler) clickHandler();  }); }
};

async function createUIButton(name, thetexture, position, thecolor, thisparent, rotation = false, width = 0.1, height = 0.1, theShader = defaulTransparent, localScale = new BS.Vector3(1, 1, 1)) {
  const buttonObject = new BS.GameObject(name);
  const buttonGeometry = await createGeometry(buttonObject, BS.GeometryType.PlaneGeometry, { thewidth: width, theheight: height });
  const buttonCollider = await buttonObject.AddComponent(new BS.BoxCollider(true, new BS.Vector3(0,0,0), new BS.Vector3(width, height, 0.01)));
  const buttonMaterial = await createMaterial(buttonObject, { shaderName: theShader, texture: thetexture, color: thecolor });
  const buttonTransform = await buttonObject.AddComponent(new BS.Transform());
  buttonTransform.position = position; buttonTransform.localScale = localScale;
  rotation ? buttonTransform.localEulerAngles = rotation : rotation; buttonObject.SetLayer(5); // UI Layer
  await buttonObject.SetParent(thisparent, false); return buttonObject;
};

async function createTextObject(name, text, position) {
  const textObject = new BS.GameObject(name);
  await textObject.AddComponent(new BS.BanterText(text, new BS.Vector4(1,1,1,1), "Center", "Center", 0.20, true, true, new BS.Vector2(2,1)));
  const textTransform = await textObject.AddComponent(new BS.Transform());
  textTransform.localPosition = position;
  await textObject.SetParent(screenObject, false);
  return textObject;
};

async function createButton(name, texture, position, color, parent, rotation = false, clickHandler) {
  const button = await createUIButton(name, texture, position, color, parent, rotation);
  if (clickHandler) createButtonAction(button, clickHandler); return button;
};

function adjustVolume(firebrowser, change) { // Pass -1 to decrease the volume Pass 1 to increase the volume
  let currentVolume = Number(firevolume); let adjustment;
  if (currentVolume < 0.1) { adjustment = 0.01; // Tiny adjustment for low volume
  } else if (currentVolume < 0.5) { adjustment = 0.03; // Medium adjustment for medium volume
  } else { adjustment = 0.05; } // Big adjustment for high volume
  firevolume = currentVolume + (change * adjustment);
  firevolume = Math.max(0, Math.min(firevolume, 1)).toFixed(2);
  let firepercent = (firevolume * 100).toFixed(0);
  runBrowserActions(firebrowser, `document.querySelectorAll('video, audio').forEach((elem) => elem.volume=${firevolume});`);
  runBrowserActions(firebrowser, `document.querySelector('.html5-video-player').setVolume(${firepercent});`);
  console.log(`FIRESCREEN2: Volume is: ${firevolume}`);
};

function toggleButtonVisibility(defaultobjects, customButtonObjects, visible) {
  defaultobjects.forEach(button => { button.SetActive(visible); });
  customButtonObjects.forEach(button => { if (button) {button.SetActive(visible); }; });
}

function runBrowserActions(firebrowser, script) {
  firebrowser.RunActions(JSON.stringify({"actions": [{ "actionType": "runscript","strparam1": script }]}));
};

function createButtonAction(buttonObject, clickHandler) {
  buttonObject.On('click', (e) => { clickHandler(e); });
};

async function createHandButton(name, iconUrl, position, color, parentObject, clickHandler) {
  const button = await createUIButton(name, iconUrl, position, color, parentObject, new BS.Vector3(180, 0, 0), 1, 1, defaulTransparent, new BS.Vector3(0.4, 0.4, 0.4));
  createButtonAction(button, clickHandler); return button;
};

function extractConfig(script) {
  return {
    position: getV3FromStr(getAttrOrDef(script, "position", "0 2 0")),
    rotation: getV3FromStr(getAttrOrDef(script, "rotation", "0 0 0")),
    scale: getV3FromStr(getAttrOrDef(script, "scale", "1 1 1")),
    volume: getAttrOrDef(script, "volumelevel", "0.25"),
    url: getAttrOrDef(script, "website", "https://firer.at/pages/games.html"),
    mipMaps: getAttrOrDef(script, "mipmaps", "0"),
    pixelsPerUnit: getAttrOrDef(script, "pixelsperunit", "1200"),
    pageWidth: getAttrOrDef(script, "width", "1024"),
    pageHeight: getAttrOrDef(script, "height", "576"),
    backdrop: getAttrOrDef(script, "backdrop", "true"),
    handButtons: getAttrOrDef(script, "hand-controls", "false"),
    disableInteraction: getAttrOrDef(script, "disable-interaction", "false"),
    announce: getAttrOrDef(script, "announce", "false"),
    announce420: getAttrOrDef(script, "announce-420", "false"),
    announceEvents: getAttrOrDef(script, "announce-events", "undefined"),
    buttonColor: getV4FromStr(getAttrOrDef(script, "button-color", "0 1 0 1")),
    backdropColor: getV4FromStr(getAttrOrDef(script, "backdrop-color", "0 0 0 0.9")),
    volUpColor: getV4FromStr(getAttrOrDef(script, "volup-color", "false")),
    volDownColor: getV4FromStr(getAttrOrDef(script, "voldown-color", "false")),
    muteColor: getV4FromStr(getAttrOrDef(script, "mute-color", "false")),
    buttonPosition: getAttrOrDef(script, "button-position", "0 0 0"),
    iconMuteUrl: getAttrOrDef(script, "icon-mute-url", "https://firer.at/files/VolumeMute.png"),
    iconVolUpUrl: getAttrOrDef(script, "icon-volup-url", "https://firer.at/files/VolumeHigh.png"),
    iconVolDownUrl: getAttrOrDef(script, "icon-voldown-url", "https://firer.at/files/VolumeLow.png"),
    iconDirectionUrl: getAttrOrDef(script, "icon-direction-url", "https://firer.at/files/Arrow.png"),
    customButton01Url: getAttrOrDef(script, "custom-button01-url", "false"),
    customButton01Text: getAttrOrDef(script, "custom-button01-text", "Custom Button 01"),
    customButton02Url: getAttrOrDef(script, "custom-button02-url", "false"),
    customButton02Text: getAttrOrDef(script, "custom-button02-text", "Custom Button 02"),
    customButton03Url: getAttrOrDef(script, "custom-button03-url", "false"),
    customButton03Text: getAttrOrDef(script, "custom-button03-text", "Custom Button 03"),
    customButton04Url: getAttrOrDef(script, "custom-button04-url", "false"),
    customButton04Text: getAttrOrDef(script, "custom-button04-text", "Custom Button 04"),
  };
};

async function setupFireScreen2(config) {
  console.log("FIRESCREEN2: Setting up");
  console.log("FIRESCREEN2: config:", config);
  console.log(config);
  
  screenObject = await new BS.GameObject("MyBrowser");
  firebrowser = await screenObject.AddComponent(new BS.BanterBrowser(config.url, config.mipMaps, config.pixelsPerUnit, config.pageWidth, config.pageHeight));

  if (config.disableInteraction === "false") {
    firebrowser.ToggleInteraction(true);
  }

  const geometryObject = await createGeometryObject(config);
  await setupScreenObject(geometryObject, screenObject, config);
  await createButtons(config);
  
  if (config.handButtons === "true") {
    setupHandControls(config);
  };

};

async function setupScreenObject(geometryObject, screenObject, config) {
  const browserTransform = await screenObject.AddComponent(new BS.Transform());
  browserTransform.position = new BS.Vector3(0,0,-0.01);
  browserTransform.localScale = new BS.Vector3(1,1,1);
  await screenObject.SetParent(geometryObject, false);
  firesbillBoard = await geometryObject.AddComponent(new BS.BanterBillboard(0, true, true, true));
  setupRigidBodyEvents(geometryObject.GetComponent(BS.ComponentType.BanterRigidbody));
}

function setupRigidBodyEvents(rigidBody) {
  rigidBody.gameObject.On('grab', () => {
    rigidBody.isKinematic = false;
    console.log("GRABBED!");
  });

  rigidBody.gameObject.On('drop', () => {
    rigidBody.isKinematic = true;
    console.log("DROPPED!");
  });
}

async function createButtons(config) {
  const buttonCreationConfig = [
    { name: "HomeButton", texture: "https://firer.at/files/Home.png", position: new BS.Vector3(-0.2,0.38,0), color: config.buttonColor, clickHandler: () => { firebrowser.url = config.url; } },
    { name: "InfoButton", texture: "https://firer.at/files/Info.png", position: new BS.Vector3(-0.6,0.28,0), color: config.buttonColor, clickHandler: () => { firebrowser.url = "https://firer.at/pages/Info.html"; } },
    { name: "GoogleButton", texture: "https://firer.at/files/Google.png", position: new BS.Vector3(-0.6,0.16,0), color: new BS.Vector4(1,1,1,1), clickHandler: () => { firebrowser.url = "https://google.com/"; } },
    { name: "KeyboardButton", texture: "https://firer.at/files/Keyboard.png", position: new BS.Vector3(-0.6,-0.15,0), color: new BS.Vector4(1,1,1,1), clickHandler: toggleKeyboard },
    { name: "BackButton", texture: config.iconDirectionUrl, position: new BS.Vector3(-0.5,0.38,0), color: config.buttonColor, clickHandler: () => { firebrowser.RunActions(JSON.stringify({"actions":[{"actionType": "goback"}]})); } },
    { name: "GrowButton", texture: "https://firer.at/files/expand.png", position: new BS.Vector3(0.6,0.06,0), color: config.buttonColor, clickHandler: () => { adjustScale("grow"); } },
    { name: "ShrinkButton", texture: "https://firer.at/files/shrink.png", position: new BS.Vector3(0.6,-0.06,0), color: config.buttonColor, clickHandler: () => { adjustScale("shrink"); } },
    { name: "ForwardButton", texture: config.iconDirectionUrl, position: new BS.Vector3(-0.38,0.38,0), color: config.buttonColor, rotation: new BS.Vector3(0,0,180), clickHandler: () => { firebrowser.RunActions(JSON.stringify({"actions":[{"actionType": "goforward"}]})); } },
    { name: "HideShowButton", texture: "https://firer.at/files/Eye.png", position: new BS.Vector3(-0.6,0,0), color: config.buttonColor, clickHandler: toggleButtonVisibility },
    { name: "MuteButton", texture: config.iconMuteUrl, position: new BS.Vector3(0.167,0.38,0), color: config.muteColor || config.buttonColor, clickHandler: toggleMute },
    { name: "VolumeDownButton", texture: config.iconVolDownUrl, position: new BS.Vector3(0.334,0.38,0), color: config.volDownColor || config.buttonColor, clickHandler: () => { adjustVolume(-1); } },
    { name: "VolumeUpButton", texture: config.iconVolUpUrl, position: new BS.Vector3(0.495,0.38,0), color: config.volUpColor || config.buttonColor, clickHandler: () => { adjustVolume(1); } },
    { name: "BillboardButton", texture: "https://firer.at/files/Rot.png", position: new BS.Vector3(-0.6,-0.3,0), color: config.buttonColor, clickHandler: toggleBillboard },
  ];
  for (const buttonConfig of buttonCreationConfig) {
    await createButton(buttonConfig.name, buttonConfig.texture, buttonConfig.position, buttonConfig.color, screenObject, buttonConfig.rotation, buttonConfig.clickHandler);
  };
  const customButtons = [
    { name: "CustomButton1", url: config.customButton01Url, text: config.customButton01Text },
    { name: "CustomButton2", url: config.customButton02Url, text: config.customButton02Text },
    { name: "CustomButton3", url: config.customButton03Url, text: config.customButton03Text },
    { name: "CustomButton4", url: config.customButton04Url, text: config.customButton04Text },
  ];
  let yOffset = 0.3;
  for (const button of customButtons) {
    if (button.url !== "false") {
      await createCustomButton(
        button.name,
        new BS.Vector4(0.1,0.1,0.1,1),
        new BS.Vector3(0.68, yOffset, 0),
        new BS.Vector3(0.2,0.04,1),
        button.text,
        new BS.Vector3(1.59, -0.188 - (0.3 - yOffset), -0.005),
        button.url,
        () => {}
      );
      yOffset -= 0.05;
    }
  }
};

async function createGeometryObject(config) {
  const geometryObject = new BS.GameObject("MyGeometry");
  await createGeometry(geometryObject, BS.GeometryType.PlaneGeometry, { thewidth: 1.09, theheight: 0.64 });
  const geometryTransform = await geometryObject.AddComponent(new BS.Transform());
  geometryTransform.position = config.position;
  geometryTransform.eulerAngles = config.rotation;
  geometryTransform.localScale = config.scale;
  const boxCollider = await geometryObject.AddComponent(new BS.BoxCollider(false, new BS.Vector3(0,0,0), new BS.Vector3(1.09,0.64,0.01)));
  await geometryObject.SetLayer(20);
  const fireRigidBody = await geometryObject.AddComponent(new BS.BanterRigidbody(1, 10, 10, true, false, new BS.Vector3(0,0,0), "Discrete", false, false, false, false, false, false, new BS.Vector3(0,0,0), new BS.Vector3(0,0,0)));
  const backdropColor = config.backdrop === "true" ? config.backdropColor : new BS.Vector4(0,0,0,0);
  await createMaterial(geometryObject, { color: backdropColor });
  const physicMaterial = await geometryObject.AddComponent(new BS.BanterPhysicMaterial(100, 100));
  return geometryObject;
};

function toggleKeyboard() {
  keyboardState = !keyboardState;
  firebrowser.ToggleKeyboard(keyboardState ? 1 : 0);
  const keyboardButton = screenObject.Find("KeyboardButton");
  if (keyboardButton) {
    const material = keyboardButton.GetComponent(BS.ComponentType.BanterMaterial);
    material.color = keyboardState ? CONFIG.defaultButtonColor : new BS.Vector4(1,1,1,1);
  }
}

function toggleButtonVisibility() {
  buttonsVisible = !buttonsVisible;
  const hideShowButton = screenObject.Find("HideShowButton");
  if (hideShowButton) {
    const material = hideShowButton.GetComponent(BS.ComponentType.BanterMaterial);
    material.color = buttonsVisible ? CONFIG.defaultButtonColor : new BS.Vector4(1, 1, 1, 0.5);
  }
  const buttonsToToggle = screenObject.GetComponentsInChildren(BS.ComponentType.BanterMaterial);
  buttonsToToggle.forEach(button => {
    if (button.gameObject.name !== "HideShowButton") {
      button.gameObject.SetActive(buttonsVisible);
    }
  });
};

function toggleMute() {
  browserMuted = !browserMuted;
  runBrowserActions(`document.querySelectorAll('video, audio').forEach((elem) => elem.muted=${browserMuted});`);
  const muteButton = screenObject.Find("MuteButton");
  if (muteButton) {
    const material = muteButton.GetComponent(BS.ComponentType.BanterMaterial);
    material.color = browserMuted ? new BS.Vector4(1,0,0,1) : CONFIG.defaultButtonColor;
  };
};

function toggleBillboard() {
  isBillboarded = !isBillboarded;
  firesbillBoard.enableXAxis = isBillboarded;
  firesbillBoard.enableYAxis = isBillboarded;
  const billboardButton = screenObject.Find("BillboardButton");
  if (billboardButton) {
    const material = billboardButton.GetComponent(BS.ComponentType.BanterMaterial);
    material.color = isBillboarded ? CONFIG.defaultButtonColor : new BS.Vector4(1,1,1,1);
  };
};

function adjustScale(direction) {
  const geometryTransform = screenObject.GetComponent(BS.ComponentType.Transform);
  let scale = geometryTransform.localScale;
  let adjustment = scale.x < 0.5 ? 0.025 : scale.x < 2 ? 0.05 : scale.x < 5 ? 0.1 : 0.5;
  
  if (direction === "shrink") {
    adjustment = -adjustment;
    if (scale.x + adjustment <= 0) {
      scale = new BS.Vector3(0.025, 0.025, 1);
    }
  };
  scale.x += adjustment;
  scale.y += adjustment;
  geometryTransform.localScale = scale;
};

function setupEventListeners() {
  firebrowser.On("browser-message", e => {
    console.log("Browser message:", e);
  });

  firescenev2.On("menu-browser-message", e => {
    console.log("Menu browser message:", e);
  });

  firescenev2.On("one-shot", handleOneShot);
  firescenev2.On("user-joined", handleUserJoined);
};

function handleOneShot(e) {
  console.log("One-shot event:", e);
  if (e.detail.fromAdmin) {
    const data = JSON.parse(e.detail.data);
    if (data.fireurl) firebrowser.url = data.fireurl;
    if (data.firevolume) setVolume(Number(data.firevolume));
  };
};

function handleUserJoined(e) {
  if (e.detail.isLocal) {
    console.log("FIRESCREEN2: user-joined");
    playersuseridv2 = e.detail.uid;
    if (CONFIG.handButtons === "true" && firstrunhandcontrolsv2) {
      firstrunhandcontrolsv2 = false;
      console.log("FIRESCREEN2: Enabling Hand Controls");
      setupHandControls();
    };
  };
};

function startSoundLevelLoop() {
  if (fireScreen2On && !soundlevel2firstrun) return;
  console.log("FIRESCREEN2: keepsoundlevel loop");
  soundlevel2firstrun = false;
  clearInterval(volinterval2);
  volinterval2 = setInterval(() => {
    const firepercent = (firevolume * 100).toFixed(0);
    runBrowserActions(`
      document.querySelectorAll('video, audio').forEach((elem) => elem.volume = ${firevolume});
      document.querySelector('.html5-video-player')?.setVolume(${firepercent});
    `);
  }, 3000);
};

  async function setupHandControls() {
    // THE CONTAINER FOR THE HAND BUTTONS
    console.log("FIRESCREEN2: Hand Control Stuff");
    const plane20Object = new BS.GameObject("handContainer");
    const plane20geometry = await createGeometry(plane20Object, BS.GeometryType.PlaneGeometry);
    const plane20Collider = await plane20Object.AddComponent(new BS.BoxCollider(true, new BS.Vector3(0, 0, 0), new BS.Vector3(1, 1, 1)));
    const plane20material = await createMaterial(plane20Object, { shaderName: defaulTransparent, color: new BS.Vector4(0,0,0,0), side: 1 });
    const plane20transform = await plane20Object.AddComponent(new BS.Transform());
    firescenev2.LegacyAttachObject(plane20Object, playersuseridv2, BS.LegacyAttachmentPosition.LEFT_HAND)
    plane20transform.localPosition = new BS.Vector3(-0.01,-0.006,0.020);
    plane20transform.localScale = new BS.Vector3(0.1,0.1,0.1);
    plane20transform.localEulerAngles = new BS.Vector3(5,-95,0);
    // Hand Volume Up Button
    const hvolUpButton = await createHandButton("hVolumeUpButton", p_iconvolupurl, new BS.Vector3(0.4,0.4,0.3), p_volupcolor, plane20Object, () => { adjustVolume(firebrowser, 1);
      updateButtonColor(hvolUpButton, p_volupcolor); });
    const hvolDownButton = await createHandButton("hVolumeDownButton", p_iconvoldownurl, new BS.Vector3(0.0,0.4,0.3), p_voldowncolor, plane20Object, () => { adjustVolume(firebrowser, -1);
      updateButtonColor(hvolDownButton, p_voldowncolor); });
    // Hand Mute Button
    const hmuteButton = await createHandButton("hMuteButton", p_iconmuteurl, new BS.Vector3(-0.4,0.4,0.3), p_mutecolor, plane20Object, () => {
      browsermuted = !browsermuted;
      runBrowserActions(firebrowser, `document.querySelectorAll('video, audio').forEach((elem) => elem.muted=${browsermuted});`);
      let muteMaterial = hmuteButton.GetComponent(BS.ComponentType.BanterMaterial);
      muteMaterial.color = browsermuted ? new BS.Vector4(1, 0, 0, 1) : p_mutecolor; });
    // Hand Lock Button
    const hlockButton = await createHandButton("hLockButton", 'https://firer.at/files/lock.png', new BS.Vector3(0,-0.1,0.3), new BS.Vector4(1, 1, 1, 0.7), plane20Object, () => {
      playerislockedv2 = !playerislockedv2; playerislockedv2 ? lockPlayer() : unlockPlayer();
      let plane24material = hlockButton.GetComponent(BS.ComponentType.BanterMaterial);
      plane24material.color = playerislockedv2 ? new BS.Vector4(1,0,0,1) : new BS.Vector4(1, 1, 1, 0.7); });
    console.log("FIRESCREEN2: Hand Setup Stuff END");
  };

  let waitingforunity = true;
  var screeninterval;
  if (waitingforunity) { screeninterval = setInterval(function() {
    if (firescenev2.unityLoaded) { waitingforunity = false; clearInterval(screeninterval);
      if (announcerfirstrunv2) { console.log("FIRESCREEN2: announcerfirstrunv2 true"); announcerstufffunc(); };
    }; console.log(`FIRESCREEN2: waitingforunity ${waitingforunity}, firescenev2.unityLoaded:${firescenev2.unityLoaded}`);
  }, 500); };

  var soundlevel2firstrun = true;
  function keepsoundlevel2() { var volinterval2;
    if (fireScreen2On && soundlevel2firstrun) {
    console.log("FIRESCREEN2: keepsoundlevel loop");
    soundlevel2firstrun = false;
    // Loop to keep sound level set, runs every set second(s)
      volinterval2 = setInterval(function() {
        let firepercent = (firevolume * 100).toFixed(0);
        runBrowserActions(firebrowser, `document.querySelectorAll('video, audio').forEach((elem) => elem.volume=${firevolume});`);
        runBrowserActions(firebrowser, `document.querySelector('.html5-video-player').setVolume(${firepercent});`);
      }, 5000); } else if (fireScreen2On) { } else { clearInterval(volinterval2); }
  };
  // keepsoundlevel2()

  function announcerstufffunc() {
    console.log("FIRESCREEN2: Announcer Script Called");
    // Setup the Announcer only on the first run if enabled
    if (announcerfirstrunv2 === true ) {
      setTimeout(() => { 
        if (typeof announcerscene === 'undefined') { announcerfirstrunv2 = false;
          console.log("FIRESCREEN2: announcerscene is not defined, Adding the Announcer Script");
          const announcerscript = document.createElement("script");
          announcerscript.id = "fires-announcer";
          announcerscript.setAttribute("src", announcerscripturlv2);
          announcerscript.setAttribute("announce", the_announce);
          announcerscript.setAttribute("announce-420", the_announce420);
          if (the_announceevents === "undefined" && the_announce === "true") {
            announcerscript.setAttribute("announce-events", "true");
          } else if (the_announceevents === "undefined") {
            announcerscript.setAttribute("announce-events", "false");
          } else {
            announcerscript.setAttribute("announce-events", the_announceevents);
          };
          document.querySelector("body").appendChild(announcerscript);
        } else { console.log('FIRESCREEN2: announcerscene is defined, Moving on'); };
      }, 1000);
    };
    setTimeout(() => { if (announcerfirstrunv2 === false) {  timenow = Date.now(); }; }, 1000);
  };

const getV3FromStr = (strVector3) => {
  const [x, y, z] = strVector3.split(" ").map(Number);
  return new BS.Vector3(x, y, z);
};

const getV4FromStr = (strVector4) => {
  if (strVector4 === "false") return false;
  const [x, y, z, w] = strVector4.split(" ").map(Number);
  return new BS.Vector4(x, y, z, w);
};

const getAttrOrDef = (script, attr, defaultValue) => 
  script.hasAttribute(attr) ? script.getAttribute(attr) : defaultValue;

const allScripts = document.getElementsByTagName("script");
for (let script of allScripts) {
  console.log('FIRESCREEN2: Stuff...');
  if (getAttrOrDef(script, "src", "") === CONFIG.fireScreenUrl) {
    const config = extractConfig(script);
    setupFireScreen2(config);
    console.log('FIRESCREEN2: config');
    console.log(config);
    break;
  }
};

// screenboxCollider = await firescenev2.Find("MyBrowser");

// await firescenev2.OneShot(data: any, allInstances = true);
// await firescenev2.OneShot({videovolume: "0.5"});
// await firescenev2.OneShot(JSON.stringify({firevolume: "0.5"}));
// await firescenev2.OneShot(JSON.stringify({fireurl: "https://firer.at/"}));

// oneShot({fireurl: "https://test-videos.co.uk/vids/bigbuckbunny/mp4/h264/1080/Big_Buck_Bunny_1080_10s_5MB.mp4"});
// oneShot({firevolume: "0.5"});
// oneShot({firevolume: "0"});