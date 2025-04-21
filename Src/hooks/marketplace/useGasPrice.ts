import {JsonRpcProvider, JsonRpcSigner} from 'ethers';
import {useEffect, useState} from 'react';
import {CUSTOM_RPC_URL} from '../../constants';
import { logMissingFieldErrors } from '@apollo/client/core/ObservableQuery';

export function useGasPrice(
  signer?: JsonRpcSigner,
  chainIdOverride?: number,
): bigint | undefined {
  const chainId = chainIdOverride ?? 1;

  const [gasPrice, setGasPrice] = useState<bigint | undefined>(undefined);

  useEffect(() => {
    const fetchGasPrice = async () => {
      if (signer) {
        try {
          const provider =
            signer.provider || new JsonRpcProvider(CUSTOM_RPC_URL);

          const fetchedGasPrice = await provider.estimateGas({
            from: await signer.getAddress(),
          });
          setGasPrice(fetchedGasPrice);
        } catch (error) {
          console.error('Error fetching gas price:', error);
          setGasPrice(BigInt(1));
        }
      }
    };

    fetchGasPrice();

    return () => {
      setGasPrice(undefined);
    };
  }, [signer, chainId]);

  return gasPrice;
}
