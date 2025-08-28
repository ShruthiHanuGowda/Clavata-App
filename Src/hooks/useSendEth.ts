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
import {SEPOLIA_CHAIN_ID, SEPOLIA_RPC_URL} from '../constants';

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

  /**
   * Send an Ethereum transaction
   * @param transactionDetails - Transaction details
   * @param onSuccess - Optional callback for successful transaction
   */
  const sendTransaction = async (
    transactionDetails: TransactionDetails,
    onSuccess?: SuccessCallback,
  ): Promise<TransactionReceipt | undefined> => {
    try {
      if (!magic || !userAddress) {
        throw new Error('Magic SDK or user address not available');
      }

      setIsLoading(true);
      setError(null);
      console.log(magic.rpcProvider);

      const magicProvider = new BrowserProvider(magic.rpcProvider);
      const signer = await magicProvider.getSigner();

      const amountInWei = parseUnits(transactionDetails.amount, 18);

      const gasPrice = await infuraProvider.getFeeData();

      const gasEstimate = await infuraProvider.estimateGas({
        from: userAddress,
        to: transactionDetails.to,
        value: amountInWei,
      });

      const balanceInWei = await infuraProvider.getBalance(userAddress);
      const gasCost = gasEstimate * (gasPrice.gasPrice ?? parseUnits('50', 9));
      const totalCost = amountInWei + gasCost;

      if (balanceInWei < totalCost) {
        throw new Error('Insufficient funds for gas and transaction amount');
      }

      const tx = await signer.sendTransaction({
        to: transactionDetails.to,
        value: amountInWei,
        gasLimit: gasEstimate,
        gasPrice: gasPrice.gasPrice,
        chainId: SEPOLIA_CHAIN_ID,
      });

      const receipt = await tx.wait();

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
