// Thank you Everyone who helped make this possible, HBR, Vanquish3r, DedZed, Sebek, Skizot, Shane and FireRat, And thank you to everyone who helped test it
// FireScreen Tablet for Screen Casts with volume controls or for a portable browser
// VERSION: 1.1 Beta 1.7
var thishostnameurl = "https://51.firer.at/scripts/"; // CHANGE THIS URL IF MAKING A COPY OF THIS SCRIPT AND THE ONES BELOW
var thisscriptsurl = thishostnameurl + "firescreen.js"; // CHANGE THIS
var announcerscripturl = thishostnameurl + "announcer.js"; // CHANGE THIS
var fireScreenOn = false;
var thebuttoncolor = "";
var volupcolor = "";
var voldowncolor = "";
var IconVolUpUrl = "";
var IconVolDownUrl = "";
var IconMuteUrl = "";
var numberofbrowsers = 0;
var announcerfirstrun = true;
var firstrunhandcontrols = true;
var handcontrolsdisabled = true;
var aframedetected = false;
var playerislocked = false;
var playersuserid = false;
var handbuttonmutestate = false;

function enableFireScreen() {
  console.log("FIRESCREEN: Enabling Screen(s)");
  // window.enableControllerExtras(); // CAN REMOVE THIS LINE
  const scripts = document.getElementsByTagName("script");
  for (let i = 0; i < scripts.length; i++) {
    if (getAttrOrDef(scripts[i], "src", "") === thisscriptsurl ) {
      const pPos = getV3FromStr(getAttrOrDef(scripts[i], "position", "1 2 -1"));
      const pRot = getV3FromStr(getAttrOrDef(scripts[i], "rotation", "0 0 0"));
      const pSca = getV3FromStr(getAttrOrDef(scripts[i], "scale", "1 1 1"));
      const pVolume = getAttrOrDef(scripts[i], "volumelevel", "0.25");
      const pWebsite = getAttrOrDef(scripts[i], "website", "https://firer.at/pages/games.html");
      const pMipmaps = getAttrOrDef(scripts[i], "mipmaps", "1");
      const pPixelsperunit = getAttrOrDef(scripts[i], "pixelsperunit", "1200");
      const pWidth = getAttrOrDef(scripts[i], "width", "1024");
      const pHeight = getAttrOrDef(scripts[i], "height", "576");
      const pBackdrop = getAttrOrDef(scripts[i], "backdrop", "true");
      const pCastMode = getAttrOrDef(scripts[i], "castmode", "false");
      const pHandButtons = getAttrOrDef(scripts[i], "hand-controls", "false");
      const pDisableInteraction = getAttrOrDef(scripts[i], "disable-interaction", "false");
      const pAnnouncer = getAttrOrDef(scripts[i], "announcer", "false");
      const pAnnounce = getAttrOrDef(scripts[i], "announce", "false");
	    const pAnnounce420 = getAttrOrDef(scripts[i], "announce-420", "false");
	    const pAnnounceEvents = getAttrOrDef(scripts[i], "announce-events", "undefined");
      const pButtonColor = getAttrOrDef(scripts[i], "button-color", "#00FF00");
      const pBackDropColor = getAttrOrDef(scripts[i], "backdrop-color", "#000000");
      const pVolUpColor = getAttrOrDef(scripts[i], "volup-color", "null");
      const pVolDownColor = getAttrOrDef(scripts[i], "voldown-color", "null");
      const pMuteColor = getAttrOrDef(scripts[i], "mute-color", "#FFFFFF");
      const pButtonPos = getAttrOrDef(scripts[i], "button-position", "0 0 0");
      const pButtonRot = getAttrOrDef(scripts[i], "button-rotation", "0 0 0");
      const pIconMuteUrl = getAttrOrDef(scripts[i], "icon-mute-url", "https://firer.at/files/VolumeMute.png");
      const pIconVolUpUrl = getAttrOrDef(scripts[i], "icon-volup-url", "https://firer.at/files/VolumeHigh.png");
      const pIconVolDownUrl = getAttrOrDef(scripts[i], "icon-voldown-url", "https://firer.at/files/VolumeLow.png");
      const pIconDirectionUrl = getAttrOrDef(scripts[i], "icon-direction-url", "https://firer.at/files/Arrow.png");
      const pCustomButton01Url = getAttrOrDef(scripts[i], "custom-button01-url", "false");
      const pCustomButton01Text = getAttrOrDef(scripts[i], "custom-button01-text", "Custom Button 01");
      const pCustomButton02Url = getAttrOrDef(scripts[i], "custom-button02-url", "false");
      const pCustomButton02Text = getAttrOrDef(scripts[i], "custom-button02-text", "Custom Button 02");
      const pCustomButton03Url = getAttrOrDef(scripts[i], "custom-button03-url", "false");
      const pCustomButton03Text = getAttrOrDef(scripts[i], "custom-button03-text", "Custom Button 03");
      const pURL = "url: " + pWebsite + "; mipMaps: " + pMipmaps + "; pixelsPerUnit: " + pPixelsperunit + "; pageWidth: " + pWidth + "; pageHeight: " + pHeight + "; mode: local;";
      createFireScreen(pPos, pRot, pSca, pVolume, pURL, pBackdrop, pCastMode, pWebsite, pButtonColor, pAnnouncer, pAnnounce, pAnnounce420, pAnnounceEvents,
		pBackDropColor, pIconMuteUrl, pIconVolUpUrl, pIconVolDownUrl, pIconDirectionUrl, pVolUpColor, pVolDownColor, pMuteColor,
		pDisableInteraction, pButtonPos, pButtonRot, pHandButtons, pWidth, pHeight, pCustomButton01Url, pCustomButton01Text,
		pCustomButton02Url, pCustomButton02Text, pCustomButton03Url, pCustomButton03Text);
    }
  };
}

