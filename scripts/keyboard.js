let lowerCaseButtonObjects = {};
let upperCaseButtonObjects = {};
let specialCharsButtonObjects = {};

// Constants for setting up the keyboard
const letterButtonSize = new BS.Vector3(0.3, 0.3, 1);
const specialButtonSize = new BS.Vector3(0.3, 0.3, 1);
const buttonColor = new BS.Vector4(0.1, 0.1, 0.1, 1);
const textColor = new BS.Vector4(1, 1, 1, 1);
const buttonShader = 'Unlit/Diffuse';
const flashColor = new BS.Vector4(0.3, 0.3, 0.3, 0.5);
const textOffset = new BS.Vector3(9.95, -2.4, -0.01); 
const specialTextOffset = new BS.Vector3(9.8, -2.4, -0.01); 
let isShiftActive = false;
let isCapsLockActive = false;
let isSpecialCharActive = false;

// Create a parent object for the keyboard
const keyboardParentObject = new BS.GameObject("KeyboardParent");
const parentTransform = await keyboardParentObject.AddComponent(new BS.Transform());
parentTransform.localPosition = new BS.Vector3(0, 2, -2);

// Create text object to display the input
const textObject = new BS.GameObject("InputText");
const inputText = await textObject.AddComponent(new BS.BanterText("", textColor, 0.5, 0, 1));
const textTransform = await textObject.AddComponent(new BS.Transform());
textTransform.localPosition = new BS.Vector3(8.2, -1.4, 0);
await textObject.SetParent(keyboardParentObject, false);

// Function to create a button with the correct text offset
async function createButton(label, position, group, clickHandler = null, buttonSize = letterButtonSize, width = 0.5, offset = textOffset) {
    const buttonObject = new BS.GameObject(`Button_${label}`);
    await buttonObject.AddComponent(new BS.BanterGeometry(BS.GeometryType.PlaneGeometry, null, width, 0.5));
    await buttonObject.AddComponent(new BS.BanterMaterial(buttonShader, null, buttonColor));
    const buttonTransform = await buttonObject.AddComponent(new BS.Transform());
    await buttonObject.AddComponent(new BS.BoxCollider(true, new BS.Vector3(0,0,0), buttonSize));
    buttonObject.SetLayer(5);

    buttonTransform.position = position;
    buttonTransform.localScale = buttonSize;

    // Correct the text offset as specified
    const textObject = new BS.GameObject(`${label}_Text`);
    await textObject.AddComponent(new BS.BanterText(label, textColor));
    const textTransform = await textObject.AddComponent(new BS.Transform());
    textTransform.localPosition = offset;
    await textObject.SetParent(buttonObject, false);

    // Set click behavior if provided
    if (clickHandler) {
        buttonObject.On('click', () => {
            clickHandler();
            flashButton(buttonObject);
            console.log(`Special button clicked: ${label}`);
        });
    } else {
        buttonObject.On('click', () => {
            updateInputText(label);
            flashButton(buttonObject);
            console.log(`Button clicked: ${label}`);
        });
    }

    await buttonObject.SetParent(keyboardParentObject, false);

    // Store the button in the appropriate group
    if (group === 'lowercase') {
        lowerCaseButtonObjects[label] = buttonObject;
    } else if (group === 'uppercase') {
        upperCaseButtonObjects[label] = buttonObject;
        buttonObject.SetActive(false);
    } else if (group === 'special') {
        specialCharsButtonObjects[label] = buttonObject;
        buttonObject.SetActive(false);
    }
}

// Function to create special buttons with behavior
async function createSpecialButton(label, position, clickHandler) {
    await createButton(label, position, 'special', clickHandler, specialButtonSize, 0.8, specialTextOffset);
    specialCharsButtonObjects[label].SetActive(true); // Ensure special buttons are always visible
}

