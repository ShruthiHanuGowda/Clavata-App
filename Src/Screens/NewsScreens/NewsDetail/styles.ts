import {StyleSheet} from 'react-native';

export const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F9FA',
  },
  headerContainer: {
    borderBottomWidth: 0,
  },
  title: {
    fontSize: 18,
    lineHeight: 23,
    width: 200,
    color: '#000',
    textAlign: 'center',
    alignSelf: 'center',
  },
  nameContainer: {
    marginLeft: 10,
    width: '100%',
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconContainer: {
    position: 'relative',
    marginRight: 10,
  },
  listContainer: {
    padding: 16,
    paddingBottom: 32,
  },
  separator: {
    height: 16,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 32,
  },
  emptyIconContainer: {
    width: 80,
    height: 80,
    backgroundColor: '#E6F7F6',
    borderRadius: 40,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 24,
  },
  emptyIcon: {
    fontSize: 40,
  },
  emptyTitle: {
    fontSize: 18,
    color: '#1A1A1A',
    marginBottom: 8,
    textAlign: 'center',
  },
  emptySubtitle: {
    fontSize: 14,
    color: '#666666',
    textAlign: 'center',
    lineHeight: 20,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 32,
  },
  errorIconContainer: {
    width: 80,
    height: 80,
    backgroundColor: '#FFF3E0',
    borderRadius: 40,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 24,
  },
  errorIcon: {
    fontSize: 40,
  },
  errorTitle: {
    fontSize: 18,
    color: '#E53E3E',
    marginBottom: 8,
    textAlign: 'center',
  },
  errorSubtitle: {
    fontSize: 14,
    color: '#666666',
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 24,
  },
  retryButton: {
    backgroundColor: '#009D94',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
    shadowColor: '#009D94',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  retryText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
  },
  // Loading states
  loadingCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
    overflow: 'hidden',
    flexDirection: 'row',
    marginBottom: 16,
    borderLeftWidth: 3,
    borderLeftColor: '#E6F7F6',
  },
  loadingImage: {
    width: 120,
    height: 120,
    backgroundColor: '#E0E0E0',
  },
  loadingContent: {
    flex: 1,
    padding: 16,
    justifyContent: 'space-between',
  },
  loadingTitle: {
    width: '80%',
    height: 16,
    backgroundColor: '#E0E0E0',
    borderRadius: 4,
    marginBottom: 8,
  },
  loadingAuthor: {
    width: '60%',
    height: 14,
    backgroundColor: '#E0E0E0',
    borderRadius: 4,
    marginBottom: 12,
  },
  loadingTags: {
    flexDirection: 'row',
    marginBottom: 12,
  },
  loadingTag: {
    width: 40,
    height: 20,
    backgroundColor: '#E6F7F6',
    borderRadius: 10,
    marginRight: 8,
  },
});
