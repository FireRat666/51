// Everyone who helped make this possible, HBR, Vanquish3r, DedZed, Sebek and FireRat, And thank you to everyone who helped test it
var fireScreenOn = 0;
let buttoncolor = "";
let volupcolor = "";
let voldowncolor = "";
// Create screen on space load 
window.addEventListener('load', (event) => {
	if(window.isBanter) {
		console.log("Window is Banter, Loading FireScreen");
		setTimeout(() => { 
			enableFireScreen();
		}, 3000);
	} else { console.log("Window is Not Banter, Not Starting Script");};
});

function enableFireScreen() {
  console.log("Enabling Fire Screen");
  // window.enableControllerExtras(); // CAN REMOVE THIS LINE
  const scripts = document.getElementsByTagName("script");
  for (let i = 0; i < scripts.length; i++) {
    if (getAttrOrDef(scripts[i], "src", "") ===
      "https://51.firer.at/scripts/firescreen.js" ) { // CHANGE THIS URL IF COPYING THIS SCRIPT
      const pPos = getV3FromStr(getAttrOrDef(scripts[i], "position", "1 2 -1"));
      const pRot = getV3FromStr(getAttrOrDef(scripts[i], "rotation", "0 0 0"));
      const pSca = getV3FromStr(getAttrOrDef(scripts[i], "scale", "1 1 1"));
      const pVolume = getAttrOrDef(scripts[i], "volumelevel", "0.25");
      const pWebsite = getAttrOrDef(scripts[i], "website", "https://firer.at/pages/games.html");
      const pMipmaps = getAttrOrDef(scripts[i], "mipmaps", "1");
      const pPixelsperunit = getAttrOrDef(scripts[i], "pixelsperunit", "1600");
      const pBackdrop = getAttrOrDef(scripts[i], "backdrop", "true");
      const pExtras = getAttrOrDef(scripts[i], "extras", "false");
      const pCastMode = getAttrOrDef(scripts[i], "castmode", "false");
      const pDisableInteraction = getAttrOrDef(scripts[i], "disable-interaction", "false");
      const pButtonColor = getAttrOrDef(scripts[i], "button-color", "#00FF00");
      const pBackDropColor = getAttrOrDef(scripts[i], "backdrop-color", "#000000");
      const pVolUpColor = getAttrOrDef(scripts[i], "volup-color", "null");
      const pVolDownColor = getAttrOrDef(scripts[i], "voldown-color", "null");
      const pButtonPos = getAttrOrDef(scripts[i], "button-position", "0 0 0");
      const pIconMuteUrl = getAttrOrDef(scripts[i], "icon-mute-url", "https://firer.at/files/VolumeMute.png");
      const pIconVolUpUrl = getAttrOrDef(scripts[i], "icon-volup-url", "https://firer.at/files/VolumeHigh.png");
      const pIconVolDownUrl = getAttrOrDef(scripts[i], "icon-voldown-url", "https://firer.at/files/VolumeLow.png");
      const pIconDirectionUrl = getAttrOrDef(scripts[i], "icon-direction-url", "https://firer.at/files/Arrow.png");
      const pURL = "url: " + pWebsite + "; mipMaps: " + pMipmaps + "; pixelsPerUnit: " + pPixelsperunit + "; mode: local;";
      createFireScreen(pPos, pRot, pSca, pVolume, pURL, pBackdrop, pExtras, pCastMode, pWebsite, pButtonColor, 
		pBackDropColor, pIconMuteUrl, pIconVolUpUrl, pIconVolDownUrl, pIconDirectionUrl, pVolUpColor, pVolDownColor,
		pDisableInteraction, pButtonPos);
    }
  };
}

function disableFireScreen() {
	let firescreen = document.getElementById("fires-browser");
	if (firescreen) {
		// Browser is on, remove it
		firescreen.parentElement.removeChild(firescreen);
		console.log("Fire screen Disabled"); 
	}
	fireScreenOn = 0;
	keepsoundlevel();
};