function disableFireScreen() {
	let thisloopnumber = 0;
	while (thisloopnumber < numberofbrowsers) {
		thisloopnumber++
		let firescreen = document.getElementById("fires-browser" + thisloopnumber);
		if (firescreen) {
			// Browser is on, remove it
			firescreen.parentElement.removeChild(firescreen);
			console.log("FIRESCREEN: Fire screen Disabled"); 
		}
	}
	fireScreenOn = false;
	keepsoundlevel();
};

function createFireScreen(p_pos, p_rot, p_sca, p_volume, p_url, p_backdrop, p_castmode, p_website, p_buttoncolor, p_announcer, p_announce, p_announce420, p_announceevents,
  p_backdropcolor, p_iconmuteurl, p_iconvolupurl, p_iconvoldownurl, p_icondirectionurl, p_volupcolor, p_voldowncolor, p_mutecolor,
  p_disableinteraction, p_buttonpos, p_buttonrot, p_handbuttons, p_width, p_height, p_custombutton01url, p_custombutton01text,
  p_custombutton02url, p_custombutton02text, p_custombutton03url, p_custombutton03text) {

  function createButton(position, width, height, color, src, attributes = {}, rotation = null, visible = true, buttonClass = "buttons") {
      let button = document.createElement("a-plane");
      button.setAttribute("position", position);
      button.setAttribute("width", width);
      button.setAttribute("height", height);
      button.setAttribute("color", color || thebuttoncolor);
      button.setAttribute("material", "transparent: true");
      button.setAttribute("sq-collider");
      button.setAttribute("sq-interactable");
      button.setAttribute("class", buttonClass);
      button.setAttribute("src", src);
      button.setAttribute("visible", visible);
      if (rotation) { button.setAttribute("rotation", rotation); };
      for (let [key, value] of Object.entries(attributes)) { button.setAttribute(key, value); };
      return button;
  };

  // Setup the Announcer only on the first run if enabled
  if (announcerfirstrun === true && typeof announcerscene === 'undefined') {
      announcerfirstrun = false;
      console.log("FIRESCREEN: Adding the Announcer Script");
      const announcerscript = document.createElement("script");
      announcerscript.id = "fires-announcer";
      announcerscript.setAttribute("src", announcerscripturl);
      announcerscript.setAttribute("announce", p_announce);
      announcerscript.setAttribute("announce-420", p_announce420);
      announcerscript.setAttribute("announce-events", p_announceevents === "undefined" ? (p_announce === "true" ? "true" : "false") : p_announceevents);
      document.querySelector("body").appendChild(announcerscript);
  };

  numberofbrowsers++;
  thebuttoncolor = p_buttoncolor;
  IconVolUpUrl = p_iconvolupurl;
  IconVolDownUrl = p_iconvoldownurl;
  IconMuteUrl = p_iconmuteurl;

  let firescreen = document.createElement("a-entity");
  firescreen.id = "fires-browser" + numberofbrowsers;
  firescreen.setAttribute("position", p_pos);
  firescreen.setAttribute("rotation", p_rot);
  firescreen.setAttribute("scale", p_sca);
  firescreen.setAttribute("pageWidth", p_width);
  firescreen.setAttribute("pageHeight", p_height);
  firescreen.setAttribute("volumelevel", p_volume);
  firescreen.setAttribute("button-color", p_buttoncolor);
  firescreen.setAttribute("mute-color", p_mutecolor);
  firescreen.setAttribute("sq-browser", p_url);
  if (p_disableinteraction === "false") {
      firescreen.setAttribute("sq-browser-interaction");
      firescreen.setAttribute("enable-interaction");
  };
  firescreen.setAttribute("class", "firescreenc");
  firescreen.setAttribute("name", "firescreenc");

  if (p_castmode == "false") {
      firescreen.setAttribute("sq-rigidbody", "useGravity: false; drag:10; angularDrag:10;");
  };

  let firecollider = createButton("0 0 -0.005", "1.0", "0.55", "#ff0000", null, {"sq-boxcollider": "", "sq-grabbable": "", "scale" : "1.0 0.55 0.05", "enableLock" : "false", "opacity" : "0"}, null, false, "collider");
  firescreen.appendChild(firecollider);

  // firecollider.makeGameObject();
  // firecollider.gameObject.On('grab', () => {console.log("GRABBED!"); }); // When user Grabs the Browser
  // firecollider.gameObject.On('drop', () => {console.log("DROPPED!"); }); // When user Drops the Browser

  if (p_backdrop == "true") {
      let firebackdrop = document.createElement("a-box");
      firebackdrop.setAttribute("opacity", "0.9");
      firebackdrop.setAttribute("position", "0 0 -0.015");
      firebackdrop.setAttribute("depth", "0.01");
      firebackdrop.setAttribute("width", "1.09");
      firebackdrop.setAttribute("height", "0.64");
      firebackdrop.setAttribute("color", p_backdropcolor);
      firescreen.appendChild(firebackdrop);
  };

  let [ButRotX, ButRotY, ButRotZ] = p_buttonrot.split(" ").map(Number);
  let TheButRot = new BS.Vector3(ButRotX, ButRotY, ButRotZ);

  if (p_castmode == "false") {
      // Lock/Unlock button
      firescreen.appendChild(createButton("0 0.38 0", "0.1", "0.1", thebuttoncolor === "#00FF00" ? "#FFFF00" : thebuttoncolor, "https://firer.at/files/HG2.png", {"lockbutton": ""}, TheButRot));
      // Google button
      firescreen.appendChild(createButton("-0.6 0.16 0", "0.1", "0.1", "#FFFFFF", "https://firer.at/files/Google.png", {"click-url": "url:https://google.com/"}));
      // Info button
      firescreen.appendChild(createButton("-0.6 0.28 0", "0.1", "0.1", thebuttoncolor, "https://firer.at/files/Info.png", {"click-url": "url:https://firer.at/pages/Info.html"}));
      // Grow and Shrink buttons
      firescreen.appendChild(createButton("0.6 0.06 0", "0.1", "0.1", thebuttoncolor, "https://firer.at/files/expand.png", {"scale-screen": "size: shrink; avalue: 0.1"}, TheButRot));
      firescreen.appendChild(createButton("0.6 -0.06 0", "0.1", "0.1", thebuttoncolor, "https://firer.at/files/shrink.png", {"scale-screen": "size: shrink; avalue: -0.1"}, TheButRot));
      // Rotate and Tilt buttons
      firescreen.appendChild(createButton("-0.5 -0.37 0", "0.1", "0.1", thebuttoncolor, "https://firer.at/files/RL.png", {"rotate": "axis: y; amount: 5"}, null, false, "tilt"));
      firescreen.appendChild(createButton("0.5 -0.37 0", "0.1", "0.1", thebuttoncolor, "https://firer.at/files/RR.png", {"rotate": "axis: y; amount: -5"}, null, false, "tilt"));
      firescreen.appendChild(createButton("-0.4 -0.37 0", "0.1", "0.1", thebuttoncolor, "https://firer.at/files/TF.png", {"rotate": "axis: x; amount: -5"}, null, false, "tilt"));
      firescreen.appendChild(createButton("0.4 -0.37 0", "0.1", "0.1", thebuttoncolor, "https://firer.at/files/TB.png", {"rotate": "axis: x; amount: 5"}, null, false, "tilt"));
      // Toggle rotation button
      firescreen.appendChild(createButton("-0.6 -0.3 0", "0.1", "0.1", "#FFFFFF", "https://firer.at/files/Rot.png", {"enablerot": "false"}, TheButRot));
      // Hide/Show keyboard button
      firescreen.appendChild(createButton("-0.6 -0.15 0", "0.1", "0.1", "#FFFFFF", "https://firer.at/files/Keyboard.png", {"forcekeyboard": "false"}, TheButRot));
      // Hide/Show buttons toggle
      firescreen.appendChild(createButton("-0.6 0 0", "0.1", "0.1", "#FFFFFF", "https://firer.at/files/Eye.png", {"hidebuttons": ""}, TheButRot, true, ""));
  };

  // Home button
  let homeButtonPos = computeButtonPosition(p_buttonpos, "-0.27 0.38 0");
  firescreen.appendChild(createButton(homeButtonPos, "0.1", "0.1", thebuttoncolor === "#00FF00" ? "#FF0000" : thebuttoncolor, "https://firer.at/files/Home.png", {"click-url": `url:${p_website}`}, TheButRot));
  // Forward button
  let forwardButtonPos = computeButtonPosition(p_buttonpos, "-0.4 0.38 0");
  let forwardButtonRot = new BS.Vector3(ButRotX, ButRotY, ButRotZ + 180);
  firescreen.appendChild(createButton(forwardButtonPos, "0.1", "0.1", thebuttoncolor, p_icondirectionurl, {"navigate-browser": "action: goforward"}, forwardButtonRot));
  // Backward button
  let backButtonPos = computeButtonPosition(p_buttonpos, "-0.5 0.38 0");
  firescreen.appendChild(createButton(backButtonPos, "0.1", "0.1", thebuttoncolor, p_icondirectionurl, {"navigate-browser": "action: goback"}, TheButRot));
  // Mute Toggle Button
  let muteButtonPos = computeButtonPosition(p_buttonpos, "0.2 0.38 0");
  let muteButton = createButton(muteButtonPos, "0.1", "0.1", p_mutecolor, p_iconmuteurl, {"toggle-mute": ""}, TheButRot, true, "firemutebutc buttons");
  firescreen.appendChild(muteButton);
  // volUp Button
  let volUpButtonPos = computeButtonPosition(p_buttonpos, "0.5 0.38 0");
  let volUpButton = createButton(volUpButtonPos, "0.1", "0.1", p_volupcolor || thebuttoncolor, p_iconvolupurl, {"volume-level": "vvalue: 1"}, TheButRot);
  firescreen.appendChild(volUpButton);
  // volDown Button
  let volDownButtonPos = computeButtonPosition(p_buttonpos, "0.35 0.38 0");
  let volDownButton = createButton(volDownButtonPos, "0.1", "0.1", p_voldowncolor || thebuttoncolor, p_iconvoldownurl, {"volume-level": "vvalue: -1"}, TheButRot);
  firescreen.appendChild(volDownButton);

  function addCustomButton(url, text, position) {
      if (url !== "false") {
          let button = createButton(position, "0.2", "0.04", "#000000", null, {"click-url": `url:${url}`});
          let buttonText = document.createElement("a-text");
          buttonText.setAttribute("value", text);
          buttonText.setAttribute("position", "0 0 0.005");
          buttonText.setAttribute("scale", "0.11 0.11 0.11");
          buttonText.setAttribute("color", "#FFFFFF");
          buttonText.setAttribute("align", "center");
          button.appendChild(buttonText);
          firescreen.appendChild(button);
      };
  };

  addCustomButton(p_custombutton01url, p_custombutton01text, "0.68 0.3 0");
  addCustomButton(p_custombutton02url, p_custombutton02text, "0.68 0.25 0");
  addCustomButton(p_custombutton03url, p_custombutton03text, "0.68 -0.3 0");

  document.querySelector("a-scene").appendChild(firescreen);
  setTimeout(() => {
      setupBrowsers();
      keepsoundlevel();
  }, 1000);

  if (p_handbuttons === "true" && firstrunhandcontrols === true) {
    firstrunhandcontrols = false;
    console.log("FIRESCREEN: Enabling Hand Controls");
    const handbuttonstuff = new handButtonCrap(p_voldowncolor, p_volupcolor, p_mutecolor);
  };
  console.log("FIRESCREEN: " + numberofbrowsers + " screen(s) Enabled");

  function computeButtonPosition(basePos, offsetPos) {
      const baseArray = basePos.split(" ").map(Number);
      const offsetArray = offsetPos.split(" ").map(Number);
      return baseArray.map((base, i) => base + offsetArray[i]).join(" ");
  };
};

