import {StyleSheet} from 'react-native';
import {Colors, fontsFamily} from '../../../Theme';

export default StyleSheet.create({
  mainContainer: {
    backgroundColor: '#fff',
    flex: 1,
  },
  iconContainer: {
    position: 'relative',
    marginRight: 10,
  },
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: '#fff',
  },
  headerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
    marginTop: 20,
  },
  header: {
    fontSize: 18,
    fontFamily: fontsFamily?.MulishBold || 'sans-serif',
    color: '#000',
  },
  headerText: {
    fontSize: 28,
    fontFamily: fontsFamily.MulishBold,
    marginBottom: 40,
    color: '#000',
    marginTop: 20,
  },
  dropdownContainer: {
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 16,
    marginBottom: 20,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Colors.gray,
  },
  nftDetailsContainer: {
    padding: 16,
    alignItems: 'flex-start',
    flexDirection: 'column',
  },
  dropdownLabel: {
    fontSize: 16,
    color: '#333',
    fontFamily: fontsFamily.Mulish,
  },
  inputContainer: {
    backgroundColor: '#fff',
    borderRadius: 8,
    marginBottom: 40,
    borderColor: '#DDDDBB',
  },
  input: {
    height: 50,
    fontSize: 16,
    color: '#333',
    fontFamily: fontsFamily.Mulish,
  },
  bottomSheetCard: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingHorizontal: 20,
    paddingBottom: 30,
    maxHeight: '60%',
  },
  bottomSheetHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#EFEFEF',
  },
  bottomSheetTitle: {
    fontSize: 18,
    fontFamily: fontsFamily.MulishBold,
    color: '#000000',
  },
  closeButton: {
    padding: 5,
  },
  closeText: {
    fontSize: 18,
    fontFamily: fontsFamily.MulishBold,
    color: '#009D94',
  },
  optionsContainer: {
    marginTop: 10,
  },
  optionItem: {
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#EFEFEF',
  },
  optionText: {
    fontSize: 16,
    fontFamily: fontsFamily.Mulish,
    color: '#333',
  },
  stakeButton: {
    backgroundColor: '#009D94',
    borderRadius: 8,
    padding: 15,
    alignItems: 'center',
    marginTop: 20,
    width: '100%',
    height: 50,
  },
  stakeButtonText: {
    color: '#fff',
    fontSize: 16,
    fontFamily: fontsFamily.MulishBold,
  },
  loaderContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    height: '100%',
  },
  loaderText: {
    marginTop: 10,
    fontSize: 18,
    color: '#008060',
  },
  disabledDropdown: {
    opacity: 0.7,
  },
  noOptionsText: {
    padding: 15,
    textAlign: 'center',
    color: '#666',
  },
  inputError: {
    borderColor: 'red',
    borderWidth: 1,
  },
  errorText: {
    color: 'red',
    fontSize: 12,
    marginTop: 2,
    marginLeft: 5,
  },

  nftDetailsContent: {
    width: '100%',
  },
  nftDetailTitle: {
    fontWeight: 'bold',
    fontSize: 18,
    marginBottom: 12,
    color: '#000',
    fontFamily: fontsFamily.MulishBold,
  },
  nftDetailText: {
    fontSize: 16,
    color: '#555',
    marginBottom: 10,
    fontFamily: fontsFamily.Mulish,
  },
});
