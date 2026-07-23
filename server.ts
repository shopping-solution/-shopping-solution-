import express from 'express';
import path from 'path';
import { createServer as createViteServer } from 'vite';
import { eq } from 'drizzle-orm';
import { db } from './src/db/index.ts';
import { products, orders, siteSettings, users } from './src/db/schema.ts';
import { INITIAL_PRODUCTS, INITIAL_SITE_SETTINGS } from './src/data/initialProducts.ts';
import { createCourierConsignment, getLiveCourierStatus } from './server/couriers';

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

  // Health check
  app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', database: 'cloudsql' });
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

      res.json(result[0]);
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
      res.json({ success: true, id });
    } catch (error: any) {
      console.error('Failed to delete product from Cloud SQL:', error);
      res.status(500).json({ error: 'Failed to delete product' });
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

      res.json(result[0]);
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
          ...cleanSettings,
          adminAddress: cleanSettings.adminAddress || INITIAL_SITE_SETTINGS.adminAddress,
          adminPassword: cleanSettings.adminPassword || INITIAL_SITE_SETTINGS.adminPassword,
          facebookUrl: cleanSettings.facebookUrl || INITIAL_SITE_SETTINGS.facebookUrl,
          instagramUrl: cleanSettings.instagramUrl || INITIAL_SITE_SETTINGS.instagramUrl,
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
          adminPhone: settingsData.adminPhone,
          adminWhatsapp: settingsData.adminWhatsapp,
          adminEmail: settingsData.adminEmail,
          adminAddress: settingsData.adminAddress || '',
          adminPassword: settingsData.adminPassword || 'Admin#2026!Sec',
          facebookUrl: settingsData.facebookUrl || 'https://www.facebook.com/share/1DQAkf8T7T/',
          instagramUrl: settingsData.instagramUrl || 'https://www.instagram.com/shopping_solution_',
          bkashNumber: settingsData.bkashNumber,
          nagadNumber: settingsData.nagadNumber,
          deliveryFeeInsideDhaka: Number(settingsData.deliveryFeeInsideDhaka),
          deliveryFeeOutsideDhaka: Number(settingsData.deliveryFeeOutsideDhaka),
          defaultCourier: settingsData.defaultCourier || 'Steadfast',
        })
        .onConflictDoUpdate({
          target: siteSettings.id,
          set: {
            adminPhone: settingsData.adminPhone,
            adminWhatsapp: settingsData.adminWhatsapp,
            adminEmail: settingsData.adminEmail,
            adminAddress: settingsData.adminAddress || '',
            adminPassword: settingsData.adminPassword || 'Admin#2026!Sec',
            facebookUrl: settingsData.facebookUrl || 'https://www.facebook.com/share/1DQAkf8T7T/',
            instagramUrl: settingsData.instagramUrl || 'https://www.instagram.com/shopping_solution_',
            bkashNumber: settingsData.bkashNumber,
            nagadNumber: settingsData.nagadNumber,
            deliveryFeeInsideDhaka: Number(settingsData.deliveryFeeInsideDhaka),
            deliveryFeeOutsideDhaka: Number(settingsData.deliveryFeeOutsideDhaka),
            defaultCourier: settingsData.defaultCourier || 'Steadfast',
          },
        })
        .returning();

      const { id, ...cleanSettings } = result[0];
      res.json(cleanSettings);
    } catch (error: any) {
      console.error('Failed to update settings in Cloud SQL:', error);
      res.status(500).json({ error: 'Failed to update settings' });
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
