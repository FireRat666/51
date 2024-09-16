// create a reference to the banter scene
const firescenev2 = BS.BanterScene.GetInstance();

let firescreenurlv2 = "https://51.firer.at/scripts/firescreenv2.js"; // "https://51.firer.at/scripts/firescreenv2.js";
let announcerscripturlv2 = "https://51.firer.at/scripts/announcer.js";
let fireScreen2On = false;
let firstrunhandcontrolsv2 = true;
let announcerfirstrunv2 = true;
let firevolume = 1;
let playersuseridv2 = null;

let the_announce = null;
let the_announcer = null;
let the_announce420 = null;
let the_announceevents = null;
let screenObject = null;
let customButtonObjects = [];
let firebrowser;
let firesbillBoard;
let defaulTransparent = 'Unlit/DiffuseTransparent';
let uiButtons;
let uiButton;
let BUTTON_CONFIGS;
let thebuttonscolor;
let buttonsObjectsThing = {};

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
  const color = options.color || new BS.Vector4(1,1,1,1);
  const side = options.side || 0;
  const generateMipMaps = options.generateMipMaps || true;

  return objectThing.AddComponent(new BS.BanterMaterial(shaderName, texture, color, side, generateMipMaps));
};

function updateButtonColor(buttonObject, colour, revertColour) {
  let material = buttonObject.GetComponent(BS.ComponentType.BanterMaterial);
  material.color = colour;
  setTimeout(() => { material.color = revertColour; }, 100);
};

async function createCustomButton(name, color, position, scale, text, textposition, url, clickHandler) {
  
  const buttonObject = await createUIButton(name, null, position, color, screenObject, "false", 1, 1, "Unlit/Diffuse", scale);
  customButtonObjects.push(buttonObject);
  let material = buttonObject.GetComponent(BS.ComponentType.BanterMaterial);

  if (text) {
      const textObject = new BS.GameObject(`${name}Text`);
      const banterText = await textObject.AddComponent(new BS.BanterText(text, new BS.Vector4(1,1,1,1), "Center", "Center", 0.20, true, true, new BS.Vector2(2,1)));
      const textTransform = await textObject.AddComponent(new BS.Transform());
      textTransform.localPosition = textposition;
      await textObject.SetParent(screenObject, false);
      customButtonObjects.push(textObject);
  };

  if (url) {
      buttonObject.On('click', () => {
          console.log(`CLICKED: ${name}`);
          firebrowser.url = url;
          material.color = new BS.Vector4(0.3, 0.3, 0.3, 1);
          setTimeout(() => { material.color = color; }, 100);
          if (clickHandler) clickHandler();
      });
  };
};

async function createUIButton(name, thetexture, position, thecolor, thisparent, rotation = "false", width = 0.1, height = 0.1, theShader = defaulTransparent, localScale = new BS.Vector3(1, 1, 1)) {
  const buttonObject = new BS.GameObject(name);
  const buttonGeometry = await createGeometry(buttonObject, BS.GeometryType.PlaneGeometry, { thewidth: width, theheight: height });
  const buttonCollider = await buttonObject.AddComponent(new BS.BoxCollider(true, new BS.Vector3(0,0,0), new BS.Vector3(width, height, 0.01)));
  const buttonMaterial = await createMaterial(buttonObject, { shaderName: theShader, texture: thetexture, color: thecolor });
  const buttonTransform = await buttonObject.AddComponent(new BS.Transform());
  buttonTransform.position = position;
  buttonTransform.localScale = localScale;
  if (rotation !== "false") {
    buttonTransform.localEulerAngles = rotation;
  }
  buttonObject.SetLayer(5); // UI Layer
  await buttonObject.SetParent(thisparent, false);

  return buttonObject;
};

async function createButton(name, thetexture, position, thecolor, thisparent, clickHandler) {
  const button = await createUIButton(name, thetexture, position, thecolor, thisparent);
  createButtonAction(button, clickHandler);
  return button;
};

