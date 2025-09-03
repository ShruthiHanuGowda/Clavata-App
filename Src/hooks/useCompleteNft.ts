import {useState, useEffect, useCallback} from 'react';
import {NftLocation, NftToken} from '../types/types';
import {getNftsMarketData} from './marketPlace';

interface NFTMetadata {
  name: string;
  description: string;
  image: string;
  energy_type_image: string;
  country_image: string;
  external_url: string;
  attributes: Array<{
    traitType: string;
    value: string | number | undefined;
    displayType: string | null;
  }>;
}

export const useCompleteNft = (id: string) => {
  const [nft, setNft] = useState<NftToken | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchMetadata = async (
    metadataUrl: string,
  ): Promise<NFTMetadata | null> => {
    try {
      const response = await fetch(metadataUrl);
      if (!response.ok) {
        throw new Error(`Failed to fetch metadata: ${response.statusText}`);
      }
      return await response.json();
    } catch (err) {
      console.error('Error fetching metadata:', err);
      return null;
    }
  };

  const fetchData = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const where = {
        id: id,
      };

      const [fetchedNfts] = (await getNftsMarketData(where, 1)) || [];

      if (!fetchedNfts) {
        setError('NFT not found');
        setLoading(false);
        return;
      }

      let metadata: NFTMetadata | null = null;
      if (fetchedNfts?.metadataUrl) {
        metadata = await fetchMetadata(fetchedNfts.metadataUrl);
      }

      const builtNft: NftToken = {
        id: fetchedNfts?.id,
        tokenId: fetchedNfts?.tokenId,
        name:
          metadata?.name ||
          `${fetchedNfts?.collection?.name} #${fetchedNfts?.tokenId}`,
        description: metadata?.description || '',
        collectionName: fetchedNfts?.collection?.name,
        collectionAddress: fetchedNfts?.collection?.id,
        totalListed: fetchedNfts?.totalListed || '0',
        image: {
          original: metadata?.image || '',
          thumbnail: metadata?.image || '',
        },
        attributes: metadata?.attributes || [],
        marketData: fetchedNfts,
        location: NftLocation.FORSALE,
        metadata: metadata
          ? {
              energy_type_image: metadata.energy_type_image,
              country_image: metadata.country_image,
              external_url: metadata.external_url,
            }
          : undefined,
      };

      setNft(builtNft);
      setLoading(false);
    } catch (err: any) {
      console.log(err);
      setLoading(false);
      setError(err.message || 'Failed to fetch NFT data');
    }
  }, [id]);

  useEffect(() => {
    if (id) {
      fetchData();
    }
  }, [id, fetchData]);

  const refetch = useCallback(() => {
    fetchData();
  }, [fetchData]);

  return {
    nft,
    loading,
    error,
    refetch,
  };
};
