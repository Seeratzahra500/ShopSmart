export const formatPrice = (amount, currency = 'PKR', locale = 'ur-PK') => {
  return new Intl.NumberFormat(locale, {
    style: 'currency',
    currency,
    maximumFractionDigits: 0,
  }).format(amount);
};
