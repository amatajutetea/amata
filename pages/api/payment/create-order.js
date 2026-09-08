import Razorpay from 'razorpay';
import { adminDb } from '../../../src/lib/firebase-admin';
import productsData from '../../../src/data/products';

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const { items, address, uid } = req.body;

  if (!items || !Array.isArray(items) || items.length === 0) {
    return res.status(400).json({ error: 'Cart items are required' });
  }

  if (!address || !address.name || !address.phone || !address.address || !address.pincode) {
    return res.status(400).json({ error: 'Complete delivery address is required' });
  }

  // Calculate authoritative order total server-side to prevent price tampering
  let calculatedTotal = 0;
  const verifiedItems = [];

  for (const item of items) {
    const product = productsData.find(
      (p) => p.id === item.id || p.slug === item.slug || (item.id && item.id.startsWith(p.id))
    );
    if (!product) {
      return res.status(400).json({ error: `Product not found: ${item.name || item.id}` });
    }
    const qty = Math.max(1, parseInt(item.qty || 1, 10));
    const itemTotal = product.price * qty;
    calculatedTotal += itemTotal;

    verifiedItems.push({
      id: product.id,
      name: product.name,
      price: product.price,
      qty,
      total: itemTotal,
      primaryImage: product.primaryImage
    });
  }

  if (calculatedTotal <= 0) {
    return res.status(400).json({ error: 'Invalid order total' });
  }

  const isProd = process.env.NEXT_PUBLIC_PRODUCTION === 'TRUE';
  let key_id = isProd ? process.env.RAZORPAY_PROD_KEY_ID : process.env.RAZORPAY_TEST_KEY_ID;
  let key_secret = isProd ? process.env.RAZORPAY_PROD_KEY_SECRET : process.env.RAZORPAY_TEST_KEY_SECRET;

  if (key_id) key_id = key_id.trim();
  if (key_secret) key_secret = key_secret.trim();

  if (!key_id || !key_secret) {
    return res.status(500).json({ error: 'Razorpay API keys are not configured' });
  }

  const rzp = new Razorpay({ key_id, key_secret });

  try {
    const customOrderId = `AMT-${Date.now().toString().slice(-6)}`;
    const rzpAmountPaise = Math.round(calculatedTotal * 100);

    const rzpOrder = await rzp.orders.create({
      amount: rzpAmountPaise,
      currency: 'INR',
      receipt: `rcpt_${customOrderId}`,
      notes: {
        orderId: customOrderId,
        customerName: address.name,
        customerPhone: address.phone
      }
    });

    const orderData = {
      orderId: customOrderId,
      uid: uid || 'guest',
      amount: calculatedTotal,
      items: verifiedItems,
      address,
      status: 'pending',
      razorpayOrderId: rzpOrder.id,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    // Store in Firestore with fallback for dev testing
    try {
      if (adminDb) {
        await adminDb.collection('orders').doc(customOrderId).set(orderData);
      } else {
        throw new Error('adminDb not initialized');
      }
    } catch (dbErr) {
      console.warn('[Firestore create-order fallback]: Using in-memory store for dev test:', dbErr.message);
      global._mockOrders = global._mockOrders || new Map();
      global._mockOrders.set(customOrderId, orderData);
    }

    return res.status(200).json({ 
      success: true, 
      orderId: customOrderId, 
      razorpayOrderId: rzpOrder.id,
      amount: rzpOrder.amount,
      currency: rzpOrder.currency,
      key_id
    });
  } catch (err) {
    console.error('[create-order error]:', err);
    if (err.statusCode === 401 || err?.error?.description === 'Authentication failed') {
      return res.status(401).json({
        error: `Razorpay Key Authentication Failed (${isProd ? 'Live Mode' : 'Test Mode'}). Key ID used: ${key_id}. Please check your Key Secret in Razorpay Dashboard -> Settings -> API Keys.`
      });
    }
    return res.status(500).json({ error: err.message || 'Failed to create order' });
  }
}

