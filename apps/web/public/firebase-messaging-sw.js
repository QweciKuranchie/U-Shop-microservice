// Firebase Messaging Service Worker
// Handles background push notifications for UShop
// This file is intentionally separate from public/sw.js (PWA caching worker)

importScripts("https://www.gstatic.com/firebasejs/10.12.0/firebase-app-compat.js");
importScripts("https://www.gstatic.com/firebasejs/10.12.0/firebase-messaging-compat.js");

self.addEventListener("message", (event) => {
  if (event.data && event.data.type === "FIREBASE_CONFIG") {
    if (!firebase.apps.length) {
      firebase.initializeApp(event.data.config);
      firebase.messaging();
    }
  }
});

// Background message handler
self.addEventListener("push", (event) => {
  if (!event.data) return;

  let payload;
  try {
    payload = event.data.json();
  } catch {
    payload = { notification: { title: "UShop", body: event.data.text() } };
  }

  const notification = payload.notification || {};
  const data = payload.data || {};

  const options = {
    body: notification.body || "",
    icon: notification.icon || "/icons/icon-192x192.png",
    badge: "/icons/badge-72x72.png",
    data: { actionUrl: data.actionUrl || "/" },
  };

  event.waitUntil(
    self.registration.showNotification(notification.title || "UShop", options)
  );
});

// Notification click handler
self.addEventListener("notificationclick", (event) => {
  event.notification.close();
  const actionUrl = event.notification.data?.actionUrl || "/";

  event.waitUntil(
    clients.matchAll({ type: "window", includeUncontrolled: true }).then((clientList) => {
      for (const client of clientList) {
        if (client.url === actionUrl && "focus" in client) {
          return client.focus();
        }
      }
      if (clients.openWindow) {
        return clients.openWindow(actionUrl);
      }
    })
  );
});
