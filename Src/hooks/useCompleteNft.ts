import {useState, useEffect, useCallback} from 'react';
import {NftLocation, NftToken} from '../types/types';
import {getNftsMarketData} from './marketPlace';
import { Contract } from 'ethers';

export const useCompleteNft = (id: string) => {
  const [nft, setNft] = useState<NftToken | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const where = {
        id: id,
      };

      const [fetchedNfts] = (await getNftsMarketData(where, 1)) || [];

      //  const contract = new Contract(collectionAddress as Address, erc1155CollectionABI as any, signer)
      // const metadataUrl =  await contract.uri(tokenId)
      // let image = {original: '', thumbnail: ''};
      // if (metadataUrl) {
      //   const metadataResponse = await fetch(metadataUrl);
      //   const nftMetadata = await metadataResponse.json();
      //   image = {
      //     original: nftMetadata.image || '',
      //     thumbnail: nftMetadata.image || '',
      //   };
      // }

      const nft: NftToken = {
        id: fetchedNfts?.id,
        tokenId: fetchedNfts?.tokenId,
        name: `${fetchedNfts?.collection?.name} #${fetchedNfts?.tokenId}`,
        description: '',
        collectionName: fetchedNfts?.collection?.name,
        collectionAddress: fetchedNfts?.collection?.id,
        totalListed: fetchedNfts?.totalListed || '0',
        image: {
          original: '',
          thumbnail: '',
        },
        attributes: [],
        marketData: fetchedNfts,
        location: NftLocation.FORSALE,
      };
      setNft(nft);
      setLoading(false);
    } catch (err) {
      console.log(err);

      setLoading(false);
      setError(err.message || 'Failed to fetch NFT data');
    }
  }, [id]);

  useEffect(() => {
    if (id) {
      fetchData();
    }
  }, [id]);

  const refetch = useCallback(() => {
    fetchData();
  }, []);

  return {
    nft,
    loading,
    error,
    refetch,
  };
};
