// document.querySelectorAll('[sq-browser]').forEach((element, index) => {
//   let volume = Number(parseFloat(0.1));
//   const firePercent = Math.round(volume * 100);
//     element.components["sq-browser"].runActions([
//       { actionType: "runscript", strparam1: `document.querySelectorAll('video, audio').forEach(elem => elem.volume=${volume});` },
//       { actionType: "runscript", strparam1: `document.querySelector('.html5-video-player').setVolume(${firePercent});` }
//     ]);
// });

// function setBrowserVolume(volumelevel) {
//   document.querySelectorAll('[sq-browser]').forEach((element) => {
//     let volume = Number(parseFloat(volumelevel));
//     const firePercent = Math.round(volume * 100);
//       element.components["sq-browser"].runActions([
//         { actionType: "runscript", strparam1: `document.querySelectorAll('video, audio').forEach(elem => elem.volume=${volume});` },
//         { actionType: "runscript", strparam1: `document.querySelector('.html5-video-player').setVolume(${firePercent});` }
//       ]);
//   });
// }

// setBrowserVolume(0.5);

var p_iconmuteurl = "https://firer.at/files/VolumeMute.png";
var p_iconvolupurl = "https://firer.at/files/VolumeHigh.png";
var p_iconvoldownurl = "https://firer.at/files/VolumeLow.png";
var p_volupcolor = new BS.Vector4(0,1,0,1);
var p_voldowncolor = new BS.Vector4(1,1,0,1);
var p_mutecolor = new BS.Vector4(1,1,1,1);
var p_buttoncolor = new BS.Vector4(0,1,0,1);
var playersuseridv3 = BS.BanterScene.GetInstance().localUser.uid;
var playerislockedv3 = false;
const browserEntity = document.querySelector('[sq-browser]');
browserEntity.browser.muteState = false;
browserEntity.browser.volumeLevel = 1;

var defaulTransparent = 'Unlit/DiffuseTransparent';


function adjustBrowserVolume(change) {

  let firevolume = browserEntity.browser.volumeLevel;
  let currentVolume = Number(firevolume); let adjustment;
  if (currentVolume < 0.1) { adjustment = 0.01; // Tiny adjustment for low volume
  } else if (currentVolume < 0.5) { adjustment = 0.03; // Medium adjustment for medium volume
  } else { adjustment = 0.05; } // Big adjustment for high volume
  firevolume = currentVolume + (change * adjustment);
  firevolume = Math.max(0, Math.min(firevolume, 1)).toFixed(2);
  let firepercent = (firevolume * 100).toFixed(0);
  browserEntity.browser.volumeLevel = firevolume;
  console.log(`The volume is ${firepercent}`);
      browserEntity.components["sq-browser"].runActions([
        { actionType: "runscript", strparam1: `document.querySelectorAll('video, audio').forEach(elem => elem.volume=${firevolume});` },
        { actionType: "runscript", strparam1: `document.querySelector('.html5-video-player').setVolume(${firepercent});` }
      ]);
}

