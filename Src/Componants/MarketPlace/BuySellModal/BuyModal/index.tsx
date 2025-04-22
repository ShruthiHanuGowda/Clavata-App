import React, {useEffect, useState} from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  ScrollView,
  SafeAreaView,
} from 'react-native';
import ReviewStage from './ReviewStage';
import ApproveAndConfirmStage from './ApproveAndConfirmStage';
import ConfirmStage from './ConfirmStage';
import TransactionConfirmed from './TransactionConfirmed';

import {useWallet} from '../../../../../screens/Provider/WalletProvider';
import {useMagic} from '../../../../../screens/Provider/MagicProvider';
import {useAuth} from '../../../../../screens/Provider/authProvider';

import {getMinAsk, getMinAskPrice} from '../../../../hooks/marketPlace';
import {requiresApproval} from '../../../../hooks/marketplace/requiresApproval';
import {
  getNftMarketContract,
  useERC20,
} from '../../../../hooks/marketplace/useContracts';
import {useCallWithGasPrice} from '../../../../hooks/marketplace/useCallWithGasPrice';
import useApproveConfirmTransaction from '../../../../hooks/marketplace/useApproveConfirmTransaction';

import {TOKEN_CONTRACTS, ERC20_ABI} from '../../../../constants';
import {NftToken} from '../../../../types/types';
import {BrowserProvider, Contract, MaxUint256} from 'ethers';

enum BuyingStage {
  REVIEW = 'REVIEW',
  APPROVE_AND_CONFIRM = 'APPROVE_AND_CONFIRM',
  CONFIRM = 'CONFIRM',
  TX_CONFIRMED = 'TX_CONFIRMED',
}

const modalTitles: Record<BuyingStage, string> = {
  [BuyingStage.REVIEW]: 'Review',
  [BuyingStage.APPROVE_AND_CONFIRM]: 'Approve & Confirm',
  [BuyingStage.CONFIRM]: 'Confirm',
  [BuyingStage.TX_CONFIRMED]: 'Transaction Confirmed',
};

interface BuyModalProps {
  visible: boolean;
  onClose: () => void;
  nftToBuy: NftToken;
  currentSeller?: string;
}

