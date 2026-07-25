import { StyleSheet } from 'react-native';

const PRIMARY = '#009D94';

export default StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F7FA',
  },

  profileHeader: {
    backgroundColor: PRIMARY,
    alignItems: 'center',
    paddingTop: 40,
    paddingBottom: 30,
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
  },

  avatar: {
    width: 90,
    height: 90,
    borderRadius: 45,
    backgroundColor: '#FFF',
    marginBottom: 15,
  },

  profileName: {
    fontSize: 24,
    fontWeight: '700',
    color: '#FFF',
  },

  profileRole: {
    marginTop: 5,
    fontSize: 15,
    color: '#E5E7EB',
  },

  profileCard: {
    backgroundColor: '#FFF',
    marginHorizontal: 20,
    marginTop: 20,
    borderRadius: 16,
    padding: 18,
    elevation: 3,

    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowRadius: 8,
    shadowOffset: {
      width: 0,
      height: 3,
    },
  },

  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 10,
  },

  switchRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 10,
  },

  menuItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },

  menuText: {
    fontSize: 16,
    color: '#111827',
    fontWeight: '500',
  },

  menuArrow: {
    fontSize: 22,
    color: '#9CA3AF',
  },

  switchButton: {
    marginTop: 20,
    backgroundColor: PRIMARY,
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center',
  },

  switchButtonText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: '700',
  },

  logoutButton: {
    backgroundColor: '#EF4444',
    marginHorizontal: 20,
    marginTop: 30,
    marginBottom: 40,
    borderRadius: 14,
    paddingVertical: 16,
    alignItems: 'center',
    elevation: 3,

    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowRadius: 8,
    shadowOffset: {
      width: 0,
      height: 3,
    },
  },

  logoutText: {
    color: '#FFF',
    fontSize: 17,
    fontWeight: '700',
  },
});