function adjustVolume(change) { // Pass -1 to decrease the volume Pass 1 to increase the volume
  let currentVolume = Number(firevolume); let adjustment;
  if (currentVolume < 0.1) { adjustment = 0.01; // Tiny adjustment for low volume
  } else if (currentVolume < 0.5) { adjustment = 0.03; // Medium adjustment for medium volume
  } else { adjustment = 0.05; // Big adjustment for high volume
  }
  firevolume = currentVolume + (change * adjustment);
  firevolume = Math.max(0, Math.min(firevolume, 1)).toFixed(2);
  let firepercent = (firevolume * 100).toFixed(0);
  runBrowserActions("document.querySelectorAll('video, audio').forEach((elem) => elem.volume=" + firevolume + ");");
  runBrowserActions("document.querySelector('.html5-video-player').setVolume(" + firepercent + ");");
  console.log(`FIRESCREEN2: Volume is: ${firevolume}`);
};

function toggleButtonVisibility(defaultobjects, visible) {
  defaultobjects.forEach(button => { button.SetActive(visible); });

  customButtonObjects.forEach(button => { 
    if (button) {button.SetActive(visible); };
  });
}

function runBrowserActions(script) {
  firebrowser.RunActions(JSON.stringify({"actions": [{ "actionType": "runscript","strparam1": script }]}));
};

function createButtonAction(buttonObject, clickHandler) {
  buttonObject.On('click', (e) => {
    clickHandler(e);
  });
};

async function createHandButton(name, iconUrl, position, color, parentObject, clickHandler) {
  const button = await createUIButton(name, iconUrl, position, color, parentObject, new BS.Vector3(180, 0, 0), 1, 1, defaulTransparent, new BS.Vector3(0.4, 0.4, 0.4));
  createButtonAction(button, clickHandler);
  return button;
};

// function getButtonColor(specificColor, defaultColor) {
//   console.log("specificColor");
//   console.log(specificColor);
//   return specificColor !== "false" ? specificColor : defaultColor;
// };

function setupfirescreen2() {
  console.log("FIRESCREEN2: Setting up");
  const allscripts = document.querySelectorAll("script[src='" + firescreenurlv2 + "']");
  allscripts.forEach(script => {
    console.log("FIRESCREEN2: Loading");
    const defaultParams = { position: "0 2 0", rotation: "0 0 0", scale: "1 1 1", volumelevel: "0.25",
      website: "https://firer.at/pages/games.html", mipmaps: "1", pixelsperunit: "1200", width: "1024", height: "576",
      backdrop: "true", handControls: "false", disableInteraction: "false", announce: "false", announce420: "false", announceEvents: "undefined",
      buttonColor: "0 1 0 1", backdropColor: "0 0 0 0.9", volUpColor: "false", volDownColor: "false", muteColor: "false", buttonPosition: "0 0 0",
      iconMuteUrl: "https://firer.at/files/VolumeMute.png", iconVolUpUrl: "https://firer.at/files/VolumeHigh.png",
      iconVolDownUrl: "https://firer.at/files/VolumeLow.png", iconDirectionUrl: "https://firer.at/files/Arrow.png",
      customButton01Url: "false", customButton01Text: "Custom Button 01",
      customButton02Url: "false", customButton02Text: "Custom Button 02",
      customButton03Url: "false", customButton03Text: "Custom Button 03",
      customButton04Url: "false", customButton04Text: "Custom Button 04"
    };

    const numberAttributes = { position: getV3FromStr, rotation: getV3FromStr, scale: getV3FromStr, buttonColor: getV4FromStr, backdropColor: getV4FromStr, volUpColor: getV4FromStr, volDownColor: getV4FromStr, muteColor: getV4FromStr };
    // Function to get or convert attribute
    const getParam = (key) => { const attr = script.getAttribute(key);
      const value = attr !== null ? attr : defaultParams[key];
      return numberAttributes[key] ? numberAttributes[key](value) : value; };

    const params = {};
    Object.keys(defaultParams).forEach(key => { params[key] = getParam(key); });

    const {
      position, rotation, scale, volumelevel, mipmaps, pixelsperunit, backdrop, website, buttonColor, announce, announce420, backdropColor, iconMuteUrl, iconVolUpUrl, iconVolDownUrl, iconDirectionUrl, volUpColor, volDownColor, muteColor, disableInteraction, buttonPosition, handControls, width, height, customButton01Url, customButton01Text, announceEvents, customButton02Url, customButton02Text, customButton03Url, customButton03Text, customButton04Url, customButton04Text
    } = params;

    const pURL = `url: ${website}; mipMaps: ${mipmaps}; pixelsPerUnit: ${pixelsperunit}; pageWidth: ${width}; pageHeight: ${height}; mode: local;`;

    sdk2tests(position, rotation, scale, volumelevel, mipmaps, pixelsperunit, backdrop, website, buttonColor, announce, announce420,
      backdropColor, iconMuteUrl, iconVolUpUrl, iconVolDownUrl, iconDirectionUrl, volUpColor, volDownColor, muteColor,
      disableInteraction, buttonPosition, handControls, width, height, customButton01Url, customButton01Text, announceEvents,
      customButton02Url, customButton02Text, customButton03Url, customButton03Text, customButton04Url, customButton04Text);
  });
};

