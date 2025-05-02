// hooks/useCollections.ts

import {useState, useEffect, useCallback} from 'react';
import {Collection} from '../types/types';
import {getCollectionsMarketData} from './marketPlace';

const useCollections = () => {
  const [collections, setCollections] = useState<Collection[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const fetchCollections = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const fetchedCollections = await getCollectionsMarketData();
      setCollections(fetchedCollections);
    } catch (err) {
      setError('Failed to fetch collections');
      console.error('Fetch collections error:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchCollections();
  }, []);

  return {collections, loading, error, refetch: fetchCollections};
};

export default useCollections;
