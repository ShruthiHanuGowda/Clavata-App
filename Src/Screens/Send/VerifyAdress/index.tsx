import React, {useState} from 'react';
import {
  Image,
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

interface RouteParams {
  coinCode: string;
}

interface Props {
  route: {
    params: RouteParams;
  };
}

export const VerifyAddress: React.FC<Props> = props => {
  const [senderAddress, setSenderAddress] = useState<string>('');
  const [modalVisible, setModalVisible] = useState<boolean>(false);
  const [qrScannerVisible, setQrScannerVisible] = useState<boolean>(false);
  const coinCode = props?.route?.params?.coinCode;

  function isValidEthereumAddress(address: string): void {
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

  const handleSelectAddress = (address: string, contact: any): void => {
    setSenderAddress(address);
  };

  const openContactModal = (): void => {
    setModalVisible(true);
  };

  const closeContactModal = (): void => {
    setModalVisible(false);
  };

  const handleQRScan = (): void => {
    setQrScannerVisible(true);
  };

  const handleQRCodeScanned = (data: string): void => {
    console.log('QR Code scanned:', data);

    let extractedAddress = data;

    if (data.startsWith('ethereum:')) {
      extractedAddress = data.replace('ethereum:', '').split('?')[0];
    } else if (data.startsWith('0x')) {
      extractedAddress = data;
    } else {
      const addressMatch = data.match(/0x[a-fA-F0-9]{40}/);
      if (addressMatch) {
        extractedAddress = addressMatch[0];
      }
    }

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

  const closeQRScanner = (): void => {
    setQrScannerVisible(false);
  };

  return (
    <View style={style.container}>
      <Header
        backgroundColor={'#FFF'}
        containerStyle={style.headerContainer}
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
            onChangeText={(data: string) => {
              setSenderAddress(data);
            }}
            value={senderAddress}
            placeholderTextColor={'#999'}
            placeholder="Enter wallet Address"
            style={style.addressInput}
          />

          <View style={style.iconsContainer}>
            <TouchableOpacity
              style={style.iconButton}
              onPress={openContactModal}
              activeOpacity={0.7}>
              <AntDesignIcon name="contacts" size={24} color="#009D94" />
            </TouchableOpacity>

            <TouchableOpacity
              style={style.iconButton}
              onPress={handleQRScan}
              activeOpacity={0.7}>
              <AntDesignIcon name="qrcode" size={24} color="#009D94" />
            </TouchableOpacity>
          </View>
        </View>

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

      <ContactModal
        visible={modalVisible}
        onClose={closeContactModal}
        onSelectAddress={handleSelectAddress}
        title="Choose Recipient"
        searchPlaceholder="Search contacts..."
        emptyMessage="No contacts found"
      />

      <QRCodeScannerModal
        visible={qrScannerVisible}
        onClose={closeQRScanner}
        onCodeScanned={handleQRCodeScanned}
        title="Scan Wallet Address"
        codeTypes={['qr']}
        animationType="slide"
      />
    </View>
  );
};
