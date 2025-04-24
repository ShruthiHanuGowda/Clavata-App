// network
export const CUSTOM_RPC_URL = 'https://rpc.denergytestnet.com';
export const SEPOLIA_RPC_URL =
  'https://sepolia.infura.io/v3/60c88b9a394a48e8b459bcfa38dfaede';
export const CUSTOM_NETWORK = 'denergy';
export const CUSTOM_NETWORK_CHAIN_ID = 4442;

export const USDC_ADDRESS = '0x1c7D4B196Cb0C7B01d743Fbc6116a902379C7238';
export const BANK_ADDRESS = '0xa427CC7f6EA29CCff9b1f3910199C5b087821214';
export const BRIDGE_ADDRESS = '0x986cFDe622234531c6232EcC117a48f6fC04e719';
export const EURC_ADDRESS = '0x08210F9170F89Ab7658F0B5E3fF39b0E03C594D4';
export const DENERGY_USDC_ADDRESS =
  '0x4A50915Be4c0CEADE5EFFf28a2e6a22B9a0c49e4';
export const DENERGY_EURC_ADDRESS =
  '0x9abaD0Dfd8F5ce10A8a6EeBbd852922de21f6F22';
export const DESTINATION_ADDRESS = '0xD3b0FD7E3aE415446e1b9595E3102835B37438D4';

// contract token
export const TOKEN_CONTRACTS = {
  denergy: {
    USDC: DENERGY_USDC_ADDRESS,
    EURC: DENERGY_EURC_ADDRESS,
  },
  sepolia: {
    USDC: USDC_ADDRESS,
    EURC: EURC_ADDRESS,
  },
  nftMarket: '0x7C28Bb005eb59ea04a01379055C9F58C1f683586',
};

export const API_NFT_URL =
  'https://y2veqyu78j.execute-api.me-central-1.amazonaws.com/default';

export const GRAPH_API_NFTMARKET =
  'https://nftmarket-subgraph.wattswaps.com/subgraphs/name/nftmarket-subgraph';
