// This script was taken from https://vidya.sdq.st/say-names.js and https://best-v-player.glitch.me/say-names.js
async function loadAndExecuteAnnouncerScript(src) {
  try {
    const response = await fetch(src);
    const scriptContent = await response.text();
    
    eval(scriptContent);
    console.log("Script executed successfully!");
  } catch (error) {
    console.error("Failed to load or execute the script:", error);
  }
}

setTimeout(() => { loadAndExecuteAnnouncerScript(`https://51.firer.at/scripts/announcerscripts.js`); }, 1000);