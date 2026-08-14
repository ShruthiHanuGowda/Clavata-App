import { useState, useCallback, useMemo } from 'react';
import {
  BrowserProvider,
  Contract,
  TransactionReceipt,
  parseUnits,
  formatUnits,
} from 'ethers';
import { useMagic } from '../providers';
import { useAuth } from '../providers';
import {
  USDC_ADDRESS,
  BRIDGE_ADDRESS,
  EURC_ADDRESS,
  DENERGY_USDC_ADDRESS,
  DESTINATION_ADDRESS,
  DENERGY_EURC_ADDRESS,
  BANK_ADDRESS,
} from '../constants/constants';
import { useWallet } from '../providers';
import { ERC20_ABI, BRIDGE_ABI, DEPOSIT_TOKEN_ABI } from '../utils/Contracts';

interface BridgeSuccess {
  txHash: string;
  amount: string;
  userAddress: string;
  sourceChain: string;
  coinCode: string;
}

type SuccessCallback = (result: BridgeSuccess) => void;

export const useBridge = () => {
  const { refreshBalance } = useWallet();
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  // New states for loading screen
  const [currentProcessingStep, setCurrentProcessingStep] = useState('');
  const [stepProgress, setStepProgress] = useState(0);
  const [bridgeSuccess, setBridgeSuccess] = useState(false);
  const [transactionHash, setTransactionHash] = useState<string>('');

  // Get magic instance from the provider
  const { setActiveNetwork } = useMagic();

  // Get user details from auth provider
  const { userDetails } = useAuth();

  // Processing steps for different bridge operations
  const BRIDGE_PROCESSING_STEPS = useMemo(
    () => ({
      DEPOSIT: {
        INITIALIZING: { text: 'Initializing deposit process...', progress: 5 },
        SWITCHING_NETWORK: {
          text: 'Switching to Ethereum network...',
          progress: 15,
        },
        CHECKING_BALANCE: { text: 'Checking token balance...', progress: 25 },
        APPROVING_TOKEN: { text: 'Approving token spend...', progress: 45 },
        WAITING_APPROVAL: {
          text: 'Waiting for approval confirmation...',
          progress: 60,
        },
        DEPOSITING: { text: 'Depositing tokens to bridge...', progress: 75 },
        WAITING_DEPOSIT: {
          text: 'Waiting for deposit confirmation...',
          progress: 90,
        },
        COMPLETED: {
          text: 'Bridge deposit completed successfully!',
          progress: 100,
        },
      },
      WITHDRAW: {
        INITIALIZING: { text: 'Initializing withdrawal process...', progress: 5 },
        SWITCHING_NETWORK: {
          text: 'Switching to DENERGY network...',
          progress: 15,
        },
        CHECKING_BALANCE: {
          text: 'Checking wrapped token balance...',
          progress: 25,
        },
        APPROVING_TOKEN: {
          text: 'Approving wrapped token spend...',
          progress: 45,
        },
        WAITING_APPROVAL: {
          text: 'Waiting for approval confirmation...',
          progress: 60,
        },
        BURNING: { text: 'Burning wrapped tokens...', progress: 75 },
        WAITING_BURN: { text: 'Waiting for burn confirmation...', progress: 90 },
        COMPLETED: {
          text: 'Bridge withdrawal completed successfully!',
          progress: 100,
        },
      },
    }),
    [],
  );

  const updateProcessingStep = useCallback(
    (operationType: 'DEPOSIT' | 'WITHDRAW', stepKey: string) => {
      const step = (BRIDGE_PROCESSING_STEPS[operationType] as any)[stepKey];
      if (step) {
        setCurrentProcessingStep(step.text);
        setStepProgress(step.progress);
      }
    },
    [BRIDGE_PROCESSING_STEPS],
  );

  const resetBridgeState = () => {
    setCurrentProcessingStep('');
    setStepProgress(0);
    setBridgeSuccess(false);
    setTransactionHash('');
    setError(null);
  };

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
      try {
        const magic = setActiveNetwork('sepolia');
        if (!magic) {
          throw new Error('Magic SDK not available');
        }

        setIsLoading(true);
        setError(null);
        resetBridgeState();

        updateProcessingStep('DEPOSIT', 'INITIALIZING');

        updateProcessingStep('DEPOSIT', 'SWITCHING_NETWORK');
        // await setActiveNetwork('sepolia');

        const usdcAddress = USDC_ADDRESS;
        const bankAddress = BANK_ADDRESS;
        const bridgeAddress = BRIDGE_ADDRESS;

        // Get Magic provider for signing transactions
        const magicProvider = new BrowserProvider(magic.rpcProvider as any);
        const signer = await magicProvider.getSigner();

        // Initialize contracts
        const usdcContract = new Contract(usdcAddress, ERC20_ABI, signer);
        const bridgeContract = new Contract(bridgeAddress, BRIDGE_ABI, signer);

        updateProcessingStep('DEPOSIT', 'CHECKING_BALANCE');
        try {
          const balance = await usdcContract.balanceOf(
            await signer.getAddress(),
          );
          const amountWei = parseUnits(amount, 6);
          if (balance < amountWei) {
            throw new Error('Insufficient balance');
          }
        } catch (err) { }

        // Check if token is whitelisted
        console.log('Checking if token is whitelisted...');
        const isWhitelisted = await bridgeContract.isTokenWhitelisted(
          usdcAddress,
        );
        console.log('Token whitelisted:', isWhitelisted);
        if (!isWhitelisted) {
          throw new Error('USDC is not whitelisted on the bridge');
        }

        const amountWei = parseUnits(amount, 6);
        console.log('Amount in wei:', amountWei.toString());

        // Calculate fee
        console.log('Calculating fee...');
        const fee = await bridgeContract.calculateFee(amountWei);
        console.log(`Bridge fee: ${formatUnits(fee, 6)} USDC`);

        // Check and approve if needed
        console.log('Checking allowance...');
        const currentAllowance = await usdcContract.allowance(
          await signer.getAddress(),
          bridgeAddress,
        );
        console.log('Current allowance:', formatUnits(currentAllowance, 6));

        if (currentAllowance < amountWei) {
          // Approve bank to spend USDC
          updateProcessingStep('DEPOSIT', 'APPROVING_TOKEN');
          console.log('Approving token transfer...');
          const approveTx = await usdcContract.approve(
            bridgeAddress,
            amountWei,
          );

          updateProcessingStep('DEPOSIT', 'WAITING_APPROVAL');
          const approveReceipt = await approveTx.wait();
          console.log(
            'Approval confirmed in block:',
            approveReceipt.blockNumber,
          );
        } else {
          console.log('Sufficient allowance already exists');
        }

        // Deposit USDC to bridge
        updateProcessingStep('DEPOSIT', 'DEPOSITING');
        console.log('Calling depositERC20...');
        const depositTx = await bridgeContract.depositERC20(
          usdcAddress,
          amountWei,
        );
        console.log('Deposit tx hash:', depositTx.hash);

        updateProcessingStep('DEPOSIT', 'WAITING_DEPOSIT');
        const receipt = await depositTx.wait();
        console.log('Deposit confirmed in block:', receipt.blockNumber);
        console.log('Gas used:', receipt.gasUsed.toString());
        setTransactionHash(receipt.hash);

        // Extract depositNonce from event
        console.log('Parsing transaction logs...');
        const depositEvent = receipt.logs
          .map((log: any) => {
            try {
              return bridgeContract.interface.parseLog(log);
            } catch {
              return null;
            }
          })
          .find((event: any) => event?.name === 'TokenDeposited');

        if (depositEvent) {
          const depositNonce = Number(depositEvent.args.depositNonce);
          console.log('✓ Deposit nonce:', depositNonce);
          console.log('✓ Token:', depositEvent.args.token);
          console.log('✓ User:', depositEvent.args.user);
          console.log('✓ Amount:', formatUnits(depositEvent.args.amount, 6));
          console.log('✓ Fee:', formatUnits(depositEvent.args.fee, 6));
          console.log(
            '✓ Destination Chain ID:',
            depositEvent.args.destinationChainId.toString(),
          );
        } else {
          console.warn('TokenDeposited event not found in transaction logs');
        }

        // Get user address from Auth provider
        const userAddress = userDetails?.userWallet || '';

        refreshBalance('USDC');

        updateProcessingStep('DEPOSIT', 'COMPLETED');
        setBridgeSuccess(true);

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
    [userDetails, refreshBalance, setActiveNetwork, updateProcessingStep],
  );

  const bridgeEURC = useCallback(
    async (
      amount: string,
      onSuccess?: SuccessCallback,
    ): Promise<TransactionReceipt | undefined> => {
      try {
        const magic = setActiveNetwork('sepolia');
        if (!magic) {
          throw new Error('Magic SDK not available');
        }

        setIsLoading(true);
        setError(null);
        resetBridgeState();

        updateProcessingStep('DEPOSIT', 'INITIALIZING');

        updateProcessingStep('DEPOSIT', 'SWITCHING_NETWORK');
        // await setActiveNetwork('sepolia');

        const eurcAddress = EURC_ADDRESS;
        const bankAddress = BANK_ADDRESS;
        const bridgeAddress = BRIDGE_ADDRESS;

        // Get Magic provider for signing transactions
        const magicProvider = new BrowserProvider(magic.rpcProvider as any);
        const signer = await magicProvider.getSigner();

        // Initialize contracts
        const eurcContract = new Contract(eurcAddress, ERC20_ABI, signer);
        const bridgeContract = new Contract(bridgeAddress, BRIDGE_ABI, signer);

        // Check EURC balance before proceeding
        updateProcessingStep('DEPOSIT', 'CHECKING_BALANCE');
        try {
          const balance = await eurcContract.balanceOf(
            await signer.getAddress(),
          );
          const amountWei = parseUnits(amount, 6);
          if (balance < amountWei) {
            throw new Error('Insufficient balance');
          }
        } catch (err) {
          // Balance check failed, continue anyway
        }

        // Check if token is whitelisted
        console.log('Checking if token is whitelisted...');
        const isWhitelisted = await bridgeContract.isTokenWhitelisted(
          eurcAddress,
        );
        console.log('Token whitelisted:', isWhitelisted);
        if (!isWhitelisted) {
          throw new Error('EURC is not whitelisted on the bridge');
        }

        const amountWei = parseUnits(amount, 6);
        console.log('Amount in wei:', amountWei.toString());

        // Calculate fee
        console.log('Calculating fee...');
        const fee = await bridgeContract.calculateFee(amountWei);
        console.log(`Bridge fee: ${formatUnits(fee, 6)} EURC`);

        // Check and approve if needed
        console.log('Checking allowance...');
        const currentAllowance = await eurcContract.allowance(
          await signer.getAddress(),
          bridgeAddress,
        );
        console.log('Current allowance:', formatUnits(currentAllowance, 6));

        if (currentAllowance < amountWei) {
          // Approve bank to spend EURC
          updateProcessingStep('DEPOSIT', 'APPROVING_TOKEN');
          console.log('Approving token transfer...');
          const approveTx = await eurcContract.approve(
            bridgeAddress,
            amountWei,
          );

          updateProcessingStep('DEPOSIT', 'WAITING_APPROVAL');
          const approveReceipt = await approveTx.wait();
          console.log(
            'Approval confirmed in block:',
            approveReceipt.blockNumber,
          );
        } else {
          console.log('Sufficient allowance already exists');
        }

        // Deposit EURC to bridge
        updateProcessingStep('DEPOSIT', 'DEPOSITING');
        console.log('Calling depositERC20...');
        const depositTx = await bridgeContract.depositERC20(
          eurcAddress,
          amountWei,
        );
        console.log('Deposit tx hash:', depositTx.hash);

        updateProcessingStep('DEPOSIT', 'WAITING_DEPOSIT');
        const receipt = await depositTx.wait();
        console.log('Deposit confirmed in block:', receipt.blockNumber);
        console.log('Gas used:', receipt.gasUsed.toString());
        setTransactionHash(receipt.hash);

        // Extract depositNonce from event
        console.log('Parsing transaction logs...');
        const depositEvent = receipt.logs
          .map((log: any) => {
            try {
              return bridgeContract.interface.parseLog(log);
            } catch {
              return null;
            }
          })
          .find((event: any) => event?.name === 'TokenDeposited');

        if (depositEvent) {
          const depositNonce = Number(depositEvent.args.depositNonce);
          console.log('✓ Deposit nonce:', depositNonce);
          console.log('✓ Token:', depositEvent.args.token);
          console.log('✓ User:', depositEvent.args.user);
          console.log('✓ Amount:', formatUnits(depositEvent.args.amount, 6));
          console.log('✓ Fee:', formatUnits(depositEvent.args.fee, 6));
          console.log(
            '✓ Destination Chain ID:',
            depositEvent.args.destinationChainId.toString(),
          );
        } else {
          console.warn('TokenDeposited event not found in transaction logs');
        }

        // Get user address from Auth provider
        const userAddress = userDetails?.userWallet || '';

        refreshBalance('EURC');

        updateProcessingStep('DEPOSIT', 'COMPLETED');
        setBridgeSuccess(true);

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
    [userDetails, refreshBalance, setActiveNetwork, updateProcessingStep],
  );

  const bridgeWUSDC = useCallback(
    async (
      amount: string,
      onSuccess?: SuccessCallback,
    ): Promise<TransactionReceipt | undefined> => {
      try {
        const magic = setActiveNetwork('denergy');
        if (!magic) {
          throw new Error('Magic SDK not available');
        }

        setIsLoading(true);
        setError(null);
        resetBridgeState();

        updateProcessingStep('WITHDRAW', 'INITIALIZING');

        updateProcessingStep('WITHDRAW', 'SWITCHING_NETWORK');
        // await setActiveNetwork('denergy');

        const wusdcAddress = DENERGY_USDC_ADDRESS;
        // USDC_ADDRESS; // Referenced for completeness
        const destinationAddress = DESTINATION_ADDRESS;

        // Get Magic provider for signing transactions
        const magicProvider = new BrowserProvider(magic.rpcProvider as any);
        const signer = await magicProvider.getSigner();

        // Initialize contracts
        const wusdcContract = new Contract(wusdcAddress, ERC20_ABI, signer);
        const destinationContract = new Contract(
          destinationAddress,
          DEPOSIT_TOKEN_ABI,
          signer,
        );

        // Check WUSDC balance before proceeding
        updateProcessingStep('WITHDRAW', 'CHECKING_BALANCE');
        try {
          const balance = await wusdcContract.balanceOf(
            await signer.getAddress(),
          );
          const amountWei = parseUnits(amount, 6);
          if (balance < amountWei) {
            throw new Error('Insufficient balance');
          }
        } catch (err) {
          // Balance check failed, continue anyway
        }

        const amountWei = parseUnits(amount, 6);
        console.log('Amount in wei:', amountWei.toString());

        // Check and approve if needed
        console.log('Checking allowance...');
        const currentAllowance = await wusdcContract.allowance(
          await signer.getAddress(),
          destinationAddress,
        );
        console.log('Current allowance:', formatUnits(currentAllowance, 6));

        if (currentAllowance < amountWei) {
          // Approve USDC to spend WUSDC
          updateProcessingStep('WITHDRAW', 'APPROVING_TOKEN');
          console.log('Approving token burn...');
          const approveTx = await wusdcContract.approve(
            destinationAddress,
            amountWei,
          );

          updateProcessingStep('WITHDRAW', 'WAITING_APPROVAL');
          const approveReceipt = await approveTx.wait();
          console.log(
            'Approval confirmed in block:',
            approveReceipt.blockNumber,
          );
        } else {
          console.log('Sufficient allowance already exists');
        }

        // Burn wrapped tokens
        updateProcessingStep('WITHDRAW', 'BURNING');
        console.log('Calling burn...');
        const burnTx = await destinationContract.burn(wusdcAddress, amountWei);
        console.log('Burn tx hash:', burnTx.hash);

        updateProcessingStep('WITHDRAW', 'WAITING_BURN');
        const receipt = await burnTx.wait();
        console.log('Burn confirmed in block:', receipt.blockNumber);
        console.log('Gas used:', receipt.gasUsed.toString());
        setTransactionHash(receipt.hash);

        // Extract burn nonce from event
        console.log('Parsing transaction logs...');
        const transferEvent = receipt.logs
          .map((log: any) => {
            try {
              return destinationContract.interface.parseLog(log);
            } catch {
              return null;
            }
          })
          .find(
            (event: any) => event?.name === 'Transfer' && event.args.step === 1,
          );

        if (transferEvent) {
          const burnNonce = Number(transferEvent.args.nonce);
          console.log('✓ Burn nonce:', burnNonce);
          console.log('✓ Token:', transferEvent.args.token);
          console.log('✓ From:', transferEvent.args.from);
          console.log('✓ To:', transferEvent.args.to);
          console.log('✓ Amount:', formatUnits(transferEvent.args.amount, 6));
          console.log('✓ Step:', transferEvent.args.step, '(1 = Burn)');
        } else {
          console.warn('Transfer event (step=1) not found in transaction logs');
        }

        // Get user address from Auth provider
        const userAddress = userDetails?.userWallet || '';

        refreshBalance('WUSDC');

        updateProcessingStep('WITHDRAW', 'COMPLETED');
        setBridgeSuccess(true);

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
    [userDetails, refreshBalance, setActiveNetwork, updateProcessingStep],
  );

  const bridgeWEURC = useCallback(
    async (
      amount: string,
      onSuccess?: SuccessCallback,
    ): Promise<TransactionReceipt | undefined> => {
      try {
        const magic = setActiveNetwork('denergy');
        if (!magic) {
          throw new Error('Magic SDK not available');
        }

        setIsLoading(true);
        setError(null);
        resetBridgeState();

        updateProcessingStep('WITHDRAW', 'INITIALIZING');

        updateProcessingStep('WITHDRAW', 'SWITCHING_NETWORK');
        // await setActiveNetwork('denergy');
        // await setActiveNetwork('denergy');

        const weurcAddress = DENERGY_EURC_ADDRESS;
        // EURC_ADDRESS; // Referenced for completeness
        const destinationAddress = DESTINATION_ADDRESS;

        // Get Magic provider for signing transactions
        const magicProvider = new BrowserProvider(magic.rpcProvider as any);
        const signer = await magicProvider.getSigner();

        // Initialize contracts
        const weurcContract = new Contract(weurcAddress, ERC20_ABI, signer);
        const destinationContract = new Contract(
          destinationAddress,
          DEPOSIT_TOKEN_ABI,
          signer,
        );

        // Check WEURC balance before proceeding
        updateProcessingStep('WITHDRAW', 'CHECKING_BALANCE');
        try {
          const balance = await weurcContract.balanceOf(
            await signer.getAddress(),
          );
          const amountWei = parseUnits(amount, 6);
          if (balance < amountWei) {
            throw new Error('Insufficient balance');
          }
        } catch (err) {
          // Balance check failed, continue anyway
        }

        const amountWei = parseUnits(amount, 6);
        console.log('Amount in wei:', amountWei.toString());

        // Check and approve if needed
        console.log('Checking allowance...');
        const currentAllowance = await weurcContract.allowance(
          await signer.getAddress(),
          destinationAddress,
        );
        console.log('Current allowance:', formatUnits(currentAllowance, 6));

        if (currentAllowance < amountWei) {
          // Approve EURC to spend WEURC
          updateProcessingStep('WITHDRAW', 'APPROVING_TOKEN');
          console.log('Approving token burn...');
          const approveTx = await weurcContract.approve(
            destinationAddress,
            amountWei,
          );

          updateProcessingStep('WITHDRAW', 'WAITING_APPROVAL');
          const approveReceipt = await approveTx.wait();
          console.log(
            'Approval confirmed in block:',
            approveReceipt.blockNumber,
          );
        } else {
          console.log('Sufficient allowance already exists');
        }

        // Burn wrapped tokens
        updateProcessingStep('WITHDRAW', 'BURNING');
        console.log('Calling burn...');
        const burnTx = await destinationContract.burn(weurcAddress, amountWei);
        console.log('Burn tx hash:', burnTx.hash);

        updateProcessingStep('WITHDRAW', 'WAITING_BURN');
        const receipt = await burnTx.wait();
        console.log('Burn confirmed in block:', receipt.blockNumber);
        console.log('Gas used:', receipt.gasUsed.toString());
        setTransactionHash(receipt.hash);

        // Extract burn nonce from event
        console.log('Parsing transaction logs...');
        const transferEvent = receipt.logs
          .map((log: any) => {
            try {
              return destinationContract.interface.parseLog(log);
            } catch {
              return null;
            }
          })
          .find(
            (event: any) => event?.name === 'Transfer' && event.args.step === 1,
          );

        if (transferEvent) {
          const burnNonce = Number(transferEvent.args.nonce);
          console.log('✓ Burn nonce:', burnNonce);
          console.log('✓ Token:', transferEvent.args.token);
          console.log('✓ From:', transferEvent.args.from);
          console.log('✓ To:', transferEvent.args.to);
          console.log('✓ Amount:', formatUnits(transferEvent.args.amount, 6));
          console.log('✓ Step:', transferEvent.args.step, '(1 = Burn)');
        } else {
          console.warn('Transfer event (step=1) not found in transaction logs');
        }

        // Get user address from Auth provider
        const userAddress = userDetails?.userWallet || '';

        refreshBalance('WEURC');

        updateProcessingStep('WITHDRAW', 'COMPLETED');
        setBridgeSuccess(true);

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
    [userDetails, refreshBalance, setActiveNetwork, updateProcessingStep],
  );

  return {
    isLoading,
    error,
    currentProcessingStep,
    stepProgress,
    bridgeSuccess,
    transactionHash,
    bridgeUSDC,
    bridgeEURC,
    bridgeWUSDC,
    bridgeWEURC,
    resetBridgeState,
  };
};
