import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  SafeAreaView,
  Pressable,
  Image,
} from 'react-native';
import {fontsFamily} from '../../Theme';
import {Header} from '@rneui/base';
import {navigateBack, navigateTo} from '../../utils/navigationService';
import images from '../../Theme/images';
import {DButton} from '../../Componants';

// Define interfaces for our data types
interface Validator {
  id: number;
  name: string;
  validatorId: string;
}

interface Delegator {
  id: number;
  name: string;
  // Add more properties as needed
}

// Props interface - for future use with dynamic data
interface ValidatorDetailsScreenProps {
  // You can add more props here if needed
}

const ValidatorDetailsScreen: React.FC<ValidatorDetailsScreenProps> = () => {
  // Static validator data - will be replaced with dynamic data in the future
  const validator: Validator = {
    id: 1,
    name: 'Validator Name',
    validatorId: 'Validator Id',
  };

  // Static delegator data - will be replaced with dynamic data in the future
  const delegators: Delegator[] = [
    {id: 1, name: 'Delegator 1'},
    {id: 2, name: 'Delegator 2'},
    {id: 3, name: 'Delegator 3'},
  ];

  return (
    <SafeAreaView style={{flex: 1}}>
      <View style={styles.container}>
        {/* <Header
        backgroundColor={'#FFF'}
        containerStyle={{borderBottomWidth: 0}}
        leftComponent={
          <Pre
            onPress={() => navigateBack()}
            style={styles.iconContainer}>
            <Image source={images.back} />
          </Pre>
        }
        centerComponent={
          <View style={styles.nameContainer}>
            <DText fontStyle="fontBold" style={styles.headerTitle}>
              {coinCode}
            </DText>
          </View>
        }
      /> */}
        <View style={styles.headerContainer}>
          <Pressable
            onPress={() => navigateBack()}
            style={styles.iconContainer}>
            <Image source={images.back} style={{width: 20, height: 20}} />
          </Pressable>
          <Text style={styles.header}>Validator Details</Text>
        </View>

        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}>
          {/* Validator Details Card */}
          <View style={styles.validatorCard}>
            <View style={styles.validatorInfo}>
              <Text style={styles.validatorTitle}>{validator.name}</Text>
              <View style={styles.validatorDetails}>
                <Text style={styles.validatorDetailText}>
                  {validator.validatorId}
                </Text>
              </View>
            </View>
          </View>

          {/* StakeScreen */}

          <DButton
            onPress={() => navigateTo('StakeScreen')}
            style={styles.stakeButton}>
            <Text style={styles.stakeButtonText}>Stake</Text>
          </DButton>

          {/* Delegator Listing Section */}
          <View style={styles.sectionContainer}>
            <Text style={styles.sectionTitle}>Delegator Listing</Text>

            {delegators.map((delegator: Delegator) => (
              <View key={delegator.id} style={styles.delegatorCard}>
                <View style={styles.delegatorInfo}>
                  {/* No content shown in the example image, 
                    but we can add placeholder text here */}
                </View>
              </View>
            ))}
          </View>
        </ScrollView>
      </View>
    </SafeAreaView>
  );
};

// Styles
const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: '#fff', // Light blue background as shown in the image
  },
  headerContainer: {
    flexDirection: 'row',
    // justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
    marginTop: 20,
  },
  header: {
    fontSize: 18,
    fontFamily: fontsFamily?.MulishBold || 'sans-serif',
    color: '#000',
  },
  scrollContent: {
    paddingBottom: 20,
  },
  validatorCard: {
    backgroundColor: '#fff', // Light green background
    borderRadius: 12,
    padding: 16,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: '#2A6D4B', // Dark green border
  },
  validatorInfo: {
    flex: 1,
    alignItems: 'center', // Center the text as shown in the image
  },
  validatorTitle: {
    fontSize: 20,
    marginBottom: 8,
    fontFamily: fontsFamily?.MulishBold || 'sans-serif',
    color: '#000',
  },
  validatorDetails: {
    marginTop: 4,
  },
  validatorDetailText: {
    fontSize: 16,
    color: '#555',
    fontFamily: fontsFamily?.MulishSemiBold || 'sans-serif',
  },
  sectionContainer: {
    marginTop: 10,
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 22,
    fontWeight: '600',
    marginBottom: 16,
    color: '#333',
    fontFamily: fontsFamily?.MulishBold || 'sans-serif',
  },
  delegatorCard: {
    backgroundColor: '#fff', // White background with pinkish tint in the image
    borderRadius: 6,
    padding: 14,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#FFCCD5', // Light pinkish border
    height: 60, // Fixed height as shown in the image
  },
  delegatorInfo: {
    flex: 1,
    justifyContent: 'center',
  },
  iconContainer: {
    position: 'relative',
    marginRight: 10,
  },
  stakeButton: {
    backgroundColor: '#009D94',
    borderRadius: 8,
    padding: 15,
    alignItems: 'center',
    width: '100%',
    marginBottom: 10,
    height: 50,
  },
  stakeButtonText: {
    color: '#fff',
    fontSize: 16,
    fontFamily: fontsFamily.MulishBold,
  },
});

export default ValidatorDetailsScreen;