function createFireScreen(p_pos, p_rot, p_sca, p_volume, p_url, p_backdrop, p_extras, p_castmode, p_website, p_buttoncolor, 
	p_backdropcolor, p_iconmuteurl, p_iconvolupurl, p_iconvoldownurl, p_icondirectionurl, p_volupcolor, p_voldowncolor,
	p_disableinteraction, p_buttonpos) {
	//just to be sure we don't create multiple
	// disableFireScreen();
	// Reset firescree variable maybe
	// firescreen = "null";
	buttoncolor = p_buttoncolor;
	volupcolor = p_volupcolor;
	voldowncolor = p_voldowncolor;
	let firescreen = document.createElement("a-entity");
	firescreen.id = "fires-browser";
	firescreen.setAttribute("position", p_pos);
	firescreen.setAttribute("rotation", p_rot);
	firescreen.setAttribute("scale", p_sca);
	firescreen.setAttribute("volumelevel", p_volume);
	firescreen.setAttribute("button-color", p_buttoncolor);
	firescreen.setAttribute( "sq-browser", p_url);
	if (p_disableinteraction === "false") {
		firescreen.setAttribute("sq-browser-interaction");
		firescreen.setAttribute("enable-interaction");
	}
	firescreen.setAttribute("class", "firescreenc");
	firescreen.setAttribute("name", "firescreenc");
  
	if (p_castmode == "false") {
		firescreen.setAttribute( "sq-rigidbody", "useGravity: false; drag:10; angularDrag:10;");
	};
	// document.querySelector("a-scene").appendChild(firescreen);
	fireScreenOn = 1;
	// setPublicSpaceProp('firescreenon', '1');
		
	// for the collider to allow it to be moved
	let firecollider = document.createElement("a-plane");
	firecollider.setAttribute("opacity", "0");
	firecollider.setAttribute("position", "0 0 0");
	firecollider.setAttribute("scale", "1.0 0.55 0.05");
	firecollider.setAttribute("color", "#ff0000");
	firecollider.setAttribute("sq-boxcollider");
	firecollider.setAttribute("sq-grabbable");
	firecollider.setAttribute("visible", "false");
	firescreen.appendChild(firecollider);
	if (p_backdrop == "true") {
		// Backdrop for contrast
		let firebackdrop = document.createElement("a-box");
		firebackdrop.setAttribute("opacity", "0.9");
		firebackdrop.setAttribute("position", "0 0 -0.015");
		firebackdrop.setAttribute("depth", "0.01");
		firebackdrop.setAttribute("width", "1.09");
		firebackdrop.setAttribute("height", "0.64");
		firebackdrop.setAttribute("color", p_backdropcolor);
		firescreen.appendChild(firebackdrop);
	};

	if (p_castmode == "false") {
		// lock/unlock button to toggle the screen collider 
		let firelockbutton = document.createElement("a-plane");
		firelockbutton.setAttribute("position", "0 0.38 0");
		firelockbutton.setAttribute("width", "0.1");
		firelockbutton.setAttribute("height", "0.1");
		firelockbutton.setAttribute("color", "#FF0000");
		firelockbutton.setAttribute("material", "transparent: true");
		firelockbutton.setAttribute("sq-collider");
		firelockbutton.setAttribute("sq-interactable");
		firelockbutton.setAttribute("class", "buttons");
		firelockbutton.setAttribute("src", "https://firer.at/files/HG2.png");
		firelockbutton.setAttribute("lockbutton");
		firescreen.appendChild(firelockbutton);
		// Grow Button
		let firegrowbutton = document.createElement("a-plane");
		firegrowbutton.setAttribute("position", "0.6 0.06 0");
		firegrowbutton.setAttribute("width", "0.1");
		firegrowbutton.setAttribute("height", "0.1");
		firegrowbutton.setAttribute("color", buttoncolor);
		firegrowbutton.setAttribute("material", "transparent: true");
		firegrowbutton.setAttribute("sq-collider");
		firegrowbutton.setAttribute("sq-interactable");
		firegrowbutton.setAttribute("class", "buttons");
		firegrowbutton.setAttribute("src", "https://firer.at/files/expand.png");
		firegrowbutton.setAttribute("scale-screen", "size: shrink; avalue: 0.1");
		firescreen.appendChild(firegrowbutton);
		// Shrink Button
		let fireshrinkbutton = document.createElement("a-plane");
		fireshrinkbutton.setAttribute("position", "0.6 -0.06 0");
		fireshrinkbutton.setAttribute("width", "0.1");
		fireshrinkbutton.setAttribute("height", "0.1");
		fireshrinkbutton.setAttribute("color", buttoncolor);
		fireshrinkbutton.setAttribute("material", "transparent: true");
		fireshrinkbutton.setAttribute("sq-collider");
		fireshrinkbutton.setAttribute("sq-interactable");
		fireshrinkbutton.setAttribute("class", "buttons");
		fireshrinkbutton.setAttribute("src", "https://firer.at/files/shrink.png");
		fireshrinkbutton.setAttribute("scale-screen", "size: shrink; avalue: -0.1");
		firescreen.appendChild(fireshrinkbutton);
		// Rotate Left Button
		let firerotleft = document.createElement("a-plane");
		firerotleft.setAttribute("position", "-0.5 -0.37 0");
		firerotleft.setAttribute("width", "0.1");
		firerotleft.setAttribute("height", "0.1");
		firerotleft.setAttribute("color", buttoncolor);
		firerotleft.setAttribute("material", "transparent: true");
		firerotleft.setAttribute("sq-collider");
		firerotleft.setAttribute("sq-interactable");
		firerotleft.setAttribute("class", "tilt buttons");
		firerotleft.setAttribute("src", "https://firer.at/files/RL.png");
		firerotleft.setAttribute("visible", "false");
		firerotleft.setAttribute("rotate", "axis: y; amount: -10");
		firescreen.appendChild(firerotleft);
		// Rotate Right Button
		let firerotright = document.createElement("a-plane");
		firerotright.setAttribute("position", "0.5 -0.37 0");
		firerotright.setAttribute("width", "0.1");
		firerotright.setAttribute("height", "0.1");
		firerotright.setAttribute("color", buttoncolor);
		firerotright.setAttribute("material", "transparent: true");
		firerotright.setAttribute("sq-collider");
		firerotright.setAttribute("sq-interactable");
		firerotright.setAttribute("class", "tilt buttons");
		firerotright.setAttribute("src", "https://firer.at/files/RR.png");
		firerotright.setAttribute("visible", "false");
		firerotright.setAttribute("rotate", "axis: y; amount: 10");
		firescreen.appendChild(firerotright);
		// Tilt Forwards Button
		let firetiltforward = document.createElement("a-plane");
		firetiltforward.setAttribute("position", "-0.4 -0.37 0");
		firetiltforward.setAttribute("width", "0.1");
		firetiltforward.setAttribute("height", "0.1");
		firetiltforward.setAttribute("color", buttoncolor);
		firetiltforward.setAttribute("material", "transparent: true");
		firetiltforward.setAttribute("sq-collider");
		firetiltforward.setAttribute("sq-interactable");
		firetiltforward.setAttribute("class", "tilt buttons");
		firetiltforward.setAttribute("src", "https://firer.at/files/TF.png");
		firetiltforward.setAttribute("visible", "false");
		firetiltforward.setAttribute("rotate", "axis: x; amount: 5");
		firescreen.appendChild(firetiltforward);
		// Tilt Backwards Button
		let firetiltbackward = document.createElement("a-plane");
		firetiltbackward.setAttribute("position", "0.4 -0.37 0");
		firetiltbackward.setAttribute("width", "0.1");
		firetiltbackward.setAttribute("height", "0.1");
		firetiltbackward.setAttribute("color", buttoncolor);
		firetiltbackward.setAttribute("material", "transparent: true");
		firetiltbackward.setAttribute("sq-collider");
		firetiltbackward.setAttribute("sq-interactable");
		firetiltbackward.setAttribute("class", "tilt buttons");
		firetiltbackward.setAttribute("src", "https://firer.at/files/TB.png");
		firetiltbackward.setAttribute("visible", "false");
		firetiltbackward.setAttribute("rotate", "axis: x; amount: -5");
		firescreen.appendChild(firetiltbackward);
		// Toggle Rotations Button
		let firetogglerots = document.createElement("a-plane");
		firetogglerots.setAttribute("position", "-0.6 -0.3 0");
		firetogglerots.setAttribute("width", "0.1");
		firetogglerots.setAttribute("height", "0.1");
		firetogglerots.setAttribute("color", "#FFFFFF");
		firetogglerots.setAttribute("material", "transparent: true");
		firetogglerots.setAttribute("sq-collider");
		firetogglerots.setAttribute("sq-interactable");
		firetogglerots.setAttribute("class", "buttons");
		firetogglerots.setAttribute("src", "https://firer.at/files/Rot.png");
		firetogglerots.setAttribute("enablerot", "false");
		firescreen.appendChild(firetogglerots);
		// Hide/Show Buttons Button
		let firevisibletog = document.createElement("a-plane");
		firevisibletog.setAttribute("position", "-0.6 0 0");
		firevisibletog.setAttribute("width", "0.1");
		firevisibletog.setAttribute("height", "0.1");
		firevisibletog.setAttribute("color", "#FFFFFF");
		firevisibletog.setAttribute("material", "transparent: true");
		firevisibletog.setAttribute("sq-collider");
		firevisibletog.setAttribute("sq-interactable");
		firevisibletog.setAttribute("src", "https://firer.at/files/Eye.png");
		firevisibletog.setAttribute("hidebuttons");
		firescreen.appendChild(firevisibletog);
		// Info Button
		let fireinfobut = document.createElement("a-plane");
		fireinfobut.setAttribute("position", "-0.6 0.28 0");
		fireinfobut.setAttribute("width", "0.1");
		fireinfobut.setAttribute("height", "0.1");
		fireinfobut.setAttribute("color", buttoncolor);
		fireinfobut.setAttribute("material", "transparent: true");
		fireinfobut.setAttribute("sq-collider");
		fireinfobut.setAttribute("sq-interactable");
		fireinfobut.setAttribute("class", "buttons");
		fireinfobut.setAttribute("src", "https://firer.at/files/Info.png");
		fireinfobut.setAttribute("click-url", "url: https://firer.at/pages/Info.html");
		firescreen.appendChild(fireinfobut);
		// Go Forwards Button
		let forwardbutpos = "-0.4 0.38 0"
		let fireforward = document.createElement("a-plane");
		const forwardArray = p_buttonpos.split(" ");
		const forwardposArray = forwardbutpos.split(" ");
		forwardbutpos = (Number(forwardArray[0]) + Number(forwardposArray[0])) + " " + (Number(forwardArray[1]) + Number(forwardposArray[1])) + " " + (Number(forwardArray[2]) + Number(forwardposArray[2]));
		fireforward.setAttribute("position", forwardbutpos);
		fireforward.setAttribute("width", "0.1");
		fireforward.setAttribute("height", "0.1");
		fireforward.setAttribute("color", buttoncolor);
		fireforward.setAttribute("material", "transparent: true");
		fireforward.setAttribute("sq-collider");
		fireforward.setAttribute("sq-interactable");
		fireforward.setAttribute("class", "buttons");
		fireforward.setAttribute("src", p_icondirectionurl);
		fireforward.setAttribute("navigate-browser", "action: goforward");
		fireforward.setAttribute("rotation", "0 0 180");
		firescreen.appendChild(fireforward);
		// Google Button
		let firegooglebut = document.createElement("a-plane");
		firegooglebut.setAttribute("position", "-0.6 0.16 0");
		firegooglebut.setAttribute("width", "0.1");
		firegooglebut.setAttribute("height", "0.1");
		firegooglebut.setAttribute("material", "transparent: true");
		firegooglebut.setAttribute("sq-collider");
		firegooglebut.setAttribute("sq-interactable");
		firegooglebut.setAttribute("class", "buttons");
		firegooglebut.setAttribute("src", "https://firer.at/files/Google.png");
		firegooglebut.setAttribute("click-url", "url:https://google.com/");
		firescreen.appendChild(firegooglebut);
	};

	// Home Button
	let homebutpos = "-0.27 0.38 0"
	let firehomebut = document.createElement("a-plane");
	const homeArray = p_buttonpos.split(" ");
	const homeposArray = homebutpos.split(" ");
	homebutpos = (Number(homeArray[0]) + Number(homeposArray[0])) + " " + (Number(homeArray[1]) + Number(homeposArray[1])) + " " + (Number(homeArray[2]) + Number(homeposArray[2]));
	firehomebut.setAttribute("position", homebutpos);
	firehomebut.setAttribute("width", "0.1");
	firehomebut.setAttribute("height", "0.1");
	if (buttoncolor === "#00FF00") {
		firehomebut.setAttribute("color", "#FF0000");
	} else {
		firehomebut.setAttribute("color", buttoncolor);
	}
	firehomebut.setAttribute("material", "transparent: true");
	firehomebut.setAttribute("sq-collider");
	firehomebut.setAttribute("sq-interactable");
	firehomebut.setAttribute("class", "buttons");
	firehomebut.setAttribute("src", "https://firer.at/files/Home.png");
	firehomebut.setAttribute("click-url", "url:" + p_website);
	firescreen.appendChild(firehomebut);

	// Go Back Button
	let backbutpos = "-0.5 0.38 0";
	let firebackward = document.createElement("a-plane");
	const backArray = p_buttonpos.split(" ");
	const backposArray = backbutpos.split(" ");
	backbutpos = (Number(backArray[0]) + Number(backposArray[0])) + " " + (Number(backArray[1]) + Number(backposArray[1])) + " " + (Number(backArray[2]) + Number(backposArray[2]));
	firebackward.setAttribute("position", backbutpos);
	firebackward.setAttribute("width", "0.1");
	firebackward.setAttribute("height", "0.1");
	firebackward.setAttribute("color", buttoncolor);
	firebackward.setAttribute("material", "transparent: true");
	firebackward.setAttribute("sq-collider");
	firebackward.setAttribute("sq-interactable");
	firebackward.setAttribute("class", "buttons");
	firebackward.setAttribute("src", p_icondirectionurl);
	firebackward.setAttribute("navigate-browser", "action: goback");
	firescreen.appendChild(firebackward); 
	// Mute/UnMute Button
	let mutebutpos = "0.2 0.38 0";
	let firemutebut = document.createElement("a-plane");
	const muteArray = p_buttonpos.split(" ");
	const muteposArray = mutebutpos.split(" ");
	mutebutpos = (Number(muteArray[0]) + Number(muteposArray[0])) + " " + (Number(muteArray[1]) + Number(muteposArray[1])) + " " + (Number(muteArray[2]) + Number(muteposArray[2]));
	firemutebut.setAttribute("position", mutebutpos);
	firemutebut.setAttribute("width", "0.1");
	firemutebut.setAttribute("height", "0.1");
	firemutebut.setAttribute("color", "#FFFFFF");
	firemutebut.setAttribute("material", "transparent: true");
	firemutebut.setAttribute("sq-collider");
	firemutebut.setAttribute("sq-interactable");
	firemutebut.setAttribute("class", "buttons");
	firemutebut.setAttribute("src", p_iconmuteurl);
	firemutebut.setAttribute("toggle-mute");
	firemutebut.setAttribute("class", "firemutebutc");
	firescreen.appendChild(firemutebut);
	// Volume Up Button
	let volupbutpos = "0.5 0.38 0";
	let firevolup = document.createElement("a-plane");
	const volupArray = p_buttonpos.split(" ");
	const volupposArray = volupbutpos.split(" ");
	volupbutpos = (Number(volupArray[0]) + Number(volupposArray[0])) + " " + (Number(volupArray[1]) + Number(volupposArray[1])) + " " + (Number(volupArray[2]) + Number(volupposArray[2]));
	firevolup.setAttribute("position", volupbutpos);
	firevolup.setAttribute("width", "0.1");
	firevolup.setAttribute("height", "0.1");
	if (p_volupcolor === "null") {
		firevolup.setAttribute("color", buttoncolor);
	} else {
		firevolup.setAttribute("color", p_volupcolor);
	}
	firevolup.setAttribute("material", "transparent: true");
	firevolup.setAttribute("sq-collider");
	firevolup.setAttribute("sq-interactable");
	firevolup.setAttribute("class", "buttons");
	firevolup.setAttribute("src", p_iconvolupurl);
	firevolup.setAttribute("volume-level", "vvalue: 0.05");
	firescreen.appendChild(firevolup);
	// Volume Down Button
	let voldownbutpos = "0.35 0.38 0";
	let firevoldown = document.createElement("a-plane");
	const voldownArray = p_buttonpos.split(" ");
	const voldownposArray = voldownbutpos.split(" ");
	voldownbutpos = (Number(voldownArray[0]) + Number(voldownposArray[0])) + " " + (Number(voldownArray[1]) + Number(voldownposArray[1])) + " " + (Number(voldownArray[2]) + Number(voldownposArray[2]));
	firevoldown.setAttribute("position", voldownbutpos);
	firevoldown.setAttribute("width", "0.1");
	firevoldown.setAttribute("height", "0.1");
	if (p_voldowncolor === "null") {
		firevoldown.setAttribute("color", buttoncolor);
	} else {
		firevoldown.setAttribute("color", p_voldowncolor);
	}
	firevoldown.setAttribute("material", "transparent: true");
	firevoldown.setAttribute("sq-collider");
	firevoldown.setAttribute("sq-interactable");
	firevoldown.setAttribute("class", "buttons");
	firevoldown.setAttribute("src", p_iconvoldownurl);
	firevoldown.setAttribute("volume-level", "vvalue: -0.05");
	firescreen.appendChild(firevoldown);

	if (p_extras == "true") {
		// Extra Button 01 Part 1
		let fireextra01 = document.createElement("a-plane");
		fireextra01.id = "extra-button-1";
		fireextra01.setAttribute("position", "0.68 0.3 0");
		fireextra01.setAttribute("width", "0.2");
		fireextra01.setAttribute("height", "0.04");
		fireextra01.setAttribute("material", "transparent: true");
		fireextra01.setAttribute("color", "#000000");
		fireextra01.setAttribute("sq-collider");
		fireextra01.setAttribute("sq-interactable");
		fireextra01.setAttribute("class", "buttons");
		fireextra01.setAttribute("click-url", "url: https://jackbox.tv/");
		firescreen.appendChild(fireextra01);
		// Extra Button 01 Part 2
		let fireextra01p2 = document.createElement("a-text");
		fireextra01p2.setAttribute("value", "Jackbox.tv");
		fireextra01p2.setAttribute("position", "0 0 0.01");
		fireextra01p2.setAttribute("scale", "0.11 0.11 0.11");
		fireextra01p2.setAttribute("color", "#FFFFFF");
		fireextra01p2.setAttribute("align", "center");
		fireextra01.appendChild(fireextra01p2);
		// Extra Button 02 Part 1
		let fireextra02 = document.createElement("a-plane");
		fireextra02.id = "extra-button-2";
		fireextra02.setAttribute("position", "0.68 0.25 0");
		fireextra02.setAttribute("width", "0.2");
		fireextra02.setAttribute("height", "0.04");
		fireextra02.setAttribute("material", "transparent: true");
		fireextra02.setAttribute("color", "#000000");
		fireextra02.setAttribute("sq-collider");
		fireextra02.setAttribute("sq-interactable");
		fireextra02.setAttribute("class", "buttons");
		fireextra02.setAttribute("click-url", "url: https://papas.tv/");
		firescreen.appendChild(fireextra02);
		// Extra Button 02 Part 2
		let fireextra02p2 = document.createElement("a-text");
		fireextra02p2.setAttribute("value", "Papas.tv");
		fireextra02p2.setAttribute("position", "0 0 0.01");
		fireextra02p2.setAttribute("scale", "0.11 0.11 0.11");
		fireextra02p2.setAttribute("color", "#FFFFFF");
		fireextra02p2.setAttribute("align", "center");
		fireextra02.appendChild(fireextra02p2);
		// Extra Button 03 Part 1
		let fireextra03 = document.createElement("a-plane");
		fireextra03.id = "extra-button-3";
		fireextra03.setAttribute("position", "0.68 -0.3 0");
		fireextra03.setAttribute("width", "0.2");
		fireextra03.setAttribute("height", "0.04");
		fireextra03.setAttribute("material", "transparent: true");
		fireextra03.setAttribute("color", "#000000");
		fireextra03.setAttribute("sq-collider");
		fireextra03.setAttribute("sq-interactable");
		fireextra03.setAttribute("class", "buttons");
		fireextra03.setAttribute("click-url", "url: https://bantervr.com/events");
		firescreen.appendChild(fireextra03);
		// Extra Button 03 Part 2
		let fireextra03p2 = document.createElement("a-text");
		fireextra03p2.setAttribute("value", "Banter Events");
		fireextra03p2.setAttribute("position", "0 0 0.01");
		fireextra03p2.setAttribute("scale", "0.11 0.11 0.11");
		fireextra03p2.setAttribute("color", "#FFFFFF");
		fireextra03p2.setAttribute("align", "center");
		fireextra03.appendChild(fireextra03p2);
	}; 
	document.querySelector("a-scene").appendChild(firescreen);
	setTimeout(() => { keepsoundlevel(); }, 1000);
	console.log("Fire screen Enabled");
};

