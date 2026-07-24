import express from 'express';
import path from 'path';
import { createServer as createViteServer } from 'vite';
import { eq, desc } from 'drizzle-orm';
import { db } from './src/db/index.ts';
import { products, orders, siteSettings, users, pushTokens, adminNotifications, reviews, pageViews } from './src/db/schema.ts';
import { INITIAL_PRODUCTS, INITIAL_SITE_SETTINGS } from './src/data/initialProducts.ts';
import { createCourierConsignment, getLiveCourierStatus } from './server/couriers';
import { triggerOrderNotification, registerSseClient, unregisterSseClient, sendPushNotification, broadcastToClients } from './server/notifications.ts';


async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json({ limit: '10mb' }));

  // Helper to ensure database is seeded if empty
  const ensureSeeded = async () => {
    try {
      console.log('Syncing default products into Cloud SQL...');
      for (const p of INITIAL_PRODUCTS) {
        await db.insert(products).values(p).onConflictDoNothing();
      }

      const existingSettings = await db.select().from(siteSettings);
      if (existingSettings.length === 0) {
        console.log('Seeding initial site settings into Cloud SQL...');
        await db.insert(siteSettings).values({
          id: 'default',
          ...INITIAL_SITE_SETTINGS,
        }).onConflictDoNothing();
      }
    } catch (e) {
      console.error('Error auto-seeding database:', e);
    }
  };

  // Run initial seed check
  await ensureSeeded();

  // --- API ROUTES ---

  // Disable HTTP caching for all API routes to ensure real-time fresh data
  app.use('/api', (req, res, next) => {
    res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
    res.setHeader('Pragma', 'no-cache');
    res.setHeader('Expires', '0');
    next();
  });

  // Health check
  app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', database: 'cloudsql' });
  });

// Helper for Bangladesh (Asia/Dhaka) date calculation
function getBDDateStr(date = new Date()): string {
  try {
    return new Intl.DateTimeFormat('en-CA', { timeZone: 'Asia/Dhaka' }).format(date);
  } catch (e) {
    return date.toISOString().split('T')[0];
  }
}

