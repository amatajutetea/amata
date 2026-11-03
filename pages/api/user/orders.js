import { adminAuth, adminDb } from '../../../src/lib/firebase-admin';

export default async function handler(req, res) {
  if (req.method !== 'GET') return res.status(405).json({ error: 'Method not allowed' });

  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Unauthorized: Authentication token is required' });
  }

  const idToken = authHeader.split('Bearer ')[1];
  let authenticatedUid = null;

  try {
    if (adminAuth) {
      const decodedToken = await adminAuth.verifyIdToken(idToken);
      authenticatedUid = decodedToken.uid;
    } else {
      // In development environments without Firebase admin credentials, reject or require valid session
      console.warn('[orders API]: adminAuth is not configured on this instance');
      return res.status(503).json({ error: 'Authentication service unavailable' });
    }
  } catch (err) {
    console.warn('[orders API token error]:', err.message);
    return res.status(401).json({ error: 'Invalid or expired session token' });
  }

  if (!authenticatedUid) {
    return res.status(401).json({ error: 'Could not resolve user identity' });
  }

  const orders = [];

  // Fetch orders strictly owned by the authenticated UID
  try {
    if (adminDb && typeof adminDb.collection === 'function') {
      const snapshot = await adminDb
        .collection('orders')
        .where('uid', '==', authenticatedUid)
        .get();

      snapshot.forEach((doc) => {
        orders.push(doc.data());
      });
    }
  } catch (err) {
    console.error('[Firestore user orders error]:', err.message);
    return res.status(500).json({ error: 'Failed to retrieve orders from database' });
  }

  // Fallback to memory store if in dev mode
  try {
    if (global._mockOrders) {
      for (const [, orderData] of global._mockOrders.entries()) {
        if (orderData.uid === authenticatedUid) {
          if (!orders.some((o) => o.orderId === orderData.orderId)) {
            orders.push(orderData);
          }
        }
      }
    }
  } catch (err) {
    console.warn('[Memory store orders notice]:', err.message);
  }

  // Sort newest first
  orders.sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0));

  return res.status(200).json({ success: true, orders });
}
