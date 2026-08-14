import React from 'react';

import {
  SafeAreaView,
  View,
  Text,
  StyleSheet,
  Alert,
  ScrollView,
  ActivityIndicator,
} from 'react-native';

import {
  useMutation,
} from '@apollo/client';

import {
  Header,
  DButton,
} from '../../components';

import {
  REGISTER_SALON_PARTNER,
} from '../../graphql/queries';

import {
  useSalonRegistration,
} from '../../context/SalonRegistrationContext';

import {
  useUser,
} from '../../context/UserContext';

import {
  COLORS,
  FONTS,
  FONT_SIZES,
  SPACING,
  RADIUS,
} from '../../constants/constants';

export default function SalonReviewScreen({
  navigation,
}: any) {
  const {
    data,
    reset,
  } = useSalonRegistration();

  const {
    currentUser,
    setCurrentUser,
  } = useUser();

  const [
    registerSalonPartner,
    {
      loading,
    },
  ] = useMutation(
    REGISTER_SALON_PARTNER,
  );

  // ===================================================
  // SUBMIT
  // ===================================================

  const onSubmit = async () => {
    // -------------------------------------------------
    // USER CHECK
    // -------------------------------------------------

    if (!currentUser?.userId) {
      Alert.alert(
        'Session Expired',
        'Please sign in again.',
      );

      return;
    }

    // -------------------------------------------------
    // REGISTRATION DATA CHECK
    // -------------------------------------------------

    if (!data.userId) {
      Alert.alert(
        'Registration Error',
        'User information is missing. Please restart registration.',
      );

      return;
    }

    if (!data.salonName) {
      Alert.alert(
        'Registration Error',
        'Salon name is missing.',
      );

      return;
    }

    if (!data.addressLine) {
      Alert.alert(
        'Registration Error',
        'Salon address is missing.',
      );

      return;
    }

    try {
      console.log(
        '==========================================',
      );

      console.log(
        'SUBMITTING SALON REGISTRATION',
      );

      console.log(
        'USER ID:',
        data.userId,
      );

      console.log(
        'CURRENT USER ID:',
        currentUser.userId,
      );

      console.log(
        'CURRENT SALON ID:',
        currentUser.salonId,
      );

      console.log(
        'SALON NAME:',
        data.salonName,
      );

      console.log(
        '==========================================',
      );

      // -------------------------------------------------
      // IMPORTANT:
      //
      // DO NOT SEND salonId.
      //
      // The backend must CREATE the salon and return
      // the newly generated salonId.
      // -------------------------------------------------

      const response =
        await registerSalonPartner({
          variables: {
            input: {
              userId:
                currentUser.userId,

              phoneNumber:
                currentUser.phoneNumber ||
                data.phoneNumber,

              salonName:
                data.salonName,

              ownerName:
                data.ownerName,

              email:
                data.email,

              businessType:
                data.businessType,

              address: {
                addressLine:
                  data.addressLine,

                city:
                  data.city,

                state:
                  data.state,

                pincode:
                  data.pincode,
              },

              businessHours:
                data.businessHours,

              gstNumber:
                data.gstNumber || '',

              panNumber:
                data.panNumber,

              aadhaarNumber:
                data.aadhaarNumber,

              bankAccount:
                data.bankAccount,

              ifsc:
                data.ifsc,
            },
          },
        });

      console.log(
        '==========================================',
      );

      console.log(
        'REGISTER SALON RESPONSE:',
      );

      console.log(
        JSON.stringify(
          response.data,
          null,
          2,
        ),
      );

      console.log(
        '==========================================',
      );

      const result =
        response.data
          ?.registerSalonPartner;

      // -------------------------------------------------
      // BACKEND FAILURE
      // -------------------------------------------------

      if (!result?.success) {
        Alert.alert(
          'Registration Failed',
          result?.message ||
          'Unable to register your salon.',
        );

        return;
      }

      // -------------------------------------------------
      // GET CREATED SALON ID
      // -------------------------------------------------

      const salonId =
        result?.salonId;

      console.log(
        'NEW SALON ID:',
        salonId,
      );

      // -------------------------------------------------
      // THIS IS CRITICAL
      // -------------------------------------------------

      if (!salonId) {
        console.error(
          'REGISTER_SALON_PARTNER succeeded but salonId is missing.',
        );

        Alert.alert(
          'Registration Error',
          'Salon was created, but the salon ID was not returned by the server. Please check the backend response.',
        );

        return;
      }

      // -------------------------------------------------
      // UPDATE USER
      // -------------------------------------------------

      const existingRoles =
        currentUser.roles || {
          customer: false,
          businessPartner: false,
        };

      const updatedUser = {
        ...currentUser,

        activeRole:
          'PROVIDER',

        providerStatus:
          'PENDING',

        salonId:
          salonId,

        roles: {
          ...existingRoles,

          businessPartner:
            true,
        },
      };

      console.log(
        '==========================================',
      );

      console.log(
        'UPDATED USER:',
      );

      console.log(
        JSON.stringify(
          updatedUser,
          null,
          2,
        ),
      );

      console.log(
        '==========================================',
      );

      // -------------------------------------------------
      // SAVE USER
      // -------------------------------------------------

      setCurrentUser(
        updatedUser,
      );

      // -------------------------------------------------
      // IMPORTANT:
      //
      // Do NOT reset before setCurrentUser.
      // -------------------------------------------------

      reset();

      // -------------------------------------------------
      // GO TO APP
      // -------------------------------------------------

      Alert.alert(
        'Registration Submitted',
        'Your salon registration has been submitted for verification.',
        [
          {
            text: 'Continue',
            onPress: () => {
              navigation.reset({
                index: 0,

                routes: [
                  {
                    name:
                      'appScreens',
                  },
                ],
              });
            },
          },
        ],
      );
    } catch (error: any) {
      console.error(
        '==========================================',
      );

      console.error(
        'REGISTER SALON ERROR',
      );

      console.error(
        error,
      );

      console.error(
        'MESSAGE:',
        error?.message,
      );

      console.error(
        'GRAPHQL ERRORS:',
        error?.graphQLErrors,
      );

      console.error(
        'NETWORK ERROR:',
        error?.networkError,
      );

      console.error(
        '==========================================',
      );

      Alert.alert(
        'Registration Failed',
        error?.message ||
        'Something went wrong while registering the salon.',
      );
    }
  };

  // ===================================================
  // UI
  // ===================================================

  return (
    <SafeAreaView
      style={styles.container}
    >
      <Header
        headerTitle="Review Details"
      />

      <ScrollView
        contentContainerStyle={
          styles.content
        }
        showsVerticalScrollIndicator={false}
      >
        <View
          style={styles.header}
        >
          <Text
            style={styles.title}
          >
            Review your details
          </Text>

          <Text
            style={styles.subtitle}
          >
            Please check everything before submitting your salon registration.
          </Text>
        </View>

        <View
          style={styles.card}
        >
          <DetailRow
            label="Salon"
            value={
              data.salonName
            }
          />

          <DetailRow
            label="Owner"
            value={
              data.ownerName
            }
          />

          <DetailRow
            label="Email"
            value={
              data.email
            }
          />

          <DetailRow
            label="Business type"
            value={
              data.businessType
            }
          />

          <DetailRow
            label="Address"
            value={`${data.addressLine}, ${data.city}, ${data.state} - ${data.pincode}`}
          />

          <DetailRow
            label="GST"
            value={
              data.gstNumber ||
              'Not provided'
            }
          />

          <DetailRow
            label="PAN"
            value={
              data.panNumber ||
              '-'
            }
          />

          <DetailRow
            label="Aadhaar"
            value={
              data.aadhaarNumber ||
              '-'
            }
          />

          <DetailRow
            label="Bank account"
            value={
              data.bankAccount ||
              '-'
            }
          />

          <DetailRow
            label="IFSC"
            value={
              data.ifsc ||
              '-'
            }
            last
          />
        </View>

        <View
          style={styles.notice}
        >
          <Text
            style={styles.noticeTitle}
          >
            Verification
          </Text>

          <Text
            style={styles.noticeText}
          >
            After submission, your salon will be reviewed before provider access is fully activated.
          </Text>
        </View>

        <DButton
          type="primary"
          style={[
            styles.button,
            loading &&
            styles.buttonDisabled,
          ]}
          onPress={
            onSubmit
          }
          disabled={
            loading
          }
        >
          {loading ? (
            <View
              style={
                styles.loadingContent
              }
            >
              <ActivityIndicator
                size="small"
                color={
                  COLORS.white
                }
              />

              <Text
                style={
                  styles.buttonText
                }
              >
                Submitting...
              </Text>
            </View>
          ) : (
            <Text
              style={
                styles.buttonText
              }
            >
              Submit Registration
            </Text>
          )}
        </DButton>
      </ScrollView>
    </SafeAreaView>
  );
}

