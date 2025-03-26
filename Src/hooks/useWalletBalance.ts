import {useState, useCallback} from 'react';
import {ethers} from 'ethers';
import {CUSTOM_NETWORK, CUSTOM_RPC_URL, ERC20_ABI, SEPOLIA_RPC_URL, TOKEN_CONTRACTS} from '../constants';

// Constants (move these to a config file if needed)


export const useWalletBalance = () => {
  // State for balances
  const [wattsBalance, setWattsBalance] = useState('0');
  const [ethBalance, setEthBalance] = useState('0');
  const [denergyUsdcBalance, setDenergyUsdcBalance] = useState('0');
  const [denergyEurcBalance, setDenergyEurcBalance] = useState('0');
  const [sepoliaUsdcBalance, setSepoliaUsdcBalance] = useState('0');
  const [sepoliaEurcBalance, setSepoliaEurcBalance] = useState('0');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  console.log('denergyUsdcBalance', denergyUsdcBalance, 'denergyEurcBalance', denergyEurcBalance, 'sepoliaUsdcBalance', sepoliaUsdcBalance, 'sepoliaEurcBalance', sepoliaEurcBalance, 'wattsBalance', wattsBalance, 'ethBalance', ethBalance, isLoading);


  // Function to fetch balances
  const fetchBalances = useCallback(async (walletAddress) => {
    console.log('walletAddress', walletAddress);
    if (!walletAddress) return;

    setIsLoading(true);
    setError(null);

    try {
      // Create providers
      let denergyProvider = new ethers.JsonRpcProvider(CUSTOM_RPC_URL);
      console.log('denergyProvider', denergyProvider);
      const sepoliaProvider = new ethers.JsonRpcProvider(SEPOLIA_RPC_URL);
      console.log('sepoliaProvider', sepoliaProvider);
      // Fetch native balances
      const denergyNativeBalance = await denergyProvider.getBalance(walletAddress);

      console.log('denergyNativeBalance', denergyNativeBalance);
      setWattsBalance(ethers.formatEther(denergyNativeBalance));

      const sepoliaNativeBalance = await sepoliaProvider.getBalance(walletAddress);
      setEthBalance(ethers.formatEther(sepoliaNativeBalance));
      console.log('sepoliaNativeBalance', sepoliaNativeBalance);
      // Fetch ERC-20 token balances
      for (const [network, tokens] of Object.entries(TOKEN_CONTRACTS)) {
        const provider = network === CUSTOM_NETWORK ? denergyProvider : sepoliaProvider;

        for (const [token, contractAddress] of Object.entries(tokens)) {
          const contract = new ethers.Contract(contractAddress, ERC20_ABI, provider);
          const balance = await contract.balanceOf(walletAddress);
          const formattedBalance = ethers.formatUnits(balance, 6);

          // Update respective states
          if (network === 'denergy') {
            if (token === 'USDC') setDenergyUsdcBalance(formattedBalance);
            if (token === 'EURC') setDenergyEurcBalance(formattedBalance);
          } else if (network === 'sepolia') {
            if (token === 'USDC') setSepoliaUsdcBalance(formattedBalance);
            if (token === 'EURC') setSepoliaEurcBalance(formattedBalance);
          }
        }
      }
    } catch (err) {
      console.error('Error fetching balances:', err);
      setError(err.message || 'Failed to fetch balances');
    } finally {
      setIsLoading(false);
    }
  }, []);

  return {
    wattsBalance,
    ethBalance,
    denergyUsdcBalance,
    denergyEurcBalance,
    sepoliaUsdcBalance,
    sepoliaEurcBalance,
    isBalanceLoading: isLoading,
    isBalanceError: error,
    fetchBalances,
  };
};
