// styles.ts
import {StyleSheet} from 'react-native';

const styles = StyleSheet.create({
  // Existing styles from your original TransactionSectionList
  headerAlign: {
    backgroundColor: '#F8F9FA',
    paddingHorizontal: 16,
    paddingVertical: 12,
    flexDirection: 'row',
    alignItems: 'center',
  },
  header: {
    fontSize: 14,
    fontWeight: '600',
    color: '#666666',
    marginRight: 12,
  },
  borderLine: {
    flex: 1,
    height: 1,
    backgroundColor: '#E0E0E0',
  },

  // Transaction Item Styles
  transactionItem: {
    backgroundColor: '#FFFFFF',
    marginHorizontal: 16,
    marginVertical: 4,
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E0E0E0',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  transactionItemContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  transactionItemLeft: {
    flex: 1,
    marginRight: 12,
  },
  transactionItemRight: {
    alignItems: 'flex-end',
  },
  statusContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 8,
  },
  statusText: {
    fontSize: 12,
  },
  hashText: {
    fontSize: 14,
    color: '#333333',
    marginBottom: 4,
  },
  timestampText: {
    fontSize: 12,
    color: '#666666',
  },
  valueText: {
    fontSize: 16,
    color: '#333333',
    marginBottom: 2,
  },

  // Bottom Sheet Styles
  bottomSheetContainer: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: '80%',
    paddingTop: 8,
  },
  bottomSheetHandle: {
    width: 40,
    height: 4,
    backgroundColor: '#E0E0E0',
    alignSelf: 'center',
    borderRadius: 2,
    marginBottom: 20,
  },
  bottomSheetHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  bottomSheetTitle: {
    fontSize: 18,
    color: '#333333',
  },
  closeButton: {
    padding: 5,
  },
  closeText: {
    fontSize: 18,
    color: '#666666',
    fontWeight: 'bold',
  },
  bottomSheetContent: {
    paddingHorizontal: 20,
  },

  // Detail Row Styles
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  detailLabel: {
    fontSize: 14,
    color: '#666666',
    flex: 1,
  },
  detailValueContainer: {
    flex: 2,
  },
  detailValue: {
    fontSize: 14,
    color: '#333333',
    textAlign: 'right',
  },
  detailValueClickable: {
    fontSize: 14,
    color: '#009D94',
    textAlign: 'right',
  },

  // Empty State
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 100,
  },
  emptyText: {
    fontSize: 16,
    color: '#666666',
  },

  // Footer
  footerContainer: {
    alignItems: 'center',
    paddingVertical: 15,
  },
  loadMoreText: {
    color: '#009D94',
    fontSize: 14,
  },
  loadingIndicator: {
    marginVertical: 20,
  },

  // Section List
  sectionListContainer: {
    paddingBottom: 100,
  },
});

export default styles;
