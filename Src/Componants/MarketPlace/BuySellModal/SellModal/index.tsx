import React, {useState} from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  SafeAreaView,
} from 'react-native';

import SellStage from './SellStage';
import SetPriceStage from './SetPriceStage';
import EditStage from './EditStage';
import RemoveStage from './RemoveStage';
import TransferStage from './TransferStage';
import ConfirmStage from '../BuyModal/ConfirmStage';
import TransactionConfirmed from '../BuyModal/TransactionConfirmed';
import {hexlify, isAddress, MaxUint256, parseUnits, toUtf8Bytes} from 'ethers';
import useApproveConfirmTransaction from '../../../../hooks/marketplace/useApproveConfirmTransaction';
import {useCallWithGasPrice} from '../../../../hooks/marketplace/useCallWithGasPrice';
import {
  getNftMarketContract,
  useNftMarketCollectionContract,
} from '../../../../hooks/marketplace/useContracts';
import {NftToken} from '../../../../types/types';
import {useAuth} from '../../../../../screens/Provider/authProvider';
import {getMinAskPrice} from '../../../../hooks/marketPlace';
import ApproveAndConfirmStage from './ApproveAndConfirmStage';
import {TOKEN_CONTRACTS} from '../../../../constants';
import {isApprovedForAll} from '../../../../hooks/marketplace/requiresApproval';
import {useMagic} from '../../../../../screens/Provider/MagicProvider';
import Modal from 'react-native-modal';
import {SnackBarMessage} from '../../../../utils/snackBar';

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

interface SellModalProps {
  visible: boolean;
  variant?: 'sell' | 'adjust';
  onClose: () => void;
  nftToSell: NftToken;
  onSuccessSale: () => void;
}

const modalTitles: Record<SellingStage, string> = {
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
    return 'Your NFT has been returned to your wallet';
  }
  if (stage === SellingStage.CONFIRM_TRANSFER) {
    return 'Your NFT has been transferred to another wallet';
  }
  if (variant === 'sell') {
    return 'Your NFT has been listed for sale!';
  }
  return 'Your NFT listing has been changed.';
};

const SellModal: React.FC<SellModalProps> = ({
  visible,
  variant = 'sell',
  onClose,
  nftToSell,
  onSuccessSale,
}) => {
  const [stage, setStage] = useState<SellingStage>(
    variant === 'sell' ? SellingStage.SELL : SellingStage.EDIT,
  );
  const [price, setPrice] = useState<string>('');
  const [quantity, setQuantity] = useState<string>('');
  const [transferAddress, setTransferAddress] = useState<string>('');
  const [confirmedTxHash, setConfirmedTxHash] = useState('');
  const [currentAskPrice, setCurrentAskPrice] = useState<number>(0);
  const lowestPrice = getMinAskPrice(nftToSell?.marketData?.activeAsks ?? []);
  const {userDetails} = useAuth();
  const {callWithGasPrice} = useCallWithGasPrice();
  const {magic_denergy} = useMagic();

  const collectionContract = useNftMarketCollectionContract(
    nftToSell?.collectionAddress,
  );

  const nftMarketContract = getNftMarketContract();
  const marketAddress = TOKEN_CONTRACTS.nftMarket as `0x${string}`;

  const account = userDetails?.userWallet as `0x${string}`;

  const isInvalidTransferAddress =
    !transferAddress ||
    (transferAddress.length > 0 && !isAddress(transferAddress));

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
        setStage(SellingStage.ADJUST_PRICE);
        break;
      case SellingStage.ADJUST_PRICE:
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

  const {isApproving, isApproved, isConfirming, handleApprove, handleConfirm} =
    useApproveConfirmTransaction({
      onRequiresApproval: async () => {
        if (!account) return true;
        try {
          const isApproved = await isApprovedForAll(
            nftToSell.collectionAddress,
            account,
            marketAddress,
            magic_denergy,
          );

          return !isApproved;
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
      onApproveSuccess: async ({receipt}) => {
        SnackBarMessage(
          `Contract approved - you can now put your NFT for sale!`,
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
        if (stage === SellingStage.CONFIRM_TRANSFER) {
          const data = hexlify(toUtf8Bytes(''));
          return callWithGasPrice(collectionContract, 'safeTransferFrom', [
            account,
            transferAddress as `0x${string}`,
            BigInt(nftToSell.tokenId),
            BigInt(quantity),
            data,
          ]);
        }
        const rawPrice = Number(price);
        const rawQuantity = Number(quantity);
        const microQuantity = rawQuantity * 1_000_000;

        const adjustedQuantity = BigInt(microQuantity);

        // const pricePerMicroUnit = rawPrice / microQuantity;
        // console.log('pricePerMicroUnit', pricePerMicroUnit);

        const adjustedPrice = parseUnits(rawPrice.toString(), 6);

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
        if (!variant) return;
        console.log('receipt', receipt);
        setConfirmedTxHash(receipt.hash);
        SnackBarMessage(getToastText(variant, stage), 'success');
        setStage(SellingStage.TX_CONFIRMED);
        onSuccessSale();
      },
    });

  const showBackButton =
    stagesWithBackButton.includes(stage) && !isConfirming && !isApproving;
  return (
    <Modal isVisible={visible}>
      <SafeAreaView style={styles.modalWrapper}>
        <View style={styles.modalContent}>
          <View style={styles.header}>
            {showBackButton && (
              <TouchableOpacity onPress={goBack}>
                <Text style={styles.backButton}>←</Text>
              </TouchableOpacity>
            )}
            <Text style={styles.title}>{modalTitles[stage]}</Text>
            <TouchableOpacity
              onPress={() => {
                onClose();
                setStage(
                  variant === 'sell' ? SellingStage.SELL : SellingStage.EDIT,
                );
              }}>
              <Text style={styles.closeButton}>✕</Text>
            </TouchableOpacity>
          </View>

          <ScrollView contentContainerStyle={{padding: 16}}>
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
                isInvalidTransferAddress={isInvalidTransferAddress}
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
                onDismiss={() => {
                  setStage(
                    variant === 'sell' ? SellingStage.SELL : SellingStage.EDIT,
                  );
                  onClose();
                }}
              />
            )}
          </ScrollView>
        </View>
      </SafeAreaView>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalWrapper: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.3)',
    justifyContent: 'center',
  },
  modalContent: {
    flex: 1,
    backgroundColor: '#fff',
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    paddingBottom: 24,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  closeButton: {
    fontSize: 18,
  },
  backButton: {
    fontSize: 18,
    paddingRight: 12,
  },
});

export default SellModal;
