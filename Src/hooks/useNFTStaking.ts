import {useState, useCallback, useEffect} from 'react';
import {
  BrowserProvider,
  Contract,
  TransactionReceipt,
  parseUnits,
  formatUnits,
} from 'ethers';
import {useMagic} from '../../screens/Provider/MagicProvider';
import {useAuth} from '../../screens/Provider/authProvider';
import {useWallet} from '../../screens/Provider/WalletProvider';
import {STAKING_CONTRACT_ABI} from '../utils/Contracts';

// Contract address for the staking contract
const STAKING_CONTRACT_ADDRESS = '0x0000000000000000000000000000000000000808';

// Event interfaces for the event listeners
interface CreateValidatorEvent {
  validatorAddress: string;
  erc1155Contract: string;
  tokenId: string;
  value: string;
  transactionHash: string;
}

interface DelegateEvent {
  delegatorAddress: string;
  validatorAddress: string;
  nftContractAddress: string;
  tokenId: string;
  amount: string;
  newShares: string;
  transactionHash: string;
}

interface UnbondEvent {
  delegatorAddress: string;
  validatorAddress: string;
  nftContractAddress: string;
  tokenId: string;
  amount: string;
  completionTime: string;
  transactionHash: string;
}

// Callback types for the event listeners
type CreateValidatorCallback = (event: CreateValidatorEvent) => void;
type DelegateCallback = (event: DelegateEvent) => void;
type UnbondCallback = (event: UnbondEvent) => void;

// Define success callback interface
interface StakingSuccess {
  txHash: string;
  amount?: string;
  userAddress: string;
  tokenId: string;
  validatorAddress: string;
  erc1155Contract: string;
}

type SuccessCallback = (result: StakingSuccess) => void;

// API call helper function (similar to your useBridge hook)
const apiCall = async (transactionDetails: any, endPoint: string) => {
  const apiUrl = `${'https://your-api-endpoint.com'}/staking_api/${endPoint}`;
  try {
    const response = await fetch(apiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': 'YOUR_API_KEY',
      },
      body: JSON.stringify(transactionDetails),
    });
    const result = await response.json();
    console.log('result', result);
    return result;
  } catch (error) {
    console.error('API call failed:', error);
  }
};

/**
 * Custom hook for NFT staking operations
 * @returns Staking state and functions
 */
