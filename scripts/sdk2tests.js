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