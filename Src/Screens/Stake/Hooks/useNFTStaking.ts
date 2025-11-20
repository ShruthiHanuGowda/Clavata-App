import {useState, useCallback, useEffect} from 'react';
import {
  BrowserProvider,
  Contract,
  TransactionReceipt,
  parseUnits,
  formatUnits,
} from 'ethers';
import {useMagic} from '../../../providers';
import {useAuth} from '../../../providers';
import {useWallet} from '../../../providers';
import {STAKING_CONTRACT_ABI, ERC1155_ABI} from '../../../utils/Contracts';
import {STAKING_ADDRESS} from '../../../constants';

// Contract address for the staking contract
const STAKING_CONTRACT_ADDRESS = STAKING_ADDRESS;

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
 * @param validatorAddress - Dynamic validator address to use for staking operations
 * @returns Staking state and functions
 */
export const useNFTStaking = (validatorAddress?: string) => {
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [isApproved, setIsApproved] = useState<boolean>(false);

  const {magic, setActiveNetwork} = useMagic();

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
      try {
        if (!magic) {
          console.error('[NFT Staking] Magic SDK not available');
          throw new Error('Magic SDK not available');
        }

        // Get Magic provider
        const magicProvider = new BrowserProvider(magic.rpcProvider as any);

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
    [magic],
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
      try {
        setIsLoading(true);
        setError(null);
``
        const magicInstance = await setActiveNetwork('denergy');

        const magicProvider = new BrowserProvider(
          magicInstance.rpcProvider as any,
        );
        const signer = await magicProvider.getSigner();

        const tokenContract = new Contract(
          erc1155Contract,
          ERC1155_ABI,
          signer,
        );

        const tx = await tokenContract.setApprovalForAll(operatorAddress, true);

        await tx.wait();

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
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [magic, setActiveNetwork],
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
      // Validate that validator address is provided
      if (!validatorAddress) {
        const errorMsg = 'Validator address is required for staking';
        console.error(`[NFT Staking] ${errorMsg}`);
        setError(errorMsg);
        throw new Error(errorMsg);
      }

      const magicInstance = await setActiveNetwork('denergy');

      try {
        if (!magicInstance) {
          console.error('[NFT Staking] Magic SDK not available');
          throw new Error('Magic SDK not available');
        }

        setIsLoading(true);
        setError(null);

        const magicProvider = new BrowserProvider(
          magicInstance.rpcProvider as any,
        );
        const signer = await magicProvider.getSigner();
        const delegatorAddress = await signer.getAddress();

        const approvalStatus = await checkApproval(
          erc1155Contract,
          delegatorAddress,
          STAKING_CONTRACT_ADDRESS,
        );

        // If not approved, set approval
        if (!approvalStatus) {
          const approvalSuccess = await setApproval(
            erc1155Contract,
            STAKING_CONTRACT_ADDRESS,
          );

          if (!approvalSuccess) {
            console.error('[NFT Staking] Failed to approve staking contract');
            // throw new Error('Failed to approve staking contract');
          }
        } else {
          console.error('[NFT Staking] Staking contract already approved');
        }

        const stakingContract = new Contract(
          STAKING_CONTRACT_ADDRESS,
          STAKING_CONTRACT_ABI,
          signer,
        );

        // Convert values to proper format
        const amountInWei = parseUnits(amount, 6); // Adjust decimals as needed

        const tokenIdBigInt = BigInt(tokenId);
        console.log('tokenIdBigInt', {
          erc1155Contract,
          delegatorAddress,
          validatorAddress,
          tokenIdBigInt,
          amountInWei,
        });

        const tx = await stakingContract.delegateERC1155(
          erc1155Contract,
          delegatorAddress,
          validatorAddress,
          tokenIdBigInt,
          amountInWei,
          {gasLimit: 15000000},
        );

        const receipt = await tx.wait();

        if (onSuccess && typeof onSuccess === 'function' && receipt) {
          const successData: StakingSuccess = {
            txHash: receipt.hash,
            userAddress: delegatorAddress,
            validatorAddress: validatorAddress,
            erc1155Contract: erc1155Contract,
            tokenId: tokenId,
            amount: amount,
          };

          onSuccess(successData);
        }

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
        console.error('[NFT Staking] Delegate process finished');
      }
    },
    [setActiveNetwork, checkApproval, setApproval, validatorAddress],
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
      // Validate that validator address is provided
      if (!validatorAddress) {
        const errorMsg = 'Validator address is required for unstaking';
        console.error(`[NFT Staking] ${errorMsg}`);
        setError(errorMsg);
        throw new Error(errorMsg);
      }

      await setActiveNetwork('denergy');

      try {
        if (!magic) {
          console.error('[NFT Staking] Magic SDK not available');
          throw new Error('Magic SDK not available');
        }

        setIsLoading(true);
        setError(null);

        // Get Magic provider for signing transactions
        const magicProvider = new BrowserProvider(magic.rpcProvider as any);
        const signer = await magicProvider.getSigner();
        const delegatorAddress = await signer.getAddress();

        const stakingContract = new Contract(
          STAKING_CONTRACT_ADDRESS,
          STAKING_CONTRACT_ABI,
          signer,
        );

        // Convert values to proper format
        const amountInWei = parseUnits(amount, 6); // Adjust decimals as needed
        const tokenIdBigInt = BigInt(tokenId);

        const tx = await stakingContract.undelegateERC1155(
          erc1155Contract,
          delegatorAddress,
          validatorAddress, // Use the dynamic validator address
          tokenIdBigInt,
          amountInWei,
          {gasLimit: 9000000},
        );

        const receipt = await tx.wait();

        let completionTime = '';
        try {
          const result = await tx;
          completionTime = result.toString();
        } catch (err) {
          console.error('[NFT Staking] Failed to get completion time', err);
        }

        if (onSuccess && typeof onSuccess === 'function' && receipt) {
          const successData: StakingSuccess = {
            txHash: receipt.hash,
            userAddress: delegatorAddress,
            validatorAddress: validatorAddress,
            erc1155Contract: erc1155Contract,
            tokenId: tokenId,
            amount: amount,
          };

          onSuccess(successData);
        }

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
      }
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [magic, userDetails, refreshBalance, setActiveNetwork, validatorAddress],
  );

  /**
   * Listen for staking-related events
   * @param onDelegate - Callback for DelegateNFT events
   * @param onUnbond - Callback for UnbondNFT events
   * @returns A cleanup function to remove all listeners
   */
  const listenForEvents = useCallback(
    (onDelegate?: DelegateCallback, onUnbond?: UnbondCallback) => {
      if (!magic) {
        console.error(
          '[NFT Staking] Magic SDK not available for event listeners',
        );
        setError('Magic SDK not available');
        return () => {};
      }

      const setupListeners = async () => {
        try {
          const magicProvider = new BrowserProvider(magic.rpcProvider as any);
          const stakingContract = new Contract(
            STAKING_CONTRACT_ADDRESS,
            STAKING_CONTRACT_ABI,
            magicProvider,
          );

          stakingContract.removeAllListeners();

          if (onDelegate) {
            const delegateFilter = stakingContract.filters.DelegateNFT();
            stakingContract.on(
              delegateFilter,
              (
                delegatorAddress,
                validatorAddr,
                nftContractAddress,
                tokenId,
                amount,
                newShares,
                event,
              ) => {
                onDelegate({
                  delegatorAddress,
                  validatorAddress: validatorAddress || '',
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
                validatorAddr,
                nftContractAddress,
                tokenId,
                amount,
                completionTime,
                event,
              ) => {
                onUnbond({
                  delegatorAddress,
                  validatorAddress: validatorAddress || '',
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
          console.error('[NFT Staking] Failed to set up event listeners:', err);
          setError('Failed to set up event listeners');
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
              STAKING_CONTRACT_ABI,
              magicProvider,
            );
            stakingContract.removeAllListeners();
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
    [magic, validatorAddress],
  );

  useEffect(() => {
    return () => {
      const cleanup = async () => {
        if (magic) {
          try {
            const magicProvider = new BrowserProvider(magic.rpcProvider as any);
            const stakingContract = new Contract(
              STAKING_CONTRACT_ADDRESS,
              STAKING_CONTRACT_ABI,
              magicProvider,
            );
            stakingContract.removeAllListeners();
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
  }, [magic]);

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
