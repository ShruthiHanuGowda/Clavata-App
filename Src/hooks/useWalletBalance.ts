import {useState, useCallback} from 'react';
import {ethers} from 'ethers';
import {
  CUSTOM_NETWORK,
  CUSTOM_RPC_URL,
  ERC20_ABI,
  SEPOLIA_RPC_URL,
  TOKEN_CONTRACTS,
} from '../constants';

interface ExchangeRate {
  currency_code: string;
  exchange_rate: number;
  timestamp: string;
}

interface ExchangeRatesResponse {
  statusCode: number;
  headers: {
    'Content-Type': string;
  };
  body: string | ExchangeRate[];
}

interface ExchangeRates {
  ETH: number;
  USDC: number;
  EURC: number;

  [key: string]: number;
}

export interface TokenBalance {
  balance: string;
  balanceUsd: string;
}

interface TokenData {
  [key: string]: TokenBalance;
}

interface WalletBalanceHook {
  // Token data
  tokenData: TokenData;

  // Status
  isLoading: boolean;
  error: string | null;

  // Exchange rates
  exchangeRates: ExchangeRates;

  // Functions
  fetchAllBalances: (walletAddress: string) => Promise<void>;
  fetchSingleBalance: (
    walletAddress: string,
    tokenSymbol: string,
  ) => Promise<TokenBalance>;
  getBalance: (tokenSymbol: string) => TokenBalance;
}

