import crypto from 'crypto';
import { adminDb } from '../../../src/lib/firebase-admin';

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const { razorpay_order_id, razorpay_payment_id, razorpay_signature, orderId } = req.body;

  if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature || !orderId) {
    return res.status(400).json({ error: 'Missing payment verification details' });
  }

  const isProd = process.env.NEXT_PUBLIC_PRODUCTION === 'TRUE';
  const key_secret = isProd ? process.env.RAZORPAY_PROD_KEY_SECRET : process.env.RAZORPAY_TEST_KEY_SECRET;

  if (!key_secret) {
    return res.status(500).json({ error: 'Razorpay secret key is not configured' });
  }

  try {
    // 1. Verify HMAC SHA256 Signature using timing-safe comparison
    const text = `${razorpay_order_id}|${razorpay_payment_id}`;
    const expectedSignature = crypto
      .createHmac('sha256', key_secret)
      .update(text)
      .digest('hex');

    const signatureBuffer = Buffer.from(razorpay_signature, 'utf-8');
    const expectedBuffer = Buffer.from(expectedSignature, 'utf-8');

    const isValidSignature =
      signatureBuffer.length === expectedBuffer.length &&
      crypto.timingSafeEqual(signatureBuffer, expectedBuffer);

    if (!isValidSignature) {
      await adminDb.collection('orders').doc(orderId).update({
        status: 'payment_failed',
        updatedAt: new Date().toISOString(),
      });
      return res.status(400).json({ success: false, error: 'Invalid payment signature' });
    }

    // 2. Fetch order document & verify binding
    let orderData = null;
    let orderRef = null;

    try {
      if (adminDb) {
        orderRef = adminDb.collection('orders').doc(orderId);
        const orderDoc = await orderRef.get();
        if (orderDoc.exists) {
          orderData = orderDoc.data();
        }
      }
    } catch (dbErr) {
      console.warn('[Firestore verify-payment fallback]: checking memory store:', dbErr.message);
    }

    if (!orderData && global._mockOrders && global._mockOrders.has(orderId)) {
      orderData = global._mockOrders.get(orderId);
    }

    if (!orderData) {
      return res.status(404).json({ error: 'Order record not found' });
    }

    // Verify stored Razorpay Order ID matches request
    if (orderData.razorpayOrderId !== razorpay_order_id) {
      return res.status(400).json({ error: 'Razorpay Order ID mismatch' });
    }

    // 3. Delhivery Shipment Creation (India domestic surface shipping)
    const delhiveryKey = isProd ? process.env.DELHIVERY_PROD_API_KEY : process.env.DELHIVERY_TEST_API_KEY;
    const delhiveryUrl = isProd
      ? 'https://track.delhivery.com/api/cmu/create.json'
      : 'https://staging-express.delhivery.com/api/cmu/create.json';

    let delhiveryAwb = null;

    if (delhiveryKey && orderData && orderData.address) {
      try {
        const shipmentData = {
          shipments: [
            {
              name: orderData.address.name,
              add: orderData.address.address,
              pin: orderData.address.pincode,
              city: orderData.address.city || '',
              state: orderData.address.state || '',
              country: 'India',
              phone: orderData.address.phone,
              order: orderId,
              payment_mode: 'Prepaid',
              products_desc: 'Amata Moroheiya Prebiotic Tea',
              cod_amount: 0,
              weight: 60,
              shipping_mode: 'Surface',
            },
          ],
          pickup_location: {
            name: process.env.DELHIVERY_PICKUP_LOCATION_NAME || 'Amata Srerampore Warehouse',
            add: process.env.DELHIVERY_PICKUP_ADDRESS || '79 A/A GT Road West, Amulyakanan, Srerampore',
            city: process.env.DELHIVERY_PICKUP_CITY || 'Hooghly',
            pin: process.env.DELHIVERY_PICKUP_PINCODE || '712203',
            country: 'India',
            phone: process.env.DELHIVERY_PICKUP_PHONE || '8777395787',
          },
        };

        const formParams = new URLSearchParams();
        formParams.append('format', 'json');
        formParams.append('data', JSON.stringify(shipmentData));

        const response = await fetch(delhiveryUrl, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
            Authorization: `Token ${delhiveryKey}`,
          },
          body: formParams.toString(),
        });

        const rawText = await response.text();
        let result = {};
        try {
          result = JSON.parse(rawText);
          console.log('[Delhivery Shipment API Response]:', JSON.stringify(result));
        } catch (parseErr) {
          console.warn('[Delhivery Shipment API Sandbox notice]: Non-JSON response in sandbox:', rawText.slice(0, 60));
        }

        if (result.success && result.packages && result.packages.length > 0) {
          delhiveryAwb = result.packages[0].waybill;
        } else if (result.packages && result.packages.length > 0 && result.packages[0].waybill) {
          delhiveryAwb = result.packages[0].waybill;
        }
      } catch (err) {
        console.error('[Delhivery Shipment Error]:', err.message);
      }
    }

    // 4. Update Order Document in Firestore / Memory
    try {
      if (orderRef) {
        await orderRef.update({
          status: 'paid',
          razorpayPaymentId: razorpay_payment_id,
          razorpaySignature: razorpay_signature,
          delhiveryAwb: delhiveryAwb || 'pending_dispatch',
          updatedAt: new Date().toISOString(),
        });
      }
    } catch (dbErr) {
      console.warn('[Firestore update fallback]:', dbErr.message);
    }

    if (global._mockOrders && global._mockOrders.has(orderId)) {
      const existing = global._mockOrders.get(orderId);
      global._mockOrders.set(orderId, {
        ...existing,
        status: 'paid',
        razorpayPaymentId: razorpay_payment_id,
        delhiveryAwb: delhiveryAwb || 'pending_dispatch',
        updatedAt: new Date().toISOString(),
      });
    }

    return res.status(200).json({
      success: true,
      message: 'Payment verified successfully',
      orderId,
      delhiveryAwb: delhiveryAwb || 'pending_dispatch',
    });
  } catch (error) {
    console.error('[verify-payment error]:', error);
    return res.status(500).json({ error: 'Failed to verify payment' });
  }
}

