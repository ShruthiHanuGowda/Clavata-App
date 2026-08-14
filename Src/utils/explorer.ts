import {
  CUSTOM_NETWORK_CHAIN_ID,
  EXPLORER_URL,
  SEPOLIA_CHAIN_ID,
  SEPOLIA_EXPLORER_URL,
} from '../constants/constants';

const denergyTestnet = {
  id: CUSTOM_NETWORK_CHAIN_ID,
  network: 'denergyTestnet',
  name: 'denergyTestnet',
  blockExplorers: {
    default: {
      name: 'Denergy Testnet',
      url: EXPLORER_URL,
    },
  },
};

const sepoliaETHTestnet = {
  id: SEPOLIA_CHAIN_ID,
  network: 'sepolia',
  name: 'sepolia',
  blockExplorers: {
    default: {
      name: 'sepolia',
      url: SEPOLIA_EXPLORER_URL,
    },
  },
};

const chains = [denergyTestnet, sepoliaETHTestnet];

export function getBlockExploreLink(
  data: string | number | undefined | null,
  type: 'transaction' | 'token' | 'address' | 'block' | 'countdown',
  chainIdOverride?: number | string,
): string {
  const chainId = chainIdOverride || CUSTOM_NETWORK_CHAIN_ID;
  const chain = chains.find(c => c.id === chainId);
  if (!chain || !data) {return denergyTestnet.blockExplorers.default.url;}
  switch (type) {
    case 'transaction': {
      return `${chain?.blockExplorers?.default.url}/tx/${data}`;
    }
    case 'token': {
      return `${chain?.blockExplorers?.default.url}/token/${data}`;
    }
    case 'block': {
      return `${chain?.blockExplorers?.default.url}/block/${data}`;
    }
    case 'countdown': {
      return `${chain?.blockExplorers?.default.url}/block/countdown/${data}`;
    }
    default: {
      return `${chain?.blockExplorers?.default.url}/address/${data}`;
    }
  }
}
