import React, {
  useCallback,
} from 'react';

import {
  View,
  Text,
  Pressable,
  StyleSheet,
  ScrollView,
  Alert,
} from 'react-native';

import {
  useNavigation,
  useRoute,
} from '@react-navigation/native';


// ============================================================
// TYPES
// ============================================================

type Offer = {
  id: string;

  discount: string;

  title: string;

  description: string;

  code?: string;

  minimum?: string;

  category: string;

  expires?: string;

  featured?: boolean;

  startDate: string;

  endDate: string;

  salonId: string;

  discountType:
    | 'PERCENTAGE'
    | 'FIXED';

  discountValue: number;

  usageCount: number;

  usageLimit?: number | null;
};


// ============================================================
// HELPERS
// ============================================================

const formatDate = (
  dateString: string,
): string => {

  if (!dateString) {
    return '';
  }

  const date =
    new Date(dateString);

  if (
    Number.isNaN(
      date.getTime(),
    )
  ) {
    return dateString;
  }

  return date.toLocaleDateString(
    'en-IN',
    {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    },
  );
};


const formatDiscount = (
  offer: Offer,
): string => {

  if (
    offer.discountType ===
    'PERCENTAGE'
  ) {
    return `${offer.discountValue}%`;
  }

  return `₹${Number(
    offer.discountValue,
  ).toLocaleString(
    'en-IN',
  )}`;
};


// ============================================================
// SCREEN
// ============================================================

