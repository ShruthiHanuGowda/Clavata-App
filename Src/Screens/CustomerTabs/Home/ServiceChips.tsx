import React from 'react';
import {
  View,
  TouchableOpacity,
  Text,
  StyleSheet,
  Image,
} from 'react-native';

import {
  COLORS,
  SPACING,
} from '../../../constants/constants';

// ============================================================
// SERVICES
// ============================================================

const services = [
  {
    name: 'Hair',
    image: require('../../../assets/3d/hair.png'),
  },
  {
    name: 'Face',
    image: require('../../../assets/3d/face.png'),
  },
  {
    name: 'Skin',
    image: require('../../../assets/3d/skin.png'),
  },
  {
    name: 'Nails',
    image: require('../../../assets/3d/nails.png'),
  },
  {
    name: 'Makeup',
    image: require('../../../assets/3d/makeup.png'),
  },
  {
    name: 'Beard',
    image: require('../../../assets/3d/beard.png'),
  },
  {
    name: 'Spa',
    image: require('../../../assets/3d/spa.png'),
  },
  {
    name: 'Massage',
    image: require('../../../assets/3d/massage.png'),
  },
  {
    name: 'Waxing',
    image: require('../../../assets/3d/waxing.png'),
  },
  {
    name: 'Threading',
    image: require('../../../assets/3d/threading.png'),
  },
  {
    name: 'Bridal',
    image: require('../../../assets/3d/bridal.png'),
  },
  {
    name: "Men's Grooming",
    image: require('../../../assets/3d/mens_grooming.png'),
  },
];

// ============================================================
// TYPES
// ============================================================

type Props = {
  onSelect: (category: string) => void;
  selectedCategory?: string;
};

// ============================================================
// COMPONENT
// ============================================================

export default function ServiceChips({
  onSelect,
  selectedCategory = '',
}: Props) {
  return (
    <View style={styles.wrapper}>

      <View style={styles.grid}>

        {services.map((item) => {

          const isSelected =
            selectedCategory === item.name;

          return (
            <TouchableOpacity
              key={item.name}
              activeOpacity={0.85}
              onPress={() => onSelect(item.name)}
              style={[
                styles.card,
                isSelected && styles.cardSelected,
              ]}
            >

              {/* IMAGE */}

              <View
                style={[
                  styles.imageContainer,
                  isSelected &&
                    styles.imageContainerSelected,
                ]}
              >
                <Image
                  source={item.image}
                  style={styles.image}
                  resizeMode="contain"
                />
              </View>

              {/* NAME */}

              <Text
                numberOfLines={1}
                ellipsizeMode="tail"
                style={[
                  styles.name,
                  isSelected && styles.nameSelected,
                ]}
              >
                {item.name}
              </Text>

              {/* CHECK */}

              {isSelected && (
                <View style={styles.checkContainer}>
                  <Text style={styles.check}>
                    ✓
                  </Text>
                </View>
              )}

            </TouchableOpacity>
          );
        })}

      </View>

    </View>
  );
}

// ============================================================
// STYLES
// ============================================================

const styles = StyleSheet.create({

  // ============================================================
  // WRAPPER
  // ============================================================

  wrapper: {
    paddingHorizontal: SPACING.xl,
    marginBottom: SPACING.medium,
  },

  // ============================================================
  // GRID
  // ============================================================

  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',

    justifyContent: 'space-between',

    rowGap: 7,
  },

  // ============================================================
  // CARD
  // ============================================================

  card: {
    width: '23.5%',
    height: 68,

    borderRadius: 12,

    backgroundColor: COLORS.white,

    borderWidth: 1,
    borderColor: '#EAEAEA',

    alignItems: 'center',
    justifyContent: 'center',

    position: 'relative',

    shadowColor: COLORS.black,
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.025,
    shadowRadius: 3,

    elevation: 1,
  },

  // ============================================================
  // SELECTED
  // ============================================================

  cardSelected: {
    backgroundColor: COLORS.black,
    borderColor: COLORS.black,

    shadowOpacity: 0.10,
    elevation: 2,
  },

  // ============================================================
  // IMAGE
  // ============================================================

  imageContainer: {
    width: 36,
    height: 36,

    borderRadius: 10,

    backgroundColor: '#F7F7F7',

    alignItems: 'center',
    justifyContent: 'center',

    marginBottom: 2,
  },

  imageContainerSelected: {
    backgroundColor: COLORS.white,
  },

  image: {
    width: 34,
    height: 34,
  },

  // ============================================================
  // NAME
  // ============================================================

  name: {
    width: '90%',

    fontSize: 9.5,

    lineHeight: 11,

    color: '#222222',

    fontWeight: '600',

    textAlign: 'center',

    letterSpacing: -0.1,
  },

  nameSelected: {
    color: COLORS.white,
    fontWeight: '700',
  },

  // ============================================================
  // CHECK
  // ============================================================

  checkContainer: {
    position: 'absolute',

    top: 4,
    right: 4,

    width: 14,
    height: 14,

    borderRadius: 7,

    backgroundColor: COLORS.black,

    borderWidth: 1,
    borderColor: COLORS.white,

    alignItems: 'center',
    justifyContent: 'center',
  },

  check: {
    color: COLORS.white,

    fontSize: 8,

    lineHeight: 9,

    fontWeight: '900',
  },
});