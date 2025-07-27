(async () => {
    // --- 1. Configuration and Setup ---
    console.log("--- FireScreen Hand Controls Test Script ---");

    if (typeof BS === 'undefined') {
        console.error("Banter SDK (BS) not found. Make sure you're running this in a Banter world.");
        return;
    }

    const scene = BS.BanterScene.GetInstance();
    const localPlayer = scene.localUser;

    if (!localPlayer) {
        console.error("Could not find local player. Are you in a world?");
        return;
    }
    const userId = localPlayer.uid;
    const testInstanceId = Math.floor(Math.random() * 1000);

    // Default parameters, mimicking what would be passed to a FireScreen instance.
    // You can change these URLs and colors for testing.
    const params = {
        'icon-volup-url': 'https://firer.at/files/VolumeHigh.png',
        'icon-voldown-url': 'https://firer.at/files/VolumeLow.png',
        'icon-mute-url': 'https://firer.at/files/VolumeMute.png',
        'volup-color': new BS.Vector4(0.8, 0.8, 0.8, 1),
        'voldown-color': new BS.Vector4(0.8, 0.8, 0.8, 1),
        'mute-color': new BS.Vector4(0.8, 0.8, 0.8, 1),
        'button-color': new BS.Vector4(0.8, 0.8, 0.8, 1),
    };

    // --- 2. Constants ---
    // (Copied from FireScreenInstance.js)
    const CONSTANTS = {
        SHADERS: {
            CUSTOM_BUTTON: 'Unlit/Diffuse',
            DEFAULT_TRANSPARENT: 'Unlit/DiffuseTransparent',
        },
        COLORS: {
            WHITE: new BS.Vector4(1, 1, 1, 1),
            BUTTON_ACTIVE_FLASH: new BS.Vector4(1, 1, 1, 0.7),
            BUTTON_LOCKED: new BS.Vector4(1, 0, 0, 1),
            BUTTON_UNLOCKED: new BS.Vector4(1, 1, 1, 0.7),
        },
        LAYOUT: {
            DEFAULT_BUTTON_COLLIDER_DEPTH: 0.01,
            HAND_CONTROLS: {
                CONTAINER_POS: new BS.Vector3(0, 0.046, 0.030),
                CONTAINER_SCALE: new BS.Vector3(0.1, 0.1, 0.1),
                CONTAINER_ROT: new BS.Vector4(0.25, 0, 0.8, 1),
                BUTTON_SCALE: new BS.Vector3(0.4, 0.4, 0.4),
                BUTTON_ROT: new BS.Vector3(180, 0, 0)
            }
        },
        ICONS: {
            HOME: "https://firer.at/files/Home.png",
            LOCK: 'https://firer.at/files/lock.png',
        }
    };

    // --- 3. Helper Functions ---
    // (Standalone versions of the class methods from FireScreenInstance.js)

    async function createGeometry(thingy1, geomtype, options = {}) {
        const defaultOptions = { thewidth: 1, theheight: 1, depth: 1, radius: 1, segments: 24 };
        const config = { ...defaultOptions, ...options };
        return await thingy1.AddComponent(new BS.BanterGeometry(geomtype, 0, config.thewidth, config.theheight, config.depth, 1, 1, 1, config.radius, config.segments));
    }

    async function createMaterial(objectThing, options = {}) {
        const shaderName = options.shaderName || CONSTANTS.SHADERS.DEFAULT_TRANSPARENT;
        const texture = options.texture || null;
        const color = options.color || CONSTANTS.COLORS.WHITE;
        return objectThing.AddComponent(new BS.BanterMaterial(shaderName, texture, color, 0, true));
    }

    function createButtonAction(buttonObject, clickHandler) {
        buttonObject.On('click', (e) => { clickHandler(e); });
    }

    function updateButtonColor(buttonObject, revertColour) {
        console.log(`Flashing color for button: ${buttonObject.name}`);
        let material = buttonObject.GetComponent(BS.ComponentType.BanterMaterial);
        material.color = CONSTANTS.COLORS.BUTTON_ACTIVE_FLASH;
        setTimeout(() => { material.color = revertColour; }, 100);
    }
    
    function dispatchButtonClickEvent(buttonName, message) {
        console.log(`Button Clicked: ${buttonName}`, { message, instanceId: testInstanceId });
    }

    function adjustForAll(action, change) {
        console.log(`Broadcasting command to all instances:`, { [action]: change });
    }

    async function createUIButton(name, texture, position, color, parent, clickHandler = null, rotation = null, width = 0.1, height = 0.1, shader = CONSTANTS.SHADERS.DEFAULT_TRANSPARENT, localScale = new BS.Vector3(1, 1, 1)) {
        const buttonObject = await new BS.GameObject(name).Async();
        await createGeometry(buttonObject, BS.GeometryType.PlaneGeometry, { thewidth: width, theheight: height });
        await buttonObject.AddComponent(new BS.BoxCollider(true, new BS.Vector3(0, 0, 0), new BS.Vector3(width, height, CONSTANTS.LAYOUT.DEFAULT_BUTTON_COLLIDER_DEPTH)));
        await createMaterial(buttonObject, { shaderName: shader, texture: texture, color: color });
        const buttonTransform = await buttonObject.AddComponent(new BS.Transform());
        buttonTransform.localScale = localScale;
        buttonTransform.position = position;
        if (rotation instanceof BS.Vector3) { buttonTransform.localEulerAngles = rotation; }
        buttonObject.SetLayer(5);
        await buttonObject.SetParent(parent, false);
        if (clickHandler) { createButtonAction(buttonObject, clickHandler); }
        return buttonObject;
    }

    // --- 4. Main Logic ---
    // (Adapted from _setupHandControls)
    async function createTestHandControls(userId) {
        const handControls = await new BS.GameObject(`handContainer_Test_${testInstanceId}`).Async();

        await createGeometry(handControls, BS.GeometryType.PlaneGeometry);
        await handControls.AddComponent(new BS.BoxCollider(true, new BS.Vector3(0, 0, 0), new BS.Vector3(1, 1, 1)));
        await createMaterial(handControls, { color: new BS.Vector4(0, 0, 0, 0), side: 1 });

        const handTransform = await handControls.AddComponent(new BS.Transform());
        handTransform.localPosition = CONSTANTS.LAYOUT.HAND_CONTROLS.CONTAINER_POS;
        handTransform.localScale = CONSTANTS.LAYOUT.HAND_CONTROLS.CONTAINER_SCALE;
        handTransform.rotation = CONSTANTS.LAYOUT.HAND_CONTROLS.CONTAINER_ROT;

        // Delay attachment to avoid race conditions with hand initialization
        setTimeout(async () => {
            await scene.LegacyAttachObject(handControls, userId, BS.LegacyAttachmentPosition.LEFT_HAND);
        }, 1000);
		
        let playerislocked = false; // Local state for the lock button

        const handButtonConfigs = [
            { name: 'hVolumeUpButton', icon: params['icon-volup-url'], pos: new BS.Vector3(0.4, 0.4, 0.3), color: params['volup-color'], clickHandler: (btn) => { adjustForAll("adjustVolume", 1); updateButtonColor(btn, params['volup-color']); dispatchButtonClickEvent("VolumeUp", 'Hand Volume Up Clicked!'); } },
            { name: 'hVolumeDownButton', icon: params['icon-voldown-url'], pos: new BS.Vector3(0.0, 0.4, 0.3), color: params['voldown-color'], clickHandler: (btn) => { adjustForAll("adjustVolume", -1); updateButtonColor(btn, params['voldown-color']); dispatchButtonClickEvent("VolumeDown", 'Hand Volume Down Clicked!'); } },
            { name: 'hMuteButton', icon: params['icon-mute-url'], pos: new BS.Vector3(-0.4, 0.4, 0.3), color: params['mute-color'], clickHandler: () => {
                adjustForAll("toggleMute", true);
                dispatchButtonClickEvent("Mute", 'Hand Mute Clicked!');
            }},
            { name: 'hLockButton', icon: CONSTANTS.ICONS.LOCK, pos: new BS.Vector3(0, -0.1, 0.3), color: CONSTANTS.COLORS.BUTTON_UNLOCKED, clickHandler: (btn) => { 
                playerislocked = !playerislocked; 
                console.log(`Player lock toggled: ${playerislocked}`);
                playerislocked ? scene.LegacyLockPlayer() : scene.LegacyUnlockPlayer(); 
                btn.GetComponent(BS.ComponentType.BanterMaterial).color = playerislocked ? CONSTANTS.COLORS.BUTTON_LOCKED : CONSTANTS.COLORS.BUTTON_UNLOCKED; 
            }},
            { name: 'hHomeButton', icon: CONSTANTS.ICONS.HOME, pos: new BS.Vector3(0.4, -0.1, 0.3), color: params['button-color'], clickHandler: (btn) => { adjustForAll("goHome", true); updateButtonColor(btn, params['button-color']); dispatchButtonClickEvent("Home", 'Hand Home Clicked!'); } }
        ];

        for (const config of handButtonConfigs) {
            const button = await createUIButton(
                `${config.name}_Test_${testInstanceId}`, 
                config.icon, 
                config.pos, 
                config.color, 
                handControls, 
                () => config.clickHandler(button), // Pass the button itself to the handler
                CONSTANTS.LAYOUT.HAND_CONTROLS.BUTTON_ROT, 
                1, 1, 
                CONSTANTS.SHADERS.DEFAULT_TRANSPARENT, 
                CONSTANTS.LAYOUT.HAND_CONTROLS.BUTTON_SCALE
            );
        }
    }

    // --- 5. Execution ---
    console.log(`Creating test hand controls for user ${userId}...`);
    await createTestHandControls(userId);
    console.log("Test hand controls created successfully.");

})();
