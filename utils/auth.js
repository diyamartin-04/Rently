const crypto = require("crypto");

// Session cookie settings. Uses only Node's built-in crypto, so no extra packages are needed.
const COOKIE_NAME = "wl_session";
const SESSION_MS = 7 * 24 * 60 * 60 * 1000; // 7 days

// Set SESSION_SECRET in production. Without it, a random secret is used and
// sessions are cleared whenever the server restarts.
let SECRET = process.env.SESSION_SECRET;
if (!SECRET) {
  console.warn("SESSION_SECRET is not set; logins will reset when the server restarts.");
  SECRET = crypto.randomBytes(32).toString("hex");
}

const COOKIE_OPTIONS = {
  httpOnly: true,
  sameSite: "lax",
  path: "/",
  maxAge: SESSION_MS,
  secure: process.env.NODE_ENV === "production",
};

const scrypt = (password, salt) =>
  new Promise((resolve, reject) =>
    crypto.scrypt(password, salt, 64, (err, key) => (err ? reject(err) : resolve(key)))
  );

async function hashPassword(password) {
  const salt = crypto.randomBytes(16);
  const key = await scrypt(password, salt);
  return `${salt.toString("hex")}:${key.toString("hex")}`;
}

async function verifyPassword(password, stored) {
  const [saltHex, keyHex] = (stored || "").split(":");
  if (!saltHex || !keyHex) return false;
  const expected = Buffer.from(keyHex, "hex");
  const actual = await scrypt(password, Buffer.from(saltHex, "hex"));
  return expected.length === actual.length && crypto.timingSafeEqual(expected, actual);
}

const sign = (payload) =>
  crypto.createHmac("sha256", SECRET).update(payload).digest("base64url");

// Session value format: "<userId>.<expiresAt>.<signature>"
function createSessionValue(userId) {
  const payload = `${userId}.${Date.now() + SESSION_MS}`;
  return `${payload}.${sign(payload)}`;
}

// Returns the user id if the cookie is valid and not expired, otherwise null.
function readSessionValue(value) {
  if (!value) return null;
  const parts = value.split(".");
  if (parts.length !== 3) return null;

  const [userId, expires, signature] = parts;
  const expected = sign(`${userId}.${expires}`);
  const a = Buffer.from(signature);
  const b = Buffer.from(expected);
  if (a.length !== b.length || !crypto.timingSafeEqual(a, b)) return null;
  if (Number(expires) < Date.now()) return null;

  return userId;
}

function parseCookies(header) {
  const cookies = {};
  if (!header) return cookies;
  for (const part of header.split(";")) {
    const index = part.indexOf("=");
    if (index === -1) continue;
    const name = part.slice(0, index).trim();
    const value = part.slice(index + 1).trim();
    try {
      cookies[name] = decodeURIComponent(value);
    } catch (e) {
      cookies[name] = value;
    }
  }
  return cookies;
}

// Only allow redirects to paths on this site (blocks open redirects)
function safeNext(value) {
  // Browsers treat "/\host" like "//host", so backslashes are rejected too
  return typeof value === "string" && value.startsWith("/") && !value.startsWith("//") && !value.includes("\\")
    ? value
    : "/";
}

module.exports = {
  safeNext,
  COOKIE_NAME,
  COOKIE_OPTIONS,
  hashPassword,
  verifyPassword,
  createSessionValue,
  readSessionValue,
  parseCookies,
};