async function sdk2tests(p_pos, p_rot, p_sca, p_volume, p_mipmaps, p_pixelsperunit, p_backdrop, p_website, p_buttoncolor, p_announce, p_announce420, p_backdropcolor, p_iconmuteurl, p_iconvolupurl, p_iconvoldownurl, p_icondirectionurl, p_volupcolor, p_voldowncolor, p_mutecolor, p_disableinteraction, p_buttonpos, p_handbuttons, p_width, p_height, p_custombuttonurl01, p_custombutton01text, p_announceevents, p_custombuttonurl02, p_custombutton02text, p_custombuttonurl03, p_custombutton03text, p_custombuttonurl04, p_custombutton04text) {

  the_announce = p_announce;
  the_announce420 = p_announce420;
  the_announceevents = p_announceevents;
  firevolume = p_volume;
  fireScreen2On = true;
  thebuttonscolor = p_buttoncolor;
  let isbillboarded = true;
  let keyboardstate = false;
  let buttonsvisible = true;
  let playerislockedv2 = false;
  let browsermuted = false;
  const url = p_website;
  const buttonSize = new BS.Vector3(0.2,0.04,1);
  let textPlaneColour = new BS.Vector4(0.1,0.1,0.1,1);

  screenObject = await new BS.GameObject("MyBrowser");
  firebrowser = await screenObject.AddComponent(new BS.BanterBrowser(p_website, p_mipmaps, p_pixelsperunit, p_width, p_height, null));

  if (p_disableinteraction === "false") { firebrowser.ToggleInteraction(true); }

  geometryObject = new BS.GameObject("MyGeometry");
  const geometry = await createGeometry(geometryObject, BS.GeometryType.PlaneGeometry, { thewidth: 1.09, theheight: 0.64 });

  // geometry Transform Stuff
  const geometrytransform = await geometryObject.AddComponent(new BS.Transform());
  geometrytransform.position = p_pos; geometrytransform.eulerAngles = p_rot;

  // Add Box Collider
  const size = new BS.Vector3(1.09,0.64,0.01);
  const boxCollider = await geometryObject.AddComponent(new BS.BoxCollider(false, new BS.Vector3(0,0,0), size));
  await geometryObject.SetLayer(20);
  
  // Add a Rigid Body to the geometry
  const firerigidBody = await geometryObject.AddComponent(new BS.BanterRigidbody(1, 10, 10, true, false, new BS.Vector3(0,0,0), "Discrete", false, false, false, false, false, false, new BS.Vector3(0,0,0), new BS.Vector3(0,0,0)));

  // If Backdrop is disabled, Hide it
  if (p_backdrop !== "true") { p_backdropcolor = new BS.Vector4(0,0,0,0); };

  const material = await createMaterial(geometryObject, { color: p_backdropcolor });
  // firebrowser Transform Stuff
  const browsertransform = await screenObject.AddComponent(new BS.Transform());
  browsertransform.position = new BS.Vector3(0,0,-0.01);
  browsertransform.localScale = new BS.Vector3(1,1,1);
  // Make the screen a child of the Main Geometry Object
  await screenObject.SetParent(geometryObject, false);

  // ADD FRICTION 
  const dynamicFriction = 100; const staticFriction = 100;
  const physicMaterial = await geometryObject.AddComponent(new BS.BanterPhysicMaterial(dynamicFriction, staticFriction));

  BUTTON_CONFIGS = { home: { icon: "https://firer.at/files/Home.png", position: new BS.Vector3(-0.2,0.38,0), color: thebuttonscolor,
      clickHandler: () => { console.log("Home Clicked!"); firebrowser.url = url;
      updateButtonColor(uiButtons.home, new BS.Vector4(1,1,1,0.8), thebuttonscolor); }
    }, info: { icon: "https://firer.at/files/Info.png", position: new BS.Vector3(-0.6,0.28,0), color: thebuttonscolor,
      clickHandler: () => { console.log("Info Clicked!"); firebrowser.url = "https://firer.at/pages/Info.html";
      updateButtonColor(uiButtons.info, new BS.Vector4(1,1,1,0.8), thebuttonscolor); }
    }, google: { icon: "https://firer.at/files/Google.png", position: new BS.Vector3(-0.6,0.16,0), color: new BS.Vector4(1,1,1,1),
      clickHandler: () => { console.log("Google Clicked!"); firebrowser.url = "https://google.com/";
      updateButtonColor(uiButtons.google, new BS.Vector4(1,1,1,0.8), new BS.Vector4(1,1,1,1)); }
    }, keyboard: { icon: "https://firer.at/files/Keyboard.png", position: new BS.Vector3(-0.6,-0.15,0), color: new BS.Vector4(1,1,1,1),
      clickHandler: () => { console.log("Keyboard Clicked!"); keyboardstate = !keyboardstate; firebrowser.ToggleKeyboard(keyboardstate ? 1 : 0);
        uiButtons.keyboard.GetComponent(BS.ComponentType.BanterMaterial).color = keyboardstate ? thebuttonscolor : new BS.Vector4(1,1,1,1); }
    }, mute: { icon: p_iconmuteurl, position: new BS.Vector3(0.167,0.38,0), color: p_mutecolor !== "false" ? p_mutecolor : thebuttonscolor,
      clickHandler: () => { console.log("Mute Clicked!"); browsermuted = !browsermuted;
      runBrowserActions(`document.querySelectorAll('video, audio').forEach((elem) => elem.muted=${browsermuted});`);
      uiButtons.mute.GetComponent(BS.ComponentType.BanterMaterial).color = browsermuted ? new BS.Vector4(1,0,0,1) : (p_mutecolor !== "false" ? p_mutecolor : thebuttonscolor); }
    }, volDown: { icon: p_iconvoldownurl, position: new BS.Vector3(0.334,0.38,0), color: p_voldowncolor !== "false" ? p_voldowncolor : thebuttonscolor,
      clickHandler: () => { console.log("Volume Down Clicked!"); adjustVolume(-1);
      updateButtonColor(uiButtons.volDown, new BS.Vector4(1,1,1,0.8), p_voldowncolor !== "false" ? p_voldowncolor : thebuttonscolor); }
    }, pageBack: { icon: p_icondirectionurl, position: new BS.Vector3(-0.5,0.38,0), color: thebuttonscolor,
      clickHandler: () => { console.log("Back Clicked!"); firebrowser.RunActions(JSON.stringify({"actions":[{"actionType": "goback"}]}));
      updateButtonColor(uiButtons.pageBack, new BS.Vector4(1,1,1,0.8), thebuttonscolor); }
    }, sizeGrow: { icon: "https://firer.at/files/expand.png", position: new BS.Vector3(0.6,0.06,0), color: thebuttonscolor,
      clickHandler: () => { console.log("Grow Clicked!"); adjustScale("grow");
      updateButtonColor(uiButtons.sizeGrow, new BS.Vector4(1,1,1,0.8), thebuttonscolor); }
    }, sizeShrink: { icon: "https://firer.at/files/shrink.png", position: new BS.Vector3(0.6,-0.06,0), color: thebuttonscolor,
      clickHandler: () => { console.log("Shrink Clicked!"); adjustScale("shrink");
      updateButtonColor(uiButtons.sizeShrink, new BS.Vector4(1,1,1,0.8), thebuttonscolor); }
    }, pageForward: { icon: p_icondirectionurl, position: new BS.Vector3(-0.38,0.38,0), color: thebuttonscolor,
      clickHandler: () => { console.log("Forward Clicked!"); firebrowser.RunActions(JSON.stringify({"actions":[{"actionType": "goforward"}]}));
      updateButtonColor(uiButtons.pageForward, new BS.Vector4(1,1,1,0.8), thebuttonscolor); }
    }, volUp: { icon: p_iconvolupurl, position: new BS.Vector3(0.495,0.38,0), color: p_volupcolor !== "false" ? p_volupcolor : thebuttonscolor,
      clickHandler: () => { console.log("Volume Down Clicked!"); adjustVolume(-1);
      updateButtonColor(uiButtons.volUp, new BS.Vector4(1,1,1,0.8), p_volupcolor !== "false" ? p_volupcolor : thebuttonscolor); }
    }, billboard: { icon: "https://firer.at/files/Rot.png", position: new BS.Vector3(-0.6,-0.3,0), color: thebuttonscolor,
      clickHandler: () => {isbillboarded = !isbillboarded;
        firesbillBoard.enableXAxis = isbillboarded; firesbillBoard.enableYAxis = isbillboarded;
        uiButtons.billboard.GetComponent(BS.ComponentType.BanterMaterial).color = isbillboarded ? thebuttonscolor : new BS.Vector4(1,1,1,1); }
    }
  };

  HIDE_BUTTON_CONFIG = { hideShow: { icon: "https://firer.at/files/Eye.png", position: new BS.Vector3(-0.6,0,0), color: thebuttonscolor,
      clickHandler: () => {buttonsvisible = !buttonsvisible; toggleButtonVisibility(Object.values(uiButtons), buttonsvisible ? 1 : 0)
        uiButton.hideShow.GetComponent(BS.ComponentType.BanterMaterial).color = buttonsvisible ? thebuttonscolor : new BS.Vector4(1, 1, 1, 0.5); }
    }
  };

  async function createUIButtons(parent, thebuttons) {
    buttonsObjectsThing = {};
    for (const [name, config] of Object.entries(thebuttons)) {
      buttonsObjectsThing[name] = await createButton( `FireButton_${name}`,
        config.icon, config.position, config.color, parent, config.clickHandler);
        console.log(`buttonsObjectsThing${name}`);
        console.log(buttonsObjectsThing[name]);
    } return buttonsObjectsThing;
  };

  console.log("Screen Button Stuff 2");
  uiButton = await createUIButtons(screenObject, HIDE_BUTTON_CONFIG);
  uiButtons = await createUIButtons(screenObject, BUTTON_CONFIGS);
  console.log("Screen Button Stuff 3");
  
  if (p_custombuttonurl01 !== "false") {
    console.log("p_custombuttonurl01 is true");
    await createCustomButton("MyGeometry16", textPlaneColour, new BS.Vector3(0.68,0.3,0), buttonSize, p_custombutton01text, new BS.Vector3(1.59,-0.188,-0.005), p_custombuttonurl01, () => {});
    console.log(p_custombuttonurl01); };

  if (p_custombuttonurl02 !== "false") {
    console.log("p_custombuttonurl02 is true");
    await createCustomButton("MyGeometry17", textPlaneColour, new BS.Vector3(0.68,0.25,0), buttonSize, p_custombutton02text, new BS.Vector3(1.59,-0.237,-0.005), p_custombuttonurl02, () => {});
    console.log(p_custombuttonurl02); };

  if (p_custombuttonurl03 !== "false") {
    console.log("p_custombuttonurl03 is true");
    await createCustomButton("MyGeometry18", textPlaneColour, new BS.Vector3(0.68,0.20,0), buttonSize, p_custombutton03text, new BS.Vector3(1.59,-0.287,-0.005), p_custombuttonurl03, () => {});
    console.log(p_custombuttonurl03); };

  if (p_custombuttonurl04 !== "false") {
    console.log("p_custombuttonurl04 is true");
    await createCustomButton("MyGeometry19", textPlaneColour, new BS.Vector3(0.68,0.15,0), buttonSize, p_custombutton04text, new BS.Vector3(1.59,-0.336,-0.005), p_custombuttonurl04, () => {});
    console.log(p_custombuttonurl04); };
  // Bill Board the geometryObject
  firesbillBoard = await geometryObject.AddComponent(new BS.BanterBillboard(0, true, true, true));
  // SET THE SCALE FOR THE SCREEN
  geometrytransform.localScale = p_sca;
  // When user Grabs the Browser, Make it moveable
  firerigidBody.gameObject.On('grab', () => {
    firerigidBody.isKinematic = false;
    console.log("GRABBED!");
  });
  // When user Drops the Browser, Lock it in place
  firerigidBody.gameObject.On('drop', () => {
    firerigidBody.isKinematic = true;
    console.log("DROPPED!");
  });
  
  function adjustScale(direction) {
    let scaleX = Number(parseFloat(geometrytransform.localScale.x).toFixed(3));
    let scaleY = Number(parseFloat(geometrytransform.localScale.y).toFixed(3));
    let adjustment;
    if (scaleX < 0.5) { adjustment = 0.025;
    } else if (scaleX < 2) { adjustment = 0.05;
    } else if (scaleX < 5) { adjustment = 0.1;
    } else { adjustment = 0.5; }
    if (direction === "shrink") { adjustment = -adjustment;
      if (scaleX + adjustment <= 0) { scaleX = 0.025; scaleY = 0.025; } }
    scaleX += adjustment; scaleY += adjustment;
    geometrytransform.localScale = new BS.Vector3(scaleX, scaleY, 1);
    return adjustment;
  };
  
  // browser-message - Fired when a message is received from a browser in the space.  
  firebrowser.On("browser-message", e => {
    // Do something with e.detail.
      console.log(e)
  });
    
  firescenev2.On("menu-browser-message", e => {
    // Do something with e.detail
    console.log(e)
  });

  firescenev2.On("one-shot", e => {
    console.log(e)
    let currentshotdata = JSON.parse(e.detail.data);
    if (e.detail.fromAdmin) {
      console.log("Current Shot From Admin Is True");
  
      if (currentshotdata.fireurl) { firebrowser.url = currentshotdata.fireurl; };
      if (currentshotdata.firevolume) {
        console.log(currentshotdata.firevolume);
        let thisfirevolume = Number(parseFloat(currentshotdata.firevolume).toFixed(2));
        let firepercent = parseInt(thisfirevolume*100).toFixed(0);
        runBrowserActions(`document.querySelectorAll('video, audio').forEach((elem) => elem.volume=${thisfirevolume});`);
        runBrowserActions(`document.querySelector('.html5-video-player').setVolume(${firepercent});`);
      };
  
    } else {
      console.log("Current Shot From Admin Is False");
      console.log(e.detail.fromId);
    };
  });

  firescenev2.On("user-joined", e => {
    // When a user Joins the space, Check their UserID against the list
    if (e.detail.isLocal) { // e.detail.uid
      // Setup Hand Controls only on the first run if enabled
      if (p_handbuttons == "true" && firstrunhandcontrolsv2 === true) {
        firstrunhandcontrolsv2 = false;
        console.log("FIRESCREEN2: Enabling Hand Controls");
        playersuseridv2 = e.detail.uid;
        setupHandControls();
      };
      console.log("FIRESCREEN2: user-joined");
    };
  });

  async function setupHandControls() {
    // THE CONTAINER FOR THE HAND BUTTONS
    console.log("FIRESCREEN2: Hand Control Stuff");
    const plane20Object = new BS.GameObject("MyGeometry20");
    const plane20geometry = await createGeometry(plane20Object, BS.GeometryType.PlaneGeometry);
    const plane20Collider = await plane20Object.AddComponent(new BS.BoxCollider(true, new BS.Vector3(0, 0, 0), new BS.Vector3(1, 1, 1)));
    const plane20material = await createMaterial(plane20Object, { shaderName: defaulTransparent, color: new BS.Vector4(0,0,0,0), side: 1 });
    const plane20transform = await plane20Object.AddComponent(new BS.Transform());
    firescenev2.LegacyAttachObject(plane20Object, playersuseridv2, BS.LegacyAttachmentPosition.LEFT_HAND)
    plane20transform.localPosition = new BS.Vector3(-0.01,-0.006,0.020);
    plane20transform.localScale = new BS.Vector3(0.1,0.1,0.1);
    plane20transform.localEulerAngles = new BS.Vector3(5,-95,0);
    
    const hvolUpButton = await createHandButton("hVolumeUpButton", p_iconvolupurl, new BS.Vector3(0.4,0.4,0.3), thebuttonscolor, plane20Object, () => { adjustVolume(1);
      updateButtonColor(hvolUpButton, new BS.Vector4(1,1,1,0.8), thebuttonscolor);
    });
    const hvolDownButton = await createHandButton("hVolumeDownButton", p_iconvoldownurl, new BS.Vector3(0.0,0.4,0.3), thebuttonscolor, plane20Object, () => { adjustVolume(-1);
      updateButtonColor(hvolDownButton, new BS.Vector4(1,1,1,0.8), thebuttonscolor);
    });
    const hmuteButton = await createHandButton("hMuteButton", p_iconmuteurl, new BS.Vector3(-0.4,0.4,0.3), thebuttonscolor, plane20Object, () => {
      browsermuted = !browsermuted;
      runBrowserActions(`document.querySelectorAll('video, audio').forEach((elem) => elem.muted=${browsermuted});`);
      let muteMaterial = hmuteButton.GetComponent(BS.ComponentType.BanterMaterial);
      muteMaterial.color = browsermuted ? new BS.Vector4(1, 0, 0, 1) : thebuttonscolor;
    });
    const hlockButton = await createHandButton("hLockButton", 'https://firer.at/files/lock.png', new BS.Vector3(0,-0.1,0.3), new BS.Vector4(1, 1, 1, 0.7), plane20Object, () => {
      playerislockedv2 = !playerislockedv2;
      playerislockedv2 ? lockPlayer() : unlockPlayer();
      let plane24material = hlockButton.GetComponent(BS.ComponentType.BanterMaterial);
      plane24material.color = playerislockedv2 ? new BS.Vector4(1,0,0,1) : new BS.Vector4(1, 1, 1, 0.7);
    });
    console.log("FIRESCREEN2: Hand Click Stuff END");
  };

  let waitingforunity = true;
  if (waitingforunity) {
  screeninterval = setInterval(function() {
    if (firescenev2.unityLoaded) {
      waitingforunity = false;
      clearInterval(screeninterval);
      if (announcerfirstrunv2) { console.log("FIRESCREEN2: announcerfirstrunv2 true"); announcerstufffunc(); };
    };
  }, 500); };

};