// Sets the default sound level probably
var volinterval = null;
function keepsoundlevel() {
console.log("keepsoundlevel");
  if (fireScreenOn) {
  // Loop to keep sound level set, runs every second
    volinterval = setInterval(function() {
    document.querySelectorAll('.firescreenc')
      .forEach((firescreenc) => {
        let volume = parseFloat(firescreenc.getAttribute("volumelevel"));
        firescreenc.components["sq-browser"].runActions([ { actionType: "runscript", strparam1:
          "document.querySelectorAll('video, audio').forEach((elem) => elem.volume=" + volume + ");", }, ]);
      });
    }, 2000); } else { clearInterval(volinterval); }
};

////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////




class handButtonCrap{
	constructor() {
	  console.log("Hand Button Constructor Loading.");
	  if(window.isBanter) { 
		setTimeout(() => { 
		  this.setupHandControls();
		}, 15000); 
	  };
	}
// firemutebutc
	mute() {
		if (handbuttonmutestate) {
		handbuttonmutestate = false;
		console.log("handbuttonmutestate Set to False");
		} else {
		handbuttonmutestate = true;
		console.log("handbuttonmutestate Set to True");
		};
		document.querySelectorAll('.firescreenc')
		.forEach((firescreenc) => {
			if(handbuttonmutestate) {
			firescreenc.components["sq-browser"].runActions([ { actionType: "runscript", strparam1:
			"document.querySelectorAll('video, audio').forEach((elem) => elem.muted=false); ", }, ]);
			console.log("Browser Muted Set to False")
			} else {
			firescreenc.components["sq-browser"].runActions([ { actionType: "runscript", strparam1:
			"document.querySelectorAll('video, audio').forEach((elem) => elem.muted=true); ", }, ]);
			console.log("Browser Muted Set to True")
			}
		});
		document.querySelectorAll('.firemutebutc')
		.forEach((firemutebutc) => {
			if(handbuttonmutestate) {
				firemutebutc.setAttribute("color","#FFFFFF");
			} else {
				firemutebutc.setAttribute("color","#FF0000");
			}
		});
	console.log("test mute button clicked")
	}


