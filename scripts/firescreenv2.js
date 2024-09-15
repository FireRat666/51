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
let plane16Object = null;
let plane17Object = null;
let plane18Object = null;
let plane19Object = null;
let textgameObject01 = null;
let textgameObject02 = null;
let textgameObject03 = null;
let textgameObject04 = null;

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
}

async function createMaterial(objectThing, options = {}) {
  const shaderName = options.shaderName || 'Sprites/Diffuse';
  const texture = options.texture || null;
  const color = options.color || new BS.Vector4(1,1,1,1);
  const side = options.side || 0;
  const generateMipMaps = options.generateMipMaps || false;

  return objectThing.AddComponent(new BS.BanterMaterial(shaderName, texture, color, side, generateMipMaps));
};

async function createUIButton(name, thetexture, position, thecolor, rotation = "false", width = 0.1, height = 0.1, theShader = 'Unlit/DiffuseTransparent', localScale = new BS.Vector3(1, 1, 1), text = "false", textPosition) {
  const buttonObject = new BS.GameObject(name);
  const buttonGeometry = await createGeometry(buttonObject, BS.GeometryType.PlaneGeometry, { thewidth: width, theheight: height });
  const buttonCollider = await buttonObject.AddComponent(new BS.BoxCollider(true, new BS.Vector3(0,0,0), new BS.Vector3(width, height, 0.01)));
  const buttonMaterial = await createMaterial(buttonObject, { shaderName: theShader, texture: thetexture, color: thecolor });
  const buttonTransform = await buttonObject.AddComponent(new BS.Transform());
  buttonTransform.position = position;
  buttonTransform.localScale = localScale;
  if (rotation !== "false") {
    buttonTransform.localRotation = rotation;
  }
  buttonObject.SetLayer(5); // UI Layer
  await buttonObject.SetParent(screenObject, false);

  let textGameObject = null;
  if (text !== "false") {
    textGameObject = new BS.GameObject(name + "Text");
    const textObject = await textGameObject.AddComponent(new BS.BanterText(text, new BS.Vector4(1,1,1,1), "Center", "Center", 0.20, true, true, new BS.Vector2(2,1)));
    const textTransform = await textGameObject.AddComponent(new BS.Transform());
    textTransform.localPosition = textPosition || new BS.Vector3(0, 0, 0);
    await textGameObject.SetParent(screenObject, false);
  }
  return { buttonObject, textGameObject };
}

