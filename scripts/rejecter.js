let theeventid = 123456;

const rejecterscene = BS.BanterScene.GetInstance();

async function getuserids(thisusersid) {
  let stateofticket = (await (await fetch("https://dthingy.firer.at/check-user-event/" + thisusersid + "/" + theeventid + "/")).text());
  if (stateofticket === 'true') {
    console.log("stateofticket = true");
  } else {
    console.log("stateofticket = false");
  }
};

rejecterscene.On("user-joined", e => {
  if (e.detail.isLocal) { getuserids(e.detail.uid); };
});

// await scene.OpenPage("https://dthingy.firer.at/check-code/" + scene.localUser.uid + "/" + theeventid + "/");