	volumecontrol(vvalue) {
		document.querySelectorAll('.firescreenc')
		.forEach((firescreenc) => {
			let volume = parseFloat(firescreenc.getAttribute("volumelevel"));
			volume += parseFloat(vvalue);
			volume = volume.toFixed(2);
			console.log("Volume is: " + volume)
			if (volume > 1) {volume = 1};
			if (volume < 0) {volume = 0};
			firescreenc.setAttribute("volumelevel", volume);
			firescreenc.components["sq-browser"].runActions([ { actionType: "runscript", strparam1:
			"document.querySelectorAll('video, audio').forEach((elem) => elem.volume=" + volume + ");", }, ]);
		});

		if (parseFloat(vvalue) > 0) {
			let firevolbut = document.getElementById("firevolupbut");
			let butcolour = firevolbut.getAttribute("color");
			firevolbut.setAttribute("color", "#FFFFFF"); 
			setTimeout(() => {  firevolbut.setAttribute("color", butcolour); }, 100);
			console.log("vvalue is > 0 Colour is: " + butcolour);
		} else {
			let firevolbut = document.getElementById("firevoldownbut");
			let butcolour = firevolbut.getAttribute("color");
			firevolbut.setAttribute("color", "#FFFFFF"); 
			setTimeout(() => {  firevolbut.setAttribute("color", butcolour); }, 100);
			console.log("vvalue is < 0 Colour is: " + butcolour)
		}



	console.log("testbut button clicked")
	}