// Sets the default sound level probably
var volinterval = null;
var soundlevelfirstrun = true;
function keepsoundlevel() {
  if (fireScreenOn && soundlevelfirstrun) {
	console.log("FIRESCREEN: keepsoundlevel loop");
	soundlevelfirstrun = false;
  // Loop to keep sound level set, runs every second
    volinterval = setInterval(function() {
		let thisloopnumber = 0;
		while (thisloopnumber < numberofbrowsers) {
			thisloopnumber++
			let theBrowser = document.getElementById("fires-browser" + thisloopnumber);
			let volume = parseFloat(theBrowser.getAttribute("volumelevel"));
      let firepercent = parseInt(volume*100).toFixed(0);
			theBrowser.components["sq-browser"].runActions([ { actionType: "runscript", strparam1:
			"document.querySelectorAll('video, audio').forEach((elem) => elem.volume=" + volume + ");", }, ]);
			theBrowser.components["sq-browser"].runActions([ { actionType: "runscript", strparam1:
			"document.querySelector('.html5-video-player').setVolume(" + firepercent + ");", }, ]);
		};
    }, 5000); } else if (fireScreenOn) { } else { clearInterval(volinterval); }
};

// Set the width and height of the screen(s)
var notalreadysetup = true;
function setupBrowsers() {
	if (notalreadysetup) {
		notalreadysetup = false;
    for (let i = 1; i <= numberofbrowsers; i++) {
      const browserElement = document.getElementById("fires-browser" + i);
      const browserPageWidth = browserElement.getAttribute("pageWidth");
      const browserPageHeight = browserElement.getAttribute("pageHeight");
      browserElement.browser.pageWidth = browserPageWidth; browserElement.browser.pageHeight = browserPageHeight;
      browserElement.transform.WatchProperties([BS.PropertyName.position, BS.PropertyName.eulerAngles]); // Test Watch Properties
      const { rotation } = browserElement.object3D;
      browserElement.transform.eulerAngles = new BS.Vector3(rotation.x, rotation.y, rotation.z);
      console.log(`FIRESCREEN: ${i} Width is: ${browserPageWidth} and Height: ${browserPageHeight}`);
      if (!announcerfirstrun) { timenow = Date.now(); }
    };
	};
};

