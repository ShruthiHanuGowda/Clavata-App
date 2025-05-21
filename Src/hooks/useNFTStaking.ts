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
import {STAKING_CONTRACT_ABI, ERC1155_ABI} from '../utils/Contracts';
import {STAKING_ADDRESS, STAKING_VALIDATOR_ADDRESS} from '../constants';

// Contract address for the staking contract
const STAKING_CONTRACT_ADDRESS = STAKING_ADDRESS;
// Validator address imported from constants
const VALIDATOR_ADDRESS = STAKING_VALIDATOR_ADDRESS;

// Event interfaces for the event listeners
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

/**
 * Custom hook for NFT staking operations
 * @returns Staking state and functions
 */
export const useNFTStaking = () => {
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [isApproved, setIsApproved] = useState<boolean>(false);

  // Get magic instance from the provider (adjust network names as needed)
  const {magic_denergy, setActiveNetwork} = useMagic();

  // Get user details from auth provider
  const {userDetails} = useAuth();

  // Get balance refresh function
  const {refreshBalance} = useWallet();

  /**
   * Check if the staking contract is approved for ERC1155 tokens
   * @param erc1155Contract - Address of the ERC1155 contract
   * @param ownerAddress - Address of the token owner
   * @param operatorAddress - Address to check approval for (staking contract)
   */
  const checkApproval = useCallback(
    async (
      erc1155Contract: string,
      ownerAddress: string,
      operatorAddress: string = STAKING_CONTRACT_ADDRESS,
    ): Promise<boolean> => {
      console.log(
        `[NFT Staking] Checking approval for ${operatorAddress} to handle tokens from ${ownerAddress}`,
      );

      try {
        if (!magic_denergy) {
          console.error('[NFT Staking] Magic SDK not available');
          throw new Error('Magic SDK not available');
        }

        // Get Magic provider
        const magicProvider = new BrowserProvider(magic_denergy.rpcProvider);

        // Create contract instance for the ERC1155 token
        const tokenContract = new Contract(
          erc1155Contract,
          ERC1155_ABI,
          magicProvider,
        );

        // Check if approved
        const approved = await tokenContract.isApprovedForAll(
          ownerAddress,
          operatorAddress,
        );

        console.log(`[NFT Staking] Approval status: ${approved}`);
        setIsApproved(approved);
        return approved;
      } catch (err: any) {
        console.error(
          `[NFT Staking] Error checking approval: ${
            err.message || 'Unknown error'
          }`,
        );
        setError(err.message || 'Failed to check approval status');
        return false;
      }
    },
    [magic_denergy],
  );

  /**
   * Set approval for the staking contract to handle ERC1155 tokens
   * @param erc1155Contract - Address of the ERC1155 contract
   * @param operatorAddress - Address to approve (staking contract)
   */
  const setApproval = useCallback(
    async (
      erc1155Contract: string,
      operatorAddress: string = STAKING_CONTRACT_ADDRESS,
    ): Promise<boolean> => {
      console.log(
        `[NFT Staking] Setting approval for ${operatorAddress} to handle tokens`,
      );

      try {
        setIsLoading(true);
        setError(null);

        if (!magic_denergy) {
          console.error('[NFT Staking] Magic SDK not available');
          throw new Error('Magic SDK not available');
        }

        await setActiveNetwork('denergy');
        console.log('[NFT Staking] Network set to denergy for approval');

        // Get Magic provider for signing transactions
        const magicProvider = new BrowserProvider(magic_denergy.rpcProvider);
        const signer = await magicProvider.getSigner();

        // Create contract instance for the ERC1155 token
        const tokenContract = new Contract(
          erc1155Contract,
          ERC1155_ABI,
          signer,
        );

        // Set approval
        console.log(
          '[NFT Staking] Submitting setApprovalForAll transaction...',
        );
        const tx = await tokenContract.setApprovalForAll(operatorAddress, true);
        console.log(`[NFT Staking] Approval transaction submitted: ${tx.hash}`);

        // Wait for transaction to be mined
        console.log(
          '[NFT Staking] Waiting for approval transaction confirmation...',
        );
        const receipt = await tx.wait();
        console.log(
          `[NFT Staking] Approval transaction confirmed in block: ${receipt?.blockNumber}`,
        );

        setIsApproved(true);
        return true;
      } catch (err: any) {
        console.error(
          `[NFT Staking] Error setting approval: ${
            err.message || 'Unknown error'
          }`,
        );
        setError(err.message || 'Failed to approve staking contract');
        return false;
      } finally {
        setIsLoading(false);
      }
    },
    [magic_denergy, setActiveNetwork],
  );

  /**
   * Delegate ERC1155 tokens to a validator
   * @param erc1155Contract - Address of the ERC1155 contract
   * @param tokenId - ID of the token
   * @param amount - Amount to delegate
   * @param onSuccess - Optional callback for successful transaction
   */
  const delegateERC1155 = useCallback(
    async (
      erc1155Contract: string,
      tokenId: string,
      amount: string,
      onSuccess?: SuccessCallback,
    ): Promise<TransactionReceipt | undefined> => {
      console.log(
        `[NFT Staking] Starting delegate process for token ${tokenId}`,
      );
      console.log(
        `[NFT Staking] Contract: ${erc1155Contract}, Amount: ${amount}`,
      );
      console.log(
        `[NFT Staking] Using validator address: ${VALIDATOR_ADDRESS}`,
      );

      await setActiveNetwork('denergy');
      console.log('[NFT Staking] Network set to denergy');

      try {
        if (!magic_denergy) {
          console.error('[NFT Staking] Magic SDK not available');
          throw new Error('Magic SDK not available');
        }

        setIsLoading(true);
        setError(null);
        console.log('[NFT Staking] Initializing provider and signer');

        // Get Magic provider for signing transactions
        const magicProvider = new BrowserProvider(magic_denergy.rpcProvider);
        const signer = await magicProvider.getSigner();
        const delegatorAddress = await signer.getAddress();
        console.log(`[NFT Staking] Delegator address: ${delegatorAddress}`);

        // Check if staking contract is approved to handle user's tokens
        console.log('[NFT Staking] Checking if staking contract is approved');
        const isApproved = await checkApproval(
          erc1155Contract,
          delegatorAddress,
          STAKING_CONTRACT_ADDRESS,
        );

        // If not approved, set approval
        if (!isApproved) {
          console.log(
            '[NFT Staking] Staking contract not approved, requesting approval',
          );
          const approvalSuccess = await setApproval(
            erc1155Contract,
            STAKING_CONTRACT_ADDRESS,
          );

          if (!approvalSuccess) {
            console.error('[NFT Staking] Failed to approve staking contract');
            throw new Error('Failed to approve staking contract');
          }

          console.log('[NFT Staking] Successfully approved staking contract');
        } else {
          console.log('[NFT Staking] Staking contract already approved');
        }

        // Initialize staking contract
        console.log(
          `[NFT Staking] Initializing staking contract at ${STAKING_CONTRACT_ADDRESS}`,
        );
        const stakingContract = new Contract(
          STAKING_CONTRACT_ADDRESS,
          STAKING_CONTRACT_ABI,
          signer,
        );

        // Convert values to proper format
        const amountInWei = parseUnits(amount, 6); // Adjust decimals as needed
        console.log('🚀 ~ useNFTStaking ~ amountInWei:', amountInWei);
        const tokenIdBigInt = BigInt(tokenId);
        console.log(`[NFT Staking] Amount in Wei: ${amountInWei.toString()}`);

        // Call the delegateERC1155 function
        console.log('[NFT Staking] Submitting delegate transaction...');
        const tx = await stakingContract.delegateERC1155(
          erc1155Contract,
          delegatorAddress,
          VALIDATOR_ADDRESS, // Use the imported validator address
          tokenIdBigInt,
          amountInWei,
          {gasLimit: 9000000},
        );
        console.log(`[NFT Staking] Transaction submitted: ${tx.hash}`);

        // Wait for the transaction to be mined
        console.log('[NFT Staking] Waiting for transaction confirmation...');
        const receipt = await tx.wait();
        console.log(
          `[NFT Staking] Transaction confirmed in block: ${receipt?.blockNumber}`,
        );

        // Refresh balances if needed
        console.log('[NFT Staking] Refreshing NFT balance');
        refreshBalance('NFT');

        // Call success callback if provided
        if (onSuccess && typeof onSuccess === 'function' && receipt) {
          console.log('[NFT Staking] Preparing success callback data');
          const successData: StakingSuccess = {
            txHash: receipt.hash,
            userAddress: delegatorAddress,
            validatorAddress: VALIDATOR_ADDRESS,
            erc1155Contract: erc1155Contract,
            tokenId: tokenId,
            amount: amount,
          };

          console.log('[NFT Staking] Calling success callback');
          onSuccess(successData);
        }

        console.log('[NFT Staking] Delegation completed successfully');
        return receipt;
      } catch (err: any) {
        console.error(
          `[NFT Staking] Delegate error: ${err.message || 'Unknown error'}`,
        );
        console.error(err);
        setError(err.message || 'Delegate transaction failed');
        throw err;
      } finally {
        setIsLoading(false);
        console.log('[NFT Staking] Delegate process finished');
      }
    },
    [
      magic_denergy,
      userDetails,
      refreshBalance,
      setActiveNetwork,
      checkApproval,
      setApproval,
    ],
  );

  /**
   * Undelegate ERC1155 tokens from a validator
   * @param erc1155Contract - Address of the ERC1155 contract
   * @param tokenId - ID of the token
   * @param amount - Amount to undelegate
   * @param onSuccess - Optional callback for successful transaction
   */
  const undelegateERC1155 = useCallback(
    async (
      erc1155Contract: string,
      tokenId: string,
      amount: string,
      onSuccess?: SuccessCallback,
    ): Promise<
      {receipt: TransactionReceipt; completionTime: string} | undefined
    > => {
      console.log(
        `[NFT Staking] Starting undelegate process for token ${tokenId}`,
      );
      console.log(
        `[NFT Staking] Contract: ${erc1155Contract}, Amount: ${amount}`,
      );
      console.log(
        `[NFT Staking] Using validator address: ${VALIDATOR_ADDRESS}`,
      );

      await setActiveNetwork('denergy');
      console.log('[NFT Staking] Network set to denergy');

      try {
        if (!magic_denergy) {
          console.error('[NFT Staking] Magic SDK not available');
          throw new Error('Magic SDK not available');
        }

        setIsLoading(true);
        setError(null);
        console.log('[NFT Staking] Initializing provider and signer');

        // Get Magic provider for signing transactions
        const magicProvider = new BrowserProvider(magic_denergy.rpcProvider);
        const signer = await magicProvider.getSigner();
        const delegatorAddress = await signer.getAddress();
        console.log(`[NFT Staking] Delegator address: ${delegatorAddress}`);

        // Initialize staking contract
        console.log(
          `[NFT Staking] Initializing staking contract at ${STAKING_CONTRACT_ADDRESS}`,
        );
        const stakingContract = new Contract(
          STAKING_CONTRACT_ADDRESS,
          STAKING_CONTRACT_ABI,
          signer,
        );

        // Convert values to proper format
        const amountInWei = parseUnits(amount, 18); // Adjust decimals as needed
        const tokenIdBigInt = BigInt(tokenId);
        console.log(`[NFT Staking] Amount in Wei: ${amountInWei.toString()}`);

        // Call the undelegateERC1155 function
        console.log('[NFT Staking] Submitting undelegate transaction...');
        const tx = await stakingContract.undelegateERC1155(
          erc1155Contract,
          delegatorAddress,
          VALIDATOR_ADDRESS, // Use the imported validator address
          tokenIdBigInt,
          amountInWei,
        );
        console.log(`[NFT Staking] Transaction submitted: ${tx.hash}`);

        // Wait for the transaction to be mined
        console.log('[NFT Staking] Waiting for transaction confirmation...');
        const receipt = await tx.wait();
        console.log(
          `[NFT Staking] Transaction confirmed in block: ${receipt?.blockNumber}`,
        );

        // Get the completion time from the result
        let completionTime = '';
        try {
          console.log('[NFT Staking] Retrieving completion time');
          const result = await tx;
          completionTime = result.toString();
          console.log(`[NFT Staking] Completion time: ${completionTime}`);
        } catch (err) {
          console.error('[NFT Staking] Failed to get completion time', err);
        }

        // Refresh balances if needed
        console.log('[NFT Staking] Refreshing NFT balance');
        refreshBalance('NFT');

        // Call success callback if provided
        if (onSuccess && typeof onSuccess === 'function' && receipt) {
          console.log('[NFT Staking] Preparing success callback data');
          const successData: StakingSuccess = {
            txHash: receipt.hash,
            userAddress: delegatorAddress,
            validatorAddress: VALIDATOR_ADDRESS,
            erc1155Contract: erc1155Contract,
            tokenId: tokenId,
            amount: amount,
          };

          console.log('[NFT Staking] Calling success callback');
          onSuccess(successData);
        }

        console.log('[NFT Staking] Undelegation completed successfully');
        return {
          receipt,
          completionTime,
        };
      } catch (err: any) {
        console.error(
          `[NFT Staking] Undelegate error: ${err.message || 'Unknown error'}`,
        );
        console.error(err);
        setError(err.message || 'Undelegate transaction failed');
        throw err;
      } finally {
        setIsLoading(false);
        console.log('[NFT Staking] Undelegate process finished');
      }
    },
    [magic_denergy, userDetails, refreshBalance, setActiveNetwork],
  );

  /**
   * Listen for staking-related events
   * @param onDelegate - Callback for DelegateNFT events
   * @param onUnbond - Callback for UnbondNFT events
   * @returns A cleanup function to remove all listeners
   */
  const listenForEvents = useCallback(
    (onDelegate?: DelegateCallback, onUnbond?: UnbondCallback) => {
      if (!magic_denergy) {
        console.error(
          '[NFT Staking] Magic SDK not available for event listeners',
        );
        setError('Magic SDK not available');
        return () => {};
      }

      console.log('[NFT Staking] Setting up event listeners');

      const setupListeners = async () => {
        try {
          console.log(
            '[NFT Staking] Initializing provider for event listeners',
          );
          const magicProvider = new BrowserProvider(magic_denergy.rpcProvider);
          const stakingContract = new Contract(
            STAKING_CONTRACT_ADDRESS,
            STAKING_CONTRACT_ABI,
            magicProvider,
          );

          // Clean up any existing listeners first
          console.log('[NFT Staking] Removing any existing listeners');
          stakingContract.removeAllListeners();

          // Set up DelegateNFT event listener
          if (onDelegate) {
            console.log('[NFT Staking] Setting up DelegateNFT event listener');
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
                console.log(
                  `[NFT Staking] DelegateNFT event detected: ${event.transactionHash}`,
                );
                console.log(
                  `[NFT Staking] Delegator: ${delegatorAddress}, Validator: ${validatorAddress}`,
                );
                console.log(
                  `[NFT Staking] TokenId: ${tokenId}, Amount: ${formatUnits(
                    amount,
                    18,
                  )}`,
                );

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
            console.log('[NFT Staking] Setting up UnbondNFT event listener');
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
                console.log(
                  `[NFT Staking] UnbondNFT event detected: ${event.transactionHash}`,
                );
                console.log(
                  `[NFT Staking] Delegator: ${delegatorAddress}, Validator: ${validatorAddress}`,
                );
                console.log(
                  `[NFT Staking] TokenId: ${tokenId}, Amount: ${formatUnits(
                    amount,
                    18,
                  )}`,
                );
                console.log(
                  `[NFT Staking] Completion Time: ${completionTime.toString()}`,
                );

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

          console.log('[NFT Staking] Event listeners successfully set up');
        } catch (err) {
          console.error('[NFT Staking] Failed to set up event listeners:', err);
          setError('Failed to set up event listeners');
        }
      };

      setupListeners();

      // Return cleanup function
      return () => {
        console.log('[NFT Staking] Cleaning up event listeners');
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
            console.log('[NFT Staking] All event listeners removed');
          } catch (err) {
            console.error(
              '[NFT Staking] Failed to remove event listeners:',
              err,
            );
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
            console.log('[NFT Staking] Cleaning up event listeners on unmount');
            const magicProvider = new BrowserProvider(
              magic_denergy.rpcProvider,
            );
            const stakingContract = new Contract(
              STAKING_CONTRACT_ADDRESS,
              STAKING_CONTRACT_ABI,
              magicProvider,
            );
            stakingContract.removeAllListeners();
            console.log('[NFT Staking] All event listeners removed on unmount');
          } catch (err) {
            console.error(
              '[NFT Staking] Failed to remove event listeners on unmount:',
              err,
            );
          }
        }
      };
      cleanup();
    };
  }, [magic_denergy]);

  console.log(
    '[NFT Staking] Hook initialized with validator:',
    VALIDATOR_ADDRESS,
  );

  return {
    isLoading,
    error,
    isApproved,
    checkApproval,
    setApproval,
    delegateERC1155,
    undelegateERC1155,
    listenForEvents,
  };
};
