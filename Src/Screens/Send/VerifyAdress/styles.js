import {StyleSheet} from 'react-native';
import {ScreenWidth} from '@rneui/base';
import {Colors, fontsFamily} from '../../../Theme';

export default StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.white,
  },
  backContainer: {
    position: 'relative',
  },
  nameContainer: {
    flexDirection: 'row',
  },
  title: {
    fontSize: 20,
    lineHeight: 25,
    color: '#000',
  },
  scrollViewContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: 21,
    marginTop: 20,
  },

  // FIXED: addressInputWrap - removed justifyContent conflicts and added proper padding
  addressInputWrap: {
    flexDirection: 'row',
    borderWidth: 1,
    borderColor: '#d3d3d3',
    borderRadius: 10,
    height: 52,
    alignItems: 'center',
    paddingLeft: 10,
    paddingRight: 85, // Added padding for icons space
    width: '100%',
    position: 'relative', // Added for absolute positioning of icons
  },

  // FIXED: addressInput - removed fixed width, using flex instead
  addressInput: {
    color: '#000000',
    flex: 1, // Use flex instead of fixed width
    fontFamily: fontsFamily.MulishSemiBold,
    fontSize: 12,
    paddingHorizontal: 10,
    height: '100%', // Full height of container
    textAlignVertical: 'center', // Center text vertically
  },

  bottomButton: {
    height: 51,
    borderRadius: 12,
    marginBottom: 40,
    marginHorizontal: 10,
  },
  buttonImage: {
    height: 51,
    width: '100%',
  },

  // FIXED: iconsContainer - better positioning
  iconsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    position: 'absolute',
    right: 8,
    top: 0,
    bottom: 0,
    justifyContent: 'center',
  },

  // FIXED: iconButton - removed background color, better sizing
  iconButton: {
    padding: 8,
    marginLeft: 4,
    borderRadius: 6,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 32,
    minWidth: 32,
  },

  // Icon styling
  iconStyle: {
    height: 18,
    width: 18,
    tintColor: '#009D94',
  },

  // FIXED: Contact icon text - better icon
  contactIconText: {
    fontSize: 18,
    color: '#009D94',
  },

  // Selected address display container
  selectedAddressContainer: {
    backgroundColor: '#f8f9fa',
    marginHorizontal: 21, // Match your margin
    marginTop: 12,
    padding: 15,
    borderRadius: 10,
    borderLeftWidth: 4,
    borderLeftColor: '#009D94',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },

  // Selected address label
  selectedAddressLabel: {
    fontSize: 12,
    color: '#666',
    marginBottom: 6,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },

  // Selected address text
  selectedAddressText: {
    fontSize: 14,
    color: '#333',
    fontFamily: 'monospace',
    backgroundColor: '#fff',
    padding: 10,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#e0e0e0',
    lineHeight: 20,
  },
});