// Enables Interaction for all the browser windows by HBR
AFRAME.registerComponent("enable-interaction", { init: async function() { await window.AframeInjection.waitFor(this.el, "browser"); this.el.browser.ToggleInteraction(true) } });
    
// Listens for button clicks to open the urls on either Screen by HBR
AFRAME.registerComponent("click-url", {
schema: { url: { type: "string", default: "" }, },
init: function () {
  this.el.addEventListener("click", () => {                         
  const TheBrowser = this.el.parentElement;
  let thisbuttoncolor = this.el.getAttribute("color");
  if (thisbuttoncolor != null) {
    this.el.setAttribute("color", (thisbuttoncolor === "#FFFFFF" ? "#00FF00" : "#FFFFFF")); 
    setTimeout(() => {  this.el.setAttribute("color", thisbuttoncolor); }, 100);
  };
  TheBrowser.setAttribute("sq-browser", { url: this.data.url, pixelsPerUnit: 1600, mipMaps: 1, mode: "local", });		
});		},		});
		
// Toggle Button for locking and unlocking either screen By Fire with help from HBR
AFRAME.registerComponent("lockbutton", {
init: function () {
  this.el.addEventListener("click", () => {                         
  const TheBrowser = this.el.parentElement;
  const lockToggle = this.el;
  const ColliderScreen = lockToggle.parentElement.children[0];
  let thisbuttoncolor = TheBrowser.getAttribute("button-color");
  const isLockEnabled = ColliderScreen.getAttribute("enableLock") === "true";
  const newColor = isLockEnabled ? (thisbuttoncolor === "#00FF00" ? "#FFFF00" : thisbuttoncolor) : "#00FF00";
  lockToggle.setAttribute("color", newColor);
  ColliderScreen.setAttribute("enableLock", isLockEnabled ? "false" : "true");
});  }, 	});

