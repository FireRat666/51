// create a reference to the banter scene
const scene = BS.BanterScene.GetInstance();

scene.On("unity-loaded", ()=>{
  console.log("index.html setSceneSettings Loading...");
  // SetSettings - Set settings for the current space like spawn position, portals, guest access etc.
  const settings = new BS.SceneSettings();
  settings.EnableDevTools = true;
  settings.EnableTeleport = true;
  settings.EnableForceGrab = false;
  settings.EnableSpiderMan = true;
  settings.EnablePortals = true;
  settings.EnableGuests = true;
  settings.EnableQuaternionPose = false;
  settings.EnableControllerExtras = false;
  settings.EnableFriendPositionJoin = false;
  settings.EnableDefaultTextures = true;
  settings.EnableAvatars = true;
  settings.MaxOccupancy = 30;
  settings.RefreshRate = 72;
  settings.ClippingPlane = new BS.Vector2(0.02, 1500);
  settings.SpawnPoint = new BS.Vector4(0, 0.5, 0, 90);
  scene.SetSettings(settings);
  console.log("index.html finish setting settings for scene");
  setTimeout(() => { scene.SetSettings(settings); }, 2000);
});
//   class BanterCrap{
//     constructor() {
//       console.log("index.html Constructor Loading.");
//       if(window.isBanter) { 
//         // this.LoadAssetBundle();
//       };
//     }
//     async LoadAssetBundle() {
//       console.log("index.html Asset Bundle Loading...");
//       const windowsUrl = "https://51.firer.at/windows.banter"; 
//       // https://firer.at/files/bundles/basic.windows.banter
//       // https://firer.at/files/bundles/basic.android.banter
//       // https://51.firer.at/windows.banter
//       // https://51.firer.at/android.banter
//       // const osxUrl = null; // Not implemented yet...
//       // const linuxUrl = null; // Not implemented yet...
//       const androidUrl = "https://51.firer.at/android.banter";
//       // const iosUrl = null; // Not implemented yet...
//       // const vosUrl = null; // Not implemented yet...
//       // const isScene = true;
//       // const legacyShaderFix = false;
//       // const gameObject = new BS.GameObject("MyAssetBundle"); 
//       // console.log("index.html Asset Bundle Loading go...");
//       // BS.LoadAssetBundles(androidUrl, windowsUrl); // this doesn't work
//       // const assetBundle = await gameObject.AddComponent(new BS.BanterAssetBundle(windowsUrl, osxUrl, linuxUrl, androidUrl, iosUrl, vosUrl, isScene, legacyShaderFix));
//           console.log("index.html Asset Bundle Loaded");
//     }
// };
// const banterstuff = new BanterCrap();