import { useState, useCallback } from 'react';
import axios from 'axios';
import { NFT_STAKED_ASSETS_API_URL } from '../../../constants';
import { evmToBech32 } from '../../../utils';

/**
 * API Response Interfaces for NFT Stakes
 */
interface NFTDelegationResponse {
  nft_delegation: {
    delegator_address: string;
    validator_address: string;
    nft_contract_address: string;
    token_id: string;
    shares: string; // 18-decimal string (LegacyDec)
  };
  balance: string; // Raw ERC-1155 amount
}

interface NFTStakedAssetsResponse {
  delegations: NFTDelegationResponse[];
  pagination: {
    next_key: string | null;
    total: string;
  };
}

/**
 * Transformed NFT Staked Asset for UI
 */
export interface NFTStakedAsset {
  delegatorAddress: string;
  validatorAddress: string;
  nftContractAddress: string;
  tokenId: string;
  shares: string;
  balance: number;
}

/**
 * Custom hook to fetch NFT staked assets from LCD endpoint
 * GET /denergy/nftstaking/v1/delegations/{delegator_address}
 */
const useNFTStakedAssets = () => {
  const [data, setData] = useState<NFTStakedAsset[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<Error | null>(null);

  /**
   * Fetch NFT staked assets for a delegator
   * @param delegatorAddress - The delegator address (EVM hex or Bech32)
   * @param paginationLimit - Optional pagination limit (default: 50)
   * @param paginationKey - Optional pagination key for next page
   */
  const fetchNFTStakedAssets = useCallback(
    async (
      delegatorAddress: string,
      paginationLimit: number = 50,
      paginationKey?: string,
    ): Promise<NFTStakedAsset[]> => {
      setLoading(true);
      setError(null);

      try {
        // Convert EVM address to Bech32 if needed
        const bech32Address = delegatorAddress.startsWith('0x')
          ? evmToBech32(delegatorAddress, 'denergy')
          : delegatorAddress;

        console.log('Original address:', delegatorAddress);
        console.log('Bech32 address:', bech32Address);

        // Build query parameters
        const params: Record<string, string> = {
          'pagination.limit': paginationLimit.toString(),
        };
        if (paginationKey) {
          params['pagination.key'] = paginationKey;
        }

        // Construct URL
        const url = `${NFT_STAKED_ASSETS_API_URL}/${bech32Address}`;
        console.log('NFT Staked Assets API URL:', url);

        // Make API request
        const response = await axios.get<NFTStakedAssetsResponse>(url, {
          params,
          headers: {
            'Content-Type': 'application/json',
          },
        });

        // Transform response data
        const transformedData: NFTStakedAsset[] = response.data.delegations.map(
          (delegation) => ({
            delegatorAddress: delegation.nft_delegation.delegator_address,
            validatorAddress: delegation.nft_delegation.validator_address,
            nftContractAddress: delegation.nft_delegation.nft_contract_address,
            tokenId: delegation.nft_delegation.token_id,
            shares: delegation.nft_delegation.shares,
            balance: parseInt(delegation.balance, 10),
          }),
        );

        setData(transformedData);
        return transformedData;
      } catch (err) {
        const errorMessage =
          err instanceof Error
            ? err
            : new Error('Failed to fetch NFT staked assets');
        setError(errorMessage);
        console.error('Error fetching NFT staked assets:', err);
        return [];
      } finally {
        setLoading(false);
      }
    },
    [],
  );

  return {
    data,
    loading,
    error,
    fetch: fetchNFTStakedAssets,
  };
};

export default useNFTStakedAssets;