function updateLockState(state) {
  document.querySelectorAll('.firescreenc').forEach(element => {
    const ColliderScreen = element.children[0];
    if (ColliderScreen.getAttribute("enableLock") === "true") { ColliderScreen.setAttribute("visible", state);
    } else if (ColliderScreen.getAttribute("visible")) { ColliderScreen.setAttribute("visible", false); };
  });
};

// Toggle Button Thing for locking and unlocking either screen By Fire with help from HBR
window.buttonPressCallback = (button) => {        
  switch (button) {
    case "RightGrip":
    case "LeftGrip":
      updateLockState(true);
      break;
    case "RightGripRelease":
    case "LeftGripRelease":
      updateLockState(false);
      break;
  }
};

// Toggle Button for Keyboard By Fire with help from HBR
AFRAME.registerComponent("forcekeyboard", {
  init: function () { this.el.addEventListener("click", () => {
    const TheBrowser = this.el.parentElement;
    const isKeyboardActive = this.el.getAttribute("forcekeyboard") === "true";
    const buttonColor = TheBrowser.getAttribute("button-color");
    TheBrowser.browser.ToggleKeyboard(isKeyboardActive ? 0 : 1);
    this.el.setAttribute("forcekeyboard", !isKeyboardActive);
    this.el.setAttribute("color", isKeyboardActive ? "#FFFFFF" : buttonColor);
}); }, });

// Toggle Sound for browser screen By Fire with help from HBR
AFRAME.registerComponent("toggle-mute", {
  init: function () { this.el.addEventListener("click", () => { 
      const browserElement = this.el.parentElement; const muteButton = this.el;
      const isMuted = browserElement.getAttribute("datamuted") === "true";
      const muteColor = browserElement.getAttribute("mute-color");
      const newMutedState = !isMuted;
      const newColor = newMutedState ? (muteColor === "#FF0000" ? "#FFFF00" : "#FF0000") : muteColor;
      muteButton.setAttribute("color", newColor);
      browserElement.setAttribute("datamuted", String(newMutedState));
      browserElement.components["sq-browser"].runActions([{ actionType: "runscript", strparam1: `document.querySelectorAll('video, audio').forEach((elem) => elem.muted = ${newMutedState});` }]);
  })}
});

// Changes Scale of either Screen when button clicked with help from HBR
AFRAME.registerComponent("scale-screen", {
schema: {
  size: { type: "string" },
  avalue: { type: "number" },
},
init: function () { this.el.addEventListener("click", () => {
  const screenScale = this.el.parentElement;
  const initialColor = this.el.getAttribute("color");
  let { scale } = screenScale.object3D;
  const delta = this.data.size === "grow" ? -this.data.avalue : this.data.avalue;
  let newScaleX = Math.max(0.05, (scale.x + delta).toFixed(2));
  let newScaleY = Math.max(0.05, (scale.y + delta).toFixed(2));
  this.el.setAttribute("color", "#AAAAAA");
  screenScale.setAttribute("scale", `${newScaleX} ${newScaleY} 1`);
  setTimeout(() => { this.el.setAttribute("color", initialColor); }, 100);
});		},		});
		
// Rotate either screen when buttons clicked by HBR
AFRAME.registerComponent("rotate", {
  schema: { axis: { type: "string" }, amount: { type: "number" }, },
  init: function () {
    this.el.addEventListener("click", () => {
      const browserRotation = this.el.parentElement;
      const initialColor = browserRotation.getAttribute("button-color");
      const { x, y, z } = browserRotation.transform.eulerAngles;
      const newRotation = { x, y, z };
      if (this.data.axis === "x") { newRotation.x += this.data.amount;
      } else if (this.data.axis === "y") { newRotation.y += this.data.amount; };
      this.el.setAttribute("color", "#AAAAAA");
      browserRotation.transform.eulerAngles = new BS.Vector3(newRotation.x, newRotation.y, 0);
      setTimeout(() => { this.el.setAttribute("color", initialColor); }, 100);
}); }, });

