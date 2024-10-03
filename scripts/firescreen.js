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
var handbuttonmutestate = true;

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

  if (p_handbuttons === "true" && firstrunhandcontrols === true) {
      firstrunhandcontrols = false;
      console.log("FIRESCREEN: Enabling Hand Controls");
      const handbuttonstuff = new handButtonCrap();
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

  let firecollider = createButton("0 0 -0.005", "1.0", "0.55", "#ff0000", null, {"sq-boxcollider": "", "sq-grabbable": ""}, null, false, "collider");
  firescreen.appendChild(firecollider);

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
  let muteButton = createButton("0.2 0.38 0", "0.1", "0.1", p_mutecolor, p_iconmuteurl, {"toggle-mute": ""}, TheButRot, true, "firemutebutc buttons");
  firescreen.appendChild(muteButton);
  let volUpButton = createButton("0.5 0.38 0", "0.1", "0.1", p_volupcolor || thebuttoncolor, p_iconvolupurl, {"volume-level": "vvalue: 0.05"}, TheButRot);
  firescreen.appendChild(volUpButton);
  let volDownButton = createButton("0.35 0.38 0", "0.1", "0.1", p_voldowncolor || thebuttoncolor, p_iconvoldownurl, {"volume-level": "vvalue: -0.05"}, TheButRot);
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
			// document.querySelectorAll('.firescreenc')
			//   .forEach((firescreenc) => {
			// 	setTimeout(() => { 
			// 		let volume = parseFloat(firescreenc.getAttribute("volumelevel"));
			// 		firescreenc.components["sq-browser"].runActions([ { actionType: "runscript", strparam1:
			// 		"document.querySelectorAll('video, audio').forEach((elem) => elem.volume=" + volume + ");", }, ]);
			// 	}, 1000);
			//   });

		}
    }, 5000); } else if (fireScreenOn) { } else { clearInterval(volinterval); }
};

// Set the width and height of the screen(s)
var notalreadysetup = true;
function setupBrowsers() {
	if (notalreadysetup) {
		notalreadysetup = false;
		let thisloopnumber = 0;
		while (thisloopnumber < numberofbrowsers) {
			thisloopnumber++
			let theBrowser = document.getElementById("fires-browser" + thisloopnumber);
			let browserpageWidth = theBrowser.getAttribute("pageWidth");
			let browserpageHeight = theBrowser.getAttribute("pageHeight");
			theBrowser.browser.pageWidth=browserpageWidth;
			theBrowser.browser.pageHeight=browserpageHeight;
			
			theBrowser.transform.WatchProperties([BS.PropertyName.position, BS.PropertyName.eulerAngles]); // Test Watch Properties
			// console.log(`FIRESCREEN: Position: ${JSON.stringify(theBrowser.transform.position)} Rotation: ${JSON.stringify(theBrowser.transform.rotation)}`);

			let x = theBrowser.object3D.rotation.x;
			let y = theBrowser.object3D.rotation.y;
			let z = theBrowser.object3D.rotation.z;
			// theBrowser.transform.lerpRotation = true;
			theBrowser.transform.eulerAngles = new BS.Vector3(x, y, z); 

			console.log("FIRESCREEN: " + thisloopnumber + " Width is: " + browserpageWidth + " and Height: " + browserpageHeight);

			if (announcerfirstrun === false) {
			announcefirstrun = false;
			timenow = Date.now(); 
			}
		};
	};
}


// Enables Interaction for all the browser windows by HBR

	AFRAME.registerComponent("enable-interaction", { init: async function() { await window.AframeInjection.waitFor(this.el, "browser");
		this.el.browser.ToggleInteraction(true) 			} });
			
