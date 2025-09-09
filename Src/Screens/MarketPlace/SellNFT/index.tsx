import React, {useEffect, useMemo, useState} from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  SafeAreaView,
  StatusBar,
} from 'react-native';

import SellStage from './SellStage';
import SetPriceStage from './SetPriceStage';
import EditStage from './EditStage';
import RemoveStage from './RemoveStage';
import TransferStage from './TransferStage';
import ConfirmStage from './ConfirmStage';
import TransactionConfirmed from './TransactionConfirmed';
import {parseUnits} from 'ethers';
import {NftToken} from '../../../types/types';
import {getMinAskPrice} from '../../../hooks/marketPlace';
import {useAuth} from '../../../../screens/Provider/authProvider';
import {useCallWithGasPrice} from '../../../hooks/marketplace/useCallWithGasPrice';
import {useMagic} from '../../../../screens/Provider/MagicProvider';
import {
  getNftMarketContract,
  useNftMarketCollectionContract,
} from '../../../hooks/marketplace/useContracts';
import {API_TRANSFER_URL, TOKEN_CONTRACTS} from '../../../constants';
import useApproveConfirmTransaction from '../../../hooks/marketplace/useApproveConfirmTransaction';
import {isApprovedForAll} from '../../../hooks/marketplace/requiresApproval';
import {SnackBarMessage} from '../../../utils/snackBar';
import ApproveAndConfirmStage from './ApproveAndConfirmStage';
import {getAccountAskPrice, getAccountNFTQuantity} from '../../../utils';
import axios from 'axios';

enum SellingStage {
  SELL = 'SELL',
  SET_PRICE = 'SET_PRICE',
  APPROVE_AND_CONFIRM_SELL = 'APPROVE_AND_CONFIRM_SELL',
  EDIT = 'EDIT',
  ADJUST_PRICE = 'ADJUST_PRICE',
  CONFIRM_ADJUST_PRICE = 'CONFIRM_ADJUST_PRICE',
  REMOVE_FROM_MARKET = 'REMOVE_FROM_MARKET',
  CONFIRM_REMOVE_FROM_MARKET = 'CONFIRM_REMOVE_FROM_MARKET',
  TRANSFER = 'TRANSFER',
  CONFIRM_TRANSFER = 'CONFIRM_TRANSFER',
  TX_CONFIRMED = 'TX_CONFIRMED',
}

interface SellScreenProps {
  navigation: any; // React Navigation prop
  route: {
    params: {
      variant?: 'sell' | 'adjust' | 'transfer';
      nftToSell: NftToken;
      refresh: () => void;
    };
  };
}

const screenTitles: Record<SellingStage, string> = {
  [SellingStage.SELL]: 'Sell NFT',
  [SellingStage.SET_PRICE]: 'Set Price',
  [SellingStage.APPROVE_AND_CONFIRM_SELL]: 'Confirm Sale',
  [SellingStage.EDIT]: 'Edit Listing',
  [SellingStage.ADJUST_PRICE]: 'Adjust Price',
  [SellingStage.CONFIRM_ADJUST_PRICE]: 'Confirm Adjustment',
  [SellingStage.REMOVE_FROM_MARKET]: 'Remove Listing',
  [SellingStage.CONFIRM_REMOVE_FROM_MARKET]: 'Confirm Removal',
  [SellingStage.TRANSFER]: 'Transfer NFT',
  [SellingStage.CONFIRM_TRANSFER]: 'Confirm Transfer',
  [SellingStage.TX_CONFIRMED]: 'Transaction Confirmed',
};

const stagesWithBackButton = [
  SellingStage.SET_PRICE,
  SellingStage.ADJUST_PRICE,
  SellingStage.APPROVE_AND_CONFIRM_SELL,
  SellingStage.CONFIRM_ADJUST_PRICE,
  SellingStage.REMOVE_FROM_MARKET,
  SellingStage.CONFIRM_REMOVE_FROM_MARKET,
  SellingStage.TRANSFER,
  SellingStage.CONFIRM_TRANSFER,
];

