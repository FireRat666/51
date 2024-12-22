function waitForUnityIsLoaded(callback) {
  const videoInterval = setInterval(() => {
    if (BS.BanterScene.GetInstance().unityLoaded) {
      clearInterval(videoInterval); // Stop checking
      callback(); // Execute the callback
    }
  }, 1000); // Check every 1000ms / 1 second
};

waitForUnityIsLoaded( async () => {
  console.log(`Unity Video Player Thingy Loading!`);
  async function videoPlayerThing() {

    const vidPlayerObject = await new BS.GameObject(`videoPlayerObject`).Async();
    await vidPlayerObject.AddComponent(new BS.BanterGeometry(BS.GeometryType.PlaneGeometry, 0, 1.6, 0.9));
    await vidPlayerObject.AddComponent(new BS.MeshCollider(false, true)); // isTrigger / convex
    await vidPlayerObject.AddComponent(new BS.BanterMaterial('Unlit/Diffuse', "https://firer.at/files/90percTblack.png", new BS.Vector4(1,1,1,1), BS.MaterialSide.Front, false)); // shaderName / texture / color / side / generateMipMaps
    
    const vidurl = "https://pomf2.lain.la/f/uba4ab7y.mp4";
    const thisVideoPlayer = await vidPlayerObject.AddComponent(new BS.BanterVideoPlayer(vidurl, 0.3, true, true, true, true)); // volume / loop / playOnAwake / skipOnDrop / waitForFirstFrame
    await vidPlayerObject.AddComponent(new BS.BanterBillboard(0, true, true, false)); // smoothing / enableXAxis / enableYAxis / enableZAxis
    const videoPlayerTransform = await vidPlayerObject.AddComponent(new BS.Transform());
    videoPlayerTransform.localPosition = new BS.Vector3(0,1.5,0);
    videoPlayerTransform.localScale = new BS.Vector3(2,2,1);
    return thisVideoPlayer;

  }

  async function createThing(name, butPosition, posterImage = null, clickHandler, localRotation = new BS.Vector3(0,0,0), localScale = new BS.Vector3(1, 1, 1), width = 1, height = 1, depth = 1) {
    const buttonObject = new BS.GameObject(`Button_${name}`); // Create the Object and give it a name
    await buttonObject.AddComponent(new BS.BanterGeometry(BS.GeometryType.BoxGeometry, 0, width, height, depth)); // add geometry to the object / BoxGeometry or PlaneGeometry work well
    await buttonObject.AddComponent(new BS.BanterMaterial('Unlit/DiffuseTransparent', posterImage, new BS.Vector4(1, 1, 1, 0.7))); // Set the Shader (Unlit/Diffuse) and the Color (0.1, 0.1, 0.1, 0.7) 0.7 being the alpha / transparency 
    const buttonTransform = await buttonObject.AddComponent(new BS.Transform()); // Add a transform component so you can move and transform the object
    await buttonObject.AddComponent(new BS.MeshCollider(true)); // Add a mesh Collider for the clicking to work
    buttonObject.SetLayer(5); // Set the object to UI Layer 5 so it can be clicked

    buttonTransform.position = butPosition; // Set the Position of the object
    buttonTransform.localScale = localScale; // Set the Scale of the object
    buttonTransform.localEulerAngles = localRotation; // Set the Scale of the object

      buttonObject.On('click', (e) => { console.log(`Button clicked!`); clickHandler(e); });
  }

  // Create the Video Player and create a reference to it
  const videoPlayer = await videoPlayerThing();
  const videoPlayerObject = await BS.BanterScene.GetInstance().Find("videoPlayerObject");
  var videoPlayerIsActive = true;


  // NAME // Button Position // TextureImage // ACTION // localRotation // Scale
  createThing('Thing1', new BS.Vector3(2,1.5,0), 'https://firer.at/files/90percTblack.png', () => { videoPlayer.PlayToggle() }, new BS.Vector3(0,0,0), new BS.Vector3(0.5, 2.5, 0.5));

  createThing('Thing2', new BS.Vector3(-2,1.5,0), 'https://firer.at/files/90percTblack.png', () => { 
    videoPlayerIsActive = !videoPlayerIsActive;
    videoPlayerObject.SetActive(videoPlayerIsActive ? 1 : 0);
  }, new BS.Vector3(0,0,0), new BS.Vector3(0.5, 2.5, 0.5));

  console.log(`Unity Video Player Thingy Loaded!`);

});

async function examplecode() {
  // create a reference to the object from anywhere
  videoPlayerObject = await BS.BanterScene.GetInstance().Find("videoPlayerObject");
  // access any component using the object
  videoPlayerTransform = await videoPlayerObject.GetComponent(BS.ComponentType.Transform);
  
  // used to toggle playback
  videoPlayer.PlayToggle();
  // used to set the volume
  videoPlayer.volume = 0.1;
  
  // This will either make the object / player active or not active 
  videoPlayerObject.SetActive(0) / videoPlayerObject.SetActive(1)
  
  // Using watch properties you can keep track of the current time and potentially sync it with others 
  videoPlayer.WatchProperties([BS.PropertyName.time]);
  // Get the current time and store it to a variable
  let currentTime = videoPlayer.time;
  // Set the time of the video
  videoPlayer.time = syncedTime;

}