export default function OfferDetailsScreen() {

  const navigation =
    useNavigation<any>();

  const route =
    useRoute<any>();


  const offer =
    route.params?.offer as
    | Offer
    | undefined;


  // ==========================================================
  // INVALID OFFER
  // ==========================================================

  if (!offer) {

    return (

      <View
        style={
          styles.errorScreen
        }
      >

        <View
          style={
            styles.errorCard
          }
        >

          <Text
            style={
              styles.errorTitle
            }
          >
            Offer unavailable
          </Text>


          <Text
            style={
              styles.errorText
            }
          >
            We couldn't find the offer
            you're looking for.
          </Text>


          <Pressable
            onPress={() =>
              navigation.goBack()
            }

            style={
              styles.backButton
            }
          >

            <Text
              style={
                styles.backButtonText
              }
            >
              Go back
            </Text>

          </Pressable>

        </View>

      </View>
    );
  }


  // ==========================================================
  // COPY CODE
  // ==========================================================

  const handleCopyCode =
    useCallback(() => {

      if (!offer.code) {
        return;
      }

      /*
       * React Navigation uses `navigation`.
       *
       * For browser clipboard access on React Native Web,
       * use globalThis.navigator instead of `navigator`.
       */

      const browserNavigator =
        (globalThis as any).navigator;


      if (
        browserNavigator?.clipboard
      ) {

        browserNavigator.clipboard
          .writeText(
            offer.code,
          )
          .then(() => {

            Alert.alert(
              'Copied',
              'Coupon code copied to clipboard.',
            );

          })
          .catch(() => {

            Alert.alert(
              'Coupon Code',
              offer.code,
            );

          });

        return;
      }


      /*
       * Fallback for environments where
       * Clipboard API is not available.
       */

      Alert.alert(
        'Coupon Code',
        offer.code,
      );

    }, [
      offer.code,
    ]);


  // ==========================================================
  // USE OFFER
  // ==========================================================

  const handleUseOffer =
    useCallback(() => {

      if (offer.code) {

        handleCopyCode();

        return;
      }

      Alert.alert(
        'Offer selected',
        'This offer will be applied when you make a booking.',
      );

    }, [
      offer.code,
      handleCopyCode,
    ]);


  // ==========================================================
  // RENDER
  // ==========================================================

  return (

    <View
      style={
        styles.screen
      }
    >

      <ScrollView
        showsVerticalScrollIndicator={
          false
        }

        contentContainerStyle={
          styles.scrollContent
        }
      >

        {/* ================================================== */}
        {/* TOP BAR */}
        {/* ================================================== */}

        <View
          style={
            styles.topBar
          }
        >

          <Pressable
            onPress={() =>
              navigation.goBack()
            }

            style={({ hovered }: any) => [
              styles.backCircle,

              hovered &&
              styles.backCircleHover,
            ]}
          >

            <Text
              style={
                styles.backIcon
              }
            >
              ‹
            </Text>

          </Pressable>


          <Text
            style={
              styles.topBarTitle
            }
          >
            Offer details
          </Text>


          <View
            style={
              styles.topBarSpacer
            }
          />

        </View>


        {/* ================================================== */}
        {/* MAIN CONTENT */}
        {/* ================================================== */}

        <View
          style={
            styles.content
          }
        >

          {/* ================================================= */}
          {/* HERO */}
          {/* ================================================= */}

          <View
            style={
              styles.heroCard
            }
          >

            <View
              style={
                styles.discountCircle
              }
            >

              <Text
                style={
                  styles.discountValue
                }
              >
                {
                  formatDiscount(
                    offer,
                  )
                }
              </Text>


              <Text
                style={
                  styles.discountLabel
                }
              >
                OFF
              </Text>

            </View>


            <View
              style={
                styles.heroContent
              }
            >

              <View
                style={
                  styles.categoryBadge
                }
              >

                <Text
                  style={
                    styles.categoryBadgeText
                  }
                >
                  {
                    offer.category
                  }
                </Text>

              </View>


              <Text
                style={
                  styles.heroTitle
                }
              >
                {
                  offer.title
                }
              </Text>


              <Text
                style={
                  styles.heroDescription
                }
              >
                {
                  offer.description
                }
              </Text>

            </View>

          </View>


          {/* ================================================= */}
          {/* COUPON */}
          {/* ================================================= */}

          {offer.code && (

            <View
              style={
                styles.section
              }
            >

              <Text
                style={
                  styles.sectionTitle
                }
              >
                Coupon code
              </Text>


              <View
                style={
                  styles.couponCard
                }
              >

                <View
                  style={
                    styles.couponLeft
                  }
                >

                  <Text
                    style={
                      styles.couponLabel
                    }
                  >
                    USE THIS CODE
                  </Text>


                  <Text
                    style={
                      styles.couponCode
                    }
                  >
                    {
                      offer.code
                    }
                  </Text>

                </View>


                <Pressable
                  onPress={
                    handleCopyCode
                  }

                  style={({ hovered }: any) => [
                    styles.copyButton,

                    hovered &&
                    styles.copyButtonHover,
                  ]}
                >

                  <Text
                    style={
                      styles.copyButtonText
                    }
                  >
                    Copy
                  </Text>

                </Pressable>

              </View>

            </View>

          )}


          {/* ================================================= */}
          {/* OFFER INFORMATION */}
          {/* ================================================= */}

          <View
            style={
              styles.section
            }
          >

            <Text
              style={
                styles.sectionTitle
              }
            >
              Offer information
            </Text>


            <View
              style={
                styles.infoCard
              }
            >

              {/* DISCOUNT */}

              <InfoRow
                label="Discount"
                value={
                  offer.discount
                }
              />


              {/* CATEGORY */}

              <InfoRow
                label="Category"
                value={
                  offer.category
                }
              />


              {/* MINIMUM */}

              {offer.minimum && (

                <InfoRow
                  label="Minimum booking"
                  value={
                    offer.minimum
                  }
                />

              )}


              {/* START DATE */}

              <InfoRow
                label="Valid from"
                value={
                  formatDate(
                    offer.startDate,
                  )
                }
              />


              {/* END DATE */}

              <InfoRow
                label="Valid until"
                value={
                  formatDate(
                    offer.endDate,
                  )
                }
              />


              {/* USAGE */}

              <InfoRow
                label="Times used"
                value={
                  `${offer.usageCount}`
                }
              />

            </View>

          </View>


          {/* ================================================= */}
          {/* VALIDITY */}
          {/* ================================================= */}

          <View
            style={
              styles.validityCard
            }
          >

            <View
              style={
                styles.validityIcon
              }
            >

              <Text
                style={
                  styles.validityIconText
                }
              >
                ✓
              </Text>

            </View>


            <View
              style={
                styles.validityContent
              }
            >

              <Text
                style={
                  styles.validityTitle
                }
              >
                Offer validity
              </Text>


              <Text
                style={
                  styles.validityText
                }
              >
                Valid from{' '}
                {
                  formatDate(
                    offer.startDate,
                  )
                }{' '}
                to{' '}
                {
                  formatDate(
                    offer.endDate,
                  )
                }
                .
              </Text>

            </View>

          </View>


          {/* ================================================= */}
          {/* TERMS */}
          {/* ================================================= */}

          <View
            style={
              styles.termsCard
            }
          >

            <Text
              style={
                styles.termsTitle
              }
            >
              Good to know
            </Text>


            <Text
              style={
                styles.termsText
              }
            >
              • Offer is valid only during
              the specified validity period.
            </Text>


            <Text
              style={
                styles.termsText
              }
            >
              • Minimum booking requirements
              may apply.
            </Text>


            {offer.code && (

              <Text
                style={
                  styles.termsText
                }
              >
                • Use the coupon code at
                checkout to receive the discount.
              </Text>

            )}

          </View>


          {/* ================================================= */}
          {/* ACTION */}
          {/* ================================================= */}

          <Pressable
            onPress={
              handleUseOffer
            }

            style={({ hovered }: any) => [
              styles.useOfferButton,

              hovered &&
              styles.useOfferButtonHover,
            ]}
          >

            <Text
              style={
                styles.useOfferButtonText
              }
            >
              {offer.code
                ? 'Copy code & use offer'
                : 'Use this offer'}
            </Text>


            <Text
              style={
                styles.useOfferArrow
              }
            >
              →
            </Text>

          </Pressable>


          {/* ================================================= */}
          {/* FOOTER */}
          {/* ================================================= */}

          <Text
            style={
              styles.footerText
            }
          >
            Offer provided through Clavata.
            Availability may vary by salon.
          </Text>

        </View>

      </ScrollView>

    </View>
  );
}