export const useNFTStaking = () => {
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  // Get magic instance from the provider (adjust network names as needed)
  const {magic_denergy, setActiveNetwork} = useMagic();

  // Get user details from auth provider
  const {userDetails} = useAuth();

  // Get balance refresh function
  const {refreshBalance} = useWallet();

  /**
   * Create NFT validator
   * @param validatorAddress - Address of the validator
   * @param minSelfDelegation - Minimum self delegation amount
   * @param erc1155Contract - Address of the ERC1155 contract
   * @param tokenId - ID of the token
   * @param value - Value to stake
   * @param onSuccess - Optional callback for successful transaction
   */
  const createNFTValidator = useCallback(
    async (
      validatorAddress: string,
      minSelfDelegation: string,
      erc1155Contract: string,
      tokenId: string,
      value: string,
      onSuccess?: SuccessCallback,
    ): Promise<TransactionReceipt | undefined> => {
      await setActiveNetwork('denergy');
      try {
        if (!magic_denergy) {
          throw new Error('Magic SDK not available');
        }

        setIsLoading(true);
        setError(null);

        // Get Magic provider for signing transactions
        const magicProvider = new BrowserProvider(magic_denergy.rpcProvider);
        const signer = await magicProvider.getSigner();
        const userAddress = await signer.getAddress();

        // Initialize staking contract
        const stakingContract = new Contract(
          STAKING_CONTRACT_ADDRESS,
          STAKING_CONTRACT_ABI,
          signer,
        );

        // Convert values to proper format if needed
        const valueInWei = parseUnits(value, 18); // Adjust decimals as needed for your token
        const minSelfDelegationInWei = parseUnits(minSelfDelegation, 18);
        const tokenIdBigInt = BigInt(tokenId);

        // Call the createNFTValidator function
        const tx = await stakingContract.createNFTValidator(
          validatorAddress,
          minSelfDelegationInWei,
          erc1155Contract,
          tokenIdBigInt,
          valueInWei,
        );

        // Wait for the transaction to be mined
        const receipt = await tx.wait();

        // Refresh balances if needed
        refreshBalance('NFT');

        // Call success callback if provided
        if (onSuccess && typeof onSuccess === 'function' && receipt) {
          const successData: StakingSuccess = {
            txHash: receipt.hash,
            userAddress: userAddress,
            validatorAddress: validatorAddress,
            erc1155Contract: erc1155Contract,
            tokenId: tokenId,
            amount: value,
          };

          // Create transaction details for API call
          const transactionDetails = {
            validatorAddress,
            userAddress,
            erc1155Contract,
            tokenId,
            amount: value,
            hash: receipt.hash,
          };
          apiCall(transactionDetails, 'createNFTValidator').then();

          onSuccess(successData);
        }

        return receipt;
      } catch (err: any) {
        setError(err.message || 'Create validator transaction failed');
        throw err;
      } finally {
        setIsLoading(false);
      }
    },
    [magic_denergy, userDetails, refreshBalance, setActiveNetwork],
  );

  /**
   * Delegate ERC1155 tokens to a validator
   * @param erc1155Contract - Address of the ERC1155 contract
   * @param delegatorAddress - Address of the delegator
   * @param validatorAddress - Address of the validator
   * @param tokenId - ID of the token
   * @param amount - Amount to delegate
   * @param onSuccess - Optional callback for successful transaction
   */
  const delegateERC1155 = useCallback(
    async (
      erc1155Contract: string,
      delegatorAddress: string,
      validatorAddress: string,
      tokenId: string,
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

        // Get Magic provider for signing transactions
        const magicProvider = new BrowserProvider(magic_denergy.rpcProvider);
        const signer = await magicProvider.getSigner();
        const userAddr = await signer.getAddress();

        // Initialize staking contract
        const stakingContract = new Contract(
          STAKING_CONTRACT_ADDRESS,
          STAKING_CONTRACT_ABI,
          signer,
        );

        // Convert values to proper format
        const amountInWei = parseUnits(amount, 18); // Adjust decimals as needed
        const tokenIdBigInt = BigInt(tokenId);

        // Call the delegateERC1155 function
        const tx = await stakingContract.delegateERC1155(
          erc1155Contract,
          delegatorAddress,
          validatorAddress,
          tokenIdBigInt,
          amountInWei,
        );

        // Wait for the transaction to be mined
        const receipt = await tx.wait();

        // Refresh balances if needed
        refreshBalance('NFT');

        // Call success callback if provided
        if (onSuccess && typeof onSuccess === 'function' && receipt) {
          const successData: StakingSuccess = {
            txHash: receipt.hash,
            userAddress: userAddr,
            validatorAddress: validatorAddress,
            erc1155Contract: erc1155Contract,
            tokenId: tokenId,
            amount: amount,
          };

          // Create transaction details for API call
          const transactionDetails = {
            delegatorAddress,
            validatorAddress,
            erc1155Contract,
            tokenId,
            amount,
            hash: receipt.hash,
          };
          apiCall(transactionDetails, 'delegateERC1155').then();

          onSuccess(successData);
        }

        return receipt;
      } catch (err: any) {
        setError(err.message || 'Delegate transaction failed');
        throw err;
      } finally {
        setIsLoading(false);
      }
    },
    [magic_denergy, userDetails, refreshBalance, setActiveNetwork],
  );

  /**
   * Undelegate ERC1155 tokens from a validator
   * @param erc1155Contract - Address of the ERC1155 contract
   * @param delegatorAddress - Address of the delegator
   * @param validatorAddress - Address of the validator
   * @param tokenId - ID of the token
   * @param amount - Amount to undelegate
   * @param onSuccess - Optional callback for successful transaction
   */
  const undelegateERC1155 = useCallback(
    async (
      erc1155Contract: string,
      delegatorAddress: string,
      validatorAddress: string,
      tokenId: string,
      amount: string,
      onSuccess?: SuccessCallback,
    ): Promise<
      {receipt: TransactionReceipt; completionTime: string} | undefined
    > => {
      await setActiveNetwork('denergy');
      try {
        if (!magic_denergy) {
          throw new Error('Magic SDK not available');
        }

        setIsLoading(true);
        setError(null);

        // Get Magic provider for signing transactions
        const magicProvider = new BrowserProvider(magic_denergy.rpcProvider);
        const signer = await magicProvider.getSigner();
        const userAddr = await signer.getAddress();

        // Initialize staking contract
        const stakingContract = new Contract(
          STAKING_CONTRACT_ADDRESS,
          STAKING_CONTRACT_ABI,
          signer,
        );

        // Convert values to proper format
        const amountInWei = parseUnits(amount, 18); // Adjust decimals as needed
        const tokenIdBigInt = BigInt(tokenId);

        // Call the undelegateERC1155 function
        const tx = await stakingContract.undelegateERC1155(
          erc1155Contract,
          delegatorAddress,
          validatorAddress,
          tokenIdBigInt,
          amountInWei,
        );

        // Wait for the transaction to be mined
        const receipt = await tx.wait();

        // Get the completion time from the result
        let completionTime = '';
        try {
          const result = await tx;
          completionTime = result.toString();
        } catch (err) {
          console.error('Failed to get completion time', err);
        }

        // Refresh balances if needed
        refreshBalance('NFT');

        // Call success callback if provided
        if (onSuccess && typeof onSuccess === 'function' && receipt) {
          const successData: StakingSuccess = {
            txHash: receipt.hash,
            userAddress: userAddr,
            validatorAddress: validatorAddress,
            erc1155Contract: erc1155Contract,
            tokenId: tokenId,
            amount: amount,
          };

          // Create transaction details for API call
          const transactionDetails = {
            delegatorAddress,
            validatorAddress,
            erc1155Contract,
            tokenId,
            amount,
            hash: receipt.hash,
            completionTime,
          };
          apiCall(transactionDetails, 'undelegateERC1155').then();

          onSuccess(successData);
        }

        return {
          receipt,
          completionTime,
        };
      } catch (err: any) {
        setError(err.message || 'Undelegate transaction failed');
        throw err;
      } finally {
        setIsLoading(false);
      }
    },
    [magic_denergy, userDetails, refreshBalance, setActiveNetwork],
  );

  /**
   * Listen for staking-related events
   * @param onCreateValidator - Callback for CreateNFTValidator events
   * @param onDelegate - Callback for DelegateNFT events
   * @param onUnbond - Callback for UnbondNFT events
   * @returns A cleanup function to remove all listeners
   */
  const listenForEvents = useCallback(
    (
      onCreateValidator?: CreateValidatorCallback,
      onDelegate?: DelegateCallback,
      onUnbond?: UnbondCallback,
    ) => {
      if (!magic_denergy) {
        setError('Magic SDK not available');
        return () => {};
      }

      const setupListeners = async () => {
        try {
          const magicProvider = new BrowserProvider(magic_denergy.rpcProvider);
          const stakingContract = new Contract(
            STAKING_CONTRACT_ADDRESS,
            STAKING_CONTRACT_ABI,
            magicProvider,
          );

          // Clean up any existing listeners first
          stakingContract.removeAllListeners();

          // Set up CreateNFTValidator event listener
          if (onCreateValidator) {
            const createFilter = stakingContract.filters.CreateNFTValidator();
            stakingContract.on(
              createFilter,
              (validatorAddress, erc1155Contract, tokenId, value, event) => {
                onCreateValidator({
                  validatorAddress,
                  erc1155Contract,
                  tokenId: tokenId.toString(),
                  value: formatUnits(value, 18), // Adjust decimals as needed
                  transactionHash: event.transactionHash,
                });
              },
            );
          }

          // Set up DelegateNFT event listener
          if (onDelegate) {
            const delegateFilter = stakingContract.filters.DelegateNFT();
            stakingContract.on(
              delegateFilter,
              (
                delegatorAddress,
                validatorAddress,
                nftContractAddress,
                tokenId,
                amount,
                newShares,
                event,
              ) => {
                onDelegate({
                  delegatorAddress,
                  validatorAddress,
                  nftContractAddress,
                  tokenId: tokenId.toString(),
                  amount: formatUnits(amount, 18), // Adjust decimals as needed
                  newShares: newShares.toString(),
                  transactionHash: event.transactionHash,
                });
              },
            );
          }

          // Set up UnbondNFT event listener
          if (onUnbond) {
            const unbondFilter = stakingContract.filters.UnbondNFT();
            stakingContract.on(
              unbondFilter,
              (
                delegatorAddress,
                validatorAddress,
                nftContractAddress,
                tokenId,
                amount,
                completionTime,
                event,
              ) => {
                onUnbond({
                  delegatorAddress,
                  validatorAddress,
                  nftContractAddress,
                  tokenId: tokenId.toString(),
                  amount: formatUnits(amount, 18), // Adjust decimals as needed
                  completionTime: completionTime.toString(),
                  transactionHash: event.transactionHash,
                });
              },
            );
          }
        } catch (err) {
          console.error('Failed to set up event listeners:', err);
          setError('Failed to set up event listeners');
        }
      };

      setupListeners();

      // Return cleanup function
      return () => {
        const cleanup = async () => {
          try {
            const magicProvider = new BrowserProvider(
              magic_denergy.rpcProvider,
            );
            const stakingContract = new Contract(
              STAKING_CONTRACT_ADDRESS,
              STAKING_CONTRACT_ABI,
              magicProvider,
            );
            stakingContract.removeAllListeners();
          } catch (err) {
            console.error('Failed to remove event listeners:', err);
          }
        };
        cleanup();
      };
    },
    [magic_denergy],
  );

  // Clean up event listeners when component unmounts
  useEffect(() => {
    return () => {
      const cleanup = async () => {
        if (magic_denergy) {
          try {
            const magicProvider = new BrowserProvider(
              magic_denergy.rpcProvider,
            );
            const stakingContract = new Contract(
              STAKING_CONTRACT_ADDRESS,
              STAKING_CONTRACT_ABI,
              magicProvider,
            );
            stakingContract.removeAllListeners();
          } catch (err) {
            console.error('Failed to remove event listeners:', err);
          }
        }
      };
      cleanup();
    };
  }, [magic_denergy]);

  return {
    isLoading,
    error,
    createNFTValidator,
    delegateERC1155,
    undelegateERC1155,
    listenForEvents,
  };
};
