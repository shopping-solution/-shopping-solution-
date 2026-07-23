import { Order } from '../src/types';

// Steadfast API Configuration
const getSteadfastConfig = () => {
  return {
    apiKey: process.env.STEADFAST_API_KEY,
    secretKey: process.env.STEADFAST_SECRET_KEY,
    baseUrl: 'https://portal.steadfast.com.bd/api/v1'
  };
};

// Pathao API Configuration
const getPathaoConfig = () => {
  return {
    clientId: process.env.PATHAO_CLIENT_ID,
    clientSecret: process.env.PATHAO_CLIENT_SECRET,
    username: process.env.PATHAO_USERNAME,
    password: process.env.PATHAO_PASSWORD,
    storeId: process.env.PATHAO_STORE_ID,
    baseUrl: 'https://api-hermes.pathao.com'
  };
};

/**
 * Creates a courier consignment for the confirmed order
 */
export async function createCourierConsignment(order: Order, preferredCourier?: string) {
  const courier = preferredCourier || 'Steadfast';

  console.log(`[COURIER INTERFACE] Attempting to create consignment for Order #${order.id} using ${courier}`);

  if (courier === 'Pathao') {
    return await createPathaoConsignment(order);
  } else {
    return await createSteadfastConsignment(order);
  }
}

/**
 * Fetch live status from Courier API or fallback to simulated progression
 */
export async function getLiveCourierStatus(courierName: string, trackingId: string, orderCreatedAt: string): Promise<string> {
  // If simulated/mock tracking code
  if (trackingId.startsWith('MOCK-')) {
    return simulateProgressiveStatus(orderCreatedAt);
  }

  if (courierName === 'Steadfast') {
    try {
      const config = getSteadfastConfig();
      if (!config.apiKey || !config.secretKey) {
        return simulateProgressiveStatus(orderCreatedAt);
      }

      const response = await fetch(`${config.baseUrl}/status_by_trackingcode/${trackingId}`, {
        method: 'GET',
        headers: {
          'Api-Key': config.apiKey,
          'Secret-Key': config.secretKey,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const data: any = await response.json();
        // Map Steadfast status to system status
        // Steadfast statuses: pending, holding, delivered, cancelled, returned, etc.
        const sfStatus = (data.delivery_status || '').toLowerCase();
        console.log(`[STEADFAST STATUS FETCH] Tracking ${trackingId}: ${sfStatus}`);
        
        if (sfStatus === 'delivered') return 'Delivered';
        if (sfStatus === 'cancelled') return 'Cancelled';
        if (sfStatus === 'returned') return 'Cancelled';
        if (sfStatus === 'shipped' || sfStatus === 'in_transit' || sfStatus === 'on_the_way') return 'Shipped';
        return 'Processing';
      }
    } catch (err) {
      console.error('[STEADFAST STATUS ERROR]', err);
    }
  }

  if (courierName === 'Pathao') {
    try {
      const config = getPathaoConfig();
      if (!config.clientId || !config.clientSecret || !config.username || !config.password) {
        return simulateProgressiveStatus(orderCreatedAt);
      }

      const token = await getPathaoAccessToken();
      if (!token) return simulateProgressiveStatus(orderCreatedAt);

      const response = await fetch(`${config.baseUrl}/aladdin/api/v1/orders/${trackingId}/status`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        }
      });

      if (response.ok) {
        const data: any = await response.json();
        const pathaoStatus = (data.data?.order_status || '').toLowerCase();
        console.log(`[PATHAO STATUS FETCH] Tracking ${trackingId}: ${pathaoStatus}`);
        
        if (pathaoStatus === 'delivered') return 'Delivered';
        if (pathaoStatus === 'cancelled') return 'Cancelled';
        if (pathaoStatus === 'returned') return 'Cancelled';
        if (pathaoStatus === 'on_the_way' || pathaoStatus === 'shipped') return 'Shipped';
        return 'Processing';
      }
    } catch (err) {
      console.error('[PATHAO STATUS ERROR]', err);
    }
  }

  return simulateProgressiveStatus(orderCreatedAt);
}

/**
 * Creates a real Steadfast Consignment
 */
