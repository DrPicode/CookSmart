export default function handler(req, res) {
  return res.status(200).json({ publicKey: process.env.PUSH_VAPID_PUBLIC_KEY });
}
