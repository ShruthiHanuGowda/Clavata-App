import {useCallback, useMemo} from 'react';
import {
  BrowserProvider,
  Contract,
  TransactionReceipt,
  TransactionResponse,
} from 'ethers';
import {useMagic} from '../../../screens/Provider/MagicProvider';
import {SnackBarMessage} from '../../utils/snackBar';

type Overrides = {
  gas?: bigint;
  value?: bigint;
  [key: string]: any;
};

export function useCallWithGasPrice() {
  // const gasPrice = useGasPrice();
  const {magic} = useMagic();

  const provider = useMemo(() => new BrowserProvider(magic.rpcProvider as any), [magic]);

  const callWithGasPrice = useCallback(
    async (
      contract: Contract | null,
      methodName: string,
      methodArgs: any[] = [],
      overrides: Overrides = {},
    ): Promise<TransactionReceipt | undefined> => {
      try {
        if (!provider) {
          throw new Error('Ethereum provider not ready yet.');
        }

        if (!contract) {
          throw new Error('No valid contract provided');
        }

        if (!methodName) {
          throw new Error('No method name provided');
        }

        const signer = await provider.getSigner();

        const connectedContract = contract.connect(signer);

        try {
          const tx: TransactionResponse = await (connectedContract as any)[methodName](
            ...methodArgs,
            {
              ...overrides,
              // gasPrice,
              // gasLimit,
            },
          );

          return tx.wait() as Promise<TransactionReceipt>;
        } catch (error) {
          console.error(`Transaction failed for method ${methodName}:`, error);
          const errorMessage = error instanceof Error ? error.message : 'Unknown error';
          SnackBarMessage(
            `Transaction failed for method ${errorMessage}`,
            'error',
          );
          // throw new Error(`Transaction failed for method ${methodName}`);
        }
      } catch (error) {
        console.log(error);
      }
    },
    [provider],
  );

  return {callWithGasPrice};
}