function announcerstufffunc() {
  console.log("FIRESCREEN2: Announcer Script Called");
  // Setup the Announcer only on the first run if enabled
  if (announcerfirstrunv2 === true ) {
    setTimeout(() => { 
      if (typeof announcerscene === 'undefined') {
        console.log('FIRESCREEN2: announcerscene is not defined, Setting up');

        announcerfirstrunv2 = false;
        console.log("FIRESCREEN2: Adding the Announcer Script");
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

      } else {
        console.log('FIRESCREEN2: announcerscene is defined, Moving on');
      };
    }, 1000);
  };

  setTimeout(() => { 
    if (announcerfirstrunv2 === false) {  timenow = Date.now(); };
  }, 1000);
}

function getV3FromStr(strVector3) {
  var aresult = strVector3.split(" ");
  let thisX = aresult[0]; let thisY = aresult[1]; let thisZ = aresult[2];
  return new BS.Vector3(thisX,thisY,thisZ);
};

function getV4FromStr(strVector4) {
  if (strVector4 == "false") {
    return strVector4;
  } else {
    var aresult = strVector4.split(" ");
    let thisX = aresult[0]; let thisY = aresult[1]; let thisZ = aresult[2]; let thisW= aresult[3];
    return new BS.Vector4(thisX,thisY,thisZ,thisW);
  };
};