// Toggle for hiding and showing the rotation buttons By Fire with help from HBR
AFRAME.registerComponent("enablerot", {
init: function () { this.el.addEventListener("click", () => {
  const isVisible = this.el.parentElement.children[7].getAttribute("visible");
  const newColor = isVisible ? "#FFFFFF" : this.el.parentElement.getAttribute("button-color");
  const visibilityState = isVisible ? "false" : "true"; this.el.setAttribute("color", newColor);
  document.querySelectorAll(".tilt").forEach(el => el.setAttribute("visible", visibilityState));
});  }, 	});
		
// Toggle for hiding and showing buttons By Fire with help from HBR
AFRAME.registerComponent("hidebuttons", {
init: function () { this.el.addEventListener("click", () => {
  const isVisible = this.el.parentElement.children[2].getAttribute("visible");
  this.el.setAttribute("color", isVisible ? this.el.parentElement.getAttribute("button-color") : "#FFFFFF");
  const visibility = isVisible ? "false" : "true";
  Array.from(document.getElementsByClassName("buttons")).forEach((el) => {
    el.setAttribute("visible", visibility);
  });
});  }, 	});
		
// Changes Volume of the Screen when button clicked By Fire with help from HBR
AFRAME.registerComponent("volume-level", {
schema: { vvalue: { type: "number" }, },
init: function () { this.el.addEventListener("click", () => {  
  const browserElement = this.el.parentElement;
  const initialButtonColor = this.el.getAttribute("color");
  let volume = parseFloat(browserElement.getAttribute("volumelevel"));
  const adjustVolume = (volume, delta) => {
    const adjustment = volume < 0.1 ? 0.01 : (volume < 0.5 ? 0.02 : 0.05);
    return Math.max(0, Math.min(1, volume + delta * adjustment));
  };
  volume = Number((this.data.vvalue > 0 ? adjustVolume(volume, 1) : adjustVolume(volume, -1)).toFixed(2));
  browserElement.components["sq-browser"].runActions([{ actionType: "runscript", strparam1: `document.querySelectorAll('video, audio').forEach((elem) => elem.volume=${volume});`,}]);
  this.el.setAttribute("color", "#AAAAAA");
  browserElement.setAttribute("volumelevel", volume);
  console.log(`FIRESCREEN: Volume Is : ${volume}`)
  setTimeout(() => { this.el.setAttribute("color", initialButtonColor); }, 100);
}); }, });
		
	// Navigates browser page Backwards/Forward
  AFRAME.registerComponent("navigate-browser", {
  schema: {
    action: { type: "string", default: "goback" }  // Default action is "goback"
  },
  init: function () {
    const browserElement = this.el.parentElement;
	let thisbuttoncolor = this.el.getAttribute("color");
    this.el.addEventListener("click", () => {
      const actionType = this.data.action;
      this.el.setAttribute("color", "#AAAAAA");
      browserElement.components['sq-browser'].runActions([{
        actionType: actionType
      }]);
      setTimeout(() => {
        this.el.setAttribute("color", thisbuttoncolor);
      }, 100);
    });
  },
});

function getV3FromStr(strVector3) {
  var aresult = strVector3.split(" ");
  let X = aresult[0]; let Y = aresult[1]; let Z = aresult[2];
  return new BS.Vector3(X,Y,Z);
}

function getAttrOrDef(pScript, pAttr, pDefault) {
  if (pScript.hasAttribute(pAttr)) {
    return pScript.getAttribute(pAttr);
  } else {
    return pDefault;
  }
};

