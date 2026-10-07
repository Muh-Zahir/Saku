export function formatIDR(amount, includePrefix = true) {
  const isNegative = amount < 0;
  const absVal = Math.abs(amount);
  const formatted = absVal.toLocaleString('id-ID');
  const prefix = includePrefix ? (isNegative ? '-Rp' : amount > 0 ? '+Rp' : 'Rp') : '';
  return `${prefix}${formatted}`;
}

export function formatSimpleIDR(amount) {
  return `Rp${Math.abs(amount).toLocaleString('id-ID')}`;
}
