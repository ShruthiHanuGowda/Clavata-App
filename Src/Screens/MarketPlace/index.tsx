import React, { useEffect, useState, useMemo } from 'react';
import {
  SafeAreaView,
  ScrollView,
  RefreshControl,
  StyleSheet,
  Text,
  View,
  ActivityIndicator,
  Platform,
  TouchableOpacity,
} from 'react-native';
import { navigate } from '../../Navigation/NavigationFunctions';
import CollectionCard from '../../Componants/MarketPlace/CollectionCard';
import { useMagic } from '../../../screens/Provider/MagicProvider';
import useCollections from '../../hooks/useCollections';
import { Header } from '@rneui/base';
import { DText } from '../../Componants/DText';

type FilterType = 'all' | 'country' | 'type' | 'year';

const CollectionListingPage: React.FC = () => {
  const { setActiveNetwork } = useMagic();
  const { collections, loading: isLoading, refetch } = useCollections();

  const [activeFilter, setActiveFilter] = useState<FilterType>('all');
  const [selectedCountry, setSelectedCountry] = useState<string>('');
  const [selectedType, setSelectedType] = useState<string>('');
  const [selectedYear, setSelectedYear] = useState<string>('');

  useEffect(() => {
    setActiveNetwork('denergy');
  }, []);

  const filterOptions = useMemo(() => {
    const countries = [...new Set(collections?.map(c => c.country).filter((item): item is string => Boolean(item)))];
    const types = [...new Set(collections?.map(c => c.type).filter((item): item is string => Boolean(item)))];
    const years = [...new Set(collections?.map(c => c.year?.toString()).filter((item): item is string => Boolean(item)))];

    return {
      countries: countries.sort(),
      types: types.sort(),
      years: years.sort((a, b) => (b || '').localeCompare(a || ''))
    };
  }, [collections]);

  // Filter collections based on active filter and selections
  const filteredCollections = useMemo(() => {
    if (!collections) return [];

    return collections.filter(collection => {
      switch (activeFilter) {
        case 'country':
          return selectedCountry ? collection.country === selectedCountry : true;
        case 'type':
          return selectedType ? collection.type === selectedType : true;
        case 'year':
          return selectedYear ? collection.year?.toString() === selectedYear : true;
        default:
          return true;
      }
    });
  }, [collections, activeFilter, selectedCountry, selectedType, selectedYear]);

  const onRefresh = () => {
    refetch();
  };

  const handleFilterChange = (filter: FilterType) => {
    setActiveFilter(filter);
    // Reset selections when changing filter type
    if (filter !== 'country') setSelectedCountry('');
    if (filter !== 'type') setSelectedType('');
    if (filter !== 'year') setSelectedYear('');
  };

  const renderFilterTabs = () => (
    <View style={styles.filterContainer}>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.filterScrollView}>
        {[
          { key: 'all', label: 'All' },
          { key: 'country', label: 'By Country' },
          { key: 'type', label: 'By Type' },
          { key: 'year', label: 'By Year' },
        ].map((filter) => (
          <TouchableOpacity
            key={filter.key}
            style={[
              styles.filterTab,
              activeFilter === filter.key && styles.activeFilterTab,
            ]}
            onPress={() => handleFilterChange(filter.key as FilterType)}
          >
            <Text
              style={[
                styles.filterTabText,
                activeFilter === filter.key && styles.activeFilterTabText,
              ]}
            >
              {filter.label}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );

  const renderSubFilters = () => {
    if (activeFilter === 'all') return null;

    let options: string[] = [];
    let selectedValue = '';
    let onSelect = (value: string) => { };

    switch (activeFilter) {
      case 'country':
        options = filterOptions.countries;
        selectedValue = selectedCountry;
        onSelect = setSelectedCountry;
        break;
      case 'type':
        options = filterOptions.types;
        selectedValue = selectedType;
        onSelect = setSelectedType;
        break;
      case 'year':
        options = filterOptions.years;
        selectedValue = selectedYear;
        onSelect = setSelectedYear;
        break;
    }

    if (options.length === 0) return null;

    return (
      <View style={styles.subFilterContainer}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          <TouchableOpacity
            style={[
              styles.subFilterTab,
              !selectedValue && styles.activeSubFilterTab,
            ]}
            onPress={() => onSelect('')}
          >
            <Text
              style={[
                styles.subFilterTabText,
                !selectedValue && styles.activeSubFilterTabText,
              ]}
            >
              All {activeFilter === 'country' ? 'Countries' : activeFilter === 'type' ? 'Types' : 'Years'}
            </Text>
          </TouchableOpacity>
          {options.map((option) => (
            <TouchableOpacity
              key={option}
              style={[
                styles.subFilterTab,
                selectedValue === option && styles.activeSubFilterTab,
              ]}
              onPress={() => onSelect(option)}
            >
              <Text
                style={[
                  styles.subFilterTabText,
                  selectedValue === option && styles.activeSubFilterTabText,
                ]}
              >
                {option}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      {isLoading ? (
        <View style={styles.loaderContainer}>
          <ActivityIndicator size="large" color="#81c8c3" />
          <Text style={styles.loaderText}>Loading Collections...</Text>
        </View>
      ) : (
        <View>
          <Header
            containerStyle={{
              borderBottomWidth: 0,
            }}
            backgroundColor={'#FFF'}
            leftComponent={
              <View style={styles.nameContainer}>
                <DText style={styles.title} fontStyle="fontBold">
                  Marketplace
                </DText>
              </View>
            }
          />

          {renderFilterTabs()}
          {renderSubFilters()}

          <ScrollView
            contentContainerStyle={styles.gridContainer}
            refreshControl={
              <RefreshControl refreshing={isLoading} onRefresh={onRefresh} />
            }>
            <>
              {filteredCollections?.map((collection, index) => (
                <View
                  key={collection.id}
                  style={{
                    marginBottom: index === filteredCollections.length - 1 ? 150 : 0,
                  }}>
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
              {filteredCollections?.length === 0 && (
                <View style={styles.emptyState}>
                  <Text style={styles.emptyStateText}>
                    No collections found for the selected filter
                  </Text>
                </View>
              )}
            </>
          </ScrollView>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f2f2f2',
    paddingTop: Platform.OS === 'ios' ? 0 : 20,
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
  filterContainer: {
    backgroundColor: '#FFF',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  filterScrollView: {
    paddingHorizontal: 10,
  },
  filterTab: {
    paddingHorizontal: 20,
    paddingVertical: 8,
    marginRight: 10,
    borderRadius: 20,
    backgroundColor: '#f5f5f5',
    borderWidth: 1,
    borderColor: '#ddd',
  },
  activeFilterTab: {
    backgroundColor: '#81c8c3',
    borderColor: '#81c8c3',
  },
  filterTabText: {
    fontSize: 14,
    color: '#666',
    fontWeight: '500',
  },
  activeFilterTabText: {
    color: '#FFF',
  },
  subFilterContainer: {
    backgroundColor: '#FFF',
    paddingVertical: 8,
    paddingHorizontal: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  subFilterTab: {
    paddingHorizontal: 16,
    paddingVertical: 6,
    marginRight: 8,
    borderRadius: 16,
    backgroundColor: '#f8f8f8',
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  activeSubFilterTab: {
    backgroundColor: '#81c8c3',
    borderColor: '#81c8c3',
  },
  subFilterTabText: {
    fontSize: 12,
    color: '#666',
    fontWeight: '400',
  },
  activeSubFilterTabText: {
    color: '#FFF',
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
  },
});

export default CollectionListingPage;