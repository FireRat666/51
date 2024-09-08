const rejecterscene = BS.BanterScene.GetInstance();

async function checkusersid(thisusersid) {
  let theeventid = 12345;
  let stateofticket = (await (await fetch(`https://check.firer.at/confirm/${thisusersid}/${theeventid}/`)).text());
  if (stateofticket === 'true') {
    openportal01()
    // await rejecterscene.OpenPage(`https://check.firer.at/confirm/${thisusersid}/${theeventid}/`);
  } else {
    // await rejecterscene.OpenPage("banter://f.bant.ing/");
    await rejecterscene.OpenPage(`https://check.firer.at/code/${thisusersid}/${theeventid}/`);
  }
};

rejecterscene.On("user-joined", e => {
  if (e.detail.isLocal) { checkusersid(e.detail.uid); };
});

async function openportal01() {
  const portalObject = new BS.GameObject("MyPortal");
  const portal = await portalObject.AddComponent(new BS.BanterPortal("https://ba3891.bant.ing", "0001"));
  const transform = await portalObject.AddComponent(new BS.Transform());
  transform.position = new BS.Vector3(15,0,-15);
  transform.localScale = new BS.Vector3(2,4,1);
};

// await scene.OpenPage("https://check.firer.at/code/" + scene.localUser.uid + "/" + theeventid + "/");