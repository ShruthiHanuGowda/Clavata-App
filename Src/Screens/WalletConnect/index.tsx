import React, {useState} from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  Modal,
  FlatList,
  Image,
  Alert,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import {SafeAreaView} from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/Entypo';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import {useWalletConnect} from '../../providers';
import {navigateBack} from '../../utils/navigationService';
import QRCodeScannerModal from '../../components/QRScan/QRCodeScannerModal';
import {SnackBarMessage} from '../../utils/snackBar';
import {
  CUSTOM_NETWORK_CHAIN_ID,
  SEPOLIA_CHAIN_ID,
} from '../../constants';

// Session Approval Modal Component
const SessionApprovalModal: React.FC<{
  visible: boolean;
  proposal: any;
  onApprove: (chainId: number) => void;
  onReject: () => void;
}> = ({visible, proposal, onApprove, onReject}) => {
  if (!proposal) return null;

  const {proposer} = proposal.params;
  const metadata = proposer?.metadata || {};
  const [selectedChainId, setSelectedChainId] = useState<number>(parseInt(CUSTOM_NETWORK_CHAIN_ID, 10));

  const handleApprove = () => {
    onApprove(selectedChainId);
  };


  return (
    <Modal visible={visible} transparent animationType="slide">
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          <Text style={styles.modalTitle}>Connection Request</Text>

          {metadata.icons?.[0] && (
            <Image source={{uri: metadata.icons[0]}} style={styles.dappIcon} />
          )}

          <Text style={styles.dappName}>{metadata.name || 'Unknown dApp'}</Text>
          <Text style={styles.dappUrl}>{metadata.url || ''}</Text>

          <Text style={styles.modalDescription}>
            This app wants to connect to your wallet
          </Text>

          <View style={styles.permissionsContainer}>
            <Text style={styles.permissionsTitle}>Select Network:</Text>
            
            <TouchableOpacity 
              style={[
                styles.networkOption, 
                selectedChainId === parseInt(CUSTOM_NETWORK_CHAIN_ID, 10) && styles.networkOptionSelected
              ]}
              onPress={() => setSelectedChainId(parseInt(CUSTOM_NETWORK_CHAIN_ID, 10))}
            >
              <MaterialCommunityIcons 
                name={selectedChainId === parseInt(CUSTOM_NETWORK_CHAIN_ID, 10) ? "radiobox-marked" : "radiobox-blank"} 
                size={24} 
                color={selectedChainId === parseInt(CUSTOM_NETWORK_CHAIN_ID, 10) ? "#009D94" : "#666"} 
              />
              <Text style={styles.networkName}>D-Energy (Mainnet)</Text>
            </TouchableOpacity>

            <TouchableOpacity 
              style={[
                styles.networkOption, 
                selectedChainId === parseInt(SEPOLIA_CHAIN_ID, 10) && styles.networkOptionSelected
              ]}
              onPress={() => setSelectedChainId(parseInt(SEPOLIA_CHAIN_ID, 10))}
            >
               <MaterialCommunityIcons 
                name={selectedChainId === parseInt(SEPOLIA_CHAIN_ID, 10) ? "radiobox-marked" : "radiobox-blank"} 
                size={24} 
                 color={selectedChainId === parseInt(SEPOLIA_CHAIN_ID, 10) ? "#009D94" : "#666"} 
              />
              <Text style={styles.networkName}>Sepolia (Testnet)</Text>
            </TouchableOpacity>

            <View style={styles.permissionsDivider} />

            <Text style={styles.permissionsTitle}>Permissions:</Text>
            <Text style={styles.permissionItem}>• View your wallet address</Text>
            <Text style={styles.permissionItem}>• Request transaction signatures</Text>
          </View>

          <View style={styles.modalButtons}>
            <TouchableOpacity
              style={[styles.modalButton, styles.rejectButton]}
              onPress={onReject}>
              <Text style={styles.rejectButtonText}>Reject</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.modalButton, styles.approveButton]}
              onPress={handleApprove}>
              <Text style={styles.approveButtonText}>Approve</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

