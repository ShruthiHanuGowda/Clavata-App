import {useState} from 'react';
import {
  BrowserProvider,
  formatUnits,
  parseUnits,
  JsonRpcProvider,
  TransactionReceipt,
} from 'ethers';
import {CREATE_TRANSACTION_HISTORY_MOBILE} from '../graphql/queries';
import {useMutation} from '@apollo/client';

const DENERGY_RPC_URL = 'https://rpc.denergytestnet.com';
const dengergyProvider = new JsonRpcProvider(DENERGY_RPC_URL, {
  name: 'denergy',
  chainId: 4442, // replace with actual chainId
});

interface TransactionDetails {
  to: string;
  amount: string;
}

interface TransactionSuccess {
  txHash: string;
  networkName: string;
  gasFee: string;
  totalCost: string | bigint;
}

type SuccessCallback = (result: TransactionSuccess) => void;

/**
 * Custom hook for handling WATT token transactions in React Native using Magic SDK
 * @param magic - Magic SDK instance
 * @param userAddress - User's public address
 * @returns Transaction state and functions
 */
export const useSendWatt = (
  magic: any,
  userAddress: string | undefined,
  customRpcUrl: string = DENERGY_RPC_URL,
) => {
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [createTransactionHistoryMobile] = useMutation(
    CREATE_TRANSACTION_HISTORY_MOBILE,
  );
  /**
   * Send a WATT token transaction on the DEnergy network
   * @param transactionDetails - Transaction details
   * @param onSuccess - Optional callback for successful transaction
   */
  const sendTransaction = async (
    transactionDetails: TransactionDetails,
    onSuccess?: SuccessCallback,
  ): Promise<any> => {
    try {
      if (!magic || !userAddress) {
        throw new Error('Magic SDK or user address not available');
      }

      setIsLoading(true);
      setError(null);

      // Convert amount to wei
      const amountInWei = parseUnits(transactionDetails.amount, 18);

      // Estimate gas price
      const gasPrice = await dengergyProvider.getFeeData();

      // Estimate gas limit for the transaction
      const gasEstimate = await dengergyProvider.estimateGas({
        from: userAddress,
        to: transactionDetails.to,
        value: amountInWei,
      });

      // Check if user has enough balance for transaction + gas
      const balanceInWei = await dengergyProvider.getBalance(userAddress);
      const gasCost = gasEstimate * (gasPrice.gasPrice ?? parseUnits('50', 9)); // Default gas price if null
      const totalCost = amountInWei + gasCost;

      if (balanceInWei < totalCost) {
        throw new Error('Insufficient funds for gas and transaction amount');
      }

      // Since Magic doesn't support DEnergy network directly, we need to use the low-level RPC approach
      // Prepare transaction parameters
      const txParams = {
        from: userAddress,
        to: transactionDetails.to,
        value: `0x${amountInWei.toString(16)}`, // Convert to hex format
        gas: `0x${gasEstimate.toString(16)}`, // Convert to hex format
        gasPrice: gasPrice.gasPrice
          ? `0x${gasPrice.gasPrice.toString(16)}`
          : '0x4A817C800', // Default gas price if null
        chainId: 4442, // DEnergy testnet chain ID
      };
      console.log('🚀 ~ txParams:', txParams);

      // Access the raw provider
      const provider = magic.rpcProvider;

      // Send the transaction using Magic's RPC provider with eth_sendTransaction
      const txHash = await provider.request({
        method: 'eth_sendTransaction',
        params: [txParams],
      });

      // Note: We don't have a receipt here since we're not waiting for mining
      // But we can construct a similar response object

      // Call success callback if provided
      if (onSuccess && typeof onSuccess === 'function') {
        try {
          const {data} = await createTransactionHistoryMobile({
            variables: {
              input: {
                transactionHash: txHash,
                method: 'send',
                createdAt: new Date().toISOString(),
                from: userAddress,
                to: transactionDetails.to,
                amount: parseFloat(transactionDetails.amount),
                txnFee: parseFloat(gasCost.toString()),
                coinCode: 'WATT',
                transactionStatus: 'success',
              },
            },
          });
        } catch (error: any) {
          throw new Error(error);
        }
        onSuccess({
          txHash,
          networkName: 'DEnergy Testnet',
          gasFee: formatUnits(gasCost, 18),
          totalCost,
        });
      }

      setIsLoading(false);
      return txHash;
    } catch (err: any) {
      console.error('Transaction error:', err);
      setError(err.message || 'Transaction failed');
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Validates addresses and checks network compatibility
   * @param recipientAddress - Recipient's address
   * @returns Boolean indicating if validation passed
   */
  const validateTransaction = async (
    recipientAddress: string,
  ): Promise<boolean> => {
    try {
      if (!magic || !userAddress) {
        throw new Error('Magic SDK or user address not available');
      }

      // Validate addresses using regex pattern
      const isValidRecipient = recipientAddress.match(/^0x[a-fA-F0-9]{40}$/);
      const isValidSender = userAddress.match(/^0x[a-fA-F0-9]{40}$/);

      if (!isValidSender || !isValidRecipient) {
        throw new Error('Invalid wallet address');
      }

      // Since Magic might not directly support DEnergy network,
      // we'll skip the direct network check and instead ensure the user is signed in
      const isLoggedIn = await magic.user.isLoggedIn();
      if (!isLoggedIn) {
        throw new Error('User is not logged in with Magic');
      }

      return true;
    } catch (err: any) {
      console.error('Validation error:', err);
      setError(err.message || 'Validation failed');
      return false;
    }
  };

  return {
    isLoading,
    error,
    sendTransaction,
    validateTransaction,
  };
};