	setupHandControls() {
		console.log("Setting up Hand Controls for the firescreen(s)")
		// This was a great innovation by HBR, who wanted Skizot to also get credit for the original idea. 
		const handControlsContainer = document.createElement("a-entity");
		handControlsContainer.setAttribute("scale", "0.1 0.1 0.1");
		handControlsContainer.setAttribute("position", "0.04 0.006 -0.010");
		handControlsContainer.setAttribute("sq-lefthand", "whoToShow: " + window.user.id);
		[
			{
			image: "https://firer.at/files/VolumeHigh.png",
			position: "-1 0.2 -0.4",
			colour: volupcolor, 
			class: "firevolbutc", 
			id: "firevolupbut", 
			callback: () => this.volumecontrol("0.05")
			},
			{
			image: "https://firer.at/files/VolumeLow.png",
			position: "-1 0.2 0",
			colour: voldowncolor,
			class: "firevolbutc",
			id: "firevoldownbut", 
			callback: () => this.volumecontrol("-0.05")
			},
			{
			image: "https://firer.at/files/VolumeMute.png",
			position: "-1 0.2 0.4", 
			colour: "#FFFFFF", 
			class: "firemutebutc", 
			id: "firemutebut", 
			callback: () => this.mute()
			}
		].forEach(item => {
			const button = document.createElement("a-plane");
			button.setAttribute("sq-interactable", "");
			button.setAttribute("sq-collider", "");
			button.setAttribute("scale", "0.4 0.4 0.4");
			button.setAttribute("rotation", "0 -90 180");
			button.setAttribute("src", item.image);
			button.setAttribute("color", item.colour);
			button.setAttribute("transparent", true);
			button.setAttribute("position", item.position);
			button.setAttribute("class", item.class);
			button.setAttribute("id", item.id);
			button.addEventListener("click", () => item.callback());
			handControlsContainer.appendChild(button);
		})
		document.querySelector("a-scene").appendChild(handControlsContainer);
	}

};

