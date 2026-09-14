export const JOIN_QR_VERSION = '1';

export const buildJoinFundToken = ({ activeAdminId, sendingCardId }) =>
  ['familypay', activeAdminId || 'admin', sendingCardId || 'fund'].join(':');

export const buildJoinQrUrl = ({ origin, activeAdminId, sendingCardId }) => {
  const url = new URL('/', origin);
  url.searchParams.set('action', 'join');
  url.searchParams.set('v', JOIN_QR_VERSION);
  url.searchParams.set('adminId', activeAdminId || '');
  url.searchParams.set('fundToken', buildJoinFundToken({ activeAdminId, sendingCardId }));
  return url.toString();
};

export const parseJoinQrPayload = (rawValue) => {
  const raw = String(rawValue || '').trim();
  if (!raw) return null;

  try {
    const parsedJson = JSON.parse(raw);
    if (parsedJson?.action === 'join') {
      return {
        raw,
        v: String(parsedJson.v || JOIN_QR_VERSION),
        adminId: String(parsedJson.adminId || '').trim(),
        fundToken: String(parsedJson.fundToken || '').trim()
      };
    }
  } catch {
    // Most QR payloads are URLs; JSON support is only for future compatibility.
  }

  try {
    const base = typeof window !== 'undefined' ? window.location.origin : 'https://familypay-aw26.onrender.com';
    const url = new URL(raw, base);
    const action = url.searchParams.get('action');
    const isSameAppUrl =
      typeof window !== 'undefined' &&
      url.origin === window.location.origin &&
      (action === 'join' || action === 'register' || !action);
    const isHostedAppUrl = /familypay/i.test(url.hostname);
    if (action !== 'join' && !isSameAppUrl && !isHostedAppUrl) return null;

    return {
      raw,
      v: String(url.searchParams.get('v') || JOIN_QR_VERSION),
      adminId: String(url.searchParams.get('adminId') || '').trim(),
      fundToken: String(url.searchParams.get('fundToken') || '').trim(),
      origin: url.origin
    };
  } catch {
    return null;
  }
};
