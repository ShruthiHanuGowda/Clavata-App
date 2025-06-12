import React, {useState} from 'react';
import {
  Image,
  Pressable,
  ScrollView,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import style from './styles';
import {Header} from '@rneui/base';
import Images from '../../../Theme/images';
import {DText} from '../../../Componants/DText';
import {navigateBack} from '../../../Navigation/NavigationFunctions';
import {SCREEN_CONSTANT} from '../../../Navigation/constant';
import {isAddress} from 'ethers';
import {SnackBarMessage} from '../../../utils/snackBar';
import {navigateTo} from '../../../utils/navigationService';
import {CustomImageButton} from '../../../Componants';
import ContactModal from '../../AddressBookScreens/ContactModal';
import AntDesignIcon from 'react-native-vector-icons/AntDesign';
export const VerifyAddress = props => {
  const [senderAddress, setSenderAddress] = useState('');
  const [modalVisible, setModalVisible] = useState(false);
  const coinCode = props?.route?.params?.coinCode;

  function isValidEthereumAddress(address) {
    try {
      const status = isAddress(address);
      console.log('status', status);

      if (!status) {
        SnackBarMessage('Please Enter valid Address.', 'error');
      } else {
        const user = {
          beneficiaryAddress: senderAddress,
        };
        navigateTo(SCREEN_CONSTANT.SENDCOIN, {user: user, coinCode: coinCode});
      }
    } catch (err) {
      console.error(err);
    }
  }

  const handleSelectAddress = (address, contact) => {
    setSenderAddress(address);
    console.log('Selected:', address, 'from', contact.name);
    SnackBarMessage(`Address selected from ${contact.name}`, 'success');
  };

  const openContactModal = () => {
    setModalVisible(true);
  };

  const closeContactModal = () => {
    setModalVisible(false);
  };

  const handleQRScan = () => {
    // Add your QR scan logic here
    console.log('QR Scan pressed');
  };

  return (
    <View style={style.container}>
      <Header
        backgroundColor={'#FFF'}
        containerStyle={{borderBottomWidth: 0}}
        leftComponent={
          <TouchableOpacity
            onPress={() => navigateBack()}
            style={style.backContainer}>
            <Image source={Images.back} />
          </TouchableOpacity>
        }
        centerComponent={
          <View style={style.nameContainer}>
            <DText style={style.title} fontStyle="fontSemiBold">
              {coinCode}
            </DText>
          </View>
        }
      />

      <ScrollView
        keyboardShouldPersistTaps="handled"
        contentContainerStyle={style.scrollViewContainer}>
        <View style={style.addressInputWrap}>
          <TextInput
            onChangeText={data => {
              setSenderAddress(data);
            }}
            value={senderAddress}
            placeholderTextColor={'#999'}
            placeholder="Enter wallet Address"
            style={style.addressInput}
          />

          {/* Icons Container */}
          <View style={style.iconsContainer}>
            {/* Contact Selection Icon */}
            <TouchableOpacity
              style={style.iconButton}
              onPress={openContactModal}
              activeOpacity={0.7}>
              <AntDesignIcon name="contacts" size={24} color="#009D94" />
              {/* {Images.contactIcon ? (
                <Image source={Images.contactIcon} style={style.iconStyle} />
              ) : (
                <DText style={style.contactIconText}>👥</DText>
              )} */}
            </TouchableOpacity>

            {/* QR Scan Icon */}
            <TouchableOpacity
              style={style.iconButton}
              onPress={handleQRScan}
              activeOpacity={0.7}>
              <AntDesignIcon name="qrcode" size={24} color="#009D94" />
              {/* <Image source={Images.qrCodeIcon} style={style.iconStyle} /> */}
            </TouchableOpacity>
          </View>
        </View>

        {/* Selected Address Display */}
        {senderAddress && (
          <View style={style.selectedAddressContainer}>
            <DText style={style.selectedAddressLabel}>Selected Address:</DText>
            <DText style={style.selectedAddressText} numberOfLines={1}>
              {senderAddress}
            </DText>
          </View>
        )}
      </ScrollView>

      <CustomImageButton
        disable={!senderAddress}
        backgroundImage={Images.buttonBg}
        label="Send"
        labelStyle={style.textStyle}
        onPress={() => isValidEthereumAddress(senderAddress)}
        containerWrapper={style.bottomButton}
        bgImg={style.buttonImage}
      />

      {/* Contact Modal */}
      <ContactModal
        visible={modalVisible}
        onClose={closeContactModal}
        onSelectAddress={handleSelectAddress}
        title="Choose Recipient"
        searchPlaceholder="Search contacts..."
        emptyMessage="No contacts found"
      />
    </View>
  );
};
