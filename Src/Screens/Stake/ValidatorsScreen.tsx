import React from 'react';
import {View, Text, StyleSheet, ScrollView, Pressable} from 'react-native';
import {fontsFamily} from '../../Theme';
import {navigateTo} from '../../utils/navigationService';

// Define interfaces for our data types
interface Validator {
  id: number;
  name: string;
  validatorId: string;
}

// Props interface (empty for now, but useful for future extensions)
interface ValidatorsScreenProps {
  // You can add props here if needed
}

const ValidatorsScreen: React.FC<ValidatorsScreenProps> = () => {
  // Sample data - in a real app, this would come from props or state
  const validators: Validator[] = [
    {id: 1, name: 'Validator Name', validatorId: 'Validator Id'},
    {id: 2, name: 'Validator Name', validatorId: 'Validator Id'},
    {id: 3, name: 'Validator Name', validatorId: 'Validator Id'},
    {id: 4, name: 'Validator Name', validatorId: 'Validator Id'},
    {id: 5, name: 'Validator Name', validatorId: 'Validator Id'},
    {id: 6, name: 'Validator Name', validatorId: 'Validator Id'},
  ];

  return (
    <View style={styles.container}>
      <View style={styles.headerContainer}>
        <Text style={styles.header}>Validators</Text>
      </View>

      <ScrollView
        bounces={false}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}>
        {validators.map((validator: Validator) => (
          <Pressable
            onPress={() => navigateTo('ValidatorDetailsScreen')}
            key={validator.id}
            style={styles.validatorCard}>
            <View style={styles.mainContainer}>
              <View style={styles.validatorInfo}>
                <Text style={styles.validatorTitle}>{validator.name}</Text>
                <View style={styles.validatorDetails}>
                  <Text style={styles.validatorDetailText}>
                    {validator.validatorId}
                  </Text>
                </View>
              </View>
            </View>
          </Pressable>
        ))}
      </ScrollView>
    </View>
  );
};

// Styles
const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: '#fff', // Light blue background
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
    color: '#000',
  },
  scrollContent: {
    paddingBottom: 20,
  },
  validatorCard: {
    backgroundColor: '#fff', // Light green/mint background
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#009D94', // Dark green border
  },
  mainContainer: {
    width: '100%',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  validatorInfo: {
    flex: 1,
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
    fontSize: 14,
    color: '#555',
    fontFamily: fontsFamily?.MulishSemiBold || 'sans-serif',
  },
});

export default ValidatorsScreen;