// Request Approval Modal Component
const RequestApprovalModal: React.FC<{
  visible: boolean;
  request: any;
  onApprove: () => void;
  onReject: () => void;
}> = ({visible, request, onApprove, onReject}) => {
  if (!request) return null;

  const {params} = request;
  const method = params?.request?.method || 'Unknown';

  const getMethodDisplayName = (m: string) => {
    switch (m) {
      case 'personal_sign':
        return 'Sign Message';
      case 'eth_sign':
        return 'Sign Message';
      case 'eth_signTypedData':
      case 'eth_signTypedData_v4':
        return 'Sign Typed Data';
      case 'eth_sendTransaction':
        return 'Send Transaction';
      case 'eth_signTransaction':
        return 'Sign Transaction';
      default:
        return m;
    }
  };

  return (
    <Modal visible={visible} transparent animationType="slide">
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          <Text style={styles.modalTitle}>{getMethodDisplayName(method)}</Text>

          <Text style={styles.modalDescription}>
            A connected app is requesting an action from your wallet.
          </Text>

          <View style={styles.requestDetails}>
            <Text style={styles.requestMethod}>Method: {method}</Text>
          </View>

          <View style={styles.modalButtons}>
            <TouchableOpacity
              style={[styles.modalButton, styles.rejectButton]}
              onPress={onReject}>
              <Text style={styles.rejectButtonText}>Reject</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.modalButton, styles.approveButton]}
              onPress={onApprove}>
              <Text style={styles.approveButtonText}>Confirm</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

// Session Card Component
const SessionCard: React.FC<{
  session: any;
  onDisconnect: (topic: string) => void;
}> = ({session, onDisconnect}) => {
  const metadata = session.peer?.metadata || {};

  return (
    <View style={styles.sessionCard}>
      <View style={styles.sessionInfo}>
        {metadata.icons?.[0] ? (
          <Image source={{uri: metadata.icons[0]}} style={styles.sessionIcon} />
        ) : (
          <View style={styles.sessionIconPlaceholder}>
            <Icon name="link" size={20} color="#009D94" />
          </View>
        )}
        <View style={styles.sessionDetails}>
          <Text style={styles.sessionName}>{metadata.name || 'Unknown'}</Text>
          <Text style={styles.sessionUrl} numberOfLines={1}>
            {metadata.url || ''}
          </Text>
        </View>
      </View>
      <TouchableOpacity
        style={styles.disconnectButton}
        onPress={() => onDisconnect(session.topic)}>
        <Text style={styles.disconnectButtonText}>Disconnect</Text>
      </TouchableOpacity>
    </View>
  );
};