// Create screen After Unity load 
var firstbrowserrun = true;
function firescreenloadstuff() {
	const firescene = BS.BanterScene.GetInstance();
  firescene.On("user-joined", e => {
    if (e.detail.isLocal) {
      console.log("HAND-CONTROLS: Local User Joined");
        playersuserid = e.detail.uid;
    };
  });

 // Function to check if a given script is already present
 function isAFrameScriptPresent(scriptUrls) { const scripts = document.getElementsByTagName("script");
    for (let i = 0; i < scripts.length; i++) { const src = getAttrOrDef(scripts[i], "src", "");
      if (scriptUrls.includes(src)) { console.log(`FIRESCREEN: AFrame ${src.match(/(\d+\.\d+\.\d+)/)[0]} Detected`); return true; };
    } return false;
  };

  // Function to safely append an element if it doesn't exist
  function appendIfNotExists(selector, tagName, parent, id) { let element = document.querySelector(selector);
    if (!element) { console.log(`FIRESCREEN: ${tagName.toUpperCase()} NOT Detected, Adding ${tagName.toUpperCase()}`);
      element = document.createElement(tagName); if (id) element.id = id; parent.appendChild(element);
    } else { console.log(`FIRESCREEN: ${tagName.toUpperCase()} Detected, NOT Adding ${tagName.toUpperCase()}`);
    } return element;
  }

  // Check if firething exists
  let firething = document.querySelector("#firething");
  if (!firething) { console.log("FIRESCREEN: Setting up.");

    // Add firething
    const firetag = document.createElement("firething"); firetag.id = "firething"; document.querySelector("head").appendChild(firetag);

    // A-Frame versions to check
    const aframeVersions = [
      "https://aframe.io/releases/1.6.0/aframe.min.js",
      "https://aframe.io/releases/1.5.0/aframe.min.js",
      "https://aframe.io/releases/1.4.2/aframe.min.js",
      "https://aframe.io/releases/1.4.1/aframe.min.js",
      "https://aframe.io/releases/1.4.0/aframe.min.js",
      "https://aframe.io/releases/1.3.0/aframe.min.js",
      "https://aframe.io/releases/1.2.0/aframe.min.js",
      "https://aframe.io/releases/1.1.0/aframe.min.js"
    ];

    // Check if any A-Frame version is already present
    let aframedetected = isAFrameScriptPresent(aframeVersions);

    // Add A-Frame if not detected
    if (!aframedetected) {
      console.log("FIRESCREEN: AFrame Was NOT Detected, Adding AFrame 1.4.0");
      const aframescript = document.createElement("script");
      aframescript.id = "aframe-script";
      aframescript.setAttribute("src", "https://aframe.io/releases/1.4.0/aframe.min.js");
      document.querySelector("head").appendChild(aframescript);
    };

    // Ensure body exists
    appendIfNotExists("body", "body", document.querySelector("head"));

    // Ensure a-scene exists
    appendIfNotExists("a-scene", "a-scene", document.querySelector("body"));

    console.log("FIRESCREEN: Waiting for Unity-Loaded Event");
  }

  let waitingforunity = true;
  if (waitingforunity) {

  fscreeninterval = setInterval(function() {
    if (firescene.unityLoaded) {
      waitingforunity = false;
      clearInterval(fscreeninterval);
      if (firstbrowserrun) { firstbrowserrun = false; console.log("FIRESCREEN: unity-loaded"); enableFireScreen(); } else {
				console.log("FIRESCREEN: Should already be enabled/loading");
			};
    };
  }, 500); };

  firescene.On("one-shot", e => { console.log(e)
    const data = JSON.parse(e.detail.data);
    const isAdminOrLocalUser = e.detail.fromAdmin || e.detail.fromId === firescene.localUser.uid;
    if (isAdminOrLocalUser) { console.log(isAdminOrLocalUser ? "Current Shot is from Admin" : "Current Shot is from Local User");
      if (data.fireurl) setfirepageurls(data.fireurl);
    } else if (e.detail.fromId === "f67ed8a5ca07764685a64c7fef073ab9") {
      if (data.fireurl) setfirepageurls(data.fireurl);
    };
  });
};

firescreenloadstuff();

var handscene = BS.BanterScene.GetInstance();

class handButtonCrap{
  constructor(p_voldowncolor, p_volupcolor, p_mutecolor) {
    this.volDownColor = p_voldowncolor;
    this.volUpColor = p_volupcolor;
    this.muteColor = p_mutecolor;
		console.log("HAND-CONTROLS: Delay Loading to avoid error");
		setTimeout(() => { 
			if (handcontrolsdisabled) {
      const thisintervalvar = setInterval(() => {
        if (window.user && window.user.id !== undefined) { clearInterval(thisintervalvar);
          console.log("HAND-CONTROLS: handcontrolsdisabled still true");
          handcontrolsdisabled = false; this.setupHandControls();
        };
      }, 200);
			};
		}, 20000); 
	  
		handscene.On("user-joined", e => {
			if (e.detail.isLocal) {
				console.log("HAND-CONTROLS: Local User Joined");
				if (handcontrolsdisabled) {
					handcontrolsdisabled = false;
					playersuserid = e.detail.uid;
					this.setupHandControls();
				};
			};
		});

		handscene.On("user-left", e => { if (e.detail.isLocal) { handcontrolsdisabled = true;
				console.log("HAND-CONTROLS: Local User Left, Resetting variable"); };
		});

		if (playersuserid != false && handcontrolsdisabled) {
      console.log("HAND-CONTROLS: Enabling");
      handcontrolsdisabled = false;
      this.setupHandControls();
		} else {
      console.log("HAND-CONTROLS: Too Early, Waiting.");
    }
	};

  toggleMute() {  handbuttonmutestate = !handbuttonmutestate;
    this.runActionOnElements('.firescreenc', handbuttonmutestate);
    this.updateButtonColors('.firemutebutc', handbuttonmutestate);
    console.log(handbuttonmutestate);
    const fireMuteBut = document.getElementById("firemutebut");
    fireMuteBut.setAttribute("color", handbuttonmutestate ? "#FF0000" : this.muteColor);
  };

  runActionOnElements(selector, state) { document.querySelectorAll(selector).forEach(element => {
      element.components["sq-browser"].runActions([ { actionType: "runscript", strparam1: `document.querySelectorAll('video, audio').forEach(elem => elem.muted=${state});` } ]);
    });
  };

