import React, {useEffect, useState, useMemo} from 'react';
import {
  ScrollView,
  RefreshControl,
  StyleSheet,
  Text,
  View,
  Platform,
  TouchableOpacity,
  TextInput,
  Modal,
} from 'react-native';
import {navigate} from '../../Navigation/NavigationFunctions';
import CollectionCard from '../../components/MarketPlace/CollectionCard';
import {useMagic} from '../../../screens/Provider/MagicProvider';
import useCollections from '../../hooks/useCollections';
import {Header} from '@rneui/base';
import {DText} from '../../components/DText';
import LoaderAnimation from '../../components/Loading/LoaderAnimation';

type SortType = 'name' | 'country' | 'type' | 'year';
type FilterType = 'all' | 'country' | 'type' | 'year' | 'status';

const MarketPlace: React.FC = () => {
  const {setActiveNetwork} = useMagic();
  const {collections, loading: isLoading, refetch} = useCollections();

  const [searchQuery, setSearchQuery] = useState<string>('');
  const [sortBy, setSortBy] = useState<SortType>('name');
  const [filterBy, setFilterBy] = useState<FilterType>('all');
  const [selectedCountry, setSelectedCountry] = useState<string>('');
  const [selectedType, setSelectedType] = useState<string>('');
  const [selectedYear, setSelectedYear] = useState<string>('');
  const [showSortModal, setShowSortModal] = useState<boolean>(false);

  useEffect(() => {
    setActiveNetwork('denergy');
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Check if any filters are active
  const hasActiveFilters = useMemo(() => {
    return (
      searchQuery.length > 0 ||
      filterBy !== 'all' ||
      selectedCountry !== '' ||
      selectedType !== '' ||
      selectedYear !== '' ||
      sortBy !== 'name'
    );
  }, [
    searchQuery,
    filterBy,
    selectedCountry,
    selectedType,
    selectedYear,
    sortBy,
  ]);

  const filterOptions = useMemo(() => {
    const countries = [
      ...new Set(
        collections
          ?.map(c => c.country)
          .filter((item): item is string => Boolean(item)),
      ),
    ];
    const types = [
      ...new Set(
        collections
          ?.map(c => c.type)
          .filter((item): item is string => Boolean(item)),
      ),
    ];
    const years = [
      ...new Set(
        collections
          ?.map(c => c.year?.toString())
          .filter((item): item is string => Boolean(item)),
      ),
    ];

    return {
      countries: countries.sort(),
      types: types.sort(),
      years: years.sort((a, b) => (b || '').localeCompare(a || '')),
    };
  }, [collections]);

  // Filter and sort collections
  const processedCollections = useMemo(() => {
    if (!collections) {
      return [];
    }

    let filtered = collections.filter(collection => {
      // Search filter
      const matchesSearch =
        !searchQuery ||
        collection.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        collection.country?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        collection.type?.toLowerCase().includes(searchQuery.toLowerCase());

      // Category filter based on selected filter type
      let matchesFilter = true;

      if (filterBy === 'country') {
        matchesFilter =
          !selectedCountry || collection.country === selectedCountry;
      } else if (filterBy === 'type') {
        matchesFilter = !selectedType || collection.type === selectedType;
      } else if (filterBy === 'year') {
        matchesFilter =
          !selectedYear || collection.year?.toString() === selectedYear;
      }

      return matchesSearch && matchesFilter;
    });

    // Sort collections
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'name':
          return (a.name || '').localeCompare(b.name || '');
        case 'country':
          return (a.country || '').localeCompare(b.country || '');
        case 'type':
          return (a.type || '').localeCompare(b.type || '');
        case 'year':
          return (Number(b.year) || 0) - (Number(a.year) || 0);
        default:
          return 0;
      }
    });

    return filtered;
  }, [
    collections,
    searchQuery,
    sortBy,
    filterBy,
    selectedCountry,
    selectedType,
    selectedYear,
  ]);

  const onRefresh = () => {
    refetch();
  };

  const handleFilterChange = (filter: FilterType) => {
    setFilterBy(filter);
    // Reset selections when changing filter type
    if (filter !== 'country') {
      setSelectedCountry('');
    }
    if (filter !== 'type') {
      setSelectedType('');
    }
    if (filter !== 'year') {
      setSelectedYear('');
    }
  };

  // Reset all filters function
  const resetAllFilters = () => {
    setSearchQuery('');
    setSortBy('name');
    setFilterBy('all');
    setSelectedCountry('');
    setSelectedType('');
    setSelectedYear('');
    setShowSortModal(false);
  };

  const getFilterLabel = () => {
    switch (filterBy) {
      case 'country':
        return selectedCountry
          ? `Country: ${selectedCountry}`
          : 'Filter by Country';
      case 'type':
        return selectedType ? `Type: ${selectedType}` : 'Filter by Type';
      case 'year':
        return selectedYear ? `Year: ${selectedYear}` : 'Filter by Year';
      default:
        return 'Filter';
    }
  };

  const renderSearchAndSort = () => (
    <View style={styles.searchSortContainer}>
      <View style={styles.searchContainer}>
        <Text style={styles.searchIcon}>🔍</Text>
        <TextInput
          style={styles.searchInput}
          placeholder="Search collections..."
          value={searchQuery}
          onChangeText={setSearchQuery}
          placeholderTextColor="#999"
        />
        {searchQuery.length > 0 && (
          <TouchableOpacity onPress={() => setSearchQuery('')}>
            <Text style={styles.clearSearchIcon}>✕</Text>
          </TouchableOpacity>
        )}
      </View>

      <View style={styles.sortFilterRow}>
        <TouchableOpacity
          style={styles.sortButton}
          onPress={() => setShowSortModal(true)}>
          <Text style={styles.sortButtonText}>{getSortLabel()}</Text>
          <Text style={styles.dropdownIcon}>▼</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.filterButton}
          onPress={() => setShowSortModal(true)}>
          <Text style={styles.filterButtonText}>{getFilterLabel()}</Text>
        </TouchableOpacity>
      </View>

      {/* Reset button - only show when filters are active */}
      {hasActiveFilters && (
        <View style={styles.resetContainer}>
          <TouchableOpacity
            style={styles.resetButton}
            onPress={resetAllFilters}>
            <Text style={styles.resetIcon}>🔄</Text>
            <Text style={styles.resetButtonText}>Reset All Filters</Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );

  const getSortLabel = () => {
    switch (sortBy) {
      case 'name':
        return 'Sort by Name';
      case 'country':
        return 'Sort by Country';
      case 'type':
        return 'Sort by Type';
      case 'year':
        return 'Sort by Year';
      default:
        return 'Sort by Name';
    }
  };

  const renderSortModal = () => (
    <Modal
      visible={showSortModal}
      transparent={true}
      animationType="slide"
      onRequestClose={() => setShowSortModal(false)}>
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Sort & Filter Options</Text>
            <View style={styles.modalHeaderButtons}>
              {hasActiveFilters && (
                <TouchableOpacity
                  style={styles.resetModalButton}
                  onPress={resetAllFilters}>
                  <Text style={styles.resetModalButtonText}>Reset All</Text>
                </TouchableOpacity>
              )}
              <TouchableOpacity onPress={() => setShowSortModal(false)}>
                <Text style={styles.closeButton}>✕</Text>
              </TouchableOpacity>
            </View>
          </View>

          <ScrollView
            contentContainerStyle={styles.modalScrollContent}
            showsVerticalScrollIndicator={false}>
            <View style={styles.sectionContainer}>
              <Text style={styles.sectionTitle}>Sort By:</Text>
              {[
                {key: 'name', label: 'Name'},
                {key: 'country', label: 'Country'},
                {key: 'type', label: 'Type'},
                {key: 'year', label: 'Year'},
              ].map(option => (
                <TouchableOpacity
                  key={option.key}
                  style={[
                    styles.optionItem,
                    sortBy === option.key && styles.selectedOption,
                  ]}
                  onPress={() => setSortBy(option.key as SortType)}>
                  <Text
                    style={[
                      styles.optionText,
                      sortBy === option.key && styles.selectedOptionText,
                    ]}>
                    {option.label}
                  </Text>
                  {sortBy === option.key && (
                    <Text style={styles.checkMark}>✓</Text>
                  )}
                </TouchableOpacity>
              ))}
            </View>

            <View style={styles.sectionContainer}>
              <Text style={styles.sectionTitle}>Filter By:</Text>
              {[
                {key: 'all', label: 'All'},
                {key: 'country', label: 'Country'},
                {key: 'type', label: 'Type'},
                {key: 'year', label: 'Year'},
                {key: 'status', label: 'Status'},
              ].map(option => (
                <TouchableOpacity
                  key={option.key}
                  style={[
                    styles.optionItem,
                    filterBy === option.key && styles.selectedOption,
                  ]}
                  onPress={() => handleFilterChange(option.key as FilterType)}>
                  <Text
                    style={[
                      styles.optionText,
                      filterBy === option.key && styles.selectedOptionText,
                    ]}>
                    {option.label}
                  </Text>
                  {filterBy === option.key && (
                    <Text style={styles.checkMark}>✓</Text>
                  )}
                </TouchableOpacity>
              ))}
            </View>

            {/* Sub-filter options based on selected filter type */}
            {filterBy !== 'all' && (
              <View style={styles.sectionContainer}>
                <Text style={styles.sectionTitle}>
                  {filterBy === 'country' && 'Select Country:'}
                  {filterBy === 'type' && 'Select Type:'}
                  {filterBy === 'year' && 'Select Year:'}
                </Text>

                {/* Clear selection option */}
                <TouchableOpacity
                  style={[
                    styles.optionItem,
                    ((filterBy === 'country' && !selectedCountry) ||
                      (filterBy === 'type' && !selectedType) ||
                      (filterBy === 'year' && !selectedYear)) &&
                      styles.selectedOption,
                  ]}
                  onPress={() => {
                    if (filterBy === 'country') {
                      setSelectedCountry('');
                    }
                    if (filterBy === 'type') {
                      setSelectedType('');
                    }
                    if (filterBy === 'year') {
                      setSelectedYear('');
                    }
                  }}>
                  <Text
                    style={[
                      styles.optionText,
                      ((filterBy === 'country' && !selectedCountry) ||
                        (filterBy === 'type' && !selectedType) ||
                        (filterBy === 'year' && !selectedYear)) &&
                        styles.selectedOptionText,
                    ]}>
                    All{' '}
                    {filterBy === 'country'
                      ? 'Countries'
                      : filterBy === 'type'
                      ? 'Types'
                      : filterBy === 'year'
                      ? 'Years'
                      : 'Statuses'}
                  </Text>
                  {((filterBy === 'country' && !selectedCountry) ||
                    (filterBy === 'type' && !selectedType) ||
                    (filterBy === 'year' && !selectedYear)) && (
                    <Text style={styles.checkMark}>✓</Text>
                  )}
                </TouchableOpacity>

                {filterBy === 'country' &&
                  filterOptions.countries.map(country => (
                    <TouchableOpacity
                      key={country}
                      style={[
                        styles.optionItem,
                        selectedCountry === country && styles.selectedOption,
                      ]}
                      onPress={() => setSelectedCountry(country)}>
                      <Text
                        style={[
                          styles.optionText,
                          selectedCountry === country &&
                            styles.selectedOptionText,
                        ]}>
                        {country}
                      </Text>
                      {selectedCountry === country && (
                        <Text style={styles.checkMark}>✓</Text>
                      )}
                    </TouchableOpacity>
                  ))}

                {filterBy === 'type' &&
                  filterOptions.types.map(type => (
                    <TouchableOpacity
                      key={type}
                      style={[
                        styles.optionItem,
                        selectedType === type && styles.selectedOption,
                      ]}
                      onPress={() => setSelectedType(type)}>
                      <Text
                        style={[
                          styles.optionText,
                          selectedType === type && styles.selectedOptionText,
                        ]}>
                        {type}
                      </Text>
                      {selectedType === type && (
                        <Text style={styles.checkMark}>✓</Text>
                      )}
                    </TouchableOpacity>
                  ))}

                {filterBy === 'year' &&
                  filterOptions.years.map(year => (
                    <TouchableOpacity
                      key={year}
                      style={[
                        styles.optionItem,
                        selectedYear === year && styles.selectedOption,
                      ]}
                      onPress={() => setSelectedYear(year)}>
                      <Text
                        style={[
                          styles.optionText,
                          selectedYear === year && styles.selectedOptionText,
                        ]}>
                        {year}
                      </Text>
                      {selectedYear === year && (
                        <Text style={styles.checkMark}>✓</Text>
                      )}
                    </TouchableOpacity>
                  ))}
              </View>
            )}
          </ScrollView>

          <TouchableOpacity
            style={styles.applyButton}
            onPress={() => setShowSortModal(false)}>
            <Text style={styles.applyButtonText}>Apply Filters</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );

  return (
    <View style={styles.container}>
      {isLoading ? (
        <View style={styles.loaderContainer}>
          {/* <ActivityIndicator size="large" color="#81c8c3" />
          <Text style={styles.loaderText}>Loading Collections...</Text> */}
          <LoaderAnimation
            size="large"
            // color="#007AFF"
            showText={true}
            text="Loading Collections..."
          />
        </View>
      ) : (
        <View style={styles.container}>
          <Header
            containerStyle={styles.headerContainer}
            backgroundColor={'#FFF'}
            leftComponent={
              <View style={styles.nameContainer}>
                <DText style={styles.title} fontStyle="fontBold">
                  Marketplace
                </DText>
              </View>
            }
          />

          {renderSearchAndSort()}

          <ScrollView
            contentContainerStyle={styles.gridContainer}
            refreshControl={
              <RefreshControl refreshing={isLoading} onRefresh={onRefresh} />
            }>
            <>
              {processedCollections?.map((collection, index) => (
                <View
                  key={collection.id}
                  style={[
                    index === processedCollections.length - 1 &&
                      styles.lastCollectionItem,
                  ]}>
                  <CollectionCard
                    collection={collection}
                    onPress={() =>
                      navigate('collectionDetails', {
                        contractAddress: collection.id,
                      })
                    }
                  />
                </View>
              ))}
              {processedCollections?.length === 0 && (
                <View style={styles.emptyState}>
                  <Text style={styles.emptyStateText}>
                    {searchQuery
                      ? `No collections found matching "${searchQuery}"`
                      : 'No collections found for the selected filter'}
                  </Text>
                  {hasActiveFilters && (
                    <TouchableOpacity
                      style={styles.resetEmptyStateButton}
                      onPress={resetAllFilters}>
                      <Text style={styles.resetEmptyStateButtonText}>
                        Clear All Filters
                      </Text>
                    </TouchableOpacity>
                  )}
                </View>
              )}
            </>
          </ScrollView>
        </View>
      )}

      {renderSortModal()}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f2f2f2',
    paddingTop: Platform.OS === 'ios' ? 0 : 20,
  },
  headerContainer: {
    borderBottomWidth: 0,
  },
  modalScrollContent: {
    paddingBottom: 20,
  },
  lastCollectionItem: {
    marginBottom: 150,
  },
  gridContainer: {
    padding: 10,
  },
  title: {
    fontSize: 18,
    lineHeight: 23,
    width: 200,
    color: '#000',
  },
  nameContainer: {
    flexDirection: 'row',
    marginLeft: 10,
  },
  loaderContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    height: '100%',
    width: '100%',
  },
  loaderText: {
    marginTop: 10,
    fontSize: 18,
    color: '#81c8c3',
  },
  // Enhanced search and sort UI styles
  searchSortContainer: {
    backgroundColor: '#FFF',
    paddingHorizontal: 15,
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f8f8f8',
    borderRadius: 8,
    paddingHorizontal: 12,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  searchIcon: {
    fontSize: 16,
    marginRight: 8,
    color: '#666',
  },
  searchInput: {
    flex: 1,
    height: 40,
    fontSize: 16,
    color: '#333',
  },
  clearSearchIcon: {
    fontSize: 16,
    color: '#666',
    paddingLeft: 8,
    fontWeight: 'bold',
  },
  sortFilterRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  sortButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#f8f8f8',
    paddingHorizontal: 15,
    paddingVertical: 10,
    borderRadius: 8,
    marginRight: 10,
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  sortButtonText: {
    fontSize: 14,
    color: '#333',
    fontWeight: '500',
  },
  dropdownIcon: {
    fontSize: 12,
    color: '#666',
  },
  filterButton: {
    backgroundColor: '#81c8c3',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
  },
  filterButtonText: {
    color: '#FFF',
    fontSize: 14,
    fontWeight: '600',
  },
  // Reset button styles
  resetContainer: {
    marginTop: 10,
    alignItems: 'center',
  },
  resetButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ff6b6b',
    paddingHorizontal: 20,
    paddingVertical: 8,
    borderRadius: 20,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  resetIcon: {
    fontSize: 14,
    marginRight: 6,
  },
  resetButtonText: {
    color: '#FFF',
    fontSize: 14,
    fontWeight: '600',
  },
  // Modal styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#FFF',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingHorizontal: 20,
    paddingBottom: 30,
    maxHeight: '80%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
  },
  modalHeaderButtons: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  resetModalButton: {
    backgroundColor: '#ff6b6b',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 15,
    marginRight: 15,
  },
  resetModalButtonText: {
    color: '#FFF',
    fontSize: 12,
    fontWeight: '600',
  },
  closeButton: {
    fontSize: 20,
    color: '#666',
    fontWeight: 'bold',
  },
  sectionContainer: {
    marginTop: 20,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 10,
  },
  optionItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 15,
    borderRadius: 8,
    marginBottom: 5,
    backgroundColor: '#f8f8f8',
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  selectedOption: {
    backgroundColor: '#e8f4f3',
    borderColor: '#81c8c3',
  },
  optionText: {
    fontSize: 14,
    color: '#666',
  },
  selectedOptionText: {
    color: '#81c8c3',
    fontWeight: '500',
  },
  checkMark: {
    fontSize: 16,
    color: '#81c8c3',
    fontWeight: 'bold',
  },
  applyButton: {
    backgroundColor: '#81c8c3',
    paddingVertical: 15,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 30,
  },
  applyButtonText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: '600',
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 40,
  },
  emptyStateText: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    marginBottom: 15,
  },
  resetEmptyStateButton: {
    backgroundColor: '#81c8c3',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
  },
  resetEmptyStateButtonText: {
    color: '#FFF',
    fontSize: 14,
    fontWeight: '600',
  },
});

export default MarketPlace;
