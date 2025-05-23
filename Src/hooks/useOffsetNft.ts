import {useState} from 'react';
import {BrowserProvider, Contract} from 'ethers';
import {ERC1155_ABI} from '../utils/Contracts';
import {API_OFFSETTING_URL} from '../constants';
import {SnackBarMessage} from '../utils/snackBar';

export const useOffsetNft = (
  magic_denergy,
  account,
  walletAddress,
  setCurrentQuantity,
) => {
  const [isLoadingOffset, setIsLoadingOffset] = useState(false);
  const [redemptionUrl, setRedemptionUrl] = useState('');
  const [pdfDownloadUrl, setPdfDownloadUrl] = useState('');
  const [transactionHash, setTransactionHash] = useState('');
  const [offsetSuccess, setOffsetSuccess] = useState(false);

  const resetOffsetState = () => {
    setRedemptionUrl('');
    setPdfDownloadUrl('');
    setTransactionHash('');
    setOffsetSuccess(false);
  };

  const validateOffsetVolume = (volume, nftQuantity) => {
    const maxQuantity = Number(nftQuantity / 1_000_000);

    if (!volume || volume.trim() === '') {
      SnackBarMessage('Please enter a valid volume', 'error');
      return {isValid: false, maxQuantity};
    }

    const numericVolume = Number(volume);

    if (isNaN(numericVolume) || numericVolume <= 0) {
      return {isValid: false, maxQuantity};
    }

    if (numericVolume > maxQuantity) {
      SnackBarMessage(
        `Volume exceeds available quantity. Maximum: ${maxQuantity} MWh`,
        'error',
      );
      return {isValid: false, maxQuantity};
    }

    return {isValid: true, maxQuantity};
  };

  const getAvailableQuantity = nftQuantity => {
    return Number(nftQuantity / 1_000_000);
  };

  const executeOffset = async (volume, nft) => {
    const validation = validateOffsetVolume(volume, nft?.marketData?.quantity);
    if (!validation.isValid) {
      return false;
    }

    setIsLoadingOffset(true);

    try {
      const magicProvider = new BrowserProvider(magic_denergy.rpcProvider);
      const signer = await magicProvider.getSigner();
      const collectionContract = new Contract(
        nft?.collectionAddress,
        ERC1155_ABI,
        signer,
      );

      const balance = await collectionContract.balanceOf(account, nft?.tokenId);
      const volumeInWei = Number(volume) * 1_000_000;

      if (balance < volumeInWei) {
        SnackBarMessage(
          `You do not have enough balance to offset ${volume} MWh`,
          'error',
        );
        return false;
      }

      // Execute burn transaction
      const receipt = await collectionContract.burn(
        account,
        BigInt(nft?.tokenId),
        BigInt(volumeInWei),
      );

      await receipt.wait();
      //   console.log('Burned successfully:', receipt);
      setTransactionHash(receipt?.hash);
      const response = await fetch(API_OFFSETTING_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          volumeInput: volume,
          nfts: [
            {
              contractAddr: nft?.collectionAddress,
              tokenId: nft?.tokenId,
              account: account,
              transactionHash: receipt.hash,
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
        const balance = await collectionContract.balanceOf(
          account,
          nft?.tokenId,
        );
        setCurrentQuantity(balance);
        SnackBarMessage('Offset created successfully', 'success');
        return true;
      } else {
        SnackBarMessage(`Error: ${data.message}`, 'error');
        return false;
      }
    } catch (error) {
      console.error('Error submitting offset:', error);
      SnackBarMessage('Error submitting offset', 'error');
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
