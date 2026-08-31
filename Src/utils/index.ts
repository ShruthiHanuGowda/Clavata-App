import { Images } from '../Theme';
import { bech32 } from 'bech32';

/**
 * Convert EVM address to Bech32 Cosmos address
 * @param evmAddress - EVM address (e.g., '0x390750e5c49339d3fda3f1304266d6cdded10620')
 * @param prefix - Bech32 prefix (default: 'denergy')
 * @returns Bech32 address (e.g., 'denergy18yr4pewyjvua8ldr7ycyyekkeh0dzp3q9jkurg')
 */
export const evmToBech32 = (evmAddress: string, prefix: string = 'denergy'): string => {
  try {
    // Remove '0x' prefix if present
    const cleanAddress = evmAddress.toLowerCase().replace('0x', '');

    // Convert hex string to bytes
    const bytes: number[] = [];
    for (let i = 0; i < cleanAddress.length; i += 2) {
      bytes.push(parseInt(cleanAddress.substr(i, 2), 16));
    }

    // Convert to 5-bit words for bech32
    const words = bech32.toWords(Buffer.from(bytes));

    // Encode with bech32
    return bech32.encode(prefix, words);
  } catch (error) {
    console.error('Error converting EVM to Bech32:', error);
    return evmAddress; // Return original if conversion fails
  }
};

export const formatQuantityMWh = (
  quantity: number,
  unit: boolean = true,
  decimal: number = 2,
): string => {
  const mwh = quantity / 1_000_000;
  return `${mwh % 1 === 0 ? mwh.toFixed(0) : mwh.toFixed(decimal)} ${unit ? 'MWh' : ''
    }`;
};

export const formatPrice = (price: number | undefined): string => {
  if (price === undefined || price === null) { return '$0.00 per MWh'; }
  const adjustedPrice = price * 1000000;
  return `$${adjustedPrice.toFixed(2)} per MWh`;
};

export function getAccountAskPrice(
  data: { askPrice: string; seller: { id: string } }[],
  accountId: `0x${string}`,
): number {
  if (!Array.isArray(data) || data.length === 0) {
    return 0;
  }

  const accountData = data.find(
    item => item.seller.id.toLowerCase() === accountId.toLowerCase(),
  );
  if (!accountData) {
    return 0;
  }

  return parseFloat(accountData.askPrice);
}

export function getAccountNFTQuantity(
  data: { askPrice: string; seller: { id: string }; amount: string }[],
  accountId: `0x${string}`,
): string {
  if (!Array.isArray(data) || data.length === 0) {
    return '0';
  }

  const accountData = data.find(
    item => item.seller.id.toLowerCase() === accountId.toLowerCase(),
  );
  if (!accountData) {
    return '0';
  }

  return accountData.amount;
}

export function isOwnNft(
  accountAddress: `0x${string}` | undefined,
  data: { askPrice: string; seller: { id: string } }[],
): boolean {
  if (!accountAddress) {
    return false;
  }
  return data.some(
    ask => ask.seller.id.toLowerCase() === accountAddress.toLowerCase(),
  );
}

export const getCountryFlag = (countryName: string): string => {
  const countryFlags: Record<string, string> = {
    'United States': '🇺🇸',
    USA: '🇺🇸',
    Canada: '🇨🇦',
    'United Kingdom': '🇬🇧',
    UK: '🇬🇧',
    Germany: '🇩🇪',
    France: '🇫🇷',
    Italy: '🇮🇹',
    Spain: '🇪🇸',
    Netherlands: '🇳🇱',
    Belgium: '🇧🇪',
    Switzerland: '🇨🇭',
    Austria: '🇦🇹',
    Sweden: '🇸🇪',
    Norway: '🇳🇴',
    Denmark: '🇩🇰',
    Finland: '🇫🇮',
    Poland: '🇵🇱',
    'Czech Republic': '🇨🇿',
    Hungary: '🇭🇺',
    Portugal: '🇵🇹',
    Greece: '🇬🇷',
    Ireland: '🇮🇪',
    Luxembourg: '🇱🇺',
    Slovenia: '🇸🇮',
    Slovakia: '🇸🇰',
    Croatia: '🇭🇷',
    Romania: '🇷🇴',
    Bulgaria: '🇧🇬',
    Lithuania: '🇱🇹',
    Latvia: '🇱🇻',
    Estonia: '🇪🇪',
    Malta: '🇲🇹',
    Cyprus: '🇨🇾',
    Japan: '🇯🇵',
    China: '🇨🇳',
    India: '🇮🇳',
    'South Korea': '🇰🇷',
    Australia: '🇦🇺',
    'New Zealand': '🇳🇿',
    Brazil: '🇧🇷',
    Mexico: '🇲🇽',
    Argentina: '🇦🇷',
    Chile: '🇨🇱',
    Colombia: '🇨🇴',
    Peru: '🇵🇪',
    'South Africa': '🇿🇦',
    Nigeria: '🇳🇬',
    Egypt: '🇪🇬',
    Morocco: '🇲🇦',
    Turkey: '🇹🇷',
    Russia: '🇷🇺',
    Ukraine: '🇺🇦',
    Israel: '🇮🇱',
    'Saudi Arabia': '🇸🇦',
    UAE: '🇦🇪',
    'United Arab Emirates': '🇦🇪',
    Thailand: '🇹🇭',
    Singapore: '🇸🇬',
    Malaysia: '🇲🇾',
    Indonesia: '🇮🇩',
    Philippines: '🇵🇭',
    Vietnam: '🇻🇳',
    Unknown: '🏳️',
  };

  return countryFlags[countryName] || '🌍';
};