// =====================================================
// DETAIL ROW
// =====================================================

function DetailRow({
  label,
  value,
  last = false,
}: {
  label: string;
  value: string;
  last?: boolean;
}) {
  return (
    <View
      style={[
        styles.detailRow,
        !last &&
        styles.detailBorder,
      ]}
    >
      <Text
        style={
          styles.detailLabel
        }
      >
        {label}
      </Text>

      <Text
        style={
          styles.detailValue
        }
      >
        {value || '-'}
      </Text>
    </View>
  );
}

// =====================================================
// STYLES
// =====================================================

const styles = StyleSheet.create({
  container: {
    flex: 1,

    backgroundColor:
      COLORS.background,
  },

  content: {
    paddingHorizontal:
      SPACING.xxl,

    paddingTop:
      SPACING.xxl,

    paddingBottom:
      SPACING.xxxl,
  },

  header: {
    marginBottom:
      SPACING.xxl,
  },

  title: {
    fontFamily:
      FONTS.semiBold,

    fontSize:
      FONT_SIZES.title,

    lineHeight:
      FONT_SIZES.title + 5,

    color:
      COLORS.text,

    textAlign:
      'center',

    letterSpacing:
      -0.2,
  },

  subtitle: {
    marginTop:
      SPACING.small,

    fontFamily:
      FONTS.regular,

    fontSize:
      FONT_SIZES.small,

    lineHeight:
      FONT_SIZES.small + 7,

    color:
      COLORS.textSecondary,

    textAlign:
      'center',
  },

  card: {
    backgroundColor:
      COLORS.surface,

    borderWidth: 1,

    borderColor:
      COLORS.border,

    borderRadius:
      RADIUS.large,

    paddingHorizontal:
      SPACING.xl,
  },

  detailRow: {
    paddingVertical:
      SPACING.large,
  },

  detailBorder: {
    borderBottomWidth: 1,

    borderBottomColor:
      COLORS.border,
  },

  detailLabel: {
    fontFamily:
      FONTS.semiBold,

    fontSize:
      FONT_SIZES.small,

    color:
      COLORS.textSecondary,

    marginBottom:
      SPACING.xs,
  },

  detailValue: {
    fontFamily:
      FONTS.regular,

    fontSize:
      FONT_SIZES.body,

    lineHeight:
      FONT_SIZES.body + 6,

    color:
      COLORS.text,
  },

  notice: {
    marginTop:
      SPACING.xl,

    padding:
      SPACING.large,

    borderRadius:
      RADIUS.medium,

    backgroundColor:
      '#F0FAF8',

    borderWidth: 1,

    borderColor:
      '#D5EFEB',
  },

  noticeTitle: {
    fontFamily:
      FONTS.semiBold,

    fontSize:
      FONT_SIZES.small,

    color:
      COLORS.primary,
  },

  noticeText: {
    marginTop:
      SPACING.xs,

    fontFamily:
      FONTS.regular,

    fontSize:
      FONT_SIZES.small,

    lineHeight:
      FONT_SIZES.small + 7,

    color:
      COLORS.textSecondary,
  },

  button: {
    width: '100%',

    height: 54,

    borderRadius:
      RADIUS.medium,

    marginTop:
      SPACING.xl,
  },

  buttonDisabled: {
    opacity: 0.7,
  },

  buttonText: {
    color:
      COLORS.white,

    fontFamily:
      FONTS.semiBold,

    fontSize:
      FONT_SIZES.body,

    textAlign:
      'center',
  },

  loadingContent: {
    flexDirection:
      'row',

    alignItems:
      'center',

    justifyContent:
      'center',

    gap: 10,
  },
});