// Function to toggle visibility of button groups
function toggleButtonGroup(showGroup) {
    Object.values(lowerCaseButtonObjects).forEach(button => button.SetActive(showGroup === 'lowercase'));
    Object.values(upperCaseButtonObjects).forEach(button => button.SetActive(showGroup === 'uppercase'));
    Object.values(specialCharsButtonObjects).forEach(button => button.SetActive(showGroup === 'special'));

    // Ensure the special control buttons are always visible
    specialCharsButtonObjects["Shift"].SetActive(true);
    specialCharsButtonObjects["Caps"].SetActive(true);
    specialCharsButtonObjects["Special"].SetActive(true);
    specialCharsButtonObjects["Backspace"].SetActive(true);
}

// Update the input text when a letter is clicked
function updateInputText(label) {
    inputText.text += label;
}

// Remove the last character from the input text (for backspace)
function backspaceInputText() {
    if (inputText.text.length > 0) {
        inputText.text = inputText.text.slice(0, -1);
    }
}

// Flash button to provide feedback
function flashButton(buttonObject) {
    const material = buttonObject.GetComponent(BS.ComponentType.BanterMaterial);
    material.color = flashColor;
    setTimeout(() => {
        material.color = buttonColor;
    }, 100);
}

// Toggle shift state
function toggleShift() {
    isShiftActive = !isShiftActive;
    toggleButtonGroup(isShiftActive ? 'uppercase' : 'lowercase');
}

// Toggle caps lock state
function toggleCapsLock() {
    isCapsLockActive = !isCapsLockActive;
    toggleButtonGroup(isCapsLockActive ? 'uppercase' : 'lowercase');
}

// Switch to special characters
function toggleSpecialChars() {
    isSpecialCharActive = !isSpecialCharActive;
    toggleButtonGroup(isSpecialCharActive ? 'special' : 'lowercase');
}

// Create the entire keyboard layout
async function createKeyboard() {
    const lowercase = "qwertyuiopasdfghjklzxcvbnm";
    const uppercase = "QWERTYUIOPASDFGHJKLZXCVBNM";
    const specialChars = "`~!@#$%^&*()_-+=";

    let startX = -1.8;
    let startY = 0.5;
    let xOffset = 0.25;
    let yOffset = -0.3;

    // Create lowercase buttons
    for (let i = 0; i < lowercase.length; i++) {
        const label = lowercase[i];
        const position = new BS.Vector3(startX + (i % 10) * xOffset, startY + Math.floor(i / 10) * yOffset, 0);
        await createButton(label, position, 'lowercase');
    }

    // Create uppercase buttons
    for (let i = 0; i < uppercase.length; i++) {
        const label = uppercase[i];
        const position = new BS.Vector3(startX + (i % 10) * xOffset, startY + Math.floor(i / 10) * yOffset, 0);
        await createButton(label, position, 'uppercase');
    }

    // Create special characters buttons
    for (let i = 0; i < specialChars.length; i++) {
        const label = specialChars[i];
        const position = new BS.Vector3(startX + (i % 10) * xOffset, startY + Math.floor(i / 10) * yOffset, 0);
        await createButton(label, position, 'special');
    }

    // Create special buttons: Shift, Caps Lock, Special Characters, and Backspace
    await createSpecialButton("Shift", new BS.Vector3(startX + 0.03, startY + 3 * yOffset, 0), toggleShift);
    await createSpecialButton("Caps", new BS.Vector3(startX + 0.14 + xOffset, startY + 3 * yOffset, 0), toggleCapsLock);
    await createSpecialButton("Special", new BS.Vector3(startX + 0.5 + xOffset, startY + 3 * yOffset, 0), toggleSpecialChars);
    await createSpecialButton("Backspace", new BS.Vector3(startX + 10.5 * xOffset, startY, 0), backspaceInputText);

    // Default to showing lowercase letters
    toggleButtonGroup('lowercase');
}

// Initialize the keyboard
createKeyboard();
