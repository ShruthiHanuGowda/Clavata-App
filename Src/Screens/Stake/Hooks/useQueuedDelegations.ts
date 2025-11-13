import {useState} from 'react';
import axios from 'axios';
import {QUEUED_DELEGATIONS_API_URL} from '../../../constants';

interface QueuedEntry {
  id: string;
  creation_epoch: string;
  activation_epoch: string;
  amount: string;
  nft_contract_address: string;
  token_id: string;
}

interface QueuedDelegation {
  delegator_address: string;
  validator_address: string;
  entries: QueuedEntry[];
}

interface Pagination {
  next_key: string | null;
  total: string;
}

interface QueuedDelegationsResponse {
  queued_delegations: QueuedDelegation[];
  pagination: Pagination;
}

/**
 * Custom hook to fetch queued delegations data
 */
const useQueuedDelegations = () => {
  const axiosConfig = {
    headers: {
      'Content-Type': 'application/json',
    },
  };

  const [queuedDelegationsData, setQueuedDelegationsData] =
    useState<QueuedDelegationsResponse | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<Error | null>(null);

  /**
   * Fetch queued delegations for a specific delegator address
   * @param delegatorAddress - The delegator address to fetch queued delegations for
   */
  const fetchQueuedDelegations = async (delegatorAddress: string) => {
    setLoading(true);
    setError(null);

    try {
      const url = `${QUEUED_DELEGATIONS_API_URL}/${delegatorAddress}/queued`;
      console.log(url);

      const response = await axios.get<QueuedDelegationsResponse>(
        url,
        axiosConfig,
      );
      setQueuedDelegationsData(response.data);
      return response.data;
    } catch (err) {
      const errorMessage =
        err instanceof Error
          ? err
          : new Error('Unknown error occurred fetching queued delegations');
      setError(errorMessage);
      throw errorMessage;
    } finally {
      setLoading(false);
    }
  };

  return {
    data: queuedDelegationsData,
    loading,
    error,
    fetch: fetchQueuedDelegations,
  };
};

export default useQueuedDelegations;
export type {QueuedEntry, QueuedDelegation, QueuedDelegationsResponse};
