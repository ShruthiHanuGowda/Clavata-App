import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Linking,
  Platform,
} from 'react-native';
import {NftToken} from '../../../types/types';
import {navigate} from '../../../Navigation/NavigationFunctions';

interface ContractInfoProps {
  nft: NftToken;
}

const shortenText = (text: string, chars = 6) =>
  text?.length > 20 ? `${text.slice(0, chars)}...${text.slice(-chars)}` : text;

const ContractInfo: React.FC<ContractInfoProps> = ({nft}) => {
  const IPFS = nft?.marketData?.metadataUrl ?? '';
  const openIPFS = () => {
    Linking.openURL(IPFS).catch(err =>
      console.error('Failed to open URL:', err),
    );
  };

  const goToCollectionDetails = () => {
    navigate('collectionDetails', {
      contractAddress: nft.collectionAddress,
    });
  };

  return (
    <View style={styles.card}>
      <Text style={styles.label}>Contract Address</Text>
      <TouchableOpacity onPress={goToCollectionDetails}>
        <Text style={styles.valueLink}>
          {shortenText(nft.collectionAddress, 20)}
        </Text>
      </TouchableOpacity>

      <Text style={[styles.label, {marginTop: 12}]}>IPFS Metadata</Text>
      <TouchableOpacity onPress={openIPFS}>
        <Text style={styles.valueLink}>{shortenText(IPFS, 20)}</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    borderRadius: 12,
    padding: 16,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  label: {
    fontSize: 13,
    fontWeight: '600',
    marginBottom: 4,
  },
  valueLink: {
    fontSize: 14,
    color: '#3498db',
    fontFamily: Platform.OS === 'ios' ? 'Courier New' : 'monospace',
  },
});

export default ContractInfo;
