export const formatMoney = (amount, currency = 'د.ع') => {
  const num = Number(amount) || 0;
  return num.toLocaleString('en-US') + ' ' + currency;
};

export const formatDateArabic = (isoString) => {
  if (!isoString) return '';
  try {
    const d = new Date(isoString);
    return d.toLocaleDateString('ar-IQ', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  } catch {
    return isoString;
  }
};
