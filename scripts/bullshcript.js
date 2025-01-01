// create a reference to the banter scene
const scene = BS.BanterScene.GetInstance();

scene.On("unity-loaded", async ()=>{
  console.log("index.html setSceneSettings Loading...");
  // SetSettings - Set settings for the current space like spawn position, portals, guest access etc.
  const settings = await new BS.SceneSettings();
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
  settings.SpawnPoint = new BS.Vector4(0.2, 0.5, 0, 90);
  scene.SetSettings(settings);
  console.log("index.html finish setting settings for scene");
  setTimeout(() => { scene.SetSettings(settings); BS.BanterScene.GetInstance().TeleportTo({x: 0.2, y: 0.6, z: 0}, 0, true); }, 2000);

  async function landingPlatform() {
    const platformObject = await new BS.GameObject("landingPlane").Async();
    await platformObject.AddComponent(new BS.BanterGeometry(BS.GeometryType.BoxGeometry));
    await platformObject.AddComponent(new BS.BoxCollider(false));
    await platformObject.AddComponent(new BS.BanterMaterial("Unlit/DiffuseTransparent", "",  new BS.Vector4(0,0,0,0.5)));
    const plane20transform = await platformObject.AddComponent(new BS.Transform());
  
    plane20transform.localPosition = new BS.Vector3(0,-2,0);
    plane20transform.localScale = new BS.Vector3(20,0.05,20);
  }

  landingPlatform();

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