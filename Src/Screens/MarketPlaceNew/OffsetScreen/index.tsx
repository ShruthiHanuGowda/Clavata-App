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
    Share,
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

const PURPOSE_OPTIONS = [
    { label: 'Scope 2 Emissions', value: 'scope_2_emissions' },
    { label: 'Scope 3 Emissions', value: 'scope_3_emissions' },
];

const TAX_RATE_PER_MWH = 0.1;

const OffsetScreen = ({ route }) => {
    const { nft } = route.params;
    const { userDetails } = useAuth();
    const { magic_denergy } = useMagic();
    const [volume, setVolume] = useState('');
    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');
    const [purpose, setPurpose] = useState('');
    const [showPurposeDropdown, setShowPurposeDropdown] = useState(false);
    const [inputError, setInputError] = useState('');
    const [dateErrors, setDateErrors] = useState<any>({});
    const [currentStep, setCurrentStep] = useState('form');
    const [currentQuantity, setCurrentQuantity] = useState(
        nft?.marketData?.quantity,
    );
    const [calculatedTax, setCalculatedTax] = useState(0);

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

    const handleInputChange = text => {
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

    const handleDateChange = (field, text) => {
        const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
        let newErrors = { ...dateErrors };

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

        if (
            field === 'startDate' &&
            endDate &&
            dateRegex.test(text) &&
            dateRegex.test(endDate)
        ) {
            const start = new Date(text);
            const end = new Date(endDate);
            if (start >= end) {
                newErrors.dateRange = 'End date must be after start date';
            } else {
                delete newErrors.dateRange;
            }
        } else if (
            field === 'endDate' &&
            startDate &&
            dateRegex.test(startDate) &&
            dateRegex.test(text)
        ) {
            const start = new Date(startDate);
            const end = new Date(text);
            if (start >= end) {
                newErrors.dateRange = 'End date must be after start date';
            } else {
                delete newErrors.dateRange;
            }
        }

        setDateErrors(newErrors);
    };

    const handlePurposeSelect = selectedPurpose => {
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
        const hasStartDate = startDate && startDate.trim() !== '';
        const hasEndDate = endDate && endDate.trim() !== '';
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

            const shareUrl = Platform.OS === 'ios' ? filePath : `file://${filePath}`;
            Share.share({
                message: 'Here is your certificate:',
                url: shareUrl,
                title: 'Certificate Download Complete',
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
                <View style={styles.taxHeader}>
                    <DText fontStyle="fontBold" style={styles.taxTitle}>
                        Transaction Fee
                    </DText>
                </View>

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
        <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
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
                <View style={styles.fieldContainer}>
                    <DText fontStyle="fontBold" style={styles.fieldLabel}>
                        Volume *
                    </DText>
                    <View style={styles.inputContainer}>
                        <TextInput
                            style={[styles.input, inputError && styles.inputError]}
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
                        <DText style={styles.errorText}>{inputError}</DText>
                    ) : null}
                </View>

                {/* Tax Calculation */}
                {renderTaxCalculation()}

                {/* Start Date Input */}
                <View style={styles.fieldContainer}>
                    <DText fontStyle="fontBold" style={styles.fieldLabel}>
                        Start Date *
                    </DText>
                    <TextInput
                        style={[
                            styles.dateInput,
                            dateErrors.startDate && styles.inputError,
                        ]}
                        value={startDate}
                        onChangeText={text => handleDateChange('startDate', text)}
                        placeholder="YYYY-MM-DD"
                        placeholderTextColor="#A0A0A0"
                    />
                    {dateErrors.startDate && (
                        <DText style={styles.errorText}>{dateErrors.startDate}</DText>
                    )}
                </View>

                {/* End Date Input */}
                <View style={styles.fieldContainer}>
                    <DText fontStyle="fontBold" style={styles.fieldLabel}>
                        End Date *
                    </DText>
                    <TextInput
                        style={[styles.dateInput, dateErrors.endDate && styles.inputError]}
                        value={endDate}
                        onChangeText={text => handleDateChange('endDate', text)}
                        placeholder="YYYY-MM-DD"
                        placeholderTextColor="#A0A0A0"
                    />
                    {dateErrors.endDate && (
                        <DText style={styles.errorText}>{dateErrors.endDate}</DText>
                    )}
                </View>

                {/* Date Range Error */}
                {dateErrors.dateRange && (
                    <DText style={styles.errorText}>{dateErrors.dateRange}</DText>
                )}

                {/* Purpose Dropdown */}
                <View style={styles.fieldContainer}>
                    <DText fontStyle="fontBold" style={styles.fieldLabel}>
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

            <View style={styles.buttonContainer}>
                <TouchableOpacity
                    style={[
                        styles.primaryButton,
                        !isFormValid() && styles.disabledButton,
                    ]}
                    onPress={handleSubmit}
                    disabled={!isFormValid()}
                    activeOpacity={0.8}>
                    <DText
                        fontStyle="fontBold"
                        style={[
                            styles.primaryButtonText,
                            !isFormValid() && styles.disabledButtonText,
                        ]}>
                        Execute Offset
                    </DText>
                </TouchableOpacity>
            </View>
        </ScrollView>
    );

    const renderProcessing = () => (
        <View style={styles.centerContainer}>
            <View style={styles.processingContainer}>
                <ActivityIndicator size="large" color="#009D94" />
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
                        {startDate} to {endDate}
                    </DText>
                </View>
                <View style={styles.successDetailRow}>
                    <DText style={styles.successDetailLabel}>Purpose:</DText>
                    <DText fontStyle="fontBold" style={styles.successDetailValue}>
                        {PURPOSE_OPTIONS.find(opt => opt.value === purpose)?.label}
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

            <View style={styles.buttonContainer}>
                <TouchableOpacity
                    style={styles.primaryButton}
                    onPress={() => navigateBack()}
                    activeOpacity={0.8}>
                    <DText fontStyle="fontBold" style={styles.primaryButtonText}>
                        Done
                    </DText>
                </TouchableOpacity>
            </View>
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
        paddingHorizontal: 20,
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
        borderRadius: 12,
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
        color: '#009D94',
    },
    formContainer: {
        flex: 1,
    },
    fieldContainer: {
        marginBottom: 20,
    },
    fieldLabel: {
        fontSize: 14,
        color: '#1A1A1A',
        marginBottom: 8,
    },
    inputContainer: {
        position: 'relative',
    },
    input: {
        height: 60,
        paddingHorizontal: 20,
        paddingRight: 100,
        borderColor: '#E0E0E0',
        borderWidth: 2,
        borderRadius: 16,
        fontSize: 18,
        backgroundColor: '#FAFAFA',
        color: '#1A1A1A',
        textAlign: 'center',
        fontFamily: fontsFamily.MulishBold,
    },
    dateInput: {
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
    },
    dropdownButton: {
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
    },
    // Tax Calculation Styles
    taxContainer: {
        backgroundColor: '#FFF8E1',
        padding: 16,
        borderRadius: 12,
        marginBottom: 20,
        borderWidth: 1,
        borderColor: '#FFE082',
    },
    taxHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 12,
    },
    taxTitle: {
        fontSize: 16,
        color: '#E65100',
    },
    infoIcon: {
        fontSize: 16,
        color: '#FF9800',
    },
    taxCalculationRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 8,
    },
    taxLabel: {
        fontSize: 14,
        color: '#BF360C',
    },
    taxValue: {
        fontSize: 14,
        color: '#BF360C',
    },
    taxTotalRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 8,
        paddingTop: 8,
        borderTopWidth: 1,
        borderTopColor: '#FFE082',
    },
    taxTotalLabel: {
        fontSize: 16,
        color: '#E65100',
    },
    taxTotalValue: {
        fontSize: 16,
        color: '#E65100',
    },
    taxNote: {
        fontSize: 12,
        color: '#8D6E63',
        fontStyle: 'italic',
        textAlign: 'center',
    },
    errorText: {
        color: '#FF6B6B',
        fontSize: 14,
        textAlign: 'left',
        marginTop: 6,
    },
    buttonContainer: {
        paddingVertical: 20,
        paddingBottom: 40,
    },
    primaryButton: {
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
    },
    disabledButton: {
        backgroundColor: '#C0C0C0',
        shadowOpacity: 0,
        elevation: 0,
    },
    disabledButtonText: {
        color: '#888',
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
        color: '#E65100',
        marginTop: 8,
        textAlign: 'center',
        fontWeight: 'bold',
    },
    successDetailsContainer: {
        backgroundColor: '#F0FBF9',
        padding: 20,
        borderRadius: 12,
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
        color: '#009D94',
        flex: 1,
        textAlign: 'right',
    },
    certificateButtonsContainer: {
        gap: 12,
        marginBottom: 30,
    },
    certificateButton: {
        height: 60,
        borderRadius: 16,
        backgroundColor: '#F8FFFE',
        borderWidth: 1.5,
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
    },
});

export default OffsetScreen;