let handbuttonmutestate = true;
const handbuttonstuff = new handButtonCrap();


////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////

// Everyone who helped make this possible, HBR, Vanquisher, DedZed, Sebek and FireRat, And thank you to everyone who helped test it
// Enables Interaction for all the browser windows by HBR

	  AFRAME.registerComponent("enable-interaction", { init: async function() { await window.AframeInjection.waitFor(this.el, "browser");
			this.el.browser.ToggleInteraction(true) 			} });
			
// Listens for button clicks to open the urls on either Screen by HBR
  AFRAME.registerComponent("click-url", {
	schema: { url: { type: "string", default: "" }, },
	init: function () {
	  this.el.addEventListener("click", () => {                         
		const TheBrowser = this.el.parentElement;
		let buttoncolor = this.el.getAttribute("color");
		if (buttoncolor != null) {
			this.el.setAttribute("color", "#FFFFFF"); 
			setTimeout(() => {  this.el.setAttribute("color", buttoncolor); }, 100);
		};
		TheBrowser.setAttribute("sq-browser", { url: this.data.url, pixelsPerUnit: 1600, mipMaps: 1, mode: "local", });		
		});		},		});
		
 // Toggle Button for locking and unlocking either screen By Fire with help from HBR
  AFRAME.registerComponent("lockbutton", {
	init: function () {
	  this.el.addEventListener("click", () => {
		const lockToggle = this.el;
		const ColliderScreen = lockToggle.parentElement.children[0];
		if (ColliderScreen.getAttribute("visible")) {
			  lockToggle.setAttribute("color","#FF0000");
			  ColliderScreen.setAttribute("visible","false");
		} else {
			  lockToggle.setAttribute("color","#00FF00");
			  ColliderScreen.setAttribute("visible","true");
	  }		});  }, 	});

		
