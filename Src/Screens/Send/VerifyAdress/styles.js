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
  addressInputWrap: {
    flexDirection: 'row',
    // justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#d3d3d3',
    borderRadius: 10,
    height: 52,
    alignItems: 'center',
    paddingLeft: 10,
    width: '100%',
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  addressInput: {
    color: '#000000',
    alignItems: 'center',
    width: '150%',
    justifyContent: 'center',
    fontFamily: fontsFamily.MulishSemiBold,
    fontSize: 12,
    paddingHorizontal: 10,
    width: ScreenWidth - 63,
    width: '85%',
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
});
