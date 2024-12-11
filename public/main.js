navigator?.serviceWorker && init();

async function init() {
    try {
        const registration = await navigator.serviceWorker.register("service-worker.js", {
            scope: location.pathname.substring(0, location.pathname.lastIndexOf('/')) || '/'
        });

        if(registration.sync) {
            registration.sync.register("sync_records");
        } else {
            registration.active.postMessage('sync_records');
        }
    } catch (error) {
        console.error(`Registration failed with ${error}`);
    }
}
