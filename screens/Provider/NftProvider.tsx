import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  useMemo,
  ReactNode,
} from 'react';
import {useAuth} from './authProvider';
import {ApiCollections, NftToken} from '../../Src/types/types';
import {API_NFT_URL} from '../../Src/constants';
import useApi from '../../Src/hooks/useApi';
import {getCompleteAccountNftData} from '../../Src/hooks/marketPlace';

interface NftContextType {
  // Data
  nfts: NftToken[];
  totalQuantity: number;
  groupedByCountry: Record<string, NftToken[]>;

  // Loading states
  isLoading: boolean;
  isRefreshing: boolean;

  // Error handling
  error: unknown | null;

  // Actions
  refetch: () => Promise<void>;
  refresh: () => Promise<void>;
  clearError: () => void;

  // Utility functions
  getNftsByCountry: (country: string) => NftToken[];
  getTotalQuantityByCountry: (country: string) => number;
  hasNfts: boolean;
}

const NftContext = createContext<NftContextType | undefined>(undefined);

interface NftProviderProps {
  children: ReactNode;
}

export const NftProvider: React.FC<NftProviderProps> = ({children}) => {
  const [nfts, setNfts] = useState<NftToken[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [error, setError] = useState<unknown | null>(null);

  const {userDetails} = useAuth();
  const account: `0x${string}` | undefined = userDetails?.userWallet as
    | `0x${string}`
    | undefined;

  const {data: collections, isLoading: isLoadingCollections} =
    useApi<ApiCollections>(`${API_NFT_URL}/nftMarketplace_getCollections`, {
      method: 'GET',
    });

  const collectionsRes = useMemo(() => collections?.data ?? {}, [collections]);

  const groupByCountry = useCallback((nftList: NftToken[]) => {
    return nftList.reduce((acc, nft) => {
      const country = nft?.country || 'Unknown';
      if (!acc[country]) {
        acc[country] = [];
      }
      acc[country].push(nft);
      return acc;
    }, {} as Record<string, NftToken[]>);
  }, []);

  const fetchNftData = useCallback(
    async (showLoading = true) => {
      if (
        !account ||
        !collectionsRes ||
        Object.keys(collectionsRes).length === 0
      ) {
        console.warn('No account or collections available yet');
        return;
      }

      try {
        if (showLoading) {
          setIsLoading(true);
        }
        setError(null);

        const result = await getCompleteAccountNftData(account, collectionsRes);
        setNfts(result);
      } catch (err) {
        console.error('Error fetching NFT data:', err);
        setError(err);
      } finally {
        if (showLoading) {
          setIsLoading(false);
        }
      }
    },
    [account, collectionsRes],
  );

  useEffect(() => {
    if (
      !isLoadingCollections &&
      account &&
      Object.keys(collectionsRes).length > 0
    ) {
      fetchNftData();
    }
  }, [isLoadingCollections, account, collectionsRes, fetchNftData]);

  const refetch = useCallback(async () => {
    await fetchNftData(true);
  }, [fetchNftData]);

  const refresh = useCallback(async () => {
    setIsRefreshing(true);
    try {
      await fetchNftData(false);
    } finally {
      setIsRefreshing(false);
    }
  }, [fetchNftData]);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  const totalQuantity = useMemo(() => {
    return nfts.reduce((sum, nft) => {
      const quantity = Number(nft.marketData?.quantity ?? 0);
      return sum + quantity;
    }, 0);
  }, [nfts]);

  const groupedByCountry = useMemo(() => {
    return groupByCountry(nfts);
  }, [nfts, groupByCountry]);

  const hasNfts = useMemo(() => {
    return nfts.length > 0;
  }, [nfts.length]);

  // Utility functions
  const getNftsByCountry = useCallback(
    (country: string) => {
      return groupedByCountry[country] || [];
    },
    [groupedByCountry],
  );

  const getTotalQuantityByCountry = useCallback(
    (country: string) => {
      const countryNfts = getNftsByCountry(country);
      return countryNfts.reduce((sum: number, nft: NftToken) => {
        const quantity = Number(nft.marketData?.quantity ?? 0);
        return sum + quantity;
      }, 0);
    },
    [getNftsByCountry],
  );

  const contextValue: NftContextType = {
    nfts,
    totalQuantity,
    groupedByCountry,
    isLoading: Boolean(isLoading || isLoadingCollections),
    isRefreshing,
    error,
    refetch,
    refresh,
    clearError,
    getNftsByCountry,
    getTotalQuantityByCountry,
    hasNfts,
  };

  return (
    <NftContext.Provider value={contextValue}>{children}</NftContext.Provider>
  );
};

export const useNft = (): NftContextType => {
  const context = useContext(NftContext);
  if (context === undefined) {
    throw new Error('useNft must be used within an NftProvider');
  }
  return context;
};

export {NftContext};