// Toggle Sound for browser screen By Fire with help from HBR
	AFRAME.registerComponent("toggle-mute", {
	init: function () {
		this.el.addEventListener("click", () => {
		const TheBrowser = this.el.parentElement;
		const MuteButton = this.el;
		if(TheBrowser.getAttribute("datamuted")=="true") {
			MuteButton.setAttribute("color","#FFFFFF");
			TheBrowser.setAttribute("datamuted", "false");
			TheBrowser.components["sq-browser"].runActions([ { actionType: "runscript", strparam1:
				"document.querySelectorAll('video, audio').forEach((elem) => elem.muted=false);", }, ]);
		} else {
			MuteButton.setAttribute("color","#FF0000");
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
		let buttoncolor = this.el.getAttribute("color");
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
		setTimeout(() => {  this.el.setAttribute("color", buttoncolor); }, 100);
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
		let buttoncolor = browserRotation.getAttribute("button-color");
		let x = browserRotation.object3D.rotation.x;
		let y = browserRotation.object3D.rotation.y;
		let z = browserRotation.object3D.rotation.z;
		switch (this.data.axis) {
		  case "x":
			x += this.data.amount;
			break;
		  case "y":
			y += this.data.amount;
			break;
		}
		this.el.setAttribute("color","#AAAAAA");
		browserRotation.setAttribute("rotation", x + " " + y + " " + z);  
		setTimeout(() => {  this.el.setAttribute("color", buttoncolor); }, 100); 
		});        },      });

	// Toggle for hiding and showing the rotation buttons By Fire with help from HBR
  AFRAME.registerComponent("enablerot", {
	init: function () {
	  this.el.addEventListener("click", () => {
		const rotats = this.el;
		let buttoncolor = this.el.parentElement.getAttribute("button-color");
		const rotatebutton = rotats.parentElement.children[6];
		var els = document.getElementsByClassName("tilt");
		if (rotatebutton.getAttribute("visible")) {
			  rotats.setAttribute("color","#FFFFFF");
			[].forEach.call(els, function (el) {
				el.setAttribute("visible","false");
			});
		} else {
			  rotats.setAttribute("color", buttoncolor);
			[].forEach.call(els, function (el) {
				el.setAttribute("visible","true");
			});
		}		});  }, 	});
		
	
	// Toggle for hiding and showing buttons By Fire with help from HBR
  AFRAME.registerComponent("hidebuttons", {
	init: function () {
	  this.el.addEventListener("click", () => {
		const hidebut = this.el;
		let buttoncolor = this.el.parentElement.getAttribute("button-color");
		const somebutton = hidebut.parentElement.children[2];
		var buttons = document.getElementsByClassName("buttons");
		if (somebutton.getAttribute("visible")) {
			  hidebut.setAttribute("color", buttoncolor);
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
		let buttoncolor = this.el.getAttribute("color");
		let volume = parseFloat(screenVolume.getAttribute("volumelevel"));
		volume += this.data.vvalue;
		volume = volume.toFixed(2);
		if (volume > 1) {volume = 1};
		if (volume < 0) {volume = 0};
		screenVolume.components["sq-browser"].runActions([ { actionType: "runscript", strparam1:
	"document.querySelectorAll('video, audio').forEach((elem) => elem.volume=" + volume + ");", }, ]);
		this.el.setAttribute("color","#AAAAAA");
		screenVolume.setAttribute("volumelevel", volume);
		setTimeout(() => {  this.el.setAttribute("color", buttoncolor); }, 100);
		});		},		});
		
	
	// Navigates browser page Backwards/Forward
  AFRAME.registerComponent("navigate-browser", {
  schema: {
    action: { type: "string", default: "goback" }  // Default action is "goback"
  },
  init: function () {
    const browserElement = this.el.parentElement;
	let buttoncolor = this.el.getAttribute("color");
    this.el.addEventListener("click", () => {
      const actionType = this.data.action;
      this.el.setAttribute("color", "#AAAAAA");
      browserElement.components['sq-browser'].runActions([{
        actionType: actionType
      }]);
      setTimeout(() => {
        this.el.setAttribute("color", buttoncolor);
      }, 100);
    });
  },
});

function getV3FromStr(strVector3) {
  return new THREE.Vector3().fromArray(strVector3.split(" ").map(parseFloat));
}

function getAttrOrDef(pScript, pAttr, pDefault) {
  if (pScript.hasAttribute(pAttr)) {
    return pScript.getAttribute(pAttr);
  } else {
    return pDefault;
  }
}