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

const apiCall = async (transactionDetails: any, endPoint: string) => {
  const apiUrl = `${'https://backend.wattswaps.com'}/bridge_api/${endPoint}`;
  try {
    const response = await fetch(apiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': '93192389131231YYAOIJ',
      },
      body: JSON.stringify(transactionDetails),
    });
    const result = await response.json();
    console.log('result', result);
  } catch (error) {
    console.error('API call failed:', error);
  }
};

export const useBridge = () => {
  const {refreshBalance} = useWallet();
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  // New states for loading screen
  const [currentProcessingStep, setCurrentProcessingStep] = useState('');
  const [stepProgress, setStepProgress] = useState(0);
  const [bridgeSuccess, setBridgeSuccess] = useState(false);
  const [transactionHash, setTransactionHash] = useState<string>('');

  // Get magic instance from the provider
  const {setActiveNetwork, magic: newMagic, activeNetwork} = useMagic();

  // Get user details from auth provider
  const {userDetails} = useAuth();

  // Processing steps for different bridge operations
  const BRIDGE_PROCESSING_STEPS: any = {
    DEPOSIT: {
      INITIALIZING: {text: 'Initializing deposit process...', progress: 5},
      SWITCHING_NETWORK: {
        text: 'Switching to Ethereum network...',
        progress: 15,
      },
      CHECKING_BALANCE: {text: 'Checking token balance...', progress: 25},
      APPROVING_TOKEN: {text: 'Approving token spend...', progress: 40},
      WAITING_APPROVAL: {
        text: 'Waiting for approval confirmation...',
        progress: 55,
      },
      DEPOSITING: {text: 'Depositing tokens to bridge...', progress: 70},
      WAITING_DEPOSIT: {
        text: 'Waiting for deposit confirmation...',
        progress: 85,
      },
      API_CALL: {text: 'Updating bridge records...', progress: 95},
      COMPLETED: {
        text: 'Bridge deposit completed successfully!',
        progress: 100,
      },
    },
    WITHDRAW: {
      INITIALIZING: {text: 'Initializing withdrawal process...', progress: 5},
      SWITCHING_NETWORK: {
        text: 'Switching to DENERGY network...',
        progress: 15,
      },
      CHECKING_BALANCE: {
        text: 'Checking wrapped token balance...',
        progress: 25,
      },
      APPROVING_TOKEN: {text: 'Approving wrapped token spend...', progress: 40},
      WAITING_APPROVAL: {
        text: 'Waiting for approval confirmation...',
        progress: 55,
      },
      BURNING: {text: 'Burning wrapped tokens...', progress: 70},
      WAITING_BURN: {text: 'Waiting for burn confirmation...', progress: 85},
      API_CALL: {text: 'Processing withdrawal records...', progress: 95},
      COMPLETED: {
        text: 'Bridge withdrawal completed successfully!',
        progress: 100,
      },
    },
  };

  const updateProcessingStep = (
    operationType: 'DEPOSIT' | 'WITHDRAW',
    stepKey: string,
  ) => {
    const step = BRIDGE_PROCESSING_STEPS[operationType][stepKey];
    if (step) {
      setCurrentProcessingStep(step.text);
      setStepProgress(step.progress);
    }
  };

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

        console.log('amount', amount);

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

        // Check USDC balance before proceeding
        updateProcessingStep('DEPOSIT', 'CHECKING_BALANCE');
        try {
          const balance = await usdcContract.balanceOf(
            await signer.getAddress(),
          );
        } catch (err) {
          // Balance check failed, continue anyway
        }

        // Approve bank to spend USDC
        updateProcessingStep('DEPOSIT', 'APPROVING_TOKEN');
        const approveTx = await usdcContract.approve(
          bankAddress,
          parseUnits(amount, 6),
        );
        console.log('Approve transaction:', approveTx);

        updateProcessingStep('DEPOSIT', 'WAITING_APPROVAL');
        const approvalReceipt = await approveTx.wait();
        console.log('Approval receipt:', approvalReceipt);

        // Deposit USDC to bridge
        updateProcessingStep('DEPOSIT', 'DEPOSITING');
        const depositTx = await bridgeContract.depositERC20(
          usdcAddress,
          parseUnits(amount, 6),
        );
        console.log('Deposit transaction:', depositTx);

        updateProcessingStep('DEPOSIT', 'WAITING_DEPOSIT');
        const receipt = await depositTx.wait();
        setTransactionHash(receipt.hash);

        // Get user address from Auth provider
        const userAddress = userDetails?.userWallet || '';

        refreshBalance('USDC');

        // API call
        updateProcessingStep('DEPOSIT', 'API_CALL');

        // Call success callback if provided
        if (onSuccess && typeof onSuccess === 'function' && receipt) {
          const successData = {
            txHash: receipt.hash,
            amount: amount,
            userAddress: userAddress,
            sourceChain: 'ETH',
            coinCode: 'USDC',
          };

          const transactionDetails = {
            amount,
            userAddress: userAddress,
            hash: '',
            sourceChainCode: 'ETH',
            coinCode: 'USDC',
          };
          apiCall(transactionDetails, 'depositErc20Token').then();

          updateProcessingStep('DEPOSIT', 'COMPLETED');
          setBridgeSuccess(true);
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
    [userDetails],
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
        } catch (err) {
          // Balance check failed, continue anyway
        }

        // Approve bank to spend EURC
        updateProcessingStep('DEPOSIT', 'APPROVING_TOKEN');
        const approveTx = await eurcContract.approve(
          bankAddress,
          parseUnits(amount, 6), // EURC has 6 decimals
        );

        updateProcessingStep('DEPOSIT', 'WAITING_APPROVAL');
        const approvalReceipt = await approveTx.wait();

        // Deposit EURC to bridge
        updateProcessingStep('DEPOSIT', 'DEPOSITING');
        const depositTx = await bridgeContract.depositERC20(
          eurcAddress,
          parseUnits(amount, 6),
        );

        updateProcessingStep('DEPOSIT', 'WAITING_DEPOSIT');
        const receipt = await depositTx.wait();
        setTransactionHash(receipt.hash);

        // Get user address from Auth provider
        const userAddress = userDetails?.userWallet || '';

        refreshBalance('EURC');

        // API call
        updateProcessingStep('DEPOSIT', 'API_CALL');

        if (onSuccess && typeof onSuccess === 'function' && receipt) {
          const successData = {
            txHash: receipt.hash,
            amount: amount,
            userAddress: userAddress,
            sourceChain: 'ETH',
            coinCode: 'EURC',
          };

          const transactionDetails = {
            amount,
            userAddress: userAddress,
            hash: '',
            sourceChainCode: 'ETH',
            coinCode: 'EURC',
          };
          apiCall(transactionDetails, 'depositErc20Token').then();

          updateProcessingStep('DEPOSIT', 'COMPLETED');
          setBridgeSuccess(true);
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
    [userDetails],
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
        const usdcAddress = USDC_ADDRESS;
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
        } catch (err) {
          // Balance check failed, continue anyway
        }

        // Approve USDC to spend WUSDC
        updateProcessingStep('WITHDRAW', 'APPROVING_TOKEN');
        const approveTx = await wusdcContract.approve(
          destinationAddress,
          parseUnits(amount, 6), // WUSDC has 6 decimals
        );

        updateProcessingStep('WITHDRAW', 'WAITING_APPROVAL');
        const approvalReceipt = await approveTx.wait();

        // Deposit WUSDC to destination
        updateProcessingStep('WITHDRAW', 'BURNING');
        const depositTx = await destinationContract.burnERC20(
          wusdcAddress,
          parseUnits(amount, 6),
        );

        updateProcessingStep('WITHDRAW', 'WAITING_BURN');
        const receipt = await depositTx.wait();
        setTransactionHash(receipt.hash);

        // Get user address from Auth provider
        const userAddress = userDetails?.userWallet || '';

        refreshBalance('WUSDC');

        // API call
        updateProcessingStep('WITHDRAW', 'API_CALL');

        // Call success callback if provided
        if (onSuccess && typeof onSuccess === 'function' && receipt) {
          const successData = {
            txHash: receipt.hash,
            amount: amount,
            userAddress: userAddress,
            sourceChain: 'DENERGY',
            coinCode: 'WUSDC',
          };

          const transactionDetails = {
            amount,
            userAddress: userAddress,
            tokenAddress: USDC_ADDRESS,
            hash: '',
            sourceChainCode: 'DENERGY',
            coinCode: 'WUSDC',
            destinationChainCode: 'ETH',
          };
          apiCall(transactionDetails, 'withdrawErc20Token').then();

          updateProcessingStep('WITHDRAW', 'COMPLETED');
          setBridgeSuccess(true);
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
    [userDetails],
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
        const eurcAddress = EURC_ADDRESS;
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
        // try {
        //   const balance = await weurcContract.balanceOf(
        //     await signer.getAddress(),
        //   );
        // } catch (err) {
        //   // Balance check failed, continue anyway
        // }

        // Approve EURC to spend WEURC
        updateProcessingStep('WITHDRAW', 'APPROVING_TOKEN');
        const approveTx = await weurcContract.approve(
          destinationAddress,
          parseUnits(amount, 6), // WEURC has 6 decimals
        );

        updateProcessingStep('WITHDRAW', 'WAITING_APPROVAL');
        const approvalReceipt = await approveTx.wait();

        // Deposit WEURC to destination
        updateProcessingStep('WITHDRAW', 'BURNING');
        const depositTx = await destinationContract.burnERC20(
          weurcAddress,
          parseUnits(amount, 6),
        );

        updateProcessingStep('WITHDRAW', 'WAITING_BURN');
        const receipt = await depositTx.wait();

        // Get user address from Auth provider
        const userAddress = userDetails?.userWallet || '';

        refreshBalance('WEURC');

        // API call
        updateProcessingStep('WITHDRAW', 'API_CALL');

        if (onSuccess && typeof onSuccess === 'function' && receipt) {
          const successData = {
            txHash: receipt.hash,
            amount: amount,
            userAddress: userAddress,
            sourceChain: 'DENERGY',
            coinCode: 'WEURC',
          };

          const transactionDetails = {
            amount,
            userAddress: userAddress,
            tokenAddress: EURC_ADDRESS,
            hash: '',
            sourceChainCode: 'DENERGY',
            coinCode: 'WEURC',
            destinationChainCode: 'ETH',
          };
          apiCall(transactionDetails, 'withdrawErc20Token').then();

          updateProcessingStep('WITHDRAW', 'COMPLETED');
          setBridgeSuccess(true);
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
    [userDetails],
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
