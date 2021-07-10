'use strict';
const MANIFEST = 'flutter-app-manifest';
const TEMP = 'flutter-temp-cache';
const CACHE_NAME = 'flutter-app-cache';
const RESOURCES = {
  "favicon.png": "4d0f0dd24e16e8faf0f281ac7a6184c7",
"main.dart.js": "3321ef0bce2de9e0e5dfd39ddf81e070",
"index.html": "ac518c6b075c37dd1649e1a509c04bc8",
"/": "ac518c6b075c37dd1649e1a509c04bc8",
"manifest.json": "596707d76693ed5eecba572d1f59f2c7",
"assets/packages/cupertino_icons/assets/CupertinoIcons.ttf": "6d342eb68f170c97609e9da345464e5e",
"assets/packages/wakelock_web/assets/no_sleep.js": "7748a45cd593f33280669b29c2c8919a",
"assets/packages/mdi/fonts/materialdesignicons-webfont.ttf": "3e722fd57a6db80ee119f0e2c230ccff",
"assets/NOTICES": "d40b31a951d7c3d147f5f422941fd9d7",
"assets/FontManifest.json": "2ee1ba824c53a9a789ecf52dbe725a55",
"assets/fonts/MaterialIcons-Regular.otf": "4e6447691c9509f7acdbf8a931a85ca1",
"assets/assets/fonts/Quicksand-Regular.ttf": "216d43ee8707910af457af569eda1dec",
"assets/assets/fonts/Quicksand-Bold.ttf": "0738679df4cf4e566f60343830da7bfa",
"assets/assets/fonts/Quicksand-Medium.ttf": "865b25e449878b6b4d1f9e098ff2f510",
"assets/assets/fonts/Quicksand-SemiBold.ttf": "c82b184bf7450e14adccb7b0d6117474",
"assets/assets/fonts/Quicksand-Light.ttf": "188ca708e4cbbbe3837c3d904b8eeb61",
"assets/assets/icons/misskey.png": "391919b01109e067373dd59f6903f856",
"assets/assets/icons/2.0x/misskey.png": "818ba1a5b1ec7057f336cd1e884681bd",
"assets/assets/icons/2.0x/pleroma.png": "d68faf44e5fcbf434fa350859bcd38f2",
"assets/assets/icons/2.0x/mastodon.png": "d0e6b22c135c34c6272348b1a911b88d",
"assets/assets/icons/4.0x/misskey.png": "a3e092106e38ccd20fd6f923c96011d8",
"assets/assets/icons/4.0x/pleroma.png": "78a367aaa31973cf637ae1ef46c2619d",
"assets/assets/icons/4.0x/mastodon.png": "3fcf81eda3eecef6405722bd5404f2eb",
"assets/assets/icons/pleroma.png": "e42f18d80d5ba7dfe059a32862cd9931",
"assets/assets/icons/mastodon.png": "ef0b1e7ef3f21fbf2687fd4fde361878",
"assets/assets/icons/3.0x/misskey.png": "d9a8263b576f83a86858928c0f90fe6b",
"assets/assets/icons/3.0x/pleroma.png": "b14729e9d1259f27c959a81684b89ddc",
"assets/assets/icons/3.0x/mastodon.png": "d5f1d89766fbe52179fdcf2555ce38a7",
"assets/AssetManifest.json": "78cbc6a2f4436695ec2ad696ce4df1da",
"version.json": "a1e9fd2e7ee061e06c8adbe99a346e30",
"icons/Icon-192.png": "3085b1c8c1d08ac482565de303a22738",
"icons/Icon-512.png": "ce0508068793596479df2fc4e338712c"
};

// The application shell files that are downloaded before a service worker can
// start.
const CORE = [
  "/",
"main.dart.js",
"index.html",
"assets/NOTICES",
"assets/AssetManifest.json",
"assets/FontManifest.json"];
// During install, the TEMP cache is populated with the application shell files.
self.addEventListener("install", (event) => {
  self.skipWaiting();
  return event.waitUntil(
    caches.open(TEMP).then((cache) => {
      return cache.addAll(
        CORE.map((value) => new Request(value, {'cache': 'reload'})));
    })
  );
});

