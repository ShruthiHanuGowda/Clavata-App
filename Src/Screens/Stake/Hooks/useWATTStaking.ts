import {useState, useCallback, useEffect} from 'react';
import {
  BrowserProvider,
  Contract,
  TransactionReceipt,
  parseUnits,
  formatUnits,
} from 'ethers';
import {useMagic} from '../../../../screens/Provider/MagicProvider';
import {useWallet} from '../../../../screens/Provider/WalletProvider';
import {STAKING_WATT_ABI} from '../../../utils/Contracts';
import {WATT_STAKING_ADDRESS} from '../../../constants';

const STAKING_CONTRACT_ADDRESS = WATT_STAKING_ADDRESS;

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

type DelegateCallback = (event: DelegateEvent) => void;
type UnbondCallback = (event: UnbondEvent) => void;

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

  const {magic, setActiveNetwork} = useMagic();

  const {refreshBalance} = useWallet();

  /**
   * Get native WATT balance for the user
   */
  const getWATTBalance = useCallback(async (): Promise<string> => {
    try {
      if (!magic) {
        throw new Error('Magic SDK not available');
      }

      // Get Magic provider
      const magicProvider = new BrowserProvider(magic.rpcProvider as any);
      const signer = await magicProvider.getSigner();
      const userAddress = await signer.getAddress();

      // Get native balance (like eth_getBalance)
      const balance = await magicProvider.getBalance(userAddress);
      const formattedBalance = formatUnits(balance, 18); // Native coins typically use 18 decimals

      setWattBalance(formattedBalance);
      return formattedBalance;
    } catch (err: any) {
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
        setError(errorMsg);
        throw new Error(errorMsg);
      }

      await setActiveNetwork('denergy');

      try {
        if (!magic) {
            throw new Error('Magic SDK not available');
        }

        setIsLoading(true);
        setError(null);

        // Get Magic provider for signing transactions
        const magicProvider = new BrowserProvider(magic.rpcProvider as any);
        const signer = await magicProvider.getSigner();
        const delegatorAddress = await signer.getAddress();

        const amountInWei = parseUnits(amount, 18);

        const currentBalance = await magicProvider.getBalance(delegatorAddress);
        if (currentBalance < amountInWei) {
          throw new Error(
            `Insufficient WATT balance. Required: ${amount}, Available: ${formatUnits(
              currentBalance,
              18,
            )}`,
          );
        }

        const stakingContract = new Contract(
          STAKING_CONTRACT_ADDRESS,
          STAKING_WATT_ABI,
          signer,
        );

        const tx = await stakingContract.delegate(
          delegatorAddress,
          validatorAddress,
          amountInWei,
          {gasLimit: 500000},
        );

        const receipt = await tx.wait();

        await getWATTBalance();
        refreshBalance('watt');

        // Call success callback if provided
        if (onSuccess && typeof onSuccess === 'function' && receipt) {
          const successData: WATTStakingSuccess = {
            txHash: receipt.hash,
            userAddress: delegatorAddress,
            validatorAddress: validatorAddress,
            amount: amount,
          };

          onSuccess(successData);
        }

        return receipt;
      } catch (err: any) {
        setError(err.message || 'WATT delegate transaction failed');
        throw err;
      } finally {
        setIsLoading(false);
      }
    },
    [magic, refreshBalance, setActiveNetwork, getWATTBalance, validatorAddress],
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
        setError(errorMsg);
        throw new Error(errorMsg);
      }


      await setActiveNetwork('denergy');

      try {
        if (!magic) {
            throw new Error('Magic SDK not available');
        }

        setIsLoading(true);
        setError(null);

        // Get Magic provider for signing transactions
        const magicProvider = new BrowserProvider(magic.rpcProvider as any);
        const signer = await magicProvider.getSigner();
        const delegatorAddress = await signer.getAddress();

        // Initialize staking contract
        const stakingContract = new Contract(
          STAKING_CONTRACT_ADDRESS,
          STAKING_WATT_ABI,
          signer,
        );

        // Convert amount to proper format
        const amountInWei = parseUnits(amount, 6); // Based on your original code using 6 decimals

        // Call the undelegate function according to ABI
        // function undelegate(address delegatorAddress, string validatorAddress, uint256 amount) returns (int64 completionTime)
        const tx = await stakingContract.undelegate(
          delegatorAddress,
          validatorAddress, // String format as per ABI
          amountInWei,
          {gasLimit: 9000000},
        );

        // Wait for the transaction to be mined
        const receipt = await tx.wait();

        // Get the completion time from the transaction result
        let completionTime = '';
        try {
          // The completion time should be available in the transaction receipt or logs
          // You might need to parse the transaction logs to get the actual completion time
          completionTime = Date.now().toString(); // Fallback to current timestamp
        } catch (err) {
        }

        // Refresh balances
        await getWATTBalance();
        refreshBalance('watt');

        // Call success callback if provided
        if (onSuccess && typeof onSuccess === 'function' && receipt) {
          const successData: WATTStakingSuccess = {
            txHash: receipt.hash,
            userAddress: delegatorAddress,
            validatorAddress: validatorAddress,
            amount: amount,
          };

          onSuccess(successData);
        }

        return {
          receipt,
          completionTime,
        };
      } catch (err: any) {
        setError(err.message || 'WATT undelegate transaction failed');
        throw err;
      } finally {
        setIsLoading(false);
      }
    },
    [magic, refreshBalance, setActiveNetwork, getWATTBalance, validatorAddress],
  );

  /**
   * Get delegation information for a specific delegator and validator
   * @param delegatorAddress - Address of the delegator
   * @param validatorAddress - Address of the validator (string format)
   */
  const getDelegation = useCallback(
    async (delegatorAddress: string, targetValidatorAddress: string) => {
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
          targetValidatorAddress,
        );

        return result;
      } catch (err: any) {
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
        setError('Magic SDK not available');
        return () => {};
      }


      const setupListeners = async () => {
        try {
          const magicProvider = new BrowserProvider(magic.rpcProvider as any);
          const stakingContract = new Contract(
            STAKING_CONTRACT_ADDRESS,
            STAKING_WATT_ABI,
            magicProvider,
          );

          // Clean up any existing listeners first
          stakingContract.removeAllListeners();

          // Set up Delegate event listener (according to ABI)
          if (onDelegate) {
            const delegateFilter = stakingContract.filters.Delegate();
            stakingContract.on(
              delegateFilter,
              (
                delegatorAddress,
                eventValidatorAddress,
                amount,
                newShares,
                event,
              ) => {

                onDelegate({
                  delegatorAddress,
                  validatorAddress: eventValidatorAddress,
                  amount: formatUnits(amount, 6),
                  newShares: newShares.toString(),
                  transactionHash: event.transactionHash,
                });
              },
            );
          }

          // Set up Unbond event listener (according to ABI)
          if (onUnbond) {
            const unbondFilter = stakingContract.filters.Unbond();
            stakingContract.on(
              unbondFilter,
              (
                delegatorAddress,
                eventValidatorAddress,
                amount,
                completionTime,
                event,
              ) => {

                onUnbond({
                  delegatorAddress,
                  validatorAddress: eventValidatorAddress,
                  amount: formatUnits(amount, 6),
                  completionTime: completionTime.toString(),
                  transactionHash: event.transactionHash,
                });
              },
            );
          }

        } catch (err) {
          setError('Failed to set up WATT event listeners');
        }
      };

      setupListeners();

      // Return cleanup function
      return () => {
        const cleanup = async () => {
          try {
            const magicProvider = new BrowserProvider(magic.rpcProvider as any);
            const stakingContract = new Contract(
              STAKING_CONTRACT_ADDRESS,
              STAKING_WATT_ABI,
              magicProvider,
            );
            stakingContract.removeAllListeners();
          } catch (err) {
            // Silent cleanup
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
            const magicProvider = new BrowserProvider(magic.rpcProvider as any);
            const stakingContract = new Contract(
              STAKING_CONTRACT_ADDRESS,
              STAKING_WATT_ABI,
              magicProvider,
            );
            stakingContract.removeAllListeners();
          } catch (err) {
            // Silent cleanup
          }
        }
      };
      cleanup();
    };
  }, [magic]);


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
