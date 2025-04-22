import {useState} from 'react';
import Web3 from 'web3';

// Denergy RPC URL and chain ID
const DENERGY_RPC_URL = 'https://rpc.denergytestnet.com';
const DENERGY_CHAIN_ID = '4442';
const provider = new Web3.providers.HttpProvider(DENERGY_RPC_URL);
const web3 = new Web3(provider);

// Token addresses on Denergy testnet
export const TOKEN_ADDRESSES_DENERGY = {
  USDC: '0x4A50915Be4c0CEADE5EFFf28a2e6a22B9a0c49e4',
  EURC: '0x9abaD0Dfd8F5ce10A8a6EeBbd852922de21f6F22',
};

// Generic ERC20 ABI (works for both USDC and EURC)
const ERC20_ABI = [
  {
    constant: true,
    inputs: [
      {
        name: '_owner',
        type: 'address',
      },
    ],
    name: 'balanceOf',
    outputs: [
      {
        name: 'balance',
        type: 'uint256',
      },
    ],
    payable: false,
    stateMutability: 'view',
    type: 'function',
  },
  {
    constant: false,
    inputs: [
      {
        name: '_to',
        type: 'address',
      },
      {
        name: '_value',
        type: 'uint256',
      },
    ],
    name: 'transfer',
    outputs: [
      {
        name: '',
        type: 'bool',
      },
    ],
    payable: false,
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    constant: true,
    inputs: [],
    name: 'decimals',
    outputs: [
      {
        name: '',
        type: 'uint8',
      },
    ],
    payable: false,
    stateMutability: 'view',
    type: 'function',
  },
  {
    constant: true,
    inputs: [],
    name: 'symbol',
    outputs: [
      {
        name: '',
        type: 'string',
      },
    ],
    payable: false,
    stateMutability: 'view',
    type: 'function',
  },
];

interface TokenTransactionDetails {
  to: string;
  amount: string;
  tokenAddress: string;
}

interface TransactionSuccess {
  txHash: string;
  networkName: string;
  gasFee: string;
  totalCost: string;
  tokenSymbol: string;
}

interface TransactionReceipt {
  hash: string;
  // Add other receipt properties as needed
}

type SuccessCallback = (result: TransactionSuccess) => void;

/**
 * Custom hook for handling USDC and EURC transactions on Denergy testnet using Magic SDK
 *
 * @param magic - Magic SDK instance for Denergy
 * @param userAddress - User's public address
 * @returns Transaction state and functions
 */
export const useSendDenergyUSDCAndEURC = (
  magic: any,
  userAddress: string | undefined,
) => {
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  /**
   * Send a USDC or EURC transaction on Denergy testnet
   * @param transactionDetails - Transaction details including recipient, amount, and token address
   * @param onSuccess - Optional callback for successful transaction
   */
  const sendTransaction = async (
    transactionDetails: TokenTransactionDetails,
    onSuccess?: SuccessCallback,
  ): Promise<TransactionReceipt | undefined> => {
    try {
      if (!magic || !userAddress) {
        throw new Error('Magic SDK or user address not available');
      }

      setIsLoading(true);
      setError(null);

      // Check login status
      const userLoggedIn = await magic.user.isLoggedIn();
      if (!userLoggedIn) {
        throw new Error('User is not logged in');
      }

      // Validate addresses
      if (
        !web3.utils.isAddress(userAddress) ||
        !web3.utils.isAddress(transactionDetails.to)
      ) {
        throw new Error('Invalid Ethereum wallet address');
      }

      // Check network ID
      const networkId = await web3.eth.net.getId();
      if (networkId.toString() !== DENERGY_CHAIN_ID) {
        throw new Error('Please switch to the Denergy testnet network');
      }

      // Initialize token contract
      const tokenContract = new web3.eth.Contract(
        ERC20_ABI,
        transactionDetails.tokenAddress,
      );

      // Get token decimals and symbol
      const tokenDecimals = await tokenContract.methods.decimals().call();
      const tokenSymbol = await tokenContract.methods.symbol().call();

      // Determine multiplier based on decimals (6 for USDC, might be different for EURC)
      let multiplier = 'mwei'; // Default for 6 decimals (like USDC)
      if (tokenDecimals === '18') {
        multiplier = 'ether';
      }

      // Convert amount to token's smallest unit using the correct decimals
      const amountInSmallestUnit = web3.utils.toWei(
        transactionDetails.amount,
        multiplier,
      );

      // Check user's token balance
      const userTokenBalance = await tokenContract.methods
        .balanceOf(userAddress)
        .call();
      if (BigInt(userTokenBalance) < BigInt(amountInSmallestUnit)) {
        throw new Error(
          `Insufficient ${tokenSymbol} balance for the transaction`,
        );
      }

      // Estimate gas for the transaction
      const gasEstimate = await tokenContract.methods
        .transfer(transactionDetails.to, amountInSmallestUnit)
        .estimateGas({from: userAddress});

      // Get gas price
      const gasPrice = await web3.eth.getGasPrice();

      // Calculate gas cost
      const gasCost = BigInt(gasEstimate) * BigInt(gasPrice);

      // Check if user has enough native tokens for gas
      const ethBalance = await web3.eth.getBalance(userAddress);
      if (BigInt(ethBalance) < gasCost) {
        throw new Error('Insufficient native tokens for gas fees');
      }

      // Prepare transaction parameters
      const txParams = {
        from: userAddress,
        to: transactionDetails.tokenAddress,
        data: tokenContract.methods
          .transfer(transactionDetails.to, amountInSmallestUnit)
          .encodeABI(),
        gas: web3.utils.toHex(gasEstimate),
        gasPrice: web3.utils.toHex(gasPrice),
      };

      // Send the transaction using Magic's RPC provider
      const txHash = await magic.rpcProvider.request({
        method: 'eth_sendTransaction',
        params: [txParams],
      });

      // Create a receipt-like object
      const receipt = {hash: txHash};

      // Call success callback if provided
      if (onSuccess && typeof onSuccess === 'function') {
        onSuccess({
          txHash: txHash,
          networkName: 'Denergy Testnet',
          gasFee: web3.utils.fromWei(gasCost.toString(), 'ether'),
          totalCost: web3.utils.fromWei(amountInSmallestUnit, multiplier),
          tokenSymbol: tokenSymbol,
        });
      }

      return receipt as TransactionReceipt;
    } catch (err: any) {
      console.error('Token Transaction error:', err);
      setError(err.message || 'Token transaction failed');
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  return {
    isLoading,
    error,
    sendTransaction,
  };
};
