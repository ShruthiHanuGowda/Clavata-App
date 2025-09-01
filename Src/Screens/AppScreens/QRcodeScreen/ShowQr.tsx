import React, {useState} from 'react';
import {View, Text, TouchableOpacity, Image, StyleSheet} from 'react-native';
import {DText} from '../../../Componants/DText';
import {fontsFamily, Images} from '../../../Theme';
import 'text-encoding';
import Share from 'react-native-share';
import QRCode from 'react-native-qrcode-svg';
import Clipboard from '@react-native-clipboard/clipboard';
import {SnackBarMessage} from '../../../utils/snackBar';
import RNFS from 'react-native-fs';

interface ShowQrProps {
  coinCode: string;
  address: string;
  name?: string;
}

interface ShareOptions {
  title: string;
  message: string;
  url: string;
  subject: string;
}

const ShowQr: React.FC<ShowQrProps> = ({coinCode, address, name}) => {
  const saveQrToDisk = async (): Promise<void> => {};
  const [downloading, setDownloading] = useState<boolean>(false);
  const [qrCodeRef, setQrCodeRef] = useState<any>();

  const copy = (): void => {
    Clipboard.setString(address);
    SnackBarMessage('Address is copied!', 'default');
  };

  const saveToPhotoLibrary = async (base64Data: string): Promise<void> => {
    console.log('🚀 ~ ShowQr ~ base64Data:', base64Data);
    try {
      setDownloading(true);

      // For this method, you'll need to install @react-native-camera-roll/camera-roll
      // npm install @react-native-camera-roll/camera-roll

      const CameraRoll =
        require('@react-native-camera-roll/camera-roll').CameraRoll;

      // Convert base64 to local file first
      const cleanBase64 = base64Data.replace(/^data:image\/[a-z]+;base64,/, '');
      const tempPath = `${
        RNFS.CachesDirectoryPath
      }/temp_image_${Date.now()}.png`;

      await RNFS.writeFile(tempPath, cleanBase64, 'base64');

      // Save to photo library
      await CameraRoll.save(`file://${tempPath}`, {type: 'photo'});

      // Clean up temp file
      await RNFS.unlink(tempPath);

      SnackBarMessage('Image saved to photo library', 'success');
    } catch (error) {
      console.error('Save to library error:', error);
      SnackBarMessage('Failed to save image to photo library', 'error');
    } finally {
      setDownloading(false);
    }
  };

  const onShare = async (): Promise<void> => {
    if (qrCodeRef) {
      try {
        qrCodeRef.toDataURL((data: string) => {
          const shareImageBase64: ShareOptions = {
            title: 'QR',
            message: `${
              coinCode === 'WUSDC'
                ? 'wUSDC'
                : coinCode === 'WEURC'
                ? 'wEURC'
                : coinCode
            } address: ${address}`,
            url: `data:image/png;base64,${data}`,
            subject: 'Share QR code',
          };
          Share.open(shareImageBase64)
            .then(res => {})
            .catch(err => {
              err && {};
            });
        });
      } catch (error) {}
    }
  };

  return (
    <View style={styles.boxContainer}>
      <View style={styles.outerBox}>
        <View style={styles.qrCodeAlign}>
          {/* <Image source={images.tempqrcode} style={{height: 350, width: 350}} /> */}
          <QRCode size={200} value={address} getRef={c => setQrCodeRef(c)} />
        </View>
        <View style={styles.qrUsernameAlign}>
          {/* <Text style={styles.username} numberOfLines={1}>

          </Text> */}
        </View>

        <View style={styles.qrBtnAlign}>
          <TouchableOpacity
            style={styles.downloadBtn}
            onPress={() => {
              qrCodeRef.toDataURL((data: string) => {
                saveToPhotoLibrary(data);
              });
            }}>
            <DText fontStyle="fontBold" style={styles.downloadText}>
              Download
            </DText>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.buttonContainer}
            onPress={() => onShare()}>
            <DText fontStyle="fontBold" style={styles.shareText}>
              Share
            </DText>
          </TouchableOpacity>
        </View>
        <View style={styles.addressBox}>
          <View style={styles.addressAlign}>
            <View style={styles.addressTextContainer}>
              <Text style={styles.content} numberOfLines={2}>
                <Text style={styles.address}>{address}</Text>
              </Text>
            </View>
            <TouchableOpacity onPress={copy} style={styles.copyIconAlign}>
              <Image
                source={Images.copyIcon}
                style={styles.copyIcon}
                resizeMode="contain"
              />
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  boxContainer: {
    marginHorizontal: 20,
  },
  outerBox: {
    backgroundColor: '#fff',
    width: '100%',
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 24,
  },
  qrCodeAlign: {
    marginTop: 32,
    alignContent: 'center',
    justifyContent: 'center',
  },
  qrUsernameAlign: {
    marginTop: 26,
    alignSelf: 'center',
    marginBottom: 20,
  },
  qrBtnAlign: {
    width: '85%',
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginVertical: 10,
    alignContent: 'space-between',
  },
  downloadBtn: {
    width: '45%',
    borderColor: '#000',
    borderWidth: 1,
    padding: 12,
    backgroundColor: '#000',
    borderRadius: 7,
  },
  addressBox: {
    width: '100%',
    borderColor: '#E8E8E850',
    borderBottomLeftRadius: 10,
    borderBottomRightRadius: 10,
    borderTopWidth: 1,
    marginTop: 20,
  },
  addressAlign: {
    padding: 20,
    justifyContent: 'space-between',
    flexDirection: 'row',
    alignItems: 'center',
  },
  addressTextContainer: {
    width: '85%',
  },
  username: {
    fontFamily: fontsFamily.MulishBold,
    fontSize: 28,
    color: '#000',
  },
  buttonContainer: {
    width: '45%',
    borderColor: '#000',
    borderWidth: 1.2,
    padding: 12,
    borderRadius: 7,
  },
  shareText: {
    fontSize: 14,
    textAlign: 'center',
    color: '#000',
  },
  downloadText: {
    fontSize: 14,
    textAlign: 'center',
    color: '#ffff',
  },
  content: {
    fontFamily: fontsFamily.Mulish,
    fontSize: 12,
    color: '#00201B',
    letterSpacing: 1,
    marginBottom: 5,
  },
  address: {
    fontSize: 12,
    color: '#333333',
    fontFamily: fontsFamily.MulishBold,
  },
  copyIconAlign: {
    width: '15%',
    alignItems: 'center',
  },
  copyIcon: {
    width: 30,
    height: 30,
  },
});

export default ShowQr;
