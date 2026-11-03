// OTP authentication via Msg91 is currently disabled.
// User authentication is managed directly via Firebase Auth (Google OAuth & Email/Password).

export default async function handler(req, res) {
  return res.status(403).json({
    error: 'OTP authentication is disabled. Please sign in using Google or Email in the account portal.',
  });
}
