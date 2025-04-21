import {useCallback} from 'react';
import {
  BrowserProvider,
  Contract,
  Interface,
  TransactionResponse,
} from 'ethers';
import {useGasPrice} from './useGasPrice';
import {useMagic} from '../../../screens/Provider/MagicProvider';
import {calculateGasMargin} from '../../utils/gasMargin';

type Overrides = {
  gas?: bigint;
  value?: bigint;
  [key: string]: any;
};

export function useCallWithGasPrice() {
  const gasPrice = useGasPrice();
  const {magic_denergy} = useMagic();

  const provider = new BrowserProvider(magic_denergy.rpcProvider as any);

  const callWithGasPrice = useCallback(
    async (
      contract: Contract | null,
      methodName: string,
      methodArgs: any[] = [],
      overrides: Overrides = {},
    ): Promise<{hash: string | null}> => {
      if (!contract) throw new Error('No valid contract provided');
      if (!methodName) throw new Error('No method name provided');

      const signer = await provider.getSigner();
      const connectedContract = contract.connect(signer);

      let {gas, ...txOverrides} = overrides;

      // Estimate gas if not provided
      if (!gas) {
        try {
          gas = await connectedContract[methodName].estimateGas(
            ...methodArgs,
            txOverrides,
          );
        } catch (error) {
          console.error(
            `Gas estimation failed for method ${methodName}:`,
            error,
          );
          throw new Error('Gas estimation failed');
        }
      }

      // Ensure gas is defined before passing to calculateGasMargin
      if (!gas) {
        throw new Error('Gas value is undefined after estimation.');
      }

      const gasLimit = calculateGasMargin(gas);

      try {
        const tx: TransactionResponse = await connectedContract[methodName](
          ...methodArgs,
          {
            ...txOverrides,
            gasLimit,
            gasPrice,
          },
        );

        return {hash: tx.wait()};
      } catch (error) {
        console.error(`Transaction failed for method ${methodName}:`, error);
        throw new Error(`Transaction failed for method ${methodName}`);
      }
    },
    [gasPrice, provider],
  );

  return {callWithGasPrice};
}
