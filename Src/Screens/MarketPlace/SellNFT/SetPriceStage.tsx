import React, {useEffect, useRef} from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  TouchableOpacity,
  Image,
} from 'react-native';
import {NftToken} from '../../../types/types';
import {formatQuantityMWh} from '../../../utils';
import {NFT_DEFAULT_IMAGE_URL} from '../../../constants';

interface SetPriceStageProps {
  nftToSell: NftToken;
  variant: 'set' | 'adjust';
  currentPrice?: number;
  price: string;
  lowestPrice?: number;
  setPrice: React.Dispatch<React.SetStateAction<string>>;
  quantity: string;
  setQuantity: React.Dispatch<React.SetStateAction<string>>;
  continueToNextStage: () => void;
}

const MIN_PRICE = 1;
const MAX_PRICE = 10000;

const SetPriceStage: React.FC<SetPriceStageProps> = ({
  nftToSell,
  variant,
  currentPrice,
  price,
  setPrice,
  quantity,
  setQuantity,
  continueToNextStage,
}) => {
  const priceInputRef = useRef<TextInput | null>(null);
  const adjustedPriceIsTheSame =
    variant === 'adjust' && currentPrice && currentPrice === parseFloat(price);
  const priceIsValid =
    !price || Number.isNaN(parseFloat(price)) || parseFloat(price) <= 0;
  const parsedQty = parseFloat(quantity);
  const quantityGreaterThanAvailable =
    nftToSell?.marketData?.quantity &&
    parsedQty * 1_000_000 > nftToSell?.marketData?.quantity;
  const qtyIsValid =
    Number.isNaN(parseFloat(quantity)) ||
    !quantity ||
    parseFloat(quantity) <= 0;
  const priceAsFloat = parseFloat(price);
  const priceIsOutOfRange =
    priceAsFloat > MAX_PRICE || priceAsFloat < MIN_PRICE;

  const enforcer = (nextUserInput: string) => {
    if (nextUserInput === '' || /^[0-9]*(?:[.])?[0-9]*$/.test(nextUserInput)) {
      setPrice(nextUserInput);
    }
  };

  const enforcerQty = (nextUserInput: string) => {
    if (nextUserInput === '' || /^[0-9]*(?:[.])?[0-9]*$/.test(nextUserInput)) {
      setQuantity(nextUserInput);
    }
  };

  useEffect(() => {
    if (priceInputRef.current) {
      priceInputRef.current.focus();
    }
  }, []);

  const getButtonText = () => {
    if (variant === 'adjust') {
      if (adjustedPriceIsTheSame || priceIsValid) {
        return 'Input New Sale Price';
      }
      return 'Confirm Changes';
    }
    return 'Continue to Approval';
  };

  const isButtonDisabled = Boolean(
    priceIsValid ||
      adjustedPriceIsTheSame ||
      priceIsOutOfRange ||
      qtyIsValid ||
      quantityGreaterThanAvailable,
  );

  return (
    <View style={styles.container}>
      {/* NFT Header */}
      <View style={styles.nftHeader}>
        <Image
          source={{
            uri: nftToSell?.image?.thumbnail || NFT_DEFAULT_IMAGE_URL,
          }}
          style={styles.nftImage}
        />
        <View style={styles.nftInfo}>
          <Text style={styles.nftName}>{nftToSell?.name}</Text>
          <Text style={styles.collectionName}>{nftToSell?.collectionName}</Text>
        </View>
      </View>

      {/* Form Section */}
      <View style={styles.formSection}>
        <Text style={styles.sectionTitle}>
          {variant === 'adjust' ? 'Adjust Listing Price' : 'Set Your Price'}
        </Text>

        {/* Price Input */}
        <View style={styles.inputGroup}>
          <Text style={styles.inputLabel}>Price per MWh (USDC)</Text>
          <View
            style={[
              styles.inputContainer,
              priceIsOutOfRange && styles.inputError,
            ]}>
            //FIXME - remove URL and add static image
            <Image
              source={{
                uri: 'https://raw.githubusercontent.com/piteasio/app-tokens/main/token-logo/0x15D38573d2feeb82e7ad5187aB8c1D52810B1f07.png',
              }}
              style={styles.inputIcon}
            />
            <TextInput
              style={styles.textInput}
              ref={priceInputRef}
              value={price}
              onChangeText={enforcer}
              keyboardType="numeric"
              placeholder="0.00"
              placeholderTextColor="#999"
            />
            <Text style={styles.currencyLabel}>USDC</Text>
          </View>
          {priceIsOutOfRange && (
            <Text style={styles.errorText}>
              Price must be between {MIN_PRICE} and {MAX_PRICE} USDC
            </Text>
          )}
          <Text style={styles.helperText}>
            Range: {MIN_PRICE} - {MAX_PRICE} USDC
          </Text>
        </View>

        {/* Quantity Input */}
        <View style={styles.inputGroup}>
          <Text style={styles.inputLabel}>Quantity to Sell (MWh)</Text>
          <View
            style={[styles.inputContainer, qtyIsValid && styles.inputError]}>
            <TextInput
              style={[styles.textInput, {paddingLeft: 16}]}
              value={quantity}
              onChangeText={enforcerQty}
              keyboardType="numeric"
              placeholder="0.0"
              placeholderTextColor="#999"
            />
            <Text style={styles.currencyLabel}>MWh</Text>
          </View>
          {qtyIsValid && (
            <Text style={styles.errorText}>
              Quantity must be greater than 0
            </Text>
          )}
          {quantityGreaterThanAvailable && (
            <Text style={styles.errorText}>
              Cannot sell more than{' '}
              {formatQuantityMWh(Number(nftToSell?.marketData?.quantity))}
            </Text>
          )}
          {nftToSell?.marketData?.quantity && (
            <Text style={styles.helperText}>
              Available:{' '}
              {formatQuantityMWh(Number(nftToSell?.marketData?.quantity))}
            </Text>
          )}
        </View>

        {/* Price Summary */}
        {price && quantity && !priceIsValid && !qtyIsValid && (
          <View style={styles.summaryCard}>
            <Text style={styles.summaryTitle}>Listing Summary</Text>
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Total Value:</Text>
              <Text style={styles.summaryValue}>
                {(parseFloat(price) * parseFloat(quantity)).toFixed(2)} USDC
              </Text>
            </View>
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Quantity:</Text>
              <Text style={styles.summaryValue}>{quantity} MWh</Text>
            </View>
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Price per MWh:</Text>
              <Text style={styles.summaryValue}>{price} USDC</Text>
            </View>
          </View>
        )}
      </View>

      {/* Action Button */}
      <View style={styles.actionContainer}>
        <TouchableOpacity
          style={[
            styles.continueButton,
            isButtonDisabled && styles.buttonDisabled,
          ]}
          onPress={continueToNextStage}
          disabled={isButtonDisabled}>
          <Text style={styles.continueButtonText}>{getButtonText()}</Text>
        </TouchableOpacity>
      </View>

      {/* Info Card */}
      <View style={styles.infoCard}>
        <Text style={styles.infoTitle}>💡 Important Information</Text>
        <Text style={styles.infoText}>
          • Your Certificate will be transferred to the marketplace contract
        </Text>
        <Text style={styles.infoText}>
          • You can cancel or adjust your listing anytime
        </Text>
        <Text style={styles.infoText}>
          • Sales are processed in USDC (can be swapped 1:1 with WUSDC)
        </Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  nftHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 24,
    elevation: 1,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  nftImage: {
    width: 60,
    height: 60,
    borderRadius: 8,
    marginRight: 12,
  },
  nftInfo: {
    flex: 1,
  },
  nftName: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1a1a1a',
    marginBottom: 2,
  },
  collectionName: {
    fontSize: 14,
    color: '#666',
  },
  formSection: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 20,
    marginBottom: 20,
    elevation: 1,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#1a1a1a',
    marginBottom: 20,
  },
  inputGroup: {
    marginBottom: 24,
  },
  inputLabel: {
    fontSize: 16,
    fontWeight: '500',
    color: '#333',
    marginBottom: 8,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#e0e0e0',
    borderRadius: 8,
    backgroundColor: '#f8f9fa',
    paddingHorizontal: 12,
    height: 56,
  },
  inputError: {
    borderColor: '#ff4757',
  },
  inputIcon: {
    width: 24,
    height: 24,
    marginRight: 8,
  },
  textInput: {
    flex: 1,
    fontSize: 18,
    color: '#1a1a1a',
    paddingVertical: 0,
  },
  currencyLabel: {
    fontSize: 16,
    color: '#666',
    fontWeight: '500',
  },
  errorText: {
    fontSize: 14,
    color: '#ff4757',
    marginTop: 4,
  },
  helperText: {
    fontSize: 14,
    color: '#999',
    marginTop: 4,
  },
  summaryCard: {
    backgroundColor: '#f8f9fa',
    borderRadius: 8,
    padding: 16,
    marginTop: 8,
  },
  summaryTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1a1a1a',
    marginBottom: 12,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  summaryLabel: {
    fontSize: 14,
    color: '#666',
  },
  summaryValue: {
    fontSize: 14,
    fontWeight: '500',
    color: '#1a1a1a',
  },
  actionContainer: {
    marginBottom: 20,
  },
  continueButton: {
    backgroundColor: '#81c8c3',
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  buttonDisabled: {
    backgroundColor: '#ccc',
    elevation: 0,
    shadowOpacity: 0,
  },
  continueButtonText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#fff',
  },
  infoCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    borderLeftWidth: 4,
    borderLeftColor: '#81c8c3',
  },
  infoTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1a1a1a',
    marginBottom: 8,
  },
  infoText: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
    marginBottom: 4,
  },
});

export default SetPriceStage;