const BuyModal: React.FC<BuyModalProps> = ({
  visible,
  onClose,
  nftToBuy,
  currentSeller,
}) => {
  const [stage, setStage] = useState<BuyingStage>(BuyingStage.REVIEW);
  const [quantity, setQuantity] = useState<number>(1);
  const [paymentCurrency, setPaymentCurrency] = useState<'USDC' | 'EURC'>(
    'USDC',
  );
  const [confirmedTxHash, setConfirmedTxHash] = useState<string>('');

  const {refreshBalance, getBalance} = useWallet();
  const {magic_denergy} = useMagic();
  const {userDetails} = useAuth();
  const {callWithGasPrice} = useCallWithGasPrice();
  const {balance} = getBalance('WUSDC');

  const account = userDetails?.denergyWallet as `0x${string}`;
  const nftPrice = getMinAskPrice(nftToBuy?.marketData?.activeAsks ?? []);
  const availableQuantity =
    getMinAsk(nftToBuy?.marketData?.activeAsks ?? []).amount ?? '0';
  const seller =
    currentSeller ||
    getMinAsk(nftToBuy?.marketData?.activeAsks ?? []).seller?.id ||
    '0x0000000000000000000000000000000000000000';

  const usdcAddress = TOKEN_CONTRACTS.denergy.USDC as `0x${string}`;
  const eurcAddress = TOKEN_CONTRACTS.denergy.EURC as `0x${string}`;
  const tokenAddress = paymentCurrency === 'USDC' ? usdcAddress : eurcAddress;

  const tokenContract = useERC20(tokenAddress);
  const nftMarketContract = getNftMarketContract();
  const marketAddress = TOKEN_CONTRACTS.nftMarket as `0x${string}`;

  useEffect(() => {
    refreshBalance('WUSDC');
  }, [paymentCurrency]);

  const {isApproved, isApproving, isConfirming, handleApprove, handleConfirm} =
    useApproveConfirmTransaction({
      onRequiresApproval: () => {
        return requiresApproval(
          tokenAddress,
          account,
          marketAddress,
          // BigInt(nftPrice ?? 0) * BigInt(quantity ?? 0),
          MaxUint256,
          magic_denergy,
        );
      },
      onApprove: () => {
        return callWithGasPrice(tokenContract, 'approve', [
          marketAddress,
          MaxUint256,
        ]);
      },
      onConfirm: async () => {
        // const provider = new BrowserProvider(magic_denergy.rpcProvider as any);
        // const signer = await provider.getSigner();
        // const onChainTokenContract = new Contract(
        //   tokenAddress,
        //   ERC20_ABI,
        //   signer,
        // );
        // const currentAllowance = await onChainTokenContract.allowance(
        //   account,
        //   marketAddress,
        // );
        // const requiredAllowance = BigInt(nftPrice) * BigInt(quantity);

        // if (currentAllowance < requiredAllowance) {
        //   const tx = await callWithGasPrice(tokenContract, 'approve', [
        //     marketAddress,
        //     MaxUint256,
        //   ]);

        //   await tx;
        // }

        return callWithGasPrice(nftMarketContract, 'buyToken', [
          nftToBuy.collectionAddress,
          BigInt(nftToBuy.tokenId),
          seller,
          BigInt(quantity),
        ]);
      },
      onSuccess: ({receipt}) => {
        console.log(receipt);
        setConfirmedTxHash(receipt.hash);
        setStage(BuyingStage.TX_CONFIRMED);
      },
    });

  const goBack = () => {
    if (stage !== BuyingStage.REVIEW) setStage(BuyingStage.REVIEW);
  };

  const handleClose = () => {
    setStage(BuyingStage.REVIEW);
    setQuantity(1);
    setPaymentCurrency('USDC');
    setConfirmedTxHash('');
    onClose();
  };

  return (
    <Modal visible={visible} animationType="slide" transparent>
      <SafeAreaView style={styles.modalWrapper}>
        <View style={styles.modalContent}>
          <View style={styles.header}>
            {stage !== BuyingStage.REVIEW && (
              <TouchableOpacity onPress={goBack}>
                <Text style={styles.backButton}>←</Text>
              </TouchableOpacity>
            )}
            <Text style={styles.title}>{modalTitles[stage]}</Text>
            <TouchableOpacity onPress={handleClose}>
              <Text style={styles.closeButton}>✕</Text>
            </TouchableOpacity>
          </View>

          <ScrollView contentContainerStyle={{padding: 16}}>
            {stage === BuyingStage.REVIEW && (
              <ReviewStage
                nftToBuy={nftToBuy}
                quantity={quantity}
                setQuantity={setQuantity}
                nftPrice={Number(nftPrice)}
                paymentCurrency={paymentCurrency}
                availableQuantity={parseFloat(availableQuantity)}
                walletBalance={Number(balance)}
                walletFetchStatus={'success'}
                continueToNextStage={() =>
                  setStage(BuyingStage.APPROVE_AND_CONFIRM)
                }
              />
            )}

            {stage === BuyingStage.APPROVE_AND_CONFIRM && (
              <ApproveAndConfirmStage
                handleApprove={handleApprove}
                isApproved={isApproved}
                isApproving={isApproving}
                isConfirming={isConfirming}
                handleConfirm={handleConfirm}
              />
            )}

            {stage === BuyingStage.CONFIRM && (
              <ConfirmStage
                isConfirming={isConfirming}
                handleConfirm={handleConfirm}
              />
            )}

            {stage === BuyingStage.TX_CONFIRMED && (
              <TransactionConfirmed
                txHash={confirmedTxHash}
                onDismiss={handleClose}
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
    alignItems: 'center',
    padding: 16,
    justifyContent: 'space-between',
    borderBottomWidth: 1,
    borderColor: '#eee',
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

export default BuyModal;
