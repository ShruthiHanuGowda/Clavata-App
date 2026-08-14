import React from 'react';

import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
} from 'react-native';

import {
  useUser,
} from '../../../context/UserContext';

import {
  COLORS,
  FONT_SIZES,
  SPACING,
  RADIUS,
} from '../../../constants/constants';


// ============================================================
// TYPES
// ============================================================

type Props = {
  location: string;
  onPressLocation: () => void;
};


// ============================================================
// COMPONENT
// ============================================================

export default function HomeHeader({
  location,
  onPressLocation,
}: Props) {

  const {
    currentUser,
  } = useUser();


  // ----------------------------------------------------------
  // FIRST NAME
  // ----------------------------------------------------------

  const firstName =
    currentUser?.fullName
      ?.trim()
      ?.split(' ')[0] ||
    'there';


  return (
    <View style={styles.container}>

      {/* ======================================================
          GREETING
      ====================================================== */}

      <View style={styles.greetingSection}>

        <Text style={styles.eyebrow}>
          WELCOME BACK
        </Text>

        <Text
          style={styles.title}
          numberOfLines={1}
        >
          Hello, {firstName}
        </Text>

      </View>


      {/* ======================================================
          LOCATION
      ====================================================== */}

      <TouchableOpacity
        style={styles.locationButton}
        onPress={onPressLocation}
        activeOpacity={0.75}
      >

        {/* ----------------------------------------------------
            LOCATION SYMBOL
            Keeping the familiar 📍 symbol
        ---------------------------------------------------- */}

        <View style={styles.locationIconContainer}>

          <Text style={styles.locationIcon}>
            📍
          </Text>

        </View>


        {/* ----------------------------------------------------
            LOCATION CONTENT
        ---------------------------------------------------- */}

        <View style={styles.locationContent}>

          <Text style={styles.locationLabel}>
            YOUR LOCATION
          </Text>

          <Text
            style={styles.locationText}
            numberOfLines={1}
          >
            {location || 'Choose location'}
          </Text>

        </View>


        {/* ----------------------------------------------------
            ARROW
        ---------------------------------------------------- */}

        <Text style={styles.arrow}>
          ›
        </Text>

      </TouchableOpacity>

    </View>
  );
}


// ============================================================
// STYLES
// ============================================================

const styles = StyleSheet.create({

  // ==========================================================
  // CONTAINER
  // ==========================================================

  container: {

    paddingHorizontal:
      SPACING.xl,

    paddingTop:
      SPACING.large,

    paddingBottom:
      SPACING.small,

    backgroundColor:
      COLORS.background,

  },


  // ==========================================================
  // GREETING
  // ==========================================================

  greetingSection: {

    marginBottom:
      SPACING.medium,

  },


  eyebrow: {

    fontSize:
      10,

    fontWeight:
      '700',

    letterSpacing:
      1.5,

    color:
      COLORS.textMuted,

    marginBottom:
      5,

  },


  title: {

    fontSize:
      27,

    lineHeight:
      32,

    fontWeight:
      '600',

    color:
      COLORS.black,

    letterSpacing:
      -0.6,

  },


  // ==========================================================
  // LOCATION BUTTON
  // ==========================================================

  locationButton: {

    minHeight:
      58,

    backgroundColor:
      COLORS.surface,

    borderWidth:
      1,

    borderColor:
      COLORS.border,

    borderRadius:
      RADIUS.medium,

    paddingHorizontal:
      SPACING.medium,

    flexDirection:
      'row',

    alignItems:
      'center',

  },


  // ==========================================================
  // LOCATION ICON
  // ==========================================================

  locationIconContainer: {

    width:
      38,

    height:
      38,

    borderRadius:
      RADIUS.round,

    backgroundColor:
      '#F3F3F3',

    alignItems:
      'center',

    justifyContent:
      'center',

    marginRight:
      SPACING.medium,

  },


  locationIcon: {

    fontSize:
      17,

  },


  // ==========================================================
  // LOCATION CONTENT
  // ==========================================================

  locationContent: {

    flex: 1,

    minWidth:
      0,

  },


  locationLabel: {

    fontSize:
      9,

    fontWeight:
      '700',

    letterSpacing:
      1.2,

    color:
      COLORS.textMuted,

    marginBottom:
      3,

  },


  locationText: {

    fontSize:
      FONT_SIZES.small,

    fontWeight:
      '600',

    color:
      COLORS.black,

  },


  // ==========================================================
  // ARROW
  // ==========================================================

  arrow: {

    fontSize:
      26,

    lineHeight:
      27,

    fontWeight:
      '300',

    color:
      COLORS.black,

    marginLeft:
      SPACING.small,

  },

});