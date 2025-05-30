import {useMemo} from 'react';
import {TOKEN_CONTRACTS} from '../../constants';
import {AbiCoder, ethers, InterfaceAbi} from 'ethers';
import {
  ERC1155_ABI,
  ERC20_ABI,
  NFT_MARKETPLACE_ABI,
} from '../../utils/Contracts';

/**
 * Helper hooks to get specific contracts (by ABI)
 */

type UseContractOptions = {
  chainId?: string | number;
};

type GetContractParams<TAbi extends ethers.ContractInterface> = {
  abi: InterfaceAbi;
  address: string;
  provider?: ethers.Provider;
  signer?: ethers.Signer;
};

export const getContract = <TAbi extends ethers.ContractInterface>({
  abi,
  address,
  provider,
  signer,
}: GetContractParams<TAbi>): ethers.Contract => {
  const baseProvider = signer ?? provider;
  return new ethers.Contract(address, abi, baseProvider);
};

export function useContract(
  addressOrAddressMap?: `0x${string}` | {[chainId: number]: `0x${string}`},
  abi?: ethers.InterfaceAbi,
  options?: UseContractOptions,
) {
  const chainId = options?.chainId ?? 1;

  return useMemo(() => {
    if (!addressOrAddressMap || !abi || !chainId) return null;

    const address =
      typeof addressOrAddressMap === 'string'
        ? addressOrAddressMap
        : addressOrAddressMap[chainId];

    if (!address) return null;

    try {
      return getContract({
        abi,
        address,
      });
    } catch (error) {
      console.error('Failed to get contract:', error);
      return null;
    }
  }, [addressOrAddressMap, abi, chainId]);
}

export const useERC20 = (
  address?: `0x${string}`,
  options?: UseContractOptions,
) => {
  return useContract(address, ERC20_ABI, options);
};

export const getNftMarketContract = (signer?: any) => {
  return getContract({
    abi: NFT_MARKETPLACE_ABI,
    address: TOKEN_CONTRACTS.nftMarket as `0x${string}`,
    signer,
  });
};

export const useNftMarketCollectionContract = (
  collectionAddress: `0x${string}` | undefined,
) => {
  return useContract(collectionAddress, ERC1155_ABI as any);
};
