export const DEFAULT_CURRENCY_SYMBOL = '৳';

// Only the known corrupted currency placeholder is replaced. Other currencies stay intact.
// Normalize on reads/display and new writes; do not rewrite existing database records.
export const normalizeCurrencySymbol = (currencySymbol?: string | null): string => {
  const symbol = currencySymbol?.trim();
  return !symbol || symbol === '?' ? DEFAULT_CURRENCY_SYMBOL : symbol;
};

export const formatCurrency = (amount: number, currencySymbol: string = DEFAULT_CURRENCY_SYMBOL): string => {
  const symbol = normalizeCurrencySymbol(currencySymbol);
  try {
    return `${symbol}${amount.toLocaleString('en-BD', {
      minimumFractionDigits: 0,
      maximumFractionDigits: 2,
    })}`;
  } catch {
    return `${symbol}${amount}`;
  }
};
