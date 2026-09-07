import { adminDb } from '../../../src/lib/firebase-admin';

export default async function handler(req, res) {
  if (req.method !== 'GET') return res.status(405).json({ error: 'Method not allowed' });

  const { uid } = req.query;
  if (!uid) return res.status(400).json({ error: 'User ID is required' });

  const orders = [];

  // 1. Try fetching from Firestore safely
  try {
    if (adminDb && typeof adminDb.collection === 'function') {
      const snapshot = await adminDb
        .collection('orders')
        .where('uid', '==', uid)
        .get();

      snapshot.forEach((doc) => {
        orders.push(doc.data());
      });
    }
  } catch (err) {
    console.warn('[Firestore user orders warning]:', err.message);
  }

  // 2. Fallback to memory store if dev mode
  try {
    if (global._mockOrders) {
      for (const [id, orderData] of global._mockOrders.entries()) {
        if (orderData.uid === uid || uid === 'guest') {
          if (!orders.some((o) => o.orderId === orderData.orderId)) {
            orders.push(orderData);
          }
        }
      }
    }
  } catch (err) {
    console.warn('[Memory store orders warning]:', err.message);
  }

  // Sort newest first
  orders.sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0));

  return res.status(200).json({ success: true, orders });
}
