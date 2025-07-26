# FireScreen V2 Help & Documentation

Welcome! This guide explains how to install, configure, and interact with FireScreen V2 in your Banter space.

## 1. Installation

To add a FireScreen to your space, simply add a `<script>` tag to your `index.html` file.

```html
<!-- Basic Example -->
<script src="https://51.firer.at/scripts/firescreenv2.js"
        website="https://firer.at/"
        position="2 1.5 6"
        scale="2.5 2.5 1"
        hand-controls="true">
</script>
```

## 2. Configuration Parameters

You can customize each FireScreen instance using attributes on the `<script>` tag.

| Attribute | Default Value | Description |
| :--- | :--- | :--- |
| `website` | `https://firer.at/pages/games.html` | The initial URL the browser will load. |
| `position` | `0 2 0` | The world position of the screen (X Y Z). |
| `rotation` | `0 0 0` | The world rotation of the screen (X Y Z). |
| `scale` | `1 1 1` | The world scale of the screen (X Y Z). |
| `width` | `1024` | The pixel width of the browser surface. |
| `height` | `576` | The pixel height of the browser surface. |
| `hand-controls` | `false` | If `true`, attaches volume and home controls to the user's left hand. |
| `castmode` | `false` | If `true`, simplifies the UI for casting/streaming use cases. Hides most buttons. |
| `space-sync` | `false` | If `true`, the screen will attempt to sync its URL from a space state property named `fireurl`. |
| `disable-interaction` | `false` | If `true`, users cannot click or interact with the browser surface. |
| `disable-rotation` | `false` | If `true`, the screen will not billboard (face) the user. |
| `lock-position` | `false` | If `true`, the screen cannot be grabbed and moved by users. |
| `volumelevel` | `0.25` | The initial volume level (0.0 to 1.0). |
| `backdrop` | `true` | If `true`, shows a dark backdrop behind the screen. |
| `backdrop-color` | `0 0 0 0.9` | The color and alpha of the backdrop (R G B A, 0-1). |
| `button-color` | `0 1 0 1` | The default color for UI buttons (R G B A, 0-1). |
| `custom-button01-url` | `false` | URL for custom button 1. Set to a URL to enable. This button navigates to the URL and does not fire an event. |
| `custom-button01-text`| `Custom Button 01` | Text label for custom button 1. |
| `...` | `...` | Custom buttons 2 through 5 follow the same pattern (`custom-button02-url`, etc.). |

## 3. Advanced Usage

### Listening for Events

You can create custom logic that responds to button clicks on any FireScreen. When a UI or Hand Control button is clicked, a `CustomButtonClick` event is dispatched.

**Note:** This event system does not apply to the custom URL buttons, as they only navigate.
**Recommended Method (using the FireScreenManager):**

This is the safest and most robust way to listen for events. It avoids conflicts with other scripts in the space.

```javascript
// Wait for the manager to be available
const interval = setInterval(() => {
    if (window.fireScreenManager) {
        clearInterval(interval);

        // Add the event listener
        window.fireScreenManager.addEventListener('CustomButtonClick', (event) => {
            console.log('Button clicked on instance:', event.detail.instanceId);
            console.log('Button name:', event.detail.buttonName);
            console.log('Current URL:', event.detail.message);

            if (event.detail.buttonName === 'Home') {
                // Custom action for the home button
                console.log('The Home button was clicked!');
            }
        });
    }
}, 100);
```

**Legacy Method (for backward compatibility):**

This method attaches the listener to the global `document`. It still works but is less recommended for new projects.

```javascript
document.addEventListener('CustomButtonClick', (event) => {
    console.log('--- Detected a Button Click event! ---');
    console.log('Button Name:', event.detail.buttonName);
    console.log('Instance ID:', event.detail.instanceId);
    console.log('Current URL:', event.detail.message);
});
```
### Hand Controls

Setting `hand-controls="true"` attaches a control panel to your left hand for easy access to common functions. These controls are designed to affect **all FireScreens** in the space simultaneously.

| Button | Icon | Action | Event Dispatched |
| :--- | :--- | :--- | :--- |
| **Volume Up** | Volume High | Increases the volume on all FireScreens. | Yes (`VolumeUp`) |
| **Volume Down** | Volume Low | Decreases the volume on all FireScreens. | Yes (`VolumeDown`) |
| **Mute** | Volume Mute | Toggles the mute state on all FireScreens. | Yes (`Mute`) |
| **Home** | Home | Navigates all FireScreens to their home page. | Yes (`Home`) |
| **Lock Player** | Lock | Toggles the Banter "LegacyLockPlayer" state, which prevents you from moving. | No |

### Remote Control (One-Shot Commands)

Space admins can control FireScreens using Banter's `one-shot` system.

**To control a specific screen**, include a `target` property with the screen's ID.
```javascript
// Change URL of screen #2
BS.BanterScene.GetInstance().OneShot(JSON.stringify({
    target: 2,
    fireurl: "https://google.com"
}));
```

**To control all screens at once**, omit the `target` property.
```javascript
// Send all screens home
BS.BanterScene.GetInstance().OneShot(JSON.stringify({
    gohome: true
}));
```

**Available Commands:**

| Command | Value Type | Description |
| :--- | :--- | :--- |
| `fireurl` | `string` | Sets the browser URL. |
| `firevolume` | `number` | Sets the volume directly (0.0 to 1.0). |
| `browseraction`| `string` | Executes a JavaScript string inside the browser. |
| `gohome` | `boolean` | Navigates the browser to its configured home page. |
| `sethome` | `string` | Sets a new home page URL for the browser. |
| `firevolumeup` | `boolean` | Increases the volume for all screens. |
| `firevolumedown`| `boolean` | Decreases the volume for all screens. |
| `firemutetoggle`| `boolean` | Toggles mute for all screens. |

### Space State Synchronization

If you set `space-sync="true"` on a FireScreen, it will automatically try to load its URL from a **public space state property** named `fireurl`.

You can set this property in your space settings or via a script:
```javascript
// Example of setting the synced URL
BS.BanterScene.GetInstance().SetPublicSpaceProps({'fireurl': 'https://bantervr.com/'});
```

This is great for having a primary screen in your world that always shows a specific, easily updatable page.