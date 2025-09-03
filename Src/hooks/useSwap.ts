import {useState, useEffect, useCallback} from 'react';
import {BrowserProvider, parseUnits, formatUnits, Contract} from 'ethers';
import {useWallet} from '../../screens/Provider/WalletProvider';
import {
  CUSTOM_NETWORK_CHAIN_ID,
  DENERGY_USDC_ADDRESS,
  SWAP_SMART_ROUTER,
  SWAP_V3_QUOTER,
  SWAP_V3_FACTORY,
  SWAP_WETH,
} from '../constants';

// Types
interface Token {
  symbol: string;
  name: string;
  native?: boolean;
  decimals: number;
  address: string;
}

interface Quote {
  amountIn: string;
  amountOut: string;
  priceImpact: number;
  fee: number;
  route: string[];
  bestFee: number;
  feeKey: string;
}

interface UseSwapReturn {
  account: string;
  isConnected: boolean;
  provider: BrowserProvider | null;
  signer: any;
  selectedToken: string;
  selectedTargetToken: string;
  setSelectedToken: (token: string) => void;
  setSelectedTargetToken: (token: string) => void;
  TOKENS: Record<string, Token>;
  amount: string;
  amountInTokens: number;
  usdvalue: number;
  networkfee: number;
  changeAmount: (val: string) => void;
  isLoading: boolean;
  errorMessage: string | null;
  txStatus: string;
  txHash: string;
  balance: string;
  allowance: string;
  quote: Quote | null;
  slippage: number;
  setSlippage: (value: number) => void;
  getBalance: (tokenSymbol?: string) => Promise<void>;
  needsApproval: () => boolean;
  approveToken: () => Promise<void>;
  executeSwap: () => Promise<void>;
  switchTokens: () => void;
  checkDisable: () => boolean;
  getInputToken: () => Token;
  getOutputToken: () => Token;
  CONTRACTS: any;
  FEE_AMOUNTS: any;
  // New step processing states
  currentProcessingStep: string;
  stepProgress: number;
  swapSuccess: boolean;
  transactionHash: string;
  resetSwapState: () => void;
}

const CONTRACTS = {
  DENERGY_TESTNET: {
    chainId: CUSTOM_NETWORK_CHAIN_ID,
    SMART_ROUTER: SWAP_SMART_ROUTER,
    V3_QUOTER: SWAP_V3_QUOTER,
    V3_FACTORY: SWAP_V3_FACTORY,
    WETH: SWAP_WETH,
    USDC: DENERGY_USDC_ADDRESS,
  },
};

const FEE_AMOUNTS = {
  LOWEST: 100,
  LOW: 500,
  MEDIUM: 2500,
  HIGH: 10000,
};

// Only WATT and USDC tokens
const TOKENS: Record<string, Token> = {
  WATT: {
    symbol: 'WATT',
    name: 'WATT',
    native: true,
    decimals: 18,
    address: 'WATT',
  },
  USDC: {
    symbol: 'USDC',
    name: 'USD Coin',
    decimals: 6,
    address: CONTRACTS.DENERGY_TESTNET.USDC,
  },
};

