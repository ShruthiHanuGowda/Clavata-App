import React, { useState } from 'react'
import {
    View,
    Text,
    StyleSheet,
    Modal,
    TouchableOpacity,
    ScrollView,
    SafeAreaView,
} from 'react-native'

import SellStage from './SellStage'
import SetPriceStage from './SetPriceStage'
import EditStage from './EditStage'
import RemoveStage from './RemoveStage'
import TransferStage from './TransferStage'
import ConfirmStage from '../BuyModal/ConfirmStage'
import TransactionConfirmed from '../BuyModal/TransactionConfirmed'

const SellingStage = {
    SELL: 'SELL',
    SET_PRICE: 'SET_PRICE',
    APPROVE_AND_CONFIRM_SELL: 'APPROVE_AND_CONFIRM_SELL',
    EDIT: 'EDIT',
    ADJUST_PRICE: 'ADJUST_PRICE',
    CONFIRM_ADJUST_PRICE: 'CONFIRM_ADJUST_PRICE',
    REMOVE_FROM_MARKET: 'REMOVE_FROM_MARKET',
    CONFIRM_REMOVE_FROM_MARKET: 'CONFIRM_REMOVE_FROM_MARKET',
    TRANSFER: 'TRANSFER',
    CONFIRM_TRANSFER: 'CONFIRM_TRANSFER',
    TX_CONFIRMED: 'TX_CONFIRMED',
}

const modalTitles = {
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
}

const SellModal = ({ visible, variant = "sell", onClose, nftToSell }) => {
    const [stage, setStage] = useState(variant === 'sell' ? SellingStage.EDIT : SellingStage.EDIT)
    const [price, setPrice] = useState('')
    const [quantity, setQuantity] = useState('')
    const [transferAddress, setTransferAddress] = useState('')

    const goBack = () => {
        switch (stage) {
            case SellingStage.SET_PRICE:
                setStage(SellingStage.SELL)
                break
            case SellingStage.APPROVE_AND_CONFIRM_SELL:
                setStage(SellingStage.SET_PRICE)
                break
            case SellingStage.ADJUST_PRICE:
                setStage(SellingStage.EDIT)
                break
            case SellingStage.CONFIRM_ADJUST_PRICE:
                setStage(SellingStage.ADJUST_PRICE)
                break
            case SellingStage.REMOVE_FROM_MARKET:
                setStage(SellingStage.EDIT)
                break
            case SellingStage.TRANSFER:
                setStage(SellingStage.SELL)
                break
            case SellingStage.CONFIRM_TRANSFER:
                setStage(SellingStage.TRANSFER)
                break
        }
    }

    return (
        <Modal visible={visible} animationType="slide" >
            <SafeAreaView style={styles.modalWrapper}>
                <View style={styles.modalContent}>
                    <View style={styles.header}>
                        {stage !== SellingStage.SELL && (
                            <TouchableOpacity onPress={goBack}>
                                <Text style={styles.backButton}>←</Text>
                            </TouchableOpacity>
                        )}
                        <Text style={styles.title}>{modalTitles[stage]}</Text>
                        <TouchableOpacity onPress={onClose}>
                            <Text style={styles.closeButton}>✕</Text>
                        </TouchableOpacity>
                    </View>

                    <ScrollView contentContainerStyle={{ padding: 16 }}>
                        {stage === SellingStage.SELL && (
                            <SellStage nftToSell={nftToSell} lowestPrice={price} x continueToNextStage={() => setStage(SellingStage.SET_PRICE)} continueToTransferStage={() => setStage(SellingStage.TRANSFER)} />
                        )}
                        {stage === SellingStage.SET_PRICE && (
                            <SetPriceStage
                                price={price}
                                quantity={quantity}
                                setPrice={setPrice}
                                setQuantity={setQuantity}
                                continueToNextStage={() => setStage(SellingStage.APPROVE_AND_CONFIRM_SELL)}
                                nftToSell={nftToSell}
                                variant="set"
                            />
                        )}
                        {stage === SellingStage.APPROVE_AND_CONFIRM_SELL && (
                            <ConfirmStage
                                isConfirming={false}
                                handleConfirm={() => setStage(SellingStage.TX_CONFIRMED)}
                            />
                        )}
                        {stage === SellingStage.EDIT && (
                            <EditStage
                                nftToSell={nftToSell}
                                continueToNextStage={() => setStage(SellingStage.ADJUST_PRICE)}
                                continueToAdjustPriceStage={() => setStage(SellingStage.ADJUST_PRICE)}
                                continueToRemoveFromMarketStage={() => setStage(SellingStage.REMOVE_FROM_MARKET)}
                            />
                        )}
                        {stage === SellingStage.REMOVE_FROM_MARKET && (
                            <RemoveStage
                                nftToSell={nftToSell}
                                continueToNextStage={() => setStage(SellingStage.CONFIRM_REMOVE_FROM_MARKET)}
                            />
                        )}
                        {stage === SellingStage.CONFIRM_REMOVE_FROM_MARKET && (
                            <ConfirmStage
                                isConfirming={false}
                                handleConfirm={() => setStage(SellingStage.TX_CONFIRMED)}
                            />
                        )}
                        {stage === SellingStage.ADJUST_PRICE && (
                            <SetPriceStage
                                price={price}
                                quantity={quantity}
                                setPrice={setPrice}
                                setQuantity={setQuantity}
                                continueToNextStage={() => setStage(SellingStage.CONFIRM_ADJUST_PRICE)}
                                nftToSell={nftToSell}
                                variant="edit"
                            />
                        )}
                        {stage === SellingStage.CONFIRM_ADJUST_PRICE && (
                            <ConfirmStage
                                isConfirming={false}
                                handleConfirm={() => setStage(SellingStage.TX_CONFIRMED)}
                            />
                        )}
                        {stage === SellingStage.TRANSFER && (
                            <TransferStage
                                nftToSell={nftToSell}
                                transferAddress={transferAddress}
                                setTransferAddress={setTransferAddress}
                                quantity={quantity}
                                setQuantity={setQuantity}
                                isInvalidTransferAddress={false}
                                continueToNextStage={() => setStage(SellingStage.CONFIRM_TRANSFER)}
                                userAddress="0x1234567890abcdef1234567890abcdef1234567890"
                            />
                        )}
                        {stage === SellingStage.CONFIRM_TRANSFER && (
                            <ConfirmStage
                                isConfirming={false}
                                handleConfirm={() => setStage(SellingStage.TX_CONFIRMED)}
                            />
                        )}
                        {stage === SellingStage.TX_CONFIRMED && (
                            <TransactionConfirmed
                                txHash="0x1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef"
                                onDismiss={() => { onClose(); setStage(SellingStage.SELL) }}
                            />
                        )}
                    </ScrollView>
                </View>
            </SafeAreaView>
        </Modal>
    )
}

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
})

export default SellModal