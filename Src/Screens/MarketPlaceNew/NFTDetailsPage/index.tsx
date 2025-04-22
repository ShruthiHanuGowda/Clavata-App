import React, {useState, useEffect} from 'react';
import {ScrollView, Text, StyleSheet, View} from 'react-native';
import NFTHeader from '../../../Componants/MarketPlace/NFTHeader';
import OwnerList from '../../../Componants/MarketPlace/OwnerList';
import ContractInfo from '../../../Componants/MarketPlace/ContractInfo';
import ActivityList from '../../../Componants/MarketPlace/ActivityList';
import BuyModal from '../../../Componants/MarketPlace/BuySellModal/BuyModal';
import SellModal from '../../../Componants/MarketPlace/BuySellModal/SellModal';
import {NftToken} from '../../../types/types';
import {useCompleteNft} from '../../../hooks/useCompleteNft';
import useNftActivity from '../../../hooks/useNftActivity';

interface NFTDetailsScreenProps {
  route: {
    params: {
      nft: any;
    };
  };
}

const NFTDetailsScreen: React.FC<NFTDetailsScreenProps> = ({route}) => {
  const {nft}: {nft: NftToken} = route.params;
  const [isBuyModalVisible, setIsBuyModalVisible] = useState<boolean>(false);
  const [isSellModalVisible, setIsSellModalVisible] = useState<boolean>(false);

  const {
    nft: combinedNft,
    loading: isLoading,
    refetch,
  } = useCompleteNft(nft?.id);

  const {
    activity,
    loading,
    refetch: refetchActivity,
  } = useNftActivity(nft.tokenId, nft.collectionAddress);

  useEffect(() => {
    if (nft?.collectionAddress && nft?.tokenId) {
      refetch();
    }
  }, [nft]);

  if (isLoading || !combinedNft) {
    return (
      <View style={styles.loadingContainer}>
        <Text>Loading NFT details...</Text>
      </View>
    );
  }

  const marketData = combinedNft;

  const owners = marketData?.marketData?.activeAsks || [];

  return (
    <>
      <ScrollView style={styles.container}>
        <NFTHeader
          nft={combinedNft}
          onBuyPress={() => setIsBuyModalVisible(true)}
        />

        <Text style={styles.sectionTitle}>👑 Owners</Text>
        <OwnerList
          owners={owners}
          onBuyPress={() => setIsBuyModalVisible(true)}
          onSellPress={() => setIsSellModalVisible(true)}
        />

        <Text style={styles.sectionTitle}>📄 Contract Info</Text>
        <ContractInfo nft={combinedNft} />

        <Text style={styles.sectionTitle}>📊 Activity</Text>
        <ActivityList activity={activity} loading={loading} />
      </ScrollView>

      <BuyModal
        visible={isBuyModalVisible}
        onClose={() => {
          setIsBuyModalVisible(false);
          refetch();
          refetchActivity();
        }}
        // onConfirm={handleBuyConfirm}
        nftToBuy={combinedNft}
      />

      <SellModal
        visible={isSellModalVisible}
        onClose={() => {
          setIsSellModalVisible(false);
          refetch();
        }}
        variant="adjust"
        nftToSell={combinedNft}
        onSuccessSale={() => {
          refetch();
          refetchActivity();
        }}
      />
    </>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f9fafa',
    paddingTop: 50,
    paddingHorizontal: 15,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '600',
    marginBottom: 10,
    color: '#2c3e50',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
  },
});

export default NFTDetailsScreen;
