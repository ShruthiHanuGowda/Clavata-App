import React from 'react';
import {View, Text, TouchableOpacity, StyleSheet, Image} from 'react-native';
import {activeAsks} from '../../../types/types';
import {useAuth} from '../../../../screens/Provider/authProvider';
import {shortenAddress} from '../../../utils/shortenAddress';
import {formatQuantityMWh} from '../../../utils';
import images from '../../../Theme/images';

interface OwnerListProps {
  owners: activeAsks[];
  onBuyPress: (owner: activeAsks) => void;
  onSellPress: (owner: activeAsks) => void;
}

const OwnerList: React.FC<OwnerListProps> = ({
  owners,
  onBuyPress,
  onSellPress,
}) => {
  const {userDetails} = useAuth();

  return (
    <View style={styles.card}>
      <Text style={styles.title}>Owners</Text>
      {owners.length === 0 && (
        <Text style={styles.emptyText}>No active asks found</Text>
      )}
      {owners.length > 0 &&
        owners.map((owner, index) => {
          const isCurrentUser =
            owner.seller?.id.toLowerCase() ===
            userDetails?.userWallet?.toLocaleLowerCase();
          const isLast = index === owners.length - 1;

          return (
            <View
              key={owner.id}
              style={[styles.ownerRow, !isLast && styles.rowBorder]}>
              <View style={styles.ownerInfo}>
                <Text style={styles.ownerText}>
                  <Text style={styles.label}>Qty:</Text>
                  {formatQuantityMWh(Number(owner.amount ?? 0))}
                </Text>
                <Text style={styles.ownerText}>
                  <Text style={styles.label}>Owner:</Text>{' '}
                  {shortenAddress(owner.seller?.id)}
                </Text>
                <View style={styles.priceRow}>
                  <Text style={styles.label}>Price:</Text>
                  <Image
                    source={images.usdc}
                    style={styles.tokenIcon}
                    resizeMode="contain"
                  />
                  <Text style={styles.priceText}>
                    ${owner.askPrice} per MWh
                  </Text>
                </View>
              </View>
              <TouchableOpacity
                style={isCurrentUser ? styles.sellButton : styles.buyButton}
                onPress={() =>
                  isCurrentUser ? onSellPress(owner) : onBuyPress(owner)
                }>
                <Text style={styles.buttonText}>
                  {isCurrentUser ? 'Modify' : 'Buy'}
                </Text>
              </TouchableOpacity>
            </View>
          );
        })}
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 15,
    marginBottom: 20,
    elevation: 2,
  },
  emptyText: {
    fontSize: 14,
    color: '#7f8c8d',
    textAlign: 'center',
    paddingVertical: 10,
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
    color: '#2c3e50',
    marginBottom: 10,
  },
  ownerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 10,
  },
  rowBorder: {
    borderBottomColor: '#eee',
    borderBottomWidth: 1,
  },
  ownerInfo: {
    flex: 1,
    marginRight: 10,
  },
  ownerText: {
    fontSize: 14,
    color: '#2d3436',
    marginBottom: 3,
  },
  label: {
    fontWeight: '600',
    color: '#34495e',
  },
  priceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 2,
  },
  tokenIcon: {
    width: 16,
    height: 16,
    marginLeft: 4,
    marginRight: 4,
  },
  priceText: {
    fontSize: 14,
    color: '#2d3436',
  },
  buyButton: {
    backgroundColor: '#81c8c3',
    paddingVertical: 8,
    paddingHorizontal: 20,
    borderRadius: 20,
  },
  sellButton: {
    backgroundColor: '#e74c3c',
    paddingVertical: 8,
    paddingHorizontal: 20,
    borderRadius: 20,
  },
  buttonText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 14,
  },
});

export default OwnerList;
