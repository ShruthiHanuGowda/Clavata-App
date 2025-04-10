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
import ReviewStage from './ReviewStage'
import ApproveAndConfirmStage from './ApproveAndConfirmStage'
import ConfirmStage from './ConfirmStage'
import TransactionConfirmed from './TransactionConfirmed'

const BuyingStage = {
    REVIEW: 'REVIEW',
    APPROVE_AND_CONFIRM: 'APPROVE_AND_CONFIRM',
    CONFIRM: 'CONFIRM',
    TX_CONFIRMED: 'TX_CONFIRMED',
}

const modalTitles = {
    [BuyingStage.REVIEW]: 'Review',
    [BuyingStage.APPROVE_AND_CONFIRM]: 'Back',
    [BuyingStage.CONFIRM]: 'Back',
    [BuyingStage.TX_CONFIRMED]: 'Transaction Confirmed',
}

const BuyModal = ({ visible, onClose, nftToBuy }) => {
    const [stage, setStage] = useState(BuyingStage.REVIEW)
    const [quantity, setQuantity] = useState(1)
    const [isApproved, setIsApproved] = useState(false)
    const [paymentCurrency, setPaymentCurrency] = useState('USDC')
    const [confirmedTxHash, setConfirmedTxHash] = useState('0x123456...abc')
    const walletBalance = 100
    const walletFetchStatus = 'success'

    const goBack = () => {
        setStage(BuyingStage.REVIEW)
    }

    const continueToNextStage = () => {
        setStage(BuyingStage.APPROVE_AND_CONFIRM)
    }

    const handleConfirm = () => {
        setStage(BuyingStage.CONFIRM)
        setTimeout(() => {
            setStage(BuyingStage.TX_CONFIRMED)
        }, 2000)
        setIsApproved(false)
    }

    const handleClose = () => {
        setStage(BuyingStage.REVIEW)
        onClose()
    }
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
                        <TouchableOpacity onPress={onClose}>
                            <Text style={styles.closeButton}>✕</Text>
                        </TouchableOpacity>
                    </View>

                    <ScrollView contentContainerStyle={{ padding: 16 }}>
                        {stage === BuyingStage.REVIEW && (
                            <ReviewStage
                                nftToBuy={nftToBuy}
                                quantity={quantity}
                                setQuantity={setQuantity}
                                nftPrice={1}
                                paymentCurrency={paymentCurrency}
                                setPaymentCurrency={setPaymentCurrency}
                                availableQuantity={5}
                                walletBalance={walletBalance}
                                walletFetchStatus={walletFetchStatus}
                                continueToNextStage={continueToNextStage}
                            />
                        )}

                        {stage === BuyingStage.APPROVE_AND_CONFIRM && (
                            <ApproveAndConfirmStage
                                isApproved={isApproved}
                                isApproving={false}
                                isConfirming={false}
                                handleApprove={() => setIsApproved(true)}
                                handleConfirm={handleConfirm}
                            />
                        )}

                        {stage === BuyingStage.CONFIRM && (
                            <ConfirmStage isConfirming={true} handleConfirm={handleConfirm} />
                        )}

                        {stage === BuyingStage.TX_CONFIRMED && (
                            <TransactionConfirmed txHash={confirmedTxHash} onDismiss={handleClose} />
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
})

export default BuyModal