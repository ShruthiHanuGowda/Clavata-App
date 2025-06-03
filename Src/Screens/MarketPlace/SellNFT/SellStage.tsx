import React from 'react';
import {
    View,
    Text,
    TouchableOpacity,
    StyleSheet,
    Image,
} from 'react-native';
import { NFT_DEFAULT_IMAGE_URL } from '../../../constants';

interface NFT {
    tokenId: string;
    name: string;
    collectionName: string;
    image: {
        thumbnail: string;
    };
}

interface SellStageProps {
    nftToSell: NFT;
    lowestPrice: number;
    continueToNextStage: () => void;
    continueToTransferStage: () => void;
}

const SellStage: React.FC<SellStageProps> = ({
    nftToSell,
    lowestPrice,
    continueToNextStage,
    continueToTransferStage,
}) => {
    console.log(nftToSell);

    return (
        <View style={styles.container}>
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

                </View>
            </View>

            {/* Info Section */}
            <View style={styles.infoSection}>
                <Text style={styles.infoTitle}>What would you like to do?</Text>
                <Text style={styles.infoDescription}>
                    Choose to sell your NFT on the marketplace or transfer it to another wallet.
                </Text>
            </View>

            {/* Action Buttons */}
            <View style={styles.actionContainer}>
                <TouchableOpacity style={styles.primaryButton} onPress={continueToNextStage}>
                    <View style={styles.buttonContent}>
                        <Text style={styles.buttonIcon}>💰</Text>
                        <View>
                            <Text style={styles.primaryButtonText}>Sell NFT</Text>
                            <Text style={styles.buttonSubtext}>List on marketplace</Text>
                        </View>
                    </View>
                </TouchableOpacity>

                <TouchableOpacity
                    style={styles.secondaryButton}
                    onPress={continueToTransferStage}>
                    <View style={styles.buttonContent}>
                        <Text style={styles.buttonIcon}>📤</Text>
                        <View>
                            <Text style={styles.secondaryButtonText}>Transfer NFT</Text>
                            <Text style={styles.buttonSubtext}>Send to another wallet</Text>
                        </View>
                    </View>
                </TouchableOpacity>
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
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
    priceSection: {
        alignItems: 'center',
        paddingTop: 16,
        borderTopWidth: 1,
        borderTopColor: '#f0f0f0',
        width: '100%',
    },
    priceLabel: {
        fontSize: 14,
        color: '#666',
        marginBottom: 8,
    },
    priceRow: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    currencyIcon: {
        width: 20,
        height: 20,
        marginRight: 8,
    },
    priceValue: {
        fontSize: 20,
        fontWeight: '600',
        color: '#1a1a1a',
    },
    infoSection: {
        marginBottom: 32,
    },
    infoTitle: {
        fontSize: 20,
        fontWeight: '600',
        color: '#1a1a1a',
        marginBottom: 8,
    },
    infoDescription: {
        fontSize: 16,
        color: '#666',
        lineHeight: 24,
    },
    actionContainer: {
        gap: 16,
    },
    primaryButton: {
        backgroundColor: '#81c8c3',
        borderRadius: 12,
        padding: 20,
        elevation: 2,
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.1,
        shadowRadius: 4,
    },
    secondaryButton: {
        backgroundColor: '#fff',
        borderRadius: 12,
        padding: 20,
        borderWidth: 2,
        borderColor: '#e0e0e0',
    },
    buttonContent: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    buttonIcon: {
        fontSize: 24,
        marginRight: 16,
    },
    primaryButtonText: {
        fontSize: 18,
        fontWeight: '600',
        color: '#fff',
        marginBottom: 2,
    },
    secondaryButtonText: {
        fontSize: 18,
        fontWeight: '600',
        color: '#1a1a1a',
        marginBottom: 2,
    },
    buttonSubtext: {
        fontSize: 14,
        color: '#fff',
        opacity: 0.8,
    },
});

export default SellStage;