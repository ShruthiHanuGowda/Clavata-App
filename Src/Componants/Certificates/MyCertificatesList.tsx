import React from 'react';
import {
  ScrollView,
  View,
  StyleSheet,
  ActivityIndicator,
  Text,
} from 'react-native';
import MyCertificateCard from './MyCertificateCard';
import {NftToken} from '../../types/types';
import {fontsFamily} from '../../Theme';

interface Props {
  nfts: NftToken[];
  isLoading: boolean;
  containerStyle?: object;
  refresh: () => void;
}

const groupByCountry = (nfts: NftToken[]) => {
  return nfts.reduce((acc, nft) => {
    console.log('nft', nft?.year);

    const country = nft?.country || 'Unknown';
    if (!acc[country]) {
      acc[country] = [];
    }
    acc[country].push(nft);
    return acc;
  }, {} as Record<string, NftToken[]>);
};

const MyCertificatesList = ({
  nfts,
  isLoading,
  refresh,
  containerStyle,
}: Props) => {
  const groupedNfts = groupByCountry(nfts);

  if (isLoading) {
    return <ActivityIndicator size="large" color="#007AFF" />;
  }

  return (
    <ScrollView>
      {Object.entries(groupedNfts).map(([country, countryNfts]) => (
        <View key={country} style={[styles.groupContainer, containerStyle]}>
          <Text style={styles.countryTitle}>{country}</Text>
          {countryNfts.map(nft => (
            <MyCertificateCard
              key={`${nft.tokenId}-${nft.collectionAddress}`}
              nft={nft}
              refresh={refresh}
              containerStyle={containerStyle}
            />
          ))}
        </View>
      ))}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  groupContainer: {
    marginBottom: 5,
  },
  countryTitle: {
    fontFamily: fontsFamily.MulishBold,
    fontSize: 16,
    marginBottom: 10,
    color: '#2D2D2D',
    backgroundColor: '#F5F5F5',
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderRadius: 8,
  },
});

export default MyCertificatesList;
