import React, { useState } from 'react';
import { ScrollView, Text, StyleSheet } from 'react-native';
import NFTHeader from '../../../Componants/MarketPlace/NFTHeader';
import OwnerList from '../../../Componants/MarketPlace/OwnerList';
import ContractInfo from '../../../Componants/MarketPlace/ContractInfo';
import ActivityList from '../../../Componants/MarketPlace/ActivityList';
import BuyModal from '../../../Componants/MarketPlace/BuySellModal/BuyModal';
import SellModal from '../../../Componants/MarketPlace/BuySellModal/SellModal';

const NFTDetailsScreen = ({ route }) => {
    const { nft } = route.params;
    const [isBuyModalVisible, setIsBuyModalVisible] = useState(false);
    const [isSellModalVisible, setIsSellModalVisible] = useState(false)

    const owners = [
        { id: 1, price: '0.5', qty: 2, owner: '0x1234...abcd', isCurrentUser: false },
        { id: 2, price: null, qty: 1, owner: '0xABCD...4567', isCurrentUser: true },
    ];

    const activities = [
        {
            id: 1,
            event: 'Transfer',
            price: '0.5',
            qty: 1,
            from: '0x1...aaa',
            to: '0x2...bbb',
            date: '2025-04-09',
            explorer: 'https://explorernew.denergytestnet.com/tx/0x087d07eb487c3eb2c717766bb4cf8242d83ed7b7d1b55e7d4618f09adb18f937',
        },
        {
            id: 2,
            event: 'Sale',
            price: '0.6',
            qty: 10,
            from: '0x2...bbb',
            to: '0x3...ccc',
            date: '2025-04-08',
            explorer: 'https://explorernew.denergytestnet.com/tx/0x087d07eb487c3eb2c717766bb4cf8242d83ed7b7d1b55e7d4618f09adb18f937',
        },
    ];

    const handleBuyConfirm = () => {
        console.log('Buy confirmed!');
        setIsBuyModalVisible(false);
    };

    return (
        <>
            <ScrollView style={styles.container}>
                <NFTHeader nft={nft} onBuyPress={() => setIsBuyModalVisible(true)} />

                <Text style={styles.sectionTitle}>👑 Owners</Text>
                <OwnerList owners={owners} onBuyPress={() => setIsBuyModalVisible(true)} onSellPress={() => setIsSellModalVisible(true)} />

                <Text style={styles.sectionTitle}>📄 Contract Info</Text>
                <ContractInfo />

                <Text style={styles.sectionTitle}>📊 Activity</Text>
                <ActivityList activities={activities} />
            </ScrollView>
            <BuyModal
                visible={isBuyModalVisible}
                onClose={() => setIsBuyModalVisible(false)}
                onConfirm={handleBuyConfirm}
                nftToBuy={nft}
            />
            <SellModal
                visible={isSellModalVisible}
                onClose={() => setIsSellModalVisible(false)}
                nftToSell={nft}
            />
        </>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f9fafa',
        paddingTop: 50,
        paddingHorizontal: 15,
    },
    sectionTitle: {
        fontSize: 20,
        fontWeight: '600',
        marginBottom: 10,
        color: '#2c3e50',
    },
});

export default NFTDetailsScreen;