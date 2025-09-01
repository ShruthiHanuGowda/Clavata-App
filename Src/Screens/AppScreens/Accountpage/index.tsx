import React, {useState} from 'react';
import {
  Text,
  View,
  Image,
  StyleSheet,
  Pressable,
  Alert,
} from 'react-native';
import {SafeAreaView} from 'react-native-safe-area-context';
import style from './style';
import {ScrollView} from 'react-native-gesture-handler';
import {SCREEN_CONSTANT} from '../../../../navigation/constant';
import LinearGradient from 'react-native-linear-gradient';
import {Header} from '@rneui/base';
import {TouchableOpacity} from 'react-native';
import {isDev} from '../../../../config/mode';
import {DText} from '../../../Componants/DText';
import MenuList from '../../../Componants/rc_menuList';
import images from '../../../Theme/images';
import {navigateTo} from '../../../utils/navigationService';
import {useMagic} from '../../../../screens/Provider/MagicProvider';
import {navReset} from '../../../Navigation/NavigationFunctions';
import {UPDATE_KYC_STATUS} from '../../../graphql/queries';
import {useMutation} from '@apollo/client';
import {useAuth} from '../../../../screens/Provider/authProvider';

interface AccountProps {
  navigation: {
    goBack: () => void;
  };
}

interface UserDetails {
  emailAddress: string;
  kycDetails?: {
    firstName?: string;
  };
  walletAddress?: string;
}

const Account: React.FC<AccountProps> = ({navigation}) => {
  const {magic} = useMagic();
  const {userDetails}: {userDetails: UserDetails} = useAuth();
  
  const getUsernameFromEmail = (email: string): string => {
    return email.split('@')[0];
  };
  
  const username = userDetails?.kycDetails?.firstName
    ? userDetails.kycDetails.firstName
    : getUsernameFromEmail(userDetails?.emailAddress || '');

  const [updateKycStatus] = useMutation(UPDATE_KYC_STATUS, {
    onCompleted: (data) => {
      console.log('KYC status updated successfully:', data);
    },
    onError: (error) => {
      console.error('Error updating KYC status:', error);
    },
  });

  const [visible, setVisible] = useState<boolean>(false);
  const [rating, setRating] = useState<number>(0);
  
  const toggleBottomView = (): void => {
    setVisible(!visible);
    setRating(0);
  };

  const handleBackPress = (): void => {
    navigation.goBack();
  };

  const handleLogout = async (): Promise<void> => {
    try {
      Alert.alert(
        'Logout',
        'Are you sure you want to logout?',
        [
          {
            text: 'Cancel',
            onPress: () => {},
            style: 'cancel',
          },
          {
            text: 'Logout',
            onPress: async () => {
              try {
                await magic.user.logout();
                setTimeout(() => {
                  navReset('authScreens');
                }, 500);
                console.log('User logged out successfully');
              } catch (error) {
                console.error('Error during logout:', error);
                Alert.alert(
                  'Logout Failed',
                  'There was a problem logging out. Please try again.',
                );
              }
            },
          },
        ],
        {cancelable: true},
      );
    } catch (error) {
      console.error('Error during logout flow:', error);
      Alert.alert('Error', 'An error occurred. Please try again.');
    }
  };

  return (
    <View style={localStyles.container}>
      <Header
        centerComponent={
          <View style={localStyles.nameContainer}>
            <DText style={localStyles.title} fontStyle="fontBold">
              Account
            </DText>
          </View>
        }
        backgroundColor="#FFF"
        leftComponent={
          <TouchableOpacity onPress={handleBackPress}>
            <Image source={images.back} />
          </TouchableOpacity>
        }
      />
      <ScrollView>
        <LinearGradient
          colors={['#d8fffd', '#dcf2f1', '#FFFFFF']}
          start={{x: 0, y: 1}}
          end={{x: 1, y: 1}}
          useAngle={true}
          angle={30}
          locations={[0, 0.3, 0.6]}>
          <View style={localStyles.profileContainer}>
            <View style={localStyles.profileContent}>
              <Text style={style.contentText}>{username}</Text>
              <Text style={style.content}>{username}</Text>
            </View>
          </View>
        </LinearGradient>
        
        <View style={localStyles.spacer}></View>
        
        <MenuList
          onPress={() => navigateTo('ProfileSettings')}
          img={images.user}
          title="My Account"
          index={1}
        />
        
        <MenuList
          onPress={() => navigateTo('AddressBook')}
          img={images.addbenificiaries}
          title="Address Book"
        />
        
        <MenuList
          onPress={() => navigateTo('contactus')}
          img={images.help}
          title="Contact Us"
        />
        
        <MenuList
          onPress={() => handleLogout()}
          img={images.logout}
          title="Logout"
        />
      </ScrollView>
    </View>
  );
};

const localStyles = StyleSheet.create({
  container: {
    backgroundColor: '#fff',
    flex: 1,
  },
  title: {
    fontSize: 18,
    lineHeight: 23,
    color: '#000',
  },
  nameContainer: {
    flexDirection: 'row',
  },
  profileContainer: {
    marginHorizontal: 20,
    marginBottom: 25,
    height: 150,
  },
  profileContent: {
    borderBottomColor: 'black',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 54,
  },
  spacer: {
    height: 15,
  },
});

export default Account;