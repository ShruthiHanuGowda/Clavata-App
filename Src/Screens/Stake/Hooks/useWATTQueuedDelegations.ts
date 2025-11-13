import {useState} from 'react';
import axios from 'axios';
import {WATT_QUEUED_DELEGATIONS_API_URL} from '../../../constants';

interface WATTQueuedEntry {
  creation_height: string;
  completion_time: string;
  initial_balance: string;
  shares: string;
  balance: string;
}

interface WATTQueuedDelegation {
  delegator_address: string;
  validator_address: string;
  entries: WATTQueuedEntry[];
}

interface Pagination {
  next_key: string | null;
  total: string;
}

interface WATTQueuedDelegationsResponse {
  unbonding_responses: WATTQueuedDelegation[];
  pagination: Pagination;
}

/**
 * Custom hook to fetch WATT queued delegations data
 */
const useWATTQueuedDelegations = () => {
  const axiosConfig = {
    headers: {
      'Content-Type': 'application/json',
    },
  };

  const [wattQueuedDelegationsData, setWattQueuedDelegationsData] =
    useState<WATTQueuedDelegationsResponse | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<Error | null>(null);

  /**
   * Fetch WATT queued delegations for a specific delegator address
   * @param delegatorAddress - The delegator address to fetch queued delegations for
   */
  const fetchWATTQueuedDelegations = async (delegatorAddress: string) => {
    setLoading(true);
    setError(null);

    try {
      const url = `${WATT_QUEUED_DELEGATIONS_API_URL}/${delegatorAddress}/queued_delegations`;
      console.log('WATT Queued Delegations URL:', url);

      const response = await axios.get<WATTQueuedDelegationsResponse>(
        url,
        axiosConfig,
      );
      setWattQueuedDelegationsData(response.data);
      return response.data;
    } catch (err) {
      const errorMessage =
        err instanceof Error
          ? err
          : new Error('Unknown error occurred fetching WATT queued delegations');
      setError(errorMessage);
      throw errorMessage;
    } finally {
      setLoading(false);
    }
  };

  return {
    data: wattQueuedDelegationsData,
    loading,
    error,
    fetch: fetchWATTQueuedDelegations,
  };
};

export default useWATTQueuedDelegations;
export type {
  WATTQueuedEntry,
  WATTQueuedDelegation,
  WATTQueuedDelegationsResponse,
};
