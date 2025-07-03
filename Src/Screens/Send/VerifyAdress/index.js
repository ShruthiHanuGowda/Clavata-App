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
import QRCodeScannerModal from '../../../Componants/QRScan/QRCodeScannerModal';

export const VerifyAddress = props => {
  const [senderAddress, setSenderAddress] = useState('');
  const [modalVisible, setModalVisible] = useState(false);
  const [qrScannerVisible, setQrScannerVisible] = useState(false); // Add QR scanner state
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
  };

  const openContactModal = () => {
    setModalVisible(true);
  };

  const closeContactModal = () => {
    setModalVisible(false);
  };

  // Updated QR scan handler
  const handleQRScan = () => {
    setQrScannerVisible(true);
  };

  // Handle QR code scan result
  const handleQRCodeScanned = data => {
    console.log('QR Code scanned:', data);

    // Extract address from QR code data
    let extractedAddress = data;

    // Handle different QR code formats
    if (data.startsWith('ethereum:')) {
      // Format: ethereum:0x1234567890abcdef...
      extractedAddress = data.replace('ethereum:', '').split('?')[0];
    } else if (data.startsWith('0x')) {
      // Already a valid address format
      extractedAddress = data;
    } else {
      // Try to find ethereum address pattern in the data
      const addressMatch = data.match(/0x[a-fA-F0-9]{40}/);
      if (addressMatch) {
        extractedAddress = addressMatch[0];
      }
    }

    // Validate the extracted address
    if (isAddress(extractedAddress)) {
      setSenderAddress(extractedAddress);
      setQrScannerVisible(false);
      SnackBarMessage('Address scanned successfully!', 'success');
    } else {
      setSenderAddress('');
      setQrScannerVisible(false);
      setTimeout(() => {
        SnackBarMessage('Invalid wallet address in QR code', 'error');
      }, 500);
    }
  };

  // Close QR scanner
  const closeQRScanner = () => {
    setQrScannerVisible(false);
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
            </TouchableOpacity>

            {/* QR Scan Icon */}
            <TouchableOpacity
              style={style.iconButton}
              onPress={handleQRScan}
              activeOpacity={0.7}>
              <AntDesignIcon name="qrcode" size={24} color="#009D94" />
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

      {/* QR Code Scanner Modal */}
      <QRCodeScannerModal
        visible={qrScannerVisible}
        onClose={closeQRScanner}
        onCodeScanned={handleQRCodeScanned}
        title="Scan Wallet Address"
        codeTypes={['qr']}
        showToggleButton={true}
        animationType="slide"
      />
    </View>
  );
};
