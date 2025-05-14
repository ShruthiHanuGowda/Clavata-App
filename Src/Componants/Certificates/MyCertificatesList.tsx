import React from 'react';
import {ScrollView, View, StyleSheet, ActivityIndicator} from 'react-native';
import MyCertificateCard from './MyCertificateCard';
import {NftToken} from '../../types/types';

interface Props {
  nfts: NftToken[];
  isLoading: boolean;
  containerStyle?: object;
  refresh: () => void;
}

const MyCertificatesList = ({
  nfts,
  isLoading,
  refresh,
  containerStyle,
}: Props) => {
  return (
    <View>
      {isLoading ? (
        <ActivityIndicator size="large" color="#007AFF" />
      ) : (
        <>
          {nfts.map(nft => (
            <MyCertificateCard
              key={`${nft.tokenId}-${nft.collectionAddress}`}
              nft={nft}
              refresh={refresh}
              containerStyle={containerStyle}
            />
          ))}
        </>
      )}
    </View>
  );
};

export default MyCertificatesList;
