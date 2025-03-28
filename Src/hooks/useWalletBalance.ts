import {useState, useCallback} from 'react';
import {ethers} from 'ethers';
import {CUSTOM_NETWORK, CUSTOM_RPC_URL, ERC20_ABI, SEPOLIA_RPC_URL, TOKEN_CONTRACTS} from '../constants';

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

interface TokenBalance {
  balance: string;
  balanceUsd: string;
}

interface WalletBalanceHook {
  // Original crypto balances
  wattsBalance: string;
  ethBalance: string;
  denergyUsdcBalance: string;
  denergyEurcBalance: string;
  sepoliaUsdcBalance: string;
  sepoliaEurcBalance: string;

  // USD converted balances
  wattsBalanceUsd: string;
  ethBalanceUsd: string;
  denergyUsdcBalanceUsd: string;
  denergyEurcBalanceUsd: string;
  sepoliaUsdcBalanceUsd: string;
  sepoliaEurcBalanceUsd: string;

  // Exchange rates
  exchangeRates: ExchangeRates;

  // Status
  isBalanceLoading: boolean;
  isBalanceError: string | null;

  // Function
  fetchBalances: (walletAddress: string) => Promise<void>;

  getSingleTokenBalance: (tokenSymbol: string) => TokenBalance;
}

