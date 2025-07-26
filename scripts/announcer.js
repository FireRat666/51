// This script was taken from https://vidya.sdq.st/say-names.js and https://best-v-player.glitch.me/say-names.js
function checkForMatchingAnnouncerScripts() {
  const scripts = Array.from(document.getElementsByTagName('script'));
  const matchingScriptFound = scripts.some(script => script.src.startsWith('https://best-v-player.glitch.me/') || script.src.startsWith('https://fire-v-player.glitch.me/') || script.src.startsWith('https://vidya.sdq.st/') );
  return matchingScriptFound;
}

function loadAnnouncerScript(src) {
  // Using dynamic script injection is safer and more standard than fetch + eval.
  // The browser handles loading and execution in a secure context.
  const delay = window.FireScriptLoaded ? 0 : (checkForMatchingAnnouncerScripts() ? 10000 : 0);

  setTimeout(() => {
    const script = document.createElement('script');
    script.src = src;
    script.onload = () => console.log(`Announcer Script executed successfully! YT Detected:${checkForMatchingAnnouncerScripts()}`);
    script.onerror = (error) => console.error("Failed to load the Announcer script:", error);
    document.body.appendChild(script);
  }, delay);
}

if (!window.AnnouncerScriptInitialized && window.isBanter) {
  window.AnnouncerScriptInitialized = true;
  loadAnnouncerScript(`https://51.firer.at/scripts/announcerscripts.js`);
  console.log(`Announcer Script FIRST Call, Should be Loading!!`);
} else { console.log(`Announcer Script Already Called, Should be Loading!!`); }