function setupfirescreen2() {
  console.log("FIRESCREEN2: Setting up");
  
  const allscripts = document.getElementsByTagName("script");
  for (let i = 0; i < allscripts.length; i++) {
    if (getAttrOrDef(allscripts[i], "src", "") === firescreenurlv2) { 
      console.log("FIRESCREEN2: Loading");
      const pPos = getV3FromStr(getAttrOrDef(allscripts[i], "position", "0 2 0"));
      const pRot = getV3FromStr(getAttrOrDef(allscripts[i], "rotation", "0 0 0"));
      const pSca = getV3FromStr(getAttrOrDef(allscripts[i], "scale", "1 1 1"));
      const pVolume = getAttrOrDef(allscripts[i], "volumelevel", "0.25");
      const pWebsite = getAttrOrDef(allscripts[i], "website", "https://firer.at/pages/games.html");
      const pMipmaps = getAttrOrDef(allscripts[i], "mipmaps", "1");
      const pPixelsperunit = getAttrOrDef(allscripts[i], "pixelsperunit", "1200");
      const pWidth = getAttrOrDef(allscripts[i], "width", "1024");
      const pHeight = getAttrOrDef(allscripts[i], "height", "576");
      const pBackdrop = getAttrOrDef(allscripts[i], "backdrop", "true");
      const pHandButtons = getAttrOrDef(allscripts[i], "hand-controls", "false");
      const pDisableInteraction = getAttrOrDef(allscripts[i], "disable-interaction", "false");
      const pAnnounce = getAttrOrDef(allscripts[i], "announce", "false");
	    const pAnnounce420 = getAttrOrDef(allscripts[i], "announce-420", "false");
	    const pAnnounceEvents = getAttrOrDef(allscripts[i], "announce-events", "undefined");
      const pButtonColor = getV4FromStr(getAttrOrDef(allscripts[i], "button-color", "0 1 0 1"));
      const pBackDropColor = getV4FromStr(getAttrOrDef(allscripts[i], "backdrop-color", "0 0 0 0.9"));
      const pVolUpColor = getV4FromStr(getAttrOrDef(allscripts[i], "volup-color", "false"));
      const pVolDownColor = getV4FromStr(getAttrOrDef(allscripts[i], "voldown-color", "false"));
      const pMuteColor = getV4FromStr(getAttrOrDef(allscripts[i], "mute-color", "false"));
      const pButtonPos = getAttrOrDef(allscripts[i], "button-position", "0 0 0");
      const pIconMuteUrl = getAttrOrDef(allscripts[i], "icon-mute-url", "https://firer.at/files/VolumeMute.png");
      const pIconVolUpUrl = getAttrOrDef(allscripts[i], "icon-volup-url", "https://firer.at/files/VolumeHigh.png");
      const pIconVolDownUrl = getAttrOrDef(allscripts[i], "icon-voldown-url", "https://firer.at/files/VolumeLow.png");
      const pIconDirectionUrl = getAttrOrDef(allscripts[i], "icon-direction-url", "https://firer.at/files/Arrow.png");
      const pCustomButton01Url = getAttrOrDef(allscripts[i], "custom-button01-url", "false");
      const pCustomButton01Text = getAttrOrDef(allscripts[i], "custom-button01-text", "Custom Button 01");
      const pCustomButton02Url = getAttrOrDef(allscripts[i], "custom-button02-url", "false");
      const pCustomButton02Text = getAttrOrDef(allscripts[i], "custom-button02-text", "Custom Button 02");
      const pCustomButton03Url = getAttrOrDef(allscripts[i], "custom-button03-url", "false");
      const pCustomButton03Text = getAttrOrDef(allscripts[i], "custom-button03-text", "Custom Button 03");
      const pCustomButton04Url = getAttrOrDef(allscripts[i], "custom-button04-url", "false");
      const pCustomButton04Text = getAttrOrDef(allscripts[i], "custom-button04-text", "Custom Button 04");
      const pURL = "url: " + pWebsite + "; mipMaps: " + pMipmaps + "; pixelsPerUnit: " + pPixelsperunit + "; pageWidth: " + pWidth + "; pageHeight: " + pHeight + "; mode: local;";
      sdk2tests(pPos, pRot, pSca, pVolume, pMipmaps, pPixelsperunit, pBackdrop, pWebsite, pButtonColor, pAnnounce, pAnnounce420,
      pBackDropColor, pIconMuteUrl, pIconVolUpUrl, pIconVolDownUrl, pIconDirectionUrl, pVolUpColor, pVolDownColor, pMuteColor,
      pDisableInteraction, pButtonPos, pHandButtons, pWidth, pHeight, pCustomButton01Url, pCustomButton01Text, pAnnounceEvents,
      pCustomButton02Url, pCustomButton02Text, pCustomButton03Url, pCustomButton03Text, pCustomButton04Url, pCustomButton04Text);
    };
  };
};

