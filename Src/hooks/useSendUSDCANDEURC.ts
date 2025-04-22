import {useState} from 'react';
import {
  BrowserProvider,
  Contract,
  JsonRpcProvider,
  TransactionReceipt,
  formatUnits,
  parseUnits,
} from 'ethers';

const INFURA_URL =
  'https://sepolia.infura.io/v3/60c88b9a394a48e8b459bcfa38dfaede';
const infuraProvider = new JsonRpcProvider(INFURA_URL);

// Token addresses
export const TOKEN_ADDRESSES = {
  USDC: '0x1c7D4B196Cb0C7B01d743Fbc6116a902379C7238',
  EURC: '0x08210F9170F89Ab7658F0B5E3fF39b0E03C594D4',
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

type SuccessCallback = (result: TransactionSuccess) => void;

/**
 * Custom hook for handling USDC and EURC transactions on Sepolia using Magic SDK
 *
 * @param magic - Magic SDK instance
 * @param userAddress - User's public address
 * @returns Transaction state and functions
 */
export const useSendUSDCANDEURC = (
  magic: any,
  userAddress: string | undefined,
) => {
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  /**
   * Send a USDC or EURC transaction on Sepolia
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

      // Check network ID
      const network = await infuraProvider.getNetwork();
      if (network.chainId !== BigInt(11155111)) {
        throw new Error('Please switch to the Sepolia network');
      }

      // Initialize token contract with infura provider
      const tokenContract = new Contract(
        transactionDetails.tokenAddress,
        ERC20_ABI,
        infuraProvider,
      );

      // Get token decimals and symbol
      const tokenDecimals = await tokenContract.decimals();
      const tokenSymbol = await tokenContract.symbol();

      // Convert amount to token's smallest unit using the correct decimals
      const amountInSmallestUnit = parseUnits(
        transactionDetails.amount,
        tokenDecimals,
      );

      // Check user's token balance
      const userTokenBalance = await tokenContract.balanceOf(userAddress);
      if (userTokenBalance < amountInSmallestUnit) {
        throw new Error(
          `Insufficient ${tokenSymbol} balance for the transaction`,
        );
      }

      // Get Magic provider for signing transactions
      const magicProvider = new BrowserProvider(magic.rpcProvider);
      const signer = await magicProvider.getSigner();

      // Connect signer to token contract
      const connectedContract = tokenContract.connect(signer);

      // Estimate gas for the transaction
      const gasEstimate = await connectedContract.transfer.estimateGas(
        transactionDetails.to,
        amountInSmallestUnit,
      );

      // Get gas price
      const feeData = await infuraProvider.getFeeData();
      const gasPrice = feeData.gasPrice ?? parseUnits('50', 9); // Default if null

      // Calculate gas cost
      const gasCost = gasEstimate * gasPrice;

      // Check if user has enough ETH for gas
      const ethBalance = await infuraProvider.getBalance(userAddress);
      if (ethBalance < gasCost) {
        throw new Error('Insufficient ETH for gas fees');
      }

      // Prepare transaction parameters
      const tx = await connectedContract.transfer(
        transactionDetails.to,
        amountInSmallestUnit,
        {
          gasLimit: gasEstimate,
          gasPrice: gasPrice,
        },
      );

      // Wait for transaction to be mined
      const receipt = await tx.wait();

      // Call success callback if provided
      if (onSuccess && typeof onSuccess === 'function' && receipt) {
        onSuccess({
          txHash: receipt.hash,
          networkName: 'Sepolia Testnet',
          gasFee: formatUnits(gasCost, 18),
          totalCost: formatUnits(amountInSmallestUnit, tokenDecimals),
          tokenSymbol: tokenSymbol,
        });
      }

      return receipt;
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
