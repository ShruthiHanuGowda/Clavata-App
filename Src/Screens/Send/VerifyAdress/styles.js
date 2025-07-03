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

  // FIXED: addressInputWrap - stable positioning with consistent height
  addressInputWrap: {
    flexDirection: 'row',
    borderWidth: 1,
    borderColor: '#d3d3d3',
    borderRadius: 10,
    height: 52,
    alignItems: 'center',
    paddingLeft: 10,
    paddingRight: 85,
    width: '100%',
    position: 'relative',
    // Added these properties to prevent position shifts
    justifyContent: 'flex-start', // Ensure consistent horizontal alignment
    alignSelf: 'stretch', // Maintain consistent width
  },

  // FIXED: addressInput - prevent position changes during input
  addressInput: {
    color: '#000000',
    flex: 1,
    fontFamily: fontsFamily.MulishSemiBold,
    fontSize: 12,
    paddingHorizontal: 10,
    height: 52, // Fixed height matching container
    // Critical fixes for position stability
    textAlignVertical: 'center', // Center text vertically
    includeFontPadding: false, // Prevents font padding issues on Android
    paddingVertical: 0, // Remove vertical padding that can cause shifts
    margin: 0, // Remove any default margins
    borderWidth: 0, // Remove any default borders
    backgroundColor: 'transparent', // Ensure transparent background
    // Prevent multiline behavior that can cause position shifts
    multiline: false,
    numberOfLines: 1,
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

  // FIXED: iconsContainer - stable absolute positioning
  iconsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    position: 'absolute',
    right: 8,
    top: 0,
    bottom: 0,
    justifyContent: 'center',
    height: 52, // Match container height for consistency
    // Prevent the icons from affecting input positioning
    pointerEvents: 'box-none', // Allow touches to pass through to children
  },

  // FIXED: iconButton - consistent sizing
  iconButton: {
    padding: 8,
    marginLeft: 0,
    borderRadius: 6,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 32,
    minWidth: 32,
    // Ensure buttons don't affect input positioning
    position: 'static',
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
    marginHorizontal: 21,
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
