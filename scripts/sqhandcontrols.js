var defaulTransparent = 'Unlit/DiffuseTransparent';
var iconmuteurl = "https://firer.at/files/VolumeMute.png";
var iconvolupurl = "https://firer.at/files/VolumeHigh.png";
var iconvoldownurl = "https://firer.at/files/VolumeLow.png";
var iconhomeurl = "https://firer.at/files/Home.png";
var iconlockurl = 'https://firer.at/files/lock.png';
var volupcolor = new BS.Vector4(0,1,0,1);
var voldowncolor = new BS.Vector4(1,1,0,1);
var mutecolor = new BS.Vector4(1,1,1,1);
var buttoncolor = new BS.Vector4(0,1,0,1);
var playerislockedv3 = false;

function adjustBrowserVolume(browserEntity, change) {
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

  runsqBrowserActions(browserEntity.browser, `document.querySelectorAll('video, audio').forEach(elem => elem.volume=${firevolume});
    document.querySelector('.html5-video-player').setVolume(${firepercent});`);
};

function clickABut(uniqueatribute) {
  const buttonEntity = document.querySelector(uniqueatribute);
  if (buttonEntity) {
    buttonEntity.firstChild.dispatchEvent(new Event("click"));
  }
};

function updateButColor(buttonObject, revertColour) {
  let material = buttonObject.GetComponent(BS.ComponentType.BanterMaterial);
  material.color = new BS.Vector4(1,1,1,0.7); setTimeout(() => { material.color = revertColour; }, 100);
};

function runsqBrowserActions(firebrowser, script) {
  firebrowser.RunActions(JSON.stringify({"actions": [{ "actionType": "runscript","strparam1": script }]}));
};

function createButAction(buttonObject, clickHandler) {
  buttonObject.On('click', (e) => { clickHandler(e); });
};

async function createUIButtons(name, thetexture, position, thecolor, thisparent, clickHandler = false, rotation = false, width = 0.1, height = 0.1, theShader = defaulTransparent, localScale = new BS.Vector3(1, 1, 1)) {
  const buttonObject = await new BS.GameObject(name).Async();
  await buttonObject.AddComponent(new BS.BanterGeometry(BS.GeometryType.PlaneGeometry, 0, width, height));
  await buttonObject.AddComponent(new BS.BoxCollider(true));
  await buttonObject.AddComponent(new BS.BanterMaterial(theShader, thetexture, thecolor), 1);
  const buttonTransform = await buttonObject.AddComponent(new BS.Transform());
  buttonTransform.position = position; buttonTransform.localScale = localScale;
  rotation ? buttonTransform.localEulerAngles = rotation : rotation; buttonObject.SetLayer(5); // UI Layer
  await buttonObject.SetParent(thisparent, false);
  if (clickHandler) {
    createButAction(buttonObject, clickHandler);
  }; return buttonObject;
};

