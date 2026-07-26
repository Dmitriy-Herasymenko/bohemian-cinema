self.addEventListener("push", (event) => {
  const data = event.data?.json() || { title: "Bohemian Cinema", body: "Нове кіно додано!" };
  event.waitUntil(
    self.registration.showNotification(data.title, {
      body: data.body,
      icon: "/popcorn.png",
      badge: "/popcorn.png",
      data: data.url || "/",
      vibrate: [200, 100, 200],
    })
  );
});

self.addEventListener("notificationclick", (event) => {
  event.notification.close();
  const url = event.notification.data || "/";
  event.waitUntil(
    clients.matchAll({ type: "window", includeUncontrolled: true }).then((windowClients) => {
      for (const client of windowClients) {
        if (client.url.includes(self.location.origin) && "focus" in client) {
          client.navigate(url);
          return client.focus();
        }
      }
      return clients.openWindow(url);
    })
  );
});