// Main WalletConnect Screen
const WalletConnectScreen: React.FC = () => {
  const {
    isInitialized,
    isConnecting,
    initError,
    activeSessions,
    pendingProposal,
    pendingRequest,
    pair,
    approveSession,
    rejectSession,
    approveRequest,
    rejectRequest,
    disconnect,
    initialize,
  } = useWalletConnect();

  const [showUriModal, setShowUriModal] = useState(false);
  const [showQRScanner, setShowQRScanner] = useState(false);
  const [uriInput, setUriInput] = useState('');
  const [isPairing, setIsPairing] = useState(false);
  const [isRetrying, setIsRetrying] = useState(false);

  const handleRetry = async () => {
    setIsRetrying(true);
    await initialize();
    setIsRetrying(false);
  };

  const handleQRCodeScanned = async (data: string) => {
    setShowQRScanner(false);
    
    // Check if it's a valid WalletConnect URI
    if (data && data.startsWith('wc:')) {
      setIsPairing(true);
      try {
        await pair(data.trim());
        SnackBarMessage('Connected successfully!', 'success');
      } catch (error: any) {
        Alert.alert('Connection Failed', error.message || 'Failed to connect to the dApp');
      } finally {
        setIsPairing(false);
      }
    } else {
      Alert.alert('Invalid QR Code', 'This QR code is not a valid WalletConnect URI. Please scan a WalletConnect QR code from a dApp.');
    }
  };

  const handleConnect = async () => {
    if (!uriInput.trim()) {
      Alert.alert('Error', 'Please enter a WalletConnect URI');
      return;
    }

    if (!uriInput.startsWith('wc:')) {
      Alert.alert('Error', 'Invalid WalletConnect URI. It should start with "wc:"');
      return;
    }

    setIsPairing(true);
    try {
      await pair(uriInput.trim());
      setUriInput('');
      setShowUriModal(false);
    } catch (error: any) {
      Alert.alert('Connection Failed', error.message || 'Failed to connect');
    } finally {
      setIsPairing(false);
    }
  };

  const handleDisconnect = async (topic: string) => {
    Alert.alert(
      'Disconnect',
      'Are you sure you want to disconnect this app?',
      [
        {text: 'Cancel', style: 'cancel'},
        {
          text: 'Disconnect',
          style: 'destructive',
          onPress: () => disconnect(topic),
        },
      ],
    );
  };

  // Show error or loading state
  if (!isInitialized) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigateBack()} style={styles.backButton}>
            <Icon name="chevron-left" size={28} color="#000" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Connected Apps</Text>
          <View style={styles.placeholder} />
        </View>
        <View style={styles.loadingContainer}>
          {initError ? (
            <>
              <Icon name="warning" size={48} color="#f59e0b" />
              <Text style={styles.errorTitle}>Configuration Required</Text>
              <Text style={styles.errorText}>{initError}</Text>
              <Text style={styles.errorHint}>
                Get a free Project ID at:{'\n'}cloud.walletconnect.com
              </Text>
              <TouchableOpacity style={styles.retryButton} onPress={handleRetry} disabled={isRetrying}>
                {isRetrying ? (
                  <ActivityIndicator color="#fff" />
                ) : (
                  <Text style={styles.retryButtonText}>Retry</Text>
                )}
              </TouchableOpacity>
            </>
          ) : (
            <>
              <ActivityIndicator size="large" color="#009D94" />
              <Text style={styles.loadingText}>Initializing WalletConnect...</Text>
            </>
          )}
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigateBack()} style={styles.backButton}>
          <Icon name="chevron-left" size={28} color="#000" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Connected Apps</Text>
        <View style={styles.placeholder} />
      </View>

      {/* Content */}
      <View style={styles.content}>
        {activeSessions.length === 0 ? (
          <View style={styles.emptyState}>
            <Icon name="link" size={48} color="#ccc" />
            <Text style={styles.emptyTitle}>No Connected Apps</Text>
            <Text style={styles.emptyDescription}>
              Connect to a dApp using WalletConnect to interact with your wallet
            </Text>
          </View>
        ) : (
          <FlatList
            data={activeSessions}
            keyExtractor={(item) => item.topic}
            renderItem={({item}) => (
              <SessionCard session={item} onDisconnect={handleDisconnect} />
            )}
            contentContainerStyle={styles.sessionsList}
          />
        )}
      </View>

      {/* Connect Buttons */}
      <View style={styles.footer}>
        <TouchableOpacity
          style={styles.scanButton}
          onPress={() => setShowQRScanner(true)}
          disabled={isConnecting || isPairing}>
          {isPairing ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <>
              <Icon name="camera" size={20} color="#fff" />
              <Text style={styles.connectButtonText}>Scan QR Code</Text>
            </>
          )}
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.pasteButton}
          onPress={() => setShowUriModal(true)}
          disabled={isConnecting || isPairing}>
          <Icon name="clipboard" size={18} color="#009D94" />
          <Text style={styles.pasteButtonText}>Paste URI</Text>
        </TouchableOpacity>
      </View>

      {/* QR Scanner Modal */}
      <QRCodeScannerModal
        visible={showQRScanner}
        onClose={() => setShowQRScanner(false)}
        onCodeScanned={handleQRCodeScanned}
        title="Scan WalletConnect QR"
        codeTypes={['qr']}
      />

      {/* URI Input Modal */}
      <Modal visible={showUriModal} transparent animationType="slide">
        <KeyboardAvoidingView 
          style={styles.modalOverlay}
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
          <TouchableOpacity 
            style={styles.modalDismiss} 
            activeOpacity={1} 
            onPress={() => {
              setShowUriModal(false);
              setUriInput('');
            }}
          />
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Connect to App</Text>
            <Text style={styles.modalDescription}>
              Paste the WalletConnect URI from the dApp
            </Text>

            <TextInput
              style={styles.uriInput}
              placeholder="wc:..."
              placeholderTextColor="#999"
              value={uriInput}
              onChangeText={setUriInput}
              autoCapitalize="none"
              autoCorrect={false}
              multiline
            />

            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={[styles.modalButton, styles.rejectButton]}
                onPress={() => {
                  setShowUriModal(false);
                  setUriInput('');
                }}>
                <Text style={styles.rejectButtonText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalButton, styles.approveButton]}
                onPress={handleConnect}
                disabled={isPairing}>
                {isPairing ? (
                  <ActivityIndicator color="#fff" />
                ) : (
                  <Text style={styles.approveButtonText}>Connect</Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </KeyboardAvoidingView>
      </Modal>

      {/* Session Approval Modal */}
      <SessionApprovalModal
        visible={!!pendingProposal}
        proposal={pendingProposal}
        onApprove={approveSession}
        onReject={rejectSession}
      />

      {/* Request Approval Modal */}
      <RequestApprovalModal
        visible={!!pendingRequest}
        request={pendingRequest}
        onApprove={approveRequest}
        onReject={rejectRequest}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  backButton: {
    padding: 4,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#000',
  },
  placeholder: {
    width: 36,
  },
  content: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#666',
  },
  errorTitle: {
    marginTop: 16,
    fontSize: 20,
    fontWeight: '700',
    color: '#333',
  },
  errorText: {
    marginTop: 8,
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    paddingHorizontal: 24,
  },
  errorHint: {
    marginTop: 16,
    fontSize: 12,
    color: '#009D94',
    textAlign: 'center',
  },
  retryButton: {
    marginTop: 16,
    paddingHorizontal: 24,
    paddingVertical: 12,
    backgroundColor: '#009D94',
    borderRadius: 8,
  },
  retryButtonText: {
    color: '#fff',
    fontWeight: '600',
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 48,
  },
  emptyTitle: {
    marginTop: 16,
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
  },
  emptyDescription: {
    marginTop: 8,
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    lineHeight: 20,
  },
  sessionsList: {
    padding: 16,
  },
  sessionCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    backgroundColor: '#f9f9f9',
    borderRadius: 12,
    marginBottom: 12,
  },
  sessionInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  sessionIcon: {
    width: 40,
    height: 40,
    borderRadius: 8,
  },
  sessionIconPlaceholder: {
    width: 40,
    height: 40,
    borderRadius: 8,
    backgroundColor: '#e0f7f6',
    justifyContent: 'center',
    alignItems: 'center',
  },
  sessionDetails: {
    marginLeft: 12,
    flex: 1,
  },
  sessionName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  sessionUrl: {
    fontSize: 12,
    color: '#666',
    marginTop: 2,
  },
  disconnectButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    backgroundColor: '#fee',
    borderRadius: 6,
  },
  disconnectButtonText: {
    fontSize: 12,
    color: '#d32f2f',
    fontWeight: '600',
  },
  footer: {
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: '#eee',
  },
  connectButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#009D94',
    paddingVertical: 16,
    borderRadius: 12,
    gap: 8,
  },
  connectButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  scanButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#009D94',
    paddingVertical: 16,
    borderRadius: 12,
    gap: 8,
    marginBottom: 12,
  },
  pasteButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#f5f5f5',
    paddingVertical: 14,
    borderRadius: 12,
    gap: 8,
    borderWidth: 1,
    borderColor: '#009D94',
  },
  pasteButtonText: {
    color: '#009D94',
    fontSize: 14,
    fontWeight: '600',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  modalDismiss: {
    flex: 1,
  },
  modalContent: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 24,
    paddingBottom: 40,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#333',
    textAlign: 'center',
    marginBottom: 8,
  },
  modalDescription: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    marginBottom: 24,
  },
  dappIcon: {
    width: 64,
    height: 64,
    borderRadius: 16,
    alignSelf: 'center',
    marginBottom: 16,
  },
  dappName: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    textAlign: 'center',
  },
  dappUrl: {
    fontSize: 12,
    color: '#666',
    textAlign: 'center',
    marginTop: 4,
    marginBottom: 16,
  },
  permissionsContainer: {
    backgroundColor: '#f5f5f5',
    padding: 16,
    borderRadius: 12,
    marginBottom: 24,
  },
  permissionsTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
  },
  permissionItem: {
    fontSize: 14,
    color: '#666',
    marginTop: 4,
  },
  requestDetails: {
    backgroundColor: '#f5f5f5',
    padding: 16,
    borderRadius: 12,
    marginBottom: 24,
  },
  requestMethod: {
    fontSize: 14,
    color: '#333',
  },
  uriInput: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 12,
    padding: 16,
    fontSize: 14,
    minHeight: 80,
    textAlignVertical: 'top',
    marginBottom: 24,
  },
  modalButtons: {
    flexDirection: 'row',
    gap: 12,
  },
  modalButton: {
    flex: 1,
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  rejectButton: {
    backgroundColor: '#f5f5f5',
  },
  rejectButtonText: {
    color: '#666',
    fontSize: 16,
    fontWeight: '600',
  },
  approveButton: {
    backgroundColor: '#009D94',
  },
  approveButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  networkOption: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderWidth: 1,
    borderColor: '#eee',
    borderRadius: 12,
    marginBottom: 8,
    backgroundColor: '#fff',
  },
  networkOptionSelected: {
    borderColor: '#009D94',
    backgroundColor: '#f0fdfc',
  },
  networkName: {
    marginLeft: 12,
    fontSize: 16,
    color: '#333',
    fontWeight: '500',
  },
  permissionsDivider: {
    height: 1,
    backgroundColor: '#eee',
    marginVertical: 16,
  },
});

export default WalletConnectScreen;