  updateButtonColors(selector, isActive) {
    document.querySelectorAll(selector).forEach(button => { const TheBrowser = button.parentElement;
      const thisButtonColor = TheBrowser.getAttribute("mute-color") || "#FFFFFF";
      button.setAttribute("color", isActive ? (thisButtonColor === "#FF0000" ? "#FFFF00" : "#FF0000") : thisButtonColor);
    });
  };

  adjustVolume(change) {
    document.querySelectorAll('.firescreenc').forEach((element, index) => {
      let volume = Number(parseFloat(element.getAttribute("volumelevel"))); let adjustment;
      if (volume < 0.1) { adjustment = 0.01; // Tiny adjustment for low volume
      } else if (volume < 0.5) { adjustment = 0.03; // Medium adjustment for medium volume
      } else { adjustment = 0.05; } // Big adjustment for high volume
      volume = Math.min(Math.max(0, (volume + (change * adjustment)).toFixed(2)), 1);
      this.updateVolume(element, volume, index + 1);
    });
  };

  updateVolume(element, volume, index) {
    const firePercent = Math.round(volume * 100);
    element.setAttribute("volumelevel", volume);
    console.log(`HAND-CONTROLS: FireScreen ${index}'s Volume is: ${volume}`);
    element.components["sq-browser"].runActions([
      { actionType: "runscript", strparam1: `document.querySelectorAll('video, audio').forEach(elem => elem.volume=${volume});` },
      { actionType: "runscript", strparam1: `document.querySelector('.html5-video-player').setVolume(${firePercent});` }
    ]);
  };

  volumeControlUp() { this.adjustVolume(1); this.flashButton("firevolupbut"); };

  volumeControlDown() { this.adjustVolume(-1); this.flashButton("firevoldownbut"); };

  flashButton(buttonId) {
    const button = document.getElementById(buttonId);
    const originalColor = button.getAttribute("color");
    button.setAttribute("color", "#FFFFFF");
    setTimeout(() => button.setAttribute("color", originalColor), 100);
  };

  lockPlayer() {
    const fireLockBut = document.getElementById("firelockpbut");
    playerislocked = !playerislocked;
    if (playerislocked) lockPlayer();
    else unlockPlayer();
    fireLockBut.setAttribute("color", playerislocked ? "#FF0000" : "#FFFF00");
  };

  navigateHome() {
    document.querySelectorAll('.firescreenc').forEach(element => {
      const homePage = element.getAttribute("sq-browser");
      element.setAttribute("sq-browser", homePage);
    });
    this.flashButton("firehomepbut");
  };

  setupHandControls() {
    if (!handcontrolsdisabled) {
      console.log("HAND-CONTROLS: Setting up Hand Controls");
		// This was a great innovation by HBR, who wanted Skizot to also get credit for the original idea. 
      const handControlsContainer = document.createElement("a-entity");
      handControlsContainer.setAttribute("scale", "0.1 0.1 0.1");
      handControlsContainer.setAttribute("position", "0.04 0.006 -0.010");
      handControlsContainer.setAttribute("sq-lefthand", `whoToShow: ${playersuserid || window.user.id}`);

      const buttons = [
        { image: IconVolUpUrl, position: "-1 0.2 -0.4", color: this.volUpColor, id: "firevolupbut", callback: this.volumeControlUp.bind(this) },
        { image: IconVolDownUrl, position: "-1 0.2 0", color: this.volDownColor, id: "firevoldownbut", callback: this.volumeControlDown.bind(this) },
        { image: "https://firer.at/files/lock.png", position: "-1 -0.4 0", color: thebuttoncolor, id: "firelockpbut", callback: this.lockPlayer.bind(this) },
        { image: "https://firer.at/files/Home.png", position: "-1 -0.4 -0.4", color: thebuttoncolor, id: "firehomepbut", callback: this.navigateHome.bind(this) },
        { image: IconMuteUrl, position: "-1 0.2 0.4", color: this.muteColor, id: "firemutebut", callback: this.toggleMute.bind(this) }
      ];

      buttons.forEach(({ image, position, color, id, callback }) => {
        const button = this.createButton(image, position, color, id, callback);
        handControlsContainer.appendChild(button);
      });
      document.querySelector("a-scene").appendChild(handControlsContainer);
    } else {
      console.log("HAND-CONTROLS: Already set up, skipping re-initialization.");
    };
  };

  createButton(image, position, color, id, callback) {
    const button = document.createElement("a-plane");
    button.setAttribute("sq-interactable", "");
    button.setAttribute("sq-collider", "");
    button.setAttribute("scale", "0.4 0.4 0.4");
    button.setAttribute("rotation", "0 -90 180");
    button.setAttribute("src", image);
    button.setAttribute("color", color);
    button.setAttribute("transparent", true);
    button.setAttribute("position", position);
    button.setAttribute("id", id);
    button.addEventListener("click", callback);
    return button;
  };
};

function setFirePageUrls(thedata) {
  document.querySelectorAll('.firescreenc').forEach(firescreenc => {
    firescreenc.setAttribute("sq-browser", { url: thedata, pixelsPerUnit: 1200, mipMaps: 0, mode: "local" });
  });
};