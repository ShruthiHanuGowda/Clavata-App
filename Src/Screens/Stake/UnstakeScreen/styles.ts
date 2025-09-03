import {StyleSheet} from 'react-native';
import {Colors, fontsFamily} from '../../../Theme';

export default StyleSheet.create({
  mainContainer: {
    backgroundColor: '#fff',
    flex: 1,
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
    color: '#DC3545', // Red color for unstake theme
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
  unstakeButton: {
    backgroundColor: '#DC3545', // Red background for unstake
    borderRadius: 8,
    padding: 15,
    alignItems: 'center',
    marginTop: 20,
    width: '100%',
    height: 50,
  },
  unstakeButtonText: {
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
    color: '#DC3545', // Red color for unstake theme
  },
  disabledDropdown: {
    opacity: 0.7,
  },
  noOptionsText: {
    padding: 15,
    textAlign: 'center',
    color: '#666',
    fontStyle: 'italic',
  },
  inputError: {
    borderColor: '#DC3545',
    borderWidth: 1,
  },
  errorText: {
    color: '#DC3545',
    fontSize: 12,
    marginTop: 2,
    marginLeft: 5,
    fontFamily: fontsFamily.Mulish,
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
  stakingInfoCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 24,
    marginBottom: 30,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
    borderWidth: 1,
    borderColor: '#F0F0F0',
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  stakingInfoTitle: {
    fontSize: 20,
    fontFamily: fontsFamily.MulishBold,
    color: '#1A1A1A',
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  statusBadgeText: {
    fontSize: 12,
    fontFamily: fontsFamily.MulishBold,
    textTransform: 'uppercase',
  },
  statsRow: {
    flexDirection: 'row',
    backgroundColor: '#F8F9FA',
    borderRadius: 12,
    padding: 20,
    marginBottom: 24,
    alignItems: 'center',
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
  },
  statValue: {
    fontSize: 28,
    fontFamily: fontsFamily.MulishBold,
    color: '#DC3545',
    marginBottom: 4,
  },
  rewardsValue: {
    color: '#28A745',
  },
  statLabel: {
    fontSize: 14,
    color: '#666',
    fontFamily: fontsFamily.Mulish,
    textAlign: 'center',
  },
  statDivider: {
    width: 1,
    height: 40,
    backgroundColor: '#E9ECEF',
    marginHorizontal: 20,
  },
  detailsSection: {
    marginTop: 8,
  },
  sectionTitle: {
    fontSize: 16,
    fontFamily: fontsFamily.MulishBold,
    color: '#1A1A1A',
    marginBottom: 16,
  },
  detailItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  iconContainer: {
    position: 'relative',
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#F8F9FA',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  iconText: {
    fontSize: 18,
  },
  detailContent: {
    flex: 1,
  },
  detailLabel: {
    fontSize: 14,
    color: '#666',
    fontFamily: fontsFamily.Mulish,
    marginBottom: 2,
  },
  detailValue: {
    fontSize: 16,
    color: '#1A1A1A',
    fontFamily: fontsFamily.MulishBold,
  },
  inputSection: {
    marginBottom: 30,
  },
  inputLabel: {
    fontSize: 16,
    fontFamily: fontsFamily.MulishBold,
    color: '#000',
    marginBottom: 10,
  },
  amountInput: {
    backgroundColor: '#fff',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: Colors.gray,
    padding: 4,
  },
  availableAmountText: {
    fontSize: 14,
    color: '#28A745',
    fontFamily: fontsFamily.MulishBold,
    marginTop: 8,
    textAlign: 'center',
  },
  backIcon: {
    width: 20,
    height: 20,
  },
  statusBadgeActive: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    backgroundColor: '#D4F5E9',
  },
  statusBadgeInactive: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    backgroundColor: '#F5F5F5',
  },
  statusBadgeTextActive: {
    fontSize: 12,
    fontFamily: fontsFamily.MulishBold,
    textTransform: 'uppercase',
    color: '#28A745',
  },
  statusBadgeTextInactive: {
    fontSize: 12,
    fontFamily: fontsFamily.MulishBold,
    textTransform: 'uppercase',
    color: '#666',
  },
});
