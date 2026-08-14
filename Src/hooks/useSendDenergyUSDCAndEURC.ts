import {useMutation} from '@apollo/client';
import {useState} from 'react';
import {ethers} from 'ethers';
import {CREATE_TRANSACTION_HISTORY_MOBILE} from '../graphql/queries';
import {
  CUSTOM_NETWORK_CHAIN_ID,
  CUSTOM_RPC_URL,
  DENERGY_EURC_ADDRESS,
  DENERGY_USDC_ADDRESS,
} from '../constants/constants';
import {ERC20_ABI} from '../utils/Contracts';

const DENERGY_RPC_URL = CUSTOM_RPC_URL;
const DENERGY_CHAIN_ID = CUSTOM_NETWORK_CHAIN_ID;
const provider = new ethers.JsonRpcProvider(DENERGY_RPC_URL);

export const TOKEN_ADDRESSES_DENERGY = {
  USDC: DENERGY_USDC_ADDRESS,
  EURC: DENERGY_EURC_ADDRESS,
};

interface TokenTransactionDetails {
  to: string;
  amount: string;
  tokenAddress: string;
  coinCode: string;
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

  const [createTransactionHistoryMobile] = useMutation(
    CREATE_TRANSACTION_HISTORY_MOBILE,
  );

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
        !ethers.isAddress(userAddress) ||
        !ethers.isAddress(transactionDetails.to)
      ) {
        throw new Error('Invalid Ethereum wallet address');
      }

      // Check network ID
      const network = await provider.getNetwork();
      if (network.chainId.toString() !== DENERGY_CHAIN_ID) {
        throw new Error('Please switch to the Denergy testnet network');
      }

      const tokenContract = new ethers.Contract(
        transactionDetails.tokenAddress,
        ERC20_ABI,
        provider,
      );

      // Get token decimals and symbol
      const tokenDecimals = await tokenContract.decimals();
      const tokenSymbol = await tokenContract.symbol();

      // Convert amount to token's smallest unit using the correct decimals
      const amountInSmallestUnit = ethers.parseUnits(
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

      // Estimate gas for the transaction
      const gasEstimate = await tokenContract.transfer.estimateGas(
        transactionDetails.to,
        amountInSmallestUnit,
        {from: userAddress},
      );

      // Get gas price
      const feeData = await provider.getFeeData();
      const gasPrice = feeData.gasPrice || ethers.parseUnits('20', 'gwei');

      // Calculate gas cost
      const gasCost = gasEstimate * gasPrice;

      // Check if user has enough native tokens for gas
      const ethBalance = await provider.getBalance(userAddress);
      if (ethBalance < gasCost) {
        throw new Error('Insufficient native tokens for gas fees');
      }

      // Prepare transaction parameters
      const transferData = tokenContract.interface.encodeFunctionData(
        'transfer',
        [transactionDetails.to, amountInSmallestUnit],
      );

      const txParams = {
        from: userAddress,
        to: transactionDetails.tokenAddress,
        data: transferData,
        gas: '0x' + gasEstimate.toString(16),
        gasPrice: '0x' + gasPrice.toString(16),
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
        await createTransactionHistoryMobile({
          variables: {
            input: {
              transactionHash: receipt.hash,
              method: 'send',
              createdAt: new Date().toISOString(),
              from: userAddress,
              to: transactionDetails.to,
              amount: parseFloat(transactionDetails.amount),
              txnFee: parseFloat(gasCost.toString()),
              coinCode: transactionDetails.coinCode,
              transactionStatus: 'success',
            },
          },
        });
        onSuccess({
          txHash: txHash,
          networkName: 'Denergy Testnet',
          gasFee: ethers.formatEther(gasCost),
          totalCost: ethers.formatUnits(amountInSmallestUnit, tokenDecimals),
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