export const useWalletBalance = (): WalletBalanceHook => {
  // State for balances
  const [wattsBalance, setWattsBalance] = useState<string>('0');
  const [ethBalance, setEthBalance] = useState<string>('0');
  const [denergyUsdcBalance, setDenergyUsdcBalance] = useState<string>('0');
  const [denergyEurcBalance, setDenergyEurcBalance] = useState<string>('0');
  const [sepoliaUsdcBalance, setSepoliaUsdcBalance] = useState<string>('0');
  const [sepoliaEurcBalance, setSepoliaEurcBalance] = useState<string>('0');

  // State for USD values
  const [wattsBalanceUsd, setWattsBalanceUsd] = useState<string>('0');
  const [ethBalanceUsd, setEthBalanceUsd] = useState<string>('0');
  const [denergyUsdcBalanceUsd, setDenergyUsdcBalanceUsd] = useState<string>('0');
  const [denergyEurcBalanceUsd, setDenergyEurcBalanceUsd] = useState<string>('0');
  const [sepoliaUsdcBalanceUsd, setSepoliaUsdcBalanceUsd] = useState<string>('0');
  const [sepoliaEurcBalanceUsd, setSepoliaEurcBalanceUsd] = useState<string>('0');

  console.log('Balance test:', {
    wattsBalance,
    wattsBalanceUsd: `USD ${wattsBalanceUsd}`,
    ethBalance,
    ethBalanceUsd: `USD ${ethBalanceUsd}`,
    denergyUsdcBalance,
    denergyUsdcBalanceUsd: `USD ${denergyUsdcBalanceUsd}`,
    denergyEurcBalance,
    denergyEurcBalanceUsd: `USD ${denergyEurcBalanceUsd}`,
    sepoliaUsdcBalance,
    sepoliaUsdcBalanceUsd: `USD ${sepoliaUsdcBalanceUsd}`,
    sepoliaEurcBalance,
    sepoliaEurcBalanceUsd: `USD ${sepoliaEurcBalanceUsd}`,
  });
  // State for exchange rates
  const [exchangeRates, setExchangeRates] = useState<ExchangeRates>({
    ETH: 0,
    USDC: 0,
    EURC: 0,
  });

  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  // Function to fetch balances
  const fetchBalances = useCallback(async (walletAddress: string): Promise<void> => {
    if (!walletAddress) return;

    setIsLoading(true);
    setError(null);

    try {
      // Create providers
      const denergyProvider = new ethers.JsonRpcProvider(CUSTOM_RPC_URL);
      const sepoliaProvider = new ethers.JsonRpcProvider(SEPOLIA_RPC_URL);

      // Fetch native balances
      const denergyNativeBalance = await denergyProvider.getBalance(walletAddress);
      const formattedWattsBalance = ethers.formatEther(denergyNativeBalance);
      setWattsBalance(formattedWattsBalance);

      const sepoliaNativeBalance = await sepoliaProvider.getBalance(walletAddress);
      const formattedEthBalance = ethers.formatEther(sepoliaNativeBalance);
      setEthBalance(formattedEthBalance);

      let formattedDenergyUsdc = '0';
      let formattedDenergyEurc = '0';
      let formattedSepoliaUsdc = '0';
      let formattedSepoliaEurc = '0';

      // Fetch ERC-20 token balances
      for (const [network, tokens] of Object.entries(TOKEN_CONTRACTS)) {
        const provider = network === CUSTOM_NETWORK ? denergyProvider : sepoliaProvider;

        for (const [token, contractAddress] of Object.entries(tokens)) {
          const contract = new ethers.Contract(contractAddress, ERC20_ABI, provider);
          const balance = await contract.balanceOf(walletAddress);
          const formattedBalance = ethers.formatUnits(balance, 6);

          // Update respective states
          if (network === 'denergy') {
            if (token === 'USDC') {
              setDenergyUsdcBalance(formattedBalance);
              formattedDenergyUsdc = formattedBalance;
            }
            if (token === 'EURC') {
              setDenergyEurcBalance(formattedBalance);
              formattedDenergyEurc = formattedBalance;
            }
          } else if (network === 'sepolia') {
            if (token === 'USDC') {
              setSepoliaUsdcBalance(formattedBalance);
              formattedSepoliaUsdc = formattedBalance;
            }
            if (token === 'EURC') {
              setSepoliaEurcBalance(formattedBalance);
              formattedSepoliaEurc = formattedBalance;
            }
          }
        }
      }

      // Fetch exchange rates
      const ratesResponse = await fetch('https://e3uxy18iul.execute-api.me-central-1.amazonaws.com/testing/crypto-prices');
      const ratesData = await ratesResponse.json() as ExchangeRatesResponse;

      // Parse the body string to an object if it's returned as a string
      const rates: ExchangeRate[] = typeof ratesData.body === 'string' ? JSON.parse(ratesData.body) : ratesData.body;

      const ratesObj: ExchangeRates = {
        ETH: 0,
        USDC: 0,
        EURC: 0,
      };

      rates.forEach(rate => {
        ratesObj[rate.currency_code] = rate.exchange_rate;
      });

      setExchangeRates(ratesObj);

      // Convert balances to USD
      const ethInUsd = parseFloat(formattedEthBalance) * ratesObj.ETH;
      setEthBalanceUsd(ethInUsd.toFixed(2));

      const wattsInUsd = parseFloat(formattedWattsBalance) * ratesObj.USDC;
      setWattsBalanceUsd(wattsInUsd.toFixed(2));

      const denergyUsdcInUsd = parseFloat(formattedDenergyUsdc) * ratesObj.USDC;
      setDenergyUsdcBalanceUsd(denergyUsdcInUsd.toFixed(2));

      const sepoliaUsdcInUsd = parseFloat(formattedSepoliaUsdc) * ratesObj.USDC;
      setSepoliaUsdcBalanceUsd(sepoliaUsdcInUsd.toFixed(2));

      const denergyEurcInUsd = parseFloat(formattedDenergyEurc) * ratesObj.EURC;
      setDenergyEurcBalanceUsd(denergyEurcInUsd.toFixed(2));

      const sepoliaEurcInUsd = parseFloat(formattedSepoliaEurc) * ratesObj.EURC;
      setSepoliaEurcBalanceUsd(sepoliaEurcInUsd.toFixed(2));

    } catch (err: any) {
      console.error('Error fetching balances or exchange rates:', err);
      setError(err.message || 'Failed to fetch balances or exchange rates');
    } finally {
      setIsLoading(false);
    }
  }, []);

  const getSingleTokenBalance = useCallback((tokenSymbol: string): TokenBalance => {
    switch (tokenSymbol.toUpperCase()) {
      case 'WATT':
        return {
          balance: wattsBalance,
          balanceUsd: wattsBalanceUsd,
        };
      case 'ETH':
        return {
          balance: ethBalance,
          balanceUsd: ethBalanceUsd,
        };
      case 'WUSDC':
        return {
          balance: denergyUsdcBalance,
          balanceUsd: denergyUsdcBalanceUsd,
        };
      case 'WEURC':
        return {
          balance: denergyEurcBalance,
          balanceUsd: denergyEurcBalanceUsd,
        };
      case 'USDC':
        return {
          balance: sepoliaUsdcBalance,
          balanceUsd: sepoliaUsdcBalanceUsd,
        };
      case 'EURC':
        return {
          balance: sepoliaEurcBalance,
          balanceUsd: sepoliaEurcBalanceUsd,
        };
      default:
        return {
          balance: '0',
          balanceUsd: '0',
        };
    }
  }, [
    wattsBalance, wattsBalanceUsd,
    ethBalance, ethBalanceUsd,
    denergyUsdcBalance, denergyUsdcBalanceUsd,
    denergyEurcBalance, denergyEurcBalanceUsd,
    sepoliaUsdcBalance, sepoliaUsdcBalanceUsd,
    sepoliaEurcBalance, sepoliaEurcBalanceUsd,
  ]);

  return {
    // Original crypto balances
    wattsBalance,
    ethBalance,
    denergyUsdcBalance,
    denergyEurcBalance,
    sepoliaUsdcBalance,
    sepoliaEurcBalance,

    // USD converted balances
    wattsBalanceUsd,
    ethBalanceUsd,
    denergyUsdcBalanceUsd,
    denergyEurcBalanceUsd,
    sepoliaUsdcBalanceUsd,
    sepoliaEurcBalanceUsd,

    // Exchange rates
    exchangeRates,

    // Status
    isBalanceLoading: isLoading,
    isBalanceError: error,

    // Function
    fetchBalances,
    getSingleTokenBalance,
  };
};
