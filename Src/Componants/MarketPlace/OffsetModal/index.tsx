import React, { useState } from 'react';
import {
  Modal,
  TouchableOpacity,
  View,
  Text,
  TextInput,
  StyleSheet,
  ActivityIndicator,
  Animated,
  Dimensions,
  ScrollView,
} from 'react-native';
import { fontsFamily } from '../../../Theme';

const PURPOSE_OPTIONS = [
  { label: 'Carbon Offset', value: 'carbon_offset' },
  { label: 'Renewable Energy Certificate', value: 'renewable_energy_cert' },
  { label: 'Corporate Sustainability', value: 'corporate_sustainability' },
];

export const OffsetModal = ({
  visible,
  onClose,
  isLoadingOffset,
  redemptionUrl,
  value,
  setValue,
  handleExplorer,
  handleViewCertificate,
  handleDownloadCertificate,
  onSubmit,
  offsetSuccess,
  availableQuantity,
  onValidateVolume,
}) => {
  const [inputError, setInputError] = useState('');
  const [isValidInput, setIsValidInput] = useState(true);
  const [fadeAnim] = useState(new Animated.Value(0));
  const [scaleAnim] = useState(new Animated.Value(0.8));

  // New state for additional fields
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [purpose, setPurpose] = useState('');
  const [showPurposeDropdown, setShowPurposeDropdown] = useState(false);
  const [dateErrors, setDateErrors] = useState({ startDate: '', endDate: '', dateRange: '' });

  const handleInputChange = (text) => {
    setValue(text);

    if (text && onValidateVolume) {
      const validation = onValidateVolume(text, availableQuantity * 1_000_000);
      setIsValidInput(validation.isValid);

      if (!validation.isValid) {
        if (!text || text.trim() === '') {
          setInputError('');
        } else if (isNaN(Number(text)) || Number(text) <= 0) {
          setInputError('Please enter a valid positive number');
        } else if (Number(text) > availableQuantity) {
          setInputError(`Maximum available: ${availableQuantity} MWh`);
        }
      } else {
        setInputError('');
      }
    } else {
      setInputError('');
      setIsValidInput(true);
    }
  };

  const handleDateChange = (field, text) => {
    const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
    const newErrors = { ...dateErrors };

    if (field === 'startDate') {
      setStartDate(text);
      if (text && !dateRegex.test(text)) {
        newErrors.startDate = 'Please use YYYY-MM-DD format';
      } else {
        delete newErrors.startDate;
      }
    } else if (field === 'endDate') {
      setEndDate(text);
      if (text && !dateRegex.test(text)) {
        newErrors.endDate = 'Please use YYYY-MM-DD format';
      } else {
        delete newErrors.endDate;
      }
    }

    // Validate date range
    if (startDate && endDate && dateRegex.test(startDate) && dateRegex.test(endDate)) {
      const start = new Date(startDate);
      const end = new Date(endDate);
      if (start >= end) {
        newErrors.dateRange = 'End date must be after start date';
      } else {
        delete newErrors.dateRange;
      }
    }

    setDateErrors(newErrors);
  };

  const handlePurposeSelect = (selectedPurpose) => {
    setPurpose(selectedPurpose.value);
    setShowPurposeDropdown(false);
  };

  const setMaxAmount = () => {
    setValue(availableQuantity.toString());
    setInputError('');
    setIsValidInput(true);
  };

  const isFormValid = () => {
    return (
      isValidInput &&
      value &&
      startDate &&
      endDate &&
      purpose &&
      Object.keys(dateErrors).length === 0
    );
  };

  const handleSubmit = () => {
    const payload = {
      volume: value,
      startDate,
      endDate,
      purpose,
    };
    onSubmit(payload);
  };

  React.useEffect(() => {
    if (visible) {
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.spring(scaleAnim, {
          toValue: 1,
          friction: 8,
          tension: 100,
          useNativeDriver: true,
        }),
      ]).start();
    } else {
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 0,
          duration: 200,
          useNativeDriver: true,
        }),
        Animated.timing(scaleAnim, {
          toValue: 0.8,
          duration: 200,
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [visible]);

  const renderOffsetForm = () => (
    <ScrollView style={styles.scrollContainer} showsVerticalScrollIndicator={false}>
      <View style={styles.contentContainer}>
        <View style={styles.iconContainer}>
          <Text style={styles.iconText}>⚡</Text>
        </View>

        <Text style={styles.modalTitle}>Offset Energy</Text>
        <Text style={styles.modalSubtitle}>
          Enter the details for your I-RECs offset
        </Text>

        {availableQuantity && (
          <View style={styles.availableContainer}>
            <Text style={styles.availableLabel}>Available Quantity:</Text>
            <Text style={styles.availableAmount}>{availableQuantity} MWh</Text>
          </View>
        )}

        {/* Volume Input */}
        <View style={styles.fieldContainer}>
          <Text style={styles.fieldLabel}>Volume *</Text>
          <View style={styles.inputContainer}>
            <TextInput
              style={[
                styles.input,
                !isValidInput && styles.inputError,
              ]}
              keyboardType="numeric"
              value={value}
              onChangeText={handleInputChange}
              placeholder="0.00"
              placeholderTextColor="#A0A0A0"
            />
            <Text style={styles.inputLabel}>MWh</Text>

            {availableQuantity && (
              <TouchableOpacity
                style={styles.maxButton}
                onPress={setMaxAmount}
                activeOpacity={0.7}>
                <Text style={styles.maxButtonText}>MAX</Text>
              </TouchableOpacity>
            )}
          </View>
          {inputError ? (
            <Text style={styles.errorText}>{inputError}</Text>
          ) : null}
        </View>

        {/* Start Date Input */}
        <View style={styles.fieldContainer}>
          <Text style={styles.fieldLabel}>Start Date *</Text>
          <TextInput
            style={[
              styles.dateInput,
              dateErrors.startDate && styles.inputError,
            ]}
            value={startDate}
            onChangeText={(text) => handleDateChange('startDate', text)}
            placeholder="YYYY-MM-DD"
            placeholderTextColor="#A0A0A0"
          />
          {dateErrors.startDate && (
            <Text style={styles.errorText}>{dateErrors.startDate}</Text>
          )}
        </View>

        {/* End Date Input */}
        <View style={styles.fieldContainer}>
          <Text style={styles.fieldLabel}>End Date *</Text>
          <TextInput
            style={[
              styles.dateInput,
              dateErrors.endDate && styles.inputError,
            ]}
            value={endDate}
            onChangeText={(text) => handleDateChange('endDate', text)}
            placeholder="YYYY-MM-DD"
            placeholderTextColor="#A0A0A0"
          />
          {dateErrors.endDate && (
            <Text style={styles.errorText}>{dateErrors.endDate}</Text>
          )}
        </View>

        {/* Date Range Error */}
        {dateErrors.dateRange && (
          <Text style={styles.errorText}>{dateErrors.dateRange}</Text>
        )}

        {/* Purpose Dropdown */}
        <View style={styles.fieldContainer}>
          <Text style={styles.fieldLabel}>Purpose *</Text>
          <TouchableOpacity
            style={styles.dropdownButton}
            onPress={() => setShowPurposeDropdown(!showPurposeDropdown)}
            activeOpacity={0.8}>
            <Text style={[
              styles.dropdownButtonText,
              !purpose && styles.placeholderText
            ]}>
              {purpose ? PURPOSE_OPTIONS.find(opt => opt.value === purpose)?.label : 'Select purpose'}
            </Text>
            <Text style={styles.dropdownArrow}>
              {showPurposeDropdown ? '▲' : '▼'}
            </Text>
          </TouchableOpacity>

          {showPurposeDropdown && (
            <View style={styles.dropdownContainer}>
              {PURPOSE_OPTIONS.map((option, index) => (
                <TouchableOpacity
                  key={option.value}
                  style={[
                    styles.dropdownOption,
                    index === PURPOSE_OPTIONS.length - 1 && styles.lastDropdownOption
                  ]}
                  onPress={() => handlePurposeSelect(option)}
                  activeOpacity={0.8}>
                  <Text style={styles.dropdownOptionText}>{option.label}</Text>
                </TouchableOpacity>
              ))}
            </View>
          )}
        </View>

        <View style={styles.buttonContainer}>
          {isLoadingOffset ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color="#009D94" />
              <Text style={styles.loadingText}>Processing offset...</Text>
            </View>
          ) : (
            <TouchableOpacity
              style={[
                styles.primaryButton,
                !isFormValid() && styles.disabledButton,
              ]}
              onPress={handleSubmit}
              disabled={!isFormValid()}
              activeOpacity={0.8}>
              <Text style={[
                styles.primaryButtonText,
                !isFormValid() && styles.disabledButtonText,
              ]}>Execute Offset</Text>
            </TouchableOpacity>
          )}

          <TouchableOpacity
            style={styles.secondaryButton}
            onPress={onClose}
            disabled={isLoadingOffset}
            activeOpacity={0.8}>
            <Text style={styles.secondaryButtonText}>Cancel</Text>
          </TouchableOpacity>
        </View>
      </View>
    </ScrollView>
  );

  const renderSuccessView = () => (
    <View style={styles.contentContainer}>
      <View style={[styles.iconContainer, styles.successIconContainer]}>
        <Text style={styles.successIconText}>✓</Text>
      </View>

      <Text style={styles.modalTitle}>Offset Successful!</Text>
      <Text style={styles.modalSubtitle}>
        Your offset has been completed successfully. You can now view or download your certificate.
      </Text>

      <View style={styles.certificateButtonsContainer}>
        <TouchableOpacity
          style={styles.certificateButton}
          onPress={handleViewCertificate}
          activeOpacity={0.8}>
          <Text style={styles.certificateButtonIcon}>👁</Text>
          <Text style={styles.certificateButtonText}>View Certificate</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.certificateButton}
          onPress={handleDownloadCertificate}
          activeOpacity={0.8}>
          <Text style={styles.certificateButtonIcon}>📥</Text>
          <Text style={styles.certificateButtonText}>Download</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.certificateButton}
          onPress={handleExplorer}
          activeOpacity={0.8}>
          <Text style={styles.certificateButtonIcon}>🔍</Text>
          <Text style={styles.certificateButtonText}>View on Explorer</Text>
        </TouchableOpacity>
      </View>

      <TouchableOpacity
        style={styles.primaryButton}
        onPress={onClose}
        activeOpacity={0.8}>
        <Text style={styles.primaryButtonText}>Done</Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType="none"
      onRequestClose={onClose}>
      <Animated.View
        style={[
          styles.modalOverlay,
          {
            opacity: fadeAnim,
          },
        ]}>
        <Animated.View
          style={[
            styles.modalContent,
            {
              transform: [{ scale: scaleAnim }],
            },
          ]}>
          {offsetSuccess || redemptionUrl ? renderSuccessView() : renderOffsetForm()}
        </Animated.View>
      </Animated.View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    paddingHorizontal: 20,
  },
  modalContent: {
    width: '100%',
    maxWidth: 400,
    maxHeight: '90%',
    backgroundColor: '#fff',
    borderRadius: 24,
    overflow: 'hidden',
    elevation: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.3,
    shadowRadius: 20,
  },
  scrollContainer: {
    maxHeight: 600,
  },
  contentContainer: {
    padding: 30,
    alignItems: 'center',
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
  modalTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#1A1A1A',
    marginBottom: 8,
    fontFamily: fontsFamily.MulishExtraBold,
    textAlign: 'center',
  },
  modalSubtitle: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 30,
    fontFamily: fontsFamily.Mulish,
  },
  availableContainer: {
    width: '100%',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#F0FBF9',
    padding: 16,
    borderRadius: 12,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#B8E6E1',
  },
  availableLabel: {
    fontSize: 14,
    color: '#666',
    fontFamily: fontsFamily.Mulish,
  },
  availableAmount: {
    fontSize: 16,
    color: '#009D94',
    fontFamily: fontsFamily.MulishBold,
  },
  fieldContainer: {
    width: '100%',
    marginBottom: 20,
  },
  fieldLabel: {
    fontSize: 14,
    color: '#1A1A1A',
    fontFamily: fontsFamily.MulishBold,
    marginBottom: 8,
  },
  inputContainer: {
    width: '100%',
    position: 'relative',
  },
  input: {
    width: '100%',
    height: 60,
    paddingHorizontal: 20,
    paddingRight: 100,
    borderColor: '#E0E0E0',
    borderWidth: 2,
    borderRadius: 16,
    fontSize: 18,
    backgroundColor: '#FAFAFA',
    color: '#1A1A1A',
    fontFamily: fontsFamily.MulishBold,
    textAlign: 'center',
  },
  dateInput: {
    width: '100%',
    height: 60,
    paddingHorizontal: 20,
    borderColor: '#E0E0E0',
    borderWidth: 2,
    borderRadius: 16,
    fontSize: 16,
    backgroundColor: '#FAFAFA',
    color: '#1A1A1A',
    fontFamily: fontsFamily.Mulish,
  },
  inputError: {
    borderColor: '#FF6B6B',
    backgroundColor: '#FFF5F5',
  },
  inputLabel: {
    position: 'absolute',
    right: 80,
    top: 18,
    fontSize: 16,
    color: '#009D94',
    fontFamily: fontsFamily.MulishBold,
  },
  maxButton: {
    position: 'absolute',
    right: 12,
    top: 12,
    backgroundColor: '#009D94',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
  },
  maxButtonText: {
    color: '#fff',
    fontSize: 12,
    fontFamily: fontsFamily.MulishBold,
  },
  dropdownButton: {
    width: '100%',
    height: 60,
    paddingHorizontal: 20,
    borderColor: '#E0E0E0',
    borderWidth: 2,
    borderRadius: 16,
    backgroundColor: '#FAFAFA',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  dropdownButtonText: {
    fontSize: 16,
    color: '#1A1A1A',
    fontFamily: fontsFamily.Mulish,
  },
  placeholderText: {
    color: '#A0A0A0',
  },
  dropdownArrow: {
    fontSize: 14,
    color: '#009D94',
    fontFamily: fontsFamily.MulishBold,
  },
  dropdownContainer: {
    marginTop: 4,
    backgroundColor: '#fff',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E0E0E0',
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  dropdownOption: {
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  lastDropdownOption: {
    borderBottomWidth: 0,
  },
  dropdownOptionText: {
    fontSize: 16,
    color: '#1A1A1A',
    fontFamily: fontsFamily.Mulish,
  },
  errorText: {
    color: '#FF6B6B',
    fontSize: 14,
    fontFamily: fontsFamily.Mulish,
    textAlign: 'left',
    marginTop: 6,
  },
  disabledButton: {
    backgroundColor: '#C0C0C0',
    shadowOpacity: 0,
    elevation: 0,
  },
  disabledButtonText: {
    color: '#888',
  },
  buttonContainer: {
    width: '100%',
    gap: 12,
    marginTop: 10,
  },
  primaryButton: {
    width: '100%',
    height: 56,
    borderRadius: 16,
    backgroundColor: '#009D94',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#009D94',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  primaryButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
    fontFamily: fontsFamily.MulishBold,
  },
  secondaryButton: {
    width: '100%',
    height: 56,
    borderRadius: 16,
    backgroundColor: 'transparent',
    borderWidth: 2,
    borderColor: '#E0E0E0',
    justifyContent: 'center',
    alignItems: 'center',
  },
  secondaryButtonText: {
    color: '#666',
    fontSize: 16,
    fontWeight: '600',
    fontFamily: fontsFamily.MulishBold,
  },
  loadingContainer: {
    alignItems: 'center',
    paddingVertical: 20,
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: '#666',
    fontFamily: fontsFamily.Mulish,
  },
  certificateButtonsContainer: {
    width: '100%',
    gap: 12,
    marginBottom: 24,
  },
  certificateButton: {
    width: '100%',
    height: 60,
    borderRadius: 16,
    backgroundColor: '#F8FFFE',
    borderWidth: 1,
    borderColor: '#009D94',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
  },
  certificateButtonIcon: {
    fontSize: 20,
  },
  certificateButtonText: {
    color: '#009D94',
    fontSize: 16,
    fontWeight: '600',
    fontFamily: fontsFamily.MulishBold,
  },
});