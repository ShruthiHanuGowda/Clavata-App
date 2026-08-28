import React, {
  useEffect,
  useState,
} from 'react';

import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  Alert,
} from 'react-native';

import { useNavigation } from '@react-navigation/native';

import {
  getActiveLocation,
  saveLocation,
} from '../../services/locationStorage';


// ============================================================
// CONSTANTS
// ============================================================

const PRIMARY = '#009D94';


// ============================================================
// TYPES
// ============================================================

type AddressLocation = {
  latitude: number;
  longitude: number;
  address: string;
};


// ============================================================
// COMPONENT
// ============================================================

export default function SalonAddressScreen() {

  const navigation = useNavigation<any>();

  const [loading, setLoading] =
    useState(true);

  const [saving, setSaving] =
    useState(false);

  const [location, setLocation] =
    useState<AddressLocation | null>(null);

  const [address, setAddress] =
    useState('');

  const [city, setCity] =
    useState('');

  const [state, setState] =
    useState('');

  const [pincode, setPincode] =
    useState('');

  const [landmark, setLandmark] =
    useState('');


  // ==========================================================
  // LOAD ACTIVE LOCATION
  // ==========================================================

  useEffect(() => {

    loadLocation();

  }, []);


  const loadLocation =
    async () => {

      try {

        setLoading(true);

        const activeLocation =
          await getActiveLocation();

        console.log(
          '📍 Salon address active location:',
          activeLocation,
        );

        if (activeLocation) {

          setLocation({
            latitude:
              activeLocation.latitude,

            longitude:
              activeLocation.longitude,

            address:
              activeLocation.address ||
              '',
          });

          setAddress(
            activeLocation.address ||
            '',
          );
        }

      } catch (error) {

        console.log(
          '❌ Failed to load salon location:',
          error,
        );

      } finally {

        setLoading(false);

      }
    };


  // ==========================================================
  // SAVE
  // ==========================================================

  const handleSave =
    async () => {

      if (!address.trim()) {

        Alert.alert(
          'Address required',
          'Please enter the salon address.',
        );

        return;
      }

      if (!location) {

        Alert.alert(
          'Location required',
          'Please select a salon location.',
        );

        return;
      }

      try {

        setSaving(true);

        const completeAddress = [
          address.trim(),
          landmark.trim(),
          city.trim(),
          state.trim(),
          pincode.trim(),
        ]
          .filter(Boolean)
          .join(', ');


        const updatedLocation:
          AddressLocation = {

          latitude:
            location.latitude,

          longitude:
            location.longitude,

          address:
            completeAddress,
        };


        console.log(
          '📍 Saving salon address:',
          updatedLocation,
        );


        await saveLocation(
          updatedLocation,
        );


        Alert.alert(
          'Success',
          'Salon address saved successfully.',
          [
            {
              text: 'OK',
              onPress: () => {
                navigation.goBack();
              },
            },
          ],
        );

      } catch (error) {

        console.log(
          '❌ Save salon address error:',
          error,
        );

        Alert.alert(
          'Error',
          'Unable to save salon address.',
        );

      } finally {

        setSaving(false);

      }
    };


  // ==========================================================
  // USE CURRENT LOCATION
  // ==========================================================

  const handleUseLocation =
    async () => {

      try {

        setLoading(true);

        const activeLocation =
          await getActiveLocation();

        if (!activeLocation) {

          Alert.alert(
            'Location unavailable',
            'No location has been selected yet.',
          );

          return;
        }


        setLocation({
          latitude:
            activeLocation.latitude,

          longitude:
            activeLocation.longitude,

          address:
            activeLocation.address ||
            '',
        });


        if (
          activeLocation.address
        ) {

          setAddress(
            activeLocation.address,
          );
        }

      } catch (error) {

        console.log(
          '❌ Location error:',
          error,
        );

        Alert.alert(
          'Error',
          'Unable to get the selected location.',
        );

      } finally {

        setLoading(false);

      }
    };


  // ==========================================================
  // LOADING
  // ==========================================================

  if (loading) {

    return (

      <View
        style={
          styles.loadingContainer
        }
      >

        <ActivityIndicator
          size="large"
          color={PRIMARY}
        />

        <Text
          style={
            styles.loadingText
          }
        >
          Loading salon location...
        </Text>

      </View>

    );
  }


  // ==========================================================
  // UI
  // ==========================================================

  return (

    <View
      style={
        styles.container
      }
    >

      {/* ======================================================
          HEADER
      ====================================================== */}

      <View
        style={
          styles.header
        }
      >

        <TouchableOpacity
          style={
            styles.backButton
          }
          onPress={() =>
            navigation.goBack()
          }
        >

          <Text
            style={
              styles.backText
            }
          >
            ←
          </Text>

        </TouchableOpacity>


        <Text
          style={
            styles.headerTitle
          }
        >
          Salon Address
        </Text>

      </View>


      {/* ======================================================
          CONTENT
      ====================================================== */}

      <ScrollView
        showsVerticalScrollIndicator={
          false
        }
        contentContainerStyle={
          styles.content
        }
      >

        {/* ====================================================
            LOCATION CARD
        ==================================================== */}

        <View
          style={
            styles.locationCard
          }
        >

          <View
            style={
              styles.locationIcon
            }
          >

            <Text
              style={
                styles.locationIconText
              }
            >
              📍
            </Text>

          </View>


          <View
            style={
              styles.locationInfo
            }
          >

            <Text
              style={
                styles.locationTitle
              }
            >
              Salon Location
            </Text>


            {location ? (

              <>
                <Text
                  style={
                    styles.coordinates
                  }
                >
                  Latitude: {
                    location.latitude
                  }
                </Text>

                <Text
                  style={
                    styles.coordinates
                  }
                >
                  Longitude: {
                    location.longitude
                  }
                </Text>
              </>

            ) : (

              <Text
                style={
                  styles.noLocation
                }
              >
                No location selected
              </Text>

            )}

          </View>

        </View>


        {/* ====================================================
            USE LOCATION
        ==================================================== */}

        <TouchableOpacity
          style={
            styles.locationButton
          }
          onPress={
            handleUseLocation
          }
        >

          <Text
            style={
              styles.locationButtonText
            }
          >
            📍 Use Selected Location
          </Text>

        </TouchableOpacity>


        {/* ====================================================
            ADDRESS
        ==================================================== */}

        <View
          style={
            styles.section
          }
        >

          <Text
            style={
              styles.label
            }
          >
            Address
          </Text>


          <TextInput
            value={address}
            onChangeText={
              setAddress
            }
            placeholder="Enter salon address"
            placeholderTextColor="#999"
            multiline
            numberOfLines={3}
            textAlignVertical="top"
            style={
              [
                styles.input,
                styles.addressInput,
              ]
            }
          />

        </View>


        {/* ====================================================
            LANDMARK
        ==================================================== */}

        <View
          style={
            styles.section
          }
        >

          <Text
            style={
              styles.label
            }
          >
            Landmark
          </Text>


          <TextInput
            value={landmark}
            onChangeText={
              setLandmark
            }
            placeholder="Enter landmark (optional)"
            placeholderTextColor="#999"
            style={
              styles.input
            }
          />

        </View>


        {/* ====================================================
            CITY
        ==================================================== */}

        <View
          style={
            styles.section
          }
        >

          <Text
            style={
              styles.label
            }
          >
            City
          </Text>


          <TextInput
            value={city}
            onChangeText={
              setCity
            }
            placeholder="Enter city"
            placeholderTextColor="#999"
            style={
              styles.input
            }
          />

        </View>


        {/* ====================================================
            STATE
        ==================================================== */}

        <View
          style={
            styles.section
          }
        >

          <Text
            style={
              styles.label
            }
          >
            State
          </Text>


          <TextInput
            value={state}
            onChangeText={
              setState
            }
            placeholder="Enter state"
            placeholderTextColor="#999"
            style={
              styles.input
            }
          />

        </View>


        {/* ====================================================
            PINCODE
        ==================================================== */}

        <View
          style={
            styles.section
          }
        >

          <Text
            style={
              styles.label
            }
          >
            Pincode
          </Text>


          <TextInput
            value={pincode}
            onChangeText={
              value =>
                setPincode(
                  value
                    .replace(
                      /[^0-9]/g,
                      '',
                    )
                    .slice(0, 6),
                )
            }
            placeholder="Enter pincode"
            placeholderTextColor="#999"
            keyboardType="numeric"
            maxLength={6}
            style={
              styles.input
            }
          />

        </View>


        {/* ====================================================
            SAVE
        ==================================================== */}

        <TouchableOpacity
          style={[
            styles.saveButton,

            saving &&
            styles.saveButtonDisabled,
          ]}
          onPress={
            handleSave
          }
          disabled={
            saving
          }
        >

          {saving ? (

            <ActivityIndicator
              color="#FFF"
            />

          ) : (

            <Text
              style={
                styles.saveButtonText
              }
            >
              Save Address
            </Text>

          )}

        </TouchableOpacity>


        <View
          style={
            styles.bottomSpace
          }
        />

      </ScrollView>

    </View>
  );
}


