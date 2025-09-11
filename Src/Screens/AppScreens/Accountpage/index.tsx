import React from 'react';
import {Text, View, Image, StyleSheet, Alert} from 'react-native';
import style from './style';
import {ScrollView} from 'react-native-gesture-handler';
import LinearGradient from 'react-native-linear-gradient';
import {Header} from '@rneui/base';
import {TouchableOpacity} from 'react-native';
import {DText} from '../../../components/DText';
import MenuList from '../../../components/rc_menuList';
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

const Account: React.FC<AccountProps> = ({navigation}) => {
  const {magic} = useMagic();
  const {userDetails} = useAuth();

  const getUsernameFromEmail = (email: string): string => {
    return email.split('@')[0];
  };

  const getFirstName = () => {
    if (!userDetails?.kycDetails) {
      return null;
    }

    if (typeof userDetails.kycDetails === 'string') {
      try {
        const parsed = JSON.parse(userDetails.kycDetails);
        return parsed.firstName;
      } catch {
        return null;
      }
    }

    return userDetails.kycDetails.firstName;
  };

  const username =
    getFirstName() || getUsernameFromEmail(userDetails?.emailAddress || '');

  useMutation(UPDATE_KYC_STATUS, {
    onCompleted: data => {
      console.info('KYC status updated successfully:', data);
    },
    onError: error => {
      console.error('Error updating KYC status:', error);
    },
  });

  // const [visible, setVisible] = useState<boolean>(false);
  // const [rating, setRating] = useState<number>(0);

  // const toggleBottomView = (): void => {
  //   setVisible(!visible);
  //   setRating(0);
  // };

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
                  (navReset as any)('authScreens');
                }, 500);
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

        <View style={localStyles.spacer} />

        <MenuList
          onPress={() => navigateTo('ProfileSettings')}
          img={images.user}
          title="My Account"
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
