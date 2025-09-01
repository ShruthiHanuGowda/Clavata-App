import React from 'react';
import {View, Image, TouchableOpacity, ScrollView} from 'react-native';
import {Header} from '@rneui/base';
import images from '../../../Theme/images';
import {navigateBack} from '../../../utils/navigationService';
import {StyleSheet} from 'react-native';
import ShowQr from '../QRcodeScreen/ShowQr';
import {DText} from '../../../Componants/DText';
import {useAuth} from '../../../../screens/Provider/authProvider';

interface RouteParams {
  coinCode: string;
}

interface ReceiveScreenProps {
  route: {
    params: RouteParams;
  };
}

const ReceiveScreen: React.FC<ReceiveScreenProps> = ({route}) => {
  const {coinCode} = route.params;
  console.log('🚀 ~ ReceiveScreen ~ coinCode:', coinCode);
  const {userDetails} = useAuth();
  console.log('coinCode:', coinCode);

  return (
    <View style={styles.container}>
      <Header
        backgroundColor={'#FFF'}
        containerStyle={styles.headerContainer}
        leftComponent={
          <TouchableOpacity onPress={navigateBack} style={styles.backContainer}>
            <Image source={images.back} />
          </TouchableOpacity>
        }
        centerComponent={
          <View style={styles.nameContainer}>
            <DText fontStyle="fontBold" style={styles.headerTitle}>
              {coinCode === 'NFT' ? 'Wallet' : `${coinCode} Wallet`}
            </DText>
          </View>
        }
      />

      <ScrollView>
        <View style={styles.boxAlign}>
          <ShowQr
            coinCode={coinCode}
            address={
              coinCode === 'ETH' || coinCode === 'USDC' || coinCode === 'EURC'
                ? userDetails?.userWallet || ''
                : userDetails?.userWallet || ''
            }
          />
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  headerContainer: {
    borderBottomWidth: 0,
  },
  backContainer: {
    position: 'relative',
    marginRight: 10,
  },
  nameContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 18,
    color: '#2C2C2C',
  },
  boxAlign: {
    marginTop: 38,
    marginBottom: 24,
  },
});

export default ReceiveScreen;