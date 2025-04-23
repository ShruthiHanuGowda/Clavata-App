import {useState, useEffect, useCallback} from 'react';
import {getCompleteAccountNftData} from './marketPlace';
import {ApiCollections, NftToken} from '../types/types';
import useApi from './useApi';
import {API_NFT_URL} from '../constants';

export const useNftsForAddress = ({account}: {account: `0x${string}`}) => {
  const [nfts, setNfts] = useState<NftToken[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<null | unknown>(null);

  const {data: collections, isLoading: isLoadingCollections} =
    useApi<ApiCollections>(`${API_NFT_URL}/nftMarketplace_getCollections`, {
      method: 'GET',
    });

  const collectionsRes = collections?.data ?? {};

  const fetchData = useCallback(async () => {
    if (
      !account ||
      !collectionsRes ||
      Object.keys(collectionsRes).length === 0
    ) {
      console.warn('No account or collections available yet');
      return;
    }

    try {
      setIsLoading(true);
      setError(null);
      const result = await getCompleteAccountNftData(account, collectionsRes);
      setNfts(result);
    } catch (err) {
      console.error('Error fetching NFT data:', err);
      setError(err);
    } finally {
      setIsLoading(false);
    }
  }, [account, collectionsRes]);

  useEffect(() => {
    if (
      !isLoadingCollections &&
      account &&
      Object.keys(collectionsRes).length > 0
    ) {
      fetchData();
    }
  }, [isLoadingCollections, account, collectionsRes, fetchData]);

  return {
    nfts,
    isLoading,
    error,
    refresh: fetchData,
  };
};
