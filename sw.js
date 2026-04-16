self.addEventListener('install', () => {
  self.skipWaiting();
});

self.addEventListener('activate', async () => {
  const cacheNames = await caches.keys();
  await Promise.all(cacheNames.map(name => caches.delete(name)));
  await self.clients.claim();
  const clients = await self.clients.matchAll({ type: 'window' });
  clients.forEach(client => client.navigate(client.url));
});