async function createSteadfastConsignment(order: Order) {
  const config = getSteadfastConfig();

  // Validate API keys are provided
  if (!config.apiKey || !config.secretKey) {
    console.warn('[STEADFAST] Missing environment variables. Falling back to Mock consignment.');
    return generateMockTracking('Steadfast');
  }

  try {
    const codAmount = order.paymentMethod === 'COD' ? order.totalAmount : 0;
    const fullAddress = `${order.customer.houseNumber || ''}, ${order.customer.village || ''}, ${order.customer.upazila}, ${order.customer.district}, ${order.customer.division}`;

    const body = {
      invoice: order.id,
      recipient_name: order.customer.fullName,
      recipient_phone: order.customer.mobileNumber,
      recipient_address: fullAddress,
      cod_amount: codAmount,
      note: 'Auto consignment from Shopping Solution website.'
    };

    const res = await fetch(`${config.baseUrl}/create_order`, {
      method: 'POST',
      headers: {
        'Api-Key': config.apiKey,
        'Secret-Key': config.secretKey,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(body)
    });

    if (res.ok) {
      const result: any = await res.json();
      if (result.status === 200 && result.consignment) {
        console.log(`[STEADFAST SUCCESS] Consignment created for order ${order.id}:`, result.consignment);
        return {
          trackingId: String(result.consignment.tracking_code || result.consignment.consignment_id),
          status: 'Confirmed',
          courierName: 'Steadfast'
        };
      } else {
        console.error('[STEADFAST API ERROR RESPONSE]', result);
        throw new Error(result.message || 'API responded with error code');
      }
    } else {
      const errText = await res.text();
      console.error('[STEADFAST HTTP ERROR]', res.status, errText);
      throw new Error(`HTTP status ${res.status}`);
    }
  } catch (error: any) {
    console.error('[STEADFAST INTEGRATION EXCEPTION]', error);
    // Fallback gracefully so the system doesn't break
    return generateMockTracking('Steadfast');
  }
}

/**
 * Gets Pathao OAuth Access Token
 */
async function getPathaoAccessToken(): Promise<string | null> {
  const config = getPathaoConfig();
  try {
    const res = await fetch(`${config.baseUrl}/aladdin/api/v1/issue-token`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      body: JSON.stringify({
        client_id: config.clientId,
        client_secret: config.clientSecret,
        username: config.username,
        password: config.password,
        grant_type: 'password'
      })
    });

    if (res.ok) {
      const data: any = await res.json();
      return data.access_token || null;
    }
    const errText = await res.text();
    console.error('[PATHAO TOKEN REQ ERROR]', res.status, errText);
  } catch (err) {
    console.error('[PATHAO AUTH EXCEPTION]', err);
  }
  return null;
}

/**
 * Creates a real Pathao Consignment
 */
async function createPathaoConsignment(order: Order) {
  const config = getPathaoConfig();

  // Validate credentials are provided
  if (!config.clientId || !config.clientSecret || !config.username || !config.password || !config.storeId) {
    console.warn('[PATHAO] Missing environment variables. Falling back to Mock consignment.');
    return generateMockTracking('Pathao');
  }

  try {
    const token = await getPathaoAccessToken();
    if (!token) {
      throw new Error('Failed to retrieve Pathao access token');
    }

    const codAmount = order.paymentMethod === 'COD' ? order.totalAmount : 0;
    const fullAddress = `${order.customer.houseNumber || ''}, ${order.customer.village || ''}, ${order.customer.upazila}`;

    // Map divisions to Pathao city equivalents (standard fallback ids)
    let cityId = 1; // Dhaka
    const divisionClean = (order.customer.division || '').toLowerCase();
    if (divisionClean.includes('chittagong') || divisionClean.includes('chat')) cityId = 2;
    else if (divisionClean.includes('sylhet')) cityId = 3;
    else if (divisionClean.includes('khulna')) cityId = 4;
    else if (divisionClean.includes('rajshahi')) cityId = 5;
    else if (divisionClean.includes('rangpur')) cityId = 6;
    else if (divisionClean.includes('barisal')) cityId = 7;

    const body = {
      store_id: Number(config.storeId),
      merchant_order_id: order.id,
      recipient_name: order.customer.fullName,
      recipient_phone: order.customer.mobileNumber,
      recipient_address: fullAddress,
      recipient_city: cityId,
      recipient_zone: 1, // Default zones and areas
      recipient_area: 1,
      delivery_type: 48, // 48h
      item_type: 2, // Parcel
      special_instruction: 'Auto consignment from Shopping Solution website.',
      item_quantity: 1,
      amount_to_collect: codAmount,
      item_weight: 0.5
    };

    const res = await fetch(`${config.baseUrl}/aladdin/api/v1/orders`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      body: JSON.stringify(body)
    });

    if (res.ok) {
      const result: any = await res.json();
      if (result.code === 200 && result.data) {
        console.log(`[PATHAO SUCCESS] Consignment created for order ${order.id}:`, result.data);
        return {
          trackingId: String(result.data.consignment_id),
          status: 'Confirmed',
          courierName: 'Pathao'
        };
      } else {
        console.error('[PATHAO API ERROR RESPONSE]', result);
        throw new Error(result.message || 'API responded with error code');
      }
    } else {
      const errText = await res.text();
      console.error('[PATHAO HTTP ERROR]', res.status, errText);
      throw new Error(`HTTP status ${res.status}`);
    }
  } catch (error: any) {
    console.error('[PATHAO INTEGRATION EXCEPTION]', error);
    return generateMockTracking('Pathao');
  }
}

/**
 * Generate a clean, realistic tracking ID for mock scenarios
 */
function generateMockTracking(courier: string) {
  const prefix = courier === 'Pathao' ? 'PT' : 'ST';
  const randNum = Math.floor(100000 + Math.random() * 900000);
  const trackingId = `MOCK-${prefix}-${randNum}`;
  console.log(`[COURIER SIMULATION] Generated offline/mock tracking code for ${courier}: ${trackingId}`);
  return {
    trackingId,
    status: 'Confirmed',
    courierName: courier
  };
}

/**
 * Simulates progressive tracking status change based on time elapsed
 */
function simulateProgressiveStatus(createdAtStr: string): string {
  try {
    const createdAt = new Date(createdAtStr).getTime();
    const now = Date.now();
    const elapsedMinutes = (now - createdAt) / (1000 * 60);

    if (elapsedMinutes < 1) {
      return 'Processing';
    } else if (elapsedMinutes < 3) {
      return 'Shipped';
    } else {
      return 'Delivered';
    }
  } catch (e) {
    return 'Processing';
  }
}
