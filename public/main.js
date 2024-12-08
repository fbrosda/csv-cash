(async function registerServiceWorker() {
    if('serviceWorker' in navigator) {
        try {
            await navigator.serviceWorker.register("service-worker.js", {
                scope: location.pathname,
            });
        } catch (error) {
            console.error(`Registration failed with ${error}`);
        }
    }
})();
