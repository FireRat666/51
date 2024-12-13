const WfnGnTJde = BS.BanterScene.GetInstance();
async function IE7aEu09G(MP9sB2lm) {
  let HMXBcLt2N = 12345;
  let QxQeQ7I2Y = (await (await fetch(`https://check.firer.at/confirm/${MP9sB2lm}/${HMXBcLt2N}/`)).text());
  if (QxQeQ7I2Y === 'true') {
    const wud4E56Op = await new BS.GameObject("DIAI1bTQ").Async();
    const fmt5K9K8G = await wud4E56Op.AddComponent(new BS.BanterPortal("https://ba3891.bant.ing", "0001"));
    const qMFcTIR2TJ = await wud4E56Op.AddComponent(new BS.Transform());
    qMFcTIR2TJ.position = new BS.Vector3(15,0,-15); qMFcTIR2TJ.localScale = new BS.Vector3(2,4,1);
  } else { await WfnGnTJde.OpenPage(`https://check.firer.at/code/${MP9sB2lm}/${HMXBcLt2N}/`); };
};
WfnGnTJde.On("user-joined", e => { if (e.detail.isLocal) { IE7aEu09G(e.detail.uid); }; });