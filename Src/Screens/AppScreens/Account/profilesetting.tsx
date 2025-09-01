import React, {useState} from 'react';
import {View, Text, StyleSheet, ScrollView} from 'react-native';
import {SafeAreaView} from 'react-native-safe-area-context';
import style from './styles';
import {Header} from '../../../Componants';
import {fontsFamily} from '../../../Theme';
import {useAuth} from '../../../../screens/Provider/authProvider';
import {navigateBack} from '../../../Navigation/NavigationFunctions';
import {useMagic} from '../../../../screens/Provider/MagicProvider';
import Clipboard from '@react-native-clipboard/clipboard';
import {SnackBarMessage} from '../../../utils/snackBar';

interface UserDetails {
  [key: string]: any;
  kycDetails?: any;
  accessToken?: string;
}

interface ProfileSettingProps {
  // Add any props if needed in the future
}

const ProfileSetting: React.FC<ProfileSettingProps> = () => {
  const {userDetails}: {userDetails: UserDetails} = useAuth();
  const [isEnabled, setIsEnabled] = useState<boolean>(true);
  
  const toggleSwitch = (): void => {
    setIsEnabled(!isEnabled);
  };
  
  const {magic} = useMagic();

  const formatKey = (key: string): string => {
    // Replace camelCase with spaces
    const spacedKey = key.replace(/([A-Z])/g, ' $1').replace(/_/g, ' ');
    // Capitalize first letter
    return spacedKey.charAt(0).toUpperCase() + spacedKey.slice(1);
  };

  // Function to format date values to be more readable
  const formatValue = (key: string, value: any): string => {
    if (key === 'date' && typeof value === 'string' && value.includes('T')) {
      const date = new Date(value);
      return date.toLocaleString();
    }
    if (key === 'is_verified') {
      return value ? 'Verified' : 'Not Verified';
    }
    return String(value);
  };

  const copy = async (): Promise<void> => {
    try {
      const idToken = await magic.user.getIdToken({lifespan: 86400});
      Clipboard.setString(idToken);
      SnackBarMessage('Token Copied');
    } catch (error) {
      console.error('Error copying token:', error);
      SnackBarMessage('Failed to copy token');
    }
  };

  return (
    <SafeAreaView style={localStyles.safeAreaContainer}>
      <Header
        headerTitle="My Account"
        hideBorder={true}
        backBtn={() => navigateBack()}
      />
      <ScrollView contentContainerStyle={style.container}>
        <View style={localStyles.subSec}>
          <View>
            <Text style={localStyles.sectionHeader}>
              PERSONAL
            </Text>

            {userDetails && Object.entries(userDetails)
              .filter(([key]) => !['kycDetails', 'accessToken'].includes(key))
              .map(([key, value]) => (
                <View key={key} style={localStyles.fieldContainer}>
                  <View style={localStyles.labelContainer}>
                    <Text style={localStyles.labelText}>
                      {formatKey(key)}
                    </Text>
                  </View>
                  <View style={localStyles.valueContainer}>
                    <Text style={localStyles.valueText}>
                      {formatValue(key, value)}
                    </Text>
                  </View>
                </View>
              ))}
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const localStyles = StyleSheet.create({
  safeAreaContainer: {
    backgroundColor: '#fff',
    flex: 1,
  },
  sectionHeader: {
    fontFamily: fontsFamily.MulishBold,
    fontSize: 12,
    lineHeight: 20,
    color: '#00201B',
    letterSpacing: 1,
  },
  fieldContainer: {
    marginTop: 14,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  labelContainer: {
    flex: 0.4,
    paddingRight: 8,
  },
  labelText: {
    fontFamily: fontsFamily.MulishSemiBold,
    fontSize: 12,
    lineHeight: 15,
    color: '#A1A1A1',
  },
  valueContainer: {
    flex: 0.6,
    alignItems: 'flex-end',
  },
  valueText: {
    fontFamily: fontsFamily.MulishSemiBold,
    fontSize: 12,
    lineHeight: 15,
    color: '#616161',
    textAlign: 'right',
  },
  subSec: {
    marginHorizontal: 20,
    marginVertical: 10,
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    padding: 20,
    borderWidth: 0.5,
    borderColor: '#DEDEDE',
    shadowColor: '#b6baba',
    shadowOffset: {
      width: 0,
      height: 6,
    },
    shadowOpacity: 0.39,
    shadowRadius: 8.3,
    elevation: 5,
  },
});

export default ProfileSetting;