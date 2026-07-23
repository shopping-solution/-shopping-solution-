// firebase-messaging-sw.js - Production-ready Service Worker for Firebase Cloud Messaging
importScripts('https://www.gstatic.com/firebasejs/9.23.0/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/9.23.0/firebase-messaging-compat.js');

// Initialize Firebase App inside the Service Worker
// Credentials match the registered project settings
firebase.initializeApp({
  apiKey: "AIzaSyAFHe6JqtR8a2LI7OloK1OSdyNrty_VreU",
  authDomain: "shoppingsolution-65cc7.firebaseapp.com",
  projectId: "shoppingsolution-65cc7",
  storageBucket: "shoppingsolution-65cc7.firebasestorage.app",
  messagingSenderId: "1003951363588",
  appId: "1:1003951363588:web:d86311355e1d4138e04751",
  measurementId: "G-DCC7SWW5GK"
});

const messaging = firebase.messaging();

// Intercept background notifications
messaging.onBackgroundMessage((payload) => {
  console.log('[firebase-messaging-sw.js] Received a background push payload:', payload);

  const title = payload.notification?.title || '🔔 New Order Placed!';
  const options = {
    body: payload.notification?.body || 'Check the admin dashboard for details.',
    icon: '/assets/logo.png', // Fallback to logo or standard app icon
    badge: '/assets/logo.png',
    vibrate: [200, 100, 200],
    data: {
      orderId: payload.data?.orderId,
      url: payload.data?.orderId ? `/admin?orderId=${payload.data.orderId}` : '/admin'
    },
    actions: [
      {
        action: 'open_dashboard',
        title: 'Open Admin Board'
      }
    ]
  };

  self.registration.showNotification(title, options);
});

// Listen for push notification click interaction
self.addEventListener('notificationclick', (event) => {
  console.log('[Service Worker] Notification click received:', event);
  
  event.notification.close();

  const data = event.notification.data || {};
  const orderId = data.orderId;
  const targetUrl = orderId ? `/admin?orderId=${orderId}` : '/admin';

  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then((windowClients) => {
      // 1. Try to find if an Admin Dashboard tab is already running and focus it
      for (let i = 0; i < windowClients.length; i++) {
        const client = windowClients[i];
        const clientUrl = new URL(client.url);
        if (clientUrl.pathname.startsWith('/admin') && 'focus' in client) {
          // Tell the active window to focus this specific order
          if (orderId) {
            client.postMessage({ type: 'SELECT_ORDER', orderId });
          }
          return client.focus();
        }
      }

      // 2. Otherwise open a new tab
      if (clients.openWindow) {
        return clients.openWindow(targetUrl);
      }
    })
  );
});
