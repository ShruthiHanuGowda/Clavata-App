import React, {useState, useEffect} from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Pressable,
  TouchableOpacity,
  ActivityIndicator, // Added ActivityIndicator import
} from 'react-native';
import {fontsFamily} from '../../Theme';
import {navigateTo} from '../../utils/navigationService';
import {BottomSheet} from 'react-native-btr';
import {DButton} from '../../Componants';
import useValidators from './Hooks/useValidators';
import LoaderAnimation from '../../Componants/Loading/LoaderAnimation';
import {VALIDATORS_API_URL} from '../../constants';

// Define interfaces for our data types
interface Validator {
  validatorId: string;
  validatorName: string;
  status: string;
  // apr: number; // Commented out as per instructions
  commissionRate: number;
  validatorAge: number;
  totalStakeAmount: number;
  totalStakedNFT: number;
  totalStakedWatt: number;
}

// Props interface
interface ValidatorsScreenProps {}

const ValidatorsScreen: React.FC<ValidatorsScreenProps> = props => {
  console.log('🚀 ~ props:', props);
  // State for actual applied filters
  const [sortBy, setSortBy] = useState('Commission');
  const [filterStatus, setFilterStatus] = useState('All');

  // Temporary state for bottom sheet selection (before applying)
  const [tempSortBy, setTempSortBy] = useState('Commission');
  const [tempFilterStatus, setTempFilterStatus] = useState('All');
  const [bottomSheetVisible, setBottomSheetVisible] = useState(false);

  // Modified sort options (removed APR)
  const sortOptions = ['Commission', 'Age', 'Total Stake'];
  const statusOptions = ['All', 'Active', 'Inactive'];

  // Use our updated hook - only for list
  const {validatorList} = useValidators();
  const {
    data,
    loading: isLoading,
    error,
    fetch: fetchValidators,
  } = validatorList;

  // Fetch validators on component mount
  useEffect(() => {
    fetchValidators(VALIDATORS_API_URL).catch(err => {
      console.log('Error fetching validators:', err);
    });
  }, []);

  console.log('🚀 ~ data:', JSON.stringify(data, null, 2), isLoading, error);

  // Sample data matching the design
  const allValidators: Validator[] = data?.validators || [];

  // Filter and sort logic
  const getFilteredAndSortedValidators = () => {
    // First, filter by status
    let filteredValidators = allValidators.filter(validator => {
      if (filterStatus === 'All') return true;
      // Convert status to match UI format (capitalized first letter only)
      const formattedStatus =
        validator.status === 'ACTIVE'
          ? 'Active'
          : validator.status === 'INACTIVE'
          ? 'Inactive'
          : validator.status;
      return formattedStatus === filterStatus;
    });

    // Then, sort by selected criteria
    const sortedValidators = [...filteredValidators].sort((a, b) => {
      switch (sortBy) {
        // case 'APR':
        //   return b.apr - a.apr; // Descending order (highest APR first)
        case 'Commission':
          return a.commissionRate - b.commissionRate; // Ascending order (lowest commission first)
        case 'Age':
          return b.validatorAge - a.validatorAge; // Descending order (oldest first)
        case 'Total Stake':
          const totalStakeA = a.totalStakedNFT + a.totalStakedWatt;
          const totalStakeB = b.totalStakedNFT + b.totalStakedWatt;
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
    // When opening the bottom sheet, initialize temp values with current applied filters
    setTempSortBy(sortBy);
    setTempFilterStatus(filterStatus);
    setBottomSheetVisible(true);
  };

  const handleApplyFilters = () => {
    // Only update the actual filter values when Apply is clicked
    setSortBy(tempSortBy);
    setFilterStatus(tempFilterStatus);

    console.log(
      'Applied filters - Sorting by:',
      tempSortBy,
      '| Filter status:',
      tempFilterStatus,
    );

    setBottomSheetVisible(false);
  };

  // Get count of filtered results for display
  const getFilteredCount = () => getFilteredAndSortedValidators().length;
  const getTotalCount = () => allValidators.length;

  const getFormattedStatus = (status: string) => {
    // Convert API status (ACTIVE/INACTIVE) to UI format (Active/Inactive)
    return status === 'ACTIVE'
      ? 'Active'
      : status === 'INACTIVE'
      ? 'Inactive'
      : status;
  };

  // Navigate to details screen with validator ID
  const navigateToDetails = (validatorId: string) => {
    navigateTo('ValidatorDetailsScreen', {validatorId});
  };

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

      {/* Loading State - Centered ActivityIndicator */}
      {isLoading && (
        // <View style={styles.loadingOverlay}>
        <View style={styles.loadingContainer}>
          {/* <ActivityIndicator size="large" color="#009D94" />
          <Text style={styles.loadingText}>Loading validators...</Text> */}
          <LoaderAnimation
            size="large"
            color="#009D94"
            showText={true}
            text="Loading validators..."
          />
          {/* </View> */}
        </View>
      )}

      {/* Error State */}
      {error && (
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>Error: {error.message}</Text>
          <TouchableOpacity
            style={styles.retryButton}
            onPress={() => fetchValidators(VALIDATORS_API_URL)}>
            <Text style={styles.retryButtonText}>Retry</Text>
          </TouchableOpacity>
        </View>
      )}

      {/* Validators List */}
      {!isLoading && !error && (
        <ScrollView
          bounces={false}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}>
          {validators.map((validator: Validator, index: number) => {
            console.log('🚀 ~ {validators.map ~ Validator:', validator);
            const formattedStatus = getFormattedStatus(validator.status);

            return (
              <Pressable
                onPress={() => navigateToDetails(validator.validatorId)}
                key={validator.validatorId}
                style={[
                  styles.validatorCard,
                  {
                    marginBottom: index === validators.length - 1 ? '22%' : 16,
                  },
                ]}>
                {/* Validator Header */}
                <View style={styles.validatorHeader}>
                  <View style={styles.validatorNameContainer}>
                    <Text style={styles.validatorName}>
                      {validator.validatorName}
                    </Text>
                    <View style={styles.statusContainer}>
                      <View
                        style={[
                          styles.statusDot,
                          {
                            backgroundColor:
                              formattedStatus.toLowerCase() === 'active'
                                ? '#4CAF50'
                                : '#F44336',
                          },
                        ]}
                      />
                      <Text
                        style={[
                          styles.statusText,
                          {
                            color:
                              formattedStatus.toLowerCase() === 'active'
                                ? '#4CAF50'
                                : '#F44336',
                          },
                        ]}>
                        {formattedStatus}
                      </Text>
                    </View>
                  </View>
                </View>

                {/* Validator ID */}
                <Text style={styles.validatorId}>
                  ID: {validator.validatorId}
                </Text>

                {/* Validator Details */}
                <View style={styles.validatorDetailsContainer}>
                  <View style={styles.detailItem}>
                    <Text style={styles.detailLabel}>
                      Commission: {validator.commissionRate}%
                    </Text>
                    <Text style={styles.detailLabel}>
                      Age: {validator.validatorAge} days
                    </Text>
                  </View>
                  <Text style={styles.totalStakeText}>
                    Total Stake:{' '}
                    {formatStake(
                      validator.totalStakedNFT,
                      validator.totalStakedWatt,
                    )}
                  </Text>
                </View>
              </Pressable>
            );
          })}
        </ScrollView>
      )}

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
                  tempSortBy === option && styles.optionItemSelected,
                ]}
                onPress={() => setTempSortBy(option)}>
                <Text
                  style={[
                    styles.optionText,
                    tempSortBy === option && styles.optionTextSelected,
                  ]}>
                  {option}
                </Text>
                {tempSortBy === option && (
                  <Text style={styles.checkMark}>✓</Text>
                )}
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
                  tempFilterStatus === option && styles.optionItemSelected,
                ]}
                onPress={() => setTempFilterStatus(option)}>
                <Text
                  style={[
                    styles.optionText,
                    tempFilterStatus === option && styles.optionTextSelected,
                  ]}>
                  {option}
                </Text>
                {tempFilterStatus === option && (
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

// Styles with updated loading state
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  // Updated loading styles with overlay and centered container
  loadingOverlay: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: 0,
    bottom: 0,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.7)', // Semi-transparent background
    zIndex: 1000, // Ensure it's above other elements
  },
  loadingContainer: {
    top: -100,
    // backgroundColor: 'white',
    borderRadius: 10,
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    // shadowColor: '#000',
    // shadowOffset: {
    //   width: 0,
    //   height: 2,
    // },
    // shadowOpacity: 0.25,
    // shadowRadius: 3.84,
    // elevation: 5,
    // minWidth: 200,
  },
  loadingText: {
    fontSize: 16,
    color: '#333',
    marginTop: 15,
    fontFamily: fontsFamily?.Mulish || 'sans-serif',
    textAlign: 'center',
  },
  errorContainer: {
    padding: 20,
    margin: 16,
    backgroundColor: '#ffebee',
    borderRadius: 8,
    borderLeftWidth: 4,
    borderLeftColor: '#f44336',
    alignItems: 'center',
  },
  errorText: {
    fontSize: 16,
    color: '#d32f2f',
    marginBottom: 12,
    fontFamily: fontsFamily?.Mulish || 'sans-serif',
  },
  retryButton: {
    backgroundColor: '#f44336',
    paddingHorizontal: 24,
    paddingVertical: 8,
    borderRadius: 4,
  },
  retryButtonText: {
    color: '#fff',
    fontSize: 14,
    fontFamily: fontsFamily?.MulishSemiBold || 'sans-serif',
  },
  // Existing styles remain the same...
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
    fontFamily: fontsFamily?.Mulish || 'sans-serif',
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
    fontFamily: fontsFamily?.Mulish || 'sans-serif',
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
    fontFamily: fontsFamily?.Mulish || 'sans-serif',
  },
  totalStakeText: {
    fontSize: 14,
    color: '#333',
    fontFamily: fontsFamily?.Mulish || 'sans-serif',
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
