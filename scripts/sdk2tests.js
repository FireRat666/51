// create a reference to the banter scene
// const thisscene = BS.BanterScene.GetInstance();

// thisscene.On("loaded", () => {

// });

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

async function videoPlayerStuff() {
  const thisObjectThing = new BS.GameObject("MyObjectName");
  await thisObjectThing.AddComponent(new BS.BanterGeometry(BS.GeometryType.PlaneGeometry, null, 1.6, 0.9)); // 1.6, 0.9 is setting the screen to 16:9 dimensions, width & height
  await thisObjectThing.AddComponent(new BS.BanterMaterial('Unlit/Diffuse', null, new BS.Vector4(1, 1, 1, 1)));
  await thisObjectThing.AddComponent(new BS.BanterBillboard(0, true, true, false)); // This is Optional
  const aTransformThing = await thisObjectThing.AddComponent(new BS.Transform());
  aTransformThing.position = new BS.Vector3(1,2,1); // THE POSITION OF THE SCREEN

  const url = "https://small.fileditchstuff.me/s15/MBdxEMbKqWfgwQXCiA.mp4";
  const thisVolume = 0.1;
  const vidloop = false;
  const playOnAwake = true;
  const skipOnDrop = true;
  const waitForFirstFrame = true;
  const aVideoPlayerThing = await thisObjectThing.AddComponent(new BS.BanterVideoPlayer(url, thisVolume, vidloop, playOnAwake, skipOnDrop, waitForFirstFrame));

  // aVideoPlayerThing.url = "https://small.fileditchstuff.me/s15/MBdxEMbKqWfgwQXCiA.mp4"
  // aVideoPlayerThing.PlayToggle();
  // aVideoPlayerThing.volume = 0.05;
}

// videoPlayerStuff();

sdk2portal01();
sdk2portal02();
sdk2mirror();