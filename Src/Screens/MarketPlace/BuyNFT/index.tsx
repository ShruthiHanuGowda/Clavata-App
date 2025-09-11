import React, {useEffect, useState, useCallback} from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  StatusBar,
  Platform,
} from 'react-native';
import ReviewStage from './ReviewStage';
import ApproveAndConfirmStage from './ApproveAndConfirmStage';
import ConfirmStage from './ConfirmStage';
import TransactionConfirmed from './TransactionConfirmed';
import {NftToken} from '../../../types/types';
import {useWallet} from '../../../../screens/Provider/WalletProvider';
import {useMagic} from '../../../../screens/Provider/MagicProvider';
import {useAuth} from '../../../../screens/Provider/authProvider';
import {useCallWithGasPrice} from '../../../hooks/marketplace/useCallWithGasPrice';
import {
  getAskBySellerId,
  getMinAsk,
  getMinAskPrice,
} from '../../../hooks/marketPlace';
import {TOKEN_CONTRACTS} from '../../../constants';
import {
  getNftMarketContract,
  useERC20,
} from '../../../hooks/marketplace/useContracts';
import useApproveConfirmTransaction from '../../../hooks/marketplace/useApproveConfirmTransaction';
import {requiresApproval} from '../../../hooks/marketplace/requiresApproval';
import {MaxUint256} from 'ethers';
import {SnackBarMessage} from '../../../utils/snackBar';
import {navigateBack} from '../../../Navigation/NavigationFunctions';
import {Header} from '../../../components';
import {navigateTo} from '../../../utils/navigationService';

enum BuyingStage {
  REVIEW = 'REVIEW',
  APPROVE_AND_CONFIRM = 'APPROVE_AND_CONFIRM',
  CONFIRM = 'CONFIRM',
  TX_CONFIRMED = 'TX_CONFIRMED',
}

const stageConfig = {
  [BuyingStage.REVIEW]: {
    title: 'Review Purchase',
    showBack: false,
  },
  [BuyingStage.APPROVE_AND_CONFIRM]: {
    title: 'Approve & Confirm',
    showBack: true,
  },
  [BuyingStage.CONFIRM]: {
    title: 'Confirm Transaction',
    showBack: true,
  },
  [BuyingStage.TX_CONFIRMED]: {
    title: 'Purchase Complete',
    showBack: false,
  },
};

interface BuyNFTScreenProps {
  navigation: any;
  route: {
    params: {
      nftToBuy: NftToken;
      currentSeller?: string;
    };
  };
}

