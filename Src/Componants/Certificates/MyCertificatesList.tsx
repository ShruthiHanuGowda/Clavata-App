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
  Image,
} from 'react-native';
import MyCertificateCard from './MyCertificateCard';
import { NftToken } from '../../types/types';
import { fontsFamily } from '../../Theme';
import { formatQuantityMWh, getCountryFlag } from '../../utils';

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
  console.log("nfts", nfts);

  const groupedNfts = groupByCountry(nfts);
  const [openCountries, setOpenCountries] = useState<Record<string, boolean>>(
    {},
  );
  const [imageErrors, setImageErrors] = useState<Record<string, boolean>>({});

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

  // Helper function to get country flag image from the first NFT of each country
  const getCountryImage = (countryNfts: NftToken[]) => {
    return countryNfts[0]?.country_image;
  };

  // Helper function to validate URL
  const isValidUrl = (url: string) => {
    try {
      new URL(url);
      return true;
    } catch {
      return false;
    }
  };

  const handleImageError = (country: string) => {
    setImageErrors(prev => ({
      ...prev,
      [country]: true,
    }));
  };

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size='small' color="#009D94" />
      </View>
    );
  }

  return (
    <ScrollView contentContainerStyle={styles.scrollContainer}>
      {Object.entries(groupedNfts).map(([country, countryNfts]) => {
        const isOpen = openCountries[country] ?? false;
        const countryImageUrl = getCountryImage(countryNfts);
        console.log(`Country: ${country}, NFTs: ${countryNfts.length}`);

        return (
          <View key={country} style={[styles.groupContainer, containerStyle]}>
            <TouchableOpacity
              onPress={() => toggleCountry(country)}
              style={styles.headerContainer}>
              <View style={styles.headerLeft}>
                <View style={styles.flagContainer}>
                  {countryImageUrl && isValidUrl(countryImageUrl) && !imageErrors[country] ? (
                    <Image
                      source={{ uri: countryImageUrl }}
                      style={styles.flag}
                      resizeMode="contain"
                      onError={() => handleImageError(country)}
                    />
                  ) : (
                    <Text style={styles.flagEmoji}>{getCountryFlag(country)}</Text>
                  )}
                </View>
                <View style={styles.headerTextContainer}>
                  <Text style={styles.countryTitle}>{country}</Text>
                  <Text style={styles.subTitle}>
                    {countryNfts.length} Certificates • Total:{' '}
                    {formatQuantityMWh(getTotalQuantity(countryNfts))}
                  </Text>
                </View>
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
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  flagContainer: {
    width: 32,
    height: 32,
    backgroundColor: '#FFFFFF',
    borderRadius: 6,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  flag: {
    width: 18,
    height: 18,
    borderRadius: 2,
  },
  flagEmoji: {
    fontSize: 18,
  },
  headerTextContainer: {
    flex: 1,
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
    paddingHorizontal: 2,
    paddingBottom: 10,
    backgroundColor: '#fff',
  },
});

export default MyCertificatesList;