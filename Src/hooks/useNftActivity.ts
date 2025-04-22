import {useState, useEffect, useCallback} from 'react';
import {Activity} from '../types/types';
import {getTokenActivity, sortActivity} from './marketPlace';

const useNftActivity = (tokenId: string, collectionAddress: string) => {
  const [activity, setActivity] = useState<Activity[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const fetchActivity = async () => {
    if (!tokenId || !collectionAddress) return;

    setLoading(true);
    setError(null);

    try {
      const response = await getTokenActivity(
        tokenId,
        collectionAddress.toLowerCase(),
      );

      const sorted = sortActivity(response);
      setActivity(sorted);
    } catch (err) {
      console.error('Failed to fetch activity:', err);
      setError('Failed to fetch activity');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchActivity();
  }, [tokenId, collectionAddress]);

  const refetch = useCallback(() => {
    fetchActivity();
  }, []);

  return {
    activity,
    loading,
    error,
    refetch,
  };
};

export default useNftActivity;
