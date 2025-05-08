import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  Image,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
} from 'react-native';
import {useMagic} from '../../../../../screens/Provider/MagicProvider';
import {BrowserProvider, hexlify, toUtf8Bytes} from 'ethers';
import {useAuth} from '../../../../../screens/Provider/authProvider';
import {Magic} from '@magic-sdk/react-native-bare';
import {formatQuantityMWh} from '../../../../utils';

interface ReviewStageProps {
  nftToBuy: {
    image?: {
      thumbnail: string;
    };
    collectionName?: string;
    name?: string;
    tokenId?: string;
  };
  paymentCurrency: string;
  quantity: number;
  setQuantity: React.Dispatch<React.SetStateAction<number>>;
  nftPrice: number;
  walletBalance: number;
  walletFetchStatus: 'loading' | 'success' | 'error';
  continueToNextStage: () => void;
  availableQuantity: number;
}

const ReviewStage: React.FC<ReviewStageProps> = ({
  nftToBuy,
  paymentCurrency,
  quantity,
  setQuantity,
  nftPrice,
  walletBalance,
  walletFetchStatus,
  continueToNextStage,
  availableQuantity,
}) => {
  const feePercentage = 0.025;

  const nftPriceWithFee = nftPrice * (1 + feePercentage);
  const totalPayment = nftPriceWithFee * quantity;
  const quantityExceeds = quantity * 1_000_000 > availableQuantity;
  const notEnoughBalance = totalPayment > walletBalance;

  const handleQuantityChange = (val: string) => {
    const number = parseInt(val.replace(/[^0-9]/g, ''), 10);
    if (!isNaN(number) && number <= availableQuantity) {
      setQuantity(number);
    } else if (val === '') {
      setQuantity(0);
    }
  };

  return (
    <ScrollView showsVerticalScrollIndicator={false}>
      <View style={styles.nftInfo}>
        <Image
          source={{
            uri:
              nftToBuy?.image?.thumbnail ||
              'https://nfts-data.s3.me-central-1.amazonaws.com/wind.jpg',
          }}
          style={styles.nftImage}
        />
        <View>
          <Text style={styles.collectionName}>
            {nftToBuy?.collectionName || 'Collection Name'}
          </Text>
          <Text style={styles.nftName}>{nftToBuy?.name || 'NFT Name'}</Text>
          <Text style={styles.tokenId}>
            Token ID: {nftToBuy?.tokenId || 'Token ID'}
          </Text>
        </View>
      </View>

      {/* Price Summary */}
      <View style={styles.section}>
        <Text style={styles.label}>Pay with:</Text>
        <Text style={styles.value}>{paymentCurrency}</Text>

        <Text style={styles.label}>Quantity</Text>
        <TextInput
          style={styles.input}
          keyboardType="numeric"
          value={quantity.toString()}
          onChangeText={handleQuantityChange}
          placeholder="Enter quantity"
        />
        <Text style={styles.helper}>
          Available: {formatQuantityMWh(availableQuantity)}
        </Text>

        <Text style={styles.label}>NFT Price</Text>
        <Text style={styles.value}>
          {nftPrice} {paymentCurrency}
        </Text>

        <Text style={styles.label}>Total (excl. fees)</Text>
        <Text style={styles.value}>
          {(nftPrice * quantity).toFixed(2)} {paymentCurrency}
        </Text>

        <Text style={styles.label}>
          Fee ({(feePercentage * 100).toFixed(2)}%)
        </Text>
        <Text style={styles.value}>
          {(nftPrice * quantity * feePercentage).toFixed(2)} {paymentCurrency}
        </Text>

        <Text style={styles.label}>Total Payment (incl. fees)</Text>
        <Text style={styles.value}>
          {totalPayment.toFixed(2)} {paymentCurrency}
        </Text>
      </View>

      {/* Wallet Info */}
      <View style={styles.section}>
        <Text style={styles.label}>Your Wallet Balance</Text>
        {walletFetchStatus !== 'success' ? (
          <ActivityIndicator size="small" color="#666" />
        ) : (
          <Text style={[styles.value, notEnoughBalance && styles.warning]}>
            {walletBalance} {paymentCurrency}
          </Text>
        )}
      </View>

      {notEnoughBalance && (
        <Text style={styles.warningText}>
          Not enough {paymentCurrency} to complete this purchase.
        </Text>
      )}

      {quantityExceeds && (
        <Text style={styles.warningText}>
          Quantity exceeds available. Max allowed:{' '}
          {formatQuantityMWh(availableQuantity)}
        </Text>
      )}

      {/* Actions */}
      <TouchableOpacity
        style={[
          styles.button,
          (notEnoughBalance || !quantity || quantityExceeds) &&
            styles.disabledButton,
        ]}
        disabled={notEnoughBalance || !quantity || quantityExceeds}
        onPress={continueToNextStage}>
        <Text style={styles.buttonText}>Checkout</Text>
      </TouchableOpacity>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  nftInfo: {
    flexDirection: 'row',
    marginBottom: 20,
    alignItems: 'center',
  },
  nftImage: {
    width: 64,
    height: 64,
    borderRadius: 10,
    marginRight: 12,
  },
  collectionName: {
    fontSize: 12,
    color: '#888',
  },
  nftName: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  tokenId: {
    fontSize: 12,
    color: '#666',
    marginTop: 2,
  },
  section: {
    marginBottom: 20,
  },
  label: {
    fontWeight: '600',
    marginTop: 8,
  },
  value: {
    fontSize: 16,
    marginBottom: 4,
  },
  helper: {
    fontSize: 12,
    color: '#666',
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 8,
    marginTop: 4,
  },
  warning: {
    color: '#e74c3c',
  },
  warningText: {
    color: '#e74c3c',
    fontSize: 13,
    marginBottom: 10,
  },
  button: {
    backgroundColor: '#008060',
    padding: 14,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 8,
  },
  disabledButton: {
    backgroundColor: '#ccc',
  },
  buttonText: {
    color: 'white',
    fontWeight: 'bold',
  },
});

export default ReviewStage;