async function getAnalyticsStatsHelper() {
  const allViews = await db.select().from(pageViews);
  const now = new Date();
  const todayBD = getBDDateStr(now);

  const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
  const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

  const todayViews = allViews.filter((v) => {
    if (v.dateStr === todayBD) return true;
    if (v.createdAt) {
      return getBDDateStr(new Date(v.createdAt)) === todayBD;
    }
    return false;
  });

  const weekViews = allViews.filter((v) => v.createdAt && new Date(v.createdAt) >= sevenDaysAgo);
  const monthViews = allViews.filter((v) => v.createdAt && new Date(v.createdAt) >= thirtyDaysAgo);

  const todayUnique = new Set(todayViews.map((v) => v.visitorId)).size;
  const weekUnique = new Set(weekViews.map((v) => v.visitorId)).size;
  const monthUnique = new Set(monthViews.map((v) => v.visitorId)).size;
  const totalUnique = new Set(allViews.map((v) => v.visitorId)).size;

  return {
    today: { unique: todayUnique, views: todayViews.length },
    week: { unique: weekUnique, views: weekViews.length },
    month: { unique: monthUnique, views: monthViews.length },
    total: { unique: totalUnique, views: allViews.length },
  };
}

  // Track page view / visitor entry
  app.post('/api/analytics/track', async (req, res) => {
    try {
      const { visitorId } = req.body;
      if (!visitorId) {
        return res.status(400).json({ error: 'visitorId is required' });
      }

      const now = new Date();
      const dateStr = getBDDateStr(now);

      await db.insert(pageViews).values({
        visitorId,
        createdAt: now,
        dateStr,
      });

      // Broadcast live updated stats to active Admin Dashboards
      getAnalyticsStatsHelper().then((stats) => {
        broadcastToClients('analytics-updated', stats);
      }).catch(() => {});

      res.json({ success: true });
    } catch (error: any) {
      console.error('Failed to log visitor view:', error);
      res.status(500).json({ error: 'Failed to log visitor view' });
    }
  });

  // Get Visitor Analytics Stats for Admin Dashboard
  app.get('/api/analytics/stats', async (req, res) => {
    try {
      const stats = await getAnalyticsStatsHelper();
      res.json(stats);
    } catch (error: any) {
      console.error('Failed to calculate analytics stats:', error);
      res.status(500).json({ error: 'Failed to calculate analytics stats' });
    }
  });

  // Get all products
  app.get('/api/products', async (req, res) => {
    try {
      const allProducts = await db.select().from(products);
      res.json(allProducts);
    } catch (error: any) {
      console.error('Failed to fetch products from Cloud SQL:', error);
      res.status(500).json({ error: 'Failed to fetch products' });
    }
  });

  // Create or Update a product
  app.post('/api/products', async (req, res) => {
    try {
      const prodData = req.body;
      if (!prodData.id || !prodData.name) {
        return res.status(400).json({ error: 'Missing required product fields' });
      }

      const result = await db
        .insert(products)
        .values({
          id: prodData.id,
          name: prodData.name,
          nameBn: prodData.nameBn || null,
          gender: prodData.gender,
          category: prodData.category,
          price: Number(prodData.price),
          oldPrice: prodData.oldPrice ? Number(prodData.oldPrice) : null,
          discountPercent: prodData.discountPercent ? Number(prodData.discountPercent) : null,
          description: prodData.description,
          descriptionBn: prodData.descriptionBn || null,
          images: prodData.images || [],
          colors: prodData.colors || [],
          sizes: prodData.sizes || [],
          stock: Number(prodData.stock),
          inStock: Boolean(prodData.inStock),
          isTrending: Boolean(prodData.isTrending),
          isBestSelling: Boolean(prodData.isBestSelling),
          isNewAdded: Boolean(prodData.isNewAdded),
          createdAt: prodData.createdAt || new Date().toISOString(),
        })
        .onConflictDoUpdate({
          target: products.id,
          set: {
            name: prodData.name,
            nameBn: prodData.nameBn || null,
            gender: prodData.gender,
            category: prodData.category,
            price: Number(prodData.price),
            oldPrice: prodData.oldPrice ? Number(prodData.oldPrice) : null,
            discountPercent: prodData.discountPercent ? Number(prodData.discountPercent) : null,
            description: prodData.description,
            descriptionBn: prodData.descriptionBn || null,
            images: prodData.images || [],
            colors: prodData.colors || [],
            sizes: prodData.sizes || [],
            stock: Number(prodData.stock),
            inStock: Boolean(prodData.inStock),
            isTrending: Boolean(prodData.isTrending),
            isBestSelling: Boolean(prodData.isBestSelling),
            isNewAdded: Boolean(prodData.isNewAdded),
          },
        })
        .returning();

      const savedProduct = result[0];
      broadcastToClients('product-updated', savedProduct);
      res.json(savedProduct);
    } catch (error: any) {
      console.error('Failed to save product to Cloud SQL:', error);
      res.status(500).json({ error: 'Failed to save product' });
    }
  });

  // Delete product
  app.delete('/api/products/:id', async (req, res) => {
    try {
      const { id } = req.params;
      await db.delete(products).where(eq(products.id, id));
      broadcastToClients('product-deleted', { id });
      res.json({ success: true, id });
    } catch (error: any) {
      console.error('Failed to delete product from Cloud SQL:', error);
      res.status(500).json({ error: 'Failed to delete product' });
    }
  });

  // Get all reviews for a product
  app.get('/api/reviews/:productId', async (req, res) => {
    try {
      const { productId } = req.params;
      const productReviews = await db
        .select()
        .from(reviews)
        .where(eq(reviews.productId, productId));
      res.json(productReviews);
    } catch (error: any) {
      console.error('Failed to fetch reviews from Cloud SQL:', error);
      res.status(500).json({ error: 'Failed to fetch reviews' });
    }
  });

  // Create a new review
  app.post('/api/reviews', async (req, res) => {
    try {
      const { productId, reviewerName, reviewerMessage, reviewerRating, reviewerImage } = req.body;
      if (!productId || !reviewerName || !reviewerMessage) {
        return res.status(400).json({ error: 'Missing required review fields' });
      }

      const result = await db
        .insert(reviews)
        .values({
          productId,
          reviewerName,
          reviewerMessage,
          reviewerRating: Number(reviewerRating || 5),
          reviewerImage: reviewerImage || null,
          createdAt: new Date().toISOString(),
        })
        .returning();

      res.json(result[0]);
    } catch (error: any) {
      console.error('Failed to save review to Cloud SQL:', error);
      res.status(500).json({ error: 'Failed to save review' });
    }
  });

  // Delete a review (Admin action)
  app.delete('/api/reviews/:id', async (req, res) => {
    try {
      const { id } = req.params;
      await db.delete(reviews).where(eq(reviews.id, Number(id)));
      res.json({ success: true, id });
    } catch (error: any) {
      console.error('Failed to delete review from Cloud SQL:', error);
      res.status(500).json({ error: 'Failed to delete review' });
    }
  });

  // Get all orders
  app.get('/api/orders', async (req, res) => {
    try {
      const allOrders = await db.select().from(orders);
      res.json(allOrders);
    } catch (error: any) {
      console.error('Failed to fetch orders from Cloud SQL:', error);
      res.status(500).json({ error: 'Failed to fetch orders' });
    }
  });

  // Create new order
  app.post('/api/orders', async (req, res) => {
    try {
      const orderData = req.body;
      if (!orderData.id || !orderData.customer || !orderData.items) {
        return res.status(400).json({ error: 'Missing required order fields' });
      }

      const result = await db
        .insert(orders)
        .values({
          id: orderData.id,
          customer: orderData.customer,
          items: orderData.items,
          subtotal: Number(orderData.subtotal),
          deliveryFee: Number(orderData.deliveryFee),
          totalAmount: Number(orderData.totalAmount),
          paymentMethod: orderData.paymentMethod,
          transactionId: orderData.transactionId || null,
          status: orderData.status || 'Pending',
          createdAt: orderData.createdAt || new Date().toISOString(),
        })
        .returning();

      console.log(`[REALTIME ORDER ALERT] Order #${orderData.id} placed by ${orderData.customer?.fullName} (${orderData.customer?.mobileNumber}) Total: ৳${orderData.totalAmount}. Admin Email & WhatsApp notifications dispatched!`);

      // Trigger the real-time notification engine (SSE + FCM Push) in the background
      triggerOrderNotification(result[0]).catch((err) => {
        console.error('[NOTIFY TRIPPED] Non-blocking push notification fail:', err);
      });

      res.json(result[0]);
    } catch (error: any) {
      console.error('Failed to create order in Cloud SQL:', error);
      res.status(500).json({ error: 'Failed to create order' });
    }
  });

  // Update order status
  app.put('/api/orders/:id/status', async (req, res) => {
    try {
      const { id } = req.params;
      const { status } = req.body;

      // Get the current order
      const orderList = await db.select().from(orders).where(eq(orders.id, id));
      if (orderList.length === 0) {
        return res.status(404).json({ error: 'Order not found' });
      }
      const orderObj = orderList[0];

      let updatedFields: any = { status };

      // Automatic consignment creation when order is Confirmed
      if (status === 'Confirmed' && !orderObj.courierTrackingId) {
        // Fetch preferred courier from site settings
        const settingsList = await db.select().from(siteSettings).where(eq(siteSettings.id, 'default'));
        const preferredCourier = settingsList[0]?.defaultCourier || 'Steadfast';

        try {
          const consignment = await createCourierConsignment(orderObj as any, preferredCourier);
          updatedFields.courierName = consignment.courierName;
          updatedFields.courierTrackingId = consignment.trackingId;
          updatedFields.courierStatus = consignment.status;
          
          console.log(`[CONSIGNMENT CREATED] Order #${id} automatically booked with ${consignment.courierName}. Tracking ID: ${consignment.trackingId}`);
        } catch (err) {
          console.error('[CONSIGNMENT ERROR] Failed to automatically create courier consignment:', err);
        }
      }

      const result = await db
        .update(orders)
        .set(updatedFields)
        .where(eq(orders.id, id))
        .returning();

      const updatedOrder = result[0];
      broadcastToClients('order-updated', updatedOrder);
      res.json(updatedOrder);
    } catch (error: any) {
      console.error('Failed to update order status in Cloud SQL:', error);
      res.status(500).json({ error: 'Failed to update order status' });
    }
  });

  // Fetch live order tracking status
  app.get('/api/orders/:id/tracking', async (req, res) => {
    try {
      const { id } = req.params;
      const orderList = await db.select().from(orders).where(eq(orders.id, id));
      if (orderList.length === 0) {
        return res.status(404).json({ error: 'Order not found' });
      }
      const orderObj = orderList[0];

      if (orderObj.courierName && orderObj.courierTrackingId) {
        // Fetch live status from courier API
        const liveStatus = await getLiveCourierStatus(
          orderObj.courierName,
          orderObj.courierTrackingId,
          orderObj.createdAt
        );

        // If the live status is different from current DB status, update it!
        if (liveStatus && liveStatus !== orderObj.status) {
          const updated = await db
            .update(orders)
            .set({
              status: liveStatus,
              courierStatus: liveStatus
            })
            .where(eq(orders.id, id))
            .returning();
          
          console.log(`[LIVE TRACKING UPDATE] Order #${id} tracked status refreshed to "${liveStatus}"`);
          return res.json(updated[0]);
        }
      }

      res.json(orderObj);
    } catch (error: any) {
      console.error('Failed to fetch live order tracking status:', error);
      res.status(500).json({ error: 'Failed to fetch live order tracking' });
    }
  });

  // Get site settings
  app.get('/api/settings', async (req, res) => {
    try {
      const settingsList = await db.select().from(siteSettings).where(eq(siteSettings.id, 'default'));
      if (settingsList.length > 0) {
        const { id, ...cleanSettings } = settingsList[0];
        res.json({
          adminPhone: cleanSettings.adminPhone ?? INITIAL_SITE_SETTINGS.adminPhone,
          adminWhatsapp: cleanSettings.adminWhatsapp ?? INITIAL_SITE_SETTINGS.adminWhatsapp,
          adminEmail: cleanSettings.adminEmail ?? INITIAL_SITE_SETTINGS.adminEmail,
          adminAddress: cleanSettings.adminAddress ?? INITIAL_SITE_SETTINGS.adminAddress,
          adminPassword: cleanSettings.adminPassword ?? INITIAL_SITE_SETTINGS.adminPassword,
          facebookUrl: cleanSettings.facebookUrl ?? INITIAL_SITE_SETTINGS.facebookUrl,
          instagramUrl: cleanSettings.instagramUrl ?? INITIAL_SITE_SETTINGS.instagramUrl,
          bkashNumber: cleanSettings.bkashNumber ?? INITIAL_SITE_SETTINGS.bkashNumber,
          nagadNumber: cleanSettings.nagadNumber ?? INITIAL_SITE_SETTINGS.nagadNumber,
          deliveryFeeInsideDhaka: cleanSettings.deliveryFeeInsideDhaka ?? INITIAL_SITE_SETTINGS.deliveryFeeInsideDhaka,
          deliveryFeeOutsideDhaka: cleanSettings.deliveryFeeOutsideDhaka ?? INITIAL_SITE_SETTINGS.deliveryFeeOutsideDhaka,
          defaultCourier: cleanSettings.defaultCourier ?? INITIAL_SITE_SETTINGS.defaultCourier ?? 'Steadfast',
          heroMediaUrl: cleanSettings.heroMediaUrl ?? '',
          heroMediaType: cleanSettings.heroMediaType ?? 'image',
        });
      } else {
        res.json(INITIAL_SITE_SETTINGS);
      }
    } catch (error: any) {
      console.error('Failed to fetch settings from Cloud SQL:', error);
      res.status(500).json({ error: 'Failed to fetch settings' });
    }
  });

  // Update site settings
  app.put('/api/settings', async (req, res) => {
    try {
      const settingsData = req.body;
      const result = await db
        .insert(siteSettings)
        .values({
          id: 'default',
          adminPhone: (settingsData.adminPhone ?? '').trim(),
          adminWhatsapp: (settingsData.adminWhatsapp ?? '').trim(),
          adminEmail: (settingsData.adminEmail ?? '').trim(),
          adminAddress: (settingsData.adminAddress ?? '').trim(),
          adminPassword: (settingsData.adminPassword ?? 'Admin#2026!Sec').trim(),
          facebookUrl: (settingsData.facebookUrl ?? '').trim(),
          instagramUrl: (settingsData.instagramUrl ?? '').trim(),
          bkashNumber: (settingsData.bkashNumber ?? '').trim(),
          nagadNumber: (settingsData.nagadNumber ?? '').trim(),
          deliveryFeeInsideDhaka: Number(settingsData.deliveryFeeInsideDhaka || 70),
          deliveryFeeOutsideDhaka: Number(settingsData.deliveryFeeOutsideDhaka || 130),
          defaultCourier: settingsData.defaultCourier || 'Steadfast',
          heroMediaUrl: settingsData.heroMediaUrl ?? '',
          heroMediaType: settingsData.heroMediaType || 'image',
        })
        .onConflictDoUpdate({
          target: siteSettings.id,
          set: {
            adminPhone: (settingsData.adminPhone ?? '').trim(),
            adminWhatsapp: (settingsData.adminWhatsapp ?? '').trim(),
            adminEmail: (settingsData.adminEmail ?? '').trim(),
            adminAddress: (settingsData.adminAddress ?? '').trim(),
            adminPassword: (settingsData.adminPassword ?? 'Admin#2026!Sec').trim(),
            facebookUrl: (settingsData.facebookUrl ?? '').trim(),
            instagramUrl: (settingsData.instagramUrl ?? '').trim(),
            bkashNumber: (settingsData.bkashNumber ?? '').trim(),
            nagadNumber: (settingsData.nagadNumber ?? '').trim(),
            deliveryFeeInsideDhaka: Number(settingsData.deliveryFeeInsideDhaka || 70),
            deliveryFeeOutsideDhaka: Number(settingsData.deliveryFeeOutsideDhaka || 130),
            defaultCourier: settingsData.defaultCourier || 'Steadfast',
            heroMediaUrl: settingsData.heroMediaUrl ?? '',
            heroMediaType: settingsData.heroMediaType || 'image',
          },
        })
        .returning();

      const { id, ...cleanSettings } = result[0];
      broadcastToClients('settings-updated', cleanSettings);
      res.json(cleanSettings);
    } catch (error: any) {
      console.error('Failed to update settings in Cloud SQL:', error);
      res.status(500).json({ error: 'Failed to update settings' });
    }
  });

  // --- REAL-TIME NOTIFICATION ENDPOINTS ---

  // 1. Server-Sent Events (SSE) Stream for open admin dashboard instances
  app.get('/api/notifications/stream', (req, res) => {
    res.writeHead(200, {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache, no-transform',
      'Connection': 'keep-alive',
      'X-Accel-Buffering': 'no', // Bypass Nginx/Cloud Run proxy buffering
    });

    res.write('retry: 5000\n');
    res.write('data: {"status":"connected"}\n\n');

    registerSseClient(res);

    // Keep connection alive with periodic heartbeat pings (every 20 seconds)
    const keepAliveInterval = setInterval(() => {
      try {
        res.write(': keepalive\n\n');
      } catch (err) {
        // Safe catch if client has disconnected
      }
    }, 20000);

    req.on('close', () => {
      clearInterval(keepAliveInterval);
      unregisterSseClient(res);
    });
  });

  // 2. Retrieve notifications history from PostgreSQL
  app.get('/api/notifications', async (req, res) => {
    try {
      const history = await db
        .select()
        .from(adminNotifications)
        .orderBy(desc(adminNotifications.createdAt));
      res.json(history);
    } catch (error: any) {
      console.error('Failed to fetch notification history:', error);
      res.status(500).json({ error: 'Failed to fetch notification history' });
    }
  });

  // 3. Mark single notification as read in PostgreSQL
  app.put('/api/notifications/:id/read', async (req, res) => {
    try {
      const { id } = req.params;
      const updated = await db
        .update(adminNotifications)
        .set({ read: true })
        .where(eq(adminNotifications.id, Number(id)))
        .returning();
      res.json(updated[0] || { success: true });
    } catch (error: any) {
      console.error('Failed to mark notification as read:', error);
      res.status(500).json({ error: 'Failed to update notification status' });
    }
  });

  // 4. Mark all notification records as read
  app.put('/api/notifications/read-all', async (req, res) => {
    try {
      await db
        .update(adminNotifications)
        .set({ read: true });
      res.json({ success: true });
    } catch (error: any) {
      console.error('Failed to mark all notifications as read:', error);
      res.status(500).json({ error: 'Failed to update notifications' });
    }
  });

  // 5. Save/Register FCM device push registration token from Client Browser or Android
  app.post('/api/push-tokens', async (req, res) => {
    try {
      const { token, deviceType } = req.body;
      if (!token) {
        return res.status(400).json({ error: 'Registration token is required' });
      }

      await db
        .insert(pushTokens)
        .values({
          token,
          deviceType: deviceType || 'web',
        })
        .onConflictDoNothing();

      console.log(`[FCM DEVICE REGISTERED] Token: ${token.substring(0, 15)}... | OS: ${deviceType}`);
      res.json({ success: true });
    } catch (error: any) {
      console.error('Failed to register device FCM token in PostgreSQL:', error);
      res.status(500).json({ error: 'Failed to register push token' });
    }
  });

  // 6. Manual manual test notification triggers
  app.post('/api/notifications/test', async (req, res) => {
    try {
      const { title, body } = req.body;
      await sendPushNotification(
        title || '🔔 Integrated FCM Alert test',
        body || 'Your real-time order notification suite is now fully configured and live.'
      );
      res.json({ success: true, message: 'Test push notification dispatched.' });
    } catch (error: any) {
      console.error('Failed to run notification system test:', error);
      res.status(500).json({ error: 'Notification system test failed' });
    }
  });

  // Seed / restore default data endpoint
  app.post('/api/seed', async (req, res) => {
    try {
      await db.delete(products);
      for (const p of INITIAL_PRODUCTS) {
        await db.insert(products).values(p);
      }

      await db
        .insert(siteSettings)
        .values({
          id: 'default',
          ...INITIAL_SITE_SETTINGS,
        })
        .onConflictDoUpdate({
          target: siteSettings.id,
          set: INITIAL_SITE_SETTINGS,
        });

      res.json({ success: true, message: 'Defaults restored to Cloud SQL' });
    } catch (error: any) {
      console.error('Failed to seed database:', error);
      res.status(500).json({ error: 'Failed to seed database' });
    }
  });

  // Vite Middleware Setup
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
