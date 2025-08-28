import {useState} from 'react';
import {
  BrowserProvider,
  formatUnits,
  parseUnits,
  JsonRpcProvider,
  TransactionReceipt,
} from 'ethers';
import {useMutation} from '@apollo/client';
import {CREATE_TRANSACTION_HISTORY_MOBILE} from '../graphql/queries';
import {SEPOLIA_RPC_URL} from '../constants';

const INFURA_URL = SEPOLIA_RPC_URL;
const infuraProvider = new JsonRpcProvider(INFURA_URL);

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
 * Custom hook for handling Ethereum transactions using Magic SDK
 * @param magic - Magic SDK instance
 * @param userAddress - User's public address
 * @returns Transaction state and functions
 */
export const useSendEth = (magic: any, userAddress: string | undefined) => {
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const [createTransactionHistoryMobile] = useMutation(
    CREATE_TRANSACTION_HISTORY_MOBILE,
  );
  console.log('error', error, isLoading);
  /**
   * Send an Ethereum transaction
   * @param transactionDetails - Transaction details
   * @param onSuccess - Optional callback for successful transaction
   */
  const sendTransaction = async (
    transactionDetails: TransactionDetails,
    onSuccess?: SuccessCallback,
  ): Promise<TransactionReceipt | undefined> => {
    console.log('transactionDetails', transactionDetails);
    try {
      if (!magic || !userAddress) {
        throw new Error('Magic SDK or user address not available');
      }

      setIsLoading(true);
      setError(null);
      console.log(magic.rpcProvider);

      // Get Magic provider for signing transactions
      const magicProvider = new BrowserProvider(magic.rpcProvider);
      const signer = await magicProvider.getSigner();

      // Convert amount to wei
      const amountInWei = parseUnits(transactionDetails.amount, 18);

      // Estimate gas price
      const gasPrice = await infuraProvider.getFeeData();
      console.log('🚀 ~ gasPrice:', gasPrice);

      // Estimate gas limit for the transaction
      const gasEstimate = await infuraProvider.estimateGas({
        from: userAddress,
        to: transactionDetails.to,
        value: amountInWei,
      });

      // Check if user has enough balance for transaction + gas
      const balanceInWei = await infuraProvider.getBalance(userAddress);
      const gasCost = gasEstimate * (gasPrice.gasPrice ?? parseUnits('50', 9)); // Default gas price if null
      const totalCost = amountInWei + gasCost;

      if (balanceInWei < totalCost) {
        throw new Error('Insufficient funds for gas and transaction amount');
      }

      // Create transaction with explicit gas parameters
      const tx = await signer.sendTransaction({
        to: transactionDetails.to,
        value: amountInWei,
        gasLimit: gasEstimate,
        gasPrice: gasPrice.gasPrice,
        chainId: 11155111, // Sepolia chain ID
      });

      console.log('🚀 ~ tx:', tx);

      // Wait for transaction to be mined
      const receipt = await tx.wait();
      console.log('🚀 ~ receipt:', receipt);

      try {
        const {data} = await createTransactionHistoryMobile({
          variables: {
            input: {
              transactionHash: receipt?.hash,
              method: 'send',
              createdAt: new Date().toISOString(),
              from: userAddress,
              to: transactionDetails.to,
              amount: parseFloat(transactionDetails.amount),
              txnFee: parseFloat(gasCost.toString()),
              coinCode: 'ETH',
              transactionStatus: 'success',
            },
          },
        });
      } catch (error: any) {
        throw new Error(error);
      }

      // Call success callback if provided
      if (onSuccess && typeof onSuccess === 'function' && receipt) {
        onSuccess({
          txHash: receipt.hash,
          networkName: 'Sepolia Testnet',
          gasFee: formatUnits(gasCost, 18),
          totalCost: totalCost,
        });
      }
      setIsLoading(false);
      return receipt;
    } catch (err: any) {
      console.error('Transaction error:', err);
      setError(err.message || 'Transaction failed');
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
