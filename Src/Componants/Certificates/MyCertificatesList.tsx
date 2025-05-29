import React, { useState } from 'react';
import {
  ScrollView,
  View,
  StyleSheet,
  ActivityIndicator,
  Text,
  TouchableOpacity,
  LayoutAnimation,
  Platform,
  UIManager,
} from 'react-native';
import MyCertificateCard from './MyCertificateCard';
import { NftToken } from '../../types/types';
import { fontsFamily } from '../../Theme';
import { formatQuantityMWh } from '../../utils';
import Icon from 'react-native-vector-icons/MaterialIcons'; // Ensure this library is installed

interface Props {
  nfts: NftToken[];
  isLoading: boolean;
  containerStyle?: object;
  refresh: () => void;
}

const groupByCountry = (nfts: NftToken[]) => {
  return nfts.reduce((acc, nft) => {
    const country = nft?.country || 'Unknown';
    if (!acc[country]) {
      acc[country] = [];
    }
    acc[country].push(nft);
    return acc;
  }, {} as Record<string, NftToken[]>);
};

if (
  Platform.OS === 'android' &&
  UIManager.setLayoutAnimationEnabledExperimental
) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

const MyCertificatesList = ({
  nfts,
  isLoading,
  refresh,
  containerStyle,
}: Props) => {
  const groupedNfts = groupByCountry(nfts);
  const [openCountries, setOpenCountries] = useState<Record<string, boolean>>(
    {},
  );

  const toggleCountry = (country: string) => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setOpenCountries(prev => ({
      ...prev,
      [country]: !prev[country],
    }));
  };

  const getTotalQuantity = (nfts: NftToken[]) => {
    return nfts.reduce((sum, nft) => {
      const qty = parseFloat(String(nft?.marketData?.quantity ?? '0'));
      return sum + (isNaN(qty) ? 0 : qty);
    }, 0);
  };

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#007AFF" />
      </View>
    );
  }

  return (
    <ScrollView contentContainerStyle={styles.scrollContainer}>
      {Object.entries(groupedNfts).map(([country, countryNfts]) => {
        const isOpen = openCountries[country] ?? false;

        return (
          <View key={country} style={[styles.groupContainer, containerStyle]}>
            <TouchableOpacity
              onPress={() => toggleCountry(country)}
              style={styles.headerContainer}>
              <View>
                <Text style={styles.countryTitle}>{country}</Text>
                <Text style={styles.subTitle}>
                  {countryNfts.length} Certificates • Total:{' '}
                  {formatQuantityMWh(getTotalQuantity(countryNfts))}
                </Text>
              </View>
              <Text style={styles.toggleIcon}>{isOpen ? '▲' : '▼'}</Text>
            </TouchableOpacity>

            {isOpen && (
              <View style={styles.nftList}>
                {countryNfts.map(nft => (
                  <MyCertificateCard
                    key={`${nft.tokenId}-${nft.collectionAddress}`}
                    nft={nft}
                    refresh={refresh}
                    containerStyle={containerStyle}
                  />
                ))}
              </View>
            )}
          </View>
        );
      })}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  scrollContainer: {
    // padding: 10,
    paddingBottom: 20,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  groupContainer: {
    marginBottom: 12,
    backgroundColor: '#fff',
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  headerContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#F0F4F7',
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderTopLeftRadius: 12,
    borderTopRightRadius: 12,
  },
  countryTitle: {
    fontFamily: fontsFamily.MulishBold,
    fontSize: 17,
    color: '#2D2D2D',
  },
  subTitle: {
    fontSize: 13,
    color: '#6A6A6A',
    marginTop: 2,
  },
  toggleIcon: {
    fontSize: 16,
    color: '#555',
  },
  nftList: {
    paddingHorizontal: 12,
    paddingBottom: 10,
    backgroundColor: '#fff',
  },
});

export default MyCertificatesList;
