// firebaseNotifications.ts - Web Notification & FCM Token Management
import { initializeApp } from 'firebase/app';
import { getMessaging, getToken, onMessage, Messaging } from 'firebase/messaging';
import firebaseConfig from '../../firebase-applet-config.json';

// Initialize Firebase App
const app = initializeApp(firebaseConfig);

let messaging: Messaging | null = null;
try {
  // getMessaging() might fail if the browser doesn't support FCM (e.g. some private modes)
  messaging = getMessaging(app);
} catch (e) {
  console.warn('[FCM] Firebase Messaging is not supported in this browser context.');
}

// Beautiful notification chime synthesizer using Web Audio API
// Ensures a high-fidelity, lag-free chime plays out-of-the-box on both desktop and mobile
export function playNotificationSound() {
  try {
    const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
    if (!AudioContextClass) return;
    
    const audioCtx = new AudioContextClass();
    const playTone = (freq: number, startTime: number, duration: number) => {
      const osc = audioCtx.createOscillator();
      const gainNode = audioCtx.createGain();
      
      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, startTime);
      
      gainNode.gain.setValueAtTime(0.2, startTime);
      gainNode.gain.exponentialRampToValueAtTime(0.00001, startTime + duration);
      
      osc.connect(gainNode);
      gainNode.connect(audioCtx.destination);
      
      osc.start(startTime);
      osc.stop(startTime + duration);
    };

    const now = audioCtx.currentTime;
    // Elegant major arpeggio chime (C5 -> E5 -> G5 -> C6)
    playTone(523.25, now, 0.5);      // C5
    playTone(659.25, now + 0.1, 0.5);  // E5
    playTone(783.99, now + 0.2, 0.5);  // G5
    playTone(1046.50, now + 0.3, 0.8); // C6
  } catch (err) {
    console.warn('[AUDIO ENGINE] Failed to synthesize notification sound:', err);
  }
}

// Request permission and register token
export async function requestAndRegisterNotificationPermission(vapidKey?: string): Promise<{ token: string | null, error?: string }> {
  if (!('Notification' in window)) {
    console.warn('[NOTIFICATION] This browser does not support notifications.');
    return { token: null, error: 'This browser does not support notifications.' };
  }

  try {
    const permission = await Notification.requestPermission();
    if (permission !== 'granted') {
      console.log('[NOTIFICATION] Permission was denied.');
      return { token: null, error: 'Permission was denied by the user.' };
    }

    if (!messaging) {
      console.warn('[FCM] Messaging service is unavailable.');
      return { token: null, error: 'Messaging service is unavailable in this browser context.' };
    }

    // Default public VAPID key from Firebase console.
    // If not supplied, users can pass their own VAPID key in settings.
    const activeVapidKey = vapidKey || 'BK0-ivfwLVCZu6J7brPGsbe2xIUxZvwmKNyRuCf1x1JYV_lQbznvNHImgDiTaetZIq3j586Sqh1rCkwfUXGq8g0'; 

    console.log('[FCM] Retrieving web registration token...');
    
    // Register the custom service worker explicitly
    if ('serviceWorker' in navigator) {
      await navigator.serviceWorker.register('/firebase-messaging-sw.js');
    }
    const registration = await navigator.serviceWorker.ready;
    const token = await getToken(messaging, {
      vapidKey: activeVapidKey,
      serviceWorkerRegistration: registration,
    });

    if (token) {
      console.log('[FCM] Obtained token successfully:', token.substring(0, 15) + '...');
      
      // Register token to our backend PostgreSQL
      try {
        const response = await fetch('/api/push-tokens', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            token,
            deviceType: /Android|iPhone|iPad/i.test(navigator.userAgent) ? 'mobile' : 'desktop'
          })
        });

        if (response.ok) {
          console.log('[FCM] Push token registered to database successfully.');
          return { token };
        } else {
          console.error('[FCM] Failed to send push token to server.', response.statusText);
          // If we are on Vercel and the backend is missing, it might still have a token
          // We can still return it, but maybe warn
          return { token, error: 'Generated token but failed to register to backend server.' };
        }
      } catch (fetchErr) {
        console.error('Fetch error:', fetchErr);
        return { token, error: 'Generated token but backend server is unreachable.' };
      }
    } else {
      console.warn('[FCM] No registration token returned.');
      return { token: null, error: 'Firebase returned an empty token.' };
    }
  } catch (err: any) {
    console.error('[FCM] Error occurred during notification registration:', err);
    return { token: null, error: err.message || 'Unknown error occurred during getToken' };
  }
}

// Listen for foreground notification pushes when the page is active
export function onForegroundMessage(callback: (payload: any) => void) {
  if (!messaging) return () => {};
  return onMessage(messaging, (payload) => {
    console.log('[FCM] Received foreground notification:', payload);
    playNotificationSound();
    callback(payload);
  });
}
