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
let plane16Object;
let plane17Object;
let plane18Object;
let plane19Object;
let textgameObject01 = null;
let textgameObject02 = null;
let textgameObject03 = null;
let textgameObject04 = null;
let firebrowser;
let firesbillBoard;
let defaultshader = 'Unlit/DiffuseTransparent';

// This Function adds geometry to the given game Object
async function createGeometry(thingy1, geomtype, options = {}) {
  console.log("createGeometry")
  console.log(thingy1)
  console.log(geomtype)
  console.log(options)
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

function updateButtonColor(buttonObject, colour, revertColour) {
  let material = buttonObject.GetComponent(BS.ComponentType.BanterMaterial);
  material.color = colour;
  setTimeout(() => { material.color = revertColour; }, 100);
};

async function createUIButton(name, thetexture, position, thecolor, thisparent, rotation = "false", width = 0.1, height = 0.1, theShader = defaultshader, localScale = new BS.Vector3(1, 1, 1), text = "false", textPosition) {
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

  let textGameObject = null;
  if (text !== "false") {
    textGameObject = new BS.GameObject(name + "Text");
    const textObject = await textGameObject.AddComponent(new BS.BanterText(text, new BS.Vector4(1,1,1,1), "Center", "Center", 0.20, true, true, new BS.Vector2(2,1)));
    const textTransform = await textGameObject.AddComponent(new BS.Transform());
    textTransform.localPosition = textPosition || new BS.Vector3(0, 0, 0);
    await textGameObject.SetParent(thisparent, false);
  }
  return { buttonObject, textGameObject };
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
  console.log(`FIRESCREEN2: Volume is: ${firevolume}`)
};

// Function to toggle visibility of objects
function toggleVisibility(objects, visible) { objects.forEach(obj => { if (obj) {obj.SetActive(visible) } });};

function runBrowserActions(script) {
  firebrowser.RunActions(JSON.stringify({"actions": [{ "actionType": "runscript","strparam1": script }]}));
};

function createButtonAction(buttonObject, clickHandler) {
  console.log("Create Button Action Object, Click");
  buttonObject.On('click', (e) => {
    clickHandler(e);
  });
};

async function createHandButton(name, iconUrl, position, color, parentObject, clickHandler) {
  const button = await createUIButton(name, iconUrl, position, color, parentObject, new BS.Vector3(180, 0, 0), 1, 1, defaultshader, new BS.Vector3(0.4, 0.4, 0.4));
  createButtonAction(button.buttonObject, clickHandler);
  return button;
};

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

async function sdk2tests(p_pos, p_rot, p_sca, p_volume, p_mipmaps, p_pixelsperunit, p_backdrop, p_website, p_buttoncolor, p_announce, p_announce420, p_backdropcolor, p_iconmuteurl, p_iconvolupurl, p_iconvoldownurl, p_icondirectionurl, p_volupcolor, p_voldowncolor, p_mutecolor, p_disableinteraction, p_buttonpos, p_handbuttons, p_width, p_height, p_custombuttonurl01, p_custombutton01text, p_announceevents, p_custombuttonurl02, p_custombutton02text, p_custombuttonurl03, p_custombutton03text, p_custombuttonurl04, p_custombutton04text) {

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
  firebrowser = await screenObject.AddComponent(new BS.BanterBrowser(url, mipMaps, pixelsPerUnit, pageWidth, pageHeight, actions));

  if (p_disableinteraction === "false") { firebrowser.ToggleInteraction(true); }

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
  // firebrowser Transform Stuff
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
  const { buttonObject: plane02Object } = await createUIButton("MyGeometry02", "https://firer.at/files/Home.png", new BS.Vector3(-0.2,0.38,0), plane02color, screenObject);
  createButtonAction(plane02Object, () => {firebrowser.url = url;updateButtonColor(plane02Object, new BS.Vector4(1,1,1,0.8), plane02color);});
  // THE INFO BUTTON
  const plane03color = thebuttonscolor;
  const { buttonObject: plane03Object } = await createUIButton("MyGeometry03", "https://firer.at/files/Info.png", new BS.Vector3(-0.6,0.28,0), plane03color, screenObject);
  createButtonAction(plane03Object, () => {firebrowser.url = "https://firer.at/pages/Info.html";updateButtonColor(plane03Object, new BS.Vector4(1,1,1,0.8), plane03color);});
  // THE GOOGLE BUTTON
  const plane04color = new BS.Vector4(1,1,1,1);
  const { buttonObject: plane04Object } = await createUIButton("MyGeometry04", "https://firer.at/files/Google.png", new BS.Vector3(-0.6,0.16,0), plane04color, screenObject);
  // THE KEYBOARD BUTTON
  const plane05color = new BS.Vector4(1,1,1,1);
  const { buttonObject: plane05Object } = await createUIButton("MyGeometry05", "https://firer.at/files/Keyboard.png", new BS.Vector3(-0.6,-0.15,0), plane05color, screenObject);
  // THE BACK BUTTON
  const plane06color = thebuttonscolor;
  const { buttonObject: plane06Object } = await createUIButton("MyGeometry06", p_icondirectionurl, new BS.Vector3(-0.5,0.38,0), plane06color, screenObject);
  // THE GROW BUTTON
  const plane07color = thebuttonscolor;
  const { buttonObject: plane07Object } = await createUIButton("MyGeometry07", "https://firer.at/files/expand.png", new BS.Vector3(0.6,0.06,0), plane07color, screenObject);
  // THE SHRINK BUTTON
  const plane08color = thebuttonscolor;
  const { buttonObject: plane08Object } = await createUIButton("MyGeometry08", "https://firer.at/files/shrink.png", new BS.Vector3(0.6,-0.06,0), plane08color, screenObject);
  // THE FORWARD BUTTON
  const plane09color = thebuttonscolor;
  const { buttonObject: plane09Object } = await createUIButton("MyGeometry09", p_icondirectionurl, new BS.Vector3(-0.38,0.38,0), plane09color, screenObject, new BS.Vector3(0,0,180));
  // THE HIDE/SHOW BUTTON
  const plane10color = thebuttonscolor;
  const { buttonObject: plane10Object } = await createUIButton("MyGeometry10", "https://firer.at/files/Eye.png", new BS.Vector3(-0.6,0,0), plane10color, screenObject);
  // A EMPTY BUTTON
  const plane11color = thebuttonscolor;
  const { buttonObject: plane11Object } = await createUIButton("MyGeometry11", "https://firer.at/files/HG2.png", new BS.Vector3(0,0.38,0), new BS.Vector4(0,0,0,0), screenObject);
  createButtonAction(plane11Object, handIconClick, plane11color, new BS.Vector4(1, 1, 1, 1));
  setTimeout(() => { plane11Object.SetActive(0); }, 500);

  // THE MUTE BUTTON
  let plane12color = null;
	if (p_mutecolor !== "false") { plane12color = p_mutecolor;
	} else { plane12color = thebuttonscolor; };
  const { buttonObject: plane12Object } = await createUIButton("MyGeometry12", p_iconmuteurl, new BS.Vector3(0.167,0.38,0), plane12color, screenObject);
  createButtonAction(plane12Object, muteButClick, plane12color, new BS.Vector4(1,0,0,1));

  // THE VOLDOWN BUTTON
  let plane13color = null;
	if (p_voldowncolor !== "false") { plane13color = p_voldowncolor;
	} else { plane13color = thebuttonscolor; };
  const { buttonObject: plane13Object } = await createUIButton("MyGeometry13", p_iconvoldownurl, new BS.Vector3(0.334,0.38,0), plane13color, screenObject);
  // THE VOLDOWN BUTTON Click Event Creation
  createButtonAction(plane13Object, () => adjustVolume(-1), plane13color, new BS.Vector4(1,1,1,0.8));

  // THE VOLUP BUTTON
  let plane14color = null;
	if (p_volupcolor !== "false") { plane14color = p_volupcolor;
	} else { plane14color = thebuttonscolor; };
  const { buttonObject: plane14Object } = await createUIButton("MyGeometry14", p_iconvolupurl, new BS.Vector3(0.495,0.38,0), plane14color, screenObject);
  // THE VOLUP BUTTON Click Event Creation
  createButtonAction(plane14Object, () => adjustVolume(1), plane14color, new BS.Vector4(1,1,1,0.8));

  // THE BILLBOARD/ROTATION BUTTON
  const plane15color = thebuttonscolor;
  const { buttonObject: plane15Object } = await createUIButton("MyGeometry15", "https://firer.at/files/Rot.png", new BS.Vector3(-0.6,-0.3,0), plane15color, screenObject);
  createButtonAction(plane15Object, billboardButClick, plane15color, new BS.Vector4(1,1,1,1));
  
  
  const horizontalAlignment = "Center";
  const verticalAlignment = "Center";
  const fontSize = 0.20;
  const richText = true;
  const enableWordWrapping = true;
  const rectTransformSizeDelta = new BS.Vector2(2,1);
  const side = 0;
  const generateMipMaps = false;

  if (p_custombuttonurl01 !== "false") {
    console.log("p_custombuttonurl01 is true")
    console.log(p_custombuttonurl01)
    // THE EXTRA BUTTON 01 - CURRENTLY
    plane16Object = new BS.GameObject("MyGeometry16");
    const plane16geometry = await createGeometry(plane16Object, BS.GeometryType.PlaneGeometry);
    const plane16size = new BS.Vector3(1,1,0);
    plane16color = new BS.Vector4(0.1,0.1,0.1,0.9);
    const plane16Collider = await plane16Object.AddComponent(new BS.BoxCollider(true, center, plane16size));
    plane16material = await plane16Object.AddComponent(new BS.BanterMaterial("Unlit/Diffuse", null, plane16color, side, generateMipMaps));
    const plane16transform = await plane16Object.AddComponent(new BS.Transform());
    await plane16Object.SetLayer(5); // UI Layer
    plane16transform.position = new BS.Vector3(0.68,0.3,0);
    plane16transform.localScale = new BS.Vector3(0.2,0.04,1);
    await plane16Object.SetParent(screenObject, false);
    // THE EXTRA TEXT - CURRENTLY
    const text01color = new BS.Vector4(1,1,1,1);
    textgameObject01 = new BS.GameObject("MyText01");
    const text01object = await textgameObject01.AddComponent(new BS.BanterText(p_custombutton01text, text01color, horizontalAlignment, verticalAlignment, fontSize, richText, enableWordWrapping, rectTransformSizeDelta));
    const text01transform = await textgameObject01.AddComponent(new BS.Transform());
    // await textgameObject01.SetLayer(5); // UI Layer
    // text01transform.position = new BS.Vector3(1.6,0.1,0.01);
    text01transform.localPosition = new BS.Vector3(1.59,-0.188,-0.005);
    await textgameObject01.SetParent(screenObject, false);
  };

  if (p_custombuttonurl02 !== "false") {
    console.log("p_custombuttonurl02 is true")
    console.log(p_custombuttonurl02)
    // THE EXTRA BUTTON 02 - CURRENTLY
    plane17Object = new BS.GameObject("MyGeometry17");
    const plane17geometry = await createGeometry(plane17Object, BS.GeometryType.PlaneGeometry);
    const plane17size = new BS.Vector3(1,1,0);
    plane17color = new BS.Vector4(0.1,0.1,0.1,0.1);
    const plane17Collider = await plane17Object.AddComponent(new BS.BoxCollider(true, center, plane17size));
    plane17material = await plane17Object.AddComponent(new BS.BanterMaterial("Unlit/Diffuse", null, plane17color, side, generateMipMaps));
    const plane17transform = await plane17Object.AddComponent(new BS.Transform());
    await plane17Object.SetLayer(5); // UI Layer
    plane17transform.position = new BS.Vector3(0.68,0.25,0);
    plane17transform.localScale = new BS.Vector3(0.2,0.04,1);
    await plane17Object.SetParent(screenObject, false);
    // THE EXTRA TEXT - CURRENTLY
    const text02color = new BS.Vector4(1,1,1,1);
    textgameObject02 = new BS.GameObject("MyText02");
    const text02object = await textgameObject02.AddComponent(new BS.BanterText(p_custombutton02text, text02color, horizontalAlignment, verticalAlignment, fontSize, richText, enableWordWrapping, rectTransformSizeDelta));
    const text02transform = await textgameObject02.AddComponent(new BS.Transform());
    // await textgameObject02.SetLayer(5); // UI Layer
    // text02transform.position = new BS.Vector3(1.6,0.1,0.02);
    text02transform.localPosition = new BS.Vector3(1.59,-0.237,-0.005);
    await textgameObject02.SetParent(screenObject, false);
  };

  if (p_custombuttonurl03 !== "false") {
    console.log("p_custombuttonurl03 is true")
    console.log(p_custombuttonurl03)
    // THE EXTRA BUTTON 03 - CURRENTLY
    plane18Object = new BS.GameObject("MyGeometry18");
    const plane18geometry = await createGeometry(plane18Object, BS.GeometryType.PlaneGeometry);
    const plane18size = new BS.Vector3(1,1,0);
    plane18color = new BS.Vector4(0.1,0.1,0.1,0.7);
    const plane18Collider = await plane18Object.AddComponent(new BS.BoxCollider(true, center, plane18size));
    plane18material = await plane18Object.AddComponent(new BS.BanterMaterial("Unlit/Diffuse", null, plane18color, side, generateMipMaps));
    const plane18transform = await plane18Object.AddComponent(new BS.Transform());
    await plane18Object.SetLayer(5); // UI Layer
    plane18transform.position = new BS.Vector3(0.68,0.20,0);
    plane18transform.localScale = new BS.Vector3(0.2,0.04,1);
    await plane18Object.SetParent(screenObject, false);
    // THE EXTRA TEXT - CURRENTLY
    const text03color = new BS.Vector4(1,1,1,1);
    textgameObject03 = new BS.GameObject("MyText03");
    const text03object = await textgameObject03.AddComponent(new BS.BanterText(p_custombutton03text, text03color, horizontalAlignment, verticalAlignment, fontSize, richText, enableWordWrapping, rectTransformSizeDelta));
    const text03transform = await textgameObject03.AddComponent(new BS.Transform());
    // await textgameObject03.SetLayer(5); // UI Layer
    // text03transform.position = new BS.Vector3(1.6,0.1,0.03);
    text03transform.localPosition = new BS.Vector3(1.59,-0.287,-0.005);
    await textgameObject03.SetLayer(6); // UI Layer
    await textgameObject03.SetParent(screenObject, false);
  };

  if (p_custombuttonurl04 !== "false") {
    console.log("p_custombuttonurl04 is true")
    console.log(p_custombuttonurl04)
    // THE EXTRA BUTTON 04 - CURRENTLY
    plane19Object = new BS.GameObject("MyGeometry19");
    const plane19geometry = await createGeometry(plane19Object, BS.GeometryType.PlaneGeometry);
    const plane19size = new BS.Vector3(1,1,0);
    plane19color = new BS.Vector4(0.1,0.1,0.1,0.7);
    const plane19Collider = await plane19Object.AddComponent(new BS.BoxCollider(true, center, plane19size));
    plane19material = await plane19Object.AddComponent(new BS.BanterMaterial("Unlit/Diffuse", null, plane19color, side, generateMipMaps));
    const plane19transform = await plane19Object.AddComponent(new BS.Transform());
    await plane19Object.SetLayer(5); // UI Layer
    plane19transform.position = new BS.Vector3(0.68,0.15,0);
    plane19transform.localScale = new BS.Vector3(0.2,0.04,1);
    await plane19Object.SetParent(screenObject, false);
    // THE EXTRA TEXT - CURRENTLY
    const text04color = new BS.Vector4(1,1,1,1);
    textgameObject04 = new BS.GameObject("MyText04");
    const text04object = await textgameObject04.AddComponent(new BS.BanterText(p_custombutton04text, text04color, horizontalAlignment, verticalAlignment, fontSize, richText, enableWordWrapping, rectTransformSizeDelta));
    const text04transform = await textgameObject04.AddComponent(new BS.Transform());
    // await textgameObject04.SetLayer(5); // UI Layer
    // text04transform.position = new BS.Vector3(1.6,0.1,0.04);
    text04transform.localPosition = new BS.Vector3(1.59,-0.336,-0.005);
    await textgameObject04.SetLayer(6); // UI Layer
    await textgameObject04.SetParent(screenObject, false);
  };
  
  // EXTRA Button Thing 01
  if (p_custombuttonurl01 != "false") {
    plane16Object.On('click', () => {
    console.log("CLICKED01!");
    browser.url = p_custombutton01url;
    plane16material.color = new BS.Vector4(0.3,0.3,0.3,1);
    setTimeout(() => { plane16material.color = plane16color; }, 100);
    });
  };

  // EXTRA Button Thing 02
  if (p_custombuttonurl02 != "false") {
    plane17Object.On('click', () => {
      console.log("CLICKED02!");
      browser.url = p_custombutton02url;
      plane17material.color = new BS.Vector4(0.3,0.3,0.3,1);
      setTimeout(() => { plane17material.color = plane17color; }, 100);
    });
  };

  // EXTRA Button Thing 03
  if (p_custombuttonurl03 != "false") {
    plane18Object.On('click', () => {
      console.log("CLICKED03!");
      browser.url = p_custombutton03url;
      plane18material.color = new BS.Vector4(0.3,0.3,0.3,1);
      setTimeout(() => { plane18material.color = plane18color; }, 100);
    });
  };

  // EXTRA Button Thing 04
  if (p_custombuttonurl04 != "false") {
    plane19Object.On('click', () => {
      console.log("CLICKED04!");
      browser.url = p_custombutton04url;
      plane19material.color = new BS.Vector4(0.3,0.3,0.3,1);
      setTimeout(() => { plane19material.color = plane19color; }, 100);
    });
  };

  // Bill Board the geometryObject
  const smoothing = 0;
  firesbillBoard = await geometryObject.AddComponent(new BS.BanterBillboard(smoothing, true, true, true));

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

  // Google Button Thing
  plane04Object.On('click', () => {
    console.log("CLICKED04!");
    firebrowser.url = "https://google.com/";
    updateButtonColor(plane04Object, new BS.Vector4(1,1,1,0.8), plane04color);
  });

  // Keyboard Button Thing
  plane05Object.On('click', () => {
    console.log("CLICKED05!");
    let plane05material = plane05Object.GetComponent(BS.ComponentType.BanterMaterial);
    keyboardstate = !keyboardstate; // Toggle state
    firebrowser.ToggleKeyboard(keyboardstate ? 1 : 0);
    plane05material.color = keyboardstate ? thebuttonscolor : plane05color;
  });

  // Back Button Thing
  plane06Object.On('click', () => {
    console.log("CLICKED06!");
    firebrowser.RunActions(JSON.stringify({"actions":[{"actionType": "goback"}]}));
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
    firebrowser.RunActions(JSON.stringify({"actions":[{"actionType": "goforward"}]}));
    updateButtonColor(plane09Object, new BS.Vector4(1,1,1,1), plane09color);
  });

  // HIDE Button Thing
plane10Object.On('click', () => {
  console.log("CLICKED10!");
  console.log(buttonsvisible ? "WAS VISIBLE!" : "WAS HIDDEN!");
  let plane10material = plane10Object.GetComponent(BS.ComponentType.BanterMaterial);

  const alwaysVisibleObjects = [
    plane02Object, plane03Object, plane04Object, plane05Object, plane06Object, 
    plane07Object, plane08Object, plane09Object, plane12Object, plane13Object, 
    plane14Object, plane15Object
  ];

  // Toggle visibility for always visible objects
  toggleVisibility(alwaysVisibleObjects, buttonsvisible ? 0 : 1);

  plane10material.color = buttonsvisible ? new BS.Vector4(1, 1, 1, 0.5) : thebuttonscolor;
  buttonsvisible = !buttonsvisible;
});

  // HAND ICON Button Thing
  function handIconClick(e) {
    console.log("CLICKED11!");
    if (e) {
      console.log("points: X:" + e.detail.point.x + " Y:" + e.detail.point.y + " Z:" + e.detail.point.z);
      console.log("normals: X:" + e.detail.normal.x + " Y:" + e.detail.normal.y + " Z:" + e.detail.normal.z);
    };
    updateButtonColor(plane11Object, new BS.Vector4(1, 1, 1, 1), plane11color);
  };

  function muteButClick() {
    console.log("CLICKED12!");
    browsermuted = !browsermuted;
    runBrowserActions(`document.querySelectorAll('video, audio').forEach((elem) => elem.muted=${browsermuted});`);
    let plane12material = plane12Object.GetComponent(BS.ComponentType.BanterMaterial);
    plane12material.color = browsermuted ? new BS.Vector4(1,0,0,1) : plane12color;
  };

  function billboardButClick() {
    console.log("CLICKED15!");
    console.log("Before toggle:", isbillboarded);
    isbillboarded = !isbillboarded; // Toggle billboard state
    console.log("After toggle:", isbillboarded);
    firesbillBoard.enableXAxis = isbillboarded;  // Update billboard state
    firesbillBoard.enableYAxis = isbillboarded;
    let plane15material = plane15Object.GetComponent(BS.ComponentType.BanterMaterial);
    plane15material.color = isbillboarded ? plane15color : new BS.Vector4(1,1,1,1); // Update the plane colour 
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

  async function setupHandControls() { // handControlsContainer.setAttribute("position", "0.04 0.006 -0.010");
    // THE CONTAINER FOR THE HAND BUTTONS
    console.log("FIRESCREEN2: Hand Control Stuff");
    const plane20Object = new BS.GameObject("MyGeometry20");
    const plane20geometry = await createGeometry(plane20Object, BS.GeometryType.PlaneGeometry);
    const plane20Collider = await plane20Object.AddComponent(new BS.BoxCollider(true, new BS.Vector3(0, 0, 0), new BS.Vector3(1, 1, 1)));
    const plane20material = await createMaterial(plane20Object, { shaderName: defaultshader, color: new BS.Vector4(0,0,0,0), side: 1 });
    const plane20transform = await plane20Object.AddComponent(new BS.Transform());
    firescenev2.LegacyAttachObject(plane20Object, playersuseridv2, BS.LegacyAttachmentPosition.LEFT_HAND)
    plane20transform.localPosition = new BS.Vector3(-0.01,-0.006,0.020);
    plane20transform.localScale = new BS.Vector3(0.1,0.1,0.1);
    plane20transform.localEulerAngles = new BS.Vector3(5,-95,0);

    // HAND VOLUME UP BUTTON
    
    const hvolUpButton = await createHandButton("hVolumeUpButton", p_iconvolupurl, new BS.Vector3(0.4,0.4,0.3), plane14color, plane20Object, () => adjustVolume(1));
    const hvolDownButton = await createHandButton("hVolumeDownButton", p_iconvoldownurl, new BS.Vector3(0.0,0.4,0.3), plane13color, plane20Object, () => adjustVolume(-1));
    const hmuteButton = await createHandButton("hMuteButton", p_iconmuteurl, new BS.Vector3(-0.4,0.4,0.3), plane12color, plane20Object, () => {
      browsermuted = !browsermuted;
      runBrowserActions(`document.querySelectorAll('video, audio').forEach((elem) => elem.muted=${browsermuted});`);
      let muteMaterial = hmuteButton.buttonObject.GetComponent(BS.ComponentType.BanterMaterial);
      muteMaterial.color = browsermuted ? new BS.Vector4(1, 0, 0, 1) : plane12color;
    });
    const hlockButton = await createHandButton("hLockButton", 'https://firer.at/files/lock.png', new BS.Vector3(0,-0.1,0.3), new BS.Vector4(1, 1, 1, 0.7), plane20Object, () => {
      playerislockedv2 = !playerislockedv2;
      playerislockedv2 ? lockPlayer() : unlockPlayer();
      let plane24material = hlockButton.buttonObject.GetComponent(BS.ComponentType.BanterMaterial);
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