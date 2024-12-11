const pages = ['.', 'index.php', 'overview.php'];
const resources = [
    'style.css',
    'main.js',
    'favicon.png',
    'manifest.json'
];

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
    } else if(name === 'sync_records') {
        event.waitUntil(sendRecords());
    } else {
        console.log('Unknown event: ', name);
    }
});

self.addEventListener("sync", (event) => {
  if (event.tag == "sync_records") {
    event.waitUntil(sendRecords());
  } else {
      console.log('Unknown event tag: ', event.tag);
  }
});

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

async function postEntries(client) {
    const data = await readData();
    client.postMessage(JSON.stringify(data));
}

async function sendRecords() {
    const data = await readData();
    if(data?.length) {
        try {
            await Promise.all(data.map(sendRecord));
            clearData();
        } catch(e) { }
    }

    function sendRecord(rec) {
        const formData = new FormData();
        for(const key in rec) {
            formData.append(key, rec[key]);
        }
        return fetch('index.php', {
            method: 'POST',
            body: formData
        });
    }
}

async function postPage(request) {
    const formData = await request.formData();
    try {
        return await fetch(request.url, {
            method: 'POST',
            body: formData
        });
    } catch {
        return storeFormLocal(request, formData);
    }
}

async function getPage(request) {
    try {
        const response = await fetch(request);
        await cachePut(request, response);
        return response.clone();
    } catch {
        return cacheGet(request);
    }
}

async function fetchStaticContent(request) {
    const response = await cacheGet(request);
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
    return cacheGet(request);
}

function storeData(data) {
    return new Promise(async (resolve, reject) => {
        const objStore = await getObjectStore('readwrite', resolve, reject);
        const req = objStore.add(data);
        req.onerror = (event) => reject(new Error('Cannot write data: ', event.target.error?.message));

    });
}

function readData() {
    return new Promise(async (resolve, reject) => {
        const objStore = await getObjectStore('readonly', resolve, reject);
        objStore.getAll().onsuccess = (event) => {
            resolve(event.target.result);
        };
    });
}

function clearData() {
    return new Promise(async (resolve, reject) => {
        const objStore = await getObjectStore('readwrite', resolve, reject);
        objStore.clear();
    });
}

async function getObjectStore(mode, resolve, reject) {
    const storeName = 'records';
    const db = await openDB(storeName);
    const transaction = db.transaction([storeName], mode);
    transaction.onerror = (event) => reject(new Error('Cannot start transaction: ', event.target.error?.message));
    transaction.oncomplete = () => resolve();
    return transaction.objectStore(storeName);
}

function openDB(storeName) {
    return new Promise((resolve, reject) => {
        const dbName = 'csv-cash';
        const dbVersion = 1;
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

async function cachePut(request, response) {
    const cache = await getCache();
    await cache.put(request.url, response);
}

async function cacheGet(request) {
    const cache = await getCache();
    return cache.match(request.url);
}

function getCache() {
    return caches.open("v1");
}
