import React, { useState, useEffect } from 'react';
import {
    ScrollView,
    Animated,
    StyleSheet,
    Text,
    View,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import CollectionDetailsHeader from '../../../Componants/MarketPlace/CollectionDetailsHeader';
import NFTCard from '../../../Componants/MarketPlace/NFTCard';
import Spinner from '../../../Componants/MarketPlace/Spinner';
import TabButton from '../../../Componants/MarketPlace/TabButton';
import { SafeAreaView } from 'react-native-safe-area-context';

const allNfts = [
    {
        id: 1,
        name: 'NFT #1',
        image: 'https://nfts-data.s3.me-central-1.amazonaws.com/nft_banner.png',
        price: '0.5',
        icon: 'https://raw.githubusercontent.com/piteasio/app-tokens/main/token-logo/0x15D38573d2feeb82e7ad5187aB8c1D52810B1f07.png',
        quantity: 20,
    },
    {
        id: 2,
        name: 'NFT #2',
        image: 'https://nfts-data.s3.me-central-1.amazonaws.com/nft_banner.png',
        icon: 'https://raw.githubusercontent.com/piteasio/app-tokens/main/token-logo/0x15D38573d2feeb82e7ad5187aB8c1D52810B1f07.png',
        price: 2.50,
        quantity: 5,
    },
];

const CollectionDetailsPage = ({ route }) => {
    const { collectionName } = route.params;
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

    return (
        <SafeAreaView style={styles.safeArea}>
            <ScrollView style={styles.container}>

                <View style={styles.imageWrapper}>
                    {!imageLoaded && (
                        <View style={styles.imagePlaceholder}>
                            <Spinner />
                        </View>
                    )}
                    <Animated.Image
                        source={{ uri: 'https://nfts-data.s3.me-central-1.amazonaws.com/nft_banner.png' }}
                        style={[styles.bannerImage, { opacity: fadeAnim }]}
                        onLoad={() => setImageLoaded(true)}
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


                <View style={styles.nftListContainer}>
                    <Text style={styles.nftSectionTitle}>NFTs</Text>
                    <View style={styles.nftGrid}>
                        {allNfts.length > 0 ? (
                            allNfts.map((nft) => <NFTCard key={nft.id} nft={nft} />)
                        ) : (
                            <Text style={styles.noNftsText}>No NFTs in this category</Text>
                        )}
                    </View>
                </View>
            </ScrollView>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    safeArea: {
        flex: 1,
        backgroundColor: '#f9f9f9'
    },
    container: {
        flex: 1,
        backgroundColor: '#f9f9f9',
    },
    imageWrapper: {
        position: 'relative',
    },
    imagePlaceholder: {
        position: 'absolute',
        top: 0, left: 0, right: 0, bottom: 0,
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
    nftListContainer: {
        paddingBottom: 20,
        alignItems: 'center',
        marginTop: 20,
    },
    nftSectionTitle: {
        fontSize: 20,
        fontWeight: '600',
        color: '#333',
        marginBottom: 10,
    },
    nftGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'space-between',
        paddingHorizontal: 5,
    },
    noNftsText: {
        fontSize: 16,
        color: '#777',
        textAlign: 'center',
        marginTop: 30,
    },
});

export default CollectionDetailsPage;