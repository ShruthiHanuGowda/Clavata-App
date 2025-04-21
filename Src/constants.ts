// network
export const CUSTOM_RPC_URL = 'https://rpc.denergytestnet.com';
export const SEPOLIA_RPC_URL =
  'https://sepolia.infura.io/v3/60c88b9a394a48e8b459bcfa38dfaede';
export const CUSTOM_NETWORK = 'denergy';
export const CUSTOM_NETWORK_CHAIN_ID = 4442;

// ERC20 ABI (minimal for balanceOf function)
export const ERC20_ABI = [
  {
    constant: true,
    inputs: [{name: 'owner', type: 'address'}],
    name: 'balanceOf',
    outputs: [{name: '', type: 'uint256'}],
    type: 'function',
  },
];

// contract token
export const TOKEN_CONTRACTS = {
  denergy: {
    USDC: '0x4A50915Be4c0CEADE5EFFf28a2e6a22B9a0c49e4',
    EURC: '0x9abaD0Dfd8F5ce10A8a6EeBbd852922de21f6F22',
  },
  sepolia: {
    USDC: '0x1c7D4B196Cb0C7B01d743Fbc6116a902379C7238',
    EURC: '0x08210F9170F89Ab7658F0B5E3fF39b0E03C594D4',
  },
};

export const API_NFT_URL =
  'https://y2veqyu78j.execute-api.me-central-1.amazonaws.com/default';

export const GRAPH_API_NFTMARKET =
  'https://nftmarket-subgraph.wattswaps.com/subgraphs/name/nftmarket-subgraph';
