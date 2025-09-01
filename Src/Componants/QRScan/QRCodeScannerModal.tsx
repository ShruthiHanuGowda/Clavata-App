import React, {useState, useEffect} from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  SafeAreaView,
  StatusBar,
  ActivityIndicator,
} from 'react-native';
import {
  Camera,
  useCameraDevices,
  useCodeScanner,
  CameraPermissionStatus,
  Code,
  CameraDevice,
} from 'react-native-vision-camera';
import {Colors} from '../../Theme';

// Type definitions
export type CodeType =
  | 'code-128'
  | 'code-39'
  | 'code-93'
  | 'codabar'
  | 'ean-13'
  | 'ean-8'
  | 'itf'
  | 'upc-e'
  | 'qr'
  | 'pdf-417'
  | 'aztec'
  | 'data-matrix';

export interface QRCodeScannerModalProps {
  visible: boolean;
  onClose: () => void;
  onCodeScanned: (data: string) => void;
  title?: string;
  codeTypes?: CodeType[];
  animationType?: 'none' | 'slide' | 'fade';
}

const QRCodeScannerModal: React.FC<QRCodeScannerModalProps> = ({
  visible,
  onClose,
  onCodeScanned,
  title = 'Scan QR Code',
  codeTypes = ['qr'],
  animationType = 'slide',
}) => {
  const [hasPermission, setHasPermission] = useState<boolean | null>(null);
  const [isScanning, setIsScanning] = useState<boolean>(true);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  const devices = useCameraDevices();
  const device: CameraDevice | undefined = devices.find(
    d => d.position === 'back',
  );

  useEffect(() => {
    console.log('Available camera devices:', devices);
    console.log('Selected device:', device);
  }, [devices, device]);

  useEffect(() => {
    if (visible) {
      requestCameraPermission();
      setIsScanning(true);
    }
  }, [visible]);

  const requestCameraPermission = async (): Promise<void> => {
    setIsLoading(true);
    try {
      const permission: CameraPermissionStatus =
        await Camera.requestCameraPermission();
      setHasPermission(permission === 'granted');
    } catch (error) {
      console.error('Error requesting camera permission:', error);
      setHasPermission(false);
    } finally {
      setIsLoading(false);
    }
  };

  // Code scanner configuration
  const codeScanner = useCodeScanner({
    codeTypes: codeTypes,
    onCodeScanned: (codes: Code[]) => {
      if (codes.length > 0 && isScanning) {
        const scannedCode = codes[0];
        console.log('🚀 ~ scannedCode:', scannedCode);
        setIsScanning(false);

        // Call the callback with scanned data if defined
        if (scannedCode.value !== undefined) {
          onCodeScanned(scannedCode.value);
        }
      }
    },
  });

  const handleClose = (): void => {
    setIsScanning(false);
    onClose();
  };

  const renderPermissionView = (): React.ReactElement => (
    <View style={styles.centerContainer}>
      <Text style={styles.permissionText}>
        Camera permission is required to scan QR codes
      </Text>
      <TouchableOpacity
        style={styles.permissionButton}
        onPress={requestCameraPermission}>
        <Text style={styles.permissionButtonText}>Grant Permission</Text>
      </TouchableOpacity>
    </View>
  );

  const renderLoadingView = (): React.ReactElement => (
    <View style={styles.centerContainer}>
      <ActivityIndicator size="large" color="#009D94" />
      <Text style={styles.loadingText}>Initializing camera...</Text>
    </View>
  );

  const renderNoDeviceView = (): React.ReactElement => (
    <View style={styles.centerContainer}>
      <Text style={styles.permissionText}>No camera device available</Text>
    </View>
  );

  const renderCameraView = (): React.ReactElement => {
    if (!device) {
      return renderNoDeviceView();
    }

    return (
      <View style={styles.cameraContainer}>
        <Camera
          style={styles.camera}
          device={device}
          isActive={visible && isScanning}
          codeScanner={codeScanner}
        />

        {/* Scanning overlay */}
        <View style={styles.overlay}>
          <View style={styles.scanArea}>
            <View style={[styles.corner, styles.topLeft]} />
            <View style={[styles.corner, styles.topRight]} />
            <View style={[styles.corner, styles.bottomLeft]} />
            <View style={[styles.corner, styles.bottomRight]} />
          </View>

          <Text style={styles.instructionText}>
            Point camera at QR code to scan
          </Text>
        </View>
      </View>
    );
  };

  return (
    <Modal
      visible={visible}
      animationType={animationType}
      presentationStyle="fullScreen"
      onRequestClose={handleClose}>
      <StatusBar barStyle="light-content" backgroundColor="#000" />
      <SafeAreaView style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={handleClose} style={styles.closeButton}>
            <Text style={styles.closeButtonText}>✕</Text>
          </TouchableOpacity>
          <Text style={styles.headerText}>{title}</Text>
          <View style={styles.headerSpacer} />
        </View>

        {/* Camera Content */}
        <View style={styles.content}>
          {isLoading
            ? renderLoadingView()
            : hasPermission === false
            ? renderPermissionView()
            : !device
            ? renderNoDeviceView()
            : renderCameraView()}
        </View>
      </SafeAreaView>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors?.white,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 15,
    backgroundColor: Colors?.white,
  },
  closeButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Colors?.black,
    justifyContent: 'center',
    alignItems: 'center',
  },
  closeButtonText: {
    color: Colors?.white,
    fontSize: 18,
    fontWeight: 'bold',
  },
  headerText: {
    fontSize: 20,
    fontWeight: 'bold',
    color: Colors?.black,
    textAlign: 'center',
  },
  headerSpacer: {
    width: 40,
  },
  content: {
    flex: 1,
  },
  cameraContainer: {
    flex: 1,
    position: 'relative',
  },
  camera: {
    flex: 1,
  },
  overlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
  },
  scanArea: {
    width: 250,
    height: 250,
    position: 'relative',
  },
  corner: {
    position: 'absolute',
    width: 30,
    height: 30,
    borderColor: '#009D94',
    borderWidth: 3,
  },
  topLeft: {
    top: 0,
    left: 0,
    borderBottomWidth: 0,
    borderRightWidth: 0,
  },
  topRight: {
    top: 0,
    right: 0,
    borderBottomWidth: 0,
    borderLeftWidth: 0,
  },
  bottomLeft: {
    bottom: 0,
    left: 0,
    borderTopWidth: 0,
    borderRightWidth: 0,
  },
  bottomRight: {
    bottom: 0,
    right: 0,
    borderTopWidth: 0,
    borderLeftWidth: 0,
  },
  instructionText: {
    color: Colors?.white,
    fontSize: 16,
    textAlign: 'center',
    marginTop: 30,
    backgroundColor: 'rgba(0,0,0,0.7)',
    padding: 12,
    borderRadius: 8,
    maxWidth: 280,
  },
  controls: {
    paddingHorizontal: 20,
    paddingVertical: 20,
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.9)',
  },
  controlButton: {
    paddingHorizontal: 40,
    paddingVertical: 12,
    borderRadius: 25,
    minWidth: 120,
    alignItems: 'center',
  },
  pauseButton: {
    backgroundColor: '#ff4444',
  },
  resumeButton: {
    backgroundColor: '#009D94',
  },
  controlButtonText: {
    color: Colors?.black,
    fontSize: 16,
    fontWeight: 'bold',
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  permissionText: {
    color: Colors?.black,
    fontSize: 18,
    textAlign: 'center',
    marginBottom: 20,
  },
  permissionButton: {
    backgroundColor: '#009D94',
    paddingHorizontal: 30,
    paddingVertical: 12,
    borderRadius: 25,
  },
  permissionButtonText: {
    color: Colors?.white,
    fontSize: 16,
    fontWeight: 'bold',
  },
  loadingText: {
    color: Colors?.black,
    fontSize: 16,
    marginTop: 10,
  },
  debugText: {
    color: Colors?.black,
    fontSize: 14,
    marginBottom: 10,
    textAlign: 'center',
  },
});

export default QRCodeScannerModal;
