self.addEventListener("push", function (event) {
  const data = event.data ? event.data.json() : {};

  const title = data.title || "Kamlaba Garden Sport Club";
  const options = {
    body: data.body || "",
    icon: "/images/logo.jpg", // apna club logo yahan daal sakte hain (192x192 px)
    badge: "/images/logo.jpg",
    vibrate: [200, 100, 200],
  };

  event.waitUntil(self.registration.showNotification(title, options));
});

self.addEventListener("notificationclick", function (event) {
  event.notification.close();
  event.waitUntil(
    clients.openWindow("/dashboard"), // notification click karne par ye page khulega
  );
});
