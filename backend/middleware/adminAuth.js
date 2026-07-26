// Stateless admin session tokens: HMAC-signed, so no server-side session store is
// needed (survives restarts). Token format: base64(expiry).base64hmac
const crypto = require("crypto");

const COOKIE_NAME = "velira_admin";
const SESSION_HOURS = 12;

function getSecret() {
  return process.env.ADMIN_SESSION_SECRET || "velira-dev-secret-change-me";
}

function sign(value) {
  return crypto.createHmac("sha256", getSecret()).update(value).digest("hex");
}

function createToken() {
  const expiry = Date.now() + SESSION_HOURS * 60 * 60 * 1000;
  const payload = String(expiry);
  const sig = sign(payload);
  return `${payload}.${sig}`;
}

function verifyToken(token) {
  if (!token || typeof token !== "string" || !token.includes(".")) return false;
  const [payload, sig] = token.split(".");
  if (!payload || !sig) return false;
  const expected = sign(payload);
  const validSig =
    expected.length === sig.length &&
    crypto.timingSafeEqual(Buffer.from(expected), Buffer.from(sig));
  if (!validSig) return false;
  const expiry = Number(payload);
  if (!expiry || Date.now() > expiry) return false;
  return true;
}

function requireAdmin(req, res, next) {
  const token = req.cookies ? req.cookies[COOKIE_NAME] : null;
  if (!verifyToken(token)) {
    return res.status(401).json({ error: "Avtorizatsiyadan o'tilmagan. Qayta kiring." });
  }
  next();
}

module.exports = { COOKIE_NAME, createToken, verifyToken, requireAdmin };