// ============================================================
// INFO ROW
// ============================================================

type InfoRowProps = {
  label: string;
  value: string;
};


function InfoRow({
  label,
  value,
}: InfoRowProps) {

  return (

    <View
      style={
        styles.infoRow
      }
    >

      <Text
        style={
          styles.infoLabel
        }
      >
        {label}
      </Text>


      <Text
        style={
          styles.infoValue
        }
      >
        {value}
      </Text>

    </View>
  );
}


// ============================================================
// STYLES
// ============================================================

const styles =
  StyleSheet.create({

    // ========================================================
    // SCREEN
    // ========================================================

    screen: {
      flex: 1,

      backgroundColor:
        '#F7F7F5',
    },


    scrollContent: {
      paddingBottom: 60,
    },


    // ========================================================
    // TOP BAR
    // ========================================================

    topBar: {
      height: 76,

      width: '100%',

      flexDirection: 'row',

      alignItems: 'center',

      paddingHorizontal: 42,

      backgroundColor:
        '#FFFFFF',

      borderBottomWidth: 1,

      borderBottomColor:
        '#EAEAE7',
    },


    backCircle: {
      width: 38,

      height: 38,

      borderRadius: 11,

      alignItems: 'center',

      justifyContent: 'center',

      backgroundColor:
        '#F4F4F2',

      borderWidth: 1,

      borderColor:
        '#E5E5E2',

      cursor: 'pointer',
    } as any,


    backCircleHover: {
      backgroundColor:
        '#EAEAE7',
    },


    backIcon: {
      fontSize: 29,

      lineHeight: 31,

      color:
        '#222222',

      fontWeight: '300',

      marginTop: -3,
    },


    topBarTitle: {
      marginLeft: 16,

      fontSize: 16,

      fontWeight: '700',

      color: '#111111',
    },


    topBarSpacer: {
      flex: 1,
    },


    // ========================================================
    // CONTENT
    // ========================================================

    content: {
      width: '100%',

      maxWidth: 920,

      alignSelf: 'center',

      paddingHorizontal: 40,

      paddingTop: 38,
    },


    // ========================================================
    // HERO
    // ========================================================

    heroCard: {
      width: '100%',

      minHeight: 230,

      borderRadius: 24,

      backgroundColor: '#111111',

      padding: 34,

      flexDirection: 'row',

      alignItems: 'center',

      overflow: 'hidden',
    },


    discountCircle: {
      width: 150,

      height: 150,

      borderRadius: 75,

      backgroundColor: '#FFFFFF',

      alignItems: 'center',

      justifyContent: 'center',

      flexShrink: 0,

      marginRight: 34,
    },


    discountValue: {
      fontSize: 34,

      fontWeight: '900',

      color: '#111111',

      letterSpacing: -1,
    },


    discountLabel: {
      marginTop: 2,

      fontSize: 11,

      fontWeight: '800',

      letterSpacing: 2,

      color: '#777777',
    },


    heroContent: {
      flex: 1,

      minWidth: 0,
    },


    categoryBadge: {
      alignSelf: 'flex-start',

      paddingHorizontal: 10,

      paddingVertical: 5,

      borderRadius: 8,

      backgroundColor: '#FFFFFF',
    },


    categoryBadgeText: {
      fontSize: 10,

      fontWeight: '800',

      color: '#111111',

      textTransform: 'uppercase',

      letterSpacing: 0.6,
    },


    heroTitle: {
      marginTop: 14,

      fontSize: 32,

      lineHeight: 38,

      fontWeight: '800',

      color: '#FFFFFF',

      letterSpacing: -0.8,
    },


    heroDescription: {
      marginTop: 9,

      fontSize: 14,

      lineHeight: 21,

      color: '#BEBEBE',

      maxWidth: 600,
    },


    // ========================================================
    // SECTION
    // ========================================================

    section: {
      marginTop: 28,
    },


    sectionTitle: {
      marginBottom: 12,

      fontSize: 15,

      fontWeight: '800',

      color: '#111111',
    },


    // ========================================================
    // COUPON
    // ========================================================

    couponCard: {
      minHeight: 92,

      borderRadius: 16,

      backgroundColor: '#FFFFFF',

      borderWidth: 1,

      borderColor: '#E5E5E2',

      paddingHorizontal: 20,

      paddingVertical: 16,

      flexDirection: 'row',

      alignItems: 'center',

      justifyContent: 'space-between',
    },


    couponLeft: {
      flex: 1,

      minWidth: 0,
    },


    couponLabel: {
      fontSize: 9,

      fontWeight: '800',

      letterSpacing: 1.2,

      color: '#999999',
    },


    couponCode: {
      marginTop: 5,

      fontSize: 22,

      fontWeight: '900',

      letterSpacing: 1.5,

      color: '#111111',
    },


    copyButton: {
      minWidth: 78,

      height: 38,

      paddingHorizontal: 16,

      borderRadius: 10,

      alignItems: 'center',

      justifyContent: 'center',

      backgroundColor: '#111111',

      cursor: 'pointer',
    } as any,


    copyButtonHover: {
      backgroundColor: '#333333',
    },


    copyButtonText: {
      fontSize: 12,

      fontWeight: '700',

      color: '#FFFFFF',
    },


    // ========================================================
    // INFORMATION
    // ========================================================

    infoCard: {
      backgroundColor: '#FFFFFF',

      borderRadius: 16,

      borderWidth: 1,

      borderColor: '#E5E5E2',

      paddingHorizontal: 20,
    },


    infoRow: {
      minHeight: 58,

      flexDirection: 'row',

      alignItems: 'center',

      justifyContent: 'space-between',

      borderBottomWidth: 1,

      borderBottomColor: '#F0F0ED',
    },


    infoRowLast: {
      borderBottomWidth: 0,
    },


    infoLabel: {
      fontSize: 12,

      color: '#888888',
    },


    infoValue: {
      fontSize: 13,

      fontWeight: '700',

      color: '#222222',

      textAlign: 'right',

      maxWidth: '60%',
    },


    // ========================================================
    // VALIDITY
    // ========================================================

    validityCard: {
      marginTop: 20,

      padding: 18,

      borderRadius: 16,

      backgroundColor: '#F1F1EE',

      flexDirection: 'row',

      alignItems: 'center',
    },


    validityIcon: {
      width: 38,

      height: 38,

      borderRadius: 11,

      backgroundColor: '#111111',

      alignItems: 'center',

      justifyContent: 'center',

      marginRight: 13,
    },


    validityIconText: {
      fontSize: 17,

      fontWeight: '800',

      color: '#FFFFFF',
    },


    validityContent: {
      flex: 1,

      minWidth: 0,
    },


    validityTitle: {
      fontSize: 12,

      fontWeight: '800',

      color: '#111111',
    },


    validityText: {
      marginTop: 3,

      fontSize: 11,

      lineHeight: 17,

      color: '#777777',
    },


    // ========================================================
    // TERMS
    // ========================================================

    termsCard: {
      marginTop: 20,

      padding: 20,

      borderRadius: 16,

      backgroundColor: '#FFFFFF',

      borderWidth: 1,

      borderColor: '#E5E5E2',
    },


    termsTitle: {
      fontSize: 13,

      fontWeight: '800',

      color: '#111111',

      marginBottom: 10,
    },


    termsText: {
      fontSize: 11,

      lineHeight: 20,

      color: '#777777',

      marginTop: 3,
    },


    // ========================================================
    // BUTTON
    // ========================================================

    useOfferButton: {
      marginTop: 28,

      width: '100%',

      height: 56,

      borderRadius: 15,

      backgroundColor: '#111111',

      flexDirection: 'row',

      alignItems: 'center',

      justifyContent: 'center',

      cursor: 'pointer',
    } as any,


    useOfferButtonHover: {
      backgroundColor: '#2A2A2A',
    },


    useOfferButtonText: {
      fontSize: 14,

      fontWeight: '800',

      color: '#FFFFFF',
    },


    useOfferArrow: {
      marginLeft: 12,

      fontSize: 20,

      color: '#FFFFFF',

      marginTop: -2,
    },


    // ========================================================
    // FOOTER
    // ========================================================

    footerText: {
      marginTop: 18,

      textAlign: 'center',

      fontSize: 10,

      color: '#AAAAAA',
    },


    // ========================================================
    // ERROR
    // ========================================================

    errorScreen: {
      flex: 1,

      alignItems: 'center',

      justifyContent: 'center',

      backgroundColor: '#F7F7F5',

      padding: 30,
    },


    errorCard: {
      width: '100%',

      maxWidth: 460,

      padding: 40,

      borderRadius: 20,

      backgroundColor: '#FFFFFF',

      borderWidth: 1,

      borderColor: '#E5E5E2',

      alignItems: 'center',
    },


    errorTitle: {
      fontSize: 24,

      fontWeight: '800',

      color: '#111111',
    },


    errorText: {
      marginTop: 8,

      fontSize: 13,

      color: '#777777',

      textAlign: 'center',
    },


    backButton: {
      marginTop: 24,

      paddingHorizontal: 24,

      paddingVertical: 11,

      borderRadius: 10,

      backgroundColor: '#111111',

      cursor: 'pointer',
    } as any,


    backButtonText: {
      fontSize: 12,

      fontWeight: '700',

      color: '#FFFFFF',
    },

  });