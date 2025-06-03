import React from 'react';
import {
    View,
    Text,
    TextInput,
    StyleSheet,
    Image,
    TouchableOpacity,
} from 'react-native';
import { NftToken } from '../../../types/types';
import { useAuth } from '../../../../screens/Provider/authProvider';
import { formatQuantityMWh } from '../../../utils';
import { NFT_DEFAULT_IMAGE_URL } from '../../../constants';

interface TransferStageProps {
    nftToSell: NftToken;
    lowestPrice?: number;
    transferAddress: string;
    setTransferAddress: React.Dispatch<React.SetStateAction<string>>;
    quantity: string;
    setQuantity: React.Dispatch<React.SetStateAction<string>>;
    isInvalidTransferAddress: boolean;
    continueToNextStage: () => void;
}

const TransferStage = ({
    nftToSell,
    lowestPrice,
    transferAddress,
    setTransferAddress,
    quantity,
    setQuantity,
    isInvalidTransferAddress,
    continueToNextStage,
}: TransferStageProps) => {
    const { userDetails } = useAuth();
    const transferAddressEqualsConnectedAddress =
        transferAddress.toLowerCase() === userDetails?.denergyWallet.toLowerCase();

    const parsedQty = parseFloat(quantity);
    const quantityGreaterThanAvailable =
        nftToSell?.marketData?.quantity &&
        parsedQty * 1_000_000 > nftToSell?.marketData?.quantity;
    const isQtyInvalid = quantity === '' || isNaN(parsedQty) || parsedQty <= 0;

    const showConfirmButtonDisabled = Boolean(
        isInvalidTransferAddress ||
        !transferAddress ||
        transferAddressEqualsConnectedAddress ||
        isQtyInvalid ||
        quantityGreaterThanAvailable,
    );

    const getAddressErrorText = () => {
        if (isInvalidTransferAddress) {
            return 'Please enter a valid wallet address.';
        }
        if (transferAddressEqualsConnectedAddress) {
            return 'Cannot transfer to your own wallet.';
        }
        return null;
    };

    const getQuantityErrorText = () => {
        if (isQtyInvalid) {
            return 'Quantity must be greater than 0';
        }
        if (quantityGreaterThanAvailable) {
            return `Cannot transfer more than ${formatQuantityMWh(Number(nftToSell?.marketData?.quantity))} MWh`;
        }
        return null;
    };

    return (
        <View style={styles.container}>
            {/* Header Section */}
            <View style={styles.header}>
                <Text style={styles.title}>Transfer NFT</Text>
                <Text style={styles.subtitle}>
                    Send your NFT to another wallet address
                </Text>
            </View>

            {/* NFT Card */}
            {/* <View style={styles.nftCard}>
                <Image
                    source={{
                        uri:
                            nftToSell?.image?.thumbnail ||
                            'https://nfts-data.s3.me-central-1.amazonaws.com/wind.jpg',
                    }}
                    style={styles.nftImage}
                />
                <View style={styles.nftDetails}>
                    <Text style={styles.nftName}>{nftToSell?.name}</Text>
                    <Text style={styles.collectionName}>{nftToSell?.collectionName}</Text>
                    <Text style={styles.tokenId}>Token ID: #{nftToSell?.tokenId}</Text>
                    {nftToSell?.marketData?.quantity && (
                        <Text style={styles.availableQuantity}>
                            Available: {formatQuantityMWh(Number(nftToSell?.marketData?.quantity))} MWh
                        </Text>
                    )}
                </View>
            </View> */}
            <View style={styles.nftCard}>
                <Image
                    source={{
                        uri:
                            nftToSell?.image?.thumbnail ||
                            NFT_DEFAULT_IMAGE_URL
                    }}
                    style={styles.nftImage}
                />
                <View style={styles.nftDetails}>
                    <Text style={styles.nftName}>{nftToSell?.name}</Text>
                    <Text style={styles.collectionName}>{nftToSell?.collectionName}</Text>
                    <Text style={styles.tokenId}>Token ID: #{nftToSell?.tokenId}</Text>
                    {nftToSell?.marketData?.quantity && (
                        <Text style={styles.availableQuantity}>
                            Available: {formatQuantityMWh(Number(nftToSell?.marketData?.quantity))}
                        </Text>
                    )}
                </View>
            </View>

            {/* Transfer Form */}
            <View style={styles.formSection}>
                <Text style={styles.formTitle}>Transfer Details</Text>

                {/* Receiving Address Input */}
                <View style={styles.inputGroup}>
                    <Text style={styles.inputLabel}>Receiving Wallet Address</Text>
                    <View style={[
                        styles.inputContainer,
                        (isInvalidTransferAddress || transferAddressEqualsConnectedAddress) && styles.inputError
                    ]}>
                        <TextInput
                            style={styles.textInput}
                            placeholder="0x1234567890abcdef..."
                            placeholderTextColor="#999"
                            value={transferAddress}
                            onChangeText={setTransferAddress}
                            autoCapitalize="none"
                            autoCorrect={false}
                            multiline={false}
                        />
                    </View>
                    {getAddressErrorText() && (
                        <Text style={styles.errorText}>{getAddressErrorText()}</Text>
                    )}
                    <Text style={styles.helperText}>
                        Enter the complete wallet address where you want to send this NFT
                    </Text>
                </View>

                {/* Quantity Input */}
                <View style={styles.inputGroup}>
                    <Text style={styles.inputLabel}>Quantity to Transfer (MWh)</Text>
                    <View style={[
                        styles.inputContainer,
                        ((isQtyInvalid || quantityGreaterThanAvailable) ? styles.inputError : undefined)
                    ]}>
                        <TextInput
                            style={styles.textInput}
                            placeholder="0.0"
                            placeholderTextColor="#999"
                            keyboardType="numeric"
                            value={quantity}
                            onChangeText={text => setQuantity(text.replace(/[^0-9.]/g, ''))}
                        />
                        <Text style={styles.unitLabel}>MWh</Text>
                    </View>
                    {getQuantityErrorText() && (
                        <Text style={styles.errorText}>{getQuantityErrorText()}</Text>
                    )}
                    {nftToSell?.marketData?.quantity && (
                        <Text style={styles.helperText}>
                            Maximum: {formatQuantityMWh(Number(nftToSell?.marketData?.quantity))}
                        </Text>
                    )}
                </View>

                {/* Transfer Summary */}
                {transferAddress && quantity && !showConfirmButtonDisabled && (
                    <View style={styles.summaryCard}>
                        <Text style={styles.summaryTitle}>Transfer Summary</Text>
                        <View style={styles.summaryRow}>
                            <Text style={styles.summaryLabel}>To:</Text>
                            <Text style={styles.summaryValue}>
                                {`${transferAddress.slice(0, 6)}...${transferAddress.slice(-4)}`}
                            </Text>
                        </View>
                        <View style={styles.summaryRow}>
                            <Text style={styles.summaryLabel}>Amount:</Text>
                            <Text style={styles.summaryValue}>{quantity} MWh</Text>
                        </View>
                        <View style={styles.summaryRow}>
                            <Text style={styles.summaryLabel}>NFT:</Text>
                            <Text style={styles.summaryValue}>{nftToSell?.name}</Text>
                        </View>
                    </View>
                )}
            </View>

            {/* Warning Section */}
            <View style={styles.warningSection}>
                <View style={styles.warningCard}>
                    <Text style={styles.warningTitle}>⚠️ Important Warning</Text>
                    <Text style={styles.warningText}>
                        • This action cannot be undone once confirmed
                    </Text>
                    <Text style={styles.warningText}>
                        • Make sure the receiving address is correct
                    </Text>
                    <Text style={styles.warningText}>
                        • The NFT will be permanently transferred to the destination wallet
                    </Text>
                </View>
            </View>

            {/* Action Button */}
            <View style={styles.actionContainer}>
                <TouchableOpacity
                    style={[
                        styles.confirmButton,
                        showConfirmButtonDisabled && styles.buttonDisabled,
                    ]}
                    disabled={showConfirmButtonDisabled}
                    onPress={continueToNextStage}>
                    <Text style={styles.confirmButtonText}>Continue to Confirmation</Text>
                </TouchableOpacity>
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    header: {
        marginBottom: 24,
    },
    title: {
        fontSize: 24,
        fontWeight: '700',
        color: '#1a1a1a',
        marginBottom: 6,
    },
    subtitle: {
        fontSize: 16,
        color: '#666',
        lineHeight: 22,
    },
    nftCard: {
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
    nftDetails: {
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
    tokenId: {
        fontSize: 14,
        color: '#999',
        marginBottom: 4,
    },
    availableQuantity: {
        fontSize: 14,
        color: '#81c8c3',
        fontWeight: '500',
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
    formTitle: {
        fontSize: 18,
        fontWeight: '600',
        color: '#1a1a1a',
        marginBottom: 20,
    },
    inputGroup: {
        marginBottom: 20,
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
        minHeight: 52,
    },
    inputError: {
        borderColor: '#ff4757',
    },
    textInput: {
        flex: 1,
        fontSize: 16,
        color: '#1a1a1a',
        paddingVertical: 12,
    },
    unitLabel: {
        fontSize: 16,
        color: '#666',
        fontWeight: '500',
        marginLeft: 8,
    },
    errorText: {
        fontSize: 14,
        color: '#ff4757',
        marginTop: 6,
    },
    helperText: {
        fontSize: 14,
        color: '#999',
        marginTop: 6,
        lineHeight: 18,
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
        alignItems: 'center',
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
        flex: 1,
        textAlign: 'right',
    },
    warningSection: {
        marginBottom: 20,
    },
    warningCard: {
        backgroundColor: '#fff3cd',
        borderRadius: 8,
        padding: 16,
        borderLeftWidth: 4,
        borderLeftColor: '#ffc107',
    },
    warningTitle: {
        fontSize: 16,
        fontWeight: '600',
        color: '#1a1a1a',
        marginBottom: 8,
    },
    warningText: {
        fontSize: 14,
        color: '#666',
        lineHeight: 20,
        marginBottom: 4,
    },
    actionContainer: {
        marginTop: 'auto',
    },
    confirmButton: {
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
    confirmButtonText: {
        fontSize: 18,
        fontWeight: '600',
        color: '#fff',
    },
});

export default TransferStage;