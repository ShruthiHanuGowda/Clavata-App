import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  Modal,
  ActivityIndicator,
  ScrollView,
  Dimensions,
} from 'react-native';
import {fontsFamily} from '../../Theme';
import {marketIcons} from '../../Theme/variable';

const {height: screenHeight} = Dimensions.get('window');

interface SwapConfirmationModalProps {
  visible: boolean;
  onClose: () => void;
  onConfirm: () => void;
  fromToken: string;
  toToken: string;
  fromAmount: string;
  toAmount: string;
  slippage: number;
  networkFee: number;
  priceImpact: number;
  exchangeRate: string;
  isLoading?: boolean;
}

export const SwapConfirmationModal: React.FC<SwapConfirmationModalProps> = ({
  visible,
  onClose,
  onConfirm,
  fromToken,
  toToken,
  fromAmount,
  toAmount,
  slippage,
  networkFee,
  priceImpact,
  exchangeRate,
  isLoading = false,
}) => {
  const minimumReceived = (parseFloat(toAmount) * (1 - slippage / 100)).toFixed(
    6,
  );
  const maxSlippage = parseFloat(fromAmount) * (slippage / 100);

  const getPriceImpactStyle = () => {
    if (priceImpact > 3) return styles.priceImpactHigh;
    if (priceImpact > 1) return styles.priceImpactMedium;
    return styles.priceImpactLow;
  };

  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType="slide"
      onRequestClose={onClose}>
      <View style={styles.overlay}>
        <View style={styles.modalContainer}>
          {/* Header - Fixed at top */}
          <View style={styles.header}>
            <Text style={styles.title}>Confirm Swap</Text>
            <TouchableOpacity onPress={onClose} style={styles.closeButton}>
              <Text style={styles.closeText}>✕</Text>
            </TouchableOpacity>
          </View>

          {/* Scrollable Content with calculated height */}
          <ScrollView
            style={styles.scrollContent}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.scrollContentContainer}>
            {/* Swap Visual */}
            <View style={styles.swapVisual}>
              {/* From Token */}
              <View style={styles.tokenContainer}>
                <View style={styles.tokenInfo}>
                  <Image
                    source={marketIcons[fromToken]}
                    style={styles.tokenIcon}
                    resizeMode="contain"
                  />
                  <View style={styles.tokenDetails}>
                    <Text style={styles.tokenAmount}>{fromAmount}</Text>
                    <Text style={styles.tokenSymbol}>{fromToken}</Text>
                  </View>
                </View>
                <View style={styles.tokenBadge}>
                  <Text style={styles.badgeText}>FROM</Text>
                </View>
              </View>

              {/* Arrow */}
              <View style={styles.arrowContainer}>
                <View style={styles.arrowCircle}>
                  <Text style={styles.arrowIcon}>↓</Text>
                </View>
              </View>

              {/* To Token */}
              <View style={styles.tokenContainer}>
                <View style={styles.tokenInfo}>
                  <Image
                    source={marketIcons[toToken]}
                    style={styles.tokenIcon}
                    resizeMode="contain"
                  />
                  <View style={styles.tokenDetails}>
                    <Text style={styles.tokenAmount}>{toAmount}</Text>
                    <Text style={styles.tokenSymbol}>{toToken}</Text>
                  </View>
                </View>
                <View style={[styles.tokenBadge, styles.tokenBadgeTo]}>
                  <Text style={styles.badgeText}>TO</Text>
                </View>
              </View>
            </View>

            {/* Exchange Rate */}
            <View style={styles.rateContainer}>
              <Text style={styles.rateLabel}>Exchange Rate</Text>
              <Text style={styles.rateText}>{exchangeRate}</Text>
            </View>

            {/* Transaction Details */}
            <View style={styles.detailsContainer}>
              <Text style={styles.detailsTitle}>Transaction Details</Text>

              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>Price Impact</Text>
                <View style={styles.detailValueContainer}>
                  <Text
                    style={[
                      styles.detailValue,
                      getPriceImpactStyle(),
                    ]}>
                    {priceImpact.toFixed(2)}%
                  </Text>
                  {priceImpact > 3 && (
                    <Text style={styles.warningIcon}>⚠️</Text>
                  )}
                </View>
              </View>

              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>Slippage Tolerance</Text>
                <Text style={styles.detailValue}>{slippage}%</Text>
              </View>

              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>Network Fee</Text>
                <Text style={styles.detailValue}>~{networkFee} WATT</Text>
              </View>

              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>Maximum Slippage</Text>
                <Text style={styles.detailValue}>
                  {maxSlippage.toFixed(6)} {fromToken}
                </Text>
              </View>

              <View style={[styles.detailRow, styles.highlightedRow]}>
                <Text style={styles.detailLabelBold}>Minimum Received</Text>
                <Text style={styles.detailValueBold}>
                  {minimumReceived} {toToken}
                </Text>
              </View>
            </View>

            {/* Route Information */}
            <View style={styles.routeContainer}>
              <Text style={styles.routeTitle}>Swap Route</Text>
              <View style={styles.routeFlow}>
                <View style={styles.routeToken}>
                  <Image
                    source={marketIcons[fromToken]}
                    style={styles.routeTokenIcon}
                  />
                  <Text style={styles.routeTokenText}>{fromToken}</Text>
                </View>
                <View style={styles.routeArrow}>
                  <Text style={styles.routeArrowText}>→</Text>
                </View>
                <View style={styles.routeToken}>
                  <Image
                    source={marketIcons[toToken]}
                    style={styles.routeTokenIcon}
                  />
                  <Text style={styles.routeTokenText}>{toToken}</Text>
                </View>
              </View>
            </View>

            {/* Warnings */}
            {priceImpact > 3 && (
              <View style={styles.warningContainer}>
                <Text style={styles.warningIconLarge}>⚠️</Text>
                <View style={styles.warningContent}>
                  <Text style={styles.warningTitle}>High Price Impact!</Text>
                  <Text style={styles.warningText}>
                    This swap has a price impact of {priceImpact.toFixed(2)}%.
                    You may receive significantly less due to low liquidity.
                    Consider reducing your swap amount.
                  </Text>
                </View>
              </View>
            )}

            {slippage > 2 && (
              <View style={styles.infoContainer}>
                <Text style={styles.infoIcon}>ℹ️</Text>
                <View style={styles.infoContent}>
                  <Text style={styles.infoTitle}>High Slippage Tolerance</Text>
                  <Text style={styles.infoText}>
                    Your slippage tolerance is set to {slippage}%. This may
                    result in an unfavorable rate. Consider lowering it if the
                    market isn't moving rapidly.
                  </Text>
                </View>
              </View>
            )}

            {/* Terms */}
            <Text style={styles.termsText}>
              By confirming, you agree that this swap cannot be reversed and you
              understand the risks involved with DeFi trading.
            </Text>

            {/* Extra padding to ensure content is scrollable above buttons */}
            <View style={styles.bottomSpacer} />
          </ScrollView>

          {/* Fixed Action Buttons at bottom - ALWAYS VISIBLE */}
          <View style={styles.fixedButtonContainer}>
            <View style={styles.buttonContainer}>
              <TouchableOpacity
                style={styles.cancelButton}
                onPress={onClose}
                disabled={isLoading}>
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[
                  styles.confirmButton,
                  isLoading && styles.confirmButtonLoading,
                ]}
                onPress={onConfirm}
                disabled={isLoading}>
                {isLoading ? (
                  <ActivityIndicator color="#fff" size="small" />
                ) : (
                  <Text style={styles.confirmButtonText}>Confirm Swap</Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    justifyContent: 'flex-end',
  },
  modalContainer: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    height: screenHeight * 0.9, // Fixed height
    flexDirection: 'column',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  scrollContent: {
    flex: 1, // Takes remaining space
  },
  scrollContentContainer: {
    padding: 20,
    paddingTop: 8,
  },
  bottomSpacer: {
    height: 20, // Extra space at bottom for scrolling
  },
  fixedButtonContainer: {
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderTopColor: '#F0F0F0',
    paddingBottom: 34, // Extra padding for Android navigation
  },
  buttonContainer: {
    flexDirection: 'row',
    gap: 12,
    padding: 20,
    paddingBottom: 20,
  },
  title: {
    fontSize: 20,
    fontFamily: fontsFamily.MulishBold,
    color: '#000',
  },
  closeButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#F5F5F5',
    justifyContent: 'center',
    alignItems: 'center',
  },
  closeText: {
    fontSize: 16,
    color: '#666',
    fontWeight: 'bold',
  },
  swapVisual: {
    alignItems: 'center',
    marginBottom: 20,
  },
  tokenContainer: {
    width: '100%',
    backgroundColor: '#F8F9FA',
    borderRadius: 16,
    padding: 20,
    marginVertical: 8,
    borderWidth: 1,
    borderColor: '#E8E8E8',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  tokenInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  tokenIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    marginRight: 12,
  },
  tokenDetails: {
    flex: 1,
  },
  tokenAmount: {
    fontSize: 18,
    fontFamily: fontsFamily.MulishBold,
    color: '#000',
  },
  tokenSymbol: {
    fontSize: 14,
    fontFamily: fontsFamily.Mulish,
    color: '#666',
    marginTop: 2,
  },
  tokenBadge: {
    backgroundColor: '#81c8c3',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  tokenBadgeTo: {
    backgroundColor: '#34C759',
  },
  badgeText: {
    color: '#fff',
    fontSize: 10,
    fontFamily: fontsFamily.MulishBold,
  },
  arrowContainer: {
    alignItems: 'center',
    marginVertical: 8,
  },
  arrowCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#81c8c3',
    justifyContent: 'center',
    alignItems: 'center',
  },
  arrowIcon: {
    fontSize: 20,
    color: '#fff',
    fontWeight: 'bold',
  },
  rateContainer: {
    backgroundColor: '#E8F5E8',
    borderRadius: 12,
    padding: 16,
    marginBottom: 20,
    alignItems: 'center',
  },
  rateLabel: {
    fontSize: 12,
    fontFamily: fontsFamily.Mulish,
    color: '#666',
    marginBottom: 4,
  },
  rateText: {
    fontSize: 16,
    fontFamily: fontsFamily.MulishBold,
    color: '#1A1A1A',
    textAlign: 'center',
  },
  detailsContainer: {
    marginBottom: 20,
  },
  detailsTitle: {
    fontSize: 16,
    fontFamily: fontsFamily.MulishBold,
    color: '#000',
    marginBottom: 16,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
    paddingVertical: 4,
  },
  highlightedRow: {
    backgroundColor: '#F8F9FA',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    marginTop: 8,
  },
  detailLabel: {
    fontSize: 14,
    fontFamily: fontsFamily.Mulish,
    color: '#666',
  },
  detailLabelBold: {
    fontSize: 14,
    fontFamily: fontsFamily.MulishBold,
    color: '#000',
  },
  detailValueContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  detailValue: {
    fontSize: 14,
    fontFamily: fontsFamily.MulishBold,
    color: '#000',
  },
  detailValueBold: {
    fontSize: 16,
    fontFamily: fontsFamily.MulishBold,
    color: '#000',
  },
  warningIcon: {
    fontSize: 12,
    marginLeft: 4,
  },
  routeContainer: {
    backgroundColor: '#F8F9FA',
    borderRadius: 12,
    padding: 16,
    marginBottom: 20,
  },
  routeTitle: {
    fontSize: 14,
    fontFamily: fontsFamily.MulishBold,
    color: '#000',
    marginBottom: 12,
    textAlign: 'center',
  },
  routeFlow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  routeToken: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 1},
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 1,
  },
  routeTokenIcon: {
    width: 20,
    height: 20,
    borderRadius: 10,
    marginRight: 6,
  },
  routeTokenText: {
    fontSize: 12,
    fontFamily: fontsFamily.MulishBold,
    color: '#000',
  },
  routeArrow: {
    marginHorizontal: 12,
  },
  routeArrowText: {
    fontSize: 16,
    color: '#81c8c3',
    fontWeight: 'bold',
  },
  warningContainer: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: '#FFF3CD',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    borderLeftWidth: 4,
    borderLeftColor: '#FF9500',
  },
  warningIconLarge: {
    fontSize: 20,
    marginRight: 12,
    marginTop: 2,
  },
  warningContent: {
    flex: 1,
  },
  warningTitle: {
    fontSize: 14,
    fontFamily: fontsFamily.MulishBold,
    color: '#856404',
    marginBottom: 4,
  },
  warningText: {
    fontSize: 12,
    fontFamily: fontsFamily.Mulish,
    color: '#856404',
    lineHeight: 16,
  },
  infoContainer: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: '#E3F2FD',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    borderLeftWidth: 4,
    borderLeftColor: '#2196F3',
  },
  infoIcon: {
    fontSize: 20,
    marginRight: 12,
    marginTop: 2,
  },
  infoContent: {
    flex: 1,
  },
  infoTitle: {
    fontSize: 14,
    fontFamily: fontsFamily.MulishBold,
    color: '#1565C0',
    marginBottom: 4,
  },
  infoText: {
    fontSize: 12,
    fontFamily: fontsFamily.Mulish,
    color: '#1565C0',
    lineHeight: 16,
  },
  cancelButton: {
    flex: 1,
    backgroundColor: '#F5F5F5',
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
  },
  cancelButtonText: {
    fontSize: 16,
    fontFamily: fontsFamily.MulishBold,
    color: '#666',
  },
  confirmButton: {
    flex: 1,
    backgroundColor: '#81c8c3',
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
  },
  confirmButtonText: {
    fontSize: 16,
    fontFamily: fontsFamily.MulishBold,
    color: '#fff',
  },
  termsText: {
    fontSize: 11,
    fontFamily: fontsFamily.Mulish,
    color: '#999',
    textAlign: 'center',
    lineHeight: 16,
    paddingHorizontal: 8,
    marginTop: 16,
  },
  priceImpactHigh: {
    color: '#FF3B30',
  },
  priceImpactMedium: {
    color: '#FF9500',
  },
  priceImpactLow: {
    color: '#34C759',
  },
  confirmButtonLoading: {
    opacity: 0.7,
  },
});
