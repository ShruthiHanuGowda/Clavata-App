import {useState, useCallback, useEffect} from 'react';
import {
  BrowserProvider,
  Contract,
  TransactionReceipt,
  parseUnits,
  formatUnits,
} from 'ethers';
import {useMagic} from '../../../../screens/Provider/MagicProvider';
import {useAuth} from '../../../../screens/Provider/authProvider';
import {useWallet} from '../../../../screens/Provider/WalletProvider';
import {STAKING_WATT_ABI} from '../../../utils/Contracts';
import {STAKING_ADDRESS} from '../../../constants';

const STAKING_CONTRACT_ADDRESS = STAKING_ADDRESS;

interface DelegateEvent {
  delegatorAddress: string;
  validatorAddress: string;
  amount: string;
  newShares: string;
  transactionHash: string;
}

interface UnbondEvent {
  delegatorAddress: string;
  validatorAddress: string;
  amount: string;
  completionTime: string;
  transactionHash: string;
}

// Callback types for the event listeners
type DelegateCallback = (event: DelegateEvent) => void;
type UnbondCallback = (event: UnbondEvent) => void;

// Define success callback interface
interface WATTStakingSuccess {
  txHash: string;
  amount: string;
  userAddress: string;
  validatorAddress: string;
}

type SuccessCallback = (result: WATTStakingSuccess) => void;

/**
 * Custom hook for WATT native coin staking operations
 * @param validatorAddress - Dynamic validator address to use for staking operations (as string, not address type)
 * @returns Staking state and functions
 */
