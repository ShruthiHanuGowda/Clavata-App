import {useState, useCallback} from 'react';
import {
  BrowserProvider,
  Contract,
  TransactionReceipt,
  parseUnits,
} from 'ethers';
import {useMagic} from '../../screens/Provider/MagicProvider';
import {useAuth} from '../../screens/Provider/authProvider';
import {
  BANK_ADDRESS,
  USDC_ADDRESS,
  BRIDGE_ADDRESS,
  EURC_ADDRESS,
  DENERGY_USDC_ADDRESS,
  DESTINATION_ADDRESS,
  DENERGY_EURC_ADDRESS,
} from '../constants';
import {useWallet} from '../../screens/Provider/WalletProvider';
import {BRIDGE_ABI, ERC20_ABI, DEPOSIT_TOKEN_ABI} from '../utils/Contracts';
interface BridgeSuccess {
  txHash: string;
  amount: string;
  userAddress: string;
  sourceChain: string;
  coinCode: string;
}

type SuccessCallback = (result: BridgeSuccess) => void;

/**
 * Custom hook for bridging USDC to WUSDC on Sepolia
 *
 * @returns Bridge state and functions
 */
export const useBridge = () => {
  const {refreshBalance} = useWallet();
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  // Get magic instance from the provider
  const {magic_sepolia, magic_denergy, setActiveNetwork} = useMagic();

  // Get user details from auth provider
  const {userDetails} = useAuth();

  /**
   * Bridge USDC to WUSDC
   * @param amount - Amount to bridge
   * @param onSuccess - Optional callback for successful transaction
   */
  const bridgeUSDC = useCallback(
    async (
      amount: string,
      onSuccess?: SuccessCallback,
    ): Promise<TransactionReceipt | undefined> => {
      await setActiveNetwork('sepolia');
      try {
        if (!magic_sepolia) {
          throw new Error('Magic SDK not available');
        }

        setIsLoading(true);
        setError(null);

        const usdcAddress = USDC_ADDRESS;
        const bankAddress = BANK_ADDRESS;
        const bridgeAddress = BRIDGE_ADDRESS;

        // Get Magic provider for signing transactions
        const magicProvider = new BrowserProvider(magic_sepolia.rpcProvider);
        const signer = await magicProvider.getSigner();

        // Initialize contracts
        const usdcContract = new Contract(usdcAddress, ERC20_ABI, signer);
        const bridgeContract = new Contract(bridgeAddress, BRIDGE_ABI, signer);

        // Check USDC balance before proceeding
        try {
          const balance = await usdcContract.balanceOf(
            await signer.getAddress(),
          );
        } catch (err) {
          // Balance check failed, continue anyway
        }

        // Approve bank to spend USDC
        const approveTx = await usdcContract.approve(
          bankAddress,
          parseUnits(amount, 6), // USDC has 6 decimals
        );
        const approvalReceipt = await approveTx.wait();

        // Deposit USDC to bridge
        const depositTx = await bridgeContract.depositERC20(
          usdcAddress,
          parseUnits(amount, 6),
        );
        const receipt = await depositTx.wait();

        // Get user address from Auth provider
        const userAddress = userDetails?.ethereumWallet || '';

        // Create transaction details for API call
        const transactionDetails = {
          amount,
          userAddress: userAddress,
          hash: receipt?.hash || '',
          sourceChainCode: 'ETH',
          coinCode: 'USDC',
        };
        refreshBalance('USDC');

        // Call success callback if provided
        if (onSuccess && typeof onSuccess === 'function' && receipt) {
          const successData = {
            txHash: receipt.hash,
            amount: amount,
            userAddress: userAddress,
            sourceChain: 'ETH',
            coinCode: 'USDC',
          };
          onSuccess(successData);
        }

        return receipt;
      } catch (err: any) {
        setError(err.message || 'Bridge transaction failed');
        throw err;
      } finally {
        setIsLoading(false);
      }
    },
    [magic_sepolia, userDetails],
  );

  const bridgeEURC = useCallback(
    async (
      amount: string,
      onSuccess?: SuccessCallback,
    ): Promise<TransactionReceipt | undefined> => {
      await setActiveNetwork('sepolia');
      try {
        if (!magic_sepolia) {
          throw new Error('Magic SDK not available');
        }

        setIsLoading(true);
        setError(null);

        const eurcAddress = EURC_ADDRESS;
        const bankAddress = BANK_ADDRESS;
        const bridgeAddress = BRIDGE_ADDRESS;

        // Get Magic provider for signing transactions
        const magicProvider = new BrowserProvider(magic_sepolia.rpcProvider);
        const signer = await magicProvider.getSigner();

        // Initialize contracts
        const eurcContract = new Contract(eurcAddress, ERC20_ABI, signer);
        const bridgeContract = new Contract(bridgeAddress, BRIDGE_ABI, signer);

        // Check EURC balance before proceeding
        try {
          const balance = await eurcContract.balanceOf(
            await signer.getAddress(),
          );
        } catch (err) {
          // Balance check failed, continue anyway
        }

        // Approve bank to spend EURC
        const approveTx = await eurcContract.approve(
          bankAddress,
          parseUnits(amount, 6), // EURC has 6 decimals
        );
        const approvalReceipt = await approveTx.wait();

        // Deposit EURC to bridge
        const depositTx = await bridgeContract.depositERC20(
          eurcAddress,
          parseUnits(amount, 6),
        );
        const receipt = await depositTx.wait();

        // Get user address from Auth provider
        const userAddress = userDetails?.ethereumWallet || '';

        // Create transaction details for API call
        const transactionDetails = {
          amount,
          userAddress: userAddress,
          hash: receipt?.hash || '',
          sourceChainCode: 'ETH',
          coinCode: 'EURC',
        };
        refreshBalance('EURC');

        // Call success callback if provided
        if (onSuccess && typeof onSuccess === 'function' && receipt) {
          const successData = {
            txHash: receipt.hash,
            amount: amount,
            userAddress: userAddress,
            sourceChain: 'ETH',
            coinCode: 'EURC',
          };
          onSuccess(successData);
        }

        return receipt;
      } catch (err: any) {
        setError(err.message || 'Bridge transaction failed');
        throw err;
      } finally {
        setIsLoading(false);
      }
    },
    [magic_sepolia, userDetails],
  );

  const bridgeWUSDC = useCallback(
    async (
      amount: string,
      onSuccess?: SuccessCallback,
    ): Promise<TransactionReceipt | undefined> => {
      await setActiveNetwork('denergy');
      try {
        if (!magic_denergy) {
          throw new Error('Magic SDK not available');
        }
        setIsLoading(true);
        setError(null);

        const wusdcAddress = DENERGY_USDC_ADDRESS;
        const usdcAddress = USDC_ADDRESS;
        const destinationAddress = DESTINATION_ADDRESS;

        // Get Magic provider for signing transactions
        const magicProvider = new BrowserProvider(magic_denergy.rpcProvider);
        const signer = await magicProvider.getSigner();

        // Initialize contracts
        const wusdcContract = new Contract(wusdcAddress, ERC20_ABI, signer);
        const destinationContract = new Contract(
          destinationAddress,
          DEPOSIT_TOKEN_ABI,
          signer,
        );

        // Check WUSDC balance before proceeding
        try {
          const balance = await wusdcContract.balanceOf(
            await signer.getAddress(),
          );
        } catch (err) {
          // Balance check failed, continue anyway
        }

        // Approve USDC to spend WUSDC
        const approveTx = await wusdcContract.approve(
          destinationAddress,
          parseUnits(amount, 6), // WUSDC has 6 decimals
        );
        const approvalReceipt = await approveTx.wait();

        // Deposit WUSDC to destination
        const depositTx = await destinationContract.burnERC20(
          wusdcAddress,
          parseUnits(amount, 6),
        );
        const receipt = await depositTx.wait();

        // Get user address from Auth provider
        const userAddress = userDetails?.denergyWallet || '';

        // Create transaction details for API call
        const transactionDetails = {
          amount,
          userAddress: userAddress,
          tokenAddress: usdcAddress || '',
          hash: '',
          sourceChainCode: 'DENERGY',
          coinCode: 'WUSDC',
          destinationChainCode: 'ETH',
        };
        refreshBalance('WUSDC');

        // Call success callback if provided
        if (onSuccess && typeof onSuccess === 'function' && receipt) {
          const successData = {
            txHash: receipt.hash,
            amount: amount,
            userAddress: userAddress,
            sourceChain: 'DENERGY',
            coinCode: 'WUSDC',
          };
          onSuccess(successData);
        }

        return receipt;
      } catch (err: any) {
        setError(err.message || 'Bridge transaction failed');
        throw err;
      } finally {
        setIsLoading(false);
      }
    },
    [magic_denergy, userDetails],
  );

  const bridgeWEURC = useCallback(
    async (
      amount: string,
      onSuccess?: SuccessCallback,
    ): Promise<TransactionReceipt | undefined> => {
      await setActiveNetwork('denergy');
      try {
        if (!magic_denergy) {
          throw new Error('Magic SDK not available');
        }
        setIsLoading(true);
        setError(null);

        const weurcAddress = DENERGY_EURC_ADDRESS;
        const eurcAddress = EURC_ADDRESS;
        const destinationAddress = DESTINATION_ADDRESS;

        // Get Magic provider for signing transactions
        const magicProvider = new BrowserProvider(magic_denergy.rpcProvider);
        const signer = await magicProvider.getSigner();

        // Initialize contracts
        const weurcContract = new Contract(weurcAddress, ERC20_ABI, signer);
        const destinationContract = new Contract(
          destinationAddress,
          DEPOSIT_TOKEN_ABI,
          signer,
        );

        // Check WEURC balance before proceeding
        try {
          const balance = await weurcContract.balanceOf(
            await signer.getAddress(),
          );
        } catch (err) {
          // Balance check failed, continue anyway
        }

        // Approve EURC to spend WEURC
        const approveTx = await weurcContract.approve(
          destinationAddress,
          parseUnits(amount, 6), // WEURC has 6 decimals
        );
        const approvalReceipt = await approveTx.wait();

        // Deposit WEURC to destination
        const depositTx = await destinationContract.burnERC20(
          weurcAddress,
          parseUnits(amount, 6),
        );
        const receipt = await depositTx.wait();

        // Get user address from Auth provider
        const userAddress = userDetails?.denergyWallet || '';

        // Create transaction details for API call
        const transactionDetails = {
          amount,
          userAddress: userAddress,
          tokenAddress: eurcAddress || '',
          hash: '',
          sourceChainCode: 'DENERGY',
          coinCode: 'WEURC',
          destinationChainCode: 'ETH',
        };
        refreshBalance('WEURC');

        // Call success callback if provided
        if (onSuccess && typeof onSuccess === 'function' && receipt) {
          const successData = {
            txHash: receipt.hash,
            amount: amount,
            userAddress: userAddress,
            sourceChain: 'DENERGY',
            coinCode: 'WEURC',
          };
          onSuccess(successData);
        }

        return receipt;
      } catch (err: any) {
        setError(err.message || 'Bridge transaction failed');
        throw err;
      } finally {
        setIsLoading(false);
      }
    },
    [magic_denergy, userDetails],
  );

  return {
    isLoading,
    error,
    bridgeUSDC,
    bridgeEURC,
    bridgeWUSDC,
    bridgeWEURC,
  };
};
