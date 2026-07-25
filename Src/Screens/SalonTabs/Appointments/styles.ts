import { StyleSheet } from 'react-native';

const PRIMARY = '#009D94';

export default StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F7FA',
  },

  header: {
    backgroundColor: PRIMARY,
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 25,
    borderBottomLeftRadius: 25,
    borderBottomRightRadius: 25,
  },

  title: {
    fontSize: 28,
    fontWeight: '700',
    color: '#FFF',
  },

  search: {
    backgroundColor: '#FFF',
    marginHorizontal: 20,
    marginTop: 20,
    marginBottom: 15,
    borderRadius: 12,
    paddingHorizontal: 15,
    height: 50,
    justifyContent: 'center',
    elevation: 2,
  },

  searchText: {
    color: '#9CA3AF',
    fontSize: 15,
  },

  filterContainer: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    marginBottom: 18,
  },

  filterButton: {
    paddingHorizontal: 18,
    paddingVertical: 10,
    backgroundColor: '#E5E7EB',
    borderRadius: 25,
    marginRight: 10,
  },

  filterButtonActive: {
    backgroundColor: PRIMARY,
  },

  filterText: {
    color: '#374151',
    fontWeight: '600',
  },

  filterTextActive: {
    color: '#FFF',
  },

  card: {
    backgroundColor: '#FFF',
    marginHorizontal: 20,
    marginBottom: 15,
    borderRadius: 18,
    padding: 18,
    elevation: 3,
  },

  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },

  customer: {
    fontSize: 18,
    fontWeight: '700',
    color: '#111827',
  },

  service: {
    marginTop: 5,
    color: '#6B7280',
    fontSize: 15,
  },

  staff: {
    marginTop: 4,
    color: '#6B7280',
  },

  phone: {
    marginTop: 4,
    color: '#6B7280',
  },

  time: {
    fontWeight: '700',
    color: PRIMARY,
  },

  amount: {
    marginTop: 6,
    fontWeight: '700',
    fontSize: 17,
    color: '#111827',
  },

  badge: {
    marginTop: 14,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    alignSelf: 'flex-end',
  },

  badgeText: {
    fontWeight: '700',
    fontSize: 12,
  },
});