function getAttrOrDef(pScript, pAttr, pDefault) {
  if (pScript.hasAttribute(pAttr)) {
    return pScript.getAttribute(pAttr);
  } else {
    return pDefault;
  };
};

var volinterval2 = null;
var soundlevel2firstrun = true;
function keepsoundlevel2() {
  if (fireScreen2On && soundlevel2firstrun) {
	console.log("FIRESCREEN2: keepsoundlevel loop");
	soundlevel2firstrun = false;
  // Loop to keep sound level set, runs every set second(s)
    volinterval2 = setInterval(function() {

    let firepercent = (firevolume * 100).toFixed(0);
    runBrowserActions("document.querySelectorAll('video, audio').forEach((elem) => elem.volume=" + firevolume + ");");
    runBrowserActions("document.querySelector('.html5-video-player').setVolume(" + firepercent + ");");

    }, 3000); } else if (fireScreen2On) { } else { clearInterval(volinterval2); }
};

setupfirescreen2();

// screenboxCollider = await firescenev2.Find("MyBrowser");

// await firescenev2.OneShot(data: any, allInstances = true);
// await firescenev2.OneShot({videovolume: "0.5"});
// await firescenev2.OneShot(JSON.stringify({firevolume: "0.5"}));
// await firescenev2.OneShot(JSON.stringify({fireurl: "https://firer.at/"}));

// oneShot({fireurl: "https://test-videos.co.uk/vids/bigbuckbunny/mp4/h264/1080/Big_Buck_Bunny_1080_10s_5MB.mp4"});
// oneShot({firevolume: "0.5"});
// oneShot({firevolume: "0"});