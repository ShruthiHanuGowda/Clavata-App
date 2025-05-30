import { useState } from 'react';
import { BrowserProvider, Contract } from 'ethers';
import { ERC1155_ABI, ERC20_ABI } from '../utils/Contracts';
import { SnackBarMessage } from '../utils/snackBar';
import { API_OFFSETTING_URL, DENERGY_USDC_ADDRESS, PLATFORM_SETTINGS_API_KEY, PLATFORM_SETTINGS_API_URL } from '../constants';
import { useWallet } from '../../screens/Provider/WalletProvider';
import { ApolloClient, HttpLink, InMemoryCache, useQuery } from '@apollo/client';
import { LIST_PLATFORM_SETTINGS } from '../graphql/queries';

const TREASURY_ADDRESS = '0x756Ba4Bd0eFEd10c5F5C3C76f15893d0bB2387A4';

const client = new ApolloClient({
  link: new HttpLink({
    uri: PLATFORM_SETTINGS_API_URL,
    headers: {
      'x-api-key': PLATFORM_SETTINGS_API_KEY,
    },
  }),
  cache: new InMemoryCache(),
});

export const useOffsetNft = (magic_denergy: any, account: any, walletAddress: any) => {
  const [isLoadingOffset, setIsLoadingOffset] = useState(false);
  const [redemptionUrl, setRedemptionUrl] = useState('');
  const [pdfDownloadUrl, setPdfDownloadUrl] = useState('');
  const [transactionHash, setTransactionHash] = useState('');
  const [offsetSuccess, setOffsetSuccess] = useState(false);
  const { refreshBalance, getBalance } = useWallet();


  const { loading, error, data, refetch } = useQuery(LIST_PLATFORM_SETTINGS, {
    client,
    variables: {
      filter: {
        keyName: {
          contains: 'treasuryWalletAddress',
        },
      },
      limit: 1,
    },
  });

  const treasurySetting = data?.listPlatformSettings?.items && data?.listPlatformSettings?.items.length > 0 && data?.listPlatformSettings?.items[0] || null;

  const dynamicTreasuryAddress = treasurySetting?.value || TREASURY_ADDRESS;


  const resetOffsetState = () => {
    setRedemptionUrl('');
    setPdfDownloadUrl('');
    setTransactionHash('');
    setOffsetSuccess(false);
  };

  const validateOffsetVolume = (volume: string, nftQuantity: number) => {
    const maxQuantity = Number(nftQuantity / 1_000_000);

    if (!volume || volume.trim() === '') {
      return { isValid: false, maxQuantity };
    }

    const numericVolume = Number(volume);

    if (isNaN(numericVolume) || numericVolume <= 0) {
      return { isValid: false, maxQuantity };
    }

    if (numericVolume > maxQuantity) {
      return { isValid: false, maxQuantity };
    }

    return { isValid: true, maxQuantity };
  };

  const getAvailableQuantity = (nftQuantity: number) => {
    return Number(nftQuantity / 1_000_000);
  };

  const checkWUSDCBalance = async (magicProvider: any, requiredAmount: number) => {
    try {
      const balance = getBalance('WUSDC')?.balance ?? 0;

      return {
        hasEnoughBalance: Number(balance) >= Number(requiredAmount),
        balance: balance,
        required: requiredAmount,
      };
    } catch (error) {
      console.error('Error checking WUSDC balance:', error);
      return { hasEnoughBalance: false, balance: 0, required: requiredAmount };
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

      // console.log(`Sending ${amount} WUSDC to treasury...`);
      const taxTransaction = await wusdcContract.transfer(
        dynamicTreasuryAddress,
        BigInt(amountTosend),
      );
      await taxTransaction.wait();

      return { success: true, hash: taxTransaction.hash };
    } catch (error) {
      console.error('Error sending WUSDC to treasury:', error);
      throw error;
    }
  };

  const executeOffset = async (offsetData: any, nft: any) => {
    const { volume, startDate, endDate, purpose, taxAmount } = offsetData;

    const validation = validateOffsetVolume(volume, nft?.marketData?.quantity);
    if (!validation.isValid) {
      SnackBarMessage('Invalid volume entered', 'error');
      return false;
    }

    setIsLoadingOffset(true);

    try {
      const magicProvider = new BrowserProvider(magic_denergy.rpcProvider);
      const signer = await magicProvider.getSigner();
      const token = await magic_denergy.user.getIdToken();

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
          `Insufficient NFT balance. You have ${Number(balance) / 1_000_000
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
          "Authorization": `Bearer ${token}`,
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
