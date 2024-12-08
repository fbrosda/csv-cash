const pages = ['.', 'index.php', 'overview.php'];
const resources = [
    'style.css',
    'main.js',
    'favicon.png',
    'manifest.json'
];
const dbName = 'csv-cash';
const dbVersion = 1;
const storeName = 'records';


self.addEventListener("install", (event) => {
    event.waitUntil(addResourcesToCache(pages.concat(resources)));
});

self.addEventListener("fetch", (event) => {
    event.respondWith(fetchWithCach(event.request));
});

self.addEventListener("message", (event) => {
    const name = event.data;
    if(name === 'get_entries') {
        postEntries(event.source);
    } else {
        console.log('Unknown event: ', name);
    }
});

async function postEntries(client) {
    const data = await readData();
    client.postMessage(JSON.stringify(data));
}

async function addResourcesToCache(resources) {
    const cache = await getCache();
    await cache.addAll(resources);
}

async function fetchWithCach(request) {
    const isPage = request.url.endsWith('/') || pages.some(p => request.url.endsWith(p));
    if(isPage) {
        if(request.method === 'POST') {
            return postPage(request);
        }
        return getPage(request);
    }
    return fetchStaticContent(request);
}

async function postPage(request) {
    const formData = await request.formData();
    // const response = fetch(request.url, {
    //     method: 'POST',
    //     body: formData
    // });
    // if(response) {
    //     return response;
    // }
    return storeFormLocal(request, formData);
}

async function getPage(request) {
    const response = await fetch(request);
    if(response) {
        cacheAdd(request, response);
        return response;
    }
    return caches.match(request);
}

async function fetchStaticContent(request) {
    const response = await caches.match(request);
    return response || fetch(request);
}

async function storeFormLocal(request, formData) {
    const data = {};
    formData.entries().forEach(e => (data[e[0]] = e[1]));
    try {
        await storeData(data);
    } catch (e) {
        console.error(e);
    }

    const cache = await getCache();
    return cache.match(request.url);
}

async function cacheAdd(request, response) {
    const cache = await getCache();
    await cache.put(request, response);
}

async function storeData(data) {
    const db = await openDB();
    return new Promise((resolve, reject) => {
        const transaction = db.transaction([storeName], 'readwrite');
        transaction.onerror = (event) => reject(new Error('Cannot start tranaction: ', event.target.error?.message));
        transaction.oncomplete = () => resolve();

        const objStore = transaction.objectStore(storeName);
        const req = objStore.add(data);
        req.onerror = (event) => reject(new Error('Cannot write data: ', event.target.error?.message));

    });
}

async function readData() {
    const db = await openDB();
    const res = [];
    return new Promise((resolve, reject) => {
        const transaction = db.transaction([storeName]);
        transaction.onerror = (event) => reject(new Error('Cannot start tranaction: ', event.target.error?.message));
        transaction.oncomplete = (event) => resolve();

        const objStore = transaction.objectStore(storeName);
        objStore.openCursor().onsuccess = (event) => {
            const cursor = event.target.result;
            if (cursor) {
                res.push(cursor.value);
                cursor.continue();
            } else {
                resolve(res);
            }
        };
    });
}

function openDB() {
    return new Promise((resolve, reject) => {
        const req = indexedDB.open(dbName, dbVersion);
        req.onerror = (event) => {
            reject(new Error('Cannot open db: ', event.target.error?.message));
        };
        req.onupgradeneeded = (event) => {
            const db = event.target.result;
            db.createObjectStore(storeName, { autoIncrement: true });
        }
        req.onsuccess = (event) => {
            resolve(event.target.result);
        };
    });
}

function getCache() {
    return caches.open("v1");
}
