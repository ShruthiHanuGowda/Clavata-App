import React from 'react';
import {
    View,
    Text,
    Image,
    StyleSheet,
    ScrollView,
    TouchableOpacity,
    Linking,
} from 'react-native';

const NFTDetailsPage = ({ route }) => {
    const { nft } = route.params;

    const owners = [
        { id: 1, price: '0.5', qty: 2, owner: '0x1234...abcd', isCurrentUser: false },
        { id: 2, price: '0.6', qty: 1, owner: '0xABCD...4567', isCurrentUser: true },
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
            explorer: 'https://explorer.com/tx/1',
        },
        {
            id: 2,
            event: 'Sale',
            price: '0.6',
            qty: 10,
            from: '0x2...bbb',
            to: '0x3...ccc',
            date: '2025-04-08',
            explorer: 'https://explorer.com/tx/2',
        },
    ];

    const openExplorer = (url) => Linking.openURL(url);

    return (
        <ScrollView style={styles.container}>
            {/* Header Section */}
            <View style={styles.header}>
                <View style={styles.left}>
                    <Text style={styles.title}>{nft.name}</Text>
                    {nft.description && (
                        <Text style={styles.description}>{nft.description}</Text>
                    )}
                    {nft.price && (
                        <Text style={styles.price}>💰 Price: {nft.price}</Text>
                    )}
                    <Text style={styles.qty}>📦 Quantity: {nft.quantity}</Text>
                    <TouchableOpacity style={styles.buyButton}>
                        <Text style={styles.buyButtonText}>Buy Now</Text>
                    </TouchableOpacity>
                </View>
                <Image source={{ uri: nft.image }} style={styles.nftImage} />
            </View>

            {/* Owners Section */}
            <Text style={styles.sectionTitle}>👑 Owners</Text>
            <View style={styles.card}>
                {owners.map((owner) => (
                    <View key={owner.id} style={styles.ownerRow}>
                        <View style={styles.ownerInfo}>
                            <Text style={styles.ownerText}>Price: {owner.price}</Text>
                            <Text style={styles.ownerText}>Qty: {owner.qty}</Text>
                            <Text style={styles.ownerText}>Owner:{owner.owner}</Text>
                        </View>
                        <TouchableOpacity
                            style={owner.isCurrentUser ? styles.sellButton : styles.buyButton}
                        >
                            <Text style={styles.buyButtonText}>
                                {owner.isCurrentUser ? 'Sell' : 'Buy'}
                            </Text>
                        </TouchableOpacity>
                    </View>
                ))}
            </View>

            {/* Contract Info */}
            <Text style={styles.sectionTitle}>📄 Contract Info</Text>
            <View style={styles.card}>
                <Text style={styles.contractText}>
                    Contract Address: 0xABC123...XYZ
                </Text>
                <Text style={styles.contractText}>
                    IPFS JSON: https://ipfs.io/ipfs/yourjsonhash
                </Text>
            </View>

            {/* Activity Section */}
            {/* Activity Section */}
            <Text style={styles.sectionTitle}>📊 Activity</Text>
            <View>
                {activities.map((item) => (
                    <View key={item.id} style={styles.activityCard}>
                        <View style={styles.activityCardHeader}>
                            <Text style={styles.activityEvent}>{item.event}</Text>
                            <TouchableOpacity onPress={() => openExplorer(item.explorer)}>
                                <Text style={styles.activityExplorer}>🌐 Explorer</Text>
                            </TouchableOpacity>
                        </View>

                        <View style={styles.activityRow}>
                            <Text style={styles.activityLabel}>Price:</Text>
                            <Text style={styles.activityValue}>{item.price}</Text>
                        </View>
                        <View style={styles.activityRow}>
                            <Text style={styles.activityLabel}>Quantity:</Text>
                            <Text style={styles.activityValue}>{item.qty}</Text>
                        </View>
                        <View style={styles.activityRow}>
                            <Text style={styles.activityLabel}>From:</Text>
                            <Text style={styles.activityValue}>{item.from}</Text>
                        </View>
                        <View style={styles.activityRow}>
                            <Text style={styles.activityLabel}>To:</Text>
                            <Text style={styles.activityValue}>{item.to}</Text>
                        </View>
                        <View style={styles.activityRow}>
                            <Text style={styles.activityLabel}>Date:</Text>
                            <Text style={styles.activityValue}>{item.date}</Text>
                        </View>
                    </View>
                ))}
            </View>
        </ScrollView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f9fafa',
        paddingTop: 50,
        paddingHorizontal: 15,

    },
    header: {
        flexDirection: 'row',
        backgroundColor: '#ffffff',
        borderRadius: 15,
        padding: 15,
        marginBottom: 20,
        elevation: 3,
    },
    left: {
        flex: 1,
        paddingRight: 10,
        justifyContent: 'center',
    },
    title: {
        fontSize: 24,
        fontWeight: '700',
        color: '#333',
    },
    description: {
        fontSize: 14,
        color: '#666',
        marginVertical: 5,
    },
    price: {
        fontSize: 16,
        color: '#2ecc71',
        marginVertical: 4,
    },
    qty: {
        fontSize: 14,
        color: '#888',
        marginBottom: 10,
    },
    buyButton: {
        backgroundColor: '#3498db',
        paddingVertical: 8,
        paddingHorizontal: 20,
        borderRadius: 25,
        alignSelf: 'flex-start',
    },
    sellButton: {
        backgroundColor: '#f39c12',
        paddingVertical: 8,
        paddingHorizontal: 20,
        borderRadius: 25,
        alignSelf: 'center',
    },
    buyButtonText: {
        color: '#fff',
        fontWeight: '600',
        fontSize: 14,
    },
    nftImage: {
        width: 120,
        height: 120,
        borderRadius: 12,
        backgroundColor: '#eee',
    },
    sectionTitle: {
        fontSize: 20,
        fontWeight: '600',
        marginBottom: 10,
        color: '#2c3e50',
    },
    card: {
        backgroundColor: '#ffffff',
        borderRadius: 12,
        padding: 15,
        marginBottom: 20,
        elevation: 2,
    },
    ownerRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 15,
        borderBottomColor: '#eee',
        borderBottomWidth: 1,
        paddingBottom: 10,
    },
    ownerInfo: {
        flex: 1,
    },
    ownerText: {
        fontSize: 14,
        color: '#34495e',
        marginBottom: 3,
    },
    contractText: {
        fontSize: 13,
        color: '#555',
        marginBottom: 5,
    },
    activityCard: {
        backgroundColor: '#fff',
        borderRadius: 12,
        padding: 15,
        marginBottom: 15,
        elevation: 2,
        shadowColor: '#000',
        shadowOpacity: 0.05,
        shadowRadius: 5,
        shadowOffset: { width: 0, height: 2 },
    },
    activityCardHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 10,
    },
    activityEvent: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#34495e',
    },
    activityExplorer: {
        fontSize: 12,
        color: '#3498db',
        textDecorationLine: 'underline',
    },
    activityRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        paddingVertical: 4,
    },
    activityLabel: {
        fontSize: 14,
        color: '#777',
        fontWeight: '600',
        width: '30%',
    },
    activityValue: {
        fontSize: 14,
        color: '#2c3e50',
        width: '70%',
        textAlign: 'right',
    },
});

export default NFTDetailsPage;