import React from 'react';
import {View, Text, StyleSheet} from 'react-native';
import {useAuth} from '../../Providers/authProvider';
import {Colors} from '../../Theme';
import {Header} from '../../Componants';

export const Screen1: React.FC = () => {
  const {userDetails} = useAuth();
  console.log('🚀 ~ userDetails:', JSON.stringify(userDetails));

  const displayData = [
    {label: 'Issuer', value: userDetails?.issuer},
    {label: 'Public Address', value: userDetails?.publicAddress},
    {label: 'Email', value: userDetails?.email},
    {label: 'Phone Number', value: userDetails?.phoneNumber || 'Not provided'},
    {
      label: 'MFA Status',
      value: userDetails?.isMfaEnabled ? 'Enabled' : 'Disabled',
    },
    {
      label: 'Recovery Factors',
      value: userDetails?.recoveryFactors.length
        ? userDetails?.recoveryFactors.join(', ')
        : 'None',
    },
  ];

  return (
    <View
      style={{
        flex: 1,
        backgroundColor: Colors.white,
      }}>
      <Header
        headerTitle="user Details"
        hideBorder={true}
        hideBackIcon={true}
      />
      <View style={{flex: 1, paddingHorizontal: 10}}>
        {displayData.map((item, index) => (
          <View
            key={index}
            style={[
              styles.row,
              index === displayData.length - 1 ? null : styles.borderBottom,
            ]}>
            <Text style={styles.label}>{item.label}</Text>
            <Text style={styles.value}>{item.value}</Text>
          </View>
        ))}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  card: {
    margin: 16,
    padding: 16,
    backgroundColor: '#ffffff',
    borderRadius: 8,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 16,
    color: '#1a1a1a',
  },
  row: {
    paddingVertical: 12,
  },
  borderBottom: {
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  label: {
    fontSize: 14,
    color: '#666666',
    marginBottom: 4,
  },
  value: {
    fontSize: 16,
    color: '#1a1a1a',
  },
});
