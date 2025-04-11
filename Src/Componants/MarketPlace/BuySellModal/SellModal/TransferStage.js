import React from 'react'
import {
    View,
    Text,
    TextInput,
    StyleSheet,
    Image,
    TouchableOpacity,
} from 'react-native'

const TransferStage = ({
    nftToSell,
    transferAddress,
    setTransferAddress,
    quantity,
    setQuantity,
    isInvalidTransferAddress,
    continueToNextStage,
    userAddress,
}) => {
    const transferAddressEqualsConnectedAddress =
        transferAddress.toLowerCase() === userAddress.toLowerCase()

    const parsedQty = parseFloat(quantity)
    const quantityGreaterThanAvailable =
        nftToSell?.marketData?.quantity && parsedQty > nftToSell?.marketData?.quantity
    const isQtyInvalid =
        quantity === '' || isNaN(parsedQty) || parsedQty <= 0

    const showConfirmButtonDisabled =
        isInvalidTransferAddress ||
        !transferAddress ||
        transferAddressEqualsConnectedAddress ||
        isQtyInvalid ||
        quantityGreaterThanAvailable

    const getErrorText = () => {
        if (isInvalidTransferAddress) {
            return 'That’s not a valid wallet address.'
        }
        if (transferAddressEqualsConnectedAddress) {
            return 'This address is the one currently connected.'
        }
        return null
    }

    return (
        <View style={styles.container}>
            <Text style={styles.title}>Transfer to New Wallet</Text>

            <View style={styles.nftInfo}>
                <Image
                    source={{ uri: nftToSell?.image?.thumbnail || 'https://nfts-data.s3.me-central-1.amazonaws.com/wind.jpg' }}
                    style={styles.nftImage}
                />
                <View style={{ flex: 1 }}>
                    <Text style={styles.nftName}>{nftToSell?.name}</Text>
                    <Text style={styles.collectionName}>{nftToSell?.collectionName}</Text>
                    {nftToSell?.marketData?.lowestPrice && (
                        <Text style={styles.lowestPrice}>
                            Lowest Price: {nftToSell.marketData.lowestPrice}
                        </Text>
                    )}
                </View>
            </View>

            <View style={styles.inputGroup}>
                <Text style={styles.label}>Receiving Address</Text>
                <TextInput
                    style={[
                        styles.input,
                        (isInvalidTransferAddress || transferAddressEqualsConnectedAddress) && styles.warningInput,
                    ]}
                    placeholder="Paste account address"
                    value={transferAddress}
                    onChangeText={setTransferAddress}
                    autoCapitalize="none"
                />
                {!!getErrorText() && <Text style={styles.warningText}>{getErrorText()}</Text>}
            </View>

            <View style={styles.inputGroup}>
                <Text style={styles.label}>Quantity to Transfer</Text>
                <TextInput
                    style={styles.input}
                    placeholder="Quantity"
                    keyboardType="numeric"
                    value={quantity}
                    onChangeText={(text) => setQuantity(text.replace(/[^0-9.]/g, ''))}
                />
                {quantityGreaterThanAvailable && (
                    <Text style={styles.warningText}>
                        Cannot send more than {nftToSell?.marketData?.quantity} NFTs.
                    </Text>
                )}
            </View>

            <View style={styles.tipBox}>
                <Text style={styles.tipText}>
                    This action will send your NFT to the address above. Make sure it’s the correct one.
                </Text>
            </View>

            <TouchableOpacity
                style={[styles.button, showConfirmButtonDisabled && styles.buttonDisabled]}
                disabled={showConfirmButtonDisabled}
                onPress={continueToNextStage}
            >
                <Text style={styles.buttonText}>Confirm</Text>
            </TouchableOpacity>
        </View>
    )
}

const styles = StyleSheet.create({
    container: {
        padding: 16,
    },
    title: {
        fontSize: 22,
        fontWeight: 'bold',
        marginBottom: 16,
    },
    nftInfo: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 24,
    },
    nftImage: {
        width: 64,
        height: 64,
        borderRadius: 10,
        marginRight: 12,
    },
    nftName: {
        fontSize: 16,
        fontWeight: 'bold',
    },
    collectionName: {
        fontSize: 12,
        color: '#666',
        marginTop: 2,
    },
    lowestPrice: {
        fontSize: 12,
        color: '#888',
        marginTop: 4,
    },
    inputGroup: {
        marginBottom: 20,
    },
    label: {
        fontWeight: '600',
        marginBottom: 6,
        fontSize: 14,
    },
    input: {
        borderWidth: 1,
        borderColor: '#ddd',
        borderRadius: 8,
        paddingHorizontal: 10,
        paddingVertical: 10,
        fontSize: 14,
        backgroundColor: '#fff',
    },
    warningInput: {
        borderColor: '#e74c3c',
    },
    warningText: {
        color: '#e74c3c',
        fontSize: 12,
        marginTop: 4,
    },
    tipBox: {
        backgroundColor: '#f8f8f8',
        padding: 12,
        borderRadius: 8,
        marginBottom: 16,
    },
    tipText: {
        fontSize: 13,
        color: '#555',
    },
    button: {
        backgroundColor: '#008060',
        padding: 14,
        borderRadius: 8,
        alignItems: 'center',
    },
    buttonDisabled: {
        backgroundColor: '#ccc',
    },
    buttonText: {
        color: '#fff',
        fontWeight: 'bold',
        fontSize: 16,
    },
})

export default TransferStage