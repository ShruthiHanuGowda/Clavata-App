import { useState, useEffect, useCallback } from 'react';
import { Collection } from '../types/types';
import { getCollectionsMarketData } from './marketPlace';
import { API_NFT_URL } from '../constants';

const fetchExtraDetails = async (contractAddress: string) => {
  const url = `${API_NFT_URL}/nftMarketplace_getCollections/?contractAddress=${contractAddress}`;
  const response = await fetch(url);

  if (!response.ok) {
    throw new Error(`Failed to fetch extra details for ${contractAddress}`);
  }

  const json = await response.json();
  return json.data;
};

const useCollections = () => {
  const [collections, setCollections] = useState<Collection[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const fetchCollections = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const fetchedCollections = await getCollectionsMarketData();
      const enrichedPromises = fetchedCollections.map(
        async (collection: Collection) => {
          try {
            const extra = await fetchExtraDetails(collection.id);
            return {
              ...collection,
              ...extra,
            };
          } catch (e) {
            console.warn(`Enrichment failed for ${collection.id}:`, e);
            return collection;
          }
        },
      );

      const enrichedCollections = await Promise.all(enrichedPromises);
      setCollections(enrichedCollections);
    } catch (err) {
      setError('Failed to fetch collections');
      console.error('Fetch collections error:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchCollections();
  }, [fetchCollections]);

  return { collections, loading, error, refetch: fetchCollections };
};

export default useCollections;
