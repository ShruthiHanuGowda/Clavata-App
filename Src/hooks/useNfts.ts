import {useState, useEffect} from 'react';
import {getNftsMarketData} from './marketPlace';
import {TokenMarketData} from '../types/types';

interface NFTWithMetadata extends TokenMarketData {
  metadata?: {
    name: string;
    description: string;
    image: string;
    energy_type_image: string;
    country_image: string;
    external_url: string;
    attributes: Array<{
      trait_type: string;
      value: string | number;
    }>;
  };
}

const useNfts = (collectionId: string) => {
  const [nfts, setNfts] = useState<NFTWithMetadata[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const fetchMetadata = async (metadataUrl: string) => {
    try {
      const response = await fetch(metadataUrl);
      if (!response.ok) {
        throw new Error(`Failed to fetch metadata: ${response.statusText}`);
      }
      return await response.json();
    } catch (error) {
      console.error('Error fetching metadata:', error);
      return null;
    }
  };

  const fetchNfts = async () => {
    setLoading(true);
    setError(null);

    try {
      const where = {
        isTradable: true,
        collection_: {id: collectionId},
      };

      const fetchedNfts = await getNftsMarketData(where);

      const nftsWithMetadata = await Promise.all(
        fetchedNfts.map(async (nft: TokenMarketData) => {
          if (nft.metadataUrl) {
            const metadata = await fetchMetadata(nft.metadataUrl);
            return {
              ...nft,
              metadata,
            };
          }
          return nft;
        }),
      );

      setNfts(nftsWithMetadata);
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

  return {nfts, loading, error, refetch: fetchNfts};
};

export default useNfts;