// Contract ABIs
const SMART_ROUTER_ABI = [
  {
    inputs: [
      {internalType: 'uint256', name: 'deadline', type: 'uint256'},
      {internalType: 'bytes[]', name: 'data', type: 'bytes[]'},
    ],
    name: 'multicall',
    outputs: [{internalType: 'bytes[]', name: 'results', type: 'bytes[]'}],
    stateMutability: 'payable',
    type: 'function',
  },
  {
    inputs: [
      {
        components: [
          {internalType: 'address', name: 'tokenIn', type: 'address'},
          {internalType: 'address', name: 'tokenOut', type: 'address'},
          {internalType: 'uint24', name: 'fee', type: 'uint24'},
          {internalType: 'address', name: 'recipient', type: 'address'},
          {internalType: 'uint256', name: 'amountIn', type: 'uint256'},
          {internalType: 'uint256', name: 'amountOutMinimum', type: 'uint256'},
          {internalType: 'uint160', name: 'sqrtPriceLimitX96', type: 'uint160'},
        ],
        internalType: 'struct ISwapRouter.ExactInputSingleParams',
        name: 'params',
        type: 'tuple',
      },
    ],
    name: 'exactInputSingle',
    outputs: [{internalType: 'uint256', name: 'amountOut', type: 'uint256'}],
    stateMutability: 'payable',
    type: 'function',
  },
  {
    inputs: [
      {internalType: 'uint256', name: 'amountMinimum', type: 'uint256'},
      {internalType: 'address', name: 'recipient', type: 'address'},
    ],
    name: 'unwrapWETH9',
    outputs: [],
    stateMutability: 'payable',
    type: 'function',
  },
];

const ERC20_ABI = [
  {
    inputs: [
      {name: 'spender', type: 'address'},
      {name: 'amount', type: 'uint256'},
    ],
    name: 'approve',
    outputs: [{name: '', type: 'bool'}],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [{name: 'account', type: 'address'}],
    name: 'balanceOf',
    outputs: [{name: '', type: 'uint256'}],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [
      {name: 'owner', type: 'address'},
      {name: 'spender', type: 'address'},
    ],
    name: 'allowance',
    outputs: [{name: '', type: 'uint256'}],
    stateMutability: 'view',
    type: 'function',
  },
];

const QUOTER_ABI = [
  {
    inputs: [
      {
        components: [
          {internalType: 'address', name: 'tokenIn', type: 'address'},
          {internalType: 'address', name: 'tokenOut', type: 'address'},
          {internalType: 'uint256', name: 'amountIn', type: 'uint256'},
          {internalType: 'uint24', name: 'fee', type: 'uint24'},
          {internalType: 'uint160', name: 'sqrtPriceLimitX96', type: 'uint160'},
        ],
        internalType: 'struct IQuoterV2.QuoteExactInputSingleParams',
        name: 'params',
        type: 'tuple',
      },
    ],
    name: 'quoteExactInputSingle',
    outputs: [
      {internalType: 'uint256', name: 'amountOut', type: 'uint256'},
      {internalType: 'uint160', name: 'sqrtPriceX96After', type: 'uint160'},
      {internalType: 'uint32', name: 'initializedTicksCrossed', type: 'uint32'},
      {internalType: 'uint256', name: 'gasEstimate', type: 'uint256'},
    ],
    stateMutability: 'nonpayable',
    type: 'function',
  },
];

// Processing steps for swap operations
const SWAP_PROCESSING_STEPS: any = {
  APPROVAL: {
    INITIALIZING: {text: 'Initializing token approval...', progress: 10},
    CHECKING_ALLOWANCE: {text: 'Checking current allowance...', progress: 25},
    APPROVING_TOKEN: {text: 'Approving token spend...', progress: 50},
    WAITING_APPROVAL: {
      text: 'Waiting for approval confirmation...',
      progress: 75,
    },
    COMPLETED: {text: 'Token approval completed!', progress: 100},
  },
  SWAP: {
    INITIALIZING: {text: 'Initializing swap process...', progress: 5},
    PREPARING_PARAMS: {text: 'Preparing swap parameters...', progress: 15},
    ESTIMATING_GAS: {text: 'Estimating gas requirements...', progress: 25},
    BUILDING_TRANSACTION: {text: 'Building swap transaction...', progress: 40},
    SENDING_TRANSACTION: {
      text: 'Sending transaction to network...',
      progress: 55,
    },
    WAITING_CONFIRMATION: {
      text: 'Waiting for transaction confirmation...',
      progress: 75,
    },
    UPDATING_BALANCES: {text: 'Updating account balances...', progress: 90},
    COMPLETED: {text: 'Swap completed successfully!', progress: 100},
  },
};

