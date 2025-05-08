import React from 'react';
import {ScrollView, View, StyleSheet, ActivityIndicator} from 'react-native';
import MyCertificateCard from './MyCertificateCard';
import {NftToken} from '../../types/types';

interface Props {
  nfts: NftToken[];
  isLoading: boolean;
}

const MyCertificatesList = ({nfts, isLoading}: Props) => {
  return (
    <View>
      {isLoading ? (
        <ActivityIndicator size="large" color="#007AFF" />
      ) : (
        <ScrollView contentContainerStyle={styles.scrollContainer}>
          {nfts.map(nft => (
            <MyCertificateCard
              key={`${nft.tokenId}-${nft.collectionAddress}`}
              nft={nft}
            />
          ))}
        </ScrollView>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  scrollContainer: {
    paddingHorizontal: 2,
  },
});

export default MyCertificatesList;
