// network
export const CUSTOM_RPC_URL = 'https://rpc.denergytestnet.com'; // Update with your actual RPC URL
export const SEPOLIA_RPC_URL =
  'https://sepolia.infura.io/v3/60c88b9a394a48e8b459bcfa38dfaede'; // Update with your actual RPC URL
export const CUSTOM_NETWORK = 'denergy';

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
    USDC: '0xA0C2961f003f97448c8351f94758e9D4e4b1033b',
  },
  sepolia: {
    USDC: '0x1c7D4B196Cb0C7B01d743Fbc6116a902379C7238',
    EURC: '0x08210F9170F89Ab7658F0B5E3fF39b0E03C594D4',
  },
};
