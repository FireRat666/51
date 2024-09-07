let theeventid = 12345;

const rejecterscene = BS.BanterScene.GetInstance();

async function checkusersid(thisusersid) {
  let stateofticket = (await (await fetch(`https://dthingy.firer.at/check-user-event/${thisusersid}/${theeventid}/`)).text());
  if (stateofticket === 'true') {
    console.log("stateofticket = true");
    await rejecterscene.OpenPage(`https://dthingy.firer.at/check-user-event/${thisusersid}/${theeventid}/`);
  } else {
    console.log("stateofticket = false");
    // openPage("banter://f.bant.ing/");
    await rejecterscene.OpenPage(`https://dthingy.firer.at/check-code/${thisusersid}/${theeventid}/`);
  }
};

rejecterscene.On("user-joined", e => {
  if (e.detail.isLocal) { checkusersid(e.detail.uid); };
});

// await scene.OpenPage("https://dthingy.firer.at/check-code/" + scene.localUser.uid + "/" + theeventid + "/");