async function setupHandControlsV3(playersuseridv3) {
  const browserEntity = document.querySelector('[sq-browser]');
  if (browserEntity) {
    browserEntity.browser.muteState = false;
    browserEntity.browser.volumeLevel = 1;
  };

  // THE CONTAINER FOR THE HAND BUTTONS
  const plane20Object = await new BS.GameObject("handContainer").Async();
  await plane20Object.AddComponent(new BS.BanterGeometry(BS.GeometryType.PlaneGeometry, null, 0.1, 0.1));
  await plane20Object.AddComponent(new BS.BoxCollider(true, new BS.Vector3(0, 0, 0), new BS.Vector3(1,1,1)));
  await plane20Object.AddComponent(new BS.BanterMaterial("Unlit/DiffuseTransparent", "", new BS.Vector4(0,0,0,0), 1));
  const plane20transform = await plane20Object.AddComponent(new BS.Transform());
  plane20transform.localPosition = new BS.Vector3(0.02,0.076,0.040);
  plane20transform.localScale = new BS.Vector3(0.1,0.1,0.1);
  // plane20transform.eulerAngles = new BS.Vector3(5,-95,0);
  plane20transform.rotation = new BS.Vector4(0.25,0,0.8,1);
  setTimeout(async () => { await BS.BanterScene.GetInstance().LegacyAttachObject(plane20Object, playersuseridv3, BS.LegacyAttachmentPosition.LEFT_HAND); }, 1000);
  // Hand Volume Up Button
  const hvolUpButton = await createUIButtons("hVolumeUpButton", iconvolupurl, new BS.Vector3(0.4,0.4,0.3), volupcolor, plane20Object, () => { 
    adjustBrowserVolume(browserEntity, 1); updateButColor(hvolUpButton, volupcolor); clickABut('[position="0.693 0 0"]'); // VolUp
  }, new BS.Vector3(180,0,0),1,1, defaulTransparent, new BS.Vector3(0.4,0.4,0.4));
  // Hand Volume Down Button
  const hvolDownButton = await createUIButtons("hVolumeDownButton", iconvoldownurl, new BS.Vector3(0.0,0.4,0.3), voldowncolor, plane20Object, () => { 
    adjustBrowserVolume(browserEntity, -1); updateButColor(hvolDownButton, voldowncolor); clickABut('[position="0.471 0 0"]'); // VolDown
  }, new BS.Vector3(180,0,0),1,1, defaulTransparent, new BS.Vector3(0.4,0.4,0.4));
  // Hand Mute Button
  const hmuteButton = await createUIButtons("hMuteButton", iconmuteurl, new BS.Vector3(-0.4,0.4,0.3), mutecolor, plane20Object, () => { 
    console.log(`Mute Click`);
    browserEntity.browser.muteState = !browserEntity.browser.muteState; browserEntity.browser.muteState ? muteState = "mute" : muteState = "unMute";
    runsqBrowserActions(browserEntity.browser, `document.querySelectorAll('video, audio').forEach((elem) => elem.muted=${browserEntity.browser.muteState});document.querySelector('.html5-video-player').${muteState}();`); clickABut('[position="0.23 0 0"]'); // Mute
    let muteMaterial = hmuteButton.GetComponent(BS.ComponentType.BanterMaterial);
    muteMaterial.color = browserEntity.browser.muteState ? mutecolor : new BS.Vector4(1, 0, 0, 1); 
  }, new BS.Vector3(180,0,0),1,1,defaulTransparent, new BS.Vector3(0.4,0.4,0.4));
  // Hand Lock Button
  const hlockButton = await createUIButtons("hLockButton", iconlockurl, new BS.Vector3(0,-0.1,0.3), new BS.Vector4(1, 1, 1, 0.7), plane20Object, () => {
    console.log(`Lock Click`); playerislockedv3 = !playerislockedv3; playerislockedv3 ? lockPlayer() : unlockPlayer();
    let plane24material = hlockButton.GetComponent(BS.ComponentType.BanterMaterial);
    plane24material.color = playerislockedv3 ? new BS.Vector4(1,0,0,1) : new BS.Vector4(1, 1, 1, 0.7); }, new BS.Vector3(180,0,0),1,1, defaulTransparent, new BS.Vector3(0.4,0.4,0.4));
  // Hand Home Button
  const hhomeButton = await createUIButtons("hHomeButton", iconhomeurl, new BS.Vector3(0.4,-0.1,0.3), buttoncolor, plane20Object, () => { 
    browserEntity.browser.url = browserEntity.browser.url; console.log(`Home Click`); updateButColor(hhomeButton, buttoncolor); clickABut('[position="-0.633 0 0"]'); // Playlist
  }, new BS.Vector3(180,0,0),1,1, defaulTransparent, new BS.Vector3(0.4,0.4,0.4));
  console.log("FIRESCREEN2: Hand Buttons Setup Complete");
};

if(window.isBanter) {
  const thisintervalvar = setInterval(() => {
    if (BS.BanterScene.GetInstance().localUser && BS.BanterScene.GetInstance().localUser.uid !== undefined) { clearInterval(thisintervalvar);
      console.log(`Hand Controls Script: localUser.uid: ${BS.BanterScene.GetInstance().localUser.uid}`);
      setTimeout(() => { setupHandControlsV3(BS.BanterScene.GetInstance().localUser.uid); }, 10000);
    } else { 
      // Do Nothing
     };
  }, 1000);
};