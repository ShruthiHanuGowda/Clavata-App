import {useCallback, useMemo} from 'react';
import {
  BrowserProvider,
  Contract,
  JsonRpcProvider,
  TransactionReceipt,
  TransactionResponse,
} from 'ethers';
import {useGasPrice} from './useGasPrice';
import {useMagic} from '../../../screens/Provider/MagicProvider';

type Overrides = {
  gas?: bigint;
  value?: bigint;
  [key: string]: any;
};

export function useCallWithGasPrice() {
  // const gasPrice = useGasPrice();
  const {magic_denergy} = useMagic();

  const provider = new BrowserProvider(magic_denergy.rpcProvider as any);

  const callWithGasPrice = useCallback(
    async (
      contract: Contract | null,
      methodName: string,
      methodArgs: any[] = [],
      overrides: Overrides = {},
    ): Promise<TransactionReceipt> => {
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
        console.log(methodName);

        const signer = await provider.getSigner();
        console.log('signer', signer);

        const connectedContract = contract.connect(signer);
        console.log(signer);

        try {
          const tx: TransactionResponse = await connectedContract[methodName](
            ...methodArgs,
            {
              ...overrides,
              // gasPrice,
              // gasLimit, // Uncomment if you re-add gas estimation
            },
          );

          return tx.wait() as Promise<TransactionReceipt>;
        } catch (error) {
          console.error(`Transaction failed for method ${methodName}:`, error);
          throw new Error(`Transaction failed for method ${methodName}`);
        }
      } catch (error) {
        console.log(error);
      }
    },
    [provider],
  );

  return {callWithGasPrice};
}
