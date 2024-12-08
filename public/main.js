navigator?.serviceWorker && init();

async function init() {
    try {
        const registration = await navigator.serviceWorker.register("service-worker.js", {
            scope: location.pathname,
        });

        if(registration.sync) {
            registration.sync.register("send-records");
        }
    } catch (error) {
        console.error(`Registration failed with ${error}`);
    }
}