// ============================================================
// STYLES
// ============================================================

const styles =
  StyleSheet.create({

    container: {
      flex: 1,
      backgroundColor: '#F7F8FA',
    },


    // ========================================================
    // HEADER
    // ========================================================

    header: {
      height: 70,
      flexDirection: 'row',
      alignItems: 'center',
      paddingHorizontal: 20,
      backgroundColor: '#FFFFFF',
      borderBottomWidth: 1,
      borderBottomColor: '#EEEEEE',
    },

    backButton: {
      width: 42,
      height: 42,
      alignItems: 'center',
      justifyContent: 'center',
      marginRight: 8,
    },

    backText: {
      fontSize: 30,
      fontWeight: '600',
      color: '#111111',
    },

    headerTitle: {
      fontSize: 22,
      fontWeight: '700',
      color: '#111111',
    },


    // ========================================================
    // CONTENT
    // ========================================================

    content: {
      padding: 20,
      maxWidth: 700,
      width: '100%',
      alignSelf: 'center',
    },


    // ========================================================
    // LOCATION CARD
    // ========================================================

    locationCard: {
      backgroundColor: '#FFFFFF',
      borderRadius: 16,
      padding: 18,
      flexDirection: 'row',
      alignItems: 'center',
      borderWidth: 1,
      borderColor: '#E8E8E8',
      marginBottom: 14,
    },

    locationIcon: {
      width: 50,
      height: 50,
      borderRadius: 25,
      backgroundColor: '#EAF8F6',
      alignItems: 'center',
      justifyContent: 'center',
      marginRight: 14,
    },

    locationIconText: {
      fontSize: 24,
    },

    locationInfo: {
      flex: 1,
    },

    locationTitle: {
      fontSize: 17,
      fontWeight: '700',
      color: '#111111',
      marginBottom: 5,
    },

    coordinates: {
      fontSize: 13,
      color: '#777777',
      marginTop: 2,
    },

    noLocation: {
      fontSize: 13,
      color: '#999999',
    },


    // ========================================================
    // LOCATION BUTTON
    // ========================================================

    locationButton: {
      height: 48,
      borderRadius: 12,
      borderWidth: 1,
      borderColor: PRIMARY,
      alignItems: 'center',
      justifyContent: 'center',
      marginBottom: 24,
      backgroundColor: '#FFFFFF',
    },

    locationButtonText: {
      color: PRIMARY,
      fontSize: 15,
      fontWeight: '700',
    },


    // ========================================================
    // FORM
    // ========================================================

    section: {
      marginBottom: 18,
    },

    label: {
      fontSize: 15,
      fontWeight: '700',
      color: '#222222',
      marginBottom: 8,
    },

    input: {
      backgroundColor: '#FFFFFF',
      borderWidth: 1,
      borderColor: '#DDDDDD',
      borderRadius: 12,
      minHeight: 50,
      paddingHorizontal: 14,
      paddingVertical: 12,
      fontSize: 15,
      color: '#111111',
      outlineStyle: 'none',
    } as any,

    addressInput: {
      minHeight: 100,
      paddingTop: 14,
    },


    // ========================================================
    // SAVE BUTTON
    // ========================================================

    saveButton: {
      height: 54,
      borderRadius: 13,
      backgroundColor: PRIMARY,
      alignItems: 'center',
      justifyContent: 'center',
      marginTop: 10,
    },

    saveButtonDisabled: {
      opacity: 0.6,
    },

    saveButtonText: {
      color: '#FFFFFF',
      fontSize: 16,
      fontWeight: '700',
    },


    // ========================================================
    // LOADING
    // ========================================================

    loadingContainer: {
      flex: 1,
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: '#F7F8FA',
    },

    loadingText: {
      marginTop: 12,
      fontSize: 14,
      color: '#777777',
    },


    // ========================================================
    // BOTTOM
    // ========================================================

    bottomSpace: {
      height: 40,
    },

  });

