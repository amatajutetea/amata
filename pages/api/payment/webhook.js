import crypto from 'crypto';
import { adminDb } from '../../../src/lib/firebase-admin';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const webhookSignature = req.headers['x-razorpay-signature'];
  const isProd = process.env.NEXT_PUBLIC_PRODUCTION === 'TRUE';
  const webhookSecret = process.env.RAZORPAY_WEBHOOK_SECRET || 
    (isProd ? process.env.RAZORPAY_PROD_KEY_SECRET : process.env.RAZORPAY_TEST_KEY_SECRET);

  if (!webhookSecret) {
    console.error('[Razorpay Webhook Error]: Webhook secret not configured');
    return res.status(500).json({ error: 'Webhook secret not configured' });
  }

  // 1. Verify webhook signature
  try {
    const bodyStr = typeof req.body === 'string' ? req.body : JSON.stringify(req.body);
    const expectedSignature = crypto
      .createHmac('sha256', webhookSecret.trim())
      .update(bodyStr)
      .digest('hex');

    const sigBuf = Buffer.from(webhookSignature || '', 'utf-8');
    const expBuf = Buffer.from(expectedSignature, 'utf-8');

    const isValid = sigBuf.length === expBuf.length && crypto.timingSafeEqual(sigBuf, expBuf);
    if (!isValid) {
      console.warn('[Razorpay Webhook]: Invalid signature received');
      return res.status(400).json({ error: 'Invalid webhook signature' });
    }
  } catch (err) {
    console.error('[Razorpay Webhook Signature Check Error]:', err.message);
    return res.status(400).json({ error: 'Signature verification failed' });
  }

  const event = req.body.event;
  const payload = req.body.payload;

  // Handle successful payment events: 'order.paid' or 'payment.captured'
  if (event === 'order.paid' || event === 'payment.captured') {
    try {
      const paymentEntity = payload.payment?.entity;
      const orderEntity = payload.order?.entity;
      const razorpayOrderId = paymentEntity?.order_id || orderEntity?.id;
      const razorpayPaymentId = paymentEntity?.id;

      if (!razorpayOrderId) {
        return res.status(200).json({ received: true, note: 'No razorpay order id' });
      }

      if (!adminDb) {
        return res.status(200).json({ received: true, note: 'adminDb not initialized' });
      }

      // Query order by razorpayOrderId
      const snapshot = await adminDb
        .collection('orders')
        .where('razorpayOrderId', '==', razorpayOrderId)
        .limit(1)
        .get();

      if (snapshot.empty) {
        console.warn(`[Webhook]: No internal order found for Razorpay Order ${razorpayOrderId}`);
        return res.status(200).json({ received: true, note: 'Order not found' });
      }

      const orderDoc = snapshot.docs[0];
      const orderData = orderDoc.data();

      // Idempotency check: if already paid, do nothing
      if (orderData.status === 'paid') {
        return res.status(200).json({ received: true, note: 'Already paid' });
      }

      // Trigger Delhivery Shipment if not already created
      let delhiveryAwb = orderData.delhiveryAwb;
      const delhiveryKey = isProd ? process.env.DELHIVERY_PROD_API_KEY : process.env.DELHIVERY_TEST_API_KEY;
      const delhiveryUrl = isProd
        ? 'https://track.delhivery.com/api/cmu/create.json'
        : 'https://staging-express.delhivery.com/api/cmu/create.json';

      if (delhiveryKey && orderData.address && (!delhiveryAwb || delhiveryAwb === 'pending_dispatch')) {
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
                order: orderData.orderId,
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

          const shipResponse = await fetch(delhiveryUrl, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/x-www-form-urlencoded',
              Authorization: `Token ${delhiveryKey}`,
            },
            body: formParams.toString(),
          });

          const rawText = await shipResponse.text();
          const shipJson = JSON.parse(rawText);
          if (shipJson.packages && shipJson.packages.length > 0 && shipJson.packages[0].waybill) {
            delhiveryAwb = shipJson.packages[0].waybill;
          }
        } catch (shipErr) {
          console.error('[Webhook Delhivery Error]:', shipErr.message);
        }
      }

      await orderDoc.ref.update({
        status: 'paid',
        razorpayPaymentId: razorpayPaymentId || orderData.razorpayPaymentId || '',
        delhiveryAwb: delhiveryAwb || 'pending_dispatch',
        updatedAt: new Date().toISOString(),
      });

      console.log(`[Razorpay Webhook]: Successfully reconciled order ${orderData.orderId}`);
    } catch (err) {
      console.error('[Razorpay Webhook Process Error]:', err.message);
    }
  }

  return res.status(200).json({ received: true });
}
