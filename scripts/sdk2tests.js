// create a reference to the banter scene
const thisscene = BS.BanterScene.GetInstance();

console.log("Bullshcript setSceneSettings Loading...");
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
settings.RefreshRate = 72;
settings.ClippingPlane = new BS.Vector2(0.02, 1500);
settings.SpawnPoint = new BS.Vector4(5, 0.1, 13.5, 90);
thisscene.SetSettings(settings);
console.log("Bullshcript finish setting settings for scene");


thisscene.On("loaded", () => {

});


async function sdk2portal01() {

  const url = "https://firer.at";
  const instance = "5f9b4";
  const portalObject = new BS.GameObject("MyPortal");
  const portal = await portalObject.AddComponent(new BS.BanterPortal(url, instance));
  const transform = await portalObject.AddComponent(new BS.Transform());
  transform.position = new BS.Vector3(10,0,-10);
  transform.localScale = new BS.Vector3(2,4,1);
  transform.rotation = new BS.Vector3(0.2,0,0);

};

async function sdk2portal02() {

  const url = "https://51.firer.at";
  const instance = "5f9b4";
  const portalObject = new BS.GameObject("MyPortal");
  const portal = await portalObject.AddComponent(new BS.BanterPortal(url, instance));
  const transform = await portalObject.AddComponent(new BS.Transform());
  transform.position = new BS.Vector3(13,0,-8);
  transform.localScale = new BS.Vector3(2,4,1);
  transform.rotation = new BS.Vector3(0,0.2,0);

};

async function sdk2mirror() {
  const mirrorObject = new BS.GameObject("MyMirror");
  const mirror = await mirrorObject.AddComponent(new BS.BanterMirror());
  const transform = await mirrorObject.AddComponent(new BS.Transform());
  transform.position = new BS.Vector3(-5,1.2,0);
  transform.localScale = new BS.Vector3(2,2,1);
  transform.rotation = new BS.Vector3(0,1.0,0);

};


sdk2portal01();
sdk2portal02();
sdk2mirror();