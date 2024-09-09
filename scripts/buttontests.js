async function sdkstuffthing() {
    // Make sure if button is double clicked, it only plays once, using this variable
    let readytoplayaudio = true;

    // Geometry Constants 
    const geometryType = BS.GeometryType.BOxGeometry;
    const parametricType = null;
    const width = 1;
    const height = 1;
    const depth = 1;
    const widthSegments = 1;
    const heightSegments = 1;
    const depthSegments = 1;
    const radius = 1;
    const segments = 24;
    const thetaStart = 0;
    const thetaLength = 6.283185;
    const phiStart = 0;
    const phiLength = 6.283185;
    const radialSegments = 8;
    const openEnded = false;
    const radiusTop = 1;
    const radiusBottom = 1;
    const innerRadius = 0.3;
    const outerRadius = 1;
    const thetaSegments = 24;
    const phiSegments = 8;
    const tube = 0.4;
    const tubularSegments = 16;
    const arc = 6.283185;
    const p = 2;
    const q = 3;
    const stacks = 5;
    const slices = 5;
    const detail = 0;
    const parametricPoints = "";

    // Collider Constants
    const isTrigger = false;
    const center = new BS.Vector3(0,0,0);
    const size = new BS.Vector3(1,1,1); 

    // Material Constants  
    const texture = null;
    const color = new BS.Vector4(0,1,1,1);
    const shaderName = "Unlit/Diffuse";
    const side = 0;
    const generateMipMaps = false;

    // This Function creates a game Object with the given name
    async function createObjectTest(thingy1, thingy2) {
        thingy1 = new BS.GameObject(thingy2);
        return thingy1
    };

    // This Function adds geometry to the given game Object
    async function createGeometryTest(thingy1, thingy2) {
        thingy2 = await thingy1.AddComponent(new BS.BanterGeometry(geometryType, parametricType, width, height, depth, widthSegments, heightSegments, depthSegments, radius, segments, thetaStart, thetaLength, phiStart, phiLength, radialSegments, openEnded, radiusTop, radiusBottom, innerRadius, outerRadius, thetaSegments, phiSegments, tube, tubularSegments, arc, p, q, stacks, slices, detail, parametricPoints));
        return thingy2
    };

    // This Function adds a Box Collider to the given game Object
    async function createBoxColliderTest(thingy1, thingy2) {
        thingy2 = await thingy1.AddComponent(new BS.BoxCollider(isTrigger, center, size));
        return thingy2
    };

    // This Function adds a Material to the given game Object
    async function createMaterialTest(thingy1, thingy2) {
        thingy2 = await thingy1.AddComponent(new BS.BanterMaterial(shaderName, texture, color, side, generateMipMaps));
        return thingy2
    };

    // Create Just One Audio Object
    const thistestAudioObject = new BS.GameObject("MyAudioSource01");
    let thisaudiovolume = 0.15;
    let theAudioSourceThing = await thistestAudioObject.AddComponent(new BS.BanterAudioSource(thisaudiovolume, 1, false, false, true, true, true, false));

    // The Game Object 01
    const gameObject01 = await createObjectTest("gameObject", "mygameObject01");
    // Add Geometry to the Object
    const geometry01 = await createGeometryTest(gameObject01, "geometry01");
    // Add BoxCollider to the Object
    const boxCollider01 = await createBoxColliderTest(gameObject01, "boxCollider01");
    // Add Material to the Object
    const material01 = await createMaterialTest(gameObject01, "material01");
    // Add Transform to the Object
    const transform01 = await gameObject01.AddComponent(new BS.Transform());

    // THIS IS WHERE YOU CHANGE POSITION AND SCALE OF THE BUTTONS
    transform01.position = new BS.Vector3(0,2,-1);
    transform01.localScale = new BS.Vector3(0.5,0.5,0.5);
    // Set Object to UI Layer 5 so it can be Clicked
    await gameObject01.SetLayer(5); // UI Layer
    
    // Box Click Thing 01
    gameObject01.On('click', () => {
        console.log("CLICKED01!");
        // Do some stuff so the color changes white when clicked
        let material01colour = material01.color;
        material01.color = new BS.Vector4(1,1,1,0.8);
        setTimeout(() => { material01.color = material01colour }, 100);
        // Checks if readytoplayaudio is true, to prevent accidental double clicks
        if (readytoplayaudio) {
            readytoplayaudio = false
            theAudioSourceThing.volume = 0.25;
            theAudioSourceThing.volume = thisaudiovolume;
            theAudioSourceThing.PlayOneShotFromUrl("https://speak.firer.at/?text=Test Thing Working Test#.mp3");
            setTimeout(() => { readytoplayaudio = true }, 1500);
        } else {
            console.log("Not Ready!");
        };

    });

    
    // The Game Object 02
    const gameObject02 = await createObjectTest("gameObject", "mygameObject02");
    // Add Geometry to the Object
    const geometry02 = await createGeometryTest(gameObject02, "geometry02");
    // Add BoxCollider to the Object
    const boxCollider02 = await createBoxColliderTest(gameObject02, "boxCollider02");
    // Add Material to the Object
    const material02 = await createMaterialTest(gameObject02, "material02");
    // Add Transform to the Object
    const transform02 = await gameObject02.AddComponent(new BS.Transform());

    // THIS IS WHERE YOU CHANGE POSITION AND SCALE OF THE BUTTONS
    transform02.position = new BS.Vector3(0,2,1);
    transform02.localScale = new BS.Vector3(0.5,0.5,0.5);
    // Set Object to UI Layer 5 so it can be Clicked
    await gameObject02.SetLayer(5); // UI Layer
    
    // Box Click Thing 02
    gameObject02.On('click', () => {
        console.log("CLICKED02!");
        // Do some stuff so the color changes white when clicked
        let material02colour = material02.color;
        material02.color = new BS.Vector4(1,1,1,0.8);
        setTimeout(() => { material02.color = material02colour }, 100);
        // Checks if readytoplayaudio is true, to prevent accidental double clicks
        if (readytoplayaudio) {
        theAudioSourceThing.volume = 0.25;
        theAudioSourceThing.volume = thisaudiovolume;
        theAudioSourceThing.PlayOneShotFromUrl("https://speak.firer.at/?text=Other Thing Working Maybe Good#.mp3");
        setTimeout(() => { readytoplayaudio = true }, 1500);
        } else {
            console.log("Not Ready!");
        };

    });


};

sdkstuffthing();