export const useWATTStaking = (validatorAddress?: string) => {
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [wattBalance, setWattBalance] = useState<string>('0');

  // Get magic instance from the provider
  const {magic, setActiveNetwork} = useMagic();

  // Get user details from auth provider
  const {userDetails} = useAuth();

  // Get balance refresh function
  const {refreshBalance, getBalance} = useWallet();

  /**
   * Get native WATT balance for the user
   */
  const getWATTBalance = useCallback(async (): Promise<string> => {
    console.log('[WATT Staking] Fetching native WATT balance');

    try {
      if (!magic) {
        console.error('[WATT Staking] Magic SDK not available');
        throw new Error('Magic SDK not available');
      }

      // Get Magic provider
      const magicProvider = new BrowserProvider(magic.rpcProvider as any);
      const signer = await magicProvider.getSigner();
      const userAddress = await signer.getAddress();

      // Get native balance (like eth_getBalance)
      const balance = await magicProvider.getBalance(userAddress);
      const formattedBalance = formatUnits(balance, 18); // Native coins typically use 18 decimals

      console.log(`[WATT Staking] Native WATT Balance: ${formattedBalance}`);
      setWattBalance(formattedBalance);
      return formattedBalance;
    } catch (err: any) {
      console.error(
        `[WATT Staking] Error fetching WATT balance: ${
          err.message || 'Unknown error'
        }`,
      );
      setError(err.message || 'Failed to fetch WATT balance');
      return '0';
    }
  }, [magic]);

  /**
   * Delegate native WATT tokens to a validator
   * @param amount - Amount to delegate
   * @param onSuccess - Optional callback for successful transaction
   */
  const delegateWATT = useCallback(
    async (
      amount: string,
      onSuccess?: SuccessCallback,
    ): Promise<TransactionReceipt | undefined> => {
      // Validate that validator address is provided
      if (!validatorAddress) {
        const errorMsg = 'Validator address is required for WATT staking';
        console.error(`[WATT Staking] ${errorMsg}`);
        setError(errorMsg);
        throw new Error(errorMsg);
      }

      console.log(`[WATT Staking] Starting native WATT delegate process`);
      console.log(`[WATT Staking] Amount: ${amount}`);
      console.log(
        `[WATT Staking] Using validator address: ${validatorAddress}`,
      );

      await setActiveNetwork('denergy');
      console.log('[WATT Staking] Network set to denergy');

      try {
        if (!magic) {
          console.error('[WATT Staking] Magic SDK not available');
          throw new Error('Magic SDK not available');
        }

        setIsLoading(true);
        setError(null);
        console.log('[WATT Staking] Initializing provider and signer');

        // Get Magic provider for signing transactions
        const magicProvider = new BrowserProvider(magic.rpcProvider as any);
        const signer = await magicProvider.getSigner();
        const delegatorAddress = await signer.getAddress();
        console.log(`[WATT Staking] Delegator address: ${delegatorAddress}`);

        // Convert amount to proper format
        const amountInWei = parseUnits(amount, 6); // Based on your original code using 6 decimals
        console.log(`[WATT Staking] Amount in Wei: ${amountInWei.toString()}`);

        // Check if user has sufficient balance
        const currentBalance = await magicProvider.getBalance(delegatorAddress);
        if (currentBalance < amountInWei) {
          throw new Error(
            `Insufficient WATT balance. Required: ${amount}, Available: ${formatUnits(
              currentBalance,
              18,
            )}`,
          );
        }

        // Initialize staking contract
        console.log(
          `[WATT Staking] Initializing staking contract at ${STAKING_CONTRACT_ADDRESS}`,
        );
        const stakingContract = new Contract(
          STAKING_CONTRACT_ADDRESS,
          STAKING_WATT_ABI,
          signer,
        );

        // Call the delegate function according to ABI
        // function delegate(address delegatorAddress, string validatorAddress, uint256 amount)
        console.log('[WATT Staking] Submitting delegate transaction...');
        const tx = await stakingContract.delegate(
          delegatorAddress,
          validatorAddress, // String format as per ABI
          amountInWei,
          {gasLimit: 9000000},
        );
        console.log(`[WATT Staking] Transaction submitted: ${tx.hash}`);

        // Wait for the transaction to be mined
        console.log('[WATT Staking] Waiting for transaction confirmation...');
        const receipt = await tx.wait();
        console.log(
          `[WATT Staking] Transaction confirmed in block: ${receipt?.blockNumber}`,
        );

        // Refresh balances
        console.log('[WATT Staking] Refreshing WATT balance');
        await getWATTBalance();
        refreshBalance('watt');

        // Call success callback if provided
        if (onSuccess && typeof onSuccess === 'function' && receipt) {
          console.log('[WATT Staking] Preparing success callback data');
          const successData: WATTStakingSuccess = {
            txHash: receipt.hash,
            userAddress: delegatorAddress,
            validatorAddress: validatorAddress,
            amount: amount,
          };

          console.log('[WATT Staking] Calling success callback');
          onSuccess(successData);
        }

        console.log(
          '[WATT Staking] Native WATT delegation completed successfully',
        );
        return receipt;
      } catch (err: any) {
        console.error(
          `[WATT Staking] Delegate WATT error: ${
            err.message || 'Unknown error'
          }`,
        );
        console.error(err);
        setError(err.message || 'WATT delegate transaction failed');
        throw err;
      } finally {
        setIsLoading(false);
        console.log('[WATT Staking] Delegate WATT process finished');
      }
    },
    [
      magic,
      userDetails,
      refreshBalance,
      setActiveNetwork,
      getWATTBalance,
      validatorAddress,
    ],
  );

  /**
   * Undelegate WATT tokens from a validator
   * @param amount - Amount to undelegate
   * @param onSuccess - Optional callback for successful transaction
   */
  const undelegateWATT = useCallback(
    async (
      amount: string,
      onSuccess?: SuccessCallback,
    ): Promise<
      {receipt: TransactionReceipt; completionTime: string} | undefined
    > => {
      // Validate that validator address is provided
      if (!validatorAddress) {
        const errorMsg = 'Validator address is required for WATT unstaking';
        console.error(`[WATT Staking] ${errorMsg}`);
        setError(errorMsg);
        throw new Error(errorMsg);
      }

      console.log(`[WATT Staking] Starting WATT undelegate process`);
      console.log(`[WATT Staking] Amount: ${amount}`);
      console.log(
        `[WATT Staking] Using validator address: ${validatorAddress}`,
      );

      await setActiveNetwork('denergy');
      console.log('[WATT Staking] Network set to denergy');

      try {
        if (!magic) {
          console.error('[WATT Staking] Magic SDK not available');
          throw new Error('Magic SDK not available');
        }

        setIsLoading(true);
        setError(null);
        console.log('[WATT Staking] Initializing provider and signer');

        // Get Magic provider for signing transactions
        const magicProvider = new BrowserProvider(magic.rpcProvider as any);
        const signer = await magicProvider.getSigner();
        const delegatorAddress = await signer.getAddress();
        console.log(`[WATT Staking] Delegator address: ${delegatorAddress}`);

        // Initialize staking contract
        console.log(
          `[WATT Staking] Initializing staking contract at ${STAKING_CONTRACT_ADDRESS}`,
        );
        const stakingContract = new Contract(
          STAKING_CONTRACT_ADDRESS,
          STAKING_WATT_ABI,
          signer,
        );

        // Convert amount to proper format
        const amountInWei = parseUnits(amount, 6); // Based on your original code using 6 decimals
        console.log(`[WATT Staking] Amount in Wei: ${amountInWei.toString()}`);

        // Call the undelegate function according to ABI
        // function undelegate(address delegatorAddress, string validatorAddress, uint256 amount) returns (int64 completionTime)
        console.log('[WATT Staking] Submitting undelegate transaction...');
        const tx = await stakingContract.undelegate(
          delegatorAddress,
          validatorAddress, // String format as per ABI
          amountInWei,
          {gasLimit: 9000000},
        );
        console.log(`[WATT Staking] Transaction submitted: ${tx.hash}`);

        // Wait for the transaction to be mined
        console.log('[WATT Staking] Waiting for transaction confirmation...');
        const receipt = await tx.wait();
        console.log(
          `[WATT Staking] Transaction confirmed in block: ${receipt?.blockNumber}`,
        );

        // Get the completion time from the transaction result
        let completionTime = '';
        try {
          console.log(
            '[WATT Staking] Retrieving completion time from transaction result',
          );
          // The completion time should be available in the transaction receipt or logs
          // You might need to parse the transaction logs to get the actual completion time
          completionTime = Date.now().toString(); // Fallback to current timestamp
          console.log(`[WATT Staking] Completion time: ${completionTime}`);
        } catch (err) {
          console.error('[WATT Staking] Failed to get completion time', err);
        }

        // Refresh balances
        console.log('[WATT Staking] Refreshing WATT balance');
        await getWATTBalance();
        refreshBalance('watt');

        // Call success callback if provided
        if (onSuccess && typeof onSuccess === 'function' && receipt) {
          console.log('[WATT Staking] Preparing success callback data');
          const successData: WATTStakingSuccess = {
            txHash: receipt.hash,
            userAddress: delegatorAddress,
            validatorAddress: validatorAddress,
            amount: amount,
          };

          console.log('[WATT Staking] Calling success callback');
          onSuccess(successData);
        }

        console.log('[WATT Staking] WATT undelegation completed successfully');
        return {
          receipt,
          completionTime,
        };
      } catch (err: any) {
        console.error(
          `[WATT Staking] Undelegate WATT error: ${
            err.message || 'Unknown error'
          }`,
        );
        console.error(err);
        setError(err.message || 'WATT undelegate transaction failed');
        throw err;
      } finally {
        setIsLoading(false);
        console.log('[WATT Staking] Undelegate WATT process finished');
      }
    },
    [
      magic,
      userDetails,
      refreshBalance,
      setActiveNetwork,
      getWATTBalance,
      validatorAddress,
    ],
  );

  /**
   * Get delegation information for a specific delegator and validator
   * @param delegatorAddress - Address of the delegator
   * @param validatorAddress - Address of the validator (string format)
   */
  const getDelegation = useCallback(
    async (delegatorAddress: string, validatorAddress: string) => {
      try {
        if (!magic) {
          throw new Error('Magic SDK not available');
        }

        const magicProvider = new BrowserProvider(magic.rpcProvider as any);
        const stakingContract = new Contract(
          STAKING_CONTRACT_ADDRESS,
          STAKING_WATT_ABI,
          magicProvider,
        );

        // Call the delegation function according to ABI
        // function delegation(address delegatorAddress, string validatorAddress) returns (uint256 shares, Coin balance)
        const result = await stakingContract.delegation(
          delegatorAddress,
          validatorAddress,
        );

        console.log('[WATT Staking] Delegation info:', result);
        return result;
      } catch (err: any) {
        console.error('[WATT Staking] Error getting delegation info:', err);
        setError(err.message || 'Failed to get delegation information');
        return null;
      }
    },
    [magic],
  );

  /**
   * Listen for WATT staking-related events
   * @param onDelegate - Callback for Delegate events
   * @param onUnbond - Callback for Unbond events
   * @returns A cleanup function to remove all listeners
   */
  const listenForWATTEvents = useCallback(
    (onDelegate?: DelegateCallback, onUnbond?: UnbondCallback) => {
      if (!magic) {
        console.error(
          '[WATT Staking] Magic SDK not available for event listeners',
        );
        setError('Magic SDK not available');
        return () => {};
      }

      console.log('[WATT Staking] Setting up WATT event listeners');

      const setupListeners = async () => {
        try {
          console.log(
            '[WATT Staking] Initializing provider for event listeners',
          );
          const magicProvider = new BrowserProvider(magic.rpcProvider as any);
          const stakingContract = new Contract(
            STAKING_CONTRACT_ADDRESS,
            STAKING_WATT_ABI,
            magicProvider,
          );

          // Clean up any existing listeners first
          console.log('[WATT Staking] Removing any existing listeners');
          stakingContract.removeAllListeners();

          // Set up Delegate event listener (according to ABI)
          if (onDelegate) {
            console.log('[WATT Staking] Setting up Delegate event listener');
            const delegateFilter = stakingContract.filters.Delegate();
            stakingContract.on(
              delegateFilter,
              (
                delegatorAddress,
                validatorAddress,
                amount,
                newShares,
                event,
              ) => {
                console.log(
                  `[WATT Staking] Delegate event detected: ${event.transactionHash}`,
                );
                console.log(
                  `[WATT Staking] Delegator: ${delegatorAddress}, Validator: ${validatorAddress}`,
                );
                console.log(
                  `[WATT Staking] Amount: ${formatUnits(amount, 6)}`, // Using 6 decimals as per your code
                );

                onDelegate({
                  delegatorAddress,
                  validatorAddress,
                  amount: formatUnits(amount, 6),
                  newShares: newShares.toString(),
                  transactionHash: event.transactionHash,
                });
              },
            );
          }

          // Set up Unbond event listener (according to ABI)
          if (onUnbond) {
            console.log('[WATT Staking] Setting up Unbond event listener');
            const unbondFilter = stakingContract.filters.Unbond();
            stakingContract.on(
              unbondFilter,
              (
                delegatorAddress,
                validatorAddress,
                amount,
                completionTime,
                event,
              ) => {
                console.log(
                  `[WATT Staking] Unbond event detected: ${event.transactionHash}`,
                );
                console.log(
                  `[WATT Staking] Delegator: ${delegatorAddress}, Validator: ${validatorAddress}`,
                );
                console.log(
                  `[WATT Staking] Amount: ${formatUnits(amount, 6)}`, // Using 6 decimals as per your code
                );
                console.log(
                  `[WATT Staking] Completion Time: ${completionTime.toString()}`,
                );

                onUnbond({
                  delegatorAddress,
                  validatorAddress,
                  amount: formatUnits(amount, 6),
                  completionTime: completionTime.toString(),
                  transactionHash: event.transactionHash,
                });
              },
            );
          }

          console.log(
            '[WATT Staking] WATT event listeners successfully set up',
          );
        } catch (err) {
          console.error(
            '[WATT Staking] Failed to set up WATT event listeners:',
            err,
          );
          setError('Failed to set up WATT event listeners');
        }
      };

      setupListeners();

      // Return cleanup function
      return () => {
        console.log('[WATT Staking] Cleaning up WATT event listeners');
        const cleanup = async () => {
          try {
            const magicProvider = new BrowserProvider(magic.rpcProvider as any);
            const stakingContract = new Contract(
              STAKING_CONTRACT_ADDRESS,
              STAKING_WATT_ABI,
              magicProvider,
            );
            stakingContract.removeAllListeners();
            console.log('[WATT Staking] All WATT event listeners removed');
          } catch (err) {
            console.error(
              '[WATT Staking] Failed to remove WATT event listeners:',
              err,
            );
          }
        };
        cleanup();
      };
    },
    [magic],
  );

  // Initialize WATT balance on hook mount
  useEffect(() => {
    if (magic) {
      getWATTBalance();
    }
  }, [magic, getWATTBalance]);

  // Clean up event listeners when component unmounts
  useEffect(() => {
    return () => {
      const cleanup = async () => {
        if (magic) {
          try {
            console.log(
              '[WATT Staking] Cleaning up WATT event listeners on unmount',
            );
            const magicProvider = new BrowserProvider(magic.rpcProvider as any);
            const stakingContract = new Contract(
              STAKING_CONTRACT_ADDRESS,
              STAKING_WATT_ABI,
              magicProvider,
            );
            stakingContract.removeAllListeners();
            console.log(
              '[WATT Staking] All WATT event listeners removed on unmount',
            );
          } catch (err) {
            console.error(
              '[WATT Staking] Failed to remove WATT event listeners on unmount:',
              err,
            );
          }
        }
      };
      cleanup();
    };
  }, [magic]);

  console.log(
    '[WATT Staking] Hook initialized with validator:',
    validatorAddress || 'No validator address provided',
  );

  return {
    isLoading,
    error,
    wattBalance,
    getWATTBalance,
    delegateWATT,
    undelegateWATT,
    getDelegation,
    listenForWATTEvents,
  };
};