const getToastText = (variant: string, stage: SellingStage) => {
  if (stage === SellingStage.CONFIRM_REMOVE_FROM_MARKET) {
    return 'Your Certificate has been returned to your wallet';
  }
  if (stage === SellingStage.CONFIRM_TRANSFER) {
    return 'Your Certificate has been transferred to another wallet';
  }
  if (variant === 'sell') {
    return 'Your Certificate has been listed for sale!';
  }
  return 'Your Certificate listing has been changed.';
};
const getSuccessType = (
  variant: string,
  stage: SellingStage,
): 'sale' | 'transfer' | 'removal' | 'listing' => {
  console.log('stage', stage);

  if (stage === SellingStage.CONFIRM_REMOVE_FROM_MARKET) {
    return 'removal';
  }
  if (stage === SellingStage.CONFIRM_TRANSFER) {
    return 'transfer';
  }
  if (variant === 'sell') {
    return 'listing';
  }
  if (variant === 'adjust') {
    return 'listing';
  }
  return 'listing';
};

const SellNFTScreen: React.FC<SellScreenProps> = ({navigation, route}) => {
  const {variant = 'sell', nftToSell, refresh} = route.params;

  const [stage, setStage] = useState<SellingStage>(
    variant === 'sell'
      ? SellingStage.SELL
      : variant === 'adjust'
      ? SellingStage.EDIT
      : variant === 'transfer'
      ? SellingStage.TRANSFER
      : SellingStage.SELL,
  );
  const [prevStage, setprevStage] = useState(SellingStage.SELL);

  useMemo(
    () =>
      setStage(
        variant === 'sell'
          ? SellingStage.SELL
          : variant === 'adjust'
          ? SellingStage.EDIT
          : variant === 'transfer'
          ? SellingStage.TRANSFER
          : SellingStage.SELL,
      ),
    [variant],
  );

  const [price, setPrice] = useState<string>('');
  const [quantity, setQuantity] = useState<string>('');
  const [transferAddress, setTransferAddress] = useState<string>('');
  const [confirmedTxHash, setConfirmedTxHash] = useState('');
  const [currentAskPrice, setCurrentAskPrice] = useState<number>(0);
  const lowestPrice = getMinAskPrice(nftToSell?.marketData?.activeAsks ?? []);
  const {userDetails} = useAuth();
  const {callWithGasPrice} = useCallWithGasPrice();
  const {magic, setActiveNetwork, activeNetwork} = useMagic();

  const collectionContract = useNftMarketCollectionContract(
    nftToSell?.collectionAddress,
  );

  const nftMarketContract = getNftMarketContract();
  const marketAddress = TOKEN_CONTRACTS.nftMarket as `0x${string}`;

  const account = userDetails?.userWallet as `0x${string}`;

  useEffect(() => {
    if (account) {
      const askPrice = getAccountAskPrice(
        nftToSell?.marketData?.activeAsks ?? [],
        account,
      );

      setCurrentAskPrice(askPrice);
      const accountNFTQuantity = getAccountNFTQuantity(
        nftToSell?.marketData?.activeAsks ?? [],
        account,
      );
      setQuantity((Number(accountNFTQuantity) / 1_000_000).toString());
    }
  }, [account, nftToSell?.marketData]);

  useEffect(() => {
    if (activeNetwork !== 'denergy') {
      setActiveNetwork('denergy');
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeNetwork]);

  const goBack = () => {
    setQuantity('');
    setTransferAddress('');
    switch (stage) {
      case SellingStage.SET_PRICE:
        setStage(SellingStage.SELL);
        break;
      case SellingStage.APPROVE_AND_CONFIRM_SELL:
        setStage(SellingStage.SET_PRICE);
        break;
      case SellingStage.ADJUST_PRICE:
        if (nftToSell?.marketData?.activeAsks) {
          setPrice(lowestPrice.toString());
        }
        setStage(SellingStage.EDIT);
        break;
      case SellingStage.CONFIRM_ADJUST_PRICE:
        setStage(SellingStage.ADJUST_PRICE);
        break;
      case SellingStage.REMOVE_FROM_MARKET:
        setStage(SellingStage.EDIT);
        break;
      case SellingStage.CONFIRM_REMOVE_FROM_MARKET:
        setStage(SellingStage.REMOVE_FROM_MARKET);
        break;
      case SellingStage.TRANSFER:
        setStage(SellingStage.SELL);
        break;
      case SellingStage.CONFIRM_TRANSFER:
        setStage(SellingStage.TRANSFER);
        break;
      default:
        navigation.goBack();
        break;
    }
  };

  const continueToNextStage = () => {
    switch (stage) {
      case SellingStage.SELL:
        setStage(SellingStage.SET_PRICE);
        break;
      case SellingStage.SET_PRICE:
        setStage(SellingStage.APPROVE_AND_CONFIRM_SELL);
        break;
      case SellingStage.EDIT:
        setPrice(currentAskPrice.toString());
        setStage(SellingStage.ADJUST_PRICE);
        break;
      case SellingStage.ADJUST_PRICE:
        setPrice(currentAskPrice.toString());
        setStage(SellingStage.CONFIRM_ADJUST_PRICE);
        break;
      case SellingStage.REMOVE_FROM_MARKET:
        setStage(SellingStage.CONFIRM_REMOVE_FROM_MARKET);
        break;
      case SellingStage.TRANSFER:
        setStage(SellingStage.CONFIRM_TRANSFER);
        break;
      default:
        break;
    }
  };

  const onSuccessSale = () => {
    refresh?.();
  };

  const {isApproving, isApproved, isConfirming, handleApprove, handleConfirm} =
    useApproveConfirmTransaction({
      onRequiresApproval: async () => {
        if (!account) {
          return true;
        }
        try {
          const approvalStatus = await isApprovedForAll(
            nftToSell.collectionAddress,
            account,
            marketAddress,
            magic,
          );

          return !approvalStatus;
        } catch (error) {
          return true;
        }
      },
      onApprove: () => {
        return callWithGasPrice(collectionContract, 'setApprovalForAll', [
          marketAddress,
          true,
        ]);
      },
      onApproveSuccess: async () => {
        SnackBarMessage(
          'Contract approved - you can now put your Certificate for sale!',
          'success',
        );
      },
      onConfirm: async () => {
        if (stage === SellingStage.CONFIRM_REMOVE_FROM_MARKET) {
          return callWithGasPrice(nftMarketContract, 'cancelAsk', [
            nftToSell.collectionAddress,
            BigInt(nftToSell.tokenId),
          ]);
        }
        const rawPrice = Number(price);
        const rawQuantity = Number(quantity);
        const microQuantity = rawQuantity * 1_000_000;

        const adjustedQuantity = BigInt(microQuantity);

        const adjustedPrice = parseUnits(rawPrice.toString(), 6);
        if (stage === SellingStage.CONFIRM_TRANSFER) {
          const burnTx: any = await callWithGasPrice(
            collectionContract,
            'burn',
            [account, BigInt(nftToSell.tokenId), adjustedQuantity],
          );
          console.log('burnTx', burnTx);
          const payload = {
            volumeInput: quantity,
            destinationAccountInput: transferAddress,
            notes: 'NFT transfer',
            nft: {
              contractAddr: nftToSell.collectionAddress,
              tokenId: nftToSell.tokenId,
              account: account,
              transactionHash: burnTx.hash as `0x${string}`,
            },
          };

          console.log('payload', payload);

          try {
            const response = await axios.post(API_TRANSFER_URL, payload);

            console.log('API response:', response.data);
            return burnTx;
          } catch (error) {
            console.error('API call error:', error);
            throw error;
          }
        }

        if (variant === 'sell') {
          return callWithGasPrice(nftMarketContract, 'createAskOrder', [
            nftToSell.collectionAddress,
            BigInt(nftToSell.tokenId),
            adjustedPrice,
            adjustedQuantity,
          ]);
        }

        const tx = callWithGasPrice(nftMarketContract, 'cancelAsk', [
          nftToSell.collectionAddress,
          BigInt(nftToSell.tokenId),
        ]);
        await tx;
        return callWithGasPrice(nftMarketContract, 'createAskOrder', [
          nftToSell.collectionAddress,
          BigInt(nftToSell.tokenId),
          adjustedPrice,
          BigInt(adjustedQuantity),
        ]);
      },
      onSuccess: async ({receipt}) => {
        if (!variant) {
          return;
        }
        console.log('receipt', receipt);
        setConfirmedTxHash(receipt.hash);
        setprevStage(stage);
        SnackBarMessage(getToastText(variant, stage), 'success');
        setStage(SellingStage.TX_CONFIRMED);
        onSuccessSale();
      },
    });

  const showBackButton =
    stagesWithBackButton.includes(stage) && !isConfirming && !isApproving;

  const handleClose = () => {
    if (stage === SellingStage.TX_CONFIRMED) {
      // Navigate back with success result
      navigation.goBack();
    } else {
      // Navigate back normally
      navigation.goBack();
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#fff" />

      {/* Header */}
      <View style={styles.header}>
        {showBackButton ? (
          <TouchableOpacity onPress={goBack} style={styles.backButton}>
            <Text style={styles.backButtonText}>←</Text>
          </TouchableOpacity>
        ) : (
          <View style={styles.backButton} />
        )}

        <Text style={styles.title}>{screenTitles[stage]}</Text>

        <TouchableOpacity onPress={handleClose} style={styles.closeButton}>
          <Text style={styles.closeButtonText}>✕</Text>
        </TouchableOpacity>
      </View>

      {/* Content */}
      <ScrollView
        style={styles.content}
        contentContainerStyle={styles.contentContainer}
        showsVerticalScrollIndicator={false}>
        {stage === SellingStage.SELL && (
          <SellStage
            nftToSell={nftToSell}
            lowestPrice={lowestPrice}
            continueToNextStage={continueToNextStage}
            continueToTransferStage={() => setStage(SellingStage.TRANSFER)}
          />
        )}
        {stage === SellingStage.SET_PRICE && (
          <SetPriceStage
            nftToSell={nftToSell}
            variant="set"
            continueToNextStage={continueToNextStage}
            lowestPrice={lowestPrice}
            price={price}
            quantity={quantity}
            setQuantity={setQuantity}
            setPrice={setPrice}
          />
        )}
        {stage === SellingStage.APPROVE_AND_CONFIRM_SELL && (
          <ApproveAndConfirmStage
            variant="sell"
            isApproved={isApproved}
            isApproving={isApproving}
            isConfirming={isConfirming}
            handleApprove={handleApprove}
            handleConfirm={handleConfirm}
          />
        )}
        {stage === SellingStage.EDIT && (
          <EditStage
            nftToSell={nftToSell}
            currentPrice={currentAskPrice}
            lowestPrice={lowestPrice}
            continueToAdjustPriceStage={continueToNextStage}
            continueToRemoveFromMarketStage={() =>
              setStage(SellingStage.REMOVE_FROM_MARKET)
            }
          />
        )}
        {stage === SellingStage.REMOVE_FROM_MARKET && (
          <RemoveStage continueToNextStage={continueToNextStage} />
        )}
        {stage === SellingStage.CONFIRM_REMOVE_FROM_MARKET && (
          <ConfirmStage
            isConfirming={isConfirming}
            handleConfirm={handleConfirm}
          />
        )}
        {stage === SellingStage.ADJUST_PRICE && (
          <SetPriceStage
            price={price}
            quantity={quantity}
            setPrice={setPrice}
            setQuantity={setQuantity}
            continueToNextStage={() =>
              setStage(SellingStage.CONFIRM_ADJUST_PRICE)
            }
            nftToSell={nftToSell}
            variant="adjust"
          />
        )}
        {stage === SellingStage.CONFIRM_ADJUST_PRICE && (
          <ConfirmStage
            isConfirming={isConfirming}
            handleConfirm={handleConfirm}
          />
        )}
        {stage === SellingStage.TRANSFER && (
          <TransferStage
            nftToSell={nftToSell}
            lowestPrice={lowestPrice}
            continueToNextStage={continueToNextStage}
            transferAddress={transferAddress}
            setTransferAddress={setTransferAddress}
            quantity={quantity}
            setQuantity={setQuantity}
          />
        )}
        {stage === SellingStage.CONFIRM_TRANSFER && (
          <ConfirmStage
            isConfirming={isConfirming}
            handleConfirm={handleConfirm}
          />
        )}
        {stage === SellingStage.TX_CONFIRMED && (
          <TransactionConfirmed
            txHash={confirmedTxHash}
            onDismiss={handleClose}
            successType={getSuccessType(variant, prevStage)}
          />
        )}
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
    backgroundColor: '#fff',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  title: {
    fontSize: 20,
    fontWeight: '600',
    color: '#1a1a1a',
    flex: 1,
    textAlign: 'center',
  },
  backButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  backButtonText: {
    fontSize: 24,
    color: '#333',
    fontWeight: '500',
  },
  closeButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  closeButtonText: {
    fontSize: 20,
    color: '#666',
    fontWeight: '500',
  },
  content: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  contentContainer: {
    flexGrow: 1,
    paddingHorizontal: 20,
    paddingVertical: 24,
  },
});

export default SellNFTScreen;
