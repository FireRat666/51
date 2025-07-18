async function injectHologramScript() {
  const scriptUrl = "https://hah.firer.at/script.js?position=0 6.09 15.3&rotation=0 0 0&debug=true&instance=example1&deck=main";

  try {
    // 1. "Warm-up" request: Ping the server to wake it up.
    console.log("Waking up the server... ☕");
    // We use { method: 'HEAD' } to be more efficient.
    // We only need to know the server is awake, not download the whole script yet.
    await fetch(scriptUrl, { method: 'HEAD', mode: 'no-cors' });
    console.log("Server is awake! Injecting script...");

    // 2. Inject the script now that the server is ready.
    const hah = document.createElement("script");
    hah.id = "holograms";
    hah.setAttribute("src", scriptUrl);
    document.body.appendChild(hah);

    hah.onload = () => { console.log("Hologram script loaded successfully!"); };
    hah.onerror = () => { console.error("Failed to load the hologram script."); };

  } catch (error) {
    // The fetch itself might fail, though 'no-cors' mode often prevents this.
    // The real check is the script's onerror handler.
    console.error("The warm-up request failed. The script might not load.", error);
  }
}

// Call the function to start the process
injectHologramScript();