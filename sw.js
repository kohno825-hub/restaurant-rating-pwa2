// Service Worker - オフライン対応とキャッシュ管理
const CACHE_NAME = 'restaurant-rating-v1';
const urlsToCache = [
  './',
  './index.html',
  './style.css',
  './app.js',
  './manifest.json',
  'https://fonts.googleapis.com/icon?family=Material+Icons'
];

// インストール時にキャッシュを作成
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        console.log('キャッシュを開きました');
        return cache.addAll(urlsToCache);
      })
  );
});

// 古いキャッシュを削除
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cacheName => {
          if (cacheName !== CACHE_NAME) {
            console.log('古いキャッシュを削除:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
});

// フェッチイベントの処理
self.addEventListener('fetch', event => {
  // GAS APIへのリクエストはキャッシュしない
  if (event.request.url.includes('script.google.com')) {
    event.respondWith(
      fetch(event.request)
        .then(response => {
          return response;
        })
        .catch(() => {
          // オフライン時のエラーハンドリング
          return new Response(JSON.stringify({
            error: 'オフラインです。インターネット接続を確認してください。'
          }), {
            headers: { 'Content-Type': 'application/json' }
          });
        })
    );
    return;
  }

  // その他のリクエストはキャッシュファーストで処理
  event.respondWith(
    caches.match(event.request)
      .then(response => {
        // キャッシュがあればそれを返す
        if (response) {
          return response;
        }
        
        // なければネットワークから取得
        return fetch(event.request).then(response => {
          // 有効なレスポンスでない場合はそのまま返す
          if (!response || response.status !== 200 || response.type !== 'basic') {
            return response;
          }

          // レスポンスをクローンしてキャッシュに保存
          const responseToCache = response.clone();
          caches.open(CACHE_NAME)
            .then(cache => {
              cache.put(event.request, responseToCache);
            });

          return response;
        });
      })
  );
});

// バックグラウンド同期の処理（将来の拡張用）
self.addEventListener('sync', event => {
  if (event.tag === 'sync-ratings') {
    event.waitUntil(syncRatings());
  }
});

async function syncRatings() {
  // オフライン時に保存された評価を同期する処理
  // 将来の実装用のプレースホルダー
  console.log('評価の同期処理');
}
