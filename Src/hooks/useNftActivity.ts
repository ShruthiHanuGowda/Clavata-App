import {useState, useEffect} from 'react';
import {Activity} from '../types/types';
import {getTokenActivity, sortActivity} from './marketPlace';

const useNftActivity = (tokenId: string, collectionAddress: string) => {
  const [activity, setActivity] = useState<Activity[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const fetchActivity = async () => {
    if (!tokenId || !collectionAddress) return;

    try {
      setLoading(true);
      setError(null);

      const response = await getTokenActivity(
        tokenId,
        collectionAddress.toLowerCase(),
      );
      const sorted = sortActivity(response);
      setActivity(sorted);
    } catch (err) {
      setError('Failed to fetch activity');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    let isCancelled = false;
    
    const fetchActivityWithCleanup = async () => {
      if (!tokenId || !collectionAddress || isCancelled) return;

      try {
        setLoading(true);
        setError(null);

        const response = await getTokenActivity(
          tokenId,
          collectionAddress.toLowerCase(),
        );
        
        if (!isCancelled) {
          const sorted = sortActivity(response);
          setActivity(sorted);
        }
      } catch (err) {
        if (!isCancelled) {
          setError('Failed to fetch activity');
        }
      } finally {
        if (!isCancelled) {
          setLoading(false);
        }
      }
    };

    fetchActivityWithCleanup();
    
    return () => {
      isCancelled = true;
    };
  }, [tokenId, collectionAddress]);

  return {
    activity,
    loading,
    error,
    refetch: fetchActivity,
  };
};

export default useNftActivity;