async function sdk2tests(p_pos, p_rot, p_sca, p_volume, p_mipmaps, p_pixelsperunit, p_backdrop, p_website, p_buttoncolor, p_announce, p_announce420, p_backdropcolor, p_iconmuteurl, p_iconvolupurl, p_iconvoldownurl, p_icondirectionurl, p_volupcolor, p_voldowncolor, p_mutecolor, p_disableinteraction, p_buttonpos, p_handbuttons, p_width, p_height, p_custombutton01url, p_custombutton01text, p_announceevents, p_custombutton02url, p_custombutton02text, p_custombutton03url, p_custombutton03text, p_custombutton04url, p_custombutton04text) {

  the_announce = p_announce;
  the_announce420 = p_announce420;
  the_announceevents = p_announceevents;
  firevolume = p_volume;
  fireScreen2On = true;
  let thebuttonscolor = p_buttoncolor;
  let isbillboarded = true;
  let keyboardstate = false;
  let buttonsvisible = true;
  let playerislockedv2 = false;
  let browsermuted = false;

  const url = p_website;
  const mipMaps = p_mipmaps;
  const pixelsPerUnit = p_pixelsperunit;
  const pageWidth = p_width;
  const pageHeight = p_height;
  const actions = null;
  const buttonSize = new BS.Vector3(0.2,0.04,1);
  let textPlaneColour = new BS.Vector4(0.1,0.1,0.1,1);

  screenObject = await new BS.GameObject("MyBrowser"); 
  // const screenObject = await new BS.CreateGameObject("MyBrowser");
  const browser = await screenObject.AddComponent(new BS.BanterBrowser(url, mipMaps, pixelsPerUnit, pageWidth, pageHeight, actions));

  if (p_disableinteraction === "false") {
  browser.ToggleInteraction(true);
  }

  geometryObject = new BS.GameObject("MyGeometry");

  const geometry = await createGeometry(geometryObject, BS.GeometryType.PlaneGeometry, { thewidth: 1.09, theheight: 0.64 });

  // geometry Transform Stuff
  const geometrytransform = await geometryObject.AddComponent(new BS.Transform());
  geometrytransform.position = p_pos;
  geometrytransform.eulerAngles = p_rot;

  // Add Box Collider
  const isTrigger = false;
  const center = new BS.Vector3(0,0,0);
  const size = new BS.Vector3(1.09,0.64,0.01);
  const boxCollider = await geometryObject.AddComponent(new BS.BoxCollider(isTrigger, center, size));

  await geometryObject.SetLayer(20);
  
  // Add a Rigid Body to the geometry
  const firerigidBody = await geometryObject.AddComponent(new BS.BanterRigidbody(1, 10, 10, true, false, new BS.Vector3(0,0,0), "Discrete", false, false, false, false, false, false, new BS.Vector3(0,0,0), new BS.Vector3(0,0,0)));

  // Material Stuff  p_backdrop
  if (p_backdrop == "true") {
    p_backdropcolor = p_backdropcolor;
  } else {
    p_backdropcolor = new BS.Vector4(0,0,0,0);
  };

  const material = await createMaterial(geometryObject, { color: p_backdropcolor });
  // Browser Transform Stuff
  const browsertransform = await screenObject.AddComponent(new BS.Transform());
  browsertransform.position = new BS.Vector3(0,0,-0.01);
  // browsertransform.localPosition = new BS.Vector3(1,2,1);
  browsertransform.localScale = new BS.Vector3(1,1,1);
  // Make the screen a child of the Main Geometry Object
  await screenObject.SetParent(geometryObject, false);

  // ADD FRICTION 
  const dynamicFriction = 100; const staticFriction = 100;
  const physicMaterial = await geometryObject.AddComponent(new BS.BanterPhysicMaterial(dynamicFriction, staticFriction));
  // THE HOME BUTTON
  const plane02color = thebuttonscolor;
  const { buttonObject: plane02Object } = await createUIButton("MyGeometry02", "https://firer.at/files/Home.png", new BS.Vector3(-0.2,0.38,0), plane02color);
  // THE INFO BUTTON
  const plane03color = thebuttonscolor;
  const { buttonObject: plane03Object } = await createUIButton("MyGeometry03", "https://firer.at/files/Info.png", new BS.Vector3(-0.6,0.28,0), plane03color);
  // THE GOOGLE BUTTON
  const plane04color = new BS.Vector4(1,1,1,1);
  const { buttonObject: plane04Object } = await createUIButton("MyGeometry04", "https://firer.at/files/Google.png", new BS.Vector3(-0.6,0.16,0), plane04color);
  // THE KEYBOARD BUTTON
  const plane05color = new BS.Vector4(1,1,1,1);
  const { buttonObject: plane05Object } = await createUIButton("MyGeometry05", "https://firer.at/files/Keyboard.png", new BS.Vector3(-0.6,-0.15,0), plane05color);
  // THE BACK BUTTON
  const plane06color = thebuttonscolor;
  const { buttonObject: plane06Object } = await createUIButton("MyGeometry06", p_icondirectionurl, new BS.Vector3(-0.5,0.38,0), plane06color);
  // THE GROW BUTTON
  const plane07color = thebuttonscolor;
  const { buttonObject: plane07Object } = await createUIButton("MyGeometry07", "https://firer.at/files/expand.png", new BS.Vector3(0.6,0.06,0), plane07color);
  // THE SHRINK BUTTON
  const plane08color = thebuttonscolor;
  const { buttonObject: plane08Object } = await createUIButton("MyGeometry08", "https://firer.at/files/shrink.png", new BS.Vector3(0.6,-0.06,0), plane08color);
  // THE FORWARD BUTTON
  const plane09color = thebuttonscolor;
  const { buttonObject: plane09Object } = await createUIButton("MyGeometry09", p_icondirectionurl, new BS.Vector3(-0.38,0.38,0), plane09color, new BS.Vector4(0,0,100,1));
  // THE HIDE/SHOW BUTTON
  const plane10color = thebuttonscolor;
  const { buttonObject: plane10Object } = await createUIButton("MyGeometry10", "https://firer.at/files/Eye.png", new BS.Vector3(-0.6,0,0), plane10color);
  // A EMPTY BUTTON
  const plane11color = thebuttonscolor;
  const { buttonObject: plane11Object } = await createUIButton("MyGeometry11", "https://firer.at/files/HG2.png", new BS.Vector3(0,0.38,0), new BS.Vector4(0,0,0,0));
  // plane11Object.SetActive(0);

  // THE MUTE BUTTON
  let plane12color = null;
	if (p_mutecolor !== "false") {
		plane12color = p_mutecolor;
	} else {
		plane12color = thebuttonscolor;
	};
  const { buttonObject: plane12Object } = await createUIButton("MyGeometry12", p_iconmuteurl, new BS.Vector3(0.167,0.38,0), plane12color);

  // THE VOLDOWN BUTTON
  let plane13color = null;
	if (p_voldowncolor !== "false") {
		plane13color = p_voldowncolor;
	} else {
		plane13color = thebuttonscolor;
	};
  const { buttonObject: plane13Object } = await createUIButton("MyGeometry13", p_iconvoldownurl, new BS.Vector3(0.334,0.38,0), plane13color);

  // THE VOLUP BUTTON
  let plane14color = null;
	if (p_volupcolor !== "false") {
		plane14color = p_volupcolor;
	} else {
		plane14color = thebuttonscolor;
	};
  const { buttonObject: plane14Object } = await createUIButton("MyGeometry14", p_iconvolupurl, new BS.Vector3(0.495,0.38,0), plane14color);

  // THE BILLBOARD/ROTATION BUTTON
  const plane15color = thebuttonscolor;
  const { buttonObject: plane15Object } = await createUIButton("MyGeometry15", "https://firer.at/files/Rot.png", new BS.Vector3(-0.6,-0.3,0), plane15color);

  if (p_custombutton01url !== "false") {
    console.log(p_custombutton01url)
    // THE EXTRA BUTTON 01
    const thisresult = await createUIButton("MyGeometry16", null, new BS.Vector3(0.68,0.3,0), textPlaneColour, "false", 1, 1, 'Unlit/Diffuse', buttonSize, p_custombutton01text, new BS.Vector3(1.59,-0.188,-0.005));
    plane16Object = thisresult.buttonObject;
    textgameObject01 = thisresult.textGameObject;
  };

  if (p_custombutton02url !== "false") {
      console.log(p_custombutton02url)
      // THE EXTRA BUTTON 02
      const thisresult = await createUIButton("MyGeometry17", null, new BS.Vector3(0.68,0.25,0), textPlaneColour, "false", 1, 1, 'Unlit/Diffuse', buttonSize, p_custombutton02text, new BS.Vector3(1.59,-0.237,-0.005));
      plane17Object = thisresult.buttonObject;
      textgameObject02 = thisresult.textGameObject;
  };

  if (p_custombutton03url !== "false") {
    console.log(p_custombutton03url)
    // THE EXTRA BUTTON 03
    const thisresult = await createUIButton("MyGeometry18", null, new BS.Vector3(0.68,0.20,0), textPlaneColour, "false", 1, 1, 'Unlit/Diffuse', buttonSize, p_custombutton03text, new BS.Vector3(1.59,-0.287,-0.005));
    plane18Object = thisresult.buttonObject;
    textgameObject03 = thisresult.textGameObject;
  };

  if (p_custombutton04url !== "false") {
    console.log(p_custombutton04url)
    // THE EXTRA BUTTON 04
    const thisresult = await createUIButton("MyGeometry19", null, new BS.Vector3(0.68,0.15,0), textPlaneColour, "false", 1, 1, 'Unlit/Diffuse', buttonSize, p_custombutton04text, new BS.Vector3(1.59,-0.336,-0.005));
    plane19Object = thisresult.buttonObject;
    textgameObject04 = thisresult.textGameObject;
  };
  
  // Bill Board the geometryObject
  const smoothing = 0;
  const billBoard = await geometryObject.AddComponent(new BS.BanterBillboard(smoothing, true, true, true));

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

  // Home Button Thing
  plane02Object.On('click', () => {
    console.log("CLICKED02!");
    browser.url = url;
    updateButtonColor(plane02Object, new BS.Vector4(1,1,1,0.8), plane02color);
  });

  // Info Button Thing - with extras
  plane03Object.On('click', e => {
    console.log("CLICKED03!");
    // Do something with e.detail.point and e.detail.normal.
    console.log("points: X:" + e.detail.point.x + " Y:" + e.detail.point.y + " Z:" + e.detail.point.z);
    console.log("normals: X:" + e.detail.normal.x + " Y:" + e.detail.normal.y + " Z:" + e.detail.normal.z);
    browser.url = "https://firer.at/pages/Info.html";
    updateButtonColor(plane03Object, new BS.Vector4(1,1,1,0.8), plane03color);
  });

  // Google Button Thing
  plane04Object.On('click', () => {
    console.log("CLICKED04!");
    browser.url = "https://google.com/";
    updateButtonColor(plane04Object, new BS.Vector4(1,1,1,0.8), plane04color);
  });

  // Keyboard Button Thing
  plane05Object.On('click', () => {
    console.log("CLICKED05!");
    let plane05material = plane05Object.GetComponent(BS.ComponentType.BanterMaterial);
    keyboardstate = !keyboardstate; // Toggle state
    browser.ToggleKeyboard(keyboardstate ? 1 : 0);
    plane05material.color = keyboardstate ? thebuttonscolor : plane05color;
  });

  // Back Button Thing
  plane06Object.On('click', () => {
    console.log("CLICKED06!");
    browser.RunActions(JSON.stringify({"actions":[{"actionType": "goback"}]}));
    updateButtonColor(plane06Object, new BS.Vector4(1,1,1,0.8), plane06color);
  });

  // Grow Button Thing
  plane07Object.On('click', () => {
    console.log("CLICKED07!");
    adjustScale("grow");
    updateButtonColor(plane07Object, new BS.Vector4(1,1,1,0.8), plane07color);
  });

  // Shrink Button Thing
  plane08Object.On('click', () => {
    console.log("CLICKED08!");
    adjustScale("shrink");
    updateButtonColor(plane08Object, new BS.Vector4(1,1,1,0.8), plane08color);
  });

  // Forward Button Thing
  plane09Object.On('click', () => {
    console.log("CLICKED09!");
    browser.RunActions(JSON.stringify({"actions":[{"actionType": "goforward"}]}));
    updateButtonColor(plane09Object, new BS.Vector4(1,1,1,1), plane09color);
  });

  // Function to toggle visibility of objects
  function toggleVisibility(objects, visibility) { objects.forEach(obj => obj.SetActive(visibility)); }

  // HIDE Button Thing
  plane10Object.On('click', () => {
    console.log("CLICKED10!");
    console.log(buttonsvisible ? "WAS VISIBLE!" : "WAS HIDDEN!");
    let plane10material = plane10Object.GetComponent(BS.ComponentType.BanterMaterial);

    const alwaysVisibleObjects = [ plane02Object, plane03Object, plane04Object, plane05Object, plane06Object, plane07Object, plane08Object, plane09Object, plane12Object, plane13Object, plane14Object, plane15Object ];

    const customButtonObjects = {
      customButton01: [plane16Object, textgameObject01],
      customButton02: [plane17Object, textgameObject02],
      customButton03: [plane18Object, textgameObject03],
      customButton04: [plane19Object, textgameObject04],
    };
    const buttonStates = { customButton01: p_custombutton01url, customButton02: p_custombutton02url, customButton03: p_custombutton03url, customButton04: p_custombutton04url, };
    // Toggle buttons visibility
    const visibility = buttonsvisible ? 0 : 1;
    toggleVisibility(alwaysVisibleObjects, visibility);
    // Handle custom buttons
    for (const [key, [planeObj, textObj]] of Object.entries(customButtonObjects)) {
      if (buttonStates[key] !== "false") { toggleVisibility([planeObj, textObj], visibility); }
    }
    plane10material.color = buttonsvisible ? new BS.Vector4(1, 1, 1, 0.5) : thebuttonscolor;
    // Update buttonsvisible state
    buttonsvisible = !buttonsvisible;
  });

  // HAND ICON Button Thing
  plane11Object.On('click', e => {
    console.log("CLICKED11!");
    // Do something with e.detail.point and e.detail.normal.
    console.log("points: X:" + e.detail.point.x + " Y:" + e.detail.point.y + " Z:" + e.detail.point.z);
    console.log("normals: X:" + e.detail.normal.x + " Y:" + e.detail.normal.y + " Z:" + e.detail.normal.z);
    updateButtonColor(plane11Object, new BS.Vector4(1, 1, 1, 1), plane11color);
  });
  // MUTE Button Thing
  plane12Object.On('click', () => {
    console.log("CLICKED12!");
    browsermuted = !browsermuted;
    runBrowserActions(`document.querySelectorAll('video, audio').forEach((elem) => elem.muted=${browsermuted});`);
    let plane12material = plane12Object.GetComponent(BS.ComponentType.BanterMaterial);
    plane12material.color = browsermuted ? new BS.Vector4(1,0,0,1) : plane12color;
  });
  // VOLUME DOWN Button Thing
  plane13Object.On('click', () => {
    console.log("CLICKED13!");
    adjustVolume(-1);
    updateButtonColor(plane13Object, new BS.Vector4(1,1,1,0.8), plane13color);
  });
  // VOLUME UP Button Thing
  plane14Object.On('click', () => {
    console.log("CLICKED14!");
    adjustVolume(1);
    updateButtonColor(plane14Object, new BS.Vector4(1,1,1,0.8), plane14color);
  });
  // Billboard Button Thing
  plane15Object.On('click', () => {
    console.log("CLICKED15!");
    isbillboarded = !isbillboarded; // Toggle billboard state
    billBoard.enableXAxis = isbillboarded;  // Update billboard state
    billBoard.enableYAxis = isbillboarded;
    let plane15material = plane15Object.GetComponent(BS.ComponentType.BanterMaterial);
    plane15material.color = isbillboarded ? plane15color : new BS.Vector4(1,1,1,1); // Update the plane colour 
  });

  // EXTRA Button Thing 01
  if (p_custombutton01url != "false") {
      plane16Object.On('click', () => {
      console.log("CLICKED01!");
      browser.url = p_custombutton01url;
      updateButtonColor(plane16Object, new BS.Vector4(0.3,0.3,0.3,1), textPlaneColour);
    });
  };

  // EXTRA Button Thing 02
  if (p_custombutton02url != "false") {
    plane17Object.On('click', () => {
      console.log("CLICKED02!");
      browser.url = p_custombutton02url;
      updateButtonColor(plane17Object, new BS.Vector4(0.3,0.3,0.3,1), textPlaneColour);
    });
  };

  // EXTRA Button Thing 03
  if (p_custombutton03url != "false") {
    plane18Object.On('click', () => {
      console.log("CLICKED03!");
      browser.url = p_custombutton03url;
      updateButtonColor(plane18Object, new BS.Vector4(0.3,0.3,0.3,1), textPlaneColour);
    });
  };

  // EXTRA Button Thing 04
  if (p_custombutton04url != "false") {
    plane19Object.On('click', () => {
      console.log("CLICKED04!");
      browser.url = p_custombutton04url;
      updateButtonColor(plane19Object, new BS.Vector4(0.3,0.3,0.3,1), textPlaneColour);
    });
  };

  function updateButtonColor(buttonObject, colour, revertColour) {
    let material = buttonObject.GetComponent(BS.ComponentType.BanterMaterial);
    material.color = colour;
    setTimeout(() => { material.color = revertColour; }, 100);
  };
  
  function runBrowserActions(script) {
    browser.RunActions(JSON.stringify({"actions": [{ "actionType": "runscript","strparam1": script }]}));
  };
  
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
  };
  

