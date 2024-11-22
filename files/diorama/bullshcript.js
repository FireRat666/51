if(window.isBanter){
  // create a reference to the banter scene
  const dioramascene = BS.BanterScene.GetInstance();
  
  async function somerandomStartCrap() {
    const waitingForUnity = async () => { while (!dioramascene.unityLoaded) { await new Promise(resolve => setTimeout(resolve, 500)); } };
    await waitingForUnity(); console.log("SCRIPT: Unity-Loaded");
    setTimeout(() => { loadSettings(); }, 1000);
  };

  function loadSettings() {
    const randomLocationX = Math.round((Math.random() * 2 - 1) * 10) / 10;
    const randomLocationZ = Math.round((Math.random() * 2 - 1) * 10) / 10;
    console.log("SCRIPT setSceneSettings Loading...");
    // SetSettings - Set settings for the current space like spawn position, portals, guest access etc.
    const settings = new BS.SceneSettings();
    settings.EnableTeleport = true;
    settings.EnableForceGrab = false;
    settings.EnableSpiderMan = true;
    settings.EnablePortals = true;
    settings.EnableGuests = true;
    // settings.EnableQuaternionPose = false;
    // settings.EnableControllerExtras = false;
    // settings.EnableFriendPositionJoin = false;
    // settings.EnableDefaultTextures = true;
    // settings.EnableAvatars = true;
    settings.MaxOccupancy = 50;
    settings.RefreshRate = 72;
    settings.ClippingPlane = new BS.Vector2(0.05, 1000);
    settings.SpawnPoint = new BS.Vector4(0, 0.1, 0, 90);
    dioramascene.TeleportTo({x: randomLocationX, y: 0.2, z: randomLocationZ}, 0, true);
    dioramascene.SetSettings(settings);
    console.log("SCRIPT finish setting settings for scene");
    setTimeout(() => { dioramascene.TeleportTo({x: randomLocationX, y: 0.2, z: randomLocationZ}, 0, true); dioramascene.SetSettings(settings); }, 2000);
  };

  somerandomStartCrap();

};