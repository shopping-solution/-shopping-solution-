import express from 'express';
import path from 'path';
import { createServer as createViteServer } from 'vite';
import { eq } from 'drizzle-orm';
import { db } from './src/db/index.ts';
import { products, orders, siteSettings, users } from './src/db/schema.ts';
import { INITIAL_PRODUCTS, INITIAL_SITE_SETTINGS } from './src/data/initialProducts.ts';

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json({ limit: '10mb' }));

  // Helper to ensure database is seeded if empty
  const ensureSeeded = async () => {
    try {
      const existingProducts = await db.select().from(products);
      if (existingProducts.length === 0) {
        console.log('Seeding initial products into Cloud SQL...');
        for (const p of INITIAL_PRODUCTS) {
          await db.insert(products).values(p).onConflictDoNothing();
        }
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

      const result = await db
        .update(orders)
        .set({ status })
        .where(eq(orders.id, id))
        .returning();

      res.json(result[0]);
    } catch (error: any) {
      console.error('Failed to update order status in Cloud SQL:', error);
      res.status(500).json({ error: 'Failed to update order status' });
    }
  });

  // Get site settings
  app.get('/api/settings', async (req, res) => {
    try {
      const settingsList = await db.select().from(siteSettings).where(eq(siteSettings.id, 'default'));
      if (settingsList.length > 0) {
        const { id, ...cleanSettings } = settingsList[0];
        res.json(cleanSettings);
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
          bkashNumber: settingsData.bkashNumber,
          nagadNumber: settingsData.nagadNumber,
          deliveryFeeInsideDhaka: Number(settingsData.deliveryFeeInsideDhaka),
          deliveryFeeOutsideDhaka: Number(settingsData.deliveryFeeOutsideDhaka),
        })
        .onConflictDoUpdate({
          target: siteSettings.id,
          set: {
            adminPhone: settingsData.adminPhone,
            adminWhatsapp: settingsData.adminWhatsapp,
            adminEmail: settingsData.adminEmail,
            bkashNumber: settingsData.bkashNumber,
            nagadNumber: settingsData.nagadNumber,
            deliveryFeeInsideDhaka: Number(settingsData.deliveryFeeInsideDhaka),
            deliveryFeeOutsideDhaka: Number(settingsData.deliveryFeeOutsideDhaka),
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
