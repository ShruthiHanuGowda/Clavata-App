import React, { useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    ScrollView,
    RefreshControl,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import TabButton from '../../../Componants/MarketPlace/TabButton';
import NFTCard from '../../../Componants/MarketPlace/NFTCard';

const sampleNFTs = [
    {
        id: 1,
        name: 'Cool NFT 1',
        image: 'https://nfts-data.s3.me-central-1.amazonaws.com/nft_banner.png',
        price: '1.2',
        quantity: 1,
        icon: 'https://raw.githubusercontent.com/piteasio/app-tokens/main/token-logo/0x15D38573d2feeb82e7ad5187aB8c1D52810B1f07.png',
        isListed: false,
    },
    {
        id: 2,
        name: 'Cool NFT 2',
        image: 'https://nfts-data.s3.me-central-1.amazonaws.com/nft_banner.png',
        price: '2.0',
        quantity: 1,
        isListed: true,
        icon: 'https://raw.githubusercontent.com/piteasio/app-tokens/main/token-logo/0x15D38573d2feeb82e7ad5187aB8c1D52810B1f07.png',
    },
];

const YourNFTsScreen = () => {
    const [selectedTab, setSelectedTab] = useState('all');
    const [walletConnected, setWalletConnected] = useState(true);
    const [refreshing, setRefreshing] = useState(false);

    const filteredNFTs = sampleNFTs.filter((nft) => {
        if (selectedTab === 'wallet') return !nft.isListed;
        if (selectedTab === 'sale') return nft.isListed;
        return true;
    });

    const onRefresh = () => {
        setRefreshing(true);
        // Simulate fetch logic (replace this with actual data call if needed)
        setTimeout(() => {
            setRefreshing(false);
        }, 1500);
    };

    return (
        <SafeAreaView style={styles.safeArea}>
            <View style={styles.container}>
                <Text style={styles.headerTitle}>Your NFTs</Text>

                {!walletConnected ? (
                    <TouchableOpacity style={styles.connectButton}>
                        <Text style={styles.connectButtonText}>Connect Wallet</Text>
                    </TouchableOpacity>
                ) : (
                    <>
                        <View style={styles.tabs}>
                            <TabButton
                                label="All"
                                isSelected={selectedTab === 'all'}
                                onPress={() => setSelectedTab('all')}
                            />
                            <TabButton
                                label="In Wallet"
                                isSelected={selectedTab === 'wallet'}
                                onPress={() => setSelectedTab('wallet')}
                            />
                            <TabButton
                                label="On Sale"
                                isSelected={selectedTab === 'sale'}
                                onPress={() => setSelectedTab('sale')}
                            />
                        </View>

                        <ScrollView
                            contentContainerStyle={styles.nftGrid}
                            refreshControl={
                                <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
                            }
                        >
                            {filteredNFTs.length > 0 ? (
                                filteredNFTs.map((nft) => (
                                    <NFTCard key={nft.id} nft={nft} />
                                ))
                            ) : (
                                <Text style={styles.emptyText}>No NFTs in this category</Text>
                            )}
                        </ScrollView>
                    </>
                )}
            </View>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    safeArea: {
        flex: 1,
        backgroundColor: '#f9f9f9',
    },
    container: {
        flex: 1,
        backgroundColor: '#f9f9f9',
        paddingHorizontal: 10,
    },
    headerTitle: {
        fontSize: 24,
        fontWeight: 'bold',
        marginVertical: 15,
        textAlign: 'center',
        color: '#333',
    },
    connectButton: {
        marginTop: 50,
        backgroundColor: '#0066ff',
        padding: 15,
        borderRadius: 10,
        alignItems: 'center',
    },
    connectButtonText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: '600',
    },
    tabs: {
        flexDirection: 'row',
        justifyContent: 'center',
        marginBottom: 15,
    },
    nftGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'space-between',
    },
    emptyText: {
        fontSize: 16,
        color: '#777',
        textAlign: 'center',
        marginTop: 30,
        width: '100%',
    },
});

export default YourNFTsScreen;