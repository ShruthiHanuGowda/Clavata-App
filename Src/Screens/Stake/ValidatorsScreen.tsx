import React, {useState} from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Pressable,
  TouchableOpacity,
} from 'react-native';
import {fontsFamily} from '../../Theme';
import {navigateTo} from '../../utils/navigationService';
import {BottomSheet} from 'react-native-btr';
import {DButton} from '../../Componants';

// Define interfaces for our data types
interface Validator {
  id: number;
  name: string;
  validatorId: string;
  status: 'Active' | 'Inactive';
  apr: number;
  commission: number;
  age: number;
  totalStake: {
    nft: number;
    watt: number;
  };
}

// Props interface
interface ValidatorsScreenProps {
  // You can add props here if needed
}

const ValidatorsScreen: React.FC<ValidatorsScreenProps> = () => {
  const [sortBy, setSortBy] = useState('APR');
  const [filterStatus, setFilterStatus] = useState('All');
  const [bottomSheetVisible, setBottomSheetVisible] = useState(false);

  const sortOptions = ['APR', 'Commission', 'Age', 'Total Stake'];
  const statusOptions = ['All', 'Active', 'Inactive'];

  // Sample data matching the design
  const allValidators: Validator[] = [
    {
      id: 1,
      name: 'Validator A',
      validatorId: 'val_001',
      status: 'Active',
      apr: 12.5,
      commission: 5,
      age: 365,
      totalStake: {
        nft: 1500,
        watt: 50000,
      },
    },
    {
      id: 2,
      name: 'Validator B',
      validatorId: 'val_002',
      status: 'Active',
      apr: 11.8,
      commission: 3,
      age: 180,
      totalStake: {
        nft: 2100,
        watt: 75000,
      },
    },
    {
      id: 3,
      name: 'Validator C',
      validatorId: 'val_003',
      status: 'Inactive',
      apr: 10.2,
      commission: 7,
      age: 500,
      totalStake: {
        nft: 800,
        watt: 30000,
      },
    },
    {
      id: 4,
      name: 'Validator D',
      validatorId: 'val_004',
      status: 'Active',
      apr: 13.1,
      commission: 4,
      age: 120,
      totalStake: {
        nft: 2500,
        watt: 80000,
      },
    },
  ];

  // Filter and sort logic
  const getFilteredAndSortedValidators = () => {
    // First, filter by status
    let filteredValidators = allValidators.filter(validator => {
      if (filterStatus === 'All') return true;
      return validator.status === filterStatus;
    });

    // Then, sort by selected criteria
    const sortedValidators = [...filteredValidators].sort((a, b) => {
      switch (sortBy) {
        case 'APR':
          return b.apr - a.apr; // Descending order (highest APR first)
        case 'Commission':
          return a.commission - b.commission; // Ascending order (lowest commission first)
        case 'Age':
          return b.age - a.age; // Descending order (oldest first)
        case 'Total Stake':
          const totalStakeA = a.totalStake.nft + a.totalStake.watt;
          const totalStakeB = b.totalStake.nft + b.totalStake.watt;
          return totalStakeB - totalStakeA; // Descending order (highest stake first)
        default:
          return 0;
      }
    });

    return sortedValidators;
  };

  const validators = getFilteredAndSortedValidators();

  const formatStake = (nft: number, watt: number) => {
    const formatNumber = (num: number) => {
      if (num >= 1000) {
        return `${(num / 1000).toFixed(0)}K`;
      }
      return num.toString();
    };

    return `${formatNumber(nft)} NFT + ${formatNumber(watt)} Watt`;
  };

  const handleShowFilters = () => {
    setBottomSheetVisible(true);
  };

  const handleApplyFilters = () => {
    // The validators list will automatically update due to the getFilteredAndSortedValidators function
    console.log(
      'Applied filters - Sorting by:',
      sortBy,
      '| Filter status:',
      filterStatus,
    );
    console.log(
      'Filtered validators count:',
      getFilteredAndSortedValidators().length,
    );
    setBottomSheetVisible(false);
  };

  // Get count of filtered results for display
  const getFilteredCount = () => getFilteredAndSortedValidators().length;
  const getTotalCount = () => allValidators.length;

  return (
    <View style={styles.container}>
      {/* Sort & Filter Section */}
      <View style={styles.sortFilterContainer}>
        <View style={styles.sortFilterHeader}>
          <Text style={styles.sortFilterTitle}>🔍 Sort & Filter:</Text>
        </View>

        <View style={styles.sortControls}>
          <Pressable style={styles.sortDropdown} onPress={handleShowFilters}>
            <Text style={styles.sortDropdownText}>Sort by {sortBy}</Text>
            <Text style={styles.sortDropdownArrow}>▼</Text>
          </Pressable>

          <Pressable style={styles.applyButton} onPress={handleShowFilters}>
            <Text style={styles.applyButtonText}>Filter</Text>
          </Pressable>
        </View>
      </View>

      {/* Validators List */}
      <ScrollView
        bounces={false}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}>
        {validators.map((validator: Validator, index: number) => (
          <Pressable
            onPress={() => navigateTo('ValidatorDetailsScreen')}
            key={validator.id}
            style={[
              styles.validatorCard,
              {
                marginBottom: index === validators.length - 1 ? '15%' : 16,
              },
            ]}>
            {/* Validator Header */}
            <View style={styles.validatorHeader}>
              <View style={styles.validatorNameContainer}>
                <Text style={styles.validatorName}>{validator.name}</Text>
                <View style={styles.statusContainer}>
                  <View
                    style={[
                      styles.statusDot,
                      {
                        backgroundColor:
                          validator.status === 'Active' ? '#4CAF50' : '#F44336',
                      },
                    ]}
                  />
                  <Text
                    style={[
                      styles.statusText,
                      {
                        color:
                          validator.status === 'Active' ? '#4CAF50' : '#F44336',
                      },
                    ]}>
                    {validator.status}
                  </Text>
                </View>
              </View>
              <View style={styles.aprContainer}>
                <Text style={styles.aprText}>APR: {validator.apr}%</Text>
              </View>
            </View>

            {/* Validator ID */}
            <Text style={styles.validatorId}>ID: {validator.validatorId}</Text>

            {/* Validator Details */}
            <View style={styles.validatorDetailsContainer}>
              <View style={styles.detailItem}>
                <Text style={styles.detailLabel}>
                  Commission: {validator.commission}%
                </Text>
                <Text style={styles.detailLabel}>
                  Age: {validator.age} days
                </Text>
              </View>
              <Text style={styles.totalStakeText}>
                Total Stake:{' '}
                {formatStake(
                  validator.totalStake.nft,
                  validator.totalStake.watt,
                )}
              </Text>
            </View>
          </Pressable>
        ))}
      </ScrollView>

      {/* Bottom Sheet for Filter Options */}
      <BottomSheet
        visible={bottomSheetVisible}
        onBackButtonPress={() => setBottomSheetVisible(false)}
        onBackdropPress={() => setBottomSheetVisible(false)}>
        <View style={styles.bottomSheetCard}>
          <View style={styles.bottomSheetHeader}>
            <Text style={styles.bottomSheetTitle}>Sort & Filter Options</Text>
            <TouchableOpacity
              onPress={() => setBottomSheetVisible(false)}
              style={styles.closeButton}>
              <Text style={styles.closeText}>✕</Text>
            </TouchableOpacity>
          </View>

          {/* Sort Options */}
          <View style={styles.optionSection}>
            <Text style={styles.sectionTitle}>Sort By:</Text>
            {sortOptions.map(option => (
              <TouchableOpacity
                key={option}
                style={[
                  styles.optionItem,
                  sortBy === option && styles.optionItemSelected,
                ]}
                onPress={() => setSortBy(option)}>
                <Text
                  style={[
                    styles.optionText,
                    sortBy === option && styles.optionTextSelected,
                  ]}>
                  {option}
                </Text>
                {sortBy === option && <Text style={styles.checkMark}>✓</Text>}
              </TouchableOpacity>
            ))}
          </View>

          {/* Status Filter */}
          <View style={styles.optionSection}>
            <Text style={styles.sectionTitle}>Filter by Status:</Text>
            {statusOptions.map(option => (
              <TouchableOpacity
                key={option}
                style={[
                  styles.optionItem,
                  filterStatus === option && styles.optionItemSelected,
                ]}
                onPress={() => setFilterStatus(option)}>
                <Text
                  style={[
                    styles.optionText,
                    filterStatus === option && styles.optionTextSelected,
                  ]}>
                  {option}
                </Text>
                {filterStatus === option && (
                  <Text style={styles.checkMark}>✓</Text>
                )}
              </TouchableOpacity>
            ))}
          </View>

          {/* Apply Button */}
          <DButton
            onPress={handleApplyFilters}
            style={styles.applyFiltersButton}>
            <Text style={styles.applyFiltersButtonText}>Apply Filters</Text>
          </DButton>
        </View>
      </BottomSheet>
    </View>
  );
};

