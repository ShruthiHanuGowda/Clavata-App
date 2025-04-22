import {useState, useEffect, useCallback} from 'react';
import {getCompleteAccountNftData} from './marketPlace';
import {ApiCollections, NftToken} from '../types/types';
import useApi from './useApi';
import {API_NFT_URL} from '../constants';

export const useNftsForAddress = ({account}) => {
  const [nfts, setNfts] = useState<NftToken[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  const {data: collections, isLoading: isLoadingCollections} =
    useApi<ApiCollections>(`${API_NFT_URL}/nftMarketplace_getCollections`, {
      method: 'GET',
    });

  const collectionsRes = collections?.data ?? {};
  const fetchData = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      const result = await getCompleteAccountNftData(
        account,
        collectionsRes ?? {},
      );
      setNfts(result);
    } catch (err) {
      setError(err);
    } finally {
      setIsLoading(false);
    }
  }, [account]);

  useEffect(() => {
    if (!isLoadingCollections || !account) {
      return;
    }
    fetchData();
  }, [account, fetchData, isLoadingCollections]);

  return {
    nfts,
    isLoading,
    error,
    refresh: fetchData,
  };
};
