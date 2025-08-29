import {useState, useCallback} from 'react';
import {
  TOKEN_CONTRACTS,
  CRYPTO_PRICES_API_URL,
} from '../constants';
import {useAuth} from '../../screens/Provider/authProvider';
import { walletOperations } from '../services/blockchain/walletOperations';

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
  fetchAllBalances: (
    emailAddress: string,
    denergyAddress: string,
  ) => Promise<void>;
  fetchSingleBalance: (
    emailAddress: string,
    denergyAddress: string,
    tokenSymbol: string,
  ) => Promise<TokenBalance>;
  getBalance: (tokenSymbol: string) => TokenBalance;
}

export const useWalletBalance = (): WalletBalanceHook => {
  // State for all token balances
  const {userDetails} = useAuth();
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
      const ratesResponse = await fetch(CRYPTO_PRICES_API_URL);
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
    async (emailAddress: string, denergyAddress: string): Promise<void> => {
      if (!emailAddress || !denergyAddress) return;

      setIsLoading(true);
      setError(null);

      try {
        // Fetch exchange rates first
        const rates = await fetchExchangeRates();

        // Fetch WATT balance using denergyAddress
        try {
          if (denergyAddress && walletOperations.isValidAddress(denergyAddress)) {
            const formattedWattsBalance = await walletOperations.getNativeBalance(
              denergyAddress,
              'denergy'
            );

            const wattsInUsd = (
              parseFloat(formattedWattsBalance) * rates.WATT
            ).toFixed(2);
            updateTokenData('WATT', formattedWattsBalance, wattsInUsd);
          } else {
            console.log(
              'No valid denergy address found, skipping WATT balance check',
            );
            updateTokenData('WATT', '0', '0');
          }
        } catch (error) {
          console.error('🚀 ~ error fetching WATT balance:', error);
          updateTokenData('WATT', '0', '0');
        }

        // Fetch ETH balance using emailAddress
        try {
          if (emailAddress && walletOperations.isValidAddress(emailAddress)) {
            const formattedEthBalance = await walletOperations.getNativeBalance(
              emailAddress,
              'sepolia'
            );
            const ethInUsd = (
              parseFloat(formattedEthBalance) * rates.ETH
            ).toFixed(2);
            updateTokenData('ETH', formattedEthBalance, ethInUsd);
          } else {
            console.log(
              'No valid wallet address found, skipping ETH balance check',
            );
            updateTokenData('ETH', '0', '0');
          }
        } catch (error) {
          console.error('🚀 ~ error fetching ETH balance:', error);
          updateTokenData('ETH', '0', '0');
        }

        // Mapping of token symbols to their network, token info, and which address to use
        const tokenMapping = {
          WUSDC: {
            network: 'denergy',
            token: 'USDC',
            rateKey: 'USDC',
            useAddress: denergyAddress,
          },
          WEURC: {
            network: 'denergy',
            token: 'EURC',
            rateKey: 'EURC',
            useAddress: denergyAddress,
          },
          USDC: {
            network: 'sepolia',
            token: 'USDC',
            rateKey: 'USDC',
            useAddress: emailAddress,
          },
          EURC: {
            network: 'sepolia',
            token: 'EURC',
            rateKey: 'EURC',
            useAddress: emailAddress,
          },
        };

        // Process each ERC-20 token
        for (const [tokenSymbol, info] of Object.entries(tokenMapping)) {
          try {
            const contractAddress = (TOKEN_CONTRACTS as any)[info.network]?.[info.token];
            
            if (!contractAddress) {
              console.log(`Contract address not found for ${tokenSymbol}`);
              updateTokenData(tokenSymbol, '0', '0');
              continue;
            }

            // Use the appropriate address for each token
            const addressToUse = info.useAddress;

            if (addressToUse && walletOperations.isValidAddress(addressToUse)) {
              const formattedBalance = await walletOperations.getTokenBalance(
                contractAddress,
                addressToUse,
                info.network,
                6 // USDC/EURC decimals
              );
              
              const balanceInUsd = (
                parseFloat(formattedBalance) * rates[info.rateKey]
              ).toFixed(2);

              updateTokenData(tokenSymbol, formattedBalance, balanceInUsd);
            } else {
              console.log(
                `No valid address found for ${tokenSymbol}, skipping balance check`,
              );
              updateTokenData(tokenSymbol, '0', '0');
            }
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
      emailAddress: string,
      denergyAddress: string,
      tokenSymbol: string,
    ): Promise<TokenBalance> => {
      if ((!emailAddress && !denergyAddress) || !tokenSymbol) {
        return {balance: '0', balanceUsd: '0'};
      }

      const normalizedTokenSymbol = tokenSymbol.toUpperCase();

      try {
        // Make sure we have the latest exchange rates
        let rates = exchangeRates;
        if (rates.ETH === 0 || rates.USDC === 0 || rates.EURC === 0) {
          rates = await fetchExchangeRates();
        }

        let tokenBalance: TokenBalance = {balance: '0', balanceUsd: '0'};

        // Handle different tokens
        switch (normalizedTokenSymbol) {
          case 'WATT': {
            // Use denergyAddress for WATT
            if (denergyAddress && walletOperations.isValidAddress(denergyAddress)) {
              const formattedBalance = await walletOperations.getNativeBalance(
                denergyAddress,
                'denergy'
              );
              const balanceInUsd = (
                parseFloat(formattedBalance) * rates.USDC
              ).toFixed(2);
              tokenBalance = {
                balance: formattedBalance,
                balanceUsd: balanceInUsd,
              };
            } else {
              console.log('No valid denergy address found for WATT');
            }
            break;
          }

          case 'ETH': {
            // Use emailAddress for ETH
            if (emailAddress && walletOperations.isValidAddress(emailAddress)) {
              const formattedBalance = await walletOperations.getNativeBalance(
                emailAddress,
                'sepolia'
              );
              const balanceInUsd = (
                parseFloat(formattedBalance) * rates.ETH
              ).toFixed(2);
              tokenBalance = {
                balance: formattedBalance,
                balanceUsd: balanceInUsd,
              };
            } else {
              console.log('No valid wallet address found for ETH');
            }
            break;
          }

          default: {
            // Handle ERC-20 tokens
            const tokenMapping = {
              WUSDC: {
                network: 'denergy',
                token: 'USDC',
                rateKey: 'USDC',
                useAddress: denergyAddress,
              },
              WEURC: {
                network: 'denergy',
                token: 'EURC',
                rateKey: 'EURC',
                useAddress: denergyAddress,
              },
              USDC: {
                network: 'sepolia',
                token: 'USDC',
                rateKey: 'USDC',
                useAddress: emailAddress,
              },
              EURC: {
                network: 'sepolia',
                token: 'EURC',
                rateKey: 'EURC',
                useAddress: emailAddress,
              },
            };

            const tokenInfo =
              tokenMapping[normalizedTokenSymbol as keyof typeof tokenMapping];

            if (!tokenInfo) {
              throw new Error(`Unknown token symbol: ${normalizedTokenSymbol}`);
            }

            const contractAddress = (TOKEN_CONTRACTS as any)[tokenInfo.network]?.[tokenInfo.token];
            
            if (!contractAddress) {
              throw new Error(`Contract address not found for ${normalizedTokenSymbol}`);
            }

            // Use the appropriate address for the token
            const addressToUse = tokenInfo.useAddress;

            if (addressToUse && walletOperations.isValidAddress(addressToUse)) {
              const formattedBalance = await walletOperations.getTokenBalance(
                contractAddress,
                addressToUse,
                tokenInfo.network,
                6 // USDC/EURC decimals
              );
              
              const balanceInUsd = (
                parseFloat(formattedBalance) * rates[tokenInfo.rateKey]
              ).toFixed(2);

              tokenBalance = {
                balance: formattedBalance,
                balanceUsd: balanceInUsd,
              };
            } else {
              console.log(
                `No valid address found for ${normalizedTokenSymbol}`,
              );
            }
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
