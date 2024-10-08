let buttonLabels = []; // Store the button labels for later destruction

// Constants for setting up the keyboard
const letterButtonSize = new BS.Vector3(0.3, 0.3, 0.3);
const buttonColor = new BS.Vector4(0.1, 0.1, 0.1, 1);
const textColor = new BS.Vector4(1, 1, 1, 1);
const buttonShader = 'Unlit/Diffuse';
const flashColor = new BS.Vector4(1, 1, 1, 0.5);
let isShiftActive = false;
let isCapsLockActive = false;
let isSpecialCharActive = false;

// Create a parent object for the keyboard
const keyboardParentObject = new BS.GameObject("KeyboardParent");
const parentTransform = await keyboardParentObject.AddComponent(new BS.Transform());
parentTransform.localPosition = new BS.Vector3(0, 2, -2); // Adjust keyboard position as needed

// Create text object to display the input
const textObject = new BS.GameObject("InputText");
const inputText = await textObject.AddComponent(new BS.BanterText("", textColor, 0.5, 0, 1));
const textTransform = await textObject.AddComponent(new BS.Transform());
textTransform.localPosition = new BS.Vector3(0, 2, -2); // Position text display
await textObject.SetParent(keyboardParentObject, false);

// Function to create a letter or special character button
async function createLetterButton(label, position) {
    const buttonObject = new BS.GameObject(`Button_${label}`);
    const buttonGeometry = await buttonObject.AddComponent(new BS.BanterGeometry(BS.GeometryType.PlaneGeometry, null, 0.5, 0.5));
    const buttonMaterial = await buttonObject.AddComponent(new BS.BanterMaterial(buttonShader, null, buttonColor));
    const buttonTransform = await buttonObject.AddComponent(new BS.Transform());
    const buttonCollider = await buttonObject.AddComponent(new BS.BoxCollider(true));
    buttonObject.SetLayer(5);

    buttonTransform.position = position;
    buttonTransform.localScale = letterButtonSize;

    // Add text to button
    const textObject = new BS.GameObject(`${label}_Text`);
    const banterText = await textObject.AddComponent(new BS.BanterText(label, textColor));
    const textTransform = await textObject.AddComponent(new BS.Transform());
    textTransform.localPosition = new BS.Vector3(0, 0, 0.01); // Slight offset to avoid z-fighting
    await textObject.SetParent(buttonObject, false);

    // Set button click behavior
    buttonObject.On('click', () => {
        updateInputText(label);
        flashButton(buttonObject);
        console.log(`Button clicked: ${label}`); // Console log for each button press
    });

    await buttonObject.SetParent(keyboardParentObject, false); // Set parent to keyboard for transformation

    // Store the button label for later destruction
    buttonLabels.push(label);
}

// Function to create a special button (like Shift, Caps Lock, etc.)
async function createSpecialButton(label, position, clickHandler) {
    const buttonObject = new BS.GameObject(`Button_${label}`);
    const buttonGeometry = await buttonObject.AddComponent(new BS.BanterGeometry(BS.GeometryType.PlaneGeometry, null, 0.3, 0.2));
    const buttonMaterial = await buttonObject.AddComponent(new BS.BanterMaterial(buttonShader, null, buttonColor));
    const buttonTransform = await buttonObject.AddComponent(new BS.Transform());
    const buttonCollider = await buttonObject.AddComponent(new BS.BoxCollider(true));
    buttonObject.SetLayer(5);

    buttonTransform.position = position;
    buttonTransform.localScale = letterButtonSize;

    // Add text to button
    const textObject = new BS.GameObject(`${label}_Text`);
    const banterText = await textObject.AddComponent(new BS.BanterText(label, textColor));
    const textTransform = await textObject.AddComponent(new BS.Transform());
    textTransform.localPosition = new BS.Vector3(0, 0, 0.01); // Slight offset to avoid z-fighting
    await textObject.SetParent(buttonObject, false);

    // Set button click behavior
    buttonObject.On('click', () => {
        clickHandler();
        flashButton(buttonObject);
        console.log(`Special button clicked: ${label}`); // Console log for each special button
    });

    await buttonObject.SetParent(keyboardParentObject, false); // Set parent to keyboard for transformation

    // Store the button label for later destruction
    buttonLabels.push(label);
}

