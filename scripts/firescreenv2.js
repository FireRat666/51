// This script is the main entry point for initializing FireScreens.
// It sets up a manager to handle all screen instances.

if (typeof window.fireScreenV2Initialized === 'undefined' && window.isBanter) {
  window.fireScreenV2Initialized = true;
  console.log("FIRESCREEN_V2: Initializing FireScreen system...");

  // Function to check for conflicting scripts to ensure compatibility.
  function checkForMatchingFireScripts() {
    const scripts = Array.from(document.getElementsByTagName('script'));
    const matchingScriptFound = scripts.some(script =>
      script.src.startsWith('https://best-v-player.glitch.me/') ||
      script.src.startsWith('https://fire-v-player.glitch.me/') ||
      script.src.startsWith('https://vidya.sdq.st/')
    );
    return matchingScriptFound;
  }

  // This function contains the core logic for setting up the FireScreen manager.
  function initializeManager() {
    // Dynamically import the manager to start the process.
    // The '.js' extension is important for ES modules in the browser.
    import('./FireScreenManager.js').then(({ FireScreenManager }) => {

      // Ensure there is only one manager instance.
      if (typeof window.fireScreenManager === 'undefined') {
        window.fireScreenManager = new FireScreenManager();
        console.log("FIRESCREEN_V2: Manager created.");

        // Add the cleanup function to the window
        window.cleanupFireScreenV2 = async function(instanceId) {
            console.log(`FIRESCREEN_V2: Global cleanup called for instance ${instanceId}.`);
            if (window.fireScreenManager) {
                await window.fireScreenManager.cleanup(instanceId);
            } else {
                console.error("FireScreenManager not found.");
            }
        };
      }

      // Initial setup for any screens that might already be in the DOM.
      window.fireScreenManager.setupScreens();

      // Use a MutationObserver to detect when new scripts are added to the page.
      // This is more efficient and reliable than polling with setInterval.
      const observer = new MutationObserver((mutationsList) => {
        for (const mutation of mutationsList) {
          if (mutation.type === 'childList' && mutation.addedNodes.length > 0) {
            // Check if any added nodes are firescreen scripts
            const hasFireScreenScript = Array.from(mutation.addedNodes).some(node =>
              node.tagName === 'SCRIPT' && node.src && node.src.startsWith(window.fireScreenManager.fireScriptName)
            );

            if (hasFireScreenScript) {
              console.log("FIRESCREEN_V2: New screen script detected, running setup...");
              window.fireScreenManager.setupScreens();
            }
          }
        }
      });

      // Start observing the document body for added/removed nodes.
      observer.observe(document.body, { childList: true, subtree: true });
      console.log("FIRESCREEN_V2: MutationObserver is now watching for new screens.");

    }).catch(error => {
      console.error("FIRESCREEN_V2: Failed to load the FireScreenManager module.", error);
    });
  }

  // Calculate delay and start initialization.
  const delay = checkForMatchingFireScripts() ? 10000 : 500;
  console.log(`FIRESCREEN_V2: Delaying initialization by ${delay}ms for compatibility.`);
  setTimeout(initializeManager, delay);
}