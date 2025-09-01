import {useMemo} from 'react';
import {ethers} from 'ethers';
import { contractManager } from '../../services/blockchain/contracts';

/**
 * @deprecated Use contractManager directly from services/blockchain/contracts
 * This file is kept for backward compatibility
 */

type UseContractOptions = {
  chainId?: string | number;
  network?: string;
};

export function useContract(
  address?: `0x${string}`,
  abi?: ethers.InterfaceAbi,
  options?: UseContractOptions,
) {
  const network = options?.network ?? 'sepolia';

  return useMemo(() => {
    if (!address || !abi) {return null;}

    try {
      return contractManager.getContract(address, abi, network);
    } catch (error) {
      console.error('Failed to get contract:', error);
      return null;
    }
  }, [address, abi, network]);
}

export const useERC20 = (
  address?: `0x${string}`,
  options?: UseContractOptions,
) => {
  const network = options?.network ?? 'sepolia';
  return useMemo(() => {
    if (!address) {return null;}
    return contractManager.getERC20Contract(address, network);
  }, [address, network]);
};

export const getNftMarketContract = (signer?: ethers.Signer, network: string = 'sepolia') => {
  return contractManager.getNFTMarketplaceContract(network, signer);
};

export const useNftMarketCollectionContract = (
  collectionAddress: `0x${string}` | undefined,
  options?: UseContractOptions,
) => {
  const network = options?.network ?? 'sepolia';
  return useMemo(() => {
    if (!collectionAddress) {return null;}
    return contractManager.getERC1155Contract(collectionAddress, network);
  }, [collectionAddress, network]);
};
