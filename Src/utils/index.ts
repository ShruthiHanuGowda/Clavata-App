export const formatQuantityMWh = (
  quantity: number,
  unit: boolean = true,
): string => {
  const mwh = quantity / 1_000_000;
  return `${mwh % 1 === 0 ? mwh.toFixed(0) : mwh.toFixed(2)} ${unit ? 'MWh' : ''
    }`;
};

export const formatPrice = (price: number | undefined): string => {
  if (price === undefined || price === null) return '$0.00 per MWh';
  const adjustedPrice = price * 1000000;
  return `$${adjustedPrice.toFixed(2)} per MWh`;
};


export function getAccountAskPrice(data: { askPrice: string, seller: { id: string } }[], accountId: `0x${string}`): number {
  if (!Array.isArray(data) || data.length === 0) {
    return 0;
  }

  const accountData = data.find(item => item.seller.id.toLowerCase() === accountId.toLowerCase());
  if (!accountData) {
    return 0;
  }

  return parseFloat(accountData.askPrice);
}

export function getAccountNFTQuantity(data: { askPrice: string, seller: { id: string }, amount: string }[], accountId: `0x${string}`): string {
  if (!Array.isArray(data) || data.length === 0) {
    return "0";
  }

  const accountData = data.find(item => item.seller.id.toLowerCase() === accountId.toLowerCase());
  if (!accountData) {
    return "0";
  }

  return accountData.amount;
}

export function isOwnNft(accountAddress: `0x${string}` | undefined, data: { askPrice: string, seller: { id: string } }[]): boolean {
  if (!accountAddress) {
    return false
  }
  return data.some(ask => ask.seller.id.toLowerCase() === accountAddress.toLowerCase());
}