// browser-message - Fired when a message is received from a browser in the space.  
  browser.On("browser-message", e => {
    // Do something with e.detail.
      console.log(e)
  });
    
  firescenev2.On("menu-browser-message", e => {
    // Do something with e.detail
    console.log(e)
  });

  firescenev2.On("one-shot", e => {
    console.log(e)
    console.log(e.detail);
    let currentshotdata = JSON.parse(e.detail.data);
    if (e.detail.fromAdmin) {
      console.log("Current Shot From Admin Is True");
  
      if (currentshotdata.fireurl) {
        console.log("currentshotdata.fireurl Is True");
        browser.url = currentshotdata.fireurl;
      };
  
      if (currentshotdata.firevolume) {
        console.log("currentshotdata.firevolume Is True");
        console.log(currentshotdata.firevolume);
        let thisfirevolume = Number(parseFloat(currentshotdata.firevolume).toFixed(2));
        let firepercent = parseInt(thisfirevolume*100).toFixed(0);
        browser.RunActions(JSON.stringify(
          {"actions":[{"actionType": "runscript","strparam1": "document.querySelectorAll('video, audio').forEach((elem) => elem.volume=" + thisfirevolume + ");"}]}));
        browser.RunActions(JSON.stringify( {"actions":[{"actionType": "runscript","strparam1": "document.querySelector('.html5-video-player').setVolume(" + firepercent + ");"}]}));
    
      };
  
    } else {
      console.log("Current Shot From Admin Is False");
      console.log(e.detail.fromId);
    };
  });

  // await firescenev2.OneShot(data: any, allInstances = true);
  // await firescenev2.OneShot({videovolume: "0.5"});
  // await firescenev2.OneShot(JSON.stringify({firevolume: "0.5"}));
  // await firescenev2.OneShot(JSON.stringify({fireurl: "https://firer.at/"}));

  // oneShot({fireurl: "https://test-videos.co.uk/vids/bigbuckbunny/mp4/h264/1080/Big_Buck_Bunny_1080_10s_5MB.mp4"});
  // oneShot({firevolume: "0.5"});
  // oneShot({firevolume: "0"});

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

  async function setupHandControls() { // handControlsContainer.setAttribute("position", "0.04 0.006 -0.010");
    // THE CONTAINER FOR THE HAND BUTTONS
    console.log("FIRESCREEN2: Hand Control Stuff");
    const plane20Object = new BS.GameObject("MyGeometry20");
    const plane20geometry = await createGeometry(plane20Object, BS.GeometryType.PlaneGeometry);

    const plane20size = new BS.Vector3(1,1,1);
    plane20color = new BS.Vector4(0,0,0,0);
    const center = new BS.Vector3(0,0,0);
    const plane20Collider = await plane20Object.AddComponent(new BS.BoxCollider(true, center, plane20size));
    const plane20material = await createMaterial(plane20Object, { shaderName: 'Unlit/DiffuseTransparent', color: plane20color, side: 1 });
    const plane20transform = await plane20Object.AddComponent(new BS.Transform());
    // await plane20Object.SetLayer(5); // UI Layer
    // firescenev2.localUser.Attach(plane20Object,BS.LegacyAttachmentPosition.LEFT_HAND);
    firescenev2.LegacyAttachObject(plane20Object, playersuseridv2, BS.LegacyAttachmentPosition.LEFT_HAND)
    // const plane20transform = plane20Object.GetComponent(BS.ComponentType.Transform)
    plane20transform.localPosition = new BS.Vector3(0,-0.006,0.010);
    plane20transform.localScale = new BS.Vector3(0.1,0.1,0.1);
    // plane20transform.localRotation = new BS.Vector3(0,1,0);
    // plane20transform.eulerAngles = new BS.Vector3(90,-90,90);
    plane20transform.localEulerAngles = new BS.Vector3(20,260,0);

    // HAND VOLUME UP BUTTON
    const plane21Object = new BS.GameObject("MyGeometry21");
    const plane21geometry = await createGeometry(plane21Object, BS.GeometryType.PlaneGeometry);
    const plane21size = new BS.Vector3(1,1,1);
    const plane21Collider = await plane21Object.AddComponent(new BS.BoxCollider(true, center, plane21size));
    const plane21material = await createMaterial(plane21Object, { shaderName: 'Unlit/DiffuseTransparent', texture: p_iconvolupurl, color: plane14color, side: 1 });
    const plane21transform = await plane21Object.AddComponent(new BS.Transform());
    await plane21Object.SetParent(plane20Object, false);
    plane21transform.localPosition = new BS.Vector3(0.4,0.4,0.3);
    plane21transform.localScale = new BS.Vector3(0.4,0.4,0.4);
    await plane21Object.SetLayer(5); // UI Layer
    // const plane21transform = plane21Object.GetComponent(BS.ComponentType.Transform)

    // HAND VOLUME DOWN BUTTON
    const plane22Object = new BS.GameObject("MyGeometry22");
    const plane22geometry = await createGeometry(plane22Object, BS.GeometryType.PlaneGeometry);
    const plane22size = new BS.Vector3(1,1,1);
    const plane22Collider = await plane22Object.AddComponent(new BS.BoxCollider(true, center, plane22size));
    const plane22material = await createMaterial(plane22Object, { shaderName: 'Unlit/DiffuseTransparent', texture: p_iconvoldownurl, color: plane13color, side: 1 });
    const plane22transform = await plane22Object.AddComponent(new BS.Transform());
    await plane22Object.SetParent(plane20Object, false);
    plane22transform.localPosition = new BS.Vector3(0.0,0.4,0.3);
    plane22transform.localScale = new BS.Vector3(0.4,0.4,0.4);
    await plane22Object.SetLayer(5); // UI Layer

    // HAND MUTE BUTTON
    const plane23Object = new BS.GameObject("MyGeometry23");
    const plane23geometry = await createGeometry(plane23Object, BS.GeometryType.PlaneGeometry);
    const plane23size = new BS.Vector3(1,1,1);
    const plane23Collider = await plane23Object.AddComponent(new BS.BoxCollider(true, center, plane23size));
    const plane23material = await createMaterial(plane23Object, { shaderName: 'Unlit/DiffuseTransparent', texture: p_iconmuteurl, color: plane12color, side: 1 });
    const plane23transform = await plane23Object.AddComponent(new BS.Transform());
    await plane23Object.SetParent(plane20Object, false);
    plane23transform.localPosition = new BS.Vector3(-0.4,0.4,0.3);
    plane23transform.localScale = new BS.Vector3(0.4,0.4,0.4);
    await plane23Object.SetLayer(5); // UI Layer

    // HAND LOCK BUTTON
    const plane24Object = new BS.GameObject("MyGeometry24");
    const plane24geometry = await createGeometry(plane24Object, BS.GeometryType.PlaneGeometry);
    const plane24size = new BS.Vector3(1,1,1);
    const plane24color = new BS.Vector4(1,1,1,0.7);
    const plane24Collider = await plane24Object.AddComponent(new BS.BoxCollider(true, center, plane24size));
    const plane24material = await createMaterial(plane24Object, { shaderName: 'Unlit/DiffuseTransparent', texture: 'https://firer.at/files/lock.png', color: plane24color, side: 1 });
    const plane24transform = await plane24Object.AddComponent(new BS.Transform());
    await plane24Object.SetParent(plane20Object, false);
    plane24transform.localPosition = new BS.Vector3(0,-0.1,0.3);
    plane24transform.localScale = new BS.Vector3(0.4,0.4,0.4);
    plane24transform.localEulerAngles = new BS.Vector3(0,0,180);
    await plane24Object.SetLayer(5); // UI Layer

    console.log("FIRESCREEN2: Hand Control Stuff Setup");

    // HAND BUTTON VOLUME UP
    plane21Object.On('click', () => {
      console.log("CLICKED01!");
      firevolume = Number(firevolume);
      if (firevolume < 0.1) {
        firevolume += Number(0.01);
      } else if (firevolume < 0.5) {
        firevolume += Number(0.02);
      } else {
        firevolume += Number(0.05);
      };
      firevolume = parseFloat(firevolume).toFixed(2);
      if (firevolume > 1) {firevolume = 1};
      let firepercent = parseInt(firevolume*100).toFixed(0);
      console.log("The Volume: " + firevolume);
      browser.RunActions(JSON.stringify(
        {"actions":[{"actionType": "runscript","strparam1": "document.querySelectorAll('video, audio').forEach((elem) => elem.volume=" + firevolume + ");"}]}));
      browser.RunActions(JSON.stringify( {"actions":[{"actionType": "runscript","strparam1": "document.querySelector('.html5-video-player').setVolume(" + firepercent + ");"}]}));

      plane21material.color = new BS.Vector4(1,1,1,0.8);
      setTimeout(() => { plane21material.color = plane14color; }, 100);
    });

    // HAND BUTTON VOLUME DOWN
    plane22Object.On('click', () => {
      console.log("CLICKED02!");
      firevolume = Number(firevolume);
      if (firevolume < 0.1) {
        firevolume += Number(-0.01);
      } else if (firevolume < 0.5) {
        firevolume += Number(-0.03);
      } else {
        firevolume += Number(-0.05);
      };
      firevolume = parseFloat(firevolume).toFixed(2);
      if (firevolume < 0) {firevolume = 0};
      let firepercent = parseInt(firevolume*100).toFixed(0);
      console.log("The Volume: " + firevolume);
      browser.RunActions(JSON.stringify(
        {"actions":[{"actionType": "runscript","strparam1": "document.querySelectorAll('video, audio').forEach((elem) => elem.volume=" + firevolume + ");"}]}));
      browser.RunActions(JSON.stringify( {"actions":[{"actionType": "runscript","strparam1": "document.querySelector('.html5-video-player').setVolume(" + firepercent + ");"}]}));

      plane22material.color = new BS.Vector4(1,1,1,0.8);
      setTimeout(() => { plane22material.color = plane13color; }, 100);
    });

    // HAND BUTTON MUTE
    plane23Object.On('click', () => {
      console.log("CLICKED03!");

      if (browsermuted) {
        browsermuted = false;
        browser.RunActions(JSON.stringify(
          {"actions":[{"actionType": "runscript","strparam1": "document.querySelectorAll('video, audio').forEach((elem) => elem.muted=false);"}]}));
          plane12material.color = plane12color;
          plane23material.color = plane12color;
      } else {
        browsermuted = true;
        browser.RunActions(JSON.stringify(
          {"actions":[{"actionType": "runscript","strparam1": "document.querySelectorAll('video, audio').forEach((elem) => elem.muted=true);"}]}));
          plane12material.color = new BS.Vector4(1,0,0,1);
          plane23material.color = new BS.Vector4(1,0,0,1);
      };

    });

    // HAND BUTTON LOCK PLAYER
    plane24Object.On('click', () => {
      console.log("CLICKED04!");

      if (playerislockedv2) {
        playerislockedv2 = false;
        unlockPlayer();
        plane24material.color = plane24color;
      } else {
        playerislockedv2 = true;
        lockPlayer();
        plane24material.color = new BS.Vector4(1,0,0,1);
      };
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
    if (announcerfirstrunv2 === false) {
      timenow = Date.now(); 
    };
    
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

    browser.RunActions(JSON.stringify(
      {"actions":[{"actionType": "runscript","strparam1": "document.querySelectorAll('video, audio').forEach((elem) => elem.volume=" + firevolume + ");"}]}));

    }, 3000); } else if (fireScreen2On) { } else { clearInterval(volinterval2); }
};

setupfirescreen2();

// screenboxCollider = await firescenev2.Find("MyBrowser");