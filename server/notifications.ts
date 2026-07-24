import * as admin from 'firebase-admin';
import fs from 'fs';
import path from 'path';
import { db } from '../src/db/index.ts';
import { pushTokens, adminNotifications } from '../src/db/schema.ts';
import { eq, desc } from 'drizzle-orm';

// Active SSE client connections for direct in-app admin dashboard synchronization
export const sseClients: any[] = [];

export function registerSseClient(res: any) {
  sseClients.push(res);
  console.log(`[SSE CLIENT] Admin connected. Total live admin dashboards: ${sseClients.length}`);
}

export function unregisterSseClient(res: any) {
  const index = sseClients.indexOf(res);
  if (index !== -1) {
    sseClients.splice(index, 1);
    console.log(`[SSE CLIENT] Admin disconnected. Total live admin dashboards: ${sseClients.length}`);
  }
}

export function broadcastToAdmins(event: string, data: any) {
  sseClients.forEach((client) => {
    try {
      client.write(`event: ${event}\n`);
      client.write(`data: ${JSON.stringify(data)}\n\n`);
    } catch (err) {
      console.error('[SSE BROADCAST ERROR] Failed to stream to client:', err);
    }
  });
}

export const broadcastToClients = broadcastToAdmins;

let firebaseAdminApp: any = null;
let fcmAttempted = false;

export function getFirebaseAdmin() {
  if (firebaseAdminApp) return firebaseAdminApp;
  if (fcmAttempted) return null;

  fcmAttempted = true;
  try {
    const serviceAccountVar = process.env.FIREBASE_SERVICE_ACCOUNT;
    if (serviceAccountVar) {
      const serviceAccount = JSON.parse(serviceAccountVar);
      firebaseAdminApp = admin.initializeApp({
        credential: (admin as any).credential.cert(serviceAccount),
      });
      console.log('[FIREBASE ADMIN] Initialized with FIREBASE_SERVICE_ACCOUNT environment variable.');
    } else {
      const serviceAccountPath = path.join(process.cwd(), 'service-account.json');
      if (fs.existsSync(serviceAccountPath)) {
        const serviceAccount = JSON.parse(fs.readFileSync(serviceAccountPath, 'utf8'));
        firebaseAdminApp = admin.initializeApp({
          credential: (admin as any).credential.cert(serviceAccount),
        });
        console.log('[FIREBASE ADMIN] Initialized with service-account.json file.');
      } else {
        // Fallback or automatic detection based on applet credentials
        const appletConfigPath = path.join(process.cwd(), 'firebase-applet-config.json');
        if (fs.existsSync(appletConfigPath)) {
          console.log('[FIREBASE ADMIN] Found firebase-applet-config.json. Initializing in default mode...');
          firebaseAdminApp = admin.initializeApp({
            projectId: JSON.parse(fs.readFileSync(appletConfigPath, 'utf8')).projectId
          });
        } else {
          console.warn('[FIREBASE ADMIN] No service account credentials found. Push notifications will execute in console fallback mode.');
        }
      }
    }
  } catch (error) {
    console.error('[FIREBASE ADMIN] Failed to initialize Firebase Admin:', error);
  }
  return firebaseAdminApp;
}

export async function sendPushNotification(title: string, body: string, dataPayload: any = {}) {
  try {
    const fcmTokens = await db.select().from(pushTokens);
    if (fcmTokens.length === 0) {
      console.log('[PUSH NOTIFICATION] No registered device tokens in push_tokens database.');
      return;
    }

    const tokens = fcmTokens.map((t) => t.token);
    const app = getFirebaseAdmin();

    if (app) {
      const message = {
        notification: {
          title,
          body,
        },
        data: {
          ...dataPayload,
          click_action: 'FLUTTER_NOTIFICATION_CLICK',
        },
        tokens: tokens,
      };

      const response = await app.messaging().sendEachForMulticast(message);
      console.log(`[PUSH NOTIFICATION] Sent push notification successfully to ${response.successCount} of ${tokens.length} devices.`);
      
      // Automatic cleanup of inactive / invalid device tokens
      if (response.failureCount > 0) {
        const invalidTokens: string[] = [];
        response.responses.forEach((resp, idx) => {
          if (!resp.success) {
            const error = resp.error;
            if (
              error?.code === 'messaging/invalid-registration-token' || 
              error?.code === 'messaging/registration-token-not-registered'
            ) {
              invalidTokens.push(tokens[idx]);
            }
          }
        });

        if (invalidTokens.length > 0) {
          console.log(`[PUSH NOTIFICATION] Revoking ${invalidTokens.length} stale / invalid registration tokens...`);
          for (const token of invalidTokens) {
            await db.delete(pushTokens).where(eq(pushTokens.token, token));
          }
        }
      }
    } else {
      console.log(`[PUSH SIMULATION] Admin device fallback print: Title: "${title}" | Body: "${body}"`);
    }
  } catch (err) {
    console.error('[PUSH NOTIFICATION CRITICAL ERROR] Failed during notification pipeline:', err);
  }
}

export async function triggerOrderNotification(order: any) {
  const customerName = order.customer?.fullName || 'Anonymous';
  const orderId = order.id;
  const totalAmount = order.totalAmount;
  
  let orderTimeStr = 'Just now';
  try {
    orderTimeStr = new Date(order.createdAt).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
  } catch (e) {}

  const title = '🔔 New Order Received!';
  const body = `${customerName} ordered products worth ৳${totalAmount} (ID: ${orderId}) at ${orderTimeStr}`;

  console.log(`[REAL-TIME ALERT BROADCAST] Executing notifications for Order #${orderId}`);

  // 1. Persist notification to PostgreSQL History
  let savedNotification: any = null;
  try {
    const result = await db.insert(adminNotifications).values({
      orderId,
      title,
      body,
      read: false,
    }).returning();
    savedNotification = result[0];
  } catch (err) {
    console.error('[DATABASE ERROR] Failed to save notification history item:', err);
  }

  // 2. Stream to Live Connected Admin Dashboards via Server-Sent Events (SSE)
  broadcastToAdmins('new-order', {
    order,
    notification: savedNotification || {
      id: Date.now(),
      orderId,
      title,
      body,
      createdAt: new Date().toISOString(),
      read: false
    }
  });

  // 3. Dispatch FCM Push Notification to Registered Devices (Mobile / Web Push)
  await sendPushNotification(title, body, {
    orderId,
    type: 'new_order',
    customerName,
    totalAmount: String(totalAmount),
    createdAt: order.createdAt || new Date().toISOString()
  });
}
