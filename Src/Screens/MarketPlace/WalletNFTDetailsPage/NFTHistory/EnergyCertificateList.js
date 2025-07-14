import React from 'react';
import {
  View,
  Text,
  FlatList,
  Image,
  StyleSheet,
  TouchableOpacity,
  Dimensions,
} from 'react-native';

const {width} = Dimensions.get('window');

const EnergyCertificateItem = ({item, onPress}) => {
  console.log('🚀 ~ EnergyCertificateItem ~ item:', item);
  // Helper function to format numbers with commas
  const formatNumber = num => {
    return new Intl.NumberFormat().format(num);
  };

  // Helper function to get specific attribute value
  const getAttributeValue = traitType => {
    const attribute = item.attributes?.find(
      attr => attr.trait_type === traitType,
    );
    return attribute?.value || 'N/A';
  };

  return (
    <TouchableOpacity style={styles.card} onPress={() => onPress?.(item)}>
      {/* Header with images */}
      <View style={styles.header}>
        <View style={styles.imageContainer}>
          {item.country_image && (
            <Image
              source={{uri: item.country_image}}
              style={styles.countryFlag}
            />
          )}
          {item.energy_type_image && (
            <Image
              source={{uri: item.energy_type_image}}
              style={styles.energyIcon}
            />
          )}
        </View>
        <View style={styles.headerText}>
          <Text style={styles.title} numberOfLines={2}>
            {item.name}
          </Text>
          <Text style={styles.tokenId}>Token ID: {item.tokenId}</Text>
        </View>
      </View>

      {/* Main Image */}
      {item.image?.original && (
        <Image source={{uri: item.image.original}} style={styles.mainImage} />
      )}

      {/* Certificate Details */}
      <View style={styles.details}>
        <Text style={styles.description} numberOfLines={3}>
          {item.description}
        </Text>

        {/* Key Attributes Grid */}
        <View style={styles.attributesGrid}>
          <View style={styles.attributeItem}>
            <Text style={styles.attributeLabel}>Energy Type</Text>
            <Text style={styles.attributeValue}>
              {getAttributeValue('Energy Type')}
            </Text>
          </View>
          <View style={styles.attributeItem}>
            <Text style={styles.attributeLabel}>Country</Text>
            <Text style={styles.attributeValue}>
              {getAttributeValue('Country')}
            </Text>
          </View>
          <View style={styles.attributeItem}>
            <Text style={styles.attributeLabel}>Volume</Text>
            <Text style={styles.attributeValue}>
              {formatNumber(getAttributeValue('Volume (MWh)'))} MWh
            </Text>
          </View>
          <View style={styles.attributeItem}>
            <Text style={styles.attributeLabel}>Year</Text>
            <Text style={styles.attributeValue}>
              {getAttributeValue('Year')}
            </Text>
          </View>
        </View>

        {/* Facility Information */}
        <View style={styles.facilityInfo}>
          <Text style={styles.facilityLabel}>Facility</Text>
          <Text style={styles.facilityName} numberOfLines={2}>
            {getAttributeValue('Facility Name')}
          </Text>
        </View>

        {/* Production Dates */}
        <View style={styles.datesContainer}>
          <View style={styles.dateItem}>
            <Text style={styles.dateLabel}>Production Period</Text>
            <Text style={styles.dateValue}>
              {getAttributeValue('Production Start Date')} -{' '}
              {getAttributeValue('Production End Date')}
            </Text>
          </View>
        </View>

        {/* Market Data */}
        {item.marketData && (
          <View style={styles.marketData}>
            <Text style={styles.marketLabel}>Available Quantity</Text>
            <Text style={styles.marketValue}>
              {formatNumber(item.marketData.quantity)}
            </Text>
          </View>
        )}

        {/* Location Status */}
        <View style={styles.footer}>
          <View
            style={[
              styles.statusBadge,
              item.location === 'In Wallet'
                ? styles.inWallet
                : styles.otherStatus,
            ]}>
            <Text style={styles.statusText}>{item.location || 'Unknown'}</Text>
          </View>
          <Text style={styles.standardText}>
            Standard: {getAttributeValue('Standard')}
          </Text>
        </View>
      </View>
    </TouchableOpacity>
  );
};

const EnergyCertificateList = ({data, onItemPress, refreshing, onRefresh}) => {
  console.log('🚀 ~ EnergyCertificateList ~ data:', data);
  const renderItem = ({item}) => (
    <EnergyCertificateItem item={item} onPress={onItemPress} />
  );

  const keyExtractor = item =>
    item.tokenId?.toString() || Math.random().toString();

  return (
    <FlatList
      data={data}
      renderItem={renderItem}
      keyExtractor={keyExtractor}
      style={styles.container}
      showsVerticalScrollIndicator={false}
      refreshing={refreshing}
      onRefresh={onRefresh}
      ItemSeparatorComponent={() => <View style={styles.separator} />}
      contentContainerStyle={styles.listContent}
    />
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  listContent: {
    padding: 16,
  },
  separator: {
    height: 16,
  },
  card: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  imageContainer: {
    flexDirection: 'row',
    marginRight: 12,
  },
  countryFlag: {
    width: 32,
    height: 24,
    borderRadius: 4,
    marginRight: 8,
  },
  energyIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
  },
  headerText: {
    flex: 1,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4,
  },
  tokenId: {
    fontSize: 12,
    color: '#666',
  },
  mainImage: {
    width: '100%',
    height: 150,
    borderRadius: 8,
    marginBottom: 12,
  },
  details: {
    gap: 12,
  },
  description: {
    fontSize: 14,
    color: '#555',
    lineHeight: 20,
  },
  attributesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  attributeItem: {
    width: (width - 64) / 2,
    backgroundColor: '#f8f9fa',
    padding: 12,
    borderRadius: 8,
  },
  attributeLabel: {
    fontSize: 12,
    color: '#666',
    marginBottom: 4,
  },
  attributeValue: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
  },
  facilityInfo: {
    backgroundColor: '#e8f4fd',
    padding: 12,
    borderRadius: 8,
  },
  facilityLabel: {
    fontSize: 12,
    color: '#1976d2',
    marginBottom: 4,
  },
  facilityName: {
    fontSize: 14,
    fontWeight: '500',
    color: '#1976d2',
  },
  datesContainer: {
    backgroundColor: '#f0f7ff',
    padding: 12,
    borderRadius: 8,
  },
  dateItem: {
    gap: 4,
  },
  dateLabel: {
    fontSize: 12,
    color: '#666',
  },
  dateValue: {
    fontSize: 14,
    fontWeight: '500',
    color: '#333',
  },
  marketData: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#fff3e0',
    padding: 12,
    borderRadius: 8,
  },
  marketLabel: {
    fontSize: 14,
    color: '#f57c00',
  },
  marketValue: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#f57c00',
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  inWallet: {
    backgroundColor: '#e8f5e8',
  },
  otherStatus: {
    backgroundColor: '#f5f5f5',
  },
  statusText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#2e7d32',
  },
  standardText: {
    fontSize: 12,
    color: '#666',
  },
});

export default EnergyCertificateList;
