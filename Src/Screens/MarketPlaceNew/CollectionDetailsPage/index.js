import React, { useState, useEffect } from 'react';
import { ScrollView, Animated, StyleSheet, Text, View } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import CollectionDetailsHeader from '../../../Componants/MarketPlace/CollectionDetailsHeader';
import NFTCard from '../../../Componants/MarketPlace/NFTCard';
import Spinner from '../../../Componants/MarketPlace/Spinner';
import TabButton from '../../../Componants/MarketPlace/TabButton';

const allNfts = [
    {
        id: 1,
        name: 'NFT 1',
        image: 'https://nfts-data.s3.me-central-1.amazonaws.com/nft_banner.png',
        price: '0.5 ETH',
        onSale: true,
    },
    {
        id: 2,
        name: 'NFT 2',
        image: 'https://nfts-data.s3.me-central-1.amazonaws.com/nft_banner.png',
        price: null,
        onSale: false,
    },
];

const onSaleNfts = allNfts.filter(nft => nft.onSale);

const CollectionDetailsPage = ({ route }) => {
    const { collectionId, collectionName } = route.params;
    const navigation = useNavigation();
    const [selectedTab, setSelectedTab] = useState('all');
    const [fadeAnim] = useState(new Animated.Value(0));
    const [imageLoaded, setImageLoaded] = useState(false);

    useEffect(() => {
        Animated.timing(fadeAnim, {
            toValue: 1,
            duration: 1000,
            useNativeDriver: true,
        }).start();
    }, []);


    const handleImageLoad = () => {
        setImageLoaded(true);
    };

    const handleTabChange = (tab) => {
        setSelectedTab(tab);
    };

    return (
        <ScrollView style={styles.container}>
            <CollectionDetailsHeader />

            <View style={styles.imageWrapper}>
                {!imageLoaded && <Spinner />}
                <Animated.Image
                    source={{ uri: 'https://nfts-data.s3.me-central-1.amazonaws.com/nft_banner.png' }}
                    style={[styles.bannerImage, { opacity: fadeAnim }]}
                    onLoad={handleImageLoad}
                />
            </View>


            <Animated.Text style={[styles.collectionName, { opacity: fadeAnim }]}>
                {collectionName || 'Collection Name'}
            </Animated.Text>


            <View style={styles.collectionDetails}>
                <Text style={styles.detailsHeader}>Collection Details</Text>

                <View style={styles.detailsRow}>
                    <Text style={styles.detailsLabel}>Symbol:</Text>
                    <Text style={styles.detailsValue}>VW2025</Text>
                </View>
                <View style={styles.detailsRow}>
                    <Text style={styles.detailsLabel}>Year:</Text>
                    <Text style={styles.detailsValue}>2025</Text>
                </View>
                <View style={styles.detailsRow}>
                    <Text style={styles.detailsLabel}>Country:</Text>
                    <Text style={styles.detailsValue}>Vietnam</Text>
                </View>
                <View style={styles.detailsRow}>
                    <Text style={styles.detailsLabel}>Type:</Text>
                    <Text style={styles.detailsValue}>Wind</Text>
                </View>
            </View>


            <View style={styles.tabsContainer}>
                <TabButton label="All" isSelected={selectedTab === 'all'} onPress={() => handleTabChange('all')} />
                <TabButton label="On Sale" isSelected={selectedTab === 'onsale'} onPress={() => handleTabChange('onsale')} />
            </View>


            <View style={styles.nftListContainer}>
                {selectedTab === 'all' && (
                    allNfts.length > 0 ? (
                        allNfts.map((nft) => <NFTCard key={nft.id} nft={nft} />)
                    ) : (
                        <Text style={styles.noNftsText}>No NFTs available in this collection</Text>
                    )
                )}

                {selectedTab === 'onsale' && (
                    onSaleNfts.length > 0 ? (
                        onSaleNfts.map((nft) => <NFTCard key={nft.id} nft={nft} />)
                    ) : (
                        <Text style={styles.noNftsText}>No NFTs for sale in this collection</Text>
                    )
                )}
            </View>
        </ScrollView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f9f9f9',
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'flex-start',
        paddingTop: 40,
        paddingLeft: 20,
        paddingBottom: 10,
    },
    backButton: {
        padding: 12,
        backgroundColor: '#4CAF50',
        borderRadius: 30,
        elevation: 5,
    },
    backButtonText: {
        color: '#fff',
        fontSize: 18,
    },
    imageWrapper: {
        position: 'relative',
    },
    imagePlaceholder: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: '#f0f0f0',
        justifyContent: 'center',
        alignItems: 'center',
    },
    bannerImage: {
        width: '100%',
        height: 250,
        resizeMode: 'cover',
        borderBottomLeftRadius: 30,
        borderBottomRightRadius: 30,
    },
    collectionName: {
        textAlign: 'center',
        fontSize: 30,
        fontWeight: 'bold',
        color: '#333',
        marginVertical: 15,
    },
    collectionDetails: {
        padding: 20,
        backgroundColor: '#fff',
        borderRadius: 15,
        marginHorizontal: 10,
        marginTop: 20,
        elevation: 5,
    },
    detailsHeader: {
        fontSize: 24,
        fontWeight: '600',
        marginBottom: 10,
        color: '#333',
    },
    detailsRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 12,
    },
    detailsLabel: {
        fontSize: 16,
        fontWeight: '600',
        color: '#555',
    },
    detailsValue: {
        fontSize: 16,
        color: '#333',
    },
    tabsContainer: {
        flexDirection: 'row',
        justifyContent: 'center',
        marginVertical: 15,
    },
    tabButton: {
        paddingVertical: 12,
        paddingHorizontal: 25,
        backgroundColor: '#f9f9f9',
        borderRadius: 30,
        marginHorizontal: 8,
        borderWidth: 1,
        borderColor: '#ddd',
    },
    selectedTab: {
        backgroundColor: '#4CAF50',
    },
    tabButtonText: {
        fontSize: 18,
        color: '#333',
    },
    nftListContainer: {
        paddingBottom: 20,
        alignItems: 'center',
    },
    nftCard: {
        width: '90%',
        marginBottom: 20,
        borderRadius: 15,
        overflow: 'hidden',
        backgroundColor: '#fff',
        elevation: 5,
    },
    nftImage: {
        width: '100%',
        height: 180,
        resizeMode: 'cover',
    },
    nftName: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#333',
        textAlign: 'center',
        marginTop: 10,
    },
    nftId: {
        fontSize: 14,
        color: '#777',
        textAlign: 'center',
        marginBottom: 8,
    },
    nftPrice: {
        fontSize: 16,
        color: '#4CAF50',
        textAlign: 'center',
        marginBottom: 10,
    },
    noNftsText: {
        fontSize: 18,
        color: '#777',
        textAlign: 'center',
        marginTop: 30,
    },

    tabButtonText: {
        fontSize: 18,
        color: '#333',
    },
    backButtonText: {
        color: '#fff',
        fontSize: 16,
    },
});

export default CollectionDetailsPage;
