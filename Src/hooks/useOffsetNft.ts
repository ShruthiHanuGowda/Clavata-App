import {useState} from 'react';
import {BrowserProvider, Contract} from 'ethers';
import {ERC1155_ABI, ERC20_ABI} from '../utils/Contracts';
import {SnackBarMessage} from '../utils/snackBar';
import {
  API_OFFSETTING_URL,
  DENERGY_USDC_ADDRESS,
  TREASURY_ADDRESS,
} from '../constants';
import {useWallet} from '../providers';
import {useQuery} from '@apollo/client';
import {LIST_PLATFORM_SETTINGS} from '../graphql/queries';

export const useOffsetNft = (magic: any, account: any) => {
  const [isLoadingOffset, setIsLoadingOffset] = useState(false);
  const [currentProcessingStep, setCurrentProcessingStep] = useState('');
  const [stepProgress, setStepProgress] = useState(0);
  const [redemptionUrl, setRedemptionUrl] = useState('');
  const [pdfDownloadUrl, setPdfDownloadUrl] = useState('');
  const [transactionHash, setTransactionHash] = useState('');
  const [offsetSuccess, setOffsetSuccess] = useState(false);
  const {getBalance} = useWallet();

  const PROCESSING_STEPS: any = {
    VALIDATING: {text: 'Validating transaction details...', progress: 10},
    CHECKING_BALANCE: {text: 'Checking WUSDC balance...', progress: 20},
    CHECKING_NFT_BALANCE: {text: 'Verifying NFT balance...', progress: 30},
    BURNING_TOKENS: {text: 'Redeeming Certificates...', progress: 50},
    PROCESSING_TAX: {text: 'Processing transaction fee...', progress: 70},
    GENERATING_CERTIFICATE: {text: 'Generating certificate...', progress: 85},
    FINALIZING: {text: 'Finalizing offset...', progress: 95},
    COMPLETED: {text: 'Offset completed successfully!', progress: 100},
  };

  const updateProcessingStep = (stepKey: string) => {
    const step = PROCESSING_STEPS[stepKey];
    if (step) {
      setCurrentProcessingStep(step.text);
      setStepProgress(step.progress);
    }
  };

  const {data: settingData} = useQuery(LIST_PLATFORM_SETTINGS, {
    variables: {
      filter: {
        keyName: {
          contains: 'treasuryWalletAddress',
        },
      },
      limit: 1,
    },
  });

  const treasurySetting =
    (settingData?.listPlatformSettings?.items &&
      settingData?.listPlatformSettings?.items.length > 0 &&
      settingData?.listPlatformSettings?.items[0]) ||
    null;

  const dynamicTreasuryAddress = treasurySetting?.value || TREASURY_ADDRESS;

  const resetOffsetState = () => {
    setRedemptionUrl('');
    setPdfDownloadUrl('');
    setTransactionHash('');
    setOffsetSuccess(false);
    setCurrentProcessingStep('');
    setStepProgress(0);
  };

  const validateOffsetVolume = (volume: string, nftQuantity: number) => {
    const maxQuantity = Number(nftQuantity / 1_000_000);

    if (!volume || volume.trim() === '') {
      return {isValid: false, maxQuantity};
    }

    const numericVolume = Number(volume);

    if (isNaN(numericVolume) || numericVolume <= 0) {
      return {isValid: false, maxQuantity};
    }

    if (numericVolume > maxQuantity) {
      return {isValid: false, maxQuantity};
    }

    return {isValid: true, maxQuantity};
  };

  const getAvailableQuantity = (nftQuantity: number) => {
    return Number(nftQuantity / 1_000_000);
  };

  const checkWUSDCBalance = async (
    magicProvider: any,
    requiredAmount: number,
  ) => {
    try {
      const balance = getBalance('WUSDC')?.balance ?? 0;

      return {
        hasEnoughBalance: Number(balance) >= Number(requiredAmount),
        balance: balance,
        required: requiredAmount,
      };
    } catch (error) {
      console.error('Error checking WUSDC balance:', error);
      return {hasEnoughBalance: false, balance: 0, required: requiredAmount};
    }
  };

  const sendWUSDCToTreasury = async (magicProvider: any, amount: number) => {
    try {
      const signer = await magicProvider.getSigner();
      const wusdcContract = new Contract(
        DENERGY_USDC_ADDRESS,
        ERC20_ABI,
        signer,
      );

      const amountTosend = BigInt(Math.round(amount * 1e6));

      const taxTransaction = await wusdcContract.transfer(
        dynamicTreasuryAddress,
        BigInt(amountTosend),
      );
      await taxTransaction.wait();

      return {success: true, hash: taxTransaction.hash};
    } catch (error) {
      console.error('Error sending WUSDC to treasury:', error);
      throw error;
    }
  };

  const executeOffset = async (offsetData: any, nft: any) => {
    const {volume, startDate, endDate, purpose, taxAmount} = offsetData;

    setIsLoadingOffset(true);
    updateProcessingStep('VALIDATING');

    try {
      // Step 1: Validation
      const validation = validateOffsetVolume(
        volume,
        nft?.marketData?.quantity,
      );
      if (!validation.isValid) {
        SnackBarMessage('Invalid volume entered', 'error');
        return false;
      }

      const magicProvider = new BrowserProvider(magic.rpcProvider);
      const signer = await magicProvider.getSigner();
      const token = await magic.user.getIdToken();

      // Step 2: Check WUSDC balance if tax required
      if (taxAmount > 0) {
        updateProcessingStep('CHECKING_BALANCE');
        const balanceCheck = await checkWUSDCBalance(magicProvider, taxAmount);

        if (!balanceCheck.hasEnoughBalance) {
          SnackBarMessage(
            `Insufficient WUSDC balance. Required: ${balanceCheck.required} WUSDC, Available: ${balanceCheck.balance} WUSDC`,
            'error',
          );
          return false;
        }
      }

      // Step 3: Check NFT balance
      updateProcessingStep('CHECKING_NFT_BALANCE');
      const collectionContract = new Contract(
        nft?.collectionAddress,
        ERC1155_ABI,
        signer,
      );

      const balance = await collectionContract.balanceOf(account, nft?.tokenId);
      const volumeInWei = Number(volume) * 1_000_000;

      if (balance < volumeInWei) {
        SnackBarMessage(
          `Insufficient NFT balance. You have ${
            Number(balance) / 1_000_000
          } MWh available`,
          'error',
        );
        return false;
      }

      // Step 4: Burn tokens
      updateProcessingStep('BURNING_TOKENS');
      const receipt = await collectionContract.burn(
        account,
        BigInt(nft?.tokenId),
        BigInt(volumeInWei),
      );

      await receipt.wait();
      setTransactionHash(receipt?.hash);

      // Step 5: Process tax payment
      if (taxAmount > 0) {
        updateProcessingStep('PROCESSING_TAX');
        try {
          await sendWUSDCToTreasury(magicProvider, taxAmount);
        } catch (taxError) {
          console.error('Tax payment failed:', taxError);
          SnackBarMessage('Tax payment failed. Please try again.', 'error');
          return false;
        }
      }

      // Step 6: Generate certificate
      updateProcessingStep('GENERATING_CERTIFICATE');
      const body = JSON.stringify({
        volumeInput: volume,
        periodStart: new Date(startDate),
        periodEnd: new Date(endDate),
        purpose,
        nfts: [
          {
            contractAddr: nft?.collectionAddress,
            tokenId: nft?.tokenId,
            account: account,
            transactionHash: receipt?.hash,
          },
        ],
      });

      const response = await fetch(API_OFFSETTING_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: body,
      });

      const data = await response.json();

      // Step 7: Finalize
      updateProcessingStep('FINALIZING');

      if (data?.success) {
        updateProcessingStep('COMPLETED');

        // setRedemptionUrl(data?.data?.redemptionStatementUrl);
        setRedemptionUrl(data?.data?.pdfDownloadUrl);
        setPdfDownloadUrl(data?.data?.pdfDownloadUrl);
        setOffsetSuccess(true);

        SnackBarMessage('Offset created successfully', 'success');

        return true;
      } else {
        SnackBarMessage(
          `Error: ${data.message || 'Failed to generate certificate'}`,
          'error',
        );
        return false;
      }
    } catch (error: any) {
      console.error('Error during offset process:', error);

      if (error.message?.includes('user rejected')) {
        SnackBarMessage('Transaction was cancelled by user', 'error');
      } else if (error.message?.includes('insufficient funds')) {
        SnackBarMessage('Insufficient funds for transaction', 'error');
      } else if (error.message?.includes('network')) {
        SnackBarMessage('Network error. Please try again', 'error');
      } else if (error.message?.includes('tax payment')) {
        SnackBarMessage('Tax payment failed. Please try again', 'error');
      } else {
        SnackBarMessage('Error processing offset. Please try again', 'error');
      }
      return false;
    } finally {
      setIsLoadingOffset(false);
    }
  };

  return {
    isLoadingOffset,
    currentProcessingStep,
    stepProgress,
    redemptionUrl,
    pdfDownloadUrl,
    transactionHash,
    offsetSuccess,
    executeOffset,
    resetOffsetState,
    getAvailableQuantity,
    validateOffsetVolume,
  };
};