// Listens for button clicks to open the urls on either Screen by HBR
  AFRAME.registerComponent("click-url", {
	schema: { url: { type: "string", default: "" }, },
	init: function () {
	  this.el.addEventListener("click", () => {                         
		const TheBrowser = this.el.parentElement;
		let thisbuttoncolor = this.el.getAttribute("color");
		if (thisbuttoncolor != null) {
			this.el.setAttribute("color", "#FFFFFF"); 
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
		if (ColliderScreen.getAttribute("visible")) {
			if (thisbuttoncolor === "#00FF00") {
				lockToggle.setAttribute("color","#FFFF00");
			} else { 
				lockToggle.setAttribute("color", thisbuttoncolor);
			};
			ColliderScreen.setAttribute("visible","false");
		} else {
			// if (thisbuttoncolor === "#00FF00") {
			// 	lockToggle.setAttribute("color","#FFFF00");
			// } else { 
				lockToggle.setAttribute("color","#00FF00");
			// };
			ColliderScreen.setAttribute("visible","true");
	  }		});  }, 	});

 // Toggle Button for Keyboard By Fire with help from HBR
 AFRAME.registerComponent("forcekeyboard", {
	init: function () {
	  this.el.addEventListener("click", () => {                         
    	const TheBrowser = this.el.parentElement;
		let keyboardstate = this.el.getAttribute("forcekeyboard");
		let thisbuttoncolor = TheBrowser.getAttribute("button-color");
		if (keyboardstate == "true") {
			TheBrowser.browser.ToggleKeyboard(0)
			this.el.setAttribute("forcekeyboard", "false");
			this.el.setAttribute("color","#FFFFFF");
		} else {
      TheBrowser.browser.ToggleKeyboard(1)
      this.el.setAttribute("forcekeyboard", "true");
      this.el.setAttribute("color", thisbuttoncolor);
	  }		});  }, 	});

// Toggle Sound for browser screen By Fire with help from HBR
	AFRAME.registerComponent("toggle-mute", {
	init: function () {
		this.el.addEventListener("click", () => {
		const TheBrowser = this.el.parentElement;
		const MuteButton = this.el;
		let thisbuttoncolor = TheBrowser.getAttribute("mute-color");
		if(TheBrowser.getAttribute("datamuted")=="true") {
			MuteButton.setAttribute("color", thisbuttoncolor);
			TheBrowser.setAttribute("datamuted", "false");
			TheBrowser.components["sq-browser"].runActions([ { actionType: "runscript", strparam1:
				"document.querySelectorAll('video, audio').forEach((elem) => elem.muted=false);", }, ]);
		} else {
			if (thisbuttoncolor === "#FF0000") {
				MuteButton.setAttribute("color", "#FFFF00");
			} else {
				MuteButton.setAttribute("color", "#FF0000");
			}
			TheBrowser.setAttribute("datamuted", "true")
			TheBrowser.components["sq-browser"].runActions([ { actionType: "runscript", strparam1:
				  "document.querySelectorAll('video, audio').forEach((elem) => elem.muted=true);",
			  },			]);		  }		});	  },	});
		  
// Changes Scale of either Screen when button clicked with help from HBR
  AFRAME.registerComponent("scale-screen", {
	schema: {
	  size: { type: "string" },
	  avalue: { type: "number" },
	},
	init: function () {
	  this.el.addEventListener("click", () => {  
		var screenScale = this.el.parentElement;
		let thisbuttoncolor = this.el.getAttribute("color");
		let scaleX = screenScale.object3D.scale.x;
		let scaleY = screenScale.object3D.scale.y;
		switch (this.data.size) {
		  case "grow":
			scaleX += this.data.avalue;
			scaleY += this.data.avalue;
			break;
		  case "shrink":
			scaleX += this.data.avalue;
			scaleY += this.data.avalue;
			break;
		}
		  scaleX = scaleX.toFixed(2);
		  scaleY = scaleY.toFixed(2);
      if (scaleX <= 0) {scaleX = 0.05};
      if (scaleY <= 0) {scaleY = 0.05};
		this.el.setAttribute("color","#AAAAAA");
		screenScale.setAttribute("scale", scaleX + " " + scaleY + " 1");
		setTimeout(() => {  this.el.setAttribute("color", thisbuttoncolor); }, 100);
		});		},		});
		
  // Rotate either screen when buttons clicked by HBR
  AFRAME.registerComponent("rotate", {
	schema: {
	  axis: { type: "string" },
	  amount: { type: "number" },
	},
	init: function () {
	  this.el.addEventListener("click", () => {
		let browserRotation = this.el.parentElement;
		let thisbuttoncolor = browserRotation.getAttribute("button-color");
		// let x = browserRotation.object3D.rotation.x;
		// let y = browserRotation.object3D.rotation.y;
		// let z = browserRotation.object3D.rotation.z;
		// let w = browserRotation.transform.rotation.w;
		let x = browserRotation.transform.eulerAngles.x;
		let y = browserRotation.transform.eulerAngles.y;
		let z = browserRotation.transform.eulerAngles.z;
		// console.log("X:" + x + " Y:" + y + " Z:" + z);
		switch (this.data.axis) {
			case "x":
				x += this.data.amount;
			break;
			case "y":
				y += this.data.amount;
			break;
			case "z":
				z += this.data.amount;
			break;
			case "w":
				w += this.data.amount;
			break;
		}
		this.el.setAttribute("color","#AAAAAA");
		// browserRotation.setAttribute("rotation", x + " " + y + " " + z); 
		// browserRotation.transform.rotation = new BS.Vector3(x, y, z); 
		// browserRotation.transform.rotation = new BS.Quaternion(x, y, z, w); 
		browserRotation.transform.eulerAngles = new BS.Vector3(x, y, 0); 
		// console.log("SET X:" + x + " Y:" + y + " Z:" + z);
		setTimeout(() => {  this.el.setAttribute("color", thisbuttoncolor); }, 100); 
		});        },      });

	// Toggle for hiding and showing the rotation buttons By Fire with help from HBR
  AFRAME.registerComponent("enablerot", {
	init: function () {
	  this.el.addEventListener("click", () => {
		const rotats = this.el;
		let thisbuttoncolor = this.el.parentElement.getAttribute("button-color");
		const rotatebutton = rotats.parentElement.children[6];
		var els = document.getElementsByClassName("tilt");
		if (rotatebutton.getAttribute("visible")) {
			  rotats.setAttribute("color","#FFFFFF");
			[].forEach.call(els, function (el) {
				el.setAttribute("visible","false");
			});
		} else {
			  rotats.setAttribute("color", thisbuttoncolor);
			[].forEach.call(els, function (el) {
				el.setAttribute("visible","true");
			});
		}		});  }, 	});
		
	
	// Toggle for hiding and showing buttons By Fire with help from HBR
  AFRAME.registerComponent("hidebuttons", {
	init: function () {
	  this.el.addEventListener("click", () => {
		const hidebut = this.el;
		let thisbuttoncolor = this.el.parentElement.getAttribute("button-color");
		const somebutton = hidebut.parentElement.children[2];
		var buttons = document.getElementsByClassName("buttons");
		if (somebutton.getAttribute("visible")) {
			  hidebut.setAttribute("color", thisbuttoncolor);
			[].forEach.call(buttons, function (el) {
				el.setAttribute("visible","false");
			});
		} else {
			  hidebut.setAttribute("color","#FFFFFF");
			[].forEach.call(buttons, function (el) {
				el.setAttribute("visible","true");
			});
		}		});  }, 	});
		
// Changes Volume of the Screen when button clicked By Fire with help from HBR
  AFRAME.registerComponent("volume-level", {
	schema: {
	  vvalue: { type: "number" },
	},
	init: function () {
	  this.el.addEventListener("click", () => {  

		var screenVolume = this.el.parentElement;
		let thisbuttoncolor = this.el.getAttribute("color");
		let volume = parseFloat(screenVolume.getAttribute("volumelevel"));


    if (this.data.vvalue > 0) {
      volume = Number(volume);
      if (volume < 0.1) {
        volume += Number(0.01);
      } else if (volume < 0.5) {
        volume += Number(0.02);
      } else {
        volume += Number(0.05);
      };
      volume = parseFloat(volume).toFixed(2);
      if (volume > 1) {volume = 1};

    } else {
      volume = Number(volume);
      if (volume < 0.1) {
        volume += Number(-0.01);
      } else if (volume < 0.5) {
        volume += Number(-0.02);
      } else {
        volume += Number(-0.05);
      };
      volume = parseFloat(volume).toFixed(2);
      if (volume < 0) {volume = 0};
    };

		// volume += this.data.vvalue;
		// volume = volume.toFixed(2);
		// if (volume > 1) {volume = 1};

		screenVolume.components["sq-browser"].runActions([ { actionType: "runscript", strparam1:
	"document.querySelectorAll('video, audio').forEach((elem) => elem.volume=" + volume + ");", }, ]);
		this.el.setAttribute("color","#AAAAAA");
		screenVolume.setAttribute("volumelevel", volume);
		setTimeout(() => {  this.el.setAttribute("color", thisbuttoncolor); }, 100);

		});		},		});
		
	
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

  let afirething = document.querySelector("firething");
  if (afirething === null) {
    console.log("FIRESCREEN: Setting up.");
    const afiretag = document.createElement("firething");
    afiretag.id = "firething";
    document.querySelector("head").appendChild(afiretag);

  // Check if A Frame already exists on the page, if not, Add it
  const thesescripts = document.getElementsByTagName("script");
  for (let i = 0; i < thesescripts.length; i++) {
    if (getAttrOrDef(thesescripts[i], "src", "") === "https://aframe.io/releases/1.6.0/aframe.min.js" ) { 
      console.log("FIRESCREEN: AFrame 1.6.0 Detected")
      aframedetected = true;
    } else if (getAttrOrDef(thesescripts[i], "src", "") === "https://aframe.io/releases/1.5.0/aframe.min.js" ) { 
      console.log("FIRESCREEN: AFrame 1.5.0 Detected")
      aframedetected = true;
    } else if (getAttrOrDef(thesescripts[i], "src", "") === "https://aframe.io/releases/1.4.2/aframe.min.js" ) { 
      console.log("FIRESCREEN: AFrame 1.4.2 Detected")
      aframedetected = true;
    } else if (getAttrOrDef(thesescripts[i], "src", "") === "https://aframe.io/releases/1.4.1/aframe.min.js" ) { 
      console.log("FIRESCREEN: AFrame 1.4.1 Detected")
      aframedetected = true;
    } else if (getAttrOrDef(thesescripts[i], "src", "") === "https://aframe.io/releases/1.4.0/aframe.min.js" ) { 
      console.log("FIRESCREEN: AFrame 1.4.0 Detected")
      aframedetected = true;
    } else if (getAttrOrDef(thesescripts[i], "src", "") === "https://aframe.io/releases/1.3.0/aframe.min.js" ) { 
      console.log("FIRESCREEN: AFrame 1.3.0 Detected")
      aframedetected = true;
    } else if (getAttrOrDef(thesescripts[i], "src", "") === "https://aframe.io/releases/1.2.0/aframe.min.js" ) { 
      console.log("FIRESCREEN: AFrame 1.2.0 Detected")
      aframedetected = true;
    } else if (getAttrOrDef(thesescripts[i], "src", "") === "https://aframe.io/releases/1.1.0/aframe.min.js" ) { 
      console.log("FIRESCREEN: AFrame 1.1.0 Detected")
      aframedetected = true;
    };
  };
      
    if (aframedetected) {
      console.log("FIRESCREEN: AFrame Was Detected");
    } else if (aframedetected === false) {
      aframedetected = true
      console.log("FIRESCREEN: AFrame Was NOT Detected, Adding AFrame 1.4.0");
      const aframescript = document.createElement("script");
      aframescript.id = "aframe-script";
      aframescript.setAttribute("src", "https://aframe.io/releases/1.4.0/aframe.min.js");
      document.querySelector("head").appendChild(aframescript);

    };

    // Check if html body is present, if Not, Add it
    let abodything = document.querySelector("body");
    if (abodything === null) {
      console.log("FIRESCREEN: Body NOT Detected, Adding Body");
      const abodytag = document.createElement("body");
      abodytag.id = "body";
      document.querySelector("head").appendChild(abodytag);
    } else {
      console.log("FIRESCREEN: Body Detected, NOT Adding Body");
    };

    // Check if A-Scene is present, if Not, Add it
    let ascenething = document.querySelector("a-scene");
    if (ascenething === null) {
      console.log("FIRESCREEN: A Scene NOT Detected, Adding A Scene");
      const ascenetag = document.createElement("a-scene");
      ascenetag.id = "ascene";
      document.querySelector("body").appendChild(ascenetag);
    } else {
      console.log("FIRESCREEN: A Scene Detected, NOT Adding A Scene");
    };
    
    console.log("FIRESCREEN: Waiting for Unity-Loaded Event");

  } else {
    // console.log("FIRESCREEN: Thing Detected, NOT Adding Thing");
  };


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

firescreenloadstuff()

var handscene = BS.BanterScene.GetInstance();

class handButtonCrap{
	
	constructor() {
		console.log("HAND-CONTROLS: Delay Loading to avoid error");
		setTimeout(() => { 
			if (handcontrolsdisabled) {
				console.log("HAND-CONTROLS: handcontrolsdisabled still true");
				handcontrolsdisabled = false;
				this.setupHandControls();
			}
		}, 20000); 
	  
		handscene.On("user-joined", e => {
			if (e.detail.isLocal) {
				console.log("HAND-CONTROLS: Local User Joined 2");
				if (handcontrolsdisabled) {
					handcontrolsdisabled = false;
					playersuserid = e.detail.uid;
					this.setupHandControls();
				}
			}
		});

		handscene.On("user-left", e => {
			if (e.detail.isLocal) {
				handcontrolsdisabled = true;
				console.log("HAND-CONTROLS: Local User Left, Resetting variable to maybe setup hand controls again on rejoin");
			};
		});

		if (playersuserid != false && handcontrolsdisabled) {
      console.log("HAND-CONTROLS: Enabling");
      handcontrolsdisabled = false;
      this.setupHandControls();
		} else {
      console.log("HAND-CONTROLS: Too Early, Waiting.");
    }

	}

	mute() {
		if (handbuttonmutestate) {
		handbuttonmutestate = false;
		} else {
		handbuttonmutestate = true;
		};
		document.querySelectorAll('.firescreenc')
		.forEach((firescreenc) => {
			if(handbuttonmutestate) {
			firescreenc.components["sq-browser"].runActions([ { actionType: "runscript", strparam1:
			"document.querySelectorAll('video, audio').forEach((elem) => elem.muted=false); ", }, ]);
			} else {
			firescreenc.components["sq-browser"].runActions([ { actionType: "runscript", strparam1:
			"document.querySelectorAll('video, audio').forEach((elem) => elem.muted=true); ", }, ]);
			}
		});
		document.querySelectorAll('.firemutebutc')
		.forEach((firemutebutc) => {                 
			const TheBrowser = firemutebutc.parentElement;
			let thisbuttoncolor = TheBrowser.getAttribute("mute-color");
			if(handbuttonmutestate) {
				if (thisbuttoncolor === null) {
					firemutebutc.setAttribute("color","#FFFFFF");
				} else {
					firemutebutc.setAttribute("color", thisbuttoncolor);
				};
			} else {
				if (thisbuttoncolor === "#FF0000") {
					firemutebutc.setAttribute("color","#FFFF00");
				} else { 
					firemutebutc.setAttribute("color","#FF0000");
				};
			};
		});
	};

	volumecontrolup() {
		let thisloopnumber = 0;
		document.querySelectorAll('.firescreenc')
		.forEach((firescreenc) => {
			thisloopnumber++
			let volume = parseFloat(firescreenc.getAttribute("volumelevel"));
      volume = Number(volume);
      if (volume < 0.1) {
        volume += Number(0.01);
      } else if (volume < 0.5) {
        volume += Number(0.02);
      } else {
        volume += Number(0.05);
      };
      volume = parseFloat(volume).toFixed(2);
      if (volume > 1) {volume = 1};
			console.log("HAND-CONTROLS: FireScreen " + thisloopnumber + "'s Volume is: " + volume);
      let firepercent = parseInt(volume*100).toFixed(0);
			firescreenc.setAttribute("volumelevel", volume);
			firescreenc.components["sq-browser"].runActions([ { actionType: "runscript", strparam1:
			"document.querySelectorAll('video, audio').forEach((elem) => elem.volume=" + volume + ");", }, ]);
			firescreenc.components["sq-browser"].runActions([ { actionType: "runscript", strparam1:
			"document.querySelector('.html5-video-player').setVolume(" + firepercent + ");", }, ]);
		});

			let firevolupbut = document.getElementById("firevolupbut");
			let butcolour = firevolupbut.getAttribute("color");
			firevolupbut.setAttribute("color", "#FFFFFF"); 
			setTimeout(() => {  firevolupbut.setAttribute("color", butcolour); }, 100);

	}

  volumecontroldown() {
    const decreaseVolume = (volume) => {
      if (volume < 0.1) return volume - 0.01;
      if (volume < 0.5) return volume - 0.02;
      return volume - 0.05;
    };
    document.querySelectorAll('.firescreenc').forEach((firescreenc, index) => {
      let volume = Math.max(0, decreaseVolume(parseFloat(firescreenc.getAttribute("volumelevel"))));
      volume = parseFloat(volume.toFixed(2));
      console.log(`HAND-CONTROLS: FireScreen ${index + 1}'s Volume is: ${volume}`);
      firescreenc.setAttribute("volumelevel", volume);
      const percent = Math.round(volume * 100);
      const browserComponent = firescreenc.components["sq-browser"];
      browserComponent.runActions([{ actionType: "runscript",
        strparam1: `document.querySelectorAll('video, audio').forEach(elem => elem.volume = ${volume});`
      }]);
      browserComponent.runActions([{ actionType: "runscript",
        strparam1: `document.querySelector('.html5-video-player').setVolume(${percent});`
      }]);
    });
    const firevolbut = document.getElementById("firevoldownbut");
    const originalColor = firevolbut.getAttribute("color");
    firevolbut.setAttribute("color", "#FFFFFF");
    setTimeout(() => firevolbut.setAttribute("color", originalColor), 100);
  };

	lockplayerfunc() {
		let firelockbut = document.getElementById("firelockpbut");
		if (playerislocked) {
			playerislocked = false;
			unlockPlayer();
			firelockbut.setAttribute("color", thebuttoncolor); 
		} else {
			playerislocked = true;
			lockPlayer();
			if (thebuttoncolor === "#FF0000") {
				firelockbut.setAttribute("color", "#FFFF00"); 
			} else {
			firelockbut.setAttribute("color", "#FF0000"); 
			}
		};
	};

	homefunc() {
		let firehomebut = document.getElementById("firehomepbut");

		document.querySelectorAll('.firescreenc')
		.forEach((firescreenc) => {
      let ThisHomePage = firescreenc.getAttribute("sq-browser");
      console.log(ThisHomePage);
      firescreenc.setAttribute("sq-browser", ThisHomePage);

		});
    firehomebut.setAttribute("color", "#FFFFFF"); 
    setTimeout(() => {  firehomebut.setAttribute("color", thebuttoncolor); }, 100);
	};

  setupHandControls() {
    console.log("HAND-CONTROLS: Setting up Hand Controls");
		// This was a great innovation by HBR, who wanted Skizot to also get credit for the original idea. 
    const handControlsContainer = document.createElement("a-entity");
    handControlsContainer.setAttribute("scale", "0.1 0.1 0.1");
    handControlsContainer.setAttribute("position", "0.04 0.006 -0.010");
    handControlsContainer.setAttribute("sq-lefthand", `whoToShow: ${playersuserid || window.user.id}`);
  
    const buttons = [
      { image: IconVolUpUrl, position: "-1 0.2 -0.4", colour: volupcolor, bclass: "firevolbutc", id: "firevolupbut", callback: this.volumecontrolup },
      { image: IconVolDownUrl, position: "-1 0.2 0", colour: voldowncolor, bclass: "firevolbutc", id: "firevoldownbut", callback: this.volumecontroldown },
      { image: "https://firer.at/files/lock.png", position: "-1 -0.4 0", colour: thebuttoncolor, bclass: "firelockpbutc", id: "firelockpbut", callback: this.lockplayerfunc },
      { image: "https://firer.at/files/Home.png", position: "-1 -0.4 -0.4", colour: thebuttoncolor, bclass: "firehomepbutc", id: "firehomepbut", callback: this.homefunc },
      { image: IconMuteUrl, position: "-1 0.2 0.4", colour: "#FFFFFF", bclass: "firemutebutc", id: "firemutebut", callback: this.mute }
    ];
  
    buttons.forEach(({ image, position, colour, bclass, id, callback }) => {
      const button = document.createElement("a-plane");
      Object.assign(button, {
        setAttribute: button.setAttribute.bind(button),
        addEventListener: button.addEventListener.bind(button)
      });
      button.setAttribute("sq-interactable", "");
      button.setAttribute("sq-collider", "");
      button.setAttribute("scale", "0.4 0.4 0.4");
      button.setAttribute("rotation", "0 -90 180");
      button.setAttribute("src", image);
      button.setAttribute("color", colour);
      button.setAttribute("transparent", true);
      button.setAttribute("position", position);
      button.setAttribute("class", bclass);
      button.setAttribute("id", id);
      button.addEventListener("click", callback.bind(this));
      handControlsContainer.appendChild(button);
    });
    document.querySelector("a-scene").appendChild(handControlsContainer);
  };
};

function setfirepageurls(thedata) {
  document.querySelectorAll('.firescreenc')
  .forEach((firescreenc) => {
    let ThisHomePage = firescreenc.getAttribute("sq-browser");
    console.log(ThisHomePage);
    firescreenc.setAttribute("sq-browser", { url: thedata, pixelsPerUnit: 1200, mipMaps: 0, mode: "local", });
  });
};