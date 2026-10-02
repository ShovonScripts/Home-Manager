export const formatCurrency = (amount: number, currencySymbol: string = '৳'): string => {
  try {
    return `${currencySymbol}${amount.toLocaleString('en-BD', {
      minimumFractionDigits: 0,
      maximumFractionDigits: 2,
    })}`;
  } catch {
    return `${currencySymbol}${amount}`;
  }
};