const BuyNFTScreen: React.FC<BuyNFTScreenProps> = ({navigation, route}) => {
  const {nftToBuy, currentSeller} = route.params;

  const [stage, setStage] = useState<BuyingStage>(BuyingStage.REVIEW);
  const [quantity, setQuantity] = useState<number>(1);
  const [paymentCurrency, setPaymentCurrency] = useState<'USDC' | 'EURC'>(
    'USDC',
  );
  const [confirmedTxHash, setConfirmedTxHash] = useState<string>('');

  const {refreshBalance, getBalance} = useWallet();
  const {magic} = useMagic();
  const {userDetails} = useAuth();
  const {callWithGasPrice} = useCallWithGasPrice();
  const {balance} = getBalance('WUSDC');

  const account = userDetails?.userWallet as `0x${string}`;
  const nftPrice = getMinAskPrice(nftToBuy?.marketData?.activeAsks ?? []);
  const availableQuantity = currentSeller
    ? getAskBySellerId(nftToBuy?.marketData?.activeAsks ?? [], currentSeller)
        ?.amount
    : getMinAsk(nftToBuy?.marketData?.activeAsks ?? []).amount ?? '0';
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [paymentCurrency]);

  const handleGoBack = useCallback(() => {
    switch (stage) {
      case BuyingStage.APPROVE_AND_CONFIRM:
      case BuyingStage.CONFIRM:
        setStage(BuyingStage.REVIEW);
        break;
      default:
        break;
    }
  }, [stage]);

  const handleClose = useCallback(() => {
    navigation.goBack();
  }, [navigation]);

  const HeaderLeftComponent = useCallback(() => {
    return stageConfig[stage].showBack ? (
      <TouchableOpacity onPress={handleGoBack} style={styles.headerButton}>
        <Text style={styles.headerButtonText}>← Back</Text>
      </TouchableOpacity>
    ) : null;
  }, [stage, handleGoBack]);

  const HeaderRightComponent = useCallback(() => {
    return stage !== BuyingStage.TX_CONFIRMED ? (
      <TouchableOpacity onPress={handleClose} style={styles.headerButton}>
        <Text style={styles.headerButtonText}>Cancel</Text>
      </TouchableOpacity>
    ) : null;
  }, [stage, handleClose]);

  useEffect(() => {
    navigation.setOptions({
      title: stageConfig[stage].title,
      headerLeft: HeaderLeftComponent,
      headerRight: HeaderRightComponent,
    });
  }, [stage, navigation, HeaderLeftComponent, HeaderRightComponent]);

  const {isApproved, isApproving, isConfirming, handleApprove, handleConfirm} =
    useApproveConfirmTransaction({
      onRequiresApproval: () => {
        return requiresApproval(
          tokenAddress,
          account,
          marketAddress,
          MaxUint256,
          magic,
        );
      },
      onApprove: () => {
        return callWithGasPrice(tokenContract, 'approve', [
          marketAddress,
          MaxUint256,
        ]);
      },
      onApproveSuccess: async () => {
        SnackBarMessage(
          `Contract approved - you can now buy NFT with ${paymentCurrency}!`,
          'success',
        );
      },
      onConfirm: async () => {
        const adjustedQuantity = BigInt(quantity * 1_000_000);

        return callWithGasPrice(nftMarketContract, 'buyToken', [
          nftToBuy.collectionAddress,
          BigInt(nftToBuy.tokenId),
          seller,
          BigInt(adjustedQuantity),
        ]);
      },
      onSuccess: ({receipt}) => {
        SnackBarMessage(
          'Your Certificate has been sent to your wallet',
          'success',
        );
        setConfirmedTxHash(receipt.hash);
        setStage(BuyingStage.TX_CONFIRMED);
      },
    });

  const handleComplete = () => {
    navigateTo('D.Energy');
  };

  const renderStage = () => {
    switch (stage) {
      case BuyingStage.REVIEW:
        return (
          <ReviewStage
            nftToBuy={nftToBuy}
            quantity={quantity}
            setQuantity={setQuantity}
            nftPrice={Number(nftPrice)}
            paymentCurrency={paymentCurrency}
            setPaymentCurrency={setPaymentCurrency}
            availableQuantity={parseFloat(availableQuantity ?? '0')}
            walletBalance={Number(balance)}
            walletFetchStatus={'success'}
            continueToNextStage={() =>
              setStage(BuyingStage.APPROVE_AND_CONFIRM)
            }
          />
        );

      case BuyingStage.APPROVE_AND_CONFIRM:
        return (
          <ApproveAndConfirmStage
            handleApprove={handleApprove}
            isApproved={isApproved}
            isApproving={isApproving}
            isConfirming={isConfirming}
            handleConfirm={handleConfirm}
            nftToBuy={nftToBuy}
            quantity={quantity}
            nftPrice={Number(nftPrice)}
            paymentCurrency={paymentCurrency}
          />
        );

      case BuyingStage.CONFIRM:
        return (
          <ConfirmStage
            isConfirming={isConfirming}
            handleConfirm={handleConfirm}
            nftToBuy={nftToBuy}
            quantity={quantity}
            nftPrice={Number(nftPrice)}
            paymentCurrency={paymentCurrency}
          />
        );

      case BuyingStage.TX_CONFIRMED:
        return (
          <TransactionConfirmed
            txHash={confirmedTxHash}
            onComplete={handleComplete}
            nftToBuy={nftToBuy}
          />
        );

      default:
        return null;
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <Header
        headerTitle={stageConfig[stage].title}
        backBtn={() => navigateBack()}
        containerStyle={styles.headerContainer}
        hideBorder
      />
      <StatusBar barStyle="dark-content" backgroundColor="#fff" />
      <View style={styles.content}>{renderStage()}</View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#f9fafa',
    paddingTop: Platform.OS === 'ios' ? 0 : 20,
  },
  content: {
    flex: 1,
    paddingHorizontal: 16,
    paddingTop: 16,
  },
  headerButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  headerButtonText: {
    fontSize: 16,
    color: '#007AFF',
    fontWeight: '600',
  },
  headerContainer: {
    backgroundColor: '#f9fafa',
  },
});

export default BuyNFTScreen;
