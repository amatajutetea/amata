import { adminDb } from '../../../src/lib/firebase-admin';

export default async function handler(req, res) {
  if (req.method !== 'GET') return res.status(405).json({ error: 'Method not allowed' });

  const { id } = req.query;

  if (!id) {
    return res.status(400).json({ error: 'Tracking ID or Order ID is required' });
  }

  const isProd = process.env.NEXT_PUBLIC_PRODUCTION === 'TRUE';
  const delhiveryKey = isProd ? process.env.DELHIVERY_PROD_API_KEY : process.env.DELHIVERY_TEST_API_KEY;
  const baseUrl = isProd ? 'https://track.delhivery.com' : 'https://staging-express.delhivery.com';

  try {
    let waybill = id;
    let orderData = null;

    // Check if id is a Firestore Order ID (e.g. AMT-123456)
    if (id.startsWith('AMT-') || id.length > 5) {
      try {
        const docRef = await adminDb.collection('orders').doc(id).get();
        if (docRef.exists) {
          orderData = docRef.data();
          if (orderData.delhiveryAwb && orderData.delhiveryAwb !== 'pending_dispatch') {
            waybill = orderData.delhiveryAwb;
          }
        }
      } catch (err) {
        console.warn('[Firestore track fallback]: checking memory store:', err.message);
      }

      if (!orderData && global._mockOrders && global._mockOrders.has(id)) {
        orderData = global._mockOrders.get(id);
        if (orderData.delhiveryAwb && orderData.delhiveryAwb !== 'pending_dispatch') {
          waybill = orderData.delhiveryAwb;
        }
      }
    }

    // Call Delhivery Tracking API
    let trackingInfo = null;
    if (delhiveryKey && waybill && waybill !== 'pending_dispatch') {
      try {
        const trackUrl = `${baseUrl}/api/v1/packages/json/?waybill=${encodeURIComponent(waybill)}&token=${encodeURIComponent(delhiveryKey)}`;
        const response = await fetch(trackUrl, {
          headers: {
            Authorization: `Token ${delhiveryKey}`,
          },
        });
        const rawText = await response.text();
        try {
          trackingInfo = JSON.parse(rawText);
        } catch (jsonErr) {
          console.warn('[Delhivery Track API sandbox notice]: Response is non-JSON or HTML:', rawText.slice(0, 60));
        }
      } catch (err) {
        console.error('[Delhivery Track API Error]:', err.message);
      }
    }

    return res.status(200).json({
      success: true,
      queryId: id,
      waybill,
      order: orderData
        ? {
            orderId: orderData.orderId,
            status: orderData.status,
            amount: orderData.amount,
            items: orderData.items,
            createdAt: orderData.createdAt,
          }
        : null,
      tracking: trackingInfo || {
        status: orderData ? orderData.status : 'Processing',
        remarks: 'Order received. Shipment dispatch details will update shortly.',
      },
    });
  } catch (error) {
    console.error('[track API error]:', error);
    return res.status(500).json({ error: 'Failed to fetch tracking details' });
  }
}
