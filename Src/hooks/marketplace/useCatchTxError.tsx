import {useCallback, useState} from 'react';
import {ethers, Provider, TransactionReceipt} from 'ethers';
import {isUserRejected} from './reject';
import {SnackBarMessage} from '../../utils/snackBar';

type Params = {
  throwUserRejectError?: boolean;
  throwCustomError?: () => void;
};

export default function useCatchTxError(params?: Params) {
  const {throwUserRejectError = false, throwCustomError} = params || {};
  const [loading, setLoading] = useState(false);
  const [txResponseLoading, setTxResponseLoading] = useState(false);

  const waitForTxReceipt = async (provider: Provider, hash: string) => {
    const receipt = await provider.waitForTransaction(hash);
    return receipt;
  };

  const fetchWithCatchTxError = useCallback(
    async (
      callTx: () => Promise<TransactionReceipt | string | undefined>,
      provider?: Provider,
    ) => {
      let tx: any = null;

      try {
        setLoading(true);
        tx = await callTx();
        if (!tx) return null;

        const receipt: any = tx;
        if (receipt?.status === 1) {
          SnackBarMessage(`Transaction Submitted!`, 'success');
          return receipt;
        } else {
          throw new Error('Transaction failed.');
        }
      } catch (error: any) {
        if (!isUserRejected(error)) {
          if (!tx && !throwCustomError) {
            console.error('[Tx Error]', error);
          } else if (throwCustomError) {
            throwCustomError();
          } else {
            console.error('[Tx Failed]', error);
          }
        }

        if (throwUserRejectError) throw error;
      } finally {
        setLoading(false);
      }

      return null;
    },
    [throwUserRejectError, throwCustomError],
  );

  const fetchTxResponse = useCallback(
    async (
      callTx: () => Promise<{hash: string} | string | undefined>,
    ): Promise<{hash: string} | null> => {
      let tx: {hash: string} | string | null | undefined = null;

      try {
        setTxResponseLoading(true);
        tx = await callTx();
        if (!tx) return null;

        const hash = typeof tx === 'string' ? tx : tx.hash;
        return {hash};
      } catch (error: any) {
        if (!isUserRejected(error)) {
          console.error('[Tx Error]', error);
        }
      } finally {
        setTxResponseLoading(false);
      }

      return null;
    },
    [],
  );

  return {
    fetchWithCatchTxError,
    fetchTxResponse,
    loading,
    txResponseLoading,
  };
}
