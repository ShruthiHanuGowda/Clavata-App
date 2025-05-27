import {useState} from 'react';
import {BrowserProvider, Contract} from 'ethers';
import {ERC1155_ABI, ERC20_ABI} from '../utils/Contracts';
import {SnackBarMessage} from '../utils/snackBar';
import {API_OFFSETTING_URL} from '../constants';
import {useWallet} from '../../screens/Provider/WalletProvider';

const WUSDC_CONTRACT_ADDRESS = '0x847eE0Ba6a31b8E2B8A9f5DE6246f38F4522BC9f';
const TREASURY_ADDRESS = '0x9D5975DD1123032aE0B2D943e9735d88dC90a2DE';

export const useOffsetNft = (magic_denergy, account, walletAddress) => {
  const [isLoadingOffset, setIsLoadingOffset] = useState(false);
  const [redemptionUrl, setRedemptionUrl] = useState('');
  const [pdfDownloadUrl, setPdfDownloadUrl] = useState('');
  const [transactionHash, setTransactionHash] = useState('');
  const [offsetSuccess, setOffsetSuccess] = useState(false);
  const {refreshBalance, getBalance} = useWallet();

  const resetOffsetState = () => {
    setRedemptionUrl('');
    setPdfDownloadUrl('');
    setTransactionHash('');
    setOffsetSuccess(false);
  };

  const validateOffsetVolume = (volume, nftQuantity) => {
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

  const getAvailableQuantity = nftQuantity => {
    return Number(nftQuantity / 1_000_000);
  };

  const checkWUSDCBalance = async (magicProvider, requiredAmount) => {
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

  const sendWUSDCToTreasury = async (magicProvider, amount) => {
    try {
      const signer = await magicProvider.getSigner();
      const wusdcContract = new Contract(
        WUSDC_CONTRACT_ADDRESS,
        ERC20_ABI,
        signer,
      );

      const amountTosend = BigInt(Math.round(amount * 1e6));

      // console.log(`Sending ${amount} WUSDC to treasury...`);
      const taxTransaction = await wusdcContract.transfer(
        TREASURY_ADDRESS,
        BigInt(amountTosend),
      );
      await taxTransaction.wait();

      return {success: true, hash: taxTransaction.hash};
    } catch (error) {
      console.error('Error sending WUSDC to treasury:', error);
      throw error;
    }
  };

  const executeOffset = async (offsetData, nft) => {
    const {volume, startDate, endDate, purpose, taxAmount} = offsetData;

    const validation = validateOffsetVolume(volume, nft?.marketData?.quantity);
    if (!validation.isValid) {
      SnackBarMessage('Invalid volume entered', 'error');
      return false;
    }

    setIsLoadingOffset(true);

    try {
      const magicProvider = new BrowserProvider(magic_denergy.rpcProvider);
      const signer = await magicProvider.getSigner();

      if (taxAmount > 0) {
        // console.log('Checking WUSDC balance for tax payment...');
        const balanceCheck = await checkWUSDCBalance(magicProvider, taxAmount);

        if (!balanceCheck.hasEnoughBalance) {
          SnackBarMessage(
            `Insufficient WUSDC balance. Required: ${balanceCheck.required} WUSDC, Available: ${balanceCheck.balance} WUSDC`,
            'error',
          );
          return false;
        }
      }

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

      // console.log('Executing burn transaction...');
      const receipt = await collectionContract.burn(
        account,
        BigInt(nft?.tokenId),
        BigInt(volumeInWei),
      );

      await receipt.wait();
      // console.log('Burn transaction successful:', receipt.hash);
      setTransactionHash(receipt?.hash);

      if (taxAmount > 0) {
        try {
          const taxResult = await sendWUSDCToTreasury(magicProvider, taxAmount);

          // console.log('Tax payment successful:', taxResult?.hash);
        } catch (taxError) {
          console.error('Tax payment failed:', taxError);
          SnackBarMessage('Tax payment failed. Please try again.', 'error');
          return false;
        }
      }

      // console.log('Calling offset API...');
      const response = await fetch(API_OFFSETTING_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          volumeInput: volume,
          startDate,
          endDate,
          purpose,
          taxAmount,
          nfts: [
            {
              contractAddr: nft?.collectionAddress,
              tokenId: nft?.tokenId,
              account: account,
              hash: receipt?.hash,
              walletAddress: walletAddress,
            },
          ],
        }),
      });

      const data = await response.json();

      if (data.statusCode === 200) {
        const offsetData = JSON.parse(data.body);

        setRedemptionUrl(offsetData?.data?.redemptionStatementUrl);
        setPdfDownloadUrl(offsetData?.data?.pdfDownloadUrl);
        setOffsetSuccess(true);

        const newBalance = await collectionContract.balanceOf(
          account,
          nft?.tokenId,
        );

        SnackBarMessage('Offset created successfully', 'success');
        return true;
      } else {
        SnackBarMessage(
          `Error: ${data.message || 'Failed to generate certificate'}`,
          'error',
        );
        return false;
      }
    } catch (error) {
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
