import { useState } from 'react';
import { formatUnits, parseUnits, JsonRpcProvider } from 'ethers';
import { CREATE_TRANSACTION_HISTORY_MOBILE } from '../graphql/queries';
import { useMutation } from '@apollo/client';
import {
  CUSTOM_NETWORK_CHAIN_ID,
  CUSTOM_RPC_URL,
  DEFAULT_GAS_LIMIT,
} from '../constants/constants';
import { errorService, TransactionError } from '../services/errorService';

const DENERGY_RPC_URL = CUSTOM_RPC_URL;

const dengergyProvider = new JsonRpcProvider(DENERGY_RPC_URL);

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
export const useSendWatt = (magic: any, userAddress: string | undefined) => {
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<TransactionError | null>(null);
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

      const amountInWei = parseUnits(transactionDetails.amount, 18);
      const gasPrice = await dengergyProvider.getFeeData();

      const gasEstimate = await dengergyProvider.estimateGas({
        from: userAddress,
        to: transactionDetails.to,
        value: amountInWei,
      });

      const balanceInWei = await dengergyProvider.getBalance(userAddress);
      const gasCost = gasEstimate * (gasPrice.gasPrice ?? parseUnits('50', 9));
      const totalCost = amountInWei + gasCost;

      if (balanceInWei < totalCost) {
        throw new Error('Insufficient funds for gas and transaction amount');
      }

      const txParams = {
        from: userAddress,
        to: transactionDetails.to,
        value: `0x${amountInWei.toString(16)}`,
        gas: `0x${gasEstimate.toString(16)}`,
        gasPrice: gasPrice.gasPrice
          ? `0x${gasPrice.gasPrice.toString(16)}`
          : DEFAULT_GAS_LIMIT,
        chainId: CUSTOM_NETWORK_CHAIN_ID,
      };

      const provider = magic.rpcProvider;

      const txHash = await provider.request({
        method: 'eth_sendTransaction',
        params: [txParams],
      });

      if (onSuccess && typeof onSuccess === 'function') {
        try {
          // await createTransactionHistoryMobile({
          //   variables: {
          //     input: {
          //       transactionHash: txHash,
          //       method: 'send',
          //       createdAt: new Date().toISOString(),
          //       from: userAddress,
          //       to: transactionDetails.to,
          //       amount: parseFloat(transactionDetails.amount),
          //       txnFee: parseFloat(gasCost.toString()),
          //       coinCode: 'WATT',
          //       transactionStatus: 'success',
          //     },
          //   },
          // });
        } catch (historyError: any) {
          throw new Error(historyError);
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
      const txError = errorService.handleTransactionError(err, 'useSendWATT');
      setError(txError);
      throw txError;
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
      const validationError = errorService.handleTransactionError(
        err,
        'useSendWATT.validateTransaction',
      );
      setError(validationError);
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