// During activate, the cache is populated with the temp files downloaded in
// install. If this service worker is upgrading from one with a saved
// MANIFEST, then use this to retain unchanged resource files.
self.addEventListener("activate", function(event) {
  return event.waitUntil(async function() {
    try {
      var contentCache = await caches.open(CACHE_NAME);
      var tempCache = await caches.open(TEMP);
      var manifestCache = await caches.open(MANIFEST);
      var manifest = await manifestCache.match('manifest');
      // When there is no prior manifest, clear the entire cache.
      if (!manifest) {
        await caches.delete(CACHE_NAME);
        contentCache = await caches.open(CACHE_NAME);
        for (var request of await tempCache.keys()) {
          var response = await tempCache.match(request);
          await contentCache.put(request, response);
        }
        await caches.delete(TEMP);
        // Save the manifest to make future upgrades efficient.
        await manifestCache.put('manifest', new Response(JSON.stringify(RESOURCES)));
        return;
      }
      var oldManifest = await manifest.json();
      var origin = self.location.origin;
      for (var request of await contentCache.keys()) {
        var key = request.url.substring(origin.length + 1);
        if (key == "") {
          key = "/";
        }
        // If a resource from the old manifest is not in the new cache, or if
        // the MD5 sum has changed, delete it. Otherwise the resource is left
        // in the cache and can be reused by the new service worker.
        if (!RESOURCES[key] || RESOURCES[key] != oldManifest[key]) {
          await contentCache.delete(request);
        }
      }
      // Populate the cache with the app shell TEMP files, potentially overwriting
      // cache files preserved above.
      for (var request of await tempCache.keys()) {
        var response = await tempCache.match(request);
        await contentCache.put(request, response);
      }
      await caches.delete(TEMP);
      // Save the manifest to make future upgrades efficient.
      await manifestCache.put('manifest', new Response(JSON.stringify(RESOURCES)));
      return;
    } catch (err) {
      // On an unhandled exception the state of the cache cannot be guaranteed.
      console.error('Failed to upgrade service worker: ' + err);
      await caches.delete(CACHE_NAME);
      await caches.delete(TEMP);
      await caches.delete(MANIFEST);
    }
  }());
});

// The fetch handler redirects requests for RESOURCE files to the service
// worker cache.
self.addEventListener("fetch", (event) => {
  if (event.request.method !== 'GET') {
    return;
  }
  var origin = self.location.origin;
  var key = event.request.url.substring(origin.length + 1);
  // Redirect URLs to the index.html
  if (key.indexOf('?v=') != -1) {
    key = key.split('?v=')[0];
  }
  if (event.request.url == origin || event.request.url.startsWith(origin + '/#') || key == '') {
    key = '/';
  }
  // If the URL is not the RESOURCE list then return to signal that the
  // browser should take over.
  if (!RESOURCES[key]) {
    return;
  }
  // If the URL is the index.html, perform an online-first request.
  if (key == '/') {
    return onlineFirst(event);
  }
  event.respondWith(caches.open(CACHE_NAME)
    .then((cache) =>  {
      return cache.match(event.request).then((response) => {
        // Either respond with the cached resource, or perform a fetch and
        // lazily populate the cache.
        return response || fetch(event.request).then((response) => {
          cache.put(event.request, response.clone());
          return response;
        });
      })
    })
  );
});

self.addEventListener('message', (event) => {
  // SkipWaiting can be used to immediately activate a waiting service worker.
  // This will also require a page refresh triggered by the main worker.
  if (event.data === 'skipWaiting') {
    self.skipWaiting();
    return;
  }
  if (event.data === 'downloadOffline') {
    downloadOffline();
    return;
  }
});

// Download offline will check the RESOURCES for all files not in the cache
// and populate them.
async function downloadOffline() {
  var resources = [];
  var contentCache = await caches.open(CACHE_NAME);
  var currentContent = {};
  for (var request of await contentCache.keys()) {
    var key = request.url.substring(origin.length + 1);
    if (key == "") {
      key = "/";
    }
    currentContent[key] = true;
  }
  for (var resourceKey of Object.keys(RESOURCES)) {
    if (!currentContent[resourceKey]) {
      resources.push(resourceKey);
    }
  }
  return contentCache.addAll(resources);
}

// Attempt to download the resource online before falling back to
// the offline cache.
function onlineFirst(event) {
  return event.respondWith(
    fetch(event.request).then((response) => {
      return caches.open(CACHE_NAME).then((cache) => {
        cache.put(event.request, response.clone());
        return response;
      });
    }).catch((error) => {
      return caches.open(CACHE_NAME).then((cache) => {
        return cache.match(event.request).then((response) => {
          if (response != null) {
            return response;
          }
          throw error;
        });
      });
    })
  );
}
