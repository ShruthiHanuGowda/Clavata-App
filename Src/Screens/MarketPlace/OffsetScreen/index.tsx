import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  ScrollView,
  Image,
  Alert,
  Linking,
  Platform,
} from 'react-native';
import { Header } from '@rneui/base';
import { fontsFamily } from '../../../Theme';
import images from '../../../Theme/images';
import { navigateBack } from '../../../Navigation/NavigationFunctions';
import { DText } from '../../../Componants/DText';
import { useOffsetNft } from '../../../hooks/useOffsetNft';
import { useAuth } from '../../../../screens/Provider/authProvider';
import { useMagic } from '../../../../screens/Provider/MagicProvider';
import RNFS from 'react-native-fs';
import axios from 'axios';
import { getBlockExploreLink } from '../../../utils/explorer';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';
import DatePicker from 'react-native-date-picker';
import moment from 'moment';
import Share from 'react-native-share';

const PURPOSE_OPTIONS = [
  { label: 'Scope 2 Emissions', value: 'Scope 2 Emissions' },
  { label: 'Scope 3 Emissions', value: 'Scope 3 Emissions' },
];

const TAX_RATE_PER_MWH = 0.1;

const OffsetScreen = ({ route }: any) => {
  const { nft } = route.params;
  const { userDetails } = useAuth();
  const { magic_denergy } = useMagic();
  const [volume, setVolume] = useState('');
  const [startDate, setStartDate] = useState(null);
  const [endDate, setEndDate] = useState(null);
  const [purpose, setPurpose] = useState('');
  const [showPurposeDropdown, setShowPurposeDropdown] = useState(false);
  const [inputError, setInputError] = useState('');
  const [dateErrors, setDateErrors] = useState<any>({});
  const [currentStep, setCurrentStep] = useState('form');
  const [currentQuantity, setCurrentQuantity] = useState(
    nft?.marketData?.quantity,
  );
  const [calculatedTax, setCalculatedTax] = useState(0);
  const [showStartDatePicker, setShowStartDatePicker] =
    useState<boolean>(false);
  const [showEndDatePicker, setShowEndDatePicker] = useState<boolean>(false);
  const [dateFieldEditing, setDateFieldEditing] = useState<
    'startDate' | 'endDate' | null
  >(null);

  const account = userDetails?.userWallet;
  const walletAddress = userDetails?.userWallet;

  const {
    isLoadingOffset,
    redemptionUrl,
    pdfDownloadUrl,
    transactionHash,
    offsetSuccess,
    executeOffset,
    resetOffsetState,
    getAvailableQuantity,
    validateOffsetVolume,
  } = useOffsetNft(magic_denergy, account, walletAddress);

  const availableQuantity = getAvailableQuantity(currentQuantity);

  useEffect(() => {
    if (offsetSuccess && redemptionUrl) {
      setCurrentStep('success');
    }
  }, [offsetSuccess, redemptionUrl]);

  // Calculate tax whenever volume changes
  useEffect(() => {
    if (volume && !isNaN(Number(volume)) && Number(volume) > 0) {
      const tax = Number(volume) * TAX_RATE_PER_MWH;
      setCalculatedTax(tax);
    } else {
      setCalculatedTax(0);
    }
  }, [volume]);

  const handleInputChange = (text: string) => {
    setVolume(text);

    if (text) {
      const validation = validateOffsetVolume(text, currentQuantity);
      if (!validation.isValid) {
        if (isNaN(Number(text)) || Number(text) <= 0) {
          setInputError('Please enter a valid positive number');
        } else if (Number(text) > availableQuantity) {
          setInputError(`Maximum available: ${availableQuantity} MWh`);
        }
      } else {
        setInputError('');
      }
    } else {
      setInputError('');
    }
  };

  const openDatePicker = (field: 'startDate' | 'endDate') => {
    setDateFieldEditing(field);
    if (field === 'startDate') {
      setShowStartDatePicker(true);
      setStartDate(new Date());
    } else if (field === 'endDate') {
      setShowEndDatePicker(true);
      setEndDate(new Date());
    }
  };

  const onStartDateChange = (selectedDate: Date) => {
    setShowStartDatePicker(false);
    setStartDate(selectedDate);

    let newErrors = { ...dateErrors };

    // Clear invalid format error (we assume the date picker always returns a valid Date)
    delete newErrors.startDate;

    if (endDate && selectedDate >= endDate) {
      newErrors.dateRange = 'End date must be after start date';
    } else {
      delete newErrors.dateRange;
    }

    setDateErrors(newErrors);
  };

  const onEndDateChange = (selectedDate: Date) => {
    setShowEndDatePicker(false);
    setEndDate(selectedDate);

    let newErrors = { ...dateErrors };

    // Clear invalid format error (picker guarantees valid date)
    delete newErrors.endDate;

    if (startDate && startDate >= selectedDate) {
      newErrors.dateRange = 'End date must be after start date';
    } else {
      delete newErrors.dateRange;
    }

    setDateErrors(newErrors);
  };

  const handlePurposeSelect = (selectedPurpose: any) => {
    setPurpose(selectedPurpose.value);
    setShowPurposeDropdown(false);
  };

  const setMaxAmount = () => {
    setVolume(availableQuantity.toString());
    setInputError('');
  };

  const isFormValid = () => {
    const hasVolume = volume && volume.trim() !== '';
    const hasValidVolume =
      hasVolume && !inputError && !isNaN(Number(volume)) && Number(volume) > 0;
    const hasStartDate = startDate && startDate;
    const hasEndDate = endDate && endDate;
    const hasPurpose = purpose && purpose.trim() !== '';
    const hasNoDateErrors = Object.keys(dateErrors).length === 0;

    return (
      hasValidVolume &&
      hasStartDate &&
      hasEndDate &&
      hasPurpose &&
      hasNoDateErrors
    );
  };

  const handleSubmit = async () => {
    if (!isFormValid()) return;

    setCurrentStep('processing');
    const success = await executeOffset(
      {
        volume,
        startDate,
        endDate,
        purpose,
        taxAmount: calculatedTax,
      },
      nft,
    );

    if (!success) {
      setCurrentStep('form');
    }
  };

  const handleViewCertificate = () => {
    if (redemptionUrl) {
      Linking.openURL(redemptionUrl).catch(err =>
        console.error('Failed to open URL:', err),
      );
    }
  };

  const handleDownloadCertificate = async () => {
    try {
      if (!pdfDownloadUrl) return;

      const timestamp = Math.floor(Date.now() / 1000);
      const fileName = `certificate_${timestamp}.pdf`;
      const filePath =
        Platform.OS === 'android'
          ? `${RNFS.DownloadDirectoryPath}/${fileName}`
          : `${RNFS.DocumentDirectoryPath}/${fileName}`;

      const response = await axios({
        method: 'GET',
        url: pdfDownloadUrl,
        responseType: 'arraybuffer',
        headers: {
          Accept: 'application/pdf',
          'User-Agent':
            'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        },
        maxRedirects: 5,
        timeout: 30000,
      });

      await RNFS.writeFile(
        filePath,
        Buffer.from(response.data).toString('base64'),
        'base64',
      );
      console.log('Certificate downloaded to:', filePath);

      const shareUrl = Platform.OS === 'ios' ? filePath : `file://${filePath}`;

      Share.open({
        url: shareUrl,
        title: 'Certificate Download Complete',
        failOnCancel: false,
        showAppsToView: true,
      })
        .then((res) => {
          console.log(res);
        })
        .catch((err) => {
          err && console.log(err);
        });
    } catch (error) {
      console.log('Download error:', error);
      Alert.alert(
        'Download Failed',
        'There was a problem downloading the certificate. Please try again later.',
      );
    }
  };

  const handleExplorer = () => {
    if (transactionHash) {
      const explorerUrl = getBlockExploreLink(transactionHash, 'transaction');
      Linking.openURL(explorerUrl).catch(err =>
        console.error('Failed to open explorer:', err),
      );
    }
  };

  const renderTaxCalculation = () => {
    if (!volume || isNaN(Number(volume)) || Number(volume) <= 0) {
      return null;
    }

    return (
      <View style={styles.taxContainer}>
        <DText fontStyle="fontBold" style={styles.taxTitle}>
          Transaction Fee
        </DText>
        <View style={styles.taxCalculationRow}>
          <DText style={styles.taxLabel}>Volume: {volume} MWh</DText>
          <DText style={styles.taxValue}>× {TAX_RATE_PER_MWH} WUSDC</DText>
        </View>
        <View style={styles.taxTotalRow}>
          <DText fontStyle="fontBold" style={styles.taxTotalLabel}>
            Total Fee:
          </DText>
          <DText fontStyle="fontBold" style={styles.taxTotalValue}>
            {calculatedTax.toFixed(6)} WUSDC
          </DText>
        </View>
      </View>
    );
  };

  const renderForm = () => (
    <KeyboardAwareScrollView
      contentContainerStyle={{ flexGrow: 1 }}
      keyboardShouldPersistTaps="handled"
      style={styles.container}
      showsVerticalScrollIndicator={false}
      enableOnAndroid={true}
      enableAutomaticScroll={true}
      extraScrollHeight={20}
      keyboardOpeningTime={250}>
      <View style={styles.headerSection}>
        <View style={styles.iconContainer}>
          <Text style={styles.iconText}>⚡</Text>
        </View>
        <DText fontStyle="fontBold" style={styles.title}>
          Offset Energy
        </DText>
        <DText style={styles.subtitle}>
          Enter the details for your I-RECs offset
        </DText>
      </View>

      <View style={styles.availableContainer}>
        <DText style={styles.availableLabel}>Available Quantity:</DText>
        <DText fontStyle="fontBold" style={styles.availableAmount}>
          {availableQuantity} MWh
        </DText>
      </View>

      <View style={styles.formContainer}>
        {/* Volume Input */}
        <View style={styles.inputGroup}>
          <DText fontStyle="fontBold" style={styles.label}>
            Volume *
          </DText>
          <View style={styles.inputContainer}>
            <TextInput
              style={[
                styles.input,
                inputError ? styles.warningInput : undefined,
              ]}
              keyboardType="numeric"
              value={volume}
              onChangeText={handleInputChange}
              placeholder="0.00"
              placeholderTextColor="#A0A0A0"
            />
            <DText style={styles.inputLabel}>MWh</DText>
            <TouchableOpacity
              style={styles.maxButton}
              onPress={setMaxAmount}
              activeOpacity={0.7}>
              <DText fontStyle="fontBold" style={styles.maxButtonText}>
                MAX
              </DText>
            </TouchableOpacity>
          </View>
          {inputError ? (
            <DText style={styles.warningText}>{inputError}</DText>
          ) : null}
        </View>

        {/* Tax Calculation */}
        {renderTaxCalculation()}

        {/* Start Date Input */}
        <View style={styles.inputGroup}>
          <DText fontStyle="fontBold" style={styles.label}>
            Start Date *
          </DText>

          <View style={{ position: 'relative' }}>
            <TextInput
              style={[styles.input, dateErrors.endDate && styles.warningInput]}
              value={startDate && moment(startDate).format('YYYY-MM-DD')}
              editable={false}
              placeholder="YYYY-MM-DD"
              placeholderTextColor="#A0A0A0"
            />

            <TouchableOpacity
              onPress={() => openDatePicker('startDate')}
              style={{
                position: 'absolute',
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                zIndex: 1,
              }}
              activeOpacity={0.8}
            />
          </View>

          {dateErrors.startDate && (
            <DText style={styles.warningText}>{dateErrors.startDate}</DText>
          )}
        </View>

        {/* End Date Input */}
        <View style={styles.inputGroup}>
          <DText fontStyle="fontBold" style={styles.label}>
            End Date *
          </DText>

          <View style={{ position: 'relative' }}>
            <TextInput
              style={[styles.input, dateErrors.endDate && styles.warningInput]}
              value={endDate && moment(endDate).format('YYYY-MM-DD')}
              editable={false}
              placeholder="YYYY-MM-DD"
              placeholderTextColor="#A0A0A0"
            />

            <TouchableOpacity
              onPress={() => openDatePicker('endDate')}
              style={{
                position: 'absolute',
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                zIndex: 1,
              }}
              activeOpacity={0.8}
            />
          </View>

          {dateErrors.endDate && (
            <DText style={styles.warningText}>{dateErrors.endDate}</DText>
          )}
        </View>

        {/* Date Range Error */}
        {dateErrors.dateRange && (
          <DText style={styles.warningText}>{dateErrors.dateRange}</DText>
        )}

        {/* Purpose Dropdown */}
        <View style={styles.inputGroup}>
          <DText fontStyle="fontBold" style={styles.label}>
            Purpose *
          </DText>
          <TouchableOpacity
            style={styles.dropdownButton}
            onPress={() => setShowPurposeDropdown(!showPurposeDropdown)}
            activeOpacity={0.8}>
            <DText
              style={[
                styles.dropdownButtonText,
                !purpose && styles.placeholderText,
              ]}>
              {purpose
                ? PURPOSE_OPTIONS.find(opt => opt.value === purpose)?.label
                : 'Select purpose'}
            </DText>
            <DText style={styles.dropdownArrow}>
              {showPurposeDropdown ? '▲' : '▼'}
            </DText>
          </TouchableOpacity>

          {showPurposeDropdown && (
            <View style={styles.dropdownContainer}>
              {PURPOSE_OPTIONS.map((option, index) => (
                <TouchableOpacity
                  key={option.value}
                  style={[
                    styles.dropdownOption,
                    index === PURPOSE_OPTIONS.length - 1 &&
                    styles.lastDropdownOption,
                  ]}
                  onPress={() => handlePurposeSelect(option)}
                  activeOpacity={0.8}>
                  <DText style={styles.dropdownOptionText}>
                    {option.label}
                  </DText>
                </TouchableOpacity>
              ))}
            </View>
          )}
        </View>
      </View>

      <TouchableOpacity
        style={[styles.button, !isFormValid() && styles.buttonDisabled]}
        onPress={handleSubmit}
        disabled={!isFormValid()}
        activeOpacity={0.8}>
        <DText fontStyle="fontBold" style={styles.buttonText}>
          Execute Offset
        </DText>
      </TouchableOpacity>
    </KeyboardAwareScrollView>
  );

  const renderProcessing = () => (
    <View style={styles.centerContainer}>
      <View style={styles.processingContainer}>
        <ActivityIndicator size="large" color="#81c8c3" />
        <DText fontStyle="fontBold" style={styles.processingTitle}>
          Processing Offset...
        </DText>
        <DText style={styles.processingSubtitle}>Burning tokens ....</DText>
        {calculatedTax > 0 && (
          <DText style={styles.processingFeeText}>
            Fee: {calculatedTax.toFixed(4)} WUSDC
          </DText>
        )}
      </View>
    </View>
  );

  const renderSuccess = () => (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      <View style={styles.headerSection}>
        <View style={[styles.iconContainer, styles.successIconContainer]}>
          <Text style={styles.successIconText}>✓</Text>
        </View>
        <DText fontStyle="fontBold" style={styles.title}>
          Offset Successful!
        </DText>
        <DText style={styles.subtitle}>
          Your offset has been completed successfully.
        </DText>
      </View>

      <View style={styles.successDetailsContainer}>
        <View style={styles.successDetailRow}>
          <DText style={styles.successDetailLabel}>Volume Offset:</DText>
          <DText fontStyle="fontBold" style={styles.successDetailValue}>
            {volume} MWh
          </DText>
        </View>
        <View style={styles.successDetailRow}>
          <DText style={styles.successDetailLabel}>Transaction Fee:</DText>
          <DText fontStyle="fontBold" style={styles.successDetailValue}>
            {calculatedTax.toFixed(6)} WUSDC
          </DText>
        </View>
        <View style={styles.successDetailRow}>
          <DText style={styles.successDetailLabel}>Period:</DText>
          <DText fontStyle="fontBold" style={styles.successDetailValue}>
            {moment(startDate).format('YYYY-MM-DD')} to{' '}
            {moment(endDate).format('YYYY-MM-DD')}
          </DText>
        </View>
        <View style={styles.successDetailRow}>
          <DText style={styles.successDetailLabel}>Purpose:</DText>
          <DText fontStyle="fontBold" style={styles.successDetailValue}>
            {purpose}
          </DText>
        </View>
      </View>

      <View style={styles.certificateButtonsContainer}>
        <TouchableOpacity
          style={styles.certificateButton}
          onPress={handleViewCertificate}
          activeOpacity={0.8}>
          <Text style={styles.certificateButtonIcon}>👁</Text>
          <DText fontStyle="fontBold" style={styles.certificateButtonText}>
            View Certificate
          </DText>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.certificateButton}
          onPress={handleDownloadCertificate}
          activeOpacity={0.8}>
          <Text style={styles.certificateButtonIcon}>📥</Text>
          <DText fontStyle="fontBold" style={styles.certificateButtonText}>
            Download Certificate
          </DText>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.certificateButton}
          onPress={handleExplorer}
          activeOpacity={0.8}>
          <Text style={styles.certificateButtonIcon}>🔍</Text>
          <DText fontStyle="fontBold" style={styles.certificateButtonText}>
            View on Explorer
          </DText>
        </TouchableOpacity>
      </View>

      <TouchableOpacity
        style={styles.button}
        onPress={() => navigateBack()}
        activeOpacity={0.8}>
        <DText fontStyle="fontBold" style={styles.buttonText}>
          Done
        </DText>
      </TouchableOpacity>
    </ScrollView>
  );

  const renderCurrentStep = () => {
    switch (currentStep) {
      case 'processing':
        return renderProcessing();
      case 'success':
        return renderSuccess();
      default:
        return renderForm();
    }
  };

  return (
    <View style={styles.screenContainer}>
      <Header
        backgroundColor={'#FFF'}
        containerStyle={{ borderBottomWidth: 0 }}
        leftComponent={
          <TouchableOpacity
            onPress={() => navigateBack()}
            style={styles.headerIconContainer}>
            <Image source={images.back} />
          </TouchableOpacity>
        }
        centerComponent={
          <View style={styles.headerCenterContainer}>
            <DText fontStyle="fontBold" style={styles.headerTitle}>
              Offset Energy
            </DText>
          </View>
        }
      />
      {renderCurrentStep()}
      <DatePicker
        modal
        open={showStartDatePicker}
        date={startDate || new Date()}
        mode="date"
        maximumDate={new Date()}
        onConfirm={onStartDateChange}
        onCancel={() => setShowStartDatePicker(false)}
      />

      <DatePicker
        modal
        open={showEndDatePicker}
        date={endDate || new Date()}
        mode="date"
        onConfirm={onEndDateChange}
        onCancel={() => setShowEndDatePicker(false)}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  screenContainer: {
    flex: 1,
    backgroundColor: '#FFF',
  },
  container: {
    flex: 1,
    paddingHorizontal: 16,
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerIconContainer: {
    marginRight: 10,
  },
  headerCenterContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 18,
    color: '#2C2C2C',
  },
  headerSection: {
    alignItems: 'center',
    paddingVertical: 30,
  },
  iconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#E8F8F7',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },
  iconText: {
    fontSize: 32,
  },
  successIconContainer: {
    backgroundColor: '#E8F5E8',
  },
  successIconText: {
    fontSize: 40,
    color: '#4CAF50',
    fontWeight: 'bold',
  },
  title: {
    fontSize: 24,
    color: '#1A1A1A',
    marginBottom: 8,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    lineHeight: 22,
    paddingHorizontal: 20,
  },
  availableContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#F0FBF9',
    padding: 16,
    borderRadius: 8,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#B8E6E1',
  },
  availableLabel: {
    fontSize: 14,
    color: '#666',
  },
  availableAmount: {
    fontSize: 16,
    color: '#81c8c3',
  },
  formContainer: {
    flex: 1,
  },
  inputGroup: {
    marginBottom: 20,
  },
  label: {
    fontWeight: '600',
    marginBottom: 6,
    fontSize: 14,
  },
  inputContainer: {
    position: 'relative',
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 10,
    fontSize: 14,
    color: '#000',
    backgroundColor: '#fff',
  },
  warningInput: {
    borderColor: '#e74c3c',
  },
  warningText: {
    color: '#e74c3c',
    fontSize: 12,
    marginBottom: 4,
  },
  inputLabel: {
    position: 'absolute',
    right: 60,
    top: 10,
    fontSize: 14,
    color: '#81c8c3',
    fontFamily: fontsFamily.MulishBold,
  },
  maxButton: {
    position: 'absolute',
    right: 8,
    top: 6,
    backgroundColor: '#81c8c3',
    paddingHorizontal: 8,
    paddingVertical: 6,
    borderRadius: 4,
  },
  maxButtonText: {
    color: '#fff',
    fontSize: 12,
  },
  dropdownButton: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 10,
    backgroundColor: '#fff',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  dropdownButtonText: {
    fontSize: 14,
    color: '#1A1A1A',
  },
  placeholderText: {
    color: '#A0A0A0',
  },
  dropdownArrow: {
    fontSize: 14,
    color: '#81c8c3',
    fontFamily: fontsFamily.MulishBold,
  },
  dropdownContainer: {
    marginTop: 4,
    backgroundColor: '#fff',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#ddd',
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  dropdownOption: {
    paddingHorizontal: 10,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  lastDropdownOption: {
    borderBottomWidth: 0,
  },
  dropdownOptionText: {
    fontSize: 14,
    color: '#1A1A1A',
  },
  // Tax Calculation Styles
  taxContainer: {
    backgroundColor: '#f8f8f8',
    padding: 12,
    borderRadius: 8,
    marginBottom: 16,
  },
  taxTitle: {
    fontSize: 14,
    color: '#555',
    marginBottom: 8,
  },
  taxCalculationRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  taxLabel: {
    fontSize: 13,
    color: '#555',
  },
  taxValue: {
    fontSize: 13,
    color: '#555',
  },
  taxTotalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: '#ddd',
  },
  taxTotalLabel: {
    fontSize: 14,
    color: '#555',
  },
  taxTotalValue: {
    fontSize: 14,
    color: '#555',
  },
  button: {
    backgroundColor: '#81c8c3',
    padding: 14,
    borderRadius: 8,
    alignItems: 'center',
    marginVertical: 20,
  },
  buttonDisabled: {
    backgroundColor: '#ccc',
  },
  buttonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
  processingContainer: {
    alignItems: 'center',
    paddingVertical: 40,
  },
  processingTitle: {
    fontSize: 20,
    color: '#1A1A1A',
    marginTop: 20,
    textAlign: 'center',
  },
  processingSubtitle: {
    fontSize: 16,
    color: '#666',
    marginTop: 8,
    textAlign: 'center',
  },
  processingFeeText: {
    fontSize: 14,
    color: '#555',
    marginTop: 8,
    textAlign: 'center',
    fontWeight: 'bold',
  },
  successDetailsContainer: {
    backgroundColor: '#F0FBF9',
    padding: 20,
    borderRadius: 8,
    marginBottom: 30,
    borderWidth: 1,
    borderColor: '#B8E6E1',
  },
  successDetailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  successDetailLabel: {
    fontSize: 14,
    color: '#666',
    flex: 1,
  },
  successDetailValue: {
    fontSize: 14,
    color: '#81c8c3',
    flex: 1,
    textAlign: 'right',
  },
  certificateButtonsContainer: {
    gap: 12,
    marginBottom: 30,
  },
  certificateButton: {
    borderRadius: 8,
    backgroundColor: '#F8FFFE',
    borderWidth: 1,
    borderColor: '#81c8c3',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
    padding: 14,
  },
  certificateButtonIcon: {
    fontSize: 20,
  },
  certificateButtonText: {
    color: '#81c8c3',
    fontSize: 16,
  },
});

export default OffsetScreen;
