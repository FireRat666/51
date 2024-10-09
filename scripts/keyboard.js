async function initializeKeyboard() {
  const lowerCaseButtonObjects = {};
  const upperCaseButtonObjects = {};
  const specialCharsButtonObjects = {};

  const letterButtonSize = new BS.Vector3(1, 1, 1);
  const specialButtonSize = new BS.Vector3(0.7, 0.7, 1);
  const buttonColor = new BS.Vector4(0.1, 0.1, 0.1, 1);
  const textColor = new BS.Vector4(1, 1, 1, 1);
  const buttonShader = 'Unlit/Diffuse';
  const flashColor = new BS.Vector4(0.3, 0.3, 0.3, 0.5);
  const textOffset = new BS.Vector3(9.94, -2.38, -0.01); 
  const specialTextOffset = new BS.Vector3(9.8, -2.4, -0.01); 
  let isShiftActive = false;
  let isCapsLockActive = false;
  let isSpecialCharActive = false;

  const keyboardParentObject = new BS.GameObject("KeyboardParent");
  const parentTransform = await keyboardParentObject.AddComponent(new BS.Transform());
  parentTransform.localPosition = new BS.Vector3(0, 2, -0);

  const textObject = new BS.GameObject("InputText");
  const inputText = await textObject.AddComponent(new BS.BanterText("", textColor));
  const textTransform = await textObject.AddComponent(new BS.Transform());
  textTransform.localPosition = new BS.Vector3(8.1, -1, 0);
  await textObject.SetParent(keyboardParentObject, false);

  function updateInputText(label) {
      inputText.text += label;
  }

  function backspaceInputText() {
      if (inputText.text.length > 0) {
          inputText.text = inputText.text.slice(0, -1);
      }
  }

  function toggleShift() {
    isShiftActive = !isShiftActive;
    if (isShiftActive) {
        toggleButtonGroup('uppercase');
    } else {
        toggleButtonGroup('lowercase');
    }
}

  function toggleCapsLock() {
      isCapsLockActive = !isCapsLockActive;
      toggleButtonGroup(isCapsLockActive ? 'uppercase' : 'lowercase');
  }

  function toggleSpecialChars() {
      isSpecialCharActive = !isSpecialCharActive;
      toggleButtonGroup(isSpecialCharActive ? 'special' : 'lowercase');
  }

  function flashButton(buttonObject) {
      const material = buttonObject.GetComponent(BS.ComponentType.BanterMaterial);
      material.color = flashColor;
      setTimeout(() => {
          material.color = buttonColor;
      }, 100);
  }

  async function createButton(label, position, group, clickHandler = null, buttonSize = letterButtonSize, width = 0.3, height = 0.3, offset = textOffset) {
    const buttonObject = new BS.GameObject(`Button_${label}`);
    await buttonObject.AddComponent(new BS.BanterGeometry(BS.GeometryType.PlaneGeometry, null, width, height));
    await buttonObject.AddComponent(new BS.BanterMaterial(buttonShader, null, buttonColor));
    const buttonTransform = await buttonObject.AddComponent(new BS.Transform());
    await buttonObject.AddComponent(new BS.MeshCollider(true));
    buttonObject.SetLayer(5);

    buttonTransform.position = position;
    buttonTransform.localScale = buttonSize;

    const textObject = new BS.GameObject(`${label}_Text`);
    await textObject.AddComponent(new BS.BanterText(label, textColor));
    const textTransform = await textObject.AddComponent(new BS.Transform());
    textTransform.localPosition = offset;
    await textObject.SetParent(buttonObject, false);

    if (clickHandler) {
        buttonObject.On('click', () => {
            clickHandler();
            flashButton(buttonObject);
            console.log(`Special button clicked: ${label}`);
        });
    } else {
        buttonObject.On('click', () => {
            if (isShiftActive) {
                // If Shift is active, add uppercase letter
                updateInputText(label);
                isShiftActive = false; // Deactivate Shift
                toggleButtonGroup('lowercase'); // Switch back to lowercase buttons
            } else {
                // Normal lowercase input
                updateInputText(label);
            }
            flashButton(buttonObject);
            console.log(`Button clicked: ${label}`);
        });
    }

    await buttonObject.SetParent(keyboardParentObject, false);

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

  async function createSpecialButton(label, position, clickHandler, width = 0.8, thisTextOffset = specialTextOffset) {
      await createButton(label, position, 'special', clickHandler, specialButtonSize, width, 0.3, thisTextOffset);
      specialCharsButtonObjects[label].SetActive(true);
  }

  function toggleButtonGroup(showGroup) {
      Object.values(lowerCaseButtonObjects).forEach(button => button.SetActive(showGroup === 'lowercase'));
      Object.values(upperCaseButtonObjects).forEach(button => button.SetActive(showGroup === 'uppercase'));
      Object.values(specialCharsButtonObjects).forEach(button => button.SetActive(showGroup === 'special'));

      specialCharsButtonObjects["Shift"].SetActive(true);
      specialCharsButtonObjects["Caps"].SetActive(true);
      specialCharsButtonObjects["Special"].SetActive(true);
      specialCharsButtonObjects["Backspace"].SetActive(true);
  }

  async function createKeyboard() {
      const numbers = "1234567890";
      const lowercase = "qwertyuiopasdfghjklzxcvbnm";
      const uppercase = "QWERTYUIOPASDFGHJKLZXCVBNM";
      const specialChars = "`~!@#$%^&*()_-+=[]{};:'\",.<>/\\?";

      let startX = -1.8;
      let startY = 0.5;
      let xOffset = 0.4;
      let yOffset = -0.4;

      // Create number buttons at the top row
      for (let i = 0; i < numbers.length; i++) {
          const label = numbers[i];
          const position = new BS.Vector3(startX + (i % 10) * xOffset, (startY + 0.4), 0);
          await createButton(label, position, 'number'); // Create number buttons
      }

      // Create lowercase buttons
      for (let i = 0; i < lowercase.length; i++) {
        const label = lowercase[i];
        let position;
        
        if (i < 10) {
            position = new BS.Vector3(startX + i * xOffset, startY, 0); // First row
        } else if (i < 19) {
            position = new BS.Vector3(startX + (i - 10) * xOffset, startY + yOffset, 0); // Second row
        } else {
            position = new BS.Vector3(startX + (i - 19) * xOffset, startY + 2 * yOffset, 0); // Third row
        }
        
        await createButton(label, position, 'lowercase');
    }

      // Create uppercase buttons
      for (let i = 0; i < uppercase.length; i++) {
        const label = uppercase[i];
        let position;
    
        if (i < 10) {
            position = new BS.Vector3(startX + i * xOffset, startY, 0); // First row
        } else if (i < 19) {
            position = new BS.Vector3(startX + (i - 10) * xOffset, startY + yOffset, 0); // Second row
        } else {
            position = new BS.Vector3(startX + (i - 19) * xOffset, startY + 2 * yOffset, 0); // Third row
        }
    
        await createButton(label, position, 'uppercase');
    }

      // Create special characters buttons
      for (let i = 0; i < specialChars.length; i++) {
          const label = specialChars[i];
          let position;
      
          if (i < 10) {
              position = new BS.Vector3(startX + i * xOffset, startY, 0); // First row
          } else if (i < 21) {
              position = new BS.Vector3(startX+ (i - 10) * xOffset, startY + yOffset, 0); // Second row
          } else {
              position = new BS.Vector3(startX + (i - 21) * xOffset, startY + 2 * yOffset, 0); // Third row
          }

          const position2 = new BS.Vector3((startX - 0.4) + (i % 11) * xOffset, startY + Math.floor(i / 11) * yOffset, 0);
          await createButton(label, position, 'special');
      }

      // Create special buttons: Shift, Caps Lock, Special Characters, and Backspace
      await createSpecialButton("Shift", new BS.Vector3(startX + 0.03, startY + 3 * yOffset, 0), toggleShift);
      await createSpecialButton("Caps", new BS.Vector3(startX + 0.21 + xOffset, startY + 3 * yOffset, 0), toggleCapsLock);
      await createSpecialButton("Special", new BS.Vector3(startX + 0.8 + xOffset, startY + 3 * yOffset, 0), toggleSpecialChars, 0.8, new BS.Vector3(9.65, -2.4, -0.01));
      await createSpecialButton("Backspace", new BS.Vector3(startX + 10.8 * xOffset, startY, 0), backspaceInputText, 1.2, new BS.Vector3(9.5, -2.4, -0.01));

      // Default to showing lowercase letters
      toggleButtonGroup('lowercase');
  }

  await createKeyboard();
}

// Call the function to initialize the keyboard
initializeKeyboard();
