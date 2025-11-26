import {useState, useCallback} from 'react';
import axios from 'axios';
import {evmToBech32} from '../../../utils';

/**
 * API Response Interfaces for WATT Stakes (Cosmos SDK standard staking)
 */
interface CosmosStakingDelegation {
  delegator_address: string;
  validator_address: string;
  shares: string; // Non-integer decimal string
}

interface CosmosBalance {
  denom: string; // Should be "awatt"
  amount: string; // Amount in awatt (10^-18 WATT)
}

interface DelegationResponse {
  delegation: CosmosStakingDelegation;
  balance: CosmosBalance;
}

interface WATTStakedAssetsResponse {
  delegation_responses: DelegationResponse[];
  pagination: {
    next_key: string | null;
    total: string;
  };
}

/**
 * Transformed WATT Staked Asset for UI
 */
export interface WATTStakedAsset {
  delegatorAddress: string;
  validatorAddress: string;
  shares: string;
  balanceInAwatt: string;
  balanceInWATT: number; // Converted from awatt to WATT
}

/**
 * Custom hook to fetch WATT staked assets from Cosmos LCD endpoint
 * GET /cosmos/staking/v1beta1/delegations/{delegator_addr}
 */
const useWATTStakedAssets = () => {
  const [data, setData] = useState<WATTStakedAsset[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<Error | null>(null);

  /**
   * Convert awatt to WATT (1 WATT = 10^18 awatt)
   * @param awatt - Amount in awatt as string
   * @returns Amount in WATT as number
   */
  const convertAwattToWATT = (awatt: string): number => {
    try {
      const awattBigInt = BigInt(awatt);
      const wattBigInt = awattBigInt / BigInt(10 ** 18);
      // For decimal precision, we calculate the remainder
      const remainder = awattBigInt % BigInt(10 ** 18);
      const decimalPart = Number(remainder) / 10 ** 18;
      return Number(wattBigInt) + decimalPart;
    } catch {
      return 0;
    }
  };

  /**
   * Fetch WATT staked assets for a delegator
   * @param baseUrl - The base LCD URL (e.g., https://api.denergytestnet.com)
   * @param delegatorAddress - The delegator address (EVM hex or Bech32)
   * @param paginationLimit - Optional pagination limit (default: 200)
   * @param paginationKey - Optional pagination key for next page
   */
  const fetchWATTStakedAssets = useCallback(
    async (
      baseUrl: string,
      delegatorAddress: string,
      paginationLimit: number = 200,
      paginationKey?: string,
    ): Promise<WATTStakedAsset[]> => {
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
        const url = `${baseUrl}/cosmos/staking/v1beta1/delegations/${bech32Address}`;
        console.log('WATT Staked Assets API URL:', url);

        // Make API request
        const response = await axios.get<WATTStakedAssetsResponse>(url, {
          params,
          headers: {
            'Content-Type': 'application/json',
          },
        });

        // Transform response data
        const transformedData: WATTStakedAsset[] =
          response.data.delegation_responses.map((delegationResponse) => ({
            delegatorAddress: delegationResponse.delegation.delegator_address,
            validatorAddress: delegationResponse.delegation.validator_address,
            shares: delegationResponse.delegation.shares,
            balanceInAwatt: delegationResponse.balance.amount,
            balanceInWATT: convertAwattToWATT(delegationResponse.balance.amount),
          }));

        setData(transformedData);
        return transformedData;
      } catch (err) {
        const errorMessage =
          err instanceof Error
            ? err
            : new Error('Failed to fetch WATT staked assets');
        setError(errorMessage);
        console.error('Error fetching WATT staked assets:', err);
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
    fetch: fetchWATTStakedAssets,
  };
};

export default useWATTStakedAssets;