export const useWalletBalance = (): WalletBalanceHook => {
  // State for all token balances
  const [tokenData, setTokenData] = useState<TokenData>({
    WATT: {balance: '0', balanceUsd: '0'},
    ETH: {balance: '0', balanceUsd: '0'},
    WUSDC: {balance: '0', balanceUsd: '0'},
    WEURC: {balance: '0', balanceUsd: '0'},
    USDC: {balance: '0', balanceUsd: '0'},
    EURC: {balance: '0', balanceUsd: '0'},
  });

  // State for exchange rates
  const [exchangeRates, setExchangeRates] = useState<ExchangeRates>({
    ETH: 0,
    USDC: 0,
    EURC: 0,
  });

  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  // Function to fetch exchange rates
  const fetchExchangeRates = useCallback(async (): Promise<ExchangeRates> => {
    try {
      const ratesResponse = await fetch(
        'https://e3uxy18iul.execute-api.me-central-1.amazonaws.com/testing/crypto-prices',
      );
      const ratesData = (await ratesResponse.json()) as ExchangeRatesResponse;

      // Parse the body string to an object if it's returned as a string
      const rates: ExchangeRate[] =
        typeof ratesData.body === 'string'
          ? JSON.parse(ratesData.body)
          : ratesData.body;

      const ratesObj: ExchangeRates = {
        ETH: 0,
        USDC: 0,
        EURC: 0,
      };

      rates.forEach(rate => {
        ratesObj[rate.currency_code] = rate.exchange_rate;
      });

      setExchangeRates(ratesObj);
      return ratesObj;
    } catch (err) {
      console.error('Error fetching exchange rates:', err);
      throw err;
    }
  }, []);

  // Function to update a single token's data in state
  const updateTokenData = useCallback(
    (symbol: string, balance: string, balanceUsd: string) => {
      setTokenData(prevData => ({
        ...prevData,
        [symbol]: {balance, balanceUsd},
      }));
    },
    [],
  );

  // Function to fetch all balances
  const fetchAllBalances = useCallback(
    async (walletAddress: string): Promise<void> => {
      if (!walletAddress) return;

      setIsLoading(true);
      setError(null);

      try {
        // Create providers
        const denergyProvider = new ethers.JsonRpcProvider(CUSTOM_RPC_URL);
        const sepoliaProvider = new ethers.JsonRpcProvider(SEPOLIA_RPC_URL);

        // Fetch exchange rates first
        const rates = await fetchExchangeRates();

        // Fetch native balances
        const denergyNativeBalance = await denergyProvider.getBalance(
          walletAddress,
        );
        const formattedWattsBalance = ethers.formatEther(denergyNativeBalance);
        const wattsInUsd = (
          parseFloat(formattedWattsBalance) * rates.USDC
        ).toFixed(2);
        updateTokenData('WATT', formattedWattsBalance, wattsInUsd);

        const sepoliaNativeBalance = await sepoliaProvider.getBalance(
          walletAddress,
        );
        const formattedEthBalance = ethers.formatEther(sepoliaNativeBalance);
        const ethInUsd = (parseFloat(formattedEthBalance) * rates.ETH).toFixed(
          2,
        );
        updateTokenData('ETH', formattedEthBalance, ethInUsd);

        // Fetch ERC-20 token balances
        // Mapping of token symbols to their network and token info
        const tokenMapping = {
          WUSDC: {network: 'denergy', token: 'USDC', rateKey: 'USDC'},
          WEURC: {network: 'denergy', token: 'EURC', rateKey: 'EURC'},
          USDC: {network: 'sepolia', token: 'USDC', rateKey: 'USDC'},
          EURC: {network: 'sepolia', token: 'EURC', rateKey: 'EURC'},
        };

        // Process each ERC-20 token
        for (const [tokenSymbol, info] of Object.entries(tokenMapping)) {
          try {
            const provider =
              info.network === CUSTOM_NETWORK
                ? denergyProvider
                : sepoliaProvider;
            const contractAddress = TOKEN_CONTRACTS[info.network][info.token];
            console?.log('contractAddress', contractAddress);
            const contract = new ethers.Contract(
              contractAddress,
              ERC20_ABI,
              provider,
            );
            const balance = await contract.balanceOf(walletAddress);
            const formattedBalance = ethers.formatUnits(balance, 6);
            const balanceInUsd = (
              parseFloat(formattedBalance) * rates[info.rateKey]
            ).toFixed(2);

            updateTokenData(tokenSymbol, formattedBalance, balanceInUsd);
          } catch (err) {
            console.error(`Error fetching balance for ${tokenSymbol}:`, err);
            // Set default values for failed token
            updateTokenData(tokenSymbol, '0', '0');
            // Continue with the next token
          }
        }
      } catch (err: any) {
        console.error('Error fetching balances:', err);
        setError(err.message || 'Failed to fetch balances');
      } finally {
        setIsLoading(false);
      }
    },
    [fetchExchangeRates, updateTokenData],
  );

  // Function to fetch a single token's balance
  const fetchSingleBalance = useCallback(
    async (
      walletAddress: string,
      tokenSymbol: string,
    ): Promise<TokenBalance> => {
      if (!walletAddress) {
        return {balance: '0', balanceUsd: '0'};
      }

      const normalizedTokenSymbol = tokenSymbol.toUpperCase();

      try {
        // Create providers
        const denergyProvider = new ethers.JsonRpcProvider(CUSTOM_RPC_URL);
        const sepoliaProvider = new ethers.JsonRpcProvider(SEPOLIA_RPC_URL);

        // Make sure we have the latest exchange rates
        let rates = exchangeRates;
        if (rates.ETH === 0 || rates.USDC === 0 || rates.EURC === 0) {
          rates = await fetchExchangeRates();
        }

        let tokenBalance: TokenBalance = {balance: '0', balanceUsd: '0'};

        // Handle different tokens
        switch (normalizedTokenSymbol) {
          case 'WATT': {
            const denergyNativeBalance = await denergyProvider.getBalance(
              walletAddress,
            );
            const formattedBalance = ethers.formatEther(denergyNativeBalance);
            const balanceInUsd = (
              parseFloat(formattedBalance) * rates.USDC
            ).toFixed(2);
            tokenBalance = {
              balance: formattedBalance,
              balanceUsd: balanceInUsd,
            };
            break;
          }

          case 'ETH': {
            const sepoliaNativeBalance = await sepoliaProvider.getBalance(
              walletAddress,
            );
            const formattedBalance = ethers.formatEther(sepoliaNativeBalance);
            const balanceInUsd = (
              parseFloat(formattedBalance) * rates.ETH
            ).toFixed(2);
            tokenBalance = {
              balance: formattedBalance,
              balanceUsd: balanceInUsd,
            };
            break;
          }

          default: {
            // Handle ERC-20 tokens
            const tokenMapping = {
              WUSDC: {network: 'denergy', token: 'USDC', rateKey: 'USDC'},
              WEURC: {network: 'denergy', token: 'EURC', rateKey: 'EURC'},
              USDC: {network: 'sepolia', token: 'USDC', rateKey: 'USDC'},
              EURC: {network: 'sepolia', token: 'EURC', rateKey: 'EURC'},
            };

            const tokenInfo =
              tokenMapping[normalizedTokenSymbol as keyof typeof tokenMapping];

            if (!tokenInfo) {
              throw new Error(`Unknown token symbol: ${normalizedTokenSymbol}`);
            }

            const provider =
              tokenInfo.network === CUSTOM_NETWORK
                ? denergyProvider
                : sepoliaProvider;
            const contractAddress =
              TOKEN_CONTRACTS[tokenInfo.network][tokenInfo.token];

            const contract = new ethers.Contract(
              contractAddress,
              ERC20_ABI,
              provider,
            );
            const balance = await contract.balanceOf(walletAddress);
            const formattedBalance = ethers.formatUnits(balance, 6);
            const balanceInUsd = (
              parseFloat(formattedBalance) * rates[tokenInfo.rateKey]
            ).toFixed(2);

            tokenBalance = {
              balance: formattedBalance,
              balanceUsd: balanceInUsd,
            };
          }
        }

        // Update the state
        updateTokenData(
          normalizedTokenSymbol,
          tokenBalance.balance,
          tokenBalance.balanceUsd,
        );

        return tokenBalance;
      } catch (err: any) {
        console.error(`Error refreshing ${tokenSymbol} balance:`, err);
        setError(err.message || `Failed to refresh ${tokenSymbol} balance`);
        return {balance: '0', balanceUsd: '0'};
      }
    },
    [exchangeRates, fetchExchangeRates, updateTokenData],
  );

  // Function to get a balance from state
  const getBalance = useCallback(
    (tokenSymbol: string): TokenBalance => {
      const normalizedSymbol = tokenSymbol.toUpperCase();
      return tokenData[normalizedSymbol] || {balance: '0', balanceUsd: '0'};
    },
    [tokenData],
  );

  return {
    // Token data
    tokenData,

    // Status
    isLoading,
    error,

    // Exchange rates
    exchangeRates,

    // Functions
    fetchAllBalances,
    fetchSingleBalance,
    getBalance,
  };
};
