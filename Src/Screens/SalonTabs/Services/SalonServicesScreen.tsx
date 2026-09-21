import React, {
  useMemo,
  useState,
} from 'react';

import {
  SafeAreaView,
  View,
  Text,
  TextInput,
  FlatList,
  ActivityIndicator,
} from 'react-native';

import { useQuery } from '@apollo/client';

import { useUser } from '../../../context/UserContext';

import {
  GET_SALON_SERVICE_SELECTIONS,
} from '../../../graphql/queries';

import styles from './styles';

import CategoryFilter, {
  CategoryOption,
} from './CategoryFilter';

import {
  ServiceSelection,
} from './AddServiceModal';

export default function SalonServicesScreen() {
  const { currentUser } = useUser();

  const salonId =
    currentUser?.salonId;

  /*
   * ------------------------------------------------
   * STATE
   * ------------------------------------------------
   */

  const [
    selectedCategory,
    setSelectedCategory,
  ] = useState<string>('ALL');

  const [
    search,
    setSearch,
  ] = useState('');

  /*
   * ------------------------------------------------
   * GET SALON SERVICE SELECTIONS
   * ------------------------------------------------
   *
   * These are the services/categories selected
   * for this salon during registration/profile setup.
   */

  const {
    data: salonData,
    loading,
    refetch,
  } = useQuery(
    GET_SALON_SERVICE_SELECTIONS,
    {
      variables: {
        salonId,
      },

      skip: !salonId,

      fetchPolicy:
        'network-only',
    },
  );

  /*
   * ------------------------------------------------
   * SERVICE SELECTIONS
   * ------------------------------------------------
   */

  const serviceSelections: ServiceSelection[] =
    salonData?.getSalon
      ?.serviceSelections ?? [];

  /*
   * ------------------------------------------------
   * NORMALIZE TEXT
   * ------------------------------------------------
   */

  const normalizeText = (
    value?: string | null,
  ) => {
    return String(value ?? '')
      .trim()
      .replace(/\s+/g, ' ')
      .toLowerCase();
  };

  /*
   * ------------------------------------------------
   * CATEGORY LIST
   * ------------------------------------------------
   *
   * IMPORTANT:
   *
   * categoryId is used internally.
   * categoryName is only displayed.
   *
   * Example:
   *
   * Face -> abc123
   * Hair -> xyz456
   */

  const categories =
    useMemo<CategoryOption[]>(() => {
      const categoryMap =
        new Map<
          string,
          string
        >();

      serviceSelections.forEach(
        selection => {
          if (
            selection.categoryId &&
            selection.categoryName
          ) {
            const categoryId =
              String(
                selection.categoryId,
              );

            const categoryName =
              String(
                selection.categoryName,
              ).trim();

            if (
              !categoryMap.has(
                categoryId,
              )
            ) {
              categoryMap.set(
                categoryId,
                categoryName,
              );
            }
          }
        },
      );

      return Array.from(
        categoryMap.entries(),
      )
        .map(
          ([id, name]) => ({
            id,
            name,
          }),
        )
        .sort(
          (a, b) =>
            a.name.localeCompare(
              b.name,
              undefined,
              {
                sensitivity:
                  'base',
              },
            ),
        );
    }, [
      serviceSelections,
    ]);

  /*
   * ------------------------------------------------
   * FILTER + SORT SERVICE SELECTIONS
   * ------------------------------------------------
   *
   * This is now the MAIN LIST.
   *
   * Face -> only Face
   * Hair -> only Hair
   * All -> everything
   */

  const filteredServices =
    useMemo(() => {
      const searchValue =
        normalizeText(search);

      const filtered =
        serviceSelections.filter(
          selection => {
            /*
             * ----------------------------------------
             * CATEGORY FILTER
             * ----------------------------------------
             */

            const categoryMatch =
              selectedCategory ===
                'ALL' ||
              String(
                selection.categoryId,
              ) ===
                String(
                  selectedCategory,
                );

            /*
             * ----------------------------------------
             * SEARCH FILTER
             * ----------------------------------------
             */

            const categoryName =
              normalizeText(
                selection.categoryName,
              );

            const subcategoryName =
              normalizeText(
                selection.subcategoryName,
              );

            const searchMatch =
              !searchValue ||
              categoryName.includes(
                searchValue,
              ) ||
              subcategoryName.includes(
                searchValue,
              );

            return (
              categoryMatch &&
              searchMatch
            );
          },
        );

      /*
       * ----------------------------------------
       * ALPHABETICAL SORT
       * ----------------------------------------
       *
       * First category,
       * then subcategory.
       */

      return filtered.sort(
        (a, b) => {
          const categoryCompare =
            normalizeText(
              a.categoryName,
            ).localeCompare(
              normalizeText(
                b.categoryName,
              ),
              undefined,
              {
                sensitivity:
                  'base',
              },
            );

          if (
            categoryCompare !==
            0
          ) {
            return categoryCompare;
          }

          return normalizeText(
            a.subcategoryName,
          ).localeCompare(
            normalizeText(
              b.subcategoryName,
            ),
            undefined,
            {
              sensitivity:
                'base',
            },
          );
        },
      );
    }, [
      serviceSelections,
      selectedCategory,
      search,
    ]);

  /*
   * ------------------------------------------------
   * LOADING
   * ------------------------------------------------
   */

  if (loading) {
    return (
      <SafeAreaView
        style={[
          styles.container,
          {
            justifyContent:
              'center',
            alignItems:
              'center',
          },
        ]}
      >
        <ActivityIndicator
          size="large"
          color="#009D94"
        />
      </SafeAreaView>
    );
  }

  /*
   * ------------------------------------------------
   * RENDER
   * ------------------------------------------------
   */

  return (
    <SafeAreaView
      style={styles.container}
    >
      <FlatList
        data={filteredServices}

        /*
         * categoryId + subcategoryId
         * uniquely identifies a selection.
         */

        keyExtractor={
          item =>
            `${item.categoryId}-${item.subcategoryId}`
        }

        onRefresh={refetch}

        refreshing={loading}

        keyboardShouldPersistTaps="handled"

        /*
         * ------------------------------------------------
         * HEADER
         * ------------------------------------------------
         */

        ListHeaderComponent={
          <>
            {/* HEADER */}

            <View
              style={styles.header}
            >
              <Text
                style={styles.title}
              >
                Services
              </Text>

              <Text
                style={{
                  marginTop: 4,
                  fontSize: 13,
                  color: '#6B7280',
                }}
              >
                {
                  serviceSelections.length
                }{' '}
                service options
                available
              </Text>
            </View>

            {/* SEARCH */}

            <View
              style={
                styles.searchContainer
              }
            >
              <TextInput
                placeholder="Search service..."
                value={search}
                onChangeText={
                  setSearch
                }
                placeholderTextColor="#9CA3AF"
                style={{
                  fontSize: 15,
                  color: '#111827',
                }}
              />
            </View>

            {/* CATEGORY FILTER */}

            {categories.length >
              0 && (
              <CategoryFilter
                categories={
                  categories
                }
                selected={
                  selectedCategory
                }
                onSelect={
                  setSelectedCategory
                }
              />
            )}
          </>
        }

        /*
         * ------------------------------------------------
         * EMPTY STATE
         * ------------------------------------------------
         */

        ListEmptyComponent={
          <View
            style={{
              paddingVertical: 50,
              paddingHorizontal: 20,
              alignItems:
                'center',
            }}
          >
            {serviceSelections.length ===
            0 ? (
              <>
                <Text
                  style={{
                    fontSize: 18,
                    fontWeight:
                      '600',
                    color:
                      '#6B7280',
                    textAlign:
                      'center',
                  }}
                >
                  No services selected
                </Text>

                <Text
                  style={{
                    marginTop: 8,
                    color:
                      '#9CA3AF',
                    textAlign:
                      'center',
                    lineHeight: 20,
                  }}
                >
                  No service categories
                  or subcategories were
                  selected for this salon.
                </Text>
              </>
            ) : (
              <>
                <Text
                  style={{
                    fontSize: 17,
                    fontWeight:
                      '600',
                    color:
                      '#6B7280',
                    textAlign:
                      'center',
                  }}
                >
                  No matching services
                </Text>

                <Text
                  style={{
                    marginTop: 8,
                    color:
                      '#9CA3AF',
                    textAlign:
                      'center',
                  }}
                >
                  Try another category
                  or search term.
                </Text>
              </>
            )}
          </View>
        }

        /*
         * ------------------------------------------------
         * SERVICE ITEM
         * ------------------------------------------------
         */

        renderItem={({
          item,
        }) => (
          <View
            style={{
              marginHorizontal: 16,
              marginBottom: 10,
              paddingHorizontal: 14,
              paddingVertical: 12,
              borderRadius: 14,
              backgroundColor:
                '#E6F7F5',
            }}
          >
            <Text
              style={{
                fontSize: 13,
                fontWeight: '700',
                color:
                  '#007F78',
              }}
            >
              {item.categoryName}
            </Text>

            <Text
              style={{
                marginTop: 4,
                fontSize: 14,
                fontWeight: '600',
                color:
                  '#111827',
              }}
            >
              {item.subcategoryName}
            </Text>
          </View>
        )}

        /*
         * Bottom spacing
         */

        contentContainerStyle={{
          paddingBottom: 100,
        }}
      />
    </SafeAreaView>
  );
}