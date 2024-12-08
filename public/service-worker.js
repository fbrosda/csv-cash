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

self.addEventListener("sync", (event) => {
  if (event.tag == "send-records") {
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
    const data = readData();
    if(data?.length) {
        await Promise.all(data.map(sendRecord));
        clearData();
    }

    function sendRecord(rec) {
        const formData = new FormData();
        for(const key in rec) {
            formData.append(key, rec[key]);
        }
        return fetch('', {
            method: 'POST',
            body: formData
        });
    }
}

async function postPage(request) {
    const formData = await request.formData();
    const response = fetch(request.url, {
        method: 'POST',
        body: formData
    });
    if(response) {
        return response;
    }
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
        const transaction = getTransaction(db, storeName, 'readwrite', resolve, reject);
        const objStore = transaction.objectStore(storeName);
        const req = objStore.add(data);
        req.onerror = (event) => reject(new Error('Cannot write data: ', event.target.error?.message));

    });
}

async function readData() {
    const db = await openDB();
    return new Promise((resolve, reject) => {
        const transaction = getTransaction(db, storeName, 'readonly', resolve, reject);
        const objStore = transaction.objectStore(storeName);
        objStore.getAll().onsuccess = (event) => {
            resolve(event.target.result);
        };
    });
}

async function clearData() {
    const db = await openDB();
    return new Promise((resolve, reject) => {
        const transaction = getTransaction(db, storeName, 'readwrite', resolve, reject);
        const objStore = transaction.objectStore(storeName);
        objStore.clear();
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

function getTransaction(db, name, mode, resolve, reject) {
    const transaction = db.transaction([name], mode);
    transaction.onerror = (event) => reject(new Error('Cannot start transaction: ', event.target.error?.message));
    transaction.oncomplete = () => resolve();
    return transaction;
}

function getCache() {
    return caches.open("v1");
}
