// 树洞 Service Worker
const CACHE_NAME = 'treehole-v2';

// 安装时缓存静态资源
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll([
        '/',
        '/index.html',
        '/manifest.json',
        '/icon-192.png',
        '/icon-512.png'
      ]);
    })
  );
});

// 拦截请求：API 请求走网络，静态资源走缓存
self.addEventListener('fetch', (event) => {
  const url = new URL(event.request.url);
  
  // 对 /echo API 请求：只走网络，不缓存（保护隐私）
  if (url.pathname === '/echo') {
    return;
  }
  
  // 对其他请求：缓存优先，网络兜底
  event.respondWith(
    caches.match(event.request).then((cachedResponse) => {
      if (cachedResponse) {
        return cachedResponse;
      }
      return fetch(event.request).then((fetchResponse) => {
        // 只缓存成功的 GET 请求
        if (event.request.method === 'GET' && fetchResponse.status === 200) {
          const responseToCache = fetchResponse.clone();
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(event.request, responseToCache);
          });
        }
        return fetchResponse;
      });
    }).catch(() => {
      // 完全离线时，返回一个简单页面
      if (event.request.mode === 'navigate') {
        return new Response(
          '<html><body style="background:#121212;color:#888;display:flex;align-items:center;justify-content:center;height:100vh;font-family:serif;"><div style="text-align:center;"><div style="font-size:60px;margin-bottom:20px;">🌑</div><p>树洞正在黑暗中休息</p><p style="font-size:14px;color:#555;">连接网络后，它会再次苏醒</p></div></body></html>',
          { headers: { 'Content-Type': 'text/html' } }
        );
      }
    })
  );
});