// Function to destroy buttons by name
async function destroyButtonsByName() {
    try {
        // Loop through the button labels in reverse order
        for (let i = buttonLabels.length - 1; i >= 0; i--) {
            const label = buttonLabels[i];
            const buttonObject = await keyboardParentObject.Find(`Button_${label}`);
            if (buttonObject && buttonObject.Destroy) {
                console.log(`Destroying Button: ${label}`);
                await buttonObject.Destroy(); // Destroy the button
            }
        }

        // Clear the button labels array after destruction
        buttonLabels = [];
    } catch (error) {
        console.error("Error during button destruction by name:", error);
    }
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

// Switch between lowercase and uppercase letters based on shift/caps lock state
function getCurrentLetterSet() {
    const lowercase = "qwertyuiopasdfghjklzxcvbnm";
    const uppercase = "QWERTYUIOPASDFGHJKLZXCVBNM";
    const specialChars = "`~!@#$%^&*()_-+=";

    if (isSpecialCharActive) {
        return specialChars;
    }

    if (isCapsLockActive) {
        return uppercase;
    }

    return isShiftActive ? uppercase : lowercase;
}

// Toggle shift state
function toggleShift() {
    isShiftActive = !isShiftActive;
    refreshKeyboard(); // Re-render the keyboard with the new letter set
}

// Toggle caps lock state
function toggleCapsLock() {
    isCapsLockActive = !isCapsLockActive;
    refreshKeyboard(); // Re-render the keyboard with the new letter set
}

// Switch to special characters
function toggleSpecialChars() {
    isSpecialCharActive = !isSpecialCharActive;
    refreshKeyboard(); // Re-render the keyboard with special characters
}

// Create the entire keyboard layout
async function createKeyboard() {
    const rows = [
        getCurrentLetterSet().slice(0, 10),  // Row 1
        getCurrentLetterSet().slice(10, 19), // Row 2
        getCurrentLetterSet().slice(19)      // Row 3
    ];

    let startX = -1.8; // Adjust starting X position as needed
    let startY = 0.5;  // Adjust starting Y position as needed
    let xOffset = 0.25;
    let yOffset = -0.3;

    // Create letter or special character buttons
    for (let rowIndex = 0; rowIndex < rows.length; rowIndex++) {
        const row = rows[rowIndex];
        for (let i = 0; i < row.length; i++) {
            const label = row[i];
            const position = new BS.Vector3(startX + i * xOffset, startY + rowIndex * yOffset, 0);
            await createLetterButton(label, position);
        }
    }

    // Create special buttons: Shift, Caps Lock, Special Characters, and Backspace
    const shiftPosition = new BS.Vector3(startX + 0 * xOffset, startY + 3 * yOffset, 0);
    const capsLockPosition = new BS.Vector3(startX + 1 * xOffset, startY + 3 * yOffset, 0);
    const specialCharPosition = new BS.Vector3(startX + 2 * xOffset, startY + 3 * yOffset, 0);
    const backspacePosition = new BS.Vector3(startX + 9 * xOffset, startY + 0 * yOffset, 0);

    await createSpecialButton("Shift", shiftPosition, toggleShift);
    await createSpecialButton("Caps", capsLockPosition, toggleCapsLock);
    await createSpecialButton("Special", specialCharPosition, toggleSpecialChars);
    await createSpecialButton("Backspace", backspacePosition, backspaceInputText);
}

// Refresh the keyboard layout (recreate the buttons based on shift, caps lock, or special char state)
async function refreshKeyboard() {
    try {
        // Destroy all buttons by name
        await destroyButtonsByName();

        // Recreate the keyboard with updated button labels
        await createKeyboard();
    } catch (error) {
        console.error("Error during keyboard refresh:", error);
    }
}

// Initialize the keyboard
createKeyboard();
