import React, {useState} from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Alert,
} from 'react-native';
import {fontsFamily, Images} from '../../Theme';
import Icon from 'react-native-vector-icons/Entypo';
import {BottomSheet} from 'react-native-btr';
import {CustomImageButton, DButton} from '../../Componants';

// Define interfaces for our data types
interface Stake {
  id: number;
  name: string;
  tokenId: number;
  amount: number;
}

// Props interface (empty for now, but useful for future extensions)
interface StakeListingScreenProps {
  // You can add props here if needed
}

const StakeListingScreen: React.FC<StakeListingScreenProps> = () => {
  // Sample data with id and tokenId as separate properties
  const stakes: Stake[] = [
    {id: 1, name: 'Turkey Solar 2025', tokenId: 1, amount: 100000},
    {id: 2, name: 'Turkey Solar 2025', tokenId: 2, amount: 100000},
    {id: 3, name: 'Turkey Solar 2025', tokenId: 3, amount: 100000},
    {id: 4, name: 'Turkey Solar 2025', tokenId: 4, amount: 100000},
    {id: 5, name: 'Turkey Solar 2025', tokenId: 5, amount: 100000},
    {id: 6, name: 'Turkey Solar 2025', tokenId: 6, amount: 100000},
  ];

  // State for bottom sheet visibility and selected stake
  const [bottomSheetVisible, setBottomSheetVisible] = useState(false);
  const [selectedStake, setSelectedStake] = useState<Stake | null>(null);

  const handleIconPress = (stake: Stake): void => {
    setSelectedStake(stake);
    setBottomSheetVisible(true);
  };

  const handleUnstake = (): void => {
    if (selectedStake) {
      // Implement unstake logic here
      Alert.alert(
        'Unstake',
        `Unstaking ${selectedStake.amount} from ${selectedStake.name}`,
      );
      // In a real app, you would call an API or dispatch an action
      setBottomSheetVisible(false);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.headerContainer}>
        <Text style={styles.header}>Stake Listing</Text>
      </View>

      <ScrollView
        bounces={false}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}>
        {stakes.map((stake: Stake) => (
          <View key={stake.id} style={styles.stakeCard}>
            <View style={styles.mainContainer}>
              <View style={styles.stakeInfo}>
                <Text style={styles.stakeTitle}>{stake.name}</Text>
                <View style={styles.stakeDetails}>
                  <Text style={styles.stakeDetailText}>
                    Token ID: {stake.tokenId}
                  </Text>
                  <Text style={styles.stakeDetailAmount}>
                    Amount: {stake.amount}
                  </Text>
                </View>
              </View>
              <TouchableOpacity onPress={() => handleIconPress(stake)}>
                <Icon name="dots-three-vertical" size={20} color="#009D94" />
              </TouchableOpacity>
            </View>
          </View>
        ))}
      </ScrollView>

      {/* Bottom Sheet integrated directly */}
      <BottomSheet
        visible={bottomSheetVisible}
        onBackButtonPress={() => setBottomSheetVisible(false)}
        onBackdropPress={() => setBottomSheetVisible(false)}>
        <View style={styles.bottomSheetCard}>
          {/* <View style={styles.bottomSheetHeader}>
            <Text style={styles.bottomSheetTitle}></Text>
            <TouchableOpacity
              onPress={() => setBottomSheetVisible(false)}
              style={styles.closeButton}>
              <Text style={styles.closeText}>✕</Text>
            </TouchableOpacity>
          </View> */}

          <DButton onPress={() => {}} style={styles.unstakeButton}>
            <Text style={styles.unstakeButtonText}>Unstake</Text>
          </DButton>
        </View>
      </BottomSheet>
    </View>
  );
};

// Updated styles to include bottom sheet styling
const styles = StyleSheet.create({
  mainContainer: {
    width: '100%',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#fff',
  },
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: '#fff',
  },
  headerContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  header: {
    fontSize: 28,
    fontWeight: 'bold',
  },
  scrollContent: {
    paddingBottom: 20,
  },
  stakeCard: {
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1.2,
    borderColor: '#009D94',
  },
  stakeInfo: {
    flex: 1,
  },
  stakeTitle: {
    fontSize: 18,
    marginBottom: 8,
    fontFamily: fontsFamily.MulishBold,
  },
  stakeDetails: {
    flexDirection: 'row',
    marginTop: 4,
  },
  stakeDetailText: {
    fontSize: 14,
    color: '#555',
    fontFamily: fontsFamily.MulishSemiBold,
  },
  stakeDetailAmount: {
    fontSize: 14,
    color: '#555',
    textAlign: 'right',
    marginLeft: 20,
    fontFamily: fontsFamily.MulishSemiBold,
  },
  // Bottom Sheet Styles
  bottomSheetCard: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingHorizontal: 20,
    paddingBottom: 30,
    paddingTop: 10,
  },
  bottomSheetHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#EFEFEF',
  },
  bottomSheetTitle: {
    fontSize: 18,
    fontFamily: fontsFamily.MulishBold,
    color: '#000000',
  },
  closeButton: {
    padding: 5,
  },
  closeText: {
    fontSize: 18,
    color: '#009D94',
  },
  // Token Info Container Styles
  tokenInfoContainer: {
    marginTop: 15,
    padding: 10,
    backgroundColor: '#F8F8F8',
    borderRadius: 6,
  },
  tokenInfoText: {
    fontSize: 16,
    fontFamily: fontsFamily.MulishSemiBold,
    color: '#333',
  },
  unstakeButton: {
    backgroundColor: '#009D94',
    borderRadius: 8,
    padding: 15,
    alignItems: 'center',
    marginTop: 20,
    width: '100%',
    height: 50,
  },
  unstakeButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontFamily: fontsFamily.MulishBold,
  },
});

export default StakeListingScreen;