async function setupHandControlsV3() {
  // THE CONTAINER FOR THE HAND BUTTONS
  const plane20Object = new BS.GameObject("handContainer");
  await plane20Object.AddComponent(new BS.BanterGeometry(BS.GeometryType.PlaneGeometry, null, 0.1, 0.1));
  await plane20Object.AddComponent(new BS.BoxCollider(true, new BS.Vector3(0, 0, 0), new BS.Vector3(1,1,1)));
  await plane20Object.AddComponent(new BS.BanterMaterial("Unlit/DiffuseTransparent", "", new BS.Vector4(0,0,0,0), 1));

  const plane20transform = await plane20Object.AddComponent(new BS.Transform());
  plane20transform.localPosition = new BS.Vector3(0,0.046,0.030);
  plane20transform.localScale = new BS.Vector3(0.1,0.1,0.1);
  // plane20transform.eulerAngles = new BS.Vector3(5,-95,0);
  plane20transform.rotation = new BS.Vector4(0.25,0,0.8,1);
  setTimeout(async () => { await BS.BanterScene.GetInstance().LegacyAttachObject(plane20Object, playersuseridv3, BS.LegacyAttachmentPosition.LEFT_HAND); }, 1000);
  // Hand Volume Up Button
  const hvolUpButton = await createUIButton("hVolumeUpButton", p_iconvolupurl, new BS.Vector3(0.4,0.4,0.3), p_volupcolor, plane20Object, () => { 
    adjustBrowserVolume(1)

    updateButtonColor(hvolUpButton, p_volupcolor); 
  }, new BS.Vector3(180,0,0),1,1, defaulTransparent, new BS.Vector3(0.4,0.4,0.4));
  // Hand Volume Down Button
  const hvolDownButton = await createUIButton("hVolumeDownButton", p_iconvoldownurl, new BS.Vector3(0.0,0.4,0.3), p_voldowncolor, plane20Object, () => { 
    adjustBrowserVolume(-1)

    updateButtonColor(hvolDownButton, p_voldowncolor); 
  }, new BS.Vector3(180,0,0),1,1, defaulTransparent, new BS.Vector3(0.4,0.4,0.4));
  // Hand Mute Button
  const hmuteButton = await createUIButton("hMuteButton", p_iconmuteurl, new BS.Vector3(-0.4,0.4,0.3), p_mutecolor, plane20Object, () => { 
    console.log(`MuteClick`);
    browserEntity.browser.muteState = !browserEntity.browser.muteState; browserEntity.browser.muteState ? muteState = "mute" : muteState = "unMute";
    runBrowserActions(browserEntity.browser, `document.querySelectorAll('video, audio').forEach((elem) => elem.muted=${browserEntity.browser.muteState});document.querySelector('.html5-video-player').${muteState}();`);
    
    let muteMaterial = hmuteButton.GetComponent(BS.ComponentType.BanterMaterial);
    muteMaterial.color = browserEntity.browser.muteState ? p_mutecolor : new BS.Vector4(1, 0, 0, 1); 
  }, new BS.Vector3(180,0,0),1,1,defaulTransparent, new BS.Vector3(0.4,0.4,0.4));
  // Hand Lock Button
  const hlockButton = await createUIButton("hLockButton", 'https://firer.at/files/lock.png', new BS.Vector3(0,-0.1,0.3), new BS.Vector4(1, 1, 1, 0.7), plane20Object, () => {

    console.log(`LockClick`);
    playerislockedv3 = !playerislockedv3; playerislockedv3 ? lockPlayer() : unlockPlayer();
    let plane24material = hlockButton.GetComponent(BS.ComponentType.BanterMaterial);

    plane24material.color = playerislockedv3 ? new BS.Vector4(1,0,0,1) : new BS.Vector4(1, 1, 1, 0.7); }, new BS.Vector3(180,0,0),1,1, defaulTransparent, new BS.Vector3(0.4,0.4,0.4));
  // Hand Home Button
  const hhomeButton = await createUIButton("hHomeButton", "https://firer.at/files/Home.png", new BS.Vector3(0.4,-0.1,0.3), p_buttoncolor, plane20Object, () => { 
    browserEntity.browser.url = browserEntity.browser.url
    // adjustForAll("goHome");
    updateButtonColor(hhomeButton, p_buttoncolor); 
  }, new BS.Vector3(180,0,0),1,1, defaulTransparent, new BS.Vector3(0.4,0.4,0.4));
  console.log("FIRESCREEN2: Hand Buttons Setup Complete");
};

function updateButtonColor(buttonObject, revertColour) {
  let material = buttonObject.GetComponent(BS.ComponentType.BanterMaterial);
  material.color = new BS.Vector4(1,1,1,0.7); setTimeout(() => { material.color = revertColour; }, 100);
};

function runBrowserActions(firebrowser, script) {
  firebrowser.RunActions(JSON.stringify({"actions": [{ "actionType": "runscript","strparam1": script }]}));
};

async function createUIButton(name, thetexture, position, thecolor, thisparent, clickHandler = false, rotation = false, localScale = new BS.Vector3(1, 1, 1)) {
  const buttonObject = new BS.GameObject(name);
  await buttonObject.AddComponent(new BS.BanterGeometry(BS.GeometryType.PlaneGeometry));
  await buttonObject.AddComponent(new BS.BoxCollider(true));
  await buttonObject.AddComponent(new BS.BanterMaterial("Unlit/DiffuseTransparent", thetexture, thecolor), 1);
  const buttonTransform = await buttonObject.AddComponent(new BS.Transform());
  buttonTransform.position = position; buttonTransform.localScale = localScale;
  rotation ? buttonTransform.localEulerAngles = rotation : rotation; buttonObject.SetLayer(5); // UI Layer
  await buttonObject.SetParent(thisparent, false);
  if (clickHandler) {
    createButtonAction(buttonObject, clickHandler);
  }; return buttonObject;
};

function createButtonAction(buttonObject, clickHandler) {
  buttonObject.On('click', (e) => { clickHandler(e); });
};