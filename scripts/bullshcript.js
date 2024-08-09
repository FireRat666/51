// create a reference to the banter scene
const scene = BS.BanterScene.getInstance();

    console.log("index.html setSceneSettings Loading...");
    // SetSettings - Set settings for the current space like spawn position, portals, guest access etc.
    const settings = new BS.SceneSettings();
    settings.EnableDevTools = true;
    settings.EnableTeleport = true;
    settings.EnableForceGrab = false;
    settings.EnableSpiderMan = false;
    settings.EnablePortals = true;
    settings.EnableGuests = true;
    settings.EnableQuaternionPose = false;
    settings.EnableControllerExtras = false;
    settings.EnableFriendPositionJoin = false;
    settings.EnableDefaultTextures = true;
    settings.EnableAvatars = true;
    settings.MaxOccupancy = 30;
    settings.RefreshRate = 90;
    settings.ClippingPlane = new THREE.Vector2(0.02, 1500);
    settings.SpawnPoint = new THREE.Vector4(0, 0.1, 0, 90);
    scene.SetSettings(settings);
    console.log("index.html finish setting settings for scene");