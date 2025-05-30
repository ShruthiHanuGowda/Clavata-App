import {StyleSheet} from 'react-native';
import {Colors, fontsFamily} from '../../../Theme';

export default StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.white,
  },
  title: {
    fontSize: 18,
    lineHeight: 23,
    color: '#000',
  },
  nameContainer: {
    flexDirection: 'row',
  },
  mainContainer: {
    marginHorizontal: 20,
    flex: 1,
  },
  redemptionContainer: {
    marginHorizontal: 20,
    flex: 1,
  },
  headerAlign: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF',
  },
  borderLine: {
    borderBottomColor: '#AFAFAF40',
    marginLeft: 10,
    borderBottomWidth: 1,
    width: '100%',
    marginVertical: 20,
  },
  content: {
    fontFamily: fontsFamily.MulishSemiBold,
    fontSize: 14,
    lineHeight: 22,
    color: '#747474',
  },
  header: {
    fontFamily: fontsFamily.MulishBold,
    fontSize: 14,
    color: '#AFAFAF',
    // lineHeight:20,
    letterSpacing: 2,
  },
  itemContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginVertical: 10,
  },
  transationType: {
    fontFamily: fontsFamily.MulishExtraBold,
    fontSize: 13,
    lineHeight: 16,
    marginVertical: 4,
  },
  nodataAlign: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  noData: {
    textAlign: 'center',
    color: 'grey',
    fontFamily: fontsFamily.Mulish,
    fontSize: 14,
  },
  username: {
    fontFamily: fontsFamily.Mulish,
    fontSize: 14,
    lineHeight: 15,
    color: '#959595',
  },
  status: {
    fontFamily: fontsFamily.Mulish,
    fontSize: 10,
    textTransform: 'capitalize',
  },
  amount: {
    fontFamily: fontsFamily.MulishExtraBold,
    fontSize: 14,
    lineHeight: 20,
    alignSelf: 'flex-end',
    textAlign: 'right',
  },
  time: {
    fontFamily: fontsFamily.MulishSemiBold,
    fontSize: 12,
    alignSelf: 'flex-end',
    color: '#808080',
  },
  img: {
    width: 32,
    height: 32,
  },
  statusImgContainer: {
    marginRight: 10,
    alignSelf: 'flex-start',
    alignItems: 'center',
    marginTop: 2,
  },
  card: {
    backgroundColor: '#ffffff',
    width: '100%',
    paddingBottom: 15,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 2,
    borderBottomWidth: 0.75,
    borderBottomColor: '#DEDEDE',
  },
  cardHeaderTitle: {
    color: '#333333',
    fontSize: 18,
    fontFamily: fontsFamily.MulishBold,
  },
  cardCloseAlign: {
    height: 50,
    width: 50,
    justifyContent: 'center',
  },
  closeIcon: {
    width: 25,
    height: 25,
    alignSelf: 'flex-end',
  },
  cardDetailsAlign: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    paddingHorizontal: 20,
  },
  cardDetailsTitleAlign: {
    width: '40%',
  },
  cardDetailsValueAlign: {
    width: '60%',
    alignItems: 'flex-end',
  },
  cardTitle: {
    color: '#737373',
    fontSize: 14,
    fontFamily: fontsFamily.MulishSemiBold,
  },
  cardValue: {
    color: '#000000',
    fontSize: 14,
    fontFamily: fontsFamily.MulishBold,
  },
  indicator: {
    backgroundColor: 'transparent',
  },
  cardContainer: {
    marginHorizontal: 20,
    marginVertical: 20,
    height: 38,
    padding: 5,
    borderRadius: 7,
    backgroundColor: '#E9E9E9',
  },
  tab: {
    borderBottomWidth: 0,
    borderRadius: 5,
  },
  tabTitleActive: {
    opacity: 1,
    color: '#000',
    fontSize: 14,
    lineHeight: 14,
    height: 28,
    width: 166,
    fontFamily: fontsFamily.Mulish,
  },
  tabTitle: {
    color: '#000',
    fontSize: 14,
    lineHeight: 14,
    width: 166,
    height: 28,
    fontFamily: fontsFamily.Mulish,
  },
  button: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 0,
    margin: 0,
  },
  buttonActive: {
    backgroundColor: '#FFF',
    borderRadius: 5,
    padding: 0,
    margin: 0,
  },
});
