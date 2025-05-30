import { useState, useEffect } from 'react';
import { getNftsMarketData } from './marketPlace';
import { TokenMarketData } from '../types/types';

const useNfts = (collectionId: string) => {
  const [nfts, setNfts] = useState<TokenMarketData[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const fetchNfts = async () => {
    setLoading(true);
    setError(null);

    try {
      const where = {
        isTradable: true,
        collection_: { id: collectionId },
      };

      const fetchedNfts = await getNftsMarketData(where);
      setNfts(fetchedNfts);
    } catch (err) {
      setError('Failed to fetch NFTs');
      console.error('Error fetching NFTs:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (collectionId) {
      fetchNfts();
    }
  }, [collectionId]);

  return { nfts, loading, error, refetch: fetchNfts };
};

export default useNfts;