// Styles
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  sortFilterContainer: {
    backgroundColor: '#e8f4f8',
    margin: 16,
    padding: 16,
    borderRadius: 8,
  },
  sortFilterHeader: {
    marginBottom: 12,
  },
  sortFilterTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    fontFamily: fontsFamily?.MulishSemiBold || 'sans-serif',
  },
  sortControls: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  filterStatusContainer: {
    marginHorizontal: 16,
    marginBottom: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    backgroundColor: '#fff',
    borderRadius: 6,
    borderLeftWidth: 3,
    borderLeftColor: '#009D94',
  },
  filterStatusText: {
    fontSize: 14,
    color: '#555',
    fontFamily: fontsFamily?.Mulish || 'sans-serif',
  },
  activeFilterText: {
    color: '#009D94',
    fontWeight: '600',
  },
  sortStatusText: {
    color: '#666',
    fontStyle: 'italic',
  },
  sortDropdown: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#fff',
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#ddd',
  },
  sortDropdownText: {
    fontSize: 14,
    color: '#333',
    fontFamily: fontsFamily?.MulishRegular || 'sans-serif',
  },
  sortDropdownArrow: {
    fontSize: 12,
    color: '#666',
  },
  applyButton: {
    backgroundColor: '#009D94',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 6,
  },
  applyButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
    fontFamily: fontsFamily?.MulishSemiBold || 'sans-serif',
  },
  scrollContent: {
    padding: 16,
    paddingTop: 0,
  },
  validatorCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#e0e0e0',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  validatorHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  validatorNameContainer: {
    flex: 1,
  },
  validatorName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#000',
    marginBottom: 4,
    fontFamily: fontsFamily?.MulishBold || 'sans-serif',
  },
  statusContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 6,
  },
  statusText: {
    fontSize: 14,
    fontWeight: '600',
    fontFamily: fontsFamily?.MulishSemiBold || 'sans-serif',
  },
  aprContainer: {
    backgroundColor: '#FFF3CD',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  aprText: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#856404',
    fontFamily: fontsFamily?.MulishBold || 'sans-serif',
  },
  validatorId: {
    fontSize: 14,
    color: '#666',
    marginBottom: 12,
    fontFamily: fontsFamily?.MulishRegular || 'sans-serif',
  },
  validatorDetailsContainer: {
    gap: 8,
  },
  detailItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  detailLabel: {
    fontSize: 14,
    color: '#333',
    fontFamily: fontsFamily?.MulishRegular || 'sans-serif',
  },
  totalStakeText: {
    fontSize: 14,
    color: '#333',
    fontWeight: '500',
    fontFamily: fontsFamily?.MulishMedium || 'sans-serif',
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
    marginBottom: 20,
  },
  bottomSheetTitle: {
    fontSize: 18,
    fontFamily: fontsFamily?.MulishBold || 'sans-serif',
    color: '#000000',
  },
  closeButton: {
    padding: 5,
  },
  closeText: {
    fontSize: 18,
    color: '#009D94',
  },
  optionSection: {
    marginBottom: 25,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 10,
    fontFamily: fontsFamily?.MulishSemiBold || 'sans-serif',
  },
  optionItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 15,
    borderRadius: 8,
    marginBottom: 8,
    backgroundColor: '#f8f9fa',
  },
  optionItemSelected: {
    backgroundColor: '#e3f2fd',
    borderWidth: 1,
    borderColor: '#009D94',
  },
  optionText: {
    fontSize: 15,
    color: '#333',
    fontFamily: fontsFamily?.Mulish || 'sans-serif',
  },
  optionTextSelected: {
    color: '#009D94',
    fontWeight: '600',
  },
  checkMark: {
    fontSize: 16,
    color: '#009D94',
    fontWeight: 'bold',
  },
  applyFiltersButton: {
    backgroundColor: '#009D94',
    borderRadius: 8,
    padding: 15,
    alignItems: 'center',
    marginTop: 10,
    width: '100%',
    height: 50,
  },
  applyFiltersButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontFamily: fontsFamily?.MulishBold || 'sans-serif',
  },
});

export default ValidatorsScreen;
