let buttonObjects = {}; // Store the button objects for toggling visibility

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
textTransform.localPosition = new BS.Vector3(0, 2, -2.5); // Position text display
await textObject.SetParent(keyboardParentObject, false);

// Function to create or retrieve a letter or special character button
async function createOrRetrieveButton(label, position, isSpecial = false, clickHandler = null) {
    // Check if the button already exists
    if (buttonObjects[label]) {
        // Update position and set active if it already exists
        const button = buttonObjects[label];
        const buttonTransform = button.GetComponent(BS.ComponentType.Transform);
        buttonTransform.position = position;
        button.SetActive(true);
        return;
    }

    // Create a new button if it doesn't exist
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
    if (isSpecial) {
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

    await buttonObject.SetParent(keyboardParentObject, false); // Set parent to keyboard for transformation

    // Store the button for later reuse
    buttonObjects[label] = buttonObject;
}

// Function to hide all buttons
function hideAllButtons() {
    for (let label in buttonObjects) {
        buttonObjects[label].SetActive(false);
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

    // Create or retrieve letter buttons
    for (let rowIndex = 0; rowIndex < rows.length; rowIndex++) {
        const row = rows[rowIndex];
        for (let i = 0; i < row.length; i++) {
            const label = row[i];
            const position = new BS.Vector3(startX + i * xOffset, startY + rowIndex * yOffset, 0);
            await createOrRetrieveButton(label, position);
        }
    }

    // Create or retrieve special buttons: Shift, Caps Lock, Special Characters, and Backspace
    await createOrRetrieveButton("Shift", new BS.Vector3(startX + 0 * xOffset, startY + 3 * yOffset, 0), true, toggleShift);
    await createOrRetrieveButton("Caps", new BS.Vector3(startX + 1 * xOffset, startY + 3 * yOffset, 0), true, toggleCapsLock);
    await createOrRetrieveButton("Special", new BS.Vector3(startX + 2 * xOffset, startY + 3 * yOffset, 0), true, toggleSpecialChars);
    await createOrRetrieveButton("Backspace", new BS.Vector3(startX + 9 * xOffset, startY + 0 * yOffset, 0), true, backspaceInputText);
}

// Refresh the keyboard layout by toggling visibility instead of destroying and recreating buttons
async function refreshKeyboard() {
  try {
      // Iterate through all child objects (buttons)
      keyboardParentObject.Traverse((child) => {
          // Ensure it's not the special buttons (Shift, Caps, Special, Backspace) or the parent object itself
          if (child.name !== "Button_Shift" && 
              child.name !== "Button_Caps" && 
              child.name !== "Button_Special" && 
              child.name !== "Button_Backspace" &&
              child !== keyboardParentObject) {
              // Toggle visibility for other buttons
              child.SetActive(false); // Hide all letter buttons initially
          }
      }, true);

      // Now, update the visibility of only the necessary letter buttons based on the current keyboard state
      const rows = [
          getCurrentLetterSet().slice(0, 10),  // Row 1
          getCurrentLetterSet().slice(10, 19), // Row 2
          getCurrentLetterSet().slice(19)      // Row 3
      ];

      let startX = -1.8; // Adjust starting X position as needed
      let startY = 0.5;  // Adjust starting Y position as needed
      let xOffset = 0.25;
      let yOffset = -0.3;

      // Iterate through the letter buttons to make them visible again
      for (let rowIndex = 0; rowIndex < rows.length; rowIndex++) {
          const row = rows[rowIndex];
          for (let i = 0; i < row.length; i++) {
              const label = row[i];
              const position = new BS.Vector3(startX + i * xOffset, startY + rowIndex * yOffset, 0);
              const buttonObject = await keyboardParentObject.Find(`Button_${label}`);

              if (buttonObject) {
                  buttonObject.SetActive(true); // Show letter buttons
                  const buttonTransform = buttonObject.GetComponent(BS.ComponentType.Transform);
                  if (buttonTransform) {
                      buttonTransform.position = position; // Update position for visibility
                  }
              }
          }
      }

  } catch (error) {
      console.error("Error during keyboard refresh:", error);
  }
}


// Initialize the keyboard
createKeyboard();
