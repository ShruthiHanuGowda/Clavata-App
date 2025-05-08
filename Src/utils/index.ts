export const formatQuantityMWh = (quantity: number): string => {
  const mwh = quantity / 1_000_000;
  return `${mwh % 1 === 0 ? mwh.toFixed(0) : mwh.toFixed(2)} MWh`;
};

export const formatPrice = (price: number | undefined): string => {
  if (price === undefined || price === null) return '$0.00 per MWh';
  const adjustedPrice = price * 1000000;
  return `$${adjustedPrice.toFixed(2)} per MWh`;
};
