if(window.isBanter){ // Check if the window is in Banter mode
  const scene = BS.BanterScene.GetInstance(); // Get the BanterScene instance
  
  let waitingforunity = true; // Flag to check if we are waiting for Unity to load
  var waitinterval; // Variable to hold the interval ID
  if (waitingforunity) { // If we are waiting for Unity to load
    console.log("SCENE: Waiting for Unity to load..."); // Log that we are waiting for Unity to load
    waitinterval = setInterval(function() { // Set an interval to check if Unity has loaded
      if (scene.unityLoaded) { waitingforunity = false; clearInterval(waitinterval); // Clear the interval if Unity has loaded
        if (!window.UnitySceneLoaded) { // This ensures the scene is only initialized once
          window.UnitySceneLoaded = true; // Set the Unity scene loaded flag to true
          console.log("SCENE: unityLoaded Initialising!"); // Log that Unity has loaded and we are initializing the scene
          BanterStuff();  // Call the BanterStuff function to set up the scene
        }; 
      };
    }, 1000); // Check every second if Unity has loaded
  };

  function BanterStuff() {
    scene.TeleportTo({x: 0, y: 0, z: 0}, 0, true); // Teleport the player to the center of the scene
    scene.Gravity(new BS.Vector3(0,-9.8,0)); // Set gravity
    console.log("setSceneSettings Loading...");
    const settings = new BS.SceneSettings(); // Create a new SceneSettings object
    // PHYSICS SETTINGS
    settings.PhysicsMoveSpeed = 4, // Speed at which the player moves
    settings.PhysicsMoveAcceleration = 4.6, // Acceleration of the player movement
    settings.PhysicsAirControlSpeed = 3.8,  // Speed at which the player can control their movement in the air
    settings.PhysicsAirControlAcceleration = 6, // Acceleration of the player movement in the air
    settings.PhysicsDrag = 0, // Drag applied to the player movement
    settings.PhysicsFreeFallAngularDrag = 6, // Angular drag applied to the player when in free fall
    settings.PhysicsJumpStrength = 1, // Strength of the player's jump
    settings.PhysicsHandPositionStrength = 1, // Strength of the player's hand position
    settings.PhysicsHandRotationStrength = 1, // Strength of the player's hand rotation
    settings.PhysicsHandSpringiness = 10, // Springiness of the player's hand
    settings.PhysicsGrappleRange = 512, // Range of the grapple
    settings.PhysicsGrappleReelSpeed = 1, // Speed at which the grapple reels in
    settings.PhysicsGrappleSpringiness = 10, // Springiness of the grapple
    settings.PhysicsGorillaMode = false, // Enable Gorilla Mode
    settings.PhysicsSettingsLocked = false // Set this to true to prevent users from changing physics settings
    // GENERAL SETTINGS
    settings.EnableHandHold = true, // Enable hand holding
    settings.EnableRadar = true, // Enable radar
    settings.EnableNametags = true, // Enable nametags
    settings.EnableDevTools = true; // Enable dev tools
    settings.EnableTeleport = true; // Enable teleportation
    settings.EnableForceGrab = false; // Enable force grab
    settings.EnableSpiderMan = true; // Enable Spider-Man (ropes)
    settings.EnablePortals = true; // Enable portals
    settings.EnableGuests = true; // Enable guests
    settings.EnableQuaternionPose = false;  // Enable quaternion pose
    settings.EnableControllerExtras = true; // Enable controller extras
    settings.EnableFriendPositionJoin = true;  // Enable friend position join
    settings.EnableDefaultTextures = true;  // Enable default textures
    settings.EnableAvatars = true;  // Enable avatars
    settings.MaxOccupancy = 30; // Maximum number of players in the scene
    settings.RefreshRate = 72;  // Refresh rate of the scene
    settings.ClippingPlane = new BS.Vector2(0.02, 300); // Clipping plane of the scene
    settings.SpawnPoint = new BS.Vector4(0, 0, 0, 180); // Spawn point of the player
    settings.SettingsLocked = false, // Set this to true to prevent users from changing settings
    scene.SetSettings(settings); // Apply the settings to the scene
    setTimeout(() => { setSettingsAgain(settings); }, 2000);

    function setSettingsAgain(settings) {
      scene.TeleportTo({x: 0, y: 0, z: 0}, 0, true); // Teleport the player to the center of the scene again
      scene.Gravity(new BS.Vector3(0,-9.8,0));  // Set gravity again
      scene.SetSettings(settings); // Apply the settings again to ensure they are set correctly
    };
  }
};