export const useSwap = (magic: any): UseSwapReturn => {
  // Wallet connection state
  const [account, setAccount] = useState<string>('');
  const [isConnected, setIsConnected] = useState<boolean>(false);
  const [provider, setProvider] = useState<BrowserProvider | null>(null);
  const [signer, setSigner] = useState<any>(null);

  // Swap state
  const [selectedToken, setSelectedToken] = useState<string>('WATT');
  const [selectedTargetToken, setSelectedTargetToken] =
    useState<string>('USDC');
  const [amount, setAmount] = useState<string>('');
  const [amountInTokens, setAmountInTokens] = useState<number>(0);
  const [usdvalue, setUsdvalue] = useState<number>(0);
  const [networkfee, setNetworkfee] = useState<number>(0);
  const [slippage, setSlippage] = useState<number>(0.5);

  // Loading and status states
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [txStatus, _setTxStatus] = useState<string>('');
  const [txHash, setTxHash] = useState<string>('');

  // Balance and allowance
  const [balance, setBalance] = useState<string>('0');
  const [allowance, setAllowance] = useState<string>('0');

  // Quote data
  const [quote, setQuote] = useState<Quote | null>(null);
  const {refreshBalance} = useWallet();
  const [isQuoting, setIsQuoting] = useState<boolean>(false);
  const [lastQuoteParams, setLastQuoteParams] = useState<string>('');

  // New states for step processing
  const [currentProcessingStep, setCurrentProcessingStep] = useState('');
  const [stepProgress, setStepProgress] = useState(0);
  const [swapSuccess, setSwapSuccess] = useState(false);
  const [transactionHash, setTransactionHash] = useState<string>('');

  const updateProcessingStep = (
    operationType: 'APPROVAL' | 'SWAP',
    stepKey: string,
  ) => {
    const step = SWAP_PROCESSING_STEPS[operationType][stepKey];
    if (step) {
      setCurrentProcessingStep(step.text);
      setStepProgress(step.progress);
    }
  };

  const resetSwapState = () => {
    setCurrentProcessingStep('');
    setStepProgress(0);
    setSwapSuccess(false);
    setTransactionHash('');
    setTxHash('');
    setErrorMessage(null);
  };

  // Initialize Magic provider
  useEffect(() => {
    if (magic?.rpcProvider) {
      try {
        console.log('Initializing Magic provider...');
        const browserProvider = new BrowserProvider(magic.rpcProvider);
        setProvider(browserProvider);
        setIsConnected(true);

        // Get signer and account
        browserProvider
          .getSigner()
          .then(async (signerInstance: any) => {
            setSigner(signerInstance);
            const address = await signerInstance.getAddress();
            setAccount(address);
            console.log('Magic wallet connected:', address);
          })
          .catch((error: any) => {
            console.error('Error getting signer:', error);
            setErrorMessage('Failed to get wallet signer');
          });
      } catch (error) {
        console.error('Error initializing Magic provider:', error);
        setErrorMessage('Failed to initialize Magic provider');
      }
    }
  }, [magic]);

  // Get current tokens
  const getInputToken = (): Token => TOKENS[selectedToken] || TOKENS.WATT;
  const getOutputToken = (): Token =>
    TOKENS[selectedTargetToken] || TOKENS.USDC;

  // Get user balance
  const getBalance = useCallback(
    async (tokenSymbol: string = selectedToken): Promise<void> => {
      if (!isConnected || !account || !provider) {
        return;
      }

      try {
        const token = TOKENS[tokenSymbol];
        if (!token) {
          return;
        }

        console.log(`Getting balance for ${tokenSymbol}...`);

        if (token.address === 'WATT') {
          const walletBalance = await provider.getBalance(account);
          const formattedBalance = formatUnits(walletBalance, 18);
          setBalance(formattedBalance);
          console.log(`${tokenSymbol} balance:`, formattedBalance);
        } else {
          const contractCode = await provider.getCode(token.address);
          if (contractCode === '0x') {
            console.warn(
              `Contract ${token.address} doesn't exist on this network`,
            );
            setBalance('0');
            return;
          }

          const contract = new Contract(token.address, ERC20_ABI, provider);
          const balancePromise = contract.balanceOf(account);
          const timeoutPromise = new Promise((_, reject) =>
            setTimeout(() => reject(new Error('Balance query timeout')), 10000),
          );

          const tokenBalance = await Promise.race([balancePromise, timeoutPromise]);
          const formattedBalance = formatUnits(
            tokenBalance as bigint,
            token.decimals,
          );
          setBalance(formattedBalance);
          console.log(`${tokenSymbol} balance:`, formattedBalance);
        }
      } catch (error: any) {
        console.error('Error getting balance:', error);
        setBalance('0');
      }
    },
    [isConnected, account, selectedToken, provider],
  );

  // Get allowance for ERC20 tokens
  const getAllowance = useCallback(async (): Promise<void> => {
    const inputToken = TOKENS[selectedToken] || TOKENS.WATT;
    if (
      !isConnected ||
      !account ||
      inputToken.address === 'WATT' ||
      !provider
    ) {
      return;
    }

    try {
      const contractCode = await provider.getCode(inputToken.address);
      if (contractCode === '0x') {
        console.warn(
          `Contract ${inputToken.address} doesn't exist on this network`,
        );
        setAllowance('0');
        return;
      }

      const contract = new Contract(inputToken.address, ERC20_ABI, provider);
      const allowancePromise = contract.allowance(
        account,
        CONTRACTS.DENERGY_TESTNET.SMART_ROUTER,
      );
      const timeoutPromise = new Promise((_, reject) =>
        setTimeout(() => reject(new Error('Allowance query timeout')), 10000),
      );

      const tokenAllowance = await Promise.race([allowancePromise, timeoutPromise]);
      setAllowance((tokenAllowance as bigint).toString());
      console.log(
        `${inputToken.symbol} allowance:`,
        formatUnits(tokenAllowance as bigint, inputToken.decimals),
      );
    } catch (error: any) {
      console.error('Error getting allowance:', error);
      setAllowance('0');
    }
  }, [isConnected, account, selectedToken, provider]);

  // Get real quote from quoter contract
  const getQuote = useCallback(async (): Promise<void> => {
    if (
      !amount ||
      !selectedToken ||
      !selectedTargetToken ||
      amount === '0' ||
      !provider ||
      isQuoting // Prevent multiple simultaneous quote requests
    ) {
      setAmountInTokens(0);
      setQuote(null);
      setUsdvalue(0);
      setNetworkfee(0);
      return;
    }

    // Create a unique key for this quote request to prevent duplicates
    const quoteKey = `${amount}-${selectedToken}-${selectedTargetToken}`;
    if (quoteKey === lastQuoteParams) {
      console.log('Skipping duplicate quote request');
      return;
    }

    try {
      setIsQuoting(true); // Set quoting flag
      setIsLoading(true);
      setLastQuoteParams(quoteKey);

      // Clear previous quote-related errors but keep balance errors
      if (errorMessage && !errorMessage.includes('balance')) {
        setErrorMessage(null);
      }

      const inputToken = TOKENS[selectedToken] || TOKENS.WATT;
      const outputToken = TOKENS[selectedTargetToken] || TOKENS.USDC;

      console.log(
        `Getting quote: ${amount} ${inputToken.symbol} -> ${outputToken.symbol}`,
      );

      const amountIn = parseUnits(amount, inputToken.decimals);
      const tokenInAddress =
        inputToken.address === 'WATT'
          ? CONTRACTS.DENERGY_TESTNET.WETH
          : inputToken.address;
      const tokenOutAddress =
        outputToken.address === 'WATT'
          ? CONTRACTS.DENERGY_TESTNET.WETH
          : outputToken.address;

      const quoterCode = await provider.getCode(
        CONTRACTS.DENERGY_TESTNET.V3_QUOTER,
      );
      if (quoterCode === '0x') {
        console.warn('Quoter contract not found on this network');
        setErrorMessage('DEX not available on this network');
        return;
      }

      const quoterContract = new Contract(
        CONTRACTS.DENERGY_TESTNET.V3_QUOTER,
        QUOTER_ABI,
        provider,
      );

      let bestQuote: any = null;
      let quoteAttempts = 0;
      const maxAttempts = Object.keys(FEE_AMOUNTS).length;

      for (const [feeKey, feeAmount] of Object.entries(FEE_AMOUNTS)) {
        try {
          quoteAttempts++;
          const quoteParams = {
            tokenIn: tokenInAddress,
            tokenOut: tokenOutAddress,
            amountIn: amountIn,
            fee: feeAmount,
            sqrtPriceLimitX96: 0,
          };

          console.log(`Trying fee tier ${feeKey} (${feeAmount})...`);

          // Add timeout and retry logic for individual quote attempts
          const quotePromise =
            quoterContract.quoteExactInputSingle.staticCall(quoteParams);
          const timeoutPromise = new Promise(
            (_, reject) =>
              setTimeout(() => reject(new Error('Quote timeout')), 10000), // Reduced timeout
          );

          const result = await Promise.race([quotePromise, timeoutPromise]);
          const amountOut = (result as any)[0];

          if (
            amountOut > 0 &&
            (!bestQuote || amountOut > bestQuote.amountOut)
          ) {
            bestQuote = {
              amountOut,
              fee: feeAmount,
              feeKey,
            };
            console.log(
              `Found quote for ${feeKey}: ${formatUnits(
                amountOut,
                outputToken.decimals,
              )} ${outputToken.symbol}`,
            );
          }
        } catch (error: any) {
          console.log(`Fee tier ${feeKey} failed:`, error.message);
          // Continue trying other fee tiers instead of failing completely
        }
      }

      if (bestQuote && bestQuote.amountOut > 0) {
        const formattedOut = formatUnits(
          bestQuote.amountOut,
          outputToken.decimals,
        );
        const amountOutNumber = Number(formattedOut);

        setAmountInTokens(amountOutNumber);
        setUsdvalue(
          amountOutNumber * (outputToken.symbol === 'USDC' ? 1 : 0.0003),
        );
        setNetworkfee(0.01);

        setQuote({
          amountIn: amountIn.toString(),
          amountOut: bestQuote.amountOut.toString(),
          priceImpact: 0.1,
          fee: bestQuote.fee / 10000,
          route: [inputToken.symbol, outputToken.symbol],
          bestFee: bestQuote.fee,
          feeKey: bestQuote.feeKey,
        });

        console.log(`Best quote: ${formattedOut} ${outputToken.symbol}`);

        // Clear any previous quote errors on success
        if (errorMessage && !errorMessage.includes('balance')) {
          setErrorMessage(null);
        }
      } else {
        // Only set error if all fee tiers failed
        setAmountInTokens(0);
        setQuote(null);
        setUsdvalue(0);
        setNetworkfee(0);

        const errorMsg =
          quoteAttempts === maxAttempts
            ? 'No liquidity available for this trading pair'
            : 'Unable to get quote - please try again';

        setErrorMessage(errorMsg);
        console.log('No valid quotes found - insufficient liquidity');
      }
    } catch (error: any) {
      console.error('Error getting quote:', error);
      setAmountInTokens(0);
      setQuote(null);
      setUsdvalue(0);
      setNetworkfee(0);

      // Set a user-friendly error message and prevent retries
      const errorMsg = error.message?.includes('network')
        ? 'Network error - please check your connection'
        : 'Failed to get quote - please try again later';

      setErrorMessage(errorMsg);
    } finally {
      setIsLoading(false);
      setIsQuoting(false); // Always clear the quoting flag
    }
  }, [
    amount,
    selectedToken,
    selectedTargetToken,
    provider,
    isQuoting,
    lastQuoteParams,
    errorMessage,
  ]);

  // Modified useEffect with better error handling and loop prevention
  useEffect(() => {
    // Don't quote if there's already a quote error or if we're currently quoting
    if (
      amount &&
      parseFloat(amount) > 0 &&
      !errorMessage?.includes('balance') &&
      !errorMessage?.includes('liquidity') &&
      !errorMessage?.includes('quote') &&
      !errorMessage?.includes('network') &&
      !isQuoting
    ) {
      const timeoutId = setTimeout(() => {
        getQuote();
      }, 800);
      return () => clearTimeout(timeoutId);
    } else if (!amount || parseFloat(amount) === 0) {
      // Clear quote data when amount is cleared
      setAmountInTokens(0);
      setQuote(null);
      setUsdvalue(0);
      setNetworkfee(0);
      setLastQuoteParams(''); // Reset quote params
    }
  }, [
    amount,
    selectedToken,
    selectedTargetToken,
    getQuote,
    errorMessage,
    isQuoting,
  ]);

  // Check if approval is needed
  const needsApproval = (): boolean => {
    const inputToken = getInputToken();
    if (inputToken.native) {
      return false;
    }
    if (!amount || amount === '0') {
      return false;
    }

    try {
      const amountToSpend = parseUnits(amount, inputToken.decimals);
      const currentAllowance = BigInt(allowance || '0');
      return currentAllowance < amountToSpend;
    } catch (error) {
      console.error('Error checking approval:', error);
      return true;
    }
  };

  // Approve token spending with step processing
  const approveToken = async (): Promise<void> => {
    const inputToken = getInputToken();
    if (!isConnected || inputToken.native || !signer) {
      setErrorMessage('Cannot approve: wallet not connected or native token');
      return;
    }

    try {
      setIsLoading(true);
      setErrorMessage(null);
      resetSwapState();

      updateProcessingStep('APPROVAL', 'INITIALIZING');

      updateProcessingStep('APPROVAL', 'CHECKING_ALLOWANCE');

      const amountToApprove = parseUnits(
        (parseFloat(amount) * 2).toFixed(inputToken.decimals),
        inputToken.decimals,
      );

      updateProcessingStep('APPROVAL', 'APPROVING_TOKEN');

      const contract = new Contract(inputToken.address, ERC20_ABI, signer);

      console.log(
        `Approving ${inputToken.symbol}:`,
        formatUnits(amountToApprove, inputToken.decimals),
      );

      const tx = await contract.approve(
        CONTRACTS.DENERGY_TESTNET.SMART_ROUTER,
        amountToApprove,
      );

      setTxHash(tx.hash);
      setTransactionHash(tx.hash);

      updateProcessingStep('APPROVAL', 'WAITING_APPROVAL');

      const receipt = await tx.wait();
      if (receipt.status === 1) {
        updateProcessingStep('APPROVAL', 'COMPLETED');
        setSwapSuccess(true);

        setTimeout(() => {
          getAllowance();
          // Don't reset step here, let the component handle it
        }, 2000);
      } else {
        setErrorMessage('Approval transaction failed');
      }
    } catch (error: any) {
      console.error('Error approving token:', error);
      setErrorMessage('Approval failed: ' + (error.reason || error.message));
    } finally {
      setIsLoading(false);
    }
  };

  // Execute swap with step processing
  const executeSwap = async (): Promise<void> => {
    if (!isConnected || !quote || !signer) {
      setErrorMessage('Cannot swap: wallet not connected or no quote');
      return;
    }

    try {
      setIsLoading(true);
      setErrorMessage(null);
      resetSwapState();

      updateProcessingStep('SWAP', 'INITIALIZING');

      const inputToken = getInputToken();
      const outputToken = getOutputToken();

      console.log(
        `Executing swap: ${amount} ${inputToken.symbol} -> ${outputToken.symbol}`,
      );

      updateProcessingStep('SWAP', 'PREPARING_PARAMS');

      const tokenInAddr =
        inputToken.native || inputToken.address === 'WATT'
          ? CONTRACTS.DENERGY_TESTNET.WETH
          : inputToken.address;
      const tokenOutAddr =
        outputToken.native || outputToken.address === 'WATT'
          ? CONTRACTS.DENERGY_TESTNET.WETH
          : outputToken.address;

      const deadline = Math.floor(Date.now() / 1000) + 1200;
      const amountIn = parseUnits(amount, inputToken.decimals);
      const quotedAmountOut = BigInt(quote.amountOut);
      const slippageBasisPoints = BigInt(Math.floor(slippage * 100));
      const amountOutMin =
        (quotedAmountOut * (10000n - slippageBasisPoints)) / 10000n;

      const routerContract = new Contract(
        CONTRACTS.DENERGY_TESTNET.SMART_ROUTER,
        SMART_ROUTER_ABI,
        signer,
      );

      updateProcessingStep('SWAP', 'BUILDING_TRANSACTION');

      const swapParams = {
        tokenIn: tokenInAddr,
        tokenOut: tokenOutAddr,
        fee: quote.bestFee,
        recipient:
          outputToken.address === 'WATT'
            ? CONTRACTS.DENERGY_TESTNET.SMART_ROUTER
            : account,
        amountIn: amountIn,
        amountOutMinimum: amountOutMin,
        sqrtPriceLimitX96: 0n,
      };

      const swapCalldata = routerContract.interface.encodeFunctionData(
        'exactInputSingle',
        [swapParams],
      );
      const multicallCalls = [swapCalldata];

      if (outputToken.address === 'WATT') {
        const unwrapCalldata = routerContract.interface.encodeFunctionData(
          'unwrapWETH9',
          [amountOutMin, account],
        );
        multicallCalls.push(unwrapCalldata);
      }

      const multicallData = routerContract.interface.encodeFunctionData(
        'multicall',
        [deadline, multicallCalls],
      );

      const txParams = {
        to: CONTRACTS.DENERGY_TESTNET.SMART_ROUTER,
        data: multicallData,
        value:
          inputToken.native || inputToken.address === 'WATT' ? amountIn : 0n,
      };

      updateProcessingStep('SWAP', 'ESTIMATING_GAS');

      const gasEstimate = await signer.estimateGas(txParams);

      updateProcessingStep('SWAP', 'SENDING_TRANSACTION');

      const tx = await signer.sendTransaction({
        ...txParams,
        gasLimit: (gasEstimate * 120n) / 100n,
      });

      setTxHash(tx.hash);
      setTransactionHash(tx.hash);

      updateProcessingStep('SWAP', 'WAITING_CONFIRMATION');

      const receipt = await tx.wait();

      if (receipt.status === 1) {
        updateProcessingStep('SWAP', 'UPDATING_BALANCES');

        // Update balances
        getBalance();
        refreshBalance('WATT');
        refreshBalance(outputToken.symbol);

        updateProcessingStep('SWAP', 'COMPLETED');
        setSwapSuccess(true);

        // Reset form data
        setAmount('');
        setAmountInTokens(0);
        setQuote(null);
        setUsdvalue(0);
        setNetworkfee(0);

        // Don't auto-navigate back, let component handle it
      } else {
        setErrorMessage('Transaction was reverted');
      }
    } catch (error: any) {
      console.error('Swap execution failed:', error);
      let errorMsg = 'Swap failed: ';

      if (
        error.message?.includes('STF') ||
        error.message?.includes('Too little received')
      ) {
        errorMsg += 'Slippage tolerance too low, try increasing slippage';
      } else if (error.message?.includes('insufficient funds')) {
        errorMsg += 'Insufficient WATT for gas fees';
      } else if (error.message?.includes('UNPREDICTABLE_GAS_LIMIT')) {
        errorMsg += 'Pool has insufficient liquidity for this trade';
      } else {
        errorMsg += error.reason || error.message || 'Unknown error';
      }

      setErrorMessage(errorMsg);
    } finally {
      setIsLoading(false);
    }
  };

  // Switch tokens
  const switchTokens = (): void => {
    const tempToken = selectedToken;
    setSelectedToken(selectedTargetToken);
    setSelectedTargetToken(tempToken);
    setAmount('');
    setAmountInTokens(0);
    setQuote(null);
    setUsdvalue(0);
    setNetworkfee(0);
    setErrorMessage(null);
  };

  // Format amount input
  const changeAmount = (val: string): void => {
    const cleaned = val.replace(/[^0-9.]/g, '');
    const parts = cleaned.split('.');
    let formatted = parts[0];
    if (parts.length > 1) {
      formatted += '.' + parts[1].substring(0, 6);
    }
    setAmount(formatted);
  };

  // Check if submit button should be disabled
  const checkDisable = (): boolean => {
    return !(
      amount &&
      parseFloat(amount) > 0 &&
      quote &&
      amountInTokens > 0 &&
      !errorMessage &&
      isConnected
    );
  };

  // Balance validation effect
  useEffect(() => {
    if (!amount || !balance || parseFloat(amount) === 0) {
      if (errorMessage === 'Insufficient balance') {
        setErrorMessage(null);
      }
      return;
    }

    try {
      const inputAmount = parseFloat(amount);
      const availableBalance = parseFloat(balance);

      if (inputAmount > availableBalance) {
        setErrorMessage('Insufficient balance');
        setAmountInTokens(0);
        setUsdvalue(0);
        setNetworkfee(0);
        setQuote(null);
      } else if (errorMessage === 'Insufficient balance') {
        setErrorMessage(null);
      }
    } catch (error) {
      console.error('Balance validation error:', error);
    }
  }, [amount, balance, errorMessage]);

  // Auto-refresh effects
  useEffect(() => {
    if (isConnected && account) {
      getBalance(selectedToken);
    }
  }, [isConnected, account, selectedToken, getBalance]);

  useEffect(() => {
    if (isConnected && account) {
      getAllowance();
    }
  }, [isConnected, account, selectedToken, getAllowance]);

  useEffect(() => {
    if (
      amount &&
      parseFloat(amount) > 0 &&
      !errorMessage?.includes('balance')
    ) {
      const timeoutId = setTimeout(() => {
        getQuote();
      }, 800);
      return () => clearTimeout(timeoutId);
    } else {
      setAmountInTokens(0);
      setQuote(null);
      setUsdvalue(0);
      setNetworkfee(0);
    }
  }, [amount, selectedToken, selectedTargetToken, getQuote, errorMessage]);

  return {
    // Wallet state
    account,
    isConnected,
    provider,
    signer,

    // Token state
    selectedToken,
    selectedTargetToken,
    setSelectedToken,
    setSelectedTargetToken,
    TOKENS,

    // Amount state
    amount,
    amountInTokens,
    usdvalue,
    networkfee,
    changeAmount,

    // Loading and error state
    isLoading,
    errorMessage,
    txStatus,
    txHash,

    // Balance and allowance
    balance,
    allowance,

    // Quote data
    quote,
    slippage,
    setSlippage,

    // Functions
    getBalance,
    needsApproval,
    approveToken,
    executeSwap,
    switchTokens,
    checkDisable,

    // Helper functions
    getInputToken,
    getOutputToken,

    // Constants
    CONTRACTS,
    FEE_AMOUNTS,

    // New step processing states
    currentProcessingStep,
    stepProgress,
    swapSuccess,
    transactionHash,
    resetSwapState,
  };
};

export default useSwap;
