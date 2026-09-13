/**
 * Strict input validation and sanitization utilities.
 */

// Strip HTML tags and ASCII control characters to prevent XSS / injection
export function sanitizeString(val, maxLength = 255) {
  if (typeof val !== 'string') return '';
  return val
    .replace(/[<>]/g, '') // remove dangerous HTML characters
    .replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g, '') // remove control chars
    .trim()
    .slice(0, maxLength);
}

// Validate 10-digit Indian mobile number
export function isValidPhone(phone) {
  if (!phone || typeof phone !== 'string') return false;
  const digits = phone.replace(/[^0-9]/g, '').slice(-10);
  return /^[6-9]\d{9}$/.test(digits);
}

export function cleanPhone(phone) {
  if (!phone || typeof phone !== 'string') return '';
  return phone.replace(/[^0-9]/g, '').slice(-10);
}

// Validate positive integer
export function isValidQuantity(qty) {
  const num = Number(qty);
  return Number.isInteger(num) && num > 0 && num <= 1000;
}

// Validate positive float / price
export function isValidPrice(price) {
  const num = Number(price);
  return !isNaN(num) && num >= 0 && isFinite(num);
}
