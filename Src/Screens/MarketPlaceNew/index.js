import React, { useState } from 'react';
import { SafeAreaView, ScrollView, RefreshControl, StyleSheet, View } from 'react-native';
import { navigate } from '../../Navigation/NavigationFunctions';
import ListingHeader from '../../Componants/MarketPlace/ListingHeader';
import CollectionCard from '../../Componants/MarketPlace/CollectionCard';

const CollectionListingPage = () => {
    const [refreshing, setRefreshing] = useState(false);

    const collections = [
        {
            id: 1,
            bannerImage: 'https://nfts-data.s3.me-central-1.amazonaws.com/nft_banner.png',
            collectionName: 'India Hydroelectric 2025',
            symbol: 'IH2025',
        },
        {
            id: 2,
            bannerImage: 'https://nfts-data.s3.me-central-1.amazonaws.com/nft_banner.png',
            collectionName: 'Brazil Wind 2024',
            symbol: 'BW2024',
        },
        {
            id: 3,
            bannerImage: 'https://nfts-data.s3.me-central-1.amazonaws.com/nft_banner.png',
            collectionName: 'Turkey Hydroelectric 2025',
            symbol: 'TH2025',
        },
        {
            id: 4,
            bannerImage: 'https://nfts-data.s3.me-central-1.amazonaws.com/nft_banner.png',
            collectionName: 'Chile Hydroelectric 2025',
            symbol: 'CH2025',
        },
        {
            id: 5,
            bannerImage: 'https://nfts-data.s3.me-central-1.amazonaws.com/nft_banner.png',
            collectionName: 'India Wind 2025',
            symbol: 'IW2025',
        },
        {
            id: 6,
            bannerImage: 'https://nfts-data.s3.me-central-1.amazonaws.com/nft_banner.png',
            collectionName: 'Thailand Solar 2025',
            symbol: 'TS2025',
        },
    ];

    // Handle pull to refresh action
    const onRefresh = () => {
        setRefreshing(true);
        setTimeout(() => {
            setRefreshing(false);
        }, 2000);
    };

    return (
        <SafeAreaView style={styles.container}>
            <ListingHeader title="Collections" />


            <ScrollView
                contentContainerStyle={styles.gridContainer}
                refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
            >

                {collections.map((collection, index) => {
                    if (index % 2 === 0) {
                        return (
                            <View key={collection.id} style={styles.row}>
                                <CollectionCard
                                    collection={collection}
                                    onPress={() => navigate('collectionDetails', { collectionId: collection.id, collectionName: collection.collectionName })}
                                />
                                {collections[index + 1] && (
                                    <CollectionCard
                                        collection={collections[index + 1]}
                                        onPress={() => navigate('collectionDetails', { collectionId: collections[index + 1].id, collectionName: collections[index + 1].collectionName })}
                                    />
                                )}
                            </View>
                        );
                    }
                    return null;
                })}
            </ScrollView>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f2f2f2',
    },
    gridContainer: {
        padding: 10,
    },
    row: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 10,
    },
});

export default CollectionListingPage;


// import React, { useState } from 'react';
// import { SafeAreaView, FlatList, RefreshControl, StyleSheet, View } from 'react-native';
// import { navigate } from '../../Navigation/NavigationFunctions';
// import ListingHeader from '../../Componants/MarketPlace/ListingHeader';
// import CollectionCard from '../../Componants/MarketPlace/CollectionCard';

// const CollectionListingPage = () => {
//     const [refreshing, setRefreshing] = useState(false);

//     const collections = [
//         {
//             id: 1,
//             bannerImage: 'https://nfts-data.s3.me-central-1.amazonaws.com/nft_banner.png',
//             collectionName: 'India Hydroelectric 2025',
//             symbol: 'IH2025',
//         },
//         {
//             id: 2,
//             bannerImage: 'https://nfts-data.s3.me-central-1.amazonaws.com/nft_banner.png',
//             collectionName: 'Brazil Wind 2024',
//             symbol: 'BW2024',
//         },
//         {
//             id: 3,
//             bannerImage: 'https://nfts-data.s3.me-central-1.amazonaws.com/nft_banner.png',
//             collectionName: 'Turkey Hydroelectric 2025',
//             symbol: 'TH2025',
//         },
//         {
//             id: 4,
//             bannerImage: 'https://nfts-data.s3.me-central-1.amazonaws.com/nft_banner.png',
//             collectionName: 'Chile Hydroelectric 2025',
//             symbol: 'CH2025',
//         },
//         {
//             id: 5,
//             bannerImage: 'https://nfts-data.s3.me-central-1.amazonaws.com/nft_banner.png',
//             collectionName: 'India Wind 2025',
//             symbol: 'IW2025',
//         },
//         {
//             id: 6,
//             bannerImage: 'https://nfts-data.s3.me-central-1.amazonaws.com/nft_banner.png',
//             collectionName: 'Thailand Solar 2025',
//             symbol: 'TS2025',
//         },
//     ];

//     // Handle pull to refresh action
//     const onRefresh = () => {
//         setRefreshing(true);
//         setTimeout(() => {
//             setRefreshing(false);
//         }, 2000);
//     };

//     const renderItem = ({ item }) => (
//         <CollectionCard
//             collection={item}
//             onPress={() => navigate('collectionDetails', { collectionId: item.id, collectionName: item.collectionName })}
//         />
//     );

//     return (
//         <SafeAreaView style={styles.container}>

//             <ListingHeader title="Collections" />


//             <FlatList
//                 data={collections}
//                 renderItem={renderItem}
//                 keyExtractor={(item) => item.id.toString()}
//                 numColumns={2}
//                 contentContainerStyle={styles.gridContainer}
//                 refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
//                 showsVerticalScrollIndicator={false}
//             />
//         </SafeAreaView>
//     );
// };

// const styles = StyleSheet.create({
//     container: {
//         flex: 1,
//         backgroundColor: '#f2f2f2',
//     },
//     gridContainer: {
//         padding: 10,
//     },
// });

// export default CollectionListingPage;

