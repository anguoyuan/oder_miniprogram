const QRCode = require('qrcode');

// CRC-16/CCITT-FALSE used by EMVCo QR spec
function crc16(str) {
  let crc = 0xFFFF;
  for (let i = 0; i < str.length; i++) {
    crc ^= str.charCodeAt(i) << 8;
    for (let j = 0; j < 8; j++) {
      crc = (crc & 0x8000) ? (crc << 1) ^ 0x1021 : crc << 1;
      crc &= 0xFFFF;
    }
  }
  return crc.toString(16).toUpperCase().padStart(4, '0');
}

function tlv(id, value) {
  const len = value.length.toString().padStart(2, '0');
  return `${id}${len}${value}`;
}

/**
 * Generate a PayNow dynamic QR string (EMVCo / SGQR spec).
 * @param {object} opts
 * @param {string} [opts.mobile]      - Mobile number with country code, e.g. "+6591234567"
 * @param {string} [opts.uen]         - Merchant UEN (e.g. "202012345A") — used if no mobile
 * @param {string|number} opts.amount - Transaction amount in SGD
 * @param {string} opts.reference     - Bill reference / order number
 * @param {string} opts.merchantName  - Merchant name (max 25 chars)
 * @param {string} [opts.expiryDate]  - YYYYMMDD, defaults to tomorrow
 * @returns {string} PayNow QR string
 */
function generatePayNowQRString({ mobile, uen, amount, reference, merchantName, expiryDate }) {
  const amountStr = parseFloat(amount).toFixed(2);
  const expiry = expiryDate || new Date(Date.now() + 86400000)
    .toISOString().slice(0, 10).replace(/-/g, '');

  // Type 0 = mobile number (+65XXXXXXXX), Type 2 = UEN
  const proxyType = mobile ? '0' : '2';
  const proxyValue = mobile || uen;

  const merchantAccountInfo =
    tlv('00', 'SG.PAYNOW') +
    tlv('01', proxyType) +
    tlv('02', proxyValue) +
    tlv('03', '0') +           // Fixed amount (not editable by payer)
    tlv('04', expiry);

  const additionalData = tlv('01', reference.slice(0, 25));

  const payload =
    tlv('00', '01') +
    tlv('01', '12') +          // Dynamic QR
    tlv('26', merchantAccountInfo) +
    tlv('53', '702') +         // SGD
    tlv('54', amountStr) +
    tlv('58', 'SG') +
    tlv('59', merchantName.slice(0, 25)) +
    tlv('60', 'Singapore') +
    tlv('62', additionalData) +
    '6304';

  return payload + crc16(payload);
}

/**
 * Generate a PayNow QR code as a base64 PNG data URL.
 * @param {object} opts - same as generatePayNowQRString
 * @returns {Promise<string>} data URL string
 */
async function generatePayNowQRDataURL(opts) {
  const qrString = generatePayNowQRString(opts);
  const dataURL = await QRCode.toDataURL(qrString, {
    errorCorrectionLevel: 'M',
    margin: 2,
    width: 300,
    color: { dark: '#000000', light: '#ffffff' }
  });
  return { qrString, dataURL };
}

module.exports = { generatePayNowQRString, generatePayNowQRDataURL };
